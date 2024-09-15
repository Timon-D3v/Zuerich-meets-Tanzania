CREATE TABLE `zmt`.`calendar` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(512) NOT NULL,
  `date` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This database holds all Events from zurich meets tanzania.';
