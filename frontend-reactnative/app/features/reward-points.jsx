import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const RewardsScreen = () => {
  const earnMethods = [
    { title: "Phân loại", subtitle: "Mỗi lần", point: "+20", icon: "recycle", bg: "#E8F5E9", col: "#1AA260" },
    { title: "Upload ảnh", subtitle: "Được duyệt", point: "+30", icon: "cloud-upload", bg: "#E3F2FD", col: "#1976D2" },
    { title: "Đăng bài viết", subtitle: "Mỗi bài", point: "+15", icon: "pencil", bg: "#F3E5F5", col: "#7B1FA2" },
  ];

  const history = [
    { title: "Phân loại rác hữu cơ", time: "Hôm nay", change: "+20", isPositive: true },
    { title: "Đăng bài viết", time: "Hôm qua", change: "+15", isPositive: true },
    { title: "Bình luận", time: "2 ngày trước", change: "+5", isPositive: true },
    { title: "Đổi voucher Eco Shop", time: "3 ngày trước", change: "-100", isPositive: false },
    { title: "Upload ảnh phân loại", time: "4 ngày trước", change: "+30", isPositive: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Điểm thưởng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Big Green Card */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardLabel}>Điểm của bạn</Text>
          <Text style={styles.totalPoints}>1,245 <Text style={{fontSize: 16, fontWeight: 'normal'}}>điểm</Text></Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Đã kiếm</Text>
              <Text style={styles.statValue}>1,575</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Đã dùng</Text>
              <Text style={styles.statValue}>330</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Hạng</Text>
              <Text style={styles.statValue}>#127</Text>
            </View>
          </View>
        </View>

        {/* Section: Cách kiếm điểm */}
        <Text style={styles.sectionTitle}>Cách kiếm điểm</Text>
        <View style={styles.methodsContainer}>
          {earnMethods.map((item, index) => (
            <View key={index} style={[styles.methodItem, { backgroundColor: item.bg }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#fff' }]}>
                 <MaterialCommunityIcons name={item.icon} size={20} color={item.col} />
              </View>
              <View style={styles.methodInfo}>
                 <Text style={styles.methodTitle}>{item.title}</Text>
                 <Text style={styles.methodSub}>{item.subtitle}</Text>
              </View>
              <View style={[styles.pointBadge, { backgroundColor: item.col }]}>
                 <Text style={styles.pointBadgeText}>{item.point}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Section: Lịch sử điểm */}
        <Text style={styles.sectionTitle}>Lịch sử điểm</Text>
        <View style={styles.historyList}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={{flex: 1}}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyTime}>{item.time}</Text>
              </View>
              <Text style={[
                  styles.historyChange, 
                  { color: item.isPositive ? "#00C853" : "#D50000" }
              ]}>
                {item.change}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { padding: 16, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  scrollContent: { padding: 20 },

  // Green Card
  cardContainer: {
    backgroundColor: "#00C853",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    // Hiệu ứng đổ bóng nhẹ
    elevation: 5, shadowColor: "#00C853", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  cardLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  totalPoints: { color: "#fff", fontSize: 32, fontWeight: "bold", marginVertical: 8 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 },
  statValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  divider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", height: '80%' },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: '#333' },

  // Earn Methods
  methodsContainer: { marginBottom: 24 },
  methodItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 16, marginBottom: 10,
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  methodInfo: { flex: 1 },
  methodTitle: { fontSize: 14, fontWeight: "600", color: '#333' },
  methodSub: { fontSize: 12, color: '#666' },
  pointBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pointBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // History
  historyList: { backgroundColor: '#fff' },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5'
  },
  historyTitle: { fontSize: 14, fontWeight: "500", color: '#333', marginBottom: 2 },
  historyTime: { fontSize: 12, color: '#999' },
  historyChange: { fontSize: 16, fontWeight: "600" },
});

export default RewardsScreen;