import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../../styles/typography";

const SearchScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <MaterialCommunityIcons
            name="hammer-wrench"
            size={64}
            color="#C7C7CC"
          />
          <Text style={styles.developmentTitle}>
            Đang trong quá trình phát triển
          </Text>
          <Text style={styles.developmentText}>
            Tính năng tìm kiếm sẽ sớm được ra mắt
          </Text>
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
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  developmentTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  developmentText: {
    ...typography.body,
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default SearchScreen;
