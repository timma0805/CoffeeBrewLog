# Origami Brew Log

Pour-over recipes tuned to each bean (Origami, Hario V60, Kalita Wave · Comandante C40), adjusted by how each cup tasted. English and 繁體中文.

Plain HTML/JS: no build step, no npm install. Everything below runs on free plans.

| Piece | Service | Cost |
| --- | --- | --- |
| Website + `/api/import` (reads coffee pages) | Vercel **Hobby** | Free for personal, non-commercial use |
| Google sign-in + synced log | Firebase **Spark** (Authentication + Cloud Firestore) | Free, no credit card |
| Code | GitHub | Free |

---

## 1. Firebase (sign-in and sync) — about 10 minutes

1. Go to <https://console.firebase.google.com> → **Create a project** (any name, e.g. `brew-log`). You can turn Google Analytics off. Stay on the free **Spark** plan; never click "Upgrade".
2. **Build → Authentication → Get started → Sign-in method → Google → Enable**, pick your support email, **Save**.
3. **Build → Firestore Database → Create database** → choose a location near you (e.g. `northamerica-northeast2` Toronto) → **Start in production mode**.
4. In Firestore open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules), **Publish**.
5. **Project settings (gear) → General → Your apps → Web (`</>`)** → register an app (no Hosting needed) → copy the `firebaseConfig` values into [`firebase-config.js`](firebase-config.js).

> The config values are not secrets; they identify your project. Your data is protected by the rules from step 4: each person can only read and write their own log.

## 2. GitHub

1. Create a new **private** (or public) repository at <https://github.com/new>, e.g. `origami-brew-log`.
2. Click **uploading an existing file**, drag in **everything in this folder** (including the `api` folder), **Commit**.

## 3. Vercel

1. Sign up at <https://vercel.com/signup> with **Continue with GitHub** and choose the **Hobby** plan.
2. **Add New… → Project → Import** your `origami-brew-log` repo.
3. Framework preset: **Other**. Leave build and output settings empty. **Deploy**.
4. You get a URL like `https://origami-brew-log.vercel.app`. Every time you change a file on GitHub, Vercel redeploys automatically.

## 4. Let Google sign-in work on your Vercel address

Firebase console → **Authentication → Settings → Authorized domains → Add domain** → enter `origami-brew-log.vercel.app` (your exact Vercel domain, without `https://`).

## 5. Move your existing beans in

On the new site: sign in with Google, open **Beans**, scroll to **Backup → Import file**, choose `my-beans-backup.json`.

## On your phone

Open the Vercel URL, then **Share → Add to Home Screen** (iPhone) or **⋮ → Install app** (Android) to get an app icon.

---

### How it works

- `index.html`, `app.js`: the whole app (recipes, timer, taste compass, guide).
- `api/import.js`: a small Vercel function that fetches a product page (Hatch and similar shops) and returns its text, so a pasted link or a scanned QR code fills in the bean automatically.
- Without a Firebase config the app still works and saves in each browser only; **Backup → Export file** keeps a copy.
- Firestore keeps an offline copy, so the app works with a weak connection and syncs later.

### Free-plan limits (well beyond one person's coffee log)

- Firestore Spark: 1 GiB stored, 50,000 reads and 20,000 writes per day.
- Vercel Hobby: personal, non-commercial projects; generous monthly bandwidth and function limits.
