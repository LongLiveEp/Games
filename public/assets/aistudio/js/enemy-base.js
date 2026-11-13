
    /**
     * ============================================================================
     * 8. ENEMY BASE CLASS & SUBCLASSES (NON-LETHAL STUN & FINISHERS)
     * ============================================================================
     */
    class Enemy {
      constructor(scene, x, y, texture, maxStun) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.enemyRef = this;

        this.maxStun = Math.round(maxStun * GAME_STATE.getEnemyHpMultiplier());
        this.stun = 0;
        this.isStunned = false;
        this.stunEndTime = 0;
        this.isFinished = false;
        this.isTelegraphing = false;

        // Overhead UI: Classic Red Health Bar (starts full red and decreases to 0) + Telegraph Warning ("!") + Dizzy Stars
        this.uiContainer = scene.add.container(x, y - 42);
        this.barBg = scene.add.rectangle(0, 0, 44, 7, 0x1b1d24).setStrokeStyle(1, 0xffffff);
        this.barFill = scene.add.rectangle(-21, 0, 42, 5, 0xe63946).setOrigin(0, 0.5);
        this.telegraphLabel = scene.add.text(0, -18, '!', {
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#ff002b',
          stroke: '#ffffff',
          strokeThickness: 4
        }).setOrigin(0.5).setVisible(false);

        this.stunPrompt = scene.add.text(0, -20, STRINGS.STUNNED_PROMPT, {
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#ffea00',
          backgroundColor: '#1d1e2c',
          padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setVisible(false);

        // Orbiting dizzy stars when stunned
        this.stars = [
          scene.add.image(-14, -8, 'particle_star').setVisible(false),
          scene.add.image(0, -12, 'particle_star').setVisible(false),
          scene.add.image(14, -8, 'particle_star').setVisible(false)
        ];

        this.uiContainer.add([this.barBg, this.barFill, this.telegraphLabel, this.stunPrompt, ...this.stars]);
      }

      updateBase(time) {
        if (this.isFinished || !this.sprite.active) return false;

        // Sync overhead Health Bar position (classic decreasing red bar: 100% -> 0%)
        this.uiContainer.setPosition(this.sprite.x, this.sprite.y - this.sprite.height * 0.65);
        const hpRatio = Phaser.Math.Clamp(1 - (this.stun / this.maxStun), 0, 1);
        this.barFill.width = 42 * hpRatio;

        // Smoothly recover Squash & Stretch
        this.sprite.scaleX = Phaser.Math.Linear(this.sprite.scaleX, 1, 0.2);
        this.sprite.scaleY = Phaser.Math.Linear(this.sprite.scaleY, 1, 0.2);

        // Handle Stunned ("Оглушений") state
        if (this.isStunned) {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.85);
          // Animate orbiting stars overhead
          this.stars.forEach((star, idx) => {
            const angle = (time * 0.007) + (idx * (Math.PI * 2 / 3));
            star.x = Math.cos(angle) * 18;
            star.y = -8 + Math.sin(angle) * 5;
          });

          if (time >= this.stunEndTime) {
            this.recoverFromStun();
          }
          return false; // Skip AI movement while stunned
        }

        return true;
      }

      update(time, player) {
        this.updateBase(time);
        void player;
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.isFinished) return;

        // If ALREADY stunned, hitting triggers the Comical Non-Lethal Finisher!
        if (this.isStunned) {
          this.triggerFinisher(fromX);
          return;
        }

        this.stun = Math.min(this.maxStun, this.stun + stunAmount);
        SFX.panHit(isHeavy);

        // Hit-stop, Camera Shake, Squash & Stretch, Knockback & Sparks
        this.scene.triggerHitStop(CONFIG.FEEL.HIT_STOP_MS);
        this.scene.cameras.main.shake(
          isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_DURATION : CONFIG.FEEL.SHAKE_LIGHT_DURATION,
          isHeavy ? CONFIG.FEEL.SHAKE_HEAVY_INTENSITY : CONFIG.FEEL.SHAKE_LIGHT_INTENSITY
        );

        const dir = this.sprite.x >= fromX ? 1 : -1;
        this.sprite.body.setVelocity(dir * CONFIG.PLAYER.KNOCKBACK_X, CONFIG.PLAYER.KNOCKBACK_Y);
        this.sprite.setScale(1.3, 0.75);
        this.sprite.setTintFill(0xffffff);
        this.scene.time.delayedCall(90, () => {
          if (this.sprite && this.sprite.active && !this.isTelegraphing) {
            this.sprite.clearTint();
          }
        });

        this.scene.spawnHitParticles(this.sprite.x, this.sprite.y);

        // Check if Stun Bar reached 100%
        if (this.stun >= this.maxStun) {
          this.enterStunState();
        }
      }

      enterStunState() {
        this.isStunned = true;
        this.isTelegraphing = false;
        this.telegraphLabel.setVisible(false);
        this.stunEndTime = this.scene.time.now + CONFIG.ENEMY.STUN_DURATION_MS;
        this.barFill.setFillStyle(0xe63946);
        this.stunPrompt.setVisible(true);
        this.stars.forEach(s => s.setVisible(true));
        this.sprite.setAngle(0);
        this.sprite.clearTint();
        SFX.stunFull();
      }

      recoverFromStun() {
        this.isStunned = false;
        this.stun = Math.floor(this.maxStun * 0.35); // Recover 65% of red health bar if player missed finisher
        this.barFill.setFillStyle(0xe63946);
        this.stunPrompt.setVisible(false);
        this.stars.forEach(s => s.setVisible(false));
        this.sprite.setAngle(0);
      }

      triggerFinisher(fromX) {
        this.isFinished = true;
        this.isStunned = false;
        this.uiContainer.setVisible(false);
        this.sprite.body.enable = false;

        SFX.finisher();
        this.scene.triggerHitStop(CONFIG.FEEL.FINISHER_HIT_STOP_MS);
        this.scene.cameras.main.shake(CONFIG.FEEL.SHAKE_HEAVY_DURATION, CONFIG.FEEL.SHAKE_HEAVY_INTENSITY);
        this.scene.enemiesStunnedCount++;

        // Spawn Loot (Chervintsi, Food, Galushkas)
        this.scene.spawnLoot(this.sprite.x, this.sprite.y);

        // Choose one of 3 comical non-lethal finishers: Barrel, Clay Pot, or Sky Star Launch
        const roll = Phaser.Math.Between(0, 2);
        const dir = this.sprite.x >= fromX ? 1 : -1;

        if (roll === 0 || roll === 1) {
          // Stuffed into a Barrel or Clay Pot that hops & wiggles!
          const propKey = roll === 0 ? 'prop_barrel' : 'prop_pot';
          const label = roll === 0 ? STRINGS.FINISHER_BARREL : STRINGS.FINISHER_POT;
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 35, label, '#ffea00');

          const prop = this.scene.add.image(this.sprite.x, this.sprite.y + 4, propKey);
          this.sprite.setPosition(prop.x, prop.y - 22);
          this.sprite.setFlipY(true); // Feet sticking out!
          this.sprite.setScale(0.8);

          // Comical wiggling animation
          this.scene.tweens.add({
            targets: [prop, this.sprite],
            angle: { from: -8, to: 8 },
            duration: 240,
            yoyo: true,
            repeat: -1
          });
        } else {
          // Launched into the sky with a twinkling star!
          this.scene.showFloatingText(this.sprite.x, this.sprite.y - 35, STRINGS.FINISHER_SKY, '#00f5d4');
          this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + dir * 240,
            y: -60,
            angle: 720,
            scale: 0.1,
            duration: 750,
            ease: 'Quad.easeIn',
            onComplete: () => {
              if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
              // Twinkle star in the sky
              const twinkle = this.scene.add.image(this.sprite.x, 55, 'particle_star').setScale(2.8);
              this.scene.tweens.add({
                targets: twinkle,
                scale: 0,
                angle: 180,
                duration: 450,
                onComplete: () => {
                  if (twinkle && twinkle.active) twinkle.destroy();
                }
              });
              if (this.sprite && this.sprite.active) this.sprite.destroy();
            }
          });
        }
      }
    }