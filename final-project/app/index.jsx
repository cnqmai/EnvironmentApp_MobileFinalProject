import React, { useCallback } from "react";
import { StyleSheet, FlatList, SafeAreaView } from "react-native";
import { Appbar, Headline } from "react-native-paper";
import { useRouter } from "expo-router";
import AQICard from "../components/AQICard";

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
        onPress={() => router.push({ pathname: "/details", params: item })}
      />
    ),
    [router]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Dashboard AQI" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <Headline style={styles.dashboardTitle}>AQI khu vực của tôi</Headline>

      <FlatList
        data={aqiData}
        renderItem={renderAQICard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  appbar: {
    backgroundColor: "#fff",
    elevation: 0,
  },
  appbarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 5,
    color: "#333",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default DashboardScreen;
