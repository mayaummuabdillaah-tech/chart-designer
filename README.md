# Chart Designer - Knitting & Crochet

## Cara deploy ke Netlify (paling gampang - tanpa install apapun di laptop)

1. Buat akun GitHub gratis kalau belum punya (github.com)
2. Upload semua file di folder ini ke repository GitHub baru
3. Buka netlify.com, login/daftar (bisa pakai akun GitHub)
4. Klik "Add new site" → "Import an existing project" → pilih repo GitHub tadi
5. Netlify akan otomatis isi:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Klik "Deploy" — tunggu 1-2 menit, selesai! Netlify kasih link otomatis (bisa diganti nama domainnya nanti di Site settings)

## Alternatif: build manual lalu drag-and-drop

Kalau punya Node.js di laptop:
```
npm install
npm run build
```
Ini bakal bikin folder `dist`. Buka netlify.com → drag folder `dist` itu ke halaman deploy. Selesai, langsung online.
