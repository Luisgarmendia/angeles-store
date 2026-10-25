import { config } from "../config"

const formatter = new Intl.NumberFormat(config.currency.locale, {
  style: "currency",
  currency: config.currency.code,
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return formatter.format(value)
}
