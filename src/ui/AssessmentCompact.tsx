import type { PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";

/** A single, quiet surface for assessment controls; keeps the clinical content fully visible. */
export function AssessmentCard({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View
      testID="assessment-compact-card"
      style={[
        {
          borderWidth: 1,
          borderColor: "rgba(190,202,165,0.12)",
          backgroundColor: "rgba(31,35,28,0.48)",
          borderRadius: 13,
          padding: 11,
          gap: 9,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
