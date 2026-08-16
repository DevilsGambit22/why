const CLUB='and-chess-for-all-official', OWNER='devilsgambit22', API='https://api.chess.com/pub';
const CLUB_API=`${API}/club/${CLUB}`;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fallback='assets/acfa-logo.jpg';

/* ---------- CLOCK + GREETING ---------- */
function clock(){
  const d=new Date(),h=d.getHours();
  $('#clock').textContent=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit',second:'2-digit'});
  $('#date').textContent=d.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
  $('#greeting').textContent=h<5?'Welcome, Night Owls':h<12?'Good Morning':h<17?'Good Afternoon':h<21?'Good Evening':'Welcome, Night Owls';
}
clock();setInterval(clock,1000);

/* ---------- CLUB LIFE ---------- */
let founded=new Date(2026,4,12);
function life(){
  const now=new Date(),day=Math.max(1,Math.floor((now-founded)/86400000)+1);
  $('#daysTogether').textContent=day;$('#clubDay').textContent=day;
  let last=new Date(now.getFullYear(),founded.getMonth(),founded.getDate());
  if(now<last)last=new Date(now.getFullYear()-1,founded.getMonth(),founded.getDate());
  const next=new Date(last.getFullYear()+1,founded.getMonth(),founded.getDate());
  const pct=Math.max(0,Math.min(100,(now-last)/(next-last)*100));
  $('#anniversaryProgress').style.width=pct+'%';
  $('#lifeDetail').textContent=`Club Year ${last.getFullYear()-founded.getFullYear()+1} • ${Math.round(pct)}% toward the next anniversary`;
}
life();

/* ---------- DAILY QUOTE ---------- */
const quotes=[['The blunders are all there on the board, waiting to be made.','Savielly Tartakower'],['When you see a good move, look for a better one.','Emanuel Lasker'],['Chess is the gymnasium of the mind.','Blaise Pascal'],['Every chess master was once a beginner.','Irving Chernev'],['The beauty of a move lies not in its appearance but in the thought behind it.','Aron Nimzowitsch'],['Chess demands total concentration.','Bobby Fischer'],['Play the opening like a book, the middlegame like a magician, and the endgame like a machine.','Rudolf Spielmann']];
const q=quotes[Math.floor(new Date().setHours(0,0,0,0)/86400000)%quotes.length];
$('#quoteText').textContent='“'+q[0]+'”';$('#quoteAuthor').textContent='— '+q[1];

/* ---------- RULES MARQUEE ---------- */
const rules=[['01 — BE RESPECTFUL','Treat all members with kindness and respect. No harassment, bullying, discrimination, hate speech, or personal attacks.'],['02 — KEEP DISCUSSIONS FRIENDLY','Healthy discussion is encouraged. No trolling, excessive arguments, flame wars, or intentional provocation.'],['03 — FAIR PLAY','Follow all Chess.com Fair Play policies. No cheating, engine use, rating manipulation, or encouragement of unfair play.'],['04 — APPROPRIATE CONTENT','Keep posts, comments, and chat appropriate for players of all ages. No offensive or abusive language, NSFW content, graphic material, illegal content, or spam.'],['05 — ADVERTISING','Keep advertisements, promotions, club invitations, stream announcements, and other promotional content inside the approved Advertisement Forum.'],['06 — CHESS.COM POLICIES','Chess.com Community Guidelines and Terms of Service apply throughout ACFA.'],['07 — GOOD SPORTSMANSHIP','Win with humility. Lose with grace. Treat opponents and teammates with respect before, during, and after games.'],['08 — EVENTS','Members are encouraged to participate in Community Matches, Arenas, Swiss tournaments, Vote Chess, and livestream events. Participation is optional but appreciated.'],['09 — RESPECT THE STAFF','Administrators volunteer their time to help the community. Respect moderator decisions and contact an administrator privately if you disagree with an action.'],['10 — HAVE FUN','Meet new players. Learn something new. Support one another. Most importantly — enjoy chess!'],['⚖ ENFORCEMENT','Violations may result in a Friendly Reminder, Official Warning, Content Removal, Temporary Mute, Temporary Removal, or Permanent Ban. Serious violations may result in immediate removal without warning.'],['EVERY PLAYER BELONGS','Every Move Matters. Thank you for helping make ACFA a welcoming home for chess players around the world.']];
$('#rulesTrack').innerHTML=[...rules,...rules].map(r=>`<div class="rule"><b>${r[0]}</b><p>${r[1]}</p></div>`).join('');
$('.rules-window').addEventListener('click',e=>e.currentTarget.classList.toggle('paused'));

/* ---------- GENUINE NUMBER MATRIX ---------- */
(function numberMatrix(){
  const canvas=document.getElementById('matrixCanvas');
  const host=document.getElementById('matrixBoard');
  if(!canvas||!host)return;
  const ctx=canvas.getContext('2d');
  const fontSize=13;
  let width=0,height=0,columns=0,drops=[],last=0;
  function size(){
    const r=host.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    width=Math.max(1,Math.floor(r.width));height=Math.max(1,Math.floor(r.height));
    canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);
    canvas.style.width=width+'px';canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    columns=Math.ceil(width/fontSize);
    drops=Array.from({length:columns},()=>Math.floor(Math.random()*-24));
  }
  function frame(t){
    if(t-last>52){
      last=t;
      ctx.fillStyle='rgba(1,7,14,.16)';ctx.fillRect(0,0,width,height);
      ctx.font=`700 ${fontSize}px ui-monospace,SFMono-Regular,Consolas,monospace`;
      ctx.textAlign='center';
      for(let i=0;i<columns;i++){
        const digit=Math.random()<.5?'0':'1';
        const x=i*fontSize+fontSize/2,y=drops[i]*fontSize;
        const accent=i%9===0?'#f5d96b':i%7===0?'#63e88c':'#63d7ff';
        ctx.shadowBlur=10;ctx.shadowColor=accent;ctx.fillStyle=accent;
        ctx.fillText(digit,x,y);
        if(y>height && Math.random()>.965)drops[i]=Math.floor(Math.random()*-16);else drops[i]++;
      }
      ctx.shadowBlur=0;
    }
    requestAnimationFrame(frame);
  }
  size();window.addEventListener('resize',size,{passive:true});requestAnimationFrame(frame);
})();

/* ---------- TABS ---------- */
$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.panel').forEach(x=>x.classList.remove('active-panel'));$('#'+b.dataset.tab).classList.add('active-panel')});

/* ---------- PUBAPI HELPERS ----------
   Chess.com documents serial access as the safest pattern. Cache public responses
   locally to reduce duplicate requests and avoid unnecessary 429s. */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function getJSON(url,{ttl=15*60*1000}={}){
  const key='acfa:'+url;
  try{const old=JSON.parse(localStorage.getItem(key)||'null');if(old&&Date.now()-old.t<ttl)return old.v}catch{}
  const r=await fetch(url,{headers:{Accept:'application/json'}});
  if(!r.ok)throw Error(`${r.status} ${url}`);
  const v=await r.json();
  try{localStorage.setItem(key,JSON.stringify({t:Date.now(),v}))}catch{}
  return v;
}
async function serialMap(items,fn,delay=80){const out=[];for(const item of items){out.push(await fn(item));if(delay)await sleep(delay)}return out}
function ratingPairs(stats){
  const names={chess_daily:'Daily',chess_rapid:'Rapid',chess_blitz:'Blitz',chess_bullet:'Bullet',chess960_daily:'Chess960'};
  return Object.entries(names).map(([k,n])=>{
    const obj=stats?.[k],rating=obj?.last?.rating;
    return [n,rating];
  }).filter(x=>Number.isFinite(x[1])).sort((a,b)=>b[1]-a[1]);
}
function highest(stats){return ratingPairs(stats)[0]?.[1]||null}
function ago(ts){if(!ts)return 'Joined date unavailable';const s=Math.max(1,Math.floor(Date.now()/1000-ts)),u=[[31536000,'year'],[2592000,'month'],[86400,'day'],[3600,'hour'],[60,'minute']].find(x=>s>=x[0])||[1,'second'];const n=Math.floor(s/u[0]);return `Joined ${n} ${u[1]}${n!==1?'s':''} ago`}

/* ---------- CLUB PROFILE ---------- */
async function loadClubProfile(){
  try{
    const p=await getJSON(CLUB_API,{ttl:60*60*1000});
    if(Number.isFinite(p.members_count))$('#memberCount').textContent=p.members_count;
    if(p.created){const apiCreated=new Date(p.created*1000);if(!Number.isNaN(apiCreated.valueOf())){founded=apiCreated;life()}}
  }catch(e){console.warn('club profile unavailable',e)}
}
loadClubProfile();

/* ---------- NEWEST MEMBERS + TITLED MEMBERS ---------- */
let membersCache=[];
async function enrich(m){
  try{
    const p=await getJSON(`${API}/player/${encodeURIComponent(m.username)}`,{ttl:60*60*1000});
    await sleep(70);
    const s=await getJSON(`${API}/player/${encodeURIComponent(m.username)}/stats`,{ttl:60*60*1000});
    return {...m,...p,club_joined:m.joined,_rating:highest(s),_ratings:ratingPairs(s)};
  }catch{return {...m,club_joined:m.joined,_rating:null,_ratings:[]}}
}
async function loadMembers(){
  try{
    const data=await getJSON(`${CLUB_API}/members`,{ttl:12*60*60*1000});
    const raw=[...(data.weekly||[]),...(data.monthly||[]),...(data.all_time||[])];
    const map=new Map(raw.map(m=>[m.username.toLowerCase(),m]));
    membersCache=[...map.values()].sort((a,b)=>(b.joined||0)-(a.joined||0));
    if($('#memberCount').textContent==='—')$('#memberCount').textContent=membersCache.length||'—';

    const newest=await serialMap(membersCache.slice(0,8),enrich,80);
    renderPeople($('#newestList'),newest,true);

    // The club-members endpoint does not include titles. Intersect the club roster
    // with Chess.com's official title lists instead of fetching every member profile.
    const titleCodes=['GM','WGM','IM','WIM','FM','WFM','NM','WNM','CM','WCM'];
    const memberLookup=new Map(membersCache.map(m=>[m.username.toLowerCase(),m]));
    const titledFound=new Map();
    for(const title of titleCodes){
      try{
        const td=await getJSON(`${API}/titled/${title}`,{ttl:12*60*60*1000});
        for(const username of td.players||[]){
          const member=memberLookup.get(username.toLowerCase());
          if(member)titledFound.set(username.toLowerCase(),{...member,title});
        }
      }catch(e){console.warn('title list unavailable',title,e)}
      await sleep(90);
    }
    const titledBase=[...titledFound.values()].sort((a,b)=>a.title.localeCompare(b.title)||a.username.localeCompare(b.username));
    $('#titledCount').textContent=titledBase.length;
    const titled=await serialMap(titledBase.slice(0,30),enrich,80);
    renderPeople($('#titledList'),titled,false);
  }catch(e){
    $('#newestList').innerHTML='<div class="loading">Chess.com member data is temporarily unavailable.</div>';
    $('#titledList').innerHTML='<div class="loading">Chess.com titled-member data is temporarily unavailable.</div>';
    console.warn(e);
  }
}
function renderPeople(el,arr,newest){el.innerHTML=arr.length?arr.map(p=>`<a class="person" href="https://www.chess.com/member/${encodeURIComponent(p.username)}" target="_blank" rel="noopener"><img src="${p.avatar||fallback}" onerror="this.src='${fallback}'"><div><b>${p.title?`<span class="title-badge">${p.title}</span>`:''}${p.username}</b><small>${newest?ago(p.club_joined):(p.name||'ACFA titled member')}</small></div><span class="rating">${p._rating??'—'}</span></a>`).join(''):'<div class="loading">No players found.</div>'}
loadMembers();

/* ---------- OWNER ---------- */
async function loadOwner(){
  try{
    const p=await getJSON(`${API}/player/${OWNER}`,{ttl:60*60*1000});await sleep(80);
    const s=await getJSON(`${API}/player/${OWNER}/stats`,{ttl:60*60*1000});
    const pairs=ratingPairs(s),hi=pairs[0]?.[1]||'—';
    $('#ownerAvatar').src=p.avatar||fallback;$('#modalAvatar').src=p.avatar||fallback;
    $('#ownerRating').textContent='Top current rating: '+hi;
    $('#ownerRatings').innerHTML=pairs.map(x=>`<div>${x[0]}<b>${x[1]}</b></div>`).join('');
  }catch(e){console.warn(e)}
}
loadOwner();
function openOwner(){$('#ownerModal').classList.add('open');$('#ownerModal').setAttribute('aria-hidden','false')}
$('#ownerCard').onclick=openOwner;$('#ownerCard').onkeydown=e=>{if(e.key==='Enter'||e.key===' ')openOwner()};
$('#closeModal').onclick=()=>{$('#ownerModal').classList.remove('open');$('#ownerModal').setAttribute('aria-hidden','true')};
$('#ownerModal').onclick=e=>{if(e.target.id==='ownerModal'){$('#ownerModal').classList.remove('open');$('#ownerModal').setAttribute('aria-hidden','true')}};

/* ---------- CLUB COMPETITIVE RECORD ----------
   Official Chess.com PubAPI discovery endpoint:
   /pub/club/{club}/matches

   IMPORTANT: always follow each returned @id. Daily Team Matches resolve under
   /pub/match/{id}; Live Team Matches resolve under /pub/match/live/{id}.
   The match object itself contains team scores/results, so board endpoints are not
   needed for W/D/L aggregation. Chess960 and other rules supported by team matches
   remain inside the same match objects via settings.rules.

   Vote Chess is NOT currently documented as a PubAPI endpoint. It is therefore not
   scraped or guessed here; doing so would make the record unreliable. */
function classifyMatch(item,m){
  const id=String(item?.['@id']||m?.['@id']||'').toLowerCase();
  if(id.includes('/match/live/'))return 'Live Team';
  if(String(m?.settings?.time_class||item?.time_class||'').toLowerCase()==='daily')return 'Daily Team';
  return 'Team Match';
}
function normalizeTeamMatch(m,item){
  if(!m||m.status!=='finished')return null;
  const teams=Object.values(m.teams||{});
  if(teams.length<2)return null;
  const ours=teams.find(v=>String(v?.['@id']||v?.url||'').toLowerCase().includes(`/club/${CLUB}`));
  if(!ours)return null;
  const other=teams.find(v=>v!==ours);if(!other)return null;
  let result=String(ours.result||'').toLowerCase();
  if(result==='lose')result='loss';
  if(!['win','loss','draw'].includes(result)){
    const a=Number(ours.score),b=Number(other.score);
    if(!Number.isFinite(a)||!Number.isFinite(b))return null;
    result=a>b?'win':a<b?'loss':'draw';
  }
  return {id:m['@id']||item?.['@id']||m.url||m.name,result,format:classifyMatch(item,m),rules:m?.settings?.rules||'chess'};
}
async function loadTeamMatchFeed(){
  const feed=await getJSON(`${CLUB_API}/matches`,{ttl:15*60*1000});
  const items=[...(feed.finished||[])],rows=[];
  for(const item of items){
    const endpoint=item['@id'];
    if(!endpoint)continue;
    try{
      const m=await getJSON(endpoint.replace(/^http:/,'https:'),{ttl:24*60*60*1000});
      const row=normalizeTeamMatch(m,item);if(row)rows.push(row);
    }catch(e){console.warn('team match skipped',endpoint,e)}
    await sleep(85);
  }
  return rows;
}
async function loadRecord(){
  const status=$('#recordStatus');status.textContent='Refreshing Chess.com team-match record…';
  try{
    const rows=await loadTeamMatchFeed();
    const unique=[...new Map(rows.map(x=>[x.id,x])).values()];
    const w=unique.filter(x=>x.result==='win').length,d=unique.filter(x=>x.result==='draw').length,l=unique.filter(x=>x.result==='loss').length,t=unique.length;
    $('#wins').textContent=w;$('#draws').textContent=d;$('#losses').textContent=l;$('#completedEvents').textContent=t;
    const pct=n=>t?100*n/t:0;$('.wins').style.width=pct(w)+'%';$('.draws').style.width=pct(d)+'%';$('.losses').style.width=pct(l)+'%';

    const formats=['Daily Team','Live Team','Team Match'];
    const lines=[];
    for(const f of formats){const a=unique.filter(x=>x.format===f);if(!a.length)continue;lines.push(`${f}: ${a.filter(x=>x.result==='win').length}W · ${a.filter(x=>x.result==='draw').length}D · ${a.filter(x=>x.result==='loss').length}L`)}
    const variants=unique.filter(x=>x.rules&&x.rules!=='chess');
    if(variants.length)lines.push(`Variants included: ${[...new Set(variants.map(x=>x.rules))].join(', ')}`);
    $('#formatBreakdown').innerHTML=lines.map(x=>`<div>${x}</div>`).join('');
    status.textContent=t?`Refreshed ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`:'No completed team matches were returned by Chess.com.';
  }catch(e){
    status.textContent='Chess.com match data is temporarily unavailable.';console.warn(e);
  }
}
$('#refreshRecord').onclick=loadRecord;loadRecord();setInterval(loadRecord,15*60*1000);


/* ---------- POINTER SPOTLIGHT ---------- */
(function pointerSpotlight(){
  const root=document.documentElement,spot=document.getElementById('cursorSpotlight');
  if(!spot || !window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  let tx=innerWidth/2,ty=innerHeight/2,cx=tx,cy=ty,raf=0;
  const draw=()=>{cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;root.style.setProperty('--mx',cx+'px');root.style.setProperty('--my',cy+'px');raf=requestAnimationFrame(draw)};
  window.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;document.body.classList.add('cursor-active')},{passive:true});
  window.addEventListener('pointerleave',()=>document.body.classList.remove('cursor-active'));
  window.addEventListener('blur',()=>document.body.classList.remove('cursor-active'));
  draw();
})();


/* ---------- DEEPLY HIDDEN EASTER EGG ---------- */
(function hiddenSequence(){
  const crest=document.querySelector('.crest'), life=document.querySelector('.life'), day=document.getElementById('daysTogether');
  const matrix=document.getElementById('matrixBoard'), egg=document.getElementById('easterEgg'), close=document.getElementById('easterClose');
  if(!crest||!life||!day||!matrix||!egg)return;
  let stage=0,clicks=[],hoverTimer=0,armedAt=0,keyPos=0,keyDeadline=0;
  // Easier for the owner to remember, still extremely unlikely to trigger accidentally.
  // Sequence: 3 crest clicks -> 2s Club Life hover -> click Days Together ->
  // double-click Matrix -> type ACFA within 12 seconds.
  const keyCodes=[65,67,70,65];
  const reset=()=>{stage=0;clicks=[];clearTimeout(hoverTimer);hoverTimer=0;armedAt=0;keyPos=0;keyDeadline=0};
  crest.addEventListener('click',()=>{
    if(!document.getElementById('overview').classList.contains('active-panel'))return reset();
    const n=performance.now();clicks=clicks.filter(x=>n-x<4000);clicks.push(n);
    if(clicks.length===3){stage=1;clicks=[];}else if(clicks.length>3)reset();
  });
  life.addEventListener('pointerenter',()=>{
    if(stage!==1)return;clearTimeout(hoverTimer);
    hoverTimer=setTimeout(()=>{stage=2;armedAt=performance.now();},2000);
  });
  life.addEventListener('pointerleave',()=>{if(stage===1){clearTimeout(hoverTimer);hoverTimer=0}});
  day.addEventListener('click',e=>{
    if(stage===2 && performance.now()-armedAt<5000){e.stopPropagation();stage=3;}else if(stage!==0)reset();
  });
  matrix.addEventListener('dblclick',()=>{if(stage===3){stage=4;keyPos=0;keyDeadline=performance.now()+12000}else if(stage!==0)reset()});
  window.addEventListener('keydown',e=>{
    if(stage!==4)return;
    if(performance.now()>keyDeadline)return reset();
    const code=e.key.toUpperCase().charCodeAt(0);
    if(code===keyCodes[keyPos]){keyPos++;if(keyPos===keyCodes.length){egg.classList.add('open');egg.setAttribute('aria-hidden','false');document.body.classList.add('easter-active');reset();}}else reset();
  });
  function hide(){egg.classList.remove('open');egg.setAttribute('aria-hidden','true');document.body.classList.remove('easter-active')}
  close?.addEventListener('click',hide);egg.addEventListener('click',e=>{if(e.target===egg)hide()});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&egg.classList.contains('open'))hide()});
})();
