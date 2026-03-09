// BeyondPath L1 Question Bank & Logic

const PATH_DIMENSIONS = {
  P: 'Problem 問題清晰度',
  A: 'Audience 受眾定義',
  T: 'Traction 牽引力與存活力',
  H: 'How 解法可行性'
};

const questions = [
  // --- P Dimension (Problem) ---
  {
    id: 'P1',
    dim: 'P',
    text: '你能一句話說清楚在解決什麼問題嗎？',
    options: [
      { score: 1, text: '還在摸索' },
      { score: 2, text: '大概能說但每次不太一樣' },
      { score: 3, text: '能，別人馬上就懂' }
    ]
  },
  {
    id: 'P2',
    dim: 'P',
    text: '你怎麼確定這問題真的存在？',
    options: [
      { score: 1, text: '直覺告訴我' },
      { score: 2, text: '聊過人，有人認同' },
      { score: 3, text: '有明確證據' }
    ]
  },
  {
    id: 'P3',
    dim: 'P',
    text: '有這個問題的人，現在怎麼解決？',
    options: [
      { score: 1, text: '不確定' },
      { score: 2, text: '知道替代方案沒深入研究' },
      { score: 3, text: '很清楚，知道哪裡不夠好' }
    ]
  },
  {
    id: 'P4',
    dim: 'P',
    text: '這件事對他們有多痛？',
    options: [
      { score: 1, text: '忍一忍就過去' },
      { score: 2, text: '影響效率但有替代方案' },
      { score: 3, text: '非常痛，一直在找解法' }
    ]
  },
  {
    id: 'P5',
    dim: 'P',
    text: '你跟真正有需求的人聊過嗎？',
    options: [
      { score: 1, text: '沒有，自己想的' },
      { score: 2, text: '聊過幾個不算深入' },
      { score: 3, text: '深入聊過多位且有記錄' }
    ]
  },
  {
    id: 'P3-AI',
    dim: 'P',
    isAIAlternate: true,
    replaces: 'P3',
    text: '用戶能直接用 ChatGPT 解決嗎？',
    options: [
      { score: 1, text: 'prompt 就能做到' },
      { score: 2, text: '做到一部分不方便' },
      { score: 3, text: '不行，比問 AI 複雜得多' }
    ]
  },

  // --- A Dimension (Audience) ---
  {
    id: 'A1',
    dim: 'A',
    text: '你的產品最適合誰用？',
    options: [
      { score: 1, text: '很多人都可以用' },
      { score: 2, text: '大概方向如某產業' },
      { score: 3, text: '能具體描述職業場景痛點' }
    ]
  },
  {
    id: 'A2',
    dim: 'A',
    text: '你知道去哪裡接觸潛在用戶嗎？',
    options: [
      { score: 1, text: '不確定' },
      { score: 2, text: '有方向沒實際接觸' },
      { score: 3, text: '很清楚且已接觸過' }
    ]
  },
  {
    id: 'A3',
    dim: 'A',
    text: '你知道目標用戶購買時最在意什麼嗎？',
    options: [
      { score: 1, text: '沒研究過' },
      { score: 2, text: '有猜測沒驗證' },
      { score: 3, text: '知道，從用戶那聽來的' }
    ]
  },
  {
    id: 'A4',
    dim: 'A',
    text: '目標用戶現在願意為此花錢嗎？',
    options: [
      { score: 1, text: '不確定' },
      { score: 2, text: '有人花錢在類似的上' },
      { score: 3, text: '現在就在花錢用替代方案' }
    ]
  },
  {
    id: 'A5',
    dim: 'A',
    text: '只服務一種用戶，選得出來嗎？',
    options: [
      { score: 1, text: '很難選' },
      { score: 2, text: '可以但有點猶豫' },
      { score: 3, text: '很明確' }
    ]
  },

  // --- T Dimension (Traction) ---
  {
    id: 'T1',
    dim: 'T',
    subDim: 'market',
    text: '目前有人在用你的產品嗎？',
    options: [
      { score: 1, text: '構想階段' },
      { score: 2, text: '有人試用/demo' },
      { score: 3, text: '有用戶持續使用' }
    ]
  },
  {
    id: 'T2',
    dim: 'T',
    subDim: 'market',
    text: '有人付過錢嗎？',
    options: [
      { score: 1, text: '沒有' },
      { score: 2, text: '有人願意付還沒實際付' },
      { score: 3, text: '已有付費用戶' }
    ]
  },
  {
    id: 'T3',
    dim: 'T',
    subDim: 'market',
    text: '你明天把產品下架，有人會問為什麼嗎？',
    options: [
      { score: 1, text: '不會有人發現' },
      { score: 2, text: '幾個人會注意' },
      { score: 3, text: '肯定有一群人來問' }
    ]
  },
  {
    id: 'T4',
    dim: 'T',
    subDim: 'survive',
    text: '你想過怎麼賺錢嗎？',
    options: [
      { score: 1, text: '還沒想' },
      { score: 2, text: '有方向沒驗證' },
      { score: 3, text: '有明確商業模式且初步驗證' }
    ]
  },
  {
    id: 'T5',
    dim: 'T',
    subDim: 'survive',
    text: '你有足夠資源撐到產品上線嗎？',
    options: [
      { score: 1, text: '不確定，資源很緊' },
      { score: 2, text: '勉強夠要控制節奏' },
      { score: 3, text: '足夠支撐到上線營運' }
    ]
  },
  {
    id: 'T3-AI',
    dim: 'T',
    subDim: 'market',
    isAIAlternate: true,
    replaces: 'T3',
    text: '免費 AI 做到 80%，用戶會？',
    options: [
      { score: 1, text: '直接跑去用' },
      { score: 2, text: '會猶豫但可能試' },
      { score: 3, text: '不會換，我遠超 80%' }
    ]
  },

  // --- H Dimension (How) ---
  {
    id: 'H1',
    dim: 'H',
    text: '產品做到什麼程度？',
    options: [
      { score: 1, text: '在腦袋裡' },
      { score: 2, text: '有原型/MVP' },
      { score: 3, text: '有可正式使用的產品' }
    ]
  },
  {
    id: 'H2',
    dim: 'H',
    text: '跟人介紹產品，對方會說什麼？',
    options: [
      { score: 1, text: '「市面上有類似的？」' },
      { score: 2, text: '「跟XX比有什麼不同？」' },
      { score: 3, text: '「沒看過，怎麼想到的？」' }
    ]
  },
  {
    id: 'H3',
    dim: 'H',
    text: '有人抄你，多久能做出一樣的？',
    options: [
      { score: 1, text: '幾週能複製' },
      { score: 2, text: '幾個月有門檻' },
      { score: 3, text: '很難，有獨特數據/關係/技術' }
    ]
  },
  {
    id: 'H4',
    dim: 'H',
    text: '到能讓用戶用，最大阻礙是？',
    options: [
      { score: 1, text: '很多問題' },
      { score: 2, text: '有明確卡點知道怎麼解' },
      { score: 3, text: '已在用戶手上/只差最後幾步' }
    ]
  },
  {
    id: 'H5',
    dim: 'H',
    text: '你的團隊能把產品做出來嗎？',
    options: [
      { score: 1, text: '很多不知道怎麼做' },
      { score: 2, text: '核心能做有些需外部' },
      { score: 3, text: '能完成核心功能' }
    ]
  },
  {
    id: 'H3-AI',
    dim: 'H',
    isAIAlternate: true,
    replaces: 'H3',
    text: '拿掉 AI 還剩什麼獨特價值？',
    options: [
      { score: 1, text: '拿掉就沒什麼了' },
      { score: 2, text: '有些獨特但核心靠 AI' },
      { score: 3, text: '有獨特數據/用戶關係/生態系' }
    ]
  }
];

// Calculate score rules
// 每題 1-3 分 · 每維度 5 題 · 原始分 5-15 · 換算 0-100 · 總分 = 四維平均
function calculateScores(answers) {
  const dimScores = { P: 0, A: 0, T: 0, H: 0 };
  const dimMax = { P: 15, A: 15, T: 15, H: 15 };
  
  // sum raw scores
  for (const [qId, score] of Object.entries(answers)) {
    const q = questions.find(q => q.id === qId);
    if (q) {
      dimScores[q.dim] += score;
    }
  }

  // convert to 0-100: (score - 5) / 10 * 100
  const normalizedScores = {
    P: Math.max(0, Math.round(((dimScores.P - 5) / 10) * 100)),
    A: Math.max(0, Math.round(((dimScores.A - 5) / 10) * 100)),
    T: Math.max(0, Math.round(((dimScores.T - 5) / 10) * 100)),
    H: Math.max(0, Math.round(((dimScores.H - 5) / 10) * 100)),
  };

  const totalScore = Math.round((normalizedScores.P + normalizedScores.A + normalizedScores.T + normalizedScores.H) / 4);

  let pathType = '';
  let pathDesc = '';

  if (totalScore <= 39) {
    pathType = '起點探路者';
    pathDesc = '你正站在旅程的起點。地圖還沒畫好，但每一步探索都是找到方向的線索。先別急著跑，確認腳下的路是對的。';
  } else if (totalScore <= 59) {
    pathType = '岔路行者';
    pathDesc = '你已經走了一段路，但眼前出現了幾個岔路口。有些方向看得清，有些還在霧裡。建議停下來看看路標——你的弱項維度就是最需要釐清的方向。';
  } else if (totalScore <= 79) {
    pathType = '山腰攀登者';
    pathDesc = '你已經走過最混亂的山腳路段，方向越來越清楚了。現在你在半山腰，看得見山頂。關鍵是找到屬於你的攀登路線，而不是跟著別人的腳印。';
  } else {
    pathType = '破曉衝刺者';
    pathDesc = '你的旅程已經來到最後一段上坡。四個維度都展現了高度成熟，市場也給了正面回饋。天快亮了——準備好加速衝刺。';
  }

  return {
    raw: dimScores,
    normalized: normalizedScores,
    total: totalScore,
    type: pathType,
    desc: pathDesc
  };
}