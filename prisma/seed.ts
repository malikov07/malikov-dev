/**
 * Demo data for the admin panel — `npm run db:seed`.
 *
 * Creates a handful of requests across every status so the dashboard has
 * something to show before real ones arrive. Safe to re-run: it clears only
 * the rows it created, matched by their `MD-DEMO*` refs.
 */
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // Fall back to the ambient environment.
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — point it at your Postgres database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMOS = [
  {
    ref: "MD-DEMO1",
    kind: "website",
    title: "Bakery ordering site",
    summary:
      "A site for a Tashkent bakery where customers browse cakes with photos and prices, order for delivery, and pay by card. The owner needs to add new cakes without help.",
    designStyle: "liquid-glass",
    features: [
      "Browse cakes with photos and prices",
      "Order for delivery",
      "Pay by card",
      "Owner adds new cakes from an admin page",
    ],
    scope: ["Home", "Catalogue", "Cake detail", "Checkout", "Admin"],
    audience: "Local customers ordering celebration cakes",
    languages: ["uz", "ru"],
    timeline: "In a few weeks",
    contactName: "Bekzod Karimov",
    contactMethod: "telegram",
    contactValue: "@bekzod_cakes",
    availability: "Evening — after 6pm on weekdays",
    timezone: "Asia/Tashkent",
    budgetText: "$300 – $700",
    budgetMin: 300,
    budgetMax: 700,
    budgetUnknown: false,
    status: "accepted",
    adminComment:
      "Agreed $650, two weeks. Includes catalogue, delivery orders, card payments and an admin page.",
  },
  {
    ref: "MD-DEMO2",
    kind: "telegram_bot",
    title: "Pizza ordering bot",
    summary:
      "A Telegram bot that shows the menu, lets customers choose toppings and pay online, then notifies the kitchen when an order comes in.",
    designStyle: null,
    features: [
      "See the menu",
      "Choose toppings",
      "Pay online",
      "Kitchen gets a notification",
    ],
    scope: ["/start", "/menu", "/order", "/status"],
    audience: "Delivery customers in the city centre",
    languages: ["ru"],
    timeline: "As soon as possible",
    contactName: "Aziz Rahimov",
    contactMethod: "telegram",
    contactValue: "@aziz_pizza",
    availability: "anytime",
    timezone: "Asia/Tashkent",
    budgetText: "Client isn't sure yet",
    budgetMin: null,
    budgetMax: null,
    budgetUnknown: true,
    status: "new",
    adminComment: null,
  },
  {
    ref: "MD-DEMO3",
    kind: "other",
    title: "Daily sales report automation",
    summary:
      "A script that pulls yesterday's sales out of the shop system every morning, builds a summary, and sends it to the owner on Telegram.",
    designStyle: null,
    features: [
      "Runs automatically every morning",
      "Summarises yesterday's sales",
      "Sends the report to Telegram",
    ],
    scope: [],
    audience: "Shop owner",
    languages: ["en"],
    timeline: "No rush",
    contactName: "Dilnoza S.",
    contactMethod: "email",
    contactValue: "dilnoza@example.com",
    availability: "Morning",
    timezone: "Asia/Tashkent",
    budgetText: "Under $300",
    budgetMin: 0,
    budgetMax: 300,
    budgetUnknown: false,
    status: "done",
    adminComment: "Delivered and running since last week. Paid in full.",
  },
  {
    ref: "MD-DEMO4",
    kind: "website",
    title: "Crypto trading signals site",
    summary:
      "A site selling paid subscriptions to trading signals, with guaranteed returns advertised on the homepage.",
    designStyle: "dark-luxury",
    features: ["Paid subscriptions", "Signal feed", "Guaranteed returns claim"],
    scope: ["Home", "Pricing", "Signals"],
    audience: "Retail investors",
    languages: ["en"],
    timeline: "As soon as possible",
    contactName: "Anonymous",
    contactMethod: "telegram",
    contactValue: "@fast_money_2026",
    availability: "anytime",
    timezone: null,
    budgetText: "$3,000+",
    budgetMin: 3000,
    budgetMax: 3000,
    budgetUnknown: false,
    status: "rejected",
    adminComment:
      "Turned down — advertising guaranteed returns isn't something I'll build. Suggested a plain subscription site with no performance claims instead.",
  },
];

const TRANSCRIPT = [
  { role: "assistant", content: "Hi! Tell me about the project you have in mind." },
  { role: "user", content: "See the summary above — this is demo data." },
];

async function main() {
  const refs = DEMOS.map((d) => d.ref);
  await prisma.projectRequest.deleteMany({ where: { ref: { in: refs } } });

  for (const d of DEMOS) {
    await prisma.projectRequest.create({
      data: {
        ref: d.ref,
        kind: d.kind,
        title: d.title,
        summary: d.summary,
        designStyle: d.designStyle,
        features: JSON.stringify(d.features),
        scope: JSON.stringify(d.scope),
        audience: d.audience,
        languages: JSON.stringify(d.languages),
        timeline: d.timeline,
        brief: JSON.stringify(d),
        contactName: d.contactName,
        contactMethod: d.contactMethod,
        contactValue: d.contactValue,
        availability: d.availability,
        timezone: d.timezone,
        budgetText: d.budgetText,
        budgetMin: d.budgetMin,
        budgetMax: d.budgetMax,
        budgetCurrency: "USD",
        budgetUnknown: d.budgetUnknown,
        status: d.status,
        adminComment: d.adminComment,
        decidedAt: d.status === "new" ? null : new Date(),
        transcript: JSON.stringify(TRANSCRIPT),
        events: {
          create: [
            { type: "created", toStatus: "new", author: "client" },
            ...(d.status === "new"
              ? []
              : [
                  {
                    type: "status_change",
                    fromStatus: "new",
                    toStatus: d.status,
                    comment: d.adminComment,
                    author: "admin",
                  },
                ]),
          ],
        },
      },
    });
  }

  console.log(`Seeded ${DEMOS.length} demo requests.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
