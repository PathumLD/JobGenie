import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if the request wants HTML response for forced cookie clearing
    const acceptHeader = request.headers.get('accept') || '';
    const wantsHtml = acceptHeader.includes('text/html') || request.nextUrl.searchParams.get('format') === 'html';

    if (wantsHtml) {
      // Return HTML with JavaScript to force cookie clearing
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Logging out...</title>
          <script>
            // Force clear ALL cookies and storage
            function clearAllCookies() {
              console.log('Starting comprehensive logout cleanup...');
              
              // Clear localStorage and sessionStorage
              try {
                localStorage.clear();
                sessionStorage.clear();
                console.log('Local storage cleared');
              } catch (e) {
                console.log('Error clearing local storage:', e);
              }
              
              // Get all cookies and clear them
              const cookies = document.cookie.split(';');
              console.log('Found cookies:', cookies);
              
              cookies.forEach(cookie => {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                if (name) {
                  console.log('Clearing cookie:', name);
                  
                  // Clear with different paths and domains
                  const paths = ['/', '/candidate', '/api', '/auth'];
                  const domains = ['', '.localhost', '.local'];
                  
                  paths.forEach(path => {
                    domains.forEach(domain => {
                      // Multiple clearing attempts with different formats
                      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path + '; domain=' + domain;
                      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path + '; domain=' + domain;
                      document.cookie = name + '=; max-age=0; path=' + path + '; domain=' + domain;
                      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path;
                      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path;
                      document.cookie = name + '=; max-age=0; path=' + path;
                    });
                  });
                }
              });
              
              // Also clear common cookies that might be httpOnly
              const commonCookies = [
                'access_token', 'refresh_token', 'token', 'session', 'auth',
                'next-auth.callback-url', 'next-auth.csrf-token', 'next-auth.session-token',
                'next-auth.pkce.code-verifier', 'next-auth.pkce.state',
                '_next_hmr_ref', 'next-auth.csrf-token', 'next-auth.callback-url'
              ];
              
              commonCookies.forEach(cookieName => {
                console.log('Clearing common cookie:', cookieName);
                const paths = ['/', '/candidate', '/api', '/auth'];
                const domains = ['', '.localhost', '.local'];
                
                paths.forEach(path => {
                  domains.forEach(domain => {
                    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path + '; domain=' + domain;
                    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path + '; domain=' + domain;
                    document.cookie = cookieName + '=; max-age=0; path=' + path + '; domain=' + domain;
                    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path;
                    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path;
                    document.cookie = cookieName + '=; max-age=0; path=' + path;
                  });
                });
              });
              
              // Check remaining cookies
              setTimeout(() => {
                const remainingCookies = document.cookie;
                console.log('Remaining cookies after cleanup:', remainingCookies);
                
                if (remainingCookies.length > 0) {
                  console.log('Some cookies still remain, attempting additional cleanup...');
                  // Try one more aggressive cleanup
                  document.cookie.split(';').forEach(cookie => {
                    const name = cookie.split('=')[0].trim();
                    if (name) {
                      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                      document.cookie = name + '=; max-age=0; path=/';
                    }
                  });
                }
                
                // Redirect after cleanup
                console.log('Redirecting to login page...');
                window.location.href = '/candidate/login';
              }, 200);
            }
            
            // Execute immediately
            clearAllCookies();
          </script>
        </head>
        <body>
          <h1>Logging out...</h1>
          <p>Please wait while we clear your session completely...</p>
          <p>This may take a moment to ensure all cookies and data are removed.</p>
          <div id="status">Clearing cookies...</div>
          <script>
            // Update status
            setTimeout(() => {
              document.getElementById('status').textContent = 'Cookies cleared, redirecting...';
            }, 1000);
          </script>
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

    // Standard JSON response with comprehensive cookie clearing
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Get all cookies from the request to clear them all
    const allCookies = request.cookies.getAll();
    
    // Clear ALL cookies with comprehensive options
    const cookieOptions = [
      // Standard options
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        expires: new Date(0),
        path: '/'
      },
      // Without path
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        expires: new Date(0)
      },
      // With domain (for subdomain scenarios)
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        expires: new Date(0),
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
      },
      // Strict sameSite
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        expires: new Date(0),
        path: '/'
      },
      // Non-httpOnly cookies
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        expires: new Date(0),
        path: '/'
      }
    ];

    // Clear each cookie with all variations
    allCookies.forEach(cookie => {
      cookieOptions.forEach((options, index) => {
        // Clear with original name
        response.cookies.set(cookie.name, '', options);
        // Clear with indexed name for additional coverage
        response.cookies.set(`${cookie.name}_${index}`, '', options);
      });
    });

    // Also clear common authentication and session cookies that might exist
    const commonCookies = [
      'access_token', 'refresh_token', 'token', 'session', 'auth',
      'next-auth.callback-url', 'next-auth.csrf-token', 'next-auth.session-token',
      'next-auth.pkce.code-verifier', 'next-auth.pkce.state',
      '_next_hmr_ref', 'next-auth.csrf-token', 'next-auth.callback-url'
    ];

    commonCookies.forEach(cookieName => {
      cookieOptions.forEach((options, index) => {
        response.cookies.set(cookieName, '', options);
        response.cookies.set(`${cookieName}_${index}`, '', options);
      });
    });

    // Direct cookie clearing with Set-Cookie headers for ALL cookies
    const clearCookieHeaders: string[] = [];
    
    allCookies.forEach(cookie => {
      const paths = ['/', '/candidate', '/api', '/auth'];
      const domains = ['', '.localhost', '.local'];
      
      paths.forEach(path => {
        domains.forEach(domain => {
          clearCookieHeaders.push(
            `${cookie.name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
            `${cookie.name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
          );
        });
      });
    });

    // Add multiple Set-Cookie headers to force clearing
    clearCookieHeaders.forEach(header => {
      response.headers.append('Set-Cookie', header);
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
