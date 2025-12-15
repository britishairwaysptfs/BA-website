let selectedFlight = "";
let selectedRoute = "";
let bookingCode = "";
let bookedCodes = []; // store all generated booking codes

// BOOKING
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
  
  // Add code to booked codes array
  bookedCodes.push(bookingCode);

  // Send email via EmailJS
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    to_email: email,
    flight: selectedFlight,
    route: selectedRoute,
    code: bookingCode
  }).then(() => {
    alert(`✅ Booking confirmed!\nFlight: ${selectedFlight}\nRoute: ${selectedRoute}\nCode: ${bookingCode}\nEmail sent!`);
  }, (error) => {
    alert("❌ Email failed to send: " + error.text);
  });

  // Send booking to Discord
  sendToDiscord(selectedFlight, selectedRoute, bookingCode);
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

function sendToDiscord(flight, route, code) {
  const webhookURL = "YOUR_DISCORD_WEBHOOK_URL"; // Replace with your webhook
  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `✈️ New Booking!\nFlight: ${flight}\nRoute: ${route}\nCode: ${code}`
    })
  });
}

// CHECK-IN
function confirmCheckIn() {
  const name = document.getElementById("nameInput").value.trim();
  const code = document.getElementById("codeInput").value.trim();

  if (!name || !code) {
    alert("Please enter name and booking code");
    return;
  }

  // Validate booking code
  if (!bookedCodes.includes(code)) {
    alert("❌ Invalid booking code!");
    return;
  }

  alert(`✅ Checked in!\nName: ${name}\nCode: ${code}`);
  sendCheckinToDiscord(name, code);
}

function sendCheckinToDiscord(name, code) {
  const webhookURL = "YOUR_CHECKIN_WEBHOOK_URL"; // Replace with your webhook
  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🛂 Passenger Checked In\nName: ${name}\nCode: ${code}`
    })
  });
}
