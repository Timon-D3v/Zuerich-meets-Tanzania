CREATE TABLE `zmt`.`invoice` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `pdf` VARCHAR(512) NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idinvoice_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This table holds all the invoices of the users.';

ALTER TABLE `zmt`.`invoice` 
CHANGE COLUMN `user_id` `subscription_id` VARCHAR(256) NOT NULL ;
