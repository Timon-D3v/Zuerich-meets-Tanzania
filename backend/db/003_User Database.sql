CREATE TABLE `zmt`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(256) NULL,
  `password` VARCHAR(256) NULL,
  `name` VARCHAR(256) NULL,
  `family_name` VARCHAR(256) NULL,
  `email` VARCHAR(256) NULL,
  `picture` LONGTEXT NULL,
  `phone` VARCHAR(16) NULL DEFAULT '\"Keine Nummer\"',
  `type` VARCHAR(256) NULL DEFAULT '\"user\"',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

ALTER TABLE `zmt`.`users` 
CHANGE COLUMN `picture` `picture` VARCHAR(512) NULL DEFAULT '\"/img/svg/personal.svg\"' ;