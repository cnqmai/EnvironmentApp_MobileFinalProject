import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const GAP = 15;
const CARD_WIDTH = (width - 40 - GAP) / 2; // 2 cột

const BadgesScreen = () => {
  const achieved = [
    { title: "Chiến binh MH", desc: "Phân loại 100 lần", date: "15/09/2024", icon: "shield-star-outline" },
    { title: "Nghệ sĩ TC", desc: "Chia sẻ 10 ý tưởng", date: "20/09/2024", icon: "palette-outline" },
    { title: "Người truyền CF", desc: "Bài viết 100 like", date: "25/09/2024", icon: "bullhorn-outline" },
  ];

  const notAchieved = [
    { title: "Guru sống xanh", desc: "Phân loại 500 lần", progress: 0.2, icon: "trophy-outline" },
    { title: "Lãnh đạo CD", desc: "Tạo & quản lý nhóm", progress: 0.0, icon: "crown-outline" },
    { title: "Bậc thầy TC", desc: "Tái chế 1000kg", progress: 0.23, icon: "star-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Huy hiệu</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section 1: Đã đạt */}
        <Text style={styles.sectionTitle}>Huy hiệu đã đạt</Text>
        <View style={styles.gridContainer}>
          {achieved.map((b, i) => (
            <View key={i} style={styles.badgeAchieved}>
              <MaterialCommunityIcons name={b.icon} size={32} color="#333" style={{ marginBottom: 8 }} />
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.desc}>{b.desc}</Text>
              <View style={styles.dateTag}>
                <Text style={styles.dateText}>{b.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Section 2: Chưa đạt */}
        <Text style={styles.sectionTitle}>Huy hiệu chưa đạt</Text>
        <View style={styles.gridContainer}>
          {notAchieved.map((b, i) => (
            <View key={i} style={styles.badgeLocked}>
              <View style={styles.lockIcon}>
                 <MaterialCommunityIcons name="lock-outline" size={16} color="#999" />
              </View>
              
              <MaterialCommunityIcons name={b.icon} size={32} color="#999" style={{ marginBottom: 8 }} />
              <Text style={styles.badgeTitleLocked}>{b.title}</Text>
              <Text style={styles.descLocked}>{b.desc}</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(b.progress ?? 0) * 100}%` }]} />
              </View>
              <Text style={styles.percentText}>{Math.round(b.progress * 100)}%</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  scrollContent: { padding: 20 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, marginTop: 10, color: '#333' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },

  // Achieved Styles
  badgeAchieved: {
    width: CARD_WIDTH,
    backgroundColor: "#FFF9C4", // Vàng nhạt
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#FBC02D", // Vàng đậm
    marginBottom: 10,
  },
  badgeTitle: { fontSize: 14, fontWeight: "bold", color: '#333', textAlign: 'center' },
  desc: { fontSize: 12, color: '#555', marginVertical: 4, textAlign: 'center' },
  dateTag: {
    backgroundColor: "#FBC02D",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  dateText: { fontSize: 10, fontWeight: 'bold', color: '#333' },

  // Locked Styles
  badgeLocked: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
    position: 'relative'
  },
  lockIcon: { position: 'absolute', top: 10, right: 10 },
  badgeTitleLocked: { fontSize: 14, fontWeight: "bold", color: '#666', textAlign: 'center' },
  descLocked: { fontSize: 12, color: '#999', marginVertical: 4, textAlign: 'center' },
  
  progressBar: {
    height: 6,
    width: "80%",
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginTop: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#000",
    borderRadius: 3,
  },
  percentText: { fontSize: 10, color: '#999', marginTop: 4 },
});

export default BadgesScreen;