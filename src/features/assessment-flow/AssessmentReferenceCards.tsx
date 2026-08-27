import type { ReferenceDoc } from "../../services/referenceService";
import { ClinicalDisclosure } from "../../ui/ClinicalDisclosure";

export function AssessmentReferenceCards({ reference, lang }: {
  reference: ReferenceDoc | null;
  lang: "en" | "da";
}) {
  const disclaimer = reference?.disclaimer?.[lang] ?? "";
  const sourcesSub = reference?.sourcesSub?.[lang] ?? "";
  return (
    <ClinicalDisclosure
      disclaimer={disclaimer}
      sourcesIntro={sourcesSub}
      sources={(reference?.sources ?? []).map((source) => ({
        id: source.id,
        title: source.title?.[lang] ?? source.title?.en ?? "",
        subtitle: source.subtitle?.[lang] ?? source.subtitle?.en ?? "",
        url: source.url?.[lang] ?? source.url?.en,
      }))}
    />
  );
}
