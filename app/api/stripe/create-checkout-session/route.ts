import { NextRequest, NextResponse } from 'next/server';

/**
 * Redirect endpoint for legacy compatibility
 * 
 * This endpoint exists for backward compatibility with any frontend code
 * that might still be calling the old /create-checkout-session endpoint.
 * 
 * All new code should use /api/stripe/checkout instead.
 */
export async function POST(request: NextRequest) {
  // Extract the same request data
  const body = await request.text();
  
  // Forward to the main checkout endpoint
  const response = await fetch(`${request.nextUrl.origin}/api/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('Cookie') || '',
      'Authorization': request.headers.get('Authorization') || '',
    },
    body: body,
  });
  
  // Return the response from the main endpoint
  const data = await response.text();
  
  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'This endpoint has been moved to /api/stripe/checkout',
      redirect: '/api/stripe/checkout'
    },
    { status: 301 }
  );
}