'use strict';
// 课程和学习数据使用稳定 id；新课程不会清空旧版进度。
window.LearningStore = (() => {
  const ids = new Set(window.COURSE.map(l => l.id));
  const projects = new Map(window.PROJECTS.map(p => [p.id,p]));
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = (value, max=12000) => typeof value === 'string' ? value.slice(0,max) : '';
  const count = value => Number.isInteger(value) && value >= 0 ? Math.min(value,100000) : 0;
  function day(date=new Date()) { return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-'); }
  function shift(days, from=new Date()) { const date=new Date(from);date.setDate(date.getDate()+days);return day(date); }
  function date(value) { if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return '';const d=new Date(value+'T12:00:00');return Number.isFinite(+d)&&day(d)===value?value:''; }
  function timestamp(value) { return typeof value==='string' && Number.isFinite(Date.parse(value)) ? value.slice(0,40) : ''; }
  function normalize(input) {
    const s=isObject(input)?input:{};
    const out={progress:{},drafts:{},notes:{},bookmarks:{},attempts:{},reviews:{},projects:{},activity:{},prefs:{path:'all',minutes:30},last:ids.has(s.last)?s.last:'entry'};
    for(const id of ids){
      const p=s.progress?.[id];if(isObject(p))out.progress[id]={exercise:p.exercise===true,quiz:p.quiz===true,completedAt:timestamp(p.completedAt)};
      const d=s.drafts?.[id];if(isObject(d)&&['html','css','js'].every(k=>typeof d[k]==='string'&&d[k].length<=200000))out.drafts[id]={html:d.html,css:d.css,js:d.js};
      const n=s.notes?.[id];if(isObject(n))out.notes[id]={text:text(n.text),updatedAt:timestamp(n.updatedAt)};
      if(s.bookmarks?.[id]===true)out.bookmarks[id]=true;
      const a=s.attempts?.[id];if(isObject(a))out.attempts[id]={quizWrong:count(a.quizWrong),exerciseWrong:count(a.exerciseWrong),lastErrorAt:timestamp(a.lastErrorAt),resolved:a.resolved===true};
      const r=s.reviews?.[id];if(isObject(r)&&date(r.due))out.reviews[id]={level:Math.min(count(r.level),4),due:date(r.due),reviewedAt:timestamp(r.reviewedAt)};
    }
    for(const [id,project] of projects) {
      const p=s.projects?.[id];if(!isObject(p))continue;
      out.projects[id]={checks:{},evidence:text(p.evidence),updatedAt:timestamp(p.updatedAt)};
      for(let i=0;i<project.criteria.length;i++)if(p.checks?.[i]===true)out.projects[id].checks[i]=true;
    }
    if(isObject(s.activity))for(const [key,value] of Object.entries(s.activity))if(date(key))out.activity[key]=count(value);
    if(['all','vue','react','uniapp'].includes(s.prefs?.path))out.prefs.path=s.prefs.path;
    if([20,30,45,60].includes(s.prefs?.minutes))out.prefs.minutes=s.prefs.minutes;
    return out;
  }
  function parseBackup(raw) {
    if(raw.length>6000000)throw new Error('备份超过 6 MB，请选择本平台导出的学习备份。');
    let data;try{data=JSON.parse(raw)}catch{throw new Error('不是有效的 JSON 文件。')}
    if(!isObject(data)||data.app!=='frontend-learning-lab'||data.version!==1||!isObject(data.data))throw new Error('备份格式或版本不受支持；现有数据未改动。');
    // 先完整验证已知课程记录，避免损坏文件在规范化时被静默当成空备份。
    const s=data.data;
    for(const key of ['progress','drafts','notes','bookmarks','attempts','reviews','projects','activity','prefs'])if(s[key]!==undefined&&!isObject(s[key]))throw new Error(key+' 字段格式错误。');
    for(const [id,d] of Object.entries(s.drafts||{}))if(ids.has(id)&&(!isObject(d)||!['html','css','js'].every(k=>typeof d[k]==='string'&&d[k].length<=200000)))throw new Error('课程草稿格式错误或过大：'+id);
    for(const [id,n] of Object.entries(s.notes||{}))if(ids.has(id)&&(!isObject(n)||typeof n.text!=='string'||n.text.length>12000))throw new Error('笔记格式错误或过长：'+id);
    for(const [id,p] of Object.entries(s.progress||{}))if(ids.has(id)&&(!isObject(p)||typeof p.quiz!=='boolean'||typeof p.exercise!=='boolean'))throw new Error('课程进度格式错误：'+id);
    for(const [id,r] of Object.entries(s.reviews||{}))if(ids.has(id)&&(!isObject(r)||!date(r.due)||!Number.isInteger(r.level)||r.level<0||r.level>4))throw new Error('复习计划格式错误：'+id);
    for(const [id,b] of Object.entries(s.bookmarks||{}))if(ids.has(id)&&typeof b!=='boolean')throw new Error('收藏格式错误：'+id);
    for(const [id,p] of Object.entries(s.projects||{}))if(projects.has(id)&&(!isObject(p)||!isObject(p.checks)||typeof p.evidence!=='string'||p.evidence.length>12000||Object.values(p.checks).some(v=>typeof v!=='boolean')))throw new Error('项目记录格式错误：'+id);
    return {data:normalize(s),exportedAt:timestamp(data.exportedAt),unknown:Object.keys(s.progress||{}).filter(id=>!ids.has(id)).length};
  }
  function merge(local,incoming,preferIncoming) {
    const low=preferIncoming?local:incoming, high=preferIncoming?incoming:local;
    const merged={...low,...high};
    for(const key of ['progress','drafts','notes','bookmarks','attempts','reviews','projects','activity'])merged[key]={...low[key],...high[key]};
    return normalize(merged);
  }
  return {normalize,parseBackup,merge,day,shift,intervals:[1,3,7,14,30]};
})();
