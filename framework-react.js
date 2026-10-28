'use strict';
fwLesson({id:'react-render',track:'react',engine:'react',group:'十三 · React 应用开发',title:'React 渲染：JSX、纯函数与派生值',summary:'从“调用组件函数”走到“提交 DOM”，修复不会更新的派生总价。',time:50,
principles:[['JSX 描述 UI','JSX 是需要转换的语法；它创建 React 元素描述，不是直接拼接 HTML 字符串。'],['render 与 commit 分开','render 计算下一份 UI 描述，commit 才把必要变化落实到 DOM。渲染函数可能被重复调用。'],['派生值直接计算','可以从当前 props/state 得到的值优先在渲染时计算，避免 Effect 同步重复状态。']],
theory:[fwTheory('把组件看作当前输入到 UI 的计算',['函数组件每次执行拿到这一轮 props 与 state，并返回 React 元素。React 再根据树的类型、key 和位置等信息判断如何复用组件以及更新宿主节点。调用组件函数不等于把整个浏览器 DOM 都替换一遍。','JSX 中的大括号插入 JavaScript 表达式，onClick 传入函数，组件标签表示组件类型。本页使用 React.createElement 执行同样的组件逻辑；工程源码面板展示 JSX，并标明需要构建工具转换。'],`// JSX 源码
<button onClick={increase}>{count}</button>
// 对应的元素创建形式
React.createElement('button', { onClick: increase }, count);`),fwTheory('为什么渲染应该保持纯净',['给定相同输入，组件应能计算相同 UI；不要在渲染过程中发写请求、启动订阅或修改外部共享对象。React 的调度可能重新执行或放弃一轮渲染，若渲染本身带业务副作用，就可能重复提交。','用户触发的写操作通常放在事件处理器；与外部系统持续同步的工作才考虑 Effect，并提供清理。开发中的日志可以用于观察，但不要把日志次数直接当作 DOM 提交次数或用户操作次数。']),fwTheory('派生状态为何容易失联',['useState(quantity * unitPrice) 的初值只用于对应状态的初始化，不会在 quantity 每次变化时重新计算为新 state。再加一个 Effect 同步总价虽然能表面修好，但多维护了一份本可直接计算的数据。','金额计算使用有明确单位的业务值，例如整数分。在渲染中 const totalCents=quantity*unitCents 就足够。只有计算确实昂贵且依赖合适时，才评估 useMemo；先保证数据模型正确。'])],
html:`<div id="app"></div>`,js:`const h=React.createElement;
function Cart(){
  const [quantity,setQuantity]=React.useState(1);
  const [totalCents]=React.useState(quantity*2500); // 修复重复派生状态
  return h('section',null,
    h('button',{id:'quantity-add',onClick:()=>setQuantity(n=>n+1)},'数量 +1'),
    h('p',null,'数量：'+quantity),
    h('output',{id:'total'},totalCents+' 分'));
}
ReactDOM.createRoot(document.querySelector('#app')).render(h(Cart));`,
walkthrough:[walk('初始化一次','js','useState(quantity*2500)','后续渲染会忽略这个初始参数，不会用它覆盖已有 state。'),walk('事件安排新渲染','js','setQuantity(n=>n+1)','下一次组件执行读到新的 quantity。'),walk('派生应使用当前输入','js','const [totalCents]','改为 const totalCents=quantity*2500，让每次渲染都计算一致值。')],
prerequisites:['react','javascript'],pitfall:'不要因为派生值不同步就机械地增加 Effect；先判断这份 state 是否根本不需要存在。',extension:'新增折扣比例，计算折后整数分并说明舍入策略；最终成交金额仍由服务端确认。',steps:['点击数量 +1，观察总价仍为 2500。','去掉总价的 useState，改成直接计算。','重新运行后点两次，验证总价 7500。'],task:'修复总价，数量增加到 3 后显示 7500 分。',check:`return document.querySelector('#total').textContent==='7500 分'`,hint:'const totalCents=quantity*2500;',quiz:quiz('单价和数量已在 state 中时，总价优先如何管理？',['渲染时从当前值计算','再创建 state 并用 Effect 同步'],0,'避免重复状态通常让数据关系更清晰，减少同步错误。'),files:[fwFile('index.html','浏览器文档入口，由构建工具处理模块依赖。',`<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>`),fwFile('src/main.jsx','应用入口：创建根，提交根组件描述。需 JSX 构建环境。',`import { createRoot } from 'react-dom/client';
import Cart from './Cart.jsx';
createRoot(document.getElementById('root')).render(<Cart />);`),fwFile('src/Cart.jsx','JSX 工程片段，需 React 构建工具转换。',`import { useState } from 'react';
export default function Cart() {
  const [quantity, setQuantity] = useState(1);
  const totalCents = quantity * 2500;
  return <section>
    <button onClick={() => setQuantity(n => n + 1)}>增加</button>
    <output>{totalCents} 分</output>
  </section>;
}`)],refs:[ref('React：渲染与提交','https://react.dev/learn/render-and-commit'),ref('React：保持组件纯粹','https://react.dev/learn/keeping-components-pure')]});

fwLesson({id:'react-refs',track:'react',engine:'react',group:'十三 · React 应用开发',title:'Hooks 的顺序、ref 与最新值',summary:'区分会触发渲染的 state 与跨渲染保存信息的 ref。',time:50,
principles:[['Hooks 依赖稳定调用顺序','普通 Hooks 应在组件或自定义 Hook 顶层调用，不放在循环、条件或提前返回后的不稳定路径。'],['ref 修改不触发渲染','ref 可保存 DOM 引用、计时器句柄等，不应该代替需要立即显示的状态。'],['闭包属于某次渲染','定时回调可能读取旧快照；应按需求使用函数式更新、正确依赖或有明确边界的 ref。']],
theory:[fwTheory('Hooks 为什么有规则',['React 需要把某次组件执行中的 Hook 调用，与上次执行保存的状态对应起来。普通 useState、useEffect 等的稳定顺序是这个对应关系的基础。若某个条件下少调用一个 Hook，后续调用可能与错误的状态位置对应。','自定义 Hook 复用的是状态逻辑，不是自动共享一份状态。两个组件分别调用 useCounter，通常各自有自己的计数。真正共享需要提升所有权、Context 或外部 Store。本课程固定使用 React 18 教学运行时，不混入其他版本新增 API 的特殊规则。']),fwTheory('state 与 ref 的选择依据',['需要驱动 UI 的值使用 state；修改 setState 会安排新的渲染。ref.current 可以在多次渲染间保存同一个容器里的信息，但修改它不会通知 React 重新计算画面。不要靠修改 ref 后“顺便发生一次其他渲染”才刷新重要 UI。','DOM ref 则用于聚焦、测量等命令式操作。应在事件或适当的生命周期中使用，不要在渲染阶段任意读取或写入 DOM。ref 解决的是逃生通道，不应成为绕过正常数据流的默认方式。']),fwTheory('一个常见但隐蔽的假象',['本实验故意在渲染中读取可变 ref 来暴露反例，生产代码不应依赖这种读取驱动 UI。先只增加 ref，画面不变；再更新 state，组件重新执行，ref 的新值突然显示出来。这会让人误以为 ref 有时响应式、有时不响应式。真正原因是第二个动作触发了重新读取。','调试时把“数据是否变了”与“是否触发了渲染”分别记录。React 的 state 快照、Vue 的代理依赖和普通 JavaScript 变量有不同机制，框架迁移时需要重新建立因果链。'])],
html:`<div id="app"></div>`,js:`const h=React.createElement;
function Demo(){
  const counter=React.useRef(0);
  const [renders,setRenders]=React.useState(0);
  return h('section',null,
    h('button',{id:'ref-add',onClick:()=>{counter.current++;console.log('ref 已变',counter.current);}},'只修改 ref'),
    h('button',{id:'state-render',onClick:()=>setRenders(n=>n+1)},'通过 state 重新渲染'),
    h('output',{id:'ref-value'},'画面读取 ref：'+counter.current),
    h('p',null,'显式触发次数：'+renders));
}
ReactDOM.createRoot(document.querySelector('#app')).render(h(Demo));`,
walkthrough:[walk('ref 容器跨渲染保留','js','useRef(0)','得到稳定容器，current 修改不会自动安排渲染。'),walk('事件只修改内存','js','counter.current++','先看 Console 值变而 DOM 未变。'),walk('state 使组件重新执行','js','setRenders(n=>n+1)','新的渲染顺便读出 ref 当前值。')],
prerequisites:['react-render','closures','react-effects'],pitfall:'不要用 ref 储存必须立即显示的值，再依赖无关更新来“带出”变化。',extension:'实现一个聚焦输入框的按钮：DOM 用 ref，输入文本用 state，解释两者职责。',steps:['只修改 ref 两次，画面仍显示 0。','触发一次 state 渲染，画面显示 2。','重新运行，复述两个动作分别改变了什么。'],task:'修改 ref 两次，再触发 state 渲染，让画面读取到 2。',check:`return document.querySelector('#ref-value').textContent==='画面读取 ref：2'`,hint:'先点“只修改 ref”两次，再点“通过 state 重新渲染”。',quiz:quiz('修改 ref.current 会自动安排组件渲染吗？',['会','不会'],1,'ref 是跨渲染容器，state 更新才是常用的 UI 更新信号。'),files:[fwFile('src/SearchBox.jsx','DOM ref 与受控 state 分工示例。',`import { useRef, useState } from 'react';
export default function SearchBox() {
  const input = useRef(null);
  const [query, setQuery] = useState('');
  return <>
    <input ref={input} value={query} onChange={e => setQuery(e.target.value)} />
    <button onClick={() => input.current?.focus()}>聚焦</button>
  </>;
}`)],refs:[ref('React：引用值','https://react.dev/learn/referencing-values-with-refs'),ref('React：Hooks 规则','https://react.dev/reference/rules/rules-of-hooks')]});

fwLesson({id:'react-forms',track:'react',engine:'react',group:'十三 · React 应用开发',title:'受控表单：草稿、校验与提交',summary:'把输入字符串与有效业务值分开，避免空值被误当成 0。',time:55,
principles:[['受控值来自 state','value 配合 onChange 让 React 状态成为输入的来源；defaultValue 用于非受控初始值。'],['草稿不等于业务数据','用户编辑中可能有空字符串、不完整数字；先保留输入，提交时转换并校验。'],['提交是异步状态机','idle、submitting、success、error 各有明确反馈，重复提交和失败保留要一起设计。']],
theory:[fwTheory('让编辑过程具有合法的中间状态',['用户清空数量框准备输入 12 时，短暂空值是合理编辑过程。如果每次输入都强制 Number(raw)，空字符串变成 0，会把尚未完成的草稿误当成业务值。受控输入常以字符串保存草稿，在边界再解析。','value 的来源应稳定，避免初始 undefined 导致非受控，稍后又变成受控。文本框使用字符串初值，复选框用 checked 与布尔值。后端校验仍然必须存在，前端校验主要提供即时反馈并减少明显无效请求。']),fwTheory('校验规则与提示时机分开',['校验函数回答数据是否有效；何时向用户显示错误是交互策略。可以在 blur 或提交后显示，避免用户刚输入一半就看到强烈错误。错误与输入用 aria-describedby 等关联，提交失败时保留草稿。','纯校验函数适合单独推演边界：空字符串、0、负数、小数、超大值和非数字。把领域约束集中起来，比在多个 onChange 中各写一点判断更容易维护。']),fwTheory('请求锁与服务端幂等共同工作',['本例 busy 阻止同一界面短时间重复提交，并禁用按钮。真实订单创建还需要后端幂等机制，前端按钮禁用无法阻止多标签页或网络重试。失败时恢复可编辑状态，不要清空用户刚填写的内容。','若允许提交期间继续编辑，需要定义响应属于哪份草稿：按提交快照确认，或者将新的编辑标记为未提交。这个问题与后端的版本与事务边界相似，要显式选择语义。'])],
html:`<div id="app"></div>`,js:`const h=React.createElement;
function validate(raw){
  if(raw.trim()==='') return '请填写数量';
  const value=Number(raw);
  return Number.isInteger(value)&&value>=1&&value<=99 ? '' : '数量必须是 1 到 99 的整数';
}
function OrderForm(){
  const [raw,setRaw]=React.useState('');
  const [message,setMessage]=React.useState('尚未提交');
  const [busy,setBusy]=React.useState(false);
  async function submit(event){
    event.preventDefault(); if(busy)return;
    const error=validate(raw);if(error){setMessage(error);return;}
    setBusy(true);setMessage('提交中');
    await new Promise(resolve=>setTimeout(resolve,500)); // 本地模拟
    setMessage('已提交数量：'+Number(raw));setBusy(false);
  }
  return h('form',{onSubmit:submit},h('label',null,'数量 ',h('input',{id:'order-quantity',value:raw,onChange:e=>setRaw(e.target.value),'aria-describedby':'form-message',disabled:busy})),h('button',{id:'submit-order',disabled:busy},'提交'),h('output',{id:'form-message','aria-live':'polite'},message));
}
ReactDOM.createRoot(document.querySelector('#app')).render(h(OrderForm));`,
walkthrough:[walk('草稿保持字符串','js',"useState('')",'空值可以作为编辑状态存在，不提前变成数字 0。'),walk('在提交边界校验','js','const error=validate(raw)','先检查必填，再转换和验证整数范围。'),walk('提交锁控制一次操作','js','setBusy(true)','模拟等待期间禁用输入，确保结果对应提交快照。')],
prerequisites:['forms','react-render','quality'],pitfall:'不要把客户端校验当成安全边界；也不要把未完成的编辑状态强制转换成业务数据。',extension:'增加模拟服务端拒绝，失败时保留输入并允许重试；给错误区域关联 aria-invalid。',steps:['空值直接提交，观察错误。','输入 1.5 后提交，再观察。','输入 3 并提交，等待成功。'],task:'通过表单提交数量 3。',check:`return document.querySelector('#form-message').textContent==='已提交数量：3'`,hint:'数量框填 3，点击提交并等待模拟返回。',quiz:quiz('数量输入的草稿为空时，应该立即当成业务值 0 吗？',['应该','不应，应保留草稿并按规则校验'],1,'编辑状态与有效业务值不同，Number("") 为 0 不能代替必填判断。'),files:[fwFile('src/domain/quantity.js','与 UI 分离的纯领域校验。',`export function parseQuantity(raw) {
  if (raw.trim() === '') return { ok: false, error: '请填写数量' };
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 99)
    return { ok: false, error: '数量必须为 1 到 99 的整数' };
  return { ok: true, value };
}`)],refs:[ref('React：input','https://react.dev/reference/react-dom/components/input'),ref('React：响应输入','https://react.dev/learn/reacting-to-input-with-state')]});

fwLesson({id:'react-context',track:'react',engine:'react',group:'十三 · React 应用开发',title:'Context 与 reducer：共享而不失控',summary:'让分散的操作统一进入状态转移函数，区分传递机制与状态管理。',time:55,
principles:[['Context 解决传递','Context 让后代读取祖先提供的值，本身不自动保存或改变业务状态。'],['reducer 组织转移','动作描述发生了什么，纯 reducer 根据当前状态计算下一状态。'],['拆分读与写','状态 Context 与 dispatch Context 可分开，组件只消费自己需要的依赖。']],
theory:[fwTheory('从 props drilling 到明确的提供者',['当中间多层组件只是传递同一份购物车与操作函数，Context 可以减少无关传参。但 Context 不是万能全局变量：最近的 Provider 决定当前消费值，Provider 的放置位置也决定共享范围和生命周期。','局部功能的 Provider 可以随页面卸载重置；应用根级 Provider 可跨路由保留。后端工程师可以从作用域理解它：相同 API 在不同实例作用域内可以拥有不同状态。']),fwTheory('reducer 与副作用分开',['reducer 接收 state 与 action，返回下一状态，不应直接发网络请求或原地修改已有数组。复制被修改路径，保留未变对象，能够让状态变化更容易追踪，也为浅比较提供有用信号。','异步流程在外层处理，分别派发 loading、success、error 等动作。复杂写入需携带请求身份或版本，避免旧响应修改新状态。Context 不会替代这些一致性设计。']),fwTheory('重新渲染范围与架构取舍',['Provider value 变化会影响消费该 Context 的后代。把频繁变化的大对象塞进一个 Context，可能让很多不相关消费者更新。可以按职责拆分 Context，先测量，再判断是否需要更精细的外部 Store。','把 state 与 dispatch 分开有助于只需要派发动作的组件避免订阅整个状态。不要把 memo 当作修复所有 Context 更新的工具；组件直接消费的 Context 变化仍有其更新语义。'])],
html:`<div id="app"></div>`,js:`const h=React.createElement;
const StateContext=React.createContext(null);
const DispatchContext=React.createContext(null);
function reducer(state,action){
  if(action.type==='add')return {...state,count:state.count+1};
  if(action.type==='remove')return {...state,count:state.count-1}; // 加入非负约束
  return state;
}
function Controls(){const dispatch=React.useContext(DispatchContext);return h('div',null,h('button',{id:'context-add',onClick:()=>dispatch({type:'add'})},'增加'),h('button',{id:'context-remove',onClick:()=>dispatch({type:'remove'})},'减少'));}
function Summary(){const state=React.useContext(StateContext);return h('output',{id:'context-count'},state.count);}
function App(){const [state,dispatch]=React.useReducer(reducer,{count:0});return h(DispatchContext.Provider,{value:dispatch},h(StateContext.Provider,{value:state},h(Controls),h(Summary)));}
ReactDOM.createRoot(document.querySelector('#app')).render(h(App));`,
walkthrough:[walk('Provider 确定共享范围','js','DispatchContext.Provider','Controls 和 Summary 处于同一个状态所有者下。'),walk('控件只发动作','js',"dispatch({type:'remove'})",'按钮不直接修改 count，约束集中在 reducer。'),walk('在转移处保护规则','js',"action.type==='remove'",'使用 Math.max(0,state.count-1) 维护非负不变量。')],
prerequisites:['reducer','react-render'],pitfall:'Context 不会自动管理异步、缓存或权限；reducer 也不能依赖原地修改来隐藏状态变化。',extension:'新增清空 action 和不同单价商品，拆分输入草稿与共享购物车状态。',steps:['先减少，观察出现负数。','在 reducer 中集中保护非负约束。','重新运行，连续减少仍保持 0。'],task:'修复非负约束；检查器会点击两次减少并验证仍为 0。',check:`document.querySelector('#context-remove').click();document.querySelector('#context-remove').click();return new Promise(r=>setTimeout(()=>r(document.querySelector('#context-count').textContent==='0'),100))`,hint:'count: Math.max(0,state.count-1)',quiz:quiz('Context 本身主要负责什么？',['让后代读取祖先提供的值','自动完成业务状态机与请求缓存'],0,'状态仍由 useState、useReducer 或外部 Store 等机制持有和更新。'),files:[fwFile('src/cart/contexts.js','将类型相近但变化频率不同的依赖分开。',`import { createContext } from 'react';
export const CartState = createContext(null);
export const CartDispatch = createContext(null);`),fwFile('src/cart/reducer.js','只维护领域转移，不执行 HTTP 请求。',`export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': return { ...state, count: state.count + 1 };
    case 'remove': return { ...state, count: Math.max(0, state.count - 1) };
    default: return state;
  }
}`)],refs:[ref('React：Reducer 与 Context','https://react.dev/learn/scaling-up-with-reducer-and-context'),ref('React：useContext','https://react.dev/reference/react/useContext')]});

fwLesson({id:'react-memo',track:'react',engine:'react',group:'十三 · React 应用开发',title:'memo 与 useMemo：先找真正的成本',summary:'观察依赖遗漏如何产生过期结果，理解缓存是优化而非正确性工具。',time:50,
principles:[['memo 比较组件输入','memo 可在 props 相同时跳过部分父级引发的重新渲染，但不是任何情况下都不更新。'],['useMemo 缓存计算结果','依赖变化后重新计算。遗漏依赖可能让界面保留旧结果。'],['useCallback 缓存函数引用','它不是“不创建函数”的承诺，也不会让函数执行变快；需要有依赖引用稳定性的消费方才有意义。']],
theory:[fwTheory('区分计算成本与 DOM 成本',['一段 render 被调用不一定昂贵，也不一定导致大量 DOM 更新。先找输入延迟的来源：数据转换、子树计算、布局、绘制还是网络。不要用某个 console.log 出现次数代替性能结论。','memo 默认按各 prop 的 Object.is 比较判断是否可以跳过相关更新。每次新建的对象或函数引用会改变比较结果；但组件自身 state 或所消费 Context 的变化仍可能触发更新。']),fwTheory('依赖列表是计算所需输入',['useMemo(() => items.filter(...query...), [items]) 漏掉 query，输入改变却可能继续使用缓存结果。这个错误与“性能”无关，首先是依赖声明不正确。依赖应反映回调读取的响应式输入，不应人为减少以追求少执行。','不昂贵的计算直接写在 render 中往往最清晰。useMemo 的缓存不应作为业务正确性的唯一基础；如果移除它就使语义出错，说明设计需要重新检查。']),fwTheory('如何做一次有效的优化验证',['固定设备、数据量和交互步骤，记录修改前后的渲染耗时与用户感知延迟，再决定保留优化。优化可能增加依赖复杂度、内存与维护成本，值得与收益一起评估。','本实验使用小数组暴露过期缓存，不用它证明优化加速。已有项目出现长列表卡顿时，应先验证瓶颈，再考虑虚拟化、计算下移、分块或合适的缓存。'])],
html:`<div id="app"></div>`,js:`const h=React.createElement;
const items=['apple','banana','apricot'];
function Search(){
  const [query,setQuery]=React.useState('');
  const filtered=React.useMemo(()=>items.filter(item=>item.includes(query)),[]); // 缺少依赖
  return h('section',null,h('label',null,'搜索 ',h('input',{id:'memo-query',value:query,onChange:e=>setQuery(e.target.value)})),h('output',{id:'filtered'},filtered.join(', ')));
}
ReactDOM.createRoot(document.querySelector('#app')).render(h(Search));`,
walkthrough:[walk('初次计算缓存全部结果','js','React.useMemo','query 初始为空，全部条目匹配。'),walk('输入更新 state','js','setQuery(e.target.value)','组件重渲染，但空依赖让计算结果继续复用。'),walk('恢复正确依赖','js','includes(query)),[]','query 是回调读取的响应式值，应列入依赖。')],
prerequisites:['react-render','react-effects','performance'],pitfall:'不要用不完整依赖换取“少执行”；把缓存去掉通常应该仍然得到正确业务结果。',extension:'移除 useMemo 验证语义一致，再扩大数据集测量是否确实需要缓存。',steps:['输入 ban，观察结果未过滤。','把依赖改为 [query]。','重跑后输入 ban，结果只剩 banana。'],task:'修复依赖，搜索 ban 后只显示 banana。',check:`return document.querySelector('#filtered').textContent==='banana'`,hint:'把 useMemo 的 [] 改为 [query]；items 是模块外固定常量。',quiz:quiz('useMemo 回调读取 query 却没有声明依赖，可能造成什么？',['结果更精确','复用过期计算结果'],1,'依赖遗漏会破坏正确性，不能靠用户再次触发其他操作弥补。'),files:[fwFile('src/Search.jsx','对小数据先选择直接计算，测量后再决定缓存。',`const filtered = items.filter(item => item.includes(query));
// 只有确有收益时再考虑：
const filteredCached = useMemo(
  () => items.filter(item => item.includes(query)),
  [items, query]
);`)],refs:[ref('React：useMemo','https://react.dev/reference/react/useMemo'),ref('React：memo','https://react.dev/reference/react/memo')]});

fwLesson({id:'react-suspense',track:'react',engine:'react',group:'十三 · React 应用开发',title:'lazy、Suspense 与错误边界',summary:'观察加载等待与渲染错误是两条不同路径，并设计恢复入口。',time:55,
principles:[['lazy 声明延迟组件','返回 Promise 的加载函数需要解析到含 default 组件的模块对象，组件定义应保持稳定。'],['Suspense 处理挂起等待','显示最近合适的 fallback；不会自动发现任意 Effect 里的 fetch。'],['错误边界处理渲染错误','错误边界可捕获子树的部分渲染错误；事件处理器和任意异步回调错误需要另行处理。']],
theory:[fwTheory('等待与失败不应共用一个模糊状态',['懒加载尚未完成时，界面应说明正在等待；加载或渲染失败时，需要可恢复错误信息。Suspense 的 fallback 表达挂起等待，错误边界的 fallback 表达失败。两者解决的问题不同，经常配合使用。','本课用 Promise 延迟提供组件，真实执行 React.lazy 与 Suspense，延迟用于稳定观察加载状态；没有假装发出真实 chunk 网络请求。工程中可改为 lazy(() => import("./Report.jsx"))，再观察生产构建和网络请求。']),fwTheory('边界应按用户任务划分',['把整页套一个加载边界容易让局部等待遮住整页；可以让导航和关键内容保持可用，将次要报表放入独立边界。错误边界也应有明确恢复动作，既说明失败区域，又保留其他功能。','lazy 通常在模块顶层声明，而不是在组件函数里每次创建新组件类型。重新创建组件类型可能带来不必要的重置，削弱状态身份的稳定性。']),fwTheory('错误捕获与重试范围',['错误边界不捕获所有错误。事件处理器中的异常应在事件流程中处理，普通异步请求的失败应进入 error 状态。不要为了显示统一错误而把所有失败都 throw 到渲染阶段。','本例重试清除故障标志并重建边界，恢复的是人为触发的渲染错误。真实 lazy 的模块加载拒绝有缓存等细节，不能把本例重置边界直接当成所有网络加载失败的通用重试方案。'])],
html:`<div id="app"></div>`,js:`const h=React.createElement;
const Report=React.lazy(()=>new Promise(resolve=>setTimeout(()=>resolve({default:function ReportView({crash}){if(crash)throw new Error('教学渲染故障');return h('output',{id:'report-ready'},'报表就绪');}}),700)));
class Boundary extends React.Component{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){console.log('边界捕获：',error.message);}
  render(){return this.state.failed?h('section',null,h('p',null,'报表渲染失败'),h('button',{id:'report-retry',onClick:this.props.onRetry},'恢复报表')):this.props.children;}
}
function App(){
  const [crash,setCrash]=React.useState(false);
  const [epoch,setEpoch]=React.useState(0);
  function recover(){setCrash(false);setEpoch(n=>n+1);}
  return h('section',null,h('button',{id:'report-break',onClick:()=>setCrash(true)},'制造渲染故障'),h(Boundary,{key:epoch,onRetry:recover},h(React.Suspense,{fallback:h('p',null,'正在准备报表…')},h(Report,{crash}))));
}
ReactDOM.createRoot(document.querySelector('#app')).render(h(App));`,
walkthrough:[walk('lazy 接收模块 Promise','js','React.lazy','等待期间最近的 Suspense 显示 fallback。'),walk('渲染失败进入边界','js','getDerivedStateFromError','错误边界切换到错误 UI，Console 会出现刻意触发的错误。'),walk('先清除原因再重建','js','function recover','只重建边界却不清除 crash 会再次失败。')],
prerequisites:['react-effects','lazy-modules','react-keys'],pitfall:'本课故意制造错误会输出错误日志；Suspense 不会自动接管普通 Effect 请求，也不等于错误边界。',extension:'增加一个独立信息区，验证报表失败时其他交互仍可使用。',steps:['重新运行，观察加载提示消失后报表就绪。','制造渲染故障，观察局部错误与日志。','点击恢复，确认报表重新可用。'],task:'走完故障与恢复流程，最终显示报表就绪；自动检查验证最终状态，过程结合日志自查。',check:`return document.querySelector('#report-ready')?.textContent==='报表就绪'`,hint:'先制造渲染故障，再点击恢复报表。',quiz:quiz('Suspense 会自动识别任何 useEffect 中的 fetch 吗？',['会','不会'],1,'Suspense 需要支持挂起的机制，例如 lazy；普通 Effect 请求仍需显式管理状态。'),files:[fwFile('src/ReportsPage.jsx','真实按需模块导入的 JSX 片段；边界组件另行实现。',`import { lazy, Suspense } from 'react';
const Report = lazy(() => import('./Report.jsx'));
export default function ReportsPage() {
  return <Suspense fallback={<p>加载报表…</p>}>
    <Report />
  </Suspense>;
}`)],refs:[ref('React：lazy','https://react.dev/reference/react/lazy'),ref('React：Suspense','https://react.dev/reference/react/Suspense'),ref('React：错误边界','https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary')]});
