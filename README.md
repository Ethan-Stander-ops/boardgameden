## Overview
This app lists board games for **Board Game Den**. Data comes from the supplier (**myboardgamelibrary.com**) and is presented as a paginated, searchable table.

## Key decisions
- **Server-side pagination and search.** The API owns filtering and paging so the client isn’t downloading or processing the entire dataset.
- **Caching strategy.** The API caches the full supplier list; the front end caches per request (page, page size, search). This reduces supplier hits and keeps the UI responsive.
- **Data flow and responsibility.** The API normalizes and prepares data; the client focuses on rendering.

## Why server-side pagination/search
Fetching everything to the browser and slicing there is wasteful. Keeping pagination and search in the API reduces payload size, centralizes logic, and makes the UI faster.

## “Our Price” calculation
“Our Price” is computed in the API (Sale Price + 10%). Calculations belong on the server so the client doesn’t reimplement business rules.

## Supplier issue (403)
The 403 was caused by an HTTP URL. Switching to HTTPS resolved it.

## Docker (single container)

Everything runs in one container.

### Build
From the repo root (where `Dockerfile` is):
Open Gitbash or cmd. 
docker build -t boardgameden .
docker run --rm -p 8080:8080 boardgameden


