CREATE TABLE `zmt`.`members` (
  `member_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `subscription_id` VARCHAR(256) NOT NULL,
  `status` VARCHAR(256) NOT NULL,
  `period_start` INT NOT NULL,
  `period_end` INT NOT NULL,
  `start_date` INT NOT NULL,
  `is_admin` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`member_id`),
  UNIQUE INDEX `idmembers_UNIQUE` (`member_id` ASC) VISIBLE)
COMMENT = 'This table holds information about all members that are signed up via the Website.';

ALTER TABLE `zmt`.`members` 
ADD COLUMN `cusomer_id` VARCHAR(256) NOT NULL AFTER `subscription_id`;
