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
  KommuneNord,
  RegionCategory,
} from "../../src/features/destination/types";

import {
  BYEN_CATEGORIES,
  BYEN_MAP,
  STREET_SAMPLE,
} from "../../src/features/destination/data/byen";

import {
  REGION_NORD_CATEGORIES,
  REGION_NORD_MAP,
} from "../../src/features/destination/data/regionNord";

import {
  hospitalLabel,
  mapPostcodeToBydel,
  mapRegionCityToKommune,
  norm,
} from "../../src/features/destination/helpers";

import { chip } from "../../src/features/destination/ui";

export default function DestinationTool() {
  const { t } = useT();

  const [area, setArea] = useState<Area>("byen");

  const [bydel, setBydel] = useState<Bydel | "">("");
  const [byenCat, setByenCat] = useState<ByenCategory>("hospital");

  const [kommune, setKommune] = useState<KommuneNord | "">("");
  const [regCat, setRegCat] = useState<RegionCategory>("akutmodtagelse");

  const [streetQ, setStreetQ] = useState("");

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedArea, setDetectedArea] = useState<DetectedArea | null>(null);

  const clearDetectedLocation = () => {
    setDetectedArea(null);
    setBydel("");
    setKommune("");
    setStreetQ("");
  };

  const switchArea = (nextArea: Area) => {
    setArea(nextArea);
    setDetectedArea(null);
    setBydel("");
    setKommune("");
    setStreetQ("");
  };

  const streetMatches = useMemo(() => {
    const q = norm(streetQ);
    if (!q) return [];
    return STREET_SAMPLE.filter((r) => norm(r.street).includes(q)).slice(0, 12);
  }, [streetQ]);

  const resolvedHospital = useMemo(() => {
    if (area === "byen") {
      if (!bydel) return null;
      const code = BYEN_MAP[bydel]?.[byenCat] ?? "UNKNOWN";
      return { code, label: hospitalLabel(t, code), extra: bydel };
    }

    if (!kommune) return null;
    const code = REGION_NORD_MAP[kommune]?.[regCat] ?? "UNKNOWN";
    return { code, label: hospitalLabel(t, code), extra: kommune };
  }, [area, bydel, byenCat, kommune, regCat, t]);

  const detectLocation = async () => {
    try {
      setDetectingLocation(true);

      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Location permission needed",
          "Please allow location access so AmbuAssist can detect the patient’s area.",
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

      setDetectedArea({
        label: [district, city, postcode].filter(Boolean).join(", "),
        postcode,
        city,
        district,
        subregion,
      });

      if (area === "byen") {
        const mappedBydel = mapPostcodeToBydel(postcode);

        if (mappedBydel) {
          setBydel(mappedBydel);
        } else {
          Alert.alert(
            "Area not mapped",
            "I found the location, but could not match the postcode to a Copenhagen bydel yet. You can still choose manually.",
          );
        }
      } else {
        const mappedKommune = mapRegionCityToKommune(city, subregion);

        if (mappedKommune) {
          setKommune(mappedKommune);
        } else {
          Alert.alert(
            "Municipality not mapped",
            "I found the location, but could not match it to one of the Region Nord municipalities yet. You can still choose manually.",
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

  const showByenUroNote = area === "byen" && byenCat === "uro";
  const showNeurokirNote = area === "region" && regCat === "neurokirurgi";

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
              Detect bydel or kommune automatically and then apply the
              destination rules.
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
                          key={m.street}
                          onPress={() => {
                            setBydel(m.bydel);
                            setStreetQ(m.street);
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

                  <Label style={{ marginTop: 8 }}>{t("dest_category")}</Label>

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
                          {t(c.labelKey)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {showByenUroNote && (
                    <Text
                      style={{ color: theme.colors.mutedText, marginTop: 8 }}
                    >
                      {t("dest_byen_uro_note") === "dest_byen_uro_note"
                        ? "Urologi i Byen: destination afhænger af akut diagnoseliste (HEH/RH)."
                        : t("dest_byen_uro_note")}
                    </Text>
                  )}
                </View>
              </Card>
            </>
          ) : (
            <Card>
              <Title>{t("dest_region_pick")}</Title>
              <Subtle>{t("dest_region_pick_sub")}</Subtle>

              <View style={{ marginTop: 10, gap: 10 }}>
                <Label>{t("dest_kommune")}</Label>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {(Object.keys(REGION_NORD_MAP) as KommuneNord[]).map((k) => (
                    <Pressable
                      key={k}
                      onPress={() => setKommune(k)}
                      style={chip(kommune === k)}
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

                <Label style={{ marginTop: 8 }}>{t("dest_category")}</Label>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {REGION_NORD_CATEGORIES.map((c) => (
                    <Pressable
                      key={c.key}
                      onPress={() => setRegCat(c.key)}
                      style={chip(regCat === c.key)}
                    >
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontWeight: "800",
                        }}
                      >
                        {t(c.labelKey)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ color: theme.colors.mutedText, marginTop: 8 }}>
                  {t("dest_region_note")}
                </Text>

                {showNeurokirNote && (
                  <Text style={{ color: theme.colors.mutedText }}>
                    {t("dest_region_neurokir_note") ===
                    "dest_region_neurokir_note"
                      ? "Neurokirurgi er angivet som GLO/RH i skemaet."
                      : t("dest_region_neurokir_note")}
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
                      {resolvedHospital.code === "GLO_RH"
                        ? "GLO/RH"
                        : resolvedHospital.code}
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
