import { supabase } from './supabase';

// Function to send a welcome email
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: 'ברוך הבא ל-MyStar!',
        template: 'welcome',
        data: {
          name: name || 'משתמש יקר',
          loginUrl: `${window.location.origin}/login`
        }
      }
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return { success: false, error };
  }
}

// Function to send a verification email
export async function resendVerificationEmail(email: string) {
  try {
    // Get the base URL without any query parameters or hash
    const baseUrl = window.location.origin;
    
    // Create a complete URL with the correct path
    const redirectTo = `${baseUrl}/auth/callback`;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (error) {
      console.error('Error resending verification email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resendVerificationEmail:', error);
    return { success: false, error };
  }
}

// Function to send a password reset email
export async function sendPasswordResetEmail(email: string) {
  try {
    // Get the base URL without any query parameters or hash
    const baseUrl = window.location.origin;
    
    // Create a complete URL with the correct path
    const redirectTo = `${baseUrl}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { 
        success: false, 
        error: {
          message: error.message || 'Failed to send password reset email',
          details: error
        }
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    return { 
      success: false, 
      error: {
        message: error instanceof Error ? error.message : 'Failed to send password reset email. Please try again later.',
        details: error
      }
    };
  }
}
