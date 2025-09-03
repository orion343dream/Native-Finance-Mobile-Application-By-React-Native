
import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import Summary from '../../components/dashboard/Summary';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import SpendingAnalysis from '../../components/dashboard/SpendingAnalysis';
import { useAuth } from '../../src/auth/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
                <Text style={styles.subGreeting}>Welcome to your financial hub.</Text>
            </View>
            <TouchableOpacity onPress={logout}>
                <Ionicons name="log-out-outline" size={28} color="#ef4444" />
            </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-transaction')}>
            <Ionicons name="add-circle" size={22} color="white" />
            <Text style={styles.addButtonText}>Add New Transaction</Text>
        </TouchableOpacity>

        <Summary />
        <SpendingAnalysis />
        <RecentTransactions />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f1f5f9' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: 'white' 
  },
  greeting: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  subGreeting: { 
    fontSize: 16, 
    color: '#64748b' 
  },
   addButton: { 
    flexDirection: 'row', 
    backgroundColor: '#059669', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginHorizontal: 16, 
    marginVertical: 16 
  },
  addButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
});
