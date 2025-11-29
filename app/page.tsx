"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import NavbarFloating from "@/components/layout/NavbarFloating";
import GlassButton from "@/components/ui/GlassButton";
import GlowCard from "@/components/ui/GlowCard";
import { BackgroundLines } from "@/components/ui/background-lines";

export default function LandingPage() {
  return (
    <BackgroundLines className="min-h-screen bg-[#0D0D0E] dark:!bg-[#0D0D0E] relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
         
         
       
      </div>

      <div className="relative z-10">
      <NavbarFloating />

      {/* Hero Section */}
      <section className="relative pt-52 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Built on APTOS Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-blue-500/60 hover:border-[#4F9EFF]/50 transition-all duration-300"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#4F9EFF] to-[#7ED4FF] animate-pulse" />
              <span className="text-md font-medium bg-gradient-to-r from-[#4F9EFF] to-[#7ED4FF] bg-clip-text text-transparent">
                Built on APTOS
              </span>
            </motion.div>

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
    

      {/* Workflow Examples */}
      

     
      </div>
    </BackgroundLines>
  );
}
