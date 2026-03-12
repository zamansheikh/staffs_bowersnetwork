import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://test.bowlersnetwork.com/api';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE}/office/brands/${id}/change-logo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Change logo error:', response.status, errorText);
            return NextResponse.json({ error: 'Failed to change logo' }, { status: response.status });
        }

        // response might be empty
        const text = await response.text();
        const data = text ? JSON.parse(text) : { success: true };
        return NextResponse.json(data);
    } catch (error) {
        console.error('Change logo proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}