import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

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
  // Main / fallback numbers
  {
    id: "AMH_main",
    hospitalCode: "AMH",
    hospitalName: "Amager Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000001",
  },
  {
    id: "BBH_main",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000002",
  },
  {
    id: "FRH_main",
    hospitalCode: "FRH",
    hospitalName: "Frederiksberg Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000003",
  },
  {
    id: "GEH_main",
    hospitalCode: "GEH",
    hospitalName: "Gentofte Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000004",
  },
  {
    id: "GLO_main",
    hospitalCode: "GLO",
    hospitalName: "Glostrup Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000005",
  },
  {
    id: "HEH_main",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000006",
  },
  {
    id: "HGH_main",
    hospitalCode: "HGH",
    hospitalName: "Hvidovre / Hillerød / placeholder HGH",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000007",
  },
  {
    id: "HVH_main",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000008",
  },
  {
    id: "NOH_main",
    hospitalCode: "NOH",
    hospitalName: "Nordsjællands Hospital",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000009",
  },
  {
    id: "RH_main",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000010",
  },

  // Combo codes used in your mapping
  {
    id: "RH_GLO_main",
    hospitalCode: "RH_GLO",
    hospitalName: "Rigshospitalet / Glostrup",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000011",
  },
  {
    id: "HGH_RH_main",
    hospitalCode: "HGH_RH",
    hospitalName: "HGH / Rigshospitalet",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000012",
  },
  {
    id: "BBH_FRH_main",
    hospitalCode: "BBH_FRH",
    hospitalName: "Bispebjerg / Frederiksberg",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000013",
  },
  {
    id: "GLO_RH_main",
    hospitalCode: "GLO_RH",
    hospitalName: "Glostrup / Rigshospitalet",
    specialtyKey: "main",
    displayNameDa: "Hovednummer",
    displayNameEn: "Main number",
    phone: "+4500000014",
  },

  // A few real first-line specialties to test exact-match behavior
  {
    id: "BBH_akutmodtagelse",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "akutmodtagelse",
    displayNameDa: "Akutmodtagelse",
    displayNameEn: "Emergency department",
    phone: "+4500000101",
  },
  {
    id: "BBH_medicinsk_modtagelse",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "medicinsk_modtagelse",
    displayNameDa: "Medicinsk modtagelse",
    displayNameEn: "Medical admissions",
    phone: "+4500000102",
  },
  {
    id: "BBH_kardiologi",
    hospitalCode: "BBH",
    hospitalName: "Bispebjerg Hospital",
    specialtyKey: "kardiologi",
    displayNameDa: "Kardiologi",
    displayNameEn: "Cardiology",
    phone: "+4500000103",
  },
  {
    id: "RH_hospital",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "hospital",
    displayNameDa: "Hospital",
    displayNameEn: "Hospital",
    phone: "+4500000201",
  },
  {
    id: "RH_neuro_almen",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "neuro_almen",
    displayNameDa: "Neurologi",
    displayNameEn: "Neurology",
    phone: "+4500000202",
  },
  {
    id: "RH_paediatri",
    hospitalCode: "RH",
    hospitalName: "Rigshospitalet",
    specialtyKey: "paediatri",
    displayNameDa: "Pædiatri",
    displayNameEn: "Paediatrics",
    phone: "+4500000203",
  },
  {
    id: "HVH_hospital",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "hospital",
    displayNameDa: "Hospital",
    displayNameEn: "Hospital",
    phone: "+4500000301",
  },
  {
    id: "HVH_gyn",
    hospitalCode: "HVH",
    hospitalName: "Hvidovre Hospital",
    specialtyKey: "gyn",
    displayNameDa: "Gynækologi",
    displayNameEn: "Gynaecology",
    phone: "+4500000302",
  },
  {
    id: "HEH_paediatri",
    hospitalCode: "HEH",
    hospitalName: "Herlev Hospital",
    specialtyKey: "paediatri",
    displayNameDa: "Pædiatri",
    displayNameEn: "Paediatrics",
    phone: "+4500000401",
  },
  {
    id: "GLO_neuro_apopleksi",
    hospitalCode: "GLO",
    hospitalName: "Glostrup Hospital",
    specialtyKey: "neuro_apopleksi",
    displayNameDa: "Neurologi / apopleksi",
    displayNameEn: "Neurology / stroke",
    phone: "+4500000501",
  },
  {
    id: "FRH_reumatologi",
    hospitalCode: "FRH",
    hospitalName: "Frederiksberg Hospital",
    specialtyKey: "reumatologi",
    displayNameDa: "Reumatologi",
    displayNameEn: "Rheumatology",
    phone: "+4500000601",
  },
];

export async function seedHospitalData() {
  console.log("Seeding hospital data...");

  for (const item of PHONE_DATA) {
    await setDoc(doc(db, "hospital_numbers", item.id), {
      hospitalCode: item.hospitalCode,
      hospitalName: item.hospitalName,
      specialtyKey: item.specialtyKey,
      displayNameDa: item.displayNameDa,
      displayNameEn: item.displayNameEn,
      phone: item.phone,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  }

  console.log(`Seeding done ✅ (${PHONE_DATA.length} docs)`);
}
