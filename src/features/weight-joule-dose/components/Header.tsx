import { ToolPageHeader } from "../../../ui/ToolSurface";

export function Header({
  title,
  subtitle,
  rightLabel,
  onRightPress,
}: {
  title: string;
  subtitle: string;
  rightLabel: string;
  onRightPress: () => void;
}) {
  return <ToolPageHeader title={title} subtitle={subtitle} actionLabel={rightLabel} actionDisplayLabel="⚙" onAction={onRightPress} />;
}
