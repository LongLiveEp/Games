
    /**
     * ============================================================================
     * 7. PLAYER CLASS (COSSACK OMELKO)
     * ============================================================================
     */
    class Player {
      constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'cossack');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setSize(26, 52);
        this.sprite.body.setOffset(7, 6);
        this.sprite.body.setMaxVelocity(550, 900);

        // Stats & Inventory
        this.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.coins = 0;
        this.galushkas = CONFIG.PLAYER.START_GALUSHKAS;
        this.uzvarCharges = CONFIG.PLAYER.UZVAR_CHARGES;

        // Movement & Jump State
        this.facing = 1; // 1 = right, -1 = left
        this.lastGroundedTime = 0;
        this.lastJumpPressedTime = -9999;
        this.canDoubleJump = false;
        this.wasGrounded = false;
        this.isTiredRespawning = false;

        // Dodge Roll & Counter-Attack State
        this.isRolling = false;
        this.rollEndTime = 0;
        this.nextRollAllowedTime = 0;
        this.counterWindowEndTime = 0;
        this.invulnUntil = 0;
        this.dropThroughUntil = 0; // Allows Shift + Down to drop underground through the grass surface

        // 3-Hit Frying Pan Combo State
        this.comboStep = 0;
        this.lastAttackTime = 0;
        this.nextAttackAllowedTime = 0;

        // Dust particle cooldown
        this.nextDustTime = 0;

        // Setup Keyboard Input:
        // Movement ONLY via Arrow keys (Left/Right/Up/Down) + Space for Jump
        // Combat Actions: D = Frying Pan Attack, S = Throw Galushka, A = Drink Kissel (Heal), Shift = Roll
        this.keys = scene.input.keyboard.addKeys({
          leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
          rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
          upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
          downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
          space: Phaser.Input.Keyboard.KeyCodes.SPACE,
          rollShift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
          attackD: Phaser.Input.Keyboard.KeyCodes.D,
          throwS: Phaser.Input.Keyboard.KeyCodes.S,
          healA: Phaser.Input.Keyboard.KeyCodes.A
        });

        // Edge-triggered states for Gamepad & Touch buttons
        this.prevJumpDown = false;
        this.prevRollDown = false;
        this.prevAttackDown = false;
        this.prevThrowDown = false;
        this.prevHealDown = false;
      }

      readInputState() {
        const k = this.keys;
        const touch = this.scene.ui ? this.scene.ui.touchState : {};

        // Poll standard Xbox Gamepad via Web Gamepad API
        let gpLeft = false, gpRight = false, gpJump = false, gpRoll = false, gpAttack = false, gpThrow = false, gpHeal = false;
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        const pad = pads && pads[0];
        let gpDown = false;
        if (pad) {
          const axisX = pad.axes[0] || 0;
          const axisY = pad.axes[1] || 0;
          gpLeft = axisX < -0.35 || (pad.buttons[14] && pad.buttons[14].pressed);
          gpRight = axisX > 0.35 || (pad.buttons[15] && pad.buttons[15].pressed);
          gpDown = axisY > 0.5 || (pad.buttons[13] && pad.buttons[13].pressed);
          gpJump = Boolean(pad.buttons[0] && pad.buttons[0].pressed);   // Xbox A
          gpAttack = Boolean(pad.buttons[2] && pad.buttons[2].pressed); // Xbox X
          gpRoll = Boolean((pad.buttons[1] && pad.buttons[1].pressed) || (pad.buttons[5] && pad.buttons[5].pressed)); // B or RB
          gpThrow = Boolean(pad.buttons[3] && pad.buttons[3].pressed);  // Xbox Y
          gpHeal = Boolean(pad.buttons[4] && pad.buttons[4].pressed);   // Xbox LB
        }

        const moveLeft = k.leftArrow.isDown || touch.left || gpLeft;
        const moveRight = k.rightArrow.isDown || touch.right || gpRight;
        const moveDown = k.downArrow.isDown || Boolean(touch.down) || gpDown;
        const jumpDown = k.space.isDown || k.upArrow.isDown || Boolean(touch.jump) || gpJump;
        const rollDown = k.rollShift.isDown || Boolean(touch.roll) || gpRoll;
        const attackDown = k.attackD.isDown || Boolean(touch.attack) || gpAttack;
        const throwDown = k.throwS.isDown || Boolean(touch.throw) || gpThrow;
        const healDown = k.healA.isDown || Boolean(touch.heal) || gpHeal;

        const state = {
          moveLeft,
          moveRight,
          moveDown,
           rollDown,
          jumpDown,
          jumpJustPressed: jumpDown && !this.prevJumpDown,
          jumpJustReleased: !jumpDown && this.prevJumpDown,
          rollJustPressed: rollDown && !this.prevRollDown,
          attackJustPressed: attackDown && !this.prevAttackDown,
          throwJustPressed: throwDown && !this.prevThrowDown,
          healJustPressed: healDown && !this.prevHealDown
        };

        this.prevJumpDown = jumpDown;
        this.prevRollDown = rollDown;
        this.prevAttackDown = attackDown;
        this.prevThrowDown = throwDown;
        this.prevHealDown = healDown;

        return state;
      }

      update(time, delta) {
        if (this.isTiredRespawning) return;

        const input = this.readInputState();
        const body = this.sprite.body;
        const onFloor = body.blocked.down || body.touching.down;

        // Track grounded state for Coyote Time & Landing Squash
        if (onFloor) {
          if (!this.wasGrounded && body.velocity.y >= 0) {
            this.applySquashStretch(CONFIG.FEEL.LAND_SQUASH_X, CONFIG.FEEL.LAND_STRETCH_Y);
            this.spawnDust(5);
          }
          this.lastGroundedTime = time;
          this.canDoubleJump = true;
          this.escapingUnderground = false;
          this.jumpedFromUnderground = (body.bottom > CONFIG.GROUND_Y + 6);
        }
        this.wasGrounded = onFloor;

        // Clear underground escape flag once the player has risen above ground level and starts descending or lands
        if (this.escapingUnderground && (body.bottom <= CONFIG.GROUND_Y + 12 || onFloor)) {
          this.escapingUnderground = false;
          this.jumpedFromUnderground = false;
        }

        // Check active Roll expiration
        if (this.isRolling && time >= this.rollEndTime) {
          this.isRolling = false;
          this.sprite.setTexture('cossack');
          this.sprite.setAngle(0);
          body.setSize(26, 52);
          body.setOffset(7, 6);
        }

        // Shift + Down: Intentionally dive underground only if on grass and pressing Roll specifically while holding Down
        const onGrassSurface = onFloor && Math.abs(body.bottom - CONFIG.GROUND_Y) <= 18;
        if (onGrassSurface && input.moveDown && input.rollJustPressed && time >= this.dropThroughUntil) {
          this.dropThroughUntil = time + 360;
          this.jumpedFromUnderground = true;
          this.canDoubleJump = true;
          this.sprite.y += 10;
          body.setVelocityY(260);
          this.applySquashStretch(0.78, 1.25);
          this.spawnDust(5);
          SFX.roll();
        } else if (input.rollJustPressed && !this.isRolling && time >= this.nextRollAllowedTime) {
          // Start Dodge Roll
          this.startRoll(time, input);
        }

        // Horizontal Movement
        if (this.isRolling) {
          body.setVelocityX(this.facing * CONFIG.PLAYER.ROLL_SPEED);
          this.sprite.angle += this.facing * 18;
          if (time > this.nextDustTime) {
            this.spawnDust(1);
            this.nextDustTime = time + 55;
          }
        } else {
          if (input.moveLeft) {
            this.facing = -1;
            this.sprite.setFlipX(true);
            body.setVelocityX(-CONFIG.PLAYER.SPEED);
            if (onFloor && time > this.nextDustTime) {
              this.spawnDust(1);
              this.nextDustTime = time + 140;
            }
          } else if (input.moveRight) {
            this.facing = 1;
            this.sprite.setFlipX(false);
            body.setVelocityX(CONFIG.PLAYER.SPEED);
            if (onFloor && time > this.nextDustTime) {
              this.spawnDust(1);
              this.nextDustTime = time + 140;
            }
          } else {
            body.setVelocityX(body.velocity.x * 0.78);
            if (Math.abs(body.velocity.x) < 12) body.setVelocityX(0);
          }
        }

        // Jump Buffer & Coyote Time Jump + Double Jump
        if (input.jumpJustPressed) {
          this.lastJumpPressedTime = time;
        }

        const withinJumpBuffer = (time - this.lastJumpPressedTime) <= CONFIG.PLAYER.JUMP_BUFFER_MS;
        const withinCoyote = (time - this.lastGroundedTime) <= CONFIG.PLAYER.COYOTE_TIME_MS;
        const isCurrentlyUnderground = body.bottom > CONFIG.GROUND_Y + 4;

        if (withinJumpBuffer && withinCoyote) {
          // Primary Jump
          this.jumpedFromUnderground = isCurrentlyUnderground;
          if (isCurrentlyUnderground) {
            // Strong spring-leap out of the catacombs up onto the grass surface
            body.setVelocityY(-740);
            this.escapingUnderground = true;
          } else {
            body.setVelocityY(CONFIG.PLAYER.JUMP_VELOCITY);
          }
          this.lastJumpPressedTime = -9999;
          this.lastGroundedTime = -9999;
          this.applySquashStretch(CONFIG.FEEL.JUMP_SQUASH_X, CONFIG.FEEL.JUMP_STRETCH_Y);
          this.spawnDust(4);
          SFX.jump(false);
        } else if (input.jumpJustPressed && !withinCoyote && this.canDoubleJump) {
          // Double Jump in mid-air
          if (isCurrentlyUnderground || this.jumpedFromUnderground) {
            body.setVelocityY(-720);
            this.escapingUnderground = true;
          } else {
            body.setVelocityY(CONFIG.PLAYER.DOUBLE_JUMP_VELOCITY);
          }
          this.canDoubleJump = false;
          this.lastJumpPressedTime = -9999;
          this.applySquashStretch(CONFIG.FEEL.JUMP_SQUASH_X, CONFIG.FEEL.JUMP_STRETCH_Y);
          this.spawnDust(4);
          SFX.jump(true);
        }

        // Variable Jump Height when releasing jump key early (disabled while underground or escaping so jump is never throttled)
        if (input.jumpJustReleased && body.velocity.y < 0 && !this.escapingUnderground && !isCurrentlyUnderground) {
          body.setVelocityY(body.velocity.y * CONFIG.PLAYER.JUMP_CUT_MULTIPLIER);
        }

        // Combat Actions (only inside GameScene or test swings in Hut)
        if (input.attackJustPressed && time >= this.nextAttackAllowedTime) {
          this.performPanAttack(time);
        }
        if (input.throwJustPressed && this.scene.throwPlayerGalushka) {
          this.scene.throwPlayerGalushka(time);
        }
        if (input.healJustPressed && this.scene.drinkPlayerUzvar) {
          this.scene.drinkPlayerUzvar();
        }

        // Smoothly restore Squash & Stretch scale toward 1.0
        this.sprite.scaleX = Phaser.Math.Linear(this.sprite.scaleX, 1, 0.22);
        this.sprite.scaleY = Phaser.Math.Linear(this.sprite.scaleY, 1, 0.22);

        // Invulnerability flicker visual
        if (time < this.invulnUntil && !this.isRolling) {
          this.sprite.alpha = Math.floor(time / 60) % 2 === 0 ? 0.45 : 1;
        } else {
          this.sprite.alpha = 1;
        }
      }

      startRoll(time, input) {
        if (input.moveLeft) {
          this.facing = -1;
          this.sprite.setFlipX(true);
        } else if (input.moveRight) {
          this.facing = 1;
          this.sprite.setFlipX(false);
        }

        this.isRolling = true;
        this.rollEndTime = time + CONFIG.PLAYER.ROLL_DURATION_MS;
        this.nextRollAllowedTime = time + CONFIG.PLAYER.ROLL_COOLDOWN_MS;
        this.invulnUntil = this.rollEndTime + 60; // i-frames during roll
        this.counterWindowEndTime = this.rollEndTime + CONFIG.PLAYER.COUNTER_WINDOW_MS;

        this.sprite.setTexture('cossack_roll');
        this.applySquashStretch(1.2, 0.8);
        this.spawnDust(4);
        SFX.roll();
      }

      performPanAttack(time) {
        // Cancel roll if attacking out of a roll (triggers Counter-Attack!)
        if (this.isRolling) {
          this.isRolling = false;
          this.sprite.setTexture('cossack');
          this.sprite.setAngle(0);
        }

        const isCounterAttack = time <= this.counterWindowEndTime;
        if (isCounterAttack) {
          this.counterWindowEndTime = 0;
        }

        // Advance 3-hit combo
        if (time - this.lastAttackTime > CONFIG.PLAYER.COMBO_RESET_MS) {
          this.comboStep = 1;
        } else {
          this.comboStep = (this.comboStep % 3) + 1;
        }
        this.lastAttackTime = time;
        this.nextAttackAllowedTime = time + CONFIG.PLAYER.ATTACK_COOLDOWN_MS;

        const usingSaber = Boolean(GAME_STATE.hasSaber || (this.scene && this.scene.currentLevel >= 2));
        SFX.swing(this.comboStep, usingSaber);

        // Visual Frying Pan or Damascus Cossack Saber Slash Arc
        const slashX = this.sprite.x + this.facing * (usingSaber ? 40 : 36);
        const slashY = this.sprite.y - 2;
        const slash = this.scene.add.image(slashX, slashY, usingSaber ? 'saber_slash' : 'pan_slash');
        slash.setFlipX(this.facing < 0);

        if (isCounterAttack) {
          slash.setTint(usingSaber ? 0x00f5d4 : 0xffea00);
          slash.setScale(1.38);
        } else if (this.comboStep === 3) {
          slash.setTint(usingSaber ? 0xffd166 : 0xff9f1c);
          slash.setScale(1.3);
        } else if (this.comboStep === 2) {
          slash.setFlipY(true);
          slash.setScale(1.08);
        }

        this.scene.tweens.add({
          targets: slash,
          alpha: 0,
          scaleX: slash.scaleX * 1.22,
          scaleY: slash.scaleY * 1.22,
          duration: 145,
          onComplete: () => slash.destroy()
        });

        // Slight forward step impulse
        this.sprite.body.setVelocityX(this.facing * 145);
        this.applySquashStretch(1.18, 0.88);

        // Delegate hit detection to GameScene if combat exists
        if (this.scene.handlePlayerMeleeHit) {
          this.scene.handlePlayerMeleeHit(this.comboStep, isCounterAttack);
        }
      }

      takeDamage(amount, sourceX) {
        const now = this.scene.time.now;
        if (now < this.invulnUntil || this.isRolling || this.isTiredRespawning) return false;

        const finalDamage = Math.round(amount * GAME_STATE.getEnemyDamageMultiplier());
        this.stamina = Math.max(0, this.stamina - finalDamage);
        this.invulnUntil = now + CONFIG.PLAYER.INVULN_AFTER_HIT_MS;
        SFX.hurt();

        // Knockback & Camera Shake
        const dir = this.sprite.x < sourceX ? -1 : 1;
        this.sprite.body.setVelocity(dir * 260, -240);
        this.scene.cameras.main.shake(CONFIG.FEEL.SHAKE_HEAVY_DURATION, CONFIG.FEEL.SHAKE_HEAVY_INTENSITY);

        // Red flash tint
        this.sprite.setTint(0xff4d4d);
        this.scene.time.delayedCall(160, () => {
          if (this.sprite && this.sprite.active) this.sprite.clearTint();
        });

        if (this.stamina <= 0 && this.scene.handlePlayerTired) {
          this.scene.handlePlayerTired();
        }
        return true;
      }

      applySquashStretch(scaleX, scaleY) {
        this.sprite.setScale(scaleX, scaleY);
      }

      spawnDust(count = 3) {
        for (let i = 0; i < count; i++) {
          const p = this.scene.add.image(
            this.sprite.x + Phaser.Math.Between(-12, 12),
            this.sprite.y + 24,
            'particle_dust'
          );
          p.setScale(Phaser.Math.FloatBetween(0.5, 1.1));
          this.scene.tweens.add({
            targets: p,
            x: p.x + Phaser.Math.Between(-24, 24),
            y: p.y - Phaser.Math.Between(8, 22),
            alpha: 0,
            scale: 0.2,
            duration: Phaser.Math.Between(220, 380),
            onComplete: () => p.destroy()
          });
        }
      }
    }