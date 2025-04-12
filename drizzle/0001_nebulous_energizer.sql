CREATE TABLE `concarne_fasts` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`startTime` integer NOT NULL,
	`endTime` integer,
	`targetHours` integer NOT NULL,
	`fastType` text(255) NOT NULL,
	`isCompleted` integer DEFAULT 0,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `concarne_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fasts_userid_idx` ON `concarne_fasts` (`userId`);