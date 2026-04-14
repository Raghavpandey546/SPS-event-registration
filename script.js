/* ═══════════════════════════════════════════════════
   IEEE SPS — script.js
   Handles: canvas animation · form validation · Firebase
   ═══════════════════════════════════════════════════ */

"use strict";

/* ── CANVAS WAVEFORM BACKGROUND ────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, animId;
  let time = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  // Wave parameters
  const waves = [
    { freq: 0.008, amp: 55,  speed: 0.018, color: "rgba(0,245,255,0.18)",   y: 0.35, thick: 1.5 },
    { freq: 0.012, amp: 35,  speed: 0.026, color: "rgba(123,47,255,0.20)",  y: 0.55, thick: 1.2 },
    { freq: 0.006, amp: 70,  speed: 0.011, color: "rgba(0,245,255,0.08)",   y: 0.70, thick: 2.0 },
    { freq: 0.015, amp: 25,  speed: 0.032, color: "rgba(245,200,66,0.10)",  y: 0.20, thick: 1.0 },
    { freq: 0.009, amp: 45,  speed: 0.015, color: "rgba(123,47,255,0.12)",  y: 0.80, thick: 1.5 },
  ];

  // Grid dots
  const COLS = Math.ceil(W / 60);
  const ROWS = Math.ceil(H / 60);

  function drawGrid() {
    ctx.fillStyle = "rgba(0, 245, 255, 0.06)";
    for (let c = 0; c <= COLS + 2; c++) {
      for (let r = 0; r <= ROWS + 2; r++) {
        const x = c * 60;
        const y = r * 60;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawWave(wave) {
    ctx.beginPath();
    ctx.strokeStyle = wave.color;
    ctx.lineWidth   = wave.thick;

    const baseY = H * wave.y;

    for (let x = 0; x <= W; x += 2) {
      // Multi-harmonic signal shape
      const y = baseY
        + Math.sin(x * wave.freq + time * wave.speed) * wave.amp
        + Math.sin(x * wave.freq * 2.3 + time * wave.speed * 1.4) * (wave.amp * 0.3)
        + Math.sin(x * wave.freq * 0.5 + time * wave.speed * 0.6) * (wave.amp * 0.15);

      if (x === 0) ctx.moveTo(x, y);
      else         ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Glowing particles
  const particles = Array.from({ length: 28 }, () => ({
    x:    Math.random() * 1200,
    y:    Math.random() * 800,
    vx:   (Math.random() - 0.5) * 0.3,
    vy:   (Math.random() - 0.5) * 0.3,
    r:    Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
    color: Math.random() > 0.5 ? "0,245,255" : "123,47,255",
  }));

  function drawParticles() {
    particles.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    waves.forEach(drawWave);
    drawParticles();
    time++;
    animId = requestAnimationFrame(draw);
  }

  draw();
})();

/* ── RSVP TOGGLE LABELS ─────────────────────────────── */
const rsvpToggle = document.getElementById("rsvpToggle");
const rsvpYes    = document.getElementById("rsvp-yes-label");
const rsvpNo     = document.getElementById("rsvp-no-label");

if (rsvpToggle) {
  // Default: attending (toggle ON)
  rsvpToggle.checked = true;
  rsvpYes.classList.add("active");
  rsvpNo.classList.remove("active");

  rsvpToggle.addEventListener("change", () => {
    const on = rsvpToggle.checked;
    rsvpYes.classList.toggle("active", on);
    rsvpNo.classList.toggle("active", !on);
  });
}

/* ── FORM SUBMISSION ─────────────────────────────────── */
const form      = document.getElementById("registrationForm");
const msgEl     = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

function showMessage(text, type = "success") {
  msgEl.textContent  = text;
  msgEl.className    = `form-message ${type}`;
}

function clearMessage() {
  msgEl.textContent = "";
  msgEl.className   = "form-message";
}

function setLoading(loading) {
  if (loading) {
    submitBtn.disabled    = true;
    submitBtn.querySelector(".btn-text").textContent = "SENDING…";
  } else {
    submitBtn.disabled    = false;
    submitBtn.querySelector(".btn-text").textContent = "REGISTER";
  }
}

// Simple email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// SAP ID validation (8–10 digits typical)
function isValidSAP(sap) {
  return /^\d{8,12}$/.test(sap.replace(/\s/g, ""));
}

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearMessage();

    const name  = document.getElementById("name").value.trim();
    const sapid = document.getElementById("sapid").value.trim();
    const email = document.getElementById("email").value.trim();
    const rsvp  = rsvpToggle ? (rsvpToggle.checked ? "Yes" : "No") : "Yes";

    // ── CLIENT-SIDE VALIDATION ────────────────────────
    if (!name) {
      showMessage("⚠ Please enter your full name.", "error");
      document.getElementById("name").focus();
      return;
    }

    if (!sapid || !isValidSAP(sapid)) {
      showMessage("⚠ Please enter a valid SAP ID (8–12 digits).", "error");
      document.getElementById("sapid").focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showMessage("⚠ Please enter a valid email address.", "error");
      document.getElementById("email").focus();
      return;
    }

    // ── FIREBASE PUSH ─────────────────────────────────
    setLoading(true);

    const payload = {
      name,
      sapid,
      email,
      rsvp,
      registeredAt: new Date().toISOString(),
    };

    try {
      if (typeof window.__firebasePush === "function") {
        await window.__firebasePush(payload);
        showMessage("✓ You're registered! See you at the event.", "success");
        form.reset();
        // Reset RSVP to default ON after form reset
        if (rsvpToggle) {
          rsvpToggle.checked = true;
          rsvpYes.classList.add("active");
          rsvpNo.classList.remove("active");
        }
      } else {
        // Firebase not configured — log to console in dev
        console.warn("Firebase not configured. Payload:", payload);
        showMessage("✓ Registered! (Firebase config pending)", "success");
        form.reset();
      }
    } catch (err) {
      console.error("Firebase error:", err);
      showMessage("✗ Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
}
