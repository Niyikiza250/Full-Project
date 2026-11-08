# MIFEM Management Information System (MIFEM MIS)

Professional enterprise-level web application for the Rwanda Union Mission of the Seventh-day Adventist Church.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS v4 (SDA Branding)
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Routing:** React Router DOM v7
- **Internationalization:** i18next (English, Kinyarwanda & French)

## Project Structure
- `Frontend_Mifem/` — React application (see `Frontend_Mifem/src`).
  - `src/api`: Axios client and interceptors.
  - `src/components`: Reusable UI components.
  - `src/constants`: Route paths and configuration constants.
  - `src/hooks`: Custom React hooks.
  - `src/i18n`: Internationalization setup.
  - `src/layouts`: Main and Auth layouts.
  - `src/pages`: Feature pages (Dashboard, Login).
  - `src/routes`: Router configuration and guards.
  - `src/store`: Zustand stores (Auth, Theme).
- `Backend_MIFEM/` — Express + Sequelize (PostgreSQL) API.

## Getting Started
1. Install dependencies: run `install.ps1`, or manually:
   - `cd Frontend_Mifem; npm install`
   - `cd Backend_MIFEM; npm install`
2. Run the frontend and backend together: `npm run dev` (the backend initializes the local database on first startup). Both `npm run dev` and `npm run dev:backend` reuse a healthy API already listening on port 5000 rather than starting a duplicate.
   - To run only one service, use `npm run dev:frontend` or `npm run dev:backend`.
3. Build frontend for production: `cd Frontend_Mifem; npm run build`

## Deploying the frontend to Vercel

The Vercel project should use `Frontend_Mifem` as its root directory. Use
`npm run build` as the build command and `dist` as the output directory.
Configure `VITE_API_BASE_URL` in the Vercel project environment variables to
the public backend URL ending in `/api` (for example,
`https://api.example.com/api`) for every deployment environment. The default
`/api` value is for local development through the Vite proxy; the Express API
is a separate service and is not deployed by the frontend Vercel project.

Deploy the backend to a Node.js host and connect it to a persistent PostgreSQL
database. Set `CORS_ORIGIN` to the exact Vercel frontend origin(s), and set the
backend's database, JWT, and other production environment variables before
deployment. Local development allows `localhost` and `127.0.0.1` on any port;
production only allows origins listed in `CORS_ORIGIN`. Admin branding, hero slides and achievement images are stored with
their database records, so these changes remain available after redeployments
and across users. Uploaded images are limited to 5MB.

## Features Implemented
- **Enterprise Folder Structure:** Scalable and organized.
- **Dark/Light Mode:** Integrated with Zustand and Tailwind.
- **Protected Routes:** Authentication-ready routing.
- **Bilingual Support:** English and Kinyarwanda setup.
- **SDA Branding:** Navy Blue and Gold theme.

## Modern Standards
- Strictly Typed with TypeScript.
- Functional Components with Hooks.
- Centralized API Management.
- Secure Form Validation.
