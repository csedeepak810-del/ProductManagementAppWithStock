import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({
  value,
  onChangeText,
}: SearchBarProps) {

  return (

    <View style={styles.container}>

      {/* Search Icon */}
      <Ionicons
        name="search"
        size={22}
        color="#666"
      />

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder="Search Products..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
      />

      {/* Filter Icon */}
      <TouchableOpacity>

        <Ionicons
          name="options-outline"
          size={22}
          color="#0A4DFF"
        />

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#fff",

    marginHorizontal: 16,

    marginTop: 18,

    paddingHorizontal: 15,

    height: 56,

    borderRadius: 15,

    elevation: 3,

    shadowColor: "#000",

    shadowOpacity: 0.1,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowRadius: 4,

  },

  input: {

    flex: 1,

    marginHorizontal: 10,

    fontSize: 16,

    color: "#222",

  },

});