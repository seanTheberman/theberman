
export const generateDigestEmail = (
    contractorName: string,
    availableJobs: any[],
    websiteUrl: string
): string => {
    const jobRows = availableJobs.map(job => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.county || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.town || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.property_type || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${job.ber_purpose || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        <a href="${websiteUrl}/contractor" style="background-color: #007F00; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block;">Quote Here</a>
      </td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${availableJobs.length}x Jobs Still Available to Quote</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #333; margin: 0;">${availableJobs.length}x Jobs Still Available to Quote</h1>
  </div>

  <div style="background-color: #007F00; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">Submit Your Quotes</h2>
  </div>

  <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <p>Hi ${contractorName},</p>
    <p>There are <strong>${availableJobs.length} jobs</strong> available that you have not yet quoted on.</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
      <thead>
        <tr style="background-color: #666; color: white;">
          <th style="padding: 12px; text-align: left;">County</th>
          <th style="padding: 12px; text-align: left;">Town</th>
          <th style="padding: 12px; text-align: left;">Type</th>
          <th style="padding: 12px; text-align: left;">Purpose</th>
          <th style="padding: 12px; text-align: center;">Quote</th>
        </tr>
      </thead>
      <tbody>
        ${jobRows}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${websiteUrl}/contractor" style="background-color: #007F00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View All Jobs</a>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
    <p>&copy; ${new Date().getFullYear()} TheBerman.eu. All rights reserved.</p>
  </div>

</body>
</html>
  `;
};