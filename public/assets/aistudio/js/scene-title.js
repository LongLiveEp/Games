
    /**
     * ============================================================================
     * 5B. TITLE SCENE: PASTORAL UKRAINIAN LANDSCAPE & COSSACK CALLIGRAPHY COVER
     * Inspired by traditional Ukrainian village oil painting & Cossack baroque initials
     * ============================================================================
     */
    class TitleScene extends Phaser.Scene {
      constructor() {
        super('TitleScene');
      }

      create() {
        this.startingGame = false;
        this.transitionFastForward = false;
        this.difficultyModalOpen = false;
        this.selectedDiffIndex = GAME_STATE.difficulty === 'hardcore' ? 1 : 0;
        SFX.playMusic('mus_title', { volume: 0.40 });

        // 1. Paint Rich Pastoral Ukrainian Landscape (inspired by reference painting)
        this.drawPastoralLandscape();

        // 2. Add Cossack Omelko lounging on the haystack smoking his pipe (люлька)
        this.createLoungingOmelko();

        // 3. Draw Traditional Red & Black Geometric Embroidery Side Medallions (from font reference)
        this.drawEmbroideryBorders();

        // 4. Draw Ornate Cossack Baroque Calligraphic Title Banner ("В пошуках солі")
        this.drawCossackTitleBanner();

        // 5. Bottom Call-to-Action ("Натисніть Enter, щоб почати гру") & Author Credit ("Game by LongLiveEP")
        this.createBottomPrompts();

        // 6. Create Difficulty Selection Modal (shown after Wife calls Omelko into the Khata)
        this.createDifficultyModal();

        // 7. Input Handling (Enter, Space, Arrows, Click/Tap)
        this.input.keyboard.on('keydown-UP', () => {
          if (this.difficultyModalOpen) this.moveDifficultySelection(-1);
        });
        this.input.keyboard.on('keydown-DOWN', () => {
          if (this.difficultyModalOpen) this.moveDifficultySelection(1);
        });
        this.input.keyboard.on('keydown-W', () => {
          if (this.difficultyModalOpen) this.moveDifficultySelection(-1);
        });
        this.input.keyboard.on('keydown-S', () => {
          if (this.difficultyModalOpen) this.moveDifficultySelection(1);
        });
        this.input.keyboard.on('keydown-ENTER', () => {
          if (this.difficultyModalOpen) {
            this.confirmDifficultySelection();
          } else {
            this.startGame();
          }
        });
        this.input.keyboard.on('keydown-SPACE', () => {
          if (this.difficultyModalOpen) {
            this.confirmDifficultySelection();
          } else {
            this.startGame();
          }
        });
        this.input.on('pointerdown', () => {
          if (!this.difficultyModalOpen) {
            this.startGame();
          }
        });

        // Top Utility Buttons on Title Screen placed cleanly in the gap between banner (x=840) and embroidery (x=906)
        const makeTitleTopBtn = (cx, cy, width, label, onClick) => {
          const bg = this.add.rectangle(cx, cy, width, 30, 0x2b2d42, 0.94)
            .setStrokeStyle(1.5, 0xe9c46a)
            .setDepth(110)
            .setInteractive({ useHandCursor: true });
          const txt = this.add.text(cx, cy, label, {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff'
          }).setOrigin(0.5).setDepth(111);

          bg.on('pointerdown', (pointer, lx, ly, event) => {
            if (event && event.stopPropagation) event.stopPropagation();
            onClick();
          });
          return { bg, txt };
        };

        makeTitleTopBtn(873, 42, 48, '⛶', () => {
          toggleAppFullscreen();
        });

        const titleMute = makeTitleTopBtn(873, 80, 48, SFX.muted ? '🔇' : '🔊', () => {
          const muted = SFX.toggleMute();
          titleMute.txt.setText(muted ? '🔇' : '🔊');
        });
      }

      drawPastoralLandscape() {
        const bg = this.add.graphics();

        // Warm oil-painting sky gradient
        bg.fillGradientStyle(0xcfdbe6, 0xd8e2dc, 0xf4f1de, 0xf2e8cf, 1);
        bg.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        // Soft sunlit clouds
        bg.fillStyle(0xffffff, 0.65);
        bg.fillEllipse(210, 85, 190, 48);
        bg.fillEllipse(260, 78, 140, 42);
        bg.fillEllipse(720, 75, 220, 50);

        // --- DISTANT UKRAINIAN BAROQUE CHURCH WITH BLUE DOMES ON HILL (Top Center) ---
        const cx = 535, cy = 175;
        // Church white towers
        bg.fillStyle(0xf8f9fa, 1);
        bg.fillRect(cx - 42, cy - 35, 22, 55);
        bg.fillRect(cx - 14, cy - 58, 30, 75);
        bg.fillRect(cx + 22, cy - 32, 22, 52);
        // Subtle shading on towers
        bg.fillStyle(0xdee2e6, 1);
        bg.fillRect(cx - 26, cy - 35, 6, 55);
        bg.fillRect(cx + 8, cy - 58, 8, 75);
        bg.fillRect(cx + 38, cy - 32, 6, 52);
        // Narrow arched windows
        bg.fillStyle(0x495057, 1);
        bg.fillRect(cx - 33, cy - 22, 4, 14);
        bg.fillRect(cx - 4, cy - 42, 4, 18);
        bg.fillRect(cx + 4, cy - 42, 4, 18);
        bg.fillRect(cx + 31, cy - 20, 4, 14);
        // Iconic Blue Pear-shaped Baroque Domes
        bg.fillStyle(0x2b4c7e, 1);
        bg.fillCircle(cx - 31, cy - 40, 12);
        bg.fillTriangle(cx - 42, cy - 42, cx - 20, cy - 42, cx - 31, cy - 58);
        bg.fillCircle(cx + 1, cy - 64, 16);
        bg.fillTriangle(cx - 14, cy - 66, cx + 16, cy - 66, cx + 1, cy - 88);
        bg.fillCircle(cx + 33, cy - 37, 12);
        bg.fillTriangle(cx + 22, cy - 39, cx + 44, cy - 39, cx + 33, cy - 55);
        // Golden Spires & Crosses
        bg.lineStyle(2, 0xe9c46a, 1);
        [
          { x: cx - 31, y: cy - 58, h: 14 },
          { x: cx + 1, y: cy - 88, h: 18 },
          { x: cx + 33, y: cy - 55, h: 14 }
        ].forEach(dome => {
          bg.fillStyle(0xffd166, 1);
          bg.fillCircle(dome.x, dome.y, 3);
          bg.lineBetween(dome.x, dome.y, dome.x, dome.y - dome.h);
          bg.lineBetween(dome.x - 4, dome.y - dome.h + 5, dome.x + 4, dome.y - dome.h + 5);
        });

        // Lush green hillside trees around the church and pond
        const drawTreeCluster = (tx, ty, r, darkColor, midColor, lightColor) => {
          bg.fillStyle(0x4a3520, 1);
          bg.fillRect(tx - 5, ty, 10, r * 1.1);
          bg.fillStyle(darkColor, 1);
          bg.fillCircle(tx, ty - r * 0.2, r);
          bg.fillCircle(tx - r * 0.6, ty + r * 0.1, r * 0.75);
          bg.fillCircle(tx + r * 0.6, ty + r * 0.1, r * 0.75);
          bg.fillStyle(midColor, 1);
          bg.fillCircle(tx - r * 0.2, ty - r * 0.35, r * 0.78);
          bg.fillCircle(tx + r * 0.35, ty - r * 0.1, r * 0.65);
          bg.fillStyle(lightColor, 0.85);
          bg.fillCircle(tx - r * 0.25, ty - r * 0.5, r * 0.45);
        };

        drawTreeCluster(275, 195, 34, 0x3b5e2b, 0x557c3e, 0x7ea15b);
        drawTreeCluster(365, 185, 46, 0x2f5222, 0x4b7336, 0x739952);
        drawTreeCluster(485, 200, 38, 0x2a4d1e, 0x436b30, 0x698f48);
        drawTreeCluster(575, 205, 36, 0x2a4d1e, 0x436b30, 0x698f48);

        // Rolling pastoral hills & golden-green meadows
        bg.fillStyle(0x789652, 1);
        bg.fillEllipse(240, 275, 560, 140);
        bg.fillStyle(0x88a45e, 1);
        bg.fillEllipse(580, 295, 760, 160);
        bg.fillStyle(0x63823f, 1);
        bg.fillRect(0, 280, CONFIG.WIDTH, 260);

        // --- DISTANT SMALL KHATA & WOODEN WINDMILL ON LEFT HILL ---
        // Small distant cottage
        bg.fillStyle(0xf4f1de, 1);
        bg.fillRect(112, 202, 54, 24);
        bg.fillStyle(0xa98458, 1);
        bg.fillTriangle(104, 202, 174, 202, 139, 182);

        // Wooden Windmill Body
        bg.fillStyle(0x7f5539, 1);
        bg.fillTriangle(42, 232, 82, 232, 62, 165);
        bg.fillRect(49, 185, 26, 47);
        bg.fillStyle(0x583101, 1);
        bg.fillTriangle(45, 185, 79, 185, 62, 162);

        // Animated Windmill Sails (rotating slowly)
        this.windmillBlades = this.add.graphics({ x: 62, y: 186 });
        this.windmillBlades.lineStyle(3, 0x583101, 1);
        this.windmillBlades.fillStyle(0xe9c46a, 0.85);
        for (let i = 0; i < 4; i++) {
          const angle = i * (Math.PI / 2);
          const bx = Math.cos(angle) * 38;
          const by = Math.sin(angle) * 38;
          this.windmillBlades.lineBetween(0, 0, bx, by);
          this.windmillBlades.fillRect(bx * 0.35 - 4, by * 0.35 - 4, 12, 8);
        }

        // Golden Haystacks (Копиці сіна) on left hill
        bg.fillStyle(0xc9a24d, 1);
        bg.fillEllipse(55, 255, 58, 42);
        bg.fillStyle(0xddb85c, 1);
        bg.fillEllipse(135, 275, 76, 52);
        bg.fillStyle(0xb58d3d, 1);
        bg.fillRect(97, 282, 76, 12);

        // --- CALM VILLAGE POND WITH REFLECTIONS, REEDS & WOODEN BOAT ---
        bg.fillStyle(0xa3bac3, 1);
        bg.fillEllipse(345, 275, 310, 74);
        bg.fillStyle(0xc5d5dc, 0.85);
        bg.fillEllipse(330, 272, 230, 48);
        // Water shimmer lines
        bg.lineStyle(1.5, 0xffffff, 0.65);
        for (let wy = 256; wy <= 288; wy += 8) {
          bg.lineBetween(265 + (wy % 16) * 3, wy, 395 - (wy % 12) * 3, wy);
        }
        // Wooden rowboat moored on right bank of pond
        bg.fillStyle(0x5c3c24, 1);
        bg.fillEllipse(462, 284, 52, 16);
        bg.fillStyle(0x8a5a36, 1);
        bg.fillEllipse(462, 282, 44, 10);
        // Reeds & cattails (Очерет) around pond
        bg.lineStyle(2, 0x3a5a28, 1);
        for (let rx = 215; rx < 445; rx += 9) {
          if (rx > 295 && rx < 345) continue;
          const rh = 18 + (rx % 15);
          bg.lineBetween(rx, 305, rx + ((rx % 2 === 0) ? 4 : -3), 305 - rh);
        }
        // Plump golden haystack (копиця сіна) near pond bank where Omelko lounges
        bg.fillStyle(0xc99b38, 1);
        bg.fillEllipse(530, 316, 110, 44);
        bg.fillStyle(0xe9b842, 1);
        bg.fillEllipse(522, 308, 96, 38);
        bg.fillStyle(0xf4c95d, 1);
        bg.fillEllipse(548, 298, 76, 32);

        // --- WHITEWASHED UKRAINIAN KHATA WITH THATCHED ROOF (Right Side) ---
        // Khata walls in warm perspective
        bg.fillStyle(0xfbf8f1, 1);
        bg.fillRect(615, 240, 295, 95);
        bg.fillStyle(0xe8e2d5, 1);
        bg.fillRect(615, 240, 125, 95); // Shaded left wall
        // Clay foundation (Призьба)
        bg.fillStyle(0x9c7a54, 1);
        bg.fillRect(610, 322, 305, 18);
        // Wooden door & traditional windows with shutters
        bg.fillStyle(0xa47551, 1);
        bg.fillRect(698, 268, 22, 54);
        // Windows
        const drawKhataWindow = (wx, wy, ww, wh) => {
          bg.fillStyle(0x6b8e9b, 1);
          bg.fillRect(wx, wy, ww, wh);
          bg.lineStyle(2, 0x8a5a36, 1);
          bg.strokeRect(wx, wy, ww, wh);
          bg.lineBetween(wx + ww / 2, wy, wx + ww / 2, wy + wh);
          bg.lineBetween(wx, wy + wh / 2, wx + ww, wy + wh / 2);
        };
        drawKhataWindow(636, 268, 18, 22);
        drawKhataWindow(665, 268, 18, 22);
        drawKhataWindow(765, 265, 26, 28);
        drawKhataWindow(852, 262, 30, 30);
        // Red viburnum / floral accent painted above window
        bg.fillStyle(0xc1121f, 1);
        bg.fillCircle(816, 264, 4);
        bg.fillCircle(821, 268, 3.5);

        // Deep Thatched Roof (Солом'яна стріха)
        bg.fillStyle(0x523a28, 1);
        bg.fillTriangle(585, 250, 935, 242, 815, 160);
        bg.fillStyle(0x8c7051, 1);
        bg.fillTriangle(595, 244, 930, 236, 815, 162);
        bg.fillStyle(0xa68a64, 1);
        bg.fillTriangle(695, 240, 930, 236, 825, 164);
        // Thatch texture lines
        bg.lineStyle(1.5, 0x6e553b, 0.55);
        for (let tx = 620; tx < 910; tx += 14) {
          bg.lineBetween(815, 165, tx, 240);
        }

        // Winding Dirt Path & Lush Foreground Meadow
        bg.fillStyle(0x8c734b, 1);
        bg.fillEllipse(260, 415, 420, 160);
        bg.fillStyle(0x748e45, 1);
        bg.fillEllipse(490, 410, 480, 150);
        bg.fillStyle(0xb5986b, 1);
        bg.fillEllipse(220, 505, 440, 80);

        // --- WOODEN HAY CART (ВІЗ) IN MIDGROUND ---
        const vx = 320, vy = 372;
        bg.fillStyle(0xe6be53, 1);
        bg.fillEllipse(vx, vy - 18, 92, 36); // Hay load
        bg.lineStyle(3, 0x5c3c24, 1);
        bg.fillStyle(0x7f5539, 1);
        bg.fillRect(vx - 42, vy - 14, 84, 16);
        // Rungs
        for (let rx = vx - 36; rx <= vx + 36; rx += 12) {
          bg.lineBetween(rx, vy - 22, rx, vy + 2);
        }
        // Spoked wooden wheels & shaft
        bg.lineBetween(vx + 36, vy - 4, vx + 82, vy + 14);
        [vx - 26, vx + 22].forEach(wx => {
          bg.strokeCircle(wx, vy + 8, 15);
          bg.lineBetween(wx - 15, vy + 8, wx + 15, vy + 8);
          bg.lineBetween(wx, vy - 7, wx, vy + 23);
        });

        // --- BROWN HORNED OX / BULL ON LEFT FOREGROUND ---
        const oxX = 85, oxY = 398;
        // Body & shoulders
        bg.fillStyle(0x7f4f24, 1);
        bg.fillEllipse(oxX - 35, oxY + 18, 120, 75);
        // Head
        bg.fillStyle(0x9c6634, 1);
        bg.fillRoundedRect(oxX - 8, oxY - 18, 46, 52, 12);
        // Snout
        bg.fillStyle(0xd4a373, 1);
        bg.fillEllipse(oxX + 15, oxY + 26, 28, 18);
        // Eyes & Ears
        bg.fillStyle(0x1d1e2c, 1);
        bg.fillCircle(oxX + 3, oxY - 2, 3.5);
        bg.fillCircle(oxX + 27, oxY - 2, 3.5);
        // Curved Ox Horns
        bg.lineStyle(4, 0xe9d8a6, 1);
        bg.beginPath();
        bg.arc(oxX - 8, oxY - 24, 18, 0.4, 2.5, false);
        bg.strokePath();
        bg.beginPath();
        bg.arc(oxX + 38, oxY - 24, 18, 0.6, 2.7, false);
        bg.strokePath();

        // --- PROUD ROOSTER & HENS IN BOTTOM-CENTER FOREGROUND ---
        // Speckled Grey Hen & Brown Hen pecking near dish
        bg.fillStyle(0x6c757d, 1);
        bg.fillEllipse(230, 488, 44, 30);
        bg.fillCircle(248, 476, 10);
        bg.fillStyle(0xadb5bd, 1);
        bg.fillEllipse(226, 488, 28, 18);

        bg.fillStyle(0x8d5524, 1);
        bg.fillEllipse(255, 452, 34, 26);
        bg.fillCircle(262, 436, 9);

        bg.fillStyle(0xb5651d, 1);
        bg.fillEllipse(318, 484, 52, 32);

        // Proud Rooster (White/Golden Neck, Dark Green/Black Tail, Red Comb)
        const rx = 385, ry = 468;
        // Arching dark iridescent tail feathers
        bg.fillStyle(0x101820, 1);
        bg.fillEllipse(rx + 48, ry - 4, 58, 36);
        bg.fillTriangle(rx + 25, ry - 18, rx + 82, ry - 12, rx + 76, ry + 26);
        bg.fillStyle(0x1b4332, 1);
        bg.fillEllipse(rx + 42, ry - 8, 44, 24);
        // Dark underbody & legs
        bg.fillStyle(0x1d1e2c, 1);
        bg.fillEllipse(rx + 4, ry + 12, 48, 28);
        bg.lineStyle(3, 0xe9c46a, 1);
        bg.lineBetween(rx - 4, ry + 22, rx - 8, ry + 42);
        bg.lineBetween(rx + 12, ry + 22, rx + 16, ry + 42);
        // Golden-white hackle/neck & wing
        bg.fillStyle(0xfefae0, 1);
        bg.fillEllipse(rx - 8, ry - 6, 42, 34);
        bg.fillTriangle(rx - 30, ry - 26, rx + 2, ry - 4, rx - 18, ry + 12);
        bg.fillStyle(0xe9c46a, 1);
        bg.fillEllipse(rx + 2, ry + 2, 34, 20);
        // Red Comb & Wattle
        bg.fillStyle(0xd62828, 1);
        bg.fillCircle(rx - 28, ry - 32, 7);
        bg.fillCircle(rx - 22, ry - 34, 6);
        bg.fillCircle(rx - 30, ry - 20, 5);
        // Beak
        bg.fillStyle(0xffb703, 1);
        bg.fillTriangle(rx - 34, ry - 26, rx - 44, ry - 23, rx - 34, ry - 20);

        // --- WATTLE FENCE (ТИНОК), CLAY POT (ГЛЕЧИК), SUNFLOWERS & MALLOWS (Right Foreground) ---
        // Wattle fence & inverted clay pot on stake
        bg.lineStyle(3, 0x4a3520, 1);
        for (let fx = 720; fx <= 900; fx += 28) {
          bg.lineBetween(fx, 355, fx, 435);
        }
        for (let fy = 372; fy <= 425; fy += 12) {
          bg.lineBetween(710, fy, 915, fy - 6);
        }
        // Clay pot (Глечик) on fence post
        bg.fillStyle(0xa67c52, 1);
        bg.fillEllipse(765, 338, 42, 48);
        bg.fillStyle(0x7f5539, 1);
        bg.fillEllipse(765, 326, 36, 22);

        // Lush Green Foliage base in bottom-right corner
        bg.fillStyle(0x2d4c1e, 1);
        bg.fillEllipse(760, 465, 420, 190);
        bg.fillStyle(0x3a6326, 1);
        bg.fillEllipse(680, 485, 320, 140);

        // Helper to draw vibrant Sunflowers (Соняшники)
        const drawSunflower = (sx, sy, radius) => {
          const petals = 18;
          for (let i = 0; i < petals; i++) {
            const ang = (i / petals) * Math.PI * 2;
            const px = sx + Math.cos(ang) * (radius * 0.85);
            const py = sy + Math.sin(ang) * (radius * 0.85);
            bg.fillStyle(i % 2 === 0 ? 0xffbe0b : 0xfb8500, 1);
            bg.fillCircle(px, py, radius * 0.28);
          }
          bg.fillStyle(0x3d2314, 1);
          bg.fillCircle(sx, sy, radius * 0.52);
          bg.fillStyle(0x6f4518, 1);
          bg.fillCircle(sx - 3, sy - 3, radius * 0.35);
        };

        drawSunflower(692, 405, 42);
        drawSunflower(875, 345, 52);

        // Pink Mallows (Мальви), Red Poppies (Маки) & Chamomile flowers
        const flowers = [
          { x: 632, y: 372, r: 16, c: 0xe56b8f, center: 0x7209b7 },
          { x: 618, y: 425, r: 18, c: 0xe56b8f, center: 0x7209b7 },
          { x: 658, y: 448, r: 15, c: 0xd90429, center: 0x1d1e2c },
          { x: 785, y: 432, r: 16, c: 0xef233c, center: 0x1d1e2c },
          { x: 825, y: 428, r: 15, c: 0xf77f00, center: 0x3d2314 },
          { x: 755, y: 492, r: 14, c: 0xf77f00, center: 0x3d2314 },
          { x: 615, y: 505, r: 16, c: 0xd90429, center: 0x1d1e2c },
          { x: 912, y: 485, r: 13, c: 0xfefae0, center: 0xffbe0b },
          { x: 882, y: 502, r: 13, c: 0xfefae0, center: 0xffbe0b }
        ];
        flowers.forEach(f => {
          bg.fillStyle(f.c, 1);
          bg.fillCircle(f.x - 5, f.y - 4, f.r * 0.65);
          bg.fillCircle(f.x + 5, f.y - 4, f.r * 0.65);
          bg.fillCircle(f.x - 4, f.y + 5, f.r * 0.65);
          bg.fillCircle(f.x + 4, f.y + 5, f.r * 0.65);
          bg.fillStyle(f.center, 1);
          bg.fillCircle(f.x, f.y, f.r * 0.32);
        });
      }

      createLoungingOmelko() {
        // Position on the golden haystack between the pond and the khata
        this.hayX = 528;
        this.hayY = 296;
        this.khataDoorX = 709;
        this.khataDoorY = 298;

        // Container for reclining Omelko on the hay pile
        this.recliningOmelko = this.add.container(this.hayX, this.hayY);
        const og = this.add.graphics();

        // Boots crossed comfortably at the left end of the hay
        og.fillStyle(0x3a2010, 1);
        og.fillRoundedRect(-42, 2, 14, 9, 3);
        og.fillRoundedRect(-36, -4, 14, 9, 3);

        // Wide red sharovary pants reclining
        og.fillStyle(0xd92b2b, 1);
        og.fillEllipse(-14, 4, 38, 18);

        // Blue sash (пояс)
        og.fillStyle(0x1f57a4, 1);
        og.fillRoundedRect(0, -5, 7, 17, 2);

        // White vyshyvanka torso propped against the right side of the hay sheaf
        og.fillStyle(0xf7f4eb, 1);
        og.fillRoundedRect(2, -14, 24, 18, 6);
        // Red embroidery on collar/chest
        og.fillStyle(0xd92b2b, 1);
        og.fillRect(10, -11, 10, 3);

        // Head leaning back peacefully
        og.fillStyle(0xf2bfa0, 1);
        og.fillCircle(20, -22, 8);

        // Oseledets (чуб) & long mustache
        og.fillStyle(0x1c1613, 1);
        og.beginPath();
        og.moveTo(22, -30);
        og.lineTo(31, -34);
        og.lineTo(26, -26);
        og.closePath();
        og.fillPath();
        // Happy squinting eye
        og.fillRect(15, -24, 4, 1.8);
        // Mustache
        og.fillRoundedRect(8, -19, 13, 3, 1);

        // Traditional curved Cossack pipe (люлька) with glowing ember
        og.lineStyle(2.5, 0x5c3c24, 1);
        og.lineBetween(12, -17, -2, -22);
        og.fillStyle(0x8d5524, 1);
        og.fillRoundedRect(-7, -28, 7, 8, 2);
        og.fillStyle(0xff5400, 1);
        og.fillCircle(-3.5, -29, 2.5);

        // Golden straw stalks tucked in front for depth
        og.lineStyle(2, 0xe9b842, 0.9);
        og.lineBetween(-28, 12, 18, 8);
        og.lineBetween(-15, 14, 26, 6);

        this.recliningOmelko.add(og);

        // Gentle breathing tween while lounging on the hay
        this.tweens.add({
          targets: this.recliningOmelko,
          y: this.hayY - 2,
          duration: 1400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Periodic fragrant smoke rings rising from Omelko's pipe
        this.pipeSmokeTimer = this.time.addEvent({
          delay: 950,
          loop: true,
          callback: () => {
            if (!this.recliningOmelko || !this.recliningOmelko.visible) return;
            const puffX = this.hayX - 5 + Phaser.Math.Between(-3, 3);
            const puffY = this.hayY - 32;
            const puff = this.add.circle(puffX, puffY, 4, 0xf8f9fa, 0.65);
            puff.setStrokeStyle(1.5, 0xe9ecef, 0.8);

            this.tweens.add({
              targets: puff,
              x: puffX - Phaser.Math.Between(12, 28),
              y: puffY - Phaser.Math.Between(36, 54),
              scaleX: 2.3,
              scaleY: 1.9,
              alpha: 0,
              duration: 2200,
              ease: 'Sine.easeOut',
              onComplete: () => puff.destroy()
            });
          }
        });

        // Hidden Wife & Standing Omelko sprites used when Enter is pressed
        this.doorWife = this.add.image(this.khataDoorX, this.khataDoorY, 'npc_wife')
          .setScale(0.76)
          .setFlipX(true)
          .setVisible(false);

        this.walkingOmelko = this.add.image(this.hayX, this.hayY - 4, 'cossack')
          .setScale(0.78)
          .setVisible(false);
      }

      drawEmbroideryBorders() {
        // Traditional Ukrainian Rushnyk geometric square blocks on left & right edges (inspired by font reference)
        const border = this.add.graphics();
        const tileSize = 48;
        const marginY = 14;

        const drawOrnamentTile = (x, y, colorHex) => {
          // Outer & inner frames
          border.fillStyle(0xf8f3e6, 0.92);
          border.fillRect(x, y, tileSize, tileSize);
          border.lineStyle(2, colorHex, 1);
          border.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
          border.strokeRect(x + 6, y + 6, tileSize - 12, tileSize - 12);

          // Central diamond & 8-pointed Cossack star (Алатир / Ружа)
          const mx = x + tileSize / 2;
          const my = y + tileSize / 2;
          border.lineBetween(mx, y + 6, x + tileSize - 6, my);
          border.lineBetween(x + tileSize - 6, my, mx, y + tileSize - 6);
          border.lineBetween(mx, y + tileSize - 6, x + 6, my);
          border.lineBetween(x + 6, my, mx, y + 6);

          // Cross lines & corner dots
          border.lineBetween(mx, y + 2, mx, y + tileSize - 2);
          border.lineBetween(x + 2, my, x + tileSize - 2, my);
          border.fillStyle(colorHex, 1);
          border.fillRect(mx - 4, my - 4, 8, 8);
          border.fillRect(x + 9, y + 9, 4, 4);
          border.fillRect(x + tileSize - 13, y + 9, 4, 4);
          border.fillRect(x + 9, y + tileSize - 13, 4, 4);
          border.fillRect(x + tileSize - 13, y + tileSize - 13, 4, 4);
        };

        for (let row = 0; row < 10; row++) {
          const y = marginY + row * (tileSize + 3);
          const color = (row % 2 === 0) ? 0xc1121f : 0x1d1e2c; // Alternating Red & Black embroidery
          drawOrnamentTile(10, y, color);
          drawOrnamentTile(CONFIG.WIDTH - 10 - tileSize, y, color);
        }
      }

      drawCossackTitleBanner() {
        const cx = CONFIG.WIDTH / 2;
        const cy = 98;
        const bw = 720;
        const bh = 152;

        // Warm Aged Parchment Scroll Banner with taller height so title & italic subtitle have generous spacing
        const banner = this.add.graphics();
        banner.fillStyle(0x1d1e2c, 0.35);
        banner.fillRoundedRect(cx - bw / 2 - 6, cy - bh / 2 + 4, bw + 12, bh + 2, 18);

        banner.fillStyle(0xf9f3e3, 0.96);
        banner.fillRoundedRect(cx - bw / 2, cy - bh / 2, bw, bh, 16);

        banner.lineStyle(3.5, 0xc1121f, 1);
        banner.strokeRoundedRect(cx - bw / 2 + 6, cy - bh / 2 + 6, bw - 12, bh - 12, 14);
        banner.lineStyle(1.5, 0xb68d40, 1);
        banner.strokeRoundedRect(cx - bw / 2 + 12, cy - bh / 2 + 12, bw - 24, bh - 24, 10);

        // Subtle golden ornamental divider line between Main Title and Italic Subtitle
        const divY = cy + 22;
        banner.lineStyle(1.5, 0xb68d40, 0.75);
        banner.lineBetween(cx - 240, divY, cx - 12, divY);
        banner.lineBetween(cx + 12, divY, cx + 240, divY);
        banner.fillStyle(0xc1121f, 0.9);
        banner.fillTriangle(cx - 7, divY, cx, divY - 5, cx + 7, divY);
        banner.fillTriangle(cx - 7, divY, cx, divY + 5, cx + 7, divY);

        // Ornate Cossack Baroque Calligraphic Flourishes placed cleanly outside text bounds
        banner.lineStyle(2.2, 0x2b2118, 0.85);
        // Left flourish
        banner.beginPath();
        banner.arc(cx - 314, cy - 18, 18, 0.4, Math.PI * 1.65, false);
        banner.strokePath();
        banner.beginPath();
        banner.arc(cx - 296, cy - 10, 10, Math.PI * 0.8, Math.PI * 2.1, false);
        banner.strokePath();
        // Right flourish
        banner.beginPath();
        banner.arc(cx + 314, cy - 18, 18, Math.PI * 1.35, Math.PI * 2.6, false);
        banner.strokePath();
        banner.beginPath();
        banner.arc(cx + 296, cy - 10, 10, Math.PI * 0.9, Math.PI * 2.2, false);
        banner.strokePath();

        // Gold illuminated initial vignette aligned directly behind the capital letter "В"
        const initX = cx - 238;
        const initY = cy - 22;
        banner.lineStyle(1.8, 0xb68d40, 0.95);
        banner.fillStyle(0xe9c46a, 0.28);
        banner.fillCircle(initX, initY, 33);
        banner.strokeCircle(initX, initY, 33);
        // Decorative botanical leaves on the left rim of the initial vignette
        for (let i = -2; i <= 2; i++) {
          banner.fillStyle(0xb68d40, 0.75);
          banner.fillEllipse(initX - 26, initY + i * 8, 12, 5);
        }

        // Main Cossack Title: "В пошуках солі" in noble Cormorant Infant bold serif
        this.titleShadow = this.add.text(cx + 3, cy - 23, STRINGS.TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '70px',
          fontStyle: 'bold',
          color: '#2b1810'
        }).setOrigin(0.5);

        this.titleText = this.add.text(cx, cy - 26, STRINGS.TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '70px',
          fontStyle: 'bold',
          color: '#c1121f',
          stroke: '#f9f3e3',
          strokeThickness: 2.5
        }).setOrigin(0.5);

        // Subtitle in historic italic serif well below the divider line
        this.add.text(cx, cy + 46, `— ${STRINGS.SUBTITLE} —`, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '21px',
          fontStyle: 'italic bold',
          color: '#3d2314',
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);
      }

      createBottomPrompts() {
        const cx = CONFIG.WIDTH / 2;

        // Dark translucent footer plaque for high contrast over foreground art
        this.footerBg = this.add.graphics();
        this.footerBg.fillStyle(0x14161f, 0.86);
        this.footerBg.lineStyle(2.5, 0xe9c46a, 1);
        this.footerBg.fillRoundedRect(cx - 255, CONFIG.HEIGHT - 96, 510, 78, 14);
        this.footerBg.strokeRoundedRect(cx - 255, CONFIG.HEIGHT - 96, 510, 78, 14);

        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 900);
        const titlePrompt = isTouch ? STRINGS.TITLE_PRESS_TAP : STRINGS.TITLE_PRESS_ENTER;

        // Prompt: "Натисніть Enter, щоб почати гру" or "Торкніться екрана, щоб почати гру"
        this.enterPrompt = this.add.text(cx, CONFIG.HEIGHT - 70, titlePrompt, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: isTouch ? '24px' : '26px',
          fontStyle: 'bold',
          color: '#ffd166',
          stroke: '#000000',
          strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
          targets: this.enterPrompt,
          scaleX: 1.05,
          scaleY: 1.05,
          alpha: 0.72,
          duration: 750,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Credit below: "Game by LongLiveEP"
        this.authorText = this.add.text(cx, CONFIG.HEIGHT - 34, STRINGS.TITLE_AUTHOR, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#f8f9fa',
          letterSpacing: 2
        }).setOrigin(0.5);
      }

      createDifficultyModal() {
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        this.diffModal = this.add.container(0, 0).setDepth(220).setVisible(false);

        const dim = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0b0c12, 0.82)
          .setInteractive();

        const card = this.add.graphics();
        card.fillStyle(0x1d1e2c, 0.98);
        card.fillRoundedRect(cx - 330, cy - 220, 660, 440, 18);
        card.lineStyle(4, 0xffd166, 1);
        card.strokeRoundedRect(cx - 330, cy - 220, 660, 440, 18);
        card.lineStyle(2, 0xc1121f, 0.9);
        card.strokeRoundedRect(cx - 318, cy - 208, 636, 416, 14);

        const headerTxt = this.add.text(cx, cy - 178, STRINGS.DIFF_MODAL_HEADER, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd166',
          letterSpacing: 2,
          padding: { top: 4, bottom: 4 }
        }).setOrigin(0.5);

        const titleTxt = this.add.text(cx, cy - 138, STRINGS.DIFF_MODAL_TITLE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '34px',
          fontStyle: 'bold',
          color: '#ffffff',
          padding: { top: 4, bottom: 8 }
        }).setOrigin(0.5);

        this.diffOptionCards = [];
        const options = [
          {
            mode: 'casual',
            y: cy - 38,
            title: STRINGS.DIFF_CASUAL_TITLE,
            desc: STRINGS.DIFF_CASUAL_DESC,
            baseColor: 0x243b4a
          },
          {
            mode: 'hardcore',
            y: cy + 88,
            title: STRINGS.DIFF_HARDCORE_TITLE,
            desc: STRINGS.DIFF_HARDCORE_DESC,
            baseColor: 0x4a1c24
          }
        ];

        this.diffModal.add([dim, card, headerTxt, titleTxt]);

        options.forEach((opt, idx) => {
          const box = this.add.rectangle(cx, opt.y, 570, 110, opt.baseColor, 0.96)
            .setStrokeStyle(3, 0x8d99ae)
            .setInteractive({ useHandCursor: true });

          const optTitle = this.add.text(cx, opt.y - 26, opt.title, {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '25px',
            fontStyle: 'bold',
            color: '#ffd166',
            padding: { left: 6, right: 6, top: 4, bottom: 10 }
          }).setOrigin(0.5);

          const optDesc = this.add.text(cx, opt.y + 22, opt.desc, {
            fontSize: '14px',
            color: '#f5ebe0',
            align: 'center',
            lineSpacing: 5,
            padding: { top: 2, bottom: 4 }
          }).setOrigin(0.5);

          box.on('pointerover', () => {
            this.selectedDiffIndex = idx;
            SFX.speechBlip();
            this.refreshDifficultyHighlight();
          });

          box.on('pointerdown', (pointer, lx, ly, event) => {
            if (event && event.stopPropagation) event.stopPropagation();
            this.selectedDiffIndex = idx;
            this.refreshDifficultyHighlight();
            this.confirmDifficultySelection();
          });

          this.diffOptionCards.push({ box, optTitle, optDesc, mode: opt.mode });
          this.diffModal.add([box, optTitle, optDesc]);
        });

        const navHint = this.add.text(cx, cy + 178, STRINGS.DIFF_NAV_HINT, {
          fontSize: '13px',
          color: '#a8dadc'
        }).setOrigin(0.5);
        this.diffModal.add(navHint);
      }

      openDifficultyModal() {
        if (this.difficultyModalOpen) return;
        this.difficultyModalOpen = true;
        this.transitionFastForward = true;
        this.diffModal.setVisible(true);
        this.diffModal.setScale(0.9);
        this.refreshDifficultyHighlight();
        SFX.itemFanfare();

        this.tweens.add({
          targets: this.diffModal,
          scale: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }

      moveDifficultySelection(delta) {
        const len = this.diffOptionCards.length;
        this.selectedDiffIndex = (this.selectedDiffIndex + delta + len) % len;
        SFX.speechBlip();
        this.refreshDifficultyHighlight();
      }

      refreshDifficultyHighlight() {
        this.diffOptionCards.forEach((item, idx) => {
          const active = idx === this.selectedDiffIndex;
          if (active) {
            item.box.setStrokeStyle(4, 0xffea00);
            item.box.setScale(1.02);
            item.optTitle.setColor('#ffea00');
          } else {
            item.box.setStrokeStyle(2, 0x8d99ae);
            item.box.setScale(1);
            item.optTitle.setColor('#ffffff');
          }
        });
      }

      confirmDifficultySelection() {
        if (!this.difficultyModalOpen || this.confirmingDifficulty) return;
        this.confirmingDifficulty = true;
        const chosen = this.diffOptionCards[this.selectedDiffIndex];
        GAME_STATE.difficulty = chosen ? chosen.mode : 'casual';
        SFX.checkpoint();

        this.cameras.main.fadeOut(360, 18, 19, 26);
        this.time.delayedCall(380, () => {
          this.scene.start('HutScene');
        });
      }

      startGame() {
        // If intro transition is already playing, a second press skips straight to Difficulty Selection
        if (this.startingGame) {
          if (!this.transitionFastForward && !this.difficultyModalOpen) {
            this.openDifficultyModal();
          }
          return;
        }
        this.startingGame = true;
        SFX.banduraStart();

        // Hide bottom prompt plaque so the scene feels cinematic
        this.tweens.add({
          targets: [this.footerBg, this.enterPrompt, this.authorText],
          alpha: 0,
          duration: 280
        });

        // Step 1: Wife steps out of the Khata doorway and calls Omelko to eat borsch
        this.doorWife.setVisible(true);
        this.tweens.add({
          targets: this.doorWife,
          y: this.khataDoorY - 6,
          duration: 140,
          yoyo: true,
          repeat: 2
        });

        const callBubble = this.add.container(620, 214);
        const cbBg = this.add.graphics();
        cbBg.fillStyle(0xfefae0, 0.98);
        cbBg.lineStyle(3, 0xc1121f, 1);
        cbBg.fillRoundedRect(-230, -44, 460, 84, 14);
        cbBg.strokeRoundedRect(-230, -44, 460, 84, 14);
        // Pointer toward Khata doorway
        cbBg.fillTriangle(72, 40, 92, 40, 88, 60);

        const cbText = this.add.text(0, -2, STRINGS.TITLE_WIFE_CALL, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#2b1810',
          align: 'center',
          lineSpacing: 5
        }).setOrigin(0.5);

        callBubble.add([cbBg, cbText]);
        callBubble.setScale(0.7);
        this.tweens.add({
          targets: callBubble,
          scale: 1,
          duration: 240,
          ease: 'Back.easeOut'
        });
        SFX.speechBlip();

        // Step 2: Give player plenty of time (3.8s) to read the wife's call before Omelko wakes up
        this.time.delayedCall(3800, () => {
          if (this.transitionFastForward) return;

          if (this.pipeSmokeTimer) this.pipeSmokeTimer.remove();
          this.recliningOmelko.setVisible(false);
          this.walkingOmelko.setVisible(true);
          SFX.jump(false);

          // Fade out the first bubble cleanly so they don't overlap
          this.tweens.add({
            targets: callBubble,
            alpha: 0,
            duration: 250
          });

          // Hop up from the haystack
          this.tweens.add({
            targets: this.walkingOmelko,
            y: this.hayY - 22,
            duration: 150,
            yoyo: true
          });

          // Omelko's excited reply bubble with comfortable width & reading time
          const replyBubble = this.add.container(this.hayX + 10, this.hayY - 68);
          const rbBg = this.add.graphics();
          rbBg.fillStyle(0xfefae0, 0.98);
          rbBg.lineStyle(2.5, 0x1d3557, 1);
          rbBg.fillRoundedRect(-175, -26, 350, 48, 12);
          rbBg.strokeRoundedRect(-175, -26, 350, 48, 12);
          rbBg.fillTriangle(-10, 22, 10, 22, 0, 34);

          const rbText = this.add.text(0, -2, STRINGS.TITLE_OMELKO_REPLY, {
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#1d3557'
          }).setOrigin(0.5);
          replyBubble.add([rbBg, rbText]);
          replyBubble.setScale(0.75);
          this.tweens.add({
            targets: replyBubble,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
          });
          SFX.speechBlip();

          // Wait 2.4s so player can comfortably read Omelko's reply before he walks to the door
          this.time.delayedCall(2400, () => {
            if (this.transitionFastForward) return;

            this.tweens.add({
              targets: replyBubble,
              alpha: 0,
              duration: 350,
              delay: 400
            });

            // Cheerful walking bobbing + footsteps
            const walkBob = this.tweens.add({
              targets: this.walkingOmelko,
              scaleY: 0.7,
              scaleX: 0.84,
              duration: 130,
              yoyo: true,
              repeat: -1
            });

            // Dust puffs while walking to the door
            const dustEvent = this.time.addEvent({
              delay: 180,
              repeat: 7,
              callback: () => {
                if (!this.walkingOmelko.visible) return;
                const d = this.add.image(this.walkingOmelko.x - 8, this.walkingOmelko.y + 18, 'particle_dust')
                  .setScale(0.7);
                this.tweens.add({
                  targets: d,
                  y: d.y - 10,
                  alpha: 0,
                  duration: 260,
                  onComplete: () => d.destroy()
                });
              }
            });

            this.tweens.add({
              targets: this.walkingOmelko,
              x: this.khataDoorX,
              y: this.khataDoorY,
              duration: 1550,
              ease: 'Sine.easeInOut',
              onComplete: () => {
                if (this.transitionFastForward) return;
                walkBob.stop();
                dustEvent.remove();
                SFX.checkpoint();

                // Omelko & his wife step inside the Khata -> Open Difficulty Selection Modal!
                this.tweens.add({
                  targets: [this.walkingOmelko, this.doorWife],
                  alpha: 0,
                  scale: 0.55,
                  duration: 280,
                  onComplete: () => {
                    this.openDifficultyModal();
                  }
                });
              }
            });
          });
        });
      }

      update(time, delta) {
        // Slowly rotate the windmill sails
        if (this.windmillBlades) {
          this.windmillBlades.rotation += 0.00045 * delta;
        }

        // Also allow Xbox Gamepad A or Start button to launch the game
        if (!this.startingGame && navigator.getGamepads) {
          const pads = navigator.getGamepads();
          const pad = pads && pads[0];
          if (pad && ((pad.buttons[0] && pad.buttons[0].pressed) || (pad.buttons[9] && pad.buttons[9].pressed))) {
            this.startGame();
          }
        }
      }
    }