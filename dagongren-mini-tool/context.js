(function (root) {
  const identities = [
    { id: 'management', label: '管理 / 带人', short: '管理岗' },
    { id: 'professional', label: '专业 / 技术', short: '专业岗' },
    { id: 'operations', label: '运营 / 执行', short: '执行岗' },
    { id: 'sales', label: '销售 / 客户', short: '销售岗' },
    { id: 'content', label: '内容 / 创意', short: '内容岗' },
    { id: 'support', label: '支持 / 服务', short: '支持岗' },
    { id: 'public', label: '公职 / 国企', short: '公职岗' },
    { id: 'student', label: '学生 / 研究', short: '学生' },
    { id: 'independent', label: '自由 / 创业', short: '自由职业' },
    { id: 'other', label: '其他 / 还没找到', short: '待补充' },
  ];

  const industries = [
    { id: 'technology', label: '互联网 / 科技', short: '互联网科技' },
    { id: 'finance', label: '金融 / 财税', short: '金融财税' },
    { id: 'health', label: '医疗 / 医药', short: '医疗医药' },
    { id: 'education', label: '教育 / 科研', short: '教育科研' },
    { id: 'manufacturing', label: '制造 / 工业', short: '制造工业' },
    { id: 'logistics', label: '物流 / 供应链', short: '物流供应链' },
    { id: 'construction', label: '建筑 / 能源', short: '建筑能源' },
    { id: 'public', label: '政府 / 国企', short: '政府国企' },
    { id: 'retail', label: '零售 / 电商', short: '零售电商' },
    { id: 'service', label: '销售 / 消费服务', short: '销售服务' },
    { id: 'media', label: '创意 / 媒体', short: '创意媒体' },
    { id: 'agriculture', label: '农业 / 生物 / 新消费', short: '农业新消费' },
    { id: 'legal', label: '法律 / 咨询', short: '法律咨询' },
    { id: 'campus', label: '校园 / 初入职场', short: '校园新人' },
    { id: 'other', label: '其他 / 找不到我的行业', short: '其他行业' },
  ];

  const roles = [
    { id: 'manager', identityId: 'management', roleFamily: 'management', label: '部门负责人 / 经理', short: '管理岗' },
    { id: 'team-lead', identityId: 'management', roleFamily: 'management', label: '主管 / 组长', short: '带人岗' },
    { id: 'project-manager', identityId: 'management', roleFamily: 'management', label: '项目负责人', short: '项目管理' },
    { id: 'engineer', identityId: 'professional', roleFamily: 'technical', label: '工程师 / 技术研发', short: '技术岗' },
    { id: 'product', identityId: 'professional', roleFamily: 'technical', label: '产品 / 项目专员', short: '产品岗' },
    { id: 'designer', identityId: 'professional', roleFamily: 'creative', label: '设计 / 视觉', short: '设计岗' },
    { id: 'analyst', identityId: 'professional', roleFamily: 'technical', label: '数据 / 分析 / 财税', short: '分析岗' },
    { id: 'doctor', identityId: 'professional', roleFamily: 'professional', label: '医生 / 药师', short: '医药专业岗' },
    { id: 'nurse', identityId: 'professional', roleFamily: 'professional', label: '护士 / 医护', short: '医护岗' },
    { id: 'teacher', identityId: 'professional', roleFamily: 'professional', label: '教师 / 教研', short: '教育岗' },
    { id: 'quality-inspector', identityId: 'professional', roleFamily: 'professional', label: '质量 / 检验', short: '质量岗' },
    { id: 'field-technician', identityId: 'professional', roleFamily: 'technical', label: '现场技术 / 维修', short: '现场技术' },
    { id: 'operations-specialist', identityId: 'operations', roleFamily: 'operations', label: '运营 / 活动', short: '运营岗' },
    { id: 'administration', identityId: 'operations', roleFamily: 'operations', label: '行政 / 人事', short: '职能执行' },
    { id: 'project-specialist', identityId: 'operations', roleFamily: 'operations', label: '项目执行 / 协调', short: '项目执行' },
    { id: 'production-worker', identityId: 'operations', roleFamily: 'operations', label: '生产 / 车间', short: '生产岗' },
    { id: 'logistics-coordinator', identityId: 'operations', roleFamily: 'operations', label: '物流 / 仓储', short: '供应链岗' },
    { id: 'construction-site', identityId: 'operations', roleFamily: 'operations', label: '建筑 / 工程现场', short: '工程现场' },
    { id: 'account-manager', identityId: 'sales', roleFamily: 'sales', label: '客户经理 / 大客户', short: '客户经理' },
    { id: 'sales-representative', identityId: 'sales', roleFamily: 'sales', label: '销售 / 商务拓展', short: '销售岗' },
    { id: 'channel-manager', identityId: 'sales', roleFamily: 'sales', label: '渠道 / 经销商', short: '渠道岗' },
    { id: 'customer-service', identityId: 'support', roleFamily: 'support', label: '客服 / 用户服务', short: '客服岗' },
    { id: 'store-service', identityId: 'support', roleFamily: 'support', label: '门店 / 一线服务', short: '服务岗' },
    { id: 'frontline-sales', identityId: 'sales', roleFamily: 'sales', label: '地推 / 外勤销售', short: '外勤销售' },
    { id: 'hr-finance', identityId: 'support', roleFamily: 'support', label: '财务 / 人力 / 法务', short: '职能支持' },
    { id: 'editor', identityId: 'content', roleFamily: 'content', label: '编辑 / 文案', short: '内容岗' },
    { id: 'creator', identityId: 'content', roleFamily: 'content', label: '自媒体 / 内容创作', short: '创作者' },
    { id: 'media-planner', identityId: 'content', roleFamily: 'content', label: '媒体 / 广告 / 公关', short: '媒体岗' },
    { id: 'civil-servant', identityId: 'public', roleFamily: 'public', label: '公务员 / 事业单位', short: '公职岗' },
    { id: 'state-enterprise', identityId: 'public', roleFamily: 'public', label: '国企 / 央企员工', short: '国企岗' },
    { id: 'frontline-public', identityId: 'public', roleFamily: 'public', label: '窗口 / 一线公共服务', short: '公共服务' },
    { id: 'student', identityId: 'student', roleFamily: 'student', label: '在校学生', short: '学生' },
    { id: 'graduate', identityId: 'student', roleFamily: 'student', label: '研究生 / 博士生', short: '研究生' },
    { id: 'newcomer', identityId: 'student', roleFamily: 'student', label: '实习生 / 职场新人', short: '职场新人' },
    { id: 'founder', identityId: 'independent', roleFamily: 'independent', label: '创业者 / 合伙人', short: '创业者' },
    { id: 'freelancer', identityId: 'independent', roleFamily: 'independent', label: '自由职业 / 个体户', short: '自由职业' },
    { id: 'gig-worker', identityId: 'independent', roleFamily: 'independent', label: '接单 / 灵活就业', short: '灵活就业' },
    { id: 'other-role', identityId: 'other', roleFamily: 'other', label: '其他 / 找不到我的岗位', short: '其他岗位' },
  ];

  const identityById = Object.fromEntries(identities.map((item) => [item.id, item]));
  const industryById = Object.fromEntries(industries.map((item) => [item.id, item]));
  const roleById = Object.fromEntries(roles.map((item) => [item.id, item]));

  const universalReplacements = [
    ['新项目', '新任务'], ['项目', '事情'], ['需求方', '提出要求的人'], ['需求变更', '要求变化'],
    ['需求', '工作要求'], ['上线', '交付'], ['研发', '执行团队'], ['汇报', '同步'],
    ['合作方', '相关方'], ['跨部门', '不同团队'], ['接口', '衔接环节'], ['绩效', '阶段评价'],
  ];
  const contextReplacements = {
    education: [['重要工作', '课程、研究或教学任务'], ['负责人', '老师或教研负责人'], ['同事', '同事或同组伙伴']],
    health: [['重要工作', '接诊、值班或服务任务'], ['负责人', '科室负责人或主管'], ['同事', '同事或协作医护']],
    finance: [['重要工作', '业务、账务或客户事项'], ['负责人', '主管或业务负责人'], ['相关方', '客户或协作方']],
    manufacturing: [['重要工作', '生产、质量或交付任务'], ['负责人', '班组长或生产负责人'], ['交付', '出货或交付']],
    construction: [['重要工作', '现场、工程或能源任务'], ['负责人', '项目负责人或现场主管'], ['交付', '验收或交工']],
    service: [['重要工作', '当班、客户或现场服务任务'], ['负责人', '店长或现场负责人'], ['相关方', '顾客或协作方']],
    media: [['重要工作', '内容、创作或传播任务'], ['负责人', '主编或项目负责人'], ['同步', '沟通对齐']],
    public: [['重要工作', '服务事项或公共事务'], ['负责人', '主管或事项负责人'], ['合作方', '协作单位']],
    technology: [['重要工作', '业务或技术任务'], ['负责人', '直属负责人'], ['相关方', '协作方']],
  };

  function normalize(value) {
    const input = value && typeof value === 'object' ? value : {};
    let role = roleById[input.roleId];
    let identityId = identityById[input.identityId] ? input.identityId : (role ? role.identityId : 'other');
    if (!identityById[identityId]) identityId = 'other';
    if (!role || role.identityId !== identityId) role = roleById['other-role'];
    const industryId = industryById[input.industryId] ? input.industryId : 'other';
    return { identityId, industryId, roleId: role.id, roleFamily: role.roleFamily };
  }

  function getRolesFor(identityId, industryId) {
    const identity = identityById[identityId] ? identityId : 'other';
    const industry = industryById[industryId] ? industryId : 'other';
    const matches = roles.filter((role) => role.identityId === identity && (!role.industryIds || role.industryIds.includes(industry)));
    return matches.concat(roleById['other-role']).filter((role, index, list) => list.findIndex((item) => item.id === role.id) === index);
  }

  function getIndustryCluster(industryId) {
    const clusters = {
      technology: 'technology', finance: 'finance', legal: 'finance', health: 'health', education: 'education', campus: 'education',
      manufacturing: 'manufacturing', logistics: 'manufacturing', construction: 'construction', retail: 'service', service: 'service',
      media: 'media', public: 'public', agriculture: 'other', other: 'other',
    };
    return clusters[industryId] || 'other';
  }

  function replaceAll(text, pairs) { return pairs.reduce((result, pair) => result.split(pair[0]).join(pair[1]), String(text)); }

  function adaptScene(text, value) {
    const context = normalize(value);
    let output = replaceAll(text, universalReplacements);
    if (context.industryId !== 'other') output = replaceAll(output, contextReplacements[context.industryId] || []);
    return output;
  }

  function getLabels(value) {
    const context = normalize(value);
    const identity = identityById[context.identityId];
    const industry = industryById[context.industryId];
    const role = roleById[context.roleId];
    return {
      ...context,
      identity: identity.label,
      industry: industry.label,
      role: role.label,
      identityShort: identity.short,
      industryShort: industry.short,
      roleShort: role.short,
    };
  }

  root.DagongrenContext = { identities, industries, roles, normalize, getRolesFor, getIndustryCluster, adaptScene, getLabels };
})(typeof window !== 'undefined' ? window : globalThis);
