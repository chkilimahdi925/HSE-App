import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboard from '../screens/admin/AdminDashboard';
import UsersScreen from '../screens/admin/UsersScreen';
import DevicesScreen from '../screens/admin/DevicesScreen';
import SensorsScreen from '../screens/admin/SensorsScreen';
import ZonesScreen from '../screens/admin/ZonesScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import SensorDashboardScreen from '../screens/common/SensorDashboardScreen';
import AlertsDashboardScreen from '../screens/common/AlertsDashboardScreen';

const Stack = createNativeStackNavigator();

const AdminNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
    <Stack.Screen name="Dashboard" component={AdminDashboard} />
    <Stack.Screen name="Users" component={UsersScreen} />
    <Stack.Screen name="Devices" component={DevicesScreen} />
    <Stack.Screen name="Sensors" component={SensorsScreen} />
    <Stack.Screen name="SensorDashboard" component={SensorDashboardScreen} />
    <Stack.Screen name="Zones" component={ZonesScreen} />
    <Stack.Screen name="Alerts" component={AlertsDashboardScreen} />
    <Stack.Screen name="Profile" component={AdminProfileScreen} />
  </Stack.Navigator>
);

export default AdminNavigator;
