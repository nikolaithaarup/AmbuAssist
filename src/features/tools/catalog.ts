import type { Href } from "expo-router";

export type ToolDefinition = { path: Extract<Href, string>; titleKey: any; descKey?: any };

export const HOME_TOOLS: ToolDefinition[] = [
  { path: "/tools/destination", titleKey: "tool_dest_title", descKey: "tool_dest_desc" },
  { path: "/tools/weight-joule-dose", titleKey: "tool_weightDose_title", descKey: "tool_weightDose_desc" },
  { path: "/tools/trombolysis", titleKey: "tool_trombolysis_title", descKey: "tool_trombolysis_desc" },
  { path: "/tools/support-numbers", titleKey: "tool_supportNumbers_title", descKey: "tool_supportNumbers_desc" },
  { path: "/tools/exams", titleKey: "tool_exams_title", descKey: "tool_exams_desc" },
  { path: "/tools/assessment-tools", titleKey: "tool_assessment_title", descKey: "tool_assessment_desc" },
  { path: "/tools/medical-disclaimer", titleKey: "tool_meddisc_title", descKey: "tool_meddisc_desc" },
  { path: "/tools/contact", titleKey: "tool_contact_title", descKey: "tool_contact_desc" },
  { path: "/tools/about", titleKey: "tool_about_title", descKey: "tool_about_desc" },
];

export const FAVOURITABLE_TOOLS: ToolDefinition[] = [
  ...HOME_TOOLS,
  { path: "/tools/brandsaar", titleKey: "tool_burns_title" },
  { path: "/tools/assessment-tools/news2", titleKey: "tool_news2_title" },
  { path: "/tools/assessment-tools/wells-dvt", titleKey: "tool_wells_title" },
  { path: "/tools/assessment-tools/spinal-trauma", titleKey: "tool_spine_title" },
  { path: "/tools/assessment-tools/neurological", titleKey: "tool_neuro_title" },
  { path: "/tools/assessment-tools/paediatric", titleKey: "tool_paediatric_title" },
  { path: "/tools/assessment-tools/behavioural-geriatric", titleKey: "tool_behaviouralGeriatric_title" },
  { path: "/tools/assessment-tools/bloodgas", titleKey: "tool_bloodgas_title" },
  { path: "/tools/assessment-tools/bloodgas/acid-base", titleKey: "tool_bg_acidbase_title" },
  { path: "/tools/assessment-tools/bloodgas/patterns", titleKey: "tool_bg_patterns_title" },
  { path: "/tools/assessment-tools/bloodgas/infection", titleKey: "tool_bg_infection_title" },
];
