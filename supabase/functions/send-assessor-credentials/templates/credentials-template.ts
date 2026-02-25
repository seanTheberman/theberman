export const generateCredentialsHtml = (fullName: string, email: string, password: string, loginUrl: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; }
            .header { background-color: #007F00; padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 500; }
            .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
            .content { padding: 40px 30px; background-color: white; }
            .greeting { font-size: 18px; margin-bottom: 20px; color: #444; }
            .body-text { font-size: 16px; margin-bottom: 20px; color: #555; }
            .credentials-box { background-color: #f4f7f4; padding: 24px; border-radius: 8px; margin: 30px 0; border: 1px solid #d4e8d4; }
            .credentials-box h3 { margin: 0 0 16px 0; color: #333; font-size: 16px; }
            .credential-row { display: flex; margin-bottom: 12px; }
            .credential-label { font-weight: bold; color: #555; min-width: 80px; font-size: 14px; }
            .credential-value { color: #007F00; font-weight: bold; font-size: 14px; font-family: monospace; background: white; padding: 4px 10px; border-radius: 4px; border: 1px solid #e0e0e0; }
            .steps-box { background-color: #fff8e1; padding: 24px; border-radius: 8px; margin: 30px 0; border: 1px solid #ffe082; }
            .steps-box h3 { margin: 0 0 16px 0; color: #333; font-size: 16px; }
            .steps-box ol { margin: 0; padding-left: 20px; }
            .steps-box li { margin-bottom: 8px; color: #555; font-size: 14px; }
            .button-container { text-align: center; margin: 40px 0; }
            .button { 
                background-color: #007F00; 
                color: white !important; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 4px; 
                font-weight: bold; 
                font-size: 16px; 
                display: inline-block;
            }
            .warning { font-size: 13px; color: #888; margin-top: 20px; font-style: italic; }
            .footer { padding: 30px; background-color: #f9f9f9; text-align: center; font-size: 14px; color: #888; border-top: 1px solid #eee; }
            .footer p { margin: 10px 0; }
            .footer-links { margin-top: 20px; }
            .footer-links a { color: #007F00; text-decoration: none; margin: 0 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Berman Home Energy</h1>
                <p>BER Assessor Registration</p>
            </div>
            <div class="content">
                <p class="greeting">Hi ${fullName.split(' ')[0]},</p>
                
                <p class="body-text">
                    You have been registered as a <strong>BER Assessor</strong> on the 
                    <strong>Berman Home Energy</strong> platform. Below are your login credentials to get started.
                </p>

                <div class="credentials-box">
                    <h3>🔐 Your Login Credentials</h3>
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0; font-weight:bold; color:#555; font-size:14px; width:80px;">Email:</td>
                            <td style="padding:8px 0;"><span class="credential-value">${email}</span></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; font-weight:bold; color:#555; font-size:14px;">Password:</td>
                            <td style="padding:8px 0;"><span class="credential-value">${password}</span></td>
                        </tr>
                    </table>
                </div>

                <div class="steps-box">
                    <h3>📋 Next Steps</h3>
                    <ol>
                        <li><strong>Log in</strong> using the credentials above</li>
                        <li><strong>Complete your registration</strong> by filling in your assessor details</li>
                        <li><strong>Make the registration payment</strong> to activate your account</li>
                        <li>Start receiving BER assessment jobs!</li>
                    </ol>
                </div>

                <div class="button-container">
                    <a href="${loginUrl}" class="button">Log In Now</a>
                </div>

                <p class="warning">
                    Please change your password after your first login for security purposes.
                </p>

                <p class="body-text">
                    Best Regards,<br>
                    <strong>The Berman Team</strong>
                </p>
            </div>
            <div class="footer">
                <p>&copy; 2026 The Berman. All rights reserved.</p>
                <div class="footer-links">
                    <a href="https://theberman.eu">Visit Website</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
