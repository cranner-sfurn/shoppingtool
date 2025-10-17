import { relations } from "drizzle-orm/relations";
import { node, category, store, storeItem } from "./schema";

export const categoryRelations = relations(category, ({ one, many }) => ({
  node: one(node, {
    fields: [category.nodeId],
    references: [node.id],
  }),
  storeItems: many(storeItem),
}));

export const nodeRelations = relations(node, ({ one, many }) => ({
  categories: many(category),
  store: one(store, {
    fields: [node.storeId],
    references: [store.id],
  }),
}));

export const storeRelations = relations(store, ({ many }) => ({
  nodes: many(node),
  storeItems: many(storeItem),
}));

export const storeItemRelations = relations(storeItem, ({ one }) => ({
  category: one(category, {
    fields: [storeItem.categoryId],
    references: [category.id],
  }),
  store: one(store, {
    fields: [storeItem.storeId],
    references: [store.id],
  }),
}));
