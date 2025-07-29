import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00E6FF",
        tabBarInactiveTintColor: "#A0A4B8",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#181C2E",
          borderTopColor: "#23263A",
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          paddingTop: 10,
          height: 50 + insets.bottom,
        },
        headerShown: false,
      }}
      backBehavior="order"
      initialRouteName="tournaments"
    >
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Tournaments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="trophy-variant"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tournaments"
        options={{
          title: "My Tournaments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="podium"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              size={30}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
