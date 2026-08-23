(function (root) {
  const data = root.DagongrenAssessmentData = root.DagongrenAssessmentData || {};
  data.version = '2.0.0';
  data.dimensions = [
    { id: 'drive', name: '卷入驱动', low: '资源保留', high: '主动加码', color: '#E8513D', tipLow: '你更愿意把投入留给确定值得的战役。', tipHigh: '你容易把目标升级成一场必须拿下的战役。' },
    { id: 'rumination', name: '情绪内耗', low: '快速翻篇', high: '反复复盘', color: '#7A58C5', tipLow: '反馈很少在你脑内过夜。', tipHigh: '一句话可能在你脑内自动开十次复盘会。' },
    { id: 'boundary', name: '边界主权', low: '弹性接住', high: '责任清晰', color: '#2457D6', tipLow: '你常先把事情接住，再处理归属。', tipHigh: '你习惯先说清责任、范围和时间。' },
    { id: 'upward', name: '向上表达', low: '观察隐忍', high: '主动澄清', color: '#D38316', tipLow: '你会先判断气氛，再决定要不要开口。', tipHigh: '你擅长把模糊要求翻译成明确预期。' },
    { id: 'disengage', name: '躺平阈值', low: '长期硬扛', high: '及时降载', color: '#29967E', tipLow: '即使回报变低，你也不容易主动停手。', tipHigh: '看见低回报循环时，你会很快止损。' },
    { id: 'execution', name: '执行闭环', low: '灵活游走', high: '结果收口', color: '#1E7D50', tipLow: '你更擅长随机应变，不执着于形式收口。', tipHigh: '事情没有负责人、期限和结论，你很难放下。' },
    { id: 'pleasing', name: '讨好倾向', low: '自我优先', high: '关系兜底', color: '#D75C91', tipLow: '你不太会用透支自己换关系稳定。', tipHigh: '你很容易先照顾所有人的感受，再轮到自己。' },
    { id: 'conflict', name: '冲突策略', low: '缓和回避', high: '正面摊牌', color: '#D9483B', tipLow: '你倾向给局面留缓冲，不急着正面碰撞。', tipHigh: '一旦底线被碰，你更愿意当场说清。' },
    { id: 'politics', name: '利益博弈', low: '事情优先', high: '位置敏感', color: '#62666F', tipLow: '你更关心事情本身，不太经营可见度。', tipHigh: '你会观察资源、功劳和真正的决策链。' },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
