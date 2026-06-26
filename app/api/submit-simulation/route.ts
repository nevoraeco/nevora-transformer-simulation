import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enterprise Serverless Route Handler
 * Manages the secure handoff between the Next.js client environment
 * and the Google Apps Script proposal generation backend.
 */
export async function POST(request: Request) {
  try {
    // 1. Parse incoming request safely
    const body = await request.json();

    // 2. Strict Input Validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: "Invalid payload format." },
        { status: 400 }
      );
    }

    if (!body.communityName || !body.address || !body.totalFlats) {
      return NextResponse.json(
        { success: false, error: "Missing required community identifiers." },
        { status: 400 }
      );
    }

    // 3. Generate Enterprise Audit ID (e.g., NEV-A1B2C3D4)
    const simulationId = `NEV-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 4. Construct sanitized payload
    const payload = {
      simulationId,
      communityName: body.communityName,
      address: body.address,
      totalFlats: Number(body.totalFlats),
      maxExtra33: Number(body.maxExtra33) || 0,
      timestamp: new Date().toISOString(),
      // Add any other strictly required fields here. Do not spread the raw body.
    };

    // 5. Verify Backend Connection
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      console.error(`[FATAL] Missing GOOGLE_SCRIPT_URL. Simulation ID: ${simulationId}`);
      return NextResponse.json(
        { success: false, error: "Internal server configuration error." },
        { status: 500 }
      );
    }

    // 6. Execute Remote Generation via Google Apps Script
    const googleResponse = await fetch(googleScriptUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Simulation-ID': simulationId, // Enterprise Traceability Header
        'X-Client-Platform': 'Nevora-Ecovolt-NextJS',
      },
      // Optional: Prevent fetch from hanging indefinitely (timeout handling)
      signal: AbortSignal.timeout(15000), 
    });

    // 7. Handle Google Apps Script Response
    if (!googleResponse.ok) {
      throw new Error(`Google Script HTTP Error: ${googleResponse.status}`);
    }

    const result = await googleResponse.json();

    if (result.status === 'success' && result.reportUrl) {
      // Successful Handoff
      return NextResponse.json({ 
        success: true, 
        simulationId, 
        reportUrl: result.reportUrl 
      });
    } else {
      // Controlled Rejection from Google Apps Script
      throw new Error(result.message || "Failed to compile the dynamic report document.");
    }

  } catch (error) {
    // 8. Sanitized Error Logging
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    console.error(`[API Error - Submit Simulation] ${errorMessage}`);
    
    return NextResponse.json(
      { success: false, error: "Failed to connect to the document generation engine. Please try again later." },
      { status: 500 }
    );
  }
}