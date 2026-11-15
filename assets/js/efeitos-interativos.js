/* ==========================================================================
   CHAVE DO BICO — EFEITOS INTERATIVOS
   --------------------------------------------------------------------------
   1. Cursor Personalizado com Rastro de Partículas & Seguidor Suave (Desktop)
   2. Efeito de Toque com Onda Circular Translúcida Verde (Mobile / Touch)
   3. Efeito de Rolagem Parallax Discreto em Elementos Imobiliários
   ========================================================================== */

(function () {
  'use strict';

  // Respeito à preferência de movimento reduzido
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  /* ==========================================================================
     MÓDULO 1: CURSOR PERSONALIZADO (DESKTOP)
     Rastro de partículas verdes, anel seguidor e resposta sutil a botões/links
     ========================================================================== */
  function initCustomCursor() {
    // Apenas para dispositivos com mouse de precisão e sem toque puro
    const isFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    // Criar elementos do cursor no DOM
    const follower = document.createElement('div');
    follower.className = 'cdb-cursor-follower';
    follower.id = 'cdb-cursor-follower';
    follower.setAttribute('aria-hidden', 'true');

    const dot = document.createElement('div');
    dot.className = 'cdb-cursor-dot';
    dot.id = 'cdb-cursor-dot';
    dot.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.id = 'cdb-cursor-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    document.body.appendChild(canvas);
    document.body.appendChild(follower);
    document.body.appendChild(dot);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    // Coordenadas do cursor
    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let lastEmitX = -100;
    let lastEmitY = -100;
    let isVisible = false;
    let isHovering = false;
    let isClicking = false;
    let rafActive = false;

    // Pool de Partículas Estático (Sem vazamento de memória)
    const MAX_PARTICLES = 32;
    const particles = [];

    function Particle() {
      this.active = false;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.size = 0;
      this.alpha = 0;
      this.decay = 0;
      this.colorBase = '';
    }

    Particle.prototype.init = function (x, y) {
      this.active = true;
      this.x = x + (Math.random() - 0.5) * 8;
      this.y = y + (Math.random() - 0.5) * 8;
      // Dispersão sutil e leve subida orgânica
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7 - 0.25;
      this.size = Math.random() * 2.8 + 1.8;
      this.alpha = 0.85;
      this.decay = Math.random() * 0.025 + 0.03; // dura ~25-35 frames
      const palette = [
        'rgba(201, 255, 36, ', // Verde-limão claro
        'rgba(66, 217, 0, ',   // Verde-limão vibrante
        'rgba(8, 123, 24, '    // Verde institucional
      ];
      this.colorBase = palette[Math.floor(Math.random() * palette.length)];
    };

    Particle.prototype.update = function () {
      if (!this.active) return false;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      this.size *= 0.96;
      if (this.alpha <= 0 || this.size <= 0.4) {
        this.active = false;
        return false;
      }
      return true;
    };

    Particle.prototype.draw = function (context) {
      if (!this.active) return;
      context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      context.fillStyle = this.colorBase + Math.max(0, this.alpha).toFixed(2) + ')';
      context.shadowColor = '#42D900';
      context.shadowBlur = 5;
      context.fill();
    };

    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push(new Particle());
    }

    function emitParticle(x, y) {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) {
          particles[i].init(x, y);
          break;
        }
      }
    }

    // Loop de Animação e Interpolação Linear (Lerp)
    function loop() {
      // Movimento do anel seguidor
      followerX += (mouseX - followerX) * 0.16;
      followerY += (mouseY - followerY) * 0.16;

      follower.style.transform = `translate3d(${followerX.toFixed(1)}px, ${followerY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${mouseX.toFixed(1)}px, ${mouseY.toFixed(1)}px, 0) translate(-50%, -50%)` +
        (isHovering ? ' scale(1.4)' : '');

      // Renderização do rastro de partículas no Canvas
      ctx.clearRect(0, 0, width, height);
      let activeCount = 0;

      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].active) {
          if (particles[i].update()) {
            particles[i].draw(ctx);
            activeCount++;
          }
        }
      }

      // Se não há partículas ativas e o mouse parou de se mover significativamente, desativa o loop
      const distToMouse = Math.hypot(mouseX - followerX, mouseY - followerY);
      if (activeCount === 0 && distToMouse < 0.2 && !isVisible) {
        rafActive = false;
        return;
      }

      requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!rafActive) {
        rafActive = true;
        requestAnimationFrame(loop);
      }
    }

    // Ouvintes de movimento do mouse
    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        follower.style.opacity = '1';
        dot.style.opacity = '1';
      }

      // Emite partícula a cada ~7px de deslocamento
      const distFromLast = Math.hypot(mouseX - lastEmitX, mouseY - lastEmitY);
      if (distFromLast > 7) {
        emitParticle(mouseX, mouseY);
        lastEmitX = mouseX;
        lastEmitY = mouseY;
      }

      startLoop();
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      isVisible = false;
      follower.style.opacity = '0';
      dot.style.opacity = '0';
    });

    document.addEventListener('mouseenter', function () {
      isVisible = true;
      follower.style.opacity = '1';
      dot.style.opacity = '1';
    });

    // Detecção sutil de elementos interativos (botões, links, cards de imóveis, inputs)
    const interactiveSelector = [
      'a',
      'button',
      '.imovel-card',
      '.bairro-card',
      '.region-tab',
      '.filter-chip',
      '.btn',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '.carousel-control',
      '.control-btn',
      '.map-card',
      '.contact-card'
    ].join(', ');

    document.addEventListener('mouseover', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        isHovering = true;
        follower.classList.add('is-hovering');
        dot.classList.add('is-hovering');
      }
    }, { passive: true });

    document.addEventListener('mouseout', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        isHovering = false;
        follower.classList.remove('is-hovering');
        dot.classList.remove('is-hovering');
      }
    }, { passive: true });

    // Efeito de clique (contração momentânea)
    document.addEventListener('mousedown', function () {
      isClicking = true;
      follower.classList.add('is-clicking');
    }, { passive: true });

    document.addEventListener('mouseup', function () {
      isClicking = false;
      follower.classList.remove('is-clicking');
    }, { passive: true });
  }

  /* ==========================================================================
     MÓDULO 2: EFEITO DE TOQUE (MOBILE / TOUCH RIPPLE)
     Onda circular verde translúcida que expande e desaparece no ponto tocado
     ========================================================================== */
  function initTouchRipple() {
    function handleTouch(x, y) {
      const ripple = document.createElement('div');
      ripple.className = 'cdb-touch-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      document.body.appendChild(ripple);

      // Auto-remoção após o término da animação (fallback timeout de 450ms)
      let removed = false;
      function removeRipple() {
        if (!removed && ripple.parentNode) {
          removed = true;
          ripple.parentNode.removeChild(ripple);
        }
      }

      ripple.addEventListener('animationend', removeRipple, { once: true });
      setTimeout(removeRipple, 450);
    }

    // Suporte moderno a pointerdown (com detecção precisa de touch) e fallback para touchstart
    if (window.PointerEvent) {
      window.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') {
          handleTouch(e.clientX, e.clientY);
        }
      }, { passive: true });
    } else {
      window.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches[0]) {
          handleTouch(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
    }
  }

  /* ==========================================================================
     MÓDULO 3: EFEITO DE ROLAGEM PARALLAX (ELEMENTOS IMOBILIÁRIOS DECORATIVOS)
     Pequenas chaves, casas e pins movendo-se a velocidades discretas nas margens
     ========================================================================== */
  function initScrollParallax() {
    const decorElements = Array.from(document.querySelectorAll('[data-cdb-scroll-speed]'));
    if (decorElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
      const windowH = window.innerHeight;

      for (let i = 0; i < decorElements.length; i++) {
        const el = decorElements[i];
        const parent = el.parentElement;
        if (!parent) continue;

        const rect = parent.getBoundingClientRect();
        // Apenas processa se a seção pai estiver visível na janela
        if (rect.top < windowH && rect.bottom > 0) {
          const speed = parseFloat(el.getAttribute('data-cdb-scroll-speed') || '0.12');
          const baseOffset = parseFloat(el.getAttribute('data-cdb-base-offset') || '0');
          const rot = parseFloat(el.getAttribute('data-cdb-rotation') || '0');

          // Distância relativa ao centro da viewport
          const centerDelta = rect.top - (windowH * 0.5) + (rect.height * 0.5);
          const offsetY = centerDelta * speed + baseOffset;

          el.style.transform = `translate3d(0, ${offsetY.toFixed(1)}px, 0) rotate(${rot}deg)`;
        }
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Executa a primeira calibragem
    updateParallax();
  }

  /* ==========================================================================
     INICIALIZAÇÃO GERAL
     ========================================================================== */
  function init() {
    initCustomCursor();
    initTouchRipple();
    initScrollParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
