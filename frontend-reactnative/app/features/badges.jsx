<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { getAllBadges, getMyBadges } from '../../src/services/badgeService'; //

const BadgesScreen = () => {
    const [allBadges, setAllBadges] = useState([]);
    const [myBadges, setMyBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Gọi song song cả 2 API để tối ưu thời gian
            const [badgesData, myBadgesData] = await Promise.all([
                getAllBadges(), // Lấy toàn bộ danh sách huy hiệu
                getMyBadges()   // Lấy danh sách huy hiệu user đã đạt
            ]);
            setAllBadges(badgesData);
            setMyBadges(myBadgesData);
        } catch (error) {
            console.error("Lỗi tải badge:", error);
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra xem user có badge này chưa
    const isUnlocked = (badgeId) => {
        return myBadges.some(userBadge => userBadge.badge.id === badgeId);
    };

    const renderItem = ({ item }) => {
        const unlocked = isUnlocked(item.id);
        return (
            <View style={[styles.badgeItem, !unlocked && styles.lockedItem]}>
                <Image 
                    source={{ uri: item.iconUrl || 'https://via.placeholder.com/100' }} 
                    style={[styles.badgeIcon, !unlocked && { opacity: 0.3 }]} // Làm mờ nếu chưa đạt
                />
                <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{item.name}</Text>
                    <Text style={styles.badgeDesc}>{item.description}</Text>
                    {unlocked ? (
                        <Text style={styles.unlockedText}>Đã đạt được 🎉</Text>
                    ) : (
                        <Text style={styles.lockedText}>Chưa mở khóa</Text>
                    )}
                </View>
            </View>
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Bộ sưu tập Huy hiệu</Text>
            <FlatList
                data={allBadges}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
    list: { paddingBottom: 20 },
    badgeItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2 },
    lockedItem: { backgroundColor: '#eee' }, // Nền xám cho badge chưa đạt
    badgeIcon: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
    badgeInfo: { flex: 1 },
    badgeName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    badgeDesc: { fontSize: 12, color: '#666', marginTop: 4 },
    unlockedText: { fontSize: 12, color: '#4CAF50', fontWeight: 'bold', marginTop: 4 },
    lockedText: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 4 },
});

export default BadgesScreen;
=======
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const BadgesScreen = () => {
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
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
    </SafeAreaView>
  );
};

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

export default BadgesScreen;
>>>>>>> test-merge
