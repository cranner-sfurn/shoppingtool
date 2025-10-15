CREATE TABLE `NodeConnection` (
	`id` text PRIMARY KEY NOT NULL,
	`fromNodeId` text NOT NULL,
	`toNodeId` text NOT NULL,
	`weight` integer NOT NULL,
	`storeId` text NOT NULL,
	FOREIGN KEY (`fromNodeId`) REFERENCES `Node`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toNodeId`) REFERENCES `Node`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `Category` ADD `description` text;--> statement-breakpoint
ALTER TABLE `Store` DROP COLUMN `adjacencyList`;