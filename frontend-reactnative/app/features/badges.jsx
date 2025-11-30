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