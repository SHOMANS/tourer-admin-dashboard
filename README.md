# Admin Dashboard - MVP Project

Next.js admin dashboard for managing the MVP project backend.

## Prerequisites

- Node.js 24 (LTS)
- pnpm
- Backend service running (for API integration)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Update the `NEXT_PUBLIC_API_BASE_URL` in `.env` to point to your backend service (default: `http://localhost:3000`)

## Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the dashboard.

## Build

Create a production build:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Features

- Health check page for backend monitoring
- Zustand state management
- Tailwind CSS for styling
- TypeScript support
- Responsive design

## Pages

- `/` - Dashboard homepage with navigation
- `/health` - Backend health status check

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_API_BASE_URL` - URL of the backend API service

## Development Notes

This project uses:

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- Axios for API calls

## Troubleshooting

### Cannot connect to backend API

- Ensure backend service is running
- Check `NEXT_PUBLIC_API_BASE_URL` in your `.env` file
- Verify CORS settings in backend if running on different domains
