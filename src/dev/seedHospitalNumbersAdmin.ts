import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../secrets/firebase-service-account.json" with { type: "json" };

import { BUNDLED_HOSPITAL_PHONE_NUMBERS } from "../data/hospitalPhoneData";

const PHONE_DATA = BUNDLED_HOSPITAL_PHONE_NUMBERS;

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
