'use strict';
const uniRuntime='原生 JS 机制模型 · 不执行 uni-app 编译器或小程序运行时；真实 uni-app 写法见工程源码';
const uniLesson=spec=>fwLesson({track:'uniapp',group:'十四 · uni-app 跨端开发',runtime:uniRuntime,...spec});
uniLesson({id:'uni-runtime',title:'uni-app：一套源码如何到多个端',summary:'先分清 Vue、编译器、平台运行时与设备能力，再讨论代码复用。',time:50,
principles:[['本路线明确运行范围','以经典 uni-app 的 Vue 3 / JavaScript / .vue 路线为主；uni-app x、UTS、.uvue 属于另一套需要单独学习的技术边界。'],['跨端依赖编译与适配','同一套组件和 API 被处理成目标平台可用的产物，不代表每个端都运行普通浏览器 DOM。'],['复用业务，验证差异','数据模型与业务规则可大量共享；组件、样式、权限和平台能力仍需按目标平台验证。']],
theory:[fwTheory('从普通 Vue Web 项目迁移时哪里变了',['普通 Vue Web 应用通常挂载到浏览器 DOM，依赖 window、document 和 Web API。uni-app 源码仍使用 Vue 组件思想，但编译目标可能是 Web、小程序或 App。组件和平台 API 形成一层公共接口，输出与运行结构根据目标变化。','因此，把网页里 document.querySelector、浏览器专用库或任意 CSS 效果直接搬进小程序，不会自动跨端成功。先划出业务逻辑与平台适配层，再把依赖宿主环境的代码限制在明确边界。']),fwTheory('组件标签不等于 HTML 标签别名',['view、text、scroll-view 等是 uni-app 的基础组件契约。Web 输出可能呈现为 DOM，但小程序目标还涉及平台组件和逻辑/视图更新机制。不能以 Web 调试器里看到的标签结构，推断所有目标端的实现。','经典 uni-app 的 App .vue 页面与 .nvue 原生渲染有不同能力范围；本课程的项目起点使用 .vue，不把 CSS 和 DOM 能力推广到所有渲染方式。uni-app x 的 UTS 与 .uvue 也不与本路线混为一谈。']),fwTheory('如何评估一个依赖能否跨端',['先问库依赖什么：纯数据转换库通常更易复用；依赖 DOM、浏览器存储或 Node 文件系统的库需要目标端替代或专门适配。再查框架与平台兼容表，最后在真实目标端验证关键路径。','本实验切换下拉框只是教学模型，展示相同来源对应的不同能力约束，不会真的编译小程序或安装 App。后面的工程源码区提供真实文件写法与运行检查点，让模型与实际开发连接起来。'])],
html:`<label>编译目标<select id="target"><option value="web">Web</option><option value="mp">微信小程序</option><option value="app">App .vue</option></select></label><pre id="target-info"></pre>`,
js:`const targets={
 web:{output:'Web 页面资源',dom:'浏览器 DOM 可用，但直接依赖它会限制复用',request:'受浏览器同源与 CORS 约束'},
 mp:{output:'微信小程序目标产物',dom:'不能假定存在浏览器 document',request:'需检查平台域名配置与真机环境'},
 app:{output:'经典 uni-app 的 App .vue 资源',dom:'不要把 Web DOM 写法当作跨端公共接口',request:'需检查证书、权限与设备网络'}
};
function render(){const value=document.querySelector('#target').value;document.querySelector('#target-info').textContent=JSON.stringify(targets[value],null,2);console.log('教学模型目标',value);}
document.querySelector('#target').onchange=render;render();`,
walkthrough:[walk('选择目标','html','id="target"','选择改变模型中的目标，不会执行编译。'),walk('读取能力约束','js','const targets','用显式能力表避免“所有端都是浏览器”的假设。'),walk('呈现差异','js','JSON.stringify','同一源业务在不同平台有不同运行约束。')],
prerequisites:['vue-sfc','modules'],pitfall:'不要混淆经典 uni-app 与 uni-app x，也不要把 Web 预览成功当作其他平台已验证。',extension:'列出自己的页面使用的 API，标出纯业务、浏览器专用和设备专用三类依赖。',steps:['切换三个目标，比较约束。','选择微信小程序。','用自己的话说明为什么不能直接使用 document。'],task:'选择微信小程序，观察它的 DOM 与网络约束。',check:`return document.querySelector('#target').value==='mp'`,hint:'下拉选择微信小程序。',quiz:quiz('uni-app Web 端页面能运行，是否就证明微信小程序端可以直接使用 document？',['可以','不能，目标运行时不同'],1,'源码复用由编译与平台接口支撑，不能假定所有目标都有浏览器环境。'),files:[fwFile('pages/orders/index.vue','真实 uni-app Vue 3 页面片段；需 uni-app 工具链编译。',`<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>
<template>
  <view><text>订单 {{ count }}</text><button @click="count++">增加</button></view>
</template>
<style scoped>view { padding: 24rpx; }</style>`)],refs:[ref('uni-app：页面与运行模型','https://uniapp.dcloud.net.cn/tutorial/page.html'),ref('uni-app：跨端差异','https://uniapp.dcloud.net.cn/tutorial/platform.html')]});

uniLesson({id:'uni-pages',title:'uni-app 工程入口与 pages.json',summary:'把 main.js、App.vue、pages.json、manifest.json 放到一条启动链里。',time:50,
principles:[['页面必须注册','pages.json 声明页面与导航配置，pages 中第一个页面通常是启动页。'],['应用与页面分层','App.vue 处理应用级生命周期与全局样式，页面承担各自 UI 和页面级逻辑。'],['配置参与构建','manifest.json 描述应用与平台配置；不能把它当普通组件 props 或运行时 URL 路由表。']],
theory:[fwTheory('为什么不再从手写 index.html 思考所有端',['uni-app 工程通过目标工具链生成平台启动产物。Vue 3 的 main.js 常导出 createApp，内部创建根应用，再由框架接管后续流程；不能照搬普通 Web 入口的 app.mount("#app") 到所有端。','App.vue、pages.json 与 manifest.json 的职责不同：根应用级逻辑、页面注册和窗口配置、应用平台元信息。页面文件放进目录并不代表会自动成为可导航页面，还需检查注册路径。']),fwTheory('pages.json 是可审查的页面清单',['pages 的 path 一般相对工程且不含 .vue 后缀。页面路径、tabBar 的 pagePath 和目录实际位置必须一致。新增、重命名、删除页面时，应同步调整引用，避免留下只在某条导航路径才触发的问题。','首页取决于注册顺序，不由文件是否叫 index 决定。按功能分目录能让页面、组件和 services 关系更清楚；页内可复用部件不必都注册为页面。']),fwTheory('开发与发布配置分开验证',['AppID、平台包标识、权限描述和发行配置需要与真实平台账户和目标匹配。课程示例不包含你的账号与签名信息。开发工具放宽某些校验，不代表发布包可以省略相同条件。','检查顺序可以是：确认经典 uni-app Vue 3 项目 → 注册两个页面 → Web 运行 → 目标平台开发工具运行 → 真机验证。每一步只证明对应环境，不自动证明全部平台可用。'])],
html:`<label>pages.json 模型<textarea id="pages-config" rows="7" style="width:100%;box-sizing:border-box">{"pages":[{"path":"pages/profile/index"},{"path":"pages/orders/index"}]}</textarea></label><button id="inspect-pages">检查启动页</button><output id="home-page"></output>`,
js:`function inspect(config){
 if(!Array.isArray(config.pages)||!config.pages.length)throw new Error('pages 不能为空');
 const paths=config.pages.map(p=>p.path);
 if(paths.some(p=>typeof p!=='string'||p.startsWith('/')||p.endsWith('.vue')))throw new Error('路径应相对工程且不带 .vue');
 if(new Set(paths).size!==paths.length)throw new Error('页面路径重复');
 return paths[0];
}
document.querySelector('#inspect-pages').onclick=()=>{try{document.querySelector('#home-page').textContent='启动页：'+inspect(JSON.parse(document.querySelector('#pages-config').value));}catch(error){document.querySelector('#home-page').textContent=error.message;}};`,
walkthrough:[walk('解析配置','js','JSON.parse','本页解析 JSON 模型，不运行 uni-app 编译。'),walk('验证页面集合','js','Array.isArray','空列表、错误路径和重复路径都是配置层问题。'),walk('确定启动页','js','return paths[0]','第一项决定模型中的启动页。')],
prerequisites:['uni-runtime','vue-sfc'],pitfall:'main.js 入口写法取决于工程工具链，不要在所有平台直接调用普通 Web 的 mount。',extension:'添加详情页并同步一处导航入口，解释页面组件与普通子组件的区别。',steps:['检查默认配置，启动页是个人页。','交换 pages 数组顺序。','再次检查，订单页成为启动页。'],task:'修改配置，让 pages/orders/index 成为启动页。',check:`return document.querySelector('#home-page').textContent==='启动页：pages/orders/index'`,hint:'把 orders 的配置项移到 pages 数组第一位。',quiz:quiz('新建一个 .vue 页面文件后，通常还需要做什么？',['只改文件名','在 pages.json 中注册页面'],1,'页面路径与构建配置需要一致，普通组件则不应随意注册为页面。'),files:[fwFile('main.js','经典 uni-app Vue 3 工程入口。',`import App from './App.vue';
import { createSSRApp } from 'vue';
export function createApp() {
  const app = createSSRApp(App);
  return { app };
}`),fwFile('App.vue','应用级启动、显示、隐藏；页面 UI 在 pages 目录中。',`<script>
export default {
  onLaunch() { console.log('应用启动'); },
  onShow() { console.log('应用显示'); },
  onHide() { console.log('应用隐藏'); }
};
</script>
<style>page { background: #faf9f5; }</style>`),fwFile('pages.json','页面注册配置片段。',`{
  "pages": [
    { "path": "pages/orders/index", "style": { "navigationBarTitleText": "订单" } },
    { "path": "pages/detail/index", "style": { "navigationBarTitleText": "详情" } }
  ]
}`),fwFile('manifest.json','版本与平台配置需按实际工程补齐，不能用片段替代发行配置。',`{
  "name": "订单学习项目",
  "vueVersion": "3",
  "versionName": "1.0.0",
  "versionCode": "100"
}`)],refs:[ref('uni-app：pages.json','https://uniapp.dcloud.net.cn/collocation/pages.html'),ref('uni-app：main.js','https://uniapp.dcloud.net.cn/collocation/main.html')]});

uniLesson({id:'uni-lifecycle',title:'页面生命周期：加载、返回与卸载',summary:'为什么从详情返回列表会再次 onShow，却不一定再次 onLoad。',time:55,
principles:[['页面与组件生命周期并存','onLoad/onShow 等描述页面行为，Vue mounted/unmounted 描述组件实例行为，不能随意互换。'],['返回可能复用旧页面','详情压栈后列表被隐藏，返回时列表再次显示，不必重新创建。'],['资源按可见性与所有权管理','隐藏时暂停可见性相关工作，卸载时最终释放资源；异步结果也要检查页面是否仍可提交。']],
theory:[fwTheory('用一次导航推演时序',['从列表打开详情时，列表可能保持在页面栈里，只触发隐藏；新详情触发自身加载与显示。返回详情后，详情卸载，列表再次显示。把“每次看到页面”都当成“创建全新实例”，会误判草稿保留和请求次数。','onLoad 常用于接收页面参数与初始化；onShow 适合在每次显示时做必要刷新，但要结合缓存和失效策略避免重复请求。onReady 表示相应初次渲染阶段完成，不应泛化为所有后续异步数据都已经展示。']),fwTheory('避免 onLoad 与 onShow 重复请求',['常见错误是在两个钩子中无条件调用同一个 fetch，首进页面触发重复请求。可以让 onLoad 只接参数，onShow 根据 stale 或 dirty 标志决定刷新；也可以在 onLoad 首次加载，onShow 只处理返回后确有失效的情况。','从详情修改订单返回列表，可通过明确的失效通知或共享状态标记刷新，而不是依赖固定延时。数据是否过期属于业务协议，页面显示事件只是触发检查的机会。']),fwTheory('页面离开后的异步工作',['页面隐藏可能仍存在，页面卸载则不应再向其状态提交过期结果。对于请求，可以同时中止请求任务和使用请求版本检查。对计时器，定义 start/stop，保证多次显示不创建多个重复实例。','本页使用显式状态机模拟页面栈相关生命周期，日志来自模型，不是小程序运行时钩子的真实追踪。迁移到工程时，按源码挂接真实 onLoad/onShow/onHide/onUnload，再在目标端核验。'])],
html:`<button id="open-child">打开详情</button><button id="return-list">返回列表</button><output id="life-count"></output><pre id="life-events"></pre>`,
js:`let currentPage='list', loads=1, shows=1;
const events=['列表 onLoad','列表 onShow'];
function render(){document.querySelector('#life-count').textContent='列表加载 '+loads+' 次 / 显示 '+shows+' 次';document.querySelector('#life-events').textContent=events.join('\\n');}
document.querySelector('#open-child').onclick=()=>{if(currentPage!=='list')return;events.push('列表 onHide','详情 onLoad','详情 onShow');currentPage='detail';render();};
document.querySelector('#return-list').onclick=()=>{if(currentPage!=='detail')return;events.push('详情 onUnload','列表 onShow');currentPage='list';shows++;render();};
render();`,
walkthrough:[walk('初始化列表实例','js','loads=1','模型第一次创建列表时加载一次。'),walk('打开详情保留列表','js',"'列表 onHide'",'列表被隐藏，不增加 loads。'),walk('返回再次显示','js','shows++','复用原列表实例，增加显示次数。')],
prerequisites:['uni-pages','vue-lifecycle','race'],pitfall:'onShow 触发不代表需要无条件重取全部数据；也不要同时在 onLoad 和 onShow 重复加载。',extension:'给模型增加 dirty 标志，仅详情修改后返回才刷新列表。',steps:['打开详情，阅读事件模型。','返回列表，看加载与显示次数。','再次往返，确认显示次数继续增大而加载仍为 1。'],task:'完成一次打开详情并返回，列表加载 1 次、显示 2 次。',check:`return document.querySelector('#life-count').textContent==='列表加载 1 次 / 显示 2 次'`,hint:'打开详情一次，再返回一次。',quiz:quiz('从详情返回仍在页面栈中的列表，哪个通常会再次触发？',['onShow','一定重新 onLoad'],0,'显示与重新创建是不同事件，需结合实际导航方式判断。'),files:[fwFile('pages/orders/index.vue','真实页面钩子注册片段，refresh 需接入你的数据层。',`<script setup>
import { ref } from 'vue';
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app';
const dirty = ref(true);
let timer;
function stop() { clearInterval(timer); timer = undefined; }
onLoad(options => { console.log('入口参数', options); });
onShow(() => { console.log('检查是否需要刷新', dirty.value); });
onHide(stop);
onUnload(stop);
</script>`)],refs:[ref('uni-app：页面生命周期','https://uniapp.dcloud.net.cn/tutorial/page.html#页面生命周期')]});

uniLesson({id:'uni-navigation',title:'页面栈：navigateTo、redirectTo 与 switchTab',summary:'把导航 API 看成对页面栈的不同操作，预测返回之后会去哪里。',time:55,
principles:[['navigateTo 保留当前页','打开非 tabBar 页面并增加页面栈层级，适合列表进入详情。'],['redirectTo 替换当前页','当前页被关闭并由新页替代，适合不希望返回中间页的流程。'],['switchTab 切换 tabBar','目标必须是配置的 tabBar 页面，不能把它当任意页面的通用跳转。']],
theory:[fwTheory('先画栈，再选择 API',['如果列表 A 打开详情 B，期望返回到 A，就需要保留 A。若 B 提交后进入结果 C，且不希望回到 B，可考虑替换 B。错误使用 redirectTo 会让用户找不到返回页，错误使用 navigateTo 可能积累无意义的中间层。','navigateBack 按 delta 返回已有层级，不等价于任意 URL 跳转。reLaunch 则关闭页面并打开新的起点，常用于明确重置导航过程。具体边界、栈限制与平台差异需以目标平台文档和实测为准。']),fwTheory('tabBar 与普通页面有不同约束',['navigateTo 和 redirectTo 不用于打开 tabBar 页面；switchTab 目标应已在 tabBar 中注册。导航到 tab 页时需要通过约定的状态方式传递信息，不能把普通详情页的 query 传参习惯直接套在所有导航方式上。','模型保留一个简化可见栈帮助理解 API 的意图，不模拟原生 tab 页所有缓存行为和各平台栈上限。生产代码应依据实际页面类型选择 API，并处理 fail 回调。']),fwTheory('参数是边界输入',['详情 id 通过 ?id= 传入，读取后先验证类型与允许形式，再请求详情。不要在 URL 放登录 token 或完整个人资料。传复杂对象更应考虑清晰的状态所有权与更新协议，而不是无限扩大 query。','本例 API 名称加 model 前缀，避免把本页 JavaScript 模型误认为真实 uni 对象。源码区展示 uni.navigateTo 的真实调用形式，两者使用环境不同。'])],
html:`<button id="push-detail">navigateTo 详情</button><button id="replace-edit">redirectTo 编辑</button><button id="go-back">navigateBack</button><button id="switch-home">switchTab 首页</button><pre id="page-stack"></pre>`,
js:`let stack=['/pages/home/index'];
function render(){document.querySelector('#page-stack').textContent=stack.join(' → ');}
function modelNavigateTo(url){stack=[...stack,url];render();}
function modelRedirectTo(url){stack=[...stack.slice(0,-1),url];render();}
function modelNavigateBack(){if(stack.length>1)stack=stack.slice(0,-1);render();}
function modelSwitchTab(){stack=['/pages/home/index'];render();}
document.querySelector('#push-detail').onclick=()=>modelNavigateTo('/pages/detail/index?id=OD-1');
document.querySelector('#replace-edit').onclick=()=>modelRedirectTo('/pages/edit/index?id=OD-1');
document.querySelector('#go-back').onclick=modelNavigateBack;
document.querySelector('#switch-home').onclick=modelSwitchTab;render();`,
walkthrough:[walk('压栈保留来源','js','stack=[...stack,url]','进入详情后仍可返回原页。'),walk('替换移除当前层','js','stack.slice(0,-1),url','当前详情被编辑页替代，不增加层数。'),walk('返回弹出一层','js','stack=stack.slice(0,-1)','返回已有上一层；模型从一层时不再减少。')],
prerequisites:['uni-pages','uni-lifecycle'],pitfall:'导航 API 选错会改变返回体验；switchTab 的目标必须匹配 tabBar 配置。',extension:'增加登录页与成功结果页，画出需要保留的返回路径并选择各次导航 API。',steps:['打开详情，观察两层。','替换为编辑，观察仍两层。','返回首页，再打开详情一次。'],task:'完成 navigateTo 后，栈中保留首页与 OD-1 详情两层。',check:`return document.querySelector('#page-stack').textContent==='/pages/home/index → /pages/detail/index?id=OD-1'`,hint:'若已做其他操作，先 switchTab 首页，再 navigateTo 详情。',quiz:quiz('希望替换当前普通页面而不增加一层，使用哪个 API？',['redirectTo','navigateTo'],0,'选择导航 API 前先明确是否应保留当前页作为返回目标。'),files:[fwFile('pages/orders/navigation.js','真实 uni-app 导航片段；页面需已注册。',`export function openOrder(id) {
  uni.navigateTo({
    url: '/pages/detail/index?id=' + encodeURIComponent(id),
    fail(error) { console.error('导航失败', error.errMsg); }
  });
}`)],refs:[ref('uni-app：路由与页面跳转','https://uniapp.dcloud.net.cn/api/router.html')]});

uniLesson({id:'uni-request',title:'uni.request：传输、HTTP 与业务失败',summary:'success 回调不等于业务成功，建立可取消、可解释的请求边界。',time:60,
principles:[['三个失败层次','网络传输失败、HTTP 状态失败、业务返回失败分别处理，避免全部显示“网络异常”。'],['请求任务与取消','显式回调形式可取得 RequestTask，按生命周期调用 abort；过期响应仍需身份判断。'],['平台网络约束不同','Web 关注 CORS，小程序关注合法域名与平台规则，App 还涉及证书和设备网络等实际环境。']],
theory:[fwTheory('收到响应不代表请求达成目的',['uni.request 的 success 表示收到服务器返回，不代表 statusCode 为 2xx，也不代表 JSON 中业务 code 成功。500 响应仍可能进入 success，所以需要按 HTTP 状态、数据结构和业务协议逐层判断。','先定义统一错误结构，例如 kind 为 transport/http/business/schema/cancel，再决定页面提示、重试和日志。业务校验错误通常不能靠无脑重试解决；取消也不应总以严重故障提示用户。']),fwTheory('Promise 包装要保留取消能力',['只返回 new Promise 会隐藏底层请求任务，页面卸载后可能难以主动取消。可以返回 {promise, abort}，在页面拥有的生命周期里清理。同时给请求附上递增版本，只有最新请求可以修改当前视图。','本课本地 modelResponse 用固定数据模拟 success 回调中的 HTTP 返回，不发真实网络请求。源码区展示真实回调包装，并明确业务 code 的值是本例与后端约定的协议，而非 uni-app 自带标准。']),fwTheory('跨端网络排查顺序',['先检查 URL、方法、参数与鉴权，再看是否收到 HTTP 响应。Web 被 CORS 阻止读取与服务端返回业务拒绝不是同一类问题；小程序开发工具关闭合法域名校验，也不能证明真机或发行环境可用。','日志记录请求标识、状态码、阶段与时间，避免记录 token 和完整个人数据。接口鉴权在服务端执行，客户端只负责携带合适凭据与响应过期流程。不要把 API secret 打包进应用。'])],
html:`<label>模拟返回<select id="response-mode"><option value="http">HTTP 500</option><option value="business">HTTP 200 / 业务拒绝</option><option value="ok">HTTP 200 / 业务成功</option></select></label><button id="request-order">执行本地模型</button><output id="request-status"></output>`,
js:`function modelResponse(mode){
 if(mode==='http')return {statusCode:500,data:{code:'ERROR'}};
 if(mode==='business')return {statusCode:200,data:{code:'NO_STOCK'}};
 return {statusCode:200,data:{code:'OK',items:[]}};
}
function classify(res){
 // TODO：先处理非 2xx HTTP 状态
 if(res.data.code!=='OK')return '业务失败';
 return '业务成功';
}
document.querySelector('#request-order').onclick=()=>{
 const res=modelResponse(document.querySelector('#response-mode').value);
 document.querySelector('#request-status').textContent=classify(res);
 console.log('模型收到响应',res);
};`,
walkthrough:[walk('构造回调收到的数据','js','statusCode:500','收到服务器返回仍可能是 HTTP 错误。'),walk('按层分类','js','TODO','先检查 statusCode，再检查业务 code。'),walk('页面显示可解释反馈','js','classify(res)','页面消费统一分类，而不是把全部错误归为网络失败。')],
prerequisites:['requests','race','uni-lifecycle'],pitfall:'success 不等于 HTTP 2xx；statusCode 正常也不等于业务成功。',extension:'增加超时、取消与字段缺失分类，并说明哪些情况允许自动重试。',steps:['先执行 HTTP 500，发现被误归为业务失败。','增加 HTTP 状态判断。','分别验证三种返回。'],task:'修复分类，让 HTTP 500 显示 HTTP 失败。',check:`return document.querySelector('#request-status').textContent==='HTTP 失败'`,hint:'if(res.statusCode<200 || res.statusCode>=300) return "HTTP 失败";',quiz:quiz('uni.request 进入 success 回调后还应检查什么？',['无需检查','HTTP 状态、数据结构与业务协议'],1,'收到响应仅说明传输到达一定阶段，业务是否成功仍要逐层验证。'),files:[fwFile('services/request.js','真实 uni.request 包装片段；URL 与业务 code 由实际服务定义。',`export function request(options) {
  let task;
  const promise = new Promise((resolve, reject) => {
    task = uni.request({
      ...options,
      success(res) {
        if (res.statusCode < 200 || res.statusCode >= 300)
          return reject({ kind: 'http', status: res.statusCode });
        if (!res.data || res.data.code !== 'OK')
          return reject({ kind: 'business', code: res.data?.code });
        resolve(res.data);
      },
      fail(error) { reject({ kind: 'transport', message: error.errMsg }); }
    });
  });
  return { promise, abort: () => task?.abort() };
}`)],refs:[ref('uni-app：uni.request','https://uniapp.dcloud.net.cn/api/request/request.html')]});

uniLesson({id:'uni-pagination',title:'下拉刷新与上拉分页的一致性',summary:'处理重复触底、末页、刷新与旧分页请求交错。',time:60,
principles:[['刷新重建结果集','刷新重置页码与列表，并使旧结果集的请求失效。'],['分页只在合适状态触发','loading 时不重复加载，结束时不继续请求；提交成功后再推进页码。'],['触发器不等于状态机','onReachBottom 与 scroll-view 的触底事件不是同一个入口，但应复用明确的数据流程。']],
theory:[fwTheory('先定义数据不变量',['列表显示的是同一筛选条件、同一轮查询的连续页数据。页码代表已成功提交的进度，不应在请求刚发出时就永久加一。否则失败重试会跳页；重复触底则可能重复添加同一页。','最小状态可包含 items、page、phase、finished 和 generation。loading 表示当前请求正在进行，finished 表示服务端已经确认没有更多数据。不要仅凭页面滚动事件频繁触发就盲目排队请求。']),fwTheory('刷新需要切断旧结果集',['假设第 3 页请求还没结束，用户刷新首页。刷新开启了新的 generation，旧第 3 页结果应被忽略，否则会污染新列表。单纯清空 items 不能阻止稍后返回的旧响应重新追加。','版本检查应覆盖成功、失败和 finally 清理。旧请求的 finally 不能把新请求的 loading 提前关闭；取消请求可以减少浪费，但提交身份检查才确保结果一致性。']),fwTheory('界面与平台入口的责任',['页面的 onReachBottom 针对页面滚动；scroll-view 应使用自己的滚动事件。下拉刷新需要页面配置与对应钩子，并在流程结束后按情况调用 stopPullDownRefresh。网络失败后应保留已有列表并提供明确的重试入口。','本页使用按钮触发同样的状态模型，重点观察数据一致性，不模拟真实手势或系统刷新动画。工程中把按钮入口替换为平台钩子时，数据流程应继续保持相同约束。'])],
html:`<button id="more">加载下一页</button><button id="refresh-list">刷新</button><button id="fail-next">让下次请求失败</button><output id="failure-plan"></output><output id="page-info"></output><ul id="paged-items"></ul>`,
js:`let items=[], page=0, loading=false, finished=false, generation=0;
let failNext=false, error='';
function render(){document.querySelector('#page-info').textContent='已提交页码 '+page+' / '+(loading?'加载中':error|| (finished?'没有更多':'可继续'));document.querySelector('#paged-items').replaceChildren(...items.map(id=>{const li=document.createElement('li');li.textContent=id;return li;}));}
async function load(){
 if(loading||finished)return;
 const ticket=generation,next=page+1,shouldFail=failNext;
 failNext=false;error='';loading=true;render();
 document.querySelector('#failure-plan').textContent='';
 try {
  await new Promise(resolve=>setTimeout(resolve,450));
  if(ticket!==generation){console.log('忽略旧响应',ticket);return;}
  if(shouldFail)throw new Error('模拟失败，可重试');
  const rows=next<=2?['OD-'+(next*2-1),'OD-'+(next*2)]:[];
  items=[...items,...rows];page=next;finished=rows.length<2;
 } catch(cause){if(ticket===generation)error=cause.message;}
 finally {if(ticket===generation){loading=false;render();}}
}
function refresh(){generation++;items=[];page=0;loading=false;finished=false;error='';load();}
document.querySelector('#more').onclick=load;
document.querySelector('#refresh-list').onclick=refresh;
document.querySelector('#fail-next').onclick=()=>{failNext=true;document.querySelector('#failure-plan').textContent='下一次新请求将失败';};render();`,
walkthrough:[walk('防止重复触发','js','if(loading||finished)','同一加载中的点击不再开启第二次追加。'),walk('捕获结果集版本','js','const ticket=generation','请求属于某一轮刷新结果集。'),walk('刷新后拒绝旧结果','js','if(ticket!==generation)','过期请求既不追加列表，也不清理新请求的状态。')],
prerequisites:['race','uni-request'],pitfall:'本例通过“少于每页数量”判断末页，因此满页后还需一次空页探测；真实接口可用 hasMore/total 明确结束条件。',extension:'让第 2 页加载期间发生刷新，确认旧响应既不追加也不关闭新请求的 loading；用日志解释版本检查。',steps:['先点让下次请求失败，再加载，观察页码仍是 0。','重试成功后再加载第二页，确认没有漏页或重复条目。','快速重复触发和加载中刷新，观察旧请求不能污染结果；第三页为空后显示没有更多。'],task:'加载前两页，列表含 OD-1 到 OD-4 且不重复。',check:`return [...document.querySelectorAll('#paged-items li')].map(n=>n.textContent).join(',')==='OD-1,OD-2,OD-3,OD-4'`,hint:'加载一页，等完成，再加载下一页。',quiz:quiz('刷新后旧分页请求返回，应如何处理？',['直接追加新列表','校验结果集版本，忽略旧响应'],1,'刷新改变了结果集，旧请求不再有权提交结果。'),files:[fwFile('composables/useOrders.js','真实 Vue 3 数据逻辑；依赖上一课 request 封装，协议为 {code:"OK",data:{items,hasMore}}。',`import { ref, onScopeDispose } from 'vue';
import { request } from '../services/request.js';
export function useOrders() {
  const items=ref([]), page=ref(0), phase=ref('idle');
  const finished=ref(false), error=ref('');
  let generation=0;
  const pending=new Set();
  async function loadMore() {
    if (phase.value==='loading' || finished.value) return;
    const ticket=generation, next=page.value+1;
    phase.value='loading'; error.value='';
    const task=request({url:'https://api.example.com/api/orders',
      data:{page:next,pageSize:10}}); // 替换为实际合法域名
    pending.add(task);
    try {
      const response=await task.promise;
      if(ticket!==generation) return;
      const data=response.data;
      if(!Array.isArray(data?.items) || typeof data.hasMore!=='boolean')
        throw new Error('分页协议不符合约定');
      items.value=[...items.value,...data.items];
      page.value=next; finished.value=!data.hasMore;
      phase.value='success';
    } catch(cause) {
      if(ticket===generation){phase.value='error';error.value='加载失败，请重试';}
    } finally { pending.delete(task); }
  }
  function cancelPending(){ for(const task of pending) task.abort(); }
  async function refresh() {
    generation++; cancelPending(); items.value=[];
    page.value=0; phase.value='idle'; finished.value=false;
    await loadMore();
  }
  onScopeDispose(()=>{generation++;cancelPending();});
  return {items,page,phase,error,finished,loadMore,refresh};
}`),fwFile('pages/orders/index.vue','平台触发器接入片段，loadMore/refresh 来自独立数据逻辑。',`<script setup>
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useOrders } from '../../composables/useOrders.js';
const { loadMore, refresh } = useOrders();
onReachBottom(loadMore);
onPullDownRefresh(async () => {
  try { await refresh(); }
  finally { uni.stopPullDownRefresh(); }
});
</script>`)],refs:[ref('uni-app：页面滚动与刷新钩子','https://uniapp.dcloud.net.cn/tutorial/page.html'),ref('uni-app：下拉刷新','https://uniapp.dcloud.net.cn/api/ui/pulldown.html')]});

uniLesson({id:'uni-layout',title:'rpx、条件编译与平台适配层',summary:'把尺寸适配与能力差异分开，避免到处堆平台判断。',time:55,
principles:[['rpx 是尺寸换算机制','按常见 750rpx 基准理解适配，再结合平台、宽屏和实际布局约束验证。'],['条件编译发生在构建期','特殊注释由工具处理，不是普通 JavaScript if，也不是用户切换后即时改变的运行时代码。'],['差异集中在适配层','业务只调用稳定能力接口，平台实现处理 API 与返回值差异。']],
theory:[fwTheory('尺寸适配不是把所有 px 换成 rpx',['rpx 帮助基于设计宽度做比例换算，但超宽屏、文本大小、可点击范围和安全区域仍需要布局设计。固定比例不保证长文本、键盘弹起、横屏或平板场景都好用。组件应有合理的最大宽度、换行和溢出策略。','本页滑块按 px = rpx × 视口宽度 / 750 展示基础换算模型，不覆盖实际框架的宽屏配置、不同渲染器和设备细节。真实样式应在目标端检查，不把模型值当作所有平台测量结果。']),fwTheory('条件编译与运行时能力判断',['// #ifdef MP-WEIXIN 等标记由 uni-app 构建工具处理，非目标代码可以不进入对应产物。把这些注释粘到普通浏览器脚本里，只会成为普通注释，里面的 JavaScript 仍按常规执行。','对于同一目标下的运行环境差异，还要按 API 支持情况进行能力检测和错误处理。编译期平台判断不能代替用户授权状态、设备是否支持某能力等运行期事实。']),fwTheory('建立可替换的能力接口',['例如业务层只调用 scanOrderCode()，微信小程序、App 和 Web 的实现各自处理扫描或手动输入。公共返回结构应统一，错误也要归一化，这样页面不用到处判断平台字段。','依赖适配层可以单独在模型中验证业务逻辑，但不能证明摄像头权限、系统弹窗或原生插件正常。最后仍需用真实设备验证拒绝授权、取消和成功三条路径。'])],
html:`<label>模型视口宽度<input id="screen-width" type="range" min="320" max="750" value="375"></label><output id="rpx-result"></output><label>能力目标<select id="platform"><option value="web">Web：手动输入</option><option value="mp">小程序：扫描能力</option></select></label><button id="capability">查看适配结果</button><output id="cap-result"></output>`,
js:`function measure(){const width=Number(document.querySelector('#screen-width').value);document.querySelector('#rpx-result').textContent='模型：100rpx = '+(100*width/750).toFixed(2)+'px';}
const capabilities={web:()=> '手动输入入口',mp:()=> '扫描能力入口（模型，未调用设备）'};
document.querySelector('#screen-width').oninput=measure;
document.querySelector('#capability').onclick=()=>{const platform=document.querySelector('#platform').value;document.querySelector('#cap-result').textContent=capabilities[platform]();};measure();`,
walkthrough:[walk('比例换算模型','js','100*width/750','改变模型宽度，观察固定 rpx 的 px 变化。'),walk('能力接口映射','js','const capabilities','业务只选择接口，不把所有平台分支散落到页面中。'),walk('调用对应适配器','js','capabilities[platform]()','模型展示入口；实际设备调用属于真实工程验证。')],
prerequisites:['responsive','uni-runtime'],pitfall:'条件编译注释在普通浏览器中没有裁剪能力；rpx 也不能替代布局和真机验证。',extension:'定义 scanOrderCode 的统一返回值和取消错误，把 Web 手动输入作为明确降级方案。',steps:['拖动模型宽度，观察尺寸比例。','选择小程序目标。','查看能力结果并阅读真实条件编译源码。'],task:'选择小程序并查看扫描能力的模型入口。',check:`return document.querySelector('#cap-result').textContent==='扫描能力入口（模型，未调用设备）'`,hint:'选择小程序，再点击查看适配结果。',quiz:quiz('普通浏览器直接执行带 #ifdef 注释的 JS，会自动裁剪平台代码吗？',['会','不会，需要 uni-app 构建工具处理'],1,'条件编译是工具链行为，普通 JS 解析器只把这些标记当注释。'),files:[fwFile('platform/scan.js','真实条件编译片段；公共业务层调用统一接口。',`export function scanOrderCode() {
  // #ifdef MP-WEIXIN
  return new Promise((resolve, reject) => uni.scanCode({
    success: result => resolve(result.result), fail: reject
  }));
  // #endif
  // #ifndef MP-WEIXIN
  return Promise.reject(new Error('此目标请使用手动输入订单号'));
  // #endif
}`)],refs:[ref('uni-app：条件编译','https://uniapp.dcloud.net.cn/tutorial/platform.html'),ref('uni-app：尺寸单位与样式','https://uniapp.dcloud.net.cn/tutorial/syntax-css.html')]});

uniLesson({id:'uni-release',title:'跨端工程验收：从 Web 到真机',summary:'用明确证据划分已验证范围，补齐存储、权限、网络与发行配置。',time:60,
principles:[['每个平台独立验收','Web 预览、开发者工具、真机与发行包分别覆盖不同条件，不能互相替代全部证据。'],['持久化有版本和用户边界','本地草稿要定义 schema、失效与清理，切换用户后不能展示前一用户私有内容。'],['发布需要可追踪版本','记录构建版本、目标平台、关键配置和回退路径，错误报告才能关联到具体产物。']],
theory:[fwTheory('从设计评审开始覆盖跨端状态',['设计稿常只画正常列表，工程师需要补齐空态、加载、失败、重试、长内容、软键盘、安全区域和授权拒绝。把这些状态写成操作与可观察结果，再决定页面、组件和接口边界。','业务逻辑可以共享，但各平台的按钮、导航、系统返回与权限弹窗需要分别验证。课程项目以订单列表和详情为主线，让同一个验收任务在 Web 与小程序上重复执行，记录差异和处理方式。']),fwTheory('存储不是数据库事务',['uni.setStorage 等接口适合有限本地数据，不代表服务端数据永久可信或所有平台容量相同。缓存应携带 schema 版本、归属用户和必要的时间信息；读取失败或格式不符时应有可恢复行为。','把草稿和服务器权威状态分开。退出登录清理用户相关记录，避免下一用户看到前人的内容。敏感凭据和隐私数据还需要符合实际应用的安全设计，不能因为叫“本地存储”就默认安全。']),fwTheory('建立逐端发布证据',['至少记录目标平台、设备/工具版本、代码版本、测试输入、操作、预期与实际结果。开发工具中的网络校验开关、模拟权限和本地代理都会影响结果，应在发行相关环境中重新确认。','本平台提供理论、代码模型和工程起点，不声称已经在你的微信账号、App 签名或真实设备上完成发布。工程源码可以带到 HBuilderX，先运行 Web，再连接目标工具与真机；账号、域名、权限和签名按实际项目配置。'])],
html:`<label>草稿拥有者<input id="owner" value="user-a"></label><button id="read-cache">读取模型缓存</button><output id="cache-owner"></output>`,
js:`const record={schema:1,userId:'user-a',draft:'OD-1 的编辑草稿'};
function readFor(userId){
 if(record.schema!==1)return '缓存格式不兼容';
 // TODO：校验缓存归属用户
 return record.draft;
}
document.querySelector('#read-cache').onclick=()=>{document.querySelector('#cache-owner').textContent=readFor(document.querySelector('#owner').value);};`,
walkthrough:[walk('保存格式与归属','js','schema:1','记录除了内容，还包含结构版本和用户身份。'),walk('读取时校验边界','js','TODO','不是当前用户的记录应忽略或按明确策略清理。'),walk('独立验证跨用户场景','html','id="owner"','切换输入模拟不同用户读取，检查是否泄露前人草稿。')],
prerequisites:['uni-request','uni-layout','release','security'],pitfall:'本地缓存不应跨用户无条件复用；Web 和开发工具通过也不等于真机与发行包已验收。',extension:'打开项目实践的 uni-app 任务，分别填写 Web 与真机证据；未验证的目标保持未勾选。',steps:['user-a 读取模型缓存，可以看到草稿。','修改 readFor，加入归属校验。','将用户改为 user-b，验证不能读到前人草稿。'],task:'校验归属，user-b 读取时显示“没有当前用户草稿”。',check:`return document.querySelector('#cache-owner').textContent==='没有当前用户草稿'`,hint:'if(record.userId!==userId) return "没有当前用户草稿";',quiz:quiz('Web 预览通过后，跨端项目下一步应做什么？',['直接认为所有平台通过','按目标平台验证网络、权限、导航与真机行为'],1,'每种环境只能提供相应验证范围的证据。'),files:[fwFile('services/draftStorage.js','真实 uni-app 存储片段，格式与用户隔离示例。',`const KEY = 'order-draft-v1';
export function saveDraft(userId, draft) {
  uni.setStorageSync(KEY, { schema: 1, userId, draft });
}
export function readDraft(userId) {
  try {
    const value = uni.getStorageSync(KEY);
    return value?.schema === 1 && value.userId === userId ? value.draft : null;
  } catch { return null; }
}`)],refs:[ref('uni-app：Storage','https://uniapp.dcloud.net.cn/api/storage/storage.html'),ref('uni-app：运行与发布','https://uniapp.dcloud.net.cn/tutorial/run/run-app.html')]});
