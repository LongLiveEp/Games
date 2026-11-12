
    /**
     * ============================================================================
     * 10. UI MANAGER (HUD, BOSS BAR, PAUSE MENU, VICTORY SCREEN & TOUCH CONTROLS)
     * All interactive UI elements are created directly in screen space with
     * .setScrollFactor(0) (NOT inside scrolled Containers) to avoid Phaser 3's
     * container input hitbox offset bug when camera.scrollX > 0.
     * ============================================================================
     */
    class UI {
      constructor(scene, isHut = false) {
        this.scene = scene;
        this.isHut = isHut;
        this.touchState = { left: false, right: false, down: false, jump: false, roll: false, attack: false, throw: false, heal: false };
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        this.pauseElements = [];
        this.pauseButtons = [];
        this.selectedPauseIndex = 0;

        this.deathElements = [];
        this.deathButtons = [];
        this.selectedDeathIndex = 0;

        this.victoryElements = [];
        this.controlsModalElements = [];

        if (!isHut) {
          this.createGameHUD();
          this.createControlsModal();
          this.createPauseModal();
          this.createDeathModal();
          this.createVictoryModal();
        }

        this.createTopUtilityButtons();
        this.createTouchControls();
      }

      createGameHUD() {
        // Stamina ("Сила козака") Panel (wider so Galushkas/Frogs and Uzvar counters never touch)
        const hudBg = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
        hudBg.fillStyle(0x14161f, 0.88);
        hudBg.lineStyle(2, 0xd4a373, 1);
        hudBg.fillRoundedRect(16, 14, 316, 74, 10);
        hudBg.strokeRoundedRect(16, 14, 316, 74, 10);

        const modeLabel = GAME_STATE.isHardcore() ? '🔥 ХАРДКОРАКТЕРНИК (1 ЖИТТЯ)' : STRINGS.STAMINA_LABEL;
        this.scene.add.text(28, 20, modeLabel, {
          fontSize: '12px',
          fontStyle: 'bold',
          color: GAME_STATE.isHardcore() ? '#ff6b6b' : '#ffd166'
        }).setScrollFactor(0).setDepth(101);

        this.staminaBarBg = this.scene.add.rectangle(28, 44, 232, 14, 0x2b2d42)
          .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
        this.staminaBarFill = this.scene.add.rectangle(28, 44, 232, 14, 0xe63946)
          .setOrigin(0, 0.5).setScrollFactor(0).setDepth(102);
        this.staminaValueText = this.scene.add.text(268, 44, '100%', {
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(102);

        // Counters: Chervintsi, Galushkas/Frogs, Kissel (Heal)
        this.coinsText = this.scene.add.text(28, 63, '🪙 0', {
          fontSize: '14px', fontStyle: 'bold', color: '#ffd166'
        }).setScrollFactor(0).setDepth(101);
        this.galushkaText = this.scene.add.text(94, 63, '🥟 Галушки [S]: 5', {
          fontSize: '14px', fontStyle: 'bold', color: '#f6e4b5'
        }).setScrollFactor(0).setDepth(101);
        this.uzvarText = this.scene.add.text(248, 63, '🍒 [A]: 2', {
          fontSize: '14px', fontStyle: 'bold', color: '#ff758f'
        }).setScrollFactor(0).setDepth(101);

        // Current Level Badge in top-left under HUD panel
        const isLevel2 = this.scene.currentLevel === 2;
        const isLevel3 = this.scene.currentLevel === 3;
        const isLevel4 = this.scene.currentLevel === 4;
        const badgeLabel = isLevel4
          ? `🌾 ${STRINGS.LEVEL_4_TITLE} (Шабля + Жаби)`
          : (isLevel3
            ? `🌊 ${STRINGS.LEVEL_3_TITLE} (Шабля + Жаби)`
            : (isLevel2 ? `🌲 ${STRINGS.LEVEL_2_TITLE} (Шабля кума)` : `🌻 ${STRINGS.LEVEL_1_TITLE}`));
        const badgeColor = isLevel4 ? '#f4a261' : (isLevel3 ? '#48cae4' : (isLevel2 ? '#ff9f1c' : '#ffd166'));

        this.levelBadgeText = this.scene.add.text(
          16,
          92,
          badgeLabel,
          {
            fontSize: '12px',
            fontStyle: 'bold',
            color: badgeColor,
            backgroundColor: '#14161fe0',
            padding: { x: 8, y: 3 }
          }
        ).setScrollFactor(0).setDepth(101);

        // Boss Stun Bar (Direct screen-space elements, hidden until entering Boss Arena)
        const bx = CONFIG.WIDTH / 2;
        const by = 52;
        this.bossBg = this.scene.add.rectangle(bx, by, 410, 48, 0x14161f, 0.92)
          .setStrokeStyle(2, 0xff4d4d).setScrollFactor(0).setDepth(101).setVisible(false);
        this.bossTitle = this.scene.add.text(
          bx,
          by - 11,
          isLevel4 ? STRINGS.BOSS_ZMIY_NAME : (isLevel3 ? STRINGS.BOSS_VODYANYK_NAME : (isLevel2 ? STRINGS.BOSS_LISOVYK_NAME : STRINGS.BOSS_NAME)),
          {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffbe0b'
          }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102).setVisible(false);
        this.bossBarTrack = this.scene.add.rectangle(bx - 175, by + 10, 350, 12, 0x2b2d42)
          .setOrigin(0, 0.5).setScrollFactor(0).setDepth(102).setVisible(false);
        this.bossBarFill = this.scene.add.rectangle(bx - 175, by + 10, 350, 12, 0xe63946)
          .setOrigin(0, 0.5).setScrollFactor(0).setDepth(103).setVisible(false);
        // Three-segment Boss Bar for Three-Headed Dragon Salyonohorych (Level 4)
        this.bossSegFills = [
          this.scene.add.rectangle(bx - 175, by + 10, 114, 12, 0xe63946)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(103).setVisible(false),
          this.scene.add.rectangle(bx - 57, by + 10, 114, 12, 0xe63946)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(103).setVisible(false),
          this.scene.add.rectangle(bx + 61, by + 10, 114, 12, 0xe63946)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(103).setVisible(false)
        ];
        this.bossSegDividers = [
          this.scene.add.rectangle(bx - 59, by + 10, 4, 14, 0x14161f)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(104).setVisible(false),
          this.scene.add.rectangle(bx + 59, by + 10, 4, 14, 0x14161f)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(104).setVisible(false)
        ];
        this.bossStageBadges = this.scene.add.text(bx + 185, by - 11, '●●', {
          fontSize: '16px',
          color: '#ff4d4d'
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(102).setVisible(false);
      }

      createControlsModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        // Dimmed backdrop in screen space
        const dim = this.scene.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0d0e15, 0.8)
          .setScrollFactor(0)
          .setDepth(190)
          .setInteractive();

        // Wider ornate card (700px) so all Ukrainian control descriptions fit cleanly with right margin
        const card = this.scene.add.graphics().setScrollFactor(0).setDepth(191);
        card.fillStyle(0x1d1e2c, 0.98);
        card.fillRoundedRect(cx - 350, cy - 215, 700, 430, 18);
        card.lineStyle(4, 0xffd166, 1);
        card.strokeRoundedRect(cx - 350, cy - 215, 700, 430, 18);
        card.lineStyle(2, 0xc1121f, 0.9);
        card.strokeRoundedRect(cx - 338, cy - 203, 676, 406, 14);

        const headerTxt = this.scene.add.text(cx, cy - 174, STRINGS.CONTROLS_MODAL_HEADER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          letterSpacing: 2,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(192);

        const titleTxt = this.scene.add.text(cx, cy - 138, STRINGS.CONTROLS_MODAL_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#ffffff',
          padding: { top: 4, bottom: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(192);

        this.controlsModalElements.push(dim, card, headerTxt, titleTxt);

        // Draw each keycap badge and description row neatly aligned inside the 700px card
        const startY = cy - 92;
        const rowStep = 33;

        STRINGS.CONTROLS_LIST.forEach((item, index) => {
          const rowY = startY + index * rowStep;

          // Keycap badge on the left
          const keyBg = this.scene.add.rectangle(cx - 235, rowY, 136, 26, 0x2b2d42, 1)
            .setStrokeStyle(1.5, 0xffd166)
            .setScrollFactor(0)
            .setDepth(192);

          const keyTxt = this.scene.add.text(cx - 235, rowY, item.key, {
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ffd166'
          }).setOrigin(0.5).setScrollFactor(0).setDepth(193);

          // Action description on the right (fits well inside cx + 320)
          const descTxt = this.scene.add.text(cx - 150, rowY, item.desc, {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#f5ebe0',
            padding: { top: 3, bottom: 5 }
          }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(192);

          this.controlsModalElements.push(keyBg, keyTxt, descTxt);
        });

        const footerTxt = this.scene.add.text(cx, cy + 174, STRINGS.CONTROLS_MODAL_FOOTER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '20px',
          fontStyle: 'italic bold',
          color: '#f6e4b5',
          padding: { top: 4, bottom: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(192);

        this.controlsModalElements.push(footerTxt);

        dim.on('pointerdown', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          if (this.scene.closeControlsModal) {
            this.scene.closeControlsModal();
          }
        });
      }

      setControlsModalVisible(visible) {
        this.controlsModalElements.forEach(el => el.setVisible(visible));
      }

      createTopUtilityButtons() {
        const makeTopBtn = (rightX, y, width, label, onClick) => {
          const cx = rightX - width / 2;
          const cy = y + 14;
          const bg = this.scene.add.rectangle(cx, cy, width, 28, 0x2b2d42, 0.95)
            .setStrokeStyle(1.5, 0x8d99ae)
            .setScrollFactor(0)
            .setDepth(110)
            .setInteractive({ useHandCursor: true });

          const txt = this.scene.add.text(cx, cy, label, {
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ffffff'
          }).setOrigin(0.5).setScrollFactor(0).setDepth(111);

          bg.on('pointerover', () => {
            bg.setFillStyle(0x3d405b, 1);
            bg.setStrokeStyle(2, 0xffd166);
            bg.setScale(1.04);
            txt.setScale(1.04);
          });
          bg.on('pointerout', () => {
            bg.setFillStyle(0x2b2d42, 0.95);
            bg.setStrokeStyle(1.5, 0x8d99ae);
            bg.setScale(1);
            txt.setScale(1);
          });
          bg.on('pointerdown', (pointer, lx, ly, event) => {
            if (event && event.stopPropagation) event.stopPropagation();
            onClick();
          });

          return { bg, txt };
        };

        this.fsBtn = makeTopBtn(
          CONFIG.WIDTH - 16,
          14,
          34,
          '⛶',
          () => toggleAppFullscreen()
        );

        this.muteBtn = makeTopBtn(
          CONFIG.WIDTH - 58,
          14,
          88,
          SFX.muted ? STRINGS.HUD_SOUND_OFF : STRINGS.HUD_SOUND_ON,
          () => {
            if (this.scene.toggleSoundMute) {
              this.scene.toggleSoundMute();
            } else {
              const muted = SFX.toggleMute();
              this.updateSoundButtonsText(muted);
            }
          }
        );

        if (!this.isHut) {
          this.pauseBtn = makeTopBtn(
            CONFIG.WIDTH - 154,
            14,
            106,
            STRINGS.HUD_PAUSE,
            () => this.scene.togglePause()
          );

          this.restartBtn = makeTopBtn(
            CONFIG.WIDTH - 268,
            14,
            102,
            STRINGS.HUD_RESTART,
            () => this.scene.restartLevel()
          );
        }
      }

      updateSoundButtonsText(muted) {
        if (this.muteBtn && this.muteBtn.txt) {
          this.muteBtn.txt.setText(muted ? STRINGS.HUD_SOUND_OFF : STRINGS.HUD_SOUND_ON);
        }
        if (this.pauseSoundButtonObj && this.pauseSoundButtonObj.lbl) {
          this.pauseSoundButtonObj.lbl.setText(muted ? STRINGS.PAUSE_SOUND_OFF : STRINGS.PAUSE_SOUND_ON);
        }
      }

      createPauseModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        // Dimmed backdrop in direct screen space
        const overlay = this.scene.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x090a0f, 0.78)
          .setScrollFactor(0)
          .setDepth(200)
          .setInteractive();

        // Modal Card (taller to fit Act I / Act II / Act III / Act IV Level Switch & Finale Test options cleanly)
        const card = this.scene.add.rectangle(cx, cy, 465, 516, 0x1d1e2c, 0.98)
          .setStrokeStyle(3, 0xffd166)
          .setScrollFactor(0)
          .setDepth(201);

        const title = this.scene.add.text(cx, cy - 224, STRINGS.PAUSE_TITLE, {
          fontSize: '23px',
          fontStyle: 'bold',
          color: '#ffd166'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202);

        const navHint = this.scene.add.text(cx, cy + 234, STRINGS.PAUSE_NAV_HINT, {
          fontSize: '12px',
          color: '#a8dadc'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202);

        this.pauseElements.push(overlay, card, title, navHint);

        const curLvl = this.scene.currentLevel || 1;
        const otherLevels = [1, 2, 3, 4].filter(l => l !== curLvl).map(l => ({
          text: l === 1
            ? STRINGS.PAUSE_LEVEL_1
            : (l === 2 ? STRINGS.PAUSE_LEVEL_2 : (l === 3 ? STRINGS.PAUSE_LEVEL_3 : STRINGS.PAUSE_LEVEL_4)),
          color: l === 1 ? 0x52796f : (l === 2 ? 0x3b2854 : (l === 3 ? 0x0077b6 : 0x9c6644)),
          action: () => this.scene.switchLevelFromMenu(l)
        }));

        // Pause Menu Buttons (includes quick jump to any Act + temporary Finale Test button)
        const buttonConfigs = [
          {
            text: STRINGS.PAUSE_RESUME,
            color: 0x2a9d8f,
            action: () => this.scene.togglePause()
          },
          ...(!GAME_STATE.isHardcore() ? [{
            text: STRINGS.PAUSE_CHECKPOINT,
            color: 0x3a86ff,
            action: () => this.scene.returnToCheckpointFromMenu()
          }] : []),
          {
            text: STRINGS.PAUSE_RESTART,
            color: 0xe76f51,
            action: () => this.scene.restartLevel()
          },
          ...otherLevels,
          {
            text: STRINGS.PAUSE_FINALE_TEST,
            color: 0xc9184a,
            action: () => this.scene.launchZmiyFinaleFromMenu()
          },
          {
            text: STRINGS.PAUSE_HUT,
            color: 0x457b9d,
            action: () => this.scene.goToHutScene()
          },
          {
            text: SFX.muted ? STRINGS.PAUSE_SOUND_OFF : STRINGS.PAUSE_SOUND_ON,
            color: 0x6d597a,
            isSoundBtn: true,
            action: () => this.scene.toggleSoundMute()
          }
        ];

        const startY = cy - 178;
        const stepY = 36;

        buttonConfigs.forEach((cfg, idx) => {
          const btnY = startY + idx * stepY;
          const btnObj = this.createScreenSpaceMenuButton(cx, btnY, 355, 31, cfg.text, cfg.color, 203, () => {
            this.selectedPauseIndex = idx;
            this.refreshPauseButtonHighlight();
            cfg.action();
          }, () => {
            this.selectedPauseIndex = idx;
            this.refreshPauseButtonHighlight();
          });

          this.pauseButtons.push(btnObj);
          this.pauseElements.push(btnObj.bg, btnObj.lbl);
          if (cfg.isSoundBtn) {
            this.pauseSoundButtonObj = btnObj;
          }
        });

        this.setPauseModalVisible(false);
      }

      createDeathModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;
        const isHardcore = GAME_STATE.isHardcore();

        const overlay = this.scene.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x120609, 0.84)
          .setScrollFactor(0)
          .setDepth(205)
          .setInteractive();

        const card = this.scene.add.rectangle(cx, cy, 520, 330, 0x1d1e2c, 0.98)
          .setStrokeStyle(4, isHardcore ? 0xff4d4d : 0xffd166)
          .setScrollFactor(0)
          .setDepth(206);

        const iconTxt = this.scene.add.text(cx, cy - 118, isHardcore ? '💀🔥' : '💫🥟', {
          fontSize: '32px'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(207);

        const title = this.scene.add.text(
          cx,
          cy - 76,
          isHardcore ? STRINGS.DEATH_TITLE_HARDCORE : STRINGS.DEATH_TITLE_CASUAL,
          {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '30px',
            fontStyle: 'bold',
            color: isHardcore ? '#ff6b6b' : '#ffd166'
          }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(207);

        const sub = this.scene.add.text(
          cx,
          cy - 22,
          isHardcore ? STRINGS.DEATH_SUB_HARDCORE : STRINGS.DEATH_SUB_CASUAL,
          {
            fontSize: '16px',
            color: '#f5ebe0',
            align: 'center',
            lineSpacing: 6
          }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(207);

        this.deathElements.push(overlay, card, iconTxt, title, sub);

        const deathBtnConfigs = isHardcore
          ? [
              {
                text: STRINGS.DEATH_BTN_RESTART_HARDCORE,
                color: 0xd62828,
                action: () => this.scene.restartLevel()
              }
            ]
          : [
              {
                text: STRINGS.DEATH_BTN_CHECKPOINT,
                color: 0x2a9d8f,
                action: () => this.scene.respawnAtCheckpointFromDeath()
              },
              {
                text: STRINGS.DEATH_BTN_RESTART,
                color: 0xe76f51,
                action: () => this.scene.restartLevel()
              }
            ];

        deathBtnConfigs.forEach((cfg, idx) => {
          const btnY = isHardcore ? (cy + 75) : (cy + 48 + idx * 56);
          const btnObj = this.createScreenSpaceMenuButton(
            cx,
            btnY,
            350,
            44,
            cfg.text,
            cfg.color,
            208,
            () => cfg.action(),
            () => {
              this.selectedDeathIndex = idx;
              this.refreshDeathButtonHighlight();
            }
          );
          this.deathButtons.push(btnObj);
          this.deathElements.push(btnObj.bg, btnObj.lbl);
        });

        this.setDeathModalVisible(false);
      }

      setDeathModalVisible(visible) {
        this.deathElements.forEach(el => el.setVisible(visible));
        if (visible) {
          this.selectedDeathIndex = 0;
          this.refreshDeathButtonHighlight();
        }
      }

      refreshDeathButtonHighlight() {
        this.deathButtons.forEach((btn, idx) => {
          const isSelected = idx === this.selectedDeathIndex;
          if (isSelected) {
            btn.bg.setStrokeStyle(3.5, 0xffea00);
            btn.lbl.setColor('#ffea00');
            btn.bg.setScale(1.04);
            btn.lbl.setScale(1.04);
          } else {
            btn.bg.setStrokeStyle(2, 0xffffff);
            btn.lbl.setColor('#ffffff');
            btn.bg.setScale(1);
            btn.lbl.setScale(1);
          }
        });
      }

      moveDeathSelection(delta) {
        if (!this.deathButtons.length) return;
        const len = this.deathButtons.length;
        this.selectedDeathIndex = (this.selectedDeathIndex + delta + len) % len;
        SFX.speechBlip();
        this.refreshDeathButtonHighlight();
      }

      activateSelectedDeathButton() {
        const btn = this.deathButtons[this.selectedDeathIndex];
        if (btn && btn.action) {
          SFX.pickup();
          btn.action();
        }
      }

      createVictoryModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;
        const isLvl2 = this.scene.currentLevel === 2;
        const isLvl4 = this.scene.currentLevel === 4;

        const overlay = this.scene.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0b0c10, 0.86)
          .setScrollFactor(0)
          .setDepth(210)
          .setInteractive();

        const card = this.scene.add.rectangle(cx, cy, 820, 385, isLvl4 ? 0x241332 : (isLvl2 ? 0x161224 : 0x1d3557), 0.98)
          .setStrokeStyle(4, 0xffd166)
          .setScrollFactor(0)
          .setDepth(211);

        const title = this.scene.add.text(
          cx,
          cy - 132,
          isLvl4 ? STRINGS.VICTORY_ACT4_TITLE : (isLvl2 ? STRINGS.VICTORY_ACT2_TITLE : STRINGS.VICTORY_TITLE),
          {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '34px',
            fontStyle: 'bold',
            color: '#ffd166'
          }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(212);

        const msg = this.scene.add.text(
          cx,
          cy - 52,
          isLvl4 ? STRINGS.VICTORY_ACT4_TEXT : (isLvl2 ? STRINGS.VICTORY_ACT2_TEXT : STRINGS.VICTORY_TEXT),
          {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '21px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 750 },
            lineSpacing: 7
          }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(212);

        const sub = this.scene.add.text(
          cx,
          cy + 12,
          isLvl4 ? STRINGS.VICTORY_ACT4_SUBTEXT : (isLvl2 ? STRINGS.VICTORY_ACT2_SUBTEXT : STRINGS.VICTORY_SUBTEXT),
          {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '19px',
            fontStyle: 'italic bold',
            color: '#f6e4b5',
            align: 'center',
            wordWrap: { width: 750 }
          }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(212);

        this.victoryStats = this.scene.add.text(cx, cy + 56, '', {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#a8dadc',
          backgroundColor: '#0f172a',
          padding: { x: 14, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(212);

        const againBtn = this.createScreenSpaceMenuButton(
          cx,
          cy + 124,
          340,
          48,
          isLvl4 ? STRINGS.ACT4_TO_TITLE_BTN : STRINGS.PLAY_AGAIN,
          0x2a9d8f,
          213,
          () => {
            if (isLvl4 && this.scene.returnToTitleFromAct4) {
              this.scene.returnToTitleFromAct4();
            } else {
              this.scene.goToHutScene();
            }
          }
        );

        this.victoryElements.push(overlay, card, title, msg, sub, this.victoryStats, againBtn.bg, againBtn.lbl);
        this.setVictoryModalVisible(false);
      }

      createScreenSpaceMenuButton(x, y, w, h, text, baseColorHex, depth, onActivate, onHoverSelect) {
        const bg = this.scene.add.rectangle(x, y, w, h, baseColorHex, 1)
          .setStrokeStyle(2, 0xffffff)
          .setScrollFactor(0)
          .setDepth(depth)
          .setInteractive({ useHandCursor: true });

        const lbl = this.scene.add.text(x, y, text, {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

        const btnObj = { bg, lbl, baseColorHex, action: onActivate };

        bg.on('pointerover', () => {
          SFX.speechBlip();
          bg.setScale(1.04);
          lbl.setScale(1.04);
          bg.setStrokeStyle(3, 0xffea00);
          if (onHoverSelect) onHoverSelect();
        });

        bg.on('pointerout', () => {
          bg.setScale(1);
          lbl.setScale(1);
          this.refreshPauseButtonHighlight();
        });

        bg.on('pointerdown', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          bg.setScale(0.97);
          lbl.setScale(0.97);
        });

        bg.on('pointerup', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          bg.setScale(1.03);
          lbl.setScale(1.03);
          SFX.pickup();
          onActivate();
        });

        return btnObj;
      }

      setPauseModalVisible(visible) {
        this.pauseElements.forEach(el => el.setVisible(visible));
        if (visible) {
          this.selectedPauseIndex = 0;
          this.refreshPauseButtonHighlight();
        }
      }

      refreshPauseButtonHighlight() {
        this.pauseButtons.forEach((btn, idx) => {
          const isSelected = idx === this.selectedPauseIndex;
          if (isSelected) {
            btn.bg.setStrokeStyle(3.5, 0xffea00);
            btn.lbl.setColor('#ffea00');
            btn.bg.setScale(1.04);
            btn.lbl.setScale(1.04);
          } else {
            btn.bg.setStrokeStyle(2, 0xffffff);
            btn.lbl.setColor('#ffffff');
            btn.bg.setScale(1);
            btn.lbl.setScale(1);
          }
        });
      }

      movePauseSelection(delta) {
        if (!this.pauseButtons.length) return;
        const len = this.pauseButtons.length;
        this.selectedPauseIndex = (this.selectedPauseIndex + delta + len) % len;
        SFX.speechBlip();
        this.refreshPauseButtonHighlight();
      }

      activateSelectedPauseButton() {
        const btn = this.pauseButtons[this.selectedPauseIndex];
        if (btn && btn.action) {
          SFX.pickup();
          btn.action();
        }
      }

      setVictoryModalVisible(visible) {
        this.victoryElements.forEach(el => el.setVisible(visible));
      }

      createTouchControls() {
        // Show virtual joystick & action buttons only on touch devices, directly in screen space
        if (!this.isTouchDevice) return;

        this.scene.input.addPointer(3);

        // Virtual Joystick on Left
        const joyX = 115, joyY = CONFIG.HEIGHT - 105, joyR = 54;
        this.joyBase = this.scene.add.circle(joyX, joyY, joyR, 0xffffff, 0.18)
          .setStrokeStyle(2, 0xffffff, 0.45)
          .setScrollFactor(0)
          .setDepth(120);
        this.joyThumb = this.scene.add.circle(joyX, joyY, 26, 0xffd166, 0.65)
          .setScrollFactor(0)
          .setDepth(121);

        this.scene.input.on('pointermove', (p) => {
          if (this.scene.isPaused || this.scene.isVictory) return;
          if (p.isDown && p.x < CONFIG.WIDTH * 0.45) {
            const dx = p.x - joyX;
            const dy = p.y - joyY;
            const angle = Math.atan2(dy, dx);
            const dist = Math.min(joyR, Math.hypot(dx, dy));
            this.joyThumb.setPosition(joyX + Math.cos(angle) * dist, joyY + Math.sin(angle) * dist);
            this.touchState.left = dx < -16;
            this.touchState.right = dx > 16;
            this.touchState.down = dy > 22;
          }
        });

        this.scene.input.on('pointerup', (p) => {
          if (p.x < CONFIG.WIDTH * 0.45) {
            this.joyThumb.setPosition(joyX, joyY);
            this.touchState.left = false;
            this.touchState.right = false;
            this.touchState.down = false;
          }
        });

        // Action Buttons on Right (direct screen-space interactive circles)
        const makeTouchBtn = (x, y, r, label, key, color) => {
          const circle = this.scene.add.circle(x, y, r, color, 0.55)
            .setStrokeStyle(2, 0xffffff, 0.8)
            .setScrollFactor(0)
            .setDepth(120)
            .setInteractive();
          const txt = this.scene.add.text(x, y, label, {
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ffffff'
          }).setOrigin(0.5).setScrollFactor(0).setDepth(121);

          circle.on('pointerdown', () => { this.touchState[key] = true; });
          circle.on('pointerup', () => { this.touchState[key] = false; });
          circle.on('pointerout', () => { this.touchState[key] = false; });
        };

        makeTouchBtn(CONFIG.WIDTH - 75, CONFIG.HEIGHT - 85, 36, STRINGS.TOUCH_JUMP, 'jump', 0x2a9d8f);
        makeTouchBtn(CONFIG.WIDTH - 160, CONFIG.HEIGHT - 75, 36, STRINGS.TOUCH_HIT, 'attack', 0xe63946);
        makeTouchBtn(CONFIG.WIDTH - 140, CONFIG.HEIGHT - 155, 30, STRINGS.TOUCH_ROLL, 'roll', 0x457b9d);
        makeTouchBtn(CONFIG.WIDTH - 65, CONFIG.HEIGHT - 165, 28, STRINGS.TOUCH_GALUSHKA, 'throw', 0xe9c46a);
        makeTouchBtn(CONFIG.WIDTH - 225, CONFIG.HEIGHT - 130, 26, STRINGS.TOUCH_UZVAR, 'heal', 0x9b5de5);
      }

      updateHUD(player, boss) {
        if (this.isHut) return;

        const ratio = Phaser.Math.Clamp(player.stamina / CONFIG.PLAYER.MAX_STAMINA, 0, 1);
        this.staminaBarFill.width = 232 * ratio;
        this.staminaValueText.setText(`${Math.ceil(player.stamina)}%`);
        this.coinsText.setText(`🪙 ${player.coins}`);
        this.galushkaText.setText(
          GAME_STATE.hasSwampFrogs
            ? `🐸 Жаби [S]: ${player.galushkas}`
            : `🥟 Галушки [S]: ${player.galushkas}`
        );
        this.uzvarText.setText(`🍒 [A]: ${player.uzvarCharges}`);

        const showBoss = Boolean(boss && boss.active && !boss.isFinished);
        const isZmiyComposite = Boolean(showBoss && boss.isCompositeZmiy && boss.heads);
        this.bossBg.setVisible(showBoss);
        this.bossTitle.setVisible(showBoss);
        this.bossBarTrack.setVisible(showBoss);
        this.bossBarFill.setVisible(showBoss && !isZmiyComposite);
        this.bossStageBadges.setVisible(showBoss);
        if (this.bossSegFills) {
          this.bossSegFills.forEach(s => s.setVisible(isZmiyComposite));
        }
        if (this.bossSegDividers) {
          this.bossSegDividers.forEach(d => d.setVisible(isZmiyComposite));
        }

        if (showBoss) {
          if (isZmiyComposite) {
            boss.heads.forEach((h, idx) => {
              const seg = this.bossSegFills[idx];
              if (!seg) return;
              const hRatio = (h.isPhaseDone && boss.phase < 4) || h.isPhase4Down
                ? 0
                : Phaser.Math.Clamp(1 - (h.stun / h.maxStun), 0, 1);
              seg.width = 114 * hRatio;
              seg.setFillStyle(0xe63946);
            });
            this.bossStageBadges.setText(`Ф${boss.phase}/4`);
          } else {
            const bHpRatio = Phaser.Math.Clamp(1 - (boss.stun / boss.maxStun), 0, 1);
            this.bossBarFill.width = 350 * bHpRatio;
            this.bossBarFill.setFillStyle(0xe63946);
            this.bossStageBadges.setText(boss.stage === 1 ? '●●' : '●○');
          }
        }
      }
    }