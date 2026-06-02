import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate a unique 8-character simulation ID
    const simulationId = `NEV-${uuidv4().substring(0, 8).toUpperCase()}`;

    const payload = {
      ...body,
      simulationId,
    };

    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      console.error("Missing GOOGLE_SCRIPT_URL in environment variables.");
      return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
    }

    const googleResponse = await fetch(googleScriptUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await googleResponse.json();

    if (result.status === 'success') {
      return NextResponse.json({ success: true, simulationId, reportUrl: result.reportUrl });
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json({ success: false, message: "Failed to connect to reporting engine." }, { status: 500 });
  }
}