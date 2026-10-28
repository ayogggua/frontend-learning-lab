// 每课由讲解、真实可运行代码、逐行注释、练习和理解题组成。
window.COURSE = [];
const addLesson = lesson => window.COURSE.push(lesson);
const guide = (title, text) => ({ title, text });
const note = (file, match, text) => ({ file, match, text });
const quiz = (question, options, answer, explanation) => ({ question, options, answer, explanation });
const ref = (title, url) => ({title,url});
const commonCSS = `body { font-family: system-ui, sans-serif; padding: 24px; color: #223c35; }
button, input, select { font: inherit; padding: 8px 12px; }
button { cursor: pointer; }
output { display: block; margin-top: 16px; }`;
addLesson({id:'entry',group:'一 · 浏览器与页面',title:'三个文件怎样连起来',summary:'从 HTML 入口，追到按钮的一次点击。',time:18,
 concepts:[guide('浏览器打开的是文档','访问一个 URL，服务器返回 HTML。index.html 是常见约定，不是浏览器强制要求的文件名；服务端也可以动态生成 HTML。HTML 中的 link 和 script 声明资源依赖，CSS 并不会自动去调用 JavaScript。'),guide('三个文件通过节点相遇','HTML 的 id="count" 给节点命名；CSS 的 #count 选择器匹配这个节点；JS 的 querySelector("#count") 获取同一个节点对象。它们共享的是 DOM，彼此不需要导入对方。'),guide('执行一次，然后等待事件','脚本在初始化时拿到节点并注册监听器。函数注册时不会加一，点击发生后才执行回调。修改数字变量不会自动改变原生 DOM，textContent 赋值才把数字写到页面。')],
 html:`<h1>订单计数器</h1>
<button id="add" type="button">增加一笔</button>
<output id="count" aria-live="polite">0</output>`,css:commonCSS+`\n#count { font-size: 40px; color: #0b6b5c; }`,js:`let count = 0;
const button = document.querySelector('#add');
const output = document.querySelector('#count');
button.addEventListener('click', () => {
  count += 1;
  output.textContent = count;
  console.log('点击后 count =', count);
});`,
 notes:[note('html','id="count"','output 是显示计算结果的语义元素。id 在当前文档中应唯一。'),note('css','#count','同一个 #count：CSS 通过选择器找到这个元素并改变显示样式。'),note('js','querySelector','查询当前预览文档中的节点，返回 Element 或 null。节点不存在时绑定事件会失败。'),note('js','textContent','原生 JS 必须显式更新 DOM。count 的数字和页面上的文本是两个对象。')],steps:['先点击按钮两次，看日志和数字同步变化。','把 count += 1 改成 count += 2，运行后重新点击。','取消“执行 JS”再运行，观察按钮仍存在但计数不变。'],task:'把每次点击的增量改为 2。运行后点一次按钮，再检查。',check:`return document.querySelector('#count')?.textContent === '2'`,hint:'修改 JS 的 count += 1；每次运行会创建一个新页面，计数从 0 开始。',quiz:quiz('哪一步直接改变了屏幕上的数字？',['count += 1','output.textContent = count','创建 button 变量'],1,'count 只改变 JavaScript 内存；textContent 将值写入 DOM，浏览器随后更新显示。'),refs:[ref('MDN：Web 标准入门','https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards')]});
addLesson({id:'loading',group:'一 · 浏览器与页面',title:'加载顺序与浏览器渲染',summary:'区分下载、执行、DOM 就绪与屏幕绘制。',time:20,
 concepts:[guide('资源下载可以并行','浏览器解析 HTML 时发现 CSS 和脚本，预加载扫描器也可能提前发现资源。普通外部经典脚本会暂停解析以下载和执行；defer 允许并行下载，在文档解析后执行，并保持文档顺序。'),guide('defer 不等于画面已经显示','defer 脚本在 DOMContentLoaded 前执行。首次绘制发生的时机受样式、脚本和浏览器调度影响，不能固定写成“先首次渲染，再执行 defer”。type="module" 默认具有延迟执行行为；async 则下载完尽快执行。'),guide('DOM 不是截图','HTML 解析产生 DOM；CSS 解析产生样式规则，浏览器计算样式、布局，再绘制和合成。并非每次修改都做完整流程：尺寸变化可能需要布局，颜色变化通常需要重绘，合成优化也需浏览器条件支持。')],
 html:`<h2>观察真实的 DOM 变化</h2>
<button id="change">修改标题</button>
<p id="target">初始文字</p>`,css:commonCSS,js:`console.log('脚本执行，readyState:', document.readyState);
const target = document.querySelector('#target');
console.log('节点已存在:', Boolean(target));
new MutationObserver(records => {
  console.log('观察到 DOM 修改:', records.length);
}).observe(target, { childList: true });
document.querySelector('#change').onclick = () => {
  target.textContent = 'DOM 已更新';
  console.log('同步代码结束');
};`,notes:[note('js','readyState','本平台把示例 JS 放在预览 body 之后，因此节点已存在。它不是对外部脚本下载顺序的测量。'),note('js','MutationObserver','回调在同步执行结束后的微任务阶段收到 DOM 变化通知，不是逐条同步调用。')],steps:['运行后看脚本执行时节点是否存在。','点“修改标题”，观察日志先同步结束，再通知 DOM 修改。','在 Elements 面板查看修改后的文本节点。'],task:'点击“修改标题”，让段落文字变成 DOM 已更新。',check:`return document.querySelector('#target').textContent === 'DOM 已更新'`,hint:'运行会复原文档，随后点击预览中的按钮。',quiz:quiz('defer 保证的是什么？',['一定在首次绘制之后执行','在 HTML 解析完成后、DOMContentLoaded 前执行','所有接口响应完成后执行'],1,'defer 约束解析和脚本执行关系，不保证首次绘制已完成。'),refs:[ref('MDN：script / defer','https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script')]});
addLesson({id:'html',group:'一 · 浏览器与页面',title:'语义 HTML 与原生表单',summary:'让浏览器先提供结构、验证和键盘行为。',time:22,
 concepts:[guide('标签是行为契约','链接用于导航，button 用于动作，form 组织提交。可点击的 div 不会自动拥有按钮的键盘行为。h1 到 h6 表达标题层级，不是字号选择器。'),guide('属性和 DOM 属性有区别','HTML attribute 是初始声明；运行时 input.value 是当前输入，用户修改后不一定反映到 value attribute。name 决定 FormData 字段名，id 用于 label 关联和节点查询。'),guide('校验按职责分层','required、type=email、minlength 提供基本浏览器校验。无效表单通常不会触发 submit。前端验证改善体验，后端仍必须验证权限、数据格式和业务约束。')],
 html:`<form id="signup">
  <label for="email">邮箱</label>
  <input id="email" name="email" type="text">
  <button type="submit">提交</button>
  <output id="message" aria-live="polite"></output>
</form>`,css:commonCSS,js:`document.querySelector('#signup').onsubmit = event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  document.querySelector('#message').textContent =
    '收到邮箱：' + data.get('email');
  console.log(Object.fromEntries(data));
};`,notes:[note('html','name="email"','id 连接 label；name 使表单序列化时出现 email 字段。两者职责不同。'),note('js','preventDefault','阻止原生提交导航。本例由 JS 处理数据，不刷新整个页面。')],steps:['先输入无效邮箱，发现现在仍能提交。','把 type 改成 email，并添加 required。','清空或输入 abc 后按提交，观察浏览器阻止提交。'],task:'让邮箱成为必填的 email 类型。',check:`const e=document.querySelector('#email'); return e.required && e.type === 'email'`,hint:'修改 HTML 的 input：type="email" required。',quiz:quiz('后端可以因为有 required 就省略校验吗？',['可以','不可以'],1,'用户可以绕过网页直接请求接口。浏览器校验不是服务端信任边界。'),refs:[ref('MDN：表单','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms')]});
addLesson({id:'box',group:'二 · CSS 与设计',title:'盒模型：尺寸到底怎么算',summary:'亲手改变 padding，读取浏览器测量值。',time:20,
 concepts:[guide('一个元素有四层空间','内容 content，内部留白 padding，边框 border，外部留白 margin。背景通常会覆盖 padding，margin 则位于盒子之外。margin 不计入 getBoundingClientRect 的宽度。'),guide('width 的含义由 box-sizing 决定','content-box 下，width 只限定内容宽；实际边框盒宽度为 width + 左右 padding + 左右 border。border-box 下，width 已包含 padding 和 border。'),guide('尺寸与溢出要一起看','设置固定宽度不代表内容一定放得下。长单词、图片、flex 子项的默认最小尺寸可能撑出容器。DevTools 的盒模型和实际计算样式是判断依据。')],
 html:`<div id="box">订单内容</div>
<button id="measure">测量盒子</button>
<output id="size"></output>`,css:commonCSS+`\n#box {
  width: 240px;
  padding: 24px;
  border: 4px solid #0b6b5c;
  margin: 20px 0;
  box-sizing: content-box;
  background: #e4efe9;
}`,js:`document.querySelector('#measure').onclick = () => {
  const box = document.querySelector('#box');
  const width = box.getBoundingClientRect().width;
  document.querySelector('#size').textContent = width + 'px';
  console.log('实际边框盒宽度:', width);
};`,notes:[note('css','box-sizing','现在总宽是 240 + 24×2 + 4×2 = 296px。改成 border-box 后总宽为 240px。'),note('js','getBoundingClientRect','读取实际布局结果，不是直接读取 CSS 写下的 width。')],steps:['预测宽度，再点测量验证。','把 box-sizing 改成 border-box，再测一次。','把 padding 改成 36px，观察 border-box 总宽保持不变。'],task:'让盒子的实际总宽等于 240px，保留 padding 和 border。',check:`return Math.round(document.querySelector('#box').getBoundingClientRect().width) === 240`,hint:'把 content-box 改成 border-box。',quiz:quiz('border-box 的 width 包含 margin 吗？',['包含','不包含'],1,'border-box 包含 content、padding、border；margin 始终位于其外部。'),refs:[ref('MDN：盒模型','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model')]});
addLesson({id:'cascade',group:'二 · CSS 与设计',title:'选择器、层叠与继承',summary:'解决“我写了 CSS，为什么没生效”。',time:20,
 concepts:[guide('浏览器要先选出获胜声明','层叠会考虑来源、重要性、层、选择器特异性和出现顺序。仅在前面条件相同时，后写的声明胜出。不能把“后写覆盖前写”当成普遍规则。'),guide('并不是所有属性都继承','color、font-family 通常继承；margin、padding、border 通常不继承。子元素也可能被浏览器默认样式或更具体的声明覆盖。'),guide('调试顺序','先确认元素匹配了选择器，再查看 Computed 最终值，然后沿被划掉的声明找到覆盖来源。优先调整组件边界和选择器，避免到处追加 !important。')],
 html:`<article class="panel"><h2>待支付订单</h2>
<button id="save" class="primary">保存</button></article>
<output id="computed"></output>`,css:commonCSS+`\n.panel { color: #164e3f; }
#save { background-color: rgb(180, 50, 50); }
.primary { background-color: rgb(20, 110, 80); color: white; }`,js:`const button = document.querySelector('#save');
document.querySelector('#computed').textContent =
  '最终背景色：' + getComputedStyle(button).backgroundColor;`,notes:[note('css','#save','同一层、来源和重要性下，ID 选择器比 class 选择器特异性更高。即使写在前面也胜出。'),note('js','getComputedStyle','这里读取计算后的颜色，适合确认是哪条规则最终生效。')],steps:['观察按钮颜色，预测是哪条规则胜出。','删掉 #save 的背景规则，再运行。','比较标题继承的文字色与按钮自己声明的文字色。'],task:'让保存按钮变成绿色 rgb(20, 110, 80)，不使用 !important。',check:`return getComputedStyle(document.querySelector('#save')).backgroundColor === 'rgb(20, 110, 80)'`,hint:'删除 #save 的背景声明，或改掉冲突的值。',quiz:quiz('两条同层且同重要性的规则，#save 与 .primary 谁更具体？',['#save','.primary','总是后写的'],0,'ID 的特异性高于 class；位置顺序只有在其他优先级相同时才决定胜负。'),refs:[ref('MDN：层叠','https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction')]});
addLesson({id:'layout',group:'二 · CSS 与设计',title:'Flex 与 Grid 的布局规则',summary:'用同一组订单卡片比较一维和二维布局。',time:25,
 concepts:[guide('Flex 先考虑一个主轴','display:flex 默认沿行布局；justify-content 控制主轴剩余空间，align-items 控制交叉轴。flex-direction 改变主轴，因此不要死记“水平/垂直居中”。'),guide('Grid 显式定义行列','grid-template-columns 声明列轨道，fr 分配剩余空间。minmax(0,1fr) 允许轨道收缩，减少长内容的固有最小宽度把布局撑开的情况。'),guide('先写布局约束再调像素','侧栏、表单和列表需要不同约束。页面大结构用 Grid，按钮组用 Flex 很常见，但不是强制规则。固定宽度和绝对定位不适合所有区域。')],
 html:`<div class="orders">
  <article>待支付<br>12 笔</article>
  <article>待发货<br>8 笔</article>
  <article>已完成<br>36 笔</article>
</div>`,css:commonCSS+`\n.orders { display: flex; gap: 16px; }
article { padding: 24px; background: #e4efe9; }`,js:`const orders = document.querySelector('.orders');
console.log('布局模式:', getComputedStyle(orders).display);`,notes:[note('css','display: flex','flex 会按照子项基础尺寸分配空间；想均分可给子项 flex:1。'),note('css','gap','gap 表示相邻项目间的空隙，不等于容器的 padding。')],steps:['把 article 加上 flex:1，看卡片均分。','把容器改成 display:grid，再加 grid-template-columns:repeat(3,minmax(0,1fr))。','缩小预览宽度，观察三列是否变得拥挤。'],task:'用 Grid 创建三列等宽卡片，保留 16px 间距。',check:`const s=getComputedStyle(document.querySelector('.orders'));return s.display==='grid' && s.gridTemplateColumns.split(' ').length===3 && s.gap==='16px'`,hint:'容器声明 display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px。',quiz:quiz('Flex 的 justify-content 控制什么？',['固定的水平方向','主轴方向的空间分配','字体大小'],1,'主轴由 flex-direction 决定，可以是 row，也可以是 column。'),refs:[ref('MDN：Flexbox','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox'),ref('MDN：Grid','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids')]});
addLesson({id:'responsive',group:'二 · CSS 与设计',title:'响应式与可用的窄屏页面',summary:'拖动预览宽度，触发真正的媒体查询。',time:20,
 concepts:[guide('设计断点来自内容','先缩窄页面，看筛选项和表格何时难用，再决定断点。断点不必与某个手机型号绑定。移动端 viewport 元信息也影响 CSS 像素与屏幕的对应关系。'),guide('布局变化要保证任务可完成','桌面三列可在窄屏改一列，表格可放入横向滚动容器。不要直接隐藏关键操作；触摸目标要足够大，错误提示和焦点应继续可见。'),guide('测宽度也要测内容','超长订单号、多语言标签、浏览器缩放和大字号都会影响布局。这里的预览是真实 iframe，其宽度就是媒体查询使用的视口宽度。')],
 html:`<div class="cards"><article>订单号：OD-001</article><article>客户：张三</article><article>状态：待支付</article></div>`,css:commonCSS+`\n.cards { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
article { background:#e4efe9; padding:24px; }
@media (max-width: 520px) {
  .cards { grid-template-columns: 1fr; }
}`,js:`const report = () => console.log('视口宽度:', innerWidth,
  '列数:', getComputedStyle(document.querySelector('.cards')).gridTemplateColumns);
addEventListener('resize', report);
report();`,notes:[note('css','@media','这条规则由 iframe 视口决定，拖动上方预览宽度即可真实触发。'),note('js','resize','浏览器发出 resize 事件，回调读取更新后的布局。频繁的昂贵计算可考虑节流。')],steps:['先使用宽屏，再切到 375px。','把断点改成 600px，拖动宽度观察变化。','使用长文本替换订单号，检查溢出。'],task:'切换到 375px 窄屏，确认卡片为一列。',check:`return innerWidth<=520 && getComputedStyle(document.querySelector('.cards')).gridTemplateColumns.split(' ').length===1`,hint:'点击预览上方“375px”，这会改变 iframe 实际宽度。',quiz:quiz('媒体查询里的 max-width 测的是？',['屏幕物理像素','布局视口的 CSS 像素宽度','当前元素文字宽度'],1,'在这个实验中是预览 iframe 的布局视口，不是显示器物理像素。'),refs:[ref('MDN：响应式设计','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design')]});
addLesson({id:'design',group:'二 · CSS 与设计',title:'从需求与 Figma 到组件',summary:'把颜色、间距、状态和约束落实成代码。',time:25,
 concepts:[guide('先把用户任务和验收条件写清','订单页的任务是定位订单并处理它。评审需求时确认角色权限、关键字段、筛选与分页规则、空/错/加载态。Figma 可以帮助表达流程，但未必存在专职设计师或固定流程。'),guide('读设计稿时读关系','Auto Layout 表示方向、间距和伸缩关系，映射到 Flex/Grid 时仍要考虑内容。固定像素坐标不是通用布局方案。组件 variants 常对应禁用、加载、选中状态。'),guide('设计变量成为代码契约','颜色、间距、圆角可放到 CSS 自定义属性中。统一变量能让多个组件一起调整。像素接近之外，还要验证键盘、文字溢出、窄屏和状态反馈。')],
 html:`<article class="order-card"><h2>待支付订单</h2><p>确认收款信息后，再进行后续处理。</p><button>查看详情</button></article>
<article class="order-card"><h2>待发货订单</h2><p>检查收件地址和发货方式。</p><button>查看详情</button></article>`,css:commonCSS+`\n:root { --space: 12px; --accent: #0b6b5c; }
.order-card { padding:var(--space); margin-bottom:var(--space); border:1px solid #ccd9d2; }
.order-card button { background:var(--accent); color:white; border:0; }`,js:`console.log('两个卡片共享 --space 和 --accent。');`,notes:[note('css',':root','在文档根节点定义 token，后代通过继承使用它。'),note('css','var(--space)','设计稿的一次变量变更可影响所有引用处。局部组件也可覆盖该变量。')],steps:['把 --space 从 12px 改成 24px，观察两张卡片同时变。','尝试只给第一张卡片覆盖 --accent。','设想权限不足、加载中、无结果三个设计变体。'],task:'通过共享变量，让两张卡片的 padding 都变成 24px。',check:`return [...document.querySelectorAll('.order-card')].every(e=>getComputedStyle(e).paddingTop==='24px')`,hint:'修改 :root 中 --space:24px。',quiz:quiz('从 Figma 实现响应式时应该优先读取什么？',['每个元素的绝对坐标','布局约束、间距与伸缩关系','图层名字长度'],1,'设计稿是一个宽度下的样本；布局关系才能推广到不同内容和视口。'),refs:[ref('MDN：CSS 自定义属性','https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties')]});
addLesson({id:'javascript',group:'三 · JavaScript 与数据',title:'数据转换、引用与不可变更新',summary:'用订单数组理解 filter、map、reduce。',time:25,
 concepts:[guide('界面经常需要派生数据','接口给的是领域数据，UI 需要过滤、排序和格式化。filter 选择元素，map 变换元素，reduce 汇总结果。先计算数据再渲染，便于定位“数据不对”还是“页面不对”。'),guide('const 固定绑定，不冻结对象','const items = [] 禁止重新赋值 items，但仍能 push。对象浅拷贝只复制第一层，嵌套引用仍共享。别把前端状态当作随意修改的全局对象。'),guide('金额和排序的边界','示例用整数“分”保存金额，展示时除以 100。sort 默认改变原数组；可先用 [...items] 再排序。后端分页数据不等于全量，前端过滤当前页不能冒充全量筛选。')],
 html:`<h2>待支付订单合计</h2><output id="total"></output><pre id="items"></pre>`,css:commonCSS,js:`const orders = [
  { id: 'A', status: 'pending', cents: 1200 },
  { id: 'B', status: 'paid', cents: 800 },
  { id: 'C', status: 'pending', cents: 600 }
];
const pending = orders.filter(o => o.status === 'pending');
const total = pending.reduce((sum, o) => sum + o.cents, 0);
document.querySelector('#total').textContent = '¥' + (total / 100).toFixed(2);
document.querySelector('#items').textContent = JSON.stringify(pending, null, 2);
console.log('原始数组长度:', orders.length);`,notes:[note('js','filter','创建新的数组，但内部元素仍是原来对象的引用。'),note('js','reduce','初始 sum 为 0，逐个累加 cents；空数组也能得到 0。')],steps:['预测总金额，再运行。','给数组加一条 pending、cents 为 200 的订单。','把 filter 改为 paid，解释结果为何变化。'],task:'新增一笔 200 分的待支付订单，使待支付总额为 ¥20.00。',check:`return document.querySelector('#total').textContent==='¥20.00'`,hint:'在 orders 中新增 { id:"D", status:"pending", cents:200 }。',quiz:quiz('const array = [] 之后能 array.push(1) 吗？',['可以','不可以'],0,'const 限制变量重新绑定，数组内容仍可修改。'),refs:[ref('MDN：JavaScript 指南','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide')]});
addLesson({id:'state',group:'三 · JavaScript 与数据',title:'事件、状态与 render',summary:'为待办列表建立可追踪的单向数据流。',time:28,
 concepts:[guide('从事件进入逻辑','用户输入、点击或提交产生 DOM 事件。处理器读取参数，更新状态，再调用 render。监听器注册一次即可；放进每次 render 中可能重复绑定。'),guide('状态与派生结果分开','待办数组是状态；未完成数量由数组计算。不要同时维护 count 和 items.length 两份可推导值，否则很容易不同步。'),guide('事件委托适合动态列表','把点击监听在稳定的父容器上，利用事件冒泡和 closest 找到按钮。重建子节点后仍能响应，但应验证目标属于当前容器。真实大应用还需处理焦点与更新粒度。')],
 html:`<form id="todo-form"><label>任务 <input id="text" required></label><button>添加</button></form><ul id="todos"></ul><output id="count"></output>`,css:commonCSS,js:`let todos = [];
const list = document.querySelector('#todos');
function render() {
  list.replaceChildren();
  for (const todo of todos) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = todo.text + ' · 删除';
    button.dataset.id = todo.id;
    li.append(button); list.append(li);
  }
  document.querySelector('#count').textContent = todos.length + ' 项';
}
document.querySelector('#todo-form').onsubmit = event => {
  event.preventDefault();
  todos.push({ id: String(Date.now()), text: document.querySelector('#text').value });
  event.currentTarget.reset(); render();
};
list.onclick = event => {
  const button = event.target.closest('button');
  if (!button) return;
  todos = todos.filter(t => t.id !== button.dataset.id);
  render();
};
render();`,notes:[note('js','replaceChildren','清空旧列表再创建新 DOM，本例简单可理解；生产中大量节点更新可能需要更细粒度策略。'),note('js','textContent','用户输入作为文字写入节点，不把它当作 HTML 解释。'),note('js','list.onclick','事件委托在不重建的父节点上。')],steps:['添加两条任务，观察数量。','删除一条，确认数量自动派生。','输入 <b>hello</b>，确认它显示为文字。'],task:'添加两条任务，再删除其中一条，最后保留 1 项。',check:`return document.querySelectorAll('#todos li').length===1`,hint:'先在预览输入框填写任务，按 Enter 提交；列表按钮可删除。',quiz:quiz('哪个值最适合直接由状态计算？',['todos 数组','未完成任务数量','用户输入草稿'],1,'派生值按需计算能避免与源数据不同步。'),refs:[ref('MDN：事件','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events')]});
addLesson({id:'async',group:'三 · JavaScript 与数据',title:'事件循环与 async / await',summary:'观察同步代码、微任务与 timer 的实际顺序。',time:25,
 concepts:[guide('一个任务要先执行完','常见浏览器页面 JS 在主线程运行，一个同步回调会执行到结束。长时间循环会阻挡输入与渲染，async 函数本身不会自动把计算移到后台。'),guide('Promise 回调进入微任务队列','当前调用栈清空后，浏览器执行微任务，再有机会处理下一个任务与渲染。setTimeout(0) 表示尽早排入后续任务，不是立即调用。'),guide('await 暂停的是当前 async 函数','await 之后的代码等待 Promise，并作为后续微任务继续；其他代码可以执行。响应耗时、DOM 更新与浏览器真正绘制的时机是不同概念。')],
 html:`<button id="run">运行顺序实验</button><pre id="order"></pre>`,css:commonCSS,js:`document.querySelector('#run').onclick = () => {
  const output = document.querySelector('#order');
  output.textContent = '';
  const log = text => { output.textContent += text + '\\n'; console.log(text); };
  log('1 同步开始');
  setTimeout(() => log('4 timer'), 0);
  Promise.resolve().then(() => log('3 微任务'));
  log('2 同步结束');
};`,notes:[note('js','setTimeout','注册回调后立刻返回，延迟参数不是精确执行时间。'),note('js','Promise.resolve','已经 fulfilled 的 Promise，其 then 也不会同步执行。')],steps:['先预测顺序，再点击运行。','把 Promise 行与 timer 行交换位置，比较结果。','在 log(同步结束) 前加入另一个同步 log，解释它的位置。'],task:'点击运行，观察输出 1 → 2 → 3 → 4。',check:`return document.querySelector('#order').textContent.includes('1 同步开始\\n2 同步结束\\n3 微任务\\n4 timer')`,hint:'只需点击预览按钮，顺序由浏览器真实调度产生。',quiz:quiz('async 函数内的巨大同步循环会阻塞主线程吗？',['会','不会'],0,'async 不会自动使用 Worker；耗时计算仍会阻塞主线程。'),refs:[ref('MDN：执行模型','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model')]});
addLesson({id:'requests',group:'三 · JavaScript 与数据',title:'接口、异常与取消请求',summary:'区分 HTTP 错误与网络错误，完整处理状态。',time:35,
 concepts:[guide('先对齐接口契约','明确查询参数、响应结构、可空值、错误码和分页含义。此课 mockFetch 是写在示例里的本地教学函数，不产生 HTTP 请求；它返回标准 Response，让你练习消费响应的代码。实际项目将其换成 fetch(url, options)。'),guide('fetch 的拒绝不等于 HTTP 失败','500、404 响应通常仍使 fetch Promise fulfilled，需要检查 response.ok。网络异常或取消才会 reject。JSON 解析也可能失败，try/catch 应覆盖完整链路。'),guide('先处理竞态再美化 loading','快速切换筛选可能先返回旧请求。AbortController 可取消旧请求，并用 requestId 确保只有最新结果覆盖状态。禁用按钮适合防重复提交，但不应代替所有竞态处理。')],
 html:`<label>结果 <select id="mode"><option value="ok">成功</option><option value="empty">空数据</option><option value="error">HTTP 500</option></select></label><button id="load">查询</button><button id="cancel">取消</button><output id="result">idle</output>`,css:commonCSS,js:`// 教学模拟，无真实 HTTP 请求；生产中换成 fetch。
function mockFetch(mode, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(new Response(
      JSON.stringify({ items: mode === 'empty' ? [] : ['OD-001'] }),
      { status: mode === 'error' ? 500 : 200 }
    )), 2000);
    signal.addEventListener('abort', () => {
      clearTimeout(timer); reject(new DOMException('已取消', 'AbortError'));
    }, { once: true });
  });
}
let controller, requestId = 0;
const output = document.querySelector('#result');
document.querySelector('#load').onclick = async () => {
  controller?.abort(); controller = new AbortController();
  const id = ++requestId;
  output.textContent = 'loading'; console.log('loading', id);
  try {
    const response = await mockFetch(document.querySelector('#mode').value, controller.signal);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (id !== requestId) return;
    output.textContent = data.items.length ? data.items.join(', ') : 'empty';
  } catch (error) {
    if (id !== requestId) return;
    output.textContent = error.name === 'AbortError' ? 'cancelled' : error.message;
  }
  console.log('最终状态:', output.textContent);
};
document.querySelector('#cancel').onclick = () => controller?.abort();`,notes:[note('js','response.ok','500 不会自动进入 catch；这一行主动把 HTTP 失败转成异常。'),note('js','id !== requestId','旧请求即使结束，也不能覆盖当前用户的最新意图。'),note('js','AbortController','取消请求只表示客户端放弃等待，不保证服务端没有执行业务操作。')],steps:['成功、空、500 三种情形各试一次。','查询后立刻取消，检查 cancelled。','连续查询时改变结果模式，最终应显示最后一次选择的结果。'],task:'选择 HTTP 500 并查询，确保结果显示 HTTP 500。',check:`return document.querySelector('#result').textContent==='HTTP 500'`,hint:'先选择错误模式，再点击查询，等待约 2 秒。',quiz:quiz('fetch 收到 HTTP 500 会自动 reject 吗？',['会','通常不会，需要检查 response.ok'],1,'HTTP 错误状态仍是有效的 HTTP 响应，网络与 HTTP 错误要分别处理。'),refs:[ref('MDN：使用 Fetch','https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch')]});
addLesson({id:'forms',group:'三 · JavaScript 与数据',title:'表单、草稿与输入防抖',summary:'把输入中的值与已提交的值分开。',time:25,
 concepts:[guide('输入草稿和服务端数据不同','用户还在打字时是 draft，提交成功才成为业务数据。失败时保留草稿，避免用户重复输入。错误信息应靠近相关字段，并允许修正。'),guide('防抖合并快速连续输入','每次 input 清除旧计时器，再创建新计时器。只有安静一段时间后才执行查询。它能减少请求，但已发出的请求仍可能乱序，需要上一课的取消与版本检查。'),guide('中文输入需要考虑组合事件','输入法 composition 期间字符未完成。检查 isComposing，并在 compositionend 调度，避免每个拼音阶段都发请求。')],
 html:`<label>搜索订单 <input id="search" placeholder="输入 A、B 或 C"></label><output id="status">尚未搜索</output>`,css:commonCSS,js:`const input = document.querySelector('#search');
const status = document.querySelector('#status');
let timer;
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    status.textContent = '搜索：' + input.value.trim();
    console.log('实际执行搜索:', input.value.trim());
  }, 400);
}
input.addEventListener('input', event => {
  if (!event.isComposing) schedule();
});
input.addEventListener('compositionstart', () => clearTimeout(timer));
input.addEventListener('compositionend', schedule);`,notes:[note('js','clearTimeout','取消的是尚未执行的计时器，不是已发出的网络请求。'),note('js','isComposing','输入法组合期间先不查询，组合完成后再统一调度。')],steps:['快速输入 ABC，停下后才会出现一条搜索日志。','把 400 改成 1000，感受响应与请求数量的取舍。','尝试中文输入法，检查查询触发时机。'],task:'输入 ABC 并停下，等到页面显示“搜索：ABC”。',check:`return document.querySelector('#status').textContent==='搜索：ABC'`,hint:'修改或填写预览输入框，然后等待防抖时间。',quiz:quiz('防抖能阻止已经发出的旧请求覆盖新结果吗？',['能','不能，还要处理竞态'],1,'防抖只影响调用频率，取消或版本编号负责请求乱序。'),refs:[ref('MDN：InputEvent.isComposing','https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/isComposing')]});
addLesson({id:'routing',group:'四 · 应用组织',title:'路由、URL 与页面状态',summary:'让用户可以刷新、返回和分享当前位置。',time:25,
 concepts:[guide('URL 是可分享的状态','路由表达用户在哪里；查询参数可表达筛选、页码和排序。弹窗开关、输入草稿通常留在局部状态。不要把每个临时值都放进全局 store。'),guide('导航状态不只是点击','刷新、复制链接、浏览器前进后退都应恢复合理界面。此例用 iframe 内的 hash 路由真实处理 hashchange，不触碰主课程地址。生产 History 路由还要配置服务端回退到入口文档。'),guide('持久化另有边界','localStorage 是同步的本地字符串存储；可能被禁用或达到配额。它适合偏好和草稿，不是服务端数据库。本平台将学习进度保存在宿主页面本地，实验沙箱不共享宿主存储。')],
 html:`<nav><a href="#orders">订单</a> <a href="#settings">设置</a></nav><main id="view"></main>`,css:commonCSS,js:`function renderRoute() {
  const route = location.hash.slice(1) || 'orders';
  const views = { orders: '订单列表', settings: '个人设置' };
  document.querySelector('#view').textContent = views[route] || '页面不存在';
  console.log('当前实验路由:', route);
}
addEventListener('hashchange', renderRoute);
renderRoute();`,notes:[note('js','location.hash','hash 属于当前 iframe 地址，不会改变主教程的章节地址。'),note('js','hashchange','捕捉链接和浏览器历史变化，不只是按钮 onclick。')],steps:['点击两个链接，观察日志。','把链接改成 #unknown，观察未知路由。','重新运行会创建新实验页面，当前实验状态被清空。'],task:'导航到设置页面，显示“个人设置”。',check:`return document.querySelector('#view').textContent==='个人设置'`,hint:'点预览中的“设置”链接。',quiz:quiz('订单筛选要可分享，通常应放在哪里？',['只有组件局部变量','URL 查询参数','CSS 变量'],1,'URL 适合可恢复、可分享的导航状态；敏感数据不要放进 URL。'),refs:[ref('MDN：客户端路由与 History','https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API')]});
addLesson({id:'vue',group:'四 · 应用组织',title:'Vue：状态驱动模板',summary:'运行真正的 Vue，理解 ref、computed 和模板绑定。',time:35,engine:'vue',
 concepts:[guide('框架仍通过 HTML 加载','典型 Vue 项目由 HTML 引入 main.js，main.js 创建应用并挂载到 DOM 容器。浏览器入口仍是文档；main.js 是应用初始化入口。这里预加载本地 Vue 3.5.22 教学运行时，无需构建。'),guide('ref 是响应式容器','在 JS 中读写 count.value；模板会对顶层 ref 做解包。computed 表达从状态推导出的值。普通局部变量变化不会自动触发模板更新。'),guide('更新有批处理','响应式状态变了，Vue 会调度 DOM 更新。若要在修改后读取最新 DOM，使用 nextTick。这里的模板运行编译器属于教学方式，生产项目通常预编译单文件组件。')],
 html:`<div id="app"><h2>Vue 订单计数</h2><button @click="add">增加</button><output id="count">{{ count }}</output><p>合计：{{ total }} 元</p></div>`,css:commonCSS,js:`const { createApp, ref, computed, nextTick } = Vue;
createApp({
  setup() {
    const count = ref(0);
    const total = computed(() => count.value * 10);
    async function add() {
      count.value++;
      await nextTick();
      console.log('更新后的 DOM:', document.querySelector('#count').textContent);
    }
    return { count, total, add };
  }
}).mount('#app');`,notes:[note('js','computed','合计由 count 推导，不需要再写一份手动同步的 total 状态。'),note('js','nextTick','等待本次 Vue DOM 更新完成，并不表示网络请求或浏览器绘制已经完成。')],steps:['点击增加，计数和合计同步变化。','把单价 10 改成 25，再运行。','对比第一课：没有手动给 output.textContent 赋值。'],task:'点击增加两次，让 Vue 模板显示 2。',check:`return document.querySelector('#count').textContent==='2'`,hint:'Vue 更新是异步调度的，点完后等待界面更新。',quiz:quiz('Vue JS 中修改 ref 数值通常用什么？',['count++','count.value++','改模板文字'],1,'ref 在 JavaScript 中使用 .value；模板对顶层 ref 自动解包。'),refs:[ref('Vue：响应式基础','https://vuejs.org/guide/essentials/reactivity-fundamentals.html')]});
addLesson({id:'components',group:'四 · 应用组织',title:'组件边界、Props 与事件',summary:'让子组件表达意图，让父组件管理共享数据。',time:30,engine:'vue',
 concepts:[guide('组件按职责拆分','一个可复用的金额展示、一个筛选表单、一个订单行，可能是合理组件。不要为每个 div 建组件；复用、独立交互或复杂度才是拆分依据。'),guide('数据向下，意图向上','父组件通过 props 提供数据；子组件通过事件通知父组件“用户点击了”。子组件不应直接修改传入的业务状态。共享状态放在最近的共同父组件，只有跨区域需求才考虑全局 store。'),guide('列表 key 表示身份','key 帮助框架将新旧节点对应到同一条业务数据。可重排、删除的列表应使用稳定业务 ID，避免只用索引造成输入状态错位。')],
 html:`<div id="app"><order-counter :count="count" @increase="count++"></order-counter><p id="parent">父组件状态：{{ count }}</p></div>`,css:commonCSS,js:`const OrderCounter = {
  props: ['count'],
  emits: ['increase'],
  methods: { increase() { this.$emit('increase'); } },
  template: '<button @click="increase">子组件：增加，当前 {{ count }}</button>'
};
Vue.createApp({
  components: { OrderCounter },
  setup() { return { count: Vue.ref(0) }; }
}).mount('#app');`,notes:[note('js','props','子组件接收父组件当前 count，展示时可读取。'),note('js','emits','声明 increase 事件。事件表达用户意图，父组件决定如何改变业务状态。')],steps:['点击子组件按钮，观察父子显示同步。','把父组件的 count++ 改成 count += 2。','子组件代码不变，但父组件决定增量。'],task:'保持子组件不变，让每次点击父状态增加 2，点击一次后检查。',check:`return document.querySelector('#parent').textContent.includes('2')`,hint:'在 HTML 的 @increase 中把 count++ 改成 count += 2。',quiz:quiz('子组件收到 count prop 后，推荐怎样改变父状态？',['直接赋值 prop','触发事件，由父组件处理'],1,'共享状态的所有者应明确，事件使修改路径可追踪。'),refs:[ref('Vue：组件 Props','https://vuejs.org/guide/components/props.html'),ref('Vue：组件事件','https://vuejs.org/guide/components/events.html')]});
addLesson({id:'react',group:'四 · 应用组织',title:'React：渲染快照与状态更新',summary:'同一个计数器，比较函数组件和 Vue。',time:35,engine:'react',
 concepts:[guide('组件函数描述一帧 UI','React 调用组件函数，函数返回 UI 描述。每次渲染拿到当次的 state 快照。直接修改普通变量不会通知 React；使用 setter 安排更新。'),guide('基于旧值更新时使用函数','setCount(c => c + 1) 表达“在上一次值上加一”。同一处理器连续 setCount(count + 1) 可能都使用同一个旧快照，而不是连续增加。'),guide('教学环境与项目写法','本课运行真实 React 18.3.1 本地库，用 createElement 避免 JSX 编译步骤。生产项目常写 JSX，由构建工具转换。这里版本固定用于演示，不表示最新版本。Hooks 在组件顶层调用；请求和订阅的副作用还需清理。')],
 html:`<div id="root"></div>`,css:commonCSS,js:`const { createElement: h, useState } = React;
function Counter() {
  const [count, setCount] = useState(0);
  function add() {
    setCount(c => c + 1);
    console.log('当前处理器捕获的快照:', count);
  }
  return h('section', null,
    h('h2', null, 'React 订单计数'),
    h('button', { onClick: add }, '增加'),
    h('output', { id: 'count' }, count)
  );
}
ReactDOM.createRoot(document.querySelector('#root')).render(h(Counter));`,notes:[note('js','useState','React 按组件位置维护状态；不要在条件或循环中调用 Hook。'),note('js','快照','调用 setter 后，当前闭包中的 count 不会立即改变，下一次渲染会收到新值。')],steps:['点击按钮，比较日志中的旧快照与页面新数字。','在 add 中连续写两次函数式 setter。','重新运行再点一次，确认变成 2。'],task:'一次点击连续调用两次函数式 setter，使页面显示 2。',check:`return document.querySelector('#count').textContent==='2'`,hint:'在 add 内复制 setCount(c => c + 1)，不要复制 createRoot。',quiz:quiz('为什么调用 setter 后当前函数里的 count 仍是旧值？',['更新失效','当前处理器持有本次渲染的快照'],1,'setter 调度下一次渲染；它不会修改已经执行的函数闭包里的值。'),refs:[ref('React：useState','https://react.dev/reference/react/useState')]});
addLesson({id:'types',group:'五 · 工程与质量',title:'TypeScript 与运行时校验',summary:'类型检查管开发阶段，外部数据仍需验证。',time:25,
 concepts:[guide('TypeScript 编译后仍是 JavaScript','类型标注通常会被编译移除。interface Order { id: string } 约束你写的代码，但不能保证网络 JSON 真的满足它。as Order 只是断言，不会转换或校验数据。'),guide('把外部数据先视为 unknown','请求、存储、URL 参数都来自边界。先验证字段存在和类型，再转成业务对象。状态可用判别联合表达 idle/loading/success/error，避免多个布尔变量互相矛盾。'),guide('本课运行 JavaScript 校验器','编辑器执行 JS，没有启用 TypeScript 编译器。下面用真实运行时校验演示类型系统之外的边界。项目中可以把这种函数声明为 data is Order，或选用 Schema 校验库。')],
 html:`<label>接口 JSON <textarea id="json" rows="5">{"id":"OD-001","cents":"1200"}</textarea></label><button id="validate">校验</button><output id="result"></output>`,css:commonCSS+`\ntextarea{display:block;width:90%;font:14px monospace;}`,js:`function isOrder(data) {
  return data !== null && typeof data === 'object'
    && typeof data.id === 'string'
    && Number.isInteger(data.cents) && data.cents >= 0;
}
document.querySelector('#validate').onclick = () => {
  const out = document.querySelector('#result');
  try {
    const value = JSON.parse(document.querySelector('#json').value);
    if (!isOrder(value)) throw new Error('字段类型不正确');
    out.textContent = '合法订单';
  } catch (error) { out.textContent = error.message; }
};`,notes:[note('js','Number.isInteger','字符串 "1200" 与整数 1200 不同。不要用隐式转换掩盖接口契约错误。'),note('js','JSON.parse','JSON 语法正确不等于业务数据类型正确，所以还要 isOrder。')],steps:['校验默认 JSON，发现字符串金额不合格。','去掉 1200 的引号再校验。','输入负数、null 或非法 JSON，查看错误。'],task:'修正接口 JSON，让校验结果为“合法订单”。',check:`return document.querySelector('#result').textContent==='合法订单'`,hint:'金额应为非负整数：{"id":"OD-001","cents":1200}。',quiz:quiz('TypeScript 的 as Order 能校验接口数据吗？',['能','不能，它只是编译时断言'],1,'类型断言不会生成运行时字段检查。'),refs:[ref('TypeScript：收窄','https://www.typescriptlang.org/docs/handbook/2/narrowing.html')]});
addLesson({id:'modules',group:'五 · 工程与质量',title:'模块、构建与项目目录',summary:'把业务纯函数与 DOM 操作分开。',time:30,
 concepts:[guide('文件边界服务于职责','src/main 是启动入口，components 放 UI，services 放接口，domain 放业务函数。目录不是越多越好；按修改原因拆分，避免循环依赖和万能 utils。'),guide('浏览器与工具链的分工','浏览器原生支持 ES Module，但不直接理解 .vue、TypeScript 类型和裸包名的所有解析方式。开发服务器与构建工具处理转换、依赖解析、资源路径和优化；Node.js 在这里是工具运行环境。'),guide('发布的是构建产物','npm scripts 可组织 dev、typecheck、build 等命令，依赖锁文件让安装更可复现。前端打包进去的环境变量可被用户读取，不能当服务器密钥库。此课使用 Blob 模块替代多文件服务器，import/export 语义真实执行。')],
 html:`<h2>订单金额模块</h2><output id="total"></output>`,css:commonCSS,js:`const source = \`
export function totalCents(items) {
  return items.reduce((sum, item) => sum + item.cents, 0);
}
\`;
const url = URL.createObjectURL(new Blob([source], { type:'text/javascript' }));
(async () => {
  try {
    const { totalCents } = await import(url);
    const cents = totalCents([{cents:1000},{cents:500}]);
    document.querySelector('#total').textContent = cents;
    console.log('模块导出函数结果:', cents);
  } finally { URL.revokeObjectURL(url); }
})();`,notes:[note('js','export function','这个纯函数不依赖 document，适合单独测试和复用。'),note('js','import(url)','浏览器动态导入真实 ES Module；生产中通常写 import { totalCents } from "./domain/order.js"。')],steps:['观察导出函数如何被应用层使用。','把第二个 cents 改成 800，结果应变 1800。','设想金额模块被列表和详情共同引用，避免复制逻辑。'],task:'让模块计算的合计为 1800 分。',check:`return document.querySelector('#total').textContent==='1800'`,hint:'把调用参数中的 500 改成 800。',quiz:quiz('打包进前端环境变量的密钥安全吗？',['用户看不到源码所以安全','不安全，产物和请求可被查看'],1,'前端代码和静态资源会交到用户浏览器；敏感密钥应放在服务端。'),refs:[ref('MDN：JavaScript 模块','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules')]});
addLesson({id:'accessibility',group:'五 · 工程与质量',title:'可访问性、焦点与交互反馈',summary:'用键盘把任务完整做一遍。',time:25,
 concepts:[guide('语义是交互的基础','使用原生 button、input、label 能得到键盘与辅助技术支持。aria 不能自动赋予一个 div 完整按钮行为，也不能替代可见标签。'),guide('焦点必须可见且可预测','键盘用户要知道自己在哪。弹窗打开后焦点进入，关闭后返回触发处；原生 dialog 提供很多行为基础，仍需验证 Escape、焦点返回和标题关联。'),guide('状态不是只靠颜色','错误要有文字说明，异步结果可用 aria-live 通知。不要在每次状态变化时强行移动焦点。对比度、触摸目标、缩放和屏幕阅读器都属于验收范围。')],
 html:`<button id="open">打开订单详情</button>
<dialog id="dialog" aria-labelledby="title"><h2 id="title">订单 OD-001</h2><p>待支付，金额 120 元。</p><button id="close">关闭详情</button></dialog>`,css:commonCSS+`\nbutton:focus-visible { outline:3px solid #b75529; outline-offset:4px; }
dialog { border:1px solid #899c91; max-width:300px; }
dialog::backdrop { background:#0005; }`,js:`const dialog = document.querySelector('#dialog');
document.querySelector('#open').onclick = () => dialog.showModal();
document.querySelector('#close').onclick = () => dialog.close();
dialog.addEventListener('close', () => console.log('弹窗关闭，检查焦点返回触发按钮'));`,notes:[note('js','showModal','打开模态 dialog，将页面其他部分设为不可交互；与简单设置 display:block 不同。'),note('css','focus-visible','提供清楚的焦点外框，不应为了美观删除所有 outline。')],steps:['用 Tab 聚焦打开按钮，按 Enter 打开。','按 Escape 关闭，确认焦点返回按钮。','再打开，使用关闭按钮退出。'],task:'打开订单详情，让原生 dialog 处于打开状态。',check:`return document.querySelector('#dialog').open`,hint:'点击打开按钮，或聚焦后按 Enter。',quiz:quiz('给 div 加 role="button" 后会自动支持 Enter 吗？',['会','不会，还缺键盘处理等行为'],1,'原生 button 自带行为；ARIA 主要表达语义，不实现交互。'),refs:[ref('MDN：可访问性','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility')]});
addLesson({id:'security',group:'五 · 工程与质量',title:'安全、Cookie 与信任边界',summary:'将不可信数据当文本，理解前端不能替代鉴权。',time:30,
 concepts:[guide('XSS 常来自把数据当代码','用户输入、接口字段、URL 参数都不能随意插入 innerHTML。本例用 textContent，把含标签的字符串显示为文字。确需富文本时应使用可靠的白名单净化，不能只靠替换几个字符。'),guide('身份与权限由服务端确认','隐藏按钮不等于禁止调用接口。Cookie 可按属性限制可读性和跨站行为；HttpOnly 防止 JS 直接读取 Cookie，但不能让 XSS 变得无害。认证方式还要考虑 CSRF 和过期刷新。'),guide('CORS 是浏览器读取限制','CORS 不是鉴权方案，也不能阻止非浏览器客户端。带凭据跨源请求必须由服务端按可信来源配置。调试时查看 origin、响应头、预检和 Cookie 属性，不要把 no-cors 当作通用解决方案。')],
 html:`<label>订单备注 <input id="note" value="&lt;b&gt;紧急订单&lt;/b&gt;"></label><button id="show">显示备注</button><p id="content"></p>`,css:commonCSS,js:`document.querySelector('#show').onclick = () => {
  const value = document.querySelector('#note').value;
  document.querySelector('#content').textContent = value;
  console.log('备注作为纯文本显示。');
};`,notes:[note('js','textContent','不解析 HTML 标签，这是输出纯文本的正确工具。不要因为需要换行就换成未处理的 innerHTML。')],steps:['点击显示，确认 <b> 仍是文本。','输入 <img>，检查没有生成图片节点。','思考“退款按钮不可见”为什么不能代替后端退款权限校验。'],task:'显示默认备注，保证 content 内没有子元素。',check:`const e=document.querySelector('#content');return e.textContent.includes('<b>') && e.childElementCount===0`,hint:'点击显示即可。保留 textContent，不要改成 innerHTML。',quiz:quiz('CORS 能作为 API 的身份认证吗？',['能','不能'],1,'CORS 管浏览器是否允许读取跨源响应，服务端仍需验证身份和权限。'),refs:[ref('MDN：XSS','https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS'),ref('MDN：CORS','https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS')]});
addLesson({id:'performance',group:'五 · 工程与质量',title:'性能：先测量，再定位',summary:'区分 JavaScript、布局、绘制和用户感受到的等待。',time:30,
 concepts:[guide('性能是用户任务的时间','首屏、交互响应、布局稳定性分别有不同影响因素。网络慢、JS 大、图片大、主线程长任务不能用同一种办法解决。先用 Network 与 Performance 记录，再决定优化位置。'),guide('计算快不等于已经显示','performance.now 测到两点之间的 JS 时间；DOM 插入测量不必包含后续布局、绘制。实验日志明确表示“JS 与节点构建耗时”，不冒充完整渲染时间。'),guide('优先减少不必要的工作','分页和虚拟列表减少节点数量；图片尺寸预留减少跳动；分包减少初始下载；读写布局交错可能强制同步布局。缓存需考虑失效，memo 类优化也需先有测量证据。')],
 html:`<label>本次展示条数 <input id="limit" type="number" min="1" max="3000" value="1000"></label><button id="build">构建列表</button><output id="metric"></output><ul id="list"></ul>`,css:commonCSS+`\nul { max-height:220px; overflow:auto; }`,js:`document.querySelector('#build').onclick = () => {
  const count = Math.max(1, Math.min(3000, Number(document.querySelector('#limit').value)));
  const start = performance.now();
  const fragment = document.createDocumentFragment();
  for (let i=0; i<count; i++) {
    const li = document.createElement('li');
    li.textContent = '订单 ' + (i+1); fragment.append(li);
  }
  document.querySelector('#list').replaceChildren(fragment);
  const ms = (performance.now() - start).toFixed(2);
  document.querySelector('#metric').textContent = count + ' 节点，JS/构建耗时 ' + ms + 'ms';
  console.log('测量不包含完整后续绘制:', ms);
};`,notes:[note('js','performance.now','高精度相对时间适合测量。单次微基准会波动，不能据此断言某方案普遍更快。'),note('js','DocumentFragment','集中构建节点；不保证任何场景都比其他方式快，仍需测量。')],steps:['分别构建 1000 与 20 条数据。','观察节点数和滚动情况，不只比较一次耗时。','思考接口分页和前端分页各自减少了什么成本。'],task:'只展示 20 条订单，模拟分页限制 DOM 数量。',check:`return document.querySelectorAll('#list li').length===20`,hint:'把条数改为 20，点击构建。',quiz:quiz('本例 performance.now 差值能代表整页完成绘制吗？',['能','不能，后续布局绘制可能尚未发生'],1,'JS 计时和用户看到像素的时间不是同一个指标。'),refs:[ref('MDN：Web 性能','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance')]});
addLesson({id:'quality',group:'五 · 工程与质量',title:'测试、评审与发布',summary:'用可复现的失败场景替代“看起来能用”。',time:35,
 concepts:[guide('测试按风险分层','纯函数测试金额、筛选等逻辑；组件测试用户交互；E2E 覆盖关键业务链路。视觉验收检查不同宽度和状态。不要把内部实现细节当成唯一断言，优先验证用户可观察的行为。'),guide('评审先复现，再读实现','PR 提供问题、预期行为、截图和验证步骤。先看需求、状态与数据边界，再看组件和命名。缺少鉴权与数据丢失可能比样式不一致严重，优先级由实际影响决定，不按技术类别固定。'),guide('交付是一段可回退流程','类型检查与构建通过后部署预览环境，验收主要用户任务。发布配置资源路径、缓存和路由回退；记录前端错误与请求失败，保留构建版本以便回滚。下面的本地模拟让你复现重复提交。')],
 html:`<button id="submit">提交订单</button><output id="calls">请求数：0</output>`,css:commonCSS,js:`const button = document.querySelector('#submit');
let busy = false, calls = 0;
button.onclick = async () => {
  // 练习：在这里加入同步的重复提交保护。
  busy = true;
  calls++;
  document.querySelector('#calls').textContent = '请求数：' + calls;
  await new Promise(resolve => setTimeout(resolve, 800));
  busy = false;
  console.log('模拟提交结束');
};`,notes:[note('js','busy = true','保护需要在任何 await 之前同步设置；按钮禁用与逻辑 guard 可以同时使用。'),note('js','setTimeout','此处只是延迟模拟，不会创建真实订单。真实写接口还需服务端幂等设计。')],steps:['快速双击按钮，复现两个模拟请求。','在开头增加 if (busy) return。','重新运行，快速双击，确认请求数为 1。'],task:'加入 busy guard，让快速重复点击只产生一次模拟请求。检查按钮会在预览里连续点击两次。',check:`const b=document.querySelector('#submit');b.click();b.click();return document.querySelector('#calls').textContent==='请求数：1'`,hint:'在 busy = true 之前写 if (busy) return；先运行复位，再检查。',quiz:quiz('前端防重复点击能替代服务端幂等吗？',['能','不能'],1,'重试、并发客户端和绕过 UI 都可能产生重复写请求，后端仍要保证正确性。'),refs:[ref('MDN：客户端工具概览','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview')]});
addLesson({id:'capstone',group:'六 · 综合与拓展',title:'综合项目：订单工作台',summary:'串起筛选、加载、分页、详情、空态和恢复。',time:60,
 concepts:[guide('先验收，再组织文件','用户要筛选订单、翻页、查看详情。状态包括 idle/loading/success/empty/error。接口契约采用 /api/orders?status=pending&page=1&pageSize=3，详情使用 query id。示例用本地数据和 Promise 模拟后端，不发送 HTTP。'),guide('列出状态所有者','筛选和页码属于列表，选中订单属于详情，筛选后的总数是派生结果。修改筛选时回到第一页；末页下一页应禁用；请求中操作应有明确策略。'),guide('把完整代码读成调用链','form.submit → 修改筛选与页码 → load → render。详情走列表事件委托；错误注入用于验证恢复。完成后可以把查询函数换成真实 fetch，并将 contract、view 和 state 分离。')],
 html:`<h2>订单工作台</h2>
<form id="filters"><label>状态 <select id="status"><option value="all">全部</option><option value="pending">待支付</option><option value="paid">已支付</option><option value="none">无结果</option></select></label><button id="search">查询</button></form>
<label><input type="checkbox" id="fail">下一次模拟失败</label>
<p id="message" aria-live="polite"></p><ul id="rows"></ul>
<button id="prev">上一页</button><output id="page"></output><button id="next">下一页</button>
<dialog id="detail"><h3>订单详情</h3><pre id="info"></pre><button id="close">关闭</button></dialog>`,css:commonCSS+`\nli{padding:10px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;gap:8px;}#page{display:inline-block;margin:12px;}button:disabled{opacity:.45;}label{display:inline-block;margin:8px 0;}`,js:`const orders = Array.from({length:8}, (_, i) => ({
  id: 'OD-' + (i+1), status: i%2 ? 'paid':'pending', cents: (i+1)*1200
}));
const state = { phase:'idle', status:'all', page:1, size:3, items:[], total:0 };
const $ = s => document.querySelector(s);
function render() {
  const loading = state.phase === 'loading';
  $('#search').disabled = loading;
  $('#prev').disabled = loading || state.page === 1;
  $('#next').disabled = loading || state.page*state.size >= state.total;
  $('#page').textContent = state.page + ' / ' + Math.max(1, Math.ceil(state.total/state.size));
  $('#message').textContent = {idle:'等待查询',loading:'加载中',error:'查询失败，请重试',empty:'没有匹配订单',success:'共 '+state.total+' 条订单'}[state.phase];
  $('#rows').replaceChildren();
  if (state.phase !== 'success') return;
  for (const item of state.items) {
    const li=document.createElement('li');
    li.textContent=item.id+' · '+item.status+' · ¥'+item.cents/100;
    const b=document.createElement('button'); b.textContent='详情';b.dataset.id=item.id;
    li.append(b);$('#rows').append(li);
  }
}
async function load() {
  if (state.phase === 'loading') return;
  state.phase='loading'; render();
  console.log('模拟查询参数', {status:state.status,page:state.page,pageSize:state.size});
  await new Promise(resolve=>setTimeout(resolve,600));
  if ($('#fail').checked) {
    $('#fail').checked=false; state.phase='error'; state.items=[];
  } else {
    const filtered=orders.filter(o=>state.status==='all'||o.status===state.status);
    state.total=filtered.length;
    state.items=filtered.slice((state.page-1)*state.size,state.page*state.size);
    state.phase=state.total?'success':'empty';
  }
  render();
}
$('#filters').onsubmit=e=>{e.preventDefault();if(state.phase==='loading')return;state.status=$('#status').value;state.page=1;load();};
$('#prev').onclick=()=>{state.page--;load();};
$('#next').onclick=()=>{state.page++;load();};
$('#rows').onclick=e=>{const id=e.target.closest('button')?.dataset.id;if(!id)return;$('#info').textContent=JSON.stringify(orders.find(o=>o.id===id),null,2);$('#detail').showModal();};
$('#close').onclick=()=>$('#detail').close();
render();`,notes:[note('js','state.size','分页大小是状态的一部分；修改它会影响切片、页数和翻页禁用逻辑。'),note('js','replaceChildren','每次渲染结果区域，事件监听在父列表上保持有效。'),note('js','slice','此示例模拟服务器过滤分页；真实接口应返回当前页 items 与全量匹配总数 total。')],steps:['查全部，翻到最后一页，检查下一页禁用。','筛选 pending，确认回到第 1 页。','模拟失败后再次查询，恢复列表；打开详情再关闭。'],task:'把每页数量改为 2；查询全部并翻到第 2 页，列表显示 OD-3 与 OD-4。',check:`const t=document.querySelector('#rows').textContent;return document.querySelectorAll('#rows li').length===2 && t.includes('OD-3') && t.includes('OD-4')`,hint:'把 state.size 从 3 改为 2，运行、查询、下一页。',quiz:quiz('修改筛选后为什么通常要回到第一页？',['为了样式','新结果可能不足旧页码，避免无效页'],1,'筛选改变了结果集，原页码可能越界；页码与筛选必须一起管理。'),refs:[ref('MDN：Fetch','https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch')]});
addLesson({id:'flutter',group:'六 · 综合与拓展',title:'Flutter 分支与后续学习路线',summary:'迁移状态与组件思维，区分 Web DOM 和 Widget。',time:25,
 concepts:[guide('Flutter 是另一套渲染模型','Flutter 使用 Dart 和 Widget 描述 UI，再通过自身的 Element、RenderObject 等结构布局绘制。不能把 Flutter 简单理解为 Vue 换个语法，也不能把 Widget 等同于 HTML 标签。Web 与移动端的运行目标、无障碍和平台集成需要分别学习。'),guide('可以迁移的经验','状态所有权、组件组合、异步错误、导航、可访问性与性能测量都可迁移。学习顺序可以是 Dart → 无状态/有状态 Widget → 布局约束 → 导航与请求 → 状态组织 → 平台发布。下面仍是 HTML 迁移练习，不执行 Dart 或 Flutter。'),guide('从完整主线到专项深入','学完本课程后，用 Vue 或 React 独立重写订单项目，再补路由库、状态库、测试框架和真实 API。进一步研究 SSR/SSG、SEO、国际化、缓存、监控与大型组件库。涉及 Flutter 时单独建立真实 SDK 项目，不在浏览器里冒充执行。')],
 html:`<h2>观察共同的数据流</h2><button id="add">状态加一</button><output id="view">0</output><pre>Flutter 对照（Dart 参考，不在本页执行）：
setState(() { count += 1; });
Text('$count');</pre>`,css:commonCSS,js:`let count = 0;
function render() { document.querySelector('#view').textContent = count; }
document.querySelector('#add').onclick = () => {
  count += 1;
  render();
  console.log('可迁移概念：事件 → 状态 → UI');
};`,notes:[note('js','render()','原生实验需要手动更新 DOM；Flutter 的 setState 标记相关 Element 需要重建，底层机制不同。')],steps:['完成计数交互，复述状态到 UI 的链路。','用 Vue 或 React 重做订单页，并保留所有失败和空状态。','再选择 Web 深入或 Flutter 独立分支，避免同时背所有框架 API。'],task:'点击三次，让状态显示为 3。',check:`return document.querySelector('#view').textContent==='3'`,hint:'这最后一个小练习使用原生 JS，重点在迁移数据流思维。',quiz:quiz('Flutter 的 Widget 是否就是 HTML DOM？',['是','不是，它有自己的 UI 与渲染结构'],1,'组件思想可迁移，但 Dart、布局协议、渲染与平台运行时需要分别学习。'),refs:[ref('Flutter：架构概览','https://docs.flutter.dev/resources/architectural-overview')]});

// 将相邻标签换行，使逐行跟读更容易定位。
window.COURSE.forEach(lesson => { lesson.html = lesson.html.replace(/></g, '>\n<'); });
