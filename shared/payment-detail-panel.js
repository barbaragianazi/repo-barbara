/* Painel de detalhes de uma ação de pagamento — compartilhado entre a
   Visão geral e a lista de Pagamento das ações, para manter o mesmo
   popup e o mesmo comportamento nas duas telas. */
(function () {
  'use strict';

  const PANEL_HTML = `
    <button class="payment-detail-overlay" id="detailOverlay" type="button" aria-label="Fechar detalhes"></button>
    <aside class="payment-detail-panel" id="detailPanel" aria-live="polite">
      <header class="payment-detail-header">
        <div class="payment-detail-header__top">
          <span>Detalhes da ação</span>
          <div class="payment-detail-header__close-group">
            <small class="detail-esc-hint">Fechar <kbd class="kbd--on-accent">Esc</kbd></small>
            <button class="payment-detail-panel__close" id="closeDetailPanel" type="button"
              aria-label="Fechar detalhes">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="payment-detail-header__main">
          <div>
            <strong id="detailTitle">Pagamento</strong>
            <small id="detailMeta">Código: | Grupo:</small>
          </div>
          <div class="payment-detail-header__actions">
            <span class="detail-status-pill" id="detailStatus">Em análise</span>
            <div class="detail-more-menu">
              <button class="detail-more-menu__trigger" type="button" aria-label="Mais opções">
                <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
              </button>
              <div class="detail-more-menu__popover" aria-hidden="true">
                <span><i class="fa-regular fa-clipboard" aria-hidden="true"></i> Relacionar nota fiscal</span>
                <span><i class="fa-solid fa-clock" aria-hidden="true"></i> Agendar pagamento</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="payment-detail-shell">
        <nav class="payment-detail-tabs" aria-label="Seções do detalhe">
          <button class="is-active" type="button" data-detail-tab="info">
            <i class="fa-regular fa-file-lines" aria-hidden="true"></i>
            <span>Informações</span>
          </button>
          <button type="button" data-detail-tab="payments">
            <i class="fa-solid fa-dollar-sign" aria-hidden="true"></i>
            <span>Pagamentos</span>
          </button>
          <button type="button" data-detail-tab="exports">
            <i class="fa-regular fa-file" aria-hidden="true"></i>
            <span>Arquivos exportados</span>
          </button>
        </nav>
        <div class="payment-detail-content" id="detailContent"></div>
      </div>
    </aside>
  `;

  const PAYMENT_RECORD_COLUMNS = ['Cliente', 'SKU', 'Quantidade', 'Tipo Ordem', 'Motivo Ordem', 'Nº Solicitação', 'Payterms', 'Parceiro 9000', 'Planta', 'Lote', 'Preço Manual'];

  const PAYMENT_SORT_OPTIONS = [
    { value: 'recent', label: 'Mais recentes' },
    { value: 'oldest', label: 'Mais antigos' },
    { value: 'value-desc', label: 'Maior valor' },
    { value: 'value-asc', label: 'Menor valor' }
  ];

  function stageLabel(stage) {
    return stage === 'Em análise de pagamento' ? 'Em análise' : stage;
  }

  function cleanRequest(value) {
    return String(value || '').replace(/^N:\s*/i, '') || 'Sem Dados';
  }

  function formatBRL(value) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function parseBRDate(value) {
    const [day, month, year] = String(value).split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  function create() {
    if (window.BipperPaymentDetailPanel && window.BipperPaymentDetailPanel._instance) {
      return window.BipperPaymentDetailPanel._instance;
    }

    document.body.insertAdjacentHTML('beforeend', PANEL_HTML);

    const state = { detailTab: 'info', selectedPayment: null, paymentsRecordView: 'cards', paymentsSort: 'recent' };

    const detailPanel = document.getElementById('detailPanel');
    const detailOverlay = document.getElementById('detailOverlay');
    const detailContent = document.getElementById('detailContent');
    const detailTitle = document.getElementById('detailTitle');
    const detailMeta = document.getElementById('detailMeta');
    const detailStatus = document.getElementById('detailStatus');

    let detailSkeletonTimer;
    let paymentsRecordSkeletonTimer;

    function openDetailPanel() {
      detailPanel.classList.add('is-visible');
      document.body.classList.add('payment-detail-open');
      detailOverlay.classList.add('is-visible');
    }

    function measureDetailContentHeight(markup) {
      const measurer = document.createElement('div');
      measurer.className = 'payment-detail-content';
      measurer.style.position = 'absolute';
      measurer.style.visibility = 'hidden';
      measurer.style.pointerEvents = 'none';
      measurer.style.left = '-9999px';
      measurer.style.top = '0';
      measurer.style.width = `${detailContent.clientWidth || 720}px`;
      measurer.style.height = 'auto';
      measurer.style.maxHeight = 'none';
      measurer.style.overflow = 'visible';
      measurer.innerHTML = markup;
      document.body.appendChild(measurer);
      const height = measurer.scrollHeight;
      measurer.remove();
      return height;
    }

    function syncDetailPanelHeight(item) {
      if (!item || window.matchMedia('(max-width: 980px)').matches) {
        detailPanel.style.removeProperty('--detail-panel-height');
        return;
      }

      const contentHeights = [
        getInfoDetailMarkup(item),
        getPaymentDetailTableMarkup(item),
        getExportedFilesMarkup(item)
      ].map(measureDetailContentHeight);
      const headerHeight = detailPanel.querySelector('.payment-detail-header')?.offsetHeight || 0;
      const tabsHeight = detailPanel.querySelector('.payment-detail-tabs')?.offsetHeight || 0;
      const maxContentHeight = Math.max(...contentHeights);
      const maxViewportHeight = window.innerHeight - 24;
      const targetHeight = Math.min(maxViewportHeight, Math.ceil(headerHeight + tabsHeight + maxContentHeight));

      detailPanel.style.setProperty('--detail-panel-height', `${targetHeight}px`);
    }

    function renderDetailSkeleton() {
      detailContent.innerHTML = Array.from({ length: 9 }, (_, index) => {
        const size = index < 3 ? 'sm' : (index < 6 ? 'lg' : 'md');
        return `<div class="detail-tile detail-tile--${size} detail-skeleton skeleton-shimmer"></div>`;
      }).join('');
      openDetailPanel();
    }

    function renderDetail(item) {
      window.clearTimeout(detailSkeletonTimer);
      state.selectedPayment = item;
      state.detailTab = 'info';
      syncDetailTabs();
      updateDetailHeader(item);
      renderDetailSkeleton();
      detailSkeletonTimer = window.setTimeout(() => {
        renderDetailContent(item);
        syncDetailPanelHeight(item);
      }, 180);
    }

    function updateDetailHeader(item) {
      detailTitle.textContent = item.action;
      detailMeta.textContent = `Código: ${item.code} | Grupo: ${item.participant}`;
      detailStatus.textContent = stageLabel(item.stage);
    }

    function syncDetailTabs() {
      detailPanel.querySelectorAll('[data-detail-tab]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.detailTab === state.detailTab);
      });
    }

    function renderDetailContent(item) {
      if (state.detailTab === 'payments') {
        renderPaymentDetailTable(item);
        openDetailPanel();
        syncDetailPanelHeight(item);
        return;
      }
      if (state.detailTab === 'exports') {
        renderExportedFiles(item);
        openDetailPanel();
        syncDetailPanelHeight(item);
        return;
      }
      renderInfoDetail(item);
      openDetailPanel();
      syncDetailPanelHeight(item);
    }

    function getInfoDetailMarkup(item) {
      return `
        <section class="detail-section">
          <h3><i class="fa-solid fa-sack-dollar" aria-hidden="true"></i> Financeiro</h3>
          <div class="detail-chip-grid">
            <span class="detail-chip"><i class="fa-solid fa-route" aria-hidden="true"></i> <strong>Origem dos créditos:</strong> <button type="button">Exibir Origem</button></span>
            <span class="detail-chip"><i class="fa-solid fa-money-check-dollar" aria-hidden="true"></i> <strong>Tipo de saldo:</strong> ${item.accountType}</span>
            <span class="detail-chip"><i class="fa-solid fa-hand-holding-dollar" aria-hidden="true"></i> <strong>Investimento previsto:</strong> ${item.value}</span>
            <span class="detail-chip detail-chip--wide"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> <strong>Lote Origem:</strong> 334 - ${item.campaign} - Julho/2026</span>
          </div>
        </section>
        <section class="detail-section">
          <h3><i class="fa-solid fa-circle-info icon-neutral" aria-hidden="true"></i> Informações da ação</h3>
          <div class="detail-chip-grid">
            <span class="detail-chip"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i> <strong>Período da ação:</strong> ${item.includedAt} às 14:45 - 28/10/2026 às 14:45</span>
            <span class="detail-chip"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> <strong>Tipo(s) da ação:</strong> ${item.actionType || item.paymentType}</span>
          </div>
          <p class="detail-copy"><strong>Local da ação:</strong> (Não especificado)</p>
          <p class="detail-copy"><strong>Objetivo:</strong><br>Ação destinada ao pagamento do participante ${item.participant}, da campanha ${item.campaign}, no valor de ${item.value}.</p>
        </section>
      `;
    }

    function renderInfoDetail(item) {
      detailContent.innerHTML = getInfoDetailMarkup(item);
    }

    function buildPaymentRecords(item) {
      const baseValue = Number(item.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
      const baseDate = parseBRDate(item.includedAt);
      const orderLines = [
        { sku: '10022283', quantity: 1, orderType: 'ZCMR', orderReason: 'C39', payterms: 'ZN00', share: 0.25, dayOffset: -2 },
        { sku: '10022284', quantity: 2, orderType: 'ZCMR', orderReason: 'C39', payterms: 'ZN00', share: 0.45, dayOffset: 0 },
        { sku: '10022291', quantity: 1, orderType: 'ZRCM', orderReason: 'C40', payterms: 'ZN00', share: 0.3, dayOffset: -5 }
      ];

      return orderLines.map((line) => {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + line.dayOffset);
        return {
          cliente: item.participantCode,
          sku: line.sku,
          quantidade: line.quantity,
          tipoOrdem: line.orderType,
          motivoOrdem: line.orderReason,
          solicitacao: cleanRequest(item.request),
          payterms: line.payterms,
          parceiro9000: '',
          planta: '',
          lote: '',
          valorNumero: baseValue * line.share,
          data: date
        };
      });
    }

    function sortPaymentRecords(records, sortBy) {
      const sorted = [...records];
      if (sortBy === 'oldest') sorted.sort((a, b) => a.data - b.data);
      else if (sortBy === 'value-desc') sorted.sort((a, b) => b.valorNumero - a.valorNumero);
      else if (sortBy === 'value-asc') sorted.sort((a, b) => a.valorNumero - b.valorNumero);
      else sorted.sort((a, b) => b.data - a.data);
      return sorted;
    }

    function recordToRow(record) {
      return [
        record.cliente,
        record.sku,
        record.quantidade,
        record.tipoOrdem,
        record.motivoOrdem,
        record.solicitacao,
        record.payterms,
        record.parceiro9000,
        record.planta,
        record.lote,
        formatBRL(record.valorNumero)
      ];
    }

    function renderPaymentRecordCards(rows) {
      return `
        <section class="payment-record-grid" aria-label="Pagamentos da ação">
          ${rows.map((row) => `
            <article class="payment-record-card">
              ${row.map((value, index) => `
                <div class="payment-record-field">
                  <span class="payment-record-field__label">${PAYMENT_RECORD_COLUMNS[index]}</span>
                  <strong class="payment-record-field__value">${value || '-'}</strong>
                </div>
              `).join('')}
            </article>
          `).join('')}
        </section>
      `;
    }

    function renderPaymentRecordTable(rows) {
      return `
        <div class="payment-record-table-wrap">
          <table class="payment-record-table" aria-label="Pagamentos da ação">
            <thead>
              <tr>${PAYMENT_RECORD_COLUMNS.map((label) => `<th>${label}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((value) => `<td>${value || '-'}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderPaymentsToolbar() {
      const isTable = state.paymentsRecordView === 'table';
      return `
        <div class="payment-records-toolbar">
          <label class="payment-records-sort">
            <span>Ordenar por</span>
            <select data-payments-sort aria-label="Ordenar pagamentos por">
              ${PAYMENT_SORT_OPTIONS.map((option) => `
                <option value="${option.value}" ${state.paymentsSort === option.value ? 'selected' : ''}>${option.label}</option>
              `).join('')}
            </select>
          </label>
          ${isTable && !window.__bipperNavTipsOff ? `
            <div class="compact-tour compact-tour--inline payment-records-scroll-tip is-visible" role="status">
              <strong>Rolagem lateral do grid</strong>
              <span>Segure <kbd>Shift</kbd> e role o mouse — ou arraste com dois dedos no trackpad — para ver todas as colunas.</span>
              <label class="compact-tour__dismiss">
                <input type="checkbox" data-dismiss-inline-tour-forever>
                Não exibir novamente
              </label>
              <button type="button" data-dismiss-inline-tour aria-label="Fechar dica">Entendi</button>
            </div>
          ` : '<span class="payment-records-toolbar__spacer" aria-hidden="true"></span>'}
          <div class="view-mode-toggle" role="group" aria-label="Modo de visualização dos pagamentos" data-payments-view-toggle>
            <button type="button" class="${!isTable ? 'is-active' : ''}" data-payments-view="cards">
              <i class="fa-solid fa-grip" aria-hidden="true"></i> Cards
            </button>
            <button type="button" class="${isTable ? 'is-active' : ''}" data-payments-view="table">
              <i class="fa-solid fa-table-list" aria-hidden="true"></i> Tabela
            </button>
          </div>
        </div>
      `;
    }

    function renderPaymentRecordCardsSkeleton() {
      return `
        <section class="payment-record-grid" aria-hidden="true">
          ${Array.from({ length: 3 }, () => `
            <article class="payment-record-card">
              ${PAYMENT_RECORD_COLUMNS.map(() => `
                <div class="payment-record-field">
                  <span class="payment-record-field__label skeleton-shimmer">&nbsp;</span>
                  <strong class="payment-record-field__value skeleton-shimmer">&nbsp;</strong>
                </div>
              `).join('')}
            </article>
          `).join('')}
        </section>
      `;
    }

    function renderPaymentRecordTableSkeleton() {
      return `
        <div class="payment-record-table-wrap">
          <table class="payment-record-table" aria-hidden="true">
            <thead>
              <tr>${PAYMENT_RECORD_COLUMNS.map((label) => `<th>${label}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${Array.from({ length: 3 }, () => `
                <tr>${PAYMENT_RECORD_COLUMNS.map(() => '<td><span class="table-skeleton-cell table-skeleton-cell--medium skeleton-shimmer"></span></td>').join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderPaymentRecordsSkeleton() {
      const isTable = state.paymentsRecordView === 'table';
      detailContent.innerHTML = `
        ${renderPaymentsToolbar()}
        ${isTable ? renderPaymentRecordTableSkeleton() : renderPaymentRecordCardsSkeleton()}
      `;
      window.BipperCustomSelect?.enhanceAll(detailContent);
    }

    function getPaymentDetailTableMarkup(item) {
      const records = sortPaymentRecords(buildPaymentRecords(item), state.paymentsSort);
      const rows = records.map(recordToRow);
      const isTable = state.paymentsRecordView === 'table';

      return `
        ${renderPaymentsToolbar()}
        ${isTable ? renderPaymentRecordTable(rows) : renderPaymentRecordCards(rows)}
      `;
    }

    function renderPaymentDetailTable(item) {
      detailContent.innerHTML = getPaymentDetailTableMarkup(item);
      window.BipperCustomSelect?.enhanceAll(detailContent);
      syncDetailPanelHeight(item);
    }

    function renderPaymentDetailTableWithSkeleton(item) {
      window.clearTimeout(paymentsRecordSkeletonTimer);
      renderPaymentRecordsSkeleton();
      paymentsRecordSkeletonTimer = window.setTimeout(() => renderPaymentDetailTable(item), 180);
    }

    function getExportedFilesMarkup(item) {
      const exportedFiles = [
        {
          code: item.code,
          name: 'SampleOrders_Order_31.08_zcmr_0001.csv',
          exportedAt: '31/08/2026 14:46:24',
          type: 'CSV'
        },
        {
          code: item.code,
          name: 'Relatorio_Pagamento_Ação_' + item.code + '.pdf',
          exportedAt: '31/08/2026 15:02:10',
          type: 'PDF'
        },
        {
          code: item.code,
          name: 'Memoria_Calculo_' + cleanRequest(item.request) + '.xlsx',
          exportedAt: '01/09/2026 09:18:42',
          type: 'XLS'
        },
        {
          code: item.code,
          name: 'Comprovantes_Exportação_' + item.code + '.zip',
          exportedAt: '01/09/2026 11:27:05',
          type: 'ZIP'
        }
      ];

      return `
        <section class="export-card-grid" aria-label="Arquivos exportados">
          ${exportedFiles.map((file) => `
            <article class="export-file-card">
              <div class="export-file-card__icon export-file-card__icon--${file.type.toLowerCase()}">
                <span>${file.type}</span>
              </div>
              <div class="export-file-card__body">
                <strong>${file.name}</strong>
                <span>Código ação: ${file.code} - Data exportação: ${file.exportedAt}</span>
              </div>
              <button class="export-file-card__menu" type="button" aria-label="Opções do arquivo ${file.name}">
                <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
              </button>
            </article>
          `).join('')}
        </section>
      `;
    }

    function renderExportedFiles(item) {
      detailContent.innerHTML = getExportedFilesMarkup(item);
      syncDetailPanelHeight(item);
      openDetailPanel();
    }

    function closeDetail() {
      window.clearTimeout(detailSkeletonTimer);
      window.clearTimeout(paymentsRecordSkeletonTimer);
      detailPanel.classList.remove('is-visible');
      detailOverlay.classList.remove('is-visible');
      detailPanel.style.removeProperty('--detail-panel-height');
      document.body.classList.remove('payment-detail-open');
    }

    detailOverlay.addEventListener('click', closeDetail);
    document.getElementById('closeDetailPanel').addEventListener('click', closeDetail);

    detailPanel.querySelectorAll('[data-detail-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!state.selectedPayment) return;
        state.detailTab = button.dataset.detailTab;
        syncDetailTabs();
        renderDetailContent(state.selectedPayment);
      });
    });

    detailContent.addEventListener('click', (event) => {
      const dismissInlineTour = event.target.closest('[data-dismiss-inline-tour]');
      if (dismissInlineTour) {
        const tourEl = dismissInlineTour.closest('.compact-tour');
        if (tourEl?.querySelector('[data-dismiss-inline-tour-forever]')?.checked) {
          window.__bipperNavTipsOff = true;
        }
        tourEl?.classList.remove('is-visible');
        return;
      }

      const viewButton = event.target.closest('[data-payments-view]');
      if (!viewButton || !state.selectedPayment) return;
      state.paymentsRecordView = viewButton.dataset.paymentsView;
      renderPaymentDetailTableWithSkeleton(state.selectedPayment);
    });

    detailContent.addEventListener('change', (event) => {
      const sortSelect = event.target.closest('[data-payments-sort]');
      if (!sortSelect || !state.selectedPayment) return;
      state.paymentsSort = sortSelect.value;
      renderPaymentDetailTableWithSkeleton(state.selectedPayment);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && detailPanel.classList.contains('is-visible')) {
        closeDetail();
      }
    });

    window.addEventListener('resize', () => {
      if (detailPanel.classList.contains('is-visible')) {
        syncDetailPanelHeight(state.selectedPayment);
      }
    });

    const instance = { open: renderDetail, close: closeDetail };
    window.BipperPaymentDetailPanel._instance = instance;
    return instance;
  }

  window.BipperPaymentDetailPanel = { create, _instance: null };
})();
