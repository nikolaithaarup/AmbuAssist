import { Linking } from "react-native";

export async function openPhoneNumber(phone: string): Promise<boolean> {
  const url = `tel:${phone}`;
  if (!(await Linking.canOpenURL(url))) return false;
  await Linking.openURL(url);
  return true;
}
