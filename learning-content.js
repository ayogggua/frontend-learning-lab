'use strict';
window.PROJECTS = [
 {id:'native',title:'项目一 · 原生订单工作台',duration:'建议 3–5 次学习',start:'capstone',requires:['html','layout','state','requests','forms'],brief:'从空白页面做订单管理页，亲自走通需求拆解、页面结构、交互状态和接口边界。可先导出综合课示例作为本地起点，第二轮再从零实现。',deliverable:'交付可运行的 HTML/CSS/JS、三种视口截图、一次失败重试的复现步骤。所有要求在项目页面内验收。',contract:'GET /api/orders?status=pending&page=1&pageSize=10 → {items:[{id:"OD-1",status:"pending",amountCents:9900}],total:23}；GET /api/order?id=OD-1 → 单条详情。先明确这是拟定接口契约，本平台不会连接真实服务。',milestones:[['结构与布局','从设计稿标出页面容器、筛选表单、列表、分页和弹层；用 Grid/Flex 实现桌面与窄屏。'],['状态与数据','先用固定数据跑通，再用本地延迟模拟接口；为 idle/loading/success/empty/error 各画一个状态。'],['验收与重构','把纯过滤计算和 DOM 更新分开，检查竞态、键盘、无数据与错误恢复。']],criteria:['375px 下筛选与主操作可用，整页无意外横向溢出','改变筛选后回第一页；末页下一页禁用','加载、空数据、失败和重试各有可复现路径','快速切换条件后始终显示最后一次查询结果','弹层可用键盘关闭，焦点回到触发按钮','接口字段经过边界校验；用户文本不直接写入 innerHTML'],rubric:'过关标准：请另一位程序员只按你的复现步骤验证这六项，不需要先阅读实现。'},
 {id:'vue-project',title:'项目二 · Vue 工单协作页',duration:'建议 4–6 次学习',start:'components',requires:['vue','components','vue-watch','vue-lifecycle','reducer'],brief:'把工单拆成列表、筛选、详情三个区域。练习 props/emits、组合式逻辑与副作用清理；先做单页面，再在真实 Vue 项目里接路由。',deliverable:'交付组件责任划分、可运行页面、三个异常复现场景。只提升确实共享的状态，先不用全局状态库也可以。',contract:'GET /api/tickets?keyword=timeout&status=open；POST /api/ticket/update，body:{id:"T-1",status:"closed",version:3}。版本冲突时保留用户输入并提示重新获取，不静默覆盖。',milestones:[['组件边界','父组件拥有工单数据，子组件展示 props 并发出事件；以一次关闭工单操作追踪完整数据流。'],['组合式逻辑','把查询过程提为 useTickets，返回结果、阶段状态和刷新方法；清理过期请求。'],['资源与异常','组件卸载停止订阅，编辑失败保留草稿；处理版本冲突和空列表。']],criteria:['子组件不直接修改收到的工单对象','computed 只做派生，watch 的异步工作有清理','查询与编辑分别有 loading/error 状态','组件卸载后不继续更新或输出计时日志','重复挂载不会重复注册全局监听器','关闭失败时恢复正确显示并保留可重试信息'],rubric:'过关标准：你能指出每个状态由谁拥有、每个副作用何时创建和释放。'},
 {id:'react-project',title:'项目三 · React 购物车与草稿',duration:'建议 4–6 次学习',start:'react-keys',requires:['react','react-effects','react-keys','reducer','optimistic'],brief:'用 React 实现可排序购物车，支持数量、备注、删除与恢复。重点验证组件身份、派生金额与异步确认，避免把所有计算放进 Effect。',deliverable:'交付可操作页面、reducer 转移表和至少三个反例：重排、快速提交、服务端拒绝。金额保留整数单位。',contract:'POST /api/cart/update，body:{items:[{id:"SKU-1",quantity:2}],version:8} → {items,totalCents,version:9}。最终金额与库存由服务端确认，客户端计算只供即时反馈。',milestones:[['纯数据模型','先用纯函数计算数量与金额，定义 reducer 的加减、删除、恢复动作。'],['组件身份','使用稳定业务 id 作为 key，重排后输入草稿仍跟随对应商品。'],['外部同步','需要同步时使用 Effect 并声明依赖，模拟确认失败、过期响应和重试。']],criteria:['数量变化后总价正确，未单独保存可推导的重复总价','删除中间项再反转，备注仍属于原商品','Effect 依赖完整且订阅有清理','重复点击不会产生不可解释的状态组合','失败回滚不会抹掉更新的成功状态','无效数量与库存不足有可访问的错误提示'],rubric:'过关标准：可以逐次渲染解释 state 快照，并解释每个 key 和 Effect 的存在理由。'},
 {id:'delivery',title:'项目四 · 一次完整的前端交付',duration:'建议 3–4 次学习',start:'release',requires:['security','performance','quality','lazy-modules','release'],brief:'选择已完成的一个项目，放进真实本地仓库，以需求评审、实现、代码评审、验收、发布演练的顺序交付。本平台记录验收证据，不替你运行构建或部署。',deliverable:'交付可重现的运行方式、生产构建产物、验收证据与回滚步骤；发布到外部环境前由你决定目标和权限。',contract:'与后端确认鉴权过期、分页 total、错误码、幂等性与兼容窗口。URL 参数不包含敏感凭据，示例详情使用 ?id= 形式。',milestones:[['需求与设计评审','补全设计稿没有画出的错误、空数据、超长文案与窄屏；约定接口和验收范围。'],['构建与代码评审','本地完成生产构建，审查依赖、资源路径、状态归属、输入校验与敏感数据。'],['发布演练','在预览环境检查刷新、深链接、缓存和错误上报，再按步骤演练回滚。']],criteria:['从新目录按提供的步骤能重现安装、构建与预览','直接打开嵌套路由并刷新，资源和内容都正常','发布物不含服务端密钥或敏感日志','性能记录有设备、数据量、测量指标与前后对比','验收覆盖窄屏、键盘、错误、空态与重复提交','写明版本识别、旧客户端兼容与可执行回滚步骤'],rubric:'过关标准：别人能独立复现你的交付，并知道出问题时如何定位和退回。'}
];
window.GLOSSARY = [
 ['DOM','浏览器中的文档对象树。JavaScript 修改的是节点与属性，浏览器据此更新画面。','entry'],
 ['HTML 入口','浏览器首先获取文档，文档通过 link/script 声明其他资源。文件名不必叫 index.html。','entry'],
 ['defer','经典外部脚本可并行下载，文档解析后按顺序执行，并在 DOMContentLoaded 前完成。','loading'],
 ['盒模型','内容、内边距、边框与外边距共同影响元素占用空间；box-sizing 改变 width 的含义。','box'],
 ['层叠与优先级','多个样式规则共同决定最终声明，来源、层、重要性与选择器权重等参与比较。','cascade'],
 ['Flex / Grid','Flex 主要分配一条主轴的空间，Grid 以行列轨道组织二维布局。','layout'],
 ['响应式','根据可用空间和内容约束调整布局，保证关键任务在不同视口仍能完成。','responsive'],
 ['设计令牌','将颜色、间距、字号等设计决策命名并复用，减少随意的局部数值。','design'],
 ['状态 / 渲染','状态保存页面业务事实，渲染把当前状态映射为可见界面。','state'],
 ['闭包','函数能继续访问定义时的词法环境；复制函数引用不会创建独立环境。','closures'],
 ['事件委托','祖先监听冒泡事件，根据目标定位业务动作，适合动态子项。','events-deep'],
 ['微任务','Promise 回调等进入微任务队列，通常在当前任务结束后、下一任务前处理。','async'],
 ['竞态','多个异步操作完成顺序不同，若无提交资格判断会造成过期数据覆盖新意图。','race'],
 ['幂等性','同一业务操作重复请求不造成额外不期望的效果；前端禁用按钮不能替代后端保证。','optimistic'],
 ['状态机 / reducer','明确允许的状态转移，reducer 根据状态与动作纯计算下一状态。','reducer'],
 ['HTTP 缓存 / ETag / 304','ETag 是内容验证器，条件请求得到 304 后可以复用已保存正文。','cache'],
 ['computed / watch','computed 计算响应式派生值，watch 观察来源并执行副作用。','vue-watch'],
 ['composable','封装可复用的组合式状态逻辑，包含资源创建与清理边界。','vue-lifecycle'],
 ['Effect','将 React 组件与外部系统同步，依赖变化时清理旧同步并建立新同步。','react-effects'],
 ['key','帮助框架识别同级子项身份；稳定业务 id 可使重排后局部状态跟随实体。','react-keys'],
 ['类型边界','外部数据进入应用时需要运行时验证，静态类型声明不会自动验证 HTTP JSON。','types'],
 ['模块','通过 import/export 表达文件间依赖；动态 import 返回模块加载的 Promise。','lazy-modules'],
 ['XSS','把不受信任内容当作可执行标记或脚本可能导致注入；普通文本优先使用 textContent。','security'],
 ['CORS','浏览器约束跨源响应的读取，不是认证机制，也不防止所有请求发出。','security'],
 ['Web Worker','独立执行环境，用消息与主线程通信，没有页面 DOM。','worker'],
 ['CSR / SSR / SSG','分别侧重客户端渲染、请求时服务端渲染、构建时静态生成，可以按页面混用。','hydration'],
 ['hydration','客户端框架复用已有服务端标记并连接组件与交互，首轮结构和数据应一致。','hydration'],
 ['国际化 / 时区','原始业务值与展示文本分离；同一时刻在不同时区可以是不同日历日期。','intl'],
 ['可访问性','语义、标签、焦点、键盘与反馈帮助不同能力和输入方式的用户完成任务。','accessibility'],
 ['生产构建','源代码经过工具处理成为发布资源，需要验证资源路径、路由、配置与缓存。','release']
];
// 为最基础的入口课补充具体执行链，进阶课也采用同一跟读交互。
const coreWalkthroughs = {
 entry:[walk('HTML 创建节点','html','id="count"','浏览器把 output 标签解析成一个 DOM 节点。它的初始文本是 0。'),walk('CSS 匹配同一节点','css','#count','选择器匹配节点，只改变字号与颜色，不负责保存业务数值。'),walk('JS 获取引用并注册','js','addEventListener','初始化只登记回调，此时 count 仍是 0。'),walk('点击改变内存','js','count +=','浏览器分发 click，回调把内存变量加一。仅此一步还没有更新页面文本。'),walk('把新值提交到 DOM','js','textContent','将 count 写入 output；浏览器再计算需要更新的显示。')],
 state:[walk('从页面结构开始','html','<','先识别输入、提交按钮和列表容器。用户动作从这些 DOM 节点产生。'),walk('定位事件入口','js','onsubmit','提交处理器阻止默认导航，读取用户输入并修改状态。'),walk('跟踪状态到渲染','js','render','沿 render 的调用观察列表如何从状态重建。'),walk('观察委托边界','js','onclick','新增节点之后，父级上的委托仍然有效。')]
};
window.COURSE.forEach(l=>{if(coreWalkthroughs[l.id])l.walkthrough=coreWalkthroughs[l.id];});
