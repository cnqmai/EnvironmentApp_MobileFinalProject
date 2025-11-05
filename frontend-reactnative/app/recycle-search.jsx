import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import typography from "../styles/typography";
import { getAllCategories } from "../src/services/categoryService";
import { searchWasteGuide } from "../src/services/recycleService";

const RecycleSearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        if (mounted) setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0A0A0A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Tìm kiếm</Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm loại rác, vật phẩm,..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            )}
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={async () => {
                  if (searching) return;
                  try {
                    setSearching(true);
                    const result = await searchWasteGuide(searchQuery);
                    if (result?.categoryType || result?.type || result?.category) {
                      const type = (result.categoryType || result.type || result.category).toLowerCase();
                      router.push({
                        pathname: "/recycle-guide",
                        params: {
                          type: type,
                          title: result.categoryName || result.name || searchQuery,
                          subtitle: result.description || result.guide || "",
                        },
                      });
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSearching(false);
                  }
                }}
                disabled={searching}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={searching ? "#8E8E93" : "#007AFF"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
        <View style={styles.filtersContainer}>
          {(loading ? [] : categories).map((cat) => (
            <TouchableOpacity
              key={cat.id || cat.code || cat.name}
              style={styles.filterChip}
              activeOpacity={0.7}
              onPress={() => {
                const raw = (cat.code || cat.name || "recyclable").toString().toLowerCase();
                const allowed = ["organic", "recyclable", "hazardous", "electronic", "glass", "textile"];
                const inferred = allowed.includes(raw)
                  ? raw
                  : raw.includes("hữu") ? "organic" : "recyclable";
                router.push({
                  pathname: "/recycle-guide",
                  params: {
                    type: inferred,
                    title: cat.name || cat.title || "Danh mục",
                  },
                });
              }}
            >
              <Text style={styles.filterText}>
                {cat.name || cat.title || "Danh mục"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          activeOpacity={0.9}
          onPress={() => router.push("/recycle-camera")}
        >
          <MaterialCommunityIcons name="camera" size={20} color="#0A0A0A" />
          <Text style={styles.cameraButtonText}>Không thấy? Thử chụp ảnh</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F0EFED",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: "700",
    color: "#0A0A0A",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    padding: 0,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 28,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipSelected: {
    backgroundColor: "#0A0A0A",
    borderColor: "#0A0A0A",
  },
  filterText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0A0A",
  },
  filterTextSelected: {
    color: "#FFFFFF",
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  cameraButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  bottomPadding: {
    height: 40,
  },
});

export default RecycleSearchScreen;
