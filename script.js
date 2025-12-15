/*************************
  GLOBAL STATE
*************************/
let selectedFlight = "";
let selectedRoute = "";
let bookingCode = "";

/*************************
  BOOKING (INDEX PAGE)
*************************/

// Open booking popup
function openPopup(flight, route) {
  selectedFlight = flight;
  selectedRoute = route;

  document.getElementById("popup-text").innerText =
    `Confirm booking for ${flight} (${route})?`;

  document.getElementById("popup").style.display = "flex";
}

// Close popup
function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// Confirm booking
function confirmBooking() {
  bookingCode = generateCode();

  // Store booking locally (IMPORTANT)
  const bookingData = {
    flight: selectedFlight,
    route: selectedRoute,
    code: bookingCode
  };

  localStorage.setItem(bookingCode, JSON.stringify(bookingData));

  sendBookingToDiscord(selectedFlight, selectedRoute, bookingCode);

  alert(
    `✅ Booking confirmed!\n\nFlight: ${selectedFlight}\nRoute: ${selectedRoute}\nCode: ${bookingCode}`
  );

  closePopup();
}

// Generate booking code
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "BA-";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Send booking to Discord
function sendBookingToDiscord(flight, route, code) {
  fetch("YOUR_BOOKING_WEBHOOK_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `✈️ **New Booking**\nFlight: ${flight}\nRoute: ${route}\nCode: ${code}`
    })
  });
}

/*************************
  CHECK-IN (CHECKIN PAGE)
*************************/

function confirmCheckIn() {
  const name = document.getElementById("nameInput").value.trim();
  const code = document.getElementById("codeInput").value.trim();

  if (!name || !code) {
    alert("Please enter your name and booking code");
    return;
  }

  const storedBooking = localStorage.getItem(code);

  if (!storedBooking) {
    alert("❌ Booking code not found");
    return;
  }

  const booking = JSON.parse(storedBooking);

  // Send webhook
  sendCheckinToDiscord(name, booking);

  // Generate boarding pass
  generateBoardingPass(
    name,
    booking.flight,
    booking.route,
    booking.code
  );

  alert("✅ Check-in successful! Boarding pass downloaded.");
}

// Send check-in webhook
function sendCheckinToDiscord(name, booking) {
  fetch("YOUR_CHECKIN_WEBHOOK_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        `🛂 **Passenger Checked In**\n` +
        `Name: ${name}\n` +
        `Flight: ${booking.flight}\n` +
        `Route: ${booking.route}\n` +
        `Code: ${booking.code}`
    })
  });
}

/*************************
  BOARDING PASS PDF
*************************/

function generateBoardingPass(name, flight, route, code) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Background
  doc.setFillColor(10, 30, 55);
  doc.rect(0, 0, 210, 297, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("BOARDING PASS", 105, 30, { align: "center" });

  doc.setFontSize(14);
  doc.text("British Airways PTFS", 105, 40, { align: "center" });

  // Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 60, 170, 120, 10, 10, "F");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);

  doc.text(`Passenger: ${name}`, 30, 85);
  doc.text(`Flight: ${flight}`, 30, 105);
  doc.text(`Route: ${route}`, 30, 125);
  doc.text(`Booking Code: ${code}`, 30, 145);

  doc.setFontSize(10);
  doc.text("Have a pleasant flight ✈️", 105, 170, { align: "center" });

  doc.save(`BoardingPass-${code}.pdf`);
}
