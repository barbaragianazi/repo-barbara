(function () {
  'use strict';

  var tree = [
    {
      id: 'tec-1',
      sap: '',
      description: 'BRASIL',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'Brasil',
      ativo: true,
      children: [
        {
          id: 'tec-2',
          sap: '',
          description: 'Especialista de campo - Animais de Companhia',
          responsavel: 'Edson Ploncoski',
          linhaNegocio: 'Animais de Companhia',
          tipoPosicao: 'Especialista de campo',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: 'tec-3',
              sap: '',
              description: 'Consultoria técnica - Vetscan',
              responsavel: 'Catarina Lopes',
              linhaNegocio: 'Vetscan',
              tipoPosicao: 'Consultoria técnica',
              pais: 'Brasil',
              ativo: true,
              children: [
                {
                  id: 'tec-4',
                  sap: '',
                  description: 'Suporte veterinário - Vetscan',
                  responsavel: 'Rodrigo Quispe',
                  linhaNegocio: 'Vetscan',
                  tipoPosicao: 'Suporte veterinário',
                  pais: 'Brasil',
                  ativo: true,
                  children: []
                }
              ]
            },
            {
              id: 'tec-9',
              sap: '',
              description: 'Suporte veterinário - Animais de Companhia (São Paulo)',
              responsavel: 'Danielle Damasceno',
              linhaNegocio: 'Animais de Companhia',
              tipoPosicao: 'Suporte veterinário',
              pais: 'Brasil',
              cidade: 'São Paulo',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: 'tec-5',
          sap: '',
          description: 'Coordenação técnica - Aqua | Aves',
          responsavel: 'Ricardo Benítez',
          linhaNegocio: 'Aqua | Aves',
          tipoPosicao: 'Coordenação técnica',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: 'tec-6',
              sap: '',
              description: 'Especialista de campo - Aqua | Aves',
              responsavel: 'Danielle Damasceno',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Especialista de campo',
              pais: 'Brasil',
              ativo: true,
              children: [
                {
                  id: 'tec-10',
                  sap: '',
                  description: 'Suporte veterinário - Aqua | Aves (Sul)',
                  responsavel: 'Rodrigo Quispe',
                  linhaNegocio: 'Aqua | Aves',
                  tipoPosicao: 'Suporte veterinário',
                  pais: 'Brasil',
                  cidade: 'Porto Alegre',
                  ativo: true,
                  children: []
                }
              ]
            },
            {
              id: 'tec-7',
              sap: '',
              description: 'Consultoria técnica - Aqua | Aves',
              responsavel: 'Edson Ploncoski',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Consultoria técnica',
              pais: 'Brasil',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: 'tec-8',
          sap: '',
          description: 'Suporte veterinário - Bovinos',
          responsavel: 'Catarina Lopes',
          linhaNegocio: 'Bovinos',
          tipoPosicao: 'Suporte veterinário',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: 'tec-11',
              sap: '',
              description: 'Especialista de campo - Bovinos (Sul)',
              responsavel: 'Ricardo Benítez',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Especialista de campo',
              pais: 'Brasil',
              cidade: 'Curitiba',
              ativo: true,
              children: []
            },
            {
              id: 'tec-12',
              sap: '',
              description: 'Especialista de campo - Bovinos (Sudeste)',
              responsavel: '',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Especialista de campo',
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
      id: 'tec-ar-1',
      sap: '',
      description: 'ARGENTINA',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'Argentina',
      ativo: true,
      children: [
        {
          id: 'tec-ar-2',
          sap: '',
          description: 'Especialista de campo - Animais de Companhia',
          responsavel: 'Ricardo Benítez',
          linhaNegocio: 'Animais de Companhia',
          tipoPosicao: 'Especialista de campo',
          pais: 'Argentina',
          ativo: true,
          children: []
        },
        {
          id: 'tec-ar-3',
          sap: '',
          description: 'Consultoria técnica - Bovinos',
          responsavel: 'Danielle Damasceno',
          linhaNegocio: 'Bovinos',
          tipoPosicao: 'Consultoria técnica',
          pais: 'Argentina',
          ativo: true,
          children: [
            {
              id: 'tec-ar-4',
              sap: '',
              description: 'Suporte veterinário - Bovinos',
              responsavel: 'Catarina Lopes',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Suporte veterinário',
              pais: 'Argentina',
              ativo: true,
              children: []
            }
          ]
        }
      ]
    }
  ];

  var cidades = { Brasil: 'Campinas', Argentina: 'Rosário', México: 'Guadalajara', Colômbia: 'Medellín', Chile: 'Concepción', Peru: 'Arequipa', Equador: 'Guayaquil', Paraguai: 'Ciudad del Este', Uruguai: 'Punta del Este' };
  var coresTecnicas = ['#0f766e', '#2563eb', '#7c3aed', '#0891b2'];
  var hashId = window.BipperSalesStructure.hashId;
  (function enrich(nodes) {
    nodes.forEach(function (node) {
      var h = hashId(node.id);
      node.cidade = node.cidade || cidades[node.pais] || '—';
      node.franquia = h % 4 === 1;
      node.corDestaque = coresTecnicas[h % coresTecnicas.length];
      if (node.children && node.children.length) enrich(node.children);
    });
  })(tree);

  window.BipperSalesStructure = window.BipperSalesStructure || {};
  window.BipperSalesStructure.areas = window.BipperSalesStructure.areas || {};
  window.BipperSalesStructure.areas.tecnica = { tree: tree };
})();
