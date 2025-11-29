import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AQICard from "../../components/AQICard";
import DailySuggestion from "../../components/DailySuggestion";
import typography from "../../styles/typography";

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trang chủ</Text>
        </View>

        <DailySuggestion />

        <Text style={styles.dashboardTitle}>AQI khu vực của tôi</Text>

        {aqiData.map((item) => (
          <TouchableOpacity
            key={item.id}
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
            activeOpacity={0.9}
          >
            <AQICard
              location={item.location}
              aqi={item.aqi}
              description={item.description}
              isSensitiveGroup={item.isSensitiveGroup}
            />
          </TouchableOpacity>
        ))}
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
    paddingBottom: 120,
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
  dashboardTitle: {
    ...typography.h2,
    fontSize: 26,
    fontWeight: "700",
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
    color: "#0A0A0A",
    letterSpacing: -0.8,
    lineHeight: 42,
  },
});

export default DashboardScreen;
