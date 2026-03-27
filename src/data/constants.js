export const ROLES = {
  admin:    { color: '#7c3aed', av: 'A',  pages: ['rec', 'kw', 'mic', 'cctv', 'users', 'audio'], readonly: [] },
  operator: { color: '#2563eb', av: 'O',  pages: ['rec', 'kw', 'mic', 'cctv', 'audio'],          readonly: ['cctv'] },
  store:    { color: '#4a6480', av: 'SM', pages: ['rec', 'kw', 'mic', 'cctv', 'audio'],          readonly: ['cctv'] },
  account:  { color: '#059669', av: 'AC', pages: ['users'],                                       readonly: [] },
  area:     { color: '#d97706', av: 'AM', pages: ['rec', 'kw', 'mic'],                            readonly: ['mic'] },
  employee: { color: '#0891b2', av: 'EM', pages: ['rec'], readonly: [] },
};

export const MULTI_STORE = ['admin', 'area', 'operator', 'store'];

export const NAV_ITEMS = [
  { pg: 'rec',  ico: 'play',  lbl: 'nav_rec' },
  { pg: 'kw',   ico: 'chart', lbl: 'nav_kw' },
  { div: true },
  { pg: 'mic',  ico: 'mic',   lbl: 'nav_mic' },
  { pg: 'cctv', ico: 'cctv',  lbl: 'nav_cctv' },
  { pg: 'users',ico: 'users', lbl: 'nav_users' },
  { div: true },
  { pg: 'audio',ico: 'audio', lbl: 'nav_audio' },
];

export const STORE_LIST = [
  { id: '80012', name: '東京_渋谷店',   code: 'TKY', color: '#2563eb', micOff: 3 },
  { id: '80034', name: '大阪_梅田店',   code: 'OSK', color: '#059669', micOff: 1 },
  { id: '80056', name: '名古屋_栄店',   code: 'NGY', color: '#7c3aed', micOff: 0 },
  { id: '80078', name: '福岡_天神店',   code: 'FUK', color: '#d97706', micOff: 2 },
  { id: '80091', name: '横浜MM店',      code: 'YKH', color: '#dc2626', micOff: 4 },
  { id: '80103', name: '札幌_大通店',   code: 'SPR', color: '#059669', micOff: 0 },
];

export const PAGE_KEY = {
  rec: 'page_rec', kw: 'page_kw', mic: 'page_mic',
  cctv: 'page_cctv', users: 'page_users', audio: 'page_audio'
};

export const PRIORITY_CFG = {
  critical: { label: 'Critical', color: '#dc2626', bg: '#fef2f2', dot: '#dc2626' },
  warning:  { label: 'Warning',  color: '#d97706', bg: '#fffbeb', dot: '#d97706' },
  normal:   { label: 'Normal',   color: '#475569', bg: '#f8fafc', dot: '#94a3b8' },
};

export const RECS = [
  { id: 1, staff: '田中 誠', counter: 'カウンター3', store: '東京_渋谷店', mic: 'TKY.PC3_1', datetime: '2026/03/24 10:14', dur: '0:54', totalSec: 54, reviewed: false,
    kws: ['カスハラ'], note: { ja: '顧客が強い口調で責任者を要求', vi: 'Khách yêu cầu gặp quản lý với giọng hung hăng', en: 'Customer aggressively demanded manager' },
    ts: [
      { sp: 's', t2: '10:14:02', sec: 2, text: { ja: 'いらっしゃいませ。本日はどのようなご用件でしょうか。', vi: 'Xin chào, quý khách cần gì ạ?', en: 'Welcome. How may I help you?' } },
      { sp: 'c', t2: '10:14:08', sec: 8, text: { ja: 'さっさとしろよ、何もたもたしてんだよ。', vi: 'Nhanh lên đi, chờ mãi thế.', en: "Hurry up, you're so slow." } },
      { sp: 's', t2: '10:14:18', sec: 18, text: { ja: '大変失礼いたしました。すぐにご対応いたします。', vi: 'Xin lỗi quý khách, tôi sẽ xử lý ngay.', en: 'I sincerely apologize. Right away.' } },
      { sp: 'c', t2: '10:14:25', sec: 25, text: { ja: '前回も遅かった。責任者出せよ。', vi: 'Lần trước cũng chậm. Gọi quản lý ra đây.', en: 'Last time was slow too. Get the manager.' } },
      { sp: 's', t2: '10:14:38', sec: 38, text: { ja: 'かしこまりました。少々お待ちください。', vi: 'Vâng, xin chờ một chút.', en: 'Understood. One moment please.' } },
    ]
  },
  { id: 2, staff: '田中 誠', counter: 'カウンター2', store: '東京_渋谷店', mic: 'TKY.PC2_1', datetime: '2026/03/24 10:07', dur: '1:02', totalSec: 62, reviewed: true,
    kws: ['血圧'], note: { ja: '', vi: '', en: '' },
    ts: [
      { sp: 's', t2: '10:07:01', sec: 1, text: { ja: 'いらっしゃいませ。', vi: 'Xin chào.', en: 'Welcome.' } },
      { sp: 'c', t2: '10:07:05', sec: 5, text: { ja: '血圧の薬を受け取りに来ました。', vi: 'Tôi đến lấy thuốc huyết áp.', en: "I'm here for my blood pressure medication." } },
      { sp: 's', t2: '10:07:12', sec: 12, text: { ja: '少々お待ちください。保険証はお持ちですか？', vi: 'Xin chờ. Quý khách có thẻ bảo hiểm không?', en: 'One moment. Do you have your insurance card?' } },
      { sp: 'c', t2: '10:07:22', sec: 22, text: { ja: 'はい、こちらです。', vi: 'Vâng, đây ạ.', en: 'Yes, here you go.' } },
      { sp: 's', t2: '10:07:31', sec: 31, text: { ja: '血圧のお薬は毎日同じ時間にお飲みください。', vi: 'Thuốc huyết áp xin uống vào cùng giờ mỗi ngày.', en: 'Please take your blood pressure medication at the same time each day.' } },
    ]
  },
  { id: 3, staff: '鈴木 一郎', counter: 'カウンター2', store: '大阪_梅田店', mic: 'OSK.PC2_1', datetime: '2026/03/24 09:51', dur: '0:31', totalSec: 31, reviewed: true,
    kws: ['インフルエンザ'], note: { ja: '', vi: '', en: '' },
    ts: [
      { sp: 's', t2: '09:51:03', sec: 3, text: { ja: 'お待たせいたしました。', vi: 'Xin lỗi đã chờ.', en: 'Sorry to keep you waiting.' } },
      { sp: 'c', t2: '09:51:07', sec: 7, text: { ja: 'インフルエンザの検査キット、ありますか？', vi: 'Kit cúm còn hàng không?', en: 'Do you have flu test kits?' } },
      { sp: 's', t2: '09:51:14', sec: 14, text: { ja: 'はい、本日は在庫があります。', vi: 'Vâng, hôm nay còn hàng.', en: 'Yes, we have some today.' } },
    ]
  },
  { id: 4, staff: '佐藤 花子', counter: 'カウンター1', store: '東京_渋谷店', mic: 'TKY.PC1_3', datetime: '2026/03/24 09:22', dur: '0:09', totalSec: 9, reviewed: true,
    kws: ['花粉症'], note: { ja: '', vi: '', en: '' },
    ts: [
      { sp: 'c', t2: '09:22:04', sec: 4, text: { ja: '花粉症に効く薬はどれですか？', vi: 'Thuốc nào tốt cho viêm mũi phấn hoa?', en: 'What works best for hay fever?' } },
      { sp: 's', t2: '09:22:10', sec: 10, text: { ja: 'アレグラFXがお勧めです。', vi: 'Allegra FX là tốt nhất.', en: 'Allegra FX is our best recommendation.' } },
    ]
  },
  { id: 7, staff: '田中 誠', counter: 'カウンター1', store: '東京_渋谷店', mic: 'TKY.PC1_2', datetime: '2026/03/24 09:40', dur: '0:38', totalSec: 38, reviewed: true,
    kws: ['処方箋'], note: { ja: '', vi: '', en: '' },
    ts: [
      { sp: 'c', t2: '09:40:03', sec: 3, text: { ja: '処方箋を持ってきました。', vi: 'Tôi mang đơn thuốc đến.', en: 'I brought my prescription.' } },
      { sp: 's', t2: '09:40:10', sec: 10, text: { ja: 'かしこまりました。少々お待ちください。', vi: 'Vâng, xin chờ một chút.', en: 'Understood. One moment please.' } },
      { sp: 'c', t2: '09:40:25', sec: 25, text: { ja: 'ジェネリックでお願いします。', vi: 'Cho tôi thuốc generic.', en: 'I would like the generic version.' } },
      { sp: 's', t2: '09:40:33', sec: 33, text: { ja: 'ジェネリック医薬品でご用意いたします。', vi: 'Tôi sẽ chuẩn bị thuốc generic.', en: 'I will prepare the generic medication for you.' } },
    ]
  },
  { id: 8, staff: '佐藤 花子', counter: 'カウンター1', store: '東京_渋谷店', mic: 'TKY.PC1_1', datetime: '2026/03/24 09:15', dur: '0:28', totalSec: 28, reviewed: true,
    kws: ['風邪薬'], note: { ja: '子供用の風邪薬について相談', vi: 'Tư vấn thuốc cảm cho trẻ em', en: 'Consultation about cold medicine for children' },
    ts: [
      { sp: 'c', t2: '09:15:02', sec: 2, text: { ja: '子供用の風邪薬はありますか？', vi: 'Có thuốc cảm cho trẻ em không?', en: 'Do you have cold medicine for children?' } },
      { sp: 's', t2: '09:15:08', sec: 8, text: { ja: 'お子様の年齢を教えていただけますか？', vi: 'Xin cho biết tuổi của bé?', en: 'Could you tell me the child\'s age?' } },
      { sp: 'c', t2: '09:15:15', sec: 15, text: { ja: '5歳です。', vi: 'Bé 5 tuổi.', en: 'Five years old.' } },
      { sp: 's', t2: '09:15:22', sec: 22, text: { ja: 'こちらのシロップタイプがお勧めです。', vi: 'Loại siro này phù hợp nhất.', en: 'I recommend this syrup type.' } },
    ]
  },
  { id: 9, staff: '田中 誠', counter: 'カウンター2', store: '東京_渋谷店', mic: 'TKY.PC2_1', datetime: '2026/03/24 08:50', dur: '1:15', totalSec: 75, reviewed: false,
    kws: ['副作用', '血圧'], note: { ja: '副作用の相談、医師への確認を推奨', vi: 'Tư vấn tác dụng phụ, khuyên hỏi bác sĩ', en: 'Side effects consultation, recommended doctor follow-up' },
    ts: [
      { sp: 'c', t2: '08:50:05', sec: 5, text: { ja: '血圧の薬を飲み始めてからめまいがします。', vi: 'Từ khi uống thuốc huyết áp tôi bị chóng mặt.', en: 'I have been feeling dizzy since starting blood pressure medication.' } },
      { sp: 's', t2: '08:50:15', sec: 15, text: { ja: 'どの薬をお飲みですか？', vi: 'Quý khách đang uống thuốc gì?', en: 'Which medication are you taking?' } },
      { sp: 'c', t2: '08:50:28', sec: 28, text: { ja: 'アムロジピンです。', vi: 'Amlodipine.', en: 'Amlodipine.' } },
      { sp: 's', t2: '08:50:40', sec: 40, text: { ja: '副作用の可能性がありますので、かかりつけ医にご相談ください。', vi: 'Có thể là tác dụng phụ, xin tham khảo bác sĩ.', en: 'This may be a side effect. Please consult your prescribing doctor.' } },
    ]
  },
  { id: 10, staff: '佐藤 花子', counter: 'カウンター3', store: '東京_渋谷店', mic: 'TKY.PC3_1', datetime: '2026/03/24 08:30', dur: '0:18', totalSec: 18, reviewed: false,
    kws: [], note: { ja: '', vi: '', en: '' },
    ts: [
      { sp: 'c', t2: '08:30:02', sec: 2, text: { ja: 'ビタミンCのサプリはどこですか？', vi: 'Vitamin C bổ sung ở đâu?', en: 'Where are the vitamin C supplements?' } },
      { sp: 's', t2: '08:30:08', sec: 8, text: { ja: '右側の棚にございます。', vi: 'Ở kệ bên phải.', en: 'On the right shelf.' } },
    ]
  },
  { id: 5, staff: '中村 次郎', counter: 'カウンター4', store: '名古屋_栄店', mic: 'NGY.PC4_2', datetime: '2026/03/24 09:14', dur: '0:45', totalSec: 45, reviewed: false,
    kws: ['糖尿病'], note: { ja: '副作用について相談あり', vi: 'Tư vấn về tác dụng phụ', en: 'Consultation about medication side effects' },
    ts: [
      { sp: 'c', t2: '09:14:01', sec: 1, text: { ja: '糖尿病の薬が切れそうです。', vi: 'Thuốc tiểu đường sắp hết rồi.', en: 'My diabetes medication is running out.' } },
      { sp: 's', t2: '09:14:09', sec: 9, text: { ja: '処方箋を拝見します。メトホルミンですね。', vi: 'Để tôi xem đơn. Metformin phải không?', en: 'Let me check. That is Metformin, correct?' } },
      { sp: 'c', t2: '09:14:30', sec: 30, text: { ja: '副作用が心配なのですが。', vi: 'Tôi lo về tác dụng phụ.', en: 'I am worried about side effects.' } },
      { sp: 's', t2: '09:14:40', sec: 40, text: { ja: '食後にお飲みください。胃腸症状が軽減されます。', vi: 'Uống sau bữa ăn để giảm triệu chứng dạ dày.', en: 'Take after meals to reduce gastrointestinal effects.' } },
    ]
  },
  { id: 6, staff: '山本 健', counter: 'カウンター2', store: '福岡_天神店', mic: 'FUK.PC2_1', datetime: '2026/03/24 09:05', dur: '0:22', totalSec: 22, reviewed: false,
    kws: ['血圧'], note: { ja: '', vi: '', en: '' },
    ts: [
      { sp: 'c', t2: '09:05:02', sec: 2, text: { ja: '血圧計はどこにありますか？', vi: 'Máy đo huyết áp ở đâu?', en: 'Where are the blood pressure monitors?' } },
      { sp: 's', t2: '09:05:09', sec: 9, text: { ja: '奥の棚にございます。', vi: 'Ở kệ phía trong.', en: 'They are on the back shelf.' } },
    ]
  },
];

export const INITIAL_PRIORITY_RULES = [
  { priority: 'critical', keywords: ['カスハラ', 'クレーム', '責任者', '返金'] },
  { priority: 'warning', keywords: ['血圧', '糖尿病', 'インフルエンザ', '花粉症', '副作用', '処方箋', '保険証'] },
];

export const INITIAL_ACCESS_REQUESTS = [
  {
    id: 'ar1',
    recId: 2,
    employeeName: 'Tanaka Makoto',
    employeeInitials: 'TM',
    employeeColor: '#0891b2',
    reason: 'A customer called back about this consultation and I need to check what was discussed.',
    submittedAt: '2026/03/24 11:32',
    status: 'pending',
    decidedAt: null,
    denialReason: null,
  },
  {
    id: 'ar2',
    recId: 1,
    employeeName: 'Tanaka Makoto',
    employeeInitials: 'TM',
    employeeColor: '#0891b2',
    reason: null,
    submittedAt: '2026/03/24 10:58',
    status: 'denied',
    decidedAt: '2026/03/24 11:10',
    denialReason: 'This recording is currently subject to an internal review. Access requests cannot be granted until the review is complete.',
  },
  {
    id: 'ar3',
    recId: 4,
    employeeName: 'Tanaka Makoto',
    employeeInitials: 'TM',
    employeeColor: '#0891b2',
    reason: 'I want to review how I handled the hay fever consultation.',
    submittedAt: '2026/03/24 10:00',
    status: 'approved',
    decidedAt: '2026/03/24 10:20',
    denialReason: null,
  },
  {
    id: 'ar4',
    recId: 6,
    employeeName: 'Yamamoto Ken',
    employeeInitials: 'YK',
    employeeColor: '#059669',
    reason: 'I want to review how I handled the blood pressure inquiry.',
    submittedAt: '2026/03/24 09:45',
    status: 'pending',
    decidedAt: null,
    denialReason: null,
  },
];

export const KW_ANALYTICS_DATA = [
  { kw: '血圧', n: 8120, pct: 21 },
  { kw: '糖尿病', n: 6430, pct: 17 },
  { kw: '風邪薬', n: 5880, pct: 15 },
  { kw: 'インフルエンザ', n: 4210, pct: 11 },
  { kw: '花粉症', n: 3640, pct: 9 },
  { kw: 'ビタミン', n: 2910, pct: 8 },
];

export const MICS_DATA = [
  { id: '80012.TKY.PC1_1', store: '東京_渋谷店', ver: '1.5.5.0', tags: ['enable'], on: false, error: false },
  { id: '80012.TKY.PC2_2', store: '東京_渋谷店', ver: '1.5.5.0', tags: ['enable', 'utraview'], on: true,  error: false },
  { id: '80012.TKY.PC3_1', store: '東京_渋谷店', ver: '1.5.5.0', tags: ['enable'], on: false, error: true  },
  { id: '80034.OSK.PC1_3', store: '大阪_梅田店', ver: '1.5.5.0', tags: ['enable'], on: true,  error: false },
  { id: '80056.NGY.PC2_1', store: '名古屋_栄店', ver: '1.5.5.0', tags: ['enable'], on: true,  error: false },
  { id: '80078.FUK.PC1_2', store: '福岡_天神店', ver: '1.5.5.0', tags: ['enable', 'utraview'], on: false, error: true  },
  { id: '80091.YKH.PC1_1', store: '横浜MM店', ver: '1.5.4.2', tags: ['enable'], on: false, error: false },
  { id: '80091.YKH.PC2_1', store: '横浜MM店', ver: '1.5.4.2', tags: [], on: false, error: false },
];

export const CCTV_DATA = [
  { code: '80012', addr: '東京都渋谷区道玄坂1-2-3', brand: 'Hikvision', cams: 4, ret: 30, ok: true },
  { code: '80034', addr: '大阪府大阪市北区梅田2-4-6', brand: 'Hikvision', cams: 3, ret: 30, ok: true },
  { code: '80056', addr: '愛知県名古屋市中区栄3-5-1', brand: 'Hikvision', cams: 2, ret: 30, ok: true },
  { code: '80078', addr: '福岡県福岡市中央区天神1-10', brand: 'Dahua', cams: 3, ret: 30, ok: false },
  { code: '80091', addr: '神奈川県横浜市西区みなとみらい2-2', brand: 'Hikvision', cams: 2, ret: 90, ok: true },
  { code: '80103', addr: '北海道札幌市中央区大通西4-1', brand: 'Hikvision', cams: 4, ret: 30, ok: true },
  { code: '80117', addr: '京都府京都市中京区四条通5-3', brand: 'Dahua', cams: 3, ret: 30, ok: true },
];

export const USERS_DATA = [
  { nm: '山田 太郎', email: 'yamada@navipost.jp', role: 'admin', store: '— All', login: '2026-03-24', active: true },
  { nm: '中島 浩二', email: 'nakajima@navipost.jp', role: 'area', store: '関東エリア (4店舗)', login: '2026-03-24', active: true },
  { nm: '田中 誠', email: 'tanaka@navipost.jp', role: 'store', store: '東京_渋谷店', login: '2026-03-24', active: true },
  { nm: '佐藤 健二', email: 'sato@navipost.jp', role: 'operator', store: '大阪_梅田店', login: '2026-03-23', active: true },
  { nm: '木村 花子', email: 'kimura@navipost.jp', role: 'account', store: '— HQ', login: '2026-03-20', active: true },
  { nm: '中村 次郎', email: 'nakamura@navipost.jp', role: 'store', store: '名古屋_栄店', login: '2026-03-21', active: false },
  { nm: '鈴木 一郎', email: 'suzuki@navipost.jp', role: 'operator', store: '福岡_天神店', login: '2026-03-24', active: true },
  { nm: '林 直樹', email: 'hayashi@navipost.jp', role: 'store', store: '横浜MM店', login: '2026-03-19', active: true },
];
