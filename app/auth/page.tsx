"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Wallet, Mail, ArrowRight, User } from "lucide-react";
import NavbarFloating from "@/components/layout/NavbarFloating";
import GlassButton from "@/components/ui/GlassButton";
import GlowCard from "@/components/ui/GlowCard";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { isPhotonAvailable } from "@/lib/photon";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [photonAvailable, setPhotonAvailable] = useState(false);
  const router = useRouter();
  const { signInWithPhoton } = useAuthStore();

  useEffect(() => {
    // Check if Photon API is configured
    if (typeof window !== "undefined") {
      setPhotonAvailable(isPhotonAvailable());
    }
  }, []);

  const handlePhotonLogin = async () => {
    if (!email && !name) {
      setMessage("Please enter your email or name");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Call backend API to generate JWT and register with Photon
      const response = await fetch("/api/auth/photon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || undefined,
          name: name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || `Failed to register with Photon (${response.status})`;
        console.error("Photon API error:", { status: response.status, data });
        throw new Error(errorMsg);
      }

      if (data.success && data.data) {
        const result = data.data;

        // Store tokens
        if (typeof window !== "undefined") {
          localStorage.setItem("photon_access_token", result.access_token);
          if (result.refresh_token) {
            localStorage.setItem("photon_refresh_token", result.refresh_token);
          }
          localStorage.setItem("photon_user", JSON.stringify(result.user));
        }

        // Sign in with Photon and save to Supabase
        await signInWithPhoton(result);
        setMessage("Account created successfully! Redirecting to builder...");

        // Redirect to builder page
        setTimeout(() => {
          router.push("/builder/new");
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Photon login error:", error);
      setMessage(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupabaseLogin = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      setMessage("Check your email for the magic link!");
    } catch (error: any) {
      setMessage(error.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0E] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F9EFF] rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <NavbarFloating />

      <div className="flex items-center justify-center min-h-screen pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlowCard className="p-8" intensity="high">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Connect Your Wallet
              </h1>
              <p className="text-gray-400">
                Sign in with Photon or use email magic link
              </p>
            </div>

            {/* Photon Login */}
            <div className="mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass px-4 py-3 rounded-lg text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#4F9EFF]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass px-4 py-3 rounded-lg text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#4F9EFF]"
                    placeholder="yourname@example.com"
                  />
                </div>
              </div>

              <GlassButton
                variant="primary"
                className="w-full text-center flex items-center justify-center mt-4"
                onClick={handlePhotonLogin}
                disabled={isLoading || !photonAvailable || (!email && !name)}
              >
                <Wallet className="mr-2" size={20} />
                {isLoading ? "Creating account..." : "Create Account with Photon"}
              </GlassButton>
              {!photonAvailable && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Photon API not configured. Add NEXT_PUBLIC_PHOTON_API_KEY to your .env.local
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2 text-center">
                Enter your name or email to create an account. A wallet will be automatically created for you.
              </p>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[rgba(255,255,255,0.05)] text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Login */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass px-4 py-3 rounded-lg text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#4F9EFF]"
                  placeholder="yourname@example.com"
                />
              </div>
              <GlassButton
                variant="secondary"
                className="w-full text-center flex items-center justify-center"
                onClick={handleSupabaseLogin}
                disabled={isLoading}
              >
                <Mail className="mr-2" size={20} />
                {isLoading ? "Sending..." : "Send Magic Link"}
                {!isLoading && <ArrowRight className="ml-2" size={20} />}
              </GlassButton>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 rounded-lg bg-[rgba(79,158,255,0.1)] border border-[rgba(79,158,255,0.3)] text-sm text-[#7ED4FF]"
              >
                {message}
              </motion.div>
            )}

            <p className="mt-6 text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}

