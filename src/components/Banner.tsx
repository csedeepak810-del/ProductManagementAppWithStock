import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const banners = [
  require("../../assets/images/banner1.png"),
  require("../../assets/images/banner2.png"),
  require("../../assets/images/banner3.png"),
];

export default function Banner() {

  const flatListRef = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {

    const interval = setInterval(() => {

      let next = currentIndex + 1;

      if (next >= banners.length) {
        next = 0;
      }

      flatListRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });

      setCurrentIndex(next);

    }, 3000);

    return () => clearInterval(interval);

  }, [currentIndex]);

  return (

    <View style={styles.container}>

      <FlatList

        ref={flatListRef}

        data={banners}

        horizontal

        pagingEnabled

        showsHorizontalScrollIndicator={false}

        keyExtractor={(_, index) => index.toString()}

        renderItem={({ item }) => (

          <Image

            source={item}

            style={styles.banner}

            resizeMode="cover"

          />

        )}

      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    marginTop:15,

  },

  banner: {

    width: width-30,

    height:180,

    marginHorizontal:15,

    borderRadius:18,

  },

});