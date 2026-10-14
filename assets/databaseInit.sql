CREATE SCHEMA IF NOT EXISTS `zmt`;



USE `zmt`;



CREATE TABLE IF NOT EXISTS `zmt`.`users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(256) NOT NULL,
    `password` VARCHAR(64) NOT NULL,
    `firstName` VARCHAR(256) NOT NULL,
    `lastName` VARCHAR(256) NOT NULL,
    `phone` VARCHAR(16) NOT NULL DEFAULT 'Keine Nummer',
    `address` VARCHAR(256) NOT NULL,
    `type` VARCHAR(16) NOT NULL DEFAULT 'user',
    `picture` VARCHAR(512) NOT NULL DEFAULT '/img/svg/personal.svg',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `user_id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `user_email_UNIQUE` (`email` ASC) VISIBLE
)
COMMENT = 'This table holds all the userdata from zmt.';



CREATE TABLE IF NOT EXISTS `zmt`.`darkmode` (
    `userId` INT NOT NULL,
    `darkmode` TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`userId`),
    UNIQUE INDEX `darkmode_user_id_UNIQUE` (`userId` ASC) VISIBLE
)
COMMENT = 'This table holds the darkmode session of the user that are logged in.';



CREATE TABLE IF NOT EXISTS `zmt`.`blogs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(256) NOT NULL,
    `author` VARCHAR(256) NOT NULL,
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `data` JSON NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `blog_title_UNIQUE` (`title` ASC) VISIBLE
)
COMMENT = 'This table holds all the blogs.';



CREATE TABLE IF NOT EXISTS `zmt`.`news` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `data` JSON NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `news_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds all the blogs.';



CREATE TABLE IF NOT EXISTS `zmt`.`newsletter` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(256) NOT NULL,
    `gender` VARCHAR(8) NOT NULL,
    `firstName` VARCHAR(256) NOT NULL,
    `lastName` VARCHAR(256) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `newsletter_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'All people who have registered for the newsletter are stored in this database table.';



CREATE TABLE IF NOT EXISTS `zmt`.`calendar` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `startDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `endDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `title` VARCHAR(256) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `calendar_id_UNIQUE` (`id` ASC) VISIBLE,
    INDEX `calendar_start_date` (`startDate` ASC) VISIBLE,
    INDEX `calendar_end_date` (`endDate` ASC) VISIBLE
)
COMMENT = 'This table holds all events from zurich meets tanzania.';



CREATE TABLE IF NOT EXISTS `zmt`.`gallery` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(256) NOT NULL,
    `subtitle` VARCHAR(512) NOT NULL,
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `data` JSON NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `gallery_title_UNIQUE` (`title` ASC) VISIBLE
)
COMMENT = 'This is a collection of images from the hospital in Ifisi Tanzania.';



CREATE TABLE IF NOT EXISTS `zmt`.`members` (
    `memberId` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `subscriptionId` VARCHAR(256) NOT NULL,
    `customerId` VARCHAR(256) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `periodStartTime` BIGINT NOT NULL,
    `periodEndTime` BIGINT NOT NULL,
    `subscriptionStartTime` BIGINT NOT NULL,
    PRIMARY KEY (`memberId`),
    UNIQUE INDEX `members_user_id_UNIQUE` (`userId` ASC) VISIBLE
)
COMMENT = 'This table holds the payment information about all members that are subscribed to the membership of zmt.';



CREATE TABLE IF NOT EXISTS `zmt`.`legacyMembers` (
    `legacyMemberId` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `periodStartTime` BIGINT NOT NULL,
    `periodEndTime` BIGINT NOT NULL,
    `subscriptionStartTime` BIGINT NOT NULL,
    PRIMARY KEY (`legacyMemberId`),
    UNIQUE INDEX `legacyMembers_user_id_UNIQUE` (`userId` ASC) VISIBLE
)
COMMENT = 'This table holds the payment information about all members that are subscribed to the membership of zmt, but did not subscribe via stripe.';



CREATE TABLE IF NOT EXISTS `zmt`.`team` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `motto` VARCHAR(512) NOT NULL,
    `text` TEXT NOT NULL,
    `members` JSON NOT NULL,
    `picture` VARCHAR(512) NOT NULL,
    `updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `team_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds the current team of zmt.';



CREATE TABLE IF NOT EXISTS `zmt`.`subpages` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(256) NOT NULL,
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `data` JSON NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `subpages_id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `subpages_title_UNIQUE` (`title` ASC) VISIBLE
)
COMMENT = 'This table holds data for all the subpages of the zmt website.';



CREATE TABLE IF NOT EXISTS `zmt`.`donationUsageTypes` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(256) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `donationUsageTypes_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds all possible usage types for donations to zmt.';



CREATE TABLE IF NOT EXISTS `zmt`.`donationRequests` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(10, 2) NOT NULL,
    `firstName` VARCHAR(256) NOT NULL,
    `lastName` VARCHAR(256) NOT NULL,
    `email` VARCHAR(256) NOT NULL,
    `usageType` VARCHAR(256) NOT NULL,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `reviewed` BOOLEAN DEFAULT FALSE,
    `validated` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `donationRequests_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds all donation requests submitted by users. Each request includes the amount, donor information, usage type, and status flags for review and validation.';



CREATE TABLE IF NOT EXISTS `zmt`.`stripeEvents` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(256) NOT NULL,
    `eventType` VARCHAR(256) NOT NULL,
    `eventData` JSON NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `stripeEvents_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds all events from Stripe. Each record includes the event ID, event type, event data in JSON format, and creation timestamp.';



CREATE TABLE IF NOT EXISTS `zmt`.`stripeCustomers` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `customerId` VARCHAR(256) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `stripeCustomers_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds all Stripe customers. Each record includes the user ID, Stripe customer ID, and creation timestamp. This is used to track and manage Stripe customers associated with users.';



CREATE TABLE IF NOT EXISTS `zmt`.`stripeCheckoutSessions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `customerId` VARCHAR(256) NOT NULL,
    `sessionId` VARCHAR(256) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `stripeCheckoutSessions_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds all Stripe checkout sessions. Each record includes the user ID, Stripe customer ID, session ID, and creation timestamp. This is used to track and manage checkout sessions for users.';



CREATE TABLE IF NOT EXISTS `zmt`.`board` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `role` VARCHAR(256),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `board_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds the current board of zmt.';


CREATE TABLE IF NOT EXISTS `zmt`.`teamMember` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `role` VARCHAR(256),
    `profession` VARCHAR(256) NOT NULL,
    `motive` TEXT NOT NULL,
    `secondaryPicture` VARCHAR(512),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `teamMember_id_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds the extras information of the users that are also part of a team of zmt.';



CREATE TABLE IF NOT EXISTS `zmt`.`donationMeter` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `currentValue` INT NOT NULL,
    `maxValue` INT NOT NULL,
    `title` VARCHAR(64) NOT NULL,
    `description` VARCHAR(512) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id_donationMeter_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds the data of the donationMeter.';



CREATE TABLE IF NOT EXISTS `zmt`.`files` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(36) NOT NULL,
    `mimeType` VARCHAR(64) NOT NULL,
    `filename` VARCHAR(256) NULL,
    `folderId` INT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id_files_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `uuid_files_UNIQUE` (`uuid` ASC) VISIBLE,
    UNIQUE INDEX `filename_files_UNIQUE` (`filename` ASC) VISIBLE
)
COMMENT = 'This table holds metadata for the files uploaded to delivapi.';



CREATE TABLE IF NOT EXISTS `zmt`.`folders` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `foldername` VARCHAR(256) NOT NULL,
    `folderId` INT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id_folders_UNIQUE` (`id` ASC) VISIBLE
)
COMMENT = 'This table holds metadata for the folders in the file system.';
