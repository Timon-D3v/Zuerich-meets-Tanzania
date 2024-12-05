ALTER TABLE `zmt`.`news` 
DROP COLUMN `pdf_src`,
DROP COLUMN `pdf`,
DROP COLUMN `btn_link`,
DROP COLUMN `btn_text`,
DROP COLUMN `btn`,
CHANGE COLUMN `text` `html` JSON NOT NULL ,
CHANGE COLUMN `img_path` `type` VARCHAR(8) NOT NULL ,
CHANGE COLUMN `img_alt` `src` VARCHAR(2058) NOT NULL ,
CHANGE COLUMN `img_pos` `position` VARCHAR(8) NULL ;
