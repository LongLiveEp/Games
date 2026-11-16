
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
     * - Hops onto tables, telegraphs with '!', and alternates between:
     *   1) Shadow-Smoke Teleport behind Omelko's back ('POST_TELEPORT' -> 'LUNGE')
     *   2) Hurling a foaming tavern tankard ('korchma_mug') in a parabola
     *   3) Horned headbutt lunge
     */
    class ChortEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_chort', CONFIG.ENEMY.CHORT.MAX_STUN);
        this.sprite.body.setSize(30, 44);
        this.sprite.body.setOffset(9, 6);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 160);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 160);
        this.walkDir = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, POST_TELEPORT, LUNGE, COOLDOWN
        this.stateEndTime = 0;
        this.nextHopTime = 0;
        this.attackCycle = 0;
        this.lastTeleportTime = 0;
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
            duration: 340,
            onComplete: () => {
              if (puff && puff.active) puff.destroy();
            }
          });
        }
      }

      teleportBehindPlayer(time, player) {
        if (!player || !player.sprite) return false;
        this.lastTeleportTime = time;
        this.spawnSmokePuff(this.sprite.x, this.sprite.y);

        // Compute target X right behind Omelko's back, clamped safely inside chunk/patrol bounds
        const chunkObj = (this.scene.levelData && this.scene.levelData.chunks && this.chunkId)
          ? this.scene.levelData.chunks[this.chunkId]
          : null;
        const boundMinX = chunkObj ? chunkObj.bounds.x + 85 : Math.max(80, this.minX - 90);
        const boundMaxX = chunkObj ? (chunkObj.bounds.x + chunkObj.bounds.width - 85) : (this.maxX + 90);

        const desiredX = player.sprite.x - (player.facing || 1) * 84;
        const targetX = Phaser.Math.Clamp(desiredX, boundMinX, boundMaxX);
        const targetY = Math.min(CONFIG.GROUND_Y - 38, player.sprite.y - 2);

        this.sprite.setPosition(targetX, targetY);
        if (this.sprite.body) {
          this.sprite.body.setVelocity(0, 0);
        }
        this.walkDir = player.sprite.x >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(this.walkDir < 0);
        this.sprite.setScale(0.75, 1.28);
        this.spawnSmokePuff(targetX, targetY);

        if (SFX.chortTeleport) SFX.chortTeleport();
        if (this.scene && this.scene.showFloatingText) {
          this.scene.showFloatingText(targetX, targetY - 52, STRINGS.CHORT_TELEPORT_WARN || '💨 Чорт за спиною!', '#ff9f1c');
        }

        // Brief post-teleport windup so Omelko can react (turn around or roll) before the lunge!
        this.state = 'POST_TELEPORT';
        this.isTelegraphing = true;
        this.telegraphLabel.setText('💨!').setColor('#ff0055').setVisible(true);
        this.sprite.setTint(0xff4d6d);
        this.stateEndTime = time + (CONFIG.ENEMY.CHORT.POST_TELEPORT_MS || 340);
        return true;
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false, isCounter = false, isFrog = false, fromRollBoots = false) {
        super.receiveStunHit(stunAmount, fromX, isHeavy, isCounter, isFrog, fromRollBoots);
        // If still conscious and teleport is off cooldown, 45% chance to vanish in smoke behind Omelko!
        const now = this.scene ? this.scene.time.now : 0;
        if (
          !this.isFinished &&
          !this.isStunned &&
          !fromRollBoots &&
          this.scene &&
          this.scene.player &&
          now - this.lastTeleportTime > (CONFIG.ENEMY.CHORT.TELEPORT_COOLDOWN_MS || 3400) &&
          Math.random() < 0.45
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
          if (onFloor && time >= this.nextHopTime && Math.random() < 0.035) {
            this.sprite.body.setVelocityY(-280);
            this.nextHopTime = time + 900;
          }

          if (dist < CONFIG.ENEMY.CHORT.AGGRO_RANGE && vertDist < 170) {
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
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.attackCycle++;

            const canTeleport =
              horizDist < 340 &&
              vertDist < 130 &&
              (time - this.lastTeleportTime > (CONFIG.ENEMY.CHORT.TELEPORT_COOLDOWN_MS || 3400));

            if (canTeleport && (this.attackCycle % 2 === 0 || horizDist < 130)) {
              // Teleport in sulfurous smoke right behind Omelko's back!
              this.teleportBehindPlayer(time, player);
            } else if (horizDist > 135 && this.attackCycle % 2 === 1) {
              // Hurl a frothy tavern mug in a parabola!
              this.sprite.setScale(0.86, 1.2);
              if (this.scene && typeof this.scene.spawnKorchmaMug === 'function') {
                this.scene.spawnKorchmaMug(this.sprite.x, this.sprite.y - 10, player.sprite.x, player.sprite.y);
              }
              this.state = 'COOLDOWN';
              this.stateEndTime = time + CONFIG.ENEMY.CHORT.COOLDOWN_MS;
            } else {
              // Horned headbutt lunge!
              this.state = 'LUNGE';
              this.walkDir = dirToPlayer;
              this.sprite.setFlipX(this.walkDir < 0);
              if (onFloor) {
                this.sprite.body.setVelocityY(-240);
              }
              this.stateEndTime = time + 460;
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
            this.state = 'LUNGE';
            this.walkDir = dirToPlayer;
            this.sprite.setFlipX(this.walkDir < 0);
            if (onFloor) {
              this.sprite.body.setVelocityY(-210);
            }
            this.stateEndTime = time + 430;
            if (SFX.chortLaugh) SFX.chortLaugh();
          }
        } else if (this.state === 'LUNGE') {
          this.sprite.body.setVelocityX(this.walkDir * CONFIG.ENEMY.CHORT.LUNGE_SPEED);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.CHORT.DAMAGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(-this.walkDir * 110);
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
     * - Folkloric tavern creature from «Як козаки на весіллі гуляли»:
     *   a giant one-eyed clenched fist ("дуля") wearing a white embroidered shirt with long sleeves.
     * - Curls into a compact fist-ball and rolls rapidly across the tavern floor at Omelko!
     * - Omelko must JUMP OVER [↑] the rolling ball and strike when Dulya stops to catch its breath!
     */
    class DulyaEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_dulya', CONFIG.ENEMY.DULYA.MAX_STUN);
        this.sprite.body.setSize(38, 48);
        this.sprite.body.setOffset(9, 10);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 200);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 200);
        this.walkDir = -1;
        this.rollDir = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, ROLL_ATTACK, COOLDOWN
        this.stateEndTime = 0;
        this.lastBlockTextTime = 0;
      }

      setRollingHitbox(isRolling) {
        if (!this.sprite || !this.sprite.body) return;
        if (isRolling) {
          // Low compact ball hitbox so Omelko can cleanly jump over it!
          this.sprite.body.setSize(36, 28);
          this.sprite.body.setOffset(10, 26);
        } else {
          this.sprite.body.setSize(38, 48);
          this.sprite.body.setOffset(9, 10);
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

        // While rolling as a clenched fist-ball on the floor, ground frontal melee strikes bounce off
        // (unless Omelko is jumping over it from above, throwing a Galushka/Frog, or using Roll-Stun Boots!)
        if (this.state === 'ROLL_ATTACK' && !fromRollBoots && !isFrog) {
          const playerAbove =
            this.scene &&
            this.scene.player &&
            this.scene.player.sprite &&
            this.scene.player.sprite.y < this.sprite.y - 22;
          if (!playerAbove) {
            SFX.shieldBlock();
            this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, 4);
            const now = this.scene ? this.scene.time.now : 0;
            if (now - this.lastBlockTextTime > 650 && this.scene && this.scene.showFloatingText) {
              this.lastBlockTextTime = now;
              this.scene.showFloatingText(
                this.sprite.x,
                this.sprite.y - 54,
                STRINGS.DULYA_BLOCK_WARN || '✊ Дуля котиться кулаком! Перестрибуй [↑]!',
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
          this.sprite.setFlipX(this.walkDir > 0); // Fist thumb faces forward
          this.sprite.setAngle(Math.sin(time * 0.01) * 4);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.walkDir = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.walkDir = 1;

          if (horizDist < CONFIG.ENEMY.DULYA.AGGRO_RANGE && vertDist < 120) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.rollDir = dirToPlayer;
            this.sprite.setFlipX(this.rollDir > 0);
            this.sprite.body.setVelocityX(0);
            this.sprite.setAngle(0);
            this.telegraphLabel.setText('✊!').setColor('#ffd166').setVisible(true);
            this.sprite.setTint(0xff9f1c);
            this.sprite.setScale(1.24, 0.76); // Curl into a tight ball!
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
            this.sprite.setScale(0.92, 0.88);
            this.stateEndTime = time + CONFIG.ENEMY.DULYA.ROLL_DURATION_MS;
            if (SFX.dulyaRoll) SFX.dulyaRoll();
          }
        } else if (this.state === 'ROLL_ATTACK') {
          this.sprite.body.setVelocityX(this.rollDir * CONFIG.ENEMY.DULYA.ROLL_SPEED);
          // Spin rapidly like a bowling ball!
          this.sprite.angle += this.rollDir * 19;

          // Check collision with Omelko (if Omelko didn't jump over Dulya!)
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.DULYA.DAMAGE_ROLL, this.sprite.x);
            this.setRollingHitbox(false);
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(-this.rollDir * 120);
            this.stateEndTime = time + CONFIG.ENEMY.DULYA.COOLDOWN_MS;
            return;
          }

          const hitBoundary =
            (this.rollDir > 0 && (this.sprite.x >= this.maxX + 60 || this.sprite.body.blocked.right)) ||
            (this.rollDir < 0 && (this.sprite.x <= this.minX - 60 || this.sprite.body.blocked.left));

          if (time >= this.stateEndTime || hitBoundary) {
            this.setRollingHitbox(false);
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(0.88, 1.16);
            this.stateEndTime = time + CONFIG.ENEMY.DULYA.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          this.sprite.setAngle(Math.sin(time * 0.025) * 6); // Catching breath after rolling
          if (time >= this.stateEndTime) {
            this.sprite.setAngle(0);
            this.state = 'PATROL';
          }
        }
      }
    }

    /**
     * SUBCLASS H: МІНІ-БОС ЛИХО З КОРЧМИ «КУЦИЙ ХВІСТ» (LykhoMiniBoss)
     * - The crimson horned tavern chief wearing the legendary Red Cossack Boots (Червоні Чоботи-Сап'янці).
     * - Attacks with:
     *   1) Red-Booted Horned Charge across the banquet hall
     *   2) Tavern Floor Slam sending dual shockwaves across the floor
     *   3) Double Frothy Tankard Volley
     * - Defeating him drops the Red Boots of Lykho ('loot_boots_lykho'), unlocking Roll-Stun [Shift]!
     */
    class LykhoMiniBoss extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'boss_lykho', CONFIG.ENEMY.BOSS_LYKHO.MAX_STUN);
        this.isMiniBoss = true;
        this.sprite.body.setSize(54, 72);
        this.sprite.body.setOffset(15, 10);
        this.minX = minX !== undefined ? minX : 9990;
        this.maxX = maxX !== undefined ? maxX : 10890;
        this.facing = -1;
        this.sprite.setFlipX(true);

        // Prominent Mini-Boss overhead name & wider health bar
        this.barBg.setSize(88, 9);
        this.barFill.setPosition(-42, 0).setSize(84, 7);
        this.nameBadge = scene.add.text(0, -14, '🔥 ЛИХО З КОРЧМИ', {
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ffd166',
          stroke: '#141622',
          strokeThickness: 3
        }).setOrigin(0.5);
        this.uiContainer.add(this.nameBadge);

        this.state = 'STALK'; // STALK, TELEGRAPH, CHARGE, JUMP_SLAM, MUG_VOLLEY, COOLDOWN
        this.stateEndTime = 0;
        this.attackIndex = 0;
        this.hasSpokenIntro = false;
      }

      update(time, player) {
        if (!this.updateBase(time)) return;
        this.barFill.width = 84 * Phaser.Math.Clamp(1 - (this.stun / this.maxStun), 0, 1);

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        if (!this.hasSpokenIntro && dist < 560) {
          this.hasSpokenIntro = true;
          this.scene.showOmelkoSpeech(STRINGS.OMELKO_REMARK_LYKHO_INTRO, 5000);
          SFX.lisovykRoar();
        }

        if (this.state === 'STALK') {
          this.facing = dirToPlayer;
          this.sprite.setFlipX(this.facing < 0);
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.BOSS_LYKHO.WALK_SPEED);

          if (dist < 460) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('!').setColor('#ff002b').setVisible(true);
            this.sprite.setTint(0xffbe0b);
            this.sprite.setScale(1.16, 0.86);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.TELEGRAPH_MS;
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

            const move = this.attackIndex % 3;
            this.attackIndex++;

            if (move === 0) {
              // Attack 1: Red-Booted Horned Charge!
              this.state = 'CHARGE';
              this.sprite.setTint(0xff4d6d);
              this.stateEndTime = time + 620;
              SFX.roosterCrow();
            } else if (move === 1 && onFloor) {
              // Attack 2: High Tavern Slam with Dual Shockwaves!
              this.state = 'JUMP_SLAM';
              this.sprite.body.setVelocityY(CONFIG.ENEMY.BOSS_LYKHO.JUMP_VEL_Y);
              this.sprite.body.setVelocityX(this.facing * 170);
              this.slamLanded = false;
              this.stateEndTime = time + 1200;
              SFX.jump(true);
            } else {
              // Attack 3: Banquet Tankard Volley (throws 2 frothy mugs)!
              if (this.scene && typeof this.scene.spawnKorchmaMug === 'function') {
                this.scene.spawnKorchmaMug(this.sprite.x, this.sprite.y - 18, player.sprite.x - 45, player.sprite.y);
                this.scene.spawnKorchmaMug(this.sprite.x, this.sprite.y - 18, player.sprite.x + 45, player.sprite.y);
              }
              this.state = 'COOLDOWN';
              this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS;
            }
          }
        } else if (this.state === 'CHARGE') {
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.BOSS_LYKHO.CHARGE_SPEED);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.BOSS_LYKHO.DAMAGE_CHARGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(-this.facing * 120);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS;
            return;
          }

          if (time >= this.stateEndTime || this.sprite.body.blocked.left || this.sprite.body.blocked.right) {
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS;
          }
        } else if (this.state === 'JUMP_SLAM') {
          if (onFloor && this.sprite.body.velocity.y >= 0 && time > this.stateEndTime - 950) {
            this.sprite.body.setVelocityX(0);
            this.sprite.setScale(1.32, 0.74);
            this.scene.cameras.main.shake(200, 0.012);
            this.scene.spawnShockwaves(this.sprite.x, CONFIG.GROUND_Y - 14);
            SFX.finisher();
            this.state = 'COOLDOWN';
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS;
          } else if (time >= this.stateEndTime) {
            this.state = 'COOLDOWN';
            this.stateEndTime = time + CONFIG.ENEMY.BOSS_LYKHO.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          if (time >= this.stateEndTime) {
            this.state = 'STALK';
          }
        }
      }

      triggerFinisher(fromX) {
        const dropX = this.sprite.x;
        super.triggerFinisher(fromX);
        GAME_STATE.hasDefeatedLykho = true;
        if (this.scene && typeof this.scene.spawnLykhoBootsReward === 'function') {
          this.scene.spawnLykhoBootsReward(dropX, CONFIG.GROUND_Y - 28);
        }
      }
    }