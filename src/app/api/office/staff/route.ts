import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://test.bowlersnetwork.com/api';

// GET - List all staff
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${API_BASE}/office/staff`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Staff GET error [${response.status}]:`, errorText);
            
            // Return detailed error info for debugging
            return NextResponse.json(
                { 
                    error: `Backend error ${response.status}`,
                    details: errorText.substring(0, 500),
                    backend_status: response.status
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        // Log the actual response for debugging
        console.log('Backend staff response:', JSON.stringify(data).substring(0, 500));
        
        // Handle different response formats
        // Backend might return data wrapped in 'results', 'data', or as direct array
        let staffData = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (Array.isArray(data.results)) {
                staffData = data.results;
            } else if (Array.isArray(data.data)) {
                staffData = data.data;
            }
        }
        
        return NextResponse.json(staffData || []);
    } catch (error) {
        console.error('Staff GET proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create staff
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE}/office/staff`, {
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
            console.error('Staff POST error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to create staff' },
                { status: response.status }
            );
        }

        // Handle empty response body (API returns 200 but no content)
        const text = await response.text();
        const data = text ? JSON.parse(text) : { success: true };
        
        // Handle different response formats - ensure we return consistent data
        let staffData = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (Array.isArray(data.results)) {
                staffData = data.results;
            } else if (Array.isArray(data.data)) {
                staffData = data.data;
            }
        }
        
        return NextResponse.json(staffData || data);
    } catch (error) {
        console.error('Staff POST proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete staff
export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE}/office/staff`, {
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
            console.error('Staff DELETE error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to delete staff' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Staff DELETE proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
