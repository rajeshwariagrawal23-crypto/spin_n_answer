// ---------- Config ----------
const TOTAL_SPINS = 8;
const QUESTION_TIME = 15;
const LIFELINES = 2;
const STREAK_BONUS = 5;      // per streak step
const STREAK_BONUS_MAX = 25;

// Wheel slices: topic slices ask a question, "bonus"/"bomb" are special
const SLICES = [
  { type: "q", topic: "Tech",      emoji: "💻", pts: 10, color: "#3a86ff" },
  { type: "q", topic: "Science",   emoji: "🔬", pts: 20, color: "#8338ec" },
  { type: "q", topic: "General",   emoji: "🌍", pts: 30, color: "#06d6a0" },
  { type: "q", topic: "Sports",    emoji: "⚽", pts: 20, color: "#fb5607" },
  { type: "q", topic: "Geography", emoji: "🗺️", pts: 10, color: "#ef476f" },
  { type: "bonus", label: "Bonus", emoji: "🎁", pts: 15, color: "#ffbe0b" },
  { type: "q", topic: "Tech",      emoji: "💻", pts: 40, color: "#118ab2" },
  { type: "q", topic: "Science",   emoji: "🔬", pts: 50, color: "#b5179e" },
  { type: "bomb",  label: "Bomb",  emoji: "💣", pts: -10, color: "#2b2d42" },
  { type: "q", topic: "General",   emoji: "🌍", pts: 20, color: "#2ec4b6" }
];

// ---------- Question bank (add your own!) ----------
const BANK = {
  Tech: [
    { q: "What does CSS stand for?", o: ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Colorful Style Syntax"], a: 0 },
    { q: "Which language runs in the web browser?", o: ["Java", "C", "JavaScript", "Python"], a: 2 },
    { q: "What does 'www' stand for?", o: ["World Wide Web", "Web World Wide", "Wide World Web", "World Web Wire"], a: 0 },
    { q: "Which company created the Android OS (now owned by)?", o: ["Apple", "Google", "Microsoft", "IBM"], a: 1 },
    { q: "What is 1 KB (commonly) equal to?", o: ["100 bytes", "512 bytes", "1024 bytes", "2048 bytes"], a: 2 },
    { q: "Which tag creates a hyperlink in HTML?", o: ["<link>", "<a>", "<href>", "<url>"], a: 1 }
  ],
  Science: [
    { q: "What is the chemical symbol for gold?", o: ["Ag", "Gd", "Go", "Au"], a: 3 },
    { q: "Which planet is closest to the Sun?", o: ["Venus", "Mercury", "Mars", "Earth"], a: 1 },
    { q: "What gas do humans need to breathe?", o: ["Oxygen", "Nitrogen", "Helium", "Carbon dioxide"], a: 0 },
    { q: "What is the powerhouse of the cell?", o: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], a: 2 },
    { q: "What force pulls objects toward Earth?", o: ["Magnetism", "Gravity", "Friction", "Inertia"], a: 1 },
    { q: "What is H2O commonly known as?", o: ["Salt", "Hydrogen", "Water", "Peroxide"], a: 2 }
  ],
  General: [
    { q: "How many days are in a leap year?", o: ["364", "365", "366", "367"], a: 2 },
    { q: "Which is the national bird of India?", o: ["Sparrow", "Peacock", "Eagle", "Parrot"], a: 1 },
    { q: "How many colours are in a rainbow?", o: ["5", "6", "7", "8"], a: 2 },
    { q: "Which festival is called the festival of lights?", o: ["Holi", "Diwali", "Eid", "Baisakhi"], a: 1 },
    { q: "How many hours are in a day?", o: ["12", "24", "36", "48"], a: 1 },
    { q: "Who is known as the Father of the Nation in India?", o: ["Nehru", "Patel", "Mahatma Gandhi", "Bose"], a: 2 }
  ],
  Sports: [
    { q: "How many players are in a cricket team on the field?", o: ["9", "10", "11", "12"], a: 2 },
    { q: "Which sport is played at Wimbledon?", o: ["Golf", "Tennis", "Cricket", "Hockey"], a: 1 },
    { q: "How often are the Olympic Games held (Summer)?", o: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], a: 2 },
    { q: "India's national sport is often said to be...", o: ["Cricket", "Kabaddi", "Hockey", "Football"], a: 2 },
    { q: "How many points is a try worth in rugby union?", o: ["3", "4", "5", "6"], a: 2 },
    { q: "In football, how many players are on a team on the pitch?", o: ["9", "10", "11", "12"], a: 2 }
  ],
  Geography: [
    { q: "What is the largest continent?", o: ["Africa", "Asia", "Europe", "Antarctica"], a: 1 },
    { q: "Which river is considered holiest in India?", o: ["Yamuna", "Godavari", "Ganga", "Narmada"], a: 2 },
    { q: "What is the capital of Japan?", o: ["Seoul", "Beijing", "Tokyo", "Bangkok"], a: 2 },
    { q: "Which is the longest river in the world (commonly cited)?", o: ["Amazon", "Nile", "Yangtze", "Mississippi"], a: 1 },
    { q: "Mount Everest lies in which mountain range?", o: ["Alps", "Andes", "Rockies", "Himalayas"], a: 3 },
    { q: "Which ocean lies to the south of India?", o: ["Atlantic", "Pacific", "Indian", "Arctic"], a: 2 }
  ]
};

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const screens = { start: $("start"), game: $("game"), result: $("result") };
const show = (n) => { Object.values(screens).forEach((s) => s.classList.remove("active")); screens[n].classList.add("active"); };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- Sound ----------
let soundOn = true, ctx = null;
function beep(freq, dur = 0.12, type = "sine", delay = 0) {
  if (!soundOn) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + delay;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur);
  } catch (e) {}
}
const sfx = {
  spin: () => { for (let i = 0; i < 28; i++) beep(300 + (i % 2) * 120, 0.04, "triangle", i * 0.17 + i * i * 0.0016); },
  right: () => [523, 659, 784].forEach((f, i) => beep(f, 0.14, "sine", i * 0.1)),
  wrong: () => { beep(250, 0.15, "square"); beep(170, 0.25, "square", 0.15); },
  bonus: () => [660, 880, 1100, 1320].forEach((f, i) => beep(f, 0.1, "sine", i * 0.08)),
  bomb: () => { beep(120, 0.4, "sawtooth"); beep(80, 0.5, "sawtooth", 0.1); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.2, "sine", i * 0.14))
};

// ---------- Wheel drawing ----------
const canvas = $("wheel"), c = canvas.getContext("2d");
const SEG = (Math.PI * 2) / SLICES.length;

function drawWheel() {
  const R = canvas.width / 2;
  c.clearRect(0, 0, canvas.width, canvas.height);
  SLICES.forEach((s, i) => {
    const start = -Math.PI / 2 + i * SEG;       // slice 0 begins at the top
    c.beginPath(); c.moveTo(R, R);
    c.arc(R, R, R - 4, start, start + SEG); c.closePath();
    c.fillStyle = s.color; c.fill();
    c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = 4; c.stroke();

    // text along the radius
    c.save();
    c.translate(R, R);
    c.rotate(start + SEG / 2);
    c.textAlign = "right"; c.fillStyle = "#fff"; c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 6;
    c.font = "bold 46px 'Segoe UI', sans-serif";
    c.fillText(s.emoji, R - 40, 16);
    c.font = "bold 36px 'Segoe UI', sans-serif";
    const label = s.type === "q" ? `${s.topic} ${s.pts}` : s.type === "bonus" ? `Bonus +${s.pts}` : `Bomb ${s.pts}`;
    c.fillText(label, R - 112, 13);
    c.restore();
  });
}

// ---------- State ----------
let score, round, streak, bestStreak, correct, asked, lifelines, spinning, rotation = 0;
let usedQ = {}, qTimer = null, qLeft = 0, current = null, answered = false;

function resetGame() {
  score = 0; round = 0; streak = 0; bestStreak = 0; correct = 0; asked = 0;
  lifelines = LIFELINES; spinning = false; usedQ = {};
  setBanner("Press SPIN to start!");
  hud();
  $("spin-btn").disabled = false;
}

function hud() {
  $("round").textContent = `${Math.min(round + 1, TOTAL_SPINS)}/${TOTAL_SPINS}`;
  $("score").textContent = score;
  $("streak").textContent = `${streak} 🔥`;
  $("lifelines").textContent = lifelines;
}

function setBanner(text, cls = "") {
  const b = $("banner"); b.textContent = text; b.className = "banner " + cls;
}

// ---------- Spin ----------
function spin() {
  if (spinning || round >= TOTAL_SPINS) return;
  spinning = true;
  $("spin-btn").disabled = true;
  setBanner("Spinning…");
  sfx.spin();

  const idx = Math.floor(Math.random() * SLICES.length);
  const jitter = (Math.random() - 0.5) * SEG * 0.7;           // land anywhere inside the slice
  const targetDeg = 360 - ((idx + 0.5) * SEG * 180) / Math.PI + (jitter * 180) / Math.PI;
  const current = rotation % 360;
  rotation += 360 * 5 + ((targetDeg - current) % 360 + 360) % 360;
  canvas.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => landed(SLICES[idx]), 5200);
}

function landed(slice) {
  spinning = false;
  if (slice.type === "bonus") {
    score += slice.pts; streak = streak; sfx.bonus();
    setBanner(`🎁 Free bonus! +${slice.pts} points`, "good");
    nextRound();
  } else if (slice.type === "bomb") {
    score = Math.max(0, score + slice.pts); streak = 0; sfx.bomb();
    setBanner(`💣 Boom! ${slice.pts} points and your streak is gone`, "bad");
    nextRound();
  } else {
    setBanner(`${slice.emoji} ${slice.topic} for ${slice.pts} points!`);
    setTimeout(() => askQuestion(slice), 700);
  }
  hud();
}

function nextRound() {
  round++;
  hud();
  if (round >= TOTAL_SPINS) setTimeout(endGame, 1500);
  else setTimeout(() => { $("spin-btn").disabled = false; }, 900);
}

// ---------- Questions ----------
function pickQuestion(topic) {
  const list = BANK[topic];
  usedQ[topic] = usedQ[topic] || [];
  let pool = list.map((_, i) => i).filter((i) => !usedQ[topic].includes(i));
  if (!pool.length) { usedQ[topic] = []; pool = list.map((_, i) => i); }
  const i = pool[Math.floor(Math.random() * pool.length)];
  usedQ[topic].push(i);
  return list[i];
}

function askQuestion(slice) {
  const item = pickQuestion(slice.topic);
  // shuffle options but track the right one
  const right = item.o[item.a];
  const opts = shuffle(item.o);
  current = { slice, q: item.q, opts, ans: opts.indexOf(right) };
  answered = false; asked++;

  $("m-topic").textContent = `${slice.emoji} ${slice.topic}`;
  $("m-pts").textContent = `+${slice.pts}`;
  $("m-question").textContent = item.q;
  $("m-feedback").textContent = "";
  $("m-continue").classList.add("hidden");
  $("m-5050").disabled = lifelines <= 0;
  $("m-5050").classList.remove("hidden");

  const box = $("m-options"); box.innerHTML = "";
  opts.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "opt"; b.textContent = t;
    b.addEventListener("click", () => answer(i));
    box.appendChild(b);
  });
  $("modal").classList.remove("hidden");
  startQTimer();
}

function startQTimer() {
  clearInterval(qTimer);
  qLeft = QUESTION_TIME;
  paintTimer();
  qTimer = setInterval(() => {
    qLeft--; paintTimer();
    if (qLeft <= 0) { clearInterval(qTimer); answer(-1); }
  }, 1000);
}
function paintTimer() {
  $("m-timer").textContent = qLeft;
  $("m-timer").classList.toggle("low", qLeft <= 5);
  $("m-fill").style.width = (qLeft / QUESTION_TIME) * 100 + "%";
}

function answer(i) {
  if (answered) return;
  answered = true;
  clearInterval(qTimer);
  const btns = [...$("m-options").children];
  btns.forEach((b) => (b.disabled = true));
  btns[current.ans].classList.add("correct");
  $("m-5050").classList.add("hidden");
  const fb = $("m-feedback");

  if (i === current.ans) {
    streak++; bestStreak = Math.max(bestStreak, streak); correct++;
    const bonus = Math.min((streak - 1) * STREAK_BONUS, STREAK_BONUS_MAX);
    const gain = current.slice.pts + bonus;
    score += gain;
    fb.textContent = `✅ Correct! +${current.slice.pts}` + (bonus ? ` +${bonus} streak bonus 🔥` : "");
    sfx.right();
  } else {
    if (i >= 0) btns[i].classList.add("wrong");
    streak = 0;
    fb.textContent = i === -1 ? "⏰ Time's up! Streak reset." : "❌ Wrong answer. Streak reset.";
    sfx.wrong();
  }
  hud();
  $("m-continue").classList.remove("hidden");
}

function useLifeline() {
  if (lifelines <= 0 || answered) return;
  lifelines--;
  const btns = [...$("m-options").children];
  const wrongIdx = shuffle(btns.map((_, i) => i).filter((i) => i !== current.ans)).slice(0, 2);
  wrongIdx.forEach((i) => { btns[i].disabled = true; btns[i].classList.add("gone"); });
  $("m-5050").disabled = true;
  hud();
}

function closeModal() {
  $("modal").classList.add("hidden");
  setBanner(streak > 1 ? `🔥 ${streak} in a row! Spin again.` : "Spin again!");
  nextRound();
}

// ---------- End ----------
function endGame() {
  const prev = Number(localStorage.getItem("sa-best") || 0);
  const isBest = score > prev;
  if (isBest) localStorage.setItem("sa-best", score);
  const acc = asked ? Math.round((correct / asked) * 100) : 0;

  $("res-emoji").textContent = score >= 200 ? "🏆" : score >= 100 ? "🎉" : "👍";
  $("res-title").textContent = score >= 200 ? "Wheel Champion!" : score >= 100 ? "Great spinning!" : "Nice try!";
  $("res-score").textContent = score;
  $("res-correct").textContent = `${correct}/${asked}`;
  $("res-streak").textContent = bestStreak;
  $("res-acc").textContent = acc + "%";
  $("res-new").classList.toggle("hidden", !isBest);
  loadBest();
  show("result");
  sfx.win();
  if (score >= 100) confetti();
}

function loadBest() { $("best").textContent = localStorage.getItem("sa-best") || 0; }

// ---------- Confetti ----------
function confetti() {
  const cv = $("confetti"), g = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const cols = ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff", "#06d6a0"];
  const bits = Array.from({ length: 140 }, () => ({
    x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5,
    s: 5 + Math.random() * 7, v: 2 + Math.random() * 4, r: Math.random() * 6,
    c: cols[Math.floor(Math.random() * cols.length)], d: (Math.random() - 0.5) * 3
  }));
  let f = 0;
  (function loop() {
    g.clearRect(0, 0, cv.width, cv.height);
    bits.forEach((b) => {
      b.y += b.v; b.x += b.d; b.r += 0.15;
      g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.c; g.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6); g.restore();
    });
    if (++f < 240) requestAnimationFrame(loop); else g.clearRect(0, 0, cv.width, cv.height);
  })();
}

// ---------- Events ----------
function begin() {
  clearInterval(qTimer);
  canvas.style.transition = "none"; rotation = 0; canvas.style.transform = "rotate(0deg)";
  void canvas.offsetWidth; canvas.style.transition = "";
  resetGame();
  show("game");
}
$("start-btn").addEventListener("click", begin);
$("again").addEventListener("click", begin);
$("menu").addEventListener("click", () => show("start"));
$("quit").addEventListener("click", () => { clearInterval(qTimer); $("modal").classList.add("hidden"); show("start"); });
$("spin-btn").addEventListener("click", spin);
$("m-continue").addEventListener("click", closeModal);
$("m-5050").addEventListener("click", useLifeline);
$("sound-btn").addEventListener("click", (e) => { soundOn = !soundOn; e.target.textContent = soundOn ? "🔊 Sound on" : "🔇 Sound off"; });

drawWheel();
loadBest();
