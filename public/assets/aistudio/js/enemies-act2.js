
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

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.isFinished) return;

        // Once stunned (100% bar), any hit triggers the Comical Finisher!
        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        // Check if attack came from the FRONT (where the massive oak shield is held)
        const hitFromRight = fromX >= this.sprite.x;
        const isFrontalHit = (this.facing > 0 && hitFromRight) || (this.facing < 0 && !hitFromRight);

        if (isFrontalHit) {
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