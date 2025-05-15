import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";
import { getPopupsByStore } from "../services/popup.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    // Find the store in the database
    const store = await prisma.store.findUnique({
      where: { shop },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Get all popups for this store
    const popups = await getPopupsByStore(store.id);
    
    // Find the active popup (if any)
    const activePopup = popups.find(popup => popup.isActive);
    
    if (!activePopup) {
      return json({ 
        hasActivePopup: false,
        message: "No active popup found for this store"
      });
    }

    // Return the popup configuration
    return json({
      hasActivePopup: true,
      popup: {
        id: activePopup.id,
        type: activePopup.type,
        config: activePopup.config,
        createdAt: activePopup.createdAt,
        updatedAt: activePopup.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching popup configuration:", error);
    return json({ 
      error: "Failed to fetch popup configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
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

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Get the active popup to check discount configuration
    const popups = await getPopupsByStore(store.id);
    const activePopup = popups.find(popup => popup.isActive);
    
    if (!activePopup) {
      return json({ error: "No active popup found" }, { status: 404 });
    }

    // Check discount configuration
    const config = activePopup.config as any;
    const discountConfig = config?.rules?.discount;
    
    // Check if no_discount is enabled - if it is, we don't create a discount
    const noDiscountEnabled = discountConfig?.no_discount?.enabled === true;
    
    // Check if discount_code is enabled
    const discountCodeEnabled = discountConfig?.discount_code?.enabled === true;
    
    // Check if manual_discount is enabled
    const manualDiscountEnabled = discountConfig?.manual_discount?.enabled === true;
    
    let discountCode = null;
    let discountCreated = false;
    
    // Only create discount if discount_code is enabled AND no_discount is NOT enabled
    if (discountCodeEnabled && !noDiscountEnabled) {
      if (!store.accessToken) {
        return json({ error: "Store access token not found" }, { status: 404 });
      }
      
      const accessToken = store.accessToken;
      const apiVersion = "2023-10";
      
      // Get discount value from config with fallbacks
      // Default to percentage if discountType is null or invalid
      const discountType = discountConfig?.discount_code?.discountType || "percentage";
      
      // Default to -10 if discountValue is null
      const discountValue = discountConfig?.discount_code?.discountValue || "-10";
      
      // Get expiration settings
      const expirationEnabled = discountConfig?.discount_code?.expiration?.enabled === true;
      const expirationDays = discountConfig?.discount_code?.expiration?.days || 30;
      
      // Calculate end date based on expiration settings
      const endDate = expirationEnabled 
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      discountCode = `WELCOME10-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
            value_type: discountType,
            value: discountValue,
            customer_selection: "all",
            starts_at: new Date().toISOString(),
            ...(endDate && { ends_at: endDate }),
            usage_limit: 1000,
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
      
      discountCreated = true;
    } else if (manualDiscountEnabled && !noDiscountEnabled) {
      // If manual discount is enabled, use the manual discount code from config
      discountCode = discountConfig?.manual_discount?.manualDiscount || null;
      discountCreated = !!discountCode;
    }

    // 🧠 Save email submission to DB regardless of discount creation
    const existingPopup = await prisma.popup.findFirst({
      where: { storeId: store.id },
    });

    if (existingPopup) {
      const currentConfig = existingPopup.config as any;
      await prisma.popup.update({
        where: { id: existingPopup.id },
        data: {
          config: {
            ...currentConfig,
            emails: [...(currentConfig?.emails || []), email],
            ...(discountCode && { 
              discountCodes: [...(currentConfig?.discountCodes || []), discountCode],
              lastDiscountCode: discountCode
            }),
            lastEmail: email,
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
            ...(discountCode && { 
              discountCodes: [discountCode],
              lastDiscountCode: discountCode
            }),
            lastEmail: email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });
    }

    // Return appropriate response based on discount configuration
    if (discountCreated) {
      return json({
        success: true,
        hasDiscount: true,
        discountCode,
        message: "Discount code created successfully",
      });
    } else {
      return json({
        success: true,
        hasDiscount: false,
        message: "Email subscription successful",
      });
    }
  } catch (error: any) {
    console.error("Error processing popup submission:", error);
    return json(
      {
        error: "Failed to process submission",
        details: error.message,
      },
      { status: 500 }
    );
  }
};