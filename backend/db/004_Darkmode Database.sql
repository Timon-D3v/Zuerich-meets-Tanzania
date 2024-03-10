CREATE TABLE `zmt`.`darkmode` (
  `user_id` INT NOT NULL,
  `darkmode` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE);
