/* ==========================================================================
   CHAVE DO BICO — DADOS CENTRALIZADOS DO SITE
   --------------------------------------------------------------------------
   Este arquivo é a única fonte de dados do site (contato institucional,
   regiões, bairros e imóveis). Ele pode ser editado à mão ou gerado pela
   ferramenta administrativa (admin.html > Exportar).

   PRIVACIDADE: este arquivo é público. Imóveis com precisão "aproximada"
   devem conter apenas coordenadas aproximadas (o admin.html já exporta assim).
   Nunca coloque aqui endereço completo ou número da casa do proprietário.
   ========================================================================== */
window.CHAVE_DO_BICO_DATA = {
  versao: 1,
  atualizadoEm: "2026-11-15",

  config: {
    nomeMarca: "CHAVE DO BICO",
    slogan: "Seu novo começo tem um endereço.",
    whatsappNumero: "5563999630980",
    whatsappExibicao: "(63) 99963-0980",
    email: "samuellvycttorup@gmail.com",
    cidade: "Augustinópolis",
    uf: "TO",
    regiaoGeografica: "Bico do Papagaio",
    mapaCentro: { lat: -5.4686, lng: -47.8867, zoom: 14 },
    mensagens: {
      geral: "Olá! Conheci a CHAVE DO BICO pelo site e gostaria de obter mais informações.",
      imovel: "Olá! Tenho interesse em um imóvel anunciado na CHAVE DO BICO. Gostaria de receber mais informações.",
      anuncio: "Olá! Gostaria de anunciar meu imóvel na CHAVE DO BICO. Poderiam me informar como funciona?"
    }
  },

  /* Lista inicial de trabalho — NÃO é cadastro territorial oficial.
     O administrador pode confirmar, editar, desativar e reorganizar. */
  regioes: [
    { id: "sul", nome: "Região Sul" },
    { id: "norte", nome: "Região Norte" },
    { id: "oeste", nome: "Região Oeste" },
    { id: "leste", nome: "Região Leste" },
    { id: "a-validar", nome: "Localidades a validar" }
  ],

  bairros: [
    { id: "setor-aeroporto", nome: "Setor Aeroporto", regiao: "sul", ativo: true, validado: true },
    { id: "setor-rodoviario", nome: "Setor Rodoviário", regiao: "sul", ativo: true, validado: true },
    { id: "portal-do-sol", nome: "Portal do Sol", regiao: "sul", ativo: true, validado: true },

    { id: "setor-do-sesp", nome: "Setor do SESP", regiao: "norte", ativo: true, validado: true },
    { id: "setor-alto-bonito", nome: "Setor Alto Bonito", regiao: "norte", ativo: true, validado: true },
    { id: "bela-vista", nome: "Bela Vista", regiao: "norte", ativo: true, validado: true },
    { id: "boa-vista", nome: "Boa Vista", regiao: "norte", ativo: true, validado: true },

    { id: "santa-rita", nome: "Santa Rita", regiao: "oeste", ativo: true, validado: true },
    { id: "vila-nova", nome: "Vila Nova", regiao: "oeste", ativo: true, validado: true },
    { id: "sao-jose", nome: "São José", regiao: "oeste", ativo: true, validado: true },
    { id: "primavera", nome: "Primavera", regiao: "oeste", ativo: true, validado: true },
    { id: "vitoria", nome: "Vitória", regiao: "oeste", ativo: true, validado: true },
    { id: "portal-do-lago", nome: "Portal do Lago", regiao: "oeste", ativo: true, validado: true },
    { id: "boa-sorte", nome: "Boa Sorte", regiao: "oeste", ativo: true, validado: true },

    { id: "popular", nome: "Popular", regiao: "leste", ativo: true, validado: true },
    { id: "sao-pedro", nome: "São Pedro", regiao: "leste", ativo: true, validado: true },
    { id: "novo-horizonte", nome: "Novo Horizonte", regiao: "leste", ativo: true, validado: true },
    { id: "jardim-planalto", nome: "Jardim Planalto", regiao: "leste", ativo: true, validado: true },
    { id: "tres-poderes", nome: "Três Poderes", regiao: "leste", ativo: true, validado: true },
    { id: "encanto-i", nome: "Encanto I", regiao: "leste", ativo: true, validado: true },
    { id: "encanto-ii", nome: "Encanto II", regiao: "leste", ativo: true, validado: true },
    { id: "setor-augustinopolis", nome: "Setor Augustinópolis", regiao: "leste", ativo: true, validado: true },

    { id: "eldorado", nome: "Eldorado", regiao: "a-validar", ativo: true, validado: false },
    { id: "portal-do-sol-ii", nome: "Portal do Sol II", regiao: "a-validar", ativo: true, validado: false },
    /* Presentes na copy original e nos anúncios de exemplo — confirmar região */
    { id: "centro", nome: "Centro", regiao: "a-validar", ativo: true, validado: false },
    { id: "santa-cruz", nome: "Santa Cruz", regiao: "a-validar", ativo: true, validado: false }
  ],

  /* Imóveis cadastrados no sistema (os imóveis adicionados no admin.html serão salvos aqui) */
  imoveis: []
};
