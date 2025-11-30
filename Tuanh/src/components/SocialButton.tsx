import React from "react";
import { TouchableOpacity, Image, Text, StyleSheet, View } from "react-native";
import colors from "../theme/colors";

interface Props {
  title: string;
  icon: any;
  onPress: () => void;
}

export default function SocialButton({ title, icon, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={{ width: 28 }}>
        <Image source={icon} style={styles.icon} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 28 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  icon: { width: 24, height: 24 },
  title: { fontSize: 15, fontWeight: "500" },
});
