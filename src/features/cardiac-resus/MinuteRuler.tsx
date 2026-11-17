import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { theme } from "../../ui/theme";

const STEP = 44;
const SETTLE_MS = 160;

type Props = {
  value: number;
  maxMinutes: number;
  onChange: (minutes: number) => void;
  label: string;
  relative?: boolean;
};

/** Whole-minute horizontal ruler modelled on the age/weight selector.
 * Scrolling changes only the pending selection. Nothing is saved until
 * the confirmation action in the parent dialog.
 */
export function MinuteRuler({ value, maxMinutes, onChange, label, relative = false }: Props) {
  const maximum = Math.max(0, Math.floor(Number.isFinite(maxMinutes) ? maxMinutes : 0));
  const selected = Math.max(0, Math.min(maximum, Math.round(Number.isFinite(value) ? value : 0)));
  const options = useMemo(() => Array.from({ length: maximum + 1 }, (_, i) => i), [maximum]);
  const scroller = useRef<ScrollView>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interacted = useRef(false);
  const [width, setWidth] = useState(0);

  const cancelSettle = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    if (!width || interacted.current) return;
    scroller.current?.scrollTo({ x: selected * STEP, animated: false });
  }, [selected, width]);

  useEffect(() => () => cancelSettle(), []);

  const choose = (index: number) => {
    const next = Math.max(0, Math.min(maximum, Math.round(index)));
    interacted.current = false;
    if (next !== selected) onChange(next);
    scroller.current?.scrollTo({ x: next * STEP, animated: true });
  };

  const settle = (offset: number) => {
    cancelSettle();
    if (!Number.isFinite(offset)) return;
    choose(Math.round(offset / STEP));
  };

  const queueSettle = (offset: number) => {
    if (!Number.isFinite(offset)) return;
    cancelSettle();
    timer.current = setTimeout(() => settle(offset), SETTLE_MS);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    if (!Number.isFinite(x)) return;
    // Browser trackpad scrolling may not emit onScrollBeginDrag. Ignore only
    // the initial programmatic centering; treat other movement as user input.
    if (!interacted.current && Math.abs(x - selected * STEP) < 0.5) return;
    interacted.current = true;
    queueSettle(x);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next > 0 && next !== width) setWidth(next);
  };

  return (
    <View testID="cardiac-minute-ruler" style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: theme.colors.mutedText, fontWeight: "700", fontSize: 13 }}>{label}</Text>
        <Text testID="cardiac-minute-selection" style={{ color: theme.colors.text, fontWeight: "900", fontSize: 17, fontVariant: ["tabular-nums"] }}>
          {relative ? "+" : ""}{selected} min
        </Text>
      </View>
      <View onLayout={onLayout} style={{ height: 64, borderRadius: 12, backgroundColor: theme.colors.interactive, overflow: "hidden" }}>
        <ScrollView
          ref={scroller}
          testID="cardiac-minute-ruler-track"
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={STEP}
          snapToAlignment="start"
          scrollEventThrottle={16}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: Math.max(0, (width - STEP) / 2) }}
          onScroll={onScroll}
          onScrollBeginDrag={() => { interacted.current = true; cancelSettle(); }}
          onScrollEndDrag={(event) => queueSettle(event.nativeEvent.contentOffset.x)}
          onMomentumScrollBegin={() => { interacted.current = true; cancelSettle(); }}
          onMomentumScrollEnd={(event) => settle(event.nativeEvent.contentOffset.x)}
        >
          {options.map((minute) => {
            const active = minute === selected;
            const major = minute % 5 === 0;
            return (
              <Pressable
                key={minute}
                testID={"cardiac-minute-" + minute}
                accessibilityRole="button"
                accessibilityLabel={(relative ? "+" : "") + minute + " minutter"}
                accessibilityState={{ selected: active }}
                onPress={() => { cancelSettle(); choose(minute); }}
                style={{ height: 64, width: STEP, alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                <View style={{ width: major ? 3 : 2, height: major ? 18 : 12, borderRadius: 2, backgroundColor: active ? theme.colors.text : theme.colors.accentMuted }} />
                <Text style={{ color: active ? theme.colors.text : theme.colors.mutedText, fontWeight: active || major ? "900" : "600", fontSize: 12 }}>{minute}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View pointerEvents="none" style={{ position: "absolute", width: 2, top: 2, bottom: 3, left: "50%", marginLeft: -1, backgroundColor: theme.colors.text, opacity: 0.75, borderRadius: 2 }} />
      </View>
    </View>
  );
}
