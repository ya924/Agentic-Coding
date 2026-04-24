/**
 * Neon Tetris 核心邏輯
 */

// 常數定義
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// 方塊形狀定義
const SHAPES = {
    'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    'J': [[1,0,0], [1,1,1], [0,0,0]],
    'L': [[0,0,1], [1,1,1], [0,0,0]],
    'O': [[1,1], [1,1]],
    'S': [[0,1,1], [1,1,0], [0,0,0]],
    'T': [[0,1,0], [1,1,1], [0,0,0]],
    'Z': [[1,1,0], [0,1,1], [0,0,0]]
};

const COLORS = {
    'I': '#00f2ff',
    'J': '#0070ff',
    'L': '#ff9d00',
    'O': '#fff200',
    'S': '#00ff66',
    'T': '#ae00ff',
    'Z': '#ff0055'
};

class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = ROWS * BLOCK_SIZE;
        this.nextCanvas.width = 4 * BLOCK_SIZE;
        this.nextCanvas.height = 4 * BLOCK_SIZE;

        this.init();
        this.bindEvents();
    }

    init() {
        this.grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.paused = true;
        this.gameOver = false;
        
        this.activePiece = null;
        this.nextPiece = this.getRandomPiece();
        
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.updateUI();
        this.draw();
    }

    getRandomPiece() {
        const types = Object.keys(SHAPES);
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            type: type,
            shape: SHAPES[type],
            color: COLORS[type],
            pos: {x: Math.floor(COLS/2) - 1, y: -1}
        };
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
                return;
            }

            if (this.paused) return;

            switch(e.keyCode) {
                case 37: // Left
                    this.movePiece(-1);
                    break;
                case 39: // Right
                    this.movePiece(1);
                    break;
                case 40: // Down
                    this.dropPiece();
                    break;
                case 38: // Up (CW)
                case 88: // X (CW)
                    this.rotatePiece(1);
                    break;
                case 90: // Z (CCW)
                    this.rotatePiece(-1);
                    break;
                case 32: // Space (Hard Drop)
                    this.hardDrop();
                    break;
            }
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.gameOver) {
                this.init();
            }
            this.start();
            audio.init();
        });
    }

    start() {
        this.paused = false;
        document.getElementById('overlay').classList.add('hidden');
        if (!this.activePiece) this.spawnPiece();
        requestAnimationFrame(this.update.bind(this));
    }

    togglePause() {
        this.paused = !this.paused;
        const overlay = document.getElementById('overlay');
        const overlayText = document.getElementById('overlayText');
        
        if (this.paused) {
            overlayText.innerText = "PAUSED";
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
            requestAnimationFrame(this.update.bind(this));
        }
    }

    spawnPiece() {
        this.activePiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        
        // 檢查初始位置是否碰撞 (Game Over)
        if (this.collide()) {
            this.gameOver = true;
            this.paused = true;
            document.getElementById('overlayText').innerText = "GAME OVER";
            document.getElementById('overlay').classList.remove('hidden');
            document.getElementById('startBtn').innerText = "RESTART";
            audio.playGameOver();
        }
        
        this.drawNext();
    }

    movePiece(dir) {
        this.activePiece.pos.x += dir;
        if (this.collide()) {
            this.activePiece.pos.x -= dir;
        } else {
            audio.playMove();
        }
        this.draw();
    }

    rotatePiece(dir) {
        const originalShape = this.activePiece.shape;
        // 旋轉矩陣
        const newShape = originalShape[0].map((_, i) =>
            originalShape.map(row => row[i])
        );
        
        if (dir > 0) newShape.forEach(row => row.reverse()); // CW
        else newShape.reverse(); // CCW

        this.activePiece.shape = newShape;
        
        // Wall kick (簡單版)
        let offset = 1;
        const originalX = this.activePiece.pos.x;
        while (this.collide()) {
            this.activePiece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (Math.abs(offset) > 3) {
                this.activePiece.shape = originalShape;
                this.activePiece.pos.x = originalX;
                return;
            }
        }
        audio.playRotate();
        this.draw();
    }

    dropPiece() {
        this.activePiece.pos.y++;
        if (this.collide()) {
            this.activePiece.pos.y--;
            this.lockPiece();
            return false;
        }
        this.dropCounter = 0;
        this.draw();
        return true;
    }

    hardDrop() {
        while (!this.collide()) {
            this.activePiece.pos.y++;
        }
        this.activePiece.pos.y--;
        this.lockPiece();
        audio.playDrop();
    }

    collide() {
        const {shape, pos} = this.activePiece;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const boardX = pos.x + x;
                    const boardY = pos.y + y;
                    
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
                    if (boardY >= 0 && this.grid[boardY][boardX] !== 0) return true;
                }
            }
        }
        return false;
    }

    lockPiece() {
        const {shape, pos, color} = this.activePiece;
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardY = pos.y + y;
                    if (boardY >= 0) {
                        this.grid[boardY][pos.x + x] = color;
                    }
                }
            });
        });
        
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // 重新檢查同一行
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            // 俄羅斯方塊計分法
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            
            // 每 10 行升一級
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            audio.playClear();
            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('level').innerText = this.level;
        document.getElementById('lines').innerText = this.lines;
    }

    update(time = 0) {
        if (this.paused || this.gameOver) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.dropPiece();
        }

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        // 清除畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製背景網格 (微弱)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        for (let i = 0; i <= COLS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * BLOCK_SIZE, 0);
            this.ctx.lineTo(i * BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, i * BLOCK_SIZE);
            this.ctx.stroke();
        }

        // 繪製已鎖定的方塊
        this.grid.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color !== 0) {
                    this.drawBlock(this.ctx, x, y, color);
                }
            });
        });

        // 繪製當前方塊
        if (this.activePiece) {
            // 繪製 Ghost (影子)
            const ghostY = this.getGhostPosition();
            this.activePiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlock(this.ctx, this.activePiece.pos.x + x, ghostY + y, this.activePiece.color, true);
                    }
                });
            });

            this.activePiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlock(this.ctx, this.activePiece.pos.x + x, this.activePiece.pos.y + y, this.activePiece.color);
                    }
                });
            });
        }
    }

    getGhostPosition() {
        let ghostY = this.activePiece.pos.y;
        while (!this.collideAt(this.activePiece.pos.x, ghostY + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    collideAt(x, y) {
        const {shape} = this.activePiece;
        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx] !== 0) {
                    const bx = x + sx;
                    const by = y + sy;
                    if (bx < 0 || bx >= COLS || by >= ROWS) return true;
                    if (by >= 0 && this.grid[by][bx] !== 0) return true;
                }
            }
        }
        return false;
    }

    drawBlock(ctx, x, y, color, isGhost = false) {
        if (y < 0) return;
        
        ctx.save();
        ctx.translate(x * BLOCK_SIZE, y * BLOCK_SIZE);
        
        if (isGhost) {
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        } else {
            // 方塊主體
            ctx.fillStyle = color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            
            // 圓角矩形
            const r = 4;
            const s = BLOCK_SIZE - 2;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(s-r, 0);
            ctx.quadraticCurveTo(s, 0, s, r);
            ctx.lineTo(s, s-r);
            ctx.quadraticCurveTo(s, s, s-r, s);
            ctx.lineTo(r, s);
            ctx.quadraticCurveTo(0, s, 0, s-r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.fill();
            
            // 亮邊
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawNext() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const {shape, color} = this.nextPiece;
        
        // 置中繪製
        const offsetX = (4 - shape[0].length) / 2;
        const offsetY = (4 - shape.length) / 2;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(this.nextCtx, x + offsetX, y + offsetY, color);
                }
            });
        });
    }
}

// 啟動遊戲
const game = new Tetris();
