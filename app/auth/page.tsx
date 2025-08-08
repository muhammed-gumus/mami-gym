"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signUp, signIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        alert("Kayıt başarılı! Email adresinizi kontrol edin.");
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-300 text-black">
      <div className="w-full max-w-md mx-auto p-6 shadow-xl rounded-xl bg-white/90">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </h1>
        </div>
        <div className="p-6 rounded-lg bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black bg-gray-50"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black bg-gray-50"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm font-medium animate-shake">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-lg font-bold bg-black text-white hover:bg-gray-800 rounded"
            >
              {loading
                ? "İŞLEM YAPILIYOR..."
                : isLogin
                ? "GİRİŞ YAP"
                : "KAYIT OL"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            {isLogin ? (
              <button
                onClick={() => setIsLogin(false)}
                className="text-sm text-gray-600 hover:text-black"
              >
                Hesabınız yok mu? <span className="underline">Kayıt olun</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLogin(true)}
                className="text-sm text-gray-600 hover:text-black"
              >
                Zaten hesabınız var mı?{" "}
                <span className="underline">Giriş yapın</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
