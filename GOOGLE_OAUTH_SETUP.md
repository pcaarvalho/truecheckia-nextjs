# Google OAuth Setup Guide

This guide will help you configure Google OAuth for TrueCheckIA.

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" > "OAuth 2.0 Client IDs"

## 2. Configure OAuth Consent Screen

1. Go to "OAuth consent screen" in the left sidebar
2. Choose "External" if your app will be used by users outside your organization
3. Fill out the required information:
   - App name: `TrueCheckIA`
   - User support email: Your email
   - App domain: Your domain (e.g., `https://truecheckia.com`)
   - Authorized domains: Add your domain
   - Developer contact information: Your email

## 3. Create OAuth 2.0 Client ID

1. Go back to "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`

## 4. Environment Variables

Add the following to your `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your_client_id_here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret_here"

# Make sure these are also set
FRONTEND_URL="http://localhost:3000"  # or your production URL
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
```

## 5. OAuth Flow

The implemented OAuth flow works as follows:

1. User clicks "Sign in with Google" button
2. User is redirected to `/api/auth/google` with optional `redirect` and `plan` parameters
3. Backend redirects user to Google's OAuth consent screen
4. User grants permissions to the app
5. Google redirects back to `/api/auth/google/callback` with authorization code
6. Backend exchanges code for user information
7. Backend creates/updates user in database
8. Backend generates JWT tokens and sets secure cookies
9. User is redirected to `/auth/callback` with tokens in URL
10. Frontend processes tokens and redirects to appropriate page

## 6. Features

- ✅ Automatic user creation for new Google accounts
- ✅ Links existing accounts with Google IDs
- ✅ Secure JWT token generation
- ✅ HttpOnly cookies for security
- ✅ State management for redirect handling
- ✅ Plan parameter support for pricing redirects
- ✅ Comprehensive error handling
- ✅ Email verification bypass for Google accounts

## 7. Testing

1. Make sure your environment variables are set
2. Start the development server: `npm run dev`
3. Go to `/login` and click the "Sign in with Google" button
4. Complete the OAuth flow
5. You should be redirected to the dashboard

## 8. Production Considerations

- Update authorized domains in Google Cloud Console
- Set proper `FRONTEND_URL` and `NEXTAUTH_URL` for production
- Ensure HTTPS is enabled for production domains
- Test the complete flow in production environment
- Monitor OAuth error logs

## 9. Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**: Check that your redirect URI in Google Console matches exactly
2. **"unauthorized_client"**: Ensure your client ID is correct and the OAuth consent screen is configured
3. **"access_denied"**: User cancelled the OAuth flow - this is handled gracefully
4. **Token errors**: Check that JWT secrets are properly set

### Debug Mode:

Check the browser console and server logs for detailed error information. The OAuth flow includes extensive logging.