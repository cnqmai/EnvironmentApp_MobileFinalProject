import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image, // Import Image
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { fetchDiscoverCommunities, createPost, fetchCurrentUser } from '../../src/services/communityService';
// Import HÀM UPLOAD THỰC TẾ
import { uploadFile } from '../../src/services/fileService'; 


const CreatePostScreen = () => {
  const router = useRouter();
  const [content, setContent] = useState("");
  // Dùng null/UUID cho ID nhóm
  const [selectedCommunityId, setSelectedCommunityId] = useState(null); 
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State User hiện tại
  const [currentUser, setCurrentUser] = useState(null); 
  
  // State load danh sách nhóm
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  // Helper để lấy chữ cái đầu
  const getInitials = (fullName) => {
    // [CẬP NHẬT QUAN TRỌNG] Kiểm tra nếu fullName là null, undefined, hoặc rỗng
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
        return '?'; // Trả về ký tự placeholder nếu tên không hợp lệ
    }
    
    // Logic còn lại giữ nguyên
    const parts = fullName.split(' ');
    
    // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
    if (parts.length >= 2) {
        // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    
    // Nếu chỉ có 1 từ hoặc không có, lấy 2 ký tự đầu
    return fullName.substring(0, 2).toUpperCase();
};

  // --- LOGIC 1: LẤY THÔNG TIN USER (TỪ TOKEN) ---
  const loadCurrentUser = useCallback(async () => {
    try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
    } catch (e) {
        console.error("Lỗi tải thông tin người dùng:", e);
    }
  }, []);

  // Load danh sách nhóm Khám phá (để chọn)
  const loadCommunities = useCallback(async () => {
    setCommunitiesLoading(true);
    try {
        const discoverGroups = await fetchDiscoverCommunities(0, 10);
        // Thêm option "Cộng đồng chung" vào đầu
        const allGroups = [
            { id: null, name: "Cộng đồng chung", icon: "earth" },
            ...discoverGroups.map(g => ({
                id: g.id, 
                name: g.name, 
                icon: 'account-group' // Tạm thời dùng icon mặc định
            }))
        ];
        setCommunities(allGroups);
    } catch (e) {
        console.error("Lỗi tải nhóm:", e);
        Alert.alert("Lỗi", "Không thể tải danh sách cộng đồng.");
    } finally {
        setCommunitiesLoading(false);
    }
  }, []);

  // Gọi load user và Communities khi component mount
  useEffect(() => {
    loadCurrentUser();
    loadCommunities();
  }, [loadCurrentUser, loadCommunities]);


  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectImage = async () => {
    if (loading) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập ảnh/video.');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.ImagesAndVideos,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => ({
        id: Date.now() + Math.random(),
        uri: asset.uri,
        type: asset.type,
      }));
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const handleRemoveImage = (imageId) => {
    setSelectedImages(selectedImages.filter((img) => img.id !== imageId));
  };

  // --- HÀM XỬ LÝ ĐĂNG BÀI CHÍNH ---
  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bài viết");
      return;
    }
    if (!currentUser) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để đăng bài.");
        return;
    }

    setLoading(true);
    
    try {
      // 1. Upload media files (Dùng hàm uploadFile THỰC TẾ)
      const uploadPromises = selectedImages.map(img => {
          return uploadFile(img.uri); // Hàm này trả về URL đã lưu
      });
      const mediaUrls = await Promise.all(uploadPromises);

      // 2. Tạo Payload
      const payload = {
        content: content,
        groupId: selectedCommunityId,
        mediaUrls: mediaUrls,
      };

      // 3. Gọi API Backend: POST /api/posts
      await createPost(payload);

      // 4. Thành công
      Alert.alert(
        "Đăng bài thành công",
        `Bài viết của bạn đã được đăng!`,
        [
          {
            text: "OK",
            onPress: () => {
              setLoading(false);
              // Quay lại màn hình cộng đồng
              router.push("/community"); 
            },
          },
        ]
      );
    } catch (error) {
      console.error("Lỗi đăng bài:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể đăng bài. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const selectedCommunityObject = communities.find(c => c.id === selectedCommunityId);
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color="#0A0A0A"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo bài viết</Text>
        <TouchableOpacity
          style={[
            styles.postButton,
            (!content.trim() || loading || !currentUser) && styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!content.trim() || loading || !currentUser}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text
              style={[
                styles.postButtonText,
                (!content.trim() || !currentUser) && styles.postButtonTextDisabled,
              ]}
            >
              Đăng bài
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
                {currentUser ? getInitials(currentUser.fullName) : '...'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
                {currentUser ? currentUser.fullName : 'Đang tải...'}
            </Text>
            <Text style={styles.userPrompt}>Đăng lên nhóm: {selectedCommunityObject?.name || 'Cộng đồng chung'}</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder="Bạn đang nghĩ gì về môi trường?"
            value={content}
            onChangeText={setContent}
            multiline
            placeholderTextColor="#999"
          />

          {selectedImages.length > 0 && (
            <View style={styles.imagesPreview}>
                {selectedImages.map((media) => ( // Đổi tên biến từ 'image' thành 'media' cho rõ ràng
                    <View key={media.id} style={styles.imagePreviewItem}>
                        
                        {/* LOGIC HIỂN THỊ PREVIEW */}
                        {media.type === 'video' ? (
                            // Hiển thị Placeholder cho Video
                            <View style={[styles.imagePreview, styles.videoPlaceholder]}>
                                <MaterialCommunityIcons name="video-outline" size={40} color="#666" />
                                <Text style={styles.videoText}>Video đã chọn</Text>
                            </View>
                        ) : (
                            // Chỉ hiển thị ảnh bằng component Image
                            <Image source={{ uri: media.uri }} style={styles.imagePreview} />
                        )}
                        
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => handleRemoveImage(media.id)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={24}
                              color="#E63946"
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        )}
        </View>

        <View style={styles.imageUploadSection}>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={handleSelectImage}
            disabled={loading}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="image-plus" size={40} color="#999" />
            <Text style={styles.imageUploadText}>Thêm ảnh hoặc video</Text>
            <Text style={styles.imageUploadSubtext}>
              Nhấn để chọn từ thiết bị (Hiện tại đã chọn: {selectedImages.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Thêm vào bài viết</Text>
          <View style={styles.optionsGrid}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleSelectImage}
              activeOpacity={0.7}
              disabled={loading}
            >
              <MaterialCommunityIcons name="image" size={18} color="#007AFF" />
              <Text style={styles.optionText}>Ảnh/Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="account-multiple"
                size={18}
                color="#34C759"
              />
              <Text style={styles.optionText}>Tag người</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color="#E63946"
              />
              <Text style={styles.optionText}>Vị trí</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="pound" size={18} color="#FFB800" />
              <Text style={styles.optionText}>Hashtag</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>Chọn nhóm (tùy chọn)</Text>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm nhóm..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!communitiesLoading}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
            )}
          </View>
          
          {communitiesLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" style={{marginTop: 20}} />
          ) : (
                  filteredCommunities.map((community) => (
                      <TouchableOpacity
                      key={community.id || 'general'}
                      style={[
                          styles.communityOption,
                          selectedCommunityId === community.id &&
                              styles.communityOptionActive,
                      ]}
                      onPress={() =>
                          setSelectedCommunityId(
                          selectedCommunityId === community.id ? null : community.id
                          )
                      }
                      activeOpacity={0.7}
                      >
                      <View
                          style={[
                          styles.communityIcon,
                          selectedCommunityId === community.id &&
                              styles.communityIconActive,
                          ]}
                      >
                          <MaterialCommunityIcons
                          name={community.icon}
                          size={20}
                          color={
                              selectedCommunityId === community.id ? "#007AFF" : "#666"
                          }
                          />
                      </View>
                      <Text style={styles.communityName}>{community.name}</Text>
                      <MaterialCommunityIcons
                          name={
                          selectedCommunityId === community.id
                              ? "check-circle"
                              : "check-circle-outline"
                          }
                          size={22}
                          color={
                          selectedCommunityId === community.id ? "#007AFF" : "#CCC"
                          }
                      />
                      </TouchableOpacity>
                  ))
          )}

          {filteredCommunities.length === 0 && !communitiesLoading && (
            <View style={styles.noResultsContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={40}
                color="#CCC"
              />
              <Text style={styles.noResultsText}>
                Không tìm thấy nhóm phù hợp
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Styles giữ nguyên)
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#F0EFED",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
    flex: 1,
    marginLeft: 8,
  },
  postButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  postButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  postButtonTextDisabled: {
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 2,
  },
  userPrompt: {
    ...typography.small,
    fontSize: 12,
    color: "#666",
  },
  inputSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: "top",
  },
  imagesPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  imagePreviewItem: {
    position: "relative",
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: 'cover',
  },
  videoPlaceholder: {
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  videoText: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    // Màu sắc đỏ không bị mất icon
  },
  imageUploadSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  imageUploadText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
  },
  imageUploadSubtext: {
    ...typography.small,
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  optionsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  optionText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "500",
    color: "#0A0A0A",
  },
  communitySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  communityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F5F5F5",
    gap: 10,
  },
  communityOptionActive: {
    backgroundColor: "#E3F2FD",
  },
  communityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  communityIconActive: {
    backgroundColor: "#FFFFFF",
  },
  communityName: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: "#0A0A0A",
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  noResultsText: {
    ...typography.body,
    fontSize: 14,
    color: "#999",
  },
});

export default CreatePostScreen;