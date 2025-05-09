// app/shopify.server.ts
import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// Add this helper function to sync session to shop table
async function syncSessionToShop(session: any) {
  if (!session?.shop || !session?.accessToken) return;

  await prisma.store.upsert({
    where: { shop: session.shop },
    update: { 
      accessToken: session.accessToken,
      updatedAt: new Date()
    },
    create: { 
      shop: session.shop,
      accessToken: session.accessToken
    }
  });
}

// Create a custom session storage that syncs to Shop table
class CustomSessionStorage extends PrismaSessionStorage {
  constructor(db: typeof prisma) {
    super(db);
  }

  async storeSession(session: any): Promise<boolean> {
    const result = await super.storeSession(session);
    await syncSessionToShop(session);
    return result;
  }

  async loadSession(id: string): Promise<any> {
    const session = await super.loadSession(id);
    if (session) await syncSessionToShop(session);
    return session;
  }
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new CustomSessionStorage(prisma), // Use our custom storage
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;