/**
 * 产业情报种子数据生成器
 *
 * 数据来源：2026-11-24 的公开渠道逐页核验（企业官网 / 政府与协会公示 / 招标平台 /
 * B2B 挂牌页 / 权威媒体）。每条记录都带至少一条来源 URL 与核验等级；
 * 凡公开渠道确实查不到的字段（价格、销量、销售额），一律留空并写入口径说明，
 * 不做估算、不插值。
 *
 * 用法： node tools/seed-records.mjs [--force]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  DC_COMPANIES_EXT,
  DC_PRODUCTS_EXT,
  DC_STANDARDS_EXT,
  RC_COMPANIES_EXT,
  RC_PRODUCTS_EXT,
  RC_STANDARDS_EXT
} from './seed-data-extra.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const ACCESSED = '2026-11-24';

const S = (title, url, kind = 'official') => ({ title, url, kind, accessed: ACCESSED });

/* =================================================================== 透明陶瓷隔热 */

const DC_COMPANIES = [
  {
    name: '住友金属矿山株式会社',
    nameEn: 'Sumitomo Metal Mining Co., Ltd.',
    country: '日本',
    region: '东京',
    role: '粉体 / 分散液 / 母粒',
    website: 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/',
    productHint: 'CWO®（铯掺杂氧化钨）、SOLAMENT®',
    subs: ['dc-1', 'dc-2', 'dc-3', 'dc-4'],
    verification: 'official',
    summary:
      '全球唯一公开完整 CsₓWO₃ 产品线文档的厂商。CWO® 为其铯掺杂氧化钨注册商标，产品含 MIBK／水／PGMAC 三种溶剂体系的分散液、可炼入 PVC/PP/PET 的分散粉，以及 YMF-02A、KHF-7AH 涂布液。官网称 CWO 属自研并宣称以 ITO 约 1/10 的添加量即可取得等效近红外遮蔽。相关物项受日本出口管理令管制。',
    specs: {
      注册商标: 'CWO® / SOLAMENT®',
      产品形态: '分散液 · 分散粉 · 涂布液 · 树脂母粒',
      分散介质: 'MIBK / 水 / PGMAC',
      出口管制: '日本出口管理令管制物项',
      公开报价: '无（需询价）'
    },
    tags: ['近红外吸收', '铯钨青铜', '日系原料'],
    sources: [S('住友金属矿山 近红外吸收材料（CWO/SOLAMENT）', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: '厦门中钨在线科技有限公司',
    nameEn: 'China Tungsten Online',
    country: '中国',
    region: '福建 · 厦门',
    role: '粉体 / 定制贸易',
    website: 'http://www.ctia.com.cn/product/tungsten-oxide-products/cesium-tungsten-bronze',
    productHint: 'Cs0.33WO3 目录条目',
    subs: ['dc-1'],
    verification: 'official',
    summary:
      '钨钼材料信息与贸易服务商，网站设有铯钨青铜（Cs0.33WO3）产品目录条目，可按需询价定制。页面未公开粒径、纯度、光学性能等参数。',
    specs: { 化学式: 'Cs0.33WO3', 公开参数: '页面未披露' },
    tags: ['钨钼贸易', '粉体'],
    sources: [S('中钨在线 铯钨青铜产品页', 'http://www.ctia.com.cn/product/tungsten-oxide-products/cesium-tungsten-bronze')]
  },
  {
    name: '宣城晶和环保新材料有限公司',
    country: '中国',
    region: '安徽 · 宣城',
    role: '粉体',
    website: 'http://www.jr05.cn/ProductInfo.aspx?PID=1341',
    productHint: 'Jr-CW18 纳米铯钨青铜粉体',
    subs: ['dc-1'],
    verification: 'official',
    summary:
      '国内纳米氧化物粉体供应商，Jr-CW18 为其铯钨青铜粉体型号，页面给出纯度、一次粒径、比表面积与成膜可见光透过率等参数，是中文侧少数公开了成膜光学指标的粉体页。',
    specs: { 纯度: '≥99.99%', 一次粒径: '10–50 nm（SEM）', 比表面积: '20–50 m²/g', 成膜VLT: '≥71%', 包装: '15 kg/桶' },
    tags: ['粉体', '高纯'],
    sources: [S('宣城晶和 Jr-CW18 产品页', 'http://www.jr05.cn/ProductInfo.aspx?PID=1341')]
  },
  {
    name: '宣城晶瑞新材料有限公司',
    country: '中国',
    region: '安徽 · 宣城',
    role: '粉体',
    website: 'http://www.cnpowder.com.cn/netshow/cp_197117.html',
    productHint: '铯钨青铜纳米粉体（型号同源）',
    subs: ['dc-1'],
    verification: 'b2b',
    summary:
      '经中国粉体网企业展台展示铯钨青铜纳米粉体，型号与晶和体系同源。两家企业的工商关联未取得官方文件，此处仅按页面信息登记，不作股权判断。',
    specs: { 展示平台: '中国粉体网', 参数来源: '平台页面' },
    tags: ['粉体', '平台展示'],
    sources: [S('中国粉体网 宣城晶瑞企业展台', 'http://www.cnpowder.com.cn/netshow/cp_197117.html')]
  },
  {
    name: '杭州吉康新材料有限公司',
    country: '中国',
    region: '浙江 · 杭州',
    role: '粉体',
    website: 'http://show.cnpowder.com.cn/zc1600/product_150069.html',
    productHint: 'SS-CW20 铯钨青铜粉体',
    subs: ['dc-1', 'dc-2'],
    verification: 'b2b',
    summary:
      'SS-CW20 为纳米铯钨青铜粉体，页面公开纯度、粒径、比表面积，并给出成膜后 800–2500 nm 透过率 13.5% 的光学指标，可用于推算浆料配方添加量。',
    specs: { 纯度: '≥99.99%', 一次粒径: '≈50 nm', 比表面积: '20–50 m²/g', 成膜VLT: '≥71%', '800–2500nm透过率': '13.5%', 包装: '25 kg/桶' },
    tags: ['粉体', '浆料原料'],
    sources: [S('中国粉体网 吉康 SS-CW20 产品页', 'http://show.cnpowder.com.cn/zc1600/product_150069.html')]
  },
  {
    name: '湖州久泰陶瓷材料有限公司',
    country: '中国',
    region: '浙江 · 湖州长兴',
    role: '粉体',
    website: 'https://www.360powder.com/market/details/50616.html',
    productHint: 'JT-CW20 / JT-CW30 / JT-CW50',
    subs: ['dc-1'],
    verification: 'b2b',
    summary:
      '按粒径分为 20/30/50 nm 三档，页面给出比表面积、近红外吸收率与成膜透过率，并标注涂料中添加量 0.1–1 wt%，是中文侧少见的按粒径分档供货的铯钨青铜粉体页。',
    specs: { 粒径档位: '20±5 / 30±5 / 50±10 nm', 比表面积: '≥60 / ≥40 / ≥25 m²/g', 近红外吸收: '>95%', 成膜VLT: '>70%', 涂料添加量: '0.1–1 wt%' },
    tags: ['粉体', '粒径分档'],
    sources: [S('360粉体网 久泰 JT-CW 系列', 'https://www.360powder.com/market/details/50616.html')]
  },
  {
    name: '杭州九朋新材料有限公司',
    country: '中国',
    region: '浙江 · 杭州',
    role: '粉体',
    website: 'https://www.jdzj.com/jiage/5_38090165.html',
    productHint: 'CY-XW30 铯钨青铜粉体',
    subs: ['dc-1'],
    verification: 'b2b',
    summary:
      'CY-XW30 页面给出油性涂膜添加 1–3% 时红外阻隔 95%、紫外阻隔 52%、可见光透过 78% 的实测口径，是少数直接给出涂膜级光学效果的中文页面。注意其粒径参数正文写 20–30 nm、参数表写 30–50 nm，存在自相矛盾，引用需回访核实。',
    specs: { 纯度: '99.9%', 比表面积: '20–50 m²/g', 红外阻隔: '95%', 紫外阻隔: '52%', 成膜VLT: '78%', 涂膜添加量: '1–3%', 粒径: '正文 20–30 nm / 参数表 30–50 nm（矛盾，待核验）' },
    tags: ['粉体', '油性体系', '参数存疑'],
    sources: [S('机电之家 九朋 CY-XW30 报价页', 'https://www.jdzj.com/jiage/5_38090165.html')]
  },
  {
    name: '南通众合化工新材料有限公司',
    country: '中国',
    region: '江苏 · 南通',
    role: '粉体 / 贸易',
    website: 'https://www.ntzhhgxcl.com/products/show34965595.html',
    productHint: '纳米铯钨青铜粉（CAS 189619-69-0）',
    subs: ['dc-1'],
    verification: 'official',
    summary:
      '自有网站在售纳米铯钨青铜粉体，标注纯度 0.99 与 CAS 号 189619-69-0，是中文侧少数给出 CAS 登记号的供应商页面。',
    specs: { 纯度: '0.99', CAS号: '189619-69-0', 公开报价: '￥1000/kg（页面挂牌）' },
    tags: ['粉体', '贸易'],
    sources: [S('南通众合 纳米铯钨青铜粉产品页', 'https://www.ntzhhgxcl.com/products/show34965595.html')]
  },
  {
    name: 'LTS Research Laboratories, Inc.',
    nameEn: 'LTS Research Laboratories, Inc.',
    country: '美国',
    region: '纽约州',
    role: '粉体',
    website: 'https://ltschem.com/product/POCSWO320003N',
    productHint: 'CsWO3 粉体（99.9%，-200 mesh）',
    subs: ['dc-1'],
    verification: 'official',
    summary:
      '美国实验室材料供应商，目录提供铯钨青铜粉体，标注纯度 99.9%、粒度 -200 mesh，面向科研小批量供货。',
    specs: { 纯度: '99.9%', 粒度: '-200 mesh' },
    tags: ['粉体', '科研供货'],
    sources: [S('LTS Research Laboratories CsWO3 产品页', 'https://ltschem.com/product/POCSWO320003N')]
  },
  {
    name: '共同印刷株式会社',
    nameEn: 'Kyodo Printing Co., Ltd.',
    country: '日本',
    region: '东京',
    role: '下游纤维 / 功能纺织品',
    productHint: 'CWO 功能纤维（与住友金属矿山、瀧定名古屋三社共创）',
    subs: ['dc-4'],
    verification: 'official',
    summary:
      '与住友金属矿山、瀧定名古屋三社联合开发含 CWO 的功能性纤维。信息来源为住友金属矿山官网的共创案例页（三社共同发布），本条按该页面登记。',
    specs: { 合作形态: '三社共创', 应用: '纤维 / 纺织品' },
    tags: ['下游应用', '纤维'],
    sources: [S('住友金属矿山 共创案例：CWO 功能纤维', 'https://crossmining.smm.co.jp/co-creation/nir_absorbing_materials_01/')]
  },
  {
    name: '瀧定名古屋株式会社',
    nameEn: 'Takisada Nagoya Co., Ltd.',
    country: '日本',
    region: '名古屋',
    role: '下游纤维 / 纺织品',
    productHint: 'CWO 功能纤维（三社共创）',
    subs: ['dc-4'],
    verification: 'official',
    summary: '与住友金属矿山、共同印刷三社共创 CWO 功能纤维，负责纤维与纺织环节。信息来源同上（住友金属矿山官网案例页）。',
    specs: { 合作形态: '三社共创', 环节: '纤维 / 纺织' },
    tags: ['下游应用', '纤维'],
    sources: [S('住友金属矿山 共创案例：CWO 功能纤维', 'https://crossmining.smm.co.jp/co-creation/nir_absorbing_materials_01/')]
  },
  {
    name: '江西善纳新材料有限公司',
    country: '中国',
    region: '江西',
    role: '粉体（待核验）',
    website: 'https://www.jxsunnano.com/',
    productHint: '纳米铯钨青铜（线索）',
    subs: ['dc-1'],
    verification: 'pending',
    summary:
      '列入铯钨青铜粉体供应商线索。抓取其官网时返回自定义状态码 319、正文无法读取，故本条仅作线索登记，产品与参数均未核实。',
    specs: { 核验状态: '官网抓取失败（状态码 319）' },
    tags: ['待核验', '线索'],
    sources: [S('江西善纳新材料 官网（抓取失败）', 'https://www.jxsunnano.com/')]
  },
  {
    name: '上海沪正实业有限公司',
    country: '中国',
    region: '上海 · 闵行',
    role: '纳米粉体 + 隔热母粒 / 分散液',
    website: 'http://www.chhzsy.com/',
    productHint: 'WO3-P100 蓝色纳米氧化钨、膜级/拉丝级隔热母粒',
    subs: ['dc-1', 'dc-3'],
    verification: 'official',
    summary:
      '国内较早做功能纳米材料与隔热母粒的企业，官网自述 20 年积累，产品含纳米 WO₃ 粉体（WO3-P100）、隔热与红外吸收系列、膜级与拉丝级母粒。此前登记的另两个域名（hznano.com / hzxcl.com.cn）解析异常，本条改以 chhzsy.com 与产品页为核实来源。',
    specs: { 代表产品: 'WO3-P100 蓝色纳米粉体', 产品线: '粉体 / 分散液 / 隔热母粒', 官网自述: '20 年功能纳米材料积累' },
    tags: ['粉体', '母粒', '隔热'],
    sources: [
      S('沪正实业 官网', 'http://www.chhzsy.com/'),
      S('沪正实业 WO3-P100 产品页', 'http://chhzsy.com/product/gere/41.html')
    ]
  }
];

const DC_PRODUCTS = [
  {
    name: 'CWO® 分散液（MIBK 溶剂型）',
    nameEn: 'CWO Dispersion (MIBK)',
    org: '住友金属矿山株式会社',
    form: '溶剂型分散液',
    subs: ['dc-2'],
    verification: 'official',
    summary: '以甲基异丁基酮（MIBK，CAS 108-10-1）为介质的铯钨青铜分散液，用于溶剂型近红外吸收涂层与膜层。属出口管理令管制物项，采购需合规审查。',
    specs: { 溶剂: 'MIBK', 'CAS(溶剂)': '108-10-1', 固含: '未公开（需索取数据表）' },
    tags: ['分散液', '溶剂型'],
    sources: [S('住友金属矿山 近红外吸收材料', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: 'CWO® 分散液（水系）',
    nameEn: 'CWO Dispersion (Water)',
    org: '住友金属矿山株式会社',
    form: '水性分散液',
    subs: ['dc-2'],
    verification: 'official',
    summary: '以水（CAS 7732-18-5）为介质的分散液，适配水性涂布工艺，VOC 负担低。具体固含与粒径分布需索取数据表。',
    specs: { 溶剂: '水', 'CAS(溶剂)': '7732-18-5', 固含: '未公开' },
    tags: ['分散液', '水性'],
    sources: [S('住友金属矿山 近红外吸收材料', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: 'CWO® 分散液（PGMAC 溶剂型）',
    nameEn: 'CWO Dispersion (PGMAC)',
    org: '住友金属矿山株式会社',
    form: '溶剂型分散液',
    subs: ['dc-2'],
    verification: 'official',
    summary: '以丙二醇甲醚醋酸酯（PGMAC，CAS 108-65-6）为介质的分散液，常用于对溶解性有要求的树脂体系。',
    specs: { 溶剂: 'PGMAC', 'CAS(溶剂)': '108-65-6', 固含: '未公开' },
    tags: ['分散液', '溶剂型'],
    sources: [S('住友金属矿山 近红外吸收材料', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: 'CWO® 分散粉',
    nameEn: 'CWO Dispersion Powder',
    org: '住友金属矿山株式会社',
    form: '粉体（含微量甲苯）',
    subs: ['dc-1'],
    verification: 'official',
    summary: '可直接炼入 PVC / PP / PET 等树脂的分散粉形态，官网注明含微量甲苯（CAS 108-88-3）。适合做母粒与挤出/注塑件。',
    specs: { 形态: '分散粉', 残留溶剂: '微量甲苯（CAS 108-88-3）', 适用树脂: 'PVC / PP / PET' },
    tags: ['粉体', '母粒原料'],
    sources: [S('住友金属矿山 近红外吸收材料', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: 'YMF-02A 涂布液',
    nameEn: 'YMF-02A Coating Liquid',
    org: '住友金属矿山株式会社',
    form: '涂布液',
    subs: ['dc-2', 'dc-3'],
    verification: 'official',
    summary: '面向涂布工艺的成品涂布液型号，官网提供数据表下载入口。本轮仅确认型号与页面存在，光学参数需下载数据表后核实，未取到数值。',
    specs: { 形态: '涂布液', 参数: '需下载数据表（本轮未取得）' },
    tags: ['涂布液', '近红外遮蔽'],
    sources: [S('住友金属矿山 近红外吸收材料', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: 'KHF-7AH 涂布液',
    nameEn: 'KHF-7AH Coating Liquid',
    org: '住友金属矿山株式会社',
    form: '涂布液',
    subs: ['dc-2', 'dc-3'],
    verification: 'official',
    summary: '另一款涂布液型号，与 YMF-02A 并列出现在官网产品线中，面向不同基材/工艺。具体参数需索取数据表。',
    specs: { 形态: '涂布液', 参数: '需下载数据表（本轮未取得）' },
    tags: ['涂布液'],
    sources: [S('住友金属矿山 近红外吸收材料', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: 'YMDS-874 PC 树脂练込母粒',
    nameEn: 'YMDS-874 PC Resin Compound',
    org: '住友金属矿山株式会社',
    form: '树脂母粒（PC 基）',
    subs: ['dc-2', 'dc-4'],
    verification: 'official',
    summary: '将 CWO 炼入聚碳酸酯的母粒型号，用于直接成型具有近红外遮蔽能力的透明树脂件（如车用与建筑用透明部件）。',
    specs: { 基材: 'PC（聚碳酸酯）', 形态: '练込母粒' },
    tags: ['母粒', 'PC', '车用'],
    sources: [S('住友金属矿山 近红外吸收材料', 'https://crossmining.smm.co.jp/material/nir_absorbing_materials/')]
  },
  {
    name: 'Jr-CW18 纳米铯钨青铜粉体',
    org: '宣城晶和环保新材料有限公司',
    form: '粉体',
    subs: ['dc-1'],
    verification: 'official',
    summary: '纯度 ≥99.99%，一次粒径 10–50 nm，比表面积 20–50 m²/g；页面给出制成膜后可见光透过率 ≥71%。15 kg/桶包装，适合涂料与浆料厂作为功能相采购。',
    specs: { 纯度: '≥99.99%', 一次粒径: '10–50 nm（SEM）', 比表面积: '20–50 m²/g', 成膜VLT: '≥71%', 包装: '15 kg/桶' },
    tags: ['粉体', '高纯'],
    sources: [S('宣城晶和 Jr-CW18 产品页', 'http://www.jr05.cn/ProductInfo.aspx?PID=1341')]
  },
  {
    name: 'SS-CW20 铯钨青铜粉体',
    org: '杭州吉康新材料有限公司',
    form: '粉体',
    subs: ['dc-1', 'dc-2'],
    verification: 'b2b',
    summary: '纯度 ≥99.99%、一次粒径 ≈50 nm、比表面积 20–50 m²/g；成膜后可见光透过率 ≥71%，800–2500 nm 透过率 13.5%。25 kg/桶。',
    specs: { 纯度: '≥99.99%', 一次粒径: '≈50 nm', 比表面积: '20–50 m²/g', 成膜VLT: '≥71%', '800–2500nm透过率': '13.5%', 包装: '25 kg/桶' },
    tags: ['粉体'],
    sources: [S('中国粉体网 吉康 SS-CW20', 'http://show.cnpowder.com.cn/zc1600/product_150069.html')]
  },
  {
    name: 'JT-CW20 / JT-CW30 / JT-CW50 铯钨青铜粉体',
    org: '湖州久泰陶瓷材料有限公司',
    form: '粉体（按粒径分三档）',
    subs: ['dc-1'],
    verification: 'b2b',
    summary: '按一次粒径 20/30/50 nm 分三档供货，对应比表面积 ≥60/≥40/≥25 m²/g；近红外吸收 >95%，成膜可见光透过 >70%，页面标注涂料添加量 0.1–1 wt%。',
    specs: { 粒径: '20±5 / 30±5 / 50±10 nm', 比表面积: '≥60 / ≥40 / ≥25 m²/g', 近红外吸收: '>95%', 成膜VLT: '>70%', 涂料添加量: '0.1–1 wt%' },
    tags: ['粉体', '粒径分档'],
    sources: [S('360粉体网 久泰 JT-CW 系列', 'https://www.360powder.com/market/details/50616.html')]
  },
  {
    name: 'CY-XW30 铯钨青铜粉体',
    org: '杭州九朋新材料有限公司',
    form: '粉体',
    subs: ['dc-1'],
    verification: 'b2b',
    summary: '纯度 99.9%，比表面积 20–50 m²/g；页面给出油性涂膜添加 1–3% 时红外阻隔 95%、紫外阻隔 52%、可见光透过 78%。粒径参数正文与参数表互相矛盾（20–30 nm vs 30–50 nm），引用前需向厂家确认。',
    specs: { 纯度: '99.9%', 比表面积: '20–50 m²/g', 红外阻隔: '95%', 紫外阻隔: '52%', 成膜VLT: '78%', 粒径: '20–30 nm / 30–50 nm（矛盾）' },
    tags: ['粉体', '参数存疑'],
    sources: [S('机电之家 九朋 CY-XW30', 'https://www.jdzj.com/jiage/5_38090165.html')]
  },
  {
    name: 'Cs0.33WO3 铯钨青铜粉体',
    org: '厦门中钨在线科技有限公司',
    form: '粉体',
    subs: ['dc-1'],
    verification: 'official',
    summary: '目录型产品条目，化学式标注 Cs0.33WO3，可按需询价与定制。页面未公开粒径、纯度、分散性等关键参数。',
    specs: { 化学式: 'Cs0.33WO3', 公开参数: '页面未披露' },
    tags: ['粉体'],
    sources: [S('中钨在线 铯钨青铜产品页', 'http://www.ctia.com.cn/product/tungsten-oxide-products/cesium-tungsten-bronze')]
  },
  {
    name: 'CsWO3 铯钨青铜粉体（科研级）',
    org: 'LTS Research Laboratories, Inc.',
    form: '粉体',
    subs: ['dc-1'],
    verification: 'official',
    summary: '面向科研小批量供货，纯度 99.9%，粒度 -200 mesh，未公开光学与分散性能参数。',
    specs: { 纯度: '99.9%', 粒度: '-200 mesh' },
    tags: ['粉体', '科研级'],
    sources: [S('LTS CsWO3 产品页', 'https://ltschem.com/product/POCSWO320003N')]
  }
];

const DC_STANDARDS = [
  {
    name: 'GB/T 2680-2021 建筑玻璃 可见光透射比、太阳光直接透射比、太阳能总透射比、紫外线透射比及有关窗参数的测定',
    nameEn: 'GB/T 2680-2021',
    org: '国家市场监督管理总局 / 国家标准化管理委员会',
    role: '国家标准（现行）',
    year: '2021（发布 2021-03-09 / 实施 2021-10-01）',
    subs: ['dc-4', 'dc-3'],
    verification: 'official',
    summary: '隔热膜与隔热玻璃光学性能的核心检测方法标准，VLT、TSER、紫外线透射比等指标均按此测定。厂商宣称的透过率/阻隔率若无法标明依据本标准，可信度需打折。',
    tags: ['检测方法', '光学性能'],
    sources: [S('国家标准全文公开系统 GB/T 2680-2021', 'https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=7C3C222353BC50D51B4100982CD81485')]
  },
  {
    name: 'JC/T 2388-2016 自洁隔热平板镀膜玻璃',
    nameEn: 'JC/T 2388-2016',
    org: '工业和信息化部（行业标准）',
    role: '行业标准（现行，备案号 55961-2016）',
    year: '2016（发布 2016-10-22 / 实施 2017-04-01）',
    subs: ['dc-4'],
    verification: 'official',
    summary: '面向自洁 + 隔热双重功能的平板镀膜玻璃产品标准。铯钨青铜体系若做成镀膜玻璃产品，可直接对标本标准的技术要求。',
    tags: ['产品标准', '镀膜玻璃'],
    sources: [S('标准信息公共服务平台 JC/T 2388-2016', 'https://hbba.sacinfo.org.cn/stdDetail/d5904f063d337a5971cce485c7cacc7f')]
  },
  {
    name: '《玻璃隔热涂料质量评定标准》（团体标准）',
    org: '中国玻璃隔热涂料产业联盟',
    role: '团体标准（标准号未在公开页披露）',
    year: '2019（发布 2019-04-01 / 实施 2019-06-01）',
    subs: ['dc-3'],
    verification: 'media',
    summary: '由产业联盟牵头制定的玻璃隔热涂料质量评定标准，用于统一该类涂料的评定口径。公开报道未披露标准号，引用时需向联盟索取正式文本。',
    tags: ['团体标准', '涂料'],
    sources: [S('中国玻璃网 标准发布报道', 'https://mip.glass.com.cn/glassnews/newsinfo_232127.html')]
  }
];

/* =================================================================== 辐射制冷 */

const RC_COMPANIES = [
  {
    name: 'SkyCool Systems, Inc.',
    nameEn: 'SkyCool Systems, Inc.',
    country: '美国',
    region: '加州 · Mountain View',
    role: '膜材 + 整机 / 系统集成',
    website: 'https://www.skycoolsystems.com/',
    productHint: 'SkyCool Film / Roof / Panel',
    subs: ['rc-4'],
    verification: 'official',
    summary:
      '源自斯坦福 Raman 团队（Nature 2014 辐射制冷论文）的产业化公司，产品包括膜材、屋面制品与板式散热面板，技术路线为 8–13 μm 选择性发射，宣称美国制造、不含 PFAS、面板 15 年寿命。官网未公开 R、ε 与净制冷功率数值。',
    specs: { 技术路线: '8–13 μm 选择性发射', 产品形态: '膜 / 屋面制品 / 面板', 公开参数: '未公开 R、ε、净功率' },
    tags: ['选择性发射', '系统集成'],
    sources: [S('SkyCool Systems 官网', 'https://www.skycoolsystems.com/'), S('SkyCool 技术说明', 'https://www.skycoolsystems.com/science')]
  },
  {
    name: 'SPACECOOL 株式会社',
    nameEn: 'SPACECOOL INC.',
    country: '日本',
    region: '东京 · 港区',
    role: '膜材 / 建材膜',
    website: 'https://spacecool.jp/',
    productHint: 'Film / Magnet Sheet / Tarpaulin / 建筑膜材',
    subs: ['rc-4'],
    verification: 'official',
    summary:
      '日本辐射制冷膜材厂商，产品含膜、磁吸片、篷布与建筑膜材；公开的客户与伙伴包括本田、铃木、日野、JR 九州、住友电工、ENEOS、三菱瓦斯化学、近铁、Brother，并入选德国 dena 主办的 SET100。英文产品页参数本次抓取超时，R/ε 未取得。',
    specs: { 产品形态: '膜 / 磁吸片 / 篷布 / 建筑膜材', 公开参数: 'R、ε 未在可访问页公开' },
    tags: ['膜材', '日系'],
    sources: [S('SPACECOOL 官网', 'https://spacecool.jp/en/'), S('SPACECOOL SET100 入选公告', 'https://spacecool.jp/en/news/20260213/')]
  },
  {
    name: '3M Company',
    nameEn: '3M Company',
    country: '美国',
    region: '明尼苏达州',
    role: '填料（空心玻璃微珠）',
    website: 'https://www.3m.com/',
    productHint: '3M™ 空心玻璃微珠 S32',
    subs: ['rc-1'],
    verification: 'b2b',
    summary:
      '以空心玻璃微珠作为辐射制冷涂料的反射/隔热填料供货。3M 官网对本次抓取返回 403，本条参数与价格经中国区一级代理页面核验，注意该填料本身并非 PDRC 专用填料，而是被用于提升屋面涂料的太阳反射。',
    specs: { 产品: '空心玻璃微珠 S32', 材质: '钠钙硼硅酸盐玻璃', 中值粒径: '40 μm', 密度: '0.32 g/cc', 等静压强度: '13.79 MPa（80% 存留）', 核验说明: '3M 官网 403，经代理页核验' },
    tags: ['填料', '玻璃微珠'],
    sources: [S('上海晨慕颜（3M 一级代理）S32 页面', 'https://www.shcmy.com/products/show36182638.html')]
  },
  {
    name: '立邦（中国）',
    nameEn: 'Nippon Paint (China)',
    country: '中国',
    region: '上海 · 日资企业',
    role: '涂料',
    website: 'https://www.nipponpaint.com.cn/',
    productHint: '立邦优能辐射致冷涂料',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '在第八届进博会中国首展辐射致冷涂料，宣称已本地化量产，并在天津保光汽车零部件厂房、石家庄食品油储罐完成应用验证（屋面降 29.5℃、室内降 6℃、制冷能耗最高降 37.5%）。R、ε 等材料参数未公开。',
    specs: { 产品: '立邦优能辐射致冷涂料', 公开参数: 'R、ε 未公开', 应用验证: '天津厂房 / 石家庄储罐' },
    tags: ['涂料', '量产'],
    sources: [S('进博会官网 立邦辐射致冷涂料报道', 'https://www.ciie.org/zbh/cn/speech/foreignInvestor/20260904/63871.html')]
  },
  {
    name: '深圳市创冷科技有限公司（i2Cool Limited）',
    nameEn: 'i2Cool Limited',
    country: '中国',
    region: '深圳南山 / 香港',
    role: '涂料 + 膜 + 纺织品 + 母粒',
    website: 'https://www.i2cool.com.cn/',
    productHint: 'iPaint / iFilm / i2Nano / i2Coating',
    subs: ['rc-2', 'rc-3', 'rc-4'],
    verification: 'official',
    summary:
      '香港城市大学团队孵化的无电制冷企业，产品线覆盖涂料（iPaint）、膜与卷材（iFilm）、粉末涂料、车窗膜、瓷砖、纺织品与尼龙母粒（i2Nano）。官网口径太阳反射率与中红外发射率均"高达 95%"，精确值、净功率、VOC 未公开。',
    specs: { 产品线: 'iPaint / iFilm / i2Nano / iCoating', 太阳反射率: '高达 95%（官网口径）', 中红外发射率: '高达 95%（官网口径）' },
    tags: ['无电制冷', '全产品线'],
    sources: [S('i2Cool 中国站 产品页', 'https://www.i2cool.com.cn/product'), S('i2Cool iPaint 页', 'https://www.i2cool.com.cn/i2coating/1')]
  },
  {
    name: '宁波瑞凌新能源科技有限公司',
    nameEn: 'Ningbo Radi-Cool New Energy Technology Co., Ltd.',
    country: '中国',
    region: '浙江 · 宁波奉化',
    role: '膜 / 卷材 + 涂层',
    website: 'https://www.rl-cool.com/',
    productHint: 'Radi-Cool 辐射制冷膜',
    subs: ['rc-4', 'rc-3'],
    verification: 'official',
    summary:
      '国内辐射制冷膜材代表企业，T/ZZB 2304-2021《辐射致（制）冷膜》主要起草单位，产品用于宁波栎社国际机场廊桥等场景。企业副总裁对媒体表示 2026 年膜销售额"有望超过 5000 万元"，属预测而非实际销售额。',
    specs: { 代表产品: '辐射制冷膜', 标准: 'T/ZZB 2304-2021 主起草', 案例: '宁波栎社机场廊桥' },
    tags: ['膜材', '标准主起草'],
    sources: [S('瑞凌新能源 官网', 'https://www.rl-cool.com/'), S('宁波科技局 报道', 'https://kjj.ningbo.gov.cn/col/col1229589472/art/2026/art_428a824cafe941e695db782014b4471f.html')]
  },
  {
    name: '重庆蔚蓝时代节能技术有限公司',
    nameEn: 'Chongqing Azure Era Energy-saving Technology Co., Ltd.',
    country: '中国',
    region: '重庆（另有长沙基地）',
    role: '涂料 + 膜 / 卷材 + 窗膜',
    website: 'https://www.azure-era.com/',
    productHint: 'QHN100W-T 涂料 / FHN100B-T 膜 / TCHN 窗膜',
    subs: ['rc-2', 'rc-3', 'rc-4'],
    verification: 'official',
    summary:
      '渝三峡 A（000565）控股子公司，辐射制冷产品线最完整的中文企业之一，覆盖涂料、反射型膜、窗膜、光伏涂层与"蔚蓝冰甲"。QHN100W-T 与 FHN100B-T 均公开了反射率、发射率、制冷功率与检测依据，是当前可核查度最高的产品参数组。',
    specs: { 上市公司: '渝三峡A（000565）控股子公司', 产品线: '涂料 / 膜 / 窗膜 / 光伏涂层', 参数完整度: '公开 R / ε / 功率 / 附着力' },
    tags: ['上市公司系', '参数完整'],
    sources: [S('蔚蓝时代 官网', 'https://www.azure-era.com/'), S('QHN100W-T 产品页', 'https://www.azure-era.com/product/qhn100w-t.html')]
  },
  {
    name: '安徽凛能科技有限公司',
    nameEn: 'Anhui Linergy Technology Co., Ltd.',
    country: '中国',
    region: '安徽 · 淮北',
    role: '涂料 + 膜 + 织物',
    website: 'http://linergytech.cn/',
    productHint: '零能耗辐射制冷涂层系列',
    subs: ['rc-3', 'rc-4'],
    verification: 'official',
    summary:
      '2025 年成立，产品含涂层、防晒霜、透射膜与织物，官网称太阳反射率 ≥95%、8–13 μm 发射率 ≥95%、表面降温 25–45℃，并称专利 30 余项。2026 年 3 月成为中国铁塔淮北市分公司辐射制冷涂层采购成交供应商。',
    specs: { 太阳反射率: '≥95%（官网口径）', 发射率: '≥95%（官网口径）', 表面降温: '25–45℃（官网口径）', 成立时间: '2025 年' },
    tags: ['涂料', '铁塔采购'],
    sources: [S('凛能科技 官网', 'http://linergytech.cn/'), S('中国铁塔采购结果公告', 'https://ebid.chinatowercom.cn/zgtt/gggs/003004/20260302/6270eed3-582c-449d-b28a-6b822fc21b1f.html')]
  },
  {
    name: '北京志盛威华化工有限公司',
    nameEn: 'Beijing ZSWH Chemical Co., Ltd.',
    country: '中国',
    region: '北京 · 通州',
    role: '涂料',
    website: 'http://www.zswhtl.com.cn/',
    productHint: 'ZS-411 辐射散热涂料 / ZS-221 反射隔热',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '工业防腐与特种涂料企业，ZS-411 为其辐射散热（辐射制冷）型涂料，20 kg/桶、总固含 ≥60%。企业明确区分 ZS-411（提高基材红外发射率）与 ZS-221（反射型）两种机理，R/ε 未公开，但有公开挂牌价。',
    specs: { 代表产品: 'ZS-411', 包装: '20 kg/桶', 固含: '≥60%', 干燥时间: '≤3 h' },
    tags: ['涂料', '工业防腐'],
    sources: [S('志盛威华 ZS-411 产品页', 'https://www.hbzhan.com/st625171/product_24840552.html')]
  },
  {
    name: '北京荣力恒业科技有限公司',
    country: '中国',
    region: '北京',
    role: '涂料',
    website: 'https://m.bmlink.com/ronglihengye/supply-15005751.html',
    productHint: 'RLHY-A06 辐射制冷涂料',
    subs: ['rc-3'],
    verification: 'b2b',
    summary:
      'RLHY-A06 辐射制冷涂料，太阳热反射比 >0.85、A 级不燃、可做全色系，应用场景含粮仓、基站、冷链、储罐、机柜与光伏背板。发射率与净制冷功率未公开，价格电议。',
    specs: { 太阳热反射比: '>0.85', 燃烧等级: 'A 级不燃', 色系: '全色系' },
    tags: ['涂料', '建材网'],
    sources: [S('建材网 荣力恒业 RLHY-A06', 'https://m.bmlink.com/ronglihengye/supply-15005751.html')]
  },
  {
    name: '江苏创冷科技工程有限公司',
    country: '中国',
    region: '江苏 · 无锡滨湖',
    role: '工程集成 / 区域渠道',
    website: 'https://www.jsi2cool.com/',
    productHint: '智冷 SmartCool / 穹冷纪 QLONIX',
    subs: ['rc-3', 'rc-4'],
    verification: 'official',
    summary:
      '定位长三角工程应用服务中心，代理 i2Cool 体系产品并提供工程集成：智冷 SmartCool 涂料（300–2500 nm 反射 95%、8–13 μm 发射 95%）、PET 基材多功能卷材、无电制冷粉末涂层（宣称零 VOC、RoHS/REACH）。卷材厚度与附着力未公开。',
    specs: { 涂料口径: 'R 95% / ε 95%（企业口径）', 粉末涂层: '零 VOC、RoHS/REACH（企业口径）' },
    tags: ['工程集成', '渠道'],
    sources: [S('江苏创冷 解决方案页', 'https://www.jsi2cool.com/solution.html')]
  },
  {
    name: '中国建筑西南设计研究院有限公司（中建西南院）',
    country: '中国',
    region: '四川 · 成都',
    role: '材料研发 + 工程应用',
    website: '',
    productHint: '中建光子自清洁辐射制冷材料',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '以央企设计院身份做材料研发与工程落地，其"中建光子自清洁辐射制冷材料"用于成都世运会开幕式保障通讯基站外表面。报道只描述效果（暴晒下表面不烫手），未公开 R、ε、净功率。',
    specs: { 材料: '中建光子自清洁辐射制冷材料', 公开参数: '未公开' },
    tags: ['央企', '基站'],
    sources: [S('国资委 视频报道', 'http://vod.sasac.gov.cn/folder21/folder24/2025-08-14/resjAQkevX7hpym8.html')]
  },
  {
    name: '寰太科技有限公司',
    country: '中国',
    region: '注册地待核验',
    role: '涂料（专利主体）',
    website: '',
    productHint: 'CN116445074B 无能耗辐射制冷涂料',
    subs: ['rc-3'],
    verification: 'media',
    summary:
      '以"一种无能耗辐射制冷涂料及其制备方法和应用"（CN116445074B，2024-11-23 授权公告）为公开身份的技术主体。官网与英文名未核实，本条依据授权报道登记。',
    specs: { 专利: 'CN116445074B', 授权公告: '2024-11-23' },
    tags: ['专利主体', '待核验'],
    sources: [S('金融界 专利授权报道', 'https://finance.jrj.com.cn/2024/11/23154145612789.shtml')]
  },
  {
    name: '中稀易涂科技发展有限公司',
    country: '中国',
    region: '四川 · 成都',
    role: '浆料 / 稀土功能填料',
    website: '',
    productHint: '辐射制冷用稀土浆料（CN118006158B）',
    subs: ['rc-2'],
    verification: 'media',
    summary:
      '以稀土基辐射制冷浆料为技术方向，持有"具有辐射制冷功能的白色染料用稀土浆料及其制备方法"专利（CN118006158B，2025-01 授权）。浆料是辐射制冷从粉体走向涂料/膜的关键中间体，本条为国内少见的浆料环节公开主体。',
    specs: { 专利: 'CN118006158B', 注册资本: '5555.56 万元' },
    tags: ['浆料', '稀土'],
    sources: [S('百家号 专利授权报道', 'https://baijiahao.baidu.com/s?id=1822115965906166802')]
  },
  {
    name: '武汉顺锦鸿新材料有限公司',
    country: '中国',
    region: '湖北 · 武汉',
    role: '材料 / 涂层',
    website: '',
    productHint: '被动式辐射制冷涂层（标准起草单位）',
    subs: ['rc-2', 'rc-3'],
    verification: 'official',
    summary:
      '作为 T/SXCIES 003-2026《被动式辐射制冷涂层》起草单位之一出现在标准公开页。未查到独立官网与产品页，产品参数无公开来源。',
    specs: { 标准身份: 'T/SXCIES 003-2026 起草单位', 公开参数: '无' },
    tags: ['标准起草', '待补官网'],
    sources: [S('标准信息平台 T/SXCIES 003-2026', 'https://www.spc.org.cn/online/e54352d6b1cacd8e6efd05db4dbd214a.html')]
  }
];

const RC_PRODUCTS = [
  {
    name: 'SkyCool Panel 板式辐射散热面板',
    org: 'SkyCool Systems, Inc.',
    form: '板式面板（水-乙二醇闭合回路）',
    subs: ['rc-4'],
    verification: 'official',
    summary: '替代传统冷凝器的板式辐射散热单元，靠闭合回路把热量经 8–13 μm 窗口辐射到外太空。官网强调无风扇、仅泵功、无蒸发耗水、面板 15 年寿命，但未给出 R、ε 或净制冷功率数值。',
    specs: { 形态: '板式面板', 传热介质: '水-乙二醇闭合回路', 寿命: '15 年（官网）', 'R/ε': '未公开' },
    tags: ['系统级', '数据中心'],
    sources: [S('SkyCool Panel 页', 'https://www.skycoolsystems.com/panel')]
  },
  {
    name: 'SkyCool Film / Roof 膜材与屋面制品',
    org: 'SkyCool Systems, Inc.',
    form: '多层塑料复合膜 / 屋面制品',
    subs: ['rc-4'],
    verification: 'official',
    summary: '多层塑料复合的辐射制冷膜与屋面制品，官网称可反射几乎全部可见光与紫外、并在大气窗口强发射。未公开反射率、发射率与功率的具体数值。',
    specs: { 形态: '多层复合膜 / 屋面制品', 光学参数: '未公开' },
    tags: ['膜材', '屋面'],
    sources: [S('SkyCool 技术页', 'https://www.skycoolsystems.com/science')]
  },
  {
    name: 'SPACECOOL Film / Magnet Sheet / Tarpaulin / 建筑膜材',
    org: 'SPACECOOL 株式会社',
    form: '膜 / 磁吸片 / 篷布 / 建筑膜材',
    subs: ['rc-4'],
    verification: 'official',
    summary: '以膜材为核心的辐射制冷产品族，含可直接吸附施工的磁吸片、临时结构用篷布与建筑膜材。英文产品页本次抓取超时，参数未取得，仅确认产品形态与客户名单。',
    specs: { 形态: '膜 / 磁吸片 / 篷布 / 膜材', 参数: '未取得（页面超时）' },
    tags: ['膜材', '施工友好'],
    sources: [S('SPACECOOL 产品页', 'https://spacecool.jp/en/product/')]
  },
  {
    name: '3M™ 空心玻璃微珠 S32',
    org: '3M Company',
    form: '填料（薄壁中空玻璃微球）',
    subs: ['rc-1'],
    verification: 'b2b',
    summary: '钠钙硼硅酸盐薄壁空心玻璃微球，中值粒径 40 μm、密度 0.32 g/cc、13.79 MPa 等静压下 80% 存留，249 kg 包装。用于屋面涂料可增强太阳反射，但它本身是通用轻质填料，不是 PDRC 专用功能填料，参数不可直接当作辐射制冷性能指标。',
    specs: { 材质: '钠钙硼硅酸盐玻璃', 中值粒径: '40 μm', 密度: '0.32 g/cc', 等静压强度: '13.79 MPa（80% 存留）', 包装: '249 kg' },
    tags: ['填料', '通用型'],
    sources: [S('3M 一级代理 S32 页面', 'https://www.shcmy.com/products/show36182638.html')]
  },
  {
    name: '立邦优能辐射致冷涂料',
    org: '立邦（中国）',
    form: '涂料',
    subs: ['rc-3'],
    verification: 'media',
    summary: '2026 年进博会中国首展并宣称已本地化量产，在天津保光厂房与石家庄储罐完成应用验证。材料级 R、ε、净功率未公开，但工程实测温降数据完整（屋面降 29.5℃、室内降 6℃）。',
    specs: { 形态: '涂料', 量产状态: '已本地化量产（企业口径）', 'R/ε': '未公开' },
    tags: ['涂料', '量产'],
    sources: [S('进博会官网 立邦报道', 'https://www.ciie.org/zbh/cn/speech/foreignInvestor/20260904/63871.html')]
  },
  {
    name: 'iPaint 无电制冷涂层',
    org: '深圳市创冷科技有限公司',
    form: '涂料（高分子 + 无机颗粒）',
    subs: ['rc-3'],
    verification: 'official',
    summary: '官网口径太阳光反射率与中红外辐射率均"高达 95%"，是创冷的主打建筑涂料。R/ε 精确值、净制冷功率、VOC、附着力均未公开，工程效果以案例形式披露。',
    specs: { 太阳反射率: '高达 95%（官网）', 中红外发射率: '高达 95%（官网）', 精确参数: '未公开' },
    tags: ['涂料', '建筑'],
    sources: [S('i2Cool iPaint 页', 'https://www.i2cool.com.cn/i2coating/1')]
  },
  {
    name: 'iFilm 膜 / 无电制冷卷材 / 粉末涂层系列',
    org: '深圳市创冷科技有限公司',
    form: '膜 / 卷材 / 粉末涂层 / 车窗膜',
    subs: ['rc-4', 'rc-2'],
    verification: 'official',
    summary: '创冷的膜与卷材产品族，含建筑卷材、车窗膜、瓷砖与纺织品形态；另有零 VOC 粉末涂层用于金属基材。除 iPaint 的 95%/95% 口径外，各品精确参数未公开。',
    specs: { 形态: '膜 / 卷材 / 粉末 / 车窗膜', 精确参数: '未公开' },
    tags: ['膜材', '卷材'],
    sources: [S('i2Cool 产品总览', 'https://www.i2cool.com.cn/product')]
  },
  {
    name: 'QHN100W-T 水性辐射制冷涂料',
    org: '重庆蔚蓝时代节能技术有限公司',
    form: '水性涂料（底/中/面成套）',
    subs: ['rc-3'],
    verification: 'official',
    summary:
      '当前可核查度最高的国产辐射制冷涂料之一：太阳光反射比 93.0%（JG/T 235-2014）、8–13 μm 发射率 98.0%（T/ZZB 2304）、辐射制冷功率 154 W/m²、附着力 1 级（GB/T 9286-1998），超疏水自清洁。注意其页面同时出现"72000 元/㎡"与"3 桶一组可涂 25㎡ 合计 180 万元"的自相矛盾报价，疑为单位标注错误，不可作单价引用。',
    specs: { 太阳光反射比: '93.0%（JG/T 235-2014）', '8–13μm发射率': '98.0%（T/ZZB 2304）', 辐射制冷功率: '154 W/m²', 附着力: '1 级（GB/T 9286-1998）', 特性: '超疏水自清洁', 报价: '页面自相矛盾，不可引用' },
    tags: ['涂料', '参数完整', '报价存疑'],
    sources: [S('蔚蓝 QHN100W-T 产品页', 'https://www.azure-era.com/product/qhn100w-t.html')]
  },
  {
    name: 'FHN100B-T 反射型辐射制冷膜',
    org: '重庆蔚蓝时代节能技术有限公司',
    form: '膜 / 卷材（无机材料，900 μm）',
    subs: ['rc-4'],
    verification: 'official',
    summary: '无机材料体系反射型辐射制冷膜，规格 1 m × 21 m、厚 900 μm、宽幅 100 cm；反射比 98.0%、8–13 μm 发射率 98.0%、辐射制冷功率 151 W/m²，厚度与宽幅分别按 GB/T 6672-2001、GB/T 6673-2001 检测。',
    specs: { 太阳光反射比: '98.0%（JG/T 235-2014）', '8–13μm发射率': '98.0%（T/ZZB 2304）', 辐射制冷功率: '151 W/m²', 规格: '1 m × 21 m × 900 μm', 检测依据: 'GB/T 6672 / GB/T 6673' },
    tags: ['膜材', '参数完整'],
    sources: [S('蔚蓝 FHN100B-T 产品页', 'https://www.azure-era.com/product/fhn100b-t.html')]
  },
  {
    name: '零能耗辐射制冷涂层系列（含透射膜 / 织物 / 防晒霜）',
    org: '安徽凛能科技有限公司',
    form: '涂料 / 膜 / 织物',
    subs: ['rc-3', 'rc-4'],
    verification: 'official',
    summary: '企业口径：0.3–2.5 μm 反射率 ≥95%、8–13 μm 发射率 ≥95%，并在 2.5–8 μm 保持低发射；表面降温 25–45℃、内部 7–15℃。净功率、VOC、附着力未公开，上述降温幅度为厂商自测口径。',
    specs: { 反射率: '≥95%（0.3–2.5 μm）', 发射率: '≥95%（8–13 μm）', 表面降温: '25–45℃（厂商口径）', 内部降温: '7–15℃（厂商口径）' },
    tags: ['涂料', '厂商自测'],
    sources: [S('凛能科技 官网', 'http://linergytech.cn/')]
  },
  {
    name: 'ZS-411 辐射散热（辐射制冷）涂料',
    org: '北京志盛威华化工有限公司',
    form: '涂料（20 kg/桶，白色）',
    subs: ['rc-3'],
    verification: 'official',
    summary: '以提升基材红外发射率为机理的辐射散热涂料，与同厂 ZS-221 反射型隔热涂料路线不同。总固含 ≥60%、表干 ≤3 h、保质 1 年；R、ε、净功率未公开，但有公开挂牌价（33 元/kg）。',
    specs: { 包装: '20 kg/桶', 固含: '≥60%', 干燥时间: '≤3 h', 保质期: '1 年', 'R/ε': '未公开' },
    tags: ['涂料', '工业'],
    sources: [S('志盛威华 ZS-411 产品页', 'https://www.hbzhan.com/st625171/product_24840552.html')]
  },
  {
    name: 'RLHY-A06 辐射制冷涂料',
    org: '北京荣力恒业科技有限公司',
    form: '涂料',
    subs: ['rc-3'],
    verification: 'b2b',
    summary: '太阳热反射比 >0.85、A 级不燃、全色系可选，场景覆盖粮仓、基站、冷链、储罐、机柜与光伏背板。发射率与净制冷功率未公开，价格电议。',
    specs: { 太阳热反射比: '>0.85', 燃烧等级: 'A 级不燃', 色系: '全色系' },
    tags: ['涂料', '粮油仓储'],
    sources: [S('建材网 荣力恒业 RLHY-A06', 'https://m.bmlink.com/ronglihengye/supply-15005751.html')]
  },
  {
    name: '智冷 SmartCool 涂料 / PET 基材多功能卷材',
    org: '江苏创冷科技工程有限公司',
    form: '涂料 + 卷材',
    subs: ['rc-3', 'rc-4'],
    verification: 'official',
    summary: '工程渠道品牌"智冷 SmartCool"，涂料口径为 300–2500 nm 反射 95% + 8–13 μm 发射 95%；另有 PET 基材多功能卷材与"穹冷纪 QLONIX"品牌。卷材厚度、附着力、VOC 具体值未公开。',
    specs: { 涂料口径: 'R 95% / ε 95%（企业口径）', 卷材基材: 'PET' },
    tags: ['工程渠道', '卷材'],
    sources: [S('江苏创冷 解决方案', 'https://www.jsi2cool.com/solution.html')]
  },
  {
    name: '中建光子自清洁辐射制冷材料',
    org: '中国建筑西南设计研究院有限公司',
    form: '涂料（自清洁 + 辐射制冷一体）',
    subs: ['rc-3'],
    verification: 'media',
    summary: '把自清洁与辐射制冷做成一体的功能材料，2025 年 8 月用于成都世运会开幕式保障通讯基站外表面。报道只描述"暴晒下表面不烫手"，无 R/ε/功率与温降数值。',
    specs: { 特性: '自清洁 + 辐射制冷', 公开参数: '无' },
    tags: ['央企', '自清洁'],
    sources: [S('国资委 报道', 'http://vod.sasac.gov.cn/folder21/folder24/2025-08-14/resjAQkevX7hpym8.html')]
  },
  {
    name: '辐射制冷功能白色染料用稀土浆料',
    org: '中稀易涂科技发展有限公司',
    form: '浆料（稀土基功能填料分散体）',
    subs: ['rc-2'],
    verification: 'media',
    summary: '专利 CN118006158B 对应的稀土浆料产品方向，用于白色染料/涂料体系引入辐射制冷功能。浆料环节是辐射制冷从粉体走向涂布的关键中间体，国内公开主体极少，本条仅有专利与授权报道可核。',
    specs: { 专利: 'CN118006158B（2025-01 授权）', 形态: '稀土功能浆料', 公开参数: '未公开' },
    tags: ['浆料', '稀土'],
    sources: [S('百家号 专利授权报道', 'https://baijiahao.baidu.com/s?id=1822115965906166802')]
  }
];

const RC_STANDARDS = [
  {
    name: 'T/ZZB 2304-2021 辐射致（制）冷膜',
    nameEn: 'T/ZZB 2304-2021',
    org: '浙江省质量协会（宁波瑞凌新能源科技主起草）',
    role: '团体标准（发布 2021-08-26 / 实施 2021-09-26）',
    year: '2021',
    subs: ['rc-4'],
    verification: 'official',
    summary: '国内辐射制冷膜的首个团体标准，主要起草单位为宁波瑞凌新能源科技，参与方含上海瑞凌、中国建材检验认证集团、森特士兴、安徽墙煌彩铝、宁波机场与物流园区投资发展、华中科技大学。蔚蓝 FHN100B-T 的发射率即按本标准检测。',
    tags: ['团体标准', '膜材'],
    sources: [S('标准信息平台 T/ZZB 2304-2021', 'https://www.spc.org.cn/online/2f30eceed098db6064927ef458bf783d.html')]
  },
  {
    name: 'T/SXCIES 003-2026 被动式辐射制冷涂层',
    nameEn: 'T/SXCIES 003-2026',
    org: '山西省化工学会（起草含天府兴隆湖实验室、香港理工大学、深圳创冷、北京工业大学等）',
    role: '团体标准（发布 2026-05-07）',
    year: '2026',
    subs: ['rc-3'],
    verification: 'official',
    summary: '辐射制冷涂层的团体标准，起草单位横跨实验室、高校与企业（天府兴隆湖实验室、香港理工大学建筑环境及能源工程学系、深圳市创冷科技、广州市香港科大霍英东研究院、北京工业大学、武汉顺锦鸿新材料等）。',
    tags: ['团体标准', '涂料'],
    sources: [S('标准信息平台 T/SXCIES 003-2026', 'https://www.spc.org.cn/online/e54352d6b1cacd8e6efd05db4dbd214a.html')]
  },
  {
    name: 'T/GDQBA 17—2026 辐射制冷涂层材料通用技术要求',
    nameEn: 'T/GDQBA 17-2026',
    org: '待核验',
    role: '团体标准（标准平台页面 403，未一手核验）',
    year: '2026',
    subs: ['rc-3'],
    verification: 'pending',
    summary: '标准号来自检索摘要，全国团体标准平台详情页对本次抓取返回 403，未能读到正文，故标为待核验。若需引用请先取得标准正式文本。',
    tags: ['团体标准', '待核验'],
    sources: [S('全国团体标准平台（403）', 'https://www.ttbz.org.cn/standardDetail/43b24dca6bc849deb28fc8a00271cdb6.html')]
  },
  {
    name: 'JG/T 235-2014 建筑反射隔热涂料',
    nameEn: 'JG/T 235-2014',
    org: '住房和城乡建设部（行业标准）',
    role: '行业标准（辐射制冷涂料的常用检测依据）',
    year: '2014',
    subs: ['rc-3'],
    verification: 'official',
    summary: '建筑反射隔热涂料的行业标准，被 T/ZZB 2304-2021 列为规范性引用，也是蔚蓝 QHN100W-T 太阳光反射比的检测依据。注意它针对"反射隔热"，不完全等同于辐射制冷。',
    tags: ['行业标准', '检测依据'],
    sources: [S('标准引用信息', 'https://normenportal.org/1538986524.html'), S('蔚蓝 QHN100W-T 检测依据', 'https://www.azure-era.com/product/qhn100w-t.html')]
  },
  {
    name: 'GB/T 25261-2018 建筑用反射隔热涂料',
    nameEn: 'GB/T 25261-2018',
    org: '国家标准化管理委员会',
    role: '国家标准（被 T/ZZB 2304-2021 引用）',
    year: '2018',
    subs: ['rc-3'],
    verification: 'official',
    summary: '建筑用反射隔热涂料国标，被辐射制冷膜团标列为规范性引用文件，用于界定太阳反射相关的术语与试验方法。',
    tags: ['国家标准', '引用'],
    sources: [S('标准引用信息', 'https://normenportal.org/1538986524.html')]
  },
  {
    name: 'JGJ/T 287-2014 建筑反射隔热涂料节能检测标准',
    nameEn: 'JGJ/T 287-2014',
    org: '住房和城乡建设部',
    role: '行业标准（节能检测，被 T/ZZB 2304-2021 引用）',
    year: '2014',
    subs: ['rc-3'],
    verification: 'official',
    summary: '建筑反射隔热涂料的节能检测标准，被辐射制冷膜团标引用，用于把材料光学参数换算到建筑节能效果。',
    tags: ['行业标准', '节能检测'],
    sources: [S('标准引用信息', 'https://normenportal.org/1538986524.html')]
  },
  {
    name: 'CN116445074B 一种无能耗辐射制冷涂料及其制备方法和应用',
    nameEn: 'CN116445074B',
    org: '寰太科技有限公司',
    role: '发明专利（申请 2023-04，授权公告 2024-11-23）',
    year: '2024',
    subs: ['rc-3'],
    verification: 'media',
    summary: '辐射制冷涂料方向的授权发明专利，专利权人为寰太科技。本条依据授权公告报道登记，专利全文本次未取得。',
    tags: ['专利', '涂料'],
    sources: [S('金融界 专利授权报道', 'https://finance.jrj.com.cn/2024/11/23154145612789.shtml')]
  },
  {
    name: 'CN118064066B 一种高光谱选择性的辐射制冷汽车天窗膜及其制备方法',
    nameEn: 'CN118064066B',
    org: '重庆蔚蓝时代节能技术有限公司',
    role: '发明专利（申请 2024-01，授权 2025-04）',
    year: '2025',
    subs: ['rc-4'],
    verification: 'media',
    summary: '面向汽车天窗的高光谱选择性辐射制冷膜专利，专利权人为蔚蓝时代。说明辐射制冷膜正在向车用细分场景延伸。',
    tags: ['专利', '车用', '膜材'],
    sources: [S('金融界 专利授权报道', 'https://m.jrj.com.cn/madapter/finance/2025/04/19084249679212.shtml')]
  },
  {
    name: 'CN118006158B 具有辐射制冷功能的白色染料用稀土浆料及其制备方法',
    nameEn: 'CN118006158B',
    org: '中稀易涂科技发展有限公司',
    role: '发明专利（申请 2024-01，授权 2025-01）',
    year: '2025',
    subs: ['rc-2'],
    verification: 'media',
    summary: '稀土基辐射制冷浆料专利，对应涂料/染料体系的功能填料分散环节。国内浆料环节公开专利较少，本条是少见的中间体层面技术公开。',
    tags: ['专利', '浆料', '稀土'],
    sources: [S('百家号 专利授权报道', 'https://baijiahao.baidu.com/s?id=1822115965906166802')]
  }
];

/* =================================================================== 组装 */

function build() {
  const out = [];
  const push = (type, board, arr) => {
    for (const r of arr) {
      out.push({
        type,
        board,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        specs: {},
        values: {},
        sources: [],
        verification: 'pending',
        ...r
      });
    }
  };
  push('company', 'dc', DC_COMPANIES);
  push('product', 'dc', DC_PRODUCTS);
  push('standard', 'dc', DC_STANDARDS);
  push('company', 'rc', RC_COMPANIES);
  push('product', 'rc', RC_PRODUCTS);
  push('standard', 'rc', RC_STANDARDS);

  // 第二轮扩展调研（上游/配套/替代技术/检测机构/更多标准）
  push('company', 'dc', DC_COMPANIES_EXT);
  push('product', 'dc', DC_PRODUCTS_EXT);
  push('standard', 'dc', DC_STANDARDS_EXT);
  push('company', 'rc', RC_COMPANIES_EXT);
  push('product', 'rc', RC_PRODUCTS_EXT);
  push('standard', 'rc', RC_STANDARDS_EXT);

  const prefix = { company: 'co', product: 'pd', standard: 'st' };
  const seq = {};
  for (const r of out) {
    const p = `${prefix[r.type]}-${r.board}`;
    seq[p] = (seq[p] || 0) + 1;
    r.id = `${p}-${String(seq[p]).padStart(2, '0')}`;
  }
  return out;
}

async function main() {
  const force = process.argv.includes('--force');
  const target = path.join(ROOT, 'data', 'records.json');
  try {
    if (!force) await fs.access(target);
    if (!force) {
      console.error('data/records.json 已存在。如确认要用种子数据覆盖，请加 --force。');
      process.exit(1);
    }
  } catch {
    /* 文件不存在，正常写入 */
  }

  const items = build();
  const now = new Date().toISOString();
  const payload = {
    meta: {
      version: 3,
      generatedAt: now,
      updatedAt: now,
      seed: 'tools/seed-records.mjs + tools/seed-data-extra.mjs',
      accessed: ACCESSED,
      count: items.length,
      note: '全部记录来自 2026-11-24 的公开渠道逐页核验；不设价格/销量/销售额/样板工程维度，查不到的字段不做估算。'
    },
    items
  };
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(payload, null, 2), 'utf8');

  const byType = items.reduce((m, r) => ((m[r.type] = (m[r.type] || 0) + 1), m), {});
  console.log(`✓ 写入 ${items.length} 条记录 -> data/records.json`);
  console.log('  维度分布：', JSON.stringify(byType));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
