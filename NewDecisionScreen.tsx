import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useDecisionStore } from "../store/decisionStore";
import { analyzeDecision } from "../services/geminiService";
import { VoiceInput } from "../components/VoiceInput";
import type { GeminiAnalysisResponse } from "../types";

export function NewDecisionScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createDecision } = useDecisionStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [step, setStep] = useState<"input" | "analysis" | "confirm">("input");

  const handleAnalyze = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Hata", "Lütfen karar başlığı ve açıklamasını girin");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeDecision(description);
      setAnalysis(result);
      setStep("analysis");
    } catch (err) {
      Alert.alert("Hata", "Analiz sırasında bir sorun oluştu");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!user || !analysis) return;

    try {
      await createDecision(
        user.id,
        { title, description },
        analysis
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert("Hata", "Karar kaydedilemedi");
    }
  };

  if (analyzing) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text className="text-muted mt-4 text-center px-8">
          Yapay zeka kararını analiz ediyor...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-4">
      {step === "input" && (
        <>
          <Text className="text-text text-xl font-semibold mb-2">
            Kararın nedir?
          </Text>
          <Text className="text-muted mb-6">
            Önemli kararını yaz veya sesli olarak gir
          </Text>

          <TextInput
            className="bg-card text-text rounded-xl px-4 py-3 mb-4"
            placeholder="Karar başlığı"
            placeholderTextColor="#8888A0"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            className="bg-card text-text rounded-xl px-4 py-3 mb-4 h-32"
            placeholder="Kararını detaylıca açıkla..."
            placeholderTextColor="#8888A0"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <VoiceInput onTranscript={setDescription} />

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 mt-6"
            onPress={handleAnalyze}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Analiz Et
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === "analysis" && analysis && (
        <>
          <Text className="text-text text-xl font-semibold mb-4">Analiz Sonucu</Text>

          <View className="bg-card rounded-xl p-4 mb-6">
            <Text className="text-muted text-sm mb-2">Tespit Edilen Değerler</Text>
            <View className="flex-row flex-wrap gap-2">
              {analysis.values.map((v) => (
                <View
                  key={v.name}
                  className="bg-primary/20 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-primary text-sm">
                    {v.name} ({v.score}/10)
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-card rounded-xl p-4 mb-6">
            <Text className="text-muted text-sm mb-2">Analiz</Text>
            <Text className="text-text">{analysis.analysis}</Text>
          </View>

          <View className="bg-card rounded-xl p-4 mb-6">
            <Text className="text-muted text-sm mb-2">Yönlendirici Sorular</Text>
            {analysis.followUpQuestions.map((q, i) => (
              <Text key={i} className="text-text mb-2">
                • {q}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 mb-4"
            onPress={handleConfirm}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Kaydet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-card rounded-xl py-4"
            onPress={() => setStep("input")}
          >
            <Text className="text-muted text-center">Düzenle</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
