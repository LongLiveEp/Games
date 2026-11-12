
    /**
     * ============================================================================
     * 12. PHASER 3 INITIALIZATION (960x540, Scale.FIT, CENTER_BOTH)
     * ============================================================================
     */
    function initPhaserGame() {
      if (window.gameInstance) return;

      // ==========================================================================
      // HIGH-DPI / FULL HD (1920x1080) RENDERING & 3X TEXT/TEXTURE SHARPNESS ENGINE
      // Keeps logical game world at 960x540 (preserving all physics, cameras & hitboxes)
      // while rendering the canvas framebuffer at 1920x1080 (2x) and text/textures at 3x!
      // ==========================================================================
      const HD_SCALE = 2;
      const TEXT_RES = 3;

      if (!Phaser.__hdPatched) {
        Phaser.__hdPatched = true;

        // 1. Patch Text Factory for 3x crisp typography & non-Courier default font
        // (Phaser 3.60 natively scales Text canvas by style.resolution and divides by style.resolution in Text.renderWebGL)
        if (Phaser.GameObjects && Phaser.GameObjects.GameObjectFactory && Phaser.GameObjects.Text) {
          const origAddText = Phaser.GameObjects.GameObjectFactory.prototype.text;
          Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
            const nextStyle = Object.assign({}, style || {});
            if (!nextStyle.fontFamily || nextStyle.fontFamily === 'Courier') {
              nextStyle.fontFamily = "'Segoe UI', 'Cormorant Infant', Roboto, Georgia, sans-serif";
            }
            nextStyle.resolution = Math.max(nextStyle.resolution || 0, TEXT_RES);
            if (!nextStyle.padding) {
              nextStyle.padding = { top: 2, bottom: 2 };
            }
            const txtObj = origAddText.call(this, x, y, text, nextStyle);
            if (txtObj && txtObj.frame && txtObj.frame.source) {
              txtObj.frame.source.resolution = nextStyle.resolution;
            }
            return txtObj;
          };
        }

        // 2. Patch TileSprite.updateTileTexture so 3x supersampled platform/cloud tiles render at 2x POT resolution
        if (Phaser.GameObjects && Phaser.GameObjects.TileSprite) {
          const origUpdateTileTexture = Phaser.GameObjects.TileSprite.prototype.updateTileTexture;
          Phaser.GameObjects.TileSprite.prototype.updateTileTexture = function () {
            const frame = this.displayFrame;
            if (frame && frame.source && frame.source._hiRes && this.dirty && this.renderer) {
              const ctx = this.fillContext;
              const canvas = this.fillCanvas;
              const scale = 2; // Keep power-of-two (64x32 -> 128x64) for WebGL REPEAT
              const w = this.potWidth * scale;
              const h = this.potHeight * scale;
              ctx.clearRect(0, 0, w, h);
              canvas.width = w;
              canvas.height = h;
              ctx.imageSmoothingEnabled = true;
              ctx.drawImage(
                frame.source.image,
                0,
                0,
                frame.source.image.width,
                frame.source.image.height,
                0,
                0,
                w,
                h
              );
              if (this.renderer.gl) {
                this.fillPattern = this.renderer.canvasToTexture(canvas, this.fillPattern);
              } else {
                this.fillPattern = ctx.createPattern(canvas, 'repeat');
              }
              this.updateCanvas();
              this.dirty = false;
              return;
            }
            return origUpdateTileTexture.call(this);
          };
        }

        // 3. Patch WebGLRenderer to render 960x540 logical world into a 1920x1080 (HD_SCALE = 2) framebuffer
        if (Phaser.Renderer && Phaser.Renderer.WebGL && Phaser.Renderer.WebGL.WebGLRenderer) {
          const WebGLProto = Phaser.Renderer.WebGL.WebGLRenderer.prototype;

          const origResize = WebGLProto.resize;
          WebGLProto.resize = function (t, e) {
            const res = origResize.call(this, t, e);
            if (this.canvas) {
              this.canvas.width = t * HD_SCALE;
              this.canvas.height = e * HD_SCALE;
            }
            if (this.gl) {
              this.gl.viewport(0, 0, t * HD_SCALE, e * HD_SCALE);
              this.drawingBufferHeight = this.gl.drawingBufferHeight;
              this.gl.scissor(0, 0, t * HD_SCALE, e * HD_SCALE);
            }
            return res;
          };

          const origPreRender = WebGLProto.preRender;
          WebGLProto.preRender = function () {
            if (this.canvas && (this.canvas.width !== this.width * HD_SCALE || this.canvas.height !== this.height * HD_SCALE)) {
              this.canvas.width = this.width * HD_SCALE;
              this.canvas.height = this.height * HD_SCALE;
            }
            origPreRender.call(this);
            if (!this.contextLost && this.gl && !this.currentFramebuffer) {
              this.gl.viewport(0, 0, this.width * HD_SCALE, this.height * HD_SCALE);
              this.drawingBufferHeight = this.gl.drawingBufferHeight;
              this.gl.scissor(0, 0, this.width * HD_SCALE, this.height * HD_SCALE);
            }
          };

          const origResetViewport = WebGLProto.resetViewport;
          WebGLProto.resetViewport = function () {
            if (this.gl && !this.currentFramebuffer) {
              this.gl.viewport(0, 0, this.width * HD_SCALE, this.height * HD_SCALE);
              this.drawingBufferHeight = this.gl.drawingBufferHeight;
            } else {
              origResetViewport.call(this);
            }
          };

          WebGLProto.setScissor = function (t, e, i, s, n) {
            const r = this.gl;
            const o = this.currentScissor;
            let a = i > 0 && s > 0;
            if (o && a) {
              a = o[0] !== t || o[1] !== e || o[2] !== i || o[3] !== s;
            }
            if (a && r) {
              this.flush();
              const sc = this.currentFramebuffer ? 1 : HD_SCALE;
              const bufH = this.currentFramebuffer ? (n !== undefined ? n : this.drawingBufferHeight) : r.drawingBufferHeight;
              r.scissor(t * sc, bufH - (e + s) * sc, i * sc, s * sc);
            }
          };

          WebGLProto.resetScissor = function () {
            const t = this.gl;
            if (!t) return;
            t.enable(t.SCISSOR_TEST);
            const e = this.currentScissor;
            if (e) {
              const i = e[0], s = e[1], n = e[2], r = e[3];
              if (n > 0 && r > 0) {
                const sc = this.currentFramebuffer ? 1 : HD_SCALE;
                const bufH = this.currentFramebuffer ? this.drawingBufferHeight : t.drawingBufferHeight;
                t.scissor(i * sc, bufH - (s + r) * sc, n * sc, r * sc);
              }
            }
          };
        }

        // 4. Patch CanvasRenderer (2D fallback) to also render at 1920x1080 and support _hiRes textures
        if (Phaser.Renderer && Phaser.Renderer.Canvas && Phaser.Renderer.Canvas.CanvasRenderer) {
          const CanvasProto = Phaser.Renderer.Canvas.CanvasRenderer.prototype;
          const origCanvasPreRender = CanvasProto.preRender;
          CanvasProto.preRender = function () {
            if (this.gameCanvas && (this.gameCanvas.width !== this.width * HD_SCALE || this.gameCanvas.height !== this.height * HD_SCALE)) {
              this.gameCanvas.width = this.width * HD_SCALE;
              this.gameCanvas.height = this.height * HD_SCALE;
            }
            if (this.gameContext) {
              this.gameContext._hdScale = HD_SCALE;
              this.gameContext.imageSmoothingEnabled = true;
            }
            origCanvasPreRender.call(this);
            if (this.gameContext) {
              this.gameContext.setTransform(HD_SCALE, 0, 0, HD_SCALE, 0, 0);
            }
          };

          const origBatchSprite = CanvasProto.batchSprite;
          CanvasProto.batchSprite = function (sprite, frame, camera, parentMatrix) {
            if (frame && frame.source && frame.source._hiRes) {
              const res = frame.source._hiRes;
              const origCutW = frame.cutWidth;
              const origCutH = frame.cutHeight;
              frame.cutWidth = origCutW * res;
              frame.cutHeight = origCutH * res;
              frame.source.resolution = res;
              origBatchSprite.call(this, sprite, frame, camera, parentMatrix);
              frame.cutWidth = origCutW;
              frame.cutHeight = origCutH;
              frame.source.resolution = 1;
              return;
            }
            return origBatchSprite.call(this, sprite, frame, camera, parentMatrix);
          };
        }

        if (Phaser.GameObjects && Phaser.GameObjects.Components && Phaser.GameObjects.Components.TransformMatrix) {
          const origSetToContext = Phaser.GameObjects.Components.TransformMatrix.prototype.setToContext;
          Phaser.GameObjects.Components.TransformMatrix.prototype.setToContext = function (ctx) {
            if (ctx && ctx._hdScale) {
              const s = ctx._hdScale;
              const m = this.matrix;
              ctx.setTransform(m[0] * s, m[1] * s, m[2] * s, m[3] * s, m[4] * s, m[5] * s);
              return ctx;
            }
            return origSetToContext.call(this, ctx);
          };
        }
      }

      const gameConfig = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
        backgroundColor: '#1d3557',
        render: {
          antialias: true,
          antialiasGL: true,
          roundPixels: false,
          powerPreference: 'high-performance',
          mipmapFilter: 'LINEAR_MIPMAP_LINEAR'
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.NO_CENTER,
          parent: 'game-container',
          width: CONFIG.WIDTH,
          height: CONFIG.HEIGHT
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: CONFIG.GRAVITY },
            debug: false
          }
        },
        scene: [BootScene, TitleScene, HutScene, GameScene, HrytskoScene, BabaYagaScene, CatfishScene, ZmiyFinaleScene]
      };

      const game = new Phaser.Game(gameConfig);
      window.gameInstance = game;

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (!game || !game.scene || !game.scene.scenes) return;
          game.scene.scenes.forEach((sc) => {
            if (sc && sc.children && sc.children.list) {
              sc.children.list.forEach((child) => {
                if (child && typeof child.updateText === 'function') {
                  child.updateText();
                } else if (child && child.list && Array.isArray(child.list)) {
                  child.list.forEach((sub) => {
                    if (sub && typeof sub.updateText === 'function') {
                      sub.updateText();
                    }
                  });
                }
              });
            }
          });
        }).catch(() => {});
      }

      const containerEl = document.getElementById('game-container');
      const rotatePrompt = document.getElementById('rotate-device-overlay');
      const dismissBtn = document.getElementById('dismiss-rotate-prompt');
      let dismissedOrientationPrompt = false;

      function getViewportSize() {
        let vw = window.innerWidth || document.documentElement.clientWidth || CONFIG.WIDTH;
        let vh = window.innerHeight || document.documentElement.clientHeight || CONFIG.HEIGHT;
        if (window.visualViewport) {
          vw = Math.round(window.visualViewport.width) || vw;
          vh = Math.round(window.visualViewport.height) || vh;
        }
        return { vw, vh };
      }

      // Override Phaser ScaleManager updateCenter & updateScale so it never adds margin offsets
      // and stretches to 100% full screen on mobile/tablet landscape while maintaining 1920x1080 backing store
      if (game.scale) {
        game.scale.updateCenter = function () {
          if (this.canvas && this.canvas.style) {
            this.canvas.style.marginLeft = '0px';
            this.canvas.style.marginTop = '0px';
            this.canvas.style.margin = '0px';
          }
        };

        game.scale.updateScale = function () {
          const { vw, vh } = getViewportSize();
          if (containerEl) {
            containerEl.style.width = vw + 'px';
            containerEl.style.height = vh + 'px';
          }

          this.parentSize.setSize(vw, vh);

          const isTouchOrMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (vw <= 1024) || (vh <= 600);
          const isLandscape = vw >= vh;

          let targetW, targetH;
          if (isTouchOrMobile && isLandscape) {
            // Fill 100% of the mobile landscape viewport so there are no black bars or corner offsets
            targetW = vw;
            targetH = vh;
          } else {
            // Proportional 16:9 fit centered cleanly via Flexbox
            const scale = Math.min(vw / CONFIG.WIDTH, vh / CONFIG.HEIGHT);
            targetW = Math.max(1, Math.floor(CONFIG.WIDTH * scale));
            targetH = Math.max(1, Math.floor(CONFIG.HEIGHT * scale));
          }

          this.displaySize.setAspectMode(Phaser.Scale.NONE);
          this.displaySize.setSize(targetW, targetH);

          if (this.canvas) {
            if (this.canvas.width !== CONFIG.WIDTH * HD_SCALE || this.canvas.height !== CONFIG.HEIGHT * HD_SCALE) {
              this.canvas.width = CONFIG.WIDTH * HD_SCALE;
              this.canvas.height = CONFIG.HEIGHT * HD_SCALE;
            }
            if (this.canvas.style) {
              this.canvas.style.width = targetW + 'px';
              this.canvas.style.height = targetH + 'px';
              this.canvas.style.marginLeft = '0px';
              this.canvas.style.marginTop = '0px';
              this.canvas.style.margin = '0px';
            }
          }
        };
      }

      if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dismissedOrientationPrompt = true;
          if (rotatePrompt) rotatePrompt.style.display = 'none';
          checkOrientationAndScale();
        });
      }

      let lastVw = 0;
      let lastVh = 0;

      function checkOrientationAndScale() {
        const { vw, vh } = getViewportSize();
        lastVw = vw;
        lastVh = vh;

        if (rotatePrompt) {
          const isPortrait = vh > vw;
          const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (vw < 850);
          if (isPortrait && isMobileDevice && !dismissedOrientationPrompt) {
            rotatePrompt.style.display = 'flex';
          } else {
            rotatePrompt.style.display = 'none';
          }
        }

        if (game && game.scale && game.canvas) {
          game.scale.refresh();
        }
      }

      checkOrientationAndScale();
      setTimeout(checkOrientationAndScale, 100);
      setTimeout(checkOrientationAndScale, 350);

      window.addEventListener('resize', checkOrientationAndScale);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', checkOrientationAndScale);
      }
      window.addEventListener('orientationchange', () => {
        setTimeout(checkOrientationAndScale, 50);
        setTimeout(checkOrientationAndScale, 200);
        setTimeout(checkOrientationAndScale, 500);
        setTimeout(checkOrientationAndScale, 900);
      });
      document.addEventListener('fullscreenchange', () => {
        setTimeout(checkOrientationAndScale, 100);
        setTimeout(checkOrientationAndScale, 350);
      });
      document.addEventListener('webkitfullscreenchange', () => {
        setTimeout(checkOrientationAndScale, 100);
        setTimeout(checkOrientationAndScale, 350);
      });

      // Continuous lightweight watcher to catch delayed WebView orientation changes on Android/iOS
      setInterval(() => {
        const { vw, vh } = getViewportSize();
        if (vw !== lastVw || vh !== lastVh) {
          checkOrientationAndScale();
        } else if (game && game.canvas && game.scale && game.scale.canvasBounds) {
          const rect = game.canvas.getBoundingClientRect();
          if (Math.abs(rect.left - game.scale.canvasBounds.x) > 2 || Math.abs(rect.width - game.scale.canvasBounds.width) > 2) {
            game.scale.refresh();
          }
        }
      }, 250);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPhaserGame);
      window.addEventListener('load', initPhaserGame);
    } else {
      initPhaserGame();
    }