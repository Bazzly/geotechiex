document.addEventListener('DOMContentLoaded', () => {
  const W = window.CHARADES_WORDS;

  const state = {
    category: 'mixed',
    duration: 60,
    pool: [],
    index: 0,
    current: '',
    timeLeft: 60,
    timer: null,
    correct: [],
    skipped: [],
  };

  const setupScreen = document.getElementById('screen-setup');
  const playScreen = document.getElementById('screen-play');
  const resultsScreen = document.getElementById('screen-results');

  const wordEl = document.getElementById('current-word');
  const timerEl = document.getElementById('timer-display');
  const scoreEl = document.getElementById('score-count');

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function wordsFor(category) {
    if (category === 'mixed') return [...W.surveying, ...W.tech, ...W.geotechiex];
    return W[category] || [];
  }

  function showSetup() {
    setupScreen.classList.remove('hidden');
    playScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
  }

  function showPlay() {
    setupScreen.classList.add('hidden');
    playScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
  }

  function showResults() {
    setupScreen.classList.add('hidden');
    playScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    document.getElementById('final-score').textContent = state.correct.length;

    const correctList = document.getElementById('correct-list');
    correctList.innerHTML = state.correct.length
      ? state.correct.map((w) => `<li>${w}</li>`).join('')
      : '<li class="text-steel">None yet — try again.</li>';

    const skippedList = document.getElementById('skipped-list');
    skippedList.innerHTML = state.skipped.length
      ? state.skipped.map((w) => `<li class="line-through text-steel">${w}</li>`).join('')
      : '<li class="text-steel">Nothing skipped.</li>';
  }

  function updateTimerDisplay() {
    timerEl.textContent = state.timeLeft;
    timerEl.classList.toggle('text-red-400', state.timeLeft <= 10);
    timerEl.classList.toggle('text-paper', state.timeLeft > 10);
  }

  function showWord() {
    if (state.index >= state.pool.length) {
      state.pool = shuffle(wordsFor(state.category));
      state.index = 0;
    }
    state.current = state.pool[state.index];
    wordEl.textContent = state.current;
  }

  function nextWord(gotIt) {
    if (gotIt) state.correct.push(state.current);
    else state.skipped.push(state.current);
    state.index += 1;
    scoreEl.textContent = state.correct.length;
    showWord();
  }

  function endRound() {
    clearInterval(state.timer);
    showResults();
  }

  function startTimer() {
    clearInterval(state.timer);
    updateTimerDisplay();
    state.timer = setInterval(() => {
      state.timeLeft -= 1;
      updateTimerDisplay();
      if (state.timeLeft <= 0) endRound();
    }, 1000);
  }

  function startGame() {
    state.pool = shuffle(wordsFor(state.category));
    state.index = 0;
    state.correct = [];
    state.skipped = [];
    state.timeLeft = state.duration;
    scoreEl.textContent = '0';
    showWord();
    showPlay();
    startTimer();
  }

  // ---- setup controls ----

  document.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.category = btn.dataset.category;
      document.querySelectorAll('.category-btn').forEach((b) => b.classList.remove('ring-2', 'ring-accent'));
      btn.classList.add('ring-2', 'ring-accent');
    });
  });

  document.querySelectorAll('.duration-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.duration = parseInt(btn.dataset.duration, 10);
      document.querySelectorAll('.duration-btn').forEach((b) => b.classList.remove('bg-accent', 'text-white'));
      btn.classList.add('bg-accent', 'text-white');
    });
  });

  document.getElementById('start-game').addEventListener('click', startGame);
  document.getElementById('got-it').addEventListener('click', () => nextWord(true));
  document.getElementById('skip-word').addEventListener('click', () => nextWord(false));
  document.getElementById('end-early').addEventListener('click', endRound);
  document.getElementById('play-again').addEventListener('click', startGame);
  document.getElementById('change-category').addEventListener('click', showSetup);

  document.addEventListener('keydown', (e) => {
    if (playScreen.classList.contains('hidden')) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      nextWord(true);
    } else if (e.code === 'Backspace' || e.key.toLowerCase() === 's') {
      e.preventDefault();
      nextWord(false);
    }
  });

  // defaults: Mixed category, 60s, selected visually
  document.querySelector('.category-btn[data-category="mixed"]').classList.add('ring-2', 'ring-accent');
  document.querySelector('.duration-btn[data-duration="60"]').classList.add('bg-accent', 'text-white');
});
