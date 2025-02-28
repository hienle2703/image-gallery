import React from "react";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import GalleryScreen from "../screens/GalleryScreen";
import CameraScreen from "../screens/CameraScreen";
import VideoScreen from "../screens/VideoScreen";

const photoLibrary = require("../../assets/images/photo-library.png");
const camera = require("../../assets/images/camera.png");
const video = require("../../assets/images/video.png");
const more = require("../../assets/images/more.png");

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === "Photos") {
            iconSource = photoLibrary;
          } else if (route.name === "Camera") {
            iconSource = camera;
          } else if (route.name === "Videos") {
            iconSource = video;
          } else if (route.name === "More") {
            iconSource = more;
          }

          return (
            <Image
              source={iconSource}
              resizeMode="contain"
              style={{
                width: 22,
                height: 22,
              }}
              tintColor={focused ? 'white' : "#CBC3C3"}
            />
          );
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ccc",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#AF2E30",
          paddingBottom: 30,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Photos" component={GalleryScreen} headerShown={false} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Videos" component={VideoScreen} />
      <Tab.Screen name="More" component={CameraScreen} />
    </Tab.Navigator>
  );
}
