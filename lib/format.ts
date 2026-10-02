export const money = (value: number) =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 0 }).format(Number(value) || 0);

export const dateLabel = (value: string, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) =>
  new Intl.DateTimeFormat("en-SG", options).format(new Date(`${value.slice(0, 10)}T00:00:00`));

export const currentMonthLabel = (value = new Date()) =>
  new Intl.DateTimeFormat("en-SG", { month: "long", year: "numeric" }).format(value);
