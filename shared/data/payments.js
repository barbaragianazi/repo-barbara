/*
  Fonte única dos dados de pagamento das ações (mock).
  Consumido por:
    - redesign-pagamentos/pagamento-acoes/index.html (tabela operacional)
    - redesign-pagamentos/analise/index.html (dashboard)

  Expõe window.BipperPayments com:
    - base   : registros originais
    - all    : base + clones (dataset expandido usado nas telas)
    - parseBRL(str)     -> Number   ("R$ 53.779,41" -> 53779.41)
    - parseBRDate(str)  -> Date     ("28/08/2026" -> Date)
    - formatBRDate(date)-> string   (Date -> "28/08/2026")
    - clonePayment(item, index)     (helper de expansão, exportado p/ testes)

  As datas de inclusão foram distribuídas ao longo de ~12 meses e os clones
  são deslocados no tempo para gerar uma série temporal realista.
*/
(function () {
  'use strict';

  function parseBRL(value) {
    return Number(
      String(value)
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0;
  }

  function parseBRDate(value) {
    const [day, month, year] = String(value).split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  function formatBRDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

  const base = [
    { statusGroup: 'processing', code: '5794', action: 'Pagamento: 5794 | 2025000310', participantCode: '10832', participant: 'PETZ', stage: 'Em análise de pagamento', status: 'Processando', actionType: 'Pagamento', value: 'R$ 53.779,41', request: 'N: 2025000310', campaign: 'Cerenia comprimidos para estratégicos', paymentType: 'ZCMR - Credit Note', includedAt: '12/08/2026', accountType: 'Conta de pagamentos', scheduledAt: 'Não agendado', actionLabel: 'Aguardando processamento' },
    { statusGroup: 'processing', code: '5793', action: 'Pagamento: 5793 | 2025000182', participantCode: '1000223584', participant: 'GP TUDO DENTRO LTDA', stage: 'Em análise de pagamento', status: 'Processando', actionType: 'Pagamento', value: 'R$ 9.674,02', request: 'N: 2025000182', campaign: 'D&P274 - Canal Direto Golden Channel Com.Trade E-Commerce M G', paymentType: 'ZCMR - Credit Note', includedAt: '05/08/2026', accountType: 'Conta pagamento FI', scheduledAt: 'Não agendado', actionLabel: 'Aguardando processamento' },
    { statusGroup: 'processing', code: '5792', action: 'Pagamento: 5792 | 2025000182', participantCode: '1000172931', participant: 'TUDO DE BICHO COMÉRCIO E IMPORTADORA DE PRODUTOS PET LTDA', stage: 'Em análise de pagamento', status: 'Processando', actionType: 'Pagamento', value: 'R$ 11.080,60', request: 'N: 2025000182', campaign: 'D&P274 - Canal Direto Golden Channel Com.Trade E-Commerce M G', paymentType: 'ZRCM - Transferência Bancária', includedAt: '28/07/2026', accountType: 'Conta pagamento FI', scheduledAt: 'Não agendado', actionLabel: 'Aguardando processamento' },
    { statusGroup: 'processing', code: '5791', action: 'Pagamento: 5791 | 2025000015', participantCode: '1000058377', participant: 'DROGARIA ARAÚJO S.A', stage: 'Em análise de pagamento', status: 'Processando', actionType: 'Pagamento', value: 'R$ 1.975,15', request: 'N: 2025000015', campaign: 'D&P 35 - Deal Drogaria Araújo Logística', paymentType: 'ZCMR - Credit Note', includedAt: '19/07/2026', accountType: 'Conta pagamento FI', scheduledAt: 'Não agendado', actionLabel: 'Aguardando processamento' },
    { statusGroup: 'processing', code: '5790', action: 'Pagamento: 5790 | 2025000318', participantCode: '10832', participant: 'PETZ', stage: 'Em análise de pagamento', status: 'Agendado', actionType: 'Pagamento', value: 'R$ 130.136,47', request: 'N: 2025000318', campaign: 'Rebate Sell in Petz e Cobasi - Apoquel', paymentType: 'ZCMR - Credit Note', includedAt: '03/07/2026', accountType: 'Conta de pagamentos', scheduledAt: '10/07/2026', actionLabel: 'Pagamento agendado' },
    { statusGroup: 'processing', code: '5789', action: 'Pagamento: 5789 | 2025000034', participantCode: '4238', participant: 'VETLOG', stage: 'Em análise de pagamento', status: 'Processando', actionType: 'Pagamento', value: 'R$ 65.318,74', request: 'N: 2025000034', campaign: 'Animais Companhia - Prozperar 2026 S1', paymentType: 'ZRCM - Transferência Bancária', includedAt: '21/06/2026', accountType: 'Conta de pagamentos', scheduledAt: 'Não agendado', actionLabel: 'Aguardando processamento' },
    { statusGroup: 'processing', code: '5788', action: 'Pagamento: 5788 | 2025000034', participantCode: '4232', participant: 'SUPRIMED - SP', stage: 'Em análise de pagamento', status: 'Agendado', actionType: 'Pagamento', value: 'R$ 156.625,33', request: 'N: 2025000034', campaign: 'Animais Companhia - Prozperar 2026 S1', paymentType: 'ZCMR - Credit Note', includedAt: '09/06/2026', accountType: 'Conta de pagamentos', scheduledAt: '15/06/2026', actionLabel: 'Pagamento agendado' },
    { statusGroup: 'processing', code: '5787', action: 'Pagamento: 5787 | 2025000034', participantCode: '4231', participant: 'VETOR', stage: 'Em análise de pagamento', status: 'Processando', actionType: 'Pagamento', value: 'R$ 30.000,00', request: 'N: 2025000034', campaign: 'Animais Companhia - Prozperar 2026 S1', paymentType: 'ZCMR - Credit Note', includedAt: '27/05/2026', accountType: 'Conta de pagamentos', scheduledAt: 'Não agendado', actionLabel: 'Aguardando processamento' },
    { statusGroup: 'paid', code: '38', action: 'Campanha Sell out Caixa Térmica - Aurora', participantCode: '2609', participant: 'AURORA COMÉRCIO E DISTRIBUIÇÃO DE MEDIC. VETERINÁRIOS LTDA', stage: 'Concluído', status: 'Integrado', actionType: 'Ações promocionais', value: 'R$ 37.500,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'ZRCM - Transferência Bancária', includedAt: '22/01/2026', accountType: 'Impulso', scheduledAt: '28/01/2026', actionLabel: 'Visualizar notas' },
    { statusGroup: 'paid', code: '37', action: 'Campanha Sell out Caixa Térmica', participantCode: '262', participant: 'GRUPO SOUBHIA', stage: 'Concluído', status: 'Integrado', actionType: 'Ações promocionais', value: 'R$ 34.000,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'ZRCM - Transferência Bancária', includedAt: '20/03/2026', accountType: 'Impulso', scheduledAt: '26/03/2026', actionLabel: 'Visualizar notas' },
    { statusGroup: 'paid', code: '36', action: 'Campanha Impulso Q3 - Revendas atendidas pelo distribuidor', participantCode: '423', participant: 'VETSEED DISTRIBUIDORA AGROVETERINÁRIA LTDA EPP', stage: 'Concluído', status: 'Integração pendente', actionType: 'Ações promocionais', value: 'R$ 5.000,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'Não informado', includedAt: '08/05/2026', accountType: 'Impulso', scheduledAt: 'Não agendado', actionLabel: 'Visualizar notas' },
    { statusGroup: 'paid', code: '35', action: 'Campanha Impulso Q3 - Vendedores', participantCode: '423', participant: 'VETSEED DISTRIBUIDORA AGROVETERINÁRIA LTDA EPP', stage: 'Concluído', status: 'Integrado', actionType: 'Ações promocionais', value: 'R$ 5.000,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'ZCMR - Credit Note', includedAt: '10/07/2026', accountType: 'Impulso', scheduledAt: '16/07/2026', actionLabel: 'Visualizar notas' },
    { statusGroup: 'paid', code: '33', action: 'Campanha Impulso Q3 - Balconistas', participantCode: '68', participant: 'BRASCAMPO', stage: 'Concluído', status: 'Integração pendente', actionType: 'Ações promocionais', value: 'R$ 7.000,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'Não informado', includedAt: '15/08/2026', accountType: 'Impulso', scheduledAt: 'Não agendado', actionLabel: 'Visualizar notas' },
    { statusGroup: 'paid', code: '32', action: 'Campanha Impulso Q3 - Pecuaristas', participantCode: '68', participant: 'BRASCAMPO', stage: 'Concluído', status: 'Integrado', actionType: 'Ações promocionais', value: 'R$ 7.000,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'ZCMR - Credit Note', includedAt: '12/12/2025', accountType: 'Impulso', scheduledAt: '18/12/2025', actionLabel: 'Visualizar notas' },
    { statusGroup: 'paid', code: '22', action: 'CAMPANHA FECHA Q3 - IMPULSO ZOETIS', participantCode: '356', participant: 'PLANTAR', stage: 'Concluído', status: 'Integração pendente', actionType: 'Ações promocionais', value: 'R$ 11.500,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'Não informado', includedAt: '17/11/2025', accountType: 'Impulso', scheduledAt: 'Não agendado', actionLabel: 'Visualizar notas' },
    { statusGroup: 'paid', code: '21', action: 'Campanha Impulso Q3 2026 - Caixa térmica', participantCode: '327', participant: 'MARTINS COM', stage: 'Concluído', status: 'Integrado', actionType: 'Ações promocionais', value: 'R$ 11.500,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'ZRCM - Transferência Bancária', includedAt: '15/10/2025', accountType: 'Impulso', scheduledAt: '21/10/2025', actionLabel: 'Visualizar notas' },
    { statusGroup: 'canceled', code: '23', action: 'IMPULSIONANDO AS VENDAS NA NORDESTE ATACADO', participantCode: '204', participant: 'EMIS COMÉRCIO E REPRESENTAÇÕES LTDA', stage: 'Cancelado', status: 'Cancelado', actionType: 'Ações promocionais', value: 'R$ 10.000,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'Não informado', includedAt: '16/01/2026', accountType: 'Impulso', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' },
    { statusGroup: 'canceled', code: '18', action: 'Campanha Impulso Q3 - Casa das Vacinas', participantCode: '88', participant: 'CASA DAS VACINAS R P LTDA', stage: 'Cancelado', status: 'Cancelado', actionType: 'Ações promocionais', value: 'R$ 3.000,00', request: 'N: Sem dados', campaign: 'Impulso Q3-2026', paymentType: 'Não informado', includedAt: '27/12/2025', accountType: 'Impulso', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' },
    { statusGroup: 'canceled', code: '5643', action: 'Cashback que vira resultado', participantCode: '227', participant: 'GRUPO AGRO AMAZÔNIA', stage: 'Cancelado', status: 'Cancelado', actionType: 'Ações promocionais', value: 'R$ 12.341,87', request: 'N: Sem dados', campaign: 'Plano de ação - PNZ', paymentType: 'Não informado', includedAt: '12/12/2025', accountType: 'PNZ VU', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' },
    { statusGroup: 'canceled', code: '5630', action: 'TESTE', participantCode: '1945', participant: 'Reestruturação Canais AGROSYN COM E REPR DE INSAGRÍCOLAS', stage: 'Cancelado', status: 'Cancelado', actionType: 'Ações de merchandising', value: 'R$ 31.000,00', request: 'N: Sem dados', campaign: 'Plano de ação - PNZ', paymentType: 'Não informado', includedAt: '28/11/2025', accountType: 'PNZ VU', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' },
    { statusGroup: 'canceled', code: '5606', action: 'ACELERA ELIAGRO - IATF Q3 - 2026', participantCode: '202', participant: 'ELIAGRO PRODS AGROP LTDA.', stage: 'Cancelado', status: 'Cancelado', actionType: 'Ações promocionais', value: 'R$ 2.669,28', request: 'N: Sem dados', campaign: 'Plano de ação - PNZ', paymentType: 'Não informado', includedAt: '13/11/2025', accountType: 'PNZ VU', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' },
    { statusGroup: 'canceled', code: '213', action: 'Incentiva Haroldo Luizari', participantCode: '262', participant: 'GRUPO SOUBHIA', stage: 'Cancelado', status: 'Cancelado', actionType: 'Ação com pecuarista', value: 'R$ 5.000,00', request: 'N: Sem dados', campaign: 'Zoetis Incentiva 2026', paymentType: 'Não informado', includedAt: '29/10/2025', accountType: 'Conta Zoetis Incentiva', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' },
    { statusGroup: 'canceled', code: '5519', action: 'ALVORADA MS - Campanha IATF', participantCode: '262', participant: 'GRUPO SOUBHIA', stage: 'Cancelado', status: 'Cancelado', actionType: 'Ações promocionais', value: 'R$ 55.000,00', request: 'N: Sem dados', campaign: 'Plano de ação - PNZ', paymentType: 'Não informado', includedAt: '10/10/2025', accountType: 'PNZ VU', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' },
    { statusGroup: 'canceled', code: '4409', action: 'Fachada com Simparic e Vanguard', participantCode: '2896', participant: 'SANTÉ PETSHOP E VETERINÁRIA EIRELI', stage: 'Cancelado', status: 'Cancelado', actionType: '', value: 'R$ 12.000,00', request: 'N: Sem dados', campaign: 'D&P 330 - Verba Trade Golden Channel - Revendas P, M, G', paymentType: 'Não informado', includedAt: '22/09/2025', accountType: 'Conta de pagamentos', scheduledAt: 'Não agendado', actionLabel: 'Cancelado' }
  ];

  function clonePayment(item, index) {
    const number = Number(item.code) + (index * 17);
    const shifted = parseBRDate(item.includedAt);
    shifted.setDate(shifted.getDate() - index * 12);
    return {
      ...item,
      code: String(number),
      action: item.action.replace(item.code, String(number)),
      request: item.request.includes('Sem dados')
        ? item.request
        : item.request.replace(/\d+$/, (value) => String(Number(value) + index)),
      value: item.value,
      includedAt: formatBRDate(shifted)
    };
  }

  const all = [
    ...base,
    // Em análise: 8 base + 13 clones = 21
    ...base.slice(0, 8).map((item, index) => clonePayment(item, index + 1)),
    ...base.slice(0, 5).map((item, index) => clonePayment(item, index + 9)),
    // Pagos: 8 base + 5 clones = 13
    ...base.slice(8, 13).map((item, index) => clonePayment(item, index + 1)),
    // Cancelados: 8 base + 1 clone = 9
    ...base.slice(16, 17).map((item, index) => clonePayment(item, index + 1))
  ];

  window.BipperPayments = { base, all, clonePayment, parseBRL, parseBRDate, formatBRDate };
})();
