import nodemailer from 'nodemailer';

// Create a transporter - configured for Gmail with App Password
const createTransporter = () => {
  // For Gmail with App Password
  // The password should be: xxxx xxxx xxxx xxxx (16 characters with spaces)
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured in .env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASSWORD.trim().replace(/\s/g, ''), // Remove spaces from app password
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    socketTimeout: 5000
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, resetToken, role = 'user') => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, message: 'Email service not configured' };
  }
  
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&role=${role}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER.trim(),
    to: userEmail,
    subject: 'Password Reset Request - Power World Gyms',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p><strong>This link will expire in 10 minutes.</strong></p>
      <p>If you did not request this, please ignore this email.</p>
      <hr>
      <p>Power World Gyms</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (userName, userEmail) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, error: 'Email service not configured' };
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER.trim(),
    to: userEmail,
    subject: 'Welcome to Power World Gyms!',
    html: `
      <h2>Welcome, ${userName}!</h2>
      <p>Thank you for registering with Power World Gyms.</p>
      <p>You can now login and start your fitness journey with us.</p>
      <a href="http://localhost:3000/signin/user" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">
        Sign In Now
      </a>
      <p><strong>Happy Training!</strong></p>
      <hr>
      <p>Power World Gyms</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return { success: false, error: error.message };
  }
};

export default { sendPasswordResetEmail, sendWelcomeEmail };
