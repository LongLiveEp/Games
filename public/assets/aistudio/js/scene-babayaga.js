
    /**
     * ============================================================================
     * 11C. ACT 2 FINALE SCENE: BABA YAGA'S HUT ON CHICKEN LEGS ("ХАТКА НА КУРЯЧИХ НІЖКАХ")
     * Omelko walks up to the chicken-legged hut in the Evil Forest, speaks with Baba Yaga
     * about the missing salt, and receives Combat Swamp Frogs (Болотні Жаби) for throwing!
     * ============================================================================
     */
    class BabaYagaScene extends Phaser.Scene {
      constructor() {
        super('BabaYagaScene');
      }

      init(data) {
        this.finalCoins = (data && data.coins !== undefined) ? data.coins : (GAME_STATE.savedCoins || 0);
        this.finalStunned = (data && data.enemiesStunned !== undefined) ? data.enemiesStunned : 0;
      }

      create() {
        this.cameras.main.fadeIn(450, 10, 12, 20);
        this.lineIndex = 0;
        this.stage = 'WALK_IN'; // WALK_IN -> DIALOGUE -> FROG_MODAL -> VICTORY_MODAL
        this.modalReadyTime = 0;
        SFX.playMusic('mus_yaga', { volume: 0.40 });

        // 1. Draw the Eerie Glade & Hut on Chicken Legs (Хатка на курячих ніжках)
        this.drawChickenLegGlade();

        // 2. Place Characters: Cossack Omelko walking in from left, Baba Yaga by the hut, and Chornobor in barrel
        this.omelko = this.add.image(110, 412, 'cossack').setScale(1.3);
        this.babaYaga = this.add.image(545, 408, 'npc_baba_yaga').setScale(1.34).setFlipX(true);

        // Idle animation for Baba Yaga
        this.tweens.add({
          targets: this.babaYaga,
          scaleY: 1.39,
          scaleX: 1.3,
          duration: 980,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Pacified Dark Lisovyk Chornobor upside-down in a mossy swamp barrel on the left
        const barrelX = 185, barrelY = 420;
        const propBarrel = this.add.image(barrelX, barrelY, 'prop_barrel').setScale(1.18).setTint(0x74c69d);
        const lisovykFeet = this.add.image(barrelX, barrelY - 30, 'boss_lisovyk')
          .setScale(0.52)
          .setFlipY(true);
        this.tweens.add({
          targets: [propBarrel, lisovykFeet],
          angle: { from: -5, to: 5 },
          duration: 340,
          yoyo: true,
          repeat: -1
        });

        // Hopping ambient swamp frogs near Baba Yaga's cauldron
        for (let i = 0; i < 2; i++) {
          const frog = this.add.image(465 + i * 38, 434, 'swamp_frog').setScale(1.15).setFlipX(i === 1);
          this.tweens.add({
            targets: frog,
            y: 416,
            duration: 420 + i * 110,
            yoyo: true,
            repeat: -1,
            repeatDelay: 700,
            ease: 'Quad.easeOut'
          });
        }

        // Top Header & Skip Hint
        this.add.text(24, 16, STRINGS.BABA_YAGA_HEADER, {
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#80ed99',
          stroke: '#0d131a',
          strokeThickness: 4
        });

        this.skipHint = this.add.text(CONFIG.WIDTH - 24, 16, STRINGS.BABA_YAGA_SKIP_HINT, {
          fontSize: '14px',
          color: '#f5ebe0',
          stroke: '#0d131a',
          strokeThickness: 3
        }).setOrigin(1, 0);

        // 3. Speech Bubble Container
        this.bubbleContainer = this.add.container(450, 235).setDepth(50).setVisible(false);
        this.bubbleBg = this.add.graphics();
        this.speakerText = this.add.text(-290, -52, '', {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#c1121f'
        });
        this.dialogueText = this.add.text(-290, -24, '', {
          fontSize: '18px',
          color: '#1d1e2c',
          wordWrap: { width: 580 },
          lineSpacing: 5
        });
        this.bubbleContainer.add([this.bubbleBg, this.speakerText, this.dialogueText]);

        // 4. Create Swamp Frogs Item Acquired Modal
        this.createFrogModal();

        // 5. Create Act 2 Finale Victory Modal
        this.createAct2VictoryModal();

        // 6. Input Listeners
        this.input.keyboard.on('keydown-ENTER', () => this.onAdvance());
        this.input.keyboard.on('keydown-SPACE', () => this.onAdvance());
        this.input.keyboard.on('keydown-D', () => this.onAdvance());
        this.input.on('pointerdown', () => {
          if (this.stage !== 'VICTORY_MODAL') {
            this.onAdvance();
          }
        });

        // Animate Omelko walking up to the Hut on Chicken Legs, then start dialogue
        this.tweens.add({
          targets: this.omelko,
          x: 325,
          duration: 1050,
          ease: 'Quad.easeOut',
          onUpdate: () => {
            this.omelko.y = 412 - Math.abs(Math.sin(this.time.now * 0.018)) * 6;
          },
          onComplete: () => {
            this.omelko.y = 412;
            this.tweens.add({
              targets: this.omelko,
              y: 409,
              duration: 950,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
            if (this.stage === 'WALK_IN') {
              this.stage = 'DIALOGUE';
              this.bubbleContainer.setVisible(true);
              this.showDialogueLine(0);
            }
          }
        });
      }

      drawChickenLegGlade() {
        const bg = this.add.graphics();

        // Deep eerie twilight sky of the Evil Forest glade
        bg.fillGradientStyle(0x070912, 0x111827, 0x1b3a36, 0x244c3c, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, 435);

        // Blood-amber moon behind twisted branches
        bg.fillStyle(0xff9f1c, 0.22);
        bg.fillCircle(195, 110, 62);
        bg.fillStyle(0xffd166, 0.85);
        bg.fillCircle(195, 110, 38);

        // Gnarled background trees on the left & right
        bg.fillStyle(0x0d1b18, 1);
        for (let tx = 20; tx <= 940; tx += 110) {
          if (tx < 520 || tx > 860) {
            bg.fillRect(tx, 160, 26, 220);
            bg.fillCircle(tx + 13, 150, 56);
            bg.fillCircle(tx - 12, 175, 42);
            bg.fillCircle(tx + 38, 175, 42);
          }
        }

        // Mossy swamp glade ground
        bg.fillStyle(0x162e26, 1);
        bg.fillRect(0, 365, CONFIG.WIDTH, 175);
        bg.fillStyle(0x283618, 1);
        bg.fillEllipse(470, 445, 790, 92);

        // Crooked palisade fence with glowing swamp lanterns
        bg.lineStyle(4, 0x3d291a, 1);
        for (let fx = 55; fx < 475; fx += 48) {
          bg.lineBetween(fx, 330, fx + (fx % 96 === 0 ? -4 : 4), 392);
          if (fx % 96 === 55) {
            bg.fillStyle(0x80ffdb, 0.85);
            bg.fillCircle(fx, 326, 5);
            bg.fillStyle(0x00f5d4, 0.22);
            bg.fillCircle(fx, 326, 13);
          }
        }
        bg.lineBetween(45, 355, 480, 355);
        bg.lineBetween(45, 375, 480, 375);

        // Bubbling Cast-Iron Cauldron (казан Баби-Яги) in the yard
        const cx = 435, cy = 406;
        bg.fillStyle(0xff6b35, 0.85);
        bg.fillTriangle(cx - 18, cy + 16, cx + 18, cy + 16, cx, cy - 4);
        bg.fillStyle(0x1f242d, 1);
        bg.fillEllipse(cx, cy, 46, 32);
        bg.fillStyle(0x80ed99, 0.95);
        bg.fillEllipse(cx, cy - 11, 36, 10);

        // ====================================================================
        // ХАТКА НА КУРЯЧИХ НІЖКАХ (BABA YAGA'S HUT ON CHICKEN LEGS)
        // ====================================================================
        this.hutContainer = this.add.container(705, 255);
        const hutG = this.add.graphics();

        // Two giant scaly golden Chicken Legs supporting the log hut!
        hutG.fillStyle(0xe9c46a, 1);
        // Left chicken leg
        hutG.fillRoundedRect(-78, 85, 24, 62, 8);
        hutG.fillRoundedRect(-86, 68, 38, 28, 10); // feathered thigh
        // Left talons
        hutG.lineStyle(6, 0xe9c46a, 1);
        hutG.lineBetween(-68, 145, -96, 160);
        hutG.lineBetween(-66, 145, -66, 163);
        hutG.lineBetween(-64, 145, -42, 158);
        // Claws
        hutG.fillStyle(0x2b2d42, 1);
        hutG.fillCircle(-98, 160, 4);
        hutG.fillCircle(-66, 164, 4);
        hutG.fillCircle(-40, 158, 4);

        // Right chicken leg
        hutG.fillStyle(0xe9c46a, 1);
        hutG.fillRoundedRect(46, 85, 24, 62, 8);
        hutG.fillRoundedRect(38, 68, 38, 28, 10);
        // Right talons
        hutG.lineStyle(6, 0xe9c46a, 1);
        hutG.lineBetween(56, 145, 30, 158);
        hutG.lineBetween(58, 145, 58, 163);
        hutG.lineBetween(60, 145, 86, 160);
        hutG.fillStyle(0x2b2d42, 1);
        hutG.fillCircle(28, 158, 4);
        hutG.fillCircle(58, 164, 4);
        hutG.fillCircle(88, 160, 4);

        // Wooden Log Cabin Body (сруб із темних колод)
        hutG.fillStyle(0x4a3222, 1);
        hutG.fillRoundedRect(-125, -55, 240, 132, 8);

        // Horizontal log ribs & corner notches
        hutG.lineStyle(2.5, 0x2b1d14, 0.9);
        for (let ly = -35; ly <= 60; ly += 22) {
          hutG.lineBetween(-124, ly, 114, ly);
          hutG.fillStyle(0x6f4518, 1);
          hutG.fillCircle(-124, ly - 10, 9);
          hutG.fillCircle(114, ly - 10, 9);
        }

        // Crooked wooden door & porch steps
        hutG.fillStyle(0x2b1d14, 1);
        hutG.fillRoundedRect(-92, -10, 52, 84, 5);
        hutG.fillStyle(0x5c3c24, 1);
        hutG.fillRect(-86, -4, 40, 74);

        // Glowing amber-green witch window with carved shutters
        hutG.fillStyle(0x1b4332, 1);
        hutG.fillRoundedRect(4, -8, 66, 54, 5);
        hutG.fillStyle(0xffea00, 0.9);
        hutG.fillRect(14, 0, 46, 38);
        hutG.lineStyle(3, 0x3d2314, 1);
        hutG.strokeRect(14, 0, 46, 38);
        hutG.lineBetween(37, 0, 37, 38);
        hutG.lineBetween(14, 19, 60, 19);

        // Steep mossy shingled roof & crooked chimney
        hutG.fillStyle(0x3d291a, 1);
        hutG.fillRect(45, -130, 26, 48);
        hutG.fillStyle(0x1f3528, 1);
        hutG.fillTriangle(-150, -48, 140, -48, -5, -138);
        hutG.fillStyle(0x2d4a3e, 1);
        hutG.fillTriangle(-136, -52, 126, -52, -5, -130);

        this.hutContainer.add(hutG);

        // Subtle rhythmic bobbing of the hut on its chicken legs!
        this.tweens.add({
          targets: this.hutContainer,
          y: 249,
          angle: { from: -1.2, to: 1.2 },
          duration: 1350,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      showDialogueLine(index) {
        if (index >= STRINGS.BABA_YAGA_LINES.length) {
          this.showFrogModal();
          return;
        }

        this.lineIndex = index;
        const line = STRINGS.BABA_YAGA_LINES[index];
        SFX.speechBlip();

        const isYaga = line.speaker.includes('Яга');
        const targetX = isYaga ? 500 : 365;
        const tailX = isYaga ? 45 : -45;

        if (isYaga) {
          this.tweens.add({ targets: this.babaYaga, y: 398, duration: 130, yoyo: true });
        } else {
          this.tweens.add({ targets: this.omelko, y: 400, duration: 130, yoyo: true });
        }

        this.bubbleContainer.setVisible(true);
        this.bubbleContainer.setPosition(targetX, 238);
        this.bubbleBg.clear();
        this.bubbleBg.fillStyle(0xfefae0, 0.98);
        this.bubbleBg.lineStyle(4, isYaga ? 0x2d6a4f : 0xc1121f, 1);
        this.bubbleBg.fillRoundedRect(-310, -66, 620, 138, 16);
        this.bubbleBg.strokeRoundedRect(-310, -66, 620, 138, 16);
        this.bubbleBg.fillTriangle(tailX - 14, 72, tailX + 14, 72, tailX, 96);

        this.speakerText.setText(line.speaker + ':');
        this.speakerText.setColor(isYaga ? '#2d6a4f' : '#c1121f');
        this.dialogueText.setText('«' + line.text + '»');

        this.bubbleContainer.setScale(0.85);
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

      createFrogModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.frogModal = this.add.container(0, 0).setDepth(150).setVisible(false);

        const dim = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x090c12, 0.84);

        const card = this.add.graphics();
        card.fillStyle(0x162229, 0.98);
        card.fillRoundedRect(cx - 305, cy - 195, 610, 390, 18);
        card.lineStyle(4, 0x80ed99, 1);
        card.strokeRoundedRect(cx - 305, cy - 195, 610, 390, 18);
        card.lineStyle(2, 0xffd166, 0.9);
        card.strokeRoundedRect(cx - 293, cy - 183, 586, 366, 14);

        const headerTxt = this.add.text(cx, cy - 156, STRINGS.ITEM_ACQUIRED_HEADER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          letterSpacing: 2,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);

        const titleTxt = this.add.text(cx, cy - 106, STRINGS.ITEM_FROG_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 2,
          padding: { top: 4, bottom: 6 }
        }).setOrigin(0.5);

        const glow = this.add.circle(cx, cy + 2, 66, 0x52b788, 0.2)
          .setStrokeStyle(2.5, 0x80ed99, 0.65);

        this.tweens.add({
          targets: glow,
          scaleX: 1.09,
          scaleY: 1.09,
          alpha: 0.34,
          duration: 780,
          yoyo: true,
          repeat: -1
        });

        // Detailed Custom Illustration of Baba Yaga's Combat Swamp Frog (Болотна Жаба)
        const frogArt = this.add.graphics();
        const fx = cx;
        const fy = cy + 6;

        // Swamp lilypad base
        frogArt.fillStyle(0x1b4332, 1);
        frogArt.fillEllipse(fx, fy + 26, 116, 28);
        frogArt.lineStyle(2, 0x52b788, 0.9);
        frogArt.strokeEllipse(fx, fy + 26, 116, 28);

        // Hind muscular jumping legs
        frogArt.fillStyle(0x2d6a4f, 1);
        frogArt.fillEllipse(fx - 34, fy + 10, 28, 22);
        frogArt.fillEllipse(fx + 34, fy + 10, 28, 22);
        // Webbed feet
        frogArt.fillStyle(0x40916c, 1);
        frogArt.fillTriangle(fx - 48, fy + 22, fx - 24, fy + 22, fx - 34, fy + 14);
        frogArt.fillTriangle(fx + 24, fy + 22, fx + 48, fy + 22, fx + 34, fy + 14);

        // Plump emerald frog body
        frogArt.fillStyle(0x40916c, 1);
        frogArt.fillEllipse(fx, fy + 2, 68, 48);
        // Pale green throat/belly with vocal sac
        frogArt.fillStyle(0xd8f3dc, 1);
        frogArt.fillEllipse(fx, fy + 8, 46, 28);

        // Dark forest warts on back
        frogArt.fillStyle(0x1b4332, 1);
        frogArt.fillCircle(fx - 18, fy - 6, 4.5);
        frogArt.fillCircle(fx + 19, fy - 5, 4);
        frogArt.fillCircle(fx - 10, fy - 14, 3);
        frogArt.fillCircle(fx + 11, fy - 13, 3.5);

        // Big golden-amber amphibian eyes
        frogArt.fillStyle(0x40916c, 1);
        frogArt.fillCircle(fx - 16, fy - 20, 12);
        frogArt.fillCircle(fx + 16, fy - 20, 12);
        frogArt.fillStyle(0xffea00, 1);
        frogArt.fillCircle(fx - 16, fy - 20, 8.5);
        frogArt.fillCircle(fx + 16, fy - 20, 8.5);
        frogArt.fillStyle(0x111111, 1);
        frogArt.fillEllipse(fx - 16, fy - 20, 4, 9);
        frogArt.fillEllipse(fx + 16, fy - 20, 4, 9);
        frogArt.fillStyle(0xffffff, 1);
        frogArt.fillCircle(fx - 18, fy - 23, 2.2);
        frogArt.fillCircle(fx + 14, fy - 23, 2.2);

        // Determined Cossack-style smirk
        frogArt.lineStyle(3, 0x1b4332, 1);
        frogArt.lineBetween(fx - 20, fy + 1, fx + 20, fy + 1);

        // Magical glowing swamp bubbles around the frog
        frogArt.fillStyle(0x80ffdb, 0.85);
        frogArt.fillCircle(fx - 44, fy - 16, 5);
        frogArt.fillCircle(fx + 46, fy - 12, 6);
        frogArt.fillCircle(fx + 36, fy - 28, 3.5);

        const badgeTxt = this.add.text(cx, cy + 84, STRINGS.ITEM_FROG_BADGE, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#80ed99',
          backgroundColor: '#1b4332',
          padding: { x: 14, y: 5 }
        }).setOrigin(0.5);

        const descTxt = this.add.text(cx, cy + 134, STRINGS.ITEM_FROG_DESC, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '21px',
          fontStyle: 'italic bold',
          color: '#f6e4b5',
          align: 'center',
          lineSpacing: 5,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);

        this.frogModal.add([dim, card, glow, headerTxt, titleTxt, frogArt, badgeTxt, descTxt]);
      }

      showFrogModal() {
        if (this.autoTimer) this.autoTimer.remove();
        this.bubbleContainer.setVisible(false);
        this.skipHint.setVisible(false);
        this.stage = 'FROG_MODAL';
        this.modalReadyTime = this.time.now + 240;
        GAME_STATE.hasSwampFrogs = true;

        this.frogModal.setVisible(true);
        this.frogModal.setScale(0.9);
        SFX.itemFanfare();
        SFX.throwFrog();

        this.tweens.add({
          targets: this.frogModal,
          scale: 1,
          duration: 210,
          ease: 'Back.easeOut'
        });
      }

      createAct2VictoryModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.victoryModal = this.add.container(0, 0).setDepth(210).setVisible(false);

        const overlay = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x080a10, 0.86)
          .setInteractive();

        const card = this.add.graphics();
        card.fillStyle(0x162229, 0.98);
        card.fillRoundedRect(cx - 415, cy - 195, 830, 390, 18);
        card.lineStyle(4, 0xffd166, 1);
        card.strokeRoundedRect(cx - 415, cy - 195, 830, 390, 18);
        card.lineStyle(2, 0x52b788, 0.9);
        card.strokeRoundedRect(cx - 403, cy - 183, 806, 366, 14);

        const title = this.add.text(cx, cy - 134, STRINGS.VICTORY_ACT2_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '36px',
          fontStyle: 'bold',
          color: '#ffd166',
          padding: { top: 4, bottom: 6 }
        }).setOrigin(0.5);

        const msg = this.add.text(cx, cy - 58, STRINGS.VICTORY_ACT2_TEXT, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 760 },
          lineSpacing: 8,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);

        const sub = this.add.text(cx, cy + 8, STRINGS.VICTORY_ACT2_SUBTEXT, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'italic bold',
          color: '#80ed99',
          align: 'center',
          wordWrap: { width: 760 }
        }).setOrigin(0.5);

        const stats = this.add.text(
          cx,
          cy + 52,
          `✦ Зібрано червінців: ${this.finalCoins}   |   Подолано лісової нечисті: ${this.finalStunned} ✦`,
          {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#a8dadc',
            backgroundColor: '#0f172a',
            padding: { x: 16, y: 6 }
          }
        ).setOrigin(0.5);

        // Button 1: Proceed to Act III ("На Дніпрі") with Swamp Frogs & Saber equipped!
        const btn1Bg = this.add.rectangle(cx - 165, cy + 126, 390, 48, 0x0077b6, 1)
          .setStrokeStyle(2.5, 0xffea00)
          .setInteractive({ useHandCursor: true });

        const btn1Lbl = this.add.text(cx - 165, cy + 126, STRINGS.ENTER_DNIPRO_ACT3, {
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
          this.launchDniproAct3();
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

      showAct2VictoryModal() {
        this.frogModal.setVisible(false);
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
        if (this.stage === 'WALK_IN') {
          this.omelko.x = 325;
          this.stage = 'DIALOGUE';
          this.bubbleContainer.setVisible(true);
          this.showDialogueLine(0);
        } else if (this.stage === 'DIALOGUE') {
          this.showDialogueLine(this.lineIndex + 1);
        } else if (this.stage === 'FROG_MODAL') {
          if (this.time.now < this.modalReadyTime) return;
          this.showAct2VictoryModal();
        } else if (this.stage === 'VICTORY_MODAL') {
          if (this.time.now < this.modalReadyTime) return;
          this.launchDniproAct3();
        }
      }

      launchDniproAct3() {
        SFX.waterSplash();
        GAME_STATE.currentLevel = 3;
        GAME_STATE.hasSaber = true;
        GAME_STATE.hasSwampFrogs = true;
        GAME_STATE.savedCoins = this.finalCoins;
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