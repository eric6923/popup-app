document.addEventListener("DOMContentLoaded", async () => {
  // Check if popup has already been shown and frequency settings
  const popupShown = localStorage.getItem("popupShown") === "true"

  // Fetch popup configuration from the server
  try {
    const shopUrl = new URL(window.location.href)
    const shop = shopUrl.hostname

    if (!shop) {
      console.error("Could not determine shop hostname")
      return
    }

    const response = await fetch(`/apps/popup?shop=${encodeURIComponent(shop)}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data = await response.json()

    // Validate the response data
    if (!data) {
      console.error("Empty response received from server")
      return
    }

    if (data.hasActivePopup && data.popup && data.popup.config) {
      // Store the popup config globally for later use
      window.popupConfig = data.popup.config

      // Check frequency settings
      const frequencyRules = data.popup.config.rules?.frequency

      if (frequencyRules && frequencyRules.type === "ALWAYS") {
        // Always show popup, ignore popupShown flag
        localStorage.removeItem("popupShown")
      } else if (popupShown) {
        console.log("Popup already shown to this user")

        // Even if popup was shown, we might still need to show sticky discount bar
        if (data.popup.config.rules?.stickyDiscountBar?.enabled === true && data.hasDiscount) {
          setupStickyDiscountBar(data.popup.config.content, data.popup.config.style, data.discountCode)
        }

        return
      }

      // Check if the popup meets the display criteria
      if (shouldShowPopup(data.popup.config)) {
        // Don't show sidebar widget initially - it will only show after popup is closed
        showPopup(data.popup.config)
      } else {
        console.log("Popup conditions not met for this page/user")
      }
    } else {
      console.log("No active popup found for this store or invalid configuration")
    }
  } catch (error) {
    console.error("Error fetching popup configuration:", error)
  }
})

// Helper function to determine if popup should be shown based on rules
function shouldShowPopup(config) {
  if (!config || !config.rules) {
    return false
  }

  // Check page rules
  if (config.rules.page_rules) {
    const pageRules = config.rules.page_rules
    const currentPath = window.location.pathname

    if (pageRules.type === "SPECIFIC") {
      const conditions = Array.isArray(pageRules.conditions) ? pageRules.conditions : []
      const matchType = pageRules.match_type || "ANY"

      let shouldShow = false

      if (matchType === "ANY") {
        shouldShow = conditions.some((condition) => {
          if (!condition || typeof condition !== "object") return false

          if (condition.match === "EQUALS") {
            return currentPath === condition.value
          } else if (condition.match === "CONTAINS") {
            return currentPath.includes(condition.value)
          } else if (condition.match === "STARTS_WITH") {
            return currentPath.startsWith(condition.value)
          } else if (condition.match === "ENDS_WITH") {
            return currentPath.endsWith(condition.value)
          }
          return false
        })
      } else if (matchType === "ALL") {
        shouldShow =
          conditions.length > 0 &&
          conditions.every((condition) => {
            if (!condition || typeof condition !== "object") return false

            if (condition.match === "EQUALS") {
              return currentPath === condition.value
            } else if (condition.match === "CONTAINS") {
              return currentPath.includes(condition.value)
            } else if (condition.match === "STARTS_WITH") {
              return currentPath.startsWith(condition.value)
            } else if (condition.match === "ENDS_WITH") {
              return currentPath.endsWith(condition.value)
            }
            return false
          })
      }

      if (!shouldShow) {
        return false
      }
    }
  }

  // Check location rules if they exist
  if (config.rules.location_rules) {
    const locationRules = config.rules.location_rules

    if (locationRules.type !== "ANY") {
      // If we have store location data from the server, use it
      if (config.storeLocationData && config.storeLocationData.countries) {
        const storeCountries = config.storeLocationData.countries

        // No countries in the store or no countries in rules, default behavior
        if (!storeCountries.length || !locationRules.countries || !locationRules.countries.length) {
          return locationRules.type === "EXCLUDE" // Show if excluding (since no countries match)
        }

        // Check if any store country is in the rules countries
        const hasMatchingCountry = storeCountries.some((country) => locationRules.countries.includes(country))

        // For INCLUDE: show if any country matches
        // For EXCLUDE: show if no country matches
        if (
          (locationRules.type === "INCLUDE" && !hasMatchingCountry) ||
          (locationRules.type === "EXCLUDE" && hasMatchingCountry)
        ) {
          return false
        }
      } else {
        // Fallback to browser detection if server didn't provide location data
        // This is less accurate but provides a fallback
        const userCountry = navigator.language ? navigator.language.split("-")[1] : null

        if (userCountry && Array.isArray(locationRules.countries) && locationRules.countries.length > 0) {
          const countryIncluded = locationRules.countries.includes(userCountry)

          if (
            (locationRules.type === "INCLUDE" && !countryIncluded) ||
            (locationRules.type === "EXCLUDE" && countryIncluded)
          ) {
            return false
          }
        }
      }
    }
  }

  // Check schedule rules if they exist
  if (config.rules.schedule) {
    const scheduleRules = config.rules.schedule

    if (scheduleRules.type === "TIME_RANGE") {
      const now = new Date()

      if (scheduleRules.start) {
        const startDate = new Date(scheduleRules.start)
        if (isNaN(startDate.getTime()) || now < startDate) {
          return false
        }
      }

      if (scheduleRules.end) {
        const endDate = new Date(scheduleRules.end)
        if (!isNaN(endDate.getTime()) && now > endDate) {
          return false
        }
      }
    }
  }

  // Check frequency rules
  if (config.rules.frequency) {
    const frequencyRules = config.rules.frequency

    if (frequencyRules.type === "LIMIT") {
      const count = frequencyRules.limit?.count
      const period = frequencyRules.limit?.per

      if (count && period) {
        const popupShownCount = getPopupShownCount()
        const lastShownTime = getLastPopupShownTime()

        if (popupShownCount >= count) {
          // Check if we're still within the period
          if (lastShownTime) {
            const now = new Date()
            const lastTime = new Date(lastShownTime)

            let periodInMs = 0
            if (period === "DAY") {
              periodInMs = 24 * 60 * 60 * 1000
            } else if (period === "WEEK") {
              periodInMs = 7 * 24 * 60 * 60 * 1000
            } else if (period === "MONTH") {
              // Approximate a month as 30 days
              periodInMs = 30 * 24 * 60 * 60 * 1000
            }

            if (now.getTime() - lastTime.getTime() < periodInMs) {
              return false
            } else {
              // Reset counter if period has passed
              resetPopupShownCount()
            }
          }
        }
      }
    }
  }

  return true
}

// Helper functions for frequency tracking
function getPopupShownCount() {
  const count = localStorage.getItem("popupShownCount")
  return count ? Number.parseInt(count, 10) : 0
}

function getLastPopupShownTime() {
  return localStorage.getItem("lastPopupShownTime")
}

function incrementPopupShownCount() {
  const count = getPopupShownCount()
  localStorage.setItem("popupShownCount", count + 1)
  localStorage.setItem("lastPopupShownTime", new Date().toISOString())
}

function resetPopupShownCount() {
  localStorage.setItem("popupShownCount", "0")
  localStorage.setItem("lastPopupShownTime", new Date().toISOString())
}

function showPopup(config) {
  if (!config) {
    console.error("Invalid popup configuration")
    return
  }

  // Safely extract configuration values with fallbacks
  const content = config.content || {}
  const style = config.style || {}
  const rules = config.rules || {}

  // Set up trigger based on rules
  if (rules.trigger) {
    const triggerType = rules.trigger.type || "TIMER"

    if (triggerType === "TIMER") {
      const timerOption = rules.trigger.timerOption || {}
      const delayType = timerOption.delayType || "AFTER_DELAY"
      const delay = delayType === "IMMEDIATELY" ? 0 : (timerOption.delaySeconds || 3) * 1000

      setTimeout(() => {
        renderPopup(content, style, rules)
      }, delay)
    } else if (triggerType === "SCROLL") {
      const scrollOption = rules.trigger.scrollOption || {}
      const scrollPercentage = scrollOption.percentage || 30

      const scrollHandler = () => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight

        if (docHeight <= 0) {
          return // Avoid division by zero
        }

        const scrollPercent = (scrollTop / docHeight) * 100

        if (scrollPercent >= scrollPercentage) {
          window.removeEventListener("scroll", scrollHandler)
          renderPopup(content, style, rules)
        }
      }

      window.addEventListener("scroll", scrollHandler)
    } else if (triggerType === "EXIT") {
      const exitOption = rules.trigger.exitOption || {}

      if (exitOption.enabled !== false) {
        const exitHandler = (e) => {
          // Only trigger if the mouse is leaving from the top of the page
          if (e.clientY < 0) {
            document.removeEventListener("mouseleave", exitHandler)
            renderPopup(content, style, rules)
          }
        }

        document.addEventListener("mouseleave", exitHandler)
      }
    }
  } else {
    // Default to immediate display if no trigger rules
    renderPopup(content, style, rules)
  }
}

// Function to set up sticky discount bar
function setupStickyDiscountBar(content, style, discountCode = null) {
  // Check if bar already exists
  if (document.getElementById("sticky-discount-bar")) {
    return
  }

  // Fix color format - ensure we have # prefix
  const getColor = (colorValue) => {
    if (!colorValue) return null
    return colorValue.startsWith("#") ? colorValue : `#${colorValue}`
  }

  const colors = {
    background: getColor(style?.colors?.stickyDiscountBar?.background) || "#F3F3F3",
    text: getColor(style?.colors?.stickyDiscountBar?.text) || "#121212",
  }

  const barHTML = `
    <div id="sticky-discount-bar" style="position: fixed; top: 0; left: 0; width: 100%; 
    background-color: ${colors.background}; color: ${colors.text}; 
    padding: 12px 16px; z-index: 9997; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 500;">
          ${(() => {
            const discountType =
              window.popupConfig?.rules?.discount?.discountType ||
              window.popupConfig?.rules?.discount?.discount_code?.discountType ||
              "percentage"
            const discountValue =
              window.popupConfig?.rules?.discount?.discountValue ||
              window.popupConfig?.rules?.discount?.discount_code?.discountValue ||
              "10"

            const discountText = discountType === "fixed" ? `$${discountValue} OFF` : `${discountValue}% OFF`
            return content?.stickydiscountbar?.description || `Don't forget to use your ${discountText} discount code`
          })()}
        </span>
        ${
          discountCode
            ? `
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="text" value="${discountCode}" readonly 
          style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-width: 120px;">
          <button onclick="copyDiscountBarCode()" id="bar-copy-btn"
          style="background: none; border: none; cursor: pointer; padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
          </button>
          <button id="close-discount-bar" style="background: none; border: none; cursor: pointer; font-size: 18px; margin-left: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        `
            : `
        <button id="close-discount-bar" style="background: none; border: none; cursor: pointer; font-size: 18px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        `
        }
      </div>
    </div>
  `

  document.body.insertAdjacentHTML("beforeend", barHTML)

  // Add event listener to close button
  document.getElementById("close-discount-bar").addEventListener("click", () => {
    const bar = document.getElementById("sticky-discount-bar")
    if (bar) {
      bar.remove()
    }
  })

  // Add copy function if we have a discount code
  if (discountCode) {
    window.copyDiscountBarCode = () => {
      const discountInput = document.querySelector("#sticky-discount-bar input")
      if (!discountInput) return

      discountInput.select()

      try {
        // Modern approach
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(discountInput.value)
            .then(showCopySuccess)
            .catch((err) => console.error("Could not copy text: ", err))
        } else {
          // Fallback
          const successful = document.execCommand("copy")
          if (successful) {
            showCopySuccess()
          } else {
            console.error("Unable to copy")
          }
        }
      } catch (err) {
        console.error("Copy failed: ", err)
      }

      function showCopySuccess() {
        const copyBtn = document.getElementById("bar-copy-btn")
        if (!copyBtn) return

        copyBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008060" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `

        setTimeout(() => {
          if (document.getElementById("bar-copy-btn")) {
            document.getElementById("bar-copy-btn").innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
              </svg>
            `
          }
        }, 2000)
      }
    }
  }
}

// Function to set up sidebar widget
function setupSidebarWidget(content, style) {
  // Check if widget already exists
  if (document.getElementById("sidebar-widget")) {
    return
  }

  // Don't show sidebar widget if user has already claimed a discount
  if (localStorage.getItem("discountCreated") === "true") {
    return
  }

  // Fix color format - ensure we have # prefix
  const getColor = (colorValue) => {
    if (!colorValue) return null
    return colorValue.startsWith("#") ? colorValue : `#${colorValue}`
  }

  const colors = {
    background: getColor(style?.colors?.sidebarWidget?.background) || "#333333",
    text: getColor(style?.colors?.sidebarWidget?.text) || "#FFFFFF",
  }

  const widgetHTML = `
    <div id="sidebar-widget" style="position: fixed; left: 0; top: 50%; transform: translateY(-50%); 
    background-color: ${colors.background}; color: ${colors.text}; 
    padding: 16px 8px; border-radius: 0 4px 4px 0; cursor: pointer; z-index: 9997; box-shadow: 2px 0 5px rgba(0,0,0,0.1);">
      <div style="writing-mode: vertical-rl; transform: rotate(180deg); text-orientation: mixed; white-space: nowrap; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
        ${(() => {
          const discountType =
            window.popupConfig?.rules?.discount?.discountType ||
            window.popupConfig?.rules?.discount?.discount_code?.discountType ||
            "percentage"
          const discountValue =
            window.popupConfig?.rules?.discount?.discountValue ||
            window.popupConfig?.rules?.discount?.discount_code?.discountValue ||
            "10"

          const defaultText = discountType === "fixed" ? `Get $${discountValue} OFF` : `Get ${discountValue}% OFF`
          return content?.sidebarWidget?.["btn-text"] || defaultText
        })()}
      </div>
    </div>
  `

  document.body.insertAdjacentHTML("beforeend", widgetHTML)

  // Add event listener to widget
  document.getElementById("sidebar-widget").addEventListener("click", function () {
    // Remove the widget
    this.remove()

    // Show the popup
    const config = window.popupConfig
    if (config) {
      renderPopup(config.content, config.style, config.rules)
    }
  })
}

function renderPopup(content, style, rules) {
  // Prevent multiple popups
  if (document.getElementById("popup-overlay")) {
    return
  }

  // Create the popup overlay (background)
  const overlayHTML = `
    <div id="popup-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9998;"></div>
  `
  document.body.insertAdjacentHTML("beforeend", overlayHTML)

  // Fix color format - ensure we have # prefix
  const getColor = (colorValue) => {
    if (!colorValue) return null
    return colorValue.startsWith("#") ? colorValue : `#${colorValue}`
  }

  // Set up colors with # prefix and fallbacks
  const colors = {
    background: getColor(style?.colors?.popup?.backgroud) || "#FFFFFF", // Fix typo from "backgroud" to "background"
    heading: getColor(style?.colors?.text?.heading) || "#121212",
    description: getColor(style?.colors?.text?.description) || "#454545",
    input: getColor(style?.colors?.text?.input) || "#121212",
    inputBorder: getColor(style?.colors?.text?.input ? `${style.colors.text.input}30` : "#12121230"),
    consent: getColor(style?.colors?.text?.consent) || "#454545",
    footerText: getColor(style?.colors?.text?.footerText) || "#454545",
    label: getColor(style?.colors?.text?.label) || "#121212",
    error: getColor(style?.colors?.text?.error) || "#D72C0D",
    primaryBtnBg: getColor(style?.colors?.primaryButton?.background) || "#121212",
    primaryBtnText: getColor(style?.colors?.primaryButton?.text) || "#FFFFFF",
    secondaryBtnText: getColor(style?.colors?.secondaryButton?.text) || "#334FB4",
  }

  // Determine border radius based on style with fallback
  let borderRadius = "0"
  const cornerRadius = style?.display?.cornor_Radius || "Medium"

  if (cornerRadius === "Small") {
    borderRadius = "4px"
  } else if (cornerRadius === "Medium") {
    borderRadius = "8px"
  } else if (cornerRadius === "Large") {
    borderRadius = "12px"
  }

  // Determine size with fallback
  const popupSize = style?.display?.size || "Standard"
  const popupWidth = popupSize === "Standard" ? "450px" : "550px"

  // Determine alignment with fallback
  const textAlignment = style?.display?.alignment || "Left"

  // Determine layout with fallback
  const layout = style?.layout || "Left"
  const hasImage = style?.image && style.image.length > 0

  // Check if discount is enabled or not
  const noDiscountEnabled = rules?.discount?.no_discount?.enabled === true
  const discountCodeEnabled = rules?.discount?.discount_code?.enabled === true
  const manualDiscountEnabled = rules?.discount?.manual_discount?.enabled === true

  // Determine button text based on discount settings and type
  let buttonText = "Subscribe"
  const discountType = rules?.discount?.discountType || rules?.discount?.discount_code?.discountType || "percentage"
  const discountValue = rules?.discount?.discountValue || rules?.discount?.discount_code?.discountValue || "10"

  if (discountCodeEnabled || manualDiscountEnabled) {
    // Customize button text based on discount type
    if (discountType === "fixed") {
      buttonText = content?.actions1?.primaryButtonText || `Claim discount`
    } else {
      buttonText = content?.actions1?.primaryButtonText || `Claim discount`
    }
  } else {
    buttonText = content?.actions1?.primaryButtonText || "Subscribe"
  }

  // Create the popup HTML structure based on layout
  let popupStructure = ""

  if (layout === "Left" || layout === "Right") {
    // Side by side layout
    const imageOnLeft = layout === "Left"

    popupStructure = `
      <div id="popup-content" style="display: flex; flex-direction: ${imageOnLeft ? "row" : "row-reverse"};">
        ${
          hasImage
            ? `
          <div style="flex: 1; background-image: url('${style.image}'); background-size: cover; background-position: center; border-radius: ${imageOnLeft ? `${borderRadius} 0 0 ${borderRadius}` : `0 ${borderRadius} ${borderRadius} 0`};"></div>
        `
            : ""
        }
        <div style="flex: ${hasImage ? "1" : "1"}; padding: 30px 35px 25px;">
          <button id="close-popup" style="position: absolute; top: 10px; right: 12px; background: none; border: none; 
          cursor: pointer; font-size: 24px; color: #777;">×</button>
          
          ${
            style?.logo?.url
              ? `<div style="text-align: center; margin-bottom: 20px;">
            <img src="${style.logo.url}" alt="Logo" style="max-width: 100%; width: ${style.logo.width ? style.logo.width + "px" : "auto"};">
          </div>`
              : ""
          }
          
          <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 28px; font-weight: 600; color: ${colors.heading}; 
          text-align: ${textAlignment};">
            ${content?.Heading || "Get your discount"}
          </h2>
          
          <p style="margin-top: 0; margin-bottom: 25px; color: ${colors.description}; font-size: 16px; 
          text-align: ${textAlignment};">
            ${content?.Description || "Sign up to receive your discount code."}
          </p>
          
          <form id="email-form" style="display: flex; flex-direction: column; gap: 15px;">
            ${
              content?.form?.fields?.name
                ? `<div>
                <input type="text" id="popup-name" placeholder="Your name" required 
                style="width: 100%; padding: 12px 15px; border: 1px solid ${colors.inputBorder}; border-radius: ${borderRadius}; 
                font-size: 16px; box-sizing: border-box; color: ${colors.input};">
                <div id="name-error" class="error-message" style="color: ${colors.error}; font-size: 14px; margin-top: 5px; display: none;">
                  ${content?.errorTexts?.firstName || "Please enter your name"}
                </div>
              </div>`
                : ""
            }
            
            <div>
              <input type="email" id="popup-email" placeholder="Email address" required 
              style="width: 100%; padding: 12px 15px; border: 1px solid ${colors.inputBorder}; border-radius: ${borderRadius}; 
              font-size: 16px; box-sizing: border-box; color: ${colors.input};">
              <div id="email-error" class="error-message" style="color: ${colors.error}; font-size: 14px; margin-top: 5px; display: none;">
                ${content?.errorTexts?.email || "Please enter a valid email address"}
              </div>
            </div>
            
            <button type="submit" style="width: 100%; padding: 14px; background: ${colors.primaryBtnBg}; 
            color: ${colors.primaryBtnText}; border: none; border-radius: ${borderRadius}; cursor: pointer; 
            font-weight: 400; font-size: 16px;">
              ${buttonText}
            </button>
          </form>
          
          ${
            content?.actions1?.secondary
              ? `<div style="text-align: center; margin-top: 15px;">
              <button id="no-thanks" style="background: none; border: none; color: ${colors.secondaryBtnText}; 
              cursor: pointer; padding: 5px; font-size: 16px; text-decoration: none;">
                No, thanks
              </button>
            </div>`
              : ""
          }
          
          <p style="margin-top: 20px; margin-bottom: 0; color: ${colors.footerText}; font-size: 12px; 
          text-align: center; line-height: 1.5;">
            ${content?.footer?.footerText || "You can unsubscribe at any time."}
          </p>
        </div>
      </div>
    `
  } else {
    // Top or Bottom layout
    const imageOnTop = layout === "Top"

    popupStructure = `
      <div id="popup-content" style="display: flex; flex-direction: ${imageOnTop ? "column" : "column-reverse"};">
        ${
          hasImage
            ? `
          <div style="height: 200px; background-image: url('${style.image}'); background-size: cover; background-position: center; border-radius: ${imageOnTop ? `${borderRadius} ${borderRadius} 0 0` : `0 0 ${borderRadius} ${borderRadius}`};"></div>
        `
            : ""
        }
        <div style="padding: 30px 35px 25px;">
          <button id="close-popup" style="position: absolute; top: 10px; right: 12px; background: none; border: none; 
          cursor: pointer; font-size: 24px; color: #777;">×</button>
          
          ${
            style?.logo?.url
              ? `<div style="text-align: center; margin-bottom: 20px;">
            <img src="${style.logo.url}" alt="Logo" style="max-width: 100%; width: ${style.logo.width ? style.logo.width + "px" : "auto"};">
          </div>`
              : ""
          }
          
          <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 28px; font-weight: 600; color: ${colors.heading}; 
          text-align: ${textAlignment};">
            ${content?.Heading || "Get your discount"}
          </h2>
          
          <p style="margin-top: 0; margin-bottom: 25px; color: ${colors.description}; font-size: 16px; 
          text-align: ${textAlignment};">
            ${content?.Description || "Sign up to receive your discount code."}
          </p>
          
          <form id="email-form" style="display: flex; flex-direction: column; gap: 15px;">
            ${
              content?.form?.fields?.name
                ? `<div>
                <input type="text" id="popup-name" placeholder="Your name" required 
                style="width: 100%; padding: 12px 15px; border: 1px solid ${colors.inputBorder}; border-radius: ${borderRadius}; 
                font-size: 16px; box-sizing: border-box; color: ${colors.input};">
                <div id="name-error" class="error-message" style="color: ${colors.error}; font-size: 14px; margin-top: 5px; display: none;">
                  ${content?.errorTexts?.firstName || "Please enter your name"}
                </div>
              </div>`
                : ""
            }
            
            <div>
              <input type="email" id="popup-email" placeholder="Email address" required 
              style="width: 100%; padding: 12px 15px; border: 1px solid ${colors.inputBorder}; border-radius: ${borderRadius}; 
              font-size: 16px; box-sizing: border-box; color: ${colors.input};">
              <div id="email-error" class="error-message" style="color: ${colors.error}; font-size: 14px; margin-top: 5px; display: none;">
                ${content?.errorTexts?.email || "Please enter a valid email address"}
              </div>
            </div>
            
            <button type="submit" style="width: 100%; padding: 14px; background: ${colors.primaryBtnBg}; 
            color: ${colors.primaryBtnText}; border: none; border-radius: ${borderRadius}; cursor: pointer; 
            font-weight: 400; font-size: 16px;">
              ${buttonText}
            </button>
          </form>
          
          ${
            content?.actions1?.secondary
              ? `<div style="text-align: center; margin-top: 15px;">
              <button id="no-thanks" style="background: none; border: none; color: ${colors.secondaryBtnText}; 
              cursor: pointer; padding: 5px; font-size: 16px; text-decoration: none;">
                No, thanks
              </button>
            </div>`
              : ""
          }
          
          <p style="margin-top: 20px; margin-bottom: 0; color: ${colors.footerText}; font-size: 12px; 
          text-align: center; line-height: 1.5;">
            ${content?.footer?.footerText || "You can unsubscribe at any time."}
          </p>
        </div>
      </div>
    `
  }

  // Create the popup container
  const popupHTML = `
    <div id="email-popup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
    width: ${popupWidth}; max-width: 95%; background: ${colors.background}; 
    z-index: 9999; border-radius: ${borderRadius}; box-shadow: 0 0 10px rgba(0,0,0,0.2); overflow: hidden;">
      ${popupStructure}
    </div>
  `

  document.body.insertAdjacentHTML("beforeend", popupHTML)

  // Add event listeners
  document.getElementById("email-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach((el) => {
      el.style.display = "none"
    })

    // Validate form
    let hasErrors = false

    const emailInput = document.getElementById("popup-email")
    const email = emailInput.value.trim()

    if (!email) {
      const emailError = document.getElementById("email-error")
      if (emailError) {
        emailError.textContent = content?.errorTexts?.emailEmpty || "Please enter your email address"
        emailError.style.display = "block"
        hasErrors = true
      }
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const emailError = document.getElementById("email-error")
      if (emailError) {
        emailError.textContent = content?.errorTexts?.emailInvalid || "Please enter a valid email address"
        emailError.style.display = "block"
        hasErrors = true
      }
    }

    const nameInput = document.getElementById("popup-name")
    let name = ""

    if (nameInput) {
      name = nameInput.value.trim()
      if (!name) {
        const nameError = document.getElementById("name-error")
        if (nameError) {
          nameError.textContent = content?.errorTexts?.firstName || "Please enter your name"
          nameError.style.display = "block"
          hasErrors = true
        }
      }
    }

    if (hasErrors) {
      return
    }

    const submitBtn = e.target.querySelector('button[type="submit"]')

    // Show loading state
    submitBtn.disabled = true
    submitBtn.textContent = "Processing..."

    try {
      const shopUrl = new URL(window.location.href)
      const shop = shopUrl.hostname

      if (!shop) {
        throw new Error("Could not determine shop hostname")
      }

      const response = await fetch(`/apps/popup?shop=${encodeURIComponent(shop)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })

      // Parse the response JSON
      let data
      try {
        data = await response.json()
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        throw new Error("Invalid response from server")
      }

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.error || data.details || `Server error: ${response.status}`)
      }

      // Check if the response indicates success
      if (!data.success) {
        throw new Error(data.error || data.details || "Unknown error occurred")
      }

      // Show success message
      const popupContent = document.getElementById("popup-content")

      if (!popupContent) {
        throw new Error("Popup content element not found")
      }

      // Check if we have a discount code
      const hasDiscount = data.hasDiscount && data.discountCode

      // Set flag that discount was created
      if (hasDiscount) {
        localStorage.setItem("discountCreated", "true")

        // Remove sidebar widget if it exists
        const sidebarWidget = document.getElementById("sidebar-widget")
        if (sidebarWidget) {
          sidebarWidget.remove()
        }
      }

      // Get discount type and value from config
      const discountType =
        window.popupConfig?.rules?.discount?.discountType ||
        window.popupConfig?.rules?.discount?.discount_code?.discountType ||
        "percentage"
      const discountValue =
        window.popupConfig?.rules?.discount?.discountValue ||
        window.popupConfig?.rules?.discount?.discount_code?.discountValue ||
        "10"

      // Format discount text based on type
      const discountText = discountType === "fixed" ? `$${discountValue}` : `${discountValue}%`

      // Determine success message based on whether discount was created and its type
      const successHeading = hasDiscount
        ? content?.success?.heading || `${discountText} OFF unlocked 🎉`
        : content?.success?.noDiscountHeading || "Thank you for subscribing! 🎉"

      const successDescription = hasDiscount
        ? content?.success?.description ||
          `Thanks for subscribing. Copy your ${discountText} OFF discount code and apply to your next order.`
        : content?.success?.noDiscountDescription || "You have been successfully subscribed to our newsletter."

      popupContent.innerHTML = `
        <div style="padding: 30px 35px 25px;">
          <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 28px; font-weight: 600; 
          color: ${colors.heading}; text-align: center;">
            ${successHeading}
          </h2>
          
          <p style="margin-top: 0; margin-bottom: 25px; color: ${colors.description}; font-size: 16px; 
          text-align: center; line-height: 1.5;">
            ${successDescription}
          </p>
          
          ${
            hasDiscount
              ? `
          <div style="display: flex; margin-bottom: 25px; gap: 8px; align-items: center;">
            <input type="text" value="${data.discountCode}" id="discount-code" readonly
            style="flex-grow: 1; padding: 12px 15px; border: 1px solid ${colors.inputBorder}; border-radius: ${borderRadius}; 
            font-size: 16px; background: #f9f9f9; box-sizing: border-box; outline: none; color: ${colors.input};">
            <button onclick="copyDiscountCode()" id="copy-btn"
            style="background: none; border: none; cursor: pointer; padding: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
              </svg>
            </button>
          </div>
          `
              : ""
          }
          
          ${
            content?.actions2?.enabled
              ? `<button id="shop-now" style="width: 100%; padding: 14px; background: ${colors.primaryBtnBg}; 
            color: ${colors.primaryBtnText}; border: none; border-radius: ${borderRadius}; cursor: pointer; 
            font-weight: 400; font-size: 16px;">
              ${hasDiscount ? content?.actions2?.primaryButtonText || "Shop now" : content?.actions2?.primaryButtonText || "Continue shopping"}
            </button>`
              : ""
          }
        </div>
      `

      // Add event listener for the "Shop now" button
      if (content?.actions2?.enabled) {
        const shopNowBtn = document.getElementById("shop-now")
        if (shopNowBtn) {
          shopNowBtn.addEventListener("click", () => {
            closePopup()
          })
        }
      }

      // Add the copy function if we have a discount code
      if (hasDiscount) {
        window.copyDiscountCode = () => {
          const discountCode = document.getElementById("discount-code")
          if (!discountCode) return

          discountCode.select()

          try {
            // Modern approach
            if (navigator.clipboard) {
              navigator.clipboard
                .writeText(discountCode.value)
                .then(showCopySuccess)
                .catch((err) => console.error("Could not copy text: ", err))
            } else {
              // Fallback
              const successful = document.execCommand("copy")
              if (successful) {
                showCopySuccess()
              } else {
                console.error("Unable to copy")
              }
            }
          } catch (err) {
            console.error("Copy failed: ", err)
          }

          function showCopySuccess() {
            const copyBtn = document.getElementById("copy-btn")
            if (!copyBtn) return

            copyBtn.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008060" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `

            setTimeout(() => {
              if (document.getElementById("copy-btn")) {
                document.getElementById("copy-btn").innerHTML = `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                `
              }
            }, 2000)
          }
        }
      }

      // Show sticky discount bar if enabled and we have a discount code
      if (rules.stickyDiscountBar && rules.stickyDiscountBar.enabled === true && hasDiscount) {
        setupStickyDiscountBar(content, style, data.discountCode)
      }
    } catch (error) {
      console.error("Error:", error)

      // Show error message
      const formElement = document.getElementById("email-form")
      if (formElement) {
        const errorDiv = document.createElement("div")
        errorDiv.style.color = colors.error
        errorDiv.style.marginTop = "10px"
        errorDiv.style.textAlign = "center"
        errorDiv.textContent =
          error.message || content?.errorTexts?.submitError || "Something went wrong. Please try again."

        formElement.appendChild(errorDiv)
      }

      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = buttonText
      }
    }
  })

  // Close popup events
  const closeBtn = document.getElementById("close-popup")
  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup)
  }

  const noThanksBtn = document.getElementById("no-thanks")
  if (noThanksBtn) {
    noThanksBtn.addEventListener("click", closePopup)
  }

  const overlay = document.getElementById("popup-overlay")
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closePopup()
      }
    })
  }
}

function closePopup() {
  const overlay = document.getElementById("popup-overlay")
  const popup = document.getElementById("email-popup")

  if (overlay) {
    overlay.remove()
  }

  if (popup) {
    popup.remove()
  }

  // Mark popup as shown
  localStorage.setItem("popupShown", "true")

  // Update frequency counter if needed
  if (
    window.popupConfig &&
    window.popupConfig.rules &&
    window.popupConfig.rules.frequency &&
    window.popupConfig.rules.frequency.type === "LIMIT"
  ) {
    incrementPopupShownCount()
  }

  // Show sidebar widget if discount hasn't been created and it's enabled in config
  if (
    localStorage.getItem("discountCreated") !== "true" &&
    window.popupConfig &&
    window.popupConfig.rules &&
    window.popupConfig.rules.sidebarWidget &&
    window.popupConfig.rules.sidebarWidget.enabled === true
  ) {
    setupSidebarWidget(window.popupConfig.content, window.popupConfig.style)
  }
}
