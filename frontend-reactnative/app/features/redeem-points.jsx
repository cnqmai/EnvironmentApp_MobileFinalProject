import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const GAP = 12;
const ITEM_WIDTH = (width - 40 - GAP) / 2; // 40 là tổng padding trái phải

const RedeemPoints = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const filters = ["Tất cả", "Voucher", "Quà tặng"];

  const gifts = [
    { id: 1, type: "Voucher", name: "Voucher Eco 50k", left: 45, point: 100, icon: "ticket-percent-outline" },
    { id: 2, type: "Quà tặng", name: "Túi vải TC", left: 23, point: 200, icon: "shopping-outline" },
    { id: 3, type: "Quà tặng", name: "Bình nước inox", left: 12, point: 350, icon: "water-outline" },
    { id: 4, type: "Voucher", name: "Voucher Coffee 30k", left: 67, point: 80, icon: "coffee-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đổi quà</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Điểm */}
        <View style={styles.pointCard}>
          <View>
            <Text style={styles.pointLabel}>Điểm hiện tại</Text>
            <Text style={styles.pointValue}>1,245</Text>
            <Text style={styles.pointUnit}>điểm</Text>
          </View>
          <MaterialCommunityIcons name="gift-outline" size={60} color="rgba(255,255,255,0.8)" />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {filters.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, activeTab === tab && styles.filterChipActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.filterText, activeTab === tab && styles.filterTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid Gifts */}
        <View style={styles.gridContainer}>
          {gifts.map((gift, i) => (
            <View key={i} style={styles.giftCard}>
              {/* Ảnh placeholder */}
              <View style={styles.giftImagePlaceholder}>
                <MaterialCommunityIcons name={gift.icon} size={32} color="#333" />
              </View>
              
              <View style={styles.giftContent}>
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{gift.type}</Text>
                </View>
                
                <Text style={styles.giftName} numberOfLines={2}>{gift.name}</Text>
                <Text style={styles.leftText}>Còn {gift.left}</Text>
                
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Giá:</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <MaterialCommunityIcons name="star-outline" size={14} color="#00C853" style={{marginRight: 2}}/>
                        <Text style={styles.priceValue}>{gift.point}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.redeemButton}>
                  <Text style={styles.redeemButtonText}>Đổi ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: { padding: 16, alignItems: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  
  scrollContent: { padding: 20 },

  // Point Card
  pointCard: {
    backgroundColor: "#E040FB", // Màu hồng tím
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#E040FB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pointLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  pointValue: { color: "#fff", fontSize: 32, fontWeight: "bold", lineHeight: 38 },
  pointUnit: { color: "#fff", fontSize: 14 },

  // Filters
  filterContainer: { flexDirection: 'row', marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  filterChipActive: { borderColor: "#E0E0E0", backgroundColor: "#fff" }, // Có thể đổi màu nếu muốn active rõ hơn
  filterText: { fontSize: 13, color: "#333" },
  filterTextActive: { fontWeight: "600", color: "#000" },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  giftCard: {
    width: ITEM_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: 'hidden',
    marginBottom: 10,
  },
  giftImagePlaceholder: {
    height: 120,
    backgroundColor: "#F5F5F5",
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftContent: { padding: 12 },
  tagContainer: { 
    borderWidth: 1, borderColor: '#EEE', borderRadius: 12, 
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 
  },
  tagText: { fontSize: 10, color: '#666' },
  giftName: { fontSize: 14, fontWeight: "600", marginBottom: 4, height: 40 },
  leftText: { fontSize: 12, color: "#999", marginBottom: 8 },
  
  priceRow: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: '#F9F9F9', padding: 6, borderRadius: 6, marginBottom: 10
  },
  priceLabel: { fontSize: 12, color: '#666' },
  priceValue: { fontSize: 14, fontWeight: 'bold', color: '#00C853' },

  redeemButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});

export default RedeemPoints;