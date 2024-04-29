CREATE TABLE `zmt`.`temp_sub` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sub_id` VARCHAR(256) NOT NULL,
  `customer_id` VARCHAR(256) NOT NULL,
  `period_end` INT NOT NULL,
  `period_start` INT NOT NULL,
  `start_date` INT NOT NULL,
  `status` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idtemp_sub_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'In this database the subscription ids are stored with the needed data for the members database.';
