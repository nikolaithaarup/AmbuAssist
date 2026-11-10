import { ToolPageHeader } from "../../../ui/ToolSurface";

export function Header({
  title,
  subtitle,
  rightLabel,
  onRightPress,
  inSettings = false,
}: {
  title: string;
  subtitle?: string;
  rightLabel: string;
  onRightPress: () => void;
  inSettings?: boolean;
}) {
  return (
    <ToolPageHeader
      title={title}
      subtitle={subtitle || undefined}
      actionLabel={rightLabel}
      actionDisplayLabel={inSettings ? "✕" : "⚙"}
      onAction={onRightPress}
    />
  );
}
