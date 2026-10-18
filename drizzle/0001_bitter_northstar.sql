CREATE TABLE `customer_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(140) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`email` varchar(320),
	`queryType` varchar(80) NOT NULL,
	`message` text NOT NULL,
	`consentGiven` int NOT NULL DEFAULT 1,
	`status` enum('new','in_progress','resolved') NOT NULL DEFAULT 'new',
	`internalNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_queries_id` PRIMARY KEY(`id`)
);
