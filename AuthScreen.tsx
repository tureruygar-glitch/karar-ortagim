import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../store/authStore";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { login, register, loading } = useAuthStore();

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center px-8">
        <Text className="text-4xl font-bold text-primary text-center mb-2">
          Karar Ortağım
        </Text>
        <Text className="text-muted text-center mb-12">
          Önemli kararlarını yapay zeka ile analiz et
        </Text>

        {!isLogin && (
          <TextInput
            className="bg-card text-text rounded-xl px-4 py-3 mb-4"
            placeholder="Ad Soyad"
            placeholderTextColor="#8888A0"
            value={displayName}
            onChangeText={setDisplayName}
          />
        )}

        <TextInput
          className="bg-card text-text rounded-xl px-4 py-3 mb-4"
          placeholder="E-posta"
          placeholderTextColor="#8888A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          className="bg-card text-text rounded-xl px-4 py-3 mb-8"
          placeholder="Şifre"
          placeholderTextColor="#8888A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 mb-4"
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? "Yükleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text className="text-muted text-center">
            {isLogin ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
