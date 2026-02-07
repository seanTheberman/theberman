export const generatePromoHtml = (sponsors: any[]) => {
    if (!sponsors || sponsors.length === 0) return '';
    return `
<div style='margin-top: 30px; border-top: 1px dashed #e5e5e5; padding-top: 20px;'>
    <h3 style='margin: 0 0 20px 0; color: #333333; font-size: 16px; font-weight: bold; text-align: center;'>Recommended Partners</h3>
    ${sponsors.map(sponsor => `
        <div style='background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee;'>
            ${sponsor.image_url ? `<img src='${sponsor.image_url}' alt='${sponsor.name}' style='max-height: 40px; width: auto; display: block; margin: 0 auto 15px auto;' />` : ''}
            <h4 style='margin: 0 0 5px 0; color: #007F00; font-size: 15px; font-weight: bold;'>${sponsor.headline}</h4>
            <p style='margin: 0 0 15px 0; color: #555555; font-size: 13px;'>${sponsor.sub_text}</p>
            <a href='${sponsor.destination_url}' target='_blank' style='display: inline-block; background-color: #007F00; color: white; padding: 10px 20px; border-radius: 6px; font-size: 14px; text-decoration: none; font-weight: bold;'>View Offer</a>
        </div>
    `).join('')}
</div>`.trim();
};
