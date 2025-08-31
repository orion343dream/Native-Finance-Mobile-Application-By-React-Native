
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AnalysisScreen from '../screens/AnalysisScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Analysis: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
