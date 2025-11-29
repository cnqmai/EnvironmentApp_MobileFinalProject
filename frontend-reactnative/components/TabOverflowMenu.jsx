import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useRouter, useSegments } from "expo-router";
import Modal from "react-native-modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// (Component MenuItem được định nghĩa ở dưới)

const TabOverflowMenu = (props) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const segments = useSegments(); 

  const inAuthScreen =
    segments[0] === "(tabs)" &&
    (segments[1] === "login" || segments[1] === "register");

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
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
            </>
          )}

          {/* Nút "Cài đặt" luôn hiển thị */}
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

// Component MenuItem và styles từ tệp gốc
const MenuItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={24} color="#333" />
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
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default TabOverflowMenu;