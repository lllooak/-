import { supabase } from '../lib/supabase';

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

// Function to send order confirmation email to the fan
export async function sendOrderConfirmationEmail(
  orderId: string,
  fanEmail: string,
  fanName: string,
  creatorName: string,
  orderType: string,
  estimatedDelivery?: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderId,
        fanEmail,
        fanName,
        creatorName,
        orderType,
        estimatedDelivery
      }
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return { 
        success: false, 
        error: {
          message: error.message || 'Failed to send order confirmation email',
          details: error
        }
      };
    }

    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return { 
      success: false, 
      error: {
        message: error instanceof Error ? error.message : 'Failed to send order confirmation email',
        details: error
      }
    };
  }
}

// Function to send order notification email to the creator
export async function sendCreatorOrderNotificationEmail(
  creatorEmail: string,
  creatorName: string,
  fanName: string,
  orderType: string,
  orderId: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('send-creator-notification', {
      body: {
        to: creatorEmail,
        creatorName,
        fanName,
        orderType,
        orderId
      }
    });

    if (error) {
      console.error('Error sending creator notification email:', error);
      return { 
        success: false, 
        error: {
          message: error.message || 'Failed to send creator notification email',
          details: error
        }
      };
    }

    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Error in sendCreatorOrderNotificationEmail:', error);
    return { 
      success: false, 
      error: {
        message: error instanceof Error ? error.message : 'Failed to send creator notification email',
        details: error
      }
    };
  }
}
