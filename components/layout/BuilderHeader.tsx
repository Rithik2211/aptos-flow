"use client";

import Link from "next/link";
import Image from "next/image";
import { Save, Play } from "lucide-react";
import GlassButton from "@/components/ui/GlassButton";

interface BuilderHeaderProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
}

export default function BuilderHeader({
  workflowName,
  onWorkflowNameChange,
  onSave,
  onRun,
}: BuilderHeaderProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 border-b border-white/10"
      style={{
        background: "rgba(13, 13, 14, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo and Name on Left */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src={"/logo.png"} alt="AptosFlow" width={50} height={50} />
          <span className="text-2xl font-bold text-white">
            Aptos
            <span className="bg-gradient-to-r from-[#4F9EFF] to-[#7ED4FF] bg-clip-text text-transparent">
              Flow
            </span>
          </span>
        </Link>

        {/* Workflow Name in Center */}
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            className="bg-transparent text-xl font-semibold text-white border-none outline-none text-center max-w-md w-full"
            placeholder="Untitled Workflow"
          />
        </div>

        {/* Save and Run Buttons on Right */}
        <div className="flex items-center gap-3">
          <GlassButton variant="secondary" onClick={onSave} className="min-w-[120px] p-2 flex justify-center items-center">
            <Save className="mr-2" size={18} />
            Save
          </GlassButton>
          <GlassButton variant="primary" onClick={onRun} className="min-w-[120px] p-2 flex justify-center items-center">
            <Play className="mr-2" size={18} />
            Run
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

