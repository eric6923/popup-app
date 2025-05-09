import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {prisma} from "../lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  await prisma.store.upsert({
    where: { shop: session.shop },
    update: { 
      accessToken: session.accessToken,
      updatedAt: new Date()
    },
    create: { 
      shop: session.shop,
      accessToken: session.accessToken ?? ""
    }
  });

  return null;
};