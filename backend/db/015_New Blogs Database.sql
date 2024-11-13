CREATE TABLE `zmt`.`blogs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(2048) NOT NULL,
  `data` JSON NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idblogs_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This is the new table for the blogs from ZMT.';
