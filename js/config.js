/**
 * CONFIG UTAMA — dibuat dari demo.html (2026-11-22)
 * Timpa file js/config.js dengan file ini.
 */
window.PROFILE_CONFIG = {
  "meta": {
    "lang": "id",
    "title": "Fikri Saputra — Profile Card",
    "description": "Kartu profil Fikri Saputra, Creative Designer."
  },
  "assets": {
    "profile": "assets/profile/ProfileArt.png",
    "banner": "assets/banner/bannerfixs.png",
    "thumb": "assets/thumb/thumb.jpg",
    "verified": "assets/icon/verified.png",
    "verifiedWhite": "assets/icon/verified-white.png",
    "background": ""
  },
  "profile": {
    "name": "Fikri Saputra",
    "username": "@fikrisaputra",
    "description": "Creative Designer - Web Design",
    "verified": true,
    "verifiedStyle": "default",
    "verifiedText": "Verified",
    "verifiedSize": 20,
    "verifiedPos": "before",
    "badgeAlign": "center",
    "labels": {
      "show": true,
      "items": []
    }
  },
  "avatar": {
    "ring": {
      "show": false,
      "mode": "gradient",
      "color1": "#7c5cff",
      "color2": "#ff7ab8",
      "angle": 135,
      "width": 3,
      "gap": 3
    }
  },
  "layout": {
    "order": [
      "name",
      "handle",
      "desc",
      "stats",
      "links",
      "more"
    ]
  },
  "bookmark": {
    "show": true
  },
  "socials": {
    "show": true,
    "style": "plain",
    "size": 22,
    "pos": "bottom-right",
    "direction": "row",
    "x": 50,
    "y": 50,
    "items": [
      {
        "type": "email",
        "url": "https://youtube.com",
        "icon": "data:image/png;base64,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"
      },
      {
        "type": "instagram",
        "url": "https://instagram.com"
      },
      {
        "type": "custom",
        "url": "https://tiktok.com",
        "icon": "data:image/png;base64,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"
      },
      {
        "type": "custom",
        "url": "https://wa.me/6281234567890",
        "icon": "data:image/png;base64,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"
      }
    ]
  },
  "follow": {
    "show": true,
    "position": "below",
    "text": "Follow",
    "doneText": "Followed",
    "statsShow": true,
    "following": "1",
    "followingLabel": "Following",
    "followers": "99K",
    "followersLabel": "Followers"
  },
  "links": {
    "show": true,
    "items": [
      {
        "text": "fikrisaputra",
        "url": "https://fikrispt.github.io/",
        "icon": "link",
        "style": "text",
        "mode": "auto",
        "color1": "#5aa9ff",
        "color2": "#a78bfa",
        "textColor": "#ffffff"
      },
      {
        "text": "fixs.arts",
        "url": "https://instagram.com/fixs.arts",
        "icon": "link",
        "style": "text",
        "mode": "auto",
        "color1": "#7c5cff",
        "color2": "#4f8bff",
        "textColor": "#ffffff"
      }
    ]
  },
  "cta": {
    "show": true,
    "text": "More Info",
    "defaultOpen": false,
    "shapeMode": "glass",
    "shapeColor1": "#7c5cff",
    "shapeColor2": "#5b34e6",
    "textMode": "auto",
    "textColor1": "#ffffff",
    "textColor2": "#c4b5fd",
    "about": "Freelance : Visual Design",
    "items": [
      {
        "label": "Tools",
        "value": "★ 5.0 Adobe Photoshop "
      },
      {
        "label": "Rating",
        "value": "★ 5.0"
      },
      {
        "label": "Pengalaman",
        "value": "5 Tahun"
      }
    ],
    "actionShow": true,
    "actionText": "Hubungi Saya",
    "actionUrl": "mailto:hello@fikrisaputra.com"
  },
  "theme": {
    "mode": "dark",
    "accent": "#7c5cff",
    "fontFamily": "Lato",
    "bgMode": "orbs",
    "bgBlur": 0,
    "bgDim": 0.15,
    "glassBlur": 35,
    "orbAnimate": true,
    "light": {
      "pageBg": "#f1f0fb",
      "orb1": "#a8beff",
      "orb2": "#94d1ff",
      "orb3": "#d1f1ff",
      "cardBg": "#ffffff",
      "cardOpacity": 0.85,
      "cardBorder": "#ffffff",
      "cardBorderOpacity": 0.7,
      "textColor": "#111827",
      "mutedColor": "#6b7280",
      "linkColor": "#2563eb",
      "followBg": "#111827",
      "followText": "#ffffff"
    },
    "dark": {
      "pageBg": "#0b0a14",
      "orb1": "#04549f",
      "orb2": "#2e158a",
      "orb3": "#144e99",
      "cardBg": "#241f3d",
      "cardOpacity": 0.9,
      "cardBorder": "#ffffff",
      "cardBorderOpacity": 0.15,
      "textColor": "#f5f5f7",
      "mutedColor": "#9a9aa6",
      "linkColor": "#5aa9ff",
      "followBg": "#ebebeb",
      "followText": "#1c1c1e"
    },
    "bannerMode": "image",
    "bannerColor1": "#00ffdd",
    "bannerColor2": "#ff99aa",
    "bannerColor3": "#ffd36b",
    "bannerAnimate": true,
    "bannerSpeed": 6,
    "bannerHeight": 190,
    "bannerInset": 8,
    "bannerRadiusMode": "all",
    "bannerRadius": 20,
    "bannerRadiusTL": 20,
    "bannerRadiusTR": 20,
    "bannerRadiusBR": 20,
    "bannerRadiusBL": 20,
    "cardWidth": 360,
    "cardRadius": 25,
    "cardBorderWidth": 1,
    "avatarSize": 84,
    "avatarRadius": 50,
    "shadow": true
  }
};
