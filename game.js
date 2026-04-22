const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

// 移除全域 scale，搬到 init

// 方塊定義
const SHAPES = {
    'I': [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    'L': [[0, 2, 0], [0, 2, 0], [0, 2, 2]],
    'J': [[0, 3, 0], [0, 3, 0], [3, 3, 0]],
    'O': [[4, 4], [4, 4]],
    'Z': [[5, 5, 0], [0, 5, 5], [0, 0, 0]],
    'S': [[0, 6, 6], [6, 6, 0], [0, 0, 0]],
    'T': [[0, 7, 0], [7, 7, 7], [0, 0, 0]]
};

const COLORS = [
    null,
    '#00f2ff', // I - Cyan
    '#ffae00', // L - Orange
    '#003cff', // J - Blue
    '#ffff00', // O - Yellow
    '#ff0000', // Z - Red
    '#00ff00', // S - Green
    '#b300ff'  // T - Purple
];

// 遊戲狀態
let arena = createMatrix(12, 20);
let score = 0;
let lines = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let paused = true;

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    next: null,
    score: 0,
};

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    return SHAPES[type];
}

function draw() {
    // 清空畫布 (使用縮放後的座標 12x20)
    context.fillStyle = '#000';
    context.fillRect(0, 0, 12, 20);

    drawMatrix(arena, {x: 0, y: 0}, context);
    drawMatrix(player.matrix, player.pos, context);
    
    // 繪製 Ghost Piece (投影)
    drawGhost();

    // 繪製 Next Piece
    drawNext();
}

function drawMatrix(matrix, offset, ctx, isGhost = false) {
    if (!matrix) return;
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (isGhost) {
                    ctx.strokeStyle = COLORS[value];
                    ctx.lineWidth = 0.05;
                    ctx.strokeRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.8, 0.8);
                } else {
                    // 主體
                    ctx.fillStyle = COLORS[value];
                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                    
                    // 邊框與光澤
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 0.05;
                    ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
                }
            }
        });
    });
}

function drawNext() {
    // 清空 Next 畫布 (4x4)
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, 4, 4);
    if (player.next) {
        // 置中顯示
        const offset = {
            x: (4 - player.next[0].length) / 2,
            y: (4 - player.next.length) / 2
        };
        drawMatrix(player.next, offset, nextContext);
    }
}

function drawGhost() {
    const ghostPos = {x: player.pos.x, y: player.pos.y};
    while (!collide(arena, {pos: ghostPos, matrix: player.matrix})) {
        ghostPos.y++;
    }
    ghostPos.y--;
    drawMatrix(player.matrix, ghostPos, context, true);
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        audio.playDrop();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    audio.playDrop();
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    } else {
        audio.playMove();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
    audio.playRotate();
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    if (player.next === null) {
        player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    }
    player.matrix = player.next;
    player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    
    if (collide(arena, player)) {
        // Game Over
        arena.forEach(row => row.fill(0));
        player.score = 0;
        lines = 0;
        level = 1;
        updateScore();
        audio.playGameOver();
        gameOver();
    }
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        lines++;
        rowCount *= 2;
        audio.playClear();
        
        if (lines % 10 === 0) {
            level++;
            dropInterval *= 0.9;
        }
    }
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('lines').innerText = lines;
    document.getElementById('level').innerText = level;
}

function gameOver() {
    paused = true;
    document.getElementById('overlay-text').innerText = 'GAME OVER';
    document.getElementById('start-btn').innerText = 'RESTART';
    document.getElementById('overlay').classList.remove('hidden');
}

function update(time = 0) {
    if (paused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// 事件監聽
document.addEventListener('keydown', event => {
    if (paused) return;

    if (event.keyCode === 37) { // Left
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right
        playerMove(1);
    } else if (event.keyCode === 40) { // Down
        playerDrop();
    } else if (event.keyCode === 38) { // Up (Rotate CW)
        playerRotate(1);
    } else if (event.keyCode === 32) { // Space (Hard Drop)
        playerHardDrop();
    } else if (event.keyCode === 90) { // Z (Rotate CCW)
        playerRotate(-1);
    } else if (event.keyCode === 88) { // X (Rotate CW)
        playerRotate(1);
    }
    draw(); // 按鍵後立即重畫
});

document.getElementById('start-btn').addEventListener('click', () => {
    console.log('Start button clicked');
    if (typeof audio !== 'undefined') {
        audio.resume();
    }
    
    // 如果是重新開始，清空棋盤
    if (document.getElementById('overlay-text').innerText === 'GAME OVER') {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        lines = 0;
        level = 1;
        dropInterval = 1000;
        updateScore();
    }

    paused = false;
    document.getElementById('overlay').classList.add('hidden');
    playerReset();
    updateScore();
    lastTime = performance.now();
    update();
});

// 初始化
function init() {
    console.log('Game initializing...');
    context.setTransform(1, 0, 0, 1, 0, 0); // 重設變換
    context.scale(20, 20);
    nextContext.setTransform(1, 0, 0, 1, 0, 0);
    nextContext.scale(20, 20);
    
    playerReset();
    updateScore();
    draw();
}

// 確保 DOM 載入後再執行
window.addEventListener('load', init);
