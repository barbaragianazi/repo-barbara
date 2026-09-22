(function () {
  'use strict';

  var LOCAIS = {
    'São Paulo': { estado: 'SP', cep: '01310-100', lat: -23.5505, lng: -46.6333, ruas: ['Av. Paulista', 'Rua Augusta', 'Av. Brigadeiro Faria Lima'] },
    'Campinas': { estado: 'SP', cep: '13015-904', lat: -22.9056, lng: -47.0608, ruas: ['Av. Francisco Glicério', 'Rua Barão de Jaguara'] },
    'Rio de Janeiro': { estado: 'RJ', cep: '20031-170', lat: -22.9068, lng: -43.1729, ruas: ['Av. Rio Branco', 'Rua da Assembleia'] },
    'Belo Horizonte': { estado: 'MG', cep: '30130-009', lat: -19.9167, lng: -43.9345, ruas: ['Av. Afonso Pena', 'Rua da Bahia'] },
    'Curitiba': { estado: 'PR', cep: '80020-090', lat: -25.4284, lng: -49.2733, ruas: ['Rua XV de Novembro', 'Av. Sete de Setembro'] },
    'Porto Alegre': { estado: 'RS', cep: '90010-150', lat: -30.0346, lng: -51.2177, ruas: ['Av. Borges de Medeiros', 'Rua dos Andradas'] },
    'Buenos Aires': { estado: 'CABA', cep: 'C1043', lat: -34.6037, lng: -58.3816, ruas: ['Av. 9 de Julio', 'Av. Corrientes'] },
    'Cidade do México': { estado: 'CDMX', cep: '06600', lat: 19.4326, lng: -99.1332, ruas: ['Paseo de la Reforma', 'Av. Insurgentes Sur'] },
    'Bogotá': { estado: 'Cundinamarca', cep: '110111', lat: 4.711, lng: -74.0721, ruas: ['Carrera 7', 'Calle 72'] },
    'Santiago': { estado: 'Região Metropolitana', cep: '8320000', lat: -33.4489, lng: -70.6693, ruas: ['Av. Libertador Bernardo O\'Higgins', 'Av. Providencia'] },
    'Lima': { estado: 'Lima', cep: '15046', lat: -12.0464, lng: -77.0428, ruas: ['Av. Arequipa', 'Av. Javier Prado'] },
    'Quito': { estado: 'Pichincha', cep: '170135', lat: -0.1807, lng: -78.4678, ruas: ['Av. Amazonas', 'Av. 6 de Diciembre'] },
    'Assunção': { estado: 'Central', cep: '1209', lat: -25.2637, lng: -57.5759, ruas: ['Av. Mariscal López', 'Av. España'] },
    'Montevidéu': { estado: 'Montevidéu', cep: '11000', lat: -34.9011, lng: -56.1645, ruas: ['Av. 18 de Julio', 'Bulevar Artigas'] },
    'Rosário': { estado: 'Santa Fe', cep: 'S2000', lat: -32.9442, lng: -60.6505, ruas: ['Bv. Oroño', 'Calle Córdoba'] },
    'Guadalajara': { estado: 'Jalisco', cep: '44100', lat: 20.6597, lng: -103.3496, ruas: ['Av. Chapultepec', 'Av. Vallarta'] },
    'Medellín': { estado: 'Antioquia', cep: '050001', lat: 6.2442, lng: -75.5812, ruas: ['Carrera 43A', 'Calle 10'] },
    'Concepción': { estado: 'Biobío', cep: '4030000', lat: -36.8201, lng: -73.0444, ruas: ['Calle Barros Arana', 'Av. Pedro de Valdivia'] },
    'Arequipa': { estado: 'Arequipa', cep: '04001', lat: -16.409, lng: -71.5375, ruas: ['Calle Mercaderes', 'Av. Ejército'] },
    'Guayaquil': { estado: 'Guayas', cep: '090313', lat: -2.1894, lng: -79.8891, ruas: ['Av. 9 de Octubre', 'Av. Francisco de Orellana'] },
    'Ciudad del Este': { estado: 'Alto Paraná', cep: '7000', lat: -25.5097, lng: -54.6111, ruas: ['Av. Bernardino Caballero', 'Av. Monseñor Rodríguez'] },
    'Punta del Este': { estado: 'Maldonado', cep: '20100', lat: -34.9496, lng: -54.9358, ruas: ['Av. Gorlero', 'Av. Roosevelt'] }
  };

  var CIDADES_POR_PAIS = {
    Brasil: ['São Paulo', 'Campinas', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre'],
    Argentina: ['Buenos Aires'],
    México: ['Cidade do México'],
    Colômbia: ['Bogotá'],
    Chile: ['Santiago'],
    Peru: ['Lima'],
    Equador: ['Quito'],
    Paraguai: ['Assunção'],
    Uruguai: ['Montevidéu']
  };

  var PAPEIS = ['Aprovador', 'Solicitante', 'Gestor', 'Consulta'];

  function hash(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  function slug(text) {
    return String(text || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
  }

  function detailsFor(node) {
    var h = hash(String(node.id));
    var cidades = CIDADES_POR_PAIS[node.pais] || [];
    var municipio = node.cidade && LOCAIS[node.cidade] ? node.cidade : (cidades.length ? cidades[0] : '');
    var local = LOCAIS[municipio];
    var nomeSlug = slug(node.responsavel);
    var usuario = nomeSlug ? nomeSlug.split('.').filter(Boolean).slice(0, 2).join('.') : '';

    var detalhes = {
      usuario: usuario,
      papel: PAPEIS[h % PAPEIS.length],
      municipio: municipio,
      estado: local ? local.estado : '',
      endereco: local ? local.ruas[h % local.ruas.length] + ', ' + (100 + (h % 1900)) : '',
      cep: local ? local.cep : '',
      latitude: local ? (local.lat + ((h % 900) - 450) / 10000).toFixed(6) : '',
      longitude: local ? (local.lng + (((h >>> 3) % 900) - 450) / 10000).toFixed(6) : ''
    };
    if (h % 7 === 0) { detalhes.endereco = ''; detalhes.cep = ''; }
    if (h % 11 === 0) { detalhes.latitude = ''; detalhes.longitude = ''; }
    return detalhes;
  }

  function enrich(nodes) {
    nodes.forEach(function (node) {
      if (!Object.prototype.hasOwnProperty.call(node, 'detalhes')) {
        Object.defineProperty(node, 'detalhes', { get: function () { return detailsFor(node); }, enumerable: true, configurable: true });
      }
      if (node.children && node.children.length) enrich(node.children);
    });
  }

  var areas = (window.BipperSalesStructure && window.BipperSalesStructure.areas) || {};
  Object.keys(areas).forEach(function (key) {
    if (areas[key] && areas[key].tree) enrich(areas[key].tree);
  });
})();
