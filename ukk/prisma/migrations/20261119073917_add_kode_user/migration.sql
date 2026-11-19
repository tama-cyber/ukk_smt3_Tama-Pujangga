-- 1. Tambah kolom dulu tanpa wajib (boleh kosong)
ALTER TABLE `users` ADD COLUMN `kodeUser` VARCHAR(191) NULL;

-- 2. Isi data yang sudah ada dengan kode default
UPDATE `users` SET `kodeUser` = 'ADM000001' WHERE `id` = 1;

-- 3. Baru jadikan wajib (NOT NULL) dan unique
ALTER TABLE `users` MODIFY `kodeUser` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `users_kodeUser_key` ON `users`(`kodeUser`);