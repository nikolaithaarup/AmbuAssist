import React from "react";
import { ActivityIndicator } from "react-native";

// Native fallback; the installed web PWAs use EcgLoader.web.tsx.
export default function EcgLoader({ color }: { color: string }) {
  return <ActivityIndicator size="small" color={color} />;
}
