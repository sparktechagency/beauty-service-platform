import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTemplate';

const createAccount = (values: ICreateAccount) => {
    const data = {
        to: values.email,
        subject: 'Verify your account',
        html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
                    <!-- Logo -->
                    <img src="https://res.cloudinary.com/dabd4udau/image/upload/v1746444343/ubirra0v3j4wyeaojcxv.png" alt="beauty service Logo" style="display: block; margin: 0 auto 20px; width:150px" />

                    <!-- Greeting -->
                    <h2 style="color: #9558b7; font-size: 24px; margin-bottom: 20px;">Hey, ${values.name}!</h2>

                    <!-- Verification Instructions -->
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for signing up for beauty service. Please verify your email address to activate your account.</p>

                    <!-- OTP Section -->
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #9558b7; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>

                    <!-- Footer -->
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not sign up for beauty service, please ignore this email.</p>
                    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2025 beauty service. All rights reserved.</p>

                </div>
            </body>
        `
    }

    return data;
}


const resetPassword = (values: IResetPassword) => {
    const data = {
        to: values.email,
        subject: 'Reset your password',
        html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <img src="https://res.cloudinary.com/dabd4udau/image/upload/v1746444343/ubirra0v3j4wyeaojcxv.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #9558b7; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>
                </div>
            </body>
        `,
    };
    return data;
};

interface ReferralEmailParams {
    name: string;
    email: string;
    referral: string;
    amount: number;
    referralUserNamee: string;
  }
  
  export const referralAcceptedEmail = ({ name, email, referral,amount,referralUserNamee }: ReferralEmailParams) => {
    return {
      to: email,
      subject: "🎉 Your Referral Was Accepted!",
      html: `
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
  
          <h2 style="color: #28a745;">Congratulations, ${name}!</h2>
  
          <p style="font-size: 16px;">Your referral has been <strong>accepted</strong> by ${referralUserNamee}, and you've earned <strong>${amount} usd </strong></p>
  
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f8f8; border-left: 5px solid #28a745;">
            <p><strong>Referral Code:</strong> ${referral}</p>
            <p><strong>Referral Bonus:</strong> ${amount}</p>
          </div>
  
          <p>Thank you for referring others to our platform. Keep referring and keep earning!</p>
  
          <p style="margin-top: 30px; font-size: 14px; color: #888;">If you have any questions, feel free to contact our support team.</p>
  
          <p style="text-align: center; font-size: 12px; color: #bbb;">&copy; ${new Date().getFullYear()} Beuty Care. All rights reserved.</p>
        </div>
      </body>
      `,
    };
  };

  const sendSupportMessage = (values:{name:string,email:string,message:string}) => {
    return {
      to: config.admin.email!,
      subject: `Support Message from ${values.name}`,
      html: `
  <body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: 'Segoe UI', Tahoma, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f8fa; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="padding: 24px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
                <p style="margin-top: 0;">
                  <strong>Support Message from:</strong> ${values.name} &lt;${values.email}&gt;
                </p>

                <p style="margin: 20px 0 0;">
                  ${values.message}
                </p>

                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

                <p style="font-size: 14px; color: #888888; margin-bottom: 0;">
                  Please respond via the admin panel or directly to the client's email.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size: 12px; color: #aaaaaa; padding: 20px;">
                &copy; 2025 Ah | Internal Support Notification
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
      `,
    };
  };

  const sendSupportMessageToUser = (values:{name:string,email:string,message:string})=>{
    return {
        to: values.email,
        subject: `Support Message From AH`,
        html: ` <body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);">
            <tr>
              <td align="center" style="background-color: #4a90e2; padding: 30px;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff;">Support Team</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.7;">
                <p style="margin-top: 0;">Hi <strong>${values.name}</strong>,</p>
                <p>
                ${values.message}
                </p>
          <br />
                  <br />
                  Best regards,<br />
                  <strong>The Support Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="background-color: #f0f0f0; color: #888888; font-size: 13px; padding: 20px;">
                &copy; 2025 AH All rights reserved.<br />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>`
    }
  }

export const emailTemplate = {
    createAccount,
    resetPassword,
    referralAcceptedEmail,
    sendSupportMessage,
    sendSupportMessageToUser
};