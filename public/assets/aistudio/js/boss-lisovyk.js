
    /**
     * ============================================================================
     * 9C. BOSS OF ACT II («ЗЛИЙ ЛІС»): ПРАДАВНІЙ ЛІСОВИК «ЧОРНОБОР»
     * - Towering Master of the Evil Forest.
     * - Combines a strict 1-2 hit window with a Frontal Bark-Shield Stance:
     *   during Bark-Shield Stance (or frontal spam), Omelko MUST Roll [Shift] behind him!
     * - Moves: ROOT_CHARGE, CLAW_FLURRY, THORN_SLAM (root shockwaves), SUMMON_FOREST.
     * ============================================================================
     */
    class DarkLisovykBoss extends Enemy {
      constructor(scene, x, y) {
        super(scene, x, y, 'boss_lisovyk', CONFIG.ENEMY.BOSS_LISOVYK.MAX_STUN);
        this.sprite.body.setSize(72, 86);
        this.sprite.body.setOffset(12, 8);

        this.stage = 1; // 1 or 2
        this.active = false;
        this.facing = -1;
        this.sprite.setFlipX(true);

        this.state = 'IDLE'; // IDLE, COOLDOWN, TELEGRAPH, ROOT_CHARGE, CLAW_FLURRY, THORN_SLAM, SUMMON_FOREST
        this.nextMove = 'ROOT_CHARGE';
        this.moveCycle = 0;
        this.stateEndTime = 0;
        this.waitingForSlamLand = false;

        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = 2;
        this.barkShieldActive = false; // When true, frontal hits are 100% blocked — must roll behind!
        this.chainedChargeCount = 0;
        this.clawBurstStep = 0;
        this.nextClawBurstTime = 0;
        this.lastGuardNoticeTime = 0;
      }

      activate() {
        if (this.active) return;
        this.active = true;
        this.enterCooldownWindow(this.scene.time.now, 680);
        SFX.lisovykRoar();
      }

      enterCooldownWindow(time, durationMs) {
        this.state = 'COOLDOWN';
        this.isTelegraphing = false;
        this.telegraphLabel.setVisible(false);
        this.sprite.setAngle(0);
        this.sprite.clearTint();
        this.stateEndTime = time + durationMs;
        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = (this.stage === 2 && Math.random() < 0.5) ? 1 : Phaser.Math.Between(1, 2);
        // Every second cooldown window (or in Stage 2), Chornobor raises his frontal Bark Shield so Omelko must roll behind him!
        this.barkShieldActive = (this.moveCycle % 2 === 1) || (this.stage === 2 && Math.random() < 0.6);
      }

      startCounterAttack(time, targetX) {
        if (this.isStunned || this.isFinished) return;

        this.state = 'TELEGRAPH';
        this.isTelegraphing = true;
        this.telegraphLabel.setText('⚡!').setColor('#ff002b').setVisible(true);

        this.facing = targetX >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(this.facing < 0);
        this.sprite.setTint(0xd90429);
        this.sprite.setScale(1.25, 0.78);
        this.sprite.body.setVelocity(-this.facing * 115, -170);

        const dist = Math.abs(targetX - this.sprite.x);
        if (dist < 185) {
          this.nextMove = Math.random() < 0.7 ? 'CLAW_FLURRY' : 'THORN_SLAM';
        } else {
          this.nextMove = Math.random() < 0.65 ? 'ROOT_CHARGE' : 'THORN_SLAM';
        }

        const counterTelMs = CONFIG.ENEMY.BOSS_LISOVYK.COUNTER_TELEGRAPH_MS * (this.stage === 2 ? 0.84 : 1);
        this.stateEndTime = time + counterTelMs;
        SFX.lisovykRoar();

        if (time - this.lastGuardNoticeTime > 650) {
          this.lastGuardNoticeTime = time;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 70, '⚡ ГНІВ ЛІСОВИКА!', '#ff4d4d');
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.isFinished) return;

        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        const now = this.scene.time.now;
        const hitFromRight = fromX >= this.sprite.x;
        const isFrontalHit = (this.facing > 0 && hitFromRight) || (this.facing < 0 && !hitFromRight);

        // If Bark Shield is active and player attacks from the front, block 100% and prompt roll behind!
        if (this.barkShieldActive && isFrontalHit) {
          SFX.shieldBlock();
          this.scene.spawnHitParticles(this.sprite.x + this.facing * 26, this.sprite.y, 5);
          this.sprite.setScale(1.15, 0.9);
          if (now - this.lastGuardNoticeTime > 650) {
            this.lastGuardNoticeTime = now;
            this.scene.showFloatingText(this.sprite.x, this.sprite.y - 68, '🛡 Коровий щит! Перекотись за спину [Shift]!', '#00f5d4');
          }
          return;
        }

        const inOpenWindow = (this.state === 'COOLDOWN') && (this.hitsTakenInWindow < this.allowedWindowHits);

        if (inOpenWindow || !isFrontalHit) {
          this.hitsTakenInWindow++;
          const bonusMult = !isFrontalHit ? 1.25 : 1;
          this.stun = Math.min(this.maxStun, this.stun + Math.round(stunAmount * bonusMult));
          SFX.panHit(isHeavy || !isFrontalHit);

          if (!isFrontalHit) {
            this.scene.showFloatingText(this.sprite.x, this.sprite.y - 68, STRINGS.BACKSTAB_HIT, '#00f5d4');
          }

          this.scene.triggerHitStop(CONFIG.FEEL.HIT_STOP_MS);
          this.scene.cameras.main.shake(
            isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_DURATION : CONFIG.FEEL.SHAKE_LIGHT_DURATION,
            isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_INTENSITY : CONFIG.FEEL.SHAKE_LIGHT_INTENSITY
          );

          const dir = this.sprite.x >= fromX ? 1 : -1;
          this.sprite.body.setVelocity(dir * 90, -25);
          this.sprite.setScale(1.24, 0.82);
          this.sprite.setTintFill(0xffffff);
          this.scene.time.delayedCall(80, () => {
            if (this.sprite && this.sprite.active && !this.isTelegraphing) this.sprite.clearTint();
          });

          this.scene.spawnHitParticles(this.sprite.x, this.sprite.y);

          if (this.stun >= this.maxStun) {
            this.enterStunState();
            return;
          }

          if (this.hitsTakenInWindow >= this.allowedWindowHits) {
            this.startCounterAttack(now, fromX);
          }
        } else {
          // Deflected by ancient bark armor outside punish window
          const reducedStun = Math.max(3, Math.round(stunAmount * 0.18));
          this.stun = Math.min(this.maxStun, this.stun + reducedStun);
          SFX.shieldBlock();
          this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 4);
          if (now - this.lastGuardNoticeTime > 700) {
            this.lastGuardNoticeTime = now;
            this.scene.showFloatingText(this.sprite.x, this.sprite.y - 68, '🛡 Броня Пралісу! Заходь зі спини [Shift]!', '#ff9f1c');
          }
          if (this.stun >= this.maxStun) {
            this.enterStunState();
            return;
          }
          if (this.state === 'COOLDOWN') {
            this.startCounterAttack(now, fromX);
          }
        }
      }

      update(time, player) {
        if (!this.active || !this.updateBase(time)) return;

        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;
        const distToPlayer = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'COOLDOWN') {
          // Turn toward player with slight delay if player rolled behind him
          if (dirToPlayer !== this.facing) {
            if (!this.turnAroundAt) {
              this.turnAroundAt = time + 440;
            } else if (time >= this.turnAroundAt) {
              this.facing = dirToPlayer;
              this.sprite.setFlipX(this.facing < 0);
              this.turnAroundAt = 0;
            }
          } else {
            this.turnAroundAt = 0;
          }

          if (distToPlayer > 130 && dirToPlayer === this.facing) {
            const stalkSpeed = CONFIG.ENEMY.BOSS_LISOVYK.STALK_SPEED * (this.stage === 2 ? 1.25 : 1);
            this.sprite.body.setVelocityX(this.facing * stalkSpeed);
          } else {
            this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          }

          if (time >= this.stateEndTime) {
            const moves = distToPlayer < 170
              ? ['CLAW_FLURRY', 'THORN_SLAM', 'ROOT_CHARGE', 'SUMMON_FOREST']
              : ['ROOT_CHARGE', 'THORN_SLAM', 'CLAW_FLURRY', 'SUMMON_FOREST'];
            this.nextMove = moves[this.moveCycle % moves.length];
            this.moveCycle++;

            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            this.telegraphLabel.setText('!').setColor('#ff002b').setVisible(true);
            this.sprite.setTint(0x00f5d4);
            this.sprite.setScale(1.2, 0.82);
            const telMs = CONFIG.ENEMY.BOSS_LISOVYK.TELEGRAPH_MS * (this.stage === 2 ? 0.82 : 1);
            this.stateEndTime = time + telMs;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.82);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);

            if (this.nextMove === 'ROOT_CHARGE') {
              this.state = 'ROOT_CHARGE';
              this.chainedChargeCount = this.stage === 2 ? 1 : 0;
              this.sprite.setTint(0xd90429);
              this.stateEndTime = time + 650;
            } else if (this.nextMove === 'CLAW_FLURRY') {
              this.state = 'CLAW_FLURRY';
              this.clawBurstStep = 0;
              this.nextClawBurstTime = time;
              this.sprite.setTint(0xff002b);
              this.stateEndTime = time + (this.stage === 2 ? 720 : 540);
            } else if (this.nextMove === 'THORN_SLAM') {
              this.state = 'THORN_SLAM';
              this.waitingForSlamLand = false;
              const horizJumpVel = Phaser.Math.Clamp((player.sprite.x - this.sprite.x) * 1.2, -360, 360);
              this.sprite.body.setVelocity(horizJumpVel, CONFIG.ENEMY.BOSS_LISOVYK.JUMP_VEL_Y);
              this.timeOutJump = time + 1500;
              this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
            } else if (this.nextMove === 'SUMMON_FOREST') {
              this.state = 'SUMMON_FOREST';
              SFX.lisovykRoar();
              this.scene.showFloatingText(this.sprite.x, this.sprite.y - 65, STRINGS.BOSS_LISOVYK_SUMMON, '#00f5d4');
              this.scene.summonLisovykMinions(this.sprite.x, this.stage);
              this.enterCooldownWindow(time, CONFIG.ENEMY.BOSS_LISOVYK.COOLDOWN_MS * 0.78);
            }
          }
        } else if (this.state === 'ROOT_CHARGE') {
          const speed = CONFIG.ENEMY.BOSS_LISOVYK.CHARGE_SPEED * (this.stage === 2 ? 1.18 : 1);
          this.sprite.body.setVelocityX(this.facing * speed);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_LISOVYK.DAMAGE_CHARGE, this.sprite.x);
          }

          const arenaMinX = (this.scene.levelData ? this.scene.levelData.bossArenaStartX : 3880) + 65;
          const hitArenaWall = (this.facing < 0 && this.sprite.x < arenaMinX) ||
                               (this.facing > 0 && this.sprite.x > (this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 65);

          if (time >= this.stateEndTime || hitArenaWall) {
            if (this.chainedChargeCount > 0) {
              this.chainedChargeCount--;
              this.facing = dirToPlayer;
              this.sprite.setFlipX(this.facing < 0);
              this.sprite.setScale(1.24, 0.8);
              this.stateEndTime = time + 530;
              SFX.telegraph();
            } else {
              const cd = CONFIG.ENEMY.BOSS_LISOVYK.COOLDOWN_MS * (this.stage === 2 ? 0.72 : 1);
              this.enterCooldownWindow(time, cd);
            }
          }
        } else if (this.state === 'CLAW_FLURRY') {
          if (time >= this.nextClawBurstTime) {
            this.clawBurstStep++;
            this.nextClawBurstTime = time + 220;
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            const clawSpeed = CONFIG.ENEMY.BOSS_LISOVYK.CLAW_SPEED * (this.stage === 2 ? 1.16 : 1);
            this.sprite.body.setVelocityX(this.facing * clawSpeed);
            if (onFloor && this.clawBurstStep === 1) {
              this.sprite.body.setVelocityY(-240);
            }
            this.sprite.setScale(1.3, 0.78);
            SFX.swing(this.clawBurstStep, true);
          }

          this.sprite.setAngle(Math.sin(time * 0.045) * 12 * this.facing);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_LISOVYK.DAMAGE_CLAW, this.sprite.x);
          }

          if (time >= this.stateEndTime) {
            const cd = CONFIG.ENEMY.BOSS_LISOVYK.COOLDOWN_MS * (this.stage === 2 ? 0.7 : 0.9);
            this.enterCooldownWindow(time, cd);
          }
        } else if (this.state === 'THORN_SLAM') {
          if ((this.waitingForSlamLand && onFloor) || time > this.timeOutJump) {
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(1.35, 0.72);
            this.scene.cameras.main.shake(CONFIG.FEEL.SHAKE_HEAVY_DURATION, CONFIG.FEEL.SHAKE_HEAVY_INTENSITY);
            this.scene.spawnRootWaves(this.sprite.x, CONFIG.GROUND_Y - 14);
            const cd = CONFIG.ENEMY.BOSS_LISOVYK.COOLDOWN_MS * (this.stage === 2 ? 0.72 : 1);
            this.enterCooldownWindow(time, cd);
          }
        }
      }

      triggerFinisher(fromX) {
        if (this.stage === 1) {
          this.stage = 2;
          this.isStunned = false;
          this.stun = 0;
          this.barFill.setFillStyle(0xe63946);
          this.stunPrompt.setVisible(false);
          this.stars.forEach(s => s.setVisible(false));

          SFX.finisher();
          SFX.lisovykRoar();
          this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
          this.scene.cameras.main.shake(260, 0.016);
          this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 20);
          this.scene.spawnLoot(this.sprite.x, this.sprite.y);
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 70, STRINGS.BOSS_LISOVYK_STAGE_2, '#00f5d4');

          // Leap into Stage 2 Thorn Slam!
          this.state = 'THORN_SLAM';
          this.waitingForSlamLand = false;
          this.sprite.body.setVelocity(0, -540);
          this.timeOutJump = this.scene.time.now + 1400;
          this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
        } else {
          super.triggerFinisher(fromX);
          if (this.scene.enemyProjectiles) this.scene.enemyProjectiles.clear(true, true);
          if (this.scene.player) this.scene.player.invulnUntil = this.scene.time.now + 5000;
          this.scene.time.delayedCall(1200, () => {
            if (this.scene && this.scene.sys && this.scene.sys.isActive()) {
              this.scene.triggerVictory();
            }
          });
        }
      }
    }