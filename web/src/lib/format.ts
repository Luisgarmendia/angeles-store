import { config } from "./config"

const formatter = new Intl.NumberFormat(config.currency.locale, {
  style: "currency",
  currency: config.currency.code,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number): string {
  return formatter.format(value)
}
