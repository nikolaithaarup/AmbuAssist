import { useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DestinationCategoryIntent } from "../../domain/destination/categoryRouting";
import { Input, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import {
  usePressFeedback,
  useReducedMotionPreference,
} from "../../ui/motion";

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

// destination-compact-favourite-rows-v1
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
        minHeight: 48,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 13,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        backgroundColor: pressed
          ? "rgba(255,255,255,0.07)"
          : selected
            ? "rgba(145,169,108,0.11)"
            : "transparent",
      })}
    >
      <Text style={{ flex: 1, minWidth: 0, color: theme.colors.text, fontSize: 15, fontWeight: selected ? "800" : "600" }}>
        {label}
      </Text>
      {selected ? (
        <Text style={{ color: theme.colors.accentMuted, fontWeight: "900", fontSize: 17 }}>
          ✓
        </Text>
      ) : null}
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
  const pwa = Platform.OS === "web";
  const reducedMotion = useReducedMotionPreference(true);
  const openFeedback = usePressFeedback();
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
    <View style={{ width: "100%", minWidth: 0, gap: 9 }}>
      {!selectedIsFavourite ? (
        <View style={{ gap: 6 }}>
          <Subtle>{lang === "da" ? "Valgt visitation" : "Selected visitation"}</Subtle>
          <View style={{ minWidth: 0, alignItems: "flex-start" }}>
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
          <ScrollView nestedScrollEnabled style={{ maxHeight: 242 }} showsVerticalScrollIndicator={favourites.length > 4}>
            <View style={{ width: "100%", minWidth: 0, overflow: "hidden", borderRadius: 12, borderWidth: 1, borderColor: theme.colors.cardBorder }}>
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
          </ScrollView>
        </View>
      ) : (
        <Subtle>
          {lang === "da"
            ? "Ingen favoritter valgt. Alle visitationer er stadig tilgængelige."
            : "No favourites selected. All visitations remain available."}
        </Subtle>
      )}

      <Animated.View style={openFeedback.animatedStyle}>
        <Pressable
          testID="destination-all-categories-toggle"
          accessibilityRole="button"
          accessibilityLabel={
            lang === "da" ? "Alle visitationer" : "All visitations"
          }
          accessibilityState={{ expanded: open }}
          onPress={onOpen}
          onPressIn={openFeedback.onPressIn}
          onPressOut={openFeedback.onPressOut}
          style={({ pressed }) => ({
            minHeight: Platform.OS === "web" ? theme.controlHeight : 48,
            width: "100%",
            minWidth: 0,
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
          <Text
            style={{
              flex: 1,
              minWidth: 0,
              color: theme.colors.accentMuted,
              fontWeight: "800",
            }}
          >
            {lang === "da" ? "Alle visitationer" : "All visitations"}
          </Text>
          <Text style={{ color: theme.colors.accentMuted, fontSize: 20 }}>›</Text>
        </Pressable>
      </Animated.View>

      <Modal
        testID="destination-category-modal"
        visible={open}
        transparent
        animationType={pwa && reducedMotion ? "none" : "slide"}
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
          <SafeAreaView
            accessibilityViewIsModal
            edges={["bottom"]}
            style={{
              maxHeight: "88%",
              width: "100%",
              maxWidth: 720,
              alignSelf: "center",
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
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
