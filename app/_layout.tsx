
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { TransactionsProvider } from "../src/transactions/TransactionsContext";

const AuthRedirector = () => {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inTabsGroup = segments[0] === "(tabs)";
    if (user && !inTabsGroup) {
      router.replace("/(tabs)");
    } else if (!user && inTabsGroup) {
      router.replace("/login");
    } else if (!user && segments[0] !== 'login' && segments[0] !== 'register') {
      router.replace("/login");
    }
  }, [user, segments]);

  return <Slot />;
};

const InitialLayout = () => {
  const { loading } = useAuth(); // Get loading state

  // Show a loading indicator until authentication state is resolved
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return <AuthRedirector />;
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <TransactionsProvider>
          <InitialLayout />
        </TransactionsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    color: '#475569',
    fontSize: 16,
  },
});
