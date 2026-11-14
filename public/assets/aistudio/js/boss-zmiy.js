/**
 * boss-zmiy.js
 * АКТ IV: Дике поле і Чорне море — Фінальний бос Триголовий Змій Соляногорич
 * Перероблена простора та динамічна 3-стадійна битва (у стилі битви з Морським Царем):
 * - Стадія 1 (3 активні голови, помірна складність): гравець оглушує та вибиває 1-шу голову («У БОЧКУ!»).
 * - Стадія 2 (2 активні голови, сильніший і швидший): гравець оглушує та присипляє 2-гу голову («ХРІП-СОН!»).
 * - Стадія 3 (1 коронована розлючена голова, фінальний штурм): гравець оглушує 3-тю голову і збиває золоту корону!
 */

class ZmiyHead {
    constructor(scene, boss, index, headType, baseOffsetX, baseOffsetY, maxStun, textureKey) {
        this.scene = scene;
        this.boss = boss;
        this.index = index; // 0: Ліва (Голодна), 1: Середня (Сонна), 2: Права (Царська)
        this.headType = headType;
        this.enemyType = 'BOSS_ZMIY_HEAD';
        this.isBoss = true;
        this.isZmiyHead = true;

        this.baseX = boss.arenaStartX + baseOffsetX;
        this.baseY = baseOffsetY;

        this.maxStun = maxStun;
        this.stun = 0;

        this.isStunned = false;
        this.isKnockedOut = false;
        this.isDefeated = false;
        this.isFinished = false;
        this.isTargetable = true;

        this.swoopTargetX = null;
        this.swoopTargetY = null;
        this.swoopEndTime = 0;
        this.exposeGroundUntil = 0;
        this.lastLungeDamageTime = 0;

        this.sprite = scene.physics.add.sprite(this.baseX, this.baseY, textureKey);
        this.sprite.setImmovable(true);
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setSize(76, 66);
        this.sprite.body.setOffset(6, 6);
        // Голови Змія на глибині 26 — ЗАВЖДИ позаду Омелька (depth 35), щоб героя було ідеально видно!
        this.sprite.setDepth(26);
        this.sprite.enemyRef = this;

        this.headLabel = scene.add.text(this.baseX, this.baseY - 52, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#FFF8E7',
            stroke: '#1B0F08',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(28).setVisible(false);

        this.stunStars = scene.add.text(this.baseX, this.baseY - 62, '★ ★ ★', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFD54F',
            stroke: '#3E2723',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(29).setVisible(false);

        this.barrelVisual = null;
        this.sleepText = null;
        this.crownVisual = null;

        if (this.headType === 'CROWNED') {
            const cg = scene.add.graphics().setDepth(27);
            cg.fillStyle(0xffd166, 1);
            cg.lineStyle(2, 0xb56576, 1);
            cg.fillTriangle(-18, 0, -10, -16, -2, 0);
            cg.fillTriangle(-4, 0, 4, -20, 12, 0);
            cg.fillTriangle(10, 0, 18, -15, 24, 0);
            cg.fillRect(-18, -2, 42, 5);
            cg.fillStyle(0xff0055, 1);
            cg.fillCircle(4, -7, 3);
            cg.setPosition(this.baseX + 4, this.baseY - 34);
            this.crownVisual = cg;
        }
    }

    getHeadTitle() {
        if (this.headType === 'HUNGRY') return STRINGS.BOSS_ZMIY_HEAD_HUNGRY || 'І. Голодна голова';
        if (this.headType === 'SLEEPY') return STRINGS.BOSS_ZMIY_HEAD_SLEEPY || 'ІІ. Сонна голова';
        return STRINGS.BOSS_ZMIY_HEAD_PROUD || 'ІІІ. Царська голова';
    }

    /**
     * Викликається з scene-game.js для кожного ворога в this.enemies:
     * перевіряє зіткнення під час пікірування голови на гравця.
     */
    update(time, player) {
        if (this.isKnockedOut || this.isFinished || this.isStunned || !this.boss || !this.boss.active || this.boss.isFinished) {
            return;
        }
        // Контактна шкода під час активного випаду (swoop) голови
        if (
            this.swoopTargetX !== null &&
            time < this.swoopEndTime &&
            player &&
            player.sprite &&
            time - this.lastLungeDamageTime > 900
        ) {
            const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.sprite.x, player.sprite.y);
            if (dist < 46) {
                this.lastLungeDamageTime = time;
                const dmg = (CONFIG.ENEMY.BOSS_ZMIY && CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_LUNGE) || 18;
                player.takeDamage(dmg, this.sprite.x);
            }
        }
    }

    /**
     * Спрямовує будь-який удар по активній голові у поточну цільову голову стадії,
     * щоб гравець міг зручно бити будь-яку голову, яка опустилася або підлетіла!
     */
    receiveStunHit(amount, sourceX, isHeavy = false, isCounterAttack = false, isSwampFrog = false) {
        if (this.boss.isDefeated || this.boss.isFinished) return;
        this.boss.routeHitToStageHead(this, amount, sourceX, isHeavy, isCounterAttack, isSwampFrog);
    }

    applyDirectStageHit(amount, sourceX, isHeavy = false, isCounterAttack = false, isSwampFrog = false) {
        if (this.isKnockedOut || this.boss.isDefeated || this.boss.isFinished) return;

        const now = this.scene.time.now;

        // Якщо голова вже оглушена (чекає на Фінішер на землі) — будь-який удар шаблею чи жабою виконує Фінішер стадії!
        if (this.isStunned) {
            this.boss.executeStageFinisher(this);
            return;
        }

        // Під час короткої зміни стадії бос невразливий
        if (now < this.boss.invulnerableUntil) {
            this.sprite.setTint(0xB0BEC5);
            this.scene.time.delayedCall(100, () => {
                if (this.sprite && this.sprite.active) this.sprite.clearTint();
            });
            return;
        }

        let actualStun = amount;
        if (isSwampFrog) {
            actualStun = Math.round(amount * 1.35);
        } else if (isHeavy || isCounterAttack) {
            actualStun = Math.round(amount * 1.25);
        }

        this.stun = Math.min(this.maxStun, this.stun + actualStun);

        // Візуальний відгук удару (без стробоскопа)
        this.sprite.setTint(isSwampFrog ? 0xA5D6A7 : 0xFFE082);
        this.scene.time.delayedCall(130, () => {
            if (this.sprite && this.sprite.active && !this.isStunned && !this.isKnockedOut) {
                this.sprite.clearTint();
            }
        });

        if (typeof SFX !== 'undefined' && SFX.panHit) {
            SFX.panHit(isHeavy || isSwampFrog);
        }
        if (this.scene.spawnHitParticles) {
            this.scene.spawnHitParticles(this.sprite.x - 10, this.sprite.y, isHeavy ? 8 : 5);
        }

        // Перевірка досягнення повного оглушення поточної голови
        if (this.stun >= this.maxStun) {
            this.enterStunnedFinisherWindow();
            return;
        }

        // Лічильник ударів до контратаки (як у Водяника)
        this.boss.onStageHeadDamaged(this);
    }

    enterStunnedFinisherWindow() {
        if (this.isStunned || this.isKnockedOut) return;
        this.isStunned = true;
        this.stun = this.maxStun;
        this.swoopTargetX = null;
        this.swoopTargetY = null;

        if (typeof SFX !== 'undefined' && SFX.stunFull) {
            SFX.stunFull();
        }

        this.stunStars.setText('★ ★ ★');
        this.stunStars.setVisible(true);
        this.sprite.setTint(0xFFE082);

        const cfg = CONFIG.ENEMY.BOSS_ZMIY || {};
        const finisherDuration = cfg.FINISHER_WINDOW_DURATION || 6500;

        // Якщо гравець не встиг добити за 6.5 с, голова частково отямлюється (залишає 68% оглушення)
        this.stunTimer = this.scene.time.delayedCall(finisherDuration, () => {
            if (this.isStunned && !this.isKnockedOut && !this.boss.isDefeated) {
                this.isStunned = false;
                this.stun = Math.floor(this.maxStun * 0.68);
                this.stunStars.setVisible(false);
                this.sprite.clearTint();
            }
        });
    }

    startSwoop(targetX, targetY, durationMs = 1100, exposeGroundMs = 1500) {
        if (this.isKnockedOut || this.isStunned) return;
        const now = this.scene.time.now;
        this.swoopTargetX = targetX;
        this.swoopTargetY = targetY;
        this.swoopEndTime = now + durationMs;
        this.exposeGroundUntil = now + durationMs + exposeGroundMs;
    }

    updateMovement(time, stage) {
        if (!this.sprite || !this.sprite.active) return;

        // 1. Якщо голова вже вибита в попередній стадії — мирно звисає біля підніжжя праворуч
        if (this.isKnockedOut) {
            const restX = this.boss.arenaStartX + 950 + this.index * 52;
            const restY = CONFIG.GROUND_Y - 26;
            this.sprite.x = Phaser.Math.Linear(this.sprite.x, restX, 0.08);
            this.sprite.y = Phaser.Math.Linear(this.sprite.y, restY, 0.08);
            this.headLabel.setPosition(this.sprite.x, this.sprite.y - 46);
            if (this.barrelVisual) {
                this.barrelVisual.setPosition(this.sprite.x - 10, this.sprite.y + 2);
            }
            if (this.sleepText) {
                this.sleepText.setPosition(this.sprite.x, this.sprite.y - 54 + Math.sin(time * 0.005) * 4);
            }
            return;
        }

        // 2. Якщо голова ОГЛУШЕНА і чекає на Фінішер — опускається прямо на рівень землі перед гравцем!
        if (this.isStunned) {
            const stunnedX = this.boss.arenaStartX + 740;
            const stunnedY = CONFIG.GROUND_Y - 38 + Math.sin(time * 0.01) * 3;
            this.sprite.x = Phaser.Math.Linear(this.sprite.x, stunnedX, 0.12);
            this.sprite.y = Phaser.Math.Linear(this.sprite.y, stunnedY, 0.12);
            this.headLabel.setPosition(this.sprite.x, this.sprite.y - 50);
            this.stunStars.setPosition(this.sprite.x, this.sprite.y - 72);
            if (this.crownVisual) {
                this.crownVisual.setPosition(this.sprite.x + 4, this.sprite.y - 34);
            }
            return;
        }

        // 3. Якщо голова виконує випад (swoop) або затрималася низько після атаки для зручного удару
        if (this.swoopTargetX !== null && time < this.swoopEndTime) {
            this.sprite.x = Phaser.Math.Linear(this.sprite.x, this.swoopTargetX, 0.11);
            this.sprite.y = Phaser.Math.Linear(this.sprite.y, this.swoopTargetY, 0.11);
        } else if (time < this.exposeGroundUntil) {
            // Затримується низько над землею, щоб Омелько міг легко вдарити шаблею прямо з землі!
            const exposeX = this.boss.arenaStartX + 760 - (2 - this.index) * 45;
            const exposeY = CONFIG.GROUND_Y - 44 + Math.sin(time * 0.006 + this.index) * 5;
            this.sprite.x = Phaser.Math.Linear(this.sprite.x, exposeX, 0.09);
            this.sprite.y = Phaser.Math.Linear(this.sprite.y, exposeY, 0.09);
        } else {
            this.swoopTargetX = null;
            this.swoopTargetY = null;
            // Природне погойдування на зручній для стрибка/платформ висоті
            const speedMult = stage === 3 ? 0.0046 : (stage === 2 ? 0.0036 : 0.0028);
            const ampX = stage === 3 ? 52 : (stage === 2 ? 38 : 28);
            const ampY = stage === 3 ? 26 : 18;

            const targetX = this.baseX + Math.sin(time * speedMult + this.index * 1.9) * ampX;
            const targetY = this.baseY + Math.cos(time * (speedMult * 1.15) + this.index * 1.4) * ampY;

            this.sprite.x = Phaser.Math.Linear(this.sprite.x, targetX, 0.08);
            this.sprite.y = Phaser.Math.Linear(this.sprite.y, targetY, 0.08);
        }

        this.headLabel.setPosition(this.sprite.x, this.sprite.y - 50);
        this.stunStars.setPosition(this.sprite.x, this.sprite.y - 72);

        if (this.crownVisual) {
            this.crownVisual.setPosition(this.sprite.x + 4, this.sprite.y - 34);
        }
    }
}

class SalyonohorychBoss {
    constructor(scene, arenaStartX) {
        this.scene = scene;
        this.arenaStartX = arenaStartX || 6240;
        this.enemyType = 'BOSS_ZMIY';
        this.isBoss = true;
        // Обидва прапорці сумісності для scene-game.js та ui.js
        this.isCompositeZmiy = true;
        this.isZmiyComposite = true;

        // 3 стадії бою: 1 (3 голови) -> 2 (2 голови) -> 3 (1 коронована голова)
        this.stage = 1;
        this.phase = 1;
        this.active = false;
        this.isActivated = false;
        this.isDefeated = false;
        this.isFinished = false;

        this.state = 'IDLE';
        this.stateEndTime = 0;
        this.lastAttackIndex = -1;
        this.invulnerableUntil = 0;

        // Лічильник ударів у поточній стадії до миттєвої контратаки
        this.hitsInCurrentWindow = 0;

        // Координати тіла Змія на правому краю широкої арени (6240..7500)
        // Тіло позаду Омелька за глибиною, залишаючи понад 820 px чистого простору для маневрів!
        this.bodyCenterX = this.arenaStartX + 1045; // 7285
        this.bodyCenterY = CONFIG.GROUND_Y - 92;   // 313

        // Графічні шари тіла Змія: усі позаду Омелька (depth 35)!
        this.bodyBackGraphics = scene.add.graphics().setDepth(16);
        this.necksGraphics = scene.add.graphics().setDepth(20);
        this.bodyFrontGraphics = scene.add.graphics().setDepth(21);
        this.effectsGraphics = scene.add.graphics().setDepth(24);

        const cfg = CONFIG.ENEMY.BOSS_ZMIY || {};

        // Створюємо 3 голови з текстурами BootScene ('zmiy_head_hungry', 'zmiy_head_sleepy', 'zmiy_head_proud'):
        // І. Ліва Ненажерлива голова — ціль Стадії 1
        this.leftHead = new ZmiyHead(
            scene,
            this,
            0,
            'HUNGRY',
            785,                        // x = 7025
            CONFIG.GROUND_Y - 102,      // легко дістати з землі або малого стрибка
            cfg.STAGE_1_MAX_STUN || 145,
            'zmiy_head_hungry'
        );

        // ІІ. Середня Сонно-Мудра голова — ціль Стадії 2
        this.midHead = new ZmiyHead(
            scene,
            this,
            1,
            'SLEEPY',
            855,                        // x = 7095
            CONFIG.GROUND_Y - 148,      // рівень 1-го ярусу платформ або стрибка
            cfg.STAGE_2_MAX_STUN || 170,
            'zmiy_head_sleepy'
        );

        // ІІІ. Права Коронована голова — ціль Стадії 3
        this.rightHead = new ZmiyHead(
            scene,
            this,
            2,
            'CROWNED',
            920,                        // x = 7160
            CONFIG.GROUND_Y - 124,
            cfg.STAGE_3_MAX_STUN || 205,
            'zmiy_head_proud'
        );

        this.heads = [this.leftHead, this.midHead, this.rightHead];

        // Сумісність із перевірками this.boss.sprite у scene-game.js
        this.sprite = this.midHead.sprite;

        this.wingBeatPhase = 0;
        this.tailSwayPhase = 0;
        this.vortexActiveUntil = 0;
        this.activeSaltMist = null;
        this.pendingPillarMarkers = [];

        this.updateStageTargetMarkers();
        this.drawDragonBody(0);
    }

    /**
     * Повертає головну цільову голову поточної стадії (1 -> leftHead, 2 -> midHead, 3 -> rightHead)
     */
    getCurrentStageTargetHead() {
        if (this.stage === 1) return this.leftHead;
        if (this.stage === 2) return this.midHead;
        return this.rightHead;
    }

    /**
     * Оновлює підписи над головами, щоб гравець чітко бачив активні голови та головну ціль стадії
     */
    updateStageTargetMarkers() {
        this.heads.forEach((h) => {
            if (h.headLabel) h.headLabel.setVisible(false);
        });
    }

    /**
     * Будь-який удар по будь-якій активній голові зараховує оглушення в цільову голову поточної стадії!
     */
    routeHitToStageHead(hitHead, amount, sourceX, isHeavy, isCounterAttack, isSwampFrog) {
        if (this.isDefeated || this.isFinished) return;
        const targetHead = this.getCurrentStageTargetHead();
        if (!targetHead || targetHead.isKnockedOut) return;

        if (!this.active) {
            this.activate();
        }

        // Якщо поточна цільова голова вже оглушена — удар по ній або по будь-якій активній голові виконує Фінішер!
        if (targetHead.isStunned) {
            this.executeStageFinisher(targetHead);
            return;
        }

        // Підсвічуємо також ту голову, по якій фізично прийшовся удар
        if (hitHead && hitHead !== targetHead && hitHead.sprite && hitHead.sprite.active && !hitHead.isKnockedOut) {
            hitHead.sprite.setTint(0xFFF59D);
            this.scene.time.delayedCall(120, () => {
                if (hitHead.sprite && hitHead.sprite.active && !hitHead.isKnockedOut) {
                    hitHead.sprite.clearTint();
                }
            });
        }

        targetHead.applyDirectStageHit(amount, sourceX, isHeavy, isCounterAttack, isSwampFrog);
    }

    onStageHeadDamaged(targetHead) {
        if (this.isDefeated || targetHead.isStunned || targetHead.isKnockedOut) return;

        this.hitsInCurrentWindow = (this.hitsInCurrentWindow || 0) + 1;
        const cfg = CONFIG.ENEMY.BOSS_ZMIY || {};
        const maxHits = this.stage === 1
            ? (cfg.HITS_BEFORE_COUNTER_STAGE_1 || 5)
            : (this.stage === 2 ? (cfg.HITS_BEFORE_COUNTER_STAGE_2 || 4) : (cfg.HITS_BEFORE_COUNTER_STAGE_3 || 3));

        // Коли гравець наніс серію ударів — Змій виконує телеграфовану контратаку
        if (this.hitsInCurrentWindow >= maxHits && this.state === 'COOLDOWN') {
            this.hitsInCurrentWindow = 0;
            this.stateEndTime = this.scene.time.now + 120;
        }
    }

    /**
     * Виконує Фінішер стадії (1 -> бочка на 1-шу голову; 2 -> присипляння 2-ї голови; 3 -> збиття корони та перемога!)
     */
    executeStageFinisher(head) {
        if (!head || head.isKnockedOut || this.isDefeated || this.isFinished) return;

        if (head.stunTimer) head.stunTimer.remove(false);
        head.isStunned = false;
        head.isKnockedOut = true;
        head.isFinished = true;
        head.isTargetable = false;
        head.stun = head.maxStun;
        head.stunStars.setVisible(false);
        head.sprite.clearTint();

        if (typeof SFX !== 'undefined' && SFX.finisher) {
            SFX.finisher();
        }
        this.scene.cameras.main.shake(260, 0.011);

        // Очищуємо поточні попередження про стовпи під час зміни стадії
        this.clearPendingPillarMarkers();

        const cfg = CONFIG.ENEMY.BOSS_ZMIY || {};
        const now = this.scene.time.now;
        this.invulnerableUntil = now + (cfg.PHASE_TRANSITION_INVULN_MS || 1400);
        this.hitsInCurrentWindow = 0;

        if (this.stage === 1) {
            // === ЗАВЕРШЕННЯ СТАДІЇ 1: Перша голова застрягає в дубовій бочці! ===
            head.barrelVisual = this.scene.add.image(head.sprite.x - 10, head.sprite.y + 2, 'prop_barrel')
                .setDepth(28)
                .setAngle(-18)
                .setScale(1.1);
            head.headLabel.setText('І. У БОЧЦІ!');
            head.headLabel.setColor('#B0BEC5');
            head.sprite.setTint(0x90A4AE);

            // Нагорода гравцеві після 1-ї стадії (лікування + жаби + червінці)
            this.spawnStageReward(head.sprite.x - 60, head.sprite.y - 20);

            this.stage = 2;
            this.phase = 2;
            this.state = 'COOLDOWN';
            this.stateEndTime = now + 1800;

            // Опускаємо базову висоту 2-ї та 3-ї голів трохи нижче для зручного бою у Стадії 2
            this.midHead.baseX = this.arenaStartX + 800;
            this.midHead.baseY = CONFIG.GROUND_Y - 118;
            this.rightHead.baseX = this.arenaStartX + 895;
            this.rightHead.baseY = CONFIG.GROUND_Y - 132;

            this.updateStageTargetMarkers();
            if (typeof SFX !== 'undefined' && SFX.zmiyRoar) SFX.zmiyRoar();
            if (this.scene.showFloatingText) {
                this.scene.showFloatingText(this.arenaStartX + 540, 155, STRINGS.BOSS_ZMIY_PHASE_2, '#ffd166');
            }

        } else if (this.stage === 2) {
            // === ЗАВЕРШЕННЯ СТАДІЇ 2: Друга голова оглушена та засинає! ===
            head.sleepText = this.scene.add.text(head.sprite.x, head.sprite.y - 48, 'Z-z-z', {
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#B3E5FC',
                stroke: '#01579B',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(28);
            head.sprite.setTint(0x78909C);

            // Нагорода гравцеві перед фінальною 3-ю стадією
            this.spawnStageReward(head.sprite.x - 60, head.sprite.y - 20);

            this.stage = 3;
            this.phase = 3;
            this.state = 'COOLDOWN';
            this.stateEndTime = now + 2000;

            // Коронована голова стає єдиною активною і спускається ближче до Омелька!
            this.rightHead.baseX = this.arenaStartX + 815;
            this.rightHead.baseY = CONFIG.GROUND_Y - 110;

            this.updateStageTargetMarkers();
            if (typeof SFX !== 'undefined' && SFX.zmiyRoar) SFX.zmiyRoar();
            if (this.scene.showFloatingText) {
                this.scene.showFloatingText(this.arenaStartX + 540, 155, STRINGS.BOSS_ZMIY_PHASE_3, '#ff4d6d');
            }

            if (this.scene.triggerSaltMountainCracksAndDarkSky) {
                this.scene.triggerSaltMountainCracksAndDarkSky();
            }

        } else {
            // === ЗАВЕРШЕННЯ СТАДІЇ 3: Збиття золотої корони з останньої голови та ПЕРЕМОГА! ===
            if (head.crownVisual) {
                this.scene.tweens.add({
                    targets: head.crownVisual,
                    x: head.crownVisual.x - 160,
                    y: CONFIG.GROUND_Y - 12,
                    angle: -145,
                    duration: 950,
                    ease: 'Bounce.easeOut'
                });
            }
            head.headLabel.setText('ІІІ. БЕЗ КОРОНИ!');
            head.headLabel.setColor('#FFD54F');
            if (this.scene.showFloatingText) {
                this.scene.showFloatingText(head.sprite.x - 40, head.sprite.y - 70, STRINGS.FINISHER_CROWN_OFF, '#ffd166');
            }
            this.triggerBossDefeatFinale();
        }
    }

    spawnStageReward(x, y) {
        const safeX = Phaser.Math.Clamp(x, this.arenaStartX + 220, this.arenaStartX + 820);
        if (this.scene.spawnLoot) {
            this.scene.spawnLoot(safeX, y);
        }
    }

    clearPendingPillarMarkers() {
        if (!this.pendingPillarMarkers) return;
        this.pendingPillarMarkers.forEach(item => {
            if (item.timer) item.timer.remove(false);
            if (item.marker && item.marker.active) item.marker.destroy();
        });
        this.pendingPillarMarkers = [];
    }

    /**
     * Малює масивний лускатий тулуб, крила, лапи, хвіст і три шиї Змія Соляногорича
     */
    drawDragonBody(time) {
        this.bodyBackGraphics.clear();
        this.necksGraphics.clear();
        this.bodyFrontGraphics.clear();
        this.effectsGraphics.clear();

        if (!this.leftHead.sprite || !this.leftHead.sprite.active) return;

        this.wingBeatPhase = time * (this.stage === 3 ? 0.0065 : 0.004);
        this.tailSwayPhase = time * 0.003;

        const bx = this.bodyCenterX;
        const by = this.bodyCenterY;

        // 1. ЗАДНІЙ ПЛАН ТІЛА: Крила та Хвіст з соляними кристалами (depth 16)
        const wingLift = Math.sin(this.wingBeatPhase) * 28;

        // Ліве (дальнє) крило
        this.bodyBackGraphics.fillStyle(0x1B3B2B, 1);
        this.bodyBackGraphics.lineStyle(3, 0x0F2419, 1);
        this.bodyBackGraphics.beginPath();
        this.bodyBackGraphics.moveTo(bx - 30, by - 50);
        this.bodyBackGraphics.lineTo(bx - 135, by - 165 + wingLift);
        this.bodyBackGraphics.lineTo(bx - 65, by - 115 + wingLift * 0.6);
        this.bodyBackGraphics.lineTo(bx - 20, by - 25);
        this.bodyBackGraphics.closePath();
        this.bodyBackGraphics.fillPath();
        this.bodyBackGraphics.strokePath();

        // Праве (ближнє) крило з перетинками
        this.bodyBackGraphics.fillStyle(0x2E5A44, 1);
        this.bodyBackGraphics.lineStyle(3, 0x163022, 1);
        this.bodyBackGraphics.beginPath();
        this.bodyBackGraphics.moveTo(bx + 10, by - 55);
        this.bodyBackGraphics.lineTo(bx + 125, by - 175 - wingLift * 0.8);
        this.bodyBackGraphics.lineTo(bx + 150, by - 95 - wingLift * 0.5);
        this.bodyBackGraphics.lineTo(bx + 85, by - 50);
        this.bodyBackGraphics.lineTo(bx + 30, by - 10);
        this.bodyBackGraphics.closePath();
        this.bodyBackGraphics.fillPath();
        this.bodyBackGraphics.strokePath();

        // Хвіст із соляною булавою на кінці
        const tailWave = Math.sin(this.tailSwayPhase) * 16;
        this.bodyBackGraphics.lineStyle(22, 0x264D3B, 1);
        this.bodyBackGraphics.beginPath();
        this.bodyBackGraphics.moveTo(bx + 50, by + 55);
        this.bodyBackGraphics.lineTo(bx + 115, by + 68 + tailWave * 0.5);
        this.bodyBackGraphics.lineTo(bx + 165, by + 46 + tailWave);
        this.bodyBackGraphics.strokePath();

        // Кристалічна булава на хвості
        this.bodyBackGraphics.fillStyle(0xF8BBD0, 0.92);
        this.bodyBackGraphics.fillTriangle(
            bx + 155, by + 32 + tailWave,
            bx + 190, by + 44 + tailWave,
            bx + 162, by + 62 + tailWave
        );

        // 2. ТРИ ДОВГІ ЛУСКАТІ ШИЇ (depth 20)
        const shoulders = [
            { x: bx - 52, y: by - 36, color: 0x2E5A44, crest: 0x80CBC4 },
            { x: bx - 18, y: by - 56, color: 0x35694F, crest: 0xF48FB1 },
            { x: bx + 18, y: by - 42, color: 0x264D3B, crest: 0xFFD54F }
        ];

        this.heads.forEach((head, idx) => {
            const sh = shoulders[idx];
            const hx = head.sprite.x + 16;
            const hy = head.sprite.y + 8;

            const midX = (sh.x + hx) * 0.5 - 12;
            const sag = head.isKnockedOut ? 42 : (head.isStunned ? 30 : Math.sin(time * 0.004 + idx) * 14);
            const midY = (sh.y + hy) * 0.5 + sag;

            this.necksGraphics.lineStyle(24, 0x163022, 1);
            this.necksGraphics.beginPath();
            this.necksGraphics.moveTo(sh.x, sh.y);
            this.necksGraphics.lineTo(midX, midY);
            this.necksGraphics.lineTo(hx, hy);
            this.necksGraphics.strokePath();

            this.necksGraphics.lineStyle(18, sh.color, 1);
            this.necksGraphics.beginPath();
            this.necksGraphics.moveTo(sh.x, sh.y);
            this.necksGraphics.lineTo(midX, midY);
            this.necksGraphics.lineTo(hx, hy);
            this.necksGraphics.strokePath();

            // Соляні гребені вздовж шиї
            this.necksGraphics.fillStyle(sh.crest, 0.9);
            this.necksGraphics.fillTriangle(midX - 6, midY - 12, midX + 6, midY - 12, midX, midY - 26);
        });

        // 3. ПЕРЕДНІЙ ПЛАН ТІЛА: Груди в соляній броні та могутні лапи (depth 21)
        this.bodyFrontGraphics.fillStyle(0x264D3B, 1);
        this.bodyFrontGraphics.lineStyle(4, 0x12261C, 1);
        this.bodyFrontGraphics.fillEllipse(bx, by + 12, 145, 130);
        this.bodyFrontGraphics.strokeEllipse(bx, by + 12, 145, 130);

        // Золотаво-соляне черевце
        this.bodyFrontGraphics.fillStyle(0xD7CCC8, 0.85);
        this.bodyFrontGraphics.fillEllipse(bx - 16, by + 20, 86, 94);

        // Ребра панцира на грудях
        this.bodyFrontGraphics.lineStyle(3, 0x8D6E63, 0.8);
        for (let r = -22; r <= 44; r += 16) {
            this.bodyFrontGraphics.beginPath();
            this.bodyFrontGraphics.moveTo(bx - 48, by + r);
            this.bodyFrontGraphics.lineTo(bx + 14, by + r + 5);
            this.bodyFrontGraphics.strokePath();
        }

        // Рожеві друзи солі на плечах Змія
        this.bodyFrontGraphics.fillStyle(0xF48FB1, 0.92);
        this.bodyFrontGraphics.fillTriangle(bx - 42, by - 40, bx - 22, by - 40, bx - 32, by - 72);
        this.bodyFrontGraphics.fillTriangle(bx + 4, by - 45, bx + 26, by - 45, bx + 15, by - 80);

        // Передні пазуристі лапи на соляному березі
        this.bodyFrontGraphics.fillStyle(0x1B3B2B, 1);
        this.bodyFrontGraphics.fillRoundedRect(bx - 64, CONFIG.GROUND_Y - 34, 48, 34, 8);
        this.bodyFrontGraphics.fillRoundedRect(bx + 12, CONFIG.GROUND_Y - 34, 52, 34, 8);

        // 4. ВІЗУАЛЬНІ ЕФЕКТИ ВИХОРУ КРИЛ (depth 24)
        if (time < this.vortexActiveUntil) {
            this.effectsGraphics.lineStyle(3, 0xE1F5FE, 0.55);
            for (let w = 0; w < 4; w++) {
                const wx = bx - 160 - ((time * 0.45 + w * 180) % 680);
                const wy = CONFIG.GROUND_Y - 45 - w * 42 + Math.sin(time * 0.01 + w) * 14;
                this.effectsGraphics.beginPath();
                this.effectsGraphics.moveTo(wx, wy);
                this.effectsGraphics.lineTo(wx + 85, wy - 8);
                this.effectsGraphics.strokePath();
            }
        }
    }

    /**
     * Викликається з scene-game.js (this.boss.activate()) при вході Омелька на арену Соляної Гори
     */
    activate() {
        if (this.active) return;
        this.active = true;
        this.isActivated = true;
        this.stage = 1;
        this.phase = 1;
        this.state = 'COOLDOWN';
        this.stateEndTime = this.scene.time.now + 1500;

        this.updateStageTargetMarkers();
        if (typeof SFX !== 'undefined' && SFX.zmiyRoar) {
            SFX.zmiyRoar();
        }
        this.scene.time.delayedCall(1200, () => {
            if (!this.isDefeated && this.stage === 1 && this.scene.showFloatingText) {
                this.scene.showFloatingText(this.arenaStartX + 540, 145, STRINGS.BOSS_ZMIY_PHASE_1, '#ffd166');
            }
        });
    }

    activateBoss() {
        this.activate();
    }

    /**
     * Головний цикл оновлення боса.
     * Підтримує обидва варіанти виклику: update(time, player) зі scene-game.js та update(time, delta, player).
     */
    update(time, arg2, arg3) {
        const player = (arg2 && arg2.sprite) ? arg2 : arg3;
        const delta = (typeof arg2 === 'number') ? arg2 : ((this.scene.game && this.scene.game.loop) ? this.scene.game.loop.delta : 16.6);

        if (this.isDefeated || this.isFinished) {
            this.drawDragonBody(time);
            return;
        }

        // Оновлюємо рух усіх трьох голів
        this.heads.forEach(head => head.updateMovement(time, this.stage));

        // Малюємо тіло та шиї позаду голів і позаду Омелька
        this.drawDragonBody(time);

        if (!this.active) {
            if (player && player.sprite && player.sprite.x >= this.arenaStartX + 35) {
                this.activate();
            }
            return;
        }

        // Якщо активний крилатий вихор — м'яко відштовхує гравця вліво, але без провалювання!
        if (time < this.vortexActiveUntil && player && player.sprite && player.sprite.body) {
            const windForce = (CONFIG.ENEMY.BOSS_ZMIY && CONFIG.ENEMY.BOSS_ZMIY.VORTEX_PUSH_X) || 115;
            player.sprite.x = Math.max(this.arenaStartX + 48, player.sprite.x - (windForce * delta) / 1000);
        }

        // Якщо цільова голова поточної стадії зараз оглушена і чекає на Фінішер — бос не починає нових атак
        const targetHead = this.getCurrentStageTargetHead();
        if (targetHead && targetHead.isStunned) {
            return;
        }

        if (time >= this.stateEndTime && player && player.sprite) {
            if (this.state === 'COOLDOWN') {
                this.chooseNextAttack(time, player);
            } else {
                const cfg = CONFIG.ENEMY.BOSS_ZMIY || {};
                const cooldown = this.stage === 1
                    ? (cfg.ATTACK_COOLDOWN_STAGE_1 || 2250)
                    : (this.stage === 2 ? (cfg.ATTACK_COOLDOWN_STAGE_2 || 1750) : (cfg.ATTACK_COOLDOWN_STAGE_3 || 1350));
                this.state = 'COOLDOWN';
                this.stateEndTime = time + cooldown;
            }
        }
    }

    chooseNextAttack(time, player) {
        if (this.stage === 1) {
            // === СТАДІЯ 1: 3 активні голови, помірна складність, широкі вікна для ударів ===
            const pool = ['HUNGRY_SWOOP', 'SALT_WAVE', 'CRYSTAL_VOLLEY'];
            const next = this.pickNonRepeatingAttack(pool);
            if (next === 'HUNGRY_SWOOP') {
                this.performStage1HungrySwoop(time, player);
            } else if (next === 'SALT_WAVE') {
                this.performSaltWaveAttack(time, 1);
            } else {
                this.performCrystalVolleyAttack(time, player, 2);
            }
        } else if (this.stage === 2) {
            // === СТАДІЯ 2: 2 активні голови, сильніші та комбіновані атаки ===
            const pool = ['DUAL_SWOOP', 'SALT_PILLARS', 'MIST_AND_WAVE', 'SHARD_FAN'];
            const next = this.pickNonRepeatingAttack(pool);
            if (next === 'DUAL_SWOOP') {
                this.performStage2DualSwoop(time, player);
            } else if (next === 'SALT_PILLARS') {
                this.performSaltPillarsAttack(time, player, 3, false);
            } else if (next === 'MIST_AND_WAVE') {
                this.performSleepyMistAttack(time, player);
                this.scene.time.delayedCall(600, () => {
                    if (!this.isDefeated && this.stage === 2) {
                        this.performSaltWaveAttack(this.scene.time.now, 1);
                    }
                });
            } else {
                this.performShardFanAttack(time, player, 3);
            }
        } else {
            // === СТАДІЯ 3: 1 Коронована розлючена голова, фінальний штурм ===
            const pool = ['CROWN_CHARGE', 'ROYAL_PILLARS', 'AVALANCHE_AND_WAVE', 'WING_VORTEX_FAN'];
            const next = this.pickNonRepeatingAttack(pool);
            if (next === 'CROWN_CHARGE') {
                this.performStage3CrownCharge(time, player);
            } else if (next === 'ROYAL_PILLARS') {
                this.performSaltPillarsAttack(time, player, 4, true);
            } else if (next === 'AVALANCHE_AND_WAVE') {
                this.performRockfallAndTailAttack(time, player);
            } else {
                this.performWingVortexAndFan(time, player);
            }
        }
    }

    pickNonRepeatingAttack(pool) {
        let idx = Phaser.Math.Between(0, pool.length - 1);
        if (pool.length > 1 && idx === this.lastAttackIndex) {
            idx = (idx + 1) % pool.length;
        }
        this.lastAttackIndex = idx;
        return pool[idx];
    }

    // =========================================================================
    // АТАКИ СТАДІЇ 1 (3 ГОЛОВИ — ПОМІРНИЙ ТЕМП)
    // =========================================================================

    /**
     * Атака 1 (Стадія 1): Ненажерлива голова пікірує до гравця і залишається низько над землею,
     * даючи гравцеві чудове вікно для ударів шаблею [D]!
     */
    performStage1HungrySwoop(time, player) {
        this.state = 'HUNGRY_SWOOP';
        this.stateEndTime = time + 2300;

        if (this.leftHead.isKnockedOut) return;

        const targetX = Phaser.Math.Clamp(player.sprite.x + 40, this.arenaStartX + 360, this.arenaStartX + 790);
        const targetY = CONFIG.GROUND_Y - 40;

        if (typeof SFX !== 'undefined' && SFX.telegraph) SFX.telegraph();
        this.leftHead.sprite.setTint(0xFFCC80);
        this.scene.time.delayedCall(420, () => {
            if (this.isDefeated || this.leftHead.isKnockedOut || this.leftHead.isStunned) return;
            this.leftHead.sprite.clearTint();
            this.leftHead.startSwoop(targetX, targetY, 950, 1750);
            if (typeof SFX !== 'undefined' && SFX.swing) SFX.swing(2, true);
        });
    }

    /**
     * Атака 2 (Стадія 1/2): Низова соляна хвиля по землі, яку легко перестрибнути або перечекати на платформі
     */
    performSaltWaveAttack(time, count = 1) {
        this.state = 'SALT_WAVE';
        this.stateEndTime = time + 1850;

        this.scene.cameras.main.shake(180, 0.006);
        const waveDmg = (CONFIG.ENEMY.BOSS_ZMIY && CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_WAVE) || 18;

        for (let i = 0; i < count; i++) {
            this.scene.time.delayedCall(i * 550, () => {
                if (this.isDefeated) return;
                const wave = this.scene.enemyProjectiles.create(
                    this.arenaStartX + 880,
                    CONFIG.GROUND_Y - 18,
                    'tail_scythe_wave'
                );
                wave.body.setAllowGravity(false);
                wave.setDepth(29);
                const spd = this.stage === 1 ? -285 : (this.stage === 2 ? -335 : -380);
                wave.setVelocityX(spd);
                wave.damageAmount = waveDmg;
            });
        }
    }

    /**
     * Атака 3 (Стадія 1): Повільний залп 2 соляних куль із середньої та правої голови
     */
    performCrystalVolleyAttack(time, player, orbCount = 2) {
        this.state = 'CRYSTAL_VOLLEY';
        this.stateEndTime = time + 1900;

        const shardDmg = (CONFIG.ENEMY.BOSS_ZMIY && CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_SHARD) || 16;
        const activeHeads = this.heads.filter(h => !h.isKnockedOut && !h.isStunned);
        for (let i = 0; i < orbCount; i++) {
            this.scene.time.delayedCall(250 + i * 480, () => {
                if (this.isDefeated || activeHeads.length === 0) return;
                const shooter = activeHeads[i % activeHeads.length];
                if (!shooter || !shooter.sprite || !shooter.sprite.active) return;

                if (typeof SFX !== 'undefined' && SFX.crystalChime) SFX.crystalChime();
                const orb = this.scene.enemyProjectiles.create(
                    shooter.sprite.x - 28,
                    shooter.sprite.y + 8,
                    'salt_shard'
                );
                orb.body.setAllowGravity(false);
                orb.setDepth(29);
                const angle = Phaser.Math.Angle.Between(orb.x, orb.y, player.sprite.x, player.sprite.y - 12);
                const speed = 265;
                orb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                orb.damageAmount = shardDmg;
            });
        }

        // Після залпу перша голова трохи опускається для зручної контратаки
        if (!this.leftHead.isKnockedOut && !this.leftHead.isStunned) {
            this.leftHead.exposeGroundUntil = time + 2200;
        }
    }

    // =========================================================================
    // АТАКИ СТАДІЇ 2 (2 ГОЛОВИ — СЕРЕДНІЙ/СИЛЬНИЙ ТЕМП)
    // =========================================================================

    /**
     * Подвійний випад двох активних голів по черзі з подальшим вікном для ударів
     */
    performStage2DualSwoop(time, player) {
        this.state = 'DUAL_SWOOP';
        this.stateEndTime = time + 2500;

        const first = this.midHead;
        const second = this.rightHead;

        if (!first.isKnockedOut && !first.isStunned) {
            if (typeof SFX !== 'undefined' && SFX.telegraph) SFX.telegraph();
            first.sprite.setTint(0xFFE082);
            this.scene.time.delayedCall(380, () => {
                if (this.isDefeated || first.isKnockedOut || first.isStunned) return;
                first.sprite.clearTint();
                const tx = Phaser.Math.Clamp(player.sprite.x + 30, this.arenaStartX + 340, this.arenaStartX + 800);
                first.startSwoop(tx, CONFIG.GROUND_Y - 40, 850, 1750);
            });
        }

        if (!second.isKnockedOut && !second.isStunned) {
            this.scene.time.delayedCall(820, () => {
                if (this.isDefeated || second.isKnockedOut || second.isStunned) return;
                const tx2 = Phaser.Math.Clamp(player.sprite.x + 70, this.arenaStartX + 420, this.arenaStartX + 830);
                second.startSwoop(tx2, CONFIG.GROUND_Y - 54, 800, 1400);
            });
        }
    }

    /**
     * Телеграфовані соляні стовпи з-під землі (як гейзери у Морського Царя!):
     * спочатку світяться чіткі рожево-золоті кола на землі (0.9 с), потім виростають стовпи солі!
     */
    performSaltPillarsAttack(time, player, pillarCount = 3, isRoyal = false) {
        this.state = 'SALT_PILLARS';
        this.stateEndTime = time + 2350;

        const cfg = CONFIG.ENEMY.BOSS_ZMIY || {};
        const warnDuration = cfg.PILLAR_WARNING_MS || 920;
        const pillarDmg = cfg.DAMAGE_WAVE || 18;
        const basePlayerX = Phaser.Math.Clamp(player.sprite.x, this.arenaStartX + 180, this.arenaStartX + 820);

        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(basePlayerX, CONFIG.GROUND_Y - 95, STRINGS.BOSS_ZMIY_PILLARS_WARN, '#ffd166');
        }

        for (let i = 0; i < pillarCount; i++) {
            const offset = (i - Math.floor(pillarCount / 2)) * 165;
            const px = Phaser.Math.Clamp(basePlayerX + offset, this.arenaStartX + 140, this.arenaStartX + 860);
            const py = CONFIG.GROUND_Y - 6;

            const marker = this.scene.add.graphics().setDepth(27);
            const ringColor = isRoyal ? 0xFFD54F : 0xF48FB1;
            marker.fillStyle(ringColor, 0.35);
            marker.fillEllipse(px, py, 74, 18);
            marker.lineStyle(3, 0xFFFFFF, 0.9);
            marker.strokeEllipse(px, py, 74, 18);

            const timer = this.scene.time.delayedCall(warnDuration + i * 140, () => {
                if (marker && marker.active) marker.destroy();
                if (this.isDefeated) return;

                this.scene.cameras.main.shake(140, 0.006);
                if (typeof SFX !== 'undefined' && SFX.crystalChime) SFX.crystalChime();

                // Візуальний стовп кристалічної солі
                const pillarVis = this.scene.add.graphics().setDepth(28);
                pillarVis.fillStyle(isRoyal ? 0xFFE082 : 0xF8BBD0, 0.92);
                pillarVis.lineStyle(3, isRoyal ? 0xFFB300 : 0xEC407A, 1);
                pillarVis.fillTriangle(px - 28, CONFIG.GROUND_Y, px + 28, CONFIG.GROUND_Y, px, CONFIG.GROUND_Y - 155);
                pillarVis.strokeTriangle(px - 28, CONFIG.GROUND_Y, px + 28, CONFIG.GROUND_Y, px, CONFIG.GROUND_Y - 155);

                // Хітбокс стовпа на 450 мс
                const hitbox = this.scene.enemyProjectiles.create(px, CONFIG.GROUND_Y - 70, 'salt_shard');
                hitbox.setVisible(false);
                hitbox.body.setAllowGravity(false);
                hitbox.body.setSize(42, 135);
                hitbox.damageAmount = pillarDmg;

                this.scene.time.delayedCall(450, () => {
                    if (hitbox && hitbox.active) hitbox.destroy();
                    this.scene.tweens.add({
                        targets: pillarVis,
                        alpha: 0,
                        y: 25,
                        duration: 280,
                        onComplete: () => pillarVis.destroy()
                    });
                });
            });

            this.pendingPillarMarkers.push({ marker, timer });
        }

        // Після стовпів цільова голова опускається ближче до гравця
        const targetHead = this.getCurrentStageTargetHead();
        if (targetHead && !targetHead.isKnockedOut && !targetHead.isStunned) {
            targetHead.exposeGroundUntil = time + 2600;
        }
    }

    /**
     * Сонні ноти-туман із середньої голови
     */
    performSleepyMistAttack(time, player) {
        this.state = 'SLEEPY_MIST';
        this.stateEndTime = time + 2200;

        if (this.midHead.isKnockedOut || this.midHead.isStunned) return;

        if (typeof SFX !== 'undefined' && SFX.lullabyNote) SFX.lullabyNote();
        const mistX = Phaser.Math.Clamp(player.sprite.x, this.arenaStartX + 240, this.arenaStartX + 760);
        const mistY = CONFIG.GROUND_Y - 48;

        const mistSprite = this.scene.add.image(this.midHead.sprite.x - 36, this.midHead.sprite.y, 'zmiy_note')
            .setDepth(25)
            .setAlpha(0.85)
            .setScale(1.1);

        this.scene.tweens.add({
            targets: mistSprite,
            x: mistX,
            y: mistY,
            scaleX: 2.1,
            scaleY: 1.8,
            duration: 750,
            onComplete: () => {
                if (this.isDefeated) {
                    mistSprite.destroy();
                    return;
                }
                this.activeSaltMist = {
                    sprite: mistSprite,
                    x: mistX,
                    y: mistY,
                    radius: 85,
                    expiresAt: this.scene.time.now + 2400
                };
                this.scene.time.delayedCall(2400, () => {
                    if (mistSprite && mistSprite.active) {
                        this.scene.tweens.add({
                            targets: mistSprite,
                            alpha: 0,
                            duration: 350,
                            onComplete: () => mistSprite.destroy()
                        });
                    }
                    if (this.activeSaltMist && this.activeSaltMist.sprite === mistSprite) {
                        this.activeSaltMist = null;
                    }
                });
            }
        });
    }

    /**
     * Віяло гострих соляних скалок із Коронованої голови
     */
    performShardFanAttack(time, player, shardCount = 3) {
        this.state = 'SHARD_FAN';
        this.stateEndTime = time + 1950;

        const shooter = !this.rightHead.isKnockedOut ? this.rightHead : this.getCurrentStageTargetHead();
        if (!shooter || shooter.isKnockedOut || shooter.isStunned) return;

        if (typeof SFX !== 'undefined' && SFX.crystalChime) SFX.crystalChime();
        const shardDmg = (CONFIG.ENEMY.BOSS_ZMIY && CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_SHARD) || 16;
        const startX = shooter.sprite.x - 30;
        const startY = shooter.sprite.y + 8;
        const baseAngle = Phaser.Math.Angle.Between(startX, startY, player.sprite.x, player.sprite.y - 12);

        const spreadStep = 0.21;
        const half = (shardCount - 1) / 2;

        for (let i = 0; i < shardCount; i++) {
            const angle = baseAngle + (i - half) * spreadStep;
            const shard = this.scene.enemyProjectiles.create(startX, startY, 'salt_shard');
            shard.body.setAllowGravity(false);
            shard.setDepth(29);
            const speed = this.stage === 3 ? 335 : 290;
            shard.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            shard.damageAmount = shardDmg;
        }

        // Після пострілу цільова голова опускається нижче для ударів у відповідь
        const targetHead = this.getCurrentStageTargetHead();
        if (targetHead && !targetHead.isKnockedOut && !targetHead.isStunned) {
            targetHead.exposeGroundUntil = time + 2300;
        }
    }

    // =========================================================================
    // АТАКИ СТАДІЇ 3 (1 КОРОНОВАНА ГОЛОВА — ФІНАЛЬНИЙ ШТУРМ)
    // =========================================================================

    /**
     * Стрімкий королівський таран останньої голови вздовж арени з подальшою зупинкою на рівні землі!
     */
    performStage3CrownCharge(time, player) {
        this.state = 'CROWN_CHARGE';
        this.stateEndTime = time + 2550;

        if (this.rightHead.isKnockedOut || this.rightHead.isStunned) return;

        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(player.sprite.x, CONFIG.GROUND_Y - 110, STRINGS.BOSS_ZMIY_CHARGE_WARN, '#ffd166');
        }
        if (typeof SFX !== 'undefined' && SFX.zmiyRoar) SFX.zmiyRoar();
        this.rightHead.sprite.setTint(0xFFD54F);

        const targetX = Phaser.Math.Clamp(player.sprite.x + 25, this.arenaStartX + 280, this.arenaStartX + 780);
        const targetY = CONFIG.GROUND_Y - 38;

        this.scene.time.delayedCall(460, () => {
            if (this.isDefeated || this.rightHead.isKnockedOut || this.rightHead.isStunned) return;
            this.rightHead.sprite.clearTint();
            this.scene.cameras.main.shake(200, 0.008);
            this.rightHead.startSwoop(targetX, targetY, 850, 1800);
        });
    }

    /**
     * Соляний каменепад з неба (з чіткими тінями на землі) + удар хвостом
     */
    performRockfallAndTailAttack(time, player) {
        this.state = 'AVALANCHE_AND_WAVE';
        this.stateEndTime = time + 2400;

        this.scene.cameras.main.shake(240, 0.009);
        this.performSaltWaveAttack(time, 1);

        const boulderDmg = (CONFIG.ENEMY.BOSS_ZMIY && CONFIG.ENEMY.BOSS_ZMIY.DAMAGE_BOULDER) || 20;

        // 4 великі брили солі падають зверху з чіткими маркерами на землі
        for (let i = 0; i < 4; i++) {
            const dropX = this.arenaStartX + 200 + i * 175 + Phaser.Math.Between(-25, 25);

            const shadow = this.scene.add.ellipse(dropX, CONFIG.GROUND_Y - 6, 44, 12, 0x1B0F08, 0.45).setDepth(27);
            this.scene.time.delayedCall(320 + i * 210, () => {
                if (shadow && shadow.active) shadow.destroy();
                if (this.isDefeated) return;
                const boulder = this.scene.enemyProjectiles.create(dropX, 30, 'salt_boulder');
                boulder.body.setAllowGravity(true);
                boulder.setDepth(29);
                boulder.setVelocityY(235);
                boulder.damageAmount = boulderDmg;
            });
        }

        if (!this.rightHead.isKnockedOut && !this.rightHead.isStunned) {
            this.rightHead.exposeGroundUntil = time + 2600;
        }
    }

    /**
     * Вихор крил + віяло з 4 соляних кристалів
     */
    performWingVortexAndFan(time, player) {
        this.state = 'WING_VORTEX_FAN';
        this.stateEndTime = time + 2400;
        this.vortexActiveUntil = time + 1900;

        this.scene.cameras.main.shake(200, 0.007);
        this.performShardFanAttack(time, player, 4);
    }

    // =========================================================================
    // ФІНАЛ ПЕРЕМОГИ НАД ЗМІЄМ СОЛЯНОГОРИЧЕМ
    // =========================================================================

    triggerBossDefeatFinale() {
        this.isDefeated = true;
        this.isFinished = true;
        this.vortexActiveUntil = 0;
        this.clearPendingPillarMarkers();

        if (this.activeSaltMist && this.activeSaltMist.sprite) {
            this.activeSaltMist.sprite.destroy();
            this.activeSaltMist = null;
        }

        // Очищуємо всі ворожі снаряди на екрані
        if (this.scene.enemyProjectiles) {
            this.scene.enemyProjectiles.clear(true, true);
        }

        // Усі 3 голови стають мирними й схиляються перед Омельком
        this.heads.forEach((h, idx) => {
            h.isDefeated = true;
            h.isFinished = true;
            h.isKnockedOut = true;
            h.isStunned = false;
            h.stunStars.setVisible(false);
            if (h.sprite && h.sprite.body) {
                h.sprite.body.enable = false;
            }
            this.scene.tweens.add({
                targets: h.sprite,
                y: CONFIG.GROUND_Y - 26,
                x: this.arenaStartX + 860 + idx * 65,
                duration: 900,
                ease: 'Sine.easeOut'
            });
        });

        if (this.scene.showOmelkoSpeech) {
            this.scene.showOmelkoSpeech(STRINGS.BOSS_ZMIY_DEFEAT_QUOTE, 4200);
        }

        this.scene.time.delayedCall(4300, () => {
            this.scene.triggerVictory();
        });
    }
}
