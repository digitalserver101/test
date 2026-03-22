# Vuln Webportal (training lab)

Intentionally vulnerable Node/Express app for security training. **Do not expose to the internet without isolation.**

## Run with Docker (recommended)

Clone the repo, then from the project root:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

- Stops with `Ctrl+C`, or run detached: `docker compose up -d --build`
- Data (users, resets) is stored in the `portal-data` Docker volume at `/data/data.json` inside the container.

### Build / run the image without Compose

```bash
docker build -t vuln-webportal:latest .
docker run --rm -p 3000:3000 -v vuln-portal-data:/data -e DATA_FILE=/data/data.json vuln-webportal:latest
```

## Local development (no Docker)

```bash
npm install
npm run build:login
npm start
```

## Default seeded account

On first start with an empty database, the app creates `admin` / `Password123!` and logs it to the container/process logs.
