-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `d1_migrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text,
	`applied_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Store` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Aisle` (
	`id` text PRIMARY KEY NOT NULL,
	`storeId` text NOT NULL,
	`name` text NOT NULL,
	`startLatitude` real NOT NULL,
	`startLongitude` real NOT NULL,
	`endLatitude` real NOT NULL,
	`endLongitude` real NOT NULL,
	FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `StoreItem` (
	`id` text PRIMARY KEY NOT NULL,
	`storeId` text NOT NULL,
	`aisleId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	FOREIGN KEY (`aisleId`) REFERENCES `Aisle`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON UPDATE cascade ON DELETE cascade
);

*/