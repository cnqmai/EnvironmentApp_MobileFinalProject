import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getAllRewards, redeemReward } from '../../src/services/rewardService'; //
import { getMyStatistics } from '../../src/services/userService'; //

const RedeemPointsScreen = () => {
    const [rewards, setRewards] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const rewardsData = await getAllRewards(); // Lấy danh sách quà
            const statsData = await getMyStatistics(); // Lấy thống kê điểm user
            
            setRewards(rewardsData);
            setUserPoints(statsData.totalPoints || 0); // Giả sử API trả về field totalPoints
        } catch (error) {
            console.error("Lỗi tải dữ liệu đổi quà:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward) => {
        if (userPoints < reward.pointsRequired) {
            Alert.alert("Không đủ điểm", "Bạn cần tích thêm điểm để đổi quà này.");
            return;
        }

        Alert.alert(
            "Xác nhận đổi quà",
            `Bạn muốn dùng ${reward.pointsRequired} điểm để đổi "${reward.name}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        try {
                            await redeemReward(reward.id); // Gọi API đổi quà
                            Alert.alert("Thành công", "Đổi quà thành công! Kiểm tra trong 'Quà của tôi'.");
                            loadData(); // Tải lại điểm số mới
                        } catch (error) {
                            Alert.alert("Lỗi", "Đổi quà thất bại. Vui lòng thử lại.");
                        }
                    }
                }
            ]
        );
    };

    const renderRewardItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardPoints}>{item.pointsRequired} Điểm</Text>
                <TouchableOpacity 
                    style={[styles.redeemBtn, userPoints < item.pointsRequired && styles.disabledBtn]}
                    onPress={() => handleRedeem(item)}
                    disabled={userPoints < item.pointsRequired}
                >
                    <Text style={styles.redeemText}>
                        {userPoints < item.pointsRequired ? 'Thiếu điểm' : 'Đổi ngay'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

    return (
        <View style={styles.container}>
            {/* Header hiển thị điểm */}
            <View style={styles.pointHeader}>
                <Text style={styles.pointLabel}>Điểm của bạn</Text>
                <Text style={styles.pointValue}>{userPoints} 🍀</Text>
            </View>

            <Text style={styles.sectionTitle}>Danh sách quà tặng</Text>
            <FlatList
                data={rewards}
                renderItem={renderRewardItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2} // Hiển thị dạng lưới 2 cột
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pointHeader: { backgroundColor: '#4CAF50', padding: 24, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    pointLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    pointValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 16, marginBottom: 8 },
    list: { paddingHorizontal: 8, paddingBottom: 20 },
    row: { justifyContent: 'space-between' },
    card: { backgroundColor: '#fff', width: '48%', borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 3 },
    cardImage: { width: '100%', height: 120 },
    cardContent: { padding: 10 },
    cardTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, height: 40 }, // Giới hạn chiều cao tiêu đề
    cardPoints: { fontSize: 14, color: '#FF9800', fontWeight: 'bold', marginBottom: 8 },
    redeemBtn: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 6, alignItems: 'center' },
    disabledBtn: { backgroundColor: '#ccc' },
    redeemText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});

export default RedeemPointsScreen;