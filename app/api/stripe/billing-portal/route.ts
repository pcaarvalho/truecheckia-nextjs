import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy billing portal endpoint
 * 
 * This endpoint exists for backward compatibility.
 * All new code should use /api/stripe/portal instead.
 */
export async function POST(request: NextRequest) {
  // Forward to the main portal endpoint
  const body = await request.text();
  
  const response = await fetch(`${request.nextUrl.origin}/api/stripe/portal`, {
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

export async function GET() {
  return NextResponse.json(
    { 
      error: 'This endpoint has been moved to /api/stripe/portal',
      redirect: '/api/stripe/portal'
    },
    { status: 301 }
  );
}