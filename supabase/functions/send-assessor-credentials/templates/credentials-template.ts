export const generateCredentialsHtml = (fullName: string, email: string, password: string, loginUrl: string, tenant: string = 'ireland', displayName: string = 'The Berman', websiteUrl: string = 'https://theberman.eu') => {
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const brandName = displayName;
    const roleName = isSpanish ? 'Certificador Energético' : (isPortuguese ? 'Perito Certificador' : (isEngland ? 'Domestic Energy Assessor' : 'BER Assessor'));

    if (isSpanish) {
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
                <h1>Bienvenido a ${brandName}</h1>
                <p>Registro de ${roleName}</p>
            </div>
            <div class="content">
                <p class="greeting">Hola ${fullName},</p>

                <p class="body-text">
                    Muchas gracias por atendernos al teléfono recientemente, si deseas recibir solicitudes de presupuestos para realizar Certificados en Eficiencia Energética a través de nuestra plataforma por favor sigue los pasos indicados abajo para tu registro.
                </p>

                <div class="credentials-box">
                    <h3>🔐 Tus Credenciales de Acceso</h3>
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0; font-weight:bold; color:#555; font-size:14px; width:80px;">Email:</td>
                            <td style="padding:8px 0;"><span class="credential-value">${email}</span></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; font-weight:bold; color:#555; font-size:14px;">Contraseña:</td>
                            <td style="padding:8px 0;"><span class="credential-value">${password}</span></td>
                        </tr>
                    </table>
                </div>

                <div class="steps-box">
                    <h3>📋 Próximos Pasos</h3>
                    <ol>
                        <li><strong>Inicia sesión</strong> usando las credenciales de arriba</li>
                        <li><strong>Completa tu registro</strong> llenando tus detalles de certificador</li>
                        <li>¡Comienza a recibir trabajos de certificación energética!</li>
                    </ol>
                </div>

                <div class="button-container">
                    <a href="${loginUrl}" class="button">Iniciar Sesión Ahora</a>
                </div>

                <p class="warning">
                    Por favor cambia tu contraseña después de tu primer inicio de sesión por seguridad.
                </p>

                <p class="body-text">
                    Muchas gracias,<br>
                    <strong>el equipo de certificados energéticos.eu</strong><br>
                    <span style="font-size:13px; color:#888;">Powered by the BERman.</span>
                </p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} certificados energéticos.eu. Todos los derechos reservados.</p>
                <div class="footer-links">
                    <a href="${websiteUrl}">Visitar Sitio Web</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    if (isPortuguese) {
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
                <h1>Bem-vindo à ${brandName}</h1>
                <p>Registo de ${roleName}</p>
            </div>
            <div class="content">
                <p class="greeting">Olá ${fullName.split(' ')[0]},</p>
                
                <p class="body-text">
                    Foi registado como <strong>${roleName}</strong> na plataforma
                    <strong>${brandName}</strong>. Abaixo estão as suas credenciais de acesso para começar.
                </p>

                <div class="credentials-box">
                    <h3>🔐 As suas Credenciais de Acesso</h3>
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0; font-weight:bold; color:#555; font-size:14px; width:110px;">Email:</td>
                            <td style="padding:8px 0;"><span class="credential-value">${email}</span></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; font-weight:bold; color:#555; font-size:14px;">Palavra-passe:</td>
                            <td style="padding:8px 0;"><span class="credential-value">${password}</span></td>
                        </tr>
                    </table>
                </div>

                <div class="steps-box">
                    <h3>📋 Próximos Passos</h3>
                    <ol>
                        <li><strong>Inicie sessão</strong> com as credenciais acima</li>
                        <li><strong>Complete o seu registo</strong> preenchendo os seus dados de perito</li>
                        <li>Comece a receber trabalhos de certificação energética!</li>
                    </ol>
                </div>

                <div class="button-container">
                    <a href="${loginUrl}" class="button">Iniciar Sessão Agora</a>
                </div>

                <p class="warning">
                    Por razões de segurança, altere a sua palavra-passe após o primeiro início de sessão.
                </p>

                <p class="body-text">
                    Com os melhores cumprimentos,<br>
                    <strong>A Equipa ${brandName}</strong>
                </p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${brandName}. Todos os direitos reservados.</p>
                <div class="footer-links">
                    <a href="${websiteUrl}">Visitar Site</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    }

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
                <h1>Welcome to ${brandName}</h1>
                <p>${roleName} Registration</p>
            </div>
            <div class="content">
                <p class="greeting">Hi ${fullName.split(' ')[0]},</p>
                
                <p class="body-text">
                    You have been registered as a <strong>${roleName}</strong> on the 
                    <strong>${brandName}</strong> platform. Below are your login credentials to get started.
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
                        <li>Start receiving EPC assessment jobs!</li>
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
                    <strong>The ${brandName} Team</strong>
                </p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                <div class="footer-links">
                    <a href="${websiteUrl}">Visit Website</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
