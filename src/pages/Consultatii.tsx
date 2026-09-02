import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download, Upload, Send, BookOpen, CheckCircle2,
  ChevronRight, Info, Utensils, FileText, Mail,
  ClipboardList, AlertCircle, X, Plus,
  Pill, TestTube2, ShieldCheck, FolderOpen, MessageCircle,
  Trash2, ChevronDown, Circle, ListChecks,
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

interface MedicationEntry {
  name: string; dose: string; frequency: string; notes: string;
}

// File metadata only — there is no backend to actually store the bytes anywhere.
// The patient still has to attach the real file themselves in their email/WhatsApp app.
interface DocMeta {
  id: string; name: string; date: string; docType: string;
}

interface GdprConsent {
  name: string; date: string; agreed: boolean;
}

type JournalDay = MealEntry[];

const WHY_REASONS = ["Foame", "Obicei", "Plictiseală", "Stres", "Emoție", "Social", "Poftă"];
const DEFAULT_MEAL_LABELS = ["Mic dejun", "Gustare dimineață", "Prânz", "Gustare după-amiază", "Cină"];
const QUANTITY_UNITS = ["g", "ml", "cană", "linguriță", "lingură", "bucată", "porție", "felie", "pumn"];

const EMPTY_MEDICATION = (): MedicationEntry => ({ name: "", dose: "", frequency: "", notes: "" });

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

const DOC_TYPES_LAB = ["Analize medicale"];
const DOC_TYPES_MEDICAL = ["Scrisoare medicală", "Bilet de externare", "Alte investigații", "Alt document"];

const GDPR_CONSENT_TEXT =
  "Sunt de acord ca datele mele cu caracter personal, inclusiv datele privind starea de sănătate " +
  "(jurnal alimentar, analize medicale, medicație, documente medicale), să fie colectate și " +
  "prelucrate de Diet4Life Concept exclusiv în scopul pregătirii și desfășurării consultației " +
  "nutriționale. Datele nu vor fi transmise către terți fără acordul meu explicit, cu excepția " +
  "situațiilor prevăzute de lege. Îmi păstrez dreptul de a solicita oricând accesul, rectificarea " +
  "sau ștergerea datelor mele, prin contactarea directă a cabinetului.";

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
  { level: "3", color: [92, 138, 103] as [number, number, number], before: "Flămândă, gata de masă", after: "Confortabil sătulă (ideal)" },
  { level: "4", color: [230, 140, 60] as [number, number, number], before: "Puțin flămândă", after: "Sătulă, grea" },
  { level: "5", color: [200, 90, 90] as [number, number, number], before: "Neutră, deloc flămândă", after: "Prea plină" },
];

// ─── Unicode font loading (DejaVu Sans — full Romanian diacritics support) ───
// jsPDF's built-in "helvetica" is WinAnsi-only and silently drops ă/â/î/ș/ț,
// which also corrupts splitTextToSize's width math (text overflowing its box).
// Fonts are fetched from /public at generation time so they don't bloat the JS bundle.
let fontsLoaded = false;

async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function registerFonts(doc: jsPDF) {
  if (!fontsLoaded) {
    const [regularRes, boldRes] = await Promise.all([
      fetch("/fonts/DejaVuSans.ttf"),
      fetch("/fonts/DejaVuSans-Bold.ttf"),
    ]);
    const [regular, bold] = await Promise.all([
      arrayBufferToBase64(await regularRes.arrayBuffer()),
      arrayBufferToBase64(await boldRes.arrayBuffer()),
    ]);
    (window as any).__diet4lifeFontCache = { regular, bold };
    fontsLoaded = true;
  }
  const { regular, bold } = (window as any).__diet4lifeFontCache;
  doc.addFileToVFS("DejaVuSans.ttf", regular);
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");
  doc.setFont("DejaVuSans", "normal");
}

// ─── PDF Generator ─────────────────────────────────────────────────────────
async function generatePDF(patient: PatientInfo, journal: JournalDay[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await registerFonts(doc);
  const margin = 15;
  const pageW = 210;
  let y = margin;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > 275) { doc.addPage(); y = margin; }
  };

  // Header
  doc.setFillColor(92, 138, 103);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(14);
  doc.text("Diet4Life Concept", margin, 10);
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(9);
  doc.text("Nutriție medicală personalizată  |  contact@diet4lifeconcept.ro  |  0766 572 968", margin, 17);
  y = 30;

  // Title
  doc.setTextColor(30, 30, 30);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(16);
  doc.text("Jurnal Alimentar – 7 Zile", margin, y);
  y += 6;
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Pregătire pentru consultație nutrițională", margin, y);
  y += 8;

  // Completion options — how the patient can fill in and return this journal
  const optionsText = "Puteți completa acest jurnal tipărit de mână, sau direct online pe site-ul nostru (diet4lifeconcept.ro). Odată completat, trimiteți-l — fotografiat, scanat sau ca document — pe email la contact@diet4lifeconcept.ro.";
  doc.setFontSize(8);
  doc.setFont("DejaVuSans", "normal");
  doc.setTextColor(100, 100, 100);
  const optionsWrapped = doc.splitTextToSize(optionsText, pageW - 2 * margin);
  doc.text(optionsWrapped, margin, y);
  y += optionsWrapped.length * 4 + 6;

  // Instruction box — height computed from the wrapped line count so text never overflows it
  const instrText = "Notați toate mesele și gustările timp de 7 zile consecutive. Includeți orele, cantitățile aproximative, lichidele consumate și orice simptome digestive (foame, balonare, greață etc.).";
  doc.setFontSize(8);
  const wrapped = doc.splitTextToSize(instrText, pageW - 2 * margin - 8);
  const instrBoxHeight = 8 + wrapped.length * 4;
  doc.setFillColor(240, 248, 242);
  doc.setDrawColor(92, 138, 103);
  doc.roundedRect(margin, y, pageW - 2 * margin, instrBoxHeight, 2, 2, "FD");
  doc.setTextColor(60, 100, 70);
  doc.setFont("DejaVuSans", "bold");
  doc.text("Instrucțiuni:", margin + 4, y + 5);
  doc.setFont("DejaVuSans", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(wrapped, margin + 4, y + 9);
  y += instrBoxHeight + 6;

  // ── Patient Info ──────────────────────────────────────────────────────────
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Date Pacient", margin, y);
  y += 5;

  const fields = [
    ["Nume pacient", patient.name || "___________________________________"],
    ["Data completării", patient.date || "___________________________________"],
    ["Greutate actuală", patient.weight ? `${patient.weight} kg` : "_____ kg"],
    ["Obiectiv principal", patient.goal || "___________________________________"],
    ["Afecțiuni medicale relevante", patient.medicalConditions || "___________________________________"],
    ["Alergii / intoleranțe", patient.allergies || "___________________________________"],
    ["Medicamente / suplimente", patient.medications || "___________________________________"],
    ["Alimente preferate", patient.preferredFoods || "___________________________________"],
    ["Alimente pe care nu le consum", patient.avoidedFoods || "___________________________________"],
    ["Alimente care îmi provoacă disconfort", patient.discomfortFoods || "___________________________________"],
    ["Principala dificultate alimentară", patient.mainDifficulty || "___________________________________"],
    ["Obiectivele mele", patient.objectives || "___________________________________"],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: fields,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2.5, font: "DejaVuSans" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 65, fillColor: [248, 251, 249] },
      1: { cellWidth: pageW - 2 * margin - 65 },
    },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Portion Guide (hand-based) ────────────────────────────────────────────
  addPageIfNeeded(55);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Ghid vizual: mâna ca unitate de măsură", margin, y);
  y += 5;
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Simplu și eficient, fără cântar sau pahar gradat.", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Reper", "Grup alimentar", "Exemple"]],
    body: PORTION_GUIDE.map(p => [p.hand, p.group, p.examples]),
    theme: "grid",
    headStyles: { fillColor: [92, 138, 103], textColor: 255, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3, font: "DejaVuSans" },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: "bold", cellPadding: { top: 3, right: 3, bottom: 3, left: 10 } },
      1: { cellWidth: 45, fontStyle: "bold" },
      2: { cellWidth: pageW - 2 * margin - 83 },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const p = PORTION_GUIDE[data.row.index];
        doc.setFillColor(...p.color);
        doc.circle(data.cell.x + 4, data.cell.y + data.cell.height / 2, 2, "F");
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Hunger/fullness scale legend ──────────────────────────────────────────
  addPageIfNeeded(45);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Ce înseamnă scala 1-5 (Foame înainte / Sațietate după)", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Nivel", "Foame înainte de masă", "Sațietate după masă"]],
    body: HUNGER_SCALE.map(h => [h.level, h.before, h.after]),
    theme: "grid",
    headStyles: { fillColor: [92, 138, 103], textColor: 255, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3, font: "DejaVuSans" },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold", halign: "center", cellPadding: { top: 3, right: 3, bottom: 3, left: 8 } },
      1: { cellWidth: (pageW - 2 * margin - 18) / 2 },
      2: { cellWidth: (pageW - 2 * margin - 18) / 2 },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const h = HUNGER_SCALE[data.row.index];
        doc.setFillColor(...h.color);
        doc.circle(data.cell.x + 4, data.cell.y + data.cell.height / 2, 2, "F");
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── 7-day Journal ─────────────────────────────────────────────────────────
  const days = ["Ziua 1", "Ziua 2", "Ziua 3", "Ziua 4", "Ziua 5", "Ziua 6", "Ziua 7"];

  days.forEach((day, di) => {
    doc.addPage();
    y = margin;

    // Day header
    doc.setFillColor(92, 138, 103);
    doc.rect(margin, y, pageW - 2 * margin, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(11);
    doc.text(day, margin + 4, y + 7);
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.text("Data: ____________________", pageW - margin - 55, y + 7);
    y += 16;

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
      head: [["Masă", "Ora", "Ce am mâncat / băut", "Cantitate", "Foame înainte /\ndupă masă (1-5)", "De ce ai mâncat?"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [92, 138, 103], textColor: 255, fontSize: 7, fontStyle: "bold", halign: "center" },
      styles: { fontSize: 7.5, cellPadding: 2.5, minCellHeight: 26, font: "DejaVuSans" },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: "bold", fillColor: [248, 251, 249] },
        1: { cellWidth: 12, halign: "center" },
        2: { cellWidth: 44 },
        3: { cellWidth: 38, overflow: "ellipsize" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: pageW - 2 * margin - 138 },
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Legend for the Î/D abbreviations used in the table above
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont("DejaVuSans", "normal");
    doc.text("Î = Înainte de masă   ·   D = După masă", margin, y);
    y += 6;

    // Extra notes box
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text("Note suplimentare:", margin, y);
    y += 4;
    doc.setDrawColor(180, 180, 180);
    doc.setFillColor(252, 252, 252);
    const dayPageBottom = 273;
    const notesBoxHeight = Math.max(18, dayPageBottom - y);
    doc.roundedRect(margin, y, pageW - 2 * margin, notesBoxHeight, 2, 2, "FD");
  });

  // Footer on last page
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("Diet4Life Concept  •  contact@diet4lifeconcept.ro  •  0766 572 968", margin, 285);
  doc.text("Acest document este confidențial și destinat exclusiv evaluării nutriționale.", margin, 289);

  doc.save("Jurnal_Alimentar_7Zile_Diet4Life.pdf");
}

// ─── Draft persistence (browser localStorage) ─────────────────────────────────
// The journal is meant to be filled over 7 days, not in one sitting, so progress
// is auto-saved on this device/browser — no account or server involved.
const STORAGE_KEY_PATIENT = "diet4life_journal_patient";
const STORAGE_KEY_JOURNAL = "diet4life_journal_data";
const STORAGE_KEY_MEDICATIONS = "diet4life_medications";
const STORAGE_KEY_LAB_DOCS = "diet4life_lab_docs";
const STORAGE_KEY_MED_DOCS = "diet4life_medical_docs";
const STORAGE_KEY_GDPR = "diet4life_gdpr_consent";

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

function loadArrayDraft<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadGdprDraft(): GdprConsent {
  const empty: GdprConsent = { name: "", date: "", agreed: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_GDPR);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
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
  const [medications, setMedications] = useState<MedicationEntry[]>(() => loadArrayDraft(STORAGE_KEY_MEDICATIONS));
  const [labDocs, setLabDocs] = useState<DocMeta[]>(() => loadArrayDraft(STORAGE_KEY_LAB_DOCS));
  const [medDocs, setMedDocs] = useState<DocMeta[]>(() => loadArrayDraft(STORAGE_KEY_MED_DOCS));
  const [medDocType, setMedDocType] = useState(DOC_TYPES_MEDICAL[0]);
  const [gdpr, setGdpr] = useState<GdprConsent>(loadGdprDraft);

  // Auto-save the draft to this browser as the patient fills it in over multiple days
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(patient));
      window.localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journal));
      window.localStorage.setItem(STORAGE_KEY_MEDICATIONS, JSON.stringify(medications));
      window.localStorage.setItem(STORAGE_KEY_LAB_DOCS, JSON.stringify(labDocs));
      window.localStorage.setItem(STORAGE_KEY_MED_DOCS, JSON.stringify(medDocs));
      window.localStorage.setItem(STORAGE_KEY_GDPR, JSON.stringify(gdpr));
      setDraftSaved(true);
    } catch {
      // localStorage unavailable (private browsing, storage full, etc.) — fail silently
    }
  }, [patient, journal, medications, labDocs, medDocs, gdpr]);

  const resetDraft = () => {
    if (!window.confirm(ro ? "Ștergi tot ce ai completat până acum?" : "Delete everything filled in so far?")) return;
    setPatient(EMPTY_PATIENT);
    setJournal(EMPTY_JOURNAL());
    setActiveDay(0);
    setMedications([]);
    setLabDocs([]);
    setMedDocs([]);
    setGdpr({ name: "", date: "", agreed: false });
    try {
      window.localStorage.removeItem(STORAGE_KEY_PATIENT);
      window.localStorage.removeItem(STORAGE_KEY_JOURNAL);
      window.localStorage.removeItem(STORAGE_KEY_MEDICATIONS);
      window.localStorage.removeItem(STORAGE_KEY_LAB_DOCS);
      window.localStorage.removeItem(STORAGE_KEY_MED_DOCS);
      window.localStorage.removeItem(STORAGE_KEY_GDPR);
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

  const handleDownload = async () => {
    await generatePDF(patient, journal);
    toast({ title: ro ? "PDF descărcat!" : "PDF downloaded!", description: ro ? "Jurnalul a fost generat cu succes." : "Journal generated successfully." });
  };

  // Always generates an empty template, regardless of any saved online-form
  // draft — for the "print and fill by hand" buttons, not the "send my progress" ones.
  const handleDownloadBlank = async () => {
    await generatePDF(EMPTY_PATIENT, EMPTY_JOURNAL());
    toast({ title: ro ? "PDF descărcat!" : "PDF downloaded!", description: ro ? "Jurnalul gol a fost generat cu succes." : "Blank journal generated successfully." });
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

  // ── Medication & supplements ──────────────────────────────────────────────
  const addMedication = () => setMedications(prev => [...prev, EMPTY_MEDICATION()]);
  const updateMedication = (i: number, field: keyof MedicationEntry, value: string) =>
    setMedications(prev => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  const removeMedication = (i: number) => setMedications(prev => prev.filter((_, idx) => idx !== i));

  // ── Document metadata (lab results / other medical documents) ────────────
  // No backend exists to store the actual file — only name/date/type are kept here,
  // as a checklist of what the patient still needs to attach when sending.
  const addDocMeta = (
    setter: React.Dispatch<React.SetStateAction<DocMeta[]>>,
    file: File,
    docType: string
  ) => {
    setter(prev => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: file.name, date: new Date().toLocaleDateString("ro-RO"), docType }]);
  };
  const removeDocMeta = (setter: React.Dispatch<React.SetStateAction<DocMeta[]>>, id: string) =>
    setter(prev => prev.filter(d => d.id !== id));

  // ── Checklist status ──────────────────────────────────────────────────────
  const completedDays = journal.filter(day => day.length > 0 && day.every(m => m.food.trim() !== "")).length;
  const journalStatus: "not_started" | "in_progress" | "completed" | "uploaded" =
    completedDays === 7 ? "completed" : uploadedFile ? "uploaded" : completedDays > 0 ? "in_progress" : "not_started";
  const medicationStatus: "not_started" | "completed" = medications.length > 0 ? "completed" : "not_started";
  const gdprStatus: "not_started" | "completed" = gdpr.agreed && gdpr.name.trim() !== "" ? "completed" : "not_started";

  const CHECKLIST = [
    { id: "jurnal", icon: Utensils, label: ro ? "Jurnal alimentar" : "Food journal",
      detail: journalStatus === "completed" ? `7/7 ${ro ? "zile" : "days"}` : journalStatus === "uploaded" ? (ro ? "Încărcat" : "Uploaded") : journalStatus === "in_progress" ? `${completedDays}/7 ${ro ? "zile" : "days"}` : (ro ? "Neînceput" : "Not started"),
      status: journalStatus },
    { id: "analize", icon: TestTube2, label: ro ? "Analize medicale" : "Medical tests",
      detail: labDocs.length > 0 ? (ro ? `${labDocs.length} încărcate` : `${labDocs.length} uploaded`) : (ro ? "Opțional" : "Optional"),
      status: labDocs.length > 0 ? "uploaded" : "optional" },
    { id: "medicatie", icon: Pill, label: ro ? "Medicație și suplimente" : "Medication & supplements",
      detail: medicationStatus === "completed" ? (ro ? "Completat" : "Completed") : (ro ? "Neînceput" : "Not started"),
      status: medicationStatus },
    { id: "documente", icon: FolderOpen, label: ro ? "Documente medicale" : "Medical documents",
      detail: medDocs.length > 0 ? (ro ? `${medDocs.length} încărcate` : `${medDocs.length} uploaded`) : (ro ? "Opțional" : "Optional"),
      status: medDocs.length > 0 ? "uploaded" : "optional" },
    { id: "gdpr", icon: ShieldCheck, label: ro ? "Acord GDPR" : "GDPR consent",
      detail: gdprStatus === "completed" ? (ro ? "Completat" : "Completed") : (ro ? "Neînceput" : "Not started"),
      status: gdprStatus },
  ] as const;

  const readySteps = CHECKLIST.filter(c => c.status === "completed" || c.status === "uploaded").length;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Send preparation summary (email / WhatsApp — no backend, so the patient still
  // has to attach any files themselves; this just prepares the message) ──────────
  const CLINIC_EMAIL = "contact@diet4lifeconcept.ro";
  const CLINIC_WHATSAPP = "40766572968"; // RO country code + number, no leading 0

  const buildSummaryText = () => {
    const lines: string[] = [];
    lines.push(ro ? `Pregătire consultație – ${patient.name || "Pacient"}` : `Consultation prep – ${patient.name || "Patient"}`);
    lines.push("");
    lines.push(`${ro ? "Jurnal alimentar" : "Food journal"}: ${
      journalStatus === "completed" ? (ro ? "completat 7/7 zile" : "completed 7/7 days")
      : journalStatus === "uploaded" ? (ro ? "completat pe hârtie, atașat" : "completed on paper, attached")
      : journalStatus === "in_progress" ? `${completedDays}/7 ${ro ? "zile completate" : "days completed"}`
      : (ro ? "necompletat" : "not completed")
    }`);
    lines.push(`${ro ? "Analize medicale" : "Medical tests"}: ${labDocs.length > 0 ? (ro ? `${labDocs.length} fișiere (le atașez separat)` : `${labDocs.length} files (attaching separately)`) : (ro ? "niciuna" : "none")}`);
    if (medications.length > 0) {
      lines.push(ro ? "Medicație și suplimente:" : "Medication & supplements:");
      medications.forEach(m => lines.push(`  - ${[m.name, m.dose, m.frequency].filter(Boolean).join(", ")}${m.notes ? ` (${m.notes})` : ""}`));
    } else {
      lines.push(`${ro ? "Medicație și suplimente" : "Medication & supplements"}: ${ro ? "niciuna raportată" : "none reported"}`);
    }
    lines.push(`${ro ? "Documente medicale" : "Medical documents"}: ${medDocs.length > 0 ? (ro ? `${medDocs.length} fișiere (le atașez separat)` : `${medDocs.length} files (attaching separately)`) : (ro ? "niciunul" : "none")}`);
    lines.push(`${ro ? "Acord GDPR" : "GDPR consent"}: ${gdprStatus === "completed" ? (ro ? `semnat de ${gdpr.name}, ${gdpr.date}` : `signed by ${gdpr.name}, ${gdpr.date}`) : (ro ? "necompletat" : "not completed")}`);
    if (labDocs.length + medDocs.length > 0) {
      lines.push("");
      lines.push(ro
        ? "Notă: vă rog să găsiți atașate fișierele menționate mai sus (analize / documente / jurnal foto)."
        : "Note: please find attached the files mentioned above (tests / documents / journal photos).");
    }
    return lines.join("\n");
  };

  const handleSendPreparationEmail = () => {
    const subject = encodeURIComponent(ro ? `Pregătire consultație – ${patient.name || "Pacient"}` : `Consultation prep – ${patient.name || "Patient"}`);
    const body = encodeURIComponent(buildSummaryText());
    window.location.href = `mailto:${CLINIC_EMAIL}?subject=${subject}&body=${body}`;
    toast({ title: ro ? "Email deschis!" : "Email opened!", description: ro ? "Atașați fișierele relevante și trimiteți emailul." : "Attach the relevant files and send the email." });
  };

  const handleSendPreparationWhatsApp = () => {
    const text = encodeURIComponent(buildSummaryText());
    window.open(`https://wa.me/${CLINIC_WHATSAPP}?text=${text}`, "_blank");
    toast({ title: ro ? "WhatsApp deschis!" : "WhatsApp opened!", description: ro ? "Atașați fișierele relevante direct în conversație." : "Attach the relevant files directly in the chat." });
  };

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
                {ro ? "Pregătește-te pentru consultație" : "Prepare for your consultation"}
              </h3>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {ro ? `${readySteps} din ${CHECKLIST.length} pași pregătiți` : `${readySteps} of ${CHECKLIST.length} steps ready`}
            </span>
          </div>

          <div className="space-y-2">
            {CHECKLIST.map(item => {
              const Icon = item.icon;
              const isDone = item.status === "completed" || item.status === "uploaded";
              const isOptional = item.status === "optional";
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
                    <Circle className={`w-5 h-5 shrink-0 ${isOptional ? "text-muted-foreground/40" : "text-muted-foreground/60"}`} />
                  )}
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    isDone ? "bg-primary/10 text-primary" : isOptional ? "bg-muted text-muted-foreground" : "bg-amber-50 text-amber-700"
                  }`}>
                    {item.detail}
                  </span>
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
          <p className="text-sm text-foreground leading-relaxed">
            {ro
              ? "Pentru o evaluare nutrițională cât mai corectă, vă rugăm să completați jurnalul alimentar timp de 7 zile înainte de consultație. Notați mesele, orele, lichidele consumate, cantitățile aproximative, simptomele digestive și alimentele preferate sau evitate."
              : "For the most accurate nutritional assessment, please complete the food journal for 7 days before your consultation. Record meals, times, liquids consumed, approximate quantities, digestive symptoms and preferred or avoided foods."}
          </p>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-8 bg-muted/40 p-1.5 rounded-2xl">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{ro ? tab.labelRo : tab.labelEn}</span>
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
                >
                  <Download className="w-5 h-5" />
                  {ro ? "Descarcă jurnal alimentar 7 zile" : "Download 7-day food journal"}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  {ro ? "PDF format A4 · Printabil · Gratuit" : "A4 PDF format · Printable · Free"}
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
                {ro ? "Șterge jurnalul și ia-o de la capăt" : "Clear journal and start over"}
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
                    { key: "mainDifficulty", label: ro ? "Principala dificultate alimentară" : "Main dietary difficulty", placeholder: "" },
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        <div className="col-span-2 sm:col-span-1">
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
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">
                            {ro ? "Foame înainte de masă" : "Hunger before eating"}
                          </label>
                          <div className="flex gap-1.5">
                            {["1", "2", "3", "4", "5"].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setMealField(activeDay, mi, "hungerBefore", n)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
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
                          <div className="flex gap-1.5">
                            {["1", "2", "3", "4", "5"].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setMealField(activeDay, mi, "fullnessAfter", n)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
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
                    className="rounded-xl gap-1"
                    disabled={activeDay === 0}
                    onClick={() => setActiveDay(d => d - 1)}
                  >
                    ← {ro ? "Ziua anterioară" : "Previous day"}
                  </Button>
                  <span className="text-sm text-muted-foreground">{activeDay + 1} / 7</span>
                  <Button
                    variant="outline"
                    className="rounded-xl gap-1"
                    disabled={activeDay === 6}
                    onClick={() => setActiveDay(d => d + 1)}
                  >
                    {ro ? "Ziua următoare" : "Next day"} →
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
                  >
                    <Download className="w-4 h-4" />
                    {ro ? "Descarcă ca PDF" : "Download as PDF"}
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
                  >
                    <Download className="w-4 h-4" />
                    {ro ? "Descarcă PDF gol" : "Download blank PDF"}
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
            <p className="text-sm text-foreground leading-relaxed mb-5">
              {ro
                ? "Dacă ai analize medicale recente, le poți încărca înainte de consultație. Nu este necesar să repeți analize pe care le ai deja și nici să efectuezi toate investigațiile de mai jos înainte de prima întâlnire."
                : "If you have recent medical tests, you can upload them before the consultation. There's no need to repeat tests you already have, or to get all the investigations below before the first meeting."}
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

            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6 text-sm text-foreground">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {ro
                ? "Nu ai analize recente? Poți face consultația și fără ele. După evaluare putem stabili dacă sunt necesare investigații suplimentare."
                : "No recent tests? You can still have the consultation without them. After the evaluation we can determine if further tests are needed."}
            </div>

            <label
              htmlFor="upload-lab-docs"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 rounded-xl px-6 py-5 cursor-pointer transition-colors text-sm text-muted-foreground"
            >
              <Upload className="w-4 h-4" />
              {ro ? "Adaugă fișiere (PDF, JPG, PNG)" : "Add files (PDF, JPG, PNG)"}
              <input
                id="upload-lab-docs"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="sr-only"
                onChange={e => {
                  Array.from(e.target.files ?? []).forEach(f => addDocMeta(setLabDocs, f, "Analize medicale"));
                  e.target.value = "";
                }}
                data-testid="input-upload-lab-docs"
              />
            </label>
            {labDocs.length > 0 && (
              <div className="mt-3 space-y-2">
                {labDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 text-sm bg-secondary/30 rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate text-foreground">{doc.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{doc.date}</span>
                    <button
                      type="button"
                      onClick={() => removeDocMeta(setLabDocs, doc.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label={ro ? "Șterge" : "Remove"}
                      data-testid={`button-remove-labdoc-${doc.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Step 3: Medicație și suplimente ── */}
        <div id="medicatie" className="scroll-mt-24 mb-3 mt-14 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Medicație și suplimente" : "Medication & supplements"}</h2>
        </div>
        <Card className="mb-10">
          <CardContent className="p-8">
            <p className="text-sm text-muted-foreground mb-6">
              {ro
                ? "Notează medicamentele și suplimentele pe care le iei în mod curent. Dacă nu iei nimic, poți sări peste acest pas."
                : "List any medications or supplements you currently take. If you take none, you can skip this step."}
            </p>
            {medications.length === 0 && (
              <p className="text-sm text-muted-foreground italic mb-4">
                {ro ? "Niciun medicament adăugat încă." : "No medication added yet."}
              </p>
            )}
            <div className="space-y-3 mb-4">
              {medications.map((m, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end p-3 rounded-xl bg-secondary/20 border border-border">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-muted-foreground mb-1 block">{ro ? "Denumire" : "Name"}</label>
                    <Input
                      value={m.name}
                      onChange={e => updateMedication(i, "name", e.target.value)}
                      placeholder={ro ? "ex. Metformin" : "e.g. Metformin"}
                      className="rounded-lg text-sm h-9"
                      data-testid={`input-medication-name-${i}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{ro ? "Doză" : "Dose"}</label>
                    <Input
                      value={m.dose}
                      onChange={e => updateMedication(i, "dose", e.target.value)}
                      placeholder="500mg"
                      className="rounded-lg text-sm h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{ro ? "Frecvență" : "Frequency"}</label>
                    <Input
                      value={m.frequency}
                      onChange={e => updateMedication(i, "frequency", e.target.value)}
                      placeholder={ro ? "2x/zi" : "2x/day"}
                      className="rounded-lg text-sm h-9"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">{ro ? "Observații" : "Notes"}</label>
                      <Input
                        value={m.notes}
                        onChange={e => updateMedication(i, "notes", e.target.value)}
                        placeholder={ro ? "opțional" : "optional"}
                        className="rounded-lg text-sm h-9"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedication(i)}
                      className="text-muted-foreground hover:text-destructive p-2 shrink-0"
                      aria-label={ro ? "Șterge" : "Remove"}
                      data-testid={`button-remove-medication-${i}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={addMedication} data-testid="button-add-medication">
              <Plus className="w-4 h-4" />
              {ro ? "Adaugă medicament / supliment" : "Add medication / supplement"}
            </Button>
          </CardContent>
        </Card>

        {/* ── Step 4: Documente medicale ── */}
        <div id="documente" className="scroll-mt-24 mb-3 mt-14 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">4</span>
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Documente medicale" : "Medical documents"}</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{ro ? "opțional" : "optional"}</span>
        </div>
        <Card className="mb-10">
          <CardContent className="p-8">
            <p className="text-sm text-foreground leading-relaxed mb-2">
              {ro
                ? "Dacă ai afecțiuni diagnosticate sau ești urmărit de un medic specialist, poți încărca documentele relevante pentru consultație: scrisori medicale, bilete de externare, investigații sau recomandări medicale."
                : "If you have diagnosed conditions or are followed by a specialist, you can upload the documents relevant to the consultation: medical letters, discharge notes, investigations or medical recommendations."}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {ro
                ? "Nu este necesar să încarci întregul istoric medical, ci doar documentele relevante pentru problema discutată."
                : "There's no need to upload your entire medical history — just the documents relevant to the issue at hand."}
            </p>

            <div className="mb-4 max-w-xs">
              <label className="text-xs text-muted-foreground mb-1.5 block">{ro ? "Tip document" : "Document type"}</label>
              <select
                value={medDocType}
                onChange={e => setMedDocType(e.target.value)}
                className="rounded-lg text-sm h-9 border border-input bg-background px-3 w-full"
                data-testid="select-med-doc-type"
              >
                {DOC_TYPES_MEDICAL.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <label
              htmlFor="upload-med-docs"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 rounded-xl px-6 py-5 cursor-pointer transition-colors text-sm text-muted-foreground"
            >
              <Upload className="w-4 h-4" />
              {ro ? "Adaugă fișiere (PDF, JPG, PNG)" : "Add files (PDF, JPG, PNG)"}
              <input
                id="upload-med-docs"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="sr-only"
                onChange={e => {
                  Array.from(e.target.files ?? []).forEach(f => addDocMeta(setMedDocs, f, medDocType));
                  e.target.value = "";
                }}
                data-testid="input-upload-med-docs"
              />
            </label>
            {medDocs.length > 0 && (
              <div className="mt-3 space-y-2">
                {medDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 text-sm bg-secondary/30 rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate text-foreground">{doc.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground shrink-0">{doc.docType}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{doc.date}</span>
                    <button
                      type="button"
                      onClick={() => removeDocMeta(setMedDocs, doc.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label={ro ? "Șterge" : "Remove"}
                      data-testid={`button-remove-meddoc-${doc.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Step 5: Acord GDPR ── */}
        <div id="gdpr" className="scroll-mt-24 mb-3 mt-14 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">5</span>
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Acord privind prelucrarea datelor (GDPR)" : "Data processing consent (GDPR)"}</h2>
        </div>
        <Card className="mb-10">
          <CardContent className="p-8">
            <div className="bg-secondary/30 border border-border rounded-xl p-5 mb-5 text-sm text-muted-foreground leading-relaxed max-h-48 overflow-y-auto">
              {GDPR_CONSENT_TEXT}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{ro ? "Nume complet" : "Full name"}</label>
                <Input
                  value={gdpr.name}
                  onChange={e => setGdpr(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={ro ? "Numele tău" : "Your name"}
                  className="rounded-lg"
                  data-testid="input-gdpr-name"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{ro ? "Data" : "Date"}</label>
                <Input
                  value={gdpr.date}
                  onChange={e => setGdpr(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="DD.MM.YYYY"
                  className="rounded-lg"
                  data-testid="input-gdpr-date"
                />
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={gdpr.agreed}
                onChange={e => setGdpr(prev => ({
                  ...prev,
                  agreed: e.target.checked,
                  date: prev.date || new Date().toLocaleDateString("ro-RO"),
                }))}
                className="mt-1 w-4 h-4 rounded border-border accent-primary"
                data-testid="checkbox-gdpr-agree"
              />
              <span className="text-sm text-foreground">
                {ro
                  ? "Am citit și sunt de acord cu prelucrarea datelor mele cu caracter personal, conform textului de mai sus."
                  : "I have read and agree to the processing of my personal data, as described above."}
              </span>
            </label>
            {gdprStatus === "completed" && (
              <div className="flex items-center gap-2 mt-4 text-sm text-primary">
                <CheckCircle2 className="w-4 h-4" />
                {ro ? "Acord înregistrat." : "Consent recorded."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Send preparation to the clinic ── */}
        <div id="trimite" className="scroll-mt-24 mb-3 mt-14 flex items-center gap-2">
          <Send className="w-5 h-5 text-primary shrink-0" />
          <h2 className="text-lg font-serif font-bold text-foreground">{ro ? "Trimite pregătirea către cabinet" : "Send your preparation to the clinic"}</h2>
        </div>
        <Card className="border-primary/20 bg-primary/5 mb-4">
          <CardContent className="p-8">
            <p className="text-sm text-foreground leading-relaxed mb-2">
              {ro
                ? "Trimite un rezumat al pregătirii tale — jurnal, medicație, acord GDPR — direct pe email sau WhatsApp."
                : "Send a summary of your preparation — journal, medication, GDPR consent — directly by email or WhatsApp."}
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              {ro
                ? "Important: fișierele (analize, documente, poze cu jurnalul completat pe hârtie) nu se atașează automat — trebuie să le atașezi tu manual în emailul sau conversația care se deschide."
                : "Important: files (tests, documents, photos of the handwritten journal) aren't attached automatically — you'll need to attach them yourself in the email or chat that opens."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="rounded-xl gap-2 flex-1" onClick={handleSendPreparationEmail} data-testid="button-send-prep-email">
                <Mail className="w-4 h-4" />
                {ro ? "Trimite pe Email" : "Send by Email"}
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl gap-2 flex-1" onClick={handleSendPreparationWhatsApp} data-testid="button-send-prep-whatsapp">
                <MessageCircle className="w-4 h-4" />
                {ro ? "Trimite pe WhatsApp" : "Send by WhatsApp"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
