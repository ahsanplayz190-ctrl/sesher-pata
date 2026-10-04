import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../src/lib/serverAuth';
import { serverConfig } from '../../../../src/server/config';
import {
  getSteadfastCredentials,
  verifySteadfastCredentials,
  saveSteadfastCredentials,
  disconnectSteadfast,
} from '../../../../src/lib/steadfast';

const STEADFAST_BASE_URL = serverConfig.steadfast.baseUrl.replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 15000;

function normalizePhoneNumber(phone: string): string {
  const bengaliNumerals: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  let normalized = String(phone || '').replace(/[০-৯]/g, (d) => bengaliNumerals[d] || d);
  let digits = normalized.replace(/[^\d]/g, '');
  if (digits.startsWith('880')) {
    digits = digits.substring(2);
  } else if (digits.startsWith('+880')) {
    digits = digits.substring(3);
  }
  return digits;
}

async function parseJsonResponse(res: Response): Promise<{ status?: number; message?: string; [key: string]: any }> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      status: res.status,
      message: text ? text.slice(0, 200) : `HTTP ${res.status} ${res.statusText}`,
    };
  }
}

export async function GET(request: NextRequest) {
  // 1. Authorization check
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: শুধুমাত্র অনুমোদিত অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // Action: Check Status
  if (action === 'status') {
    const creds = await getSteadfastCredentials();
    return NextResponse.json({
      connected: creds.isConnected,
      last_verified_at: creds.lastVerifiedAt || null,
    });
  }

  // Load server-side decrypted credentials
  const creds = await getSteadfastCredentials();

  // Action: Check Balance
  if (action === 'balance') {
    if (!creds.isConnected || !creds.apiKey || !creds.secretKey) {
      return NextResponse.json(
        { error: 'স্টেডফাস্ট একাউন্ট এখনও সংযুক্ত করা হয়নি। অনুগ্রহ করে সেটিংস থেকে API Key ও Secret Key দিয়ে কানেক্ট করুন।' },
        { status: 400 }
      );
    }

    const testResult = await verifySteadfastCredentials(creds.apiKey, creds.secretKey);
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        balance: testResult.balance ?? 0,
      });
    } else {
      return NextResponse.json(
        { success: false, error: testResult.error || 'ব্যালেন্স যাচাই ব্যর্থ হয়েছে।' },
        { status: 400 }
      );
    }
  }

  // Action: Track Order Status
  if (action === 'track') {
    if (!creds.isConnected || !creds.apiKey || !creds.secretKey) {
      return NextResponse.json(
        { error: 'স্টেডফাস্ট একাউন্ট এখনও সংযুক্ত করা হয়নি।' },
        { status: 400 }
      );
    }

    const trackingCode = searchParams.get('tracking_code');
    const invoice = searchParams.get('invoice');
    const cid = searchParams.get('consignment_id');

    let endpoint = '';
    if (trackingCode) {
      endpoint = `${STEADFAST_BASE_URL}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`;
    } else if (invoice) {
      endpoint = `${STEADFAST_BASE_URL}/status_by_invoice/${encodeURIComponent(invoice)}`;
    } else if (cid) {
      endpoint = `${STEADFAST_BASE_URL}/status_by_cid/${encodeURIComponent(cid)}`;
    } else {
      return NextResponse.json(
        { error: 'ট্র্যাকিং কোড, ইনভয়েস নম্বর অথবা কনসাইনমেন্ট আইডি প্রয়োজন।' },
        { status: 400 }
      );
    }

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Api-Key': creds.apiKey,
          'Secret-Key': creds.secretKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const data = await parseJsonResponse(res);
      if (res.ok && data.status === 200) {
        return NextResponse.json({
          success: true,
          delivery_status: data.delivery_status || data.status,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: data.message || 'ট্র্যাকিং তথ্য পাওয়া যায়নি।',
          },
          { status: 400 }
        );
      }
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: 'স্টেডফাস্ট সার্ভারে সংযোগ ত্রুটি: ' + (err?.message || '') },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: 'অকার্যকর রিকোয়েস্ট অ্যাকশন।' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  // 1. Authorization check
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: শুধুমাত্র অনুমোদিত অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json().catch(() => ({}));

    // Action: Connect Steadfast
    if (action === 'connect' || body.action === 'connect') {
      const { apiKey, secretKey } = body;
      if (!apiKey || !secretKey) {
        return NextResponse.json(
          { error: 'API Key এবং Secret Key প্রদান করা আবশ্যক।' },
          { status: 400 }
        );
      }

      // Step 1: Verify against Steadfast API before saving
      const verification = await verifySteadfastCredentials(String(apiKey).trim(), String(secretKey).trim());
      if (!verification.success) {
        return NextResponse.json(
          { success: false, error: verification.error || 'স্টেডফাস্ট ক্রিডেনশিয়ালস সঠিক নয়।' },
          { status: 400 }
        );
      }

      // Step 2: Encrypt and save in Supabase
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
    }

    // Action: Disconnect Steadfast
    if (action === 'disconnect' || body.action === 'disconnect') {
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
    }

    // Action: Create Order / Dispatch
    const creds = await getSteadfastCredentials();
    if (!creds.isConnected || !creds.apiKey || !creds.secretKey) {
      return NextResponse.json(
        { error: 'অর্ডার পাঠানোর জন্য প্রথমে স্টেডফাস্ট অ্যাকাউন্ট সংযুক্ত করুন।' },
        { status: 400 }
      );
    }

    const {
      invoice,
      recipient_name,
      recipient_phone,
      recipient_address,
      cod_amount,
      note,
    } = body;

    if (!recipient_name || !recipient_phone || !recipient_address) {
      return NextResponse.json(
        { error: 'গ্রাহকের নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhoneNumber(recipient_phone);
    if (!cleanPhone || cleanPhone.length < 11) {
      return NextResponse.json(
        { error: 'গ্রাহকের ১১ ডিজিটের সঠিক মোবাইল নম্বর প্রদান করুন।' },
        { status: 400 }
      );
    }

    const payload = {
      invoice: String(invoice || `SP-${Date.now()}`),
      recipient_name: String(recipient_name).trim(),
      recipient_phone: cleanPhone,
      recipient_address: String(recipient_address).trim(),
      cod_amount: Number(cod_amount) || 0,
      note: String(note || 'বই ডেলিভারি — শেষের পাতা').trim(),
    };

    const res = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': creds.apiKey,
        'Secret-Key': creds.secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = await parseJsonResponse(res);

    if (res.ok && (data.status === 200 || data.consignment)) {
      return NextResponse.json({
        success: true,
        message: data.message || 'স্টেডফাস্টে সফলভাবে পার্সেল বুক করা হয়েছে!',
        consignment: data.consignment,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || (data.errors ? JSON.stringify(data.errors) : 'পার্সেল বুক করতে সমস্যা হয়েছে।'),
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    const errorMsg = err?.name === 'TimeoutError'
      ? 'স্টেডফাস্ট সার্ভারে রিকোয়েস্টের সময়সীমা শেষ হয়েছে।'
      : 'স্টেডফাস্ট সার্ভার এরর: ' + (err?.message || 'অজানা সমস্যা');
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
