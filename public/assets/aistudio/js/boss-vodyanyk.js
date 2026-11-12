
    /**
     * ============================================================================
     * 9J. BOSS 3: VODYANYK TSAR OF THE DNIPRO RAPIDS ("ВОДЯНИЙ ЦАР ДНІПРОВИХ ПОРОГІВ")
     * Guards the final Dnipro pier where the Giant River Catfish ("Річковий Сом") waits!
     * ============================================================================
     */
    class VodyanykTsarBoss extends Enemy {
      constructor(scene, x, y) {
        super(scene, x, y, 'boss_vodyanyk_tsar', CONFIG.ENEMY.BOSS_VODYANYK_TSAR.MAX_STUN, CONFIG.ENEMY.BOSS_VODYANYK_TSAR.STUN_MS);
        this.stage = 1;
        this.active = false;
        this.state = 'COOLDOWN';
        this.stateEndTime = 0;
        this.moveCycle = 0;
        this.facing = -1;
        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = 2;
        this.lastGuardNoticeTime = 0;
        this.sprite.body.setSize(62, 74);
        this.sprite.body.setOffset(7, 8);
      }

      activate() {
        if (this.active) return;
        this.active = true;
        this.enterCooldownWindow(this.scene.time.now, 900);
        SFX.waterSplash();
      }

      enterCooldownWindow(now, durationMs) {
        this.state = 'COOLDOWN';
        this.isTelegraphing = false;
        this.telegraphLabel.setVisible(false);
        this.sprite.clearTint();
        this.sprite.setAngle(0);
        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = this.stage === 2 ? 1 : 2;
        this.stateEndTime = now + durationMs;
      }

      startCounterAttack(now, fromX) {
        if (this.isStunned || this.isFinished) return;
        this.facing = fromX >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(this.facing < 0);
        this.nextMove = (Math.abs(fromX - this.sprite.x) < 165) ? 'TIDAL_SLAM' : 'TRIDENT_SURGE';
        this.state = 'TELEGRAPH';
        this.isTelegraphing = true;
        this.telegraphLabel.setText('🌊!').setColor('#00f5d4').setVisible(true);
        this.sprite.setTint(0x00f5d4);
        this.sprite.setScale(1.22, 0.84);
        this.stateEndTime = now + 340;
        SFX.telegraph();
        if (now - this.lastGuardNoticeTime > 650) {
          this.lastGuardNoticeTime = now;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 65, STRINGS.BOSS_COUNTER_WARN, '#48cae4');
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.isFinished) return;
        if (!this.active) this.activate();

        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        const now = this.scene.time.now;
        const inOpenWindow = (this.state === 'COOLDOWN') && (this.hitsTakenInWindow < this.allowedWindowHits);

        if (inOpenWindow) {
          this.hitsTakenInWindow++;
          this.stun = Math.min(this.maxStun, this.stun + stunAmount);
          SFX.panHit(isHeavy);
          this.scene.triggerHitStop(CONFIG.FEEL.HIT_STOP_MS);
          this.scene.cameras.main.shake(
            isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_DURATION : CONFIG.FEEL.SHAKE_LIGHT_DURATION,
            isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_INTENSITY : CONFIG.FEEL.SHAKE_LIGHT_INTENSITY
          );
          const dir = this.sprite.x >= fromX ? 1 : -1;
          this.sprite.body.setVelocity(dir * 85, -25);
          this.sprite.setScale(1.22, 0.84);
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
          const reduced = Math.max(4, Math.round(stunAmount * 0.22));
          this.stun = Math.min(this.maxStun, this.stun + reduced);
          SFX.shieldBlock();
          this.scene.spawnWaterSplash(this.sprite.x, this.sprite.y, 5);
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

        // Keep boss on the final pier (4160..4760)
        const minPierX = (this.scene.levelData ? this.scene.levelData.bossArenaStartX : 4160) + 45;
        const maxPierX = (this.scene.worldWidth || 4800) - 90;
        if (this.sprite.x < minPierX) this.sprite.x = minPierX;
        if (this.sprite.x > maxPierX) this.sprite.x = maxPierX;

        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;
        const distToPlayer = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'COOLDOWN') {
          this.facing = dirToPlayer;
          this.sprite.setFlipX(this.facing < 0);
          if (distToPlayer > 140) {
            this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.BOSS_VODYANYK_TSAR.STALK_SPEED);
          } else {
            this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          }

          if (time >= this.stateEndTime) {
            const moves = ['TRIDENT_SURGE', 'TIDAL_SLAM', 'WHIRLPOOL_VOLLEY'];
            this.nextMove = moves[this.moveCycle % moves.length];
            this.moveCycle++;
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.telegraphLabel.setText('🌊!').setColor('#00f5d4').setVisible(true);
            this.sprite.setTint(0x48cae4);
            this.sprite.setScale(1.2, 0.82);
            const telMs = CONFIG.ENEMY.BOSS_VODYANYK_TSAR.TELEGRAPH_MS * (this.stage === 2 ? 0.82 : 1);
            this.stateEndTime = time + telMs;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);

            if (this.nextMove === 'TRIDENT_SURGE') {
              this.state = 'TRIDENT_SURGE';
              this.sprite.setTint(0x00b4d8);
              this.stateEndTime = time + 560;
              SFX.waterSplash();
            } else if (this.nextMove === 'TIDAL_SLAM') {
              this.state = 'TIDAL_SLAM';
              this.waitingForSlamLand = false;
              const jumpVx = Phaser.Math.Clamp((player.sprite.x - this.sprite.x) * 1.15, -310, 310);
              this.sprite.body.setVelocity(jumpVx, CONFIG.ENEMY.BOSS_VODYANYK_TSAR.JUMP_VEL_Y);
              this.timeOutJump = time + 1450;
              this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
            } else {
              this.state = 'WHIRLPOOL_VOLLEY';
              this.scene.spawnWaterOrb(this.sprite.x, this.sprite.y - 16, player.sprite.x, player.sprite.y - 12);
              if (this.stage === 2) {
                this.scene.time.delayedCall(220, () => {
                  if (this.sprite && this.sprite.active && !this.isStunned) {
                    this.scene.spawnWaterOrb(this.sprite.x, this.sprite.y - 24, player.sprite.x, player.sprite.y - 24);
                  }
                });
              }
              this.enterCooldownWindow(time, CONFIG.ENEMY.BOSS_VODYANYK_TSAR.COOLDOWN_MS * 0.85);
            }
          }
        } else if (this.state === 'TRIDENT_SURGE') {
          const speed = CONFIG.ENEMY.BOSS_VODYANYK_TSAR.SURGE_SPEED * (this.stage === 2 ? 1.18 : 1);
          this.sprite.body.setVelocityX(this.facing * speed);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_VODYANYK_TSAR.DAMAGE_SURGE, this.sprite.x);
          }
          if (time >= this.stateEndTime || this.sprite.x <= minPierX + 10 || this.sprite.x >= maxPierX - 10) {
            this.enterCooldownWindow(time, CONFIG.ENEMY.BOSS_VODYANYK_TSAR.COOLDOWN_MS * (this.stage === 2 ? 0.75 : 1));
          }
        } else if (this.state === 'TIDAL_SLAM') {
          if ((this.waitingForSlamLand && onFloor) || time > this.timeOutJump) {
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(1.34, 0.72);
            SFX.waterSplash();
            this.scene.cameras.main.shake(CONFIG.FEEL.SHAKE_HEAVY_DURATION, CONFIG.FEEL.SHAKE_HEAVY_INTENSITY);
            this.scene.spawnTidalWaves(this.sprite.x, CONFIG.GROUND_Y - 14);
            this.enterCooldownWindow(time, CONFIG.ENEMY.BOSS_VODYANYK_TSAR.COOLDOWN_MS * (this.stage === 2 ? 0.74 : 1));
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
          SFX.waterSplash();
          this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
          this.scene.cameras.main.shake(260, 0.016);
          this.scene.spawnWaterSplash(this.sprite.x, this.sprite.y, 16);
          this.scene.spawnLoot(this.sprite.x, this.sprite.y);
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 70, STRINGS.BOSS_VODYANYK_STAGE_2, '#00f5d4');

          this.state = 'TIDAL_SLAM';
          this.waitingForSlamLand = false;
          this.sprite.body.setVelocity(0, -520);
          this.timeOutJump = this.scene.time.now + 1400;
          this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
        } else {
          super.triggerFinisher(fromX);
          this.scene.time.delayedCall(1100, () => {
            this.scene.triggerVictory();
          });
        }
      }
    }