(function (root) {
  const data = root.DagongrenAssessmentData = root.DagongrenAssessmentData || {};
  const dimensions = {
    drive: 'drive', rumination: 'rumination', boundary: 'boundary', upward: 'upward',
    disengage: 'disengage', execution: 'execution', pleasing: 'pleasing', conflict: 'conflict', politics: 'politics',
  };

  function option(id, text, weights) { return { id, text, weights }; }
  function question(id, focus, scene, rows, extra) {
    return { id, stage: 'context', focus, scene, source: extra.source, roleFamily: extra.roleFamily, industryId: extra.industryId,
      options: rows.map((row, index) => option(`${id}-${String.fromCharCode(97 + index)}`, row[0], row[1])) };
  }
  const row = (text, weights) => [text, weights];

  const rolePools = {
    management: [
      ['临时任务插进来，原本排好的工作只能往后挪。你通常会：', 'drive', [row('先重新排优先级，把取舍和影响说清楚。', { drive: 1, execution: 2, upward: 2 }), row('先全部答应，能不能做完晚点再说。', { drive: 2, boundary: -2, pleasing: 1 }), row('把最麻烦的部分分出去，自己盯关键节点。', { execution: 2, politics: 2, pleasing: -1 }), row('先做最稳妥的一件，其他看情况再处理。', { disengage: 1, drive: -1, boundary: 1 })]],
      ['团队出了问题，大家都在等一个人背锅。你更倾向于：', 'politics', [row('先还原事实和责任链，再定补救动作。', { politics: 2, conflict: 1, execution: 2 }), row('先把锅接住，别让团队继续消耗。', { pleasing: 2, boundary: -1, conflict: -1 }), row('让最接近现场的人说明情况，自己不抢话。', { boundary: 1, politics: 1, disengage: 1 }), row('先观察谁掌握资源，再决定公开说到哪一步。', { politics: 2, rumination: 1, upward: -1 })]],
      ['下属或同事来找你抱怨一个重复出现的问题，你会：', 'pleasing', [row('先共情，再把问题拆成能执行的下一步。', { pleasing: 1, execution: 2, conflict: 1 }), row('马上给结论，别把时间耗在情绪上。', { boundary: 2, conflict: 1, pleasing: -1 }), row('先听完，之后再私下找相关人沟通。', { rumination: 1, pleasing: 1, conflict: -1 }), row('让对方自己想办法，成年人要为结果负责。', { disengage: 2, boundary: 2, pleasing: -2 })]],
      ['你发现自己承担了越来越多协调工作，却没人明确认可。你会：', 'boundary', [row('整理贡献和工作量，找合适时机谈清边界。', { boundary: 2, upward: 2, execution: 1 }), row('先继续做，稳定住局面更重要。', { drive: 1, pleasing: 2, boundary: -2 }), row('只保留最关键的协调，其余让责任人自己对接。', { boundary: 2, disengage: 1, conflict: 1 }), row('默默记录，等绩效或调岗时再一次性提出。', { rumination: 1, politics: 2, upward: -1 })]],
    ],
    technical: [
      ['事情做到一半，标准突然变了，而且没有人说明为什么。你会：', 'execution', [row('先确认变化原因和验收标准，再调整方案。', { execution: 2, upward: 2, rumination: 1 }), row('先按新标准改，别让沟通挡住进度。', { drive: 2, boundary: -1, execution: 1 }), row('保留旧版本和变更记录，避免之后说不清。', { politics: 2, boundary: 1, rumination: 1 }), row('先暂停，等对方把话说完整再动手。', { boundary: 1, disengage: 1, drive: -1 })]],
      ['一个难题卡住了很久，暂时也没有人能直接帮你。你会：', 'rumination', [row('把问题拆小，先验证一个最可能的方向。', { execution: 2, drive: 1, rumination: -1 }), row('继续独自琢磨，直到找到完整答案。', { rumination: 2, drive: 1, boundary: -1 }), row('尽快找人讨论，带着已有尝试去问。', { upward: 1, conflict: 1, execution: 2 }), row('先放一放，去做更确定的事情。', { disengage: 2, drive: -1, rumination: -1 })]],
      ['别人指出你的方案有问题，但没有给替代方案。你第一反应是：', 'conflict', [row('追问具体问题和判断标准，再决定是否修改。', { conflict: 1, upward: 2, execution: 1 }), row('先说收到，回头自己反复复盘。', { rumination: 2, pleasing: 1, conflict: -1 }), row('直接说明当前约束，请对方一起选方案。', { boundary: 2, conflict: 2, upward: 1 }), row('先按自己的判断完成，结果说话。', { drive: 1, boundary: 1, disengage: 1 })]],
      ['你需要向不熟悉细节的人解释复杂工作时，通常会：', 'upward', [row('先讲结论、风险和需要对方决定的事项。', { upward: 2, politics: 1, execution: 2 }), row('把全过程都讲一遍，确保没人误解。', { rumination: 1, pleasing: 1, upward: 1 }), row('只发结论，细节等对方追问。', { boundary: 1, disengage: 1, upward: -1 }), row('找更会表达的人代为说明，自己负责把事情做好。', { execution: 1, pleasing: 1, boundary: -1 })]],
    ],
    professional: [
      ['遇到值班、轮班或高强度工作连着来，你会：', 'drive', [row('先确认当班底线和交接要求，再安排体力。', { boundary: 2, execution: 2, drive: 1 }), row('只要现场需要，就先顶上再说。', { pleasing: 2, drive: 2, boundary: -2 }), row('按流程完成必须项，额外要求另行沟通。', { boundary: 2, disengage: 1, drive: -1 }), row('先把最危险或最关键的环节处理掉。', { execution: 2, conflict: 1, drive: 1 })]],
      ['一项工作风险很高，出错后影响的不只是你个人。你会：', 'rumination', [row('提前列风险清单，并让关键人确认。', { execution: 2, upward: 2, rumination: 1 }), row('反复检查，直到自己觉得万无一失。', { rumination: 2, drive: 1, boundary: -1 }), row('严格按流程做，流程之外不主动扩张。', { boundary: 2, disengage: 1, execution: 1 }), row('先做一小步试验，用结果确认方向。', { execution: 2, conflict: 1, rumination: -1 })]],
      ['交接给你的人只留下几句模糊说明，第二天就联系不上了。你会：', 'boundary', [row('把缺口列出来，逐项向负责人确认。', { upward: 2, execution: 2, boundary: 1 }), row('先自己补齐，别让现场停下来。', { drive: 2, pleasing: 1, boundary: -1 }), row('严格按现有记录做，不替前任猜测。', { boundary: 2, disengage: 1, conflict: 1 }), row('先找有经验的同事问问，边做边修正。', { pleasing: 1, execution: 1, rumination: -1 })]],
      ['别人把焦虑和情绪带到工作现场，你往往会：', 'pleasing', [row('先把对方安抚下来，再回到事实和流程。', { pleasing: 1, execution: 2, conflict: 1 }), row('很容易被带着紧张，回家还在想这件事。', { rumination: 2, pleasing: 1, boundary: -1 }), row('说明自己能提供的帮助，剩余情绪不替对方承担。', { boundary: 2, pleasing: -1, conflict: 1 }), row('先离开现场，等大家冷静后再处理。', { disengage: 2, conflict: -1, boundary: 1 })]],
    ],
    operations: [
      ['一天里不断有人插入新任务，你通常会：', 'execution', [row('把任务按紧急程度排队，逐个确认截止点。', { execution: 2, boundary: 1, upward: 1 }), row('谁先来就先做谁，避免得罪人。', { pleasing: 2, boundary: -2, drive: 1 }), row('先做最容易闭环的事项，复杂的留到后面。', { execution: 1, disengage: 1, drive: -1 }), row('直接说明当前排期，请对方选择优先级。', { boundary: 2, conflict: 1, upward: 2 })]],
      ['需要同时协调几个人，但每个人都说自己很忙。你会：', 'politics', [row('明确分工、节点和不配合的后果。', { execution: 2, conflict: 1, politics: 1 }), row('自己先补位，把事情推动起来。', { drive: 2, pleasing: 1, boundary: -1 }), row('找共同负责人拍板，避免自己夹在中间。', { upward: 2, politics: 1, disengage: 1 }), row('先观察谁最有影响力，再从那个人切入。', { politics: 2, rumination: 1, conflict: -1 })]],
      ['重复性工作堆在面前，短期内看不到明显成果。你会：', 'disengage', [row('找规律做模板，让下一次更快完成。', { execution: 2, drive: 1, politics: 1 }), row('一边做一边吐槽，但还是加速交掉。', { drive: 1, rumination: 1, pleasing: 1 }), row('只完成标准要求，不额外优化。', { boundary: 1, disengage: 2, drive: -1 }), row('先摸鱼缓冲一会儿，恢复状态再继续。', { disengage: 2, rumination: -1, boundary: 1 })]],
      ['别人把“顺手帮忙”变成了固定分工，你会：', 'boundary', [row('把新增工作量和原职责摆出来重新分配。', { boundary: 2, conflict: 1, upward: 1 }), row('先做着，等忙不过来再说。', { pleasing: 2, boundary: -2, drive: 1 }), row('以后只帮一次，明确下一次由谁负责。', { boundary: 2, execution: 1, conflict: 1 }), row('让对方先发正式需求，没记录就不接。', { boundary: 1, politics: 2, disengage: 1 })]],
    ],
    sales: [
      ['客户明确拒绝了你的方案，甚至说“别再联系了”。你会：', 'conflict', [row('记录拒绝原因，判断是时机、预算还是方案问题。', { execution: 2, rumination: 1, conflict: 1 }), row('继续想办法说服，不能轻易放弃。', { drive: 2, pleasing: 1, conflict: 1 }), row('礼貌收尾，给自己留出下一次联系的空间。', { boundary: 2, disengage: 1, conflict: -1 }), row('表面没事，心里会反复回放这次拒绝。', { rumination: 2, pleasing: -1, conflict: -1 })]],
      ['目标压在月底，线索却迟迟没有转化。你会：', 'drive', [row('拆出可控动作，优先追最接近成交的客户。', { execution: 2, drive: 1, politics: 1 }), row('把所有客户都再联系一遍，先把量做起来。', { drive: 2, pleasing: 1, boundary: -1 }), row('复盘漏斗，和负责人讨论目标是否需要调整。', { upward: 2, execution: 1, boundary: 1 }), row('先降低预期，完成底线动作就收工。', { disengage: 2, drive: -1, boundary: 1 })]],
      ['客户临时加了很多需求，却不愿意增加预算或时间。你会：', 'boundary', [row('把新增内容、成本和交付风险写出来，请对方取舍。', { boundary: 2, upward: 2, execution: 1 }), row('先答应，关系维护好了再想办法。', { pleasing: 2, boundary: -2, drive: 1 }), row('只做合同内事项，超出范围就不接。', { boundary: 2, conflict: 1, disengage: 1 }), row('找内部资源先补上，别让客户看到混乱。', { drive: 2, pleasing: 1, politics: 1 })]],
      ['遇到回款拖延，客户和内部都在催你。你会：', 'politics', [row('确认责任节点和付款凭证，按节奏同步进展。', { politics: 2, execution: 2, upward: 1 }), row('不断道歉和催促，生怕关系变差。', { pleasing: 2, rumination: 1, boundary: -1 }), row('把事实和下一步说清楚，不能替客户承诺。', { boundary: 2, conflict: 1, upward: 1 }), row('先观察内部谁能推动，再找关键人处理。', { politics: 2, disengage: 1, conflict: -1 })]],
    ],
    content: [
      ['你认真做的内容反响平平，数据比预期低很多。你会：', 'rumination', [row('看数据找一个可验证的改动，下次马上试。', { execution: 2, drive: 1, rumination: -1 }), row('反复怀疑是不是自己不适合做这件事。', { rumination: 2, drive: -1, pleasing: 1 }), row('先接受结果，按稳定节奏继续产出。', { disengage: 1, drive: 1, boundary: 1 }), row('找同行聊聊，确认问题来自选题还是表达。', { conflict: 1, execution: 1, pleasing: 1 })]],
      ['发布前一小时，负责人突然要求整体换方向。你会：', 'conflict', [row('先确认必须变的部分，保留能复用的内容。', { execution: 2, boundary: 1, conflict: 1 }), row('先全部改完，别让对方觉得你不配合。', { pleasing: 2, drive: 1, boundary: -2 }), row('说明时间成本，请对方明确删掉哪些要求。', { boundary: 2, upward: 2, conflict: 1 }), row('表面答应，心里开始计算这次谁该负责。', { politics: 2, rumination: 1, pleasing: -1 })]],
      ['灵感突然断掉，但排期不会等你。你通常会：', 'drive', [row('先用低成本素材热身，进入状态再做难题。', { execution: 2, drive: 1, rumination: -1 }), row('硬坐在那里，直到憋出一个自认为够好的想法。', { rumination: 2, drive: 1, boundary: -1 }), row('调整排期，把精力放在最值得做的内容上。', { boundary: 2, disengage: 1, drive: -1 }), row('去看大量案例，试图从别人那里找到突破口。', { pleasing: 1, politics: 1, rumination: 1 })]],
      ['别人希望你把私人时间也变成随时可用的创作时间。你会：', 'boundary', [row('明确可响应时段，紧急事项单独约定。', { boundary: 2, upward: 1, conflict: 1 }), row('只要有灵感或机会就接，先把自己推出去。', { drive: 2, boundary: -2, pleasing: 1 }), row('不解释太多，直接在非工作时间静音。', { boundary: 2, disengage: 1, pleasing: -1 }), row('先问清楚价值，再决定是否值得牺牲休息。', { politics: 1, execution: 1, boundary: 1 })]],
    ],
    support: [
      ['用户带着怒气来投诉，问题又确实不是你造成的。你会：', 'pleasing', [row('先让对方把事实说完，再给出能执行的处理路径。', { pleasing: 1, execution: 2, conflict: 1 }), row('下意识先道歉，先把情绪压下来再说。', { pleasing: 2, boundary: -1, rumination: 1 }), row('说明责任边界，把问题转给正确的处理人。', { boundary: 2, conflict: 1, pleasing: -1 }), row('先暂时离开，等对方冷静后再继续沟通。', { disengage: 2, conflict: -1, boundary: 1 })]],
      ['高峰期同时有很多人排队等你处理，你会：', 'execution', [row('按紧急程度排队，逐个给出明确预计时间。', { execution: 2, boundary: 1, upward: 1 }), row('谁催得最凶先处理谁，别让现场失控。', { pleasing: 2, boundary: -1, conflict: -1 }), row('先处理标准化事项，把复杂问题留给专人。', { execution: 1, disengage: 1, boundary: 1 }), row('请负责人增派人手，不把系统问题变成个人硬扛。', { boundary: 2, upward: 2, conflict: 1 })]],
      ['一天处理了很多负面情绪，下班后你通常会：', 'rumination', [row('做一个收尾仪式，离开工作场景就切换。', { boundary: 2, disengage: 1, rumination: -1 }), row('回想每个细节，担心自己哪句话说错。', { rumination: 2, pleasing: 1, boundary: -1 }), row('找同事吐槽一下，然后继续生活。', { conflict: 1, pleasing: 1, disengage: 1 }), row('继续刷消息，保持随时能响应的状态。', { drive: 1, pleasing: 2, boundary: -2 })]],
      ['交接时发现对方遗漏了关键信息，你会：', 'boundary', [row('补齐信息并留下记录，避免问题再次发生。', { execution: 2, boundary: 1, politics: 1 }), row('先自己补上，别在交接现场让对方难堪。', { pleasing: 2, boundary: -1, conflict: -1 }), row('马上指出遗漏，请对方当场补全。', { boundary: 2, conflict: 2, execution: 1 }), row('先按现有信息处理，后续再看影响大小。', { disengage: 1, drive: -1, boundary: 1 })]],
    ],
    public: [
      ['流程规定要走几天，但群众或业务方今天就急着要结果。你会：', 'boundary', [row('说明流程和能提前做的准备，给出明确时间表。', { boundary: 2, execution: 2, pleasing: 1 }), row('先答应想办法，之后再协调流程。', { pleasing: 2, drive: 1, boundary: -2 }), row('严格按规则办理，不因为催促改变标准。', { boundary: 2, conflict: 1, disengage: 1 }), row('找有权限的人确认是否存在例外路径。', { politics: 2, upward: 1, execution: 1 })]],
      ['一项工作出了差错，责任边界在不同部门之间说不清。你会：', 'politics', [row('先把时间线、材料和经手环节整理出来。', { execution: 2, politics: 2, rumination: 1 }), row('先把自己这段责任认下来，别把事情闹大。', { pleasing: 2, conflict: -1, boundary: -1 }), row('要求各方一起确认责任，不能靠口头猜。', { conflict: 2, boundary: 2, politics: 1 }), row('等上级定调，自己不主动卷进争议。', { disengage: 2, upward: -1, politics: 1 })]],
      ['面对情绪激动的来访者或居民，你会：', 'conflict', [row('先确认诉求和事实，再解释能办与不能办的部分。', { conflict: 1, pleasing: 1, execution: 2 }), row('尽量满足对方，先让现场安静下来。', { pleasing: 2, boundary: -2, drive: 1 }), row('把规则讲清楚，情绪不能替代材料和标准。', { boundary: 2, conflict: 2, pleasing: -1 }), row('请同事或负责人介入，避免自己单独承受。', { upward: 1, disengage: 1, boundary: 1 })]],
      ['工作完成了，但反馈很少、评价也不明确。你会：', 'drive', [row('自己留痕复盘，确认下一次可以更稳。', { execution: 2, drive: 1, politics: 1 }), row('反复猜测是不是哪里做得不好。', { rumination: 2, pleasing: 1, drive: -1 }), row('按标准完成就好，不把评价当作唯一回报。', { boundary: 1, disengage: 2, pleasing: -1 }), row('主动找负责人确认重点，争取获得反馈。', { upward: 2, drive: 1, conflict: 1 })]],
    ],
    student: [
      ['论文、课程或考试任务一起压过来，你会：', 'execution', [row('先列出截止日和最小交付，逐项推进。', { execution: 2, drive: 1, rumination: -1 }), row('先做最有把握的，难的留到最后再冲。', { disengage: 1, drive: 1, execution: 1 }), row('反复规划，迟迟不敢真正开始。', { rumination: 2, drive: -1, pleasing: 1 }), row('找老师或同学确认重点，避免用错力。', { upward: 2, pleasing: 1, execution: 1 })]],
      ['你发现未来方向还不清楚，但身边的人都在加速。你会：', 'rumination', [row('先做一个小实验，用真实反馈缩小选择。', { execution: 2, drive: 1, rumination: -1 }), row('刷很多经验帖，试图找到唯一正确答案。', { rumination: 2, pleasing: 1, politics: 1 }), row('先完成当下最重要的一步，方向以后再调。', { disengage: 1, drive: 1, boundary: 1 }), row('找过来人聊聊，把别人的经验当参考。', { pleasing: 1, upward: 1, execution: 1 })]],
      ['小组作业里有人一直不交东西，你会：', 'conflict', [row('把分工和节点再确认一次，必要时直接指出影响。', { conflict: 2, boundary: 1, execution: 2 }), row('自己补上，先确保最后能交。', { pleasing: 2, drive: 1, boundary: -2 }), row('等负责人处理，自己只完成被分配的部分。', { boundary: 2, disengage: 1, pleasing: -1 }), row('先私下提醒，不想让关系在群里变僵。', { pleasing: 1, conflict: -1, rumination: 1 })]],
      ['第一次进入职场，别人丢来一个没有说明书的任务。你会：', 'upward', [row('先整理自己的理解，再带着具体问题去问。', { upward: 2, execution: 2, boundary: 1 }), row('先答应下来，自己搜索到能做为止。', { drive: 2, rumination: 1, boundary: -1 }), row('等对方把要求说细，不然不敢开始。', { boundary: 1, disengage: 1, drive: -1 }), row('观察身边人怎么做，先照着已有范例完成。', { pleasing: 1, politics: 1, execution: 1 })]],
    ],
    independent: [
      ['收入和订单有波动，但生活开支不会暂停。你会：', 'drive', [row('先做现金流和订单分层，保证基本盘。', { execution: 2, politics: 1, boundary: 1 }), row('多接几单再说，忙起来总会有办法。', { drive: 2, boundary: -2, pleasing: 1 }), row('降低开支，先让自己从高压里缓冲出来。', { disengage: 2, drive: -1, boundary: 1 }), row('找合作伙伴或客户谈长期安排。', { upward: 1, politics: 2, execution: 1 })]],
      ['客户不断加需求，却始终不愿意补预算。你会：', 'boundary', [row('把范围、成本和交付时间重新写清楚。', { boundary: 2, execution: 2, conflict: 1 }), row('先做了再说，怕这单以后没有了。', { pleasing: 2, drive: 1, boundary: -2 }), row('直接停止超范围工作，按约定交付。', { boundary: 2, disengage: 1, conflict: 1 }), row('通过关系和资源置换，换取长期合作。', { politics: 2, pleasing: 1, drive: 1 })]],
      ['没人盯进度、也没人提醒你休息时，你最容易：', 'execution', [row('给自己设固定节奏和检查点。', { execution: 2, boundary: 1, drive: 1 }), row('一口气冲到深夜，第二天再补觉。', { drive: 2, boundary: -2, rumination: 1 }), row('先拖到最后，再靠紧迫感启动。', { disengage: 1, drive: -1, rumination: 1 }), row('跟同行约一个共同交付时间，互相校准。', { pleasing: 1, politics: 1, execution: 1 })]],
      ['客户突然消失，之前的沟通也没有形成正式确认。你会：', 'politics', [row('整理记录，发一次明确的截止时间和后续方案。', { politics: 2, boundary: 1, execution: 1 }), row('反复追问，担心是不是自己哪里做错。', { rumination: 2, pleasing: 1, conflict: -1 }), row('到节点就止损，把精力转向别的机会。', { disengage: 2, boundary: 2, drive: 1 }), row('找共同联系人打听真实原因。', { politics: 2, pleasing: 1, conflict: 1 })]],
    ],
  };

  const industryPools = {
    technology: [
      ['技术或业务要求频繁变化时，你更在意：', 'execution', [row('把变化记录成版本和验收标准。', { execution: 2, boundary: 1, politics: 1 }), row('先快速跟上，边做边调整。', { drive: 2, execution: 1, boundary: -1 }), row('先确认谁最终拍板，避免反复返工。', { upward: 2, politics: 1, rumination: 1 }), row('暂停一下，等方向稳定后再投入。', { disengage: 2, boundary: 1, drive: -1 })]],
      ['跨团队协作时，信息散落在多个群和文档里。你会：', 'politics', [row('整理一份共享记录，明确谁在什么时候做什么。', { execution: 2, politics: 1, boundary: 1 }), row('自己多问几遍，保证事情继续往前走。', { pleasing: 1, drive: 2, boundary: -1 }), row('只关注自己负责的接口，其他不主动介入。', { boundary: 2, disengage: 1, conflict: -1 }), row('先找最有决策权的人确认口径。', { politics: 2, upward: 2, execution: 1 })]],
    ],
    finance: [
      ['月底、季末或结算节点临近，材料还缺关键一项。你会：', 'execution', [row('列缺口、定责任人和补齐时间。', { execution: 2, upward: 1, boundary: 1 }), row('先自己补齐，别影响最终结算。', { drive: 2, pleasing: 1, boundary: -2 }), row('缺什么就退回什么，按规则留痕。', { boundary: 2, conflict: 1, disengage: 1 }), row('先找业务负责人确认风险，再决定是否推进。', { politics: 2, upward: 1, rumination: 1 })]],
      ['数字出现异常，但业务方坚持说“应该没问题”。你会：', 'conflict', [row('拿数据和口径逐项核对，先把事实摆出来。', { execution: 2, conflict: 1, politics: 1 }), row('先按对方说的做，之后再观察。', { pleasing: 2, boundary: -1, disengage: 1 }), row('暂停提交，要求对方补充依据。', { boundary: 2, conflict: 2, upward: 1 }), row('先记录疑点，等负责人定夺。', { rumination: 1, politics: 2, upward: -1 })]],
    ],
    health: [
      ['轮班后又临时加了一台急诊或一项高压任务，你会：', 'drive', [row('先确认优先级和交接，保证关键环节不漏。', { execution: 2, boundary: 1, drive: 1 }), row('先顶上去，现场需要最重要。', { drive: 2, pleasing: 2, boundary: -2 }), row('说明当前负荷，请负责人重新安排。', { boundary: 2, upward: 2, conflict: 1 }), row('按标准完成必要项，其他等下一班衔接。', { disengage: 1, boundary: 1, drive: -1 })]],
      ['面对家属、患者或客户的强烈情绪时，你会：', 'pleasing', [row('先承接情绪，再用专业信息解释下一步。', { pleasing: 1, execution: 2, conflict: 1 }), row('不断安抚，生怕对方认为你不负责。', { pleasing: 2, rumination: 1, boundary: -1 }), row('说明能做与不能做的范围，必要时请负责人介入。', { boundary: 2, conflict: 1, upward: 1 }), row('先让自己退出现场，避免情绪继续传导。', { disengage: 2, conflict: -1, boundary: 1 })]],
    ],
    education: [
      ['课程、论文或教研节点撞在一起时，你会：', 'execution', [row('先按截止时间拆成可检查的阶段交付。', { execution: 2, drive: 1, rumination: -1 }), row('先把最急的一件做完，其他靠后。', { drive: 1, disengage: 1, execution: 1 }), row('反复调整计划，担心顾此失彼。', { rumination: 2, pleasing: 1, drive: -1 }), row('找导师、同事或同学确认真正的优先级。', { upward: 2, pleasing: 1, execution: 1 })]],
      ['面对学生、家长或合作方提出的额外要求，你会：', 'boundary', [row('明确本次能提供的支持和时间范围。', { boundary: 2, pleasing: 1, conflict: 1 }), row('能帮就帮，关系别在自己这里卡住。', { pleasing: 2, boundary: -2, drive: 1 }), row('按制度和课程安排处理，超出范围请走正式流程。', { boundary: 2, execution: 1, disengage: 1 }), row('先听完诉求，再找负责人确认是否能调整。', { upward: 1, politics: 1, pleasing: 1 })]],
    ],
    manufacturing: [
      ['生产、质量或交付节点临时出现异常时，你会：', 'execution', [row('先隔离风险，按优先级组织排查和补救。', { execution: 2, conflict: 1, drive: 1 }), row('先把产线或现场顶住，原因之后再追。', { drive: 2, boundary: -1, pleasing: 1 }), row('按流程上报，未经确认不擅自改变标准。', { boundary: 2, upward: 1, disengage: 1 }), row('先找最熟悉现场的人一起判断。', { pleasing: 1, politics: 1, execution: 1 })]],
      ['供应商或上下游把延误推到你这边，你会：', 'politics', [row('拿合同、节点和现场记录逐项对齐责任。', { politics: 2, boundary: 2, execution: 1 }), row('先把缺口补上，避免内部继续催。', { drive: 2, pleasing: 1, boundary: -1 }), row('要求对方给出书面计划和补救时间。', { boundary: 2, conflict: 1, execution: 1 }), row('先找有资源的负责人协调，自己不硬碰。', { politics: 2, upward: 1, disengage: 1 })]],
    ],
    construction: [
      ['现场天气、材料或安全条件变化，原计划不能照做时，你会：', 'boundary', [row('先停在安全底线，重新确认方案和责任。', { boundary: 2, execution: 2, conflict: 1 }), row('先赶进度，现场问题边做边处理。', { drive: 2, boundary: -2, pleasing: 1 }), row('按规定上报，等授权后再推进。', { upward: 2, disengage: 1, boundary: 1 }), row('先找有经验的班组一起评估替代路径。', { execution: 1, politics: 1, pleasing: 1 })]],
      ['工期被压缩，但新增资源没有跟上。你会：', 'upward', [row('把工期、资源和质量风险摆出来请负责人取舍。', { upward: 2, execution: 2, boundary: 1 }), row('先加班把缺口顶上，别让现场停。', { drive: 2, pleasing: 1, boundary: -2 }), row('只完成约定范围，额外部分重新报价或排期。', { boundary: 2, politics: 1, conflict: 1 }), row('先看最关键节点，其他工作顺延。', { disengage: 1, execution: 1, drive: -1 })]],
    ],
    service: [
      ['门店或服务现场突然排起长队，你会：', 'execution', [row('先分流和排序，给顾客明确的等待预期。', { execution: 2, boundary: 1, pleasing: 1 }), row('谁着急先处理谁，先把情绪压住。', { pleasing: 2, drive: 1, boundary: -1 }), row('请负责人增援，不把人手不足变成个人硬扛。', { upward: 2, boundary: 2, conflict: 1 }), row('只按流程处理，额外诉求等高峰后再说。', { disengage: 1, boundary: 1, drive: -1 })]],
      ['顾客提出明显超出规则的要求，并说要给差评。你会：', 'conflict', [row('说明规则和可替代方案，尽量把选择讲清楚。', { boundary: 2, pleasing: 1, conflict: 1 }), row('先满足对方，评价比规则更重要。', { pleasing: 2, boundary: -2, drive: 1 }), row('请店长或负责人介入，自己不越权承诺。', { upward: 1, boundary: 2, politics: 1 }), row('保持礼貌但不拉扯，按规则结束沟通。', { disengage: 2, conflict: 1, pleasing: -1 })]],
    ],
    media: [
      ['内容发布临近，平台反馈与原先预期完全不同。你会：', 'rumination', [row('先看反馈数据，找一个最小改动继续测试。', { execution: 2, rumination: -1, drive: 1 }), row('反复怀疑选题和能力，暂时不想发下一条。', { rumination: 2, drive: -1, pleasing: 1 }), row('按自己的节奏继续做，不被一次反馈带跑。', { boundary: 1, disengage: 1, drive: 1 }), row('找同领域的人讨论，判断是不是趋势变化。', { politics: 1, pleasing: 1, execution: 1 })]],
      ['品牌、客户和团队对内容方向意见不一致时，你会：', 'politics', [row('先列共同目标和不可妥协项，再谈取舍。', { politics: 2, execution: 2, conflict: 1 }), row('谁声音最大就先跟谁，避免继续争论。', { pleasing: 2, politics: 1, boundary: -1 }), row('保留专业判断，明确哪些修改会伤害效果。', { boundary: 2, conflict: 2, upward: 1 }), row('先观察风向，等关键人表态后再推进。', { politics: 2, rumination: 1, disengage: 1 })]],
    ],
    public: [
      ['材料、流程和群众诉求彼此冲突时，你会：', 'boundary', [row('先把缺失材料和可办理范围讲清楚。', { boundary: 2, execution: 2, pleasing: 1 }), row('先想办法通融，别让对方白跑。', { pleasing: 2, boundary: -2, drive: 1 }), row('严格按标准办理，必要时给出补正清单。', { boundary: 2, conflict: 1, disengage: 1 }), row('找有权限的人确认是否存在正式例外。', { politics: 2, upward: 1, execution: 1 })]],
      ['跨部门事项迟迟没有推进，但每个部门都说自己已完成。你会：', 'politics', [row('按时间线和节点重新对齐交接责任。', { politics: 2, execution: 2, boundary: 1 }), row('自己先把缺口补上，别让事项继续挂着。', { drive: 2, pleasing: 1, boundary: -1 }), row('把问题上报，请上级明确牵头部门。', { upward: 2, conflict: 1, disengage: 1 }), row('先观察谁真正能推动，再去找关键人。', { politics: 2, rumination: 1, conflict: -1 })]],
    ],
    other: [
      ['你的工作场景和常见职场案例不太一样时，你更看重：', 'boundary', [row('先定义自己的工作标准和责任边界。', { boundary: 2, execution: 1, upward: 1 }), row('先跟着现场节奏走，遇到问题再补。', { drive: 2, pleasing: 1, boundary: -1 }), row('观察规则和资源如何流动，再决定投入多少。', { politics: 2, rumination: 1, disengage: 1 }), row('只完成必要事项，把精力留给生活。', { disengage: 2, boundary: 1, drive: -1 })]],
      ['当别人用自己的职业经验评价你的选择时，你会：', 'conflict', [row('说明你的实际约束，请对方基于事实讨论。', { conflict: 2, boundary: 1, upward: 1 }), row('先听着，回去反复想是不是自己错了。', { rumination: 2, pleasing: 1, conflict: -1 }), row('礼貌接受建议，但仍按自己的判断行动。', { boundary: 2, drive: 1, pleasing: -1 }), row('先观察对方是否真的了解你的现场。', { politics: 1, disengage: 1, rumination: 1 })]],
    ],
  };

  const roleQuestions = [];
  Object.entries(rolePools).forEach(([roleFamily, pool]) => pool.forEach((item, index) => {
    const [scene, focus, rows] = item;
    roleQuestions.push(question(`r-${roleFamily}-${index + 1}`, focus, scene, rows, { source: 'role', roleFamily }));
  }));
  const industryQuestions = [];
  Object.entries(industryPools).forEach(([industryId, pool]) => pool.forEach((item, index) => {
    const [scene, focus, rows] = item;
    industryQuestions.push(question(`i-${industryId}-${index + 1}`, focus, scene, rows, { source: 'industry', industryId }));
  }));
  data.questions = (data.questions || []).concat(roleQuestions, industryQuestions);
})(typeof window !== 'undefined' ? window : globalThis);
