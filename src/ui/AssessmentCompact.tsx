import type { PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";

/** A single, quiet surface for assessment controls; keeps the clinical content fully visible. */
export function AssessmentCard({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View
      testID="assessment-compact-card"
      style={[
        {
          borderWidth: 0,
          backgroundColor: "transparent",
          borderRadius: 0,
          padding: 5,
          gap: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
