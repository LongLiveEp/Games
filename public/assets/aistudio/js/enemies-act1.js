
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
          ).setScale(0.75);
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
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_leshy', CONFIG.ENEMY.LESHY.MAX_STUN);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 180);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 180);
        this.walkDir = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, COOLDOWN
        this.stateEndTime = 0;
        this.nextThrowTime = 0;
        this.burrowPassUntil = 0;
        this.nextBurrowTime = scene.time.now + Phaser.Math.Between(900, 1800);
      }

      isUnderground() {
        return this.sprite.body.bottom > CONFIG.GROUND_Y + 22;
      }

      diveUnderground(time) {
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