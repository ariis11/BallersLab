import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";

export default function BottomTabsLayout() {
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "teal" }}
      backBehavior="order"
    >
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Tournaments",
          headerShown: false,
          tabBarLabel: "Tournaments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="basketball"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tournaments"
        options={{
          title: "My Tournaments",
          headerShown: false,
          tabBarLabel: "My Tournaments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="basketball"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
