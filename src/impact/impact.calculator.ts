// Converts a claimed quantity into impact numbers. Factors are estimates, stated in the report.
const KG_PER_UNIT: Record<string, number> = {
  kg: 1,
  g: 0.001,
  l: 1,
  liter: 1,
  litre: 1,
  plate: 0.4,
  plates: 0.4,
  packet: 0.3,
  packets: 0.3,
  box: 0.5,
  boxes: 0.5,
  piece: 0.2,
  pieces: 0.2,
  pcs: 0.2,
};
const DEFAULT_KG_PER_UNIT = 0.4; // one average meal portion
const KG_PER_MEAL = 0.4;
const CO2_PER_KG_FOOD = 2.5; // kg CO2e avoided per kg of food kept out of waste (common estimate)

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateImpact(quantity: number, unit: string) {
  const perUnit = KG_PER_UNIT[unit.trim().toLowerCase()] ?? DEFAULT_KG_PER_UNIT;
  const kgRescued = round2(quantity * perUnit);
  return {
    kgRescued,
    mealsSaved: Math.max(1, Math.round(kgRescued / KG_PER_MEAL)),
    co2Saved: round2(kgRescued * CO2_PER_KG_FOOD),
  };
}
