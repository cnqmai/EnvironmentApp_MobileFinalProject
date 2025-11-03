import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, FlatList, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AQICard from "../../components/AQICard";
import typography from "../../styles/typography";
import { getAqiForSavedLocations } from "../../src/services/locationService";
import * as ExpoLocation from "expo-location";
import { getAqiByGps } from "../../src/services/aqiService";

const fallbackAqi = [
  {
    id: "fallback-1",
    location: { name: "Quận 7", city: "TP. Hồ Chí Minh" },
    aqi: 152,
    description: "Không tốt cho nhóm nhạy cảm",
    isSensitiveGroup: true,
  },
];

const DashboardScreen = () => {
  const router = useRouter();
  const [aqiData, setAqiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myLocationAqi, setMyLocationAqi] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const items = await getAqiForSavedLocations();
        // Kỳ vọng backend trả danh sách { id, locationName, locationCity, aqi, isSensitiveGroup }
        const mapped = Array.isArray(items)
          ? items.map((it, idx) => ({
              id: String(it.id ?? idx),
              location: { name: it.locationName || it.name || "Unknown", city: it.locationCity || it.city || "Unknown" },
              aqi: it.aqi ?? 0,
              description: it.description || "",
              isSensitiveGroup: Boolean(it.isSensitiveGroup),
            }))
          : [];
        if (mounted) setAqiData(mapped.length ? mapped : fallbackAqi);
      } catch (e) {
        console.error(e);
        if (mounted) setAqiData(fallbackAqi);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
        const resp = await getAqiByGps(pos.coords.latitude, pos.coords.longitude);
        if (!mounted) return;
        setMyLocationAqi({
          location: { name: resp?.locationName || "Vị trí của tôi", city: resp?.city || "" },
          aqi: resp?.aqi ?? 0,
          description: resp?.description || "",
          isSensitiveGroup: Boolean(resp?.isSensitiveGroup),
        });
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

      <Text style={styles.dashboardTitle}>AQI khu vực của tôi{loading ? " (đang tải)" : ""}</Text>

      {myLocationAqi ? (
        <View style={{ paddingHorizontal: 4 }}>
          <AQICard
            location={myLocationAqi.location}
            aqi={myLocationAqi.aqi}
            description={myLocationAqi.description}
            isSensitiveGroup={myLocationAqi.isSensitiveGroup}
            onPress={() =>
              router.push({
                pathname: "/detail",
                params: {
                  locationName: myLocationAqi.location.name,
                  locationCity: myLocationAqi.location.city,
                  aqi: myLocationAqi.aqi,
                  isSensitiveGroup: myLocationAqi.isSensitiveGroup,
                },
              })
            }
          />
        </View>
      ) : null}

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
    paddingBottom: 120,
    paddingTop: 16,
    paddingHorizontal: 4,
    flexGrow: 1,
    minHeight: 200,
  },
});

export default DashboardScreen;
