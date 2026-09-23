import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download, Upload, Send, BookOpen, CheckCircle2,
  ChevronRight, Info, Utensils, FileText, Mail,
  ClipboardList, AlertCircle, X, Plus,
  TestTube2, FolderOpen,
  Circle, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatientInfo {
  name: string; date: string; weight: string; goal: string;
  medicalConditions: string; allergies: string; medications: string;
  preferredFoods: string; avoidedFoods: string; discomfortFoods: string;
  mainDifficulty: string; objectives: string;
}

interface MealEntry {
  label: string; time: string; food: string; quantity: string; quantityUnit: string; liquids: string;
  hungerBefore: string; fullnessAfter: string; why: string[];
}

type JournalDay = MealEntry[];

const WHY_REASONS = ["Foame", "Obicei", "Plictiseală", "Stres", "Emoții", "Social", "Poftă"];
const DEFAULT_MEAL_LABELS = ["Mic dejun", "Gustare dimineață", "Prânz", "Gustare după-amiază", "Cină"];
const QUANTITY_UNITS = ["g", "ml", "cană", "linguriță", "lingură", "bucată", "porție", "felie", "pumn"];

// Useful for the initial evaluation — deliberately excludes serum protein electrophoresis,
// zinc, and abdominal ultrasound per explicit instruction; those aren't baseline tests here.
const LAB_CATEGORIES = [
  {
    title: "Evaluare generală și metabolică",
    tests: [
      "Hemoleucogramă completă", "Glicemie à jeun", "Hemoglobină glicozilată – HbA1c",
      "Colesterol total", "LDL-colesterol", "HDL-colesterol", "Trigliceride",
      "TGO / AST", "TGP / ALT", "GGT", "Creatinină cu eGFR", "Acid uric",
    ],
  },
  {
    title: "Minerale și status nutrițional",
    tests: [
      "Calciu", "Magneziu", "Potasiu", "Clor", "Feritină", "Sideremie",
      "Vitamina B12", "Acid folic", "25-OH vitamina D",
    ],
  },
];

const EMPTY_MEAL = (label = ""): MealEntry => ({
  label, time: "", food: "", quantity: "", quantityUnit: "", liquids: "",
  hungerBefore: "", fullnessAfter: "", why: [],
});
const EMPTY_DAY = (): JournalDay => DEFAULT_MEAL_LABELS.map(EMPTY_MEAL);
const EMPTY_JOURNAL = (): JournalDay[] => Array.from({ length: 7 }, EMPTY_DAY);

const EMPTY_PATIENT: PatientInfo = {
  name: "", date: "", weight: "", goal: "", medicalConditions: "",
  allergies: "", medications: "", preferredFoods: "", avoidedFoods: "",
  discomfortFoods: "", mainDifficulty: "", objectives: "",
};

// Hand portion guide — a visual, memorable alternative to a scale/measuring cup.
// The color triplets are used both as jsPDF fill colors and as inline RGB styles on the web page.
const PORTION_GUIDE = [
  { hand: "Palmă", color: [92, 138, 103] as [number, number, number], group: "Proteine", examples: "carne, pește, tofu, ouă" },
  { hand: "Pumn", color: [70, 130, 180] as [number, number, number], group: "Legume", examples: "crude sau gătite" },
  { hand: "Căuș de mână", color: [200, 150, 60] as [number, number, number], group: "Carbohidrați", examples: "orez, cartofi, cereale, paste" },
  { hand: "Degetul mare", color: [230, 140, 60] as [number, number, number], group: "Grăsimi", examples: "ulei, unt, nuci, semințe" },
  { hand: "Vârful degetului", color: [200, 90, 90] as [number, number, number], group: "Adaosuri bogate caloric", examples: "dulceață, unt de arahide, sosuri" },
];

// Hunger/fullness scale (1-5) shown per meal in the journal — 3 is the sweet spot both
// ways (hungry-but-not-starving before, comfortably satisfied after), extremes at 1/5.
const HUNGER_SCALE = [
  { level: "1", color: [200, 90, 90] as [number, number, number], before: "Foame extremă, amețeală", after: "Încă flămândă" },
  { level: "2", color: [230, 140, 60] as [number, number, number], before: "Foarte flămândă", after: "Aproape sătulă" },
  { level: "3", color: [47, 93, 63] as [number, number, number], before: "Flămândă, gata de masă", after: "Confortabil sătulă (ideal)" },
  { level: "4", color: [230, 140, 60] as [number, number, number], before: "Puțin flămândă", after: "Sătulă, grea" },
  { level: "5", color: [200, 90, 90] as [number, number, number], before: "Neutră, deloc flămândă", after: "Prea plină" },
];

// ─── Unicode font loading (Inter + Playfair Display — matches the site's own
// type system, both verified to carry full Romanian diacritics: ă/â/î/ș/ț).
// jsPDF's built-in "helvetica" is WinAnsi-only and silently drops those,
// which also corrupts splitTextToSize's width math (text overflowing its box).
// Fonts are fetched from /public at generation time so they don't bloat the JS bundle.
let fontsLoaded = false;

async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Split out from registerFonts() so the network fetch can be warmed up ahead
// of time (on page mount), not only inside the click handler. Mobile Chrome
// revokes a click's "user activation" after an async gap of any real length
// (font fetch + multi-page render easily exceeds it on a slow connection),
// which silently blocks doc.save()'s programmatic download with no error --
// exactly the "I press download and nothing happens" report this fixed.
// Warming the cache ahead of time means the *first* real click's own async
// gap is just the (already-cached, synchronous) font lookup instead.
let fontsLoadPromise: Promise<void> | null = null;
function preloadFonts(): Promise<void> {
  if (fontsLoaded) return Promise.resolve();
  if (!fontsLoadPromise) {
    fontsLoadPromise = (async () => {
      // "Bold" style throughout is actually backed by the SemiBold (600)
      // weight, not true Bold (700) -- the whole document's spec calls for
      // Inter/Playfair Display Semibold wherever emphasis is needed, never
      // full Bold, so the 600-weight files are registered under jsPDF's
      // "bold" style key (jsPDF just needs a style label, not the real name).
      const [interRegRes, interSemiRes, playfairSemiRes] = await Promise.all([
        fetch("/fonts/Inter-Regular.ttf"),
        fetch("/fonts/Inter-SemiBold.ttf"),
        fetch("/fonts/PlayfairDisplay-SemiBold.ttf"),
      ]);
      if (!interRegRes.ok || !interSemiRes.ok || !playfairSemiRes.ok) {
        throw new Error(
          `Font fetch failed (Inter regular: ${interRegRes.status}, Inter semibold: ${interSemiRes.status}, Playfair semibold: ${playfairSemiRes.status})`
        );
      }
      const [interRegular, interSemiBold, playfairSemiBold] = await Promise.all([
        arrayBufferToBase64(await interRegRes.arrayBuffer()),
        arrayBufferToBase64(await interSemiRes.arrayBuffer()),
        arrayBufferToBase64(await playfairSemiRes.arrayBuffer()),
      ]);
      (window as any).__diet4lifeFontCache = { interRegular, interSemiBold, playfairSemiBold };
      fontsLoaded = true;
    })();
  }
  return fontsLoadPromise;
}

async function registerFonts(doc: jsPDF) {
  await preloadFonts();
  const { interRegular, interSemiBold, playfairSemiBold } = (window as any).__diet4lifeFontCache;
  doc.addFileToVFS("Inter-Regular.ttf", interRegular);
  doc.addFont("Inter-Regular.ttf", "Inter", "normal");
  doc.addFileToVFS("Inter-SemiBold.ttf", interSemiBold);
  doc.addFont("Inter-SemiBold.ttf", "Inter", "bold");
  doc.addFileToVFS("PlayfairDisplay-SemiBold.ttf", playfairSemiBold);
  doc.addFont("PlayfairDisplay-SemiBold.ttf", "PlayfairDisplay", "bold");
  doc.setFont("Inter", "normal");
}

// ─── Diet4Life palette (matches the approved site-wide hex direction) ────────
const COLOR_BG: [number, number, number] = [251, 246, 238]; // #FBF6EE
const COLOR_SURFACE: [number, number, number] = [253, 249, 242]; // #FDF9F2
const COLOR_TEXT: [number, number, number] = [31, 38, 34]; // #1F2622
const COLOR_TEXT_SECONDARY: [number, number, number] = [122, 101, 89]; // #7A6559
const COLOR_GREEN: [number, number, number] = [47, 93, 63]; // #2F5D3F
const COLOR_GREEN_TINT: [number, number, number] = [234, 239, 236]; // subtle green-tinted fill
const COLOR_RUBY: [number, number, number] = [156, 43, 62]; // #9C2B3E -- rare editorial accent only
const COLOR_BORDER: [number, number, number] = [213, 223, 217]; // subtle, warm-neutral table border
const COLOR_INSTR_BG: [number, number, number] = [243, 245, 241]; // #F3F5F1 -- instructions box only
const COLOR_RUBY_TINT: [number, number, number] = [251, 245, 246]; // extremely subtle ruby wash behind "De reținut"
const LINE_WIDTH_THIN = 0.15; // one consistent, very light border weight, used everywhere in the document
const COLOR_FORM_BORDER: [number, number, number] = [217, 221, 215]; // #D9DDD7 -- Date pacient table only

// ─── PDF Generator ─────────────────────────────────────────────────────────
async function generatePDF(patient: PatientInfo, journal: JournalDay[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await registerFonts(doc);
  const margin = 15;
  const pageW = 210;
  const pageH = 297;
  let y = margin;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > 275) { doc.addPage(); paintBackground(); y = margin; }
  };

  // Every page gets the cream page background (#FBF6EE) -- called once for
  // page 1 below, and again after every doc.addPage().
  const paintBackground = () => {
    doc.setFillColor(...COLOR_BG);
    doc.rect(0, 0, pageW, pageH, "F");
  };

  // One-line discreet footer, drawn on every page right after that page's
  // content is finished.
  const drawFooter = () => {
    doc.setFont("Inter", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_TEXT_SECONDARY);
    doc.text("Diet4Life Concept  •  contact@diet4lifeconcept.ro  •  0766 572 968", pageW / 2, 289, { align: "center" });
  };

  // ── Page 1: header ──────────────────────────────────────────────────────
  paintBackground();
  doc.setFont("Inter", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_GREEN);
  doc.text("Diet4Life Concept", margin, 16);
  doc.setFont("Inter", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  doc.text("contact@diet4lifeconcept.ro  ·  0766 572 968", pageW - margin, 16, { align: "right" });
  doc.setDrawColor(...COLOR_GREEN);
  doc.setLineWidth(0.3);
  doc.line(margin, 21, pageW - margin, 21);
  y = 32;

  // Title
  doc.setTextColor(...COLOR_TEXT);
  doc.setFont("PlayfairDisplay", "bold");
  doc.setFontSize(27);
  doc.text("Jurnal Alimentar – 7 Zile", margin, y);
  y += 7;
  doc.setFont("Inter", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  doc.text("Pregătire pentru consultație nutrițională", margin, y);
  y += 8;

  // Simple completion message (no more "photograph/scan/email it" wording)
  const introText = "Completează jurnalul timp de 7 zile consecutive și păstrează-l pentru consultația nutrițională.";
  doc.setFont("Inter", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  const introWrapped = doc.splitTextToSize(introText, pageW - 2 * margin);
  doc.text(introWrapped, margin, y);
  y += introWrapped.length * 4.3 + 3;

  // Instructions box — two short paragraphs (general instructions + a plain-
  // text hand/spoon reference, no separate table per the patient's request).
  // Height computed from wrapped line counts so text never overflows it.
  const instrText1 = "Notează toate mesele și gustările timp de 7 zile consecutive. Include orele, cantitățile aproximative, lichidele consumate și orice simptome sau observații relevante.";
  const instrText2 = "Cantitățile pot fi notate aproximativ, folosind repere simple: linguri pentru garnituri sau sosuri, palma pentru dimensiunea unei porții de carne sau pește, iar degetele pentru grosime.";
  doc.setFontSize(9);
  const instrWrapped1 = doc.splitTextToSize(instrText1, pageW - 2 * margin - 10);
  const instrWrapped2 = doc.splitTextToSize(instrText2, pageW - 2 * margin - 10);
  const instrLineH = 4.2;
  const instrParaGap = 4;
  const instrBoxHeight = 7 + instrWrapped1.length * instrLineH + instrParaGap + instrWrapped2.length * instrLineH;
  doc.setFillColor(...COLOR_INSTR_BG);
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(LINE_WIDTH_THIN);
  doc.roundedRect(margin, y, pageW - 2 * margin, instrBoxHeight, 1.5, 1.5, "FD");
  doc.setFont("Inter", "bold");
  doc.setTextColor(...COLOR_GREEN);
  doc.text("Instrucțiuni", margin + 5, y + 6);
  doc.setFont("Inter", "normal");
  doc.setTextColor(...COLOR_TEXT);
  doc.text(instrWrapped1, margin + 5, y + 10.5);
  doc.text(instrWrapped2, margin + 5, y + 10.5 + instrWrapped1.length * instrLineH + instrParaGap);
  y += instrBoxHeight + 7;

  // ── Date pacient ──────────────────────────────────────────────────────────
  doc.setFont("Inter", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...COLOR_TEXT);
  doc.text("Date pacient", margin, y);
  y += 3;

  // "Obiectivele mele" dropped — duplicated "Obiectiv principal". The field
  // itself (and the online form asking for it) is untouched; only this PDF
  // table row was removed, per the patient's request.
  // No underscore placeholders — the value column is a genuinely blank,
  // bordered writing space instead (see didParseCell/didDrawCell below).
  const fields = [
    ["Nume pacient", patient.name || ""],
    ["Data completării", patient.date || ""],
    ["Greutate actuală", patient.weight || ""],
    ["Obiectiv principal", patient.goal || ""],
    ["Afecțiuni medicale relevante", patient.medicalConditions || ""],
    ["Alergii / intoleranțe", patient.allergies || ""],
    ["Medicamente / suplimente", patient.medications || ""],
    ["Alimente preferate", patient.preferredFoods || ""],
    ["Alimente pe care nu le consum", patient.avoidedFoods || ""],
    ["Alimente care îmi provoacă disconfort", patient.discomfortFoods || ""],
    ["Cea mai mare dificultate alimentară", patient.mainDifficulty || ""],
  ];
  // Rows needing more room to write: Obiectiv principal (3), Alimente care
  // îmi provoacă disconfort (9), Cea mai mare dificultate alimentară (10).
  const tallFieldRows = [3, 9, 10];
  const weightRowIndex = 2;

  autoTable(doc, {
    startY: y,
    head: [],
    body: fields,
    theme: "grid",
    styles: { cellPadding: 2.5, valign: "middle", font: "Inter", textColor: COLOR_TEXT, lineColor: COLOR_FORM_BORDER, lineWidth: LINE_WIDTH_THIN },
    columnStyles: {
      0: { fontStyle: "bold", fontSize: 8.3, cellWidth: 68, fillColor: COLOR_GREEN_TINT },
      1: { fontSize: 8.75, cellWidth: pageW - 2 * margin - 68, fillColor: COLOR_SURFACE },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      if (data.section === "body") {
        data.cell.styles.minCellHeight = tallFieldRows.includes(data.row.index) ? 14 : 9;
      }
    },
    didDrawCell: (data) => {
      // A small, discreet "kg" label near the start of the writing space
      // (not stranded at the far right edge) — never baked into the cell
      // text, never a line.
      if (data.section === "body" && data.row.index === weightRowIndex && data.column.index === 1) {
        doc.setFont("Inter", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...COLOR_TEXT_SECONDARY);
        doc.text("kg", data.cell.x + 22, data.cell.y + data.cell.height / 2 + 1);
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // ── Scala foame – sațietate (1-5) ──────────────────────────────────────────
  // Moved here from its own near-empty page; more compact than before so it
  // fits page 1 alongside everything else. The hand-based portion guide that
  // used to precede it is gone from the PDF entirely (still lives on the
  // /consultatii page itself, untouched).
  doc.setFont("Inter", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...COLOR_TEXT);
  doc.text("Scala foame – sațietate (1–5)", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Nivel", "Foame înainte de masă", "Sațietate după masă"]],
    body: HUNGER_SCALE.map(h => [h.level, h.before, h.after]),
    theme: "grid",
    headStyles: { fillColor: COLOR_GREEN, textColor: 255, fontSize: 8.2, fontStyle: "bold" },
    styles: { fontSize: 8.2, cellPadding: 1.5, font: "Inter", textColor: COLOR_TEXT, lineColor: COLOR_BORDER, lineWidth: LINE_WIDTH_THIN },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: "bold", halign: "center", cellPadding: { top: 1.5, right: 1.5, bottom: 1.5, left: 7 } },
      1: { cellWidth: (pageW - 2 * margin - 16) / 2 },
      2: { cellWidth: (pageW - 2 * margin - 16) / 2 },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const h = HUNGER_SCALE[data.row.index];
        doc.setFillColor(...h.color);
        doc.circle(data.cell.x + 3.5, data.cell.y + data.cell.height / 2, 1.6, "F");
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── "De reținut" editorial note ─────────────────────────────────────────
  // A rare, discreet ruby accent — a left rule plus an extremely subtle ruby
  // wash behind it (no stroke, no shadow), kept editorial rather than a card.
  const noteText = "Nu încerca să mănânci «mai bine» doar pentru că notezi. Jurnalul este mai util atunci când reflectă cât mai fidel alimentația ta obișnuită.";
  doc.setFont("Inter", "normal");
  doc.setFontSize(8.8);
  const noteWrapped = doc.splitTextToSize(noteText, pageW - 2 * margin - 8);
  const noteTextX = margin + 6;
  const noteBlockHeight = 5 + noteWrapped.length * 4.2 + 3;
  addPageIfNeeded(noteBlockHeight);
  doc.setFillColor(...COLOR_RUBY_TINT);
  doc.rect(margin, y, pageW - 2 * margin, noteBlockHeight, "F");
  doc.setFillColor(...COLOR_RUBY);
  doc.rect(margin, y, 1.3, noteBlockHeight, "F");
  doc.setFont("Inter", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_RUBY);
  doc.text("DE REȚINUT", noteTextX, y + 5);
  doc.setFont("Inter", "normal");
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  doc.text(noteWrapped, noteTextX, y + 10);

  drawFooter();

  // ── 7-day Journal ─────────────────────────────────────────────────────────
  const days = ["Ziua 1", "Ziua 2", "Ziua 3", "Ziua 4", "Ziua 5", "Ziua 6", "Ziua 7"];

  days.forEach((day, di) => {
    doc.addPage();
    paintBackground();
    y = margin;

    // Day header — a thin, clean green band (not a heavy block)
    const bandHeight = 8;
    doc.setFillColor(...COLOR_GREEN);
    doc.rect(margin, y, pageW - 2 * margin, bandHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("Inter", "bold");
    doc.setFontSize(10);
    doc.text(day, margin + 4, y + 5.5);
    doc.setFont("Inter", "normal");
    doc.setFontSize(7.5);
    doc.text("Data: ____________________", pageW - margin - 4, y + 5.5, { align: "right" });
    y += bandHeight + 6;

    const dayData = journal[di] ?? EMPTY_DAY();
    const rows = dayData.map((entry, mi) => {
      const foodCell = [entry.food, entry.liquids].filter(Boolean).join("  •  ");
      const scaleCell = entry.hungerBefore || entry.fullnessAfter
        ? `Î: ${entry.hungerBefore || "_"}   D: ${entry.fullnessAfter || "_"}`
        : "Î: ___\nD: ___";
      const whyCell = entry.why.length > 0 ? entry.why.join(", ") : WHY_REASONS.join(" / ");
      const quantityCell = [entry.quantity, entry.quantityUnit].filter(Boolean).join(" ");
      return [entry.label || `Masă ${mi + 1}`, entry.time || "", foodCell, quantityCell, scaleCell, whyCell];
    });

    autoTable(doc, {
      startY: y,
      head: [["Masă", "Ora", "Ce am mâncat / băut", "Cantitate", "Foame / sațietate\n(1–5)", "De ce ai mâncat?"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: COLOR_GREEN, textColor: 255, fontSize: 8.2, fontStyle: "bold", halign: "center" },
      styles: { fontSize: 8.75, cellPadding: 2.5, minCellHeight: 26, font: "Inter", textColor: COLOR_TEXT, lineColor: COLOR_BORDER, lineWidth: LINE_WIDTH_THIN },
      columnStyles: {
        0: { cellWidth: 26, fontStyle: "bold", fillColor: COLOR_SURFACE },
        1: { cellWidth: 16, halign: "center" },
        2: { cellWidth: 50 },
        3: { cellWidth: 30, overflow: "ellipsize" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: pageW - 2 * margin - 144 },
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Legend for the Î/D abbreviations used in the table above
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_TEXT_SECONDARY);
    doc.setFont("Inter", "normal");
    doc.text("Î = înainte de masă   ·   D = după masă", margin, y);
    y += 6;

    // Notes box — renamed to also cover symptoms, with a small example line
    doc.setFont("Inter", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_TEXT);
    doc.text("Note suplimentare / simptome", margin, y);
    y += 4.5;
    doc.setFont("Inter", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_TEXT_SECONDARY);
    const notesHintWrapped = doc.splitTextToSize(
      "Ex.: balonare, greață, reflux, disconfort abdominal, energie, somn sau alte observații.",
      pageW - 2 * margin
    );
    doc.text(notesHintWrapped, margin, y);
    y += notesHintWrapped.length * 3.8 + 3;

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(LINE_WIDTH_THIN);
    doc.setFillColor(...COLOR_SURFACE);
    const dayPageBottom = 273;
    const notesBoxHeight = Math.max(18, dayPageBottom - y);
    doc.roundedRect(margin, y, pageW - 2 * margin, notesBoxHeight, 2, 2, "FD");

    drawFooter();
  });

  doc.save("Jurnal_Alimentar_7Zile_Diet4Life.pdf");
}

// ─── Draft persistence (browser localStorage) ─────────────────────────────────
// The journal is meant to be filled over 7 days, not in one sitting, so progress
// is auto-saved on this device/browser — no account or server involved.
const STORAGE_KEY_PATIENT = "diet4life_journal_patient";
const STORAGE_KEY_JOURNAL = "diet4life_journal_data";

function loadPatientDraft(): PatientInfo {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PATIENT);
    return raw ? { ...EMPTY_PATIENT, ...JSON.parse(raw) } : EMPTY_PATIENT;
  } catch {
    return EMPTY_PATIENT;
  }
}

function loadJournalDraft(): JournalDay[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_JOURNAL);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length === 7 ? parsed : EMPTY_JOURNAL();
  } catch {
    return EMPTY_JOURNAL();
  }
}

// ─── Section tabs ──────────────────────────────────────────────────────────
const TABS = [
  { id: "info", icon: BookOpen, labelRo: "Informații & PDF", labelEn: "Info & PDF" },
  { id: "online", icon: ClipboardList, labelRo: "Completare online", labelEn: "Complete online" },
  { id: "upload", icon: Upload, labelRo: "Încarcă jurnal", labelEn: "Upload journal" },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function Consultatii() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const ro = language === "ro";

  const [activeTab, setActiveTab] = useState("info");
  const [patient, setPatient] = useState<PatientInfo>(loadPatientDraft);
  const [journal, setJournal] = useState<JournalDay[]>(loadJournalDraft);
  const [activeDay, setActiveDay] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [journalSent, setJournalSent] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Warm up the PDF fonts as soon as the page mounts (not on click) -- see
  // the comment on preloadFonts() for why this matters on mobile. Best
  // effort only: if it fails here, the click handler's own await will just
  // retry the fetch and surface a real error toast if that fails too.
  useEffect(() => {
    preloadFonts().catch(() => {});
  }, []);

  // Auto-save the draft to this browser as the patient fills it in over multiple days
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(patient));
      window.localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journal));
      setDraftSaved(true);
    } catch {
      // localStorage unavailable (private browsing, storage full, etc.) — fail silently
    }
  }, [patient, journal]);

  const resetDraft = () => {
    if (!window.confirm(ro
      ? "Această acțiune va șterge definitiv jurnalul salvat în acest browser."
      : "This will permanently delete the journal saved in this browser.")) return;
    setPatient(EMPTY_PATIENT);
    setJournal(EMPTY_JOURNAL());
    setActiveDay(0);
    try {
      window.localStorage.removeItem(STORAGE_KEY_PATIENT);
      window.localStorage.removeItem(STORAGE_KEY_JOURNAL);
    } catch {
      // ignore
    }
    toast({ title: ro ? "Jurnalul a fost șters" : "Journal cleared" });
  };

  const setPatientField = (field: keyof PatientInfo, value: string) =>
    setPatient(prev => ({ ...prev, [field]: value }));

  const setMealField = (day: number, meal: number, field: Exclude<keyof MealEntry, "why">, value: string) =>
    setJournal(prev => {
      const next = prev.map(d => [...d]);
      next[day] = next[day].map(m => ({ ...m }));
      next[day][meal] = { ...next[day][meal], [field]: value };
      return next;
    });

  const toggleMealWhy = (day: number, meal: number, reason: string) =>
    setJournal(prev => {
      const next = prev.map(d => [...d]);
      next[day] = next[day].map(m => ({ ...m }));
      const current = next[day][meal].why;
      const why = current.includes(reason) ? current.filter(r => r !== reason) : [...current, reason];
      next[day][meal] = { ...next[day][meal], why };
      return next;
    });

  const addMeal = (day: number) =>
    setJournal(prev => {
      const next = prev.map(d => [...d]);
      next[day] = [...next[day], EMPTY_MEAL(ro ? "Gustare extra" : "Extra snack")];
      return next;
    });

  const removeMeal = (day: number, meal: number) =>
    setJournal(prev => {
      const next = prev.map(d => [...d]);
      next[day] = next[day].filter((_, i) => i !== meal);
      return next;
    });

  const POST_DOWNLOAD_MESSAGE = ro
    ? "Jurnalul tău este gata. Descarcă documentul și trimite-l înainte de consultație prin canalul de comunicare stabilit cu dieteticianul."
    : "Your journal is ready. Download the document and send it before your consultation through the communication channel established with your dietitian.";

  const handleDownload = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generatePDF(patient, journal);
      toast({ title: ro ? "PDF descărcat!" : "PDF downloaded!", description: POST_DOWNLOAD_MESSAGE });
    } catch (err) {
      toast({
        variant: "destructive",
        title: ro ? "Descărcarea PDF-ului a eșuat" : "PDF download failed",
        description: ro
          ? "Te rugăm să încerci din nou. Dacă problema persistă, verifică-ți conexiunea la internet."
          : "Please try again. If the problem persists, check your internet connection.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Always generates an empty template, regardless of any saved online-form
  // draft — for the "print and fill by hand" buttons, not the "send my progress" ones.
  const handleDownloadBlank = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generatePDF(EMPTY_PATIENT, EMPTY_JOURNAL());
      toast({ title: ro ? "PDF descărcat!" : "PDF downloaded!", description: POST_DOWNLOAD_MESSAGE });
    } catch (err) {
      toast({
        variant: "destructive",
        title: ro ? "Descărcarea PDF-ului a eșuat" : "PDF download failed",
        description: ro
          ? "Te rugăm să încerci din nou. Dacă problema persistă, verifică-ți conexiunea la internet."
          : "Please try again. If the problem persists, check your internet connection.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Jurnal alimentar 7 zile – ${patient.name || "Pacient"}`);
    const body = encodeURIComponent(
      `Bună ziua,\n\nVă trimit jurnalul meu alimentar completat online.\n\n` +
      `Nume: ${patient.name}\nGreutate: ${patient.weight} kg\nObiectiv: ${patient.goal}\n` +
      `Afecțiuni: ${patient.medicalConditions}\nAlergii: ${patient.allergies}\n` +
      `Medicamente: ${patient.medications}\nAlimente preferate: ${patient.preferredFoods}\n` +
      `Alimente evitate: ${patient.avoidedFoods}\nAlimente disconfort: ${patient.discomfortFoods}\n` +
      `Dificultate principală: ${patient.mainDifficulty}\nObiectivele mele: ${patient.objectives}\n\n` +
      `Cu respect,\n${patient.name}`
    );
    window.location.href = `mailto:contact@diet4lifeconcept.ro?subject=${subject}&body=${body}`;
    setJournalSent(true);
    toast({ title: ro ? "Email deschis!" : "Email opened!", description: ro ? "Completați și trimiteți emailul din clientul dvs. de email." : "Complete and send the email from your email client." });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({ title: ro ? "Fișier selectat!" : "File selected!", description: file.name });
    }
  };

  const handleSendUploadedFile = () => {
    const subject = encodeURIComponent("Jurnal alimentar completat – Diet4Life Concept");
    const body = encodeURIComponent(
      `Bună ziua,\n\nVă trimit jurnalul meu alimentar completat.\n` +
      `Vă rog să găsiți fișierul atașat: ${uploadedFile?.name}\n\nCu respect,`
    );
    window.location.href = `mailto:contact@diet4lifeconcept.ro?subject=${subject}&body=${body}`;
    toast({ title: ro ? "Email deschis!" : "Email opened!", description: ro ? "Atașați fișierul și trimiteți emailul." : "Attach the file and send the email." });
  };

  // ── Checklist status ──────────────────────────────────────────────────────
  // Only the journal has real, trackable progress (localStorage); the other
  // sections are informational-only, so they carry no completion state.
  const completedDays = journal.filter(day => day.length > 0 && day.every(m => m.food.trim() !== "")).length;
  const journalStatus: "not_started" | "in_progress" | "completed" | "uploaded" =
    completedDays === 7 ? "completed" : uploadedFile ? "uploaded" : completedDays > 0 ? "in_progress" : "not_started";

  const CHECKLIST = [
    { id: "jurnal", icon: Utensils, label: ro ? "Jurnal alimentar" : "Food journal",
      detail: journalStatus === "completed" ? `7/7 ${ro ? "zile" : "days"}` : journalStatus === "uploaded" ? (ro ? "Încărcat" : "Uploaded") : journalStatus === "in_progress" ? `${completedDays}/7 ${ro ? "zile" : "days"}` : (ro ? "Neînceput" : "Not started") },
    { id: "analize", icon: TestTube2, label: ro ? "Analize medicale" : "Medical tests", detail: null },
    { id: "documente", icon: FolderOpen, label: ro ? "Documente medicale" : "Medical documents", detail: null },
  ] as const;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Supports deep links like /consultatii#analize (e.g. from Services.tsx).
  // Delayed so it runs after ScrollToTop's immediate reset-to-0 on route change.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const timer = window.setTimeout(() => scrollToSection(hash), 50);
    return () => window.clearTimeout(timer);
  }, []);

  const dayNames = ro
    ? ["Ziua 1", "Ziua 2", "Ziua 3", "Ziua 4", "Ziua 5", "Ziua 6", "Ziua 7"]
    : ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Page Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            {ro ? "Pregătire consultație" : "Consultation preparation"}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {ro ? "Pregătește-te pentru consultație" : "Prepare for your consultation"}
          </h1>
          <h2 className="text-xl text-muted-foreground font-normal mb-6">
            {ro
              ? "Câțiva pași simpli, pentru ca prima întâlnire să fie cât mai utilă"
              : "A few simple steps, so the first meeting is as useful as possible"}
          </h2>

          {/* Appointment reminder */}
          <div className="inline-flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 max-w-2xl mx-auto text-left">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <span>
              {ro
                ? "Pentru o consultație mai eficientă, vă rugăm să completați jurnalul alimentar de 7 zile înainte de întâlnire. Restul pașilor sunt opționali — consultația poate avea loc și fără ei."
                : "For a more effective consultation, please complete the 7-day food journal before your appointment. The other steps are optional — the consultation can take place without them."}
            </span>
          </div>
        </motion.div>

        {/* ── Checklist: Pregătește-te pentru consultație ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-10 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ListChecks className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-foreground">
                {ro ? "Pașii pregătirii" : "Preparation steps"}
              </h3>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {ro ? `${completedDays} din 7 zile completate` : `${completedDays} of 7 days completed`}
            </span>
          </div>

          <div className="space-y-2">
            {CHECKLIST.map(item => {
              const Icon = item.icon;
              const isDone = item.id === "jurnal" && (journalStatus === "completed" || journalStatus === "uploaded");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors text-left"
                  data-testid={`checklist-item-${item.id}`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 shrink-0 text-muted-foreground/60" />
                  )}
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                  {item.detail && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      isDone ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700"
                    }`}>
                      {item.detail}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Step 1: Jurnal alimentar ── */}
        <div id="jurnal" className="scroll-mt-24 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Jurnal alimentar — 7 zile" : "Food journal — 7 days"}</h2>
        </div>

        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-sm text-foreground leading-relaxed space-y-3">
            <p>
              {ro
                ? "Jurnalul alimentar de 7 zile face parte din pregătirea pentru evaluarea nutrițională. El ne ajută să înțelegem mai bine cum arată alimentația ta obișnuită înainte de consultație."
                : "The 7-day food journal is part of your preparation for the nutritional assessment. It helps us better understand what your usual eating habits look like before your consultation."}
            </p>
            <p>
              {ro
                ? "După alegerea serviciului, vei nota timp de 7 zile mesele, gustările, băuturile și alte informații relevante, conform instrucțiunilor din jurnal."
                : "After choosing your service, you'll record your meals, snacks, drinks, and other relevant information for 7 days, following the instructions included in the journal."}
            </p>
            <p>
              {ro
                ? "Notează orele, cantitățile aproximative, eventualele simptome digestive și alimentele preferate sau evitate. Instrucțiunile complete sunt incluse în jurnal."
                : "Note down the times, approximate quantities, any digestive symptoms, and preferred or avoided foods. The complete instructions are included in the journal."}
            </p>
          </div>
        </motion.div>

        {/* Confidentiality note — only true because the draft never leaves this browser */}
        <p className="text-xs text-muted-foreground mb-8 -mt-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {ro
            ? "Informațiile completate în jurnal sunt salvate doar pe dispozitivul tău și nu sunt transmise automat către Diet4Life."
            : "Information entered in the journal is saved only on your device and is not automatically transmitted to Diet4Life."}
        </p>

        {/* Tab navigation */}
        <div className="flex gap-1.5 sm:gap-2 mb-8 bg-muted/40 p-1.5 rounded-2xl">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-xl text-[11px] sm:text-sm font-medium leading-tight text-center transition-all ${
                  isActive
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{ro ? tab.labelRo : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: Info & Download ── */}
        {activeTab === "info" && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* What the PDF contains */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-serif font-bold text-foreground mb-6">
                  {ro ? "Ce conține jurnalul PDF" : "What the PDF journal contains"}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {[
                    ro ? "Fișă date personale (12 câmpuri)" : "Personal data sheet (12 fields)",
                    ro ? "Tabel 7 zile × 5 mese/zi" : "7-day × 5 meals/day table",
                    ro ? "Scală foame/sațietate și motivul mesei, la fiecare masă" : "Hunger/fullness scale and eating reason, per meal",
                    ro ? "Ghid estimare porții vizual" : "Visual portion estimation guide",
                    ro ? "Spațiu note suplimentare / zi" : "Extra notes space per day",
                    ro ? "Format A4, ușor de printat" : "A4 format, easy to print",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="rounded-xl gap-2 w-full sm:w-auto text-base"
                  onClick={handleDownloadBlank}
                  disabled={isGeneratingPdf}
                >
                  <Download className="w-5 h-5" />
                  <span className="sm:hidden">
                    {isGeneratingPdf ? (ro ? "Se generează..." : "Generating...") : ro ? "Descarcă jurnalul" : "Download journal"}
                  </span>
                  <span className="hidden sm:inline">
                    {isGeneratingPdf
                      ? (ro ? "Se generează PDF-ul..." : "Generating PDF...")
                      : ro ? "Descarcă jurnalul pentru pregătirea consultației" : "Download the journal for your consultation prep"}
                  </span>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  {ro
                    ? "PDF format A4 · Printabil · Parte din pregătirea pentru consultație"
                    : "A4 PDF format · Printable · Part of your consultation prep"}
                </p>
              </CardContent>
            </Card>

            {/* Portion guide */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    {ro ? "Ghid vizual: mâna ca unitate de măsură" : "Visual guide: your hand as a measuring tool"}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {ro
                    ? "Simplu și eficient, fără cântar sau pahar gradat."
                    : "Simple and effective, no scale or measuring cup needed."}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PORTION_GUIDE.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 px-3 bg-secondary/40 rounded-xl">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: `rgb(${p.color.join(",")})` }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {p.hand} <span className="font-normal text-muted-foreground">→ {p.group}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{p.examples}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-serif font-bold text-foreground mb-6">
                  {ro ? "Cum funcționează" : "How it works"}
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Download, label: ro ? "Descarcă și printează jurnalul PDF" : "Download and print the PDF journal" },
                    { icon: ClipboardList, label: ro ? "Sau completează-l direct online în tab-ul următor" : "Or complete it online in the next tab" },
                    { icon: Upload, label: ro ? "Încarcă fișierul completat (PDF, DOCX, JPG, PNG)" : "Upload the completed file (PDF, DOCX, JPG, PNG)" },
                    { icon: Send, label: ro ? "Trimite-l pe email la contact@diet4lifeconcept.ro" : "Send it by email to contact@diet4lifeconcept.ro" },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                          {i + 1}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── TAB 2: Online Completion ── */}
        {activeTab === "online" && (
          <motion.div
            key="online"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Draft save status */}
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {draftSaved
                  ? (ro ? "Salvat automat pe acest dispozitiv" : "Auto-saved on this device")
                  : (ro ? "Se salvează..." : "Saving...")}
              </span>
              <button
                type="button"
                onClick={resetDraft}
                className="text-muted-foreground hover:text-destructive underline underline-offset-2"
                data-testid="button-reset-draft"
              >
                {ro ? "Șterge jurnalul de pe acest dispozitiv" : "Delete the journal from this device"}
              </button>
            </div>

            {/* Patient info */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-serif font-bold text-foreground mb-6">
                  {ro ? "Date personale" : "Personal information"}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: ro ? "Nume pacient" : "Patient name", placeholder: ro ? "Numele complet" : "Full name" },
                    { key: "date", label: ro ? "Data completării" : "Completion date", placeholder: "DD.MM.YYYY" },
                    { key: "weight", label: ro ? "Greutate actuală (kg)" : "Current weight (kg)", placeholder: "70" },
                    { key: "goal", label: ro ? "Obiectiv principal" : "Main goal", placeholder: ro ? "ex. Slăbire, menținere..." : "e.g. Weight loss, maintenance..." },
                    { key: "medicalConditions", label: ro ? "Afecțiuni medicale relevante" : "Relevant medical conditions", placeholder: ro ? "ex. Diabet, HTA..." : "e.g. Diabetes, hypertension..." },
                    { key: "allergies", label: ro ? "Alergii / intoleranțe" : "Allergies / intolerances", placeholder: ro ? "ex. Lactoză, gluten..." : "e.g. Lactose, gluten..." },
                    { key: "medications", label: ro ? "Medicamente / suplimente" : "Medications / supplements", placeholder: ro ? "Listați medicamentele curente" : "List current medications" },
                    { key: "preferredFoods", label: ro ? "Alimente preferate" : "Preferred foods", placeholder: "" },
                    { key: "avoidedFoods", label: ro ? "Alimente pe care nu le consum" : "Foods I don't eat", placeholder: "" },
                    { key: "discomfortFoods", label: ro ? "Alimente care îmi provoacă disconfort" : "Foods that cause discomfort", placeholder: "" },
                    { key: "mainDifficulty", label: ro ? "Ce îți este cel mai dificil în alimentația de zi cu zi?" : "What's hardest for you day-to-day with food?", placeholder: "" },
                    { key: "objectives", label: ro ? "Obiectivele mele" : "My objectives", placeholder: "" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">{label}</label>
                      <Input
                        value={patient[key as keyof PatientInfo]}
                        onChange={e => setPatientField(key as keyof PatientInfo, e.target.value)}
                        placeholder={placeholder}
                        className="rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Day selector */}
            <div className="flex gap-2 flex-wrap">
              {dayNames.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeDay === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Journal table for active day */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-serif font-bold text-foreground mb-5">
                  {dayNames[activeDay]}
                </h3>
                <div className="space-y-4">
                  {journal[activeDay].map((entry, mi) => (
                    <div key={mi} className="rounded-xl border border-border p-4 bg-secondary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          value={entry.label}
                          onChange={e => setMealField(activeDay, mi, "label", e.target.value)}
                          placeholder={ro ? "Numele mesei" : "Meal name"}
                          className="rounded-lg text-sm font-semibold h-8 max-w-xs border-transparent bg-transparent px-2 -ml-2 hover:border-border focus-visible:border-border"
                          data-testid={`input-meal-label-${activeDay}-${mi}`}
                        />
                        {journal[activeDay].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMeal(activeDay, mi)}
                            className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1"
                            aria-label={ro ? "Șterge masa" : "Remove meal"}
                            data-testid={`button-remove-meal-${activeDay}-${mi}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {ro ? "Ora" : "Time"}
                          </label>
                          <Input
                            placeholder="08:00"
                            value={journal[activeDay][mi].time}
                            onChange={e => setMealField(activeDay, mi, "time", e.target.value)}
                            className="rounded-lg text-sm h-9"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {ro ? "Ce am mâncat" : "What I ate"}
                          </label>
                          <Input
                            placeholder={ro ? "Alimente..." : "Foods..."}
                            value={journal[activeDay][mi].food}
                            onChange={e => setMealField(activeDay, mi, "food", e.target.value)}
                            className="rounded-lg text-sm h-9"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {ro ? "Cantitate aprox." : "Approx. qty"}
                          </label>
                          <div className="flex gap-1.5">
                            <Input
                              placeholder={ro ? "1, 200..." : "1, 200..."}
                              value={entry.quantity}
                              onChange={e => setMealField(activeDay, mi, "quantity", e.target.value)}
                              className="rounded-lg text-sm h-9 min-w-0"
                              data-testid={`input-quantity-${activeDay}-${mi}`}
                            />
                            <select
                              value={entry.quantityUnit}
                              onChange={e => setMealField(activeDay, mi, "quantityUnit", e.target.value)}
                              className="rounded-lg text-sm h-9 border border-input bg-background px-1.5 shrink-0"
                              data-testid={`select-unit-${activeDay}-${mi}`}
                            >
                              <option value="">{ro ? "unit." : "unit"}</option>
                              {QUANTITY_UNITS.map(u => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {ro ? "Lichide" : "Liquids"}
                          </label>
                          <Input
                            placeholder={ro ? "Apă, cafea..." : "Water, coffee..."}
                            value={journal[activeDay][mi].liquids}
                            onChange={e => setMealField(activeDay, mi, "liquids", e.target.value)}
                            className="rounded-lg text-sm h-9"
                          />
                        </div>
                      </div>

                      {/* Hunger before / Fullness after (1-5) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">
                            {ro ? "Foame înainte de masă" : "Hunger before eating"}
                          </label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {["1", "2", "3", "4", "5"].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setMealField(activeDay, mi, "hungerBefore", n)}
                                className={`w-full min-w-0 h-11 rounded-lg text-xs font-semibold transition-colors ${
                                  journal[activeDay][mi].hungerBefore === n
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background border border-border text-muted-foreground hover:border-primary/40"
                                }`}
                                data-testid={`button-hunger-${activeDay}-${mi}-${n}`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {ro ? "1 = foame extremă · 3 = gata de masă · 5 = neutră" : "1 = extremely hungry · 3 = ready to eat · 5 = neutral"}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">
                            {ro ? "Sațietate după masă" : "Fullness after eating"}
                          </label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {["1", "2", "3", "4", "5"].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setMealField(activeDay, mi, "fullnessAfter", n)}
                                className={`w-full min-w-0 h-11 rounded-lg text-xs font-semibold transition-colors ${
                                  journal[activeDay][mi].fullnessAfter === n
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background border border-border text-muted-foreground hover:border-primary/40"
                                }`}
                                data-testid={`button-fullness-${activeDay}-${mi}-${n}`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {ro ? "1 = încă flămândă · 3 = confortabil sătulă · 5 = prea plină" : "1 = still hungry · 3 = comfortably full · 5 = overfull"}
                          </p>
                        </div>
                      </div>

                      {/* Why did you eat? */}
                      <div className="mt-4">
                        <label className="text-xs text-muted-foreground mb-1.5 block">
                          {ro ? "De ce ai mâncat?" : "Why did you eat?"}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {WHY_REASONS.map(reason => {
                            const active = journal[activeDay][mi].why.includes(reason);
                            return (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => toggleMealWhy(activeDay, mi, reason)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                  active
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background border border-border text-muted-foreground hover:border-primary/40"
                                }`}
                                data-testid={`button-why-${activeDay}-${mi}-${reason}`}
                              >
                                {reason}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 mt-4"
                  onClick={() => addMeal(activeDay)}
                  data-testid="button-add-meal"
                >
                  <Plus className="w-4 h-4" />
                  {ro ? "Adaugă masă / gustare" : "Add meal / snack"}
                </Button>

                {/* Navigate days */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="rounded-xl gap-1 px-2.5 sm:px-4"
                    disabled={activeDay === 0}
                    onClick={() => setActiveDay(d => d - 1)}
                  >
                    ← <span className="sm:hidden">{ro ? "Anterioară" : "Previous"}</span>
                    <span className="hidden sm:inline">{ro ? "Ziua anterioară" : "Previous day"}</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">{activeDay + 1} / 7</span>
                  <Button
                    variant="outline"
                    className="rounded-xl gap-1 px-2.5 sm:px-4"
                    disabled={activeDay === 6}
                    onClick={() => setActiveDay(d => d + 1)}
                  >
                    <span className="sm:hidden">{ro ? "Următoare" : "Next"}</span>
                    <span className="hidden sm:inline">{ro ? "Ziua următoare" : "Next day"}</span> →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Send actions */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">
                  {ro ? "Trimite jurnalul completat" : "Send completed journal"}
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="rounded-xl gap-2 flex-1"
                    onClick={handleDownload}
                    disabled={isGeneratingPdf}
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingPdf ? (ro ? "Se generează..." : "Generating...") : ro ? "Descarcă ca PDF" : "Download as PDF"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl gap-2 flex-1"
                    onClick={handleSendEmail}
                  >
                    <Mail className="w-4 h-4" />
                    {ro ? "Trimite jurnalul" : "Send journal"}
                  </Button>
                </div>
                {journalSent && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    {ro ? "Clientul de email s-a deschis. Completați și trimiteți mesajul." : "Email client opened. Complete and send the message."}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── TAB 3: Upload ── */}
        {activeTab === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  {ro ? "Încarcă jurnalul completat" : "Upload completed journal"}
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                  {ro
                    ? "Ați completat jurnalul printat? Fotografiați-l sau scanați-l și încărcați-l aici, apoi trimiteți-l pe email."
                    : "Did you complete the printed journal? Photograph or scan it, upload it here, then send it by email."}
                </p>

                {/* Drop zone */}
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-colors ${
                    uploadedFile
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-secondary/30"
                  }`}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  {uploadedFile ? (
                    <>
                      <CheckCircle2 className="w-12 h-12 text-primary" />
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <span className="text-sm text-primary underline">
                        {ro ? "Schimbă fișierul" : "Change file"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-muted-foreground/50" />
                      <div className="text-center">
                        <p className="font-medium text-foreground mb-1">
                          {ro ? "Faceți clic sau trageți fișierul aici" : "Click or drag file here"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ro ? "Formate acceptate: PDF, DOCX, JPG, PNG" : "Accepted formats: PDF, DOCX, JPG, PNG"}
                        </p>
                      </div>
                    </>
                  )}
                </label>

                {/* Upload instructions */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    {ro
                      ? "Deoarece nu avem un server de încărcare direct, după selectarea fișierului vă rugăm să îl trimiteți pe email prin butonul de mai jos. Atașați fișierul manual în emailul care se va deschide."
                      : "Since we don't have a direct upload server, after selecting the file please send it by email using the button below. Attach the file manually to the email that will open."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    size="lg"
                    className="rounded-xl gap-2 flex-1"
                    disabled={!uploadedFile}
                    onClick={handleSendUploadedFile}
                  >
                    <Send className="w-4 h-4" />
                    {ro ? "Trimite pe email" : "Send by email"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl gap-2"
                    onClick={handleDownloadBlank}
                    disabled={isGeneratingPdf}
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingPdf ? (ro ? "Se generează..." : "Generating...") : ro ? "Descarcă PDF gol" : "Download blank PDF"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {ro ? "Email destinație:" : "Destination email:"}{" "}
                  <a href="mailto:contact@diet4lifeconcept.ro" className="text-primary underline">
                    contact@diet4lifeconcept.ro
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">
                  {ro ? "Pași pentru trimitere" : "Steps to send"}
                </h3>
                <div className="space-y-3">
                  {(ro ? [
                    "Descărcați și printați jurnalul PDF",
                    "Completați-l manual timp de 7 zile",
                    "Fotografiați-l sau scanați-l",
                    'Selectați fișierul și apăsați "Trimite pe email"',
                    "Atașați fișierul în emailul care se deschide și trimiteți",
                  ] : [
                    "Download and print the PDF journal",
                    "Complete it manually for 7 days",
                    "Photograph or scan it",
                    "Select the file and press \"Send by email\"",
                    "Attach the file in the email that opens and send",
                  ]).map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Step 2: Analize medicale ── */}
        <div id="analize" className="scroll-mt-24 mb-3 mt-14 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Analize medicale" : "Medical tests"}</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{ro ? "opțional" : "optional"}</span>
        </div>
        <Card className="mb-10">
          <CardContent className="p-8">
            <p className="text-sm text-foreground leading-relaxed mb-3">
              {ro
                ? "Dacă ai analize medicale recente, pregătește-le pentru consultație. Nu este necesar să repeți analize pe care le ai deja și nici să efectuezi toate investigațiile de mai jos înainte de prima întâlnire."
                : "If you have recent medical tests, have them ready for the consultation. There's no need to repeat tests you already have, or to get all the investigations below before the first meeting."}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {ro
                ? "Analizele ne ajută să avem o imagine mai completă asupra statusului metabolic și nutrițional și să adaptăm recomandările la situația individuală."
                : "These tests help us get a fuller picture of your metabolic and nutritional status, and adapt our recommendations to your individual situation."}
            </p>

            <Accordion type="single" collapsible className="mb-5 border border-border rounded-xl px-4">
              <AccordionItem value="labs" className="border-b-0">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                  {ro ? "Vezi lista analizelor utile" : "See the list of useful tests"}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5">
                    {LAB_CATEGORIES.map(cat => (
                      <div key={cat.title}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat.title}</h4>
                        <div className="flex flex-wrap gap-2">
                          {cat.tests.map(test => (
                            <span key={test} className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-foreground">{test}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                      {ro
                        ? "În funcție de istoricul medical, simptome și obiectivul consultației, pot fi utile și alte investigații (de exemplu TSH, FT4, sodiu sau alte analize specifice unei afecțiuni deja diagnosticate)."
                        : "Depending on medical history, symptoms and the goal of the consultation, other investigations may be useful too (e.g. TSH, FT4, sodium, or other tests specific to an already diagnosed condition)."}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-foreground">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {ro
                ? "Nu ai analize recente? Poți face consultația și fără ele. După evaluare putem stabili dacă sunt necesare investigații suplimentare."
                : "No recent tests? You can still have the consultation without them. After the evaluation we can determine if further tests are needed."}
            </div>
          </CardContent>
        </Card>

        {/* ── Step 3: Documente medicale ── */}
        <div id="documente" className="scroll-mt-24 mb-3 mt-14 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Documente medicale" : "Medical documents"}</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{ro ? "opțional" : "optional"}</span>
        </div>
        <Card className="mb-10">
          <CardContent className="p-8">
            <p className="text-sm text-foreground leading-relaxed mb-2">
              {ro
                ? "Dacă ai afecțiuni diagnosticate sau ești urmărit de un medic specialist, pregătește documentele relevante pentru consultație: scrisori medicale, bilete de externare, investigații sau recomandări medicale."
                : "If you have diagnosed conditions or are followed by a specialist, prepare the documents relevant to the consultation: medical letters, discharge notes, investigations or medical recommendations."}
            </p>
            <p className="text-sm text-muted-foreground">
              {ro
                ? "Nu este necesar să pregătești întregul istoric medical, ci doar documentele relevante pentru problema discutată."
                : "There's no need to prepare your entire medical history — just the documents relevant to the issue at hand."}
            </p>
          </CardContent>
        </Card>

        {/* ── Send before the consultation ── */}
        <div id="trimite" className="scroll-mt-24 mb-3 mt-14 flex items-center gap-2">
          <Send className="w-5 h-5 text-primary shrink-0" />
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Trimite pregătirea" : "Send your preparation"}</h2>
        </div>
        <Card className="border-primary/20 bg-primary/5 mb-4">
          <CardContent className="p-8">
            <p className="text-sm text-foreground leading-relaxed">
              {ro
                ? "Trimite jurnalul și documentele relevante înainte de consultație prin canalul de comunicare stabilit cu dieteticianul."
                : "Send the journal and any relevant documents before your consultation through the communication channel established with your dietitian."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {ro ? (
                <>Nu ai încă datele de contact? Le găsești pe pagina de <Link href="/contact" className="text-primary underline underline-offset-2">Contact</Link>.</>
              ) : (
                <>Don't have the contact details yet? You'll find them on the <Link href="/contact" className="text-primary underline underline-offset-2">Contact</Link> page.</>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
