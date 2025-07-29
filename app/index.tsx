import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return null;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // If user is authenticated but profile is not completed, redirect to create profile
  if (!user.profileCompleted) {
    return <Redirect href="/auth/create-profile" />;
  }

  // If user is authenticated and profile is completed, redirect to main app
  return <Redirect href="/(protected)/(tabs)/tournaments" />;
} 