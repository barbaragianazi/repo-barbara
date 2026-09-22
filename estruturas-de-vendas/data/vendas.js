(function () {
  'use strict';

  var tree = [
    {
      id: '1',
      sap: '',
      description: 'BRASIL',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'Brasil',
      ativo: true,
      children: [
        {
          id: '2',
          sap: '',
          description: 'BU Líder - Animais de Companhia',
          responsavel: 'Simone Leiderman',
          linhaNegocio: 'Animais de Companhia',
          tipoPosicao: 'BU Líder',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: '44',
              sap: '',
              description: 'BU Líder - Animais de Companhia',
              responsavel: 'Fabio Feitosa',
              linhaNegocio: 'Vetscan',
              tipoPosicao: 'BU Líder',
              pais: 'Brasil',
              ativo: true,
              children: [
                {
                  id: '61',
                  sap: '',
                  description: 'Marketing Estagiária',
                  responsavel: 'Sara Silva',
                  linhaNegocio: 'Vetscan',
                  tipoPosicao: 'Solicitações - Solicitante',
                  pais: 'Brasil',
                  ativo: true,
                  children: []
                }
              ]
            },
            {
              id: '78',
              sap: '',
              description: 'Comercial - Gerente Comercial',
              responsavel: 'Danielle Damasceno',
              linhaNegocio: 'Animais de Companhia',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Brasil',
              cidade: 'Rio de Janeiro',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: '3',
          sap: '',
          description: 'BU Líder - Aves e Acqua',
          responsavel: 'Denise Rodrigues',
          linhaNegocio: 'Aqua | Aves',
          tipoPosicao: 'BU Líder',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: '11',
              sap: '',
              description: 'Comercial - Gerente Comercial',
              responsavel: 'Danielle Damasceno',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Brasil',
              ativo: true,
              children: [
                {
                  id: '76',
                  sap: '',
                  description: 'Comercial - Analista de Vendas',
                  responsavel: 'Jaquiel Bampi',
                  linhaNegocio: 'Aqua | Aves',
                  tipoPosicao: 'Solicitações - Solicitante',
                  pais: 'Brasil',
                  ativo: true,
                  children: []
                }
              ]
            },
            {
              id: '12',
              sap: '',
              description: 'Comercial - Gerente Comercial',
              responsavel: 'Edson Ploncoski',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Brasil',
              ativo: true,
              children: [
                {
                  id: '77',
                  sap: '',
                  description: 'Comercial - Analista de Vendas',
                  responsavel: '',
                  linhaNegocio: 'Aqua | Aves',
                  tipoPosicao: 'Solicitações - Solicitante',
                  pais: 'Brasil',
                  cidade: 'Rio de Janeiro',
                  ativo: true,
                  children: []
                }
              ]
            },
            {
              id: '42',
              sap: '',
              description: 'Marketing - Gerente de Produto',
              responsavel: 'Gleidson Salles',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Brasil',
              ativo: true,
              children: []
            },
            {
              id: '64',
              sap: '',
              description: 'Marketing - Gerente de Produto',
              responsavel: 'Jaquiel Bampi',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Brasil',
              ativo: true,
              children: []
            },
            {
              id: '49',
              sap: '',
              description: 'Técnico',
              responsavel: '',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Técnico',
              pais: 'Brasil',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: '4',
          sap: '',
          description: 'BU Líder - Ruminantes',
          responsavel: 'Catarina Lopes',
          linhaNegocio: 'Bovinos',
          tipoPosicao: 'BU Líder',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: '71',
              sap: '',
              description: 'Comercial - Gerente Regional Sul',
              responsavel: 'Edson Ploncoski',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Brasil',
              cidade: 'Curitiba',
              ativo: true,
              children: [
                {
                  id: '72',
                  sap: '',
                  description: 'Comercial - Representante Paraná',
                  responsavel: 'Gleidson Salles',
                  linhaNegocio: 'Bovinos',
                  tipoPosicao: 'Solicitações - Solicitante',
                  pais: 'Brasil',
                  cidade: 'Curitiba',
                  ativo: true,
                  children: []
                },
                {
                  id: '73',
                  sap: '',
                  description: 'Comercial - Representante Rio Grande do Sul',
                  responsavel: 'Sara Silva',
                  linhaNegocio: 'Bovinos',
                  tipoPosicao: 'Solicitações - Solicitante',
                  pais: 'Brasil',
                  cidade: 'Porto Alegre',
                  ativo: false,
                  children: []
                }
              ]
            },
            {
              id: '74',
              sap: '',
              description: 'Técnico - Especialista de campo',
              responsavel: '',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Técnico',
              pais: 'Brasil',
              cidade: 'Belo Horizonte',
              ativo: true,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 'ar-1',
      sap: '',
      description: 'ARGENTINA',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'Argentina',
      ativo: true,
      children: [
        {
          id: 'ar-2',
          sap: '',
          description: 'BU Líder - Animais de Companhia',
          responsavel: 'Martina Gómez',
          linhaNegocio: 'Animais de Companhia',
          tipoPosicao: 'BU Líder',
          pais: 'Argentina',
          ativo: true,
          children: [
            {
              id: 'ar-3',
              sap: '',
              description: 'Marketing - Gerente de Produto',
              responsavel: 'Lucas Fernández',
              linhaNegocio: 'Animais de Companhia',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Argentina',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: 'ar-4',
          sap: '',
          description: 'BU Líder - Ruminantes',
          responsavel: 'Valentina Rossi',
          linhaNegocio: 'Bovinos',
          tipoPosicao: 'BU Líder',
          pais: 'Argentina',
          ativo: true,
          children: [
            {
              id: 'ar-5',
              sap: '',
              description: 'Comercial - Gerente Comercial',
              responsavel: 'Lucas Fernández',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Argentina',
              ativo: true,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 'mx-1',
      sap: '',
      description: 'MÉXICO',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'México',
      ativo: true,
      children: [
        {
          id: 'mx-2',
          sap: '',
          description: 'BU Líder - Animais de Companhia',
          responsavel: 'Sofía Hernández',
          linhaNegocio: 'Animais de Companhia',
          tipoPosicao: 'BU Líder',
          pais: 'México',
          ativo: true,
          children: [
            {
              id: 'mx-3',
              sap: '',
              description: 'Marketing Estagiário',
              responsavel: 'Diego Ramírez',
              linhaNegocio: 'Vetscan',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'México',
              ativo: false,
              children: []
            }
          ]
        },
        {
          id: 'mx-4',
          sap: '',
          description: 'BU Líder - Aves e Aqua',
          responsavel: 'Camila Torres',
          linhaNegocio: 'Aqua | Aves',
          tipoPosicao: 'BU Líder',
          pais: 'México',
          ativo: true,
          children: [
            {
              id: 'mx-5',
              sap: '',
              description: 'Comercial - Gerente Comercial',
              responsavel: 'Diego Ramírez',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'México',
              ativo: true,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 'co-1',
      sap: '',
      description: 'COLÔMBIA',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'Colômbia',
      ativo: true,
      children: [
        {
          id: 'co-2',
          sap: '',
          description: 'BU Líder - Ruminantes',
          responsavel: 'Mariana Gómez',
          linhaNegocio: 'Bovinos',
          tipoPosicao: 'BU Líder',
          pais: 'Colômbia',
          ativo: true,
          children: [
            {
              id: 'co-3',
              sap: '',
              description: 'Técnico',
              responsavel: '',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Técnico',
              pais: 'Colômbia',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: 'co-4',
          sap: '',
          description: 'BU Líder - Suínos',
          responsavel: 'Andrés Castro',
          linhaNegocio: 'Suínos',
          tipoPosicao: 'BU Líder',
          pais: 'Colômbia',
          ativo: true,
          children: [
            {
              id: 'co-5',
              sap: '',
              description: 'Comercial - Representante',
              responsavel: 'Camila Torres',
              linhaNegocio: 'Suínos',
              tipoPosicao: 'Solicitações - Solicitante',
              pais: 'Colômbia',
              ativo: false,
              children: []
            }
          ]
        }
      ]
    }
  ];

  var cidades = { Brasil: 'São Paulo', Argentina: 'Buenos Aires', México: 'Cidade do México', Colômbia: 'Bogotá', Chile: 'Santiago', Peru: 'Lima', Equador: 'Quito', Paraguai: 'Assunção', Uruguai: 'Montevidéu' };
  var cores = ['#009bb5', '#e85d04', '#2563eb', '#16a34a', '#7c3aed'];
  var acessos = [['Web'], ['Web', 'Mobile'], ['Portal do Parceiro'], ['Web', 'API']];
  var hashId = window.BipperSalesStructure.hashId;
  (function enrich(nodes) {
    nodes.forEach(function (node) {
      var h = hashId(node.id);
      // cidade própria do nó tem prioridade; senão, a capital do país.
      node.cidade = node.cidade || cidades[node.pais] || '—';
      node.franquia = h % 3 === 0;
      node.corDestaque = cores[h % cores.length];
      node.tipoAcessoList = acessos[(h >>> 4) % acessos.length].slice();
      if (node.children && node.children.length) enrich(node.children);
    });
  })(tree);

  window.BipperSalesStructure = window.BipperSalesStructure || {};
  window.BipperSalesStructure.areas = window.BipperSalesStructure.areas || {};
  window.BipperSalesStructure.areas.vendas = { tree: tree };
})();
