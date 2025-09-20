
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import AnalysisScreen from '../screens/AnalysisScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Analysis: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Analysis') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transactions' }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ title: 'Goals' }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
