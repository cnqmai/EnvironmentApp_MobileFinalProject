import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../styles/typography";
import { useRouter } from "expo-router";

export default function TabOverflowMenu({ visible, onClose }) {
  const router = useRouter();

  const items = [
    {
      key: "community",
      label: "Cộng đồng",
      icon: "account-group",
      href: "/community",
    },
    { key: "chat", label: "Chat", icon: "chat", href: "/chat/chatbot" },
    {
      key: "report",
      label: "Báo cáo",
      icon: "file-document-outline",
      href: "/report",
    },
  ];

  function onItemPress(href) {
    onClose && onClose();
    setTimeout(() => router.push(href), 160);
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.menu}>
          {items.map((it, idx) => (
            <TouchableOpacity
              key={it.key}
              style={styles.itemCard}
              onPress={() => onItemPress(it.href)}
            >
              <View style={styles.itemRow}>
                <MaterialCommunityIcons
                  name={it.icon}
                  size={20}
                  color="#666"
                  style={{ marginRight: 14 }}
                />
                <Text style={styles.label}>{it.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  container: {
    position: "absolute",
    right: 16,
    bottom: 90,
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 200,
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    borderWidth: 0,
    alignItems: "flex-end",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.04)",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.2,
  },
});
