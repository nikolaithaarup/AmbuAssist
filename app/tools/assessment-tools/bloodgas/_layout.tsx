import { Stack } from "expo-router";
import { PrelaunchGate } from "../../../../src/features/bloodgas/PrelaunchGate";

export default function BloodGasLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
      <PrelaunchGate />
    </>
  );
}
