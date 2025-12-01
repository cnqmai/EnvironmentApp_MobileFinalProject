import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useRouter, useSegments, useLocalSearchParams, useFocusEffect } from "expo-router";
import Modal from "react-native-modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getUnreadCount } from "../src/services/notificationService";

// (Component MenuItem được định nghĩa ở dưới)

const TabOverflowMenu = (props) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams(); 

  const inAuthScreen =
    segments[0] === "(tabs)" &&
    (segments[1] === "login" || segments[1] === "register");

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Load unread count khi mở modal hoặc khi có refreshStamp
  useEffect(() => {
    if (isModalVisible) {
      fetchUnreadCount();
    }
  }, [isModalVisible, fetchUnreadCount]);

  // Refresh khi có params.refreshStamp (từ notifications screen)
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [params.refreshStamp, fetchUnreadCount])
  );

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    if (!isModalVisible) {
      fetchUnreadCount(); // Refresh count khi mở modal
    }
  };

  const navigateAndClose = (path) => {
    toggleModal();
    // Điều hướng đến màn hình tương ứng
    router.push(path);
  };

  // Nút bấm gốc trên Tab Bar
  const TabBarButton = props.children;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal} style={styles.touchable}>
        {TabBarButton}
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal} 
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.4}
      >
        <View style={styles.modalContent}>
          {!inAuthScreen && (
            <>
              <MenuItem
                icon="account-group"
                text="Cộng đồng"
                onPress={() => navigateAndClose("/community")}
              />
              {/* QUAN TRỌNG: Đường dẫn phải là /chat/chatbot */}
              <MenuItem
                icon="chat"
                text="Chatbot"
                onPress={() => navigateAndClose("/chat/chatbot")}
              />
              <MenuItem
                icon="flag"
                text="Báo cáo" 
                onPress={() => navigateAndClose("/reports")}
              />
              <MenuItem
                icon="bell"
                text="Thông báo"
                badgeCount={unreadCount}
                onPress={() => navigateAndClose("/(tabs)/notifications")}
              />
            </>
          )}

          <MenuItem
            icon="cog"
            text="Cài đặt"
            onPress={() => navigateAndClose("/settings")}
          />

          {/* --- NÚT BẢN ĐỒ (Đã sửa đường dẫn thành /map/map) --- */}
          {!inAuthScreen && (
            <MenuItem
              icon="map-search-outline"
              text="Bản đồ xanh"
              onPress={() => navigateAndClose("/map/map")} 
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const MenuItem = ({ icon, text, onPress, badgeCount }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#333" />
      {badgeCount > 0 && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      )}
    </View>
    <Text style={styles.menuItemText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 0.84,
    alignItems: "center",
    justifyContent: "center",
  },
  touchable: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    position: "absolute",
    bottom: 100, 
    right: 20,
    width: 250,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuItemIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  menuBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default TabOverflowMenu;