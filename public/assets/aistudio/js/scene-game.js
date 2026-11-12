
    /**
     * ============================================================================
     * 11. SCENE 2, 3 & 4: MAIN GAMEPLAY SCENE ("ХУТІР І ЛІС" & BOSS ROOSTER)
     * ============================================================================
     */
    class GameScene extends Phaser.Scene {
      constructor() {
        super('GameScene');
      }

      init(data) {
        if (data && data.level) {
          this.currentLevel = data.level;
          GAME_STATE.currentLevel = data.level;
        } else {
          this.currentLevel = GAME_STATE.currentLevel || 1;
        }
        if (this.currentLevel >= 2) {
          GAME_STATE.hasSaber = true;
        }
        if (this.currentLevel >= 3) {
          GAME_STATE.hasSwampFrogs = true;
        }
        this.initialCoins = (data && data.coins !== undefined) ? data.coins : (GAME_STATE.savedCoins || 0);
        this.startAtBoss = Boolean(data && data.startAtBoss);
      }

      create() {
        const isLevel2 = this.currentLevel === 2;
        const isLevel3 = this.currentLevel === 3;
        const isLevel4 = this.currentLevel === 4;
        this.levelData = isLevel4
          ? buildSteppeCoastLevelData()
          : (isLevel3
            ? buildDniproLevelData()
            : (isLevel2 ? buildEvilForestLevelData() : LEVEL_1_DATA));
        this.worldWidth = this.levelData.worldWidth || CONFIG.WORLD_WIDTH;

        this.physics.world.setBounds(0, 0, this.worldWidth, CONFIG.WORLD_HEIGHT);
        this.physics.world.OVERLAP_BIAS = 16;
        this.isPaused = false;
        this.isDeathModalOpen = false;
        this.isVictory = false;
        this.enemiesStunnedCount = 0;
        this.lookaheadX = 0;
        this.hasSeenPesyholovets = false;
        this.hasSeenShieldGuardian = false;
        this.hasSeenRusalka = false;
        this.hasSeenSteppeEnemy = false;
        this.hasSeenSyvashCoast = false;
        this.grabbedByRusalka = null;
        this.waterRescueCooldownUntil = 0;
        this.lastSafePerch = { x: 140, y: CONFIG.GROUND_Y - 45 };
        this.activeSpeechBubble = null;

        // Steppe Wind & Coastal Wave state for Act IV
        this.isWindGustActive = false;
        this.isWindTelegraphing = false;
        this.windDirection = -1;
        this.windStrengthRatio = 0;
        this.nextWindGustTime = 6200;
        this.windTelegraphStartTime = 6200 - CONFIG.WIND.TELEGRAPH_MS;
        this.windGustEndTime = 0;
        this.lastWaveCycleIndex = -1;
        this.lastWaveDamageTime = 0;

        // 1. Create Parallax Background Layers (Act I, Act II, Act III, or Act IV Steppe & Black Sea)
        this.createParallaxBackground();

        // 2. Build Platforms & Ground / River Cross-Section
        this.platforms = this.physics.add.staticGroup();
        this.undergroundFloorGroup = this.physics.add.staticGroup();
        this.dryGroundGroup = this.physics.add.staticGroup();
        this.cloudPlatforms = [];
        this.waterGeysers = [];
        this.coastalWavePlatforms = [];
        this.crystalPlatforms = [];
        this.isSaltMountainCracked = false;

        const groundVisual = this.add.graphics();
        const groundH = CONFIG.HEIGHT - CONFIG.GROUND_Y;

        if (isLevel3) {
          // ==================================================================
          // ACT III ("НА ДНІПРІ"): TURBULENT DNIPRO RIVER & DRY ISLAND PIERS
          // ==================================================================
          groundVisual.fillStyle(0x031d38, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, groundH);
          groundVisual.fillStyle(0x003566, 0.92);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, 56);
          groundVisual.fillStyle(0x0077b6, 0.85);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, 18);

          // Animated Dnipro surface foam & wave crests across the whole river
          for (let wx = 20; wx < this.worldWidth; wx += 75) {
            groundVisual.fillStyle(0x90e0ef, 0.65);
            groundVisual.fillEllipse(wx, CONFIG.GROUND_Y + 4, 48, 7);
            groundVisual.fillStyle(0x48cae4, 0.35);
            groundVisual.fillEllipse(wx + 32, CONFIG.GROUND_Y + 26, 54, 8);
          }

          // Build the wooden Cossack bridges & piers over the Dnipro (starting bridge, 2 checkpoint bridges, final catfish pier)
          const bridgeFg = this.add.graphics().setDepth(17);
          (this.levelData.dryIslands || []).forEach(isl => {
            const startX = isl.startX !== undefined ? isl.startX : (isl.x - isl.w / 2);
            const endX = isl.endX !== undefined ? isl.endX : (isl.x + isl.w / 2);
            const islW = endX - startX;
            const islCenterX = startX + islW / 2;

            // 1. Deep oak bridge pilings (дубові палі місточка у воді) & diagonal timber cross-braces
            for (let px = startX + 22; px <= endX - 18; px += 58) {
              // Diagonal cross-braces under bridge deck
              if (px + 58 <= endX - 10) {
                groundVisual.lineStyle(4, 0x3d2314, 0.9);
                groundVisual.lineBetween(px + 6, CONFIG.GROUND_Y + 6, px + 56, CONFIG.GROUND_Y + 52);
                groundVisual.lineBetween(px + 56, CONFIG.GROUND_Y + 6, px + 6, CONFIG.GROUND_Y + 52);
              }
              // Vertical oak piling column
              groundVisual.fillStyle(0x4a2c11, 1);
              groundVisual.fillRoundedRect(px - 6, CONFIG.GROUND_Y - 4, 14, groundH + 8, 3);
              groundVisual.fillStyle(0x6f4518, 1);
              groundVisual.fillRect(px - 3, CONFIG.GROUND_Y - 2, 5, groundH + 4);
              // Water foam ring around each wooden piling
              groundVisual.fillStyle(0xcaf0f8, 0.75);
              groundVisual.fillEllipse(px + 1, CONFIG.GROUND_Y + 8, 26, 6);
            }

            // 2. Heavy horizontal oak support beam under bridge planks
            groundVisual.fillStyle(0x583101, 1);
            groundVisual.fillRoundedRect(startX - 4, CONFIG.GROUND_Y - 2, islW + 8, 16, 4);

            // 3. Individual warm wooden boardwalk planks (дощатий настил місточка)
            groundVisual.fillStyle(0x8a5a36, 1);
            groundVisual.fillRoundedRect(startX, CONFIG.GROUND_Y - 10, islW, 12, 4);
            groundVisual.fillStyle(0xb07d4f, 1);
            groundVisual.fillRect(startX + 4, CONFIG.GROUND_Y - 10, islW - 8, 5);
            groundVisual.lineStyle(2, 0x3d2314, 0.95);
            for (let bx = startX + 14; bx < endX - 6; bx += 18) {
              groundVisual.lineBetween(bx, CONFIG.GROUND_Y - 10, bx, CONFIG.GROUND_Y + 2);
            }

            // 4. Bridge handrail posts & sagging hemp ropes above deck (поручні місточка)
            let prevPostX = null;
            for (let postX = startX + 24; postX <= endX - 20; postX += 86) {
              bridgeFg.fillStyle(0x583101, 1);
              bridgeFg.fillRoundedRect(postX - 4, CONFIG.GROUND_Y - 42, 9, 34, 2);
              bridgeFg.fillStyle(0xd4a373, 1);
              bridgeFg.fillCircle(postX + 0.5, CONFIG.GROUND_Y - 43, 5);

              if (prevPostX !== null) {
                bridgeFg.lineStyle(2.5, 0xe9c46a, 0.9);
                bridgeFg.beginPath();
                bridgeFg.moveTo(prevPostX, CONFIG.GROUND_Y - 36);
                bridgeFg.lineTo((prevPostX + postX) / 2, CONFIG.GROUND_Y - 29);
                bridgeFg.lineTo(postX, CONFIG.GROUND_Y - 36);
                bridgeFg.strokePath();
              }
              prevPostX = postX;
            }

            // On the starting wooden bridge (startX === 0), add a signpost guiding Omelko onto the first cloud!
            if (startX === 0) {
              bridgeFg.fillStyle(0x583101, 1);
              bridgeFg.fillRect(205, CONFIG.GROUND_Y - 76, 8, 68);
              bridgeFg.fillStyle(0xffd166, 1);
              bridgeFg.fillRoundedRect(122, CONFIG.GROUND_Y - 78, 174, 26, 5);
              bridgeFg.lineStyle(2, 0x583101, 1);
              bridgeFg.strokeRoundedRect(122, CONFIG.GROUND_Y - 78, 174, 26, 5);
              this.add.text(209, CONFIG.GROUND_Y - 65, 'Місточок → На хмаринки!', {
                fontSize: '12px',
                fontStyle: 'bold',
                color: '#3d2314'
              }).setOrigin(0.5).setDepth(22);
            }

            const dryBody = this.add.rectangle(islCenterX, CONFIG.GROUND_Y + 10, islW, 24, 0x000000, 0);
            this.physics.add.existing(dryBody, true);
            this.platforms.add(dryBody);
            this.dryGroundGroup.add(dryBody);
          });

          // Waiting Giant River Catfish ("Річковий Сом Вусань") at the far edge of the final pier!
          this.waitingCatfish = this.add.image(4705, CONFIG.GROUND_Y + 4, 'giant_catfish')
            .setFlipX(true)
            .setDepth(26);
          this.tweens.add({
            targets: this.waitingCatfish,
            y: CONFIG.GROUND_Y - 2,
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
          this.add.text(4695, CONFIG.GROUND_Y - 58, '🐟 Річковий Сом Вусань\n(Чекає після перемоги над Водяним Царем)', {
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#90e0ef',
            align: 'center',
            backgroundColor: '#031d38d8',
            padding: { x: 8, y: 4 }
          }).setOrigin(0.5).setDepth(27);

          // Create Dnipro Water Geyser Traps between cloud platforms
          (this.levelData.geysers || []).forEach((gz, idx) => {
            const nozzle = this.add.ellipse(gz.x, CONFIG.GROUND_Y + 4, 42, 12, 0x90e0ef, 0.7).setDepth(24);
            const column = this.add.rectangle(gz.x, CONFIG.GROUND_Y, 28, 10, 0x48cae4, 0.85)
              .setOrigin(0.5, 1)
              .setDepth(23)
              .setVisible(false);
            const cap = this.add.ellipse(gz.x, CONFIG.GROUND_Y - 120, 44, 18, 0xcaf0f8, 0.9)
              .setDepth(24)
              .setVisible(false);
            this.waterGeysers.push({
              x: gz.x,
              phaseOffset: idx * 750,
              period: gz.period || 2500,
              nozzle,
              column,
              cap,
              isErupting: false
            });
          });
        } else if (isLevel2) {
          // Dark cursed peat & tangled root catacombs of "Злий Ліс"
          groundVisual.fillStyle(0x0b0e14, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, groundH);

          groundVisual.fillStyle(0x161d24, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y + 12, this.worldWidth, 52);

          for (let x = 40; x < this.worldWidth; x += 120) {
            groundVisual.fillStyle(0x12171d, 1);
            groundVisual.fillRoundedRect(x, CONFIG.GROUND_Y + 68, 72, 26, 5);
            groundVisual.fillStyle(0x0e1318, 1);
            groundVisual.fillRoundedRect(x + 36, CONFIG.GROUND_Y + 100, 68, 24, 5);

            // Gnarled black roots & glowing swamp crystals in underground soil
            groundVisual.lineStyle(3, 0x2b1d14, 0.9);
            groundVisual.lineBetween(x + 20, CONFIG.GROUND_Y + 14, x + 8, CONFIG.GROUND_Y + 52);
            groundVisual.lineBetween(x + 20, CONFIG.GROUND_Y + 28, x + 34, CONFIG.GROUND_Y + 46);
            groundVisual.fillStyle(0x2a9d8f, 0.55);
            groundVisual.fillCircle(x + 85, CONFIG.GROUND_Y + 34, 5);
          }

          // Dark mossy forest floor border at CONFIG.GROUND_Y (405)
          groundVisual.fillStyle(0x1b4332, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, 14);
          groundVisual.fillStyle(0x2d6a4f, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, 5);
        } else if (isLevel4) {
          // ==================================================================
          // ACT IV («ДИКЕ ПОЛЕ І ЧОРНЕ МОРЕ»): STEPPE CHERNOZEM -> PINK SYVASH BRINE & SALT CRYSTALS
          // ==================================================================
          const coastX = CONFIG.STEPPE.COAST_START_X;

          // 1. Steppe dry earth & catacombs (0 .. coastX)
          groundVisual.fillStyle(0x221812, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, coastX, groundH);
          groundVisual.fillStyle(0x3a281c, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y + 12, coastX, 52);

          for (let x = 40; x < coastX; x += 130) {
            groundVisual.fillStyle(0x2f2017, 1);
            groundVisual.fillRoundedRect(x, CONFIG.GROUND_Y + 68, 74, 26, 5);
            groundVisual.lineStyle(2.5, 0x6c584c, 0.75);
            groundVisual.lineBetween(x + 22, CONFIG.GROUND_Y + 14, x + 12, CONFIG.GROUND_Y + 46);
            groundVisual.fillStyle(0xa98467, 0.65);
            groundVisual.fillCircle(x + 86, CONFIG.GROUND_Y + 34, 5);
          }

          // Golden-olive steppe turf top border
          groundVisual.fillStyle(0x6b705c, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, coastX, 14);
          groundVisual.fillStyle(0xd4a373, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, coastX, 5);

          // 2. Coastal Syvash Pink Salt Lagoon & Black Sea Shore (coastX .. worldWidth)
          const coastW = this.worldWidth - coastX;
          groundVisual.fillStyle(0x2b192e, 1);
          groundVisual.fillRect(coastX, CONFIG.GROUND_Y, coastW, groundH);
          // Pink Syvash brine & crystalline salt shelf
          groundVisual.fillStyle(0xb56576, 0.92);
          groundVisual.fillRect(coastX, CONFIG.GROUND_Y + 10, coastW, 46);
          groundVisual.fillStyle(0xe56b6f, 0.88);
          groundVisual.fillRect(coastX, CONFIG.GROUND_Y, coastW, 14);
          groundVisual.fillStyle(0xfefae0, 0.92);
          groundVisual.fillRect(coastX, CONFIG.GROUND_Y, coastW, 4);

          // Procedural salt crystals (соляні кристали) & overturned Chayka boats along the coast
          const coastDecor = this.add.graphics().setDepth(16);
          for (let sx = coastX + 60; sx < this.worldWidth - 120; sx += 170) {
            // Shimmeringpink-white salt crystal cluster
            coastDecor.fillStyle(0xffe5ec, 0.92);
            coastDecor.fillTriangle(sx, CONFIG.GROUND_Y + 2, sx + 7, CONFIG.GROUND_Y - 18, sx + 14, CONFIG.GROUND_Y + 2);
            coastDecor.fillStyle(0xffffff, 0.95);
            coastDecor.fillTriangle(sx + 10, CONFIG.GROUND_Y + 2, sx + 18, CONFIG.GROUND_Y - 26, sx + 26, CONFIG.GROUND_Y + 2);
            coastDecor.fillStyle(0xffb3c6, 0.85);
            coastDecor.fillTriangle(sx + 21, CONFIG.GROUND_Y + 2, sx + 27, CONFIG.GROUND_Y - 14, sx + 33, CONFIG.GROUND_Y + 2);

            // Pink brine foam ellipse
            groundVisual.fillStyle(0xffcad4, 0.65);
            groundVisual.fillEllipse(sx + 55, CONFIG.GROUND_Y + 8, 56, 7);
          }

          // Background decorative overturned Chayka hulls resting on the salt flats
          [4980, 6160].forEach(bx => {
            coastDecor.fillStyle(0x4a2c11, 0.9);
            coastDecor.fillTriangle(bx - 36, CONFIG.GROUND_Y + 2, bx, CONFIG.GROUND_Y - 22, bx + 36, CONFIG.GROUND_Y + 2);
            coastDecor.fillStyle(0x6f4518, 0.9);
            coastDecor.fillRoundedRect(bx - 30, CONFIG.GROUND_Y - 12, 60, 14, 5);
          });

          // ==================================================================
          // 3. ARENA «СОЛЯНА ГОРА» (x: 6240 .. 7200): SUNSET SALT LAKE, BAGS OF SALT & PINK BRINE
          // ==================================================================
          const arenaX = this.levelData.bossArenaStartX; // 6240
          // Solid crystalline salt shore on left/center of arena (6240 .. 6760)
          groundVisual.fillStyle(0xffe5ec, 0.96);
          groundVisual.fillRect(arenaX, CONFIG.GROUND_Y, 520, 14);
          groundVisual.fillStyle(0xffffff, 0.98);
          groundVisual.fillRect(arenaX, CONFIG.GROUND_Y, 520, 5);

          // Deep glowing pink salt lake water on right side of arena under Salyonohorych (6760 .. 7200)
          groundVisual.fillStyle(0x590d22, 1);
          groundVisual.fillRect(6760, CONFIG.GROUND_Y, this.worldWidth - 6760, groundH);
          groundVisual.fillStyle(0xc9184a, 0.92);
          groundVisual.fillRect(6760, CONFIG.GROUND_Y, this.worldWidth - 6760, 44);
          groundVisual.fillStyle(0xff758f, 0.92);
          groundVisual.fillRect(6760, CONFIG.GROUND_Y, this.worldWidth - 6760, 16);
          // Sunset golden-pink reflections across the salt lake water
          for (let rx = 6780; rx < this.worldWidth - 20; rx += 54) {
            groundVisual.fillStyle(0xffd166, 0.55);
            groundVisual.fillEllipse(rx, CONFIG.GROUND_Y + 7, 38, 5);
            groundVisual.fillStyle(0xffcad4, 0.7);
            groundVisual.fillEllipse(rx + 22, CONFIG.GROUND_Y + 20, 42, 6);
          }

          // Stacked burlap sacks of Chumak salt (мішки солі) in the arena
          [6275, 6312, 6560, 6725].forEach((bagX, bIdx) => {
            // Burlap sack body
            coastDecor.fillStyle(0xd4a373, 1);
            coastDecor.fillRoundedRect(bagX - 16, CONFIG.GROUND_Y - 26, 32, 28, 7);
            coastDecor.lineStyle(2, 0x6f4518, 0.9);
            coastDecor.strokeRoundedRect(bagX - 16, CONFIG.GROUND_Y - 26, 32, 28, 7);
            // Overflowing white-pink crystalline salt top
            coastDecor.fillStyle(0xffffff, 1);
            coastDecor.fillEllipse(bagX, CONFIG.GROUND_Y - 24, 24, 10);
            coastDecor.fillStyle(0xffcad4, 0.85);
            coastDecor.fillEllipse(bagX + 3, CONFIG.GROUND_Y - 25, 14, 6);
            // Red ribbon tie
            coastDecor.fillStyle(0xc1121f, 1);
            coastDecor.fillRect(bagX - 12, CONFIG.GROUND_Y - 19, 24, 3);
            if (bIdx % 2 === 1) {
              // Second leaning salt sack
              coastDecor.fillStyle(0xbc8a5f, 1);
              coastDecor.fillRoundedRect(bagX + 10, CONFIG.GROUND_Y - 20, 26, 22, 6);
              coastDecor.fillStyle(0xffffff, 0.95);
              coastDecor.fillEllipse(bagX + 23, CONFIG.GROUND_Y - 19, 18, 7);
            }
          });

          // Giant Crystalline Salt Mountain Monument behind the Boss Arena (x: 6640 .. 7200)
          this.saltMountainArenaGraphic = this.add.graphics().setDepth(15);
          this.saltMountainArenaGraphic.fillStyle(0xe2eafc, 0.95);
          this.saltMountainArenaGraphic.fillTriangle(6640, CONFIG.GROUND_Y + 4, 6960, 48, 7200, CONFIG.GROUND_Y + 4);
          this.saltMountainArenaGraphic.fillStyle(0xffffff, 0.98);
          this.saltMountainArenaGraphic.fillTriangle(6730, CONFIG.GROUND_Y + 4, 6960, 48, 7130, CONFIG.GROUND_Y + 4);
          this.saltMountainArenaGraphic.fillStyle(0xffcad4, 0.78);
          this.saltMountainArenaGraphic.fillTriangle(6610, CONFIG.GROUND_Y + 4, 6790, 148, 6930, CONFIG.GROUND_Y + 4);

          // Overlay graphics for Phase 4 Salt Mountain cracks
          this.saltMountainCracksGraphic = this.add.graphics().setDepth(16);
        } else {
          // Deep underground stone & catacomb stratum
          groundVisual.fillStyle(0x231912, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, groundH);

          // Mid-earth warm clay & soil band
          groundVisual.fillStyle(0x3d291a, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y + 12, this.worldWidth, 52);

          // Underground tunnel archways, roots & rocky texture details so the lower band is clearly visible
          for (let x = 40; x < this.worldWidth; x += 120) {
            groundVisual.fillStyle(0x332419, 1);
            groundVisual.fillRoundedRect(x, CONFIG.GROUND_Y + 68, 72, 26, 5);
            groundVisual.fillStyle(0x2c1f16, 1);
            groundVisual.fillRoundedRect(x + 36, CONFIG.GROUND_Y + 100, 68, 24, 5);

            // Hanging tree roots & pebbles in upper soil
            groundVisual.lineStyle(2.5, 0x5c3c24, 0.85);
            groundVisual.lineBetween(x + 20, CONFIG.GROUND_Y + 14, x + 12, CONFIG.GROUND_Y + 46);
            groundVisual.lineBetween(x + 20, CONFIG.GROUND_Y + 28, x + 30, CONFIG.GROUND_Y + 42);
            groundVisual.fillStyle(0x6c584c, 0.75);
            groundVisual.fillCircle(x + 85, CONFIG.GROUND_Y + 34, 6);
          }

          // Lush Top Grass Border at CONFIG.GROUND_Y (405)
          groundVisual.fillStyle(0x4c953e, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, 14);
          groundVisual.fillStyle(0x6ab04c, 1);
          groundVisual.fillRect(0, CONFIG.GROUND_Y, this.worldWidth, 5);
        }

        if (!isLevel3) {
          // One-way surface collider at CONFIG.GROUND_Y for Levels 1 & 2
          this.groundBody = this.add.rectangle(
            this.worldWidth / 2,
            CONFIG.GROUND_Y + 12,
            this.worldWidth,
            24,
            0x000000,
            0
          );
          this.physics.add.existing(this.groundBody, true);
          this.groundBody.body.checkCollision.down = false;
          this.groundBody.body.checkCollision.left = false;
          this.groundBody.body.checkCollision.right = false;

          // Solid bottom floor collider for the underground catacombs
          const undergroundFloor = this.add.rectangle(
            this.worldWidth / 2,
            CONFIG.HEIGHT - 4,
            this.worldWidth,
            8,
            0x000000,
            0
          );
          this.physics.add.existing(undergroundFloor, true);
          this.platforms.add(undergroundFloor);
          this.undergroundFloorGroup.add(undergroundFloor);
        } else {
          this.groundBody = null;
        }

        // Elevated Platforms (Wooden / Dark Root Platforms in Act I-II, Wooden Bridge Steps & Cloud Platforms in Act III)
        this.levelData.platforms.forEach((p, idx) => {
          if (isLevel3) {
            if (p.isWoodenBridgeStep) {
              // Raised wooden bridge step (дерев'яний трамплін місточка) for smooth jumping onto the clouds!
              const stepLegs = this.add.graphics().setDepth(17);
              stepLegs.fillStyle(0x4a2c11, 1);
              stepLegs.fillRect(p.x - p.w / 2 + 12, p.y, 10, CONFIG.GROUND_Y - p.y);
              stepLegs.fillRect(p.x + p.w / 2 - 22, p.y, 10, CONFIG.GROUND_Y - p.y);
              stepLegs.lineStyle(3, 0x583101, 1);
              stepLegs.lineBetween(p.x - p.w / 2 + 16, p.y + 6, p.x + p.w / 2 - 16, CONFIG.GROUND_Y - 4);

              const tile = this.add.tileSprite(p.x, p.y, p.w, 22, 'platform_tile').setDepth(18);
              this.physics.add.existing(tile, true);
              this.platforms.add(tile);
              return;
            }

            const isStorm = p.cloudType === 'storm';
            const tex = isStorm ? 'platform_cloud_storm' : 'platform_cloud';
            const tile = this.add.tileSprite(p.x, p.y, p.w, 28, tex).setDepth(18);
            this.physics.add.existing(tile, true);
            this.platforms.add(tile);

            let stormIcon = null;
            if (isStorm) {
              stormIcon = this.add.text(p.x, p.y - 22, '⚡', {
                fontSize: '15px',
                fontStyle: 'bold',
                color: '#ffea00'
              }).setOrigin(0.5).setDepth(19).setAlpha(0.65);
            }

            this.cloudPlatforms.push({
              sprite: tile,
              baseX: p.x,
              baseY: p.y,
              w: p.w,
              cloudType: p.cloudType || 'normal',
              moveRange: p.moveRange || p.moveX || 0,
              moveSpeed: p.moveSpeed || p.speed || 0.002,
              phase: idx * 1.15,
              stormIcon,
              lastZapCycle: -1
            });
          } else {
            const isCrystal = Boolean(isLevel4 && p.isCrystalPlatform);
            const platTex = isCrystal
              ? 'platform_crystal_salt'
              : (isLevel4
                ? 'platform_tile_steppe'
                : (isLevel2 ? 'platform_tile_dark' : 'platform_tile'));
            const tile = this.add.tileSprite(p.x, p.y, p.w, 24, platTex);
            if (isCrystal) tile.setDepth(19);
            this.physics.add.existing(tile, true);
            this.platforms.add(tile);

            if (isCrystal) {
              this.crystalPlatforms.push({
                sprite: tile,
                x: p.x,
                y: p.y,
                w: p.w,
                tier: p.tier || 1,
                fragile: Boolean(p.fragile),
                standTimer: 0,
                isBroken: false,
                respawnAt: 0
              });
            }

            if (isLevel4 && p.isCoastLow) {
              const waveFoam = this.add.rectangle(p.x, CONFIG.GROUND_Y - 4, p.w + 18, 12, 0xffcad4, 0.75)
                .setDepth(22)
                .setVisible(false);
              const waveCrest = this.add.ellipse(p.x, p.y - 6, p.w + 14, 16, 0x90e0ef, 0.85)
                .setDepth(23)
                .setVisible(false);
              this.coastalWavePlatforms.push({
                sprite: tile,
                x: p.x,
                y: p.y,
                w: p.w,
                waveFoam,
                waveCrest
              });
            }
          }
        });

        // 3. Create Checkpoints
        this.activeCheckpoint = (this.startAtBoss && this.levelData.bossArenaStartX)
          ? { x: this.levelData.bossArenaStartX - 65, y: CONFIG.GROUND_Y - 45, id: 99 }
          : { x: 120, y: CONFIG.GROUND_Y - 45, id: 0 };
        this.checkpointObjects = [];
        const checkpointTextureMap = {
          well: 'checkpoint_well',
          pillar: 'checkpoint_pillar',
          cart: 'checkpoint_cart',
          baba: 'checkpoint_baba',
          boat: 'checkpoint_boat'
        };
        this.levelData.checkpoints.forEach(cp => {
          const tex = checkpointTextureMap[cp.type] || 'checkpoint_pillar';
          const img = this.add.image(cp.x, cp.y - 40, tex);
          if (GAME_STATE.isHardcore()) {
            img.setTint(0x555555);
          } else if (isLevel4) {
            img.setTint(0xfefae0);
          } else if (isLevel3) {
            img.setTint(0x90e0ef);
          } else if (isLevel2) {
            img.setTint(0x95d5b2);
          }
          const lbl = this.add.text(
            cp.x,
            cp.y - 92,
            GAME_STATE.isHardcore() ? '✖ Без чекпоїнтів' : '★ Чекпоїнт',
            {
              fontSize: '13px',
              fontStyle: 'bold',
              color: GAME_STATE.isHardcore() ? '#ff6b6b' : '#adb5bd'
            }
          ).setOrigin(0.5);
          this.checkpointObjects.push({ ...cp, sprite: img, label: lbl, activated: false });
        });

        // Boss Arena Gate Marker
        this.add.text(
          this.levelData.bossArenaStartX + 20,
          CONFIG.GROUND_Y - 115,
          isLevel4
            ? STRINGS.STEPPE_ARENA_GATE
            : (isLevel3
              ? '⚠ ПОРОГИ ВОДЯНОГО ЦАРЯ ТА СОМА →'
              : (isLevel2 ? '⚠ ГАЛЯВИНА ЧОРНОБОРА →' : '⚠ ПТАШИНИЙ ДВІР ПІВНЯ →')),
          {
            fontSize: '16px',
            fontStyle: 'bold',
            color: isLevel4 ? '#ffd166' : (isLevel3 ? '#48cae4' : (isLevel2 ? '#ff6b6b' : '#ffbe0b')),
            backgroundColor: isLevel4 ? '#2b192e' : (isLevel3 ? '#031d38' : (isLevel2 ? '#1a0f1e' : '#2b2d42')),
            padding: { x: 8, y: 4 }
          }
        );

        // 4. Create Player & Platform Collisions
        this.player = new Player(this, this.activeCheckpoint.x, this.activeCheckpoint.y);
        this.player.coins = this.initialCoins;
        this.physics.add.collider(this.player.sprite, this.platforms, (playerSprite, platSprite) => {
          if ((isLevel3 || isLevel4) && playerSprite.body.blocked.down) {
            this.lastSafePerch = {
              x: Phaser.Math.Clamp(playerSprite.x, platSprite.x - platSprite.width * 0.3, platSprite.x + platSprite.width * 0.3),
              y: platSprite.y - 38
            };
          }
        });
        if (this.groundBody) {
          this.physics.add.collider(
            this.player.sprite,
            this.groundBody,
            null,
            (playerSprite) => {
              if (playerSprite.body.velocity.y < 0) return false;
              if (this.time.now < this.player.dropThroughUntil) return false;
              const prevBottom = playerSprite.body.prev.y + playerSprite.body.height;
              if (prevBottom <= CONFIG.GROUND_Y + 14) return true;
              if (playerSprite.body.bottom <= CONFIG.GROUND_Y + 28) return true;
              return false;
            },
            this
          );
        }

        // 5. Setup Camera with Lookahead Target & Deadzone
        this.camTarget = this.add.zone(this.player.sprite.x, this.player.sprite.y - 25, 1, 1);
        this.cameras.main.setBounds(0, 0, this.worldWidth, CONFIG.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.camTarget, true, CONFIG.CAMERA.LERP_X, CONFIG.CAMERA.LERP_Y);
        this.cameras.main.setDeadzone(CONFIG.CAMERA.DEADZONE_W, CONFIG.CAMERA.DEADZONE_H);

        // 6. Create Enemies & Boss (Act I vs. Act II "Злий Ліс" vs. Act III "На Дніпрі")
        this.enemies = [];
        this.levelData.enemies.forEach(eData => {
          let enemy;
          if (eData.type === 'goose') {
            enemy = new GooseEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
            if (this.groundBody) this.physics.add.collider(enemy.sprite, this.groundBody);
          } else if (eData.type === 'shield_guardian') {
            enemy = new ShieldGuardianEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
            if (this.groundBody) this.physics.add.collider(enemy.sprite, this.groundBody);
          } else if (eData.type === 'nyavka') {
            enemy = new NyavkaEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
          } else if (eData.type === 'bolotyanyk') {
            enemy = new BolotyanykEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
            if (this.groundBody) this.physics.add.collider(enemy.sprite, this.groundBody);
          } else if (eData.type === 'rusalka') {
            enemy = new RusalkaEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
          } else if (eData.type === 'vodyanyk') {
            enemy = new VodyanykEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
          } else if (eData.type === 'potercha') {
            enemy = new PoterchaEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
          } else if (eData.type === 'polovyk') {
            enemy = new PolovykEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
            if (this.groundBody) this.physics.add.collider(enemy.sprite, this.groundBody);
          } else if (eData.type === 'vovkulaka') {
            enemy = new VovkulakaEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
            if (this.groundBody) this.physics.add.collider(enemy.sprite, this.groundBody);
          } else if (eData.type === 'tumbleweed') {
            enemy = new TumbleweedEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
            if (this.groundBody) this.physics.add.collider(enemy.sprite, this.groundBody);
          } else if (eData.type === 'seagull') {
            enemy = new SeagullEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
          } else {
            // Pesyholovtsi (LeshyEnemy) move on the surface AND burrow underground to hide from Omelko!
            enemy = new LeshyEnemy(this, eData.x, eData.y, eData.minX, eData.maxX);
            this.physics.add.collider(enemy.sprite, this.platforms);
            this.physics.add.collider(enemy.sprite, this.undergroundFloorGroup);
            if (this.groundBody) {
              this.physics.add.collider(
                enemy.sprite,
                this.groundBody,
                null,
                (enemySprite) => {
                  const ref = enemySprite.enemyRef;
                  if (ref && this.time.now < ref.burrowPassUntil) return false;
                  if (enemySprite.body.velocity.y < 0) return false;
                  const prevBottom = enemySprite.body.prev.y + enemySprite.body.height;
                  if (prevBottom <= CONFIG.GROUND_Y + 18) return true;
                  return enemySprite.body.bottom <= CONFIG.GROUND_Y + 28;
                },
                this
              );
            }
          }
          this.enemies.push(enemy);
        });

        if (isLevel4) {
          this.boss = new SalyonohorychBoss(this, this.levelData.bossArenaStartX);
          this.boss.heads.forEach(head => {
            this.enemies.push(head);
          });
        } else if (isLevel3) {
          this.boss = new VodyanykTsarBoss(this, this.levelData.bossSpawnX, CONFIG.GROUND_Y - 58);
        } else if (isLevel2) {
          this.boss = new DarkLisovykBoss(this, this.levelData.bossSpawnX, CONFIG.GROUND_Y - 58);
        } else {
          this.boss = new MadRoosterBoss(this, this.levelData.bossSpawnX, CONFIG.GROUND_Y - 50);
        }
        if (this.boss && !this.boss.isCompositeZmiy) {
          this.physics.add.collider(this.boss.sprite, this.platforms);
          if (this.groundBody) this.physics.add.collider(this.boss.sprite, this.groundBody);
          this.enemies.push(this.boss);
        }

        // 7. Create Projectiles & Loot Physics Groups
        this.galushkaGroup = this.physics.add.group();
        this.physics.add.collider(this.galushkaGroup, this.platforms, (obj1, obj2) => {
          const g = this.galushkaGroup.contains(obj1) ? obj1 : obj2;
          if (g && g.active) g.destroy();
        });
        if (this.groundBody) {
          this.physics.add.collider(this.galushkaGroup, this.groundBody, (obj1, obj2) => {
            const g = (obj1 === this.groundBody) ? obj2 : obj1;
            if (g && g !== this.groundBody && g.active) g.destroy();
          });
        }

        this.enemyProjectiles = this.physics.add.group();
        this.physics.add.collider(this.enemyProjectiles, this.platforms, (proj) => {
          if (
            proj &&
            proj.active &&
            (proj.texture.key === 'pinecone' ||
              proj.texture.key === 'swamp_glob' ||
              proj.texture.key === 'water_orb' ||
              proj.texture.key === 'salt_shard' ||
              proj.texture.key === 'salt_boulder') &&
            proj.body.velocity.y > 0
          ) {
            proj.destroy();
          }
        });
        if (this.groundBody) {
          this.physics.add.collider(this.enemyProjectiles, this.groundBody, (obj1, obj2) => {
            const proj = (obj1 === this.groundBody) ? obj2 : obj1;
            if (
              proj &&
              proj !== this.groundBody &&
              proj.active &&
              proj.texture &&
              (proj.texture.key === 'swamp_glob' ||
                proj.texture.key === 'salt_shard' ||
                proj.texture.key === 'salt_boulder') &&
              proj.body.velocity.y > 0
            ) {
              proj.destroy();
            }
          });
        }

        this.lootGroup = this.physics.add.group();
        this.physics.add.collider(this.lootGroup, this.platforms);
        if (this.groundBody) this.physics.add.collider(this.lootGroup, this.groundBody);

        // 8. UI & Pause / Menu Keyboard Shortcuts
        this.ui = new UI(this, false);
        this.pauseStartedAt = 0;

        // Play the Act's exploration soundtrack (switches to Boss theme when entering Boss Arena)
        this.playLevelExplorationMusic();

        if (isLevel4) {
          this.isControlsModalOpen = false;
          this.ui.setControlsModalVisible(false);
          this.cameras.main.fadeIn(450, 26, 20, 38);
          if (SFX.windWhistle) SFX.windWhistle();
          this.showFloatingText(this.player.sprite.x + 80, this.player.sprite.y - 85, `🌾 ${STRINGS.LEVEL_4_TITLE} — ${STRINGS.LEVEL_4_SUBTITLE}`, '#ffd166');
          this.time.delayedCall(450, () => {
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_STEPPE, 5400);
          });
        } else if (isLevel3) {
          this.isControlsModalOpen = false;
          this.ui.setControlsModalVisible(false);
          this.cameras.main.fadeIn(450, 8, 24, 44);
          SFX.waterSplash();
          this.showFloatingText(this.player.sprite.x + 80, this.player.sprite.y - 85, `🌊 ${STRINGS.LEVEL_3_TITLE} — ${STRINGS.LEVEL_3_SUBTITLE}`, '#48cae4');
          this.time.delayedCall(450, () => {
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_DNIPRO, 5200);
          });
        } else if (isLevel2) {
          // In Act II ("Злий Ліс"), start immediately with atmospheric intro banner & Omelko's remark
          this.isControlsModalOpen = false;
          this.ui.setControlsModalVisible(false);
          this.cameras.main.fadeIn(450, 10, 12, 20);
          SFX.lisovykRoar();
          this.showFloatingText(this.player.sprite.x + 60, this.player.sprite.y - 85, `🌲 ${STRINGS.LEVEL_2_TITLE} — ${STRINGS.LEVEL_2_SUBTITLE}`, '#ff9f1c');
          this.time.delayedCall(450, () => {
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_EVIL_FOREST, 5000);
          });
        } else {
          // Show stylized Controls Guide Modal upon exiting the hut into Level 1
          this.isControlsModalOpen = true;
          this.controlsModalReadyTime = this.time.now + 250;
          this.physics.world.pause();
          this.ui.setControlsModalVisible(true);
          SFX.itemFanfare();
        }

        this.input.keyboard.on('keydown-ESC', () => {
          if (this.isControlsModalOpen) {
            this.closeControlsModal();
          } else if (!this.isDeathModalOpen) {
            this.togglePause();
          }
        });
        this.input.keyboard.on('keydown-P', () => {
          if (!this.isControlsModalOpen && !this.isDeathModalOpen) this.togglePause();
        });

        // Keyboard navigation & hotkeys inside Controls Modal, Pause Menu, Death Modal, and Victory Screen
        this.input.keyboard.on('keydown-UP', () => {
          if (this.isPaused) this.ui.movePauseSelection(-1);
          else if (this.isDeathModalOpen) this.ui.moveDeathSelection(-1);
        });
        this.input.keyboard.on('keydown-W', () => {
          if (this.isPaused) this.ui.movePauseSelection(-1);
          else if (this.isDeathModalOpen) this.ui.moveDeathSelection(-1);
        });
        this.input.keyboard.on('keydown-DOWN', () => {
          if (this.isPaused) this.ui.movePauseSelection(1);
          else if (this.isDeathModalOpen) this.ui.moveDeathSelection(1);
        });
        this.input.keyboard.on('keydown-S', () => {
          if (this.isPaused) this.ui.movePauseSelection(1);
          else if (this.isDeathModalOpen) this.ui.moveDeathSelection(1);
        });
        this.input.keyboard.on('keydown-ENTER', () => {
          if (this.isControlsModalOpen) {
            this.closeControlsModal();
          } else if (this.isDeathModalOpen) {
            this.ui.activateSelectedDeathButton();
          } else if (this.isPaused) {
            this.ui.activateSelectedPauseButton();
          } else if (this.isVictory) {
            if (this.currentLevel === 4) this.returnToTitleFromAct4();
            else this.goToHutScene();
          }
        });
        this.input.keyboard.on('keydown-SPACE', () => {
          if (this.isControlsModalOpen) {
            this.closeControlsModal();
          } else if (this.isDeathModalOpen) {
            this.ui.activateSelectedDeathButton();
          } else if (this.isPaused) {
            this.ui.activateSelectedPauseButton();
          } else if (this.isVictory) {
            if (this.currentLevel === 4) this.returnToTitleFromAct4();
            else this.goToHutScene();
          }
        });
        this.input.keyboard.on('keydown-C', () => {
          if (this.isPaused && !GAME_STATE.isHardcore()) this.returnToCheckpointFromMenu();
        });
        this.input.keyboard.on('keydown-R', () => {
          if (this.isPaused || this.isVictory || this.isDeathModalOpen) this.restartLevel();
        });
        this.input.keyboard.on('keydown-H', () => {
          if (this.isPaused) this.goToHutScene();
        });
        this.input.keyboard.on('keydown-M', () => {
          this.toggleSoundMute();
        });
      }

      playLevelExplorationMusic() {
        if (this.currentLevel === 4) {
          SFX.playMusic('mus_act4', { volume: 0.42 });
        } else if (this.currentLevel === 3) {
          SFX.playMusic('mus_act3', { volume: 0.40 });
        } else if (this.currentLevel === 2) {
          SFX.playMusic('mus_act2', { volume: 0.40 });
        } else {
          SFX.playMusic('mus_act1', { volume: 0.40 });
        }
      }

      closeControlsModal() {
        if (!this.isControlsModalOpen) return;
        if (this.time.now < this.controlsModalReadyTime) return;

        this.isControlsModalOpen = false;
        this.ui.setControlsModalVisible(false);
        this.physics.world.resume();
        SFX.pickup();

        // Omelko's comic remark about Hrytsko's geese right after dismissing the controls guide
        this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_GEESE, 4200);
      }

      showOmelkoSpeech(text, duration = 4200) {
        if (this.activeSpeechBubble) {
          this.activeSpeechBubble.destroy();
          this.activeSpeechBubble = null;
        }
        if (this.speechBubbleTimer) {
          this.speechBubbleTimer.remove();
          this.speechBubbleTimer = null;
        }

        const container = this.add.container(this.player.sprite.x, this.player.sprite.y - 68).setDepth(145);
        const txt = this.add.text(0, -4, text, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#1d1e2c',
          align: 'center',
          lineSpacing: 3
        }).setOrigin(0.5);

        const padX = 28;
        const padY = 18;
        const bw = Math.max(240, txt.width + padX * 2);
        const bh = Math.max(46, txt.height + padY);

        const bg = this.add.graphics();
        bg.fillStyle(0xfefae0, 0.97);
        bg.lineStyle(3, 0xc1121f, 1);
        bg.fillRoundedRect(-bw / 2, -bh / 2 - 4, bw, bh, 12);
        bg.strokeRoundedRect(-bw / 2, -bh / 2 - 4, bw, bh, 12);
        // Pointer triangle toward Omelko's head
        bg.fillTriangle(-9, bh / 2 - 4, 9, bh / 2 - 4, 0, bh / 2 + 10);

        container.add([bg, txt]);
        container.bubbleHalfWidth = bw / 2;
        container.setScale(0.75);

        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });

        SFX.speechBlip();
        this.activeSpeechBubble = container;

        this.speechBubbleTimer = this.time.delayedCall(duration, () => {
          if (this.activeSpeechBubble === container && container.active) {
            this.tweens.add({
              targets: container,
              alpha: 0,
              y: container.y - 14,
              duration: 240,
              onComplete: () => {
                if (container.active) container.destroy();
                if (this.activeSpeechBubble === container) this.activeSpeechBubble = null;
              }
            });
          }
        });
      }

      createParallaxBackground() {
        const gY = CONFIG.GROUND_Y; // 405

        if (this.currentLevel === 4) {
          this.createSteppeParallaxBackground();
          return;
        }

        if (this.currentLevel === 3) {
          // ====================================================================
          // ACT III: «НА ДНІПРІ» — WIDE DNIPRO RIVER RAPIDS, GRANITE CLIFFS & CLOUDS
          // ====================================================================
          const sky = this.add.graphics().setScrollFactor(0);
          sky.fillGradientStyle(0x071a33, 0x0d2b52, 0x1d4e89, 0x48cae4, 1);
          sky.fillRect(0, 0, CONFIG.WIDTH, gY + 10);

          // Glowing golden-amber sun reflecting over the Dnipro horizon
          sky.fillStyle(0xffd166, 0.22);
          sky.fillCircle(740, 102, 74);
          sky.fillStyle(0xffea00, 0.88);
          sky.fillCircle(740, 102, 42);

          // Layer 1 (Far, scrollFactor 0.16): Distant Dnipro Granite Cliffs (Пороги) & Cossack Watchtowers
          const layer1 = this.add.graphics().setScrollFactor(0.16);
          for (let x = 0; x < 2400; x += 260) {
            layer1.fillStyle(0x16324f, 1);
            layer1.fillTriangle(x, gY, x + 110, gY - 190, x + 235, gY);
            layer1.fillStyle(0x1d3f5e, 1);
            layer1.fillTriangle(x + 90, gY, x + 185, gY - 150, x + 275, gY);
            // Cossack wooden signal tower (фігура/вежа) on every second cliff
            if (x % 520 === 0) {
              layer1.lineStyle(3, 0x0b1d2e, 0.9);
              layer1.lineBetween(x + 102, gY - 185, x + 94, gY - 220);
              layer1.lineBetween(x + 118, gY - 185, x + 126, gY - 220);
              layer1.fillStyle(0xff9f1c, 0.85);
              layer1.fillCircle(x + 110, gY - 222, 5);
            }
          }

          // Layer 2 (Mid, scrollFactor 0.4): Granite Boulders in the Dnipro Rapids & Weeping Willows
          const layer2 = this.add.graphics().setScrollFactor(0.4);
          for (let x = 60; x < 3400; x += 210) {
            // River granite boulder (дніпровський поріг)
            layer2.fillStyle(0x2a475e, 0.95);
            layer2.fillEllipse(x + 40, gY - 10, 120, 74);
            layer2.fillStyle(0x3d5a73, 0.9);
            layer2.fillEllipse(x + 32, gY - 20, 82, 46);
            // White water spray at boulder base
            layer2.fillStyle(0xcaf0f8, 0.65);
            layer2.fillEllipse(x + 40, gY - 2, 130, 12);
          }

          // Layer 3 (Near, scrollFactor 0.72): Cattails / Reeds (очерет) & Drifting River Mist
          const layer3 = this.add.graphics().setScrollFactor(0.72);
          for (let x = 30; x < 4800; x += 145) {
            layer3.fillStyle(0x90e0ef, 0.12);
            layer3.fillEllipse(x + 65, gY - 16, 165, 28);
            // Tall Dnipro reeds (очерет і рогіз)
            layer3.lineStyle(2.5, 0x1b4332, 0.9);
            layer3.lineBetween(x, gY, x - 6, gY - 46);
            layer3.lineBetween(x + 12, gY, x + 18, gY - 52);
            layer3.fillStyle(0x583101, 1);
            layer3.fillEllipse(x - 6, gY - 42, 5, 14);
            layer3.fillEllipse(x + 18, gY - 48, 5, 14);
          }
          return;
        }

        if (this.currentLevel === 2) {
          // ====================================================================
          // ACT II: «ЗЛИЙ ЛІС» — DARK, GLOOMY & EERIE UKRAINIAN MYTHOLOGY FOREST
          // ====================================================================
          const sky = this.add.graphics().setScrollFactor(0);
          sky.fillGradientStyle(0x070810, 0x0d1021, 0x16242b, 0x1e3832, 1);
          sky.fillRect(0, 0, CONFIG.WIDTH, gY + 10);

          // Eerie blood-amber full moon shrouded in forest mist
          sky.fillStyle(0xff6b35, 0.16);
          sky.fillCircle(760, 88, 66);
          sky.fillStyle(0xff9f1c, 0.35);
          sky.fillCircle(760, 88, 48);
          sky.fillStyle(0xffd166, 0.85);
          sky.fillCircle(760, 88, 34);

          // Layer 1 (Far, scrollFactor 0.16): Silhouette of ancient cursed ridges & dead pines
          const layer1 = this.add.graphics().setScrollFactor(0.16);
          layer1.fillStyle(0x0d171a, 1);
          for (let x = 0; x < 2400; x += 220) {
            layer1.fillEllipse(x + 110, gY - 20, 320, 210);
            // Jagged dead pine spires
            layer1.fillStyle(0x091014, 0.95);
            layer1.fillTriangle(x + 60, gY - 20, x + 90, gY - 20, x + 75, gY - 185);
            layer1.fillTriangle(x + 140, gY - 20, x + 166, gY - 20, x + 153, gY - 160);
            layer1.fillStyle(0x0d171a, 1);
          }

          // Layer 2 (Mid, scrollFactor 0.42): Gnarled Black Oaks, Swamp Willows & Watching Red Eyes
          const layer2 = this.add.graphics().setScrollFactor(0.42);
          for (let x = 40; x < 3400; x += 175) {
            // Massive twisted black-oak trunk
            layer2.fillStyle(0x13191d, 1);
            layer2.fillRect(x + 20, gY - 175, 28, 175);
            // Gnarled roots gripping the ground
            layer2.fillTriangle(x + 4, gY, x + 24, gY - 32, x + 28, gY);
            layer2.fillTriangle(x + 44, gY, x + 46, gY - 32, x + 64, gY);
            // Crooked branches
            layer2.lineStyle(5, 0x13191d, 1);
            layer2.lineBetween(x + 26, gY - 125, x - 12, gY - 155);
            layer2.lineBetween(x + 42, gY - 135, x + 78, gY - 168);

            // Dark oppressive canopy
            layer2.fillStyle(0x112622, 0.96);
            layer2.fillCircle(x + 34, gY - 190, 62);
            layer2.fillCircle(x + 8, gY - 160, 46);
            layer2.fillCircle(x + 62, gY - 160, 46);

            // Eerie glowing eyes peeking out from tree hollows every second tree
            if (x % 350 === 40) {
              layer2.fillStyle(0xff2a2a, 0.9);
              layer2.fillCircle(x + 30, gY - 82, 2.5);
              layer2.fillCircle(x + 38, gY - 82, 2.5);
            } else if (x % 525 === 0) {
              layer2.fillStyle(0xffea00, 0.85);
              layer2.fillCircle(x + 29, gY - 98, 2);
              layer2.fillCircle(x + 37, gY - 98, 2);
            }
          }

          // Layer 3 (Near, scrollFactor 0.76): Swamp mist, bioluminescent mushrooms, crookedtotems & ferns
          const layer3 = this.add.graphics().setScrollFactor(0.76);
          for (let x = 30; x < 4800; x += 130) {
            // Low creeping swamp mist bank
            layer3.fillStyle(0x52b788, 0.08);
            layer3.fillEllipse(x + 60, gY - 14, 150, 28);

            // Thorny brambles
            layer3.lineStyle(2.5, 0x1b2f26, 0.9);
            layer3.lineBetween(x, gY, x + 18, gY - 26);
            layer3.lineBetween(x + 18, gY - 26, x + 34, gY - 8);

            // Glowing cyan/emerald forest mushrooms (Мавчині гриби)
            layer3.fillStyle(0xd8f3dc, 0.85);
            layer3.fillRect(x + 74, gY - 14, 4, 14);
            layer3.fillStyle(0x00f5d4, 0.85);
            layer3.fillEllipse(x + 76, gY - 15, 14, 7);

            layer3.fillStyle(0xd8f3dc, 0.75);
            layer3.fillRect(x + 86, gY - 9, 3, 9);
            layer3.fillStyle(0x80ffdb, 0.85);
            layer3.fillEllipse(x + 87.5, gY - 10, 10, 5);
          }

          // Floating eerie spore / Will-o'-the-wisp particles drifting in screen space
          this.forestSpores = [];
          for (let i = 0; i < 18; i++) {
            const sp = this.add.circle(
              Phaser.Math.Between(20, CONFIG.WIDTH - 20),
              Phaser.Math.Between(40, gY - 10),
              Phaser.Math.Between(2, 3.5),
              i % 3 === 0 ? 0xff9f1c : 0x52b788,
              0.42
            ).setScrollFactor(0).setDepth(5);
            this.tweens.add({
              targets: sp,
              y: sp.y - Phaser.Math.Between(18, 42),
              x: sp.x + Phaser.Math.Between(-24, 24),
              alpha: { from: 0.18, to: 0.58 },
              duration: Phaser.Math.Between(1800, 3400),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
            this.forestSpores.push(sp);
          }
          return;
        }

        // ====================================================================
        // ACT I: SUNNY UKRAINIAN VILLAGE & STEPPE OUTSKIRTS
        // ====================================================================
        const sky = this.add.graphics().setScrollFactor(0);
        sky.fillGradientStyle(0x1d3557, 0x1d3557, 0x457b9d, 0xa8dadc, 1);
        sky.fillRect(0, 0, CONFIG.WIDTH, gY + 10);
        sky.fillStyle(0xffea00, 0.85);
        sky.fillCircle(780, 82, 38);

        // Layer 1 (Far, scrollFactor 0.18): Distant Ukrainian steppe hills & windmills aligned to gY
        const layer1 = this.add.graphics().setScrollFactor(0.18);
        layer1.fillStyle(0x2b4c65, 1);
        for (let x = 0; x < 1800; x += 260) {
          layer1.fillEllipse(x + 120, gY - 15, 340, 195);
          // Distant windmill silhouette
          if (x % 520 === 0) {
            layer1.fillRect(x + 115, gY - 145, 14, 40);
            layer1.lineStyle(2, 0xe0e1dd, 0.7);
            layer1.lineBetween(x + 100, gY - 155, x + 144, gY - 115);
            layer1.lineBetween(x + 144, gY - 155, x + 100, gY - 115);
          }
        }

        // Layer 2 (Mid, scrollFactor 0.45): Whitewashed Huts (in village section) & Forest Trees aligned to gY
        const layer2 = this.add.graphics().setScrollFactor(0.45);
        for (let x = 80; x < 2800; x += 220) {
          if (x < 950) {
            // Village Khata silhouette
            layer2.fillStyle(0xf1faee, 0.9);
            layer2.fillRect(x, gY - 85, 85, 65);
            layer2.fillStyle(0x7f4f24, 1);
            layer2.fillTriangle(x - 12, gY - 85, x + 97, gY - 85, x + 42, gY - 125);
          } else {
            // Dense Oak & Pine Forest silhouettes
            layer2.fillStyle(0x264653, 1);
            layer2.fillRect(x + 28, gY - 120, 18, 120);
            layer2.fillStyle(0x2a6f4e, 0.95);
            layer2.fillCircle(x + 37, gY - 150, 52);
            layer2.fillCircle(x + 18, gY - 125, 38);
            layer2.fillCircle(x + 56, gY - 125, 38);
          }
        }

        // Layer 3 (Near, scrollFactor 0.78): Wattle fence (тинок), bushes & sunflowers resting on gY
        const layer3 = this.add.graphics().setScrollFactor(0.78);
        for (let x = 40; x < 4000; x += 140) {
          // Wattle fence posts
          layer3.fillStyle(0x6f4518, 0.85);
          layer3.fillRect(x, gY - 38, 6, 38);
          layer3.fillRect(x + 40, gY - 38, 6, 38);
          layer3.fillRect(x, gY - 28, 46, 5);
          layer3.fillRect(x, gY - 15, 46, 5);
          // Sunflowers (соняшники)
          layer3.fillStyle(0x386641, 1);
          layer3.fillRect(x + 75, gY - 50, 4, 50);
          layer3.fillStyle(0xffbe0b, 1);
          layer3.fillCircle(x + 77, gY - 52, 11);
          layer3.fillStyle(0x583101, 1);
          layer3.fillCircle(x + 77, gY - 52, 6);
        }
      }

      update(time, delta) {
        if (this.isControlsModalOpen || this.isPaused || this.isDeathModalOpen || this.isVictory) return;

        this.player.update(time, delta);

        // ====================================================================
        // ACT III ("НА ДНІПРІ") & ACT IV ("ДИКЕ ПОЛЕ І ЧОРНЕ МОРЕ") MECHANICS
        // ====================================================================
        if (this.currentLevel === 3) {
          this.updateDniproCloudsAndTraps(time, delta);
        } else if (this.currentLevel === 4) {
          this.updateSteppeAtmosphereAndMechanics(time, delta);
        }

        // Keep Omelko's active speech bubble centered above his head & clamped inside camera view
        if (this.activeSpeechBubble && this.activeSpeechBubble.active) {
          const cam = this.cameras.main;
          const halfW = this.activeSpeechBubble.bubbleHalfWidth || 160;
          const clampedX = Phaser.Math.Clamp(
            this.player.sprite.x,
            cam.scrollX + halfW + 14,
            cam.scrollX + CONFIG.WIDTH - halfW - 14
          );
          this.activeSpeechBubble.setPosition(clampedX, Math.max(58, this.player.sprite.y - 68));
        }

        // Update Camera Lookahead smoothly in movement direction
        const targetOffset = this.player.facing * CONFIG.CAMERA.LOOKAHEAD_X;
        this.lookaheadX = Phaser.Math.Linear(this.lookaheadX, targetOffset, CONFIG.CAMERA.LOOKAHEAD_LERP);
        this.camTarget.setPosition(this.player.sprite.x + this.lookaheadX, this.player.sprite.y - 25);

        // Trigger Omelko's remarks in Level 4 ("Дике поле і Чорне море")
        if (this.currentLevel === 4) {
          if (!this.hasSeenSteppeEnemy) {
            const firstSteppeFoe = this.enemies.find(
              e => !e.isFinished && Math.abs(e.sprite.x - this.player.sprite.x) < 340
            );
            if (firstSteppeFoe) {
              this.hasSeenSteppeEnemy = true;
              this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_POLOVYK, 4800);
            }
          }
          if (!this.hasSeenSyvashCoast && this.player.sprite.x >= CONFIG.STEPPE.COAST_START_X - 80) {
            this.hasSeenSyvashCoast = true;
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_COAST, 5000);
          }
        }

        // Trigger Omelko's remark when encountering the first Rusalka in Level 3 ("На Дніпрі")
        if (this.currentLevel === 3 && !this.hasSeenRusalka) {
          const firstRusalka = this.enemies.find(
            e => (e instanceof RusalkaEnemy) && !e.isFinished && Math.abs(e.sprite.x - this.player.sprite.x) < 340
          );
          if (firstRusalka) {
            this.hasSeenRusalka = true;
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_RUSALKA, 4800);
          }
        }

        // Trigger Omelko's tactical remark when encountering the first Shielded Moss Guardian in Level 2
        if (this.currentLevel === 2 && !this.hasSeenShieldGuardian) {
          const firstShield = this.enemies.find(
            e => (e instanceof ShieldGuardianEnemy) && !e.isFinished && Math.abs(e.sprite.x - this.player.sprite.x) < 380
          );
          if (firstShield) {
            this.hasSeenShieldGuardian = true;
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_SHIELD, 4800);
          }
        }

        // Trigger Omelko's surprise line the first time a Pesyholovets (LeshyEnemy) enters view in Level 1
        if (this.currentLevel === 1 && !this.hasSeenPesyholovets) {
          const firstMonster = this.enemies.find(
            e => (e instanceof LeshyEnemy) && !e.isFinished && Math.abs(e.sprite.x - this.player.sprite.x) < 420
          );
          if (firstMonster) {
            this.hasSeenPesyholovets = true;
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_MONSTER, 4400);
          }
        }

        // Check Checkpoints
        this.checkpointObjects.forEach(cp => {
          if (!cp.activated && Math.abs(this.player.sprite.x - cp.x) < 48) {
            cp.activated = true;
            if (GAME_STATE.isHardcore()) {
              this.showFloatingText(cp.x, cp.y - 125, STRINGS.CHECKPOINT_DISABLED_HARDCORE, '#ff6b6b');
            } else {
              this.activeCheckpoint = { x: cp.x, y: cp.y - 40, id: cp.id };
              this.lastSafePerch = { x: cp.x, y: cp.y - 42 };
              cp.label.setText('★ Чекпоїнт активний!').setColor('#ffd166');
              this.player.stamina = CONFIG.PLAYER.MAX_STAMINA;
              this.player.uzvarCharges = CONFIG.PLAYER.UZVAR_CHARGES;
              SFX.checkpoint();
              this.showFloatingText(cp.x, cp.y - 125, cp.name, '#00f5d4');
            }
          }
        });

        // Activate Boss when Player enters Boss Arena
        if (this.boss && !this.boss.active && this.player.sprite.x >= this.levelData.bossArenaStartX) {
          this.boss.activate();
          if (this.currentLevel === 4) {
            SFX.playMusic('mus_boss_zmiy', { volume: 0.46 });
            // Lock camera within the Salt Mountain Arena bounds (6240 .. 7200)
            this.cameras.main.setBounds(
              this.levelData.bossArenaStartX,
              0,
              this.worldWidth - this.levelData.bossArenaStartX,
              CONFIG.WORLD_HEIGHT
            );
            this.lastSafePerch = { x: this.levelData.bossArenaStartX + 95, y: CONFIG.GROUND_Y - 42 };
            this.showFloatingText(this.levelData.bossArenaStartX + 460, 175, STRINGS.BOSS_ZMIY_NAME, '#ffd166');
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_ZMIY_BOSS, 5400);
          } else if (this.currentLevel === 3) {
            SFX.playMusic('mus_boss_vodyanyk', { volume: 0.46 });
            this.showFloatingText(this.boss.sprite.x - 80, 195, STRINGS.BOSS_VODYANYK_NAME, '#48cae4');
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_VODYANYK_BOSS, 5200);
          } else if (this.currentLevel === 2) {
            SFX.playMusic('mus_boss_chornobor', { volume: 0.46 });
            this.showFloatingText(this.boss.sprite.x - 80, 195, STRINGS.BOSS_LISOVYK_NAME, '#52b788');
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_LISOVYK, 5200);
          } else {
            SFX.playMusic('mus_boss_rooster', { volume: 0.45 });
            this.showFloatingText(this.boss.sprite.x - 80, 200, STRINGS.BOSS_NAME, '#ffbe0b');
            this.showOmelkoSpeech(STRINGS.OMELKO_REMARK_BOSS, 5200);
          }
        }

        // Update all active Enemies & Boss
        this.enemies.forEach(enemy => {
          if (!enemy.isFinished) {
            enemy.update(time, this.player);
          }
        });
        if (this.boss && this.boss.isCompositeZmiy && !this.boss.isFinished) {
          this.boss.update(time, this.player);
        }

        // Update Galushka / Swamp Frog Projectiles
        this.galushkaGroup.getChildren().forEach(g => {
          g.angle += g.isSwampFrog ? 6 : 10;
          this.enemies.forEach(enemy => {
            if (!enemy.isFinished && g.active && Phaser.Geom.Intersects.RectangleToRectangle(g.getBounds(), enemy.sprite.getBounds())) {
              const stunDmg = g.isSwampFrog ? (CONFIG.PLAYER.GALUSHKA_STUN + 14) : CONFIG.PLAYER.GALUSHKA_STUN;
              enemy.receiveStunHit(stunDmg, g.x, true, false, Boolean(g.isSwampFrog));
              g.destroy();
            }
          });
        });

        // Update Enemy Projectiles (Pinecones, Swamp Globs, Water Orbs, Will-o'-the-Wisps & Boss Shockwaves)
        this.enemyProjectiles.getChildren().forEach(proj => {
          if (proj.isSpinning) proj.angle += 12;
          if (proj.active && Phaser.Geom.Intersects.RectangleToRectangle(proj.getBounds(), this.player.sprite.getBounds())) {
            if (this.player.takeDamage(proj.damageAmount || 15, proj.x)) {
              proj.destroy();
            }
          }
          if (proj.x < 0 || proj.x > this.worldWidth || proj.y > CONFIG.WORLD_HEIGHT) {
            proj.destroy();
          }
        });

        // Update Loot Pickups
        this.lootGroup.getChildren().forEach(item => {
          if (item.active && Phaser.Geom.Intersects.RectangleToRectangle(item.getBounds(), this.player.sprite.getBounds())) {
            SFX.pickup();
            if (item.lootType === 'coin') {
              this.player.coins += 1;
              this.showFloatingText(item.x, item.y - 15, '+1 Червінець', '#ffd166');
            } else if (item.lootType === 'food') {
              this.player.stamina = Math.min(CONFIG.PLAYER.MAX_STAMINA, this.player.stamina + 20);
              this.showFloatingText(item.x, item.y - 15, '+20 Сили', '#2ec4b6');
            } else if (item.lootType === 'galushka') {
              this.player.galushkas = Math.min(CONFIG.PLAYER.MAX_GALUSHKAS, this.player.galushkas + 2);
              this.showFloatingText(
                item.x,
                item.y - 15,
                GAME_STATE.hasSwampFrogs ? '+2 Болотні жаби' : '+2 Галушки',
                GAME_STATE.hasSwampFrogs ? '#80ed99' : '#f6e4b5'
              );
            }
            item.destroy();
          }
        });

        this.ui.updateHUD(this.player, this.boss);
      }

      updateDniproCloudsAndTraps(time, delta) {
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;

        // 1. Update Moving Cloud Platforms & Electric Storm Cloud Traps
        this.cloudPlatforms.forEach(cp => {
          if (cp.cloudType === 'moving' && cp.moveRange > 0) {
            const prevX = cp.sprite.x;
            const newX = cp.baseX + Math.sin(time * cp.moveSpeed + cp.phase) * cp.moveRange;
            const dx = newX - prevX;
            cp.sprite.x = newX;
            cp.sprite.body.updateFromGameObject();

            // Carry Omelko horizontally if he is standing on this moving cloud
            if (
              this.player.sprite.body.blocked.down &&
              Math.abs(this.player.sprite.y + 24 - (cp.sprite.y - 14)) < 14 &&
              Math.abs(this.player.sprite.x - prevX) <= cp.w * 0.54
            ) {
              this.player.sprite.x += dx;
              this.lastSafePerch = { x: this.player.sprite.x, y: cp.sprite.y - 38 };
            }
          } else if (cp.cloudType === 'storm') {
            // Storm clouds cycle every 2800ms: 0..1700 calm, 1700..2350 charging warning, 2350..2800 lightning strike!
            const cycleMs = (time + Math.round(cp.phase * 600)) % 2800;
            const cycleIndex = Math.floor((time + Math.round(cp.phase * 600)) / 2800);

            if (cycleMs < 1700) {
              cp.sprite.clearTint();
              if (cp.stormIcon) cp.stormIcon.setText('⚡').setAlpha(0.55).setScale(1);
            } else if (cycleMs < 2350) {
              // Warning phase: flash yellow-amber
              cp.sprite.setTint((Math.floor(time / 90) % 2 === 0) ? 0xffea00 : 0x90e0ef);
              if (cp.stormIcon) cp.stormIcon.setText('⚡!').setAlpha(1).setScale(1.25);
            } else {
              // Strike phase!
              cp.sprite.setTint(0xffea00);
              if (cp.lastZapCycle !== cycleIndex) {
                cp.lastZapCycle = cycleIndex;
                if (Math.abs(px - cp.sprite.x) < 380) {
                  SFX.lightningZap();
                }
              }
              if (
                Math.abs(px - cp.sprite.x) < cp.w * 0.5 &&
                Math.abs(py + 22 - (cp.sprite.y - 14)) < 22
              ) {
                if (this.player.takeDamage(18, cp.sprite.x)) {
                  this.showFloatingText(px, py - 48, STRINGS.STORM_CLOUD_WARN, '#ffea00');
                }
              }
            }
          }
        });

        // 2. Update Dnipro Water Geyser Traps (Водяні вири)
        this.waterGeysers.forEach(gz => {
          const cycle = (time + gz.phaseOffset) % gz.period;
          const activeStart = gz.period * 0.62;
          const warnStart = gz.period * 0.44;

          if (cycle < warnStart) {
            gz.isErupting = false;
            gz.column.setVisible(false);
            gz.cap.setVisible(false);
            gz.nozzle.setScale(1, 1).setAlpha(0.55);
          } else if (cycle < activeStart) {
            // Bubbling warning on water surface
            gz.isErupting = false;
            gz.column.setVisible(false);
            gz.cap.setVisible(false);
            const pulse = 1 + Math.sin(time * 0.03) * 0.28;
            gz.nozzle.setScale(pulse, pulse).setAlpha(0.95);
          } else {
            // High-pressure water jet erupts upward!
            gz.isErupting = true;
            const jetHeight = 165;
            gz.column.setSize(28, jetHeight).setPosition(gz.x, CONFIG.GROUND_Y).setVisible(true);
            gz.cap.setPosition(gz.x, CONFIG.GROUND_Y - jetHeight).setVisible(true);
            if (Math.abs(px - gz.x) < 22 && py > CONFIG.GROUND_Y - jetHeight - 16 && py < CONFIG.GROUND_Y + 20) {
              this.player.sprite.body.setVelocityY(-460);
              this.player.takeDamage(15, gz.x);
            }
          }
        });

        // 3. Check if Omelko is standing on a wooden bridge / dry island to update lastSafePerch
        const currentIsland = (this.levelData.dryIslands || []).find(isl => {
          const sx = isl.startX !== undefined ? isl.startX : (isl.x - isl.w / 2);
          const ex = isl.endX !== undefined ? isl.endX : (isl.x + isl.w / 2);
          return px >= sx - 8 && px <= ex + 8;
        });
        const onDryIsland = Boolean(currentIsland);
        if (currentIsland && this.player.sprite.body.blocked.down && py <= CONFIG.GROUND_Y) {
          const sx = currentIsland.startX !== undefined ? currentIsland.startX : (currentIsland.x - currentIsland.w / 2);
          const ex = currentIsland.endX !== undefined ? currentIsland.endX : (currentIsland.x + currentIsland.w / 2);
          this.lastSafePerch = {
            x: Phaser.Math.Clamp(px, sx + 32, ex - 32),
            y: CONFIG.GROUND_Y - 42
          };
        }

        // 4. Non-swimmable Dnipro Water Hazard: Omelko cannot fall into the river!
        if (!onDryIsland && py >= CONFIG.GROUND_Y - 6 && time >= this.waterRescueCooldownUntil) {
          this.waterRescueCooldownUntil = time + 650;
          if (this.grabbedByRusalka) {
            this.grabbedByRusalka.state = 'SWIM';
            this.grabbedByRusalka.stateEndTime = time + 1600;
            this.grabbedByRusalka = null;
          }

          SFX.waterSplash();
          this.spawnWaterSplash(px, CONFIG.GROUND_Y, 14);
          this.cameras.main.shake(180, 0.012);

          if (GAME_STATE.isHardcore()) {
            this.player.stamina = 0;
            this.handlePlayerTired();
            return;
          }

          this.player.stamina -= 26;
          if (this.player.stamina <= 0) {
            this.player.stamina = 0;
            this.handlePlayerTired();
            return;
          }

          // Rescue Omelko back onto his last safe cloud or pier with a dramatic upward splash!
          const safeX = this.lastSafePerch ? this.lastSafePerch.x : this.activeCheckpoint.x;
          const safeY = this.lastSafePerch ? this.lastSafePerch.y : (this.activeCheckpoint.y - 20);
          this.player.sprite.setPosition(safeX, safeY - 12);
          this.player.sprite.body.setVelocity(0, -180);
          this.player.invulnUntil = time + 1100;
          this.showFloatingText(safeX, safeY - 45, STRINGS.WATER_HAZARD_MSG, '#48cae4');
        }
      }

      handlePlayerMeleeHit(comboStep, isCounterAttack) {
        const usingSaber = GAME_STATE.hasSaber || this.currentLevel >= 2;
        const rangeX = usingSaber ? CONFIG.PLAYER.ATTACK_RANGE_X + 12 : CONFIG.PLAYER.ATTACK_RANGE_X;
        const hitX = this.player.sprite.x + this.player.facing * (rangeX * 0.55);
        const hitY = this.player.sprite.y;
        const hitBox = new Phaser.Geom.Rectangle(
          hitX - rangeX / 2,
          hitY - CONFIG.PLAYER.ATTACK_RANGE_Y / 2,
          rangeX,
          CONFIG.PLAYER.ATTACK_RANGE_Y
        );

        let baseStun = CONFIG.PLAYER.HIT_1_STUN;
        if (comboStep === 2) baseStun = CONFIG.PLAYER.HIT_2_STUN;
        if (comboStep === 3) baseStun = CONFIG.PLAYER.HIT_3_STUN;
        if (usingSaber) baseStun += 5;
        if (isCounterAttack) baseStun += CONFIG.PLAYER.COUNTER_BONUS_STUN;

        this.enemies.forEach(enemy => {
          if (!enemy.isFinished && Phaser.Geom.Intersects.RectangleToRectangle(hitBox, enemy.sprite.getBounds())) {
            if (isCounterAttack) {
              this.showFloatingText(enemy.sprite.x, enemy.sprite.y - 55, STRINGS.COUNTER_HIT, '#ffea00');
            }
            enemy.receiveStunHit(baseStun, this.player.sprite.x, comboStep === 3 || isCounterAttack, isCounterAttack, false);
          }
        });
      }

      throwPlayerGalushka() {
        const usingFrogs = Boolean(GAME_STATE.hasSwampFrogs);
        if (this.player.galushkas <= 0) {
          this.showFloatingText(
            this.player.sprite.x,
            this.player.sprite.y - 40,
            usingFrogs ? STRINGS.FROG_EMPTY : STRINGS.GALUSHKA_EMPTY,
            '#ff6b6b'
          );
          return;
        }
        this.player.galushkas--;
        if (usingFrogs) {
          SFX.throwFrog();
        } else {
          SFX.throwGalushka();
        }

        const g = this.galushkaGroup.create(
          this.player.sprite.x + this.player.facing * 20,
          this.player.sprite.y - 8,
          usingFrogs ? 'swamp_frog' : 'galushka'
        );
        g.isSwampFrog = usingFrogs;
        g.setFlipX(this.player.facing < 0);
        g.body.setVelocity(
          this.player.facing * CONFIG.PLAYER.GALUSHKA_SPEED_X,
          CONFIG.PLAYER.GALUSHKA_SPEED_Y
        );
        g.body.setAllowGravity(true);
      }

      drinkPlayerUzvar() {
        if (this.player.uzvarCharges <= 0) {
          this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 40, STRINGS.UZVAR_EMPTY, '#ff6b6b');
          return;
        }
        if (this.player.stamina >= CONFIG.PLAYER.MAX_STAMINA) {
          this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 40, STRINGS.UZVAR_FULL, '#8ecae6');
          return;
        }

        this.player.uzvarCharges--;
        this.player.stamina = Math.min(CONFIG.PLAYER.MAX_STAMINA, this.player.stamina + CONFIG.PLAYER.UZVAR_HEAL_AMOUNT);
        SFX.drinkUzvar();
        this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 40, `+${CONFIG.PLAYER.UZVAR_HEAL_AMOUNT} Сили (Кисіль)`, '#00f5d4');
      }

      spawnPinecone(fromX, fromY, targetX, targetY) {
        const cone = this.enemyProjectiles.create(fromX, fromY, 'pinecone');
        const dir = targetX >= fromX ? 1 : -1;
        const dist = Math.min(420, Math.abs(targetX - fromX));
        cone.body.setVelocity(dir * (dist * 0.85 + 90), CONFIG.ENEMY.LESHY.THROW_SPEED_Y);
        cone.isSpinning = true;
        cone.damageAmount = CONFIG.ENEMY.LESHY.DAMAGE;
      }

      spawnSwampGlob(fromX, fromY, targetX, targetY) {
        const glob = this.enemyProjectiles.create(fromX, fromY, 'swamp_glob');
        const dir = targetX >= fromX ? 1 : -1;
        const dist = Math.min(430, Math.abs(targetX - fromX));
        glob.body.setVelocity(dir * (dist * 0.88 + 95), CONFIG.ENEMY.BOLOTYANYK.THROW_SPEED_Y);
        glob.isSpinning = true;
        glob.damageAmount = CONFIG.ENEMY.BOLOTYANYK.DAMAGE;
      }

      spawnWaterOrb(fromX, fromY, targetX, targetY) {
        const orb = this.enemyProjectiles.create(fromX, fromY, 'water_orb');
        const dir = targetX >= fromX ? 1 : -1;
        const dist = Math.min(420, Math.abs(targetX - fromX));
        orb.body.setVelocity(dir * (dist * 0.85 + 95), CONFIG.ENEMY.VODYANYK.THROW_SPEED_Y);
        orb.isSpinning = true;
        orb.damageAmount = CONFIG.ENEMY.VODYANYK.DAMAGE;
      }

      spawnTidalWaves(x, y) {
        [-1, 1].forEach(dir => {
          const wave = this.enemyProjectiles.create(x + dir * 28, y, 'tidal_wave');
          wave.body.setAllowGravity(false);
          wave.body.setVelocityX(dir * CONFIG.ENEMY.BOSS_VODYANYK_TSAR.WAVE_SPEED);
          wave.damageAmount = CONFIG.ENEMY.BOSS_VODYANYK_TSAR.DAMAGE_WAVE;
        });
      }

      spawnWaterSplash(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
          const drop = this.add.circle(x + Phaser.Math.Between(-16, 16), y, Phaser.Math.Between(3, 6), 0x90e0ef, 0.9).setDepth(65);
          const vx = Phaser.Math.Between(-95, 95);
          const vy = Phaser.Math.Between(-140, -45);
          this.tweens.add({
            targets: drop,
            x: drop.x + vx * 0.45,
            y: drop.y + vy * 0.45 + 18,
            alpha: 0,
            scale: 0.25,
            duration: 340,
            onComplete: () => drop.destroy()
          });
        }
      }

      spawnWillOWisp(fromX, fromY, targetX, targetY) {
        const wisp = this.enemyProjectiles.create(fromX, fromY, 'willowisp');
        wisp.body.setAllowGravity(false);
        const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
        const speed = 265;
        wisp.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        wisp.damageAmount = CONFIG.ENEMY.BOSS_LISOVYK.DAMAGE_WISP;
      }

      spawnRootWaves(x, y) {
        [-1, 1].forEach(dir => {
          const wave = this.enemyProjectiles.create(x + dir * 28, y, 'root_wave');
          wave.body.setAllowGravity(false);
          wave.body.setVelocityX(dir * CONFIG.ENEMY.BOSS_LISOVYK.ROOT_WAVE_SPEED);
          wave.damageAmount = CONFIG.ENEMY.BOSS_LISOVYK.DAMAGE_WAVE;
        });
      }

      summonLisovykMinions(bossX, stage) {
        const arenaMin = this.levelData.bossArenaStartX + 60;
        const arenaMax = this.worldWidth - 60;
        const spawnX = Phaser.Math.Clamp(bossX - 140, arenaMin, arenaMax);
        const nyavka = new NyavkaEnemy(this, spawnX, CONFIG.GROUND_Y - 125, arenaMin, arenaMax);
        this.enemies.push(nyavka);

        if (stage === 2) {
          const spawnX2 = Phaser.Math.Clamp(bossX + 140, arenaMin, arenaMax);
          const leshy = new LeshyEnemy(this, spawnX2, CONFIG.GROUND_Y - 40, arenaMin, arenaMax);
          this.physics.add.collider(leshy.sprite, this.platforms);
          this.physics.add.collider(leshy.sprite, this.undergroundFloorGroup);
          if (this.groundBody) this.physics.add.collider(leshy.sprite, this.groundBody);
          this.enemies.push(leshy);
        }
      }

      spawnShockwaves(x, y) {
        [-1, 1].forEach(dir => {
          const wave = this.enemyProjectiles.create(x + dir * 24, y, 'shockwave');
          wave.body.setAllowGravity(false);
          wave.body.setVelocityX(dir * CONFIG.ENEMY.BOSS_ROOSTER.SHOCKWAVE_SPEED);
          wave.damageAmount = CONFIG.ENEMY.BOSS_ROOSTER.DAMAGE_WAVE;
        });
      }

      summonBossChicks(bossX, stage) {
        const count = stage === 2 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const spawnX = Phaser.Math.Clamp(bossX + (i === 0 ? -90 : 90), this.levelData.bossArenaStartX + 50, this.worldWidth - 50);
          const chick = new ChickEnemy(this, spawnX, CONFIG.GROUND_Y - 35);
          this.physics.add.collider(chick.sprite, this.platforms);
          if (this.groundBody) this.physics.add.collider(chick.sprite, this.groundBody);
          this.enemies.push(chick);
        }
      }

      spawnLoot(x, y) {
        const types = ['coin', 'coin', 'food', 'galushka'];
        types.forEach((t, idx) => {
          const tex = t === 'coin'
            ? 'loot_coin'
            : (t === 'food' ? 'loot_food' : (GAME_STATE.hasSwampFrogs ? 'swamp_frog' : 'loot_galushka'));
          const item = this.lootGroup.create(x + (idx - 1.5) * 14, y - 10, tex);
          item.lootType = t;
          item.body.setBounce(0.45);
          item.body.setDragX(180);
          item.body.setVelocity(Phaser.Math.Between(-130, 130), Phaser.Math.Between(-260, -160));
        });
      }

      spawnHitParticles(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
          const star = this.add.image(x, y, 'particle_star');
          const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          const speed = Phaser.Math.Between(35, 95);
          this.tweens.add({
            targets: star,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            angle: 180,
            alpha: 0,
            scale: 0.2,
            duration: 280,
            onComplete: () => star.destroy()
          });
        }
      }

      triggerHitStop(durationMs) {
        if (this.isPaused) return;
        this.physics.world.pause();
        if (this.hitStopTimeout) clearTimeout(this.hitStopTimeout);
        this.hitStopTimeout = setTimeout(() => {
          if (this.physics && this.physics.world && !this.isPaused) {
            this.physics.world.resume();
          }
        }, durationMs);
      }

      handlePlayerTired() {
        if (this.player.isTiredRespawning || this.isDeathModalOpen) return;
        this.player.isTiredRespawning = true;
        this.player.isRolling = false;
        this.player.sprite.setTexture('cossack');
        this.player.sprite.body.setVelocity(0, -240);

        SFX.defeat();
        this.cameras.main.shake(280, 0.015);
        this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 55, STRINGS.TIRED_MESSAGE, '#ff6b6b');

        // Dramatic collapse animation: Omelko tips onto his back with dizzy stars spinning overhead
        this.tweens.add({
          targets: this.player.sprite,
          angle: this.player.facing >= 0 ? -90 : 90,
          scaleX: 1.15,
          scaleY: 0.85,
          duration: 380,
          ease: 'Back.easeOut'
        });

        this.deathDizzyStars = [];
        for (let i = 0; i < 3; i++) {
          const st = this.add.image(this.player.sprite.x, this.player.sprite.y - 24, 'particle_star')
            .setScale(1.4)
            .setDepth(140);
          this.deathDizzyStars.push(st);
          this.tweens.add({
            targets: st,
            x: this.player.sprite.x + (i - 1) * 26,
            y: this.player.sprite.y - 42,
            angle: 360,
            duration: 700,
            yoyo: true,
            repeat: -1
          });
        }

        // Open the Death / Exhaustion Modal after the collapse animation
        this.time.delayedCall(800, () => {
          this.isDeathModalOpen = true;
          this.physics.world.pause();
          this.ui.setDeathModalVisible(true);
        });
      }

      respawnAtCheckpointFromDeath() {
        if (!this.isDeathModalOpen) return;
        this.isDeathModalOpen = false;
        this.ui.setDeathModalVisible(false);

        if (this.deathDizzyStars) {
          this.deathDizzyStars.forEach(s => s.destroy());
          this.deathDizzyStars = [];
        }

        this.player.sprite.setAngle(0);
        this.player.sprite.setScale(1, 1);
        this.player.sprite.setPosition(this.activeCheckpoint.x, this.activeCheckpoint.y);
        this.player.sprite.body.setVelocity(0, 0);
        this.player.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.player.uzvarCharges = CONFIG.PLAYER.UZVAR_CHARGES;
        this.player.invulnUntil = this.time.now + 1000;
        this.player.isTiredRespawning = false;
        this.lastSafePerch = { x: this.activeCheckpoint.x, y: this.activeCheckpoint.y };

        this.physics.world.resume();
        SFX.checkpoint();
        this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 45, 'Силу відновлено біля чекпоїнта!', '#00f5d4');
      }

      showFloatingText(x, y, message, color = '#ffffff') {
        const txt = this.add.text(x, y, message, {
          fontSize: '15px',
          fontStyle: 'bold',
          color: color,
          stroke: '#14161f',
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(90);

        this.tweens.add({
          targets: txt,
          y: y - 38,
          alpha: 0,
          duration: 1250,
          onComplete: () => txt.destroy()
        });
      }

      togglePause() {
        if (this.isVictory || this.isControlsModalOpen) return;
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
          this.pauseStartedAt = this.time.now;
          if (this.hitStopTimeout) {
            clearTimeout(this.hitStopTimeout);
            this.hitStopTimeout = null;
          }
          this.physics.world.pause();
          this.tweens.pauseAll();
          this.ui.setPauseModalVisible(true);
        } else {
          // Shift active gameplay timestamps by paused duration so stuns/telegraphs don't expire while paused
          const pausedDuration = Math.max(0, this.time.now - (this.pauseStartedAt || this.time.now));
          this.player.rollEndTime += pausedDuration;
          this.player.nextRollAllowedTime += pausedDuration;
          this.player.invulnUntil += pausedDuration;
          this.player.counterWindowEndTime += pausedDuration;

          this.enemies.forEach(e => {
            if (e.stunEndTime) e.stunEndTime += pausedDuration;
            if (e.stateEndTime) e.stateEndTime += pausedDuration;
            if (e.timeOutJump) e.timeOutJump += pausedDuration;
            if (e.turnReadyTime) e.turnReadyTime += pausedDuration;
            if (e.reviveAtTime) e.reviveAtTime += pausedDuration;
            if (e.stuckUntilTime) e.stuckUntilTime += pausedDuration;
            if (e.mouthOpenUntil) e.mouthOpenUntil += pausedDuration;
            if (e.crownGlowUntil) e.crownGlowUntil += pausedDuration;
          });
          if (this.boss && this.boss.isCompositeZmiy) {
            if (this.boss.stateEndTime) this.boss.stateEndTime += pausedDuration;
            if (this.boss.vortexActiveUntil) this.boss.vortexActiveUntil += pausedDuration;
          }

          this.physics.world.resume();
          this.tweens.resumeAll();
          this.ui.setPauseModalVisible(false);
        }
      }

      returnToCheckpointFromMenu() {
        if (this.isPaused) {
          this.togglePause();
        }
        this.player.sprite.setPosition(this.activeCheckpoint.x, this.activeCheckpoint.y);
        this.player.sprite.body.setVelocity(0, 0);
        this.player.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.player.uzvarCharges = CONFIG.PLAYER.UZVAR_CHARGES;
        this.lastSafePerch = { x: this.activeCheckpoint.x, y: this.activeCheckpoint.y };
        SFX.checkpoint();
        this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 45, STRINGS.TIRED_MESSAGE, '#00f5d4');
      }

      switchLevelFromMenu(targetLevel) {
        if (this.hitStopTimeout) {
          clearTimeout(this.hitStopTimeout);
          this.hitStopTimeout = null;
        }
        this.isPaused = false;
        GAME_STATE.currentLevel = targetLevel;
        if (targetLevel >= 2) {
          GAME_STATE.hasSaber = true;
        }
        if (targetLevel >= 3) {
          GAME_STATE.hasSwampFrogs = true;
        }
        this.scene.restart({ level: targetLevel, coins: this.player ? this.player.coins : 0 });
      }

      restartLevel() {
        if (this.hitStopTimeout) {
          clearTimeout(this.hitStopTimeout);
          this.hitStopTimeout = null;
        }
        this.isPaused = false;
        this.scene.restart({ level: this.currentLevel, coins: this.initialCoins });
      }

      goToHutScene() {
        if (this.hitStopTimeout) {
          clearTimeout(this.hitStopTimeout);
          this.hitStopTimeout = null;
        }
        this.isPaused = false;
        GAME_STATE.currentLevel = 1;
        GAME_STATE.hasSaber = false;
        GAME_STATE.hasSwampFrogs = false;
        GAME_STATE.savedCoins = 0;
        this.scene.start('HutScene');
      }

      toggleSoundMute() {
        const muted = SFX.toggleMute();
        if (this.ui) {
          this.ui.updateSoundButtonsText(muted);
        }
      }

      createSteppeParallaxBackground() {
        const gY = CONFIG.GROUND_Y; // 405

        // 1. Dynamic Sky Gradient Graphics (updated smoothly by player X progress: Dawn -> Day -> Golden Hour -> Purple Dusk)
        this.steppeSkyGraphics = this.add.graphics().setScrollFactor(0).setDepth(0);
        this.lastSteppeSkyQuant = -1;

        // 2. Stars & Chumak Way (Чумацький Шлях) container appearing in Purple Dusk
        this.steppeStarsGraphics = this.add.graphics().setScrollFactor(0).setDepth(1).setAlpha(0);
        for (let i = 0; i < 48; i++) {
          const sx = (i * 137) % CONFIG.WIDTH;
          const sy = 14 + ((i * 79) % 210);
          const r = (i % 4 === 0) ? 2 : 1.2;
          this.steppeStarsGraphics.fillStyle(i % 5 === 0 ? 0xffea00 : 0xffffff, 0.85);
          this.steppeStarsGraphics.fillCircle(sx, sy, r);
        }
        // Milky Way ("Чумацький Шлях") diagonal stardust band across the dusk sky
        this.steppeStarsGraphics.fillStyle(0xe0aaff, 0.14);
        this.steppeStarsGraphics.fillEllipse(480, 95, 760, 44);
        this.steppeStarsGraphics.fillStyle(0xffffff, 0.12);
        this.steppeStarsGraphics.fillEllipse(490, 92, 620, 22);

        // 3. Sun / Dusk Solar Orb (descends toward the horizon as Omelko advances East/South)
        this.steppeSunGlow = this.add.circle(740, 88, 66, 0xffd166, 0.25).setScrollFactor(0).setDepth(1);
        this.steppeSunDisc = this.add.circle(740, 88, 36, 0xffea00, 0.9).setScrollFactor(0).setDepth(1);

        // 4. Distant Salt Mountain on the Horizon (Соляна гора, що з просуванням росте й світлішає)
        this.saltMountainHorizon = this.add.graphics().setScrollFactor(0).setDepth(2);

        // 5. Distant Black Sea Horizon & Shimmering Glints (Море з відблисками на обрії)
        this.blackSeaHorizon = this.add.graphics().setScrollFactor(0).setDepth(2);

        // 6. Scythian Kurhans Layer (Стародавні скіфські кургани та кам'яні баби на обрії, scrollFactor 0.18)
        this.steppeKurhanLayer = this.add.graphics().setScrollFactor(0.18).setDepth(3);
        for (let x = 80; x < 3400; x += 280) {
          this.steppeKurhanLayer.fillStyle(0x4a3b32, 0.92);
          this.steppeKurhanLayer.fillEllipse(x + 120, gY - 8, 290, 145);
          // Stone baba silhouette atop every second kurhan mound
          if (x % 560 === 80) {
            this.steppeKurhanLayer.fillStyle(0x3a2e27, 0.95);
            this.steppeKurhanLayer.fillRoundedRect(x + 115, gY - 96, 10, 22, 3);
            this.steppeKurhanLayer.fillCircle(x + 120, gY - 100, 5);
          }
        }

        // 7. Two Sinusoidal Swaying Feather-Grass Layers (Два шари ковили, що колихаються на вітрі)
        this.kovylaBackGraphics = this.add.graphics().setScrollFactor(0.45).setDepth(4);
        this.kovylaFrontGraphics = this.add.graphics().setScrollFactor(0.76).setDepth(5);
        // Foreground grass blades in front of gameplay plane
        this.foregroundGrassGraphics = this.add.graphics().setScrollFactor(1.08).setDepth(35);

        // 8. Ambient Steppe Fluff, Seeds, Golden Dust & Distant Seagulls (screen-space ambient particles)
        this.steppeAmbientParticles = [];
        for (let i = 0; i < 22; i++) {
          const p = this.add.ellipse(
            Phaser.Math.Between(0, CONFIG.WIDTH),
            Phaser.Math.Between(35, gY - 12),
            i % 3 === 0 ? 7 : 4,
            i % 3 === 0 ? 3 : 4,
            i % 2 === 0 ? 0xfefae0 : 0xffd166,
            0.55
          ).setScrollFactor(0).setDepth(6);
          p.vx = -Phaser.Math.FloatBetween(0.6, 1.8);
          p.vy = Phaser.Math.FloatBetween(-0.25, 0.25);
          p.phase = i * 0.7;
          this.steppeAmbientParticles.push(p);
        }

        // Initialize sky & horizon state for x = 0
        this.updateSteppeSkyAndHorizon(0, 0);
      }

      lerpColorHex(c1, c2, t) {
        const clamped = Phaser.Math.Clamp(t, 0, 1);
        const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
        const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
        const r = Math.round(r1 + (r2 - r1) * clamped);
        const g = Math.round(g1 + (g2 - g1) * clamped);
        const b = Math.round(b1 + (b2 - b1) * clamped);
        return (r << 16) | (g << 8) | b;
      }

      updateSteppeSkyAndHorizon(progress, time) {
        const gY = CONFIG.GROUND_Y;
        // 4-stage palette across progress 0..1: Dawn (0.0) -> Day (0.33) -> Golden Hour (0.66) -> Purple Dusk (1.0)
        const stages = [
          { top: 0x2b193d, bottom: 0xf4a261, sun: 0xffbe0b, kurhanTint: 0xd4a373 },
          { top: 0x1d4e89, bottom: 0xa8dadc, sun: 0xffea00, kurhanTint: 0xe9c46a },
          { top: 0x3d1e6d, bottom: 0xe76f51, sun: 0xff9f1c, kurhanTint: 0xf4a261 },
          { top: 0x10002b, bottom: 0x7b2cbf, sun: 0xff6b6b, kurhanTint: 0x9d4edd }
        ];

        const scaled = Phaser.Math.Clamp(progress, 0, 0.9999) * 3;
        const idx = Math.floor(scaled);
        const frac = scaled - idx;
        const sA = stages[idx];
        const sB = stages[Math.min(3, idx + 1)];

        const topCol = this.lerpColorHex(sA.top, sB.top, frac);
        const botCol = this.lerpColorHex(sA.bottom, sB.bottom, frac);
        const sunCol = this.lerpColorHex(sA.sun, sB.sun, frac);
        const kurhanTint = this.lerpColorHex(sA.kurhanTint, sB.kurhanTint, frac);

        const quant = Math.round(progress * 250);
        if (quant !== this.lastSteppeSkyQuant && this.steppeSkyGraphics) {
          this.lastSteppeSkyQuant = quant;
          this.steppeSkyGraphics.clear();
          this.steppeSkyGraphics.fillGradientStyle(topCol, topCol, botCol, botCol, 1);
          this.steppeSkyGraphics.fillRect(0, 0, CONFIG.WIDTH, gY + 10);

          // Sun descends gradually toward the horizon as dusk approaches
          const sunY = 78 + progress * 165;
          this.steppeSunGlow.setPosition(740, sunY).setFillStyle(sunCol, 0.24);
          this.steppeSunDisc.setPosition(740, sunY).setFillStyle(sunCol, 0.88);
          this.steppeKurhanLayer.setAlpha(0.95);
          if (this.steppeStarsGraphics) {
            const duskAlpha = Phaser.Math.Clamp((progress - 0.55) / 0.4, 0, 0.95);
            this.steppeStarsGraphics.setAlpha(duskAlpha);
          }
          // Subtle layer tinting on kurhans
          this.steppeKurhanLayer.setBlendMode(Phaser.BlendModes.NORMAL);
          void kurhanTint;
        }

        // Distant Salt Mountain on the Horizon: grows larger and brighter as Omelko approaches!
        if (this.saltMountainHorizon) {
          this.saltMountainHorizon.clear();
          const mScale = 0.28 + progress * 1.15;
          const mAlpha = 0.35 + progress * 0.62;
          const mColor = this.lerpColorHex(0xb8c0ff, 0xffffff, progress);
          const shadowColor = this.lerpColorHex(0x6c757d, 0xcaf0f8, progress);
          const baseW = 220 * mScale;
          const peakH = 145 * mScale;
          const mx = 805 - progress * 85;

          this.saltMountainHorizon.fillStyle(shadowColor, mAlpha);
          this.saltMountainHorizon.fillTriangle(mx - baseW * 0.65, gY, mx - baseW * 0.12, gY - peakH * 0.82, mx + baseW * 0.35, gY);
          this.saltMountainHorizon.fillStyle(mColor, mAlpha);
          this.saltMountainHorizon.fillTriangle(mx - baseW * 0.45, gY, mx, gY - peakH, mx + baseW * 0.52, gY);
        }

        // Distant Black Sea with shimmering horizon glints (appears smoothly from mid-level onward)
        if (this.blackSeaHorizon) {
          this.blackSeaHorizon.clear();
          if (progress > 0.35) {
            const seaAlpha = Phaser.Math.Clamp((progress - 0.35) / 0.35, 0, 0.9);
            const seaTopY = gY - 34;
            this.blackSeaHorizon.fillStyle(0x03045e, seaAlpha);
            this.blackSeaHorizon.fillRect(0, seaTopY, CONFIG.WIDTH, 34);
            this.blackSeaHorizon.fillStyle(0x0077b6, seaAlpha * 0.85);
            this.blackSeaHorizon.fillRect(0, seaTopY, CONFIG.WIDTH, 10);

            // Smooth shimmering sun/moon glints on the Black Sea waves (no strobe)
            for (let gx = 40; gx < CONFIG.WIDTH; gx += 72) {
              const waveShift = Math.sin(time * 0.002 + gx * 0.05) * 8;
              const glintW = 24 + Math.sin(time * 0.003 + gx) * 8;
              this.blackSeaHorizon.fillStyle(0xffd166, seaAlpha * 0.55);
              this.blackSeaHorizon.fillEllipse(gx + waveShift, seaTopY + 8 + (gx % 18), glintW, 3);
            }
          }
        }
      }

      updateSteppeAtmosphereAndMechanics(time, delta) {
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;
        const gY = CONFIG.GROUND_Y;
        const progress = Phaser.Math.Clamp(px / this.worldWidth, 0, 1);

        // 1. Update Sky, Stars, Growing Salt Mountain & Black Sea Glints
        this.updateSteppeSkyAndHorizon(progress, time);

        // 2. Steppe Wind Gust Mechanic (every 6–9s with telegraph: grass bends more strongly + wind whistle)
        if (!this.isWindGustActive && !this.isWindTelegraphing && time >= this.windTelegraphStartTime) {
          this.isWindTelegraphing = true;
          this.windDirection = (Math.random() < 0.72) ? -1 : 1; // Predominantly headwind from the sea
          if (SFX.windWhistle) SFX.windWhistle();
          this.showFloatingText(px, py - 58, STRINGS.WIND_WARN, '#ffd166');
        }

        if (this.isWindTelegraphing && time >= this.nextWindGustTime) {
          this.isWindTelegraphing = false;
          this.isWindGustActive = true;
          this.windGustEndTime = time + CONFIG.WIND.GUST_DURATION_MS;
        }

        if (this.isWindGustActive) {
          this.windStrengthRatio = Phaser.Math.Linear(this.windStrengthRatio, 1.0, 0.08);
          const onFloor = this.player.sprite.body.blocked.down || this.player.sprite.body.touching.down;
          const pushForce = onFloor ? CONFIG.WIND.GROUND_PUSH_X : CONFIG.WIND.AIR_PUSH_X;
          if (!this.player.isRolling) {
            this.player.sprite.x += this.windDirection * pushForce * (delta / 1000);
          }
          if (time >= this.windGustEndTime) {
            this.isWindGustActive = false;
            const nextInterval = Phaser.Math.Between(CONFIG.WIND.GUST_INTERVAL_MIN_MS, CONFIG.WIND.GUST_INTERVAL_MAX_MS);
            this.nextWindGustTime = time + nextInterval;
            this.windTelegraphStartTime = this.nextWindGustTime - CONFIG.WIND.TELEGRAPH_MS;
          }
        } else if (this.isWindTelegraphing) {
          this.windStrengthRatio = Phaser.Math.Linear(this.windStrengthRatio, 0.65, 0.06);
        } else {
          this.windStrengthRatio = Phaser.Math.Linear(this.windStrengthRatio, 0.18, 0.06);
        }

        // 3. Draw Sinusoidal Swaying Feather-Grass (Два шари ковили + передній план із травинками)
        const camX = this.cameras.main.scrollX;
        const bendBoost = 1 + this.windStrengthRatio * 2.1;
        const windSign = this.windDirection || -1;

        if (this.kovylaBackGraphics) {
          this.kovylaBackGraphics.clear();
          const startB = Math.floor((camX * 0.45) / 48) * 48 - 48;
          const endB = startB + CONFIG.WIDTH + 120;
          this.kovylaBackGraphics.lineStyle(2, 0xd4a373, 0.62);
          for (let bx = startB; bx < endB; bx += 24) {
            const sway = Math.sin(time * 0.0032 + bx * 0.04) * 7 * bendBoost + windSign * 9 * this.windStrengthRatio;
            this.kovylaBackGraphics.lineBetween(bx, gY, bx + sway, gY - 34);
          }
        }

        if (this.kovylaFrontGraphics) {
          this.kovylaFrontGraphics.clear();
          const startF = Math.floor((camX * 0.76) / 36) * 36 - 36;
          const endF = startF + CONFIG.WIDTH + 96;
          for (let fx = startF; fx < endF; fx += 18) {
            const sway = Math.sin(time * 0.0042 + fx * 0.05) * 10 * bendBoost + windSign * 14 * this.windStrengthRatio;
            this.kovylaFrontGraphics.lineStyle(2.5, 0xe9c46a, 0.82);
            this.kovylaFrontGraphics.lineBetween(fx, gY, fx + sway, gY - 46);
            // Silky white feather-grass plume tip (периста мітелка ковили)
            this.kovylaFrontGraphics.lineStyle(3, 0xfefae0, 0.9);
            this.kovylaFrontGraphics.lineBetween(fx + sway, gY - 46, fx + sway * 1.35, gY - 56);
          }
        }

        if (this.foregroundGrassGraphics) {
          this.foregroundGrassGraphics.clear();
          const startFg = Math.floor((camX * 1.08) / 90) * 90 - 90;
          const endFg = startFg + CONFIG.WIDTH + 180;
          this.foregroundGrassGraphics.lineStyle(3, 0x3a281c, 0.55);
          for (let fgx = startFg; fgx < endFg; fgx += 85) {
            const sway = Math.sin(time * 0.005 + fgx * 0.03) * 12 * bendBoost + windSign * 16 * this.windStrengthRatio;
            this.foregroundGrassGraphics.lineBetween(fgx, CONFIG.HEIGHT, fgx + sway, CONFIG.HEIGHT - 38);
            this.foregroundGrassGraphics.lineBetween(fgx + 10, CONFIG.HEIGHT, fgx + 10 + sway * 1.1, CONFIG.HEIGHT - 46);
          }
        }

        // 4. Update Ambient Steppe Fluff / Seeds / Golden Dust Particles
        const gustSpeedMult = 1 + this.windStrengthRatio * 3.2;
        (this.steppeAmbientParticles || []).forEach(p => {
          p.x += p.vx * gustSpeedMult * (this.windDirection < 0 ? 1 : -0.8);
          p.y += p.vy + Math.sin(time * 0.004 + p.phase) * 0.35;
          if (p.x < -10) p.x = CONFIG.WIDTH + 10;
          if (p.x > CONFIG.WIDTH + 10) p.x = -10;
          if (p.y < 30) p.y = gY - 16;
          if (p.y > gY - 12) p.y = 35;
        });

        // 5. Coastal Syvash / Black Sea Waves Mechanic (floods low coastal platforms isCoastLow: true)
        if (this.coastalWavePlatforms && this.coastalWavePlatforms.length > 0) {
          const period = CONFIG.WAVES.PERIOD_MS;
          const cycleMs = time % period;
          const cycleIndex = Math.floor(time / period);
          const warnStart = period - CONFIG.WAVES.TELEGRAPH_MS - CONFIG.WAVES.FLOOD_DURATION_MS;
          const floodStart = period - CONFIG.WAVES.FLOOD_DURATION_MS;

          if (cycleMs < warnStart) {
            this.coastalWavePlatforms.forEach(wp => {
              wp.sprite.clearTint();
              wp.waveFoam.setVisible(false);
              wp.waveCrest.setVisible(false);
            });
          } else if (cycleMs < floodStart) {
            // Telegraph: rising pink-turquoise sea foam under low coastal platforms
            const pulse = 1 + Math.sin(time * 0.02) * 0.22;
            this.coastalWavePlatforms.forEach(wp => {
              wp.sprite.setTint(0xffcad4);
              wp.waveFoam.setVisible(true).setScale(1, pulse);
              wp.waveCrest.setVisible(false);
            });
          } else {
            // Wave Crest Floods Low Coastal Platforms!
            if (this.lastWaveCycleIndex !== cycleIndex) {
              this.lastWaveCycleIndex = cycleIndex;
              if (px >= CONFIG.STEPPE.COAST_START_X - 250) {
                SFX.waterSplash();
              }
            }
            this.coastalWavePlatforms.forEach(wp => {
              wp.sprite.setTint(0x48cae4);
              wp.waveFoam.setVisible(true).setScale(1.08, 1.35);
              wp.waveCrest.setPosition(wp.x, wp.y - 8).setVisible(true);

              if (
                Math.abs(px - wp.x) < wp.w * 0.52 &&
                Math.abs(py + 22 - (wp.y - 12)) < 24 &&
                time - this.lastWaveDamageTime > 750
              ) {
                this.lastWaveDamageTime = time;
                this.player.sprite.body.setVelocityY(CONFIG.WAVES.KNOCKBACK_Y);
                if (this.player.takeDamage(CONFIG.WAVES.DAMAGE, wp.x)) {
                  this.showFloatingText(px, py - 48, STRINGS.WAVE_WARN, '#90e0ef');
                }
              }
            });
          }
        }

        // 6. Salt Mountain Arena Mechanics: Camera/Player clamp, Fragile Crystal Platforms & Pink Brine Hazard
        if (this.boss && this.boss.active && !this.boss.isFinished) {
          const minArenaX = this.levelData.bossArenaStartX + 22;
          if (this.player.sprite.x < minArenaX) {
            this.player.sprite.x = minArenaX;
          }

          // Update safe perch when standing on solid salt shore in the left/center of the arena (x < 6740)
          if (this.player.sprite.body.blocked.down && py <= CONFIG.GROUND_Y && px >= minArenaX && px <= 6740) {
            this.lastSafePerch = {
              x: Phaser.Math.Clamp(px, minArenaX + 20, 6710),
              y: CONFIG.GROUND_Y - 42
            };
          }

          // Fragile Crystal Platforms (крихкі платформи-кристали): crack after standing on them, then respawn!
          const crackMs = CONFIG.ENEMY.BOSS_ZMIY.CRYSTAL_CRACK_MS;
          const respawnMs = CONFIG.ENEMY.BOSS_ZMIY.CRYSTAL_RESPAWN_MS;
          (this.crystalPlatforms || []).forEach(cp => {
            if (!cp.fragile) return;
            if (cp.isBroken) {
              if (time >= cp.respawnAt) {
                cp.isBroken = false;
                cp.standTimer = 0;
                cp.sprite.body.enable = true;
                cp.sprite.setAlpha(1).clearTint();
              }
              return;
            }

            const standingOnThis =
              this.player.sprite.body.blocked.down &&
              Math.abs(py + 22 - (cp.y - 12)) < 16 &&
              Math.abs(px - cp.x) <= cp.w * 0.54;

            if (standingOnThis) {
              cp.standTimer += delta;
              this.lastSafePerch = { x: cp.x, y: cp.y - 38 };
              if (cp.standTimer > crackMs * 0.45) {
                cp.sprite.setTint(0xff758f);
              }
              if (cp.standTimer >= crackMs) {
                cp.isBroken = true;
                cp.respawnAt = time + respawnMs;
                cp.sprite.body.enable = false;
                cp.sprite.setAlpha(0.18).setTint(0xffcad4);
                if (SFX.crystalChime) SFX.crystalChime(0);
              }
            } else if (cp.standTimer > 0) {
              cp.standTimer = Math.max(0, cp.standTimer - delta * 0.65);
              if (cp.standTimer <= crackMs * 0.45) {
                cp.sprite.clearTint();
              }
            }
          });

          // Pink Brine Water Hazard on the right side of the arena (x >= 6755): rescues Omelko to lastSafePerch!
          if (px >= 6755 && py >= CONFIG.GROUND_Y - 18 && time >= this.waterRescueCooldownUntil) {
            this.waterRescueCooldownUntil = time + 750;
            SFX.waterSplash();
            this.spawnWaterSplash(px, CONFIG.GROUND_Y, 12);
            this.player.takeDamage(CONFIG.WAVES.DAMAGE, 6780);
            const safeX = this.lastSafePerch ? this.lastSafePerch.x : (this.levelData.bossArenaStartX + 110);
            const safeY = this.lastSafePerch ? this.lastSafePerch.y : (CONFIG.GROUND_Y - 42);
            this.player.sprite.setPosition(safeX, safeY - 10);
            this.player.sprite.body.setVelocity(-90, -210);
            this.showFloatingText(safeX, safeY - 48, '🌊 Рожева ропа пече! Назад на берег!', '#ff758f');
          }
        }
      }

      triggerSaltMountainCracksAndDarkSky() {
        this.isSaltMountainCracked = true;
        if (this.saltMountainCracksGraphic) {
          this.saltMountainCracksGraphic.clear();
          this.saltMountainCracksGraphic.lineStyle(4, 0xff4d6d, 0.95);
          // Deep glowing fissures across the Salt Mountain
          this.saltMountainCracksGraphic.beginPath();
          this.saltMountainCracksGraphic.moveTo(6960, 56);
          this.saltMountainCracksGraphic.lineTo(6910, 145);
          this.saltMountainCracksGraphic.lineTo(6945, 235);
          this.saltMountainCracksGraphic.lineTo(6885, 355);
          this.saltMountainCracksGraphic.moveTo(6910, 145);
          this.saltMountainCracksGraphic.lineTo(6835, 220);
          this.saltMountainCracksGraphic.lineTo(6790, 340);
          this.saltMountainCracksGraphic.moveTo(6960, 110);
          this.saltMountainCracksGraphic.lineTo(7025, 210);
          this.saltMountainCracksGraphic.lineTo(7060, 345);
          this.saltMountainCracksGraphic.strokePath();
        }
        if (this.steppeSkyGraphics) {
          this.steppeSkyGraphics.clear();
          this.steppeSkyGraphics.fillGradientStyle(0x090018, 0x090018, 0x3c096c, 0x590d22, 1);
          this.steppeSkyGraphics.fillRect(0, 0, CONFIG.WIDTH, CONFIG.GROUND_Y + 10);
        }
      }

      showSteppeCliffhangerModal() {
        this.ui.victoryStats.setText(
          `✦ Зібрано червінців: ${this.player.coins}   |   Ошелешено степової нечисті: ${this.enemiesStunnedCount} ✦`
        );
        this.ui.setVictoryModalVisible(true);
        SFX.banduraStart();
      }

      launchZmiyFinaleFromMenu() {
        if (this.hitStopTimeout) {
          clearTimeout(this.hitStopTimeout);
          this.hitStopTimeout = null;
        }
        this.isPaused = false;
        this.isVictory = false;
        const coins = this.player ? this.player.coins : (GAME_STATE.savedCoins || 0);
        GAME_STATE.savedCoins = coins;
        SFX.pickup();
        this.scene.start('ZmiyFinaleScene', {
          coins: coins,
          enemiesStunned: this.enemiesStunnedCount || 0
        });
      }

      returnToTitleFromAct4() {
        if (this.hitStopTimeout) {
          clearTimeout(this.hitStopTimeout);
          this.hitStopTimeout = null;
        }
        this.isPaused = false;
        this.isVictory = false;
        SFX.pickup();
        this.scene.start('TitleScene');
      }

      triggerVictory() {
        if (this.isVictory) return;
        this.isVictory = true;
        this.physics.world.pause();
        SFX.checkpoint();

        GAME_STATE.savedCoins = this.player.coins;

        this.cameras.main.fadeOut(500, 14, 16, 24);
        if (this.currentLevel === 1) {
          this.time.delayedCall(520, () => {
            this.scene.start('HrytskoScene', {
              coins: this.player.coins,
              enemiesStunned: this.enemiesStunnedCount
            });
          });
        } else if (this.currentLevel === 2) {
          // Act II ("Злий Ліс") Finale: Omelko approaches Baba Yaga's Hut on Chicken Legs!
          this.time.delayedCall(520, () => {
            this.scene.start('BabaYagaScene', {
              coins: this.player.coins,
              enemiesStunned: this.enemiesStunnedCount
            });
          });
        } else if (this.currentLevel === 4) {
          // Act IV ("Дике поле і Чорне море") Grand Finale: Salyonohorych carries Omelko home for Borsch!
          this.time.delayedCall(520, () => {
            this.scene.start('ZmiyFinaleScene', {
              coins: this.player.coins,
              enemiesStunned: this.enemiesStunnedCount
            });
          });
        } else {
          // Act III ("На Дніпрі") Finale: Giant River Catfish ("Річковий Сом Вусань") carries Omelko on his back across the Dnipro!
          this.time.delayedCall(520, () => {
            this.scene.start('CatfishScene', {
              coins: this.player.coins,
              enemiesStunned: this.enemiesStunnedCount
            });
          });
        }
      }
    }