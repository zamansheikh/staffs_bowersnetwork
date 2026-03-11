import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (authHeader) headers['Authorization'] = authHeader;

        console.log('[Staffs] Initiating singlepart upload proxy');

        const response = await fetch(
            'https://test.bowlersnetwork.com/api/cloud/upload/singlepart/requests/initiate',
            { method: 'POST', headers, body: JSON.stringify(body) }
        );

        console.log('[Staffs] upstream status (initiate):', response.status);

        if (response.status === 200 || response.status === 201) {
            const data = await response.json();
            return NextResponse.json(data, { status: 200 });
        } else if (response.status === 401 || response.status === 403) {
            const data = await response.json().catch(() => ({ errors: ['Unauthorized'] }));
            return NextResponse.json(data, { status: response.status });
        } else if ([400,409,422].includes(response.status)) {
            const data = await response.json().catch(() => ({ errors: ['Validation error'] }));
            return NextResponse.json(data, { status: response.status });
        }

        let errorData;
        try { errorData = await response.json(); }
        catch { errorData = { errors: [`Upstream error ${response.status}`] }; }
        return NextResponse.json(errorData, { status: response.status >= 400 && response.status < 600 ? response.status : 500 });
    } catch (error) {
        console.error('[Staffs] initiate proxy error', error);
        return NextResponse.json({ errors: ['Failed to initiate upload'] }, { status: 500 });
    }
}
