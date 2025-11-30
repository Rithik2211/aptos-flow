"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import GlassButton from "@/components/ui/GlassButton";
import { useAuthStore } from "@/stores/auth-store";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function NavbarFloating() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signOut, user } = useAuthStore();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/workflows", label: "Workflows" },
  ];

  // Don't show navbar on builder pages
  if (pathname?.startsWith("/builder")) {
    return null;
  }

  return (
    <div className="flex justify-center items-center">
      <motion.nav
        className="fixed top-5 -translate-x-1/2 w-[85%] max-w-4xl z-50 glass"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "22px",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between p-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group pl-2">
            <Image src={"/logo.png"} alt="AptosFlow" width={52} height={52} />
            <span className="text-2xl font-bold text-white">Aptos
              <span className="bg-gradient-to-r from-[#4F9EFF] to-[#7ED4FF] bg-clip-text text-transparent">
                Flow
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-lg font-medium transition-colors ${pathname === item.href
                  ? "text-[#4F9EFF]"
                  : "text-gray-300 hover:text-white"
                  }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F9EFF]"
                    layoutId="navbar-indicator"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Wallet className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">
                    {user?.wallet_address
                      ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                      : "Connected"}
                  </span>
                </div>
                <GlassButton variant="ghost" onClick={signOut}>
                  Sign Out
                </GlassButton>
              </>
            ) : (
              <Link href="/builder/new">
                <GlassButton variant="primary">Launch</GlassButton>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t border-white/10 px-6 py-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                  ? "text-[#4F9EFF] bg-[rgba(79,158,255,0.1)]"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10">
              {isAuthenticated ? (
                <>
                  {user?.wallet_address && (
                    <div className="text-xs text-gray-400 mb-2 px-3 py-2 truncate">
                      {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
                    </div>
                  )}
                  <GlassButton
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </GlassButton>
                </>
              ) : (
                <Link href="/builder/new" onClick={() => setIsMenuOpen(false)}>
                  <GlassButton variant="primary" className="w-full">
                    Launch
                  </GlassButton>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>
    </div>
  );
}

