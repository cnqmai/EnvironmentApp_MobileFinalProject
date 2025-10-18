import React, { useCallback } from "react";
import { StyleSheet, FlatList, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AQICard from "../components/AQICard";
import typography, { FONT_FAMILY } from "../styles/typography";

const aqiData = [
  {
    id: "1",
    location: { name: "Quận 7", city: "TP. Hồ Chí Minh" },
    aqi: 152,
    status: "Kém",
    description: "Không tốt cho nhóm nhạy cảm",
    isSensitiveGroup: true,
  },
  {
    id: "2",
    location: { name: "Bình Thạnh", city: "TP. Hồ Chí Minh" },
    aqi: 190,
    status: "Xấu",
    description: "Ảnh hưởng đến sức khỏe",
    isSensitiveGroup: false,
  },
  {
    id: "3",
    location: { name: "Gò Vấp", city: "TP. Hồ Chí Minh" },
    aqi: 50,
    status: "Tốt",
    description: "Bụi mịn thấp",
    isSensitiveGroup: false,
  },
];

const DashboardScreen = () => {
  const router = useRouter();

  const renderAQICard = useCallback(
    ({ item }) => (
      <AQICard
        location={item.location}
        aqi={item.aqi}
        description={item.description}
        isSensitiveGroup={item.isSensitiveGroup}
        onPress={() =>
          router.push({
            pathname: "/detail",
            params: {
              locationName: item.location.name,
              locationCity: item.location.city,
              aqi: item.aqi,
              isSensitiveGroup: item.isSensitiveGroup,
            },
          })
        }
      />
    ),
    [router]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <Text style={styles.dashboardTitle}>AQI khu vực của tôi</Text>

      <FlatList
        data={aqiData}
        renderItem={renderAQICard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.flatListStyle}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={3}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
    position: "relative",
  },
  header: {
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 0,
    zIndex: 2,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  dashboardTitle: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: "900",
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    color: "#0A0A0A",
    letterSpacing: -0.8,
    lineHeight: 42,
    zIndex: 1,
  },
  flatListStyle: {
    flex: 1,
    zIndex: 0,
  },
  listContent: {
    paddingBottom: 50,
    paddingTop: 16,
    paddingHorizontal: 4,
    flexGrow: 1,
    minHeight: 200,
  },
});

export default DashboardScreen;
