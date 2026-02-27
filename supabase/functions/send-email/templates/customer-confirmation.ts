
export const generateCustomerEmail = (record: any, promoHtml: string) => {
  return `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #007F00; padding: 20px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">Thanks for contacting us!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                      <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${record.name}</strong>,</p>
                      <p style="font-size: 16px; line-height: 1.6;">We've received your details for a BER assessment in <strong>${record.town}</strong>. One of our team members will review your request and get back to you with a quote shortly.</p>

                      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                        <h4 style="margin: 0 0 10px 0; color: #555; font-size: 14px; text-transform: uppercase;">Your Details:</h4>
                        <p style="margin: 0; font-size: 14px; color: #777;"><strong>Phone:</strong> ${record.phone}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #777;"><strong>Type:</strong> ${record.property_type}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #777;"><strong>Purpose:</strong> ${record.purpose}</p>
                      </div>

                      <p style="font-size: 16px; line-height: 1.6;">If you have any urgent questions, feel free to reply to this email.</p>

                      ${promoHtml}

                    </div>
                    <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
                      &copy; 2026 The Berman. All rights reserved.<br/>
                      <a href="https://theberman.eu/" style="color: #007F00; text-decoration: none;">Visit Website</a>
                    </div>
                  </div>
                `;
};
