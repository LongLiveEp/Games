
    /**
     * ============================================================================
     * 11B. ACT 1 FINALE SCENE: KUM HRYTSKO'S KHATA ON THE OUTSKIRTS
     * Dialogue about missing salt, receiving the Cossack Saber, and Act 1 Victory!
     * ============================================================================
     */
    class HrytskoScene extends Phaser.Scene {
      constructor() {
        super('HrytskoScene');
      }

      init(data) {
        this.finalCoins = (data && data.coins !== undefined) ? data.coins : 0;
        this.finalStunned = (data && data.enemiesStunned !== undefined) ? data.enemiesStunned : 0;
      }

      create() {
        this.cameras.main.fadeIn(420, 18, 19, 26);
        this.lineIndex = 0;
        this.stage = 'DIALOGUE'; // DIALOGUE -> SABER_MODAL -> VICTORY_MODAL
        this.modalReadyTime = 0;
        SFX.playMusic('mus_hut', { volume: 0.38 });

        // 1. Draw Outskirts Courtyard & Kum Hrytsko's Khata
        this.drawOutskirtsCourtyard();

        // 2. Place Characters: Cossack Omelko, Stocky Pot-bellied Kum Hrytsko, and Pacified Rooster in Barrel
        this.omelko = this.add.image(330, 412, 'cossack').setScale(1.3);
        this.hrytsko = this.add.image(560, 410, 'npc_hrytsko').setScale(1.32).setFlipX(true);

        // Breathing idle animations
        this.tweens.add({
          targets: this.hrytsko,
          scaleY: 1.37,
          scaleX: 1.28,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        this.tweens.add({
          targets: this.omelko,
          y: 410,
          duration: 950,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Comical pacified Mad Rooster upside-down in a barrel near the fence
        const barrelX = 205, barrelY = 420;
        const propBarrel = this.add.image(barrelX, barrelY, 'prop_barrel').setScale(1.15);
        const roosterFeet = this.add.image(barrelX, barrelY - 26, 'boss_rooster')
          .setScale(0.55)
          .setFlipY(true);
        this.tweens.add({
          targets: [propBarrel, roosterFeet],
          angle: { from: -6, to: 6 },
          duration: 300,
          yoyo: true,
          repeat: -1
        });

        // Top Header & Skip Hint
        this.add.text(24, 16, STRINGS.HRYTSKO_HEADER, {
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          stroke: '#14161f',
          strokeThickness: 3
        });

        this.skipHint = this.add.text(CONFIG.WIDTH - 24, 16, STRINGS.HRYTSKO_SKIP_HINT, {
          fontSize: '14px',
          color: '#f5ebe0',
          stroke: '#14161f',
          strokeThickness: 3
        }).setOrigin(1, 0);

        // 3. Speech Bubble Container
        this.bubbleContainer = this.add.container(450, 225).setDepth(50);
        this.bubbleBg = this.add.graphics();
        this.speakerText = this.add.text(-280, -48, '', {
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#c1121f'
        });
        this.dialogueText = this.add.text(-280, -20, '', {
          fontSize: '19px',
          color: '#1d1e2c',
          wordWrap: { width: 560 },
          lineSpacing: 5
        });
        this.bubbleContainer.add([this.bubbleBg, this.speakerText, this.dialogueText]);

        // 4. Create Saber Item Acquired Modal (same style as Frying Pan in HutScene)
        this.createSaberModal();

        // 5. Create Act 1 Finale / Victory Modal
        this.createFinaleVictoryModal();

        // 6. Input Listeners
        this.transitioningOut = false;
        this.input.keyboard.on('keydown-ENTER', () => this.onAdvance());
        this.input.keyboard.on('keydown-SPACE', () => this.onAdvance());
        this.input.keyboard.on('keydown-D', () => this.onAdvance());
        this.input.keyboard.on('keydown-TAB', (e) => {
          if (e && e.preventDefault) e.preventDefault();
          if (this.stage !== 'VICTORY_MODAL') {
            this.showFinaleVictoryModal();
          }
        });
        this.input.on('pointerdown', (pointer) => {
          if (this.stage === 'VICTORY_MODAL') {
            const cx = CONFIG.WIDTH / 2;
            const cy = CONFIG.HEIGHT / 2;
            if (pointer.x >= cx - 205 && pointer.x <= cx + 205 && pointer.y >= cy + 94 && pointer.y <= cy + 154) {
              this.launchEvilForestAct2();
            }
            return;
          }
          this.onAdvance();
        });

        // Start dialogue
        this.showDialogueLine(0);
      }

      drawOutskirtsCourtyard() {
        const bg = this.add.graphics();

        // Warm golden sunset sky at the edge of the village and forest
        bg.fillGradientStyle(0x2b2d42, 0x3d405b, 0xe07a5f, 0xf4a261, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, 435);

        // Setting sun glow over distant steppe & forest
        bg.fillStyle(0xffd166, 0.75);
        bg.fillCircle(175, 250, 68);

        // Distant forest silhouettes on the left (leading to Act 2)
        bg.fillStyle(0x1f3528, 1);
        for (let tx = 20; tx <= 320; tx += 55) {
          bg.fillCircle(tx, 335, 45);
          bg.fillCircle(tx + 22, 350, 38);
        }

        // Rolling green meadow & courtyard ground
        bg.fillStyle(0x4a6b3b, 1);
        bg.fillRect(0, 365, CONFIG.WIDTH, 175);
        bg.fillStyle(0x8c6d46, 1);
        bg.fillEllipse(460, 445, 760, 90);

        // Wattle fence (тинок) along the back
        bg.lineStyle(3, 0x5c3c24, 1);
        for (let fx = 40; fx < 500; fx += 34) {
          bg.lineBetween(fx, 335, fx, 395);
        }
        for (let fy = 348; fy <= 388; fy += 12) {
          bg.lineBetween(30, fy, 510, fy);
        }

        // Wooden Beehive (вулик) & Sunflowers in Hrytsko's yard
        bg.fillStyle(0xd4a373, 1);
        bg.fillRoundedRect(105, 335, 38, 48, 5);
        bg.fillStyle(0x6f4518, 1);
        bg.fillTriangle(98, 338, 150, 338, 124, 315);

        // Kum Hrytsko's Whitewashed Khata on the right
        const hx = 520, hy = 205;
        // Clay prizba base
        bg.fillStyle(0x7f5539, 1);
        bg.fillRoundedRect(hx - 12, hy + 190, 390, 26, 4);
        // Whitewashed walls
        bg.fillStyle(0xfbf8f1, 1);
        bg.fillRect(hx, hy + 55, 365, 140);
        bg.fillStyle(0xe6dfd3, 1);
        bg.fillRect(hx, hy + 55, 95, 140);
        // Heavy carved oak door
        bg.fillStyle(0x583101, 1);
        bg.fillRoundedRect(hx + 115, hy + 98, 58, 97, 5);
        bg.fillStyle(0x8a5a36, 1);
        bg.fillRect(hx + 122, hy + 105, 44, 90);
        // Windows with blue shutters
        [hx + 28, hx + 215, hx + 290].forEach(wx => {
          bg.fillStyle(0x457b9d, 1);
          bg.fillRoundedRect(wx - 8, hy + 96, 54, 48, 3);
          bg.fillStyle(0xffea00, 0.85);
          bg.fillRect(wx, hy + 100, 38, 40);
          bg.lineStyle(2.5, 0x583101, 1);
          bg.strokeRect(wx, hy + 100, 38, 40);
          bg.lineBetween(wx + 19, hy + 100, wx + 19, hy + 140);
          bg.lineBetween(wx, hy + 120, wx + 38, hy + 120);
        });
        // Lush Thatched Roof (солом'яна стріха з димарем)
        bg.fillStyle(0xd9ed92, 1);
        bg.fillRect(hx + 245, hy - 25, 32, 45);
        bg.fillStyle(0x523a28, 1);
        bg.fillTriangle(hx - 35, hy + 65, hx + 395, hy + 65, hx + 185, hy - 22);
        bg.fillStyle(0x8c7051, 1);
        bg.fillTriangle(hx - 24, hy + 60, hx + 388, hy + 60, hx + 185, hy - 18);

        // Waypost Sign on the left pointing toward Act 2 ("← Ліс, Дніпро і Степ")
        bg.fillStyle(0x583101, 1);
        bg.fillRect(72, 330, 10, 95);
        bg.fillStyle(0xe9c46a, 1);
        bg.fillRoundedRect(18, 342, 128, 28, 5);
        this.add.text(82, 356, '← Ліс і Дніпро', {
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#3d2314'
        }).setOrigin(0.5);
      }

      showDialogueLine(index) {
        if (index >= STRINGS.HRYTSKO_LINES.length) {
          this.showSaberModal();
          return;
        }

        this.lineIndex = index;
        const line = STRINGS.HRYTSKO_LINES[index];
        SFX.speechBlip();

        const isHrytsko = line.speaker.includes('Грицько');
        const targetX = isHrytsko ? 515 : 375;
        const tailX = isHrytsko ? 45 : -45;

        if (isHrytsko) {
          this.tweens.add({ targets: this.hrytsko, y: 400, duration: 130, yoyo: true });
        } else {
          this.tweens.add({ targets: this.omelko, y: 400, duration: 130, yoyo: true });
        }

        this.bubbleContainer.setPosition(targetX, 245);
        this.bubbleBg.clear();
        this.bubbleBg.fillStyle(0xfefae0, 0.98);
        this.bubbleBg.lineStyle(4, isHrytsko ? 0x2d6a4f : 0xc1121f, 1);
        this.bubbleBg.fillRoundedRect(-300, -62, 600, 130, 16);
        this.bubbleBg.strokeRoundedRect(-300, -62, 600, 130, 16);
        this.bubbleBg.fillTriangle(tailX - 14, 68, tailX + 14, 68, tailX, 92);

        this.speakerText.setText(line.speaker + ':');
        this.speakerText.setColor(isHrytsko ? '#2d6a4f' : '#c1121f');
        this.dialogueText.setText('«' + line.text + '»');

        this.bubbleContainer.setScale(0.85);
        this.tweens.add({
          targets: this.bubbleContainer,
          scale: 1,
          duration: 180,
          ease: 'Back.easeOut'
        });

        if (this.autoTimer) this.autoTimer.remove();
        this.autoTimer = this.time.delayedCall(5200, () => {
          if (this.stage === 'DIALOGUE') {
            this.showDialogueLine(this.lineIndex + 1);
          }
        });
      }

      createSaberModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.saberModal = this.add.container(0, 0).setDepth(150).setVisible(false);

        const dim = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0d0e15, 0.8);

        const card = this.add.graphics();
        card.fillStyle(0x1d1e2c, 0.98);
        card.fillRoundedRect(cx - 295, cy - 190, 590, 380, 18);
        card.lineStyle(4, 0xffd166, 1);
        card.strokeRoundedRect(cx - 295, cy - 190, 590, 380, 18);
        card.lineStyle(2, 0xc1121f, 0.9);
        card.strokeRoundedRect(cx - 285, cy - 180, 570, 360, 14);

        const headerTxt = this.add.text(cx, cy - 152, STRINGS.ITEM_ACQUIRED_HEADER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          letterSpacing: 2,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);

        const titleTxt = this.add.text(cx, cy - 104, STRINGS.ITEM_SABER_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '27px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 2,
          padding: { top: 4, bottom: 6 }
        }).setOrigin(0.5);

        const glow = this.add.circle(cx, cy + 4, 64, 0xffd166, 0.16)
          .setStrokeStyle(2, 0xffd166, 0.55);

        this.tweens.add({
          targets: glow,
          scaleX: 1.08,
          scaleY: 1.08,
          alpha: 0.3,
          duration: 800,
          yoyo: true,
          repeat: -1
        });

        // Draw Authentic Ornate Cossack Saber (Козацька шабля кума Грицька)
        const saberArt = this.add.graphics();
        const sx = cx;
        const sy = cy + 4;

        const quadTo = (x0, y0, cx1, cy1, x1, y1, steps = 28) => {
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const inv = 1 - t;
            const px = inv * inv * x0 + 2 * inv * t * cx1 + t * t * x1;
            const py = inv * inv * y0 + 2 * inv * t * cy1 + t * t * y1;
            saberArt.lineTo(px, py);
          }
        };

        // 1. Blade Body (Solid Damascus steel with seamless authentic Cossack curve)
        saberArt.fillStyle(0xd5dde5, 1);
        saberArt.beginPath();
        saberArt.moveTo(sx - 34, sy + 3);
        quadTo(sx - 34, sy + 3, sx + 24, sy - 14, sx + 98, sy - 28, 32);
        quadTo(sx + 98, sy - 28, sx + 74, sy - 17, sx + 40, sy - 5, 20);
        quadTo(sx + 40, sy - 5, sx + 4, sy + 4, sx - 34, sy + 13, 24);
        saberArt.closePath();
        saberArt.fillPath();

        // 2. Upper spine bevel / blade shading
        saberArt.fillStyle(0x94a3b8, 1);
        saberArt.beginPath();
        saberArt.moveTo(sx - 34, sy + 3);
        quadTo(sx - 34, sy + 3, sx + 24, sy - 14, sx + 98, sy - 28, 32);
        quadTo(sx + 98, sy - 28, sx + 24, sy - 10, sx - 34, sy + 7, 32);
        saberArt.closePath();
        saberArt.fillPath();

        // 3. Damascus steel watered pattern ripples (візерунок дамаської сталі)
        saberArt.lineStyle(1, 0x64748b, 0.45);
        for (let i = 0; i < 7; i++) {
          const rx = sx - 22 + i * 15;
          const ry = sy + 3 - i * 4;
          saberArt.lineBetween(rx, ry, rx + 8, ry - 3);
        }

        // 4. Mirror-sheen Fuller / Blood Groove (Діл) running down blade center
        saberArt.lineStyle(2.2, 0x475569, 0.85);
        saberArt.beginPath();
        saberArt.moveTo(sx - 31, sy + 7);
        quadTo(sx - 31, sy + 7, sx + 20, sy - 8, sx + 72, sy - 20, 24);
        saberArt.strokePath();

        saberArt.lineStyle(1.4, 0xffffff, 0.95);
        saberArt.beginPath();
        saberArt.moveTo(sx - 31, sy + 6);
        quadTo(sx - 31, sy + 6, sx + 20, sy - 9, sx + 72, sy - 21, 24);
        saberArt.strokePath();

        // 5. Razor-sharp cutting edge highlight
        saberArt.lineStyle(1.8, 0xffffff, 1);
        saberArt.beginPath();
        saberArt.moveTo(sx - 34, sy + 13);
        quadTo(sx - 34, sy + 13, sx + 4, sy + 4, sx + 40, sy - 5, 24);
        quadTo(sx + 40, sy - 5, sx + 74, sy - 17, sx + 98, sy - 28, 20);
        saberArt.strokePath();

        // 6. Golden Cossack Crossguard (Хрестовина з кульками та щитком)
        saberArt.lineStyle(5.5, 0xd4a373, 1);
        saberArt.lineBetween(sx - 39, sy - 15, sx - 29, sy + 25);
        saberArt.lineStyle(3, 0xffd166, 1);
        saberArt.lineBetween(sx - 39, sy - 15, sx - 29, sy + 25);
        // Quillon terminal globes (золоті кульки на кінчиках хрестовини)
        saberArt.fillStyle(0xffd166, 1);
        saberArt.fillCircle(sx - 39, sy - 15, 4.5);
        saberArt.fillCircle(sx - 29, sy + 25, 4.5);
        // Central decorative diamond boss (перехрестя)
        saberArt.fillStyle(0xd90429, 1);
        saberArt.fillCircle(sx - 34, sy + 7, 5);
        saberArt.fillStyle(0xffea00, 1);
        saberArt.fillCircle(sx - 34, sy + 7, 2.5);

        // 7. Ergonomic Cossack Karabela Grip (Анатомічне руків'я з мореного дуба)
        saberArt.lineStyle(8.5, 0x3d2314, 1);
        saberArt.beginPath();
        saberArt.moveTo(sx - 35, sy + 7);
        quadTo(sx - 35, sy + 7, sx - 58, sy + 15, sx - 78, sy + 22, 16);
        saberArt.strokePath();

        // Golden wire wrapping rings on grip
        saberArt.lineStyle(2, 0xffd166, 0.95);
        for (let w = 0; w < 4; w++) {
          const wx = sx - 44 - w * 8;
          const wy = sy + 10 + w * 3;
          saberArt.lineBetween(wx - 1, wy - 4, wx + 1, wy + 4);
        }

        // 8. Eagle-head Cossack Pommel (Навершя карабелі)
        saberArt.fillStyle(0xffd166, 1);
        saberArt.beginPath();
        saberArt.moveTo(sx - 77, sy + 18);
        saberArt.lineTo(sx - 88, sy + 24);
        saberArt.lineTo(sx - 90, sy + 32);
        saberArt.lineTo(sx - 81, sy + 30);
        saberArt.lineTo(sx - 75, sy + 24);
        saberArt.closePath();
        saberArt.fillPath();

        // 9. Lanyard Ring and Crimson Cossack Tassel (Темляк)
        saberArt.lineStyle(2, 0xffd166, 1);
        saberArt.strokeCircle(sx - 83, sy + 34, 3.5);
        // Silk cord
        saberArt.lineStyle(2.5, 0xc1121f, 1);
        saberArt.beginPath();
        saberArt.moveTo(sx - 83, sy + 37);
        quadTo(sx - 83, sy + 37, sx - 82, sy + 44, sx - 79, sy + 50, 12);
        saberArt.strokePath();
        // Golden tassel collar
        saberArt.fillStyle(0xffd166, 1);
        saberArt.fillRect(sx - 82, sy + 50, 7, 3);
        // Flowing crimson silk tassel
        saberArt.fillStyle(0xc1121f, 1);
        saberArt.fillTriangle(sx - 82, sy + 53, sx - 75, sy + 53, sx - 78, sy + 64);
        saberArt.fillTriangle(sx - 84, sy + 54, sx - 78, sy + 64, sx - 81, sy + 65);
        saberArt.fillTriangle(sx - 79, sy + 54, sx - 73, sy + 54, sx - 75, sy + 65);

        // 10. Gleaming sharp steel sparkles at blade edge and tip
        saberArt.fillStyle(0xffea00, 1);
        saberArt.fillRect(sx + 98, sy - 34, 3, 13);
        saberArt.fillRect(sx + 93, sy - 29, 13, 3);
        saberArt.fillStyle(0x00f5d4, 1);
        saberArt.fillRect(sx + 36, sy - 10, 2.5, 9);
        saberArt.fillRect(sx + 33, sy - 7, 9, 2.5);

        const badgeTxt = this.add.text(cx, cy + 84, STRINGS.ITEM_SABER_BADGE, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffd166',
          backgroundColor: '#2b2d42',
          padding: { x: 12, y: 4 }
        }).setOrigin(0.5);

        const descTxt = this.add.text(cx, cy + 132, STRINGS.ITEM_SABER_DESC, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '21px',
          fontStyle: 'italic bold',
          color: '#f6e4b5',
          align: 'center',
          lineSpacing: 5,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);

        this.saberModal.add([dim, card, glow, headerTxt, titleTxt, saberArt, badgeTxt, descTxt]);
      }

      showSaberModal() {
        if (this.stage === 'SABER_MODAL' || this.stage === 'VICTORY_MODAL' || this.transitioningOut) return;
        if (this.autoTimer) {
          this.autoTimer.remove();
          this.autoTimer = null;
        }
        this.bubbleContainer.setVisible(false);
        this.skipHint.setVisible(false);
        this.stage = 'SABER_MODAL';
        this.modalReadyTime = this.time.now + 200;
        GAME_STATE.hasSaber = true;

        this.saberModal.setVisible(true);
        this.saberModal.setScale(1);
        SFX.itemFanfare();
      }

      createFinaleVictoryModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.victoryModal = this.add.container(0, 0).setDepth(210).setVisible(false);

        const overlay = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0b0c10, 0.85);

        const card = this.add.graphics();
        card.fillStyle(0x1d3557, 0.98);
        card.fillRoundedRect(cx - 410, cy - 190, 820, 380, 18);
        card.lineStyle(4, 0xffd166, 1);
        card.strokeRoundedRect(cx - 410, cy - 190, 820, 380, 18);
        card.lineStyle(2, 0xc1121f, 0.9);
        card.strokeRoundedRect(cx - 398, cy - 178, 796, 356, 14);

        const title = this.add.text(cx, cy - 130, STRINGS.VICTORY_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '36px',
          fontStyle: 'bold',
          color: '#ffd166',
          padding: { top: 4, bottom: 6 }
        }).setOrigin(0.5);

        const msg = this.add.text(cx, cy - 54, STRINGS.VICTORY_TEXT, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 750 },
          lineSpacing: 8,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);

        const sub = this.add.text(cx, cy + 10, STRINGS.VICTORY_SUBTEXT, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '17px',
          fontStyle: 'italic bold',
          color: '#f6e4b5',
          align: 'center',
          wordWrap: { width: 750 }
        }).setOrigin(0.5);

        const stats = this.add.text(
          cx,
          cy + 52,
          `✦ Зібрано червінців: ${this.finalCoins}   |   Ошелешено ворогів: ${this.finalStunned} ✦`,
          {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#a8dadc',
            backgroundColor: '#162238',
            padding: { x: 16, y: 6 }
          }
        ).setOrigin(0.5);

        this.victoryModal.add([overlay, card, title, msg, sub, stats]);

        this.act1BtnBg = this.add.rectangle(cx, cy + 124, 390, 50, 0x2d6a4f, 1)
          .setStrokeStyle(2.5, 0xffea00)
          .setScrollFactor(0)
          .setDepth(220)
          .setVisible(false)
          .setInteractive({ useHandCursor: true });

        this.act1BtnLbl = this.add.text(cx, cy + 124, STRINGS.ENTER_EVIL_FOREST, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '21px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(221).setVisible(false);

        this.act1BtnBg.on('pointerover', () => {
          this.act1BtnBg.setFillStyle(0x40916c, 1);
          SFX.speechBlip();
        });
        this.act1BtnBg.on('pointerout', () => {
          this.act1BtnBg.setFillStyle(0x2d6a4f, 1);
        });
        this.act1BtnBg.on('pointerdown', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          this.launchEvilForestAct2();
        });
        this.act1BtnBg.on('pointerup', (pointer, lx, ly, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          this.launchEvilForestAct2();
        });
      }

      showFinaleVictoryModal() {
        if (this.stage === 'VICTORY_MODAL' || this.transitioningOut) return;
        if (this.autoTimer) {
          this.autoTimer.remove();
          this.autoTimer = null;
        }
        this.bubbleContainer.setVisible(false);
        this.skipHint.setVisible(false);
        this.saberModal.setVisible(false);
        this.stage = 'VICTORY_MODAL';
        this.modalReadyTime = this.time.now + 180;
        GAME_STATE.hasSaber = true;

        this.victoryModal.setVisible(true);
        this.victoryModal.setScale(1);
        if (this.act1BtnBg) this.act1BtnBg.setVisible(true);
        if (this.act1BtnLbl) this.act1BtnLbl.setVisible(true);
        SFX.banduraStart();
      }

      onAdvance() {
        if (this.transitioningOut) return;
        if (this.stage === 'DIALOGUE') {
          this.showDialogueLine(this.lineIndex + 1);
        } else if (this.stage === 'SABER_MODAL') {
          if (this.time.now < this.modalReadyTime) return;
          this.showFinaleVictoryModal();
        } else if (this.stage === 'VICTORY_MODAL') {
          if (this.time.now < this.modalReadyTime) return;
          this.launchEvilForestAct2();
        }
      }

      launchEvilForestAct2() {
        if (this.transitioningOut) return;
        this.transitioningOut = true;
        if (this.autoTimer) {
          this.autoTimer.remove();
          this.autoTimer = null;
        }
        SFX.pickup();
        GAME_STATE.currentLevel = 2;
        GAME_STATE.hasSaber = true;
        GAME_STATE.savedCoins = this.finalCoins;
        this.scene.start('GameScene', { level: 2, coins: this.finalCoins });
      }
    }