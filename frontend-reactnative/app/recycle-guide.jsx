import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import typography from "../styles/typography";

const RecycleGuideScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (params.data) {
      try {
        const parsed = JSON.parse(params.data);
        setData(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, [params.data]); // Chỉ chạy khi params.data thay đổi

  if (!data) return null;

  // Map màu sắc theo loại rác trả về từ AI
  const getStyle = (type) => {
    switch (type) {
        case "ORGANIC": return { color: "#2E7D32", bg: "#E8F5E9" };
        case "PLASTIC": return { color: "#1976D2", bg: "#E3F2FD" };
        case "ELECTRONIC": return { color: "#512DA8", bg: "#EDE7F6" };
        case "PAPER": return { color: "#795548", bg: "#EFEBE9" };
        case "METAL": return { color: "#607D8B", bg: "#ECEFF1" };
        case "GLASS": return { color: "#0097A7", bg: "#E0F7FA" };
        case "HAZARDOUS": return { color: "#F57C00", bg: "#FFF3E0" };
        default: return { color: "#757575", bg: "#F5F5F5" };
    }
  };

  const style = getStyle(data.collectionPointType);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0A0A0A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Kết quả phân loại</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Kết quả chính */}
        <View style={[styles.resultCard, { backgroundColor: style.bg }]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check" size={32} color={style.color} />
          </View>
          <Text style={styles.title}>{data.name}</Text>
          <Text style={styles.subtitle}>{data.description}</Text>
        </View>

        {/* Hướng dẫn */}
        <Text style={styles.sectionHeader}>Hướng dẫn xử lý</Text>
        <View style={styles.infoCard}>
            <Text style={styles.bodyText}>{data.disposalGuideline}</Text>
        </View>

        <Text style={styles.sectionHeader}>Khả năng tái chế</Text>
        <View style={styles.infoCard}>
            <Text style={styles.bodyText}>{data.recyclingGuideline}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFED" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", elevation: 2 },
  resultCard: { margin: 24, padding: 24, borderRadius: 16, alignItems: "center", elevation: 2 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { ...typography.h2, fontSize: 24, fontWeight: "700", textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#666", textAlign: 'center' },
  sectionHeader: { fontSize: 18, fontWeight: "700", marginHorizontal: 24, marginTop: 16, marginBottom: 8 },
  infoCard: { backgroundColor: "#FFF", marginHorizontal: 24, padding: 16, borderRadius: 12 },
  bodyText: { fontSize: 15, lineHeight: 22, color: "#333" }
});

export default RecycleGuideScreen;