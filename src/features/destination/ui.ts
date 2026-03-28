import { theme } from "../../ui/theme";

export function chip(active: boolean) {
  return {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: active ? theme.colors.primary : theme.colors.cardBorder,
    backgroundColor: active ? theme.colors.primary + "33" : "rgba(0,0,0,0.10)",

    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  } as const;
}
