import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type Props = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export default function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.category,
            selectedCategory === item && styles.selectedCategory,
          ]}
          onPress={() => onSelectCategory(item)}
        >
          <Text
            style={[
              styles.text,
              selectedCategory === item && styles.selectedText,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  category: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D8D8D8",
  },

  selectedCategory: {
    backgroundColor: "#0A4DFF",
    borderColor: "#0A4DFF",
  },

  text: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },

  selectedText: {
    color: "#FFF",
  },
});