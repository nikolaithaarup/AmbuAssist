const admin = require("firebase-admin");
const serviceAccount = require("../../secrets/firebase-service-account.json");

import {
  BYEN_CATEGORIES,
  BYEN_MAP,
  STREET_SAMPLE,
} from "../features/destination/data/byen";

import { REGION_BYEN_MAP } from "../features/destination/data/regionByen";
import {
  REGION_MIDT_CATEGORIES,
  REGION_MIDT_DEFAULT,
  REGION_MIDT_MAP,
} from "../features/destination/data/regionMidt";
import { REGION_NORD_MAP } from "../features/destination/data/regionNord";
import { REGION_SYD_MAP } from "../features/destination/data/regionSyd";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const CONFIG = {
  dryRun: false,
  version: "v1",
};

function nowIso() {
  return new Date().toISOString();
}

const REGION_CATEGORY_LABEL_KEYS = REGION_MIDT_CATEGORIES;

async function seedVisitation() {
  const now = nowIso();

  const regionRef = db.collection("visitation_regions").doc("regionh");
  const versionRef = regionRef.collection("versions").doc(CONFIG.version);

  const areas = {
    byen: {
      key: "byen",
      label: "Byen",
      type: "city",
      categories: BYEN_CATEGORIES,
      map: BYEN_MAP,
      streetSample: STREET_SAMPLE,
      updatedAt: now,
    },

    regionByen: {
      key: "regionByen",
      label: "Regionen - Byen",
      type: "municipality",
      categories: REGION_CATEGORY_LABEL_KEYS,
      map: REGION_BYEN_MAP,
      updatedAt: now,
    },

    regionMidt: {
      key: "regionMidt",
      label: "Planlægningsområde Midt",
      type: "municipality",
      categories: REGION_MIDT_CATEGORIES,
      defaultMap: REGION_MIDT_DEFAULT,
      map: REGION_MIDT_MAP,
      updatedAt: now,
    },

    regionNord: {
      key: "regionNord",
      label: "Planlægningsområde Nord",
      type: "municipality",
      categories: REGION_CATEGORY_LABEL_KEYS,
      map: REGION_NORD_MAP,
      updatedAt: now,
    },

    regionSyd: {
      key: "regionSyd",
      label: "Planlægningsområde Syd",
      type: "municipality",
      categories: REGION_CATEGORY_LABEL_KEYS,
      map: REGION_SYD_MAP,
      updatedAt: now,
    },
  };

  console.log("Seeding visitation:", CONFIG.version);

  if (!CONFIG.dryRun) {
    await regionRef.set(
      {
        activeVersion: CONFIG.version,
        updatedAt: now,
      },
      { merge: true },
    );

    await versionRef.set(
      {
        version: CONFIG.version,
        active: true,
        label: "Region Hovedstaden",
        updatedAt: now,
      },
      { merge: true },
    );

    for (const [areaKey, payload] of Object.entries(areas)) {
      console.log(`[UPSERT] ${areaKey}`);
      await versionRef.collection("areas").doc(areaKey).set(payload);
    }
  }

  console.log("✅ Visitation seed complete.");
}

seedVisitation().catch((err) => {
  console.error("❌ Visitation seed failed:");
  console.error(err);
  process.exit(1);
});
