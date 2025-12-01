import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const RedeemPoints = () => {
  const gifts = [
    { icon: <MaterialCommunityIcons name="ticket-percent" size={30} />, name: "Voucher Eco 50k", left: 45, point: 100 },
    { icon: <Feather name="shopping-bag" size={30} />, name: "Túi vải TC", left: 23, point: 200 },
    { icon: <Feather name="droplet" size={30} />, name: "Bình nước inox", left: 12, point: 350 },
    { icon: <Feather name="coffee" size={30} />, name: "Voucher Coffee 30k", left: 67, point: 80 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đổi quà</Text>

      <View style={styles.pointCard}>
        <Text style={styles.pointLabel}>Điểm hiện tại</Text>
        <Text style={styles.pointValue}>1,245</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {gifts.map((gift, i) => (
          <View key={i} style={styles.giftBox}>
            {gift.icon}
            <Text style={styles.giftName}>{gift.name}</Text>
            <Text>Còn {gift.left}</Text>
            <Text style={styles.price}>Giá: ⭐ {gift.point}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Đổi ngay</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

  pointCard: {
    backgroundColor: "#d84ce6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  pointLabel: { color: "#fff" },
  pointValue: { color: "#fff", fontSize: 26, fontWeight: "bold" },

  scrollContent: { paddingBottom: 20 },

  giftBox: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  giftName: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
  price: { marginTop: 4, fontWeight: "600" },

  button: {
    marginTop: 10,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});

<<<<<<< HEAD
export default RedeemPoints;
=======
export default RedeemPoints;
>>>>>>> test-merge
