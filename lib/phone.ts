export function digitsOnly(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/** Remove símbolos e, se tiver, o código do país (55). */
export function normalizeBrazilPhone(value: string | null | undefined): string {
  let digits = digitsOnly(value);
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }
  return digits;
}

/** Ex.: (31) 99436-9932 ou (86) 99520-9564 */
export function formatBrazilPhone(value: string | null | undefined): string {
  const digits = normalizeBrazilPhone(value);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return (value ?? "").trim() || digits;
}

/** Número para wa.me (com DDI 55). */
export function whatsappIntl(value: string | null | undefined): string {
  const digits = normalizeBrazilPhone(value);
  if (!digits) return "";
  return `55${digits}`;
}
