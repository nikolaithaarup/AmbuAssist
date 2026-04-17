import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SUPPORT_NUMBERS_FALLBACK } from "../../src/data/supportNumbersFallback";
import { useT } from "../../src/i18n/useT";
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
import { CollapsibleCard } from "../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

function SourceItem({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle?: string;
  url?: string;
}) {
  const openSource = async () => {
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Kunne ikke åbne link", url);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Linket kunne ikke åbnes.");
    }
  };

  if (url) {
    return (
      <Pressable
        onPress={openSource}
        style={({ pressed }) => ({
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.06)",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            color: "#8ec5ff",
            fontSize: 14,
            fontWeight: "800",
            lineHeight: 18,
            textDecorationLine: "underline",
          }}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View
      style={{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "800",
          lineHeight: 18,
        }}
      >
        {title}
      </Text>

      {!!subtitle && (
        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

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
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert("Kunne ikke åbne opkald", phone);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Kunne ikke starte opkald.");
    }
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

  const renderedSources =
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
        <View
          style={{
            gap: 6,
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <Title style={{ textAlign: "center" }}>Support numre</Title>
          <Subtle style={{ textAlign: "center" }}>
            Hurtig adgang til vigtige operative telefonnumre
          </Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            {loading ? (
              <Text style={{ color: theme.colors.mutedText }}>
                Henter supportnumre...
              </Text>
            ) : sortedNumbers.length === 0 ? (
              <Text style={{ color: theme.colors.mutedText }}>
                Ingen supportnumre fundet endnu.
              </Text>
            ) : (
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.cardBorder,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.mutedText,
                      width: 190,
                      fontWeight: "800",
                    }}
                  >
                    Navn
                  </Text>

                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text
                      style={{
                        color: theme.colors.mutedText,
                        fontWeight: "800",
                        textAlign: "right",
                      }}
                    >
                      Telefonnummer
                    </Text>

                    {refreshingFromBackend && (
                      <Text
                        style={{
                          color: theme.colors.mutedText,
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        Opdaterer…
                      </Text>
                    )}
                  </View>
                </View>

                {sortedNumbers.map((item) => {
                  const name = lang === "da" ? item.nameDa : item.nameEn;

                  return (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        paddingBottom: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.text,
                          width: 190,
                          fontWeight: "700",
                          paddingRight: 12,
                        }}
                      >
                        {name}
                      </Text>

                      <Pressable
                        onPress={() => callNumber(item.phone)}
                        style={({ pressed }) => ({
                          flex: 1,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text
                          style={{
                            color: "#8ec5ff",
                            textAlign: "right",
                            textDecorationLine: "underline",
                            fontWeight: "700",
                          }}
                        >
                          {item.phone}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={
              reference?.disclaimer[lang] ??
              "Numrene er vejledende og skal verificeres mod gældende instrukser."
            }
          >
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(255,209,102,0.10)",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {reference?.disclaimer[lang] ??
                  "Numrene i dette værktøj er vejledende og skal altid verificeres mod gældende lokale instrukser, officielle kontaktlister og klinisk/operativ vurdering."}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={
              reference?.sourcesSub[lang] ??
              "Kilder og lokale kontaktgrundlag for supportnumre."
            }
          >
            <Subtle style={{ marginBottom: 8 }}>
              {reference?.sourcesSub[lang] ??
                "Kilder og lokale kontaktgrundlag for supportnumre."}
            </Subtle>

            <View style={{ marginTop: 8 }}>
              {renderedSources.map((source) => (
                <SourceItem
                  key={source.id}
                  title={source.title}
                  subtitle={source.subtitle}
                  url={source.url}
                />
              ))}
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
