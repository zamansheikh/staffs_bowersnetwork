import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Proxying staff login request to external API:', { username: body.username });

        // Forward the request to the staff login endpoint
        const response = await fetch('https://test.bowlersnetwork.com/api/auth/login/staff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('External API response status:', response.status);

        // Only parse as JSON for 200 and 401 status codes
        if (response.status === 200 || response.status === 401) {
            try {
                const data = await response.json();
                console.log('External API response data (JSON):', response.status === 200 ? { access_token: '***' } : data);
                return NextResponse.json(data, { status: response.status });
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                return NextResponse.json(
                    { error: 'Invalid response from authentication server' },
                    { status: 500 }
                );
            }
        }

        // For other status codes, return a generic error
        console.error('Unexpected status code from external API:', response.status);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Proxy login error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to authentication server' },
            { status: 500 }
        );
    }
}
