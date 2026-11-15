/* ==========================================================================
   CHAVE DO BICO — INTEGRAÇÃO GITHUB SYNC (100% GRATUITO SEM CARTÃO)
   --------------------------------------------------------------------------
   - Armazenamento Direto no Repositório GitHub (data/site-data.js)
   - Zero Dependência de Serviços Pagos ou Cartão de Crédito
   - Atualizações Públicas Automáticas via GitHub API e GitHub Pages
   ========================================================================== */

(function () {
  'use strict';

  const GITHUB_CONFIG = {
    owner: 'SVDESIGNER22',
    repo: 'CHAVE-DO-BICO-PRINCIPAL',
    branch: 'main',
    filePath: 'data/site-data.js'
  };

  const STORAGE_TOKEN_KEY = 'CDB_GITHUB_TOKEN';

  function obterToken() {
    return localStorage.getItem(STORAGE_TOKEN_KEY) || '';
  }

  function salvarToken(token) {
    if (token && typeof token === 'string') {
      localStorage.setItem(STORAGE_TOKEN_KEY, token.trim());
      console.log('[CDB GitHub] Token do GitHub salvo com sucesso no navegador.');
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      console.log('[CDB GitHub] Token do GitHub removido.');
    }
  }

  function estaConectado() {
    const t = obterToken();
    return Boolean(t && t.length > 10);
  }

  /* Converte arquivo de foto em JPEG Base64 otimizado (para caber perfeitamente no site-data.js) */
  function fileParaBase64(file, maxWidth = 1200, qualidade = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof Blob)) {
        return resolve(null);
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          try {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            if (w > maxWidth) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', qualidade));
          } catch (err) {
            resolve(e.target.result);
          }
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /* Testa se o token possui permissão de leitura/escrita no repositório */
  async function testarConexao(tokenCustomizado = null) {
    const token = tokenCustomizado || obterToken();
    if (!token) {
      throw new Error('Nenhum token fornecido.');
    }

    const { owner, repo, filePath, branch } = GITHUB_CONFIG;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 200) {
      const data = await res.json();
      return { ok: true, sha: data.sha, repo: `${owner}/${repo}` };
    } else if (res.status === 401 || res.status === 403) {
      throw new Error('Token do GitHub inválido ou sem permissão de acesso ao repositório.');
    } else if (res.status === 404) {
      throw new Error(`Repositório "${owner}/${repo}" ou arquivo "${filePath}" não encontrado.`);
    } else {
      throw new Error(`Erro de resposta do GitHub (Código HTTP: ${res.status}).`);
    }
  }

  /* Converte string UTF-8 para Base64 seguro para envio à API do GitHub */
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  /* Publica as alterações do DB diretamente no repositório GitHub via Commit */
  async function salvarNoGitHub(dbData, mensagemCommit = null) {
    const token = obterToken();
    if (!token) {
      const err = new Error('TOKEN_NAO_CONFIGURADO');
      err.code = 'TOKEN_NAO_CONFIGURADO';
      throw err;
    }

    const { owner, repo, branch, filePath } = GITHUB_CONFIG;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    // 1. Obtém o SHA atual do arquivo no GitHub
    let currentSha = null;
    const getRes = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (getRes.status === 200) {
      const fileInfo = await getRes.json();
      currentSha = fileInfo.sha;
    } else if (getRes.status === 401 || getRes.status === 403) {
      throw new Error('Token do GitHub sem permissão de escrita ("repo"). Verifique seu token nas configurações.');
    } else if (getRes.status !== 404) {
      throw new Error(`Falha ao verificar arquivo no GitHub (HTTP ${getRes.status}).`);
    }

    // 2. Prepara o conteúdo completo do arquivo data/site-data.js
    const timestamp = new Date().toLocaleString('pt-BR');
    const novoConteudo = `/* ==========================================================================
   CHAVE DO BICO — DADOS CENTRALIZADOS DO SITE
   Atualizado em: ${timestamp} via Painel Administrativo
   ========================================================================== */
window.CHAVE_DO_BICO_DATA = ${JSON.stringify(dbData, null, 2)};
`;

    const base64Content = utf8ToBase64(novoConteudo);
    const msg = mensagemCommit || `chore(imoveis): atualizar catalogo (${dbData.imoveis ? dbData.imoveis.length : 0} imoveis) via painel admin`;

    // 3. Executa o Commit via API do GitHub
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: msg,
        content: base64Content,
        sha: currentSha,
        branch: branch
      })
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      throw new Error(errJson.message || `Erro ao salvar no GitHub (HTTP ${putRes.status})`);
    }

    const commitInfo = await putRes.json();
    console.log('✅ Commit realizado com sucesso no GitHub:', commitInfo.commit ? commitInfo.commit.sha : 'OK');
    return commitInfo;
  }

  /* Carrega os dados mais recentes do site-data.js diretamente do GitHub (Raw com Cache Buster) */
  async function carregarDadosMaisRecentes() {
    const { owner, repo, branch, filePath } = GITHUB_CONFIG;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}?t=${Date.now()}`;

    try {
      const res = await fetch(rawUrl);
      if (res.ok) {
        const jsText = await res.text();
        new Function(jsText)();
        console.log('[CDB GitHub] Dados mais recentes carregados com sucesso do GitHub Raw.');
        return window.CHAVE_DO_BICO_DATA;
      }
    } catch (err) {
      console.warn('[CDB GitHub] Não foi possível carregar dados raw do GitHub:', err.message);
    }
    return window.CHAVE_DO_BICO_DATA || null;
  }

  window.CDB_GITHUB = {
    config: GITHUB_CONFIG,
    obterToken,
    salvarToken,
    estaConectado,
    fileParaBase64,
    testarConexao,
    salvarNoGitHub,
    carregarDadosMaisRecentes
  };
})();
