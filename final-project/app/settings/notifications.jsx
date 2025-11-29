import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const NotificationsScreen = () => {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [aqiAlerts, setAqiAlerts] = useState(true);
  const [recycleReminders, setRecycleReminders] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#0A0A0A"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Thông báo đẩy</Text>
                <Text style={styles.settingSubtext}>
                  Nhận thông báo về chất lượng không khí và hoạt động tái chế
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: "#E0E0E0", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Thông báo qua Email</Text>
                <Text style={styles.settingSubtext}>
                  Nhận bản tin và cập nhật qua email
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: "#E0E0E0", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Cảnh báo AQI</Text>
                <Text style={styles.settingSubtext}>
                  Nhận cảnh báo khi chất lượng không khí xấu
                </Text>
              </View>
            </View>
            <Switch
              value={aqiAlerts}
              onValueChange={setAqiAlerts}
              trackColor={{ false: "#E0E0E0", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Nhắc nhở tái chế</Text>
                <Text style={styles.settingSubtext}>
                  Nhận nhắc nhở về các hoạt động tái chế
                </Text>
              </View>
            </View>
            <Switch
              value={recycleReminders}
              onValueChange={setRecycleReminders}
              trackColor={{ false: "#E0E0E0", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>
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
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 44,
  },

  settingsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFED",
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flex: 1,
    paddingRight: 12,
  },
  settingContent: {},
  settingLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 6,
  },
  settingSubtext: {
    ...typography.small,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});

export default NotificationsScreen;
