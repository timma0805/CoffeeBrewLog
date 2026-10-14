(() => {
"use strict";
/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const r5 = v => Math.round(v / 5) * 5;
const fmtT = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const parseT = t => { if (!t) return null; const m = String(t).trim().match(/^(\d+):(\d{1,2})$/); if (m) return +m[1] * 60 + +m[2]; const n = parseFloat(t); return isNaN(n) ? null : Math.round(n); };
const today = () => new Date().toISOString().slice(0, 10);
const daysSince = d => d ? Math.floor((Date.now() - new Date(d + "T12:00:00").getTime()) / 864e5) : null;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ---------------- i18n ---------------- */
const pl = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const I18N = {
en: {
  signIn: "Sign in", signInGoogle: "Sign in with Google to sync", signOut: "Sign out", account: "Account", syncedNote: "Your log syncs across your devices.",
  "notice.signin": "Saving on this device only.", "notice.fbFail": "Couldn't reach the sync service. Saving on this device for now.",
  "toast.synced": "This device's beans were added to your account", "toast.signinErr": "Couldn't sign in ({code}).",
  "toast.badBackup": "That file isn't an Origami Brew Log backup.", "toast.imported": "Imported {n} items",
  backupTitle: "Backup", backupCloud: "Your log is saved to your Google account. You can also keep a copy as a file.", backupLocal: "Your log lives in this browser. Export a file to keep a copy or move it to another device.",
  exportBtn: "Export file", importBackupBtn: "Import file",
  importHelp: "Paste a product link or scan the QR code on the bag, and the details fill in automatically.",
  "im.fetching": "Reading the page…", "im.fetchFail": "Couldn't read that page. Check the link, or paste the page text below.",
  "im.camDenied": "Camera access was blocked. Allow the camera for this site, or use a photo instead.",
  scanTitle: "Scan the QR code", scanHint: "Point at the QR code on the bag. It scans automatically.", scanPhoto: "Use a photo instead",
  fav: "Favourite", diff: "Difficulty", notRated: "Not rated", tapClear: "tap again to clear",
  favLv: ["Not for me", "It's okay", "Good", "Love it", "All-time favourite"], diffLv: ["Easy to dial in", "Fairly easy", "Moderate", "Tricky", "Very tricky"],
  sortBy: "Sort", "sort.newest": "Newest", "sort.fav": "Favourites first", "sort.easy": "Easiest first", "sort.hard": "Hardest first",
  heroEyebrow: "Next brew", shelfTitle: "Your coffee shelf", addBagTile: "Add a bag", addBagSub: "Paste a Hatch link or fill it in by hand",
  brewAlong: "Brew along", now: "Now: pour to {to} g", next: "Next: pour to {to} g in {s}", drain: "Let it drain. Aim to finish by {t}.",
  done: "Time's up. Taste it, then log the cup.", ready: "Start the timer as you begin the bloom.", poursLabel: "pours incl. bloom",
  tasteCompass: "Taste compass", compassHelp: "Tap where this cup landed. The centre is balanced.", lastCup: "Last cup", aim: "This recipe steers it toward the centre.",
  app: "Origami Brew Log", "tab.beans": "Beans", "tab.brew": "Brew", "tab.guide": "Guide",
  "roast.light": "Light", "roast.medium-light": "Medium-light", "roast.medium": "Medium", "roast.medium-dark": "Medium-dark", "roast.dark": "Dark",
  "proc.washed": "Washed", "proc.natural": "Natural", "proc.honey": "Honey", "proc.anaerobic": "Anaerobic / co-ferment", "proc.wet-hulled": "Wet-hulled", "proc.other": "Other",
  "setup.origami-cone": "Origami · cone filter", "setup.origami-wave": "Origami · wave filter", "setup.v60": "Hario V60", "setup.kalita": "Kalita Wave",
  "m.origami-cone": "Origami cone", "m.origami-wave": "Origami wave", "m.v60": "Hario V60", "m.kalita": "Kalita Wave", dripper: "Dripper",
  "agit.swirl2": "Swirl after bloom and after the last pour", "agit.swirl1": "One gentle swirl after the last pour",
  "agit.minimal": "Minimal. Pour gently, no swirl", "agit.minimalSlow": "Minimal. Pour low and slow, no swirl", "agit.gentle": "Gentler pours, skip the swirls",
  "ext.-2": "Very sour / sharp", "ext.-1": "A bit sour", "ext.0": "Balanced", "ext.1": "A bit bitter", "ext.2": "Very bitter / harsh",
  "str.-2": "Very weak / watery", "str.-1": "A bit weak", "str.0": "Just right", "str.1": "A bit strong", "str.2": "Too strong / heavy",
  "why.base": "{roast} roast starts at {temp}°C, 1:{ratio}, {clicks} clicks.",
  "why.origami-wave": "Origami with a wave filter holds a flat bed that drains slower than the cone, so grind 1 click coarser and expect ~20 s longer.",
  "why.v60": "Hario V60 drains a little slower than the Origami with a cone filter: 1 click coarser.",
  "why.kalita": "Kalita Wave's flat bed and three small holes drain slowly: 1 click coarser, one extra pulse pour, ~20 s longer.",
  "why.convert": p => `That brew was on the ${p.from}. Switching to the ${p.to}: grind ${p.d === 0 ? "stays the same" : (p.d > 0 ? "+" : "−") + pl(Math.abs(p.d), "click")}.`,
  "why.altHigh": "Grown at {alt} m: dense beans resist extraction, so +1°C and 1 click finer.",
  "why.altLow": "Lower altitude ({alt} m): softer beans extract easily, so −1°C.",
  "why.fruity": "{process} beans are fruit-heavy and fine-prone: −1°C and 1 click coarser to keep it clean.",
  "why.wetHulled": "Wet-hulled beans can taste earthy when pushed: −1°C.",
  "why.fresh": p => `Only ${pl(p.n, "day")} off roast: lots of CO₂, so bloom 50 s.`,
  "why.old": "{n} days off roast: aroma is fading, so +1°C and 1 click finer.",
  "why.sour": p => `It tasted ${p.very ? "very " : ""}sour: grind ${pl(p.d, "click")} finer to extract more.`,
  "why.tempUp": "Also +1°C for more extraction.",
  "why.bitter": p => `It tasted ${p.very ? "very " : ""}bitter: grind ${pl(p.d, "click")} coarser.`,
  "why.tempDown": "Also −1°C to soften harsh notes.",
  "why.astr": "Drying finish usually means fines or too much agitation: 1 click coarser and pour more gently.",
  "why.flat": "Flavours felt muted: +1°C to lift aromatics.",
  "why.weak": "Too weak: tighten ratio to 1:{r}.", "why.strong": "Too strong: open ratio to 1:{r}.",
  "why.dialled": "That cup was dialled in. Repeat it exactly.",
  "why.noIssue": "No balance issues reported. Repeat, and change only one thing if you want to explore.",
  "why.fromLast": "Starting from your last brew ({date}, {score}/10).",
  "why.fromBest": "Your last brew scored lower, so starting from your best ({date}, {score}/10).",
  "why.long": "That brew ran {t}, longer than target: the coarser grind will also speed drawdown.",
  "step.bloom": "Bloom: wet all grounds evenly", "step.pour": "Pour in slow spirals, avoid the paper",
  "step.final": "Final pour: center spirals, then swirl if called for", "step.pourFlat": "Pour in small circles over the bed, keep the level steady", "step.drawdown": "Drawdown. Aim to finish by {t}",
  "notice.loadErr": "Couldn't load your saved data right now ({code}). Reload to try again.",
  "notice.local": "Saving on this device only. Sign in to claude.ai and open this page there to sync your log across devices.",
  "toast.full": "Storage is full. Delete old brews to save new ones.", "toast.saveErr": "Couldn't save ({code}).", "toast.delErr": "Couldn't delete ({code}).",
  "toast.beanUpdated": "Bean updated", "toast.beanAdded": "Bean added. Open Brew for its recipe", "toast.brewSaved": "Saved. Next recipe updated",
  "toast.brewRemoved": "Brew removed", "toast.beanDeleted": "Bean deleted",
  example: "Example", "chip.alt": "{n} m", "chip.rest": "{n} d off roast",
  loadingBeans: "Loading your beans…", loading: "Loading…", yourBeans: "Your beans", beansIntro: "Add a bag, then open it in Brew for a recipe tuned to it.",
  addBean: "Add a bean", noBeans: "No beans yet", noBeansBody: "Add the bag you're drinking now: origin, process, roast level and roast date are enough for a first recipe.",
  addFirst: "Add your first bean", brewsCount: p => pl(p.n, "brew"), best: "best", notBrewed: "Not brewed yet", brewArrow: "Brew →",
  editBean: "Edit bean", newBean: "New bean", importHead: "Import from Hatch Coffee", importBtn: "Import", reading: "Reading page…", importUrlAria: "Hatch product link",
  pasteSummary: "Or paste the page text", pasteHelp: "On the Hatch product page, select all (⌘A / Ctrl+A), copy, and paste here.", pasteAria: "Pasted Hatch page text", fillFromText: "Fill from text",
  "f.name": "Name *", "ph.name": "e.g. Ethiopia Guji Hambela", "f.roaster": "Roaster", "f.producer": "Producer", "ph.producer": "Farm or producer",
  "f.origin": "Origin", "ph.origin": "Country, region", "f.variety": "Variety", "ph.variety": "e.g. Heirloom, Gesha", "f.process": "Process", "f.roast": "Roast level",
  "f.alt": "Altitude (m)", "ph.alt": "e.g. 2000", "f.roastDate": "Roast date", "f.setup": "Usual dripper", "f.harvest": "Harvest", "ph.harvest": "e.g. 2025",
  "f.notes": "Tasting notes on the bag", "ph.notes": "e.g. jasmine, peach, black tea", "f.elev": "Elevation",
  saveChanges: "Save changes", cancel: "Cancel",
  addBeanFirst: "Add a bean first", addBeanFirstBody: "Your recipe is built from the bean's roast, process, altitude and roast date.", goBeans: "Go to Beans",
  nextBrewFor: "Next brew for", beanAria: "Bean", productPage: "Product page ↗", logBrew: "Log this brew",
  "ro.temp": "Water temp", "ro.tempSub": "off the boil ≈ 96–98°C", "ro.ratio": "Ratio", "ro.ratioSub": "{g} g coffee per litre",
  "ro.coffee": "Coffee", "ro.coffeeSub": "use − / + or type a weight", "ro.water": "Water", "ro.waterSub": "total incl. bloom · ≈ {cup} ml in the cup",
  doseLess: "Less coffee", doseMore: "More coffee", doseInput: "Coffee weight in grams", doseReset: "↺ Back to {g} g",
  "why.dose": p => `Scaled to ${p.dose} g of coffee: water and every pour follow the 1:${p.r} ratio` + (p.d > 0 ? ", grind 1 click coarser for the deeper bed" : p.d < 0 ? ", grind 1 click finer for the shallower bed" : "") + `, target time ${p.dt > 0 ? "+" : "−"}${Math.abs(p.dt)} s.`,
  "ro.grind": "Grind · C40", "unit.clicks": "clicks", "ro.grindSub": "≈ {um} µm, from zero", "ro.target": "Target time", "ro.targetSub": "total incl. drawdown",
  pourSchedule: "Pour schedule", "timer.start": "Start timer", "timer.pause": "Pause", "timer.resume": "Resume", "timer.reset": "Reset",
  "th.at": "At", "th.add": "Add", "th.scale": "Scale", "th.what": "What",
  agitation: "Agitation:", preheat: "Rinse the paper with hot water and preheat the dripper first.",
  whyRecipe: "Why this recipe", grindOnC40: "Grind on the Comandante C40", grindAria: "Grind position", clicksSuffix: "clicks",
  dialNote: "Shaded band is the usual pour-over range (20–30 clicks). Count clicks from fully closed.",
  brewHistory: "Brew history", noBrews: "No brews logged for this bean. Brew the recipe above, taste it, then tap <strong>Log this brew</strong>. Your feedback adjusts the next recipe.",
  score: "Score", drying: "drying", muted: "muted", del: "Delete", keep: "Keep", remove: "Remove", removeAria: "Delete brew",
  deleteBeanAsk: "Delete this bean? Its brew log will be hidden.", deleteBean: "Delete bean", deleteThisBean: "Delete this bean",
  logTitle: "Log this brew & taste", whatYouDid: "What you actually did", "lf.date": "Date", "lf.dose": "Coffee (g)", "lf.water": "Water (g)", "lf.temp": "Temp (°C)",
  "lf.clicks": "C40 clicks", "lf.time": "Total time (m:ss)", "lf.setup": "Dripper", howTasted: "How it tasted",
  balance: "Balance", sour: "Sour", bitter: "Bitter", strength: "Strength", weak: "Weak", strong: "Strong",
  astrCheck: "Drying / astringent finish", flatCheck: "Muted / flat flavours", scoreLabel: "Overall score (1–10)", notesLabel: "Tasting notes",
  notesPh: "What you tasted, what you'd change", saveLog: "Save & update next recipe",
  guideTitle: "Brewing guide", guideIntro: "How process and origin shape flavour, and the rules this log uses to build and adjust your recipe. Change one variable at a time so you can tell what made the difference.",
  startPoints: "Starting points by roast", "gth.roast": "Roast", "gth.water": "Water", "gth.ratio": "Ratio", "gth.clicks": "C40 clicks", "gth.pours": "Pours after bloom", "gth.agit": "Agitation",
  adjustNote: "Then adjusted for the bean: altitude ≥ 1800 m → +1°C, 1 click finer. Natural / anaerobic → −1°C, 1 click coarser. Under 5 days off roast → 50 s bloom. Over 45 days → +1°C, 1 click finer. Last, the dripper shifts grind and time (see Your drippers).",
  fixCup: "Fixing the cup", "fth.taste": "You taste", "fth.cause": "Likely cause", "fth.change": "Change next time",
  fixRows: [
    ["Sour, sharp, salty, short finish", "Under-extracted", "1–2 clicks finer; +1°C if very sour"],
    ["Bitter, harsh, ashy", "Over-extracted", "1–2 clicks coarser; −1°C if harsh"],
    ["Drying, astringent, chalky", "Fines, channeling or too much agitation", "1 click coarser, gentler pours, fewer swirls"],
    ["Watery, thin", "Too little coffee for the water", "Tighten ratio 0.5–1 (e.g. 1:16 → 1:15)"],
    ["Heavy, muddy, overwhelming", "Too concentrated", "Open ratio 0.5–1 (e.g. 1:15 → 1:16)"],
    ["Muted, flat, little aroma", "Water too cool or beans stale", "+1°C; check roast date"],
    ["Drawdown far over target", "Grind too fine or clogged paper", "Coarser, pour gentler; that also cuts bitterness"],
  ],
  fixNote: "After each log, the next recipe starts from your latest brew. If that brew scored more than one point below your best, it starts from the best one instead.",
  clickRanges: "Comandante C40 click ranges",
  "m.espresso": "Espresso", "m.moka": "Moka pot", "m.aero": "AeroPress", "m.chemex": "Chemex", "m.press": "French press",
  clickNote: "Each click is about {um} µm.", clickMark: "The dark mark is your next brew ({n} clicks).", yourNext: "Your next brew",
  drippersTitle: "Your drippers", "dth.dripper": "Dripper", "dth.grind": "Grind shift", "dth.time": "Target (light, 15 g)", "dth.char": "Character",
  "dchar.origami-cone": "Fastest flow. Clean, bright, high clarity. Best for light washed coffees.",
  "dchar.origami-wave": "Flat bed, slower and even. More body and sweetness, forgiving.",
  "dchar.v60": "One large hole, so flow follows your pour. Bright and layered; rewards a steady pour.",
  "dchar.kalita": "Flat bed, three small holes, slow and steady. Sweet, round, consistent; great for naturals and medium roasts.",
  drippersNote: "Grind shift is relative to the Origami with a cone filter. Your feedback carries over between drippers: switching converts the grind by this shift.",
  waterNote: "<strong>Water:</strong> preheat the dripper; ceramic and glass soak up heat. Use filtered water around 50–150 ppm.",
  "im.badUrl": "Paste a product link that starts with https://, like https://hatchcrafted.com/shop/ep-pink-bourbon-washed.",
  openPage: "Open page ↗", step1: "Scan the QR code on the bag, or paste the product link.", step2: "Open the page, select all (⌘A / Ctrl+A on a computer; long-press → Select All on a phone) and copy.", step3: "Paste the text below and tap Fill from text.",
  "im.qrFound": "Found the link. Open the page, copy all its text, and paste it below.",
  scanQR: "Scan QR", scanHelp: "Scan the QR code on the bag: on a phone this opens the camera; on a computer, choose a photo of the code.",
  "im.scanning": "Reading the QR code…", "im.noQR": "Couldn't find a QR code in that photo. Try again closer, in good light, with the code filling more of the frame.",
  "im.qrText": "That QR code doesn't contain a link. It says: {text}", "im.qrLib": "The QR reader didn't load. Check your connection and try again.",
  "im.needApp": "Reading links needs this page open in the Claude desktop app. Here, open the Hatch page, copy all its text and paste it below.",
  "im.opening": "Opening the page in Claude's browser…",
  "im.notFound": "Opened the page but couldn't find the coffee details. Copy its text and paste it below instead.",
  "im.unreachable": "Claude's browser isn't reachable from here. Open this page in the Claude desktop app, or paste the page text below.",
  "im.denied": "Browser access wasn't allowed, so nothing was read. Allow it when asked, or paste the page text below.",
  "im.toolErr": "The browser couldn't open that page. Check the link, or paste the page text below.",
  "im.generic": "Couldn't read the page right now. Try again, or paste the page text below.",
  "im.pasteFail": "Couldn't find Origin, Variety or Process in that text. Copy the whole product page and try again.",
  "im.filled": p => `Filled from Hatch: ${p.name}.` + (p.missing ? ` Not found on the page: ${p.missing}.` : "") + " Review, then add the bean.",
  "hint.anaerobic": "The description mentions anaerobic fermentation or thermal shock. These coffees often brew better a little cooler and coarser: consider setting Process to Anaerobic.",
  "hint.range": "Elevation is a range ({elev}); using the midpoint, {alt} m.",
  "hint.roast": "Hatch doesn't list a roast level. Set to {roast} from \"Recommended Brew: {rec}\". Check the bag.",
  "hint.roastNoRec": "Hatch doesn't list a roast level. Set to {roast}; check the bag.",
  "hint.roastDate": "Add the roast date from the bag: it changes the bloom and temperature.",
},
zh: {
  signIn: "登入", signInGoogle: "用 Google 登入以同步", signOut: "登出", account: "帳號", syncedNote: "你的紀錄會在所有裝置間同步。",
  "notice.signin": "目前只儲存在這台裝置。", "notice.fbFail": "無法連線到同步服務，暫時儲存在這台裝置。",
  "toast.synced": "已把這台裝置上的咖啡豆加入你的帳號", "toast.signinErr": "無法登入（{code}）。",
  "toast.badBackup": "這不是 Origami 手沖日誌的備份檔。", "toast.imported": "已匯入 {n} 筆資料",
  backupTitle: "備份", backupCloud: "你的紀錄已存到 Google 帳號，也可以另外匯出一份檔案保存。", backupLocal: "你的紀錄存在這個瀏覽器裡。匯出檔案可以備份，或搬到另一台裝置。",
  exportBtn: "匯出檔案", importBackupBtn: "匯入檔案",
  importHelp: "貼上商品連結或掃描包裝上的 QR code，資料會自動填入。",
  "im.fetching": "正在讀取頁面…", "im.fetchFail": "無法讀取這個頁面。請確認連結，或把頁面文字貼到下方。",
  "im.camDenied": "相機權限被封鎖。請允許此網站使用相機，或改用照片。",
  scanTitle: "掃描 QR code", scanHint: "對準包裝上的 QR code，會自動掃描。", scanPhoto: "改用照片",
  fav: "喜愛度", diff: "難度", notRated: "尚未評分", tapClear: "再點一次可清除",
  favLv: ["不太喜歡", "還可以", "不錯", "很喜歡", "最愛"], diffLv: ["很容易調好", "不難", "普通", "有點難", "很難調"],
  sortBy: "排序", "sort.newest": "最新", "sort.fav": "最喜歡優先", "sort.easy": "最容易優先", "sort.hard": "最難優先",
  heroEyebrow: "下次沖煮", shelfTitle: "你的豆櫃", addBagTile: "新增一包豆子", addBagSub: "貼上 Hatch 連結或手動填寫",
  brewAlong: "跟著沖", now: "現在：注水到 {to} 克", next: "下一步：{s} 後注水到 {to} 克", drain: "等待滴濾，目標在 {t} 前結束。",
  done: "時間到了。品嚐後記錄這杯。", ready: "開始悶蒸時按下計時。", poursLabel: "次注水（含悶蒸）",
  tasteCompass: "風味羅盤", compassHelp: "點選這杯的位置，中心代表平衡。", lastCup: "上一杯", aim: "這份配方會把它往中心調整。",
  app: "Origami 手沖日誌", "tab.beans": "咖啡豆", "tab.brew": "沖煮", "tab.guide": "指南",
  "roast.light": "淺焙", "roast.medium-light": "中淺焙", "roast.medium": "中焙", "roast.medium-dark": "中深焙", "roast.dark": "深焙",
  "proc.washed": "水洗", "proc.natural": "日曬", "proc.honey": "蜜處理", "proc.anaerobic": "厭氧／共同發酵", "proc.wet-hulled": "濕剝", "proc.other": "其他",
  "setup.origami-cone": "Origami · 錐形濾紙", "setup.origami-wave": "Origami · 波浪濾紙", "setup.v60": "Hario V60", "setup.kalita": "Kalita Wave",
  "m.origami-cone": "Origami 錐形", "m.origami-wave": "Origami 波浪", "m.v60": "Hario V60", "m.kalita": "Kalita Wave", dripper: "濾杯",
  "agit.swirl2": "悶蒸後和最後一次注水後各搖晃一次", "agit.swirl1": "最後一次注水後輕輕搖晃一次",
  "agit.minimal": "盡量少攪動，輕柔注水，不搖晃", "agit.minimalSlow": "盡量少攪動，低水位慢慢注水，不搖晃", "agit.gentle": "注水放輕，不要搖晃",
  "ext.-2": "非常酸／尖銳", "ext.-1": "有點酸", "ext.0": "平衡", "ext.1": "有點苦", "ext.2": "非常苦／刺激",
  "str.-2": "非常淡／水感", "str.-1": "有點淡", "str.0": "剛剛好", "str.1": "有點濃", "str.2": "太濃／厚重",
  "why.base": "{roast}起始設定：{temp}°C、1:{ratio}、{clicks} 格。",
  "why.origami-wave": "Origami 搭配波浪濾紙是平底粉床，流速比錐形慢，所以磨粗 1 格，總時間約多 20 秒。",
  "why.v60": "Hario V60 的流速比 Origami 錐形略慢：磨粗 1 格。",
  "why.kalita": "Kalita Wave 平底三小孔、排水慢：磨粗 1 格，多一次分段注水，總時間約多 20 秒。",
  "why.convert": p => `那次用的是 ${p.from}。改用 ${p.to}：研磨${p.d === 0 ? "不變" : (p.d > 0 ? "磨粗 " : "磨細 ") + Math.abs(p.d) + " 格"}。`,
  "why.altHigh": "海拔 {alt} 公尺：豆子密度高、較難萃取，所以 +1°C、磨細 1 格。",
  "why.altLow": "海拔較低（{alt} 公尺）：豆子較軟、容易萃取，所以 −1°C。",
  "why.fruity": "{process}豆果味重、容易產生細粉：−1°C、磨粗 1 格，讓風味更乾淨。",
  "why.wetHulled": "濕剝豆萃取過度容易有土味：−1°C。",
  "why.fresh": "烘焙後才 {n} 天：二氧化碳多，悶蒸延長到 50 秒。",
  "why.old": "烘焙後已 {n} 天：香氣漸弱，所以 +1°C、磨細 1 格。",
  "why.sour": p => `喝起來${p.very ? "非常" : "有點"}酸：磨細 ${p.d} 格以提高萃取。`,
  "why.tempUp": "同時 +1°C 增加萃取。",
  "why.bitter": p => `喝起來${p.very ? "非常" : "有點"}苦：磨粗 ${p.d} 格。`,
  "why.tempDown": "同時 −1°C，讓刺激的味道柔和一些。",
  "why.astr": "尾韻乾澀通常是細粉多或攪拌過度：磨粗 1 格，注水更輕柔。",
  "why.flat": "風味沉悶：+1°C 提升香氣。",
  "why.weak": "太淡：粉水比調濃到 1:{r}。", "why.strong": "太濃：粉水比調淡到 1:{r}。",
  "why.dialled": "這杯已經調好了，照原樣再沖一次。",
  "why.noIssue": "沒有回報平衡問題。照原樣再沖；想嘗試的話，一次只改一個變數。",
  "why.fromLast": "以你上一次的沖煮為基礎（{date}，{score}/10 分）。",
  "why.fromBest": "上一次分數較低，所以改以你最好的一次為基礎（{date}，{score}/10 分）。",
  "why.long": "那次總時間 {t}，超過目標：磨粗也會讓滴濾更快完成。",
  "step.bloom": "悶蒸：讓咖啡粉均勻濕透", "step.pour": "慢速螺旋注水，避開濾紙",
  "step.final": "最後一次注水：中心小螺旋，需要時再搖晃", "step.pourFlat": "在粉床上小圈注水，保持水位穩定", "step.drawdown": "等待滴濾完成，目標在 {t} 前結束",
  "notice.loadErr": "目前無法載入你的資料（{code}）。請重新整理再試一次。",
  "notice.local": "只會儲存在這台裝置。登入 claude.ai 並在那裡開啟此頁面，紀錄才能在不同裝置間同步。",
  "toast.full": "儲存空間已滿。刪除舊的沖煮紀錄後才能儲存新的。", "toast.saveErr": "無法儲存（{code}）。", "toast.delErr": "無法刪除（{code}）。",
  "toast.beanUpdated": "已更新咖啡豆", "toast.beanAdded": "已新增咖啡豆。到「沖煮」查看配方", "toast.brewSaved": "已儲存，下次配方已更新",
  "toast.brewRemoved": "已刪除這次沖煮", "toast.beanDeleted": "已刪除咖啡豆",
  example: "範例", "chip.alt": "{n} 公尺", "chip.rest": "烘焙後 {n} 天",
  loadingBeans: "正在載入你的咖啡豆…", loading: "載入中…", yourBeans: "你的咖啡豆", beansIntro: "新增一包豆子，再到「沖煮」取得為它調整的配方。",
  addBean: "新增咖啡豆", noBeans: "還沒有咖啡豆", noBeansBody: "新增你現在在喝的那包：產地、處理法、烘焙度和烘焙日期，就足以產生第一份配方。",
  addFirst: "新增第一支豆子", brewsCount: p => `${p.n} 次沖煮`, best: "最佳", notBrewed: "尚未沖煮", brewArrow: "沖煮 →",
  editBean: "編輯咖啡豆", newBean: "新增咖啡豆", importHead: "從 Hatch Coffee 匯入", importBtn: "匯入", reading: "讀取頁面中…", importUrlAria: "Hatch 商品連結",
  pasteSummary: "或貼上頁面文字", pasteHelp: "在 Hatch 商品頁全選（⌘A / Ctrl+A）、複製，然後貼到這裡。", pasteAria: "貼上的 Hatch 頁面文字", fillFromText: "從文字填入",
  "f.name": "名稱 *", "ph.name": "例如 衣索比亞 古吉 漢貝拉", "f.roaster": "烘豆商", "f.producer": "生產者", "ph.producer": "莊園或生產者",
  "f.origin": "產地", "ph.origin": "國家、產區", "f.variety": "品種", "ph.variety": "例如 原生種、藝伎", "f.process": "處理法", "f.roast": "烘焙度",
  "f.alt": "海拔（公尺）", "ph.alt": "例如 2000", "f.roastDate": "烘焙日期", "f.setup": "常用濾杯", "f.harvest": "產季", "ph.harvest": "例如 2025",
  "f.notes": "包裝上的風味描述", "ph.notes": "例如 茉莉、水蜜桃、紅茶", "f.elev": "海拔",
  saveChanges: "儲存變更", cancel: "取消",
  addBeanFirst: "先新增一支咖啡豆", addBeanFirstBody: "配方是依照豆子的烘焙度、處理法、海拔和烘焙日期產生的。", goBeans: "前往咖啡豆",
  nextBrewFor: "下次沖煮", beanAria: "咖啡豆", productPage: "商品頁 ↗", logBrew: "記錄這次沖煮",
  "ro.temp": "水溫", "ro.tempSub": "剛煮沸約 96–98°C", "ro.ratio": "粉水比", "ro.ratioSub": "每公升 {g} 克咖啡粉",
  "ro.coffee": "咖啡粉", "ro.coffeeSub": "按 − / + 或直接輸入重量", "ro.water": "水量", "ro.waterSub": "總量含悶蒸 · 成品約 {cup} ml",
  doseLess: "減少咖啡粉", doseMore: "增加咖啡粉", doseInput: "咖啡粉重量（克）", doseReset: "↺ 恢復 {g} 克",
  "why.dose": p => `份量改為 ${p.dose} 克咖啡粉：水量和每次注水都依 1:${p.r} 換算` + (p.d > 0 ? "，粉床較厚所以磨粗 1 格" : p.d < 0 ? "，粉床較薄所以磨細 1 格" : "") + `，目標時間${p.dt > 0 ? "增加" : "減少"} ${Math.abs(p.dt)} 秒。`,
  "ro.grind": "研磨 · C40", "unit.clicks": "格", "ro.grindSub": "約 {um} µm，從歸零起算", "ro.target": "目標時間", "ro.targetSub": "總時間，含滴濾",
  pourSchedule: "注水步驟", "timer.start": "開始計時", "timer.pause": "暫停", "timer.resume": "繼續", "timer.reset": "重設",
  "th.at": "時間", "th.add": "注入", "th.scale": "秤上讀數", "th.what": "動作",
  agitation: "攪動：", preheat: "先用熱水沖洗濾紙並預熱濾杯。",
  whyRecipe: "為什麼是這個配方", grindOnC40: "Comandante C40 研磨刻度", grindAria: "研磨位置", clicksSuffix: "格",
  dialNote: "陰影區是一般手沖範圍（20–30 格）。從完全鎖緊開始數。",
  brewHistory: "沖煮紀錄", noBrews: "這支豆子還沒有沖煮紀錄。照上面的配方沖一杯、品嚐後，點<strong>記錄這次沖煮</strong>。你的回饋會調整下一次的配方。",
  score: "分數", drying: "乾澀", muted: "沉悶", del: "刪除", keep: "保留", remove: "移除", removeAria: "刪除這次沖煮",
  deleteBeanAsk: "刪除這支豆子？它的沖煮紀錄會一起隱藏。", deleteBean: "刪除咖啡豆", deleteThisBean: "刪除這支豆子",
  logTitle: "記錄這次沖煮與品嚐", whatYouDid: "實際沖煮參數", "lf.date": "日期", "lf.dose": "咖啡粉（克）", "lf.water": "水量（克）", "lf.temp": "水溫（°C）",
  "lf.clicks": "C40 格數", "lf.time": "總時間（分:秒）", "lf.setup": "濾杯", howTasted: "喝起來如何",
  balance: "酸苦平衡", sour: "酸", bitter: "苦", strength: "濃淡", weak: "淡", strong: "濃",
  astrCheck: "尾韻乾澀", flatCheck: "風味沉悶、平淡", scoreLabel: "整體評分（1–10）", notesLabel: "品嚐筆記",
  notesPh: "喝到什麼、下次想改什麼", saveLog: "儲存並更新下次配方",
  guideTitle: "沖煮指南", guideIntro: "處理法與產地如何影響風味，以及本日誌用來產生和調整配方的規則。一次只改一個變數，才知道是哪個改變造成差異。",
  startPoints: "依烘焙度的起始設定", "gth.roast": "烘焙度", "gth.water": "水溫", "gth.ratio": "粉水比", "gth.clicks": "C40 格數", "gth.pours": "悶蒸後注水次數", "gth.agit": "攪動",
  adjustNote: "再依豆子調整：海拔 ≥ 1800 公尺 → +1°C、磨細 1 格。日曬／厭氧 → −1°C、磨粗 1 格。烘焙後未滿 5 天 → 悶蒸 50 秒。超過 45 天 → +1°C、磨細 1 格。最後再依濾杯調整研磨和時間（見「你的濾杯」）。",
  fixCup: "調整這杯咖啡", "fth.taste": "喝起來", "fth.cause": "可能原因", "fth.change": "下次調整",
  fixRows: [
    ["酸、尖銳、鹹、尾韻短", "萃取不足", "磨細 1–2 格；很酸時 +1°C"],
    ["苦、刺激、焦味", "萃取過度", "磨粗 1–2 格；刺激時 −1°C"],
    ["乾澀、收斂、粉感", "細粉多、通道效應或攪拌過度", "磨粗 1 格，注水更輕，少搖晃"],
    ["水感、單薄", "相對於水量，咖啡粉太少", "粉水比調濃 0.5–1（例如 1:16 → 1:15）"],
    ["厚重、混濁、太強烈", "濃度太高", "粉水比調淡 0.5–1（例如 1:15 → 1:16）"],
    ["沉悶、平淡、香氣少", "水溫太低或豆子不新鮮", "+1°C；確認烘焙日期"],
    ["滴濾時間遠超過目標", "磨太細或濾紙堵塞", "磨粗、注水更輕；也能減少苦味"],
  ],
  fixNote: "每次記錄後，下次配方會以你最近一次沖煮為基礎。如果那次比你的最佳分數低超過 1 分，就改以最佳那次為基礎。",
  clickRanges: "Comandante C40 格數範圍",
  "m.espresso": "義式濃縮", "m.moka": "摩卡壺", "m.aero": "愛樂壓", "m.chemex": "Chemex", "m.press": "法式濾壓壺",
  clickNote: "每一格約 {um} µm。", clickMark: "深色標記是你下次的沖煮（{n} 格）。", yourNext: "你的下次沖煮",
  drippersTitle: "你的濾杯", "dth.dripper": "濾杯", "dth.grind": "研磨調整", "dth.time": "目標時間（淺焙 15 克）", "dth.char": "風格",
  "dchar.origami-cone": "流速最快。乾淨、明亮、清晰度高，最適合淺焙水洗豆。",
  "dchar.origami-wave": "平底粉床，較慢且均勻。口感更厚、甜感更好，容錯度高。",
  "dchar.v60": "單一大孔，流速跟著你的注水走。明亮有層次，穩定注水效果最好。",
  "dchar.kalita": "平底三小孔，慢而穩定。甜、圓潤、穩定，適合日曬豆和中焙豆。",
  drippersNote: "研磨調整是相對於 Origami 錐形濾紙。你的回饋會在不同濾杯間延續：換濾杯時，研磨會依這個差距自動換算。",
  waterNote: "<strong>水：</strong>先預熱濾杯，陶瓷和玻璃都會吸熱。使用約 50–150 ppm 的過濾水。",
  "im.badUrl": "請貼上以 https:// 開頭的商品連結，例如 https://hatchcrafted.com/shop/ep-pink-bourbon-washed。",
  openPage: "開啟頁面 ↗", step1: "掃描包裝上的 QR code，或貼上商品連結。", step2: "開啟頁面，全選（電腦按 ⌘A / Ctrl+A；手機長按 → 全選）並複製。", step3: "把文字貼到下方，按「從文字填入」。",
  "im.qrFound": "已找到連結。開啟頁面、複製全部文字，再貼到下方。",
  scanQR: "掃描 QR", scanHelp: "掃描包裝上的 QR code：手機會直接開啟相機；電腦上請選擇 QR code 的照片。",
  "im.scanning": "正在讀取 QR code…", "im.noQR": "照片中找不到 QR code。請靠近一點、在光線充足處重拍，讓 QR code 佔畫面大一點。",
  "im.qrText": "這個 QR code 不是連結，內容是：{text}", "im.qrLib": "QR 讀取工具載入失敗，請確認網路後再試。",
  "im.needApp": "讀取連結需要在 Claude 桌面版 App 中開啟這個頁面。在這裡請打開 Hatch 頁面，複製全部文字並貼到下方。",
  "im.opening": "正在用 Claude 的瀏覽器開啟頁面…",
  "im.notFound": "已開啟頁面，但找不到咖啡資訊。請改為複製頁面文字並貼到下方。",
  "im.unreachable": "這裡無法使用 Claude 的瀏覽器。請在 Claude 桌面版 App 開啟這個頁面，或把頁面文字貼到下方。",
  "im.denied": "沒有取得瀏覽器權限，所以沒有讀取任何內容。出現提示時請允許，或把頁面文字貼到下方。",
  "im.toolErr": "瀏覽器無法開啟這個頁面。請確認連結，或把頁面文字貼到下方。",
  "im.generic": "目前無法讀取頁面。請再試一次，或把頁面文字貼到下方。",
  "im.pasteFail": "在文字中找不到 Origin、Variety 或 Process。請複製整個商品頁面再試一次。",
  "im.filled": p => `已從 Hatch 填入：${p.name}。` + (p.missing ? `頁面上找不到：${p.missing}。` : "") + "確認內容後再新增咖啡豆。",
  "hint.anaerobic": "商品描述提到厭氧發酵或熱衝擊處理。這類豆子通常降一點水溫、磨粗一點會更好喝：可以考慮把處理法改成「厭氧」。",
  "hint.range": "海拔是一個範圍（{elev}），採用中間值 {alt} 公尺。",
  "hint.roast": "Hatch 沒有標示烘焙度。依「Recommended Brew: {rec}」設為{roast}，請以包裝為準。",
  "hint.roastNoRec": "Hatch 沒有標示烘焙度，先設為{roast}，請以包裝為準。",
  "hint.roastDate": "請從包裝填入烘焙日期：它會影響悶蒸時間和水溫。",
},
};
const detectLang = () => { const n = (navigator.language || "").toLowerCase(); return n.startsWith("zh") ? "zh" : "en"; };
let lang = lsGet("obl-lang", null) || detectLang();
if (!I18N[lang]) lang = "en";
const t = (k, p = {}) => {
  const d = I18N[lang][k] ?? I18N.en[k] ?? k;
  return typeof d === "function" ? d(p) : typeof d === "string" ? d.replace(/\{(\w+)\}/g, (_, x) => p[x] ?? "") : d;
};
const fmtD = d => { if (!d) return ""; const x = new Date(d + "T12:00:00"); return x.toLocaleDateString(lang === "zh" ? "zh-TW" : undefined, { month: "short", day: "numeric", year: "numeric" }); };
const roastName = k => t("roast." + (k || "medium"));
const procName = k => t("proc." + (k || "other"));
const ROAST_KEYS = ["light", "medium-light", "medium", "medium-dark", "dark"];
const PROC_KEYS = ["washed", "natural", "honey", "anaerobic", "wet-hulled", "other"];
const SETUP_KEYS = ["origami-cone", "origami-wave", "v60", "kalita"];
const SETUPS = {
  "origami-cone": { clicks: 0, time: 0, pours: 0, flat: false },
  "origami-wave": { clicks: 1, time: 20, pours: 0, flat: true },
  v60:            { clicks: 1, time: 0, pours: 0, flat: false },
  kalita:         { clicks: 1, time: 20, pours: 1, flat: true },
};
const setupOf = o => SETUPS[o && o.setup] ? o.setup : (o && o.filter === "wave" ? "origami-wave" : "origami-cone");
const setupName = k => t("setup." + k);
let toastT;
const toast = (k, p) => { const el = $("#toast"); el.textContent = t(k, p); el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2600); };

/* ---------------- domain constants ---------------- */
const BASE = {
  light:          { temp: 94, ratio: 16,   clicks: 24, pours: 3, agit: "swirl2" },
  "medium-light": { temp: 93, ratio: 16,   clicks: 25, pours: 3, agit: "swirl2" },
  medium:         { temp: 91, ratio: 15.5, clicks: 26, pours: 2, agit: "swirl1" },
  "medium-dark":  { temp: 88, ratio: 15,   clicks: 27, pours: 2, agit: "minimal" },
  dark:           { temp: 85, ratio: 14.5, clicks: 28, pours: 2, agit: "minimalSlow" },
};
const MICRONS_PER_CLICK = 30;

/* ---------------- recommendation engine ----------------
   Reasons are stored as [key, params] and translated at render time. */
function baseRecipe(bean, setup) {
  const roast = BASE[bean.roast] ? bean.roast : "medium";
  const b = BASE[roast];
  const why = [];
  let temp = b.temp, ratio = b.ratio, clicks = b.clicks;
  why.push(["why.base", { roastKey: roast, temp: b.temp, ratio: b.ratio, clicks: b.clicks }]);
  const alt = +bean.altitude || 0;
  if (alt >= 1800) { temp += 1; clicks -= 1; why.push(["why.altHigh", { alt }]); }
  else if (alt && alt < 1200) { temp -= 1; why.push(["why.altLow", { alt }]); }
  if (bean.process === "natural" || bean.process === "anaerobic") { temp -= 1; clicks += 1; why.push(["why.fruity", { procKey: bean.process }]); }
  if (bean.process === "wet-hulled") { temp -= 1; why.push(["why.wetHulled"]); }
  const rest = daysSince(bean.roastDate);
  let bloomTime = 40;
  if (rest != null && rest >= 0) {
    if (rest < 5) { bloomTime = 50; why.push(["why.fresh", { n: rest }]); }
    else if (rest > 45) { temp += 1; clicks -= 1; why.push(["why.old", { n: rest }]); }
  }
  const off = SETUPS[setup];
  clicks += off.clicks;
  if (setup !== "origami-cone") why.push(["why." + setup]);
  return { dose: 15, ratio, temp, clicks, setup, bloomTime, basePours: b.pours, pours: b.pours + off.pours, agit: b.agit, why, source: "base" };
}

function applyFeedback(rec, brew) {
  const why = [];
  const e = +brew.extraction || 0, s = +brew.strength || 0;
  if (e <= -1) { const d = e === -2 ? 2 : 1; rec.clicks -= d; why.push(["why.sour", { very: e === -2, d }]); if (e === -2) { rec.temp += 1; why.push(["why.tempUp"]); } }
  if (e >= 1) { const d = e === 2 ? 2 : 1; rec.clicks += d; why.push(["why.bitter", { very: e === 2, d }]); if (e === 2) { rec.temp -= 1; why.push(["why.tempDown"]); } }
  if (brew.astringent) { if (e < 1) rec.clicks += 1; rec.agit = "gentle"; why.push(["why.astr"]); }
  if (brew.flat && e <= 0) { rec.temp += 1; why.push(["why.flat"]); }
  if (s <= -1) { rec.ratio -= s === -2 ? 1 : 0.5; why.push(["why.weak", { r: +rec.ratio.toFixed(1) }]); }
  if (s >= 1) { rec.ratio += s === 2 ? 1 : 0.5; why.push(["why.strong", { r: +rec.ratio.toFixed(1) }]); }
  if (!why.length) why.push([(+brew.score || 0) >= 8 ? "why.dialled" : "why.noIssue"]);
  return why;
}

const doseClicks = d => d >= 20 ? 1 : d <= 12 ? -1 : 0;
const doseTime = d => Math.round((d - 15) * 4);
function recommend(bean, brews, setup, doseOverride) {
  setup = setup || setupOf(bean);
  const rec = baseRecipe(bean, setup);
  const mine = brews.filter(b => b.beanId === bean.id).sort((a, b) => (a.date + a.createdAt).localeCompare(b.date + b.createdAt));
  if (mine.length) {
    const last = mine[mine.length - 1];
    const best = mine.reduce((m, b) => (+b.score || 0) > (+m.score || 0) ? b : m, mine[0]);
    const from = (+last.score || 0) >= (+best.score || 0) - 1 ? last : best;
    const fromSetup = setupOf(from), shift = SETUPS[setup].clicks - SETUPS[fromSetup].clicks;
    Object.assign(rec, { dose: +from.dose || rec.dose, temp: +from.temp || rec.temp, clicks: (+from.clicks || rec.clicks - shift) + shift });
    if (+from.dose && +from.water) rec.ratio = Math.round((from.water / from.dose) * 2) / 2;
    rec.prev = { temp: rec.temp, ratio: rec.ratio, clicks: rec.clicks };
    rec.why = [[from === last ? "why.fromLast" : "why.fromBest", { dateRaw: from.date, score: from.score }]];
    if (fromSetup !== setup) rec.why.push(["why.convert", { fromKey: fromSetup, toKey: setup, d: shift }]);
    rec.why.push(...applyFeedback(rec, from));
    if (from.time && from.time > targetWindow(rec)[1] + 20 && (+from.extraction || 0) >= 0) rec.why.push(["why.long", { t: fmtT(from.time) }]);
    rec.source = "feedback";
  }
  rec.baseDose = rec.dose;
  const od = +doseOverride;
  if (od && Math.abs(od - rec.dose) > 0.01) {
    const dc = doseClicks(od) - doseClicks(rec.dose);
    rec.clicks += dc;
    rec.why.push(["why.dose", { dose: od, r: +clamp(rec.ratio, 13.5, 18).toFixed(1), d: dc, dt: doseTime(od) - doseTime(rec.dose) }]);
    rec.dose = od; rec.scaled = true;
  }
  rec.temp = clamp(rec.temp, 82, 96); rec.clicks = clamp(rec.clicks, 16, 34); rec.ratio = clamp(rec.ratio, 13.5, 18);
  rec.water = Math.round(rec.dose * rec.ratio);
  rec.schedule = schedule(rec);
  rec.target = targetWindow(rec);
  return rec;
}
const whyText = ([k, p = {}]) => t(k, { ...p, roast: p.roastKey ? roastName(p.roastKey) : p.roast, process: p.procKey ? procName(p.procKey) : p.process, date: p.dateRaw ? fmtD(p.dateRaw) : p.date,
  from: p.fromKey ? setupName(p.fromKey) : p.from, to: p.toKey ? setupName(p.toKey) : p.to });

function targetWindow(rec) {
  const lo = (rec.basePours >= 3 ? 150 : 140) + SETUPS[rec.setup].time + doseTime(rec.dose);
  return [lo, lo + 30];
}

function schedule(rec) {
  const bloom = r5(rec.dose * 3);
  const rest = rec.water - bloom;
  const steps = [{ at: 0, add: bloom, to: bloom, what: "step.bloom" }];
  const n = rec.pours;
  let tm = rec.bloomTime, total = bloom;
  for (let i = 0; i < n; i++) {
    const add = i === n - 1 ? rec.water - total : r5(rest / n);
    total += add;
    steps.push({ at: tm, add, to: total, what: i === n - 1 ? "step.final" : SETUPS[rec.setup].flat ? "step.pourFlat" : "step.pour" });
    tm += n >= 4 ? 25 : n >= 3 ? 30 : 40;
  }
  return steps;
}

/* ---------------- store: Firebase (Google sign-in) with on-device fallback ---------------- */
const FB_CONFIG = window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey ? window.FIREBASE_CONFIG : null;
const FB_VERSION = "10.12.2";
const state = { beans: {}, brews: {}, ready: false, mode: "local" };
const auth = { configured: !!FB_CONFIG, ready: !FB_CONFIG, user: null, menu: false };
let fb = null, unsubs = [], notice = null;
const LOCAL_KEY = "obl-local-v1";
const clean = o => JSON.parse(JSON.stringify(o));

function loadLocal() {
  const s = lsGet(LOCAL_KEY, { beans: {}, brews: {} });
  state.beans = s.beans || {}; state.brews = s.brews || {}; state.mode = "local"; state.ready = true;
}
const saveLocal = () => lsSet(LOCAL_KEY, { beans: state.beans, brews: state.brews });
function rerender() { const lv = captureLog(); render(); restoreLog(lv); }

async function loadFirebase() {
  const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}/`;
  const [app, au, fs] = await Promise.all([import(base + "firebase-app.js"), import(base + "firebase-auth.js"), import(base + "firebase-firestore.js")]);
  const a = app.initializeApp(FB_CONFIG);
  let db;
  try { db = fs.initializeFirestore(a, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); }
  catch { db = fs.getFirestore(a); }
  return { au, fs, auth: au.getAuth(a), db };
}

async function initStore() {
  loadLocal(); render();
  if (!FB_CONFIG) return;
  try { fb = await loadFirebase(); }
  catch { auth.ready = true; showNotice("notice.fbFail"); return; }
  try { await fb.au.getRedirectResult(fb.auth); } catch {}
  fb.au.onAuthStateChanged(fb.auth, u => { auth.ready = true; auth.user = u; attach(u); });
}

async function attach(u) {
  unsubs.forEach(f => f()); unsubs = [];
  if (!u) { loadLocal(); showNotice("notice.signin"); rerender(); return; }
  notice = null;
  // first sign-in on this device: move anything saved locally into the account
  const local = lsGet(LOCAL_KEY, null);
  const hasLocal = local && (Object.keys(local.beans || {}).length || Object.keys(local.brews || {}).length);
  if (hasLocal) {
    try {
      for (const c of ["beans", "brews"]) for (const [id, d] of Object.entries(local[c] || {})) {
        const x = { ...d }; delete x.id;
        await fb.fs.setDoc(fb.fs.doc(fb.db, "users", u.uid, c, id), clean(x));
      }
      lsSet(LOCAL_KEY, { beans: {}, brews: {} });
      toast("toast.synced");
    } catch {}
  }
  state.mode = "cloud"; state.beans = {}; state.brews = {}; state.ready = false; rerender();
  const seen = new Set();
  for (const c of ["beans", "brews"]) {
    unsubs.push(fb.fs.onSnapshot(fb.fs.collection(fb.db, "users", u.uid, c), snap => {
      const m = {}; snap.forEach(d => { m[d.id] = { ...d.data(), id: d.id }; });
      state[c] = m; seen.add(c); if (seen.size === 2) state.ready = true;
      rerender();
    }, err => showNotice("notice.loadErr", { code: err.code || "error" })));
  }
}

async function signIn() {
  if (!fb) return;
  const p = new fb.au.GoogleAuthProvider();
  try { await fb.au.signInWithPopup(fb.auth, p); }
  catch (e) {
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(e.code)) {
      try { await fb.au.signInWithRedirect(fb.auth, p); } catch (e2) { toast("toast.signinErr", { code: e2.code || "error" }); }
    } else if (e.code !== "auth/popup-closed-by-user") toast("toast.signinErr", { code: e.code || "error" });
  }
}
async function signOutNow() { auth.menu = false; if (fb) await fb.au.signOut(fb.auth); }

function showNotice(k, p) { notice = [k, p]; paintNotice(); }
function paintNotice() {
  const n = $("#notice"); if (!n) return;
  if (!notice) { n.hidden = true; n.innerHTML = ""; return; }
  n.innerHTML = esc(t(notice[0], notice[1])) + (notice[0] === "notice.signin" && fb ? ` <button type="button" class="linkish" data-act="sign-in">${esc(t("signInGoogle"))}</button>` : "");
  n.hidden = false;
}
function paintAccount() {
  const el = $("#acct"); if (!el) return;
  if (!auth.configured || !auth.ready) { el.innerHTML = ""; return; }
  if (!auth.user) { el.innerHTML = `<button type="button" class="signin" data-act="sign-in">${gIcon}${esc(t("signIn"))}</button>`; return; }
  const u = auth.user, nm = u.displayName || u.email || "";
  el.innerHTML = `<button type="button" class="avatar" data-act="acct" aria-expanded="${auth.menu}" aria-label="${esc(t("account"))}">${u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : esc(nm.charAt(0).toUpperCase())}</button>
    ${auth.menu ? `<div class="acctmenu" role="menu"><div class="who"><b>${esc(nm)}</b>${u.email && u.email !== nm ? `<span>${esc(u.email)}</span>` : ""}<span class="synced">${esc(t("syncedNote"))}</span></div><button type="button" role="menuitem" data-act="sign-out">${esc(t("signOut"))}</button></div>` : ""}`;
}
const gIcon = '<svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

async function put(col, id, data) {
  data = clean({ ...data }); delete data.id;
  state[col][id] = { ...data, id };
  if (state.mode === "cloud" && auth.user) {
    rerender();
    try { await fb.fs.setDoc(fb.fs.doc(fb.db, "users", auth.user.uid, col, id), data); }
    catch (e) { toast(e.code === "resource-exhausted" ? "toast.full" : "toast.saveErr", { code: e.code || "error" }); }
  } else { saveLocal(); rerender(); }
}
async function del(col, id) {
  delete state[col][id];
  if (state.mode === "cloud" && auth.user) {
    rerender();
    try { await fb.fs.deleteDoc(fb.fs.doc(fb.db, "users", auth.user.uid, col, id)); } catch (e) { toast("toast.delErr", { code: e.code || "error" }); }
  } else { saveLocal(); rerender(); }
}

/* backup: export / import a JSON file */
function exportBackup() {
  const strip = m => Object.fromEntries(Object.entries(m).map(([k, v]) => { const x = { ...v }; delete x.id; return [k, x]; }));
  const blob = new Blob([JSON.stringify({ app: "origami-brew-log", version: 1, exportedAt: new Date().toISOString(), beans: strip(state.beans), brews: strip(state.brews) }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `origami-brew-log-${today()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function importBackup(file) {
  if (!file) return;
  let j;
  try { j = JSON.parse(await file.text()); } catch { return toast("toast.badBackup"); }
  if (!j || typeof j !== "object" || (!j.beans && !j.brews)) return toast("toast.badBackup");
  let n = 0;
  for (const c of ["beans", "brews"]) for (const [id, d] of Object.entries(j[c] || {})) {
    if (!d || typeof d !== "object" || !/^[\w.:@+~-]{1,120}$/.test(id)) continue;
    await put(c, id, d); n++;
  }
  toast("toast.imported", { n });
}

/* ---------------- UI state ---------------- */
const ui = {
  tab: ["beans", "brew", "guide"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "beans",
  beanId: lsGet("obl-bean", null),
  beanForm: null, logOpen: false, confirm: null, setups: lsGet("obl-setups", {}) || {}, sort: lsGet("obl-sort", "newest") || "newest", doses: lsGet("obl-doses", {}) || {},
  draft: null, importUrl: "", importMsg: null, importHints: null, importing: false, pasteOpen: false,
};
const resetImport = () => Object.assign(ui, { draft: null, importUrl: "", importMsg: null, importHints: null, importing: false, pasteOpen: false });
let timer = { start: 0, acc: 0, running: false, raf: 0 }, wakeLock = null;

const beansList = () => Object.values(state.beans).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
const brewsList = () => Object.values(state.brews);
const currentBean = () => state.beans[ui.beanId] || beansList()[0] || null;
const setDose = (bean, g) => {
  const lv = captureLog();
  const d = g == null ? null : Math.round(clamp(+g || 15, 8, 40) * 2) / 2;
  ui.doses = { ...ui.doses }; if (d == null) delete ui.doses[bean.id]; else ui.doses[bean.id] = d;
  lsSet("obl-doses", ui.doses); render(); restoreLog(lv);
};
const currentSetup = bean => SETUPS[ui.setups[bean.id]] ? ui.setups[bean.id] : setupOf(bean);

function setTab(x) { ui.tab = x; try { history.replaceState(null, "", "#" + x); } catch {} render(); window.scrollTo(0, 0); }
function pickBean(id) { ui.beanId = id; lsSet("obl-bean", id); ui.logOpen = false; resetTimer(); }
function setLang(l) {
  if (!I18N[l] || l === lang) return;
  if ($("#beanform")) ui.draft = readBeanForm();
  const logVals = captureLog();
  lang = l; lsSet("obl-lang", l); render(); restoreLog(logVals);
}

/* ---------------- render ---------------- */
const ROAST_COLORS = { light: "#C79A6A", "medium-light": "#A67245", medium: "#83522F", "medium-dark": "#5C3822", dark: "#352015" };
const roastColor = k => ROAST_COLORS[k] || ROAST_COLORS.medium;
let curRec = null;

function render() {
  document.documentElement.lang = lang === "zh" ? "zh-Hant-TW" : "en";
  document.title = t("app");
  $(".brand h1").textContent = t("app");
  document.querySelectorAll("nav.tabs button").forEach(b => { b.setAttribute("aria-selected", b.dataset.tab === ui.tab); b.textContent = t("tab." + b.dataset.tab); });
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  paintNotice(); paintAccount();
  const app = $("#app");
  curRec = null;
  if (ui.tab === "beans") app.innerHTML = viewBeans();
  else if (ui.tab === "brew") app.innerHTML = viewBrew();
  else app.innerHTML = viewGuide();
  bind();
}

const sgn = (n, u = "") => n > 0 ? `+${+n.toFixed(1)}${u}` : n < 0 ? `−${+Math.abs(n).toFixed(1)}${u}` : "";
const noteTags = s => String(s || "").split(/[,，、·]/).map(x => x.trim()).filter(Boolean).slice(0, 5);

function beanChips(b) {
  const rest = daysSince(b.roastDate);
  return `<div class="chips">${b.example ? `<span class="chip ex">${t("example")}</span>` : ""}
    <span class="chip"><span class="roastdot" style="background:${roastColor(b.roast)}"></span>${esc(roastName(b.roast))}</span>
    <span class="chip">${esc(procName(b.process))}</span>
    ${b.altitude ? `<span class="chip">${esc(t("chip.alt", { n: b.altitude }))}</span>` : ""}
    ${b.roastDate && rest >= 0 ? `<span class="chip">${esc(t("chip.rest", { n: rest }))}</span>` : ""}</div>`;
}

/* ---------- Beans (shelf) ---------- */
const HEART = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17.2 3.4 10.9A4.1 4.1 0 0 1 10 5.6a4.1 4.1 0 0 1 6.6 5.3z"/></svg>';
const PEAK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 16.5 8 5l3.4 6.3L13.4 8l4.6 8.5z"/></svg>';
function rateRow(bean, kind) {
  const v = clamp(Math.round(+bean[kind] || 0), 0, 5), lvls = t(kind === "favourite" ? "favLv" : "diffLv"), name = t(kind === "favourite" ? "fav" : "diff");
  return `<div class="rate ${kind}" role="group" aria-label="${esc(name)}">
    <span class="rname">${esc(name)}</span>
    <span class="rpips">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-act="rate" data-kind="${kind}" data-id="${esc(bean.id)}" data-v="${n}" class="${n <= v ? "on" : ""}" aria-pressed="${n === v}" aria-label="${esc(name)} ${n}/5 · ${esc(lvls[n - 1])}${n === v ? " · " + esc(t("tapClear")) : ""}" title="${esc(lvls[n - 1])}">${kind === "favourite" ? HEART : PEAK}</button>`).join("")}</span>
    <span class="rlabel">${esc(v ? lvls[v - 1] : t("notRated"))}</span></div>`;
}
const SORTS = ["newest", "fav", "easy", "hard"];
function shelfList() {
  const l = beansList(), s = ui.sort;
  const f = b => +b.favourite || 0, d = b => +b.difficulty || 0;
  if (s === "fav") return l.slice().sort((a, b) => f(b) - f(a));
  if (s === "easy") return l.slice().sort((a, b) => (d(a) || 9) - (d(b) || 9));
  if (s === "hard") return l.slice().sort((a, b) => d(b) - d(a));
  return l;
}
function viewBeans() {
  if (!state.ready) return `<div class="wrap stack"><div class="empty">${t("loadingBeans")}</div></div>`;
  const list = shelfList(), brews = brewsList(), cur = currentBean();
  let h = `<div class="wrap stack">
    <div class="row between" style="align-items:flex-end"><div><span class="eyebrow">${t("tab.beans")}</span><h2>${t("shelfTitle")}</h2><p class="lede">${t("beansIntro")}</p></div>
    ${list.length ? `<div class="row"><label class="sortsel"><span>${t("sortBy")}</span><select id="shelf-sort">${SORTS.map(k => `<option value="${k}" ${ui.sort === k ? "selected" : ""}>${esc(t("sort." + k))}</option>`).join("")}</select></label><button class="primary" data-act="new-bean">${t("addBean")}</button></div>` : ""}</div>`;
  if (ui.beanForm) h += beanForm(ui.beanForm === "new" ? null : state.beans[ui.beanForm]);
  h += `<div class="shelf">`;
  if (!ui.beanForm) h += `<div class="bag add" role="button" tabindex="0" data-act="new-bean"><span class="plus" aria-hidden="true">+</span><span class="name">${t("addBagTile")}</span><span class="muted" style="font-size:.88rem">${t("addBagSub")}</span></div>`;
  for (const b of list) {
    const mine = brews.filter(x => x.beanId === b.id);
    const best = mine.reduce((m, x) => Math.max(m, +x.score || 0), 0);
    const last = mine.map(x => x.date).sort().pop();
    const c = roastColor(b.roast);
    const rest = daysSince(b.roastDate);
    h += `<div class="bag" role="button" tabindex="0" data-act="open-bean" data-id="${esc(b.id)}" aria-current="${!!(cur && cur.id === b.id)}">
      <div class="band" style="background:linear-gradient(135deg,${c},color-mix(in srgb,${c} 55%,#1a0f0a))">
        <span class="eyebrow">${esc(roastName(b.roast))} · ${esc(procName(b.process))}${b.example ? " · " + t("example") : ""}</span></div>
      <div class="body">
        <div class="name">${esc(b.name)}</div>
        <div class="origin">${esc([b.roaster, b.origin].filter(Boolean).join(" · "))}${b.variety ? `<br>${esc(b.variety)}${b.altitude ? " · " + esc(t("chip.alt", { n: b.altitude })) : ""}` : ""}</div>
        ${noteTags(b.notes).length ? `<div class="chips">${noteTags(b.notes).map(n => `<span class="tag">${esc(n)}</span>`).join("")}</div>` : ""}
        <div class="ratings">${rateRow(b, "favourite")}${rateRow(b, "difficulty")}</div>
        <div class="foot"><span>${mine.length ? `${t("brewsCount", { n: mine.length })} · ${t("best")} <b>${best}/10</b>` : t("notBrewed")}</span>
          <span>${b.roastDate && rest >= 0 ? esc(t("chip.rest", { n: rest })) : last ? esc(fmtD(last)) : ""}</span></div>
      </div></div>`;
  }
  h += `</div>`;
  if (!list.length && !ui.beanForm) h += `<div class="empty"><strong>${t("noBeans")}</strong>${t("noBeansBody")}</div>`;
  h += `<div class="backup"><div><span class="eyebrow">${t("backupTitle")}</span><p>${t(state.mode === "cloud" ? "backupCloud" : "backupLocal")}</p></div>
    <div class="row"><button type="button" data-act="export">${t("exportBtn")}</button><button type="button" data-act="import-backup">${t("importBackupBtn")}</button></div></div>`;
  return h + `</div>`;
}

function beanForm(b) {
  const v = ui.draft || b || { roast: "light", process: "washed", setup: "origami-cone" };
  const opt = (keys, pre, sel) => keys.map(k => `<option value="${k}" ${k === sel ? "selected" : ""}>${esc(t(pre + k))}</option>`).join("");
  const im = ui.importMsg;
  return `<div class="card"><div class="card-h"><h3>${b ? t("editBean") : t("newBean")}</h3><button class="ghost" data-act="cancel-bean">${t("cancel")}</button></div>
  <div class="import">
    <span class="eyebrow" style="color:var(--crema)">${t("importHead")}</span>
    <div class="row">
      <input id="im-url" type="url" inputmode="url" placeholder="https://hatchcrafted.com/shop/…" value="${esc(ui.importUrl || "")}" aria-label="${esc(t("importUrlAria"))}">
      <button type="button" class="qrbtn" data-act="scan-qr" ${ui.importing ? "disabled" : ""}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 7h4v4H7zM13 13h4v4h-4zM13 7h4M7 13v4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>${t("scanQR")}</button>
      <button type="button" class="primary" data-act="import-url" ${ui.importing ? "disabled" : ""}>${ui.importing ? t("reading") : t("importBtn")}</button>
      <input type="file" id="qr-file" accept="image/*" capture="environment" hidden>
    </div>
    <p class="muted" style="margin:0;font-size:.82rem">${t("importHelp")}</p>
    ${im ? `<p class="imsg ${im.kind}">${esc(t(im.key, { ...(im.params || {}), missing: ((im.params || {}).missingKeys || []).map(k => t(k)).join(lang === "zh" ? "、" : ", ") }))}</p>` : ""}
    ${ui.importHints && ui.importHints.length ? `<ul class="hints">${ui.importHints.map(x => `<li>${esc(whyText(x))}</li>`).join("")}</ul>` : ""}
    <details id="im-paste-box" ${ui.pasteOpen ? "open" : ""}><summary>${t("pasteSummary")}</summary>
      <p class="muted" style="margin:0 0 8px;font-size:.85rem">${t("pasteHelp")}</p>
      <textarea id="im-paste" aria-label="${esc(t("pasteAria"))}" placeholder="El Paraiso Pink Bourbon Washed&#10;CA$35.00&#10;Origin: …"></textarea>
      <div class="row" style="margin-top:8px"><button type="button" data-act="import-paste">${t("fillFromText")}</button></div>
    </details>
  </div>
  <form id="beanform">
    <div class="fields">
      <label class="f" style="grid-column:1/-1">${t("f.name")}<input id="bf-name" name="name" required value="${esc(v.name)}" placeholder="${esc(t("ph.name"))}"></label>
      <label class="f">${t("f.roaster")}<input id="bf-roaster" name="roaster" value="${esc(v.roaster)}"></label>
      <label class="f">${t("f.producer")}<input id="bf-producer" name="producer" value="${esc(v.producer)}" placeholder="${esc(t("ph.producer"))}"></label>
      <label class="f">${t("f.origin")}<input id="bf-origin" name="origin" value="${esc(v.origin)}" placeholder="${esc(t("ph.origin"))}"></label>
      <label class="f">${t("f.variety")}<input id="bf-variety" name="variety" value="${esc(v.variety)}" placeholder="${esc(t("ph.variety"))}"></label>
      <label class="f">${t("f.process")}<select id="bf-process" name="process">${opt(PROC_KEYS, "proc.", v.process)}</select></label>
      <label class="f">${t("f.roast")}<select id="bf-roast" name="roast">${opt(ROAST_KEYS, "roast.", v.roast)}</select></label>
      <label class="f">${t("f.alt")}<input id="bf-alt" name="altitude" type="number" inputmode="numeric" value="${esc(v.altitude)}" placeholder="${esc(t("ph.alt"))}"></label>
      <label class="f">${t("f.roastDate")}<input id="bf-rd" name="roastDate" type="date" value="${esc(v.roastDate)}"></label>
      <label class="f">${t("f.setup")}<select id="bf-setup" name="setup">${opt(SETUP_KEYS, "setup.", setupOf(v))}</select></label>
      <label class="f">${t("f.harvest")}<input id="bf-harvest" name="harvest" value="${esc(v.harvest)}" placeholder="${esc(t("ph.harvest"))}"></label>
      <label class="f" style="grid-column:1/-1">${t("f.notes")}<input id="bf-notes" name="notes" value="${esc(v.notes)}" placeholder="${esc(t("ph.notes"))}"></label>
      <input type="hidden" id="bf-src" name="sourceUrl" value="${esc(v.sourceUrl)}">
    </div>
    <div class="row">
      <button class="primary" type="submit">${b ? t("saveChanges") : t("addBean")}</button>
      <button type="button" data-act="cancel-bean">${t("cancel")}</button>
    </div>
  </form></div>`;
}

/* ---------- SVG pieces ---------- */
function dialSVG(clicks) {
  const cx = 120, cy = 120, R = 92, max = 40, a0 = 135, span = 270;
  const ang = c => (a0 + (c / max) * span) * Math.PI / 180;
  const pt = (c, r) => [cx + r * Math.cos(ang(c)), cy + r * Math.sin(ang(c))];
  const arc = (c1, c2, r) => { const [x1, y1] = pt(c1, r), [x2, y2] = pt(c2, r); const large = ((c2 - c1) / max) * span > 180 ? 1 : 0; return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
  let ticks = "";
  for (let c = 0; c <= max; c++) {
    const major = c % 5 === 0, [x1, y1] = pt(c, R - (major ? 12 : 7)), [x2, y2] = pt(c, R);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c === clicks ? "var(--hero-crema)" : "rgba(245,235,221,.5)"}" stroke-width="${major ? 2 : 1}" stroke-linecap="round"/>`;
    if (major) { const [lx, ly] = pt(c, R - 24); ticks += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" font-size="10" font-family="DM Mono, monospace" fill="rgba(245,235,221,.55)">${c}</text>`; }
  }
  const [px, py] = pt(clicks, R - 30), [kx, ky] = pt(clicks, R + 8);
  return `<svg viewBox="0 0 240 222" role="img" aria-label="${esc(t("ro.grind"))} ${clicks}">
    <path d="${arc(0, max, R + 8)}" fill="none" stroke="rgba(245,235,221,.08)" stroke-width="6" stroke-linecap="round"/>
    <path d="${arc(20, 30, R + 8)}" fill="none" stroke="rgba(226,174,103,.45)" stroke-width="6" stroke-linecap="round"/>
    ${ticks}
    <circle cx="${cx}" cy="${cy}" r="${R - 38}" fill="rgba(0,0,0,.25)" stroke="rgba(245,235,221,.12)"/>
    <line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="var(--hero-crema)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="5" fill="var(--hero-crema)"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="var(--hero-crema)"/>
    <text x="${cx}" y="${cy + 42}" text-anchor="middle" font-size="40" font-family="DM Mono, monospace" fill="var(--hero-ink)">${clicks}</text>
    <text x="${cx}" y="${cy + 96}" text-anchor="middle" font-size="11" font-family="Hanken Grotesk, sans-serif" fill="rgba(245,235,221,.6)">${esc(t("unit.clicks"))} · ≈ ${clicks * MICRONS_PER_CLICK} µm</text>
  </svg>`;
}

function setupIcon(k, col = "currentColor") {
  const p = {
    "origami-cone": `<path d="M2 3h12l-4.5 8h-3z" fill="none" stroke="${col}" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 3l2.5 8M8 3v8M12 3l-2.5 8" stroke="${col}" stroke-width=".8" opacity=".7"/>`,
    "origami-wave": `<path d="M2 3h12l-3.5 8h-5z" fill="none" stroke="${col}" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 3l2 8M8 3v8M12 3l-2 8" stroke="${col}" stroke-width=".8" opacity=".7"/>`,
    v60: `<path d="M2 3h12l-4.5 8h-3z" fill="none" stroke="${col}" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 5q3 2 6 0" fill="none" stroke="${col}" stroke-width=".8" opacity=".7"/>`,
    kalita: `<path d="M2 3h12l-3 8h-6z" fill="none" stroke="${col}" stroke-width="1.4" stroke-linejoin="round"/><path d="M6.5 11v1.5M8 11v1.5M9.5 11v1.5" stroke="${col}" stroke-width="1"/>`,
  }[k];
  return `<svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">${p}</svg>`;
}

function dripperSVG(setup) {
  const flat = setup === "kalita" || setup === "origami-wave";
  const bottomL = flat ? 76 : 90, bottomR = flat ? 124 : 110;
  let outline;
  if (setup.startsWith("origami")) {
    let pts = [], n = 10;
    for (let i = 0; i <= n; i++) { const f = i / n; pts.push([24 + (bottomL - 24) * f - (i % 2 ? 0 : 5), 18 + 86 * f]); }
    let rpts = [];
    for (let i = n; i >= 0; i--) { const f = i / n; rpts.push([176 + (bottomR - 176) * f + (i % 2 ? 0 : 5), 18 + 86 * f]); }
    outline = "M" + pts.concat(rpts).map(p => p.map(v => v.toFixed(1)).join(" ")).join("L") + "Z";
  } else outline = `M24 18L176 18L${bottomR} 104L${bottomL} 104Z`;
  const inner = `M34 24L166 24L${bottomR - 4} 100L${bottomL + 4} 100Z`;
  const handle = setup === "v60" || setup === "kalita" ? `<path d="M176 34q22 4 18 26t-26 20" fill="none" stroke="var(--muted)" stroke-width="5" stroke-linecap="round"/>` : "";
  return `<svg viewBox="0 0 210 250" role="img" aria-label="${esc(setupName(setup))}">
    <defs>
      <clipPath id="bedclip"><path d="${inner}"/></clipPath>
      <clipPath id="srvclip"><rect x="52" y="132" width="106" height="100" rx="18"/></clipPath>
      <linearGradient id="cof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--crema)"/><stop offset=".12" stop-color="var(--coffee)"/><stop offset="1" stop-color="var(--coffee)"/></linearGradient>
    </defs>
    <g class="steam" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" ${timer.running ? "" : 'style="display:none"'} id="steam">
      <path d="M80 12q-6-6 0-12"/><path d="M105 10q-6-6 0-12"/><path d="M130 12q-6-6 0-12"/></g>
    <rect x="52" y="132" width="106" height="100" rx="18" fill="var(--sunk)"/>
    <g clip-path="url(#srvclip)"><rect id="srv-fill" x="52" y="232" width="106" height="0" fill="url(#cof)"/></g>
    <rect x="52" y="132" width="106" height="100" rx="18" fill="none" stroke="var(--muted)" stroke-width="2.5"/>
    <path d="M158 156q20 0 20 22t-20 22" fill="none" stroke="var(--muted)" stroke-width="5" stroke-linecap="round"/>
    <rect x="70" y="104" width="70" height="10" rx="4" fill="var(--muted)"/>
    <path d="M${bottomL + 8} 114h${bottomR - bottomL - 16}v10h-${bottomR - bottomL - 16}z" fill="var(--muted)" opacity=".6"/>
    <path d="${inner}" fill="var(--card)"/>
    <g clip-path="url(#bedclip)"><rect id="bed-fill" x="20" y="104" width="170" height="0" fill="url(#cof)" opacity=".92"/>
      <rect x="20" y="86" width="170" height="18" fill="var(--coffee)" opacity=".55"/></g>
    <path d="${outline}" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
    ${handle}
  </svg>`;
}

function compassSVG(x, y, size = 64, showAim = false) {
  const s = size, c = s / 2, step = (s - 12) / 4, px = 6 + (x + 2) * step, py = 6 + (2 - y) * step;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" aria-hidden="true" class="mini">
    <rect x="1" y="1" width="${s - 2}" height="${s - 2}" rx="10" fill="var(--sunk)" stroke="var(--line)"/>
    <line x1="${c}" y1="4" x2="${c}" y2="${s - 4}" stroke="var(--line)"/><line x1="4" y1="${c}" x2="${s - 4}" y2="${c}" stroke="var(--line)"/>
    <circle cx="${c}" cy="${c}" r="${step * .55}" fill="color-mix(in srgb,var(--leaf) 25%,transparent)"/>
    ${showAim && (x || y) ? `<line x1="${px}" y1="${py}" x2="${c}" y2="${c}" stroke="var(--crema)" stroke-width="1.5" stroke-dasharray="3 3"/>` : ""}
    <circle cx="${px}" cy="${py}" r="${Math.max(4, s / 14)}" fill="var(--crema)" stroke="var(--card)" stroke-width="2"/>
  </svg>`;
}
const compassLabel = (x, y) => (x === 0 && y === 0) ? t("ext.0") : [x ? t("ext." + x) : "", y ? t("str." + y) : ""].filter(Boolean).join(lang === "zh" ? "，" : " · ");

/* ---------- Brew ---------- */
function viewBrew() {
  if (!state.ready) return `<div class="wrap stack"><div class="empty">${t("loading")}</div></div>`;
  const bean = currentBean();
  if (!bean) return `<div class="wrap stack"><div class="empty"><strong>${t("addBeanFirst")}</strong>${t("addBeanFirstBody")}<button class="primary" data-act="go-beans">${t("goBeans")}</button></div></div>`;
  const brews = brewsList(), setup = currentSetup(bean), rec = recommend(bean, brews, setup, ui.doses[bean.id]);
  if (rec.baseDose === rec.dose && ui.doses[bean.id] != null) { ui.doses = { ...ui.doses }; delete ui.doses[bean.id]; lsSet("obl-doses", ui.doses); }
  curRec = rec;
  const p = rec.prev;
  const dT = p ? rec.temp - p.temp : 0, dC = p ? rec.clicks - p.clicks : 0, dR = p ? rec.ratio - p.ratio : 0;
  const mine = brews.filter(b => b.beanId === bean.id).sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  const bestScore = mine.reduce((m, b) => Math.max(m, +b.score || 0), 0);
  const el = elapsed();
  const beanOpts = beansList().map(b => `<option value="${esc(b.id)}" ${b.id === bean.id ? "selected" : ""}>${esc(b.name)}</option>`).join("");
  const tempPct = clamp((rec.temp - 80) / 20 * 100, 0, 100);
  const cup = Math.max(0, Math.round(rec.water - rec.dose * 2));
  const sub = [bean.roaster, bean.producer, bean.origin, bean.variety].filter(Boolean).join(" · ");
  const end = rec.target[1] + 20;
  const last = mine[0];

  let h = `<section class="hero"><div class="wrap">
    <div class="hero-top">
      <div class="hero-title"><span class="eyebrow">${t("heroEyebrow")}</span>
        <label class="beanpick"><span class="sr" style="position:absolute;left:-9999px">${t("beanAria")}</span><select id="beanpick">${beanOpts}</select>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="var(--hero-crema)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></label>
        ${sub || bean.notes || bean.sourceUrl ? `<div class="hero-sub">${esc(sub)}${bean.notes ? `${sub ? " · " : ""}<em>${esc(bean.notes)}</em>` : ""}${/^https:\/\//.test(bean.sourceUrl || "") ? ` · <a href="${esc(bean.sourceUrl)}" target="_blank" rel="noopener">${t("productPage")}</a>` : ""}</div>` : ""}
        ${beanChips(bean)}
        <div class="ratings hero-r">${rateRow(bean, "favourite")}${rateRow(bean, "difficulty")}</div>
      </div>
      <div class="row"><button data-act="edit-bean" data-id="${esc(bean.id)}">${t("editBean")}</button><button class="primary" data-act="open-log">${t("logBrew")}</button></div>
    </div>
    <div class="seg" role="group" aria-label="${esc(t("dripper"))}">${SETUP_KEYS.map(k => `<button data-act="setup" data-setup="${k}" aria-pressed="${k === setup}">${setupIcon(k)}${esc(setupName(k))}</button>`).join("")}</div>

    <div class="board">
      <div class="readouts">
        <div class="ro accent"><span class="eyebrow">${t("ro.temp")}${dT ? `<span class="delta">${sgn(dT, "°")}</span>` : ""}</span>
          <span class="v">${rec.temp}<small>°C</small></span>
          <div class="thermo" aria-hidden="true"><i style="left:${tempPct}%"></i></div>
          <span class="s">${t("ro.tempSub")}</span></div>
        <div class="ro"><span class="eyebrow">${t("ro.ratio")}${dR ? `<span class="delta">${sgn(dR)}</span>` : ""}</span>
          <span class="v">1:${+rec.ratio.toFixed(1)}</span>
          <div class="ratiobar" aria-hidden="true"><b style="width:${(100 / (rec.ratio + 1)).toFixed(1)}%"></b><span></span></div>
          <span class="s">${t("ro.ratioSub", { g: (1000 / rec.ratio).toFixed(0) })}</span></div>
        <div class="ro accent"><span class="eyebrow">${t("ro.coffee")}</span>
          <span class="dose"><input id="dose-in" type="number" inputmode="decimal" step="0.5" min="8" max="40" value="${rec.dose}" style="width:${String(rec.dose).length + 0.5}ch;min-width:${String(rec.dose).length + 0.5}ch" aria-label="${esc(t("doseInput"))}"><small>g</small></span>
          <div class="presets"><button type="button" class="step" data-act="dose-step" data-d="-0.5" aria-label="${esc(t("doseLess"))}">−</button><button type="button" class="step" data-act="dose-step" data-d="0.5" aria-label="${esc(t("doseMore"))}">+</button>
          ${[12, 15, 18, 20].map(g => `<button type="button" data-act="dose-set" data-g="${g}" aria-pressed="${g === rec.dose}">${g}</button>`).join("")}</div>
          <span class="s">${rec.scaled ? `<button type="button" class="linkbtn" data-act="dose-reset">${esc(t("doseReset", { g: rec.baseDose }))}</button>` : t("ro.coffeeSub")}</span></div>
        <div class="ro"><span class="eyebrow">${t("ro.water")}${rec.scaled ? `<span class="delta">${sgn(rec.water - Math.round(rec.baseDose * rec.ratio), "g")}</span>` : ""}</span>
          <span class="v">${rec.water}<small>g</small></span>
          <span class="s">${t("ro.waterSub", { cup })}</span></div>
      </div>
      <div class="dialcard">
        <span class="eyebrow"><span>${t("ro.grind")}</span>${dC ? `<span class="delta">${sgn(dC)}</span>` : ""}</span>
        ${dialSVG(rec.clicks)}
        <div class="t">
          <div><b>${fmtT(rec.target[0])}–${fmtT(rec.target[1])}</b><span>${t("ro.target")}</span></div>
          <div><b>${rec.schedule.length}</b><span>${t("poursLabel")}</span></div>
        </div>
      </div>
    </div>
  </div></section>

  <div class="wrap stack">
    <div class="card">
      <div class="card-h"><h3>${t("brewAlong")}</h3><span class="muted" style="font-size:.85rem">${setupIcon(setup)} ${esc(setupName(setup))}</span></div>
      <div class="brewalong">
        <div class="illus">
          ${dripperSVG(setup)}
          <span class="clock" id="clock">${fmtT(el)}</span>
          <div class="row" style="justify-content:center">
            <button class="primary" data-act="timer">${timer.running ? t("timer.pause") : el ? t("timer.resume") : t("timer.start")}</button>
            <button data-act="timer-reset" ${el ? "" : "disabled"}>${t("timer.reset")}</button>
          </div>
        </div>
        <div style="min-width:0;display:flex;flex-direction:column;gap:12px">
          <p class="nownext" id="nownext" style="text-align:left">${t("ready")}</p>
          <div class="track" aria-hidden="true">
            <div class="zone" style="left:${(rec.target[0] / end * 100).toFixed(1)}%;width:${((rec.target[1] - rec.target[0]) / end * 100).toFixed(1)}%"></div>
            ${rec.schedule.map(s => `<span class="mk" style="left:${(s.at / end * 100).toFixed(1)}%"></span>`).join("")}
            <div class="fill" id="track-fill"></div>
          </div>
          <ol class="tl" id="sched">
            ${rec.schedule.map((s, i) => `<li data-at="${s.at}" data-to="${s.to}"><span class="at">${fmtT(s.at)}</span><span class="dot"></span><span class="what">${esc(t(s.what))}</span><span class="to">${s.to} g<small>+${s.add} g</small></span></li>`).join("")}
            <li data-at="${rec.schedule[rec.schedule.length - 1].at + 10}" data-to="${rec.water}"><span class="at">${fmtT(rec.schedule[rec.schedule.length - 1].at + 10)}</span><span class="dot"></span><span class="what">${esc(t("step.drawdown", { t: fmtT(rec.target[1]) }))}</span><span class="to"></span></li>
          </ol>
          <p class="agit"><b>${t("agitation")}</b> ${esc(t("agit." + rec.agit))}${lang === "zh" ? "。" : ". "}${t("preheat")}</p>
        </div>
      </div>
    </div>

  ${ui.logOpen ? logForm(bean, rec) : ""}
  <div class="grid2" style="align-items:start">
    <div class="card">
      <div class="card-h"><h3>${t("whyRecipe")}</h3></div>
      <ul class="why">${rec.why.map(w => `<li>${esc(whyText(w))}</li>`).join("")}</ul>
      ${last ? `<div class="compass-wrap">${compassSVG(+last.extraction || 0, +last.strength || 0, 84, true)}<div><span class="eyebrow">${t("lastCup")}</span><div style="font-family:var(--f-display);font-size:1.1rem">${esc(compassLabel(+last.extraction || 0, +last.strength || 0))}</div><p>${t("aim")}</p></div></div>` : ""}
    </div>`;

  h += `<div class="card"><div class="card-h"><h3>${t("brewHistory")}</h3><span class="muted" style="font-size:.85rem">${mine.length ? t("brewsCount", { n: mine.length }) : ""}</span></div>`;
  if (!mine.length) h += `<div class="empty" style="padding:24px">${t("noBrews")}</div>`;
  else {
    h += `<div class="hist">`;
    for (const b of mine) {
      const e = clamp(+b.extraction || 0, -2, 2), s = clamp(+b.strength || 0, -2, 2), key = "brew:" + b.id;
      h += `<div class="h">
        <div class="scorebox ${+b.score === bestScore ? "best" : ""}" title="${esc(t("score"))}">${esc(b.score)}</div>
        ${compassSVG(e, s, 52)}
        <div style="min-width:0;display:flex;flex-direction:column;gap:3px">
          <div class="title"><strong>${fmtD(b.date)}</strong><span class="chip">${setupIcon(setupOf(b))} ${esc(t("m." + setupOf(b)))}</span>${b.example ? `<span class="chip ex">${t("example")}</span>` : ""}</div>
          <div class="meta">${esc(b.dose)} g : ${esc(b.water)} g · ${esc(b.temp)}°C · ${esc(b.clicks)} ${t("unit.clicks")} · ${b.time ? fmtT(b.time) : "–"}</div>
          <div style="font-size:.88rem">${esc(compassLabel(e, s))}${b.astringent ? ` · ${t("drying")}` : ""}${b.flat ? ` · ${t("muted")}` : ""}</div>
          ${b.notes ? `<div style="font-size:.9rem;color:var(--muted)">“${esc(b.notes)}”</div>` : ""}
        </div>
        <div>${ui.confirm === key
          ? `<button class="danger" data-act="del-brew" data-id="${esc(b.id)}">${t("del")}</button> <button class="ghost" data-act="cancel-del">${t("keep")}</button>`
          : `<button class="ghost" data-act="ask-del" data-key="${key}" aria-label="${esc(t("removeAria"))}">${t("remove")}</button>`}</div>
      </div>`;
    }
    h += `</div>`;
  }
  h += `</div></div>`;
  const bk = "bean:" + bean.id;
  h += `<div class="row" style="justify-content:flex-end">${ui.confirm === bk
    ? `<span class="muted">${t("deleteBeanAsk")}</span><button class="danger" data-act="del-bean" data-id="${esc(bean.id)}">${t("deleteBean")}</button><button data-act="cancel-del">${t("cancel")}</button>`
    : `<button class="ghost danger" data-act="ask-del" data-key="${bk}">${t("deleteThisBean")}</button>`}</div>`;
  return h + `</div>`;
}

function logForm(bean, rec) {
  const el = elapsed();
  const tm = el > 30 ? fmtT(el) : "";
  let cells = "";
  for (let y = 2; y >= -2; y--) for (let x = -2; x <= 2; x++)
    cells += `<button type="button" data-act="compass" data-x="${x}" data-y="${y}" aria-pressed="${x === 0 && y === 0}" aria-label="${esc(compassLabel(x, y))}"></button>`;
  return `<div class="card" id="logpanel"><div class="card-h"><h3>${esc(t("logTitle"))}</h3><button class="ghost" data-act="close-log">${t("cancel")}</button></div>
  <form id="logform">
    <div class="formsec"><span class="eyebrow">${t("whatYouDid")}</span>
    <div class="fields">
      <label class="f">${t("lf.date")}<input id="lf-date" name="date" type="date" value="${today()}"></label>
      <label class="f">${t("lf.setup")}<select id="lf-setup" name="setup">${SETUP_KEYS.map(k => `<option value="${k}" ${k === rec.setup ? "selected" : ""}>${esc(setupName(k))}</option>`).join("")}</select></label>
      <label class="f">${t("lf.dose")}<input id="lf-dose" name="dose" type="number" step="0.1" value="${rec.dose}"></label>
      <label class="f">${t("lf.water")}<input id="lf-water" name="water" type="number" step="1" value="${rec.water}"></label>
      <label class="f">${t("lf.temp")}<input id="lf-temp" name="temp" type="number" step="0.5" value="${rec.temp}"></label>
      <label class="f">${t("lf.clicks")}<input id="lf-clicks" name="clicks" type="number" step="1" value="${rec.clicks}"></label>
      <label class="f">${t("lf.time")}<input id="lf-time" name="time" value="${tm}" placeholder="${fmtT(rec.target[0])}"></label>
    </div></div>
    <div class="grid2" style="gap:28px">
      <div class="formsec"><span class="eyebrow">${t("tasteCompass")}</span>
        <p class="muted" style="margin:0;font-size:.86rem">${t("compassHelp")}</p>
        <div class="compass">
          <div class="yl"><span>${t("weak")}</span><span>${t("strong")}</span></div>
          <div class="cgrid" id="cgrid">${cells}</div>
          <div class="xl"><span>${t("sour")}</span><span>${t("bitter")}</span></div>
        </div>
        <div class="cread" id="cread"><b>${esc(compassLabel(0, 0))}</b></div>
        <input type="hidden" id="lf-ext" value="0"><input type="hidden" id="lf-str" value="0">
      </div>
      <div class="formsec"><span class="eyebrow">${t("scoreLabel")}</span>
        <div class="scores" id="scores">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button type="button" data-act="score" data-v="${n}" aria-pressed="${n === 7}">${n}</button>`).join("")}</div>
        <input type="hidden" id="lf-score" value="7">
        <div class="checks" style="margin-top:6px">
          <label><input type="checkbox" id="lf-astr" name="astringent"> ${t("astrCheck")}</label>
          <label><input type="checkbox" id="lf-flat" name="flat"> ${t("flatCheck")}</label>
        </div>
        <label class="f">${t("notesLabel")}<textarea id="lf-notes" name="notes" placeholder="${esc(t("notesPh"))}"></textarea></label>
      </div>
    </div>
    <div class="row"><button class="primary" type="submit">${esc(t("saveLog"))}</button><button type="button" data-act="close-log">${t("cancel")}</button></div>
  </form></div>`;
}
function paintLogControls() {
  const x = +($("#lf-ext")?.value || 0), y = +($("#lf-str")?.value || 0), sc = +($("#lf-score")?.value || 7);
  document.querySelectorAll("#cgrid button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.x === x && +b.dataset.y === y));
  const cr = $("#cread"); if (cr) cr.innerHTML = `<b>${esc(compassLabel(x, y))}</b>`;
  document.querySelectorAll("#scores button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === sc));
}
const LOG_IDS = ["lf-date", "lf-dose", "lf-water", "lf-temp", "lf-clicks", "lf-time", "lf-setup", "lf-ext", "lf-str", "lf-score", "lf-notes"];
function captureLog() {
  if (!$("#logform")) return null;
  const o = {}; LOG_IDS.forEach(id => o[id] = $("#" + id).value); o.astr = $("#lf-astr").checked; o.flat = $("#lf-flat").checked; return o;
}
function restoreLog(o) {
  if (!o || !$("#logform")) return;
  LOG_IDS.forEach(id => { $("#" + id).value = o[id]; });
  $("#lf-astr").checked = o.astr; $("#lf-flat").checked = o.flat;
  paintLogControls();
}

/* ---------- Guide ---------- */
/* ---------- Guide: how process & origin shape the cup ---------- */
const TASTE_UI = {
  en: { jump: "Jump to", secTaste: "Process & origin", tasteLede: "Two bags roasted the same way can taste worlds apart. These are the usual tendencies; every farm and lot has its own personality, so read them as a starting point, not a rule.",
    procTitle: "How process shapes the cup", procLede: "Process is what happens between picking the cherry and drying the bean. It decides how much fruit and fermentation reach the cup.",
    originTitle: "How origin shapes the cup", originLede: "Soil, climate, altitude and the varieties grown there give each region a recognisable accent.",
    otherTitle: "Altitude, variety and roast", acid: "Acidity", body: "Body", sweet: "Sweetness", notes: "Typical notes", tip: "Brew tip", yours: "Your bean",
    secRecipe: "Recipe rules", secFix: "Fixing the cup", secGear: "Grinder & drippers",
    other: [
      ["Altitude", "Higher farms grow slower, denser beans with more acidity and complexity. That's why the recipe goes 1 click finer and 1°C hotter above 1,800 m."],
      ["Variety", "Gesha: jasmine, peach, tea-like. SL28/SL34: blackcurrant, juicy. Pink Bourbon: florals and red fruit. Bourbon and Caturra: sweet, balanced. Ethiopian heirloom: floral and citrus."],
      ["Roast", "Lighter roasts keep origin and process character. Darker roasts pull everything toward chocolate, caramel and roast, so origin differences shrink."],
      ["Freshness", "Most filter coffees taste best 7–30 days after roasting. Very fresh beans are gassy (longer bloom); older beans go flat (a bit hotter and finer)."],
    ] },
  zh: { jump: "快速跳至", secTaste: "處理法與產地", tasteLede: "同樣烘焙度的兩包豆子，喝起來可能天差地遠。以下是一般傾向；每個莊園、每個批次都有自己的個性，請當作起點而不是規則。",
    procTitle: "處理法如何影響風味", procLede: "處理法是從採收咖啡果到豆子乾燥之間的過程，決定了有多少果味與發酵風味進到杯中。",
    originTitle: "產地如何影響風味", originLede: "土壤、氣候、海拔和當地種植的品種，讓每個產區都有辨識度很高的「口音」。",
    otherTitle: "海拔、品種與烘焙", acid: "酸度", body: "醇厚度", sweet: "甜感", notes: "常見風味", tip: "沖煮建議", yours: "你的豆子",
    secRecipe: "配方規則", secFix: "調整這杯", secGear: "磨豆機與濾杯",
    other: [
      ["海拔", "海拔越高，咖啡生長越慢、豆子越密實，酸質與層次也越豐富。所以海拔 1,800 公尺以上，配方會磨細 1 格、水溫 +1°C。"],
      ["品種", "藝伎：茉莉、水蜜桃、茶感。SL28/SL34：黑醋栗、多汁。粉紅波旁：花香與紅色水果。波旁、卡杜拉：甜、平衡。衣索比亞原生種：花香與柑橘。"],
      ["烘焙", "淺焙保留產地與處理法的特色；深焙會把風味都拉向巧克力、焦糖與烘焙感，產地差異也隨之變小。"],
      ["新鮮度", "多數手沖豆在烘焙後 7–30 天最好喝。太新鮮的豆子氣體多（悶蒸要久一點）；放太久會變平淡（稍微升溫、磨細）。"],
    ] },
};
const tu = k => (TASTE_UI[lang] || TASTE_UI.en)[k];

const PROCESS_GUIDE = [
  { k: "washed", m: [5, 2, 3],
    en: ["Fruit is removed before drying, so the cup shows the bean itself: clean, bright and transparent. Origin and variety come through most clearly.", "Citrus, florals, black tea, stone fruit", "The standard recipe. If it tastes thin, push extraction a little (finer or hotter)."],
    zh: ["去除果肉後再乾燥，杯中呈現的是豆子本身：乾淨、明亮、透明，最能表現產地與品種特色。", "柑橘、花香、紅茶、核果", "使用標準配方。若喝起來單薄，可稍微提高萃取（磨細或升溫）。"] },
  { k: "natural", m: [3, 5, 5],
    en: ["Dried whole inside the cherry, so fruit sugars and fermentation soak in: heavy body, jammy sweetness, berry and wine notes. Over-fermented lots can taste boozy.", "Blueberry, strawberry, tropical fruit, red wine, chocolate", "Cooler water and 1 click coarser keep it from turning muddy. The recipe already does this."],
    zh: ["整顆咖啡果帶著果肉乾燥，果糖與發酵風味滲入豆中：醇厚、果醬般的甜感，帶莓果與酒香。發酵過度時會有酒精感。", "藍莓、草莓、熱帶水果、紅酒、巧克力", "降一點水溫、磨粗 1 格，避免混濁。配方已自動調整。"] },
  { k: "honey", m: [3, 4, 5],
    en: ["The skin comes off but some sticky mucilage stays on while drying. It sits between washed and natural: rounder sweetness that keeps its clarity. Yellow, red and black honey leave more mucilage, and more fruit.", "Brown sugar, honey, stone fruit, red apple", "Usually forgiving. Start from the standard recipe."],
    zh: ["去除果皮但保留部分黏膜乾燥，介於水洗與日曬之間：甜感圓潤又保有清晰度。黃蜜、紅蜜、黑蜜保留的果膠依序越多，果味越重。", "黑糖、蜂蜜、核果、紅蘋果", "通常容錯度高，從標準配方開始即可。"] },
  { k: "anaerobic", m: [4, 4, 5],
    en: ["Fermented in sealed tanks without oxygen, sometimes with added yeast, fruit or bacteria (co-ferment) or a hot/cold thermal shock. Intense and distinctive, sometimes polarising.", "Tropical fruit, candy, cinnamon, liqueur, yogurt", "Extracts fast and can turn harsh: cooler water, a click coarser, gentle pours."],
    zh: ["在密封無氧的槽中發酵，有時加入酵母、水果或菌種（共同發酵），或做冷熱交替的熱衝擊處理。風味強烈獨特，評價也較兩極。", "熱帶水果、糖果、肉桂、利口酒、優格", "容易萃取，也容易變刺激：降溫、磨粗 1 格、輕柔注水。"] },
  { k: "wet-hulled", m: [1, 5, 3],
    en: ["An Indonesian method: the parchment is removed while the bean is still wet, then it finishes drying. Low acidity, very heavy body, earthy and herbal.", "Earth, cedar, dark chocolate, herbs, spice", "Keep extraction gentle with cooler water. Suits darker roasts and a stronger ratio."],
    zh: ["印尼特有的方式：豆子還潮濕時就脫去內果皮，再繼續乾燥。酸度低、口感非常厚重，帶土壤與草本調性。", "土壤、雪松、黑巧克力、草本、香料", "萃取保守一點、水溫降低。適合較深烘焙與較濃的粉水比。"] },
];

const ORIGIN_GUIDE = [
  { kw: ["ethiopia", "衣索比亞", "yirgacheffe", "guji", "sidam", "耶加"], m: [5, 2, 4],
    en: ["Ethiopia", "Coffee's birthplace, with thousands of heirloom varieties. Washed lots are floral and tea-like; naturals burst with blueberry and strawberry.", "Jasmine, bergamot, lemon, black tea, blueberry", "Light roasts shine here. Use the upper end of the temperature range."],
    zh: ["衣索比亞", "咖啡的發源地，擁有上千種原生品種。水洗批次花香與茶感明顯；日曬批次則充滿藍莓、草莓。", "茉莉、佛手柑、檸檬、紅茶、藍莓", "最適合淺焙，水溫可以偏高。"] },
  { kw: ["kenya", "肯亞"], m: [5, 4, 4],
    en: ["Kenya", "SL28 and SL34 at high altitude give big, juicy acidity, sometimes with a savoury, tomato-like edge.", "Blackcurrant, grapefruit, red berries, rhubarb", "Bold acidity reads as sour when under-extracted. Go a click finer before going hotter."],
    zh: ["肯亞", "SL28、SL34 品種加上高海拔，帶來飽滿多汁的酸質，有時帶番茄般的鹹鮮感。", "黑醋栗、葡萄柚、紅莓、大黃", "酸質強，萃取不足時容易變尖酸。先磨細 1 格，再考慮升溫。"] },
  { kw: ["rwanda", "burundi", "盧安達", "蒲隆地"], m: [4, 3, 4],
    en: ["Rwanda & Burundi", "Red Bourbon grown high: bright red fruit, black tea and sweet florals. Watch for the rare 'potato defect', an earthy raw-potato smell from a single bad bean.", "Red apple, cranberry, black tea, hibiscus", "Standard recipe. Washed lots behave much like Ethiopian washed coffees."],
    zh: ["盧安達、蒲隆地", "高海拔的紅波旁：明亮的紅色水果、紅茶與甜美花香。偶爾會遇到「馬鈴薯味瑕疵」，是單顆瑕疵豆帶來的生馬鈴薯土味。", "紅蘋果、蔓越莓、紅茶、洛神花", "使用標準配方。水洗批次的表現接近衣索比亞水洗。"] },
  { kw: ["colombia", "哥倫比亞", "cauca", "huila", "nariño", "narino"], m: [4, 3, 4],
    en: ["Colombia", "A huge range: classic caramel and red fruit, through to experimental lots (Pink Bourbon, thermal shock, co-ferments) from farms like El Paraíso.", "Caramel, red fruit, citrus, panela", "Very adaptable. Treat experimental lots like anaerobic coffees."],
    zh: ["哥倫比亞", "風味範圍非常廣：從經典的焦糖與紅色水果，到 El Paraíso 等莊園的實驗批次（粉紅波旁、熱衝擊、共同發酵）。", "焦糖、紅色水果、柑橘、黑糖", "適應性高。實驗處理的批次比照厭氧豆沖煮。"] },
  { kw: ["guatemala", "costa rica", "honduras", "el salvador", "nicaragua", "panama", "瓜地馬拉", "哥斯大黎加", "宏都拉斯", "薩爾瓦多", "尼加拉瓜", "巴拿馬", "gesha", "geisha", "藝伎"], m: [3, 3, 4],
    en: ["Central America", "Guatemala leans cocoa and toffee; Costa Rica is known for clean, sweet honey processes; Panama is home to Gesha, the most floral, tea-like coffee there is.", "Chocolate, toffee, apple; Gesha: jasmine, peach", "Balanced and forgiving. For Gesha, a lighter ratio (1:16–1:17) and gentle pours."],
    zh: ["中美洲", "瓜地馬拉偏可可與太妃糖；哥斯大黎加以乾淨甜美的蜜處理聞名；巴拿馬是藝伎的故鄉，花香與茶感最突出。", "巧克力、太妃糖、蘋果；藝伎：茉莉、水蜜桃", "平衡、容錯度高。藝伎用較淡的粉水比（1:16–1:17）並輕柔注水。"] },
  { kw: ["brazil", "巴西"], m: [2, 4, 4],
    en: ["Brazil", "Lower altitudes and mostly natural or pulped-natural processing: nutty, chocolatey, low acidity, heavy body. The backbone of many espresso blends.", "Peanut, milk chocolate, caramel", "Cooler water and a stronger ratio (around 1:15) bring out sweetness. It tastes flat when under-extracted."],
    zh: ["巴西", "海拔較低，多為日曬或半日曬：堅果、巧克力、低酸、口感厚重，是許多義式配方豆的骨幹。", "花生、牛奶巧克力、焦糖", "降溫、粉水比調濃（約 1:15）帶出甜感。萃取不足會顯得平淡。"] },
  { kw: ["indonesia", "sumatra", "java", "sulawesi", "印尼", "蘇門答臘", "爪哇", "蘇拉威西"], m: [1, 5, 3],
    en: ["Indonesia", "Wet-hulling gives earthy, herbal, full-bodied cups with low acidity. Sulawesi and Java tend to be a little cleaner.", "Cedar, earth, dark chocolate, clove", "Best at medium-dark roasts with gentle extraction."],
    zh: ["印尼", "濕剝處理帶來土壤、草本、厚重而低酸的口感。蘇拉威西與爪哇通常稍微乾淨一些。", "雪松、土壤、黑巧克力、丁香", "適合中深焙，萃取保守。"] },
  { kw: ["yemen", "葉門"], m: [3, 4, 4],
    en: ["Yemen", "Ancient landraces, often dried on rooftops: winey, spiced, dried fruit and cocoa. Rare and expensive.", "Raisin, cardamom, cocoa, red wine", "Treat it like a natural: cooler water, a click coarser."],
    zh: ["葉門", "古老的原生品種，常在屋頂上日曬：酒香、香料、果乾與可可，稀有且昂貴。", "葡萄乾、小荳蔻、可可、紅酒", "比照日曬豆：降溫、磨粗 1 格。"] },
];

function meterRow(m) {
  const lab = [tu("acid"), tu("body"), tu("sweet")];
  return `<div class="meters">${m.map((v, i) => `<div class="meter"><span>${lab[i]}</span><span class="pips" aria-label="${lab[i]} ${v}/5">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= v ? "on" : ""}"></i>`).join("")}</span></div>`).join("")}</div>`;
}
function tasteCard(name, eyebrow, desc, notes, tip, m, mine, swatch) {
  return `<article class="tcard ${mine ? "mine" : ""}">
    <div class="tcard-h">${swatch || ""}<div style="min-width:0"><span class="eyebrow">${esc(eyebrow)}</span><h3>${esc(name)}</h3></div>${mine ? `<span class="chip ex">${tu("yours")}</span>` : ""}</div>
    ${meterRow(m)}
    <p>${esc(desc)}</p>
    <div class="chips">${noteTags(notes).map(n => `<span class="tag">${esc(n.charAt(0).toUpperCase() + n.slice(1))}</span>`).join("")}</div>
    <p class="ttip"><b>${tu("tip")}</b> ${esc(tip)}</p>
  </article>`;
}
const PROC_CHAR = { washed: ["Clean · bright", "乾淨・明亮"], natural: ["Fruity · heavy", "果香・厚重"], honey: ["Sweet · round", "甜美・圓潤"], anaerobic: ["Intense · experimental", "強烈・實驗性"], "wet-hulled": ["Earthy · low acid", "土壤調・低酸"] };
const PROC_SWATCH = { washed: "#7FA7B8", natural: "#A2463C", honey: "#D2A04A", anaerobic: "#7B4A8C", "wet-hulled": "#5D6B45" };
function viewTaste(bean) {
  const o = String((bean && bean.origin) || "").toLowerCase() + " " + String((bean && bean.name) || "").toLowerCase() + " " + String((bean && bean.variety) || "").toLowerCase();
  const L = lang === "zh" ? "zh" : "en";
  return `<section id="g-taste" class="stack" style="padding-top:8px">
    <div><span class="eyebrow">${tu("secTaste")}</span><h2>${tu("procTitle")}</h2><p class="lede">${tu("procLede")} ${tu("tasteLede")}</p></div>
    <div class="tgrid">${PROCESS_GUIDE.map(p => tasteCard(procName(p.k), PROC_CHAR[p.k][L === "zh" ? 1 : 0], p[L][0], p[L][1], p[L][2], p.m, bean && bean.process === p.k,
      `<span class="swatch" style="background:${PROC_SWATCH[p.k]}"></span>`)).join("")}</div>
    <div id="g-origin" style="padding-top:12px"><span class="eyebrow">${tu("secTaste")}</span><h2>${tu("originTitle")}</h2><p class="lede">${tu("originLede")}</p></div>
    <div class="tgrid">${ORIGIN_GUIDE.map(g => tasteCard(g[L][0], regionOf(g, L), g[L][1], g[L][2], g[L][3], g.m, !!bean && g.kw.some(k => o.includes(k)),
      `<span class="swatch pin" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 13s4.5-4.2 4.5-7.3A4.5 4.5 0 0 0 2.5 5.7C2.5 8.8 7 13 7 13z" fill="currentColor"/><circle cx="7" cy="5.7" r="1.6" fill="var(--card)"/></svg></span>`)).join("")}</div>
    <div class="card"><h3>${tu("otherTitle")}</h3>
      <div class="facts">${tu("other").map(([h, p]) => `<div><span class="eyebrow">${esc(h)}</span><p>${esc(p)}</p></div>`).join("")}</div></div>
  </section>`;
}
function regionOf(g, L) {
  const r = { ethiopia: ["Africa", "非洲"], kenya: ["Africa", "非洲"], rwanda: ["Africa", "非洲"], colombia: ["South America", "南美洲"], guatemala: ["Central America", "中美洲"], brazil: ["South America", "南美洲"], indonesia: ["Asia-Pacific", "亞太"], yemen: ["Arabian Peninsula", "阿拉伯半島"] }[g.kw[0]] || ["", ""];
  return r[L === "zh" ? 1 : 0];
}

function viewGuide() {
  const bean = currentBean();
  const rec = bean ? recommend(bean, brewsList(), currentSetup(bean), ui.doses[bean.id]) : null;
  const ranges = [["espresso", 8, 13], ["moka", 13, 18], ["aero", 14, 22], ["origami-cone", 20, 27], ["origami-wave", 21, 28], ["v60", 21, 28], ["kalita", 21, 29], ["chemex", 26, 32], ["press", 30, 36]];
  const lo = 6, hi = 38, pct = x => ((x - lo) / (hi - lo)) * 100;
  return `<div class="wrap stack">
  <div><span class="eyebrow">${t("tab.guide")}</span><h2>${t("guideTitle")}</h2><p class="lede">${t("guideIntro")}</p></div>
  <nav class="jump" aria-label="${esc(tu("jump"))}"><span class="eyebrow">${tu("jump")}</span>
    ${[["g-taste", tu("procTitle")], ["g-origin", tu("originTitle")], ["g-recipe", tu("secRecipe")], ["g-fix", tu("secFix")], ["g-gear", tu("secGear")]].map(([id, l]) => `<button type="button" data-act="jump" data-to="${id}">${esc(l)}</button>`).join("")}</nav>
  ${viewTaste(bean)}
  <div id="g-recipe" style="padding-top:12px"><span class="eyebrow">${tu("secRecipe")}</span><h2>${t("startPoints")}</h2></div>

  <div class="card">
  <div class="tablewrap"><table class="guide-table"><thead><tr><th>${t("gth.roast")}</th><th class="num">${t("gth.water")}</th><th class="num">${t("gth.ratio")}</th><th class="num">${t("gth.clicks")}</th><th class="num">${t("gth.pours")}</th><th>${t("gth.agit")}</th></tr></thead><tbody>
  ${Object.entries(BASE).map(([k, b]) => `<tr ${bean && bean.roast === k ? 'class="now"' : ""}><td><span class="roastdot" style="background:${roastColor(k)}"></span>${roastName(k)}</td><td class="num mono">${b.temp}°C</td><td class="num mono">1:${b.ratio}</td><td class="num mono">${b.clicks}</td><td class="num mono">${b.pours}</td><td>${t("agit." + b.agit)}</td></tr>`).join("")}
  </tbody></table></div>
  <p class="muted" style="margin:0;font-size:.86rem">${t("adjustNote")}</p></div>

  <div id="g-fix" class="card"><h3>${t("fixCup")}</h3>
  <div class="tablewrap"><table class="guide-table"><thead><tr><th>${t("fth.taste")}</th><th>${t("fth.cause")}</th><th>${t("fth.change")}</th></tr></thead><tbody>
    ${t("fixRows").map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
  </tbody></table></div>
  <p class="muted" style="margin:0;font-size:.86rem">${t("fixNote")}</p></div>

  <div id="g-gear" class="grid2">
    <div class="card"><h3>${t("clickRanges")}</h3>
      <div class="chart">${ranges.map(([k, a, b]) => `<div class="crow"><span>${t("m." + k)}</span><div class="ctrack"><div class="cbar ${SETUPS[k] ? "me" : ""}" style="left:${pct(a)}%;width:${pct(b) - pct(a)}%"></div>${rec && k === rec.setup ? `<div class="ctick" style="left:calc(${pct(rec.clicks)}% - 1px)" title="${esc(t("yourNext"))}"></div>` : ""}</div></div>`).join("")}
      <div class="crow"><span></span><div class="dialscale"><span>6</span><span>14</span><span>22</span><span>30</span><span>38</span></div></div></div>
      <p class="muted" style="margin:0;font-size:.86rem">${t("clickNote", { um: MICRONS_PER_CLICK })} ${rec ? t("clickMark", { n: rec.clicks }) : ""}</p>
    </div>
    <div class="card"><h3>${t("drippersTitle")}</h3>
      <div class="tablewrap"><table class="guide-table"><thead><tr><th>${t("dth.dripper")}</th><th class="num">${t("dth.grind")}</th><th class="num">${t("dth.time")}</th><th>${t("dth.char")}</th></tr></thead><tbody>
      ${SETUP_KEYS.map(k => { const l = 150 + SETUPS[k].time; return `<tr ${rec && rec.setup === k ? 'class="now"' : ""}><td>${setupIcon(k)} ${esc(setupName(k))}</td><td class="num mono">${SETUPS[k].clicks ? "+" + SETUPS[k].clicks : "0"}</td><td class="num mono">${fmtT(l)}–${fmtT(l + 30)}</td><td>${t("dchar." + k)}</td></tr>`; }).join("")}
      </tbody></table></div>
      <p class="muted" style="margin:0;font-size:.86rem">${t("drippersNote")}</p>
      <p style="margin:0;font-size:.9rem">${t("waterNote")}</p>
    </div>
  </div>
  </div>`;
}

/* ---------------- timer ---------------- */
function elapsed() { return timer.acc + (timer.running ? (performance.now() - timer.start) / 1000 : 0); }
function tick() {
  const el = elapsed(), c = $("#clock");
  if (c) c.textContent = fmtT(el);
  const rec = curRec;
  const rows = document.querySelectorAll("#sched li");
  if (rec && rows.length) {
    let cur = -1;
    rows.forEach((r, i) => { if (+r.dataset.at <= el && (el > 0 || timer.running)) cur = i; });
    rows.forEach((r, i) => { r.classList.toggle("now", i === cur); r.classList.toggle("done", i < cur); });
    const end = rec.target[1] + 20;
    const fill = $("#track-fill"); if (fill) fill.style.width = clamp(el / end * 100, 0, 100) + "%";
    const steps = rec.schedule, nn = $("#nownext");
    if (nn) {
      const started = el > 0 || timer.running;
      const curStep = steps.filter(s => s.at <= el).pop(), next = steps.find(s => s.at > el);
      let msg;
      if (!started) msg = esc(t("ready"));
      else if (curStep && el - curStep.at < 12 && steps.includes(curStep)) msg = `<b>${esc(t("now", { to: curStep.to }))}</b>${next ? `<br>${esc(t("next", { to: next.to, s: fmtT(next.at - el) }))}` : ""}`;
      else if (next) msg = esc(t("next", { to: next.to, s: fmtT(next.at - el) }));
      else if (el <= rec.target[1]) msg = `<b>${esc(t("drain", { t: fmtT(rec.target[1]) }))}</b>`;
      else msg = `<b>${esc(t("done"))}</b>`;
      nn.innerHTML = msg;
    }
    // dripper + server levels
    const poured = (steps.filter(s => s.at <= el).pop() || { to: 0 }).to;
    const drained = clamp((el - 25) / (rec.target[1] - 25), 0, 1) * (rec.water - rec.dose * 2);
    const inBed = started(el) ? clamp((poured - drained - rec.dose * 2 * Math.min(1, poured / rec.water)) / rec.water, 0, 1) : 0;
    const bed = $("#bed-fill"); if (bed) { const hgt = 80 * Math.min(1, inBed * 1.6 + (poured ? 0.12 : 0)); bed.setAttribute("y", 104 - hgt); bed.setAttribute("height", hgt); }
    const srv = $("#srv-fill"); if (srv) { const hgt = 92 * clamp(drained / Math.max(1, rec.water), 0, 1); srv.setAttribute("y", 232 - hgt); srv.setAttribute("height", hgt); }
    const st = $("#steam"); if (st) st.style.display = timer.running ? "" : "none";
  }
  if (timer.running) timer.raf = requestAnimationFrame(tick);
}
const started = el => el > 0 || timer.running;
async function toggleTimer() {
  if (timer.running) { timer.acc = elapsed(); timer.running = false; cancelAnimationFrame(timer.raf); try { wakeLock && await wakeLock.release(); } catch {} wakeLock = null; }
  else { timer.start = performance.now(); timer.running = true; try { wakeLock = await navigator.wakeLock?.request("screen"); } catch {} }
  const logVals = captureLog(); render(); restoreLog(logVals);
}
function resetTimer() { timer.running = false; timer.acc = 0; cancelAnimationFrame(timer.raf); }

/* ---------------- Hatch import (Hatch pages are English; labels parsed in English) ---------------- */
function parseHatch(raw, url) {
  const text = String(raw || "").replace(/\r/g, "");
  const lines = text.split("\n").map(l => l.trim());
  const nextVal = i => { for (let j = i + 1; j < lines.length; j++) if (lines[j]) return lines[j]; return ""; };
  const field = label => {
    const re = new RegExp("^" + label + "\\s*:\\s*(.*)$", "i");
    for (let i = 0; i < lines.length; i++) { const m = lines[i].match(re); if (m) return m[1].trim() || nextVal(i); }
    return "";
  };
  let name = "";
  const tt = text.match(/^Title:\s*(.+?)\s*\|\s*Hatch/im);
  if (tt) name = tt[1];
  if (!name) { const i = lines.findIndex(l => /^back to shop$/i.test(l)); if (i >= 0) name = nextVal(i); }
  if (!name) { const i = lines.findIndex(l => /^(CA|US)?\$\s?\d/.test(l)); if (i > 0) for (let j = i - 1; j >= 0; j--) if (lines[j]) { name = lines[j]; break; } }
  const origin = field("Origin"), producer = field("Producer"), variety = field("Variety"), procRaw = field("Process");
  const elev = field("Elevation") || field("Altitude"), harvest = field("Harvest");
  const recBrew = field("Recommended Brew"), notes = field("Reminds us of") || field("Tasting notes");
  const hints = [];
  const p = procRaw.toLowerCase();
  let process = "other";
  if (/anaerob|carbonic|co-?ferment|infused|yeast|thermal/.test(p)) process = "anaerobic";
  else if (/wet.?hull|giling/.test(p)) process = "wet-hulled";
  else if (/honey|pulped natural/.test(p)) process = "honey";
  else if (/natural|dry/.test(p)) process = "natural";
  else if (/wash/.test(p)) process = "washed";
  if (process === "washed" && /anaerobic|lactobacillus|thermal shock|co-?ferment|yeast/i.test(text)) hints.push(["hint.anaerobic"]);
  const alts = (elev.match(/\d[\d,]*/g) || []).map(n => +n.replace(/,/g, "")).filter(n => n > 300 && n < 3000);
  const altitude = alts.length ? Math.round(alts.reduce((a, b) => a + b, 0) / alts.length) : "";
  if (alts.length > 1) hints.push(["hint.range", { elev, alt: altitude }]);
  const rb = recBrew.toLowerCase();
  const roast = /espresso/.test(rb) && !/filter/.test(rb) ? "medium-light" : "light";
  hints.push(recBrew ? ["hint.roast", { roastKey: roast, rec: recBrew }] : ["hint.roastNoRec", { roastKey: roast }]);
  hints.push(["hint.roastDate"]);
  const found = [name, origin, variety, procRaw].filter(Boolean).length;
  return {
    ok: found >= 2,
    data: { name, roaster: /hatch/i.test(text) || /hatchcrafted/i.test(url || "") ? "Hatch Coffee" : "", producer, origin, variety, process, roast, altitude, harvest, notes, sourceUrl: url || "" },
    hints, missing: [["f.origin", origin], ["f.variety", variety], ["f.process", procRaw], ["f.elev", elev]].filter(x => !x[1]).map(x => x[0]),
  };
}

function applyImport(res) {
  ui.draft = { ...readBeanForm() };
  for (const [k, val] of Object.entries(res.data)) if (val !== "" && val != null) ui.draft[k] = val;
  ui.importHints = res.hints;
  ui.importMsg = { kind: "ok", key: "im.filled", params: { name: res.data.name || "—", missingKeys: res.missing } };
}
function readBeanForm() { const f = $("#beanform"); return f ? Object.fromEntries(new FormData(f)) : (ui.draft || {}); }

const isHttps = u => { try { return new URL(u).protocol === "https:"; } catch { return false; } };
const isHatch = u => { try { const x = new URL(u); return /(^|\.)hatchcrafted\.com$/i.test(x.hostname) && /^https?:$/.test(x.protocol); } catch { return false; } };
const wait = ms => new Promise(r => setTimeout(r, ms));
const resultText = r => (r?.content || []).filter(c => c.type === "text").map(c => c.text).join("\n") || (typeof r?.payload === "string" ? r.payload : "");
const imsg = (kind, key) => { ui.importMsg = { kind, key }; };

/* ---- QR scan: photo from camera / file, decoded in the page ---- */
let jsqrP = null;
const loadJsQR = () => jsqrP || (jsqrP = new Promise((res, rej) => {
  if (window.jsQR) return res(window.jsQR);
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
  s.onload = () => window.jsQR ? res(window.jsQR) : rej(new Error("no jsQR"));
  s.onerror = () => { jsqrP = null; rej(new Error("load")); };
  document.head.appendChild(s);
}));
async function loadImage(file) {
  try { if (window.createImageBitmap) return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch {}
  return await new Promise((res, rej) => { const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = u; });
}
async function decodeQR(file) {
  const img = await loadImage(file);
  const W = img.width || img.naturalWidth, H = img.height || img.naturalHeight;
  if ("BarcodeDetector" in window) {
    try { const d = new window.BarcodeDetector({ formats: ["qr_code"] }); const r = await d.detect(img); if (r && r[0] && r[0].rawValue) return r[0].rawValue; } catch {}
  }
  const jsQR = await loadJsQR();
  for (const max of [1000, 1600, 640, 2400]) {
    const k = Math.min(1, max / Math.max(W, H)), w = Math.round(W * k), h = Math.round(H * k);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
    const r = jsQR(g.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" });
    if (r && r.data) return r.data;
  }
  return null;
}
function handleQRText(text) {
  const s = String(text || "").trim();
  const m = s.match(/https?:\/\/\S+/i) || (/^[\w.-]+\.[a-z]{2,}\/\S*$/i.test(s) ? ["https://" + s] : null);
  if (!m) { ui.importMsg = { kind: "err", key: "im.qrText", params: { text: s.slice(0, 120) } }; return rerender(); }
  ui.importUrl = m[0].replace(/^http:/i, "https:");
  rerender();
  const inp = $("#im-url"); if (inp) inp.value = ui.importUrl;
  importFromUrl();
}
async function scanFromFile(file) {
  if (!file) return;
  ui.draft = readBeanForm(); ui.importHints = null;
  imsg("busy", "im.scanning"); rerender();
  let text = null;
  try { text = await decodeQR(file); }
  catch (e) { imsg("err", e && e.message === "load" ? "im.qrLib" : "im.noQR"); return rerender(); }
  if (!text) { imsg("err", "im.noQR"); return rerender(); }
  handleQRText(text);
}

/* live camera scanner */
const scan = { stream: null, raf: 0, busy: false, detector: null, jsQR: null, last: 0 };
async function openScanner() {
  ui.draft = readBeanForm();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { const f = $("#qr-file"); if (f) { f.value = ""; f.click(); } return; }
  const box = $("#scanner"); box.hidden = false;
  $("#scan-title").textContent = t("scanTitle"); $("#scan-hint").textContent = t("scanHint");
  $("#scan-photo").textContent = t("scanPhoto"); $("#scan-close").setAttribute("aria-label", t("cancel"));
  document.body.style.overflow = "hidden";
  try {
    scan.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  } catch {
    closeScanner(); imsg("err", "im.camDenied"); return rerender();
  }
  const v = $("#scan-video"); v.srcObject = scan.stream; v.setAttribute("playsinline", ""); v.muted = true;
  try { await v.play(); } catch {}
  scan.detector = null;
  if ("BarcodeDetector" in window) { try { scan.detector = new window.BarcodeDetector({ formats: ["qr_code"] }); } catch {} }
  if (!scan.detector) { try { scan.jsQR = await loadJsQR(); } catch { closeScanner(); imsg("err", "im.qrLib"); return rerender(); } }
  const c = document.createElement("canvas"), g = c.getContext("2d", { willReadFrequently: true });
  const loop = async now => {
    if (!scan.stream) return;
    scan.raf = requestAnimationFrame(loop);
    if (scan.busy || now - scan.last < 140 || v.readyState < 2) return;
    scan.busy = true; scan.last = now;
    try {
      let txt = null;
      if (scan.detector) { const r = await scan.detector.detect(v); txt = r && r[0] && r[0].rawValue; }
      else {
        const k = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight)), w = Math.round(v.videoWidth * k), h = Math.round(v.videoHeight * k);
        c.width = w; c.height = h; g.drawImage(v, 0, 0, w, h);
        const r = scan.jsQR(g.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
        txt = r && r.data;
      }
      if (txt) { try { navigator.vibrate && navigator.vibrate(40); } catch {} closeScanner(); handleQRText(txt); }
    } catch {}
    scan.busy = false;
  };
  scan.raf = requestAnimationFrame(loop);
}
function closeScanner() {
  cancelAnimationFrame(scan.raf);
  if (scan.stream) scan.stream.getTracks().forEach(tr => tr.stop());
  scan.stream = null; scan.busy = false;
  const v = $("#scan-video"); if (v) v.srcObject = null;
  const box = $("#scanner"); if (box) box.hidden = true;
  document.body.style.overflow = "";
}

/* one-click import through this site's own /api/import function */
async function importFromUrl() {
  const url = ($("#im-url")?.value || ui.importUrl || "").trim();
  ui.importUrl = url; ui.draft = readBeanForm(); ui.importHints = null;
  if (!isHttps(url)) { imsg("err", "im.badUrl"); return rerender(); }
  ui.importing = true; imsg("busy", "im.fetching"); rerender();
  try {
    const r = await fetch("/api/import?url=" + encodeURIComponent(url), { headers: { accept: "application/json" } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.text) throw new Error(j.error || String(r.status));
    const res = parseHatch(j.text, j.url || url);
    if (!res.ok) { ui.pasteOpen = true; imsg("err", "im.notFound"); }
    else applyImport(res);
  } catch {
    ui.pasteOpen = true; imsg("err", "im.fetchFail");
  }
  ui.importing = false;
  if ($("#beanform")) ui.draft = { ...readBeanForm(), ...(ui.draft || {}) };
  rerender();
}

function importFromPaste() {
  const txt = $("#im-paste")?.value || "";
  ui.draft = readBeanForm(); ui.pasteOpen = true;
  const url = ($("#im-url")?.value || "").trim();
  const res = parseHatch(txt, isHttps(url) ? url : "");
  if (!txt.trim() || !res.ok) { ui.importHints = null; imsg("err", "im.pasteFail"); }
  else { applyImport(res); ui.pasteOpen = false; }
  render();
}

/* ---------------- events ---------------- */
function bind() {
  if (ui.tab === "brew") tick();
  const bf = $("#beanform");
  if (bf) {
    bf.addEventListener("input", () => { ui.draft = readBeanForm(); });
    bf.addEventListener("submit", e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(bf));
      if (!f.name.trim()) return;
      const existing = ui.beanForm !== "new" ? state.beans[ui.beanForm] : null;
      const id = existing ? existing.id : uid();
      const data = { ...(existing || {}), ...f, name: f.name.trim(), altitude: f.altitude ? +f.altitude : "", createdAt: existing?.createdAt || new Date().toISOString() };
      delete data.example;
      ui.beanForm = null; resetImport(); pickBean(id);
      put("beans", id, data);
      toast(existing ? "toast.beanUpdated" : "toast.beanAdded");
    });
  }
  const lf = $("#logform");
  if (lf) {
    lf.addEventListener("submit", e => {
      e.preventDefault();
      const bean = currentBean(); if (!bean) return;
      const v = id => $("#" + id).value;
      const data = {
        beanId: bean.id, date: v("lf-date") || today(), dose: +v("lf-dose"), water: +v("lf-water"), temp: +v("lf-temp"), clicks: +v("lf-clicks"),
        time: parseT(v("lf-time")), setup: v("lf-setup"), filter: v("lf-setup") === "origami-wave" ? "wave" : "cone", extraction: +v("lf-ext"), strength: +v("lf-str"),
        astringent: $("#lf-astr").checked, flat: $("#lf-flat").checked, score: clamp(+v("lf-score") || 5, 1, 10), notes: v("lf-notes").trim(),
        createdAt: new Date().toISOString(),
      };
      ui.logOpen = false; resetTimer();
      put("brews", uid(), data);
      toast("toast.brewSaved");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  const ss = $("#shelf-sort");
  if (ss) ss.addEventListener("change", () => { ui.sort = ss.value; lsSet("obl-sort", ui.sort); render(); });
  const bfile = $("#backup-file");
  if (bfile && !bfile.dataset.bound) { bfile.dataset.bound = "1"; bfile.addEventListener("change", () => importBackup(bfile.files && bfile.files[0])); }
  const iu = $("#im-url");
  if (iu) iu.addEventListener("input", () => { ui.importUrl = iu.value.trim(); });
  const qf = $("#qr-file");
  if (qf) qf.addEventListener("change", () => scanFromFile(qf.files && qf.files[0]));
  const di = $("#dose-in");
  if (di) di.addEventListener("input", () => { const w = Math.max(2, di.value.length) + 0.5 + "ch"; di.style.width = w; di.style.minWidth = w; });
  if (di) di.addEventListener("change", () => { const b = currentBean(); if (b && di.value !== "") setDose(b, di.value); });
  const bp = $("#beanpick");
  if (bp) bp.addEventListener("change", () => { pickBean(bp.value); render(); });
}

document.addEventListener("click", e => {
  if (auth.menu && !e.target.closest("#acct")) { auth.menu = false; paintAccount(); }
  const el = e.target.closest("[data-tab],[data-act],[data-lang]"); if (!el) return;
  if (el.dataset.lang) return setLang(el.dataset.lang);
  if (el.dataset.tab) return setTab(el.dataset.tab);
  const a = el.dataset.act, id = el.dataset.id;
  switch (a) {
    case "new-bean": ui.beanForm = "new"; resetImport(); render(); $("#im-url")?.focus(); break;
    case "cancel-bean": ui.beanForm = null; resetImport(); render(); break;
    case "import-url": importFromUrl(); break;
    case "rate": {
      const b = state.beans[id]; if (!b) break;
      const k = el.dataset.kind, v = +el.dataset.v, nv = (+b[k] || 0) === v ? 0 : v;
      const lv = captureLog();
      put("beans", id, { ...b, [k]: nv });
      restoreLog(lv);
    } break;
    case "scan-qr": openScanner(); break;
    case "scan-close": closeScanner(); break;
    case "scan-photo": { closeScanner(); const f = $("#qr-file"); if (f) { f.value = ""; f.click(); } } break;
    case "sign-in": signIn(); break;
    case "sign-out": signOutNow(); break;
    case "acct": auth.menu = !auth.menu; paintAccount(); break;
    case "export": exportBackup(); break;
    case "import-backup": { const f = $("#backup-file"); if (f) { f.value = ""; f.click(); } } break;
    case "import-paste": importFromPaste(); break;
    case "open-bean": pickBean(id); setTab("brew"); break;
    case "edit-bean": ui.beanForm = id; resetImport(); setTab("beans"); break;
    case "go-beans": setTab("beans"); break;
    case "open-log": ui.logOpen = true; render(); $("#logpanel")?.scrollIntoView({ behavior: "smooth", block: "start" }); break;
    case "close-log": ui.logOpen = false; render(); break;
    case "timer": toggleTimer(); break;
    case "jump": { const target = document.getElementById(el.dataset.to); if (target) { const y = target.getBoundingClientRect().top + window.scrollY - 90; window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } } break;
    case "compass": $("#lf-ext").value = el.dataset.x; $("#lf-str").value = el.dataset.y; paintLogControls(); break;
    case "score": $("#lf-score").value = el.dataset.v; paintLogControls(); break;
    case "dose-step": { const b = currentBean(); if (b) setDose(b, (+$("#dose-in").value || 15) + +el.dataset.d); } break;
    case "dose-set": { const b = currentBean(); if (b) setDose(b, +el.dataset.g); } break;
    case "dose-reset": { const b = currentBean(); if (b) setDose(b, null); } break;
    case "setup": { const b = currentBean(); if (!b) break; const lv = captureLog(); ui.setups = { ...ui.setups, [b.id]: el.dataset.setup }; lsSet("obl-setups", ui.setups); resetTimer(); render(); restoreLog(lv); if ($("#lf-setup")) { $("#lf-setup").value = el.dataset.setup; } } break;
    case "timer-reset": resetTimer(); { const lv = captureLog(); render(); restoreLog(lv); } break;
    case "ask-del": { const lv = captureLog(); ui.confirm = el.dataset.key; render(); restoreLog(lv); } break;
    case "cancel-del": { const lv = captureLog(); ui.confirm = null; render(); restoreLog(lv); } break;
    case "del-brew": ui.confirm = null; del("brews", id); toast("toast.brewRemoved"); break;
    case "del-bean": ui.confirm = null; ui.beanId = null; del("beans", id); setTab("beans"); toast("toast.beanDeleted"); break;
  }
});
document.addEventListener("keydown", e => {
  if (e.target.id === "dose-in" && e.key === "Enter") { e.preventDefault(); e.target.blur(); return; }
  if (e.target.id === "im-url" && e.key === "Enter") { e.preventDefault(); importFromUrl(); return; }
  if (e.key === "Escape" && scan.stream) { closeScanner(); return; }
  const b = e.target.closest?.('[role="button"][data-act]');
  if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); b.click(); }
});

render();
initStore();
})();
