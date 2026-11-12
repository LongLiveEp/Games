
    /**
     * ============================================================================
     * 9. BOSS CLASS: MAD ROOSTER ("СКАЖЕНИЙ ПІВЕНЬ КОРНІЙ")
     * 3 Phases/Moves (Lunge, Jump + Ground Shockwave, Summon Chicks).
     * Stun bar must be filled and finished TWICE.
     * ============================================================================
     */
    class MadRoosterBoss extends Enemy {
      constructor(scene, x, y) {
        super(scene, x, y, 'boss_rooster', CONFIG.ENEMY.BOSS_ROOSTER.MAX_STUN);
        this.sprite.body.setSize(68, 82);
        this.sprite.body.setOffset(11, 8);

        this.stage = 1; // 1 or 2 (2 finishers required)
        this.active = false;
        this.state = 'IDLE'; // IDLE, TELEGRAPH, LUNGE, PECK_FLURRY, JUMP_SLAM, SUMMON, COOLDOWN
        this.nextMove = 'LUNGE';
        this.moveCycle = 0;
        this.stateEndTime = 0;
        this.lungeDir = -1;
        this.waitingForSlamLand = false;

        // Anti-spam 1-2 hit window & aggressive counter-attack tracking
        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = 2;
        this.isCounterTelegraph = false;
        this.chainedLungeCount = 0;
        this.peckBurstStep = 0;
        this.nextPeckBurstTime = 0;
        this.lastGuardNoticeTime = 0;
      }

      activate() {
        if (this.active) return;
        this.active = true;
        this.enterCooldownWindow(this.scene.time.now, 650);
        SFX.roosterCrow();
      }

      enterCooldownWindow(time, durationMs) {
        this.state = 'COOLDOWN';
        this.isTelegraphing = false;
        this.isCounterTelegraph = false;
        this.telegraphLabel.setVisible(false);
        this.sprite.setAngle(0);
        this.sprite.clearTint();
        this.stateEndTime = time + durationMs;
        this.hitsTakenInWindow = 0;
        // Give the player a balanced window for strictly 1 or 2 hits before the Rooster retaliates!
        this.allowedWindowHits = (this.stage === 2 && Math.random() < 0.45) ? 1 : Phaser.Math.Between(1, 2);
      }

      startCounterAttack(time, targetX) {
        if (this.isStunned || this.isFinished) return;

        this.state = 'TELEGRAPH';
        this.isTelegraphing = true;
        this.isCounterTelegraph = true;
        this.telegraphLabel.setText('⚡!').setVisible(true);

        this.lungeDir = targetX >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(this.lungeDir < 0);
        this.sprite.setTint(0xff3b00);
        this.sprite.setScale(1.24, 0.78);

        // Slight furious wing-hop back/up as he prepares to strike back
        this.sprite.body.setVelocity(-this.lungeDir * 110, -160);

        const dist = Math.abs(targetX - this.sprite.x);
        if (dist < 175) {
          this.nextMove = Math.random() < 0.68 ? 'PECK_FLURRY' : 'JUMP_SLAM';
        } else {
          this.nextMove = Math.random() < 0.65 ? 'LUNGE' : 'JUMP_SLAM';
        }

        const counterTelMs = CONFIG.ENEMY.BOSS_ROOSTER.COUNTER_TELEGRAPH_MS * (this.stage === 2 ? 0.85 : 1);
        this.stateEndTime = time + counterTelMs;
        SFX.telegraph();

        if (time - this.lastGuardNoticeTime > 650) {
          this.lastGuardNoticeTime = time;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 68, '⚡ КОНТРАТАКА ПІВНЯ!', '#ffbe0b');
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.isFinished) return;

        // If ALREADY stunned, hitting triggers the Comical Non-Lethal Finisher!
        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        const now = this.scene.time.now;
        const inOpenWindow = (this.state === 'COOLDOWN') && (this.hitsTakenInWindow < this.allowedWindowHits);

        if (inOpenWindow) {
          // Clean hit inside the 1-2 hit punish window!
          this.hitsTakenInWindow++;
          this.stun = Math.min(this.maxStun, this.stun + stunAmount);
          SFX.panHit(isHeavy);

          this.scene.triggerHitStop(CONFIG.FEEL.HIT_STOP_MS);
          this.scene.cameras.main.shake(
            isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_DURATION : CONFIG.FEEL.SHAKE_LIGHT_DURATION,
            isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_INTENSITY : CONFIG.FEEL.SHAKE_LIGHT_INTENSITY
          );

          // Heavy boss poise: slight pushback without launching him high into the air
          const dir = this.sprite.x >= fromX ? 1 : -1;
          this.sprite.body.setVelocity(dir * 95, -25);
          this.sprite.setScale(1.24, 0.82);
          this.sprite.setTintFill(0xffffff);
          this.scene.time.delayedCall(80, () => {
            if (this.sprite && this.sprite.active && !this.isTelegraphing) {
              this.sprite.clearTint();
            }
          });

          this.scene.spawnHitParticles(this.sprite.x, this.sprite.y);

          if (this.stun >= this.maxStun) {
            this.enterStunState();
            return;
          }

          // Once the player lands 1-2 hits, the Rooster immediately retaliates!
          if (this.hitsTakenInWindow >= this.allowedWindowHits) {
            this.startCounterAttack(now, fromX);
          }
        } else {
          // Boss is actively attacking/telegraphing or player exceeded the 1-2 hit window:
          // Wing-Guard deflects 80% of the stun and prevents stun-locking!
          const reducedStun = Math.max(3, Math.round(stunAmount * 0.2));
          this.stun = Math.min(this.maxStun, this.stun + reducedStun);
          SFX.panHit(false);
          this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 4);
          this.sprite.setScale(1.12, 0.9);

          if (now - this.lastGuardNoticeTime > 700) {
            this.lastGuardNoticeTime = now;
            this.scene.showFloatingText(this.sprite.x, this.sprite.y - 65, '🛡 Крилатий блок!', '#ff9f1c');
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
          // Actively stalk toward the player if they try to keep distance, instead of standing still
          if (distToPlayer > 125) {
            const stalkSpeed = CONFIG.ENEMY.BOSS_ROOSTER.STALK_SPEED * (this.stage === 2 ? 1.25 : 1);
            this.sprite.body.setVelocityX(dirToPlayer * stalkSpeed);
            this.sprite.setFlipX(dirToPlayer < 0);
          } else {
            this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
            this.sprite.setFlipX(dirToPlayer < 0);
          }

          if (time >= this.stateEndTime) {
            // Dynamic move selection based on distance and cycle
            const moves = distToPlayer < 160
              ? ['PECK_FLURRY', 'JUMP_SLAM', 'LUNGE', 'SUMMON']
              : ['LUNGE', 'JUMP_SLAM', 'PECK_FLURRY', 'SUMMON'];
            this.nextMove = moves[this.moveCycle % moves.length];
            this.moveCycle++;

            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.isCounterTelegraph = false;
            this.telegraphLabel.setText('!').setVisible(true);
            this.lungeDir = dirToPlayer;
            this.sprite.setFlipX(this.lungeDir < 0);
            this.sprite.setTint(0xffbe0b);
            this.sprite.setScale(1.18, 0.82);
            const telMs = CONFIG.ENEMY.BOSS_ROOSTER.TELEGRAPH_MS * (this.stage === 2 ? 0.82 : 1);
            this.stateEndTime = time + telMs;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.82);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.lungeDir = dirToPlayer;
            this.sprite.setFlipX(this.lungeDir < 0);

            if (this.nextMove === 'LUNGE') {
              this.state = 'LUNGE';
              this.chainedLungeCount = (this.stage === 2 || this.isCounterTelegraph) ? 1 : 0;
              this.sprite.setTint(0xff4d4d);
              this.stateEndTime = time + 640;
            } else if (this.nextMove === 'PECK_FLURRY') {
              this.state = 'PECK_FLURRY';
              this.peckBurstStep = 0;
              this.nextPeckBurstTime = time;
              this.sprite.setTint(0xff2a2a);
              this.stateEndTime = time + (this.stage === 2 ? 680 : 500);
            } else if (this.nextMove === 'JUMP_SLAM') {
              this.state = 'JUMP_SLAM';
              this.waitingForSlamLand = false;
              const horizJumpVel = Phaser.Math.Clamp((player.sprite.x - this.sprite.x) * 1.15, -340, 340);
              this.sprite.body.setVelocity(horizJumpVel, CONFIG.ENEMY.BOSS_ROOSTER.JUMP_VEL_Y);
              this.timeOutJump = time + 1500;
              this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
            } else if (this.nextMove === 'SUMMON') {
              this.state = 'SUMMON';
              SFX.roosterCrow();
              this.scene.showFloatingText(this.sprite.x, this.sprite.y - 60, STRINGS.BOSS_SUMMON, '#ffd166');
              this.scene.summonBossChicks(this.sprite.x, this.stage);
              this.enterCooldownWindow(time, CONFIG.ENEMY.BOSS_ROOSTER.COOLDOWN_MS * 0.75);
            }
          }
        } else if (this.state === 'LUNGE') {
          const speed = CONFIG.ENEMY.BOSS_ROOSTER.LUNGE_SPEED * (this.stage === 2 ? 1.18 : 1);
          this.sprite.body.setVelocityX(this.lungeDir * speed);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_ROOSTER.DAMAGE_LUNGE, this.sprite.x);
          }

          const hitArenaWall = (this.lungeDir < 0 && this.sprite.x < LEVEL_1_DATA.bossArenaStartX + 65) ||
                               (this.lungeDir > 0 && this.sprite.x > (this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 65);

          if (time >= this.stateEndTime || hitArenaWall) {
            if (this.chainedLungeCount > 0) {
              // Aggressive turnaround second lunge!
              this.chainedLungeCount--;
              this.lungeDir = dirToPlayer;
              this.sprite.setFlipX(this.lungeDir < 0);
              this.sprite.setScale(1.22, 0.8);
              this.stateEndTime = time + 520;
              SFX.telegraph();
            } else {
              const cd = CONFIG.ENEMY.BOSS_ROOSTER.COOLDOWN_MS * (this.stage === 2 ? 0.72 : 1);
              this.enterCooldownWindow(time, cd);
            }
          }
        } else if (this.state === 'PECK_FLURRY') {
          // Furious close-range peck & wing-spur combo rush
          if (time >= this.nextPeckBurstTime) {
            this.peckBurstStep++;
            this.nextPeckBurstTime = time + 230;
            this.lungeDir = dirToPlayer;
            this.sprite.setFlipX(this.lungeDir < 0);
            const peckSpeed = CONFIG.ENEMY.BOSS_ROOSTER.PECK_SPEED * (this.stage === 2 ? 1.16 : 1);
            this.sprite.body.setVelocityX(this.lungeDir * peckSpeed);
            if (onFloor && this.peckBurstStep === 1) {
              this.sprite.body.setVelocityY(-230);
            }
            this.sprite.setScale(1.28, 0.78);
            SFX.swing(this.peckBurstStep);
          }

          this.sprite.setAngle(Math.sin(time * 0.04) * 12 * this.lungeDir);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_ROOSTER.DAMAGE_PECK, this.sprite.x);
          }

          if (time >= this.stateEndTime) {
            const cd = CONFIG.ENEMY.BOSS_ROOSTER.COOLDOWN_MS * (this.stage === 2 ? 0.7 : 0.9);
            this.enterCooldownWindow(time, cd);
          }
        } else if (this.state === 'JUMP_SLAM') {
          if ((this.waitingForSlamLand && onFloor) || time > this.timeOutJump) {
            // Landed! Create left & right shockwaves
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(1.32, 0.72);
            this.scene.cameras.main.shake(CONFIG.FEEL.SHAKE_HEAVY_DURATION, CONFIG.FEEL.SHAKE_HEAVY_INTENSITY);
            this.scene.spawnShockwaves(this.sprite.x, CONFIG.GROUND_Y - 14);
            const cd = CONFIG.ENEMY.BOSS_ROOSTER.COOLDOWN_MS * (this.stage === 2 ? 0.72 : 1);
            this.enterCooldownWindow(time, cd);
          }
        }
      }

      triggerFinisher(fromX) {
        if (this.stage === 1) {
          // First Finisher completed -> Transition to Stage 2!
          this.stage = 2;
          this.isStunned = false;
          this.stun = 0;
          this.barFill.setFillStyle(0xe63946);
          this.stunPrompt.setVisible(false);
          this.stars.forEach(s => s.setVisible(false));

          SFX.finisher();
          SFX.roosterCrow();
          this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
          this.scene.cameras.main.shake(240, 0.015);
          this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 18);
          this.scene.spawnLoot(this.sprite.x, this.sprite.y);
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 65, STRINGS.BOSS_STAGE_2, '#ff4d4d');

          // Immediately leap into Stage 2 Jump Slam so player cannot stand still!
          this.state = 'JUMP_SLAM';
          this.waitingForSlamLand = false;
          this.sprite.body.setVelocity(0, -520);
          this.timeOutJump = this.scene.time.now + 1400;
          this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
        } else {
          // Second Finisher completed -> Boss Pacified in a Giant Barrel & Victory!
          super.triggerFinisher(fromX);
          this.scene.time.delayedCall(1200, () => {
            this.scene.triggerVictory();
          });
        }
      }
    }