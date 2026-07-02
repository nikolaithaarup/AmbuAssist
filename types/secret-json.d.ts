declare module "*firebase-service-account.json" {
  import type { ServiceAccount } from "firebase-admin/app";

  const serviceAccount: ServiceAccount;
  export default serviceAccount;
}
