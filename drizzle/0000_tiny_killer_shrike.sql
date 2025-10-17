-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Store` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`adjacencyList` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nodeId` text,
	FOREIGN KEY (`nodeId`) REFERENCES `Node`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Node` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`isCategory` integer DEFAULT false NOT NULL,
	`storeId` text NOT NULL,
	FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `StoreItem` (
	`id` text PRIMARY KEY NOT NULL,
	`storeId` text NOT NULL,
	`categoryId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `d1_migrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`applied_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

*/