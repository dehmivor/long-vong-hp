import type { Shop, ShopFilter, PaginatedResult } from "@repo/types";
import { supabase } from "../client";

// ---- Get paginated shops with filters ----
export async function getShops(
  filter: ShopFilter = {}
): Promise<{ data: PaginatedResult<Shop> | null; error: Error | null }> {
  const {
    district,
    category_id,
    price_range,
    status,
    is_local_pick,
    is_verified,
    search,
    page = 1,
    per_page = 20,
  } = filter;

  let query = supabase
    .from("shops")
    .select("*, category:categories(*)", { count: "exact" })
    .order("is_local_pick", { ascending: false })
    .order("rating_avg", { ascending: false });

  if (district) query = query.eq("district", district);
  if (category_id) query = query.eq("category_id", category_id);
  if (price_range) query = query.eq("price_range", price_range);
  if (status) query = query.eq("status", status);
  if (is_local_pick !== undefined) query = query.eq("is_local_pick", is_local_pick);
  if (is_verified !== undefined) query = query.eq("is_verified", is_verified);
  if (search) query = query.ilike("name", `%${search}%`);

  const from = (page - 1) * per_page;
  const to = from + per_page - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return { data: null, error };

  return {
    data: {
      data: data as Shop[],
      total: count ?? 0,
      page,
      per_page,
      has_next: (count ?? 0) > page * per_page,
    },
    error: null,
  };
}

// ---- Get single shop by ID ----
export async function getShopById(
  id: string
): Promise<{ data: Shop | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("shops")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (error) return { data: null, error };
  return { data: data as Shop, error: null };
}

// ---- Get shops near a coordinate ----
export async function getNearbyShops(
  lat: number,
  lng: number,
  radius_km: number = 2
): Promise<{ data: Shop[] | null; error: Error | null }> {
  // Uses Supabase PostGIS RPC function defined in schema
  const { data, error } = await supabase.rpc("get_nearby_shops", {
    lat,
    lng,
    radius_km,
  });

  if (error) return { data: null, error };
  return { data: data as Shop[], error: null };
}

// ---- Get local pick shops (featured) ----
export async function getLocalPickShops(
  limit: number = 10
): Promise<{ data: Shop[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("shops")
    .select("*, category:categories(*)")
    .eq("is_local_pick", true)
    .eq("is_verified", true)
    .neq("status", "closed")
    .order("rating_avg", { ascending: false })
    .limit(limit);

  if (error) return { data: null, error };
  return { data: data as Shop[], error: null };
}

// ---- Search shops (for search bar) ----
export async function searchShops(
  query: string,
  limit: number = 10
): Promise<{ data: Shop[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("shops")
    .select("id, name, address, district, image_url, category_id, rating_avg, status, is_local_pick")
    .or(`name.ilike.%${query}%, address.ilike.%${query}%`)
    .limit(limit);

  if (error) return { data: null, error };
  return { data: data as Shop[], error: null };
}
