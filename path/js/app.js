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
    const progressPercent = ((currentQuestionIndex) / activeQuizQuestions.length) * 100;
    document.getElementById('quiz-progress-bar').style.width = progressPercent + '%';

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

    document.getElementById('result-type-name').textContent = result.type;
    document.getElementById('result-desc').textContent = result.desc;

    document.getElementById('result-total-num').dataset.target = result.total;
    document.getElementById('result-p-num').dataset.target = result.normalized.P;
    document.getElementById('result-a-num').dataset.target = result.normalized.A;
    document.getElementById('result-t-num').dataset.target = result.normalized.T;
    document.getElementById('result-h-num').dataset.target = result.normalized.H;

    // M1: Dynamic color classes
    const scores = result.normalized;
    const dims = ['P', 'A', 'T', 'H'];
    const maxScore = Math.max(...dims.map(d => scores[d]));
    const minScore = Math.min(...dims.map(d => scores[d]));

    dims.forEach(dim => {
        const el = document.getElementById(`result-${dim.toLowerCase()}-num`);
        el.classList.remove('accent', 'danger', 'normal');
        if (scores[dim] === maxScore) {
            el.classList.add('accent');
        } else if (scores[dim] === minScore) {
            el.classList.add('danger');
        } else {
            el.classList.add('normal');
        }
    });

    // Viewpoint text
    let lowestDim = 'P';
    let minVal = scores.P;
    ['A', 'T', 'H'].forEach(dim => {
        if (scores[dim] < minVal) { minVal = scores[dim]; lowestDim = dim; }
    });

    let viewpointText = "你的產品架構相當均衡，目前處於穩定的探索期。建議針對最不可控的風險優先切入。";
    if (lowestDim === 'P') viewpointText = "你的受眾和解法看起來很有潛力，但核心的「問題定義」分數偏低——建議先停下手邊的開發，去找至少 5 個真實用戶聊聊他們的痛點。";
    if (lowestDim === 'A') viewpointText = "你的問題定義很深刻，但受眾輪廓較為模糊。這可能導致行銷成本過高。建議縮小打擊範圍，先服務好一個特定的利基市場。";
    if (lowestDim === 'T') viewpointText = "你的產品完整度高，問題也定義對了。但牽引力表現面臨挑戰——這是死亡之谷。建議盡快驗證最小收費模式，測試市場買單意願。";
    if (lowestDim === 'H') viewpointText = "你的市場敏銳度極高，但目前的執行方案（How）可能難以建立長期護城河。建議重新盤點團隊資源與核心技術壁壘。";

    document.getElementById('result-viewpoint').textContent = viewpointText;

    const reflectQuestions = {
        P: '🪞 你的用戶最後一次說「這真的很痛」是什麼時候？',
        A: '🪞 你的第一個付費用戶，會是誰？',
        T: '🪞 如果只能測試一個假設，你會先測哪一個？',
        H: '🪞 有什麼是你能做、但競爭對手很難複製的？'
    };
    const reflectEl = document.getElementById('result-reflect');
    if (reflectEl) reflectEl.textContent = reflectQuestions[lowestDim] || reflectQuestions['T'];

    // 客製化 Email CTA — 針對最弱維度
    const weakDimLabels = {
        P: { label: '問題定義', hook: '你的「問題定義」得分偏低——這代表什麼？留下 email，收到你專屬的弱項拆解 + 1 個立即可執行的行動建議。' },
        A: { label: '受眾定義', hook: '你的「受眾定義」得分偏低——目標客群可能還不夠聚焦。留下 email，收到你專屬的弱項拆解 + 1 個立即可執行的行動建議。' },
        T: { label: '牽引力', hook: '你的「牽引力」得分偏低——這是產品死亡之谷的關鍵指標。留下 email，收到你專屬的弱項拆解 + 1 個立即可執行的行動建議。' },
        H: { label: '解法可行性', hook: '你的「解法可行性」得分偏低——護城河尚未建立。留下 email，收到你專屬的弱項拆解 + 1 個立即可執行的行動建議。' }
    };
    const emailLabel = document.getElementById('email-capture-label');
    if (emailLabel && weakDimLabels[lowestDim]) {
        emailLabel.textContent = weakDimLabels[lowestDim].hook;
    }

    showScreen('screen-results');

    setTimeout(() => {
        document.getElementById('radar-container').style.display = 'block';
        animateRadar(result.normalized);
        animateCountUp();
    }, 100);

    // 靜默記錄：完測自動記一筆到 Google Sheet（不含 email）
    if (GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        const silentPayload = {
            email: '',
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
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
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

        const emailInput = document.getElementById('email-input');
        const emailSuccess = document.getElementById('email-success');
        if (emailInput) { emailInput.value = ''; emailInput.style.display = ''; }
        if (emailSuccess) emailSuccess.style.display = 'none';
        const emailBtn = document.getElementById('btn-email-submit');
        if (emailBtn) emailBtn.style.display = '';

        const radarContainer = document.getElementById('radar-container');
        if (radarContainer) radarContainer.style.display = 'none';

        showScreen('screen-welcome');
    });
}

// ===== EMAIL CAPTURE → Google Sheet =====
// 替換為你的 Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwIjqcCgDAevw2Z87OcXRRsVnOxhB_WMHrbhh1DbcPGSt88uGXj_zYnS-q2KAGJnnsg/exec';

const emailSubmitBtn = document.getElementById('btn-email-submit');
if (emailSubmitBtn) {
    emailSubmitBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('email-input');
        const emailSuccess = document.getElementById('email-success');
        if (!emailInput) return;

        const email = emailInput.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValid) {
            emailInput.style.borderColor = 'var(--danger)';
            setTimeout(() => { emailInput.style.borderColor = ''; }, 1500);
            return;
        }

        // 計算目前分數
        const result = calculateScores(answers);

        // 送到 Google Sheet
        const payload = {
            email: email,
            type: isAIProduct ? 'AI' : 'Standard',
            totalScore: result.total,
            P: result.normalized.P,
            A: result.normalized.A,
            T: result.normalized.T,
            H: result.normalized.H,
            pathType: result.type,
            timestamp: new Date().toISOString()
        };

        emailInput.style.display = 'none';
        emailSubmitBtn.style.display = 'none';
        if (emailSuccess) emailSuccess.style.display = 'block';

        // 非同步送出，不阻塞 UI
        if (GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => console.warn('[BeyondPath] Sheet sync failed:', err));
        }

        console.log('[BeyondPath] Data captured:', payload);
    });
}

// ===== SHARE BUTTON =====
const shareBtn = document.getElementById('btn-share');
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const result = calculateScores(answers);
        const shareText = `我的 PATH 產品力評估：綜合 ${result.total} 分（P:${result.normalized.P} A:${result.normalized.A} T:${result.normalized.T} H:${result.normalized.H}）— ${result.type}。你也來測測看！`;
        const shareUrl = 'https://beyondspec.tw/path/';
        const hint = document.getElementById('share-hint');

        if (navigator.share) {
            navigator.share({ title: 'BeyondPath — PATH 產品力評估', text: shareText, url: shareUrl })
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(shareText + '\n' + shareUrl).then(() => {
                if (hint) {
                    hint.textContent = '✓ 已複製到剪貼簿！';
                    hint.classList.add('visible');
                    setTimeout(() => hint.classList.remove('visible'), 2500);
                }
            }).catch(() => {
                if (hint) {
                    hint.textContent = '請手動複製連結分享';
                    hint.classList.add('visible');
                }
            });
        }
    });
}

// ===== RADAR ANIMATION =====
const center = 150;
const maxRadius = 130;

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

function animateCountUp() {
    const counters = document.querySelectorAll('.screen-results [data-target]');
    counters.forEach((counter, i) => {
        const target = parseInt(counter.dataset.target);
        const delay = counter.id === 'result-total-num' ? 1900 : 2100 + (i * 100);
        const duration = 800;

        counter.textContent = "0";

        setTimeout(() => {
            const startTime = performance.now();
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }, delay);
    });
}

