import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useT } from "../../i18n/useT";
import {
  useSettings,
  type AppSettings,
  type DoseUnit,
} from "../../state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../services/referenceService";
import { Background } from "../../ui/Background";
import { CollapsibleCard } from "../../ui/CollapsibleCard";
import {
  Card,
  Input,
  Label,
  PrimaryButton,
  Row,
  Screen,
  Subtle,
  Title,
} from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { DoseCalculatorCard } from "./components/DoseCalculatorCard";
import { Header } from "./components/Header";
import { ResultCard } from "./components/ResultCard";
import { SourceFolderLink, SourceItem } from "./components/SourceLinks";
import { WeightCalculatorCard } from "./components/WeightCalculatorCard";
import { useDoseCalculation } from "./hooks/useDoseCalculation";
import { useJouleCalculation } from "./hooks/useJouleCalculation";
import { useWeightCalculation } from "./hooks/useWeightCalculation";
import type { MedFieldText } from "./types";
import {
  fmtNum,
  unitLabel,
} from "./utils/formatting";
import { toNum } from "./utils/parsing";
import { newMed, nextUnit, tOr } from "./utils/stateHelpers";

export function WeightJouleDoseScreen() {
  const { settings, setSettings, resetSettings, isReady } = useSettings();
  const { t } = useT();

  const [showSettings, setShowSettings] = useState(false);
  const [reference, setReference] = useState<ReferenceDoc | null>(null);

  /** ---------- calculator state ---------- */
  const [ageYears, setAgeYears] = useState("");
  const [weightKgOverride, setWeightKgOverride] = useState("");
  const [jPerKgOverride, setJPerKgOverride] = useState("");

  /** ---------- settings state ---------- */
  const safeSettings = useMemo<AppSettings>(() => {
    return {
      ...settings,
      meds: Array.isArray(settings.meds) ? settings.meds : [],
    };
  }, [settings]);

  const [draft, setDraft] = useState<AppSettings>(safeSettings);
  const [medText, setMedText] = useState<Record<string, MedFieldText>>({});

  const MEDICINE_FOLDER_URL =
    "https://drive.google.com/drive/folders/16VfsoyO-JrI934rgZCRCebiU27lXKMTm?usp=sharing";

  const ADRENALINE_URL =
    "https://drive.google.com/file/d/16c6SlduR87W5q6HYHIeDN5YHq_66QeI1/view?usp=sharing";

  const AMIODARON_URL =
    "https://drive.google.com/file/d/1XRcxE4FfTeQi-GhOVi-AnuMfSOMeBpve/view?usp=sharing";

  const FENTANYL_URL =
    "https://drive.google.com/file/d/1nOvdom_I7opEDVIJNyBIlOFekYNTBrve/view?usp=sharing";

  const HEPARIN_URL =
    "https://drive.google.com/file/d/11oxmBDzYN_dMW1QNT2FM8Hp63pnTSH2W/view?usp=sharing";

  const SKETAMIN_URL =
    "https://drive.google.com/file/d/1qs-4YA5GqsrKTkKI2alWHGTk_4O4dH5W/view?usp=sharing";

  useEffect(() => {
    let active = true;

    async function loadReference() {
      const data = await getReference("wjd");
      if (!active) return;
      setReference(data);
    }

    loadReference();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isReady) setDraft(safeSettings);
  }, [isReady, safeSettings]);

  useEffect(() => {
    if (isReady) setMedText({});
  }, [isReady]);

  const weightCalculation = useWeightCalculation(
    ageYears,
    weightKgOverride,
    settings,
  );
  const jouleCalculation = useJouleCalculation(
    weightCalculation.weightKg,
    jPerKgOverride,
    settings.defaultJPerKg,
  );
  const medRows = useDoseCalculation(weightCalculation.weightKg, settings.meds);
  const computed = isReady
    ? { ...weightCalculation, ...jouleCalculation, medRows }
    : null;

  if (!computed) {
    return (
      <Background>
        <Screen>
          <Title>{t("wjd_title")}</Title>
          <Subtle>{t("loading")}</Subtle>
        </Screen>
      </Background>
    );
  }

  /** ---------- settings actions ---------- */
  const commitMedText = (p: AppSettings): AppSettings => {
    const meds = (p.meds ?? []).map((m) => {
      const tt = medText[m.id];
      if (!tt) return m;

      let dosePerKg = m.dosePerKg;
      if (tt.dosePerKg !== undefined) {
        const s = tt.dosePerKg.trim();
        const v = toNum(s);
        if (s === "") dosePerKg = 0;
        else if (Number.isFinite(v)) dosePerKg = v;
      }

      let maxDose = m.maxDose;
      if (tt.maxDose !== undefined) {
        const s = tt.maxDose.trim();
        const v = toNum(s);
        if (s === "") maxDose = undefined;
        else if (Number.isFinite(v)) maxDose = v;
      }

      let concentration = m.concentration;
      if (tt.concentration !== undefined) {
        const s = tt.concentration.trim();
        const v = toNum(s);
        if (s === "") concentration = undefined;
        else if (Number.isFinite(v)) concentration = v;
      }

      const concUnit = m.doseUnit === "IE" ? "IE" : m.concUnit;

      return { ...m, dosePerKg, maxDose, concentration, concUnit };
    });

    return { ...p, meds };
  };

  const saveSettings = () => {
    const next = commitMedText(draft);
    setDraft(next);
    setSettings(next);
    setMedText({});
    setShowSettings(false);
  };

  const addMed = () => {
    setDraft((p) => ({
      ...p,
      meds: [...(p.meds ?? []), newMed()],
    }));
  };

  const removeMed = (id: string) => {
    setDraft((p) => ({
      ...p,
      meds: (p.meds ?? []).filter((x) => x.id !== id),
    }));
    setMedText((p) => {
      const copy = { ...p };
      delete copy[id];
      return copy;
    });
  };

  const numKeyboard =
    Platform.OS === "ios" ? "numbers-and-punctuation" : "decimal-pad";

  /** ---------- SETTINGS VIEW ---------- */
  if (showSettings) {
    return (
      <Background>
        <Screen>
          <Header
            title={t("wjd_settings_title")}
            subtitle={t("wjd_settings_sub")}
            rightLabel={t("close")}
            onRightPress={() => setShowSettings(false)}
          />

          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
            <Card>
              <Title>{t("settings_weight_title")}</Title>
              <Subtle>{t("settings_weight_sub")}</Subtle>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {(
                  [
                    { key: "APLS_1_5", label: t("settings_apls_1_5") },
                    { key: "APLS_6_12", label: t("settings_apls_6_12") },
                    { key: "CUSTOM_LINEAR", label: t("settings_custom") },
                  ] as const
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.7}
                    onPress={() =>
                      setDraft((p) => ({ ...p, formula: opt.key }))
                    }
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      backgroundColor:
                        draft.formula === opt.key
                          ? "rgba(220,220,220,0.18)"
                          : "transparent",
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {draft.formula === "CUSTOM_LINEAR" && (
                <View style={{ marginTop: 10, gap: 10 }}>
                  <View style={{ gap: 6 }}>
                    <Label>a</Label>
                    <Input
                      value={String(draft.customLinearA)}
                      onChangeText={(tt) => {
                        if (tt.trim() === "") {
                          setDraft((p) => ({ ...p, customLinearA: 0 }));
                          return;
                        }
                        const v = toNum(tt);
                        if (Number.isFinite(v))
                          setDraft((p) => ({ ...p, customLinearA: v }));
                      }}
                      placeholder="e.g. 2"
                      keyboardType={numKeyboard}
                    />
                  </View>

                  <View style={{ gap: 6 }}>
                    <Label>b</Label>
                    <Input
                      value={String(draft.customLinearB)}
                      onChangeText={(tt) => {
                        if (tt.trim() === "") {
                          setDraft((p) => ({ ...p, customLinearB: 0 }));
                          return;
                        }
                        const v = toNum(tt);
                        if (Number.isFinite(v))
                          setDraft((p) => ({ ...p, customLinearB: v }));
                      }}
                      placeholder="e.g. 8"
                      keyboardType={numKeyboard}
                    />
                  </View>
                </View>
              )}
            </Card>

            <Card>
              <Title>{t("settings_default_energy_title")}</Title>

              <View style={{ marginTop: 8, gap: 6 }}>
                <Label>{t("settings_j_per_kg")}</Label>
                <Input
                  value={String(draft.defaultJPerKg)}
                  onChangeText={(tt) => {
                    if (tt.trim() === "") {
                      setDraft((p) => ({ ...p, defaultJPerKg: 0 }));
                      return;
                    }
                    const v = toNum(tt);
                    if (Number.isFinite(v))
                      setDraft((p) => ({ ...p, defaultJPerKg: v }));
                  }}
                  placeholder="e.g. 4"
                  keyboardType={numKeyboard}
                />
              </View>
            </Card>

            <Card>
              <Title>{t("settings_meds_title")}</Title>
              <Subtle>{t("settings_meds_sub")}</Subtle>

              <View style={{ marginTop: 10, alignItems: "flex-start" }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={addMed}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    backgroundColor: "rgba(220,220,220,0.18)",
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                    {t("settings_add_med")}
                  </Text>
                </TouchableOpacity>
              </View>

              {(draft.meds ?? []).length === 0 ? (
                <Text style={{ color: theme.colors.mutedText, marginTop: 10 }}>
                  {t("wjd_noMeds")}
                </Text>
              ) : (
                (draft.meds ?? []).map((m, idx) => {
                  const lang = draft.language;
                  const doseUnitLbl = unitLabel(m.doseUnit, lang);
                  const concUnitLbl = unitLabel(
                    (m.concUnit ?? m.doseUnit) as DoseUnit,
                    lang,
                  );

                  return (
                    <View
                      key={m.id}
                      style={{
                        borderTopWidth: idx === 0 ? 0 : 1,
                        borderTopColor: theme.colors.cardBorder,
                        paddingTop: idx === 0 ? 0 : 14,
                        marginTop: idx === 0 ? 0 : 14,
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View style={{ flex: 1, gap: 6 }}>
                          <Label>{t("settings_med_name")}</Label>
                          <Input
                            value={m.name}
                            keyboardType="default"
                            onChangeText={(tt) =>
                              setDraft((p) => ({
                                ...p,
                                meds: (p.meds ?? []).map((x) =>
                                  x.id === m.id ? { ...x, name: tt } : x,
                                ),
                              }))
                            }
                            placeholder={t("settings_med_name_placeholder")}
                          />
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() =>
                            setDraft((p) => ({
                              ...p,
                              meds: (p.meds ?? []).map((x) =>
                                x.id === m.id
                                  ? { ...x, enabled: !x.enabled }
                                  : x,
                              ),
                            }))
                          }
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          style={{
                            width: 56,
                            height: 32,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.cardBorder,
                            backgroundColor: m.enabled
                              ? "rgba(140,233,154,0.22)"
                              : "rgba(0,0,0,0.14)",
                            justifyContent: "center",
                            paddingHorizontal: 6,
                          }}
                        >
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 999,
                              backgroundColor: theme.colors.text,
                              transform: [{ translateX: m.enabled ? 22 : 0 }],
                            }}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{ gap: 6 }}>
                        <Label>{tOr(t, "settings_med_dose", "Dose")}</Label>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() =>
                              setDraft((p) => ({
                                ...p,
                                meds: (p.meds ?? []).map((x) =>
                                  x.id === m.id
                                    ? {
                                        ...x,
                                        doseUnit: nextUnit(x.doseUnit),
                                        concUnit:
                                          nextUnit(x.doseUnit) === "IE"
                                            ? "IE"
                                            : x.concUnit,
                                      }
                                    : x,
                                ),
                              }))
                            }
                            hitSlop={{
                              top: 12,
                              bottom: 12,
                              left: 12,
                              right: 12,
                            }}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: theme.colors.cardBorder,
                              backgroundColor: "rgba(220,220,220,0.18)",
                            }}
                          >
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontWeight: "800",
                              }}
                            >
                              {doseUnitLbl}/kg
                            </Text>
                          </TouchableOpacity>

                          <View style={{ flex: 1 }}>
                            <Input
                              value={
                                medText[m.id]?.dosePerKg ??
                                (m.dosePerKg === undefined
                                  ? ""
                                  : fmtNum(m.dosePerKg))
                              }
                              onChangeText={(tt) =>
                                setMedText((p) => ({
                                  ...p,
                                  [m.id]: { ...(p[m.id] ?? {}), dosePerKg: tt },
                                }))
                              }
                              onBlur={() => {
                                const tt =
                                  medText[m.id]?.dosePerKg ??
                                  (m.dosePerKg === undefined
                                    ? ""
                                    : fmtNum(m.dosePerKg));

                                if (tt.trim() === "") {
                                  setDraft((p) => ({
                                    ...p,
                                    meds: (p.meds ?? []).map((x) =>
                                      x.id === m.id
                                        ? { ...x, dosePerKg: 0 }
                                        : x,
                                    ),
                                  }));
                                } else {
                                  const v = toNum(tt);
                                  if (Number.isFinite(v)) {
                                    setDraft((p) => ({
                                      ...p,
                                      meds: (p.meds ?? []).map((x) =>
                                        x.id === m.id
                                          ? { ...x, dosePerKg: v }
                                          : x,
                                      ),
                                    }));
                                  }
                                }

                                setMedText((p) => ({
                                  ...p,
                                  [m.id]: {
                                    ...(p[m.id] ?? {}),
                                    dosePerKg: undefined,
                                  },
                                }));
                              }}
                              placeholder="e.g. 0,1"
                              keyboardType={numKeyboard}
                            />
                          </View>
                        </View>
                      </View>

                      <View style={{ gap: 6 }}>
                        <Label>{t("settings_med_max")}</Label>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Input
                              value={
                                medText[m.id]?.maxDose ??
                                (m.maxDose === undefined
                                  ? ""
                                  : fmtNum(m.maxDose))
                              }
                              onChangeText={(tt) =>
                                setMedText((p) => ({
                                  ...p,
                                  [m.id]: { ...(p[m.id] ?? {}), maxDose: tt },
                                }))
                              }
                              onBlur={() => {
                                const tt =
                                  medText[m.id]?.maxDose ??
                                  (m.maxDose === undefined
                                    ? ""
                                    : fmtNum(m.maxDose));

                                setDraft((p) => ({
                                  ...p,
                                  meds: (p.meds ?? []).map((x) => {
                                    if (x.id !== m.id) return x;

                                    if (tt.trim() === "")
                                      return { ...x, maxDose: undefined };

                                    const v = toNum(tt);
                                    return Number.isFinite(v)
                                      ? { ...x, maxDose: v }
                                      : x;
                                  }),
                                }));

                                setMedText((p) => ({
                                  ...p,
                                  [m.id]: {
                                    ...(p[m.id] ?? {}),
                                    maxDose: undefined,
                                  },
                                }));
                              }}
                              placeholder="e.g. 10"
                              keyboardType={numKeyboard}
                            />
                          </View>
                          <Text style={{ color: theme.colors.mutedText }}>
                            {doseUnitLbl}
                          </Text>
                        </View>
                      </View>

                      <View style={{ gap: 6 }}>
                        <Label>{t("settings_med_conc")}</Label>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() =>
                              setDraft((p) => ({
                                ...p,
                                meds: (p.meds ?? []).map((x) => {
                                  if (x.id !== m.id) return x;

                                  if (x.doseUnit === "IE")
                                    return { ...x, concUnit: "IE" };

                                  const next = nextUnit(
                                    (x.concUnit ?? "mg") as DoseUnit,
                                  );
                                  return { ...x, concUnit: next };
                                }),
                              }))
                            }
                            hitSlop={{
                              top: 12,
                              bottom: 12,
                              left: 12,
                              right: 12,
                            }}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: theme.colors.cardBorder,
                              backgroundColor: "rgba(220,220,220,0.18)",
                            }}
                          >
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontWeight: "800",
                              }}
                            >
                              {concUnitLbl}/mL
                            </Text>
                          </TouchableOpacity>

                          <View style={{ flex: 1 }}>
                            <Input
                              value={
                                medText[m.id]?.concentration ??
                                (m.concentration === undefined
                                  ? ""
                                  : fmtNum(m.concentration))
                              }
                              onChangeText={(tt) =>
                                setMedText((p) => ({
                                  ...p,
                                  [m.id]: {
                                    ...(p[m.id] ?? {}),
                                    concentration: tt,
                                  },
                                }))
                              }
                              onBlur={() => {
                                const tt =
                                  medText[m.id]?.concentration ??
                                  (m.concentration === undefined
                                    ? ""
                                    : fmtNum(m.concentration));

                                setDraft((p) => ({
                                  ...p,
                                  meds: (p.meds ?? []).map((x) => {
                                    if (x.id !== m.id) return x;

                                    if (tt.trim() === "")
                                      return {
                                        ...x,
                                        concentration: undefined,
                                        concUnit:
                                          x.doseUnit === "IE"
                                            ? "IE"
                                            : x.concUnit,
                                      };

                                    const v = toNum(tt);
                                    return Number.isFinite(v)
                                      ? {
                                          ...x,
                                          concentration: v,
                                          concUnit:
                                            x.doseUnit === "IE"
                                              ? "IE"
                                              : x.concUnit,
                                        }
                                      : x;
                                  }),
                                }));

                                setMedText((p) => ({
                                  ...p,
                                  [m.id]: {
                                    ...(p[m.id] ?? {}),
                                    concentration: undefined,
                                  },
                                }));
                              }}
                              placeholder="e.g. 5,0"
                              keyboardType={numKeyboard}
                            />
                          </View>
                        </View>
                      </View>

                      <View style={{ alignItems: "flex-start" }}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            Alert.alert(
                              t("remove"),
                              t("settings_remove_confirm"),
                              [
                                { text: t("cancel"), style: "cancel" },
                                {
                                  text: t("remove"),
                                  style: "destructive",
                                  onPress: () => removeMed(m.id),
                                },
                              ],
                            );
                          }}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: theme.colors.cardBorder,
                            backgroundColor: "rgba(255,107,107,0.10)",
                          }}
                        >
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "800",
                            }}
                          >
                            {t("remove")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </Card>

            <PrimaryButton label={t("settings_save")} onPress={saveSettings} />

            <Pressable
              onPress={() => {
                Alert.alert(t("reset"), t("settings_reset_confirm"), [
                  { text: t("cancel"), style: "cancel" },
                  {
                    text: t("reset"),
                    style: "destructive",
                    onPress: () => {
                      resetSettings();
                      setShowSettings(false);
                    },
                  },
                ]);
              }}
              style={{
                paddingVertical: 14,
                alignItems: "center",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor: "rgba(255,107,107,0.10)",
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                {t("settings_reset")}
              </Text>
            </Pressable>
          </ScrollView>
        </Screen>
      </Background>
    );
  }

  /** ---------- CALCULATOR VIEW ---------- */
  const placeholderDefaultJ = Number.isFinite(computed.defaultJPerKg)
    ? `${t("default")} ${computed.defaultJPerKg}`
    : `${t("default")} —`;

  const lang = settings.language;

  const fallbackSources = [
    {
      id: "wjd-fallback-1",
      title:
        lang === "da"
          ? "Adrenalin – medicininstruks"
          : "Adrenaline – medication instruction",
      subtitle:
        lang === "da"
          ? "Akutberedskabet, Region Hovedstaden. Version, gældende dato og revisionsdato fremgår af dokumentet."
          : "Emergency Medical Services, Capital Region. Version, effective date, and revision date appear in the document.",
      url: ADRENALINE_URL,
    },
    {
      id: "wjd-fallback-2",
      title:
        lang === "da"
          ? "Amiodaron – medicininstruks"
          : "Amiodarone – medication instruction",
      subtitle:
        lang === "da"
          ? "Akutberedskabet, Region Hovedstaden. Version, gældende dato og revisionsdato fremgår af dokumentet."
          : "Emergency Medical Services, Capital Region. Version, effective date, and revision date appear in the document.",
      url: AMIODARON_URL,
    },
    {
      id: "wjd-fallback-3",
      title:
        lang === "da"
          ? "Fentanyl – medicininstruks"
          : "Fentanyl – medication instruction",
      subtitle:
        lang === "da"
          ? "Akutberedskabet, Region Hovedstaden. Version, gældende dato og revisionsdato fremgår af dokumentet."
          : "Emergency Medical Services, Capital Region. Version, effective date, and revision date appear in the document.",
      url: FENTANYL_URL,
    },
    {
      id: "wjd-fallback-4",
      title:
        lang === "da"
          ? "Heparin – medicininstruks"
          : "Heparin – medication instruction",
      subtitle:
        lang === "da"
          ? "Akutberedskabet, Region Hovedstaden. Version, gældende dato og revisionsdato fremgår af dokumentet."
          : "Emergency Medical Services, Capital Region. Version, effective date, and revision date appear in the document.",
      url: HEPARIN_URL,
    },
    {
      id: "wjd-fallback-5",
      title:
        lang === "da"
          ? "S-ketamin – medicininstruks"
          : "S-ketamine – medication instruction",
      subtitle:
        lang === "da"
          ? "Akutberedskabet, Region Hovedstaden. Version, gældende dato og revisionsdato fremgår af dokumentet."
          : "Emergency Medical Services, Capital Region. Version, effective date, and revision date appear in the document.",
      url: SKETAMIN_URL,
    },
    {
      id: "wjd-fallback-6",
      title:
        lang === "da"
          ? "Pædiatriske vægtestimater og energi"
          : "Paediatric weight estimates and energy",
      subtitle:
        lang === "da"
          ? "Vægt- og energiberegninger i dette værktøj er vejledende referenceberegninger og skal altid verificeres mod gældende officielle retningslinjer og lokale instrukser."
          : "Weight and energy calculations in this tool are advisory reference calculations and must always be verified against current official guidance and local instructions.",
    },
  ];

  const renderedSources =
    reference?.sources && reference.sources.length > 0
      ? reference.sources.map((source) => ({
          id: source.id,
          title: source.title[lang],
          subtitle: source.subtitle[lang],
          url: (source as any).url?.[lang] ?? (source as any).url ?? undefined,
        }))
      : fallbackSources;

  return (
    <Background>
      <Screen>
        <Header
          title={t("wjd_title")}
          subtitle={t("wjd_sub")}
          rightLabel={t("wjd_openSettings")}
          onRightPress={() => setShowSettings(true)}
        />

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <WeightCalculatorCard
            t={t}
            ageYears={ageYears}
            setAgeYears={setAgeYears}
            weightKgOverride={weightKgOverride}
            setWeightKgOverride={setWeightKgOverride}
            jPerKgOverride={jPerKgOverride}
            setJPerKgOverride={setJPerKgOverride}
            placeholderDefaultJ={placeholderDefaultJ}
          />

          <ResultCard t={t} result={computed} />

          <DoseCalculatorCard t={t} lang={lang} rows={computed.medRows} />

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={reference?.disclaimer[lang] ?? t("wjd_page_disclaimer")}
          >
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(255,209,102,0.10)",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {reference?.disclaimer[lang] ?? t("wjd_page_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={reference?.sourcesSub[lang] ?? t("wjd_sources_sub")}
          >
            <Subtle style={{ marginBottom: 8 }}>
              {reference?.sourcesSub[lang] ?? t("wjd_sources_sub")}
            </Subtle>

            <View style={{ marginTop: 8 }}>
              {renderedSources.map((source) => (
                <SourceItem
                  key={source.id}
                  title={source.title}
                  subtitle={source.subtitle}
                  url={source.url}
                />
              ))}

              <SourceFolderLink
                label={
                  lang === "da"
                    ? "Åbn samlet mappe med medicinkilder"
                    : "Open folder with medication sources"
                }
                url={MEDICINE_FOLDER_URL}
              />
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
