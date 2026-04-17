import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../secrets/firebase-service-account.json" with { type: "json" };

type SeedPhoneDoc = {
  id: string;
  hospitalCode: string;
  hospitalName: string;
  specialtyKey: string;
  displayNameDa: string;
  displayNameEn: string;
  phone: string;
};

const PHONE_DATA: SeedPhoneDoc[] = [
  // AMH — Amager Hospital
  {
    id: "AMH_main",
    hospitalCode: "AMH",
    hospitalName: "Amager Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4527790336",
  },
  {
    id: "AMH_psykiatri",
    hospitalCode: "AMH",
    hospitalName: "Amager Hospital",
    specialtyKey: "psykiatri",
    displayNameDa: "Psykiatri",
    displayNameEn: "Psychiatry",
    phone: "+4538641665",
  },

  // BBH — Bispebjerg Hospital
  {
    id: "BBH_main",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4538636715",
  },
  {
    id: "BBH_trombolyse",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "trombolyse",
    displayNameDa: "Trombolyse",
    displayNameEn: "Thrombolysis",
    phone: "+4529203449",
  },
  {
    id: "BBH_kardiologi",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "kardiologi",
    displayNameDa: "Kard Y21",
    displayNameEn: "Card Y21",
    phone: "+4540261218",
  },
  {
    id: "BBH_intensiv",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "intensiv",
    displayNameDa: "Intensiv",
    displayNameEn: "ICU",
    phone: "+4538635277",
  },
  {
    id: "BBH_psykiatri",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "psykiatri",
    displayNameDa: "Psykiatri",
    displayNameEn: "Psychiatry",
    phone: "+4538647360",
  },
  {
    id: "BBH_neuro",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "neurology",
    displayNameDa: "N10A",
    displayNameEn: "N10A",
    phone: "+4538647360",
  },

  // FRH — Frederiksberg Hospital
  {
    id: "FRH_main",
    hospitalCode: "FRH",
    hospitalName: "Frederiksberg Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4538163816",
  },
  {
    id: "FRH_akutklinik",
    hospitalCode: "FRH",
    hospitalName: "Frederiksberg Hospital",
    specialtyKey: "akutklinik",
    displayNameDa: "Akutklinik",
    displayNameEn: "Urgent care clinic",
    phone: "+4538163800",
  },
  {
    id: "FRH_psykiatri",
    hospitalCode: "FRH",
    hospitalName: "Frederiksberg Hospital",
    specialtyKey: "psykiatri",
    displayNameDa: "Psykiatri",
    displayNameEn: "Psychiatry",
    phone: "+4538643700",
  },

  // GEH — Gentofte Hospital
  {
    id: "GEH_main",
    hospitalCode: "GEH",
    hospitalName: "Gentofte Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4538673867",
  },
  {
    id: "GEH_akutklinik",
    hospitalCode: "GEH",
    hospitalName: "Gentofte Hospital",
    specialtyKey: "akutklinik",
    displayNameDa: "Akutklinik",
    displayNameEn: "Urgent care clinic",
    phone: "+4538673617",
  },
  {
    id: "GEH_intensiv",
    hospitalCode: "GEH",
    hospitalName: "Gentofte Hospital",
    specialtyKey: "intensiv",
    displayNameDa: "Intensiv",
    displayNameEn: "ICU",
    phone: "+4539772200",
  },
  {
    id: "GEH_psykiatri",
    hospitalCode: "GEH",
    hospitalName: "Gentofte Hospital",
    specialtyKey: "psykiatri",
    displayNameDa: "Psykiatri",
    displayNameEn: "Psychiatry",
    phone: "+4538647490",
  },

  // GLO — Glostrup Hospital
  {
    id: "GLO_main",
    hospitalCode: "GLO",
    hospitalName: "Glostrup Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4538633863",
  },
  {
    id: "GLO_akutklinik",
    hospitalCode: "GLO",
    hospitalName: "Glostrup Hospital",
    specialtyKey: "akutklinik",
    displayNameDa: "Akutklinik",
    displayNameEn: "Urgent care clinic",
    phone: "+4538634630",
  },
  {
    id: "GLO_neuro_apopleksi",
    hospitalCode: "GLO",
    hospitalName: "Glostrup Hospital",
    specialtyKey: "neuro_apopleksi",
    displayNameDa: "Neurologi BV",
    displayNameEn: "Neurology BV",
    phone: "+4538630357",
  },
  {
    id: "GLO_psykiatri",
    hospitalCode: "GLO",
    hospitalName: "Glostrup Hospital",
    specialtyKey: "psykiatri",
    displayNameDa: "Psykiatri",
    displayNameEn: "Psychiatry",
    phone: "+4538640686",
  },
  {
    id: "GLO_intensiv",
    hospitalCode: "GLO",
    hospitalName: "Glostrup Hospital",
    specialtyKey: "intensiv",
    displayNameDa: "Intensiv",
    displayNameEn: "ICU",
    phone: "+4538630366",
  },

  // HEH — Herlev Hospital
  {
    id: "HEH_main",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4538689603",
  },
  {
    id: "HEH_paediatri",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "paediatri",
    displayNameDa: "Pædiatri",
    displayNameEn: "Paediatrics",
    phone: "+4538689969",
  },
  {
    id: "HEH_obstetrik",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "obstetrik",
    displayNameDa: "Fødemodtagelse",
    displayNameEn: "Obstetrics",
    phone: "+4538689901",
  },
  {
    id: "HEH_foedegang",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "foedegang",
    displayNameDa: "Fødegang",
    displayNameEn: "Labour ward",
    phone: "+4538683257",
  },
  {
    id: "HEH_gynaekologi",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "gynaekologi",
    displayNameDa: "Gynækologisk",
    displayNameEn: "Gynaecology",
    phone: "+4538689675",
  },
  {
    id: "HEH_intensiv",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "intensiv",
    displayNameDa: "Intensiv",
    displayNameEn: "ICU",
    phone: "+4538682112",
  },

  // HVH — Hvidovre Hospital
  {
    id: "HVH_main",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4538625129",
  },
  {
    id: "HVH_paediatri",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "paediatri",
    displayNameDa: "Børnemodtagelse",
    displayNameEn: "Paediatrics",
    phone: "+4538625763",
  },
  {
    id: "HVH_gynaekologi",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "gynaekologi",
    displayNameDa: "Gynækologi",
    displayNameEn: "Gynaecology",
    phone: "+4538622602",
  },
  {
    id: "HVH_obstetrik",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "obstetrik",
    displayNameDa: "Fødemodtagelse",
    displayNameEn: "Obstetrics",
    phone: "+4538622833",
  },
  {
    id: "HVH_foedegang_direkte",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "foedegang_direkte",
    displayNameDa: "Fødegang direkte",
    displayNameEn: "Labour ward direct",
    phone: "+4538625169",
  },
  {
    id: "HVH_intensiv",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "intensiv",
    displayNameDa: "Intensiv",
    displayNameEn: "ICU",
    phone: "+4538625475",
  },
  {
    id: "HVH_psykiatri",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "psykiatri",
    displayNameDa: "Psykiatri",
    displayNameEn: "Psychiatry",
    phone: "+4538645500",
  },

  // NOH — Nordsjællands Hospital / Hillerød
  {
    id: "NOH_main",
    hospitalCode: "NOH",
    hospitalName: "Nordsjællands Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4548296460",
  },
  {
    id: "NOH_paediatri",
    hospitalCode: "NOH",
    hospitalName: "Nordsjællands Hospital",
    specialtyKey: "paediatri",
    displayNameDa: "Børnemodtagelse",
    displayNameEn: "Paediatrics",
    phone: "+4548294343",
  },
  {
    id: "NOH_obstetrik",
    hospitalCode: "NOH",
    hospitalName: "Nordsjællands Hospital",
    specialtyKey: "obstetrik",
    displayNameDa: "Fødegang",
    displayNameEn: "Obstetrics",
    phone: "+4548296251",
  },
  {
    id: "NOH_intensiv",
    hospitalCode: "NOH",
    hospitalName: "Nordsjællands Hospital",
    specialtyKey: "intensiv",
    displayNameDa: "Intensiv",
    displayNameEn: "ICU",
    phone: "+4548295805",
  },
  {
    id: "NOH_psykiatri",
    hospitalCode: "NOH",
    hospitalName: "Nordsjællands Hospital",
    specialtyKey: "psykiatri",
    displayNameDa: "Psykiatri",
    displayNameEn: "Psychiatry",
    phone: "+4538643200",
  },

  // RH — Rigshospitalet
  {
    id: "RH_main",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4535453193",
  },
  {
    id: "RH_evt",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "evt",
    displayNameDa: "EVT",
    displayNameEn: "EVT",
    phone: "+4535450688",
  },
  {
    id: "RH_traume_bravo",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "traumecenter_bravo",
    displayNameDa: "Traume Bravo",
    displayNameEn: "Trauma Bravo",
    phone: "+4535457913",
  },
  {
    id: "RH_trombolyse",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "trombolyse",
    displayNameDa: "Trombolyse",
    displayNameEn: "Thrombolysis",
    phone: "+4535456381",
  },
  {
    id: "RH_trombolyse_born",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "trombolyse_born",
    displayNameDa: "Trombolyse Børn",
    displayNameEn: "Thrombolysis Children",
    phone: "+4535456381",
  },
  {
    id: "RH_trombolyse_portor",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "trombolyse_portor",
    displayNameDa: "Trombolyse Portør",
    displayNameEn: "Thrombolysis Transport",
    phone: "+4535457913",
  },
  {
    id: "RH_paediatri",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "paediatri",
    displayNameDa: "Børnemodtagelse",
    displayNameEn: "Paediatrics",
    phone: "+4535455062",
  },
  {
    id: "RH_obstetrik",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "obstetrik",
    displayNameDa: "Fødegang",
    displayNameEn: "Obstetrics",
    phone: "+4535459630",
  },
  {
    id: "RH_obstetrik_jordemoder",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "obstetrik_jordemoder",
    displayNameDa: "Føde jordemoder",
    displayNameEn: "Obstetrics midwife",
    phone: "+4535451333",
  },
  {
    id: "RH_kardiologi_forvagt",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "kard_fv",
    displayNameDa: "Kard FV",
    displayNameEn: "Card FV",
    phone: "+4535451697",
  },
  {
    id: "RH_kardiologi_bagvagt",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "kard_bv",
    displayNameDa: "Kard BV",
    displayNameEn: "Card BV",
    phone: "+4535451699",
  },
  {
    id: "RH_intensiv",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "intensiv",
    displayNameDa: "Intensiv 4131",
    displayNameEn: "ICU 4131",
    phone: "+4535458121",
  },
];

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function seedHospitalData() {
  console.log("Syncing hospital data...");

  const collectionRef = db.collection("hospital_numbers");
  const snapshot = await collectionRef.get();

  const desiredIds = new Set(PHONE_DATA.map((item) => item.id));

  let deletedCount = 0;
  let writtenCount = 0;

  // Delete docs that are no longer in the seed
  for (const doc of snapshot.docs) {
    if (!desiredIds.has(doc.id)) {
      await doc.ref.delete();
      deletedCount += 1;
      console.log(`Deleted old doc: ${doc.id}`);
    }
  }

  // Write all docs from the seed
  for (const item of PHONE_DATA) {
    await collectionRef.doc(item.id).set({
      hospitalCode: item.hospitalCode,
      hospitalName: item.hospitalName,
      specialtyKey: item.specialtyKey,
      displayNameDa: item.displayNameDa,
      displayNameEn: item.displayNameEn,
      phone: item.phone,
      active: true,
      updatedAt: new Date().toISOString(),
    });

    writtenCount += 1;
    console.log(`Wrote doc: ${item.id}`);
  }

  console.log(
    `Sync done ✅ wrote ${writtenCount} docs, deleted ${deletedCount} old docs`,
  );
}

seedHospitalData()
  .then(() => {
    console.log("Done seeding ✅");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed ❌", err);
    process.exit(1);
  });
