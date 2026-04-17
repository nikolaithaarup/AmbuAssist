import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../secrets/firebase-service-account.json" with { type: "json" };

type SeedSupportDoc = {
  id: string;
  nameDa: string;
  nameEn: string;
  phone: string;
  sortOrder?: number;
};

const SUPPORT_DATA: SeedSupportDoc[] = [
  {
    id: "akutbilskoordinator",
    nameDa: "Akutbilskoordinator",
    nameEn: "Rapid response coordinator",
    phone: "+4538698937",
    sortOrder: 10,
  },
  {
    id: "alb_midt",
    nameDa: "Akutlægebil Midt",
    nameEn: "Emergency doctor car Mid",
    phone: "+4524978774",
    sortOrder: 20,
  },
  {
    id: "alb_nord",
    nameDa: "Akutlægebil Nord",
    nameEn: "Emergency doctor car North",
    phone: "+4524822602",
    sortOrder: 21,
  },
  {
    id: "alb_syd",
    nameDa: "Akutlægebil Syd",
    nameEn: "Emergency doctor car South",
    phone: "+4520224358",
    sortOrder: 22,
  },
  {
    id: "amk_dispatch",
    nameDa: "AMK Dispatch",
    nameEn: "AMK Dispatch",
    phone: "+4538698836",
    sortOrder: 30,
  },
  {
    id: "amk_lima",
    nameDa: "AMK Læge (Lima)",
    nameEn: "AMK Doctor (Lima)",
    phone: "+4538698829",
    sortOrder: 31,
  },
  {
    id: "amk_sjaelland",
    nameDa: "AMK Sjælland",
    nameEn: "AMK Zealand",
    phone: "+4543399317",
    sortOrder: 40,
  },
  {
    id: "cvi_byen",
    nameDa: "CVI Byen",
    nameEn: "CVI City",
    phone: "+4538697711",
    sortOrder: 50,
  },
  {
    id: "cvi_midt",
    nameDa: "CVI Midt",
    nameEn: "CVI Mid",
    phone: "+4538697722",
    sortOrder: 51,
  },
  {
    id: "cvi_nord",
    nameDa: "CVI Nord",
    nameEn: "CVI North",
    phone: "+4538697733",
    sortOrder: 52,
  },
  {
    id: "cvi_syd",
    nameDa: "CVI Syd",
    nameEn: "CVI South",
    phone: "+4538697744",
    sortOrder: 53,
  },
  {
    id: "giftlinjen",
    nameDa: "Giftlinjen",
    nameEn: "Poison control",
    phone: "+4538635555",
    sortOrder: 60,
  },
  {
    id: "laege_1813",
    nameDa: "1813 Læge",
    nameEn: "1813 Doctor",
    phone: "+4551158903",
    sortOrder: 70,
  },
  {
    id: "psykiatrisk_udrykningstjeneste",
    nameDa: "Psykiatrisk udrykningstjeneste",
    nameEn: "Psychiatric response service",
    phone: "+4520606040",
    sortOrder: 80,
  },
  {
    id: "sociolancen",
    nameDa: "Sociolancen",
    nameEn: "Social ambulance",
    phone: "+4521447591",
    sortOrder: 90,
  },
  {
    id: "vagtleder_112",
    nameDa: "Vagtleder 112",
    nameEn: "112 supervisor",
    phone: "+4540122542",
    sortOrder: 100,
  },
  {
    id: "vagtleder_ambulance",
    nameDa: "Vagtleder Ambulance",
    nameEn: "Ambulance supervisor",
    phone: "+4538698929",
    sortOrder: 101,
  },
];

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function seedSupportData() {
  console.log("Syncing support numbers...");

  const collectionRef = db.collection("support_numbers");
  const snapshot = await collectionRef.get();

  const desiredIds = new Set(SUPPORT_DATA.map((item) => item.id));

  let deletedCount = 0;
  let writtenCount = 0;

  for (const doc of snapshot.docs) {
    if (!desiredIds.has(doc.id)) {
      await doc.ref.delete();
      deletedCount += 1;
      console.log(`Deleted old doc: ${doc.id}`);
    }
  }

  for (const item of SUPPORT_DATA) {
    await collectionRef.doc(item.id).set({
      nameDa: item.nameDa,
      nameEn: item.nameEn,
      phone: item.phone,
      sortOrder: item.sortOrder ?? 999,
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

seedSupportData()
  .then(() => {
    console.log("Done seeding ✅");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed ❌", err);
    process.exit(1);
  });
