
    /**
     * ============================================================================
     * 9J. BOSS 3: VODYANYK TSAR OF THE DNIPRO RAPIDS ("ВОДЯНИЙ ЦАР ДНІПРОВИХ ПОРОГІВ")
     * Guards the final Dnipro pier where the Giant River Catfish ("Річковий Сом") waits!
     * ============================================================================
     */
    class VodyanykTsarBoss extends Enemy {
      constructor(scene, x, y) {
        const cfg = CONFIG.ENEMY.BOSS_VODYANYK_TSAR;
        super(scene, x, y, 'boss_vodyanyk_tsar', cfg.MAX_STUN, cfg.STUN_MS);
        this.stage = 1;
        this.stagesRequired = cfg.STAGES_REQUIRED || 3;
        this.active = false;
        this.state = 'COOLDOWN';
        this.stateEndTime = 0;
        this.lastMove = null;
        this.nextMove = null;
        this.facing = -1;
        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = cfg.ALLOWED_HITS_STAGE_1 || 2;
        this.lastGuardNoticeTime = 0;
        this.invulnUntil = 0;
        this.lastLightningTime = -5000;
        this.lastCallTime = -9000;
        this.summonedMinions = [];
        this.activeThunderStrike = null;
        this.pullVortexGraphic = null;
        this.submergeBubbles = [];
        this.rainDrops = [];
        this.lastFrameTime = 0;

        // 150x150 texture hitbox aligned to the Tsar's body & feet on the deck
        this.sprite.body.setSize(72, 108);
        this.sprite.body.setOffset(39, 32);
      }

      getDeckBounds() {
        const minX = (CONFIG.DNIPRO ? CONFIG.DNIPRO.BOSS_DECK_START_X : 7470) + 38;
        const maxX = (CONFIG.DNIPRO ? CONFIG.DNIPRO.BOSS_DECK_END_X : 7990) - 38;
        return { minX, maxX, centerX: (minX + maxX) / 2 };
      }

      activate() {
        if (this.active) return;
        this.active = true;
        this.enterCooldownWindow(this.scene.time.now, 950);
        SFX.waterSplash();
      }

      getAllowedHitsForStage() {
        const cfg = CONFIG.ENEMY.BOSS_VODYANYK_TSAR;
        if (this.stage >= 3) return cfg.ALLOWED_HITS_STAGE_3 || 1;
        if (this.stage === 2) return cfg.ALLOWED_HITS_STAGE_2 || 2;
        return cfg.ALLOWED_HITS_STAGE_1 || 2;
      }

      enterCooldownWindow(now, durationMs) {
        this.state = 'COOLDOWN';
        this.isTelegraphing = false;
        this.telegraphLabel.setVisible(false);
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
        this.sprite.clearTint();
        this.sprite.setAngle(0);
        this.sprite.setScale(1, 1);
        if (this.sprite.body) {
          this.sprite.body.enable = true;
        }
        if (this.pullVortexGraphic) {
          this.pullVortexGraphic.setVisible(false);
        }
        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = this.getAllowedHitsForStage();
        this.stateEndTime = now + durationMs;
      }

      startCounterAttack(now, fromX) {
        if (this.isStunned || this.isFinished) return;
        const cfg = CONFIG.ENEMY.BOSS_VODYANYK_TSAR;
        this.facing = fromX >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(this.facing < 0);
        const candidates = Math.abs(fromX - this.sprite.x) < 175
          ? ['TIDAL_SLAM', 'TRIDENT_SURGE']
          : ['TRIDENT_SURGE', 'TRIDENT_THROW'];
        this.nextMove = (candidates[0] === this.lastMove) ? candidates[1] : candidates[0];
        this.lastMove = this.nextMove;
        this.state = 'TELEGRAPH';
        this.isTelegraphing = true;
        this.telegraphLabel.setText('🌊!').setColor('#00f5d4').setVisible(true);
        this.sprite.setTint(0x00f5d4);
        this.sprite.setScale(1.16, 0.88);
        this.stateEndTime = now + (cfg.COUNTER_TELEGRAPH_MS || 300);
        SFX.telegraph();
        if (now - this.lastGuardNoticeTime > 650) {
          this.lastGuardNoticeTime = now;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 78, STRINGS.BOSS_COUNTER_WARN, '#48cae4');
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.isFinished || this.state === 'SUBMERGE_DASH') return;
        if (!this.active) this.activate();

        const now = this.scene.time.now;
        if (now < this.invulnUntil) {
          SFX.shieldBlock();
          this.scene.spawnWaterSplash(this.sprite.x, this.sprite.y - 10, 4);
          return;
        }

        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

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
          this.sprite.setScale(1.16, 0.88);
          this.sprite.setTintFill(0xffffff);
          this.scene.time.delayedCall(80, () => {
            if (this.sprite && this.sprite.active && !this.isTelegraphing) {
              this.sprite.clearTint();
              this.sprite.setScale(1, 1);
            }
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

      pickNextMove(time, distToPlayer) {
        const cfg = CONFIG.ENEMY.BOSS_VODYANYK_TSAR;
        const pool = ['TRIDENT_SURGE', 'TIDAL_SLAM', 'WHIRLPOOL_VOLLEY'];

        if (this.stage === 1) {
          pool.push('TRIDENT_THROW');
        } else {
          pool.push('TRIDENT_FAN');
          if (time - this.lastLightningTime >= (cfg.THUNDER_MIN_INTERVAL_MS || 2100)) {
            pool.push('THUNDER_CLOUDS');
          }
          pool.push('WHIRLPOOL_PULL');

          // Check active summoned minions for CALL_OF_DEPTHS
          this.summonedMinions = this.summonedMinions.filter(m => m && !m.isFinished && m.sprite && m.sprite.active);
          const maxMinions = this.stage >= 3 ? (cfg.CALL_MAX_MINIONS_STAGE_3 || 2) : (cfg.CALL_MAX_MINIONS_STAGE_2 || 1);
          if (this.summonedMinions.length < maxMinions && time - this.lastCallTime >= (cfg.CALL_COOLDOWN_MS || 9500)) {
            pool.push('CALL_OF_DEPTHS');
          }
        }

        if (this.stage >= 3) {
          pool.push('SUBMERGE_DASH');
        }

        const filtered = pool.filter(m => m !== this.lastMove);
        const candidates = filtered.length > 0 ? filtered : pool;

        // Weighted tactical preference based on distance
        if (distToPlayer > 260 && candidates.includes('TRIDENT_FAN')) {
          this.nextMove = 'TRIDENT_FAN';
        } else if (distToPlayer > 260 && candidates.includes('TRIDENT_THROW')) {
          this.nextMove = 'TRIDENT_THROW';
        } else {
          const idx = Math.floor(Math.random() * candidates.length);
          this.nextMove = candidates[idx];
        }
        this.lastMove = this.nextMove;
      }

      spawnThunderCloudAttack(time, targetX) {
        const cfg = CONFIG.ENEMY.BOSS_VODYANYK_TSAR;
        this.lastLightningTime = time;
        const arenaMin = (this.scene.levelData ? this.scene.levelData.bossArenaStartX : 7100) + 70;
        const arenaMax = (this.scene.worldWidth || 8400) - 70;
        const strikeX = Phaser.Math.Clamp(targetX, arenaMin, arenaMax);
        const cloudY = 82;

        if (this.activeThunderStrike) {
          this.cleanupThunderStrike();
        }

        const cloudImg = this.scene.add.image(strikeX, cloudY, 'platform_cloud_storm')
          .setScale(2.1, 1.6)
          .setDepth(42)
          .setAlpha(0.92);
        const warnGlow = this.scene.add.ellipse(strikeX, CONFIG.GROUND_Y - 6, 86, 18, 0xffea00, 0.25)
          .setDepth(24);
        const beamGraphic = this.scene.add.graphics().setDepth(41).setVisible(false);

        this.activeThunderStrike = {
          x: strikeX,
          cloudY,
          startTime: time,
          warnMs: cfg.THUNDER_WARN_MS || 1350,
          strikeMs: cfg.THUNDER_STRIKE_MS || 550,
          hasStruck: false,
          hasDamaged: false,
          cloudImg,
          warnGlow,
          beamGraphic
        };
        this.scene.showFloatingText(strikeX, cloudY + 34, STRINGS.BOSS_VODYANYK_THUNDER_WARN, '#ffea00');
      }

      updateThunderStrike(time, player) {
        if (!this.activeThunderStrike) return;
        const ts = this.activeThunderStrike;
        const elapsed = time - ts.startTime;

        if (elapsed < ts.warnMs) {
          // Smooth sinusoidal pulse (zero strobe!)
          const progress = elapsed / ts.warnMs;
          const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 4);
          ts.warnGlow.setAlpha(0.2 + 0.45 * pulse).setScale(0.9 + 0.2 * pulse, 1);
          ts.cloudImg.setTint(pulse > 0.55 ? 0xffea00 : 0x90e0ef);
        } else if (elapsed < ts.warnMs + ts.strikeMs) {
          if (!ts.hasStruck) {
            ts.hasStruck = true;
            SFX.lightningZap();
            this.scene.cameras.main.shake(160, 0.01);
          }
          const strikeProgress = (elapsed - ts.warnMs) / ts.strikeMs;
          const alpha = Math.sin(strikeProgress * Math.PI);
          ts.beamGraphic.clear().setVisible(true);
          ts.beamGraphic.fillStyle(0x90e0ef, 0.35 * alpha);
          ts.beamGraphic.fillRect(ts.x - 24, ts.cloudY + 12, 48, CONFIG.GROUND_Y - ts.cloudY);
          ts.beamGraphic.fillStyle(0xffea00, 0.85 * alpha);
          ts.beamGraphic.fillRect(ts.x - 10, ts.cloudY + 12, 20, CONFIG.GROUND_Y - ts.cloudY);

          if (!ts.hasDamaged && Math.abs(player.sprite.x - ts.x) < 34 && player.sprite.y > ts.cloudY + 20) {
            ts.hasDamaged = true;
            player.takeDamage(CONFIG.ENEMY.BOSS_VODYANYK_TSAR.DAMAGE_THUNDER || 19, ts.x);
          }
        } else {
          this.cleanupThunderStrike();
        }
      }

      cleanupThunderStrike() {
        if (!this.activeThunderStrike) return;
        if (this.activeThunderStrike.cloudImg) this.activeThunderStrike.cloudImg.destroy();
        if (this.activeThunderStrike.warnGlow) this.activeThunderStrike.warnGlow.destroy();
        if (this.activeThunderStrike.beamGraphic) this.activeThunderStrike.beamGraphic.destroy();
        this.activeThunderStrike = null;
      }

      summonDepthMinion(time) {
        this.lastCallTime = time;
        const deck = this.getDeckBounds();
        const pl = this.scene ? this.scene.player : null;
        const spawnX = (pl && pl.sprite && pl.sprite.x < deck.centerX)
          ? deck.maxX - 30
          : deck.minX + 30;

        this.scene.showFloatingText(this.sprite.x, this.sprite.y - 82, STRINGS.BOSS_VODYANYK_SUMMON, '#00f5d4');
        SFX.waterSplash();
        this.scene.spawnWaterSplash(spawnX, CONFIG.GROUND_Y, 14);

        const arenaMin = (this.scene.levelData ? this.scene.levelData.bossArenaStartX : 7100) + 50;
        const arenaMax = (this.scene.worldWidth || 8400) - 60;
        let minion;
        if (this.stage >= 3 && this.summonedMinions.length === 1) {
          minion = new RusalkaEnemy(this.scene, spawnX, CONFIG.GROUND_Y + 4, arenaMin, arenaMax);
        } else {
          minion = new PoterchaEnemy(this.scene, spawnX, 185, arenaMin, arenaMax);
        }
        this.scene.enemies.push(minion);
        this.summonedMinions.push(minion);
      }

      startStage3Rain() {
        if (this.rainDrops && this.rainDrops.length > 0) return;
        const count = CONFIG.ENEMY.BOSS_VODYANYK_TSAR.RAIN_DROP_COUNT || 18;
        for (let i = 0; i < count; i++) {
          const rx = Phaser.Math.Between(0, CONFIG.WIDTH);
          const ry = Phaser.Math.Between(0, CONFIG.HEIGHT);
          const drop = this.scene.add.rectangle(rx, ry, 2, 16, 0x90e0ef, 0.42)
            .setAngle(14)
            .setScrollFactor(0)
            .setDepth(95);
          this.rainDrops.push(drop);
        }
      }

      updateStage3Rain(dtSec) {
        if (!this.rainDrops || this.rainDrops.length === 0) return;
        this.rainDrops.forEach(d => {
          if (!d.active) return;
          d.x -= 110 * dtSec;
          d.y += 420 * dtSec;
          if (d.y > CONFIG.HEIGHT + 12) {
            d.y = -12;
            d.x = Phaser.Math.Between(0, CONFIG.WIDTH + 80);
          }
          if (d.x < -12) {
            d.x = CONFIG.WIDTH + 10;
          }
        });
      }

      cleanupBossEffects() {
        this.cleanupThunderStrike();
        if (this.pullVortexGraphic) {
          this.pullVortexGraphic.destroy();
          this.pullVortexGraphic = null;
        }
        if (this.submergeBubbles && this.submergeBubbles.length > 0) {
          this.submergeBubbles.forEach(b => { if (b && b.destroy) b.destroy(); });
          this.submergeBubbles = [];
        }
        if (this.rainDrops && this.rainDrops.length > 0) {
          this.rainDrops.forEach(d => { if (d && d.destroy) d.destroy(); });
          this.rainDrops = [];
        }
      }

      update(time, player) {
        const dtSec = this.lastFrameTime > 0 ? Math.min(0.05, (time - this.lastFrameTime) / 1000) : 0.016;
        this.lastFrameTime = time;

        if (this.active && !this.isFinished) {
          this.updateThunderStrike(time, player);
          if (this.stage >= 3) {
            this.updateStage3Rain(dtSec);
          }
        }

        if (!this.active || !this.updateBase(time)) return;

        // Keep Vodyanyk Tsar on the central 520px «Поміст Водяного Царя»
        const deck = this.getDeckBounds();
        if (this.sprite.x < deck.minX) this.sprite.x = deck.minX;
        if (this.sprite.x > deck.maxX) this.sprite.x = deck.maxX;

        const cfg = CONFIG.ENEMY.BOSS_VODYANYK_TSAR;
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;
        const distToPlayer = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;
        const speedMult = this.stage === 3 ? 1.24 : (this.stage === 2 ? 1.12 : 1);
        const cdMult = this.stage === 3 ? 0.68 : (this.stage === 2 ? 0.80 : 1);

        if (this.state === 'COOLDOWN') {
          this.facing = dirToPlayer;
          this.sprite.setFlipX(this.facing < 0);
          if (distToPlayer > 140) {
            this.sprite.body.setVelocityX(this.facing * cfg.STALK_SPEED * speedMult);
          } else {
            this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          }

          if (time >= this.stateEndTime) {
            this.pickNextMove(time, distToPlayer);
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            const iconMap = {
              TRIDENT_SURGE: '🔱!',
              TIDAL_SLAM: '🌊!',
              WHIRLPOOL_VOLLEY: '💧!',
              TRIDENT_THROW: '🔱!',
              TRIDENT_FAN: '🔱🔱!',
              THUNDER_CLOUDS: '⚡!',
              CALL_OF_DEPTHS: '🧜‍♀️!',
              WHIRLPOOL_PULL: '🌀!',
              SUBMERGE_DASH: '🌊!'
            };
            this.telegraphLabel.setText(iconMap[this.nextMove] || '🌊!').setColor('#00f5d4').setVisible(true);
            this.sprite.setTint(0x48cae4);
            this.sprite.setScale(1.14, 0.88);
            const telMs = cfg.TELEGRAPH_MS * (this.stage === 3 ? 0.78 : (this.stage === 2 ? 0.88 : 1));
            this.stateEndTime = time + telMs;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.sprite.setScale(1, 1);
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
              const targetX = Phaser.Math.Clamp(player.sprite.x, deck.minX, deck.maxX);
              const jumpVx = Phaser.Math.Clamp((targetX - this.sprite.x) * 1.15, -320, 320);
              this.sprite.body.setVelocity(jumpVx, cfg.JUMP_VEL_Y);
              this.timeOutJump = time + 1450;
              this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
            } else if (this.nextMove === 'TRIDENT_THROW') {
              this.state = 'TRIDENT_THROW';
              if (this.scene.spawnVodyanykTrident) {
                this.scene.spawnVodyanykTrident(this.sprite.x + this.facing * 32, this.sprite.y - 18, player.sprite.x, player.sprite.y - 10, 0);
              }
              this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
            } else if (this.nextMove === 'TRIDENT_FAN') {
              this.state = 'TRIDENT_FAN';
              if (this.scene.spawnVodyanykTrident) {
                [-0.22, 0, 0.22].forEach(angleOff => {
                  this.scene.spawnVodyanykTrident(this.sprite.x + this.facing * 32, this.sprite.y - 18, player.sprite.x, player.sprite.y - 10, angleOff);
                });
              }
              this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
            } else if (this.nextMove === 'THUNDER_CLOUDS') {
              this.state = 'THUNDER_CLOUDS';
              this.spawnThunderCloudAttack(time, player.sprite.x);
              this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
            } else if (this.nextMove === 'CALL_OF_DEPTHS') {
              this.state = 'CALL_OF_DEPTHS';
              this.summonDepthMinion(time);
              this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
            } else if (this.nextMove === 'WHIRLPOOL_PULL') {
              this.state = 'WHIRLPOOL_PULL';
              this.stateEndTime = time + (cfg.WHIRLPOOL_PULL_DURATION_MS || 2100);
              this.scene.showFloatingText(this.sprite.x, this.sprite.y - 82, STRINGS.BOSS_VODYANYK_PULL_WARN, '#90e0ef');
              SFX.waterSplash();
              if (!this.pullVortexGraphic) {
                this.pullVortexGraphic = this.scene.add.graphics().setDepth(24);
              }
              this.pullVortexGraphic.setVisible(true);
            } else if (this.nextMove === 'SUBMERGE_DASH') {
              this.state = 'SUBMERGE_DASH';
              this.submergePhase = 'DIVE';
              this.stateEndTime = time + (cfg.SUBMERGE_HIDE_MS || 850);
              this.submergeTargetX = Phaser.Math.Clamp(player.sprite.x, deck.minX + 20, deck.maxX - 20);
              SFX.waterSplash();
              this.scene.spawnWaterSplash(this.sprite.x, CONFIG.GROUND_Y, 18);
              this.scene.showFloatingText(this.sprite.x, this.sprite.y - 75, STRINGS.BOSS_VODYANYK_SUBMERGE_WARN, '#48cae4');
              this.sprite.setAlpha(0.15);
              this.sprite.body.setVelocity(0, 0);
            } else {
              // WHIRLPOOL_VOLLEY
              this.state = 'WHIRLPOOL_VOLLEY';
              this.scene.spawnWaterOrb(this.sprite.x, this.sprite.y - 24, player.sprite.x, player.sprite.y - 12);
              if (this.stage >= 2) {
                this.scene.time.delayedCall(200, () => {
                  if (this.sprite && this.sprite.active && !this.isStunned && !this.isFinished) {
                    this.scene.spawnWaterOrb(this.sprite.x, this.sprite.y - 30, player.sprite.x, player.sprite.y - 24);
                  }
                });
              }
              if (this.stage >= 3) {
                this.scene.time.delayedCall(400, () => {
                  if (this.sprite && this.sprite.active && !this.isStunned && !this.isFinished) {
                    this.scene.spawnWaterOrb(this.sprite.x, this.sprite.y - 20, player.sprite.x, player.sprite.y - 18);
                  }
                });
              }
              this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
            }
          }
        } else if (this.state === 'TRIDENT_SURGE') {
          const speed = cfg.SURGE_SPEED * speedMult;
          this.sprite.body.setVelocityX(this.facing * speed);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(cfg.DAMAGE_SURGE, this.sprite.x);
          }
          if (time >= this.stateEndTime || this.sprite.x <= deck.minX + 6 || this.sprite.x >= deck.maxX - 6) {
            this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
          }
        } else if (this.state === 'TIDAL_SLAM') {
          if ((this.waitingForSlamLand && onFloor) || time > this.timeOutJump) {
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(1.25, 0.78);
            SFX.waterSplash();
            this.scene.cameras.main.shake(CONFIG.FEEL.SHAKE_HEAVY_DURATION, CONFIG.FEEL.SHAKE_HEAVY_INTENSITY);
            this.scene.spawnTidalWaves(this.sprite.x, CONFIG.GROUND_Y - 14);
            this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
          }
        } else if (this.state === 'WHIRLPOOL_PULL') {
          this.sprite.body.setVelocityX(0);
          // Pull player horizontally toward the boss on the central deck
          const dx = this.sprite.x - player.sprite.x;
          const dist = Math.abs(dx);
          if (dist > 28 && dist < 560) {
            const pOnGround = player.sprite.body.blocked.down;
            const pullSpeed = pOnGround ? (cfg.WHIRLPOOL_PULL_SPEED || 155) : (cfg.WHIRLPOOL_PULL_AIR_SPEED || 205);
            const pullDir = dx > 0 ? 1 : -1;
            player.sprite.x += pullDir * pullSpeed * dtSec;
          }
          if (this.pullVortexGraphic) {
            const pulse = 1 + Math.sin(time * 0.012) * 0.15;
            this.pullVortexGraphic.clear();
            this.pullVortexGraphic.lineStyle(3, 0x00f5d4, 0.75);
            this.pullVortexGraphic.strokeEllipse(this.sprite.x, CONFIG.GROUND_Y - 4, 210 * pulse, 28);
            this.pullVortexGraphic.lineStyle(2, 0x90e0ef, 0.85);
            this.pullVortexGraphic.strokeEllipse(this.sprite.x, CONFIG.GROUND_Y - 4, 120 * pulse, 16);
          }
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(cfg.DAMAGE_WAVE, this.sprite.x);
          }
          if (time >= this.stateEndTime) {
            if (this.pullVortexGraphic) this.pullVortexGraphic.setVisible(false);
            this.scene.spawnTidalWaves(this.sprite.x, CONFIG.GROUND_Y - 14);
            this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
          }
        } else if (this.state === 'SUBMERGE_DASH') {
          if (this.submergePhase === 'DIVE') {
            this.submergeTargetX = Phaser.Math.Clamp(
              Phaser.Math.Linear(this.sprite.x, player.sprite.x, 0.15),
              deck.minX + 20,
              deck.maxX - 20
            );
            this.sprite.x = this.submergeTargetX;
            if (Math.random() < 0.35) {
              this.scene.spawnWaterSplash(this.sprite.x, CONFIG.GROUND_Y - 2, 3);
            }
            if (time >= this.stateEndTime) {
              this.submergePhase = 'LEAP';
              this.sprite.setAlpha(1);
              SFX.waterSplash();
              this.scene.spawnWaterSplash(this.sprite.x, CONFIG.GROUND_Y, 20);
              this.sprite.body.setVelocity(0, cfg.SUBMERGE_LEAP_VEL_Y || -590);
              this.waitingForSlamLand = false;
              this.timeOutJump = time + 1350;
              this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
            }
          } else if (this.submergePhase === 'LEAP') {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
              player.takeDamage(cfg.DAMAGE_SUBMERGE || 21, this.sprite.x);
            }
            if ((this.waitingForSlamLand && onFloor) || time > this.timeOutJump) {
              this.sprite.body.setVelocityX(0);
              SFX.waterSplash();
              this.scene.cameras.main.shake(CONFIG.FEEL.SHAKE_HEAVY_DURATION, CONFIG.FEEL.SHAKE_HEAVY_INTENSITY);
              this.scene.spawnTidalWaves(this.sprite.x, CONFIG.GROUND_Y - 14);
              this.enterCooldownWindow(time, cfg.COOLDOWN_MS * cdMult);
            }
          }
        }
      }

      triggerFinisher(fromX) {
        const cfg = CONFIG.ENEMY.BOSS_VODYANYK_TSAR;
        const now = this.scene.time.now;

        if (this.stage < this.stagesRequired) {
          this.stage++;
          this.isStunned = false;
          this.stun = 0;
          this.invulnUntil = now + (cfg.PHASE_TRANSITION_INVULN_MS || 1500);
          this.barFill.setFillStyle(0xe63946);
          this.stunPrompt.setVisible(false);
          this.stars.forEach(s => s.setVisible(false));

          // Clean up active enemy projectiles during phase transition
          if (this.scene.enemyProjectiles) {
            this.scene.enemyProjectiles.clear(true, true);
          }

          SFX.finisher();
          SFX.waterSplash();
          this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
          this.scene.cameras.main.shake(260, 0.016);
          this.scene.spawnWaterSplash(this.sprite.x, this.sprite.y, 18);
          this.scene.spawnLoot(this.sprite.x, this.sprite.y);

          const bannerText = this.stage === 2
            ? STRINGS.BOSS_VODYANYK_STAGE_2
            : STRINGS.BOSS_VODYANYK_STAGE_3;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 84, bannerText, '#00f5d4');

          if (this.stage === 3) {
            this.startStage3Rain();
          }

          this.state = 'TIDAL_SLAM';
          this.waitingForSlamLand = false;
          this.sprite.setAlpha(1);
          this.sprite.body.setVelocity(0, -540);
          this.timeOutJump = now + 1400;
          this.scene.time.delayedCall(140, () => { this.waitingForSlamLand = true; });
        } else {
          this.cleanupBossEffects();
          this.summonedMinions.forEach(m => {
            if (m && !m.isFinished && m.sprite && m.sprite.active) {
              m.isFinished = true;
              m.sprite.destroy();
            }
          });
          this.summonedMinions = [];

          this.isFinished = true;
          this.isStunned = false;
          if (this.barBg) this.barBg.setVisible(false);
          if (this.barFill) this.barFill.setVisible(false);
          if (this.stunPrompt) this.stunPrompt.setVisible(false);
          this.stars.forEach(s => s.setVisible(false));

          if (this.scene.enemyProjectiles) this.scene.enemyProjectiles.clear(true, true);
          if (this.scene.player) this.scene.player.invulnUntil = now + 8000;

          SFX.finisher();
          SFX.waterSplash();
          this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
          this.scene.cameras.main.shake(300, 0.018);

          const bx = this.sprite.x;
          const by = this.sprite.y;
          this.sprite.body.setVelocity(0, 0);
          this.sprite.body.setAllowGravity(false);
          this.sprite.body.enable = false;

          this.scene.spawnWaterSplash(bx, CONFIG.GROUND_Y, 24);
          this.scene.spawnLoot(bx, by);
          this.scene.showFloatingText(bx, by - 88, STRINGS.BOSS_VODYANYK_DEFEATED_MSG, '#90e0ef');

          // Comical whirlpool funnel under Vodyanyk Tsar spinning him down into the Dnipro!
          const defeatVortex = this.scene.add.graphics({ x: bx, y: CONFIG.GROUND_Y + 4 }).setDepth(24);
          defeatVortex.lineStyle(4, 0x00f5d4, 0.9);
          defeatVortex.strokeEllipse(0, 0, 128, 26);
          defeatVortex.lineStyle(3, 0x90e0ef, 0.95);
          defeatVortex.strokeEllipse(0, 0, 76, 15);
          defeatVortex.fillStyle(0x021024, 0.95);
          defeatVortex.fillEllipse(0, 0, 36, 8);

          this.scene.tweens.add({
            targets: defeatVortex,
            scaleX: { from: 1.15, to: 0.1 },
            scaleY: { from: 1.15, to: 0.1 },
            alpha: 0,
            duration: 1050,
            ease: 'Quad.easeIn',
            onComplete: () => defeatVortex.destroy()
          });

          this.scene.tweens.add({
            targets: this.sprite,
            y: CONFIG.GROUND_Y + 56,
            angle: 720,
            scaleX: 0.12,
            scaleY: 0.12,
            alpha: 0,
            duration: 950,
            ease: 'Back.easeIn',
            onComplete: () => {
              SFX.waterSplash();
              this.scene.spawnWaterSplash(bx, CONFIG.GROUND_Y, 18);
              if (typeof this.scene.freeCaptiveCatfishAndWin === 'function') {
                this.scene.freeCaptiveCatfishAndWin();
              } else {
                this.scene.triggerVictory();
              }
            }
          });
        }
      }
    }