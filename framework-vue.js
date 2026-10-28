'use strict';
// 框架课沿用同一运行器；理论与工程片段明确分开，稳定 id 可长期保存进度。
const fwTheory = (title, paragraphs, code='') => ({title, paragraphs, code});
const fwFile = (path, purpose, code) => ({path,purpose,code});
function fwLesson(spec) {
  const lesson={css:commonCSS+'\nlabel { display:block; margin:12px 0; } ul { padding-left:22px; } button { margin:4px; } pre { white-space:pre-wrap; overflow-wrap:anywhere; }',...spec};
  lesson.notes ||= lesson.walkthrough.map(s=>note(s.file,s.match,s.text));
  lesson.concepts=lesson.principles.map(p=>guide(...p));
  lesson.depth=deeper(lesson.prerequisites,lesson.pitfall,lesson.extension);
  addLesson(lesson);
}
fwLesson({id:'vue-reactivity',track:'vue',engine:'vue',group:'十二 · Vue 应用开发',title:'Vue 响应式：引用与依赖追踪',summary:'从一次 getter 到组件更新，解释为什么解构后页面不再变化。',time:50,
principles:[['对象代理与值容器','reactive 返回对象代理；ref 用 .value 包装值。模板和 JavaScript 中的解包规则不同，需要区分使用场景。'],['读取建立依赖','在响应式副作用执行期间读取的属性会被跟踪；写入触发相关副作用重新执行。普通 JavaScript 变量没有自动绑定。'],['组件更新有调度','状态值会立即改变，DOM 更新通常合并进调度队列。nextTick 等待本轮 DOM 更新，不能等待任意网络请求。']],
theory:[fwTheory('从后端对象引用到前端依赖图',['把 reactive({quantity:1}) 看成原对象外的一层代理。模板渲染读取 state.quantity 时，Vue 知道“当前组件依赖这个对象的 quantity”。之后写入该属性，Vue 才知道需要重新调度哪些使用者。这个描述是机制模型，不代表应用应直接操作框架内部依赖集合。','依赖跟踪与值复制是两件事。const {quantity}=state 会执行一次读取并取出数字；此后的局部 quantity 不会自动重新读取代理。如果属性值本身是响应式对象，解构仍可能保留该对象引用，因此不能把“所有解构都失去响应式”当成绝对规则。'],`const state = reactive({ quantity: 1 });
const { quantity } = state; // 普通数字
const linked = toRef(state, 'quantity'); // 连接该属性的 ref
state.quantity++;
console.log(quantity, linked.value); // 1, 2`),fwTheory('ref、reactive 与状态边界',['ref 既可以持有基本值，也可以持有对象；普通 ref 会对对象值进行相应响应式处理。reactive 适合把相关字段组织为对象，但把变量重新指向另一个对象会改变引用关系，已有使用者不一定跟随新的绑定。大型只读数据可考虑 shallowRef，并通过替换 .value 触发更新。','对外返回 composable 状态时，常返回一组 ref，便于调用者解构。返回整个 reactive 对象也可以，但使用者应知道如何保持属性连接。选择方式应以公共接口清晰为先，不必把所有数据都包装成响应式对象。']),fwTheory('事件、状态提交与 DOM 更新的先后',['点击处理器中连续 state.quantity++ 两次，JavaScript 内存已经加二；Vue 通常将相关 DOM 更新批处理，避免每次赋值都立即重建视图。需要读取更新后的节点尺寸时，先修改状态，再 await nextTick()。','nextTick 不是“所有异步完成”。如果随后还要等请求、图片加载或动画结束，必须等待相应事件或 Promise。先区分你等待的是状态提交、DOM 更新还是外部资源，调试才能有明确边界。'])],
html:`<div id="app"><button id="plus" @click="state.quantity++">增加数量</button><p>代理中的值：{{state.quantity}}</p><output id="linked">解构后的值：{{quantity}}</output></div>`,
js:`const {createApp, reactive, toRefs} = Vue;
createApp({setup() {
  const state = reactive({quantity:1});
  const {quantity} = state; // 修复这行，保留属性连接
  return {state, quantity};
}}).mount('#app');`,
walkthrough:[walk('模板读取代理属性','html','state.quantity','模板与 state.quantity 建立响应式联系。'),walk('解构只读取一次','js','const {quantity}','这里得到普通数字，之后 state 改变不会改变这个数字。'),walk('用 ref 保持连接','js','toRefs','改用 toRefs(state)，返回的 ref 在模板里自动解包。')],
prerequisites:['vue','closures'],pitfall:'不要把 reactive 解构得到的基本值当作持续绑定；模板自动解包也不代表所有 JavaScript 位置都省略 .value。',extension:'增加 priceCents，使用 computed 计算总价；不要用 watch 把总价复制到另一份状态。',
steps:['先点击增加，比较两行数值。','将解构来源改成 toRefs(state)。','重新运行并点击两次，解释两行为什么一致。'],task:'修复解构，点击两次后“解构后的值”应为 3。',check:`return document.querySelector('#linked').textContent==='解构后的值：3'`,hint:'const {quantity} = toRefs(state);',quiz:quiz('const {quantity}=reactive({quantity:1}) 中 quantity 是什么？',['持续连接代理的 ref','取出的一次普通数字值'],1,'对基本值的解构不保留代理属性访问。toRef/toRefs 可以显式保留连接。'),
files:[fwFile('src/composables/useQuantity.js','在真实 Vue 项目中导入；这是 composable 片段。',`import { ref, computed } from 'vue';
export function useQuantity(priceCents) {
  const quantity = ref(1);
  const totalCents = computed(() => quantity.value * priceCents);
  function increase() { quantity.value++; }
  return { quantity, totalCents, increase };
}`)],refs:[ref('Vue：响应式基础','https://vuejs.org/guide/essentials/reactivity-fundamentals.html'),ref('Vue：深入响应式','https://vuejs.org/guide/extras/reactivity-in-depth.html')]});

fwLesson({id:'vue-sfc',track:'vue',engine:'vue',group:'十二 · Vue 应用开发',title:'Vue SFC：从 .vue 到浏览器执行',summary:'弄清 index.html、main.js、App.vue 与编译器各自的职责。',time:45,
principles:[['HTML 是 Web 文档入口','Vite 开发服务器读取 HTML 中的 module 脚本；main.js 创建应用，App.vue 描述根组件。'],['SFC 是源文件格式','template、script setup、style 由工具处理。浏览器不能把原始 .vue 文件当普通 JavaScript 执行。'],['编译宏与运行时不同','defineProps 等宏由 SFC 编译器处理；它们不是运行时随处可调用的通用函数。']],
theory:[fwTheory('从 URL 进入组件树',['访问本地开发地址后，浏览器先获取 index.html，再按 script type="module" 读取入口模块。入口导入 Vue 和 App.vue，执行 createApp(App).mount("#app")，把根组件挂载到指定 DOM 容器。main.js 是应用初始化入口，HTML 是浏览器文档入口，两者所处层次不同。','开发期间 Vite 负责按需转换源模块，生产构建生成发布资源；.vue 导入由 Vue 插件处理。不要把开发服务器的转换能力误认为浏览器原生认识 SFC。发布后要检查生成资源的路径和实际服务方式。'],`index.html → /src/main.js → App.vue → 子组件
                          ↓
                  createApp(App).mount('#app')`),fwTheory('script setup 的执行范围',['script setup 中的顶层声明可直接用于模板，相关 setup 逻辑会为每个组件实例运行。与之相对，普通模块顶层代码属于模块求值范围：多实例可能共享同一个模块变量。把编辑草稿放错范围，会导致两个表单互相影响。','defineProps、defineEmits 等宏声明组件契约并由编译器处理；不能把它们复制到本页普通 JS 面板就期待运行。本页用普通 setup 选项展示等价的状态行为，源码面板再展示 SFC 写法。']),fwTheory('scoped 样式也有边界',['SFC 的 scoped 通常通过编译生成属性选择器来限制样式匹配，它不是 Shadow DOM。子组件根节点、继承、全局样式和 :deep 等规则仍需结合具体结构理解。组件需要稳定的样式接口，不能只依赖标签层级把规则写得越来越深。','开发工作通常按组件职责分文件，而不是简单把整页 HTML/CSS/JS 各塞进一个巨大文件。优先形成数据、事件与样式边界，再决定是否提取共享组件。'])],
html:`<div id="app"><quantity-box></quantity-box><quantity-box></quantity-box></div>`,
js:`const {createApp, ref} = Vue;
const shared = ref(0);
const QuantityBox = {
  setup() {
    const count = shared; // 改为每个实例独立创建
    return {count};
  },
  template:'<button class="quantity" @click="count++">{{count}}</button>'
};
createApp({components:{QuantityBox}}).mount('#app');`,
walkthrough:[walk('模块顶层只创建一份','js','const shared','两个组件现在引用同一个 ref。'),walk('setup 属于实例','js','const count','把 ref(0) 放进 setup，每个实例各自创建状态。'),walk('注册与挂载','js','components:{QuantityBox}','根应用注册组件，模板创建两个实例。')],
prerequisites:['vue','modules'],pitfall:'不要把共享模块变量和每个组件实例的状态混在一起；本页执行普通 setup，不直接编译 .vue。',extension:'导出两个计数器的职责说明，再把 QuantityBox 拆到单独 SFC；验证两个实例保持独立。',
steps:['点击第一个按钮，观察两个都变。','在 setup 里独立创建 ref(0)。','重新运行后只点第一个按钮。'],task:'只点击第一个计数器，使两个值分别为 1 和 0。',check:`return [...document.querySelectorAll('.quantity')].map(n=>n.textContent).join(',')==='1,0'`,hint:'const count = ref(0);',quiz:quiz('浏览器能直接执行未经工具处理的 .vue 文件吗？',['可以，和 JS 相同','不可以，需要 SFC 编译处理'],1,'SFC 是开发时的组合文件格式，构建工具将它转成浏览器可执行的模块和样式。'),
files:[fwFile('index.html','真实 Web 文档入口片段。',`<div id="app"></div>
<script type="module" src="/src/main.js"></script>`),fwFile('src/main.js','模块入口初始化根应用。',`import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');`),fwFile('src/App.vue','根组件导入并使用两个独立的计数器。',`<script setup>
import QuantityBox from './components/QuantityBox.vue';
</script>
<template><QuantityBox /><QuantityBox /></template>`),fwFile('src/components/QuantityBox.vue','需要 Vue SFC 编译器；与实验中独立 setup 对照。',`<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>
<template><button @click="count++">{{ count }}</button></template>
<style scoped>button { padding: 8px 16px; }</style>`)],runtime:'真实 Vue 3.5.22 · 普通 setup 对照实验；工程源码中的 SFC 需构建工具编译',refs:[ref('Vue：SFC','https://vuejs.org/guide/scaling-up/sfc.html'),ref('Vue：script setup','https://vuejs.org/api/sfc-script-setup.html')]});

fwLesson({id:'vue-contracts',track:'vue',engine:'vue',group:'十二 · Vue 应用开发',title:'组件契约：v-model、事件与插槽',summary:'把一个金额输入组件拆成数据输入、变化通知和内容扩展。',time:50,
principles:[['父级拥有业务事实','props 是输入，事件表达请求或变化。子组件不要偷偷修改父级对象。'],['v-model 是明确协议','默认 modelValue 输入与 update:modelValue 事件构成双向使用语法，数据所有权仍可在父级。'],['插槽允许调用者决定内容','子组件提供位置和数据，父级决定如何呈现。作用域插槽的 slot props 由子级传出。']],
theory:[fwTheory('组件 API 与后端接口设计相通',['一个可复用组件首先要定义契约：接收哪个值、允许哪些状态、发出什么事件、调用方如何扩展内容。金额输入组件接收数值并通知更新；是否提交到服务器由父级流程决定。这和接口层不直接决定整个业务流程的思路相似。','事件名称要体现意图。update:modelValue 表示受控值更新，submit 表示提交意图，saved 表示持久化已经成功；混用会让调用者误判操作是否完成。验证、禁用和错误消息也应纳入契约。']),fwTheory('把 v-model 展开来看',['父组件的 v-model="amount" 可以理解为 :modelValue="amount" 与 @update:modelValue="amount=$event"。这解释了为什么子组件的本地值变了却不能总是自动改变父组件：它需要遵守通知协议，而不是通过不透明共享引用绕过边界。','Vue 3 的 defineModel 可在 SFC 中简化这个协议，但没有消除状态归属问题。需要编辑后确认再提交时，可以使用本地草稿并在确认事件时同步；如果实时受控，则每次输入都通知父级。'],`<AmountInput :modelValue="amount"
  @update:modelValue="amount = $event" />`),fwTheory('插槽处理结构复用',['普通 props 更适合传数据；插槽更适合让调用方提供一段 UI。例如订单面板固定边框、标题和按钮区，但每个页面提供不同操作。作用域插槽可以向调用方暴露当前行数据，让调用方使用它来构建单元格。','父级提供的插槽内容通常在父级作用域中求值，不能直接随意访问子组件私有变量。需要的数据应作为 slot props 明确提供，这能避免隐藏耦合。'])],
html:`<div id="app"><amount-input v-model="amount"><template #hint="{value}">当前父级值：{{value}}</template></amount-input><output id="amount">{{amount}}</output></div>`,
js:`const {createApp, ref} = Vue;
const AmountInput = {
  props:['modelValue'], emits:['update:modelValue'],
  template:'<label>金额（元）<input id="amount-input" type="number" :value="modelValue" @input="$emit(\\'update:modelValue\\', Number($event.target.value))"></label><slot name="hint" :value="modelValue"></slot>'
};
createApp({components:{AmountInput},setup(){return {amount:ref(10)}}}).mount('#app');`,
walkthrough:[walk('父级绑定状态','html','v-model','amount 属于父级，并作为 modelValue 传入。'),walk('子级发出变化','js','@input','输入事件把 DOM 字符串转成数字并发给父级。'),walk('插槽获取公开数据','html','#hint','value 来自子组件公开的 slot props。')],
prerequisites:['components','vue-sfc'],pitfall:'双向绑定语法不意味着子组件可以任意修改 props；输入空字符串 Number("") 为 0，真实表单还要定义空值协议。',extension:'增加 disabled、error 与 null 表示未填写的协议，用文字解释何时应该显示错误。',
steps:['把金额输入改为 25。','观察插槽提示和父级 output 同步。','在源码中把事件名改错，观察父级停止更新，再恢复。'],task:'通过子组件输入把父级金额更新为 25。',check:`return document.querySelector('#amount').textContent==='25'`,hint:'在预览金额输入框填写 25。',quiz:quiz('自定义组件的默认 v-model 通常展开成什么？',['子组件直接修改父级任意变量','modelValue prop 与 update:modelValue 事件'],1,'明确的数据输入与更新通知构成协议，便于跟踪状态所有权。'),files:[fwFile('src/components/AmountInput.vue','SFC 组件契约片段，需编译。',`<script setup>
defineProps({ modelValue: Number });
const emit = defineEmits(['update:modelValue']);
function update(event) { emit('update:modelValue', Number(event.target.value)); }
</script>
<template>
  <input type="number" :value="modelValue" @input="update" />
  <slot name="hint" :value="modelValue" />
</template>`)],refs:[ref('Vue：组件 v-model','https://vuejs.org/guide/components/v-model.html'),ref('Vue：插槽','https://vuejs.org/guide/components/slots.html')]});

fwLesson({id:'vue-router',track:'vue',engine:'vue',libraries:['vendor/vue-router-4.5.1.js'],group:'十二 · Vue 应用开发',title:'Vue Router：路由、查询参数与守卫',summary:'真实运行 Vue Router，追踪路由对象如何驱动详情页面。',time:55,
principles:[['路由也是应用状态','当前路径、查询条件和参数决定显示什么。可分享或需要刷新恢复的条件通常适合放入 URL。'],['守卫约束导航','beforeEach 可以允许、取消或重定向导航；用户权限仍必须由服务端验证。'],['历史模式与部署有关','Web history 需要服务端处理深链接回退，hash history 和 memory history 有不同使用范围。']],
theory:[fwTheory('路由解析到组件渲染的链路',['点击 RouterLink 或调用 router.push 后，路由器解析目标、运行相关守卫并提交新路由。RouterView 根据匹配结果渲染组件，组件通过 useRoute 读取查询参数。它是有状态的导航系统，不是简单对 DOM 做显示隐藏。','本实验在不透明源 iframe 中使用 createMemoryHistory，避免改变学习平台自身 URL；调用 push 后观察 route.fullPath。真实 Web 项目常用 createWebHistory 或 createWebHashHistory。内存模式不自动与地址栏同步，也不代表可直接用于通常的浏览器深链接。']),fwTheory('URL 与瞬时状态的分工',['页码、筛选条件和详情 id 可以进入 URL，以便刷新、分享和前进后退。正在输入但尚未提交的草稿、临时展开状态与浮层焦点通常保持在组件内。不要把 token、密码或大块个人数据塞进查询参数。','本课详情使用 /detail?id=OD-2。useRoute 返回响应式路由对象，在 computed 中读 query.id 可随导航更新；不要在 setup 中只复制一次值然后期待后续自动变化。']),fwTheory('守卫不是安全边界',['登录守卫改善用户体验：未登录时重定向登录页，登录后再返回目标。但用户可以修改客户端代码或直接请求 API，因此服务端必须独立做认证与授权。导航守卫和接口权限检查的职责不能混淆。','多层嵌套路由还需要明确父布局和子页面的责任。处理导航失败、未知路径与错误页，生产环境检查直接打开深链接并刷新是否正常。不要只测试从首页点击进入。'])],
html:`<div id="app"><button id="open-detail" @click="open">打开 OD-2 详情</button><button @click="home">返回列表</button><p id="route">{{route.fullPath}}</p><router-view></router-view></div>`,
js:`const {createApp, computed} = Vue;
const {createRouter, createMemoryHistory, useRoute, useRouter} = VueRouter;
const Detail = {setup(){const route=useRoute();return {id:computed(()=>route.query.id)};},template:'<output id="order-id">订单 {{id}}</output>'};
const router=createRouter({history:createMemoryHistory(),routes:[
  {path:'/',component:{template:'<p>订单列表</p>'}},
  {path:'/detail',component:Detail}
]});
router.beforeEach(to => { console.log('导航到',to.fullPath); return true; });
const app=createApp({setup(){const route=useRoute();const r=useRouter();return {route,open:()=>r.push({path:'/detail',query:{id:'OD-2'}}),home:()=>r.push('/')};}});
app.use(router);
router.push('/');
router.isReady().then(()=>app.mount('#app'));`,
walkthrough:[walk('选择内存历史','js','createMemoryHistory()','真实路由器在 iframe 内维护自己的历史，不触碰平台地址栏。'),walk('带查询参数导航','js',"query:{id:'OD-2'}",'路由解析并运行守卫，再提交目标。'),walk('派生详情 id','js','computed(()=>route.query.id)','详情从响应式 route 中读取 id。')],
prerequisites:['routing','vue-sfc'],pitfall:'客户端路由守卫不能阻止用户绕过页面直接调用 API；memory history 的路径不会反映到浏览器地址栏。',extension:'增加未登录重定向和未找到订单的状态，再解释登录后恢复目标路径的方式。',
steps:['点击 OD-2 详情，观察路由和详情。','返回列表，再次打开。','把 query.id 改为 OD-3，重新运行确认详情变化。'],task:'通过路由进入 OD-2 详情。',check:`return document.querySelector('#order-id')?.textContent==='订单 OD-2'`,hint:'点击打开 OD-2 详情；本课使用真实 Vue Router。',quiz:quiz('Vue Router 守卫允许进入页面，是否就代表后端授权通过？',['是','不是，后端必须独立验证'],1,'客户端导航与服务端授权是不同层的职责。'),files:[fwFile('src/router.js','真实项目使用 Web history 时要配置服务器深链接回退。',`import { createRouter, createWebHistory } from 'vue-router';
import List from './pages/List.vue';
import Detail from './pages/Detail.vue';
export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: List }, { path: '/detail', component: Detail }]
});`)],runtime:'真实 Vue 3.5.22 + Vue Router 4.5.1 · memory history 隔离实验',refs:[ref('Vue Router：入门','https://router.vuejs.org/guide/'),ref('Vue Router：历史模式','https://router.vuejs.org/guide/essentials/history-mode.html')]});

fwLesson({id:'vue-pinia',track:'vue',engine:'vue',libraries:['vendor/pinia-3.0.3.js'],group:'十二 · Vue 应用开发',title:'Pinia：共享状态与服务端数据边界',summary:'真实运行 Store，用 storeToRefs 保持解构后的响应性。',time:55,
principles:[['共享需要理由','跨组件共享且生命周期清晰的状态适合 Store；输入框临时草稿通常可以保持局部。'],['State、getter、action 分工','state 保存事实，getter 派生结果，action 表达修改与异步业务操作。'],['服务端状态有额外语义','请求缓存还涉及新鲜度、去重、失效和重试，不能仅以“放进全局对象”代替设计。']],
theory:[fwTheory('何时提升状态',['两个相邻组件共享数量时，提升到共同父级可能足够；跨路由共享购物车、登录展示信息时，Store 才更自然。状态应由最小合适范围拥有，集中得越多不代表越可维护。状态的生命周期与清理时机也要明确。','Pinia Store 实例与应用中的 Pinia 容器相关。在普通单页应用中不同组件取得同一 Store 可以共享数据；服务端渲染必须注意按请求隔离，避免把某个用户的数据泄露给下一请求。']),fwTheory('解构 Store 与解构 action 不同',['Store 是响应式对象，直接 const {count}=store 会取出当前值并失去该属性连接。storeToRefs 提取状态和 getter 为 refs，action 则可以按方法调用或直接取出使用。先理解 Vue 依赖规则，再记辅助 API。','action 可以包含异步操作，但要在明确边界处理 busy、error 与请求竞态。不要让多个组件任意同时写相同字段，再寄希望于 Store 自动保证业务一致性。'],`const store = useCartStore();
const { count, totalCents } = storeToRefs(store);
const { add } = store; // action 可直接使用`),fwTheory('全局数据不等于长期缓存',['服务端列表可能随时变化，需要决定什么时候重新获取、何时过期、写操作后哪些查询失效。Pinia 能存放数据，但不会替你自动完成这些策略。对于复杂服务端状态，可评估专门查询工具，先明确问题而非堆叠库。','持久化也需要 schema 版本与用户隔离。退出登录时，清理前用户的私有缓存与展示状态；存储 token 并不意味着它安全，也不能相信客户端的角色字段作为最终权限依据。'])],
html:`<div id="app"><button id="cart-add" @click="store.add">加入购物车</button><p>Store 数量：{{store.count}}</p><output id="cart-count">解构数量：{{count}}</output><p>金额：{{store.totalCents}} 分</p></div>`,
js:`const {createApp} = Vue;
const {createPinia, defineStore, storeToRefs} = Pinia;
const useCart=defineStore('cart',{
  state:()=>({count:0}),
  getters:{totalCents:state=>state.count*2500},
  actions:{add(){this.count++;}}
});
createApp({setup(){
  const store=useCart();
  const {count}=store; // 改为保持响应性的解构
  return {store,count};
}}).use(createPinia()).mount('#app');`,
walkthrough:[walk('注册容器','js','use(createPinia())','应用注册 Pinia，组件 setup 才能找到当前容器。'),walk('Store 定义状态与派生','js','getters:','总金额由 count 派生，不另存一份重复状态。'),walk('解构保持连接','js','const {count}','用 storeToRefs(store) 连接响应式属性。')],
prerequisites:['vue-reactivity','reducer'],pitfall:'把所有本地草稿放入全局 Store 会增加生命周期和清理负担；Store 不自动解决缓存一致性。',extension:'加入 remove 和 reset action，给 count 增加非负约束，再在两个独立组件中读同一 Store。',
steps:['先点加入，观察解构数量不变。','用 storeToRefs 修复。','运行后加入两次，核对数量和金额。'],task:'修复解构，让加入两次后显示“解构数量：2”。',check:`return document.querySelector('#cart-count').textContent==='解构数量：2'`,hint:'const {count}=storeToRefs(store);',quiz:quiz('总金额可以由商品项推导时，优先怎样处理？',['再存一份并到处同步','使用 getter 或 computed 派生'],1,'减少重复状态，就减少不同步的可能。'),files:[fwFile('src/stores/cart.js','真实 Pinia 模块，可与工程示例组合。',`import { defineStore } from 'pinia';
export const useCart = defineStore('cart', {
  state: () => ({ count: 0 }),
  getters: { totalCents: state => state.count * 2500 },
  actions: { add() { this.count++; } }
});`)],runtime:'真实 Vue 3.5.22 + Pinia 3.0.3 · Store 实验',refs:[ref('Pinia：核心概念','https://pinia.vuejs.org/core-concepts/'),ref('Pinia：SSR','https://pinia.vuejs.org/ssr/')]});

fwLesson({id:'vue-keepalive',track:'vue',engine:'vue',group:'十二 · Vue 应用开发',title:'KeepAlive：保留状态与暂停资源',summary:'切换组件时保留输入，并理解停用为什么不等于卸载。',time:45,
principles:[['缓存的是组件实例','KeepAlive 可以保留切换掉的组件实例及其状态，并非自动缓存 HTTP 请求。'],['激活与停用','缓存组件进入或离开显示树时可使用 onActivated/onDeactivated 处理相应资源。'],['缓存也需要预算','长期保留大量页面会占用内存，要按业务设置 max、include/exclude 和清理策略。']],
theory:[fwTheory('销毁、隐藏、停用分别是什么',['v-if 移除普通组件通常导致卸载，下次重建新实例；v-show 改变显示而保留实例；KeepAlive 在动态切换时缓存实例，之后可以重新激活。三者都可能“看不见”，但状态与资源生命周期不同。','假设订单编辑页输入了备注。无缓存切走再回来可能重建而丢失输入；KeepAlive 可保留草稿。但用户退出账户或切换订单实体时，是否应该保留原草稿需要明确业务语义，不能以技术缓存代替决策。']),fwTheory('停用时暂停副作用',['计时器、轮询和可见性相关监听器可能应在停用时暂停，在激活时重新建立。只在 onUnmounted 清理意味着停用期间仍可能继续工作。清理函数应可重复调用，避免多个生命周期路径重复释放时报错。','onActivated 不只是后续返回时触发，也包括进入激活状态的时机。设计启动逻辑时避免同时在 mounted 与 activated 各启动一份轮询。使用幂等 start/stop 可以降低重复注册风险。']),fwTheory('key 与缓存身份',['缓存实例需要可识别身份，组件名和 key 等会影响缓存行为。业务实体改变时，如果复用同一实例，必须响应相关 props 变化；若希望彻底重置，可有意使用业务 id 作为 key。不要为每次渲染生成随机 key。','保留越多页面，内存使用越大。设置 max 可限制缓存数量，但仍要测试用户切换、淘汰后返回、退出登录和数据过期。缓存命中不能证明数据仍然新鲜。'])],
html:`<div id="app"><button id="switch-pane" @click="editing=!editing">切换预览 / 编辑</button><keep-alive><editor-panel v-if="editing"></editor-panel><preview-panel v-else></preview-panel></keep-alive></div>`,
js:`const {createApp, ref, onActivated, onDeactivated} = Vue;
const EditorPanel={name:'EditorPanel',setup(){
  const text=ref('');
  onActivated(()=>console.log('编辑器激活'));
  onDeactivated(()=>console.log('编辑器停用'));
  return {text};
},template:'<label>订单备注<input id="draft-note" v-model="text"></label><output id="kept">{{text}}</output>'};
const PreviewPanel={name:'PreviewPanel',template:'<p>查看其他内容，再返回编辑器</p>'};
createApp({components:{EditorPanel,PreviewPanel},setup(){return {editing:ref(true)}}}).mount('#app');`,
walkthrough:[walk('创建缓存边界','html','keep-alive','动态组件切换时保留编辑器实例。'),walk('局部草稿属于实例','js',"const text=ref('')",'再次激活沿用已有 ref，而不是重新执行 setup 创建空值。'),walk('生命周期日志','js','onDeactivated','离开显示树触发停用；此处可以暂停资源。')],
prerequisites:['vue-lifecycle','vue-sfc'],pitfall:'KeepAlive 不会自动暂停你创建的轮询，也不保证缓存数据仍然新鲜。',extension:'添加计时器，激活时启动、停用时暂停；来回切换验证只有一个计时器。',
steps:['输入备注“保留草稿”。','切到预览，再切回编辑。','对照去掉 KeepAlive 后的行为，最后恢复。'],task:'输入“保留草稿”并往返切换后，备注仍存在。',check:`const el=document.querySelector('#kept');return el?.textContent==='保留草稿'`,hint:'先输入，再点击切换两次；自动检查验证最终文本，切换过程请结合日志观察。',quiz:quiz('KeepAlive 停用组件后会自动停止手工创建的 interval 吗？',['会','不会，应按生命周期显式处理'],1,'缓存保留实例，外部资源需要你按业务暂停与清理。'),files:[fwFile('src/composables/useVisiblePolling.js','组件级轮询示意；需在 setup 同步调用。',`import { onActivated, onDeactivated, onUnmounted } from 'vue';
export function useVisiblePolling(refresh) {
  let timer;
  const stop = () => { clearInterval(timer); timer = undefined; };
  onActivated(() => { stop(); timer = setInterval(refresh, 5000); });
  onDeactivated(stop);
  onUnmounted(stop);
}`)],refs:[ref('Vue：KeepAlive','https://vuejs.org/guide/built-ins/keep-alive.html')]});
