/* ═══════════════════════════════════════════════════
   IEEE SPS — script.js (ES Module) - FIRESTORE VERSION
   Handles: canvas · page transitions · validation · Firebase
   ═══════════════════════════════════════════════════ */

"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// FIRESTORE IMPORTS:
import { getFirestore, collection, addDoc, query, where, getDocs }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

/* ── FIREBASE INIT ───────────────────────────────── */
let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app); // INITIALISE FIRESTORE
} catch (err) {
  console.warn("Firebase not initialised — check firebase-config.js", err);
}

/* ── LUCIDE ICONS ────────────────────────────────── */
if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

/* ═══════════════════════════════════════════════════
   CANVAS WAVEFORM BACKGROUND
   ═══════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, time = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const waves = [
    { freq: 0.008, amp: 55,  speed: 0.018, color: "rgba(0,245,255,0.18)",  y: 0.35, thick: 1.5 },
    { freq: 0.012, amp: 35,  speed: 0.026, color: "rgba(123,47,255,0.20)", y: 0.55, thick: 1.2 },
    { freq: 0.006, amp: 70,  speed: 0.011, color: "rgba(0,245,255,0.08)",  y: 0.70, thick: 2.0 },
    { freq: 0.015, amp: 25,  speed: 0.032, color: "rgba(245,200,66,0.10)", y: 0.20, thick: 1.0 },
    { freq: 0.009, amp: 45,  speed: 0.015, color: "rgba(123,47,255,0.12)", y: 0.80, thick: 1.5 },
  ];

  const particles = Array.from({ length: 28 }, () => ({
    x: Math.random() * 1200,
    y: Math.random() * 800,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
    color: Math.random() > 0.5 ? "0,245,255" : "123,47,255",
  }));

  function drawGrid() {
    ctx.fillStyle = "rgba(0,245,255,0.06)";
    for (let c = 0; c * 60 <= W + 60; c++) {
      for (let r = 0; r * 60 <= H + 60; r++) {
        ctx.beginPath();
        ctx.arc(c * 60, r * 60, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawWave(w) {
    ctx.beginPath();
    ctx.strokeStyle = w.color;
    ctx.lineWidth   = w.thick;
    const baseY = H * w.y;
    for (let x = 0; x <= W; x += 2) {
      const y = baseY
        + Math.sin(x * w.freq + time * w.speed) * w.amp
        + Math.sin(x * w.freq * 2.3 + time * w.speed * 1.4) * (w.amp * 0.3)
        + Math.sin(x * w.freq * 0.5 + time * w.speed * 0.6) * (w.amp * 0.15);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

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

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGrid(); waves.forEach(drawWave); drawParticles();
    time++;
    requestAnimationFrame(loop);
  })();
})();

/* ═══════════════════════════════════════════════════
   TWO-PAGE NAVIGATION
   ═══════════════════════════════════════════════════ */
const page1 = document.getElementById("page-1");
const page2 = document.getElementById("page-2");

function goToPage2() {
  page1.classList.add("slide--exit");
  setTimeout(() => {
    page1.classList.add("slide--hidden");
    page1.classList.remove("slide--exit");
    page1.style.position = "absolute";

    page2.classList.remove("slide--hidden");
    page2.classList.add("slide--enter");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof lucide !== "undefined") lucide.createIcons();
  }, 320);
}

function goToPage1() {
  page2.classList.add("slide--exit");
  setTimeout(() => {
    page2.classList.add("slide--hidden");
    page2.classList.remove("slide--exit", "slide--enter");

    page1.style.position = "";
    page1.classList.remove("slide--hidden", "slide--exit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 320);
}

document.getElementById("toFormBtn")?.addEventListener("click", goToPage2);
document.getElementById("toDetailsBtn")?.addEventListener("click", goToPage1);

/* ═══════════════════════════════════════════════════
   FORM VALIDATION & SUBMISSION
   ═══════════════════════════════════════════════════ */
const form      = document.getElementById("registrationForm");
const msgEl     = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

function showMessage(text, type = "success") {
  msgEl.textContent = text;
  msgEl.className   = `form-message ${type}`;
}
function clearMessage() {
  msgEl.textContent = "";
  msgEl.className   = "form-message";
}
function setLoading(on) {
  submitBtn.disabled = on;
  const span = submitBtn.querySelector(".btn-text");
  if (span) span.textContent = on ? "SUBMITTING…" : "SUBMIT REGISTRATION";
}

const validators = {
  name:  v => v.trim().length >= 2 && /^[a-zA-Z\s'.,-]{2,80}$/.test(v.trim()),
  sapid: v => /^\d{8,12}$/.test(v.trim()),
  year:  v => ["1st", "2nd", "3rd", "4th"].includes(v),
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  phone: v => /^[+\d\s\-()]{7,15}$/.test(v.trim()),
};

const RATE_LIMIT_MS = 60_000;

function isRateLimited() {
  const last = sessionStorage.getItem("sps_last_submit");
  if (!last) return false;
  return (Date.now() - parseInt(last, 10)) < RATE_LIMIT_MS;
}
function stampSubmit() {
  sessionStorage.setItem("sps_last_submit", Date.now().toString());
}
function sanitize(str) {
  return str.replace(/<[^>]*>/g, "").trim().slice(0, 200);
}

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearMessage();

    const name  = document.getElementById("name").value;
    const sapid = document.getElementById("sapid").value;
    const year  = document.getElementById("year").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    if (!validators.name(name)) {
      showMessage("⚠ Please enter your full name (letters only, 2–80 chars).", "error");
      document.getElementById("name").focus(); return;
    }
    if (!validators.sapid(sapid)) {
      showMessage("⚠ SAP ID must be 8–12 digits.", "error");
      document.getElementById("sapid").focus(); return;
    }
    if (!validators.year(year)) {
      showMessage("⚠ Please select your year of study.", "error");
      document.getElementById("year").focus(); return;
    }
    if (!validators.email(email)) {
      showMessage("⚠ Please enter a valid email address.", "error");
      document.getElementById("email").focus(); return;
    }
    if (!validators.phone(phone)) {
      showMessage("⚠ Please enter a valid phone number.", "error");
      document.getElementById("phone").focus(); return;
    }

    if (isRateLimited()) {
      showMessage("⚠ Please wait a moment before submitting again.", "error"); return;
    }

    setLoading(true);

    const payload = {
      name:         sanitize(name),
      sapid:        sanitize(sapid),
      year:         sanitize(year),
      email:        sanitize(email).toLowerCase(),
      phone:        sanitize(phone),
      registeredAt: new Date().toISOString(),
    };

    try {
      if (db) {
        // ── FIRESTORE: DUPLICATE SAP ID CHECK ─────────────────
        const registrationsRef = collection(db, "registrations");
        const dupQuery = query(registrationsRef, where("sapid", "==", payload.sapid));
        const snap = await getDocs(dupQuery);

        if (!snap.empty) {
          showMessage("⚠ This SAP ID is already registered.", "error");
          setLoading(false); return;
        }

        // ── FIRESTORE: ADD DOCUMENT ───────────────────────
        await addDoc(registrationsRef, payload);
        stampSubmit();
        showMessage("✓ You're registered! See you at the event.", "success");
        form.reset();
      } else {
        console.info("Dev mode — would have pushed:", payload);
        stampSubmit();
        showMessage("✓ Registered! (Firebase config not set up yet)", "success");
        form.reset();
      }
    } catch (err) {
      console.error("Registration error:", err);
      showMessage("✗ Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
}