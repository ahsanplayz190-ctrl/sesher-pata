import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../../src/lib/serverAuth';
import { verifySteadfastCredentials, saveSteadfastCredentials } from '../../../../../src/lib/steadfast';

export async function POST(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: শুধুমাত্র অনুমোদিত অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { apiKey, secretKey } = body;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'API Key এবং Secret Key প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const verification = await verifySteadfastCredentials(String(apiKey).trim(), String(secretKey).trim());
    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'স্টেডফাস্ট ক্রিডেনশিয়ালস সঠিক নয়।' },
        { status: 400 }
      );
    }

    const saveResult = await saveSteadfastCredentials(String(apiKey).trim(), String(secretKey).trim());
    if (!saveResult.success) {
      return NextResponse.json(
        { success: false, error: saveResult.error || 'Steadfast configuration storage is unavailable.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      connected: true,
      balance: verification.balance ?? 0,
      message: 'স্টেডফাস্ট সফলভাবে কানেক্ট ও এনক্রিপ্ট হয়ে সংরক্ষিত হয়েছে!',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'সার্ভারে অভ্যন্তরীণ ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
