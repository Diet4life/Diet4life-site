import { useEffect, useState } from "react";

// Read-only, same-device-only heuristic for "did this visitor fill in the
// food journal" -- mirrors Consultatii.tsx's own completedDays calculation
// exactly (journal.filter(day => day.length > 0 && day.every(m =>
// m.food.trim() !== "")).length) against the SAME localStorage key it
// writes to (diet4life_journal_data), but never writes to it. There is no
// per-order link to the journal (it was never designed to have one -- see
// CLAUDE.md's "no account system" rule for Consultatii.tsx), so this can
// only ever answer "has this browser's journal got progress right now,"
// not "did the person who just paid for THIS order fill it in." Used only
// as a soft, best-effort checklist signal on the post-payment page -- never
// treated as authoritative, never sent to the server.
const STORAGE_KEY_JOURNAL = "diet4life_journal_data";

interface JournalMeal {
  food: string;
}

type JournalDay = JournalMeal[];

export function useJournalProgress(): { completedDays: number; isComplete: boolean } {
  const [completedDays, setCompletedDays] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_JOURNAL);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(parsed)) return;
      const days = parsed as JournalDay[];
      const count = days.filter(
        (day) => Array.isArray(day) && day.length > 0 && day.every((m) => typeof m?.food === "string" && m.food.trim() !== ""),
      ).length;
      setCompletedDays(count);
    } catch {
      // localStorage unavailable or malformed -- leave at 0, never throw
    }
  }, []);

  return { completedDays, isComplete: completedDays === 7 };
}
