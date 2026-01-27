/* =========================
   CONFIG
========================= */

// EmailJS
const EMAIL_SERVICE_ID = "service_vq5bl09";
const EMAIL_TEMPLATE_ID = "template_8ye9kid";
const EMAIL_PUBLIC_KEY = "tNAkQInOSkq8sH1UC";

// Discord webhooks
const BOOKING_WEBHOOK =
  "https://discord.com/api/webhooks/BOOKING_WEBHOOK_HERE";
const CHECKIN_WEBHOOK =
  "https://discord.com/api/webhooks/CHECKIN_WEBHOOK_HERE";

/* =========================
   GLOBAL STORAGE
========================= */

let selectedFlight = "";
let selectedRoute = "";
let bookingCodes = JSON.parse(localStorage.getItem("bookingCodes")) || {};
let checkedInCodes = JSON.parse(localStorage.getItem("checkedInCodes")) || {};

/* =========================
   FLIGHT BOOKING
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
  document.getElementById("email-popup").style.display = "none";
}

function confirmBooking() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("email-popup").style.display = "block";
}

/* =========================
   EMAIL + CODE
========================= */

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "BA-";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function submitEmail() {
  const email = document.getElementById("email-input").value.trim();
  if (!email) {
    alert("❌ Please enter an email");
    return;
  }

  const code = generateCode();

  bookingCodes[code] = {
    flight: selectedFlight,
    route: selectedRoute,
    email: email,
  };

  localStorage.setItem("bookingCodes", JSON.stringify(bookingCodes));

  emailjs
    .send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      {
        to_email: email,
        flight: selectedFlight,
        route: selectedRoute,
        code: code,
      },
      EMAIL_PUBLIC_KEY
    )
    .then(() => {
      alert("✅ Booking confirmed! Check your email.");
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error sending email");
    });

  sendBookingToDiscord(selectedFlight, selectedRoute, code, email);
  closePopup();
}

function sendBookingToDiscord(flight, route, code, email) {
  fetch(BOOKING_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        `✈️ **New Booking**\n` +
        `Flight: ${flight}\n` +
        `Route: ${route}\n` +
        `Code: ${code}\n` +
        `Email: ${email}`,
    }),
  });
}

/* =========================
   CHECK-IN
========================= */

function checkIn() {
  const code = document.getElementById("checkin-code").value.trim();

  if (!bookingCodes[code]) {
    alert("❌ Invalid booking code");
    return;
  }

  if (checkedInCodes[code]) {
    alert("⚠️ This code has already been used");
    return;
  }

  document.getElementById("name-popup").style.display = "block";
}

function confirmCheckIn() {
  const code = document.getElementById("checkin-code").value.trim();
  const name = document.getElementById("passenger-name").value.trim();

  if (!name) {
    alert("❌ Enter your name");
    return;
  }

  checkedInCodes[code] = true;
  localStorage.setItem("checkedInCodes", JSON.stringify(checkedInCodes));

  sendCheckInToDiscord(code, name);

  alert("✅ Check-in successful!");
  document.getElementById("name-popup").style.display = "none";
}

function sendCheckInToDiscord(code, name) {
  const booking = bookingCodes[code];

  fetch(CHECKIN_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        `🛂 **Check-in Confirmed**\n` +
        `Name: ${name}\n` +
        `Flight: ${booking.flight}\n` +
        `Route: ${booking.route}\n` +
        `Code: ${code}`,
    }),
  });
}
