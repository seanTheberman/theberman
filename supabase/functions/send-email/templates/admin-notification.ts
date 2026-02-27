
export const generateAdminEmail = (record: any, sponsors: any[], promoHtml: string) => {
  return `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #007F00; padding: 20px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">New Lead Received</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                      <p style="font-size: 16px;">You have received a new inquiry from <strong>The Berman</strong> website.</p>

                      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <a href="mailto:${record.email}" style="color: #007F00; text-decoration: none;">${record.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.phone}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Location:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.town}, ${record.county}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Type:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.property_type} (${record.purpose})</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Message:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; line-height: 1.5;">${record.message}</td>
                        </tr>
                      </table>

                      ${sponsors && sponsors.length > 0 ? `
                        <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
                            <p style="font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 5px;">Promo sent to customer:</p>
                            ${promoHtml}
                        </div>
                      ` : ''}

                      <div style="margin-top: 30px; text-align: center;">
                        <a href="https://theberman.eu/admin" style="background-color: #9ACD32; color: #004d00; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">View in Admin Panel</a>
                      </div>
                    </div>
                    <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
                      &copy; 2026 The Berman. All rights reserved. <br/>
                      <a href="https://theberman.eu/" style="color: #007F00; text-decoration: none;">Visit Website</a>
                    </div>
                  </div>
                `;
};
