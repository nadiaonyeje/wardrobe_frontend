import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import TabNavigator from "./navigation/TabNavigator";
import ItemDetailsScreen from "./screens/ItemDetailsScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="ItemDetails"
            component={ItemDetailsScreen}
            options={({ navigation }) => ({
              headerShown: true,
              headerTitle: "",
              headerStyle: { backgroundColor: "#000" },
              headerTintColor: "#fff",
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ flexDirection: "row", alignItems: "center", marginLeft: 15 }}
                >
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 16 }}>Back</Text>
                </TouchableOpacity>
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}