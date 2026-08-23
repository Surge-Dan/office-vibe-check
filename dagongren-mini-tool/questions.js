(function (root) {
  const data = root.DagongrenAssessmentData = root.DagongrenAssessmentData || {};

  function option(id, text, weights) { return { id, text, weights }; }
  function question(id, stage, focus, scene, options) { return { id, stage, focus, scene, options }; }
  function opts(prefix, rows) { return rows.map((row, index) => option(`${prefix}-${String.fromCharCode(97 + index)}`, row[0], row[1])); }

  const anchors = [
    question('a-overtime', 'anchor', 'drive', '周五 18:20，领导发来一句“今晚辛苦一下”，但没有说交付范围。你会：', opts('a-overtime', [
      ['先问清今晚必须交什么，再决定投入到几点。', { drive: 1, boundary: 2, upward: 2 }],
      ['默认是最高优先级，留下来先做出完整版本。', { drive: 2, boundary: -2, upward: -1 }],
      ['回复收到，按原排期周一给结果。', { drive: -2, boundary: 2, upward: 1 }],
      ['先做最小版本，同时把剩余风险同步出去。', { drive: 1, boundary: 1, upward: 2 }],
    ])),
    question('a-vague', 'anchor', 'upward', '新项目会上，领导只说“你先把这事盘起来”，散会后没有目标、资源和截止时间。你会：', opts('a-vague', [
      ['当天发一页目标、范围和待确认项，请领导拍板。', { upward: 2, execution: 2, politics: 1 }],
      ['先自己做，等有阶段成果再向上汇报。', { upward: -1, execution: 2, politics: -1 }],
      ['观察谁最在意这件事，先找真正能给资源的人。', { upward: 1, execution: -1, politics: 2 }],
      ['在群里问一句“具体要做到什么程度”。', { upward: 2, execution: 1, politics: -1 }],
    ])),
    question('a-dump', 'anchor', 'boundary', '同事私聊：“这个你比较熟，顺手帮我做了吧。”任务明显不在你的职责里。你会：', opts('a-dump', [
      ['先接下来，别因为边界影响同事关系。', { boundary: -2, pleasing: 2, conflict: -1 }],
      ['说明能帮到哪一步，剩下部分仍由对方负责。', { boundary: 2, pleasing: 1, conflict: 1 }],
      ['直接说不属于我，请找对应负责人。', { boundary: 2, pleasing: -2, conflict: 2 }],
      ['先问截止时间，紧急就做，不急再谈归属。', { boundary: -1, pleasing: 1, conflict: -1 }],
    ])),
    question('a-critique', 'anchor', 'rumination', '领导在十几人的群里回复你的方案：“这个思路不太行。”没有补充原因。你会：', opts('a-critique', [
      ['先私聊确认问题，拿到标准后再改。', { rumination: 1, conflict: 1, politics: 1 }],
      ['表面回复收到，晚上反复想是不是能力不够。', { rumination: 2, conflict: -2, politics: 1 }],
      ['群里追问具体哪一点不行，避免模糊返工。', { rumination: -1, conflict: 2, politics: 1 }],
      ['先记下，不把一句模糊评价当成完整结论。', { rumination: -2, conflict: -1, politics: -1 }],
    ])),
    question('a-promise', 'anchor', 'politics', '绩效沟通时，领导说“继续保持，明年有机会给你更大空间”。你第一反应是：', opts('a-promise', [
      ['先把更多活接下来，用结果证明自己。', { drive: 2, politics: -1, pleasing: 2 }],
      ['追问机会对应什么岗位、指标和时间点。', { drive: 1, politics: 2, pleasing: -1 }],
      ['听听就好，资源没变化前不额外透支。', { drive: -2, politics: 1, pleasing: -1 }],
      ['观察其他人拿到机会前做了什么，再调整策略。', { drive: 1, politics: 2, pleasing: 1 }],
    ])),
    question('a-incident', 'anchor', 'execution', '项目刚上线就出现故障，群里同时有人催进度、问责任、提新方案。你会先：', opts('a-incident', [
      ['直接修问题，恢复后再补过程。', { execution: 2, drive: 2, rumination: -1 }],
      ['先确认影响范围、负责人和每 30 分钟同步节点。', { execution: 2, drive: 1, rumination: 1 }],
      ['等负责人明确安排，避免多人同时乱改。', { execution: -1, drive: -1, rumination: 1 }],
      ['担心自己之前哪里漏了，先翻全部记录。', { execution: -1, drive: 1, rumination: 2 }],
    ])),
    question('a-meeting', 'anchor', 'conflict', '一个十分钟能说清的问题，已经开到第 50 分钟，大家还在重复观点。你会：', opts('a-meeting', [
      ['直接总结分歧，请决策人二选一。', { execution: 2, upward: 2, conflict: 2 }],
      ['继续听，等主持人自然收口。', { execution: -1, upward: -1, conflict: -2 }],
      ['边听边做自己的事，会后再看结论。', { execution: -1, upward: -1, conflict: -1 }],
      ['在聊天框整理负责人和下一步，邀请大家确认。', { execution: 2, upward: 1, conflict: 1 }],
    ])),
    question('a-help', 'anchor', 'pleasing', '你已经排满，同事说自己的任务今晚不做完会被领导点名，希望你救一下。你会：', opts('a-help', [
      ['先救对方，自己的事情晚点再说。', { pleasing: 2, boundary: -2, rumination: 1 }],
      ['给一个模板和十分钟建议，不接完整任务。', { pleasing: 1, boundary: 2, rumination: -1 }],
      ['明确拒绝，我的排期也需要被尊重。', { pleasing: -2, boundary: 2, rumination: -1 }],
      ['帮一半，但担心拒绝得不够委婉。', { pleasing: 2, boundary: -1, rumination: 2 }],
    ])),
    question('a-credit', 'anchor', 'politics', '复盘会上，同事把你做的关键分析说成“我们一起想出来的”。你会：', opts('a-credit', [
      ['当场补充自己的分析过程和产出链接。', { politics: 2, conflict: 2, upward: 1 }],
      ['会后私下提醒对方，下次说清分工。', { politics: 1, conflict: -1, upward: 1 }],
      ['不争，真正做事的人迟早会被看到。', { politics: -2, conflict: -2, upward: -1 }],
      ['以后每次阶段成果都主动同步给关键人。', { politics: 2, conflict: -1, upward: 2 }],
    ])),
    question('a-low-return', 'anchor', 'disengage', '一个项目反复改方向，三个月没有结果，资源还在持续减少。你会：', opts('a-low-return', [
      ['继续扛，至少把自己负责的部分做到最好。', { disengage: -2, drive: 2, execution: 2 }],
      ['提出止损条件，达不到就降级或暂停。', { disengage: 2, drive: 1, execution: 2 }],
      ['降低投入，只维持基本运转。', { disengage: 2, drive: -2, execution: -1 }],
      ['一边做一边找新机会，等组织给最终判断。', { disengage: 1, drive: -1, execution: 1 }],
    ])),
    question('a-afterhours', 'anchor', 'boundary', '周日晚上，工作群 @你问一个周一上午再处理也来得及的问题。你会：', opts('a-afterhours', [
      ['马上回复，免得别人觉得我不配合。', { boundary: -2, disengage: -2, pleasing: 2 }],
      ['回复“已看到，周一上班处理”。', { boundary: 2, disengage: 1, pleasing: 1 }],
      ['不回，周一按正常工作时间处理。', { boundary: 2, disengage: 2, pleasing: -2 }],
      ['看提问的人是谁，再决定要不要回。', { boundary: -1, disengage: 1, pleasing: 1 }],
    ])),
    question('a-career', 'anchor', 'disengage', '你拿到一个薪资更高、但岗位边界模糊的新机会，同时现工作稳定却越来越消耗。你会：', opts('a-career', [
      ['先去新机会，变化本身比继续消耗更重要。', { disengage: 2, rumination: -1, politics: 1 }],
      ['列清回报、风险和退出条件后再选。', { disengage: 1, rumination: 1, politics: 2 }],
      ['留在熟悉环境，至少风险可控。', { disengage: -2, rumination: 2, politics: -1 }],
      ['先用新 offer 和现公司谈资源与空间。', { disengage: 1, rumination: -1, politics: 2 }],
    ])),
  ];

  const branchScenes = {
    drive: [
      ['b-drive-1', '季度目标已经完成 90%，领导临时加了一个“能做更好”的冲刺项。', [
        ['顺手拿下，既然做了就做到最好。', { drive: 2, execution: 1 }], ['先问它是否影响绩效权重。', { drive: 1, politics: 2 }], ['保持原目标，不主动抬高基线。', { drive: -2, boundary: 2 }], ['做一个轻量验证，数据好再继续。', { drive: 1, disengage: 1 }],
      ]],
      ['b-drive-2', '同组的人连续加班发战报，你的进度正常但显得不够热闹。', [
        ['也发战报，让投入被看见。', { drive: 2, politics: 2 }], ['只同步结果，不参与时长竞赛。', { drive: -1, execution: 2 }], ['开始加码，不能看起来落后。', { drive: 2, rumination: 1 }], ['确认评价标准，没关系就按原节奏。', { drive: -2, upward: 2 }],
      ]],
      ['b-drive-3', '有一个没人负责但很容易出彩的跨部门机会。', [
        ['主动认领，先把位置占住。', { drive: 2, politics: 2 }], ['先确认资源和决策权再接。', { drive: 1, boundary: 2 }], ['不接，额外曝光也意味着额外风险。', { drive: -2, rumination: 1 }], ['只贡献关键方案，不做总负责人。', { drive: -1, execution: 1 }],
      ]],
      ['b-drive-4', '一个方案已经够用，但你看到还有三处可以继续打磨。', [
        ['全部改完再交，不能留遗憾。', { drive: 2, execution: 1 }], ['只改影响结果的那一处。', { drive: -1, execution: 2 }], ['按时交付，细节放到下一版。', { drive: -2, disengage: 1 }], ['让需求方选“准时”还是“精致”。', { drive: 1, upward: 2 }],
      ]],
    ],
    rumination: [
      ['b-rumination-1', '你发完重要汇报，领导两个小时没有回复。', [
        ['反复检查是不是哪句话写错了。', { rumination: 2, pleasing: 1 }], ['正常做下一件事，等对方有空。', { rumination: -2, execution: 1 }], ['补发一句重点，降低理解成本。', { rumination: 1, upward: 2 }], ['找同事确认领导是不是不满意。', { rumination: 2, politics: 1 }],
      ]],
      ['b-rumination-2', '绩效结果比预期低半档，但反馈很笼统。', [
        ['先怀疑自己是不是一直判断错了。', { rumination: 2, drive: 1 }], ['约一次具体复盘，只谈事实和标准。', { rumination: 1, upward: 2 }], ['接受结果，不让一次评级定义自己。', { rumination: -2, disengage: 1 }], ['观察同档同事做了什么，重新判断规则。', { rumination: 1, politics: 2 }],
      ]],
      ['b-rumination-3', '同事路过时说：“你最近看起来挺闲的。”', [
        ['笑笑就过，不把随口一句当评价。', { rumination: -2, conflict: -1 }], ['解释最近做了哪些工作。', { rumination: 1, pleasing: 1 }], ['反问对方为什么这么说。', { rumination: 1, conflict: 2 }], ['之后几天刻意让自己看起来更忙。', { rumination: 2, politics: 1 }],
      ]],
      ['b-rumination-4', '下班后你突然想起白天会议里一句没接好的话。', [
        ['脑内重演，想象更好的回答。', { rumination: 2, drive: 1 }], ['记一条下次话术，然后结束复盘。', { rumination: 1, execution: 2 }], ['告诉自己会议已结束，不再补考。', { rumination: -2, disengage: 1 }], ['立刻发消息补充，免得留下误解。', { rumination: 2, upward: 1 }],
      ]],
    ],
    boundary: [
      ['b-boundary-1', '领导让你“顺便”接手离职同事的工作，但没说原任务怎么调整。', [
        ['先接住，之后再想办法。', { boundary: -2, pleasing: 2 }], ['请领导明确新旧任务优先级。', { boundary: 2, upward: 2 }], ['只接紧急部分，其余等补人。', { boundary: 1, execution: 1 }], ['直接说明容量已满，无法接手。', { boundary: 2, conflict: 2 }],
      ]],
      ['b-boundary-2', '合作方连续第三次把自己的延期变成你的加急。', [
        ['这次先救，项目不能受影响。', { boundary: -2, execution: 2 }], ['要求同步延期原因和新的责任节点。', { boundary: 2, conflict: 1 }], ['把风险抄送双方负责人。', { boundary: 2, politics: 2 }], ['降低交付标准，先把版本顶上去。', { boundary: -1, disengage: 1 }],
      ]],
      ['b-boundary-3', '同事习惯在午休时拉你讨论工作。', [
        ['边吃边聊，大家都方便。', { boundary: -2, pleasing: 1 }], ['约到下午，午休不处理工作。', { boundary: 2, pleasing: -1 }], ['只回答最急的一点。', { boundary: 1, execution: 1 }], ['戴上耳机假装没听见。', { boundary: 2, conflict: -1 }],
      ]],
      ['b-boundary-4', '有人把你拉进一个“先支持一下”的长期群，却没有明确职责。', [
        ['先留着，随时有人需要就响应。', { boundary: -2, pleasing: 2 }], ['问清自己的角色和退出条件。', { boundary: 2, upward: 2 }], ['静音观察，只在被点名时出现。', { boundary: 1, politics: 1 }], ['明确没有容量，直接退群。', { boundary: 2, conflict: 2 }],
      ]],
    ],
    upward: [
      ['b-upward-1', '领导提出一个你判断成本很高、收益很低的需求。', [
        ['先做，执行比争论重要。', { upward: -2, pleasing: 1 }], ['用成本和收益给出替代方案。', { upward: 2, execution: 2 }], ['私下确认是不是还有没说的目标。', { upward: 1, politics: 2 }], ['先拖一拖，等需求自然消失。', { upward: -2, disengage: 2 }],
      ]],
      ['b-upward-2', '你的项目缺一个关键资源，领导一直回复“再协调”。', [
        ['自己想办法补位，不再催。', { upward: -2, drive: 2 }], ['给出无资源时的延期影响和最后决策日。', { upward: 2, execution: 2 }], ['找资源方的领导直接谈。', { upward: 2, politics: 2 }], ['降低目标，按现有资源交付。', { upward: 1, disengage: 1 }],
      ]],
      ['b-upward-3', '一对一沟通时，领导问“最近有没有什么困难”。', [
        ['说都挺好，不想显得能力不足。', { upward: -2, pleasing: 2 }], ['只说一个最影响结果的问题和需要的支持。', { upward: 2, execution: 2 }], ['先问领导当前最关心什么。', { upward: 1, politics: 2 }], ['把积累的不满一次性全说出来。', { upward: 2, conflict: 2 }],
      ]],
      ['b-upward-4', '领导临时改变方向，但团队已经投入两周。', [
        ['马上切换，不讨论沉没成本。', { upward: -1, execution: 1 }], ['确认变化原因、保留资产和新验收口径。', { upward: 2, execution: 2 }], ['先表达反对，要求给团队解释。', { upward: 2, conflict: 2 }], ['照做，但保留原方案以防再改。', { upward: -1, politics: 2 }],
      ]],
    ],
    disengage: [
      ['b-disengage-1', '你连续三周高负荷，新的“紧急任务”又来了。', [
        ['继续扛，忙完这一阵就好。', { disengage: -2, drive: 2 }], ['要求替换掉一个现有任务。', { disengage: 1, boundary: 2 }], ['只保底最关键结果，其余降级。', { disengage: 2, execution: 1 }], ['先请一天假，再决定怎么接。', { disengage: 2, rumination: -1 }],
      ]],
      ['b-disengage-2', '一个重复性工作每周占半天，却没人愿意改流程。', [
        ['照常做，稳定比折腾重要。', { disengage: -2, execution: 1 }], ['做一次轻量自动化或模板化。', { disengage: 1, execution: 2 }], ['把成本量化后申请停止。', { disengage: 2, upward: 2 }], ['做到最低可接受标准。', { disengage: 2, drive: -1 }],
      ]],
      ['b-disengage-3', '你发现现在的岗位半年内很难再学到新东西。', [
        ['继续稳定做，成长不是唯一目标。', { disengage: -1, rumination: -1 }], ['主动争取新的职责或轮岗。', { disengage: 1, drive: 2 }], ['开始准备外部机会。', { disengage: 2, politics: 1 }], ['先观察半年，避免冲动决定。', { disengage: -2, rumination: 2 }],
      ]],
      ['b-disengage-4', '一个项目的关键决策反复被推翻，你已经不再相信它会成功。', [
        ['仍按最高标准做完自己的部分。', { disengage: -2, drive: 2 }], ['明确提出暂停或重设目标。', { disengage: 2, conflict: 2 }], ['只做可复用资产，不再额外投入。', { disengage: 1, execution: 1 }], ['表面推进，实际把精力转到别处。', { disengage: 2, politics: 1 }],
      ]],
    ],
    execution: [
      ['b-execution-1', '跨部门任务开完会后，没有人记录负责人和时间。', [
        ['等发起人整理完再说。', { execution: -2, pleasing: 1 }], ['当场发三行纪要请大家确认。', { execution: 2, upward: 1 }], ['只记录自己负责的部分。', { execution: 1, boundary: 1 }], ['私聊关键人推动，不在大群留痕。', { execution: 1, politics: 2 }],
      ]],
      ['b-execution-2', '截止日前发现需求仍有一个关键歧义。', [
        ['按自己的理解做完，先保证准时。', { execution: 1, drive: 1 }], ['立刻确认口径，必要时调整交付时间。', { execution: 2, upward: 2 }], ['把两个版本都准备好。', { execution: 2, drive: 2 }], ['先停下，等需求方主动回复。', { execution: -2, boundary: 1 }],
      ]],
      ['b-execution-3', '项目已经做到 80%，但关键合作人突然离职。', [
        ['先梳理缺口和接替清单。', { execution: 2, politics: 1 }], ['自己把空缺也补上，先完成再说。', { execution: 2, boundary: -2 }], ['申请延期，等新负责人到位。', { execution: -1, upward: 2 }], ['保住核心目标，砍掉非必要部分。', { execution: 2, disengage: 2 }],
      ]],
      ['b-execution-4', '一个任务没有硬截止时间，但会持续影响后续工作。', [
        ['给自己设截止时间并同步相关人。', { execution: 2, upward: 1 }], ['有空再做，先处理会被催的事。', { execution: -2, politics: 1 }], ['拆成最小一步，今天先启动。', { execution: 2, drive: 1 }], ['等影响真正出现再处理。', { execution: -2, disengage: 1 }],
      ]],
    ],
    pleasing: [
      ['b-pleasing-1', '团建投票里，大家都选了你不喜欢的活动。', [
        ['跟着去，不想扫兴。', { pleasing: 2, boundary: -1 }], ['说明不参加，但祝大家玩得开心。', { pleasing: -1, boundary: 2 }], ['提出一个折中选项。', { pleasing: 1, conflict: 1 }], ['临时说有事，避免直接拒绝。', { pleasing: 1, conflict: -2 }],
      ]],
      ['b-pleasing-2', '同事请你帮忙润色汇报，已经是这个月第四次。', [
        ['继续帮，关系维护也重要。', { pleasing: 2, boundary: -2 }], ['给模板，让对方自己改。', { pleasing: 1, boundary: 2 }], ['说明这次没时间。', { pleasing: -2, conflict: 1 }], ['帮完后希望对方以后也能回报你。', { pleasing: 2, politics: 1 }],
      ]],
      ['b-pleasing-3', '你不同意团队共识，但所有人都已经点头。', [
        ['也点头，没必要让气氛僵住。', { pleasing: 2, conflict: -2 }], ['提出一个具体风险，不否定所有人。', { pleasing: 1, conflict: 1 }], ['明确反对，结果比气氛重要。', { pleasing: -2, conflict: 2 }], ['会后单独找决策人说。', { pleasing: 1, politics: 2 }],
      ]],
      ['b-pleasing-4', '你拒绝了一个请求，对方只回了“好吧”。', [
        ['马上补充解释，怕对方误会。', { pleasing: 2, rumination: 2 }], ['确认对方收到就结束。', { pleasing: -2, rumination: -1 }], ['提出一个更小的替代帮助。', { pleasing: 1, boundary: 1 }], ['以后主动对对方更热情一点。', { pleasing: 2, politics: 1 }],
      ]],
    ],
    conflict: [
      ['b-conflict-1', '同事在会上连续打断你，并替你总结了一个错误结论。', [
        ['当场打断，重新说清原意。', { conflict: 2, upward: 1 }], ['等对方说完再温和纠正。', { conflict: 1, pleasing: 1 }], ['会后私聊，不在公开场合冲突。', { conflict: -1, politics: 1 }], ['算了，懂的人自然懂。', { conflict: -2, rumination: 1 }],
      ]],
      ['b-conflict-2', '合作方拒绝承认延期责任，反而说是你需求变动。', [
        ['拿出时间线逐项对齐。', { conflict: 2, politics: 2 }], ['先解决延期，再单独复盘责任。', { conflict: 1, execution: 2 }], ['请双方领导判断。', { conflict: 2, upward: 1 }], ['不争责任，避免合作彻底破裂。', { conflict: -2, pleasing: 2 }],
      ]],
      ['b-conflict-3', '同事用玩笑方式反复评价你的能力。', [
        ['也用一句玩笑顶回去。', { conflict: 1, politics: 1 }], ['私下明确说这类玩笑不舒服。', { conflict: 2, boundary: 2 }], ['减少接触，不正面谈。', { conflict: -2, disengage: 1 }], ['怀疑是不是自己太敏感。', { conflict: -2, rumination: 2 }],
      ]],
      ['b-conflict-4', '两个部门都不愿意承担一个关键接口。', [
        ['把决策升级给共同负责人。', { conflict: 2, upward: 2 }], ['自己先接，项目不能停。', { conflict: -1, boundary: -2 }], ['组织一次只讨论责任边界的短会。', { conflict: 1, execution: 2 }], ['等问题暴露后再由组织处理。', { conflict: -2, politics: 1 }],
      ]],
    ],
    politics: [
      ['b-politics-1', '你的成果被用于高层汇报，但你没有被邀请参加。', [
        ['成果被用就好，不在意露脸。', { politics: -2, drive: -1 }], ['请直属领导在材料里注明贡献。', { politics: 1, upward: 2 }], ['主动补充一页关键结论给汇报人。', { politics: 2, execution: 1 }], ['下次从一开始就进入汇报链路。', { politics: 2, boundary: 1 }],
      ]],
      ['b-politics-2', '组织调整前，多个领导突然频繁问你项目细节。', [
        ['如实回答，不猜背后原因。', { politics: -2, rumination: -1 }], ['回答同时观察谁最关心哪些指标。', { politics: 2, rumination: 1 }], ['整理自己的成果和资源关系。', { politics: 2, execution: 2 }], ['少说少错，等调整正式公布。', { politics: 1, conflict: -1 }],
      ]],
      ['b-politics-3', '一个重要项目需要两位领导共同支持，但他们意见相反。', [
        ['按直属领导意见做。', { politics: -1, pleasing: 1 }], ['把分歧写成两个方案，请他们共同决策。', { politics: 2, upward: 2 }], ['先做双方都不反对的部分。', { politics: 1, execution: 1 }], ['等他们达成一致，不提前下注。', { politics: 2, disengage: 1 }],
      ]],
      ['b-politics-4', '晋升名额有限，你和同事的业务结果接近。', [
        ['继续做事，结果会说话。', { politics: -2, drive: 1 }], ['主动汇报影响范围和不可替代贡献。', { politics: 2, upward: 2 }], ['争取关键人的公开认可。', { politics: 2, pleasing: 1 }], ['评估机会不大就把精力转向外部。', { politics: 1, disengage: 2 }],
      ]],
    ],
  };

  const branches = Object.keys(branchScenes).flatMap((focus) => branchScenes[focus].map((row) => (
    question(row[0], 'branch', focus, row[1], opts(row[0], row[2]))
  )));

  const calibrations = [
    question('c-boundary-pleasing', 'calibration', 'boundary', '再确认一个瞬间：同事临下班求你救急，你知道拒绝后关系可能会冷一点。你更可能：', opts('c-boundary-pleasing', [
      ['仍然接住，关系成本比加班更难处理。', { boundary: -2, pleasing: 2 }], ['只提供关键建议，不接完整交付。', { boundary: 1, pleasing: 1 }], ['明确拒绝，也接受对方暂时不高兴。', { boundary: 2, pleasing: -2 }], ['要求双方领导重新排优先级。', { boundary: 2, politics: 1 }],
    ])),
    question('c-rumination-conflict', 'calibration', 'rumination', '有人公开误解了你的意思，而会议只剩一分钟。你会：', opts('c-rumination-conflict', [
      ['立刻纠正，哪怕现场有点僵。', { rumination: -1, conflict: 2 }], ['先记下，会后私聊澄清。', { rumination: 1, conflict: -1 }], ['让它过去，不给一句话太多重量。', { rumination: -2, conflict: -1 }], ['会后反复想当时应该怎么说。', { rumination: 2, conflict: -2 }],
    ])),
    question('c-drive-disengage', 'calibration', 'drive', '一个任务既能让你出彩，也大概率会持续透支。你会：', opts('c-drive-disengage', [
      ['先拿下，机会窗口不会等人。', { drive: 2, disengage: -2 }], ['设投入上限，达到就停止加码。', { drive: 1, disengage: 2 }], ['不接，长期节奏比一次曝光重要。', { drive: -2, disengage: 2 }], ['先试一周，再用结果决定。', { drive: 1, disengage: 1 }],
    ])),
    question('c-upward-politics', 'calibration', 'upward', '你发现领导真正关心的指标和公开说法不完全一致。你会：', opts('c-upward-politics', [
      ['仍按公开目标执行。', { upward: -1, politics: -2 }], ['私下确认真实优先级。', { upward: 2, politics: 2 }], ['两套指标都兼顾，避免站错。', { upward: 1, politics: 2 }], ['要求在团队会上把标准说清。', { upward: 2, politics: 1 }],
    ])),
  ];

  const hidden = [
    question('h-offhours', 'hidden', 'boundary', '终极加班彩蛋：凌晨 00:17，群里出现一句“有人方便看一下吗”。你的真实动作是：', opts('h-offhours', [
      ['秒回“我来”，先把火灭了。', { drive: 2, pleasing: 2, boundary: -2 }], ['看见但不回，明早像什么都没发生。', { drive: -1, pleasing: -2, boundary: 2 }], ['先判断是否真事故，再决定是否出现。', { execution: 2, boundary: 1, politics: 1 }], ['只发一个关键排查方向，然后继续睡。', { execution: 1, disengage: 2, boundary: 1 }],
    ])),
    question('h-mask', 'hidden', 'politics', '终极会议彩蛋：领导问“大家还有意见吗”，而你心里有完整反对方案。你会：', opts('h-mask', [
      ['嘴上说没有，转头按自己的安全方案做。', { politics: 2, conflict: -2, execution: 1 }], ['当场把反对意见压缩成一句风险。', { politics: 1, conflict: 2, upward: 2 }], ['保持安静，但把方案和证据存档。', { politics: 2, conflict: -1, boundary: 1 }], ['会后找真正能改决定的人。', { politics: 2, conflict: 1, upward: 1 }],
    ])),
  ];

  data.questions = anchors.concat(branches, calibrations, hidden);
})(typeof window !== 'undefined' ? window : globalThis);
