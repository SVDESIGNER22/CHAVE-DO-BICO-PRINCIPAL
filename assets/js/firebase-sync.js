/* ==========================================================================
   CHAVE DO BICO — INTEGRAÇÃO FIREBASE EM TEMPO REAL (FIRESTORE & STORAGE)
   --------------------------------------------------------------------------
   - Banco de Dados em Nuvem: Firestore (Coleção 'imoveis')
   - Armazenamento de Fotografias: Firebase Storage (Pasta 'imoveis/')
   - Sincronização Instantânea em Tempo Real (onSnapshot)
   - Fallback offline automático e população de dados padrão
   ========================================================================== */

(function () {
  'use strict';

  const firebaseConfig = {
    apiKey: "AIzaSyBrYEJV5zlJJA95-TT2bUh6He8CBpc1B6o",
    authDomain: "chave-do-bico.firebaseapp.com",
    projectId: "chave-do-bico",
    storageBucket: "chave-do-bico.firebasestorage.app",
    messagingSenderId: "423133848796",
    appId: "1:423133848796:web:ad95a1808f6b86c54cc019",
    measurementId: "G-SRBM5P4W07"
  };

  let app = null;
  let db = null;
  let storage = null;
  let isInitialized = false;

  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.warn('[CDB Firebase] SDK do Firebase ainda não carregado.');
      return false;
    }
    if (!firebase.apps || !firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    db = firebase.firestore();
    storage = firebase.storage();
    isInitialized = true;
    console.log('[CDB Firebase] Inicializado com sucesso para o projeto chave-do-bico!');
    return true;
  }

  // Tenta inicializar de imediato ou quando o SDK estiver disponível
  if (typeof firebase !== 'undefined') {
    initFirebase();
  }

  /* --------------------------------------------------------------------------
     UTILITÁRIOS: TIMEOUT DE REDE & CONVERSÃO DE IMAGEM BASE64
     -------------------------------------------------------------------------- */
  function withTimeout(promise, ms, mensagemErro) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(mensagemErro || `Tempo limite de conexão excedido (${ms / 1000}s).`));
      }, ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  function fileParaBase64(file, maxWidth = 1200, qualidade = 0.8) {
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

  /* --------------------------------------------------------------------------
     UPLOAD DE FOTOGRAFIA PARA O FIREBASE STORAGE (COM FALLBACK SEGURO)
     Recebe um File do <input type="file"> e envia para imoveis/{timestamp}_{nome}
     -------------------------------------------------------------------------- */
  async function uploadFotoImovel(file, onProgress) {
    if (!file) return null;

    if (!storage) {
      if (!initFirebase()) {
        console.warn('[CDB Firebase Storage] Storage não inicializado. Usando conversão Base64.');
        return await fileParaBase64(file);
      }
    }

    try {
      // Sanitiza nome do arquivo
      const extensao = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
      const nomeLimpo = (file.name || 'foto').replace(/[^a-zA-Z0-9]/g, '_');
      const nomeArquivo = `imoveis/${Date.now()}_${nomeLimpo}.${extensao}`;
      const storageRef = storage.ref().child(nomeArquivo);

      const uploadTask = storageRef.put(file);

      const urlPromise = new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (typeof onProgress === 'function') {
              onProgress(progress);
            }
          },
          error => {
            console.warn('[CDB Firebase Storage] Erro no upload:', error.message);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              resolve(downloadURL);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      // Limita a 10s para não travar a tela se o bucket estiver inacessível
      return await withTimeout(
        urlPromise,
        10000,
        'O Firebase Storage ainda não foi ativado no console. Usando foto compactada localmente.'
      );
    } catch (err) {
      console.warn('[CDB Firebase Storage] Falha no upload para nuvem, aplicando fallback em Base64:', err.message);
      return await fileParaBase64(file);
    }
  }

  /* --------------------------------------------------------------------------
     SALVAR OU ATUALIZAR IMÓVEL NO FIRESTORE
     -------------------------------------------------------------------------- */
  async function salvarImovel(imovelDados, arquivoFoto = null, onProgress = null) {
    if (!db) {
      if (!initFirebase()) throw new Error('Firestore não inicializado.');
    }

    const dados = Object.assign({}, imovelDados);

    // Se houver arquivo de foto novo, realiza o upload com fallback automático
    if (arquivoFoto) {
      const urlFoto = await uploadFotoImovel(arquivoFoto, onProgress);
      if (urlFoto) {
        dados.imagem = urlFoto;
      }
    }

    dados.atualizadoEm = firebase.firestore.FieldValue.serverTimestamp();

    const id = dados.id ? String(dados.id) : String(Date.now());
    dados.id = id;

    if (!dados.criadoEm) {
      dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
    }

    // Salva ou atualiza no Firestore com timeout de 8 segundos para evitar travamento
    await withTimeout(
      db.collection('imoveis').doc(id).set(dados, { merge: true }),
      8000,
      'O Cloud Firestore não respondeu em 8s. Provavelmente o banco de dados ainda não foi criado no console do Firebase (https://console.firebase.google.com/project/chave-do-bico/firestore).'
    );

    console.log(`[CDB Firebase] Imóvel "${dados.titulo}" salvo com sucesso no Firestore (ID: ${id})`);
    return dados;
  }

  /* --------------------------------------------------------------------------
     MARCAR COMO ALUGADO / PAUSADO OU REATIVAR
     -------------------------------------------------------------------------- */
  async function alternarStatusImovel(id, novoStatusPublicado) {
    if (!db) {
      if (!initFirebase()) throw new Error('Firestore não inicializado.');
    }
    const docRef = db.collection('imoveis').doc(String(id));
    await docRef.update({
      publicado: Boolean(novoStatusPublicado),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log(`[CDB Firebase] Imóvel ${id} status alterado para publicado=${novoStatusPublicado}`);
  }

  /* --------------------------------------------------------------------------
     EXCLUIR IMÓVEL DEFINITIVAMENTE
     -------------------------------------------------------------------------- */
  async function excluirImovel(id) {
    if (!db) {
      if (!initFirebase()) throw new Error('Firestore não inicializado.');
    }
    await db.collection('imoveis').doc(String(id)).delete();
    console.log(`[CDB Firebase] Imóvel ${id} excluído com sucesso.`);
  }

  /* --------------------------------------------------------------------------
     OUVIR IMÓVEIS EM TEMPO REAL (onSnapshot)
     -------------------------------------------------------------------------- */
  function ouvirImoveis(callback, options = {}) {
    if (!db) {
      if (!initFirebase()) {
        console.warn('[CDB Firebase] Firestore indisponível para escuta em tempo real.');
        return () => {};
      }
    }

    let query = db.collection('imoveis');

    // Se for para a vitrine pública, opcionalmente filtra por publicado !== false
    if (options.somentePublicados) {
      // Como alguns docs podem não ter o campo explícito, tratamos no callback
    }

    const unsubscribe = query.onSnapshot(
      snapshot => {
        const lista = [];
        snapshot.forEach(doc => {
          const item = doc.data();
          item.id = doc.id;
          lista.push(item);
        });

        // Ordena por criadoEm ou id decrescente (mais recentes primeiro)
        lista.sort((a, b) => {
          const tA = (a.criadoEm && a.criadoEm.seconds) ? a.criadoEm.seconds : Number(a.id) || 0;
          const tB = (b.criadoEm && b.criadoEm.seconds) ? b.criadoEm.seconds : Number(b.id) || 0;
          return tB - tA;
        });

        console.log(`[CDB Firebase] Recebidos ${lista.length} imóveis em tempo real do Firestore.`);
        if (typeof callback === 'function') {
          callback(lista);
        }
      },
      error => {
        console.warn('[CDB Firebase] Erro ao ouvir imóveis no Firestore:', error.message);
        window.dispatchEvent(new CustomEvent('cdb:firebase-error', { detail: error }));
      }
    );

    return unsubscribe;
  }

  /* --------------------------------------------------------------------------
     POPULAR IMÓVEIS INICIAIS (SE FIRESTORE ESTIVER VAZIO)
     -------------------------------------------------------------------------- */
  async function sincronizarImoveisIniciaisSeVazio(imoveisPadrao) {
    if (!db) {
      if (!initFirebase()) return;
    }
    try {
      const snap = await withTimeout(
        db.collection('imoveis').limit(1).get(),
        6000,
        'Tempo limite ao verificar Firestore inicial.'
      );
      if (snap.empty && Array.isArray(imoveisPadrao) && imoveisPadrao.length > 0) {
        console.log('[CDB Firebase] Firestore vazio. Migrando imóveis padrão do catálogo inicial...');
        const batch = db.batch();
        imoveisPadrao.forEach(item => {
          const ref = db.collection('imoveis').doc(String(item.id));
          const docData = Object.assign({}, item, {
            publicado: item.publicado !== false,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
          });
          batch.set(ref, docData);
        });
        await batch.commit();
        console.log(`[CDB Firebase] ${imoveisPadrao.length} imóveis iniciais populados com sucesso no Firestore!`);
      }
    } catch (err) {
      console.warn('[CDB Firebase] Não foi possível verificar/popular imóveis iniciais:', err.message);
    }
  }

  // Exporta objeto global para uso no site e no admin
  window.CDB_FIREBASE = {
    init: initFirebase,
    get isReady() { return isInitialized; },
    get db() { return db; },
    get storage() { return storage; },
    uploadFotoImovel,
    salvarImovel,
    alternarStatusImovel,
    excluirImovel,
    ouvirImoveis,
    sincronizarImoveisIniciaisSeVazio,
    fileParaBase64
  };
})();
