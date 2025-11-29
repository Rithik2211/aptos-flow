import { NextRequest, NextResponse } from "next/server";
import { registerPhotonUser } from "@/lib/photon";
import { createHmac } from "crypto";

/**
 * API Route: Register user with Photon using JWT
 * POST /api/auth/photon
 * 
 * Body: { email?: string, name?: string, clientUserId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, clientUserId } = body;

    if (!email && !name) {
      return NextResponse.json(
        { error: "Email or name is required" },
        { status: 400 }
      );
    }

    // Generate client user ID if not provided
    const userId = clientUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate JWT payload
    const jwtPayload = {
      user_id: userId,
      ...(email && { email }),
      ...(name && { name }),
    };

    // Generate JWT token
    // In production, this should be done on your backend with proper signing
    const jwtSecret = process.env.JWT_SECRET || "demo_secret_key_change_in_production";
    const jwtToken = generateJWT(jwtPayload, jwtSecret);

    // Register with Photon
    const result = await registerPhotonUser(jwtToken, userId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to register with Photon" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Photon registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate JWT token with proper HMAC-SHA256 signing
 */
function generateJWT(payload: any, secret: string): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + 3600, // 1 hour expiry
  };

  // Base64 URL encode
  const base64UrlEncode = (str: string): string => {
    return Buffer.from(str)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));

  // Create HMAC-SHA256 signature
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

