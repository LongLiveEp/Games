
    /**
     * SUBCLASS A: Guard Goose (Гусак-охоронець)
     * Patrols back and forth; can flap its wings to fly-jump onto higher platforms
     * and chase the Cossack after a clear 0.5s telegraph!
     */
    class GooseEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_goose', CONFIG.ENEMY.GOOSE.MAX_STUN);
        this.minX = minX;
        this.maxX = maxX;
        this.patrolDir = 1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, CHARGE, COOLDOWN
        this.stateEndTime = 0;
        this.chargeDir = 1;
        this.nextJumpAllowedTime = 0;
      }

      tryWingJump(time, boostFactor = 1) {
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;
        if (!onFloor || time < this.nextJumpAllowedTime) return false;

        this.nextJumpAllowedTime = time + CONFIG.ENEMY.GOOSE.JUMP_COOLDOWN_MS;
        this.sprite.body.setVelocityY(CONFIG.ENEMY.GOOSE.JUMP_VELOCITY * boostFactor);
        this.sprite.setScale(0.78, 1.28);
        SFX.jump(true);

        // Feather / dust puff under wings
        for (let i = 0; i < 3; i++) {
          const p = this.scene.add.image(
            this.sprite.x + Phaser.Math.Between(-12, 12),
            this.sprite.y + 16,
            'particle_dust'
          ).setScale(0.75).setDepth(29);
          this.scene.tweens.add({
            targets: p,
            y: p.y + 14,
            alpha: 0,
            duration: 240,
            onComplete: () => p.destroy()
          });
        }
        return true;
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const distToPlayer = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const verticalDiff = this.sprite.y - player.sprite.y; // Positive when player is higher than goose
        const playerWithinHeight = Math.abs(verticalDiff) < 190;

        if (this.state === 'PATROL') {
          this.sprite.body.setVelocityX(this.patrolDir * CONFIG.ENEMY.GOOSE.PATROL_SPEED);
          this.sprite.setFlipX(this.patrolDir < 0);

          if (this.sprite.x >= this.maxX) this.patrolDir = -1;
          if (this.sprite.x <= this.minX) this.patrolDir = 1;

          // Occasionally flutter up onto a nearby elevated platform while patrolling
          if (Math.random() < 0.008) {
            this.tryWingJump(time, 0.92);
          }

          // Spot player (even on a higher platform!) and start clearly telegraphed attack
          if (distToPlayer < CONFIG.ENEMY.GOOSE.AGGRO_RANGE && playerWithinHeight) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.chargeDir = player.sprite.x >= this.sprite.x ? 1 : -1;
            this.sprite.setFlipX(this.chargeDir < 0);
            this.sprite.body.setVelocityX(0);
            this.sprite.setTint(0xffbe0b);
            this.telegraphLabel.setVisible(true);
            this.stateEndTime = time + CONFIG.ENEMY.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.state = 'CHARGE';
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.setTint(0xff6b6b);
            this.stateEndTime = time + 800;

            // If player is on a platform above the goose, flap wings and leap upward!
            if (verticalDiff > 42) {
              this.tryWingJump(time, verticalDiff > 115 ? 1.08 : 0.96);
            }
          }
        } else if (this.state === 'CHARGE') {
          this.sprite.body.setVelocityX(this.chargeDir * CONFIG.ENEMY.GOOSE.CHARGE_SPEED);

          // If player jumps higher mid-charge or goose bumps into a step, flutter up!
          if (verticalDiff > 50 || this.sprite.body.blocked.left || this.sprite.body.blocked.right) {
            this.tryWingJump(time, 0.98);
          }

          // Check collision with player during charge; end charge after landing a hit so it never multi-hits
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.GOOSE.DAMAGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(-this.chargeDir * 110);
            this.stateEndTime = time + CONFIG.ENEMY.GOOSE.COOLDOWN_MS;
            return;
          }
          if (time >= this.stateEndTime) {
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.GOOSE.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          if (time >= this.stateEndTime) {
            this.state = 'PATROL';
          }
        }
      }
    }

    /**
     * SUBCLASS B: Pesyholovets / Leshy (Песиголовець)
     * Runs on the ground surface, dives underground to hide from Omelko when he gets close,
     * can leap back up to the surface, and hurls stones!
     */
    class LeshyEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX, stayOnSurface = false) {
        super(scene, x, y, 'enemy_leshy', CONFIG.ENEMY.LESHY.MAX_STUN);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 180);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 180);
        this.stayOnSurface = Boolean(stayOnSurface || (scene && scene.currentLevel === 1) || x >= 4200);
        this.walkDir = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, COOLDOWN
        this.stateEndTime = 0;
        this.nextThrowTime = 0;
        this.burrowPassUntil = 0;
        this.nextBurrowTime = scene.time.now + Phaser.Math.Between(900, 1800);
      }

      isUnderground() {
        if (this.stayOnSurface) return false;
        return this.sprite.body.bottom > CONFIG.GROUND_Y + 22;
      }

      diveUnderground(time) {
        if (this.stayOnSurface) return;
        this.burrowPassUntil = time + 480;
        this.nextBurrowTime = time + CONFIG.ENEMY.LESHY.BURROW_COOLDOWN_MS;
        this.sprite.y += 10;
        this.sprite.body.setVelocityY(290);
        this.sprite.setScale(0.75, 1.28);
        SFX.roll();

        // Dirt/pebble burst when burrowing underground
        for (let i = 0; i < 5; i++) {
          const d = this.scene.add.image(
            this.sprite.x + Phaser.Math.Between(-14, 14),
            CONFIG.GROUND_Y + 4,
            'particle_dust'
          ).setTint(0x6f4518).setScale(0.85);
          this.scene.tweens.add({
            targets: d,
            y: d.y - Phaser.Math.Between(12, 28),
            x: d.x + Phaser.Math.Between(-18, 18),
            alpha: 0,
            duration: 320,
            onComplete: () => d.destroy()
          });
        }
      }

      leapToSurface(time) {
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;
        if (!onFloor) return;

        this.nextBurrowTime = time + CONFIG.ENEMY.LESHY.BURROW_COOLDOWN_MS;
        this.sprite.body.setVelocityY(CONFIG.ENEMY.LESHY.SURFACE_JUMP_VEL);
        this.sprite.setScale(0.78, 1.26);
        SFX.jump(false);

        for (let i = 0; i < 4; i++) {
          const d = this.scene.add.image(
            this.sprite.x + Phaser.Math.Between(-12, 12),
            this.sprite.y + 18,
            'particle_dust'
          ).setTint(0x6f4518).setScale(0.8);
          this.scene.tweens.add({
            targets: d,
            y: d.y - 16,
            alpha: 0,
            duration: 280,
            onComplete: () => d.destroy()
          });
        }
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const horizDist = Math.abs(this.sprite.x - player.sprite.x);
        const playerUnderground = player.sprite.body.bottom > CONFIG.GROUND_Y + 20;
        const selfUnderground = this.isUnderground();
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        // Dynamic surface <-> underground transitions:
        // 1. If on the surface and Omelko approaches on the surface, hide underground!
        if (!selfUnderground && !playerUnderground && onFloor && horizDist < CONFIG.ENEMY.LESHY.HIDE_DISTANCE && time >= this.nextBurrowTime) {
          this.diveUnderground(time);
        }
        // 2. If underground and Omelko either chases down into the tunnel OR moves away on the surface, leap back up to the surface!
        else if (selfUnderground && onFloor && time >= this.nextBurrowTime) {
          if ((playerUnderground && horizDist < 140) || (!playerUnderground && horizDist > 260 && horizDist < 460)) {
            this.leapToSurface(time);
          }
        }

        if (this.state === 'PATROL') {
          this.sprite.body.setVelocityX(this.walkDir * CONFIG.ENEMY.LESHY.WALK_SPEED);
          this.sprite.setFlipX(this.walkDir < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) {
            this.walkDir = -1;
          } else if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) {
            this.walkDir = 1;
          }

          if (dist < CONFIG.ENEMY.LESHY.AGGRO_RANGE && time >= this.nextThrowTime) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.sprite.body.setVelocityX(0);
            const faceDir = player.sprite.x >= this.sprite.x ? 1 : -1;
            this.sprite.setFlipX(faceDir < 0);
            this.telegraphLabel.setVisible(true);
            this.sprite.setTint(0xffbe0b);
            this.sprite.setScale(1.15, 0.85);
            this.stateEndTime = time + CONFIG.ENEMY.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.sprite.setScale(0.85, 1.2);
            this.scene.spawnPinecone(this.sprite.x, this.sprite.y - 10, player.sprite.x, player.sprite.y);
            this.state = 'COOLDOWN';
            this.stateEndTime = time + 320;
            this.nextThrowTime = time + CONFIG.ENEMY.LESHY.COOLDOWN_MS;

            // After throwing a stone on the surface, often duck underground to evade retaliation
            if (!selfUnderground && onFloor && horizDist < 290 && time >= this.nextBurrowTime) {
              this.diveUnderground(time);
            }
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.walkDir * (CONFIG.ENEMY.LESHY.WALK_SPEED * 0.65));
          if (time >= this.stateEndTime) {
            this.state = 'PATROL';
          }
        }
      }
    }

    /**
     * SUBCLASS C: Chick (Курча — summoned by the Mad Rooster Boss)
     */
    class ChickEnemy extends Enemy {
      constructor(scene, x, y) {
        super(scene, x, y, 'enemy_chick', CONFIG.ENEMY.CHICK.MAX_STUN);
        this.nextHopTime = 0;
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dir = player.sprite.x >= this.sprite.x ? 1 : -1;
        this.sprite.setFlipX(dir < 0);
        this.sprite.body.setVelocityX(dir * CONFIG.ENEMY.CHICK.SPEED);

        if ((this.sprite.body.blocked.down || this.sprite.body.touching.down) && time > this.nextHopTime) {
          this.sprite.body.setVelocityY(-240);
          this.nextHopTime = time + Phaser.Math.Between(600, 1000);
        }

        if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
          player.takeDamage(CONFIG.ENEMY.CHICK.DAMAGE, this.sprite.x);
        }
      }
    }

    /**
     * SUBCLASS D: Cellar Rat (Льоховий Щур-Злодюжка — nimble cellar pest that hops over thrown galushkas,
     * pounces with its incisors, and snatches a galushka or coin on hit until stunned!)
     */
    class CellarRatEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_cellar_rat', CONFIG.ENEMY.CELLAR_RAT.MAX_STUN);
        this.sprite.body.setSize(34, 20);
        this.sprite.body.setOffset(4, 6);
        this.minX = minX !== undefined ? minX : x - 180;
        this.maxX = maxX !== undefined ? maxX : x + 180;
        this.state = 'SCURRY'; // SCURRY, TELEGRAPH, POUNCE, FLEE_DASH, COOLDOWN
        this.dir = -1;
        this.stateEndTime = 0;
        this.dodgeCooldownUntil = 0;
        this.nextFleeHopTime = 0;
        this.stolenType = null; // 'galushka' | 'coin' | null
        this.stolenIcon = scene.add.image(x, y - 16, 'loot_galushka').setScale(0.75).setDepth(31).setVisible(false);
      }

      returnStolenLoot() {
        if (!this.stolenType || !this.scene || !this.scene.player) return;
        const type = this.stolenType;
        this.stolenType = null;
        if (this.stolenIcon) this.stolenIcon.setVisible(false);
        SFX.pickup();
        if (type === 'galushka') {
          this.scene.player.galushkas = Math.min(CONFIG.PLAYER.MAX_GALUSHKAS, this.scene.player.galushkas + 1);
          this.scene.showFloatingText(
            this.sprite.x,
            this.sprite.y - 44,
            STRINGS.RAT_RETURNED_GALUSHKA || '+1 Галушку повернуто!',
            '#ffd166'
          );
        } else if (type === 'coin') {
          this.scene.player.coins += 1;
          this.scene.showFloatingText(
            this.sprite.x,
            this.sprite.y - 44,
            STRINGS.RAT_RETURNED_COIN || '+1 Червінець повернуто!',
            '#ffd166'
          );
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        const wasStunned = this.isStunned;
        super.receiveStunHit(stunAmount, fromX, isHeavy);
        if ((!wasStunned && this.isStunned) || this.isFinished) {
          this.returnStolenLoot();
        }
      }

      triggerFinisher(fromX) {
        this.returnStolenLoot();
        if (this.stolenIcon) {
          this.stolenIcon.destroy();
          this.stolenIcon = null;
        }
        super.triggerFinisher(fromX);
      }

      destroyEnemy() {
        if (this.stolenIcon) {
          this.stolenIcon.destroy();
          this.stolenIcon = null;
        }
        super.destroyEnemy();
      }

      checkGalushkaDodge(time, onFloor) {
        if (!onFloor || time < this.dodgeCooldownUntil || !this.scene || !this.scene.galushkaGroup) return false;
        const projectiles = this.scene.galushkaGroup.getChildren();
        for (let i = 0; i < projectiles.length; i++) {
          const proj = projectiles[i];
          if (!proj || !proj.active || !proj.body) continue;
          const dx = proj.x - this.sprite.x;
          const dy = Math.abs(proj.y - this.sprite.y);
          const headingToRat = (dx < 0 && proj.body.velocity.x > 40) || (dx > 0 && proj.body.velocity.x < -40);
          if (headingToRat && Math.abs(dx) < 175 && dy < 52) {
            this.dodgeCooldownUntil = time + CONFIG.ENEMY.CELLAR_RAT.DODGE_COOLDOWN_MS;
            this.sprite.body.setVelocityY(CONFIG.ENEMY.CELLAR_RAT.HOP_DODGE_VEL_Y);
            this.sprite.setScale(0.82, 1.28);
            SFX.jump();
            this.scene.showFloatingText(
              this.sprite.x,
              this.sprite.y - 36,
              STRINGS.RAT_DODGED_HINT || 'Шмиг!',
              '#ffd166'
            );
            return true;
          }
        }
        return false;
      }

      update(time, player) {
        if (this.stolenIcon && this.stolenIcon.active) {
          this.stolenIcon.setPosition(this.sprite.x - this.dir * 4, this.sprite.y - 16);
          this.stolenIcon.setVisible(!this.isFinished && Boolean(this.stolenType));
        }

        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        // Reactive hop-dodge over incoming thrown galushkas while scurrying or fleeing
        if (this.state === 'SCURRY' || this.state === 'FLEE_DASH') {
          this.checkGalushkaDodge(time, onFloor);
        }

        if (this.state === 'SCURRY') {
          this.sprite.body.setVelocityX(this.dir * CONFIG.ENEMY.CELLAR_RAT.SCURRY_SPEED);
          this.sprite.setFlipX(this.dir < 0);

          if (onFloor) {
            this.sprite.scaleY = 1 + Math.sin(time * 0.032) * 0.08;
          }

          if (this.sprite.x <= this.minX) this.dir = 1;
          if (this.sprite.x >= this.maxX) this.dir = -1;
          if (this.sprite.body.blocked.left) this.dir = 1;
          if (this.sprite.body.blocked.right) this.dir = -1;

          if (dist < CONFIG.ENEMY.CELLAR_RAT.AGGRO_RANGE && Math.abs(player.sprite.y - this.sprite.y) < 105 && onFloor) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.dir = dirToPlayer;
            this.sprite.setFlipX(this.dir < 0);
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('!').setColor('#ffbe0b').setVisible(true);
            this.sprite.setTint(0xff9f1c);
            this.sprite.setScale(0.84, 1.26);
            this.stateEndTime = time + CONFIG.ENEMY.CELLAR_RAT.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.setTint(0xff6b6b);
            this.state = 'POUNCE';
            this.dir = dirToPlayer;
            this.sprite.setFlipX(this.dir < 0);
            this.sprite.setScale(1.28, 0.78);
            this.sprite.body.setVelocity(
              this.dir * CONFIG.ENEMY.CELLAR_RAT.POUNCE_SPEED_X,
              CONFIG.ENEMY.CELLAR_RAT.POUNCE_VEL_Y
            );
            this.stateEndTime = time + 480;
          }
        } else if (this.state === 'POUNCE') {
          this.sprite.body.setVelocityX(this.dir * CONFIG.ENEMY.CELLAR_RAT.POUNCE_SPEED_X);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            const hitLanded = player.takeDamage(CONFIG.ENEMY.CELLAR_RAT.DAMAGE, this.sprite.x);
            if (hitLanded && !this.stolenType) {
              if (player.galushkas > 0) {
                player.galushkas--;
                this.stolenType = 'galushka';
                if (this.stolenIcon) {
                  this.stolenIcon.setTexture(GAME_STATE.hasSwampFrogs ? 'swamp_frog' : 'loot_galushka');
                }
                this.scene.showFloatingText(
                  player.sprite.x,
                  player.sprite.y - 50,
                  STRINGS.RAT_STOLE_GALUSHKA || 'Щур поцупив галушку!',
                  '#ffbe0b'
                );
              } else if (player.coins > 0) {
                player.coins--;
                this.stolenType = 'coin';
                if (this.stolenIcon) {
                  this.stolenIcon.setTexture('loot_coin');
                }
                this.scene.showFloatingText(
                  player.sprite.x,
                  player.sprite.y - 50,
                  STRINGS.RAT_STOLE_COIN || 'Щур поцупив червінець!',
                  '#ffbe0b'
                );
              }
            }
            this.sprite.clearTint();
            this.dir = -dirToPlayer;
            this.sprite.setFlipX(this.dir < 0);
            if (this.stolenType) {
              this.state = 'FLEE_DASH';
              this.stateEndTime = time + 2600;
              this.nextFleeHopTime = time + 260;
            } else {
              this.state = 'COOLDOWN';
              this.sprite.body.setVelocityX(this.dir * 130);
              this.stateEndTime = time + CONFIG.ENEMY.CELLAR_RAT.COOLDOWN_MS;
            }
            return;
          }

          if (time >= this.stateEndTime || (onFloor && time >= this.stateEndTime - 210)) {
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.CELLAR_RAT.COOLDOWN_MS;
          }
        } else if (this.state === 'FLEE_DASH') {
          this.sprite.body.setVelocityX(this.dir * CONFIG.ENEMY.CELLAR_RAT.FLEE_SPEED);
          this.sprite.setFlipX(this.dir < 0);

          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.dir = 1;
          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.dir = -1;

          if (onFloor && time >= this.nextFleeHopTime) {
            this.sprite.body.setVelocityY(-230);
            this.nextFleeHopTime = time + Phaser.Math.Between(360, 620);
          }

          if (time >= this.stateEndTime) {
            this.state = 'SCURRY';
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.82);
          if (time >= this.stateEndTime) {
            this.state = 'SCURRY';
          }
        }
      }
    }

    /**
     * SUBCLASS E: Windmill Attic Bat (Млиновий Кажан — hangs from dark attic rafters or flutters in waves,
     * emits a sonic echolocation ring telegraph, and swoops down in fast V-dives!)
     */
    class MillBatEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX, startRoosting = false) {
        super(scene, x, y, 'enemy_mill_bat', CONFIG.ENEMY.MILL_BAT.MAX_STUN);
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setSize(38, 24);
        this.sprite.body.setOffset(4, 4);
        this.baseY = y;
        this.minX = minX !== undefined ? minX : x - 220;
        this.maxX = maxX !== undefined ? maxX : x + 220;
        this.flyDir = -1;
        this.state = startRoosting ? 'ROOST' : 'FLUTTER'; // ROOST, FLUTTER, TELEGRAPH, SWOOP, CLIMB, COOLDOWN
        this.stateEndTime = 0;
        this.sonicRing = scene.add.graphics().setDepth(29);
        if (this.state === 'ROOST') {
          this.sprite.setFlipY(true);
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        const wasStunned = this.isStunned;
        super.receiveStunHit(stunAmount, fromX, isHeavy);
        if ((!wasStunned && this.isStunned) || this.isFinished) {
          this.sprite.setFlipY(false);
          this.sprite.body.setAllowGravity(true);
          if (this.sonicRing) this.sonicRing.clear();
        }
      }

      triggerFinisher(fromX) {
        if (this.sonicRing) {
          this.sonicRing.destroy();
          this.sonicRing = null;
        }
        super.triggerFinisher(fromX);
      }

      destroyEnemy() {
        if (this.sonicRing) {
          this.sonicRing.destroy();
          this.sonicRing = null;
        }
        super.destroyEnemy();
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        // Restore flight if stun expired without finisher
        if (this.sprite.body.allowGravity) {
          this.sprite.body.setAllowGravity(false);
        }

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'ROOST') {
          this.sprite.body.setVelocity(0, 0);
          this.sprite.setFlipY(true);
          if (dist < CONFIG.ENEMY.MILL_BAT.WAKE_RANGE) {
            this.state = 'FLUTTER';
            this.sprite.setFlipY(false);
            this.flyDir = dirToPlayer;
            this.baseY = Math.max(115, Math.min(240, this.sprite.y + 42));
            this.sprite.body.setVelocityY(120);
          }
        } else if (this.state === 'FLUTTER') {
          this.sprite.setFlipY(false);
          this.sprite.body.setVelocityX(this.flyDir * CONFIG.ENEMY.MILL_BAT.FLY_SPEED);
          this.sprite.body.setVelocityY(Math.sin(time * 0.008 + this.minX) * 58);
          this.sprite.setFlipX(this.flyDir < 0);
          // Wingbeat flutter
          this.sprite.scaleY = 1 + Math.sin(time * 0.036) * 0.14;

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.flyDir = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.flyDir = 1;

          if (dist < CONFIG.ENEMY.MILL_BAT.AGGRO_RANGE) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.flyDir = dirToPlayer;
            this.sprite.setFlipX(this.flyDir < 0);
            this.sprite.body.setVelocity(0, 0);
            this.telegraphLabel.setText('!').setColor('#ff9f1c').setVisible(true);
            this.sprite.setTint(0xc77dff);
            this.stateEndTime = time + CONFIG.ENEMY.MILL_BAT.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocity(0, 0);
          if (this.sonicRing) {
            this.sonicRing.clear();
            const progress = Phaser.Math.Clamp(
              1 - (this.stateEndTime - time) / CONFIG.ENEMY.MILL_BAT.TELEGRAPH_MS,
              0,
              1
            );
            this.sonicRing.lineStyle(2.5, 0xff9f1c, 0.85 * (1 - progress * 0.5));
            this.sonicRing.strokeCircle(this.sprite.x, this.sprite.y, 10 + progress * 34);
            this.sonicRing.lineStyle(1.5, 0xc77dff, 0.7 * (1 - progress * 0.4));
            this.sonicRing.strokeCircle(this.sprite.x, this.sprite.y, 4 + progress * 20);
          }

          if (time >= this.stateEndTime) {
            if (this.sonicRing) this.sonicRing.clear();
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.state = 'SWOOP';
            const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y - 8);
            this.flyDir = Math.cos(angle) >= 0 ? 1 : -1;
            this.sprite.setFlipX(this.flyDir < 0);
            this.sprite.body.setVelocity(
              Math.cos(angle) * CONFIG.ENEMY.MILL_BAT.SWOOP_SPEED,
              Math.sin(angle) * CONFIG.ENEMY.MILL_BAT.SWOOP_SPEED
            );
            this.stateEndTime = time + 520;
          }
        } else if (this.state === 'SWOOP') {
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.MILL_BAT.DAMAGE, this.sprite.x);
            this.state = 'CLIMB';
            this.stateEndTime = time + 620;
            return;
          }

          if (time >= this.stateEndTime || this.sprite.y >= CONFIG.GROUND_Y - 26) {
            this.state = 'CLIMB';
            this.stateEndTime = time + 620;
          }
        } else if (this.state === 'CLIMB') {
          this.sprite.body.setVelocityX(this.flyDir * CONFIG.ENEMY.MILL_BAT.FLY_SPEED);
          this.sprite.body.setVelocityY(-195);
          this.sprite.scaleY = 1 + Math.sin(time * 0.04) * 0.14;
          if (this.sprite.y <= this.baseY || time >= this.stateEndTime) {
            this.sprite.y = Math.max(92, this.baseY);
            this.sprite.body.setVelocityY(0);
            this.state = 'COOLDOWN';
            this.stateEndTime = time + CONFIG.ENEMY.MILL_BAT.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.flyDir * (CONFIG.ENEMY.MILL_BAT.FLY_SPEED * 0.8));
          this.sprite.body.setVelocityY(Math.sin(time * 0.007) * 26);
          if (time >= this.stateEndTime) {
            this.state = 'FLUTTER';
          }
        }
      }
    }