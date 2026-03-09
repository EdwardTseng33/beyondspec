// BeyondPath App State & Logic
let currentQuestionIndex = 0;
let answers = {};
let activeQuizQuestions = [];
let isAIProduct = false;
let previousDim = null;

// DOM Elements
const screens = {
    welcome: document.getElementById('screen-welcome'),
    q0: document.getElementById('screen-q0'),
    quiz: document.getElementById('screen-quiz'),
    results: document.getElementById('screen-results')
};

function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0, 0);
}

// ===== DIM TRANSITION TOAST =====
let toastTimer = null;

function showDimToast(message) {
    const toast = document.getElementById('dim-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
    }, 1800);
}

const DIM_TRANSITION_LABELS = {
    A: '⇒ 進入 A · 受眾定義',
    T: '⇒ 進入 T · 牽引力與存活力',
    H: '⇒ 進入 H · 解法可行性'
};

// ===== EVENT LISTENERS =====
document.getElementById('btn-start').addEventListener('click', () => {
    showScreen('screen-q0');
});

document.getElementById('btn-q0-back').addEventListener('click', () => {
    showScreen('screen-welcome');
});

document.getElementById('btn-q0-ai').addEventListener('click', () => {
    isAIProduct = true;
    startQuiz();
});

document.getElementById('btn-q0-standard').addEventListener('click', () => {
    isAIProduct = false;
    startQuiz();
});

document.getElementById('btn-quiz-prev').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    } else {
        showScreen('screen-q0');
    }
});

// ===== QUIZ START =====
function startQuiz() {
    const baseQuestions = questions.filter(q => !q.isAIAlternate);

    if (isAIProduct) {
        const aiAlternates = questions.filter(q => q.isAIAlternate);
        activeQuizQuestions = baseQuestions.map(q => {
            const aiVersion = aiAlternates.find(a => a.replaces === q.id);
            return aiVersion || q;
        });
    } else {
        activeQuizQuestions = baseQuestions;
    }

    currentQuestionIndex = 0;
    previousDim = null;
    answers = {};
    showScreen('screen-quiz');
    renderQuestion();
}

// ===== RENDER QUESTION =====
function renderQuestion() {
    const q = activeQuizQuestions[currentQuestionIndex];

    if (previousDim !== null && q.dim !== previousDim && DIM_TRANSITION_LABELS[q.dim]) {
        showDimToast(DIM_TRANSITION_LABELS[q.dim]);
    }
    previousDim = q.dim;

    document.getElementById('quiz-dim-tag').textContent = `${q.id} · ${PATH_DIMENSIONS[q.dim] || q.dim}`;
    document.getElementById('quiz-question').textContent = q.text;

    const progressText = `${PATH_DIMENSIONS[q.dim].split(' ')[0]} · ${currentQuestionIndex + 1} / ${activeQuizQuestions.length}`;
    document.getElementById('quiz-progress-text').textContent = progressText;
    const progressPercent = ((currentQuestionIndex + 1) / activeQuizQuestions.length) * 100;
    document.getElementById('quiz-progress-bar').style.width = progressPercent + '%';

    // Update back button text
    const backBtn = document.getElementById('btn-quiz-prev');
    if (backBtn) backBtn.textContent = currentQuestionIndex === 0 ? '← 返回' : '← 上一題';

    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (answers[q.id] === opt.score) {
            btn.classList.add('selected');
        }
        btn.textContent = opt.text;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            answers[q.id] = opt.score;

            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < activeQuizQuestions.length) {
                    renderQuestion();
                } else {
                    document.getElementById('quiz-progress-bar').style.width = '100%';
                    finishQuiz();
                }
            }, 350);
        });

        optionsDiv.appendChild(btn);
    });
}

// ===== FINISH & RESULTS =====
function finishQuiz() {
    const result = calculateScores(answers);

    // Render results using shared function (not a shared view)
    renderResultsFromScores({
        total: result.total,
        P: result.normalized.P,
        A: result.normalized.A,
        T: result.normalized.T,
        H: result.normalized.H
    }, false);

    // Update URL hash for sharing
    history.replaceState(null, '', encodeResultHash(result.total, result.normalized.P, result.normalized.A, result.normalized.T, result.normalized.H));

    // 靜默記錄：完測自動記一筆到 Google Sheet（不含 email）
    if (GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        const silentPayload = {
            type: isAIProduct ? 'AI' : 'Standard',
            totalScore: result.total,
            P: result.normalized.P,
            A: result.normalized.A,
            T: result.normalized.T,
            H: result.normalized.H,
            pathType: result.type,
            timestamp: new Date().toISOString()
        };
        fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(silentPayload)
        }).catch(err => console.warn('[BeyondPath] Silent record failed:', err));
    }
}

// ===== RESTART =====
const restartBtn = document.getElementById('btn-restart');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        currentQuestionIndex = 0;
        answers = {};
        activeQuizQuestions = [];
        isAIProduct = false;
        previousDim = null;

        ['result-total-num', 'result-p-num', 'result-a-num', 'result-t-num', 'result-h-num'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.textContent = '0'; el.dataset.target = '0'; }
        });

        const radarContainer = document.getElementById('radar-container');
        if (radarContainer) radarContainer.style.display = 'none';

        // Clear hash
        history.replaceState(null, '', window.location.pathname);

        showScreen('screen-welcome');
    });
}

// ===== GOOGLE SHEET URL =====
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwIjqcCgDAevw2Z87OcXRRsVnOxhB_WMHrbhh1DbcPGSt88uGXj_zYnS-q2KAGJnnsg/exec';

// ===== URL HASH SHARE SYSTEM =====
// Hash format: #r=total-P-A-T-H  (e.g. #r=55-80-60-20-60)

function encodeResultHash(total, P, A, T, H) {
    return `#r=${total}-${P}-${A}-${T}-${H}`;
}

function decodeResultHash(hash) {
    if (!hash || !hash.startsWith('#r=')) return null;
    const parts = hash.substring(3).split('-').map(Number);
    if (parts.length !== 5 || parts.some(isNaN)) return null;
    return { total: parts[0], P: parts[1], A: parts[2], T: parts[3], H: parts[4] };
}

function getPathTypeFromTotal(totalScore) {
    if (totalScore <= 39) return { type: '起點探路者', tagline: '地圖還沒畫好，但你已經出發了。', desc: '你正站在旅程的起點。地圖還沒畫好，但每一步探索都是找到方向的線索。先別急著跑，確認腳下的路是對的。' };
    if (totalScore <= 59) return { type: '岔路行者', tagline: '前方有路，但需要選。', desc: '你已經走了一段路，但眼前出現了幾個岔路口。有些方向看得清，有些還在霧裡。建議停下來看看路標——你的弱項維度就是最需要釐清的方向。' };
    if (totalScore <= 79) return { type: '山腰攀登者', tagline: '方向清楚了，找到你的攀登路線。', desc: '你已經走過最混亂的山腳路段，方向越來越清楚了。現在你在半山腰，看得見山頂。關鍵是找到屬於你的攀登路線，而不是跟著別人的腳印。' };
    return { type: '破曉衝刺者', tagline: '天快亮了——準備加速衝刺。', desc: '你的旅程已經來到最後一段上坡。四個維度都展現了高度成熟，市場也給了正面回饋。天快亮了——準備好加速衝刺。' };
}

function renderResultsFromScores(scores, isSharedView) {
    const { total, P, A, T, H } = scores;
    const pathInfo = getPathTypeFromTotal(total);

    document.getElementById('result-type-name').textContent = pathInfo.type;
    const taglineEl = document.getElementById('result-tagline');
    if (taglineEl) taglineEl.textContent = pathInfo.tagline || '';
    document.getElementById('result-desc').textContent = pathInfo.desc;

    // Explorer count placeholder (hidden until real data available)
    const explorerEl = document.getElementById('explorer-count');
    if (explorerEl) explorerEl.textContent = '';

    document.getElementById('result-total-num').dataset.target = total;
    document.getElementById('result-p-num').dataset.target = P;
    document.getElementById('result-a-num').dataset.target = A;
    document.getElementById('result-t-num').dataset.target = T;
    document.getElementById('result-h-num').dataset.target = H;

    // Dynamic color classes
    const dims = { P, A, T, H };
    const dimKeys = ['P', 'A', 'T', 'H'];
    const maxScore = Math.max(P, A, T, H);
    const minScore = Math.min(P, A, T, H);

    dimKeys.forEach(dim => {
        const el = document.getElementById(`result-${dim.toLowerCase()}-num`);
        el.classList.remove('accent', 'danger', 'normal');
        if (dims[dim] === maxScore) el.classList.add('accent');
        else if (dims[dim] === minScore) el.classList.add('danger');
        else el.classList.add('normal');
    });

    // Viewpoint + reflect
    let lowestDim = 'P', minVal = P;
    ['A', 'T', 'H'].forEach(dim => { if (dims[dim] < minVal) { minVal = dims[dim]; lowestDim = dim; } });

    const spread = maxScore - minScore;
    let viewpointText, reflectText;

    if (spread < 15) {
        // 四維均衡 → 依總分高低給不同觀點
        if (total >= 80) {
            viewpointText = "四個維度都很穩，老實說這不常見——大多數早期產品都有明顯的短板。你已經走得比多數人遠。現在的挑戰不再是補弱項，而是找到加速的槓桿點：哪一個維度如果從好變成極好，能帶動整體突破？";
            reflectText = "— 如果只能把一件事做到極致，你會選哪個方向全力衝刺？";
        } else if (total >= 60) {
            viewpointText = "你的四個維度相當均衡，每個方向都有一定基礎。但均衡有時候也意味著還沒有壓倒性的優勢。我的建議：從四個維度裡挑一個你最有信心的，先把它做到極致，用一個強項帶動其他三個。";
            reflectText = "— 四個維度裡，你最有把握的是哪一個？為什麼？";
        } else {
            viewpointText = "你的四個維度分數相近，但整體偏低——代表你的產品還在很早期的探索階段。好消息是還沒有錯得太離譜。壞消息是每個方向都需要更多驗證。我建議先從 Problem 開始，確認你要解的問題是真的，再往下走。";
            reflectText = "— 你有沒有親耳聽過用戶描述這個問題的痛？";
        }
    } else {
        // 有明確弱項 → 針對最低維度給建議
        if (lowestDim === 'P') {
            viewpointText = "說實話，其他維度你做得不錯，但「問題定義」這塊讓我擔心。你可能正在為一個不夠痛的問題打造解法。我會建議你這週就去找 5 個目標用戶，不是問他們覺得你的產品好不好——而是聽他們怎麼描述自己的困擾。如果他們講不出來，問題可能不夠真。";
            reflectText = "— 你的用戶最後一次說「這真的很痛」，是什麼時候？";
        } else if (lowestDim === 'A') {
            viewpointText = "你的問題看得很準，解法方向也對，但「受眾」這塊比較模糊。坦白說，「很多人都能用」是最危險的說法——因為你等於沒有對象。我會建議你把受眾縮到一個具體的人：一個職業、一個場景、一個非解決不可的時刻。先服務好 10 個人，比觸及 1000 個人重要。";
            reflectText = "— 如果只能服務一種人，你會選誰？";
        } else if (lowestDim === 'T') {
            viewpointText = "你的產品方向很清楚，問題和受眾都有基礎。但「牽引力」偏低是一個警訊——這代表市場還沒真正回應你。我最常看到創業者在這個階段犯的錯是繼續打磨產品，而不是去測試付費意願。我的建議：這週就設計一個最小的收費實驗，哪怕只是一頁付款連結。";
            reflectText = "— 如果只能測試一個假設，你會先測哪一個？";
        } else {
            viewpointText = "你對市場的判斷力很好，問題和受眾都找對了。但「解法可行性」的分數讓我好奇——你的護城河在哪？如果競爭對手花三個月就能做出一樣的東西，你需要重新思考什麼是別人抄不走的。可能是數據、可能是關係網、可能是某個獨特的流程。";
            reflectText = "— 有什麼是你能做、但競爭對手很難複製的？";
        }
    }

    document.getElementById('result-viewpoint').textContent = viewpointText;
    const reflectEl = document.getElementById('result-reflect');
    if (reflectEl) reflectEl.textContent = reflectText;

    showScreen('screen-results');

    setTimeout(() => {
        document.getElementById('radar-container').style.display = 'block';
        animateRadar({ P, A, T, H });
        animateCountUp({ total, P, A, T, H });
    }, 100);
}

// Check for shared result on page load
function checkSharedResult() {
    const shared = decodeResultHash(window.location.hash);
    if (!shared) return false;
    renderResultsFromScores(shared, true);
    return true;
}

// ===== RADAR ANIMATION =====
const center = 150;
const maxRadius = 140;

function scoreToRadius(score) { return (score / 100) * maxRadius; }

function getRadarPoints(s) {
    const rP = scoreToRadius(s.P);
    const rA = scoreToRadius(s.A);
    const rT = scoreToRadius(s.T);
    const rH = scoreToRadius(s.H);
    return {
        P: { x: center, y: center - rP },
        A: { x: center + rA, y: center },
        T: { x: center, y: center + rT },
        H: { x: center - rH, y: center },
    };
}

function pointsToString(pts) {
    return `${pts.P.x},${pts.P.y} ${pts.A.x},${pts.A.y} ${pts.T.x},${pts.T.y} ${pts.H.x},${pts.H.y}`;
}

function animateRadar(scores) {
    const finalPts = getRadarPoints(scores);
    const duration = 1200;
    const delay = 900;

    setTimeout(() => {
        const startTime = performance.now();
        function update(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            const current = {
                P: { x: center + (finalPts.P.x - center) * eased, y: center + (finalPts.P.y - center) * eased },
                A: { x: center + (finalPts.A.x - center) * eased, y: center + (finalPts.A.y - center) * eased },
                T: { x: center + (finalPts.T.x - center) * eased, y: center + (finalPts.T.y - center) * eased },
                H: { x: center + (finalPts.H.x - center) * eased, y: center + (finalPts.H.y - center) * eased },
            };
            const pts = pointsToString(current);
            document.getElementById('radarShape').setAttribute('points', pts);
            document.getElementById('radarStroke').setAttribute('points', pts);

            ['P', 'A', 'T', 'H'].forEach(k => {
                const dot = document.getElementById('dot' + k);
                dot.setAttribute('cx', current[k].x);
                dot.setAttribute('cy', current[k].y);
            });

            if (t < 1) requestAnimationFrame(update);
            else {
                document.querySelectorAll('.score-dot').forEach((d, i) => {
                    setTimeout(() => { d.style.opacity = '1'; d.style.transition = 'opacity 0.3s'; }, i * 80);
                });
            }
        }
        requestAnimationFrame(update);
    }, delay);
}

function animateCountUp(scores) {
    if (!scores) return;
    const mapping = [
        { id: 'result-total-num', value: scores.total, delay: 1900 },
        { id: 'result-p-num', value: scores.P, delay: 2100 },
        { id: 'result-a-num', value: scores.A, delay: 2200 },
        { id: 'result-t-num', value: scores.T, delay: 2300 },
        { id: 'result-h-num', value: scores.H, delay: 2400 }
    ];

    mapping.forEach(({ id, value, delay }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const target = value || 0;
        el.textContent = "0";

        setTimeout(() => {
            const duration = 800;
            const startTime = performance.now();
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }, delay);
    });
}

// ===== PAGE LOAD: Check for shared result hash =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkSharedResult());
} else {
    checkSharedResult();
}

