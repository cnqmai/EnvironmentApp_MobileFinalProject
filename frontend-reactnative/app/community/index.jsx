import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import CommunityCard from "../../components/community/CommunityCard";
import EventCard from "../../components/community/EventCard";
import ForumPostCard from "../../components/community/ForumPostCard";
import typography from "../../styles/typography";

const CommunityScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("events");

  const tabs = [
    { id: "forum", label: "Diễn đàn", icon: "forum" },
    { id: "events", label: "Sự kiện nổi bật", icon: "star" },
    { id: "my-communities", label: "Cộng đồng của tôi", icon: "account-group" },
    { id: "discover", label: "Khám phá", icon: "compass" },
  ];

  const events = [
    {
      id: 1,
      title: "Chiến dịch làm sạch bãi biển",
      community: "Cộng đồng bảo vệ môi trường Cấp 2",
      communityId: 1,
      date: "15/12/2025",
      time: "07:00 - 11:00",
      location: "Bãi biển Vũng Tàu",
      participants: 120,
      maxParticipants: 200,
      status: "upcoming",
      description:
        "Tham gia cùng chúng tôi dọn sạch bãi biển, bảo vệ môi trường biển",
      image: "beach-cleanup",
    },
    {
      id: 2,
      title: "Hội thảo phân loại rác tái chế",
      community: "Cộng đồng năng động",
      communityId: 2,
      date: "20/12/2025",
      time: "14:00 - 16:00",
      location: "Nhà văn hóa Quận 1",
      participants: 45,
      maxParticipants: 100,
      status: "upcoming",
      description: "Chia sẻ kinh nghiệm phân loại rác tái chế hiệu quả",
      image: "workshop",
    },
    {
      id: 3,
      title: "Trồng cây xanh tại công viên",
      community: "Cộng đồng bảo vệ môi trường Cấp 2",
      communityId: 1,
      date: "25/12/2025",
      time: "06:00 - 09:00",
      location: "Công viên Tao Đàn",
      participants: 85,
      maxParticipants: 150,
      status: "upcoming",
      description: "Cùng nhau trồng cây xanh, tạo không gian sống xanh",
      image: "recycle-schedule",
    },
  ];

  const posts = [
    {
      id: 1,
      author: "Nguyễn Minh Anh",
      badge: "Chiến binh môi trường",
      community: "Sống xanh Sài Gòn",
      content:
        "Hôm nay mình đã tham gia dọn dẹp cộng viên cùng nhóm. Thu được gần 50kg rác! Cảm thấy rất vui và ý nghĩa 🌿 Cảm ơn tất cả mọi người đã tham gia! Hẹn gặp lại ở hoạt động tiếp theo!",
      likes: 124,
      comments: 18,
      shares: 5,
      date: "2 giờ trước",
      image: true,
    },
    {
      id: 2,
      author: "Trần Văn Nam",
      badge: "Nghệ sĩ tái chế",
      community: "Tái chế sáng tạo",
      content:
        "Chia sẻ cách mình tái chế chai nhựa thành chậu cây mini. Ai quan tâm thì mình làm video hướng dẫn nhé! 😊",
      likes: 67,
      comments: 23,
      shares: 8,
      date: "5 giờ trước",
      image: false,
    },
    {
      id: 3,
      author: "Phạm Thị Lan",
      badge: null,
      community: "Sống xanh Sài Gòn",
      content:
        "Hôm qua mình đã cùng gia đình tham gia sự kiện trồng cây. Thật vui khi được đóng góp vào việc bảo vệ môi trường! 🌱",
      likes: 89,
      comments: 12,
      shares: 3,
      date: "1 ngày trước",
      image: true,
    },
  ];

  const communities = [
    {
      id: 1,
      name: "Cộng đồng bảo vệ môi trường Cấp 2",
      members: 325,
      campaigns: 12,
      recycledWeight: 5420,
      joined: true,
      following: true,
    },
    {
      id: 2,
      name: "Cộng đồng năng động",
      members: 156,
      campaigns: 8,
      recycledWeight: 2340,
      joined: false,
      following: false,
    },
    {
      id: 3,
      name: "Xanh sạch Sài Gòn",
      members: 892,
      campaigns: 24,
      recycledWeight: 12800,
      joined: true,
      following: true,
    },
  ];

  const renderEvents = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sự kiện sắp diễn ra</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          showStatus={true}
          onPress={() =>
            router.push(`/community/${event.communityId}/events/${event.id}`)
          }
        />
      ))}
    </View>
  );

  const renderCommunities = () => (
    <View style={styles.contentContainer}>
      <TouchableOpacity
        style={styles.createCommunityButton}
        onPress={() => router.push("/community/create")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="account-multiple-plus"
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.createCommunityButtonText}>Tạo cộng đồng mới</Text>
      </TouchableOpacity>

      {communities
        .filter((c) => c.joined)
        .map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onPress={() => router.push(`/community/${community.id}`)}
          />
        ))}
    </View>
  );

  const renderForum = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bài viết mới nhất</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postsContainer}>
        {posts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            onPress={() => router.push(`/community/post/${post.id}`)}
          />
        ))}
      </View>
    </View>
  );

  const renderDiscover = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cộng đồng gợi ý</Text>
      </View>

      {communities
        .filter((c) => !c.joined)
        .map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onPress={() => router.push(`/community/${community.id}`)}
          />
        ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color="#0A0A0A"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cộng đồng</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/community/create-post")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={16}
              color={activeTab === tab.id ? "#FFFFFF" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "events" && renderEvents()}
        {activeTab === "forum" && renderForum()}
        {activeTab === "my-communities" && renderCommunities()}
        {activeTab === "discover" && renderDiscover()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: "800",
    color: "#0A0A0A",
    letterSpacing: -0.5,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  tabsContainer: {
    marginTop: 8,
    marginBottom: 0,
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  tabText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 5,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  seeAllText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  postsContainer: {
    gap: 12,
  },
  createCommunityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createCommunityButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default CommunityScreen;
