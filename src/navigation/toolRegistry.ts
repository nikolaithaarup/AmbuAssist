import type { Href } from "expo-router";
import type { Key } from "../i18n/strings";

export const HOME_TOOLS = [
  { id: "destination", titleKey: "tool_dest_title", descKey: "tool_dest_desc", path: "/tools/destination" },
  { id: "weight-joule-dose", titleKey: "tool_weightDose_title", descKey: "tool_weightDose_desc", path: "/tools/weight-joule-dose" },
  { id: "thrombolysis", titleKey: "tool_trombolysis_title", descKey: "tool_trombolysis_desc", path: "/tools/trombolysis" },
  { id: "burns", titleKey: "tool_burns_title", descKey: "tool_burns_desc", path: "/tools/brandsaar" },
  { id: "support-numbers", titleKey: "tool_supportNumbers_title", descKey: "tool_supportNumbers_desc", path: "/tools/support-numbers" },
  { id: "exams", titleKey: "tool_exams_title", descKey: "tool_exams_desc", path: "/tools/exams" },
  { id: "assessment-tools", titleKey: "tool_assessment_title", descKey: "tool_assessment_desc", path: "/tools/assessment-tools" },
  { id: "medical-disclaimer", titleKey: "tool_meddisc_title", descKey: "tool_meddisc_desc", path: "/tools/medical-disclaimer" },
  { id: "contact", titleKey: "tool_contact_title", descKey: "tool_contact_desc", path: "/tools/contact" },
  { id: "about", titleKey: "tool_about_title", descKey: "tool_about_desc", path: "/tools/about" },
] as const satisfies ReadonlyArray<{
  id: string;
  titleKey: Key;
  descKey: Key;
  path: Extract<Href, string>;
}>;

export type HomeTool = (typeof HOME_TOOLS)[number];
export type ToolId = HomeTool["id"];

const TOOL_IDS = new Set<string>(HOME_TOOLS.map((tool) => tool.id));

export function isToolId(value: unknown): value is ToolId {
  return typeof value === "string" && TOOL_IDS.has(value);
}

export function getToolById(id: ToolId): HomeTool {
  return HOME_TOOLS.find((tool) => tool.id === id)!;
}
