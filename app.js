/**
 * app.js
 * ------
 * This is the whole "brain" of the attendance system. It's split into
 * clearly labeled sections so you can learn one piece at a time:
 *
 *   1. STORAGE HELPERS   -> how we save/load data in the browser
 *   2. SCHEDULE LOGIC     -> admin sets today's class start time + grace period
 *   3. ATTENDANCE LOGIC    -> marking present/late/absent
 *   4. QR SCANNER          -> reading the camera feed
 *   5. RENDERING           -> drawing numbers/tables on screen
 *   6. EXPORT               -> saving today's attendance as a CSV file
 *   7. TAB NAVIGATION        -> switching between the 3 screens
 *
 * Nothing here needs a server. Everything is saved in the browser's
 * localStorage, which is a simple built-in key -> value database that
 * survives page refreshes (but only on THIS device/browser).
 */

/* ---------------------------------------------------------------
   1. STORAGE HELPERS
   localStorage can only store strings, so we JSON.stringify() before
   saving and JSON.parse() after loading. Every "day" of attendance is
   stored under its own key, e.g. "attendance_2026-08-17".
--------------------------------------------------------------- */

function getTodayKey() {
  // Produces "2026-08-17" style keys so each day is stored separately.
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `attendance_${yyyy}-${mm}-${dd}`;
}

function loadDay(dateKey) {
  const raw = localStorage.getItem(dateKey);
  if (!raw) {
    // First time this key is used today: create the empty shape.
    return { schedule: { startTime: "", graceMinutes: 15, closed: false }, records: {} };
  }
  return JSON.parse(raw);
}

function saveDay(dateKey, dayData) {
  localStorage.setItem(dateKey, JSON.stringify(dayData));
}

/* ---------------------------------------------------------------
   2. SCHEDULE LOGIC
   Each day has a different class start time. The admin types it in
   once at the start of class. "Grace minutes" is how many minutes
   late a student can arrive and still count as "present" instead of
   "late" — you control this per day too.
--------------------------------------------------------------- */

function initScheduleForm() {
  const today = loadDay(getTodayKey());
  document.getElementById("start-time").value = today.schedule.startTime || "";
  document.getElementById("grace-minutes").value = today.schedule.graceMinutes ?? 15;
  toggleClosedBanner(today.schedule.closed);
}

function saveSchedule() {
  const dateKey = getTodayKey();
  const today = loadDay(dateKey);
  today.schedule.startTime = document.getElementById("start-time").value;
  today.schedule.graceMinutes = Number(document.getElementById("grace-minutes").value) || 0;
  saveDay(dateKey, today);
  flashScheduleSaved();
}

/* ---------------------------------------------------------------
   3. ATTENDANCE LOGIC
   This is the heart of the system: what happens the instant a QR
   code is scanned.
--------------------------------------------------------------- */

function findStudent(id) {
  return STUDENTS.find((s) => s.id === id);
}

function markAttendance(studentId) {
  const dateKey = getTodayKey();
  const today = loadDay(dateKey);

  const student = findStudent(studentId);
  if (!student) {
    showScanFeedback(`Unknown QR code: "${studentId}"`, false);
    return;
  }

  if (today.records[studentId]) {
    // Already scanned today — don't overwrite their first scan time.
    const existing = today.records[studentId];
    showScanFeedback(`${student.firstName} ${student.lastName} already marked ${existing.status.toUpperCase()} at ${existing.time}`, false);
    return;
  }

  if (!today.schedule.startTime) {
    showScanFeedback("Set today's class start time first (Schedule tab).", false);
    return;
  }

  // Figure out PRESENT vs LATE by comparing "now" to start time + grace.
  const now = new Date();
  const [startH, startM] = today.schedule.startTime.split(":").map(Number);
  const cutoff = new Date();
  cutoff.setHours(startH, startM + Number(today.schedule.graceMinutes || 0), 0, 0);

  const status = now <= cutoff ? "present" : "late";
  const timeLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  today.records[studentId] = { time: timeLabel, status };
  saveDay(dateKey, today);

  showScanFeedback(`✔ ${student.firstName} ${student.lastName} — ${status.toUpperCase()} (${timeLabel})`, true);
  renderDashboard();
}

function closeAttendanceForToday() {
  // Call this at the end of the period: anyone with NO record yet is
  // absent. We only do this on a button press (not automatically),
  // because you decide when the class window is actually over.
  const dateKey = getTodayKey();
  const today = loadDay(dateKey);

  STUDENTS.forEach((s) => {
    if (!today.records[s.id]) {
      today.records[s.id] = { time: "--", status: "absent" };
    }
  });
  today.schedule.closed = true;
  saveDay(dateKey, today);
  toggleClosedBanner(true);
  renderDashboard();
}

/* ---------------------------------------------------------------
   4. QR SCANNER
   Uses the html5-qrcode library (loaded via CDN in index.html) to
   read the device camera and decode QR codes in real time.
--------------------------------------------------------------- */

let html5QrCode = null;

function startScanner() {
  if (html5QrCode) return; // already running
  html5QrCode = new Html5Qrcode("reader");

  html5QrCode
    .start(
      { facingMode: "environment" }, // back camera on phones/tablets
      { fps: 10, qrbox: 240 },
      onScanSuccess,
      () => {} // ignore per-frame "no QR found" errors — they're normal
    )
    .catch((err) => {
      showScanFeedback("Camera error: " + err, false);
    });
}

function stopScanner() {
  if (!html5QrCode) return;
  html5QrCode.stop().then(() => {
    html5QrCode.clear();
    html5QrCode = null;
  });
}

let lastScanTime = 0;
function onScanSuccess(decodedText) {
  // Debounce: the camera reads ~10 frames/sec, so without this the
  // same QR code would fire markAttendance() dozens of times in a row.
  const now = Date.now();
  if (now - lastScanTime < 2000) return;
  lastScanTime = now;

  markAttendance(decodedText.trim());
}

/* ---------------------------------------------------------------
   5. RENDERING
   Pure "read data, update the page" functions. None of these change
   any data — they only display it.
--------------------------------------------------------------- */

function showScanFeedback(message, ok) {
  const el = document.getElementById("scan-feedback");
  el.textContent = message;
  el.className = ok ? "ok" : "warn";
}

function toggleClosedBanner(closed) {
  document.getElementById("closed-banner").style.display = closed ? "block" : "none";
}

function flashScheduleSaved() {
  const el = document.getElementById("schedule-saved");
  el.textContent = "Saved ✔";
  setTimeout(() => (el.textContent = ""), 1500);
}

function renderDashboard() {
  const today = loadDay(getTodayKey());
  let present = 0, late = 0, absent = 0, unmarked = 0;

  const rows = STUDENTS.map((s) => {
    const rec = today.records[s.id];
    if (!rec) {
      unmarked++;
      return { s, status: today.schedule.closed ? "absent" : "—", time: "--" };
    }
    if (rec.status === "present") present++;
    else if (rec.status === "late") late++;
    else if (rec.status === "absent") absent++;
    return { s, status: rec.status, time: rec.time };
  });

  document.getElementById("stat-present").textContent = present;
  document.getElementById("stat-late").textContent = late;
  document.getElementById("stat-absent").textContent = today.schedule.closed ? absent : absent; // absent only finalized after "close"

  const tbody = document.getElementById("roster-body");
  tbody.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${r.s.lastName}, ${r.s.firstName} ${r.s.nameExt || ""}</td>
        <td>${r.s.id}</td>
        <td>${r.time}</td>
        <td>${badge(r.status)}</td>
      </tr>`
    )
    .join("");
}

function badge(status) {
  if (status === "present") return `<span class="badge present">PRESENT</span>`;
  if (status === "late") return `<span class="badge late">LATE</span>`;
  if (status === "absent") return `<span class="badge absent">ABSENT</span>`;
  return `<span class="badge">NOT YET</span>`;
}

/* ---------------------------------------------------------------
   6. EXPORT
   Builds a CSV (comma-separated values) file in memory and triggers
   a browser download — no server involved.
--------------------------------------------------------------- */

function exportCSV() {
  const dateKey = getTodayKey();
  const today = loadDay(dateKey);

  let csv = "Student ID,Last Name,First Name,Time,Status\n";
  STUDENTS.forEach((s) => {
    const rec = today.records[s.id] || { time: "--", status: today.schedule.closed ? "absent" : "not-yet" };
    csv += `${s.id},${s.lastName},${s.firstName},${rec.time},${rec.status}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dateKey}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------
   7. TAB NAVIGATION
--------------------------------------------------------------- */

function showTab(tabId) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  document.querySelector(`nav.tabs button[data-tab="${tabId}"]`).classList.add("active");

  if (tabId === "scan-view") startScanner();
  else stopScanner();

  if (tabId === "dashboard-view") renderDashboard();
}

/* ---------------------------------------------------------------
   INIT — runs once the page loads
--------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("today-label").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  initScheduleForm();
  renderDashboard();

  document.getElementById("save-schedule-btn").addEventListener("click", saveSchedule);
  document.getElementById("close-attendance-btn").addEventListener("click", () => {
    if (confirm("Mark everyone who hasn't scanned yet as ABSENT? This is usually done at the end of the period.")) {
      closeAttendanceForToday();
    }
  });
  document.getElementById("export-btn").addEventListener("click", exportCSV);

  document.querySelectorAll("nav.tabs button").forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
  });
});
