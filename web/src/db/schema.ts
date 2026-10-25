import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import type { StoreSettings } from "../lib/types"

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  stock: integer("stock"),
  madeToOrder: boolean("made_to_order").notNull().default(false),
  compareAtPriceCents: integer("compare_at_price_cents"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    stock: integer("stock").notNull().default(0),
    priceCents: integer("price_cents"),
    image: text("image"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("product_variants_product_id_idx").on(table.productId)],
)

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  data: jsonb("data").$type<StoreSettings>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const adminRole = pgEnum("admin_role", ["owner", "staff"])

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRole("role").notNull().default("staff"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const adminPushTokens = pgTable(
  "admin_push_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("admin_push_tokens_user_id_idx").on(table.userId)],
)

export const orderStatus = pgEnum("order_status", [
  "pendiente",
  "confirmado",
  "enviado",
  "entregado",
  "cancelado",
])

export const orderPaymentStatus = pgEnum("order_payment_status", [
  "pendiente",
  "pagado",
  "reembolsado",
])

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: serial("number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  customerAddress: text("customer_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  notes: text("notes").notNull().default(""),
  subtotalCents: integer("subtotal_cents").notNull(),
  status: orderStatus("status").notNull().default("pendiente"),
  paymentStatus: orderPaymentStatus("payment_status").notNull().default("pendiente"),
  pushSentAt: timestamp("push_sent_at", { withTimezone: true }),
  pushSuccessCount: integer("push_success_count").notNull().default(0),
  pushFailureCount: integer("push_failure_count").notNull().default(0),
  pushError: text("push_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    variantId: uuid("variant_id"),
    variantLabel: text("variant_label"),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
)

export const adminNotifications = pgTable(
  "admin_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    url: text("url").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("admin_notifications_user_created_idx").on(table.userId, table.createdAt),
  ],
)
