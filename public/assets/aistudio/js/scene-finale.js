    /**
     * ============================================================================
     * 11E. ACT 4 & GAME GRAND FINALE SCENE: ZMIY SALYONOHORYCH & BORSCH FEAST
     * States:
     *   1. OFFENDED      — Sunset arena, Salyonohorych turned to cliff, Omelko invites him for borsch
     *   2. TROPHY        — Item modal: «Мішок найстарішої солі краю від Змія Соляногорича»
     *   3. FLIGHT        — 27s flight right-to-left across all Acts (Coast -> Steppe -> Dnipro -> Forest -> Village)
     *                      with waving characters below & optional aerial coin collection (▲ / ▼)
     *   4. ARRIVAL       — Evening at Omelko's Khata, Marichka & kids run out with a ladle
     *   5. FEAST         — Long table in the orchard under lanterns & stars with all guests from the journey,
     *                      salted borsch, Zmiy's happy tear, sneeze & spilled salt shaker, warm laughter
     *   6. CREDITS       — Scrolling credits, guests list, stats, Hardcore badge, Author & replay buttons
     *   7. POST_CREDITS  — Short comedy stinger («Омельку… а сметана де?» / «…» / «Кінець… чи ні?»)
     * ============================================================================
     */
    class ZmiyFinaleScene extends Phaser.Scene {
      constructor() {
        super('ZmiyFinaleScene');
      }

      init(data) {
        this.finalCoins = (data && data.coins !== undefined) ? data.coins : (GAME_STATE.savedCoins || 0);
        this.finalStunned = (data && data.enemiesStunned !== undefined) ? data.enemiesStunned : 0;
      }

      create() {
        this.cameras.main.fadeIn(450, 18, 10, 28);
        this.stage = 'WALK_IN';
        this.lineIndex = 0;
        this.modalReadyTime = 0;
        this.feastSubStage = 'BEFORE'; // BEFORE -> SNEEZE -> AFTER -> LAUGH
        this.flightElapsedMs = 0;
        this.flightTargetY = 165;
        this.touchFlightDirY = 0;

        // Root containers for each visual setting so transitions are clean
        this.sceneLayer = this.add.container(0, 0).setDepth(10);
        this.flightLayer = this.add.container(0, 0).setDepth(20).setVisible(false);
        this.creditsLayer = this.add.container(0, 0).setDepth(160).setVisible(false);
        this.postCreditsLayer = this.add.container(0, 0).setDepth(180).setVisible(false);

        // Top Header & Skip Hints
        this.headerText = this.add.text(20, 14, STRINGS.FINALE_HEADER_1, {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#ffd166',
          stroke: '#14161f',
          strokeThickness: 4
        }).setDepth(200);

        this.skipHint = this.add.text(CONFIG.WIDTH - 140, 16, STRINGS.FINALE_SKIP_HINT, {
          fontSize: '13px',
          color: '#f5ebe0',
          stroke: '#14161f',
          strokeThickness: 3
        }).setOrigin(1, 0).setDepth(200);

        // Top-right Mute & Fullscreen utility buttons (respecting SFX.muted)
        this.createTopButtons();

        // Shared Speech Bubble Container (used across OFFENDED, ARRIVAL, FEAST, POST_CREDITS)
        this.bubbleContainer = this.add.container(480, 195).setDepth(120).setVisible(false);
        this.bubbleBg = this.add.graphics();
        this.speakerText = this.add.text(-305, -54, '', {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#c1121f'
        });
        this.dialogueText = this.add.text(-305, -26, '', {
          fontSize: '18px',
          color: '#1d1e2c',
          wordWrap: { width: 610 },
          lineSpacing: 5
        });
        this.bubbleContainer.add([this.bubbleBg, this.speakerText, this.dialogueText]);

        // Trophy Modal (State 2)
        this.createTrophyModal();

        // Keyboard Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.input.keyboard.on('keydown-ENTER', () => this.onAdvance());
        this.input.keyboard.on('keydown-SPACE', () => this.onAdvance());
        this.input.keyboard.on('keydown-D', () => {
          if (this.stage !== 'FLIGHT') this.onAdvance();
        });
        this.input.keyboard.on('keydown-TAB', (event) => {
          if (event && event.preventDefault) event.preventDefault();
          this.skipToCredits();
        });
        this.input.keyboard.on('keydown-M', () => {
          const muted = SFX.toggleMute();
          if (this.muteBtnTxt) {
            this.muteBtnTxt.setText(muted ? STRINGS.HUD_SOUND_OFF : STRINGS.HUD_SOUND_ON);
          }
        });

        // Pointer / Touch handler for advancing dialogue & steering flight on touchscreens
        this.input.on('pointerdown', (pointer) => {
          if (pointer.y < 48 && pointer.x > CONFIG.WIDTH - 140) return;
          if (this.stage === 'FLIGHT') {
            if (Math.abs(pointer.x - (CONFIG.WIDTH - 115)) <= 100 && Math.abs(pointer.y - 58) <= 20) {
              this.startState4Arrival();
              return;
            }
            if (pointer.x < CONFIG.WIDTH * 0.65) {
              this.touchFlightDirY = pointer.y < CONFIG.HEIGHT * 0.5 ? -1 : 1;
            }
            return;
          }
          if (this.stage === 'CREDITS') {
            const btnY = CONFIG.HEIGHT - 44;
            if (Math.abs(pointer.y - btnY) <= 24) {
              if (Math.abs(pointer.x - 200) <= 156) {
                this.restartWholeGame();
              } else if (Math.abs(pointer.x - 515) <= 132) {
                this.replayFinalBoss();
              } else if (Math.abs(pointer.x - 805) <= 126) {
                this.startState7PostCredits();
              }
            }
            return;
          }
          if (this.stage === 'POST_CREDITS_END') {
            const cx = CONFIG.WIDTH / 2;
            const cy = CONFIG.HEIGHT / 2;
            if (Math.abs(pointer.y - (cy + 85)) <= 25) {
              if (Math.abs(pointer.x - (cx - 175)) <= 162) {
                this.restartWholeGame();
              } else if (Math.abs(pointer.x - (cx + 175)) <= 147) {
                this.replayFinalBoss();
              }
            }
            return;
          }
          this.onAdvance();
        });
        this.input.on('pointermove', (pointer) => {
          if (this.stage === 'FLIGHT' && pointer.isDown && pointer.x < CONFIG.WIDTH * 0.7) {
            this.flightTargetY = Phaser.Math.Clamp(
              pointer.y,
              CONFIG.FINALE.FLIGHT_MIN_Y,
              CONFIG.FINALE.FLIGHT_MAX_Y
            );
          }
        });
        this.input.on('pointerup', () => {
          this.touchFlightDirY = 0;
        });

        // Build State 1: OFFENDED on the Salt Mountain Arena at Sunset
        this.startState1Offended();
      }

      createTopButtons() {
        const makeTopBtn = (rightX, y, w, label, onClick) => {
          const cx = rightX - w / 2;
          const cy = y + 13;
          const bg = this.add.rectangle(cx, cy, w, 26, 0x2b2d42, 0.92)
            .setStrokeStyle(1.5, 0x8d99ae)
            .setDepth(210)
            .setInteractive({ useHandCursor: true });
          const txt = this.add.text(cx, cy, label, {
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff'
          }).setOrigin(0.5).setDepth(211);
          bg.on('pointerdown', (p, lx, ly, ev) => {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            onClick();
          });
          return { bg, txt };
        };

        makeTopBtn(CONFIG.WIDTH - 14, 12, 32, '⛶', () => {
          if (typeof toggleAppFullscreen === 'function') toggleAppFullscreen();
        });

        const muteObj = makeTopBtn(
          CONFIG.WIDTH - 52,
          12,
          82,
          SFX.muted ? STRINGS.HUD_SOUND_OFF : STRINGS.HUD_SOUND_ON,
          () => {
            const muted = SFX.toggleMute();
            muteObj.txt.setText(muted ? STRINGS.HUD_SOUND_OFF : STRINGS.HUD_SOUND_ON);
          }
        );
        this.muteBtnTxt = muteObj.txt;
      }

      // ======================================================================
      // STATE 1: ОБРАЗА (SALT MOUNTAIN ARENA AT SUNSET, ZMIY TURNED TO CLIFF)
      // ======================================================================
      startState1Offended() {
        this.sceneLayer.removeAll(true);
        SFX.playMusic('mus_boss_zmiy', { volume: 0.28 });
        const bg = this.add.graphics();

        // Warm golden-crimson sunset over the pink salt lake
        bg.fillGradientStyle(0x240046, 0x5a189a, 0xe76f51, 0xf4a261, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, 410);

        // Glowing setting sun on the horizon
        bg.fillStyle(0xffd166, 0.28);
        bg.fillCircle(310, 265, 86);
        bg.fillStyle(0xffea00, 0.88);
        bg.fillCircle(310, 265, 48);

        // Salt Mountain Cliff on the right (where Zmiy has turned his back)
        bg.fillStyle(0xe2eafc, 0.96);
        bg.fillTriangle(520, 410, 830, 52, 960, 410);
        bg.fillStyle(0xffffff, 0.98);
        bg.fillTriangle(620, 410, 830, 52, 940, 410);
        bg.fillStyle(0xffcad4, 0.82);
        bg.fillTriangle(470, 410, 650, 155, 790, 410);

        // Crystalline salt shore on left/center & pink brine lake on right
        bg.fillStyle(0x2b192e, 1);
        bg.fillRect(0, 405, CONFIG.WIDTH, 135);
        bg.fillStyle(0xffe5ec, 0.96);
        bg.fillRect(0, 405, 580, 16);
        bg.fillStyle(0xc9184a, 0.92);
        bg.fillRect(580, 405, 380, 55);
        bg.fillStyle(0xff758f, 0.92);
        bg.fillRect(580, 405, 380, 16);

        // Sacks of salt near the cliff
        [490, 535].forEach(bx => {
          bg.fillStyle(0xd4a373, 1);
          bg.fillRoundedRect(bx - 16, 378, 32, 28, 7);
          bg.fillStyle(0xffffff, 1);
          bg.fillEllipse(bx, 379, 22, 9);
          bg.fillStyle(0xc1121f, 1);
          bg.fillRect(bx - 12, 385, 24, 3);
        });

        // Composite Salyonohorych Body turned away toward the right cliff, heads drooping down
        this.zmiyGroup = this.add.container(720, 315);
        const bodyG = this.add.graphics();
        // Large grandfatherly white-pink scaled back & folded wing
        bodyG.fillStyle(0xf8f9fa, 1);
        bodyG.fillEllipse(0, 20, 230, 165);
        bodyG.fillStyle(0xffcad4, 0.85);
        bodyG.fillEllipse(-15, 25, 175, 125);
        // Spine salt crystals
        bodyG.fillStyle(0xffafcc, 0.95);
        bodyG.fillTriangle(-70, -45, -52, -82, -34, -42);
        bodyG.fillTriangle(-25, -55, -6, -96, 14, -52);
        bodyG.fillTriangle(22, -48, 40, -84, 56, -42);
        // Three drooping necks facing right (turned away toward the rock)
        bodyG.lineStyle(22, 0xf1faee, 1);
        bodyG.lineBetween(-30, -20, 45, 25);
        bodyG.lineBetween(0, -28, 78, 12);
        bodyG.lineBetween(25, -18, 105, 30);

        // Three heads using BootScene textures ('zmiy_head_hungry', 'zmiy_head_sleepy', 'zmiy_head_proud')
        // Initially flipped to face right (turned away in offended silence) and drooping low
        this.headHungry = this.add.image(52, 34, 'zmiy_head_hungry').setScale(0.92).setFlipX(true).setAngle(18);
        this.headSleepy = this.add.image(86, 16, 'zmiy_head_sleepy').setScale(0.92).setFlipX(true).setAngle(15);
        this.headProud = this.add.image(114, 38, 'zmiy_head_proud').setScale(0.92).setFlipX(true).setAngle(20);

        this.zmiyGroup.add([bodyG, this.headHungry, this.headSleepy, this.headProud]);

        this.tweens.add({
          targets: this.zmiyGroup,
          y: 319,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Omelko walks in from the left toward Salyonohorych
        this.omelko = this.add.image(95, 376, 'cossack').setScale(1.32);
        this.sceneLayer.add([bg, this.zmiyGroup, this.omelko]);

        this.tweens.add({
          targets: this.omelko,
          x: 345,
          duration: CONFIG.FINALE.WALK_IN_DURATION_MS,
          ease: 'Quad.easeOut',
          onUpdate: () => {
            this.omelko.y = 376 - Math.abs(Math.sin(this.time.now * 0.018)) * 6;
          },
          onComplete: () => {
            this.omelko.y = 376;
            if (this.stage === 'WALK_IN') {
              this.stage = 'OFFENDED';
              this.showOffendedLine(0);
            }
          }
        });
      }

      showOffendedLine(index) {
        const lines = STRINGS.FINALE_OFFENDED_LINES;
        if (index >= lines.length) {
          this.showTrophyModal();
          return;
        }

        this.lineIndex = index;
        const line = lines[index];
        SFX.speechBlip();

        // When Omelko invites Zmiy to borsch (index >= 2), Zmiy turns his heads back toward Omelko in surprise!
        if (index >= 2 && this.headHungry) {
          this.headHungry.setFlipX(false).setAngle(-6).setPosition(-72, -10);
          this.headSleepy.setFlipX(false).setAngle(-4).setPosition(-42, -32);
          this.headProud.setFlipX(false).setAngle(-2).setPosition(-10, -14);
        }

        const isZmiy = line.speaker.includes('Змій');
        this.renderSpeechBubble(
          isZmiy ? 535 : 375,
          195,
          line.speaker,
          line.text,
          isZmiy ? 0xc9184a : 0xc1121f,
          isZmiy ? 70 : -30
        );
      }

      renderSpeechBubble(x, y, speaker, text, borderColor, tailOffsetX = 0) {
        this.bubbleContainer.setVisible(true);
        this.bubbleContainer.setPosition(x, y);
        this.bubbleBg.clear();
        this.bubbleBg.fillStyle(0xfefae0, 0.98);
        this.bubbleBg.lineStyle(4, borderColor, 1);
        this.bubbleBg.fillRoundedRect(-325, -66, 650, 138, 16);
        this.bubbleBg.strokeRoundedRect(-325, -66, 650, 138, 16);
        this.bubbleBg.fillTriangle(tailOffsetX - 14, 72, tailOffsetX + 14, 72, tailOffsetX, 94);

        const hexStr = '#' + borderColor.toString(16).padStart(6, '0');
        this.speakerText.setText(speaker + ':').setColor(hexStr);
        this.dialogueText.setText('«' + text + '»');

        this.bubbleContainer.setScale(0.88);
        this.tweens.add({
          targets: this.bubbleContainer,
          scale: 1,
          duration: 170,
          ease: 'Back.easeOut'
        });
      }

      // ======================================================================
      // STATE 2: ТРОФЕЙ (ITEM MODAL IN THE STYLE OF ITEM_CATFISH_SCALE)
      // ======================================================================
      createTrophyModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.trophyModal = this.add.container(0, 0).setDepth(150).setVisible(false);

        const dim = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0b0716, 0.85);

        const card = this.add.graphics();
        card.fillStyle(0x1f112b, 0.98);
        card.fillRoundedRect(cx - 320, cy - 195, 640, 390, 18);
        card.lineStyle(4, 0xff758f, 1);
        card.strokeRoundedRect(cx - 320, cy - 195, 640, 390, 18);
        card.lineStyle(2, 0xffd166, 0.9);
        card.strokeRoundedRect(cx - 308, cy - 183, 616, 366, 14);

        const headerTxt = this.add.text(cx, cy - 156, STRINGS.ITEM_ACQUIRED_HEADER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          letterSpacing: 2
        }).setOrigin(0.5);

        const titleTxt = this.add.text(cx, cy - 106, STRINGS.ITEM_ZMIY_SALT_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '26px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
        }).setOrigin(0.5);

        const glow = this.add.circle(cx, cy + 2, 68, 0xff758f, 0.22)
          .setStrokeStyle(2.5, 0xffcad4, 0.75);
        this.tweens.add({
          targets: glow,
          scaleX: 1.08,
          scaleY: 1.08,
          alpha: 0.34,
          duration: 850,
          yoyo: true,
          repeat: -1
        });

        // Procedural illustration: Ornate Chumak Sack of Ancient Pink-White Salt Crystals
        const art = this.add.graphics();
        art.fillStyle(0xd4a373, 1);
        art.fillRoundedRect(cx - 34, cy - 22, 68, 62, 16);
        art.lineStyle(3, 0x6f4518, 1);
        art.strokeRoundedRect(cx - 34, cy - 22, 68, 62, 16);
        // Red Cossack ribbon tie
        art.fillStyle(0xc1121f, 1);
        art.fillRoundedRect(cx - 28, cy - 8, 56, 6, 3);
        // Sparkling salt crystal crown overflowing top of sack
        art.fillStyle(0xffffff, 1);
        art.fillEllipse(cx, cy - 20, 50, 18);
        art.fillTriangle(cx - 18, cy - 20, cx - 8, cy - 44, cx + 2, cy - 20);
        art.fillTriangle(cx - 4, cy - 20, cx + 6, cy - 48, cx + 18, cy - 20);
        art.fillStyle(0xffafcc, 0.95);
        art.fillTriangle(cx + 6, cy - 20, cx + 16, cy - 38, cx + 24, cy - 20);

        const badgeTxt = this.add.text(cx, cy + 84, STRINGS.ITEM_ZMIY_SALT_BADGE, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffd166',
          backgroundColor: '#3c096c',
          padding: { x: 14, y: 5 }
        }).setOrigin(0.5);

        const descTxt = this.add.text(cx, cy + 136, STRINGS.ITEM_ZMIY_SALT_DESC, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '20px',
          fontStyle: 'italic bold',
          color: '#f6e4b5',
          align: 'center',
          lineSpacing: 5
        }).setOrigin(0.5);

        this.trophyModal.add([dim, card, glow, headerTxt, titleTxt, art, badgeTxt, descTxt]);
      }

      showTrophyModal() {
        this.bubbleContainer.setVisible(false);
        this.stage = 'TROPHY';
        this.modalReadyTime = this.time.now + CONFIG.FINALE.MODAL_READY_DELAY_MS;
        this.trophyModal.setVisible(true).setScale(0.9);
        SFX.itemFanfare();

        this.tweens.add({
          targets: this.trophyModal,
          scale: 1,
          duration: 210,
          ease: 'Back.easeOut'
        });
      }

      // ======================================================================
      // STATE 3: ПОЛІТ (27s FLIGHT RIGHT-TO-LEFT ACROSS ALL ACTS IN REVERSE)
      // ======================================================================
      startState3Flight() {
        this.trophyModal.setVisible(false);
        this.sceneLayer.setVisible(false);
        this.flightLayer.setVisible(true);
        this.flightLayer.removeAll(true);
        SFX.playMusic('mus_title', { volume: 0.44 });

        this.stage = 'FLIGHT';
        this.flightElapsedMs = 0;
        this.flightTargetY = 165;
        this.headerText.setText(STRINGS.FINALE_HEADER_3);
        this.skipHint.setText(STRINGS.FINALE_FLIGHT_HINT);

        // Dynamic sky & scrolling landscape graphics
        this.flightSkyG = this.add.graphics();
        this.flightStarsG = this.add.graphics().setAlpha(0);
        for (let i = 0; i < 42; i++) {
          this.flightStarsG.fillStyle(i % 4 === 0 ? 0xffea00 : 0xffffff, 0.85);
          this.flightStarsG.fillCircle((i * 149) % CONFIG.WIDTH, 18 + ((i * 83) % 210), i % 3 === 0 ? 2 : 1.3);
        }
        this.flightBgG = this.add.graphics();

        // Zone Banner & Live Coin Counter HUD during flight
        this.flightZoneText = this.add.text(CONFIG.WIDTH / 2, 54, STRINGS.FLIGHT_ZONE_COAST, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#ffd166',
          stroke: '#14161f',
          strokeThickness: 4
        }).setOrigin(0.5);

        this.flightCoinHud = this.add.text(24, 48, `🪙 Червінці: ${this.finalCoins}`, {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#ffd166',
          backgroundColor: '#14161fcc',
          padding: { x: 10, y: 4 }
        });

        // Skip Flight button for touchscreen convenience
        const skipFlightBtn = this.add.rectangle(CONFIG.WIDTH - 115, 58, 195, 30, 0x3c096c, 0.92)
          .setStrokeStyle(1.5, 0xffd166)
          .setInteractive({ useHandCursor: true });
        const skipFlightLbl = this.add.text(CONFIG.WIDTH - 115, 58, 'Пропустити політ ⏭', {
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5);
        skipFlightBtn.on('pointerdown', (p, lx, ly, ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          this.startState4Arrival();
        });

        // Waving NPCs container scrolling below across zones:
        // Zone 3 (Dnipro: 0.40..0.60), Zone 4 (Forest: 0.60..0.80), Zone 5 (Village: 0.80..1.00)
        this.wavingContainer = this.add.container(0, 0);
        this.createWavingCameos();

        // Collectible aerial coins
        this.flightCoins = [];
        for (let i = 0; i < CONFIG.FINALE.FLIGHT_COIN_COUNT; i++) {
          const c = this.add.image(-120 - i * 240, 105 + ((i * 67) % 165), 'loot_coin').setScale(1.25);
          c.collected = false;
          this.flightCoins.push(c);
          this.flightLayer.add(c);
        }

        // Flying Salyonohorych with Omelko on his back (flying RIGHT-TO-LEFT, facing left!)
        this.flyingZmiy = this.add.container(CONFIG.FINALE.FLIGHT_ZMIY_X, this.flightTargetY);
        const zBody = this.add.graphics();
        // Scaled body & tail trailing to the right
        zBody.fillStyle(0xf8f9fa, 1);
        zBody.fillEllipse(10, 12, 148, 66);
        zBody.fillStyle(0xffcad4, 0.88);
        zBody.fillEllipse(14, 14, 118, 46);
        zBody.lineStyle(14, 0xf1faee, 1);
        zBody.lineBetween(72, 14, 145, 4);
        // Salt sack strapped behind Omelko
        zBody.fillStyle(0xd4a373, 1);
        zBody.fillRoundedRect(24, -28, 30, 26, 7);
        zBody.fillStyle(0xffffff, 1);
        zBody.fillEllipse(39, -28, 22, 8);
        // Three necks extending left
        zBody.lineStyle(14, 0xf1faee, 1);
        zBody.lineBetween(-45, 4, -95, -18);
        zBody.lineBetween(-48, 12, -108, 6);
        zBody.lineBetween(-42, 20, -92, 28);

        // Wing graphic (animated flap in update)
        this.flyingWingG = this.add.graphics();

        const fHead1 = this.add.image(-102, -20, 'zmiy_head_hungry').setScale(0.62);
        const fHead2 = this.add.image(-116, 6, 'zmiy_head_sleepy').setScale(0.62);
        const fHead3 = this.add.image(-100, 30, 'zmiy_head_proud').setScale(0.62);
        const fOmelko = this.add.image(-6, -24, 'cossack').setScale(1.05).setFlipX(true);

        this.flyingZmiy.add([zBody, this.flyingWingG, fHead1, fHead2, fHead3, fOmelko]);

        this.flightLayer.add([
          this.flightSkyG,
          this.flightStarsG,
          this.flightBgG,
          this.wavingContainer,
          this.flyingZmiy,
          this.flightZoneText,
          this.flightCoinHud,
          skipFlightBtn,
          skipFlightLbl
        ]);
        // Bring coins above background
        this.flightCoins.forEach(c => this.flightLayer.bringToTop(c));
        this.flightLayer.bringToTop(this.flyingZmiy);

        if (SFX.windWhistle) SFX.windWhistle();
      }

      createWavingCameos() {
        // 1. Dnipro Cameo (appears around progress 0.42..0.58): Giant Catfish & Rusalka waving!
        this.cameoDnipro = this.add.container(-250, 425);
        const catfish = this.add.image(0, 12, 'giant_catfish').setScale(1.05);
        const rusalka = this.add.image(-95, -6, 'enemy_rusalka').setScale(1.1);
        const dniproLbl = this.add.text(-35, -56, STRINGS.FLIGHT_WAVE_DNIPRO, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#90e0ef',
          backgroundColor: '#031d38dd',
          padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        this.cameoDnipro.add([catfish, rusalka, dniproLbl]);

        // 2. Evil Forest Cameo (appears around progress 0.62..0.78): Baba Yaga & Lisovyk waving!
        this.cameoForest = this.add.container(-250, 412);
        const yaga = this.add.image(0, 0, 'npc_baba_yaga').setScale(1.2);
        const lisovyk = this.add.image(-75, -8, 'boss_lisovyk').setScale(0.82);
        const forestLbl = this.add.text(-30, -64, STRINGS.FLIGHT_WAVE_FOREST, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#80ed99',
          backgroundColor: '#162229dd',
          padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        this.cameoForest.add([lisovyk, yaga, forestLbl]);

        // 3. Village Outskirts Cameo (appears around progress 0.82..0.98): Rooster Korniy & Geese waving!
        this.cameoVillage = this.add.container(-250, 415);
        const rooster = this.add.image(0, -6, 'boss_rooster').setScale(0.85);
        const goose1 = this.add.image(-65, 6, 'enemy_goose').setScale(1.0);
        const goose2 = this.add.image(58, 6, 'enemy_goose').setScale(1.0);
        const villageLbl = this.add.text(0, -64, STRINGS.FLIGHT_WAVE_VILLAGE, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffd166',
          backgroundColor: '#2b2d42dd',
          padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        this.cameoVillage.add([goose1, goose2, rooster, villageLbl]);

        this.wavingContainer.add([this.cameoDnipro, this.cameoForest, this.cameoVillage]);
      }

      updateFlight(time, delta) {
        this.flightElapsedMs += delta;
        const dur = CONFIG.FINALE.FLIGHT_DURATION_MS;
        const progress = Phaser.Math.Clamp(this.flightElapsedMs / dur, 0, 1);

        // Vertical steering with Up/Down arrows or W/S
        let vy = this.touchFlightDirY;
        if (this.cursors.up.isDown || this.keyW.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.keyS.isDown) vy = 1;

        if (vy !== 0) {
          this.flightTargetY = Phaser.Math.Clamp(
            this.flightTargetY + vy * CONFIG.FINALE.FLIGHT_MOVE_SPEED_Y * (delta / 1000),
            CONFIG.FINALE.FLIGHT_MIN_Y,
            CONFIG.FINALE.FLIGHT_MAX_Y
          );
        }
        this.flyingZmiy.y = this.flightTargetY + Math.sin(time * 0.005) * 8;

        // Animate Zmiy's wing flap smoothly
        if (this.flyingWingG) {
          this.flyingWingG.clear();
          const flapY = Math.sin(time * 0.012) * 34;
          this.flyingWingG.fillStyle(0xffafcc, 0.9);
          this.flyingWingG.fillTriangle(-15, 0, 35, -52 + flapY, 55, 4);
        }

        // Collect aerial coins
        this.flightCoins.forEach((c, idx) => {
          if (c.collected) return;
          const coinProgressX = ((this.flightElapsedMs * 0.22 + idx * 240) % 1350) - 150;
          c.x = coinProgressX;
          const dist = Phaser.Math.Distance.Between(c.x, c.y, this.flyingZmiy.x - 35, this.flyingZmiy.y);
          if (dist < CONFIG.FINALE.FLIGHT_COIN_PICKUP_RADIUS) {
            c.collected = true;
            c.setVisible(false);
            this.finalCoins += 1;
            GAME_STATE.savedCoins = this.finalCoins;
            this.flightCoinHud.setText(`🪙 Червінці: ${this.finalCoins}`);
            SFX.pickup();
          }
        });

        // Update Zone Banner & Cameo positions scrolling left-to-right below Zmiy
        if (progress < 0.2) {
          this.flightZoneText.setText(STRINGS.FLIGHT_ZONE_COAST);
        } else if (progress < 0.4) {
          this.flightZoneText.setText(STRINGS.FLIGHT_ZONE_STEPPE);
        } else if (progress < 0.6) {
          this.flightZoneText.setText(STRINGS.FLIGHT_ZONE_DNIPRO);
        } else if (progress < 0.8) {
          this.flightZoneText.setText(STRINGS.FLIGHT_ZONE_FOREST);
        } else {
          this.flightZoneText.setText(STRINGS.FLIGHT_ZONE_VILLAGE);
        }

        // Scroll Waving Cameos smoothly from left (-150) to right (1100) during their zone window
        const updateCameoPos = (container, startP, endP) => {
          if (progress >= startP && progress <= endP) {
            const localT = (progress - startP) / (endP - startP);
            container.setVisible(true);
            container.x = -120 + localT * (CONFIG.WIDTH + 240);
          } else {
            container.setVisible(false);
          }
        };
        updateCameoPos(this.cameoDnipro, 0.40, 0.60);
        updateCameoPos(this.cameoForest, 0.60, 0.80);
        updateCameoPos(this.cameoVillage, 0.80, 0.99);

        // Redraw scrolling parallax background & evening sky transition
        this.drawFlightBackdrop(progress, time);

        if (progress >= 1) {
          this.startState4Arrival();
        }
      }

      drawFlightBackdrop(progress, time) {
        this.flightSkyG.clear();
        // Smooth transition from golden sunset (progress 0) to starry evening indigo (progress 1)
        const topColor = progress < 0.5 ? 0x240046 : 0x0b0914;
        const botColor = progress < 0.35 ? 0xe76f51 : (progress < 0.7 ? 0x3c096c : 0x1d3557);
        this.flightSkyG.fillGradientStyle(topColor, topColor, botColor, botColor, 1);
        this.flightSkyG.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        this.flightStarsG.setAlpha(Phaser.Math.Clamp(progress * 1.25, 0.15, 0.95));

        this.flightBgG.clear();
        const scrollX = this.flightElapsedMs * 0.24;

        // Ground / water plane at y = 430
        if (progress < 0.2) {
          // Zone 1: Pink Salt Lake & Black Sea Shore
          this.flightBgG.fillStyle(0xc9184a, 1);
          this.flightBgG.fillRect(0, 430, CONFIG.WIDTH, 110);
          for (let i = 0; i < 7; i++) {
            const sx = ((i * 170 + scrollX) % (CONFIG.WIDTH + 160)) - 80;
            this.flightBgG.fillStyle(0xffe5ec, 0.95);
            this.flightBgG.fillTriangle(sx, 430, sx + 14, 395, sx + 28, 430);
          }
        } else if (progress < 0.4) {
          // Zone 2: Steppe Kurhans & Feather-grass
          this.flightBgG.fillStyle(0x3a281c, 1);
          this.flightBgG.fillRect(0, 430, CONFIG.WIDTH, 110);
          for (let i = 0; i < 6; i++) {
            const kx = ((i * 220 + scrollX * 0.7) % (CONFIG.WIDTH + 220)) - 110;
            this.flightBgG.fillStyle(0x4a3b32, 0.95);
            this.flightBgG.fillEllipse(kx, 430, 190, 95);
          }
        } else if (progress < 0.6) {
          // Zone 3: Wide Dnipro River & Granite Cliffs
          this.flightBgG.fillStyle(0x003566, 1);
          this.flightBgG.fillRect(0, 430, CONFIG.WIDTH, 110);
          for (let i = 0; i < 6; i++) {
            const cx = ((i * 210 + scrollX * 0.65) % (CONFIG.WIDTH + 210)) - 105;
            this.flightBgG.fillStyle(0x16324f, 1);
            this.flightBgG.fillTriangle(cx - 60, 430, cx, 310, cx + 60, 430);
          }
        } else if (progress < 0.8) {
          // Zone 4: Evil Forest Dark Oaks
          this.flightBgG.fillStyle(0x162e26, 1);
          this.flightBgG.fillRect(0, 430, CONFIG.WIDTH, 110);
          for (let i = 0; i < 8; i++) {
            const tx = ((i * 150 + scrollX * 0.8) % (CONFIG.WIDTH + 150)) - 75;
            this.flightBgG.fillStyle(0x13191d, 1);
            this.flightBgG.fillRect(tx - 10, 330, 20, 100);
            this.flightBgG.fillStyle(0x112622, 0.96);
            this.flightBgG.fillCircle(tx, 320, 42);
          }
        } else {
          // Zone 5: Evening Village Huts with warm glowing windows!
          this.flightBgG.fillStyle(0x283618, 1);
          this.flightBgG.fillRect(0, 430, CONFIG.WIDTH, 110);
          for (let i = 0; i < 5; i++) {
            const hx = ((i * 240 + scrollX * 0.75) % (CONFIG.WIDTH + 240)) - 120;
            // Whitewashed khata wall
            this.flightBgG.fillStyle(0xf1faee, 0.95);
            this.flightBgG.fillRect(hx - 36, 372, 72, 58);
            // Thatched roof
            this.flightBgG.fillStyle(0x7f4f24, 1);
            this.flightBgG.fillTriangle(hx - 46, 372, hx + 46, 372, hx, 338);
            // Glowing warm evening windows
            this.flightBgG.fillStyle(0xffea00, 0.95);
            this.flightBgG.fillRect(hx - 20, 388, 14, 14);
            this.flightBgG.fillRect(hx + 6, 388, 14, 14);
          }
        }
        void time;
      }

      // ======================================================================
      // STATE 4: ПРИБУТТЯ (EVENING AT OMELKO'S KHATA, MARICHKA & KIDS WITH LADLE)
      // ======================================================================
      startState4Arrival() {
        this.flightLayer.setVisible(false);
        this.sceneLayer.setVisible(true);
        this.sceneLayer.removeAll(true);
        this.bubbleContainer.setVisible(false);
        SFX.playMusic('mus_hut', { volume: 0.40 });

        this.stage = 'ARRIVAL';
        this.lineIndex = 0;
        this.headerText.setText(STRINGS.FINALE_HEADER_4);
        this.skipHint.setText(STRINGS.FINALE_SKIP_HINT);

        const bg = this.add.graphics();
        // Starry evening sky over Omelko's homestead
        bg.fillGradientStyle(0x0b0914, 0x141829, 0x1d3557, 0x2b2d42, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, 415);
        for (let i = 0; i < 36; i++) {
          bg.fillStyle(i % 4 === 0 ? 0xffea00 : 0xffffff, 0.85);
          bg.fillCircle((i * 157) % CONFIG.WIDTH, 18 + ((i * 71) % 190), 1.6);
        }

        // Green homestead yard
        bg.fillStyle(0x283618, 1);
        bg.fillRect(0, 405, CONFIG.WIDTH, 135);

        // Omelko's Whitewashed Khata on the left with warm glowing windows
        bg.fillStyle(0xf5ebe0, 1);
        bg.fillRoundedRect(45, 235, 250, 175, 6);
        bg.fillStyle(0x6f4518, 1);
        bg.fillTriangle(25, 240, 315, 240, 170, 148);
        // Warm lit windows
        bg.fillStyle(0xffea00, 0.95);
        bg.fillRect(82, 285, 46, 44);
        bg.fillRect(152, 285, 46, 44);
        bg.lineStyle(3, 0x583101, 1);
        bg.strokeRect(82, 285, 46, 44);
        bg.strokeRect(152, 285, 46, 44);
        // Open wooden door
        bg.fillStyle(0x583101, 1);
        bg.fillRoundedRect(222, 292, 48, 118, 4);

        // Marichka with a wooden ladle (із черпаком) and kids running out of the hut!
        this.marichka = this.add.image(285, 380, 'npc_wife').setScale(1.3);
        const ladleG = this.add.graphics();
        ladleG.lineStyle(4, 0x7f4f24, 1);
        ladleG.lineBetween(298, 378, 320, 355);
        ladleG.fillStyle(0xd4a373, 1);
        ladleG.fillCircle(322, 353, 7);

        const kid1 = this.add.image(235, 392, 'npc_kid').setScale(1.18);
        const kid2 = this.add.image(330, 392, 'npc_kid').setScale(1.15);

        // Salyonohorych landed in the yard on the right with Omelko beside him
        const zmiyLanded = this.add.container(730, 325);
        const zG = this.add.graphics();
        zG.fillStyle(0xf8f9fa, 1);
        zG.fillEllipse(0, 22, 220, 145);
        zG.fillStyle(0xffcad4, 0.85);
        zG.fillEllipse(-10, 24, 165, 105);
        zG.lineStyle(18, 0xf1faee, 1);
        zG.lineBetween(-45, 0, -110, -18);
        zG.lineBetween(-30, -10, -88, -44);
        zG.lineBetween(-15, 0, -64, -12);
        const h1 = this.add.image(-118, -20, 'zmiy_head_hungry').setScale(0.84);
        const h2 = this.add.image(-95, -48, 'zmiy_head_sleepy').setScale(0.84);
        const h3 = this.add.image(-70, -14, 'zmiy_head_proud').setScale(0.84);
        zmiyLanded.add([zG, h1, h2, h3]);

        this.omelko = this.add.image(475, 378, 'cossack').setScale(1.3).setFlipX(true);

        this.sceneLayer.add([bg, this.marichka, ladleG, kid1, kid2, zmiyLanded, this.omelko]);
        this.showArrivalLine(0);
      }

      showArrivalLine(index) {
        const lines = STRINGS.FINALE_ARRIVAL_LINES;
        if (index >= lines.length) {
          this.startState5Feast();
          return;
        }
        this.lineIndex = index;
        const line = lines[index];
        SFX.speechBlip();

        const isMarichka = line.speaker.includes('Марічка');
        this.renderSpeechBubble(
          isMarichka ? 360 : 480,
          190,
          line.speaker,
          line.text,
          isMarichka ? 0xe09f3e : 0xc1121f,
          isMarichka ? -55 : 0
        );
      }

      // ======================================================================
      // STATE 5: ОБІД У ДВОРІ (LONG TABLE UNDER LANTERNS & STARS WITH ALL GUESTS)
      // ======================================================================
      startState5Feast() {
        this.sceneLayer.removeAll(true);
        this.bubbleContainer.setVisible(false);
        SFX.playMusic('mus_hut', { volume: 0.42 });

        this.stage = 'FEAST';
        this.feastSubStage = 'BEFORE';
        this.lineIndex = 0;
        this.headerText.setText(STRINGS.FINALE_HEADER_5);

        const bg = this.add.graphics();
        // Deep starry night sky over the orchard
        bg.fillGradientStyle(0x070812, 0x11162b, 0x1b263b, 0x283618, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, 415);
        for (let i = 0; i < 45; i++) {
          bg.fillStyle(i % 3 === 0 ? 0xffea00 : 0xffffff, 0.88);
          bg.fillCircle((i * 139) % CONFIG.WIDTH, 16 + ((i * 61) % 165), i % 4 === 0 ? 2 : 1.4);
        }

        // Orchard trees & string of warm glowing lanterns overhead
        bg.lineStyle(2.5, 0x583101, 0.9);
        bg.lineBetween(60, 125, 900, 125);
        for (let lx = 110; lx <= 850; lx += 120) {
          bg.fillStyle(0xffd166, 0.24);
          bg.fillCircle(lx, 134, 24);
          bg.fillStyle(0xffbe0b, 0.95);
          bg.fillRoundedRect(lx - 7, 125, 14, 18, 4);
        }

        // Orchard grass & wooden wattle fence (тинок) in back
        bg.fillStyle(0x1f3518, 1);
        bg.fillRect(0, 395, CONFIG.WIDTH, 145);
        bg.fillStyle(0x6f4518, 0.9);
        bg.fillRect(40, 330, 880, 8);
        bg.fillRect(40, 352, 880, 8);
        for (let fx = 60; fx <= 900; fx += 55) {
          bg.fillRect(fx, 312, 7, 62);
        }

        // Salyonohorych's 3 heads peeking warmly over the back fence on the right!
        const zmiyFenceGroup = this.add.container(770, 285);
        const neckG = this.add.graphics();
        neckG.lineStyle(18, 0xf1faee, 1);
        neckG.lineBetween(-55, 50, -65, 0);
        neckG.lineBetween(0, 50, 0, -15);
        neckG.lineBetween(55, 50, 65, 4);
        this.feastHead1 = this.add.image(-68, -6, 'zmiy_head_hungry').setScale(0.78);
        this.feastHead2 = this.add.image(0, -22, 'zmiy_head_sleepy').setScale(0.82);
        this.feastHead3 = this.add.image(68, 0, 'zmiy_head_proud').setScale(0.78);
        // Glistening happy tear on Zmiy's middle head (shown on line 2)
        this.zmiyHappyTear = this.add.circle(-12, -16, 4.5, 0x48cae4, 0.95).setVisible(false);
        zmiyFenceGroup.add([neckG, this.feastHead1, this.feastHead2, this.feastHead3, this.zmiyHappyTear]);

        // All Guests from the Journey seated around the Long Orchard Table!
        this.feastGuests = [
          // Left to right along the long table:
          this.add.image(95, 376, 'npc_hrytsko').setScale(1.18),
          this.add.image(162, 368, 'boss_rooster').setScale(0.76),
          this.add.image(235, 362, 'boss_lisovyk').setScale(0.76),
          this.add.image(308, 372, 'npc_baba_yaga').setScale(1.12),
          this.add.image(382, 374, 'cossack').setScale(1.22),
          this.add.image(448, 376, 'npc_wife').setScale(1.22),
          this.add.image(502, 388, 'npc_kid').setScale(1.08),
          this.add.image(556, 364, 'boss_vodyanyk_tsar').setScale(0.76),
          this.add.image(628, 376, 'enemy_rusalka').setScale(1.08)
        ];

        // Giant Catfish Vusan sitting happily in a water barrel ('prop_barrel' + 'giant_catfish')!
        const catfishBarrel = this.add.image(700, 392, 'prop_barrel').setScale(1.35);
        const catfishGuest = this.add.image(700, 356, 'giant_catfish').setScale(0.62).setAngle(-25);
        this.feastGuests.push(catfishBarrel, catfishGuest);

        // Long Festive Table with white embroidered rushnyk tablecloth & steaming bowls of salted red borsch
        const tableG = this.add.graphics();
        tableG.fillStyle(0x583101, 1);
        tableG.fillRect(65, 396, 680, 18);
        tableG.fillRect(110, 414, 18, 48);
        tableG.fillRect(405, 414, 18, 48);
        tableG.fillRect(695, 414, 18, 48);
        // Embroidered white tablecloth
        tableG.fillStyle(0xfefae0, 1);
        tableG.fillRect(65, 394, 680, 8);
        tableG.fillStyle(0xc1121f, 1);
        tableG.fillRect(65, 400, 680, 3);

        // Steaming clay bowls of red borsch along the table
        for (let bx = 115; bx <= 675; bx += 80) {
          tableG.fillStyle(0x9e2a2b, 1);
          tableG.fillEllipse(bx, 388, 34, 14);
          tableG.fillStyle(0xe63946, 1);
          tableG.fillEllipse(bx, 384, 28, 8);
        }

        // Wooden Salt Cellar (Солонка) in the middle of the table (tips over when Zmiy sneezes!)
        this.saltCellar = this.add.container(485, 384);
        const scG = this.add.graphics();
        scG.fillStyle(0xd4a373, 1);
        scG.fillRoundedRect(-10, -12, 20, 16, 4);
        scG.fillStyle(0xffffff, 1);
        scG.fillEllipse(0, -12, 16, 7);
        this.saltCellar.add(scG);

        this.sceneLayer.add([
          bg,
          zmiyFenceGroup,
          ...this.feastGuests,
          tableG,
          this.saltCellar
        ]);

        this.showFeastStep();
      }

      showFeastStep() {
        if (this.feastSubStage === 'BEFORE') {
          const lines = STRINGS.FINALE_FEAST_LINES_BEFORE;
          if (this.lineIndex < lines.length) {
            const line = lines[this.lineIndex];
            SFX.speechBlip();
            const isZmiy = line.speaker.includes('Змій');
            if (isZmiy && this.zmiyHappyTear) {
              this.zmiyHappyTear.setVisible(true);
            }
            this.renderSpeechBubble(
              isZmiy ? 560 : 410,
              175,
              line.speaker,
              line.text,
              isZmiy ? 0xc9184a : 0xc1121f,
              isZmiy ? 90 : -20
            );
            return;
          }
          // Transition to SNEEZE moment!
          this.feastSubStage = 'SNEEZE';
          this.triggerFeastSneeze();
          return;
        }

        if (this.feastSubStage === 'SNEEZE') {
          this.feastSubStage = 'AFTER';
          this.lineIndex = 0;
          this.showFeastStep();
          return;
        }

        if (this.feastSubStage === 'AFTER') {
          const lines = STRINGS.FINALE_FEAST_LINES_AFTER;
          if (this.lineIndex < lines.length) {
            const line = lines[this.lineIndex];
            SFX.speechBlip();
            const isMarichka = line.speaker.includes('Марічка');
            this.renderSpeechBubble(
              430,
              175,
              line.speaker,
              line.text,
              isMarichka ? 0xe09f3e : 0xc1121f,
              isMarichka ? 15 : -35
            );
            return;
          }
          // Transition to warm collective laughter & bandura melody!
          this.feastSubStage = 'LAUGH';
          this.triggerFeastLaughter();
          return;
        }

        if (this.feastSubStage === 'LAUGH') {
          this.startState6Credits();
        }
      }

      triggerFeastSneeze() {
        if (SFX.zmiyRoar) SFX.zmiyRoar();
        this.cameras.main.shake(180, 0.008);

        // Tip over the salt cellar & spill a pinch of white salt on the table
        this.tweens.add({
          targets: this.saltCellar,
          angle: 85,
          x: 498,
          y: 390,
          duration: 220,
          ease: 'Back.easeOut'
        });

        this.renderSpeechBubble(
          520,
          175,
          'Змій Соляногорич',
          STRINGS.FINALE_SNEEZE_CAPTION,
          0xffbe0b,
          80
        );
      }

      triggerFeastLaughter() {
        SFX.banduraStart();
        this.renderSpeechBubble(
          480,
          175,
          'Усі гості разом',
          STRINGS.FINALE_LAUGH_CAPTION,
          0x2a9d8f,
          0
        );

        // Joyful rhythmic bounce of all guests at the table
        this.feastGuests.forEach((guest, idx) => {
          this.tweens.add({
            targets: guest,
            y: guest.y - 10,
            duration: 220 + (idx % 3) * 40,
            yoyo: true,
            repeat: 5,
            ease: 'Sine.easeInOut'
          });
        });
      }

      // ======================================================================
      // STATE 6: ТИТРИ (SCROLLING CREDITS, STATS, HARDCORE BADGE & REPLAY BUTTONS)
      // ======================================================================
      startState6Credits() {
        this.bubbleContainer.setVisible(false);
        this.trophyModal.setVisible(false);
        SFX.playMusic('mus_title', { volume: 0.42 });
        this.flightLayer.setVisible(false);
        this.sceneLayer.setVisible(false);
        this.creditsLayer.setVisible(true);
        this.creditsLayer.removeAll(true);

        this.stage = 'CREDITS';
        this.headerText.setText(STRINGS.FINALE_HEADER_6);
        this.skipHint.setVisible(false);
        SFX.banduraStart();

        const cx = CONFIG.WIDTH / 2;
        const bg = this.add.rectangle(cx, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0b0c14, 0.98);

        // Scrolling container
        this.creditsScrollContainer = this.add.container(cx, CONFIG.FINALE.CREDITS_START_Y);

        let curY = 0;
        const addCreditText = (txt, size, color, style = 'bold', spacing = 36) => {
          const t = this.add.text(0, curY, txt, {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: size + 'px',
            fontStyle: style,
            color: color,
            align: 'center'
          }).setOrigin(0.5, 0);
          this.creditsScrollContainer.add(t);
          curY += t.height + spacing;
        };

        addCreditText(STRINGS.TITLE, 44, '#ffd166', 'bold', 8);
        addCreditText(STRINGS.SUBTITLE, 22, '#f5ebe0', 'italic bold', 42);

        addCreditText(STRINGS.CREDITS_GUESTS_HEADER, 24, '#ff758f', 'bold', 18);
        STRINGS.CREDITS_GUESTS_LIST.forEach(guestLine => {
          addCreditText('• ' + guestLine, 20, '#ffffff', 'bold', 14);
        });
        curY += 26;

        addCreditText(STRINGS.CREDITS_STATS_HEADER, 24, '#48cae4', 'bold', 18);
        addCreditText(
          `Зібрано червінців: ${this.finalCoins}   |   Ошелешено ворогів: ${this.finalStunned}`,
          22,
          '#ffd166',
          'bold',
          18
        );
        if (GAME_STATE.isHardcore()) {
          addCreditText('🔥 ' + STRINGS.CREDITS_HARDCORE_BADGE, 22, '#ff6b6b', 'bold', 24);
        }
        curY += 20;

        addCreditText(STRINGS.TITLE_AUTHOR, 26, '#ffd166', 'bold', 18);
        addCreditText(STRINGS.CREDITS_THANKS, 22, '#80ed99', 'italic bold', 40);

        // Bottom Fixed Buttons Bar over Credits
        const footerBg = this.add.rectangle(cx, CONFIG.HEIGHT - 44, CONFIG.WIDTH, 76, 0x14161f, 0.96)
          .setStrokeStyle(2, 0xffd166);

        const makeCreditBtn = (bx, by, bw, label, color, onClick) => {
          const btnBg = this.add.rectangle(bx, by, bw, 42, color, 1)
            .setStrokeStyle(2, 0xffea00)
            .setInteractive({ useHandCursor: true });
          const btnLbl = this.add.text(bx, by, label, {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
          }).setOrigin(0.5);
          btnBg.on('pointerdown', (p, lx, ly, ev) => {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            onClick();
          });
          btnBg.on('pointerup', (p, lx, ly, ev) => {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            onClick();
          });
          return [btnBg, btnLbl];
        };

        const [b1Bg, b1Lbl] = makeCreditBtn(200, CONFIG.HEIGHT - 44, 310, STRINGS.PLAY_AGAIN, 0x2a9d8f, () => {
          this.restartWholeGame();
        });
        const [b2Bg, b2Lbl] = makeCreditBtn(515, CONFIG.HEIGHT - 44, 260, STRINGS.FINALE_REPLAY_BOSS_BTN, 0xc9184a, () => {
          this.replayFinalBoss();
        });
        const [b3Bg, b3Lbl] = makeCreditBtn(805, CONFIG.HEIGHT - 44, 250, STRINGS.FINALE_POST_CREDITS_BTN, 0x3c096c, () => {
          this.startState7PostCredits();
        });

        this.creditsLayer.add([
          bg,
          this.creditsScrollContainer,
          footerBg,
          b1Bg, b1Lbl,
          b2Bg, b2Lbl,
          b3Bg, b3Lbl
        ]);
      }

      // ======================================================================
      // STATE 7: ПІСЛЯ ТИТРІВ («Омельку… а сметана де?» -> «…» -> «Кінець… чи ні?»)
      // ======================================================================
      startState7PostCredits() {
        if (this.stage === 'POST_CREDITS' || this.stage === 'POST_CREDITS_END') return;
        this.creditsLayer.setVisible(false);
        this.postCreditsLayer.setVisible(true);
        this.postCreditsLayer.removeAll(true);

        this.stage = 'POST_CREDITS';
        this.lineIndex = 0;
        this.headerText.setText(STRINGS.FINALE_HEADER_7);
        this.skipHint.setVisible(true).setText('[Пробіл / Enter / Клік] — Далі');

        const cx = CONFIG.WIDTH / 2;
        const bg = this.add.rectangle(cx, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0e0f18, 1);
        const marichka = this.add.image(cx - 85, 365, 'npc_wife').setScale(1.45);
        const omelko = this.add.image(cx + 85, 365, 'cossack').setScale(1.45).setFlipX(true);

        this.postCreditsLayer.add([bg, marichka, omelko]);
        this.showPostCreditsLine(0);
      }

      showPostCreditsLine(index) {
        const lines = STRINGS.POST_CREDITS_LINES;
        if (index >= lines.length) {
          this.showPostCreditsEndingCard();
          return;
        }
        this.lineIndex = index;
        const line = lines[index];
        SFX.speechBlip();

        const isMarichka = line.speaker.includes('Марічка');
        this.renderSpeechBubble(
          CONFIG.WIDTH / 2,
          205,
          line.speaker,
          line.text,
          isMarichka ? 0xe09f3e : 0xc1121f,
          isMarichka ? -70 : 70
        );
      }

      showPostCreditsEndingCard() {
        this.stage = 'POST_CREDITS_END';
        this.bubbleContainer.setVisible(false);
        this.skipHint.setVisible(false);

        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;
        const blackout = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x050508, 0).setDepth(190);
        const endTitle = this.add.text(cx, cy - 35, STRINGS.POST_CREDITS_END_TEXT, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '54px',
          fontStyle: 'italic bold',
          color: '#ffd166'
        }).setOrigin(0.5).setAlpha(0).setDepth(191);

        const btn1Bg = this.add.rectangle(cx - 175, cy + 85, 320, 46, 0x2a9d8f, 1)
          .setStrokeStyle(2, 0xffea00)
          .setInteractive({ useHandCursor: true })
          .setDepth(191);
        const btn1Lbl = this.add.text(cx - 175, cy + 85, STRINGS.PLAY_AGAIN, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5).setDepth(192);
        btn1Bg.on('pointerdown', (p, lx, ly, ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          this.restartWholeGame();
        });
        btn1Bg.on('pointerup', (p, lx, ly, ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          this.restartWholeGame();
        });

        const btn2Bg = this.add.rectangle(cx + 175, cy + 85, 290, 46, 0xc9184a, 1)
          .setStrokeStyle(2, 0xf5ebe0)
          .setInteractive({ useHandCursor: true })
          .setDepth(191);
        const btn2Lbl = this.add.text(cx + 175, cy + 85, STRINGS.FINALE_REPLAY_BOSS_BTN, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5).setDepth(192);
        btn2Bg.on('pointerdown', (p, lx, ly, ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          this.replayFinalBoss();
        });
        btn2Bg.on('pointerup', (p, lx, ly, ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          this.replayFinalBoss();
        });

        this.postCreditsLayer.add([blackout, endTitle, btn1Bg, btn1Lbl, btn2Bg, btn2Lbl]);

        this.tweens.add({
          targets: [blackout, endTitle],
          alpha: 1,
          duration: CONFIG.FINALE.POST_CREDITS_FADE_MS,
          ease: 'Sine.easeInOut'
        });
      }

      // ======================================================================
      // UPDATE & NAVIGATION HANDLERS
      // ======================================================================
      update(time, delta) {
        if (this.stage === 'FLIGHT') {
          this.updateFlight(time, delta);
        } else if (this.stage === 'CREDITS' && this.creditsScrollContainer) {
          this.creditsScrollContainer.y -= CONFIG.FINALE.CREDITS_SCROLL_SPEED * (delta / 1000);
          if (this.creditsScrollContainer.y <= CONFIG.FINALE.CREDITS_END_Y) {
            this.startState7PostCredits();
          }
        }
      }

      onAdvance() {
        if (this.stage === 'WALK_IN') {
          this.omelko.x = 345;
          this.stage = 'OFFENDED';
          this.showOffendedLine(0);
        } else if (this.stage === 'OFFENDED') {
          this.showOffendedLine(this.lineIndex + 1);
        } else if (this.stage === 'TROPHY') {
          if (this.time.now < this.modalReadyTime) return;
          this.startState3Flight();
        } else if (this.stage === 'FLIGHT') {
          // Only flight can be skipped separately to ARRIVAL via Enter/Space
          this.startState4Arrival();
        } else if (this.stage === 'ARRIVAL') {
          this.showArrivalLine(this.lineIndex + 1);
        } else if (this.stage === 'FEAST') {
          if (this.feastSubStage === 'BEFORE' || this.feastSubStage === 'AFTER') {
            this.lineIndex += 1;
          }
          this.showFeastStep();
        } else if (this.stage === 'CREDITS') {
          this.restartWholeGame();
        } else if (this.stage === 'POST_CREDITS') {
          this.showPostCreditsLine(this.lineIndex + 1);
        } else if (this.stage === 'POST_CREDITS_END') {
          this.restartWholeGame();
        }
      }

      skipToCredits() {
        if (this.stage !== 'CREDITS' && this.stage !== 'POST_CREDITS' && this.stage !== 'POST_CREDITS_END') {
          this.startState6Credits();
        }
      }

      replayFinalBoss() {
        if (this.transitioningOut) return;
        this.transitioningOut = true;
        SFX.pickup();
        GAME_STATE.currentLevel = 4;
        GAME_STATE.hasSaber = true;
        GAME_STATE.hasSwampFrogs = true;
        GAME_STATE.savedCoins = this.finalCoins;
        this.scene.start('GameScene', {
          level: 4,
          coins: this.finalCoins,
          startAtBoss: true
        });
      }

      restartWholeGame() {
        if (this.transitioningOut) return;
        this.transitioningOut = true;
        SFX.pickup();
        GAME_STATE.currentLevel = 1;
        GAME_STATE.hasSaber = false;
        GAME_STATE.hasSwampFrogs = false;
        GAME_STATE.savedCoins = 0;
        this.scene.start('TitleScene');
      }
    }
