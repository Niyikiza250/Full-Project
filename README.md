# MIFEM Management Information System (MIFEM MIS)

Professional enterprise-level web application for the Rwanda Union Mission of the Seventh-day Adventist Church.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS v4 (SDA Branding)
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Routing:** React Router DOM v7
- **Internationalization:** i18next (English & Kinyarwanda)

## Project Structure
- `src/api`: Axios client and interceptors.
- `src/components`: Reusable UI components.
- `src/constants`: Route paths and configuration constants.
- `src/hooks`: Custom React hooks.
- `src/i18n`: Internationalization setup.
- `src/layouts`: Main and Auth layouts.
- `src/pages`: Feature pages (Dashboard, Login).
- `src/routes`: Router configuration and guards.
- `src/store`: Zustand stores (Auth, Theme).
- `src/theme`: Styling configurations.

## Getting Started
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

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
