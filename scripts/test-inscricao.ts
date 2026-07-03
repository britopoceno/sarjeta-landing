import 'dotenv/config';
import {
  garantirAbas,
  adicionarInscricao,
  lerInscritos,
  atualizarResumo,
  linkPlanilha,
} from '../api/_lib/sheets';
import { enviarEmailAgradecimento, enviarWhatsApp } from '../api/_lib/notificar';
import { agoraBRT } from '../api/_lib/config';

const alvoEmail = process.argv[2] || process.env.GMAIL_USER!;

async function main() {
  console.log('1) Conectando à planilha e garantindo abas…');
  await garantirAbas();
  console.log('   OK. Planilha:', linkPlanilha());

  console.log('2) Gravando inscrição de TESTE…');
  await adicionarInscricao([
    agoraBRT(),
    'TESTE — pode apagar esta linha',
    '',
    '000.000.000-00',
    alvoEmail,
    '(84) 90000-0000',
    '2000-01-01',
    'Prefiro não responder',
    'Prefiro não responder',
    'Não',
    '',
    'Aceito',
  ]);
  const linhas = await lerInscritos();
  console.log('   OK. Total de linhas agora:', linhas.length);

  console.log('3) Atualizando aba Resumo…');
  await atualizarResumo(linhas);
  console.log('   OK.');

  console.log(`4) Enviando e-mail de agradecimento para ${alvoEmail}…`);
  await enviarEmailAgradecimento(alvoEmail, 'Vagner (teste)');
  console.log('   OK.');

  console.log('5) Enviando aviso no WhatsApp via CallMeBot…');
  await enviarWhatsApp(
    '✅ TESTE do formulário da Jornada de Produção Musical. ' +
      'Se você recebeu isto, o aviso de inscrição está funcionando!',
  );
  console.log('   OK.');

  console.log('\n✔ Todos os serviços responderam. Confira: e-mail, WhatsApp e a planilha.');
}

main().catch((e) => {
  console.error('\nFALHOU:', e);
  process.exit(1);
});
