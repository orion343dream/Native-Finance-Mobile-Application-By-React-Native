
import { useAuth } from '@/src/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'transactions') {
            iconName = focused ? 'list' : 'list-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#059669', // emerald-600
        tabBarInactiveTintColor: '#64748b', // slate-500
        headerShown: true,
        header: () => (
          <View style={{ height: 56, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
            <Image source={require('../../assets/images/Gemini_Generated_Image_4iaitt4iaitt4iai.png')} style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8 }} />
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#059669' }}>Native Finance</Text>
          </View>
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
        }}
      />
    </Tabs>
  );
}
