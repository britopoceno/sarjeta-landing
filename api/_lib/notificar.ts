import nodemailer from 'nodemailer';
import { EVENTO, GRUPO_WHATSAPP } from './config.js';

// Envia mensagem pro WhatsApp do organizador via CallMeBot (só funciona pro número ativado)
export async function enviarWhatsApp(texto: string): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) throw new Error('CALLMEBOT_PHONE/CALLMEBOT_APIKEY não configurados');
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(apikey)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`CallMeBot ${resp.status}: ${await resp.text()}`);
}

export async function enviarEmailAgradecimento(destino: string, nome: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('GMAIL_USER/GMAIL_APP_PASSWORD não configurados');

  // Autentica na conta do Gmail, mas envia como o alias institucional.
  // GMAIL_FROM precisa estar cadastrado como "Enviar e-mail como" no Gmail.
  const remetente = process.env.GMAIL_FROM || 'contato@sarjeta.com';

  const transporte = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  const primeiroNome = nome.trim().split(/\s+/)[0];

  const html = `
  <div style="background:#050505;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:4px solid #000;">
      <div style="background:#39FF14;border-bottom:4px solid #000;padding:20px 28px;">
        <span style="font-size:12px;letter-spacing:3px;font-weight:bold;color:#000;text-transform:uppercase;">
          Rádio Sarjeta // Ponto de Cultura
        </span>
      </div>
      <div style="padding:28px;color:#000;">
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.05;text-transform:uppercase;">
          Inscrição confirmada, ${primeiroNome}! 🎧🔥
        </h1>
        <p style="font-size:16px;line-height:1.5;">
          Valeu por se inscrever na <strong>${EVENTO.nome}</strong>! Bora fazer um som do zero,
          entendendo gravação, edição, arranjo e os fluxos de trabalho na DAW.
        </p>
        <div style="border:4px solid #000;padding:16px 20px;margin:24px 0;background:#f5f5f5;">
          <p style="margin:0 0 8px;font-size:15px;"><strong>📍 Onde:</strong> ${EVENTO.local}</p>
          <p style="margin:0 0 8px;font-size:15px;"><strong>🗓️ Quando:</strong> ${EVENTO.datas}</p>
          <p style="margin:0;font-size:15px;"><strong>⏰ Horário:</strong> ${EVENTO.horario}</p>
        </div>
        <p style="font-size:16px;line-height:1.5;">
          Entra no grupo do evento pra receber os avisos:
        </p>
        <p style="margin:20px 0 28px;">
          <a href="${GRUPO_WHATSAPP}"
             style="display:inline-block;background:#FF4500;color:#fff;text-decoration:none;
                    padding:14px 28px;border:4px solid #000;font-weight:bold;text-transform:uppercase;
                    letter-spacing:2px;font-size:14px;">
            Grupo do WhatsApp →
          </a>
        </p>
        <p style="font-size:14px;line-height:1.5;color:#444;">
          Dúvidas? É só responder este e-mail ou chamar no Instagram
          <a href="https://www.instagram.com/radiosarjeta" style="color:#FF4500;font-weight:bold;">@radiosarjeta</a>.
        </p>
      </div>
      <div style="background:#000;color:#fff;padding:16px 28px;">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
          Rádio Sarjeta — Eu sei que ninguém viu o sertão de metal, mas eu sonhei.
        </p>
      </div>
    </div>
  </div>`;

  await transporte.sendMail({
    from: `Rádio Sarjeta <${remetente}>`,
    replyTo: remetente,
    to: destino,
    subject: `Inscrição confirmada — ${EVENTO.nome} 🎧`,
    html,
    text:
      `Inscrição confirmada, ${primeiroNome}!\n\n` +
      `${EVENTO.nome}\nOnde: ${EVENTO.local}\nQuando: ${EVENTO.datas}\nHorário: ${EVENTO.horario}\n\n` +
      `Grupo do WhatsApp: ${GRUPO_WHATSAPP}\n\n` +
      `Dúvidas? Responda este e-mail ou chame no Instagram @radiosarjeta.`,
  });
}
