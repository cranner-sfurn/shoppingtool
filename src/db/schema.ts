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
});

export const aisle = sqliteTable("Aisle", {
  id: text().primaryKey().notNull(),
  storeId: text()
    .notNull()
    .references(() => store.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name: text().notNull(),
  startLatitude: real().notNull(),
  startLongitude: real().notNull(),
  endLatitude: real().notNull(),
  endLongitude: real().notNull(),
});

export const storeItem = sqliteTable("StoreItem", {
  id: text().primaryKey().notNull(),
  storeId: text()
    .notNull()
    .references(() => store.id, { onDelete: "cascade", onUpdate: "cascade" }),
  aisleId: text()
    .notNull()
    .references(() => aisle.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name: text().notNull(),
  description: text(),
});
