-- Схема БД для Password Generator
-- YDB (YQL) синтаксис

CREATE TABLE `users` (
    `id` String,
    `username` String,
    `password_hash` String,
    `keyword_hash` String,
    `keyword_salt` String,
    `createdAt` Timestamp,
    PRIMARY KEY (`id`)
);

CREATE INDEX `idx_users_username` GLOBAL ON `users` (`username`);

CREATE TABLE `user_settings` (
    `id` String,
    `user_id` String,
    `profile_name` String,
    `password_length` Int32,
    `use_uppercase` Bool,
    `use_lowercase` Bool,
    `use_numbers` Bool,
    `use_symbols` Bool,
    `exclude_ambiguous` Bool,
    `custom_symbols` String,
    `updatedAt` Timestamp,
    PRIMARY KEY (`id`)
);

CREATE INDEX `idx_user_settings_user_id` GLOBAL ON `user_settings` (`user_id`);

CREATE TABLE `saved_passwords` (
    `id` String,
    `user_id` String,
    `title` String,
    `encrypted_data` String,
    `iv` String,
    `auth_tag` String,
    `strength_score` Int32,
    `strength_details` String,
    `createdAt` Timestamp,
    PRIMARY KEY (`id`)
);

CREATE INDEX `idx_saved_passwords_user_id` GLOBAL ON `saved_passwords` (`user_id`);