(function () {
  'use strict';

  var tree = [
    {
      id: 'mkt-1',
      sap: '',
      description: 'BRASIL',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'Brasil',
      ativo: true,
      children: [
        {
          id: 'mkt-2',
          sap: '',
          description: 'Marketing regional - Animais de Companhia',
          responsavel: 'Gleidson Salles',
          linhaNegocio: 'Animais de Companhia',
          tipoPosicao: 'Marketing regional',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: 'mkt-3',
              sap: '',
              description: 'Comunicação de marca - Vetscan',
              responsavel: 'Jaquiel Bampi',
              linhaNegocio: 'Vetscan',
              tipoPosicao: 'Comunicação de marca',
              pais: 'Brasil',
              ativo: true,
              children: [
                {
                  id: 'mkt-4',
                  sap: '',
                  description: 'Inteligência de mercado - Vetscan',
                  responsavel: 'Camila Torres',
                  linhaNegocio: 'Vetscan',
                  tipoPosicao: 'Inteligência de mercado',
                  pais: 'Brasil',
                  ativo: true,
                  children: []
                }
              ]
            },
            {
              id: 'mkt-9',
              sap: '',
              description: 'Comunicação de marca - Animais de Companhia (Sul)',
              responsavel: 'Camila Torres',
              linhaNegocio: 'Animais de Companhia',
              tipoPosicao: 'Comunicação de marca',
              pais: 'Brasil',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: 'mkt-5',
          sap: '',
          description: 'Gerência de produto - Aqua | Aves',
          responsavel: 'Fernanda Vargas',
          linhaNegocio: 'Aqua | Aves',
          tipoPosicao: 'Gerência de produto',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: 'mkt-6',
              sap: '',
              description: 'Marketing regional - Aqua | Aves',
              responsavel: 'Sara Silva',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Marketing regional',
              pais: 'Brasil',
              ativo: true,
              children: [
                {
                  id: 'mkt-10',
                  sap: '',
                  description: 'Inteligência de mercado - Aqua | Aves',
                  responsavel: 'Jaquiel Bampi',
                  linhaNegocio: 'Aqua | Aves',
                  tipoPosicao: 'Inteligência de mercado',
                  pais: 'Brasil',
                  ativo: true,
                  children: []
                }
              ]
            },
            {
              id: 'mkt-7',
              sap: '',
              description: 'Comunicação de marca - Aqua | Aves',
              responsavel: 'Gleidson Salles',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Comunicação de marca',
              pais: 'Brasil',
              ativo: true,
              children: []
            }
          ]
        },
        {
          id: 'mkt-8',
          sap: '',
          description: 'Inteligência de mercado - Bovinos',
          responsavel: 'Jaquiel Bampi',
          linhaNegocio: 'Bovinos',
          tipoPosicao: 'Inteligência de mercado',
          pais: 'Brasil',
          ativo: true,
          children: [
            {
              id: 'mkt-11',
              sap: '',
              description: 'Marketing regional - Bovinos (Sul)',
              responsavel: 'Fernanda Vargas',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Marketing regional',
              pais: 'Brasil',
              ativo: true,
              children: []
            },
            {
              id: 'mkt-12',
              sap: '',
              description: 'Comunicação de marca - Bovinos',
              responsavel: '',
              linhaNegocio: 'Bovinos',
              tipoPosicao: 'Comunicação de marca',
              pais: 'Brasil',
              ativo: true,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 'mkt-ar-1',
      sap: '',
      description: 'ARGENTINA',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'Argentina',
      ativo: true,
      children: [
        {
          id: 'mkt-ar-2',
          sap: '',
          description: 'Marketing regional - Animais de Companhia',
          responsavel: 'Fernanda Vargas',
          linhaNegocio: 'Animais de Companhia',
          tipoPosicao: 'Marketing regional',
          pais: 'Argentina',
          ativo: true,
          children: [
            {
              id: 'mkt-ar-3',
              sap: '',
              description: 'Comunicação de marca - Animais de Companhia',
              responsavel: 'Sara Silva',
              linhaNegocio: 'Animais de Companhia',
              tipoPosicao: 'Comunicação de marca',
              pais: 'Argentina',
              ativo: true,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 'mkt-mx-1',
      sap: '',
      description: 'MÉXICO',
      responsavel: '',
      linhaNegocio: '',
      tipoPosicao: 'Estrutura',
      pais: 'México',
      ativo: true,
      children: [
        {
          id: 'mkt-mx-2',
          sap: '',
          description: 'Inteligência de mercado - Vetscan',
          responsavel: 'Gleidson Salles',
          linhaNegocio: 'Vetscan',
          tipoPosicao: 'Inteligência de mercado',
          pais: 'México',
          ativo: false,
          children: []
        },
        {
          id: 'mkt-mx-3',
          sap: '',
          description: 'Gerência de produto - Aqua | Aves',
          responsavel: 'Jaquiel Bampi',
          linhaNegocio: 'Aqua | Aves',
          tipoPosicao: 'Gerência de produto',
          pais: 'México',
          ativo: true,
          children: [
            {
              id: 'mkt-mx-4',
              sap: '',
              description: 'Marketing regional - Aqua | Aves',
              responsavel: 'Gleidson Salles',
              linhaNegocio: 'Aqua | Aves',
              tipoPosicao: 'Marketing regional',
              pais: 'México',
              ativo: true,
              children: []
            }
          ]
        }
      ]
    }
  ];

  window.BipperSalesStructure = window.BipperSalesStructure || {};
  window.BipperSalesStructure.areas = window.BipperSalesStructure.areas || {};
  window.BipperSalesStructure.areas.marketing = { tree: tree };
})();
