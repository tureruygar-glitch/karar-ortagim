import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "./src/store/authStore";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  const { user, initialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  if (!initialized) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator isAuthenticated={!!user} />
    </SafeAreaProvider>
  );
}
