import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://test.bowlersnetwork.com/api';

// DELETE - delete brand by id
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // body may be empty or contain extra info; we will just forward whatever was sent
        const body = await request.text();

        const response = await fetch(`${API_BASE}/office/brands/${id}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body || undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Brand delete error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to delete brand' },
                { status: response.status }
            );
        }

        // most delete endpoints return empty body
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Brand delete proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
