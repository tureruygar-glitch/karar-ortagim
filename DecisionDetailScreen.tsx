import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types";
import { useDecisionStore } from "../store/decisionStore";

export function DecisionDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "DecisionDetail">>();
  const navigation = useNavigation();
  const { decisions, updateDecision, recordRegret, deleteDecision } =
    useDecisionStore();

  const decision = decisions.find((d) => d.id === route.params.decisionId);

  const [regretMode, setRegretMode] = useState(false);
  const [regretScore, setRegretScore] = useState(5);
  const [regretNotes, setRegretNotes] = useState("");

  if (!decision) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted">Karar bulunamadı</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Kararı Sil", "Bu kararı silmek istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await deleteDecision(decision.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleRegretSubmit = async () => {
    await recordRegret(decision.id, regretScore, regretNotes);
    setRegretMode(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-4">
      <Text className="text-text text-2xl font-bold mb-2">{decision.title}</Text>
      <Text className="text-muted text-sm mb-4">{formatDate(decision.createdAt)}</Text>

      <View className="bg-card rounded-xl p-4 mb-4">
        <Text className="text-muted text-sm mb-2">Karar</Text>
        <Text className="text-text">{decision.description}</Text>
      </View>

      <View className="bg-card rounded-xl p-4 mb-4">
        <Text className="text-muted text-sm mb-2">Değerler</Text>
        <View className="flex-row flex-wrap gap-2">
          {decision.values.map((v, i) => (
            <View key={i} className="bg-primary/20 px-3 py-1.5 rounded-full">
              <Text className="text-primary text-sm">
                {v.name} ({v.score}/10)
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-card rounded-xl p-4 mb-4">
        <Text className="text-muted text-sm mb-2">AI Analizi</Text>
        <Text className="text-text">{decision.analysis}</Text>
      </View>

      {decision.followUpQuestions.length > 0 && (
        <View className="bg-card rounded-xl p-4 mb-4">
          <Text className="text-muted text-sm mb-2">Yönlendirici Sorular</Text>
          {decision.followUpQuestions.map((q, i) => (
            <Text key={i} className="text-text mb-2">
              • {q}
            </Text>
          ))}
        </View>
      )}

      {decision.regretScore !== undefined && (
        <View className="bg-card rounded-xl p-4 mb-4">
          <Text className="text-muted text-sm mb-2">3 Ay Sonrası Durum</Text>
          <Text className="text-text mb-2">
            Pişmanlık Skoru: {decision.regretScore}/10
          </Text>
          {decision.regretNotes && (
            <Text className="text-muted">{decision.regretNotes}</Text>
          )}
        </View>
      )}

      {decision.status !== "completed" && !regretMode && (
        <TouchableOpacity
          className="bg-accent rounded-xl py-4 mb-4"
          onPress={() => setRegretMode(true)}
        >
          <Text className="text-white text-center font-semibold">
            3 Ay Geçti - Durumu Güncelle
          </Text>
        </TouchableOpacity>
      )}

      {regretMode && (
        <View className="bg-card rounded-xl p-4 mb-4">
          <Text className="text-text font-semibold mb-4">
            Şu an bu karar hakkında ne düşünüyorsun?
          </Text>

          <Text className="text-muted mb-2">
            Pişmanlık derecesi: {regretScore}/10
          </Text>
          <View className="flex-row justify-between mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <TouchableOpacity
                key={n}
                className={`w-7 h-7 rounded-full justify-center items-center ${
                  n <= regretScore ? "bg-accent" : "bg-surface"
                }`}
                onPress={() => setRegretScore(n)}
              >
                <Text className="text-white text-xs">{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="bg-surface text-text rounded-xl px-4 py-3 mb-4"
            placeholder="Notların... (opsiyonel)"
            placeholderTextColor="#8888A0"
            multiline
            value={regretNotes}
            onChangeText={setRegretNotes}
          />

          <TouchableOpacity
            className="bg-primary rounded-xl py-3 mb-2"
            onPress={handleRegretSubmit}
          >
            <Text className="text-white text-center font-semibold">Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setRegretMode(false)}>
            <Text className="text-muted text-center">İptal</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        className="bg-surface rounded-xl py-4 mb-8"
        onPress={handleDelete}
      >
        <Text className="text-accent text-center font-semibold">Kararı Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
