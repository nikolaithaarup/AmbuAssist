import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { DestinationCategoryIntent } from "../../domain/destination/categoryRouting";
import { Input, Label, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";

type Props = {
  lang: "da" | "en";
  selected: DestinationCategoryIntent;
  favourites: readonly DestinationCategoryIntent[];
  options: readonly DestinationCategoryIntent[];
  open: boolean;
  getLabel: (category: DestinationCategoryIntent) => string;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (category: DestinationCategoryIntent) => void;
  onToggleFavourite: (category: DestinationCategoryIntent) => void;
};

function CategoryChip({
  category,
  label,
  selected,
  onPress,
}: {
  category: DestinationCategoryIntent;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`destination-favourite-category-${category}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 46,
        maxWidth: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 15,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected
          ? theme.colors.accentMuted
          : "rgba(190,202,165,0.18)",
        backgroundColor: selected
          ? "rgba(145,169,108,0.22)"
          : pressed
            ? "rgba(255,255,255,0.07)"
            : "rgba(38,43,34,0.68)",
        opacity: pressed ? 0.82 : 1,
      })}
    >
      {selected ? (
        <Text style={{ color: theme.colors.accentMuted, fontWeight: "900" }}>
          ✓
        </Text>
      ) : null}
      <Text
        style={{
          flexShrink: 1,
          color: theme.colors.text,
          fontSize: 14,
          lineHeight: 18,
          fontWeight: selected ? "900" : "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function DestinationCategoryPicker({
  lang,
  selected,
  favourites,
  options,
  open,
  getLabel,
  onOpen,
  onClose,
  onSelect,
  onToggleFavourite,
}: Props) {
  const [query, setQuery] = useState("");
  const selectedIsFavourite = favourites.includes(selected);
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("da-DK");
    if (!normalized) return options;
    return options.filter((category) =>
      `${getLabel(category)} ${category}`
        .toLocaleLowerCase("da-DK")
        .includes(normalized),
    );
  }, [getLabel, options, query]);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <View style={{ gap: 9 }}>
      <Label>{lang === "da" ? "Visitationstype" : "Visitation type"}</Label>

      {!selectedIsFavourite ? (
        <View style={{ gap: 6 }}>
          <Subtle>{lang === "da" ? "Valgt visitation" : "Selected visitation"}</Subtle>
          <View style={{ alignItems: "flex-start" }}>
            <CategoryChip
              category={selected}
              label={getLabel(selected)}
              selected
              onPress={onOpen}
            />
          </View>
        </View>
      ) : null}

      {favourites.length > 0 ? (
        <View style={{ gap: 7 }}>
          <Subtle style={{ fontWeight: "800" }}>
            {lang === "da" ? "Favoritter" : "Favourites"}
          </Subtle>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {favourites.map((category) => (
              <CategoryChip
                key={category}
                category={category}
                label={getLabel(category)}
                selected={selected === category}
                onPress={() => onSelect(category)}
              />
            ))}
          </View>
        </View>
      ) : (
        <Subtle>
          {lang === "da"
            ? "Ingen favoritter valgt. Alle visitationer er stadig tilgængelige."
            : "No favourites selected. All visitations remain available."}
        </Subtle>
      )}

      <Pressable
        testID="destination-all-categories-toggle"
        accessibilityRole="button"
        accessibilityLabel={
          lang === "da" ? "Alle visitationer" : "All visitations"
        }
        accessibilityState={{ expanded: open }}
        onPress={onOpen}
        style={({ pressed }) => ({
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingHorizontal: 13,
          borderRadius: 14,
          backgroundColor: pressed
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.035)",
          opacity: pressed ? 0.78 : 1,
        })}
      >
        <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>
          {lang === "da" ? "Alle visitationer" : "All visitations"}
        </Text>
        <Text style={{ color: theme.colors.accentMuted, fontSize: 20 }}>›</Text>
      </Pressable>

      <Modal
        testID="destination-category-modal"
        visible={open}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={close}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            accessibilityLabel={lang === "da" ? "Luk" : "Close"}
            onPress={close}
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          />
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: "88%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              backgroundColor: "rgba(31,35,28,0.98)",
              paddingTop: 16,
              paddingHorizontal: 16,
              paddingBottom: 12,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Title style={{ flex: 1, fontSize: 21 }}>
                {lang === "da" ? "Alle visitationer" : "All visitations"}
              </Title>
              <Pressable
                testID="destination-category-modal-close"
                accessibilityRole="button"
                accessibilityLabel={lang === "da" ? "Luk" : "Close"}
                onPress={close}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.055)",
                  opacity: pressed ? 0.65 : 1,
                })}
              >
                <Text style={{ color: theme.colors.text, fontSize: 22 }}>×</Text>
              </Pressable>
            </View>

            <Input
              testID="destination-category-search"
              accessibilityLabel={
                lang === "da" ? "Søg visitation" : "Search visitation"
              }
              value={query}
              onChangeText={setQuery}
              placeholder={
                lang === "da"
                  ? "Søg efter navn eller kategori"
                  : "Search by name or category"
              }
              autoCapitalize="none"
            />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((category) => {
                  const favourite = favourites.includes(category);
                  const selectedRow = selected === category;
                  const label = getLabel(category);
                  return (
                    <View
                      key={category}
                      style={{
                        minHeight: 54,
                        flexDirection: "row",
                        alignItems: "stretch",
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.divider,
                      }}
                    >
                      <Pressable
                        testID={`destination-category-option-${category}`}
                        accessibilityRole="button"
                        accessibilityLabel={label}
                        accessibilityState={{ selected: selectedRow }}
                        onPress={() => {
                          onSelect(category);
                          close();
                        }}
                        style={({ pressed }) => ({
                          flex: 1,
                          minHeight: 54,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 9,
                          paddingHorizontal: 5,
                          paddingVertical: 10,
                          opacity: pressed ? 0.68 : 1,
                        })}
                      >
                        <Text
                          style={{
                            width: 18,
                            color: theme.colors.accentMuted,
                            fontWeight: "900",
                          }}
                        >
                          {selectedRow ? "✓" : ""}
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            color: theme.colors.text,
                            fontSize: 15,
                            lineHeight: 20,
                            fontWeight: selectedRow ? "900" : "600",
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                      <Pressable
                        testID={`destination-category-favourite-${category}`}
                        accessibilityRole="button"
                        accessibilityLabel={
                          favourite
                            ? `${lang === "da" ? "Fjern favorit" : "Remove favourite"}: ${label}`
                            : `${lang === "da" ? "Tilføj favorit" : "Add favourite"}: ${label}`
                        }
                        accessibilityState={{ selected: favourite }}
                        onPress={() => onToggleFavourite(category)}
                        style={({ pressed }) => ({
                          width: 52,
                          minHeight: 52,
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: pressed ? 0.62 : 1,
                        })}
                      >
                        <Text
                          style={{
                            color: favourite
                              ? theme.colors.warn
                              : theme.colors.mutedText,
                            fontSize: 24,
                          }}
                        >
                          {favourite ? "★" : "☆"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              ) : (
                <Subtle style={{ paddingVertical: 20, textAlign: "center" }}>
                  {lang === "da"
                    ? "Ingen visitationer matcher søgningen."
                    : "No visitations match your search."}
                </Subtle>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
