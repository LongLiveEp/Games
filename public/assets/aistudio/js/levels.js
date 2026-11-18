
    /**
     * ============================================================================
     * 3. LEVEL 1 HYBRID ROOM GRAPH (`LEVEL1_CHUNKS` — DEAD CELLS STYLE)
     * ============================================================================
     * Multi-layered branching room graph for Act I («Хутір і узлісся»):
     *  - Node 1 (`chunk_village_start`, 1440×540, x: 0..1440):
     *      Calm village lane, wattle fences/platforms, 3 unruly Geese, Old Well / Cellar Trapdoor
     *      (down to `chunk_cellar_dungeon`), High Fence & Roof (up to `chunk_mill_upper`),
     *      and main road east to `chunk_pond_road`.
     *  - Node 2A (`chunk_pond_road`, 1600×540, x: 1440..3040):
     *      Main route along the pond with multi-tiered wooden decks, flocks of Geese &
     *      rock/cone-lobbing Pesyholovtsi, upper access to `chunk_mill_upper`, cellar exit stairs,
     *      and gate to `chunk_boss_rooster`.
     *  - Node 2B (`chunk_cellar_dungeon`, 1920×540, x: 4200..6120):
     *      Abandoned Cossack underground cellar with dark timber beams, cobwebs, barrels,
     *      subterranean Pesyholovtsi + 1 sentry Goose, a Breakable False Wall (`breakableWalls`)
     *      hiding a Secret Stash (Cherry Kissel Jug full heal, +3 Galushkas, and the
     *      "Ancient Chronicle of the Pesyholovtsi" Bestiary artifact), and right stairs emerging
     *      into the final third of `chunk_pond_road`.
     *  - Node 2C (`chunk_mill_upper`, 1280×540, x: 6400..7680):
     *      Old Windmill Attic upper corridor accessible from high roofs in Node 1 or Node 2A.
     *      Platforming challenge across high rafters with 1 flying sentry Goose, rewarding the
     *      Sizzling Frying Pan with Cracklings (`shkvarky_pan`, +40% attack power + bonus coins)
     *      and a spectacular drop hatch straight down into `chunk_boss_rooster`.
     *  - Node 3 (`chunk_boss_rooster`, 960×540, x: 3040..4000):
     *      Enclosed courtyard in front of Kum Hrytsko's hut — Boss Arena of Mad Rooster Korniy.
     */
    const LEVEL1_CHUNKS = {
      chunk_village_start: {
        id: 'chunk_village_start',
        type: 'combat',
        bounds: { x: 0, y: 0, width: 1440, height: 540 },
        platforms: [
          { x: 360, y: 320, w: 180, tier: 1 },
          { x: 630, y: 235, w: 200, tier: 2 },
          { x: 920, y: 315, w: 190, tier: 1 },
          { x: 1060, y: 230, w: 170, tier: 2 },
          { x: 1230, y: 150, w: 220, tier: 3 }
        ],
        breakableWalls: [],
        loot: [
          { type: 'coin', x: 630, y: 200 },
          { type: 'galushka', x: 920, y: 280 }
        ],
        checkpoints: [
          { id: 1, type: 'well', x: 1130, y: CONFIG.GROUND_Y, chunkId: 'chunk_village_start' }
        ],
        enemies: [
          { type: 'goose', x: 460, y: 370, minX: 280, maxX: 660, chunkId: 'chunk_village_start' },
          { type: 'goose', x: 640, y: 200, minX: 530, maxX: 740, chunkId: 'chunk_village_start' },
          { type: 'goose', x: 960, y: 370, minX: 780, maxX: 1110, chunkId: 'chunk_village_start' }
        ],
        portals: [
          {
            id: 'village_to_cellar',
            x: 1265,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_cellar_dungeon',
            targetX: 4320,
            targetY: CONFIG.GROUND_Y - 45,
            allowShiftDown: true,
            allowDownKey: true,
            visualType: 'trapdoor',
            promptKey: 'PORTAL_CELLAR_DOWN'
          },
          {
            id: 'village_to_mill',
            x: 1245,
            y: 150,
            targetChunkId: 'chunk_mill_upper',
            targetX: 7610,
            targetY: CONFIG.GROUND_Y - 45,
            visualType: 'roof_ladder',
            promptKey: 'PORTAL_MILL_UP'
          },
          {
            id: 'village_to_pond',
            x: 1395,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_pond_road',
            targetX: 1510,
            targetY: CONFIG.GROUND_Y - 45,
            autoEdge: 'right',
            visualType: 'road_gate',
            promptKey: 'PORTAL_POND_ROAD'
          }
        ]
      },

      chunk_pond_road: {
        id: 'chunk_pond_road',
        type: 'combat',
        bounds: { x: 1440, y: 0, width: 1600, height: 540 },
        platforms: [
          { x: 1640, y: 320, w: 200, tier: 1 },
          { x: 1870, y: 235, w: 220, tier: 2 },
          { x: 2090, y: 150, w: 210, tier: 3 },
          { x: 2170, y: 320, w: 190, tier: 1 },
          { x: 2430, y: 235, w: 230, tier: 2 },
          { x: 2680, y: 320, w: 200, tier: 1 }
        ],
        breakableWalls: [],
        loot: [
          { type: 'coin', x: 1870, y: 200 },
          { type: 'food', x: 2430, y: 200 }
        ],
        checkpoints: [
          { id: 2, type: 'pillar', x: 2880, y: CONFIG.GROUND_Y, chunkId: 'chunk_pond_road' }
        ],
        enemies: [
          { type: 'goose', x: 1680, y: 370, minX: 1520, maxX: 1840, chunkId: 'chunk_pond_road' },
          { type: 'leshy', x: 1920, y: 370, minX: 1740, maxX: 2120, chunkId: 'chunk_pond_road' },
          { type: 'goose', x: 1880, y: 200, minX: 1770, maxX: 1980, chunkId: 'chunk_pond_road' },
          { type: 'leshy', x: 2260, y: 370, minX: 2080, maxX: 2460, chunkId: 'chunk_pond_road' },
          { type: 'goose', x: 2440, y: 200, minX: 2320, maxX: 2540, chunkId: 'chunk_pond_road' },
          { type: 'leshy', x: 2590, y: 370, minX: 2420, maxX: 2780, chunkId: 'chunk_pond_road' }
        ],
        portals: [
          {
            id: 'pond_to_village',
            x: 1475,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_village_start',
            targetX: 1345,
            targetY: CONFIG.GROUND_Y - 45,
            autoEdge: 'left',
            visualType: 'road_gate',
            promptKey: 'PORTAL_VILLAGE_BACK'
          },
          {
            id: 'pond_to_mill',
            x: 2090,
            y: 150,
            targetChunkId: 'chunk_mill_upper',
            targetX: 7610,
            targetY: CONFIG.GROUND_Y - 45,
            visualType: 'roof_ladder',
            promptKey: 'PORTAL_MILL_UP'
          },
          {
            id: 'pond_to_cellar',
            x: 2760,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_cellar_dungeon',
            targetX: 6220,
            targetY: CONFIG.GROUND_Y - 45,
            allowShiftDown: true,
            allowDownKey: true,
            visualType: 'trapdoor',
            promptKey: 'PORTAL_CELLAR_DOWN'
          },
          {
            id: 'pond_to_boss',
            x: 2995,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_boss_rooster',
            targetX: 3120,
            targetY: CONFIG.GROUND_Y - 45,
            autoEdge: 'right',
            visualType: 'road_gate',
            promptKey: 'PORTAL_BOSS_YARD'
          }
        ]
      },

      chunk_cellar_dungeon: {
        id: 'chunk_cellar_dungeon',
        type: 'dungeon',
        bounds: { x: 4200, y: 0, width: 3000, height: 540 },
        platforms: [
          // Long multi-tiered cellar oak storage racks & barrel shelves
          { x: 4560, y: 325, w: 190, tier: 1, isCellarPlatform: true },
          { x: 4820, y: 245, w: 210, tier: 2, isCellarPlatform: true },
          { x: 5090, y: 170, w: 180, tier: 3, isCellarPlatform: true },
          { x: 5150, y: 325, w: 200, tier: 1, isCellarPlatform: true },
          { x: 5440, y: 245, w: 210, tier: 2, isCellarPlatform: true },
          { x: 5730, y: 325, w: 200, tier: 1, isCellarPlatform: true },
          { x: 5990, y: 235, w: 210, tier: 2, isCellarPlatform: true },
          { x: 6260, y: 165, w: 190, tier: 3, isCellarPlatform: true },
          { x: 6490, y: 320, w: 190, tier: 1, isCellarPlatform: true },
          // Secret stash shelf at the far end of the cellar behind breakable wall (x: 6680..7160)
          { x: 6940, y: 310, w: 210, tier: 1, isCellarPlatform: true }
        ],
        breakableWalls: [
          {
            id: 'cellar_secret_wall',
            x: 6680,
            y: CONFIG.GROUND_Y - 62,
            width: 38,
            height: 124,
            hp: 3
          }
        ],
        loot: [
          // Corridor pickups along upper shelves
          { type: 'coin', x: 5090, y: 135 },
          { type: 'food', x: 5440, y: 210 },
          { type: 'coin', x: 6260, y: 130 },
          // Secret stash rewards hidden at the far end behind the breakable false wall (x: 6720..7120)
          { type: 'secret_kissel_jug', x: 6810, y: CONFIG.GROUND_Y - 22, isSecret: true },
          { type: 'secret_galushka_stash', x: 6935, y: CONFIG.GROUND_Y - 22, isSecret: true },
          { type: 'secret_bestiary_scroll', x: 7065, y: CONFIG.GROUND_Y - 26, isSecret: true },
          { type: 'coin', x: 6885, y: 275, isSecret: true },
          { type: 'coin', x: 6995, y: 275, isSecret: true }
        ],
        checkpoints: [],
        enemies: [
          { type: 'cellar_rat', x: 4620, y: 375, minX: 4430, maxX: 4840, chunkId: 'chunk_cellar_dungeon' },
          { type: 'leshy', x: 4920, y: 370, minX: 4720, maxX: 5140, chunkId: 'chunk_cellar_dungeon', stayOnSurface: true },
          { type: 'cellar_rat', x: 4820, y: 210, minX: 4725, maxX: 4915, chunkId: 'chunk_cellar_dungeon' },
          { type: 'cellar_rat', x: 5250, y: 375, minX: 5020, maxX: 5480, chunkId: 'chunk_cellar_dungeon' },
          { type: 'goose', x: 5440, y: 210, minX: 5345, maxX: 5535, chunkId: 'chunk_cellar_dungeon' },
          { type: 'leshy', x: 5620, y: 370, minX: 5420, maxX: 5840, chunkId: 'chunk_cellar_dungeon', stayOnSurface: true },
          { type: 'cellar_rat', x: 5860, y: 375, minX: 5640, maxX: 6100, chunkId: 'chunk_cellar_dungeon' },
          { type: 'cellar_rat', x: 5990, y: 200, minX: 5895, maxX: 6085, chunkId: 'chunk_cellar_dungeon' },
          { type: 'leshy', x: 6360, y: 370, minX: 6160, maxX: 6580, chunkId: 'chunk_cellar_dungeon', stayOnSurface: true },
          { type: 'cellar_rat', x: 6540, y: 375, minX: 6340, maxX: 6640, chunkId: 'chunk_cellar_dungeon' }
        ],
        portals: [
          {
            id: 'cellar_to_village',
            x: 4320,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_village_start',
            targetX: 1265,
            targetY: CONFIG.GROUND_Y - 45,
            visualType: 'cellar_stairs_up',
            promptKey: 'PORTAL_CELLAR_UP_WELL'
          },
          {
            id: 'cellar_to_pond_end',
            x: 6220,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_pond_road',
            targetX: 2760,
            targetY: CONFIG.GROUND_Y - 45,
            visualType: 'cellar_stairs_up',
            promptKey: 'PORTAL_CELLAR_UP_POND'
          }
        ]
      },

      chunk_mill_upper: {
        id: 'chunk_mill_upper',
        type: 'combat',
        bounds: { x: 7500, y: 0, width: 2600, height: 540 },
        platforms: [
          { x: 7780, y: 325, w: 180, tier: 1 },
          { x: 8020, y: 245, w: 190, tier: 2 },
          { x: 8270, y: 170, w: 200, tier: 3 },
          { x: 8510, y: 295, w: 190, tier: 1 },
          { x: 8760, y: 215, w: 200, tier: 2 },
          { x: 9010, y: 155, w: 210, tier: 3 },
          { x: 9240, y: 280, w: 190, tier: 1 },
          { x: 9480, y: 195, w: 200, tier: 2 },
          { x: 9720, y: 240, w: 230, tier: 2 }
        ],
        breakableWalls: [],
        loot: [
          { type: 'coin', x: 8020, y: 210 },
          { type: 'galushka', x: 8270, y: 135 },
          { type: 'coin', x: 8760, y: 180 },
          { type: 'food', x: 9010, y: 120 },
          { type: 'coin', x: 9480, y: 160 },
          { type: 'shkvarky_pan', x: 9730, y: 200 }
        ],
        checkpoints: [],
        enemies: [
          { type: 'mill_bat', x: 7860, y: 84, minX: 7680, maxX: 8080, roost: true, chunkId: 'chunk_mill_upper' },
          { type: 'mill_bat', x: 8140, y: 150, minX: 7920, maxX: 8360, roost: false, chunkId: 'chunk_mill_upper' },
          { type: 'mill_bat', x: 8390, y: 78, minX: 8180, maxX: 8600, roost: true, chunkId: 'chunk_mill_upper' },
          { type: 'mill_bat', x: 8640, y: 165, minX: 8420, maxX: 8860, roost: false, chunkId: 'chunk_mill_upper' },
          { type: 'goose', x: 8760, y: 180, minX: 8665, maxX: 8855, chunkId: 'chunk_mill_upper' },
          { type: 'mill_bat', x: 8920, y: 80, minX: 8720, maxX: 9140, roost: true, chunkId: 'chunk_mill_upper' },
          { type: 'mill_bat', x: 9180, y: 150, minX: 8960, maxX: 9400, roost: false, chunkId: 'chunk_mill_upper' },
          { type: 'mill_bat', x: 9440, y: 82, minX: 9240, maxX: 9660, roost: true, chunkId: 'chunk_mill_upper' },
          { type: 'mill_bat', x: 9680, y: 145, minX: 9480, maxX: 9900, roost: false, chunkId: 'chunk_mill_upper' }
        ],
        portals: [
          {
            id: 'mill_to_village',
            x: 7590,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_village_start',
            targetX: 1230,
            targetY: 105,
            allowDownKey: true,
            visualType: 'trapdoor',
            promptKey: 'PORTAL_MILL_DOWN_START'
          },
          {
            id: 'mill_to_boss',
            x: 9980,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_boss_rooster',
            targetX: 3150,
            targetY: 165,
            allowShiftDown: true,
            allowDownKey: true,
            visualType: 'chute_drop',
            promptKey: 'PORTAL_MILL_DROP_BOSS'
          }
        ]
      },

      chunk_boss_rooster: {
        id: 'chunk_boss_rooster',
        type: 'boss',
        bounds: { x: 3040, y: 0, width: 960, height: 540 },
        platforms: [
          { x: 3220, y: 300, w: 150, tier: 1 },
          { x: 3740, y: 300, w: 150, tier: 1 },
          { x: 3480, y: 200, w: 180, tier: 2 }
        ],
        breakableWalls: [],
        loot: [],
        checkpoints: [],
        enemies: [],
        portals: []
      }
    };

    function buildAct1ChunkLevelData() {
      const platforms = [];
      const checkpoints = [];
      const enemies = [];
      const breakableWalls = [];
      const chunkLoot = [];
      const portals = [];

      Object.values(LEVEL1_CHUNKS).forEach(chunk => {
        (chunk.platforms || []).forEach(p => platforms.push({ ...p, chunkId: chunk.id }));
        (chunk.checkpoints || []).forEach(cp => checkpoints.push({ ...cp, chunkId: chunk.id }));
        (chunk.enemies || []).forEach(en => enemies.push({ ...en, chunkId: chunk.id }));
        (chunk.breakableWalls || []).forEach(bw => breakableWalls.push({ ...bw, chunkId: chunk.id }));
        (chunk.loot || []).forEach(lt => chunkLoot.push({ ...lt, chunkId: chunk.id }));
        (chunk.portals || []).forEach(pt => portals.push({ ...pt, chunkId: chunk.id }));
      });

      return {
        worldWidth: 10100,
        chunks: LEVEL1_CHUNKS,
        initialChunkId: 'chunk_village_start',
        platforms,
        checkpoints,
        enemies,
        breakableWalls,
        chunkLoot,
        portals,
        bossArenaStartX: 3040,
        bossSpawnX: 3680
      };
    }

    const LEVEL_1_DATA = buildAct1ChunkLevelData();

    /**
     * ============================================================================
     * 3B. LEVEL 2 («ЗЛИЙ ЛІС» & КОРЧМА «КУЦИЙ ХВІСТ») HYBRID CHUNK ARCHITECTURE
     *  - Node 1 (`chunk_forest_edge`, 1600×540): Узлісся Моховиків (вхід у ліс, вибір шляху)
     *  - Node 2A (`chunk_forest_glade`, 1920×540): Крива Галявина та Корчма «Куций Хвіст» (посередині рівня!)
     *  - Node 2B (`chunk_root_catacombs`, 1600×540): Корінні Катакомби під Дубами + Секретна кімната за корінням
     *  - Node 2C (`chunk_canopy_walk`, 1280×540): Верховіття Вікових Дубів (верхній маршрут по гілках)
     *  - Node 2D (`chunk_korchma_hall`, 1600×540): Корчма «Куций Хвіст» — Коридор із куцими чортами
     *  - Node 2E (`chunk_korchma_boss`, 1100×540): Бенкетна Зала Корчми — Міні-бос ЛИХО (дає Червоні Чоботи!)
     *  - Node 3 (`chunk_boss_lisovyk`, 1080×540): Серце Хащі — Арена Прадавнього Лісовика Чорнобора
     * ============================================================================
     */
    const LEVEL2_CHUNKS = {
      chunk_forest_edge: {
        id: 'chunk_forest_edge',
        type: 'combat',
        bounds: { x: 0, y: 0, width: 1600, height: 540 },
        platforms: [
          { x: 350, y: 315, w: 180, tier: 1 },
          { x: 610, y: 230, w: 200, tier: 2 },
          { x: 890, y: 315, w: 190, tier: 1 },
          { x: 1180, y: 310, w: 170, tier: 1 },
          { x: 1310, y: 230, w: 170, tier: 2 },
          { x: 1410, y: 150, w: 210, tier: 3 }
        ],
        breakableWalls: [],
        loot: [
          { type: 'coin', x: 610, y: 194 },
          { type: 'coin', x: 1410, y: 114 }
        ],
        checkpoints: [
          { id: 1, type: 'well', x: 1150, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_SHRINE }
        ],
        enemies: [
          { type: 'shield_guardian', x: 470, y: 365, minX: 300, maxX: 660, chunkId: 'chunk_forest_edge' },
          { type: 'nyavka', x: 640, y: 185, minX: 480, maxX: 830, chunkId: 'chunk_forest_edge' },
          { type: 'leshy', x: 880, y: 370, minX: 720, maxX: 1060, stayOnSurface: true, chunkId: 'chunk_forest_edge' },
          { type: 'shield_guardian', x: 1060, y: 365, minX: 900, maxX: 1250, chunkId: 'chunk_forest_edge' }
        ],
        portals: [
          {
            id: 'forest_to_catacombs',
            x: 1380,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_root_catacombs',
            targetX: 5220,
            targetY: 360,
            allowShiftDown: true,
            allowDownKey: true,
            visualType: 'trapdoor',
            promptKey: 'PORTAL_FOREST_TO_CATACOMBS'
          },
          {
            id: 'forest_to_canopy',
            x: 1420,
            y: 150,
            targetChunkId: 'chunk_canopy_walk',
            targetX: 6690,
            targetY: 360,
            visualType: 'roof_ladder',
            promptKey: 'PORTAL_FOREST_TO_CANOPY'
          },
          {
            id: 'forest_to_glade',
            x: 1555,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_forest_glade',
            targetX: 1680,
            targetY: 360,
            autoEdge: 'right',
            visualType: 'road_gate',
            promptKey: 'PORTAL_FOREST_TO_GLADE'
          }
        ]
      },

      chunk_forest_glade: {
        id: 'chunk_forest_glade',
        type: 'combat',
        bounds: { x: 1600, y: 0, width: 1920, height: 540 },
        platforms: [
          { x: 1840, y: 315, w: 190, tier: 1 },
          { x: 2080, y: 230, w: 210, tier: 2 },
          { x: 2260, y: 150, w: 190, tier: 3 },
          { x: 2820, y: 315, w: 200, tier: 1 },
          { x: 3080, y: 230, w: 210, tier: 2 },
          { x: 3310, y: 315, w: 180, tier: 1 }
        ],
        breakableWalls: [],
        loot: [
          { type: 'coin', x: 2080, y: 194 },
          { type: 'food', x: 3080, y: 194 }
        ],
        checkpoints: [
          { id: 2, type: 'pillar', x: 2320, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_OAK }
        ],
        enemies: [
          { type: 'bolotyanyk', x: 1860, y: 365, minX: 1700, maxX: 2040, chunkId: 'chunk_forest_glade' },
          { type: 'shield_guardian', x: 2100, y: 365, minX: 1940, maxX: 2260, chunkId: 'chunk_forest_glade' },
          { type: 'nyavka', x: 2080, y: 180, minX: 1920, maxX: 2250, chunkId: 'chunk_forest_glade' },
          { type: 'bolotyanyk', x: 2880, y: 365, minX: 2720, maxX: 3060, chunkId: 'chunk_forest_glade' },
          { type: 'shield_guardian', x: 3180, y: 365, minX: 3000, maxX: 3360, chunkId: 'chunk_forest_glade' },
          { type: 'nyavka', x: 3100, y: 175, minX: 2940, maxX: 3280, chunkId: 'chunk_forest_glade' }
        ],
        portals: [
          {
            id: 'glade_to_forest',
            x: 1635,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_forest_edge',
            targetX: 1490,
            targetY: 360,
            autoEdge: 'left',
            visualType: 'road_gate',
            promptKey: 'PORTAL_GLADE_TO_FOREST'
          },
          {
            id: 'glade_to_canopy',
            x: 2260,
            y: 150,
            targetChunkId: 'chunk_canopy_walk',
            targetX: 6690,
            targetY: 360,
            visualType: 'roof_ladder',
            promptKey: 'PORTAL_FOREST_TO_CANOPY'
          },
          {
            id: 'glade_to_korchma',
            x: 2500,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_korchma_hall',
            targetX: 8220,
            targetY: 360,
            visualType: 'korchma_door',
            promptKey: 'PORTAL_ENTER_KORCHMA'
          },
          {
            id: 'glade_to_catacombs',
            x: 3020,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_root_catacombs',
            targetX: 6260,
            targetY: 360,
            allowShiftDown: true,
            allowDownKey: true,
            visualType: 'trapdoor',
            promptKey: 'PORTAL_FOREST_TO_CATACOMBS'
          },
          {
            id: 'glade_to_boss',
            x: 3475,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_boss_lisovyk',
            targetX: 3610,
            targetY: 360,
            autoEdge: 'right',
            visualType: 'road_gate',
            promptKey: 'PORTAL_GLADE_TO_BOSS'
          }
        ]
      },

      chunk_root_catacombs: {
        id: 'chunk_root_catacombs',
        type: 'dungeon',
        bounds: { x: 4800, y: 0, width: 1600, height: 540 },
        platforms: [
          { x: 4960, y: 295, w: 170, tier: 1, isCellarPlatform: true },
          { x: 5420, y: 315, w: 190, tier: 1, isCellarPlatform: true },
          { x: 5690, y: 240, w: 190, tier: 2, isCellarPlatform: true },
          { x: 5980, y: 315, w: 200, tier: 1, isCellarPlatform: true }
        ],
        breakableWalls: [
          {
            id: 'wall_catacombs_secret',
            x: 5155,
            y: 345,
            width: 38,
            height: 120,
            hp: 3
          }
        ],
        loot: [
          { type: 'secret_kissel_jug', x: 4880, y: 368 },
          { type: 'secret_galushka_stash', x: 4960, y: 258 },
          { type: 'coin', x: 5030, y: 368 },
          { type: 'coin', x: 5690, y: 204 }
        ],
        checkpoints: [],
        enemies: [
          { type: 'leshy', x: 5480, y: 370, minX: 5310, maxX: 5680, stayOnSurface: true, chunkId: 'chunk_root_catacombs' },
          { type: 'bolotyanyk', x: 5820, y: 365, minX: 5640, maxX: 6020, chunkId: 'chunk_root_catacombs' },
          { type: 'shield_guardian', x: 6080, y: 365, minX: 5900, maxX: 6220, chunkId: 'chunk_root_catacombs' }
        ],
        portals: [
          {
            id: 'catacombs_to_forest',
            x: 5220,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_forest_edge',
            targetX: 1380,
            targetY: 360,
            visualType: 'cellar_stairs_up',
            promptKey: 'PORTAL_CATACOMBS_TO_FOREST'
          },
          {
            id: 'catacombs_to_glade',
            x: 6290,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_forest_glade',
            targetX: 3020,
            targetY: 360,
            visualType: 'cellar_stairs_up',
            promptKey: 'PORTAL_CATACOMBS_TO_GLADE'
          }
        ]
      },

      chunk_canopy_walk: {
        id: 'chunk_canopy_walk',
        type: 'combat',
        bounds: { x: 6600, y: 0, width: 1280, height: 540 },
        platforms: [
          { x: 6860, y: 320, w: 180, tier: 1 },
          { x: 7110, y: 240, w: 190, tier: 2 },
          { x: 7370, y: 175, w: 200, tier: 3 },
          { x: 7610, y: 245, w: 200, tier: 2 }
        ],
        breakableWalls: [],
        loot: [
          { type: 'coin', x: 6860, y: 284 },
          { type: 'food', x: 7110, y: 204 },
          { type: 'secret_galushka_stash', x: 7370, y: 138 },
          { type: 'coin', x: 7610, y: 208 }
        ],
        checkpoints: [],
        enemies: [
          { type: 'nyavka', x: 7120, y: 180, minX: 6940, maxX: 7320, chunkId: 'chunk_canopy_walk' },
          { type: 'nyavka', x: 7520, y: 170, minX: 7340, maxX: 7720, chunkId: 'chunk_canopy_walk' }
        ],
        portals: [
          {
            id: 'canopy_to_forest',
            x: 6685,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_forest_edge',
            targetX: 1410,
            targetY: 105,
            allowDownKey: true,
            visualType: 'trapdoor',
            promptKey: 'PORTAL_CANOPY_TO_FOREST'
          },
          {
            id: 'canopy_to_boss',
            x: 7775,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_boss_lisovyk',
            targetX: 3640,
            targetY: 165,
            allowShiftDown: true,
            allowDownKey: true,
            visualType: 'chute_drop',
            promptKey: 'PORTAL_CANOPY_TO_BOSS'
          }
        ]
      },

      chunk_korchma_hall: {
        id: 'chunk_korchma_hall',
        type: 'dungeon',
        bounds: { x: 8100, y: 0, width: 2600, height: 540 },
        platforms: [
          { x: 8420, y: 315, w: 210, tier: 1, isCellarPlatform: true },
          { x: 8690, y: 230, w: 200, tier: 2, isCellarPlatform: true },
          { x: 8960, y: 315, w: 220, tier: 1, isCellarPlatform: true },
          { x: 9230, y: 225, w: 210, tier: 2, isCellarPlatform: true },
          { x: 9480, y: 145, w: 200, tier: 3, isCellarPlatform: true },
          { x: 9520, y: 315, w: 210, tier: 1, isCellarPlatform: true },
          { x: 9820, y: 230, w: 210, tier: 2, isCellarPlatform: true },
          { x: 10110, y: 315, w: 220, tier: 1, isCellarPlatform: true },
          { x: 10380, y: 225, w: 200, tier: 2, isCellarPlatform: true }
        ],
        breakableWalls: [],
        loot: [
          { type: 'coin', x: 8420, y: 280 },
          { type: 'food', x: 8690, y: 194 },
          { type: 'galushka', x: 9230, y: 190 },
          { type: 'secret_kissel_jug', x: 9480, y: 108 },
          { type: 'coin', x: 9820, y: 194 },
          { type: 'food', x: 10110, y: 280 },
          { type: 'galushka', x: 10380, y: 190 }
        ],
        checkpoints: [
          { id: 3, type: 'kobzar', x: 9380, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_KORCHMA }
        ],
        enemies: [
          { type: 'chort', x: 8460, y: 365, minX: 8280, maxX: 8660, chunkId: 'chunk_korchma_hall' },
          { type: 'dulya', x: 8740, y: 365, minX: 8520, maxX: 8980, chunkId: 'chunk_korchma_hall' },
          { type: 'chort', x: 8690, y: 190, minX: 8590, maxX: 8790, chunkId: 'chunk_korchma_hall' },
          { type: 'chort', x: 9040, y: 365, minX: 8860, maxX: 9260, chunkId: 'chunk_korchma_hall' },
          { type: 'dulya', x: 9280, y: 365, minX: 9060, maxX: 9520, chunkId: 'chunk_korchma_hall' },
          { type: 'chort', x: 9230, y: 185, minX: 9130, maxX: 9330, chunkId: 'chunk_korchma_hall' },
          { type: 'chort', x: 9680, y: 365, minX: 9480, maxX: 9900, chunkId: 'chunk_korchma_hall' },
          { type: 'dulya', x: 9980, y: 365, minX: 9740, maxX: 10220, chunkId: 'chunk_korchma_hall' },
          { type: 'chort', x: 9820, y: 190, minX: 9720, maxX: 9920, chunkId: 'chunk_korchma_hall' },
          { type: 'dulya', x: 10360, y: 365, minX: 10120, maxX: 10540, chunkId: 'chunk_korchma_hall' },
          { type: 'chort', x: 10440, y: 365, minX: 10220, maxX: 10560, chunkId: 'chunk_korchma_hall' }
        ],
        portals: [
          {
            id: 'korchma_to_glade',
            x: 8175,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_forest_glade',
            targetX: 2500,
            targetY: 360,
            autoEdge: 'left',
            visualType: 'korchma_exit_door',
            promptKey: 'PORTAL_EXIT_KORCHMA'
          },
          {
            id: 'korchma_to_lykho',
            x: 10615,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_korchma_boss',
            targetX: 10990,
            targetY: 360,
            autoEdge: 'right',
            visualType: 'korchma_boss_door',
            promptKey: 'PORTAL_KORCHMA_TO_LYKHO'
          }
        ]
      },

      chunk_korchma_boss: {
        id: 'chunk_korchma_boss',
        type: 'dungeon',
        bounds: { x: 10900, y: 0, width: 1400, height: 540 },
        platforms: [
          { x: 11180, y: 305, w: 180, tier: 1, isCellarPlatform: true },
          { x: 11480, y: 215, w: 200, tier: 2, isCellarPlatform: true },
          { x: 11790, y: 305, w: 185, tier: 1, isCellarPlatform: true },
          { x: 12060, y: 220, w: 180, tier: 2, isCellarPlatform: true }
        ],
        breakableWalls: [],
        loot: [
          { type: 'secret_kissel_jug', x: 11480, y: 176 },
          { type: 'galushka', x: 12060, y: 184 }
        ],
        checkpoints: [],
        enemies: [
          { type: 'dulya', x: 11260, y: 365, minX: 11060, maxX: 11480, chunkId: 'chunk_korchma_boss' },
          { type: 'chort', x: 11460, y: 365, minX: 11220, maxX: 11680, chunkId: 'chunk_korchma_boss' },
          { type: 'boss_lykho', x: 11880, y: 350, minX: 11040, maxX: 12180, chunkId: 'chunk_korchma_boss' }
        ],
        portals: [
          {
            id: 'lykho_to_hall',
            x: 10960,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_korchma_hall',
            targetX: 10540,
            targetY: 360,
            autoEdge: 'left',
            visualType: 'road_gate',
            promptKey: 'PORTAL_LYKHO_TO_HALL'
          },
          {
            id: 'lykho_to_forest_glade',
            x: 12215,
            y: CONFIG.GROUND_Y,
            targetChunkId: 'chunk_forest_glade',
            targetX: 2500,
            targetY: 360,
            visualType: 'korchma_exit_door',
            promptKey: 'PORTAL_EXIT_KORCHMA'
          }
        ]
      },

      chunk_boss_lisovyk: {
        id: 'chunk_boss_lisovyk',
        type: 'boss',
        bounds: { x: 3520, y: 0, width: 1080, height: 540 },
        platforms: [
          { x: 3720, y: 300, w: 155, tier: 1 },
          { x: 4320, y: 300, w: 155, tier: 1 },
          { x: 4020, y: 195, w: 190, tier: 2 }
        ],
        breakableWalls: [],
        loot: [],
        checkpoints: [],
        enemies: [],
        portals: []
      }
    };

    function buildEvilForestLevelData() {
      const platforms = [];
      const checkpoints = [];
      const enemies = [];
      const breakableWalls = [];
      const chunkLoot = [];
      const portals = [];

      Object.values(LEVEL2_CHUNKS).forEach(chunk => {
        (chunk.platforms || []).forEach(p => platforms.push({ ...p, chunkId: chunk.id }));
        (chunk.checkpoints || []).forEach(cp => checkpoints.push({ ...cp, chunkId: chunk.id }));
        (chunk.enemies || []).forEach(en => enemies.push({ ...en, chunkId: chunk.id }));
        (chunk.breakableWalls || []).forEach(bw => breakableWalls.push({ ...bw, chunkId: chunk.id }));
        (chunk.loot || []).forEach(lt => chunkLoot.push({ ...lt, chunkId: chunk.id }));
        (chunk.portals || []).forEach(pt => portals.push({ ...pt, chunkId: chunk.id }));
      });

      return {
        worldWidth: 12400,
        chunks: LEVEL2_CHUNKS,
        initialChunkId: 'chunk_forest_edge',
        platforms,
        checkpoints,
        enemies,
        breakableWalls,
        chunkLoot,
        portals,
        bossArenaStartX: 3520,
        bossSpawnX: 4220
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
    function validateLevelReachability(levelData) {
      const v1 = Math.abs(CONFIG.PLAYER.JUMP_VELOCITY);       // 530
      const v2 = Math.abs(CONFIG.PLAYER.DOUBLE_JUMP_VELOCITY); // 470
      const g = CONFIG.GRAVITY;                                // 1350
      const speed = CONFIG.PLAYER.SPEED;                       // 290

      const h1 = (v1 * v1) / (2 * g);
      const h2 = (v2 * v2) / (2 * g);
      const maxJumpHeight = h1 + h2; // ~185.85 px
      const tTotal = (v1 / g) + (v2 / g) + Math.sqrt((2 * maxJumpHeight) / g);
      const maxJumpDist = speed * tTotal; // ~367 px

      const safeDistRatio = (CONFIG.DNIPRO && CONFIG.DNIPRO.SAFE_DIST_RATIO) ? CONFIG.DNIPRO.SAFE_DIST_RATIO : 0.85;
      const safeHeightRatio = (CONFIG.DNIPRO && CONFIG.DNIPRO.SAFE_HEIGHT_RATIO) ? CONFIG.DNIPRO.SAFE_HEIGHT_RATIO : 0.80;
      const maxAllowedGap = maxJumpDist * safeDistRatio;
      const maxAllowedHeightDiff = maxJumpHeight * safeHeightRatio;

      const surfaces = [];
      (levelData.dryIslands || []).forEach((isl, idx) => {
        const left = isl.startX !== undefined ? isl.startX : (isl.x - isl.w / 2);
        const right = isl.endX !== undefined ? isl.endX : (isl.x + isl.w / 2);
        surfaces.push({
          label: isl.label || `Island #${idx + 1}`,
          left,
          right,
          y: CONFIG.GROUND_Y,
          moveRange: 0
        });
      });

      (levelData.platforms || []).forEach((p, idx) => {
        const halfW = (p.w || 140) / 2;
        const moveR = p.moveRange || 0;
        surfaces.push({
          label: p.isWoodenBridgeStep
            ? `BridgeStep@${p.x}`
            : `Cloud#${idx + 1}(${p.cloudType || 'normal'})@${p.x}`,
          left: p.x - halfW,
          right: p.x + halfW,
          y: p.y,
          moveRange: moveR
        });
      });

      surfaces.sort((a, b) => a.left - b.left);

      const issues = [];
      for (let i = 1; i < surfaces.length; i++) {
        const curr = surfaces[i];
        let bestGap = Infinity;
        let bestHeightDiff = Infinity;
        let reachableFromAny = false;

        for (let j = 0; j < i; j++) {
          const prev = surfaces[j];
          // Worst-case gap accounting for moving clouds
          const rawGap = Math.max(0, (curr.left + curr.moveRange) - (prev.right - prev.moveRange));
          const upwardDeltaY = Math.max(0, prev.y - curr.y);
          if (rawGap < bestGap) {
            bestGap = rawGap;
            bestHeightDiff = upwardDeltaY;
          }
          if (rawGap <= maxAllowedGap && upwardDeltaY <= maxAllowedHeightDiff) {
            reachableFromAny = true;
          }
        }

        if (!reachableFromAny) {
          const msg = `[Reachability Warning] Недосяжна платформа ${curr.label}: gap=${Math.round(bestGap)}px (ліміт ${Math.round(maxAllowedGap)}px), dY=${Math.round(bestHeightDiff)}px (ліміт ${Math.round(maxAllowedHeightDiff)}px)`;
          console.warn(msg);
          issues.push({ target: curr.label, gap: bestGap, upwardDeltaY: bestHeightDiff, msg });
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        maxJumpDist: Math.round(maxJumpDist),
        maxJumpHeight: Math.round(maxJumpHeight),
        maxAllowedGap: Math.round(maxAllowedGap),
        maxAllowedHeightDiff: Math.round(maxAllowedHeightDiff)
      };
    }

    function buildDniproLevelData() {
      const data = {
        worldWidth: CONFIG.DNIPRO ? CONFIG.DNIPRO.WORLD_WIDTH : 8400,
        // Solid wooden bridges & island piers at CONFIG.GROUND_Y (everywhere else is deep Dnipro water!)
        dryIslands: [
          { startX: 0, endX: 360, x: 180, w: 360, isBridge: true, label: 'Козацький Місточок' },
          { startX: 1510, endX: 1790, x: 1650, w: 280, isBridge: true, label: 'Козацький Острівець' },
          { startX: 3100, endX: 3380, x: 3240, w: 280, isBridge: true, label: 'Скеля Порогів' },
          { startX: 4140, endX: 4420, x: 4280, w: 280, isBridge: true, label: 'Громовий Поріг' },
          { startX: 5920, endX: 6200, x: 6060, w: 280, isBridge: true, label: 'Вирова Скеля' },
          // Boss Arena (x: 7100..8400): two side log-rafts and the central ~520px «Поміст Водяного Царя»
          {
            startX: CONFIG.DNIPRO.LEFT_RAFT_START_X,
            endX: CONFIG.DNIPRO.LEFT_RAFT_END_X,
            x: 7215,
            w: 190,
            isBridge: true,
            isRaft: true,
            label: STRINGS.VODYANYK_ARENA_LEFT_RAFT
          },
          {
            startX: CONFIG.DNIPRO.BOSS_DECK_START_X,
            endX: CONFIG.DNIPRO.BOSS_DECK_END_X,
            x: 7730,
            w: CONFIG.DNIPRO.BOSS_DECK_WIDTH,
            isBridge: true,
            isBossDeck: true,
            label: STRINGS.VODYANYK_ARENA_DECK_LABEL
          },
          {
            startX: CONFIG.DNIPRO.RIGHT_RAFT_START_X,
            endX: CONFIG.DNIPRO.RIGHT_RAFT_END_X,
            x: 8240,
            w: 200,
            isBridge: true,
            isRaft: true,
            label: STRINGS.VODYANYK_ARENA_RIGHT_RAFT
          }
        ],
        // Raised wooden bridge steps (містки-трампліни) on the piers + Cloud Platforms across the Dnipro
        platforms: [
          // Wooden bridge step at the right end of the Starting Bridge (x: 0..360) for an effortless jump to the 1st cloud!
          { x: 295, y: 368, w: 120, tier: 1, isWoodenBridgeStep: true },

          // Section 1: From Starting Bridge (x: 360) to Checkpoint Island 1 (x: 1510..1790) — kept intact
          { x: 455, y: 335, w: 175, tier: 1, cloudType: 'normal' },
          { x: 645, y: 290, w: 175, tier: 2, cloudType: 'normal' },
          { x: 845, y: 245, w: 175, tier: 2, cloudType: 'storm', stormOffset: 0 },
          { x: 1045, y: 285, w: 175, tier: 1, cloudType: 'moving', moveRange: 45, moveSpeed: 0.0022 },
          { x: 1245, y: 250, w: 175, tier: 2, cloudType: 'normal' },
          { x: 1425, y: 315, w: 165, tier: 1, cloudType: 'normal' },

          // Wooden bridge step at the right end of Checkpoint Island 1 (x: 1510..1790)
          { x: 1735, y: 368, w: 110, tier: 1, isWoodenBridgeStep: true },

          // Section 2: From Checkpoint Island 1 (x: 1790) to Checkpoint Island 2 (x: 3100..3380) — kept intact
          { x: 1895, y: 330, w: 175, tier: 1, cloudType: 'normal' },
          { x: 2090, y: 280, w: 175, tier: 2, cloudType: 'storm', stormOffset: 900 },
          { x: 2290, y: 230, w: 175, tier: 3, cloudType: 'normal' },
          { x: 2495, y: 275, w: 175, tier: 1, cloudType: 'moving', moveRange: 50, moveSpeed: 0.0024 },
          { x: 2705, y: 235, w: 175, tier: 2, cloudType: 'storm', stormOffset: 450 },
          { x: 2900, y: 285, w: 175, tier: 1, cloudType: 'normal' },
          { x: 3045, y: 335, w: 155, tier: 1, cloudType: 'normal' },

          // Wooden bridge step at the right end of Checkpoint Island 2 (x: 3100..3380)
          { x: 3325, y: 368, w: 110, tier: 1, isWoodenBridgeStep: true },

          // Section 3: From Checkpoint Island 2 (x: 3380) to Checkpoint Island 3 (x: 4140..4420) — kept intact
          { x: 3485, y: 330, w: 175, tier: 1, cloudType: 'normal' },
          { x: 3685, y: 275, w: 175, tier: 2, cloudType: 'moving', moveRange: 48, moveSpeed: 0.0024 },
          { x: 3890, y: 230, w: 175, tier: 3, cloudType: 'storm', stormOffset: 300 },
          { x: 4075, y: 305, w: 170, tier: 1, cloudType: 'normal' },

          // Wooden bridge step at the right end of Checkpoint Island 3 (x: 4140..4420)
          { x: 4365, y: 368, w: 110, tier: 1, isWoodenBridgeStep: true },

          // Section 4: «Громові пороги» (x: 4420..5920)
          // Every disappearing cloud (crumbling / fading) is followed by a normal cloud so the player can time jumps
          { x: 4605, y: 325, w: 140, tier: 1, cloudType: 'storm', stormCycleMs: 2200, stormOffset: 0 },
          { x: 4875, y: 270, w: 140, tier: 2, cloudType: 'crumbling' },
          { x: 5160, y: 220, w: 145, tier: 3, cloudType: 'normal' },
          { x: 5450, y: 265, w: 135, tier: 2, cloudType: 'fading', fadeOffset: 0 },
          { x: 5720, y: 315, w: 145, tier: 1, cloudType: 'normal' },

          // Wooden bridge step at the right end of Checkpoint Island 4 (x: 5920..6200)
          { x: 6145, y: 368, w: 110, tier: 1, isWoodenBridgeStep: true },

          // Section 5: «Вири» (x: 6200..7100)
          // One disappearing cloud followed by a normal solid cloud so the player can safely time their jump
          { x: 6390, y: 325, w: 135, tier: 1, cloudType: 'fading', fadeOffset: 900 },
          { x: 6655, y: 265, w: 140, tier: 2, cloudType: 'normal' },
          { x: 6915, y: 220, w: 135, tier: 3, cloudType: 'storm', stormCycleMs: 2200, stormOffset: 500 },

          // Boss Arena Floating Platforms on Tiers 2–3 (x: 7100..8400)
          { x: 7385, y: 300, w: 145, tier: 2, cloudType: 'normal', isArenaPlatform: true },
          { x: 7600, y: 215, w: 150, tier: 3, cloudType: 'normal', isArenaPlatform: true },
          { x: 7860, y: 215, w: 150, tier: 3, cloudType: 'normal', isArenaPlatform: true },
          { x: 8070, y: 300, w: 145, tier: 2, cloudType: 'normal', isArenaPlatform: true }
        ],
        // Pressurized Dnipro Water Geyser Traps erupting between cloud gaps (11 geysers, <= 12)
        geysers: [
          { x: 745, offsetMs: 0 },
          { x: 1145, offsetMs: 1200 },
          { x: 2190, offsetMs: 500 },
          { x: 2600, offsetMs: 1600 },
          { x: 3585, offsetMs: 800 },
          { x: 3985, offsetMs: 1400 },
          { x: 4740, offsetMs: 300 },
          { x: 5305, offsetMs: 1100 },
          { x: 5855, offsetMs: 1850 },
          { x: 6520, offsetMs: 650 },
          { x: 7045, offsetMs: 1500 }
        ],
        // Swirling Dnipro Whirlpools («Вири») between platforms that pull Omelko horizontally toward their center
        whirlpools: [
          { x: 5015, radius: 165, pullGround: 145, pullAir: 195 },
          { x: 5585, radius: 165, pullGround: 145, pullAir: 195 },
          { x: 6525, radius: 175, pullGround: 150, pullAir: 205 },
          { x: 6785, radius: 175, pullGround: 150, pullAir: 205 },
          { x: 7035, radius: 170, pullGround: 150, pullAir: 205 }
        ],
        // 4 Checkpoints across the 8400px river crossing
        checkpoints: [
          { id: 1, type: 'well', x: 1640, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_CHAYKA },
          { id: 2, type: 'pillar', x: 3240, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_KHORTYTSIA },
          { id: 3, type: 'well', x: 4280, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_THUNDER_RAPIDS },
          { id: 4, type: 'pillar', x: 6060, y: CONFIG.GROUND_Y, name: STRINGS.CHECKPOINT_WHIRLPOOL_ROCK }
        ],
        // 32 Enemies across Sections 1–5 (>= 30 required, all placed before bossArenaStartX = 7100)
        enemies: [
          // Section 1 (5 enemies): Rusalky leaping from the Dnipro water + Potercha + Vodyanyk on cloud
          { type: 'rusalka', x: 550, y: CONFIG.GROUND_Y + 4, minX: 430, maxX: 680 },
          { type: 'potercha', x: 750, y: 195, minX: 620, maxX: 900 },
          { type: 'rusalka', x: 950, y: CONFIG.GROUND_Y + 4, minX: 830, maxX: 1120 },
          { type: 'vodyanyk', x: 1245, y: 210, minX: 1185, maxX: 1305 },
          { type: 'rusalka', x: 1360, y: CONFIG.GROUND_Y + 4, minX: 1260, maxX: 1460 },

          // Section 2 (5 enemies): Deeper Dnipro Rapids — more Rusalky, Vodyanyky, and Poterchata
          { type: 'rusalka', x: 1995, y: CONFIG.GROUND_Y + 4, minX: 1870, maxX: 2130 },
          { type: 'vodyanyk', x: 2290, y: 190, minX: 2225, maxX: 2355 },
          { type: 'rusalka', x: 2400, y: CONFIG.GROUND_Y + 4, minX: 2280, maxX: 2560 },
          { type: 'potercha', x: 2600, y: 175, minX: 2460, maxX: 2780 },
          { type: 'rusalka', x: 2810, y: CONFIG.GROUND_Y + 4, minX: 2680, maxX: 2980 },

          // Section 3 (4 enemies): Rapids before Checkpoint 3
          { type: 'rusalka', x: 3585, y: CONFIG.GROUND_Y + 4, minX: 3460, maxX: 3740 },
          { type: 'potercha', x: 3790, y: 165, minX: 3650, maxX: 3940 },
          { type: 'vodyanyk', x: 4075, y: 265, minX: 4010, maxX: 4135 },
          { type: 'rusalka', x: 3985, y: CONFIG.GROUND_Y + 4, minX: 3860, maxX: 4090 },

          // Section 4: «Громові пороги» (9 enemies)
          { type: 'rusalka', x: 4510, y: CONFIG.GROUND_Y + 4, minX: 4430, maxX: 4680 },
          { type: 'potercha', x: 4740, y: 185, minX: 4580, maxX: 4920 },
          { type: 'rusalka', x: 4990, y: CONFIG.GROUND_Y + 4, minX: 4860, maxX: 5140 },
          { type: 'vodyanyk', x: 5160, y: 180, minX: 5105, maxX: 5215 },
          { type: 'potercha', x: 5305, y: 165, minX: 5140, maxX: 5470 },
          { type: 'rusalka', x: 5340, y: CONFIG.GROUND_Y + 4, minX: 5200, maxX: 5480 },
          { type: 'potercha', x: 5590, y: 195, minX: 5440, maxX: 5750 },
          { type: 'vodyanyk', x: 5720, y: 275, minX: 5665, maxX: 5775 },
          { type: 'rusalka', x: 5835, y: CONFIG.GROUND_Y + 4, minX: 5710, maxX: 5910 },

          // Section 5: «Вири» (9 enemies — dense Rusalky & Poterchata over whirlpool gaps)
          { type: 'rusalka', x: 6280, y: CONFIG.GROUND_Y + 4, minX: 6210, maxX: 6410 },
          { type: 'potercha', x: 6450, y: 190, minX: 6320, maxX: 6580 },
          { type: 'rusalka', x: 6525, y: CONFIG.GROUND_Y + 4, minX: 6410, maxX: 6640 },
          { type: 'potercha', x: 6655, y: 165, minX: 6530, maxX: 6780 },
          { type: 'rusalka', x: 6785, y: CONFIG.GROUND_Y + 4, minX: 6670, maxX: 6895 },
          { type: 'vodyanyk', x: 6915, y: 180, minX: 6865, maxX: 6965 },
          { type: 'potercha', x: 6835, y: 155, minX: 6710, maxX: 6960 },
          { type: 'rusalka', x: 7015, y: CONFIG.GROUND_Y + 4, minX: 6915, maxX: 7085 },
          { type: 'potercha', x: 7025, y: 175, minX: 6900, maxX: 7085 }
        ],
        bossArenaStartX: CONFIG.DNIPRO.BOSS_ARENA_START_X,
        bossSpawnX: CONFIG.DNIPRO.BOSS_SPAWN_X,
        catfishDockX: CONFIG.DNIPRO.CATFISH_CAGE_X
      };

      validateLevelReachability(data);
      return data;
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

          // Boss Arena «Соляна гора» (x: 6240..7500): spacious solid crystalline platforms on Tiers 1–2!
          { x: 6430, y: 324, w: 165, tier: 1, isCrystalPlatform: true, fragile: false },
          { x: 6655, y: 242, w: 165, tier: 2, isCrystalPlatform: true, fragile: false },
          { x: 6880, y: 324, w: 165, tier: 1, isCrystalPlatform: true, fragile: false },
          { x: 7075, y: 248, w: 160, tier: 2, isCrystalPlatform: true, fragile: false }
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
        bossSpawnX: 7060
      };
    }