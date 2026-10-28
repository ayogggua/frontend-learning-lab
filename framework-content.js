(()=>{
'use strict';
// 专题路由只引用稳定课程 id；调整顺序不影响已有笔记和完成记录。
for(const lesson of window.COURSE){
  if(lesson.track==='vue')lesson.group='十一 · Vue 应用开发';
  if(lesson.track==='react')lesson.group='十二 · React 应用开发';
  if(lesson.track==='uniapp')lesson.group='十三 · uni-app 跨端开发';
}
const flutterIndex=window.COURSE.findIndex(l=>l.id==='flutter');
if(flutterIndex>=0){const [flutter]=window.COURSE.splice(flutterIndex,1);flutter.group='十四 · Flutter 拓展';window.COURSE.push(flutter);}
window.FRAMEWORK_TRACKS=[
 {id:'vue',title:'Vue',subtitle:'从响应式到应用组织',intro:'先弄清依赖追踪与组件契约，再管理页面导航、共享状态和缓存生命周期。先在浏览器运行，随后对照 .vue 工程文件。',outcome:'能够解释一项工单操作从事件、状态到 DOM 的全过程，并决定状态放在组件、composable 还是 store。',phases:[['建立组件模型',['vue','components','vue-reactivity','vue-sfc']],['处理副作用与契约',['vue-watch','vue-lifecycle','vue-contracts']],['组织一个应用',['vue-router','vue-pinia','vue-keepalive']]],project:'vue-project'},
 {id:'react',title:'React',subtitle:'从渲染快照到状态架构',intro:'把每次渲染看成状态快照，用纯计算生成界面。分别处理组件身份、外部同步、共享状态与加载边界。',outcome:'能够判断一个值该放 state、ref 还是直接计算，能定位过期闭包、错误依赖与不稳定 key。',phases:[['理解渲染与身份',['react','react-render','react-keys']],['处理输入与外部同步',['react-effects','react-refs','react-forms']],['组织状态与性能边界',['reducer','react-context','react-memo','react-suspense']]],project:'react-project'},
 {id:'uniapp',title:'uni-app',subtitle:'从 Vue 到多端运行环境',intro:'以经典 uni-app 的 Vue 3 / JavaScript / .vue 路线为范围。先理解编译目标和页面容器，再处理跨端导航、请求和设备能力。',outcome:'能够读懂 pages.json、页面生命周期与 uni API，写出带失败恢复的分页列表，并为每个目标端安排实际验收。',phases:[['准备 Vue 基础',['vue','components','vue-sfc','vue-lifecycle']],['建立跨端页面模型',['uni-runtime','uni-pages','uni-lifecycle','uni-navigation']],['完成数据与交付闭环',['uni-request','uni-pagination','uni-layout','uni-release']]],project:'uni-project'}
];
window.PROJECTS.push({id:'uni-project',title:'项目五 · uni-app 跨端订单列表',duration:'建议 6–8 次学习',start:'uni-runtime',requires:['vue-sfc','uni-pages','uni-lifecycle','uni-request','uni-pagination'],brief:'用 Vue 3 版 uni-app 创建订单列表与详情页，先完成一个目标端，再扩展到第二个。课程中的原生网页模型帮助理解状态与导航；完整项目需要使用真实 uni-app 工具链构建并在目标环境运行。',deliverable:'交付真实 uni-app 工程、pages.json、列表与详情页、分页请求封装，以及 Web 和选定小程序或 App 的验收证据。浏览器模型通过不等于跨端验收通过。',contract:'GET /api/orders?page=1&pageSize=10&status=pending → {code:"OK",data:{items:[{id:"OD-1",amountCents:9900}],hasMore:true}}；GET /api/order?id=OD-1 → {code:"OK",data:{...}}。区分网络失败、HTTP 失败、业务失败与合法空列表。',milestones:[['搭建入口与页面','从工具生成的 Vue 3 工程开始，明确 main.js、App.vue、pages.json 的职责。列表非 tab 页进入详情，返回时保留筛选。'],['分页与生命周期','把首屏、刷新、加载更多分开；失败不跳页、重复触底不并发追加，刷新后旧响应不能污染新列表。'],['跨端能力与验收','使用能力适配层包裹平台差异；校验请求域名、授权拒绝、真机尺寸、离线恢复与缓存隔离。']],criteria:['在真实目标端启动后，首页与 pages.json 的配置一致','列表到详情再返回时筛选与滚动符合需求','HTTP 500 不显示成加载成功，业务错误保留明确提示','连续触底不会请求同一页两次，失败重试不跳页','刷新期间旧请求完成不会追加到新列表','空列表、加载中、加载失败、没有更多分别可复现','使用另一个账号时不会显示上一账号的草稿','至少两个目标环境有记录；设备、版本、步骤和结果完整'],rubric:'过关标准：给出目标环境的可复现证据，不能用 Web 演示替代小程序或 App 的权限与生命周期检查。'});
const vueProject=window.PROJECTS.find(p=>p.id==='vue-project');
vueProject.requires.push('vue-contracts','vue-router','vue-pinia');
vueProject.brief+=' 进阶阶段用 Router 管理列表与详情，用 Pinia 保存跨页筛选；不要把局部输入全部移到 store。';
const reactProject=window.PROJECTS.find(p=>p.id==='react-project');
reactProject.requires.push('react-render','react-context');
reactProject.brief+=' 用 reducer + Context 明确状态与分发边界，先正确实现，再用测量决定是否引入 memo。';
window.GLOSSARY.push(
 ['SFC / 单文件组件','Vue 的 .vue 源文件格式，由工具把模板、脚本和样式转换后交给浏览器；不是浏览器原生文件类型。','vue-sfc'],
 ['响应式依赖追踪','在副作用执行期间记录它读取的响应式值；值改变后调度相关使用者更新。','vue-reactivity'],
 ['toRef / toRefs','把响应式对象属性暴露为保持连接的 ref，解决基本值解构后不再跟随的问题。','vue-reactivity'],
 ['v-model / 组件双向绑定','约定一个输入 prop 与一个更新事件；父组件仍拥有值，子组件通过事件请求更新。','vue-contracts'],
 ['Pinia / store','为跨组件或跨页面共享状态提供明确组织边界，包含 state、getters、actions；不会自动替你划分服务端缓存。','vue-pinia'],
 ['KeepAlive','保留动态组件实例以恢复局部状态，须区分激活、停用和最终卸载。','vue-keepalive'],
 ['Render / Commit','React 的渲染计算描述界面，提交阶段实际应用到 DOM；渲染计算不能随意产生外部副作用。','react-render'],
 ['useRef','在渲染之间保存可变容器，修改 current 不触发渲染；适合 DOM 引用与计时器句柄等。','react-refs'],
 ['受控输入','输入显示值来自组件状态，事件更新状态；空字符串、数字解析和业务校验应分别处理。','react-forms'],
 ['Context','向组件树下方提供值的通道；状态仍需由 state/reducer 等拥有，不是独立的全局数据库。','react-context'],
 ['useMemo','缓存一次计算的结果以减少重复计算，依赖必须完整，业务正确性不能依赖缓存永远存在。','react-memo'],
 ['Suspense','为支持挂起的子树显示等待界面；普通 Effect 中的 fetch 不会因此自动触发。','react-suspense'],
 ['Error Boundary / 错误边界','为子树渲染等错误显示恢复界面；不是任意事件处理器或异步回调的通用 try/catch。','react-suspense'],
 ['pages.json','经典 uni-app 的页面与窗口等配置；页面须注册，首项通常决定应用启动页。','uni-pages'],
 ['onLoad / onShow','uni-app 页面加载与显示的不同生命周期；返回页面可以再次 onShow，却不必再次 onLoad。','uni-lifecycle'],
 ['页面栈','页面容器维护的导航层级；前进、替换、返回、切换 tab 的栈操作不同。','uni-navigation'],
 ['RequestTask','uni.request 在相应调用方式下返回的请求任务，可用于取消；响应结果仍须检查 HTTP 和业务状态。','uni-request'],
 ['rpx','以 750 设计宽度为基准的响应式单位；视口、最大宽度、可读性与安全区仍需实际验证。','uni-layout'],
 ['条件编译','根据编译目标保留对应代码或配置；与运行时 if 判断能力是不同阶段。','uni-layout'],
 ['uni-app x / UTS','与本专题经典 uni-app 路线不同的工程与语言选择；不能把 .uvue / UTS 的约束直接套到 .vue / JavaScript。','uni-runtime']
);

})();
