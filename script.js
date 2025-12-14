/******** CONFIG ********/
const DISCORD_BOOKING_WEBHOOK = "https://discord.com/api/webhooks/1449494895915176119/MPcthVfsCUIaOeVUKX1w98bTNBtVUPeHOnf6-6ppKR1H2ql9zvaqyaL1zmVq-eALMhIw";
const DISCORD_CHECKIN_WEBHOOK = "https://discord.com/api/webhooks/1449741874742034534/EHOw2DnNNjMXbZT9_5x5UIc7rt4bAskLI4p1fFixcRsd15uCdoaTfh0nCpqGbJxiKOri";

const EMAILJS_PUBLIC_KEY = "B5jlS957IJonuuop9";
const EMAILJS_SERVICE_ID = "service_vq5bl09"; // EmailJS default / SMTP
const EMAILJS_TEMPLATE_ID = "template_8ye9kid";

/******** STATE ********/
let selectedFlight = "";
let selectedRoute = "";
let bookingCode = "";

/******** INIT ********/
document.addEventListener("DOMContentLoaded", () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
});

/******** POPUPS ********/
function openPopup(flight, route) {
  selectedFlight = flight;
  selectedRoute = route;
  document.getElementById("popup-text").innerText =
    `Confirm booking for ${flight} (${route})?`;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function openEmailPopup() {
  document.getElementById("email-popup").style.display = "flex";
}

function closeEmailPopup() {
  document.getElementById("email-popup").style.display = "none";
}

/******** BOOKING ********/
function confirmBooking() {
  bookingCode = generateCode();
  closePopup();
  setTimeout(openEmailPopup, 50);
}

function generateCode() {
  return "BA-" + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function sendBookingEmail() {
  const email = document.getElementById("email-input").value.trim();
  if (!email) return alert("Enter an email");

  emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: email,
      flight: selectedFlight,
      route: selectedRoute,
      code: bookingCode
    }
  ).then(() => {
    sendBookingToDiscord(email);
    alert("✅ Booking confirmed! Check your email.");
    closeEmailPopup();
  }).catch(err => {
    console.error(err);
    alert("❌ Email failed");
  });
}

function sendBookingToDiscord(email) {
  fetch(DISCORD_BOOKING_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        `✈️ New Booking\nFlight: ${selectedFlight}\nRoute: ${selectedRoute}\nCode: ${bookingCode}\nEmail: ${email}`
    })
  });
}

/******** CHECK-IN ********/
function checkIn() {
  const name = document.getElementById("checkin-name").value.trim();
  const code = document.getElementById("checkin-code").value.trim();
  if (!name || !code) return alert("Fill all fields");

  fetch(DISCORD_CHECKIN_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🛄 Check-In Confirmed\nName: ${name}\nCode: ${code}`
    })
  });

  alert("✅ Checked in successfully!");
}
