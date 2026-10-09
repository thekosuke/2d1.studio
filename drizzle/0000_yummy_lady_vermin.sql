CREATE TABLE `purchased_marks` (
	`product_id` text NOT NULL,
	`browser_id` text NOT NULL,
	PRIMARY KEY(`product_id`, `browser_id`)
);
