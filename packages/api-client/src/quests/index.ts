import type { Quest, QuestProgress, QuestWithProgress, UserBadge, UserCheckin } from "@repo/types";
import { supabase } from "../client";

// ---- Get all active quests ----
export async function getActiveQuests(): Promise<{ data: Quest[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error };
  return { data: data as Quest[], error: null };
}

// ---- Check-in result + failure reasons ----
export interface CheckinResult {
  checkin_id: string;
  points_earned: number;
  distance_m: number;
}

export type CheckinErrorCode =
  | "NOT_AUTHENTICATED"
  | "SHOP_NOT_FOUND"
  | "TOO_FAR"
  | "ALREADY_CHECKED_IN_TODAY"
  | "UNKNOWN";

export class CheckinError extends Error {
  readonly code: CheckinErrorCode;
  /** Present only for TOO_FAR — how far the user actually was, in metres. */
  readonly distanceM?: number;

  constructor(code: CheckinErrorCode, message: string, distanceM?: number) {
    super(message);
    this.name = "CheckinError";
    this.code = code;
    this.distanceM = distanceM;
  }
}

/**
 * The RPC signals failures by raising, so Postgres hands them back as an opaque
 * message string. Translate them into codes the UI can localise.
 */
function toCheckinError(message: string): CheckinError {
  if (message.includes("SHOP_NOT_FOUND")) {
    return new CheckinError("SHOP_NOT_FOUND", message);
  }
  if (message.includes("ALREADY_CHECKED_IN_TODAY")) {
    return new CheckinError("ALREADY_CHECKED_IN_TODAY", message);
  }
  if (message.includes("TOO_FAR")) {
    const match = /(\d+(?:\.\d+)?)m away/.exec(message);
    const distance = match?.[1] ? Number(match[1]) : undefined;
    return new CheckinError("TOO_FAR", message, distance);
  }
  return new CheckinError("UNKNOWN", message);
}

// ---- Check in at a shop (QR scan). Server enforces the 50m GPS radius. ----
export async function checkInAtShop(
  shopId: string,
  userLat: number,
  userLng: number
): Promise<{ data: CheckinResult | null; error: CheckinError | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new CheckinError("NOT_AUTHENTICATED", "Not authenticated") };
  }

  const { data, error } = await supabase.rpc("checkin_at_shop", {
    p_shop_id: shopId,
    p_user_id: user.id,
    p_lat: userLat,
    p_lng: userLng,
  });

  if (error) return { data: null, error: toCheckinError(error.message) };
  return { data: data as CheckinResult, error: null };
}

// ---- Get user's check-in history ----
export async function getMyCheckins(): Promise<{ data: UserCheckin[] | null; error: Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("user_checkins")
    .select("*, shop:shops(id, name, image_url)")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: false });

  if (error) return { data: null, error };
  return { data: data as UserCheckin[], error: null };
}

// ---- Get user's earned badges ----
export async function getMyBadges(): Promise<{ data: UserBadge[] | null; error: Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("user_badges")
    .select("*, quest:quests(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  if (error) return { data: null, error };
  return { data: data as UserBadge[], error: null };
}

// ---- Active quests joined with the caller's progress (single round-trip) ----
export async function getQuestsWithProgress(): Promise<{
  data: QuestWithProgress[] | null;
  error: Error | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quests, error: questsError } = await getActiveQuests();
  if (questsError || !quests) return { data: null, error: questsError };

  // Signed-out visitors still see the quest list, just with empty progress.
  const emptyProgress = (quest: Quest): QuestProgress => ({
    quest_id: quest.id,
    required_count: quest.required_shop_ids.length,
    completed_count: 0,
    visited_shop_ids: [],
    is_completed: false,
  });

  if (!user) {
    return { data: quests.map((q) => ({ ...q, progress: emptyProgress(q) })), error: null };
  }

  const { data: progress, error: progressError } = await supabase.rpc("get_quest_progress", {
    p_user_id: user.id,
  });

  if (progressError) return { data: null, error: progressError };

  const byQuest = new Map<string, QuestProgress>(
    ((progress ?? []) as QuestProgress[]).map((p) => [p.quest_id, p])
  );

  return {
    data: quests.map((q) => ({ ...q, progress: byQuest.get(q.id) ?? emptyProgress(q) })),
    error: null,
  };
}

// ---- Admin: quest CRUD (service-role only per RLS) ----
export type CreateQuestInput = Omit<Quest, "id" | "created_at">;
export type UpdateQuestInput = Partial<CreateQuestInput>;

export async function createQuest(
  input: CreateQuestInput
): Promise<{ data: Quest | null; error: Error | null }> {
  const { data, error } = await supabase.from("quests").insert(input).select("*").single();
  if (error) return { data: null, error };
  return { data: data as Quest, error: null };
}

export async function updateQuest(
  id: string,
  input: UpdateQuestInput
): Promise<{ data: Quest | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("quests")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error };
  return { data: data as Quest, error: null };
}

export async function deleteQuest(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("quests").delete().eq("id", id);
  return { error: error ?? null };
}
