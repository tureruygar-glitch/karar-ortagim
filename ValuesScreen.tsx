import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useDecisionStore } from "../store/decisionStore";
import type { ValueTag } from "../types";

export function ValuesScreen() {
  const navigation = useNavigation();
  const { decisions } = useDecisionStore();

  const aggregatedValues = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();

    decisions.forEach((d) => {
      d.values.forEach((v) => {
        const existing = map.get(v.name) || { total: 0, count: 0 };
        map.set(v.name, {
          total: existing.total + v.score,
          count: existing.count + 1,
        });
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        avgScore: Math.round(data.total / data.count),
        frequency: data.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [decisions]);

  const maxScore = Math.max(...aggregatedValues.map((v) => v.avgScore), 1);

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-4">
      <Text className="text-text text-xl font-semibold mb-2">Değerlerin</Text>
      <Text className="text-muted mb-6">
        Kararların üzerinden öne çıkan kişisel değerlerin
      </Text>

      {aggregatedValues.length === 0 ? (
        <View className="items-center mt-12">
          <Text className="text-muted text-center">
            Değer analizi için henüz karar eklemedin
          </Text>
        </View>
      ) : (
        aggregatedValues.map((value, index) => (
          <View key={value.name} className="mb-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-text font-medium capitalize">
                {value.name.replace(/_/g, " ")}
              </Text>
              <Text className="text-primary font-semibold">
                {value.avgScore}/10
              </Text>
            </View>

            <View className="bg-surface rounded-full h-3">
              <View
                className="bg-primary h-3 rounded-full"
                style={{
                  width: `${(value.avgScore / maxScore) * 100}%`,
                }}
              />
            </View>

            <Text className="text-muted text-xs mt-1">
              {value.frequency} kararda yer aldı
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity
        className="bg-card rounded-xl py-4 mt-6 mb-8"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-muted text-center">Geri Dön</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
