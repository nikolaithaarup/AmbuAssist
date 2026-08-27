import { AboutSupportScreen } from "../../src/features/support/AboutSupportScreen";

/** Legacy deep link retained; opens the consolidated screen at contact. */
export default function ContactPage() {
  return <AboutSupportScreen initialSection="contact" />;
}
