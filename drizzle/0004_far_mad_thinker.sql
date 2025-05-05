PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_concarne_data` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
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
CREATE INDEX `data_userid_date_unique_idx` ON `concarne_data` (`userId`,`date`);--> statement-breakpoint
CREATE TABLE `__new_concarne_fasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`startTime` text,
	`endTime` text,
	`targetHours` integer NOT NULL,
	`fastType` text(255) NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `concarne_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_concarne_fasts`("id", "userId", "startTime", "endTime", "targetHours", "fastType", "createdAt") SELECT "id", "userId", "startTime", "endTime", "targetHours", "fastType", "createdAt" FROM `concarne_fasts`;--> statement-breakpoint
DROP TABLE `concarne_fasts`;--> statement-breakpoint
ALTER TABLE `__new_concarne_fasts` RENAME TO `concarne_fasts`;--> statement-breakpoint
CREATE INDEX `fasts_userid_idx` ON `concarne_fasts` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_concarne_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(255) NOT NULL,
	`password` text(255),
	`height` integer
);
--> statement-breakpoint
INSERT INTO `__new_concarne_user`("id", "username", "password", "height") SELECT "id", "username", "password", "height" FROM `concarne_user`;--> statement-breakpoint
DROP TABLE `concarne_user`;--> statement-breakpoint
ALTER TABLE `__new_concarne_user` RENAME TO `concarne_user`;