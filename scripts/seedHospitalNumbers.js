const admin = require("firebase-admin");
const path = require("path");

// 🔐 Load your service account
const serviceAccount = require(
  path.resolve(__dirname, "../secrets/firebase-service-account.json"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🔥 All your hospital data (main + some key specialties)
const PHONE_DATA = [
  // ===== MAIN NUMBERS (fallbacks) =====
  {
    id: "AMH_main",
    code: "AMH",
    name: "Amager Hospital",
    phone: "+4500000001",
  },
  {
    id: "BBH_main",
    code: "BBH",
    name: "Bispebjerg Hospital",
    phone: "+4500000002",
  },
  {
    id: "FRH_main",
    code: "FRH",
    name: "Frederiksberg Hospital",
    phone: "+4500000003",
  },
  {
    id: "GEH_main",
    code: "GEH",
    name: "Gentofte Hospital",
    phone: "+4500000004",
  },
  {
    id: "GLO_main",
    code: "GLO",
    name: "Glostrup Hospital",
    phone: "+4500000005",
  },
  {
    id: "HEH_main",
    code: "HEH",
    name: "Herlev Hospital",
    phone: "+4500000006",
  },
  { id: "HGH_main", code: "HGH", name: "HGH Hospital", phone: "+4500000007" },
  {
    id: "HVH_main",
    code: "HVH",
    name: "Hvidovre Hospital",
    phone: "+4500000008",
  },
  {
    id: "NOH_main",
    code: "NOH",
    name: "Nordsjællands Hospital",
    phone: "+4500000009",
  },
  { id: "RH_main", code: "RH", name: "Rigshospitalet", phone: "+4500000010" },

  // ===== COMBO CODES =====
  {
    id: "RH_GLO_main",
    code: "RH_GLO",
    name: "RH / Glostrup",
    phone: "+4500000011",
  },
  { id: "HGH_RH_main", code: "HGH_RH", name: "HGH / RH", phone: "+4500000012" },
  {
    id: "BBH_FRH_main",
    code: "BBH_FRH",
    name: "BBH / FRH",
    phone: "+4500000013",
  },
  { id: "GLO_RH_main", code: "GLO_RH", name: "GLO / RH", phone: "+4500000014" },

  // ===== HIGH-VALUE SPECIALTIES =====
  {
    id: "BBH_akutmodtagelse",
    code: "BBH",
    name: "Bispebjerg Hospital",
    specialty: "akutmodtagelse",
    labelDa: "Akutmodtagelse",
    phone: "+4500000101",
  },
  {
    id: "BBH_kardiologi",
    code: "BBH",
    name: "Bispebjerg Hospital",
    specialty: "kardiologi",
    labelDa: "Kardiologi",
    phone: "+4500000102",
  },
  {
    id: "BBH_medicin",
    code: "BBH",
    name: "Bispebjerg Hospital",
    specialty: "medicin",
    labelDa: "Medicin",
    phone: "+4500000103",
  },

  {
    id: "RH_hospital",
    code: "RH",
    name: "Rigshospitalet",
    specialty: "hospital",
    labelDa: "Hospital",
    phone: "+4500000201",
  },
  {
    id: "RH_neuro_almen",
    code: "RH",
    name: "Rigshospitalet",
    specialty: "neuro_almen",
    labelDa: "Neurologi",
    phone: "+4500000202",
  },
  {
    id: "RH_paediatri",
    code: "RH",
    name: "Rigshospitalet",
    specialty: "paediatri",
    labelDa: "Pædiatri",
    phone: "+4500000203",
  },

  {
    id: "HVH_hospital",
    code: "HVH",
    name: "Hvidovre Hospital",
    specialty: "hospital",
    labelDa: "Hospital",
    phone: "+4500000301",
  },
  {
    id: "HVH_gyn",
    code: "HVH",
    name: "Hvidovre Hospital",
    specialty: "gyn",
    labelDa: "Gynækologi",
    phone: "+4500000302",
  },

  {
    id: "HEH_paediatri",
    code: "HEH",
    name: "Herlev Hospital",
    specialty: "paediatri",
    labelDa: "Pædiatri",
    phone: "+4500000401",
  },

  {
    id: "GLO_neuro_apopleksi",
    code: "GLO",
    name: "Glostrup Hospital",
    specialty: "neuro_apopleksi",
    labelDa: "Apopleksi",
    phone: "+4500000501",
  },

  {
    id: "FRH_reumatologi",
    code: "FRH",
    name: "Frederiksberg Hospital",
    specialty: "reumatologi",
    labelDa: "Reumatologi",
    phone: "+4500000601",
  },
];

async function seedHospitalNumbers() {
  console.log("Seeding hospital_numbers...");

  const batch = db.batch();

  for (const item of PHONE_DATA) {
    const ref = db.collection("hospital_numbers").doc(item.id);

    batch.set(ref, {
      hospitalCode: item.code,
      hospitalName: item.name,
      specialtyKey: item.specialty || "main",
      displayNameDa: item.labelDa || "Hovednummer",
      displayNameEn: item.labelDa || "Main number",
      phone: item.phone,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();

  console.log(`Done ✅ Seeded ${PHONE_DATA.length} documents`);
}

seedHospitalNumbers().catch((err) => {
  console.error("Seed failed ❌", err);
  process.exit(1);
});
