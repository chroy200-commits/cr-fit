
// ══════ DATA ══════
let sessions = JSON.parse(localStorage.getItem('crfit_sessions')||'[]');
let prs      = JSON.parse(localStorage.getItem('crfit_prs')||'{}');
let bws      = JSON.parse(localStorage.getItem('crfit_bw')||'[]');
let settings = JSON.parse(localStorage.getItem('crfit_settings')||'{}');
let exCount  = 0, exercises = [];
let timerInt = null, timerRem = 120, timerTotal = 120;
let volChart = null, freqChart = null, bwChart = null;

const MCOLORS = {chest:'#e85d04',shoulders:'#f59e0b',triceps:'#8b5cf6',biceps:'#3b82f6',lats:'#10b981',traps:'#6366f1',abs:'#ec4899',obliques:'#db2777',quads:'#ef4444',hamstrings:'#f97316',glutes:'#14b8a6',lowerback:'#84cc16',calves:'#06b6d4'};
const RECOVERY_H = {chest:48,shoulders:48,triceps:40,biceps:40,lats:48,traps:36,abs:24,obliques:24,quads:72,hamstrings:72,glutes:60,lowerback:72,calves:36};
const REC_IDS = {chest:['rf-chest'],shoulders:['rf-shl','rf-shr','rb-rdl','rb-rdr'],biceps:['rf-bicl','rf-bicr'],triceps:['rb-tril','rb-trir'],abs:['rf-abs'],obliques:['rf-obl','rf-obr'],quads:['rf-ql','rf-qr'],calves:['rf-cl','rf-cr','rb-cl','rb-cr2'],traps:['rb-traps'],lats:['rb-latl','rb-latr'],lowerback:['rb-lb'],glutes:['rb-gl','rb-gr'],hamstrings:['rb-hl','rb-hr']};
const LOG_IDS = {chest:['lf-chest'],shoulders:['lf-shl','lf-shr','lb-rdl','lb-rdr'],biceps:['lf-bicl','lf-bicr'],triceps:['lb-tril','lb-trir'],abs:['lf-abs'],obliques:['lf-obl','lf-obr'],quads:['lf-ql','lf-qr'],calves:['lf-cl','lf-cr','lb-cl','lb-cr2'],traps:['lb-traps'],lats:['lb-latl','lb-latr'],lowerback:['lb-lb'],glutes:['lb-gl','lb-gr'],hamstrings:['lb-hl','lb-hr']};
const EX_DB = {
  'Bench Press':{cat:'Chest',muscles:['chest','shoulders','triceps'],primary:'chest'},
  'Incline Bench':{cat:'Chest',muscles:['chest','shoulders','triceps'],primary:'chest'},
  'Dumbbell Fly':{cat:'Chest',muscles:['chest'],primary:'chest'},
  'Push-Up':{cat:'Chest',muscles:['chest','shoulders','triceps'],primary:'chest'},
  'Cable Fly':{cat:'Chest',muscles:['chest'],primary:'chest'},
  'Overhead Press':{cat:'Shoulders',muscles:['shoulders','triceps','traps'],primary:'shoulders'},
  'Lateral Raise':{cat:'Shoulders',muscles:['shoulders'],primary:'shoulders'},
  'Arnold Press':{cat:'Shoulders',muscles:['shoulders','triceps'],primary:'shoulders'},
  'Face Pull':{cat:'Shoulders',muscles:['shoulders','traps'],primary:'shoulders'},
  'Squat':{cat:'Legs',muscles:['quads','glutes','hamstrings','lowerback'],primary:'quads'},
  'Leg Press':{cat:'Legs',muscles:['quads','glutes'],primary:'quads'},
  'Leg Extension':{cat:'Legs',muscles:['quads'],primary:'quads'},
  'Hack Squat':{cat:'Legs',muscles:['quads','glutes'],primary:'quads'},
  'Romanian Deadlift':{cat:'Legs',muscles:['hamstrings','glutes','lowerback'],primary:'hamstrings'},
  'Leg Curl':{cat:'Legs',muscles:['hamstrings'],primary:'hamstrings'},
  'Hip Thrust':{cat:'Legs',muscles:['glutes','hamstrings'],primary:'glutes'},
  'Deadlift':{cat:'Back',muscles:['lats','lowerback','hamstrings','glutes','traps'],primary:'lats'},
  'Pull-Up':{cat:'Back',muscles:['lats','biceps','traps'],primary:'lats'},
  'Lat Pulldown':{cat:'Back',muscles:['lats','biceps'],primary:'lats'},
  'Barbell Row':{cat:'Back',muscles:['lats','traps','biceps','lowerback'],primary:'lats'},
  'Cable Row':{cat:'Back',muscles:['lats','traps','biceps'],primary:'lats'},
  'Shrug':{cat:'Back',muscles:['traps'],primary:'traps'},
  'Bicep Curl':{cat:'Arms',muscles:['biceps'],primary:'biceps'},
  'Hammer Curl':{cat:'Arms',muscles:['biceps'],primary:'biceps'},
  'Preacher Curl':{cat:'Arms',muscles:['biceps'],primary:'biceps'},
  'Tricep Pushdown':{cat:'Arms',muscles:['triceps'],primary:'triceps'},
  'Skull Crusher':{cat:'Arms',muscles:['triceps'],primary:'triceps'},
  'Dip':{cat:'Arms',muscles:['triceps','chest','shoulders'],primary:'triceps'},
  'Calf Raise':{cat:'Legs',muscles:['calves'],primary:'calves'},
  'Plank':{cat:'Core',muscles:['abs','obliques'],primary:'abs'},
  'Crunch':{cat:'Core',muscles:['abs'],primary:'abs'},
  'Ab Rollout':{cat:'Core',muscles:['abs','lowerback'],primary:'abs'},
  'Russian Twist':{cat:'Core',muscles:['obliques','abs'],primary:'obliques'},
};
const SESSION_TEMPLATES = {
  'Push Day':{type:'strength',muscles:['chest','shoulders','triceps'],exs:['Bench Press','Overhead Press','Incline Bench','Lateral Raise','Tricep Pushdown']},
  'Pull Day':{type:'hypertrophy',muscles:['lats','traps','biceps'],exs:['Lat Pulldown','Barbell Row','Cable Row','Bicep Curl','Hammer Curl']},
  'Leg Day':{type:'strength',muscles:['quads','glutes','hamstrings'],exs:['Squat','Leg Press','Romanian Deadlift','Hip Thrust','Leg Curl']},
  'Upper Body':{type:'strength',muscles:['chest','shoulders','lats'],exs:['Bench Press','Overhead Press','Pull-Up','Barbell Row','Dip']},
  'Lower Body Power':{type:'strength',muscles:['quads','glutes','hamstrings'],exs:['Squat','Deadlift','Hip Thrust','Leg Press','Calf Raise']},
  'Arm Day':{type:'hypertrophy',muscles:['biceps','triceps'],exs:['Bicep Curl','Skull Crusher','Hammer Curl','Tricep Pushdown','Preacher Curl']},
  'Core & Cardio':{type:'cardio',muscles:['abs','obliques'],exs:['Plank','Crunch','Russian Twist','Ab Rollout']},
  'Active Recovery':{type:'recovery',muscles:['lats','traps'],exs:['Cable Row','Face Pull','Lateral Raise','Calf Raise']},
};

// ══════ SETTINGS ══════
function loadSettings() {
  const url = settings.sheetsUrl || '';
  const el = document.getElementById('sheets-url');
  if (el) el.value = url;
  const autoSync = document.getElementById('auto-sync');
  if (autoSync) autoSync.checked = settings.autoSync || false;
  const lastSync = document.getElementById('last-synced-text');
  if (lastSync) lastSync.textContent = settings.lastSynced ? 'Last synced: ' + settings.lastSynced : 'Never';
  updateSheetStatusUI(url ? 'saved' : 'empty');
  const unit = document.getElementById('pref-unit');
  if (unit) unit.value = settings.unit || 'kg';
  const rest = document.getElementById('pref-rest');
  if (rest) rest.value = settings.defaultRest || '120';
  const formula = document.getElementById('pref-1rm');
  if (formula) formula.value = settings.formula || 'epley';
}
function saveSheetSettings() {
  settings.sheetsUrl = document.getElementById('sheets-url').value.trim();
  settings.autoSync  = document.getElementById('auto-sync').checked;
  localStorage.setItem('crfit_settings', JSON.stringify(settings));
  updateSheetStatusUI(settings.sheetsUrl ? 'saved' : 'empty');
}
function savePref() {
  settings.unit        = document.getElementById('pref-unit').value;
  settings.defaultRest = document.getElementById('pref-rest').value;
  settings.formula     = document.getElementById('pref-1rm').value;
  localStorage.setItem('crfit_settings', JSON.stringify(settings));
  notify('Preferences saved');
}
function clearSheetSettings() {
  document.getElementById('sheets-url').value = '';
  settings.sheetsUrl = '';
  localStorage.setItem('crfit_settings', JSON.stringify(settings));
  updateSheetStatusUI('empty');
  document.getElementById('test-result').className = 'test-result';
}
function updateSheetStatusUI(state) {
  const dot  = document.getElementById('sheets-status-dot');
  const text = document.getElementById('sheets-status-text');
  const sub  = document.getElementById('sheets-status-sub');
  if (!dot) return;
  dot.className = 'status-dot';
  if (state === 'connected') {
    dot.classList.add('connected');
    text.textContent = 'Connected';
    sub.textContent  = 'Sessions will sync automatically on save';
  } else if (state === 'saved') {
    dot.classList.add('connected');
    text.textContent = 'URL saved';
    sub.textContent  = 'Click "Test Connection" to verify';
  } else if (state === 'testing') {
    dot.classList.add('testing');
    text.textContent = 'Testing...';
    sub.textContent  = 'Sending a test ping to your Apps Script';
  } else if (state === 'error') {
    dot.classList.add('disconnected');
    text.textContent = 'Connection failed';
    sub.textContent  = 'Check your URL and Apps Script deployment';
  } else {
    dot.classList.add('disconnected');
    text.textContent = 'Not connected';
    sub.textContent  = 'Paste your Apps Script Web App URL below';
  }
}
async function testSheetsConnection() {
  const url = document.getElementById('sheets-url').value.trim();
  if (!url) { notify('Paste your Web App URL first'); return; }
  updateSheetStatusUI('testing');
  document.getElementById('test-btn').textContent = 'Testing...';
  document.getElementById('test-btn').disabled = true;
  const resultEl = document.getElementById('test-result');
  try {
    const testPayload = { date: new Date().toISOString().split('T')[0], name: 'CR-FIT Connection Test', duration: 0, energy: 0, soreness: 0, totalVolume: 0, notes: 'Automated test — you can delete this row', exercises: [] };
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(testPayload) });
    const json = await res.json();
    if (json.status === 'ok') {
      updateSheetStatusUI('connected');
      resultEl.className = 'test-result success';
      resultEl.textContent = '✓ Connection successful! A test row was added to your Sheet. You can delete it.';
      settings.lastSynced = new Date().toLocaleString();
      localStorage.setItem('crfit_settings', JSON.stringify(settings));
      document.getElementById('last-synced-text').textContent = 'Last synced: ' + settings.lastSynced;
    } else {
      throw new Error('Unexpected response');
    }
  } catch(e) {
    updateSheetStatusUI('error');
    resultEl.className = 'test-result error';
    resultEl.textContent = '✗ Connection failed. Make sure: (1) the URL ends in /exec, (2) deployment is set to "Anyone" access, (3) you copied the correct URL.';
  }
  document.getElementById('test-btn').textContent = 'Test Connection';
  document.getElementById('test-btn').disabled = false;
}
async function syncToSheets(session) {
  const url = settings.sheetsUrl;
  if (!url || !settings.autoSync) return;
  try {
    await fetch(url, { method: 'POST', body: JSON.stringify(session) });
    settings.lastSynced = new Date().toLocaleString();
    localStorage.setItem('crfit_settings', JSON.stringify(settings));
    const el = document.getElementById('last-synced-text');
    if (el) el.textContent = 'Last synced: ' + settings.lastSynced;
  } catch(e) { console.warn('Sheets sync failed:', e); }
}
async function syncAllToSheets() {
  const url = settings.sheetsUrl;
  if (!url) { notify('Connect to Google Sheets first'); return; }
  notify('Syncing ' + sessions.length + ' sessions...');
  for (const s of sessions) {
    try { await fetch(url, { method: 'POST', body: JSON.stringify(s) }); } catch(e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  settings.lastSynced = new Date().toLocaleString();
  localStorage.setItem('crfit_settings', JSON.stringify(settings));
  document.getElementById('last-synced-text').textContent = 'Last synced: ' + settings.lastSynced;
  notify('✓ All ' + sessions.length + ' sessions synced!');
}

// ══════ FATIGUE ENGINE ══════
function getLastWorked() {
  const last = {};
  sessions.forEach(s => { (s.exercises||[]).forEach(ex => { const d=EX_DB[ex.name]; if(!d) return; const dt=new Date(s.date); d.muscles.forEach(m=>{if(!last[m]||dt>last[m]) last[m]=dt;}); }); });
  return last;
}
function getFatigue(m) {
  const last=getLastWorked(); if(!last[m]) return {level:'ready',pct:0,daysAgo:null,hoursLeft:0};
  const hoursAgo=(Date.now()-last[m].getTime())/3600000, recH=RECOVERY_H[m]||48;
  const pct=Math.max(0,1-hoursAgo/recH);
  const level=pct>0.6?'fatigued':pct>0.35?'moderate':pct>0.1?'light':'ready';
  return {level,pct:Math.round(pct*100),daysAgo:hoursAgo<24?'<1d ago':Math.floor(hoursAgo/24)+'d ago',hoursLeft:Math.round(Math.max(0,recH*pct))};
}
function fatigueColor(l){return{fatigued:'#6b7280',moderate:'#ef4444',light:'#f59e0b',ready:'#22c55e'}[l]||'#888';}
function fatigueLabel(l){return{fatigued:'Fatigued',moderate:'Recovering',light:'Lightly sore',ready:'Ready'}[l];}
function renderFatigueMap() {
  Object.keys(REC_IDS).forEach(m=>{const f=getFatigue(m),c=f.level==='ready'?'#252533':hexOp(fatigueColor(f.level),0.35+f.pct/100*0.65);REC_IDS[m].forEach(id=>{const el=document.getElementById(id);if(el) el.setAttribute('fill',c);});});
  const legend=document.getElementById('rec-legend'), active=Object.keys(RECOVERY_H).filter(m=>getFatigue(m).level!=='ready');
  legend.innerHTML=active.length?active.map(m=>{const f=getFatigue(m);return`<div class="legend-item"><div class="legend-dot" style="background:${fatigueColor(f.level)}"></div><div style="flex:1;text-transform:capitalize;color:${fatigueColor(f.level)};font-weight:500;font-size:11px">${m}</div><div style="font-size:10px;color:var(--text3)">${f.daysAgo}</div></div>`;}).join(''):'<div style="font-size:11px;color:var(--green);padding:8px 0">All muscles fully recovered!</div>';
}

// ══════ RECOMMENDATIONS ══════
function generateRecs() {
  const lastWorked=getLastWorked(), recentMuscles=new Set();
  sessions.slice(-2).forEach(s=>(s.exercises||[]).forEach(ex=>(EX_DB[ex.name]?.muscles||[]).forEach(m=>recentMuscles.add(m))));
  const scored=Object.entries(SESSION_TEMPLATES).map(([name,tmpl])=>{
    let score=0;
    tmpl.muscles.forEach(m=>{const f=getFatigue(m);score+={ready:10,light:6,moderate:2,fatigued:-5}[f.level]||0;if(!lastWorked[m]) score+=5;if(!recentMuscles.has(m)) score+=3;});
    return{name,...tmpl,score};
  }).sort((a,b)=>b.score-a.score);
  document.getElementById('rec-list').innerHTML=scored.slice(0,4).map(t=>{
    const tags=t.muscles.map(m=>{const f=getFatigue(m);return`<span class="rec-muscle-tag" style="background:${fatigueColor(f.level)}22;color:${fatigueColor(f.level)};border:1px solid ${fatigueColor(f.level)}55">${m}</span>`;}).join('');
    const rows=t.exs.slice(0,4).map(e=>{const pr=prs[e],prev=getLastW(e),rx=t.type==='strength'?(prev?`4×5 @ ${prev}kg`:'4×5'):t.type==='hypertrophy'?(prev?`3×12 @ ${Math.round((prev||0)*.7)}kg`:'3×12'):t.type==='recovery'?(prev?`2×15 @ ${Math.round((prev||0)*.5)}kg`:'2×15'):'3×10';return`<div class="rec-ex-row"><div class="vol-dot" style="background:${MCOLORS[EX_DB[e]?.primary]||'#888'}"></div><div class="rec-ex-name">${e}</div><div class="rec-ex-rx">${rx}</div>${pr?`<span class="rec-ex-pr">PR:${pr.weight}kg×${pr.reps}</span>`:''}</div>`;}).join('');
    return`<div class="rec-card type-${t.type}" onclick="loadRec('${t.name}')"><div class="rec-header"><div class="rec-title">${t.name}</div><span class="rec-badge badge-${t.type}">${t.type}</span></div><div class="rec-muscles">${tags}</div><div>${rows}</div><div style="font-size:10px;color:var(--text3);margin-top:7px">Tap to load ↗</div></div>`;
  }).join('');
  renderInsights(scored);
}
function renderInsights(scored) {
  const insights=[];
  const streak=calcStreak(); if(streak>0) insights.push({icon:'🔥',bg:'#e85d0422',title:`${streak}-day streak!`,desc:'Keep the momentum going.'});
  const fatigued=Object.keys(RECOVERY_H).filter(m=>getFatigue(m).level==='fatigued');
  if(fatigued.length) insights.push({icon:'⚠️',bg:'#dc262622',title:`${fatigued.join(', ')} need rest`,desc:`Avoid training for ${Math.max(...fatigued.map(m=>getFatigue(m).hoursLeft))} more hours.`});
  const ready=Object.keys(RECOVERY_H).filter(m=>getFatigue(m).level==='ready'&&getLastWorked()[m]);
  if(ready.length) insights.push({icon:'✅',bg:'#22c55e22',title:`${ready.slice(0,3).join(', ')} are ready`,desc:'Primed for a hard session.'});
  if(!sessions.length) insights.push({icon:'👋',bg:'#3b82f622',title:'Welcome to CR-FIT!',desc:'Log sessions to unlock personalised recommendations.'});
  else if(sessions.length<5) insights.push({icon:'📈',bg:'#a855f722',title:'Building your baseline',desc:`${5-sessions.length} more sessions needed.`});
  if(sessions.length){const daysOff=Math.floor((Date.now()-new Date(sessions[sessions.length-1].date).getTime())/86400000);if(daysOff>=3) insights.push({icon:'😴',bg:'#f59e0b22',title:`${daysOff} days since last session`,desc:'Muscles are recovered — time to train!'});}
  if(!insights.length) insights.push({icon:'💡',bg:'#6366f122',title:'Keep logging sessions',desc:'More data = smarter recommendations.'});
  document.getElementById('insights-list').innerHTML=insights.map(i=>`<div class="insight-row"><div class="insight-icon" style="background:${i.bg}">${i.icon}</div><div><div class="insight-title">${i.title}</div><div class="insight-desc">${i.desc}</div></div></div>`).join('');
}
function loadRec(name) {
  const tmpl=SESSION_TEMPLATES[name]; if(!tmpl) return;
  showPage('log',document.querySelectorAll('.nav-tab')[1]);
  document.getElementById('log-name').value=name;
  exercises=[];exCount=0;document.getElementById('ex-list').innerHTML='';
  tmpl.exs.forEach(n=>addExercise(n)); notify('Loaded: '+name);
}
function getLastW(name) {
  for(let i=sessions.length-1;i>=0;i--){const s=sessions[i];if(!s.exercises) continue;const ex=s.exercises.find(e=>e.name===name);if(ex&&ex.sets&&ex.sets[0]?.weight) return ex.sets[0].weight;}
  return null;
}

// ══════ EXERCISES ══════
function addExercise(nameOverride) {
  const id=++exCount, el=document.createElement('div'); el.className='exercise-item'; el.id='ex-'+id;
  const opts=Object.keys(EX_DB).map(n=>`<option${nameOverride===n?' selected':''}>${n}</option>`).join('');
  const prevW=nameOverride?getLastW(nameOverride):'';
  el.innerHTML=`<div class="exercise-header"><select id="exn-${id}" style="flex:1;background:var(--bg4)" onchange="updateLogMap()">${opts}</select><span id="epb-${id}"></span><button class="btn-small" style="color:#f87171;border-color:#f8717133" onclick="removeEx(${id})">✕</button></div><div id="sets-${id}"></div><div style="display:flex;gap:6px;margin-top:6px"><button class="btn-small" onclick="addSet(${id})">+ Set</button><button class="btn-small" onclick="addSet(${id},true)">+ Warmup</button></div>`;
  const list=document.getElementById('ex-list'); if(list.querySelector('.empty-state')) list.innerHTML='';
  list.appendChild(el); exercises.push({id,sets:[]});
  addSet(id,false,prevW); addSet(id,false,prevW); addSet(id,false,prevW); updateLogMap();
}
function addSet(exId,warmup=false,weight='') {
  const ex=exercises.find(e=>e.id===exId); if(!ex) return;
  const num=ex.sets.filter(s=>!s.warmup).length+1; ex.sets.push({warmup});
  const container=document.getElementById('sets-'+exId), row=document.createElement('div'); row.className='set-row';
  row.innerHTML=`<div class="set-num" style="${warmup?'background:#f59e0b33;color:#f59e0b':''}">${warmup?'W':num}</div><input class="set-input" type="number" placeholder="kg" value="${weight||''}" style="width:54px"><input class="set-input" type="number" placeholder="reps" style="width:50px"><button class="set-done" onclick="toggleDone(this)"></button>`;
  container.appendChild(row);
}
function toggleDone(btn) {
  btn.classList.toggle('completed');
  if(btn.classList.contains('completed')){btn.textContent='✓';checkPR(btn);startTimer();}else btn.textContent='';
}
function checkPR(btn) {
  const row=btn.closest('.set-row'),item=row.closest('.exercise-item'),name=item.querySelector('select').value;
  const inputs=row.querySelectorAll('input'),w=parseFloat(inputs[0].value)||0,r=parseInt(inputs[1].value)||0;
  if(!w||!r) return;
  const e1rm=Math.round(w*(1+r/30)*10)/10;
  if(!prs[name]||e1rm>prs[name].e1rm){prs[name]={weight:w,reps:r,e1rm,date:document.getElementById('log-date').value};localStorage.setItem('crfit_prs',JSON.stringify(prs));const badge=item.querySelector('[id^="epb-"]');if(badge) badge.innerHTML='<span class="pr-badge">🏆 PR!</span>';notify('🏆 PR: '+name+' '+w+'kg×'+r);}
}
function removeEx(id) {
  exercises=exercises.filter(e=>e.id!==id);document.getElementById('ex-'+id)?.remove();
  if(!exercises.length) document.getElementById('ex-list').innerHTML='<div class="empty-state">No exercises.</div>';
  updateLogMap();
}
function updateLogMap() {
  const mv={};
  document.querySelectorAll('[id^="exn-"]').forEach(s=>{const d=EX_DB[s.value];if(d) d.muscles.forEach(m=>{mv[m]=(mv[m]||0)+1;});});
  Object.values(LOG_IDS).flat().forEach(id=>{const el=document.getElementById(id);if(el) el.setAttribute('fill','#252533');});
  Object.entries(mv).forEach(([m,v])=>{const ids=LOG_IDS[m];if(!ids) return;ids.forEach(id=>{const el=document.getElementById(id);if(el) el.setAttribute('fill',hexOp(MCOLORS[m],Math.min(0.3+v*0.25,1)));});});
  const legend=document.getElementById('log-legend'),active=Object.entries(mv).sort((a,b)=>b[1]-a[1]);
  legend.innerHTML=active.length?active.map(([m])=>`<div style="display:flex;align-items:center;gap:5px;font-size:11px"><div style="width:7px;height:7px;border-radius:50%;background:${MCOLORS[m]};flex-shrink:0"></div><span style="text-transform:capitalize;color:${MCOLORS[m]};font-weight:500">${m}</span></div>`).join(''):'<div class="empty-state" style="font-size:11px;padding:4px">Add exercises</div>';
}

// ══════ PICKER ══════
function showPicker(){document.getElementById('picker-overlay').classList.add('open');const cats=['All',...new Set(Object.values(EX_DB).map(e=>e.cat))];document.getElementById('picker-cats').innerHTML=cats.map(c=>`<button class="btn-small" onclick="filterPickerCat('${c}',this)" style="${c==='All'?'border-color:var(--accent);color:var(--accent)':''}">${c}</button>`).join('');renderPicker('','All');}
function closePicker(){document.getElementById('picker-overlay').classList.remove('open');}
function renderPicker(q,cat){const list=document.getElementById('picker-list'),entries=Object.entries(EX_DB).filter(([n,d])=>n.toLowerCase().includes(q.toLowerCase())&&(cat==='All'||d.cat===cat));list.innerHTML=entries.map(([n,d])=>{const pr=prs[n];return`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg3);border-radius:6px;cursor:pointer" onclick="addFromPicker('${n}')"><div style="width:7px;height:7px;border-radius:50%;background:${MCOLORS[d.primary]||'#888'};flex-shrink:0"></div><div style="flex:1"><div style="font-size:13px;font-weight:500">${n}</div><div style="font-size:10px;color:var(--text2)">${d.muscles.join(' · ')}</div></div>${pr?`<div style="font-size:10px;color:#c084fc">PR:${pr.weight}kg×${pr.reps}</div>`:''}<button class="btn-small">+ Add</button></div>`;}).join('')||'<div class="empty-state">No results.</div>';}
function filterPicker(v){const cat=document.querySelector('#picker-cats .btn-small[style*="accent"]')?.textContent||'All';renderPicker(v,cat);}
function filterPickerCat(cat,btn){document.querySelectorAll('#picker-cats .btn-small').forEach(b=>{b.style.borderColor='';b.style.color='';}); btn.style.borderColor='var(--accent)';btn.style.color='var(--accent)';renderPicker(document.getElementById('picker-search').value,cat);}
function addFromPicker(name){addExercise(name);closePicker();notify('Added: '+name);}

// ══════ TIMER ══════
function setTimer(s){clearInterval(timerInt);timerInt=null;timerRem=s;timerTotal=s;document.getElementById('timer-disp').className='timer-display';document.getElementById('timer-disp').textContent=fmt(s);document.getElementById('timer-btn').textContent='▶ Start';document.getElementById('timer-bar').style.width='100%';document.querySelectorAll('.timer-preset').forEach(b=>b.classList.remove('ap'));}
function startTimer(){if(timerInt){clearInterval(timerInt);timerInt=null;document.getElementById('timer-btn').textContent='▶ Start';document.getElementById('timer-disp').className='timer-display';return;}document.getElementById('timer-btn').textContent='⏸ Pause';document.getElementById('timer-disp').className='timer-display running';timerInt=setInterval(()=>{timerRem--;document.getElementById('timer-disp').textContent=fmt(timerRem);document.getElementById('timer-bar').style.width=Math.round(timerRem/timerTotal*100)+'%';if(timerRem<=0){clearInterval(timerInt);timerInt=null;document.getElementById('timer-disp').className='timer-display done';document.getElementById('timer-disp').textContent='Done!';document.getElementById('timer-btn').textContent='▶ Start';}},1000);}
function resetTimer(){clearInterval(timerInt);timerInt=null;timerRem=timerTotal;document.getElementById('timer-disp').className='timer-display';document.getElementById('timer-disp').textContent=fmt(timerTotal);document.getElementById('timer-btn').textContent='▶ Start';document.getElementById('timer-bar').style.width='100%';}
function fmt(s){return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60);}
function toggleCardio(){const s=document.getElementById('cardio-section');s.style.display=s.style.display!=='none'?'none':'block';}

// ══════ SAVE SESSION ══════
function saveSession(){
  const date=document.getElementById('log-date').value,name=document.getElementById('log-name').value||'Workout';
  const exData=[];let totalVol=0;
  document.querySelectorAll('[id^="exn-"]').forEach(sel=>{const exId=sel.id.split('-')[1],setsData=[];document.querySelectorAll(`#sets-${exId} .set-row`).forEach(row=>{const inputs=row.querySelectorAll('input'),w=parseFloat(inputs[0].value)||0,r=parseInt(inputs[1].value)||0;setsData.push({weight:w,reps:r,done:row.querySelector('.set-done')?.classList.contains('completed')});totalVol+=w*r;});exData.push({name:sel.value,sets:setsData});});
  const cardioVis=document.getElementById('cardio-section').style.display!=='none';
  const cardio=cardioVis?{type:document.getElementById('c-type').value,duration:parseInt(document.getElementById('c-dur').value)||0,distance:parseFloat(document.getElementById('c-dist').value)||0,calories:parseInt(document.getElementById('c-cal').value)||0}:null;
  const session={date,name,duration:parseInt(document.getElementById('log-dur').value)||0,energy:parseInt(document.getElementById('log-energy').value)||0,soreness:parseInt(document.getElementById('log-sore').value)||0,notes:document.getElementById('log-notes').value,exercises:exData,cardio,totalVolume:Math.round(totalVol)};
  sessions.push(session); localStorage.setItem('crfit_sessions',JSON.stringify(sessions));
  notify('✓ Session saved: '+name);
  syncToSheets(session);
  renderStats(); renderFatigueMap(); generateRecs();
}

// ══════ FATIGUE PAGE ══════
function renderFatiguePage(){
  document.getElementById('fatigue-tiles').innerHTML=Object.keys(RECOVERY_H).map(m=>{const f=getFatigue(m),c=fatigueColor(f.level);return`<div class="muscle-tile" style="border-color:${f.level!=='ready'?c+'66':'var(--border)'}"><div style="position:absolute;inset:0;background:${c};opacity:${f.level==='ready'?0:.06};border-radius:8px"></div><div class="muscle-tile-name" style="color:${f.level!=='ready'?c:'var(--text)'}">${m}</div><div class="muscle-tile-status" style="color:${c}">${fatigueLabel(f.level)}</div><div class="fatigue-bar"><div class="fatigue-fill" style="width:${f.pct}%;background:${c}"></div></div><div style="font-size:9px;color:var(--text3);margin-top:3px">${f.daysAgo?'Last: '+f.daysAgo:'Never'} · ${RECOVERY_H[m]}h</div></div>`;}).join('');
  document.getElementById('rec-timeline').innerHTML=Object.entries(RECOVERY_H).map(([m,h])=>{const f=getFatigue(m);return`<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid var(--border)"><div style="width:86px;font-size:12px;font-weight:500;text-transform:capitalize;color:${f.level==='ready'?'var(--text)':fatigueColor(f.level)}">${m}</div><div style="flex:1;height:4px;background:var(--bg5);border-radius:2px;overflow:hidden"><div style="height:100%;width:${100-Math.min(100,f.pct)}%;background:${fatigueColor(f.level)};border-radius:2px"></div></div><div style="font-size:11px;color:${f.level==='ready'?'var(--green)':'var(--text2)'};width:58px;text-align:right">${f.level==='ready'?'Ready':'~'+f.hoursLeft+'h'}</div></div>`;}).sort((a,b)=>a.localeCompare(b)).join('');
  const today=new Date();const cells=[];for(let i=27;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const ds=d.toISOString().split('T')[0];const cnt=sessions.filter(s=>s.date===ds).length;cells.push({ds,cnt});}
  document.getElementById('heatmap').innerHTML=`<div class="heatmap-grid">${cells.map(c=>`<div class="heatmap-cell" title="${c.ds}: ${c.cnt}" style="background:${c.cnt===0?'var(--bg4)':c.cnt===1?'#e85d0466':'#e85d04'}"></div>`).join('')}</div><div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--text3)"><span>28d ago</span><span>Today</span></div>`;
}

// ══════ HISTORY ══════
function renderHistory(){
  const list=document.getElementById('history-list');if(!sessions.length){list.innerHTML='<div class="empty-state">No sessions yet.</div>';return;}
  list.innerHTML=[...sessions].reverse().map(s=>{const tags=(s.exercises||[]).map(e=>`<span class="tag">${e.name}</span>`).join('');return`<div class="session-item"><div style="display:flex;justify-content:space-between"><div style="font-weight:600">${s.date} · ${s.name}</div><div style="font-size:12px;color:var(--accent)">Vol: ${s.totalVolume}kg</div></div><div style="font-size:11px;color:var(--text2);margin-top:2px">${s.duration?s.duration+'min · ':''} ${(s.exercises||[]).length} exercises${s.energy?' · Energy: '+s.energy+'/10':''}</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${tags}</div>${s.notes?`<div style="font-size:11px;color:var(--text2);margin-top:4px;font-style:italic">"${s.notes}"</div>`:''}</div>`;}).join('');
}

// ══════ PROGRESS ══════
function renderStats(){document.getElementById('st-s').textContent=sessions.length;const vol=sessions.reduce((a,s)=>a+(s.totalVolume||0),0);document.getElementById('st-v').textContent=vol>999?Math.round(vol/1000)+'k':vol;document.getElementById('st-k').textContent=calcStreak();document.getElementById('st-p').textContent=Object.keys(prs).length;}
function calcStreak(){if(!sessions.length) return 0;const dates=[...new Set(sessions.map(s=>s.date))].sort().reverse();let streak=0,d=new Date().toISOString().split('T')[0];for(const dd of dates){if(dd===d){streak++;const dt=new Date(d);dt.setDate(dt.getDate()-1);d=dt.toISOString().split('T')[0];}else break;}return streak;}
function getWeekKey(d){const dt=new Date(d);const m=new Date(dt);m.setDate(dt.getDate()-dt.getDay()+1);return m.toISOString().split('T')[0];}
function showPTab(t,btn){['volume','prs','freq'].forEach(x=>document.getElementById('ptab-'+x).style.display=x===t?'block':'none');document.querySelectorAll('.inner-tab').forEach(el=>el.classList.remove('active'));btn.classList.add('active');if(t==='volume') renderVolChart();if(t==='prs') renderPRList();if(t==='freq') renderFreqChart();}
function renderVolChart(){const weeks={};sessions.forEach(s=>{const w=getWeekKey(s.date);weeks[w]=(weeks[w]||0)+(s.totalVolume||0);});const labels=Object.keys(weeks).sort().slice(-8),data=labels.map(l=>weeks[l]);const ctx=document.getElementById('vol-chart').getContext('2d');if(volChart) volChart.destroy();volChart=new Chart(ctx,{type:'bar',data:{labels,datasets:[{data,backgroundColor:'#e85d0488',borderColor:'#e85d04',borderWidth:1.5,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#22223a'},ticks:{color:'#9998aa',font:{size:10}}},y:{grid:{color:'#22223a'},ticks:{color:'#9998aa',font:{size:10}}}}}});}
function renderFreqChart(){const weeks={};sessions.forEach(s=>{const w=getWeekKey(s.date);weeks[w]=(weeks[w]||0)+1;});const labels=Object.keys(weeks).sort().slice(-8),data=labels.map(l=>weeks[l]);const ctx=document.getElementById('freq-chart').getContext('2d');if(freqChart) freqChart.destroy();freqChart=new Chart(ctx,{type:'line',data:{labels,datasets:[{data,borderColor:'#3b82f6',backgroundColor:'#3b82f622',fill:true,tension:.4,pointRadius:4,pointBackgroundColor:'#3b82f6'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#22223a'},ticks:{color:'#9998aa',font:{size:10}}},y:{grid:{color:'#22223a'},ticks:{color:'#9998aa',font:{size:10},stepSize:1}}}}});}
function renderPRList(){const list=document.getElementById('pr-list');const entries=Object.entries(prs);if(!entries.length){list.innerHTML='<div class="empty-state">No PRs yet.</div>';return;}list.innerHTML=entries.sort((a,b)=>b[1].e1rm-a[1].e1rm).map(([name,pr])=>`<div class="bw-row"><div style="flex:1;font-weight:600">${name}</div><div style="color:var(--accent);font-weight:600;margin-right:12px">${pr.weight}kg×${pr.reps}</div><div style="color:var(--text2);font-size:11px">e1RM: ${pr.e1rm}kg</div><div style="color:var(--text3);font-size:10px;margin-left:8px">${pr.date}</div></div>`).join('');}

// ══════ BODY ══════
function logBW(){const d=document.getElementById('bw-date').value,w=parseFloat(document.getElementById('bw-w').value);if(!w){notify('Enter a weight value');return;}bws.push({date:d,weight:w,fat:parseFloat(document.getElementById('bw-fat').value)||null,note:document.getElementById('bw-note').value});bws.sort((a,b)=>a.date.localeCompare(b.date));localStorage.setItem('crfit_bw',JSON.stringify(bws));notify('✓ Logged: '+w+'kg');renderBWChart();}
function renderBWChart(){if(!bws.length) return;document.getElementById('bw-hist').innerHTML=[...bws].reverse().map((e,i,arr)=>{const prev=arr[i+1];const diff=prev?Math.round((e.weight-prev.weight)*10)/10:0;const ds=diff?`<span style="color:${diff>0?'#f87171':'var(--green)};font-size:11px;font-weight:600">${diff>0?'+':''}${diff}kg</span>`:'';return`<div class="bw-row"><div style="width:88px;color:var(--text2)">${e.date}</div><div style="font-weight:600;margin-right:8px">${e.weight}kg</div>${ds}${e.fat?`<div style="color:var(--text2);margin-left:8px">${e.fat}% BF</div>`:''}<div style="flex:1;color:var(--text2);text-align:right;font-style:italic;font-size:11px">${e.note||''}</div></div>`;}).join('');const ctx=document.getElementById('bw-chart').getContext('2d');if(bwChart) bwChart.destroy();bwChart=new Chart(ctx,{type:'line',data:{labels:bws.map(e=>e.date),datasets:[{data:bws.map(e=>e.weight),borderColor:'#22c55e',backgroundColor:'#22c55e22',fill:true,tension:.4,pointRadius:3,pointBackgroundColor:'#22c55e'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#22223a'},ticks:{color:'#9998aa',font:{size:10}}},y:{grid:{color:'#22223a'},ticks:{color:'#9998aa',font:{size:10}}}}}});}

// ══════ EXPORT ══════
function exportCSV(){if(!sessions.length){notify('No sessions to export');return;}const rows=[['Date','Name','Duration','Energy','Soreness','Volume','Notes','Exercises']];sessions.forEach(s=>rows.push([s.date,s.name,s.duration,s.energy,s.soreness,s.totalVolume,s.notes,(s.exercises||[]).map(e=>e.name).join(' | ')]));const csv=rows.map(r=>r.map(v=>'"'+(String(v||'').replace(/"/g,'""'))+'"').join(',')).join('\n');const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='crfit_sessions.csv';a.click();notify('✓ Exported!');}
function exportJSON(){const backup={sessions,prs,bws,exported:new Date().toISOString()};const a=document.createElement('a');a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(backup,null,2));a.download='crfit_backup.json';a.click();notify('✓ Backup exported!');}
function clearAllData(){if(confirm('Delete ALL data? This cannot be undone.')){localStorage.removeItem('crfit_sessions');localStorage.removeItem('crfit_prs');localStorage.removeItem('crfit_bw');sessions=[];prs={};bws=[];renderStats();notify('All data cleared.');}}

// ══════ HELPERS ══════
function hexOp(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}
function notify(msg,type='success'){const n=document.getElementById('notif');n.textContent=msg;n.style.background=type==='error'?'#dc2626':'var(--green)';n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2800);}

// ══════ PAGE NAV ══════
function showPage(p,btn){
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el=>el.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
  if(btn) btn.classList.add('active');
  if(p==='recommend'){renderFatigueMap();generateRecs();}
  if(p==='history') renderHistory();
  if(p==='fatigue') renderFatiguePage();
  if(p==='progress'){renderStats();renderVolChart();}
  if(p==='body') renderBWChart();
  if(p==='settings') loadSettings();
}

// ══════ INIT ══════
document.getElementById('log-date').value=new Date().toISOString().split('T')[0];
document.getElementById('bw-date').value=new Date().toISOString().split('T')[0];
renderFatigueMap(); generateRecs(); renderStats();
