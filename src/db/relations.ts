import { relations } from "drizzle-orm/relations";
import { store, aisle, storeItem } from "./schema";

export const aisleRelations = relations(aisle, ({one, many}) => ({
	store: one(store, {
		fields: [aisle.storeId],
		references: [store.id]
	}),
	storeItems: many(storeItem),
}));

export const storeRelations = relations(store, ({many}) => ({
	aisles: many(aisle),
	storeItems: many(storeItem),
}));

export const storeItemRelations = relations(storeItem, ({one}) => ({
	aisle: one(aisle, {
		fields: [storeItem.aisleId],
		references: [aisle.id]
	}),
	store: one(store, {
		fields: [storeItem.storeId],
		references: [store.id]
	}),
}));