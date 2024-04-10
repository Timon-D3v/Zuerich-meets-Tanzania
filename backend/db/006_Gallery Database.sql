CREATE TABLE `zmt`.`gallery` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `author` VARCHAR(1000) NULL,
  `title` VARCHAR(256) NULL,
  `subtitle` VARCHAR(1000) NULL,
  `date` VARCHAR(256) NULL,
  `img` JSON NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idgallery_UNIQUE` (`id` ASC) VISIBLE);