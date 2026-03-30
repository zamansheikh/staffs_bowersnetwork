import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://test.bowlersnetwork.com/api';

function getToken(request: NextRequest): string | undefined {
    return request.headers.get('authorization')?.replace('Bearer ', '') ||
        request.cookies.get('access_token')?.value;
}

async function parseResponseBody(response: Response): Promise<any> {
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
}

export async function GET(request: NextRequest) {
    try {
        const token = getToken(request);

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${API_BASE}/office/chatter/topics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Chatter topics GET error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to fetch topics' },
                { status: response.status }
            );
        }

        const data = await parseResponseBody(response);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chatter topics GET proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getToken(request);

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE}/office/chatter/topics`, {
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
            console.error('Chatter topics POST error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to create topic' },
                { status: response.status }
            );
        }

        const data = await parseResponseBody(response);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chatter topics POST proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = getToken(request);

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE}/office/chatter/topics`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Chatter topics PATCH error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to update topic' },
                { status: response.status }
            );
        }

        const data = await parseResponseBody(response);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chatter topics PATCH proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = getToken(request);

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE}/office/chatter/topics`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Chatter topics DELETE error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to delete topic' },
                { status: response.status }
            );
        }

        const data = await parseResponseBody(response);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chatter topics DELETE proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}