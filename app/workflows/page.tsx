"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Layout, Clock, ArrowRight, Trash2 } from "lucide-react";
import NavbarFloating from "@/components/layout/NavbarFloating";
import GlowCard from "@/components/ui/GlowCard";
import GlassButton from "@/components/ui/GlassButton";
import { supabase, Workflow } from "@/lib/supabase";
import { BackgroundLines } from "@/components/ui/background-lines";

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const { data, error } = await supabase
                .from("workflows")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setWorkflows(data || []);
        } catch (error) {
            console.error("Error fetching workflows:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteWorkflow = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this workflow?")) return;

        try {
            const { error } = await supabase
                .from("workflows")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setWorkflows(workflows.filter(w => w.id !== id));
        } catch (error) {
            console.error("Error deleting workflow:", error);
        }
    };

    const filteredWorkflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <BackgroundLines className="min-h-screen bg-[#0D0D0E] dark:!bg-[#0D0D0E] relative overflow-hidden">
            <NavbarFloating />

            <div className="relative z-10 pt-32 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">My Workflows</h1>
                        <p className="text-gray-400">Manage and monitor your automated strategies</p>
                    </div>

                    <Link href="/builder/new">
                        <GlassButton variant="primary" glow className="flex items-center gap-2">
                            <Plus size={20} />
                            Create New Workflow
                        </GlassButton>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4F9EFF]/50 transition-colors"
                    />
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredWorkflows.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layout className="text-gray-500" size={40} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No workflows yet</h3>
                        <p className="text-gray-400 mb-8">Create your first automated strategy to get started.</p>
                        <Link href="/builder/new">
                            <GlassButton variant="secondary">
                                Start Building
                            </GlassButton>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkflows.map((workflow) => (
                            <Link key={workflow.id} href={`/builder/${workflow.id}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <GlowCard className="h-full flex flex-col p-6 group cursor-pointer hover:border-[#4F9EFF]/30 transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${workflow.is_active
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-gray-500/10 text-gray-400"
                                                }`}>
                                                <Layout size={24} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${workflow.is_active
                                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                                    }`}>
                                                    {workflow.is_active ? "Active" : "Inactive"}
                                                </span>
                                                <button
                                                    onClick={(e) => deleteWorkflow(workflow.id, e)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#4F9EFF] transition-colors">
                                            {workflow.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1">
                                            {workflow.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(workflow.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1 text-[#4F9EFF] opacity-0 group-hover:opacity-100 transition-opacity">
                                                Edit Workflow <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </GlowCard>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </BackgroundLines>
    );
}
