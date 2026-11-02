CREATE TABLE `contact_submissions` (
	`submission_id` text PRIMARY KEY NOT NULL,
	`payload_hash` text NOT NULL,
	`lease_token` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`notion_page_id` text,
	`created_at` integer NOT NULL
);
