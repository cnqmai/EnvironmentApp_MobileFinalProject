import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { getCollectionPoints } from '../../src/services/mapService'; // Import API


// --- HÀM DỊCH ENUM SANG TIẾNG VIỆT (Dùng cho tìm kiếm và hiển thị) ---
const translatePointType = (type) => {
    if (!type) return 'Không rõ';
    switch (type.toUpperCase()) {
        case 'PLASTIC': return 'Rác thải nhựa';
        case 'ELECTRONIC': return 'Rác điện tử';
        case 'ORGANIC': return 'Rác hữu cơ';
        case 'METAL': return 'Rác kim loại';
        case 'GLASS': return 'Rác thủy tinh';
        case 'PAPER': return 'Rác giấy';
        case 'HAZARDOUS': return 'Rác nguy hại';
        case 'MEDICAL': return 'Rác y tế';
        case 'CONSTRUCTION': return 'Rác xây dựng';
        default: return 'Tất cả loại rác';
    }
};

const CollectionPointsScreen = () => {
    const router = useRouter();
    const [locations, setLocations] = useState([]); // Chứa dữ liệu API gốc
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State cho ô tìm kiếm
    const [isSearching, setIsSearching] = useState(false); // Dùng cho trạng thái loading

    // 1. Logic lấy vị trí GPS và Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        let userLat = 0;
        let userLon = 0;

        // Lấy vị trí GPS hiện tại
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Lỗi", "Cần quyền truy cập vị trí để tìm điểm thu gom.");
                setLoading(false);
                return;
            }
            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Medium });
            userLat = location.coords.latitude;
            userLon = location.coords.longitude;
            setCurrentLocation(location.coords);
        } catch (error) {
            console.error("GPS Error:", error);
            userLat = 10.762622; 
            userLon = 106.660172;
            Alert.alert("Thông báo", "Không thể lấy GPS, đang tìm kiếm khu vực mặc định.");
        }

        // Gọi API Backend (Lấy tất cả điểm)
        try {
            // Lấy tất cả điểm gần vị trí user (loại bỏ filter type vì đã xóa màn hình filter)
            const data = await getCollectionPoints(userLat, userLon, 'ALL');
            setLocations(data);
        } catch (error) {
            console.error("Fetch Points Error:", error);
            Alert.alert("Lỗi tải", "Không thể tải danh sách điểm thu gom.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch khi màn hình được focus lần đầu
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    
    // --- LOGIC LỌC DỮ LIỆU TRÊN FRONTEND (MỚI) ---
    const filteredLocations = locations.filter(loc => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        
        // Tạo chuỗi tìm kiếm tổng hợp: Tên + Địa chỉ + Loại rác (tiếng Việt)
        const locTypeVietnamese = translatePointType(loc.type);
        const searchPool = `${loc.name} ${loc.address} ${locTypeVietnamese}`.toLowerCase();
        
        return searchPool.includes(searchLower);
    });

    const handleSearchSubmit = () => {
        Keyboard.dismiss(); // Ẩn bàn phím khi bấm tìm kiếm
        // Không cần gọi API, chỉ cần state searchTerm thay đổi là filteredLocations tự động cập nhật
    };

    // Hàm render từng điểm thu gom
    const renderLocationCard = (loc) => {
        // Kiểm tra và format khoảng cách
        const distanceText = loc.distanceKm != null ? `${loc.distanceKm.toFixed(1)} km` : 'N/A';
        
        return (
            <View key={loc.id} style={styles.card}>
                {/* Top Row: Icon + Name + Distance */}
                <View style={styles.cardTop}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="map-marker-outline" size={28} color="#00C853" />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.locName}>{loc.name}</Text>
                        <Text style={styles.locAddress}>{loc.address}</Text>
                    </View>
                    <View style={styles.distBadge}>
                        <Text style={styles.distText}>{distanceText}</Text>
                    </View>
                </View>

                {/* Tag */}
                <View style={styles.tagWrapper}>
                    <Text style={styles.tagText}>{translatePointType(loc.type)}</Text>
                </View>

                {/* Details */}
                <View style={styles.details}>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="phone-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>{loc.phoneNumber || 'Đang cập nhật'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="clock-time-four-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>{loc.openingHours || 'Không rõ giờ mở cửa'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="star-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>4.5/5</Text>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.btnBlack}>
                        <Text style={styles.btnBlackText}>Chỉ đường</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnOutline}>
                        <Text style={styles.btnOutlineText}>Gọi điện</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header Title with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Điểm thu gom gần bạn</Text>
            </View>

            {/* Search Bar (ĐÃ TÍCH HỢP TÌM KIẾM TRỰC TIẾP) */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Tìm kiếm tên, địa chỉ hoặc loại rác..."
                        placeholderTextColor="#999"
                        onChangeText={setSearchTerm} // Bắt sự thay đổi giá trị
                        value={searchTerm}
                        onSubmitEditing={handleSearchSubmit} // Bấm Enter để lọc
                    />
                </View>
                
                {/* NÚT LỌC VÀ NÚT VỊ TRÍ ĐÃ BỊ XÓA */}
                <TouchableOpacity style={styles.iconBtn} onPress={handleSearchSubmit}> 
                    <MaterialCommunityIcons name="magnify" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.loadingView}>
                    <ActivityIndicator size="large" color="#00C853" />
                    <Text style={styles.loadingText}>Đang tìm kiếm các điểm thu gom...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {/* Sử dụng danh sách đã lọc */}
                    {filteredLocations.length > 0 ? (
                        filteredLocations.map(renderLocationCard)
                    ) : (
                        <Text style={styles.emptyText}>Không tìm thấy điểm thu gom nào gần bạn.</Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },

    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 10, 
        paddingBottom: 10 
    }, 
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', flex: 1 },
    
    searchContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, height: 44 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    iconBtn: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center' },

    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#F0F0F0',
        elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
    iconContainer: { marginRight: 12, marginTop: 4 },
    infoContainer: { flex: 1 },
    locName: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 4 },
    locAddress: { fontSize: 14, color: '#666' },
    distBadge: { backgroundColor: '#E0F2F1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    distText: { color: '#00C853', fontSize: 12, fontWeight: 'bold' },

    tagWrapper: { alignSelf: 'flex-start', marginLeft: 40, marginTop: 8, borderWidth: 1, borderColor: '#EEE', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
    tagText: { fontSize: 12, color: '#333' },

    details: { marginLeft: 40, marginTop: 12, gap: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailText: { fontSize: 15, color: '#555' },

    btnRow: { flexDirection: 'row', marginTop: 20, gap: 12 },
    btnBlack: { flex: 1, backgroundColor: '#0A0A0A', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    btnBlackText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
    btnOutline: { flex: 1, backgroundColor: '#FFF', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    btnOutlineText: { color: '#0A0A0A', fontWeight: '600', fontSize: 16 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' }
});

export default CollectionPointsScreen;