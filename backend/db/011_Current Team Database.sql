CREATE TABLE `zmt`.`team` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `aktualisiert` VARCHAR(128) NOT NULL,
  `leitsatz` VARCHAR(2048) NOT NULL,
  `text` VARCHAR(8192) NOT NULL,
  `bild` VARCHAR(256) NOT NULL,
  `members` JSON NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This table holds the current team of the organisation zurich meets tanzania';
