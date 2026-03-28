import { useSettings } from "../state/settings";
import { da, en, Key } from "./strings";

export function useT() {
  const { settings } = useSettings();
  const dict = settings.language === "da" ? da : en;

  function t<K extends Key>(key: K): (typeof en)[K] {
    return dict[key] ?? en[key];
  }

  return { t, lang: settings.language };
}
