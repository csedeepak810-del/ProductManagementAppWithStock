import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { items } from "../data/items";
import { Item } from "../types/item";

type Props = {
  item: Item;
  onPress?: () => void;
};

export default function ItemCard({ item, onPress }: Props) {
  // Calculate status automatically
  const getStatus = () => {
    if (item.stock === 0) {
      return {
        text: "Out of Stock",
        color: "#E53935",
        bg: "#FFEBEE",
        dot: "#D32F2F",
      };
    }
    if (item.stock <= 10) {
      return {
        text: "Low Stock",
        color: "#EF6C00",
        bg: "#FFF3E0",
        dot: "#F57C00",
      };
    }
    return {
      text: "In Stock",
      color: "#2E7D32",
      bg: "#E8F5E9",
      dot: "#388E3C",
    };
  };

  const status = getStatus();

  // Count sub-parts/child items
  const childPartsCount = items.filter((i) => i.parentId === item.id).length;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.card}
      onPress={onPress}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.iconAndTitle}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name={(item.icon as any) || "cube-outline"}
              size={24}
              color="#0A4DFF"
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <View style={[styles.dot, { backgroundColor: status.dot }]} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bottom Info Row */}
      <View style={styles.bottomRow}>
        <View style={styles.stockBox}>
          <Text style={styles.stockLabel}>Stock</Text>
          <Text style={styles.stockValue}>
            {item.stock} <Text style={styles.unitText}>{item.unit}</Text>
          </Text>
        </View>

        {/* Parts Count Badge if parts exist */}
        {childPartsCount > 0 && (
          <View style={styles.partsBadge}>
            <Ionicons name="cog" size={14} color="#0A4DFF" />
            <Text style={styles.partsBadgeText}>{childPartsCount} Parts</Text>
          </View>
        )}

        <View style={styles.arrowBox}>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAEFF5",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  titleContainer: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  category: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stockBox: {
    flexDirection: "column",
  },

  stockLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  stockValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },

  unitText: {
    fontSize: 13,
    color: "#0A4DFF",
    fontWeight: "700",
  },

  partsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  partsBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
    marginLeft: 4,
  },

  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
});