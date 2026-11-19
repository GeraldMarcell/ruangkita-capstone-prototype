// Data RuangKita untuk prototype Q3.03.
// - rooms: nama & kapasitas ruang DSI (dari tim).
// - schedule: jadwal kuliah Semester Gasal 2026/2027 (Jadwal_Gasal_DSI_2026-2027.xlsx, V.2.7).
// - bookings: DATA CONTOH (fiktif) pengajuan penggunaan ruang untuk menguji status persetujuan.
(() => {
  window.RuangKita = window.RuangKita || {};
  window.RuangKita.rooms = [
  {
    "id": "1101-1102",
    "code": "1101-1102",
    "name": "Ruang 1101–1102",
    "capacity": 70
  },
  {
    "id": "2104",
    "code": "2104",
    "name": "Ruang 2104",
    "capacity": 30
  },
  {
    "id": "2208",
    "code": "2208",
    "name": "Ruang 2208",
    "capacity": 50
  },
  {
    "id": "2209",
    "code": "2209",
    "name": "Ruang 2209",
    "capacity": 50
  },
  {
    "id": "2102",
    "code": "2102",
    "name": "Ruang 2102",
    "capacity": 30
  },
  {
    "id": "2103",
    "code": "2103",
    "name": "Ruang 2103",
    "capacity": 30
  },
  {
    "id": "4101",
    "code": "4101",
    "name": "Ruang 4101",
    "capacity": 50
  },
  {
    "id": "4102",
    "code": "4102",
    "name": "Ruang 4102",
    "capacity": 50
  },
  {
    "id": "4201",
    "code": "4201",
    "name": "Ruang 4201",
    "capacity": 50
  },
  {
    "id": "4202",
    "code": "4202",
    "name": "Ruang 4202",
    "capacity": 50
  },
  {
    "id": "st-apter-1305",
    "code": "St. Apter 1305",
    "name": "St. Apter 1305",
    "capacity": 50
  },
  {
    "id": "st-prog-1302",
    "code": "St. Prog 1302",
    "name": "St. Prog 1302",
    "capacity": 50
  }
];
  window.RuangKita.schedule = {
 "1101-1102": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "Caps [A] P1",
   "info": "Sem 7, 4 SKS",
   "lect": "AH",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "TBD [ID]",
   "info": "Sem 3, 3 SKS",
   "lect": "RZ",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "EB [ID]",
   "info": "Sem 1, 4 SKS",
   "lect": "AO",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "16.00",
   "end": "18.30",
   "course": "EB [ID]",
   "info": "Sem 1, 4 SKS",
   "lect": "AO",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "DT [D]",
   "info": "Sem 1, 3 SKS",
   "lect": "DM",
   "note": "DT"
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "LSD [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "RK",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "PraTA [B]",
   "info": "Sem 7, 2 SKS",
   "lect": "TD",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "16.00",
   "end": "18.30",
   "course": "PAI [A] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "IZ",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "PAI [D] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "BC",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "DT [B]",
   "info": "Sem 1, 3 SKS",
   "lect": "DM",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "MEOTI [C]",
   "info": "Sem 5, 3 SKS",
   "lect": "BS",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "ITI1 [B]",
   "info": "Sem 1, 3 SKS",
   "lect": "NF",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "ASD [D] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "RK",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "MPT [D]",
   "info": "Sem 3, 3 SKS",
   "lect": "TE",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "13.30",
   "end": "16.00",
   "course": "PTEIC [L]",
   "info": "Sem 1, 2 SKS",
   "lect": "FM",
   "note": "13.20 - 15.00"
  }
 ],
 "2104": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "ASD [IUP] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "RK",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "T-SE [A]",
   "info": "Sem 2, 3 SKS",
   "lect": "ES",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "TKATI [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "AN",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "T-Graph [A]",
   "info": "Sem 3, 3 SKS",
   "lect": "NA",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "T-Egov [A]",
   "info": "Sem 3, 3 SKS",
   "lect": "TD",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "PSTI [IUP] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "AN",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "T-RDIB [A]",
   "info": "Sem 2, 3 SKS",
   "lect": "WA",
   "note": "AM"
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "PAI [IUP] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "IZ",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "DT [IUP]",
   "info": "Sem 1, 3 SKS",
   "lect": "YG",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "16.00",
   "end": "18.30",
   "course": "MEOTI [IUP]",
   "info": "Sem 5, 3 SKS",
   "lect": "YG",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "TKKTI [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "BS",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "RO [IUP]",
   "info": "Sem 3, 3 SKS",
   "lect": "RT",
   "note": ""
  }
 ],
 "2208": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "PSTI [C] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "YG",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "PraTA [A]",
   "info": "Sem 7, 2 SKS",
   "lect": "RM",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "DT [C]",
   "info": "Sem 1, 3 SKS",
   "lect": "DT",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "16.00",
   "end": "18.30",
   "course": "CRM [ID]",
   "info": "Sem 5, 3 SKS",
   "lect": "AP",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "ASD [A] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "AT",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "Pemdig [ID]",
   "info": "Sem 5, 3 SKS",
   "lect": "RN",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "PPPL [D] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "RM",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "MLTI [C]",
   "info": "Sem 5, 3 SKS",
   "lect": "TE",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "ITI1 [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "NF",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "ITI1 [D]",
   "info": "Sem 1, 3 SKS",
   "lect": "FS",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "DT [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "DM",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "PAI [A] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "IZ",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "MPT [C]",
   "info": "Sem 3, 3 SKS",
   "lect": "AP",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "09.30",
   "end": "11.30",
   "course": "PTEIC [M]",
   "info": "Sem 1, 2 SKS",
   "lect": "IH",
   "note": "09.40 - 11.20"
  },
  {
   "day": "Jumat",
   "start": "13.30",
   "end": "16.00",
   "course": "PTEIC [N]",
   "info": "Sem 1, 2 SKS",
   "lect": "IH",
   "note": "13.20 - 15.00"
  }
 ],
 "2209": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "PAI [B] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "NF",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "PEB [A]",
   "info": "Sem 1, 2 SKS",
   "lect": "MJ",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "SE [C] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "MW",
   "note": "AP"
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "PPD [ID]",
   "info": "Sem 3, 3 SKS",
   "lect": "AH",
   "note": "TE"
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "ITI1 [IUP]",
   "info": "Sem 1, 3 SKS",
   "lect": "FS",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "ITI1 [C]",
   "info": "Sem 1, 3 SKS",
   "lect": "FS",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "16.00",
   "end": "18.30",
   "course": "PPPL [B] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "FJ",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "POK [ID] P1",
   "info": "Sem 7, 4 SKS",
   "lect": "AH",
   "note": "AN"
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "E-Commerce [ID]",
   "info": "Sem 5, 3 SKS",
   "lect": "RN",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "PSTI [D] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "AN",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "16.00",
   "end": "18.30",
   "course": "ASD [B] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "AT",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "PEB [C]",
   "info": "Sem 1, 2 SKS",
   "lect": "MJ",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "MEOTI [B]",
   "info": "Sem 5, 3 SKS",
   "lect": "BS",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "PPPL [B] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "FJ",
   "note": ""
  }
 ],
 "2103": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "Filsafat [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "ES",
   "note": "Week 1-5"
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "KI [ID] P1",
   "info": "Sem 7, 4 SKS",
   "lect": "Week 1-8",
   "note": "IZ"
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "OFB [IUP]",
   "info": "Sem 1, 3 SKS",
   "lect": "AW",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "MetPenSI [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "TD",
   "note": "AM"
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "ABD [IUP]",
   "info": "Sem 3, 3 SKS",
   "lect": "IH",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "MetPen [A]",
   "info": "Sem 2, 3 SKS",
   "lect": "WA",
   "note": "BS"
  },
  {
   "day": "Selasa",
   "start": "16.00",
   "end": "18.30",
   "course": "PSO [A] P1",
   "info": "Sem 6, 4 SKS",
   "lect": "DM",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "Cognitif [A]",
   "info": "Sem 6, 3 SKS",
   "lect": "VR",
   "note": "RK"
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "SC [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "AU",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "T-Cogn [A]",
   "info": "Sem 3, 3 SKS",
   "lect": "VR",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "STAT [R] P2",
   "info": "Sem 2, 4 SKS",
   "lect": "WA",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "PEB [IUP]",
   "info": "Sem 1, 2 SKS",
   "lect": "RN",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "PSO [A] P2",
   "info": "Sem 6, 4 SKS",
   "lect": "DM",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "16.00",
   "end": "18.30",
   "course": "MHP [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "MJ",
   "note": "Week 1 - 8"
  },
  {
   "day": "Jumat",
   "start": "13.30",
   "end": "16.00",
   "course": "PAI [IUP] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "IZ",
   "note": ""
  }
 ],
 "4101": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "OFB [D]",
   "info": "Sem 1, 3 SKS",
   "lect": "AW",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "PSTI [B] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "TD",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "PEB [D]",
   "info": "Sem 1, 2 SKS",
   "lect": "RN",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "ADD [C]",
   "info": "Sem 3, 3 SKS",
   "lect": "ED",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "PPPL [C] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "FJ",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "ABD [C]",
   "info": "Sem 3, 3 SKS",
   "lect": "RZ",
   "note": "RH"
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "PPPL [A] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "FJ",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "RO [B]",
   "info": "Sem 3, 3 SKS",
   "lect": "ED",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "MLTI [B]",
   "info": "Sem 5, 3 SKS",
   "lect": "HM",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "Etika [B]",
   "info": "Sem 4, 2 SKS",
   "lect": "NA",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "KS [ID]",
   "info": "Sem 1, 3 SKS",
   "lect": "AH",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "ASD [A] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "AT",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "07.00",
   "end": "09.30",
   "course": "PAI [D] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "BC",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "13.30",
   "end": "16.00",
   "course": "PPPL [D] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "RM",
   "note": ""
  }
 ],
 "4102": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "PD [ID]",
   "info": "Sem 1, 3 SKS",
   "lect": "RZ",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "Tekber [ID]",
   "info": "Sem 5, 3 SKS",
   "lect": "FM",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "PPPL [A] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "FJ",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "OFB [C]",
   "info": "Sem 1, 3 SKS",
   "lect": "AW",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "DT [ID]",
   "info": "Sem 1, 3 SKS",
   "lect": "AH",
   "note": "AN"
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "ADD [A]",
   "info": "Sem 3, 3 SKS",
   "lect": "VR",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "RO [C]",
   "info": "Sem 3, 3 SKS",
   "lect": "ED",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "SE [C] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "MW",
   "note": "AP"
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "PEB [B]",
   "info": "Sem 1, 2 SKS",
   "lect": "MJ",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "PSTI [A] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "HM",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "MPT [B]",
   "info": "Sem 3, 3 SKS",
   "lect": "FA",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "OFB [B]",
   "info": "Sem 1, 3 SKS",
   "lect": "MJ",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "07.00",
   "end": "09.30",
   "course": "RO [A]",
   "info": "Sem 3, 3 SKS",
   "lect": "ED",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "13.30",
   "end": "16.00",
   "course": "ASD [B] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "AT",
   "note": ""
  }
 ],
 "4201": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "SE [D] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "AP",
   "note": "DT"
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "PAI [C] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "NF",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "ADD [B]",
   "info": "Sem 3, 3 SKS",
   "lect": "VR",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "SDI [ID]",
   "info": "Sem 5, 3 SKS",
   "lect": "SH",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "LSD [D]",
   "info": "Sem 1, 3 SKS",
   "lect": "AU",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "ADD [D]",
   "info": "Sem 3, 3 SKS",
   "lect": "RT",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "Etika [A]",
   "info": "Sem 4, 2 SKS",
   "lect": "NA",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "MLTI [A]",
   "info": "Sem 5, 3 SKS",
   "lect": "HM",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "SE [D] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "AP",
   "note": "DT"
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "MPT [A]",
   "info": "Sem 3, 3 SKS",
   "lect": "FA",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "PSTI [C] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "YG",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "SE [B] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "MW",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "07.00",
   "end": "09.30",
   "course": "POK [ID] P2",
   "info": "Sem 7, 4 SKS",
   "lect": "AH",
   "note": "AN"
  },
  {
   "day": "Jumat",
   "start": "13.30",
   "end": "16.00",
   "course": "PSTI [B] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "TD",
   "note": ""
  }
 ],
 "4202": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "SE [A] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "MW",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "PSTI [D] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "AN",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "ASD [D] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "RK",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "SE [B] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "MW",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "MEOTI [A]",
   "info": "Sem 5, 3 SKS",
   "lect": "BS",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "Tekber [C]",
   "info": "Sem 5, 3 SKS",
   "lect": "IZ",
   "note": "DT"
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "MHP [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "AP",
   "note": "Week 9 - 16"
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "AP [ID]",
   "info": "Sem 3, 3 SKS",
   "lect": "FA",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "KDT [ID] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "DM",
   "note": "AH"
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "PN [ID]",
   "info": "Sem 3, 3 SKS",
   "lect": "SH",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "MLTI [D]",
   "info": "Sem 5, 3 SKS",
   "lect": "TE",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "Tekber [A]",
   "info": "Sem 5, 3 SKS",
   "lect": "IZ",
   "note": "DT"
  },
  {
   "day": "Jumat",
   "start": "07.00",
   "end": "09.30",
   "course": "PAI [B] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "NF",
   "note": ""
  },
  {
   "day": "Jumat",
   "start": "13.30",
   "end": "16.00",
   "course": "PAI [C] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "NF",
   "note": ""
  }
 ],
 "st-apter-1305": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "PSTI [A] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "HM",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "ASD [C] P1",
   "info": "Sem 3, 4 SKS",
   "lect": "AM",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "MEOTI [D]",
   "info": "Sem 5, 3 SKS",
   "lect": "YG",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "16.00",
   "end": "18.30",
   "course": "KI [ID] P1",
   "info": "Sem 7, 4 SKS",
   "lect": "Week 9-16",
   "note": "RZ"
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "ABD [D]",
   "info": "Sem 3, 3 SKS",
   "lect": "RZ",
   "note": "RH"
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "Tekber [D]",
   "info": "Sem 5, 3 SKS",
   "lect": "FM",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "Ventura [ID]",
   "info": "Sem 5, 3 SKS",
   "lect": "AO",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "PPPL [IUP] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "RM",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "LSD [C]",
   "info": "Sem 1, 3 SKS",
   "lect": "AM",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "SE [A] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "MW",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "MPO [ID]",
   "info": "Sem 7, 3 SKS",
   "lect": "YG",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "ASD [C] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "AM",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "PSTI [IUP] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "AN",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "16.00",
   "end": "18.30",
   "course": "PPPL [C] P2",
   "info": "Sem 5, 4 SKS",
   "lect": "FJ",
   "note": ""
  }
 ],
 "st-prog-1302": [
  {
   "day": "Senin",
   "start": "07.30",
   "end": "10.00",
   "course": "LSD [B]",
   "info": "Sem 1, 3 SKS",
   "lect": "AM",
   "note": ""
  },
  {
   "day": "Senin",
   "start": "10.15",
   "end": "12.45",
   "course": "RO [D]",
   "info": "Sem 3, 3 SKS",
   "lect": "WA",
   "note": "AD"
  },
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "MSTI [ID] P1",
   "info": "Sem 7, 4 SKS",
   "lect": "SH",
   "note": "TE"
  },
  {
   "day": "Senin",
   "start": "16.00",
   "end": "18.30",
   "course": "IPO [A]",
   "info": "Sem 2, 3 SKS",
   "lect": "ES",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "PBA [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "RM-AT",
   "note": "Week 1-8"
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "Tekber [B]",
   "info": "Sem 5, 3 SKS",
   "lect": "IZ",
   "note": "DT"
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "OFB [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "MJ",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "ABD [B]",
   "info": "Sem 3, 3 SKS",
   "lect": "IH",
   "note": "RH"
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "ABD [A]",
   "info": "Sem 3, 3 SKS",
   "lect": "IH",
   "note": "RH"
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "KI [ID] P2",
   "info": "Sem 7, 4 SKS",
   "lect": "IZ",
   "note": "RZ"
  },
  {
   "day": "Rabu",
   "start": "16.00",
   "end": "18.30",
   "course": "MSTI [ID] P2",
   "info": "Sem 7, 4 SKS",
   "lect": "SH",
   "note": "TE"
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "SE [IUP] P2",
   "info": "Sem 3, 4 SKS",
   "lect": "AP",
   "note": "DT"
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "IB [ID]",
   "info": "Sem 5, 3 SKS",
   "lect": "VR",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "MB [ID]",
   "info": "Sem 3, 3 SKS",
   "lect": "AO",
   "note": ""
  }
 ],
 "2102": [
  {
   "day": "Senin",
   "start": "13.30",
   "end": "16.00",
   "course": "PPPL [IUP] P1",
   "info": "Sem 5, 4 SKS",
   "lect": "RM",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "07.30",
   "end": "10.00",
   "course": "LSD [IUP]",
   "info": "Sem 1, 3 SKS",
   "lect": "AU",
   "note": ""
  },
  {
   "day": "Selasa",
   "start": "10.15",
   "end": "12.45",
   "course": "PPS [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "AT",
   "note": "RM"
  },
  {
   "day": "Selasa",
   "start": "13.30",
   "end": "16.00",
   "course": "MPT [IUP]",
   "info": "Sem 3, 3 SKS",
   "lect": "TE",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "07.30",
   "end": "10.00",
   "course": "ITI2 [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "FS",
   "note": ""
  },
  {
   "day": "Rabu",
   "start": "10.15",
   "end": "12.45",
   "course": "MDIK [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "AD",
   "note": "NA"
  },
  {
   "day": "Rabu",
   "start": "13.30",
   "end": "16.00",
   "course": "MTL [A]",
   "info": "Sem 1, 3 SKS",
   "lect": "NA",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "07.30",
   "end": "10.00",
   "course": "PAP2 [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "RT",
   "note": ""
  },
  {
   "day": "Kamis",
   "start": "10.15",
   "end": "12.45",
   "course": "PBA [A]",
   "info": "Sem 7, 3 SKS",
   "lect": "RM-AT",
   "note": "Week 9-16"
  },
  {
   "day": "Kamis",
   "start": "13.30",
   "end": "16.00",
   "course": "ADD [IUP]",
   "info": "Sem 3, 3 SKS",
   "lect": "RT",
   "note": ""
  }
 ]
};
  window.RuangKita.bookings = [
 {
  "room": "2104",
  "day": "Senin",
  "start": "16.00",
  "end": "18.00",
  "activity": "Rapat himpunan mahasiswa",
  "status": "approved"
 },
 {
  "room": "4102",
  "day": "Senin",
  "start": "16.00",
  "end": "17.30",
  "activity": "Pelatihan internal UKM",
  "status": "pending"
 },
 {
  "room": "2208",
  "day": "Selasa",
  "start": "16.00",
  "end": "18.00",
  "activity": "Kegiatan UKM",
  "status": "approved"
 },
 {
  "room": "4201",
  "day": "Selasa",
  "start": "16.30",
  "end": "18.00",
  "activity": "Rapat panitia acara",
  "status": "pending"
 },
 {
  "room": "1101-1102",
  "day": "Rabu",
  "start": "16.00",
  "end": "18.30",
  "activity": "Latihan kegiatan UKM",
  "status": "approved"
 },
 {
  "room": "2208",
  "day": "Rabu",
  "start": "16.00",
  "end": "17.30",
  "activity": "Rapat panitia acara",
  "status": "pending"
 },
 {
  "room": "4101",
  "day": "Rabu",
  "start": "16.00",
  "end": "18.00",
  "activity": "Rapat himpunan mahasiswa",
  "status": "approved"
 },
 {
  "room": "2104",
  "day": "Kamis",
  "start": "13.30",
  "end": "15.00",
  "activity": "Diskusi kelompok",
  "status": "approved"
 },
 {
  "room": "4202",
  "day": "Kamis",
  "start": "16.00",
  "end": "18.00",
  "activity": "Rapat panitia acara",
  "status": "pending"
 },
 {
  "room": "4101",
  "day": "Jumat",
  "start": "09.30",
  "end": "11.30",
  "activity": "Pelatihan internal UKM",
  "status": "pending"
 },
 {
  "room": "2209",
  "day": "Jumat",
  "start": "13.30",
  "end": "15.30",
  "activity": "Rapat himpunan mahasiswa",
  "status": "approved"
 }
];
  window.RuangKita.days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  window.RuangKita.dataUpdated = 'Senin, 16 November 2026 · 10.20';
})();
