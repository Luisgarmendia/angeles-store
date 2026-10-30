/** URL-safe slug for a category name. */
export function categorySlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function categoryPath(name: string): string {
  return `/categoria/${categorySlug(name)}`
}
