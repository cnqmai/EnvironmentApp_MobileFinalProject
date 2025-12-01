import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router"; // THÊM Stack
import { getAllBadges, getMyBadges } from "../../src/services/badgeService";

const { width } = Dimensions.get("window");
const GAP = 15;
const CARD_WIDTH = (width - 40 - GAP) / 2;

const BadgesScreen = () => {
  const router = useRouter();
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [all, mine] = await Promise.all([getAllBadges(), getMyBadges()]);
      setAllBadges(all || []);
      setMyBadges(mine || []);
    } catch (error) {
      console.error("Lỗi tải badge:", error);
    } finally {
      setLoading(false);
    }
  };

  const achievedIds = new Set(myBadges.map(b => b.id));
  const achievedList = myBadges;
  const lockedList = allBadges.filter(b => !achievedIds.has(b.id));

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* FIX: TẮT HEADER MẶC ĐỊNH */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{position: 'absolute', left: 16}}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bộ sưu tập Huy hiệu</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Đã đạt được ({achievedList.length})</Text>
        <View style={styles.gridContainer}>
          {achievedList.length > 0 ? achievedList.map((b) => (
            <View key={b.id} style={styles.badgeAchieved}>
              <MaterialCommunityIcons name="shield-star" size={32} color="#F9A825" style={{ marginBottom: 8 }} />
              <Text style={styles.badgeTitle}>{b.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{b.description}</Text>
            </View>
          )) : (
            <Text style={styles.emptyText}>Chưa có huy hiệu nào.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Chưa mở khóa ({lockedList.length})</Text>
        <View style={styles.gridContainer}>
          {lockedList.map((b) => (
            <View key={b.id} style={styles.badgeLocked}>
              <View style={styles.lockIcon}>
                 <MaterialCommunityIcons name="lock" size={16} color="#BDBDBD" />
              </View>
              <MaterialCommunityIcons name="shield-outline" size={32} color="#BDBDBD" style={{ marginBottom: 8 }} />
              <Text style={styles.badgeTitleLocked}>{b.name}</Text>
              <Text style={styles.descLocked} numberOfLines={2}>{b.criteria || "Tích điểm để mở khóa"}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: '#111' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15, marginTop: 10, color: '#2E7D32' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  badgeAchieved: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFDE7",
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#FFD54F",
    marginBottom: 5,
  },
  badgeTitle: { fontSize: 13, fontWeight: "bold", color: '#333', textAlign: 'center', marginBottom: 4 },
  desc: { fontSize: 11, color: '#555', textAlign: 'center' },
  badgeLocked: {
    width: CARD_WIDTH,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 5,
  },
  lockIcon: { position: 'absolute', top: 8, right: 8 },
  badgeTitleLocked: { fontSize: 13, fontWeight: "bold", color: '#9E9E9E', textAlign: 'center', marginBottom: 4 },
  descLocked: { fontSize: 11, color: '#9E9E9E', textAlign: 'center' },
  emptyText: { fontStyle: 'italic', color: '#666', width: '100%', textAlign: 'center' }
});

export default BadgesScreen;