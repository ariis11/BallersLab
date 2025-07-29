import { useAuth } from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) {
    return null; // or a loading indicator
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (!user.profileCompleted) {
    return <Redirect href="/auth/create-profile" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="bracket"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
