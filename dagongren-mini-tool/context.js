(function (root) {
  const industries = [
    { id: 'general', label: '跨行业通用', short: '先不标注' },
    { id: 'technology', label: '互联网 / 科技', short: '互联网 / 科技' },
    { id: 'public', label: '政企 / 公共服务', short: '政企 / 公共服务' },
    { id: 'education', label: '教育 / 科研', short: '教育 / 科研' },
    { id: 'finance', label: '金融 / 商业', short: '金融 / 商业' },
    { id: 'health', label: '医疗 / 健康', short: '医疗 / 健康' },
    { id: 'engineering', label: '制造 / 工程', short: '制造 / 工程' },
    { id: 'service', label: '零售 / 服务', short: '零售 / 服务' },
    { id: 'media', label: '传媒 / 内容', short: '传媒 / 内容' },
  ];
  const roles = [
    { id: 'general', label: '先不标注', short: '通用岗位' },
    { id: 'management', label: '管理 / 带人', short: '管理 / 带人' },
    { id: 'professional', label: '专业 / 技术', short: '专业 / 技术' },
    { id: 'operations', label: '运营 / 执行', short: '运营 / 执行' },
    { id: 'sales', label: '销售 / 客户', short: '销售 / 客户' },
    { id: 'support', label: '支持 / 职能', short: '支持 / 职能' },
    { id: 'research', label: '创作 / 研究', short: '创作 / 研究' },
  ];
  const industryById = Object.fromEntries(industries.map((item) => [item.id, item]));
  const roleById = Object.fromEntries(roles.map((item) => [item.id, item]));
  const universalReplacements = [
    ['新项目', '新任务'], ['项目', '任务'], ['需求方', '提出要求的人'], ['需求变动', '要求变化'],
    ['需求', '工作要求'], ['上线', '交付'], ['研发', '执行团队'], ['汇报', '同步'],
    ['合作方', '相关方'], ['跨部门', '不同团队'], ['接口', '衔接环节'], ['绩效', '阶段评价'],
  ];
  const contextReplacements = {
    education: [['重要工作', '课程、研究或教学任务'], ['负责人', '导师或教研负责人'], ['同事', '同事或同组伙伴']],
    public: [['重要工作', '服务事项'], ['负责人', '主管或项目负责人'], ['合作方', '协作单位']],
    finance: [['重要工作', '业务事项'], ['负责人', '主管或业务负责人'], ['相关方', '客户或协作方']],
    health: [['重要工作', '服务事项'], ['负责人', '科室负责人或主管'], ['同事', '同事或协作人员']],
    engineering: [['重要工作', '生产或工程任务'], ['负责人', '班组长或项目负责人'], ['交付', '交工或交付']],
    service: [['重要工作', '当班任务'], ['负责人', '店长或现场负责人'], ['相关方', '顾客或协作方']],
    media: [['重要工作', '内容或创作任务'], ['负责人', '主编或项目负责人'], ['同步', '沟通']],
    technology: [['重要工作', '业务任务'], ['负责人', '直属负责人'], ['相关方', '协作方']],
  };

  function normalize(value) {
    const input = value && typeof value === 'object' ? value : {};
    return {
      industryId: industryById[input.industryId] ? input.industryId : 'general',
      roleId: roleById[input.roleId] ? input.roleId : 'general',
    };
  }

  function replaceAll(text, pairs) {
    return pairs.reduce((result, pair) => result.split(pair[0]).join(pair[1]), String(text));
  }

  function adaptScene(text, value) {
    const context = normalize(value);
    let output = replaceAll(text, universalReplacements);
    if (context.industryId !== 'general') output = replaceAll(output, contextReplacements[context.industryId] || []);
    return output;
  }

  function getLabels(value) {
    const context = normalize(value);
    return {
      ...context,
      industry: industryById[context.industryId].label,
      role: roleById[context.roleId].label,
      industryShort: industryById[context.industryId].short,
      roleShort: roleById[context.roleId].short,
    };
  }

  root.DagongrenContext = { industries, roles, normalize, adaptScene, getLabels };
})(typeof window !== 'undefined' ? window : globalThis);
