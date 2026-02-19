export const generateOnboardingHtml = (fullName: string, town: string, onboardingUrl: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; }
            .header { background-color: #5ba367; padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 500; }
            .content { padding: 40px 30px; background-color: white; }
            .greeting { font-size: 18px; margin-bottom: 20px; color: #444; }
            .body-text { font-size: 16px; margin-bottom: 30px; color: #555; }
            .button-container { text-align: center; margin: 40px 0; }
            .button { 
                background-color: #5ba367; 
                color: white !important; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 4px; 
                font-weight: bold; 
                font-size: 16px; 
                display: inline-block;
            }
            .footer { padding: 30px; background-color: #f9f9f9; text-align: center; font-size: 14px; color: #888; border-top: 1px solid #eee; }
            .footer p { margin: 10px 0; }
            .footer-links { margin-top: 20px; }
            .footer-links a { color: #5ba367; text-decoration: none; margin: 0 10px; }
            .promo-box { background-color: #f4f7f4; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px dashed #5ba367; text-align: center; }
            .promo-box h4 { margin: 0 0 10px 0; color: #444; }
            .promo-box a { color: #5ba367; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${town || "Your Business Profile"}</h1>
            </div>
            <div class="content">
                <p class="greeting">Hi ${fullName.split(' ')[0]},</p>
                
                <p class="body-text">
                    Great news! Your application to join the <strong>Berman Home Energy Catalogue</strong> has been approved. 
                    A client interested in energy services in your area is waiting to see your profile.
                </p>

                <div class="button-container">
                    <a href="${onboardingUrl}" class="button">Complete Registration</a>
                </div>

                <p class="body-text">
                    Best Regards,<br>
                    <strong>The Berman Team</strong>
                </p>

                <div class="promo-box">
                    <h4>Considering Solar Panels?</h4>
                    <p>Compare the Best Solar Deals at <a href="https://solarquotesireland.com/">SolarQuotesIreland.com</a></p>
                </div>
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
