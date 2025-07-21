import { AuthProvider } from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen
            name="(protected)"
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen
            name="auth/login"
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen
            name="auth/register"
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen
            name="auth/create-profile"
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
