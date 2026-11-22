# Profile Card

Kartu profil statis (HTML + CSS + JS biasa, tanpa build / framework).
Semua teks, gambar, warna, dan layout diatur dari **satu file config**, dan bisa diedit visual lewat **demo.html**.

## Struktur folder

```
profile/
├── index.html          ← halaman utama (yang dipublish)
├── demo.html           ← editor config + live preview (khusus kamu, tidak wajib di-upload)
├── README.md
├── css/
│   ├── card.css        ← style kartu + background glass (semua variabel warna/ukuran)
│   ├── page.css        ← layout halaman index.html
│   └── demo.css        ← style editor demo.html
├── js/
│   ├── config.js       ← ⭐ CONFIG UTAMA (teks, gambar, warna, layout)
│   ├── app.js          ← mesin render kartu dari config
│   └── demo.js         ← logika editor demo.html
└── assets/             ← gambar (profil, banner, thumb, ikon verified)
```

## Isi kartu

- **Susunan** — urutan blok (nama, username, bio, stats, link, More Info) dan isi daftar bisa diubah dengan drag & drop.
- **Banner** — rounded 4 sisi / 2 sisi bawah / ikut shape card / kotak / bebas per sudut. Ikon tema (kiri atas), tombol simpan (kanan atas), ikon media sosial (ukuran bisa diatur, bisa ikon sendiri, 8 template posisi atau seret bebas).
- **Foto profil** — bentuk kotak sampai bulat, plus **ring** opsional (solid/gradient, tebal, jarak).
- **Nama + ikon verified** — klik ikon → tulisan (bisa diganti) muncul di atas ikon. Ukuran ikon bisa diatur, dan **label** berwarna bisa ditambah di sebelahnya dengan perataan tengah / atas / bawah.
- **Username, bio (multi-paragraf), Following / Followers, tombol Follow** (di bawah banner atau di banner).
- **Link** di bawah Following/Followers — bisa lebih dari satu, gaya teks atau tombol, warna solid/gradient.
- **More Info** — panel terbuka ke bawah; bentuk & teks tombol bisa solid/gradient (awal: glass morphism).
- **Tema gelap / terang** (ikon matahari ⇄ bulan beranimasi), pilihan font, dan **background** (glass orb / gambar upload / warna polos).

## Cara pakai cepat

1. Buka `index.html` di browser untuk melihat hasil.
2. Mau ubah-ubah? Buka `demo.html`.
3. Selesai edit → klik **Export ZIP** → ekstrak ke folder project (timpa `js/config.js` dan gambar yang ikut).
4. Upload folder ke hosting. `demo.html` boleh dihapus kalau tidak mau ikut dipublish.

> Buka langsung dengan double-click (`file://`) juga bisa, tidak perlu server.

## demo.html

| Fitur | Keterangan |
|---|---|
| **Panel config** | Profil, media sosial (tambah/hapus, maks 5), Follow/Following/Followers, link, tombol simpan, More Info (daftar info tambah/hapus, maks 6), tema gelap/terang + palet warna masing-masing, background glass, gambar, banner, layout (bentuk foto profil, ukuran, lebar, sudut), info tab/SEO. |
| **Live preview** | Kartu langsung berubah saat panel diubah. Semua interaksi bisa dites di preview: ikon tema, verified, Follow, simpan, More Info. Tombol **375 / 320 / 280** untuk tes lebar layar kecil. |
| **Edit via klik (ON/OFF)** | Klik objek di kartu → panel kiri otomatis membuka & menyorot pengaturannya. Teks bisa diketik langsung (Enter = simpan, Esc = batal; bio: Enter = baris baru, Ctrl+Enter = simpan). Klik ikon sosial untuk ganti link, seret ikon sosial untuk memindah posisinya, seret ⠿ untuk memindah blok; klik foto / banner / ikon verified / area background untuk upload gambar. |
| **Draft otomatis** | Tersimpan di browser (localStorage). Lihat hasilnya di `index.html?draft=1` (tombol **Buka index**). |
| **Export ZIP / config.js / Copy JSON / Import / Reset** | Sama seperti sebelumnya. |

## Isi config (js/config.js)

- `meta`, `assets` — judul tab, path gambar (`background` kosong = tanpa gambar)
- `profile` — `name`, `username`, `description` (baris kosong = paragraf), `verified*` (+ `verifiedSize`, `verifiedPos`), `badgeAlign` (`center`/`top`/`bottom`/`baseline`), `labels: { show, items[] }`
- `avatar.ring` — `show`, `mode` (solid/gradient), `color1`, `color2`, `angle`, `width`, `gap`
- `layout.order` — urutan blok
- `socials` — `show`, `style`, `size`, `pos` (template posisi / `custom` + `x`,`y`), `direction`, `items: [{ type, url, icon, tint }]` (`type: "custom"` = ikon sendiri)
- `follow` — `show`, `position` (`below` / `banner`), teks, angka Following/Followers
- `links` — `show`, `items: [{ text, url, icon, style, mode, color1, color2, textColor }]`
- `cta` — More Info: `shapeMode` (`glass`/`solid`/`gradient`), `shapeColor1/2`, `textMode`, `textColor1/2`, `about`, `items`, aksi
- `theme` — `mode`, `fontFamily`, `bgMode` (`orbs`/`image`/`solid`), `bgBlur`, `bgDim`, palet `light` & `dark`, banner (`bannerHeight`, `bannerInset`, `bannerRadiusMode`, `bannerRadius*`), `cardWidth`, `cardRadius`, `cardBorderWidth`, `avatarSize`, `avatarRadius`

## Catatan

- **Preview link (WhatsApp, Telegram, dll.)** membaca tag `<meta>` statis di `index.html`, bukan hasil JavaScript. Kalau mengganti judul/deskripsi/thumbnail, ubah juga tag `<title>`, `description`, `og:*` dan `<link rel="icon">` di `index.html`.
- Di demo, tema/follow/simpan hanya berlaku di preview. Di `index.html` pilihan pengunjung disimpan di browser mereka.
- Draft demo tersimpan per browser. Pindah browser/perangkat → gunakan Export ZIP.
