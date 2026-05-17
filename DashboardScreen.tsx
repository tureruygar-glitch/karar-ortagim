import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, Decision } from "../types";
import { useAuthStore } from "../store/authStore";
import { useDecisionStore } from "../store/decisionStore";
import { DecisionCard } from "../components/DecisionCard";

export function DashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const { decisions, loading, subscribeToDecisions } = useDecisionStore();

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToDecisions(user.id);
      return unsubscribe;
    }
  }, [user]);

  const renderDecision = ({ item }: { item: Decision }) => (
    <DecisionCard
      decision={item}
      onPress={() =>
        navigation.navigate("DecisionDetail", { decisionId: item.id })
      }
    />
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-text text-lg font-semibold">
          Hoş geldin, {user?.displayName?.split(" ")[0]}
        </Text>
        <TouchableOpacity
          className="bg-card px-3 py-2 rounded-lg"
          onPress={() => navigation.navigate("Values")}
        >
          <Text className="text-primary text-sm font-medium">Değerlerim</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#6C63FF" className="flex-1" />
      ) : decisions.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-muted text-center text-lg mb-4">
            Henüz karar eklemedin
          </Text>
          <Text className="text-muted text-center">
            Önemli kararlarını yapay zeka ile analiz etmek için ilk kararını ekle
          </Text>
        </View>
      ) : (
        <FlatList
          data={decisions}
          renderItem={renderDecision}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pb-4"
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-primary w-14 h-14 rounded-full justify-center items-center shadow-lg"
        onPress={() => navigation.navigate("NewDecision")}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
