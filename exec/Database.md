```
create database ssafy_web_db;
```

데이터베이스 생성 후 SpringBoot 실행 후 JPA로 데이터베이스 테이블 생성

```
alter table user modify profile_img longblob;


insert into music
values 
    (1, 'address', 'NCS', 'EASY', 'address', 'What I Want [NCS Release]', 0, '2023-07-21' , '00:02:10', 'Britt Lari & Ray Le Fanue','https://i1.sndcdn.com/artworks-mlzQQi6IwqC74IZe-zGaA7A-t500x500.jpg'),
    (2, 'address', 'NCS', 'HARD', 'address', 'Paper Walls (with Mykyl) [NCS Release]', 0, '2023-04-28' , '00:02:46', 'Elliot Kings, Riggs','https://i1.sndcdn.com/artworks-f4dGJlKqs15VQgHR-rmRLrQ-t500x500.jpg'),
    (3, 'address', 'NCS', 'NORMAL', 'address', 'Dreamer (BEAUZ & Heleen Remix) [NCS Release]', 0, '2021-07-29' , '00:02:04', 'Alan Walker','https://i1.sndcdn.com/artworks-0tchUEttIgURl64M-OcyrCA-t500x500.jpg');
    (4, 'address', 'NCS', 'NORMAL', 'address', 'Invincible [NCS Release]', 0, '2015-05-15' , '00:02:10', 'DEAF KEV','https://i1.sndcdn.com/artworks-000116771545-kc8oi5-t500x500.jpg'),
    (5, 'address', 'NCS', 'NORMAL', 'address', 'Heroes Tonight (feat. Johnning)[NCS Release]', 0, '2015-06-10' , '00:03:28', 'Janji','https://i1.sndcdn.com/artworks-000119717450-w3zyh8-t500x500.jpg'),
    (6, 'address', 'NCS', 'NORMAL', 'address', 'Candyland [NCS Release]', 0, '2015-02-08' , '00:02:04', 'Tobu','https://i1.sndcdn.com/artworks-000106137072-hbujw9-t500x500.jpg');
```
