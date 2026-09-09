// Comportamento da estrutura mestre. Controla abrir/fechar sidebar, menu mobile, overlay, tecla Esc, clique no logo, popup de marcas, leitura do brands.json, troca de tema e atualização dos logos.

(function () {
  const DEFAULT_BRANDS_URL = 'shared/data/brands.json';
  const DEFAULT_MENU_URL = 'config/menu.json';
  const STORAGE_KEY = 'lp_active_brand';
  const SIDEBAR_STORAGE_KEY = 'bipper_sidebar_collapsed';
  const THEME_STORAGE_KEY = 'lp_theme';
  const AUTH_SESSION_KEY = 'bipper_auth_session';

  // Identidade do usuário no shell. A página pode sobrescrever campos via
  // window.BipperShellConfig.profile; uma sessão logada (applyAuthSession) ainda
  // tem prioridade sobre isso.
  const DEFAULT_PROFILE = {
    name: 'Bárbara Gianazi',
    initials: 'BG',
    role: 'UX/UI Designer | Dev Front-End',
    email: 'barbara.gianazi@upper.net.br',
    topbarRole: 'Administradora'
  };

  const ROLE_GATES = {
    'central-suporte-admin': { role: 'support', fallbackPath: 'central-suporte/portal-cliente/index.html' },
    'central-suporte-relatorio-horas': { role: 'support', fallbackPath: 'central-suporte/portal-cliente/index.html' },
    'central-suporte-configuracoes': { role: 'support', fallbackPath: 'central-suporte/portal-cliente/index.html' },
    'central-suporte-cliente': { role: 'client', fallbackPath: 'central-suporte/index.html' }
  };

  const ICONS = {
    home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5Z"></path>',
    briefcase: '<path d="M10 4h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v3H2V9a2 2 0 0 1 2-2h4V6a2 2 0 0 1 2-2Zm4 3V6h-4v1h4Zm8 7v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4h8v1.5h4V14h8Z"></path>',
    handshake: '<path d="M16.9 6.1 14 9h-3.3l-.9.9a2 2 0 0 0 2.8 2.8l1.2-1.2 5.4 5.4a2.2 2.2 0 0 0 .6-2.3l2.2-2.2V7h-3.4l-1.7-.9ZM2 7h5.4l1.1 1.1-.1.1a4 4 0 0 0 5.6 5.7l.1-.1 3.6 3.6a1 1 0 0 1-1.4 1.4L12.5 15 11 16.4l3.8 3.8a1 1 0 0 1-1.4 1.4L9.6 17.8 8.2 19.2l1.5 1.5a1 1 0 0 1-1.4 1.4L2 15.8V7Z"></path>',
    megaphone: '<path d="M4 10.5 17 5v14L4 13.5v-3ZM6.4 15l2.2 5.4 2.8-1.1-1.7-4.2L6.4 15ZM19 10h3v4h-3v-4Z"></path>',
    compass: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.5 5.5-2.6 6.4-6.4 2.6 2.6-6.4 6.4-2.6Z"></path>',
    wallet: '<path d="M5 5h12a2 2 0 0 1 2 2H7a3 3 0 0 0-3 3v7a3 3 0 0 1-1-2V8a3 3 0 0 1 3-3Zm2 4h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm10 4a2 2 0 1 0 0 4h5v-4h-5Z"></path>',
    chart: '<path d="M4 20h16v2H4v-2Zm1-8h4v6H5v-6Zm5-6h4v12h-4V6Zm5-4h4v16h-4V2Z"></path>',
    card: '<path d="M4 4h16a2 2 0 0 1 2 2v4H2V6a2 2 0 0 1 2-2Zm-2 8h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Zm4 3v2h6v-2H6Zm9 0v2h3v-2h-3Z"></path>',
    calendar: '<path d="M7 2h2v3h6V2h2v3h2a2 2 0 0 1 2 2v2H3V7a2 2 0 0 1 2-2h2V2Zm14 9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8h18Z"></path>',
    check: '<path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3.8 14.2 5.7-6.4L15 8.5l-4.3 4.9-1.8-1.8-1.4 1.4 3.3 3.2Z"></path>',
    bell: '<path d="M12 22a2.8 2.8 0 0 0 2.7-2h-5.4A2.8 2.8 0 0 0 12 22Zm7-6V10a7 7 0 0 0-5-6.7V2a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 10v6l-2 2v1h18v-1l-2-2Z"></path>',
    settings: '<path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 3a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 0 3l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.6 1.5l.4 3h4l.4-3a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"></path>',
    store: '<path d="M5 4h14l2 6H3l2-6Zm0 8h14v8H5v-8Zm5 6h4v-4h-4v4Z"></path>',
    files: '<path d="M6 2h8l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V8h4.5L13 3.5ZM8 11v2h8v-2H8Zm0 4v2h6v-2H8Z"></path>',
    admin: '<path d="M9 4h6a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2Zm6 4V6H9v2h6Zm-7 5v2h8v-2H8Z"></path>',
    audit: '<path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 2v3h6V4H9Zm1.8 12.2 5.7-6.4L15 8.5l-4.3 4.9-1.8-1.8-1.4 1.4 3.3 3.2Z"></path>',
    flag: '<path d="M5 3h2v18H5V3Zm4 1.2c3-1 4.9 1.5 8 .3.9-.3 1.6-.4 2-.3v10.6c-.9-.2-1.8 0-2.8.4-3 1.1-4.9-1.4-7.2-.3V4.2Z"></path>',
    gauge: '<path d="M12 4a10 10 0 0 0-10 10c0 1.8.5 3.5 1.3 5h17.4A10 10 0 0 0 12 4Zm1.7 10.7a2.5 2.5 0 1 1-3.4-3.4L16 7l-2.3 7.7Z"></path>',
    mapPin: '<path d="M12 2a7 7 0 0 0-7 7c0 5.6 7 13 7 13s7-7.4 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path>',
    actionPlan: '<path d="M6 10h4v10H6V10Zm6-6h4v16h-4V4Zm6 8h4v8h-4v-8ZM3 20h20v2H3v-2Z"></path>',
    rocket: '<path d="M13 3c2.8-1.1 5.8-1 8-.4.6 2.2.7 5.2-.4 8a14.3 14.3 0 0 1-6.4 7.1L8.3 11.8A14.3 14.3 0 0 1 13 3Zm2.8 5.2a2 2 0 1 0 2.8-2.8 2 2 0 0 0-2.8 2.8ZM7 13l4 4-2.4 2.4c-1.4 1.4-4.6 2-4.6 2s.6-3.2 2-4.6L7 13ZM7.6 10H3s.5-2.5 1.8-3.8C6.2 4.8 9 5 9 5a18 18 0 0 0-1.4 5Zm6.4 6.4c2.9-1.1 5-1.4 5-1.4s.2 2.8-1.2 4.2C16.5 20.5 14 21 14 21v-4.6Z"></path>',
    calculator: '<path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 4v4h8V6H8Zm0 7v2h2v-2H8Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H8Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z"></path>',
    requests: '<path d="M7 4h7l-3 3 3 3H7a3 3 0 0 0-3 3v1H2v-1a5 5 0 0 1 5-5h2.2L7 5.8V4Zm10 16h-7l3-3-3-3h7a3 3 0 0 0 3-3v-1h2v1a5 5 0 0 1-5 5h-2.2l2.2 2.2V20Z"></path>',
    training: '<path d="M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 8.2v4.4c3.5 2.4 8.5 2.4 12 0v-4.4l-6 3-6-3Z"></path>',
    chevronDown: '<path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6 1.4-1.4Z"></path>',
    external: '<path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H6v11h11v-5h2v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"></path>'
  };

  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    const normalized = hex.replace('#', '').trim();
    if (![3, 6, 8].includes(normalized.length)) return null;
    const expanded = normalized.length === 3
      ? normalized.split('').map((char) => char + char).join('')
      : normalized.slice(0, 6);
    const value = Number.parseInt(expanded, 16);
    if (Number.isNaN(value)) return null;
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  function getShellConfig() {
    return window.BipperShellConfig || {};
  }

  function resolveAssetUrl(url) {
    const config = getShellConfig();
    if (!url || /^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('/')) return url;
    if (!config.assetPathPrefix) return url;
    return `${config.assetPathPrefix.replace(/\/?$/, '/')}${url.replace(/^\/+/, '')}`;
  }

  function applyBrand(brand) {
    const root = document.documentElement;
    const primaryRgb = hexToRgb(brand.primary);

    root.style.setProperty('--brand-primary', brand.primary);
    root.style.setProperty('--brand-secondary', brand.secondary || brand.primary);
    root.style.setProperty('--brand-soft', brand.surfaceAlt || brand.surface || '#fff1e8');

    if (primaryRgb) {
      root.style.setProperty('--brand-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    }

    document.querySelectorAll('[data-logo]').forEach((logo) => {
      const variant = logo.dataset.logo === 'dark' ? 'logoDark' : 'logoLight';
      logo.src = resolveAssetUrl(brand[variant] || brand.logoLight);
      logo.alt = brand.name;
    });

    document.querySelectorAll('[data-footer-logo]').forEach((logo) => {
      const variant = logo.dataset.footerLogo === 'dark' ? 'footerLogoDark' : 'footerLogoLight';
      const fallback = logo.dataset.footerLogo === 'dark' ? brand.logoDark : brand.logoLight;
      logo.src = resolveAssetUrl(brand[variant] || fallback || brand.logoLight);
      logo.alt = brand.footerLogoName || brand.name;
    });

    document.querySelectorAll('[data-brand-name]').forEach((el) => {
      el.textContent = brand.name;
    });
  }

  function createIcon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = ICONS[name] || ICONS.external;
    return svg;
  }

  function resolveMenuHref(item, links) {
    if (item.href) return item.href;
    if (item.linkKey && links && links[item.linkKey]) return links[item.linkKey];
    return '#';
  }

  function isMenuItemActive(item, activeKey) {
    if (item.active || (item.key && item.key === activeKey)) return true;
    return (item.children || []).some((child) => isMenuItemActive(child, activeKey));
  }

  function isMenuItemSelfActive(item, activeKey) {
    return Boolean(item.active || (item.key && item.key === activeKey));
  }

  function hasActiveDescendant(item, activeKey) {
    return (item.children || []).some((child) => isMenuItemActive(child, activeKey));
  }

  function createMenuItem(item, config) {
    const activeKey = config.active || config.app;
    const selfActive = isMenuItemSelfActive(item, activeKey);
    const descendantActive = hasActiveDescendant(item, activeKey);
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const link = hasChildren ? document.createElement('button') : document.createElement('a');

    link.className = 'nav-link';
    link.dataset.tooltip = item.label;
    link.setAttribute('aria-label', item.label);
    if (item.key) link.dataset.navKey = item.key;
    if (hasChildren) {
      link.type = 'button';
      link.setAttribute('aria-expanded', String(descendantActive));
      link.dataset.href = resolveMenuHref(item, config.links);
    } else {
      link.href = resolveMenuHref(item, config.links);
    }
    // Pai que também é página real (ex.: "Projetos") ainda recebe o realce quando é a página atual.
    if (selfActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    if (hasChildren) link.classList.add('nav-link--parent');
    if (!hasChildren) {
      if (item.target) link.target = item.target;
      if (item.rel) link.rel = item.rel;
      if (item.external) {
        link.target = item.target || '_blank';
        link.rel = item.rel || 'noopener noreferrer';
      }
    }

    link.appendChild(createIcon(item.icon));

    const label = document.createElement('span');
    label.className = 'nav-link__label';
    label.textContent = item.label;
    link.appendChild(label);

    if (item.badge !== undefined && item.badge !== null && item.badge !== '') {
      const badge = document.createElement('span');
      badge.className = 'nav-badge';
      badge.textContent = item.badge;
      link.appendChild(badge);
    }

    if (hasChildren) {
      const chevron = createIcon('chevronDown');
      chevron.classList.add('nav-link__chevron');
      link.appendChild(chevron);
    }

    return link;
  }

  function createSubmenuItem(item, config) {
    // Subitem que tem filhos vira um mini-grupo recolhível (2º nível de submenu).
    if (Array.isArray(item.children) && item.children.length > 0) {
      return createNestedGroup(item, config);
    }

    const activeKey = config.active || config.app;
    const link = document.createElement('a');
    const isActive = item.active || (item.key && item.key === activeKey);

    link.className = 'nav-submenu__link';
    link.href = resolveMenuHref(item, config.links);
    if (item.key) link.dataset.navKey = item.key;
    if (isActive) link.classList.add('active');
    if (isActive) link.setAttribute('aria-current', 'page');
    if (item.target) link.target = item.target;
    if (item.rel) link.rel = item.rel;
    if (item.external) {
      link.target = item.target || '_blank';
      link.rel = item.rel || 'noopener noreferrer';
    }
    // Rótulo em <span> truncável (1 linha + reticências). O nome completo aparece
    // no tooltip estilizado (::after) só quando o texto de fato truncou — ver updateNavTruncation().
    const label = document.createElement('span');
    label.className = 'nav-submenu__label';
    label.textContent = item.label;
    link.appendChild(label);
    link.dataset.tooltip = item.label;

    return link;
  }

  function createNestedGroup(item, config) {
    const activeKey = config.active || config.app;
    const openByDefault = hasActiveDescendant(item, activeKey);

    const group = document.createElement('div');
    group.className = 'nav-group nav-group--nested has-children';
    if (openByDefault) group.classList.add('has-active', 'is-open');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-submenu__link nav-submenu__link--parent';
    toggle.dataset.tooltip = item.label;
    toggle.setAttribute('aria-label', item.label);
    toggle.setAttribute('aria-expanded', String(openByDefault));
    if (item.key) toggle.dataset.navKey = item.key;
    toggle.dataset.href = resolveMenuHref(item, config.links);
    if (item.icon) {
      const icon = createIcon(item.icon);
      icon.classList.add('nav-submenu__link-icon');
      toggle.appendChild(icon);
    }
    const label = document.createElement('span');
    label.className = 'nav-submenu__label';
    label.textContent = item.label;
    toggle.appendChild(label);
    const chevron = createIcon('chevronDown');
    chevron.classList.add('nav-link__chevron');
    toggle.appendChild(chevron);
    group.appendChild(toggle);

    const submenu = document.createElement('div');
    submenu.className = 'nav-submenu nav-submenu--nested';
    submenu.setAttribute('aria-label', item.label);
    submenu.hidden = !openByDefault;
    item.children.forEach((child) => {
      submenu.appendChild(createSubmenuItem(child, config));
    });
    group.appendChild(submenu);

    toggle.addEventListener('click', () => {
      const isMobile = window.matchMedia('(max-width: 980px)').matches;
      if (!isMobile && document.body.classList.contains('sidebar-collapsed')) {
        const href = toggle.dataset.href;
        if (href && href !== '#') window.location.href = href;
        return;
      }
      const willOpen = !group.classList.contains('is-open');
      group.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
      submenu.hidden = !willOpen;
    });

    return group;
  }

  function createMenuGroup(item, config) {
    const group = document.createElement('div');
    const activeKey = config.active || config.app;
    const selfActive = isMenuItemSelfActive(item, activeKey);
    const descendantActive = hasActiveDescendant(item, activeKey);

    group.className = 'nav-group';
    // Abre só quando estamos numa página FILHA — na própria página do pai fica recolhido.
    if (descendantActive) group.classList.add('has-active', 'is-open');
    if (selfActive && !descendantActive) group.classList.add('is-self-active');
    group.appendChild(createMenuItem(item, config));

    if (Array.isArray(item.children) && item.children.length > 0) {
      group.classList.add('has-children');
      const parentButton = group.querySelector('.nav-link--parent');
      const submenu = document.createElement('div');
      submenu.className = 'nav-submenu';
      submenu.setAttribute('aria-label', item.label);
      submenu.hidden = !descendantActive;

      item.children.forEach((child) => {
        submenu.appendChild(createSubmenuItem(child, config));
      });

      group.appendChild(submenu);

      parentButton?.addEventListener('click', () => {
        const isMobile = window.matchMedia('(max-width: 980px)').matches;
        if (!isMobile && document.body.classList.contains('sidebar-collapsed')) {
          const href = parentButton.dataset.href;
          if (href && href !== '#') window.location.href = href;
          return;
        }

        const willOpen = !group.classList.contains('is-open');
        group.classList.toggle('is-open', willOpen);
        parentButton.setAttribute('aria-expanded', String(willOpen));
        submenu.hidden = !willOpen;
      });
    }

    return group;
  }

  function renderMenu(menuRoot, menuConfig) {
    const shellConfig = getShellConfig();
    const mergedConfig = {
      ...menuConfig,
      ...shellConfig,
      links: {
        ...(menuConfig.links || {}),
        ...(shellConfig.links || {})
      }
    };

    menuRoot.innerHTML = '';

    (menuConfig.sections || []).forEach((section) => {
      const nav = document.createElement('nav');
      nav.className = 'nav-section';
      nav.setAttribute('aria-label', section.ariaLabel || section.title || 'Menu');

      if (section.title) {
        const title = document.createElement('h2');
        title.textContent = section.title;
        nav.appendChild(title);
      }

      (section.items || []).forEach((item) => {
        nav.appendChild(createMenuGroup(item, mergedConfig));
      });

      menuRoot.appendChild(nav);
    });

    document.dispatchEvent(new CustomEvent('app-shell:menu-ready'));
  }

  // Marca com .is-truncated os itens cujo rótulo não coube em 1 linha. Só nesses o
  // tooltip estilizado (::after com data-tooltip) aparece no hover — assim ele não
  // repete um texto que já está visível.
  function updateNavTruncation() {
    const items = document.querySelectorAll(
      '[data-shell-menu] .nav-link, [data-shell-menu] .nav-submenu__link'
    );
    items.forEach((host) => {
      const label = host.querySelector('.nav-link__label, .nav-submenu__label');
      if (!label || label.offsetParent === null) {
        host.classList.remove('is-truncated');
        return;
      }
      host.classList.toggle('is-truncated', label.scrollWidth - label.clientWidth > 1);
    });
  }

  function updateProfileTruncation() {
    document.querySelectorAll('.sidebar-profile strong, .sidebar-profile small').forEach((line) => {
      const isTruncated = line.scrollWidth - line.clientWidth > 1;
      line.classList.toggle('is-truncated', isTruncated);
      if (isTruncated) line.dataset.tooltip = line.textContent.trim();
      else delete line.dataset.tooltip;
    });
  }

  let navTruncTimer;
  function scheduleNavTruncation() {
    window.clearTimeout(navTruncTimer);
    navTruncTimer = window.setTimeout(() => {
      updateNavTruncation();
      updateProfileTruncation();
    }, 120);
  }

  document.addEventListener('app-shell:menu-ready', () => {
    updateNavTruncation();
    updateProfileTruncation();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateNavTruncation();
        updateProfileTruncation();
      });
    }
  });
  window.addEventListener('resize', scheduleNavTruncation);
  document.addEventListener('click', (event) => {
    const el = event.target instanceof Element ? event.target : null;
    if (el && el.closest('[data-shell-menu] .nav-link--parent, [data-shell-menu] .nav-submenu__link--parent, #sidebarToggle')) {
      window.requestAnimationFrame(updateNavTruncation);
    }
  });

  function setNavBadge(key, count) {
    const link = document.querySelector(`[data-nav-key="${key}"]`);
    if (!link) return;
    const value = Number(count) || 0;
    let badge = link.querySelector('.nav-badge');
    if (value <= 0) {
      badge?.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      const chevron = link.querySelector('.nav-link__chevron');
      if (chevron) link.insertBefore(badge, chevron);
      else link.appendChild(badge);
    }
    badge.textContent = value > 99 ? '99+' : String(value);
  }

  async function initMenu() {
    const menuRoot = document.querySelector('[data-shell-menu]');
    if (!menuRoot) return;

    const config = getShellConfig();
    const menuUrl = config.menuUrl || menuRoot.dataset.menuUrl || DEFAULT_MENU_URL;
    if (!menuUrl) return;

    document.addEventListener('app-shell:menu-ready', applySupportBadges);
    document.addEventListener('app-shell:menu-ready', applyRoleMenuVisibility);
    const response = await fetch(menuUrl);
    const menuConfig = await response.json();
    renderMenu(menuRoot, menuConfig);
  }

  // Mantém os badges de "Suporte" visíveis em qualquer página do portal, não só
  // quando a seção está aberta. Lê os tickets do protótipo direto do localStorage
  // (mesma chave usada em central-suporte/data.js); se ainda não houver nada salvo
  // (ex.: storage limpo e nenhuma tela de Suporte visitada), usa a contagem inicial
  // do protótipo como placeholder.
  const SUPPORT_TICKETS_STORAGE_KEY = 'supportPrototypeTicketsV3';
  const SUPPORT_BADGE_FALLBACK = { admin: 3, client: 1 };

  function applySupportBadges() {
    let adminUnread = SUPPORT_BADGE_FALLBACK.admin;
    let clientUnread = SUPPORT_BADGE_FALLBACK.client;
    try {
      const stored = JSON.parse(localStorage.getItem(SUPPORT_TICKETS_STORAGE_KEY));
      if (Array.isArray(stored)) {
        adminUnread = stored.reduce((sum, t) => sum + Number(t?.unreadSupport || 0), 0);
        clientUnread = stored.filter((t) => t?.company === 'Zoetis').reduce((sum, t) => sum + Number(t?.unreadClient || 0), 0);
      }
    } catch {
      // storage indisponível ou corrompido; mantém o placeholder inicial
    }
    setNavBadge('central-suporte-admin', adminUnread);
    setNavBadge('central-suporte-cliente', clientUnread);
  }

   function applyRoleMenuVisibility() {
    const session = getAuthSession();
    if (!session || !session.role) return;
    Object.entries(ROLE_GATES).forEach(([key, gate]) => {
      if (session.role === gate.role) return;
      document.querySelector(`[data-nav-key="${key}"]`)?.classList.add('hide');
    });
  }

  function createGroupLabel(label) {
    const group = document.createElement('div');
    group.className = 'brand-dropdown__group';
    group.textContent = label;
    return group;
  }

  function createDivider() {
    const divider = document.createElement('div');
    divider.className = 'brand-dropdown__divider';
    return divider;
  }

  function setActiveBrand(dropdown, activeKey) {
    dropdown.querySelectorAll('.brand-dropdown__item').forEach((item) => {
      item.classList.toggle('active', item.dataset.brand === activeKey);
    });
  }

  function closeBrandDropdown(brandContainer) {
    const dropdown = brandContainer.querySelector('.brand-dropdown');
    const logoBtn = brandContainer.querySelector('.brand__logo-btn');
    dropdown?.classList.remove('visible');
    resetCollapsedBrandDropdown(dropdown);
    brandContainer.classList.remove('open');
    logoBtn?.setAttribute('aria-expanded', 'false');
  }

  function resetCollapsedBrandDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.style.position = '';
    dropdown.style.top = '';
    dropdown.style.left = '';
    dropdown.style.width = '';
    dropdown.style.maxWidth = '';
    dropdown.style.zIndex = '';
  }

  function positionCollapsedBrandDropdown(brandContainer) {
    const dropdown = brandContainer.querySelector('.brand-dropdown');
    const sidebar = brandContainer.closest('.sidebar');
    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
    const isMobile = window.matchMedia('(max-width: 980px)').matches;
    if (!dropdown || !sidebar || !isCollapsed || isMobile) {
      resetCollapsedBrandDropdown(dropdown);
      return;
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const brandRect = brandContainer.getBoundingClientRect();
    const gap = 120;
    const width = Math.min(236, Math.max(180, window.innerWidth - sidebarRect.right - gap - 12));

    dropdown.style.position = 'fixed';
    dropdown.style.top = Math.max(12, brandRect.top) + 'px';
    dropdown.style.left = (sidebarRect.right + gap) + 'px';
    dropdown.style.width = width + 'px';
    dropdown.style.maxWidth = 'calc(100vw - ' + (sidebarRect.right + gap + 12) + 'px)';
    dropdown.style.zIndex = '220';
  }

  function toggleBrandDropdown(brandContainer) {
    const dropdown = brandContainer.querySelector('.brand-dropdown');
    const logoBtn = brandContainer.querySelector('.brand__logo-btn');
    const willOpen = !dropdown?.classList.contains('visible');
    dropdown?.classList.toggle('visible', willOpen);
    brandContainer.classList.toggle('open', willOpen);
    logoBtn?.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) positionCollapsedBrandDropdown(brandContainer);
    else resetCollapsedBrandDropdown(dropdown);
  }

  function buildBrandDropdown(brandContainer, brands, activeKey) {
    const dropdown = brandContainer.querySelector('.brand-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';
    const entries = Object.entries(brands);
    const primaryEntry = entries.find(([key]) => key === 'zoetis');
    const resellerEntries = entries.filter(([, brand]) => brand.group === 'Revendas');
    const remainingBrandEntries = entries.filter(([key, brand]) => (
      key !== 'zoetis' && (brand.group || 'Marcas') === 'Marcas'
    ));

    const sections = [
      primaryEntry ? { label: null, entries: [primaryEntry] } : null,
      remainingBrandEntries.length ? { label: 'Marcas', entries: remainingBrandEntries } : null,
      resellerEntries.length ? { label: 'Revendas', entries: resellerEntries } : null
    ].filter(Boolean);

    sections.forEach((section, index) => {
      if (index > 0) dropdown.appendChild(createDivider());
      if (section.label) dropdown.appendChild(createGroupLabel(section.label));

      section.entries.forEach(([key, brand]) => {
        const group = brand.group || 'Marcas';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'brand-dropdown__item';
        button.dataset.brand = key;
        button.dataset.group = group;
        button.setAttribute('role', 'menuitem');

        if (group !== 'Marcas') button.classList.add('brand-dropdown__item--reseller');

        if (group === 'Marcas') {
          const dot = document.createElement('span');
          dot.className = 'brand-dropdown__dot';
          dot.style.background = brand.primary;
          button.appendChild(dot);
        }

        const name = document.createElement('span');
        name.textContent = brand.name;
        button.appendChild(name);

        button.addEventListener('click', () => {
          localStorage.setItem(STORAGE_KEY, key);
          applyBrand(brand);
          setActiveBrand(dropdown, key);
          closeBrandDropdown(brandContainer);
          document.dispatchEvent(new CustomEvent('app-shell:brand-change', {
            detail: { key, brand }
          }));
        });

        dropdown.appendChild(button);
      });
    });

    setActiveBrand(dropdown, activeKey);
  }

  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const openMenuButton = document.getElementById('openMenu');
    const sidebarToggleButton = document.getElementById('sidebarToggle');

    if (!sidebar || sidebar.dataset.shellSidebarInitialized === 'true') return;
    sidebar.dataset.shellSidebarInitialized = 'true';

    if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true') {
      document.body.classList.add('sidebar-collapsed');
    }

    const syncState = () => {
      const isMobile = window.matchMedia('(max-width: 980px)').matches;
      const isOpen = sidebar.classList.contains('is-open');
      overlay?.classList.toggle('is-visible', isMobile && isOpen);
      document.body.classList.toggle('sidebar-open', isMobile && isOpen);
      sidebarToggleButton?.setAttribute('aria-expanded', String(!document.body.classList.contains('sidebar-collapsed')));
      openMenuButton?.setAttribute('aria-expanded', String(isOpen));
    };

    const closeMobileSidebar = () => {
      sidebar.classList.remove('is-open');
      syncState();
    };

    openMenuButton?.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      syncState();
    });

    sidebarToggleButton?.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 980px)').matches) {
        sidebar.classList.toggle('is-open');
      } else {
        document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem(
          SIDEBAR_STORAGE_KEY,
          String(document.body.classList.contains('sidebar-collapsed'))
        );
      }
      syncState();
    });

    overlay?.addEventListener('click', closeMobileSidebar);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
        closeMobileSidebar();
      }
    });

    window.addEventListener('resize', syncState);
    syncState();
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function initTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    applyTheme(storedTheme);

    const buttons = document.querySelectorAll('.theme-toggle [data-theme-choice]');
    if (!buttons.length) return;

    const syncButtons = (theme) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.themeChoice === theme;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    };

    syncButtons(storedTheme);

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const theme = button.dataset.themeChoice === 'dark' ? 'dark' : 'light';
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        applyTheme(theme);
        syncButtons(theme);
        document.dispatchEvent(new CustomEvent('app-shell:theme-change', {
          detail: { theme }
        }));
      });
    });
  }

  async function initBrands() {
    const brandContainer = document.querySelector('.brand');
    if (!brandContainer) return;

    const brandsUrl = brandContainer.dataset.brandsUrl || DEFAULT_BRANDS_URL;
    const response = await fetch(brandsUrl);
    const brands = await response.json();
    const storedKey = localStorage.getItem(STORAGE_KEY);
    const activeKey = brands[storedKey] ? storedKey : (brands.zoetis ? 'zoetis' : Object.keys(brands)[0]);
    const activeBrand = brands[activeKey];

    buildBrandDropdown(brandContainer, brands, activeKey);
    applyBrand(activeBrand);

    const logoBtn = brandContainer.querySelector('.brand__logo-btn');
    logoBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleBrandDropdown(brandContainer);
    });

    document.addEventListener('click', (event) => {
      if (!brandContainer.contains(event.target)) closeBrandDropdown(brandContainer);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeBrandDropdown(brandContainer);
    });

    window.addEventListener('resize', () => {
      if (brandContainer.classList.contains('open')) positionCollapsedBrandDropdown(brandContainer);
    });

    window.addEventListener('scroll', () => {
      if (brandContainer.classList.contains('open')) positionCollapsedBrandDropdown(brandContainer);
    }, { passive: true });
  }

  function initPageTransitions() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== '_self') return;

      const href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;

      let targetUrl;
      try {
        targetUrl = new URL(link.href, window.location.href);
      } catch (error) {
        return;
      }

      if (targetUrl.origin !== window.location.origin) return;
      if (targetUrl.href === window.location.href) return;

      event.preventDefault();
      document.body.classList.add('is-page-leaving');
      window.setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 130);
    });
  }

  function getAuthSession() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));
    } catch {
      return null;
    }
  }

  function getInitials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  }

  function enforceRoleGate(session) {
    const gate = ROLE_GATES[getShellConfig().active];
    if (!gate || session.role === gate.role) return false;
    const prefix = getShellConfig().assetPathPrefix || '';
    window.location.replace(`${prefix}${gate.fallbackPath}`);
    return true;
  }

  function enforceAuthGuard() {
    if (!document.getElementById('sidebar')) return false;
    if (getShellConfig().publicPage) return false;
    const session = getAuthSession();
    if (!session) {
      const prefix = getShellConfig().assetPathPrefix || '';
      window.location.replace(`${prefix}login.html`);
      return true;
    }
    return enforceRoleGate(session);
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    const prefix = getShellConfig().assetPathPrefix || '';
    window.location.href = `${prefix}login.html`;
  }

  function buildLogoutButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sidebar-profile__logout';
    button.dataset.tooltip = 'Sair';
    button.setAttribute('aria-label', 'Sair');
    button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>';
    button.addEventListener('click', logout);
    return button;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  // Monta o bloco de perfil onde houver <div data-shell-profile> (sidebar) ou
  // <div data-shell-profile="topbar">, para não duplicar esse HTML em cada página.
  function renderShellProfile() {
    const hosts = document.querySelectorAll('[data-shell-profile]');
    if (!hosts.length) return;
    const profile = { ...DEFAULT_PROFILE, ...(getShellConfig().profile || {}) };
    const initials = profile.initials || getInitials(profile.name || '');

    hosts.forEach((host) => {
      const isTopbar = host.dataset.shellProfile === 'topbar';
      host.classList.add(isTopbar ? 'profile' : 'sidebar-profile');
      host.setAttribute('aria-label', 'Perfil do usuário');

      const lines = isTopbar
        ? `<strong>${escapeHtml(profile.name)}</strong>`
          + `<small>${escapeHtml(profile.topbarRole || profile.role || '')}</small>`
        : `<strong>${escapeHtml(profile.name)}</strong>`
          + (profile.role ? `<small>${escapeHtml(profile.role)}</small>` : '')
          + (profile.email ? `<small data-profile-email>${escapeHtml(profile.email)}</small>` : '');

      host.innerHTML = `<span class="avatar">${escapeHtml(initials)}</span><div class="sidebar-profile__body">${lines}</div>`;
      const body = host.querySelector('.sidebar-profile__body');
      body?.addEventListener('mouseover', (event) => {
        const line = event.target.closest('strong.is-truncated, small.is-truncated');
        if (line && body.contains(line)) body.dataset.profileTooltip = line.textContent.trim();
      });
      body?.addEventListener('mouseout', (event) => {
        const line = event.target.closest('strong.is-truncated, small.is-truncated');
        if (line && body.contains(line)) delete body.dataset.profileTooltip;
      });
    });
    updateProfileTruncation();
  }

  function applyAuthSession() {
    const session = getAuthSession();
    if (!session || !session.name) return;
    document.querySelectorAll('.sidebar-profile, .profile').forEach((profile) => {
      const avatar = profile.querySelector('.avatar');
      const name = profile.querySelector('strong');
      const email = profile.querySelector('[data-profile-email]') || profile.querySelector('small');
      if (avatar) avatar.textContent = getInitials(session.name);
      if (name) name.textContent = session.name;
      if (email && session.email) email.textContent = session.email;
    });
    document.querySelectorAll('.sidebar-profile').forEach((profile) => {
      if (!profile.querySelector('.sidebar-profile__logout')) {
        profile.appendChild(buildLogoutButton());
      }
    });
    updateProfileTruncation();
  }

  function checkPrimaryAccentButtons() {
    const accentButtons = document.querySelectorAll('.btn-primary-acent');
    if (accentButtons.length > 1) {
      console.warn(
        `[Bipper] Encontrados ${accentButtons.length} elementos ".btn-primary-acent" nesta tela. ` +
        'A regra e ter no maximo um botao com a cor do cliente por tela.',
        accentButtons
      );
    }
  }

  async function initAppShell() {
    if (enforceAuthGuard()) return;
    initTheme();
    initSidebar();
    initPageTransitions();
    checkPrimaryAccentButtons();
    renderShellProfile();
    applyAuthSession();
    try {
      await initMenu();
    } catch (error) {
      console.error('Nao foi possivel carregar o menu do app shell.', error);
    }
    try {
      await initBrands();
    } catch (error) {
      console.error('Nao foi possivel carregar as marcas do app shell.', error);
    }
  }

  window.BipperShell = window.BipperShell || {};
  window.BipperShell.setNavBadge = setNavBadge;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppShell);
  } else {
    initAppShell();
  }
})();


