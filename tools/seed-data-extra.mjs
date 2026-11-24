/**
 * 扩展种子数据（第二轮调研，2026-11-24 逐页核验）
 *
 * 与 seed-records.mjs 的区别：这里是"把面做宽"的补充，重点覆盖
 * 上游与配套、替代技术（ATO/ITO/LaB6/VO2/AZO）、检测机构、下游膜品牌、更多标准。
 * 每条都带实际访问成功的来源 URL；打不开的一律降级为 pending 并写明失败原因。
 */

const ACCESSED = '2026-11-24';
const S = (title, url, kind = 'official') => ({ title, url, kind, accessed: ACCESSED });

/* =================================================================== 透明陶瓷隔热 · 扩展 */

export const DC_COMPANIES_EXT = [
  {
    name: '广州宏武材料科技有限公司',
    nameEn: 'Guangzhou Hongwu Material Technology Co., Ltd.',
    country: '中国',
    region: '广东 · 广州黄埔',
    role: '纳米粉体 + 分散液生产商',
    website: 'http://www.xuzhounano.com/',
    productHint: 'CTO 铯钨青铜粉体/分散液；另有 WO₃、WO₂.₇₂、WO₂.₉、纳米钨粉',
    subs: ['dc-1', 'dc-2'],
    verification: 'official',
    summary:
      '品牌"宏武纳米"，产品线同时覆盖钨系纳米粉体（WO₃、WO₂.₇₂、WO₂.₉、钨酸、纳米钨粉）与铯钨青铜 CTO 粉体/分散液，是国内少数把钨系全谱做齐的粉体厂。官网另设隔热材料专栏，专门讲 VO₂、W-VO₂（掺杂钨降低相变温度）与 AZO 隔热路线，是"铯钨青铜不是唯一解"的直接书证。',
    specs: { 代表产品: 'CTO 铯钨青铜粉体（80–100nm / 100–200nm）', 同厂其他: 'WO₃ / WO₂.₇₂ / WO₂.₉ / 钨酸 / 纳米钨粉', 替代技术线: 'VO₂、W-VO₂、AZO' },
    tags: ['粉体', '钨系全谱', '替代技术'],
    sources: [
      S('宏武纳米 CTO 产品页', 'http://www.xuzhounano.com/products/show-742.html'),
      S('宏武纳米 隔热材料专栏（VO₂/AZO）', 'http://www.xuzhounano.com/news/362.html')
    ]
  },
  {
    name: '上海盈承新材料有限公司',
    country: '中国',
    region: '上海 · 奉贤',
    role: '纳米氧化物粉体（CsₓWO₃ + ATO 双线）',
    website: 'http://www.shycnano.com/',
    productHint: 'HN-CW30 / HN-CW50 铯钨青铜粉；纳米 ATO 抗静电系列',
    subs: ['dc-1'],
    verification: 'official',
    summary:
      '同时供应铯钨青铜与锑掺杂二氧化锡（ATO）两条近红外吸收线，官网明确写出行业主流做法：把 ATO、ITO、六硼化镧（LaB₆）或铯钨青铜纳米颗粒加入树脂，或先涂布到 PET 膜上，或做成 PVB/EVA 塑胶片再与钢化玻璃复合。这段原文比任何二手总结都更能说明"四种材料并存竞争"的格局。',
    specs: { 代表产品: 'HN-CW30（30nm）/ HN-CW50（50nm）', 双线布局: '铯钨青铜 + 纳米 ATO', 官网原文要点: 'ATO / ITO / LaB₆ / CsₓWO₃ 四条近红外吸收路线并存' },
    tags: ['粉体', 'ATO', '竞争格局'],
    sources: [S('盈承新材料 铯钨青铜粉体页', 'https://www.shycnano.com/swqt/swqtf.html')]
  },
  {
    name: '浙江智钛纳微新材料有限公司',
    country: '中国',
    region: '浙江 · 杭州拱墅',
    role: '纳米新材料应用推广（宣城晶瑞事业部）',
    website: 'http://www.ztjhkj.cn/',
    productHint: 'JR-CW50 纳米铯钨青铜粉',
    subs: ['dc-1'],
    verification: 'official',
    summary:
      '页面自述为宣城晶瑞新材料的特设事业部，负责纳米材料的应用推广，与晶和/晶瑞体系同源。JR-CW50 给出了可直接换算成涂层配方的数据：每平方米涂层添加约 2 g，即可让 950–1400 nm 透过率降到 10% 以下，同时 550 nm 保持 70% 以上。',
    specs: { 代表产品: 'JR-CW50', 体系关系: '宣城晶瑞新材料特设事业部（企业自述）', 涂布参考: '每㎡添加约 2 g' },
    tags: ['粉体', '晶瑞体系'],
    sources: [S('智钛纳微 JR-CW50 产品页', 'http://www.ztjhkj.cn/products/products_611.html')]
  },
  {
    name: '首诺国际贸易（上海）有限公司（威固 V-KOOL 中国）',
    nameEn: 'V-KOOL China (Eastman)',
    country: '中国',
    region: '上海 · 浦东',
    role: '下游窗膜品牌运营',
    website: 'https://www.v-kool.cn/',
    productHint: '威固 XIR™ 技术、纳米陶瓷膜（VDE / 闪电威系列）',
    subs: ['dc-4'],
    verification: 'official',
    summary:
      '伊士曼（Eastman）旗下窗膜品牌威固的中国运营主体，官网主打 XIR™ 技术与"纳米陶瓷膜"，并挂有国检集团（CTC）权威评测入口。需要注意：官网只写"纳米陶瓷/信号不影响"，**未公开配方**，是否采用铯钨青铜或 ATO 无法从公开页面确认，本条仅确认其市场位置与技术宣称。',
    specs: { 技术品牌: 'XIR™ / 纳米陶瓷膜', 'UV 阻隔': '≥99%（官网口径）', 成分: '未公开配方' },
    tags: ['窗膜品牌', '下游', '配方未公开'],
    sources: [S('威固中国 产品页', 'https://www.v-kool.cn/index.php/product/shop.html')]
  },
  {
    name: '中国国检测试控股集团股份有限公司（国检集团 CTC）',
    nameEn: 'China Testing & Certification International Group Co., Ltd.',
    country: '中国',
    region: '北京',
    role: '第三方检验检测 / 认证机构',
    website: 'https://www.ctc.ac.cn/',
    productHint: '国家建筑材料工业电子玻璃及智能玻璃（器件）质量监督检验评价中心',
    subs: ['dc-3', 'dc-4'],
    verification: 'official',
    summary:
      '央企背景的第三方检验认证机构，下设国家建筑材料工业电子玻璃及智能玻璃（器件）质量监督检验评价中心，覆盖光学、热学、耐久性等百余项参数。隔热膜/隔热玻璃厂商宣称的 VLT、TSIR、耐候数据，若由 CTC 出具报告才具备可比性——这也是判断一个"隔热参数"是否可信的实操口径。',
    specs: { 资质: '国家建筑材料工业电子玻璃及智能玻璃质量监督检验评价中心', 覆盖参数: '光学 / 热学 / 耐久性等 100 余项' },
    tags: ['检测机构', '央企', '参数可信度'],
    sources: [S('国检集团 电子玻璃与智能玻璃中心', 'https://www.ctc.ac.cn/art/2026/1/9/art_28_5811.html')]
  },
  {
    name: '中国建材检验认证集团苏州有限公司（CTC 苏州）',
    country: '中国',
    region: '江苏 · 苏州',
    role: '第三方建材 / 玻璃检测机构',
    website: 'http://www.ctcsz.com/',
    productHint: '建筑玻璃光学性能检测（可见光透射比/反射比、遮阳系数等）',
    subs: ['dc-3', 'dc-4'],
    verification: 'official',
    summary:
      '专注建材与玻璃检测的第三方机构，公开的检测能力覆盖可见光透射比与反射比、太阳光直接透射比/反射比/吸收比、太阳能总透射比、遮阳系数，并列出 GB/T 2680-2021、GB/T 22476-2008、JGJ/T 151-2008 等依据标准。做产品对比前先确认对方报告是否出自这类机构，比看宣传页参数更靠得住。',
    specs: { 检测能力: '可见光/太阳能透射比、遮阳系数等', 主要依据标准: 'GB/T 2680-2021、GB/T 22476-2008、JGJ/T 151-2008' },
    tags: ['检测机构', '玻璃光学'],
    sources: [S('CTC 苏州 检测能力页', 'http://ctcsz.com/page.asp?cid=25')]
  }
];

export const DC_PRODUCTS_EXT = [
  {
    name: 'HN-CW30 铯钨青铜粉体',
    org: '上海盈承新材料有限公司',
    form: '粉体（30 nm 档）',
    subs: ['dc-1'],
    verification: 'official',
    summary: '蓝黑色粉末，纯度 99.9%，一次粒径 30 nm，比表面积 20–50 m²/g，20 kg/桶包装。同厂另有 50 nm 档 HN-CW50 与 ATO 系列，便于在同一供应商处做两种吸收剂的配方对比。',
    specs: { 外观: '蓝黑色粉末', 纯度: '99.9%', 粒径: '30 nm', 比表面积: '20–50 m²/g', 包装: '20 kg/桶' },
    tags: ['粉体', '30nm'],
    sources: [S('盈承 HN-CW 系列产品页', 'https://www.shycnano.com/swqt/swqtf.html')]
  },
  {
    name: 'HN-CW50 铯钨青铜粉体',
    org: '上海盈承新材料有限公司',
    form: '粉体（50 nm 档）',
    subs: ['dc-1'],
    verification: 'official',
    summary: '同系列 50 nm 档，纯度 99.9%，比表面积 10–20 m²/g。粒径变大后比表面积下降，分散难度降低但雾度风险上升，选型时需与成膜厚度一起权衡。',
    specs: { 外观: '蓝黑色粉末', 纯度: '99.9%', 粒径: '50 nm', 比表面积: '10–20 m²/g' },
    tags: ['粉体', '50nm'],
    sources: [S('盈承 HN-CW 系列产品页', 'https://www.shycnano.com/swqt/swqtf.html')]
  },
  {
    name: 'JR-CW50 纳米铯钨青铜粉',
    org: '浙江智钛纳微新材料有限公司',
    form: '粉体',
    subs: ['dc-1'],
    verification: 'official',
    summary: '页面把"配方—性能"关系写得很实：每平方米涂层添加约 2 g，即可让 950–1400 nm 波段透过率低于 10%，同时 550 nm 可见光透过率保持 70% 以上。这类可直接换算的涂布量，比单纯列粒径更有工程价值。',
    specs: { 外观: '蓝黑色粉', 纯度: '99.9%', 粒径: '30–50 nm', 比表面积: '20–50 m²/g', 涂布参考: '每㎡约 2 g → 950–1400nm 透过率<10%，550nm>70%' },
    tags: ['粉体', '涂布量可换算'],
    sources: [S('智钛纳微 JR-CW50 产品页', 'http://www.ztjhkj.cn/products/products_611.html')]
  },
  {
    name: 'CTO 纳米铯钨青铜粉体',
    org: '广州宏武材料科技有限公司',
    form: '粉体（可供浆料/分散液）',
    subs: ['dc-1', 'dc-2'],
    verification: 'official',
    summary: '提供 80–100 nm 与 100–200 nm 两个粒径档，纯度 99.9%，CAS 189619-69-0。页面给出涂布经验值：每平方米添加约 1.3 g，可实现 950 nm 红外阻隔率 90% 以上、550 nm 可见光透过率 70% 以上、雾度小于 0.5%，是本轮调研中雾度指标最明确的一条。',
    specs: { 粒径: '80–100 nm / 100–200 nm', 纯度: '99.9%', CAS: '189619-69-0', 涂布参考: '每㎡约 1.3 g → 950nm 阻隔>90%，550nm 透过>70%', 雾度: '<0.5%' },
    tags: ['粉体', '雾度可核'],
    sources: [S('宏武纳米 CTO 产品页', 'http://www.xuzhounano.com/products/show-742.html')]
  },
  {
    name: 'JT-CW30W 水性铯钨青铜分散液',
    org: '湖州久泰陶瓷材料有限公司',
    form: '水性分散液',
    subs: ['dc-2'],
    verification: 'b2b',
    summary: '预分散于去离子水，固含量 10–20%，粒径 30±5 nm。页面特别提示"5–35 ℃ 密封避光储存，不可冷冻（冷冻会导致不可逆团聚）"——这是铯钨青铜水性浆料最常见的失效原因，属于实用级信息。',
    specs: { 介质: '去离子水', 固含量: '10–20%', 粒径: '30±5 nm', 储存: '5–35℃ 密封避光，禁止冷冻' },
    tags: ['分散液', '水性', '储存条件'],
    sources: [S('中玻网 久泰 JT-CW30W 页', 'https://m.glass.com.cn/hzjttc/supplydetail-2593391.html')]
  },
  {
    name: 'CY-XW30W 水性铯钨青铜分散液',
    org: '杭州九朋新材料有限公司',
    form: '水性分散液',
    subs: ['dc-2'],
    verification: 'b2b',
    summary: '蓝黑色液体，固含口径标为 20%，粒径 30–50 nm，分散介质为水；大货 15 kg/桶、样品 1 kg/袋。与同厂 CY-XW30 粉体配套，便于涂料厂直接投料而不必自建分散工序。',
    specs: { 外观: '蓝黑色液体', '纯度/固含': '20%（页面标注）', 粒径: '30–50 nm', 介质: '水', 包装: '15 kg/桶（样品 1 kg/袋）' },
    tags: ['分散液', '水性'],
    sources: [S('中玻网 九朋 CY-XW30W 页', 'https://www.glass.com.cn/zjjpxcl/supplydetail-2583031.html')]
  },
  {
    name: 'WO3-P100 蓝色纳米氧化钨',
    org: '上海沪正实业有限公司',
    form: '粉体',
    subs: ['dc-1'],
    verification: 'official',
    summary: '以高纯 WO₃ 经高温烧结、杂化萃取制得的蓝色纳米粉体，官网称对近 900 nm 近红外有强烈吸收。粒径与纯度值以图片形式给出，正文未列数值，因此这里按规则标注"参数未公开（图内）"而不擅自转录。',
    specs: { 外观: '蓝色纳米粉体', 吸收峰: '近 900 nm 强吸收（官网口径）', '粒径/纯度': '参数未公开（图内）' },
    tags: ['粉体', '氧化钨'],
    sources: [S('沪正实业 WO3-P100 产品页', 'http://chhzsy.com/product/gere/41.html')]
  },
  {
    name: '铯钨青铜隔热母粒（PP / PC 载体）',
    org: '杭州市吉康新材料有限公司',
    form: '塑料母粒',
    subs: ['dc-2', 'dc-4'],
    verification: 'media',
    summary: '把纳米铯钨青铜预分散进 PP、PC 等塑料母粒，供注塑/挤出直接成型为具有近红外遮蔽能力的透明件：800–1200 nm 吸收、380–780 nm 高透过。相比涂料与膜，母粒路线省掉后段涂布工序，适合车用与建材透明件。',
    specs: { 载体: 'PP / PC', 含量: '≥99.9%（页面标注）', 吸收波段: '800–1200 nm', 透过波段: '380–780 nm' },
    tags: ['母粒', '注塑'],
    sources: [S('有色网 铯钨青铜母粒报道', 'https://b.smm.cn/info/619650')]
  },
  {
    name: 'CWO™ 纳米胶囊',
    org: '住友金属矿山株式会社',
    form: '纳米胶囊浆料 / 树脂添加',
    subs: ['dc-2'],
    verification: 'official',
    summary:
      '把 CWO 包进纳米胶囊以提高在树脂中的分散稳定性，官网称 CWO 浓度最高可做到 40 wt.%，封装采用 miniemulsion 聚合工艺，并与山形大学川口研究室合作。这是日系原料从"卖粉"走向"卖可直接投料的中间体"的信号，也解释了为什么上游厂商更愿意卖浆料而非粉体。',
    specs: { 'CWO 浓度': '最高 40 wt.%', 封装工艺: 'miniemulsion 聚合', 合作方: '山形大学川口研究室', 形态: '纳米胶囊浆料' },
    tags: ['浆料', '纳米胶囊', '日系'],
    sources: [S('住友金属矿山 CWO 纳米胶囊页', 'https://crossmining.smm-g.com/co-creation/nir_absorbing_materials_04/')]
  },
  {
    name: '威固纳米陶瓷膜（VDE / 闪电威系列）',
    org: '首诺国际贸易（上海）有限公司（威固 V-KOOL 中国）',
    form: '汽车窗膜',
    subs: ['dc-4'],
    verification: 'official',
    summary: '威固主推的"纳米陶瓷膜"，官网强调不含金属、不屏蔽信号（手机/ETC/GPS/WiFi），UV 阻隔≥99%。但官网只给技术名与效果，**未公开配方**，无法确认其近红外吸收剂是铯钨青铜、ATO 还是其他体系——这类"品牌可见、配方不可见"的条目在本库统一标为成分未公开。',
    specs: { 技术名: 'XIR™ / 纳米陶瓷', 'UV 阻隔': '≥99%（官网口径）', 信号影响: '宣称不影响手机/ETC/GPS/WiFi', 成分: '未公开配方' },
    tags: ['窗膜', '成分未公开'],
    sources: [S('威固中国 产品页', 'https://www.v-kool.cn/index.php/product/shop.html')]
  }
];

export const DC_STANDARDS_EXT = [
  {
    name: 'GB/T 39749-2021 中空玻璃隔热保温性能评价方法及分级',
    nameEn: 'GB/T 39749-2021',
    org: '国家市场监督管理总局 / 国家标准化管理委员会',
    role: '国家标准（发布 2021-03-09 / 实施 2022-02-01）',
    year: '2021',
    subs: ['dc-4', 'dc-3'],
    verification: 'official',
    summary: '给中空玻璃的隔热保温性能定"评价方法 + 等级"，是把材料参数落到整窗性能的关键标准。做隔热膜/隔热涂层与中空玻璃组合方案时，用它来界定"提升了几级"比只报 VLT 更有说服力。',
    tags: ['国家标准', '中空玻璃', '分级'],
    sources: [S('国家标准全文公开系统 GB/T 39749-2021', 'https://openstd.samr.gov.cn/bzgk/std/std_list?p.p1=2&p.p90=circulation_date&p.p91=desc&p.p2=%E9%9A%94%E7%83%AD')]
  },
  {
    name: 'T/CECS 750-2020 建筑反射隔热涂料应用技术规程',
    nameEn: 'T/CECS 750-2020',
    org: '中国工程建设标准化协会（主编：广东省建筑科学研究院集团）',
    role: '协会标准（批准 2020-08-25 / 施行 2021-01-01）',
    year: '2020',
    subs: ['dc-3'],
    verification: 'official',
    summary: '面向建筑反射隔热涂料的应用技术规程，由中国工程建设标准化协会第 685 号公告批准发布，广东省建筑科学研究院集团主编。属工程应用侧标准，规定了设计、施工与验收口径，是"涂料好不好"之外"用得对不对"的依据。',
    tags: ['协会标准', '工程应用'],
    sources: [S('中国工程建设标准化协会 公告', 'http://www.cecs.org.cn/xhbz/fbgg/11324.html')]
  },
  {
    name: 'GB/T 22476-2008 中空玻璃稳态 U 值（传热系数）的计算及测定',
    nameEn: 'GB/T 22476-2008',
    org: '国家标准化管理委员会',
    role: '国家标准（检测机构列为依据标准，页面未列日期）',
    year: '2008',
    subs: ['dc-4'],
    verification: 'official',
    summary: '中空玻璃稳态传热系数 U 值的计算与测定方法，出现在 CTC 苏州的玻璃检测能力清单中。U 值是把"隔热"量化成建筑能耗语言的核心指标，比单独的透过率更贴近实际节能量。',
    tags: ['国家标准', 'U值'],
    sources: [S('CTC 苏州 检测能力页', 'http://ctcsz.com/page.asp?cid=25')]
  },
  {
    name: 'JGJ/T 151-2008 建筑门窗玻璃幕墙热工计算规程',
    nameEn: 'JGJ/T 151-2008',
    org: '住房和城乡建设部',
    role: '行业标准（检测机构列为依据标准，页面未列日期）',
    year: '2008',
    subs: ['dc-4', 'dc-3'],
    verification: 'official',
    summary: '建筑门窗与玻璃幕墙的热工计算规程，是节能设计中把玻璃光学参数换算为整窗热工性能的常用依据，同样出现在 CTC 苏州的检测能力页。',
    tags: ['行业标准', '热工计算'],
    sources: [S('CTC 苏州 检测能力页', 'http://ctcsz.com/page.asp?cid=25')]
  },
  {
    name: 'GB 15763.3-2009 建筑用安全玻璃 第 3 部分：夹层玻璃',
    nameEn: 'GB 15763.3-2009',
    org: '国家标准化管理委员会',
    role: '强制性国家标准（检测机构列为依据标准）',
    year: '2009',
    subs: ['dc-4'],
    verification: 'official',
    summary: '夹层玻璃的安全要求。铯钨青铜若做成 PVB/EVA 夹层方案（上游厂商明确提到的路径之一），产品必须同时满足本标准的夹层安全要求，隔热性能之外不能绕过安全合规。',
    tags: ['强制性国标', '夹层玻璃'],
    sources: [S('CTC 苏州 检测能力页', 'http://ctcsz.com/page.asp?cid=25')]
  },
  {
    name: 'GB/T 11944-2012 中空玻璃',
    nameEn: 'GB/T 11944-2012',
    org: '国家标准化管理委员会',
    role: '国家标准（检测机构列为依据标准）',
    year: '2012',
    subs: ['dc-4'],
    verification: 'official',
    summary: '中空玻璃的产品标准。隔热膜/涂层与中空玻璃组合时，除功能层性能外还需满足本标准的密封与耐久要求。',
    tags: ['国家标准', '中空玻璃'],
    sources: [S('CTC 苏州 检测能力页', 'http://ctcsz.com/page.asp?cid=25')]
  }
];

/* =================================================================== 辐射制冷 · 扩展 */

export const RC_COMPANIES_EXT = [
  // ---- 上游功能填料 ----
  {
    name: '中科科优',
    country: '中国',
    region: '（站点未标注省市）',
    role: '单分散 SiO₂ 微球供应商',
    website: 'https://www.zhongkekeyou.cn',
    productHint: '单分散二氧化硅微球 / 光子晶体（20 nm–900 nm 多规格）',
    subs: ['rc-1'],
    verification: 'official',
    summary:
      '辐射制冷涂层里"Mie 散射"这一环的关键填料供应商，提供 20 nm 到 900 nm 多个粒径档的单分散二氧化硅微球与光子晶体。填料粒径直接决定太阳波段散射效率，是做 R>95% 白漆时最先要定的参数之一。',
    specs: { 产品: '单分散二氧化硅微球 / 光子晶体', 粒径档位: '20/50/100/200/300/400/500/600/700/800/900 nm 等' },
    tags: ['填料', 'SiO₂微球', '上游'],
    sources: [S('中科科优 单分散微球产品页', 'https://www.zhongkekeyou.cn/product-detail/cp23062101.html')]
  },
  {
    name: '郑州圣莱特空心微珠新材料有限公司',
    country: '中国',
    region: '河南 · 郑州',
    role: '空心玻璃微珠生产商',
    website: '',
    productHint: '空心玻璃微珠 HS38',
    subs: ['rc-1'],
    verification: 'b2b',
    summary:
      '空心玻璃微珠专业厂，HS38 在中国粉体网产品页挂牌，含密度、抗压强度等参数栏目。空心微珠既是轻质填料也是散射体，在屋面白色涂料里常与 TiO₂/BaSO₄ 复配使用。本条来源为行业门户产品页（未取得独立官网），故标 B2B 挂牌。',
    specs: { 产品: '空心玻璃微珠 HS38', 参数来源: '中国粉体网产品页', 官网: '未取得' },
    tags: ['填料', '空心微珠'],
    sources: [S('中国粉体网 圣莱特 HS38 页', 'https://www.cnpowder.com.cn/index/171964.html')]
  },
  {
    name: '龙佰集团股份有限公司',
    nameEn: 'LB Group',
    country: '中国',
    region: '河南',
    role: '钛白粉（TiO₂）生产商',
    website: 'https://www.lbgroup.com',
    productHint: '硫酸法 / 氯化法钛白粉颜料',
    subs: ['rc-1'],
    verification: 'official',
    summary:
      '国内钛白粉龙头，产品为硫酸法与氯化法钛白粉颜料，用于涂料、塑料、造纸、油墨与化纤。TiO₂ 是辐射制冷白色涂层里折射率最高的常用散射相之一，属于"上游的上游"——它的粒径与表面处理决定了涂层的太阳反射率上限。',
    specs: { 产品: '硫酸法 / 氯化法钛白粉', 下游: '涂料 / 塑料 / 造纸 / 油墨 / 化纤' },
    tags: ['填料', 'TiO₂', '上游'],
    sources: [S('龙佰集团 钛系列产品页', 'https://www.lbgroup.com/mproduct/10914')]
  },
  {
    name: '广东东方锆业科技股份有限公司',
    nameEn: 'Guangdong Orient Zirconic Ind Sci & Tech Co., Ltd.',
    country: '中国',
    region: '广东',
    role: '氧化锆（ZrO₂）及锆制品供应商',
    website: 'https://www.orientzr.com',
    productHint: '氧化锆系列（产品参数页未取证）',
    subs: ['rc-1'],
    verification: 'official',
    summary:
      '氧化锆及锆制品供应商。ZrO₂ 折射率高、化学稳定性好，是文献里常见的辐射制冷填料候选之一。本条只核到公司介绍页，产品参数页未取得，因此具体牌号与粒径不作记录。',
    specs: { 产品: '氧化锆系列', 参数: '未公开（参数页未取证）' },
    tags: ['填料', 'ZrO₂', '上游'],
    sources: [S('东方锆业 公司介绍页', 'https://www.orientzr.com/en/about-us')]
  },
  // ---- 基材与涂布设备 ----
  {
    name: '江苏双星彩塑新材料股份有限公司',
    country: '中国',
    region: '江苏 · 宿迁',
    role: 'BOPET / PET 薄膜基材厂',
    website: 'https://www.cpp.com.cn',
    productHint: '双向拉伸聚酯薄膜（辐射制冷卷材/膜的基材）',
    subs: ['rc-4'],
    verification: 'official',
    summary:
      '1997 年成立、2011 年深交所上市的双向拉伸薄膜企业，自述"中国双向拉伸薄膜产业基地"。辐射制冷卷材与贴膜都要在 PET/BOPET 基材上涂布，基材的平整度与耐候性直接决定成膜良率，属于膜环节绕不开的上游。',
    specs: { 产品: 'BOPET / PET 薄膜', 成立: '1997 年，2011 年上市', 定位: '中国双向拉伸薄膜产业基地（企业自述）' },
    tags: ['基材', 'PET', '上游'],
    sources: [S('双星彩塑 公司介绍', 'https://www.cpp.com.cn/home/about')]
  },
  {
    name: '宁波长阳科技股份有限公司',
    country: '中国',
    region: '浙江 · 宁波',
    role: '光学基膜 / PET 基膜厂',
    website: 'https://www.solartrontech.com',
    productHint: '光学基膜 OSA / OS 系列、OSE / OSG 系列',
    subs: ['rc-4'],
    verification: 'official',
    summary:
      '光学基膜与 PET 基膜供应商，产品含 OSA/OS 系列（光学涂布、印刷、扩散膜基材）与 OSE/OSG 系列，另有锂电隔膜与固态电解质导离子膜。辐射制冷膜若走"精密涂布"路线，这类光学级基膜是比通用 PET 更合适的起点。',
    specs: { 产品: '光学基膜 OSA/OS、OSE/OSG 系列', 其他: '锂电隔膜 / 固态电解质导离子膜' },
    tags: ['基材', '光学膜', '上游'],
    sources: [S('长阳科技 产品页', 'https://www.solartrontech.com/index.php/product/index.html?page=1')]
  },
  {
    name: '陕西北人印刷机械有限责任公司',
    country: '中国',
    region: '陕西',
    role: '涂布与镀膜设备厂',
    website: 'https://www.shaanxibeiren.com',
    productHint: 'CL80/120 涂布机（光学膜）、CL60 涂布机（窗膜 / 车衣膜）',
    subs: ['rc-2'],
    verification: 'official',
    summary:
      '涂布设备厂，CL80/120 面向光学膜涂布、CL60 明确标注应用领域为"窗膜、车衣膜"，承印材料覆盖 PET、铝塑复合膜等。辐射制冷与隔热膜能否量产，卡点常在涂布精度与干燥曲线，设备端是浆料环节的隐形上游。',
    specs: { 机型: 'CL80 / CL120 / CL60', 应用领域: '光学膜 / 窗膜 / 车衣膜', 承印材料: 'PET、铝塑复合膜、纸基、特殊膜类' },
    tags: ['设备', '涂布', '上游'],
    sources: [S('陕西北人 产品列表', 'https://www.shaanxibeiren.com/Mobile/List/index/cid/11.html')]
  },
  // ---- 国际玩家 ----
  {
    name: 'ラディクールジャパン株式会社',
    nameEn: 'Radi-Cool Japan Co., Ltd.',
    country: '日本',
    region: '东京 · 中央区日本桥',
    role: '辐射制冷涂料 / 膜 / 织物的日本市场与施工主体',
    website: 'https://radi-cool.co.jp',
    productHint: '放射冷却塗料（3 液仕様）、反射型シルバーフィルム、ウインドウフィルム、ファブリック',
    subs: ['rc-3', 'rc-4'],
    verification: 'official',
    summary:
      '把同一条辐射制冷技术做成涂料 / 膜 / 织物三种形态的日本落地主体，并与日产自动车合作开发车用涂料（涂布方法与层构成由日产承担）。它是目前公开参数最完整的辐射制冷涂料之一：日射反射率 94.4%、8–13 μm 放射率 90% 以上、最大冷却力 145 W/㎡、基本耐用年数 10 年——注意其"145 W/㎡ 最大冷却力"是涂料口径，不能与整窗/整机性能直接对比。',
    specs: { 形态: '涂料 / 膜 / 织物三种', 合作: '日产自动车（车用涂料）', 参数完整度: '公开 R / ε / 冷却力 / 寿命' },
    tags: ['日系', '涂料', '膜', '织物'],
    sources: [
      S('Radi-Cool Japan 产品总览', 'https://radi-cool.co.jp/products/'),
      S('Radi-Cool Japan 涂料页', 'https://radi-cool.co.jp/products/paint/')
    ]
  },
  {
    name: 'SolCold Ltd.',
    nameEn: 'SolCold',
    country: '以色列',
    region: '—',
    role: '被动冷却涂层',
    website: 'https://www.solcold.co',
    productHint: 'Glacier cooling coating',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '以色列被动冷却涂层公司，产品名 Glacier，官网口径为"无需电力即可获得 90–170 W/m² 冷却功率""比阴影处低 7℃"。这条数据是**冷却功率**而非温降，与国内厂商普遍报的"表面降 20–40℃"口径不同，横向对比时必须先统一口径。',
    specs: { 产品: 'Glacier cooling coating', 冷却功率: '90–170 W/m²（无需电力）', 温降口径: '比阴影处低 7℃' },
    tags: ['以色列', '涂层', '口径差异'],
    sources: [S('SolCold 官网', 'https://www.solcold.co/')]
  },
  // ---- 中国厂商 ----
  {
    name: '郑州优波科新材料股份有限公司',
    country: '中国',
    region: '河南 · 郑州',
    role: '水性辐射制冷 / 隔热涂料生产商',
    website: 'https://www.uoboc.com',
    productHint: '蒙自复合纳米辐射制冷涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '水性辐射制冷涂料厂商，"蒙自"牌复合纳米辐射制冷涂料给出 TSR≥95%、8–13 μm 发射率 94%、外表面降温 20–40℃、内部降温 5–10℃、综合节能 15–40%、效果不低于 10 年的一整套口径，核心颜填料为复合陶瓷微晶 + 高带隙纳米无机光子晶体。是国内公开参数较完整的涂料之一。',
    specs: { 代表产品: '蒙自复合纳米辐射制冷涂料', 'TSR': '≥95%（页面口径）', 发射率: '94%（8–13μm）', 温降: '外表面 20–40℃，内部 5–10℃', 有效期: '不低于 10 年' },
    tags: ['涂料', '水性', '参数完整'],
    sources: [S('优波科 蒙自复合纳米辐射制冷涂料页', 'https://www.uoboc.com/cyproductlist_details/c-chanpinid%3D1413105463561703424%26_detailId%3D%E5%A4%8D%E5%90%88%E7%BA%B3%E7%B1%B3%E8%BE%90%E5%B0%84%E5%88%B6%E5%86%B7%E6%B6%82%E6%96%99%26_seoDetailId%3D%E4%B9%8C%E6%B5%B7.html')]
  },
  {
    name: '陕西邦希化工有限公司',
    country: '中国',
    region: '陕西',
    role: '水性工业涂料企业（辐射制冷涂料研发）',
    website: 'http://bangxihg.com',
    productHint: '与香港理工大学合作的辐射制冷涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '水性工业涂料企业，公开与香港理工大学合作开发辐射制冷涂料（表述为"具有较高反射率和大气窗口发射率"），并与西北工业大学合作水性陶瓷基特种涂料。属"涂料厂 + 高校"联合开发模式，具体产品参数未公开。',
    specs: { 合作: '香港理工大学 / 西北工业大学', 参数: '未公开' },
    tags: ['涂料', '产学研'],
    sources: [S('邦希化工 技术合作页', 'http://bangxihg.com/m.php?c=article&id=218')]
  },
  {
    name: '墨光新能科技（苏州）有限公司',
    country: '中国',
    region: '江苏 · 苏州工业园区',
    role: '辐射制冷涂料 / 纤维膜 / 超结构薄膜研发制造商',
    website: 'https://www.moguangxn.com',
    productHint: '微纳结构辐射制冷涂料、高透保护膜、纺丝纤维膜、超结构薄膜',
    subs: ['rc-3', 'rc-4'],
    verification: 'official',
    summary:
      '以微纳结构设计为核心的辐射制冷材料公司，产品横跨涂料、纤维膜、超结构薄膜与高透保护膜，公开指标为太阳反射率 >96%、长波红外发射率 >97%，并给出 39.5 tCO₂/t 的全生命周期减排口径。把"光学设计"与"碳减排"一起报，是国内较少见的产品叙事。',
    specs: { 太阳反射率: '>96%（页面口径）', 长波红外发射率: '>97%', 减排口径: '最大 39.5 tCO₂/t 全生命周期', 产品形态: '涂料 / 纤维膜 / 超结构薄膜 / 高透保护膜' },
    tags: ['涂料', '膜', '微纳结构'],
    sources: [S('墨光新能 辐射制冷涂料页', 'https://www.moguangxn.com/product_detail.asp?id=1722')]
  },
  {
    name: '深圳市唯特偶新材料股份有限公司',
    country: '中国',
    region: '广东 · 深圳',
    role: '电子装联材料企业（延伸至辐射制冷涂料）',
    website: 'https://www.szvital.com',
    productHint: '水性氟碳改性乳液辐射制冷涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '深交所创业板上市公司（301319），主业电子装联材料，近年延伸到辐射制冷涂料：氟碳改性乳液基料 + 反射隔热组分 + 防锈颜料 + 功能填料，水性单组份、低 VOC。它的参数页是本轮调研中**唯一逐项标注检测依据标准**的（太阳反射比按 T/CECS 10378-2024、近红外反射比按 JG/T 235-2014），可比性最强。',
    specs: { 体系: '水性氟碳改性乳液，单组份', 太阳反射比: '≥92%（T/CECS 10378-2024）', 近红外反射比: '≥0.85（JG/T 235-2014）', 固含量: '50%±2%', 耐老化: '1000 h 不起泡/不开裂/不粉化', 使用年限: '8 年' },
    tags: ['涂料', '检测依据完整', '上市公司'],
    sources: [S('唯特偶 辐射制冷材料页', 'https://www.szvital.com/productinfo/315951.html')]
  },
  {
    name: '重庆蓝叶子新材料有限公司',
    country: '中国',
    region: '重庆',
    role: '反射隔热 + 辐射制冷涂料生产商',
    website: 'https://www.lanyezi.com.cn',
    productHint: '辐射制冷涂料系列 / 反射隔热涂料系列',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '同时做反射隔热与辐射制冷两条产品线的重庆涂料企业，原理表述为标准口径（8–13 μm 高红外发射 + 高太阳反射、24 小时零能耗），但产品页未公开 R/ε 数值，属"有原理、无参数"类型。',
    specs: { 产品线: '辐射制冷涂料 / 反射隔热涂料', 参数: '未公开（仅原理表述）' },
    tags: ['涂料'],
    sources: [S('蓝叶子 辐射制冷涂料页', 'https://www.lanyezi.com.cn/page97.html?article_id=128')]
  },
  {
    name: '江西银杉超材科技股份有限公司',
    country: '中国',
    region: '江西 · 安福',
    role: '无机辐射制冷涂料 + 超高性能混凝土（专利主体）',
    website: '',
    productHint: 'CN121108788B 无机辐射制冷涂料、CN122725754A 辐射制冷 UHPC',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '2013 年成立的无机材料企业（注册资本 4576 万元），围绕"无机辐射制冷涂料"与"辐射制冷超高性能混凝土"布局了三件专利（详见标准与专利维度）。它的技术路线与有机涂料不同：以白色硫铝酸盐水泥为成膜基体 + 表面处理无机功能填料，适合混凝土/屋面这类无机基面。',
    specs: { 技术路线: '无机（硫铝酸盐水泥基 + 无机功能填料）', 专利: 'CN121108788B / CN122725754A / CN122521181A', 官网: '未取证' },
    tags: ['无机涂料', '专利主体', '混凝土'],
    sources: [S('网易 银杉超材专利报道', 'https://www.163.com/dy/article/L6S3PHFK05568W0A.html')]
  },
  {
    name: '三棵树涂料股份有限公司',
    country: '中国',
    region: '福建',
    role: '建筑涂料企业（辐射制冷产品线）',
    website: '',
    productHint: '高反射白色基涂 + 微纳发射功能填料',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '建筑涂料龙头之一，辐射制冷路线为"高反射白色基涂 + 微纳发射功能填料"，通过调整粒径分布与膜层结构提升红外辐射效率。信息仅有媒体单源（搜狐），官网产品页未取证，故标为媒体口径。',
    specs: { 技术路线: '高反射基涂 + 微纳发射填料', 证据强度: '媒体单源，官网未取证' },
    tags: ['涂料', '媒体单源'],
    sources: [S('搜狐 辐射制冷涂料企业综述', 'https://www.sohu.com/a/945047320_777213')]
  },
  {
    name: '嘉宝莉化工集团股份有限公司',
    country: '中国',
    region: '广东',
    role: '功能涂层企业',
    website: '',
    productHint: '纳米自洁无电制冷涂料',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '功能涂层企业，其"纳米自洁无电制冷涂料"引入光催化型纳米粒子，实现自清洁 + 降温双效。同样只有媒体单源，参数未公开。',
    specs: { 产品: '纳米自洁无电制冷涂料', 特性: '光催化自清洁 + 降温', 证据强度: '媒体单源' },
    tags: ['涂料', '自清洁', '媒体单源'],
    sources: [S('搜狐 辐射制冷涂料企业综述', 'https://www.sohu.com/a/945047320_777213')]
  },
  {
    name: '阿克苏诺贝尔（AkzoNobel）',
    nameEn: 'AkzoNobel',
    country: '荷兰',
    region: '在华运营',
    role: '全球涂料巨头（外墙隔热 / 辐射制冷体系）',
    website: '',
    productHint: '反射 + 辐射协同制冷系统',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '跨国涂料企业，其建筑体系主打"高反射颜料 + 远红外发射添加剂"的反射辐射协同方案，面向建筑节能与工业屋面。本条为媒体单源，未见官网产品页，仅作市场位置参考。',
    specs: { 路线: '反射 + 辐射协同', 证据强度: '媒体单源' },
    tags: ['涂料', '跨国', '媒体单源'],
    sources: [S('搜狐 辐射制冷涂料企业综述', 'https://www.sohu.com/a/945047320_777213')]
  },
  // ---- 科研与检测 ----
  {
    name: '华中科技大学 杨荣贵教授团队（X-Thermal）',
    nameEn: 'Huazhong University of Science and Technology',
    country: '中国',
    region: '湖北 · 武汉',
    role: '科研团队（PDRC 奠基性工作团队之一）',
    website: 'http://faculty.hust.edu.cn/YANGRONGGUI/',
    productHint: '辐射制冷材料与热辐射调控研究；T/ZZB 2304-2021 起草人',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '杨荣贵教授团队是辐射制冷领域的奠基性团队之一（MIT 机械工程博士，曾任科罗拉多大学博尔德分校终身正教授），同时是 T/ZZB 2304-2021《辐射致（制）冷膜》的起草人之一。看这条赛道的技术走向，跟着这类团队的标准参与和论文方向比看厂商宣传更有效。',
    specs: { 负责人: '杨荣贵', 背景: 'MIT 博士 / 前科罗拉多大学终身正教授', 标准参与: 'T/ZZB 2304-2021 起草人' },
    tags: ['科研团队', '标准起草'],
    sources: [S('华中科大 杨荣贵教授主页', 'http://faculty.hust.edu.cn/YANGRONGGUI/zh_CN/more/2153398/jsjjgd/')]
  },
  {
    name: '南京大学 光热调控研究中心（朱嘉教授）',
    nameEn: 'Nanjing University, Research Center for Photothermal Regulation',
    country: '中国',
    region: '江苏 · 南京',
    role: '科研团队',
    website: 'https://zlab.nju.edu.cn',
    productHint: '辐射制冷、界面光蒸发、锂钠光学',
    subs: ['rc-1'],
    verification: 'official',
    summary:
      '2013 年由朱嘉教授创立的研究中心，方向含辐射制冷、界面光蒸发与锂钠光学，已获国家授权专利 18 项并有部分成果转化。填料体系（等离激元/微纳结构）的很多设计思路来自这类团队。',
    specs: { 成立: '2013 年', 方向: '辐射制冷 / 界面光蒸发 / 锂钠光学', 专利: '国家授权 18 项（页面口径）' },
    tags: ['科研团队', '微纳结构'],
    sources: [S('南大 光热调控研究中心', 'https://zlab.nju.edu.cn/57074/list.htm')]
  },
  {
    name: '天府兴隆湖实验室',
    nameEn: 'Tianfu Xinglong Lake Laboratory',
    country: '中国',
    region: '四川 · 成都',
    role: '科研机构 + 辐射制冷产品转化',
    website: 'http://www.xlll.cn',
    productHint: '辐射制冷涂料（反射率 >94%）',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '同时做科研与产品转化的实验室，公开产品页称其辐射制冷涂料"超过 94% 的反射率"，并对外招募辐射制冷产品合作伙伴。它也是 T/SXCIES 003-2026《被动式辐射制冷涂层》的起草参与方之一。',
    specs: { 产品: '辐射制冷涂料', 反射率: '>94%（页面口径）', 标准参与: 'T/SXCIES 003-2026 起草方' },
    tags: ['科研机构', '成果转化'],
    sources: [S('天府兴隆湖实验室 产品页', 'http://www.xlll.cn/index.php?m=content&c=index&a=show&catid=35&id=372')]
  },
  {
    name: '重庆大学（T/CECS 10378-2024 负责起草单位）',
    nameEn: 'Chongqing University',
    country: '中国',
    region: '重庆',
    role: '科研机构（标准负责起草）',
    website: '',
    productHint: 'T/CECS 10378-2024《建筑用辐射致冷涂料》负责起草',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '《建筑用辐射致冷涂料》（T/CECS 10378-2024）的负责起草单位，参加起草含中国建筑科学研究院等。该标准是辐射制冷涂料进入建筑工程体系的关键"话语入口"，也是唯特偶等厂商标注检测依据的来源。',
    specs: { 标准角色: 'T/CECS 10378-2024 负责起草单位', '发布/实施': '2024-05-16 / 2024-10-01' },
    tags: ['科研机构', '标准负责起草'],
    sources: [S('标准平台 T/CECS 10378-2024 起草单位', 'https://ndls.cnis.ac.cn/standard/detail/c7929628fd0c2bbda5ca47d3570f0c89')]
  }
];

export const RC_PRODUCTS_EXT = [
  {
    name: '放射冷却塗料（3 液仕様 / 2 液混合型）',
    org: 'ラディクールジャパン株式会社',
    form: '涂料（底漆弱溶剂环氧 + 中涂/面涂水性丙烯酸）',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '目前公开参数最完整的辐射制冷涂料之一：日射反射率 94.4%、紫外线遮蔽 99.9%、8–13 μm 放射率 90% 以上、最大冷却力 145 W/㎡、基本耐用年数 10 年。三层体系（底漆 + 中涂 + 面涂）说明它对基面处理有明确要求，不是单层刷涂就能达标。',
    specs: { 日射反射率: '94.4%', 紫外线遮蔽率: '99.9%', '8–13μm放射率': '90% 以上', 最大冷却力: '145 W/㎡', 耐用年数: '10 年（基本）', 体系: '底漆 + 中涂 + 面涂' },
    tags: ['涂料', '日系', '参数完整'],
    sources: [S('Radi-Cool Japan 涂料页', 'https://radi-cool.co.jp/products/paint/')]
  },
  {
    name: '放射冷却反射型シルバーフィルム / 放射冷却型ウインドウフィルム',
    org: 'ラディクールジャパン株式会社',
    form: '膜（金属面用银色反射膜 / 玻璃面用窗膜）',
    subs: ['rc-4'],
    verification: 'official',
    summary:
      '把与涂料同源的技术做成膜形态，分金属面用的银色反射膜与玻璃面用的窗膜。页面沿用涂料的 94.4% / 90% 以上 / 145 W/㎡ 指标，但膜的单体定量参数未在该页公开，因此这里不把涂料数据当作膜的性能引用。',
    specs: { 形态: '银色反射膜 / 窗膜', 定量参数: '未公开（页面沿用涂料口径）' },
    tags: ['膜', '日系'],
    sources: [S('Radi-Cool Japan 产品总览', 'https://radi-cool.co.jp/products/')]
  },
  {
    name: 'Glacier cooling coating',
    org: 'SolCold Ltd.',
    form: '被动冷却涂层',
    subs: ['rc-3'],
    verification: 'official',
    summary: '官网口径：无需电力即可获得 90–170 W/m² 冷却功率，可比阴影处低 7℃。注意这是"冷却功率 + 相对阴影温降"，与国内常见的"表面绝对温降"不是同一口径。',
    specs: { 冷却功率: '90–170 W/m²', 温降: '比阴影处低 7℃', 通电需求: '无需电力' },
    tags: ['涂层', '以色列', '口径差异'],
    sources: [S('SolCold 官网', 'https://www.solcold.co/')]
  },
  {
    name: '蒙自复合纳米辐射制冷涂料',
    org: '郑州优波科新材料股份有限公司',
    form: '水性涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '国产涂料里少见地把"反射率—发射率—温降—节能量—寿命"五段都写全的产品：TSR≥95%、8–13 μm 发射率 94%、外表面降 20–40℃、内部降 5–10℃、综合节能 15–40%、效果不低于 10 年。核心颜填料为复合陶瓷微晶 + 高带隙纳米无机光子晶体。',
    specs: { 'TSR': '≥95%', 发射率: '94%（8–13μm）', 温降: '外表面 20–40℃ / 内部 5–10℃', 节能: '15–40%（企业口径）', 有效期: '不低于 10 年' },
    tags: ['涂料', '参数完整'],
    sources: [S('优波科 产品页', 'https://www.uoboc.com/cyproductlist_details/c-chanpinid%3D1413105463561703424%26_detailId%3D%E5%A4%8D%E5%90%88%E7%BA%B3%E7%B1%B3%E8%BE%90%E5%B0%84%E5%88%B6%E5%86%B7%E6%B6%82%E6%96%99%26_seoDetailId%3D%E4%B9%8C%E6%B5%B7.html')]
  },
  {
    name: 'ZS-223 热反射自清洁隔热辐射制冷涂料',
    org: '北京志盛威华化工有限公司',
    form: '涂料（超疏水自洁）',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '与同厂 ZS-411 并列的另一条产品线：采用尖晶石结构粉体，加权反射率 93% 以上，适用建筑表面、设备柜、变压器、储罐、管道与光伏背板。发射率未公开——这类"只报反射率不报发射率"的宣传在行业里很常见，判断辐射制冷效果时两者缺一不可。',
    specs: { 粉体体系: '尖晶石结构粉体', 加权反射率: '93% 以上', 发射率: '未公开', 应用: '建筑 / 设备柜 / 变压器 / 储罐 / 管道 / 光伏背板' },
    tags: ['涂料', '工业', '参数缺失'],
    sources: [S('志盛威华 ZS-223 产品页', 'https://www.bjzswh168.com/news/show665912.html')]
  },
  {
    name: '辐射制冷材料（水性氟碳改性乳液体系）',
    org: '深圳市唯特偶新材料股份有限公司',
    form: '水性单组份涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '本轮调研中唯一把每一项性能都挂上检测依据标准的产品页：太阳反射比 ≥92%（T/CECS 10378-2024）、近红外反射比 ≥0.85（JG/T 235-2014）、固含 50%±2%、密度 1.0–1.6 g/cm³、耐老化 1000 h 不起泡不开裂不粉化、使用年限 8 年。做参数对比时，这类标注依据的数据才算"可比值"。',
    specs: { 太阳反射比: '≥92%（T/CECS 10378-2024）', 近红外反射比: '≥0.85（JG/T 235-2014）', 固含量: '50%±2%', 密度: '1.0–1.6 g/cm³', 耐老化: '1000 h 合格', 使用年限: '8 年' },
    tags: ['涂料', '检测依据完整'],
    sources: [S('唯特偶 辐射制冷材料页', 'https://www.szvital.com/productinfo/315951.html')]
  },
  {
    name: '基于微纳结构的辐射制冷涂料',
    org: '墨光新能科技（苏州）有限公司',
    form: '涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary: '太阳反射率 >96%、长波红外发射率 >97%，通过 8–13 μm 大气窗口高效辐射；同时报出最大 39.5 tCO₂/t 的全生命周期减排。',
    specs: { 太阳反射率: '>96%', 长波红外发射率: '>97%', 减排: '39.5 tCO₂/t（全生命周期，企业口径）' },
    tags: ['涂料', '微纳结构'],
    sources: [S('墨光新能 产品页', 'https://www.moguangxn.com/product_detail.asp?id=1722')]
  },
  {
    name: '辐射制冷涂料（天府兴隆湖实验室产品）',
    org: '天府兴隆湖实验室',
    form: '涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary: '页面仅给"超过 94% 的反射率"，发射率未公开。实验室同时在招募辐射制冷产品合作伙伴，属于"科研成果 + 产业化接口"并行的形态。',
    specs: { 反射率: '>94%（页面口径）', 发射率: '未公开' },
    tags: ['涂料', '科研转化'],
    sources: [S('天府兴隆湖实验室 产品页', 'http://www.xlll.cn/index.php?m=content&c=index&a=show&catid=35&id=372')]
  },
  {
    name: '辐射制冷涂料系列 / 反射隔热涂料系列',
    org: '重庆蓝叶子新材料有限公司',
    form: '涂料',
    subs: ['rc-3'],
    verification: 'official',
    summary: '产品页只给原理表述（8–13 μm 高红外发射 + 高太阳反射、24 小时零能耗），R/ε 数值未公开。属"有技术叙事、无实测参数"的类型，引用时需另行索取检测报告。',
    specs: { 参数: '未公开（仅原理表述）' },
    tags: ['涂料', '参数缺失'],
    sources: [S('蓝叶子 辐射制冷涂料页', 'https://www.lanyezi.com.cn/page97.html?article_id=128')]
  },
  {
    name: '纳米自洁无电制冷涂料',
    org: '嘉宝莉化工集团股份有限公司',
    form: '涂料',
    subs: ['rc-3'],
    verification: 'media',
    summary: '引入光催化型纳米粒子，实现自清洁与降温双效。仅有媒体单源，参数未公开。',
    specs: { 特性: '光催化自清洁 + 降温', 参数: '未公开', 证据强度: '媒体单源' },
    tags: ['涂料', '媒体单源'],
    sources: [S('搜狐 辐射制冷涂料企业综述', 'https://www.sohu.com/a/945047320_777213')]
  },
  {
    name: '单分散二氧化硅微球（20 nm–900 nm）',
    org: '中科科优',
    form: '填料（微球）',
    subs: ['rc-1'],
    verification: 'official',
    summary: '提供 20 nm 至 900 nm 多档单分散 SiO₂ 微球与光子晶体结构。辐射制冷涂层的太阳波段散射效率由填料粒径分布决定，这类"按 nm 分档供应"的微球是配方的起点。',
    specs: { 材质: '二氧化硅', 粒径档位: '20/50/100/200/300/400/500/600/700/800/900 nm', 形态: '单分散微球 / 光子晶体' },
    tags: ['填料', 'SiO₂'],
    sources: [S('中科科优 产品页', 'https://www.zhongkekeyou.cn/product-detail/cp23062101.html')]
  },
  {
    name: '空心玻璃微珠 HS38',
    org: '郑州圣莱特空心微珠新材料有限公司',
    form: '填料（空心微珠）',
    subs: ['rc-1'],
    verification: 'b2b',
    summary: '空心玻璃微珠，在中国粉体网挂牌并给出密度、抗压强度等参数栏目。空心微珠兼具轻质与散射功能，常与 TiO₂/BaSO₄ 复配用于屋面白色涂层。',
    specs: { 产品: 'HS38', 来源: '中国粉体网挂牌页', 参数栏目: '密度 / 抗压强度等' },
    tags: ['填料', '空心微珠'],
    sources: [S('中国粉体网 HS38 页', 'https://www.cnpowder.com.cn/index/171964.html')]
  },
  {
    name: '光学基膜 OSA / OS 系列',
    org: '宁波长阳科技股份有限公司',
    form: '基膜（PET 光学级）',
    subs: ['rc-4'],
    verification: 'official',
    summary: '面向光学涂布、印刷与扩散膜基材的 PET 基膜系列，另有 OSE/OSG 系列。辐射制冷膜若走精密涂布路线，光学级基膜比通用 PET 更适合作为起点。',
    specs: { 产品: 'OSA / OS / OSE / OSG 系列', 用途: '光学涂布 / 印刷 / 扩散膜基材' },
    tags: ['基材', 'PET', '光学级'],
    sources: [S('长阳科技 产品页', 'https://www.solartrontech.com/index.php/product/index.html?page=1')]
  },
  {
    name: 'CL60 涂布机（窗膜 / 车衣膜）',
    org: '陕西北人印刷机械有限责任公司',
    form: '设备（涂布机）',
    subs: ['rc-2'],
    verification: 'official',
    summary: '应用领域明确标注"窗膜、车衣膜"的涂布设备，承印材料含 PET 与铝塑复合膜；同厂 CL80/120 面向光学膜涂布。辐射制冷卷材的良率与涂布精度、干燥曲线强相关，设备端常被忽略但是量产瓶颈。',
    specs: { 机型: 'CL60（窗膜/车衣膜）、CL80/CL120（光学膜）', 承印材料: 'PET / 铝塑复合膜 / 纸基 / 特殊膜类' },
    tags: ['设备', '涂布'],
    sources: [S('陕西北人 产品列表', 'https://www.shaanxibeiren.com/Mobile/List/index/cid/11.html')]
  }
];

export const RC_STANDARDS_EXT = [
  {
    name: 'T/CECS 10378-2024 建筑用辐射致冷涂料',
    nameEn: 'T/CECS 10378-2024',
    org: '中国工程建设标准化协会（负责起草：重庆大学）',
    role: '协会标准（发布 2024-05-16 / 实施 2024-10-01）',
    year: '2024',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '目前唯一专门针对"建筑用辐射致冷涂料"的协会标准，由重庆大学负责起草、中国建筑科学研究院等参加起草。它的意义在于：厂商终于可以按同一份文件标"太阳反射比"和"发射率"，唯特偶的产品页已直接引用本标准作为检测依据。',
    tags: ['协会标准', '涂料', '检测依据'],
    sources: [
      S('标准平台 T/CECS 10378-2024', 'https://www.spc.org.cn/online/0304efb9362c957cb4d9fdbb46afe0fc.html'),
      S('标准平台 起草单位第二来源', 'https://ndls.cnis.ac.cn/standard/detail/c7929628fd0c2bbda5ca47d3570f0c89')
    ]
  },
  {
    name: 'CN121108788B 一种无机辐射制冷涂料及其制备方法和应用',
    nameEn: 'CN121108788B',
    org: '江西银杉超材科技股份有限公司',
    role: '发明专利（申请 2025-11-05 / 授权公告 2026-09-11）',
    year: '2026',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '无机路线的辐射制冷涂料专利：以白色硫铝酸盐水泥（20–40 份）为成膜基体，配合表面处理无机功能填料（30–50 份）。与有机乳液体系相比，无机路线更适配混凝土/屋面基面，耐候逻辑也不同。发明人黄安冲、吴帅、曾嵘。',
    specs: { 体系: '白色硫铝酸盐水泥 + 表面处理无机功能填料', 发明人: '黄安冲 / 吴帅 / 曾嵘', 授权公告: '2026-09-11' },
    tags: ['专利', '无机涂料'],
    sources: [S('网易 银杉超材专利报道', 'https://www.163.com/dy/article/L6S3PHFK05568W0A.html')]
  },
  {
    name: 'CN122521181A 一种含三维放射状稀土磷酸盐微球的被动辐射制冷涂料及其制备方法',
    nameEn: 'CN122521181A',
    org: '江西银杉超材科技股份有限公司',
    role: '发明专利申请（申请 2026-05-25 / 公开 2026-08-07）',
    year: '2026',
    subs: ['rc-1', 'rc-3'],
    verification: 'media',
    summary:
      '把"三维放射状稀土磷酸盐微球"作为功能填料的被动辐射制冷涂料专利。稀土磷酸盐是近年填料端的新方向（成本与光谱可调性），这条专利说明国内已有人在填料形貌层面做文章，而不只是调粒径分布。',
    specs: { 填料: '三维放射状稀土磷酸盐微球', 申请日: '2026-05-25', 公开日: '2026-08-07' },
    tags: ['专利', '稀土填料'],
    sources: [S('网易 银杉超材专利报道', 'https://www.163.com/dy/article/L6S3PHFK05568W0A.html')]
  },
  {
    name: 'CN122725754A 一种具有辐射制冷功能的白色超高性能混凝土及其制备方法',
    nameEn: 'CN122725754A',
    org: '江西银杉超材科技股份有限公司',
    role: '发明专利申请（申请 2026-06-12 / 公开 2026-09-11）',
    year: '2026',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '把辐射制冷功能直接做进超高性能混凝土（UHPC）本体，而不是表面涂层。若成立，屋面/路面可以"结构即功能"，省掉涂层维护；但也意味着功能相掺量要受力学性能约束。',
    specs: { 载体: '白色超高性能混凝土（UHPC）', 申请日: '2026-06-12', 公开日: '2026-09-11' },
    tags: ['专利', '混凝土', '结构一体化'],
    sources: [S('网易 银杉超材专利报道', 'https://www.163.com/dy/article/L6S3PHFK05568W0A.html')]
  }
];
