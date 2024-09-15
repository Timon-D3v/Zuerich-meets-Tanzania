ALTER TABLE `zmt`.`users` 
CHANGE COLUMN `username` `username` VARCHAR(256) NOT NULL ,
CHANGE COLUMN `password` `password` VARCHAR(256) NOT NULL ,
CHANGE COLUMN `name` `name` VARCHAR(256) NOT NULL ,
CHANGE COLUMN `family_name` `family_name` VARCHAR(256) NOT NULL ,
CHANGE COLUMN `email` `email` VARCHAR(256) NOT NULL ,
CHANGE COLUMN `picture` `picture` VARCHAR(512) NOT NULL DEFAULT '"/img/svg/personal.svg"' ,
CHANGE COLUMN `phone` `phone` VARCHAR(16) NOT NULL DEFAULT '"Keine Nummer"' ,
CHANGE COLUMN `type` `type` VARCHAR(256) NOT NULL DEFAULT '"user"' ,
CHANGE COLUMN `address` `address` VARCHAR(512) NOT NULL DEFAULT 'Keine Adresse' ;