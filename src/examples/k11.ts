import { extractArticleText, type ArticleBlock, type ArticleDocument } from '../domain/article';

const blocks: ArticleBlock[] = [
  {
    id: 'hero-k11',
    type: 'hero',
    eyebrow: '',
    title: '【武汉K11店】\n青少年暑期集训招募：\n用攀登，给成长通关！',
  },
  {
    id: 'intro',
    type: 'paragraph',
    text: '这个夏天，放下平板、拒绝内卷，让孩子在安全的高墙上建立自信。\n香蕉攀岩武汉K11店「青少年暑期集训营」正式开启招募！\n5节系统集训、专属福利加持、冲刺专属“绿通考核”，攀出成长新高度。',
    note: '*“绿通”指香蕉攀岩内部专为青少年设立的绿色通行证。持有“绿通”代表已通过攀岩能力、安全意识考核，可以畅爬香蕉攀岩所有场馆区域。',
  },
  {
    id: 'image-friends',
    type: 'image',
    src: '/assets/k11/camp-friends.jpg',
    alt: '孩子们在攀岩馆开心合影',
    caption: '在欢笑和挑战中，结识志同道合的小伙伴',
  },
  {
    id: 'heading-basic',
    type: 'sectionTitle',
    text: '集训营基础信息',
    tone: 'yellow',
  },
  {
    id: 'facts-basic',
    type: 'facts',
    items: [
      { label: '适龄人群', value: '6 - 18 岁中小学生' },
      { label: '集训价格', value: '2088元 / 期（含5课/共10h）' },
      { label: '每日课时', value: '上午 9:00-11:00 / 下午 16:00-18:00' },
    ],
  },
  {
    id: 'discount',
    type: 'callout',
    title: '暑期多期连报特惠方案',
    text: '连报 2 期享 9折｜连报 3 期享 88折',
    tone: 'yellow',
  },
  {
    id: 'image-coach',
    type: 'image',
    src: '/assets/k11/coach-guidance.jpg',
    alt: '教练保护并指导孩子攀岩',
    caption: '金牌教练1对1保护与动作指引，安全保障重于泰山',
  },
  {
    id: 'heading-schedule',
    type: 'sectionTitle',
    text: '集训排期班次',
    tone: 'orange',
  },
  {
    id: 'schedule',
    type: 'schedule',
    items: [
      { label: 'A 班', date: '7月6日 - 7月10日' },
      { label: 'B 班', date: '7月13日 - 7月17日' },
      { label: 'C 班', date: '7月20日 - 7月24日' },
      { label: 'D 班', date: '7月27日 - 7月31日' },
    ],
  },
  {
    id: 'schedule-note',
    type: 'paragraph',
    text: '暑期集训一律开课不设补课，请家长预留好日程安排。',
  },
  {
    id: 'image-class',
    type: 'image',
    src: '/assets/k11/class-briefing.jpg',
    alt: '集训营课堂讲解',
    caption: '系统的集训课堂，让孩子们在科学规划下攀登',
  },
  {
    id: 'heading-benefits',
    type: 'sectionTitle',
    text: '特权福利与“绿通考核”',
    tone: 'teal',
  },
  {
    id: 'benefit-practice',
    type: 'callout',
    title: '日常畅爬体验福利',
    text: '集训期间，营员每日免费享有 2小时体验区门票，课后自由练习巩固。',
    tone: 'blue',
  },
  {
    id: 'image-practice',
    type: 'image',
    src: '/assets/k11/free-practice.jpg',
    alt: '孩子在教练保护下自主练习',
    caption: '',
  },
  {
    id: 'benefit-assessment',
    type: 'callout',
    title: '“绿通”绿色通道考核',
    text: '累计完成 8h课时 即可提交考核申请。考核不限区域，难度与攀石统一考量。\n规则：报名1期享1次考核，连报多期可累加（未通关者再次考核需间隔半年）。',
    tone: 'green',
  },
  {
    id: 'image-assessment',
    type: 'image',
    src: '/assets/k11/assessment.jpg',
    alt: '营员独立参加绿通考核',
    caption: '',
  },
  {
    id: 'benefit-pass',
    type: 'callout',
    title: '金牌通关玩家特权',
    text: '通过“绿通考核”后，营员在集训期间每日可免费领取 全场馆攀爬通票。',
    tone: 'orange',
  },
  {
    id: 'image-family',
    type: 'image',
    src: '/assets/k11/family-support.jpg',
    alt: '家长在场下陪伴记录孩子攀岩',
    caption: '在场下，共同见证孩子的每一步蜕变与突破',
  },
  {
    id: 'heading-notice',
    type: 'sectionTitle',
    text: '退费规则与报名须知',
    tone: 'red',
  },
  {
    id: 'notice-refund',
    type: 'notice',
    title: '请在报名前确认以下规则',
    items: [
      '7天无理由全额退：缴费起7日内且未上课可申请一次性全额退费。',
      '开课前3天申请：扣除报名手续费（单期100元，连报200元）后退还余款。',
      '开课后退费：计算公式为 剩余未上节数 × 单节折算均价 - 100元。如报名连报享受折扣，中途退费时已消耗课时需按原价 2088 元/期重新计费并补扣差价。且自第4节课起原则上不再受理退费。',
    ],
  },
];

export const k11IntroNote = '*“绿通”指香蕉攀岩内部专为青少年设立的绿色通行证。持有“绿通”代表已通过攀岩能力、安全意识考核，可以畅爬香蕉攀岩所有场馆区域。';

export const k11Article: ArticleDocument = {
  id: 'k11-summer-camp',
  title: '武汉 K11 青少年暑期集训招募',
  sourceText: extractArticleText(blocks),
  blocks,
  metadata: {
    accountName: '武汉香蕉攀岩 BananaClimbing',
    publishedLabel: '刚刚发布',
    category: '暑假专栏',
  },
};
