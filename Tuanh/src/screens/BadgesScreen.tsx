import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function BadgesScreen() {
  const achieved = [
    { title: "Chiến binh MH", desc: "Phân loại 100 lần", date: "15/09/2024" },
    { title: "Nghệ sĩ TC", desc: "Chia sẻ 10 ý tưởng", date: "20/09/2024" },
    { title: "Người truyền CF", desc: "Bài viết 100 like", date: "25/09/2024" },
  ];

  const notAchieved = [
    { title: "Guru sống xanh", desc: "Phân loại 500 lần", progress: 0.2 },
    { title: "Lãnh đạo CD", desc: "Tạo & quản lý nhóm", progress: 0.0 },
    { title: "Bậc thầy TC", desc: "Tái chế 1000kg", progress: 0.23 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Huy hiệu</Text>

      <Text style={styles.sectionTitle}>Huy hiệu đã đạt</Text>

      {achieved.map((b, i) => (
        <View key={i} style={styles.badgeAchieved}>
          <MaterialIcons name="emoji-events" size={26} color="#f4b400" />
          <Text style={styles.badgeTitle}>{b.title}</Text>
          <Text style={styles.desc}>{b.desc}</Text>

          <View style={styles.dateTag}>
            <Text style={styles.dateText}>{b.date}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Huy hiệu chưa đạt</Text>

      {notAchieved.map((b, i) => (
        <View key={i} style={styles.badgeLocked}>
          <MaterialIcons name="lock-outline" size={22} color="#999" />
          <Text style={styles.badgeTitle}>{b.title}</Text>
          <Text style={styles.desc}>{b.desc}</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(b.progress ?? 0) * 100}%` }]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },

  badgeAchieved: {
    backgroundColor: "#fff7d1",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  badgeLocked: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  badgeTitle: { fontSize: 16, fontWeight: "bold", marginTop: 3 },
  desc: { marginTop: 3 },

  dateTag: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#ffe27a",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  dateText: { fontSize: 12 },

  progressBar: {
    height: 8,
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginTop: 10,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#19c47b",
    borderRadius: 5,
  },
});
