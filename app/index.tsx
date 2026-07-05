// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { useT } from "../src/i18n/useT";
import { Background } from "../src/ui/Background";
import { hapticToolOpen } from "../src/ui/haptics";
import { theme } from "../src/ui/theme";
import { Card, Screen, Subtle, Title } from "../src/ui/Ui";

const BAM_ID_PATTERN = /^[A-Z]{4}[0-9]{4}$/;
const BAM_ID_STORAGE_KEY = "ambuassist:bamId";

export default function LoginLanding() {
  const router = useRouter();
  const { t } = useT();

  const [bamId, setBamId] = useState("");
  const [error, setError] = useState("");
  const [checkingSavedLogin, setCheckingSavedLogin] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  const normalizedBamId = bamId.trim().toUpperCase();
  const isValidBamId = BAM_ID_PATTERN.test(normalizedBamId);

  useEffect(() => {
    let isMounted = true;

    const checkSavedLogin = async () => {
      try {
        const savedBamId = await AsyncStorage.getItem(BAM_ID_STORAGE_KEY);

        if (savedBamId && BAM_ID_PATTERN.test(savedBamId)) {
          router.replace("/home");
          return;
        }
      } catch {
        // If AsyncStorage fails, just show the login screen.
      } finally {
        if (isMounted) {
          setCheckingSavedLogin(false);
        }
      }
    };

    checkSavedLogin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async () => {
    if (!isValidBamId) {
      setError("Indtast et gyldigt BAM-ID");
      return;
    }

    try {
      setLoggingIn(true);
      setError("");

      await AsyncStorage.setItem(BAM_ID_STORAGE_KEY, normalizedBamId);

      hapticToolOpen();
      router.replace("/home");
    } catch {
      setError("Kunne ikke gemme login. Prøv igen.");
      setLoggingIn(false);
    }
  };

  const handleChange = (value: string) => {
    const cleaned = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 8);

    setBamId(cleaned);

    if (error) {
      setError("");
    }
  };

  if (checkingSavedLogin) {
    return (
      <Background variant="home">
        <Screen
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 8,
          }}
        >
          <ActivityIndicator />
        </Screen>
      </Background>
    );
  }

  return (
    <Background variant="home">
      <Screen
        style={{
          flex: 1,
          justifyContent: "center",
          paddingTop: 8,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              alignItems: "center",
              paddingHorizontal: 8,
            }}
          >
            <Image
              source={require("../assets/her-icon.png")}
              style={{
                width: 96,
                height: 96,
                marginBottom: 0,
                opacity: 0.95,
              }}
              resizeMode="contain"
            />

            <Image
              source={require("../assets/ambuassist-logo.png")}
              style={{
                width: "100%",
                maxWidth: 440,
                height: 82,
                marginTop: -12,
                marginBottom: -8,
              }}
              resizeMode="contain"
            />

            <Subtle
              style={{
                textAlign: "center",
                marginTop: 0,
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              {t("homeTagline")}
            </Subtle>

            <Card
              style={{
                width: "100%",
                paddingHorizontal: 18,
                paddingVertical: 18,
                gap: 14,
              }}
            >
              <View style={{ gap: 6 }}>
                <Title style={{ fontSize: 20, letterSpacing: -0.2 }}>
                  Indtast BAM-ID
                </Title>
              </View>

              <TextInput
                value={bamId}
                onChangeText={handleChange}
                placeholder="BAM-ID"
                placeholderTextColor={theme.colors.mutedText}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
                returnKeyType="go"
                editable={!loggingIn}
                onSubmitEditing={handleLogin}
                style={{
                  width: "100%",
                  minHeight: 54,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: error
                    ? theme.colors.warn
                    : theme.colors.cardBorder,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "white",
                  paddingHorizontal: 16,
                  fontSize: 18,
                  letterSpacing: 1.8,
                  fontWeight: "700",
                }}
              />

              {error ? (
                <Subtle
                  style={{
                    color: theme.colors.warn,
                    fontSize: 13,
                  }}
                >
                  {error}
                </Subtle>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Log ind"
                onPress={handleLogin}
                disabled={loggingIn}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isValidBamId
                    ? theme.colors.accentSurface
                    : "rgba(255,255,255,0.08)",
                  borderWidth: 1,
                  borderColor: isValidBamId
                    ? theme.colors.cardBorder
                    : "rgba(255,255,255,0.12)",
                  opacity: pressed || loggingIn ? 0.78 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Title
                  style={{
                    fontSize: 17,
                    letterSpacing: -0.1,
                    color: "white",
                  }}
                >
                  {loggingIn ? "Logger ind..." : "Log ind"}
                </Title>
              </Pressable>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </Background>
  );
}
