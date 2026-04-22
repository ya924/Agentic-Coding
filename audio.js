class GameAudio {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3;
    }

    async resume() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    playTone(freq, type, duration, volume = 0.5) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playMove() {
        this.playTone(150, 'sine', 0.1, 0.2);
    }

    playRotate() {
        this.playTone(300, 'sine', 0.1, 0.2);
    }

    playDrop() {
        this.playTone(100, 'square', 0.15, 0.3);
    }

    playClear() {
        this.playTone(440, 'triangle', 0.1, 0.4);
        setTimeout(() => this.playTone(880, 'triangle', 0.2, 0.4), 50);
    }

    playGameOver() {
        this.playTone(300, 'sawtooth', 0.3, 0.5);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.3, 0.5), 200);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.5, 0.5), 400);
    }
}

const audio = new GameAudio();
