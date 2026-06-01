# drivereader

thing to read google drive folder as "pages" of a book

no sign-in required — works with any publicly shared Drive folder.

## setup

**1. Google Cloud — create an API key**

- [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Library → enable **Google Drive API**
- Credentials → Create credentials → **API key**
- Restrict it: API restrictions → Google Drive API; HTTP referrers → your domain (e.g. `*.github.io/*`)

**2. Install & run**

```bash
deno install
cp .env.local.example .env.local   # then fill in your key
deno task dev
```

`.env.local`:
```
VITE_GOOGLE_API_KEY=your-key-here
```

**3. Build**

```bash
deno task build
```

## deploy (GitHub Pages)

1. Repo → Settings → Pages → Source: **GitHub Actions**
2. Settings → Secrets → Actions → add `VITE_GOOGLE_API_KEY`
3. Push to `main` — the workflow does the rest

Add your Pages URL to the API key's HTTP referrer restrictions in Cloud Console.

## notes

- folders must be shared as **"Anyone with the link"**
- images are sorted alphabetically and displayed one or two per page
- preferences (sort, view mode) are saved to localStorage
- recent folders are remembered across sessions
