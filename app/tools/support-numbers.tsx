import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";

import { SUPPORT_NUMBERS_FALLBACK } from "../../src/data/supportNumbersFallback";
import { useT } from "../../src/i18n/useT";
import { openPhoneNumber } from "../../src/services/phoneAction";
import {
  getReference,
  type ReferenceDoc,
} from "../../src/services/referenceService";
import {
  getSupportNumbers,
  type SupportNumber,
} from "../../src/services/supportNumbers";
import { useSettings } from "../../src/state/settings";
import { Background } from "../../src/ui/Background";
import { ClinicalDisclosure } from "../../src/ui/ClinicalDisclosure";
import { Screen, Subtle } from "../../src/ui/Ui";
import {
  ToolActionButton,
  ToolPageHeader,
  ToolSectionLabel,
  ToolSurface,
} from "../../src/ui/ToolSurface";
import { theme } from "../../src/ui/theme";

function normalizePhone(phone: string) {
  const trimmed = String(phone ?? "").trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("+")) return trimmed;
  return `+45${trimmed.replace(/\s+/g, "")}`;
}

export default function SupportNumbersPage() {
  const { settings } = useSettings();
  const { t } = useT();
  const lang = settings.language === "da" ? "da" : "en";

  const [reference, setReference] = useState<ReferenceDoc | null>(null);
  const [numbers, setNumbers] = useState<SupportNumber[]>(
    SUPPORT_NUMBERS_FALLBACK.map((item) => ({
      ...item,
      phone: normalizePhone(item.phone),
    })),
  );
  const [loading, setLoading] = useState(false);
  const [refreshingFromBackend, setRefreshingFromBackend] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadNumbersFromBackend() {
      try {
        setRefreshingFromBackend(true);
        const backendNumbers = await getSupportNumbers();

        if (!active) return;

        if (backendNumbers.length > 0) {
          setNumbers(
            backendNumbers.map((item) => ({
              ...item,
              phone: normalizePhone(item.phone),
            })),
          );
        }
      } catch (error) {
        console.error("Error refreshing support numbers:", error);
      } finally {
        if (active) {
          setRefreshingFromBackend(false);
          setLoading(false);
        }
      }
    }

    async function loadReferenceData() {
      try {
        const referenceData = await getReference("support_numbers");
        if (!active) return;
        setReference(referenceData);
      } catch (error) {
        console.error("Error loading support reference:", error);
      }
    }

    loadNumbersFromBackend();
    loadReferenceData();

    return () => {
      active = false;
    };
  }, []);

  const sortedNumbers = useMemo(() => {
    return [...numbers].sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      if (orderDiff !== 0) return orderDiff;

      const aName = lang === "da" ? a.nameDa : a.nameEn;
      const bName = lang === "da" ? b.nameDa : b.nameEn;
      return aName.localeCompare(bName, "da");
    });
  }, [numbers, lang]);

  const callNumber = async (phone: string) => {
    await openPhoneNumber(phone).catch(() => false);
  };

  const fallbackSources = [
    {
      id: "support-fallback-1",
      title:
        lang === "da"
          ? "Lokale operative kontaktlister"
          : "Local operational contact lists",
      subtitle:
        lang === "da"
          ? "Telefonnumre skal altid verificeres mod gældende lokale instrukser og officielle kontaktlister."
          : "Phone numbers must always be verified against current local procedures and official contact lists.",
    },
    {
      id: "support-fallback-2",
      title:
        lang === "da"
          ? "Klinisk og operativ verifikation kræves"
          : "Clinical and operational verification required",
      subtitle:
        lang === "da"
          ? "Numre i dette værktøj er vejledende hjælpemidler og skal bruges sammen med gældende retningslinjer og lokal praksis."
          : "Numbers in this tool are advisory aids and must be used together with current guidance and local practice.",
    },
  ];

  const renderedSources: Array<{
    id: string;
    title: string;
    subtitle: string;
    url?: string;
  }> =
    reference?.sources && reference.sources.length > 0
      ? reference.sources.map((source) => ({
          id: source.id,
          title: source.title[lang],
          subtitle: source.subtitle[lang],
          url: (source as any).url?.[lang] ?? (source as any).url ?? undefined,
        }))
      : fallbackSources;

  return (
    <Background>
      <Screen>
        <ToolPageHeader
          title={t("tool_supportNumbers_title")}
          subtitle={t("tool_supportNumbers_desc")}
        />

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <ToolSurface style={{ paddingHorizontal: 13 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <ToolSectionLabel>{lang === "da" ? "Kontakter" : "Contacts"}</ToolSectionLabel>
              </View>
              {refreshingFromBackend ? (
                <Subtle>{lang === "da" ? "Opdaterer…" : "Updating…"}</Subtle>
              ) : null}
            </View>
            {loading ? (
              <Text style={{ color: theme.colors.mutedText }}>
                {lang === "da" ? "Henter supportnumre…" : "Loading support numbers…"}
              </Text>
            ) : sortedNumbers.length === 0 ? (
              <Text style={{ color: theme.colors.mutedText }}>
                {lang === "da" ? "Ingen supportnumre fundet endnu." : "No support numbers found yet."}
              </Text>
            ) : (
              <View>
                {sortedNumbers.map((item) => {
                  const name = lang === "da" ? item.nameDa : item.nameEn;

                  return (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.divider,
                      }}
                    >
                      <Text style={{ flex: 1, minWidth: 0, color: theme.colors.text, fontSize: 15, lineHeight: 20, fontWeight: "800" }}>
                        {name}
                      </Text>
                      <View style={{ width: 116 }}>
                        <ToolActionButton
                          tone="call"
                          compact
                          label={item.phone}
                          accessibilityLabel={`${lang === "da" ? "Ring" : "Call"} ${name}: ${item.phone}`}
                          onPress={() => callNumber(item.phone)}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ToolSurface>

          <ClinicalDisclosure
            disclaimer={reference?.disclaimer[lang] ??
              "Numrene i dette værktøj er vejledende og skal altid verificeres mod gældende lokale instrukser, officielle kontaktlister og klinisk/operativ vurdering."}
            sourcesIntro={reference?.sourcesSub[lang] ??
              "Kilder og lokale kontaktgrundlag for supportnumre."}
            sources={renderedSources}
          />
        </ScrollView>
      </Screen>
    </Background>
  );
}
