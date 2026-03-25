import { theme } from "../../ui/theme";

export function chip(active: boolean) {
  return {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: active ? "rgba(220,220,220,0.18)" : "rgba(0,0,0,0.10)",
  } as const;
}
