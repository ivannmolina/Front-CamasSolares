// ——— Dinero  ———
export const fmtMoney = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

// ——— Fecha de hoy en ISO  ———
export const todayISO = () => new Date().toISOString().slice(0, 10)

// ——— WhatsApp helpers (nuevo) ———
// El usuario ingresa el número completo (con país y característica).
// Removemos símbolos, espacios y '+'; validamos rango razonable 8–15 dígitos.
export function phoneToWaNumber(raw?: string | null): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D+/g, '')
  if (digits.length < 8 || digits.length > 15) return null
  return digits
}

export function waLink(raw?: string | null): string | null {
  const n = phoneToWaNumber(raw)
  return n ? `https://wa.me/${n}` : null
}