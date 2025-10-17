// API Vercel para envio de código de verificação
const RESEND_API_KEY = 're_QpbyFToK_Bs6EYzR3KCZqneZbKnm9Vtjb';

/**
 * Gera código de 6 dígitos
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Template HTML minimalista
 */
function getEmailTemplate(code, type) {
  const title = type === 'signup' ? 'Confirme seu cadastro' : 'Código de acesso';
  const message = type === 'signup' 
    ? 'Use o código abaixo para confirmar seu cadastro no UniCallMed:' 
    : 'Use o código abaixo para fazer login no UniCallMed:';
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
              
              <!-- Logo -->
              <tr>
                <td align="center" style="padding: 40px 30px 30px;">
                  <img src="https://firebasestorage.googleapis.com/v0/b/unicallmed.appspot.com/o/logo.png?alt=media" alt="UniCallMed" style="width: 120px; height: auto;">
                </td>
              </tr>
              
              <!-- Título -->
              <tr>
                <td style="padding: 0 30px 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1e293b;">${title}</h1>
                </td>
              </tr>
              
              <!-- Mensagem -->
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">${message}</p>
                </td>
              </tr>
              
              <!-- Código -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background: linear-gradient(135deg, #1e5cb3, #2563eb); border-radius: 8px; padding: 25px; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Seu código de verificação</p>
                    <p style="margin: 0; font-size: 40px; font-weight: bold; color: #ffffff; letter-spacing: 8px;">${code}</p>
                  </div>
                </td>
              </tr>
              
              <!-- Aviso de expiração -->
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                    ⏱️ Este código expira em <strong>10 minutos</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Divider -->
              <tr>
                <td style="padding: 0 30px;">
                  <div style="height: 1px; background: #e2e8f0;"></div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8;">
                    Se você não solicitou este código, ignore este email.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                    © 2025 UniCallMed - Plataforma de Telemedicina
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export default async function handler(req, res) {
  // CORS Headers - DEVE SER PRIMEIRA COISA
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, type, firebaseData } = req.body;
    
    if (!email || !type) {
      return res.status(400).json({ error: 'Email e type são obrigatórios' });
    }
    
    if (!['signup', 'login'].includes(type)) {
      return res.status(400).json({ error: 'Type deve ser signup ou login' });
    }
    
    // Gerar código
    const code = generateCode();
    
    // Enviar email via Resend
    const subject = type === 'signup' 
      ? 'Confirme seu cadastro - UniCallMed' 
      : 'Código de acesso - UniCallMed';
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'UniCallMed <onboarding@resend.dev>',
        to: email,
        subject: subject,
        html: getEmailTemplate(code, type)
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Erro Resend:', error);
      return res.status(500).json({ error: 'Falha ao enviar email' });
    }
    
    const result = await response.json();
    
    console.log('✅ Email enviado:', email, 'ID:', result.id);
    
    // Retornar código E dados para salvar no Firestore
    // O app salvará no Firestore diretamente
    return res.status(200).json({
      success: true,
      messageId: result.id,
      code: code, // Retornar para app salvar no Firestore
      expiresIn: 600 // 10 minutos
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar solicitação',
      details: error.message 
    });
  }
}
