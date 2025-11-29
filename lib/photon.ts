/**
 * Photon API Integration
 * Based on Photon API documentation: https://www.notion.so/Photon-API-Integration-2ba68efb91578054b6b7f863a5c0028e
 * 
 * Photon uses API Key authentication, not Client ID
 * Base URL: https://stage-api.getstan.app/identity-service/api/v1
 */

const PHOTON_API_URL = process.env.NEXT_PUBLIC_PHOTON_API_URL || "https://stage-api.getstan.app/identity-service/api/v1";
const PHOTON_API_KEY = process.env.NEXT_PUBLIC_PHOTON_API_KEY || "";

export interface PhotonUser {
  id: string;
  wallet_address: string;
  email?: string;
  name?: string;
  created_at: string;
}

export interface PhotonAuthResponse {
  user: PhotonUser;
  access_token: string;
  refresh_token?: string;
  wallet: {
    photonUserId: string;
    walletAddress: string;
  };
}

export interface PhotonRewardEvent {
  event_id: string;
  event_type: string;
  client_user_id: string;
  campaign_id?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface PhotonRegisterRequest {
  provider: "jwt";
  data: {
    token: string; // JWT token from your backend
    client_user_id: string;
  };
}

/**
 * Check if Photon API is configured
 */
export function isPhotonAvailable(): boolean {
  return !!PHOTON_API_KEY;
}

/**
 * Register/Onboard a user using Custom JWT
 * This is the preferred method for onboarding users
 * 
 * @param jwtToken - JWT token issued by your backend system
 * @param clientUserId - Your internal user ID
 */
export async function registerPhotonUser(
  jwtToken: string,
  clientUserId: string
): Promise<PhotonAuthResponse | null> {
  try {
    if (!PHOTON_API_KEY) {
      throw new Error("Photon API Key not configured. Please set NEXT_PUBLIC_PHOTON_API_KEY.");
    }

    const response = await fetch(`${PHOTON_API_URL}/identity/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": PHOTON_API_KEY,
      },
      body: JSON.stringify({
        provider: "jwt",
        data: {
          token: jwtToken,
          client_user_id: clientUserId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `Registration failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      const { user, tokens, wallet } = result.data;
      return {
        user: {
          id: user.user.id,
          wallet_address: wallet.walletAddress,
          email: user.user.email,
          name: user.user.name,
          created_at: new Date().toISOString(),
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        wallet: {
          photonUserId: wallet.photonUserId,
          walletAddress: wallet.walletAddress,
        },
      };
    }

    return null;
  } catch (error: any) {
    console.error("Photon registration error:", error);
    throw error;
  }
}

/**
 * Connect wallet using Photon API with JWT
 * For demo/testing, you can generate a JWT at: http://jwtbuilder.jamiekurtz.com/
 * 
 * @param jwtToken - JWT token (can be generated for testing)
 * @param clientUserId - Your user ID
 */
export async function connectPhotonWallet(
  jwtToken?: string,
  clientUserId?: string
): Promise<PhotonAuthResponse | null> {
  try {
    // If JWT is provided, use it directly
    if (jwtToken && clientUserId) {
      return await registerPhotonUser(jwtToken, clientUserId);
    }

    // For client-side: Generate a simple JWT for demo purposes
    // In production, this should come from your backend
    if (typeof window !== "undefined") {
      // For demo: create a simple user ID
      const demoUserId = `user_${Date.now()}`;
      
      // In a real app, you would get the JWT from your backend
      // For now, we'll use a placeholder that needs to be replaced
      throw new Error(
        "JWT token required. Please generate a JWT from your backend or use http://jwtbuilder.jamiekurtz.com/ for testing."
      );
    }

    return null;
  } catch (error: any) {
    console.error("Photon wallet connection error:", error);
    throw error;
  }
}

/**
 * Disconnect Photon wallet (client-side cleanup)
 */
export async function disconnectPhotonWallet(): Promise<void> {
  // Photon API doesn't require explicit disconnect
  // Just clear local state
  if (typeof window !== "undefined") {
    // Clear any stored tokens
    localStorage.removeItem("photon_access_token");
    localStorage.removeItem("photon_refresh_token");
    localStorage.removeItem("photon_user");
  }
}

/**
 * Get current Photon user from stored data
 */
export async function getPhotonUser(): Promise<PhotonUser | null> {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("photon_user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error("Get Photon user error:", error);
    return null;
  }
}

/**
 * Trigger a rewarded campaign event via Photon API
 * Reference: https://www.notion.so/Photon-API-Integration-2ba68efb91578054b6b7f863a5c0028e
 * 
 * Photon automatically mints PAT tokens based on campaign rules
 */
export async function triggerPhotonRewardEvent(
  event: PhotonRewardEvent
): Promise<{ success: boolean; eventId?: string; tokenAmount?: number; error?: string }> {
  try {
    if (!PHOTON_API_KEY) {
      throw new Error("Photon API Key not configured");
    }

    const response = await fetch(`${PHOTON_API_URL}/attribution/events/campaign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": PHOTON_API_KEY,
      },
      body: JSON.stringify({
        event_id: event.event_id,
        event_type: event.event_type,
        client_user_id: event.client_user_id,
        campaign_id: event.campaign_id,
        metadata: event.metadata || {},
        timestamp: event.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        success: true,
        eventId: result.data.event_id,
        tokenAmount: result.data.token_amount,
      };
    }

    throw new Error("Invalid response from Photon API");
  } catch (error: any) {
    console.error("Photon reward event error:", error);
    return {
      success: false,
      error: error.message || "Failed to trigger reward event",
    };
  }
}

/**
 * Trigger an unrewarded campaign event
 * Updates user profile but issues 0 tokens
 */
export async function triggerPhotonUnrewardedEvent(
  event: PhotonRewardEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  // Same endpoint, but campaign_id should point to an unrewarded campaign
  return await triggerPhotonRewardEvent(event);
}

