CREATE TABLE `zmt`.`payment_session` (
  `pay_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `session_id` VARCHAR(256) NOT NULL,
  `username` VARCHAR(256) NOT NULL,
  `user_password` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`pay_id`),
  UNIQUE INDEX `pay_id_UNIQUE` (`pay_id` ASC) VISIBLE)
COMMENT = 'This table stores user information and their session ids to authenticate if they have paid.';


ALTER TABLE `zmt`.`payment_session` 
ADD COLUMN `pay_key` VARCHAR(256) NOT NULL AFTER `user_password`;