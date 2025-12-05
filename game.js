// 五子棋对战平台 - 动态房间版

// 全局变量
let playerName = '玩家' + Math.floor(Math.random() * 1000);
let currentRoom = null;
let ws = null;
let game = null;

// DOM元素
const roomListPage = document.getElementById('roomListPage');
const gamePage = document.getElementById('gamePage');
const roomsList = document.getElementById('roomsList');
const playerNameInput = document.getElementById('playerName');
const roomIdSpan = document.getElementById('roomId');
const player1Span = document.getElementById('player1');
const player2Span = document.getElementById('player2');
const gameStatus = document.getElementById('gameStatus');

// 房间管理类
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.simulateRooms();
    }

    // 模拟房间数据（实际应用中应该从服务器获取）
    simulateRooms() {
        // 创建一些示例房间
        for (let i = 1; i <= 8; i++) {
            this.rooms.set(`room${i}`, {
                id: `room${i}`,
                name: `对战房间 ${i}`,
                password: i <= 3 ? '123' : null, // 前3个房间有密码
                players: Math.random() > 0.3 ? 2 : 1,
                maxPlayers: 2,
                status: Math.random() > 0.5 ? 'playing' : 'waiting',
                mode: ['classic', 'swap2', 'renju'][Math.floor(Math.random() * 3)]
            });
        }
    }

    getRooms() {
        return Array.from(this.rooms.values());
    }

    createRoom(name, password = null, mode = 'classic') {
        const roomId = 'room' + Date.now();
        const room = {
            id: roomId,
            name: name,
            password: password,
            players: 1,
            maxPlayers: 2,
            status: 'waiting',
            mode: mode,
            creator: playerName
        };
        this.rooms.set(roomId, room);
        return room;
    }

    joinRoom(roomId, password = null) {
        const room = this.rooms.get(roomId);
        if (!room) return null;
        if (room.password && room.password !== password) return null;
        if (room.players >= room.maxPlayers) return null;

        room.players++;
        if (room.players === room.maxPlayers) {
            room.status = 'playing';
        }
        return room;
    }

    leaveRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.players = Math.max(0, room.players - 1);
            if (room.players === 0) {
                this.rooms.delete(roomId);
            } else if (room.status === 'playing') {
                room.status = 'waiting';
            }
        }
    }
}

// 游戏类
class GomokuGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.startTime = Date.now();
        this.isSpectating = false;
        this.init();
    }

    init() {
        // 初始化15x15棋盘
        this.board = Array(15).fill(null).map(() => Array(15).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.startTime = Date.now();
        this.drawBoard();
    }

    // 绘制棋盘
    drawBoard() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const cellSize = 40;
        const padding = 20;
        const boardSize = 15 * cellSize;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制网格线
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        for (let i = 0; i < 15; i++) {
            // 横线
            ctx.beginPath();
            ctx.moveTo(padding, padding + i * cellSize);
            ctx.lineTo(padding + boardSize, padding + i * cellSize);
            ctx.stroke();

            // 竖线
            ctx.beginPath();
            ctx.moveTo(padding + i * cellSize, padding);
            ctx.lineTo(padding + i * cellSize, padding + boardSize);
            ctx.stroke();
        }

        // 绘制星位
        const starPoints = [3, 7, 11];
        ctx.fillStyle = '#333';
        starPoints.forEach(i => {
            starPoints.forEach(j => {
                ctx.beginPath();
                ctx.arc(
                    padding + i * cellSize,
                    padding + j * cellSize,
                    4,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
        });

        // 绘制所有棋子
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (this.board[row][col]) {
                    this.drawStone(row, col, this.board[row][col]);
                }
            }
        }
    }

    // 绘制棋子
    drawStone(row, col, color) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const cellSize = 40;
        const padding = 20;
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;
        const radius = 16;

        // 绘制棋子
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);

        if (color === 'black') {
            const gradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(1, '#000');
            ctx.fillStyle = gradient;
        } else {
            const gradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            ctx.fillStyle = gradient;
        }

        ctx.fill();
        ctx.strokeStyle = color === 'black' ? '#000' : '#999';
        ctx.stroke();
    }

    // 处理点击
    handleClick(event) {
        if (this.gameOver || this.isSpectating) return;

        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const cellSize = 40;
        const padding = 20;
        const col = Math.round((x - padding) / cellSize);
        const row = Math.round((y - padding) / cellSize);

        if (row >= 0 && row < 15 && col >= 0 && col < 15 && !this.board[row][col]) {
            this.makeMove(row, col);
        }
    }

    // 落子
    makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        this.drawBoard();

        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.showWinner(this.currentPlayer);
        } else {
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        }

        this.updateUI();
    }

    // 检查胜负
    checkWin(row, col) {
        const directions = [
            [[0, 1], [0, -1]],  // 水平
            [[1, 0], [-1, 0]],  // 垂直
            [[1, 1], [-1, -1]], // 对角线
            [[1, -1], [-1, 1]]  // 反对角线
        ];

        for (let direction of directions) {
            let count = 1;
            for (let [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                while (r >= 0 && r < 15 && c >= 0 && c < 15 &&
                       this.board[r][c] === this.currentPlayer) {
                    count++;
                    r += dx;
                    c += dy;
                }
            }
            if (count >= 5) return true;
        }
        return false;
    }

    // 显示获胜者
    showWinner(player) {
        const winner = player === 'black' ? '黑子' : '白子';
        gameStatus.textContent = `🎉 ${winner}获胜！`;
        gameStatus.className = 'game-status winner show';
    }

    // 更新UI
    updateUI() {
        const currentPlayerText = document.getElementById('currentPlayerText');
        const playerIndicator = document.getElementById('playerIndicator');
        const moveCount = document.getElementById('moveCount');
        const gameTime = document.getElementById('gameTime');

        currentPlayerText.textContent =
            this.gameOver ? '游戏结束' :
            this.isSpectating ? '观战中' :
            (this.currentPlayer === 'black' ? '黑子' : '白子');

        playerIndicator.className = 'player-indicator ' +
            (this.currentPlayer === 'black' ? 'black' : 'white');

        moveCount.textContent = this.moveHistory.length;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        gameTime.textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// 初始化
const roomManager = new RoomManager();

// 页面功能函数
function setPlayerName() {
    const name = playerNameInput.value.trim();
    if (name) {
        playerName = name;
        alert(`昵称已设置为: ${playerName}`);
    }
}

function createRoom() {
    document.getElementById('createRoomModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function confirmCreateRoom() {
    const name = document.getElementById('roomName').value || '我的房间';
    const password = document.getElementById('roomPassword').value;
    const mode = document.getElementById('gameMode').value;

    const room = roomManager.createRoom(name, password, mode);
    joinRoom(room.id, password);

    closeModal('createRoomModal');
}

function quickJoin() {
    const rooms = roomManager.getRooms().filter(r =>
        r.status === 'waiting' && r.players < r.maxPlayers
    );
    if (rooms.length > 0) {
        const room = rooms[0];
        joinRoom(room.id);
    } else {
        alert('没有可加入的房间！');
    }
}

function joinRoom(roomId, password = null) {
    const room = roomManager.joinRoom(roomId, password);
    if (!room) {
        alert('加入房间失败！可能需要密码或房间已满。');
        return;
    }

    currentRoom = room;
    showGamePage();
    initializeGame();
}

function showGamePage() {
    roomListPage.style.display = 'none';
    gamePage.style.display = 'block';

    roomIdSpan.textContent = currentRoom.id;
    player1Span.textContent = currentRoom.creator || '玩家1';
    player2Span.textContent = '等待加入...';
}

function leaveRoom() {
    if (currentRoom) {
        roomManager.leaveRoom(currentRoom.id);
        currentRoom = null;
    }

    roomListPage.style.display = 'flex';
    gamePage.style.display = 'none';

    refreshRoomList();
}

function initializeGame() {
    game = new GomokuGame();

    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', (e) => game.handleClick(e));

    // 模拟第二个玩家加入
    setTimeout(() => {
        if (player2Span.textContent === '等待加入...') {
            player2Span.textContent = '玩家2';
            gameStatus.textContent = '游戏开始！黑子先行';
            gameStatus.className = 'game-status waiting show';
        }
    }, 2000);

    // 定时更新游戏时间
    setInterval(() => game.updateUI(), 1000);
}

function restartGame() {
    if (game) {
        game.init();
        gameStatus.className = 'game-status';
    }
}

function toggleSpectate() {
    if (game) {
        game.isSpectating = !game.isSpectating;
        game.updateUI();
    }
}

// 聊天功能
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message) {
        addChatMessage(playerName, message);
        input.value = '';

        // 模拟其他玩家的回复
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const responses = ['好的！', '来吧！', '加油！', '有趣的一局'];
                const response = responses[Math.floor(Math.random() * responses.length)];
                addChatMessage('玩家2', response);
            }, 1000 + Math.random() * 2000);
        }
    }
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function addChatMessage(sender, message, type = 'normal') {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    if (sender === playerName) {
        messageDiv.classList.add('self');
    }
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 刷新房间列表
function refreshRoomList() {
    const rooms = roomManager.getRooms();
    roomsList.innerHTML = rooms.map(room => `
        <div class="room-card" onclick="attemptJoinRoom('${room.id}', ${room.password ? 'true' : 'false'})">
            <h3>${room.name}</h3>
            <div class="room-info">
                <span>房间: ${room.id}</span>
                <span>${room.players}/${room.maxPlayers}</span>
            </div>
            <div class="room-status ${room.status}">
                ${room.status === 'waiting' ? '等待中' : room.status === 'playing' ? '游戏中' : '已满'}
            </div>
            ${room.password ? '<span style="color: #666; font-size: 0.8em;">🔒 私密</span>' : ''}
        </div>
    `).join('');
}

function attemptJoinRoom(roomId, hasPassword) {
    if (hasPassword) {
        const password = prompt('请输入房间密码：');
        if (password) {
            joinRoom(roomId, password);
        }
    } else {
        joinRoom(roomId);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    refreshRoomList();

    // 每5秒刷新房间列表
    setInterval(refreshRoomList, 5000);
});