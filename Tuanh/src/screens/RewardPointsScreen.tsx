import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

interface RewardRule {
  name: string;
  point: string;
}

interface HistoryItem {
  text: string;
  point: string;
}

export default function RewardPointsScreen() {
  const rules: RewardRule[] = [
    { name: "Phân loại", point: "+20" },
    { name: "Upload ảnh được duyệt", point: "+30" },
    { name: "Đăng bài viết", point: "+15" },
  ];

  const history: HistoryItem[] = [
    { text: "Phân loại rác hữu cơ", point: "+20" },
    { text: "Viết bài", point: "+15" },
    { text: "Bình luận", point: "+5" },
    { text: "Đổi voucher Eco Shop", point: "-100" },
    { text: "Upload ảnh phân loại", point: "+30" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Điểm thưởng</Text>

      <View style={styles.pointCard}>
        <Text style={styles.pointLabel}>Điểm của bạn</Text>
        <Text style={styles.pointValue}>1,245 điểm</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.subLabel}>Đã tích</Text>
            <Text style={styles.subValue}>1575</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.subLabel}>Đã dùng</Text>
            <Text style={styles.subValue}>330</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.subLabel}>Hạng</Text>
            <Text style={styles.subValue}>#127</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Cách kiếm điểm</Text>
      {rules.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text>{item.name}</Text>
          <Text style={styles.plus}>{item.point}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Lịch sử điểm</Text>
      {history.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text>{item.text}</Text>
          <Text style={{ color: item.point.startsWith("-") ? "red" : "green" }}>
            {item.point}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  pointCard: {
    backgroundColor: "#14c98f",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  pointLabel: { color: "#fff" },
  pointValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 5,
  },
  row: { flexDirection: "row", marginTop: 15 },
  col: { flex: 1 },
  subLabel: { color: "#fff" },
  subValue: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 5,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  plus: { color: "#19c47b", fontWeight: "bold" },
});
