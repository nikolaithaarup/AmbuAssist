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
};

/**
 * CONFIG
 *
 * deleteMissingDocs:
 *   true  = remove Firestore docs in /references that are NOT in REFERENCE_SEED_DATA
 *   false = leave extra docs alone
 *
 * dryRun:
 *   true  = log actions only, do not write/delete
 *   false = actually sync Firestore
 */
const CONFIG = {
  deleteMissingDocs: true,
  dryRun: false,
};

/**
 * HELPERS
 */
function both(url: string): LangMap {
  return { en: url, da: url };
}

function nowIso() {
  return new Date().toISOString();
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function assertNonEmpty(value: string, label: string) {
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required value: ${label}`);
  }
}

function validateLangMap(value: LangMap, label: string) {
  assertNonEmpty(value.en, `${label}.en`);
  assertNonEmpty(value.da, `${label}.da`);
}

function validateSeedData(data: SeedReferenceDoc[]) {
  const keys = data.map((x) => x.key);
  const duplicateKeys = keys.filter((k, i) => keys.indexOf(k) !== i);

  if (duplicateKeys.length > 0) {
    throw new Error(
      `Duplicate reference keys found: ${unique(duplicateKeys).join(", ")}`,
    );
  }

  for (const item of data) {
    assertNonEmpty(item.key, `reference[${item.key}].key`);

    if (!Number.isInteger(item.version) || item.version < 1) {
      throw new Error(
        `Invalid version for "${item.key}". Version must be an integer >= 1.`,
      );
    }

    validateLangMap(item.disclaimer, `reference[${item.key}].disclaimer`);
    validateLangMap(item.sourcesSub, `reference[${item.key}].sourcesSub`);

    const sourceIds = item.sources.map((s) => s.id);
    const duplicateSourceIds = sourceIds.filter(
      (id, i) => sourceIds.indexOf(id) !== i,
    );

    if (duplicateSourceIds.length > 0) {
      throw new Error(
        `Duplicate source ids found for "${item.key}": ${unique(
          duplicateSourceIds,
        ).join(", ")}`,
      );
    }

    for (const source of item.sources) {
      assertNonEmpty(source.id, `reference[${item.key}].source.id`);
      validateLangMap(
        source.title,
        `reference[${item.key}].source[${source.id}].title`,
      );
      validateLangMap(
        source.subtitle,
        `reference[${item.key}].source[${source.id}].subtitle`,
      );

      if (source.url) {
        validateLangMap(
          source.url,
          `reference[${item.key}].source[${source.id}].url`,
        );
      }
    }
  }
}

/**
 * HOW TO USE THIS FILE
 *
 * - Each tool/page gets one object in REFERENCE_SEED_DATA
 * - key must match getReference("key")
 * - The array is treated as source-of-truth
 *
 * This script will:
 * 1. overwrite seeded docs fully
 * 2. optionally delete docs in Firestore not present here
 *
 * So:
 * - add new tool here -> gets added
 * - edit existing tool here -> gets updated
 * - remove tool here -> gets deleted (if deleteMissingDocs=true)
 */

const REFERENCE_SEED_DATA: SeedReferenceDoc[] = [
  {
    key: "trombolysis",
    version: 1,
    disclaimer: {
      en: "This page is a logistical support tool only. It does not replace current regional stroke/trombolysis instructions, direct physician guidance, clinical judgement, or real-time operational coordination. Always verify the current pathway and contact route against local instructions.",
      da: "Denne side er kun et logistisk støtteværktøj. Den erstatter ikke gældende regionale instrukser for stroke/trombolyse, direkte lægefaglig vejledning, klinisk vurdering eller operativ koordinering i realtid. Kontrollér altid gældende forløb og kontaktvej mod lokale instrukser.",
    },
    sourcesSub: {
      en: "Thrombolysis logistics and contact pathways should be checked against the current regional stroke/apoplexy instruction.",
      da: "Trombolyse-logistik og kontaktveje bør kontrolleres mod den gældende regionale instruks for stroke/apopleksi.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Cerebral apoplexy, prehospital management and destination",
          da: "Cerebral apopleksi, præhospital håndtering og visitation",
        },
        subtitle: {
          en: "Regional source document for prehospital stroke handling, visitation, and thrombolysis pathway.",
          da: "Regionalt kildedokument for præhospital strokehåndtering, visitation og trombolyseforløb.",
        },
        url: both(
          "https://drive.google.com/file/d/1OkBVMtLW6QJ30AYCjIQZc7YFNNlOMpmV/view?usp=sharing",
        ),
      },
    ],
  },
  {
    key: "abcstamp",
    version: 1,
    disclaimer: {
      en: "Use the official local or regional ABC-STAMP structure where applicable. This page should be adapted to approved Danish clinical wording before release.",
      da: "Brug den officielle lokale eller regionale ABC-STAMP-struktur, hvor det er relevant. Siden bør tilpasses godkendt dansk klinisk ordlyd før release.",
    },
    sourcesSub: {
      en: "References and approved sources for ABC-STAMP.",
      da: "Referencer og godkendte kilder for ABC-STAMP.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Official Danish ABC-STAMP source",
          da: "Officiel dansk ABC-STAMP-kilde",
        },
        subtitle: {
          en: "Replace with your approved regional or psychiatric source.",
          da: "Erstat med jeres godkendte regionale eller psykiatriske kilde.",
        },
      },
      {
        id: "2",
        title: {
          en: "Local / regional psychiatric guidance",
          da: "Lokal / regional psykiatrisk vejledning",
        },
        subtitle: {
          en: "Replace with your approved operational source.",
          da: "Erstat med jeres godkendte driftskilde.",
        },
      },
      {
        id: "3",
        title: {
          en: "AmbuAssist disclaimer",
          da: "AmbuAssist-disclaimer",
        },
        subtitle: {
          en: "Assessment support only.",
          da: "Kun vurderingsstøtte.",
        },
      },
    ],
  },
  {
    key: "apgar",
    version: 1,
    disclaimer: {
      en: "APGAR is a structured newborn assessment tool and does not replace neonatal resuscitation algorithms, ongoing reassessment, or clinical judgement. Use the score together with the full clinical picture and local neonatal guidance.",
      da: "APGAR er et struktureret værktøj til vurdering af nyfødte og erstatter ikke neonatale genoplivningsalgoritmer, løbende revurdering eller klinisk skøn. Brug scoren sammen med det samlede kliniske billede og lokale neonatale retningslinjer.",
    },
    sourcesSub: {
      en: "APGAR should be used in accordance with established newborn assessment references and local neonatal guidance.",
      da: "APGAR bør anvendes i overensstemmelse med etablerede referencer for vurdering af nyfødte og lokale neonatale retningslinjer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "APGAR score",
          da: "APGAR-score",
        },
        subtitle: {
          en: "Established assessment framework for newborn appearance, pulse, grimace, activity, and respiration.",
          da: "Etableret vurderingsramme for den nyfødtes udseende, puls, grimace, aktivitet og respiration.",
        },
      },
      {
        id: "2",
        title: {
          en: "Neonatal assessment and resuscitation guidance",
          da: "Vejledning om neonatal vurdering og genoplivning",
        },
        subtitle: {
          en: "Use together with current neonatal resuscitation algorithms and structured reassessment.",
          da: "Bruges sammen med gældende algoritmer for neonatal genoplivning og struktureret revurdering.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local obstetric / neonatal guidance",
          da: "Lokale obstetriske / neonatale retningslinjer",
        },
        subtitle: {
          en: "Follow current local guidance for newborn assessment, escalation, and treatment.",
          da: "Følg gældende lokale instrukser for vurdering, eskalering og behandling af nyfødte.",
        },
      },
    ],
  },
  {
    key: "bvc",
    version: 1,
    disclaimer: {
      en: "BVC is a short-term violence-risk screening tool and should support, not replace, dynamic clinical assessment, de-escalation, and local safety procedures. It must not be used alone to justify coercion, diagnosis, or treatment decisions.",
      da: "BVC er et screeningsværktøj til korttidsvurdering af voldsrisiko og bør støtte, ikke erstatte, dynamisk klinisk vurdering, deeskalering og lokale sikkerhedsprocedurer. Det må ikke bruges alene til at begrunde tvang, diagnose eller behandlingsbeslutninger.",
    },
    sourcesSub: {
      en: "BVC should be used together with validated short-term violence-risk references and local safety procedures.",
      da: "BVC bør bruges sammen med validerede referencer for korttidsvurdering af voldsrisiko og lokale sikkerhedsprocedurer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Woods & Almvik et al. – The Brøset Violence Checklist (2002)",
          da: "Woods & Almvik m.fl. – The Brøset Violence Checklist (2002)",
        },
        subtitle: {
          en: "Original publication describing the Brøset Violence Checklist as a short-term violence prediction instrument.",
          da: "Original publikation, der beskriver Brøset Violence Checklist som et instrument til korttidsforudsigelse af voldelig adfærd.",
        },
      },
      {
        id: "2",
        title: {
          en: "Short-term risk prediction: the Brøset Violence Checklist",
          da: "Short-term risk prediction: the Brøset Violence Checklist",
        },
        subtitle: {
          en: "Supporting literature on short-term prediction of threatening or violent behaviour in psychiatric settings.",
          da: "Supplerende litteratur om korttidsforudsigelse af truende eller voldelig adfærd i psykiatriske miljøer.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local psychiatric / prehospital safety guidance",
          da: "Lokal psykiatrisk / præhospital sikkerhedsvejledning",
        },
        subtitle: {
          en: "Use together with current local procedures for de-escalation, scene safety, observation, escalation, and staff protection.",
          da: "Bruges sammen med gældende lokale procedurer for deeskalering, scenesikkerhed, observation, eskalering og personalesikkerhed.",
        },
      },
    ],
  },
  {
    key: "cfs",
    version: 1,
    disclaimer: {
      en: "The Clinical Frailty Scale supports a structured assessment of the patient’s usual frailty, but it does not replace an overall clinical assessment. It should not be used alone to determine treatment level, prognosis, or admission decisions.",
      da: "Clinical Frailty Scale støtter en struktureret vurdering af patientens habituelle skrøbelighed, men erstatter ikke en samlet klinisk vurdering. Den bør ikke bruges alene til at afgøre behandlingsniveau, prognose eller indlæggelsesbeslutninger.",
    },
    sourcesSub: {
      en: "CFS should be used in accordance with the official Clinical Frailty Scale material, Danish translation work, and local clinical guidance.",
      da: "CFS bør anvendes i overensstemmelse med det officielle Clinical Frailty Scale-materiale, dansk oversættelsesarbejde og lokale kliniske retningslinjer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Clinical Frailty Scale (official scale material)",
          da: "Clinical Frailty Scale (officielt skalamateriale)",
        },
        subtitle: {
          en: "Official Clinical Frailty Scale resource from the Geriatric Medicine Research group / Dalhousie University.",
          da: "Officiel ressource for Clinical Frailty Scale fra Geriatric Medicine Research group / Dalhousie University.",
        },
      },
      {
        id: "2",
        title: {
          en: "Danish translation and validation of the Clinical Frailty Scale",
          da: "Dansk oversættelse og validering af Clinical Frailty Scale",
        },
        subtitle: {
          en: "Danish translation and cross-sector reliability work supporting clinical use in Danish healthcare settings.",
          da: "Dansk oversættelse og tværsektorielt reliabilitetsarbejde, som understøtter klinisk anvendelse i danske sundhedsfaglige miljøer.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local geriatric / acute medicine guidance",
          da: "Lokal geriatrisk / akutmedicinsk vejledning",
        },
        subtitle: {
          en: "Interpret the score together with baseline function, collateral history, acute illness, and current local clinical guidance.",
          da: "Scoren skal tolkes sammen med habituelt funktionsniveau, oplysninger fra pårørende, akut sygdom og gældende lokale retningslinjer.",
        },
      },
    ],
  },
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
          en: "City visitation (Region H - internal)",
          da: "Visitering i Byen (Region H - intern)",
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
          en: "Communal visitation (Region H - internal)",
          da: "Visitering i kommuner (Region H - intern)",
        },
        subtitle: {
          en: "Internal regional guidance for destination and hospital choice.",
          da: "Intern regional vejledning for visitation og destinationsvalg.",
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
    key: "exams",
    version: 1,
    disclaimer: {
      en: "These examination signs are intended as teaching and support content only. They must not be used alone to confirm a diagnosis, exclude serious illness, or determine treatment. Findings must always be interpreted in the full clinical context and according to local guidance.",
      da: "Disse undersøgelsestegn er kun tænkt som undervisnings- og støtteindhold. De må ikke bruges alene til at bekræfte en diagnose, udelukke alvorlig sygdom eller afgøre behandling. Fund skal altid tolkes i den samlede kliniske kontekst og efter lokale retningslinjer.",
    },
    sourcesSub: {
      en: "Physical examination findings should be interpreted using standard clinical examination references and local guidance.",
      da: "Objektive undersøgelsesfund bør tolkes ud fra standardværker i klinisk undersøgelse og lokale instrukser.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Standard references in clinical examination",
          da: "Standardreferencer i klinisk undersøgelse",
        },
        subtitle: {
          en: "Use established textbooks and validated teaching material for bedside examination.",
          da: "Brug etablerede lærebøger og valideret undervisningsmateriale i bedside-undersøgelse.",
        },
      },
      {
        id: "2",
        title: {
          en: "Acute and prehospital assessment guidance",
          da: "Akut- og præhospital vurderingsvejledning",
        },
        subtitle: {
          en: "Combine examination findings with structured ABCDE assessment and recognition of red flags.",
          da: "Kombinér undersøgelsesfund med struktureret ABCDE-vurdering og genkendelse af røde flag.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local clinical guidelines",
          da: "Lokale kliniske retningslinjer",
        },
        subtitle: {
          en: "Follow current local guidance for referral, escalation, and acute management.",
          da: "Følg gældende lokale instrukser for henvisning, eskalering og akut håndtering.",
        },
      },
    ],
  },
  {
    key: "flacc",
    version: 1,
    disclaimer: {
      en: "FLACC is a behavioural pain assessment tool and should support, not replace, the overall pain assessment. Use the tool together with age, clinical context, relevant parent/caregiver information, and reassessment after intervention.",
      da: "FLACC er et adfærdsbaseret smertevurderingsværktøj og bør støtte, ikke erstatte, den samlede smertevurdering. Brug værktøjet sammen med alder, klinisk kontekst, relevante oplysninger fra forældre og revurdering efter intervention.",
    },
    sourcesSub: {
      en: "FLACC should be used in accordance with validated pediatric pain-assessment references and local pediatric guidance.",
      da: "FLACC bør anvendes i overensstemmelse med validerede pædiatriske smertevurderingsreferencer og lokale børneinstrukser.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Merkel et al. – FLACC Behavioral Pain Assessment Scale (1997)",
          da: "Merkel m.fl. – FLACC Behavioral Pain Assessment Scale (1997)",
        },
        subtitle: {
          en: "Original publication describing FLACC as a behavioral pain scale for children who may not be able to verbalize pain.",
          da: "Original publikation, der beskriver FLACC som en adfærdsbaseret smerteskala til børn, som ikke nødvendigvis kan verbalisere smerte.",
        },
      },
      {
        id: "2",
        title: {
          en: "Validation studies for FLACC in pediatric pain assessment",
          da: "Valideringsstudier af FLACC ved pædiatrisk smertevurdering",
        },
        subtitle: {
          en: "Supporting literature on validity and reliability of FLACC for clinical and procedural pain assessment in children.",
          da: "Supplerende litteratur om validitet og reliabilitet af FLACC ved klinisk og procedure-relateret smertevurdering hos børn.",
        },
      },
      {
        id: "3",
        title: {
          en: "AAP pediatric pain assessment guidance",
          da: "AAP-vejledning om smertevurdering hos børn",
        },
        subtitle: {
          en: "Use together with broader pediatric pain-assessment principles, reassessment after intervention, and local pediatric treatment guidance.",
          da: "Bruges sammen med bredere principper for pædiatrisk smertevurdering, revurdering efter intervention og lokale behandlingsinstrukser.",
        },
      },
    ],
  },
  {
    key: "hints",
    version: 1,
    disclaimer: {
      en: "HINTS+ is intended for selected patients with Acute Vestibular Syndrome and requires correct examination technique together with the appropriate clinical context. It does not replace broader neurological assessment, stroke evaluation, imaging pathways, or senior clinical judgement when indicated.",
      da: "HINTS+ er tiltænkt udvalgte patienter med Akut Vestibulært Syndrom og kræver korrekt undersøgelsesteknik samt relevant klinisk kontekst. Det erstatter ikke bredere neurologisk vurdering, stroke-vurdering, billeddiagnostiske forløb eller senior klinisk vurdering, når dette er indiceret.",
    },
    sourcesSub: {
      en: "HINTS+ and related dizziness assessment should be used in accordance with the original AVS literature, modern dizziness guidance, and local stroke pathways.",
      da: "HINTS+ og relateret svimmelhedsvurdering bør bruges i overensstemmelse med den originale AVS-litteratur, moderne retningslinjer for svimmelhed og lokale stroke-pathways.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Kattah et al. – HINTS to Diagnose Stroke in the Acute Vestibular Syndrome (2009)",
          da: "Kattah m.fl. – HINTS to Diagnose Stroke in the Acute Vestibular Syndrome (2009)",
        },
        subtitle: {
          en: "Foundational HINTS paper describing the three-step bedside oculomotor examination in acute vestibular syndrome.",
          da: "Grundlæggende HINTS-publikation, der beskriver den tretrins okulomotoriske bedside-undersøgelse ved akut vestibulært syndrom.",
        },
      },
      {
        id: "2",
        title: {
          en: "GRACE-3 – Acute dizziness and vertigo in the emergency department (2023)",
          da: "GRACE-3 – Acute dizziness and vertigo in the emergency department (2023)",
        },
        subtitle: {
          en: "Guideline emphasizing training, timing/triggers-based assessment, and appropriate use of bedside eye-movement examination.",
          da: "Retningslinje der fremhæver træning, vurdering ud fra timing/triggers og korrekt brug af bedside-øjenbevægelsesundersøgelse.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local stroke / neurology escalation guidance",
          da: "Lokal stroke- / neurologisk eskaleringsvejledning",
        },
        subtitle: {
          en: "Follow current local procedures for escalation, imaging, and specialist assessment when a central cause is suspected.",
          da: "Følg gældende lokale procedurer for eskalering, billeddiagnostik og specialistvurdering ved mistanke om central årsag.",
        },
      },
    ],
  },
  {
    key: "news2",
    version: 1,
    disclaimer: {
      en: "NEWS2 supports a structured assessment of acute illness, but it does not replace clinical judgement, local escalation instructions, or medical assessment. The score must not stand alone when making decisions about diagnosis, treatment, or destination.",
      da: "NEWS2 støtter en struktureret vurdering af akut sygdom, men erstatter ikke klinisk skøn, lokale eskaleringsinstrukser eller lægefaglig vurdering. Scoren må ikke stå alene ved beslutninger om diagnose, behandling eller visitation.",
    },
    sourcesSub: {
      en: "NEWS2 should be used in accordance with the Royal College of Physicians NEWS2 report and local escalation guidance.",
      da: "NEWS2 bør bruges i overensstemmelse med Royal College of Physicians’ NEWS2-rapport og lokale eskaleringsretningslinjer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Royal College of Physicians – National Early Warning Score (NEWS2), 2017",
          da: "Royal College of Physicians – National Early Warning Score (NEWS2), 2017",
        },
        subtitle: {
          en: "Official NEWS2 report describing the validated scoring system for acute illness severity.",
          da: "Officiel NEWS2-rapport, der beskriver det validerede scoringssystem til vurdering af akut sygdoms sværhedsgrad.",
        },
      },
      {
        id: "2",
        title: {
          en: "Royal College of Physicians – NEWS2 thresholds, oxygen scoring, and escalation principles",
          da: "Royal College of Physicians – tærskler, iltscoring og eskaleringsprincipper i NEWS2",
        },
        subtitle: {
          en: "Reference for SpO₂ Scale 1 and Scale 2, supplemental oxygen scoring, and response/escalation structure.",
          da: "Reference for SpO₂-skala 1 og 2, point for ilttilskud samt struktur for respons og eskalering.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local observation and escalation guidance",
          da: "Lokale observations- og eskaleringsretningslinjer",
        },
        subtitle: {
          en: "Use together with current local instructions for monitoring frequency, escalation, and referral pathways.",
          da: "Bruges sammen med gældende lokale instrukser for observationshyppighed, eskalering og henvisningsforløb.",
        },
      },
    ],
  },
  {
    key: "nihss",
    version: 1,
    disclaimer: {
      en: "NIHSS is a structured neurological assessment tool and must not be used as the sole basis for diagnosis, destination choice, thrombolysis considerations, or other treatment decisions. The score must always be interpreted together with the overall clinical picture, local stroke guidance, and clinical judgement.",
      da: "NIHSS er et struktureret neurologisk vurderingsværktøj og må ikke bruges som eneste grundlag for diagnose, visitationssted, trombolyseovervejelser eller andre behandlingsbeslutninger. Scoren skal altid tolkes sammen med det samlede kliniske billede, lokale apopleksi-retningslinjer og klinisk skøn.",
    },
    sourcesSub: {
      en: "NIHSS content should follow the original NIH Stroke Scale publication, stroke guideline material, and local stroke pathways.",
      da: "NIHSS-indhold bør følge den originale NIH Stroke Scale-publikation, guideline-materiale om stroke og lokale stroke-pathways.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Brott et al. – Measurements of acute cerebral infarction: a clinical examination scale (1989)",
          da: "Brott m.fl. – Measurements of acute cerebral infarction: a clinical examination scale (1989)",
        },
        subtitle: {
          en: "Original publication describing the NIH Stroke Scale as a 15-item neurologic examination scale for acute stroke.",
          da: "Original publikation, der beskriver NIH Stroke Scale som en 15-punkts neurologisk undersøgelsesskala ved akut apopleksi.",
        },
      },
      {
        id: "2",
        title: {
          en: "American Heart Association / American Stroke Association – Acute ischemic stroke guideline material",
          da: "American Heart Association / American Stroke Association – guideline-materiale om akut iskæmisk stroke",
        },
        subtitle: {
          en: "Guideline material supporting structured stroke severity assessment, including use of the NIHSS.",
          da: "Guideline-materiale der understøtter struktureret vurdering af stroke-sværhedsgrad, herunder brug af NIHSS.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local or regional stroke triage / destination guidance",
          da: "Lokal eller regional stroke-triage / visitationsvejledning",
        },
        subtitle: {
          en: "Use together with current prehospital stroke triage, destination, imaging, and escalation procedures.",
          da: "Bruges sammen med gældende præhospitale procedurer for stroke-triage, visitation, billeddiagnostik og eskalering.",
        },
      },
    ],
  },
  {
    key: "press",
    version: 1,
    disclaimer: {
      en: "This tool is for structured prehospital neurological assessment support only. Always follow local guidelines and use clinical judgement.",
      da: "Dette værktøj er kun til støtte for struktureret præhospital neurologisk vurdering. Følg altid lokale retningslinjer og brug klinisk vurdering.",
    },
    sourcesSub: {
      en: "Key references and protocol sources for PreSS.",
      da: "Nøglereferencer og protokolkilder for PreSS.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Prehospital Stroke Score (PreSS)",
          da: "Prehospital Stroke Score (PreSS)",
        },
        subtitle: {
          en: "Two-part Danish prehospital stroke assessment model.",
          da: "Todelt dansk præhospital apopleksivurdering.",
        },
      },
      {
        id: "2",
        title: {
          en: "The Prehospital Stroke Score and telephone conference",
          da: "The Prehospital Stroke Score and telephone conference",
        },
        subtitle: {
          en: "Prospective validation study.",
          da: "Prospektivt valideringsstudie.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local / regional guideline",
          da: "Lokal / regional retningslinje",
        },
        subtitle: {
          en: "Replace with your approved operational source.",
          da: "Erstat med jeres godkendte driftskilde.",
        },
      },
    ],
  },
  {
    key: "spine",
    version: 1,
    disclaimer: {
      en: "This spinal trauma flow is a support tool only. It does not replace ABCDE assessment, clinical judgement, local trauma guidance, or medical direction. If the patient is unstable, or the clinical picture is unclear, follow the higher-risk pathway and local guidance.",
      da: "Dette spinal-traume-flow er kun et støtteværktøj. Det erstatter ikke ABCDE-vurdering, klinisk skøn, lokale traumerelevante instrukser eller lægefaglig ledelse. Hvis patienten er ustabil, eller det kliniske billede er uklart, skal højere risikoniveau og lokal instruks følges.",
    },
    sourcesSub: {
      en: "Assessment of spinal trauma should follow Danish spinal-stabilisation guidance, trauma principles, and local prehospital procedures.",
      da: "Vurdering af spinalt traume bør følge dansk vejledning om spinal stabilisering, traumaprincipper og lokale præhospitale procedurer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Sundhedsstyrelsen – National Klinisk Retningslinje for spinal stabilisering af voksne traumepatienter",
          da: "Sundhedsstyrelsen – National Klinisk Retningslinje for spinal stabilisering af voksne traumepatienter",
        },
        subtitle: {
          en: "Danish national clinical guideline describing when spinal stabilisation is and is not recommended in adult trauma patients.",
          da: "Dansk national klinisk retningslinje, der beskriver hvornår spinal stabilisering er og ikke er anbefalet hos voksne traumepatienter.",
        },
      },
      {
        id: "2",
        title: {
          en: "Maschmann et al. – New clinical guidelines on the spinal stabilisation of adult trauma patients in Denmark (2019)",
          da: "Maschmann m.fl. – New clinical guidelines on the spinal stabilisation of adult trauma patients in Denmark (2019)",
        },
        subtitle: {
          en: "Consensus- and evidence-based Danish guideline publication on prehospital spinal stabilisation practice.",
          da: "Konsensus- og evidensbaseret dansk guidelinepublikation om præhospital praksis for spinal stabilisering.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local trauma / prehospital guidance",
          da: "Lokal traume- / præhospital vejledning",
        },
        subtitle: {
          en: "Follow current local procedures for ABCDE priorities, handling, transport, spinal motion restriction, and escalation.",
          da: "Følg gældende lokale procedurer for ABCDE-prioriteter, håndtering, transport, spinal bevægerestriktion og eskalering.",
        },
      },
    ],
  },
  {
    key: "wells",
    version: 1,
    disclaimer: {
      en: "The Wells DVT score is a clinical prediction tool and must not be used alone to confirm or exclude deep vein thrombosis. The score must always be interpreted together with history, examination, differential diagnoses, and local diagnostic guidance.",
      da: "Wells DVT-score er et klinisk prædiktionsværktøj og må ikke bruges alene til at be- eller afkræfte dyb venetrombose. Scoren skal altid tolkes sammen med anamnese, objektiv undersøgelse, differentialdiagnoser og lokale diagnostiske retningslinjer.",
    },
    sourcesSub: {
      en: "The Wells DVT score should be used with validated pre-test probability references and current diagnostic guidance.",
      da: "Wells DVT-score bør bruges sammen med validerede referencer for prætest-sandsynlighed og gældende diagnostiske retningslinjer.",
    },
    sources: [
      {
        id: "1",
        title: {
          en: "Wells et al. – Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis (2003)",
          da: "Wells m.fl. – Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis (2003)",
        },
        subtitle: {
          en: "Key publication supporting Wells-based clinical probability assessment combined with D-dimer testing.",
          da: "Central publikation, der understøtter Wells-baseret klinisk sandsynlighedsvurdering kombineret med D-dimer.",
        },
      },
      {
        id: "2",
        title: {
          en: "NICE guideline NG158 – Venous thromboembolic diseases: diagnosis and management",
          da: "NICE guideline NG158 – Venous thromboembolic diseases: diagnosis and management",
        },
        subtitle: {
          en: "Current guideline resource for DVT diagnostic pathways, including structured workup and management.",
          da: "Aktuel guideline om diagnostiske forløb ved DVT, herunder struktureret udredning og behandling.",
        },
      },
      {
        id: "3",
        title: {
          en: "Local VTE / referral guidance",
          da: "Lokal VTE- / henvisningsvejledning",
        },
        subtitle: {
          en: "Use together with current local instructions for D-dimer strategy, ultrasound referral, escalation, and anticoagulation decisions.",
          da: "Bruges sammen med gældende lokale instrukser for D-dimer-strategi, ultralydshenvisning, eskalering og antikoagulationsbeslutninger.",
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
  // Add more tools below
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
  //       url: both("https://..."),
  //     },
  //   ],
  // },
];

async function seedReferences() {
  validateSeedData(REFERENCE_SEED_DATA);

  const collectionRef = db.collection("references");
  const snapshot = await collectionRef.get();

  const now = nowIso();
  const seededKeys = new Set(REFERENCE_SEED_DATA.map((x) => x.key));
  const existingKeys: string[] = snapshot.docs.map((doc: any) => doc.id);

  console.log("Seed keys:");
  console.log([...seededKeys].sort());

  console.log("Existing Firestore keys:");
  console.log(existingKeys.sort());

  const toDelete = CONFIG.deleteMissingDocs
    ? existingKeys.filter((key: string) => !seededKeys.has(key))
    : [];

  if (CONFIG.dryRun) {
    console.log("DRY RUN ENABLED — no changes will be written.");
  }

  for (const item of REFERENCE_SEED_DATA) {
    const ref = collectionRef.doc(item.key);

    const payload = {
      ...item,
      updatedAt: now,
    };

    console.log(
      `[UPSERT] ${item.key} | version=${item.version} | sources=${item.sources.length}`,
    );

    if (!CONFIG.dryRun) {
      // Overwrite full doc so removed fields/sources disappear
      await ref.set(payload);
    }
  }

  for (const key of toDelete) {
    console.log(`[DELETE] ${key} (not present in seed)`);

    if (!CONFIG.dryRun) {
      await collectionRef.doc(key).delete();
    }
  }

  console.log("✅ Reference sync complete.");
  console.log(
    `Summary: upserted=${REFERENCE_SEED_DATA.length}, deleted=${toDelete.length}, dryRun=${CONFIG.dryRun}`,
  );
}

seedReferences().catch((err: unknown) => {
  console.error("❌ Seed failed:");
  console.error(err);
  process.exit(1);
});
