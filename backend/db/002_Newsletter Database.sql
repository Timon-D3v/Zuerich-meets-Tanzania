CREATE TABLE `zmt`.`newsletter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `gender` VARCHAR(6) NOT NULL,
  `vorname` VARCHAR(200) NOT NULL,
  `nachname` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'All people who have registered for the newsletter are stored in this database table.';
