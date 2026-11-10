import { AboutSupportScreen } from "../../src/features/support/AboutSupportScreen";
import { Platform } from "react-native";

export default function AboutPage() {
  return (
    <AboutSupportScreen initialSection={Platform.OS === "web" ? undefined : "about"} />
  );
}
