import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useT } from "../../src/i18n/useT";
import { useSettings } from "../../src/state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../src/services/referenceService";
import { Background } from "../../src/ui/Background";
import { CollapsibleCard } from "../../src/ui/CollapsibleCard";
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
  BYEN_CATEGORIES,
  BYEN_MAP,
  STREET_SAMPLE,
} from "../../src/features/destination/data/byen";

import { REGION_BYEN_MAP } from "../../src/features/destination/data/regionByen";
import { REGION_MIDT_MAP } from "../../src/features/destination/data/regionMidt";
import { REGION_NORD_MAP } from "../../src/features/destination/data/regionNord";
import { REGION_SYD_MAP } from "../../src/features/destination/data/regionSyd";

import {
  hospitalLabel,
  mapKommuneByenToOfficialBydel,
  mapPostcodeToBydel,
  mapRegionCityToKommune,
  mapStreetBydelToOfficialBydel,
  norm,
} from "../../src/features/destination/helpers";

import {
  getHospitalPhoneNumber,
  type HospitalPhoneNumber,
} from "../../src/services/hospitalNumbers";

import { chip } from "../../src/features/destination/ui";

type TranslateFn = (key: any) => string;
type InputMode = "gps" | "search";

const VISITATION_BYEN_URL =
  "https://drive.google.com/file/d/18gnYztqAw40PxuGuP5N_iEDmksYk-eIX/view?usp=sharing";

const VISITATION_REGIONEN_URL =
  "https://drive.google.com/file/d/1HS25c5EPt1oP3WbzT6jA99TMiprOgvVh/view?usp=sharing";

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
  plastikkirurgi: "dest_reg_plastkir",
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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

type ResolvedHospital = {
  code: HospitalCode;
  label: string;
  extra: string;
};

type SimpleDropdownProps<T extends string> = {
  label: string;
  value: T | "";
  open: boolean;
  onToggle: () => void;
  options: readonly T[];
  onSelect: (value: T) => void;
  renderValue?: (value: T) => string;
  placeholder?: string;
  emptyText?: string;
  maxHeight?: number;
};

function SimpleDropdown<T extends string>({
  label,
  value,
  open,
  onToggle,
  options,
  onSelect,
  renderValue,
  placeholder = "Choose...",
  emptyText = "No matches found.",
  maxHeight = 220,
}: SimpleDropdownProps<T>) {
  const displayValue = value
    ? renderValue
      ? renderValue(value)
      : value
    : placeholder;

  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>

      <Pressable
        onPress={onToggle}
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
          paddingHorizontal: 12,
          paddingVertical: 14,
          backgroundColor: "rgba(0,0,0,0.10)",
        }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {displayValue}{" "}
          <Text style={{ color: theme.colors.mutedText }}>
            {open ? "▲" : "▼"}
          </Text>
        </Text>
      </Pressable>

      {open && (
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
            backgroundColor: "rgba(0,0,0,0.08)",
            padding: 8,
          }}
        >
          {options.length === 0 ? (
            <Text style={{ color: theme.colors.mutedText, padding: 8 }}>
              {emptyText}
            </Text>
          ) : (
            <ScrollView
              nestedScrollEnabled
              style={{ maxHeight }}
              contentContainerStyle={{ gap: 8 }}
              showsVerticalScrollIndicator
            >
              {options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => onSelect(option)}
                  style={{
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 12,
                    backgroundColor:
                      value === option
                        ? "rgba(220,220,220,0.18)"
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: value === option ? "800" : "700",
                    }}
                  >
                    {renderValue ? renderValue(option) : option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

function SourceItem({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle?: string;
  url?: string;
}) {
  const openSource = async () => {
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Kunne ikke åbne link", url);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Linket kunne ikke åbnes.");
    }
  };

  if (url) {
    return (
      <Pressable
        onPress={openSource}
        style={({ pressed }) => ({
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.06)",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            color: "#8ec5ff",
            fontSize: 14,
            fontWeight: "800",
            lineHeight: 18,
            textDecorationLine: "underline",
          }}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View
      style={{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "800",
          lineHeight: 18,
        }}
      >
        {title}
      </Text>

      {!!subtitle && (
        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export default function DestinationTool() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [reference, setReference] = useState<ReferenceDoc | null>(null);

  const [mode, setMode] = useState<InputMode>("gps");
  const [area, setArea] = useState<Area>("byen");

  const [bydel, setBydel] = useState<Bydel | "">("");
  const [kommune, setKommune] = useState<Kommune | "">("");
  const [selectedStreet, setSelectedStreet] = useState<string>("");

  const [byenCat, setByenCat] = useState<ByenCategory>("hospital");
  const [regCat, setRegCat] = useState<RegionCategory>("akutmodtagelse");

  const [streetQ, setStreetQ] = useState("");
  const [kommuneQ, setKommuneQ] = useState("");

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedArea, setDetectedArea] = useState<DetectedArea | null>(null);

  const [streetOpen, setStreetOpen] = useState(false);
  const [kommuneOpen, setKommuneOpen] = useState(false);
  const [byenCatOpen, setByenCatOpen] = useState(false);
  const [regCatOpen, setRegCatOpen] = useState(false);

  const [hospitalPhone, setHospitalPhone] =
    useState<HospitalPhoneNumber | null>(null);
  const [loadingHospitalPhone, setLoadingHospitalPhone] = useState(false);

  const selectedSpecialtyKey = area === "byen" ? byenCat : regCat;

  const lastGeocodeAtRef = useRef(0);
  const lastGeocodeCoordsRef = useRef<{ lat: number; lon: number } | null>(
    null,
  );
  const lastGeocodeResultRef = useRef<
    Location.LocationGeocodedAddress[] | null
  >(null);
  const geocodeBlockedUntilRef = useRef(0);
  const geocodeInFlightRef = useRef<Promise<
    Location.LocationGeocodedAddress[]
  > | null>(null);

  const GEOCODE_COOLDOWN_MS = 20_000;
  const GEOCODE_BLOCK_MS = 90_000;
  const GEOCODE_CACHE_DISTANCE = 0.0025;

  useEffect(() => {
    let active = true;

    async function loadReference() {
      const data = await getReference("dest");
      if (!active) return;
      setReference(data);
    }

    loadReference();

    return () => {
      active = false;
    };
  }, []);

  const closeAllDropdowns = () => {
    setStreetOpen(false);
    setKommuneOpen(false);
    setByenCatOpen(false);
    setRegCatOpen(false);
  };

  const resetSelectionState = () => {
    setDetectedArea(null);
    setBydel("");
    setKommune("");
    setSelectedStreet("");
    setStreetQ("");
    setKommuneQ("");
    closeAllDropdowns();
  };

  const clearDetectedLocation = () => {
    resetSelectionState();
  };

  const switchArea = (nextArea: Area) => {
    setArea(nextArea);
    resetSelectionState();
  };

  const switchMode = (nextMode: InputMode) => {
    setMode(nextMode);
    resetSelectionState();
  };

  const toggleStreetDropdown = () => {
    setStreetOpen((prev) => {
      const next = !prev;
      if (next) {
        setKommuneOpen(false);
        setByenCatOpen(false);
        setRegCatOpen(false);
      }
      return next;
    });
  };

  const toggleKommuneDropdown = () => {
    setKommuneOpen((prev) => {
      const next = !prev;
      if (next) {
        setStreetOpen(false);
        setByenCatOpen(false);
        setRegCatOpen(false);
      }
      return next;
    });
  };

  const toggleByenCatDropdown = () => {
    setByenCatOpen((prev) => {
      const next = !prev;
      if (next) {
        setStreetOpen(false);
        setKommuneOpen(false);
        setRegCatOpen(false);
      }
      return next;
    });
  };

  const toggleRegCatDropdown = () => {
    setRegCatOpen((prev) => {
      const next = !prev;
      if (next) {
        setStreetOpen(false);
        setKommuneOpen(false);
        setByenCatOpen(false);
      }
      return next;
    });
  };

  const isNearCachedLocation = (lat: number, lon: number) => {
    const cached = lastGeocodeCoordsRef.current;
    if (!cached) return false;

    return (
      Math.abs(cached.lat - lat) <= GEOCODE_CACHE_DISTANCE &&
      Math.abs(cached.lon - lon) <= GEOCODE_CACHE_DISTANCE
    );
  };

  const callHospitalNumber = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert("Kunne ikke åbne opkald", phone);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Kunne ikke starte opkald.");
    }
  };

  const getReverseGeocodeSafely = async (lat: number, lon: number) => {
    const now = Date.now();

    if (lastGeocodeResultRef.current && isNearCachedLocation(lat, lon)) {
      return lastGeocodeResultRef.current;
    }

    if (now < geocodeBlockedUntilRef.current) {
      const secondsLeft = Math.ceil(
        (geocodeBlockedUntilRef.current - now) / 1000,
      );
      throw new Error(
        `Adresseopslag er midlertidigt blokeret. Vent ca. ${secondsLeft} sekunder og prøv igen.`,
      );
    }

    if (geocodeInFlightRef.current) {
      return geocodeInFlightRef.current;
    }

    if (now - lastGeocodeAtRef.current < GEOCODE_COOLDOWN_MS) {
      const secondsLeft = Math.ceil(
        (GEOCODE_COOLDOWN_MS - (now - lastGeocodeAtRef.current)) / 1000,
      );
      throw new Error(
        `Adresseopslag er på cooldown. Vent ca. ${secondsLeft} sekunder og prøv igen.`,
      );
    }

    lastGeocodeAtRef.current = now;

    const promise = Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lon,
    })
      .then((result) => {
        lastGeocodeCoordsRef.current = { lat, lon };
        lastGeocodeResultRef.current = result;
        return result;
      })
      .catch((error: any) => {
        const message = String(error?.message ?? "").toLowerCase();

        if (
          message.includes("rate limit") ||
          message.includes("too many requests") ||
          message.includes("geocoding rate limit exceeded")
        ) {
          geocodeBlockedUntilRef.current = Date.now() + GEOCODE_BLOCK_MS;
        }

        throw error;
      })
      .finally(() => {
        geocodeInFlightRef.current = null;
      });

    geocodeInFlightRef.current = promise;
    return promise;
  };

  const streetOptions = useMemo(() => {
    const q = norm(streetQ);
    const all = uniqueStrings(STREET_SAMPLE.map((r) => r.street)).sort((a, b) =>
      a.localeCompare(b, "da"),
    );

    if (!q) return all;
    return all.filter((street) => norm(street).includes(q));
  }, [streetQ]);

  const kommuneOptions = useMemo(() => {
    const q = norm(kommuneQ);
    const all = [...ALL_KOMMUNER].sort((a, b) => a.localeCompare(b, "da"));

    if (!q) return all;
    return all.filter((k) => norm(k).includes(q));
  }, [kommuneQ]);

  const regionCategoryOptions = useMemo(() => {
    return (Object.keys(REGION_CATEGORY_LABEL_KEYS) as RegionCategory[]).sort(
      (a, b) =>
        getRegionCategoryLabel(t as TranslateFn, a).localeCompare(
          getRegionCategoryLabel(t as TranslateFn, b),
          "da",
        ),
    );
  }, [t]);

  const resolvedHospital = useMemo<ResolvedHospital | null>(() => {
    if (area === "byen") {
      if (!bydel) return null;

      const selectedBydel = bydel as Bydel;
      const code: HospitalCode =
        BYEN_MAP[selectedBydel]?.[byenCat] ?? "UNKNOWN";

      return {
        code,
        label: hospitalLabel(t as TranslateFn, code),
        extra: selectedStreet
          ? `${selectedStreet} • ${selectedBydel}`
          : selectedBydel,
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
  }, [area, bydel, kommune, selectedStreet, byenCat, regCat, t]);

  useEffect(() => {
    const loadHospitalPhone = async () => {
      if (!resolvedHospital || resolvedHospital.code === "UNKNOWN") {
        setHospitalPhone(null);
        setLoadingHospitalPhone(false);
        return;
      }

      setLoadingHospitalPhone(true);

      try {
        const result = await getHospitalPhoneNumber(
          resolvedHospital.code,
          selectedSpecialtyKey,
        );

        setHospitalPhone(result);
      } catch (error) {
        console.error("Error loading hospital phone:", error);
        setHospitalPhone(null);
      } finally {
        setLoadingHospitalPhone(false);
      }
    };

    loadHospitalPhone();
  }, [resolvedHospital?.code, selectedSpecialtyKey]);

  const handleStreetChange = (text: string) => {
    setStreetQ(text);
    setStreetOpen(true);
    setKommuneOpen(false);
    setByenCatOpen(false);
    setRegCatOpen(false);

    const exactStreet = STREET_SAMPLE.find(
      (row) => norm(row.street) === norm(text),
    );

    if (exactStreet) {
      setSelectedStreet(exactStreet.street);
      const officialBydel = mapStreetBydelToOfficialBydel(exactStreet.bydel);
      setBydel(officialBydel || "");
    } else if (!text.trim()) {
      setSelectedStreet("");
      setBydel("");
    } else {
      setSelectedStreet("");
      setBydel("");
    }
  };

  const handleKommuneChange = (text: string) => {
    setKommuneQ(text);
    setKommuneOpen(true);
    setStreetOpen(false);
    setByenCatOpen(false);
    setRegCatOpen(false);

    const exactKommune = ALL_KOMMUNER.find((k) => norm(k) === norm(text));

    if (exactKommune) {
      setKommune(exactKommune);
    } else if (!text.trim()) {
      setKommune("");
    } else {
      setKommune("");
    }
  };

  const detectLocation = async () => {
    if (detectedArea) {
      Alert.alert(
        t("dest_loc_error_title"),
        "Lokation er allerede fundet. Ryd lokationen først, hvis du vil hente den igen.",
      );
      return;
    }

    if (detectingLocation) return;

    try {
      setDetectingLocation(true);

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          t("dest_loc_error_title"),
          "Location services are turned off on this device.",
        );
        return;
      }

      const existingPerm = await Location.getForegroundPermissionsAsync();
      let granted = existingPerm.granted;

      if (!granted) {
        const requestedPerm =
          await Location.requestForegroundPermissionsAsync();
        granted = requestedPerm.granted;
      }

      if (!granted) {
        Alert.alert(t("dest_loc_perm_title"), t("dest_loc_perm_body"));
        return;
      }

      if (Platform.OS === "android") {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          // ignore
        }
      }

      let pos = await Location.getLastKnownPositionAsync({
        maxAge: 60_000,
        requiredAccuracy: 200,
      });

      if (!pos) {
        pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const geocoded = await getReverseGeocodeSafely(lat, lon);
      const first = geocoded[0];

      if (!first) {
        Alert.alert(t("dest_loc_notfound_title"), t("dest_loc_notfound_body"));
        return;
      }

      const postcode = String(first.postalCode ?? "").trim();
      const city = String(first.city ?? "").trim();
      const district = String(first.district ?? "").trim();
      const subregion = String(first.subregion ?? "").trim();
      const street = String(first.street ?? "").trim();
      const region = String(first.region ?? "").trim();
      const name = String(first.name ?? "").trim();

      setDetectedArea({
        label: [street || name, district, city || subregion || region, postcode]
          .filter(Boolean)
          .join(", "),
        postcode,
        city: city || subregion || region,
        district,
        subregion: subregion || region,
      });

      if (area === "byen") {
        if (street) {
          const streetMatch = STREET_SAMPLE.find(
            (row) => norm(row.street) === norm(street),
          );

          if (streetMatch) {
            const officialBydel = mapStreetBydelToOfficialBydel(
              streetMatch.bydel,
            );

            setSelectedStreet(streetMatch.street);
            setStreetQ(streetMatch.street);
            setBydel(officialBydel || "");
            closeAllDropdowns();
            return;
          }
        }

        const mappedBydel = mapPostcodeToBydel(postcode);
        const officialBydel = mapKommuneByenToOfficialBydel(mappedBydel);

        if (officialBydel) {
          setBydel(officialBydel);
          setSelectedStreet("");
          setStreetQ("");
          closeAllDropdowns();
        } else {
          Alert.alert(
            t("dest_area_notmapped_title"),
            t("dest_area_notmapped_body"),
          );
        }
      } else {
        const mappedKommune = mapRegionCityToKommune(
          city || district || subregion || region,
          subregion || region,
        );

        if (mappedKommune) {
          setKommune(mappedKommune);
          setKommuneQ(mappedKommune);
          closeAllDropdowns();
        } else {
          Alert.alert(
            t("dest_kommune_notmapped_title"),
            `Could not map location.\n\ncity: ${city}\ndistrict: ${district}\nsubregion: ${subregion}\nregion: ${region}\npostcode: ${postcode}`,
          );
        }
      }
    } catch (error: any) {
      const message = String(error?.message ?? "");
      const lower = message.toLowerCase();

      if (
        lower.includes("rate limit") ||
        lower.includes("too many requests") ||
        lower.includes("midlertidigt blokeret")
      ) {
        Alert.alert(
          t("dest_loc_error_title"),
          "iPhone-adresseopslag er midlertidigt begrænset. Vent lidt og prøv igen.",
        );
      } else if (lower.includes("cooldown") || lower.includes("på cooldown")) {
        Alert.alert(t("dest_loc_error_title"), message);
      } else {
        Alert.alert(
          t("dest_loc_error_title"),
          message || t("dest_loc_error_body"),
        );
      }

      console.log("detectLocation error:", error);
    } finally {
      setDetectingLocation(false);
    }
  };

  const showNeurokirNote = area === "region" && regCat === "neurokirurgi";
  const neurokirNote = t("dest_region_neurokir_note" as any);

  const fallbackSources = [
    {
      id: "dest-fallback-1",
      title:
        lang === "da"
          ? "Visitationsoversigt – Byen"
          : "Destination overview – Byen",
      subtitle:
        lang === "da"
          ? "Kildegrundlag for visitation i København/Byen. Gældende detaljer, version og revisionsoplysninger fremgår af kildedokumentet."
          : "Source basis for destination guidance in Copenhagen/Byen. Current details, version, and revision information are shown in the source document.",
      url: VISITATION_BYEN_URL,
    },
    {
      id: "dest-fallback-2",
      title:
        lang === "da"
          ? "Visitationsoversigt – Regionen"
          : "Destination overview – Regionen",
      subtitle:
        lang === "da"
          ? "Kildegrundlag for visitation i regionen uden for Byen. Gældende detaljer, version og revisionsoplysninger fremgår af kildedokumentet."
          : "Source basis for destination guidance in the wider region outside Byen. Current details, version, and revision information are shown in the source document.",
      url: VISITATION_REGIONEN_URL,
    },
    {
      id: "dest-fallback-3",
      title:
        lang === "da"
          ? "Klinisk verifikation kræves"
          : "Clinical verification required",
      subtitle:
        lang === "da"
          ? "Resultater i dette værktøj er vejledende og skal altid verificeres mod gældende officielle visitationsretningslinjer, lokale instrukser og klinisk vurdering."
          : "Results in this tool are advisory and must always be verified against current official destination guidance, local instructions, and clinical judgement.",
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
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("dest_title")}</Title>
          <Subtle>{t("dest_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <Title>{t("dest_function_title")}</Title>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable
                onPress={() => switchMode("gps")}
                style={chip(mode === "gps")}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  GPS
                </Text>
              </Pressable>

              <Pressable
                onPress={() => switchMode("search")}
                style={chip(mode === "search")}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  Søg
                </Text>
              </Pressable>
            </View>

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

            <View style={{ marginTop: 14 }}>
              {area === "byen" ? (
                <SimpleDropdown<ByenCategory>
                  label={t("dest_category")}
                  value={byenCat}
                  open={byenCatOpen}
                  onToggle={toggleByenCatDropdown}
                  options={BYEN_CATEGORIES.map((c) => c.key) as ByenCategory[]}
                  onSelect={(value) => {
                    setByenCat(value);
                    setByenCatOpen(false);
                  }}
                  renderValue={(value) => {
                    const item = BYEN_CATEGORIES.find((c) => c.key === value);
                    return item ? t(item.labelKey as any) : value;
                  }}
                  placeholder={t("dest_category")}
                  maxHeight={220}
                />
              ) : (
                <>
                  <SimpleDropdown<RegionCategory>
                    label={t("dest_category")}
                    value={regCat}
                    open={regCatOpen}
                    onToggle={toggleRegCatDropdown}
                    options={regionCategoryOptions}
                    onSelect={(value) => {
                      setRegCat(value);
                      setRegCatOpen(false);
                    }}
                    renderValue={(value) =>
                      getRegionCategoryLabel(t as TranslateFn, value)
                    }
                    placeholder={t("dest_category")}
                    maxHeight={220}
                  />

                  <Text style={{ color: theme.colors.mutedText, marginTop: 8 }}>
                    {t("dest_region_note")}
                  </Text>

                  {showNeurokirNote && (
                    <Text
                      style={{ color: theme.colors.mutedText, marginTop: 4 }}
                    >
                      {neurokirNote === "dest_region_neurokir_note"
                        ? t("dest_region_neurokir_note_fallback")
                        : neurokirNote}
                    </Text>
                  )}
                </>
              )}
            </View>
          </Card>

          {mode === "gps" && (
            <Card>
              <View style={{ gap: 10 }}>
                <Pressable
                  onPress={detectLocation}
                  disabled={detectingLocation}
                  style={({ pressed }) => [
                    chip(false),
                    {
                      opacity: detectingLocation ? 0.6 : pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                    {detectingLocation
                      ? t("dest_detecting")
                      : t("dest_use_location_btn")}
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
                        {t("dest_detected")}
                      </Text>

                      <Text style={{ color: theme.colors.mutedText }}>
                        {detectedArea.label || t("dest_unknown_area")}
                      </Text>

                      {area === "byen" && !!bydel && (
                        <Text style={{ color: theme.colors.mutedText }}>
                          {t("dest_using_bydel")}{" "}
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
                          {t("dest_using_kommune")}{" "}
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
                        style={{
                          color: theme.colors.text,
                          fontWeight: "800",
                        }}
                      >
                        {t("dest_clear_location")}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </Card>
          )}

          {mode === "search" && area === "byen" && (
            <Card>
              <View style={{ gap: 14 }}>
                <View style={{ gap: 8 }}>
                  <Label>{t("dest_street_placeholder")}</Label>
                  <Input
                    value={streetQ}
                    onChangeText={handleStreetChange}
                    placeholder={t("dest_street_placeholder")}
                    keyboardType="default"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <SimpleDropdown<string>
                  label={t("dest_find_street")}
                  value={selectedStreet}
                  open={streetOpen}
                  onToggle={toggleStreetDropdown}
                  options={streetOptions}
                  onSelect={(value) => {
                    const match = STREET_SAMPLE.find(
                      (row) => norm(row.street) === norm(value),
                    );

                    setSelectedStreet(value);
                    setStreetQ(value);
                    setStreetOpen(false);

                    if (match) {
                      const officialBydel = mapStreetBydelToOfficialBydel(
                        match.bydel,
                      );
                      setBydel(officialBydel || "");
                    } else {
                      setBydel("");
                    }
                  }}
                  placeholder={t("dest_street_placeholder")}
                  emptyText={t("dest_no_street_match")}
                  maxHeight={220}
                />
              </View>
            </Card>
          )}

          {mode === "search" && area === "region" && (
            <Card>
              <View style={{ gap: 14 }}>
                <View style={{ gap: 8 }}>
                  <Label>{t("dest_kommune")}</Label>
                  <Input
                    value={kommuneQ}
                    onChangeText={handleKommuneChange}
                    placeholder={t("dest_kommune")}
                    keyboardType="default"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <SimpleDropdown<Kommune>
                  label={t("dest_kommune")}
                  value={kommune}
                  open={kommuneOpen}
                  onToggle={toggleKommuneDropdown}
                  options={kommuneOptions as Kommune[]}
                  onSelect={(value) => {
                    setKommune(value);
                    setKommuneQ(value);
                    setKommuneOpen(false);
                  }}
                  placeholder={t("dest_kommune")}
                  emptyText={t("dest_no_kommune_match")}
                  maxHeight={220}
                />
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
                    gap: 8,
                  }}
                >
                  {loadingHospitalPhone ? (
                    <Text style={{ color: theme.colors.mutedText }}>
                      Henter telefonnummer...
                    </Text>
                  ) : hospitalPhone ? (
                    <View
                      style={{
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: theme.colors.mutedText }}>
                        Telefonnummer:{" "}
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {hospitalPhone.phone}
                        </Text>
                      </Text>

                      <Text
                        style={{ color: theme.colors.mutedText, fontSize: 12 }}
                      >
                        {hospitalPhone.specialtyKey === "main"
                          ? "Specialenummer ikke fundet – viser hospitalets hovednummer."
                          : `Viser: ${hospitalPhone.displayNameDa}`}
                      </Text>

                      <Pressable
                        onPress={() => callHospitalNumber(hospitalPhone.phone)}
                        style={chip(false)}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          Ring op
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={{ color: theme.colors.mutedText }}>
                      Intet telefonnummer fundet endnu.
                    </Text>
                  )}

                  <Text
                    style={{
                      color: theme.colors.mutedText,
                      fontSize: 12,
                      lineHeight: 17,
                      marginTop: 4,
                    }}
                  >
                    {t("dest_result_disclaimer")}
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

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={reference?.disclaimer[lang] ?? t("dest_page_disclaimer")}
          >
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(255,209,102,0.10)",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {reference?.disclaimer[lang] ?? t("dest_page_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={reference?.sourcesSub[lang] ?? t("dest_sources_sub")}
          >
            <Subtle style={{ marginBottom: 8 }}>
              {reference?.sourcesSub[lang] ?? t("dest_sources_sub")}
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
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
