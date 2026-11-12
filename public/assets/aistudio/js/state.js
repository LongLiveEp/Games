
    /**
     * GLOBAL DIFFICULTY & PROGRESSION STATE
     * 'casual'   -> Standard checkpoints, 1x enemy HP & damage
     * 'hardcore' -> One life (no checkpoints), 2x enemy HP & 1.5x enemy damage
     */
    const GAME_STATE = {
      difficulty: 'casual',
      currentLevel: 1,
      hasSaber: false,
      hasSwampFrogs: false,
      savedCoins: 0,
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

        const docEl = targetDoc.documentElement;
        const isFs = targetDoc.fullscreenElement || targetDoc.webkitFullscreenElement || targetDoc.mozFullScreenElement || targetDoc.msFullscreenElement ||
                     document.fullscreenElement || document.webkitFullscreenElement;

        if (!isFs) {
          const rfs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
          if (rfs) {
            Promise.resolve(rfs.call(docEl)).then(() => {
              if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
              }
            }).catch(() => {
              const fallbackEl = document.documentElement;
              const fallbackRfs = fallbackEl.requestFullscreen || fallbackEl.webkitRequestFullscreen;
              if (fallbackRfs) fallbackRfs.call(fallbackEl).catch(() => {});
            });
          }
        } else {
          const efs = targetDoc.exitFullscreen || targetDoc.webkitExitFullscreen || targetDoc.mozCancelFullScreen || targetDoc.msExitFullscreen ||
                      document.exitFullscreen || document.webkitExitFullscreen;
          if (efs) {
            Promise.resolve(efs.call(targetDoc)).catch(() => {});
          }
        }
      } catch (e) {
        // Safe fallback in restricted frames
      }
    }