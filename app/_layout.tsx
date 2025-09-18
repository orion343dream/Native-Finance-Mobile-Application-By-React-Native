
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native"; // Import Text for loading state
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
    return <Text>Loading authentication...</Text>;
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
