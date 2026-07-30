import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    View,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {

  useEffect(() => {

    const timer = setTimeout(() => {
      return router.replace("/home");
    }, 2000);

    return () => clearTimeout(timer);

  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <Image
        source={require("../../assets/images/splash.png")}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#0A4DFF"
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  loader: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },

});