import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { resolveHospitalCode } from "../../src/domain/destination/resolution";
import {
  parseHouseNumber,
  parseStreetName,
} from "../../src/domain/destination/address";
import {
  classifyLocationConfidence,
  isAcceptableCachedLocation,
  isAccurateEnough,
  LOCATION_POLICY,
  withTimeout,
} from "../../src/domain/destination/locationPolicy";
import {
  getReference,
  type ReferenceDoc,
} from "../../src/services/referenceService";
import {
  loadVisitationData,
  LOCAL_VISITATION_DATA,
  type BackendVisitationData,
} from "../../src/services/visitationService";
import { useSettings } from "../../src/state/settings";
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
  StreetSide,
} from "../../src/features/destination/types";

import {
  hospitalLabel,
  mapRegionCityToKommune,
  norm,
  resolveStreetRoute,
} from "../../src/features/destination/helpers";

import {
  getHospitalPhoneNumbersByCode,
  type HospitalPhoneNumber,
} from "../../src/dev/hospitalNumbers";

import { chip } from "../../src/features/destination/ui";

type TranslateFn = (key: any) => string;
type PhoneOptionValue = string;
type LocationStatus =
  | "initial"
  | "permission"
  | "locating"
  | "resolving"
  | "matched"
  | "permission_denied"
  | "services_disabled"
  | "timeout"
  | "poor_accuracy"
  | "geocode_failed"
  | "not_found"
  | "error";

const MANUAL_HOSPITAL_CODES: HospitalCode[] = [
  "AMH", "BBH", "FRH", "GEH", "GLO", "HEH", "HVH", "NOH", "RH",
];

const VISITATION_BYEN_URL =
  "https://drive.google.com/file/d/18gnYztqAw40PxuGuP5N_iEDmksYk-eIX/view?usp=sharing";

const VISITATION_REGIONEN_URL =
  "https://drive.google.com/file/d/1HS25c5EPt1oP3WbzT6jA99TMiprOgvVh/view?usp=sharing";

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

const MOST_USED_REGION_CATEGORIES: RegionCategory[] = [
  "akutmodtagelse",
  "apopleksi_ekskl_trombolyse",
  "neurologi_ekskl_apopleksi",
  "paediatri",
  "traumecenter",
];

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

function sideLabel(side: StreetSide) {
  return side === "even" ? "Lige" : "Ulige";
}

type ResolvedHospital = {
  code: HospitalCode;
  label: string;
  extra: string;
};

type DropdownSection<T extends string> = {
  title: string;
  options: readonly T[];
};

type SimpleDropdownProps<T extends string> = {
  label?: string;
  value: T | "";
  open: boolean;
  onToggle: () => void;
  options: readonly T[];
  sections?: DropdownSection<T>[];
  onSelect: (value: T) => void;
  renderValue?: (value: T) => ReactNode;
  renderOption?: (value: T, selected: boolean) => ReactNode;
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
  sections,
  onSelect,
  renderValue,
  renderOption,
  placeholder = "Choose...",
  emptyText = "No matches found.",
  maxHeight = 220,
}: SimpleDropdownProps<T>) {
  const displayValue =
    value && renderValue ? renderValue(value) : value || placeholder;

  const hasSections = !!sections && sections.length > 0;
  const hasOptions = hasSections
    ? sections.some((section) => section.options.length > 0)
    : options.length > 0;

  const renderDropdownOption = (option: T) => {
    const selected = value === option;

    return (
      <Pressable
        key={option}
        onPress={() => onSelect(option)}
        style={{
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 12,
          backgroundColor: selected ? "rgba(220,220,220,0.18)" : "transparent",
        }}
      >
        {renderOption ? (
          renderOption(option, selected)
        ) : (
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: selected ? "800" : "700",
            }}
          >
            {renderValue ? renderValue(option) : option}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ gap: 8 }}>
      {!!label && <Label>{label}</Label>}

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            {typeof displayValue === "string" ? (
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                {displayValue}
              </Text>
            ) : (
              displayValue
            )}
          </View>

          <Text style={{ color: theme.colors.mutedText }}>
            {open ? "▲" : "▼"}
          </Text>
        </View>
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
          {!hasOptions ? (
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
              {hasSections
                ? sections
                    ?.filter((section) => section.options.length > 0)
                    .map((section) => (
                      <View key={section.title} style={{ gap: 6 }}>
                        <Text
                          style={{
                            color: theme.colors.mutedText,
                            fontSize: 12,
                            fontWeight: "900",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            paddingHorizontal: 8,
                            paddingTop: 6,
                          }}
                        >
                          {section.title}
                        </Text>

                        {section.options.map(renderDropdownOption)}
                      </View>
                    ))
                : options.map(renderDropdownOption)}
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

  const [visitationData, setVisitationData] = useState<BackendVisitationData>(
    LOCAL_VISITATION_DATA,
  );

  const BYEN_CATEGORIES = visitationData.byen.categories;
  const BYEN_MAP = visitationData.byen.map;
  const STREET_SAMPLE = visitationData.byen.streetSample;
  const REGION_ALL_MAP = visitationData.region.map;
  const ALL_KOMMUNER = Object.keys(REGION_ALL_MAP) as Kommune[];

  const [reference, setReference] = useState<ReferenceDoc | null>(null);

  const [area, setArea] = useState<Area>("region");
  const [searchVisible, setSearchVisible] = useState(false);

  const [bydel, setBydel] = useState<Bydel | "">("");
  const [kommune, setKommune] = useState<Kommune | "">("");
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  const [streetSide, setStreetSide] = useState<StreetSide | "">("");
  const [streetRouteNeedsSide, setStreetRouteNeedsSide] = useState(false);
  const [streetRouteNeedsHouseNumber, setStreetRouteNeedsHouseNumber] = useState(false);
  const [streetRouteNeedsPostalCode, setStreetRouteNeedsPostalCode] = useState(false);
  const [streetRouteMessage, setStreetRouteMessage] = useState("");

  const [byenCat, setByenCat] = useState<ByenCategory>("hospital");
  const [regCat, setRegCat] = useState<RegionCategory>("akutmodtagelse");

  const [streetQ, setStreetQ] = useState("");
  const [houseNumberQ, setHouseNumberQ] = useState("");
  const [postalCodeQ, setPostalCodeQ] = useState("");
  const [kommuneQ, setKommuneQ] = useState("");

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedArea, setDetectedArea] = useState<DetectedArea | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("initial");
  const [locationMessage, setLocationMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown>>({});
  const locationRequestRef = useRef(0);
  const locationInFlightRef = useRef(false);
  const locationMountedRef = useRef(true);

  const [streetOpen, setStreetOpen] = useState(false);
  const [kommuneOpen, setKommuneOpen] = useState(false);
  const [byenCatOpen, setByenCatOpen] = useState(false);
  const [regCatOpen, setRegCatOpen] = useState(false);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [manualHospitalOpen, setManualHospitalOpen] = useState(false);
  const [manualHospitalCode, setManualHospitalCode] = useState<HospitalCode | "">("");

  const [hospitalPhones, setHospitalPhones] = useState<HospitalPhoneNumber[]>(
    [],
  );
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>("");
  const [loadingHospitalPhones, setLoadingHospitalPhones] = useState(false);

  const selectedSpecialtyKey = area === "byen" ? byenCat : regCat;
  const selectedCategoryLabel = area === "byen"
    ? t(BYEN_CATEGORIES.find((item) => item.key === byenCat)?.labelKey as any)
    : getRegionCategoryLabel(t as TranslateFn, regCat);

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
  const GEOCODE_CACHE_DISTANCE = 0.0005;

  useEffect(() => {
    locationMountedRef.current = true;
    return () => {
      locationMountedRef.current = false;
      locationRequestRef.current += 1;
      locationInFlightRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const data = await loadVisitationData();
      if (!active) return;
      setVisitationData(data);
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

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
    setPhoneDropdownOpen(false);
    setManualHospitalOpen(false);
  };

  const resetStreetRouteState = () => {
    setStreetSide("");
    setStreetRouteNeedsSide(false);
    setStreetRouteNeedsHouseNumber(false);
    setStreetRouteNeedsPostalCode(false);
    setStreetRouteMessage("");
  };

  const resetSelectionState = () => {
    setDetectedArea(null);
    setBydel("");
    setKommune("");
    setSelectedStreet("");
    setStreetQ("");
    setHouseNumberQ("");
    setPostalCodeQ("");
    setKommuneQ("");
    resetStreetRouteState();
    setHospitalPhones([]);
    setSelectedPhoneId("");
    setManualHospitalCode("");
    setLocationStatus("initial");
    setLocationMessage("");
    setDiagnostics({});
    closeAllDropdowns();
  };

  const switchArea = (nextArea: Area) => {
    setArea(nextArea);
    resetSelectionState();
  };

  const toggleSearchVisible = () => {
    setSearchVisible((prev) => {
      const next = !prev;
      closeAllDropdowns();
      return next;
    });
  };

  const toggleStreetDropdown = () => {
    setStreetOpen((prev) => {
      const next = !prev;
      if (next) {
        setKommuneOpen(false);
        setByenCatOpen(false);
        setRegCatOpen(false);
        setPhoneDropdownOpen(false);
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
        setPhoneDropdownOpen(false);
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
        setPhoneDropdownOpen(false);
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
        setPhoneDropdownOpen(false);
      }
      return next;
    });
  };

  const togglePhoneDropdown = () => {
    setPhoneDropdownOpen((prev) => {
      const next = !prev;
      if (next) {
        setStreetOpen(false);
        setKommuneOpen(false);
        setByenCatOpen(false);
        setRegCatOpen(false);
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
  }, [STREET_SAMPLE, streetQ]);

  const kommuneOptions = useMemo(() => {
    const q = norm(kommuneQ);
    const all = [...ALL_KOMMUNER].sort((a, b) => a.localeCompare(b, "da"));

    if (!q) return all;
    return all.filter((k) => norm(k).includes(q));
  }, [ALL_KOMMUNER, kommuneQ]);

  const regionCategoryOptions = useMemo(() => {
    const backendKeys = visitationData.region.categories
      .map((item) => item.key as RegionCategory)
      .filter((key) => !!REGION_CATEGORY_LABEL_KEYS[key]);

    const keys =
      backendKeys.length > 0
        ? backendKeys
        : (Object.keys(REGION_CATEGORY_LABEL_KEYS) as RegionCategory[]);

    return [...keys].sort((a, b) =>
      getRegionCategoryLabel(t as TranslateFn, a).localeCompare(
        getRegionCategoryLabel(t as TranslateFn, b),
        "da",
      ),
    );
  }, [t, visitationData.region.categories]);

  const regionCategorySections = useMemo(() => {
    const mostUsed = MOST_USED_REGION_CATEGORIES.filter((category) =>
      regionCategoryOptions.includes(category),
    );

    const other = regionCategoryOptions.filter(
      (category) => !MOST_USED_REGION_CATEGORIES.includes(category),
    );

    return [
      {
        title: lang === "da" ? "Mest brugt" : "Most used",
        options: mostUsed,
      },
      {
        title: lang === "da" ? "Øvrige" : "Other",
        options: other,
      },
    ];
  }, [lang, regionCategoryOptions]);

  const applyStreetRoute = (
    street: string,
    side: StreetSide | "" = "",
    houseNumber?: number,
    postalCode?: string,
  ) => {
    const result = resolveStreetRoute(
      STREET_SAMPLE,
      street,
      side,
      houseNumber,
      postalCode,
    );

    setDetectedArea(null);
    setSelectedStreet(street);
    setStreetQ(street);

    if (result.status === "single") {
      setBydel(result.officialBydel);
      setStreetRouteNeedsSide(false);
      setStreetRouteNeedsHouseNumber(false);
      setStreetRouteNeedsPostalCode(false);
      setStreetRouteMessage("");
      setDiagnostics((current) => ({
        ...current,
        normalizedStreetKey: norm(street),
        matchStatus: result.status,
        matchType: result.matchType,
        matchedRule: result.matchedRule,
        destinationDistrict: result.officialBydel,
      }));
      return true;
    }

    if (
      result.status === "needs_side" ||
      result.status === "needs_house_number" ||
      result.status === "needs_postal_code" ||
      result.status === "still_ambiguous"
    ) {
      setBydel("");
      setStreetRouteNeedsSide(result.status === "needs_side");
      setStreetRouteNeedsHouseNumber(result.status === "needs_house_number");
      setStreetRouteNeedsPostalCode(result.status === "needs_postal_code");
      setStreetRouteMessage(result.message);
      setDiagnostics((current) => ({
        ...current,
        normalizedStreetKey: norm(street),
        matchStatus: result.status,
        matchFailure: result.message,
      }));
      return false;
    }

    setBydel("");
    setStreetRouteNeedsSide(false);
    setStreetRouteNeedsHouseNumber(false);
    setStreetRouteNeedsPostalCode(false);
    setStreetRouteMessage(result.message);
    setDiagnostics((current) => ({
      ...current,
      normalizedStreetKey: norm(street),
      matchStatus: result.status,
      matchFailure: result.message,
    }));
    return false;
  };

  const selectStreetSide = (side: StreetSide) => {
    setStreetSide(side);

    const street = selectedStreet || streetQ;
    if (!street) return;

    const number = parseHouseNumber(houseNumberQ).number;
    applyStreetRoute(
      street,
      side,
      number,
      postalCodeQ || undefined,
    );
  };

  const resolvedHospital = useMemo<ResolvedHospital | null>(() => {
    if (manualHospitalCode) {
      return {
        code: manualHospitalCode,
        label: hospitalLabel(t as TranslateFn, manualHospitalCode),
        extra: lang === "da" ? "Valgt manuelt" : "Selected manually",
      };
    }
    if (area === "byen") {
      if (!bydel) return null;

      const selectedBydel = bydel as Bydel;
      const code =
        resolveHospitalCode({
          area: "byen",
          bydel: selectedBydel,
          category: byenCat,
          map: BYEN_MAP,
        }) ?? "UNKNOWN";

      const streetExtra = selectedStreet
        ? `${selectedStreet}${streetSide ? ` (${sideLabel(streetSide).toLowerCase()})` : ""} • ${selectedBydel}`
        : selectedBydel;

      return {
        code,
        label: hospitalLabel(t as TranslateFn, code),
        extra: streetExtra,
      };
    }

    if (!kommune) return null;

    const selectedKommune = kommune as Kommune;
    const code =
      resolveHospitalCode({
        area: "region",
        kommune: selectedKommune,
        category: regCat,
        map: REGION_ALL_MAP,
      }) ?? "UNKNOWN";

    return {
      code,
      label: hospitalLabel(t as TranslateFn, code),
      extra: selectedKommune,
    };
  }, [
    area,
    bydel,
    kommune,
    selectedStreet,
    streetSide,
    byenCat,
    regCat,
    t,
    BYEN_MAP,
    REGION_ALL_MAP,
    manualHospitalCode,
    lang,
  ]);

  useEffect(() => {
    const loadHospitalPhones = async () => {
      if (!resolvedHospital || resolvedHospital.code === "UNKNOWN") {
        setHospitalPhones([]);
        setSelectedPhoneId("");
        setLoadingHospitalPhones(false);
        return;
      }

      setLoadingHospitalPhones(true);

      try {
        const results = await getHospitalPhoneNumbersByCode(
          resolvedHospital.code,
        );

        setHospitalPhones(results);

        const preferred =
          results.find((item) => item.specialtyKey === selectedSpecialtyKey) ??
          results.find((item) => item.specialtyKey === "main") ??
          results[0] ??
          null;

        setSelectedPhoneId(preferred?.id ?? "");
      } catch (error) {
        console.error("Error loading hospital phones:", error);
        setHospitalPhones([]);
        setSelectedPhoneId("");
      } finally {
        setLoadingHospitalPhones(false);
      }
    };

    loadHospitalPhones();
  }, [resolvedHospital?.code, selectedSpecialtyKey]);

  const selectedHospitalPhone = useMemo(() => {
    return hospitalPhones.find((item) => item.id === selectedPhoneId) ?? null;
  }, [hospitalPhones, selectedPhoneId]);

  const phoneOptions = useMemo(() => {
    return hospitalPhones.map((item) => item.id);
  }, [hospitalPhones]);

  const getPhoneDisplayName = (item: HospitalPhoneNumber) => {
    const preferredName =
      lang === "da"
        ? item.displayNameDa || item.displayNameEn
        : item.displayNameEn || item.displayNameDa;

    return preferredName || fallbackLabelFromKey(item.specialtyKey || "main");
  };

  const renderPhoneSelectedValue = (id: string) => {
    const item = hospitalPhones.find((row) => row.id === id);
    if (!item) {
      return (
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {id}
        </Text>
      );
    }

    return (
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
        {getPhoneDisplayName(item)}
      </Text>
    );
  };

  const renderPhoneOptionRow = (id: string, selected: boolean) => {
    const item = hospitalPhones.find((row) => row.id === id);

    if (!item) {
      return (
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: selected ? "800" : "700",
          }}
        >
          {id}
        </Text>
      );
    }

    return (
      <View style={{ gap: 2 }}>
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: selected ? "800" : "700",
            fontSize: 16,
            lineHeight: 20,
          }}
        >
          {getPhoneDisplayName(item)}
        </Text>

        <Text
          style={{
            color: theme.colors.mutedText,
            fontWeight: "600",
            fontSize: 16,
            lineHeight: 20,
          }}
        >
          {item.phone}
        </Text>
      </View>
    );
  };

  const handleStreetChange = (text: string) => {
    setStreetQ(text);
    setStreetOpen(true);
    setKommuneOpen(false);
    setByenCatOpen(false);
    setRegCatOpen(false);
    setPhoneDropdownOpen(false);
    setStreetSide("");
    setStreetRouteNeedsSide(false);
    setStreetRouteNeedsHouseNumber(false);
    setStreetRouteMessage("");

    const parsedStreet = parseStreetName(undefined, text) ?? text;
    const exactStreet = STREET_SAMPLE.find(
      (row) => norm(row.street) === norm(parsedStreet),
    );

    if (exactStreet) {
      const parsed = parseHouseNumber(text);
      if (parsed.number) setHouseNumberQ(String(parsed.number));
      applyStreetRoute(
        exactStreet.street,
        "",
        parsed.number,
        postalCodeQ || undefined,
      );
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
    setPhoneDropdownOpen(false);

    const exactKommune = ALL_KOMMUNER.find((k) => norm(k) === norm(text));

    if (exactKommune) {
      setDetectedArea(null);
      setKommune(exactKommune);
    } else {
      setKommune("");
    }
  };

  const detectLocation = async () => {
    if (locationInFlightRef.current) return;
    locationInFlightRef.current = true;
    const requestId = ++locationRequestRef.current;

    try {
      setDetectingLocation(true);
      setLocationMessage("");
      setLocationStatus("permission");

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationMountedRef.current || requestId !== locationRequestRef.current) return;
      if (!servicesEnabled) {
        setLocationStatus("services_disabled");
        setLocationMessage(
          lang === "da"
            ? "Placeringstjenester er slået fra. Slå dem til, prøv igen, eller vælg hospital manuelt."
            : "Location services are off. Enable them, retry, or choose a hospital manually.",
        );
        return;
      }

      const existingPerm = await Location.getForegroundPermissionsAsync();
      if (!locationMountedRef.current || requestId !== locationRequestRef.current) return;
      let granted = existingPerm.granted;

      if (!granted) {
        const requestedPerm =
          await Location.requestForegroundPermissionsAsync();
        if (!locationMountedRef.current || requestId !== locationRequestRef.current) return;
        granted = requestedPerm.granted;
      }

      if (!granted) {
        setLocationStatus("permission_denied");
        setLocationMessage(t("dest_loc_perm_body"));
        return;
      }

      if (Platform.OS === "android") {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          // ignore
        }
      }

      setLocationStatus("locating");
      const locationStartedAt = Date.now();
      let pos: Location.LocationObject | null = null;
      let locationSource: "fresh" | "cached" = "fresh";
      let timedOut = false;

      for (let attempt = 0; attempt <= LOCATION_POLICY.retryCount; attempt += 1) {
        try {
          const candidate = await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          );
          pos = candidate;
          if (isAccurateEnough(candidate)) break;
        } catch (error) {
          timedOut = String((error as Error)?.message).includes("LOCATION_TIMEOUT");
        }
      }

      if (!pos || !isAccurateEnough(pos)) {
        const cached = await Location.getLastKnownPositionAsync({
          maxAge: LOCATION_POLICY.maximumCachedAgeMs,
          requiredAccuracy: LOCATION_POLICY.maximumAccuracyMeters,
        });
        if (cached && isAcceptableCachedLocation(cached)) {
          pos = cached;
          locationSource = "cached";
        }
      }

      if (!pos) {
        setLocationStatus(timedOut ? "timeout" : "error");
        setLocationMessage(
          timedOut
            ? "GPS svarede ikke inden for 12 sekunder. Prøv igen, eller vælg hospital manuelt."
            : t("dest_loc_error_body"),
        );
        return;
      }

      if (!isAccurateEnough(pos)) {
        setDiagnostics({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          locationSource,
          cachedAgeMs:
            locationSource === "cached"
              ? Math.max(0, Date.now() - pos.timestamp)
              : 0,
          locationDurationMs: Date.now() - locationStartedAt,
          confidence: "poor",
          matchFailure: "GPS accuracy exceeds the safe reverse-geocoding gate.",
        });
        setLocationStatus("poor_accuracy");
        setLocationMessage(
          `GPS-usikkerheden er ${Math.round(pos.coords.accuracy ?? 0)} meter. Det er for upræcist til sikker gadevisitation.`,
        );
        return;
      }

      if (requestId !== locationRequestRef.current) return;

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const cachedAgeMs =
        locationSource === "cached" ? Math.max(0, Date.now() - pos.timestamp) : 0;

      setDiagnostics({
        latitude: lat,
        longitude: lon,
        accuracyMeters: accuracy,
        locationSource,
        cachedAgeMs,
        locationDurationMs: Date.now() - locationStartedAt,
      });

      setLocationStatus("resolving");
      const reverseGeocodeStartedAt = Date.now();
      const geocoded = await withTimeout(getReverseGeocodeSafely(lat, lon));
      if (!locationMountedRef.current || requestId !== locationRequestRef.current) return;
      const first = geocoded[0];

      if (!first) {
        setLocationStatus("geocode_failed");
        setLocationMessage(t("dest_loc_notfound_body"));
        return;
      }

      const postcode = String(first.postalCode ?? "").trim();
      const city = String(first.city ?? "").trim();
      const district = String(first.district ?? "").trim();
      const subregion = String(first.subregion ?? "").trim();
      const formattedAddress = String(first.formattedAddress ?? "").trim();
      const street = parseStreetName(first.street, formattedAddress) ?? "";
      const parsedNumber = parseHouseNumber(first.name, formattedAddress);
      const region = String(first.region ?? "").trim();
      const name = String(first.name ?? "").trim();

      setDiagnostics((current) => ({
        ...current,
        reverseGeocodeDurationMs: Date.now() - reverseGeocodeStartedAt,
        rawReverseGeocode: first,
        parsedStreet: street,
        parsedHouseNumber: parsedNumber.number,
        parsedPostalCode: postcode,
        normalizedStreetKey: norm(street),
      }));

      const detectedAreaBase = {
        label: [street || name, district, city || subregion || region, postcode]
          .filter(Boolean)
          .join(", "),
        street,
        houseNumber: parsedNumber.number,
        postcode,
        city: city || subregion || region,
        district,
        subregion: subregion || region,
        accuracyMeters: accuracy ?? undefined,
        locationSource,
        cachedAgeMs,
      } as const;

      if (area === "byen") {
        if (street) {
          const routeResult = resolveStreetRoute(
            STREET_SAMPLE,
            street,
            "",
            parsedNumber.number,
            postcode || undefined,
          );
          const confidence = classifyLocationConfidence({
            accuracy,
            hasStreet: true,
            hasCompleteRoutingAddress: routeResult.status === "single",
          });
          setDetectedArea({ ...detectedAreaBase, confidence });

          if (routeResult.status === "single") {
            setSelectedStreet(street);
            setStreetQ(street);
            setStreetSide("");
            setBydel(routeResult.officialBydel);
            setStreetRouteNeedsSide(false);
            setStreetRouteNeedsHouseNumber(false);
            setStreetRouteNeedsPostalCode(false);
            setStreetRouteMessage("");
            setDiagnostics((current) => ({
              ...current,
              confidence,
              matchStatus: routeResult.status,
              matchType: routeResult.matchType,
              matchedRule: routeResult.matchedRule,
              destinationDistrict: routeResult.officialBydel,
            }));
            closeAllDropdowns();
            setLocationStatus("matched");
            setLocationMessage(
              confidence === "medium"
                ? "Adressen blev fundet, men GPS-præcisionen er middel. Kontrollér den viste adresse, eller ret den i gadesøgningen."
                : "",
            );
            return;
          }

          if (
            routeResult.status === "needs_side" ||
            routeResult.status === "needs_house_number" ||
            routeResult.status === "needs_postal_code" ||
            routeResult.status === "still_ambiguous"
          ) {
            setSelectedStreet(street);
            setStreetQ(street);
            setStreetSide("");
            setBydel("");
            setStreetRouteNeedsSide(routeResult.status === "needs_side");
            setStreetRouteNeedsHouseNumber(
              routeResult.status === "needs_house_number",
            );
            setStreetRouteNeedsPostalCode(
              routeResult.status === "needs_postal_code",
            );
            setStreetRouteMessage(routeResult.message);
            setLocationStatus("not_found");
            setSearchVisible(true);
            setLocationMessage(
              routeResult.status === "needs_house_number"
                ? "Gaden er genkendt, men husnummeret mangler. Indtast det nedenfor, eller vælg hospital manuelt."
                : routeResult.status === "needs_postal_code"
                  ? "Gaden er genkendt, men postnummeret skal bekræftes. Indtast det nedenfor, eller vælg hospital manuelt."
                  : "Gaden er genkendt, men PDF-reglen giver ikke ét sikkert resultat. Ret adressen, eller vælg hospital manuelt.",
            );
            closeAllDropdowns();
            return;
          }

          setLocationStatus("not_found");
          setSearchVisible(true);
          setLocationMessage(
            "Vejen findes ikke i den officielle visitationstabel. Søg adressen manuelt, prøv GPS igen, eller vælg hospital manuelt.",
          );
          return;
        }

        setDetectedArea({ ...detectedAreaBase, confidence: "poor" });
        setLocationStatus("not_found");
        setSearchVisible(true);
        setLocationMessage(
          "Adresseopslaget returnerede ingen vej. Prøv GPS igen, indtast adressen manuelt, eller vælg hospital manuelt.",
        );
      } else {
        setDetectedArea(detectedAreaBase);
        const mappedKommune = mapRegionCityToKommune(
          city || district || subregion || region,
          subregion || region,
        );

        if (mappedKommune) {
          setKommune(mappedKommune);
          setKommuneQ(mappedKommune);
          closeAllDropdowns();
          setLocationStatus("matched");
        } else {
          setLocationStatus("not_found");
          setLocationMessage(t("dest_kommune_notmapped_body"));
        }
      }
    } catch (error: any) {
      if (!locationMountedRef.current || requestId !== locationRequestRef.current) return;
      const message = String(error?.message ?? "");
      const lower = message.toLowerCase();

      if (message.includes("LOCATION_TIMEOUT")) {
        setLocationStatus("timeout");
        setLocationMessage("Adresseopslaget tog for lang tid. Prøv igen, eller vælg hospital manuelt.");
      } else if (
        lower.includes("rate limit") ||
        lower.includes("too many requests") ||
        lower.includes("midlertidigt blokeret")
      ) {
        setLocationStatus("geocode_failed");
        setLocationMessage("Adresseopslaget er midlertidigt begrænset. Vent lidt, prøv igen, eller vælg manuelt.");
      } else if (lower.includes("cooldown") || lower.includes("på cooldown")) {
        setLocationStatus("geocode_failed");
        setLocationMessage(message);
      } else {
        setLocationStatus("error");
        setLocationMessage(message || t("dest_loc_error_body"));
      }

      if (__DEV__) console.warn("GPS detection failed:", message);
    } finally {
      if (locationMountedRef.current && requestId === locationRequestRef.current) {
        setDetectingLocation(false);
      }
      locationInFlightRef.current = false;
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
        <View
          style={{
            gap: 6,
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <Title style={{ textAlign: "center" }}>{t("dest_title")}</Title>
          <Subtle style={{ textAlign: "center" }}>{t("dest_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <View style={{ alignItems: "center" }}>
              <Title style={{ textAlign: "center" }}>
                {t("dest_function_title")}
              </Title>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
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

              <Pressable
                onPress={toggleSearchVisible}
                style={chip(searchVisible)}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {area === "byen" ? "🔍 Søg vej eller adresse" : "🔍"}
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
                    sections={regionCategorySections}
                    onSelect={(value) => {
                      setRegCat(value);
                      setRegCatOpen(false);
                    }}
                    renderValue={(value) =>
                      getRegionCategoryLabel(t as TranslateFn, value)
                    }
                    placeholder={t("dest_category")}
                    maxHeight={280}
                  />

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

          <Card>
            <View style={{ gap: 8 }}>
              {detectingLocation ? (
                <View style={{ gap: 8, alignItems: "center" }}>
                  <ActivityIndicator />
                  <Text
                    accessibilityLiveRegion="polite"
                    style={{ color: theme.colors.mutedText }}
                  >
                    {locationStatus === "permission"
                      ? "Anmoder om adgang til placering…"
                      : locationStatus === "resolving"
                        ? "Finder vej og visitationsområde…"
                        : "Finder din placering…"}
                  </Text>
                </View>
              ) : detectedArea ? (
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
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                    {t("dest_detected")}
                  </Text>

                  <Text style={{ color: theme.colors.mutedText }}>
                    {detectedArea.label || t("dest_unknown_area")}
                  </Text>

                  {detectedArea.accuracyMeters !== undefined && detectedArea.confidence !== "high" && (
                    <Text style={{ color: theme.colors.mutedText }}>
                      GPS-præcision: ±{Math.round(detectedArea.accuracyMeters)} m
                      {detectedArea.confidence === "medium"
                        ? " • middel sikkerhed – kontrollér adressen"
                        : detectedArea.confidence === "poor"
                          ? " • lav sikkerhed"
                          : ""}
                    </Text>
                  )}

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
              ) : (
                <Text style={{ color: theme.colors.mutedText }}>
                  Brug din aktuelle placering til at finde visitationsområdet, eller vælg hospital manuelt.
                </Text>
              )}

              {!!locationMessage && !detectingLocation && (
                <Text
                  accessibilityLiveRegion="assertive"
                  style={{ color: theme.colors.warn, fontWeight: "700", lineHeight: 20 }}
                >
                  {locationMessage}
                </Text>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Find visitation med GPS"
                disabled={detectingLocation}
                onPress={detectLocation}
                style={chip(false)}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900", textAlign: "center" }}>
                  {detectedArea ? "Prøv GPS igen" : "Find med GPS"}
                </Text>
              </Pressable>
            </View>
          </Card>

          {searchVisible && area === "byen" && (
            <Card>
              <View style={{ gap: 14 }}>
                <Title>Søg vej eller adresse</Title>
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
                    setDetectedArea(null);
                    setSelectedStreet(value);
                    setStreetQ(value);
                    setStreetOpen(false);
                    setStreetSide("");
                    applyStreetRoute(
                      value,
                      "",
                      undefined,
                      postalCodeQ || undefined,
                    );
                  }}
                  placeholder={t("dest_street_placeholder")}
                  emptyText={t("dest_no_street_match")}
                  maxHeight={220}
                />

                {!!selectedStreet && (
                  <View style={{ gap: 8 }}>
                    <Label>Husnummer</Label>
                    <Input
                      value={houseNumberQ}
                      onChangeText={(value) => {
                        const displayed = value.replace(/[^0-9a-zæøå]/giu, "").slice(0, 6);
                        setHouseNumberQ(displayed);
                        const number = parseHouseNumber(displayed).number;
                        applyStreetRoute(
                          selectedStreet,
                          "",
                          number,
                          postalCodeQ || undefined,
                        );
                      }}
                      placeholder="Fx 15A"
                      keyboardType="default"
                      autoCapitalize="characters"
                    />
                    {streetRouteNeedsHouseNumber && (
                      <Text style={{ color: theme.colors.warn, fontWeight: "700" }}>
                        Denne gade er opdelt efter husnummer.
                      </Text>
                    )}
                  </View>
                )}

                {!!selectedStreet && (
                  <View style={{ gap: 8 }}>
                    <Label>Postnummer (valgfrit)</Label>
                    <Input
                      value={postalCodeQ}
                      onChangeText={(value) => {
                        const digits = value.replace(/\D/g, "").slice(0, 4);
                        setPostalCodeQ(digits);
                        const number = parseHouseNumber(houseNumberQ).number;
                        applyStreetRoute(
                          selectedStreet,
                          streetSide,
                          number,
                          digits || undefined,
                        );
                      }}
                      placeholder="Fx 2000"
                      keyboardType="number-pad"
                    />
                    {streetRouteNeedsPostalCode && (
                      <Text style={{ color: theme.colors.warn, fontWeight: "700" }}>
                        Denne gade er opdelt efter postnummer.
                      </Text>
                    )}
                  </View>
                )}

                {!!streetRouteMessage && !streetRouteNeedsSide && (
                  <Text style={{ color: theme.colors.warn, fontWeight: "700" }}>
                    {streetRouteMessage}
                  </Text>
                )}

                {streetRouteNeedsSide && (
                  <View
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      padding: 12,
                      backgroundColor: "rgba(255,209,102,0.10)",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: "900",
                        lineHeight: 20,
                      }}
                    >
                      Flere muligheder for samme gade
                    </Text>

                    <Text
                      style={{
                        color: theme.colors.mutedText,
                        lineHeight: 19,
                      }}
                    >
                      {streetRouteMessage ||
                        "Vælg om adressen ligger på lige eller ulige side."}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <Pressable
                        onPress={() => selectStreetSide("even")}
                        style={chip(streetSide === "even")}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "900",
                          }}
                        >
                          Lige
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => selectStreetSide("odd")}
                        style={chip(streetSide === "odd")}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "900",
                          }}
                        >
                          Ulige
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </Card>
          )}

          {searchVisible && area === "region" && (
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
                    setDetectedArea(null);
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

          <Card style={resolvedHospital ? { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.accent } : undefined}>
            <Title>{t("dest_result")}</Title>

            {!resolvedHospital ? (
              <Text style={{ color: theme.colors.mutedText, marginTop: 10 }}>
                {streetRouteNeedsSide || streetRouteNeedsHouseNumber
                  ? "Angiv husnummer eller side for at få destination."
                  : t("dest_pick_more")}
              </Text>
            ) : (
              <View style={{ marginTop: 12, gap: 14 }}>
                <Row style={{ alignItems: "flex-start" }}>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    Hospital
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

                {!!resolvedHospital.extra && (
                  <Row style={{ alignItems: "flex-start" }}>
                    <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                      Grundlag
                    </Text>
                    <Text style={{ color: theme.colors.text, fontWeight: "700", flex: 1 }}>
                      {resolvedHospital.extra}
                    </Text>
                  </Row>
                )}

                <Row style={{ alignItems: "flex-start" }}>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    {t("dest_category")}
                  </Text>
                  <Text style={{ color: theme.colors.text, fontWeight: "700", flex: 1 }}>
                    {selectedCategoryLabel}
                  </Text>
                </Row>

                <Row style={{ alignItems: "flex-start" }}>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    Telefonnummer
                  </Text>

                  <View style={{ flex: 1 }}>
                    {loadingHospitalPhones ? (
                      <Text style={{ color: theme.colors.mutedText }}>
                        Henter telefonnumre...
                      </Text>
                    ) : selectedHospitalPhone ? (
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontWeight: "900",
                          fontSize: 18,
                        }}
                      >
                        {selectedHospitalPhone.phone}
                      </Text>
                    ) : (
                      <Text style={{ color: theme.colors.mutedText }}>
                        Intet telefonnummer fundet endnu.
                      </Text>
                    )}
                  </View>
                </Row>

                <Row style={{ alignItems: "flex-start" }}>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    Ændre
                  </Text>

                  <View style={{ flex: 1 }}>
                    {!loadingHospitalPhones && hospitalPhones.length > 0 ? (
                      <SimpleDropdown<PhoneOptionValue>
                        value={selectedPhoneId}
                        open={phoneDropdownOpen}
                        onToggle={togglePhoneDropdown}
                        options={phoneOptions}
                        onSelect={(value) => {
                          setSelectedPhoneId(value);
                          setPhoneDropdownOpen(false);
                        }}
                        renderValue={renderPhoneSelectedValue}
                        renderOption={renderPhoneOptionRow}
                        placeholder={
                          lang === "da"
                            ? "Vælg hospitalsnummer"
                            : "Choose hospital number"
                        }
                        emptyText={
                          lang === "da"
                            ? "Ingen telefonnumre fundet."
                            : "No phone numbers found."
                        }
                        maxHeight={240}
                      />
                    ) : (
                      <Text style={{ color: theme.colors.mutedText }}>-</Text>
                    )}
                  </View>
                </Row>

                {!loadingHospitalPhones &&
                  hospitalPhones.some((item) => item.source === "bundled") && (
                    <Text style={{ color: theme.colors.warn, lineHeight: 19 }}>
                      Firestore-kontakten kunne ikke hentes. Viser den lokale,
                      operationelle offline-liste.
                    </Text>
                  )}

                {selectedHospitalPhone && (
                  <Pressable
                    onPress={() =>
                      callHospitalNumber(selectedHospitalPhone.phone)
                    }
                    style={chip(false)}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: "800",
                        textAlign: "center",
                      }}
                    >
                      Ring op
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setManualHospitalCode("");
                    setSearchVisible(true);
                  }}
                  style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}
                >
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "900" }}>
                    {area === "byen" ? "Ret adresse" : "Ret område"}
                  </Text>
                </Pressable>

                {!loadingHospitalPhones &&
                  resolvedHospital.code !== "UNKNOWN" &&
                  hospitalPhones.length === 0 && (
                    <Text
                      style={{
                        color: theme.colors.mutedText,
                      }}
                    >
                      Ingen telefonnumre fundet for dette hospital endnu.
                    </Text>
                  )}

                {resolvedHospital.code === "UNKNOWN" && (
                  <Text
                    style={{
                      color: theme.colors.warn,
                      fontWeight: "800",
                    }}
                  >
                    {t("dest_unknown")}
                  </Text>
                )}
              </View>
            )}
          </Card>

          <CollapsibleCard
            title={lang === "da" ? "Vælg hospital manuelt" : "Choose hospital manually"}
            subtitle={lang === "da" ? "Brug kun hvis automatisk visitation ikke kan afklares." : "Use when automatic destination cannot be resolved."}
            defaultOpen={!!manualHospitalCode}
          >
            <Text style={{ color: theme.colors.mutedText, marginBottom: 10 }}>
              {lang === "da"
                ? "Tilgængelig uanset GPS, tilladelser og adresseopslag."
                : "Available regardless of GPS, permissions, and address lookup."}
            </Text>
            <SimpleDropdown<HospitalCode>
              label="Hospital"
              value={manualHospitalCode}
              open={manualHospitalOpen}
              onToggle={() => {
                closeAllDropdowns();
                setManualHospitalOpen((value) => !value);
              }}
              options={MANUAL_HOSPITAL_CODES}
              onSelect={(value) => {
                setManualHospitalCode(value);
                setManualHospitalOpen(false);
              }}
              renderValue={(value) => hospitalLabel(t as TranslateFn, value)}
              renderOption={(value) => (
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {hospitalLabel(t as TranslateFn, value)}
                </Text>
              )}
              placeholder={lang === "da" ? "Vælg hospital" : "Choose hospital"}
              maxHeight={260}
            />
            {!!manualHospitalCode && (
              <Pressable accessibilityRole="button" onPress={() => setManualHospitalCode("")} style={[chip(false), { marginTop: 10 }]}>
                <Text style={{ color: theme.colors.text, fontWeight: "800", textAlign: "center" }}>Brug automatisk resultat igen</Text>
              </Pressable>
            )}
          </CollapsibleCard>

          {__DEV__ && Object.keys(diagnostics).length > 0 && (
            <CollapsibleCard
              title="GPS-diagnostik (kun udvikling)"
              subtitle="Vises ikke i produktionsbuilds og sendes eller gemmes ikke."
            >
              <Text
                selectable
                style={{
                  color: theme.colors.mutedText,
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                {JSON.stringify(diagnostics, null, 2)}
              </Text>
            </CollapsibleCard>
          )}

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
