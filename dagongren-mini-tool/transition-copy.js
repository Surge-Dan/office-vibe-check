(function (root) {
  const pools = {
    rumination: [
      ['你开始回放刚才那句话了。', '不用急着给自己补一场庭审，先看清你真正担心的是什么。'],
      ['脑内小剧场已开机。', '下一组场景会继续确认：你是在复盘事实，还是在替别人猜心。'],
    ],
    boundary: [
      ['你的责任边界正在显影。', '有些事情可以帮，但不必顺手把归属也一起背走。'],
      ['这次轮到“先说清楚”出场。', '继续往下看，你会更像接住一切的人，还是会给任务装上边界。'],
    ],
    drive: [
      ['加码冲动被捕捉。', '你不是不能努力，只是每一次努力都在问：这次值得吗？'],
      ['战斗值正在读数。', '再看几个现场，系统会区分你是在抢机会，还是在和疲惫赛跑。'],
    ],
    default: [
      ['你的默认反应露了一角。', '没有标准答案，只有你在压力现场最常调用的那套处理方式。'],
      ['档案继续显影。', '别急着给自己贴标签，后面的问题会把这套求生动作说得更具体。'],
    ],
  };

  function hash(input) {
    return String(input).split('').reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 11);
  }

  function pick(input) {
    const value = input || {};
    const focus = value.focus && pools[value.focus] ? value.focus : 'default';
    const list = pools[focus];
    const context = root.DagongrenContext ? root.DagongrenContext.getLabels(value.context) : { industryShort: '跨行业通用', roleShort: '通用岗位' };
    const item = list[hash(`${value.stage || 'anchor'}|${value.index || 0}|${focus}|${context.industryShort}|${context.roleShort}`) % list.length];
    const detail = context.industryId === 'other'
      ? item[1]
      : `${item[1]} 在${context.industryShort}的${context.roleShort}现场，这个反应尤其容易被看见。`;
    return { headline: item[0], detail };
  }

  root.DagongrenTransitions = { pick };
})(typeof window !== 'undefined' ? window : globalThis);
