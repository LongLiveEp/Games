
    /**
     * ============================================================================
     * 11D. ACT 3 FINALE SCENE: GIANT RIVER CATFISH ("РІЧКОВИЙ СОМ ВУСАНЬ")
     * Omelko hops onto the broad back of the Giant Dnipro Catfish, who carries him
     * across the rapids to the far bank where Chumak salt wagons pass!
     * ============================================================================
     */
    class CatfishScene extends Phaser.Scene {
      constructor() {
        super('CatfishScene');
      }

      init(data) {
        this.finalCoins = (data && data.coins !== undefined) ? data.coins : (GAME_STATE.savedCoins || 0);
        this.finalStunned = (data && data.enemiesStunned !== undefined) ? data.enemiesStunned : 0;
      }

      create() {
        this.cameras.main.fadeIn(450, 8, 22, 42);
        this.lineIndex = 0;
        this.stage = 'MOUNT_AND_SWIM'; // MOUNT_AND_SWIM -> DIALOGUE -> SCALE_MODAL -> VICTORY_MODAL
        this.modalReadyTime = 0;

        // 1. Draw the Wide Dnipro River Crossing & Far Shore Pier
        this.drawDniproCrossingBackdrop();

        // 2. Create Giant River Catfish ("Річковий Сом Вусань") & Omelko riding on his back!
        this.catfishRiderGroup = this.add.container(190, 398).setDepth(30);
        this.catfishSprite = this.add.image(0, 12, 'giant_catfish').setScale(1.18);
        this.omelkoSprite = this.add.image(-8, -32, 'cossack').setScale(1.24);
        this.wakeFoam = this.add.ellipse(-92, 22, 58, 14, 0xcaf0f8, 0.85);
        this.catfishRiderGroup.add([this.wakeFoam, this.catfishSprite, this.omelkoSprite]);

        // Gentle swimming bob of the Giant Catfish & Omelko on his back
        this.tweens.add({
          targets: this.catfishRiderGroup,
          y: 390,
          angle: { from: -1.8, to: 1.8 },
          duration: 680,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        this.tweens.add({
          targets: this.wakeFoam,
          scaleX: 1.35,
          alpha: 0.4,
          duration: 380,
          yoyo: true,
          repeat: -1
        });

        // Top Header & Skip Hint
        this.add.text(24, 16, STRINGS.CATFISH_HEADER, {
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#90e0ef',
          stroke: '#031d38',
          strokeThickness: 4
        }).setDepth(60);

        this.skipHint = this.add.text(CONFIG.WIDTH - 24, 16, STRINGS.CATFISH_SKIP_HINT, {
          fontSize: '14px',
          color: '#f5ebe0',
          stroke: '#031d38',
          strokeThickness: 3
        }).setOrigin(1, 0).setDepth(60);

        // 3. Speech Bubble Container
        this.bubbleContainer = this.add.container(480, 225).setDepth(55).setVisible(false);
        this.bubbleBg = this.add.graphics();
        this.speakerText = this.add.text(-295, -52, '', {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#0077b6'
        });
        this.dialogueText = this.add.text(-295, -24, '', {
          fontSize: '18px',
          color: '#1d1e2c',
          wordWrap: { width: 590 },
          lineSpacing: 5
        });
        this.bubbleContainer.add([this.bubbleBg, this.speakerText, this.dialogueText]);

        // 4. Create Silver Catfish Scale & Crimean Salt Trophy Modal
        this.createCatfishScaleModal();

        // 5. Create Act 3 Finale Victory Modal
        this.createAct3VictoryModal();

        // 6. Input Listeners
        this.input.keyboard.on('keydown-ENTER', () => this.onAdvance());
        this.input.keyboard.on('keydown-SPACE', () => this.onAdvance());
        this.input.keyboard.on('keydown-D', () => this.onAdvance());
        this.input.on('pointerdown', () => {
          if (this.stage !== 'VICTORY_MODAL') {
            this.onAdvance();
          }
        });

        // Swim from left rapids toward mid-river, then start dialogue while swimming to the far shore!
        SFX.waterSplash();
        this.tweens.add({
          targets: this.catfishRiderGroup,
          x: 420,
          duration: 1350,
          ease: 'Quad.easeOut',
          onComplete: () => {
            if (this.stage === 'MOUNT_AND_SWIM') {
              this.stage = 'DIALOGUE';
              this.bubbleContainer.setVisible(true);
              this.showDialogueLine(0);
            }
          }
        });
      }

      drawDniproCrossingBackdrop() {
        const bg = this.add.graphics();

        // Golden-blue sunset over the wide Dnipro
        bg.fillGradientStyle(0x071a33, 0x1d4e89, 0x0077b6, 0xf4a261, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, 390);

        // Glowing golden sun over the far bank
        bg.fillStyle(0xffd166, 0.3);
        bg.fillCircle(480, 175, 88);
        bg.fillStyle(0xffea00, 0.88);
        bg.fillCircle(480, 175, 52);

        // Distant Dnipro granite cliffs & Cossack hills
        bg.fillStyle(0x16324f, 1);
        for (let cx = 0; cx <= 960; cx += 190) {
          bg.fillTriangle(cx - 40, 365, cx + 65, 225, cx + 180, 365);
        }

        // Left bank departure pier (behind Omelko)
        bg.fillStyle(0x3d405b, 1);
        bg.fillRoundedRect(-10, 355, 145, 95, 8);
        bg.fillStyle(0x7f4f24, 1);
        bg.fillRect(0, 350, 130, 12);

        // Far bank arrival shore on the right (where Chumak salt trail begins!)
        bg.fillStyle(0x2d6a4f, 1);
        bg.fillRoundedRect(755, 340, 220, 110, 12);
        bg.fillStyle(0x7f4f24, 1);
        bg.fillRect(735, 356, 85, 12);
        // Waypost on the far shore: "Чумацький Шлях по сіль →"
        bg.fillStyle(0x583101, 1);
        bg.fillRect(855, 282, 10, 72);
        bg.fillStyle(0xffd166, 1);
        bg.fillRoundedRect(788, 290, 148, 28, 5);
        this.add.text(862, 304, 'Чумацький Шлях →', {
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#3d2314'
        }).setOrigin(0.5).setDepth(20);

        // Deep Dnipro river water
        bg.fillStyle(0x031d38, 1);
        bg.fillRect(0, 375, CONFIG.WIDTH, 165);
        bg.fillStyle(0x003566, 0.92);
        bg.fillRect(0, 375, CONFIG.WIDTH, 65);
        bg.fillStyle(0x0077b6, 0.85);
        bg.fillRect(0, 375, CONFIG.WIDTH, 22);

        // Animated scrolling wave crests to convey the Catfish swimming across the Dnipro
        this.waveStrips = [];
        for (let i = 0; i < 12; i++) {
          const wv = this.add.ellipse(i * 90 + 30, 392 + (i % 3) * 28, 62, 8, 0x90e0ef, 0.55).setDepth(25);
          this.tweens.add({
            targets: wv,
            x: wv.x - 75,
            duration: 950 + (i % 3) * 180,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
          this.waveStrips.push(wv);
        }
      }

      showDialogueLine(index) {
        if (index >= STRINGS.CATFISH_LINES.length) {
          // Swim the rest of the way to the far right shore pier before showing the Trophy Modal!
          this.bubbleContainer.setVisible(false);
          SFX.waterSplash();
          this.tweens.add({
            targets: this.catfishRiderGroup,
            x: 650,
            duration: 900,
            ease: 'Quad.easeInOut',
            onComplete: () => {
              this.showCatfishScaleModal();
            }
          });
          return;
        }

        this.lineIndex = index;
        const line = STRINGS.CATFISH_LINES[index];
        SFX.speechBlip();

        // Advance catfish slightly rightward with each dialogue exchange across the river
        this.tweens.add({
          targets: this.catfishRiderGroup,
          x: 420 + index * 52,
          duration: 500,
          ease: 'Sine.easeOut'
        });

        const isCatfish = line.speaker.includes('Сом');
        this.bubbleContainer.setVisible(true);
        this.bubbleContainer.setPosition(480, 222);
        this.bubbleBg.clear();
        this.bubbleBg.fillStyle(0xfefae0, 0.98);
        this.bubbleBg.lineStyle(4, isCatfish ? 0x0077b6 : 0xc1121f, 1);
        this.bubbleBg.fillRoundedRect(-315, -66, 630, 138, 16);
        this.bubbleBg.strokeRoundedRect(-315, -66, 630, 138, 16);
        this.bubbleBg.fillTriangle(-14, 72, 14, 72, 0, 96);

        this.speakerText.setText(line.speaker + ':');
        this.speakerText.setColor(isCatfish ? '#0077b6' : '#c1121f');
        this.dialogueText.setText('«' + line.text + '»');

        this.bubbleContainer.setScale(0.86);
        this.tweens.add({
          targets: this.bubbleContainer,
          scale: 1,
          duration: 180,
          ease: 'Back.easeOut'
        });

        if (this.autoTimer) this.autoTimer.remove();
        this.autoTimer = this.time.delayedCall(5600, () => {
          if (this.stage === 'DIALOGUE') {
            this.showDialogueLine(this.lineIndex + 1);
          }
        });
      }

      createCatfishScaleModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.scaleModal = this.add.container(0, 0).setDepth(150).setVisible(false);

        const dim = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x06101e, 0.85);

        const card = this.add.graphics();
        card.fillStyle(0x0f2537, 0.98);
        card.fillRoundedRect(cx - 310, cy - 195, 620, 390, 18);
        card.lineStyle(4, 0x48cae4, 1);
        card.strokeRoundedRect(cx - 310, cy - 195, 620, 390, 18);
        card.lineStyle(2, 0xffd166, 0.9);
        card.strokeRoundedRect(cx - 298, cy - 183, 596, 366, 14);

        const headerTxt = this.add.text(cx, cy - 156, STRINGS.ITEM_ACQUIRED_HEADER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          letterSpacing: 2
        }).setOrigin(0.5);

        const titleTxt = this.add.text(cx, cy - 106, STRINGS.ITEM_CATFISH_SCALE_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '26px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
        }).setOrigin(0.5);

        const glow = this.add.circle(cx, cy + 2, 66, 0x48cae4, 0.22)
          .setStrokeStyle(2.5, 0x90e0ef, 0.7);
        this.tweens.add({
          targets: glow,
          scaleX: 1.09,
          scaleY: 1.09,
          alpha: 0.36,
          duration: 780,
          yoyo: true,
          repeat: -1
        });

        // Custom illustration: Silver Catfish Scale & Chumak Bag of White Crimean Salt!
        const art = this.add.graphics();
        // Ornate shield-shaped silver scale on left
        art.fillStyle(0x90e0ef, 1);
        art.fillCircle(cx - 28, cy + 4, 30);
        art.lineStyle(3, 0xffffff, 0.95);
        art.strokeCircle(cx - 28, cy + 4, 30);
        art.fillStyle(0x48cae4, 1);
        art.fillCircle(cx - 28, cy + 4, 18);

        // Chumak linen pouch with sparkling white Crimean salt crystals on right
        art.fillStyle(0xd4a373, 1);
        art.fillRoundedRect(cx + 6, cy - 18, 48, 50, 14);
        art.lineStyle(3, 0xc1121f, 1);
        art.lineBetween(cx + 12, cy - 6, cx + 48, cy - 6);
        // Sparkling white salt crystals mound
        art.fillStyle(0xffffff, 1);
        art.fillEllipse(cx + 30, cy - 16, 34, 16);
        art.fillStyle(0xffea00, 1);
        art.fillCircle(cx + 22, cy - 22, 3);
        art.fillCircle(cx + 38, cy - 20, 2.5);

        const badgeTxt = this.add.text(cx, cy + 84, STRINGS.ITEM_CATFISH_SCALE_BADGE, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#90e0ef',
          backgroundColor: '#031d38',
          padding: { x: 14, y: 5 }
        }).setOrigin(0.5);

        const descTxt = this.add.text(cx, cy + 134, STRINGS.ITEM_CATFISH_SCALE_DESC, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '20px',
          fontStyle: 'italic bold',
          color: '#f6e4b5',
          align: 'center',
          lineSpacing: 5
        }).setOrigin(0.5);

        this.scaleModal.add([dim, card, glow, headerTxt, titleTxt, art, badgeTxt, descTxt]);
      }

      showCatfishScaleModal() {
        if (this.autoTimer) this.autoTimer.remove();
        this.bubbleContainer.setVisible(false);
        this.skipHint.setVisible(false);
        this.stage = 'SCALE_MODAL';
        this.modalReadyTime = this.time.now + 240;

        this.scaleModal.setVisible(true);
        this.scaleModal.setScale(0.9);
        SFX.itemFanfare();

        this.tweens.add({
          targets: this.scaleModal,
          scale: 1,
          duration: 210,
          ease: 'Back.easeOut'
        });
      }

      createAct3VictoryModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.victoryModal = this.add.container(0, 0).setDepth(210).setVisible(false);

        const overlay = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x050b14, 0.86)
          .setInteractive();

        const card = this.add.graphics();
        card.fillStyle(0x0f2537, 0.98);
        card.fillRoundedRect(cx - 415, cy - 195, 830, 390, 18);
        card.lineStyle(4, 0xffd166, 1);
        card.strokeRoundedRect(cx - 415, cy - 195, 830, 390, 18);
        card.lineStyle(2, 0x48cae4, 0.9);
        card.strokeRoundedRect(cx - 403, cy - 183, 806, 366, 14);

        const title = this.add.text(cx, cy - 134, STRINGS.VICTORY_ACT3_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '34px',
          fontStyle: 'bold',
          color: '#ffd166'
        }).setOrigin(0.5);

        const msg = this.add.text(cx, cy - 58, STRINGS.VICTORY_ACT3_TEXT, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '21px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 760 },
          lineSpacing: 7
        }).setOrigin(0.5);

        const sub = this.add.text(cx, cy + 8, STRINGS.VICTORY_ACT3_SUBTEXT, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'italic bold',
          color: '#90e0ef',
          align: 'center',
          wordWrap: { width: 760 }
        }).setOrigin(0.5);

        const stats = this.add.text(
          cx,
          cy + 52,
          `✦ Зібрано червінців: ${this.finalCoins}   |   Ошелешено водяної нечисті: ${this.finalStunned} ✦`,
          {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#a8dadc',
            backgroundColor: '#031d38',
            padding: { x: 16, y: 6 }
          }
        ).setOrigin(0.5);

        // Button 1: Proceed to Act IV ("Дике поле і Чорне море")
        const btn1Bg = this.add.rectangle(cx - 165, cy + 126, 390, 48, 0x0077b6, 1)
          .setStrokeStyle(2.5, 0xffea00)
          .setInteractive({ useHandCursor: true });

        const btn1Lbl = this.add.text(cx - 165, cy + 126, STRINGS.ENTER_STEPPE_ACT4_BTN, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5);

        btn1Bg.on('pointerover', () => {
          btn1Bg.setScale(1.04);
          btn1Lbl.setScale(1.04);
          SFX.speechBlip();
        });
        btn1Bg.on('pointerout', () => {
          btn1Bg.setScale(1);
          btn1Lbl.setScale(1);
        });
        btn1Bg.on('pointerdown', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          this.startSteppeAct4();
        });

        // Button 2: Return to Title Screen
        const btn2Bg = this.add.rectangle(cx + 215, cy + 126, 310, 48, 0x3d405b, 1)
          .setStrokeStyle(2, 0xf5ebe0)
          .setInteractive({ useHandCursor: true });

        const btn2Lbl = this.add.text(cx + 215, cy + 126, STRINGS.PLAY_AGAIN, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5);

        btn2Bg.on('pointerover', () => {
          btn2Bg.setScale(1.04);
          btn2Lbl.setScale(1.04);
          SFX.speechBlip();
        });
        btn2Bg.on('pointerout', () => {
          btn2Bg.setScale(1);
          btn2Lbl.setScale(1);
        });
        btn2Bg.on('pointerdown', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          this.restartWholeGame();
        });

        this.victoryModal.add([overlay, card, title, msg, sub, stats, btn1Bg, btn1Lbl, btn2Bg, btn2Lbl]);
      }

      showAct3VictoryModal() {
        this.scaleModal.setVisible(false);
        this.stage = 'VICTORY_MODAL';
        this.modalReadyTime = this.time.now + 240;

        this.victoryModal.setVisible(true);
        this.victoryModal.setScale(0.9);
        SFX.banduraStart();

        this.tweens.add({
          targets: this.victoryModal,
          scale: 1,
          duration: 220,
          ease: 'Back.easeOut'
        });
      }

      onAdvance() {
        if (this.stage === 'MOUNT_AND_SWIM') {
          this.catfishRiderGroup.x = 420;
          this.stage = 'DIALOGUE';
          this.bubbleContainer.setVisible(true);
          this.showDialogueLine(0);
        } else if (this.stage === 'DIALOGUE') {
          this.showDialogueLine(this.lineIndex + 1);
        } else if (this.stage === 'SCALE_MODAL') {
          if (this.time.now < this.modalReadyTime) return;
          this.showAct3VictoryModal();
        } else if (this.stage === 'VICTORY_MODAL') {
          if (this.time.now < this.modalReadyTime) return;
          this.startSteppeAct4();
        }
      }

      startSteppeAct4() {
        if (SFX.windWhistle) SFX.windWhistle();
        else SFX.pickup();
        GAME_STATE.currentLevel = 4;
        GAME_STATE.hasSaber = true;
        GAME_STATE.hasSwampFrogs = true;
        GAME_STATE.savedCoins = this.finalCoins;
        this.scene.start('GameScene', { level: 4, coins: this.finalCoins });
      }

      replayDniproAct3() {
        SFX.waterSplash();
        GAME_STATE.currentLevel = 3;
        GAME_STATE.hasSaber = true;
        GAME_STATE.hasSwampFrogs = true;
        this.scene.start('GameScene', { level: 3, coins: this.finalCoins });
      }

      restartWholeGame() {
        SFX.pickup();
        GAME_STATE.currentLevel = 1;
        GAME_STATE.hasSaber = false;
        GAME_STATE.hasSwampFrogs = false;
        GAME_STATE.savedCoins = 0;
        this.scene.start('TitleScene');
      }
    }