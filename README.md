# Git Profile Explorer

A React app for looking up a public GitHub profile by username, rendered as an ID-badge-style record. Built around a provider adapter (`providers/githubProvider.js`) so a second platform can be added later without touching the UI, but only GitHub is wired up today.

## Features

- Search any public GitHub username
- Idle / loading / error / success states with distinct copy for each
- Distinct error messages for "not found", API rate limiting, and network failures
- **Linked accounts** — pulls the user's GitHub "social accounts" (LinkedIn, Bluesky, Mastodon, Instagram, YouTube, etc.) plus their website/blog link, shown as pill links on the badge alongside the primary GitHub profile link
- Optional profile fields (bio, location, company, links) only render when present
- **Shareable lookups** — searching updates the URL to `?u=<handle>`; opening that link re-runs the search automatically
- **Recent searches** — the last 6 lookups are saved to `localStorage` and shown as clickable chips
- **Live rate-limit readout** — shows remaining GitHub API requests for the hour, read from GitHub's response headers, so a failed search is explained instead of mysterious
- **GitHub Trending** — daily, weekly, and monthly repository snapshots grouped by inferred category, with GitHub star gains, current stars, descriptions, languages, and repository topics
- Responsive layout, light/dark theme support

## Tech Stack

- React 18 (Create React App)
- Axios
- react-icons
- GitHub Trending pages and GitHub REST API

## Project Structure

```
src/
├── providers/
│   ├── index.js            # registry of available search providers
│   ├── githubProvider.js   # GitHub profile + social-accounts API client
│   └── types.js            # shared NormalizedProfile / Provider shapes
├── hooks/
│   └── useProfileSearch.js # search state machine + recent-searches/rate-limit/URL sync
├── components/
│   ├── SearchBar.js
│   ├── RecentSearches.js
│   ├── RateLimitNote.js
│   ├── ProfileCard.js
│   ├── EmptyState.js
│   ├── LoadingState.js
│   └── ErrorState.js
├── utils/
│   └── barcode.js          # deterministic decorative barcode from a username
├── App.js
└── index.js
```

Adding a new platform means writing a new file in `providers/` that maps that platform's API response into the shared `NormalizedProfile` shape (`stats` and `links` are arrays so each provider can supply its own headline numbers and secondary links) and registering it in `providers/index.js` — no changes needed to the UI components.

## Getting Started

```bash
git clone https://github.com/iamnileshchikhle/git-profile-explorer.git
cd git-profile-explorer
npm install
npm start
```

Open http://localhost:3000 in your browser.

## Deployment base URL

The GitHub Pages base URL is configured once in `.env.production` as `PUBLIC_URL`. Create React App uses it when generating asset paths and the production build. If the deployment URL or repository path changes, update that value and rebuild.

The Pages workflow refreshes the GitHub Trending snapshot daily before building. Run `npm run update-trending` to refresh it locally; `npm run test:trending` checks the page parser and category mapping.

## Notes

Each search makes two GitHub API calls (profile + social accounts), so it costs 2 of the 60 unauthenticated requests-per-hour GitHub allows per IP. This app does not use an access token, so heavy testing may trigger a rate-limit error faster than a single-request app would.

A user's LinkedIn/Bluesky/etc. links only appear if they've added them under GitHub's own profile "Social accounts" feature — GitHub's API has no way to discover a LinkedIn profile that isn't explicitly linked there.

Most other platforms (Twitter/X, LinkedIn, Instagram, etc.) don't expose a free, keyless public-profile *search* API of their own — that's why this app surfaces those links via GitHub's social-accounts feature rather than querying each platform directly.

## Contributing

Issues and pull requests are welcome.
