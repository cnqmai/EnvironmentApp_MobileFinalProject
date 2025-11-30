import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const CreatePostScreen = () => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const communities = [
    { id: 0, name: "Cộng đồng chung", icon: "earth" },
    { id: 1, name: "Sống xanh sài gòn", icon: "account-group" },
    { id: 2, name: "Tái chế sáng tạo", icon: "recycle" },
    { id: 3, name: "Sống tối giản", icon: "leaf" },
    { id: 4, name: "Không rác thải nhựa", icon: "bottle-soda-outline" },
    { id: 5, name: "Tiết kiệm năng lượng", icon: "lightning-bolt" },
  ];

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectImage = () => {
    // Mock: Thêm ảnh giả
    const newImage = {
      id: Date.now(),
      uri: "https://picsum.photos/400/300?random=" + Date.now(),
    };
    setSelectedImages([...selectedImages, newImage]);
  };

  const handleRemoveImage = (imageId) => {
    setSelectedImages(selectedImages.filter((img) => img.id !== imageId));
  };

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bài viết");
      return;
    }

    const postLocation = selectedCommunity || "Cộng đồng chung";
    Alert.alert(
      "Đăng bài thành công",
      `Bài viết của bạn đã được đăng lên ${postLocation}!`,
      [
        {
          text: "OK",
          onPress: () => router.push("/community"),
        },
      ]
    );
  };

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
            !content.trim() && styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!content.trim()}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.postButtonText,
              !content.trim() && styles.postButtonTextDisabled,
            ]}
          >
            Đăng bài
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>BAN</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Bạn Anh</Text>
            <Text style={styles.userPrompt}>Đăng lên nhóm cộng đồng</Text>
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
              {selectedImages.map((image) => (
                <View key={image.id} style={styles.imagePreviewItem}>
                  <View style={styles.imagePreviewPlaceholder} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(image.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={24}
                      color="#FFFFFF"
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
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="image-plus" size={40} color="#999" />
            <Text style={styles.imageUploadText}>Thêm ảnh hoặc video</Text>
            <Text style={styles.imageUploadSubtext}>
              Nhấn để chọn từ thiết bị
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

          {filteredCommunities.map((community) => (
            <TouchableOpacity
              key={community.id}
              style={[
                styles.communityOption,
                selectedCommunity === community.name &&
                  styles.communityOptionActive,
              ]}
              onPress={() =>
                setSelectedCommunity(
                  selectedCommunity === community.name ? "" : community.name
                )
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.communityIcon,
                  selectedCommunity === community.name &&
                    styles.communityIconActive,
                ]}
              >
                <MaterialCommunityIcons
                  name={community.icon}
                  size={20}
                  color={
                    selectedCommunity === community.name ? "#007AFF" : "#666"
                  }
                />
              </View>
              <Text style={styles.communityName}>{community.name}</Text>
              <MaterialCommunityIcons
                name={
                  selectedCommunity === community.name
                    ? "check-circle"
                    : "check-circle-outline"
                }
                size={22}
                color={
                  selectedCommunity === community.name ? "#007AFF" : "#CCC"
                }
              />
            </TouchableOpacity>
          ))}

          {filteredCommunities.length === 0 && (
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
  imagePreviewPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#E63946",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default CreatePostScreen;
