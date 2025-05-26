import { TimetableRow } from "./TimetableRow";

export const days = [
    "Ahad",
    "Isnin",
    "Selasa",
    "Rabu",
    "Khamis",
    "Jumaat",
    "Sabtu",
];

export const timetable = [
    new TimetableRow(1, "07:00 - 07:50"),
    new TimetableRow(2, "08:00 - 08:50"),
    // ...and so on
    new TimetableRow(16, "22:00 - 22:50"),
];
