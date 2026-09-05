# Inventory Manager — Starter Template

A clean, empty starter template for an inventory, purchasing, sales, and finance management app.

## What's included

- **Inventory** — items, variations, multi-branch stock, low-stock alerts, movement logs
- **Purchasing** — local and overseas purchase orders, suppliers, receiving, landed-cost tracking
- **Sales** — quotations, invoices, online sales (Shopee/Lazada/other channels), customers
- **Finance** — cash and bank accounts, foreign-currency tracking, payables, receivables, loans, owner draws
- **Team** — user accounts with admin/user roles and per-branch access
- **Documents** — PDF generation for invoices, quotations, and purchase orders

## Getting started

1. Open the app and create the first account — it becomes the admin.
2. Go to Settings to add your branches and cash/bank accounts.
3. Add items, suppliers, and customers (or use the bulk-upload templates).

## Customizing the branding

- App name and title: `index.html`, `public/manifest.webmanifest`
- Sidebar and sign-in screen name: `src/components/AppSidebar.tsx`, `src/pages/AuthPage.tsx`
- PDF company name and address: `src/lib/pdf.ts` (`COMPANY_NAME`, `COMPANY_ADDRESS_1/2`)
- Logo and icons: `public/images/` and `public/favicon.ico`

## Built with

Vite, React, TypeScript, Tailwind CSS, shadcn/ui, and Lovable Cloud (auth + database).
