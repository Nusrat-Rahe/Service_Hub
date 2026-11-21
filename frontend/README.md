This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## ServiceHub bookings and payments

The booking flow uses MongoDB-backed service categories, subcategories, and reserved time slots. MongoDB transactions require Atlas or another replica-set deployment. Configure `backend/.env` from `backend/.env.example` with the database URI, a 32-byte-or-longer `JWT_SECRET`, and the frontend/backend URLs, then run:

```bash
cd backend
npm run dev
```

Customers choose bKash, Card, or Cash on Delivery in the booking flow. bKash and Card are simulated academic-project choices: selecting either records the payment as Paid, but does not make a transaction or request payment credentials. Cash on Delivery is recorded as Pending until an administrator confirms payment after service completion. The booking is saved when the customer clicks **Confirm Booking**.

After booking, the customer is taken to a receipt rendered from the MongoDB booking and payment records. The same receipt can be reopened from **My Bookings** and printed; the print view contains only the receipt.

In the frontend terminal, set `NEXT_PUBLIC_API_URL=http://localhost:5000` in `frontend/.env.local` if the default is not suitable, then run `npm run dev`. Register or sign in as a customer and book a database-backed service type. View booking and payment records under **My Bookings** and **Payment History**. To test COD confirmation, sign in as an admin, mark the booking **Completed** in Admin → Bookings, then confirm the pending COD payment in Admin → Payments.

Run `npm run lint` and `npx tsc --noEmit` from `frontend`; run `npm run build` from `backend` to validate the backend.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
