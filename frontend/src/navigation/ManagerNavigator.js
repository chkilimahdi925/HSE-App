import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ManagerDashboard from '../screens/manager/ManagerDashboard';
import SensorDashboardScreen from '../screens/common/SensorDashboardScreen';
import IncidentsScreen from '../screens/manager/IncidentsScreen';
import AuditsScreen from '../screens/manager/AuditsScreen';
import TrainingsScreen from '../screens/manager/TrainingsScreen';
import ManagerProfileScreen from '../screens/manager/ManagerProfileScreen';
import AlertsDashboardScreen from '../screens/common/AlertsDashboardScreen';

const Stack = createNativeStackNavigator();

const ManagerNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
    <Stack.Screen name="Dashboard" component={ManagerDashboard} />
    <Stack.Screen name="SensorDashboard" component={SensorDashboardScreen} />
    <Stack.Screen name="Incidents" component={IncidentsScreen} />
    <Stack.Screen name="Audits" component={AuditsScreen} />
    <Stack.Screen name="Trainings" component={TrainingsScreen} />
    <Stack.Screen name="Alerts" component={AlertsDashboardScreen} />
    <Stack.Screen name="Profile" component={ManagerProfileScreen} />
  </Stack.Navigator>
);

export default ManagerNavigator;
