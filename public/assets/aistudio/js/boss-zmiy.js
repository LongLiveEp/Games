    /**
     * ============================================================================
     * 9E. ACT IV FINAL BOSS: ТРИГОЛОВИЙ ЗМІЙ СОЛЯНОГОРИЧ (COMPOSITE BOSS)
     * ============================================================================
     * - SalyonohorychBoss manages the massive grandfatherly dragon body (drawn via
     *   layered Graphics without collisions on the right ~55% of the arena) and
     *   three independent ZmiyHead instances (extends Enemy, each with its own
     *   hitbox and Stun Bar).
     * - Phase 1 (Hungry Left Head): «Хапок» (ground lunge, gets stuck in crystal) &
     *   «Соляний град» (arc of shards with ground shadows). Finisher: «У БОЧКУ!».
     * - Phase 2 (Sleepy Middle Head): «Позіх» (slowing wave & mist with open mouth) &
     *   «Колискова» (fan of slow musical notes). Stunned by throwing a Swamp Frog [S]
     *   into the open mouth. Finisher: «ЗАСНУЛА!».
     * - Phase 3 (Proud Right Head): «Дзеркальні промені» (arena crystals light up in
     *   sequence and fire beams with telegraph) & «Блиск корони» (smooth golden glow,
     *   no strobe). Stunned by hitting the glowing crown. Finisher: «КОРОНУ ЗБИТО!».
     * - Phase 4 (All Three Enraged): Salt Mountain cracks, sky darkens. Heads attack
     *   in turn (~2s windows) + «Хвіст-коса», «Лавина», and «Крило-вихор» (pushes
     *   toward pink brine; uses lastSafePerch). A stunned head revives after ~9s
     *   unless all three heads are stunned simultaneously -> triggers Finale!
     */

    class ZmiyHead extends Enemy {
      constructor(scene, boss, headType, headIndex, x, y, texture) {
        super(scene, x, y, texture, CONFIG.ENEMY.BOSS_ZMIY.HEAD_MAX_STUN);
        this.boss = boss;
        this.headType = headType; // 'hungry' | 'sleepy' | 'proud'
        this.headIndex = headIndex;
        this.baseX = x;
        this.baseY = y;

        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setImmovable(true);
        this.sprite.setCollideWorldBounds(false);
        this.sprite.body.setSize(68, 62);
        this.sprite.body.setOffset(10, 10);
        this.sprite.setDepth(28);
        this.uiContainer.setDepth(48);

        // Phase-specific vulnerability states
        this.isStuckInCrystal = false;
        this.stuckUntil = 0;
        this.isMouthOpen = false;
        this.mouthOpenUntil = 0;
        this.isCrownGlowing = false;
        this.crownGlowUntil = 0;

        this.isPhase1To3Defeated = false;
        this.isPhase4Down = false;
        this.reviveEndTime = 0;
        this.lastHintTime = 0;

        // Smooth golden aura for the Proud head's crown (no strobe)
        this.crownAura = scene.add.circle(x, y - 34, 28, 0xffea00, 0)
          .setDepth(27)
          .setVisible(false);

        // Stuck salt crystal prop for the Hungry head
        this.stuckCrystalGraphic = scene.add.graphics().setDepth(29).setVisible(false);
        this.stuckCrystalGraphic.fillStyle(0xffe5ec, 0.95);
        this.stuckCrystalGraphic.fillTriangle(-18, 12, 0, -24, 18, 12);
        this.stuckCrystalGraphic.lineStyle(2, 0xffffff, 1);
        this.stuckCrystalGraphic.strokeTriangle(-18, 12, 0, -24, 18, 12);

        // Finisher prop (Barrel / Zzz / Knocked Crown)
        this.finisherProp = null;
        this.sleepText = scene.add.text(x, y - 48, 'Z-z-z...', {
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#e0aaff',
          stroke: '#10002b',
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(49).setVisible(false);

        // Phase 4 revive countdown label
        this.reviveTimerText = scene.add.text(x, y - 64, '', {
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#ffd166',
          backgroundColor: '#1d1e2ce0',
          padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setDepth(49).setVisible(false);
      }

      update(time, player) {
        // ZmiyHead visuals and state are updated by SalyonohorychBoss.update()
        void time;
        void player;
      }

      isHeadActiveInCurrentPhase() {
        if (!this.boss || !this.boss.active || this.boss.isDefeated) return false;
        if (this.boss.phase === 1) return this.headType === 'hungry';
        if (this.boss.phase === 2) return this.headType === 'sleepy';
        if (this.boss.phase === 3) return this.headType === 'proud';
        return this.boss.phase === 4;
      }

      enterStunState() {
        super.enterStunState();
        this.isStuckInCrystal = false;
        this.isMouthOpen = false;
        this.isCrownGlowing = false;
        this.stuckCrystalGraphic.setVisible(false);
        this.crownAura.setVisible(false);

        if (this.boss && this.boss.phase === 4) {
          // In Phase 4, a stunned head stays down for ~9s (REVIVE_MS) while waiting for the other heads to be stunned!
          this.stunEndTime = this.scene.time.now + CONFIG.ENEMY.BOSS_ZMIY.REVIVE_MS;
          this.isPhase4Down = true;
          this.reviveEndTime = this.stunEndTime;
          this.stunPrompt.setText('ОГЛУШЕНА!').setVisible(true);
          this.boss.checkAllHeadsDownInPhase4();
        } else {
          // Give player a generous 6.5s window in Phases 1–3 to land the Finisher blow
          this.stunEndTime = this.scene.time.now + 6500;
        }
      }

      recoverFromStun() {
        const wasPhase4 = this.boss && this.boss.phase === 4;
        super.recoverFromStun();
        this.isPhase4Down = false;
        this.reviveTimerText.setVisible(false);
        this.stunPrompt.setText(STRINGS.STUNNED_PROMPT);
        if (wasPhase4 && this.boss && !this.boss.isDefeated) {
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 55, STRINGS.BOSS_ZMIY_HEAD_REVIVED, '#ff9f1c');
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false, isCounterAttack = false, isSwampFrog = false) {
        if (!this.boss || !this.boss.active || this.boss.isDefeated || this.isFinished) return;
        if (!this.isHeadActiveInCurrentPhase()) return;

        // If already stunned in Phases 1–3, hitting triggers the phase Finisher!
        if (this.isStunned && this.boss.phase < 4) {
          this.triggerFinisher(fromX);
          return;
        }
        // In Phase 4, if already stunned/down, hitting it once more locks in its knockdown and checks if all 3 are down
        if ((this.isStunned || this.isPhase4Down) && this.boss.phase === 4) {
          this.boss.checkAllHeadsDownInPhase4();
          return;
        }

        const now = this.scene.time.now;
        let effectiveStun = stunAmount;

        if (this.headType === 'hungry') {
          if (this.isStuckInCrystal) {
            effectiveStun = isCounterAttack
              ? Math.ceil(this.maxStun * 0.85)
              : Math.ceil(stunAmount * 1.85);
            this.scene.showFloatingText(
              this.sprite.x,
              this.sprite.y - 58,
              isCounterAttack ? STRINGS.COUNTER_HIT_SABER : STRINGS.BOSS_ZMIY_HINT_STUCK,
              '#00f5d4'
            );
          } else if (this.boss.phase === 1) {
            effectiveStun = Math.max(8, Math.round(stunAmount * 0.35));
            if (now - this.lastHintTime > 900) {
              this.lastHintTime = now;
              this.scene.showFloatingText(this.sprite.x, this.sprite.y - 58, STRINGS.BOSS_ZMIY_HINT_WAIT_STUCK, '#ffd166');
            }
          }
        } else if (this.headType === 'sleepy') {
          if (this.isMouthOpen && isSwampFrog) {
            effectiveStun = Math.ceil(this.maxStun * 0.85);
            SFX.throwFrog();
            this.scene.showFloatingText(this.sprite.x, this.sprite.y - 58, STRINGS.BOSS_ZMIY_HINT_YAWN, '#80ed99');
          } else if (this.isMouthOpen) {
            effectiveStun = Math.ceil(stunAmount * 1.35);
          } else if (this.boss.phase === 2) {
            effectiveStun = Math.max(8, Math.round(stunAmount * 0.35));
            if (now - this.lastHintTime > 900) {
              this.lastHintTime = now;
              this.scene.showFloatingText(this.sprite.x, this.sprite.y - 58, STRINGS.BOSS_ZMIY_HINT_WAIT_YAWN, '#ffd166');
            }
          }
        } else if (this.headType === 'proud') {
          if (this.isCrownGlowing) {
            effectiveStun = Math.ceil(stunAmount * 1.9);
            if (SFX.crystalChime) SFX.crystalChime();
            this.scene.showFloatingText(this.sprite.x, this.sprite.y - 58, STRINGS.BOSS_ZMIY_HINT_CROWN, '#ffea00');
          } else if (this.boss.phase === 3) {
            effectiveStun = Math.max(8, Math.round(stunAmount * 0.35));
            if (now - this.lastHintTime > 900) {
              this.lastHintTime = now;
              this.scene.showFloatingText(this.sprite.x, this.sprite.y - 58, STRINGS.BOSS_ZMIY_HINT_WAIT_CROWN, '#ffd166');
            }
          }
        }

        this.stun = Math.min(this.maxStun, this.stun + effectiveStun);
        SFX.panHit(isHeavy || isCounterAttack);

        this.scene.triggerHitStop(CONFIG.FEEL.HIT_STOP_MS);
        this.scene.cameras.main.shake(
          isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_DURATION : CONFIG.FEEL.SHAKE_LIGHT_DURATION,
          isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_INTENSITY : CONFIG.FEEL.SHAKE_LIGHT_INTENSITY
        );

        this.sprite.setScale(1.22, 0.82);
        this.sprite.setTint(0xffccd5);
        this.scene.time.delayedCall(110, () => {
          if (this.sprite && this.sprite.active) {
            this.sprite.clearTint();
          }
        });

        this.scene.spawnHitParticles(this.sprite.x - 16, this.sprite.y, 7);

        if (this.stun >= this.maxStun) {
          this.enterStunState();
        }
      }

      triggerFinisher(fromX) {
        if (!this.boss || this.boss.isDefeated) return;

        SFX.finisher();
        this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
        this.scene.cameras.main.shake(220, 0.014);
        this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 16);
        this.scene.spawnLoot(this.sprite.x - 45, this.sprite.y);

        this.isStunned = false;
        this.stunPrompt.setVisible(false);
        this.stars.forEach(s => s.setVisible(false));
        this.isStuckInCrystal = false;
        this.isMouthOpen = false;
        this.isCrownGlowing = false;
        this.stuckCrystalGraphic.setVisible(false);
        this.crownAura.setVisible(false);

        if (this.boss.phase === 1 && this.headType === 'hungry') {
          // Phase 1 Finisher: «У БОЧКУ!»
          this.isPhase1To3Defeated = true;
          this.stun = this.maxStun;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 54, STRINGS.FINISHER_BARREL, '#ffea00');
          this.finisherProp = this.scene.add.image(this.sprite.x - 12, this.sprite.y + 6, 'prop_barrel')
            .setDepth(30)
            .setScale(1.18);
          this.boss.advanceToPhase(2);
        } else if (this.boss.phase === 2 && this.headType === 'sleepy') {
          // Phase 2 Finisher: «ЗАСНУЛА!»
          this.isPhase1To3Defeated = true;
          this.stun = this.maxStun;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 54, STRINGS.FINISHER_ASLEEP, '#e0aaff');
          this.sleepText.setPosition(this.sprite.x, this.sprite.y - 46).setVisible(true);
          this.boss.advanceToPhase(3);
        } else if (this.boss.phase === 3 && this.headType === 'proud') {
          // Phase 3 Finisher: «КОРОНУ ЗБИТО!»
          this.isPhase1To3Defeated = true;
          this.stun = this.maxStun;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 54, STRINGS.FINISHER_CROWN_OFF, '#ffd166');
          const crown = this.scene.add.Polygon
            ? this.scene.add.circle(this.sprite.x, this.sprite.y - 34, 14, 0xffd166).setDepth(35)
            : this.scene.add.image(this.sprite.x, this.sprite.y - 34, 'particle_star').setScale(2.2).setDepth(35);
          this.scene.tweens.add({
            targets: crown,
            x: this.sprite.x + 120,
            y: -40,
            angle: 540,
            duration: 850,
            onComplete: () => crown.destroy()
          });
          this.boss.advanceToPhase(4);
        } else if (this.boss.phase === 4) {
          this.isPhase4Down = true;
          this.stun = this.maxStun;
          this.reviveEndTime = this.scene.time.now + CONFIG.ENEMY.BOSS_ZMIY.REVIVE_MS;
          this.boss.checkAllHeadsDownInPhase4();
        }
      }

      wakeForPhase4() {
        this.isPhase1To3Defeated = false;
        this.isPhase4Down = false;
        this.isStunned = false;
        this.stun = 0;
        this.isStuckInCrystal = false;
        this.isMouthOpen = false;
        this.isCrownGlowing = false;
        this.stuckCrystalGraphic.setVisible(false);
        this.crownAura.setVisible(false);
        this.sleepText.setVisible(false);
        this.reviveTimerText.setVisible(false);
        this.stunPrompt.setText(STRINGS.STUNNED_PROMPT).setVisible(false);
        this.stars.forEach(s => s.setVisible(false));
        if (this.finisherProp) {
          this.finisherProp.destroy();
          this.finisherProp = null;
        }
        this.sprite.setPosition(this.baseX, this.baseY);
        this.sprite.setAngle(0);
        this.sprite.clearTint();
      }

      updateHeadVisuals(time) {
        const activeInPhase = this.isHeadActiveInCurrentPhase();
        this.uiContainer.setVisible(activeInPhase && !this.boss.isDefeated);

        // Position overhead UI and decrease classic red health bar
        this.uiContainer.setPosition(this.sprite.x, this.sprite.y - 48);
        const hpRatio = Phaser.Math.Clamp(1 - (this.stun / this.maxStun), 0, 1);
        this.barFill.width = 42 * hpRatio;

        // Smooth scale recovery
        this.sprite.scaleX = Phaser.Math.Linear(this.sprite.scaleX, 1, 0.16);
        this.sprite.scaleY = Phaser.Math.Linear(this.sprite.scaleY, 1, 0.16);

        // Expire temporary vulnerability windows
        if (this.isStuckInCrystal && time >= this.stuckUntil) {
          this.isStuckInCrystal = false;
          this.stuckCrystalGraphic.setVisible(false);
        }
        if (this.isMouthOpen && time >= this.mouthOpenUntil) {
          this.isMouthOpen = false;
          this.sprite.clearTint();
        }
        if (this.isCrownGlowing && time >= this.crownGlowUntil) {
          this.isCrownGlowing = false;
          this.crownAura.setVisible(false);
        }

        if (this.isStuckInCrystal) {
          this.stuckCrystalGraphic.setPosition(this.sprite.x - 24, this.sprite.y + 14).setVisible(true);
        }

        if (this.isCrownGlowing) {
          // Smooth breathing golden glow on the crown (no strobe!)
          const smoothAlpha = 0.35 + Math.sin(time * 0.006) * 0.2;
          const smoothScale = 1.05 + Math.sin(time * 0.006) * 0.14;
          this.crownAura
            .setPosition(this.sprite.x - 4, this.sprite.y - 30)
            .setAlpha(smoothAlpha)
            .setScale(smoothScale)
            .setVisible(true);
        }

        if (this.finisherProp && this.finisherProp.active) {
          this.finisherProp.setPosition(this.sprite.x - 14, this.sprite.y + 6);
        }
        if (this.sleepText.visible) {
          this.sleepText.setPosition(this.sprite.x, this.sprite.y - 46 + Math.sin(time * 0.004) * 5);
        }

        // Phase 4 Revive Countdown (~9s), or Phase 1-3 stun timeout recovery
        if (this.boss.phase === 4 && (this.isStunned || this.isPhase4Down) && !this.boss.isDefeated) {
          const remSec = Math.max(0, Math.ceil((this.reviveEndTime - time) / 1000));
          this.reviveTimerText
            .setPosition(this.sprite.x, this.sprite.y - 68)
            .setText(`⏳ Прокинеться: ${remSec}с`)
            .setVisible(true);

          if (time >= this.reviveEndTime) {
            this.recoverFromStun();
          }
        } else {
          this.reviveTimerText.setVisible(false);
          if (this.boss.phase < 4 && this.isStunned && !this.boss.isDefeated && time >= this.stunEndTime) {
            this.recoverFromStun();
          }
        }

        // Orbiting dizzy stars when stunned
        if (this.isStunned || this.isPhase4Down) {
          this.stars.forEach((star, idx) => {
            star.setVisible(true);
            const angle = (time * 0.007) + (idx * (Math.PI * 2 / 3));
            star.x = Math.cos(angle) * 18;
            star.y = -8 + Math.sin(angle) * 5;
          });
        }
      }
    }

    /**
     * COMPOSITE BOSS CONTROLLER: SalyonohorychBoss
     */
    class SalyonohorychBoss {
      constructor(scene, arenaStartX) {
        this.scene = scene;
        this.arenaStartX = arenaStartX;
        this.isCompositeZmiy = true;
        this.active = false;
        this.isFinished = false;
        this.isDefeated = false;
        this.phase = 1; // 1 = Hungry, 2 = Sleepy, 3 = Proud, 4 = All 3 Enraged
        this.stage = 1;

        // Anchor sprite (hidden, used for any generic boss.sprite position lookups)
        this.sprite = scene.add.rectangle(arenaStartX + 660, 230, 10, 10, 0x000000, 0);
        scene.physics.add.existing(this.sprite, true);
        this.sprite.body.enable = false;

        // Layered non-colliding Graphics for the giant grandfather dragon body & 3 sinuous necks
        // Occupies the right ~55% of the 960px arena (x: arenaStartX + 430 .. arenaStartX + 960, height ~45..440)
        this.bodyBackGraphics = scene.add.graphics().setDepth(19);
        this.necksGraphics = scene.add.graphics().setDepth(25);
        this.bodyFrontGraphics = scene.add.graphics().setDepth(26);
        this.effectsGraphics = scene.add.graphics().setDepth(32);

        // Create the 3 ZmiyHead (extends Enemy) objects
        this.leftHead = new ZmiyHead(
          scene,
          this,
          'hungry',
          0,
          arenaStartX + 545,
          318,
          'zmiy_head_hungry'
        );
        this.midHead = new ZmiyHead(
          scene,
          this,
          'sleepy',
          1,
          arenaStartX + 615,
          224,
          'zmiy_head_sleepy'
        );
        this.rightHead = new ZmiyHead(
          scene,
          this,
          'proud',
          2,
          arenaStartX + 680,
          144,
          'zmiy_head_proud'
        );

        this.heads = [this.leftHead, this.midHead, this.rightHead];
        this.maxStun = this.leftHead.maxStun * 3;
        this.stun = 0;

        // Combat state machine
        this.actionState = 'IDLE'; // IDLE, TELEGRAPH, EXECUTING, PHASE_PAUSE
        this.stateEndTime = 0;
        this.currentAttack = null;
        this.attackStep = 0;
        this.phase4HeadTurn = 0;
        this.turnAwayFactor = 0; // 0 = facing Omelko, 1 = turned away in offended grandfatherly dignity

        // Active arena hazards (ground shadows for hail/avalanche, mirror crystal beams, slowing mist, wing vortex)
        this.groundShadows = [];
        this.mirrorBeamState = null;
        this.mistCloud = null;
        this.vortexActiveUntil = 0;
        this.nextFrogSupplyTime = 0;

        this.drawStaticBodyLayers(0);
        this.drawDynamicNecks(0);
      }

      activate() {
        if (this.active) return;
        this.active = true;
        this.phase = 1;
        this.actionState = 'IDLE';
        this.stateEndTime = this.scene.time.now + 1300;
        this.nextFrogSupplyTime = this.scene.time.now + 9500;
        if (SFX.zmiyRoar) SFX.zmiyRoar();
        this.scene.cameras.main.shake(220, 0.01);
        this.scene.showFloatingText(
          this.arenaStartX + 480,
          115,
          STRINGS.BOSS_ZMIY_PHASE_1,
          '#ffd166'
        );
      }

      drawStaticBodyLayers(time) {
        const ax = this.arenaStartX;
        const gY = CONFIG.GROUND_Y;
        const breathe = Math.sin(time * 0.0025) * 4;
        const shiftX = this.turnAwayFactor * 26;

        this.bodyBackGraphics.clear();
        this.bodyFrontGraphics.clear();

        // 1. Giant Crystalline Dorsal Wing & Spine Crest (occupies right ~55% of screen, y: 48..410)
        this.bodyBackGraphics.fillStyle(0xd8e2dc, 0.94);
        this.bodyBackGraphics.fillTriangle(
          ax + 650 + shiftX, gY + 10,
          ax + 850 + shiftX, 56 + breathe,
          ax + 958, gY + 10
        );
        // Soft rose-pink sunset sheen on wing membrane
        this.bodyBackGraphics.fillStyle(0xffcad4, 0.65);
        this.bodyBackGraphics.fillTriangle(
          ax + 685 + shiftX, gY + 6,
          ax + 845 + shiftX, 82 + breathe,
          ax + 945, gY + 6
        );

        // Glowing rose-amethyst salt crystals along the giant spine ridge
        const spineCrystals = [
          { x: ax + 760 + shiftX, y: 155 + breathe, h: 42 },
          { x: ax + 805 + shiftX, y: 112 + breathe, h: 52 },
          { x: ax + 855 + shiftX, y: 86 + breathe, h: 58 },
          { x: ax + 900 + shiftX, y: 118 + breathe, h: 48 },
          { x: ax + 935 + shiftX, y: 165 + breathe, h: 40 }
        ];
        spineCrystals.forEach(c => {
          this.bodyBackGraphics.fillStyle(0xffafcc, 0.92);
          this.bodyBackGraphics.fillTriangle(c.x - 16, c.y + c.h, c.x, c.y, c.x + 18, c.y + c.h);
          this.bodyBackGraphics.fillStyle(0xffffff, 0.9);
          this.bodyBackGraphics.fillTriangle(c.x - 6, c.y + c.h, c.x + 2, c.y + 4, c.x + 10, c.y + c.h);
        });

        // 2. Massive Salt-Scaled Grandfatherly Body & Coiled Tail (white scales with pink highlight)
        this.bodyFrontGraphics.fillStyle(0xf8f9fa, 0.98);
        this.bodyFrontGraphics.fillEllipse(ax + 825 + shiftX, 285 + breathe, 290, 250);
        // Rose-gold belly plates & grandfatherly beard-like salt ruffs on chest
        this.bodyFrontGraphics.fillStyle(0xffe5ec, 0.96);
        this.bodyFrontGraphics.fillEllipse(ax + 765 + shiftX, 295 + breathe, 195, 210);

        // Layered scale arcs across the torso
        this.bodyFrontGraphics.lineStyle(2.5, 0xe5989b, 0.65);
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 4; col++) {
            const sx = ax + 725 + col * 42 + (row % 2) * 18 + shiftX;
            const sy = 205 + row * 38 + breathe;
            this.bodyFrontGraphics.strokeCircle(sx, sy, 16);
          }
        }

        // Coiled heavy salt-crystal tail resting near the brine at the bottom right
        this.bodyFrontGraphics.fillStyle(0xedf2f4, 0.98);
        this.bodyFrontGraphics.fillRoundedRect(ax + 680 + shiftX, gY - 46, 260, 52, 22);
        this.bodyFrontGraphics.fillStyle(0xffb3c6, 0.85);
        this.bodyFrontGraphics.fillTriangle(ax + 670 + shiftX, gY - 22, ax + 635 + shiftX, gY - 40, ax + 690 + shiftX, gY - 4);
      }

      drawDynamicNecks(time) {
        const ax = this.arenaStartX;
        const shiftX = this.turnAwayFactor * 26;
        this.necksGraphics.clear();

        const shoulders = [
          { sx: ax + 715 + shiftX, sy: 335 },
          { sx: ax + 735 + shiftX, sy: 255 },
          { sx: ax + 760 + shiftX, sy: 185 }
        ];

        this.heads.forEach((head, idx) => {
          const sh = shoulders[idx];
          const hx = head.sprite.x + 18;
          const hy = head.sprite.y + 6;
          const midX = (sh.sx + hx) * 0.5 + Math.sin(time * 0.003 + idx) * 10;
          const midY = (sh.sy + hy) * 0.5 + 18;

          // Outer white-pink salt neck
          this.necksGraphics.lineStyle(30, 0xf1faee, 1);
          this.necksGraphics.beginPath();
          this.necksGraphics.moveTo(sh.sx, sh.sy);
          this.necksGraphics.lineTo(midX, midY);
          this.necksGraphics.lineTo(hx, hy);
          this.necksGraphics.strokePath();

          // Rose inner scale highlight along the neck
          this.necksGraphics.lineStyle(12, 0xffcad4, 0.85);
          this.necksGraphics.beginPath();
          this.necksGraphics.moveTo(sh.sx, sh.sy + 4);
          this.necksGraphics.lineTo(midX, midY + 4);
          this.necksGraphics.lineTo(hx, hy + 4);
          this.necksGraphics.strokePath();

          // Small dorsal salt crystals along each neck
          this.necksGraphics.fillStyle(0xffafcc, 0.9);
          this.necksGraphics.fillTriangle(midX - 6, midY - 12, midX + 2, midY - 28, midX + 10, midY - 12);
        });
      }

      advanceToPhase(nextPhase) {
        if (this.isDefeated) return;
        this.phase = nextPhase;
        this.stage = nextPhase;
        this.actionState = 'PHASE_PAUSE';
        this.stateEndTime = this.scene.time.now + 1350;
        this.groundShadows = [];
        this.mirrorBeamState = null;
        this.effectsGraphics.clear();

        if (SFX.zmiyRoar) SFX.zmiyRoar();
        this.scene.cameras.main.shake(260, 0.015);

        const bannerText = nextPhase === 2
          ? STRINGS.BOSS_ZMIY_PHASE_2
          : (nextPhase === 3 ? STRINGS.BOSS_ZMIY_PHASE_3 : STRINGS.BOSS_ZMIY_PHASE_4);
        const bannerColor = nextPhase === 2 ? '#80ed99' : (nextPhase === 3 ? '#ffea00' : '#ff6b6b');

        this.scene.showFloatingText(this.arenaStartX + 480, 110, bannerText, bannerColor);

        if (nextPhase === 4) {
          // Phase 4: All three heads wake up enraged, Salt Mountain cracks, and the sky darkens!
          this.heads.forEach(h => h.wakeForPhase4());
          if (this.scene.triggerSaltMountainCracksAndDarkSky) {
            this.scene.triggerSaltMountainCracksAndDarkSky();
          }
        }
      }

      checkAllHeadsDownInPhase4() {
        if (this.phase !== 4 || this.isDefeated) return;
        const allDown = this.heads.every(h => h.isStunned || h.isPhase4Down);
        if (allDown) {
          this.triggerBossDefeatFinale();
        }
      }

      triggerBossDefeatFinale() {
        if (this.isDefeated) return;
        this.isDefeated = true;
        this.actionState = 'DEFEATED';
        this.groundShadows = [];
        this.mirrorBeamState = null;
        this.vortexActiveUntil = 0;
        this.effectsGraphics.clear();
        if (this.scene.enemyProjectiles) this.scene.enemyProjectiles.clear(true, true);
        if (this.scene.player) this.scene.player.invulnUntil = this.scene.time.now + 6000;

        SFX.finisher();
        if (SFX.zmiyRoar) SFX.zmiyRoar();
        this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
        this.scene.cameras.main.shake(300, 0.016);

        // All three heads droop down low & turn slightly away in offended grandfatherly dignity!
        this.heads.forEach((h, i) => {
          h.isStunned = false;
          h.isPhase4Down = false;
          h.reviveTimerText.setVisible(false);
          h.stunPrompt.setVisible(false);
          h.stars.forEach(s => s.setVisible(false));
          h.uiContainer.setVisible(false);
          h.sprite.setFlipX(true); // Turns away offended!
          this.scene.tweens.add({
            targets: h.sprite,
            x: h.baseX + 34,
            y: CONFIG.GROUND_Y - 52 - i * 24,
            angle: 14,
            duration: 650,
            ease: 'Sine.easeInOut'
          });
        });

        this.scene.tweens.add({
          targets: this,
          turnAwayFactor: 1,
          duration: 700,
          ease: 'Sine.easeInOut'
        });

        // Show Salyonohorych's offended grandfatherly quote!
        const quoteBox = this.scene.add.container(this.arenaStartX + 520, 175).setDepth(150);
        const qBg = this.scene.add.graphics();
        qBg.fillStyle(0xfefae0, 0.98);
        qBg.lineStyle(3, 0xb56576, 1);
        qBg.fillRoundedRect(-270, -44, 540, 88, 14);
        qBg.strokeRoundedRect(-270, -44, 540, 88, 14);
        const qTxt = this.scene.add.text(0, 0, STRINGS.BOSS_ZMIY_DEFEAT_QUOTE, {
          fontFamily: "'Cormorant Infant', Georgia, serif",
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#2b192e',
          align: 'center',
          lineSpacing: 4
        }).setOrigin(0.5);
        quoteBox.add([qBg, qTxt]);

        this.scene.time.delayedCall(2800, () => {
          if (quoteBox && quoteBox.active) quoteBox.destroy();
          this.isFinished = true;
          this.active = false;
          if (this.scene && this.scene.sys && this.scene.sys.isActive()) {
            this.scene.triggerVictory();
          }
        });
      }

      update(time, player) {
        this.drawStaticBodyLayers(time);
        this.drawDynamicNecks(time);

        if (!this.active) return;

        // Keep composite stun properties synced for HUD
        this.maxStun = this.heads.reduce((acc, h) => acc + h.maxStun, 0);
        this.stun = this.heads.reduce((acc, h) => acc + h.stun, 0);

        // Update each head's visual state & idle bobbing
        this.heads.forEach((h, idx) => {
          h.updateHeadVisuals(time);
          if (!this.isDefeated && !h.isStunned && !h.isPhase4Down && !h.isStuckInCrystal && this.actionState !== 'EXECUTING') {
            const targetX = h.baseX + Math.sin(time * 0.0028 + idx * 1.4) * 12;
            const targetY = h.baseY + (h.isPhase1To3Defeated ? 24 : Math.cos(time * 0.0034 + idx) * 10);
            h.sprite.x = Phaser.Math.Linear(h.sprite.x, targetX, 0.12);
            h.sprite.y = Phaser.Math.Linear(h.sprite.y, targetY, 0.12);
          }
        });

        if (this.isDefeated) return;

        // Periodically spawn Swamp Frog supplies on the salt sacks so player never runs out in Phase 2 / 4!
        if (time >= this.nextFrogSupplyTime && player.galushkas < 4) {
          this.nextFrogSupplyTime = time + 8500;
          const supplyX = this.arenaStartX + Phaser.Math.Between(110, 320);
          const item = this.scene.lootGroup.create(supplyX, CONFIG.GROUND_Y - 120, 'swamp_frog');
          item.lootType = 'galushka';
          item.body.setBounce(0.45);
          item.body.setDragX(180);
          this.scene.showFloatingText(supplyX, CONFIG.GROUND_Y - 145, '🐸 Болотні жаби на мішках солі!', '#80ed99');
        }

        // Update ongoing arena effects (ground shadows, mirror beams, wing vortex)
        this.updateArenaEffects(time, player);

        // Phase combat state machine
        if (this.actionState === 'PHASE_PAUSE') {
          if (time >= this.stateEndTime) {
            this.actionState = 'IDLE';
            this.stateEndTime = time + 600;
          }
          return;
        }

        // Pause attack selection if the active phase head is currently stunned or in its vulnerability window
        const activeHead = this.phase === 1
          ? this.leftHead
          : (this.phase === 2 ? this.midHead : (this.phase === 3 ? this.rightHead : null));

        if (activeHead && (activeHead.isStunned || activeHead.isStuckInCrystal || activeHead.isMouthOpen || activeHead.isCrownGlowing)) {
          return;
        }

        if (this.actionState === 'IDLE') {
          if (time >= this.stateEndTime) {
            this.startNextAttackTelegraph(time, player);
          }
        } else if (this.actionState === 'TELEGRAPH') {
          if (time >= this.stateEndTime) {
            this.executeCurrentAttack(time, player);
          }
        } else if (this.actionState === 'EXECUTING') {
          this.updateExecutingAttack(time, player);
        }
      }

      startNextAttackTelegraph(time, player) {
        this.attackStep++;
        const telMs = CONFIG.ENEMY.BOSS_ZMIY.TELEGRAPH_MS;

        if (this.phase === 1) {
          // Hungry Head alternates between «Хапок» (ground lunge into crystal) and «Соляний град» (hail with shadows)
          this.currentAttack = (this.attackStep % 2 === 1) ? 'HUNGRY_BITE' : 'SALT_HAIL';
          this.leftHead.telegraphLabel.setText('!').setColor('#ff4d4d').setVisible(true);
          this.leftHead.sprite.setTint(0xffbe0b);
          SFX.telegraph();
        } else if (this.phase === 2) {
          // Sleepy Head alternates between «Позіх» (slow wave + open mouth for frog) and «Колискова» (fan of notes)
          this.currentAttack = (this.attackStep % 2 === 1) ? 'SLEEPY_YAWN' : 'LULLABY_NOTES';
          this.midHead.telegraphLabel.setText('!').setColor('#e0aaff').setVisible(true);
          this.midHead.sprite.setTint(0xc77dff);
          if (SFX.lullabyNote) SFX.lullabyNote();
          else SFX.telegraph();
        } else if (this.phase === 3) {
          // Proud Head alternates between «Дзеркальні промені» (sequential crystal beams) and «Блиск корони» (crown glow)
          this.currentAttack = (this.attackStep % 2 === 1) ? 'MIRROR_BEAMS' : 'CROWN_SHINE';
          this.rightHead.telegraphLabel.setText('!').setColor('#ffea00').setVisible(true);
          this.rightHead.sprite.setTint(0xffea00);
          if (SFX.crystalChime) SFX.crystalChime();
          else SFX.telegraph();
        } else {
          // Phase 4: All 3 Enraged! Attacks cycle with ~2s windows across heads & 3 mountain/dragon specials
          const pool = ['TAIL_SCYTHE', 'AVALANCHE', 'WING_VORTEX', 'HUNGRY_BITE', 'SLEEPY_YAWN', 'CROWN_SHINE'];
          this.currentAttack = pool[this.attackStep % pool.length];
          SFX.telegraph();

          if (this.currentAttack === 'TAIL_SCYTHE') {
            this.scene.showFloatingText(player.sprite.x, CONFIG.GROUND_Y - 75, STRINGS.BOSS_ZMIY_TAIL_WARN, '#ff6b6b');
          } else if (this.currentAttack === 'AVALANCHE') {
            this.scene.showFloatingText(player.sprite.x, 120, STRINGS.BOSS_ZMIY_AVALANCHE_WARN, '#ffd166');
          } else if (this.currentAttack === 'WING_VORTEX') {
            this.scene.showFloatingText(player.sprite.x, 150, STRINGS.BOSS_ZMIY_VORTEX_WARN, '#90e0ef');
          }
        }

        // Pre-place ground shadows during telegraph for «Соляний град» and «Лавина»
        if (this.currentAttack === 'SALT_HAIL' || this.currentAttack === 'AVALANCHE') {
          this.groundShadows = [];
          const count = this.currentAttack === 'AVALANCHE' ? 5 : 4;
          for (let i = 0; i < count; i++) {
            const sx = this.arenaStartX + 95 + i * 115 + Phaser.Math.Between(-22, 22);
            this.groundShadows.push({
              x: sx,
              spawnAt: time + telMs,
              spawned: false,
              isBoulder: this.currentAttack === 'AVALANCHE'
            });
          }
        }

        this.actionState = 'TELEGRAPH';
        this.stateEndTime = time + telMs;
      }

      executeCurrentAttack(time, player) {
        this.heads.forEach(h => {
          h.telegraphLabel.setVisible(false);
          h.sprite.clearTint();
        });

        this.actionState = 'EXECUTING';

        if (this.currentAttack === 'HUNGRY_BITE') {
          // «Хапок»: Hungry head lunges low across the ground toward Omelko, then gets stuck in a salt crystal!
          const targetX = Phaser.Math.Clamp(player.sprite.x + 25, this.arenaStartX + 140, this.arenaStartX + 490);
          const targetY = CONFIG.GROUND_Y - 38;
          SFX.swing(3, false);

          this.scene.tweens.add({
            targets: this.leftHead.sprite,
            x: targetX,
            y: targetY,
            duration: 340,
            ease: 'Back.easeIn',
            onComplete: () => {
              if (this.isDefeated) return;
              // Check bite impact if player didn't jump/dodge
              if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                  this.leftHead.sprite.getBounds(),
                  player.sprite.getBounds()
                )
              ) {
                player.takeDamage(CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_BITE, this.leftHead.sprite.x);
              }
              // Head gets stuck in a salt crystal on the ground!
              this.leftHead.isStuckInCrystal = true;
              this.leftHead.stuckUntil = this.scene.time.now + CONFIG.ENEMY.BOSS_ZMIY.STUCK_DURATION_MS;
              this.scene.cameras.main.shake(120, 0.008);
              this.scene.showFloatingText(
                this.leftHead.sprite.x,
                this.leftHead.sprite.y - 54,
                STRINGS.BOSS_ZMIY_HINT_STUCK,
                '#00f5d4'
              );
              this.finishAttackCooldown(this.scene.time.now);
            }
          });
          this.stateEndTime = time + 600;
        } else if (this.currentAttack === 'SALT_HAIL') {
          // «Соляний град»: Arc of salt shards falling onto the telegraphed ground shadows
          this.groundShadows.forEach((sh, idx) => {
            this.scene.time.delayedCall(idx * 110, () => {
              if (this.isDefeated) return;
              const shard = this.scene.enemyProjectiles.create(sh.x + 90, 65, 'salt_shard');
              shard.body.setAllowGravity(true);
              shard.body.setVelocity(-125, -90);
              shard.isSpinning = true;
              shard.damageAmount = CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_HAIL;
            });
          });
          this. timeClearShadows = time + 1100;
          this.finishAttackCooldown(time + 500);
        } else if (this.currentAttack === 'SLEEPY_YAWN') {
          // «Позіх»: Sleepy head lowers slightly, opens mouth wide (vulnerable to Swamp Frog [S]!), and exhales slowing mist
          this.midHead.sprite.y = 285;
          this.midHead.isMouthOpen = true;
          this.midHead.mouthOpenUntil = time + CONFIG.ENEMY.BOSS_ZMIY.YAWN_OPEN_MS;
          this.midHead.sprite.setTint(0xe0aaff);
          this.scene.showFloatingText(
            this.midHead.sprite.x - 40,
            this.midHead.sprite.y - 56,
            STRINGS.BOSS_ZMIY_HINT_YAWN,
            '#80ed99'
          );

          // Spawn drifting lavender sleep-mist wave
          const mist = this.scene.add.ellipse(this.midHead.sprite.x - 50, 315, 190, 95, 0xc77dff, 0.36).setDepth(31);
          this.scene.tweens.add({
            targets: mist,
            x: this.arenaStartX + 160,
            scaleX: 1.45,
            alpha: 0,
            duration: 1650,
            onUpdate: () => {
              if (
                !this.isDefeated &&
                Math.abs(player.sprite.x - mist.x) < 95 &&
                Math.abs(player.sprite.y - mist.y) < 65
              ) {
                player.sprite.body.setVelocityX(player.sprite.body.velocity.x * 0.68);
              }
            },
            onComplete: () => mist.destroy()
          });
          this.finishAttackCooldown(time + 400);
        } else if (this.currentAttack === 'LULLABY_NOTES') {
          // «Колискова»: Fan of 4 slow melodic notes with generous dodge gaps
          const angles = [-0.42, -0.14, 0.14, 0.42];
          angles.forEach((ang, idx) => {
            this.scene.time.delayedCall(idx * 140, () => {
              if (this.isDefeated) return;
              if (SFX.lullabyNote) SFX.lullabyNote();
              const note = this.scene.enemyProjectiles.create(
                this.midHead.sprite.x - 30,
                this.midHead.sprite.y,
                'zmiy_note'
              );
              note.body.setAllowGravity(false);
              const speed = 185;
              note.body.setVelocity(-Math.cos(ang) * speed, Math.sin(ang) * speed);
              note.damageAmount = CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_LULLABY;
            });
          });
          this.finishAttackCooldown(time + 650);
        } else if (this.currentAttack === 'MIRROR_BEAMS') {
          // «Дзеркальні промені»: 3 crystal nodes light up sequentially with telegraph and fire a beam
          const beamXs = [this.arenaStartX + 150, this.arenaStartX + 295, this.arenaStartX + 440];
          this.mirrorBeamState = {
            beamXs,
            startTime: time,
            stepMs: 520,
            fired: [false, false, false]
          };
          this.stateEndTime = time + 1850;
        } else if (this.currentAttack === 'CROWN_SHINE') {
          // «Блиск корони»: Proud head descends to reachable height & its crown glows smoothly (no strobe!)
          this.scene.tweens.add({
            targets: this.rightHead.sprite,
            x: this.arenaStartX + 560,
            y: 255,
            duration: 380,
            ease: 'Sine.easeOut'
          });
          this.rightHead.isCrownGlowing = true;
          this.rightHead.crownGlowUntil = time + CONFIG.ENEMY.BOSS_ZMIY.CROWN_GLOW_MS;
          if (SFX.crystalChime) SFX.crystalChime();
          this.scene.showFloatingText(
            this.rightHead.sprite.x - 40,
            this.rightHead.sprite.y - 58,
            STRINGS.BOSS_ZMIY_HINT_CROWN,
            '#ffea00'
          );
          this.finishAttackCooldown(time + 450);
        } else if (this.currentAttack === 'TAIL_SCYTHE') {
          // Phase 4 «Хвіст-коса»: sweeping crystalline tail wave along the arena floor
          const scythe = this.scene.enemyProjectiles.create(
            this.arenaStartX + 660,
            CONFIG.GROUND_Y - 18,
            'tail_scythe_wave'
          );
          scythe.body.setAllowGravity(false);
          scythe.body.setVelocityX(-390);
          scythe.damageAmount = CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_TAIL;
          SFX.swing(3, true);
          this.finishAttackCooldown(time + CONFIG.ENEMY.BOSS_ZMIY.PHASE4_WINDOW_MS);
        } else if (this.currentAttack === 'AVALANCHE') {
          // Phase 4 «Лавина»: Salt boulders fall onto the telegraphed ground shadows
          this.groundShadows.forEach((sh, idx) => {
            this.scene.time.delayedCall(idx * 130, () => {
              if (this.isDefeated) return;
              const rock = this.scene.enemyProjectiles.create(sh.x, 30, 'salt_boulder');
              rock.body.setAllowGravity(true);
              rock.body.setVelocity(0, 60);
              rock.isSpinning = true;
              rock.damageAmount = CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_AVALANCHE;
            });
          });
          this.timeClearShadows = time + 1250;
          this.finishAttackCooldown(time + CONFIG.ENEMY.BOSS_ZMIY.PHASE4_WINDOW_MS);
        } else if (this.currentAttack === 'WING_VORTEX') {
          // Phase 4 «Крило-вихор»: Wing wind pushes Omelko toward the pink salt lake (uses lastSafePerch if pushed in!)
          if (SFX.windWhistle) SFX.windWhistle();
          this.vortexActiveUntil = time + 1650;
          this.finishAttackCooldown(time + CONFIG.ENEMY.BOSS_ZMIY.PHASE4_WINDOW_MS);
        }
      }

      updateExecutingAttack(time, player) {
        if (this.currentAttack === 'MIRROR_BEAMS' && this.mirrorBeamState) {
          const elapsed = time - this.mirrorBeamState.startTime;
          this.mirrorBeamState.beamXs.forEach((bx, idx) => {
            const fireAt = (idx + 1) * this.mirrorBeamState.stepMs;
            if (elapsed >= fireAt && !this.mirrorBeamState.fired[idx]) {
              this.mirrorBeamState.fired[idx] = true;
              if (SFX.crystalChime) SFX.crystalChime();
              if (Math.abs(player.sprite.x - bx) < 24) {
                player.takeDamage(CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_BEAM, bx);
              }
            }
          });

          if (time >= this.stateEndTime) {
            this.mirrorBeamState = null;
            this.effectsGraphics.clear();
            this.finishAttackCooldown(time);
          }
        } else if (time >= this.stateEndTime) {
          this.finishAttackCooldown(time);
        }
      }

      updateArenaEffects(time, player) {
        this.effectsGraphics.clear();

        // 1. Draw Ground Shadows for «Соляний град» & «Лавина»
        if (this.groundShadows && this.groundShadows.length > 0) {
          if (this.timeClearShadows && time >= this.timeClearShadows) {
            this.groundShadows = [];
          } else {
            this.groundShadows.forEach(sh => {
              const pulse = 1 + Math.sin(time * 0.015) * 0.15;
              this.effectsGraphics.fillStyle(0x2b192e, 0.65);
              this.effectsGraphics.fillEllipse(sh.x, CONFIG.GROUND_Y - 2, 46 * pulse, 12);
              this.effectsGraphics.lineStyle(2, 0xff6b6b, 0.8);
              this.effectsGraphics.strokeEllipse(sh.x, CONFIG.GROUND_Y - 2, 46 * pulse, 12);
            });
          }
        }

        // 2. Draw Sequential Crystal Mirror Beams («Дзеркальні промені»)
        if (this.mirrorBeamState) {
          const elapsed = time - this.mirrorBeamState.startTime;
          this.mirrorBeamState.beamXs.forEach((bx, idx) => {
            const warnStart = idx * 320;
            const fireAt = (idx + 1) * this.mirrorBeamState.stepMs;
            if (elapsed >= warnStart && elapsed < fireAt) {
              // Telegraph line from sky crystal to ground
              this.effectsGraphics.fillStyle(0xffea00, 0.85);
              this.effectsGraphics.fillCircle(bx, 72, 12);
              this.effectsGraphics.lineStyle(2, 0xffea00, 0.55);
              this.effectsGraphics.lineBetween(bx, 72, bx, CONFIG.GROUND_Y);
            } else if (elapsed >= fireAt && elapsed < fireAt + 240) {
              // Active crystalline laser beam
              this.effectsGraphics.fillStyle(0xffffff, 0.9);
              this.effectsGraphics.fillRect(bx - 12, 72, 24, CONFIG.GROUND_Y - 72);
              this.effectsGraphics.fillStyle(0xffea00, 0.55);
              this.effectsGraphics.fillRect(bx - 20, 72, 40, CONFIG.GROUND_Y - 72);
            }
          });
        }

        // 3. Apply «Крило-вихор» Wind Push toward the pink brine lake on the right
        if (time < this.vortexActiveUntil) {
          const push = CONFIG.ENEMY.BOSS_ZMIY.VORTEX_PUSH_SPEED;
          if (!player.isRolling) {
            player.sprite.x += push * 0.016;
          }
          // Draw wind stream lines across the arena
          this.effectsGraphics.lineStyle(2, 0xcaf0f8, 0.45);
          for (let wy = 130; wy <= 370; wy += 60) {
            const wx = this.arenaStartX + 120 + ((time * 0.6 + wy * 3) % 480);
            this.effectsGraphics.lineBetween(wx, wy, wx + 65, wy);
          }
        }
      }

      finishAttackCooldown(time) {
        this.actionState = 'IDLE';
        const baseCd = this.phase === 4
          ? CONFIG.ENEMY.BOSS_ZMIY.PHASE4_WINDOW_MS
          : CONFIG.ENEMY.BOSS_ZMIY.COOLDOWN_MS;
        this.stateEndTime = time + baseCd;
      }
    }
