import { extractArticleText, type ArticleBlock, type ArticleDocument } from '../domain/article';

const blocks: ArticleBlock[] = [
  {
    id: 'hero-chengdu-school-season',
    type: 'hero',
    eyebrow: '',
    title: '【成都地区】\n开学季课包特惠\n给新学期，\n多一点向上的力量！',
  },
  {
    id: 'intro-chengdu-school-season',
    type: 'paragraph',
    text: '新学期的成长，不只发生在书桌前，也发生在孩子每一次主动尝试、专注判断和勇敢向上的攀登里。\n给孩子重新找回运动节奏，也让新学期从一次有目标、有陪伴的攀登开始。',
    promotion: {
      period: '8月29日—9月13日 · 限时特惠',
      products: '私教课 / 小香蕉课包',
      offer: '10节 / 20节，加赠1节',
    },
    note: '*活动适用范围、排课安排与课包使用规则，以成都地区参与门店实际执行为准。',
  },
  {
    id: 'image-chengdu-school-season-opening',
    type: 'image',
    src: '/assets/k11/camp-friends.jpg',
    alt: '孩子们在攀岩馆轻松交流',
    caption: '从开心走进场馆开始，让运动成为新学期值得期待的一部分',
  },
  {
    id: 'heading-offer',
    type: 'sectionTitle',
    text: '开学季优惠一览',
    tone: 'yellow',
  },
  {
    id: 'facts-offer',
    type: 'facts',
    items: [
      { label: '活动时间', value: '2026年8月29日—9月13日' },
      { label: '参与区域', value: '香蕉攀岩成都地区参与门店' },
      { label: '适用课包', value: '私教课 / 小香蕉课包' },
    ],
  },
  {
    id: 'offer-main',
    type: 'callout',
    title: '开学季限定加赠',
    text: '私教课：10节 + 1节｜20节 + 1节\n小香蕉课包：10节 + 1节｜20节 + 1节\n活动时间有限，请根据孩子的开学安排与训练计划合理选择课包。',
    tone: 'yellow',
  },
  {
    id: 'offer-excluded',
    type: 'callout',
    title: '40节 / 60节课包特别说明',
    text: '40节、60节课包不参与本次加赠活动，按门店常规方案执行。',
    tone: 'orange',
  },
  {
    id: 'heading-why-climbing',
    type: 'sectionTitle',
    text: '为什么把攀岩放进新学期',
    tone: 'teal',
  },
  {
    id: 'why-intro',
    type: 'paragraph',
    text: '开学意味着新的课程表，也意味着生活节奏需要重新建立。与其把时间排得满满当当，不如为孩子保留一段专注运动、释放能量的空间。',
  },
  {
    id: 'benefit-rhythm',
    type: 'callout',
    title: '找回稳定的运动节奏',
    text: '规律参与攀岩练习，让孩子在学习之外保持身体活动，在攀爬、休息和再次尝试之间，逐渐建立适合自己的节奏。',
    tone: 'blue',
  },
  {
    id: 'benefit-focus',
    type: 'callout',
    title: '练习专注与路线判断',
    text: '每一条线路都需要观察、选择和调整。孩子面对的不只是“爬上去”，更是如何在一次次尝试中找到解决方法。',
    tone: 'green',
  },
  {
    id: 'benefit-confidence',
    type: 'callout',
    title: '收获看得见的成就感',
    text: '从抓住下一个岩点，到完成一条曾经不敢尝试的线路，每一次小突破都值得被看见，也能成为新学期继续向前的信心。',
    tone: 'orange',
  },
  {
    id: 'image-chengdu-school-season-coach',
    type: 'image',
    src: '/assets/k11/coach-guidance.jpg',
    alt: '教练在攀岩墙边指导孩子完成动作',
    caption: '在教练的保护和指导下，把每一次尝试变成看得见的进步',
  },
  {
    id: 'heading-course-choice',
    type: 'sectionTitle',
    text: '怎样选择更合适的课包',
    tone: 'yellow',
  },
  {
    id: 'image-chengdu-private-course',
    type: 'image',
    src: '/assets/chengdu/private-course.png',
    alt: '私教课课程视觉图',
    caption: '',
  },
  {
    id: 'course-private',
    type: 'callout',
    title: '私教课',
    text: '适合希望获得更有针对性的动作指导、训练节奏安排与阶段反馈的学员。具体训练内容由教练结合学员基础和目标制定。',
    tone: 'yellow',
  },
  {
    id: 'image-chengdu-little-banana-package',
    type: 'image',
    src: '/assets/chengdu/little-banana-package.png',
    alt: '小香蕉课包课程视觉图',
    caption: '',
  },
  {
    id: 'course-banana',
    type: 'callout',
    title: '小香蕉课包',
    text: '适合喜欢同伴课堂氛围、希望在系统课程中持续练习的孩子。具体适龄范围、班级设置与排课时间以门店安排为准。',
    tone: 'teal',
  },
  {
    id: 'image-chengdu-school-season-class',
    type: 'image',
    src: '/assets/k11/class-briefing.jpg',
    alt: '教练为孩子们讲解攀岩课程',
    caption: '系统课堂与同伴氛围，让孩子在交流和练习中持续进步',
  },
  {
    id: 'course-choice-note',
    type: 'paragraph',
    text: '如果暂时不确定，可以先向门店教练说明孩子的年龄、攀岩经验和开学后的时间安排，再选择更匹配的课程方案。',
  },
  {
    id: 'heading-terms',
    type: 'sectionTitle',
    text: '报名与活动须知',
    tone: 'red',
  },
  {
    id: 'terms',
    type: 'notice',
    title: '报名前请确认以下活动规则',
    items: [
      '活动时间为2026年8月29日至9月13日，逾期不再享受本次加赠。',
      '本次活动适用于成都地区参与门店的私教课和小香蕉课包。',
      '购买10节私教课或小香蕉课，加赠1节；购买20节私教课或小香蕉课，同样加赠1节。',
      '本活动不与其他优惠同享，包括但不限于体验课赠送等活动。',
      '40节、60节课包不参与本次优惠。',
      '加赠课时的有效期、预约、请假、转课及使用规则，以购课门店的课包协议和实际说明为准。',
      '课程名额、教练时间和班级排期以门店实时情况为准，建议提前咨询和预约。',
    ],
  },
  {
    id: 'closing-action',
    type: 'callout',
    title: '新学期，不只向前，也要向上',
    text: '8月29日—9月13日，成都地区开学季课包特惠限时开启。带孩子走进攀岩馆，在一次次尝试里积累力量、专注和信心。\n详情请咨询香蕉攀岩成都地区参与门店前台或教练。',
    tone: 'yellow',
  },
  {
    id: 'image-chengdu-school-season-family',
    type: 'image',
    src: '/assets/k11/family-support.jpg',
    alt: '家长陪伴孩子参加攀岩活动',
    caption: '每一次向上，都有家人的关注与陪伴',
  },
  {
    id: 'closing-signature',
    type: 'paragraph',
    text: 'Banana Climbing Chengdu\n新学期，向上见！',
  },
  {
    id: 'gallery-chengdu-store-entry',
    type: 'horizontalGallery',
    title: '成都门店报名入口',
    hint: '← 左右滑动，选择报名门店 →',
    items: [
      { src: '/assets/chengdu/stores/icd.png', alt: '环贸ICD店报名与客服二维码' },
      { src: '/assets/chengdu/stores/capita-tianfu.png', alt: '凯德天府店报名与客服二维码' },
      { src: '/assets/chengdu/stores/cosmo.png', alt: 'COSMO店报名与客服二维码' },
    ],
  },
];

export const chengduHeroTitle = '【成都地区】\n开学季课包特惠\n给新学期，\n多一点向上的力量！';
export const chengduLegacyHeroTitle = '【成都地区】\n开学季课包特惠\n给新学期，多一点向上的力量！';
export const chengduIntroText = '新学期的成长，不只发生在书桌前，也发生在孩子每一次主动尝试、专注判断和勇敢向上的攀登里。\n给孩子重新找回运动节奏，也让新学期从一次有目标、有陪伴的攀登开始。';
export const chengduLegacyIntroText = '新学期的成长，不只发生在书桌前，也发生在孩子每一次主动尝试、专注判断和勇敢向上的攀登里。\n8月29日—9月13日，香蕉攀岩成都地区开启「开学季课包特惠」。私教课、小香蕉课包购买10节或20节，均可加赠1节。\n给孩子重新找回运动节奏，也让新学期从一次有目标、有陪伴的攀登开始。';
export const chengduIntroPromotion = {
  period: '8月29日—9月13日 · 限时特惠',
  products: '私教课 / 小香蕉课包',
  offer: '10节 / 20节，加赠1节',
};

export const chengduImageInsertionAnchors = [
  { afterBlockId: 'intro-chengdu-school-season', imageBlockId: 'image-chengdu-school-season-opening' },
  { afterBlockId: 'benefit-confidence', imageBlockId: 'image-chengdu-school-season-coach' },
  { afterBlockId: 'course-banana', imageBlockId: 'image-chengdu-school-season-class' },
  { afterBlockId: 'closing-action', imageBlockId: 'image-chengdu-school-season-family' },
] as const;

export const chengduCourseImageInsertionAnchors = [
  { afterBlockId: 'heading-course-choice', imageBlockId: 'image-chengdu-private-course' },
  { afterBlockId: 'course-private', imageBlockId: 'image-chengdu-little-banana-package' },
] as const;

export const chengduStoreGalleryInsertion = {
  afterBlockId: 'closing-signature',
  blockId: 'gallery-chengdu-store-entry',
} as const;

export const chengduBackToSchoolArticle: ArticleDocument = {
  id: 'chengdu-back-to-school-2026',
  title: '成都地区开学季课包特惠',
  sourceText: extractArticleText(blocks),
  blocks,
  metadata: {
    accountName: '香蕉攀岩 BananaClimbing',
    publishedLabel: '草稿',
    category: '开学季专栏',
  },
};
