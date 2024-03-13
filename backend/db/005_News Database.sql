CREATE TABLE `zmt`.`news` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(2058) NOT NULL,
  `img_path` VARCHAR(1024) NOT NULL DEFAULT '/img/stock/echse.jpg',
  `img_alt` VARCHAR(2058) NOT NULL DEFAULT 'Eine Echse',
  `img_pos` VARCHAR(8) NOT NULL DEFAULT 'center',
  `btn` TINYINT NOT NULL DEFAULT 1,
  `btn_text` VARCHAR(16) NOT NULL DEFAULT 'Mehr Erfahren',
  `btn_link` VARCHAR(1024) NULL,
  `pdf` TINYINT NOT NULL DEFAULT 0,
  `pdf_src` VARCHAR(1024) NOT NULL DEFAULT 'error.pdf',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idadmin_UNIQUE` (`id` ASC) VISIBLE);
