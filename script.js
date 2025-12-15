let selectedFlight = "";
let selectedRoute = "";
let bookingCode = "";
let bookedCodes = []; // stores valid booking codes (session-based)

/* =========================
   DISCORD WEBHOOKS
   ========================= */
const BOOKING_WEBHOOK_URL = "PASTE_BOOKING_WEBHOOK_HERE";
const CHECKIN_WEBHOOK_URL = "PASTE_CHECKIN_WEBHOOK_HERE";

/* =========================
   BOOKING FUNCTIONS
   ========================= */

function openPopup(flight, route) {
  selectedFlight = flight;
  selectedRoute = route;

  document.getElementById("popup-text").innerText =
    `Confirm booking for ${flight} (${route})?`;

  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function confirmBooking() {
  const email = document.getElementById("emailInput").value.trim();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  bookingCode = generateCode();
  bookedCodes.push(bookingCode);

  // Send email
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    to_email: email,
    flight: selectedFlight,
    route: selectedRoute,
    code: bookingCode
  }).then(() => {
    alert(
      `✅ Booking confirmed!\n\n` +
      `Flight: ${selectedFlight}\n` +
      `Route: ${selectedRoute}\n` +
      `Code: ${bookingCode}\n\n` +
      `📧 Booking code sent by email`
    );
  }).catch(error => {
    alert("❌ Email failed to send: " + error.text);
  });

  sendBookingToDiscord(selectedFlight, selectedRoute, bookingCode);
  closePopup();
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "BA-";

  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

/* =========================
   DISCORD — BOOKINGS
   ========================= */

function sendBookingToDiscord(flight, route, code) {
  fetch(BOOKING_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        `✈️ **New Booking**\n` +
        `Flight: ${flight}\n` +
        `Route: ${route}\n` +
        `Code: ${code}`
    })
  });
}

/* =========================
   CHECK-IN FUNCTIONS
   ========================= */

function confirmCheckIn() {
  const name = document.getElementById("nameInput").value.trim();
  const code = document.getElementById("codeInput").value.trim();

  if (!name || !code) {
    alert("Please enter your name and booking code");
    return;
  }

  if (!bookedCodes.includes(code)) {
    alert("❌ Invalid booking code");
    return;
  }

  alert(
    `✅ Check-in successful!\n\n` +
    `Name: ${name}\n` +
    `Code: ${code}`
  );

  sendCheckinToDiscord(name, code);
}

/* =========================
   DISCORD — CHECK-IN
   ========================= */

function sendCheckinToDiscord(name, code) {
  fetch(CHECKIN_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        `🛂 **Passenger Checked In**\n` +
        `Name: ${name}\n` +
        `Booking Code: ${code}`
    })
  });
}
