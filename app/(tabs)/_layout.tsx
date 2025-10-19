
import { useAuth } from '@/src/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, Platform, Pressable, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

function AppHeader() {
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const statusPad = Platform.OS === 'android' ? (Constants.statusBarHeight || 0) : 0;

  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>
      <View
        style={{
          paddingTop: statusPad,
          height: 80 + statusPad,
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../assets/images/Gemini_Generated_Image_4iaitt4iaitt4iai.png')} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#059669' }}>Native Finance</Text>
        </View>

        <View>
          <TouchableOpacity onPress={() => setShowMenu((s) => !s)} activeOpacity={0.8}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
              style={{ width: 34, height: 34, borderRadius: 17 }}
            />
          </TouchableOpacity>
          <Modal
            visible={showMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setShowMenu(false)}>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    position: 'absolute',
                    top: statusPad + 40,
                    right: 4,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    paddingVertical: 6,
                    minWidth: 160,
                    shadowColor: '#000',
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => { setShowMenu(false); router.push({ pathname: '/' }); }}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="home-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '600' }}>Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setShowMenu(false); router.push({ pathname: '/transactions' }); }}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="list-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '600' }}>Transactions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setShowMenu(false); router.push({ pathname: '/financialgoal' }); }}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="trophy-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '600' }}>Goals</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setShowMenu(false); router.push({ pathname: '/profile' }); }}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="person-circle-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '600' }}>Profile</Text>
                  </TouchableOpacity>
                  <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 }} />
                  <TouchableOpacity
                    onPress={async () => {
                      setShowMenu(false);
                      await logout();
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                    <Text style={{ marginLeft: 8, color: '#ef4444', fontWeight: '700' }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
          } else if (route.name === 'financialgoal') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#059669', // emerald-600
        tabBarInactiveTintColor: '#64748b', // slate-500
        headerShown: true,
        header: () => <AppHeader />,
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
      <Tabs.Screen
        name="financialgoal"
        options={{
          title: 'Goals',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
