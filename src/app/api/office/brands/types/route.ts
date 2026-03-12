import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://test.bowlersnetwork.com/api';

// Handle GET (list types) and POST (create type)
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${API_BASE}/office/brands/types`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Brand types GET error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to fetch brand types' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Brand types proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE}/office/brands/types`, {
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
            console.error('Brand types POST error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to create brand type' },
                { status: response.status }
            );
        }

        // may not return body
        const text = await response.text();
        const data = text ? JSON.parse(text) : { success: true };
        return NextResponse.json(data);
    } catch (error) {
        console.error('Brand types POST proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}