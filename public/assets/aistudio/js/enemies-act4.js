    /**
     * ============================================================================
     * 9D. ACT IV («ДИКЕ ПОЛЕ І ЧОРНЕ МОРЕ») STEPPE & BLACK SEA MYTHOLOGY ENEMIES
     * ============================================================================
     * - PolovykEnemy (Польовик): hides camouflaged in feather-grass, leaps out when Omelko approaches
     * - VovkulakaEnemy (Вовкулака): swift steppe werewolf with a ~0.45s (450ms) pounce telegraph
     * - TumbleweedEnemy (Перекотиполе): rolling thorny steppe bush accelerated by steppe wind gusts;
     *   flies away cleanly when stunned/finished
     * - SeagullEnemy (Чайка-злодійка): coastal seagull that dives to steal up to 3 chervintsi
     *   and returns them when stunned or finished
     */

    class PolovykEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_polovyk', CONFIG.ENEMY.POLOVYK.MAX_STUN);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 180);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 180);
        this.facing = -1;
        this.state = 'HIDDEN'; // HIDDEN, TELEGRAPH, AMBUSH_LEAP, PATROL, COOLDOWN
        this.stateEndTime = 0;

        // Camouflaged low in the feather-grass until Omelko approaches
        this.sprite.setAlpha(CONFIG.ENEMY.POLOVYK.HIDDEN_ALPHA);
        this.sprite.setScale(1.12, 0.68);
        this.barBg.setVisible(false);
        this.barFill.setVisible(false);
      }

      revealFromGrass() {
        this.sprite.setAlpha(1);
        this.barBg.setVisible(true);
        this.barFill.setVisible(true);
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.state === 'HIDDEN') {
          this.revealFromGrass();
          this.state = 'PATROL';
        }
        super.receiveStunHit(stunAmount, fromX, isHeavy);
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const horizDist = Math.abs(player.sprite.x - this.sprite.x);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        if (this.state === 'HIDDEN') {
          this.sprite.body.setVelocityX(0);
          this.sprite.setAlpha(CONFIG.ENEMY.POLOVYK.HIDDEN_ALPHA + Math.sin(time * 0.008) * 0.06);
          this.barBg.setVisible(false);
          this.barFill.setVisible(false);

          if (horizDist < CONFIG.ENEMY.POLOVYK.AMBUSH_RANGE && Math.abs(player.sprite.y - this.sprite.y) < 120) {
            this.revealFromGrass();
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            this.telegraphLabel.setText('!').setColor('#ffd166').setVisible(true);
            this.sprite.setTint(0xe9c46a);
            this.sprite.setScale(1.22, 0.76);
            this.stateEndTime = time + CONFIG.ENEMY.POLOVYK.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'PATROL') {
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.POLOVYK.WALK_SPEED);
          this.sprite.setFlipX(this.facing < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.facing = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.facing = 1;

          if (dist < CONFIG.ENEMY.POLOVYK.AMBUSH_RANGE && onFloor) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('!').setColor('#ffd166').setVisible(true);
            this.sprite.setTint(0xe9c46a);
            this.sprite.setScale(1.2, 0.78);
            this.stateEndTime = time + CONFIG.ENEMY.POLOVYK.TELEGRAPH_MS;
            SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.state = 'AMBUSH_LEAP';
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            this.sprite.setScale(0.86, 1.22);
            this.sprite.body.setVelocity(
              this.facing * CONFIG.ENEMY.POLOVYK.LEAP_SPEED_X,
              CONFIG.ENEMY.POLOVYK.LEAP_SPEED_Y
            );
            this.stateEndTime = time + 560;
            SFX.jump(false);
          }
        } else if (this.state === 'AMBUSH_LEAP') {
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.POLOVYK.DAMAGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(-this.facing * 95);
            this.stateEndTime = time + CONFIG.ENEMY.POLOVYK.COOLDOWN_MS;
            return;
          }
          if (time >= this.stateEndTime && onFloor) {
            this.state = 'COOLDOWN';
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.POLOVYK.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.82);
          if (time >= this.stateEndTime) {
            this.state = 'PATROL';
          }
        }
      }
    }

    class VovkulakaEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_vovkulaka', CONFIG.ENEMY.VOVKULAKA.MAX_STUN);
        this.sprite.body.setSize(42, 48);
        this.sprite.body.setOffset(5, 6);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 210);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 210);
        this.facing = -1;
        this.state = 'PATROL'; // PATROL, TELEGRAPH, POUNCE, COOLDOWN
        this.stateEndTime = 0;
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        if (this.state === 'PATROL') {
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.VOVKULAKA.PATROL_SPEED);
          this.sprite.setFlipX(this.facing < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.facing = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.facing = 1;

          if (dist < CONFIG.ENEMY.VOVKULAKA.AGGRO_RANGE && Math.abs(player.sprite.y - this.sprite.y) < 110 && onFloor) {
            // ~0.45s (450ms) crouch telegraph before pouncing!
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            this.sprite.body.setVelocityX(0);
            this.telegraphLabel.setText('!').setColor('#ff4d4d').setVisible(true);
            this.sprite.setTint(0xff9f1c);
            this.sprite.setScale(1.26, 0.74);
            this.stateEndTime = time + CONFIG.ENEMY.VOVKULAKA.TELEGRAPH_MS;
            if (SFX.wolfHowl) SFX.wolfHowl();
            else SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocityX(0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.setTint(0xff6b6b);
            this.state = 'POUNCE';
            this.facing = dirToPlayer;
            this.sprite.setFlipX(this.facing < 0);
            this.sprite.setScale(1.22, 0.84);
            this.sprite.body.setVelocity(
              this.facing * CONFIG.ENEMY.VOVKULAKA.POUNCE_SPEED_X,
              CONFIG.ENEMY.VOVKULAKA.POUNCE_SPEED_Y
            );
            this.stateEndTime = time + 520;
          }
        } else if (this.state === 'POUNCE') {
          this.sprite.body.setVelocityX(this.facing * CONFIG.ENEMY.VOVKULAKA.POUNCE_SPEED_X);

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            player.takeDamage(CONFIG.ENEMY.VOVKULAKA.DAMAGE, this.sprite.x);
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(-this.facing * 120);
            this.stateEndTime = time + CONFIG.ENEMY.VOVKULAKA.COOLDOWN_MS;
            return;
          }

          if (time >= this.stateEndTime || (onFloor && time >= this.stateEndTime - 220)) {
            this.state = 'COOLDOWN';
            this.sprite.clearTint();
            this.sprite.body.setVelocityX(0);
            this.stateEndTime = time + CONFIG.ENEMY.VOVKULAKA.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.8);
          if (time >= this.stateEndTime) {
            this.state = 'PATROL';
          }
        }
      }
    }

    class TumbleweedEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_tumbleweed', CONFIG.ENEMY.TUMBLEWEED.MAX_STUN);
        this.sprite.body.setSize(34, 34);
        this.sprite.body.setOffset(5, 5);
        this.minX = minX !== undefined ? minX : Math.max(100, x - 240);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 240);
        this.rollDir = -1;
        this.nextBounceTime = 0;
        this.lastDamageTime = 0;
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        if (this.isFinished) return;
        // When stunned to full capacity, Tumbleweed immediately flies away into the steppe sky!
        const prevStunned = this.isStunned;
        super.receiveStunHit(stunAmount, fromX, isHeavy);
        if (!prevStunned && this.isStunned && !this.isFinished) {
          this.triggerFinisher(fromX);
        }
      }

      update(time, player) {
        if (!this.updateBase(time)) return;

        // Driven faster when steppe wind gust is active in the scene
        const windBoost = (this.scene && this.scene.isWindGustActive)
          ? (this.scene.windDirection * this.rollDir > 0 ? CONFIG.ENEMY.TUMBLEWEED.WIND_BOOST_SPEED : -45)
          : 0;
        const speed = Math.max(70, CONFIG.ENEMY.TUMBLEWEED.ROLL_SPEED + windBoost);

        this.sprite.body.setVelocityX(this.rollDir * speed);
        this.sprite.angle += this.rollDir * 8.5;

        if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) {
          this.rollDir = -1;
        } else if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) {
          this.rollDir = 1;
        }

        // Bouncing along the steppe turf
        const onFloor = this.sprite.body.blocked.down || this.sprite.body.touching.down;
        if (onFloor && time >= this.nextBounceTime) {
          this.sprite.body.setVelocityY(CONFIG.ENEMY.TUMBLEWEED.BOUNCE_VEL_Y);
          this.nextBounceTime = time + Phaser.Math.Between(420, 760);
        }

        if (
          time - this.lastDamageTime > 650 &&
          Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())
        ) {
          if (player.takeDamage(CONFIG.ENEMY.TUMBLEWEED.DAMAGE, this.sprite.x)) {
            this.lastDamageTime = time;
            this.rollDir = -this.rollDir;
          }
        }
      }
    }

    class SeagullEnemy extends Enemy {
      constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'enemy_seagull', CONFIG.ENEMY.SEAGULL.MAX_STUN);
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setSize(40, 28);
        this.baseY = y;
        this.minX = minX !== undefined ? minX : Math.max(100, x - 240);
        this.maxX = maxX !== undefined ? maxX : Math.min((this.scene.worldWidth || CONFIG.WORLD_WIDTH) - 100, x + 240);
        this.flyDir = -1;
        this.state = 'SOAR'; // SOAR, TELEGRAPH, DIVE, CLIMB, COOLDOWN
        this.stateEndTime = 0;
        this.stolenCoins = 0;
        this.targetDiveX = x;
        this.targetDiveY = y;

        // Golden coin pouch indicator when the seagull has stolen Omelko's chervintsi
        this.coinBadge = scene.add.text(x, y - 26, '', {
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#ffd166',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5).setVisible(false);
      }

      returnStolenCoins() {
        if (this.stolenCoins > 0 && this.scene && this.scene.player) {
          const returned = this.stolenCoins;
          this.stolenCoins = 0;
          this.scene.player.coins += returned;
          if (this.coinBadge) this.coinBadge.setVisible(false);
          SFX.pickup();
          this.scene.showFloatingText(
            this.sprite.x,
            this.sprite.y - 48,
            `${STRINGS.SEAGULL_RETURNED_COINS} (+${returned})`,
            '#ffd166'
          );
        }
      }

      receiveStunHit(stunAmount, fromX, isHeavy = false) {
        const wasStunned = this.isStunned;
        super.receiveStunHit(stunAmount, fromX, isHeavy);
        if ((!wasStunned && this.isStunned) || this.isFinished) {
          this.sprite.body.setAllowGravity(true);
          this.returnStolenCoins();
        }
      }

      triggerFinisher(fromX) {
        this.returnStolenCoins();
        if (this.coinBadge) this.coinBadge.setVisible(false);
        super.triggerFinisher(fromX);
      }

      update(time, player) {
        if (this.coinBadge) {
          this.coinBadge.setPosition(this.sprite.x, this.sprite.y - 34);
          this.coinBadge.setVisible(!this.isFinished && this.stolenCoins > 0);
        }

        if (!this.updateBase(time)) return;

        // Restore flight if stun expired without finisher
        if (this.sprite.body.allowGravity) {
          this.sprite.body.setAllowGravity(false);
        }

        const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
        const dirToPlayer = player.sprite.x >= this.sprite.x ? 1 : -1;

        if (this.state === 'SOAR') {
          this.sprite.body.setVelocityX(this.flyDir * CONFIG.ENEMY.SEAGULL.FLY_SPEED);
          this.sprite.body.setVelocityY(Math.sin(time * 0.005) * 28);
          this.sprite.setFlipX(this.flyDir < 0);

          if (this.sprite.x >= this.maxX || this.sprite.body.blocked.right) this.flyDir = -1;
          if (this.sprite.x <= this.minX || this.sprite.body.blocked.left) this.flyDir = 1;

          if (dist < CONFIG.ENEMY.SEAGULL.AGGRO_RANGE) {
            this.state = 'TELEGRAPH';
            this.isTelegraphing = true;
            this.flyDir = dirToPlayer;
            this.sprite.setFlipX(this.flyDir < 0);
            this.sprite.body.setVelocity(0, 0);
            this.telegraphLabel.setText('!').setColor('#ffd166').setVisible(true);
            this.sprite.setTint(0xffea00);
            this.targetDiveX = player.sprite.x;
            this.targetDiveY = player.sprite.y - 6;
            this.stateEndTime = time + CONFIG.ENEMY.SEAGULL.TELEGRAPH_MS;
            if (SFX.seagullCry) SFX.seagullCry();
            else SFX.telegraph();
          }
        } else if (this.state === 'TELEGRAPH') {
          this.sprite.body.setVelocity(0, 0);
          if (time >= this.stateEndTime) {
            this.isTelegraphing = false;
            this.telegraphLabel.setVisible(false);
            this.sprite.clearTint();
            this.state = 'DIVE';
            const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
            this.flyDir = Math.cos(angle) >= 0 ? 1 : -1;
            this.sprite.setFlipX(this.flyDir < 0);
            this.sprite.body.setVelocity(
              Math.cos(angle) * CONFIG.ENEMY.SEAGULL.DIVE_SPEED,
              Math.sin(angle) * CONFIG.ENEMY.SEAGULL.DIVE_SPEED
            );
            this.stateEndTime = time + 560;
          }
        } else if (this.state === 'DIVE') {
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.sprite.getBounds())) {
            const hitLanded = player.takeDamage(CONFIG.ENEMY.SEAGULL.DAMAGE, this.sprite.x);
            if (hitLanded && player.coins > 0 && this.stolenCoins < CONFIG.ENEMY.SEAGULL.STEAL_COINS) {
              const steal = Math.min(CONFIG.ENEMY.SEAGULL.STEAL_COINS - this.stolenCoins, player.coins);
              if (steal > 0) {
                player.coins -= steal;
                this.stolenCoins += steal;
                if (this.coinBadge) {
                  this.coinBadge.setText(`🪙+${this.stolenCoins}`);
                }
                this.scene.showFloatingText(
                  player.sprite.x,
                  player.sprite.y - 52,
                  STRINGS.SEAGULL_STOLE_COINS,
                  '#ffd166'
                );
              }
            }
            this.state = 'CLIMB';
            this.stateEndTime = time + 650;
            return;
          }

          if (time >= this.stateEndTime || this.sprite.y >= CONFIG.GROUND_Y - 26) {
            this.state = 'CLIMB';
            this.stateEndTime = time + 650;
          }
        } else if (this.state === 'CLIMB') {
          this.sprite.body.setVelocityX(this.flyDir * CONFIG.ENEMY.SEAGULL.FLY_SPEED);
          this.sprite.body.setVelocityY(-185);
          if (this.sprite.y <= this.baseY || time >= this.stateEndTime) {
            this.sprite.y = Math.max(95, this.baseY);
            this.sprite.body.setVelocityY(0);
            this.state = 'COOLDOWN';
            this.stateEndTime = time + CONFIG.ENEMY.SEAGULL.COOLDOWN_MS;
          }
        } else if (this.state === 'COOLDOWN') {
          this.sprite.body.setVelocityX(this.flyDir * (CONFIG.ENEMY.SEAGULL.FLY_SPEED * 0.8));
          this.sprite.body.setVelocityY(Math.sin(time * 0.006) * 20);
          if (time >= this.stateEndTime) {
            this.state = 'SOAR';
          }
        }
      }
    }
