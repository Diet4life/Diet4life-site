import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download, Upload, Send, BookOpen, CheckCircle2,
  ChevronRight, Info, Utensils, FileText, Mail,
  ClipboardList, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatientInfo {
  name: string; date: string; weight: string; goal: string;
  medicalConditions: string; allergies: string; medications: string;
  preferredFoods: string; avoidedFoods: string; discomfortFoods: string;
  mainDifficulty: string; objectives: string;
}

interface MealEntry {
  time: string; food: string; quantity: string; liquids: string;
  hungerBefore: string; fullnessAfter: string; why: string[];
}

type JournalDay = MealEntry[];

const WHY_REASONS = ["Foame", "Obicei", "Plictiseală", "Stres", "Emoție", "Social", "Poftă"];

const EMPTY_MEAL = (): MealEntry => ({
  time: "", food: "", quantity: "", liquids: "",
  hungerBefore: "", fullnessAfter: "", why: [],
});
const EMPTY_DAY = (): JournalDay => Array.from({ length: 5 }, EMPTY_MEAL);
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
  const mealLabels = ["Mic dejun", "Gustare dimineață", "Prânz", "Gustare după-amiază", "Cină"];

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
    const rows = mealLabels.map((label, mi) => {
      const entry = dayData[mi] ?? EMPTY_MEAL();
      const foodCell = [entry.food, entry.liquids].filter(Boolean).join("  •  ");
      const scaleCell = entry.hungerBefore || entry.fullnessAfter
        ? `Î: ${entry.hungerBefore || "_"}   D: ${entry.fullnessAfter || "_"}`
        : "Î: ___\nD: ___";
      const whyCell = entry.why.length > 0 ? entry.why.join(", ") : WHY_REASONS.join(" / ");
      return [label, entry.time || "", foodCell, entry.quantity || "", scaleCell, whyCell];
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
  const [patient, setPatient] = useState<PatientInfo>(EMPTY_PATIENT);
  const [journal, setJournal] = useState<JournalDay[]>(EMPTY_JOURNAL());
  const [activeDay, setActiveDay] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [journalSent, setJournalSent] = useState(false);

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

  const handleDownload = async () => {
    await generatePDF(patient, journal);
    toast({ title: ro ? "PDF descărcat!" : "PDF downloaded!", description: ro ? "Jurnalul a fost generat cu succes." : "Journal generated successfully." });
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

  const mealLabels = ro
    ? ["Mic dejun", "Gustare dimineață", "Prânz", "Gustare după-amiază", "Cină"]
    : ["Breakfast", "Morning snack", "Lunch", "Afternoon snack", "Dinner"];

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
            {ro ? "Pregătire pentru consultație" : "Consultation Preparation"}
          </h1>
          <h2 className="text-xl text-muted-foreground font-normal mb-6">
            {ro ? "Jurnal alimentar 7 zile" : "7-Day Food Journal"}
          </h2>

          {/* Appointment reminder */}
          <div className="inline-flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 max-w-2xl mx-auto text-left">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <span>
              {ro
                ? "Pentru o consultație mai eficientă, vă rugăm să completați jurnalul alimentar de 7 zile înainte de întâlnire."
                : "For a more effective consultation, please complete the 7-day food journal before your appointment."}
            </span>
          </div>
        </motion.div>

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
                  onClick={handleDownload}
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
                  {mealLabels.map((meal, mi) => (
                    <div key={mi} className="rounded-xl border border-border p-4 bg-secondary/20">
                      <p className="text-sm font-semibold text-foreground mb-3">{meal}</p>
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
                          <Input
                            placeholder={ro ? "1 porție / 200g" : "1 serving / 200g"}
                            value={journal[activeDay][mi].quantity}
                            onChange={e => setMealField(activeDay, mi, "quantity", e.target.value)}
                            className="rounded-lg text-sm h-9"
                          />
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
                    onClick={handleDownload}
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
      </div>
    </div>
  );
}
