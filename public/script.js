// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('service-booking-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const full_name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const vehicle_make_model = document.getElementById('vehicle').value.trim();
    const license_plate = 'N/A'; // Optional
    const service_needed = document.getElementById('service').value;
    const preferred_date = new Date().toISOString().slice(0, 10); // default to today
    const message = document.getElementById('message').value.trim();

    try {
      const response = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name,
          email,
          phone,
          vehicle_make_model,
          license_plate,
          service_needed,
          preferred_date,
          message
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking submitted successfully! Check your email for a receipt.');
        form.reset();
      } else {
        alert('Booking failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.' + data.error);
    }
  });
});
