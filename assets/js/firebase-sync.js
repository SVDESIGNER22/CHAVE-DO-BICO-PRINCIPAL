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
     UPLOAD DE FOTOGRAFIA PARA O FIREBASE STORAGE
     Recebe um File do <input type="file"> e envia para imoveis/{timestamp}_{nome}
     -------------------------------------------------------------------------- */
  async function uploadFotoImovel(file, onProgress) {
    if (!storage) {
      if (!initFirebase()) throw new Error('Firebase Storage não inicializado.');
    }
    if (!file) return null;

    // Sanitiza nome do arquivo
    const extensao = file.name.split('.').pop().toLowerCase();
    const nomeLimpo = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const nomeArquivo = `imoveis/${Date.now()}_${nomeLimpo}.${extensao}`;
    const storageRef = storage.ref().child(nomeArquivo);

    const uploadTask = storageRef.put(file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (typeof onProgress === 'function') {
            onProgress(progress);
          }
        },
        error => {
          console.error('[CDB Firebase Storage] Erro no upload:', error);
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
  }

  /* --------------------------------------------------------------------------
     SALVAR OU ATUALIZAR IMÓVEL NO FIRESTORE
     -------------------------------------------------------------------------- */
  async function salvarImovel(imovelDados, arquivoFoto = null, onProgress = null) {
    if (!db) {
      if (!initFirebase()) throw new Error('Firestore não inicializado.');
    }

    const dados = Object.assign({}, imovelDados);

    // Se houver arquivo de foto novo, realiza o upload primeiro
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

    // Salva ou atualiza no Firestore
    await db.collection('imoveis').doc(id).set(dados, { merge: true });
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
        console.error('[CDB Firebase] Erro ao ouvir imóveis no Firestore:', error);
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
      const snap = await db.collection('imoveis').limit(1).get();
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
    sincronizarImoveisIniciaisSeVazio
  };
})();
