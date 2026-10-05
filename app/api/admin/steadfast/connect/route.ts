import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../../src/lib/serverAuth';

export async function POST(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: শুধুমাত্র অনুমোদিত অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।' },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'স্টেডফাস্ট ক্রিডেনশিয়ালস এখন সরাসরি সার্ভার পরিবেশ ভেরিয়েবল (.env)-এ কনফিগার করা থাকে।',
    },
    { status: 400 }
  );
}
