document.addEventListener('DOMContentLoaded', async function() {
  // Check if popup has already been shown
  if (localStorage.getItem('popupShown')) {
    console.log('Popup already shown to this user');
    return;
  }

  // Fetch popup configuration from the server
  try {
    const shopUrl = new URL(window.location.href);
    const shop = shopUrl.hostname;
    
    if (!shop) {
      console.error('Could not determine shop hostname');
      return;
    }
    
    const response = await fetch(`/apps/popup?shop=${encodeURIComponent(shop)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!data) {
      console.error('Empty response received from server');
      return;
    }
    
    if (data.hasActivePopup && data.popup && data.popup.config) {
      // Check if the popup meets the display criteria
      if (shouldShowPopup(data.popup.config)) {
        showPopup(data.popup.config);
      } else {
        console.log('Popup conditions not met for this page/user');
      }
    } else {
      console.log('No active popup found for this store or invalid configuration');
    }
  } catch (error) {
    console.error('Error fetching popup configuration:', error);
  }
});

// Helper function to determine if popup should be shown based on rules
function shouldShowPopup(config) {
  if (!config || !config.rules) {
    return false;
  }
  
  // Check page rules
  if (config.rules.page_rules) {
    const pageRules = config.rules.page_rules;
    const currentPath = window.location.pathname;
    
    if (pageRules.type === "SPECIFIC") {
      const conditions = Array.isArray(pageRules.conditions) ? pageRules.conditions : [];
      const matchType = pageRules.match_type || "ANY";
      
      let shouldShow = false;
      
      if (matchType === "ANY") {
        shouldShow = conditions.some(condition => {
          if (!condition || typeof condition !== 'object') return false;
          
          if (condition.match === "EQUALS") {
            return currentPath === condition.value;
          } else if (condition.match === "CONTAINS") {
            return currentPath.includes(condition.value);
          } else if (condition.match === "STARTS_WITH") {
            return currentPath.startsWith(condition.value);
          } else if (condition.match === "ENDS_WITH") {
            return currentPath.endsWith(condition.value);
          }
          return false;
        });
      } else if (matchType === "ALL") {
        shouldShow = conditions.length > 0 && conditions.every(condition => {
          if (!condition || typeof condition !== 'object') return false;
          
          if (condition.match === "EQUALS") {
            return currentPath === condition.value;
          } else if (condition.match === "CONTAINS") {
            return currentPath.includes(condition.value);
          } else if (condition.match === "STARTS_WITH") {
            return currentPath.startsWith(condition.value);
          } else if (condition.match === "ENDS_WITH") {
            return currentPath.endsWith(condition.value);
          }
          return false;
        });
      }
      
      if (!shouldShow) {
        return false;
      }
    }
  }
  
  // Check location rules if they exist
  if (config.rules.location_rules) {
    const locationRules = config.rules.location_rules;
    
    // If we have location data, we could check it here
    // This would typically require server-side detection or a geolocation API
    // For now, we'll just pass this check if it's set to "ANY"
    if (locationRules.type !== "ANY") {
      // Implement location checking logic here if needed
      // For example, you could use a geolocation API or IP-based detection
    }
  }
  
  // Check schedule rules if they exist
  if (config.rules.schedule) {
    const scheduleRules = config.rules.schedule;
    
    if (scheduleRules.type === "TIME_RANGE") {
      const now = new Date();
      
      if (scheduleRules.start) {
        const startDate = new Date(scheduleRules.start);
        if (isNaN(startDate.getTime()) || now < startDate) {
          return false;
        }
      }
      
      if (scheduleRules.end) {
        const endDate = new Date(scheduleRules.end);
        if (!isNaN(endDate.getTime()) && now > endDate) {
          return false;
        }
      }
    }
  }
  
  return true;
}

function showPopup(config) {
  if (!config) {
    console.error('Invalid popup configuration');
    return;
  }
  
  // Safely extract configuration values with fallbacks
  const content = config.content || {};
  const style = config.style || {};
  const rules = config.rules || {};
  
  // Set up trigger based on rules
  if (rules.trigger) {
    const triggerType = rules.trigger.type || "TIMER";
    
    if (triggerType === "TIMER") {
      const timerOption = rules.trigger.timerOption || {};
      const delayType = timerOption.delayType || "AFTER_DELAY";
      const delay = delayType === "IMMEDIATE" ? 0 : 
                   ((timerOption.delaySeconds || 3) * 1000);
      
      setTimeout(() => {
        renderPopup(content, style, rules);
      }, delay);
    } else if (triggerType === "SCROLL") {
      const scrollOption = rules.trigger.scrollOption || {};
      const scrollPercentage = scrollOption.percentage || 30;
      
      const scrollHandler = function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        if (docHeight <= 0) {
          return; // Avoid division by zero
        }
        
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (scrollPercent >= scrollPercentage) {
          window.removeEventListener('scroll', scrollHandler);
          renderPopup(content, style, rules);
        }
      };
      
      window.addEventListener('scroll', scrollHandler);
    } else if (triggerType === "EXIT") {
      const exitOption = rules.trigger.exitOption || {};
      
      if (exitOption.enabled !== false) {
        const exitHandler = function(e) {
          if (e.clientY < 0) {
            document.removeEventListener('mouseleave', exitHandler);
            renderPopup(content, style, rules);
          }
        };
        
        document.addEventListener('mouseleave', exitHandler);
      }
    }
  } else {
    // Default to immediate display if no trigger rules
    renderPopup(content, style, rules);
  }
}

function renderPopup(content, style, rules) {
  // Prevent multiple popups
  if (document.getElementById('popup-overlay')) {
    return;
  }
  
  // Create the popup overlay (background)
  const overlayHTML = `
    <div id="popup-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9998;"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // Set up colors with # prefix and fallbacks
  const colors = {
    background: style?.colors?.popup?.backgroud ? `#${style.colors.popup.backgroud}` : '#FFFFFF',
    heading: style?.colors?.text?.heading ? `#${style.colors.text.heading}` : '#121212',
    description: style?.colors?.text?.description ? `#${style.colors.text.description}` : '#454545',
    input: style?.colors?.text?.input ? `#${style.colors.text.input}` : '#121212',
    footerText: style?.colors?.text?.footerText ? `#${style.colors.text.footerText}` : '#454545',
    error: style?.colors?.text?.error ? `#${style.colors.text.error}` : '#D72C0D',
    primaryBtnBg: style?.colors?.primaryButton?.background ? `#${style.colors.primaryButton.background}` : '#121212',
    primaryBtnText: style?.colors?.primaryButton?.text ? `#${style.colors.primaryButton.text}` : '#FFFFFF',
    secondaryBtnText: style?.colors?.secondaryButton?.text ? `#${style.colors.secondaryButton.text}` : '#334FB4'
  };

  // Determine border radius based on style with fallback
  let borderRadius = '0';
  const cornerRadius = style?.display?.cornor_Radius || 'Medium';
  
  if (cornerRadius === 'Small') {
    borderRadius = '4px';
  } else if (cornerRadius === 'Medium') {
    borderRadius = '8px';
  } else if (cornerRadius === 'Large') {
    borderRadius = '12px';
  }

  // Determine size with fallback
  const popupSize = style?.display?.size === 'Standard' ? '450px' : '550px';
  
  // Determine alignment with fallback
  const textAlignment = style?.display?.alignment || 'Left';

  // Check if discount is enabled or not
  const noDiscountEnabled = rules?.discount?.no_discount?.enabled === true;
  const buttonText = noDiscountEnabled ? 'Subscribe' : 'Claim discount';

  // Create the popup
  const popupHTML = `
    <div id="email-popup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
    width: ${popupSize}; max-width: 95%; background: ${colors.background}; 
    z-index: 9999; border-radius: ${borderRadius}; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
      <div id="popup-content" style="padding: 30px 35px 25px;">
        <button id="close-popup" style="position: absolute; top: 10px; right: 12px; background: none; border: none; 
        cursor: pointer; font-size: 24px; color: #777;">×</button>
        
        ${style?.logo?.url ? `<div style="text-align: center; margin-bottom: 20px;">
          <img src="${style.logo.url}" alt="Logo" style="width: ${style.logo.width || '40'}px;">
        </div>` : ''}
        
        <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 28px; font-weight: 600; color: ${colors.heading}; 
        text-align: ${textAlignment};">
          ${content?.Heading || 'Get your discount'}
        </h2>
        
        <p style="margin-top: 0; margin-bottom: 25px; color: ${colors.description}; font-size: 16px; 
        text-align: ${textAlignment};">
          ${content?.Description || 'Sign up to receive your discount code.'}
        </p>
        
        <form id="email-form" style="display: flex; flex-direction: column; gap: 15px;">
          ${content?.form?.fields?.name ? 
            `<div>
              <input type="text" id="popup-name" placeholder="Your name" required 
              style="width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: ${borderRadius}; 
              font-size: 16px; box-sizing: border-box; color: ${colors.input};">
              <div id="name-error" class="error-message" style="color: ${colors.error}; font-size: 14px; margin-top: 5px; display: none;">
                ${content?.errorTexts?.firstName || 'Please enter your name'}
              </div>
            </div>` : ''}
          
          <div>
            <input type="email" id="popup-email" placeholder="Email address" required 
            style="width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: ${borderRadius}; 
            font-size: 16px; box-sizing: border-box; color: ${colors.input};">
            <div id="email-error" class="error-message" style="color: ${colors.error}; font-size: 14px; margin-top: 5px; display: none;">
              ${content?.errorTexts?.email || 'Please enter a valid email address'}
            </div>
          </div>
          
          <button type="submit" style="width: 100%; padding: 14px; background: ${colors.primaryBtnBg}; 
          color: ${colors.primaryBtnText}; border: none; border-radius: ${borderRadius}; cursor: pointer; 
          font-weight: 400; font-size: 16px;">
            ${buttonText}
          </button>
        </form>
        
        ${content?.actions1?.secondary ? 
          `<div style="text-align: center; margin-top: 15px;">
            <button id="no-thanks" style="background: none; border: none; color: ${colors.secondaryBtnText}; 
            cursor: pointer; padding: 5px; font-size: 16px; text-decoration: none;">
              No, thanks
            </button>
          </div>` : ''}
        
        <p style="margin-top: 20px; margin-bottom: 0; color: ${colors.footerText}; font-size: 12px; 
        text-align: center; line-height: 1.5;">
          ${content?.footer?.footerText || 'You can unsubscribe at any time.'}
        </p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', popupHTML);
  
  // Add event listeners
  document.getElementById('email-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => {
      el.style.display = 'none';
    });
    
    // Validate form
    let hasErrors = false;
    
    const emailInput = document.getElementById('popup-email');
    const email = emailInput.value.trim();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const emailError = document.getElementById('email-error');
      if (emailError) {
        emailError.style.display = 'block';
        hasErrors = true;
      }
    }
    
    const nameInput = document.getElementById('popup-name');
    let name = '';
    
    if (nameInput) {
      name = nameInput.value.trim();
      if (!name) {
        const nameError = document.getElementById('name-error');
        if (nameError) {
          nameError.style.display = 'block';
          hasErrors = true;
        }
      }
    }
    
    if (hasErrors) {
      return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
      const shopUrl = new URL(window.location.href);
      const shop = shopUrl.hostname;
      
      if (!shop) {
        throw new Error('Could not determine shop hostname');
      }
      
      const response = await fetch(`/apps/popup?shop=${encodeURIComponent(shop)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      
      // Parse the response JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid response from server');
      }
      
      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.error || data.details || `Server error: ${response.status}`);
      }
      
      // Check if the response indicates success
      if (!data.success) {
        throw new Error(data.error || data.details || 'Unknown error occurred');
      }
      
      // Show success message
      const popupContent = document.getElementById('popup-content');
      
      if (!popupContent) {
        throw new Error('Popup content element not found');
      }
      
      // Check if we have a discount code
      const hasDiscount = data.hasDiscount && data.discountCode;
      
      // Determine success message based on whether discount was created
      const successHeading = hasDiscount 
        ? (content?.success?.heading || 'Discount unlocked 🎉')
        : 'Thank you for subscribing! 🎉';
        
      const successDescription = hasDiscount
        ? (content?.success?.description || 'Thanks for subscribing. Copy your discount code and apply to your next order.')
        : 'You have been successfully subscribed to our newsletter.';
      
      popupContent.innerHTML = `
        <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 28px; font-weight: 600; 
        color: ${colors.heading}; text-align: center;">
          ${successHeading}
        </h2>
        
        <p style="margin-top: 0; margin-bottom: 25px; color: ${colors.description}; font-size: 16px; 
        text-align: center; line-height: 1.5;">
          ${successDescription}
        </p>
        
        ${hasDiscount ? `
        <div style="display: flex; margin-bottom: 25px; gap: 8px; align-items: center;">
          <input type="text" value="${data.discountCode}" id="discount-code" readonly
          style="flex-grow: 1; padding: 12px 15px; border: 1px solid #ddd; border-radius: ${borderRadius}; 
          font-size: 16px; background: #f9f9f9; box-sizing: border-box; outline: none; color: ${colors.input};">
          <button onclick="copyDiscountCode()" id="copy-btn"
          style="background: none; border: none; cursor: pointer; padding: 8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
          </button>
        </div>
        ` : ''}
        
        ${content?.actions2?.enabled ? 
          `<button id="shop-now" style="width: 100%; padding: 14px; background: ${colors.primaryBtnBg}; 
          color: ${colors.primaryBtnText}; border: none; border-radius: ${borderRadius}; cursor: pointer; 
          font-weight: 400; font-size: 16px;">
            ${hasDiscount ? 'Shop now' : 'Continue shopping'}
          </button>` : ''}
      `;
      
      // Add event listener for the "Shop now" button
      if (content?.actions2?.enabled) {
        const shopNowBtn = document.getElementById('shop-now');
        if (shopNowBtn) {
          shopNowBtn.addEventListener('click', function() {
            closePopup();
          });
        }
      }
      
      // Add the copy function if we have a discount code
      if (hasDiscount) {
        window.copyDiscountCode = function() {
          const discountCode = document.getElementById('discount-code');
          if (!discountCode) return;
          
          discountCode.select();
          
          try {
            // Modern approach
            if (navigator.clipboard) {
              navigator.clipboard.writeText(discountCode.value)
                .then(showCopySuccess)
                .catch(err => console.error('Could not copy text: ', err));
            } else {
              // Fallback
              const successful = document.execCommand('copy');
              if (successful) {
                showCopySuccess();
              } else {
                console.error('Unable to copy');
              }
            }
          } catch (err) {
            console.error('Copy failed: ', err);
          }
          
          function showCopySuccess() {
            const copyBtn = document.getElementById('copy-btn');
            if (!copyBtn) return;
            
            copyBtn.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008060" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `;
            
            setTimeout(() => {
              if (document.getElementById('copy-btn')) {
                document.getElementById('copy-btn').innerHTML = `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                `;
              }
            }, 2000);
          }
        };
      }
      
    } catch (error) {
      console.error('Error:', error);
      
      // Show error message
      const formElement = document.getElementById('email-form');
      if (formElement) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = colors.error;
        errorDiv.style.marginTop = '10px';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = error.message || content?.errorTexts?.submitError || 'Something went wrong. Please try again.';
        
        formElement.appendChild(errorDiv);
      }
      
      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = noDiscountEnabled ? 'Subscribe' : 'Claim discount';
      }
    }
  });
  
  // Close popup events
  const closeBtn = document.getElementById('close-popup');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePopup);
  }
  
  const noThanksBtn = document.getElementById('no-thanks');
  if (noThanksBtn) {
    noThanksBtn.addEventListener('click', closePopup);
  }
  
  const overlay = document.getElementById('popup-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closePopup();
      }
    });
  }
}

function closePopup() {
  const overlay = document.getElementById('popup-overlay');
  const popup = document.getElementById('email-popup');
  
  if (overlay) {
    overlay.remove();
  }
  
  if (popup) {
    popup.remove();
  }
  
  localStorage.setItem('popupShown', 'true');
}