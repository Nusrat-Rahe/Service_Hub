const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "BDT";

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
