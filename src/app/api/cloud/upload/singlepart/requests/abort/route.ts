import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (authHeader) headers['Authorization'] = authHeader;

        console.log('[Staffs] Aborting singlepart upload proxy');
        const response = await fetch(
            'https://test.bowlersnetwork.com/api/cloud/upload/singlepart/requests/abort',
            { method: 'POST', headers, body: JSON.stringify(body) }
        );
        console.log('[Staffs] upstream status (abort):', response.status);
        if (response.status === 200 || response.status === 204) {
            try {
                const data = response.status === 204 ? { message: 'Aborted' } : await response.json();
                return NextResponse.json(data, { status: 200 });
            } catch {
                return NextResponse.json({ message: 'Aborted' }, { status: 200 });
            }
        }
        let errorData;
        try { errorData = await response.json(); }
        catch { errorData = { errors: [`Upstream error ${response.status}`] }; }
        return NextResponse.json(errorData, { status: response.status >= 400 && response.status < 600 ? response.status : 500 });
    } catch (error) {
        console.error('[Staffs] abort proxy error', error);
        return NextResponse.json({ errors: ['Failed to abort upload'] }, { status: 500 });
    }
}
