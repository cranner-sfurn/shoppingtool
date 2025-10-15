import {
  sqliteTable,
  integer,
  text,
  numeric,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const d1Migrations = sqliteTable("d1_migrations", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text(),
  appliedAt: numeric("applied_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const store = sqliteTable("Store", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  adjacencyList: text().notNull(), // JSON string of AdjacencyList for pathfinding
});

export const category = sqliteTable("Category", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  nodeId: text().references(() => node.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const node = sqliteTable("Node", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  isCategory: integer({ mode: "boolean" }).notNull().default(false), // true if this node represents a category
  storeId: text()
    .notNull()
    .references(() => store.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const storeItem = sqliteTable("StoreItem", {
  id: text().primaryKey().notNull(),
  storeId: text()
    .notNull()
    .references(() => store.id, { onDelete: "cascade", onUpdate: "cascade" }),
  categoryId: text()
    .notNull()
    .references(() => category.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text().notNull(),
  description: text(),
});
