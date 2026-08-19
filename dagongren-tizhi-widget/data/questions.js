module.exports = [
  {
    id: 'deadline',
    title: '下班前，领导突然说“今天先出一个版本”，你会：',
    options: [
      { id: 'deadline-a', text: '先确认最小交付范围，今晚把能交的交了。', scores: { 'minimum-master': 3 } },
      { id: 'deadline-b', text: '直接留下来，先把完整版本做出来。', scores: { 'low-key-roll': 3 } },
      { id: 'deadline-c', text: '问清楚是不是真的今天要，不急就明天再说。', scores: { 'reverse-roll': 3 } },
      { id: 'deadline-d', text: '拉上相关同事确认，避免最后只有我负责。', scores: { 'blame-magnet': 3, 'meeting-escape': 1 } },
    ],
  },
  {
    id: 'promise',
    title: '领导说“以后有机会给你更大的舞台”，你的第一反应是：',
    options: [
      { id: 'promise-a', text: '先把手里的事情做出成绩。', scores: { 'low-key-roll': 3 } },
      { id: 'promise-b', text: '记下来，等具体安排。', scores: { 'meeting-escape': 2 } },
      { id: 'promise-c', text: '这句话听过，先看有没有实际动作。', scores: { 'cake-immune': 3 } },
      { id: 'promise-d', text: '直接问清楚机会、时间和评价标准。', scores: { 'reverse-roll': 2, 'cake-immune': 1 } },
    ],
  },
  {
    id: 'meeting',
    title: '一个本来 10 分钟能解决的问题被拉进 1 小时会议：',
    options: [
      { id: 'meeting-a', text: '认真记录，争取最后形成结论。', scores: { 'meeting-escape': 2 } },
      { id: 'meeting-b', text: '全程在线，但开始处理自己的事情。', scores: { 'fish-hermit': 3 } },
      { id: 'meeting-c', text: '直接问：这次会议需要谁做什么？', scores: { 'meeting-escape': 3 } },
      { id: 'meeting-d', text: '会后整理一版结论，防止大家继续讨论。', scores: { 'low-key-roll': 2, 'meeting-escape': 1 } },
    ],
  },
  {
    id: 'boundary',
    title: '同事把一个明显不属于你的任务发给你：',
    options: [
      { id: 'boundary-a', text: '先接下来，事情别耽误。', scores: { 'blame-magnet': 3 } },
      { id: 'boundary-b', text: '问清楚负责人，再决定是否协助。', scores: { 'reverse-roll': 3 } },
      { id: 'boundary-c', text: '表面答应，实际按最低成本完成。', scores: { 'minimum-master': 3 } },
      { id: 'boundary-d', text: '把任务边界和截止时间同步到群里。', scores: { 'blame-magnet': 2, 'meeting-escape': 1 } },
    ],
  },
  {
    id: 'friday-night',
    title: '周五晚上 9 点，工作群突然发来消息：',
    options: [
      { id: 'friday-a', text: '看到就回，避免周末继续被问。', scores: { 'class-flavor': 3 } },
      { id: 'friday-b', text: '假装没看到，周一再说。', scores: { 'fish-hermit': 3 } },
      { id: 'friday-c', text: '判断紧急程度，真的影响上线才处理。', scores: { 'reverse-roll': 2, 'low-key-roll': 1 } },
      { id: 'friday-d', text: '回复“收到，周一上班同步”。', scores: { 'meeting-escape': 2, 'reverse-roll': 1 } },
    ],
  },
  {
    id: 'bug',
    title: '项目上线后发现一个小问题：',
    options: [
      { id: 'bug-a', text: '先修掉再说，别让问题扩大。', scores: { 'low-key-roll': 3 } },
      { id: 'bug-b', text: '先确认影响范围，能接受就不动。', scores: { 'minimum-master': 3 } },
      { id: 'bug-c', text: '找到对应负责人，明确谁来处理。', scores: { 'blame-magnet': 2, 'meeting-escape': 1 } },
      { id: 'bug-d', text: '记录下来，放进下次复盘。', scores: { 'cake-immune': 2, 'low-key-roll': 1 } },
    ],
  },
  {
    id: 'off-work',
    title: '你理想中的下班时间是：',
    options: [
      { id: 'off-work-a', text: '下班就消失，谁也别找我。', scores: { 'fish-hermit': 3 } },
      { id: 'off-work-b', text: '做完事情再走，几点不重要。', scores: { 'low-key-roll': 3 } },
      { id: 'off-work-c', text: '到点走人，剩下的明天处理。', scores: { 'reverse-roll': 3 } },
      { id: 'off-work-d', text: '只要安排合理，偶尔晚一点也行。', scores: { 'class-flavor': 2, 'minimum-master': 1 } },
    ],
  },
];
