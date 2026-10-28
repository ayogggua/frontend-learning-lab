// 进阶课程：保持课程数据与运行器分离，便于继续增补实验。
const advancedLesson = lesson => addLesson({css: commonCSS, ...lesson});
const walk = (title, file, match, text) => ({title,file,match,text});
const deeper = (before, pitfalls, extension) => ({before,pitfalls,extension});

advancedLesson({id:'debugging',group:'七 · 语言与浏览器深挖',title:'从错误现象追到调用栈',summary:'调试一个“数量加一却变成 21”的真实类型错误。',time:30,
concepts:[guide('先固定输入与预期','复现条件比猜原因更有用：数量输入 2，点击后预期 3，实际 21。先检查网络、输入、计算、渲染中的哪一层第一次偏离预期。这里没有网络，因此从 input.value 开始追踪。'),guide('DOM 边界的数据通常是字符串','input.value 即使来自 type="number" 也返回字符串。加号既能做数值相加，也能连接字符串；Number(raw) 把边界输入显式转换。不要只靠最后渲染时转换，因为错误值可能已进入状态。空字符串转换为 0，仍需独立处理必填和范围。'),guide('断点回答“现在发生了什么”','导出示例后用浏览器开发者工具在计算行下断点，查看 Scope 中 raw 与 value 的类型，Step over 观察 next，沿 Call Stack 找到事件处理器。页面的 Console 只显示日志，不冒充完整调试器。修复后同时验证 0、2 和无效输入。')],
html:`<label>订单数量 <input id="quantity" type="number" value="2" min="0" step="1"></label>
<button id="increment">数量加一</button>
<output id="result"></output>`,js:`const input = document.querySelector('#quantity');
const output = document.querySelector('#result');
function calculate(raw) {
  const value = raw; // 在这里修复类型边界
  console.log('value:', value, 'typeof:', typeof value);
  const next = value + 1;
  return next;
}
document.querySelector('#increment').onclick = () => {
  output.textContent = calculate(input.value);
};`,notes:[note('js','const value','Number(raw) 显式转换；真实表单还要判断空值、Number.isFinite 和取值范围。'),note('js','calculate(input.value)','处理器把 DOM 字符串传入计算函数，错误从这个边界进入。')],
walkthrough:[walk('输入边界','html','type="number"','控件限制输入方式，但读取 value 仍是字符串。先预测 typeof 的日志。'),walk('沿调用链进入函数','js','calculate(input.value)','点击触发处理器，input.value 成为 calculate 的 raw 参数。'),walk('找到首次偏差','js','const next','当 value 为字符串 "2"，+ 得到 "21"；问题先于 DOM 更新。'),walk('修复并回归','js','const value','改为 Number(raw)，运行后分别输入 0 和 2 验证输出 1 和 3。')],
depth:deeper(['javascript','forms'],'不要用“结果看着正常”代替检查类型；parseInt("2x") 得到 2 也可能掩盖非法输入。','加上空值、负数、非整数验证；失败时保留输入并显示关联到控件的错误。'),steps:['不改代码先点击，观察 21 与 Console 中的 string。','只修改类型转换这一行，再重新运行。','导出示例，练习真实开发者工具断点、单步和变量观察。'],task:'修复计算函数，使默认输入 2 点击后显示 3。',check:`return document.querySelector('#result').textContent === '3'`,hint:'把 const value = raw 改成 const value = Number(raw)。',quiz:quiz('数字输入框的 input.value 返回什么？',['总是 number','字符串','DOM 节点'],1,'DOM 输入是边界。控件类型与读取值的 JavaScript 类型不是同一件事。'),refs:[ref('MDN：HTMLInputElement.value','https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value')]});

advancedLesson({id:'closures',group:'七 · 语言与浏览器深挖',title:'闭包、作用域与状态隔离',summary:'创建两个计数器，观察共享函数为什么不等于共享状态。',time:35,
concepts:[guide('函数保留对词法环境的访问','调用 makeCounter 时生成新的执行环境。返回的函数继续引用其中的 count，因此外层函数返回后这个变量仍可被使用。闭包捕获的是绑定，不能一概说成“复制了当时的值”。'),guide('每次工厂调用建立不同状态','A 与 B 都来自 makeCounter，但各自调用工厂创建 count。若把 count 移到工厂外，它们才会共用状态。后端可以类比每次构造服务实例获得独立字段，但 JavaScript 这里不需要类。'),guide('隔离不等于永不泄漏','事件监听器、定时器和缓存可能长期持有闭包，间接保留较大的对象。清理不再需要的监听器或计时器，比手动把所有变量设为 null 更有价值。React 的闭包还会绑定某次渲染的变量，需要结合后面的 Effect 课理解。')],
html:`<button id="a">增加 A</button><button id="b">增加 B</button>
<output id="counts">A=0, B=0</output>`,js:`function makeCounter() {
  let count = 0;
  return () => ++count;
}
const nextA = makeCounter();
const nextB = nextA; // 改成一个独立的计数器
let a = 0, b = 0;
function render() {
  document.querySelector('#counts').textContent = 'A=' + a + ', B=' + b;
}
document.querySelector('#a').onclick = () => { a = nextA(); render(); };
document.querySelector('#b').onclick = () => { b = nextB(); render(); };`,notes:[note('js','let count','每次调用工厂创建一个新的 count 绑定。'),note('js','nextB = nextA','这里只复制函数引用，两个名字指向同一个闭包。')],
walkthrough:[walk('工厂创建环境','js','function makeCounter','调用发生时才创建 count；声明函数本身不创建计数实例。'),walk('返回仍能访问状态的函数','js','return ()','外层结束后，返回函数仍能读写 count。'),walk('别名造成共享','js','nextB =','先点 A 再点 B，两个名字共享 count，得到 A=1、B=2。'),walk('独立调用解除共享','js','const nextB','改成 makeCounter() 后重复操作，两个环境各得到 1。')],
depth:deeper(['javascript','state'],'把对象或函数赋给另一个变量通常只复制引用，不会克隆其内部状态。','给工厂增加 reset 方法；验证只重置 A 时 B 保持原值。'),steps:['先点一次 A 和一次 B，记录结果。','让 B 通过新的工厂调用创建。','重新运行，分别点击，验证两个状态独立。'],task:'修复共享闭包；运行后 A 点击两次、B 点击一次，显示 A=2, B=1。',check:`return document.querySelector('#counts').textContent === 'A=2, B=1'`,hint:'将 const nextB = nextA 改为 const nextB = makeCounter()。',quiz:quiz('const nextB = nextA 会创建独立计数器吗？',['会复制 count','不会，它们引用同一个函数'],1,'创建新状态需要再调用工厂，而不是给现有返回函数再取一个名字。'),refs:[ref('MDN：闭包','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures')]});

advancedLesson({id:'events-deep',group:'七 · 语言与浏览器深挖',title:'事件传播、默认行为与委托',summary:'用嵌套控件区分 target、currentTarget 和冒泡。',time:30,
concepts:[guide('一次点击有一条传播路径','事件通常经历捕获、目标、冒泡。event.target 是触发事件的目标；currentTarget 是当前监听器绑定的节点。点按钮内的 strong，target 可能是 strong，因此委托不能总是假设 target 就是按钮。'),guide('停止传播与取消默认行为不同','stopPropagation 阻止后续传播；preventDefault 取消可取消事件的默认行为，例如表单导航。它们都不会自动完成另一项工作。同一节点多个监听器的行为还与 stopImmediatePropagation 有关，尽量先理清事件职责。'),guide('委托适合动态列表','把监听器绑定在列表祖先上，通过 closest 找到动作按钮，再检查它属于当前容器。列表新增项目无需逐项重复绑定。使用 button 提供键盘交互，避免给普通 div 只加 click 造成可访问性问题。')],
html:`<div id="toolbar"><button data-action="save"><strong>保存订单</strong></button></div>
<output id="saved">0</output>`,js:`const toolbar = document.querySelector('#toolbar');
let count = 0;
document.addEventListener('click', () => console.log('document 捕获'), true);
toolbar.addEventListener('click', event => {
  console.log('target:', event.target.tagName, 'currentTarget:', event.currentTarget.id);
  const button = event.target; // 改为从目标向上查找按钮
  if (!button.matches('button[data-action]')) return;
  count++;
  document.querySelector('#saved').textContent = count;
});
document.addEventListener('click', () => console.log('document 冒泡'));`,notes:[note('js','event.target;','点击 strong 时 target 就是 strong；用 closest("button[data-action]") 可向上定位按钮。'),note('js','true);','第三个参数 true 指定捕获阶段监听。')],
walkthrough:[walk('先确定事件源','html','<strong>','点击粗体文字，实际目标是 strong，按钮仍在传播路径上。'),walk('捕获先到达','js','捕获','document 的捕获监听器先执行。'),walk('委托分发业务动作','js','const button','通过 closest 获取业务按钮，而不是依赖最内层标签。'),walk('冒泡继续上行','js','document 冒泡','除非主动阻止传播，否则祖先的冒泡监听器仍会收到事件。')],
depth:deeper(['state','html'],'不要为了消除重复日志到处 stopPropagation，这会破坏外层需要事件的组件。','给工具栏动态新增取消按钮，按 data-action 分支处理，无需新增监听器。'),steps:['点击粗体文字，观察日志中的 target。','修改按钮查找逻辑并处理查找为 null 的情况。','再次点击，核对日志顺序。'],task:'使点击“保存订单”的粗体文字也能把结果加到 1。',check:`const b=document.querySelector('strong');document.querySelector('#saved').textContent='0';b.click();return document.querySelector('#saved').textContent!=='0'`,hint:'const button = event.target.closest("button[data-action]"); 然后 if (!button || !toolbar.contains(button)) return;。',quiz:quiz('preventDefault 会自动阻止冒泡吗？',['会','不会'],1,'默认行为和事件传播是两个维度，需根据需求分别处理。'),refs:[ref('MDN：事件冒泡','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling')]});

advancedLesson({id:'stacking',group:'七 · 语言与浏览器深挖',title:'定位、层叠上下文与弹层',summary:'为什么 z-index:9999 仍被另一块内容盖住？',time:35,
concepts:[guide('z-index 不是全页面排名','元素只能在所属层叠上下文里比较。一个内部 z-index 很高的弹层，仍可能随父上下文整体处于另一个上下文下方。可以类比先比较目录层级，再比较同目录文件；不要把层级数字无限增大。'),guide('定位不只解决坐标','position:relative 配合非 auto 的 z-index 可建立层叠上下文，transform、opacity 小于 1 等也可能建立。absolute 的包含块通常由最近的定位祖先决定，固定定位遇到 transform 祖先时也需检查其包含块。'),guide('用结构解决遮挡','优先把弹层放到合适的容器，或使用原生 dialog.showModal 进入顶层。顶层与一般文档层叠不同，但还要处理焦点、关闭和恢复。此实验先修复父层级，后续无障碍课再练真实 dialog。')],
html:`<div class="canvas"><section class="panel"><div class="floating">订单详情</div></section><aside class="cover">这里挡住了详情</aside></div>
<button id="inspect">检查重叠处</button><output id="top"></output>`,css:commonCSS+`
.canvas { position:relative; height:160px; }
.panel { position:relative; z-index:1; }
.floating { position:absolute; top:20px; left:20px; z-index:9999; width:220px; height:100px; background:#d5e9db; padding:15px; }
.cover { position:absolute; z-index:2; top:35px; left:45px; background:#eedac8; width:190px; height:100px; padding:15px; }`,js:`document.querySelector('#inspect').onclick = () => {
  const box = document.querySelector('.floating').getBoundingClientRect();
  const top = document.elementFromPoint(box.left + 60, box.top + 40);
  document.querySelector('#top').textContent = '最上方：' + top.className;
  console.log('重叠点命中节点', top.className);
};`,notes:[note('css','z-index:1','panel 自己的层级先与 cover 比较，内部的 9999 不能跨越父层级。')],
walkthrough:[walk('确认父上下文','css','.panel','父 panel 处于 z-index:1。'),walk('观察局部高层级','css','.floating','9999 只在 panel 内部比较。'),walk('兄弟上下文获胜','css','.cover','cover 为 2，整体盖住 panel。'),walk('测量命中结果','js','elementFromPoint','使用真实浏览器命中测试，不按代码里的数字猜结果。')],
depth:deeper(['box','cascade','layout'],'定位、层叠上下文、裁剪不是同一问题；overflow 裁剪也不一定靠 z-index 修好。','把 cover 移入 panel，比对层叠结果；再用 dialog.showModal 建立真正的模态详情。'),steps:['点击检查，看重叠位置命中 cover。','把 panel 的 z-index 改为 3。','再次运行、检查，解释为什么只改父级就够了。'],task:'让 panel 的详情显示在 cover 之上。',check:`const r=document.querySelector('.floating').getBoundingClientRect();return document.elementFromPoint(r.left+60,r.top+40)?.className==='floating'`,hint:'修改 .panel 的 z-index，让它高于同级 cover。',quiz:quiz('子元素的 z-index:9999 能无条件压过其他上下文吗？',['能','不能'],1,'层叠上下文作为整体参与外部排序，内部数字不能跨越父级排序。'),refs:[ref('MDN：层叠上下文','https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context')]});

advancedLesson({id:'container',group:'七 · 语言与浏览器深挖',title:'容器查询与可复用布局',summary:'同一张卡片放入主栏和侧栏，按照容器宽度响应。',time:30,
concepts:[guide('视口宽度不代表组件可用宽度','媒体查询适合页面级布局。但同一个宽屏页面的侧栏可能只有 260px，主栏有 700px。若卡片只看视口，它在侧栏仍可能用拥挤的两列。容器查询按祖先容器的尺寸选择样式。'),guide('容器与被查询子项分开','在外层声明 container-type:inline-size，内层通过 @container (min-width:...) 切换布局。查询针对符合条件的祖先容器，不用元素自身尺寸循环决定自身样式。命名容器可明确复杂嵌套时所用的范围。'),guide('组件应把约束交给外部','组件外部决定可用宽度，内部决定如何排版。配合 min-width:0、可换行文本和合理的最小尺寸，能提高跨页面复用性。这不是用百分比替代所有尺寸，按钮、边距与文本仍需设计约束。')],
html:`<label>容器宽度 <input id="width" type="range" min="240" max="640" value="300"></label>
<div class="host"><article class="product"><div class="picture">预览图</div><div><h3>键盘</h3><p>组件跟随容器排版</p></div></article></div><output id="layout"></output>`,css:commonCSS+`
.host { container-type:inline-size; width:300px; max-width:100%; border:1px solid #a4baac; }
.product { display:grid; gap:16px; padding:16px; }
.picture { min-height:85px; background:#d9e8dc; }
@container (min-width:480px) { .product { grid-template-columns:120px 1fr; } }`,js:`const host = document.querySelector('.host');
document.querySelector('#width').oninput = event => {
  host.style.width = event.target.value + 'px';
  requestAnimationFrame(() => {
    document.querySelector('#layout').textContent = '实际列宽：' + getComputedStyle(document.querySelector('.product')).gridTemplateColumns;
  });
};`,notes:[note('css','container-type','建立可供后代查询的内联方向尺寸容器。'),note('css','@container','仅在容器达到阈值时给后代应用两列。')],
walkthrough:[walk('外层提供尺寸','css','.host','拖动滑块修改 host 宽度，而非浏览器窗口。'),walk('内层定义内容布局','css','.product','默认一列，窄容器先可用。'),walk('达到条件切换样式','css','@container','规则看 host 宽度；预览本身太窄时 max-width 会限制 host。'),walk('读取真实计算结果','js','getComputedStyle','在下一帧检查浏览器计算的轨道尺寸。')],
depth:deeper(['responsive','layout'],'固定宽度可能被 max-width 限制；滑块标称宽度不一定等于实际宽度。','把两张相同卡片放进不同宽度容器，只使用一套组件样式。'),steps:['预览切到 800px，再拖动容器宽度。','比较 300px 和 600px 下的列数。','把阈值改为 360px，理解规则生效的边界。'],task:'把查询阈值改为 360px，在 800px 预览中把容器拖到 400px，使卡片显示两列。',check:`const s=getComputedStyle(document.querySelector('.product'));const w=document.querySelector('.host').getBoundingClientRect().width;return s.gridTemplateColumns.split(' ').length===2 && w>=360 && w<=450`,hint:'改 @container 的 min-width，再将预览切到 800px，拖动滑块至约 400px。',quiz:quiz('容器查询适合解决什么？',['同一组件在不同可用宽度下排版','后端接口鉴权'],0,'组件所在区域的宽度可以独立于视口宽度。'),refs:[ref('MDN：容器查询','https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries')]});

advancedLesson({id:'race',group:'八 · 数据与应用架构',title:'请求竞态：谁有资格更新页面',summary:'慢的旧搜索覆盖快的新搜索，亲手加上版本保护。',time:40,
concepts:[guide('发出顺序不等于完成顺序','先搜索旧条件 A，再搜索新条件 B；B 可能先返回。如果所有响应都直接写 DOM，后到的 A 会把页面回退。服务器正确返回结果，也不代表客户端展示了用户最近的意图。这里用本地延时模拟响应，便于稳定复现。'),guide('版本号表达最新意图','每次查询递增 latest，当前请求捕获自己的 id。响应回来时检查 id===latest，只有当前版本能写结果。相同规则也应约束错误与 loading 的更新，否则旧请求的 finally 仍会提前关闭新请求的加载状态。'),guide('取消与一致性是两层保护','AbortController 可节省过期请求的资源，但请求可能已经完成，或服务端仍在处理。版本保护确保 UI 一致性；取消减少无用工作。真实生产中还要定义卸载、超时、错误提示与缓存之间的行为。')],
html:`<button id="old">查询旧条件（慢）</button><button id="fresh">查询新条件（快）</button><output id="answer">尚未查询</output>`,js:`let latest = 0;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function search(label, ms) {
  const id = ++latest;
  console.log('发出', label, id);
  await delay(ms); // 本地模拟，不发 HTTP 请求
  // TODO：过期响应在这里直接 return
  document.querySelector('#answer').textContent = label;
  console.log('提交视图', label, id);
}
document.querySelector('#old').onclick = () => search('旧条件结果', 2000);
document.querySelector('#fresh').onclick = () => search('新条件结果', 200);`,notes:[note('js','const id','id 捕获这次查询的版本；latest 会随未来的查询继续变化。'),note('js','TODO','插入 if (id !== latest) return;，使旧响应失去更新资格。')],
walkthrough:[walk('旧查询先发出','js',"search('旧条件",'点击旧条件，请求 id=1，等待两秒。'),walk('新查询更快完成','js',"search('新条件",'随后点击新条件，id=2，约 200ms 后完成。'),walk('旧结果随后返回','js','await delay','没有保护时 id=1 会覆盖 id=2，形成稳定可复现的错误。'),walk('在提交边界检查版本','js','TODO','只允许 id 等于最新版本的结果改变视图。')],
depth:deeper(['requests','async'],'只保护 success 分支不够，catch/finally 中的状态修改也可能有竞态。','加入 loading 和模拟错误；确保旧请求失败不会覆盖最新请求的成功结果。'),steps:['先点慢查询，再快速点快查询，等待两秒。','加入版本判断再重复。','观察 Console：过期请求可完成，但不能提交视图。'],task:'补上过期检查。检查器会自动快速触发两个请求，等待旧请求返回后验证最新结果仍保留。',check:`document.querySelector('#old').click();document.querySelector('#fresh').click();return new Promise(resolve=>setTimeout(()=>resolve(document.querySelector('#answer').textContent==='新条件结果'),2200))`,hint:'在 await 后加入 if (id !== latest) return;。',quiz:quiz('AbortController 能单独保证 UI 永远是最新查询吗？',['完全保证','还应在提交状态时校验当前请求身份'],1,'取消是资源控制；异步完成时是否仍有资格修改页面，应在状态提交边界判断。'),refs:[ref('MDN：AbortController','https://developer.mozilla.org/en-US/docs/Web/API/AbortController')]});

advancedLesson({id:'reducer',group:'八 · 数据与应用架构',title:'用 reducer 管理状态转移',summary:'把散落在按钮中的修改整理为可推演的状态机。',time:40,
concepts:[guide('状态集合需要保持约束','订单流程有 draft、submitting、success、error 等状态。多个布尔值如 isLoading、hasError、isSuccess 容易出现互相矛盾的组合。先画允许的转移，再决定 action；有限状态机比随处赋值更容易检查。'),guide('reducer 计算下一状态','reducer(state, action) 接收当前状态与意图，返回下一状态。纯函数里不发请求、不读当前时间、不修改传入对象；相同输入得到相同输出。副作用由外层执行后，再 dispatch 成功或失败事件。'),guide('单一所有者减少同步成本','不必为所有局部输入引入全局状态。跨组件共享且有明确生命周期的状态才需要提升或集中管理。派生值直接计算，不要同时存 items 与可由 items 推得的 count 再手工同步。')],
html:`<button id="submit">提交</button><button id="fail">返回失败</button><button id="retry">重试</button><output id="phase">draft</output>`,js:`function reducer(state, action) {
  if (action.type === 'submit' && state.phase === 'draft') return {phase:'submitting'};
  if (action.type === 'fail' && state.phase === 'submitting') return {phase:'error'};
  // TODO：允许 error 接收 retry，回到 submitting
  return state; // 不合法转移保持原状态
}
let state = {phase:'draft'};
function dispatch(type) {
  const previous = state;
  state = reducer(state, {type});
  document.querySelector('#phase').textContent = state.phase;
  console.log(type, previous.phase + ' → ' + state.phase);
}
for (const type of ['submit','fail','retry']) document.querySelector('#'+type).onclick = () => dispatch(type);`,notes:[note('js','return state','保持未发生转移的状态引用，使无效 action 无副作用。'),note('js','previous = state','保留旧值可观察转移；若原地修改会破坏这个对比。')],
walkthrough:[walk('从稳定状态出发','js',"phase:'draft'",'初始 draft，submit 才允许进入提交中。'),walk('动作只表达意图','js','dispatch(type)','事件处理器派发动作，不直接到处修改状态。'),walk('转移函数决定是否合法','js','function reducer','相同 action 在不同状态可能得到不同结果。'),walk('渲染统一消费新状态','js','textContent = state.phase','视图始终由当前 state 决定，日志保留转移前后。')],
depth:deeper(['state','javascript'],'纯函数不是“不创建对象”，而是不影响外部且不修改输入。','加入 cancel、success 与 requestId；写出每个状态允许的 action 表，再逐条验证。'),steps:['在 draft 先点失败，确认状态不变。','提交再失败，进入 error。','增加 retry 转移，观察完整链路。'],task:'实现 error → retry → submitting。检查器将顺序点击提交、失败、重试。',check:`['submit','fail','retry'].forEach(id=>document.querySelector('#'+id).click());return document.querySelector('#phase').textContent==='submitting'`,hint:'if (action.type === "retry" && state.phase === "error") return {phase:"submitting"};',quiz:quiz('reducer 中最不适合做什么？',['根据 action 返回新对象','发请求并启动计时器'],1,'副作用放在外层，reducer 保持输入到输出的确定计算。'),refs:[ref('React：把状态逻辑提取到 reducer','https://react.dev/learn/extracting-state-logic-into-a-reducer')]});

advancedLesson({id:'optimistic',group:'八 · 数据与应用架构',title:'乐观更新、失败回滚与重复提交',summary:'收藏立即变化，接口失败时如何恢复正确状态。',time:40,
concepts:[guide('先改视图是产品取舍','收藏、点赞等低风险操作可先给反馈，再等服务器确认。支付、不可逆删除等操作需另外设计确认与一致性规则。乐观更新让延迟更少被感知，但不会让服务端更快，也不能略去失败处理。'),guide('回滚要保留操作前状态','发出请求前保存 previous，再修改本地状态；失败恢复 previous，并让用户知道发生了什么。本实验在单个请求期间禁用操作，因此一个 previous 就够了。允许并发时需要每次操作的版本或操作日志，不能随意回滚到更早快照。'),guide('前端禁用不是幂等性保障','禁用按钮防止当前界面重复操作，但多标签页、重试和网络中断仍可能重复请求。后端应按业务使用幂等键或版本校验。失败反馈需要可重试，同时避免把服务器校验失败当成网络超时。')],
html:`<label><input id="reject" type="checkbox" checked>模拟服务端拒绝</label><button id="favorite">收藏</button><output id="status">未收藏</output>`,js:`let saved = false, busy = false;
const button = document.querySelector('#favorite');
function render(message='') {
  button.disabled = busy;
  document.querySelector('#status').textContent = (saved?'已收藏':'未收藏') + (message?' · '+message:'');
}
button.onclick = async () => {
  if (busy) return;
  const previous = saved;
  const reject = document.querySelector('#reject').checked;
  saved = !saved; busy = true; render('等待确认');
  await new Promise(resolve => setTimeout(resolve, 700));
  if (reject) {
    // TODO：恢复 previous
    busy = false; render('失败，已回滚');
  } else { busy = false; render('服务端确认'); }
};`,notes:[note('js','const previous','必须在乐观修改前记录，之后记录就失去原值。'),note('js','const reject','在操作开始捕获本次模拟结果，防止等待中修改复选框改变已发出的请求语义。')],
walkthrough:[walk('捕获原值','js','const previous','previous 是本次请求回滚的基准。'),walk('立即响应用户','js','saved = !saved','视图先变，busy 同时阻止第二个操作。'),walk('处理失败','js','TODO','恢复原值再显示失败消息，否则文案说回滚而状态仍是新值。'),walk('解除提交锁','js','busy = false','无论成功失败都要让用户能继续；真实代码常用 finally 处理公共清理。')],
depth:deeper(['requests','race'],'禁止把“返回失败提示”当作“数据已回滚”，需要验证实际显示和内部状态。','允许同时收藏不同订单，按订单 id 管理 busy 和 previous；不要用一个全局 busy 锁住全页。'),steps:['先看一次失败：页面错误地保持已收藏。','补上回滚，再运行并点击。','取消模拟失败，检查成功路径仍可用。'],task:'修复失败回滚；保持模拟拒绝，点击收藏并等返回后检查。',check:`return document.querySelector('#status').textContent==='未收藏 · 失败，已回滚'`,hint:'在 TODO 处加入 saved = previous;。',quiz:quiz('一个 previous 快照足够安全的前提是？',['任意并发都可以','本实验同一状态同时只允许一次写操作'],1,'并发修改需要明确顺序、版本与冲突策略，旧失败不能抹掉新的成功。'),refs:[ref('MDN：异步 JavaScript','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS')]});

advancedLesson({id:'cache',group:'八 · 数据与应用架构',title:'缓存新鲜度、ETag 与重新验证',summary:'用可控的模拟时钟走完缓存命中、304 与内容更新。',time:40,
concepts:[guide('先区分应用缓存与 HTTP 缓存','Map、状态库的请求缓存和浏览器 HTTP 缓存是不同层。此实验用显式对象模拟单个 HTTP 缓存条目的新鲜度和验证流程，不会改变浏览器真实网络缓存。真实请求应在开发者工具 Network 里观察缓存头和状态。'),guide('新鲜时可直接复用，过期后可验证','max-age 表示响应被认为新鲜的时间。过期不等于内容必定变化；客户端可以带 If-None-Match，服务端按 ETag 判断是否返回 304。304 不携带原响应完整正文，客户端继续使用已存正文并更新适用的缓存元数据。'),guide('no-cache 与 no-store 不同','no-cache 允许存储，但复用前必须验证；no-store 要求不要存储该响应。用户私有数据还要考虑 private、身份边界和缓存键。不要把 CDN 公共缓存误用在跨用户可见的个人内容上。')],
html:`<button id="load">读取订单</button><button id="advance">时间前进 6 秒</button><button id="publish">服务端更新版本</button><output id="cache-result">模拟时间 0s</output>`,js:`let now = 0, serverVersion = 1, cache = null;
const maxAge = 5;
function request() {
  if (cache && now - cache.storedAt < maxAge) {
    console.log('新鲜缓存：未发模拟请求'); return cache.body;
  }
  if (cache && cache.etag === serverVersion) {
    cache.storedAt = now;
    console.log('模拟 If-None-Match 命中 → 304'); return cache.body;
  }
  cache = {etag:serverVersion, storedAt:now, body:'订单版本 v'+serverVersion};
  console.log('模拟 200，保存正文与 ETag'); return cache.body;
}
document.querySelector('#load').onclick = () => document.querySelector('#cache-result').textContent = request();
document.querySelector('#advance').onclick = () => { now += 6; console.log('模拟时间', now); };
document.querySelector('#publish').onclick = () => { serverVersion++; console.log('服务器版本',serverVersion); };`,notes:[note('js','now - cache.storedAt','这是教学模型的新鲜度计算，真实 HTTP 年龄计算还涉及 Age、Date、响应延迟等。'),note('js','cache.etag ===','教学使用数字版本代替 HTTP ETag 字符串，表达条件验证。')],
walkthrough:[walk('第一次没有缓存','js','cache = {etag','返回模拟 200 并存正文、时间、版本。'),walk('有效期内重复读取','js','now -','直接使用缓存，即使服务端已经更新。'),walk('过期但内容没变','js','cache.etag ===','模拟 304，仍用现有正文。'),walk('过期且版本变化','js','body:','新的模拟 200 更新正文。缓存不会凭空知道远端变化。')],
depth:deeper(['requests'],'ETag 是验证器，不是有效时长；max-age 和内容验证解决不同问题。','在本地真实服务器设置响应头，分别用 Network 验证 no-cache 与 no-store；本平台沙箱不会发这些真实请求。'),steps:['连续读取两次，查看 200 与新鲜命中日志。','时间前进，再读取，观察 304。','服务端更新、时间前进，再读取新正文。'],task:'通过更新版本并让缓存过期，读取到订单版本 v2。',check:`return document.querySelector('#cache-result').textContent==='订单版本 v2'`,hint:'读取一次 → 服务端更新 → 时间前进 → 读取。',quiz:quiz('Cache-Control: no-cache 的含义是？',['绝不存储','可存储，但复用前需要验证'],1,'不存储通常使用 no-store；no-cache 的关键是每次复用前验证。'),refs:[ref('MDN：HTTP 缓存','https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching')]});

advancedLesson({id:'vue-watch',group:'九 · 框架工作机制',title:'Vue：computed 与 watch 的职责',summary:'派生结果用 computed，异步副作用用 watch，并清理旧任务。',time:45,engine:'vue',
concepts:[guide('computed 描述由状态推导的值','总金额、筛选结果通常能从已有响应式数据推导。computed 跟踪读取的响应式依赖，并缓存计算结果；不要在计算函数中发请求或修改其他状态。依赖变化后下次读取会重新求值。'),guide('watch 执行外部副作用','当查询条件改变需要发请求时，用 watch 观察来源并执行副作用。watch 的回调参数包含新值、旧值与清理注册函数。watchEffect 自动收集同步阶段访问的依赖，async 回调 await 之后新读取的依赖不会因此被自动追踪。'),guide('清理过期任务','本实验通过回调第三参 onCleanup 在 watcher 失效时清除旧定时器；真实 fetch 可在清理中调用 controller.abort。同步创建于 setup 中的 watcher 随组件卸载停止，仍应为已经启动的外部工作注册清理。')],
html:`<div id="app"><label>搜索 <input v-model="query"></label><p>规范化条件：{{ normalized }}</p><output id="vue-result">{{ result }}</output></div>`,js:`const {createApp, ref, computed, watch} = Vue;
createApp({setup() {
  const query = ref('');
  const normalized = computed(() => query.value.trim().toLowerCase());
  const result = ref('请输入条件');
  watch(normalized, (value, oldValue, onCleanup) => {
    const timer = setTimeout(() => {
      result.value = value ? '结果：' + value : '请输入条件';
      console.log('提交搜索结果',value);
    }, value.length === 1 ? 1500 : 150);
    onCleanup(() => clearTimeout(timer));
  });
  return {query, normalized, result};
}}).mount('#app');`,notes:[note('js','computed','纯派生，不单独维护一个 normalized ref 再手动同步。'),note('js','onCleanup','新输入使旧 watcher 失效，旧定时器被取消。')],
walkthrough:[walk('v-model 写入原始输入','html','v-model','输入空格、大写，query 保留原值。'),walk('computed 规范化','js','const normalized','显示和搜索共用一个规范化来源。'),walk('watch 启动工作','js','watch(normalized','来源实际变化时才启动新的异步任务。'),walk('下一次变化先清理','js','onCleanup','注销旧计时器，避免旧结果反向覆盖。')],
depth:deeper(['vue','race'],'computed 不适合充当“带返回值的请求函数”；异步结果需要独立状态表示 loading/error。','增加加载、空数据和失败；在清空输入时立刻清除旧结果并取消工作。'),steps:['输入一个字母，然后迅速输入第二个，观察只提交最后结果。','暂时注释 onCleanup，重跑，观察乱序覆盖。','恢复清理并输入带空格的大写 VUE。'],task:'保留清理逻辑，输入“ VUE ”，结果显示规范化的小写 vue。',check:`return document.querySelector('#vue-result').textContent==='结果：vue'`,hint:'预览输入框输入前后有空格的 VUE，等待 150ms。',quiz:quiz('computed getter 最适合做什么？',['根据响应式状态计算派生值','每次执行时提交 HTTP 写请求'],0,'把纯派生与副作用分开，依赖和执行时机更可预测。'),refs:[ref('Vue：Watchers','https://vuejs.org/guide/essentials/watchers.html'),ref('Vue：Computed','https://vuejs.org/guide/essentials/computed.html')]});

advancedLesson({id:'vue-lifecycle',group:'九 · 框架工作机制',title:'Vue 生命周期与 composable',summary:'封装有启动和清理过程的计时器，让组件卸载后停止工作。',time:45,engine:'vue',
concepts:[guide('组件生命周期界定资源归属','组件 setup 组织状态，onMounted 在挂载后执行需要 DOM 的操作，onUnmounted 清理不再需要的资源。定时器、全局监听器、WebSocket 都需要明确谁创建、谁清理。隐藏 CSS 并不等于卸载。'),guide('composable 封装状态逻辑','以 use 开头的函数是惯例，关键是把状态和生命周期相关行为封装成可复用单元。每次调用通常得到独立状态；把 ref 移到模块顶层则可能共享。不要把 composable 当成仅仅给普通函数换名字。'),guide('v-if 与 v-show 的生命周期不同','v-if false 会销毁分支组件，之后 true 再创建；v-show 切换显示样式而保留组件。短期频繁显示切换和需要真正释放资源的场景可能选择不同。本实验用 v-if 验证卸载后计时器确实停止。')],
html:`<div id="app"><button @click="visible=!visible">{{visible?'卸载计时器':'重新挂载'}}</button><clock-panel v-if="visible"></clock-panel><output id="life">{{visible?'已挂载':'已卸载'}}</output></div>`,js:`const {createApp, ref, onMounted, onUnmounted} = Vue;
function useTicker() {
  const ticks = ref(0);
  let timer;
  onMounted(() => { timer = setInterval(() => { ticks.value++; console.log('tick',ticks.value); }, 500); });
  onUnmounted(() => { clearInterval(timer); console.log('计时器已清理'); });
  return {ticks};
}
createApp({
  components: {ClockPanel: {setup:useTicker, template:'<p>计时：{{ticks}}</p>'}},
  setup() { return {visible:ref(true)}; }
}).mount('#app');`,notes:[note('js','clearInterval','资源清理与创建相对应；仅卸载 DOM 不会自动停止手工创建的 interval。'),note('js','setup:useTicker','组件 setup 调用逻辑函数，返回的 ref 暴露给模板。')],
walkthrough:[walk('父级控制是否存在','html','v-if','false 表示子组件被卸载，而不是仅不可见。'),walk('每个实例建立状态','js','const ticks','重新挂载时再次调用 useTicker，计数重新从 0 开始。'),walk('挂载启动外部工作','js','onMounted','interval 是浏览器资源，需主动管理生命周期。'),walk('卸载释放资源','js','onUnmounted','看到“已清理”后不应继续出现该实例的 tick 日志。')],
depth:deeper(['components','vue-watch'],'display:none 或 v-show 不会触发组件卸载，计时器可能继续执行。','同时挂载两个 ClockPanel，验证各自计数；单独卸载其中一个，不影响另一个。'),steps:['等日志出现两次 tick。','点击卸载，观察清理日志与后续静止。','重新挂载，观察新计数从 0 开始。'],task:'完成一次挂载 → 卸载，最终页面显示“已卸载”；同时人工核对 Console 不再出现 tick。',check:`return document.querySelector('#life').textContent==='已卸载'`,hint:'点击预览中的“卸载计时器”。自动检查验证 DOM 状态，资源清理需结合 Console 观察。',quiz:quiz('把组件 v-if 改为 v-show 后，隐藏会触发 onUnmounted 吗？',['会','不会'],1,'v-show 保留组件实例，仅改变显示状态。'),refs:[ref('Vue：Composables','https://vuejs.org/guide/reusability/composables.html'),ref('Vue：生命周期','https://vuejs.org/guide/essentials/lifecycle.html')]});

advancedLesson({id:'react-effects',group:'九 · 框架工作机制',title:'React：渲染快照与 Effect 清理',summary:'修复 useEffect 漏掉依赖后一直显示旧值的问题。',time:45,engine:'react',
concepts:[guide('每次渲染有自己的变量快照','函数组件执行产生该次渲染的 props、state 与处理函数。闭包中读取的值属于创建它的那次渲染。setState 安排新渲染，不会把正在运行的函数中的旧变量突然替换为新值。'),guide('Effect 同步外部系统','Effect 适合订阅、连接等渲染之外的同步，不是所有派生计算都要放进去。依赖列表应包含 Effect 使用的响应式值，不能为了少执行就隐瞒依赖。依赖变化时先清理上次 Effect，再建立新的同步。'),guide('清理必须对称','创建定时器就清除，添加监听器就移除，发异步请求就处理中止或忽略过期响应。开发环境 StrictMode 可额外执行建立/清理以暴露问题；本实验未启用 StrictMode，不能用它解释所有重复调用。')],
html:`<div id="app"></div>`,js:`const h = React.createElement;
function Search() {
  const [query, setQuery] = React.useState('first');
  const [result, setResult] = React.useState('等待');
  React.useEffect(() => {
    const timer = setTimeout(() => setResult(query), 300);
    return () => clearTimeout(timer);
  }, []); // TODO：声明实际使用的响应式依赖
  return h('section', null,
    h('label', null, '查询 ', h('input', {value:query,onChange:e=>setQuery(e.target.value)})),
    h('output', {id:'effect-result'}, result));
}
ReactDOM.createRoot(document.querySelector('#app')).render(h(Search));`,notes:[note('js','}, []);','空数组意味着不会因为 query 改变而重新同步，初始闭包始终读取 first。'),note('js','return ()','这是 Effect 的清理函数，不是组件渲染内容。')],
walkthrough:[walk('初次渲染捕获 first','js',"useState('first')",'第一次 Effect 的闭包读取这次 query。'),walk('输入触发新渲染','js','onChange','setQuery 让组件再次执行，但旧 Effect 不会因此自动更新依赖。'),walk('依赖列表控制重新同步','js','}, []);','改为 [query] 才与实际读取一致。'),walk('清除旧任务','js','clearTimeout','新输入替换旧定时器，卸载也会清理。')],
depth:deeper(['react','closures'],'不要以为 useEffect([]) 中的闭包能永久读到最新 state，也不要用关闭 lint 规则解决依赖问题。','将延迟操作改成真正请求时，加入 loading/error，并处理 AbortController 和过期结果。'),steps:['输入 second，等待后结果仍是 first。','把依赖列表改为 [query]。','重新运行，再输入 second。'],task:'修复 Effect 依赖，输入 second 后结果同步为 second。',check:`return document.querySelector('#effect-result')?.textContent==='second'`,hint:'Effect 中读取了 query，因此依赖数组需要包含 query。',quiz:quiz('Effect 依赖变化后，旧清理与新建立的顺序是？',['先清理旧 Effect，再建立新 Effect','先无限保留旧 Effect'],0,'清理上次同步，再用新依赖建立同步，避免资源泄漏和旧结果覆盖。'),refs:[ref('React：useEffect','https://react.dev/reference/react/useEffect'),ref('React：State as a snapshot','https://react.dev/learn/state-as-a-snapshot')]});

advancedLesson({id:'react-keys',group:'九 · 框架工作机制',title:'React：列表 key 与组件身份',summary:'反转列表，观察使用下标时输入内容跟错了订单。',time:40,engine:'react',
concepts:[guide('组件状态附着于树中的身份','React 根据类型、位置和 key 等判断哪些子树可以复用。key 在同级列表中区分项目，不会作为普通 props 自动传给子组件。稳定的业务 id 通常比数组下标更能表达数据身份。'),guide('下标表示位置而非实体','列表重排、插入、删除时，下标对应的业务实体可能变了，但局部状态仍留在该位置。文本输入、展开状态和临时草稿于是跟错对象。本实验使用非受控输入的 defaultValue 让问题直接可见。'),guide('随机 key 会造成另一种错误','每次渲染生成随机 key 会让 React 把节点当作全新实例，导致重建、丢失焦点和状态。真正需要重置组件时可以有意改变 key，但应表达业务语义而非当作通用修复手段。')],
html:`<div id="app"></div>`,js:`const h = React.createElement;
function Orders() {
  const [items, setItems] = React.useState([{id:'A',name:'订单 A'},{id:'B',name:'订单 B'}]);
  return h('section', null,
    h('button',{id:'reverse',onClick:()=>setItems([...items].reverse())},'反转顺序'),
    h('ul',null,items.map((item,index)=>h('li',{key:index,'data-id':item.id},
      h('span',null,item.id+' 的备注：'),h('input',{defaultValue:item.name,'aria-label':item.id+' 备注'})))));
}
ReactDOM.createRoot(document.querySelector('#app')).render(h(Orders));`,notes:[note('js','key:index','重排后 index 仍为 0、1，状态按位置复用；换成 item.id 才与业务实体绑定。'),note('js','defaultValue','非受控输入只使用初始值，后续内容由 DOM 保存，这让错误复用明显可见。')],
walkthrough:[walk('初始 A 与 B 各有输入','js','useState','A 在第一行、B 在第二行。'),walk('反转只改数据顺序','js','reverse()','先复制数组再反转，避免直接改 state 数组。'),walk('下标 key 复用错误实体','js','key:index','第一行标签变为 B，但输入 DOM 仍保存原来 A 的值。'),walk('业务 id 维持身份','js','data-id','key:item.id 让整行连同输入状态一起移动。')],
depth:deeper(['react'],'内容不重排且无局部状态的静态列表可使用下标，但不要把这个条件推广到交互列表。','给 A 的备注输入自定义文本，再反转与删除 B，确认焦点和草稿仍归属 A。'),steps:['先反转，观察 B 行输入仍是订单 A。','把 key 改为 item.id，重新运行。','再次反转，检查标签与输入一致。'],task:'修复 key 后反转，第一行应为 B 且输入为订单 B。',check:`const li=document.querySelector('li');return li?.dataset.id==='B' && li.querySelector('input').value==='订单 B'`,hint:'key:index 改成 key:item.id。',quiz:quiz('每次渲染都使用 Math.random() 生成 key 会怎样？',['更稳定','通常导致重新创建组件与丢失局部状态'],1,'key 需要跨渲染稳定，才能表达同一业务对象的身份。'),refs:[ref('React：渲染列表','https://react.dev/learn/rendering-lists'),ref('React：保留和重置状态','https://react.dev/learn/preserving-and-resetting-state')]});

advancedLesson({id:'worker',group:'十 · 性能与交付实践',title:'Web Worker 与主线程边界',summary:'真实启动 Worker 处理计算，通过消息返回结果。',time:40,
concepts:[guide('异步语法不自动换线程','把 CPU 密集循环放进 async 函数，它仍可能阻塞主线程。Web Worker 提供独立执行环境，可承接部分计算；UI DOM 仍由主线程操作。网络 I/O 通常不需要额外 Worker 来“变异步”。'),guide('通过消息传递数据','主线程 postMessage 发送输入，Worker 接收 message、计算后发送结果。数据通常采用结构化克隆；大型 ArrayBuffer 可用 transfer 转移所有权，减少复制但会使发送方缓冲区脱离。不要尝试把 DOM 节点传进 Worker。'),guide('启动与销毁也有成本','Worker 适合足够重或可复用的任务，简单加法没有必要开线程。这个缩小实验用于观察边界，不作性能结论。真实优化需要测任务时长、消息复制与端到端延迟，并处理 error、取消和资源回收。')],
html:`<button id="compute">计算 1 到 10000 的和</button><button id="respond">UI 计数</button><output id="worker-result">等待</output><output id="ui-count">0</output>`,js:`const workerSource = 'onmessage = event => { let sum = 0; for(let i=1;i<=event.data;i++) sum+=i; postMessage(sum); };';
const url = URL.createObjectURL(new Blob([workerSource], {type:'text/javascript'}));
const worker = new Worker(url);
URL.revokeObjectURL(url);
worker.onmessage = event => {
  document.querySelector('#worker-result').textContent = event.data;
  console.log('主线程收到 Worker 结果', event.data);
};
worker.onerror = event => console.error('Worker 错误', event.message);
document.querySelector('#compute').onclick = () => worker.postMessage(10000);
let clicks = 0;
document.querySelector('#respond').onclick = () => document.querySelector('#ui-count').textContent = ++clicks;
addEventListener('pagehide', () => worker.terminate());`,notes:[note('js','new Worker','从 Blob URL 启动真实 Worker；它有独立全局环境，没有 document。'),note('js','worker.onmessage','结果通过消息回来，此处在主线程，才可以操作 DOM。')],
walkthrough:[walk('定义 Worker 程序','js','workerSource','这里是一段另一个执行环境的源码，不能读取主页面变量。'),walk('发送纯数据','js','worker.postMessage','把数字发给 Worker，不传 DOM。'),walk('结果异步返回','js','worker.onmessage','收到结果后更新页面，不能把 postMessage 返回值当作计算结果。'),walk('释放长期资源','js','worker.terminate','页面离开时停止 Worker。生产中按所有者生命周期清理。')],
depth:deeper(['async','performance'],'Worker 不是让所有代码自动变快；启动与数据复制可能比小任务本身还贵。','实现多个任务 id 与取消策略；避免旧任务完成后覆盖新任务结果。'),steps:['点击计算，观察 Console 与结果。','阅读 Worker 源码，找出唯一的通信入口。','试着把输入改为 100，验证结果，再恢复。'],task:'让 Worker 返回 1 到 10000 的和 50005000。',check:`return document.querySelector('#worker-result').textContent==='50005000'`,hint:'点击预览中的计算按钮；本课关注真实线程边界与消息机制。',quiz:quiz('Worker 中可以直接调用 document.querySelector 吗？',['可以','不可以，需要发消息回主线程'],1,'Worker 不拥有页面 DOM，UI 修改应由主线程完成。'),refs:[ref('MDN：使用 Web Workers','https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers')]});

advancedLesson({id:'lazy-modules',group:'十 · 性能与交付实践',title:'动态 import 与按需加载',summary:'打开报表时才加载模块，区分源码模块和构建产物。',time:40,
concepts:[guide('import() 在需要时取得模块','静态 import 声明依赖关系，动态 import() 返回 Promise，可在交互后加载功能。同一模块标识通常在同一个 JavaScript 环境中只求值一次，但重建 iframe 是全新环境。实际生产的模块地址和缓存行为由部署与构建产物共同决定。'),guide('构建器处理源代码到发布文件','Vite 等工具在开发与构建中承担不同职责，例如解析依赖、处理样式资源、打包优化。浏览器执行发布后的资源，不直接理解任意 TypeScript 或未经转换的 JSX。package.json 脚本是命令入口，HTML 仍是 Web 文档入口。'),guide('切分边界要与使用路径一致','把少用的大型报表功能按需加载有价值；每个小函数都单独切分可能增加请求和调度成本。需要明确加载中、加载失败、重试，以及部署后旧页面引用旧 chunk 的问题。本实验用 Blob 模块隔离观察，不伪装成真实 Vite 构建。')],
html:`<button id="report">打开报表</button><output id="module-result">模块尚未导入</output>`,js:`const source = "console.log('报表模块求值'); export function total(items){return items.reduce((sum,n)=>sum+n,0)}";
const url = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
let modulePromise;
async function openReport() {
  document.querySelector('#module-result').textContent = '加载中';
  try {
    modulePromise ||= import(url);
    const module = await modulePromise;
    document.querySelector('#module-result').textContent = module.total([100,200,300]);
  } catch(error) { modulePromise = null; console.error(error); }
}
document.querySelector('#report').onclick = openReport;
addEventListener('pagehide', () => URL.revokeObjectURL(url));`,notes:[note('js','modulePromise ||=','共享导入的 Promise，避免重复创建业务加载过程；失败时重置可再次尝试。'),note('js','await modulePromise','得到模块命名空间对象，通过 export 的名字使用函数。')],
walkthrough:[walk('定义但尚未求值','js','const source','创建字符串不执行模块。'),walk('用户触发加载','js','modulePromise ||=','第一次点击启动 import，等待 Promise。'),walk('模块导出被使用','js','module.total','将命名导出的函数用于业务计算。'),walk('再次打开复用结果','js','const module','重复点击观察“模块求值”只出现一次。')],
depth:deeper(['modules'],'import() 接受的路径需要可解析；任意变量路径是否能构建成功依赖工具，不要假定所有组合都自动打包。','在真实 Vite 项目里拆分报表，运行构建并从 Network 确认点击前后新增的 chunk。'),steps:['运行后先观察 Console 没有求值日志。','点击报表，观察求值与结果。','再点一次，确认模块未重复求值。'],task:'按需导入模块并显示合计 600。',check:`return document.querySelector('#module-result').textContent==='600'`,hint:'点击打开报表；模块源码是真实 ES Module，通过 Blob URL 加载。',quiz:quiz('浏览器通常能直接执行项目源文件里的任意 TypeScript 类型语法吗？',['能','不能，需要相应工具转换或移除类型'],1,'TypeScript 类型不是通用浏览器 JavaScript 运行语法；构建工具连接源代码与发布产物。'),refs:[ref('MDN：import()','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import'),ref('Vite：生产构建','https://vite.dev/guide/build.html')]});

advancedLesson({id:'hydration',group:'十 · 性能与交付实践',title:'CSR、SSR、SSG 与 hydration',summary:'观察服务端已有内容如何变成可交互的客户端页面。',time:40,
concepts:[guide('首份 HTML 从哪里来','CSR 通常让客户端脚本创建主要界面；SSR 在请求时服务端生成内容；SSG 在构建时预生成页面。这些可以在同一产品不同路由混用，不是互相排斥的宗教选择。需要比较数据新鲜度、缓存、首屏成本与部署约束。'),guide('hydration 连接已有标记与应用逻辑','框架 hydration 会尝试复用服务端 DOM，并建立对应组件结构和交互。这里用真实 React hydrateRoot 在已有 HTML 上绑定计数交互；不启动服务器渲染流程，HTML 是按服务端输出形状预置的。'),guide('首轮输出应保持一致','服务端与客户端首轮渲染若使用不同数据、随机值、时区或依赖浏览器状态，就可能不匹配。应使用一致的初始数据；客户端专有内容在合适阶段更新。不要单纯压制警告来隐藏数据协议问题。')],
html:`<div id="app"><button id="hydrate-count">订单 3</button></div><p>上方标记已存在，点击初始化后才绑定 React 交互。</p><button id="hydrate-start">初始化客户端</button>`,js:`const h = React.createElement;
function Counter() {
  const [count, setCount] = React.useState(3);
  return h('button',{id:'hydrate-count',onClick:()=>setCount(n=>n+1)},'订单 '+count);
}
document.querySelector('#hydrate-start').onclick = event => {
  ReactDOM.hydrateRoot(document.querySelector('#app'), h(Counter), {
    onRecoverableError: error => console.error('hydration 不匹配',error.message)
  });
  event.currentTarget.disabled = true;
  console.log('已对预置 HTML 执行真实 React hydration');
};`,engine:'react',notes:[note('js','useState(3)','与预置 HTML 的订单 3 一致；改成不同值可观察 mismatch。'),note('js','hydrateRoot','连接已有 HTML，不是从空容器开始的 createRoot。')],
walkthrough:[walk('静态内容已能阅读','html','订单 3','初始标记已有按钮，但尚未绑定 React 事件。'),walk('使用一致初始数据','js','useState(3)','客户端首次渲染也输出订单 3。'),walk('执行 hydration','js','ReactDOM.hydrateRoot','复用标记并建立组件交互结构。'),walk('用户操作更新状态','js','setCount(n=>n+1)','之后走正常客户端渲染链路。')],
depth:deeper(['react','loading'],'能看到 HTML 不等于 JS 已下载、hydration 已完成或交互已准备好。','改变客户端初值复现不匹配，再用一致的数据恢复；真实 SSR 项目需安全序列化初始数据。'),steps:['未初始化时点击订单按钮，观察不变。','初始化客户端后再点击。','尝试更改客户端初值，核对 Console 中的错误，再恢复。'],task:'初始化客户端，再把订单数增加到 4。',check:`return document.querySelector('#hydrate-count').textContent==='订单 4'`,hint:'先点初始化客户端，再点订单按钮。',quiz:quiz('hydration 首次客户端输出通常应与什么一致？',['任意本机随机值','服务端已经输出的对应内容'],1,'数据和结构一致是复用既有 HTML 的基础。'),refs:[ref('React：hydrateRoot','https://react.dev/reference/react-dom/client/hydrateRoot')]});

advancedLesson({id:'intl',group:'十 · 性能与交付实践',title:'国际化、货币与时区边界',summary:'让同一份业务数据按语言和时区正确显示。',time:35,
concepts:[guide('存储值与展示文本分开','价格可存最小货币单位整数，展示时按货币与语言格式化。不是每种货币都固定两位小数，业务数据必须定义单位。不要把“¥1,234.50”解析回业务数值，也不要用已格式化文本参加排序与金额计算。'),guide('时间戳不等于日历日期','一个带 Z 的时间戳表达 UTC 时刻，用户在不同时区可看到不同日期。生日、账期等纯日期与会议发生时刻语义不同。必须先定义业务类型，再决定 UTC 时间戳、时区或年月日的存储形式。'),guide('Intl 使用运行环境的国际化数据','Intl.NumberFormat 和 Intl.DateTimeFormat 提供本地化显示。locale 和 timeZone 应显式传入以减少环境默认值差异；若服务端与客户端默认时区不同，还可能导致 hydration 不匹配。国际化也包括文案长度、复数、排序和从右到左布局。')],
html:`<label>时区 <select id="zone"><option value="Asia/Shanghai">上海</option><option value="America/New_York">纽约</option><option value="UTC">UTC</option></select></label><output id="money"></output><output id="date"></output>`,js:`const cents = 123450;
const instant = new Date('2026-01-01T00:30:00Z');
function render() {
  const zone = document.querySelector('#zone').value;
  document.querySelector('#money').textContent = new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY'}).format(cents/100);
  document.querySelector('#date').textContent = new Intl.DateTimeFormat('zh-CN',{
    timeZone:zone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).format(instant);
  console.log('原始时刻保持不变',instant.toISOString());
}
document.querySelector('#zone').onchange = render;
render();`,notes:[note('js',"T00:30:00Z",'Z 表示 UTC。它是同一个时刻，各时区显示不同墙上时间。'),note('js','cents/100','此处数据契约明确为人民币分；其他币种需独立定义最小单位。')],
walkthrough:[walk('保存业务原值','js','const cents','存整数分，保留数据语义。'),walk('货币格式只用于展示','js','Intl.NumberFormat','输出可能带分组符号，不再用它做金额计算。'),walk('选择显示时区','js','timeZone:zone','转换显示，不改变底层时间戳。'),walk('检查日期边界','js','toISOString','纽约可能仍是上一日，但 UTC 时刻不变。')],
depth:deeper(['javascript','hydration'],'不要假定所有时间都加固定小时数就能转换，部分地区存在夏令时与历史时区规则。','加入 en-US 与 de-DE，比较价格和日期格式；保留原值排序。'),steps:['切换纽约，观察日期变为 2025 年 12 月 31 日。','切到 UTC，和日志中的 ISO 时刻对照。','复述业务原值与展示字符串的区别。'],task:'选择 UTC，让页面显示 2026/01/01 00:30 对应的时刻。',check:`return document.querySelector('#zone').value==='UTC' && document.querySelector('#date').textContent.includes('00:30')`,hint:'时区下拉选择 UTC。',quiz:quiz('格式化后的金额字符串适合直接拿来求和吗？',['适合','不适合，应保留有单位契约的原始数值'],1,'格式化只负责显示，可能包含货币符号、分组符号和本地化小数分隔符。'),refs:[ref('MDN：Intl','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl')]});

advancedLesson({id:'release',group:'十 · 性能与交付实践',title:'从本地可用到可验收交付',summary:'用真实校验函数逐项检查配置，练习提交前的验收思路。',time:45,
concepts:[guide('验收描述用户行为而非代码行数','需求评审先写输入、动作和可观察结果：无数据时显示什么，断网后能否重试，刷新是否保留查询，键盘能否完成主要操作。代码评审检查状态归属、边界处理、安全与可维护性，视觉验收检查布局、内容和各种状态。'),guide('发布物与本地源码不同','先运行生产构建，再用接近部署的方式预览发布产物，检查资源路径、环境变量、路由刷新与缓存。前端打包中的配置对使用者可见，不能放数据库密码或私钥。这里是本地配置校验练习，不代表真实部署流水线已执行。'),guide('上线后需要可定位和可回退','收集版本号、错误上下文、受影响路由和必要的请求关联信息，避免记录 token 与个人敏感输入。发布前定义回滚步骤和兼容窗口：旧 JS 可能继续访问新 API，旧页面也可能请求已经删除的旧 chunk。')],
html:`<h3>发布前配置检查</h3><textarea id="config" rows="9" style="width:100%;box-sizing:border-box">{"assetBase":"/app/","hasFallback":false,"exposesSecret":true,"hasRollback":false}</textarea><button id="audit">检查配置</button><output id="audit-result"></output>`,js:`function validate(config) {
  const issues = [];
  if (typeof config.assetBase !== 'string' || !config.assetBase.startsWith('/')) issues.push('资源路径应明确');
  if (config.hasFallback !== true) issues.push('确认 history 路由刷新回退策略');
  if (config.exposesSecret !== false) issues.push('移除客户端密钥');
  if (config.hasRollback !== true) issues.push('补齐回滚方案');
  return issues;
}
document.querySelector('#audit').onclick = () => {
  try {
    const config = JSON.parse(document.querySelector('#config').value);
    const issues = validate(config);
    document.querySelector('#audit-result').textContent = issues.length ? issues.join('；') : '本练习配置检查通过';
  } catch(error) { document.querySelector('#audit-result').textContent = 'JSON 格式或数据结构错误'; }
};`,notes:[note('js','config.hasFallback','history 路由是否需要回退取决于部署方案；此配置练习假设使用客户端 history 路由。'),note('js','config.exposesSecret','前端环境变量并不自动等于秘密，构建后的代码与网络资源可被查看。')],
walkthrough:[walk('把条件写成明确规则','js','function validate','规则纯计算，返回问题清单，便于复查。'),walk('处理语法与结构边界','js','JSON.parse','无效 JSON 应给可理解错误，不能让整个页面中断。'),walk('把问题反馈到界面','js','issues.join','通过只表示本练习规则满足，不能替代真实环境验收。'),walk('用项目区完成真实交付清单','html','发布前配置检查','再去项目实践填写可复现的验收证据，把实验迁移到自己的仓库。')],
depth:deeper(['quality','capstone','lazy-modules'],'勾选“已验收”不是自动测试；需要写出操作、预期、实际和验证版本，让别人能复查。','选 Vue 或 React 重做订单项目，拿项目区的交付清单进行一次完整自评。'),steps:['先检查默认配置，阅读三个问题。','调整 JSON 字段，重新检查。','输入非法 JSON，验证友好的错误，再修正。'],task:'修复示例配置，让本练习全部规则通过。',check:`return document.querySelector('#audit-result').textContent==='本练习配置检查通过'`,hint:'hasFallback:true、exposesSecret:false、hasRollback:true，保留 /app/ 路径。',quiz:quiz('以 VITE_ 或其他前缀注入的客户端变量能安全保存数据库密码吗？',['可以，构建后不可见','不可以，客户端发布物可被读取'],1,'敏感凭据只应留在受信任的服务端环境，客户端通过授权接口获取必要数据。'),refs:[ref('Vite：环境变量','https://vite.dev/guide/env-and-mode.html'),ref('MDN：客户端工具概览','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview')]});

// Flutter 保留为独立分支，不中断 Web 学习主线。稳定 id 保留旧进度。
const flutterIndex = window.COURSE.findIndex(l => l.id === 'flutter');
const flutterBranch = window.COURSE.splice(flutterIndex, 1)[0];
flutterBranch.group = '十一 · 跨端拓展';
window.COURSE.push(flutterBranch);
window.COURSE.forEach(lesson => { if (lesson.id !== 'hydration') lesson.html = lesson.html.replace(/></g, '>\n<'); });
