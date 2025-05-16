import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";
import { getPopupsByStore } from "../services/popup.server";

/**
 * Checks if a popup is valid based on its scheduling configuration
 * @param scheduleConfig The schedule configuration from the popup
 * @returns boolean indicating if the popup should be active
 */
function checkScheduleValidity(scheduleConfig: any): boolean {
  // If schedule type is ALL_TIME, the popup is always valid
  if (scheduleConfig.type === "ALL_TIME") {
    return true;
  }
  
  // For TIME_RANGE, check if current time falls within the range
  if (scheduleConfig.type === "TIME_RANGE") {
    const now = new Date();
    
    // If there's no start date, consider it invalid
    if (!scheduleConfig.start) {
      return false;
    }
    
    const startDate = new Date(scheduleConfig.start);
    
    // If current time is before start date, it's not yet valid
    if (now < startDate) {
      return false;
    }
    
    // If there's an end date and current time is after it, it's no longer valid
    if (scheduleConfig.end && now > new Date(scheduleConfig.end)) {
      return false;
    }
    
    // Otherwise, it's valid (after start date and either no end date or before end date)
    return true;
  }
  
  // Default to true for unknown schedule types to prevent breaking existing popups
  return true;
}

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
    
    // Check if the popup is valid based on its scheduling configuration
    const config = activePopup.config as any;
    const scheduleConfig = config?.schedule || { type: "ALL_TIME" };
    const isScheduleValid = checkScheduleValidity(scheduleConfig);
    
    if (!isScheduleValid) {
      return json({ 
        hasActivePopup: false,
        message: "Popup is not currently scheduled to be active"
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
    
    // Check scheduling configuration
    const scheduleConfig = config?.schedule || { type: "ALL_TIME" };
    const isScheduleValid = checkScheduleValidity(scheduleConfig);
    
    if (!isScheduleValid) {
      return json({ 
        error: "Popup is not currently scheduled to be active",
        details: "The popup is outside its configured schedule"
      }, { status: 400 });
    }
    
    let discountCode = null;
    let discountCreated = false;
    
    // Only create discount if discount_code is enabled AND no_discount is NOT enabled
    if (discountCodeEnabled && !noDiscountEnabled) {
      if (!store.accessToken) {
        return json({ error: "Store access token not found" }, { status: 404 });
      }
      
      const accessToken = store.accessToken;
      const apiVersion = "2023-10";
      
      // FIXED: Get discount type and value from potentially different locations in the config
      // Some configurations have them directly in discountConfig, others nested in discount_code
      const rawDiscountType = discountConfig?.discountType || discountConfig?.discount_code?.discountType || "percentage";
      const rawDiscountValue = discountConfig?.discountValue || discountConfig?.discount_code?.discountValue || "10";
      
      console.log("Discount config:", { 
        rawDiscountType, 
        rawDiscountValue,
        fullConfig: JSON.stringify(discountConfig, null, 2)
      });
      
      // Map to Shopify's expected value_type format
      let valueType = "percentage"; // default
      if (rawDiscountType === "fixed") {
        valueType = "fixed_amount";
      } else if (rawDiscountType === "percentage") {
        valueType = "percentage";
      } else {
        valueType = rawDiscountType;
      }
      
      // Format discount value appropriately
      let discountValue = rawDiscountValue.toString().replace(/^-/, '');
      
      // For Shopify API: percentage needs negative sign, fixed_amount doesn't
      if (valueType === "percentage") {
        discountValue = `-${discountValue}`;
      }
      
      console.log("Formatted for Shopify:", { valueType, discountValue });
      
      // Get expiration settings
      const expirationEnabled = discountConfig?.discount_code?.expiration?.enabled === true;
      const expirationDays = discountConfig?.discount_code?.expiration?.days || 30;
      
      // Calculate start and end dates based on both expiration settings and schedule
      let startDate = new Date().toISOString();
      let endDate = null;
      
      // If schedule is TIME_RANGE, use those dates as boundaries
      if (scheduleConfig.type === "TIME_RANGE") {
        if (scheduleConfig.start) {
          startDate = new Date(scheduleConfig.start).toISOString();
        }
        
        if (scheduleConfig.end) {
          endDate = new Date(scheduleConfig.end).toISOString();
        }
      }
      
      // If expiration is enabled, calculate end date based on current time plus days
      // But only if it's before the schedule end date or if no schedule end date exists
      if (expirationEnabled) {
        const expirationDate = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString();
        
        if (!endDate || new Date(expirationDate) < new Date(endDate)) {
          endDate = expirationDate;
        }
      }

      discountCode = `WELCOME${rawDiscountValue}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
            value_type: valueType,
            value: discountValue,
            customer_selection: "all",
            starts_at: startDate,
            ...(endDate && { ends_at: endDate }),
            usage_limit: 1000,
            once_per_customer: true,
          },
        }),
      });

      if (!priceRuleRes.ok) {
        const errorText = await priceRuleRes.text();
        console.error("Price rule creation failed:", errorText);
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
        console.error("Discount code creation failed:", errorText);
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