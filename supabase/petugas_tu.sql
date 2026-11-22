-- Jalankan SETELAH membuat akun TU di Authentication → Users.
-- Ganti email di bawah dengan email akun TU yang kamu buat.
insert into public.petugas_tu (email) values ('ganti-dengan-email-tu@contoh.com')
on conflict do nothing;
