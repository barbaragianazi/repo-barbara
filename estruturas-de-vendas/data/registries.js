(function () {
  'use strict';

  function dia(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + month + '-' + day;
  }

  var responsaveis = [
    { id: 'resp-1', nome: 'Simone Leiderman', dataInicio: dia(-540), dataFim: dia(380) },
    { id: 'resp-2', nome: 'Fabio Feitosa', dataInicio: dia(-400), dataFim: dia(12) },
    { id: 'resp-3', nome: 'Sara Silva', dataInicio: dia(-700), dataFim: dia(-9) },
    { id: 'resp-4', nome: 'Denise Rodrigues', dataInicio: dia(-300), dataFim: dia(210) },
    { id: 'resp-5', nome: 'Danielle Damasceno', dataInicio: dia(-365), dataFim: dia(29) },
    { id: 'resp-6', nome: 'Edson Ploncoski', dataInicio: dia(-500), dataFim: dia(-47) },
    { id: 'resp-7', nome: 'Gleidson Salles', dataInicio: dia(-250), dataFim: dia(520) },
    { id: 'resp-8', nome: 'Jaquiel Bampi', dataInicio: dia(-180), dataFim: dia(6) },
    { id: 'resp-9', nome: 'Catarina Lopes', dataInicio: dia(-600), dataFim: dia(95) },
    { id: 'resp-10', nome: 'Martina Gómez', dataInicio: dia(-330), dataFim: dia(-3) },
    { id: 'resp-11', nome: 'Lucas Fernández', dataInicio: dia(-120), dataFim: dia(300) },
    { id: 'resp-12', nome: 'Valentina Rossi', dataInicio: dia(-450), dataFim: dia(21) },
    { id: 'resp-13', nome: 'Sofía Hernández', dataInicio: dia(-90), dataFim: dia(60) },
    { id: 'resp-14', nome: 'Diego Ramírez', dataInicio: dia(-800), dataFim: dia(-130) },
    { id: 'resp-15', nome: 'Camila Torres', dataInicio: dia(-210), dataFim: dia(0) },
    { id: 'resp-16', nome: 'Mariana Gómez', dataInicio: dia(-280), dataFim: dia(150) },
    { id: 'resp-17', nome: 'Andrés Castro', dataInicio: dia(-150), dataFim: dia(410) },
    { id: 'resp-18', nome: 'Javiera Muñoz', dataInicio: dia(-520), dataFim: dia(-21) },
    { id: 'resp-19', nome: 'Tomás Silva', dataInicio: dia(-60), dataFim: dia(75) },
    { id: 'resp-20', nome: 'Rodrigo Quispe', dataInicio: dia(-390), dataFim: dia(13) },
    { id: 'resp-21', nome: 'Fernanda Vargas', dataInicio: dia(-240), dataFim: dia(240) },
    { id: 'resp-22', nome: 'Paulina Chávez', dataInicio: dia(-33), dataFim: dia(330) },
    { id: 'resp-23', nome: 'Ricardo Benítez', dataInicio: dia(-470), dataFim: dia(45) },
    { id: 'resp-24', nome: 'Lucía Fernández', dataInicio: dia(-75), dataFim: dia(700) }
  ];

  var linhasNegocio = [
    { id: 'linha-1', nome: 'Animais de Companhia' },
    { id: 'linha-2', nome: 'Vetscan' },
    { id: 'linha-3', nome: 'Aqua | Aves' },
    { id: 'linha-4', nome: 'Bovinos' },
    { id: 'linha-5', nome: 'Suínos' },
    { id: 'linha-6', nome: 'Equinos' }
  ];

  function hashId(id) {
    var h = 0;
    var text = String(id);
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  window.BipperSalesStructure = window.BipperSalesStructure || {};
  window.BipperSalesStructure.hashId = hashId;
  window.BipperSalesStructure.responsaveis = responsaveis;
  window.BipperSalesStructure.linhasNegocio = linhasNegocio;
})();
