
    /**
     * ============================================================================
     * 6. SCENE 1: HUT CUTSCENE & INTERACTIVE EXIT TO LEVEL 1
     * ============================================================================
     */
    class HutScene extends Phaser.Scene {
      constructor() {
        super('HutScene');
      }

      create() {
        this.cutsceneActive = true;
        this.currentLineIndex = 0;
        this.itemPopupStep = -1; // -1 = dialogue, 0 = frying pan popup, 1 = galushkas popup
        this.popupInputReadyTime = 0;
        SFX.playMusic('mus_hut', { volume: 0.38 });

        // Draw cozy Ukrainian Khata (hut interior)
        const bg = this.add.graphics();
        // Warm clay walls
        bg.fillStyle(0xf5ebe0, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        // Lower wooden wainscot & floor
        bg.fillStyle(0xb08968, 1);
        bg.fillRect(0, 390, CONFIG.WIDTH, 90);
        bg.fillStyle(0x6f4518, 1);
        bg.fillRect(0, CONFIG.HUT_GROUND_Y, CONFIG.WIDTH, 60);
        // Ceiling wooden beams (сволок)
        bg.fillStyle(0x583101, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, 34);
        for (let x = 80; x < CONFIG.WIDTH; x += 180) {
          bg.fillRect(x, 34, 18, 16);
        }

        // Traditional Ukrainian Stove (Піч) on the left
        bg.fillStyle(0xffffff, 1);
        bg.fillRoundedRect(40, 190, 190, 290, 10);
        bg.fillStyle(0x2b2d42, 1);
        bg.fillRoundedRect(75, 360, 85, 70, 28);
        bg.fillStyle(0xff7b00, 0.85);
        bg.fillCircle(118, 405, 22);
        // Petrykivka floral ornament on stove
        bg.fillStyle(0xd62828, 1);
        bg.fillCircle(115, 260, 10);
        bg.fillCircle(145, 260, 8);
        bg.fillStyle(0x2a9d8f, 1);
        bg.fillEllipse(130, 275, 40, 8);

        // Window with sunlit sky & rushnyk (embroidered towel)
        bg.fillStyle(0x8ecae6, 1);
        bg.fillRoundedRect(410, 120, 130, 110, 6);
        bg.lineStyle(6, 0x6f4518, 1);
        bg.strokeRoundedRect(410, 120, 130, 110, 6);
        bg.lineBetween(475, 120, 475, 230);
        bg.lineBetween(410, 175, 540, 175);
        // Rushnyk over window
        bg.fillStyle(0xffffff, 1);
        bg.fillRect(395, 105, 160, 16);
        bg.fillRect(395, 105, 18, 90);
        bg.fillRect(537, 105, 18, 90);
        bg.fillStyle(0xd62828, 1);
        bg.fillRect(395, 175, 18, 12);
        bg.fillRect(537, 175, 18, 12);

        // Wooden Exit Door on the right
        this.doorX = 875;
        bg.fillStyle(0x583101, 1);
        bg.fillRoundedRect(830, 250, 90, 230, 6);
        bg.fillStyle(0x7f4f24, 1);
        bg.fillRect(840, 262, 70, 218);
        bg.fillStyle(0xffd166, 1);
        bg.fillCircle(852, 370, 6);

        this.doorIndicator = this.add.text(875, 215, STRINGS.DOOR_LABEL, {
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#ffd166',
          backgroundColor: '#2b2d42',
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false);

        // Family Characters at the table
        this.wife = this.add.image(330, 446, 'npc_wife').setScale(1.25);
        this.kid1 = this.add.image(425, 452, 'npc_kid').setScale(1.15);
        this.kid2 = this.add.image(505, 452, 'npc_kid').setScale(1.1).setFlipX(true);

        // Dining Table & Steaming Bowl of Red Borsch
        bg.fillStyle(0x7f4f24, 1);
        bg.fillRect(350, 422, 230, 14);
        bg.fillRect(370, 436, 16, 44);
        bg.fillRect(544, 436, 16, 44);
        // Red Borsch Bowl (Макітра з борщем)
        bg.fillStyle(0x9e2a2b, 1);
        bg.fillEllipse(465, 412, 46, 22);
        bg.fillStyle(0xe63946, 1);
        bg.fillEllipse(465, 405, 40, 10);

        // Steam particles above borsch
        this.time.addEvent({
          delay: 450,
          loop: true,
          callback: () => {
            const steam = this.add.circle(455 + Math.random() * 20, 395, 5, 0xffffff, 0.5);
            this.tweens.add({
              targets: steam,
              y: 350,
              alpha: 0,
              scale: 1.8,
              duration: 1100,
              onComplete: () => steam.destroy()
            });
          }
        });

        // Physics floor in Hut
        this.platforms = this.physics.add.staticGroup();
        const floor = this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HUT_GROUND_Y + 30, CONFIG.WIDTH, 60, 0x000000, 0);
        this.physics.add.existing(floor, true);
        this.platforms.add(floor);

        // Create Player (Cossack sitting at right side of table initially)
        this.player = new Player(this, 600, 440);
        this.player.sprite.setFlipX(true);
        this.physics.add.collider(this.player.sprite, this.platforms);

        // Header & Skip hint
        this.add.text(24, 16, STRINGS.HUT_HEADER, {
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166'
        });
        this.skipHint = this.add.text(CONFIG.WIDTH - 24, 16, STRINGS.HUT_SKIP_HINT, {
          fontSize: '14px',
          color: '#f5ebe0'
        }).setOrigin(1, 0);

        // Speech Bubble Container
        this.bubbleContainer = this.add.container(480, 180);
        this.bubbleBg = this.add.graphics();
        this.speakerText = this.add.text(-250, -42, '', {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#d62828'
        });
        this.dialogueText = this.add.text(-250, -14, '', {
          fontSize: '19px',
          color: '#1d1e2c',
          wordWrap: { width: 500 },
          lineSpacing: 4
        });
        this.bubbleContainer.add([this.bubbleBg, this.speakerText, this.dialogueText]);

        // Walk prompt shown after dialogue finishes
        this.walkPrompt = this.add.text(CONFIG.WIDTH / 2, 110, STRINGS.HUT_WALK_PROMPT, {
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#ffffff',
          backgroundColor: '#1d3557',
          padding: { x: 18, y: 10 }
        }).setOrigin(0.5).setVisible(false);

        // Item Acquisition Modal Container (hidden until dialogue ends)
        this.createItemPopupModal();

        // Touch controls for mobile players inside the hut too
        this.ui = new UI(this, true);

        // Clickable button to skip straight to door (direct screen-space interactive object)
        this.skipBtnBg = this.add.rectangle(CONFIG.WIDTH - 95, 48, 160, 30, 0x2b2d42, 0.92)
          .setStrokeStyle(2, 0xffd166)
          .setScrollFactor(0)
          .setDepth(120)
          .setInteractive({ useHandCursor: true });
        this.skipBtnTxt = this.add.text(CONFIG.WIDTH - 95, 48, 'До дверей ⏭ [Tab]', {
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#ffd166'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(121);

        this.skipBtnBg.on('pointerover', () => this.skipBtnBg.setFillStyle(0x3d405b, 1));
        this.skipBtnBg.on('pointerout', () => this.skipBtnBg.setFillStyle(0x2b2d42, 0.92));
        this.skipBtnBg.on('pointerdown', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          this.endCutscene();
        });

        // Input listeners to advance or skip dialogue
        this.input.keyboard.on('keydown-SPACE', () => this.onAdvanceInput());
        this.input.keyboard.on('keydown-D', () => this.onAdvanceInput());
        this.input.keyboard.on('keydown-ENTER', () => this.onAdvanceInput());
        this.input.keyboard.on('keydown-TAB', (e) => {
          e.preventDefault();
          this.endCutscene();
        });
        this.input.on('pointerdown', (pointer) => {
          // Ignore clicks on top-right HUD / skip buttons
          if (pointer.y < 70 && pointer.x > CONFIG.WIDTH - 260) return;
          if (this.cutsceneActive) this.onAdvanceInput();
        });

        // Show first line and set auto-advance timer (~4.5s per line -> ~22s total)
        this.showDialogueLine(0);
      }

      showDialogueLine(index) {
        if (index >= STRINGS.CUTSCENE_LINES.length) {
          this.showItemPopup(0);
          return;
        }

        this.currentLineIndex = index;
        const line = STRINGS.CUTSCENE_LINES[index];
        SFX.speechBlip();

        // Position bubble above the active speaker
        let targetX = 480;
        let tailX = 0;
        if (line.speaker.includes('Дружина')) {
          targetX = 390;
          tailX = -60;
          this.tweens.add({ targets: this.wife, scaleY: 1.35, duration: 120, yoyo: true });
        } else if (line.speaker.includes('Діти')) {
          targetX = 465;
          tailX = 0;
          this.tweens.add({ targets: [this.kid1, this.kid2], y: '-=10', duration: 120, yoyo: true });
        } else {
          targetX = 540;
          tailX = 60;
          this.tweens.add({ targets: this.player.sprite, scaleY: 1.18, duration: 120, yoyo: true });
        }

        this.bubbleContainer.setPosition(targetX, 265);
        this.bubbleBg.clear();
        this.bubbleBg.fillStyle(0xffffff, 0.97);
        this.bubbleBg.lineStyle(4, 0x2b2d42, 1);
        this.bubbleBg.fillRoundedRect(-270, -56, 540, 115, 16);
        this.bubbleBg.strokeRoundedRect(-270, -56, 540, 115, 16);
        // Speech bubble pointer triangle
        this.bubbleBg.fillTriangle(tailX - 14, 59, tailX + 14, 59, tailX, 82);

        this.speakerText.setText(line.speaker + ':');
        this.dialogueText.setText('«' + line.text + '»');

        this.bubbleContainer.setScale(0.85);
        this.tweens.add({
          targets: this.bubbleContainer,
          scale: 1,
          duration: 180,
          ease: 'Back.easeOut'
        });

        if (this.autoTimer) this.autoTimer.remove();
        this.autoTimer = this.time.delayedCall(4500, () => {
          if (this.cutsceneActive && this.itemPopupStep === -1) {
            this.showDialogueLine(this.currentLineIndex + 1);
          }
        });
      }

      createItemPopupModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.itemModal = this.add.container(0, 0).setDepth(150).setVisible(false);

        // Dimmed backdrop
        const dim = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0d0e15, 0.78);

        // Ornate Parchment & Dark Wood Card
        const card = this.add.graphics();
        card.fillStyle(0x1d1e2c, 0.98);
        card.fillRoundedRect(cx - 295, cy - 190, 590, 380, 18);
        card.lineStyle(4, 0xffd166, 1);
        card.strokeRoundedRect(cx - 295, cy - 190, 590, 380, 18);
        card.lineStyle(2, 0xc1121f, 0.9);
        card.strokeRoundedRect(cx - 285, cy - 180, 570, 360, 14);

        // Header badge at top
        const headerTxt = this.add.text(cx, cy - 152, STRINGS.ITEM_ACQUIRED_HEADER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          letterSpacing: 2
        }).setOrigin(0.5);

        // Item Title cleanly below header with no overlapping
        this.itemTitleTxt = this.add.text(cx, cy - 106, '', {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '27px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 520 },
          lineSpacing: 2
        }).setOrigin(0.5);

        // Golden glow circle centered in the middle of the card (well below the title)
        this.itemGlow = this.add.circle(cx, cy + 2, 62, 0xffd166, 0.16)
          .setStrokeStyle(2, 0xffd166, 0.55);

        this.tweens.add({
          targets: this.itemGlow,
          scaleX: 1.07,
          scaleY: 1.07,
          alpha: 0.28,
          duration: 800,
          yoyo: true,
          repeat: -1
        });

        // Custom Graphics canvas for drawing Frying Pan, Yesterday's Galushkas, or Cherry Kissel
        this.itemArt = this.add.graphics();

        // Quantity Badge (used for Galushkas & Kissel)
        this.itemCountTxt = this.add.text(cx, cy + 84, '', {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#ffd166',
          backgroundColor: '#2b2d42',
          padding: { x: 12, y: 3 }
        }).setOrigin(0.5);

        // Humor / Flavor Description at the bottom with plenty of breathing room
        this.itemDescTxt = this.add.text(cx, cy + 132, '', {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '21px',
          fontStyle: 'italic bold',
          color: '#f6e4b5',
          align: 'center',
          lineSpacing: 5,
          wordWrap: { width: 520 }
        }).setOrigin(0.5);

        this.itemModal.add([
          dim,
          card,
          this.itemGlow,
          headerTxt,
          this.itemTitleTxt,
          this.itemArt,
          this.itemCountTxt,
          this.itemDescTxt
        ]);
      }

      showItemPopup(step) {
        if (this.autoTimer) this.autoTimer.remove();
        this.bubbleContainer.setVisible(false);
        this.itemPopupStep = step;
        this.popupInputReadyTime = this.time.now + 220;

        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2 + 2;

        this.itemModal.setVisible(true);
        this.itemArt.clear();
        SFX.itemFanfare();

        if (step === 0) {
          // 1st Popup: Cast-Iron Frying Pan with aroma of shkvarky
          this.itemTitleTxt.setText(STRINGS.ITEM_PAN_TITLE);
          this.itemCountTxt.setVisible(false);
          this.itemDescTxt.setY(CONFIG.HEIGHT / 2 + 122);
          this.itemDescTxt.setText(STRINGS.ITEM_PAN_DESC);

          // Draw detailed Cast-Iron Frying Pan (Чавунна сковорідка зі шкварками)
          // Forged iron handle extending right
          this.itemArt.fillStyle(0x22252a, 1);
          this.itemArt.fillRoundedRect(cx + 26, cy - 6, 62, 13, 5);
          this.itemArt.lineStyle(2, 0x495057, 1);
          this.itemArt.strokeRoundedRect(cx + 26, cy - 6, 62, 13, 5);
          // Hanging hole on handle tip
          this.itemArt.fillStyle(0x1d1e2c, 1);
          this.itemArt.fillCircle(cx + 79, cy + 0.5, 3.5);

          // Heavy Cast-Iron Pan Body
          this.itemArt.fillStyle(0x2b2f36, 1);
          this.itemArt.fillCircle(cx - 10, cy + 2, 42);
          this.itemArt.lineStyle(4, 0xadb5bd, 0.85);
          this.itemArt.strokeCircle(cx - 10, cy + 2, 42);

          // Inner glossy seasoned bottom
          this.itemArt.fillStyle(0x1a1c20, 1);
          this.itemArt.fillCircle(cx - 10, cy + 2, 33);

          // Golden-brown sizzling Shkvarky (шкварки) inside the pan
          const shkvarkyCoords = [
            { x: cx - 23, y: cy - 6 },
            { x: cx - 4, y: cy - 9 },
            { x: cx - 16, y: cy + 11 },
            { x: cx + 4, y: cy + 8 },
            { x: cx - 8, y: cy + 1 }
          ];
          shkvarkyCoords.forEach(s => {
            this.itemArt.fillStyle(0xc97a2b, 1);
            this.itemArt.fillRoundedRect(s.x - 6, s.y - 4, 13, 9, 3);
            this.itemArt.fillStyle(0xffbe0b, 0.9);
            this.itemArt.fillRect(s.x - 3, s.y - 2, 6, 4);
          });

          // Wavy savory aroma lines rising inside the circle
          this.itemArt.lineStyle(2.2, 0xfefae0, 0.75);
          [-24, -10, 4].forEach(ox => {
            this.itemArt.beginPath();
            this.itemArt.arc(cx + ox, cy - 22, 7, Math.PI * 0.6, Math.PI * 1.5, false);
            this.itemArt.strokePath();
            this.itemArt.beginPath();
            this.itemArt.arc(cx + ox + 3, cy - 34, 7, -Math.PI * 0.4, Math.PI * 0.5, false);
            this.itemArt.strokePath();
          });
        } else if (step === 1) {
          // 2nd Popup: Yesterday's Galushkas (Вчорашні Галушки — 5 шт.)
          this.itemTitleTxt.setText(STRINGS.ITEM_GALUSHKA_TITLE);
          this.itemCountTxt.setText(STRINGS.ITEM_GALUSHKA_COUNT).setVisible(true);
          this.itemDescTxt.setY(CONFIG.HEIGHT / 2 + 132);
          this.itemDescTxt.setText(STRINGS.ITEM_GALUSHKA_DESC);

          // Draw 5 rock-hard Yesterday's Galushkas stacked on a wooden platter
          this.itemArt.fillStyle(0x7f4f24, 1);
          this.itemArt.fillEllipse(cx, cy + 20, 112, 24);
          this.itemArt.lineStyle(2, 0xd4a373, 1);
          this.itemArt.strokeEllipse(cx, cy + 20, 112, 24);

          const dumplings = [
            { x: cx - 26, y: cy + 9 },
            { x: cx, y: cy + 12 },
            { x: cx + 26, y: cy + 9 },
            { x: cx - 13, y: cy - 6 },
            { x: cx + 13, y: cy - 6 }
          ];
          dumplings.forEach(d => {
            this.itemArt.fillStyle(0xe9d8a6, 1);
            this.itemArt.fillEllipse(d.x, d.y, 30, 20);
            this.itemArt.lineStyle(2, 0x8d775f, 1);
            this.itemArt.strokeEllipse(d.x, d.y, 30, 20);
            this.itemArt.fillStyle(0xffffff, 0.85);
            this.itemArt.fillEllipse(d.x - 4, d.y - 4, 11, 5);
          });

          // Comical "rock-solid" sparkle glint
          this.itemArt.fillStyle(0xffea00, 1);
          this.itemArt.fillRect(cx + 32, cy - 26, 4, 14);
          this.itemArt.fillRect(cx + 27, cy - 21, 14, 4);
        } else if (step === 2) {
          // 3rd Popup: Cherry Kissel (Густий Вишневий Кисіль — 2 кухлі, хілка на [A])
          this.itemTitleTxt.setText(STRINGS.ITEM_KISSEL_TITLE);
          this.itemCountTxt.setText(STRINGS.ITEM_KISSEL_COUNT).setVisible(true);
          this.itemDescTxt.setY(CONFIG.HEIGHT / 2 + 132);
          this.itemDescTxt.setText(STRINGS.ITEM_KISSEL_DESC);

          // Draw Ukrainian Clay Mug (Кухоль) filled with ruby-red Cherry Kissel
          // Mug handle on right
          this.itemArt.lineStyle(6, 0xb5651d, 1);
          this.itemArt.beginPath();
          this.itemArt.arc(cx + 22, cy + 4, 16, -Math.PI * 0.45, Math.PI * 0.45, false);
          this.itemArt.strokePath();

          // Clay mug body
          this.itemArt.fillStyle(0xc97a2b, 1);
          this.itemArt.fillRoundedRect(cx - 26, cy - 22, 52, 54, 12);
          this.itemArt.lineStyle(2.5, 0x7f4f24, 1);
          this.itemArt.strokeRoundedRect(cx - 26, cy - 22, 52, 54, 12);

          // Traditional decorative wave stripe on mug
          this.itemArt.fillStyle(0xfefae0, 0.9);
          this.itemArt.fillRect(cx - 24, cy + 4, 48, 6);
          this.itemArt.fillStyle(0xc1121f, 1);
          for (let dx = -18; dx <= 18; dx += 12) {
            this.itemArt.fillCircle(cx + dx, cy + 7, 3);
          }

          // Thick Ruby-Red Kissel surface at top of mug
          this.itemArt.fillStyle(0x9b0020, 1);
          this.itemArt.fillEllipse(cx, cy - 20, 46, 14);
          this.itemArt.fillStyle(0xe63946, 1);
          this.itemArt.fillEllipse(cx - 3, cy - 21, 36, 9);

          // Two cherries & green leaf floating on top
          this.itemArt.fillStyle(0x52b788, 1);
          this.itemArt.fillEllipse(cx + 8, cy - 26, 14, 7);
          this.itemArt.fillStyle(0xd90429, 1);
          this.itemArt.fillCircle(cx - 6, cy - 22, 5.5);
          this.itemArt.fillCircle(cx + 3, cy - 20, 5.5);

          // Healing green/gold plus sparkles above the mug
          this.itemArt.fillStyle(0x00f5d4, 1);
          this.itemArt.fillRect(cx - 20, cy - 42, 3, 11);
          this.itemArt.fillRect(cx - 24, cy - 38, 11, 3);
          this.itemArt.fillStyle(0xffea00, 1);
          this.itemArt.fillRect(cx + 16, cy - 44, 3, 11);
          this.itemArt.fillRect(cx + 12, cy - 40, 11, 3);
        }

        // Pop-in animation
        this.itemModal.setScale(0.9);
        this.tweens.add({
          targets: this.itemModal,
          scale: 1,
          duration: 180,
          ease: 'Back.easeOut'
        });
      }

      onAdvanceInput() {
        if (!this.cutsceneActive) return;

        // If an Item Acquired popup is currently open, advance through all 3 popups (0 -> 1 -> 2 -> end)
        if (this.itemPopupStep >= 0) {
          if (this.time.now < this.popupInputReadyTime) return;
          if (this.itemPopupStep < 2) {
            this.showItemPopup(this.itemPopupStep + 1);
          } else {
            this.endCutscene();
          }
          return;
        }

        this.showDialogueLine(this.currentLineIndex + 1);
      }

      endCutscene() {
        if (!this.cutsceneActive) return;
        this.cutsceneActive = false;
        this.itemPopupStep = -1;
        if (this.autoTimer) this.autoTimer.remove();

        this.bubbleContainer.setVisible(false);
        if (this.itemModal) this.itemModal.setVisible(false);
        this.skipHint.setVisible(false);
        if (this.skipBtnBg) this.skipBtnBg.setVisible(false);
        if (this.skipBtnTxt) this.skipBtnTxt.setVisible(false);
        this.walkPrompt.setVisible(true);
        this.doorIndicator.setVisible(true);
        this.player.sprite.setFlipX(false);

        this.tweens.add({
          targets: this.doorIndicator,
          y: 203,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }

      update(time, delta) {
        if (!this.cutsceneActive && !this.transitioningOut) {
          this.player.update(time, delta);

          // Check if Cossack walked to the door on the right
          if (this.player.sprite.x >= this.doorX - 35) {
            this.transitioningOut = true;
            GAME_STATE.currentLevel = 1;
            GAME_STATE.hasSaber = false;
            GAME_STATE.hasSwampFrogs = false;
            GAME_STATE.savedCoins = 0;
            SFX.checkpoint();
            this.scene.start('GameScene', { level: 1, coins: 0 });
          }
        }
      }
    }