import { NextResponse } from 'next/server';

/**
 * Enterprise API Route for Google Apps Script Handoff
 * Safely handles 302 Redirects, CORS preflight bypasses, and JSON parse failures.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // 1. Execute Handoff to Google Apps Script
    const response = await fetch(process.env.GOOGLE_SCRIPT_URL as string, {
      method: 'POST',
      // CRITICAL: Force 'text/plain' to bypass complex CORS preflight blocks
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify(payload),
      // CRITICAL: Forces Node to chase Google's 302 Redirect to the execution cluster
      redirect: 'follow', 
    });

    // 2. Intercept and sanitize the response before parsing
    const rawText = await response.text();
    
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      // If Google returns HTML (Auth Error / Script Error), catch it without a 500 crash
      console.error("[GOOGLE API MISMATCH] Received non-JSON response:", rawText.substring(0, 200));
      return NextResponse.json(
        { success: false, message: "Authentication or deployment error at the Google Apps Script level. Verify deployment is set to 'Anyone'." },
        { status: 502 } // 502 Bad Gateway
      );
    }

    // 3. Return clean payload to frontend
    if (!data.success) {
      return NextResponse.json({ success: false, message: data.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("[API Error - Submit Simulation] Failed to compile the dynamic report document:", error);
    return NextResponse.json(
      { success: false, message: "The serverless function crashed during the network handshake." },
      { status: 500 }
    );
  }
}