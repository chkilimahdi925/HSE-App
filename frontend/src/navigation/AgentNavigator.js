import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgentDashboard from '../screens/agent/AgentDashboard';
import SensorDashboardScreen from '../screens/common/SensorDashboardScreen';
import ObservationsScreen from '../screens/agent/ObservationsScreen';
import AlertsDashboardScreen from '../screens/common/AlertsDashboardScreen';
import AgentNotificationsScreen from '../screens/agent/AgentNotificationsScreen';
import AgentProfileScreen from '../screens/agent/AgentProfileScreen';

const Stack = createNativeStackNavigator();

const AgentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
    <Stack.Screen name="Dashboard" component={AgentDashboard} />
    <Stack.Screen name="SensorDashboard" component={SensorDashboardScreen} />
    <Stack.Screen name="Observations" component={ObservationsScreen} />
    <Stack.Screen name="Alerts" component={AlertsDashboardScreen} />
    <Stack.Screen name="Notifications" component={AgentNotificationsScreen} />
    <Stack.Screen name="Profile" component={AgentProfileScreen} />
  </Stack.Navigator>
);

export default AgentNavigator;
