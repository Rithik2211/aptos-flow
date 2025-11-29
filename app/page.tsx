"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import NavbarFloating from "@/components/layout/NavbarFloating";
import GlassButton from "@/components/ui/GlassButton";
import GlowCard from "@/components/ui/GlowCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0E] relative overflow-hidden">
      {/* Background gradient animation */}
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
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7ED4FF] rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <NavbarFloating />

      {/* Hero Section */}
      <section className="relative pt-60 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Launch {" "}
              
              <span className="bg-gradient-to-r from-[#4F9EFF] to-[#7ED4FF] bg-clip-text text-transparent">
              Aptos {" "}
              </span>
              <br />
              Automations, In{" "}
              <span className="relative inline-block ">
                Minutes.
                {/* Thick gradient underline (red to purple) with curved bend */}
                <svg 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-2"
                  viewBox="0 0 100 3"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="90%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 0 2 Q 50 0, 100 2" 
                    stroke="url(#underlineGradient)" 
                    strokeWidth="2.5" 
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Thinner red line beneath on the left with curve */}
                <svg 
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-1/2 h-1.5"
                  viewBox="0 0 100 2"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M 0 1.5 Q 50 0, 100 1.5" 
                    stroke="#ef4444" 
                    strokeWidth="1" 
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Automate trades, payments, rewards, and identity-gated actions with a simple drag-and-drop builder.
            </p>
            <Link href="/builder/new">
              <GlassButton variant="primary" glow className="text-lg px-8 py-4">
                Start Building
                <ArrowRight className="ml-2 inline-block" size={20} />
              </GlassButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Why AptosFlow?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "No-Code Builder",
                description: "Drag and drop nodes to create complex automation workflows without writing code.",
              },
              {
                icon: Shield,
                title: "Secure & Trustless",
                description: "All transactions execute on-chain with your wallet. You maintain full control.",
              },
              {
                icon: TrendingUp,
                title: "DeFi Integration",
                description: "Connect to Decibel for trading, Photon for rewards, and Aptos for transfers.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard className="p-6 h-full">
                  <feature.icon className="w-10 h-10 text-[#4F9EFF] mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Examples */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Automated Workflow Examples
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Price Alert Trading",
                description: "Monitor token prices and automatically execute trades when thresholds are met.",
                steps: ["Price Trigger", "Conditional Logic", "Decibel Trade"],
              },
              {
                title: "Reward Distribution",
                description: "Automatically distribute rewards to users based on on-chain events.",
                steps: ["Webhook Trigger", "Photon Reward", "Aptos Transfer"],
              },
              {
                title: "Scheduled Payments",
                description: "Set up recurring payments or transfers on a schedule.",
                steps: ["Schedule Trigger", "Aptos Transfer"],
              },
            ].map((example, index) => (
              <motion.div
                key={example.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard className="p-6 h-full">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {example.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{example.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {example.steps.map((step) => (
                      <span
                        key={step}
                        className="text-xs px-3 py-1 rounded-full bg-[rgba(79,158,255,0.2)] text-[#7ED4FF]"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlowCard className="p-12" intensity="high">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Automate Your DeFi Workflows?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start building your first automation workflow in minutes.
              </p>
              <Link href="/builder/new">
                <GlassButton variant="primary" glow className="text-lg px-8 py-4">
                  Get Started
                  <ArrowRight className="ml-2 inline-block" size={20} />
                </GlassButton>
              </Link>
            </GlowCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
