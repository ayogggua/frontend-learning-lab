'use strict';
// 宿主拥有一个学习状态 saved；课程、复习与项目视图复用它。
window.Learning = (() => {
  const store=window.LearningStore;
  const hubs=['learn','frameworks','review','projects','glossary'];
  let reviewId=null, revealed=false, reviewAll=false, importCandidate=null, projectFocus=null;
  const titleFor=id=>course.find(l=>l.id===id)?.title||id;
  const link=(id,label)=>`<button class="inline-link" data-go="${e(id)}">${e(label||titleFor(id))}</button>`;
  const dateLabel=value=>value ? value.replaceAll('-',' / ') : '尚未安排';
  const due=()=>course.filter(l=>saved.reviews[l.id]?.due<=store.day());
  function activity(){const today=store.day();saved.activity[today]=(saved.activity[today]||0)+1;}
  function ensureReviews(){for(const l of course)if(completion(l.id)&&!saved.reviews[l.id])saved.reviews[l.id]={level:0,due:store.day(),reviewedAt:''};}
  function record(kind,ok){
    const id=current.id;
    saved.attempts[id]||={quizWrong:0,exerciseWrong:0,lastErrorAt:'',resolved:false};
    const a=saved.attempts[id];
    if(!ok){a[kind==='quiz'?'quizWrong':'exerciseWrong']++;a.lastErrorAt=new Date().toISOString();a.resolved=false;saved.reviews[id]={level:0,due:store.day(),reviewedAt:''};}
    if(completion(id)&&ok){a.resolved=true;if(!saved.progress[id].completedAt)saved.progress[id].completedAt=new Date().toISOString();if(!saved.reviews[id])saved.reviews[id]={level:0,due:store.shift(1),reviewedAt:''};}
    activity();persist();updateBadge();
    const r=saved.reviews[id];if(r)$('#review-status').textContent='下次复习：'+r.due;
  }
  function updateBadge(){
    $('#review-count').textContent=due().length ? `复习 (${due().length})`:'复习';
    $('#catalog-label').textContent=`${course.length} 课 · 从浏览器到跨端开发`;
  }
  function inPath(l){const track=l.track||l.engine;const path=saved.prefs.path;return l.id!=='flutter'&&(path==='all'||!track||track===path||(path==='uniapp'&&track==='vue'));}
  function row(l,sub=''){return `<div class="study-row"><div>${link(l.id)}<p>${e(sub||l.summary)}</p></div><span>${completion(l.id)?'已完成':l.time+' 分钟'}</span></div>`;}
  function open(name){
    if(!hubs.includes(name))return;
    // 离开实验页即释放其浏览上下文，隐藏界面不应留下定时器和 Worker。
    if(!$('#lesson-view').hidden){
      runId++;token='';ready=false;pendingCheck=null;
      const previous=$('#preview');const empty=previous.cloneNode(false);
      empty.removeAttribute('srcdoc');previous.replaceWith(empty);
    }
    $('#lesson-view').hidden=true;$('#hub').hidden=false;$('#overview').hidden=true;
    $$('.lesson-paging').forEach(el=>el.hidden=true);
    $$('.workspace-tabs a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+name?'page':'false'));
    document.title={learn:'学习中心',frameworks:'框架专题',review:'复习与错题',projects:'项目实践',glossary:'术语索引'}[name]+' · 前端学习实验室';
    render(name);window.scrollTo({top:0,behavior:'instant'});
  }
  function hubHeader(title,description){return `<div class="hub-heading"><p class="eyebrow">前端学习实验室</p><h1 tabindex="-1">${title}</h1><p>${description}</p></div>`;}
  function render(name=location.hash.slice(1)){
    updateBadge();
    if(name==='frameworks')window.FrameworkUI.renderHub();if(name==='learn')renderHome();if(name==='review')renderReview();if(name==='projects')renderProjects();if(name==='glossary')renderGlossary();
  }
  function renderHome(){
    const done=course.filter(l=>completion(l.id)).length;
    const remaining=course.filter(l=>inPath(l)&&!completion(l.id));
    const next=remaining[0];
    const days=Object.keys(saved.activity).filter(d=>saved.activity[d]>0).length;
    const notes=course.filter(l=>saved.notes[l.id]?.text.trim());
    const bookmarks=course.filter(l=>saved.bookmarks[l.id]);
    const plan=[];let time=0;
    for(const l of remaining){if(plan.length&&time+l.time>saved.prefs.minutes)break;plan.push(l);time+=l.time;if(time>=saved.prefs.minutes)break;}
    $('#hub').innerHTML=hubHeader('让知识在下一次仍然可用','按课理解原理，在实验里修改代码，再通过复习和项目把它变成自己的能力。学习数据保存在当前浏览器，可导出备份后带到另一台设备。')+
    `<div class="learning-stats"><div><strong>${done}<small> / ${course.length}</small></strong><span>练习与理解题均通过</span></div><div><strong>${due().length}</strong><span>今天待复习</span></div><div><strong>${notes.length}</strong><span>有笔记的课程</span></div><div><strong>${days}</strong><span>实际学习日</span></div></div>
    <section class="today-plan"><div><h2>这一次，从这里继续</h2><p>先用 5 分钟回忆到期内容，再学习或完成一项练习。建议时长是分配参考，不是倒计时。</p></div><div class="plan-controls"><label>方向<select id="study-path"><option value="all">Web 与跨端完整路线</option><option value="vue">Web 基础 + Vue</option><option value="react">Web 基础 + React</option><option value="uniapp">Web 基础 + Vue + uni-app</option></select></label><label>每次预算<select id="study-minutes">${[20,30,45,60].map(n=>`<option value="${n}">${n} 分钟</option>`).join('')}</select></label></div>
    <div class="plan-content"><div><h3>${next?'接下来学习':'所选路线已完成'}</h3>${plan.length?plan.map(l=>row(l)).join(''):'<p>回到项目实践，用自己的代码验证理解。已通过练习并不代表无需复习。</p>'}${time>saved.prefs.minutes?'<p class="muted">本课建议时间超过单次预算，可以先完成原理与跟读，下次再做实验。</p>':''}<div class="actions"><button class="primary" data-go="${next?.id||'projects'}">${next?'开始下一课':'进入项目实践'}</button><button data-go="${saved.last}">回到上次课程</button></div></div><aside><h3>复习优先</h3><p>${due().length?`今天有 ${due().length} 课需要回忆。先尝试说出答案，再揭示解释。`:'当前没有到期项目。完成课程后会安排复习，也可随时手动加入。'}</p><button data-go="review">打开复习队列</button><p class="muted">间隔按自评安排为 1 / 3 / 7 / 14 / 30 天；这是学习辅助，不是对掌握程度的自动判定。</p></aside></div></section>
    <section class="framework-invitation"><div><h2>进入框架应用开发</h2><p>沿 Vue、React 或 uni-app 路线，读理论、修复实验，再对照真实工程文件。先掌握原生页面与状态，再选一条主线深入。</p></div><button data-go="frameworks" class="primary">打开框架专题</button></section>
    <section class="journey"><div class="section-heading"><div><h2>学习路线与能力检查点</h2><p>前置知识是建议，随时可以进入任意课程。Vue 与 React 可先选择一条深入。</p></div></div>${[...new Set(course.map(l=>l.group))].map(g=>{const lessons=course.filter(l=>l.group===g);return `<details class="stage"><summary><b>${e(g)}</b><span>${lessons.filter(l=>completion(l.id)).length} / ${lessons.length} 课完成</span></summary>${lessons.map(l=>row(l)).join('')}</details>`}).join('')}</section>
    <div class="hub-columns"><section><h2>收藏与笔记</h2>${bookmarks.length?bookmarks.map(l=>row(l,'已收藏')).join(''):'<p class="muted">在课程页点击“收藏本课”，把暂时卡住或想深入的内容留在这里。</p>'}${notes.length?`<h3>最近的笔记</h3>${notes.sort((a,b)=>(saved.notes[b.id].updatedAt||'').localeCompare(saved.notes[a.id].updatedAt||'')).slice(0,5).map(l=>row(l,saved.notes[l.id].text.slice(0,100))).join('')}`:''}</section>
    <section class="data-tools"><h2>带走你的学习数据</h2><p>备份包含课程完成记录、修改过的代码、笔记、复习计划与项目自评。同一地址的当前浏览器保存；换浏览器或清理站点数据后需导入备份恢复。</p><div class="actions"><button id="backup-export">导出学习备份</button><label class="file-button">选择备份文件<input id="backup-import" type="file" accept=".json,application/json"></label></div><p id="backup-result" role="status"></p><div id="backup-preview" hidden></div></section></div>`;
    $('#study-path').value=saved.prefs.path;$('#study-minutes').value=String(saved.prefs.minutes);
    $('#study-path').onchange=event=>{saved.prefs.path=event.target.value;persist();renderHome()};
    $('#study-minutes').onchange=event=>{saved.prefs.minutes=Number(event.target.value);persist();renderHome()};
    $('#backup-export').onclick=exportBackup;$('#backup-import').onchange=previewBackup;
  }
  function renderReview(){
    const pool=reviewAll?course.filter(l=>saved.reviews[l.id]):due();
    if(!pool.some(l=>l.id===reviewId)){reviewId=pool[0]?.id||null;revealed=false;}
    const l=course.find(l=>l.id===reviewId);
    const mistakes=course.filter(l=>{const a=saved.attempts[l.id];return a&&(a.quizWrong||a.exerciseWrong)});
    $('#hub').innerHTML=hubHeader('先回忆，再翻答案','能看懂与能独立说出原理是两件事。复习卡自评只安排下次回忆，不会替你完成课程练习。')+
    `<div class="review-toolbar"><label><input id="review-all" type="checkbox" ${reviewAll?'checked':''}>包括尚未到期的复习</label><span>${pool.length} 课在当前队列</span></div><div class="review-layout"><section class="review-card">${l?`<p class="eyebrow">${e(l.title)} · ${saved.reviews[l.id].due<=store.day()?'已到期':'计划 '+dateLabel(saved.reviews[l.id].due)}</p><h2>${e(l.quiz.question)}</h2><p>先合上资料，用自己的话回答。想起一个反例会更有帮助。</p>${revealed?`<div class="recall-answer"><b>${e(l.quiz.options[l.quiz.answer])}</b><p>${e(l.quiz.explanation)}</p><p>再做一次迁移：${e(l.depth?.extension||l.task)}</p></div><p>根据刚才未看答案时的表现自评：</p><div class="actions"><button data-rate="again">还不稳 · 明天再来</button><button data-rate="good" class="primary">能解释 · 延长间隔</button><button data-rate="easy">能举例 · 再延长一级</button></div>`:'<button id="reveal-answer" class="primary">揭示答案</button>'}<div class="review-footer">${link(l.id,'回到本课实验')}<span>复习 ${store.intervals[saved.reviews[l.id].level]} 天间隔档</span></div>`:'<h2>当前队列已清空</h2><p>今天可以继续新课或做一个项目检查点。若想提前复习，勾选“包括尚未到期”。</p><button data-go="learn">回到学习中心</button>'}</section><aside class="review-queue"><h3>复习清单</h3>${pool.map(x=>`<button class="${x.id===reviewId?'selected':''}" data-review="${x.id}">${e(x.title)}<small>${dateLabel(saved.reviews[x.id].due)}</small></button>`).join('')||'<p>完成课程或在课程页手动加入复习。</p>'}</aside></div>
    <section class="mistakes"><h2>错题与练习记录</h2><p class="muted">记录真实失败次数，不因翻看答案而删除。后续通过会显示“已补练”，仍可再次回顾。</p>${mistakes.length?mistakes.map(x=>{const a=saved.attempts[x.id];return row(x,`理解题 ${a.quizWrong} 次未通过 · 练习 ${a.exerciseWrong} 次未通过 · ${a.resolved?'已补练':'待补练'}`)}).join(''):'<p>暂无未通过记录。你可以先预测结果，再运行检查。</p>'}</section>`;
    $('#review-all').onchange=event=>{reviewAll=event.target.checked;reviewId=null;revealed=false;renderReview()};
    if($('#reveal-answer'))$('#reveal-answer').onclick=()=>{revealed=true;renderReview()};
  }
  function rate(value){
    if(!revealed||!reviewId)return;
    const r=saved.reviews[reviewId];
    r.level=value==='again'?0:Math.min(4,r.level+(value==='easy'?2:1));
    r.due=store.shift(store.intervals[r.level]);r.reviewedAt=new Date().toISOString();
    activity();persist();notify('已安排下次复习：'+r.due);
    reviewId=null;revealed=false;reviewAll=false;renderReview();updateBadge();
  }
  function renderProjects(){
    $('#hub').innerHTML=hubHeader('把实验串成能交付的项目','每个项目都有需求、接口边界、实现顺序和验收标准。这里记录的是你的自评与证据，不会把勾选结果计作课程自动通过。')+
    `<div class="project-list">${window.PROJECTS.map(p=>{const state=saved.projects[p.id]||{checks:{},evidence:''};const count=p.criteria.filter((_,i)=>state.checks[i]).length;return `<details class="project" ${p.id==='native'?'open':''}><summary><div><h2>${e(p.title)}</h2><span>${p.duration}</span></div><strong>${count} / ${p.criteria.length} 项自评</strong></summary><p>${e(p.brief)}</p><div class="prerequisites">建议先学：${p.requires.map(id=>link(id)).join(' · ')}</div><div class="project-brief"><h3>交付物</h3><p>${e(p.deliverable)}</p><h3>接口契约练习</h3><p class="contract">${e(p.contract)}</p></div><div class="milestones">${p.milestones.map((m,i)=>`<article><span>第 ${i+1} 步</span><h3>${e(m[0])}</h3><p>${e(m[1])}</p></article>`).join('')}</div><h3>逐项验收</h3><div class="project-checks">${p.criteria.map((criterion,i)=>`<label><input type="checkbox" data-project="${p.id}" data-criterion="${i}" ${state.checks[i]?'checked':''}>${e(criterion)}</label>`).join('')}</div><p>${e(p.rubric)}</p><label class="evidence-label" for="evidence-${p.id}">验收证据与待改问题</label><textarea id="evidence-${p.id}" data-evidence="${p.id}" maxlength="12000" rows="4" placeholder="记录版本、输入、操作、预期与实际结果。例如：375px 下查询 pending，列表为空时出现清空筛选入口。">${e(state.evidence)}</textarea><p class="save-indicator" id="project-save-${p.id}" role="status">证据保存在本机，并包含在学习备份中。</p><button data-go="${p.start}">打开起点实验</button></details>`}).join('')}</div>`;
    if(projectFocus){const target=$(`[data-project="${projectFocus}"]`)?.closest('details');projectFocus=null;if(target){target.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'smooth'}));}}
  }
  function showProject(id){
    if(!window.PROJECTS.some(p=>p.id===id))return;
    projectFocus=id;
    if(location.hash==='#projects')open('projects');else navigate('projects');
  }
  function renderGlossary(){
    $('#hub').innerHTML=hubHeader('术语索引','遇到术语时，先用一句话确认它解决的问题，再回到对应实验看代码。')+`<label for="term-search">搜索术语或解释</label><input id="term-search" type="search" placeholder="例如：入口、状态、缓存、Effect"><div id="term-list"></div>`;
    const fill=()=>{const query=$('#term-search').value.trim().toLowerCase();const list=window.GLOSSARY.filter(t=>t.join(' ').toLowerCase().includes(query));$('#term-list').innerHTML=list.map(t=>`<article class="term"><h2>${e(t[0])}</h2><p>${e(t[1])}</p>${link(t[2],'打开对应实验')}</article>`).join('')||'<p>没有匹配的术语，换一个关键词试试。</p>';};
    $('#term-search').oninput=fill;fill();
  }
  function exportBackup(){
    const payload={app:'frontend-learning-lab',version:1,exportedAt:new Date().toISOString(),data:store.normalize(saved)};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='frontend-learning-'+store.day()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('#backup-result').textContent='已生成学习备份，请保留下载的 JSON 文件。';
  }
  async function previewBackup(event){
    const file=event.target.files[0];if(!file)return;
    importCandidate=null;$('#backup-preview').hidden=true;
    try{
      if(file.size>6000000)throw new Error('文件超过 6 MB，未读取。');
      const result=store.parseBackup(await file.text());
      if(!$('#backup-preview'))return;
      importCandidate=result.data;
      const d=result.data;
      $('#backup-result').textContent='备份已校验，尚未写入本机。';
      $('#backup-preview').hidden=false;
      $('#backup-preview').innerHTML=`<p>备份含 ${Object.values(d.progress).filter(p=>p.exercise&&p.quiz).length} 课完成、${Object.keys(d.drafts).length} 份草稿、${Object.keys(d.notes).length} 份笔记、${Object.keys(d.projects).length} 个项目记录。${result.unknown?'有 '+result.unknown+' 个未知课程 id 将忽略。':''}</p><label>同一条记录冲突时<select id="import-policy"><option value="local">保留本机，补入缺失记录</option><option value="incoming">使用备份，本机独有记录保留</option></select></label><p class="muted">按课程记录整体合并；进度、草稿、笔记分别处理。导入不会自动运行备份里的代码。</p><div class="actions"><button id="apply-backup" class="primary">确认合并</button><button id="cancel-backup">取消</button></div>`;
      $('#apply-backup').onclick=()=>{
        const merged=store.merge(saved,importCandidate,$('#import-policy').value==='incoming');
        try{localStorage.setItem(KEY,JSON.stringify(merged));}catch{notify('存储空间不足，未导入；现有数据保持不变。');return;}
        saved=merged;importCandidate=null;ensureReviews();persist();renderNav();renderHome();notify('备份已合并，现有课程仍可继续。');
      };
      $('#cancel-backup').onclick=()=>{importCandidate=null;$('#backup-preview').hidden=true;$('#backup-import').value='';$('#backup-result').textContent='已取消，本机数据未改动。'};
    }catch(error){if($('#backup-result'))$('#backup-result').textContent=error.message;}
  }
  function lessonChanged(){
    $('#hub').hidden=true;$('#lesson-view').hidden=false;$$('.lesson-paging').forEach(el=>el.hidden=false);
    $$('.workspace-tabs a').forEach(a=>a.removeAttribute('aria-current'));
    const l=current;
    $('#bookmark').textContent=saved.bookmarks[l.id]?'已收藏':'收藏本课';$('#bookmark').setAttribute('aria-pressed',String(Boolean(saved.bookmarks[l.id])));
    $('#lesson-note').value=saved.notes[l.id]?.text||'';$('#note-status').textContent='笔记随输入自动保存在本机。';
    const r=saved.reviews[l.id];$('#review-status').textContent=r?'下次复习：'+r.due:'完成课程后自动安排复习，也可以现在加入。';
    const panel=$('#deep-reading');panel.hidden=!l.walkthrough&&!l.depth;
    panel.innerHTML=`${l.depth?`<p class="prerequisites">建议先学：${l.depth.before.map(id=>link(id)).join(' · ')}</p>`:''}${l.walkthrough?`<div class="section-heading"><div><h2>沿着一次执行读代码</h2><p>点击步骤会定位到对应文件与代码行；说明会指出输入、变化和可观察结果。</p></div></div><div class="walkthrough">${l.walkthrough.map((s,i)=>`<button data-walk="${i}"><span>${String(i+1).padStart(2,'0')}</span><strong>${e(s.title)}</strong><small>${e(s.text)}</small></button>`).join('')}</div>`:''}${l.depth?`<div class="depth-notes"><p><b>容易误解：</b>${e(l.depth.pitfalls)}</p><p><b>再进一层：</b>${e(l.depth.extension)}</p></div>`:''}`;
    updateBadge();
  }
  $('#hub').addEventListener('click',event=>{
    const go=event.target.closest('[data-go]');if(go){navigate(go.dataset.go);return;}
    const review=event.target.closest('[data-review]');if(review){reviewId=review.dataset.review;revealed=false;renderReview();return;}
    const rating=event.target.closest('[data-rate]');if(rating)rate(rating.dataset.rate);
  });
  $('#hub').addEventListener('change',event=>{
    const t=event.target;if(!t.matches('[data-project]'))return;
    const id=t.dataset.project;saved.projects[id]||={checks:{},evidence:'',updatedAt:''};
    saved.projects[id].checks[t.dataset.criterion]=t.checked;saved.projects[id].updatedAt=new Date().toISOString();activity();persist();
    const project=window.PROJECTS.find(p=>p.id===id);const count=project.criteria.filter((_,i)=>saved.projects[id].checks[i]).length;
    t.closest('.project').querySelector('summary strong').textContent=`${count} / ${project.criteria.length} 项自评`;
  });
  $('#hub').addEventListener('input',event=>{
    const t=event.target;if(!t.matches('[data-evidence]'))return;
    const id=t.dataset.evidence;saved.projects[id]||={checks:{},evidence:'',updatedAt:''};
    saved.projects[id].evidence=t.value;saved.projects[id].updatedAt=new Date().toISOString();const ok=persist();$('#project-save-'+id).textContent=ok?'验收证据已保存。':'未能保存，请导出备份。';
  });
  $('#bookmark').onclick=()=>{saved.bookmarks[current.id]=!saved.bookmarks[current.id];persist();lessonChanged();};
  $('#queue-review').onclick=()=>{saved.reviews[current.id]||={level:0,due:store.day(),reviewedAt:''};saved.reviews[current.id].due=store.day();persist();lessonChanged();notify('本课已加入今天的复习队列。')};
  $('#lesson-note').oninput=event=>{saved.notes[current.id]={text:event.target.value,updatedAt:new Date().toISOString()};const ok=persist();$('#note-status').textContent=ok?'笔记已保存。':'未能保存，请导出备份。'};
  $('#lesson-note').onchange=()=>{activity();persist()};
  $('#deep-reading').onclick=event=>{
    const go=event.target.closest('[data-go]');if(go){navigate(go.dataset.go);return;}
    const b=event.target.closest('[data-walk]');if(!b)return;
    const s=current.walkthrough[Number(b.dataset.walk)];activeFile=s.file;editing=false;$('#edit-mode').checked=false;renderEditor();
    const index=draft[activeFile].split('\n').findIndex(line=>line.includes(s.match));selectLine(Math.max(0,index));
    $('#line-detail').textContent=s.text+(index<0?' 当前草稿已改变，对应原始行未找到。':'');
    $('#line-reader .selected')?.scrollIntoView({block:'center'});
    $$('#deep-reading [data-walk]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  };
  ensureReviews();persist();renderNav();
  return {isHub:id=>hubs.includes(id),open,record,lessonChanged,showProject};
})();
route();
