# DESIGN SYSTEM MASTER — CHAVES DO BICO

**Documento de Especificação Visual e Arquitetura de Interface**  
**Marca:** CHAVES DO BICO  
**Slogan:** Seu novo começo tem um endereço.  
**Versão:** 1.0.0 (2026)

---

## 1. ESSÊNCIA E PERSONALIDADE DA MARCA

- **Arquétipo:** O Conector Confiável & Acolhedor.
- **Tom de Voz:** Direto, transparente, sem termos burocráticos, regional e acessível.
- **Estilo Visual:** Premium minimalista, limpo e contemporâneo, inspirado em referências de padrão mundial (como o Airbnb), dando protagonismo às fotos reais dos imóveis.

---

## 2. PALETA CROMÁTICA & DESIGN TOKENS

### Tabela de Cores Oficiais

| Token | Hexadecimal | RGB | Finalidade de Uso |
|---|---|---|---|
| `brand-dark` | `#004719` | `rgb(0, 71, 25)` | Verde profundo institucional; fundos do hero, rodapé, textos de alto impacto. |
| `brand-primary` | `#087B18` | `rgb(8, 123, 24)` | Verde institucional vibrante; botões primários, ícones de destaque e links ativos. |
| `brand-accent` | `#42D900` | `rgb(66, 217, 0)` | Verde energético de ação; CTAs principais e badges de venda/destaque. |
| `brand-accent-light` | `#C9FF24` | `rgb(201, 255, 36)` | Verde-limão luminoso; micro-destaques, tags em fundos escuros e bordas de foco. |
| `white` | `#FFFFFF` | `rgb(255, 255, 255)` | Fundo principal da página e cards de imóveis. |
| `surface-muted` | `#F7FAF7` | `rgb(247, 250, 247)` | Fundo neutro suave para alternância de seções (como Como Funciona e FAQ). |
| `text-primary` | `#17231A` | `rgb(23, 35, 26)` | Cor de leitura primária (títulos e textos importantes). Alto contraste. |
| `text-secondary` | `#66736A` | `rgb(102, 115, 106)` | Cor de apoio para legendas, descrições secundárias e datas. |
| `border` | `#E5EBE6` | `rgb(229, 235, 230)` | Bordas sutis de cards, divisórias e inputs. |
| `feedback-success`| `#087B18` | `rgb(8, 123, 24)` | Mensagens de sucesso ou validação positiva. |
| `feedback-danger` | `#B42318` | `rgb(180, 35, 24)` | Erros, alertas de campo obrigatório ou avisos críticos. |
| `feedback-warning`| `#A15C00` | `rgb(161, 92, 0)` | Avisos preventivos e informações atencionais. |

---

## 3. TIPOGRAFIA

### Fontes Recomendadas
- **Títulos e Cabeçalhos:** `Manrope` (pesos 600 SemiBold, 700 Bold, 800 ExtraBold).
- **Corpo de Texto, Botões e Inputs:** `Inter` (pesos 400 Regular, 500 Medium, 600 SemiBold).

### Escala de Tamanhos
- **H1 (Hero):** Desktop `48px - 60px` | Mobile `32px - 40px` (Line-height: 1.15)
- **H2 (Seções):** Desktop `32px - 40px` | Mobile `26px - 32px` (Line-height: 1.2)
- **H3 (Subseções/Cards):** Desktop `20px - 24px` | Mobile `18px - 20px` (Line-height: 1.3)
- **H4 (Títulos menores):** `18px - 20px` (Line-height: 1.35)
- **Corpo (Body):** `16px` (Line-height: 1.6)
- **Texto Auxiliar / Legenda:** `13px - 14px` (Line-height: 1.5)
- **Botões:** `14px - 16px` (Peso: 600 SemiBold)

---

## 4. SISTEMA DE ESPAÇAMENTO, BORDAS & SOMBRAS

### Escala Modular (Múltiplos de 4px)
`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 80px, 96px`

### Container & Layout
- **Largura Máxima:** `1200px`
- **Padding Lateral Desktop:** `32px`
- **Padding Lateral Mobile:** `20px`
- **Grid de Imóveis:** 3 colunas em telas `> 1024px`, 2 colunas entre `768px - 1023px`, 1 coluna em `< 767px`.

### Raios de Borda (Border Radius)
- **Cards de Imóveis:** `16px` (`--radius-card`)
- **Botões:** `10px - 12px` (`--radius-btn`)
- **Inputs e Caixas de Busca:** `10px` (`--radius-input`)
- **Badges e Pílulas:** `9999px` (`--radius-pill`)

### Sombras (Elevation)
- **Sombra Suave (Cards repouso):** `0 4px 16px rgba(0, 71, 25, 0.06)`
- **Sombra Hover (Cards e Botões em destaque):** `0 12px 28px rgba(0, 71, 25, 0.12)`
- **Sombra Elevada (Modais e Menus flutuantes):** `0 20px 38px rgba(0, 47, 16, 0.16)`

---

## 5. ESPECIFICAÇÃO DOS COMPONENTES DE INTERFACE

### 5.1 Botões (`.btn`)
- **`btn-primary`:** Fundo verde institucional (`#087B18`), texto branco. Usado em ações regulares e navegação direta.
- **`btn-accent`:** Fundo verde vibrante (`#42D900`), texto escuro institucional (`#004719`). Usado em CTAs de máxima prioridade (Explorar imóveis, Anunciar agora).
- **`btn-secondary`:** Fundo transparente com borda verde institucional (`#087B18`). Usado em ações secundárias ou sobre fundos escuros.
- **Estados Obrigatórios:** Hover (elevação de -1px + sombra suave), Active (retorno), Focus-visible (outline verde-limão de 2px), Disabled (opacidade 55% e sem pointer-events).

### 5.2 Card de Imóvel (`.property-card`)
- **Aspect Ratio da Imagem:** `16:10`, com `object-fit: cover` e efeito de zoom sutil (+3%) no hover do card.
- **Badges Flutuantes:** Posicionados no topo esquerdo da foto:
  - Finalidade: `ALUGUEL` (fundo escuro) ou `VENDA` (fundo verde vibrante).
  - Tipo: `CASA`, `LOTE`, `KITNET`, `COMERCIAL` (fundo branco outline).
- **Dados do Imóvel:** Ícone de localização + Bairro; Título descritivo; Indicadores visuais de quartos, banheiros e metragem; Preço em destaque em verde escuro; Botão direto para WhatsApp.

### 5.3 Barra de Busca & Filtros
- Container flutuante que conecta o final do Hero com o início da lista de imóveis.
- Filtros em tempo real: Finalidade, Tipo de Imóvel e Bairro.

### 5.4 Estado Vazio (`.empty-state`)
- Quando uma busca não retorna resultados, exibe ícone amigável, mensagem acolhedora ("Estamos preparando novos endereços para você") e botão direto para limpar filtros ou falar no WhatsApp.

### 5.5 Rodapé & Avisos Institucionais
- Fundo em verde muito profundo (`#00280D`).
- Aviso explícito de compliance: esclarecendo que a plataforma é um canal exclusivo de divulgação, preservando a autonomia dos usuários.

---

## 6. DIRETRIZES DE ACESSIBILIDADE & PERFORMANCE

1. **Contraste WCAG AA:** Todas as combinações de texto e fundo possuem contraste superior a 4.5:1.
2. **Navegação por Teclado:** Todos os botões, links e inputs possuem estados de foco evidentes (`focus-visible`).
3. **HTML Semântico:** Utilização correta de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` e `<footer>`.
4. **Lazy Loading:** Todas as imagens de imóveis utilizam `loading="lazy"` para garantir carregamento instantâneo da página.
5. **Redução de Movimento:** Suporte a usuários com sensibilidade a animações (`@media (prefers-reduced-motion)`).
