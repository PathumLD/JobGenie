# Enhanced Logout Functionality Test Guide

## Issue Fixed
The logout functionality was not properly clearing access_token and refresh_token cookies, leaving them in the browser after logout.

## Enhanced Solution Implemented

### 1. **Multi-Layer Cookie Clearing Strategy**
- **Backend**: Comprehensive cookie clearing with multiple variations
- **Frontend**: Aggressive client-side cookie clearing
- **Fallback**: HTML response with JavaScript for forced clearing

### 2. **Backend Logout Route** (`/api/auth/logout/route.ts`)
- Multiple cookie clearing attempts with different path variations
- Set-Cookie headers for direct browser instruction
- Cache control headers to prevent caching
- HTML response option for JavaScript-based clearing

### 3. **Frontend Logout Handler** (`CandidateHeader.tsx`)
- Immediate client-side storage clearing
- Multiple cookie clearing attempts with different paths/domains
- Fallback to HTML format logout if standard fails
- Cookie presence verification before redirect

### 4. **JWT Utility** (`/lib/jwt.ts`)
- Consistent cookie setting/clearing with `expires` instead of `maxAge`
- Proper cookie options matching

### 5. **Debug Endpoint** (`/api/auth/debug-cookies`)
- New endpoint to inspect all cookies and their properties
- Useful for troubleshooting cookie issues

## Testing Steps

### 1. **Pre-Logout Verification**
1. Login to the application
2. Open browser DevTools → Application/Storage → Cookies
3. Verify that `access_token` and `refresh_token` cookies are present
4. Note their properties (path, domain, httpOnly, etc.)

### 2. **Standard Logout Test**
1. Click the logout button
2. Check browser DevTools → Application/Storage → Cookies
3. Verify that both `access_token` and `refresh_token` cookies are removed
4. Check Network tab for logout API response

### 3. **HTML Format Logout Test** (Fallback)
1. If standard logout doesn't work, the system will automatically try HTML format
2. This should open a page that forces cookie clearing via JavaScript
3. Verify cookies are cleared and redirect happens

### 4. **Debug Cookie Inspection**
1. Visit `/api/auth/debug-cookies` to see all cookies
2. Check cookie properties and values
3. Use this to verify what cookies remain after logout

### 5. **Post-Logout Verification**
1. Try to access protected routes - should get 401 Unauthorized
2. Check localStorage - should be cleared
3. Verify no authentication tokens remain in browser storage

## Expected Behavior
- All authentication cookies should be immediately cleared
- localStorage and sessionStorage should be cleared
- User should be redirected to login page
- Protected routes should be inaccessible
- No authentication tokens should remain in browser storage

## Troubleshooting

### If Cookies Still Persist:

#### 1. **Check Cookie Properties**
- Use `/api/auth/debug-cookies` endpoint
- Verify cookie path, domain, and other properties
- Ensure clearing attempts match the original cookie settings

#### 2. **Browser DevTools Investigation**
- Check Network tab during logout
- Look for Set-Cookie headers in response
- Verify cache control headers are present

#### 3. **Manual Cookie Clearing**
- Clear browser cache and cookies manually
- Check if cookies are set with different domains/paths
- Verify no browser extensions are interfering

#### 4. **Test HTML Format Logout**
- Add `?format=html` to logout URL
- This should force JavaScript-based cookie clearing
- Check if this method successfully clears cookies

#### 5. **Check for NextAuth Interference**
- Look for `next-auth.*` cookies in browser
- These might be from previous sessions or other applications
- Clear them manually if needed

## Advanced Debugging

### 1. **Cookie Clearing Verification**
```javascript
// In browser console, check if cookies exist
document.cookie.includes('access_token=')
document.cookie.includes('refresh_token=')
```

### 2. **Manual Cookie Clearing**
```javascript
// Force clear specific cookies
document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
```

### 3. **Network Request Inspection**
- Check logout API response headers
- Verify Set-Cookie headers are present
- Look for cache control headers

## Security Notes
- Cookies are set with `httpOnly: true` for security
- `secure: true` in production environments
- `sameSite: 'lax'` for CSRF protection
- Multiple clearing attempts ensure thorough cleanup
- HTML format logout provides JavaScript-based fallback

## Performance Considerations
- Multiple cookie clearing attempts may add minimal overhead
- HTML format logout is only used as fallback
- Debug endpoint should be removed in production
