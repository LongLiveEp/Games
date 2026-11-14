    /**
     * ============================================================================
     * 1. TOP-LEVEL CONFIGURATION & GAME FEEL CONSTANTS
     * ============================================================================
     */
    const CONFIG = {
      WIDTH: 960,
      HEIGHT: 540,
      WORLD_WIDTH: 4800,
      WORLD_HEIGHT: 540,
      HUT_GROUND_Y: 480,
      GROUND_Y: 405,             // Lower sky & wider bottom ground/underground section (135px tall)
      GRAVITY: 1350,

      // Player Movement & Platforming (Dead Cells style responsiveness)
      PLAYER: {
        SPEED: 290,
        ACCELERATION: 2200,
        DRAG: 2000,
        JUMP_VELOCITY: -530,
        DOUBLE_JUMP_VELOCITY: -470,
        JUMP_CUT_MULTIPLIER: 0.45, // Variable jump height multiplier on key release
        COYOTE_TIME_MS: 100,       // Grace period after leaving platform
        JUMP_BUFFER_MS: 120,       // Pre-land jump input buffer
        MAX_STAMINA: 100,          // "Сила" (Health/Stamina)
        INVULN_AFTER_HIT_MS: 900,

        // Roll / Dodge parameters
        ROLL_DURATION_MS: 350,
        ROLL_COOLDOWN_MS: 800,
        ROLL_SPEED: 490,
        COUNTER_WINDOW_MS: 650,    // Time after roll to trigger Counter-Attack

        // Combat (3-hit Frying Pan combo)
        COMBO_RESET_MS: 650,
        ATTACK_COOLDOWN_MS: 190,
        HIT_1_STUN: 30,
        HIT_2_STUN: 35,
        HIT_3_STUN: 60,            // 3rd combo hit is stronger
        COUNTER_BONUS_STUN: 30,    // Bonus stun after a roll
        ATTACK_RANGE_X: 68,
        ATTACK_RANGE_Y: 54,
        KNOCKBACK_X: 240,
        KNOCKBACK_Y: -150,

        // Ranged Galushka & Healing Uzvar
        START_GALUSHKAS: 5,
        MAX_GALUSHKAS: 10,
        GALUSHKA_SPEED_X: 540,
        GALUSHKA_SPEED_Y: -180,
        GALUSHKA_STUN: 55,
        UZVAR_CHARGES: 2,
        UZVAR_HEAL_AMOUNT: 45
      },

      // Camera Lookahead & Smoothing
      CAMERA: {
        LERP_X: 0.09,
        LERP_Y: 0.08,
        LOOKAHEAD_X: 115,
        LOOKAHEAD_LERP: 0.06,
        DEADZONE_W: 70,
        DEADZONE_H: 90
      },

      // Game Feel (Hit-stop, Shake, Squash & Stretch)
      FEEL: {
        HIT_STOP_MS: 65,
        FINISHER_HIT_STOP_MS: 110,
        SHAKE_LIGHT_DURATION: 90,
        SHAKE_LIGHT_INTENSITY: 0.005,
        SHAKE_HEAVY_DURATION: 180,
        SHAKE_HEAVY_INTENSITY: 0.012,
        JUMP_SQUASH_X: 0.78,
        JUMP_STRETCH_Y: 1.24,
        LAND_SQUASH_X: 1.26,
        LAND_STRETCH_Y: 0.76
      },

      // Non-lethal Enemy Stun & Telegraph settings
      ENEMY: {
        STUN_DURATION_MS: 4000,
        TELEGRAPH_MS: 500,
        GOOSE: {
          PATROL_SPEED: 95,
          CHARGE_SPEED: 295,
          JUMP_VELOCITY: -575,     // Upward wing-flap impulse to reach higher platforms
          JUMP_COOLDOWN_MS: 1150,
          AGGRO_RANGE: 350,
          ATTACK_RANGE: 220,
          MAX_STUN: 100,
          DAMAGE: 14,
          COOLDOWN_MS: 1100
        },
        LESHY: {
          WALK_SPEED: 120,         // Moves on the ground and in the underground catacombs
          AGGRO_RANGE: 450,
          HIDE_DISTANCE: 210,      // Dives underground when Omelko gets close on the surface
          SURFACE_JUMP_VEL: -620,  // Leaps back up from underground to the surface
          BURROW_COOLDOWN_MS: 2600,
          THROW_SPEED_X: 330,
          THROW_SPEED_Y: -290,
          MAX_STUN: 90,
          DAMAGE: 14,
          COOLDOWN_MS: 1700
        },
        CHICK: {
          SPEED: 190,
          MAX_STUN: 40,
          DAMAGE: 10,
          TELEGRAPH_MS: 400
        },
          BOSS_ROOSTER: {
          MAX_STUN: 250,
          STAGES_REQUIRED: 2,      // Must fill stun bar and perform finisher TWICE
          TELEGRAPH_MS: 420,
          COUNTER_TELEGRAPH_MS: 290,
          LUNGE_SPEED: 510,
          PECK_SPEED: 440,
          STALK_SPEED: 175,
          JUMP_VEL_Y: -650,
          SHOCKWAVE_SPEED: 370,
          DAMAGE_LUNGE: 20,
          DAMAGE_PECK: 18,
          DAMAGE_WAVE: 16,
          COOLDOWN_MS: 860
        },
        // ACT II: «ЗЛИЙ ЛІС» — UKRAINIAN FOREST MYTHOLOGY ENEMIES & BOSS
        SHIELD_GUARDIAN: {
          PATROL_SPEED: 88,
          ADVANCE_SPEED: 128,
          BASH_SPEED: 340,
          AGGRO_RANGE: 380,
          TURN_DELAY_MS: 470,      // Deliberate turn delay so player can Roll [Shift] behind his shield!
          TELEGRAPH_MS: 430,
          MAX_STUN: 135,
          DAMAGE_BASH: 20,
          COOLDOWN_MS: 980
        },
        NYAVKA: {
          FLOAT_SPEED: 145,
          SWOOP_SPEED: 390,
          AGGRO_RANGE: 420,
          TELEGRAPH_MS: 380,
          MAX_STUN: 95,
          DAMAGE: 17,
          WISP_SPEED: 310,
          COOLDOWN_MS: 1250
        },
        BOLOTYANYK: {
          WALK_SPEED: 75,
          AGGRO_RANGE: 460,
          SLAM_RANGE: 135,
          TELEGRAPH_MS: 460,
          THROW_SPEED_Y: -330,
          MAX_STUN: 150,
          DAMAGE_MIRE: 18,
          DAMAGE_SLAM: 22,
          DAMAGE: 18,
          COOLDOWN_MS: 1550
        },
        BOSS_LISOVYK: {
          MAX_STUN: 340,
          STAGES_REQUIRED: 2,
          TELEGRAPH_MS: 390,
          COUNTER_TELEGRAPH_MS: 270,
          CHARGE_SPEED: 545,
          CLAW_SPEED: 470,
          STALK_SPEED: 195,
          JUMP_VEL_Y: -670,
          ROOT_WAVE_SPEED: 405,
          DAMAGE_CHARGE: 24,
          DAMAGE_CLAW: 21,
          DAMAGE_WAVE: 19,
          DAMAGE_WISP: 17,
          COOLDOWN_MS: 820
        },
        // ACT III: «НА ДНІПРІ» — UKRAINIAN WATER MYTHOLOGY & CLOUD PLATFORMER
        RUSALKA: {
          SWIM_SPEED: 115,
          AGGRO_RANGE_X: 250,
          WARN_MS: 680,            // Clear water-bubble & siren warning before leaping!
          TELEGRAPH_MS: 680,
          LEAP_VEL_Y: -610,
          LEAP_SPEED_X: 165,
          GRAB_PULL_VEL_Y: 255,    // Pulls Omelko down toward the Dnipro water unless he dodges/breaks free
          PULL_SPEED_Y: 255,
          GRAB_DURATION_MS: 950,
          DAMAGE_GRAB: 16,
          DAMAGE: 16,
          MAX_STUN: 85,
          STUN_MS: 3100,
          COOLDOWN_MS: 2300
        },
        VODYANYK: {
          WALK_SPEED: 82,
          PATROL_SPEED: 82,
          AGGRO_RANGE: 450,
          TELEGRAPH_MS: 440,
          ORB_SPEED: 285,
          THROW_SPEED_Y: -250,
          MAX_STUN: 140,
          STUN_MS: 3300,
          DAMAGE_ORB: 18,
          DAMAGE_SPLASH: 21,
          DAMAGE: 18,
          COOLDOWN_MS: 1450
        },
        POTERCHA: {
          FLOAT_SPEED: 135,
          FLY_SPEED: 135,
          DASH_SPEED: 375,
          SWOOP_SPEED: 375,
          AGGRO_RANGE: 390,
          TELEGRAPH_MS: 390,
          MAX_STUN: 90,
          STUN_MS: 2900,
          DAMAGE: 16,
          COOLDOWN_MS: 1300
        },
        BOSS_VODYANYK_TSAR: {
          MAX_STUN: 350,
          STUN_MS: 3600,
          STAGES_REQUIRED: 3,
          PHASE_TRANSITION_INVULN_MS: 1500,
          ALLOWED_HITS_STAGE_1: 2,
          ALLOWED_HITS_STAGE_2: 2,
          ALLOWED_HITS_STAGE_3: 1,
          TELEGRAPH_MS: 410,
          COUNTER_TELEGRAPH_MS: 300,
          SURGE_SPEED: 525,
          STALK_SPEED: 185,
          JUMP_VEL_Y: -660,
          WAVE_SPEED: 395,
          TRIDENT_PROJ_SPEED: 390,
          THUNDER_WARN_MS: 1350,
          THUNDER_STRIKE_MS: 550,
          THUNDER_MIN_INTERVAL_MS: 2100,
          WHIRLPOOL_PULL_DURATION_MS: 2100,
          WHIRLPOOL_PULL_SPEED: 155,
          WHIRLPOOL_PULL_AIR_SPEED: 205,
          SUBMERGE_HIDE_MS: 850,
          SUBMERGE_LEAP_VEL_Y: -590,
          CALL_COOLDOWN_MS: 9500,
          CALL_MAX_MINIONS_STAGE_2: 1,
          CALL_MAX_MINIONS_STAGE_3: 2,
          RAIN_DROP_COUNT: 18,
          DAMAGE_SURGE: 22,
          DAMAGE_TRIDENT: 19,
          DAMAGE_WAVE: 18,
          DAMAGE_THUNDER: 19,
          DAMAGE_SUBMERGE: 21,
          COOLDOWN_MS: 900
        },
        // ACT IV: «ДИКЕ ПОЛЕ І ЧОРНЕ МОРЕ» — STEPPE & BLACK SEA COAST ENEMIES
        POLOVYK: {
          HIDDEN_ALPHA: 0.38,
          PATROL_SPEED: 105,
          WALK_SPEED: 105,
          CHASE_SPEED: 215,
          AMBUSH_RANGE: 210,
          AGGRO_RANGE: 380,
          TELEGRAPH_MS: 380,
          LEAP_VEL_Y: -540,
          LEAP_SPEED_Y: -540,
          LEAP_SPEED_X: 250,
          MAX_STUN: 115,
          DAMAGE: 17,
          COOLDOWN_MS: 1250
        },
        VOVKULAKA: {
          PATROL_SPEED: 135,
          STALK_SPEED: 225,
          POUNCE_SPEED_X: 460,
          POUNCE_VEL_Y: -420,
          POUNCE_SPEED_Y: -420,
          AGGRO_RANGE: 440,
          POUNCE_RANGE: 270,
          TELEGRAPH_MS: 450,       // ~0.45s telegraph before pouncing!
          MAX_STUN: 145,
          DAMAGE: 21,
          COOLDOWN_MS: 1150
        },
        TUMBLEWEED: {
          ROLL_SPEED: 185,
          GUST_BOOST_SPEED: 125,
          WIND_BOOST_SPEED: 125,
          BOUNCE_VEL_Y: -340,
          SPIN_SPEED: 7.5,
          KNOCK_FLY_SPEED_X: 520,
          KNOCK_FLY_VEL_Y: -420,
          MAX_STUN: 75,
          DAMAGE: 14,
          COOLDOWN_MS: 900
        },
        SEAGULL: {
          FLY_SPEED: 155,
          DIVE_SPEED: 395,
          AGGRO_RANGE: 410,
          TELEGRAPH_MS: 420,
          STEAL_COINS: 3,          // Steals up to 3 chervintsi on hit; returns them when stunned!
          MAX_STUN: 85,
          DAMAGE: 15,
          COOLDOWN_MS: 1500
        },
        BOSS_ZMIY: {
          STAGES_REQUIRED: 3,
          STAGE_1_MAX_STUN: 145,
          STAGE_2_MAX_STUN: 170,
          STAGE_3_MAX_STUN: 205,
          HEAD_MAX_STUN: 150,
          PHASE_TRANSITION_INVULN_MS: 1400,
          HITS_BEFORE_COUNTER_STAGE_1: 5,
          HITS_BEFORE_COUNTER_STAGE_2: 4,
          HITS_BEFORE_COUNTER_STAGE_3: 3,
          TELEGRAPH_MS: 620,
          STAGE_3_TELEGRAPH_MS: 560,
          COOLDOWN_STAGE_1_MS: 1350,
          COOLDOWN_STAGE_2_MS: 1020,
          COOLDOWN_STAGE_3_MS: 800,
          COOLDOWN_MS: 1100,
          DAMAGE_BITE: 18,
          DAMAGE_HAIL: 16,
          DAMAGE_YAWN: 16,
          DAMAGE_LULLABY: 16,
          DAMAGE_BEAM: 19,
          DAMAGE_CROWN: 20,
          DAMAGE_TAIL: 20,
          DAMAGE_AVALANCHE: 21,
          DAMAGE_VORTEX: 16,
          PILLAR_WARN_MS: 920,
          PILLAR_STRIKE_MS: 520,
          STUCK_DURATION_MS: 2500,
          YAWN_OPEN_MS: 2600,
          CROWN_GLOW_MS: 2500,
          PHASE4_WINDOW_MS: 2000,
          REVIVE_MS: 9000,
          CRYSTAL_CRACK_MS: 1150,
          CRYSTAL_RESPAWN_MS: 2600,
          VORTEX_PUSH_SPEED: 190
        }
      },

      // ACT III («НА ДНІПРІ»): EXTENDED RAPIDS, CLOUDS, WHIRLPOOLS & REACHABILITY CONSTANTS
      DNIPRO: {
        WORLD_WIDTH: 8400,
        BOSS_ARENA_START_X: 7100,
        BOSS_ARENA_WIDTH: 1300,
        LEFT_RAFT_START_X: 7120,
        LEFT_RAFT_END_X: 7310,
        BOSS_DECK_START_X: 7470,
        BOSS_DECK_END_X: 7990,
        BOSS_DECK_WIDTH: 520,
        RIGHT_RAFT_START_X: 8140,
        RIGHT_RAFT_END_X: 8340,
        BOSS_SPAWN_X: 7850,
        CATFISH_CAGE_X: 8245,
        INTRO_PAN_CAGE_MS: 1200,
        INTRO_PAN_BOSS_MS: 850,
        INTRO_EMERGE_MS: 700,
        INTRO_LETTERBOX_H: 48,
        STORM_CYCLE_MS: 2800,
        STORM_RAPIDS_CYCLE_MS: 2200,
        STORM_WARN_RATIO: 0.60,
        STORM_STRIKE_RATIO: 0.84,
        STORM_DAMAGE: 18,
        CRUMBLING_SHAKE_MS: 600,
        CRUMBLING_FALL_DURATION_MS: 340,
        CRUMBLING_RESPAWN_MS: 4000,
        FADING_CYCLE_MS: 4200,
        FADING_VISIBLE_MS: 2100,
        FADING_WARN_MS: 800,
        WHIRLPOOL_RADIUS_X: 170,
        WHIRLPOOL_PULL_GROUND: 145,
        WHIRLPOOL_PULL_AIR: 195,
        GEYSER_PERIOD_MS: 2500,
        GEYSER_JET_HEIGHT: 165,
        GEYSER_DAMAGE: 15,
        MAX_DOUBLE_JUMP_DIST: 370,
        MAX_DOUBLE_JUMP_HEIGHT: 185,
        SAFE_DIST_RATIO: 0.85,
        SAFE_HEIGHT_RATIO: 0.80
      },

      // ACT IV («ДИКЕ ПОЛЕ І ЧОРНЕ МОРЕ»): WORLD, WIND & COASTAL WAVE CONSTANTS
      STEPPE: {
        WORLD_WIDTH: 7500,
        COAST_START_X: 4650,
        SEA_HORIZON_START_X: 3600,
        BOSS_ARENA_START_X: 6240,
        FEATHER_GRASS_COUNT_BACK: 95,
        FEATHER_GRASS_COUNT_FRONT: 115,
        FOREGROUND_BLADES_COUNT: 85,
        PARTICLE_COUNT: 26,
        SEAGULL_AMBIENT_COUNT: 6,
        STAR_COUNT: 48
      },
      WIND: {
        INTERVAL_MIN_MS: 6000,
        GUST_INTERVAL_MIN_MS: 6000,
        INTERVAL_MAX_MS: 9000,
        GUST_INTERVAL_MAX_MS: 9000,
        TELEGRAPH_MS: 1400,
        GUST_DURATION_MS: 2200,
        GROUND_PUSH_FORCE: 125,    // Horizontal push velocity applied on ground
        GROUND_PUSH_X: 125,
        AIR_PUSH_FORCE: 245,       // Stronger horizontal push when Omelko is airborne
        AIR_PUSH_X: 245,
        GRASS_SWAY_NORMAL: 6,
        GRASS_SWAY_TELEGRAPH: 13,
        GRASS_SWAY_GUST: 22
      },
      WAVES: {
        CYCLE_MS: 4800,
        PERIOD_MS: 4800,
        WARN_MS: 1150,
        TELEGRAPH_MS: 1150,
        FLOOD_MS: 1450,
        FLOOD_DURATION_MS: 1450,
        SURGE_HEIGHT: 26,
        DAMAGE: 16,
        KNOCK_VEL_Y: -360,
        KNOCKBACK_Y: -360
      },
      FINALE: {
        WALK_IN_DURATION_MS: 1250,
        MODAL_READY_DELAY_MS: 260,
        FLIGHT_DURATION_MS: 27000,
        FLIGHT_ZMIY_X: 640,
        FLIGHT_MIN_Y: 88,
        FLIGHT_MAX_Y: 285,
        FLIGHT_MOVE_SPEED_Y: 215,
        FLIGHT_COIN_COUNT: 18,
        FLIGHT_COIN_SPEED_X: 195,
        FLIGHT_COIN_PICKUP_RADIUS: 44,
        ARRIVAL_LAND_DURATION_MS: 1500,
        SNEEZE_PAUSE_MS: 1650,
        LAUGH_DURATION_MS: 2600,
        CREDITS_SCROLL_SPEED: 38,
        CREDITS_START_Y: 500,
        CREDITS_END_Y: -640,
        POST_CREDITS_FADE_MS: 1200
      }
    };