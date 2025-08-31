
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { TransactionsProvider } from "../src/transactions/TransactionsContext";
import { useEffect } from "react";

const InitialLayout = () => {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inTabsGroup = segments[0] === "(tabs)";
    if (user && !inTabsGroup) {
      router.replace("/(tabs)");
    } else if (!user && inTabsGroup) {
      router.replace("/login");
    }
  }, [user]);

  return <Slot />;
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <InitialLayout />
      </TransactionsProvider>
    </AuthProvider>
  );
};

export default RootLayout;
