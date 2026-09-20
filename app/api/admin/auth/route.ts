import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCredentials,
  createSessionToken,
  isRequestAuthorized,
  ADMIN_COOKIE_NAME,
} from '../../../../src/lib/serverAuth';

export async function GET(request: NextRequest) {
  const authenticated = isRequestAuthorized(request);
  return NextResponse.json({ authenticated });
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // Handle Logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'লগআউট সম্পন্ন হয়েছে' });
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      return response;
    }

    // Handle Login
    const body = await request.json();
    const { username, password, remember } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { error: 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }

    const isValid = verifyCredentials(String(username), String(password));
    if (!isValid) {
      return NextResponse.json(
        { error: 'ভুল ইউজারনেম বা পাসওয়ার্ড প্রদান করেছেন!' },
        { status: 401 }
      );
    }

    // 7 days for remember, 1 day for non-remember
    const maxAgeSeconds = remember ? 86400 * 7 : 86400;
    const token = createSessionToken(maxAgeSeconds);

    const response = NextResponse.json({
      success: true,
      message: 'স্বাগতম! অ্যাডমিন প্যানেলে সফলভাবে প্রবেশ করেছেন',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      path: '/',
      maxAge: maxAgeSeconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('[Admin Auth Error]:', err);
    return NextResponse.json(
      { error: 'সার্ভারে অভ্যন্তরীণ সমস্যা দেখা দিয়েছে' },
      { status: 500 }
    );
  }
}
