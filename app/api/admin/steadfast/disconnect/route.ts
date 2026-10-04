import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../../src/lib/serverAuth';
import { disconnectSteadfast } from '../../../../../src/lib/steadfast';

export async function POST(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: শুধুমাত্র অনুমোদিত অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।' },
      { status: 401 }
    );
  }

  try {
    const disconnectResult = await disconnectSteadfast();
    if (!disconnectResult.success) {
      return NextResponse.json(
        { success: false, error: disconnectResult.error || 'Steadfast configuration storage is unavailable.' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      connected: false,
      message: 'স্টেডফাস্ট সফলভাবে ডিসকানেক্ট করা হয়েছে।',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'ডিসকানেক্ট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
