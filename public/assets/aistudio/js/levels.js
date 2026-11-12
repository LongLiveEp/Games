
    /**
     * ============================================================================
     * 3. LEVEL 1 DESIGN DATA (3 PLATFORM HEIGHTS + ENEMIES + CHECKPOINTS)
     * ============================================================================
     * Heights adjusted for GROUND_Y = 405: Low (~320), Mid (~235), High (~150)
     */
    const LEVEL_1_DATA = {
      platforms: [
        // Screen 1: Village outskirts (Introduction to jumping & Goose)
        { x: 380, y: 320, w: 180, tier: 1 },
        { x: 640, y: 235, w: 200, tier: 2 },
        { x: 920, y: 320, w: 180, tier: 1 },
        { x: 1150, y: 150, w: 220, tier: 3 },

        // Screen 2: Around the Well Checkpoint & Forest edge
        { x: 1480, y: 320, w: 220, tier: 1 },
        { x: 1760, y: 235, w: 240, tier: 2 },
        { x: 2040, y: 150, w: 200, tier: 3 },
        { x: 2100, y: 320, w: 180, tier: 1 },

        // Screen 3: Deep Forest (Multi-tiered verticality with Pesyholovets & Geese)
        { x: 2400, y: 320, w: 200, tier: 1 },
        { x: 2640, y: 235, w: 240, tier: 2 },
        { x: 2900, y: 150, w: 220, tier: 3 },
        { x: 2920, y: 320, w: 180, tier: 1 },

        // Screen 4: Approach to Boss Courtyard & Pillar Checkpoint
        { x: 3280, y: 320, w: 200, tier: 1 },
        { x: 3540, y: 235, w: 220, tier: 2 },
        { x: 3740, y: 150, w: 180, tier: 3 },

        // Screen 5: Boss Arena side perches (High enough to dodge shockwaves)
        { x: 4060, y: 300, w: 150, tier: 1 },
        { x: 4540, y: 300, w: 150, tier: 1 },
        { x: 4300, y: 200, w: 180, tier: 2 }
      ],
      checkpoints: [
        { id: 1, type: 'well', x: 1400, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_WELL },
        { id: 2, type: 'pillar', x: 3150, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_PILLAR }
      ],
      enemies: [
        // First 10 enemies (Village & Outskirts up to ~1/3 of the map): ONLY Hrytsko's unruly geese!
        { type: 'goose', x: 430, y: 370, minX: 300, maxX: 620 },
        { type: 'goose', x: 590, y: 205, minX: 540, maxX: 740 },
        { type: 'goose', x: 740, y: 370, minX: 560, maxX: 920 },
        { type: 'goose', x: 920, y: 290, minX: 830, maxX: 1010 },
        { type: 'goose', x: 1050, y: 370, minX: 880, maxX: 1220 },
        { type: 'goose', x: 1150, y: 120, minX: 1040, maxX: 1260 },
        { type: 'goose', x: 1260, y: 370, minX: 1080, maxX: 1380 },
        { type: 'goose', x: 1480, y: 290, minX: 1380, maxX: 1580 },
        { type: 'goose', x: 1560, y: 370, minX: 1420, maxX: 1680 },
        { type: 'goose', x: 1660, y: 205, minX: 1640, maxX: 1870 },

        // From 1/3 of the map onward (x >= 1740, Forest section): Pesyholovtsi appear on the ground & hide underground!
        { type: 'leshy', x: 1760, y: 370, minX: 1560, maxX: 1980 },
        { type: 'leshy', x: 2080, y: 370, minX: 1880, maxX: 2280 },
        { type: 'goose', x: 2260, y: 370, minX: 2020, maxX: 2480 },
        { type: 'leshy', x: 2520, y: 370, minX: 2340, maxX: 2760 },
        { type: 'leshy', x: 2860, y: 370, minX: 2640, maxX: 3080 },
        { type: 'goose', x: 2940, y: 290, minX: 2820, maxX: 3020 },
        { type: 'leshy', x: 3380, y: 370, minX: 3200, maxX: 3620 },
        { type: 'goose', x: 3540, y: 205, minX: 3430, maxX: 3650 },
        { type: 'leshy', x: 3680, y: 370, minX: 3460, maxX: 3820 }
      ],
      bossArenaStartX: 3880,
      bossSpawnX: 4460
    };

    /**
     * ============================================================================
     * 3B. LEVEL 2 («ЗЛИЙ ЛІС») HYBRID CHUNK GENERATOR
     * Inspired by Sébastien Bénard's "The Level Design of Dead Cells: A Hybrid Approach":
     *  - Fixed Macro Biome Graph (Entrance Thicket -> Ravine Ambush -> Shrine Checkpoint ->
     *    Rotting Mire -> Labyrinth of Blud -> Ancient Oak Checkpoint -> Thorn Gauntlet -> Boss Lair)
     *  - Handcrafted Room Templates with micro-variations per run
     *  - Tactical enemy pairing on combat floors (Shielded Моховик-Щитоносець paired with
     *    aerial Лісова Нявка, mire-lobbing Болотяник, and subterranean Песиголовець).
     * ============================================================================
     */
    function buildEvilForestLevelData() {
      const pickVariant = (arr) => arr[Math.floor(Math.random() * arr.length)];

      // Handcrafted Chunk 1 Variants: Урочище Моховиків (Introduces Shield Guardian + Nyavka)
      const chunk1 = pickVariant([
        {
          platforms: [
            { x: 350, y: 315, w: 170, tier: 1 },
            { x: 610, y: 230, w: 210, tier: 2 },
            { x: 890, y: 315, w: 190, tier: 1 },
            { x: 1140, y: 155, w: 220, tier: 3 },
            { x: 1180, y: 315, w: 170, tier: 1 }
          ],
          enemies: [
            // First Shield Guardian on flat ground so player learns to roll [Shift] behind him!
            { type: 'shield_guardian', x: 470, y: 365, minX: 310, maxX: 650 },
            { type: 'nyavka', x: 640, y: 185, minX: 500, maxX: 820 },
            { type: 'leshy', x: 860, y: 370, minX: 700, maxX: 1040 },
            { type: 'shield_guardian', x: 1090, y: 365, minX: 930, maxX: 1290 },
            { type: 'nyavka', x: 1160, y: 115, minX: 1010, maxX: 1310 }
          ]
        },
        {
          platforms: [
            { x: 370, y: 310, w: 190, tier: 1 },
            { x: 660, y: 225, w: 190, tier: 2 },
            { x: 940, y: 150, w: 210, tier: 3 },
            { x: 960, y: 315, w: 200, tier: 1 },
            { x: 1210, y: 235, w: 180, tier: 2 }
          ],
          enemies: [
            { type: 'shield_guardian', x: 460, y: 365, minX: 300, maxX: 640 },
            { type: 'leshy', x: 740, y: 370, minX: 580, maxX: 920 },
            { type: 'nyavka', x: 940, y: 115, minX: 800, maxX: 1100 },
            { type: 'shield_guardian', x: 1040, y: 365, minX: 880, maxX: 1260 },
            { type: 'nyavka', x: 1210, y: 190, minX: 1080, maxX: 1340 }
          ]
        }
      ]);

      // Handcrafted Chunk 2 Variants: Гниле Болото і Трясовина (Introduces Bolotyanyk + Shield synergy)
      const chunk2 = pickVariant([
        {
          platforms: [
            { x: 1580, y: 315, w: 200, tier: 1 },
            { x: 1850, y: 230, w: 230, tier: 2 },
            { x: 2130, y: 150, w: 210, tier: 3 },
            { x: 2160, y: 315, w: 190, tier: 1 }
          ],
          enemies: [
            { type: 'bolotyanyk', x: 1690, y: 365, minX: 1520, maxX: 1860 },
            { type: 'shield_guardian', x: 1890, y: 365, minX: 1720, maxX: 2080 },
            { type: 'nyavka', x: 1860, y: 185, minX: 1720, maxX: 2020 },
            { type: 'leshy', x: 2090, y: 370, minX: 1920, maxX: 2290 },
            { type: 'bolotyanyk', x: 2260, y: 365, minX: 2080, maxX: 2390 }
          ]
        },
        {
          platforms: [
            { x: 1560, y: 240, w: 190, tier: 2 },
            { x: 1820, y: 315, w: 220, tier: 1 },
            { x: 2090, y: 225, w: 220, tier: 2 },
            { x: 2290, y: 150, w: 180, tier: 3 }
          ],
          enemies: [
            { type: 'shield_guardian', x: 1660, y: 365, minX: 1500, maxX: 1840 },
            { type: 'bolotyanyk', x: 1880, y: 365, minX: 1720, maxX: 2050 },
            { type: 'leshy', x: 2040, y: 370, minX: 1880, maxX: 2240 },
            { type: 'nyavka', x: 2100, y: 180, minX: 1960, maxX: 2260 },
            { type: 'shield_guardian', x: 2250, y: 365, minX: 2080, maxX: 2390 }
          ]
        }
      ]);

      // Handcrafted Chunk 3 Variants: Нетрі Блуду (High-intensity Dead Cells combat room)
      const chunk3 = pickVariant([
        {
          platforms: [
            { x: 2480, y: 315, w: 200, tier: 1 },
            { x: 2740, y: 230, w: 230, tier: 2 },
            { x: 3000, y: 150, w: 210, tier: 3 },
            { x: 3020, y: 315, w: 190, tier: 1 }
          ],
          enemies: [
            { type: 'shield_guardian', x: 2540, y: 365, minX: 2400, maxX: 2740 },
            { type: 'nyavka', x: 2740, y: 180, minX: 2580, maxX: 2900 },
            { type: 'bolotyanyk', x: 2820, y: 365, minX: 2660, maxX: 3020 },
            { type: 'leshy', x: 2980, y: 370, minX: 2800, maxX: 3140 },
            { type: 'shield_guardian', x: 3060, y: 280, minX: 2930, maxX: 3110 }
          ]
        },
        {
          platforms: [
            { x: 2460, y: 235, w: 210, tier: 2 },
            { x: 2720, y: 315, w: 210, tier: 1 },
            { x: 2960, y: 225, w: 220, tier: 2 },
            { x: 2980, y: 145, w: 180, tier: 3 }
          ],
          enemies: [
            { type: 'bolotyanyk', x: 2560, y: 365, minX: 2400, maxX: 2740 },
            { type: 'shield_guardian', x: 2760, y: 365, minX: 2600, maxX: 2940 },
            { type: 'nyavka', x: 2960, y: 175, minX: 2820, maxX: 3120 },
            { type: 'shield_guardian', x: 3040, y: 365, minX: 2880, maxX: 3150 }
          ]
        }
      ]);

      // Handcrafted Chunk 4: Переддень Чорнобора (Final gauntlet before the Boss Lair)
      const chunk4 = {
        platforms: [
          { x: 3360, y: 315, w: 190, tier: 1 },
          { x: 3600, y: 230, w: 210, tier: 2 },
          { x: 3780, y: 155, w: 170, tier: 3 }
        ],
        enemies: [
          { type: 'shield_guardian', x: 3440, y: 365, minX: 3300, maxX: 3620 },
          { type: 'bolotyanyk', x: 3640, y: 365, minX: 3480, maxX: 3820 },
          { type: 'nyavka', x: 3620, y: 180, minX: 3480, maxX: 3780 },
          { type: 'shield_guardian', x: 3760, y: 365, minX: 3600, maxX: 3850 }
        ]
      };

      // Boss Arena Perches (Лігво Прадавнього Лісовика Чорнобора)
      const bossPerches = [
        { x: 4060, y: 300, w: 155, tier: 1 },
        { x: 4540, y: 300, w: 155, tier: 1 },
        { x: 4300, y: 195, w: 190, tier: 2 }
      ];

      return {
        platforms: [
          ...chunk1.platforms,
          ...chunk2.platforms,
          ...chunk3.platforms,
          ...chunk4.platforms,
          ...bossPerches
        ],
        checkpoints: [
          { id: 1, type: 'well', x: 1400, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_SHRINE },
          { id: 2, type: 'pillar', x: 3180, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_OAK }
        ],
        enemies: [
          ...chunk1.enemies,
          ...chunk2.enemies,
          ...chunk3.enemies,
          ...chunk4.enemies
        ],
        bossArenaStartX: 3880,
        bossSpawnX: 4460
      };
    }

    /**
     * ============================================================================
     * 3C. LEVEL 3 («НА ДНІПРІ»): CLOUD PLATFORMER WITH TRAPS & WATER MYTHOLOGY
     * ============================================================================
     * - Falling into the Dnipro water (y >= CONFIG.GROUND_Y) between dry islands is forbidden!
     * - Omelko leaps across Cloud Platforms (white clouds, wind-moving clouds, and electric Storm Trap clouds)
     * - Rusalky leap out of the water below to grab Omelko and drag him down (dodgeable via [Shift] or jump/hit)
     * - Water Geysers erupt between clouds as timed platforming traps
     * - Ends at the Far Pier where the Giant River Catfish ("Річковий Сом Вусань") carries Omelko across!
     */
    function buildDniproLevelData() {
      return {
        worldWidth: 4800,
        // Solid wooden bridges & island piers at CONFIG.GROUND_Y (everywhere else is deep Dnipro water!)
        dryIslands: [
          { startX: 0, endX: 360, x: 180, w: 360, isBridge: true, label: 'Козацький Місточок' },
          { startX: 1510, endX: 1790, x: 1650, w: 280, isBridge: true, label: 'Козацький Острівець' },
          { startX: 3100, endX: 3380, x: 3240, w: 280, isBridge: true, label: 'Скеля Порогів' },
          { startX: 4140, endX: 4800, x: 4470, w: 660, isBridge: true, label: 'Причал Річкового Сома Вусаня' }
        ],
        // Raised wooden bridge steps (містки-трампліни) on the piers + Cloud Platforms across the Dnipro
        platforms: [
          // Wooden bridge step at the right end of the Starting Bridge (x: 0..360) for an effortless jump to the 1st cloud!
          { x: 295, y: 368, w: 120, tier: 1, isWoodenBridgeStep: true },

          // Section 1: From Starting Bridge (x: 360) to Checkpoint Island 1 (x: 1510..1790)
          { x: 455, y: 335, w: 175, tier: 1, cloudType: 'normal' },
          { x: 645, y: 290, w: 175, tier: 2, cloudType: 'normal' },
          { x: 845, y: 245, w: 175, tier: 2, cloudType: 'storm', stormOffset: 0 },
          { x: 1045, y: 285, w: 175, tier: 1, cloudType: 'moving', moveRange: 45, moveSpeed: 0.0022 },
          { x: 1245, y: 250, w: 175, tier: 2, cloudType: 'normal' },
          { x: 1425, y: 315, w: 165, tier: 1, cloudType: 'normal' },

          // Wooden bridge step at the right end of Checkpoint Island 1 (x: 1510..1790)
          { x: 1735, y: 368, w: 110, tier: 1, isWoodenBridgeStep: true },

          // Section 2: From Checkpoint Island 1 (x: 1790) to Checkpoint Island 2 (x: 3100..3380)
          { x: 1895, y: 330, w: 175, tier: 1, cloudType: 'normal' },
          { x: 2090, y: 280, w: 175, tier: 2, cloudType: 'storm', stormOffset: 900 },
          { x: 2290, y: 230, w: 175, tier: 3, cloudType: 'normal' },
          { x: 2495, y: 275, w: 175, tier: 1, cloudType: 'moving', moveRange: 50, moveSpeed: 0.0024 },
          { x: 2705, y: 235, w: 175, tier: 2, cloudType: 'storm', stormOffset: 450 },
          { x: 2900, y: 285, w: 175, tier: 1, cloudType: 'normal' },
          { x: 3045, y: 335, w: 155, tier: 1, cloudType: 'normal' },

          // Wooden bridge step at the right end of Checkpoint Island 2 (x: 3100..3380)
          { x: 3325, y: 368, w: 110, tier: 1, isWoodenBridgeStep: true },

          // Section 3: From Checkpoint Island 2 (x: 3380) to the Catfish Pier & Vodyanyk Tsar Arena (x: 4140..4800)
          { x: 3485, y: 330, w: 175, tier: 1, cloudType: 'normal' },
          { x: 3685, y: 275, w: 175, tier: 2, cloudType: 'moving', moveRange: 48, moveSpeed: 0.0024 },
          { x: 3890, y: 230, w: 175, tier: 3, cloudType: 'storm', stormOffset: 300 },
          { x: 4075, y: 305, w: 170, tier: 1, cloudType: 'normal' },

          // Boss & Catfish Pier Perch Clouds (above the final pier)
          { x: 4310, y: 295, w: 170, tier: 1, cloudType: 'normal' },
          { x: 4510, y: 220, w: 180, tier: 2, cloudType: 'normal' },
          { x: 4680, y: 295, w: 160, tier: 1, cloudType: 'normal' }
        ],
        // Pressurized Dnipro Water Geyser Traps erupting between cloud gaps
        geysers: [
          { x: 745, offsetMs: 0 },
          { x: 1145, offsetMs: 1200 },
          { x: 2190, offsetMs: 500 },
          { x: 2600, offsetMs: 1600 },
          { x: 3585, offsetMs: 800 },
          { x: 3985, offsetMs: 1400 }
        ],
        checkpoints: [
          { id: 1, type: 'well', x: 1640, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_CHAYKA },
          { id: 2, type: 'pillar', x: 3240, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_KHORTYTSIA }
        ],
        enemies: [
          // Section 1: Rusalky leaping from the Dnipro water + Potercha + Vodyanyk on cloud
          { type: 'rusalka', x: 550, y: CONFIG.GROUND_Y + 4, minX: 430, maxX: 680 },
          { type: 'potercha', x: 750, y: 195, minX: 620, maxX: 900 },
          { type: 'rusalka', x: 950, y: CONFIG.GROUND_Y + 4, minX: 830, maxX: 1120 },
          { type: 'vodyanyk', x: 1245, y: 210, minX: 1185, maxX: 1305 },
          { type: 'rusalka', x: 1360, y: CONFIG.GROUND_Y + 4, minX: 1260, maxX: 1460 },

          // Section 2: Deeper Dnipro Rapids — more Rusalky, Vodyanyky, and Poterchata
          { type: 'rusalka', x: 1995, y: CONFIG.GROUND_Y + 4, minX: 1870, maxX: 2130 },
          { type: 'vodyanyk', x: 2290, y: 190, minX: 2225, maxX: 2355 },
          { type: 'rusalka', x: 2400, y: CONFIG.GROUND_Y + 4, minX: 2280, maxX: 2560 },
          { type: 'potercha', x: 2600, y: 175, minX: 2460, maxX: 2780 },
          { type: 'rusalka', x: 2810, y: CONFIG.GROUND_Y + 4, minX: 2680, maxX: 2980 },

          // Section 3: Final Rapids Gauntlet before the Catfish Pier
          { type: 'rusalka', x: 3585, y: CONFIG.GROUND_Y + 4, minX: 3460, maxX: 3740 },
          { type: 'potercha', x: 3790, y: 165, minX: 3650, maxX: 3940 },
          { type: 'vodyanyk', x: 4075, y: 265, minX: 4010, maxX: 4135 },
          { type: 'rusalka', x: 3985, y: CONFIG.GROUND_Y + 4, minX: 3860, maxX: 4090 }
        ],
        bossArenaStartX: 4160,
        bossSpawnX: 4540,
        catfishDockX: 4710
      };
    }

    /**
     * ============================================================================
     * 3D. LEVEL 4 («ДИКЕ ПОЛЕ І ЧОРНЕ МОРЕ»): STEPPE WINDS, SYVASH BRINE & COAST
     * ============================================================================
     * - Continuous solid ground (worldWidth = 7200) transitioning from feather-grass
     *   steppe & Scythian kurhans to the pink salt brine of Syvash and the Black Sea shore
     * - 3 Checkpoints: Chumak Cart ('cart'), Scythian Stone Baba ('baba'), Overturned Chayka ('boat')
     * - 4 Steppe & Coastal Enemies: Polovyk, Vovkulaka, Tumbleweed, Seagull
     * - Low coastal platforms (isCoastLow: true) periodically flooded by sea waves
     */
    function buildSteppeCoastLevelData() {
      return {
        worldWidth: CONFIG.STEPPE.WORLD_WIDTH,
        platforms: [
          // Zone 1: Dawn Feather-Grass Steppe (x: 0..1850) — Tiers 1–3
          { x: 420, y: 320, w: 190, tier: 1 },
          { x: 710, y: 235, w: 210, tier: 2 },
          { x: 1010, y: 320, w: 190, tier: 1 },
          { x: 1290, y: 155, w: 220, tier: 3 },
          { x: 1560, y: 245, w: 200, tier: 2 },

          // Zone 2: Kurhan Ridge & High Steppe Wind Corridor (x: 1850..3850)
          { x: 2080, y: 318, w: 200, tier: 1 },
          { x: 2360, y: 230, w: 220, tier: 2 },
          { x: 2650, y: 150, w: 210, tier: 3 },
          { x: 2920, y: 315, w: 195, tier: 1 },
          { x: 3210, y: 230, w: 225, tier: 2 },
          { x: 3510, y: 155, w: 200, tier: 3 },
          { x: 3690, y: 315, w: 180, tier: 1 },

          // Zone 3: Golden Hour Ravines & Approach to Syvash (x: 3850..5650)
          { x: 4090, y: 315, w: 200, tier: 1 },
          { x: 4370, y: 230, w: 220, tier: 2 },
          { x: 4640, y: 150, w: 200, tier: 3 },
          // Coastal low wooden/salt ledges (isCoastLow: true -> flooded during tidal wave crest!)
          { x: 4880, y: 342, w: 195, tier: 1, isCoastLow: true },
          { x: 5140, y: 235, w: 210, tier: 2 },
          { x: 5410, y: 342, w: 195, tier: 1, isCoastLow: true },

          // Zone 4: Black Sea Shore before Arena (x: 5650..6240)
          { x: 5840, y: 342, w: 190, tier: 1, isCoastLow: true },
          { x: 6070, y: 235, w: 195, tier: 2 },

          // Boss Arena «Соляна гора» (x: 6240..7200): 3 tiers of fragile salt-crystal platforms!
          { x: 6365, y: 326, w: 135, tier: 1, isCrystalPlatform: true, fragile: true },
          { x: 6625, y: 326, w: 135, tier: 1, isCrystalPlatform: true, fragile: true },
          { x: 6495, y: 244, w: 140, tier: 2, isCrystalPlatform: true, fragile: true },
          { x: 6740, y: 244, w: 130, tier: 2, isCrystalPlatform: true, fragile: true },
          { x: 6380, y: 162, w: 130, tier: 3, isCrystalPlatform: true, fragile: true },
          { x: 6615, y: 162, w: 135, tier: 3, isCrystalPlatform: true, fragile: true }
        ],
        checkpoints: [
          { id: 1, type: 'cart', x: 1850, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_CART },
          { id: 2, type: 'baba', x: 3850, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_BABA },
          { id: 3, type: 'boat', x: 5650, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_BOAT }
        ],
        enemies: [
          // Zone 1 (0..1850): Smooth introduction to Polovyk (ambush in grass) & Tumbleweed
          { type: 'polovyk', x: 520, y: 368, minX: 360, maxX: 700 },
          { type: 'tumbleweed', x: 860, y: 372, minX: 660, maxX: 1120 },
          { type: 'polovyk', x: 1160, y: 368, minX: 980, maxX: 1360 },
          { type: 'vovkulaka', x: 1480, y: 364, minX: 1280, maxX: 1680 },
          { type: 'tumbleweed', x: 1690, y: 372, minX: 1500, maxX: 1810 },

          // Zone 2 (1850..3850): High Steppe — Vovkulaka packs, Polovyky & wind-driven Tumbleweeds
          { type: 'polovyk', x: 2140, y: 368, minX: 1960, maxX: 2320 },
          { type: 'vovkulaka', x: 2440, y: 364, minX: 2240, maxX: 2660 },
          { type: 'tumbleweed', x: 2740, y: 372, minX: 2520, maxX: 2980 },
          { type: 'polovyk', x: 2940, y: 280, minX: 2830, maxX: 3010 },
          { type: 'vovkulaka', x: 3180, y: 364, minX: 2980, maxX: 3420 },
          { type: 'tumbleweed', x: 3460, y: 372, minX: 3260, maxX: 3680 },
          { type: 'vovkulaka', x: 3660, y: 364, minX: 3480, maxX: 3800 },

          // Zone 3 (3850..5650): Transition to Syvash Coast — Seagulls join Vovkulaka & Polovyk
          { type: 'polovyk', x: 4140, y: 368, minX: 3960, maxX: 4320 },
          { type: 'seagull', x: 4380, y: 165, minX: 4120, maxX: 4640 },
          { type: 'vovkulaka', x: 4580, y: 364, minX: 4380, maxX: 4800 },
          { type: 'tumbleweed', x: 4890, y: 372, minX: 4680, maxX: 5120 },
          { type: 'seagull', x: 5160, y: 160, minX: 4920, maxX: 5440 },
          { type: 'polovyk', x: 5420, y: 368, minX: 5220, maxX: 5580 },

          // Zone 4 (5650..6200): Black Sea Shore Gauntlet before the Salt Mountain Arena
          { type: 'seagull', x: 5820, y: 155, minX: 5680, maxX: 6020 },
          { type: 'vovkulaka', x: 5940, y: 364, minX: 5760, maxX: 6140 },
          { type: 'tumbleweed', x: 6080, y: 372, minX: 5880, maxX: 6200 },
          { type: 'seagull', x: 6130, y: 155, minX: 5950, maxX: 6220 }
        ],
        bossArenaStartX: CONFIG.STEPPE.BOSS_ARENA_START_X,
        bossSpawnX: 6920
      };
    }