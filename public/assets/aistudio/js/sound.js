
    /**
     * ============================================================================
     * 4. PROCEDURAL WEBAUDIO SOUND MANAGER
     * ============================================================================
     */
    class SoundManager {
      constructor() {
        this.ctx = null;
        this.muted = false;
      }

      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            this.ctx = new AudioCtx();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }

      toggleMute() {
        this.muted = !this.muted;
        return this.muted;
      }

      playTone(freqStart, freqEnd, duration, type = 'sine', gainVal = 0.15) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freqStart, now);
          if (freqEnd !== freqStart) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
          }
          gain.gain.setValueAtTime(gainVal, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + duration);
        } catch (e) {
          // Ignore audio context errors on restricted autoplay
        }
      }

      jump(isDouble = false) {
        if (isDouble) {
          this.playTone(280, 620, 0.14, 'triangle', 0.16);
        } else {
          this.playTone(190, 440, 0.13, 'sine', 0.16);
        }
      }

      roll() {
        this.playTone(160, 75, 0.15, 'triangle', 0.14);
      }

      swing(comboStep = 1, isSaber = false) {
        if (isSaber) {
          // Crisp Damascus steel saber whistle-cut
          const base = 360 + comboStep * 95;
          this.playTone(base, base * 0.38, 0.09, 'sawtooth', 0.12);
          setTimeout(() => this.playTone(base * 1.4, base * 0.7, 0.06, 'sine', 0.08), 18);
        } else {
          const base = 180 + comboStep * 55;
          this.playTone(base, base * 0.45, 0.1, 'sawtooth', 0.11);
        }
      }

      panHit(isHeavy = false) {
        // Metallic frying pan / saber impact!
        if (isHeavy) {
          this.playTone(520, 140, 0.22, 'square', 0.2);
          setTimeout(() => this.playTone(780, 290, 0.18, 'triangle', 0.16), 25);
        } else {
          this.playTone(420, 160, 0.12, 'square', 0.16);
        }
      }

      shieldBlock() {
        // Heavy oak & iron shield deflection thud + ring
        this.playTone(150, 70, 0.14, 'square', 0.2);
        setTimeout(() => this.playTone(680, 420, 0.1, 'triangle', 0.14), 20);
      }

      nyavkaWail() {
        // Eerie forest spirit harmonic shriek
        this.playTone(580, 920, 0.18, 'sine', 0.12);
        setTimeout(() => this.playTone(880, 520, 0.22, 'triangle', 0.1), 90);
      }

      lisovykRoar() {
        // Deep resonant ancient forest roar
        [140, 115, 95, 160].forEach((f, i) => {
          setTimeout(() => this.playTone(f, f * 0.75, 0.2, 'sawtooth', 0.17), i * 85);
        });
      }

      stunFull() {
        // Cartoon dizzy arpeggio
        [440, 554, 659, 880].forEach((f, idx) => {
          setTimeout(() => this.playTone(f, f * 1.08, 0.1, 'sine', 0.13), idx * 55);
        });
      }

      finisher() {
        // Comical launch whistle + pop
        this.playTone(240, 980, 0.28, 'sine', 0.2);
        setTimeout(() => this.playTone(150, 60, 0.18, 'square', 0.2), 180);
      }

      throwGalushka() {
        this.playTone(350, 210, 0.11, 'sine', 0.14);
      }

      drinkUzvar() {
        this.playTone(320, 480, 0.12, 'sine', 0.15);
        setTimeout(() => this.playTone(480, 720, 0.16, 'sine', 0.15), 110);
      }

      pickup() {
        this.playTone(580, 880, 0.09, 'triangle', 0.12);
      }

      checkpoint() {
        [330, 440, 554, 659].forEach((f, i) => {
          setTimeout(() => this.playTone(f, f, 0.16, 'triangle', 0.15), i * 80);
        });
      }

      hurt() {
        this.playTone(190, 85, 0.2, 'sawtooth', 0.18);
      }

      defeat() {
        // Dramatic descending Cossack tuba/horn notes when Omelko loses all strength
        [260, 220, 185, 130].forEach((f, idx) => {
          setTimeout(() => this.playTone(f, f * 0.82, 0.26, 'sawtooth', 0.18), idx * 140);
        });
      }

      telegraph() {
        this.playTone(620, 740, 0.09, 'square', 0.09);
      }

      roosterCrow() {
        [420, 560, 490, 760].forEach((f, i) => {
          setTimeout(() => this.playTone(f, f * 0.92, 0.14, 'sawtooth', 0.14), i * 95);
        });
      }

      speechBlip() {
        this.playTone(340 + Math.random() * 140, 380, 0.04, 'sine', 0.06);
      }

      itemFanfare() {
        // Triumphant RPG item acquisition fanfare
        const notes = [392.0, 493.88, 587.33, 783.99];
        notes.forEach((f, idx) => {
          setTimeout(() => this.playTone(f, f * 1.02, 0.22, 'triangle', 0.16), idx * 75);
        });
      }

      banduraStart() {
        // Warm bandura / kobza folk chord when pressing Enter on Title Screen
        const notes = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0];
        notes.forEach((f, idx) => {
          setTimeout(() => this.playTone(f, f * 0.995, 0.38, 'triangle', 0.14), idx * 55);
        });
      }

      throwFrog() {
        // Comical resonant swamp frog "ква-а!" croak when throwing Baba Yaga's frogs
        this.playTone(185, 290, 0.11, 'sawtooth', 0.14);
        setTimeout(() => this.playTone(270, 145, 0.13, 'triangle', 0.13), 65);
      }

      waterSplash() {
        // Bubbling river splash when leaping or falling into the Dnipro
        this.playTone(240, 95, 0.18, 'triangle', 0.16);
        setTimeout(() => this.playTone(160, 320, 0.14, 'sine', 0.12), 55);
      }

      rusalkaSong() {
        // Enchanting two-note siren call when a Rusalka is about to leap from the Dnipro
        this.playTone(587.33, 783.99, 0.18, 'sine', 0.12);
        setTimeout(() => this.playTone(783.99, 659.25, 0.22, 'triangle', 0.11), 110);
      }

      lightningZap() {
        // Crackling storm-cloud lightning discharge
        this.playTone(820, 140, 0.15, 'sawtooth', 0.17);
        setTimeout(() => this.playTone(540, 95, 0.12, 'square', 0.14), 45);
      }

      windWhistle() {
        // Soft steppe wind whistle (степовий суховій)
        this.playTone(290, 430, 0.24, 'sine', 0.09);
        setTimeout(() => this.playTone(430, 250, 0.28, 'triangle', 0.08), 140);
      }

      seagullCry() {
        // Coastal seagull cry ("крі-і-і!")
        this.playTone(980, 640, 0.14, 'triangle', 0.11);
        setTimeout(() => this.playTone(860, 520, 0.16, 'sine', 0.09), 95);
      }

      wolfHowl() {
        // Short menacing Vovkulaka growl-bark before pounce
        this.playTone(175, 260, 0.13, 'sawtooth', 0.14);
        setTimeout(() => this.playTone(260, 130, 0.16, 'triangle', 0.13), 75);
      }

      zmiyRoar() {
        // Deep grandfatherly resonant dragon rumble
        [110, 92, 130, 82].forEach((f, i) => {
          setTimeout(() => this.playTone(f, f * 0.78, 0.24, 'triangle', 0.18), i * 95);
        });
      }

      crystalChime() {
        // Crystalline harmonic ring for mirror beams & crown glow
        this.playTone(740, 1110, 0.18, 'sine', 0.12);
        setTimeout(() => this.playTone(1110, 1480, 0.16, 'triangle', 0.09), 80);
      }

      lullabyNote() {
        // Soft melodic lullaby chime for Sleepy head
        this.playTone(523.25, 659.25, 0.22, 'sine', 0.11);
      }
    }

    const SFX = new SoundManager();