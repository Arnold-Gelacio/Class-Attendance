# Section Attendance System — Step-by-Step Guide

## What you got

```
attendance-system/
  index.html        <- the app itself (Schedule / Scan / Dashboard tabs)
  generate-qr.html   <- run this ONCE to make/print each student's QR code
  students.js         <- your class roster (edit this to add students)
  app.js               <- all the logic, heavily commented
  style.css             <- appearance
```

No installation, no server, no database account needed. It runs by opening
the HTML files in a browser. Data is saved in the browser's built-in
`localStorage`, which is why **you should always use the same
device/browser** as the admin scanning station.

---

## Step 1 — Finish the roster

Open `students.js` in any text editor (Notepad, VS Code, even the
Chromebook text editor works). You'll see entries like:

```js
{ id: "SEC-M01", lastName: "Adornado", firstName: "Vincent", middleName: "Centeno", nameExt: "", gender: "M" },
```

- I entered the 25 students visible in your photo. A couple of Middle Name
  fields were cut off in the image (marked `??`) — fix those.
- Copy-paste that line format to add the rest, up to your 50–60. `id` just
  needs to be unique — keep the `SEC-M##` / `SEC-F##` pattern or make your
  own.

## Step 2 — Generate the QR codes

Double-click `generate-qr.html` to open it in a browser. It reads
`students.js` and draws one QR code per student (the QR only contains their
`id`, nothing personal). Click **Print this page**, cut them out, and give
one to each student (laminated card, ID badge, whatever's durable).

**How this file works, function by function:**
- It loads the `qrcodejs` library from a CDN (a script hosted online).
- It loops over `STUDENTS` (from `students.js`) with `.forEach()`.
- For each student, it creates a small `<div>` card and calls
  `new QRCode(qrHolder, { text: s.id, ... })` — this one line is what
  actually draws the QR code, encoding `s.id` as the payload.

## Step 3 — Run the attendance app

Double-click `index.html`. You'll see three tabs.

### Tab 1: Schedule
Every day, before class, type in the **start time** and how many minutes
of **grace period** you allow before a scan counts as "late" instead of
"present." Press **Save**. This is stored per calendar date, so it resets
automatically each day — no need to touch code.

### Tab 2: Scan QR
This turns on the device camera (phone, tablet, or laptop webcam) and
watches for QR codes. When a student's code is read:
1. It looks up the student by ID.
2. Compares the current time to (start time + grace period).
3. Saves them as `present` or `late`, with a timestamp.
4. If they already scanned today, it tells you instead of double-counting.

### Tab 3: Dashboard
Live counts of Present / Late / Absent, plus the full roster table. Absent
only becomes final once you press **Close today's attendance** on the
Schedule tab (at the end of the period) — before that, unscanned students
just show "NOT YET" since class isn't over yet. There's also an
**Export CSV** button to save the day's results as a spreadsheet file.

---

## Step 4 — Understanding the core functions (app.js)

These are the functions worth understanding one at a time — I'd recommend
opening `app.js` side-by-side while reading this:

| Function | What it does |
|---|---|
| `getTodayKey()` | Builds a string like `attendance_2026-08-17` so each day's data is stored separately. |
| `loadDay()` / `saveDay()` | Read/write that day's data to `localStorage`. This is your "database." |
| `saveSchedule()` | Grabs the time inputs and saves them for today. |
| `markAttendance(studentId)` | The core function — runs every time a QR code is scanned. Decides present vs. late vs. already-marked. |
| `closeAttendanceForToday()` | Runs once, at your command, to fill in "absent" for anyone with no record. |
| `startScanner()` / `onScanSuccess()` | Turns the camera on and calls `markAttendance()` whenever a code is decoded. Includes a 2-second "debounce" so one scan doesn't fire 20 times. |
| `renderDashboard()` | Reads today's data and redraws the counts + table. Never changes data — display only. |
| `exportCSV()` | Builds a text file in the format Excel/Google Sheets can open, and triggers a download. |

The pattern to notice: **data functions** (load/save/mark) never touch the
page directly, and **render functions** never change data — they only
read it and draw it. Keeping those two jobs separate is what makes the
code easy to debug as it grows.

---

## Step 5 — Using it for real (deployment options)

Right now it only works on one device, opened as local files. Two easy
next steps once you're comfortable with the code above:

1. **Same device, more convenient**: host the folder for free on
   [GitHub Pages](https://pages.github.com/) or
   [Netlify Drop](https://app.netlify.com/drop) — drag the folder in, get
   a link, open that link on your scanning device/phone instead of double
   clicking files. Camera access requires `https://`, which these give you
   for free (a plain `file://` page can be blocked from using the camera
   on some phones — if that happens to you, this step fixes it).
2. **Multiple devices / cloud backup**: swap `localStorage` for a real
   database (e.g. Firebase, which you've already used for the Whop site)
   so the admin dashboard updates live from any device. Happy to walk
   through that upgrade once the local version is working the way you
   want — it's the same `markAttendance()` logic, just saving to Firebase
   instead of `localStorage`.

---

## Troubleshooting

- **Camera doesn't turn on**: your browser needs permission — click
  "Allow" when prompted. On phones, this usually also requires `https://`
  (see deployment note above) rather than opening the file directly.
- **"Unknown QR code"**: the scanned code's payload doesn't match any `id`
  in `students.js` — check for typos or a duplicate ID.
- **Data disappeared**: `localStorage` is tied to one browser on one
  device. Clearing browser data/cache wipes it. Export CSV regularly as a
  backup until you move to a real database.
