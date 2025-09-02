import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Logout request received');

    // Check if the request wants HTML response for client-side localStorage clearing
    const acceptHeader = request.headers.get('accept') || '';
    const wantsHtml = acceptHeader.includes('text/html') || request.nextUrl.searchParams.get('format') === 'html';

    if (wantsHtml) {
      console.log('📄 Returning HTML response for client-side localStorage clearing');
      
      // Return HTML with JavaScript to clear localStorage and sessionStorage
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Logging out...</title>
          <script>
            function clearClientSideData() {
              console.log('🧹 Starting client-side cleanup...');
              
              // Clear localStorage and sessionStorage
              try {
                localStorage.clear();
                sessionStorage.clear();
                console.log('✅ Local storage and session storage cleared');
              } catch (e) {
                console.log('❌ Error clearing storage:', e);
              }
              
              console.log('✅ Client-side cleanup complete, redirecting...');
              // Redirect after cleanup
              setTimeout(() => {
                window.location.href = '/candidate/login';
              }, 500);
            }
            
            // Execute immediately
            clearClientSideData();
          </script>
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
            <h1>Logging out...</h1>
            <p>Please wait while we clear your session...</p>
            <div style="margin-top: 20px;">
              <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite;"></div>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </body>
        </html>
      `;

      return new NextResponse(htmlResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Standard JSON response (no cookie clearing needed since we use localStorage)
    console.log('🔧 Creating JSON response for logout');
    
    const response = NextResponse.json(
      { message: 'Logged out successfully. Please clear localStorage on client side.' },
      { status: 200 }
    );

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log('✅ Logout response prepared');
    
    return response;

  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
