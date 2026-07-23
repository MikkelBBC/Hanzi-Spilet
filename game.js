// ===== CANVAS =====
const cv=document.getElementById('cv'),cx=cv.getContext('2d');
function rsz(){cv.width=innerWidth;cv.height=innerHeight;
const cc=document.getElementById('c-cv');if(cc){cc.width=cc.parentElement.clientWidth;cc.height=cc.parentElement.clientHeight;}}
addEventListener('resize',rsz);rsz();

// ===== AUDIO =====
const Mus={t:{},cur:null,init(){['map','fight','gym'].forEach(k=>{const a=new Audio('music/'+k+'.mp3');a.loop=true;a.volume=.22;a.preload='auto';this.t[k]=a;});},
play(k){if(this.cur===k)return;this.stop();this.cur=k;const t=this.t[k];if(t){t.currentTime=0;t.play().catch(()=>{});}},
stop(){Object.values(this.t).forEach(t=>{t.pause();t.currentTime=0;});this.cur=null;}};

let sfxMuted=false;
const S={c:null,g:null,init(){this.c=new(window.AudioContext||window.webkitAudioContext)();this.g=this.c.createGain();this.g.gain.value=.18;this.g.connect(this.c.destination);},
n(f,d,t='square',v=.3){if(!this.c||sfxMuted)return;const o=this.c.createOscillator(),g=this.c.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,this.c.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.c.currentTime+d);o.connect(g);g.connect(this.g);o.start();o.stop(this.c.currentTime+d);},
click(){this.n(800,.04);setTimeout(()=>this.n(1100,.03),20);},
ok(){this.n(523,.08);setTimeout(()=>this.n(659,.08),60);setTimeout(()=>this.n(784,.1),120);},
bad(){this.n(300,.1,'sawtooth');setTimeout(()=>this.n(220,.12,'sawtooth'),80);},
perf(){this.n(784,.06);setTimeout(()=>this.n(988,.06),40);setTimeout(()=>this.n(1175,.1),80);},
coin(){for(let i=0;i<3;i++)setTimeout(()=>this.n(800+i*250,.04,'sine'),i*30);},
hit(){this.n(180,.07,'sawtooth',.25);},heal(){this.n(440,.06,'sine');setTimeout(()=>this.n(660,.06,'sine'),50);setTimeout(()=>this.n(880,.08,'sine'),100);},
eat(){this.n(300,.05,'sine');setTimeout(()=>this.n(500,.05,'sine'),40);}};

// ===== GAME STATE =====
const G={scene:'title',day:1,daysLeft:7,hour:8,money:150,hunger:80,maxHunger:100,round:1,maxRounds:5,
styrke:0,cardio:0,smalltalk:0,reflex:0,
get dmg(){return 5+this.styrke*2},get maxHP(){return 50+this.cardio*5},get maxMP(){return 10+this.smalltalk*3},
get blockChance(){return Math.min(50,5+this.reflex*3)},get hitBonus(){return this.reflex*2},
charmPts:0,charmTotal:0,perks:{},workLvl:1,workXP:0,workNeed(){return 3+this.workLvl*2},
inv:[],bought:[],girlsMet:0,totalScore:0,tutorial:0,
bodegaLvl:1,wheelUsedToday:false,eventDoneToday:false,buff:null,buffDays:0,
px:.5,py:.5,tx:.5,ty:.5,walking:false};

function girlScale(base,rating){return Math.round(base*Math.pow(1.5,rating-1));}

// ===== HELPERS =====
function float(t,c='#fff'){const e=document.createElement('div');e.className='float';e.textContent=t;e.style.color=c;e.style.left=(innerWidth/2-30)+'px';e.style.top=(innerHeight/2-30)+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),1000);}
let mt;function msg(t){const b=document.getElementById('msg-bar');document.getElementById('msg-text').textContent=t;b.classList.add('show');clearTimeout(mt);mt=setTimeout(()=>b.classList.remove('show'),4000);}

// ===== VIDEO =====
let vidCb=null;
function playVid(src,cb){
    const v=document.getElementById('intro-vid');
    vidCb=cb;v.onerror=()=>skipVid();v.onended=skipVid;
    v.src=src;v.load();
    const to=setTimeout(()=>skipVid(),2000);
    v.oncanplay=()=>{clearTimeout(to);v.style.display='block';document.getElementById('vid-skip').style.display='block';v.play().catch(()=>skipVid());};
    v.onerror=()=>{clearTimeout(to);skipVid();};}
function skipVid(){
    const v=document.getElementById('intro-vid');v.pause();v.style.display='none';document.getElementById('vid-skip').style.display='none';
    if(vidCb){const c=vidCb;vidCb=null;c();}}

// ===== MAP IMAGE =====
const mapImg=new Image();mapImg.src='images/map.png';let mapReady=false;
mapImg.onload=()=>{mapReady=true;};

// ===== BUILDINGS (positions in IMAGE coordinates 0-1, converted dynamically) =====
const bldsImg=[
    {id:'gym',ix:.05,iy:.16,iw:.11,ih:.10,name:'GYM',icon:'💪'},
    {id:'shop',ix:.19,iy:.28,iw:.11,ih:.09,name:'BUTIK',icon:'🛒'},
    {id:'work',ix:.49,iy:.21,iw:.13,ih:.10,name:'ARBEJDE',icon:'💰'},
    {id:'bodega',ix:.07,iy:.36,iw:.12,ih:.09,name:'BODEGA',icon:'🍺'},
    {id:'tree',ix:.31,iy:.47,iw:.12,ih:.09,name:'SKILLS',icon:'🌟'},
    {id:'rest',ix:.40,iy:.68,iw:.13,ih:.09,name:'HJEM',icon:'🏠'},
    {id:'club',ix:.04,iy:.68,iw:.12,ih:.09,name:'KLUB',icon:'🪩'},
];
let blds=bldsImg.map(b=>({...b,x:b.ix,y:b.iy,w:b.iw,h:b.ih}));
let cropSX=0,cropSY=0,cropSW=1,cropSH=1;
function updateBldPositions(){
    blds=bldsImg.map(b=>{
        const x=(b.ix-cropSX)/cropSW;
        const y=(b.iy-cropSY)/cropSH;
        const w=b.iw/cropSW;
        const h=b.ih/cropSH;
        return {...b,x,y,w,h};
    });
}

// ===== TOP-DOWN MAP =====
let mapT=0;
let mapOX=0,mapOY=0,mapDW=0,mapDH=0;

function drawMap(){
    mapT+=.005;const W=cv.width,H=cv.height;
    cx.fillStyle='#4a8c5c';cx.fillRect(0,0,W,H);
    // Draw map image - portrait: cover (immersive), landscape: contain (show all)
    if(mapReady){
        const imgR=mapImg.width/mapImg.height,cvR=W/H;
        const isPortrait=H>W;
        let dx=0,dy=0,dw=W,dh=H;
        if(isPortrait){
            // Cover mode biased left for mobile
            let sx=0,sy=0,sw=mapImg.width,sh=mapImg.height;
            if(imgR>cvR){const nw=mapImg.height*cvR;sx=Math.max(0,(mapImg.width-nw)*.15);sw=nw;}
            else{const nh=mapImg.width/cvR;sy=Math.max(0,(mapImg.height-nh)*.3);sh=nh;}
            cx.drawImage(mapImg,sx,sy,sw,sh,0,0,W,H);
            const newSX=sx/mapImg.width,newSY=sy/mapImg.height;
            const newSW=sw/mapImg.width,newSH=sh/mapImg.height;
            if(Math.abs(newSX-cropSX)>.001||Math.abs(newSW-cropSW)>.001){cropSX=newSX;cropSY=newSY;cropSW=newSW;cropSH=newSH;updateBldPositions();}
        } else {
            // Contain mode for desktop
            if(imgR>cvR){dh=W/imgR;dy=(H-dh)/2;dw=W;}
            else{dw=H*imgR;dx=(W-dw)/2;dh=H;}
            cx.fillStyle='#4a7a3a';cx.fillRect(0,0,W,H);
            cx.drawImage(mapImg,0,0,mapImg.width,mapImg.height,dx,dy,dw,dh);
            const newSX=-dx/dw,newSY=-dy/dh,newSW=W/dw,newSH=H/dh;
            if(Math.abs(newSX-cropSX)>.001||Math.abs(newSW-cropSW)>.001||Math.abs(newSY-cropSY)>.001||Math.abs(newSH-cropSH)>.001){cropSX=newSX;cropSY=newSY;cropSW=newSW;cropSH=newSH;updateBldPositions();}
        }
    }
    // Highlight buildings on hover proximity
    blds.forEach(b=>{
        const bx=b.x*W,by=b.y*H,bw=b.w*W,bh=b.h*H;
        const dx2=G.px-(b.x+b.w/2),dy2=G.py-(b.y+b.h/2);
        const near=Math.sqrt(dx2*dx2+dy2*dy2)<.1;
        if(near){
            cx.strokeStyle='rgba(255,190,11,.6)';cx.lineWidth=3;
            cx.shadowColor='#ffbe0b';cx.shadowBlur=8;
            cx.strokeRect(bx-2,by-2,bw+4,bh+4);cx.shadowBlur=0;
        }
        if(b.id==='club'){const gl=Math.sin(mapT*4)*.3+.4;cx.shadowColor='#7c3aed';cx.shadowBlur=6;cx.strokeStyle=`rgba(124,58,237,${gl})`;cx.lineWidth=2;cx.strokeRect(bx-1,by-1,bw+2,bh+2);cx.shadowBlur=0;}
        if(b.id==='bodega'){const gl=Math.sin(mapT*3)*.2+.3;cx.shadowColor='#f59e0b';cx.shadowBlur=5;cx.strokeStyle=`rgba(245,158,11,${gl})`;cx.lineWidth=2;cx.strokeRect(bx-1,by-1,bw+2,bh+2);cx.shadowBlur=0;}
    });
    // Event marker "?"
    if(eventMarker){
        const mx=eventMarker.x*W,my=eventMarker.y*H,mt=(Date.now()-eventMarker.t)*.003;
        const bounce=Math.sin(mt*3)*4,pulse=.7+Math.sin(mt*2)*.3;
        cx.save();cx.globalAlpha=pulse;
        cx.shadowColor='#ffbe0b';cx.shadowBlur=12+Math.sin(mt*4)*5;
        cx.fillStyle='rgba(0,0,0,.6)';cx.beginPath();cx.arc(mx,my+bounce,16,0,Math.PI*2);cx.fill();
        cx.fillStyle='#ffbe0b';cx.beginPath();cx.arc(mx,my+bounce,14,0,Math.PI*2);cx.fill();
        cx.shadowBlur=0;cx.fillStyle='#000';cx.font=`bold ${Math.max(12,W*.028)}px 'Press Start 2P'`;cx.textAlign='center';cx.textBaseline='middle';
        cx.fillText('?',mx,my+bounce+1);
        cx.restore();
        cx.fillStyle='rgba(255,190,11,.15)';cx.beginPath();cx.arc(mx,my,22+Math.sin(mt*2)*6,0,Math.PI*2);cx.fill();
    }
    // Hanzi (top-down sprite) - bigger on mobile
    const hx=G.px*W,hy=G.py*H;
    const bob=G.walking?Math.sin(Date.now()*.015)*2:0;
    const sz=Math.max(10,W*.025);
    // Shadow
    cx.fillStyle='rgba(0,0,0,.5)';cx.beginPath();cx.ellipse(hx,hy+sz*.8,sz*.9,sz*.4,0,0,Math.PI*2);cx.fill();
    // Glow ring
    cx.strokeStyle='rgba(255,0,110,.5)';cx.lineWidth=3;cx.shadowColor='#ff006e';cx.shadowBlur=10;
    cx.beginPath();cx.arc(hx,hy+bob,sz*1.4,0,Math.PI*2);cx.stroke();cx.shadowBlur=0;
    // Body
    cx.fillStyle='#475569';cx.beginPath();cx.arc(hx,hy+bob,sz,0,Math.PI*2);cx.fill();
    // Head
    cx.fillStyle='#c68642';cx.beginPath();cx.arc(hx,hy-sz*.7+bob,sz*.65,0,Math.PI*2);cx.fill();
    // Hair
    cx.fillStyle='#111';cx.beginPath();cx.arc(hx,hy-sz*1.05+bob,sz*.65,Math.PI,Math.PI*2);cx.fill();
    // Name tag
    cx.font=`bold ${Math.max(7,W*.018)}px 'Press Start 2P'`;cx.textAlign='center';
    cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(hx-20,hy-sz*1.8+bob-2,40,10);
    cx.fillStyle='#ff006e';cx.fillText('HANZI',hx,hy-sz*1.8+bob+6);
    // Direction indicator
    if(G.walking){
        cx.fillStyle='rgba(255,0,110,.5)';cx.beginPath();cx.arc(G.tx*W,G.ty*H,6,0,Math.PI*2);cx.fill();
        cx.strokeStyle='rgba(255,0,110,.3)';cx.lineWidth=2;cx.beginPath();cx.arc(G.tx*W,G.ty*H,10+Math.sin(mapT*8)*3,0,Math.PI*2);cx.stroke();
    }
    // Walk
    if(G.walking){
        const dx=G.tx-G.px,dy=G.ty-G.py,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<.015){G.walking=false;G.px=G.tx;G.py=G.ty;onArrived();}
        else{const spd=.006;G.px+=dx/dist*spd;G.py+=dy/dist*spd;}
    }
}

// ===== CLICK MAP =====
cv.addEventListener('click',e=>{
    if(G.scene!=='map'||G.walking)return;
    const rx=e.clientX/cv.width,ry=e.clientY/cv.height;
    // Check event marker click
    if(eventMarker){
        const dx=rx-eventMarker.x,dy=ry-eventMarker.y;
        if(Math.sqrt(dx*dx+dy*dy)<.05){S.click();goTo({x:eventMarker.x-.03,y:eventMarker.y-.03,w:.06,h:.06,id:'event_marker'});return;}
    }
    // Check building click
    for(const b of blds){
        if(rx>=b.x-.02&&rx<=b.x+b.w+.02&&ry>=b.y-.02&&ry<=b.y+b.h+.02){
            S.click();goTo(b);return;
        }
    }
});

let arriveId=null;
function goTo(b){
    arriveId=b.id;G.tx=b.x+b.w/2;G.ty=b.y+b.h+.04;G.walking=true;
}

function onArrived(){
    const id=arriveId;arriveId=null;
    if(id==='event_marker'){showRandomEvent();return;}
    if(id&&locationIntros[id]&&!visitedLocations[id]){visitedLocations[id]=true;msg(locationIntros[id]);setTimeout(()=>{onArrivedInner(id);},3500);return;}
    onArrivedInner(id);
}
function onArrivedInner(id){
    switch(id){
        case'gym':if(G.hunger<20){msg('For sulten til at træne! Spis noget.');return;}openGym();break;
        case'shop':openShop();break;
        case'tree':openTree();break;
        case'work':openWork();break;
        case'rest':if(!G.wheelUsedToday){openWheel();return;}doRest();break;
        case'bodega':openBodega();break;
        case'club':
            if(G.daysLeft>0){msg('Klubben åbner om '+G.daysLeft+' dage!');return;}
            goClub();break;
    }
}

function newDay(){G.hour=8;G.day++;G.daysLeft=Math.max(0,G.daysLeft-1);bodegaUsedToday=false;G.wheelUsedToday=false;G.eventDoneToday=false;eventMarker=null;if(G.buffDays>0){G.buffDays--;if(G.buffDays<=0)G.buff=null;}spawnEventMarker();
showDayFlash();if(G.daysLeft===0)setTimeout(forceClub,2500);}
function showDayFlash(){
    const f=document.getElementById('day-flash');
    document.getElementById('df-day').textContent='DAG '+G.day;
    const dl=G.daysLeft;
    document.getElementById('df-sub').textContent=dl>0?dl+' DAGE TIL FREDAG 🪩':'FREDAG! KLUBBEN NU! 🔥';
    f.classList.add('show');setTimeout(()=>f.classList.remove('show'),2200);
}
const lethLore=[
    'Leth: "TBH smed dig ud fordi du var i koma... kold business bror."',
    'Leth: "Manager Danny sagde du var færdig. Beviser ham forkert!"',
    'Leth: "De erstattede dig med en fyr der ikke engang kan danse..."',
    'Leth: "TBH\'s nye lineup er svag. De mangler dig, bror."',
    'Leth: "Husker du den aften i Royal Arena? 40.000 mennesker..."',
    'Leth: "Danny tog alt - din plads, dine penge, endda din parkeringsplads."',
    'Leth: "Rygtet siger TBH er ved at gå konkurs uden dig."',
    'Leth: "Din motorcykel-ulykke var ikke tilfældig... bare siger."',
    'Leth: "Scor den hotteste pige og hele byen snakker. Danny VED det."',
    'Leth: "Jeg tror Danny er bange for dit comeback. Han burde være."',
    'Leth: "TBH\'s fans savner dig. #BringHanziBack er trending."',
    'Leth: "Vent... der sker noget stort efter klubben. Kan ikke sige mere."',
];
const visitedLocations={};
const locationIntros={
    gym:'💪 LETH\'S GYM\nTræn dine stats her! Hver øvelse er et mini-game.\nSTYRKE = mere skade\nCARDIO = mere HP\nSMALL TALK = mere mana\nREFLEX = bedre hit/block',
    shop:'🛒 GULLE\'S SHOP\nKøb mad for at fylde sult.\nKøb style for charm points.\nKøb kamp-items til combat.',
    work:'💰 RITARDO\'S JOBS\nTjen penge her. Højere level = bedre jobs.\nKoster sult og tid.',
    tree:'🌟 SKILL TREE\nBrug charm points til at unlocke perks.\nVælg mellem kamp, forsvar, eller social.',
    bodega:'🍺 BODEGA\nMød og battle piger 1 gang om dagen.\nOpgrader for at møde pænere piger.\nNemmere end klubben!',
    club:'🪩 KLUBBEN\nDen store boss fight!\nHer møder du rundens pige.',
};
function advTime(h){G.hour+=h;if(G.hour>=24){newDay();}}
let eventMarker=null;
function spawnEventMarker(){
    if(G.eventDoneToday||Math.random()>.5)return;
    const spots=[{x:.25,y:.35},{x:.55,y:.55},{x:.15,y:.55},{x:.60,y:.30},{x:.35,y:.25},{x:.45,y:.60},{x:.30,y:.70},{x:.20,y:.48}];
    const s=spots[Math.floor(Math.random()*spots.length)];
    eventMarker={x:s.x,y:s.y,t:Date.now(),id:'event_marker'};
}
function closeOv(){document.querySelectorAll('.ov,.wheel-ov,.event-ov').forEach(o=>o.classList.remove('active'));G.scene='map';Mus.play('map');updHUD();}

// ===== FORCE CLUB =====
function forceClub(){
    msg('⚠️ KLUBBEN ER ÅBEN! DU SKAL DERUD! 🪩');
    setTimeout(()=>{
        if(G.scene==='map'){goClub();}
        else{document.querySelectorAll('.ov').forEach(o=>o.classList.remove('active'));G.scene='map';setTimeout(()=>goClub(),500);}
    },1500);
}
// ===== LETH BRIEFING + CLUB =====
let briefStep=0,briefGirl=null;
function goClub(){
    document.querySelectorAll('.ov').forEach(o=>o.classList.remove('active'));
    G.scene='brief';
    const rg=girlsByRound[Math.min(G.round-1,3)];
    briefGirl=makeScaledGirl(rg[Math.floor(Math.random()*rg.length)]);
    briefStep=0;
    document.getElementById('brief-girl').style.display='none';
    document.getElementById('brief-ov').classList.add('active');
    drawBriefLeth();advBrief();
}
function drawBriefLeth(){
    const c=document.getElementById('brief-cv'),x=c.getContext('2d'),W=c.width,H=c.height;
    x.fillStyle='#0a0a12';x.fillRect(0,0,W,H);
    // Leth close-up
    const t=Date.now()*.001,cx2=W/2,cy=H*.55;
    // Body
    x.fillStyle='#dc2626';x.fillRect(cx2-30,cy-10,60,50);
    // Big arms
    x.fillStyle='#c68642';x.fillRect(cx2-44,cy-6,16,35);x.fillRect(cx2+28,cy-6,16,35);
    // Neck
    x.fillStyle='#c68642';x.fillRect(cx2-8,cy-22,16,14);
    // Head
    x.fillStyle='#c68642';x.beginPath();x.arc(cx2,cy-34,22,0,Math.PI*2);x.fill();
    // Hair
    x.fillStyle='#222';x.beginPath();x.arc(cx2,cy-44,22,Math.PI,.02);x.fill();
    // Eyes
    x.fillStyle='#fff';x.fillRect(cx2-10,cy-38,7,6);x.fillRect(cx2+3,cy-38,7,6);
    x.fillStyle='#111';x.fillRect(cx2-8,cy-37,4,5);x.fillRect(cx2+5,cy-37,4,5);
    // Smile
    x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(cx2,cy-26,8,0,Math.PI);x.stroke();
    // Label
    x.font="bold 10px 'Press Start 2P'";x.textAlign='center';x.fillStyle='#00d4aa';x.fillText('LETH 💪',cx2,H-8);
}
const briefScript=[
    ()=>{setBrief('Leth 💪','Yo bror! Tiden er inde. Klubben venter! 🪩');},
    ()=>{setBrief('Leth 💪',lethLore[Math.floor(Math.random()*lethLore.length)].replace('Leth: "','').replace('"',''));},
    ()=>{setBrief('Leth 💪','Lad mig hjælpe dig med at blive klar til byen...');},
    ()=>{
        document.getElementById('brief-ov').classList.remove('active');
        playVid('video/club.mp4',()=>{
            document.getElementById('brief-ov').classList.add('active');
            advBrief();
        });
    },
    ()=>{drawBriefLeth();const l2=lethLore[Math.floor(Math.random()*lethLore.length)].replace('Leth: "','').replace('"','');setBrief('Leth 💪',l2);},
    ()=>{drawBriefLeth();setBrief('Leth 💪','NU er du klar til byen! Du ser SKARP ud! 🔥');},
    ()=>{
        // Show girl info
        const g=briefGirl;
        setBrief('Leth 💪',`Scor hende her i aften. Held og lykke, bror!`);
        document.getElementById('brief-girl').style.display='block';
        document.getElementById('bg-icon').textContent=g.icon;
        document.getElementById('bg-name').textContent=g.name;
        document.getElementById('bg-rating').textContent='⭐'.repeat(Math.ceil(g.rating/2))+' '+g.rating+'/10';
        document.getElementById('bg-stats').innerHTML=
            `❤️ HP: ${g.hp||girlScale(20,g.rating)} | ⚔️ ATK: ${g.atk||girlScale(3,g.rating)}\n`+
            `💀 Abilities: ${g.abilities.join(', ')}\n`+
            `${g.rating>=8?'⚠️ SVÆR MODSTANDER!':g.rating>=6?'💪 Middel sværhed':'✅ Begynder-niveau'}`;
    },
    ()=>{
        // Start combat
        document.getElementById('brief-ov').classList.remove('active');
        startCombatWithGirl(briefGirl);
    },
];
function advBrief(){
    if(briefStep>=briefScript.length)return;
    S.click();briefScript[briefStep]();briefStep++;
}
function setBrief(name,text){
    document.getElementById('brief-name').textContent=name;
    document.getElementById('brief-text').textContent=text;
}

// ===== REST =====
function doRest(){
    newDay();G.hunger=Math.min(G.maxHunger,G.hunger+20);
    if(G.daysLeft<=0){forceClub();return;}
    msg(`Dag ${G.day}. ${G.daysLeft} dage til klubben. +20 sult.`);updHUD();
    if(!G.wheelUsedToday){setTimeout(()=>msg('💡 Besøg Hjem for lykkehjulet!'),2000);}
}

// ===== HUD =====
function updHUD(){
    const h=document.getElementById('hud');h.className='show';
    h.innerHTML=`<div class="hr"><div class="hl">
        <div class="hb"><span class="l" style="color:#ff006e">SULT</span><div class="t"><div class="f" style="width:${G.hunger/G.maxHunger*100}%;background:#ff006e"></div></div><span class="v">${G.hunger}</span></div>
        <div class="hstats">
            <div class="hs"><span class="si">⚔️</span><span class="sl">STR</span><span class="sv" style="color:#ff006e">${G.styrke}</span></div>
            <div class="hs"><span class="si">❤️</span><span class="sl">CRD</span><span class="sv" style="color:#ff4d8d">${G.cardio}</span></div>
            <div class="hs"><span class="si">💬</span><span class="sl">TLK</span><span class="sv" style="color:#3b82f6">${G.smalltalk}</span></div>
            <div class="hs"><span class="si">🛡️</span><span class="sl">REF</span><span class="sv" style="color:#00d4aa">${G.reflex}</span></div>
            <div class="hs"><span class="si">🌟</span><span class="sl">CHR</span><span class="sv" style="color:#ffbe0b">${G.charmPts}</span></div>
        </div></div><div class="hright">
        <div class="ck">${String(G.hour).padStart(2,'0')}:00</div>
        <div class="dy">DAG ${G.day} ${G.daysLeft>0?'(KLUB: '+G.daysLeft+'D)':'⚠️ KLUB NU!'}</div>
        <div class="mn">${G.money} KR</div>
    </div></div>`;
    // Settings gear
    if(!document.getElementById('settings-btn')){
        const sb=document.createElement('div');sb.id='settings-btn';sb.textContent='⚙️';
        sb.style.cssText='position:fixed;top:6px;right:6px;z-index:15;font-size:1.3rem;cursor:pointer;background:rgba(0,0,0,.5);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;';
        sb.onclick=openSettings;document.body.appendChild(sb);
    }
}

function openSettings(){
    let ov=document.getElementById('settings-ov');
    if(ov){ov.remove();}
    ov=document.createElement('div');ov.id='settings-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.92);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
    const musicOn=Mus.cur!==null;
    ov.innerHTML=`<div class="pix" style="font-size:clamp(10px,3vw,16px);color:#ffbe0b;margin-bottom:10px">⚙️ INDSTILLINGER</div>`+
        `<button class="btn" id="set-music" style="min-width:200px">${musicOn?'🔊 MUSIK TIL':'🔇 MUSIK FRA'}</button>`+
        `<button class="btn" id="set-sfx" style="min-width:200px">${sfxMuted?'🔇 SFX FRA':'🔊 SFX TIL'}</button>`+
        `<button class="btn" id="set-back" style="min-width:200px;margin-top:10px">← TILBAGE</button>`;
    document.body.appendChild(ov);
    document.getElementById('set-music').onclick=()=>{if(Mus.cur){Mus.stop();document.getElementById('set-music').textContent='🔇 MUSIK FRA';}else{Mus.play('map');document.getElementById('set-music').textContent='🔊 MUSIK TIL';}};
    document.getElementById('set-sfx').onclick=()=>{sfxMuted=!sfxMuted;document.getElementById('set-sfx').textContent=sfxMuted?'🔇 SFX FRA':'🔊 SFX TIL';};
    document.getElementById('set-back').onclick=()=>{ov.remove();};
}

// ===== NPC DRAWING =====
function drawNPC(ctx,x,y,type,t){
    const s=1;ctx.save();ctx.translate(x,y);
    const bob=Math.sin(t*3)*1.5;
    if(type==='leth'){
        // Muscular guy
        ctx.fillStyle='#c68642';ctx.beginPath();ctx.arc(0,-22+bob,8,0,Math.PI*2);ctx.fill();// head
        ctx.fillStyle='#222';ctx.beginPath();ctx.arc(0,-28+bob,8,Math.PI,Math.PI*2);ctx.fill();// hair
        ctx.fillStyle='#dc2626';ctx.fillRect(-10,-14+bob,20,18);// red tank top
        ctx.fillStyle='#c68642';ctx.fillRect(-14,-12+bob,5,14);ctx.fillRect(9,-12+bob,5,14);// big arms
        ctx.fillStyle='#1e293b';ctx.fillRect(-6,4+bob,5,12);ctx.fillRect(1,4+bob,5,12);// legs
    } else if(type==='gulle'){
        ctx.fillStyle='#c68642';ctx.beginPath();ctx.arc(0,-20+bob,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#333';ctx.fillRect(-8,-28+bob,16,6);// hat
        ctx.fillStyle='#8b5cf6';ctx.fillRect(-8,-13+bob,16,16);// purple jacket
        ctx.fillStyle='#1e293b';ctx.fillRect(-5,3+bob,4,10);ctx.fillRect(1,3+bob,4,10);
        // sunglasses
        ctx.fillStyle='#000';ctx.fillRect(-5,-22+bob,4,3);ctx.fillRect(1,-22+bob,4,3);
    } else if(type==='ritardo'){
        ctx.fillStyle='#c68642';ctx.beginPath();ctx.arc(0,-20+bob,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#555';ctx.beginPath();ctx.arc(0,-24+bob,7,Math.PI,Math.PI*2);ctx.fill();
        ctx.fillStyle='#059669';ctx.fillRect(-7,-13+bob,14,15);// green shirt
        ctx.fillStyle='#1e293b';ctx.fillRect(-5,2+bob,4,10);ctx.fillRect(1,2+bob,4,10);
        // clipboard
        const cb=Math.sin(t*2)*2;
        ctx.fillStyle='#a0855c';ctx.fillRect(8,-8+bob+cb,6,8);
    } else if(type==='girl'){
        ctx.fillStyle='#f0c8a0';ctx.beginPath();ctx.arc(0,-20+bob,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#a0522d';ctx.beginPath();ctx.arc(0,-24+bob,8,Math.PI,.05);ctx.fill();// hair
        ctx.fillStyle='#ff006e';ctx.fillRect(-6,-13+bob,12,14);// dress
        ctx.fillStyle='#f0c8a0';ctx.fillRect(-3,1+bob,3,10);ctx.fillRect(0,1+bob,3,10);
    }
    ctx.restore();
}

// ===== LOCATION BACKGROUNDS =====
function drawGymBg(){
    const c=document.getElementById('gym-bg'),x=c.getContext('2d'),W=c.width,H=c.height,t=Date.now()*.001;
    x.fillStyle='#1a0a0a';x.fillRect(0,0,W,H);
    // Floor
    x.fillStyle='#2a1515';x.fillRect(0,H*.7,W,H*.3);
    // Equipment
    x.fillStyle='#444';x.fillRect(20,H*.4,15,H*.3);x.fillRect(15,H*.4,25,5);// rack
    x.fillStyle='#555';x.fillRect(W-50,H*.45,30,8);x.fillRect(W-55,H*.5,5,H*.2);x.fillRect(W-25,H*.5,5,H*.2);// bench
    // Leth
    drawNPC(x,W*.3,H*.75,'leth',t);
    // Weights on floor
    x.fillStyle='#333';x.beginPath();x.arc(60,H*.8,6,0,Math.PI*2);x.fill();
    x.beginPath();x.arc(70,H*.82,5,0,Math.PI*2);x.fill();
    // Mirror
    x.fillStyle='rgba(100,150,200,.06)';x.fillRect(100,H*.2,80,H*.45);x.strokeStyle='rgba(255,255,255,.08)';x.strokeRect(100,H*.2,80,H*.45);
}

function drawShopBg(){
    const c=document.getElementById('shop-bg'),x=c.getContext('2d'),W=c.width,H=c.height,t=Date.now()*.001;
    x.fillStyle='#0f0520';x.fillRect(0,0,W,H);
    x.fillStyle='#1a0a30';x.fillRect(0,H*.7,W,H*.3);
    // Shelves
    for(let i=0;i<3;i++){x.fillStyle='#2a1a40';x.fillRect(20+i*120,H*.2,80,5);x.fillRect(20+i*120,H*.45,80,5);
        for(let j=0;j<4;j++){x.fillStyle=`hsl(${(i*80+j*60)%360},40%,30%)`;x.fillRect(28+i*120+j*18,H*.25,12,18);}}
    // Gulle
    drawNPC(x,W*.75,H*.75,'gulle',t);
    // Counter
    x.fillStyle='#3a2a50';x.fillRect(W*.6,H*.6,W*.35,8);
}

function drawWorkBg(){
    const c=document.getElementById('work-bg'),x=c.getContext('2d'),W=c.width,H=c.height,t=Date.now()*.001;
    x.fillStyle='#0a1510';x.fillRect(0,0,W,H);
    x.fillStyle='#152520';x.fillRect(0,H*.7,W,H*.3);
    // Desk
    x.fillStyle='#3a3020';x.fillRect(50,H*.5,100,8);
    x.fillStyle='#2a2015';x.fillRect(55,H*.58,5,H*.2);x.fillRect(140,H*.58,5,H*.2);
    // Boxes
    x.fillStyle='#5a4020';x.fillRect(W-80,H*.5,25,20);x.fillRect(W-50,H*.45,20,25);x.fillRect(W-70,H*.35,15,15);
    // Ritardo
    drawNPC(x,W*.5,H*.75,'ritardo',t);
}

// ===== GYM =====
const exercises=[
    {id:'str',name:'STYRKE',icon:'🏋️',desc:'⚔️ +Skade',stat:'styrke',game:'mash'},
    {id:'crd',name:'CARDIO',icon:'🏃',desc:'❤️ +Max HP',stat:'cardio',game:'runner'},
    {id:'tlk',name:'SMALL TALK',icon:'💬',desc:'💬 +Max Mana',stat:'smalltalk',game:'memory'},
    {id:'ref',name:'REFLEX',icon:'🛡️',desc:'🛡️ +Block/Hit',stat:'reflex',game:'reaction'},
];
function openGym(){
    G.scene='gym';Mus.play('gym');drawGymBg();
    document.getElementById('gym-sub').textContent=`Leth: "Vælg øvelse! Koster 20 sult." | Sult: ${G.hunger}`;
    const g=document.getElementById('gym-g');g.innerHTML='';
    exercises.forEach(ex=>{
        const c=document.createElement('div');c.className='gym-c';
        c.innerHTML=`<div class="gi">${ex.icon}</div><div class="gn">${ex.name}</div><div class="gd">${ex.desc}</div><div class="gl">${G[ex.stat]} pts</div>`;
        c.onclick=()=>{if(G.hunger<20){msg('For sulten!');return;}G.hunger-=20;advTime(2);startTrain(ex);};
        g.appendChild(c);
    });
    document.getElementById('gym-ov').classList.add('active');
}

// ===== 4 UNIQUE MINI-GAMES =====
let tAF=null,tState={};
function startTrain(ex){
    S.click();document.getElementById('gym-ov').classList.remove('active');
    document.getElementById('train-ov').classList.add('active');G.scene='train';
    document.getElementById('tt').textContent=ex.icon+' '+ex.name;
    document.getElementById('ts').textContent='';document.getElementById('tr').innerHTML='';
    const tc=document.getElementById('tc');tc.width=Math.min(340,innerWidth-20);tc.height=Math.min(300,innerHeight*.38);
    tState={ex,score:0,max:0,phase:'go',done:false};
    switch(ex.game){
        case'mash':trainMash(tc);break;
        case'runner':trainRunner(tc);break;
        case'memory':trainMemory(tc);break;
        case'reaction':trainReaction(tc);break;
    }
}

function endTrain(){
    cancelAnimationFrame(tAF);tState.done=true;
    const ex=tState.ex,sc=tState.score,mx=tState.max||1;
    const p=Math.min(1,sc/mx);const gain=Math.max(1,Math.floor(p*3+1));
    G[ex.stat]+=gain;G.charmPts+=1;G.charmTotal+=1;
    float('+'+gain+' '+ex.name,'#ffbe0b');
    let gr,gc;if(p>.8){gr='PERFEKT!';gc='#ffbe0b';S.perf();}else if(p>.5){gr='GODT!';gc='#00d4aa';S.ok();}else{gr='OK';gc='#ff6b35';S.click();}
    document.getElementById('ti').textContent='';
    document.getElementById('tr').innerHTML=`<div style="text-align:center;margin-top:10px"><div class="pix" style="font-size:clamp(9px,2.5vw,14px);color:${gc};margin-bottom:5px">${gr}</div><div class="pix" style="font-size:clamp(5px,1.2vw,8px);color:#ffbe0b;margin-bottom:3px">+${gain} ${ex.stat.toUpperCase()}</div><div class="pix" style="font-size:clamp(3px,.8vw,5px);color:#888;margin-bottom:10px">DMG:${G.dmg} HP:${G.maxHP} MP:${G.maxMP} BLK:${G.blockChance}%</div><button class="btn btn-s" onclick="document.getElementById('train-ov').classList.remove('active');openGym();updHUD();">VIDERE</button></div>`;
}

// GAME 1: BUTTON MASH (styrke)
function trainMash(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    tState.max=40;let count=0,timeLeft=5,started=false,lastT=Date.now();
    document.getElementById('ti').textContent='TAP SÅ HURTIGT DU KAN! 💪';
    const tap=()=>{if(tState.done)return;if(!started){started=true;lastT=Date.now();}count++;tState.score=count;S.click();};
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);document.addEventListener('keydown',tap);
    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);document.removeEventListener('keydown',tap);return;}
        if(started){timeLeft=5-(Date.now()-lastT)/1000;if(timeLeft<=0){tState.score=count;endTrain();return;}}
        x.clearRect(0,0,W,H);
        // Bar
        const pct=count/tState.max;
        x.fillStyle='rgba(255,255,255,.05)';x.fillRect(W*.1,H*.4,W*.8,30);
        x.fillStyle='#ff006e';x.fillRect(W*.1,H*.4,W*.8*Math.min(1,pct),30);
        // Count
        x.font="bold 28px 'Press Start 2P'";x.textAlign='center';x.fillStyle='#fff';x.fillText(count,W/2,H*.32);
        x.font="10px 'Press Start 2P'";x.fillStyle='#ffbe0b';x.fillText(started?timeLeft.toFixed(1)+'s':'TAP FOR AT STARTE!',W/2,H*.58);
        // Animated fist
        const fs=count%2===0?1:.9;
        x.font=`${30*fs}px serif`;x.fillText('👊',W/2,H*.78);
        document.getElementById('ts').textContent=count+'/'+tState.max;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 2: RUNNER (cardio)
function trainRunner(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    tState.max=10;let py=H*.7,vy=0,onG=true,obs=[],score=0,dist=0,spd=2,alive=true;
    document.getElementById('ti').textContent='TAP FOR AT HOPPE! 🏃';
    for(let i=0;i<10;i++)obs.push({x:W+i*100+Math.random()*60,h:15+Math.random()*15});
    const jump=()=>{if(!alive||tState.done)return;if(onG){vy=-8;onG=false;S.click();}};
    tc.addEventListener('mousedown',jump);tc.addEventListener('touchstart',jump);document.addEventListener('keydown',jump);
    (function draw(){if(tState.done){tc.removeEventListener('mousedown',jump);tc.removeEventListener('touchstart',jump);document.removeEventListener('keydown',jump);return;}
        x.clearRect(0,0,W,H);
        // Ground
        const gY=H*.78;x.fillStyle='#2a2a2a';x.fillRect(0,gY,W,H-gY);
        x.strokeStyle='rgba(255,255,255,.06)';for(let i=0;i<W;i+=20){x.beginPath();x.moveTo((i-dist*2)%W,gY);x.lineTo((i-dist*2)%W,gY+3);x.stroke();}
        // Player
        vy+=.4;py+=vy;if(py>=gY-16){py=gY-16;vy=0;onG=true;}
        const legOff=Math.sin(dist*.1)*4;
        x.fillStyle='#ff006e';x.fillRect(50,py,12,16);// body
        x.fillStyle='#c68642';x.beginPath();x.arc(56,py-5,6,0,Math.PI*2);x.fill();// head
        x.fillStyle='#1e293b';x.fillRect(50,py+16+legOff,5,6);x.fillRect(57,py+16-legOff,5,6);// legs
        // Obstacles
        obs.forEach(o=>{
            o.x-=spd;if(o.x<-20){o.x=W+50+Math.random()*80;o.h=15+Math.random()*20;score++;tState.score=score;}
            x.fillStyle='#ffbe0b';x.fillRect(o.x,gY-o.h,12,o.h);
            // Collision
            if(alive&&o.x>40&&o.x<70&&py+16>gY-o.h){alive=false;S.bad();tState.score=score;setTimeout(endTrain,500);}
        });
        dist+=spd;spd=2+dist*.001;
        // Score
        x.font="bold 10px 'Press Start 2P'";x.textAlign='right';x.fillStyle='#00d4aa';x.fillText('SCORE: '+score,W-10,20);
        document.getElementById('ts').textContent=score+'/'+tState.max;
        if(score>=tState.max&&alive){tState.score=score;endTrain();return;}
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 3: MEMORY SEQUENCE (small talk)
function trainMemory(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    tState.max=6;
    const colors=['#ff006e','#ffbe0b','#00d4aa','#3b82f6'];
    const emojis=['😎','🗣️','💬','🤙'];
    const positions=[[W*.25,H*.35],[W*.75,H*.35],[W*.25,H*.7],[W*.75,H*.7]];
    const btnR=Math.min(30,W*.1);
    let seq=[],pIdx=0,round=0,showPhase=true,showIdx=0,lastShow=0,canTap=false,wrong=false;

    function nextRound(){round++;seq.push(Math.floor(Math.random()*4));showPhase=true;showIdx=0;canTap=false;pIdx=0;lastShow=Date.now();
        document.getElementById('ti').textContent='Husk sekvensen! 🧠';}
    nextRound();

    function drawBtns(lit){
        x.clearRect(0,0,W,H);
        x.font="bold 8px 'Press Start 2P'";x.textAlign='center';x.fillStyle='#888';x.fillText('RUNDE '+round+'/'+tState.max,W/2,20);
        positions.forEach((p,i)=>{
            const isLit=lit===i;
            x.fillStyle=isLit?colors[i]:'rgba(255,255,255,.06)';
            x.beginPath();x.arc(p[0],p[1],btnR,0,Math.PI*2);x.fill();
            if(isLit){x.shadowColor=colors[i];x.shadowBlur=12;x.beginPath();x.arc(p[0],p[1],btnR,0,Math.PI*2);x.fill();x.shadowBlur=0;}
            x.font="18px serif";x.fillText(emojis[i],p[0],p[1]+6);
        });
    }

    const tap=e=>{if(!canTap||tState.done||wrong)return;
        const rect=tc.getBoundingClientRect();
        const mx=(e.clientX||e.touches[0].clientX)-rect.left,my=(e.clientY||e.touches[0].clientY)-rect.top;
        const sx=tc.width/rect.width,sy=tc.height/rect.height;
        const cx2=mx*sx,cy=my*sy;
        let hit=-1;positions.forEach((p,i)=>{if(Math.hypot(cx2-p[0],cy-p[1])<btnR+5)hit=i;});
        if(hit<0)return;
        drawBtns(hit);S.click();
        if(hit===seq[pIdx]){pIdx++;
            if(pIdx>=seq.length){tState.score=round;S.ok();
                if(round>=tState.max){setTimeout(endTrain,400);return;}
                setTimeout(()=>nextRound(),600);}
        } else{wrong=true;S.bad();tState.score=Math.max(0,round-1);setTimeout(endTrain,600);}
    };
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);

    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);return;}
        if(showPhase){const now=Date.now();
            if(now-lastShow>600){drawBtns(seq[showIdx]);lastShow=now;showIdx++;
                if(showIdx>seq.length){showPhase=false;canTap=true;drawBtns(-1);document.getElementById('ti').textContent='Din tur! Gentag sekvensen! 👆';}
            } else if(now-lastShow>400){drawBtns(-1);}
        }
        document.getElementById('ts').textContent=round+'/'+tState.max;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 4: REACTION (reflex)
function trainReaction(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    tState.max=12;let targets=[],score=0,spawned=0,spawnT=0;
    document.getElementById('ti').textContent='TAP cirklerne hurtigt! ⚡';

    function spawn(){if(spawned>=18)return;targets.push({x:30+Math.random()*(W-60),y:30+Math.random()*(H-60),r:18,life:1,born:Date.now()});spawned++;}

    const tap=e=>{if(tState.done)return;
        const rect=tc.getBoundingClientRect();
        const mx=((e.clientX||e.touches[0].clientX)-rect.left)*(tc.width/rect.width);
        const my=((e.clientY||e.touches[0].clientY)-rect.top)*(tc.height/rect.height);
        for(let i=targets.length-1;i>=0;i--){
            if(Math.hypot(mx-targets[i].x,my-targets[i].y)<targets[i].r+5){
                targets.splice(i,1);score++;tState.score=score;S.click();float('HIT!','#00d4aa');
                if(score>=tState.max){endTrain();return;}break;
            }
        }
    };
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);

    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);return;}
        x.clearRect(0,0,W,H);
        const now=Date.now();if(now-spawnT>800&&spawned<18){spawn();spawnT=now;}
        targets=targets.filter(t=>{
            t.life=1-Math.min(1,(now-t.born)/2000);
            if(t.life<=0){S.bad();return false;}
            x.globalAlpha=t.life;x.fillStyle='#ff006e';x.shadowColor='#ff006e';x.shadowBlur=8;
            x.beginPath();x.arc(t.x,t.y,t.r*t.life,0,Math.PI*2);x.fill();
            x.fillStyle='#fff';x.font='12px serif';x.textAlign='center';x.fillText('🎯',t.x,t.y+4);
            x.shadowBlur=0;x.globalAlpha=1;return true;
        });
        x.font="bold 9px 'Press Start 2P'";x.textAlign='right';x.fillStyle='#ffbe0b';x.fillText(score+'/'+tState.max,W-8,16);
        document.getElementById('ts').textContent=score+'/'+tState.max;
        tAF=requestAnimationFrame(draw);
    })();
}

// ===== SHOP =====
const foodItems=[{name:'Kebab',icon:'🥙',price:25,hunger:30},{name:'Protein Shake',icon:'🥤',price:40,hunger:45},{name:'Pizza',icon:'🍕',price:30,hunger:35},{name:'Energi Drik',icon:'⚡',price:20,hunger:15},{name:'Sushi',icon:'🍣',price:55,hunger:55}];
const gearItems=[{name:'Barbertrim',icon:'💈',price:50},{name:'Ny T-shirt',icon:'👕',price:80},{name:'Fresh Sneakers',icon:'👟',price:120},{name:'Guld-kæde',icon:'⛓️',price:200},{name:'Solbriller',icon:'🕶️',price:180},{name:'Designer Jakke',icon:'🧥',price:300}];
const combatItems=[{name:'Cocktail',icon:'🍹',price:60,item:'drink',desc:'Skade i kamp'},{name:'Energy Shot',icon:'⚡',price:80,item:'energy',desc:'+MP i kamp'},{name:'Proteinbar',icon:'🍫',price:50,item:'heal',desc:'+HP i kamp'}];
let shopTab='food';
function openShop(){G.scene='shop';advTime(1);drawShopBg();renderShop();document.getElementById('shop-ov').classList.add('active');}
function renderShop(){
    document.getElementById('shop-tabs').innerHTML=['food','gear','combat'].map(t=>`<button class="stab${shopTab===t?' act':''}" onclick="shopTab='${t}';renderShop()">${t==='food'?'🍕 MAD':t==='gear'?'👔 STYLE':'⚔️ KAMP'}</button>`).join('');
    const l=document.getElementById('shop-list');l.innerHTML='';
    const items=shopTab==='food'?foodItems:shopTab==='gear'?gearItems:combatItems;
    items.forEach((it,i)=>{
        const bk=shopTab==='gear'&&G.bought.includes('g'+i);
        const d=document.createElement('div');d.className='si'+(bk?' dis':'');
        const desc=shopTab==='food'?'+'+it.hunger+' sult':shopTab==='gear'?'+2 CHARM pts':(it.desc||'');
        d.innerHTML=`<div class="si-l"><span class="si-i">${it.icon}</span><div><div class="si-n">${it.name}</div><div class="si-d">${desc}</div></div></div><div class="si-p">${bk?'KØBT':it.price+' KR'}</div>`;
        if(!bk)d.onclick=()=>{
            if(G.money<it.price){msg('Gulle: "Ingen penge, ingen drip!"');S.bad();return;}
            G.money-=it.price;S.coin();
            if(shopTab==='food'){G.hunger=Math.min(G.maxHunger,G.hunger+it.hunger);S.eat();float('+'+it.hunger+' SULT','#ff006e');msg('+'+it.hunger+' sult!');}
            else if(shopTab==='gear'){G.bought.push('g'+i);G.charmPts+=2;G.charmTotal+=2;float('+2 CHARM','#ffbe0b');}
            else{G.inv.push(it.item);float('+1 '+it.name,'#8b5cf6');}
            renderShop();updHUD();};
        l.appendChild(d);
    });
}

// ===== BRANCHING SKILL TREE =====
const skillTree={
    root:{id:'root',name:'Charm Basis',icon:'🌟',desc:'Start',cost:0,children:['combat','defense','social']},
    combat:{id:'combat',name:'Kampstil',icon:'⚔️',desc:'+3 STR',cost:2,effect:()=>{G.styrke+=3},children:['dmg1','crit']},
    defense:{id:'defense',name:'Forsvar',icon:'🛡️',desc:'+3 CRD',cost:2,effect:()=>{G.cardio+=3},children:['hp1','block1']},
    social:{id:'social',name:'Social',icon:'💬',desc:'+3 TLK',cost:2,effect:()=>{G.smalltalk+=3},children:['mp1','regen']},
    dmg1:{id:'dmg1',name:'Heavy Hits',icon:'💥',desc:'+5 STR',cost:4,effect:()=>{G.styrke+=5},children:['berserker']},
    crit:{id:'crit',name:'Crit Chance',icon:'🎯',desc:'+5 REF',cost:4,effect:()=>{G.reflex+=5},children:['berserker']},
    hp1:{id:'hp1',name:'Bulk Up',icon:'💖',desc:'+5 CRD',cost:4,effect:()=>{G.cardio+=5},children:['tank']},
    block1:{id:'block1',name:'Iron Guard',icon:'🧱',desc:'+5 REF',cost:4,effect:()=>{G.reflex+=5},children:['tank']},
    mp1:{id:'mp1',name:'Deep Talk',icon:'🗣️',desc:'+5 TLK',cost:4,effect:()=>{G.smalltalk+=5},children:['rizz']},
    regen:{id:'regen',name:'Recovery',icon:'💚',desc:'+4 CRD',cost:4,effect:()=>{G.cardio+=4},children:['rizz']},
    berserker:{id:'berserker',name:'BERSERKER',icon:'🔥',desc:'2x Flex DMG!',cost:8,effect:()=>{G.styrke+=5},children:[]},
    tank:{id:'tank',name:'TANK',icon:'🏔️',desc:'+15 CRD +5 REF',cost:8,effect:()=>{G.cardio+=15;G.reflex+=5},children:[]},
    rizz:{id:'rizz',name:'RIZZ MASTER',icon:'👑',desc:'+5 ALL stats!',cost:8,effect:()=>{G.styrke+=5;G.cardio+=5;G.smalltalk+=5;G.reflex+=5},children:[]},
};

function canUnlock(id){
    if(id==='root')return!G.perks.root&&G.charmPts>=0;
    for(const k in skillTree){if(skillTree[k].children.includes(id)&&G.perks[k])return!G.perks[id]&&G.charmPts>=skillTree[id].cost;}
    return false;
}

function openTree(){
    G.scene='tree';
    document.getElementById('tree-sub').textContent='Charm Points: '+G.charmPts+' | Vælg din vej!';
    const w=document.getElementById('tree-w');w.innerHTML='';
    G.perks.root=true;
    // Render tree visually
    function renderRow(ids){
        const row=document.createElement('div');row.className='tree-row';
        ids.forEach(id=>{
            const s=skillTree[id];if(!s)return;
            const unlocked=G.perks[id];const can=canUnlock(id);
            const d=document.createElement('div');
            d.className='tn'+(unlocked?' on':can?'':' off');
            d.innerHTML=`<div class="ti">${s.icon}</div><div class="tt">${s.name}</div><div class="td">${s.desc}</div><div class="tc" style="color:${unlocked?'#00d4aa':'#ff006e'}">${unlocked?'✅':s.cost+' PTS'}</div>`;
            if(can&&!unlocked)d.onclick=()=>{G.charmPts-=s.cost;G.perks[id]=true;if(s.effect)s.effect();S.perf();float('UNLOCKED!','#ffbe0b');openTree();updHUD();};
            row.appendChild(d);
        });
        w.appendChild(row);
    }
    function addLines(){const c=document.createElement('div');c.className='tree-con';c.innerHTML='<div class="tree-line"></div>';w.appendChild(c);}

    // Root
    renderRow(['root']);addLines();
    // 3 branches
    renderRow(['combat','defense','social']);addLines();
    // Sub branches
    renderRow(['dmg1','crit','hp1','block1','mp1','regen']);addLines();
    // Ultimates
    renderRow(['berserker','tank','rizz']);

    document.getElementById('tree-ov').classList.add('active');
}

// ===== WORK =====
const allJobs=[
    {name:'Netto Kassen',pay:[60,110],req:1},{name:'Uber Eats',pay:[80,150],req:1},
    {name:'Lager Vagt',pay:[100,180],req:2},{name:'Bartender',pay:[140,240],req:3},
    {name:'Promoter',pay:[180,300],req:4},{name:'DJ Assistent',pay:[230,380],req:5}];
function openWork(){
    G.scene='work';drawWorkBg();
    document.getElementById('work-sub').textContent=`Ritardo: "Tid er penge!" | LVL ${G.workLvl} (${G.workXP}/${G.workNeed()} XP)`;
    const l=document.getElementById('work-list');l.innerHTML='';
    allJobs.forEach(j=>{
        const lk=G.workLvl<j.req;
        const d=document.createElement('div');d.className='si'+(lk?' dis':'');
        d.innerHTML=`<div class="si-l"><span class="si-i">${lk?'🔒':'💼'}</span><div><div class="si-n">${j.name}</div><div class="si-d">${lk?'Kræver LVL '+j.req:j.pay[0]+'-'+j.pay[1]+' kr | -15 sult | 3t'}</div></div></div><div class="si-p"></div>`;
        if(!lk)d.onclick=()=>{
            if(G.hunger<15){msg('For sulten!');return;}
            G.hunger-=15;advTime(3);
            const earn=j.pay[0]+Math.floor(Math.random()*(j.pay[1]-j.pay[0]));
            G.money+=earn;G.workXP++;
            if(G.workXP>=G.workNeed()){G.workXP=0;G.workLvl++;float('WORK LVL UP!','#00d4aa');msg('Ritardo: "Forfremmet! LVL '+G.workLvl+'!" 🎉');}
            S.coin();float('+'+earn+' KR','#00d4aa');closeOv();};
        l.appendChild(d);
    });
    document.getElementById('work-ov').classList.add('active');
}

// ===== BODEGA =====
const bodegaPool=[
    {name:"Katrine",icon:"🍺",rating:1,abilities:['Bartender Help'],attacks:["Haha nej","Du prøver for hårdt","*bestiller en drink*","Cute men nej","Øhm... kender vi hinanden?","Du ligner en der drikker Harboe","Seriøst? Den replik?","Ej stop, min veninde kigger","Hvem sendte dig herover? 😂","Jeg har en kæreste... tror jeg","*griner nervøst*","Det var næsten charmerende. Næsten."],win:"Katrine giver nummer! 📱",lose:"'Ses aldrig.'"},
    {name:"Tina",icon:"💅",rating:2,abilities:['Øl-Splash'],attacks:["Haha du ligner min ex","Køb mig en øl først","Du danser som en far 😂","*tager en slurk*","Er du altid så... intens?","Min ex sagde det samme 💀","Du har vist drukket nok","*kigger på veninderne og griner*","Prøver du at flirte eller har du krampe?","Okay det var lidt sjovt. Men nej.","Du er modig, det giver jeg dig","Hmm... nej. Men tak for underholdningen."],win:"Tina: 'Du er sgu okay!' 🍻",lose:"'Ej... nej tak.' 😬"},
    {name:"Mette",icon:"🍷",rating:2,abilities:['Wine Throw'],attacks:["Er det din bedste replik?","Min kat er sjovere","*kigger på telefonen*","Prøv igen, skat","Du minder mig om en fyr der skylder mig penge","Hvad er det for en cologne? Desperation?","Åh gud, ikke igen...","*nipper til vinen og ignorerer dig*","Ved du hvad? Nej.","Du ville ikke overleve én dag med mig","Sødt forsøg, forkert pige","Min mor sagde jeg skulle undgå typer som dig"],win:"Mette: 'Okay, én dans!' 💃",lose:"'Kender du ikke hints?' 🙄"},
    {name:"Louise",icon:"🎤",rating:3,abilities:['Karaoke Burn'],attacks:["Kan du overhovedet synge?","Du lugter af gym 💀","Min veninde siger nej","*synger højere end dig*","Jeg synger dig ud af lokalet om lidt","Er det her din audition? Du er dumpet","*dedikerer en sang til din fiasko*","Tonedøv OG charmløs? Wow.","Kan du freestyle? Nej? Farvel.","Din stemme giver mig tinnitus","Hold din dayjob, skat 🎤","*synger 'bye bye bye' direkte til dig*"],win:"Louise: 'Du har charm!' 🎶",lose:"'Stick to the gym, bro.'"},
    {name:"Fie",icon:"📱",rating:3,abilities:['Insta Block'],attacks:["Hvor mange følgere har du?","Ej du er ikke verified","*poster dig på story* 💀","Swipe left IRL","Du er ikke TikTok-worthy","*tager et billede* Det her går på finsta","Under 1000 følgere? Yikes...","Kan du overhovedet redigere reels?","Dit aesthetic er giving 2015","Ej vent, det her er content gold 📸","*checker din profil* Hmm... private? Sus.","Ingen blå flueben, ingen interesse"],win:"Fie: 'Okay du er cute' 📱❤️",lose:"'Blocked IRL.'"},
    {name:"Sara",icon:"💄",rating:4,abilities:['Makeup Shield'],attacks:["Min foundation koster mere end dig","Du er en 4 max","*tager selfie uden dig*","Ew.","Min highlighter skinner mere end din fremtid","Skat, du er ikke i min liga","*retter på sin læbestift*","Hvem gav dig lov til at tale til mig?","Du er giving discount-version af min ex","Er det outfit fra Wish? 💀","Aww du prøver så hårdt. Det er ynkeligt.","Kan du betale min Sephora-regning? Nej? Farvel."],win:"Sara: 'Du er charmerende' 💋",lose:"'Næste.'"},
    {name:"Ida",icon:"🎵",rating:4,abilities:['Bass Drop'],attacks:["Kan du ikke høre beaten?","Din vibe er OFF","*danser væk*","Prøv igen om 10 år","Du er off-beat i livet generelt","Har du nogensinde været til en festival? Du ser ikke ud til det","*sætter høretelefoner på*","Din energi er forkert frekvens","Dine moves er fra 2012","Bass dropper hårdere end dine pick-up lines","*laver en DJ-scratch med munden*","Denne sang handler om at ghoste folk som dig"],win:"Ida: 'Nice moves!' 🎵",lose:"'Cringe.'"},
    {name:"Emma",icon:"🌸",rating:5,abilities:['Friend Zone'],attacks:["Du er SÅ sød... som en ven","Aww cute forsøg","*sender dig til veninderne*","Du minder mig om min bror","Vi er BEDSTE venner nu! Ikke mere.","Ej du er virkelig en god ven ❤️ ...ven.","Skal vi lave en vennegruppe?","Aww du er som en golden retriever. Ven-zonen.","*giver dig et klap på skulderen*","Du ville være PERFEKT til min veninde... nej vent","Bro-energy. Sorry.","Kan du ikke bare være min gay bestie?"],win:"Emma: 'Okay... én date!' 🌸",lose:"'Vi kan være venner?'"},
];
let bodegaUsedToday=false;
const bodegaUpgradeCost=[0,200,500,1000];

function makeScaledGirl(base){
    const r=base.rating;
    return {...base,hp:girlScale(20,r),atk:girlScale(3,r)};
}

function drawBodegaBg(){
    const c=document.getElementById('bodega-bg'),x=c.getContext('2d'),W=c.width,H=c.height,t=Date.now()*.001;
    x.fillStyle='#1a0f05';x.fillRect(0,0,W,H);
    x.fillStyle='#2a1a0a';x.fillRect(0,H*.7,W,H*.3);
    x.fillStyle='#5a3a1a';x.fillRect(30,H*.5,W-60,10);
    x.fillStyle='#3a2510';x.fillRect(35,H*.6,8,H*.2);x.fillRect(W-65,H*.6,8,H*.2);
    x.fillStyle='#888';x.fillRect(W*.4,H*.25,5,H*.25);x.fillRect(W*.5,H*.25,5,H*.25);x.fillRect(W*.6,H*.25,5,H*.25);
    x.fillStyle='#f59e0b';x.fillRect(W*.39,H*.22,7,6);x.fillRect(W*.49,H*.22,7,6);x.fillRect(W*.59,H*.22,7,6);
    for(let i=0;i<8;i++){x.fillStyle=`hsl(${i*40},50%,25%)`;x.fillRect(50+i*35,H*.15,8,20);}
    const glow=.6+Math.sin(t*2)*.3;
    x.shadowColor='#f59e0b';x.shadowBlur=8*glow;x.font="bold 10px 'Press Start 2P'";x.textAlign='center';x.fillStyle=`rgba(245,158,11,${glow})`;x.fillText('🍺 BODEGA LVL '+G.bodegaLvl+' 🍺',W/2,H*.12);x.shadowBlur=0;
    drawNPC(x,W*.7,H*.72,'girl',t);
    x.fillStyle='#333';x.beginPath();x.arc(W-30,H*.35,12,0,Math.PI*2);x.fill();
    x.fillStyle='#c00';x.beginPath();x.arc(W-30,H*.35,8,0,Math.PI*2);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(W-30,H*.35,3,0,Math.PI*2);x.fill();
}

function pickBodegaGirl(){
    const maxR=G.bodegaLvl+1;
    const pool=bodegaPool.filter(g=>g.rating<=maxR);
    const weighted=[];
    pool.forEach(g=>{const w=Math.max(1,maxR+1-g.rating);for(let i=0;i<w;i++)weighted.push(g);});
    return weighted[Math.floor(Math.random()*weighted.length)];
}
function openBodega(){
    G.scene='bodega';advTime(2);drawBodegaBg();
    const sub=document.getElementById('bodega-sub');
    const l=document.getElementById('bodega-list');l.innerHTML='';
    if(bodegaUsedToday){sub.textContent='Du har allerede prøvet i dag! Kom igen i morgen.';
        document.getElementById('bodega-ov').classList.add('active');return;}
    const base=pickBodegaGirl();
    const g=makeScaledGirl(base);
    sub.textContent=`LVL ${G.bodegaLvl} · Tilfældig pige! (1/dag)`;
    const d=document.createElement('div');d.className='si';
    d.innerHTML=`<div class="si-l"><span class="si-i">${g.icon}</span><div><div class="si-n">${g.name}</div><div class="si-d">${g.rating}/10 · ⭐${'⭐'.repeat(g.rating)}</div></div></div><div class="si-p" style="color:#f59e0b">⭐${g.rating}</div>`;
    d.onclick=()=>{bodegaUsedToday=true;document.getElementById('bodega-ov').classList.remove('active');startCombatWithGirl(g);};
    l.appendChild(d);
    const skip=document.createElement('div');skip.className='si';skip.style.borderColor='rgba(255,255,255,.1)';
    skip.innerHTML=`<div class="si-l"><span class="si-i">🚪</span><div><div class="si-n">GÅ IGEN</div><div class="si-d">Gem dit forsøg til i morgen</div></div></div>`;
    skip.onclick=()=>{document.getElementById('bodega-ov').classList.remove('active');G.scene='map';};
    l.appendChild(skip);
    if(G.bodegaLvl<4){
        const cost=bodegaUpgradeCost[G.bodegaLvl];
        const u=document.createElement('div');u.className='si';u.style.borderColor='rgba(245,158,11,.3)';
        u.innerHTML=`<div class="si-l"><span class="si-i">⬆️</span><div><div class="si-n">OPGRADER BODEGA</div><div class="si-d">LVL ${G.bodegaLvl+1} · Sjældnere + stærkere piger</div></div></div><div class="si-p" style="color:#f59e0b">${cost} KR</div>`;
        u.onclick=()=>{if(G.money<cost){msg('Ikke nok penge!');S.bad();return;}G.money-=cost;G.bodegaLvl++;S.perf();float('BODEGA LVL '+G.bodegaLvl+'!','#f59e0b');openBodega();updHUD();};
        l.appendChild(u);
    }
    document.getElementById('bodega-ov').classList.add('active');
}

// ===== LUCKY WHEEL =====
const wheelSlices=[
    {label:'+50 KR',color:'#00d4aa',fn:()=>{G.money+=50;float('+50 KR','#00d4aa');msg('Du vandt 50 kr! 💰');}},
    {label:'+STR Buff',color:'#ff006e',fn:()=>{G.buff='str';G.buffDays=3;G.styrke+=3;float('+3 STR (3 dage)','#ff006e');msg('Styrke buff i 3 dage! 💪');}},
    {label:'-ALL SULT',color:'#000',fn:()=>{G.hunger=Math.max(5,G.hunger-50);float('-50 SULT','#ff006e');S.bad();msg('Madforgiftning! -50 sult! 🤮');}},
    {label:'+100 KR',color:'#ffbe0b',fn:()=>{G.money+=100;float('+100 KR','#ffbe0b');msg('JACKPOT! 100 kr! 🎰');}},
    {label:'-50 KR',color:'#8b5cf6',fn:()=>{G.money=Math.max(0,G.money-50);float('-50 KR','#ff006e');S.bad();msg('Du tabte 50 kr! 😬');}},
    {label:'+HP Buff',color:'#3b82f6',fn:()=>{G.buff='hp';G.buffDays=3;G.cardio+=3;float('HP Buff!','#3b82f6');msg('Buff i 3 dage! ❤️');}},
    {label:'+30 SULT',color:'#ff6b35',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+30);float('+30 SULT','#ff6b35');msg('+30 sult! 🍔');}},
    {label:'-ALL PENGE',color:'#111',fn:()=>{const lost=Math.floor(G.money*.5);G.money-=lost;float('-'+lost+' KR','#ff006e');S.bad();msg('Bestjålet! Halve penge væk! 💸');}},
];
let wheelSpinning=false;

function openWheel(){
    if(G.wheelUsedToday){msg('Du har allerede spundet i dag!');return;}
    G.scene='wheel';
    document.getElementById('wheel-sub').textContent='Spin og test din lykke! (1/dag)';
    document.getElementById('wheel-result').textContent='';
    document.getElementById('wheel-spin-btn').style.display='block';
    wheelSpinning=false;
    // Scale wheel canvas for mobile
    const wc=document.getElementById('wheel-cv');
    const maxSz=Math.min(innerWidth-40,innerHeight*.4,300);
    wc.width=maxSz;wc.height=maxSz;wc.style.width=maxSz+'px';wc.style.height=maxSz+'px';
    drawWheel(0);
    document.getElementById('wheel-ov').classList.add('active');
}

function drawWheel(angle){
    const c=document.getElementById('wheel-cv'),x=c.getContext('2d'),sz=c.width/2;
    x.clearRect(0,0,c.width,c.height);
    x.save();x.translate(sz,sz);x.rotate(angle);
    const n=wheelSlices.length,step=Math.PI*2/n;
    wheelSlices.forEach((s,i)=>{
        x.beginPath();x.moveTo(0,0);x.arc(0,0,sz-4,i*step,(i+1)*step);x.closePath();
        x.fillStyle=s.color;x.fill();x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=2;x.stroke();
        x.save();x.rotate(i*step+step/2);x.textAlign='center';x.font="bold 7px 'Press Start 2P'";
        x.fillStyle='#fff';x.fillText(s.label,sz*.6,3);x.restore();
    });
    x.restore();
}

function spinWheel(){
    if(wheelSpinning)return;wheelSpinning=true;G.wheelUsedToday=true;S.click();
    document.getElementById('wheel-spin-btn').style.display='none';
    const target=Math.random()*Math.PI*2,totalSpin=Math.PI*8+target;
    let angle=0,spd=totalSpin,t=0;
    (function anim(){
        t+=.016;const ease=1-Math.pow(1-Math.min(1,t/3),3);
        angle=totalSpin*ease;drawWheel(angle);
        if(t<3){requestAnimationFrame(anim);}
        else{
            const finalAngle=(angle%(Math.PI*2));
            const sliceAngle=Math.PI*2/wheelSlices.length;
            const idx=Math.floor(((Math.PI*2-finalAngle+Math.PI/2)%(Math.PI*2))/sliceAngle)%wheelSlices.length;
            const result=wheelSlices[idx];
            S.perf();document.getElementById('wheel-result').innerHTML=`<span style="color:${result.color}">${result.label}</span>`;
            setTimeout(()=>{result.fn();updHUD();
                setTimeout(()=>{document.getElementById('wheel-ov').classList.remove('active');
                    if(G.scene!=='end'){G.scene='map';doRest();}},2000);
            },800);
        }
    })();
}

// ===== DAILY EVENTS =====
const eventFriends=[
    {name:'Lemming',icon:'🐹',color:'#ff6b35'},
    {name:'Malte',icon:'🍺',color:'#ffbe0b'},
    {name:'Marius',icon:'🎮',color:'#3b82f6'},
    {name:'Thomas',icon:'⚽',color:'#00d4aa'},
];
const eventScenarios=[
    {text:'{name}: "Bro min hund er løbet væk! Hjælp mig!"',choices:[
        {text:'🔍 Hjælp med at lede',fn:()=>{G.charmPts+=2;G.charmTotal+=2;advTime(2);msg('I fandt hunden!');}},
        {text:'💰 Betal en hundefanger (100 kr)',fn:()=>{if(G.money<100){msg('Ikke nok penge!');return false;}G.money-=100;G.charmPts+=3;G.charmTotal+=3;msg('Professionelt håndteret!');}},
        {text:'🤷 Ignorer det',fn:()=>{G.hunger-=10;S.bad();msg('Dårlig karma...');}},
    ]},
    {text:'{name}: "Skal vi tage en øl? Jeg giver!"',choices:[
        {text:'🍺 Selvfølgelig!',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+20);advTime(3);msg('Hyggelig aften!');}},
        {text:'💪 Nej, jeg skal træne',fn:()=>{G.styrke+=1;msg('Disciplin!');}},
        {text:'💰 Kun hvis du låner mig penge',fn:()=>{if(Math.random()>.5){G.money+=75;msg('Han gav dig penge!');}else{msg('{name}: "Nej bro, det er omvendt" 😂');S.bad();}}},
    ]},
    {text:'{name}: "Der er en fyr der snakker lort om dig!"',choices:[
        {text:'😤 Konfronter ham',fn:()=>{if(Math.random()>.4){G.styrke+=2;msg('Du vandt respekt!');}else{G.hunger-=25;S.bad();msg('Det gik dårligt...');}}},
        {text:'😎 Ignorer det',fn:()=>{G.charmPts+=1;G.charmTotal+=1;msg('Cool og rolig.');}},
        {text:'🗣️ Snak det ud',fn:()=>{G.smalltalk+=2;msg('Diplomatisk løst!');}},
    ]},
    {text:'{name}: "Jeg har fundet en skrabelod! Vi deler!"',choices:[
        {text:'🎰 Del gevinsten',fn:()=>{const w=[0,25,50,150][Math.floor(Math.random()*4)];G.money+=w;msg(w>0?'I vandt '+w+' kr!':'Ingenting... 😅');}},
        {text:'🤑 Tag det hele selv',fn:()=>{if(Math.random()>.5){G.money+=100;msg('Scoret!');}else{msg('{name} er sur på dig.');S.bad();}}},
        {text:'🎁 Giv ham det hele',fn:()=>{G.charmPts+=2;G.charmTotal+=2;msg('Generøst!');}},
    ]},
    {text:'{name}: "Min ex ringer konstant. Hvad gør jeg?"',choices:[
        {text:'📱 Bloker hende',fn:()=>{G.reflex+=1;msg('Godt råd!');}},
        {text:'💬 Snak med hende',fn:()=>{G.smalltalk+=2;msg('Emotional intelligence!');}},
        {text:'😈 Giv mig hendes nummer',fn:()=>{if(Math.random()>.6){G.charmPts+=3;G.charmTotal+=3;msg('Bold move!');}else{G.hunger-=15;S.bad();msg('{name}: "Bro... det er min EX!" 😤');}}},
    ]},
    {text:'{name}: "Vil du være med i en eating contest?"',choices:[
        {text:'🍔 JA!',fn:()=>{if(Math.random()>.3){G.hunger=G.maxHunger;msg('Du vandt! 🏆');}else{G.hunger=Math.max(0,G.hunger-30);S.bad();msg('Du kastede op... 🤮');}}},
        {text:'👀 Bare se på',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+10);msg('Hyggeligt!');}},
        {text:'💪 Nej, protein only',fn:()=>{G.styrke+=1;msg('Disciplin!');}},
    ]},
    {text:'{name}: "Bro jeg har brug for 200 kr... ASAP!"',choices:[
        {text:'💸 Giv ham pengene',fn:()=>{if(G.money<200){msg('Ikke nok penge!');return false;}G.money-=200;if(Math.random()>.5){G.charmPts+=4;G.charmTotal+=4;msg('Han betaler dobbelt tilbage!');}else{msg('Du ser ham aldrig igen... 💸');S.bad();}}},
        {text:'🤝 Lån ham halvdelen',fn:()=>{if(G.money<100){msg('Ikke nok penge!');return false;}G.money-=100;G.charmPts+=2;G.charmTotal+=2;msg('Fair nok!');}},
        {text:'❌ Nej bro',fn:()=>{msg('{name}: "Falsk ven..." 😒');S.bad();}},
    ]},
    {text:'{name}: "Der er gratis mad i parken! Skynd dig!"',choices:[
        {text:'🏃 LØØØB!',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+40);G.cardio+=1;msg('Sprint + gratis mad! 🏃🍔');}},
        {text:'🚶 Gå stille og roligt',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+20);msg('Nåede det!');}},
        {text:'🤔 Det lyder sketchy...',fn:()=>{if(Math.random()>.5){G.reflex+=1;msg('God instinkt!');}else{msg('Det var ægte... du missede gratis mad 😅');}}},
    ]},
    {text:'{name}: "Bro der er en vild fest i aften! VIP!"',choices:[
        {text:'🎉 Kom så!',fn:()=>{advTime(4);G.charmPts+=3;G.charmTotal+=3;G.hunger-=15;msg('VILD fest! Du mødte sjove folk!');}},
        {text:'🛋️ Nej tak, tidlig morgen',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+10);msg('Ansvarligt valg.');}},
        {text:'🕵️ Kun hvis der er piger',fn:()=>{if(Math.random()>.4){G.charmPts+=2;G.charmTotal+=2;G.smalltalk+=1;msg('Der var MANGE piger! 😏');}else{msg('Kun dudes... awkward 😅');}}},
    ]},
    {text:'{name}: "Yo, vil du ha gratis gym-tid? Jeg kender ejeren!"',choices:[
        {text:'💪 Ja tak bro!',fn:()=>{G.styrke+=2;G.cardio+=1;advTime(2);msg('Hård træning! Gratis gains!');}},
        {text:'🏃 Kun cardio',fn:()=>{G.cardio+=2;advTime(1);msg('Solid løbetur!');}},
        {text:'😴 Ork nej...',fn:()=>{msg('{name}: "Lazy ass..." 😤');S.bad();}},
    ]},
    {text:'{name}: "Bro, min nabo spiller musik kl. 3 om natten!"',choices:[
        {text:'🗣️ Jeg snakker med ham',fn:()=>{G.smalltalk+=2;msg('Naboen sagde undskyld!');}},
        {text:'😤 Smæk på døren!',fn:()=>{if(Math.random()>.5){G.styrke+=1;msg('Han stoppede! Respekt!');}else{G.hunger-=20;S.bad();msg('Han var KÆMPE... dårlig idé.');}}},
        {text:'🎧 Giv ham høretelefoner',fn:()=>{if(G.money<50){msg('Ikke nok penge!');return false;}G.money-=50;G.charmPts+=2;G.charmTotal+=2;msg('Kreativ løsning! Alle er glade.');}},
    ]},
    {text:'{name}: "Har du set den nye film? Den er VILD!"',choices:[
        {text:'🎬 Lad os se den!',fn:()=>{if(G.money<80){msg('Ikke nok penge til bio!');return false;}G.money-=80;advTime(3);G.smalltalk+=2;msg('God film og hygge!');}},
        {text:'📱 Jeg streamer den',fn:()=>{advTime(2);G.hunger-=5;msg('Okay film, sparede penge.');}},
        {text:'🙄 Film er spild af tid',fn:()=>{msg('{name}: "Du er kedelig..." 😒');S.bad();}},
    ]},
    {text:'{name}: "Bro, jeg har brug for hjælp til at flytte!"',choices:[
        {text:'📦 Klart bro!',fn:()=>{G.styrke+=2;G.cardio+=1;advTime(4);G.hunger-=25;msg('Hård dag, men godt gjort!');}},
        {text:'🚗 Jeg kører bare bilen',fn:()=>{advTime(2);G.charmPts+=1;G.charmTotal+=1;msg('Nemt nok!');}},
        {text:'😬 Har travlt sorry...',fn:()=>{msg('{name}: "Typisk..." 😤');S.bad();}},
    ]},
    {text:'{name}: "Der er street food festival nede i byen!"',choices:[
        {text:'🌮 FEEED ME!',fn:()=>{if(G.money<60){msg('Ikke nok penge!');return false;}G.money-=60;G.hunger=G.maxHunger;advTime(2);msg('Bedste mad EVER! 🤤');}},
        {text:'👨‍🍳 Jeg laver selv mad',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+15);msg('Hjemmelavet er bedst!');}},
        {text:'📸 Kun for Instagram',fn:()=>{G.charmPts+=1;G.charmTotal+=1;msg('Fik et godt billede i det mindste 📸');}},
    ]},
    {text:'{name}: "Bro, vil du vædde 100 kr om arm wrestling?"',choices:[
        {text:'💪 BRING IT!',fn:()=>{if(G.money<100){msg('Ikke nok penge!');return false;}if(G.styrke>=3||Math.random()>.5){G.money+=100;G.styrke+=1;msg('DU VANDT! +100 KR! 💪');}else{G.money-=100;S.bad();msg('Tabt... der røg 100 kr 😤');}}},
        {text:'🧠 Nej, det er en fælde',fn:()=>{G.reflex+=1;msg('Smart valg, han snyder altid!');}},
        {text:'🗣️ Dobbelt eller intet!',fn:()=>{if(G.money<200){msg('Ikke nok penge!');return false;}if(Math.random()>.6){G.money+=200;msg('JACKPOT! +200 KR! 🤑');}else{G.money-=200;S.bad();msg('RIP dine penge... 💸');}}},
    ]},
    {text:'{name}: "Yo! En fyr tabte sin pung. Skal vi returnere den?"',choices:[
        {text:'🤝 Selvfølgelig!',fn:()=>{G.charmPts+=3;G.charmTotal+=3;msg('Manden gav jer 150 kr i dusør!');G.money+=150;}},
        {text:'💰 Behold pengene...',fn:()=>{G.money+=200;msg('Fandt 200 kr! Men dårlig samvittighed...');G.hunger-=10;}},
        {text:'🏃 Løb efter ham!',fn:()=>{G.cardio+=1;G.charmPts+=2;G.charmTotal+=2;msg('Du nåede ham! Han var super taknemmelig!');}},
    ]},
    {text:'{name}: "Kender du en god date-restaurant? Har brug for tips!"',choices:[
        {text:'🍝 Jeg kender det perfekte sted',fn:()=>{G.smalltalk+=2;G.charmPts+=1;G.charmTotal+=1;msg('Han scorede! Du er en wingman-legende!');}},
        {text:'🍔 McD er altid safe',fn:()=>{msg('{name}: "Bro... det er vores 1-års" 😂');G.smalltalk+=1;}},
        {text:'😏 Tag hende med hjem og lav mad',fn:()=>{G.charmPts+=2;G.charmTotal+=2;msg('{name}: "Bro det VIRKEDE!" 🔥');}},
    ]},
    {text:'{name}: "Der er en sketchy fyr der følger efter mig!"',choices:[
        {text:'😤 Lad os konfrontere ham',fn:()=>{G.styrke+=1;G.reflex+=1;advTime(1);msg('Fyren løb væk! I er et godt team!');}},
        {text:'📱 Ring til politiet',fn:()=>{G.reflex+=1;msg('De kom hurtigt. God beslutning!');}},
        {text:'🏃 Løb den anden vej!',fn:()=>{G.cardio+=2;advTime(1);msg('I løb 2 km! Cardio gains men traumatisk 😅');}},
    ]},
    {text:'{name}: "Bro, vil du med til karaoke? Jeg har reserveret!"',choices:[
        {text:'🎤 LET\'S GO!',fn:()=>{if(G.money<50){msg('Ikke nok penge!');return false;}G.money-=50;G.smalltalk+=2;G.charmPts+=1;G.charmTotal+=1;advTime(3);msg('EPISK karaoke-aften! 🎶');}},
        {text:'🎵 Kun hvis jeg vælger sange',fn:()=>{G.smalltalk+=1;advTime(2);msg('Du sang Backstreet Boys. Legendarisk.');}},
        {text:'🙅 Jeg synger IKKE',fn:()=>{msg('{name}: "Party pooper..." 😒');}},
    ]},
    {text:'{name}: "Yo, min cykel er stjålet! Hjælp mig finde den!"',choices:[
        {text:'🔍 Vi finder den!',fn:()=>{advTime(3);if(Math.random()>.4){G.reflex+=2;msg('FUNDET! Den stod bag Netto hele tiden 😂');}else{G.cardio+=1;msg('Fandt den ikke... men god motion!');}}},
        {text:'💰 Køb en ny (200 kr)',fn:()=>{if(G.money<200){msg('Ikke nok penge!');return false;}G.money-=200;G.charmPts+=3;G.charmTotal+=3;msg('{name}: "Bro du er den BEDSTE!" 😭');}},
        {text:'🚶 Bare gå bro',fn:()=>{msg('{name}: "Nemt for dig at sige..." 😤');S.bad();}},
    ]},
    {text:'{name}: "Bro, der er open mic comedy i aften!"',choices:[
        {text:'😂 Jeg prøver!',fn:()=>{advTime(2);if(G.smalltalk>=3||Math.random()>.5){G.charmPts+=3;G.charmTotal+=3;G.smalltalk+=1;msg('Publikum ELSKEDE dig! Standing ovation! 🎤');}else{G.hunger-=10;S.bad();msg('Crickets... pinligt 😬');}}},
        {text:'👀 Jeg ser bare på',fn:()=>{advTime(2);G.smalltalk+=1;msg('Sjov aften! Lærte nye jokes.');}},
        {text:'📝 Hjælp mig skrive materiale',fn:()=>{G.smalltalk+=2;msg('{name} hjalp dig! Du har nu killer jokes!');}},
    ]},
];

function showRandomEvent(){
    eventMarker=null;G.eventDoneToday=true;
    const friend=eventFriends[Math.floor(Math.random()*eventFriends.length)];
    const scenario={...eventScenarios[Math.floor(Math.random()*eventScenarios.length)]};
    G.scene='event';
    document.getElementById('ev-icon').textContent=friend.icon;
    document.getElementById('ev-name').textContent=friend.name;
    document.getElementById('ev-name').style.color=friend.color;
    document.getElementById('ev-text').textContent=scenario.text.replace(/\{name\}/g,friend.name);
    const ch=document.getElementById('ev-choices');ch.innerHTML='';
    scenario.choices.forEach(c=>{
        const b=document.createElement('button');b.className='ev-btn';
        b.textContent=c.text.replace(/\{name\}/g,friend.name);
        b.onclick=()=>{
            const oldMoney=G.money,oldStr=G.styrke,oldCrd=G.cardio,oldTlk=G.smalltalk,oldRef=G.reflex,oldCharm=G.charmPts,oldHunger=G.hunger;
            const result=c.fn();
            if(result===false)return;
            updHUD();
            // Show reward summary
            let rewards=[];
            if(G.money!==oldMoney)rewards.push((G.money>oldMoney?'+':'')+( G.money-oldMoney)+' KR');
            if(G.styrke!==oldStr)rewards.push('+'+(G.styrke-oldStr)+' STR');
            if(G.cardio!==oldCrd)rewards.push('+'+(G.cardio-oldCrd)+' CRD');
            if(G.smalltalk!==oldTlk)rewards.push('+'+(G.smalltalk-oldTlk)+' TLK');
            if(G.reflex!==oldRef)rewards.push('+'+(G.reflex-oldRef)+' REF');
            if(G.charmPts!==oldCharm)rewards.push('+'+(G.charmPts-oldCharm)+' CHARM');
            if(G.hunger!==oldHunger)rewards.push((G.hunger>oldHunger?'+':'')+(G.hunger-oldHunger)+' SULT');
            if(rewards.length>0){document.getElementById('ev-text').textContent=rewards.join(' | ');}
            setTimeout(()=>{document.getElementById('event-ov').classList.remove('active');G.scene='map';},2500);
        };
        ch.appendChild(b);
    });
    document.getElementById('event-ov').classList.add('active');
}

// ===== COMBAT =====
const girlsByRound=[
    [{name:"Sofie",icon:"👩‍🦰",rating:5,abilities:['Øjenrulle'],attacks:["Du er ikke min type lol","Ew hvem inviterede dig?","Haha cute... men nej 💀","*ruller med øjnene*","Prøvede du lige at wink? Det lignede et tic","Jeg har set bedre pick-up lines på Reddit","Min veninde siger du ligner hendes onkel","*griner med veninderne og peger*","Du prøver SÅ hårdt, det er pinligt","Hmm... nej. Next.","Er det her en dare fra dine venner?","*tager en stor slurk af sin drink*","Okay wow. Det var IKKE det right move.","Du minder mig om en fyr jeg ghostede"],win:"Sofie giver sit nummer! 📱",lose:"'Nice try...' Hun vender sig."}],
    [{name:"Nadia",icon:"💃",rating:6,abilities:['Gab','Ignorér'],attacks:["Du danser som min farfar 💀","Er det DIT bedste?","Min ex var sjovere","*gaber højlydt*","Jeg har set bedre moves til en begravelse","*checker naglelak midt i din replik*","Sorry, sagde du noget? Jeg lyttede ikke","Har du overvejet at IKKE danse?","Det der var så akavet, jeg fik gåsehud","*danser circles around dig*","Du har energien af en våd karklud","Aww du prøver. Det er det sørgelige.","Min lille søster har bedre moves","*vender ryggen til og danser videre*"],win:"Nadia: 'Vi danser hele natten!' 🎶",lose:"Friendzoned."}],
    [{name:"Jasmin",icon:"👸",rating:8,abilities:['Gucci Shame','Security Call'],attacks:["Kender du Gucci fra Zara?","Du LUGTER af Netto 🤢","Sikkerhed? Remove this.","*sender billede til veninderne*","Er det et Shein-outfit? Bro...","Mine øreringe koster mere end din husleje","*tager en selfie og cropper dig ud*","Ej, stod du i kø til VIP? Cute.","Security kender mig by name. Watch it.","Du er ikke på gæstelisten over mit liv","Min chauffør er sjovere end dig","*kigger dig op og ned* ...nej.","Prøver du at imponere MIG? Med DET?","Har du nogensinde set indersiden af en Gucci-butik?"],win:"'Du er anderledes...' 💎",lose:"Vagten eskorterer dig ud."}],
    [{name:"Isabella",icon:"👑",rating:10,abilities:['DM Flex','Chihuahua Attack','Hele Klubben Griner'],attacks:["Min DM er fyldt med bedre","Du er nummer INGENTING 💀","Min chihuahua har mere game","*hele klubben griner*","Jeg har afvist kendisser, du er INGEN","Min Instagram har flere følgere end din by","*hendes bodyguard tager et skridt fremad*","Du taler til den forkerte person, skat","Ej vent... 😂 du er SERIØS?! 😂😂","Min sidste date havde en yacht. Hvad har du?","*sender voice note til veninderne om dig*","Du giver main character energy... i en tragedy","Selv min bartender har bedre game","*kigger igennem dig som du er luft*","Cute. Men jeg dater kun op, aldrig ned.","Har du prøvet Tinder? Det er mere dit niveau."],win:"HELE KLUBBEN SER DET!\nHANZI ER #1 IGEN! 👑🔥",lose:"'Tæt på... men nej.'"}]
];

let C={girl:null,hHP:0,hMax:0,hMP:0,hMMax:0,gHP:0,gMax:0,phase:'menu',shield:0,blockBuff:0,dmgBuff:0,enemyDebuff:0,poison:0,confused:0,ally:null};
let combatAF=null;

function startCombatWithGirl(girl){
    G.scene='combat';Mus.play('fight');
    if(!girl.hp)girl=makeScaledGirl(girl);
    C.girl=girl;
    C.hMax=G.maxHP;C.hHP=C.hMax;C.hMMax=G.maxMP;C.hMP=C.hMMax;
    C.gMax=C.girl.hp;C.gHP=C.gMax;C.phase='menu';C.shield=0;C.blockBuff=0;C.dmgBuff=0;C.enemyDebuff=0;C.poison=0;C.confused=0;C.ally=null;
    document.getElementById('combat-ui').classList.add('active');
    rsz();startCombatBg();updC();
    cSpeech(C.girl.icon+' '+C.girl.name+' ('+C.girl.rating+'/10) dukker op! 💃');
    setTimeout(showCMenu,3000);
}

function startCombatBg(){
    const cc=document.getElementById('c-cv'),cx2=cc.getContext('2d');
    (function drawCBg(){
        if(G.scene!=='combat'){return;}
        const W=cc.width,H=cc.height,t=Date.now()*.001;
        cx2.clearRect(0,0,W,H);
        // Dark club
        cx2.fillStyle='#08000f';cx2.fillRect(0,0,W,H);
        // Dance floor tiles
        const tileS=35;const fY=H*.45;
        for(let y=fY;y<H;y+=tileS)for(let x2=0;x2<W;x2+=tileS){
            const hue=(x2+y+t*60)%360;const bri=8+Math.sin(t*3+x2*.05+y*.03)*4;
            cx2.fillStyle=`hsl(${hue},50%,${bri}%)`;cx2.fillRect(x2+1,y+1,tileS-2,tileS-2);}
        // Spotlights
        for(let i=0;i<3;i++){
            const sx=W*(.2+i*.3)+Math.sin(t*2+i)*30;
            const grd=cx2.createRadialGradient(sx,0,0,sx,H*.5,H*.4);
            grd.addColorStop(0,`hsla(${(t*50+i*120)%360},100%,50%,.06)`);grd.addColorStop(1,'transparent');
            cx2.fillStyle=grd;cx2.fillRect(0,0,W,H);}
        // DJ booth
        cx2.fillStyle='#1a0030';cx2.fillRect(W*.35,10,W*.3,30);
        cx2.fillStyle='#ff006e';cx2.shadowColor='#ff006e';cx2.shadowBlur=4;cx2.font="bold 8px 'Press Start 2P'";cx2.textAlign='center';cx2.fillText('♪ DJ ♪',W*.5,28);cx2.shadowBlur=0;
        // Dancing silhouettes
        for(let i=0;i<6;i++){
            const dx=W*(.08+i*.15),dy=fY-10+Math.sin(t*4+i*2)*5;
            cx2.fillStyle='rgba(255,255,255,.04)';cx2.beginPath();cx2.arc(dx,dy,4,0,Math.PI*2);cx2.fill();
            cx2.fillRect(dx-2,dy+4,4,8);}
        // Hanzi (left side)
        drawNPC(cx2,W*.25,H*.55,'leth',t);
        // Ally (next to Hanzi)
        if(C.ally){drawNPC(cx2,W*.12,H*.6,C.ally.type,t);cx2.font="bold 6px 'Press Start 2P'";cx2.textAlign='center';cx2.fillStyle='#a855f7';cx2.fillText(C.ally.name,W*.12,H*.6+25);}
        // Girl (right side)
        if(C.girl){
            cx2.save();cx2.translate(W*.75,H*.5);
            const gb=Math.sin(t*3)*2;
            cx2.fillStyle='#f0c8a0';cx2.beginPath();cx2.arc(0,-18+gb,8,0,Math.PI*2);cx2.fill();
            cx2.fillStyle='#a0522d';cx2.beginPath();cx2.arc(0,-23+gb,9,Math.PI,.1);cx2.fill();
            cx2.fillStyle='#ff006e';cx2.fillRect(-7,-10+gb,14,18);
            cx2.fillStyle='#f0c8a0';cx2.fillRect(-4,8+gb,3,10);cx2.fillRect(1,8+gb,3,10);
            cx2.restore();
        }
        combatAF=requestAnimationFrame(drawCBg);
    })();
}

function updC(){
    let hBuf='';
    if(C.blockBuff>0)hBuf+='🛡️x'+C.blockBuff+' ';
    if(C.shield>0)hBuf+='🛡️'+C.shield+' ';
    if(C.dmgBuff>0)hBuf+='⚔️x'+C.dmgBuff+' ';
    if(C.ally)hBuf+='📞'+C.ally.name+'('+C.ally.turnsLeft+') ';
    let gBuf='';
    if(C.enemyDebuff>0)gBuf+='😏x'+C.enemyDebuff+' ';
    if(C.poison>0)gBuf+='☠️x'+C.poison+' ';
    document.getElementById('c-hanzi').innerHTML=`<div class="cname" style="color:#00d4aa">HANZI 🕺 <span style="font-size:.6em">${hBuf}</span></div><div class="crow"><label style="color:#ff006e">HP</label><div class="ctrk"><div class="cf" style="width:${C.hHP/C.hMax*100}%;background:#ff006e"></div></div><span class="cv">${C.hHP}</span></div><div class="crow"><label style="color:#3b82f6">MP</label><div class="ctrk"><div class="cf" style="width:${C.hMP/C.hMMax*100}%;background:#3b82f6"></div></div><span class="cv">${C.hMP}</span></div>`;
    document.getElementById('c-girl').innerHTML=`<div class="cname" style="color:#ff006e">${C.girl.icon} ${C.girl.name} <span style="font-size:.6em">${gBuf}</span></div><div class="crow"><label style="color:#ff006e">HP</label><div class="ctrk"><div class="cf" style="width:${C.gHP/C.gMax*100}%;background:#ff006e"></div></div><span class="cv">${C.gHP}</span></div>`;
}

function cSpeech(t){const s=document.getElementById('c-speech');s.textContent=t;s.classList.add('show');
    const dur=Math.max(4000,t.length*120);clearTimeout(cSpeech._t);cSpeech._t=setTimeout(()=>s.classList.remove('show'),dur);}
function cAct(t,c='#fff'){const e=document.getElementById('c-act');e.textContent=t;e.style.color=c;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1500);}

function showCMenu(){
    C.phase='menu';document.getElementById('c-items').style.display='none';
    const m=document.getElementById('c-menu');m.style.display='grid';m.innerHTML='';
    const moves=[
     {name:'DANS',icon:'🕺',desc:'90% · 1 MP',color:'#ff006e',mp:1,act:()=>doAtk('dans',90,1,G.dmg,'Hanzi: "Watch this move!" 🕺')},
     {name:'ORMEN',icon:'🐛',desc:'50% · 1 MP · 1.8x',color:'#ff6b35',mp:1,act:()=>doAtk('orm',50,1,Math.floor(G.dmg*1.8),'Hanzi: "ORMEN! 🐛🔥"')},
     {name:'TBH DANS',icon:'🔥',desc:'10% · 1 MP · MEGA',color:'#ffbe0b',mp:1,act:()=>doTBH()},
     {name:'PICKUP LINE',icon:'🗣️',desc:'Taktik · 1 MP',color:'#3b82f6',mp:1,act:showPickupMenu},
     {name:'TILKALD VEN',icon:'📞',desc:'Kald hjælp · 1 MP',color:'#a855f7',mp:1,act:doCallAlly},
     {name:'OPKAST',icon:'🤮',desc:'+MP · Taktisk',color:'#00d4aa',mp:0,act:doOpkast},
     {name:'ITEMS',icon:'🎒',desc:'Brug items',color:'#8b5cf6',mp:0,act:showCItems}
    ];
    moves.forEach(mv=>{
        const b=document.createElement('button');b.className='cbtn';b.style.borderColor=mv.color;b.style.color=mv.color;
        if(mv.mp>C.hMP){b.style.opacity='.25';b.style.pointerEvents='none';}
        b.innerHTML=`<span class="ci">${mv.icon}</span>${mv.name}<span class="cc">${mv.desc}</span>`;
        b.onclick=mv.act;m.appendChild(b);
    });
}

function showPickupMenu(){
    S.click();document.getElementById('c-menu').style.display='none';
    const m=document.getElementById('c-menu');m.style.display='grid';m.innerHTML='';
    const lines=[
     {name:'SKJOLD',icon:'🛡️',desc:'Halver skade 2 ture · 1 MP',color:'#3b82f6',act:()=>{m.style.display='none';C.hMP=Math.max(0,C.hMP-1);C.blockBuff=2;S.ok();cAct('🛡️ SKJOLD!','#3b82f6');cSpeech('"Du rammer mig ikke!" Halv skade i 2 ture!');updC();setTimeout(eTurn,2200);}},
     {name:'HYPE',icon:'⚔️',desc:'+50% skade 2 ture · 1 MP',color:'#ff6b35',act:()=>{m.style.display='none';C.hMP=Math.max(0,C.hMP-1);C.dmgBuff=3;S.ok();cAct('⚔️ DMG BUFF!','#ff6b35');cSpeech('"Jeg er UOVERVINDELIG!" +50% skade');updC();setTimeout(eTurn,2200);}},
     {name:'DISS',icon:'😏',desc:'-30% fjendens skade · 1 MP',color:'#00d4aa',act:()=>{m.style.display='none';C.hMP=Math.max(0,C.hMP-1);C.enemyDebuff=3;S.ok();cAct('😏 DEBUFF!','#00d4aa');cSpeech('"Din mascara løber!" Hun bliver usikker');updC();setTimeout(eTurn,2200);}},
     {name:'GIFT',icon:'☠️',desc:'Skader over tid · 1 MP',color:'#a855f7',act:()=>{m.style.display='none';C.hMP=Math.max(0,C.hMP-1);C.poison=4;S.ok();cAct('☠️ FORGIFTET!','#a855f7');cSpeech('"Den drink var... speciel" ☠️ Gift i 4 ture!');updC();setTimeout(eTurn,2200);}},
    ];
    lines.forEach(l=>{
        const b=document.createElement('button');b.className='cbtn';b.style.borderColor=l.color;b.style.color=l.color;
        b.innerHTML=`<span class="ci">${l.icon}</span>${l.name}<span class="cc">${l.desc}</span>`;
        b.onclick=l.act;m.appendChild(b);
    });
    const back=document.createElement('button');back.className='cbtn';back.style.borderColor='#888';back.style.color='#888';
    back.innerHTML='<span class="ci">←</span>TILBAGE<span class="cc"></span>';
    back.onclick=()=>{S.click();showCMenu();};m.appendChild(back);
}

function doCallAlly(){
    S.click();document.getElementById('c-menu').style.display='none';
    C.hMP=Math.max(0,C.hMP-1);
    const roll=Math.random();
    if(roll<.3){C.ally={name:'Gulle',turnsLeft:3,type:'gulle'};S.ok();cAct('📞 GULLE!','#8b5cf6');cSpeech('Gulle dukker op! "Yo bro, jeg hjælper!" (svag skade i 3 ture)');}
    else if(roll<.7){C.ally={name:'Ritardo',turnsLeft:3,type:'ritardo'};S.ok();cAct('📞 RITARDO!','#059669');cSpeech('Ritardo er her! "Jeg har styr på det!" (moderat skade/heal i 3 ture)');}
    else{C.ally={name:'LETH',turnsLeft:2,type:'leth'};S.perf();cAct('📞 LETH! 💪','#dc2626');cSpeech('LETH stormer ind! "BRO JEG ER HER!" (mega skade + debuff i 2 ture) 🔥');}
    updC();setTimeout(eTurn,2500);
}

function doOpkast(){
    S.click();document.getElementById('c-menu').style.display='none';
    const restore=Math.floor(C.hMMax*.3)+Math.floor(Math.random()*5);
    C.hMP=Math.min(C.hMMax,C.hMP+restore);
    S.ok();cAct('🤮 +'+restore+' MP','#00d4aa');
    cSpeech('Hanzi kaster op taktisk... +'+restore+' MP! 🤮');
    updC();setTimeout(eTurn,2200);
}

function doTBH(){
    S.click();document.getElementById('c-menu').style.display='none';
    C.hMP=Math.max(0,C.hMP-1);updC();
    const hitChance=10+Math.floor(G.reflex*.5);
    cSpeech('Hanzi: "DEN HER ER FOR TBH!!!" 🔥🔥🔥');
    setTimeout(()=>{
        if(Math.random()*100>hitChance){
            S.bad();cAct('MISS! ('+hitChance+'%)','#ff006e');
            cSpeech('TBH dansen fejlede! Alt den MP spildt... 😤');
            updC();chkEnd()||setTimeout(eTurn,2500);return;
        }
        const base=Math.floor(G.dmg*4)+G.styrke*3+G.smalltalk*2;
        cSpeech('TBH DANS RAMMER! MEGA SKADE + BUFFS! 🔥');
        setTimeout(()=>runMiniGame(q=>{
            let mult=q==='perfect'?2.5:q==='good'?2:q==='ok'?1.5:1;
            let dmg=Math.max(1,Math.floor(base*mult));
            C.gHP=Math.max(0,C.gHP-dmg);
            C.dmgBuff=3;C.enemyDebuff=2;C.shield+=Math.floor(C.hMax*.2);
            S.perf();cAct('💥 TBH! -'+dmg,'#ffbe0b');
            cSpeech('LEGENDARISK! -'+dmg+' HP + buff + debuff + skjold!');
            updC();chkEnd()||setTimeout(eTurn,2500);
        }),1200);
    },1500);
}

function showCItems(){
    S.click();document.getElementById('c-menu').style.display='none';
    const it=document.getElementById('c-items');it.style.display='flex';it.innerHTML='';
    const cnt=k=>G.inv.filter(i=>i===k).length;
    [{n:'Drink',i:'🍹',k:'drink',c:cnt('drink'),fn:()=>{G.inv.splice(G.inv.indexOf('drink'),1);const d=8+G.styrke;C.gHP=Math.max(0,C.gHP-d);S.ok();cAct('🍹 -'+d,'#ffbe0b');cSpeech('Drink kastet! -'+d+' HP!');updC();chkEnd()||setTimeout(eTurn,2200);}},
     {n:'Energy',i:'⚡',k:'energy',c:cnt('energy'),fn:()=>{G.inv.splice(G.inv.indexOf('energy'),1);const h=Math.min(C.hMMax-C.hMP,12);C.hMP+=h;S.heal();cAct('+'+h+' MP','#3b82f6');updC();setTimeout(eTurn,2200);}},
     {n:'Heal',i:'🍫',k:'heal',c:cnt('heal'),fn:()=>{G.inv.splice(G.inv.indexOf('heal'),1);const h=Math.min(C.hMax-C.hHP,20);C.hHP+=h;S.heal();cAct('+'+h+' HP','#ff006e');updC();setTimeout(eTurn,2200);}}
    ].forEach(x=>{const b=document.createElement('button');b.className='citem'+(x.c<=0?' dis':'');b.textContent=x.i+' '+x.n+'('+x.c+')';b.onclick=()=>{if(x.c<=0)return;it.style.display='none';x.fn();};it.appendChild(b);});
    const back=document.createElement('button');back.className='citem';back.textContent='← TILBAGE';back.onclick=()=>{S.click();showCMenu();};it.appendChild(back);
}

function doAtk(type,hitPct,mpCost,base,speech){
    S.click();document.getElementById('c-menu').style.display='none';
    C.hMP=Math.max(0,C.hMP-mpCost);
    if(C.dmgBuff>0)base=Math.floor(base*1.5);
    if(C.confused>0){hitPct=Math.max(10,hitPct-10);C.confused--;}
    cSpeech(speech);updC();
    if(Math.random()*100>hitPct){
        setTimeout(()=>{S.bad();cAct('MISS! ('+hitPct+'%)','#ff006e');cSpeech('Misset! Bedre held næste gang!');updC();chkEnd()||setTimeout(eTurn,2500);},1500);
        return;
    }
    setTimeout(()=>{
        cSpeech('MINI-GAME! Bestem din skade! 🎮');
        setTimeout(()=>runMiniGame(q=>{
            let mult=q==='perfect'?1.8:q==='good'?1.3:q==='ok'?1:.6;
            if(G.perks.berserker&&type==='orm')mult*=1.5;
            let dmg=Math.max(1,Math.floor(base*mult));
            C.gHP=Math.max(0,C.gHP-dmg);
            if(q==='perfect'){S.perf();cAct('PERFEKT! -'+dmg,'#ffbe0b');}
            else if(q==='good'){S.ok();cAct('-'+dmg,'#00d4aa');}
            else{S.click();cAct('-'+dmg,'#aaa');}
            updC();chkEnd()||setTimeout(eTurn,2500);
        }),1000);
    },1500);
}

// ===== COMBAT MINI-GAMES =====
let mgCleanup=null;
function runMiniGame(cb){
    const cc=document.getElementById('c-cv'),ctx=cc.getContext('2d');
    const W=cc.width,H=cc.height;
    const games=[mgStopBar,mgReaction,mgWhack,mgDodge,mgSequence,mgCatch];
    const game=games[Math.floor(Math.random()*games.length)];
    if(mgCleanup){mgCleanup();mgCleanup=null;}
    cancelAnimationFrame(combatAF);
    const wrappedCb=(q)=>{if(mgCleanup){mgCleanup();mgCleanup=null;}startCombatBg();cb(q);};
    game(ctx,W,H,wrappedCb);
}

// MG1: Stop the bar (classic)
function mgStopBar(ctx,W,H,cb){
    const zs=30+Math.random()*20,zw=12+Math.max(0,G.reflex)*1.2;
    let pos=0,spd=1.5+G.round*.3,active=true;
    cSpeech('TAP i den grønne zone! 🎯');
    const failsafe=setTimeout(()=>{if(active){active=false;cleanup();cb('miss');}},8000);
    function draw(){
        if(!active)return;
        ctx.clearRect(0,0,W,H);
        const bY=H*.45,bH=24,bX=W*.1,bW=W*.8;
        ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(bX,bY,bW,bH);
        ctx.fillStyle='rgba(0,212,170,.3)';ctx.fillRect(bX+bW*zs/100,bY,bW*Math.min(35,zw)/100,bH);
        ctx.fillStyle='#fff';ctx.fillRect(bX+bW*pos/100,bY,3,bH);
        ctx.shadowColor='#fff';ctx.shadowBlur=6;ctx.fillRect(bX+bW*pos/100,bY,3,bH);ctx.shadowBlur=0;
        pos+=spd;if(pos>=100||pos<=0)spd*=-1;pos=Math.max(0,Math.min(100,pos));
        requestAnimationFrame(draw);
    }
    const tap=()=>{if(!active)return;active=false;clearTimeout(failsafe);cleanup();
        const inZ=pos>=zs&&pos<=zs+zw,cd=Math.abs(pos-(zs+zw/2));
        cb(inZ&&cd<zw*.2?'perfect':inZ?'good':Math.abs(pos-zs)<7?'ok':'miss');
    };
    function cleanup(){document.removeEventListener('mousedown',tap);document.removeEventListener('touchstart',tap);document.removeEventListener('keydown',tap);}
    document.addEventListener('mousedown',tap);document.addEventListener('touchstart',tap);document.addEventListener('keydown',tap);
    mgCleanup=()=>{active=false;clearTimeout(failsafe);cleanup();};
    draw();
}

// MG2: Reaction (tap when green)
function mgReaction(ctx,W,H,cb){
    let phase='wait',startT=0,active=true;
    const delay=1000+Math.random()*2000;
    cSpeech('Vent... TAP når cirklen bliver GRØN! ⚡');
    const failsafe=setTimeout(()=>{if(active){active=false;cleanup();cb('miss');}},8000);
    function draw(){
        if(!active)return;
        ctx.clearRect(0,0,W,H);
        const cx2=W/2,cy=H*.45,r=40;
        if(phase==='wait'){
            ctx.fillStyle='#ff006e';ctx.beginPath();ctx.arc(cx2,cy,r,0,Math.PI*2);ctx.fill();
            ctx.font="bold 10px 'Press Start 2P'";ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('VENT...',cx2,cy+4);
            if(Date.now()-startT>delay){phase='go';startT=Date.now();}
        }else{
            ctx.fillStyle='#00d4aa';ctx.shadowColor='#00d4aa';ctx.shadowBlur=15;
            ctx.beginPath();ctx.arc(cx2,cy,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
            ctx.font="bold 10px 'Press Start 2P'";ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('TAP NU!',cx2,cy+4);
            if(Date.now()-startT>1500){active=false;clearTimeout(failsafe);cleanup();cb('miss');return;}
        }
        requestAnimationFrame(draw);
    }
    const tap=()=>{if(!active)return;
        if(phase==='wait'){active=false;clearTimeout(failsafe);cleanup();S.bad();cAct('FOR TIDLIGT!','#ff006e');cb('miss');return;}
        active=false;clearTimeout(failsafe);cleanup();
        const rt=Date.now()-startT;
        cb(rt<200?'perfect':rt<400?'good':rt<700?'ok':'miss');
    };
    function cleanup(){document.removeEventListener('mousedown',tap);document.removeEventListener('touchstart',tap);document.removeEventListener('keydown',tap);}
    startT=Date.now();
    document.addEventListener('mousedown',tap);document.addEventListener('touchstart',tap);document.addEventListener('keydown',tap);
    mgCleanup=()=>{active=false;clearTimeout(failsafe);cleanup();};
    draw();
}

// MG3: Whack-a-mole (tap targets)
function mgWhack(ctx,W,H,cb){
    let score=0,total=0,active=true,targets=[],spawnT=0;
    const need=5;
    cSpeech('TAP alle mål! 🎯 '+need+' hits!');
    const failsafe=setTimeout(()=>{if(active){active=false;cleanup();cb(score>=4?'good':score>=2?'ok':'miss');}},8000);
    const tap=e=>{if(!active)return;
        const rect=document.getElementById('c-cv').getBoundingClientRect();
        const mx=((e.clientX||(e.touches&&e.touches[0]?e.touches[0].clientX:0))-rect.left)*(W/rect.width);
        const my=((e.clientY||(e.touches&&e.touches[0]?e.touches[0].clientY:0))-rect.top)*(H/rect.height);
        for(let i=targets.length-1;i>=0;i--){
            if(Math.hypot(mx-targets[i].x,my-targets[i].y)<targets[i].r+8){targets.splice(i,1);score++;S.click();break;}
        }
    };
    document.getElementById('c-cv').addEventListener('touchstart',tap);
    document.getElementById('c-cv').addEventListener('mousedown',tap);
    function draw(){
        if(!active)return;
        ctx.clearRect(0,0,W,H);
        const now=Date.now();
        if(now-spawnT>500&&total<10){targets.push({x:30+Math.random()*(W-60),y:30+Math.random()*(H-60),r:20,born:now});total++;spawnT=now;}
        targets=targets.filter(t=>{
            const life=1-Math.min(1,(now-t.born)/1500);
            if(life<=0)return false;
            ctx.globalAlpha=life;ctx.fillStyle='#ff006e';ctx.beginPath();ctx.arc(t.x,t.y,t.r*(.5+life*.5),0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#fff';ctx.font='14px serif';ctx.textAlign='center';ctx.fillText('🎯',t.x,t.y+5);
            ctx.globalAlpha=1;return true;
        });
        ctx.font="bold 9px 'Press Start 2P'";ctx.textAlign='right';ctx.fillStyle='#ffbe0b';ctx.fillText(score+'/'+need,W-10,20);
        if(score>=need){active=false;clearTimeout(failsafe);cleanup();cb('perfect');return;}
        if(total>=10&&targets.length===0){active=false;clearTimeout(failsafe);cleanup();cb(score>=4?'good':score>=2?'ok':'miss');return;}
        requestAnimationFrame(draw);
    }
    function cleanup(){document.getElementById('c-cv').removeEventListener('touchstart',tap);document.getElementById('c-cv').removeEventListener('mousedown',tap);}
    mgCleanup=()=>{active=false;clearTimeout(failsafe);cleanup();};
    draw();
}

// MG4: Dodge falling objects
function mgDodge(ctx,W,H,cb){
    let px=W/2,active=true,score=0,objects=[],spawnT=0,total=0;
    const dur=4000,start=Date.now();
    cSpeech('UNDGÅ de røde! Swipe/tilt! ❌');
    const failsafe=setTimeout(()=>{if(active){active=false;cleanup();cb(score>30?'good':'ok');}},8000);
    const move=e=>{if(!active)return;
        const rect=document.getElementById('c-cv').getBoundingClientRect();
        px=((e.clientX||(e.touches&&e.touches[0]?e.touches[0].clientX:0))-rect.left)*(W/rect.width);
    };
    document.getElementById('c-cv').addEventListener('touchmove',move,{passive:true});
    document.getElementById('c-cv').addEventListener('mousemove',move);
    function draw(){
        if(!active)return;
        ctx.clearRect(0,0,W,H);
        const now=Date.now(),elapsed=now-start;
        if(now-spawnT>300){objects.push({x:Math.random()*W,y:-10,spd:2+Math.random()*3});spawnT=now;total++;}
        ctx.fillStyle='#00d4aa';ctx.beginPath();ctx.arc(px,H-20,12,0,Math.PI*2);ctx.fill();
        ctx.font='12px serif';ctx.textAlign='center';ctx.fillText('🕺',px,H-16);
        let hit=false;
        objects=objects.filter(o=>{o.y+=o.spd;
            ctx.fillStyle='#ff006e';ctx.beginPath();ctx.arc(o.x,o.y,8,0,Math.PI*2);ctx.fill();
            if(Math.hypot(px-o.x,(H-20)-o.y)<20){hit=true;}
            return o.y<H+10;
        });
        if(hit){active=false;clearTimeout(failsafe);cleanup();S.bad();cb(score>12?'ok':'miss');return;}
        score++;
        ctx.font="bold 9px 'Press Start 2P'";ctx.textAlign='left';ctx.fillStyle='#00d4aa';ctx.fillText('ALIVE!',10,20);
        if(elapsed>=dur){active=false;clearTimeout(failsafe);cleanup();cb(score>50?'perfect':score>30?'good':'ok');return;}
        requestAnimationFrame(draw);
    }
    function cleanup(){document.getElementById('c-cv').removeEventListener('touchmove',move);document.getElementById('c-cv').removeEventListener('mousemove',move);}
    mgCleanup=()=>{active=false;clearTimeout(failsafe);cleanup();};
    draw();
}

// MG5: Simon says sequence
function mgSequence(ctx,W,H,cb){
    const colors=['#ff006e','#ffbe0b','#00d4aa','#3b82f6'];
    const pos=[[W*.25,H*.3],[W*.75,H*.3],[W*.25,H*.6],[W*.75,H*.6]];
    const r=Math.min(30,W*.1);
    let seq=[],pIdx=0,showPhase=true,showIdx=0,lastShow=0,active=true,round=0;
    cSpeech('Husk sekvensen og gentag! 🧠');
    const failsafe=setTimeout(()=>{if(active){active=false;cleanup();cb(round>=2?'ok':'miss');}},8000);
    function nextRound(){round++;seq.push(Math.floor(Math.random()*4));showPhase=true;showIdx=0;pIdx=0;lastShow=Date.now();}
    nextRound();
    function drawBtns(lit){
        ctx.clearRect(0,0,W,H);
        pos.forEach((p,i)=>{
            ctx.fillStyle=lit===i?colors[i]:'rgba(255,255,255,.08)';
            ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fill();
            if(lit===i){ctx.shadowColor=colors[i];ctx.shadowBlur=12;ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
        });
        ctx.font="bold 8px 'Press Start 2P'";ctx.textAlign='center';ctx.fillStyle='#888';ctx.fillText('RUNDE '+round,W/2,H*.88);
    }
    const tap=e=>{if(!active||showPhase)return;
        const rect=document.getElementById('c-cv').getBoundingClientRect();
        const mx=((e.clientX||(e.touches&&e.touches[0]?e.touches[0].clientX:0))-rect.left)*(W/rect.width);
        const my=((e.clientY||(e.touches&&e.touches[0]?e.touches[0].clientY:0))-rect.top)*(H/rect.height);
        let hit=-1;pos.forEach((p,i)=>{if(Math.hypot(mx-p[0],my-p[1])<r+5)hit=i;});
        if(hit<0)return;drawBtns(hit);S.click();
        if(hit===seq[pIdx]){pIdx++;if(pIdx>=seq.length){if(round>=3){active=false;clearTimeout(failsafe);cleanup();cb('perfect');return;}setTimeout(()=>nextRound(),400);}}
        else{active=false;clearTimeout(failsafe);cleanup();cb(round>=2?'ok':'miss');}
    };
    document.getElementById('c-cv').addEventListener('touchstart',tap);
    document.getElementById('c-cv').addEventListener('mousedown',tap);
    function draw(){
        if(!active)return;
        if(showPhase){const now=Date.now();
            if(now-lastShow>500){drawBtns(seq[showIdx]);lastShow=now;showIdx++;
                if(showIdx>seq.length){showPhase=false;drawBtns(-1);}
            }else if(now-lastShow>350){drawBtns(-1);}
        }
        requestAnimationFrame(draw);
    }
    function cleanup(){document.getElementById('c-cv').removeEventListener('touchstart',tap);document.getElementById('c-cv').removeEventListener('mousedown',tap);}
    mgCleanup=()=>{active=false;clearTimeout(failsafe);cleanup();};
    draw();
}

// MG6: Catch falling fruit
function mgCatch(ctx,W,H,cb){
    let px=W/2,active=true,score=0,items=[],spawnT=0;
    const need=6,dur=5000,start=Date.now();
    cSpeech('FANG frugterne! 🍎 '+need+' stk!');
    const failsafe=setTimeout(()=>{if(active){active=false;cleanup();cb(score>=4?'good':score>=2?'ok':'miss');}},8000);
    const move=e=>{if(!active)return;
        const rect=document.getElementById('c-cv').getBoundingClientRect();
        px=((e.clientX||(e.touches&&e.touches[0]?e.touches[0].clientX:0))-rect.left)*(W/rect.width);
    };
    document.getElementById('c-cv').addEventListener('touchmove',move,{passive:true});
    document.getElementById('c-cv').addEventListener('mousemove',move);
    const fruits=['🍎','🍊','🍇','🍌','🍓'];
    function draw(){
        if(!active)return;
        ctx.clearRect(0,0,W,H);
        const now=Date.now();
        if(now-spawnT>400){items.push({x:20+Math.random()*(W-40),y:-10,spd:2+Math.random()*2,f:fruits[Math.floor(Math.random()*5)]});spawnT=now;}
        ctx.fillStyle='#ffbe0b';ctx.fillRect(px-20,H-15,40,10);
        ctx.font='14px serif';ctx.textAlign='center';ctx.fillText('🧺',px,H-8);
        items=items.filter(i=>{i.y+=i.spd;ctx.font='16px serif';ctx.fillText(i.f,i.x,i.y);
            if(Math.abs(px-i.x)<25&&i.y>H-25&&i.y<H){score++;S.click();return false;}
            return i.y<H+10;
        });
        ctx.font="bold 9px 'Press Start 2P'";ctx.textAlign='right';ctx.fillStyle='#ffbe0b';ctx.fillText(score+'/'+need,W-10,20);
        if(score>=need){active=false;clearTimeout(failsafe);cleanup();cb('perfect');return;}
        if(now-start>=dur){active=false;clearTimeout(failsafe);cleanup();cb(score>=4?'good':score>=2?'ok':'miss');return;}
        requestAnimationFrame(draw);
    }
    function cleanup(){document.getElementById('c-cv').removeEventListener('touchmove',move);document.getElementById('c-cv').removeEventListener('mousemove',move);}
    mgCleanup=()=>{active=false;clearTimeout(failsafe);cleanup();};
    draw();
}

function eTurn(){
    // Poison tick
    if(C.poison>0){
        const pdmg=Math.max(2,Math.floor(C.girl.atk*.3));
        C.gHP=Math.max(0,C.gHP-pdmg);C.poison--;
        cAct('☠️ GIFT -'+pdmg,'#a855f7');
        cSpeech('Giften virker! -'+pdmg+' HP!'+(C.poison>0?' ('+C.poison+' ture tilbage)':''));
        updC();if(chkEnd())return;
    }
    // Ally effects
    if(C.ally&&C.ally.turnsLeft>0){
        let allyMsg='';
        if(C.ally.type==='gulle'){const ad=1+Math.floor(Math.random()*2);C.gHP=Math.max(0,C.gHP-ad);allyMsg='Gulle kaster en øl! -'+ad+' HP!';}
        else if(C.ally.type==='ritardo'){if(Math.random()>.5){const ad=3+Math.floor(Math.random()*4);C.gHP=Math.max(0,C.gHP-ad);allyMsg='Ritardo slår! -'+ad+' HP!';}else{const h=5;C.hHP=Math.min(C.hMax,C.hHP+h);allyMsg='Ritardo healer! +'+h+' HP!';}}
        else if(C.ally.type==='leth'){const ad=6+Math.floor(Math.random()*5);C.gHP=Math.max(0,C.gHP-ad);C.enemyDebuff=Math.max(C.enemyDebuff,1);allyMsg='LETH SMADRER! -'+ad+' HP + debuff! 💪';}
        C.ally.turnsLeft--;if(C.ally.turnsLeft<=0)C.ally=null;
        cAct('📞 '+allyMsg,'#a855f7');updC();if(chkEnd())return;
    }
    // Tick down buffs
    if(C.dmgBuff>0)C.dmgBuff--;
    if(C.enemyDebuff>0)C.enemyDebuff--;
    if(C.blockBuff>0)C.blockBuff--;
    const g=C.girl,atk=g.attacks[Math.floor(Math.random()*g.attacks.length)];
    const poisonDelay=C.poison>=0?1200:0;
    setTimeout(()=>{
        cSpeech(g.name+': "'+atk+'"');cAct('💬','#ff006e');
        const readTime=Math.max(3500,atk.length*100+1200);
        setTimeout(()=>{
            cSpeech('MINI-GAME! Reducer hendes skade! 🛡️');
            setTimeout(()=>runMiniGame(q=>{
                let red=q==='perfect'?.5:q==='good'?.35:q==='ok'?.2:0;
                let rawAtk=g.atk;
                if(C.enemyDebuff>0)rawAtk=Math.floor(rawAtk*.7);
                let dmg=Math.max(1,Math.floor(rawAtk*(1-red)));
                // BlockBuff halves damage
                if(C.blockBuff>0)dmg=Math.max(1,Math.floor(dmg*.5));
                // Shield absorb (legacy)
                if(C.shield>0){
                    const absorbed=Math.min(C.shield,dmg);
                    C.shield-=absorbed;dmg-=absorbed;
                    if(absorbed>0)cSpeech('Skjold absorberede '+absorbed+'!'+(dmg>0?' -'+dmg+' HP':''));
                }
                C.hHP=Math.max(0,C.hHP-dmg);
                // Girl debuff mechanic (25% chance)
                if(Math.random()<.25){
                    const debuffRoll=Math.random();
                    if(debuffRoll<.33&&C.dmgBuff>0){C.dmgBuff=Math.max(0,C.dmgBuff-1);cSpeech(g.name+' fjerner din buff! -1 dmgBuff');}
                    else if(debuffRoll<.66){const heal=Math.max(1,Math.floor(C.gMax*.1));C.gHP=Math.min(C.gMax,C.gHP+heal);cSpeech(g.name+' healer sig selv! +'+heal+' HP');}
                    else{C.confused=(C.confused||0)+1;cSpeech(g.name+' forvirrer dig! -10% hit chance!');}
                }
                if(q==='perfect'){cAct('HALVERET! -'+dmg,'#00d4aa');if(!C.shield)cSpeech('Max block! Kun -'+dmg+'!');}
                else if(q==='good'){S.click();cAct('-'+dmg,'#3b82f6');}
                else{S.hit();cAct('-'+dmg+' OUCH!','#ff006e');
                    document.getElementById('c-hanzi').style.animation='shake .3s';setTimeout(()=>document.getElementById('c-hanzi').style.animation='',300);}
                updC();chkEnd()||setTimeout(showCMenu,2000);
            }),800);
        },readTime);
    },poisonDelay);
}

function chkEnd(){
    if(C.gHP<=0){C.phase='done';S.perf();G.girlsMet++;G.totalScore+=100;
        const reward=50+(C.girl.rating||1)*20;G.money+=reward;
        const stats=['styrke','cardio','smalltalk','reflex'];const rs=stats[Math.floor(Math.random()*stats.length)];G[rs]+=1;G.charmPts+=2;G.charmTotal+=2;
        const rsName=rs==='styrke'?'STR':rs==='cardio'?'CRD':rs==='smalltalk'?'TLK':'REF';
        cSpeech(C.girl.win);cAct('WIN! 🏆','#ffbe0b');
        setTimeout(()=>{cSpeech('BELØNNING: +'+reward+' KR, +1 '+rsName+', +2 CHARM! 🎉');updHUD();},2000);
        setTimeout(()=>{document.getElementById('c-menu').innerHTML=`<button class="btn" onclick="leaveCombat()" style="grid-column:span 3">🏆 VICTORY!</button>`;document.getElementById('c-menu').style.display='grid';},4000);return true;}
    if(C.hHP<=0){C.phase='done';cSpeech(C.girl.lose);cAct('REJECTED 💔','#ff006e');S.bad();G.totalScore+=10;
        setTimeout(()=>{document.getElementById('c-menu').innerHTML=`<button class="btn" onclick="leaveCombat()" style="grid-column:span 3">💔 REJECTED...</button>`;document.getElementById('c-menu').style.display='grid';},1500);return true;}
    return false;
}

function leaveCombat(){
    cancelAnimationFrame(combatAF);if(mgCleanup){mgCleanup();mgCleanup=null;}
    document.getElementById('combat-ui').classList.remove('active');
    G.scene='map';Mus.play('map');G.round++;G.daysLeft=7;G.day++;G.hour=8;
    G.hunger=Math.min(G.maxHunger,G.hunger+20);bodegaUsedToday=false;G.wheelUsedToday=false;G.eventDoneToday=false;
    if(G.round>G.maxRounds&&G.girlsMet>=4){secretBoss();return;}
    if(G.round>G.maxRounds){endGame();return;}
    updHUD();msg(C.gHP<=0?'SCORET! 🔥 Næste runde om 7 dage!':'Træn hårdere! Runde '+G.round+' om 7 dage.');
}

function secretBoss(){
    G.scene='brief';
    briefGirl=makeScaledGirl({name:"Danny 👔",icon:"😈",rating:12,abilities:['Manager Power','Cancel Culture','NDA Clause','Media Spin'],
        attacks:["Du er FÆRDIG i denne by!","Jeg EJER dig, Hanzi!","*ringer til sine advokater*","Ingen vil booke dig NOGENSINDE!","Du er intet uden TBH!","*poster falsk historie om dig*"],
        win:"Danny falder på knæ...\n'Du... du vandt. TBH er dit igen.' 👑",lose:"Danny griner.\n'Vidste det. Du er stadig intet.'"});
    briefStep=0;
    document.getElementById('brief-girl').style.display='none';
    document.getElementById('brief-ov').classList.add('active');
    drawBriefLeth();
    const oldScript=[...briefScript];
    briefScript.length=0;
    briefScript.push(
        ()=>{setBrief('Leth 💪','BRO! Du scorede ALLE 4! 🔥🔥🔥');},
        ()=>{setBrief('Leth 💪','Men vent... der er nogen der vil snakke med dig.');},
        ()=>{setBrief('??? 😈','Så du tror du er tilbage? Du er INTET uden MIG.');},
        ()=>{setBrief('Danny 👔','Jeg er Danny. TBH\'s manager. DIN gamle manager.');},
        ()=>{setBrief('Danny 👔','Du vil have TBH tilbage? Så BEVIS det. Her. Nu.');},
        ()=>{
            setBrief('Leth 💪','Bro... det er ham. Den RIGTIGE boss. Tag ham ned! 💪');
            document.getElementById('brief-girl').style.display='block';
            document.getElementById('bg-icon').textContent='😈';
            document.getElementById('bg-name').textContent='Danny - TBH Manager';
            document.getElementById('bg-rating').textContent='⭐⭐⭐⭐⭐⭐ 12/10';
            document.getElementById('bg-stats').innerHTML='❤️ HP: '+briefGirl.hp+' | ⚔️ ATK: '+briefGirl.atk+'\n⚠️ HEMMELIG BOSS! EKSTREM SVÆRHED!';
        },
        ()=>{document.getElementById('brief-ov').classList.remove('active');briefScript.length=0;briefScript.push(...oldScript);startCombatWithGirl(briefGirl);}
    );
    advBrief();
}

// ===== END =====
function endGame(){
    G.scene='end';Mus.stop();document.getElementById('hud').className='';
    const beatDanny=G.girlsMet>=5;
    if(beatDanny){showCredits();return;}
    const r=document.getElementById('result-ov');r.classList.add('active');
    let i,t,c,d;
    if(G.girlsMet>=4){i='👑';t='ALLE SCORET!';c='#ffbe0b';d='Men der er mere... Prøv igen for den HEMMELIGE boss! 🔥';}
    else if(G.girlsMet>=3){i='😎';t='NÆSTEN DER!';c='#00d4aa';d=G.girlsMet+'/4 scoret. Stærkt comeback!';}
    else if(G.girlsMet>=1){i='💪';t='DER ER HÅBET';c='#ff6b35';d=G.girlsMet+' scoret. "Næste sæson, bror."';}
    else{i='😅';t='HANZI PRØVEDE...';c='#aaa';d='0 scoret. Der er altid næste gang!';}
    r.innerHTML=`<div style="text-align:center"><div style="font-size:3.5rem;margin-bottom:10px">${i}</div><div class="pix" style="font-size:clamp(10px,3.5vw,20px);color:${c};margin-bottom:6px">${t}</div><div style="font-size:.65rem;color:#aaa;max-width:300px;margin:0 auto 14px;line-height:1.6">${d}</div><div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#ffbe0b;margin-bottom:16px">SCORE: ${G.totalScore} | DAMER: ${G.girlsMet}/4</div><button class="btn" onclick="restart()">PRØV IGEN</button></div>`;
}

function showCredits(){
    G.scene='credits';
    const cr=document.getElementById('credits-ov');cr.classList.add('active');
    const stats=[
        ['DAGE OVERLEVET',G.day],['PIGER SCORET',G.girlsMet],['TOTAL SCORE',G.totalScore],
        ['STYRKE',G.styrke],['CARDIO',G.cardio],['SMALL TALK',G.smalltalk],['REFLEX',G.reflex],
        ['CHARM TOTAL',G.charmTotal],['WORK LEVEL',G.workLvl],['BODEGA LEVEL',G.bodegaLvl],
        ['PENGE TJENT',G.money],['ITEMS BRUGT',G.bought.length],
    ];
    cr.innerHTML=`
    <div style="text-align:center;animation:mIn 1s ease">
        <div style="font-size:4rem;margin-bottom:10px">👑</div>
        <div class="pix" style="font-size:clamp(14px,4vw,24px);color:#ffbe0b;margin-bottom:4px;text-shadow:0 0 20px rgba(255,190,11,.5)">HANZI ER BACK!</div>
        <div class="pix" style="font-size:clamp(6px,1.5vw,9px);color:#ff006e;margin-bottom:20px">TBH · THE BOYS HOUSE · REUNITED</div>
        <div style="font-size:.7rem;color:#aaa;max-width:300px;margin:0 auto 20px;line-height:1.8">
            Danny er besejret. TBH er dit igen.<br>
            Hele Aarhus ved det. Hele Danmark ved det.<br>
            Hanzi Lad er #1. For evigt. 👑🔥
        </div>
        <div style="max-width:280px;margin:0 auto 20px">
            ${stats.map(s=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span class="pix" style="font-size:clamp(5px,1.1vw,7px);color:#888">${s[0]}</span><span class="pix" style="font-size:clamp(5px,1.1vw,7px);color:#ffbe0b">${s[1]}</span></div>`).join('')}
        </div>
        <div class="pix" style="font-size:clamp(4px,1vw,6px);color:#555;margin-bottom:6px">— CREDITS —</div>
        <div style="font-size:.6rem;color:#666;line-height:2;margin-bottom:20px">
            Game Design: Mikkel<br>
            Code: Claude AI<br>
            Leth: Sig selv<br>
            Danny: Også sig selv<br>
            Musik: Royalty Free Bangers<br>
            Kort: Aarhus Kommune (probably)<br>
            Special Thanks: Alle der troede på Hanzi
        </div>
        <div class="pix" style="font-size:clamp(6px,1.3vw,8px);color:#ffbe0b;margin-bottom:16px">TOTAL SCORE: ${G.totalScore}</div>
        <button class="btn" onclick="document.getElementById('credits-ov').classList.remove('active');restart()">🔄 SPIL IGEN</button>
    </div>`;
}

function restart(){
    Object.assign(G,{day:1,daysLeft:7,hour:8,money:150,hunger:80,round:1,styrke:0,cardio:0,smalltalk:0,reflex:0,charmPts:0,charmTotal:0,perks:{},workLvl:1,workXP:0,inv:[],bought:[],girlsMet:0,totalScore:0,tutorial:0,bodegaLvl:1,wheelUsedToday:false,eventDoneToday:false,buff:null,buffDays:0,px:.35,py:.45,scene:'title'});bodegaUsedToday=false;eventMarker=null;
    Object.keys(visitedLocations).forEach(k=>delete visitedLocations[k]);
    document.getElementById('result-ov').classList.remove('active');
    document.getElementById('credits-ov').classList.remove('active');
    document.getElementById('title-ov').style.display='flex';
}

// ===== PHONE =====
const phoneScript=[
    {t:'n',x:'📱 Indkommende opkald...'},
    {t:'i',x:'Bror... BROR! Du er vågen?! 😭'},
    {t:'o',x:'Leth...? Hvad skete der?'},
    {t:'i',x:'Motorcykel-ulykke. 2 ÅR i koma.'},
    {t:'o',x:'Hvad med TBH?!'},
    {t:'i',x:'De smed dig ud. Du er færdig, siger de.'},
    {t:'o',x:'HVAD?! Jeg var NUMMER 1!'},
    {t:'i',x:'Var. Alt er væk. Men - scor den hotteste pige, og du er TILBAGE. 👀'},
    {t:'i',x:'Træn STYRKE for skade, CARDIO for HP, SMALL TALK for mana, REFLEX for block.'},
    {t:'i',x:'Køb MAD for energi! Byg din SKILL TREE! 🌟'},
    {t:'i',x:'7 dage per runde. Når tiden er ude SKAL du på klubben! 🪩'},
    {t:'o',x:'LETS GO! 🔥'},
];
let phI=0;
function initPhone(){phI=0;document.getElementById('ph-msgs').innerHTML='';document.getElementById('phone-ov').classList.add('active');document.getElementById('title-ov').style.display='none';advPh();}
function advPh(){if(phI>=phoneScript.length){document.getElementById('phone-ov').classList.remove('active');startMap();return;}
    const l=phoneScript[phI],m=document.getElementById('ph-msgs'),d=document.createElement('div');
    d.className='mb mb-'+(l.t==='n'?'nar':l.t==='i'?'in':'out');d.textContent=l.x;
    m.appendChild(d);m.scrollTop=m.scrollHeight;S.click();phI++;}

// ===== MAP START =====
function startMap(){G.scene='map';G.px=.35;G.py=.45;Mus.play('map');spawnEventMarker();updHUD();
    if(G.tutorial===0){G.tutorial=1;msg('Tryk på en bygning for at gå derhen! Start med GYM! 💪');}}

// ===== MAIN LOOP =====
function loop(){
    cx.clearRect(0,0,cv.width,cv.height);
    if(G.scene==='title'){
        // Title bg
        const W=cv.width,H=cv.height,t=Date.now()*.001;
        cx.fillStyle='#050510';cx.fillRect(0,0,W,H);
        for(let i=0;i<60;i++){cx.fillStyle=`rgba(255,255,255,${.1+Math.sin(t*2+i)*.08})`;cx.fillRect((i*173+30)%W,(i*67+15)%(H*.6),1.5,1.5);}
        // City silhouette
        const gY=H*.65;
        for(let i=0;i<10;i++){const bx=i*W/9-5,bw=W/11,bh=25+((i*47)%45);
            cx.fillStyle='#0d0820';cx.fillRect(bx,gY-bh,bw,bh+H);
            for(let wy=gY-bh+6;wy<gY;wy+=9)for(let wx=bx+3;wx<bx+bw-3;wx+=11){
                cx.fillStyle=Math.sin(wx*7+wy*3+t)>.3?'rgba(255,190,11,.15)':'rgba(0,0,0,.2)';cx.fillRect(wx,wy,5,5);}}
    }
    else if(['map','gym','shop','work','tree','train','bodega','wheel','event'].includes(G.scene)){drawMap();}
    requestAnimationFrame(loop);
}

// ===== INIT =====
document.getElementById('start-btn').onclick=()=>{
    S.init();Mus.init();S.ok();
    document.getElementById('title-ov').style.display='none';
    playVid('video/intro.mp4',()=>initPhone());
};
document.getElementById('ph-next').onclick=advPh;
loop();
