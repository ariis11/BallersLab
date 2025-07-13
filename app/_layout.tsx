import { AuthProvider } from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function RootLayout() {
  return (
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
            animation: "none",
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            animation: "none",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
