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

  const communities = [
    { id: 1, name: "Sống xanh sài gòn", icon: "account-group" },
    { id: 2, name: "Tái chế sáng tạo", icon: "recycle" },
  ];

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bài viết");
      return;
    }
    if (!selectedCommunity) {
      Alert.alert("Thông báo", "Vui lòng chọn nhóm để đăng bài");
      return;
    }

    Alert.alert("Đăng bài thành công", "Bài viết của bạn đã được đăng!", [
      {
        text: "OK",
        onPress: () => router.push("/community"),
      },
    ]);
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
            (!content.trim() || !selectedCommunity) &&
              styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!content.trim() || !selectedCommunity}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.postButtonText,
              (!content.trim() || !selectedCommunity) &&
                styles.postButtonTextDisabled,
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
            <Text style={styles.userName}>Tài khoản của bạn</Text>
            <Text style={styles.userPrompt}>
              Bạn đang nghĩ gì về môi trường?
            </Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder=""
            value={content}
            onChangeText={setContent}
            multiline
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.imageUploadSection}>
          <TouchableOpacity
            style={styles.imageUploadButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="image" size={48} color="#CCC" />
            <Text style={styles.imageUploadText}>Thêm ảnh/video</Text>
            <Text style={styles.imageUploadSubtext}>
              Kéo thả hoặc chọn file
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Thêm vào bài viết</Text>
          <View style={styles.optionsGrid}>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="image" size={20} color="#0A0A0A" />
              <Text style={styles.optionText}>Ảnh/Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="account-multiple"
                size={20}
                color="#0A0A0A"
              />
              <Text style={styles.optionText}>Tag nhóm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#0A0A0A"
              />
              <Text style={styles.optionText}>Vị trí</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="pound" size={20} color="#0A0A0A" />
              <Text style={styles.optionText}>Hashtag</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>Chọn nhóm (tùy chọn)</Text>
          {communities.map((community) => (
            <TouchableOpacity
              key={community.id}
              style={[
                styles.communityOption,
                selectedCommunity === community.name &&
                  styles.communityOptionActive,
              ]}
              onPress={() => setSelectedCommunity(community.name)}
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
              <Text
                style={[
                  styles.communityName,
                  selectedCommunity === community.name &&
                    styles.communityNameActive,
                ]}
              >
                {community.name}
              </Text>
              {selectedCommunity === community.name && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#007AFF"
                />
              )}
            </TouchableOpacity>
          ))}
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
    paddingVertical: 16,
    backgroundColor: "#F0EFED",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.body,
    fontSize: 16,
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
    ...typography.body,
    fontSize: 13,
    color: "#666",
  },
  inputSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  textInput: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    minHeight: 100,
    textAlignVertical: "top",
  },
  imageUploadSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#F0EFED",
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 40,
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
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  optionsSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#F0EFED",
  },
  sectionTitle: {
    ...typography.body,
    fontSize: 15,
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
    borderRadius: 20,
    gap: 6,
  },
  optionText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
    color: "#0A0A0A",
  },
  communitySection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  communityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F5F5F5",
    gap: 12,
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
  communityNameActive: {
    color: "#007AFF",
  },
});

export default CreatePostScreen;
