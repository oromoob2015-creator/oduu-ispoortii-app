# Oduu Ispoortii PWA 📱⚽
**Afaan Oromoo — Black / Red / White**

---

## 📁 Faayilootaa (Files)
```
index.html                    ← App guutuu
manifest.json                 ← PWA config
sw.js                         ← Service Worker (offline)
netlify.toml                  ← Netlify config
netlify/functions/feed.js     ← Server-side YouTube proxy ✅
```

---

## 🚀 Maaliif Netlify Function?

YouTube RSS feed kallattumaan browser irraa deebii kennuu didu (**CORS block**).
Kanaaf **Netlify Function** (server-side code) fayyadamna — server keenya YouTube irraa feed
feti'ee gara app tti dabarsina. Browser YouTube arguu hin danda'u, kanaaf hin dhorkamu!

```
App (Browser) → /.netlify/functions/feed → YouTube RSS ✅
```

---

## 🔧 Akkamitti Deploy Godhuu (Free — Daqiiqaa 3!)

### Tartiiba:

1. **GitHub** → https://github.com/new → Repository haaraa uumi  
   (`oduu-ispoortii-app` jedhii)

2. Faayilootaa **hundinuu** upload godhaa:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `netlify.toml`
   - `netlify/functions/feed.js` ← **kun baay'ee barbaachisaa dha!**

3. **Netlify** → https://netlify.com → Signup → **"Import from GitHub"**

4. Repository kee filadhu → **Deploy** tuqi

5. URL argatta: `https://oduu-ispoortii.netlify.app` ✅

---

## 📲 Maashina Android irratti Akkamitti Install Godhuu

1. URL Chrome browser keessatti bani
2. Chrome: **"Add to Home screen"** bar ni agarta
3. Tuqi → icon home screen irratti mul'ata
4. App akka native appiitti bana — fullscreen, browser bar hin qabu!

---

## ✅ Features
- 📺 YouTube channel keetii irraa viidiyoo haaraa automatically feta
- 🔍 Viidiyoo barbaada / search
- 🎬 In-app player (modal)
- 📰 Ticker oduu gubbaa
- 📲 Installable Android PWA
- 🌐 Offline support (service worker)
- 🔴⚫⬜ Black / Red / White branding

---

*Built with ❤️ for Oduu Ispoortii*
