'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const course = window.COURSE;
const KEY = 'frontend-lab-course-v3';
let saved;
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
saved = window.LearningStore.normalize(saved);
let current, activeFile='html', activePanel='console', editing=false;
let draft, logs=[], domText='', runId=0, token='', ready=false, pendingCheck=null;
let observedURL='', viewport='full', toastTimer;
const vendorCache = new Map();
const e = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function notify(text) { $('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500); }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(saved)); return true; }
  catch { notify('浏览器未能保存本地进度，请及时导出学习备份。'); return false; }
}
function completion(id) { const p=saved.progress[id]; return Boolean(p?.exercise && p?.quiz); }
function renderNav() {
  const q=$('#search').value.trim().toLowerCase();
  const filtered=course.filter(l=>`${l.title} ${l.summary} ${l.group}`.toLowerCase().includes(q));
  $('#course-nav').innerHTML=[...new Set(filtered.map(l=>l.group))].map(group=>
    `<details open><summary>${e(group)}</summary>${filtered.filter(l=>l.group===group).map(l=>`<button class="lesson-link ${current?.id===l.id?'active':''}" data-id="${l.id}" ${current?.id===l.id?'aria-current="page"':''}><span class="number">${String(course.indexOf(l)+1).padStart(2,'0')}</span><span>${e(l.title)}</span>${completion(l.id)?'<span class="done">完成</span>':''}</button>`).join('')}</details>`
  ).join('') || '<p class="no-results">没有匹配的课程。试试“布局”或“状态”。</p>';
  const count=course.filter(l=>completion(l.id)).length;
  $('#progress').max=course.length;$('#progress').value=count;
  $('#progress-label').textContent=`${count} / ${course.length} 已完成`;
}
function navigate(id) { if (location.hash.slice(1)===id) route();else location.hash=id; }
$('#course-nav').addEventListener('click',event=>{const b=event.target.closest('[data-id]');if(b)navigate(b.dataset.id)});
$('#search').addEventListener('input',renderNav);
$('#resume').onclick=()=>navigate(saved.last || course[0].id);
function move(delta){ const i=course.indexOf(current); if(course[i+delta]) navigate(course[i+delta].id); }
$('#prev').onclick=()=>move(-1);$('#next').onclick=()=>move(1);$('#bottom-next').onclick=()=>move(1);
function showMap(){
  const panel=$('#overview'); panel.hidden=!panel.hidden;
  if(panel.hidden)return;
  panel.innerHTML=`<h2>从浏览器到项目交付</h2><p>${course.length} 课，${new Set(course.map(l=>l.group)).size} 个阶段。建议先逐课完成主线，再根据实际项目反复练习。每章有真实代码、操作步骤、反馈与官方参考；Flutter 为独立拓展路线。</p><div class="map-grid">${[...new Set(course.map(l=>l.group))].map(group=>`<div class="map-group"><h3>${e(group)}</h3>${course.filter(l=>l.group===group).map(l=>`<button data-id="${l.id}">${completion(l.id)?'已完成 · ':''}${e(l.title)}</button>`).join('')}</div>`).join('')}</div>`;
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}
$('#map-button').onclick=showMap;
$('#overview').onclick=event=>{const b=event.target.closest('[data-id]');if(b){$('#overview').hidden=true;navigate(b.dataset.id)}};
function loadLesson(id){
  current=course.find(l=>l.id===id)||course[0];
  const stored=saved.drafts[current.id];
  draft={html:current.html,css:current.css,js:current.js,...stored};
  activeFile='html';editing=false;$('#edit-mode').checked=false;
  $('#group-label').textContent=current.group;
  $('#lesson-title').textContent=current.title;
  $('#lesson-summary').textContent=current.summary;
  const index=course.indexOf(current);
  $('#lesson-number').textContent=`第 ${index+1} / ${course.length} 课`;
  $('#lesson-time').textContent=`建议 ${current.time} 分钟`;
  $('#prev').disabled=index===0;$('#next').disabled=index===course.length-1;$('#bottom-next').disabled=index===course.length-1;
  $('#bottom-next').textContent=index===course.length-1?'主线已读完，可回课程地图复习':'继续下一课';
  $('#concepts').innerHTML=current.concepts.map(c=>`<article><h2>${e(c.title)}</h2><p>${e(c.text)}</p></article>`).join('');
  $('#steps').innerHTML=current.steps.map(step=>`<li>${e(step)}</li>`).join('');
  $('#task').textContent=current.task;$('#hint').textContent=current.hint;$('#hint').hidden=true;
  $('#check-result').textContent='';$('#quiz-result').textContent='';
  $('#quiz-question').textContent=current.quiz.question;
  $('#quiz-options').innerHTML=current.quiz.options.map((option,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)}. ${e(option)}</button>`).join('');
  $('#references').innerHTML=current.refs.map(r=>`<a href="${e(r.url)}" target="_blank" rel="noopener noreferrer">${e(r.title)}</a>`).join('');
  $('#runtime-note').textContent=current.runtime || (current.engine==='vue'?'真实 Vue 3.5.22 · 本地教学运行时 · 代码可编辑':current.engine==='react'?'真实 React 18.3.1 · 使用 createElement，无需 JSX 编译':'原生 HTML / CSS / JavaScript · 代码在独立沙箱中真实执行');
  $('#use-css').checked=true;$('#use-js').checked=true;
  setWidth(current.id==='responsive'?'800':'full');renderEditor();renderNav();updateCompletion();
  saved.last=current.id;persist();runCode();
  if(observedURL)window.scrollTo({top:0,behavior:'instant'});
  observedURL=current.id;
  document.title=current.title+' · 前端学习实验室';
  window.Learning?.lessonChanged();
  window.FrameworkUI?.lessonChanged();
}
function updateCompletion(){
  const p=saved.progress[current.id]||{};
  $('#lesson-status').textContent=completion(current.id)?'本课已完成':'待练习';
  $('#completion-note').textContent=completion(current.id)?'练习与理解题均已通过。本课进度已保存在本机。':p.exercise?'练习已通过，再完成理解题。':p.quiz?'理解题已通过，再完成动手练习。':'完成动手练习与理解题，即可记录本课完成。';
}
$('#quiz-options').onclick=event=>{
  const b=event.target.closest('[data-answer]');if(!b)return;
  const correct=Number(b.dataset.answer)===current.quiz.answer;
  $$('#quiz-options button').forEach(x=>x.classList.remove('correct','wrong'));
  b.classList.add(correct?'correct':'wrong');
  $('#quiz-result').textContent=(correct?'回答正确。':'再想一想。')+current.quiz.explanation;
  if(correct){saved.progress[current.id]||={};saved.progress[current.id].quiz=true;persist();renderNav();updateCompletion()}
  window.Learning?.record('quiz',correct);
};
$('#hint-button').onclick=()=>{$('#hint').hidden=!$('#hint').hidden};
function lineExplanation(text){
  const special=current.notes.find(n=>n.file===activeFile && text.includes(n.match));
  if(special)return special.text;
  const t=text.trim();
  if(!t)return '空行用于分组，不产生运行效果。把相关代码放在一起有助于阅读调用链。';
  if(t.startsWith('//')||t.startsWith('<!--'))return '注释用于解释目的或边界；浏览器不把注释当作业务逻辑执行。';
  if(activeFile==='html')return '这是浏览器要解析成 DOM 的结构。注意标签语义、id/class 和属性；CSS 匹配节点，JavaScript 可以读取或修改节点。';
  if(activeFile==='css')return '这是样式规则的一部分。选择器决定作用范围，声明给出布局或视觉约束；可在右侧查看真实计算结果。';
  if(/console\.log/.test(t))return '把实际执行到这里的值写进下方 Console。日志来自当前预览运行，不是预先写好的演示文字。';
  if(/return/.test(t))return 'return 结束当前函数并返回结果。注意早返回会跳过后续代码；async 函数的返回值会包装为 Promise。';
  if(/await/.test(t))return 'await 暂停当前 async 函数，等待 Promise 后继续；它不会阻塞整个浏览器，也不会自动把同步计算移到工作线程。';
  if(/if\s*\(/.test(t))return '条件分支决定当前状态下走哪条路径。分别构造条件为真、为假的数据来验证行为。';
  if(/textContent/.test(t))return '将文本写入 DOM。修改 JavaScript 变量并不会自动改变原生页面，视图需要这类明确更新。';
  if(/addEventListener|onclick|onsubmit/.test(t))return '给节点注册事件处理器。注册时并不执行处理器主体；对应事件到来后浏览器才会调用。';
  if(/const |let /.test(t))return '声明变量或取得对象引用。const 禁止重新绑定，let 允许重新赋值；对象内部是否能修改是另一回事。';
  if(/^[\]});]+;?$/.test(t))return '这行关闭代码块、调用或对象。沿缩进向上找到它对应的开始位置，确认变量和函数的作用域。';
  return '跟着这行所属函数的调用路径阅读：输入是什么、修改了哪个值、是否改变 DOM。可以编辑后重跑，并用 Console 观察效果。';
}
function selectLine(index){
  const lines=draft[activeFile].split('\n');
  $$('#line-reader button').forEach((b,i)=>b.classList.toggle('selected',i===index));
  $('#line-label').textContent=`${activeFile.toUpperCase()} · 第 ${index+1} 行`;
  $('#line-detail').textContent=lineExplanation(lines[index]||'');
}
function renderEditor(){
  $$('#file-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.file===activeFile)));
  $('#file-name').textContent={html:'index.html · body 内容',css:'style.css · 样式规则',js:'app.js · body 解析后执行'}[activeFile];
  $('#code-editor').value=draft[activeFile];
  $('#code-editor').hidden=!editing;$('#line-reader').hidden=editing;
  $('#line-reader').innerHTML=draft[activeFile].split('\n').map((line,i)=>`<button data-line="${i}" aria-label="第 ${i+1} 行"><span class="ln">${i+1}</span><span>${e(line)||' '}</span></button>`).join('');
  selectLine(0);
}
$('#file-tabs').onclick=event=>{const b=event.target.closest('[data-file]');if(b){activeFile=b.dataset.file;renderEditor()}};
$('#line-reader').onclick=event=>{const b=event.target.closest('[data-line]');if(b)selectLine(Number(b.dataset.line))};
$('#edit-mode').onchange=event=>{editing=event.target.checked;renderEditor();if(editing)$('#code-editor').focus()};
$('#code-editor').oninput=event=>{draft[activeFile]=event.target.value;saved.drafts[current.id]={...draft};persist();$('#dirty').textContent='已改动，待运行'};
$('#code-editor').onkeydown=event=>{if(event.key==='Tab'){event.preventDefault();const t=event.target;const start=t.selectionStart;t.setRangeText('  ',start,t.selectionEnd,'end');t.dispatchEvent(new Event('input'));}if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();runCode()}};
$('#reset-code').onclick=()=>{draft={html:current.html,css:current.css,js:current.js};delete saved.drafts[current.id];persist();renderEditor();runCode();notify('本课代码已恢复，其他课程草稿保留。')};
function setWidth(width){
  viewport=width;$('#preview').style.width=width==='full'?'100%':width+'px';
  $('#preview-width').textContent=width==='full'?'自适应':width+'px';
  $$('[data-width]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.width===width)));
}
$$('[data-width]').forEach(b=>b.onclick=()=>setWidth(b.dataset.width));
function observe(){
  $('#observer').textContent=activePanel==='dom'?(domText||'等待 DOM…'):(logs.join('\n')||'尚无日志。操作预览中的控件后观察输出。');
  if(activePanel==='console')$('#observer').scrollTop=$('#observer').scrollHeight;
}
$$('[data-panel]').forEach(b=>b.onclick=()=>{activePanel=b.dataset.panel;$$('[data-panel]').forEach(x=>x.classList.toggle('active',x===b));observe()});
$('#clear-log').onclick=()=>{logs=[];observe()};
function libraryPaths(){const base=current.engine==='vue'?['vendor/vue-3.5.22.js']:current.engine==='react'?['vendor/react-18.3.1.js','vendor/react-dom-18.3.1.js']:[];return [...base,...(current.libraries||[])];}
async function getLibraries(){
  const sources=[];
  for(const path of libraryPaths()){
    if(!vendorCache.has(path)){
      const response=await fetch(path);if(!response.ok)throw new Error('无法加载教学库 '+path);
      vendorCache.set(path,await response.text());
    }
    sources.push(vendorCache.get(path));
  }
  return sources;
}
const scriptTag=source=>'<script>'+source.replace(/<\/script/gi,'<\\/script')+'</script>';
function instrumentation(key){
  return `(() => {
    const key=${JSON.stringify(key)};
    const send=(kind,payload)=>parent.postMessage({lab:key,kind,payload},'*');
    const stringify=x=>{try{return typeof x==='string'?x:JSON.stringify(x)}catch{return String(x)}};
    ['log','warn','error','info'].forEach(level=>{
      const original=console[level].bind(console);
      console[level]=(...args)=>{original(...args);send('log','['+level+'] '+args.map(stringify).join(' '));};
    });
    addEventListener('error',e=>send('log','[error] '+e.message+' · line '+e.lineno));
    addEventListener('unhandledrejection',e=>send('log','[error] '+String(e.reason)));
    addEventListener('message',async event=>{
      if(event.source!==parent||event.data?.lab!==key||event.data?.kind!=='check')return;
      try{const ok=await new Function(event.data.code)();send('checked',{id:event.data.id,ok:Boolean(ok)});}
      catch(error){send('checked',{id:event.data.id,ok:false,error:String(error)});}
    });
    let timer;
    function snapshot(){
      const lines=[];
      function visit(node,depth){
        if(lines.length>90||depth>7)return;
        if(node.nodeType===3){const t=node.textContent.trim();if(t)lines.push('  '.repeat(depth)+t.slice(0,95));return;}
        if(node.nodeType!==1||['SCRIPT','STYLE','META','LINK'].includes(node.tagName))return;
        lines.push('  '.repeat(depth)+'<'+node.tagName.toLowerCase()+(node.id?' id="'+node.id+'"':'')+'>');
        for(const child of node.childNodes)visit(child,depth+1);
      }
      visit(document.body,0);send('dom',lines.join('\\n'));
    }
    addEventListener('DOMContentLoaded',()=>{
      snapshot();send('ready',true);
      new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(snapshot,90);}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true});
    });
  })();`;
}
function assemble(libs,key,exporting=false){
  // 示例运行于独立 opaque-origin iframe；不授予宿主存储或外部请求权限。
  const csp=exporting?'':`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; worker-src blob:; base-uri 'none'; form-action 'none';">`;
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+csp+
    (exporting?'':scriptTag(instrumentation(key)))+
    ($('#use-css').checked?'<style>'+draft.css.replace(/<\/style/gi,'<\\/style')+'</style>':'')+
    '</head><body>'+draft.html+
    ($('#use-js').checked?libs.map(scriptTag).join('')+scriptTag(draft.js):'')+
    '</body></html>';
}
async function runCode(){
  const id=++runId;ready=false;pendingCheck=null;logs=[];domText='';observe();
  $('#check').disabled=true;$('#run').disabled=true;$('#run').textContent='加载中…';
  $('#check-result').textContent='';$('#dirty').textContent='';
  token=crypto.randomUUID();
  try{
    const libs=$('#use-js').checked?await getLibraries():[];
    if(id!==runId)return;
    // 每次运行创建全新浏览上下文，释放上一实验的定时器与 Worker。
    const previous=$('#preview');
    const preview=previous.cloneNode(false);
    preview.srcdoc=assemble(libs,token);
    previous.replaceWith(preview);
  }catch(error){logs.push('[平台加载错误] '+error.message);observe();}
  finally{if(id===runId){$('#run').disabled=false;$('#run').textContent='运行代码';}}
}
$('#run').onclick=runCode;
$('#use-css').onchange=runCode;$('#use-js').onchange=runCode;
addEventListener('message',event=>{
  if(event.source!==$('#preview').contentWindow||event.data?.lab!==token)return;
  const {kind,payload}=event.data;
  if(kind==='log'){logs.push(String(payload));if(logs.length>120)logs.shift();observe();}
  if(kind==='dom'){domText=String(payload);if(activePanel==='dom')observe();}
  if(kind==='ready'){ready=true;$('#check').disabled=false;}
  if(kind==='checked'&&pendingCheck?.id===payload.id){
    pendingCheck=null;$('#check').disabled=false;
    $('#check-result').textContent=payload.ok?'练习通过。你已完成本课要求的可观察结果。':'尚未达到目标。'+(payload.error?'代码执行错误：'+payload.error:'按提示修改代码或完成预览操作，再检查。');
    if(payload.ok){saved.progress[current.id]||={};saved.progress[current.id].exercise=true;persist();renderNav();updateCompletion();}
    window.Learning?.record('exercise',payload.ok);
  }
});
$('#check').onclick=()=>{
  if(!ready)return;
  const id=crypto.randomUUID();pendingCheck={id};$('#check').disabled=true;$('#check-result').textContent='正在检查预览结果…';
  $('#preview').contentWindow.postMessage({lab:token,kind:'check',code:current.check,id},'*');
  setTimeout(()=>{if(pendingCheck?.id===id){pendingCheck=null;$('#check').disabled=false;$('#check-result').textContent='预览未回应，请重新运行代码后检查。';}},4000);
};
$('#export').onclick=async()=>{
  try{
    const source=assemble(await getLibraries(),'',true);
    const url=URL.createObjectURL(new Blob([source],{type:'text/html;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=current.id+'-example.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    notify('已导出当前代码为独立 HTML 示例。');
  }catch(error){notify(error.message)}
};
function route(){
  const id=location.hash.slice(1)||'learn';
  if(window.Learning?.isHub(id))window.Learning.open(id);
  else loadLesson(id);
}
addEventListener('hashchange',route);

$('.skip').onclick=event=>{event.preventDefault();const title=$('#lesson-view').hidden?$('#hub h1'):$('#lesson-title');title?.focus();title?.scrollIntoView({block:'start'});};
$('#file-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('#file-tabs button');let i=tabs.indexOf(document.activeElement);i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].focus();tabs[i].click();});
