import type { LoaderFunction, ActionFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { prisma } from "../lib/prisma.server"
import { getPopupsByStore } from "../services/popup.server"
import { getStoreLocations, shouldShowByLocation } from "../services/location.server"

/**
 * Checks if a popup is valid based on its scheduling configuration
 * @param scheduleConfig The schedule configuration from the popup
 * @returns boolean indicating if the popup should be active
 */
function checkScheduleValidity(scheduleConfig: any): boolean {
  // If schedule type is ALL_TIME, the popup is always valid
  if (scheduleConfig.type === "ALL_TIME") {
    return true
  }

  // For TIME_RANGE, check if current time falls within the range
  if (scheduleConfig.type === "TIME_RANGE") {
    const now = new Date()

    // If there's no start date, consider it invalid
    if (!scheduleConfig.start) {
      return false
    }

    const startDate = new Date(scheduleConfig.start)

    // If current time is before start date, it's not yet valid
    if (now < startDate) {
      return false
    }

    // If there's an end date and current time is after it, it's no longer valid
    if (scheduleConfig.end && now > new Date(scheduleConfig.end)) {
      return false
    }

    // Otherwise, it's valid (after start date and either no end date or before end date)
    return true
  }

  // Default to true for unknown schedule types to prevent breaking existing popups
  return true
}

/**
 * Creates a discount code using Shopify's GraphQL API
 */
async function createGraphQLDiscountCode(
  shop: string,
  accessToken: string,
  options: {
    title: string
    code: string
    startsAt: Date
    endsAt: Date
    discountType: "percentage" | "fixed"
    discountValue: number
    minimumSubtotal?: string | null
    usageLimit?: number
    appliesOncePerCustomer?: boolean
  },
) {
  console.log("Creating discount with GraphQL for shop:", shop)

  const {
    title,
    code,
    startsAt,
    endsAt,
    discountType,
    discountValue,
    minimumSubtotal = null,
    usageLimit = 1000,
    appliesOncePerCustomer = true,
  } = options

  // Prepare the variables for the GraphQL mutation
  const variables: any = {
    basicCodeDiscount: {
      title,
      code,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      customerSelection: {
        all: true,
      },
      usageLimit,
      appliesOncePerCustomer,
    },
  }

  // Set up the discount differently based on type
  if (discountType === "percentage") {
    variables.basicCodeDiscount.customerGets = {
      value: { percentage: discountValue },
      items: { all: true },
    }
  } else {
    // For fixed amount discounts - using the correct structure
    variables.basicCodeDiscount.customerGets = {
      value: {
        // The field is directly 'amount', not nested under 'discountAmount'
        discountAmount: {
          amount: discountValue,
          // currencyCode: "USD",
        },
      },
      items: { all: true },
    }
  }

  // Only add minimum requirement if a valid subtotal is provided
  if (minimumSubtotal && Number.parseFloat(minimumSubtotal) > 0) {
    variables.basicCodeDiscount.minimumRequirement = {
      subtotal: {
        greaterThanOrEqualToSubtotal: minimumSubtotal,
      },
    }
  }

  try {
    console.log("GraphQL variables:", JSON.stringify(variables, null, 2))
    const response = await fetch(`https://${shop}/admin/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `mutation CreateDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  codes(first: 10) {
                    nodes{
                      code
                    }
                  }
                  title
                  startsAt
                  endsAt
                  status
                  usageLimit
                  appliesOncePerCustomer
                  customerGets {
                    value {
                      __typename
                      ...on DiscountPercentage {
                        percentage
                      }
                      ...on DiscountAmount {
                        amount {
                          amount
                          currencyCode
                        }
                      }
                    }
                    items {
                      __typename
                      ...on AllDiscountItems {
                        allItems
                      }
                    }
                  }
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
                    }
                  }
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const result = await response.json()

    if (result.errors || result.data?.discountCodeBasicCreate?.userErrors?.length) {
      const errors = result.errors || result.data.discountCodeBasicCreate.userErrors
      console.error("GraphQL errors:", errors)
      throw new Error(errors.map((e: any) => e.message).join(", "))
    }

    console.log("Discount created successfully:", result.data.discountCodeBasicCreate.codeDiscountNode)
    return result.data.discountCodeBasicCreate.codeDiscountNode
  } catch (error) {
    console.error("Failed to create discount:", error)
    throw new Error(`Discount creation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Creates a free shipping discount code using Shopify's GraphQL API
 */
async function createFreeShippingDiscountCode(
  shop: string,
  accessToken: string,
  options: {
    title: string
    code: string
    startsAt: Date
    endsAt: Date | null
    minimumSubtotal?: string | null
    appliesOncePerCustomer?: boolean
  },
) {
  console.log("Creating free shipping discount with GraphQL for shop:", shop)

  const { title, code, startsAt, endsAt, minimumSubtotal = null, appliesOncePerCustomer = true } = options

  // Prepare the variables for the GraphQL mutation
  const variables: any = {
    freeShippingCodeDiscount: {
      title,
      code,
      startsAt: startsAt.toISOString(),
      appliesOncePerCustomer,
      customerSelection: {
        all: true,
      },
      destination: {
        all: true,
      },
    },
  }

  // Add end date if provided
  if (endsAt) {
    variables.freeShippingCodeDiscount.endsAt = endsAt.toISOString()
  }

  // Only add minimum requirement if a valid subtotal is provided
  if (minimumSubtotal && Number.parseFloat(minimumSubtotal) > 0) {
    variables.freeShippingCodeDiscount.minimumRequirement = {
      subtotal: {
        greaterThanOrEqualToSubtotal: Number.parseFloat(minimumSubtotal),
      },
    }
  }

  try {
    console.log("Free Shipping GraphQL variables:", JSON.stringify(variables, null, 2))
    const response = await fetch(`https://${shop}/admin/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
          discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
            codeDiscountNode {
              id
              codeDiscount {
                ... on DiscountCodeFreeShipping {
                  title
                  startsAt
                  endsAt
                  status
                  appliesOncePerCustomer
                  codes(first: 2) {
                    nodes {
                      code
                    }
                  }
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
                    }
                  }
                  destinationSelection {
                    ... on DiscountCountryAll {
                      allCountries
                    }
                  }
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const result = await response.json()

    if (result.errors || result.data?.discountCodeFreeShippingCreate?.userErrors?.length) {
      const errors = result.errors || result.data.discountCodeFreeShippingCreate.userErrors
      console.error("GraphQL errors:", errors)
      throw new Error(errors.map((e: any) => e.message).join(", "))
    }

    console.log(
      "Free Shipping Discount created successfully:",
      result.data.discountCodeFreeShippingCreate.codeDiscountNode,
    )
    return result.data.discountCodeFreeShippingCreate.codeDiscountNode
  } catch (error) {
    console.error("Failed to create free shipping discount:", error)
    throw new Error(`Free shipping discount creation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const shop = url.searchParams.get("shop")

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 })
  }

  try {
    // Find the store in the database
    const store = await prisma.store.findUnique({
      where: { shop },
    })

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 })
    }

    // Get all popups for this store
    const popups = await getPopupsByStore(store.id)

    // Find the active popup (if any)
    const activePopup = popups.find((popup) => popup.isActive)

    if (!activePopup) {
      return json({
        hasActivePopup: false,
        message: "No active popup found for this store",
      })
    }

    // Check if the popup is valid based on its scheduling configuration
    const config = activePopup.config as any
    const scheduleConfig = config?.schedule || { type: "ALL_TIME" }
    const isScheduleValid = checkScheduleValidity(scheduleConfig)

    if (!isScheduleValid) {
      return json({
        hasActivePopup: false,
        message: "Popup is not currently scheduled to be active",
      })
    }

    // Check location rules if they exist
    if (config?.rules?.location_rules && config.rules.location_rules.type !== "ANY") {
      // Get store locations from Shopify
      const locationData = await getStoreLocations(shop, store.accessToken)

      if (!locationData.success) {
        console.error("Failed to fetch store locations:", locationData.error)
        // Continue without location filtering if we can't get locations
      } else {
        // Check if the popup should be shown based on location rules
        const shouldShowForLocation = shouldShowByLocation(config.rules.location_rules, locationData.countries)

        if (!shouldShowForLocation) {
          return json({
            hasActivePopup: false,
            message: "Popup is not configured to show in this store's location",
          })
        }

        // Add location data to the response for client-side use
        config.storeLocationData = {
          countries: locationData.countries,
        }
      }
    }

    // Return the popup configuration
    return json({
      hasActivePopup: true,
      popup: {
        id: activePopup.id,
        type: activePopup.type,
        config: activePopup.config,
        createdAt: activePopup.createdAt,
        updatedAt: activePopup.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error fetching popup configuration:", error)
    return json(
      {
        error: "Failed to fetch popup configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url)
  const shop = url.searchParams.get("shop")

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 })
  }

  try {
    const formData = await request.json()
    const email = formData.email

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 })
    }

    // ✅ Get the store from DB (with accessToken)
    const store = await prisma.store.findUnique({
      where: { shop },
    })

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 })
    }

    // Get the active popup to check discount configuration
    const popups = await getPopupsByStore(store.id)
    const activePopup = popups.find((popup) => popup.isActive)

    if (!activePopup) {
      return json({ error: "No active popup found" }, { status: 404 })
    }

    // Check discount configuration
    const config = activePopup.config as any
    const discountConfig = config?.rules?.discount

    // Check if no_discount is enabled - if it is, we don't create a discount
    const noDiscountEnabled = discountConfig?.no_discount?.enabled === true

    // Check if discount_code is enabled
    const discountCodeEnabled = discountConfig?.discount_code?.enabled === true

    // Check if manual_discount is enabled
    const manualDiscountEnabled = discountConfig?.manual_discount?.enabled === true

    // Check scheduling configuration
    const scheduleConfig = config?.schedule || { type: "ALL_TIME" }
    const isScheduleValid = checkScheduleValidity(scheduleConfig)

    if (!isScheduleValid) {
      return json(
        {
          error: "Popup is not currently scheduled to be active",
          details: "The popup is outside its configured schedule",
        },
        { status: 400 },
      )
    }

    // Check location rules if they exist
    if (config?.rules?.location_rules && config.rules.location_rules.type !== "ANY") {
      // Get store locations from Shopify
      const locationData = await getStoreLocations(shop, store.accessToken)

      if (locationData.success) {
        // Check if the popup should be shown based on location rules
        const shouldShowForLocation = shouldShowByLocation(config.rules.location_rules, locationData.countries)

        if (!shouldShowForLocation) {
          return json(
            {
              error: "Popup is not configured for this store's location",
              details: "The popup is not available in this region",
            },
            { status: 400 },
          )
        }
      }
    }

    let discountCode = null
    let discountCreated = false

    // Only create discount if discount_code is enabled AND no_discount is NOT enabled
    if (discountCodeEnabled && !noDiscountEnabled) {
      if (!store.accessToken) {
        return json({ error: "Store access token not found" }, { status: 404 })
      }

      const accessToken = store.accessToken

      // Get discount type and value from potentially different locations in the config
      const rawDiscountType =
        discountConfig?.discountType || discountConfig?.discount_code?.discountType || "percentage"
      // For free shipping, we don't need a value
      const rawDiscountValue =
        rawDiscountType === "free-shipping"
          ? ""
          : discountConfig?.discountValue || discountConfig?.discount_code?.discountValue || "10"

      console.log("Discount config:", {
        rawDiscountType,
        rawDiscountValue,
        fullConfig: JSON.stringify(discountConfig, null, 2),
      })

      // Get expiration settings
      const expirationEnabled = discountConfig?.discount_code?.expiration?.enabled === true
      const expirationDays = discountConfig?.discount_code?.expiration?.days || 30

      // Calculate start and end dates based on both expiration settings and schedule
      let startDate = new Date()
      let endDate = expirationEnabled ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : null

      // If schedule is TIME_RANGE, use those dates as boundaries
      if (scheduleConfig.type === "TIME_RANGE") {
        if (scheduleConfig.start) {
          startDate = new Date(scheduleConfig.start)
        }

        if (scheduleConfig.end && endDate) {
          const scheduleEndDate = new Date(scheduleConfig.end)
          if (scheduleEndDate < endDate) {
            endDate = scheduleEndDate
          }
        } else if (scheduleConfig.end) {
          endDate = new Date(scheduleConfig.end)
        }
      }

      // Generate a unique discount code
      discountCode =
        rawDiscountType === "free-shipping"
          ? `FREESHIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          : `WELCOME${rawDiscountValue}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      try {
        // Get minimum subtotal if configured
        const minimumSubtotal = discountConfig?.discount_code?.minimumSubtotal || null

        // Create discount code based on discount type
        if (rawDiscountType === "free-shipping") {
          // Create free shipping discount code
          const discountResult = await createFreeShippingDiscountCode(shop, accessToken, {
            title: `Free Shipping for ${email}`,
            code: discountCode,
            startsAt: startDate,
            endsAt: endDate,
            minimumSubtotal: minimumSubtotal,
            appliesOncePerCustomer: true,
          })

          // Extract the discount code from the response if available
          if (
            discountResult &&
            discountResult.codeDiscount &&
            discountResult.codeDiscount.codes &&
            discountResult.codeDiscount.codes.nodes &&
            discountResult.codeDiscount.codes.nodes.length > 0
          ) {
            discountCode = discountResult.codeDiscount.codes.nodes[0].code
          }
        } else {
          // Parse discount value as a number (don't convert percentage to decimal)
          const discountValue = Number.parseFloat(rawDiscountValue)

          // Check for valid discount value
          if (isNaN(discountValue)) {
            throw new Error("Invalid discount value: " + rawDiscountValue)
          }

          // Create percentage or fixed amount discount code using existing function
          const discountResult = await createGraphQLDiscountCode(shop, accessToken, {
            title: `Welcome Discount for ${email}`,
            code: discountCode,
            startsAt: startDate,
            endsAt: endDate,
            discountType: rawDiscountType === "percentage" ? "percentage" : "fixed",
            discountValue: rawDiscountType === "percentage" ? discountValue / 100 : discountValue, // Only convert to decimal if percentage
            minimumSubtotal: minimumSubtotal,
            usageLimit: 1000,
            appliesOncePerCustomer: true,
          })

          // Extract the discount code from the response if available
          if (
            discountResult &&
            discountResult.codeDiscount &&
            discountResult.codeDiscount.codes &&
            discountResult.codeDiscount.codes.nodes &&
            discountResult.codeDiscount.codes.nodes.length > 0
          ) {
            discountCode = discountResult.codeDiscount.codes.nodes[0].code
          }
        }

        discountCreated = true
      } catch (error) {
        console.error("Failed to create discount code:", error)
        throw new Error(`Discount creation failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else if (manualDiscountEnabled && !noDiscountEnabled) {
      // If manual discount is enabled, use the manual discount code from config
      discountCode = discountConfig?.manual_discount?.manualDiscount || null

      // Only mark as created if we have a non-empty discount code
      if (discountCode && discountCode.trim() !== "") {
        discountCreated = true
        console.log("Using manual discount code:", discountCode)
      } else {
        console.log("Manual discount enabled but no code provided")
        discountCreated = false
      }
    }

    // 🧠 Save email submission to DB regardless of discount creation
    const existingPopup = await prisma.popup.findFirst({
      where: { storeId: store.id },
    })

    if (existingPopup) {
      const currentConfig = existingPopup.config as any
      await prisma.popup.update({
        where: { id: existingPopup.id },
        data: {
          config: {
            ...currentConfig,
            emails: [...(currentConfig?.emails || []), email],
            ...(discountCode && {
              discountCodes: [...(currentConfig?.discountCodes || []), discountCode],
              lastDiscountCode: discountCode,
            }),
            lastEmail: email,
            updatedAt: new Date().toISOString(),
          },
        },
      })
    } else {
      await prisma.popup.create({
        data: {
          storeId: store.id,
          config: {
            emails: [email],
            ...(discountCode && {
              discountCodes: [discountCode],
              lastDiscountCode: discountCode,
            }),
            lastEmail: email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      })
    }

    // Return appropriate response based on discount configuration
    if (discountCreated) {
      return json({
        success: true,
        hasDiscount: true,
        discountCode,
        message: "Discount code created successfully",
      })
    } else {
      return json({
        success: true,
        hasDiscount: false,
        message: "Email subscription successful",
      })
    }
  } catch (error: any) {
    console.error("Error processing popup submission:", error)
    return json(
      {
        error: "Failed to process submission",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
