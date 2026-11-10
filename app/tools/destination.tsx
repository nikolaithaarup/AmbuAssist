import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
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
  parseReverseGeocodedHouseNumber,
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
  BYEN_STREET_ALIASES,
  loadVisitationData,
  LOCAL_VISITATION_DATA,
  type BackendVisitationData,
} from "../../src/services/visitationService";
import {
  reverseGeocodeDestination,
  type DestinationGeocodedAddress,
} from "../../src/services/destinationGeocoder";
import { buildGpsConfirmationChoices, type GpsConfirmationChoice } from "../../src/domain/destination/gpsConfirmation";
import { useSettings } from "../../src/state/settings";
import { Background } from "../../src/ui/Background";
import { ClinicalDisclosure } from "../../src/ui/ClinicalDisclosure";
import { CollapsibleCard } from "../../src/ui/CollapsibleCard";
import {
  Input,
  Label,
  Screen,
  Subtle,
  Title,
} from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";
import { openPhoneNumber } from "../../src/services/phoneAction";
import { usePressFeedback } from "../../src/ui/motion";
import { MotionPresence } from "../../src/ui/MotionPresence";
import { useResponsiveLayout } from "../../src/ui/responsive";
import {
  ToolActionButton,
  ToolPageHeader,
  ToolSectionLabel,
  ToolSurface,
} from "../../src/ui/ToolSurface";

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
  getIntentForRegionCategory,
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

type GeocodeResolutionContext = {
  accuracy: number | null;
  cachedAgeMs: number;
  locationSource: "fresh" | "cached";
  reverseGeocodeDurationMs: number;
};

const MANUAL_HOSPITAL_CODES: HospitalCode[] = [
  "AMH", "BBH", "FRH", "GEH", "GLO", "HEH", "HVH", "NOH", "RH",
];

const VISITATION_BYEN_URL =
  "https://drive.google.com/file/d/18gnYztqAw40PxuGuP5N_iEDmksYk-eIX/view?usp=sharing";

const VISITATION_REGIONEN_URL =
  "https://drive.google.com/file/d/1HS25c5EPt1oP3WbzT6jA99TMiprOgvVh/view?usp=sharing";

const REGION_CATEGORY_LABEL_KEYS: Record<DestinationCategoryIntent, string> = {
  traumecenter: "dest_reg_traumecenter",
  skadestue: "dest_intent_skadestue",
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

function getRegionCategoryLabel(
  t: TranslateFn,
  category: DestinationCategoryIntent,
) {
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
  const pressFeedback = usePressFeedback();
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
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
            </View>
            {selected ? (
              <Text
                accessibilityElementsHidden
                style={{
                  color: theme.colors.accentMuted,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                ✓
              </Text>
            ) : null}
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ width: "100%", minWidth: 0, gap: 8 }}>
      {!!label && <Label>{label}</Label>}

      <Animated.View style={pressFeedback.animatedStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            typeof displayValue === "string" ? displayValue : label
          }
          accessibilityState={{ expanded: open }}
          onPress={onToggle}
          onPressIn={pressFeedback.onPressIn}
          onPressOut={pressFeedback.onPressOut}
          style={{
            width: "100%",
            minWidth: 0,
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
            <View style={{ flex: 1, minWidth: 0 }}>
              {typeof displayValue === "string" ? (
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {displayValue}
                </Text>
              ) : (
                displayValue
              )}
            </View>

            <Text style={{ color: theme.colors.mutedText }}>
              {open ? "⌃" : "⌄"}
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      <MotionPresence visible={open} testID="destination-suggestions-transition">
        <View
          style={{
            paddingVertical: 4,
            gap: 8,
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
      </MotionPresence>
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
  const pwa = Platform.OS === "web";
  const pressFeedback = usePressFeedback();

  return (
    <Animated.View
      style={[
        { width: "100%", minWidth: 0 },
        pressFeedback.animatedStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={pressFeedback.onPressIn}
        onPressOut={pressFeedback.onPressOut}
        style={({ pressed }) => ({
          minHeight: pwa ? 54 : 52,
          borderRadius: pwa ? theme.radii.control : 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(220,230,199,0.42)",
          backgroundColor: theme.colors.accentMuted,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
        })}
      >
        <Text
          style={{
            color: theme.colors.onAccent,
            fontSize: 16,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function DestinationTool() {
  const { t } = useT();
  const { settings, setSettings } = useSettings();
  const { isCompact } = useResponsiveLayout();
  const lang = settings.language === "da" ? "da" : "en";

  const [visitationData, setVisitationData] = useState<BackendVisitationData>(
    LOCAL_VISITATION_DATA,
  );

  const BYEN_MAP = visitationData.byen.map;
  const STREET_ALIASES = visitationData.byen.aliases ?? BYEN_STREET_ALIASES;
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
  const [pendingAddressCandidates, setPendingAddressCandidates] = useState<
    DestinationGeocodedAddress[]
  >([]);
  const gpsConfirmationChoices = useMemo(
    () => buildGpsConfirmationChoices(pendingAddressCandidates, STREET_SAMPLE, STREET_ALIASES),
    [pendingAddressCandidates, STREET_SAMPLE, STREET_ALIASES],
  );

  const [selectedAddressCandidate, setSelectedAddressCandidate] = useState<
    number | null
  >(null);
  const pendingGeocodeContextRef = useRef<GeocodeResolutionContext | null>(null);

  const [bydel, setBydel] = useState<Bydel | "">("");
  const [kommune, setKommune] = useState<Kommune | "">("");
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  const [streetRouteNeedsHouseNumber, setStreetRouteNeedsHouseNumber] = useState(false);
  const [streetRouteNeedsSide, setStreetRouteNeedsSide] = useState(false);
  const [gpsStreetNeedsDetails, setGpsStreetNeedsDetails] = useState(false);
  const [streetRouteNeedsPostalCode, setStreetRouteNeedsPostalCode] = useState(false);

  const [regCat, setRegCat] = useState<DestinationCategoryIntent>(
    "skadestue",
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
  const [loadedPhoneContext, setLoadedPhoneContext] = useState("");
  const [departmentChooserVisible, setDepartmentChooserVisible] = useState(false);
  const automaticGpsStartedRef = useRef(false);

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
  const geocodeBlockedUntilRef = useRef(0);
  const geocodeInFlightRef = useRef<Promise<DestinationGeocodedAddress[]> | null>(
    null,
  );

  const GEOCODE_COOLDOWN_MS = 20_000;
  const GEOCODE_BLOCK_MS = 90_000;

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
    setStreetRouteNeedsSide(false);
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

  const callHospitalNumber = async (phone: string) => {
    await openPhoneNumber(phone).catch(() => false);
  };

  const getReverseGeocodeSafely = async (lat: number, lon: number) => {
    const now = Date.now();

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

    const promise = reverseGeocodeDestination({
      latitude: lat,
      longitude: lon,
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
      .map((item) => getIntentForRegionCategory(item.key as RegionCategory))
      .filter((key) => !!REGION_CATEGORY_LABEL_KEYS[key]);

    const keys =
      backendKeys.length > 0
        ? backendKeys
        : (Object.keys(
            REGION_CATEGORY_LABEL_KEYS,
          ) as DestinationCategoryIntent[]);

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
      STREET_ALIASES,
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
      setStreetRouteNeedsSide(false);
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
      setStreetRouteNeedsHouseNumber(result.status === "needs_house_number");
      setStreetRouteNeedsSide(result.status === "needs_side");
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
    setStreetRouteNeedsSide(false);
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

  const requestedPhoneContext =
    resolvedHospital && resolvedHospital.code !== "UNKNOWN"
      ? resolvedHospital.code + ":" + selectedSpecialtyKey
      : "";
  const phoneContextPending = !!requestedPhoneContext &&
    requestedPhoneContext !== loadedPhoneContext;

  useEffect(() => {
    let active = true;

    const loadHospitalPhones = async () => {
      if (!resolvedHospital || resolvedHospital.code === "UNKNOWN") {
        setLoadedPhoneContext("");
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
        setLoadedPhoneContext(requestedPhoneContext);

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
        setLoadedPhoneContext("");
        setSelectedPhoneId("");
      } finally {
        if (active) setLoadingHospitalPhones(false);
      }
    };

    loadHospitalPhones();
    return () => {
      active = false;
    };
  }, [resolvedHospital?.code, selectedSpecialtyKey, requestedPhoneContext]);

  const selectedHospitalPhone = useMemo(() => {
    if (phoneContextPending || loadingHospitalPhones || !requestedPhoneContext) return null;
    return hospitalPhones.find((item) => item.id === selectedPhoneId) ?? null;
  }, [hospitalPhones, selectedPhoneId, phoneContextPending, loadingHospitalPhones, requestedPhoneContext]);

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
        {item.specialtyKey === "main" ? (lang === "da" ? "Hovednummer" : "Main number") : getPhoneDisplayName(item)}
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
          {item.specialtyKey === "main" ? (lang === "da" ? "Hovednummer" : "Main number") : getPhoneDisplayName(item)}
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
    setGpsStreetNeedsDetails(false);
    setPendingAddressCandidates([]);
    setSelectedAddressCandidate(null);
    pendingGeocodeContextRef.current = null;
    setRequiresAddressConfirmation(false);
    setStreetQ(text);
    setStreetOpen(true);
    setRegCatOpen(false);
    setPhoneDropdownOpen(false);
    setManualHospitalCode("");
    const match = matchManualLocation(
      text,
      STREET_SAMPLE,
      ALL_KOMMUNER,
      STREET_ALIASES,
    );
    applyManualLocationMatch(match, text);
    if (match.area !== "unresolved") setStreetOpen(false);
  };

  const applyGeocodedAddress = (
    first: DestinationGeocodedAddress,
    context: GeocodeResolutionContext,
    addressConfirmed = false,
  ) => {
    const postcode = String(first.postalCode ?? "").trim();
    const city = String(first.city ?? "").trim();
    const district = String(first.district ?? "").trim();
    const subregion = String(first.subregion ?? "").trim();
    const formattedAddress = String(first.formattedAddress ?? "").trim();
    const street = parseStreetName(first.street, formattedAddress) ?? "";
    const parsedNumber = parseReverseGeocodedHouseNumber({
      streetNumber: first.streetNumber,
      street: first.street,
      name: first.name,
      formattedAddress,
    });
    const region = String(first.region ?? "").trim();
    const name = String(first.name ?? "").trim();
    const geocoderDistance =
      typeof first.distanceMeters === "number" &&
      Number.isFinite(first.distanceMeters)
        ? Math.max(0, first.distanceMeters)
        : 0;
    const confidenceAccuracy = Math.max(
      context.accuracy ?? 0,
      geocoderDistance,
    );
    const requiresConfidenceConfirmation = (confidence: ReturnType<
      typeof classifyLocationConfidence
    >) =>
      Platform.OS === "web"
        ? !addressConfirmed
        : getConfidenceUx(confidence) === "confirm";

    setDiagnostics((current) => ({
      ...current,
      reverseGeocodeDurationMs: context.reverseGeocodeDurationMs,
      geocoderDistanceMeters: geocoderDistance,
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
      accuracyMeters: confidenceAccuracy || undefined,
      locationSource: context.locationSource,
      cachedAgeMs: context.cachedAgeMs,
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
      municipalityCode: first.municipalityCode,
      },
      STREET_SAMPLE,
      STREET_ALIASES,
    );

    if (strategy.area === "byen") {
      if (strategy.source === "postal_district_fallback") {
        const confidence = classifyLocationConfidence({
          accuracy: confidenceAccuracy,
          hasStreet: true,
          hasCompleteRoutingAddress: true,
        });
        const needsConfirmation = requiresConfidenceConfirmation(confidence);
        setArea("byen");
        setKommune("");
        setBydel(strategy.officialBydel);
        setSelectedStreet(street);
        setStreetQ(street);
        setHouseNumberQ(
          parsedNumber.number
            ? String(parsedNumber.number) + (parsedNumber.suffix ?? "")
            : "",
        );
        setPostalCodeQ(strategy.postcode);
        resetStreetRouteState();
        setDetectedArea({ ...detectedAreaBase, confidence });
        setManualHospitalCode("");
        setRequiresAddressConfirmation(needsConfirmation);
        setDiagnostics((current) => ({
          ...current,
          confidence,
          routingArea: "byen",
          matchStatus: "postal_district_fallback",
          matchSource: "postal_district_fallback",
          fallbackPostcode: strategy.postcode,
          destinationDistrict: strategy.officialBydel,
        }));
        closeAllDropdowns();
        setLocationStatus("matched");
        setLocationMessage(
          needsConfirmation
            ? "Kontrollér den fundne adresse, før destinationen bruges."
            : "",
        );
        return;
      }

      const routeResult = strategy.route;
      const confidence = classifyLocationConfidence({
        accuracy: confidenceAccuracy,
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
        const needsConfirmation = requiresConfidenceConfirmation(confidence);
        setBydel(routeResult.officialBydel);
        setStreetRouteNeedsHouseNumber(false);
        setStreetRouteNeedsPostalCode(false);
        setRequiresAddressConfirmation(needsConfirmation);
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
          needsConfirmation
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
      setStreetRouteNeedsPostalCode(routeResult.status === "needs_postal_code");
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
        accuracy: confidenceAccuracy,
        hasStreet: !!street,
        hasCompleteRoutingAddress: true,
      });
      const confidenceUx = getConfidenceUx(confidence);
      const needsConfirmation = requiresConfidenceConfirmation(confidence);
      setArea(confidenceUx === "recovery" ? null : "region");
      setBydel("");
      setKommune(confidenceUx === "recovery" ? "" : strategy.kommune);
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
      setRequiresAddressConfirmation(needsConfirmation);
      setDiagnostics((current) => ({
        ...current,
        confidence,
        routingArea: "region",
        destinationMunicipality: strategy.kommune,
      }));
      closeAllDropdowns();
      setLocationStatus(confidence === "poor" ? "poor_accuracy" : "matched");
      setLocationMessage(
        confidence === "poor"
          ? "Placeringen kan ikke bruges sikkert. Prøv GPS igen, eller indtast adressen manuelt."
          : needsConfirmation
            ? "Kontrollér den fundne adresse, før destinationen bruges."
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
      setGpsStreetNeedsDetails(false);
      setPendingAddressCandidates([]);
      setSelectedAddressCandidate(null);
      pendingGeocodeContextRef.current = null;
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
        setLocationMessage(
          lang === "da"
            ? "Der blev ikke fundet en sikker adresse inden for 100 meter. Prøv GPS igen, eller søg adressen manuelt."
            : "No reliable address was found within 100 metres. Retry GPS or enter the address manually.",
        );
        return;
      }

      if (Platform.OS === "web") {
        const candidates = geocoded.slice(0, 5);
        setPendingAddressCandidates(candidates);
        setSelectedAddressCandidate(candidates.length === 1 ? 0 : null);
        pendingGeocodeContextRef.current = {
          accuracy,
          cachedAgeMs,
          locationSource,
          reverseGeocodeDurationMs: Date.now() - reverseGeocodeStartedAt,
        };
        setRequiresAddressConfirmation(true);
        setLocationStatus("matched");
        setLocationMessage(
          candidates.length > 1
            ? lang === "da"
              ? "Vælg den korrekte adresse og bekræft den, før destinationen beregnes."
              : "Choose and confirm the correct address before the destination is calculated."
            : lang === "da"
              ? "Bekræft den fundne adresse, før destinationen beregnes."
              : "Confirm the detected address before the destination is calculated.",
        );
        return;
      }

      const postcode = String(first.postalCode ?? "").trim();
      const city = String(first.city ?? "").trim();
      const district = String(first.district ?? "").trim();
      const subregion = String(first.subregion ?? "").trim();
      const formattedAddress = String(first.formattedAddress ?? "").trim();
      const street = parseStreetName(first.street, formattedAddress) ?? "";
      const parsedNumber = parseReverseGeocodedHouseNumber({
        streetNumber: first.streetNumber,
        street: first.street,
        name: first.name,
        formattedAddress,
      });
      const region = String(first.region ?? "").trim();
      const name = String(first.name ?? "").trim();
      const geocoderDistance =
        typeof first.distanceMeters === "number" &&
        Number.isFinite(first.distanceMeters)
          ? Math.max(0, first.distanceMeters)
          : 0;
      const confidenceAccuracy = Math.max(accuracy ?? 0, geocoderDistance);

      setDiagnostics((current) => ({
        ...current,
        reverseGeocodeDurationMs: Date.now() - reverseGeocodeStartedAt,
        rawReverseGeocode: first,
        geocoderDistanceMeters: geocoderDistance,
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
        accuracyMeters: confidenceAccuracy || undefined,
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
        municipalityCode: first.municipalityCode,
        },
        STREET_SAMPLE,
        STREET_ALIASES,
      );

      if (strategy.area === "byen") {
        if (strategy.source === "postal_district_fallback") {
          const confidence = classifyLocationConfidence({
            accuracy: confidenceAccuracy,
            hasStreet: true,
            hasCompleteRoutingAddress: true,
          });
          setArea("byen");
          setKommune("");
          setBydel(strategy.officialBydel);
          setSelectedStreet(street);
          setStreetQ(street);
          setHouseNumberQ(
            parsedNumber.number
              ? String(parsedNumber.number) + (parsedNumber.suffix ?? "")
              : "",
          );
          setPostalCodeQ(strategy.postcode);
          resetStreetRouteState();
          setDetectedArea({ ...detectedAreaBase, confidence });
          setManualHospitalCode("");
          setRequiresAddressConfirmation(
            getConfidenceUx(confidence) === "confirm",
          );
          setDiagnostics((current) => ({
            ...current,
            confidence,
            routingArea: "byen",
            matchStatus: "postal_district_fallback",
            matchSource: "postal_district_fallback",
            fallbackPostcode: strategy.postcode,
            destinationDistrict: strategy.officialBydel,
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

        const routeResult = strategy.route;
        const confidence = classifyLocationConfidence({
          accuracy: confidenceAccuracy,
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
          accuracy: confidenceAccuracy,
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
      } else if (error?.code === "offline") {
        setLocationStatus("geocode_failed");
        setLocationMessage(
          lang === "da"
            ? "Ingen internetforbindelse til adresseopslag. Søg adressen eller vælg hospital manuelt."
            : "No internet connection for address lookup. Search the address or choose a hospital manually.",
        );
      } else if (
        error?.code === "provider_error" ||
        error?.code === "invalid_response"
      ) {
        setLocationStatus("geocode_failed");
        setLocationMessage(
          lang === "da"
            ? "Adresseopslaget er midlertidigt utilgængeligt. Prøv igen, søg adressen eller vælg hospital manuelt."
            : "Address lookup is temporarily unavailable. Retry, search the address, or choose a hospital manually.",
        );
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

  const confirmGpsChoice = (choice: GpsConfirmationChoice) => {
    const context = pendingGeocodeContextRef.current;
    const candidate = choice.kind === "address"
      ? pendingAddressCandidates[choice.candidateIndex]
      : choice.kind === "street" && choice.postalFallbackCandidate !== undefined
        ? pendingAddressCandidates[choice.postalFallbackCandidate]
        : null;
    setPendingAddressCandidates([]);
    setSelectedAddressCandidate(null);
    pendingGeocodeContextRef.current = null;
    setRequiresAddressConfirmation(false);
    setGpsStreetNeedsDetails(false);
    setLocationMessage("");

    if (choice.kind === "municipality") {
      applyManualLocationMatch({ area: "region", kommune: choice.kommune }, choice.label);
      return;
    }
    if (choice.kind === "street") {
      if (candidate && context) {
        // Preserve the existing reviewed Amager postal-district fallback.
        applyGeocodedAddress(candidate, context, true);
        return;
      }
      setHouseNumberQ("");
      setPostalCodeQ(choice.postcode ?? "");
      const resolved = applyStreetRoute(choice.street, "", undefined, choice.postcode);
      if (!resolved) {
        const rule = resolveStreetRoute(
          STREET_SAMPLE, choice.street, "", undefined, choice.postcode, STREET_ALIASES,
        );
        const needsDetail = ["needs_side", "needs_house_number", "needs_postal_code"].includes(rule.status);
        setGpsStreetNeedsDetails(needsDetail);
        setSearchVisible(!needsDetail);
      }
      return;
    }
    if (candidate && context) {
      applyGeocodedAddress(candidate, context, true);
    } else {
      setSearchVisible(true);
    }
  };

  useEffect(() => {
    if (automaticGpsStartedRef.current) return;
    automaticGpsStartedRef.current = true;
    void detectLocation();
    // One automatic lookup per mounted screen, not per state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryLocation = () => {
    lastGeocodeAtRef.current = 0;
    void detectLocation();
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
        <ToolPageHeader
          title={t("dest_title")}
          subtitle={
            lang === "da"
              ? "Hospital, visitation og opkald samlet ét sted."
              : "Hospital, department and calling in one place."
          }
        />

        <ScrollView
          style={{ flex: 1, minWidth: 0 }}
          contentContainerStyle={{
            width: "100%",
            minWidth: 0,
            gap: Platform.OS === "web" ? (isCompact ? 16 : 18) : 18,
            paddingBottom: 28,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {!resolvedHospital && !requiresAddressConfirmation && (
            <View testID="destination-awaiting-result" style={{ paddingVertical: 10, gap: 4 }}>
              <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 17 }}>
                {detectingLocation || locationStatus === "initial"
                  ? lang === "da" ? "Finder destination…" : "Finding destination…"
                  : requiresAddressConfirmation
                    ? lang === "da" ? "Bekræft placering" : "Confirm location"
                    : lang === "da" ? "Ingen sikker destination endnu" : "No confirmed destination yet"}
              </Text>
              <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>
                {lang === "da" ? "Kontrollér patientens placering før opkald." : "Confirm the patient location before calling."}
              </Text>
            </View>
          )}

          {/* destination-compact-call-card-v1: no stale phone action during context changes */}
          {!categoryUnavailable && resolvedHospital ? (
            <ToolSurface
              tone="accent"
              testID="destination-result"
              style={{ width: "100%", minWidth: 0, gap: 8, paddingHorizontal: 9, paddingVertical: 7 }}
            >
              <Title style={{ fontSize: 22, lineHeight: 28 }}>
                {resolvedHospital.label}
              </Title>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "700" }}>
                {selectedCategoryLabel}
              </Text>
              {manualHospitalCode ? (
                <Text style={{ color: theme.colors.mutedText, fontSize: 12 }}>
                  {lang === "da" ? "Manuelt valgt hospital" : "Manually selected hospital"}
                </Text>
              ) : null}

              {loadingHospitalPhones || phoneContextPending ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 }}>
                  <ActivityIndicator size="small" color={theme.colors.accentMuted} />
                  <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>
                    {lang === "da" ? "Henter kontakt…" : "Loading contact…"}
                  </Text>
                </View>
              ) : selectedHospitalPhone ? (
                <View style={{ gap: 9, marginTop: 3 }}>
                  {hospitalPhones.length > 1 ? (
                    <View testID="destination-phone-type">
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
                        placeholder={lang === "da" ? "Vælg kontakttype" : "Choose contact type"}
                        maxHeight={220}
                      />
                    </View>
                  ) : (
                    <Text
                      testID="destination-phone-type"
                      style={{ color: theme.colors.mutedText, fontSize: 14, fontWeight: "700" }}
                    >
                      {selectedHospitalPhone.specialtyKey === "main"
                        ? lang === "da" ? "Hovednummer" : "Main number"
                        : getPhoneDisplayName(selectedHospitalPhone)}
                    </Text>
                  )}
                  <View testID="destination-phone-call">
                    <ToolActionButton
                      compact
                      tone="call"
                      label={lang === "da" ? "Ring op" : "Call"}
                      onPress={() => callHospitalNumber(selectedHospitalPhone.phone)}
                    />
                  </View>
                </View>
              ) : (
                <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>
                  {lang === "da" ? "Intet telefonnummer fundet." : "No phone number found."}
                </Text>
              )}

              {!loadingHospitalPhones && !phoneContextPending &&
                hospitalPhones.some((item) => item.source === "bundled") && (
                  <Text style={{ color: theme.colors.warn, fontSize: 12, lineHeight: 17 }}>
                    {lang === "da"
                      ? "Offline-kontaktliste – verificér nummeret før opkald."
                      : "Offline contact list – verify the number before calling."}
                  </Text>
                )}
            </ToolSurface>
          ) : null}

          <View style={{ width: "100%", minWidth: 0, gap: 10 }}>
            <View style={{ width: "100%", minWidth: 0 }}>
          <View
            testID="destination-primary-column"
            style={{
              width: "100%",
              minWidth: 0,
              gap: isCompact ? 12 : 14,
            }}
          >
            <Pressable
              testID="destination-department-toggle"
              accessibilityRole="button"
              accessibilityState={{ expanded: departmentChooserVisible }}
              accessibilityLabel={lang === "da" ? "Skift visitationstype" : "Change destination department"}
              onPress={() => setDepartmentChooserVisible((v) => !v)}
              style={{ minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: theme.colors.mutedText, fontSize: 12, fontWeight: "700" }}>
                  {lang === "da" ? "VISITATIONSTYPE" : "DEPARTMENT"}
                </Text>
                <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 17 }}>{selectedCategoryLabel}</Text>
              </View>
              <Text style={{ color: theme.colors.accentMuted, fontWeight: "700" }}>
                {departmentChooserVisible ? "▲" : "▼"}
              </Text>
            </Pressable>
            {departmentChooserVisible && <DestinationCategoryPicker
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
              onSelect={(value) => { setRegCat(value); setDepartmentChooserVisible(false); }}
              onToggleFavourite={toggleCategoryFavourite}
            />}

            <View testID="destination-location-row" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
              <View style={{ flex: 1, minWidth: 150, gap: 3 }}>
                <Text style={{ color: theme.colors.mutedText, fontWeight: "700", fontSize: 12 }}>
                  {lang === "da" ? "PLACERING" : "LOCATION"}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "700" }}>
                  {requiresAddressConfirmation
                    ? lang === "da" ? "Kræver bekræftelse" : "Needs confirmation"
                    : area === "byen" && bydel
                      ? (selectedStreet ? selectedStreet + (houseNumberQ ? " " + houseNumberQ : "") + " · " + bydel : bydel)
                      : area === "region" && kommune
                        ? kommune
                        : detectingLocation
                          ? lang === "da" ? "Finder placering…" : "Finding location…"
                          : lang === "da" ? "Ingen bekræftet placering" : "No confirmed location"}
                </Text>
                {detectedArea && <Text style={{ color: theme.colors.mutedText, fontSize: 12 }}>
                  {lang === "da" ? "Enhedens GPS — kontrollér patientens adresse" : "Device GPS — verify patient address"}
                </Text>}
              </View>
              <Pressable
                testID="destination-change-location"
                accessibilityRole="button"
                onPress={() => setSearchVisible(true)}
                style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 6 }}
              >
                <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>
                  {lang === "da" ? "Skift" : "Change"}
                </Text>
              </Pressable>
              <View testID="destination-primary-gps">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={lang === "da" ? "Opdater GPS" : "Refresh GPS"}
                  disabled={detectingLocation}
                  onPress={retryLocation}
                  style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 6, opacity: detectingLocation ? 0.5 : 1 }}
                >
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>
                    {lang === "da" ? "Opdater GPS" : "Refresh GPS"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {categoryUnavailable && (
              <View
                testID="destination-category-unavailable"
                style={{
                  gap: 4,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.colors.warn,
                  paddingHorizontal: 11,
                  paddingVertical: 8,
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

            <MotionPresence
              visible={detectingLocation}
              enterDelayMs={120}
              testID="destination-loading-transition"
            >
              <View
                style={{
                  minHeight: 64,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  paddingHorizontal: 12,
                  borderRadius: theme.radii.control,
                  backgroundColor: theme.colors.accentSurface,
                }}
              >
                <ActivityIndicator color={theme.colors.accentMuted} />
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
            </MotionPresence>

            {!detectingLocation &&
              (detectedArea || pendingAddressCandidates.length > 0) &&
              requiresAddressConfirmation && (
                <View
                  testID="destination-gps-confirmation"
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: theme.colors.warn,
                    paddingHorizontal: 11,
                    paddingVertical: 8,
                    gap: 9,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 17 }}>
                    {gpsConfirmationChoices.length > 0 && gpsConfirmationChoices.every(c => c.kind === "municipality")
                      ? lang === "da" ? "Vælg kommune" : "Choose municipality"
                      : gpsConfirmationChoices.length > 0 && gpsConfirmationChoices.every(c => c.kind === "street")
                        ? lang === "da" ? "Vælg gade" : "Choose street"
                        : lang === "da" ? "Bekræft placering" : "Confirm location"}
                  </Text>
                  {gpsConfirmationChoices.length === 0 && !!locationMessage ? (
                    <Text style={{ color: theme.colors.mutedText, fontSize: 13, lineHeight: 18 }}>
                      {locationMessage}
                    </Text>
                  ) : null}
                  {gpsConfirmationChoices.length > 0 ? (
                    <View style={{ gap: 8 }}>
                      {gpsConfirmationChoices.map((choice, index) => (
                        <Pressable
                          key={choice.key}
                          testID={`destination-gps-choice-${choice.kind}-${index}`}
                          accessibilityRole="button"
                          accessibilityLabel={choice.label}
                          onPress={() => confirmGpsChoice(choice)}
                          style={({ pressed }) => ({
                            minHeight: 52,
                            justifyContent: "center",
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.card,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            opacity: pressed ? 0.72 : 1,
                          })}
                        >
                          <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 16 }}>
                            {choice.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <View testID="destination-confirm-address">
                      <Text style={{ color: theme.colors.text, marginBottom: 10 }}>
                        {detectedArea?.label || t("dest_unknown_area")}
                      </Text>
                      <DestinationPrimaryButton
                        label={lang === "da" ? "Bekræft placering" : "Confirm location"}
                        onPress={() => {
                          setRequiresAddressConfirmation(false);
                          setLocationMessage("");
                        }}
                      />
                    </View>
                  )}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setPendingAddressCandidates([]);
                        setSelectedAddressCandidate(null);
                        pendingGeocodeContextRef.current = null;
                        setRequiresAddressConfirmation(false);
                        setGpsStreetNeedsDetails(false);
                        setArea(null); setBydel(""); setKommune("");
                        setDetectedArea(null);
                        setLocationMessage("");
                        setSearchVisible(true);
                      }}
                      style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 8 }}
                    >
                      <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>
                        {lang === "da" ? "Ret adresse" : "Correct address"}
                      </Text>
                    </Pressable>
                    <Pressable
                      testID="destination-retry-gps"
                      accessibilityRole="button"
                      onPress={retryLocation}
                      style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 8 }}
                    >
                      <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>
                        {lang === "da" ? "Prøv GPS igen" : "Retry GPS"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

            {gpsStreetNeedsDetails && !!selectedStreet && !searchVisible && (
              <View testID="destination-gps-street-details" style={{ gap: 10, paddingVertical: 8, paddingHorizontal: 11, borderLeftColor: theme.colors.warn, borderLeftWidth: 3 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {selectedStreet}
                </Text>
                {streetRouteNeedsSide && (
                  <View style={{ gap: 8 }}>
                    <Text style={{ color: theme.colors.text }}>
                      {lang === "da" ? "Hvilken side af gaden?" : "Which side of the street?"}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {(["odd", "even"] as StreetSide[]).map(side => (
                        <Pressable
                          key={side}
                          testID={`destination-gps-side-${side}`}
                          accessibilityRole="button"
                          onPress={() => {
                            if (applyStreetRoute(selectedStreet, side, undefined, postalCodeQ || undefined))
                              setGpsStreetNeedsDetails(false);
                          }}
                          style={{ minHeight: 48, flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: 12 }}
                        >
                          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                            {side === "odd" ? lang === "da" ? "Ulige" : "Odd" : lang === "da" ? "Lige" : "Even"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
                {streetRouteNeedsHouseNumber && (
                  <View style={{ gap: 6 }}>
                    <Label>{lang === "da" ? "Husnummer" : "House number"}</Label>
                    <Input
                      value={houseNumberQ}
                      onChangeText={value => {
                        const cleaned = value.replace(/[^0-9a-zæøå]/giu, "").slice(0, 6);
                        setHouseNumberQ(cleaned);
                        if (applyStreetRoute(selectedStreet, "", parseHouseNumber(cleaned).number, postalCodeQ || undefined))
                          setGpsStreetNeedsDetails(false);
                      }}
                      placeholder="Fx 13A"
                    />
                  </View>
                )}
                {streetRouteNeedsPostalCode && (
                  <View style={{ gap: 6 }}>
                    <Label>{lang === "da" ? "Postnummer" : "Postcode"}</Label>
                    <Input
                      value={postalCodeQ}
                      onChangeText={value => {
                        const postcode = value.replace(/\D/g, "").slice(0, 4);
                        setPostalCodeQ(postcode);
                        if (applyStreetRoute(selectedStreet, "", parseHouseNumber(houseNumberQ).number, postcode || undefined))
                          setGpsStreetNeedsDetails(false);
                      }}
                      keyboardType="number-pad"
                    />
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => { setGpsStreetNeedsDetails(false); setSearchVisible(true); }}
                  style={{ minHeight: 44, justifyContent: "center" }}
                >
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>
                    {lang === "da" ? "Søg manuelt i stedet" : "Search manually instead"}
                  </Text>
                </Pressable>
              </View>
            )}

            <MotionPresence
              visible={!!locationMessage && !detectingLocation && !requiresAddressConfirmation}
              testID="destination-feedback-transition"
            >
              <View
                style={{
                  gap: 4,
                  paddingHorizontal: 11,
                  paddingVertical: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.colors.warn,
                }}
              >
                <ToolSectionLabel>
                  {lang === "da" ? "Placering kræver handling" : "Location needs attention"}
                </ToolSectionLabel>
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
              </View>
            </MotionPresence>

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
                    onPress={retryLocation}
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
              accessibilityState={{ expanded: searchVisible }}
              onPress={toggleSearchVisible}
              style={({ pressed }) => ({
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12,
                borderRadius: theme.radii.control,
                backgroundColor: pressed
                  ? theme.colors.pressed
                  : "rgba(255,255,255,0.025)",
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

          <MotionPresence
            visible={searchVisible}
            testID="destination-manual-search-transition"
          >
            <View style={{ gap: 12, paddingVertical: 8 }}>
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
                      matchManualLocation(
                        value,
                        STREET_SAMPLE,
                        ALL_KOMMUNER,
                        STREET_ALIASES,
                      ),
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

              {!!selectedStreet && streetRouteNeedsSide && (
                <View style={{ gap: 8 }}>
                  <Label>{lang === "da" ? "Gadeside" : "Street side"}</Label>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {(["odd", "even"] as StreetSide[]).map(side => (
                      <Pressable
                        key={side}
                        accessibilityRole="button"
                        onPress={() => applyStreetRoute(selectedStreet, side, undefined, postalCodeQ || undefined)}
                        style={{ flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: theme.colors.cardBorder }}
                      >
                        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                          {side === "odd" ? lang === "da" ? "Ulige" : "Odd" : lang === "da" ? "Lige" : "Even"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

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
          </MotionPresence>

            </View>
            <View style={{ width: "100%", minWidth: 0 }}>
          <View
            testID="destination-secondary-column"
            style={{ width: "100%", minWidth: 0, gap: 12 }}
          >
          <View style={{ gap: 5, paddingVertical: 4 }}>
            <Pressable
              testID="destination-manual-hospital-toggle"
              accessibilityRole="button"
              accessibilityState={{ expanded: manualHospitalSectionVisible }}
              onPress={() =>
                setManualHospitalSectionVisible((current) => !current)
              }
              style={({ pressed }) => ({
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12,
                borderRadius: theme.radii.control,
                backgroundColor: pressed
                  ? theme.colors.pressed
                  : "rgba(255,255,255,0.025)",
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

            <MotionPresence
              visible={manualHospitalSectionVisible}
              testID="destination-manual-hospital-transition"
            >
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
            </MotionPresence>
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
          </View>
            </View>
          </View>

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
