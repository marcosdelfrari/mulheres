export type PriceDisplayUnit = "hour" | "half_hour";

export function normalizePriceDisplayUnit(value: unknown): PriceDisplayUnit {
  return value === "half_hour" ? "half_hour" : "hour";
}

/** Valor por hora normalizado — usado em filtros e ordenação. */
export function effectiveHourlyPrice(
  price: number,
  unit: PriceDisplayUnit = "hour",
): number {
  return unit === "half_hour" ? price * 2 : price;
}

export function formatListingPrice(
  price: number,
  unit: PriceDisplayUnit = "hour",
): string {
  const suffix = unit === "half_hour" ? "/30min" : "/h";
  return `R$ ${price}${suffix}`;
}
