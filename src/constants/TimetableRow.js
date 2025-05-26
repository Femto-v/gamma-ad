// JS Version
export default class TimetableRow {
    constructor(masa, waktu, slots = ["", "", "", "", "", "", ""]) {
        this.masa = masa;
        this.waktu = waktu;
        this.slots = slots;
    }
}
