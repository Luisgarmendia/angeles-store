"use server"

import { listCatalogPage } from "@/db/queries"
import type { CatalogFilterInput } from "@/lib/catalog"
import type { CatalogPage } from "@/lib/catalog-query"

/** Loads one keyset page of the catalog for the infinite scroll. */
export async function loadCatalogPageAction(input: {
  filters?: Partial<CatalogFilterInput> | null
  cursor?: string | null
} | null): Promise<CatalogPage> {
  return listCatalogPage({
    filters: input?.filters,
    cursor: input?.cursor,
    includeTotal: !input?.cursor,
  })
}
