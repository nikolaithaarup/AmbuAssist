import { AboutSupportScreen } from "../../src/features/support/AboutSupportScreen";

/** Legacy deep link retained; opens the consolidated screen at the disclaimer. */
export default function MedicalDisclaimerPage() {
  return <AboutSupportScreen initialSection="medical" />;
}
