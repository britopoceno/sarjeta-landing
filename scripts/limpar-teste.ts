import 'dotenv/config';
import { JWT } from 'google-auth-library';
import { lerInscritos, atualizarResumo } from '../api/_lib/sheets';

async function main() {
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const { token } = await jwt.getAccessToken();
  // limpa todas as linhas de dados (mantém cabeçalho)
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/Inscritos!A2:L1000:clear`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
  );
  const linhas = await lerInscritos();
  await atualizarResumo(linhas);
  console.log('Planilha limpa. Linhas de dados agora:', linhas.length);
}
main().catch((e) => { console.error(e); process.exit(1); });
