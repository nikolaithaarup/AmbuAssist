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
import { ClinicalDisclosure } from "../../src/ui/ClinicalDisclosure";
import { CollapsibleCard } from "../../src/ui/CollapsibleCard";
import {
  Card,
  Input,
  Label,
  Screen,
  Subtle,
  Title,
} from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

import type {
  Area,
  Bydel,
  DetectedArea,
  HospitalCode,
  Kommune,
  RegionCategory,
  StreetSide,
} from "../../src/features/destination/types";

import {
  hospitalLabel,
  norm,
  resolveStreetRoute,
} from "../../src/features/destination/helpers";
import {
  deriveAutomaticRoutingStrategy,
  getCanonicalRoutingRows,
  getCanonicalStreetLabel,
  getConfidenceUx,
  matchManualLocation,
  type ManualLocationMatch,
} from "../../src/domain/destination/automaticRouting";
import {
  getCategoryForArea,
  type DestinationCategoryIntent,
} from "../../src/domain/destination/categoryRouting";
import {
  getDestinationCategoryFavourites,
  toggleDestinationCategoryFavourite,
} from "../../src/domain/destination/categoryFavourites";

import {
  getHospitalPhoneNumbersByCode,
  type HospitalPhoneNumber,
} from "../../src/dev/hospitalNumbers";

import { chip } from "../../src/features/destination/ui";
import { DestinationCategoryPicker } from "../../src/features/destination/DestinationCategoryPicker";

type TranslateFn = (key: any) => string;
type PhoneOptionValue = string;
type ManualLocationOption = `street:${string}` | `kommune:${Kommune}`;
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
      <View key={option} style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => onSelect(option)}
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 12,
            backgroundColor: selected
              ? "rgba(220,220,220,0.18)"
              : "transparent",
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
      </View>
    );
  };

  return (
    <View style={{ gap: 8 }}>
      {!!label && <Label>{label}</Label>}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          typeof displayValue === "string" ? displayValue : label
        }
        accessibilityState={{ expanded: open }}
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

function DestinationPrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
        opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function DestinationTool() {
  const { t } = useT();
  const { settings, setSettings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [visitationData, setVisitationData] = useState<BackendVisitationData>(
    LOCAL_VISITATION_DATA,
  );

  const BYEN_MAP = visitationData.byen.map;
  const STREET_SAMPLE = useMemo(
    () =>
      getCanonicalRoutingRows(
        visitationData.byen.streetSample,
        LOCAL_VISITATION_DATA.byen.streetSample,
      ),
    [visitationData.byen.streetSample],
  );
  const REGION_ALL_MAP = visitationData.region.map;
  const ALL_KOMMUNER = useMemo(
    () => Object.keys(REGION_ALL_MAP) as Kommune[],
    [REGION_ALL_MAP],
  );

  const [reference, setReference] = useState<ReferenceDoc | null>(null);

  const [area, setArea] = useState<Area | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [requiresAddressConfirmation, setRequiresAddressConfirmation] =
    useState(false);

  const [bydel, setBydel] = useState<Bydel | "">("");
  const [kommune, setKommune] = useState<Kommune | "">("");
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  const [streetRouteNeedsHouseNumber, setStreetRouteNeedsHouseNumber] = useState(false);
  const [streetRouteNeedsPostalCode, setStreetRouteNeedsPostalCode] = useState(false);

  const [regCat, setRegCat] = useState<DestinationCategoryIntent>(
    "akutmodtagelse",
  );

  const [streetQ, setStreetQ] = useState("");
  const [houseNumberQ, setHouseNumberQ] = useState("");
  const [postalCodeQ, setPostalCodeQ] = useState("");

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedArea, setDetectedArea] = useState<DetectedArea | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("initial");
  const [locationMessage, setLocationMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown>>({});
  const locationRequestRef = useRef(0);
  const locationInFlightRef = useRef(false);
  const locationMountedRef = useRef(true);

  const [streetOpen, setStreetOpen] = useState(false);
  const [regCatOpen, setRegCatOpen] = useState(false);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [manualHospitalOpen, setManualHospitalOpen] = useState(false);
  const [manualHospitalSectionVisible, setManualHospitalSectionVisible] =
    useState(false);
  const [manualHospitalCode, setManualHospitalCode] = useState<HospitalCode | "">("");

  const [hospitalPhones, setHospitalPhones] = useState<HospitalPhoneNumber[]>(
    [],
  );
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>("");
  const [loadingHospitalPhones, setLoadingHospitalPhones] = useState(false);

  const selectedGeographicCategory = area
    ? getCategoryForArea(regCat, area)
    : null;
  const selectedSpecialtyKey =
    selectedGeographicCategory?.available
      ? selectedGeographicCategory.category
      : regCat;
  const selectedCategoryLabel = getRegionCategoryLabel(
    t as TranslateFn,
    regCat,
  );

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
    setRegCatOpen(false);
    setPhoneDropdownOpen(false);
    setManualHospitalOpen(false);
  };

  const resetStreetRouteState = () => {
    setStreetRouteNeedsHouseNumber(false);
    setStreetRouteNeedsPostalCode(false);
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
    const all = uniqueStrings(
      STREET_SAMPLE.map((r) => getCanonicalStreetLabel(r.street)),
    ).sort((a, b) => a.localeCompare(b, "da"));

    if (!q) return all;
    return all.filter((street) => norm(street).includes(q));
  }, [STREET_SAMPLE, streetQ]);

  const kommuneOptions = useMemo(() => {
    const q = norm(streetQ);
    const all = [...ALL_KOMMUNER].sort((a, b) => a.localeCompare(b, "da"));

    if (!q) return all;
    return all.filter((k) => norm(k).includes(q));
  }, [ALL_KOMMUNER, streetQ]);

  const manualLocationSections = useMemo<
    DropdownSection<ManualLocationOption>[]
  >(
    () => [
      {
        title: lang === "da" ? "Gader i København" : "Streets in Copenhagen",
        options: streetOptions.map(
          (street) => `street:${street}` as ManualLocationOption,
        ),
      },
      {
        title: lang === "da" ? "Kommuner i regionen" : "Municipalities",
        options: kommuneOptions.map(
          (item) => `kommune:${item}` as ManualLocationOption,
        ),
      },
    ],
    [kommuneOptions, lang, streetOptions],
  );

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

  const favouriteCategoryOptions = useMemo(
    () =>
      getDestinationCategoryFavourites(
        settings.destinationCategoryFavourites,
        regionCategoryOptions,
      ),
    [regionCategoryOptions, settings.destinationCategoryFavourites],
  );

  const toggleCategoryFavourite = (category: DestinationCategoryIntent) => {
    setSettings((current) => {
      const currentFavourites = getDestinationCategoryFavourites(
        current.destinationCategoryFavourites,
        regionCategoryOptions,
      );
      return {
        ...current,
        destinationCategoryFavourites: toggleDestinationCategoryFavourite(
          currentFavourites,
          category,
        ),
      };
    });
  };

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

    setArea("byen");
    setKommune("");
    setDetectedArea(null);
    setManualHospitalCode("");
    setRequiresAddressConfirmation(false);
    setSelectedStreet(street);
    setStreetQ(street);

    if (result.status === "single") {
      setBydel(result.officialBydel);
      setStreetRouteNeedsHouseNumber(false);
      setStreetRouteNeedsPostalCode(false);
      setLocationStatus("matched");
      setLocationMessage("");
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
      setStreetRouteNeedsHouseNumber(
        result.status === "needs_house_number" || result.status === "needs_side",
      );
      setStreetRouteNeedsPostalCode(result.status === "needs_postal_code");
      setLocationStatus("not_found");
      setDiagnostics((current) => ({
        ...current,
        normalizedStreetKey: norm(street),
        matchStatus: result.status,
        matchFailure: result.message,
      }));
      return false;
    }

    setBydel("");
    setStreetRouteNeedsHouseNumber(false);
    setStreetRouteNeedsPostalCode(false);
    setLocationStatus("not_found");
    setDiagnostics((current) => ({
      ...current,
      normalizedStreetKey: norm(street),
      matchStatus: result.status,
      matchFailure: result.message,
    }));
    return false;
  };

  const automaticHospitalCode = useMemo<HospitalCode | null | undefined>(() => {
    if (area === "byen") {
      if (!bydel) return undefined;
      const mapped = getCategoryForArea(regCat, "byen");
      if (!mapped.available) return null;
      const code = resolveHospitalCode({
        area: "byen",
        bydel: bydel as Bydel,
        category: mapped.category,
        map: BYEN_MAP,
      });
      return !code || code === "UNKNOWN" ? null : code;
    }

    if (area === "region") {
      if (!kommune) return undefined;
      const mapped = getCategoryForArea(regCat, "region");
      if (!mapped.available) return null;
      const code = resolveHospitalCode({
        area: "region",
        kommune: kommune as Kommune,
        category: mapped.category,
        map: REGION_ALL_MAP,
      });
      return !code || code === "UNKNOWN" ? null : code;
    }

    return undefined;
  }, [area, bydel, kommune, regCat, BYEN_MAP, REGION_ALL_MAP]);

  const categoryUnavailable =
    !manualHospitalCode &&
    !requiresAddressConfirmation &&
    automaticHospitalCode === null;

  const resolvedHospital = useMemo<ResolvedHospital | null>(() => {
    if (manualHospitalCode) {
      return {
        code: manualHospitalCode,
        label: hospitalLabel(t as TranslateFn, manualHospitalCode),
        extra: lang === "da" ? "Valgt manuelt" : "Selected manually",
      };
    }
    if (requiresAddressConfirmation) return null;
    if (area === "byen") {
      if (!bydel || !automaticHospitalCode) return null;

      const selectedBydel = bydel as Bydel;

      const streetExtra = selectedStreet
        ? `${selectedStreet}${houseNumberQ ? ` ${houseNumberQ}` : ""}${postalCodeQ ? `, ${postalCodeQ}` : ""} • ${selectedBydel}`
        : selectedBydel;

      return {
        code: automaticHospitalCode,
        label: hospitalLabel(t as TranslateFn, automaticHospitalCode),
        extra: streetExtra,
      };
    }

    if (area !== "region" || !kommune || !automaticHospitalCode) return null;

    const selectedKommune = kommune as Kommune;

    return {
      code: automaticHospitalCode,
      label: hospitalLabel(t as TranslateFn, automaticHospitalCode),
      extra: selectedKommune,
    };
  }, [
    area,
    bydel,
    kommune,
    selectedStreet,
    houseNumberQ,
    postalCodeQ,
    automaticHospitalCode,
    t,
    manualHospitalCode,
    requiresAddressConfirmation,
    lang,
  ]);

  useEffect(() => {
    let active = true;

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
        if (!active) return;

        setHospitalPhones(results);

        const preferred =
          results.find((item) => item.specialtyKey === selectedSpecialtyKey) ??
          results.find((item) => item.specialtyKey === "main") ??
          results[0] ??
          null;

        setSelectedPhoneId(preferred?.id ?? "");
      } catch (error) {
        console.error("Error loading hospital phones:", error);
        if (!active) return;
        setHospitalPhones([]);
        setSelectedPhoneId("");
      } finally {
        if (active) setLoadingHospitalPhones(false);
      }
    };

    loadHospitalPhones();
    return () => {
      active = false;
    };
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

  const applyManualLocationMatch = (
    match: ManualLocationMatch,
    rawInput: string,
  ) => {
    if (match.area === "byen") {
      setHouseNumberQ(match.displayedHouseNumber);
      setPostalCodeQ(match.postcode ?? "");
      applyStreetRoute(
        match.street,
        "",
        parseHouseNumber(match.displayedHouseNumber).number,
        match.postcode,
      );
      return;
    }

    if (match.area === "region") {
      setArea("region");
      setKommune(match.kommune);
      setSelectedStreet("");
      setStreetQ(rawInput);
      setHouseNumberQ("");
      setPostalCodeQ("");
      setDetectedArea(null);
      setManualHospitalCode("");
      setRequiresAddressConfirmation(false);
      resetStreetRouteState();
      setLocationStatus("matched");
      setLocationMessage("");
      return;
    }

    setArea(null);
    setBydel("");
    setKommune("");
    setSelectedStreet("");
    setDetectedArea(null);
    setRequiresAddressConfirmation(false);
    resetStreetRouteState();
    setLocationStatus("initial");
    setLocationMessage("");
  };

  const handleStreetChange = (text: string) => {
    setStreetQ(text);
    setStreetOpen(true);
    setRegCatOpen(false);
    setPhoneDropdownOpen(false);
    setManualHospitalCode("");
    const match = matchManualLocation(text, STREET_SAMPLE, ALL_KOMMUNER);
    applyManualLocationMatch(match, text);
    if (match.area !== "unresolved") setStreetOpen(false);
  };

  const detectLocation = async () => {
    if (locationInFlightRef.current) return;
    locationInFlightRef.current = true;
    const requestId = ++locationRequestRef.current;

    try {
      setDetectingLocation(true);
      setArea(null);
      setBydel("");
      setKommune("");
      setDetectedArea(null);
      setManualHospitalCode("");
      setRequiresAddressConfirmation(false);
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

      const strategy = deriveAutomaticRoutingStrategy(
        {
          street,
          houseNumber: parsedNumber.number,
          postcode,
          city,
          district,
          subregion,
          region,
        },
        STREET_SAMPLE,
      );

      if (strategy.area === "byen") {
        const routeResult = strategy.route;
        const confidence = classifyLocationConfidence({
          accuracy,
          hasStreet: true,
          hasCompleteRoutingAddress: routeResult.status === "single",
        });
        setArea("byen");
        setKommune("");
        setSelectedStreet(street);
        setStreetQ(street);
        setHouseNumberQ(
          parsedNumber.number
            ? String(parsedNumber.number) + (parsedNumber.suffix ?? "")
            : "",
        );
        setPostalCodeQ(postcode);
        setDetectedArea({ ...detectedAreaBase, confidence });
        setManualHospitalCode("");

        if (routeResult.status === "single") {
          setBydel(routeResult.officialBydel);
          setStreetRouteNeedsHouseNumber(false);
          setStreetRouteNeedsPostalCode(false);
          setRequiresAddressConfirmation(
            getConfidenceUx(confidence) === "confirm",
          );
          setDiagnostics((current) => ({
            ...current,
            confidence,
            routingArea: "byen",
            matchStatus: routeResult.status,
            matchType: routeResult.matchType,
            matchedRule: routeResult.matchedRule,
            destinationDistrict: routeResult.officialBydel,
          }));
          closeAllDropdowns();
          setLocationStatus("matched");
          setLocationMessage(
            confidence === "medium"
              ? "Kontrollér den fundne adresse, før destinationen bruges."
              : "",
          );
          return;
        }

        setBydel("");
        setRequiresAddressConfirmation(false);
        setStreetRouteNeedsHouseNumber(
          routeResult.status === "needs_house_number" ||
            routeResult.status === "needs_side",
        );
        setStreetRouteNeedsPostalCode(
          routeResult.status === "needs_postal_code",
        );
        setLocationStatus("not_found");
        setSearchVisible(true);
        setLocationMessage(
          routeResult.status === "needs_house_number" ||
            routeResult.status === "needs_side"
            ? "Gaden er fundet. Indtast husnummeret for at finde den sikre destination."
            : routeResult.status === "needs_postal_code"
              ? "Gaden er fundet. Bekræft postnummeret for at finde den sikre destination."
              : "Adressen kan ikke afgøres sikkert. Ret adressen, eller vælg hospital manuelt.",
        );
        setDiagnostics((current) => ({
          ...current,
          confidence,
          routingArea: "byen",
          matchStatus: routeResult.status,
          matchFailure: routeResult.message,
        }));
        closeAllDropdowns();
        return;
      }

      if (strategy.area === "region") {
        const confidence = classifyLocationConfidence({
          accuracy,
          hasStreet: !!street,
          hasCompleteRoutingAddress: true,
        });
        const confidenceUx = getConfidenceUx(confidence);
        setArea(confidenceUx === "recovery" ? null : "region");
        setBydel("");
        setKommune(
          confidenceUx === "recovery" ? "" : strategy.kommune,
        );
        setSelectedStreet(street);
        setStreetQ(street || strategy.kommune);
        setHouseNumberQ(
          parsedNumber.number
            ? String(parsedNumber.number) + (parsedNumber.suffix ?? "")
            : "",
        );
        setPostalCodeQ(postcode);
        resetStreetRouteState();
        setDetectedArea({ ...detectedAreaBase, confidence });
        setManualHospitalCode("");
        setRequiresAddressConfirmation(
          confidenceUx === "confirm",
        );
        setDiagnostics((current) => ({
          ...current,
          confidence,
          routingArea: "region",
          destinationMunicipality: strategy.kommune,
        }));
        closeAllDropdowns();
        setLocationStatus(confidence === "poor" ? "poor_accuracy" : "matched");
        setLocationMessage(
          confidence === "medium"
            ? "Kontrollér den fundne adresse, før destinationen bruges."
            : confidence === "poor"
              ? "Placeringen kan ikke bruges sikkert. Prøv GPS igen, eller indtast adressen manuelt."
              : "",
        );
        return;
      }

      setArea(null);
      setBydel("");
      setKommune("");
      setRequiresAddressConfirmation(false);
      setDetectedArea({ ...detectedAreaBase, confidence: "poor" });
      setLocationStatus("not_found");
      setSearchVisible(true);
      setLocationMessage(
        strategy.reason === "unknown_city_street"
          ? "Vejen findes ikke i den officielle visitationstabel. Ret adressen, prøv GPS igen, eller vælg hospital manuelt."
          : strategy.reason === "missing_street"
            ? "Adresseopslaget returnerede ingen vej. Indtast adressen manuelt, eller prøv GPS igen."
            : t("dest_kommune_notmapped_body"),
      );
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
        <View style={{ gap: 6, marginTop: 12, alignItems: "center" }}>
          <Title style={{ textAlign: "center" }}>{t("dest_title")}</Title>
          <Subtle style={{ textAlign: "center" }}>
            {lang === "da"
              ? "Vælg kategori, og find patientens placering med GPS eller adresse."
              : "Choose a category, then locate the patient by GPS or address."}
          </Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 24 }}>
          <View style={{ gap: 14, paddingTop: 4 }}>
            <DestinationCategoryPicker
              lang={lang}
              selected={regCat}
              favourites={favouriteCategoryOptions}
              options={regionCategoryOptions}
              open={regCatOpen}
              getLabel={(value) =>
                getRegionCategoryLabel(t as TranslateFn, value)
              }
              onOpen={toggleRegCatDropdown}
              onClose={() => setRegCatOpen(false)}
              onSelect={setRegCat}
              onToggleFavourite={toggleCategoryFavourite}
            />

            {categoryUnavailable && (
              <View
                testID="destination-category-unavailable"
                style={{
                  gap: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.warn,
                  padding: 12,
                  backgroundColor: "rgba(255, 193, 7, 0.08)",
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {lang === "da"
                    ? `${selectedCategoryLabel} findes ikke i routingtabellen for den fundne placering.`
                    : `${selectedCategoryLabel} is not available in the routing table for the resolved location.`}
                </Text>
                <Text style={{ color: theme.colors.mutedText }}>
                  {lang === "da"
                    ? "Vælg en anden visitationstype, eller brug manuel hospitalsvalg."
                    : "Choose another visitation type, or use manual hospital selection."}
                </Text>
              </View>
            )}

            {showNeurokirNote && (
              <Text style={{ color: theme.colors.mutedText }}>
                {neurokirNote === "dest_region_neurokir_note"
                  ? t("dest_region_neurokir_note_fallback")
                  : neurokirNote}
              </Text>
            )}

            <View testID="destination-primary-gps">
              <DestinationPrimaryButton
                label={
                  detectingLocation
                    ? lang === "da"
                      ? "Finder placering…"
                      : "Finding location…"
                    : lang === "da"
                      ? "Find destination med GPS"
                      : "Find destination with GPS"
                }
                onPress={detectLocation}
                disabled={detectingLocation}
              />
            </View>

            {detectingLocation && (
              <View style={{ gap: 8, alignItems: "center" }}>
                <ActivityIndicator />
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ color: theme.colors.mutedText }}
                >
                  {locationStatus === "permission"
                    ? lang === "da"
                      ? "Anmoder om adgang til placering…"
                      : "Requesting location access…"
                    : locationStatus === "resolving"
                      ? lang === "da"
                        ? "Finder adresse og destination…"
                        : "Resolving address and destination…"
                      : lang === "da"
                        ? "Finder din placering…"
                        : "Finding your location…"}
                </Text>
              </View>
            )}

            {!detectingLocation &&
              detectedArea &&
              requiresAddressConfirmation && (
                <View
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.warn,
                    backgroundColor: "rgba(255,209,102,0.10)",
                    padding: 14,
                    gap: 12,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {lang === "da"
                      ? "Kontrollér den fundne adresse"
                      : "Check the detected address"}
                  </Text>
                  <Text style={{ color: theme.colors.text, lineHeight: 21 }}>
                    {detectedArea.label || t("dest_unknown_area")}
                  </Text>
                  <View style={{ gap: 8 }}>
                    <View testID="destination-confirm-address">
                      <DestinationPrimaryButton
                        label={
                          lang === "da"
                            ? "Brug denne adresse"
                            : "Use this address"
                        }
                        onPress={() => {
                          setRequiresAddressConfirmation(false);
                          setLocationMessage("");
                        }}
                      />
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setSearchVisible(true)}
                      style={({ pressed }) => ({
                        minHeight: 48,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.65 : 1,
                      })}
                    >
                      <Text
                        style={{
                          color: theme.colors.accentMuted,
                          fontWeight: "900",
                        }}
                      >
                        {lang === "da" ? "Ret adresse" : "Correct address"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

            {!!locationMessage && !detectingLocation && (
              <Text
                accessibilityLiveRegion="assertive"
                style={{
                  color: theme.colors.warn,
                  fontWeight: "700",
                  lineHeight: 20,
                }}
              >
                {locationMessage}
              </Text>
            )}

            {!detectingLocation &&
              [
                "permission_denied",
                "services_disabled",
                "timeout",
                "poor_accuracy",
                "geocode_failed",
                "not_found",
                "error",
              ].includes(locationStatus) && (
                <View style={{ gap: 6 }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={detectLocation}
                    style={({ pressed }) => ({
                      minHeight: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.65 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: theme.colors.accentMuted,
                        fontWeight: "900",
                      }}
                    >
                      {lang === "da" ? "Prøv GPS igen" : "Retry GPS"}
                    </Text>
                  </Pressable>
                </View>
              )}

            <Pressable
              testID="destination-manual-address-toggle"
              accessibilityRole="button"
              onPress={toggleSearchVisible}
              style={({ pressed }) => ({
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Text
                style={{ color: theme.colors.accentMuted, fontWeight: "900" }}
              >
                {searchVisible
                  ? lang === "da"
                    ? "Skjul manuel adresse"
                    : "Hide manual address"
                  : lang === "da"
                    ? "Søg adresse manuelt"
                    : "Enter address manually"}
              </Text>
            </Pressable>
          </View>

          {searchVisible && (
            <View style={{ gap: 14, paddingVertical: 4 }}>
              <View style={{ gap: 5 }}>
                <Title style={{ fontSize: 20 }}>
                  {lang === "da" ? "Patientens placering" : "Patient location"}
                </Title>
                <Subtle>
                  {lang === "da"
                    ? "Skriv en adresse i København eller en kommune i regionen."
                    : "Enter a Copenhagen address or a municipality in the region."}
                </Subtle>
              </View>

              <View style={{ gap: 8 }}>
                <Label>
                  {lang === "da" ? "Adresse eller kommune" : "Address or municipality"}
                </Label>
                <Input
                  accessibilityLabel={
                    lang === "da" ? "Adresse eller kommune" : "Address or municipality"
                  }
                  value={streetQ}
                  onChangeText={handleStreetChange}
                  placeholder={
                    lang === "da"
                      ? "Fx Frederiksberg Allé 13A eller Hillerød"
                      : "E.g. Frederiksberg Allé 13A or Hillerød"
                  }
                  keyboardType="default"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <SimpleDropdown<ManualLocationOption>
                value=""
                open={streetOpen}
                onToggle={toggleStreetDropdown}
                options={[]}
                sections={manualLocationSections}
                onSelect={(option) => {
                  const separator = option.indexOf(":");
                  const kind = option.slice(0, separator);
                  const value = option.slice(separator + 1);
                  setStreetOpen(false);
                  setStreetQ(value);
                  if (kind === "street") {
                    applyManualLocationMatch(
                      matchManualLocation(value, STREET_SAMPLE, ALL_KOMMUNER),
                      value,
                    );
                  } else {
                    applyManualLocationMatch(
                      { area: "region", kommune: value as Kommune },
                      value,
                    );
                  }
                }}
                renderValue={(option) =>
                  option.slice(option.indexOf(":") + 1)
                }
                renderOption={(option) => (
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                    {option.slice(option.indexOf(":") + 1)}
                  </Text>
                )}
                placeholder={
                  lang === "da" ? "Vælg et forslag" : "Choose a suggestion"
                }
                emptyText={
                  lang === "da"
                    ? "Ingen sikre forslag fundet."
                    : "No safe suggestions found."
                }
                maxHeight={260}
              />

              {!!selectedStreet &&
                (streetRouteNeedsHouseNumber || !!houseNumberQ) && (
                  <View style={{ gap: 8 }}>
                    <Label>{lang === "da" ? "Husnummer" : "House number"}</Label>
                    <Input
                      value={houseNumberQ}
                      onChangeText={(value) => {
                        const displayed = value
                          .replace(/[^0-9a-zæøå]/giu, "")
                          .slice(0, 6);
                        setHouseNumberQ(displayed);
                        applyStreetRoute(
                          selectedStreet,
                          "",
                          parseHouseNumber(displayed).number,
                          postalCodeQ || undefined,
                        );
                      }}
                      placeholder="Fx 13A"
                      keyboardType="default"
                      autoCapitalize="characters"
                    />
                    {streetRouteNeedsHouseNumber && (
                      <Text
                        style={{ color: theme.colors.warn, fontWeight: "700" }}
                      >
                        {lang === "da"
                          ? "Husnummeret er nødvendigt for denne gade."
                          : "A house number is required for this street."}
                      </Text>
                    )}
                  </View>
                )}

              {!!selectedStreet &&
                (streetRouteNeedsPostalCode || !!postalCodeQ) && (
                  <View style={{ gap: 8 }}>
                    <Label>{lang === "da" ? "Postnummer" : "Postal code"}</Label>
                    <Input
                      value={postalCodeQ}
                      onChangeText={(value) => {
                        const digits = value.replace(/\D/g, "").slice(0, 4);
                        setPostalCodeQ(digits);
                        applyStreetRoute(
                          selectedStreet,
                          "",
                          parseHouseNumber(houseNumberQ).number,
                          digits || undefined,
                        );
                      }}
                      placeholder="Fx 2000"
                      keyboardType="number-pad"
                    />
                    {streetRouteNeedsPostalCode && (
                      <Text
                        style={{ color: theme.colors.warn, fontWeight: "700" }}
                      >
                        {lang === "da"
                          ? "Postnummeret er nødvendigt for denne gade."
                          : "A postal code is required for this street."}
                      </Text>
                    )}
                  </View>
                )}
            </View>
          )}


          {resolvedHospital && (
            <View testID="destination-result">
              <Card
                style={{
                  backgroundColor: theme.colors.cardElevated,
                  borderColor: theme.colors.accent,
                  gap: 14,
                }}
              >
              <Subtle>
                {manualHospitalCode
                  ? lang === "da"
                    ? "Manuelt valgt destination"
                    : "Manually selected destination"
                  : lang === "da"
                    ? "Anbefalet destination"
                    : "Recommended destination"}
              </Subtle>

              <Title style={{ fontSize: 26, lineHeight: 32 }}>
                {resolvedHospital.label}
              </Title>

              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "800",
                  fontSize: 16,
                  lineHeight: 22,
                }}
              >
                {selectedCategoryLabel}
              </Text>

              {!!resolvedHospital.extra && (
                <Text style={{ color: theme.colors.mutedText, lineHeight: 20 }}>
                  {resolvedHospital.extra}
                </Text>
              )}

              {loadingHospitalPhones ? (
                <Text style={{ color: theme.colors.mutedText }}>
                  {lang === "da"
                    ? "Henter telefonnummer…"
                    : "Loading phone number…"}
                </Text>
              ) : selectedHospitalPhone ? (
                <View style={{ gap: 10 }}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 22,
                    }}
                  >
                    {selectedHospitalPhone.phone}
                  </Text>
                  <DestinationPrimaryButton
                    label={lang === "da" ? "Ring op" : "Call"}
                    onPress={() =>
                      callHospitalNumber(selectedHospitalPhone.phone)
                    }
                  />
                </View>
              ) : (
                <Text style={{ color: theme.colors.mutedText }}>
                  {lang === "da"
                    ? "Intet telefonnummer fundet endnu."
                    : "No phone number found yet."}
                </Text>
              )}

              {!loadingHospitalPhones && hospitalPhones.length > 1 && (
                <SimpleDropdown<PhoneOptionValue>
                  label={
                    lang === "da"
                      ? "Andet hospitalsnummer"
                      : "Another hospital number"
                  }
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
              )}

              {!loadingHospitalPhones &&
                hospitalPhones.some((item) => item.source === "bundled") && (
                  <Text style={{ color: theme.colors.warn, lineHeight: 19 }}>
                    {lang === "da"
                      ? "Firestore-kontakten kunne ikke hentes. Viser den lokale, operationelle offline-liste."
                      : "The Firestore contact could not be loaded. Showing the bundled operational offline list."}
                  </Text>
                )}

              {resolvedHospital.code === "UNKNOWN" && (
                <Text style={{ color: theme.colors.warn, fontWeight: "800" }}>
                  {t("dest_unknown")}
                </Text>
              )}

              {!manualHospitalCode && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSearchVisible(true)}
                  style={({ pressed }) => ({
                    minHeight: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.65 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: theme.colors.accentMuted,
                      fontWeight: "900",
                    }}
                  >
                    {lang === "da" ? "Ret adresse" : "Correct address"}
                  </Text>
                </Pressable>
              )}
              </Card>
            </View>
          )}

          <View style={{ gap: 8, paddingVertical: 4 }}>
            <Subtle style={{ textAlign: "center" }}>
              {lang === "da"
                ? "Kan destinationen ikke findes?"
                : "Could the destination not be found?"}
            </Subtle>
            <Pressable
              testID="destination-manual-hospital-toggle"
              accessibilityRole="button"
              onPress={() =>
                setManualHospitalSectionVisible((current) => !current)
              }
              style={({ pressed }) => ({
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Text
                style={{ color: theme.colors.accentMuted, fontWeight: "900" }}
              >
                {lang === "da"
                  ? "Vælg hospital manuelt"
                  : "Choose hospital manually"}
              </Text>
            </Pressable>

            {manualHospitalSectionVisible && (
              <View style={{ gap: 10 }}>
                <SimpleDropdown<HospitalCode>
                  label="Hospital"
                  value={manualHospitalCode}
                  open={manualHospitalOpen}
                  onToggle={() => {
                    const nextOpen = !manualHospitalOpen;
                    closeAllDropdowns();
                    setManualHospitalOpen(nextOpen);
                  }}
                  options={MANUAL_HOSPITAL_CODES}
                  onSelect={(value) => {
                    setManualHospitalCode(value);
                    setManualHospitalOpen(false);
                  }}
                  renderValue={(value) =>
                    hospitalLabel(t as TranslateFn, value)
                  }
                  renderOption={(value) => (
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      {hospitalLabel(t as TranslateFn, value)}
                    </Text>
                  )}
                  placeholder={
                    lang === "da" ? "Vælg hospital" : "Choose hospital"
                  }
                  maxHeight={260}
                />
                {!!manualHospitalCode && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setManualHospitalCode("")}
                    style={({ pressed }) => ({
                      minHeight: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.65 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: theme.colors.accentMuted,
                        fontWeight: "800",
                        textAlign: "center",
                      }}
                    >
                      {lang === "da"
                        ? "Brug automatisk resultat igen"
                        : "Use automatic result again"}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

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

          <ClinicalDisclosure
            disclaimer={reference?.disclaimer[lang] ?? t("dest_page_disclaimer")}
            sourcesIntro={reference?.sourcesSub[lang] ?? t("dest_sources_sub")}
            sources={renderedSources}
          />
        </ScrollView>
      </Screen>
    </Background>
  );
}
