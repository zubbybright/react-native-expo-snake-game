import { Text, StyleSheet, View } from "react-native";
import { Colors } from "../styles/colors";

interface StatsProps {
  score: number;
  level: number;
}

export default function Stats({ score, level }: StatsProps): JSX.Element {
  return (
    <View>
      <Text style={styles.text}>score: {score}</Text>
      <Text style={styles.text}>level: {level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary,
  },
});
