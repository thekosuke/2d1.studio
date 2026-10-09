import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';

// No seeds, identity profiles, IPs or behavioral timestamps.
// Product-leading primary key serves per-product counts and exact ownership lookups.
export const purchasedMarks = sqliteTable('purchased_marks', {
  productId: text('product_id').notNull(),
  browserId: text('browser_id').notNull(),
}, table => [primaryKey({ columns: [table.productId, table.browserId] })]);
