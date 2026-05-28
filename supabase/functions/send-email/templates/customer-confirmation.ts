
export const generateCustomerEmail = (record: any, promoHtml: string) => {
    const websiteUrl = "https://theberman.eu";
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <div style="background-color: #007F00; padding: 35px 20px; text-align: center;">
            <img src="${websiteUrl}/logo.svg" alt="The Berman" style="height: 32px; margin-bottom: 12px; filter: brightness(0) invert(1);">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Request Received</h1>
        </div>

        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; font-weight: 600; margin-top: 0; color: #1a1a1a;">Hi ${record.name},</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                Thank you for reaching out! We've received your inquiry for a BER assessment in <strong>${record.town}</strong>.
                Our team is currently reviewing your details and we will get back to you with tailored quotes shortly.
            </p>

            <div style="background-color: #fdfdfd; border: 1px solid #eee; padding: 25px; border-radius: 10px; margin: 30px 0;">
                <h4 style="margin: 0 0 15px 0; color: #007F00; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Summary of Details:</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>Phone:</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>Property Type:</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.property_type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>Purpose:</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.purpose}</td>
                    </tr>
                    ${record.bedrooms ? `
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>Bedrooms:</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.bedrooms}</td>
                    </tr>
                    ` : ''}
                    ${record.property_size ? `
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #777;"><strong>Property Size:</strong></td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333;">${record.property_size}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            <p style="font-size: 15px; color: #666; text-align: center; margin-bottom: 30px;">
                You'll receive an email notification as soon as our assessors provide their quotes.
            </p>

            <div style="text-align: center;">
                <a href="${websiteUrl}" style="background-color: #007F00; color: #ffffff !important; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px; display: inline-block;">
                    Visit Our Website
                </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
            ${promoHtml}
        </div>

        <div style="text-align: center; padding: 0 30px 35px 30px; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} The Berman. All rights reserved.<br/>
            Promoting energy efficiency across Ireland.
        </div>
    </div>
</body>
</html>
`;
};
