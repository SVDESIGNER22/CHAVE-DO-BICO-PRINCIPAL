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

  /* Imóveis — os 6 itens abaixo são os ANÚNCIOS DE EXEMPLO que já existiam
     no carrossel (preservados). Substitua-os por anúncios reais no admin.html.
     Campos de localização: latitude/longitude ficam null até o administrador
     confirmar a posição no mapa (imóvel fica "pendente de localização"). */
  imoveis: [
    {
      id: 1, exemplo: true, publicado: true,
      titulo: "Casa Ampla 3 Quartos com Quintal",
      finalidade: "ALUGUEL", tipo: "CASA",
      cidade: "Augustinópolis - TO", bairro: "Centro", referencia: "",
      preco: "R$ 1.200/mês", precoNumero: null, exibirPreco: true,
      imagem: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      quartos: 3, banheiros: 2, area: "140 m²",
      whatsapp: "",
      latitude: null, longitude: null, precisaoLocalizacao: "aproximada"
    },
    {
      id: 2, exemplo: true, publicado: true,
      titulo: "Lote Residencial no Setor Boa Vista",
      finalidade: "VENDA", tipo: "LOTE",
      cidade: "Augustinópolis - TO", bairro: "Boa Vista", referencia: "",
      preco: "R$ 68.000", precoNumero: null, exibirPreco: true,
      imagem: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      quartos: null, banheiros: null, area: "360 m² (12x30)",
      whatsapp: "",
      latitude: null, longitude: null, precisaoLocalizacao: "aproximada"
    },
    {
      id: 3, exemplo: true, publicado: true,
      titulo: "Kitnet Mobiliada para Estudante ou Profissional",
      finalidade: "ALUGUEL", tipo: "KITNET",
      cidade: "Augustinópolis - TO", bairro: "Santa Cruz", referencia: "",
      preco: "R$ 650/mês", precoNumero: null, exibirPreco: true,
      imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      quartos: 1, banheiros: 1, area: "35 m²",
      whatsapp: "",
      latitude: null, longitude: null, precisaoLocalizacao: "aproximada"
    },
    {
      id: 4, exemplo: true, publicado: true,
      titulo: "Ponto Comercial com Excelente Fluxo e Fachada Ampla",
      finalidade: "ALUGUEL", tipo: "COMERCIAL",
      cidade: "Augustinópolis - TO", bairro: "Setor Rodoviário", referencia: "",
      preco: "R$ 1.800/mês", precoNumero: null, exibirPreco: true,
      imagem: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
      quartos: null, banheiros: 1, area: "85 m²",
      whatsapp: "",
      latitude: null, longitude: null, precisaoLocalizacao: "aproximada"
    },
    {
      id: 5, exemplo: true, publicado: true,
      titulo: "Lote Escriturado Pronto para Construção Imediata",
      finalidade: "VENDA", tipo: "LOTE",
      cidade: "Augustinópolis - TO", bairro: "Santa Cruz", referencia: "",
      preco: "R$ 55.000", precoNumero: null, exibirPreco: true,
      imagem: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      quartos: null, banheiros: null, area: "300 m²",
      whatsapp: "",
      latitude: null, longitude: null, precisaoLocalizacao: "aproximada"
    },
    {
      id: 6, exemplo: true, publicado: true,
      titulo: "Casa Confortável 2 Quartos com Garagem Coberta",
      finalidade: "ALUGUEL", tipo: "CASA",
      cidade: "Augustinópolis - TO", bairro: "Centro", referencia: "",
      preco: "R$ 950/mês", precoNumero: null, exibirPreco: true,
      imagem: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
      quartos: 2, banheiros: 1, area: "90 m²",
      whatsapp: "",
      latitude: null, longitude: null, precisaoLocalizacao: "aproximada"
    }
  ]
};
