import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import typography from "../../styles/typography";

const threads = [
  {
    id: "1",
    title: "Hướng dẫn vứt pin",
    snippet:
      "Pin đã dùng xử lý như thế nào? Mang đến điểm thu gom rác điện tử.",
    time: "Hôm nay",
  },
  {
    id: "2",
    title: "AQI Quận 7",
    snippet: "AQI hôm nay là 132, hạn chế ra ngoài nếu nhạy cảm.",
    time: "Hôm nay",
  },
  {
    id: "3",
    title: "Phân loại nhựa",
    snippet: "Nên rửa và bóc nhãn trước khi bỏ vào điểm tái chế.",
    time: "Hôm qua",
  },
];

const ChatBot = () => {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() =>
        router.push(
          `/chat/chat-history?threadId=${item.id}&title=${encodeURIComponent(
            item.title
          )}`
        )
      }
    >
      <Avatar.Text
        size={44}
        label={item.title
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")}
      />
      <View style={styles.rowText}>
        <Text style={styles.threadTitle}>{item.title}</Text>
        <Text
          style={styles.threadSnippet}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.snippet}
        </Text>
      </View>
      <Text style={styles.threadTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerLeft}
        >
          <Text style={styles.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chatbot môi trường</Text>
        <TouchableOpacity onPress={() => {}} style={styles.headerRight}>
          <Text style={styles.headerPlus}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  rowText: { flex: 1, marginLeft: 12 },
  threadTitle: { ...typography.h3, fontWeight: "800", color: "#0A0A0A" },
  threadSnippet: { ...typography.body, color: "#666", marginTop: 4 },
  threadTime: { ...typography.small, color: "#999" },
  separator: { height: 8 },
  container: { flex: 1, backgroundColor: "#F6F7F8" },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: { padding: 8 },
  headerBack: { ...typography.h3, fontSize: 20, color: "#0A0A0A" },
  headerRight: { padding: 8 },
  headerPlus: { ...typography.h3, fontSize: 20, color: "#0A0A0A" },
});

export default ChatBot;
