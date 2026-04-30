import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import AgentNavigator from './AgentNavigator';
import ManagerNavigator from './ManagerNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getNavigatorByRole = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':   return <Stack.Screen name="AdminRoot" component={AdminNavigator} />;
      case 'manager': return <Stack.Screen name="ManagerRoot" component={ManagerNavigator} />;
      case 'agent':   return <Stack.Screen name="AgentRoot" component={AgentNavigator} />;
      default:        return null;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          getNavigatorByRole()
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;
