import type { ArrestEventType } from "../../domain/cardiac-resus/session";

export const EVENT_LABELS_DA: Record<ArrestEventType, string> = {
  session_started: "Session startet",
  rhythm_check: "Rytmetjek registreret",
  shock_delivered: "Stød givet",
  cpr_cycle_marker: "HLR-cyklus registreret",
  adrenaline_given: "Adrenalin givet",
  amiodarone_given: "Amiodaron givet",
  airway_event: "Luftvejshændelse",
  rosc: "ROSC registreret",
  mors: "MORS registreret",
  transport_decision: "Transportbeslutning registreret",
  physician_instruction: "Lægelig ordre registreret",
  free_note: "Note registreret",
  session_ended: "Session afsluttet",
};

export type EventButtonCategory = "shock" | "medication" | "airway" | "outcome" | "other";

export const VISIBLE_EVENT_BUTTONS: {
  type: ArrestEventType;
  label: string;
  category: EventButtonCategory;
}[] = [
  { type: "shock_delivered", label: "Stød givet", category: "shock" },
  { type: "adrenaline_given", label: "Adrenalin givet", category: "medication" },
  { type: "amiodarone_given", label: "Amiodaron givet", category: "medication" },
  { type: "airway_event", label: "Luftvej", category: "airway" },
  { type: "rosc", label: "ROSC", category: "outcome" },
  { type: "mors", label: "MORS", category: "outcome" },
  { type: "transport_decision", label: "Transportbeslutning", category: "other" },
  { type: "free_note", label: "Note", category: "other" },
];

export function formatElapsed(totalSeconds: number): string {
  const seconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? [hours, minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":")
    : [minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":");
}
