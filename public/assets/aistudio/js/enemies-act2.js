
    /**
     * ============================================================================
     * 9B. ACT II («ЗЛИЙ ЛІС») UKRAINIAN FOREST MYTHOLOGY ENEMIES & BOSS
     * ============================================================================
     */

    /**
     * SUBCLASS D: Моховик-Щитоносець / Дубовий Страж (Oak-Shielded Forest Guardian)
     * - Completely INVULNERABLE to frontal melee attacks and frontal Galushkas!
     * - Can ONLY be damaged/stunned from behind by rolling through him with [Shift]!
     * - Has a deliberate turnaround delay (TURN_DELAY_MS = 470ms) when Omelko rolls behind him,
     *   giving a crisp tactical window for backstab combos!
     */
    class ShieldGuardianEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_shield_guardian', CONFIG.ENEMY.SHIELD_GUARDIAN.MAX_STUN);
        this.sprite.body.setSize(38, 52);
        this.sprite.body.setOffset(8, 6);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 180);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 180);
        this.facing = -1; // 1 = right, -1 = left
        this.sprite.setFlipX(this.facing < 0);

        this.state = 'PATROL'; // PATROL, ADVANCE, TURN_DELAY, TELEGRAPH, SHIELD_BASH, COOLDOWN
        this.stateEndTime = 0;
        this.pendingFacing = -1;
        this.lastBlockHintTime = 0;
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false, isCounter = false, isFrog = false, isRollBootHit = false) {
        void isCounter;
        void isFrog;
        if (this.isFinished) return;

        // Once stunned (100% bar), any hit triggers the Comical Finisher!
        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        // Check if attack came from the FRONT (where the massive oak shield is held)
        const hitFromRight = fromX >= this.sprite.x;
        const isFrontalHit = (this.facing > 0 && hitFromRight) || (this.facing < 0 && !hitFromRight);

        if (isFrontalHit && !isRollBootHit) {
          // 100% INVULNERABLE FROM THE FRONT!
          SFX.shieldBlock();
          this.scene.cameras.main.shake(90, 0.004);
          this.sprite.setScale(1.16, 0.9);
          this.sprite.setTint(0x94a3b8);
          this.scene.time.delayedCall(90, () => {
            if (this.sprite && this.sprite.active && !this.isTelegraphing) this.sprite.clearTint();
          });

          // Sparks on the front shield
          this.scene.spawnHitParticles(this.sprite.x + this.facing * 20, this.sprite.y, 5);

          // Push player slightly back when clanging against the oak shield
          if (this.scene.player && this.scene.player.sprite) {
            this.scene.player.sprite.body.setVelocityX(this.facing * 190);
          }

          const now = this.scene.time.now;
          if (now - this.lastBlockHintTime > 650) {
            this.lastBlockHintTime = now;
            this.scene.showFloatingText(this.sprite.x, this.sprite.y - 58, STRINGS.SHIELD_BLOCKED_HINT, '#ffd166');
          }
          return;
        }

        // Hit landed from BEHIND (Omelko rolled behind his shield with [Shift])!
        const backstabStun = Math.round(stunAmount * 1.35);
        this.scene.showFloatingText(this.sprite.x, this.sprite.y - 56, STRINGS.BACKSTAB_HIT, '#00f5d4');
        super.receiveStunHit(backstabStun, fromX, true);
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const horizDist = Math.abs(player.sprite.x - this.sprite.x);
        const vertDist = Math.abs(player.sprite.y - this.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'PATROL') {
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.SHIELD_GUARDIAN.PATROL_SPEED);
          this.sprite.setFlipX(this.facing < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) {
            this.facing = -1;
            this.sprite.setFlipX(true);
          } else if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) {
            this.facing = 1;
            this.sprite.setFlipX(false);
          }

          if (dist < CONFIG.ENEMY.SHIELD_GUARDIAN.AGGRO_RANGE && vertDist < 140) {
            this.state = 'ADVANCE';
          }
        } else if (this.state === 'ADVANCE') {
          if (dist > CONFIG.ENEMY.SHIELD_GUARDIAN.AGGRO_RANGE * 1.25 || vertDist > 180) {
            this.state = 'PATROL';
            return;
          }

          // If Omelko rolled behind the Shield Guardian, he cannot spin around instantly!
          // He enters a 470ms TURN_DELAY so the player can punish his exposed back!
          if (dirToPlayer !== this.facing && horizDist > 10) {
            this.state = 'TURN_DELAY';
            this.pendingFacing = dirToPlayer;
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('?').setColor('#ffd166').setVisible(true);
            this.stateEndTime = time + CONFIG.ENEMY.SHIELD_GUARDIAN.TURN_DELAY_MS;
            return;
          }

          // Advance steadily with shield raised
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.SHIELD_GUARDIAN.ADVANCE_SPEED);
          this.sprite.setFlipX(this.facing < 0);

          // Within bash range -> Telegraph heavy Shield Bash!
          if (horizDist < 125 && vertDist < 75) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('!').setColor('#ff002b').setVisible(true);
            this.sprite.setTint(0xffbe0b);
            this.sprite.setScale(1.15, 0.85);
            this.stateEndTime = time + CONFIG.ENEMY.SHIELD_GUARDIAN.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TURN_DELAY') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.telegraphLabel.setVisible(false);
            this.facing = this.pendingFacing;
            this.sprite.setFlipX(this.facing < 0);
            this.sprite.setScale(1.12, 0.9);
            // After turning around toward Omelko, if Omelko is still close, immediately telegraph a Shield Bash!
            if (horizDist < 135 && vertDist < 80) {
              this.state = 'TELEGRAPH';
              this.isTelegraphing = true;
              this.telegraphLabel.setText('!').setColor('#ff002b').setVisible(true);
              this.sprite.setTint(0xffbe0b);
              this.stateEndTime = time + CONFIG.ENEMY.SHIELD_GUARDIAN.TELEGRAPH_MS * 0.85;
              SFX.telegraph();
            } else {
              this.state = 'ADVANCE';
            }
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.state = 'SHIELD_BASH';
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.setTint(0xff4d4d);
            this.stateEndTime = time + 480;
            SFX.swing(3, false);
          }
        } else if (this.state === 'SHIELD_BASH') {
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.SHIELD_GUARDIAN.BASH_SPEED);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.SHIELD_GUARDIAN.DAMAGE_BASH, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(-this.facing * 90);
            this.stateEndTime = time + CONFIG.ENEMY.SHIELD_GUARDIAN.COOLDOWN_MS;
            return;
          }

          if (time >= this.stateEndTime) {
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.SHIELD_GUARDIAN.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          if (time >= this.stateEndTime) {
            this.state = 'ADVANCE';
          }
        }
      }
    }

    /**
     * SUBCLASS E: Лісова Нявка (Eerie Woodland Spirit / Mavka)
     * - Hover-glides with a haunting sine wave motion, shrieks, and performs either a
     *   Phantom Swoop or fires a glowing Will-o'-Wisp ('willowisp' — вогник Блуду).
     */
    class NyavkaEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_nyavka', CONFIG.ENEMY.NYAVKA.MAX_STUN);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 180);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 180);
        this.patrolDir = -1;
        this.state = 'FLOAT'; // FLOAT, TELEGRAPH, SWOOP, COOLDOWN
        this.stateEndTime = 0;
        this.swoopDir = -1;
        this.attackCycle = 0;
        this.sprite.setAlpha(0.92);
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'FLOAT') {
          this.sprite.body.setVelocityX(this.patrolDir * CONFIG.ENEMY.NYAVKA.FLOAT_SPEED);
          this.sprite.setFlipX(this.patrolDir < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.patrolDir = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.patrolDir = 1;

          // Eerie floating hop when touching floor
          if ((this.sprite.body.blocked.down || this.sprite.body.touching.down) && Math.random() < 0.03) {
            this.sprite.body.setVelocityY(-260);
          }

          if (dist < CONFIG.ENEMY.NYAVKA.AGGRO_RANGE && Math.abs(player.sprite.y - this.sprite.y) < 210) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.swoopDir = dirToPlayer;
            this.sprite.setFlipX(this.swoopDir < 0);
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('!').setColor('#00f5d4').setVisible(true);
            this.sprite.setTint(0x80ed99);
            this.sprite.setScale(1.18, 0.84);
            this.stateEndTime = time + CONFIG.ENEMY.NYAVKA.TELEGRAPH_MS;
            SFX.nyavkaWail();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.attackCycle++;

            if (this.attackCycle % 2 === 0 && dist > 150) {
              // Fire ghostly Will-o'-Wisp orb toward Omelko
              this.scene.spawnWillOWisp(this.sprite.x, this.sprite.y - 8, player.sprite.x, player.sprite.y);
              this.state = 'COOLDOWN';
              this.stateEndTime = time + CONFIG.ENEMY.NYAVKA.COOLDOWN_MS;
            } else {
              // Fast Phantom Swoop!
              this.state = 'SWOOP';
              this.swoopDir = dirToPlayer;
              this.sprite.setFlipX(this.swoopDir < 0);
              this.sprite.setTint(0x00f5d4);
              if (player.sprite.y < this.sprite.y - 35 && (this.sprite.body.blocked.down || this.sprite.body.touching.down)) {
                this.sprite.body.setVelocityY(-490);
              }
              this.stateEndTime = time + 620;
            }
          }
        } else if (this.state === 'SWOOP') {
          this.sprite.body.setVelocityX(this.swoopDir * CONFIG.ENEMY.NYAVKA.SWOOP_SPEED);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.NYAVKA.DAMAGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(-this.swoopDir * 120);
            this.stateEndTime = time + CONFIG.ENEMY.NYAVKA.COOLDOWN_MS;
            return;
          }

          if (time >= this.stateEndTime) {
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.NYAVKA.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.82);
          if (time >= this.stateEndTime) {
            this.state = 'FLOAT';
          }
        }
      }
    }

    /**
     * SUBCLASS F: Болотяник (Hulking Swamp Mire Demon)
     * - Hurls heavy toxic bog-sludge ('swamp_glob') at range, and performs a ground-shaking
     *   Mire Slam if Omelko gets close!
     */
    class BolotyanykEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_bolotyanyk', CONFIG.ENEMY.BOLOTYANYK.MAX_STUN);
        this.sprite.body.setSize(46, 50);
        this.sprite.body.setOffset(5, 6);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 160);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 160);
        this.walkDir = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH_THROW, TELEGRAPH_SLAM, COOLDOWN
        this.stateEndTime = 0;
        this.nextAttackTime = 0;
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const horizDist = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'PATROL') {
          this.sprite.body.setVelocityX(this.walkDir * CONFIG.ENEMY.BOLOTYANYK.WALK_SPEED);
          this.sprite.setFlipX(this.walkDir < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.walkDir = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.walkDir = 1;

          if (dist < CONFIG.ENEMY.BOLOTYANYK.AGGRO_RANGE && time >= this.nextAttackTime) {
            this.isTelegraphing = true;
            this.sprite.body.setVelocityX(0);
            this.sprite.setFlipX(dirToPlayer < 0);
            this.telegraphLabel.setText('!').setColor('#80ed99').setVisible(true);
            this.sprite.setTint(0x80ed99);
            this.sprite.setScale(1.22, 0.8);
            this.stateEndTime = time + CONFIG.ENEMY.BOLOTYANYK.TELEGRAPH_MS;
            this.state = horizDist < CONFIG.ENEMY.BOLOTYANYK.SLAM_RANGE ? 'TELEGRAPH_SLAM' : 'TELEGRAPH_THROW';
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH_THROW') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.sprite.setScale(0.85, 1.22);
            this.scene.spawnSwampGlob(this.sprite.x, this.sprite.y - 12, player.sprite.x, player.sprite.y);
            this.state = 'COOLDOWN';
            this.stateEndTime = time + 400;
            this.nextAttackTime = time + CONFIG.ENEMY.BOLOTYANYK.COOLDOWN_MS;
          }
        } else if (this.state === 'TELEGRAPH_SLAM') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.sprite.setScale(1.34, 0.72);
            this.scene.cameras.main.shake(150, 0.008);
            this.scene.spawnHitParticles(this.sprite.x, this.sprite.y + 18, 8);
            if (horizDist < CONFIG.ENEMY.BOLOTYANYK.SLAM_RANGE + 25 && Math.abs(player.sprite.y - this.sprite.y) < 75) {
              player.takeDamage(CONFIG.ENEMY.BOLOTYANYK.DAMAGE_SLAM, this.sprite.x);
            }
            // Also hurl two short mire globs left & right on slam
            this.scene.spawnSwampGlob(this.sprite.x, this.sprite.y - 8, this.sprite.x - 160, this.sprite.y);
            this.scene.spawnSwampGlob(this.sprite.x, this.sprite.y - 8, this.sprite.x + 160, this.sprite.y);
            this.state = 'COOLDOWN';
            this.stateEndTime = time + 480;
            this.nextAttackTime = time + CONFIG.ENEMY.BOLOTYANYK.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.state = 'PATROL';
          }
        }
      }
    }

    /**
     * SUBCLASS G: Куций Чортик з Корчми (Tavern Imp / Devil from "Куций Хвіст")
     * - Agile, mischievous imp feasting at the oak tables in the haunted tavern.
     * - Teleports in sulfurous smoke directly behind Omelko's back and immediately strikes
     *   with a tight reaction window ('POST_TELEPORT' -> 'BACKSTAB_LUNGE'), or hurls frothy mugs!
     */
    class ChortEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_chort', CONFIG.ENEMY.CHORT.MAX_STUN);
        this.sprite.body.setSize(30, 44);
        this.sprite.body.setOffset(9, 6);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 160);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 160);
        this.walkDir = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, POST_TELEPORT, BACKSTAB_LUNGE, LUNGE, COOLDOWN
        this.stateEndTime = 0;
        this.nextHopTime = 0;
        this.attackCycle = 0;
        this.lastTeleportTime = -5000;
        this.hasSpawnedBackstabSlash = false;
      }

      spawnSmokePuff(x, y) {
        if (!this.scene || !this.scene.add) return;
        for (let i = 0; i < 7; i++) {
          const puff = this.scene.add.circle(
            x + Phaser.Math.Between(-14, 14),
            y + Phaser.Math.Between(-18, 12),
            Phaser.Math.Between(6, 12),
            i % 2 === 0 ? 0x9b1123 : 0x3c096c,
            0.8
          ).setDepth(36);
          this.scene.tweens.add({
            targets: puff,
            x: puff.x + Phaser.Math.Between(-28, 28),
            y: puff.y - Phaser.Math.Between(18, 42),
            scale: 1.8,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              if (puff && puff.active) puff.destroy();
            }
          });
        }
      }

      spawnBackstabSlashEffect() {
        if (!this.scene || !this.scene.add) return;
        const slashX = this.sprite.x + this.walkDir * 28;
        const slashY = this.sprite.y - 2;
        const slash = this.scene.add.image(slashX, slashY, 'saber_slash').setDepth(37);
        slash.setFlipX(this.walkDir < 0);
        slash.setTint(0xff0055);
        slash.setScale(0.95);
        this.scene.tweens.add({
          targets: slash,
          alpha: 0,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 140,
          onComplete: () => {
            if (slash && slash.active) slash.destroy();
          }
        });
      }

      teleportBehindPlayer(time, player) {
        if (!player || !player.sprite) return false;
        this.lastTeleportTime = time;
        this.spawnSmokePuff(this.sprite.x, this.sprite.y);

        // Compute target X tightly behind Omelko's back (46px behind him) so the backstab strike connects immediately!
        const chunkObj = (this.scene.levelData && this.scene.levelData.chunks && this.chunkId)
          ? this.scene.levelData.chunks[this.chunkId]
          : null;
        const boundMinX = chunkObj ? chunkObj.bounds.x + 70 : Math.max(80, this.minX - 110);
        const boundMaxX = chunkObj ? (chunkObj.bounds.x + chunkObj.bounds.width - 70) : (this.maxX + 110);

        const desiredX = player.sprite.x - (player.facing || 1) * 46;
        const targetX = Phaser.Math.Clamp(desiredX, boundMinX, boundMaxX);
        const targetY = Math.min(CONFIG.GROUND_Y - 34, player.sprite.y);

        this.sprite.setPosition(targetX, targetY);
        if (this.sprite.body) {
          this.sprite.body.setVelocity(0, 0);
        }
        this.walkDir = player.sprite.x >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(this.walkDir < 0);
        this.sprite.setScale(1.18, 0.84);
        this.spawnSmokePuff(targetX, targetY);

        if (SFX.chortTeleport) SFX.chortTeleport();
        if (this.scene && this.scene.showFloatingText) {
          this.scene.showFloatingText(targetX, targetY - 52, STRINGS.CHORT_TELEPORT_WARN || 'Чорт за спиною!', '#ff9f1c');
        }

        // Tight reaction window (~210ms) before the Chort immediately slashes Omelko in the back!
        this.state = 'POST_TELEPORT';
        this.isTelegraphing = true;
        this.hasSpawnedBackstabSlash = false;
        this.telegraphLabel.setText('!').setColor('#ff0055').setVisible(true);
        this.sprite.setTint(0xff2a4b);
        this.stateEndTime = time + (CONFIG.ENEMY.CHORT.POST_TELEPORT_MS || 210);
        return true;
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false, isCounter = false, isFrog = false, fromRollBoots = false) {
        super.receiveStunHit(stunAmount, fromX, isHeavy, isCounter, isFrog, fromRollBoots);
        // If still conscious and teleport is off cooldown, 65% chance to vanish in smoke behind Omelko and strike back!
        const now = this.scene ? this.scene.time.now : 0;
        if (
          !this.isFinished &&
          !this.isStunned &&
          !fromRollBoots &&
          this.scene &&
          this.scene.player &&
          now - this.lastTeleportTime > (CONFIG.ENEMY.CHORT.TELEPORT_COOLDOWN_MS || 2100) &&
          Math.random() < 0.65
        ) {
          this.teleportBehindPlayer(now, this.scene.player);
        }
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const horizDist = Math.abs(player.sprite.x - this.sprite.x);
        const vertDist = Math.abs(player.sprite.y - this.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        if (this.state === 'PATROL') {
          this.sprite.body.setVelocityX(this.walkDir * CONFIG.ENEMY.CHORT.SPEED);
          this.sprite.setFlipX(this.walkDir < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.walkDir = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.walkDir = 1;

          // Mischievous imp hops while patrolling
          if (onFloor && time >= this.nextHopTime && Math.random() < 0.04) {
            this.sprite.body.setVelocityY(-280);
            this.nextHopTime = time + 800;
          }

          if (dist < CONFIG.ENEMY.CHORT.AGGRO_RANGE && vertDist < 175) {
            const canTeleportNow =
              horizDist < 390 &&
              vertDist < 145 &&
              (time - this.lastTeleportTime > (CONFIG.ENEMY.CHORT.TELEPORT_COOLDOWN_MS || 2100));

            if (canTeleportNow) {
              // Immediately teleport behind Omelko's back and prepare backstab!
              this.teleportBehindPlayer(time, player);
            } else {
              this.state = 'TELEGRAPH';
              this.isTelegraphing = true;
              this.walkDir = dirToPlayer;
              this.sprite.setFlipX(this.walkDir < 0);
              this.sprite.body.setVelocityX(0);
              this.telegraphLabel.setText('!').setColor('#ffbe0b').setVisible(true);
              this.sprite.setTint(0xff9f1c);
              this.sprite.setScale(1.18, 0.84);
              this.stateEndTime = time + CONFIG.ENEMY.CHORT.TELEGRAPH_MS;
              SFX.telegraph();
            }
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.attackCycle++;

            const canTeleport =
              horizDist < 390 &&
              vertDist < 145 &&
              (time - this.lastTeleportTime > (CONFIG.ENEMY.CHORT.TELEPORT_COOLDOWN_MS || 2100));

            if (canTeleport && (this.attackCycle % 2 === 0 || horizDist < 170)) {
              this.teleportBehindPlayer(time, player);
            } else if (horizDist > 125 && this.attackCycle % 2 === 1) {
              // Hurl a frothy tavern mug in a fast parabola!
              this.sprite.setScale(0.86, 1.2);
              if (this.scene && typeof this.scene.spawnKorchmaMug === 'function') {
                this.scene.spawnKorchmaMug(this.sprite.x, this.sprite.y - 10, player.sprite.x, player.sprite.y - 8);
              }
              this.state = 'COOLDOWN';
              this.stateEndTime = time + CONFIG.ENEMY.CHORT.COOLDOWN_MS;
            } else {
              // Fast horned headbutt lunge!
              this.state = 'LUNGE';
              this.walkDir = dirToPlayer;
              this.sprite.setFlipX(this.walkDir < 0);
              this.stateEndTime = time + 380;
              if (SFX.chortLaugh) SFX.chortLaugh();
              else if (SFX.telegraph) SFX.telegraph();
            }
          }
        } else if (this.state === 'POST_TELEPORT') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            // Lock onto Omelko's position and execute an immediate horizontal Backstab Strike!
            this.state = 'BACKSTAB_LUNGE';
            this.walkDir = dirToPlayer;
            this.sprite.setFlipX(this.walkDir < 0);
            this.sprite.setScale(1.24, 0.82);
            this.spawnBackstabSlashEffect();
            if (SFX.swing) SFX.swing(2, true);
            if (SFX.chortLaugh) SFX.chortLaugh();

            // Immediate close-range backstab hit check on the first frame of the strike
            const strikeBox = new Phaser.Geom.Rectangle(
              this.sprite.x + (this.walkDir > 0 ? 0 : -46),
              this.sprite.y - 24,
              46,
              48
            );
            if (
              Phaser.Geom.Intersects.RectangleToRectangle(strikeBox, player.sprite.getBounds()) ||
              Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())
            ) {
              player.takeDamage(CONFIG.ENEMY.CHORT.DAMAGE, this.sprite.x);
              this.state = 'COOLDOWN';
              this.sprite.body.setVelocityX(-this.walkDir * 120);
              this.stateEndTime = time + CONFIG.ENEMY.CHORT.COOLDOWN_MS;
              return;
            }

            this.stateEndTime = time + 290;
          }
        } else if (this.state === 'BACKSTAB_LUNGE' || this.state === 'LUNGE') {
          const speed = this.state === 'BACKSTAB_LUNGE'
            ? CONFIG.ENEMY.CHORT.LUNGE_SPEED * 1.12
            : CONFIG.ENEMY.CHORT.LUNGE_SPEED;
          this.sprite.body.setVelocityX(this.walkDir * speed);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.CHORT.DAMAGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(-this.walkDir * 115);
            this.stateEndTime = time + CONFIG.ENEMY.CHORT.COOLDOWN_MS;
            return;
          }

          if (time >= this.stateEndTime) {
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.CHORT.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.82);
          if (time >= this.stateEndTime) {
            this.state = 'PATROL';
          }
        }
      }
    }

    /**
     * SUBCLASS G2: КОРЧМАРСЬКА ДУЛЯ (DulyaEnemy)
     * - Compact waist-high folkloric tavern creature (~32x34px) from «Як козаки на весіллі гуляли»:
     *   a one-eyed clenched fist ("дуля") wearing a white embroidered shirt with long sleeves.
     * - Curls into a round tucked ball ('enemy_dulya_roll', just like Omelko's 'cossack_roll')
     *   and rolls at high speed across the tavern floor!
     * - CANNOT be dodged by rolling [Shift] — Omelko MUST JUMP OVER [↑] the rolling ball!
     */
    class DulyaEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_dulya', CONFIG.ENEMY.DULYA.MAX_STUN);
        this.sprite.body.setSize(24, 28);
        this.sprite.body.setOffset(4, 5);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 220);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 220);
        this.walkDir = -1;
        this.rollDir = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, ROLL_ATTACK, COOLDOWN
        this.stateEndTime = 0;
        this.lastBlockTextTime = 0;
        this.nextRollDustTime = 0;
        this.hasRebounded = false;
      }

      setRollingHitbox(isRolling) {
        if (!this.sprite || !this.sprite.body) return;
        if (isRolling) {
          // Switch to round tucked ball texture just like Omelko's roll!
          if (this.sprite.texture.key !== 'enemy_dulya_roll') {
            this.sprite.setTexture('enemy_dulya_roll');
          }
          this.sprite.body.setSize(24, 24);
          this.sprite.body.setOffset(2, 3);
        } else {
          if (this.sprite.texture.key !== 'enemy_dulya') {
            this.sprite.setTexture('enemy_dulya');
          }
          this.sprite.body.setSize(24, 28);
          this.sprite.body.setOffset(4, 5);
          this.sprite.setAngle(0);
        }
      }

      enterStunState() {
        this.setRollingHitbox(false);
        super.enterStunState();
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false, isCounter = false, isFrog = false, fromRollBoots = false) {
        if (this.isFinished) return;
        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        // While rolling as a clenched fist-ball on the floor, ground attacks and roll-boots bounce off!
        // Omelko must jump over it [↑] and strike when it stops (or hit from above while jumping)!
        if (this.state === 'ROLL_ATTACK' && !isFrog) {
          const playerAbove =
            this.scene &&
            this.scene.player &&
            this.scene.player.sprite &&
            this.scene.player.sprite.body &&
            this.scene.player.sprite.body.bottom < this.sprite.y - 6;
          if (!playerAbove) {
            SFX.shieldBlock();
            this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 4);
            const now = this.scene ? this.scene.time.now : 0;
            if (now - this.lastBlockTextTime > 650 && this.scene && this.scene.showFloatingText) {
              this.lastBlockTextTime = now;
              this.scene.showFloatingText(
                this.sprite.x,
                this.sprite.y - 44,
                STRINGS.DULYA_BLOCK_WARN || 'Дуля котиться! Перестрибуй [↑]!',
                '#ffd166'
              );
            }
            return;
          }
        }

        super.receiveStunHit(stunAmount, fromX, isHeavy, isCounter, isFrog, fromRollBoots);
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const horizDist = Math.abs(player.sprite.x - this.sprite.x);
        const vertDist = Math.abs(player.sprite.y - this.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'PATROL') {
          this.setRollingHitbox(false);
          this.sprite.body.setVelocityX(this.walkDir * CONFIG.ENEMY.DULYA.WALK_SPEED);
          this.sprite.setFlipX(this.walkDir > 0);
          this.sprite.setAngle(Math.sin(time * 0.014) * 4);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.walkDir = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.walkDir = 1;

          if (horizDist < CONFIG.ENEMY.DULYA.AGGRO_RANGE && vertDist < 130) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.hasRebounded = false;
            this.rollDir = dirToPlayer;
            this.sprite.setFlipX(this.rollDir > 0);
            this.sprite.body.setVelocityX(0);
            this.sprite.setAngle(0);
            this.telegraphLabel.setText('!').setColor('#ffd166').setVisible(true);
            this.sprite.setTint(0xff9f1c);
            this.sprite.setScale(1.22, 0.78);
            this.stateEndTime = time + CONFIG.ENEMY.DULYA.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.state = 'ROLL_ATTACK';
            this.rollDir = dirToPlayer;
            this.setRollingHitbox(true);
            this.sprite.setScale(1.12, 0.88);
            this.stateEndTime = time + CONFIG.ENEMY.DULYA.ROLL_DURATION_MS;
            if (SFX.dulyaRoll) SFX.dulyaRoll();
            else SFX.roll();
          }
        } else if (this.state === 'ROLL_ATTACK') {
          this.sprite.body.setVelocityX(this.rollDir * CONFIG.ENEMY.DULYA.ROLL_SPEED);
          // Spin rapidly as a tucked ball, matching Omelko's roll animation!
          this.sprite.angle += this.rollDir * 24;

          if (time > this.nextRollDustTime && this.scene && this.scene.add) {
            this.nextRollDustTime = time + 55;
            const dust = this.scene.add.image(
              this.sprite.x - this.rollDir * 8,
              this.sprite.y + 10,
              'particle_dust'
            ).setDepth(33).setScale(0.75);
            this.scene.tweens.add({
              targets: dust,
              y: dust.y - 12,
              alpha: 0,
              scale: 0.2,
              duration: 210,
              onComplete: () => {
                if (dust && dust.active) dust.destroy();
              }
            });
          }

          // Check collision with Omelko: CANNOT be dodged by rolling [Shift] — Omelko MUST jump over the ball!
          const pBody = player.sprite.body;
          const dBody = this.sprite.body;
          const horizOverlap = Math.abs(player.sprite.x - this.sprite.x) < 25;
          const playerClearedAbove = pBody && dBody && (pBody.bottom <= dBody.top + 6);

          if (horizOverlap && !playerClearedAbove && Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            // Pass ignoreRoll = true so rolling on the ground does NOT dodge Dulya!
            player.takeDamage(CONFIG.ENEMY.DULYA.DAMAGE_ROLL, this.sprite.x, true);
            this.setRollingHitbox(false);
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(-this.rollDir * 130);
            this.stateEndTime = time + CONFIG.ENEMY.DULYA.COOLDOWN_MS;
            return;
          }

          const hitBoundary =
            (this.rollDir > 0 && (this.sprite.x >= this.maxX + 70 || this.sprite.body.blocked.right)) ||
            (this.rollDir < 0 && (this.sprite.x <= this.minX - 70 || this.sprite.body.blocked.left));

          if (time >= this.stateEndTime || hitBoundary) {
            // Demanding tavern rebound: 55% chance to immediately rebound back toward Omelko once!
            if (!this.hasRebounded && horizDist < 320 && Math.random() < 0.55) {
              this.hasRebounded = true;
              this.rollDir = dirToPlayer;
              this.sprite.setScale(1.16, 0.84);
              this.stateEndTime = time + Math.round(CONFIG.ENEMY.DULYA.ROLL_DURATION_MS * 0.72);
              if (SFX.dulyaRoll) SFX.dulyaRoll();
              return;
            }
            this.setRollingHitbox(false);
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(0.9, 1.14);
            this.stateEndTime = time + CONFIG.ENEMY.DULYA.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          this.sprite.setAngle(Math.sin(time * 0.025) * 5);
          if (time >= this.stateEndTime) {
            this.sprite.setAngle(0);
            this.state = 'PATROL';
          }
        }
      }
    }

    /**
     * SUBCLASS H: МІНІ-БОС ЛИХО З КОРЧМИ «КУЦИЙ ХВІСТ» (LykhoMiniBoss)
     * - Demanding 2-Stage crimson horned tavern chieftain wearing the Red Cossack Boots (Червоні Чоботи-Сап'янці).
     * - Features counter-attack protection after 2 hits in a window, plus 4 fierce attacks:
     *   1) Red-Booted Horned Charge (with Stage 2 reverse rebound blitz!)
     *   2) Shadow-Smoke Teleport Backstab right behind Omelko's back
     *   3) Tavern Floor Slam sending dual shockwaves + mug spray
     *   4) Triple Frothy Tankard Fan Volley
     * - Defeating him drops the Red Boots of Lykho ('loot_boots_lykho'), unlocking Roll-Stun [Shift]!
     */
    class LykhoMiniBoss extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'boss_lykho', CONFIG.ENEMY.BOSS_LYKHO.MAX_STUN);
        this.isMiniBoss = true;
        this.stage = 1;
        this.stagesRequired = CONFIG.ENEMY.BOSS_LYKHO.STAGES_REQUIRED || 2;
        this.sprite.body.setSize(54, 72);
        this.sprite.body.setOffset(15, 10);
        this.minX = minX !== undefined ? minX : 11040;
        this.maxX = maxX !== undefined ? maxX : 12180;
        this.facing = -1;
        this.sprite.setFlipX(true);

        // Prominent Mini-Boss overhead name & wider health bar (no emojis)
        this.barBg.setSize(92, 9);
        this.barFill.setPosition(-44, 0).setSize(88, 7);
        this.nameBadge = scene.add.text(0, -14, 'ЛИХО З КОРЧМИ', {
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ffd166',
          stroke: '#141622',
          strokeThickness: 3
        }).setOrigin(0.5);
        this.uiContainer.add(this.nameBadge);

        this.state = 'STALK'; // STALK, TELEGRAPH, CHARGE, POST_TELEPORT, BACKSTAB_STRIKE, JUMP_SLAM, COOLDOWN
        this.stateEndTime = 0;
        this.attackIndex = 0;
        this.nextMove = 'CHARGE';
        this.hasSpokenIntro = false;
        this.hitsTakenInWindow = 0;
        this.allowedWindowHits = 2;
        this.invulnUntil = 0;
        this.chargeReboundRemaining = 0;
      }

      spawnCrimsonSmoke(x, y) {
        if (!this.scene || !this.scene.add) return;
        for (let i = 0; i < 10; i++) {
          const puff = this.scene.add.circle(
            x + Phaser.Math.Between(-22, 22),
            y + Phaser.Math.Between(-26, 16),
            Phaser.Math.Between(8, 16),
            i % 2 === 0 ? 0xd90429 : 0x3c096c,
            0.85
          ).setDepth(36);
          this.scene.tweens.add({
            targets: puff,
            x: puff.x + Phaser.Math.Between(-36, 36),
            y: puff.y - Phaser.Math.Between(22, 48),
            scale: 1.9,
            alpha: 0,
            duration: 320,
            onComplete: () => {
              if (puff && puff.active) puff.destroy();
            }
          });
        }
      }

      teleportBehindOmelko(time, player) {
        if (!player || !player.sprite) return;
        this.spawnCrimsonSmoke(this.sprite.x, this.sprite.y);

        const desiredX = player.sprite.x - (player.facing || 1) * 56;
        const targetX = Phaser.Math.Clamp(desiredX, this.minX + 60, this.maxX - 60);
        const targetY = CONFIG.GROUND_Y - 42;

        this.sprite.setPosition(targetX, targetY);
        if (this.sprite.body) {
          this.sprite.body.setVelocity(0, 0);
        }
        this.facing = player.sprite.x >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(this.facing < 0);
        this.sprite.setScale(1.2, 0.84);
        this.spawnCrimsonSmoke(targetX, targetY);

        if (SFX.chortTeleport) SFX.chortTeleport();
        this.state = 'POST_TELEPORT';
        this.isTelegraphing = true;
        this.telegraphLabel.setText('!').setColor('#ff0055').setVisible(true);
        this.sprite.setTint(0xff0055);
        const postTelMs = (CONFIG.ENEMY.BOSS_LYKHO.POST_TELEPORT_MS || 230) * (this.stage >= 2 ? 0.86 : 1);
        this.stateEndTime = time + postTelMs;
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false, isCounter = false, isFrog = false, fromRollBoots = false) {
        if (this.isFinished) return;
        const now = this.scene ? this.scene.time.now : 0;

        if (now < this.invulnUntil) {
          SFX.shieldBlock();
          return;
        }

        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        this.hitsTakenInWindow++;
        const reduced = this.hitsTakenInWindow > this.allowedWindowHits
          ? Math.max(6, Math.round(stunAmount * 0.35))
          : stunAmount;

        super.receiveStunHit(reduced, fromX, isHeavy, isCounter, isFrog, fromRollBoots);

        // If still conscious after 2 hits, Lykho immediately counters so player cannot spam-lock him!
        if (!this.isStunned && !this.isFinished && this.hitsTakenInWindow >= this.allowedWindowHits) {
          this.hitsTakenInWindow = 0;
          if (this.scene && this.scene.player) {
            if (Math.random() < 0.55) {
              this.teleportBehindOmelko(now, this.scene.player);
            } else {
              this.facing = this.scene.player.sprite.x >= this.sprite.x ? 1 : -1;
              this.sprite.setFlipX(this.facing < 0);
              this.state = 'TELEGRAPH';
              this.isTelegraphing = true;
              this.nextMove = 'CHARGE';
              this.sprite.body.setVelocityX(0);
              this.telegraphLabel.setText('!').setColor('#ff002b').setVisible(true);
              this.sprite.setTint(0xffbe0b);
              this.stateEndTime = now + (CONFIG.ENEMY.BOSS_LYKHO.COUNTER_TELEGRAPH_MS || 220);
              SFX.telegraph();
            }
          }
        }
      }

      update(time, player) {
        if (!this.updateBase(time)) return;
        this.barFill.width = 88 * Phaser.Math.Clamp(1 - (this.stun / this.maxStun), 0, 1);

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const horizDist = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;
        const speedMult = this.stage >= 2 ? 1.18 : 1;
        const cdMult = this.stage >= 2 ? 0.78 : 1;

        if (!this.hasSpokenIntro && dist < 600) {
          this.hasSpokenIntro = true;
          this.scene.showOmelkoSpeech(STRINGS.OMELKO_REMARK_LYKHO_INTRO, 4600);
          SFX.lisovykRoar();
          return;
        }

        if (this.state === 'STALK') {
          this.facing = dirToPlayer;
          this.sprite.setFlipX(this.facing < 0);
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.BOSS_LYKHO.WALK_SPEED * speedMult);

          if (dist < 500) {
            const moves = ['CHARGE', 'TELEPORT_BACKSTAB', 'JUMP_SLAM', 'MUG_VOLLEY'];
            this.nextMove = moves[this.attackIndex % moves.length];
            this.attackIndex++;

            if (this.nextMove === 'TELEPORT_BACKSTAB') {
              this.teleportBehindOmelko(time, player);
              return;
            }

            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('!').setColor('#ff002b').setVisible(true);
            this.sprite.setTint(0xffbe0b);
            this.sprite.setScale(1.18, 0.84);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.TELEGRAPH_MS * (this.stage >= 2 ? 0.82 : 1);
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

            if (this.nextMove === 'CHARGE') {
              // Attack 1: Red-Booted Horned Charge (with rebound in Stage 2!)
              this.state = 'CHARGE';
              this.chargeReboundRemaining = this.stage >= 2 ? 1 : 0;
              this.sprite.setTint(0xff4d6d);
              this.stateEndTime = time + 560;
              SFX.roosterCrow();
            } else if (this.nextMove === 'JUMP_SLAM' && onFloor) {
              // Attack 2: High Tavern Slam tracking Omelko's X position!
              this.state = 'JUMP_SLAM';
              const jumpVx = Phaser.Math.Clamp((player.sprite.x - this.sprite.x) * 1.25, -280, 280);
              this.sprite.body.setVelocityY(CONFIG.ENEMY.BOSS_LYKHO.JUMP_VEL_Y);
              this.sprite.body.setVelocityX(jumpVx);
              this.stateEndTime = time + 1150;
              SFX.jump(true);
            } else {
              // Attack 3: Triple Banquet Tankard Fan Volley!
              if (this.scene && typeof this.scene.spawnKorchmaMug === 'function') {
                const offsets = this.stage >= 2 ? [-75, 0, 75, 135] : [-55, 10, 65];
                offsets.forEach((offX, idx) => {
                  this.scene.time.delayedCall(idx * 95, () => {
                    if (this.sprite && this.sprite.active && !this.isStunned && !this.isFinished) {
                      this.scene.spawnKorchmaMug(
                        this.sprite.x + this.facing * 20,
                        this.sprite.y - 18,
                        player.sprite.x + offX,
                        player.sprite.y - 10
                      );
                    }
                  });
                });
              }
              this.state = 'COOLDOWN';
              this.hitsTakenInWindow = 0;
              this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS * cdMult;
            }
          }
        } else if (this.state === 'POST_TELEPORT') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            this.state = 'BACKSTAB_STRIKE';
            this.sprite.setScale(1.28, 0.8);
            if (SFX.swing) SFX.swing(3, true);

            const slash = this.scene.add.image(this.sprite.x + this.facing * 42, this.sprite.y, 'saber_slash')
              .setDepth(37)
              .setFlipX(this.facing < 0)
              .setTint(0xff0055)
              .setScale(1.35);
            this.scene.tweens.add({
              targets: slash,
              alpha: 0,
              scaleX: 1.65,
              scaleY: 1.65,
              duration: 160,
              onComplete: () => { if (slash && slash.active) slash.destroy(); }
            });

            if (horizDist < 78 && Math.abs(player.sprite.y - this.sprite.y) < 68) {
              player.takeDamage(CONFIG.ENEMY.BOSS_LYKHO.DAMAGE_BACKSTAB || 24, this.sprite.x);
            }
            this.stateEndTime = time + 320;
          }
        } else if (this.state === 'BACKSTAB_STRIKE') {
          this.sprite.body.setVelocityX(this.facing * (CONFIG.ENEMY.BOSS_LYKHO.CHARGE_SPEED * 0.92));
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_LYKHO.DAMAGE_BACKSTAB || 24, this.sprite.x);
            this.state = 'COOLDOWN';
            this.hitsTakenInWindow = 0;
            this.sprite.body.setVelocityX(-this.facing * 120);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS * cdMult;
            return;
          }
          if (time >= this.stateEndTime) {
            this.state = 'COOLDOWN';
            this.hitsTakenInWindow = 0;
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS * cdMult;
          }
        } else if (this.state === 'CHARGE') {
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.BOSS_LYKHO.CHARGE_SPEED * speedMult);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_LYKHO.DAMAGE_CHARGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.hitsTakenInWindow = 0;
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(-this.facing * 130);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS * cdMult;
            return;
          }

          const hitEdge =
            this.sprite.body.blocked.left ||
            this.sprite.body.blocked.right ||
            this.sprite.x <= this.minX + 45 ||
            this.sprite.x >= this.maxX - 45;

          if (time >= this.stateEndTime || hitEdge) {
            if (this.chargeReboundRemaining > 0) {
              this.chargeReboundRemaining--;
              this.facing = dirToPlayer;
              this.sprite.setFlipX(this.facing < 0);
              this.sprite.setScale(1.22, 0.82);
              this.stateEndTime = time + 480;
              SFX.roosterCrow();
              return;
            }
            this.state = 'COOLDOWN';
            this.hitsTakenInWindow = 0;
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS * cdMult;
          }
        } else if (this.state === 'JUMP_SLAM') {
          if (onFloor && this.sprite.body.velocity.y >= 0 && time > this.stateEndTime - 920) {
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(1.32, 0.74);
            this.scene.cameras.main.shake(200, 0.012);
            this.scene.spawnShockwaves(this.sprite.x, CONFIG.GROUND_Y - 14);
            if (this.stage >= 2 && this.scene && typeof this.scene.spawnKorchmaMug === 'function') {
              this.scene.spawnKorchmaMug(this.sprite.x, this.sprite.y - 18, this.sprite.x - 190, this.sprite.y);
              this.scene.spawnKorchmaMug(this.sprite.x, this.sprite.y - 18, this.sprite.x + 190, this.sprite.y);
            }
            SFX.finisher();
            this.state = 'COOLDOWN';
            this.hitsTakenInWindow = 0;
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS * cdMult;
          } else if (time >= this.stateEndTime) {
            this.state = 'COOLDOWN';
            this.hitsTakenInWindow = 0;
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS * cdMult;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          if (time >= this.stateEndTime) {
            this.state = 'STALK';
          }
        }
      }

      triggerFinisher(fromX) {
        const now = this.scene ? this.scene.time.now : 0;
        if (this.stage < this.stagesRequired) {
          this.stage++;
          this.isStunned = false;
          this.stun = 0;
          this.hitsTakenInWindow = 0;
          this.invulnUntil = now + 900;
          this.barFill.setFillStyle(0xe63946);
          this.stunPrompt.setVisible(false);
          this.stars.forEach(s => s.setVisible(false));

          SFX.finisher();
          SFX.lisovykRoar();
          this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
          this.scene.cameras.main.shake(230, 0.014);
          this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 12);
          this.scene.showFloatingText(
            this.sprite.x,
            this.sprite.y - 72,
            STRINGS.BOSS_LYKHO_STAGE_2 || 'ЛИХО РОЗЛЮТИЛОСЯ! (Фаза 2)',
            '#ff4d6d'
          );

          // Launch into an immediate Jump Slam on phase transition!
          this.state = 'JUMP_SLAM';
          this.sprite.body.setVelocity(0, CONFIG.ENEMY.BOSS_LYKHO.JUMP_VEL_Y);
          this.stateEndTime = now + 1100;
          return;
        }

        const dropX = this.sprite.x;
        super.triggerFinisher(fromX);
        GAME_STATE.hasDefeatedLykho = true;
        if (this.scene && typeof this.scene.spawnLykhoBootsReward === 'function') {
          this.scene.spawnLykhoBootsReward(dropX, CONFIG.GROUND_Y - 28);
        }
      }
    }