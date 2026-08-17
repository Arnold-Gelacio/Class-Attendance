/**
 * students.js
 * -----------
 * This file holds ONLY your class roster. Keeping it separate from app.js
 * means you (or anyone helping you) can update the student list without
 * touching any of the logic code.
 *
 * Each student is an object with:
 *   id        -> a unique code. This is what gets encoded INTO the QR code.
 *                Never use a plain number alone (easy to guess/fake) — we
 *                prefix it with the section so it's unique across sections
 *                if you ever reuse this for another class.
 *   lastName, firstName, middleName, nameExt -> for display & printing
 *   gender    -> "M" or "F" (matches how your master list is grouped)
 *
 * ⚠️ IMPORTANT: A few rows in your uploaded photo were cut off at the right
 * edge of the table (the Middle Name column), so I've marked those with
 * "??" — please fix them before printing QR codes. I only entered the 25
 * students visible in the photo; add the rest below following the same
 * pattern to reach your 50–60 total.
 */

const STUDENTS = [
  // ---------- MALE ----------
  { id: "SEC-M01", lastName: "Adornado",  firstName: "Vincent",           middleName: "Centeno",  nameExt: "", gender: "M" },
  { id: "SEC-M02", lastName: "Arroyo",    firstName: "John Paul",         middleName: "Corpuz",   nameExt: "", gender: "M" },
  { id: "SEC-M03", lastName: "Bermejo",   firstName: "Ar Jhay None",      middleName: "Ullero",   nameExt: "", gender: "M" },
  { id: "SEC-M04", lastName: "Camero",    firstName: "Florentino",        middleName: "Castro",   nameExt: "Jr.", gender: "M" },
  { id: "SEC-M05", lastName: "Carillo",   firstName: "Ronald Jay",        middleName: "Maña",    nameExt: "", gender: "M" },
  { id: "SEC-M06", lastName: "Cruz",      firstName: "Samuel James",      middleName: "D.",  nameExt: "", gender: "M" },
  { id: "SEC-M07", lastName: "Doctor",    firstName: "Dexter",            middleName: "Lirio",    nameExt: "", gender: "M" },
  { id: "SEC-M08", lastName: "Estrella",  firstName: "Rowan Christopher", middleName: "San Pedro", nameExt: "", gender: "M" },
  { id: "SEC-M09", lastName: "Gelacio",   firstName: "Arnold",            middleName: "Elopre",   nameExt: "Jr.", gender: "M" },
  { id: "SEC-M10", lastName: "Longcop",   firstName: "Saviour Baron",     middleName: "Balagtas", nameExt: "", gender: "M" },
  { id: "SEC-M11", lastName: "Macabale",  firstName: "John Lloyd",        middleName: "Tiangco",  nameExt: "", gender: "M" },
  { id: "SEC-M12", lastName: "Matol",     firstName: "Sean",              middleName: "Berto",    nameExt: "", gender: "M" },
  { id: "SEC-M13", lastName: "Mendoza",   firstName: "Marc Neil",         middleName: "Pinto",    nameExt: "", gender: "M" },
  { id: "SEC-M14", lastName: "Molo",      firstName: "Mhart Yuri",        middleName: "Tongol",   nameExt: "", gender: "M" },
  { id: "SEC-M15", lastName: "Ortega",    firstName: "Jemvey",            middleName: "Ogues",    nameExt: "", gender: "M" },
  { id: "SEC-M16", lastName: "Panes",     firstName: "Angelo",            middleName: "Perez",    nameExt: "", gender: "M" },
  { id: "SEC-M17", lastName: "Peralta",   firstName: "Roosevelt",         middleName: "Delacruz", nameExt: "Jr.", gender: "M" },
  { id: "SEC-M18", lastName: "Razon",     firstName: "Anthony",           middleName: "James",    nameExt: "", gender: "M" },

  // ---------- FEMALE ----------
  { id: "SEC-F01", lastName: "Caranglan", firstName: "Czhar Colleen",     middleName: "Morales",  nameExt: "", gender: "F" },
  { id: "SEC-F02", lastName: "Cepeda",    firstName: "Maria Christina",   middleName: "Cuano",    nameExt: "", gender: "F" },
  { id: "SEC-F03", lastName: "Deloyas",   firstName: "Claire Madison",    middleName: "Bernardo", nameExt: "", gender: "F" },
  { id: "SEC-F04", lastName: "Lagatuz",   firstName: "Jhinlie",           middleName: "Saenz",    nameExt: "", gender: "F" },
  { id: "SEC-F05", lastName: "Padit",     firstName: "Larrah Hillary",    middleName: "Menor",    nameExt: "", gender: "F" },
  { id: "SEC-F06", lastName: "Restar",    firstName: "Ma Sydney Grace",   middleName: "Pateño",   nameExt: "", gender: "F" },
  { id: "SEC-F07", lastName: "Valbuena",  firstName: "Kessie",            middleName: "Angela",   nameExt: "", gender: "F" },

  // 👉 Add the rest of your 50–60 students here, same format.
  // Just copy a line above, change the id (e.g. SEC-F08, SEC-M19...), and fill in the name.
];
