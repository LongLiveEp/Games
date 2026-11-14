
    /**
     * GLOBAL DIFFICULTY & PROGRESSION STATE
     * 'casual'   -> Standard checkpoints, 1x enemy HP & damage
     * 'hardcore' -> One life (no checkpoints), 2x enemy HP & 1.5x enemy damage
     */
    const GAME_STATE = {
      language: 'uk',
      difficulty: 'casual',
      currentLevel: 1,
      hasSaber: false,
      hasSwampFrogs: false,
      savedCoins: 0,
      hasSeenVodyanykIntro: false,
      isHardcore() {
        return this.difficulty === 'hardcore';
      },
      getEnemyHpMultiplier() {
        return this.difficulty === 'hardcore' ? 2 : 1;
      },
      getEnemyDamageMultiplier() {
        return this.difficulty === 'hardcore' ? 1.5 : 1;
      }
    };

    function isIOSDevice() {
      const ua = navigator.userAgent || '';
      const isIPhoneOrIPod = /iPhone|iPod/i.test(ua);
      const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      return { isIPhoneOrIPod, isIPad, isIOS: isIPhoneOrIPod || isIPad };
    }

    function isStandaloneMode() {
      return Boolean(
        (window.navigator && window.navigator.standalone) ||
        (window.matchMedia && (window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches))
      );
    }

    function showIOSSafariFullscreenBanner() {
      if (isStandaloneMode()) return;
      const existing = document.getElementById('ios-fs-hint-banner');
      if (existing) {
        existing.style.display = 'flex';
        return;
      }
      const banner = document.createElement('div');
      banner.id = 'ios-fs-hint-banner';
      banner.style.cssText = [
        'position:fixed',
        'top:10px',
        'left:50%',
        'transform:translateX(-50%)',
        'z-index:100000',
        'background:rgba(20, 22, 31, 0.96)',
        'border:2px solid #ffd166',
        'border-radius:12px',
        'padding:10px 14px',
        'color:#f8f9fa',
        'font-family:Segoe UI, sans-serif',
        'font-size:13px',
        'line-height:1.4',
        'max-width:92vw',
        'width:460px',
        'box-shadow:0 8px 24px rgba(0,0,0,0.8)',
        'display:flex',
        'align-items:center',
        'justify-content:space-between',
        'gap:10px'
      ].join(';');

      const textSpan = document.createElement('div');
      const isEn = GAME_STATE.language === 'en';
      textSpan.innerHTML = isEn
        ? '<strong style="color:#ffd166;">📱 Fullscreen on iPhone:</strong> Apple restricts auto-fullscreen in Safari. ' +
          'Tap <b>"AA"</b> (in the address bar) → <b>"Hide Toolbar"</b>, or <b>"Share" → "Add to Home Screen"</b>!'
        : '<strong style="color:#ffd166;">📱 Повний екран на iPhone:</strong> Apple обмежує авто-повний екран у браузері. ' +
          'Натисніть <b>«Аа»</b> (або меню адреси) → <b>«Сховати панель інструментів»</b>, або <b>«Поділитися» → «На початковий екран»</b>!';

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = [
        'background:#2b2d42',
        'border:1px solid #8d99ae',
        'color:#ffd166',
        'border-radius:6px',
        'padding:4px 9px',
        'font-size:13px',
        'font-weight:bold',
        'cursor:pointer',
        'flex-shrink:0'
      ].join(';');

      const dismiss = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      };
      closeBtn.addEventListener('click', dismiss);
      closeBtn.addEventListener('touchend', dismiss);
      banner.addEventListener('click', dismiss);

      banner.appendChild(textSpan);
      banner.appendChild(closeBtn);
      document.body.appendChild(banner);

      setTimeout(() => {
        if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      }, 7500);
    }

    function applyIOSViewportMaximize(showHintIfIPhone) {
      try {
        window.scrollTo(0, 1);
        if (window.parent && window.parent !== window) {
          try { window.parent.scrollTo(0, 1); } catch (e) {}
        }
        if (window.gameInstance && window.gameInstance.scale) {
          window.gameInstance.scale.refresh();
          setTimeout(() => {
            if (window.gameInstance && window.gameInstance.scale) {
              window.gameInstance.scale.refresh();
            }
          }, 150);
        }
        const { isIPhoneOrIPod } = isIOSDevice();
        if (showHintIfIPhone && isIPhoneOrIPod && !isStandaloneMode()) {
          showIOSSafariFullscreenBanner();
        }
      } catch (e) {}
    }

    function tryNativeFullscreenOnTargets() {
      let targetDoc = window.document;
      try {
        if (window.parent && window.parent !== window && window.parent.document) {
          targetDoc = window.parent.document;
        }
      } catch (err) {
        targetDoc = window.document;
      }

      const candidates = [
        targetDoc.documentElement,
        document.documentElement,
        document.getElementById('game-container'),
        document.querySelector('canvas')
      ].filter(Boolean);

      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (typeof rfs === 'function') {
          try {
            const res = rfs.call(el, { navigationUI: 'hide' });
            Promise.resolve(res).then(() => {
              if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
              }
            }).catch(() => {});
            return true;
          } catch (e) {}
        }
      }
      return false;
    }

    function requestAppFullscreen(showHintIfUnsupported) {
      try {
        let targetDoc = window.document;
        try {
          if (window.parent && window.parent !== window && window.parent.document) {
            targetDoc = window.parent.document;
          }
        } catch (err) {
          targetDoc = window.document;
        }

        const isFs = targetDoc.fullscreenElement || targetDoc.webkitFullscreenElement || targetDoc.mozFullScreenElement || targetDoc.msFullscreenElement ||
                     document.fullscreenElement || document.webkitFullscreenElement;

        if (!isFs) {
          const supported = tryNativeFullscreenOnTargets();
          // Also bind one-shot touchend/click in case requestAppFullscreen was called on touchstart/pointerdown
          const onGestureEnd = () => {
            tryNativeFullscreenOnTargets();
            window.removeEventListener('touchend', onGestureEnd);
            window.removeEventListener('click', onGestureEnd);
          };
          window.addEventListener('touchend', onGestureEnd, { once: true, passive: true });
          window.addEventListener('click', onGestureEnd, { once: true, passive: true });

          if (!supported) {
            applyIOSViewportMaximize(Boolean(showHintIfUnsupported));
          }
        }
      } catch (e) {
        applyIOSViewportMaximize(Boolean(showHintIfUnsupported));
      }
    }

    function toggleAppFullscreen() {
      try {
        let targetDoc = window.document;
        try {
          if (window.parent && window.parent !== window && window.parent.document) {
            targetDoc = window.parent.document;
          }
        } catch (err) {
          targetDoc = window.document;
        }

        const isFs = targetDoc.fullscreenElement || targetDoc.webkitFullscreenElement || targetDoc.mozFullScreenElement || targetDoc.msFullscreenElement ||
                     document.fullscreenElement || document.webkitFullscreenElement;

        if (!isFs) {
          requestAppFullscreen(true);
        } else {
          const efs = targetDoc.exitFullscreen || targetDoc.webkitExitFullscreen || targetDoc.mozCancelFullScreen || targetDoc.msExitFullscreen ||
                      document.exitFullscreen || document.webkitExitFullscreen;
          if (efs) {
            Promise.resolve(efs.call(targetDoc)).catch(() => {});
          }
        }
      } catch (e) {
        applyIOSViewportMaximize(true);
      }
    }