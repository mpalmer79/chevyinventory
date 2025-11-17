export function formatCurrency(input: string): string {
  if (!input) return "";

  // Remove everything except digits
  const digits = input.replace(/[^\d]/g, "");

  if (!digits) return "";

  const num = Number(digits);

  if (isNaN(num)) return "";

  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}
