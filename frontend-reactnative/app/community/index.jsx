import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router"; 
import React, { useCallback, useState } from "react"; 
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator, 
  Alert, 
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import CommunityCard from "../../components/community/CommunityCard";
import EventCard from "../../components/community/EventCard";
import ForumPostCard from "../../components/community/ForumPostCard";
import typography from "../../styles/typography";
import { fetchCommunityFeed, fetchDiscoverCommunities, fetchMyCommunities, toggleLikePost } from '../../src/services/communityService'; 
import { fetchAllEvents, registerForCampaign } from '../../src/services/campaignService';

const CommunityScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("forum");
  const [forumSubTab, setForumSubTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  // State dữ liệu
  const [posts, setPosts] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // State chứa dữ liệu sự kiện
  const [loading, setLoading] = useState(true);


  // --- LOGIC LẤY DỮ LIỆU CHÍNH ---
  const fetchData = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);

    try {
        // Lời gọi fetchCommunityFeed TỪ communityService
        const fetchedPosts = await fetchCommunityFeed(forumSubTab); 
        setPosts(fetchedPosts);
        
        const myGroups = await fetchMyCommunities();
        setMyCommunities(myGroups);
        
        const discoverGroups = await fetchDiscoverCommunities();
        setDiscoverCommunities(discoverGroups);
        
        // Lời gọi fetchAllEvents TỪ campaignService
        const eventsData = await fetchAllEvents(); 
        setAllEvents(eventsData);
        
    } catch (error) {
        console.error("Lỗi tải dữ liệu cộng đồng:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu cộng đồng.");
    } finally {
        setRefreshing(false);
        setLoading(false);
    }
  }, [forumSubTab]); 

  useFocusEffect(
    useCallback(() => {
      fetchData();
      setActiveTab("forum"); 
    }, [fetchData])
  );

  const onRefresh = () => {
    fetchData();
  };
  
  // --- HÀM ĐĂNG KÝ SỰ KIỆN ---
  const handleEventRegister = async (eventId) => {
    try {
      await registerForCampaign(eventId);
      Alert.alert(
        "Thành công! 🎉",
        "Bạn đã đăng ký tham gia chiến dịch thành công và nhận được 100 điểm thưởng!"
      );
      // Refresh danh sách để cập nhật số lượng người tham gia
      fetchData();
    } catch (error) {
      console.error("Lỗi đăng ký chiến dịch:", error.message);
      Alert.alert(
        "Lỗi đăng ký",
        error.message || "Không thể đăng ký tham gia chiến dịch. Vui lòng thử lại sau."
      );
    }
  };

  // --- HÀM XỬ LÝ LIKE (giữ nguyên) ---
  const handleLikeToggle = async (postId) => {
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    const newLikedState = !originalPost.isLikedByCurrentUser;
    const optimisticCount = originalPost.likesCount + (newLikedState ? 1 : -1);
    
    const originalPosts = posts; 

    // B1: Optimistic update
    setPosts(prevPosts => 
        prevPosts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isLikedByCurrentUser: newLikedState,
                    likesCount: optimisticCount
                };
            }
            return post;
        })
    );
    
    console.log(`[OPTIMISTIC] Post ID: ${postId} | Liked: ${newLikedState} | Count: ${optimisticCount}`);

    try {
        // B2: Gọi API
        const updatedPostResponse = await toggleLikePost(postId); 
        
        console.log(`[API RESPONSE] Post ID: ${postId} | Liked: ${updatedPostResponse.isLikedByCurrentUser} | Count: ${updatedPostResponse.likesCount}`);

        // B3: Cập nhật lại state với dữ liệu CHÍNH XÁC từ Backend
        setPosts(prevPosts => 
            prevPosts.map(post => {
                if (post.id === postId) {
                    return updatedPostResponse; 
                }
                return post;
            })
        );

    } catch (error) {
        console.error("Lỗi thả tim:", error);
        // B4: Revert nếu lỗi
        setPosts(originalPosts);
        Alert.alert("Lỗi", "Thao tác thả tim thất bại.");
    }
  };


  const tabs = [
    { id: "forum", label: "Diễn đàn", icon: "forum" },
    { id: "events", label: "Tất cả sự kiện", icon: "calendar" }, 
    { id: "my-communities", label: "Cộng đồng của tôi", icon: "account-group" },
    { id: "discover", label: "Khám phá", icon: "compass" },
  ];


  // --- HÀM RENDER SỰ KIỆN (SỬ DỤNG DỮ LIỆU THỰC TẾ) ---
  const renderEvents = () => (
    <View style={styles.contentContainer}>
      {/* NÚT CHUYỂN HƯỚNG TẠO EVENT */}
      <TouchableOpacity
        style={styles.createEventButton} 
        onPress={() => router.push("/community/create-event")} 
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="calendar-plus"
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.createEventButtonText}>Tạo Sự kiện Mới</Text>
      </TouchableOpacity>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sự kiện sắp diễn ra</Text>
      </View>

      {/* HIỂN THỊ EVENTS TỪ STATE allEvents */}
      {allEvents.length === 0 ? (
          <Text style={styles.noDataText}>Chưa có sự kiện nào.</Text>
      ) : (
          allEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              showStatus={true}
              onPress={() =>
                router.push(`/community/${event.communityId}/events/${event.id}`) 
              }
              onRegister={handleEventRegister}
            />
          ))
      )}
    </View>
  );
  // --- KẾT THÚC HÀM RENDER SỰ KIỆN ---

  const renderCommunities = (list, title) => (
    <View style={styles.contentContainer}>
      <TouchableOpacity
        style={styles.createCommunityButton}
        onPress={() => router.push("/community/create-community")} 
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="account-multiple-plus"
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.createCommunityButtonText}>Tạo cộng đồng mới</Text>
      </TouchableOpacity>
        
      {list.length === 0 && !loading ? (
        <Text style={styles.noDataText}>Chưa có nhóm nào. Hãy tham gia hoặc tạo nhóm mới!</Text>
      ) : (
        list.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onPress={() => router.push(`/community/${community.id}`)}
          />
        ))
      )}
    </View>
  );

  const renderForum = () => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.forumSubTabs}>
          <TouchableOpacity
            style={[
              styles.forumSubTab,
              forumSubTab === "all" && styles.forumSubTabActive,
            ]}
            onPress={() => setForumSubTab("all")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.forumSubTabText,
                forumSubTab === "all" && styles.forumSubTabTextActive,
              ]}
            >
              Tất cả bài viết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.forumSubTab,
              forumSubTab === "my" && styles.forumSubTabActive,
            ]}
            onPress={() => setForumSubTab("my")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.forumSubTabText,
                forumSubTab === "my" && styles.forumSubTabTextActive,
              ]}
            >
              Bài viết của tôi
            </Text>
          </TouchableOpacity>
        </View>
        
        {loading && posts.length === 0 ? (
            <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
        ) : (
            <View style={styles.postsContainer}>
            {posts.map((post) => (
                <ForumPostCard
                key={post.id}
                post={post}
                onPress={() => router.push(`/community/post/${post.id}`)}
                onLike={handleLikeToggle}
                />
            ))}
            </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={["top"]}>
             <ActivityIndicator size="large" color="#007AFF" />
             <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu cộng đồng...</Text>
        </SafeAreaView>
    );
  }

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      >
        {activeTab === "events" && renderEvents()}
        {activeTab === "forum" && renderForum()}
        {activeTab === "my-communities" && renderCommunities(myCommunities, "Cộng đồng của tôi")}
        {activeTab === "discover" && renderCommunities(discoverCommunities, "Khám phá")}
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
    flexShrink: 0,
  },
  tabsContent: {
    paddingHorizontal: 24,
    paddingBottom: 10,
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
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  forumSubTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 4,
  },
  forumSubTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  forumSubTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  forumSubTabText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  forumSubTabTextActive: {
    fontWeight: "600",
    color: "#0A0A0A",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10, 
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
    gap: 8,
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
  createEventButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50", 
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10, 
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createEventButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  noDataText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    textAlign: 'center',
    marginTop: 20
  }
});

export default CommunityScreen;