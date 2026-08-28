const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Shop QR codes may be printed in a few shapes depending on who generated them:
 *   - the bare shop UUID
 *   - a deep link, `longvonghp://checkin/<uuid>`
 *   - a web link, `https://longvonghp.vn/checkin/<uuid>`
 *   - a JSON payload, `{"shop_id":"<uuid>"}`
 * Accept all of them and return the shop id, or null when nothing matches.
 */
export function parseShopQr(raw: string): string | null {
  const value = raw.trim();
  if (value === '') return null;

  if (value.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        const shopId = (parsed as Record<string, unknown>).shop_id;
        if (typeof shopId === 'string') {
          return UUID_RE.exec(shopId)?.[0] ?? null;
        }
      }
    } catch {
      // Not JSON after all — fall through to the URL/UUID handling below.
    }
  }

  return UUID_RE.exec(value)?.[0] ?? null;
}
