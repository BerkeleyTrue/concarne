CREATE TABLE `concarne_data` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`weight` integer NOT NULL,
	`date` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `concarne_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `data_userid_idx` ON `concarne_data` (`userId`);--> statement-breakpoint
CREATE TABLE `concarne_user` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`username` text(255),
	`password` text(255),
	`height` integer
);
