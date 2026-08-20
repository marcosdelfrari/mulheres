/** Motivos de denúncia disponíveis no formulário público. */
export const REPORT_REASONS = [
  "Conteúdo ilegal",
  "Menor de idade",
  "Golpe ou spam",
  "Fotos falsas",
  "Assédio",
  "Outro",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
