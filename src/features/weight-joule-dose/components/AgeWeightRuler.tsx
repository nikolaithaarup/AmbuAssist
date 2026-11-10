import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { theme } from "../../../ui/theme";
import { hapticFavourite } from "../../../ui/haptics";
import {
  AGE_RULER_MONTHS,
  WEIGHT_RULER_KG,
  ageRulerLabel,
  formatAgeRulerInput,
  formatWeightRulerInput,
  nearestRulerIndex,
  parseAgeYears,
} from "../utils/ageRuler";
import { toNum } from "../utils/parsing";

const TICK = 36;
const SETTLE_DELAY_MS = 180;
type RulerMode = "age" | "weight";

type Props = {
  language: "da" | "en";
  ageYears: string;
  weightKg: string;
  onAgeChange: (value: string) => void;
  onWeightChange: (value: string) => void;
};

/** Horizontal, snap-to-tick ruler: animated visual depth, no circular dial or dependency. */
export function AgeWeightRuler({ language, ageYears, weightKg, onAgeChange, onWeightChange }: Props) {
  const [mode, setMode] = useState<RulerMode>(weightKg.trim() ? "weight" : "age");
  const [viewportWidth, setViewportWidth] = useState(0);
  const offset = useRef(new Animated.Value(0)).current;
  const scroller = useRef<ScrollView | null>(null);
  const userScrolling = useRef(false);
  const selectedIndex = useRef(-1);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollX = useRef(0);
  const options = mode === "age" ? AGE_RULER_MONTHS : WEIGHT_RULER_KG;
  const parsedAge = parseAgeYears(ageYears);
  const parsedWeight = toNum(weightKg);
  // When no measured weight is present, position the weight ruler at the AGE estimate.
  // Merely opening the weight tab never converts that estimate into a measured override.
  const estimatedWeight = Number.isFinite(parsedAge) && parsedAge >= 1 && parsedAge <= 12
    ? parsedAge * 2 + 8 : NaN;
  const effectiveWeight = Number.isFinite(parsedWeight) && parsedWeight > 0
    ? parsedWeight : estimatedWeight;
  const target = mode === "age" ? parsedAge * 12 : effectiveWeight;
  const defaultIndex = mode === "age" ? 12 : nearestRulerIndex(WEIGHT_RULER_KG, 10);
  const indexFromText = nearestRulerIndex(options, target, defaultIndex);
  const hasSelection = mode === "age" ? ageYears.trim().length > 0 : weightKg.trim().length > 0;

  useEffect(() => {
    if (userScrolling.current || !viewportWidth) return;
    selectedIndex.current = indexFromText;
    offset.setValue(indexFromText * TICK);
    scroller.current?.scrollTo({ x: indexFromText * TICK, animated: false });
  }, [mode, indexFromText, viewportWidth, offset]);

  // Cancel pending selections when navigating away; never update an unmounted calculator.
  useEffect(() => () => {
    if (settleTimer.current !== null) clearTimeout(settleTimer.current);
  }, []);

  const choose = (index: number) => {
    const safe = Math.min(options.length - 1, Math.max(0, index));
    // Re-selecting an age must still clear a previous measured-weight override.
    if (safe === selectedIndex.current && hasSelection && (mode === "weight" || !weightKg.trim())) return;
    selectedIndex.current = safe;
    if (mode === "age") onAgeChange(formatAgeRulerInput(options[safe], language));
    else onWeightChange(formatWeightRulerInput(options[safe]));
  };

  const cancelSettle = () => {
    if (settleTimer.current !== null) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  const settleSelection = (x: number) => {
    cancelSettle();
    if (!Number.isFinite(x)) return;
    // Commit only the final centred tick, not intermediate values during a fling.
    userScrolling.current = false;
    const index = Math.max(0, Math.min(options.length - 1, Math.round(x / TICK)));
    const previous = selectedIndex.current;
    choose(index);
    if (index !== previous) hapticFavourite();
  };

  const scheduleSettle = (x: number) => {
    if (!Number.isFinite(x)) return;
    lastScrollX.current = x;
    cancelSettle();
    // RN Web / iOS installed PWAs do not consistently emit momentumScrollEnd.
    // Inactivity fallback selects the landed tick without another tap.
    settleTimer.current = setTimeout(() => settleSelection(lastScrollX.current), SETTLE_DELAY_MS);
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: offset } } }],
    {
      useNativeDriver: Platform.OS !== "web",
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        if (!Number.isFinite(x)) return;
        // Don't turn the initial programmatic scroll into an unsolicited selection.
        if (!userScrolling.current && settleTimer.current === null && Math.abs(x - indexFromText * TICK) < 0.5) return;
        scheduleSettle(x);
      },
    },
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next > 0 && next !== viewportWidth) setViewportWidth(next);
  };

  const prompt = language === "da" ? "Træk for at vælge" : "Drag to select";
  const currentValue = mode === "age"
    ? (hasSelection && Number.isFinite(parsedAge)
      ? ageRulerLabel(Math.round(parsedAge * 12), language)
      : prompt)
    : weightKg.trim()
      ? `${weightKg} kg`
      : Number.isFinite(estimatedWeight)
        ? `≈ ${Math.round(estimatedWeight)} kg`
        : prompt;

  return (
    <View testID="wjd-horizontal-ruler" style={{ gap: 5 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {(["age", "weight"] as const).map((key) => (
            <Pressable
              key={key}
              testID={`wjd-ruler-tab-${key}`}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === key }}
              accessibilityLabel={key === "age" ? (language === "da" ? "Alder" : "Age") : (language === "da" ? "Vægt" : "Weight")}
              onPress={() => {
                if (key === mode) return;
                cancelSettle();
                userScrolling.current = false;
                setMode(key);
              }}
              style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 9, backgroundColor: mode === key ? "rgba(174,190,144,0.23)" : "transparent" }}
            >
              <Text style={{ color: mode === key ? theme.colors.accentMuted : theme.colors.mutedText, fontWeight: "800", fontSize: 12 }}>
                {key === "age" ? (language === "da" ? "Alder" : "Age") : (language === "da" ? "Vægt" : "Weight")}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text testID="wjd-ruler-value" style={{ color: theme.colors.text, fontSize: 13, fontWeight: "800" }}>
          {currentValue}
        </Text>
      </View>
      <View onLayout={onLayout} style={{ height: 50, width: "100%", overflow: "hidden", borderRadius: 11, backgroundColor: "rgba(9,12,8,0.18)" }}>
        <Animated.ScrollView
          key={mode}
          ref={scroller}
          testID={`wjd-ruler-track-${mode}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          snapToInterval={TICK}
          snapToAlignment="start"
          scrollEventThrottle={16}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: Math.max(0, (viewportWidth - TICK) / 2) }}
          onScroll={onScroll}
          onScrollBeginDrag={() => { userScrolling.current = true; cancelSettle(); }}
          onScrollEndDrag={(event) => { scheduleSettle(event.nativeEvent.contentOffset.x); }}
          onMomentumScrollBegin={() => { userScrolling.current = true; cancelSettle(); }}
          onMomentumScrollEnd={(event) => { settleSelection(event.nativeEvent.contentOffset.x); }}
        >
          {options.map((value, index) => {
            const major = mode === "age" ? value % 12 === 0 : value % 5 === 0;
            // Every whole kilogram has a printed number; fives read as landmarks.
            const tickLabel = mode === "age" ? (value < 12 ? `${value}m` : String(value / 12)) : String(value);
            const inputRange = [(index - 3) * TICK, index * TICK, (index + 3) * TICK];
            return (
              <Pressable
                key={`${mode}-${value}`}
                testID={`wjd-ruler-tick-${index}`}
                accessibilityRole="button"
                accessibilityLabel={mode === "age" ? ageRulerLabel(value, language) : `${formatWeightRulerInput(value)} kg`}
                onPress={() => {
                  userScrolling.current = false;
                  choose(index);
                  scroller.current?.scrollTo({ x: index * TICK, animated: true });
                  hapticFavourite();
                }}
                style={{ width: TICK, height: 50, alignItems: "center", justifyContent: "center" }}
              >
                <Animated.View style={{ alignItems: "center", gap: 3, opacity: offset.interpolate({ inputRange, outputRange: [0.38, 1, 0.38], extrapolate: "clamp" }), transform: [{ scale: offset.interpolate({ inputRange, outputRange: [0.81, 1.09, 0.81], extrapolate: "clamp" }) }] }}>
                  <View style={{ width: major ? 2 : 1, height: major ? 14 : 9, backgroundColor: major ? theme.colors.accentMuted : theme.colors.mutedText, borderRadius: 2 }} />
                  <Text style={{ color: major ? theme.colors.accentMuted : theme.colors.mutedText, fontSize: major ? 13 : 11, fontWeight: major ? "900" : "600" }} numberOfLines={1}>{tickLabel}</Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </Animated.ScrollView>
        <View pointerEvents="none" style={{ position: "absolute", left: "50%", top: 4, bottom: 3, width: 2, marginLeft: -1, borderRadius: 2, backgroundColor: theme.colors.accentMuted, opacity: 0.88 }} />
      </View>
    </View>
  );
}
