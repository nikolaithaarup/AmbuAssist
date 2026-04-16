const admin = require("firebase-admin");
const serviceAccount = require("../../secrets/firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

type LangMap = {
  en: string;
  da: string;
};

type SeedSource = {
  id: string;
  title: LangMap;
  subtitle: LangMap;
  url?: LangMap;
};

type SeedReferenceDoc = {
  key: string;
  version: number;
  disclaimer: LangMap;
  sourcesSub: LangMap;
  sources: SeedSource[];
  updatedAt?: string;
};

/**
 * HOW TO USE THIS FILE IN FUTURE
 *
 * Each tool/page gets one object in REFERENCE_SEED_DATA.
 *
 * key:
 *   Must match the tool key you use when calling getReference("...").
 *   Examples: "dest", "wjd", "nihss", "news2", "spine", "wells"
 *
 * sources:
 *   Each source needs:
 *   - id
 *   - title.en / title.da
 *   - subtitle.en / subtitle.da
 *   - optional url.en / url.da
 *
 * URL EXAMPLES
 *
 * Same URL in both languages:
 * url: {
 *   en: "https://example.com/file.pdf",
 *   da: "https://example.com/file.pdf",
 * }
 *
 * Different URLs per language:
 * url: {
 *   en: "https://example.com/en.pdf",
 *   da: "https://example.com/da.pdf",
 * }
 */

const REFERENCE_SEED_DATA: SeedReferenceDoc[] = [
  {
    key: "dest",
    version: 1,
    disclaimer: {
      en: "This destination tool is a logistical support tool only. It does not replace local destination rules, current hospital capacity, specialty-specific pathways, medical triage, or real-time operational leadership. Always verify the destination against current local instructions before transport.",
      da: "Dette destinationsværktøj er kun et logistisk støtteværktøj. Det erstatter ikke lokale visitationsregler, aktuel hospitalskapacitet, specialespecifikke forløb, lægefaglig visitation eller realtidsmæssig operativ ledelse. Kontrollér altid destinationen op mod gældende lokale instrukser før transport.",
    },
    sourcesSub: {
      en: "Destination suggestions should be based on current local destination documents, specialty pathways, and operational guidance.",
      da: "Destinationsforslag bør baseres på gældende lokale visitationsdokumenter, specialepathways og operative retningslinjer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "City visitation for Region H (internal)",
          da: "Visitering i Byen i Region H (intern)",
        },
        subtitle: {
          en: "Internal regional guidance for destination and hospital choice.",
          da: "Intern regional vejledning for visitation og destinationsvalg.",
        },
        url: {
          en: "https://drive.google.com/file/d/18gnYztqAw40PxuGuP5N_iEDmksYk-eIX/view?usp=sharing",
          da: "https://drive.google.com/file/d/18gnYztqAw40PxuGuP5N_iEDmksYk-eIX/view?usp=sharing",
        },
      },
      {
        id: "2",
        title: {
          en: "Communal visitation for Region H (internal)",
          da: "Kommunal visitering i Region H (intern)",
        },
        subtitle: {
          en: "Use together with current operational messages, special instructions, and pathway criteria.",
          da: "Bruges sammen med aktuelle driftsmeddelelser, særlige instrukser og pathway-kriterier.",
        },
        url: {
          en: "https://drive.google.com/file/d/1HS25c5EPt1oP3WbzT6jA99TMiprOgvVh/view?usp=sharing",
          da: "https://drive.google.com/file/d/1HS25c5EPt1oP3WbzT6jA99TMiprOgvVh/view?usp=sharing",
        },
      },
      {
        id: "3",
        title: {
          en: "Local dispatch / medical triage",
          da: "Lokal dispatch- / lægefaglig visitation",
        },
        subtitle: {
          en: "Follow current dispatch, physician, and regional coordination guidance if it differs from static mapping.",
          da: "Følg gældende dispatch-, læge- og regional koordineringsvejledning, hvis den afviger fra statisk mapping.",
        },
      },
    ],
  },

  {
    key: "wjd",
    version: 1,
    disclaimer: {
      en: "This tool is intended as calculation support only. It must not be used as the sole basis for medication administration, choosing defibrillation energy, or other treatment decisions. Always verify dose, concentration, indication, route, contraindications, local instructions, and clinical responsibility before treatment.",
      da: "Dette værktøj er kun tænkt som beregningsstøtte. Det må ikke bruges som eneste grundlag for medicingivning, valg af defibrilleringsenergi eller andre behandlingsbeslutninger. Verificér altid dosis, koncentration, indikation, administrationsvej, kontraindikationer, lokale instrukser og klinisk ansvar før behandling.",
    },
    sourcesSub: {
      en: "Weight estimates, energy choices, and medication data should be checked against approved pediatric and local treatment references.",
      da: "Vægtestimater, energivalg og medicindata bør kontrolleres mod godkendte pædiatriske og lokale behandlingsreferencer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Adrenaline – medication instruction",
          da: "Adrenalin – medicininstruks",
        },
        subtitle: {
          en: "Region Hovedstaden source document.",
          da: "Kildedokument fra Region Hovedstaden.",
        },
        url: {
          en: "https://drive.google.com/file/d/16c6SlduR87W5q6HYHIeDN5YHq_66QeI1/view?usp=sharing",
          da: "https://drive.google.com/file/d/16c6SlduR87W5q6HYHIeDN5YHq_66QeI1/view?usp=sharing",
        },
      },
      {
        id: "2",
        title: {
          en: "Amiodarone – medication instruction",
          da: "Amiodaron – medicininstruks",
        },
        subtitle: {
          en: "Region Hovedstaden source document.",
          da: "Kildedokument fra Region Hovedstaden.",
        },
        url: {
          en: "https://drive.google.com/file/d/1XRcxE4FfTeQi-GhOVi-AnuMfSOMeBpve/view?usp=sharing",
          da: "https://drive.google.com/file/d/1XRcxE4FfTeQi-GhOVi-AnuMfSOMeBpve/view?usp=sharing",
        },
      },
      {
        id: "3",
        title: {
          en: "Fentanyl – medication instruction",
          da: "Fentanyl – medicininstruks",
        },
        subtitle: {
          en: "Region Hovedstaden source document.",
          da: "Kildedokument fra Region Hovedstaden.",
        },
        url: {
          en: "https://drive.google.com/file/d/1nOvdom_I7opEDVIJNyBIlOFekYNTBrve/view?usp=sharing",
          da: "https://drive.google.com/file/d/1nOvdom_I7opEDVIJNyBIlOFekYNTBrve/view?usp=sharing",
        },
      },
      {
        id: "4",
        title: {
          en: "Heparin – medication instruction",
          da: "Heparin – medicininstruks",
        },
        subtitle: {
          en: "Region Hovedstaden source document.",
          da: "Kildedokument fra Region Hovedstaden.",
        },
        url: {
          en: "https://drive.google.com/file/d/11oxmBDzYN_dMW1QNT2FM8Hp63pnTSH2W/view?usp=sharing",
          da: "https://drive.google.com/file/d/11oxmBDzYN_dMW1QNT2FM8Hp63pnTSH2W/view?usp=sharing",
        },
      },
      {
        id: "5",
        title: {
          en: "S-ketamine – medication instruction",
          da: "S-ketamin – medicininstruks",
        },
        subtitle: {
          en: "Region Hovedstaden source document.",
          da: "Kildedokument fra Region Hovedstaden.",
        },
        url: {
          en: "https://drive.google.com/file/d/1qs-4YA5GqsrKTkKI2alWHGTk_4O4dH5W/view?usp=sharing",
          da: "https://drive.google.com/file/d/1qs-4YA5GqsrKTkKI2alWHGTk_4O4dH5W/view?usp=sharing",
        },
      },
    ],
  },

  // ADD MORE TOOLS BELOW IN THE SAME FORMAT
  // Example:
  // {
  //   key: "news2",
  //   version: 1,
  //   disclaimer: { en: "...", da: "..." },
  //   sourcesSub: { en: "...", da: "..." },
  //   sources: [
  //     {
  //       id: "1",
  //       title: { en: "...", da: "..." },
  //       subtitle: { en: "...", da: "..." },
  //       url: { en: "https://...", da: "https://..." },
  //     },
  //   ],
  // },
];

async function seedReferences() {
  const batch = db.batch();
  const now = new Date().toISOString();

  console.log("Found tool keys:");
  console.log(REFERENCE_SEED_DATA.map((x) => x.key));

  for (const item of REFERENCE_SEED_DATA) {
    const ref = db.collection("references").doc(item.key);

    const payload = {
      ...item,
      updatedAt: item.updatedAt ?? now,
    };

    batch.set(ref, payload, { merge: true });

    console.log(
      `Prepared ${item.key}: ${item.sources.length} source(s), disclaimer=${item.disclaimer?.en ? "yes" : "no"}`,
    );
  }

  await batch.commit();
  console.log("✅ Reference seeding complete.");
}

seedReferences().catch((err: unknown) => {
  console.error("❌ Seed failed:");
  console.error(err);
  process.exit(1);
});
