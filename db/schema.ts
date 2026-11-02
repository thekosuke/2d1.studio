import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// No seeds, identity profiles, IPs or behavioral timestamps.
// Product-leading primary key serves per-product counts and exact ownership lookups.
export const purchasedMarks = sqliteTable('purchased_marks', {
  productId: text('product_id').notNull(),
  browserId: text('browser_id').notNull(),
}, table => [primaryKey({ columns: [table.productId, table.browserId] })]);

// Contact retry ledger: no name, email, company, category or message text.
export const contactSubmissions = sqliteTable('contact_submissions', {
  submissionId: text('submission_id').primaryKey(),
  payloadHash: text('payload_hash').notNull(),
  leaseToken: text('lease_token'),
  leaseUntil: integer('lease_until').notNull().default(0),
  notionPageId: text('notion_page_id'),
  createdAt: integer('created_at').notNull(),
});
