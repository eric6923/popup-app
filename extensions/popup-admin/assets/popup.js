document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('popupShown')) {
    showPopup();
  }
});

function showPopup() {
  // Create the popup overlay (background)
  const overlayHTML = `
    <div id="popup-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9998;"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // Create the popup
  const popupHTML = `
    <div id="email-popup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
    width: 450px; max-width: 95%; background: white; z-index: 9999; border-radius: 0; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
      <div id="popup-content" style="padding: 30px 35px 25px;">
        <button id="close-popup" style="position: absolute; top: 10px; right: 12px; background: none; border: none; 
        cursor: pointer; font-size: 24px; color: #777;">×</button>
        
        <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 28px; font-weight: 600; color: #333; text-align: center;">
          Get 10% OFF your order
        </h2>
        
        <p style="margin-top: 0; margin-bottom: 25px; color: #444; font-size: 16px; text-align: center;">
          Sign up and unlock your instant discount.
        </p>
        
        <form id="email-form" style="display: flex; flex-direction: column; gap: 15px;">
          <input type="email" id="popup-email" placeholder="Email address" required 
          style="width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 0; font-size: 16px; box-sizing: border-box;">
          
          <button type="submit" style="width: 100%; padding: 14px; background: #000; color: white; border: none; 
          border-radius: 5px; cursor: pointer; font-weight: 400; font-size: 16px;">
            Claim discount
          </button>
        </form>
        
        <div style="text-align: center; margin-top: 15px;">
          <button id="no-thanks" style="background: none; border: none; color: #4169e1; 
          cursor: pointer; padding: 5px; font-size: 16px; text-decoration: none;">
            No, thanks
          </button>
        </div>
        
        <p style="margin-top: 20px; margin-bottom: 0; color: #555; font-size: 12px; text-align: center; line-height: 1.5;">
          You are signing up to receive communication via email and can<br>unsubscribe at any time.
        </p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', popupHTML);
  
  // Add event listeners
  document.getElementById('email-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('popup-email').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
      const response = await fetch('/apps/popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create discount');
      }
      
      // Show success message with discount code
      const popupContent = document.getElementById('popup-content');
      // In your success message section, update the discount code input and copy button styles:
popupContent.innerHTML = `
  <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 28px; font-weight: 600; color: #333; text-align: center;">
    Discount unlocked 🎉
  </h2>
  
  <p style="margin-top: 0; margin-bottom: 25px; color: #444; font-size: 16px; text-align: center; line-height: 1.5;">
    Thanks for subscribing. Copy your discount code and apply to<br>your next order.
  </p>
  
  <div style="display: flex; margin-bottom: 25px; gap: 8px; align-items: center;">
    <input type="text" value="${data.discountCode}" id="discount-code" readonly
    style="flex-grow: 1; padding: 12px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; background: #f9f9f9; box-sizing: border-box; outline: none;">
    <button onclick="copyDiscountCode()" id="copy-btn"
    style="background: none; border: none; cursor: pointer; padding: 8px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
      </svg>
    </button>
  </div>
  
  <button id="shop-now" style="width: 100%; padding: 14px; background: #000; color: white; border: none; 
  border-radius: 5px; cursor: pointer; font-weight: 400; font-size: 16px;">
    Shop now
  </button>
`;
      
      // Add event listener for the "Shop now" button
      document.getElementById('shop-now').addEventListener('click', function() {
        document.getElementById('popup-overlay').remove();
        document.getElementById('email-popup').remove();
        localStorage.setItem('popupShown', 'true');
      });
      
              // Add the copy function
      window.copyDiscountCode = function() {
        const discountCode = document.getElementById('discount-code');
        discountCode.select();
        document.execCommand('copy');
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008060" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
          `;
        }, 2000);
      };
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Claim discount';
    }
  });
  
  // Close popup events
  document.getElementById('close-popup').addEventListener('click', closePopup);
  document.getElementById('no-thanks').addEventListener('click', closePopup);
  document.getElementById('popup-overlay').addEventListener('click', closePopup);

  function closePopup() {
    document.getElementById('popup-overlay').remove();
    document.getElementById('email-popup').remove();
    localStorage.setItem('popupShown', 'true');
  }
}