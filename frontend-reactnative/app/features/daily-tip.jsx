import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  Modal, 
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { getRandomTip, completeTip } from '../../src/services/dailyTipService';
import { getMyProfile } from '../../src/services/userService';

// Helper: Tạo key lưu trạng thái Daily Tips theo user ID và ngày
const getCompletedTipsKey = (userId) => `COMPLETED_DAILY_TIPS_${userId}_DAILY`;

const DailyTipScreen = () => {
  const router = useRouter();
  const [tips, setTips] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null); // User ID hiện tại
  
  // State lưu các ID đã hoàn thành
  const [completedTips, setCompletedTips] = useState(new Set());

  // --- Animation States ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(10);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initData = async () => {
        setLoading(true);
        // Lấy user ID trước
        await loadCurrentUser();
        await loadTips();
        setLoading(false);
    };
    initData();
  }, []);

  // Load user ID hiện tại
  const loadCurrentUser = async () => {
    try {
      const profile = await getMyProfile();
      if (profile && profile.id) {
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
      // Nếu không lấy được user, vẫn cho phép xem tips (nhưng không lưu trạng thái)
    }
  };

  // Load trạng thái khi có user ID
  useEffect(() => {
    if (currentUserId) {
      checkAndLoadDailyStatus();
    } else {
      setCompletedTips(new Set());
    }
  }, [currentUserId]);

  // Hàm lấy ngày hiện tại định dạng YYYY-MM-DD
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // [LOGIC MỚI] Kiểm tra và Reset mỗi ngày theo user ID
  const checkAndLoadDailyStatus = async () => {
    if (!currentUserId) {
      // Nếu chưa có user ID, không load trạng thái
      setCompletedTips(new Set());
      // Xóa key cũ (không có user ID) nếu có
      try {
        await AsyncStorage.removeItem('COMPLETED_DAILY_TIPS_V2');
        await AsyncStorage.removeItem('COMPLETED_DAILY_TIPS');
      } catch (e) {
        // Ignore
      }
      return;
    }

    try {
      // Xóa key cũ (không có user ID) nếu có
      try {
        await AsyncStorage.removeItem('COMPLETED_DAILY_TIPS_V2');
        await AsyncStorage.removeItem('COMPLETED_DAILY_TIPS');
      } catch (e) {
        // Ignore
      }

      const storageKey = getCompletedTipsKey(currentUserId);
      const jsonValue = await AsyncStorage.getItem(storageKey);
      const today = getTodayString();

      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        
        // Kiểm tra xem dữ liệu có phải của hôm nay và đúng user không
        if (data.date === today && data.userId === currentUserId) {
            // Nếu đúng hôm nay và đúng user -> Load danh sách đã làm
            setCompletedTips(new Set(data.ids));
        } else {
            // Nếu là ngày cũ hoặc user khác -> Reset (ngày mới bắt đầu!)
            console.log("Ngày mới hoặc user khác! Reset trạng thái Daily Tips.");
            await AsyncStorage.removeItem(storageKey);
            setCompletedTips(new Set());
        }
      } else {
        setCompletedTips(new Set());
      }
    } catch(e) {
      console.error("Lỗi đọc trạng thái:", e);
      setCompletedTips(new Set());
    }
  };

  const loadTips = async () => {
    try {
        const [t1, t2] = await Promise.all([
            getRandomTip().catch(() => null),
            getRandomTip().catch(() => null)
        ]);
        
        const rawTips = [t1, t2].filter(Boolean);
        const uniqueTips = Array.from(new Map(rawTips.map(item => [item.id, item])).values());
        setTips(uniqueTips); 
    } catch (e) {
        console.error("Lỗi tải tips:", e);
    }
  };

  const triggerSuccessAnimation = (points) => {
    setEarnedPoints(points);
    setShowSuccessModal(true);
    scaleValue.setValue(0);
    opacityValue.setValue(0);

    Animated.parallel([
      Animated.spring(scaleValue, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityValue, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();

    setTimeout(() => {
        Animated.timing(opacityValue, { toValue: 0, duration: 300, useNativeDriver: true })
        .start(() => setShowSuccessModal(false));
    }, 2000);
  };

  const handleDone = async (item) => {
    try {
        await completeTip(item.id);
        
        // [UPDATE] Lưu kèm ngày hiện tại và user ID
        if (currentUserId) {
          setCompletedTips(prev => {
              const newSet = new Set(prev);
              newSet.add(item.id);
              
              const storageKey = getCompletedTipsKey(currentUserId);
              const storageData = {
                  userId: currentUserId,
                  date: getTodayString(), // Lưu ngày hiện tại
                  ids: Array.from(newSet)
              };
              
              AsyncStorage.setItem(storageKey, JSON.stringify(storageData));
              return newSet;
          });
        }

        triggerSuccessAnimation(item.pointsReward || 10);
    } catch (e) {
        alert("Lỗi kết nối hoặc bạn đã nhận điểm rồi.");
    }
  };

  const renderItem = ({ item }) => {
    const isCompleted = completedTips.has(item.id);

    return (
      <View style={[styles.card, isCompleted && styles.cardCompleted]}> 
          <Image 
              source={{ uri: item.iconUrl || 'https://via.placeholder.com/300x150.png?text=Environment+Tip' }} 
              style={[styles.image, isCompleted && styles.imageCompleted]} 
              resizeMode="cover"
          />
          <View style={styles.content}>
              <Text style={[styles.title, isCompleted && styles.textCompleted]}>{item.title}</Text>
              <Text style={[styles.desc, isCompleted && styles.textCompleted]} numberOfLines={3}>
                  {item.description || "Hãy thực hiện hành động này để bảo vệ môi trường."}
              </Text>
              
              {!isCompleted && (
                <View style={styles.pointsTag}>
                    <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.pointsText}>+{item.pointsReward || 10} điểm</Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.btn, isCompleted && styles.btnDisabled]} 
                onPress={() => handleDone(item)}
                disabled={isCompleted}
              >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {isCompleted ? (
                        <>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" style={{marginRight: 6}} />
                            <Text style={[styles.btnText, {color: '#4CAF50'}]}>Hẹn gặp lại ngày mai!</Text>
                        </>
                    ) : (
                        <Text style={styles.btnText}>Thực hiện ngay</Text>
                    )}
                  </View>
              </TouchableOpacity>
          </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hành động mỗi ngày</Text>
        <View style={{width: 40}} /> 
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={{marginTop: 10, color: '#666'}}>Đang tải gợi ý...</Text>
        </View>
      ) : (
        <FlatList
            data={tips}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{padding: 16}}
            ListEmptyComponent={
                <View style={styles.centerContainer}>
                    <MaterialCommunityIcons name="leaf" size={48} color="#ccc" />
                    <Text style={{marginTop: 10, color: '#888'}}>Không có gợi ý nào lúc này.</Text>
                </View>
            }
        />
      )}

      {/* Modal Chúc Mừng */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="none"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
            <Animated.View style={[
                styles.successCard, 
                { transform: [{ scale: scaleValue }], opacity: opacityValue }
            ]}>
                <MaterialCommunityIcons name="check-decagram" size={80} color="#4CAF50" />
                <Text style={styles.successTitle}>Tuyệt vời!</Text>
                <Text style={styles.successDesc}>Bạn vừa nhận được</Text>
                <Text style={styles.pointsEarned}>+{earnedPoints} Điểm xanh</Text>
            </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 20, elevation: 4, overflow: 'hidden' },
  // [Style mới] Làm mờ thẻ khi đã hoàn thành
  cardCompleted: { opacity: 0.8, backgroundColor: '#FAFAFA' },
  
  imageCompleted: { opacity: 0.6 }, // Làm mờ ảnh
  
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#2E7D32' },
  desc: { fontSize: 14, color: '#555', marginBottom: 12, lineHeight: 22 },
  textCompleted: { color: '#999' }, // Làm mờ chữ
  
  pointsTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1', alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, marginBottom: 16 },
  pointsText: { fontSize: 12, fontWeight: 'bold', color: '#F57F17', marginLeft: 4 },
  
  btn: { backgroundColor: '#2E7D32', paddingVertical: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  
  // [Style mới] Nút khi đã xong: nền trong suốt, viền nhẹ
  btnDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 0,
    marginTop: 5
  },
  
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: 'white', padding: 30, borderRadius: 25, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, width: '80%' },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginTop: 15 },
  successDesc: { fontSize: 16, color: '#555', marginTop: 5 },
  pointsEarned: { fontSize: 32, fontWeight: 'bold', color: '#F9A825', marginTop: 10 }
});

export default DailyTipScreen;