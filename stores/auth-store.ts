import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/supabase";
import type { PhotonAuthResponse } from "@/lib/photon";
import { disconnectPhotonWallet, getPhotonUser } from "@/lib/photon";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  photonUser: PhotonAuthResponse | null;
  
  // Actions
  setUser: (user: User | null) => void;
  signIn: () => Promise<void>;
  signInWithPhoton: (photonAuth: PhotonAuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  photonUser: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  signIn: async () => {
    // Fallback to Supabase magic link
    const { error } = await supabase.auth.signInWithOtp({
      email: "user@example.com", // Placeholder
    });
    if (error) {
      console.error("Sign in error:", error);
    }
  },

  signInWithPhoton: async (photonAuth: PhotonAuthResponse) => {
    try {
      // Store Photon auth in state
      set({ photonUser: photonAuth, isAuthenticated: true });

      // Create or update user in Supabase users table
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("photon_id", photonAuth.user.id)
        .single();

      const userData = {
        photon_id: photonAuth.user.id,
        wallet_address: photonAuth.wallet.walletAddress,
        email: photonAuth.user.email,
        name: photonAuth.user.name,
        updated_at: new Date().toISOString(),
      };

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update(userData)
          .eq("photon_id", photonAuth.user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        if (updatedUser) {
          set({ user: updatedUser });
        }
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            ...userData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newUser) {
          set({ user: newUser });
        }
      }
    } catch (error) {
      console.error("Photon sign in error:", error);
      throw error;
    }
  },

  signOut: async () => {
    // Disconnect Photon wallet
    await disconnectPhotonWallet();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    set({ 
      user: null, 
      isAuthenticated: false,
      photonUser: null,
    });
  },

  checkAuth: async () => {
    try {
      // Check for stored Photon user in localStorage
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("photon_user");
        if (storedUser) {
          try {
            const photonUser = JSON.parse(storedUser);
            // Fetch user from Supabase by photon_id
            const { data: userData, error } = await supabase
              .from("users")
              .select("*")
              .eq("photon_id", photonUser.id)
              .single();

            if (userData && !error) {
              set({ user: userData, isAuthenticated: true, isLoading: false });
              return;
            }
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
      }

      // Fallback: Check Supabase users table for any existing user
      // This handles cases where user was created but localStorage was cleared
      if (typeof window !== "undefined") {
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .limit(1)
          .order("created_at", { ascending: false });

        if (users && users.length > 0 && !error) {
          set({ user: users[0], isAuthenticated: true, isLoading: false });
          return;
        }
      }

      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("Auth check error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

