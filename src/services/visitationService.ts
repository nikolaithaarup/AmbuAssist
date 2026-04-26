import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { db } from "../lib/firebase";

import type {
  Bydel,
  ByenCategory,
  HospitalCode,
  Kommune,
  RegionCategory,
} from "../features/destination/types";

import {
  BYEN_CATEGORIES,
  BYEN_MAP,
  STREET_SAMPLE,
} from "../features/destination/data/byen";

import { REGION_BYEN_MAP } from "../features/destination/data/regionByen";
import { REGION_MIDT_MAP } from "../features/destination/data/regionMidt";
import { REGION_NORD_MAP } from "../features/destination/data/regionNord";
import { REGION_SYD_MAP } from "../features/destination/data/regionSyd";

const CACHE_KEY = "ambuassist_visitation_regionh_v1";

export type VisitationCategory = {
  key: string;
  labelKey: string;
};

export type StreetSampleRow = {
  street: string;
  bydel: string;
};

export type BackendVisitationData = {
  version: string;
  updatedAt?: string;
  byen: {
    categories: VisitationCategory[];
    map: Record<Bydel, Partial<Record<ByenCategory, HospitalCode>>>;
    streetSample: StreetSampleRow[];
  };
  region: {
    categories: VisitationCategory[];
    map: Partial<
      Record<Kommune, Partial<Record<RegionCategory, HospitalCode>>>
    >;
  };
};

export const LOCAL_VISITATION_DATA: BackendVisitationData = {
  version: "local",
  byen: {
    categories: BYEN_CATEGORIES,
    map: BYEN_MAP,
    streetSample: STREET_SAMPLE,
  },
  region: {
    categories: [],
    map: {
      ...REGION_NORD_MAP,
      ...REGION_MIDT_MAP,
      ...REGION_SYD_MAP,
      ...REGION_BYEN_MAP,
    },
  },
};

function isObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function safeParseCached(value: string | null): BackendVisitationData | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (!isObject(parsed)) return null;
    if (!isObject(parsed.byen)) return null;
    if (!isObject(parsed.region)) return null;
    return parsed as BackendVisitationData;
  } catch {
    return null;
  }
}

export async function loadVisitationData(): Promise<BackendVisitationData> {
  const cached = safeParseCached(await AsyncStorage.getItem(CACHE_KEY));

  try {
    const regionRef = doc(db, "visitation_regions", "regionh");
    const regionSnap = await getDoc(regionRef);

    if (!regionSnap.exists()) {
      return cached ?? LOCAL_VISITATION_DATA;
    }

    const activeVersion = String(regionSnap.data()?.activeVersion || "v1");

    const areasRef = collection(
      db,
      "visitation_regions",
      "regionh",
      "versions",
      activeVersion,
      "areas",
    );

    const areasSnap = await getDocs(areasRef);

    const areas: Record<string, any> = {};
    areasSnap.forEach((areaDoc) => {
      areas[areaDoc.id] = areaDoc.data();
    });

    const byenArea = areas.byen;
    const regionByenArea = areas.regionByen;
    const regionMidtArea = areas.regionMidt;
    const regionNordArea = areas.regionNord;
    const regionSydArea = areas.regionSyd;

    if (!byenArea || !regionMidtArea) {
      return cached ?? LOCAL_VISITATION_DATA;
    }

    const backendData: BackendVisitationData = {
      version: activeVersion,
      updatedAt: String(regionSnap.data()?.updatedAt ?? ""),
      byen: {
        categories: byenArea.categories ?? BYEN_CATEGORIES,
        map: byenArea.map ?? BYEN_MAP,
        streetSample: byenArea.streetSample ?? STREET_SAMPLE,
      },
      region: {
        categories:
          regionMidtArea.categories ?? LOCAL_VISITATION_DATA.region.categories,
        map: {
          ...(regionNordArea?.map ?? {}),
          ...(regionMidtArea?.map ?? {}),
          ...(regionSydArea?.map ?? {}),
          ...(regionByenArea?.map ?? {}),
        },
      },
    };

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(backendData));

    return backendData;
  } catch (error) {
    console.log("Could not load backend visitation data:", error);
    return cached ?? LOCAL_VISITATION_DATA;
  }
}
