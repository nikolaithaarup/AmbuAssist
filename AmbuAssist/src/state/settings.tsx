// src/state/settings.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dispatch, SetStateAction } from "react";
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "en" | "da";
export type WeightFormula = "APLS_1_5" | "APLS_6_12" | "CUSTOM_LINEAR";

// ✅ Added "IE" (stored form). UI can render it as IU/IE based on language.
export type DoseUnit = "ug" | "mg" | "g" | "IE";

export type MedConfig = {
  id: string;
  name: string;
  enabled: boolean;
  dosePerKg: number;
  doseUnit: DoseUnit;
  maxDose?: number;

  // concentration is "X unit per mL", where unit is concUnit
  concentration?: number;
  concUnit?: DoseUnit;
};

export type AppSettings = {
  version: 2;
  language: Language;

  defaultJPerKg: number;
  formula: WeightFormula;

  customLinearA: number;
  customLinearB: number;

  meds: MedConfig[];

  // 👇 add this (not required for UI, only for migrations)
  defaultsRev?: number;
};

const STORAGE_KEY = "ambuassist.settings.v3";

// bump this when you change default meds/weights/etc and want the app to re-sync
const DEFAULTS_REV = 1;

// -------------------- unit helpers --------------------
// NOTE: IE is NOT a mass unit, so we do NOT convert it to mg.
// These helpers return NaN for IE to prevent silent wrong math.
export function unitToMgFactor(u: DoseUnit): number {
  switch (u) {
    case "ug":
      return 0.001;
    case "mg":
      return 1;
    case "g":
      return 1000;
    case "IE":
      return NaN;
  }
}

export function toMg(value: number, unit: DoseUnit): number {
  if (!Number.isFinite(value)) return NaN;
  const f = unitToMgFactor(unit);
  if (!Number.isFinite(f)) return NaN;
  return value * f;
}

export function convertDose(
  value: number,
  from: DoseUnit,
  to: DoseUnit,
): number {
  if (!Number.isFinite(value)) return NaN;

  const fromF = unitToMgFactor(from);
  const toF = unitToMgFactor(to);
  if (!Number.isFinite(fromF) || !Number.isFinite(toF)) return NaN;

  const mg = value * fromF;
  return mg / toF;
}

// -------------------- helpers --------------------
function isDoseUnit(x: any): x is DoseUnit {
  return x === "ug" || x === "mg" || x === "g" || x === "IE";
}

function sanitizePositiveOrUndef(n: any): number | undefined {
  const v = Number(n);
  if (!Number.isFinite(v)) return undefined;
  if (v <= 0) return undefined;
  return v;
}

function sanitizeNumberOrDefault(n: any, fallback: number): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function isUserMedId(id: string) {
  // your UI newMed() uses med_<random>
  return String(id).startsWith("med_");
}

function normalizeMed(m: any): MedConfig | null {
  const id = String(m?.id ?? "").trim();
  if (!id) return null;

  const nameRaw = String(m?.name ?? "");
  const name = nameRaw.trim() || "New med";

  const doseUnit: DoseUnit = isDoseUnit(m?.doseUnit) ? m.doseUnit : "mg";
  const enabled = m?.enabled !== false;

  const dosePerKg = sanitizeNumberOrDefault(m?.dosePerKg, 0);
  const maxDose = sanitizePositiveOrUndef(m?.maxDose);
  const concentration = sanitizePositiveOrUndef(m?.concentration);

  const concUnitRaw = m?.concUnit;
  const concUnitCandidate: DoseUnit | undefined = isDoseUnit(concUnitRaw)
    ? concUnitRaw
    : undefined;

  // If a concentration exists but no unit is set, default it to doseUnit.
  // This also ensures IE concentration becomes IE/mL if doseUnit is IE.
  const concUnit = concUnitCandidate ?? (concentration ? doseUnit : undefined);

  return {
    id,
    name,
    enabled,
    dosePerKg,
    doseUnit,
    maxDose,
    concentration,
    concUnit,
  };
}

// -------------------- defaults --------------------
const defaultSettings: AppSettings = {
  version: 2,
  defaultsRev: DEFAULTS_REV,
  language: "en",
  defaultJPerKg: 4,
  formula: "APLS_1_5",
  customLinearA: 2,
  customLinearB: 8,
  meds: [
    {
      id: "fentanyl",
      name: "Fentanyl",
      enabled: true,
      dosePerKg: 1,
      doseUnit: "ug",
    },
    {
      id: "ketamine",
      name: "Ketamine",
      enabled: true,
      dosePerKg: 0.25,
      doseUnit: "mg",
      maxDose: 25,
    },
    {
      id: "adrenaline_iv",
      name: "Adrenaline (IV)",
      enabled: true,
      dosePerKg: 0.01,
      doseUnit: "mg",
      maxDose: 1,
    },
    {
      id: "amiodarone",
      name: "Amiodarone",
      enabled: true,
      dosePerKg: 5,
      doseUnit: "mg",
      maxDose: 450,
    },
    {
      id: "heparin",
      name: "Heparin",
      enabled: true,
      dosePerKg: 100,
      doseUnit: "IE",
      maxDose: 10000,
      // (Optional) You can set concentration in settings UI as IE/mL for volume calc
      // concentration: 1000,
      // concUnit: "IE",
    },
  ],
};

// -------------------- migration from v1 (optional keep) --------------------
type AppSettingsV1 = {
  version: 1;
  language: Language;
  defaultJPerKg: number;
  formula: WeightFormula;
  customLinearA: number;
  customLinearB: number;
  meds: Array<{
    id: string;
    name: string;
    enabled: boolean;
    mgPerKg: number;
    maxMg?: number;
    concentrationMgPerMl?: number;
  }>;
};

function migrateV1toV2(v1: AppSettingsV1): AppSettings {
  const migratedMeds: MedConfig[] = Array.isArray(v1.meds)
    ? (v1.meds
        .map((m) => ({
          id: String(m.id ?? `med_${Math.random().toString(16).slice(2)}`),
          name: String(m.name ?? "New med").trim() || "New med",
          enabled: m.enabled !== false,
          dosePerKg: Number.isFinite(Number(m.mgPerKg)) ? Number(m.mgPerKg) : 0,
          doseUnit: "mg" as DoseUnit,
          maxDose: sanitizePositiveOrUndef(m.maxMg),
          concentration: sanitizePositiveOrUndef(m.concentrationMgPerMl),
          concUnit: sanitizePositiveOrUndef(m.concentrationMgPerMl)
            ? ("mg" as DoseUnit)
            : undefined,
        }))
        .map(normalizeMed)
        .filter(Boolean) as MedConfig[])
    : [];

  // apply same “defaults authoritative + keep user meds” rule
  return mergeWithDefaults({
    version: 2,
    language: v1.language === "da" ? "da" : "en",
    defaultJPerKg: Number.isFinite(Number(v1.defaultJPerKg))
      ? Number(v1.defaultJPerKg)
      : defaultSettings.defaultJPerKg,
    formula: (v1.formula ?? defaultSettings.formula) as WeightFormula,
    customLinearA: Number.isFinite(Number(v1.customLinearA))
      ? Number(v1.customLinearA)
      : defaultSettings.customLinearA,
    customLinearB: Number.isFinite(Number(v1.customLinearB))
      ? Number(v1.customLinearB)
      : defaultSettings.customLinearB,
    meds: migratedMeds,
    defaultsRev: 0,
  });
}

function mergeWithDefaults(loaded: AppSettings): AppSettings {
  const loadedMeds = Array.isArray(loaded.meds)
    ? (loaded.meds.map(normalizeMed).filter(Boolean) as MedConfig[])
    : [];

  const defaultsById = new Map(defaultSettings.meds.map((m) => [m.id, m]));

  // Keep ONLY user meds from storage (med_...) that don’t collide with defaults
  const userMeds = loadedMeds.filter(
    (m) => isUserMedId(m.id) && !defaultsById.has(m.id),
  );

  // Use DEFAULT meds from code (authoritative)
  const nextMeds = [...defaultSettings.meds, ...userMeds];

  return {
    ...defaultSettings,
    ...loaded,
    version: 2,
    defaultsRev: DEFAULTS_REV,
    language: loaded.language === "da" ? "da" : "en",
    defaultJPerKg: Number.isFinite(Number(loaded.defaultJPerKg))
      ? Number(loaded.defaultJPerKg)
      : defaultSettings.defaultJPerKg,
    formula: (loaded.formula ?? defaultSettings.formula) as WeightFormula,
    customLinearA: Number.isFinite(Number(loaded.customLinearA))
      ? Number(loaded.customLinearA)
      : defaultSettings.customLinearA,
    customLinearB: Number.isFinite(Number(loaded.customLinearB))
      ? Number(loaded.customLinearB)
      : defaultSettings.customLinearB,
    meds: nextMeds,
  };
}

function mergeDefaultsV2(raw: any): AppSettings {
  if (!raw) return defaultSettings;

  if (raw.version === 1) return migrateV1toV2(raw as AppSettingsV1);
  if (raw.version !== 2) return defaultSettings;

  const loaded: AppSettings = {
    ...defaultSettings,
    ...raw,
    version: 2,
    language: raw.language === "da" ? "da" : "en",
    meds: Array.isArray(raw.meds) ? raw.meds : [],
  };

  const needsResync = Number(loaded.defaultsRev ?? 0) !== DEFAULTS_REV;

  // Always enforce “defaults authoritative + keep only user meds”
  const merged = mergeWithDefaults(loaded);

  return needsResync ? merged : merged;
}

// -------------------- context --------------------
type Ctx = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  resetSettings: () => void;
  isReady: boolean;
  setLanguage: (lang: Language) => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;

        const merged = mergeDefaultsV2(parsed);
        setSettings(merged);

        // persist merged immediately so old meds (morphine etc) get overwritten
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        setSettings(defaultSettings);
        AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(defaultSettings),
        ).catch(() => {});
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, isReady]);

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      resetSettings: () => {
        setSettings(defaultSettings);
        AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(defaultSettings),
        ).catch(() => {});
      },
      isReady,
      setLanguage: (lang: Language) =>
        setSettings((p) => ({ ...p, language: lang })),
    }),
    [settings, isReady],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function estimateWeightKg(ageYears: number, s: AppSettings) {
  if (!Number.isFinite(ageYears) || ageYears <= 0) return NaN;

  switch (s.formula) {
    case "APLS_1_5":
      return (ageYears + 4) * 2;
    case "APLS_6_12":
      return ageYears * 3 + 7;
    case "CUSTOM_LINEAR":
      return ageYears * s.customLinearA + s.customLinearB;
    default:
      return NaN;
  }
}
