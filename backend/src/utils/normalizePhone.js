export function normalizePhone(phone) {
  return `${phone || ''}`.replace(/[^\d+]/g, '').trim();
}
