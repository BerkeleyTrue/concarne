PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_concarne_data` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`weight` integer NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `concarne_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_concarne_data`("id", "userId", "weight", "date") SELECT "id", "userId", "weight", "date" FROM `concarne_data`;--> statement-breakpoint
DROP TABLE `concarne_data`;--> statement-breakpoint
ALTER TABLE `__new_concarne_data` RENAME TO `concarne_data`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `data_userid_idx` ON `concarne_data` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_concarne_fasts` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`startTime` text NOT NULL,
	`endTime` text,
	`targetHours` integer NOT NULL,
	`fastType` text(255) NOT NULL,
	`isCompleted` integer DEFAULT 0,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `concarne_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_concarne_fasts`("id", "userId", "startTime", "endTime", "targetHours", "fastType", "isCompleted", "createdAt") SELECT "id", "userId", "startTime", "endTime", "targetHours", "fastType", "isCompleted", "createdAt" FROM `concarne_fasts`;--> statement-breakpoint
DROP TABLE `concarne_fasts`;--> statement-breakpoint
ALTER TABLE `__new_concarne_fasts` RENAME TO `concarne_fasts`;--> statement-breakpoint
CREATE INDEX `fasts_userid_idx` ON `concarne_fasts` (`userId`);