class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        }
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (!this.enabled) return;
        
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        oscillator.connect(gain);
        gain.connect(this.ctx.destination);

        oscillator.start();
        oscillator.stop(this.ctx.currentTime + duration);
    }

    playMove() {
        this.playTone(150, 'sine', 0.1, 0.05);
    }

    playRotate() {
        this.playTone(300, 'triangle', 0.1, 0.05);
    }

    playDrop() {
        this.playTone(100, 'sine', 0.15, 0.1);
    }

    playClear() {
        const now = this.ctx.currentTime;
        [440, 554, 659, 880].forEach((f, i) => {
            setTimeout(() => {
                this.playTone(f, 'square', 0.2, 0.03);
            }, i * 100);
        });
    }

    playGameOver() {
        const now = this.ctx.currentTime;
        [440, 349, 261, 196].forEach((f, i) => {
            setTimeout(() => {
                this.playTone(f, 'sawtooth', 0.4, 0.05);
            }, i * 200);
        });
    }
}

const audio = new AudioManager();
