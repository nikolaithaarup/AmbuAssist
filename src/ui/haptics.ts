import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function run(effect: () => Promise<void>) {
  if (Platform.OS === "web") return;
  void effect().catch(() => {});
}

export function hapticToolOpen() {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticFavourite() {
  run(() => Haptics.selectionAsync());
}

export function hapticSuccess() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticReset() {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
}
