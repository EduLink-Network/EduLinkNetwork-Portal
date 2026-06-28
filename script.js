// WhatsApp number
var whatsappNumber = "2347087042035";

function openWhatsApp() {
  window.open("https://wa.me/" + whatsappNumber, "_blank");
}

// Page 1 — Select plan
function selectPlan(plan, amount) {
  var hostel = document.querySelector('select').value;

  if (hostel === "") {
    alert("Please select your hostel first");
    return;
  }

  sessionStorage.setItem("pending_plan", plan);
  sessionStorage.setItem("pending_amount", amount);
  sessionStorage.setItem("pending_hostel", hostel);
  window.location.href = "payment.html";
}

// Page 1 — Connect with voucher
async function connectVoucher() {
  var code = document.getElementById("voucher-input").value.trim().toUpperCase();
  var hostel = document.querySelector('select').value;

  if (code === "") {
    alert("Please enter your voucher code");
    return;
  }

  if (hostel === "") {
    alert("Please select your hostel first");
    return;
  }

  try {
    const response = await fetch("https://edulink-backend-yccm.onrender.com/validate-voucher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: code, hostel: hostel })
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message);
      return;
    }

    sessionStorage.clear();
    sessionStorage.setItem("plan", result.plan);
    sessionStorage.setItem("amount", result.amount);
    sessionStorage.setItem("hostel", result.hostel);

    window.location.href = "session.html";

  } catch (error) {
    alert("Could not connect to server. Please try again.");
  }
}

// Page 2 — Load payment summary
function loadPaymentPage() {
  var plan = sessionStorage.getItem("pending_plan");
  var hostel = sessionStorage.getItem("pending_hostel");
  var amount = sessionStorage.getItem("pending_amount");

  if (document.getElementById("selected-plan")) {
    document.getElementById("selected-plan").textContent = "Plan: " + plan;
    document.getElementById("selected-hostel").textContent = "Hostel: " + hostel;
    document.getElementById("selected-amount").textContent = "Amount: ₦" + amount;
  }
}

// Page 2 — Pay with Paystack
function payWithPaystack() {
  var amount = sessionStorage.getItem("pending_amount");
  var hostel = sessionStorage.getItem("pending_hostel");
  var plan = sessionStorage.getItem("pending_plan");

  if (!amount || !hostel || !plan) {
    alert("Session expired. Please go back and select a plan.");
    window.location.href = "index.html";
    return;
  }

  if (typeof PaystackPop === "undefined") {
    alert("Payment system not loaded. Please check your internet connection.");
    return;
  }

  var handler = PaystackPop.setup({
    key: "pk_test_2ad9a4e8f096ce60d4baca9c0995add3dd1306bd",
    email: "student+" + Math.floor(Math.random() * 1000000) + "@edulink.com",
    amount: amount * 100,
    currency: "NGN",
    ref: "EDU-" + Math.floor(Math.random() * 1000000),
    metadata: { hostel: hostel },
    callback: function(response) {
      var confirmedPlan = sessionStorage.getItem("pending_plan");
      var confirmedAmount = sessionStorage.getItem("pending_amount");
      var confirmedHostel = sessionStorage.getItem("pending_hostel");

      sessionStorage.clear();

      sessionStorage.setItem("plan", confirmedPlan);
      sessionStorage.setItem("amount", confirmedAmount);
      sessionStorage.setItem("hostel", confirmedHostel);
      sessionStorage.setItem("paymentRef", response.reference);

      fetch("https://edulink-backend-yccm.onrender.com/log-transaction", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    hostel: confirmedHostel,
    plan: confirmedPlan,
    amount: parseInt(confirmedAmount),
    payment_type: 'paystack',
    reference: response.reference
  })
}).then(function() {
  window.location.href = "success.html";
});
    },
    onClose: function() {
      alert("Payment cancelled");
    }
  });

  handler.openIframe();
}

// Page 3 — Load session
function loadSessionPage() {
  var plan = sessionStorage.getItem("plan");
  var hostel = sessionStorage.getItem("hostel");
  var amount = parseInt(sessionStorage.getItem("amount"));

  var prompt = document.getElementById("session-prompt");
  var status = document.getElementById("session-status");
  var heading = document.getElementById("session-heading");
  var disconnectBtn = document.getElementById("disconnect-btn");

  if (!plan || !amount || isNaN(amount)) {
    heading.textContent = "No Active Session";
    status.textContent = "● Session Inactive";
    status.className = "status-inactive";
    document.getElementById("session-plan").textContent = "";
    document.getElementById("session-hostel").textContent = "";
    document.getElementById("countdown").textContent = "--:--:--";
    prompt.textContent = "Please purchase a plan or enter a voucher code to begin your session.";
    disconnectBtn.style.display = "none";
    return;
  }

  heading.textContent = "You're Connected";
  status.textContent = "● Session Active";
  status.className = "status-active";
  document.getElementById("session-plan").textContent = "Plan: " + plan;
  document.getElementById("session-hostel").textContent = "Hostel: " + hostel;
  prompt.textContent = "";
  disconnectBtn.style.display = "block";

  var hours;
  if (amount === 300) hours = 17;
  else if (amount === 200) hours = 7;
  else if (amount === 1800) hours = 168;
  else if (amount === 1200) hours = 168;
  else hours = 1;

  startCountdown(hours);
}

// Page 3 — Countdown timer
function startCountdown(hours) {
  // Check if end time already exists
  var endTime = sessionStorage.getItem("session_end_time");

  if (!endTime) {
    // First time — calculate and save end time
    endTime = new Date().getTime() + (hours * 3600 * 1000);
    sessionStorage.setItem("session_end_time", endTime);
  }

  var interval = setInterval(function() {
    var now = new Date().getTime();
    var remaining = endTime - now;

    if (remaining <= 0) {
      clearInterval(interval);
      document.getElementById("countdown").textContent = "00:00:00";
      sessionStorage.clear();
      alert("Your session has ended. Please purchase a new plan.");
      window.location.href = "index.html";
      return;
    }

    var h = Math.floor(remaining / (1000 * 3600));
    var m = Math.floor((remaining % (1000 * 3600)) / (1000 * 60));
    var s = Math.floor((remaining % (1000 * 60)) / 1000);

    document.getElementById("countdown").textContent =
      pad(h) + ":" + pad(m) + ":" + pad(s);

  }, 1000);
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

// Page 3 — Disconnect
function disconnectSession() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// Page 4 — Admin login
function adminLogin() {
  var password = document.getElementById("admin-password").value;

  if (password === "EduLink2024") {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("dashboard-section").style.display = "block";
    loadDashboard();
  } else {
    alert("Incorrect password. Access denied.");
    document.getElementById("admin-password").value = "";
  }
}

// Page 4 — Load dashboard
async function loadDashboard() {
  try {
    const response = await fetch("https://edulink-backend-yccm.onrender.com/dashboard");
    const data = await response.json();

    if (!data.success) {
      document.getElementById("transactions").innerHTML = "<p>Error loading data.</p>";
      return;
    }

    document.getElementById("male-sessions").textContent = "Sessions: " + data.hostels["new-male"].sessions;
    document.getElementById("male-revenue").textContent = "Revenue: ₦" + data.hostels["new-male"].revenue.toLocaleString();
    document.getElementById("female-sessions").textContent = "Sessions: " + data.hostels["new-female"].sessions;
    document.getElementById("female-revenue").textContent = "Revenue: ₦" + data.hostels["new-female"].revenue.toLocaleString();
    document.getElementById("abuja-sessions").textContent = "Sessions: " + data.hostels["abuja"].sessions;
    document.getElementById("abuja-revenue").textContent = "Revenue: ₦" + data.hostels["abuja"].revenue.toLocaleString();
    document.getElementById("nana-sessions").textContent = "Sessions: " + data.hostels["nana"].sessions;
    document.getElementById("nana-revenue").textContent = "Revenue: ₦" + data.hostels["nana"].revenue.toLocaleString();

    var html = "";
    data.transactions.forEach(function(t) {
      html += "<div style='border-bottom: 1px solid #00d4ff; padding: 8px 0;'>";
      html += "<p style='color:white; margin:2px 0;'>" + t.plan + "</p>";
      html += "<p style='margin:2px 0;'>Hostel: " + t.hostel + "</p>";
      html += "<p style='margin:2px 0;'>Amount: ₦" + t.amount + " — " + t.payment_type + "</p>";
      html += "<p style='margin:2px 0; font-size:11px;'>Ref: " + t.reference + "</p>";
      html += "</div>";
    });

    document.getElementById("transactions").innerHTML = html || "<p>No transactions yet.</p>";

  } catch (error) {
    document.getElementById("transactions").innerHTML = "<p>Error loading dashboard.</p>";
  }
}

// Page 4 — Logout
function adminLogout() {
  document.getElementById("dashboard-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
  document.getElementById("admin-password").value = "";
}

// Success page
function loadSuccessPage() {
  var plan = sessionStorage.getItem("plan");
  var hostel = sessionStorage.getItem("hostel");
  var amount = sessionStorage.getItem("amount");
  var ref = sessionStorage.getItem("paymentRef");

  if (document.getElementById("success-plan")) {
    document.getElementById("success-plan").textContent = "Plan: " + plan;
    document.getElementById("success-hostel").textContent = "Hostel: " + hostel;
    document.getElementById("success-amount").textContent = "Amount: ₦" + amount;
    document.getElementById("success-ref").textContent = "Ref: " + ref;
  }
}

// Recovery page
async function recoverSession() {
  var ref = document.getElementById("recovery-ref").value.trim().toUpperCase();
  var message = document.getElementById("recovery-message");

  if (ref === "") {
    message.textContent = "Please enter your transaction reference.";
    message.style.color = "#ff4444";
    return;
  }

  message.textContent = "Checking your transaction...";
  message.style.color = "#00d4ff";

  try {
    const response = await fetch("https://edulink-backend-yccm.onrender.com/recover-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reference: ref })
    });

    const result = await response.json();

    if (!result.success) {
      message.textContent = "No transaction found. Please contact support via WhatsApp.";
      message.style.color = "#ff4444";
      return;
    }

    sessionStorage.clear();
    sessionStorage.setItem("plan", result.plan);
    sessionStorage.setItem("amount", result.amount);
    sessionStorage.setItem("hostel", result.hostel);
    sessionStorage.setItem("paymentRef", ref);

    message.textContent = "Session restored. Redirecting...";
    message.style.color = "#25d366";

    setTimeout(function() {
      window.location.href = "session.html";
    }, 2000);

  } catch (error) {
    message.textContent = "Could not connect to server. Please try again.";
    message.style.color = "#ff4444";
  }
}
