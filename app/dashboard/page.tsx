"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Play, MoreVertical, Clock, CheckCircle, XCircle } from "lucide-react";
import NavbarFloating from "@/components/layout/NavbarFloating";
import GlassButton from "@/components/ui/GlassButton";
import GlowCard from "@/components/ui/GlowCard";
import { supabase } from "@/lib/supabase";
import type { Workflow } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkflows();
    }
  }, [isAuthenticated]);

  const fetchWorkflows = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0E]">
        <NavbarFloating />
        <div className="flex items-center justify-center min-h-screen">
          <GlowCard className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to view your workflows.
            </p>
            <Link href="/auth">
              <GlassButton variant="primary">Connect Wallet</GlassButton>
            </Link>
          </GlowCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0E] pb-20">
      <NavbarFloating />
      
      <div className="max-w-7xl mx-auto pt-32 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Workflows</h1>
            <p className="text-gray-400">
              Create and manage your automation workflows
            </p>
          </div>
          <Link href="/builder/new">
            <GlassButton variant="primary" glow>
              <Plus className="mr-2" size={20} />
              New Workflow
            </GlassButton>
          </Link>
        </div>

        {/* Workflows Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F9EFF]"></div>
          </div>
        ) : workflows.length === 0 ? (
          <GlowCard className="p-12 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">
              No workflows yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first automation workflow to get started.
            </p>
            <Link href="/builder/new">
              <GlassButton variant="primary">
                <Plus className="mr-2" size={20} />
                Create Workflow
              </GlassButton>
            </Link>
          </GlowCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      {workflow.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={workflow.is_active ? "text-green-400" : "text-gray-400"}>
                        {workflow.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(workflow.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Link href={`/builder/${workflow.id}`} className="flex-1">
                      <GlassButton variant="secondary" className="w-full">
                        Edit
                      </GlassButton>
                    </Link>
                    <GlassButton variant="primary" className="flex-1">
                      <Play className="mr-2" size={16} />
                      Run
                    </GlassButton>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

