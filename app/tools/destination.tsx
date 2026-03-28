import * as Location from "expo-location";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import {
  Card,
  Input,
  Label,
  Row,
  Screen,
  Subtle,
  Title,
} from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

import type {
  Area,
  Bydel,
  ByenCategory,
  DetectedArea,
  HospitalCode,
  Kommune,
  RegionCategory,
} from "../../src/features/destination/types";

import {
  STREET_SAMPLE,
  BYEN_CATEGORIES,
  BYEN_MAP,
} from "../../src/features/destination/data/byen";

import { REGION_BYEN_MAP } from "../../src/features/destination/data/regionByen";
import { REGION_NORD_MAP } from "../../src/features/destination/data/regionNord";
import { REGION_MIDT_MAP } from "../../src/features/destination/data/regionMidt";
import { REGION_SYD_MAP } from "../../src/features/destination/data/regionSyd";

import {
  hospitalLabel,
  mapPostcodeToBydel,
  mapRegionCityToKommune,
  norm,
} from "../../src/features/destination/helpers";

import { chip } from "../../src/features/destination/ui";

type TranslateFn = (key: any) => string;

const REGION_ALL_MAP: Partial<
  Record<Kommune, Partial<Record<RegionCategory, HospitalCode>>>
> = {
  ...REGION_NORD_MAP,
  ...REGION_MIDT_MAP,
  ...REGION_SYD_MAP,
  ...REGION_BYEN_MAP,
};

const ALL_KOMMUNER = Object.keys(REGION_ALL_MAP) as Kommune[];

const REGION_CATEGORY_LABEL_KEYS: Record<RegionCategory, string> = {
  traumecenter: "dest_reg_traumecenter",
  akutmodtagelse: "dest_reg_akutmodtagelse",
  medicinsk_modtagelse: "dest_reg_med_modtagelse",
  akutklinik: "dest_reg_akutklinik",
  kirurgi_mave_tarm: "dest_reg_kir_mave_tarm",
  boernekirurgi: "dest_reg_boernekir",
  ortopaedkirurgi: "dest_reg_ortkir",
  ortopaedkirurgi_boern_u16: "dest_reg_ortkir_boern",
  karkirurgi: "dest_reg_karkir",
  thoraxkirurgi: "dest_reg_thoraxkir",
  neurokirurgi: "dest_reg_neurokir",
  urologi: "dest_reg_urologi",
  plastkirurgi: "dest_reg_plastkir",
  mammakirurgi: "dest_reg_mammakir",
  kardiologi: "dest_reg_kardiologi",
  lungemedicin: "dest_reg_lungemed",
  gastroenterologi: "dest_reg_gastro",
  endokrinologi: "dest_reg_endo",
  geriatrisk: "dest_reg_geri",
  reumatologi: "dest_reg_reuma",
  infektionsmedicin: "dest_reg_infekt",
  nefrologi: "dest_reg_nefro",
  haematologi: "dest_reg_haemato",
  neurologi_ekskl_apopleksi: "dest_reg_neuro",
  apopleksi_ekskl_trombolyse: "dest_reg_apopleksi",
  gynaekologi: "dest_reg_gyn",
  obstetrik: "dest_reg_obst",
  paediatri: "dest_reg_paediatri",
  billeddiagnostik: "dest_reg_billeddiag",
  klinisk_onkologi: "dest_reg_onk",
  palliativ_enhed: "dest_reg_pall",
  oftalmologi: "dest_reg_oftal",
  oere_naese_hals: "dest_reg_oenh",
  audiologi: "dest_reg_audio",
  odontologi: "dest_reg_odont",
  dermato_venerologi: "dest_reg_derm",
  allergologi: "dest_reg_allergi",
  arbejds_miljoemedicin: "dest_reg_arbejds",
  socialmedicin: "dest_reg_social",
};

function fallbackLabelFromKey(key: string): string {
  return key.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function getRegionCategoryLabel(t: TranslateFn, category: RegionCategory) {
  const key = REGION_CATEGORY_LABEL_KEYS[category];
  const translated = t(key);

  if (!translated || translated === key) {
    return fallbackLabelFromKey(String(category));
  }

  return translated;
}

type ResolvedHospital = {
  code: HospitalCode;
  label: string;
  extra: string;
};

export default function DestinationTool() {
  const { t } = useT();

  const [area, setArea] = useState<Area>("byen");

  const [bydel, setBydel] = useState<Bydel | "">("");
  const [kommune, setKommune] = useState<Kommune | "">("");

  const [byenCat, setByenCat] = useState<ByenCategory>("hospital");
  const [regCat, setRegCat] = useState<RegionCategory>("akutmodtagelse");

  const [streetQ, setStreetQ] = useState("");
  const [kommuneQ, setKommuneQ] = useState("");

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedArea, setDetectedArea] = useState<DetectedArea | null>(null);

  const clearDetectedLocation = () => {
    setDetectedArea(null);
    setBydel("");
    setKommune("");
    setStreetQ("");
    setKommuneQ("");
  };

  const switchArea = (nextArea: Area) => {
    setArea(nextArea);
    setDetectedArea(null);
    setBydel("");
    setKommune("");
    setStreetQ("");
    setKommuneQ("");
  };

  const streetMatches = useMemo(() => {
    const q = norm(streetQ);
    if (!q) return [];
    return STREET_SAMPLE.filter((r) => norm(r.street).includes(q)).slice(0, 12);
  }, [streetQ]);

  const kommuneMatches = useMemo(() => {
    const q = norm(kommuneQ);
    if (!q) return [];
    return ALL_KOMMUNER.filter((k) => norm(k).includes(q)).slice(0, 12);
  }, [kommuneQ]);

  const resolvedHospital = useMemo<ResolvedHospital | null>(() => {
    if (area === "byen") {
      if (!bydel) return null;

      const selectedBydel = bydel as Bydel;
      const code: HospitalCode =
        BYEN_MAP[selectedBydel]?.[byenCat] ?? "UNKNOWN";

      return {
        code,
        label: hospitalLabel(t as TranslateFn, code),
        extra: selectedBydel,
      };
    }

    if (!kommune) return null;

    const selectedKommune = kommune as Kommune;
    const code: HospitalCode =
      REGION_ALL_MAP[selectedKommune]?.[regCat] ?? "UNKNOWN";

    return {
      code,
      label: hospitalLabel(t as TranslateFn, code),
      extra: selectedKommune,
    };
  }, [area, bydel, kommune, byenCat, regCat, t]);

  const detectLocation = async () => {
    try {
      setDetectingLocation(true);

      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Location permission needed",
          "Please allow location access so AmbuAssist can detect the patient area.",
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocoded = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const first = geocoded[0];
      if (!first) {
        Alert.alert(
          "Location not found",
          "Could not reverse-geocode this location.",
        );
        return;
      }

      const postcode = String(first.postalCode ?? "").trim();
      const city = String(first.city ?? "").trim();
      const district = String(first.district ?? "").trim();
      const subregion = String(first.subregion ?? "").trim();
      const street = String(first.street ?? "").trim();

      setDetectedArea({
        label: [street, district, city, postcode].filter(Boolean).join(", "),
        postcode,
        city,
        district,
        subregion,
      });

      if (area === "byen") {
        if (street) {
          const streetMatch = STREET_SAMPLE.find(
            (row) => norm(row.street) === norm(street),
          );

          if (streetMatch) {
            setStreetQ(streetMatch.street);
            setBydel(streetMatch.bydel);
            return;
          }
        }

        const mappedBydel = mapPostcodeToBydel(postcode);

        if (mappedBydel === "Bispebjerg") {
          setBydel("Bispebjerg");
        } else if (mappedBydel === "Brønshøj/Husum") {
          setBydel("Brønshøj/Husum");
        } else if (mappedBydel === "Frederiksberg") {
          setBydel("Frederiksberg (post-nr.)");
        } else if (mappedBydel === "Indre by") {
          setBydel("Indre by");
        } else if (mappedBydel === "Vanløse") {
          setBydel("Vanløse");
        } else if (mappedBydel === "Vesterbro") {
          setBydel("Vesterbro");
        } else {
          Alert.alert(
            "Area not mapped",
            "I found the location, but could not match it to a mapped Byen street/bydel yet. You can still search the street or choose manually.",
          );
        }
      } else {
        const mappedKommune = mapRegionCityToKommune(city, subregion);

        if (mappedKommune) {
          setKommune(mappedKommune);
          setKommuneQ(mappedKommune);
        } else {
          Alert.alert(
            "Municipality not mapped",
            "I found the location, but could not match it to one of the mapped region municipalities yet. You can still search or choose manually.",
          );
        }
      }
    } catch {
      Alert.alert(
        "Location error",
        "Something went wrong while reading location.",
      );
    } finally {
      setDetectingLocation(false);
    }
  };

  const showNeurokirNote = area === "region" && regCat === "neurokirurgi";
  const neurokirNote = t("dest_region_neurokir_note" as any);

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("dest_title")}</Title>
          <Subtle>{t("dest_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <Title>Use current location</Title>
            <Subtle>
              Detect street/bydel in Byen mode, or municipality in Region mode.
            </Subtle>

            <View style={{ marginTop: 10, gap: 10 }}>
              <Pressable
                onPress={detectLocation}
                disabled={detectingLocation}
                style={chip(false)}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {detectingLocation
                    ? "Detecting location..."
                    : "Use current location"}
                </Text>
              </Pressable>

              {detectingLocation && <ActivityIndicator />}

              {detectedArea && (
                <>
                  <View
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      padding: 12,
                      backgroundColor: "rgba(0,0,0,0.10)",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      Detected
                    </Text>

                    <Text style={{ color: theme.colors.mutedText }}>
                      {detectedArea.label || "Unknown area"}
                    </Text>

                    {area === "byen" && !!bydel && (
                      <Text style={{ color: theme.colors.mutedText }}>
                        Using bydel:{" "}
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {bydel}
                        </Text>
                      </Text>
                    )}

                    {area === "region" && !!kommune && (
                      <Text style={{ color: theme.colors.mutedText }}>
                        Using kommune:{" "}
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {kommune}
                        </Text>
                      </Text>
                    )}
                  </View>

                  <Pressable
                    onPress={clearDetectedLocation}
                    style={chip(false)}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      Clear location
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </Card>

          <Card>
            <Title>{t("dest_area")}</Title>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable
                onPress={() => switchArea("byen")}
                style={chip(area === "byen")}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {t("dest_byen")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => switchArea("region")}
                style={chip(area === "region")}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {t("dest_region")}
                </Text>
              </Pressable>
            </View>
          </Card>

          {area === "byen" ? (
            <>
              <Card>
                <Title>{t("dest_find_street")}</Title>
                <Subtle>{t("dest_find_street_sub")}</Subtle>

                <View style={{ marginTop: 10, gap: 10 }}>
                  <Input
                    value={streetQ}
                    onChangeText={setStreetQ}
                    placeholder={t("dest_street_placeholder")}
                  />

                  {streetMatches.length > 0 && (
                    <View style={{ gap: 8 }}>
                      {streetMatches.map((m) => (
                        <Pressable
                          key={`${m.street}-${m.bydel}`}
                          onPress={() => {
                            setStreetQ(m.street);
                            setBydel(m.bydel);
                          }}
                          style={chip(false)}
                        >
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "800",
                            }}
                          >
                            {m.street}{" "}
                            <Text
                              style={{
                                color: theme.colors.mutedText,
                                fontWeight: "700",
                              }}
                            >
                              → {m.bydel}
                            </Text>
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {streetQ.length > 0 && streetMatches.length === 0 && (
                    <Text style={{ color: theme.colors.mutedText }}>
                      {t("dest_no_street_match")}
                    </Text>
                  )}
                </View>
              </Card>

              <Card>
                <Title>{t("dest_byen_pick")}</Title>
                <Subtle>{t("dest_byen_pick_sub")}</Subtle>

                <View style={{ marginTop: 10, gap: 10 }}>
                  <Label>{t("dest_bydel")}</Label>

                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                  >
                    {(Object.keys(BYEN_MAP) as Bydel[]).map((b) => (
                      <Pressable
                        key={b}
                        onPress={() => setBydel(b)}
                        style={chip(bydel === b)}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {b}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <Label>{t("dest_category")}</Label>
                  </View>

                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                  >
                    {BYEN_CATEGORIES.map((c) => (
                      <Pressable
                        key={c.key}
                        onPress={() => setByenCat(c.key)}
                        style={chip(byenCat === c.key)}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {t(c.labelKey as any)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Card>
            </>
          ) : (
            <Card>
              <Title>{t("dest_region_pick")}</Title>
              <Subtle>{t("dest_region_pick_sub")}</Subtle>

              <View style={{ marginTop: 10, gap: 10 }}>
                <Input
                  value={kommuneQ}
                  onChangeText={setKommuneQ}
                  placeholder={t("dest_kommune")}
                />

                {kommuneMatches.length > 0 && (
                  <View style={{ gap: 8 }}>
                    {kommuneMatches.map((k) => (
                      <Pressable
                        key={k}
                        onPress={() => {
                          setKommuneQ(k);
                          setKommune(k);
                        }}
                        style={chip(false)}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {k}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {kommuneQ.length > 0 && kommuneMatches.length === 0 && (
                  <Text style={{ color: theme.colors.mutedText }}>
                    No municipality match found.
                  </Text>
                )}

                <View style={{ marginTop: 8 }}>
                  <Label>{t("dest_category")}</Label>
                </View>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {(
                    Object.keys(REGION_CATEGORY_LABEL_KEYS) as RegionCategory[]
                  ).map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setRegCat(c)}
                      style={chip(regCat === c)}
                    >
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontWeight: "800",
                        }}
                      >
                        {getRegionCategoryLabel(t as TranslateFn, c)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ color: theme.colors.mutedText, marginTop: 8 }}>
                  {t("dest_region_note")}
                </Text>

                {showNeurokirNote && (
                  <Text style={{ color: theme.colors.mutedText }}>
                    {neurokirNote === "dest_region_neurokir_note"
                      ? "Neurokirurgi is listed as a shared destination in the planning sheet."
                      : neurokirNote}
                  </Text>
                )}
              </View>
            </Card>
          )}

          <Card>
            <Title>{t("dest_result")}</Title>

            {!resolvedHospital ? (
              <Text style={{ color: theme.colors.mutedText }}>
                {t("dest_pick_more")}
              </Text>
            ) : (
              <>
                <Row>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    {t("dest_destination")}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 18,
                      flex: 1,
                    }}
                  >
                    {resolvedHospital.label}
                  </Text>
                </Row>

                <View
                  style={{
                    marginTop: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    padding: 12,
                    backgroundColor: "rgba(0,0,0,0.14)",
                    gap: 6,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                    {t("dest_context")}:{" "}
                    <Text
                      style={{
                        color: theme.colors.mutedText,
                        fontWeight: "700",
                      }}
                    >
                      {area === "byen" ? t("dest_byen") : t("dest_region")} •{" "}
                      {resolvedHospital.extra}
                    </Text>
                  </Text>

                  <Text style={{ color: theme.colors.mutedText }}>
                    {t("dest_code")}:{" "}
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      {resolvedHospital.code}
                    </Text>
                  </Text>
                </View>

                {resolvedHospital.code === "UNKNOWN" && (
                  <Text
                    style={{
                      color: theme.colors.warn,
                      fontWeight: "800",
                      marginTop: 8,
                    }}
                  >
                    {t("dest_unknown")}
                  </Text>
                )}
              </>
            )}
          </Card>

          <Card>
            <Title>{t("dest_data_title")}</Title>
            <Subtle>{t("dest_data_sub")}</Subtle>
          </Card>
        </ScrollView>
      </Screen>
    </Background>
  );
}
