export function calculateRent(totalSales: number, ratePercent: number, minimumRent: number) {
  const gtoRent = totalSales * (ratePercent / 100);
  return {
    totalSales,
    gtoRent,
    finalRent: Math.max(gtoRent, minimumRent),
  };
}
