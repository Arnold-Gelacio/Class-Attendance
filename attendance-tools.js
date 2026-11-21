(function (root, factory) {
  const tools = factory();
  if (typeof module === "object" && module.exports) module.exports = tools;
  if (root) root.AttendanceTools = tools;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  }

  function formatListHtml(items, cap = items.length) {
    if (!items.length) return "";
    const safeCap = Math.max(0, cap);
    const shown = items.slice(0, safeCap);
    const list = `<ul class="chat-list">${shown.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    const remaining = items.length - shown.length;
    return list + (remaining > 0 ? ` … and ${remaining} more` : "");
  }

  function isAttendanceListQuestion(question) {
    const text = question.trim().toLowerCase();
    return (
      /^(who|list|show|which|give me)\b/.test(text) ||
      /\b(students?|class)\b.*\b(present|absent|late|checked in)\b/.test(text)
    );
  }

  function filterAttendanceRows(rows, statusWanted) {
    if (statusWanted === "Present") return rows.filter((row) => row.status !== "Absent");
    if (statusWanted) return rows.filter((row) => row.status === statusWanted);
    return rows;
  }

  function evaluateManualAttendance(sectionCode, attendanceDate, sections, graceMinutes) {
    if (!(attendanceDate instanceof Date) || Number.isNaN(attendanceDate.getTime())) {
      return { ok: false, reason: "invalid-date" };
    }
    const section = sections[sectionCode];
    const session = section && section.schedule.find((item) => item.day === attendanceDate.getDay());
    if (!session) return { ok: false, reason: "nosession" };

    const [startHour, startMinute] = session.start.split(":").map(Number);
    const [endHour, endMinute] = session.end.split(":").map(Number);
    const start = new Date(attendanceDate);
    start.setHours(startHour, startMinute, 0, 0);
    const end = new Date(attendanceDate);
    end.setHours(endHour, endMinute, 0, 0);
    if (attendanceDate < start || attendanceDate > end) {
      return { ok: false, reason: "outside-session" };
    }

    const graceEnd = new Date(start.getTime() + graceMinutes * 60000);
    return {
      ok: true,
      status: attendanceDate <= graceEnd ? "On Time" : "Late",
      startLabel: session.start,
      endLabel: session.end,
    };
  }

  return {
    evaluateManualAttendance,
    filterAttendanceRows,
    formatListHtml,
    isAttendanceListQuestion,
  };
});
