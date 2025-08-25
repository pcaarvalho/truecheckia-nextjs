import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy checkout session endpoint
 * 
 * This endpoint exists for backward compatibility.
 * All new code should use /api/stripe/checkout for session creation
 * and /api/stripe/checkout?session_id=xxx for session retrieval.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');
  
  if (sessionId) {
    // Forward to the main checkout endpoint with session_id
    const response = await fetch(`${request.nextUrl.origin}/api/stripe/checkout?session_id=${sessionId}`, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('Cookie') || '',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  return NextResponse.json(
    { 
      error: 'This endpoint has been moved to /api/stripe/checkout',
      message: 'Use /api/stripe/checkout?session_id=xxx to retrieve session details',
      redirect: '/api/stripe/checkout'
    },
    { status: 301 }
  );
}

export async function POST(request: NextRequest) {
  // Forward POST requests to the main checkout endpoint
  const body = await request.text();
  
  const response = await fetch(`${request.nextUrl.origin}/api/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('Cookie') || '',
      'Authorization': request.headers.get('Authorization') || '',
    },
    body: body,
  });
  
  const data = await response.text();
  
  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}