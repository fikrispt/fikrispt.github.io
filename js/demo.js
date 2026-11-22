/* ==========================================================
   demo.html — editor config + live preview + edit via klik
   Bergantung pada js/config.js dan js/app.js
   ========================================================== */
(function () {
  "use strict";

  var PC = window.ProfileCard;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Di demo, tema / follow / simpan hanya berlaku di preview (tidak menulis ke storage index)
  PC.configure({ persist: false });

  var DEFAULTS = PC.defaults();
  var cfg = PC.merge(DEFAULTS, PC.loadDraft() || {});

  var stage = $("#stage");
  var shell = $("#stageShell");
  var cardEl = $("#card");
  var formEl = $("#form");
  var statusEl = $("#status");
  var editOn = false;

  /* Lokasi standar file saat export ZIP (sesuai struktur folder) */
  var ASSET_FILES = {
    profile:       { path: "assets/profile/profile.jpg",     type: "jpeg", max: 800 },
    banner:        { path: "assets/banner/banner.jpg",       type: "jpeg", max: 1400 },
    thumb:         { path: "assets/thumb/thumb.jpg",         type: "jpeg", max: 512, square: true },
    verified:      { path: "assets/icon/verified.png",       type: "png",  max: 512 },
    verifiedWhite: { path: "assets/icon/verified-white.png", type: "png",  max: 512 },
    background:    { path: "assets/background/background.jpg", type: "jpeg", max: 1920 }
  };
  var ICON_SPEC = { type: "png", max: 128 };

  var IMAGE_FIELDS = [
    { key: "profile",       label: "Foto profil",      hint: "Disarankan persegi, min. 400px. Bentuk & ring diatur di bagian Foto profil & ring." },
    { key: "banner",        label: "Banner",           hint: "Dipakai bila Mode banner = Gambar. Disarankan 1200×400." },
    { key: "thumb",         label: "Thumbnail",        hint: "Favicon tab & preview link (og:image). Disarankan 512×512." },
    { key: "verified",      label: "Ikon verified (biru)",  hint: "PNG transparan." },
    { key: "verifiedWhite", label: "Ikon verified (putih)", hint: "PNG transparan, untuk kartu gelap." },
    { key: "background",    label: "Background halaman", hint: "Dipakai bila Jenis background = Gambar upload." }
  ];

  /* ---------- skema form ---------- */
  function paletteFields(mode) {
    var b = "theme." + mode + ".";
    return [
      { path: b + "pageBg", label: "Background halaman", type: "color" },
      { path: b + "orb1", label: "Background glass — warna 1", type: "color" },
      { path: b + "orb2", label: "Background glass — warna 2", type: "color" },
      { path: b + "orb3", label: "Background glass — warna 3", type: "color" },
      { path: b + "cardBg", label: "Warna kartu", type: "color" },
      { path: b + "cardOpacity", label: "Transparansi kartu (kaca)", type: "range", min: 0.05, max: 1, step: 0.05 },
      { path: b + "cardBorder", label: "Warna garis tepi kartu", type: "color" },
      { path: b + "cardBorderOpacity", label: "Opasitas garis tepi", type: "range", min: 0, max: 1, step: 0.05 },
      { path: b + "textColor", label: "Warna teks utama", type: "color" },
      { path: b + "mutedColor", label: "Warna teks kecil", type: "color" },
      { path: b + "linkColor", label: "Warna link (otomatis)", type: "color" },
      { path: b + "followBg", label: "Tombol Follow — background", type: "color" },
      { path: b + "followText", label: "Tombol Follow — teks", type: "color" }
    ];
  }

  function get(path) { return PC.getPath(cfg, path); }
  function isGrad(path) { return function () { return get(path) === "gradient"; }; }
  function isOneOf(path, arr) { return function () { return arr.indexOf(get(path)) !== -1; }; }

  var COLOR_MODES = [["solid", "Solid (1 warna)"], ["gradient", "Gradient (2 warna)"]];

  /* sesuai urutan tampil di kartu: atas → bawah */
  var SECTIONS = [
    { title: "Profil", open: true, fields: [
      { path: "profile.name", label: "Nama", type: "text" },
      { path: "profile.username", label: "Username", type: "text", hint: "Contoh: @namakamu" },
      { path: "profile.description", label: "Bio", type: "textarea",
        hint: "Tekan Enter untuk baris baru. Beri 1 baris kosong untuk membuat paragraf baru." },
    ]},
    { title: "Verified & label di samping nama", fields: [
      { path: "profile.verified", label: "Tampilkan ikon verified", type: "check" },
      { path: "profile.verifiedStyle", label: "Gaya ikon verified", type: "select",
        options: [["default", "Biru (default)"], ["white", "Putih"]] },
      { path: "profile.verifiedSize", label: "Ukuran ikon verified (px)", type: "range", min: 12, max: 60, step: 1 },
      { path: "profile.verifiedText", label: "Teks yang muncul di atas ikon saat diklik", type: "text",
        hint: "Di mode edit: arahkan kursor ke nama lalu klik teksnya, atau klik ikon verified." },
      { path: "profile.badgeAlign", label: "Perataan ikon & label di samping nama", type: "choice", cols: 2, options: [
        ["center", "Tengah (sejajar nama)"], ["top", "Atas"], ["bottom", "Bawah"], ["baseline", "Garis dasar teks"]] },
      { path: "profile.verifiedPos", label: "Urutan ikon verified", type: "select",
        options: [["before", "Sebelum label"], ["after", "Sesudah label"]] },
      { path: "profile.labels.show", label: "Tampilkan label", type: "check" }
    ], list: {
      path: "profile.labels.items", max: 3, itemName: "Label",
      blank: function () { return { text: "Freelancer", icon: "none", mode: "gradient", color1: "#7c5cff", color2: "#4f8bff", textColor: "#ffffff" }; },
      fields: function (b) { return [
        { path: b + "text", label: "Teks label", type: "text" },
        { path: b + "icon", label: "Ikon", type: "select", options: PC.LINK_ICONS },
        { path: b + "mode", label: "Warna label", type: "select", options: COLOR_MODES },
        { path: b + "color1", label: "Warna 1", type: "color" },
        { path: b + "color2", label: "Warna 2", type: "color", when: isGrad(b + "mode") },
        { path: b + "textColor", label: "Warna teks", type: "color" }
      ]; }
    }},
    { title: "Susunan blok (drag & drop)", custom: "order" },
    { title: "Foto profil & ring", fields: [
      { path: "theme.avatarRadius", label: "Bentuk foto profil (kotak → bulat)", type: "range", min: 0, max: 50, step: 1,
        presets: [["Kotak", 0], ["Tumpul", 18], ["Bulat", 50]], suffix: "%" },
      { path: "theme.avatarSize", label: "Ukuran foto profil (px)", type: "range", min: 56, max: 150, step: 2 },
      { path: "avatar.ring.show", label: "Aktifkan ring", type: "check" },
      { path: "avatar.ring.mode", label: "Warna ring", type: "select", options: COLOR_MODES, when: function () { return get("avatar.ring.show"); } },
      { path: "avatar.ring.color1", label: "Warna 1", type: "color", when: function () { return get("avatar.ring.show"); } },
      { path: "avatar.ring.color2", label: "Warna 2", type: "color", when: function () { return get("avatar.ring.show") && get("avatar.ring.mode") === "gradient"; } },
      { path: "avatar.ring.angle", label: "Arah gradient (derajat)", type: "range", min: 0, max: 360, step: 5, suffix: "°",
        when: function () { return get("avatar.ring.show") && get("avatar.ring.mode") === "gradient"; } },
      { path: "avatar.ring.width", label: "Tebal garis ring (px)", type: "range", min: 1, max: 12, step: 1, when: function () { return get("avatar.ring.show"); } },
      { path: "avatar.ring.gap", label: "Jarak ring ke foto (px)", type: "range", min: 0, max: 16, step: 1, when: function () { return get("avatar.ring.show"); } }
    ]},
    { title: "Banner", fields: [
      { path: "theme.bannerMode", label: "Isi banner", type: "select",
        options: [["image", "Gambar"], ["gradient", "Gradient"], ["solid", "Satu warna"]] },
      { path: "theme.bannerColor1", label: "Warna 1", type: "color", when: function () { return get("theme.bannerMode") !== "image"; } },
      { path: "theme.bannerColor2", label: "Warna 2", type: "color", when: isGrad("theme.bannerMode") },
      { path: "theme.bannerColor3", label: "Warna 3", type: "color", when: isGrad("theme.bannerMode") },
      { path: "theme.bannerAnimate", label: "Animasi gradient", type: "check", when: isGrad("theme.bannerMode") },
      { path: "theme.bannerSpeed", label: "Kecepatan (detik / siklus)", type: "range", min: 1, max: 20, step: 1, when: isGrad("theme.bannerMode") },
      { path: "theme.bannerHeight", label: "Tinggi banner (px)", type: "range", min: 100, max: 320, step: 2 },
      { path: "theme.bannerInset", label: "Jarak banner ke tepi kartu (px)", type: "range", min: 0, max: 20, step: 1,
        hint: "0 = banner penuh sampai tepi kartu." },
      { path: "theme.bannerRadiusMode", label: "Bentuk sudut banner", type: "select", options: [
        ["all", "Rounded 4 sisi"],
        ["bottom", "Rounded 2 sisi bawah saja"],
        ["top", "Rounded 2 sisi atas saja"],
        ["match", "Ikut bentuk card luar (atas ikut lengkung card)"],
        ["square", "Kotak (tanpa rounded)"],
        ["custom", "Bebas: atur tiap sudut"]
      ]},
      { path: "theme.bannerRadius", label: "Radius sudut (px)", type: "range", min: 0, max: 60, step: 1,
        when: isOneOf("theme.bannerRadiusMode", ["all", "bottom", "top"]) },
      { path: "theme.bannerRadiusTL", label: "Kiri atas (px)", type: "range", min: 0, max: 60, step: 1, when: isOneOf("theme.bannerRadiusMode", ["custom"]) },
      { path: "theme.bannerRadiusTR", label: "Kanan atas (px)", type: "range", min: 0, max: 60, step: 1, when: isOneOf("theme.bannerRadiusMode", ["custom"]) },
      { path: "theme.bannerRadiusBR", label: "Kanan bawah (px)", type: "range", min: 0, max: 60, step: 1, when: isOneOf("theme.bannerRadiusMode", ["custom"]) },
      { path: "theme.bannerRadiusBL", label: "Kiri bawah (px)", type: "range", min: 0, max: 60, step: 1, when: isOneOf("theme.bannerRadiusMode", ["custom"]) }
    ]},
    { title: "Media sosial (kanan bawah banner)", fields: [
      { path: "socials.show", label: "Tampilkan ikon media sosial", type: "check" },
      { path: "socials.style", label: "Gaya ikon", type: "select",
        options: [["plain", "Polos"], ["glass", "Dalam kapsul kaca"]] },
      { path: "socials.size", label: "Ukuran ikon (px)", type: "range", min: 12, max: 44, step: 1 },
      { path: "socials.pos", label: "Template posisi", type: "choice", cols: 2, options: [
        ["bottom-right", "Kanan bawah"], ["bottom-center", "Tengah bawah"],
        ["after-avatar", "Di samping foto profil"], ["top-center", "Tengah atas"],
        ["center", "Tengah banner"], ["right-column", "Kolom kanan"],
        ["left-column", "Kolom kiri"], ["custom", "Bebas (hasil seret)"]],
        hint: "Di mode edit, seret ikon sosial langsung di preview untuk memindahkannya." },
      { path: "socials.direction", label: "Arah susunan ikon", type: "select",
        options: [["row", "Mendatar"], ["column", "Menurun"]] },
      { path: "socials.x", label: "Posisi horizontal (%)", type: "range", min: 0, max: 100, step: 1, when: isOneOf("socials.pos", ["custom"]) },
      { path: "socials.y", label: "Posisi vertikal (%)", type: "range", min: 0, max: 100, step: 1, when: isOneOf("socials.pos", ["custom"]) }
    ], list: {
      path: "socials.items", max: 6, itemName: "Ikon",
      blank: function () { return { type: "github", url: "https://github.com" }; },
      fields: function (b) { return [
        { path: b + "type", label: "Platform", type: "select", options: PC.SOCIAL_TYPES },
        { path: b + "url", label: "Link", type: "text", hint: "https://… · mailto:… · tel:…" },
        { type: "image", path: b + "icon", label: "Ikon sendiri", icon: true,
          hint: "PNG/SVG/JPG. Pakai gambar transparan agar bisa diwarnai putih.",
          when: function () { return get(b + "type") === "custom"; } },
        { path: b + "tint", label: "Warnai ikon mengikuti tema (matikan = warna asli gambar)", type: "check",
          when: function () { return get(b + "type") === "custom"; } }
      ]; }
    }},
    { title: "Follow, Following & Followers", fields: [
      { path: "follow.show", label: "Tampilkan tombol Follow", type: "check" },
      { path: "follow.position", label: "Posisi tombol Follow", type: "select",
        options: [["below", "Di bawah banner (kanan)"], ["banner", "Di banner (sebelah ikon sosial)"]] },
      { path: "follow.text", label: "Teks tombol Follow", type: "text" },
      { path: "follow.doneText", label: "Teks setelah di-follow", type: "text" },
      { path: "follow.statsShow", label: "Tampilkan Following & Followers", type: "check" },
      { path: "follow.following", label: "Jumlah Following", type: "text" },
      { path: "follow.followingLabel", label: "Label Following", type: "text" },
      { path: "follow.followers", label: "Jumlah Followers", type: "text", hint: "Klik Follow di preview → angka Followers bertambah 1." },
      { path: "follow.followersLabel", label: "Label Followers", type: "text" }
    ]},
    { title: "Link (di bawah Following/Followers)", fields: [
      { path: "links.show", label: "Tampilkan link", type: "check" }
    ], list: {
      path: "links.items", max: 5, itemName: "Link",
      blank: function () { return { text: "Portfolio", url: "https://", icon: "star", style: "pill", mode: "gradient", color1: "#7c5cff", color2: "#4f8bff", textColor: "#ffffff" }; },
      fields: function (b) { return [
        { path: b + "text", label: "Teks", type: "text" },
        { path: b + "url", label: "URL", type: "text", hint: "Kosongkan = pakai teks. Contoh: https://namakamu.com" },
        { path: b + "icon", label: "Ikon", type: "select", options: PC.LINK_ICONS },
        { path: b + "style", label: "Tampilan", type: "select", options: [["text", "Teks biasa"], ["pill", "Tombol (pill)"]] },
        { path: b + "mode", label: "Warna", type: "select",
          options: [["auto", "Otomatis (ikut tema)"], ["solid", "Solid (1 warna)"], ["gradient", "Gradient (2 warna)"]],
          hint: "Pada tombol, \"Otomatis\" dipakai sebagai solid dengan Warna 1." },
        { path: b + "color1", label: "Warna 1", type: "color", when: function () { return get(b + "mode") !== "auto" || get(b + "style") === "pill"; } },
        { path: b + "color2", label: "Warna 2", type: "color", when: isGrad(b + "mode") },
        { path: b + "textColor", label: "Warna teks tombol", type: "color", when: function () { return get(b + "style") === "pill"; } }
      ]; }
    }},
    { title: "Tombol simpan (bookmark)", fields: [
      { path: "bookmark.show", label: "Tampilkan tombol simpan", type: "check" }
    ]},
    { title: "More Info (panel buka ke bawah)", fields: [
      { path: "cta.show", label: "Tampilkan tombol More Info", type: "check" },
      { path: "cta.text", label: "Teks tombol", type: "text" },
      { path: "cta.defaultOpen", label: "Terbuka saat halaman dimuat", type: "check" },
      { path: "cta.shapeMode", label: "Warna bentuk tombol", type: "select",
        options: [["glass", "Glass morphism (awal)"], ["solid", "Solid"], ["gradient", "Gradient"]] },
      { path: "cta.shapeColor1", label: "Warna bentuk 1", type: "color", when: isOneOf("cta.shapeMode", ["solid", "gradient"]) },
      { path: "cta.shapeColor2", label: "Warna bentuk 2", type: "color", when: isGrad("cta.shapeMode") },
      { path: "cta.textMode", label: "Warna teks tombol", type: "select",
        options: [["auto", "Otomatis (ikut tema)"], ["solid", "Solid"], ["gradient", "Gradient"]] },
      { path: "cta.textColor1", label: "Warna teks 1", type: "color", when: isOneOf("cta.textMode", ["solid", "gradient"]) },
      { path: "cta.textColor2", label: "Warna teks 2", type: "color", when: isGrad("cta.textMode") },
      { path: "cta.about", label: "Teks tambahan di panel", type: "textarea" }
    ], list: {
      path: "cta.items", max: 6, itemName: "Info",
      blank: function () { return { label: "Label", value: "Isi" }; },
      fields: function (b) { return [
        { path: b + "label", label: "Label", type: "text" },
        { path: b + "value", label: "Isi", type: "text" }
      ]; }
    }, after: [
      { path: "cta.actionShow", label: "Tampilkan tombol aksi di panel", type: "check" },
      { path: "cta.actionText", label: "Teks tombol aksi", type: "text" },
      { path: "cta.actionUrl", label: "Link tombol aksi", type: "text", hint: "https://wa.me/62812…  ·  mailto:email@domain.com" }
    ]},
    { title: "Tema gelap / terang & font", fields: [
      { path: "theme.mode", label: "Tema awal", type: "select",
        options: [["dark", "Gelap"], ["light", "Terang"], ["system", "Ikuti sistem perangkat"]],
        hint: "Pengunjung bisa mengganti lewat ikon matahari/bulan di pojok kiri atas banner." },
      { path: "theme.fontFamily", label: "Font", type: "select", options: PC.FONTS,
        hint: "Dimuat dari Google Fonts (perlu internet)." },
      { path: "theme.accent", label: "Warna aksen (tombol simpan)", type: "color" }
    ]},
    { title: "Warna — Tema Terang", mode: "light", fields: paletteFields("light") },
    { title: "Warna — Tema Gelap", mode: "dark", fields: paletteFields("dark") },
    { title: "Background halaman", fields: [
      { path: "theme.bgMode", label: "Jenis background", type: "select",
        options: [["orbs", "Glass (orb warna blur)"], ["image", "Gambar upload"], ["solid", "Satu warna"]] },
      { type: "image", key: "background", path: "assets.background", label: "Upload gambar background",
        hint: "JPG/PNG. Otomatis mengaktifkan jenis \"Gambar upload\".",
        when: isOneOf("theme.bgMode", ["image"]) },
      { path: "theme.bgBlur", label: "Blur gambar (px)", type: "range", min: 0, max: 30, step: 1, when: isOneOf("theme.bgMode", ["image"]) },
      { path: "theme.bgDim", label: "Gelapkan gambar", type: "range", min: 0, max: 0.8, step: 0.05, when: isOneOf("theme.bgMode", ["image"]) },
      { path: "theme.orbAnimate", label: "Animasikan orb", type: "check", when: isOneOf("theme.bgMode", ["orbs"]) },
      { path: "theme.glassBlur", label: "Blur kaca pada kartu (px)", type: "range", min: 0, max: 40, step: 1 }
    ]},
    { title: "Semua gambar", custom: "images" },
    { title: "Bentuk kartu", fields: [
      { path: "theme.cardWidth", label: "Lebar kartu (px)", type: "range", min: 240, max: 480, step: 5 },
      { path: "theme.cardRadius", label: "Sudut kartu (px)", type: "range", min: 0, max: 48, step: 1 },
      { path: "theme.cardBorderWidth", label: "Tebal garis tepi kartu (px)", type: "range", min: 0, max: 6, step: 1 },
      { path: "theme.shadow", label: "Bayangan kartu", type: "check" }
    ]},
    { title: "Info halaman (tab & SEO)", fields: [
      { path: "meta.title", label: "Judul tab", type: "text" },
      { path: "meta.description", label: "Deskripsi", type: "textarea" },
      { path: "meta.lang", label: "Kode bahasa", type: "text", hint: "id, en, …" }
    ]}
  ];

  /* ---------- helpers UI ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  function setStatus(msg, err) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("err", !!err);
  }

  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  var uid = 0;
  function nextId() { return "f" + (++uid); }

  /* ---------- state ---------- */
  var saveTimer;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var ok = PC.saveDraft(cfg);
      setStatus(ok ? "Draft tersimpan di browser ini (buka index dengan tombol “Buka index”)."
                   : "Gagal menyimpan draft (storage penuh?). Gunakan Export ZIP.", !ok);
    }, 250);
  }

  function refresh() {
    PC.applyTheme(shell, cfg);
    PC.render(cardEl, cfg);
    PC.applyMeta(cfg);
    document.title = "Demo — " + (cfg.profile.name || "Profile Card");
    scheduleSave();
  }

  function setValue(path, val, opts) {
    PC.setPath(cfg, path, val);
    // Mengubah "Tema awal" -> preview langsung pakai tema itu
    if (path === "theme.mode") PC.runtime.mode = null;
    // Mengubah warna terang/gelap -> preview pindah ke tema yang sedang diedit
    var m = /^theme\.(light|dark)\./.exec(path);
    if (m) PC.runtime.mode = m[1];
    if (path === "cta.defaultOpen") PC.runtime.open = null;
    if (opts && opts.noRender) { PC.applyMeta(cfg); scheduleSave(); }
    else refresh();
    updateWhen();
    if (!opts || !opts.keepPanel) syncPanel();
  }

  /* ---------- builder form ---------- */
  var whenList = [];
  var orderBox = null;
  var choices = [];

  function updateWhen() {
    whenList = whenList.filter(function (w) { return w.node.isConnected; });
    whenList.forEach(function (w) {
      var show = true;
      try { show = !!w.fn(); } catch (e) {}
      w.node.classList.toggle("hidden", !show);
    });
  }

  function fieldControl(f) {
    var node = f.type === "image" ? imageField(f) : baseControl(f);
    if (f.when) { whenList.push({ node: node, fn: f.when }); }
    return node;
  }

  function baseControl(f) {
    var id = nextId();
    var path = f.path;
    var wrap, input;

    if (f.type === "check") {
      input = h("input", { type: "checkbox", id: id, "data-path": path });
      input.addEventListener("change", function () { setValue(path, input.checked, { keepPanel: true }); });
      wrap = h("div", { class: "field check" }, [input, h("label", { for: id, text: f.label })]);
      return wrap;
    }

    var ctrl, extra = null;
    if (f.type === "text") {
      input = h("input", { type: "text", id: id, "data-path": path, autocomplete: "off" });
      input.addEventListener("input", function () { setValue(path, input.value, { keepPanel: true }); });
      ctrl = input;
    } else if (f.type === "textarea") {
      input = h("textarea", { id: id, "data-path": path, rows: "4" });
      input.addEventListener("input", function () { setValue(path, input.value, { keepPanel: true }); });
      ctrl = input;
    } else if (f.type === "select") {
      input = h("select", { id: id, "data-path": path }, f.options.map(function (o) { return h("option", { value: o[0], text: o[1] }); }));
      input.addEventListener("change", function () { setValue(path, input.value, { keepPanel: true }); });
      ctrl = input;
    } else if (f.type === "range") {
      input = h("input", { type: "range", id: id, "data-path": path, min: f.min, max: f.max, step: f.step });
      var out = h("output", { for: id });
      input.addEventListener("input", function () {
        out.textContent = input.value + (f.suffix || "");
        setValue(path, parseFloat(input.value), { keepPanel: true });
      });
      input._out = out;
      input._suffix = f.suffix || "";
      ctrl = h("div", { class: "range-row" }, [input, out]);
      if (f.presets) {
        extra = h("div", { class: "preset-row" }, f.presets.map(function (pr) {
          var b = h("button", { type: "button", class: "btn", text: pr[0] });
          b.addEventListener("click", function () { setValue(path, pr[1]); });
          return b;
        }));
      }
    } else if (f.type === "choice") {
      var grp = h("div", { class: "choice", style: "grid-template-columns:repeat(" + (f.cols || 2) + ",1fr)" });
      f.options.forEach(function (o) {
        var bt = h("button", { type: "button", "data-val": o[0], text: o[1] });
        bt.addEventListener("click", function () { setValue(path, o[0]); });
        grp.appendChild(bt);
      });
      grp._path = path;
      choices.push(grp);
      ctrl = grp;
    } else if (f.type === "color") {
      input = h("input", { type: "color", id: id, "data-path": path, "aria-label": f.label });
      var hex = h("input", { type: "text", "data-path-hex": path, maxlength: "7", spellcheck: "false", "aria-label": f.label + " (hex)" });
      input.addEventListener("input", function () { hex.value = input.value; setValue(path, input.value, { keepPanel: true }); });
      hex.addEventListener("input", function () {
        var v = hex.value.trim();
        if (v && v[0] !== "#") v = "#" + v;
        if (/^#[0-9a-f]{6}$/i.test(v)) { input.value = v.toLowerCase(); setValue(path, v.toLowerCase(), { keepPanel: true }); }
      });
      ctrl = h("div", { class: "color-row" }, [input, hex]);
    }

    return h("div", { class: "field" }, [
      h("label", { for: id, text: f.label }),
      ctrl,
      extra,
      f.hint ? h("small", { text: f.hint }) : null
    ]);
  }

  /* field gambar: thumbnail + path/URL + Upload + Reset */
  function imageField(f) {
    var path = f.path;
    var key = f.key || null;                    // kunci aset (assets.*) atau null = ikon sendiri
    var id = nextId();
    var thumb = h("img", { alt: "", "data-thumb": path });
    var txt = h("input", { type: "text", id: id, "data-path": path, spellcheck: "false", autocomplete: "off" });
    txt.addEventListener("input", function () { setValue(path, txt.value.trim(), { keepPanel: true }); updateThumbs(); });
    var up = h("button", { type: "button", class: "btn", text: "Upload" });
    up.addEventListener("click", function () { pickImage(key, null, path); });
    var rs = h("button", { type: "button", class: "btn", text: key ? "Reset" : "Hapus" });
    rs.addEventListener("click", function () {
      setValue(path, key ? (DEFAULTS.assets[key] || "") : "");
      updateThumbs();
    });
    return h("div", { class: "field" }, [
      h("label", { for: id, text: f.label }),
      h("div", { class: "img-row" }, [
        h("div", { class: "thumbbox" }, [thumb]),
        txt,
        h("div", { class: "btns" }, [up, rs])
      ]),
      f.hint ? h("small", { text: f.hint }) : null
    ]);
  }

  /* drag & drop berbasis pointer (jalan di mouse & layar sentuh) */
  var dropLine = h("div", { class: "drop-line" });
  dropLine.hidden = true;
  document.body.appendChild(dropLine);

  function startSort(e, itemsFn, fromIdx, onDrop) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    var idx = fromIdx;
    document.body.classList.add("sorting");
    function place(ev) {
      var items = itemsFn();
      if (!items.length) return;
      idx = 0;
      items.forEach(function (it, k) {
        var r = it.getBoundingClientRect();
        if (ev.clientY > r.top + r.height / 2) idx = k + 1;
      });
      var ref = idx < items.length ? items[idx] : items[items.length - 1];
      var rr = ref.getBoundingClientRect();
      dropLine.hidden = false;
      dropLine.style.left = rr.left + "px";
      dropLine.style.width = rr.width + "px";
      dropLine.style.top = (idx < items.length ? rr.top - 4 : rr.bottom + 2) + "px";
    }
    function done() {
      document.removeEventListener("pointermove", place);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
      dropLine.hidden = true;
      document.body.classList.remove("sorting");
    }
    function up() {
      done();
      if (idx !== fromIdx && idx !== fromIdx + 1) onDrop(fromIdx, idx > fromIdx ? idx - 1 : idx);
    }
    document.addEventListener("pointermove", place);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
    place(e);
  }

  /* bagian "Susunan blok": urutan nama / username / bio / stats / link / More Info */
  function buildOrder() {
    var box = h("div", { class: "sec-body order-box" });
    function draw() {
      box.textContent = "";
      box.appendChild(h("small", { text: "Seret ⠿ (atau pakai ↑↓) untuk mengubah susunan. Di mode edit kamu juga bisa menyeret blok langsung di preview." }));
      var order = PC.normalizeOrder(cfg.layout && cfg.layout.order);
      var names = {};
      PC.BLOCKS.forEach(function (b) { names[b[0]] = b[1]; });
      var rows = order.map(function (k, i) {
        var grip = h("span", { class: "grip", title: "Seret", text: "⠿" });
        var up = h("button", { type: "button", class: "mv", text: "↑", title: "Naikkan" });
        var dn = h("button", { type: "button", class: "mv", text: "↓", title: "Turunkan" });
        var row = h("div", { class: "sort-row" }, [grip, h("span", { class: "nm", text: names[k] }), up, dn]);
        up.addEventListener("click", function () { move(i, i - 1); });
        dn.addEventListener("click", function () { move(i, i + 1); });
        grip.addEventListener("pointerdown", function (e) {
          startSort(e, function () { return $$(".sort-row", box); }, i, move);
        });
        return row;
      });
      function move(from, to) {
        if (to < 0 || to >= order.length) return;
        order.splice(to, 0, order.splice(from, 1)[0]);
        setValue("layout.order", order.slice());
        draw();
      }
      rows.forEach(function (r) { box.appendChild(r); });
    }
    box._draw = draw;
    draw();
    return box;
  }

  function buildImages() {
    var box = h("div", { class: "sec-body" });
    IMAGE_FIELDS.forEach(function (f) {
      box.appendChild(imageField({ key: f.key, path: "assets." + f.key, label: f.label, hint: f.hint }));
    });
    return box;
  }

  /* daftar yang bisa ditambah / dihapus */
  function buildList(spec) {
    var box = h("div", { class: "list-box" });
    (PC.getPath(cfg, spec.path) || []).forEach(function (item, i) {
      var base = spec.path + "." + i + ".";
      var rm = h("button", { type: "button", class: "link-btn", text: "Hapus" });
      rm.addEventListener("click", function () {
        PC.getPath(cfg, spec.path).splice(i, 1);
        refresh(); rebuildList(box, spec);
      });
      var grip = h("span", { class: "grip", title: "Seret untuk mengubah urutan", text: "⠿" });
      var up = h("button", { type: "button", class: "mv", title: "Naikkan", text: "↑" });
      var dn = h("button", { type: "button", class: "mv", title: "Turunkan", text: "↓" });
      var moveTo = function (to) {
        var a = PC.getPath(cfg, spec.path);
        if (to < 0 || to >= a.length) return;
        a.splice(to, 0, a.splice(i, 1)[0]);
        refresh(); rebuildList(box, spec);
      };
      up.addEventListener("click", function () { moveTo(i - 1); });
      dn.addEventListener("click", function () { moveTo(i + 1); });
      var card = h("div", { class: "list-card", "data-list-item": spec.path + "." + i }, [
        h("header", {}, [h("span", { class: "ttl" }, [grip, h("span", { text: spec.itemName + " " + (i + 1) })]),
                         h("span", { class: "hbtns" }, [up, dn, rm])])
      ].concat(spec.fields(base).map(fieldControl)));
      grip.addEventListener("pointerdown", function (e) {
        startSort(e, function () { return $$(":scope > .list-card", box); }, i, function (from, to) { moveTo2(from, to); });
      });
      var moveTo2 = function (from, to) {
        var a = PC.getPath(cfg, spec.path);
        a.splice(to, 0, a.splice(from, 1)[0]);
        refresh(); rebuildList(box, spec);
      };
      box.appendChild(card);
    });
    var arr = PC.getPath(cfg, spec.path) || [];
    if (arr.length < spec.max) {
      var add = h("button", { type: "button", class: "btn", text: "+ Tambah " + spec.itemName.toLowerCase() });
      add.addEventListener("click", function () {
        if (!PC.getPath(cfg, spec.path)) PC.setPath(cfg, spec.path, []);
        PC.getPath(cfg, spec.path).push(spec.blank());
        refresh(); rebuildList(box, spec);
      });
      box.appendChild(add);
    } else {
      box.appendChild(h("small", { text: "Maksimal " + spec.max + " " + spec.itemName.toLowerCase() + "." }));
    }
    return box;
  }

  function rebuildList(box, spec) {
    var nu = buildList(spec);
    box.parentNode.replaceChild(nu, box);
    syncPanel();
  }

  function buildPanel() {
    formEl.textContent = "";
    whenList = [];
    choices = [];
    SECTIONS.forEach(function (sec) {
      var d = h("details", { class: "sec" }, [h("summary", { text: sec.title })]);
      if (sec.open) d.setAttribute("open", "");
      if (sec.custom === "images") d.appendChild(buildImages());
      else if (sec.custom === "order") { orderBox = buildOrder(); d.appendChild(orderBox); }
      else {
        var body = h("div", { class: "sec-body" }, (sec.fields || []).map(fieldControl));
        if (sec.list) body.appendChild(buildList(sec.list));
        if (sec.after) sec.after.forEach(function (f) { body.appendChild(fieldControl(f)); });
        d.appendChild(body);
      }
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        // akordeon: hanya satu bagian terbuka (lebih rapi, dan sinkron dengan klik di preview)
        $$("details.sec", formEl).forEach(function (o) { if (o !== d && o.open) o.open = false; });
        if (sec.mode) { PC.runtime.mode = sec.mode; refresh(); } // buka warna terang/gelap -> preview pindah tema itu
      });
      formEl.appendChild(d);
    });
    syncPanel();
  }

  /* panel kiri langsung menuju pengaturan yang dipilih di preview */
  function focusField(path) {
    if (!path) return;
    var inp = formEl.querySelector('[data-path="' + path + '"]') || formEl.querySelector('[data-path-hex="' + path + '"]');
    if (!inp) return;
    var d = inp.closest("details");
    $$("details.sec", formEl).forEach(function (o) { if (o !== d && o.open) o.open = false; });
    if (d && !d.open) d.open = true;
    var f = inp.closest(".field") || inp;
    var panel = $("#panel");
    requestAnimationFrame(function () {
      if (panel.scrollHeight > panel.clientHeight + 4) {
        var pr = panel.getBoundingClientRect(), fr = f.getBoundingClientRect();
        panel.scrollTo({ top: panel.scrollTop + (fr.top - pr.top) - pr.height / 3, behavior: "smooth" });
      }
      f.classList.remove("flash");
      void f.offsetWidth;
      f.classList.add("flash");
    });
  }

  function updateThumbs() {
    $$("[data-thumb]").forEach(function (img) {
      var v = PC.getPath(cfg, img.getAttribute("data-thumb"));
      if (v) img.setAttribute("src", v); else img.removeAttribute("src");
    });
  }

  function syncPanel() {
    $$("[data-path]", formEl).forEach(function (inp) {
      if (inp === document.activeElement) return;
      var v = PC.getPath(cfg, inp.getAttribute("data-path"));
      if (v === undefined) return;
      if (inp.type === "checkbox") inp.checked = v !== false;
      else {
        inp.value = typeof v === "string" && v.indexOf("data:") === 0 ? "(gambar upload — akan jadi file saat Export ZIP)" : v;
        if (inp._out) inp._out.textContent = v + (inp._suffix || "");
      }
    });
    $$("[data-path-hex]", formEl).forEach(function (inp) {
      if (inp === document.activeElement) return;
      var v = PC.getPath(cfg, inp.getAttribute("data-path-hex"));
      if (v !== undefined) inp.value = v;
    });
    choices.forEach(function (g) {
      if (!g.isConnected) return;
      var v = PC.getPath(cfg, g._path);
      $$("button", g).forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-val") === v); });
    });
    updateThumbs();
    updateWhen();
    if (orderBox && orderBox.isConnected && orderBox._draw) orderBox._draw();
  }

  /* ---------- gambar: pilih & proses ---------- */
  var picker = $("#imgPicker");
  var pickCb = null;

  function pickImage(key, done, path) {
    var target = path || ("assets." + key);
    pickCb = function (file) {
      processImage(file, key).then(function (dataUrl) {
        PC.setPath(cfg, target, dataUrl);
        if (key === "banner" && cfg.theme.bannerMode !== "image") cfg.theme.bannerMode = "image";
        if (key === "background") cfg.theme.bgMode = "image";
        refresh(); syncPanel();
        toast("Gambar diganti");
        if (done) done();
      }).catch(function () { toast("Gagal membaca gambar"); });
    };
    picker.value = "";
    picker.click();
  }
  picker.addEventListener("change", function () {
    var f = picker.files && picker.files[0];
    if (f && pickCb) pickCb(f);
  });

  function processImage(file, key) {
    var spec = key ? ASSET_FILES[key] : ICON_SPEC;
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || 128, hgt = img.naturalHeight || 128, sx = 0, sy = 0, sw = w, sh = hgt;
        if (spec.square) { var m = Math.min(w, hgt); sx = (w - m) / 2; sy = (hgt - m) / 2; sw = sh = m; }
        var scale = Math.min(1, spec.max / Math.max(sw, sh));
        var cw = Math.max(1, Math.round(sw * scale)), ch = Math.max(1, Math.round(sh * scale));
        var c = document.createElement("canvas");
        c.width = cw; c.height = ch;
        var ctx = c.getContext("2d");
        if (spec.type === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cw, ch); }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/" + spec.type, 0.9));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
  }

  /* ---------- Edit via klik (sinkron dengan panel kiri) ---------- */
  var editTag = $("#editTag");
  var pop = $("#pop");
  var editing = null;

  function setEditMode(on) {
    editOn = on;
    stage.classList.toggle("edit-on", on);
    $("#stageHint").innerHTML = on
      ? "<b>Mode edit aktif</b> — klik objek untuk mengedit · seret ⠿ untuk memindah blok · seret ikon sosial untuk memindah posisi"
      : "Live preview";
    if (!on) { closePop(); hideTag(); hideGrip(); if (editing) commitEdit(); }
    else { PC.runtime.followed = false; refresh(); } // angka Followers tampil apa adanya saat diedit
  }

  function targetOf(e) {
    var t = e.target.closest ? e.target.closest("[data-edit],[data-panel]") : null;
    return t && cardEl.contains(t) ? t : null;
  }

  function hideTag() { editTag.hidden = true; }

  cardEl.addEventListener("mouseover", function (e) {
    if (!editOn || editing) return;
    var t = targetOf(e);
    if (!t) { hideTag(); return; }
    var r = t.getBoundingClientRect();
    var ty = t.dataset.edit === undefined ? "panel" : t.dataset.type;
    editTag.textContent = (ty === "image" ? "🖼 " : ty === "link" ? "🔗 " : ty === "panel" ? "⚙ " : "✎ ") + (t.dataset.label || "Edit");
    editTag.hidden = false;
    editTag.style.left = Math.max(4, r.left) + "px";
    editTag.style.top = Math.max(4, r.top - 24) + "px";
  });
  cardEl.addEventListener("mouseleave", hideTag);

  // Di mode edit, link di preview tidak boleh bernavigasi
  cardEl.addEventListener("click", function (e) {
    if (!editOn) return;
    var a = e.target.closest ? e.target.closest("a") : null;
    if (a) e.preventDefault();
  });

  cardEl.addEventListener("click", function (e) {
    if (!editOn) return;
    if (justDragged) { e.preventDefault(); e.stopPropagation(); return; }
    var t = targetOf(e);
    if (editing && t === editing) return; // klik di dalam teks yang sedang diedit
    if (editing) commitEdit();
    if (!t) { closePop(); e.preventDefault(); e.stopPropagation(); return; }

    focusField(t.dataset.panel || t.dataset.edit);   // panel kiri langsung ke pengaturan ini

    if (t.dataset.edit === undefined) {              // objek tanpa teks (ring, tombol tema, More Info, …)
      hideTag();
      if (t.dataset.pass) return;                    // tetap boleh dipakai (buka More Info, ganti tema)
      e.preventDefault(); e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    hideTag();
    if (t.dataset.type === "image") openImagePop(t);
    else if (t.dataset.type === "link") openLinkPop(t);
    else startEdit(t);
  }, true);

  // klik area background (di luar kartu) -> atur background
  stage.addEventListener("click", function (e) {
    if (!editOn || cardEl.contains(e.target) || pop.contains(e.target)) return;
    focusField("theme.bgMode");
    openImagePop({
      dataset: { edit: "assets.background", label: "Background halaman" },
      getBoundingClientRect: function () { return { left: e.clientX, top: e.clientY, bottom: e.clientY }; }
    });
  });

  function isMulti(node) { return node.dataset.multiline === "1"; }

  function startEdit(node) {
    closePop();
    var path = node.dataset.edit;
    editing = node;
    node._orig = PC.getPath(cfg, path);
    node.classList.add("editing");
    node.setAttribute("contenteditable", "plaintext-only");
    if (node.contentEditable !== "plaintext-only") node.setAttribute("contenteditable", "true");
    node.focus();
    var range = document.createRange();
    range.selectNodeContents(node);
    var sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    node.addEventListener("keydown", onEditKey);
    node.addEventListener("blur", onEditBlur);
    node.addEventListener("paste", onEditPaste);
  }

  function onEditKey(e) {
    var node = e.currentTarget;
    if (e.key === "Escape") { e.preventDefault(); commitEdit(true); return; }
    if (e.key === "Enter") {
      // bio / teks panjang: Enter = baris baru, Ctrl/⌘+Enter = simpan
      if (isMulti(node) && !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault(); commitEdit();
    }
  }
  function onEditBlur() { commitEdit(false, true); }
  function onEditPaste(e) {
    e.preventDefault();
    var txt = (e.clipboardData || window.clipboardData).getData("text");
    if (!isMulti(e.currentTarget)) txt = txt.replace(/\s*\n\s*/g, " ");
    document.execCommand("insertText", false, txt);
  }

  function commitEdit(cancel, fromBlur) {
    var node = editing;
    if (!node) return;
    editing = null;
    node.removeEventListener("keydown", onEditKey);
    node.removeEventListener("blur", onEditBlur);
    node.removeEventListener("paste", onEditPaste);
    var path = node.dataset.edit;
    var val;
    if (cancel) val = node._orig;
    else if (isMulti(node)) val = (node.innerText || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    else val = node.textContent.replace(/\s+/g, " ").trim();
    if (fromBlur) {
      // Fokus pindah karena user mengklik hal lain: simpan tanpa langsung merender ulang kartu,
      // supaya klik berikutnya tidak hilang. Render ulang menyusul bila tidak ada edit baru.
      node.classList.remove("editing");
      node.removeAttribute("contenteditable");
      node.textContent = val;
      setValue(path, val, { noRender: true });
      setTimeout(function () { if (!editing) refresh(); }, 300);
      return;
    }
    setValue(path, val); // re-render + sinkron panel
  }

  /* popover gambar */
  function closePop() { pop.hidden = true; pop.textContent = ""; }

  function placePop(node, height) {
    pop.hidden = false;
    var r = node.getBoundingClientRect();
    var left = Math.min(Math.max(8, r.left), window.innerWidth - 290);
    var top = r.bottom + 8;
    if (top + height > window.innerHeight) top = Math.max(8, r.top - (height + 8));
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function openImagePop(node) {
    var path = node.dataset.edit;           // mis. assets.profile
    var key = path.split(".")[1];
    var label = node.dataset.label;
    pop.textContent = "";
    var url = h("input", { type: "text", placeholder: "assets/…  atau  https://…", spellcheck: "false" });
    var cur = PC.getPath(cfg, path) || "";
    url.value = cur.indexOf("data:") === 0 ? "" : cur;
    var upload = h("button", { type: "button", class: "btn primary", text: "Upload gambar…" });
    var apply = h("button", { type: "button", class: "btn", text: "OK" });
    var reset = h("button", { type: "button", class: "btn", text: "Reset" });
    var close = h("button", { type: "button", class: "btn ghost", text: "Tutup" });
    upload.addEventListener("click", function () { pickImage(key, closePop); });
    apply.addEventListener("click", function () {
      setValue(path, url.value.trim());
      if (key === "banner" && url.value.trim()) setValue("theme.bannerMode", "image");
      if (key === "background" && url.value.trim()) setValue("theme.bgMode", "image");
      closePop();
    });
    url.addEventListener("keydown", function (e) { if (e.key === "Enter") apply.click(); });
    reset.addEventListener("click", function () { setValue(path, DEFAULTS.assets[key] || ""); closePop(); });
    close.addEventListener("click", closePop);
    var parts = [h("h4", { text: label }), upload,
     h("div", { class: "row" }, [url, apply]),
     h("div", { class: "row" }, [reset, close])];
    if (/^verified/.test(key)) {
      var tin = h("input", { type: "text", placeholder: "Teks saat diklik", spellcheck: "false" });
      tin.value = cfg.profile.verifiedText || "";
      tin.addEventListener("input", function () { setValue("profile.verifiedText", tin.value, { keepPanel: true }); });
      parts.push(h("h4", { text: "Teks yang muncul di atas ikon" }), h("div", { class: "row" }, [tin]));
    }
    parts.forEach(function (n) { pop.appendChild(n); });
    placePop(node, /^verified/.test(key) ? 250 : 170);
    url.focus();
  }

  /* popover link (ikon sosial) */
  function openLinkPop(node) {
    var path = node.dataset.edit;           // mis. socials.items.0.url
    pop.textContent = "";
    var url = h("input", { type: "text", placeholder: "https://…  ·  mailto:…", spellcheck: "false" });
    url.value = PC.getPath(cfg, path) || "";
    var apply = h("button", { type: "button", class: "btn primary", text: "OK" });
    var close = h("button", { type: "button", class: "btn ghost", text: "Tutup" });
    apply.addEventListener("click", function () { setValue(path, url.value.trim()); closePop(); });
    url.addEventListener("keydown", function (e) { if (e.key === "Enter") apply.click(); });
    close.addEventListener("click", closePop);
    [h("h4", { text: node.dataset.label }),
     h("div", { class: "row" }, [url, apply]),
     h("div", { class: "row" }, [close])].forEach(function (n) { pop.appendChild(n); });
    placePop(node, 130);
    url.focus();
    url.select();
  }

  document.addEventListener("mousedown", function (e) {
    if (!pop.hidden && !pop.contains(e.target) && !(cardEl.contains(e.target) && targetOf(e))) closePop();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
  window.addEventListener("resize", closePop);
  stage.addEventListener("scroll", function () { closePop(); hideTag(); });

  $("#editToggle").addEventListener("change", function (e) { setEditMode(e.target.checked); });

  /* ---------- drag & drop langsung di preview (mode edit) ---------- */
  var gripEl = h("div", { class: "block-grip", title: "Seret untuk memindah blok", text: "⠿" });
  gripEl.hidden = true;
  document.body.appendChild(gripEl);
  var gripFor = null, gripHover = false, gripTimer = null;

  function hideGrip() { gripEl.hidden = true; gripFor = null; }
  function showGrip(b) {
    clearTimeout(gripTimer);
    var r = b.getBoundingClientRect(), cr = cardEl.getBoundingClientRect();
    gripFor = b;
    gripEl.hidden = false;
    gripEl.style.left = Math.max(cr.left + 3, r.left - 24) + "px";
    gripEl.style.top = (r.top + Math.min(r.height / 2, 16) - 12) + "px";
  }
  cardEl.addEventListener("mouseover", function (e) {
    if (!editOn || editing || document.body.classList.contains("sorting")) return;
    var b = e.target.closest ? e.target.closest("[data-block]") : null;
    if (b && cardEl.contains(b)) showGrip(b);
  });
  cardEl.addEventListener("mouseleave", function () {
    clearTimeout(gripTimer);
    gripTimer = setTimeout(function () { if (!gripHover) hideGrip(); }, 160);
  });
  gripEl.addEventListener("mouseenter", function () { gripHover = true; clearTimeout(gripTimer); });
  gripEl.addEventListener("mouseleave", function () { gripHover = false; hideGrip(); });

  gripEl.addEventListener("pointerdown", function (e) {
    if (!gripFor) return;
    var nodes = function () { return $$("[data-block]", cardEl); };
    var from = nodes().indexOf(gripFor);
    if (from < 0) return;
    hideTag();
    startSort(e, nodes, from, function (f, t) {
      var keys = nodes().map(function (n) { return n.dataset.block; });
      var moved = keys.slice();
      moved.splice(t, 0, moved.splice(f, 1)[0]);
      var full = PC.normalizeOrder(cfg.layout && cfg.layout.order), k = 0;
      if (!cfg.layout) cfg.layout = {};
      setValue("layout.order", full.map(function (x) { return keys.indexOf(x) !== -1 ? moved[k++] : x; }));
      hideGrip();
    });
  });

  /* seret ikon sosial untuk memindah posisinya */
  var sdrag = null, justDragged = false;
  cardEl.addEventListener("pointerdown", function (e) {
    if (!editOn || editing || (e.button !== undefined && e.button !== 0)) return;
    var soc = e.target.closest ? e.target.closest(".socials") : null;
    if (!soc || !cardEl.contains(soc)) return;
    var r = soc.getBoundingClientRect();
    sdrag = { x: e.clientX, y: e.clientY, ox: e.clientX - (r.left + r.width / 2), oy: e.clientY - (r.top + r.height / 2), moved: false };
    document.addEventListener("pointermove", sMove);
    document.addEventListener("pointerup", sUp);
    document.addEventListener("pointercancel", sUp);
  }, true);

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function sMove(ev) {
    if (!sdrag) return;
    var br = cardEl.querySelector(".banner-box").getBoundingClientRect();
    if (!sdrag.moved) {
      if (Math.hypot(ev.clientX - sdrag.x, ev.clientY - sdrag.y) < 6) return;
      sdrag.moved = true;
      hideTag(); closePop(); hideGrip();
      var cur = cardEl.querySelector(".socials").getBoundingClientRect();   // mulai dari posisi sekarang
      cfg.socials.x = Math.round((cur.left + cur.width / 2 - br.left) / br.width * 1000) / 10;
      cfg.socials.y = Math.round((cur.top + cur.height / 2 - br.top) / br.height * 1000) / 10;
      cfg.socials.pos = "custom";
      refresh();
      var n = cardEl.querySelector(".socials");
      if (n) n.classList.add("dragging");
    }
    var x = clamp((ev.clientX - sdrag.ox - br.left) / br.width * 100, 0, 100);
    var y = clamp((ev.clientY - sdrag.oy - br.top) / br.height * 100, 0, 100);
    if (Math.abs(x - 50) < 2.5) x = 50;          // magnet ke garis tengah
    if (Math.abs(y - 50) < 2.5) y = 50;
    x = Math.round(x * 10) / 10; y = Math.round(y * 10) / 10;
    cfg.socials.x = x; cfg.socials.y = y;
    shell.style.setProperty("--sx", x + "%");
    shell.style.setProperty("--sy", y + "%");
  }

  function sUp() {
    document.removeEventListener("pointermove", sMove);
    document.removeEventListener("pointerup", sUp);
    document.removeEventListener("pointercancel", sUp);
    if (sdrag && sdrag.moved) {
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 80);
      var n = cardEl.querySelector(".socials");
      if (n) n.classList.remove("dragging");
      scheduleSave();
      syncPanel();
    }
    sdrag = null;
  }

  /* ---------- lebar preview ---------- */
  $$(".seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".seg button").forEach(function (x) { x.classList.toggle("on", x === b); });
      var w = parseInt(b.dataset.w, 10);
      var inner = $("#stageInner");
      inner.classList.toggle("fixed", w > 0);
      if (w > 0) inner.style.setProperty("--vw", w + "px"); else inner.style.removeProperty("--vw");
    });
  });

  /* ---------- export ---------- */
  function exportCfg() {
    // Ganti gambar upload (data URL) dengan path standar; kembalikan daftar file-nya.
    var out = PC.clone(cfg);
    var files = [];
    Object.keys(ASSET_FILES).forEach(function (k) {
      var v = out.assets[k];
      if (typeof v === "string" && v.indexOf("data:") === 0) {
        files.push({ path: ASSET_FILES[k].path, data: dataUrlToBytes(v) });
        out.assets[k] = ASSET_FILES[k].path;
      }
    });
    return { cfg: out, files: files };
  }

  function configJs(c) {
    return "/**\n * CONFIG UTAMA — dibuat dari demo.html (" + new Date().toISOString().slice(0, 10) + ")\n" +
      " * Timpa file js/config.js dengan file ini.\n */\n" +
      "window.PROFILE_CONFIG = " + JSON.stringify(c, null, 2) + ";\n";
  }

  function dataUrlToBytes(u) {
    var b64 = u.split(",")[1], bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  function download(name, blob) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ZIP sederhana (tanpa kompresi) */
  var CRC_TABLE = (function () {
    var t = [], c, n, k;
    for (n = 0; n < 256; n++) {
      c = n;
      for (k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function makeZip(entries) {
    var enc = new TextEncoder(), parts = [], central = [], offset = 0;
    var d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    entries.forEach(function (e) {
      var name = enc.encode(e.path), data = e.data, crc = crc32(data);
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    var cdSize = central.reduce(function (n, p) { return n + p.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: "application/zip" });
  }

  $("#btnZip").addEventListener("click", function () {
    var x = exportCfg();
    var entries = [{ path: "js/config.js", data: new TextEncoder().encode(configJs(x.cfg)) }].concat(x.files);
    download("profile-config.zip", makeZip(entries));
    toast("ZIP berisi js/config.js" + (x.files.length ? " + " + x.files.length + " gambar" : "") + " — ekstrak ke folder project");
  });

  $("#btnJs").addEventListener("click", function () {
    var x = exportCfg();
    download("config.js", new Blob([configJs(x.cfg)], { type: "text/javascript" }));
    toast(x.files.length ? "Ada gambar upload — pakai Export ZIP supaya file gambarnya ikut" : "config.js diunduh → taruh di folder js/");
  });

  $("#btnCopy").addEventListener("click", function () {
    var txt = JSON.stringify(exportCfg().cfg, null, 2);
    function fallback() {
      var ta = h("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("JSON disalin"); } catch (e) { toast("Gagal menyalin"); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(function () { toast("JSON disalin"); }, fallback);
    else fallback();
  });

  $("#btnImport").addEventListener("click", function () { $("#importFile").click(); });
  $("#importFile").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var s = String(r.result);
        var obj = JSON.parse(s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1));
        cfg = PC.merge(DEFAULTS, obj);
        refresh(); buildPanel();
        toast("Config diimpor");
      } catch (err) { toast("File tidak valid (harus JSON / config.js hasil export)"); }
    };
    r.readAsText(f);
    e.target.value = "";
  });

  $("#btnReset").addEventListener("click", function () {
    if (!confirm("Kembalikan semua ke isi js/config.js dan hapus draft?")) return;
    PC.clearDraft();
    cfg = PC.clone(DEFAULTS);
    refresh(); buildPanel();
    setStatus("Draft dihapus.");
    toast("Direset");
  });

  /* ---------- init ---------- */
  buildPanel();
  PC.applyTheme(shell, cfg);
  PC.render(cardEl, cfg);
  PC.applyMeta(cfg);
})();
