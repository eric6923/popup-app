// app/main.tsx
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  return json({
    message: "App Proxy is working correctly! Lol",
    shop,
    timestamp: new Date().toISOString(),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    const formData = await request.json();
    const email = formData.email;

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

    // ✅ Get the store from DB (with accessToken)
    const store = await prisma.store.findUnique({
      where: { shop },
    });

    if (!store || !store.accessToken) {
      return json({ error: "Store or access token not found" }, { status: 404 });
    }

    const accessToken = store.accessToken;
    const apiVersion = "2023-10";

    const discountCode = `WELCOME10-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 🏷️ Create price rule
    const priceRuleRes = await fetch(`https://${shop}/admin/api/${apiVersion}/price_rules.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        price_rule: {
          title: `Welcome Discount for ${email}`,
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: "percentage",
          value: "-20",
          customer_selection: "all",
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usage_limit: 1,
          once_per_customer: true,
        },
      }),
    });

    if (!priceRuleRes.ok) {
      const errorText = await priceRuleRes.text();
      throw new Error(`Failed to create price rule: ${errorText}`);
    }

    const priceRuleData = await priceRuleRes.json();
    const priceRuleId = priceRuleData.price_rule.id;

    // 🎟️ Create discount code
    const discountRes = await fetch(`https://${shop}/admin/api/${apiVersion}/price_rules/${priceRuleId}/discount_codes.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        discount_code: {
          code: discountCode,
        },
      }),
    });

    if (!discountRes.ok) {
      const errorText = await discountRes.text();
      throw new Error(`Failed to create discount code: ${errorText}`);
    }

    // 🧠 Save popup config to DB
    const existingPopup = await prisma.popup.findFirst({
      where: { storeId: store.id },
    });

    if (existingPopup) {
      const currentConfig = existingPopup.config as any;
      await prisma.popup.update({
        where: { id: existingPopup.id },
        data: {
          config: {
            emails: [...(currentConfig?.emails || []), email],
            discountCodes: [...(currentConfig?.discountCodes || []), discountCode],
            lastEmail: email,
            lastDiscountCode: discountCode,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    } else {
      await prisma.popup.create({
        data: {
          storeId: store.id,
          config: {
            emails: [email],
            discountCodes: [discountCode],
            lastEmail: email,
            lastDiscountCode: discountCode,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });
    }

    return json({
      success: true,
      discountCode,
      message: "Discount code created successfully",
    });
  } catch (error: any) {
    console.error("Error processing popup submission:", error);
    return json(
      {
        error: "Failed to create discount code",
        details: error.message,
      },
      { status: 500 }
    );
  }
};
