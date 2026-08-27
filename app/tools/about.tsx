import { AboutSupportScreen } from "../../src/features/support/AboutSupportScreen";

/** Legacy deep link retained; opens the consolidated screen at About. */
export default function AboutPage() {
  return <AboutSupportScreen initialSection="about" />;
}
