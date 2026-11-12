
    /**
     * ============================================================================
     * 9G. DNIPRO RUSALKA ("ДНІПРОВА РУСАЛКА-ЛОСКОТАРКА") — ACT III WATER AMBUSH
     * Swims below cloud gaps, telegraphs with a glowing lily wreath & song, then
     * leaps high out of the Dnipro to grab Omelko and drag him into the river!
     * Omelko can dodge with [Shift] or jump, or break free with [Shift]/[Space]/[D].
     * ============================================================================
     */
    class RusalkaEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, CONFIG.GROUND_Y + 14, 'enemy_rusalka', CONFIG.ENEMY.RUSALKA.MAX_STUN, CONFIG.ENEMY.RUSALKA.STUN_MS);
        this.minX = minX;
        this.maxX = maxX;
        this.patrolDir = 1;
        this.state = 'SWIM'; // SWIM -> TELEGRAPH -> LEAP -> GRABBING
        this.stateEndTime = scene.time.now + Phaser.Math.Between(900, 1700);
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setSize(30, 44);
        this.sprite.setAlpha(0.75);

        // Floating water-lily wreath marker on the water surface so Omelko sees where she lurks
        this.surfaceWreath = scene.add.image(x, CONFIG.GROUND_Y + 4, 'rusalka_wreath').setDepth(28);
      }

      update(time, player) {
        if (this.isFinished) {
          if (this.scene.grabbedByRusalka === this) {
            this.scene.grabbedByRusalka = null;
          }
          if (this.surfaceWreath && this.surfaceWreath.active) this.surfaceWreath.setVisible(false);
          return;
        }

        // Keep surface wreath synced with her X position
        if (this.surfaceWreath && this.surfaceWreath.active) {
          this.surfaceWreath.setPosition(this.sprite.x, CONFIG.GROUND_Y + 4 + Math.sin(time * 0.008) * 3);
        }

        if (this.isStunned) {
          if (this.scene.grabbedByRusalka === this) {
            this.scene.grabbedByRusalka = null;
          }
          this.sprite.body.setAllowGravity(false);
          this.sprite.body.setVelocity(0, Math.sin(time * 0.01) * 15);
          this.updateBase(time);
          return;
        }

        if (!this.updateBase(time)) return;

        const distX = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'SWIM') {
          this.sprite.body.setAllowGravity(false);
          this.sprite.y = Phaser.Math.Linear(this.sprite.y, CONFIG.GROUND_Y + 14, 0.15);
          this.sprite.setAlpha(0.72);
          this.sprite.body.setVelocityY(0);

          if (this.sprite.x <= this.minX) this.patrolDir = 1;
          if (this.sprite.x >= this.maxX) this.patrolDir = -1;

          // Track closer toward Omelko when he jumps across clouds above her patrol zone
          if (player.sprite.x >= this.minX - 60 && player.sprite.x <= this.maxX + 60) {
            this.patrolDir = dirToPlayer;
          }
          this.sprite.body.setVelocityX(this.patrolDir * CONFIG.ENEMY.RUSALKA.SWIM_SPEED);
          this.sprite.setFlipX(this.patrolDir < 0);

          if (time >= this.stateEndTime && distX < 185 && player.sprite.y < CONFIG.GROUND_Y - 10) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.stateEndTime = time + CONFIG.ENEMY.RUSALKA.TELEGRAPH_MS;
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('🧜‍♀️!').setColor('#00f5d4').setVisible(true);
            this.sprite.setTint(0x48cae4);
            this.sprite.setAlpha(1);
            if (this.surfaceWreath) this.surfaceWreath.setScale(1.35);
            SFX.rusalkaSong();
            this.scene.spawnWaterSplash(this.sprite.x, CONFIG.GROUND_Y, 6);
            if (distX < 145) {
              this.scene.showFloatingText(this.sprite.x, CONFIG.GROUND_Y - 36, STRINGS.RUSALKA_WARN, '#48cae4');
            }
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          this.sprite.y = CONFIG.GROUND_Y + 4 + Math.sin(time * 0.05) * 3;
          if (time >= this.stateEndTime) {
            this.state = 'LEAP';
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            if (this.surfaceWreath) this.surfaceWreath.setScale(1);

            this.sprite.body.setAllowGravity(true);
            const jumpVx = Phaser.Math.Clamp((player.sprite.x - this.sprite.x) * 1.35, -170, 170);
            this.sprite.body.setVelocity(jumpVx, CONFIG.ENEMY.RUSALKA.LEAP_VEL_Y);
            this.sprite.setFlipX(jumpVx < 0);
            this.stateEndTime = time + 1450;
            SFX.waterSplash();
            this.scene.spawnWaterSplash(this.sprite.x, CONFIG.GROUND_Y, 10);
          }
        } else if (this.state === 'LEAP') {
          // Check if she grabs Omelko mid-air (unless Omelko dodges with Shift roll or is invulnerable!)
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            if (player.isRolling || time < player.invulnUntil) {
              // Omelko dodged her grab! Open counter-attack window and stun her briefly
              player.counterWindowEndTime = time + CONFIG.PLAYER.COUNTER_WINDOW_MS + 250;
              this.scene.showFloatingText(player.sprite.x, player.sprite.y - 45, STRINGS.RUSALKA_DODGED, '#00f5d4');
              this.receiveStunHit(28, player.sprite.x, false);
              this.state = 'SWIM';
              this.stateEndTime = time + CONFIG.ENEMY.RUSALKA.COOLDOWN_MS;
              return;
            } else if (!this.scene.grabbedByRusalka) {
              // Grab Omelko and try to pull him down into the Dnipro!
              this.state = 'GRABBING';
              this.grabStartTime = time;
              this.grabReleaseTime = time + 900;
              this.scene.grabbedByRusalka = this;
              SFX.rusalkaSong();
              this.scene.showFloatingText(player.sprite.x, player.sprite.y - 52, STRINGS.RUSALKA_GRABBED, '#ff758f');
              player.takeDamage(CONFIG.ENEMY.RUSALKA.DAMAGE, this.sprite.x);
              return;
            }
          }

          // Return to water after her arc finishes
          if ((this.sprite.body.velocity.y > 0 && this.sprite.y >= CONFIG.GROUND_Y + 10) || time >= this.stateEndTime) {
            this.sprite.body.setAllowGravity(false);
            this.sprite.body.setVelocity(0, 0);
            this.sprite.y = CONFIG.GROUND_Y + 14;
            this.state = 'SWIM';
            this.stateEndTime = time + CONFIG.ENEMY.RUSALKA.COOLDOWN_MS;
            this.scene.spawnWaterSplash(this.sprite.x, CONFIG.GROUND_Y, 7);
          }
        } else if (this.state === 'GRABBING') {
          // Safely check player keys (space, upArrow, rollShift, attackD, throwS) and touch controls
          const k = player.keys || {};
          const touch = (player.scene && player.scene.ui && player.scene.ui.touchState) ? player.scene.ui.touchState : {};
          const gracePassed = time >= (this.grabStartTime || 0) + 120;

          const brokeFree = player.isRolling ||
            Boolean(k.rollShift && Phaser.Input.Keyboard.JustDown(k.rollShift)) ||
            Boolean(k.space && Phaser.Input.Keyboard.JustDown(k.space)) ||
            Boolean(k.upArrow && Phaser.Input.Keyboard.JustDown(k.upArrow)) ||
            Boolean(k.attackD && Phaser.Input.Keyboard.JustDown(k.attackD)) ||
            Boolean(k.throwS && Phaser.Input.Keyboard.JustDown(k.throwS)) ||
            (gracePassed && (
              Boolean(k.rollShift && k.rollShift.isDown) ||
              Boolean(k.space && k.space.isDown) ||
              Boolean(k.upArrow && k.upArrow.isDown) ||
              Boolean(k.attackD && k.attackD.isDown) ||
              Boolean(touch.jump || touch.roll || touch.attack)
            ));

          if (brokeFree || time >= this.grabReleaseTime || this.isStunned) {
            if (this.scene.grabbedByRusalka === this) {
              this.scene.grabbedByRusalka = null;
            }
            if (brokeFree) {
              player.sprite.body.setVelocityY(-460);
              player.canDoubleJump = true;
              player.invulnUntil = time + 700;
              SFX.jump(true);
              this.scene.showFloatingText(player.sprite.x, player.sprite.y - 48, STRINGS.RUSALKA_ESCAPED, '#ffd166');
              this.receiveStunHit(34, player.sprite.x, true);
            }
            this.sprite.body.setAllowGravity(false);
            this.sprite.body.setVelocity(0, 0);
            this.sprite.y = CONFIG.GROUND_Y + 14;
            this.state = 'SWIM';
            this.stateEndTime = time + CONFIG.ENEMY.RUSALKA.COOLDOWN_MS + 500;
            return;
          }

          // Pull Omelko gently downward toward the river while clinging to him
          this.sprite.setPosition(player.sprite.x + (this.patrolDir * 10), player.sprite.y + 8);
          this.sprite.body.setVelocity(0, 0);
          player.sprite.body.setVelocityX(player.sprite.body.velocity.x * 0.55);
          player.sprite.body.setVelocityY(CONFIG.ENEMY.RUSALKA.PULL_SPEED_Y);
        }
      }

      triggerFinisher(fromX) {
        if (this.scene.grabbedByRusalka === this) {
          this.scene.grabbedByRusalka = null;
        }
        if (this.surfaceWreath && this.surfaceWreath.active) {
          this.surfaceWreath.destroy();
        }
        super.triggerFinisher(fromX);
      }
    }

    /**
     * ============================================================================
     * 9H. VODYANYK ("ВОДЯНИК ХМАРНИЙ") — ACT III CLOUD PLATFORM CASTER
     * Patrols cloud platforms and hurls spinning whirlpool water orbs!
     * ============================================================================
     */
    class VodyanykEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_vodyanyk', CONFIG.ENEMY.VODYANYK.MAX_STUN, CONFIG.ENEMY.VODYANYK.STUN_MS);
        this.minX = minX;
        this.maxX = maxX;
        this.patrolDir = 1;
        this.state = 'PATROL';
        this.stateEndTime = scene.time.now + Phaser.Math.Between(900, 1700);
        this.sprite.body.setSize(32, 46);
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        // Keep Vodyanyk from falling into the water if knocked off his cloud
        if (this.sprite.y > CONFIG.GROUND_Y - 15) {
          this.sprite.y = CONFIG.GROUND_Y - 140;
          this.sprite.body.setVelocityY(-180);
        }

        const dist = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'PATROL') {
          if (this.sprite.x <= this.minX) this.patrolDir = 1;
          if (this.sprite.x >= this.maxX) this.patrolDir = -1;
          this.sprite.body.setVelocityX(this.patrolDir * CONFIG.ENEMY.VODYANYK.PATROL_SPEED);
          this.sprite.setFlipX(this.patrolDir < 0);

          if (dist < 420 && time > this.stateEndTime) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.sprite.body.setVelocityX(0);
            this.sprite.setFlipX(dirToPlayer < 0);
            this.telegraphLabel.setText('🌊!').setColor('#48cae4').setVisible(true);
            this.sprite.setTint(0x48cae4);
            this.stateEndTime = time + CONFIG.ENEMY.VODYANYK.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.scene.spawnWaterOrb(this.sprite.x, this.sprite.y - 10, player.sprite.x, player.sprite.y - 10);
            this.state = 'PATROL';
            this.stateEndTime = time + CONFIG.ENEMY.VODYANYK.COOLDOWN_MS;
          }
        }
      }
    }

    /**
     * ============================================================================
     * 9I. POTERCHA ("ПОТЕРЧА РІЧКОВЕ З КАганцем") — ACT III SKY FLYER
     * Hovers above cloud gaps with a glowing marsh lantern and swoops at Omelko.
     * ============================================================================
     */
    class PoterchaEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_potercha', CONFIG.ENEMY.POTERCHA.MAX_STUN, CONFIG.ENEMY.POTERCHA.STUN_MS);
        this.baseY = y;
        this.minX = minX;
        this.maxX = maxX;
        this.patrolDir = -1;
        this.state = 'HOVER';
        this.stateEndTime = scene.time.now + 1100;
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setSize(30, 36);
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'HOVER') {
          if (this.sprite.x <= this.minX) this.patrolDir = 1;
          if (this.sprite.x >= this.maxX) this.patrolDir = -1;
          this.sprite.body.setVelocityX(this.patrolDir * CONFIG.ENEMY.POTERCHA.FLY_SPEED);
          this.sprite.body.setVelocityY(Math.cos(time * 0.007) * 38);
          this.sprite.setFlipX(this.patrolDir < 0);

          if (dist < 310 && time >= this.stateEndTime) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.swoopDir = dirToPlayer;
            this.sprite.body.setVelocity(0, 0);
            this.sprite.setFlipX(this.swoopDir < 0);
            this.telegraphLabel.setText('!').setColor('#ffea00').setVisible(true);
            this.sprite.setTint(0xffea00);
            this.stateEndTime = time + CONFIG.ENEMY.POTERCHA.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          if (time >= this.stateEndTime) {
            this.state = 'SWOOP';
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
            this.sprite.body.setVelocity(
              Math.cos(angle) * CONFIG.ENEMY.POTERCHA.SWOOP_SPEED,
              Math.sin(angle) * CONFIG.ENEMY.POTERCHA.SWOOP_SPEED
            );
            this.stateEndTime = time + 520;
          }
        } else if (this.state === 'SWOOP') {
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.POTERCHA.DAMAGE, this.sprite.x);
          }
          if (time >= this.stateEndTime) {
            this.state = 'RETURN';
            this.stateEndTime = time + 650;
          }
        } else if (this.state === 'RETURN') {
          const dy = this.baseY - this.sprite.y;
          this.sprite.body.setVelocityY(Phaser.Math.Clamp(dy * 3.2, -160, 160));
          this.sprite.body.setVelocityX(this.patrolDir * 80);
          if (Math.abs(dy) < 16 || time >= this.stateEndTime) {
            this.state = 'HOVER';
            this.stateEndTime = time + CONFIG.ENEMY.POTERCHA.COOLDOWN_MS;
          }
        }
      }
    }