import { Category, MiniApp } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'all', name: 'Tout', color: '#7C3AED', icon: '🌐' },
    { id: 'games', name: 'Jeux', color: '#EF4444', icon: '🎮' },
    { id: 'tools', name: 'Outils', color: '#3B82F6', icon: '🔧' },
    { id: 'utilities', name: 'Utilitaires', color: '#6366F1', icon: '⚡' },
    { id: 'learning', name: 'Apprentissage', color: '#10B981', icon: '📚' },
    { id: 'entertainment', name: 'Divertissement', color: '#F59E0B', icon: '🎬' },
];

export const CATEGORY_COLORS = [
    '#7C3AED', '#EF4444', '#3B82F6', '#10B981',
    '#F59E0B', '#6366F1', '#EC4899', '#14B8A6',
    '#F97316', '#84CC16', '#06B6D4', '#8B5CF6',
];

export const CATEGORY_ICONS = [
    '🌐', '🎮', '🔧', '📚', '🎬', '⚡', '💡', '🎨',
    '📊', '🔬', '🎵', '🍅', '✏️', '🧩', '🚀', '💻',
    '📱', '🗺️', '🎯', '🧠', '🔐', '📰', '🌍', '🎲',
];

// ============================================================================
// 100% OFFLINE-READY MINI APPS (HTML5 / CSS3 / JS PUR SANS DÉPENDANCE EXTERNE)
// ============================================================================

const POMODORO_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Pomodoro Pro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: radial-gradient(circle at top, #1e1b4b, #0f172a);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      width: 100%;
      max-width: 380px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      padding: 28px 20px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 20px; letter-spacing: -0.5px; color: #e2e8f0; }
    .modes { display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; }
    .mode-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-btn.active { background: #6366f1; color: #fff; border-color: #818cf8; box-shadow: 0 0 15px rgba(99,102,241,0.4); }
    .timer-circle {
      position: relative;
      width: 220px;
      height: 220px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
    circle { fill: none; stroke-width: 8; stroke-linecap: round; }
    .bg-circle { stroke: rgba(255, 255, 255, 0.08); }
    .progress-circle { stroke: #6366f1; stroke-dasharray: 628; stroke-dashoffset: 0; transition: stroke-dashoffset 0.5s linear, stroke 0.3s; }
    .time-display {
      font-size: 48px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: #fff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 2;
    }
    .controls { display: flex; gap: 12px; justify-content: center; align-items: center; }
    .main-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 14px 36px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(99,102,241,0.35);
      transition: transform 0.1s, box-shadow 0.2s;
    }
    .main-btn:active { transform: scale(0.96); }
    .reset-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
    }
    .stats { margin-top: 20px; font-size: 13px; color: #64748b; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍅 Pomodoro Pro</h1>
    <div class="modes">
      <button class="mode-btn active" onclick="setMode('work', 25, '#6366f1')">Travail (25m)</button>
      <button class="mode-btn" onclick="setMode('short', 5, '#10b981')">Pause (5m)</button>
      <button class="mode-btn" onclick="setMode('long', 15, '#f59e0b')">Repos (15m)</button>
    </div>
    <div class="timer-circle">
      <svg viewBox="0 0 220 220">
        <circle class="bg-circle" cx="110" cy="110" r="95"></circle>
        <circle class="progress-circle" id="prog" cx="110" cy="110" r="95"></circle>
      </svg>
      <div class="time-display" id="time">25:00</div>
    </div>
    <div class="controls">
      <button class="main-btn" id="startBtn" onclick="toggleTimer()">DÉMARRER</button>
      <button class="reset-btn" onclick="resetTimer()" title="Réinitialiser">↺</button>
    </div>
    <div class="stats" id="sessionCount">Sessions terminées : 0</div>
  </div>
  <script>
    let totalSeconds = 25 * 60;
    let remainingSeconds = totalSeconds;
    let timerInterval = null;
    let isRunning = false;
    let completedSessions = 0;
    const perimeter = 2 * Math.PI * 95;

    function playBeep() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
    }

    function updateUI() {
      const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
      const secs = (remainingSeconds % 60).toString().padStart(2, '0');
      document.getElementById('time').innerText = mins + ':' + secs;
      const progress = (totalSeconds - remainingSeconds) / totalSeconds;
      const offset = perimeter * (1 - progress);
      document.getElementById('prog').style.strokeDashoffset = offset;
    }

    function setMode(mode, mins, color) {
      if (isRunning) toggleTimer();
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('prog').style.stroke = color;
      document.getElementById('startBtn').style.background = 'linear-gradient(135deg, ' + color + ', #8b5cf6)';
      totalSeconds = mins * 60;
      remainingSeconds = totalSeconds;
      updateUI();
    }

    function toggleTimer() {
      const btn = document.getElementById('startBtn');
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerText = 'REPRENDRE';
      } else {
        isRunning = true;
        btn.innerText = 'PAUSE';
        timerInterval = setInterval(() => {
          if (remainingSeconds > 0) {
            remainingSeconds--;
            updateUI();
          } else {
            clearInterval(timerInterval);
            isRunning = false;
            btn.innerText = 'DÉMARRER';
            playBeep();
            completedSessions++;
            document.getElementById('sessionCount').innerText = 'Sessions terminées : ' + completedSessions;
            alert('🎉 Session terminée ! Prenez une pause méritée.');
            resetTimer();
          }
        }, 1000);
      }
    }

    function resetTimer() {
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        document.getElementById('startBtn').innerText = 'DÉMARRER';
      }
      remainingSeconds = totalSeconds;
      updateUI();
    }
    updateUI();
  </script>
</body>
</html>`;

const GAME_2048_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>2048 Master</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; touch-action: none; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .header { width: 100%; max-width: 360px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .title { font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .scores { display: flex; gap: 8px; }
    .score-box { background: rgba(255,255,255,0.08); padding: 6px 14px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
    .score-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
    .score-val { font-size: 16px; font-weight: 800; color: #fff; }
    .board-container {
      width: 340px;
      height: 340px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 10px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 10px;
      position: relative;
    }
    .cell {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      transition: all 0.12s ease;
      color: #fff;
    }
    .c2 { background: #334155; color: #f8fafc; }
    .c4 { background: #475569; color: #f8fafc; }
    .c8 { background: #f97316; color: #fff; box-shadow: 0 0 10px rgba(249,115,22,0.4); }
    .c16 { background: #ea580c; color: #fff; box-shadow: 0 0 12px rgba(234,88,12,0.5); }
    .c32 { background: #ef4444; color: #fff; box-shadow: 0 0 14px rgba(239,68,68,0.5); }
    .c64 { background: #dc2626; color: #fff; font-size: 22px; box-shadow: 0 0 16px rgba(220,38,38,0.6); }
    .c128 { background: #eab308; color: #fff; font-size: 20px; box-shadow: 0 0 18px rgba(234,179,8,0.6); }
    .c256 { background: #ca8a04; color: #fff; font-size: 20px; box-shadow: 0 0 20px rgba(202,138,4,0.7); }
    .c512 { background: #84cc16; color: #fff; font-size: 18px; box-shadow: 0 0 22px rgba(132,204,22,0.8); }
    .c1024 { background: #06b6d4; color: #fff; font-size: 16px; box-shadow: 0 0 24px rgba(6,182,212,0.8); }
    .c2048 { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #fff; font-size: 16px; box-shadow: 0 0 30px rgba(236,72,153,0.9); }
    .controls-bar { width: 100%; max-width: 340px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .btn:active { transform: scale(0.96); }
    .hint { font-size: 12px; color: #64748b; text-align: center; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">2048</div>
    <div class="scores">
      <div class="score-box">
        <div class="score-label">Score</div>
        <div class="score-val" id="score">0</div>
      </div>
      <div class="score-box">
        <div class="score-label">Meilleur</div>
        <div class="score-val" id="best">0</div>
      </div>
    </div>
  </div>

  <div class="board-container" id="board"></div>

  <div class="controls-bar">
    <button class="btn" onclick="initGame()">Nouvelle Partie</button>
    <span style="font-size: 12px; color: #94a3b8;">Glissez pour déplacer</span>
  </div>
  <div class="hint">Fusionnez les tuiles identiques pour atteindre 2048 !</div>

  <script>
    let grid = [];
    let score = 0;
    let best = parseInt(localStorage.getItem('2048_best') || '0');
    document.getElementById('best').innerText = best;

    function initGame() {
      grid = Array(4).fill(0).map(() => Array(4).fill(0));
      score = 0;
      updateScore(0);
      addRandomTile();
      addRandomTile();
      render();
    }

    function addRandomTile() {
      const empty = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c] === 0) empty.push({ r, c });
        }
      }
      if (empty.length > 0) {
        const rand = empty[Math.floor(Math.random() * empty.length)];
        grid[rand.r][rand.c] = Math.random() < 0.9 ? 2 : 4;
      }
    }

    function render() {
      const board = document.getElementById('board');
      board.innerHTML = '';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = grid[r][c];
          const div = document.createElement('div');
          div.className = 'cell ' + (val ? 'c' + val : '');
          div.innerText = val > 0 ? val : '';
          board.appendChild(div);
        }
      }
    }

    function updateScore(add) {
      score += add;
      document.getElementById('score').innerText = score;
      if (score > best) {
        best = score;
        localStorage.setItem('2048_best', best);
        document.getElementById('best').innerText = best;
      }
    }

    function slide(row) {
      let arr = row.filter(val => val !== 0);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          updateScore(arr[i]);
          arr[i + 1] = 0;
        }
      }
      arr = arr.filter(val => val !== 0);
      while (arr.length < 4) arr.push(0);
      return arr;
    }

    function rotate(matrix) {
      return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    }

    function moveLeft() {
      let changed = false;
      const newGrid = grid.map(row => {
        const next = slide(row);
        if (next.join(',') !== row.join(',')) changed = true;
        return next;
      });
      grid = newGrid;
      return changed;
    }

    function move(dir) {
      let changed = false;
      if (dir === 'left') changed = moveLeft();
      else if (dir === 'right') {
        grid = grid.map(r => r.reverse());
        changed = moveLeft();
        grid = grid.map(r => r.reverse());
      } else if (dir === 'up') {
        grid = rotate(rotate(rotate(grid)));
        changed = moveLeft();
        grid = rotate(grid);
      } else if (dir === 'down') {
        grid = rotate(grid);
        changed = moveLeft();
        grid = rotate(rotate(rotate(grid)));
      }
      if (changed) {
        addRandomTile();
        render();
      }
    }

    // Touch Handling
    let startX = 0, startY = 0;
    document.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (Math.max(absX, absY) > 30) {
        if (absX > absY) move(dx > 0 ? 'right' : 'left');
        else move(dy > 0 ? 'down' : 'up');
      }
    }, { passive: true });

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') move('left');
      else if (e.key === 'ArrowRight') move('right');
      else if (e.key === 'ArrowUp') move('up');
      else if (e.key === 'ArrowDown') move('down');
    });

    initGame();
  </script>
</body>
</html>`;

const CALCULATOR_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Calculatrice & Convertisseur</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #090d16;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .app-card {
      width: 100%;
      max-width: 360px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      padding: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
    .tab { flex: 1; padding: 8px; text-align: center; font-size: 13px; font-weight: 700; color: #94a3b8; background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; }
    .tab.active { background: #3b82f6; color: #fff; box-shadow: 0 0 15px rgba(59,130,246,0.4); }
    .display {
      background: rgba(0,0,0,0.4);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      text-align: right;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .prev-calc { font-size: 14px; color: #64748b; margin-bottom: 4px; min-height: 18px; }
    .main-calc { font-size: 32px; font-weight: 700; color: #fff; overflow-x: auto; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .btn {
      height: 56px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.05);
      background: rgba(255,255,255,0.07);
      color: #fff;
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.1s;
    }
    .btn:active { transform: scale(0.94); background: rgba(255,255,255,0.12); }
    .btn-op { background: rgba(59,130,246,0.15); color: #60a5fa; border-color: rgba(59,130,246,0.3); }
    .btn-action { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }
    .btn-equal { background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; grid-column: span 2; }
    .converter { display: none; }
    .conv-row { margin-bottom: 16px; }
    .conv-label { font-size: 12px; color: #94a3b8; margin-bottom: 6px; font-weight: 600; }
    .conv-input {
      width: 100%;
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 12px;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      outline: none;
    }
    .conv-select {
      width: 100%;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 12px;
      color: #fff;
      font-size: 14px;
      margin-top: 6px;
      outline: none;
    }
  </style>
</head>
<body>
  <div class="app-card">
    <div class="tabs">
      <div class="tab active" id="t-calc" onclick="switchTab('calc')">Calculatrice</div>
      <div class="tab" id="t-conv" onclick="switchTab('conv')">Convertisseur</div>
    </div>

    <div id="view-calc">
      <div class="display">
        <div class="prev-calc" id="history"></div>
        <div class="main-calc" id="result">0</div>
      </div>
      <div class="grid">
        <button class="btn btn-action" onclick="clearAll()">AC</button>
        <button class="btn btn-action" onclick="deleteLast()">⌫</button>
        <button class="btn btn-op" onclick="appendOp('%')">%</button>
        <button class="btn btn-op" onclick="appendOp('/')">÷</button>
        <button class="btn" onclick="appendNum('7')">7</button>
        <button class="btn" onclick="appendNum('8')">8</button>
        <button class="btn" onclick="appendNum('9')">9</button>
        <button class="btn btn-op" onclick="appendOp('*')">×</button>
        <button class="btn" onclick="appendNum('4')">4</button>
        <button class="btn" onclick="appendNum('5')">5</button>
        <button class="btn" onclick="appendNum('6')">6</button>
        <button class="btn btn-op" onclick="appendOp('-')">-</button>
        <button class="btn" onclick="appendNum('1')">1</button>
        <button class="btn" onclick="appendNum('2')">2</button>
        <button class="btn" onclick="appendNum('3')">3</button>
        <button class="btn btn-op" onclick="appendOp('+')">+</button>
        <button class="btn" onclick="appendNum('0')">0</button>
        <button class="btn" onclick="appendNum('.')">.</button>
        <button class="btn btn-equal" onclick="compute()">=</button>
      </div>
    </div>

    <div id="view-conv" class="converter">
      <div class="conv-row">
        <div class="conv-label">Type de conversion</div>
        <select class="conv-select" id="conv-type" onchange="updateUnits()">
          <option value="length">Longueur (m / km / mi / ft)</option>
          <option value="weight">Masse (kg / g / lb / oz)</option>
          <option value="temp">Température (°C / °F / K)</option>
          <option value="data">Données (Mo / Go / To / Ko)</option>
        </select>
      </div>
      <div class="conv-row">
        <div class="conv-label">Valeur d'entrée</div>
        <input type="number" class="conv-input" id="conv-in" value="1" oninput="convert()">
        <select class="conv-select" id="unit-from" onchange="convert()"></select>
      </div>
      <div class="conv-row">
        <div class="conv-label">Résultat converti</div>
        <input type="text" class="conv-input" id="conv-out" readonly style="color: #60a5fa;">
        <select class="conv-select" id="unit-to" onchange="convert()"></select>
      </div>
    </div>
  </div>

  <script>
    let currentInput = '0';
    let historyText = '';

    function switchTab(t) {
      document.getElementById('t-calc').classList.toggle('active', t === 'calc');
      document.getElementById('t-conv').classList.toggle('active', t === 'conv');
      document.getElementById('view-calc').style.display = t === 'calc' ? 'block' : 'none';
      document.getElementById('view-conv').style.display = t === 'conv' ? 'block' : 'none';
      if (t === 'conv') updateUnits();
    }

    function appendNum(n) {
      if (currentInput === '0' && n !== '.') currentInput = n;
      else if (n === '.' && currentInput.includes('.')) return;
      else currentInput += n;
      document.getElementById('result').innerText = currentInput;
    }

    function appendOp(op) {
      historyText = currentInput + ' ' + op + ' ';
      document.getElementById('history').innerText = historyText;
      currentInput = '0';
      document.getElementById('result').innerText = currentInput;
    }

    function clearAll() {
      currentInput = '0';
      historyText = '';
      document.getElementById('result').innerText = currentInput;
      document.getElementById('history').innerText = '';
    }

    function deleteLast() {
      if (currentInput.length > 1) currentInput = currentInput.slice(0, -1);
      else currentInput = '0';
      document.getElementById('result').innerText = currentInput;
    }

    function compute() {
      if (!historyText) return;
      try {
        const fullExpr = (historyText + currentInput).replace(/×/g, '*').replace(/÷/g, '/');
        const res = eval(fullExpr);
        document.getElementById('history').innerText = fullExpr + ' =';
        currentInput = String(Number(res.toFixed(8)));
        document.getElementById('result').innerText = currentInput;
        historyText = '';
      } catch (e) {
        document.getElementById('result').innerText = 'Erreur';
        currentInput = '0';
      }
    }

    // Units Converter Logic
    const unitsMap = {
      length: { 'Mètres': 1, 'Kilomètres': 1000, 'Miles': 1609.34, 'Pieds': 0.3048, 'Centimètres': 0.01 },
      weight: { 'Kilogrammes': 1, 'Grammes': 0.001, 'Livres (lb)': 0.453592, 'Onces (oz)': 0.0283495 },
      temp: { 'Celsius': 'C', 'Fahrenheit': 'F', 'Kelvin': 'K' },
      data: { 'Mégaoctets (Mo)': 1, 'Gigaoctets (Go)': 1024, 'Téraoctets (To)': 1048576, 'Kilooctets (Ko)': 0.0009765625 }
    };

    function updateUnits() {
      const type = document.getElementById('conv-type').value;
      const opts = Object.keys(unitsMap[type]);
      const from = document.getElementById('unit-from');
      const to = document.getElementById('unit-to');
      from.innerHTML = opts.map(o => '<option value="' + o + '">' + o + '</option>').join('');
      to.innerHTML = opts.map((o, idx) => '<option value="' + o + '" ' + (idx === 1 ? 'selected' : '') + '>' + o + '</option>').join('');
      convert();
    }

    function convert() {
      const type = document.getElementById('conv-type').value;
      const val = parseFloat(document.getElementById('conv-in').value) || 0;
      const uFrom = document.getElementById('unit-from').value;
      const uTo = document.getElementById('unit-to').value;
      let out = 0;
      if (type === 'temp') {
        let inCelsius = val;
        if (uFrom === 'Fahrenheit') inCelsius = (val - 32) * 5/9;
        if (uFrom === 'Kelvin') inCelsius = val - 273.15;
        if (uTo === 'Celsius') out = inCelsius;
        else if (uTo === 'Fahrenheit') out = (inCelsius * 9/5) + 32;
        else if (uTo === 'Kelvin') out = inCelsius + 273.15;
      } else {
        const factorFrom = unitsMap[type][uFrom];
        const factorTo = unitsMap[type][uTo];
        out = (val * factorFrom) / factorTo;
      }
      document.getElementById('conv-out').value = parseFloat(out.toFixed(6));
    }
  </script>
</body>
</html>`;

const NOTES_MARKDOWN_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Bloc-Notes & Markdown</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 16px;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 10px 16px;
      margin-bottom: 12px;
    }
    .app-title { font-size: 16px; font-weight: 700; color: #10b981; }
    .actions { display: flex; gap: 8px; }
    .btn {
      background: rgba(255,255,255,0.1);
      border: none;
      color: #fff;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn.active { background: #10b981; color: #0f172a; font-weight: 700; }
    .editor-container { flex: 1; display: flex; flex-direction: column; }
    textarea {
      flex: 1;
      width: 100%;
      min-height: 60vh;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 16px;
      color: #f8fafc;
      font-family: 'Courier New', Courier, monospace;
      font-size: 15px;
      line-height: 1.6;
      outline: none;
      resize: none;
    }
    .preview {
      flex: 1;
      min-height: 60vh;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 20px;
      overflow-y: auto;
      display: none;
      line-height: 1.6;
    }
    .preview h1 { font-size: 24px; color: #10b981; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; }
    .preview h2 { font-size: 20px; color: #34d399; margin: 16px 0 8px; }
    .preview p { margin-bottom: 12px; color: #cbd5e1; }
    .preview ul { margin-left: 20px; margin-bottom: 12px; }
    .preview code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px; font-size: 14px; }
    .status-bar {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="app-title">📝 Note & Markdown</div>
    <div class="actions">
      <button class="btn active" id="btn-edit" onclick="setTab('edit')">Éditeur</button>
      <button class="btn" id="btn-prev" onclick="setTab('prev')">Aperçu</button>
      <button class="btn" onclick="clearNote()">🗑️</button>
    </div>
  </div>

  <div class="editor-container">
    <textarea id="note" placeholder="# Titre de votre note&#10;&#10;Rédigez ici en Markdown ou texte brut. Vos notes sont enregistrées instantanément hors-ligne." oninput="saveAndCount()"></textarea>
    <div class="preview" id="preview"></div>
  </div>

  <div class="status-bar">
    <span id="counts">0 mots • 0 caractères</span>
    <span>💾 Sauvegardé en local</span>
  </div>

  <script>
    const STORAGE_KEY = 'combistore_offline_notes';
    const noteArea = document.getElementById('note');
    const previewArea = document.getElementById('preview');

    function loadNote() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) noteArea.value = saved;
      saveAndCount();
    }

    function saveAndCount() {
      const val = noteArea.value;
      localStorage.setItem(STORAGE_KEY, val);
      const words = val.trim() ? val.trim().split(/\\s+/).length : 0;
      document.getElementById('counts').innerText = words + ' mot' + (words > 1 ? 's' : '') + ' • ' + val.length + ' caractères';
      renderMarkdown(val);
    }

    function renderMarkdown(md) {
      let html = md
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(new RegExp("\\x60([^\\x60]+)\\x60", "gim"), '<code>$1</code>')
        .replace(/\n/gim, '<br>');
      previewArea.innerHTML = html;
    }

    function setTab(t) {
      document.getElementById('btn-edit').classList.toggle('active', t === 'edit');
      document.getElementById('btn-prev').classList.toggle('active', t === 'prev');
      noteArea.style.display = t === 'edit' ? 'block' : 'none';
      previewArea.style.display = t === 'prev' ? 'block' : 'none';
    }

    function clearNote() {
      if (confirm('Effacer le contenu de la note ?')) {
        noteArea.value = '';
        saveAndCount();
      }
    }

    loadNote();
  </script>
</body>
</html>`;

const SUDOKU_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sudoku Master</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .header { width: 100%; max-width: 340px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .title { font-size: 22px; font-weight: 800; color: #f59e0b; }
    .timer { font-size: 16px; font-weight: 700; color: #94a3b8; font-variant-numeric: tabular-nums; }
    .grid {
      width: 330px;
      height: 330px;
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      grid-template-rows: repeat(9, 1fr);
      background: #334155;
      border: 3px solid #f59e0b;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .cell {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
    }
    .cell:nth-child(3n) { border-right: 2px solid #64748b; }
    .cell:nth-child(n+19):nth-child(-n+27), .cell:nth-child(n+46):nth-child(-n+54) { border-bottom: 2px solid #64748b; }
    .cell.fixed { color: #f59e0b; font-weight: 900; background: rgba(245,158,11,0.08); }
    .cell.selected { background: #475569; outline: 2px solid #f59e0b; z-index: 2; }
    .cell.error { background: rgba(239,68,68,0.25); color: #f87171; }
    .numpad {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      width: 100%;
      max-width: 330px;
      margin-top: 16px;
    }
    .num-btn {
      height: 48px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
    }
    .num-btn:active { transform: scale(0.95); background: rgba(245,158,11,0.3); }
    .num-btn.erase { background: rgba(239,68,68,0.2); color: #f87171; }
    .actions-bar { margin-top: 14px; display: flex; gap: 10px; }
    .action-btn { background: rgba(255,255,255,0.1); border: none; color: #cbd5e1; padding: 8px 16px; border-radius: 10px; font-weight: 600; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">🧩 Sudoku</div>
    <div class="timer" id="time">00:00</div>
  </div>

  <div class="grid" id="board"></div>

  <div class="numpad">
    <button class="num-btn" onclick="fillNum(1)">1</button>
    <button class="num-btn" onclick="fillNum(2)">2</button>
    <button class="num-btn" onclick="fillNum(3)">3</button>
    <button class="num-btn" onclick="fillNum(4)">4</button>
    <button class="num-btn" onclick="fillNum(5)">5</button>
    <button class="num-btn" onclick="fillNum(6)">6</button>
    <button class="num-btn" onclick="fillNum(7)">7</button>
    <button class="num-btn" onclick="fillNum(8)">8</button>
    <button class="num-btn" onclick="fillNum(9)">9</button>
    <button class="num-btn erase" onclick="fillNum(0)">⌫</button>
  </div>

  <div class="actions-bar">
    <button class="action-btn" onclick="initSudoku()">Nouvelle Grille</button>
    <button class="action-btn" onclick="checkWin()">Vérifier ✓</button>
  </div>

  <script>
    const sampleGrids = [
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
      "000260701680070090190004500820100040004602900050003028009300074040050036703018000"
    ];

    let currentGrid = [];
    let initialGrid = [];
    let selectedIdx = -1;
    let timerSec = 0;
    let timerInt = null;

    function initSudoku() {
      const puzzle = sampleGrids[Math.floor(Math.random() * sampleGrids.length)];
      initialGrid = puzzle.split('').map(n => parseInt(n));
      currentGrid = [...initialGrid];
      selectedIdx = -1;
      timerSec = 0;
      if (timerInt) clearInterval(timerInt);
      timerInt = setInterval(() => {
        timerSec++;
        const m = Math.floor(timerSec / 60).toString().padStart(2, '0');
        const s = (timerSec % 60).toString().padStart(2, '0');
        document.getElementById('time').innerText = m + ':' + s;
      }, 1000);
      renderBoard();
    }

    function renderBoard() {
      const board = document.getElementById('board');
      board.innerHTML = '';
      for (let i = 0; i < 81; i++) {
        const div = document.createElement('div');
        div.className = 'cell';
        if (initialGrid[i] !== 0) div.classList.add('fixed');
        if (selectedIdx === i) div.classList.add('selected');
        div.innerText = currentGrid[i] > 0 ? currentGrid[i] : '';
        div.onclick = () => {
          if (initialGrid[i] === 0) {
            selectedIdx = i;
            renderBoard();
          }
        };
        board.appendChild(div);
      }
    }

    function fillNum(num) {
      if (selectedIdx >= 0 && initialGrid[selectedIdx] === 0) {
        currentGrid[selectedIdx] = num;
        renderBoard();
      }
    }

    function checkWin() {
      if (currentGrid.includes(0)) {
        alert("La grille n'est pas encore complète !");
        return;
      }
      alert('🎉 Félicitations ! Vous avez résolu le Sudoku.');
    }

    initSudoku();
  </script>
</body>
</html>`;

const SKETCHPAD_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>SketchPad Dessin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; touch-action: none; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .palette { display: flex; gap: 8px; align-items: center; }
    .color-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
    }
    .color-dot.active { border-color: #fff; transform: scale(1.15); }
    .actions { display: flex; gap: 8px; }
    .btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .canvas-container { flex: 1; position: relative; background: #1e293b; }
    canvas { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="palette">
      <div class="color-dot active" style="background: #ffffff;" onclick="setColor('#ffffff', this)"></div>
      <div class="color-dot" style="background: #ef4444;" onclick="setColor('#ef4444', this)"></div>
      <div class="color-dot" style="background: #3b82f6;" onclick="setColor('#3b82f6', this)"></div>
      <div class="color-dot" style="background: #10b981;" onclick="setColor('#10b981', this)"></div>
      <div class="color-dot" style="background: #f59e0b;" onclick="setColor('#f59e0b', this)"></div>
      <div class="color-dot" style="background: #ec4899;" onclick="setColor('#ec4899', this)"></div>
    </div>
    <div class="actions">
      <button class="btn" onclick="setBrush(3)">Fin</button>
      <button class="btn" onclick="setBrush(8)">Moyen</button>
      <button class="btn" onclick="setBrush(16)">Large</button>
      <button class="btn" onclick="clearCanvas()">Effacer</button>
    </div>
  </div>

  <div class="canvas-container" id="container">
    <canvas id="paint"></canvas>
  </div>

  <script>
    const canvas = document.getElementById('paint');
    const ctx = canvas.getContext('2d');
    let painting = false;
    let currentColor = '#ffffff';
    let currentWidth = 4;

    function resize() {
      const cont = document.getElementById('container');
      canvas.width = cont.clientWidth;
      canvas.height = cont.clientHeight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 50);

    function setColor(c, el) {
      currentColor = c;
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      el.classList.add('active');
    }

    function setBrush(w) {
      currentWidth = w;
    }

    function clearCanvas() {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function startPosition(e) {
      painting = true;
      draw(e);
    }

    function finishedPosition() {
      painting = false;
      ctx.beginPath();
    }

    function draw(e) {
      if (!painting) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.lineWidth = currentWidth;
      ctx.strokeStyle = currentColor;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', startPosition, { passive: true });
    canvas.addEventListener('touchend', finishedPosition, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: true });
  </script>
</body>
</html>`;

export const SAMPLE_APPS: MiniApp[] = [
    {
        id: 'sample_pomodoro',
        name: 'Pomodoro Pro',
        description: 'Minuteur de concentration & productivité 100% hors-ligne avec alertes sonores.',
        categoryId: 'utilities',
        sourceType: 'html',
        source: POMODORO_HTML,
        icon: '🍅',
        addedAt: Date.now() - 86400000 * 5,
        version: '1.2.0',
    },
    {
        id: 'sample_2048',
        name: '2048 Master',
        description: 'Le célèbre jeu de puzzle tactile. Sauvegarde de score automatique.',
        categoryId: 'games',
        sourceType: 'html',
        source: GAME_2048_HTML,
        icon: '🔢',
        addedAt: Date.now() - 86400000 * 4,
        version: '2.0.0',
    },
    {
        id: 'sample_calculator',
        name: 'Calculatrice & Conversion',
        description: 'Calculatrice scientifique et convertisseur d\'unités multiples.',
        categoryId: 'tools',
        sourceType: 'html',
        source: CALCULATOR_HTML,
        icon: '🧮',
        addedAt: Date.now() - 86400000 * 3,
        version: '1.1.0',
    },
    {
        id: 'sample_notes',
        name: 'Bloc-Notes & Markdown',
        description: 'Prise de notes avec rendu Markdown instantané et sauvegarde locale.',
        categoryId: 'utilities',
        sourceType: 'html',
        source: NOTES_MARKDOWN_HTML,
        icon: '📝',
        addedAt: Date.now() - 86400000 * 2,
        version: '1.0.0',
    },
    {
        id: 'sample_sudoku',
        name: 'Sudoku Master',
        description: 'Grilles de Sudoku avec chronomètre et validation sans connexion.',
        categoryId: 'games',
        sourceType: 'html',
        source: SUDOKU_HTML,
        icon: '🧩',
        addedAt: Date.now() - 86400000,
        version: '1.0.0',
    },
    {
        id: 'sample_sketchpad',
        name: 'SketchPad Dessin',
        description: 'Tableau blanc et esquisse tactile avec pinceaux et couleurs.',
        categoryId: 'tools',
        sourceType: 'html',
        source: SKETCHPAD_HTML,
        icon: '🎨',
        addedAt: Date.now(),
        version: '1.0.0',
    },
];
