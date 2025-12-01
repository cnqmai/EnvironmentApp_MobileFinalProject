import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Modal, Animated 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';

// Import service
import { confirmRecycleAction } from '../src/services/recycleService'; // Đảm bảo đã update file service
// Giả sử bạn có hàm identifyWaste (nếu chưa có API thật thì dùng mock bên dưới)
const identifyWaste = async (uri) => {
    // Mock AI response
    return new Promise(resolve => setTimeout(() => resolve({
        label: "Chai nhựa (Plastic)",
        confidence: 0.95,
        type: "Tái chế được",
        guideline: "Rửa sạch, ép dẹt và bỏ vào thùng rác tái chế."
    }), 2000));
};

export default function RecycleCameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pointsClaimed, setPointsClaimed] = useState(false); // Trạng thái đã nhận điểm chưa

  // Animation State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{textAlign:'center', marginBottom: 10}}>Chúng tôi cần quyền truy cập Camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnPrimary}><Text style={styles.btnText}>Cấp quyền</Text></TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePictureAsync();
        // Resize ảnh để gửi lên server nhanh hơn
        const manipulated = await ImageManipulator.manipulateAsync(
            photoData.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setPhoto(manipulated.uri);
        analyzeImage(manipulated.uri);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể chụp ảnh.");
      }
    }
  };

  const analyzeImage = async (uri) => {
    setLoading(true);
    try {
        const data = await identifyWaste(uri);
        setResult(data);
        setPointsClaimed(false); // Reset trạng thái nhận điểm
    } catch (error) {
        Alert.alert("Lỗi", "Không thể nhận diện hình ảnh.");
        setPhoto(null); // Chụp lại
    } finally {
        setLoading(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setResult(null);
    setPointsClaimed(false);
  };

  const handleClaimPoints = async () => {
    if (pointsClaimed) return;
    try {
        await confirmRecycleAction(result.label);
        setPointsClaimed(true);
        triggerSuccessAnimation();
    } catch (error) {
        Alert.alert("Lỗi", "Không thể cộng điểm lúc này.");
    }
  };

  const triggerSuccessAnimation = () => {
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

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <MaterialCommunityIcons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AI Phân loại rác</Text>
            <View style={{width: 40}} />
        </View>

        {/* Camera View or Preview */}
        {!photo ? (
            <CameraView style={styles.camera} ref={cameraRef} facing="back">
                <View style={styles.cameraOverlay}>
                    <View style={styles.guideFrame} />
                    <Text style={styles.guideText}>Đặt rác vào trong khung hình</Text>
                    <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        ) : (
            <View style={styles.previewContainer}>
                <Image source={{ uri: photo }} style={styles.previewImage} />
                
                {loading ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FFF" />
                        <Text style={{color: '#FFF', marginTop: 10, fontWeight: 'bold'}}>Đang phân tích...</Text>
                    </View>
                ) : (
                    <View style={styles.resultPanel}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons name="recycle" size={32} color="#2E7D32" />
                            <View style={{marginLeft: 10}}>
                                <Text style={styles.resultLabel}>{result?.label}</Text>
                                <Text style={styles.resultType}>{result?.type}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.guidelineBox}>
                            <Text style={styles.guidelineTitle}>Hướng dẫn xử lý:</Text>
                            <Text style={styles.guidelineText}>{result?.guideline}</Text>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.btnRetake} onPress={handleRetake}>
                                <MaterialCommunityIcons name="camera-retake" size={24} color="#666" />
                                <Text style={styles.btnRetakeText}>Chụp lại</Text>
                            </TouchableOpacity>

                            {/* Nút Nhận điểm */}
                            <TouchableOpacity 
                                style={[styles.btnClaim, pointsClaimed && styles.btnClaimDisabled]} 
                                onPress={handleClaimPoints}
                                disabled={pointsClaimed}
                            >
                                <MaterialCommunityIcons 
                                    name={pointsClaimed ? "check-circle" : "gift-outline"} 
                                    size={24} 
                                    color="#FFF" 
                                />
                                <Text style={styles.btnClaimText}>
                                    {pointsClaimed ? "Đã nhận 5 điểm" : "Xác nhận & Nhận điểm"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        )}

        {/* Modal Chúc Mừng */}
        <Modal transparent={true} visible={showSuccessModal} animationType="none">
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.successCard, { transform: [{ scale: scaleValue }], opacity: opacityValue }]}>
                    <MaterialCommunityIcons name="leaf" size={60} color="#4CAF50" />
                    <Text style={styles.successTitle}>Tuyệt vời!</Text>
                    <Text style={styles.successDesc}>Bạn đã phân loại đúng.</Text>
                    <Text style={styles.pointsEarned}>+5 Điểm xanh</Text>
                </Animated.View>
            </View>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, zIndex: 10 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  iconBtn: { padding: 5 },

  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guideFrame: { width: 280, height: 280, borderWidth: 2, borderColor: '#FFF', borderRadius: 20, borderStyle: 'dashed' },
  guideText: { color: '#FFF', marginTop: 20, fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  
  captureBtn: { position: 'absolute', bottom: 40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },

  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage: { flex: 1, resizeMode: 'contain' },
  
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },

  resultPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultLabel: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  resultType: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold', textTransform: 'uppercase' },
  
  guidelineBox: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12, marginBottom: 20 },
  guidelineTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 4 },
  guidelineText: { fontSize: 14, color: '#333', lineHeight: 20 },

  actionRow: { flexDirection: 'row', gap: 12 },
  btnRetake: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, backgroundColor: '#EEE' },
  btnRetakeText: { marginLeft: 8, fontWeight: 'bold', color: '#666' },
  
  btnClaim: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, backgroundColor: '#2E7D32' },
  btnClaimDisabled: { backgroundColor: '#4CAF50', opacity: 0.8 },
  btnClaimText: { marginLeft: 8, fontWeight: 'bold', color: '#FFF' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: 'white', padding: 30, borderRadius: 25, alignItems: 'center', width: '80%' },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginTop: 15 },
  successDesc: { fontSize: 16, color: '#555', marginTop: 5 },
  pointsEarned: { fontSize: 32, fontWeight: 'bold', color: '#F9A825', marginTop: 10 },
  
  btnPrimary: { backgroundColor: '#2E7D32', padding: 12, borderRadius: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});