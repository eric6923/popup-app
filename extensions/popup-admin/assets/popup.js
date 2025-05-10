document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('popupShown')) {
      showPopup();
    }
  });
  
  function showPopup() {
    const popupHTML = `
      <div id="email-popup" style="position: fixed; bottom: 20px; right: 20px; width: 300px; background: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.2); z-index: 9999; border-radius: 8px;">
        <h3 style="margin-top: 0;">Get 10% Off Your First Order!</h3>
        <p>Enter your email to receive a discount code:</p>
        <form id="email-form" style="display: flex; flex-direction: column; gap: 10px;">
          <input type="email" id="popup-email" placeholder="Your email" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <button type="submit" style="padding: 8px; background: #008060; color: white; border: none; border-radius: 4px; cursor: pointer;">Get Discount</button>
        </form>
        <button id="close-popup" style="position: absolute; top: 5px; right: 5px; background: none; border: none; cursor: pointer; font-size: 16px;">×</button>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
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
        document.getElementById('email-popup').innerHTML = `
          <h3 style="margin-top: 0;">Success!</h3>
          <p>Your 10% discount code: <strong>${data.discountCode}</strong></p>
          <p>Use it at checkout!</p>
        `;
        
        // localStorage.setItem('popupShown', 'true');
        
        setTimeout(() => {
          document.getElementById('email-popup').remove();
        }, 5000);
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get Discount';
      }
    });
    
    document.getElementById('close-popup').addEventListener('click', function() {
      document.getElementById('email-popup').remove();
      localStorage.setItem('popupShown', 'true');
    });
  }