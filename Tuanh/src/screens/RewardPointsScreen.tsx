import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import EarnItem from "../components/EarnItem";
import HistoryItem from "../components/HistoryItem";

export default function RewardsScreen() {
  const earnMethods = [
    { title: "Phân loại", subtitle: "Mỗi lần", point: "+20", backgroundColor: "#E2F6E8", textColor: "#1AA260" },
    { title: "Upload ảnh", subtitle: "Được duyệt", point: "+30", backgroundColor: "#E4F0FF", textColor: "#3B82F6" },
    { title: "Đăng bài viết", subtitle: "Mỗi bài", point: "+15", backgroundColor: "#F3E7FF", textColor: "#A855F7" },
  ];

  const history = [
    { title: "Phân loại rác hữu cơ", time: "Hôm nay", change: "+20" },
    { title: "Đăng bài viết", time: "Hôm qua", change: "+15" },
    { title: "Bình luận", time: "2 ngày trước", change: "+5" },
    { title: "Đổi voucher Eco Shop", time: "3 ngày trước", change: "-100" },
    { title: "Upload ảnh phân loại", time: "4 ngày trước", change: "+30" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.header}>Điểm thưởng</Text>

      {/* Big green card */}
      <View style={styles.pointsCard}>
        <Text style={styles.whiteText}>Điểm của bạn</Text>
        <Text style={styles.totalPoints}>1,245 điểm</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.whiteText}>Đã kiếm</Text>
            <Text style={styles.boldWhite}>1575</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.whiteText}>Đã dùng</Text>
            <Text style={styles.boldWhite}>330</Text>
          </View>

          <View style={[styles.column, { alignItems: "flex-end" }]}>
            <Text style={styles.whiteText}>Hạng</Text>
            <Text style={styles.boldWhite}>#127</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Cách kiếm điểm</Text>

      {earnMethods.map((item, index) => (
        <EarnItem key={index} {...item} />
      ))}

      <Text style={[styles.title, { marginTop: 20 }]}>Lịch sử điểm</Text>

      {history.map((item, index) => (
        <HistoryItem key={index} {...item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    flex: 1,
  },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 16,
  },

  pointsCard: {
    backgroundColor: "#1AA260",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  whiteText: {
    color: "#fff",
  },

  totalPoints: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  column: {
    flex: 1,
  },

  boldWhite: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
