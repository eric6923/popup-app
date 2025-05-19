/**
 * Service to fetch and handle store location data from Shopify
 */
export async function getStoreLocations(shop: string, accessToken: string) {
  try {
    const apiVersion = "2024-04" // Use the latest API version

    const response = await fetch(`https://${shop}/admin/api/${apiVersion}/locations.json`, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      locations: data.locations,
      // Extract countries from locations for easier access
      countries: [...new Set(data.locations.map((loc: any) => loc.country_code))],
    }
  } catch (error) {
    console.error("Error fetching store locations:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Determine if a popup should be shown based on location rules
 */
export function shouldShowByLocation(locationRules: any, storeCountries: string[]) {
  // If no location rules or set to ANY, always show
  if (!locationRules || locationRules.type === "ANY") {
    return true
  }

  // If no countries in the store or no countries in rules, default behavior
  if (!storeCountries.length || !locationRules.countries || !locationRules.countries.length) {
    return locationRules.type === "EXCLUDE" // Show if excluding (since no countries match)
  }

  // Check if any store country is in the rules countries
  const hasMatchingCountry = storeCountries.some((country) => locationRules.countries.includes(country))

  // For INCLUDE: show if any country matches
  // For EXCLUDE: show if no country matches
  return locationRules.type === "INCLUDE" ? hasMatchingCountry : !hasMatchingCountry
}
