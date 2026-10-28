'use strict';
window.FrameworkUI=(()=>{
  let sourceIndex=0;
  const jump=(id,text)=>`<button class="inline-link" data-go="${e(id)}">${e(text)}</button>`;
  function renderHub(){
    $('#hub').innerHTML=`<div class="hub-heading"><p class="eyebrow">框架专题 · 由原理走向应用</p><h1>把页面组织成一个应用</h1><p>框架建立在 HTML、CSS、JavaScript 之上。先追踪入口与一次更新，再学习组件之间如何协作，最后完成真实工程与目标端验收。</p></div>
    <section class="framework-start"><div><h2>从你已经熟悉的后端边界开始</h2><p>浏览器文档入口类似服务启动入口；组件组织界面与局部状态；事件处理器接收用户动作；请求层和服务端交换数据。但组件渲染会反复发生，UI 状态也不等同于数据库中的最终事实。</p><p>建议前置：${jump('entry','HTML / CSS / JS 如何协作')} · ${jump('state','事件 → 状态 → DOM')} · ${jump('closures','闭包与执行环境')} · ${jump('requests','请求与页面状态')}</p></div><aside><b>怎样使用这个专题</b><ol><li>先选 Vue 或 React 中一条主线。</li><li>每课先预测，再运行；修复故意留下的问题。</li><li>对照工程文件，解释入口与状态归属。</li><li>进入项目实践，留下验收证据并安排复习。</li></ol><p>uni-app 路线需要先掌握 Vue。完成单课检查代表通过该练习，不代表已经掌握整个框架。</p></aside></section>
    <section class="framework-comparison"><h2>同一个需求，分别由谁负责？</h2><p>以“修改订单数量 → 更新金额 → 保存结果”为例。服务端仍负责库存、权限与最终金额校验。</p><div class="table-scroll"><table><caption>原生 Web、Vue、React 与 uni-app 的职责对照</caption><thead><tr><th scope="col">关注点</th><th scope="col">原生 Web</th><th scope="col">Vue</th><th scope="col">React</th><th scope="col">uni-app</th></tr></thead><tbody>
    <tr><th scope="row">入口</th><td>HTML 引入 CSS 与 JS</td><td>HTML → main.js → createApp → 根组件</td><td>HTML → main.jsx → createRoot → 根组件</td><td>工具链按目标生成入口；main.js、App.vue、pages.json 各司其职</td></tr>
    <tr><th scope="row">状态变化</th><td>修改变量后显式更新 DOM</td><td>响应式依赖触发组件更新</td><td>setter / dispatch 请求下一次渲染</td><td>Vue 组件状态 + 目标端页面容器</td></tr>
    <tr><th scope="row">派生金额</th><td>纯函数计算，再写入视图</td><td>computed 从数量与单价计算</td><td>渲染中直接计算；必要时 useMemo</td><td>组件中计算；服务端确认最终金额</td></tr>
    <tr><th scope="row">组件协作</th><td>自己组织函数和事件</td><td>props、emits、slot；按需 Pinia</td><td>props、回调；按需 Context + reducer</td><td>Vue 组件协作；页面间按导航与生命周期组织</td></tr>
    <tr><th scope="row">页面导航</th><td>链接、History 等浏览器 API</td><td>Vue Router 管理 URL 与视图</td><td>由路由库或应用框架组织；React 核心不包含路由</td><td>pages.json 注册页面，uni 导航 API 操作页面容器</td></tr>
    <tr><th scope="row">外部副作用</th><td>主动创建与清理资源</td><td>watch、生命周期、composable</td><td>事件处理器、Effect、自定义 Hook</td><td>组件和页面生命周期、uni API、平台能力适配</td></tr>
    </tbody></table></div></section>
    <section class="framework-routes"><h2>选一条路线，逐层建立理解</h2><p class="muted">基础课与进阶课在这里重新编排；完成状态、笔记与复习使用同一份学习记录。</p>${window.FRAMEWORK_TRACKS.map(t=>{
      const ids=[...new Set(t.phases.flatMap(p=>p[1]))];const completed=ids.filter(completion).length;
      return `<article class="framework-route"><header><div><h3>${e(t.title)} <span>${e(t.subtitle)}</span></h3><p>${e(t.intro)}</p></div><strong>${completed} / ${ids.length} 课完成</strong></header><div class="track-phases">${t.phases.map((phase,i)=>`<section><h4>${i+1}. ${e(phase[0])}</h4><ol>${phase[1].map(id=>{const l=course.find(x=>x.id===id);return `<li>${jump(id,l.title)}<small>${completion(id)?'已完成':l.time+' 分钟'}</small></li>`}).join('')}</ol></section>`).join('')}</div><footer><p><b>学完应能做到：</b>${e(t.outcome)}</p><div class="actions"><button class="primary" data-go="${ids.find(id=>!completion(id))||ids[0]}">从这条路线继续</button><button data-adopt-track="${t.id}">设为我的学习方向</button><button data-project-open="${t.project}">查看项目验收</button></div></footer></article>`;
    }).join('')}</section>
    <section class="runtime-boundaries"><h2>哪些在这里真实运行，哪些需要工程环境？</h2><div><article><h3>Vue / React 实验</h3><p>使用本地固定教学版本 Vue 3.5.22、React 18.3.1。路由与状态课额外加载 Vue Router 4.5.1、Pinia 3.0.3。这些是实际框架运行时，不表示当前最新版本。</p></article><article><h3>工程源码对照</h3><p>.vue、JSX、import 与配置文件用于学习真实项目写法。片段可复制，但不构成完整脚手架。SFC、JSX 等需要对应构建工具；请勿直接粘贴到普通 JS 面板。</p></article><article><h3>uni-app 机制模型</h3><p>这里用原生 JavaScript 演示页面栈、生命周期、请求与分页状态。不会执行 uni API，也不能模拟系统授权或原生渲染。真实工程需在对应工具与目标设备上验证。</p></article></div><p>经典 uni-app 与 uni-app x / UTS 是不同路线，本专题先讲 Vue 3 / JavaScript / .vue。暂未覆盖所有框架 API、SSR / 服务端组件和大型应用架构；先把已有实验与项目验收完成。</p></section>`;
    $('#hub').querySelectorAll('[data-adopt-track]').forEach(b=>b.onclick=()=>{saved.prefs.path=b.dataset.adoptTrack;persist();notify('已设为学习方向，学习中心会按这条路线安排下一课。');});
    $('#hub').querySelectorAll('[data-project-open]').forEach(b=>b.onclick=()=>{
      window.Learning.showProject(b.dataset.projectOpen);
    });
  }
  function renderFile(){
    const file=current.files[sourceIndex];
    $$('#source-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===sourceIndex));b.tabIndex=i===sourceIndex?0:-1;});
    $('#source-purpose').textContent=file.purpose;
    $('#source-code').textContent=file.code;
    $('#source-copy-status').textContent='';
  }
  function lessonChanged(){
    const l=current;sourceIndex=0;
    $('#lesson-sections').hidden=!l.theory;
    $('#lesson-sections').innerHTML=`<span>本课内容</span><button data-scroll="framework-theory">深入理论</button><button data-scroll="deep-reading">执行跟读</button><button data-scroll="workshop-title">运行实验</button><button data-scroll="framework-source">工程源码</button><button data-scroll="practice-section">动手与检查</button>`;
    const theory=$('#framework-theory');theory.hidden=!l.theory;
    theory.innerHTML=l.theory?`<div class="section-heading"><div><h2>先把机制讲清楚</h2><p>把每个结论对应到后面的实验；能解释反例，比记住 API 名称更重要。</p></div><button data-scroll="workshop-title">先看运行结果</button></div><div class="theory-reading">${l.theory.map((section,i)=>`<article><div class="theory-number">${i+1}</div><div><h3>${e(section.title)}</h3>${section.paragraphs.map(p=>`<p>${e(p)}</p>`).join('')}${section.code?`<pre tabindex="0"><code>${e(section.code)}</code></pre>`:''}</div></article>`).join('')}</div>`:'';
    const source=$('#framework-source');source.hidden=!l.files?.length;
    source.innerHTML=l.files?.length?`<div class="section-heading"><div><h2>迁移到真实项目：文件与源码对照</h2><p>以下为工程片段，展示文件职责与写法。它们不在上方沙箱执行，也不是完整项目脚手架。</p></div><button id="copy-source">复制当前文件</button></div><div class="source-reader"><div id="source-tabs" role="tablist" aria-label="工程示例文件">${l.files.map((file,i)=>`<button role="tab" id="source-tab-${i}" aria-controls="source-panel" data-source-index="${i}">${e(file.path)}</button>`).join('')}</div><div id="source-panel" role="tabpanel" aria-labelledby="source-tab-0"><p id="source-purpose"></p><pre tabindex="0"><code id="source-code"></code></pre></div></div><p id="source-copy-status" role="status" class="muted"></p>`:'';
    if(l.files?.length){
      renderFile();
      const select=index=>{sourceIndex=index;$('#source-panel').setAttribute('aria-labelledby','source-tab-'+index);renderFile();};
      $('#source-tabs').onclick=event=>{const b=event.target.closest('[data-source-index]');if(b)select(Number(b.dataset.sourceIndex));};
      $('#source-tabs').onkeydown=event=>{let index=sourceIndex;if(event.key==='ArrowRight')index=(index+1)%l.files.length;else if(event.key==='ArrowLeft')index=(index+l.files.length-1)%l.files.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=l.files.length-1;else return;event.preventDefault();select(index);$('#source-tab-'+index).focus();};
      $('#copy-source').onclick=async()=>{const code=current.files[sourceIndex].code;try{await navigator.clipboard.writeText(code);if(current===l)$('#source-copy-status').textContent='已复制工程片段。请在对应项目和文件中使用。';}catch{if(current===l)$('#source-copy-status').textContent='浏览器未允许自动复制，请选中下方代码后手动复制。';}};
    }
  }
  $('#lesson-view').addEventListener('click',event=>{const b=event.target.closest('[data-scroll]');if(b){const section=document.getElementById(b.dataset.scroll);section?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}});
  return {renderHub,lessonChanged};
})();
