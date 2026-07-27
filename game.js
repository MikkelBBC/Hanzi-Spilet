// ===== CANVAS =====
const cv=document.getElementById('cv'),cx=cv.getContext('2d');
function rsz(){cv.width=innerWidth;cv.height=innerHeight;
const cc=document.getElementById('c-cv');if(cc){cc.width=cc.parentElement.clientWidth;cc.height=cc.parentElement.clientHeight;}}
addEventListener('resize',rsz);rsz();

// ===== AUDIO =====
const Mus={t:{},cur:null,synth:null,
init(){const files={map:'map',fight:'fight',gym:'gym',kbh:'København',shop:'shop',work:'WorkMusic',bodega:'BodegaSang',champ:'WeAreChampions40sek'};
Object.entries(files).forEach(([k,f])=>{const a=new Audio('music/'+f+'.mp3');a.loop=(k!=='champ');a.volume=.22;a.preload='auto';this.t[k]=a;});},
play(k){if(this.cur===k)return;this.stop();this.cur=k;
    if(this.t[k]){this.t[k].currentTime=0;this.t[k].play().catch(()=>{});return;}
    if(synthTracks[k]){this.synth=new SynthTrack(synthTracks[k]);this.synth.play();}},
stop(){Object.values(this.t).forEach(t=>{t.pause();t.currentTime=0;});
    if(this.synth){this.synth.stop();this.synth=null;}this.cur=null;}};

const synthTracks={
    bodega:{bpm:75,key:[196,220,247,262,294,330,370],bass:[196,147,165,196],vol:.12,wave:'triangle',style:'lounge'},
    work:{bpm:110,key:[330,370,392,440,494,523,587],bass:[220,262,294,330],vol:.1,wave:'square',style:'upbeat'},
    shop:{bpm:85,key:[523,587,659,698,784,880,988],bass:[262,330,392,523],vol:.09,wave:'sine',style:'calm'},
    tree:{bpm:85,key:[523,587,659,698,784,880,988],bass:[262,330,392,523],vol:.09,wave:'sine',style:'calm'},
    kbh:{bpm:95,key:[440,494,523,587,659,698,784],bass:[220,262,330,440],vol:.11,wave:'triangle',style:'urban'},
};
class SynthTrack{
    constructor(cfg){this.cfg=cfg;this.ctx=null;this.running=false;this.gain=null;this.next=0;this.bassNext=0;}
    play(){
        this.ctx=new(window.AudioContext||window.webkitAudioContext)();
        this.gain=this.ctx.createGain();this.gain.gain.value=this.cfg.vol;this.gain.connect(this.ctx.destination);
        this.running=true;this.next=this.ctx.currentTime+.1;this.bassNext=this.ctx.currentTime+.1;this.schedule();
    }
    schedule(){
        if(!this.running)return;
        const now=this.ctx.currentTime,ahead=2,beat=60/this.cfg.bpm;
        while(this.next<now+ahead){
            const f=this.cfg.key[Math.floor(Math.random()*this.cfg.key.length)];
            const dur=beat*(Math.random()>.7?.5:1);
            this.note(f,this.next,dur*.8,this.cfg.wave,.15);
            if(Math.random()>.5)this.note(f*1.5,this.next+dur*.3,dur*.4,'sine',.06);
            this.next+=dur;
        }
        while(this.bassNext<now+ahead){
            const bf=this.cfg.bass[Math.floor(Math.random()*this.cfg.bass.length)];
            const bd=beat*2;
            this.note(bf*.5,this.bassNext,bd*.9,'sine',.12);
            this.bassNext+=bd;
        }
        this.timer=setTimeout(()=>this.schedule(),500);
    }
    note(f,t,d,w,v){
        const o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type=w;o.frequency.value=f;g.gain.setValueAtTime(v*this.cfg.vol,t);
        g.gain.exponentialRampToValueAtTime(.001,t+d);
        o.connect(g);g.connect(this.gain);o.start(t);o.stop(t+d);
    }
    stop(){this.running=false;clearTimeout(this.timer);if(this.ctx){this.ctx.close().catch(()=>{});this.ctx=null;}}
}

let sfxMuted=false;
const S={c:null,g:null,init(){this.c=new(window.AudioContext||window.webkitAudioContext)();this.g=this.c.createGain();this.g.gain.value=.18;this.g.connect(this.c.destination);},
n(f,d,t='square',v=.3){if(!this.c||sfxMuted)return;const o=this.c.createOscillator(),g=this.c.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,this.c.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.c.currentTime+d);o.connect(g);g.connect(this.g);o.start();o.stop(this.c.currentTime+d);},
click(){this.n(800,.04);setTimeout(()=>this.n(1100,.03),20);},
ok(){this.n(523,.08);setTimeout(()=>this.n(659,.08),60);setTimeout(()=>this.n(784,.1),120);},
bad(){this.n(300,.1,'sawtooth');setTimeout(()=>this.n(220,.12,'sawtooth'),80);},
perf(){this.n(784,.06);setTimeout(()=>this.n(988,.06),40);setTimeout(()=>this.n(1175,.1),80);},
coin(){for(let i=0;i<3;i++)setTimeout(()=>this.n(800+i*250,.04,'sine'),i*30);},
hit(){this.n(180,.07,'sawtooth',.25);},heal(){this.n(440,.06,'sine');setTimeout(()=>this.n(660,.06,'sine'),50);setTimeout(()=>this.n(880,.08,'sine'),100);},
eat(){this.n(300,.05,'sine');setTimeout(()=>this.n(500,.05,'sine'),40);},
door(){this.n(220,.08,'sine',.15);setTimeout(()=>this.n(330,.06,'sine',.1),40);},
levelup(){for(let i=0;i<5;i++)setTimeout(()=>this.n(500+i*100,.06,'sine',.2),i*50);},
spin(){this.n(400,.03,'square',.1);setTimeout(()=>this.n(600,.03,'square',.1),30);},
miss(){this.n(200,.15,'sawtooth',.15);},
crit(){this.n(900,.04);setTimeout(()=>this.n(1200,.04),30);setTimeout(()=>this.n(1500,.06),60);},
block(){this.n(150,.05,'square',.2);setTimeout(()=>this.n(250,.03,'square',.15),30);},
sleep(){this.n(200,.2,'sine',.08);setTimeout(()=>this.n(180,.2,'sine',.06),200);setTimeout(()=>this.n(160,.3,'sine',.04),400);},
buy(){this.n(600,.04,'sine',.15);setTimeout(()=>this.n(800,.04,'sine',.15),40);setTimeout(()=>this.n(1000,.06,'sine',.2),80);}};

// ===== GAME STATE =====
const G={scene:'title',day:1,daysLeft:7,hour:8,money:150,hunger:80,maxHunger:100,round:1,maxRounds:7,
styrke:0,cardio:0,smalltalk:0,reflex:0,critLvl:0,critDmgLvl:0,regenLvl:0,gymLvl:1,
get critChance(){return 5+this.critLvl*2},get critDmg(){return 150+this.critDmgLvl*10},
get regenAmt(){return this.regenLvl>0?Math.min(3,Math.floor(1+this.regenLvl*0.4)):0},
get dmg(){return 2+Math.floor(this.styrke*0.7)},get maxHP(){return 50+this.cardio*5},get maxMP(){return 10+this.smalltalk*2},
get blockChance(){return Math.min(25,2+this.reflex)},get hitBonus(){return this.reflex*2},
charmPts:0,charmTotal:0,perks:{},workLvl:1,workXP:0,workNeed(){return 3+this.workLvl*2},
inv:[],bought:[],girlsMet:0,bodegaWins:0,beatBoss:false,totalScore:0,tutorial:0,currentHP:-1,firstClubDone:false,kbhUnlocked:false,
bodegaLvl:1,wheelUsedToday:false,eventDoneToday:false,buff:null,buffDays:0,
currentMap:'aarhus',kirkeUnlocked:false,kirkePrayedToday:false,
mariusTalks:0,gydenUsedToday:false,kirkePrayers:0,
relics:[],
px:.5,py:.5,tx:.5,ty:.5,walking:false};

function girlScaleHP(r){return Math.round(45*Math.pow(1.22,r-1));}
function girlScaleATK(r){return Math.round(8*Math.pow(1.18,r-1));}

// ===== HELPERS =====
function float(t,c='#fff'){const e=document.createElement('div');e.className='float';e.textContent=t;e.style.color=c;e.style.left=(innerWidth/2-30)+'px';e.style.top=(innerHeight/2-30)+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),1000);}
let mt;function msg(t){const b=document.getElementById('msg-bar');document.getElementById('msg-text').textContent=t;b.classList.add('show');clearTimeout(mt);mt=setTimeout(()=>b.classList.remove('show'),4000);}

// ===== RANDOM JOKES =====
const jokePool=[
    'Hanzi tænker: "Hvornår fandt jeg sidst en ren sok...?" 🧦',
    'En due lander på dit hoved. +0 til alt. 🐦',
    'Du hører nogen råbe "HANZI ER EN LEGENDE!" ...det var dig selv. 😂',
    'Leth ringer: "Husk at spise noget der IKKE er kebab." *lægger på*',
    'Du ser din ex gå forbi. Du gemmer dig bag en skraldespand. Smooth. 🗑️',
    'En random fyr: "Bro, er du ham fra TBH?!" Du: "...måske." 😎',
    'Din mor sender SMS: "Har du spist?" x47 ulæste beskeder 📱',
    'Du finder 1 krone på gaden. Investeringspotentiale! 💰',
    'Gulle vinker fra sin bod: "KEBAB TIL HALV PRIS! ...næ, fuld pris." 🥙',
    'Du prøver at se tough ud. En kat ignorerer dig totalt. 🐱',
    'Lemming sender voice: *3 min af ham der spiser chips* 🐹',
    'Du overvejer at tage en selfie. Frontkameraet siger nej. 📸',
    'En gammel dame: "Unge mand, du ligner en der har brug for suppe." 🍲',
    'Du træder i en vandpyt. Sokken er våd resten af dagen. 💧',
    'Malte: "Bro kom på bodegaen, de har BOGO på shots!" 🍺',
    'Du ser en plakat: "SAVNET: Hanzis værdighed. Sidst set 2 år siden." 😭',
    'Thomas sender løbe-invitation kl 5 om morgenen. Du swiper væk. ⚽',
    'Marius: "Har du prøvet det nye game? ...vent det er DIT LIV" 🎮',
    'En fugl shitter på din jakke. Det er vist "held". 🍀',
    'Du hører din yndlingssang. Den handler om at være broke. Relatable. 🎵',
];
const trainJokes=[
    'Leth: "ER DET ALT DU HAR?! Min bedstemor løfter mere!" 👵',
    'Du sveder som en is i Sahara. Sexet. 💦',
    'Spejlet i gym: "Bro... seriøst?" 🪞',
    'En random gym-bro: "Nice form!" ...han snakkede til sig selv. 💪',
    'Du glemte at stretche. Din krop hader dig nu. 🦴',
    'Leth kaster et håndklæde i hovedet på dig: "VIDERE!" 😤',
    'Du prøver at flexe. Intet sker. Endnu. 💪',
    'Nogen filmer dig til TikTok. Du håber det er i den gode kategori. 📱',
];
const combatJokes=[
    'Hun: "Er det DIN bedste replik?!" 💅',
    'Du fumler med ordene. Hun griner. Av. 😬',
    'Hendes veninde tager billeder. Presset er REELT. 📸',
    'DJ skruer op. Du kan ikke høre dig selv tænke. 🎧',
    'Du snubler over dine egne fødder. Spil det cool. Spil det COOL. 🕺',
    'Bartenderen giver dig et medlidende blik. 🍸',
    'Hendes ex kigger på fra baren. Du sveder MERE. 😰',
    'Hun checker sin telefon midt i din replik. Brutalt. 📱',
    'Hendes veninder hvisker og griner. Om DIG. 100%. 👯',
    'Du prøver en smooth move. Spilder din drink. På hende. 🥤',
    'Hun: "Vent... kender jeg dig ikke fra Netto?" 🛒',
    'Dine hænder ryster. Hun ser det. ALLE ser det. 🫨',
    'Du glemmer hvad du hedder. HVAD HEDDER DU?! 🧠❌',
    'En random fyr råber "GO HANZI!" fra baren. Pinligt men wholesome. 📢',
    'Hun: "Du minder mig om min eks." Er det godt? DET ER IKKE GODT. 💔',
    'DJ dropper din yndlingssang. Du danser. Hun ser skræmt ud. 💃',
];
const workJokes=[
    'Ritardo: "Hvis du arbejdede SÅ hårdt hjemme som her... nej vent, du gør det her heller ikke." 💼',
    'Kollegaen snorker ved skrivebordet. Igen. 😴',
    'Nogen stjal din frokost fra køleskabet. Klassiker. 🍱',
    'Ritardo: "MIN hund arbejder hurtigere end dig. Og den har tre ben." 🐕',
    'Du opdager at kopimaskinen har været i stykker i 3 uger. Ingen mærkede det. 🖨️',
    'En kunde ringer: "JEG VIL TALE MED DIN CHEF!" Ritardo: "JEG ER CHEFEN!" 📞',
    'Ritardo: "Du får pause når JEG siger du får pause!" ...5 sek senere: "PAUSE!" ☕',
    'Du finder en mystisk sandwich i mikrobølgen. Den har været der siden 2019. 🥪',
    'Kollegaen fortæller den SAMME joke. For 14. gang. I DAG. 😐',
    'Ritardo googler "hvordan fyrer man folk" mens du ser på. 💀',
    'En kunde spørger om du er chefen. Ritardo hører det. Han er IKKE glad. 😤',
    'Du tager 3 toiletpauser på 1 time. Ritardo fører regnskab. 🚽',
    'Ritardo: "Da JEG var ung gik vi 20 km til arbejde! Begge veje! OPAD!" 👴',
    'WiFi\'et dør. Ritardo: "GODT! Nu kan I ARBEJDE!" Alle: 😰',
    'Du dropper en hel kasse. Ritardo: "DET KOMMER PÅ DIN LØN!" 📦',
    'Nogen har tegnet en penis på Ritardos kaffekop. Alle nægter. 🖊️',
];
const shopJokes=[
    'Gulle: "Prisen? Øh... hvad har du på dig?" 💰',
    'En flue lander i kebab-kødet. Gulle blæser den væk. "Frisk som altid!" 🪰',
    'Gulle: "Alt er hjemmelavet! ...i en fabrik i Tyrkiet." 🏭',
    'Du ser et hår i maden. Gulle: "Det er krydderi!" 🧑‍🍳',
    'Gulle synger med til radioen. Kunderne flygter. 🎤',
    'En mus løber forbi. Gulle: "Det er maskotten!" 🐭',
    'Gulle: "Returret? HAHA! God joke min ven!" 🚫',
    'Sundhedsinspektøren kigger ind. Gulle lukker gardinet. 🪟',
    'Gulle: "Denne kebab har SJÆL! ...og lidt kylling fra i mandags." 🥙',
    'En kunde finder en plastik-gaffel i sin burger. Gulle: "GRATIS BESTIK!" 🍴',
    'Gulle tørrer bord af med den samme klud han tørrer sved af med. 🧽',
    'Gulle: "5 stjerner på TrustPilot! ...fra min mor, min far, og mig selv." ⭐',
    'Gulle: "Kebab er verdens mest perfekte mad. Krig mig." 🌯',
    'Du spørger hvad saucen er lavet af. Gulle: "Spørg ALDRIG igen." 🤫',
    'Gulle: "Du er min yndlingskunde!" Du: "Det siger du til alle." Gulle: "...ja." 😅',
    'En due flyver ind i butikken. Gulle: "VELKOMMEN! Vil du have en menu?!" 🕊️',
];
const randomPopups=[
    {text:'📱 Leth sender: "Tro på processen bror" 💪',color:'#dc2626'},
    {text:'📱 Lemming: "Bro jeg fandt en 20\'er!!!" 🐹',color:'#ff6b35'},
    {text:'🎵 Din yndlingssang spiller i baggrunden!',color:'#3b82f6'},
    {text:'☁️ En sky ligner en kebab. Du er sulten nu.',color:'#f59e0b'},
    {text:'🏃 En jogger løber forbi. Du føler dig doven.',color:'#00d4aa'},
    {text:'📸 Nogen tager et billede af dig. Creepy.',color:'#8b5cf6'},
    {text:'🐕 En hund logrer af dig. Dagens højdepunkt.',color:'#ffbe0b'},
    {text:'🌧️ Det regner lidt. Typisk Aarhus.',color:'#3b82f6'},
    {text:'💨 Vinden blæser dit hår perfekt. Filmisk.',color:'#00d4aa'},
    {text:'🎭 Du ser en gadekunstner. Han mimer DIG.',color:'#e040fb'},
    {text:'🍕 Du kan lugte pizza. Din mave rumler.',color:'#ff6b35'},
    {text:'👴 En gammel mand nikker anerkendende til dig.',color:'#ffbe0b'},
    {text:'📱 Malte sender: "Har du set Leths nye TikTok?! 💀"',color:'#dc2626'},
    {text:'🐦 En due lander på dit hoved. Du er udvalgt.',color:'#8b5cf6'},
    {text:'🎧 Nogen spiller "Toxic" på bluetooth-højtaler. Du viber.',color:'#ff006e'},
    {text:'🧊 Du træder i en vandpyt. Sokken er DØD. RIP. 🪦',color:'#3b82f6'},
    {text:'📱 Lemming: "bro tjek snap 😂😂😂" ...det er en selfie med en kat.',color:'#ff6b35'},
    {text:'🚲 En cyklist råber "UD AF VEJEN!" Du var på fortovet. 🤨',color:'#ff006e'},
    {text:'🌭 Du finder en hotdog-vogn. Fristelsen er REEL. 🌭',color:'#ffbe0b'},
    {text:'👻 Du hører en mærkelig lyd. Det var din mave. Falsk alarm.',color:'#8b5cf6'},
    {text:'📱 Thomas sender: "Nogen der gider FIFA?" Kl 14 en tirsdag. 🎮',color:'#00d4aa'},
    {text:'🎤 En bums synger opera. Han er faktisk GOD?!',color:'#e040fb'},
    {text:'💡 Du får en GENIAL idé! ...du glemmer den 3 sek senere.',color:'#ffbe0b'},
    {text:'🐈 En kat følger efter dig. Du har nu en sidekick. 🐱',color:'#ff6b35'},
    {text:'☔ Det begynder at regne. Du har SELVFØLGELIG ingen paraply.',color:'#3b82f6'},
    {text:'📱 Leth: "Tænk hvis vi startede et band... 🤔" IGEN?!',color:'#dc2626'},
    {text:'🏪 Netto har tilbud på Monster. Prioriteter: KORREKTE. ⚡',color:'#00d4aa'},
    {text:'🎵 Du nynner. Folk kigger. Du nynner HØJERE. 🗣️',color:'#e040fb'},
];
let lastPopupTime=0;
function maybeRandomPopup(){
    const now=Date.now();if(now-lastPopupTime<30000||G.scene!=='map')return;
    if(Math.random()>.85)return;
    lastPopupTime=now;
    const p=randomPopups[Math.floor(Math.random()*randomPopups.length)];
    msg(p.text);
    if(Math.random()<.3)sparkleEffect(Math.random()*innerWidth,Math.random()*innerHeight,p.color);
}
let lastJokeTime=0;
function maybeJoke(pool){
    const now=Date.now();if(now-lastJokeTime<15000)return;
    if(Math.random()>.3)return;
    lastJokeTime=now;
    const joke=pool[Math.floor(Math.random()*pool.length)];
    msg(joke);
    if(Math.random()<.2)screenShake(2,100);
}

// ===== CUSTOM ANIMATIONS =====
function screenShake(intensity=5,duration=300){
    const cv=document.getElementById('gc');if(!cv)return;
    const start=Date.now();
    const shake=()=>{
        const elapsed=Date.now()-start;
        if(elapsed>duration){cv.style.transform='';return;}
        const x=(Math.random()-.5)*intensity*2;
        const y=(Math.random()-.5)*intensity*2;
        cv.style.transform=`translate(${x}px,${y}px)`;
        requestAnimationFrame(shake);
    };shake();
}
function sparkleEffect(x,y,color='#ffbe0b'){
    for(let i=0;i<8;i++){
        const s=document.createElement('div');
        s.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:6px;height:6px;background:${color};border-radius:50%;pointer-events:none;z-index:999;transition:all .6s ease-out;opacity:1;`;
        document.body.appendChild(s);
        const angle=(i/8)*Math.PI*2;
        const dist=30+Math.random()*40;
        setTimeout(()=>{s.style.transform=`translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px)`;s.style.opacity='0';},10);
        setTimeout(()=>s.remove(),700);
    }
}
function bigTextFlash(text,color='#ff006e'){
    const d=document.createElement('div');
    d.style.cssText=`position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);font-family:'Press Start 2P',monospace;font-size:clamp(14px,4vw,28px);color:${color};text-shadow:0 0 20px ${color},0 0 40px ${color};z-index:999;pointer-events:none;transition:all .4s cubic-bezier(.17,.67,.83,.67);white-space:nowrap;`;
    d.textContent=text;document.body.appendChild(d);
    setTimeout(()=>{d.style.transform='translate(-50%,-50%) scale(1.2)';d.style.opacity='1';},10);
    setTimeout(()=>{d.style.transform='translate(-50%,-50%) scale(1.5)';d.style.opacity='0';},800);
    setTimeout(()=>d.remove(),1200);
}
function comboText(texts,colors){
    texts.forEach((t,i)=>{
        setTimeout(()=>{
            const d=document.createElement('div');
            d.style.cssText=`position:fixed;top:${35+i*12}%;left:50%;transform:translate(-50%,0) scale(0);font-family:'Press Start 2P',monospace;font-size:clamp(8px,2vw,16px);color:${colors[i]||'#fff'};text-shadow:0 0 10px ${colors[i]||'#fff'};z-index:999;pointer-events:none;transition:all .3s ease-out;`;
            d.textContent=t;document.body.appendChild(d);
            setTimeout(()=>{d.style.transform='translate(-50%,0) scale(1)';},10);
            setTimeout(()=>{d.style.opacity='0';d.style.transform='translate(-50%,-20px) scale(.8)';},1200);
            setTimeout(()=>d.remove(),1600);
        },i*300);
    });
}

function floatingDmg(text,color,side='girl'){
    const el=document.getElementById(side==='girl'?'c-girl':'c-hanzi');
    if(!el)return;
    const rect=el.getBoundingClientRect();
    const d=document.createElement('div');
    const x=rect.left+rect.width/2+(Math.random()-.5)*40;
    const y=rect.top+rect.height*.3;
    d.style.cssText=`position:fixed;left:${x}px;top:${y}px;font-family:'Press Start 2P',monospace;font-size:clamp(10px,2.5vw,18px);color:${color};text-shadow:0 0 8px ${color};z-index:999;pointer-events:none;transition:all .8s ease-out;opacity:1;`;
    d.textContent=text;document.body.appendChild(d);
    setTimeout(()=>{d.style.transform='translateY(-60px)';d.style.opacity='0';},20);
    setTimeout(()=>d.remove(),900);
}
function critFlash(){
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,190,11,.3);z-index:998;pointer-events:none;transition:opacity .3s;';
    document.body.appendChild(ov);
    setTimeout(()=>{ov.style.opacity='0';},50);
    setTimeout(()=>ov.remove(),400);
}
function dodgeEffect(){
    const el=document.getElementById('c-hanzi');
    if(!el)return;
    el.style.transition='transform .15s ease-out';
    el.style.transform='translateX(20px)';
    setTimeout(()=>{el.style.transform='translateX(-15px)';},150);
    setTimeout(()=>{el.style.transform='';el.style.transition='';},300);
}
function poisonDrip(side='hanzi'){
    const el=document.getElementById(side==='hanzi'?'c-hanzi':'c-girl');
    if(!el)return;
    const rect=el.getBoundingClientRect();
    for(let i=0;i<5;i++){
        const d=document.createElement('div');
        const x=rect.left+Math.random()*rect.width;
        d.style.cssText=`position:fixed;left:${x}px;top:${rect.top}px;width:4px;height:4px;background:#a855f7;border-radius:50%;z-index:999;pointer-events:none;transition:all ${.5+Math.random()*.5}s ease-in;opacity:.8;`;
        document.body.appendChild(d);
        setTimeout(()=>{d.style.transform=`translateY(${rect.height+20}px)`;d.style.opacity='0';},20+i*80);
        setTimeout(()=>d.remove(),1200);
    }
}
function hitFlash(color='#ff006e'){
    const ov=document.createElement('div');
    ov.style.cssText=`position:fixed;top:0;left:0;width:100%;height:100%;z-index:998;pointer-events:none;transition:opacity .2s;`;
    ov.style.background=`radial-gradient(ellipse at center,transparent 40%,${color}40 100%)`;
    document.body.appendChild(ov);
    setTimeout(()=>{ov.style.opacity='0';},100);
    setTimeout(()=>ov.remove(),350);
}
function sceneFlash(color='#fff'){
    const ov=document.createElement('div');
    ov.style.cssText=`position:fixed;top:0;left:0;width:100%;height:100%;background:${color};z-index:999;pointer-events:none;opacity:.6;transition:opacity .4s ease-out;`;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>{ov.style.opacity='0';});
    setTimeout(()=>ov.remove(),500);
}
function zoomIn(el,dur=400){
    if(!el)return;
    el.style.transition=`transform ${dur}ms cubic-bezier(.2,.8,.3,1.2)`;
    el.style.transform='scale(0.5)';el.style.opacity='0';
    setTimeout(()=>{el.style.transform='scale(1)';el.style.opacity='1';},20);
    setTimeout(()=>{el.style.transition='';el.style.transform='';},dur+50);
}
let mapParticles=[];
let ambientParticles=[];
function spawnFootstep(){
    if(mapParticles.length>15)return;
    mapParticles.push({x:G.px,y:G.py,life:20,alpha:.3});
}
function spawnAmbient(){
    if(ambientParticles.length>8)return;
    ambientParticles.push({x:Math.random(),y:Math.random(),life:60+Math.floor(Math.random()*60),sz:1+Math.random()*2,color:['#ffbe0b','#ff006e','#00d4aa','#3b82f6','#e040fb'][Math.floor(Math.random()*5)]});
}
function drawMapParticles(cx3,W,H){
    if(Math.random()<.03)spawnAmbient();
    ambientParticles=ambientParticles.filter(p=>{
        p.life--;p.y-=.001;const a=Math.min(1,p.life/30)*.25;
        cx3.fillStyle=p.color.replace(')',`,${a})`).replace('rgb','rgba').replace('#','');
        cx3.globalAlpha=a;cx3.fillStyle=p.color;
        cx3.beginPath();cx3.arc(p.x*W,p.y*H,p.sz+Math.sin(p.life*.1),0,Math.PI*2);cx3.fill();
        cx3.globalAlpha=1;return p.life>0;
    });
    mapParticles=mapParticles.filter(p=>{
        p.life--;p.alpha=p.life/20*.3;
        cx3.fillStyle=`rgba(255,0,110,${p.alpha})`;
        cx3.beginPath();cx3.arc(p.x*W,p.y*H,3,0,Math.PI*2);cx3.fill();
        return p.life>0;
    });
}
function pulseElement(el,color,times=3){
    if(!el)return;
    let i=0;
    const pulse=()=>{
        if(i>=times*2)return;
        el.style.boxShadow=i%2===0?`0 0 15px ${color},inset 0 0 10px ${color}`:'';
        i++;setTimeout(pulse,200);
    };pulse();
}

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

// ===== IMAGES =====
const mapImg=new Image();mapImg.src='images/map.png';let mapReady=false;
mapImg.onload=()=>{mapReady=true;};
const kbhMapImg=new Image();kbhMapImg.src='images/København.png';let kbhMapReady=false;
kbhMapImg.onload=()=>{kbhMapReady=true;};
const charImgs={};
['hanzi','leth','kalle','Gulle','ritardo','girl_1','girl_2','girl_3','girl_4','girl_5','girl_6','girl_7','girl_8','girl_9','girl_10','girl_11','girl_12','girl_boss','valentina'].forEach(k=>{
    const img=new Image();img.src='images/'+k+'.png';charImgs[k]=img;
});

// ===== BUILDINGS (positions in IMAGE coordinates 0-1, converted dynamically) =====
const bldsImg=[
    {id:'gym',ix:.04,iy:.13,iw:.13,ih:.08,name:'GYM',icon:'💪'},
    {id:'shop',ix:.22,iy:.21,iw:.11,ih:.07,name:'BUTIK',icon:'🛒'},
    {id:'work',ix:.52,iy:.15,iw:.14,ih:.10,name:'ARBEJDE',icon:'💰'},
    {id:'bodega',ix:.09,iy:.28,iw:.14,ih:.08,name:'BODEGA',icon:'🍺'},
    {id:'tree',ix:.30,iy:.43,iw:.12,ih:.08,name:'SKILLS',icon:'🌟'},
    {id:'rest',ix:.37,iy:.64,iw:.13,ih:.09,name:'HJEM',icon:'🏠'},
    {id:'club',ix:.04,iy:.68,iw:.15,ih:.09,name:'KLUB',icon:'🪩'},
];
const kbhBldsImg=[
    {id:'kirke',ix:.22,iy:.38,iw:.16,ih:.14,name:'KIRKE',icon:'⛪'},
    {id:'victor',ix:.50,iy:.60,iw:.16,ih:.11,name:'VICTORS SHOP',icon:'🏪'},
    {id:'gyden',ix:.56,iy:.44,iw:.14,ih:.10,name:'GYDEN',icon:'🌙'},
    {id:'marius',ix:.08,iy:.20,iw:.15,ih:.12,name:'MARIUS HUS',icon:'🏠'},
];
let blds=bldsImg.map(b=>({...b,x:b.ix,y:b.iy,w:b.iw,h:b.ih}));
let kbhBlds=kbhBldsImg.map(b=>({...b,x:b.ix,y:b.iy,w:b.iw,h:b.ih}));
let cropSX=0,cropSY=0,cropSW=1,cropSH=1;
let kbhCropSX=0,kbhCropSY=0,kbhCropSW=1,kbhCropSH=1;
function updateBldPositions(){
    blds=bldsImg.map(b=>{
        const x=(b.ix-cropSX)/cropSW;
        const y=(b.iy-cropSY)/cropSH;
        const w=b.iw/cropSW;
        const h=b.ih/cropSH;
        return {...b,x,y,w,h};
    });
}
function updateKbhBldPositions(){
    kbhBlds=kbhBldsImg.map(b=>{
        const x=(b.ix-kbhCropSX)/kbhCropSW;
        const y=(b.iy-kbhCropSY)/kbhCropSH;
        const w=b.iw/kbhCropSW;
        const h=b.ih/kbhCropSH;
        return {...b,x,y,w,h};
    });
}
function getActiveBlds(){return G.currentMap==='kbh'?kbhBlds:blds;}

// ===== TOP-DOWN MAP =====
let mapT=0;
let mapOX=0,mapOY=0,mapDW=0,mapDH=0;

function drawMapImage(img,ready,isKbh){
    const W=cv.width,H=cv.height;
    if(!ready)return;
    const imgR=img.width/img.height,cvR=W/H;
    const isPortrait=H>W;
    let dx=0,dy=0,dw=W,dh=H;
    if(isPortrait){
        let sx=0,sy=0,sw=img.width,sh=img.height;
        if(imgR>cvR){const nw=img.height*cvR;sx=Math.max(0,(img.width-nw)*.15);sw=nw;}
        else{const nh=img.width/cvR;sy=Math.max(0,(img.height-nh)*.3);sh=nh;}
        cx.drawImage(img,sx,sy,sw,sh,0,0,W,H);
        const nSX=sx/img.width,nSY=sy/img.height,nSW=sw/img.width,nSH=sh/img.height;
        if(isKbh){if(Math.abs(nSX-kbhCropSX)>.001||Math.abs(nSW-kbhCropSW)>.001){kbhCropSX=nSX;kbhCropSY=nSY;kbhCropSW=nSW;kbhCropSH=nSH;updateKbhBldPositions();}}
        else{if(Math.abs(nSX-cropSX)>.001||Math.abs(nSW-cropSW)>.001){cropSX=nSX;cropSY=nSY;cropSW=nSW;cropSH=nSH;updateBldPositions();}}
    } else {
        if(imgR>cvR){dh=W/imgR;dy=(H-dh)/2;dw=W;}
        else{dw=H*imgR;dx=(W-dw)/2;dh=H;}
        cx.fillStyle='#4a7a3a';cx.fillRect(0,0,W,H);
        cx.drawImage(img,0,0,img.width,img.height,dx,dy,dw,dh);
        const nSX=-dx/dw,nSY=-dy/dh,nSW=W/dw,nSH=H/dh;
        if(isKbh){if(Math.abs(nSX-kbhCropSX)>.001||Math.abs(nSW-kbhCropSW)>.001||Math.abs(nSY-kbhCropSY)>.001||Math.abs(nSH-kbhCropSH)>.001){kbhCropSX=nSX;kbhCropSY=nSY;kbhCropSW=nSW;kbhCropSH=nSH;updateKbhBldPositions();}}
        else{if(Math.abs(nSX-cropSX)>.001||Math.abs(nSW-cropSW)>.001||Math.abs(nSY-cropSY)>.001||Math.abs(nSH-cropSH)>.001){cropSX=nSX;cropSY=nSY;cropSW=nSW;cropSH=nSH;updateBldPositions();}}
    }
}
function drawTravelArrow(W,H,x,y,pointRight,label){
    const pulse=Math.sin(mapT*5)*.15+.85;
    cx.save();cx.globalAlpha=pulse;
    cx.fillStyle='#ff1a1a';cx.shadowColor='#ff1a1a';cx.shadowBlur=18;
    const dir=pointRight?1:-1;
    cx.beginPath();
    cx.moveTo(x+dir*35,y);
    cx.lineTo(x,y-20);cx.lineTo(x,y-9);cx.lineTo(x-dir*24,y-9);
    cx.lineTo(x-dir*24,y+9);cx.lineTo(x,y+9);cx.lineTo(x,y+20);
    cx.closePath();cx.fill();
    cx.shadowBlur=0;cx.font="bold "+Math.max(7,W*.018)+"px 'Press Start 2P'";cx.textAlign='center';
    cx.fillStyle='#fff';cx.fillText(label,x,y+32);
    cx.restore();
}
function drawMap(){
    mapT+=.005;const W=cv.width,H=cv.height;
    cx.fillStyle='#4a8c5c';cx.fillRect(0,0,W,H);
    const isKbh=G.currentMap==='kbh';
    if(isKbh) drawMapImage(kbhMapImg,kbhMapReady,true);
    else drawMapImage(mapImg,mapReady,false);
    const activeBlds=getActiveBlds();
    activeBlds.forEach(b=>{
        const bx=b.x*W,by=b.y*H,bw=b.w*W,bh=b.h*H;
        const dx2=G.px-(b.x+b.w/2),dy2=G.py-(b.y+b.h/2);
        const near=Math.sqrt(dx2*dx2+dy2*dy2)<.1;
        const gl=Math.sin(mapT*3)*.2+.5;
        cx.shadowColor='#ff1a1a';cx.shadowBlur=near?12:6;
        cx.strokeStyle=near?`rgba(255,26,26,${gl+.3})`:`rgba(255,26,26,${gl})`;
        cx.lineWidth=near?3:2;
        cx.strokeRect(bx-2,by-2,bw+4,bh+4);cx.shadowBlur=0;
    });
    if(!isKbh&&eventMarker){
        const mx=eventMarker.x*W,my=eventMarker.y*H,mt2=(Date.now()-eventMarker.t)*.003;
        const bounce=Math.sin(mt2*3)*4,pulse=.7+Math.sin(mt2*2)*.3;
        cx.save();cx.globalAlpha=pulse;
        cx.shadowColor='#ffbe0b';cx.shadowBlur=12+Math.sin(mt2*4)*5;
        cx.fillStyle='rgba(0,0,0,.6)';cx.beginPath();cx.arc(mx,my+bounce,16,0,Math.PI*2);cx.fill();
        cx.fillStyle='#ffbe0b';cx.beginPath();cx.arc(mx,my+bounce,14,0,Math.PI*2);cx.fill();
        cx.shadowBlur=0;cx.fillStyle='#000';cx.font=`bold ${Math.max(12,W*.028)}px 'Press Start 2P'`;cx.textAlign='center';cx.textBaseline='middle';
        cx.fillText('?',mx,my+bounce+1);
        cx.restore();
        cx.fillStyle='rgba(255,190,11,.15)';cx.beginPath();cx.arc(mx,my,22+Math.sin(mt2*2)*6,0,Math.PI*2);cx.fill();
    }
    // Hanzi sprite
    const hx=G.px*W,hy=G.py*H;
    const bob=G.walking?Math.sin(Date.now()*.015)*2:0;
    const sz=Math.max(10,W*.025);
    cx.fillStyle='rgba(0,0,0,.5)';cx.beginPath();cx.ellipse(hx,hy+sz*.8,sz*.9,sz*.4,0,0,Math.PI*2);cx.fill();
    cx.strokeStyle='rgba(255,0,110,.5)';cx.lineWidth=3;cx.shadowColor='#ff006e';cx.shadowBlur=10;
    cx.beginPath();cx.arc(hx,hy+bob,sz*1.4,0,Math.PI*2);cx.stroke();cx.shadowBlur=0;
    cx.fillStyle='#475569';cx.beginPath();cx.arc(hx,hy+bob,sz,0,Math.PI*2);cx.fill();
    cx.fillStyle='#c68642';cx.beginPath();cx.arc(hx,hy-sz*.7+bob,sz*.65,0,Math.PI*2);cx.fill();
    cx.fillStyle='#111';cx.beginPath();cx.arc(hx,hy-sz*1.05+bob,sz*.65,Math.PI,Math.PI*2);cx.fill();
    cx.font=`bold ${Math.max(7,W*.018)}px 'Press Start 2P'`;cx.textAlign='center';
    cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(hx-20,hy-sz*1.8+bob-2,40,10);
    cx.fillStyle='#ff006e';cx.fillText('HANZI',hx,hy-sz*1.8+bob+6);
    if(G.walking){
        cx.fillStyle='rgba(255,0,110,.5)';cx.beginPath();cx.arc(G.tx*W,G.ty*H,6,0,Math.PI*2);cx.fill();
        cx.strokeStyle='rgba(255,0,110,.3)';cx.lineWidth=2;cx.beginPath();cx.arc(G.tx*W,G.ty*H,10+Math.sin(mapT*8)*3,0,Math.PI*2);cx.stroke();
    }
    // Travel arrows - always visible
    if(!isKbh&&!G.kbhUnlocked){
        const ax=W*.90,ay=H*.5,pulse=Math.sin(mapT*5)*.15+.85;
        cx.save();cx.globalAlpha=pulse;
        cx.fillStyle='#ff1a1a';cx.shadowColor='#ff1a1a';cx.shadowBlur=18;
        cx.beginPath();cx.moveTo(ax+35,ay);cx.lineTo(ax,ay-20);cx.lineTo(ax,ay-9);cx.lineTo(ax-24,ay-9);cx.lineTo(ax-24,ay+9);cx.lineTo(ax,ay+9);cx.lineTo(ax,ay+20);cx.closePath();cx.fill();
        cx.shadowBlur=0;cx.font="bold "+Math.max(7,W*.016)+"px 'Press Start 2P'";cx.textAlign='center';
        cx.fillStyle='#fff';cx.fillText('KØBENHAVN',ax,ay+32);
        if(G.round>=3){cx.fillStyle='#ffbe0b';cx.fillText('1000 KR',ax,ay+44);}
        else{cx.fillStyle='#aaa';cx.fillText('EFTER RUNDE 2',ax,ay+44);}
        cx.restore();
    }
    if(!isKbh&&G.kbhUnlocked){
        drawTravelArrow(W,H,W*.90,H*.5,true,'KØBENHAVN →');
    }
    if(isKbh){
        drawTravelArrow(W,H,W*.08,H*.5,false,'← AARHUS');
    }
    // Map particles
    drawMapParticles(cx,W,H);
    maybeRandomPopup();
    // Walk
    if(G.walking){
        const dx=G.tx-G.px,dy=G.ty-G.py,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<.015){G.walking=false;G.px=G.tx;G.py=G.ty;onArrived();}
        else{const spd=.006;G.px+=dx/dist*spd;G.py+=dy/dist*spd;if(Math.random()<.3)spawnFootstep();}
    }
}

// ===== CLICK MAP =====
function travelToKbh(){
    G.currentMap='kbh';G.px=.1;G.py=.5;G.walking=false;
    sceneFlash('#3b82f6');advTime(2);S.door();Mus.play('kbh');msg('Du rejser til København! 🏙️');updHUD();
}
function travelToAarhus(){
    G.currentMap='aarhus';G.px=.85;G.py=.5;G.walking=false;
    sceneFlash('#00d4aa');advTime(2);S.door();Mus.play('map');msg('Du rejser tilbage til Aarhus! 🏠');updHUD();
}
cv.addEventListener('click',e=>{
    if(G.scene!=='map'||G.walking)return;
    const rx=e.clientX/cv.width,ry=e.clientY/cv.height;
    const isKbh=G.currentMap==='kbh';
    // Travel: Aarhus → KBH (right side arrow)
    if(!isKbh&&G.kbhUnlocked&&rx>.85&&ry>.4&&ry<.6){
        travelToKbh();return;
    }
    // Travel: KBH → Aarhus (left side arrow)
    if(isKbh&&rx<.15&&ry>.4&&ry<.6){
        travelToAarhus();return;
    }
    // KBH unlock click
    if(!isKbh&&G.round>=3&&!G.kbhUnlocked&&rx>.82&&ry>.35&&ry<.65){
        if(G.money<1000){msg('Du mangler penge! Koster 1000 KR.');S.bad();return;}
        G.money-=1000;G.kbhUnlocked=true;S.perf();float('KØBENHAVN UNLOCKED!','#ffbe0b');bigTextFlash('KØBENHAVN!','#ffbe0b');screenShake(10,500);sparkleEffect(innerWidth/2,innerHeight/2,'#ffbe0b');sparkleEffect(innerWidth/3,innerHeight/3,'#00d4aa');sparkleEffect(innerWidth*2/3,innerHeight*2/3,'#e040fb');
        msg('København er unlocked! 🏙️');updHUD();return;
    }
    // Check event marker click (only in Aarhus)
    if(!isKbh&&eventMarker){
        const dx=rx-eventMarker.x,dy=ry-eventMarker.y;
        if(Math.sqrt(dx*dx+dy*dy)<.05){S.click();goTo({x:eventMarker.x-.03,y:eventMarker.y-.03,w:.06,h:.06,id:'event_marker'});return;}
    }
    // Check building click
    const activeBlds=getActiveBlds();
    for(const b of activeBlds){
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
    if(G.scene!=='map'){return;}
    if(id==='event_marker'){showRandomEvent();return;}
    advTime(1);
    if(id&&locationIntros[id]&&!visitedLocations[id]){visitedLocations[id]=true;msg(locationIntros[id]);setTimeout(()=>{if(G.scene==='map')onArrivedInner(id);},3500);return;}
    onArrivedInner(id);
}
function onArrivedInner(id){
    maybeJoke(jokePool);
    sparkleEffect(innerWidth/2,innerHeight/2,'#ff1a1a');
    switch(id){
        case'gym':if(G.hunger<20){msg('For sulten til at træne! Spis noget.');return;}openGym();break;
        case'shop':openShop();break;
        case'tree':openTree();break;
        case'work':openWork();break;
        case'rest':doRest();break;
        case'bodega':openBodega();break;
        case'club':
            if(G.daysLeft>0){msg('Klubben åbner om '+G.daysLeft+' dage!');return;}
            goClub();break;
        case'kirke':openKirke();break;
        case'victor':openVictor();break;
        case'gyden':openGyden();break;
        case'marius':openMarius();break;
    }
}

function newDay(){G.hour=8;G.day++;G.daysLeft=Math.max(0,G.daysLeft-1);const dayHeal=Math.min(10,G.maxHP-G.currentHP);if(dayHeal>0){G.currentHP=Math.min(G.maxHP,G.currentHP+dayHeal);float('+'+dayHeal+' HP (ny dag)','#00d4aa');}bodegaUsedToday=false;G.wheelUsedToday=false;G.eventDoneToday=false;G.kirkePrayedToday=false;G.gydenUsedToday=false;eventMarker=null;gamblesToday=0;foodBoughtToday=0;if(G.buffDays>0){G.buffDays--;if(G.buffDays<=0)G.buff=null;}stockPrices.hanzi=Math.max(10,stockPrices.hanzi+Math.floor((Math.random()-.45)*30));stockPrices.tbh=Math.max(5,stockPrices.tbh+Math.floor((Math.random()-.45)*20));stockPrices.leth=Math.max(8,stockPrices.leth+Math.floor((Math.random()-.45)*25));spawnEventMarker();
showDayFlash();
if(G.daysLeft===0){pendingForceClub=false;setTimeout(forceClub,2500);return;}
pendingWheel=true;if(G.scene==='map')setTimeout(()=>{if(pendingWheel){pendingWheel=false;openWheel();}},2500);
const lc=loreCalls.find(c=>c.day===G.day);if(lc){pendingLore=lc;if(G.scene==='map')setTimeout(()=>{if(pendingLore){const l=pendingLore;pendingLore=null;showLoreCall(l);}},4500);}}
const morningJokes=[
    '☀️ "5 minutter mere..."',
    '☀️ Du slog alarmen ihjel. Igen.',
    '☀️ Drømte du var rig. Checket konto. Nej.',
    '☀️ Din nabo spiller techno kl 8. Klassiker.',
    '☀️ Du vågnede med kebabsovs på puden.',
    '☀️ Telefon: 12 ubesvarede fra Lemming.',
    '☀️ Spejlet: "Vi snakker ikke om det." 🪞',
    '☀️ Du har en PLAN i dag. ...hvad var den?',
    '☀️ Din kat stirrer på dig. Dømmende. 🐱',
    '☀️ Nogen har spist din sidste yoghurt. Det var dig kl 3. 🥄',
    '☀️ Du checker Instagram. 47 minutter senere... 📱',
    '☀️ Din ryg gør ondt. Du er 22. TJUETO. 👴',
    '☀️ "I dag bliver jeg PRODUKTIV!" *åbner TikTok* 📵',
    '☀️ Du finder en pizza under sengen. Stadig varm?? 🍕',
    '☀️ Lemming har sendt 8 memes kl 4 om natten 📲',
    '☀️ Drømte du vandt X Factor. Vågnede og sang. Naboen bankede. 🎤',
    '☀️ Du lugter dig selv. Shower: PRIORITET 1. 🚿',
    '☀️ Kontoen siger minus. Banken siger "ring venligst". 📉',
    '☀️ Du har en sok på. Kun én. Mysterium. 🧦',
    '☀️ "Bare 5 min mere" gang 47... okay NU. 😤',
];
function showDayFlash(){
    const f=document.getElementById('day-flash');
    document.getElementById('df-day').textContent='DAG '+G.day;
    const dl=G.daysLeft;
    const morningMsg=dl>0?dl+' DAGE TIL FREDAG 🪩':'FREDAG! KLUBBEN NU! 🔥';
    document.getElementById('df-sub').textContent=morningMsg;
    f.classList.add('show');screenShake(3,150);setTimeout(()=>f.classList.remove('show'),2200);
    if(dl===0){bigTextFlash('FREDAG!','#ff006e');screenShake(8,400);sparkleEffect(innerWidth/2,innerHeight/2,'#ff006e');sparkleEffect(innerWidth/3,innerHeight/3,'#ffbe0b');}
    if(Math.random()<.4){setTimeout(()=>msg(morningJokes[Math.floor(Math.random()*morningJokes.length)]),2500);}
}
const lethLore=[
    'Leth: "Ingen bliver konge uden at bløde for det, bror. Husk det."',
    'Leth: "Kalle Mith? Glem ham. Fokusér på træningen."',
    'Leth: "Jeg besøgte dig aldrig på hospitalet... jeg kunne ikke se dig sådan."',
    'Leth: "Valentina er ikke et mål. Hun er en mur. Ingen kommer over den."',
    'Leth: "TBH smed dig ud fordi du var i koma... kold business bror."',
    'Leth: "Husker du den aften i Royal Arena? 40.000 mennesker..."',
    'Leth: "Din motorcykel... den ulykke var vild. Du er heldig du overlevede."',
    'Leth: "Scor den hotteste pige og hele byen snakker."',
    'Leth: "TBH\'s fans savner dig. #BringHanziBack er trending."',
    'Leth: "Tro mig, du er klar til det her. Jeg har trænet dig godt."',
    'Leth: "Hver pige du møder er en test. Byen holder øje."',
    'Leth: "2 år er lang tid bror. Byen har ændret sig. Men DU er stadig DU."',
];
const lethLoreWeek7=[
    'Leth: "...bare træn. Vi ses fredag."',
    'Leth: "Fokusér. Ikke mere snak."',
];
const visitedLocations={};
const locationIntros={
    gym:'💪 LETH\'S GYM\nTræn dine stats her! Hver øvelse er et mini-game.\nSTYRKE = mere skade\nCARDIO = mere HP\nSMALL TALK = mere mana\nREFLEX = bedre hit/block',
    shop:'🛒 GULLE\'S SHOP\nKøb mad for at fylde sult.\nKøb style for charm points.\nKøb kamp-items til combat.',
    work:'💰 RITARDO\'S JOBS\nTjen penge her. Højere level = bedre jobs.\nKoster sult og tid.',
    tree:'🌟 SKILL TREE\nBrug charm points til at unlocke perks.\nVælg mellem kamp, forsvar, eller social.',
    bodega:'🍺 BODEGA\nMød og battle piger 1 gang om dagen.\nOpgrader for at møde pænere piger.\nNemmere end klubben!',
    club:'🪩 KLUBBEN\nDen store boss fight!\nHer møder du rundens pige.',
    kirke:'⛪ KIRKE\nBed og få +1 til ALLE stats permanent.\nKoster 1000 KR at unlocke. Bøn-pris stiger!',
    victor:'🏪 VICTORS SHOP\nKøb relics med permanente effekter.\nOpgrader dit arbejde og mere!',
    gyden:'🌙 GYDEN\nUlovligt arbejde. Store penge, stor risiko.\n12 timer. 10% chance for politiet!\n⚠️ Åbner først efter kl. 12!',
    marius:'🏠 MARIUS HUS\nKøb samtaler med Marius.\nNødvendigt for at unlocke den sande boss!',
};
let pendingNewDay=false,pendingWheel=false,pendingLore=null,pendingForceClub=false;

// ===== GUTTERTID FLASHBACKS =====
const guttertidImages=[1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,36,38,39,40,41,42,43,44,45,46,47,48,49,50];
const guttertidCaptions=[
    'Gutterne samlet i byen... legendary vibes 🔥',
    'Chillin\' på bænken med snacks og Royal 😎',
    'Drengene på bar! Carlsberg og kamera! 📸',
    'Tuborg-tårn bygger sig selv! Legend 🍺',
    'Gutterne repræsenterer hårdt! 💪',
    'Endnu en crazy aften med gutterne 🌙',
    'Vibes: immaculate. Lokation: ukendt 🗺️',
    'Gutter tid har INGEN regler! 🤘',
    'Flashback til de vilde dage! ⚡',
    'Bro-øjeblik captured forever 📱',
    'Gutterne ejer natten! 🌃',
    'Klassisk gutter tid moment 🎤',
    'Ingen sover før solen er oppe! ☀️',
    'De gode gamle dage... 🎶',
    'Det CRAZIEST eventyr endnu! 🤯',
    'Hvem tog det billede?! Ingen ved det 📷',
    'Legendary night out med drengene 💎',
    'Stemningen: 11/10. Altid. 🔥',
    '"Vi tager bare ÉN øl..." - berømt sidste ord 🍻',
    'Bros before... alt, 100% 🤝',
    'Gutter tid episode: UKENDT 🎬',
    'Den aften ingen husker men alle snakker om 🧠',
    'Spontan mission: SUCCES 🎯',
    'Kl 4 om natten og stadig going strong 💪',
    'Nogen sagde "hjem"? Vi hørte "mere!" 🏠❌',
    'Det her billede er BEVIS 📋',
    'Gutterne mod verden! 🌍',
    'Endnu en dag, endnu et eventyr 🗡️',
    'Drengene i deres naturlige habitat 🦁',
    'Gutter reunion tour continues! 🎸',
    'Minder der varer for evigt... eller til i morgen 😅',
    'Gutter tid: ingen fortrydelse, kun vibes ✨',
    'Snapshot af ren lykke 📸',
    'Klassiker. Absolut klassiker. 👑',
    'Den aften der startede det hele... 🌟',
    'Brødrene rider igen! 🏇',
    'Historier der aldrig kan fortælles i skolen 📚❌',
    'Gutter tid level: MAKSIMAL 📈',
    'Ingen plan, ingen regler, ingen problemer 🤷',
    'Endnu et kapitel i legenden 📖',
    'Kameraet fanger sandheden 🎥',
    'Aften-vibes: immaculate as always 🌙',
    'Den perfekte aften eksisterer ik— DETTE BILLEDE 💯',
    'Gutterne gør det igen! Og igen! Og IGEN! 🔄',
    'Snapshot #47: ingen kontekst nødvendig 🤔',
    'Pure chaos. Pure broderskab. Pure gutter tid 🫡',
    'Sæson 50 af Gutter Tid og vi er STADIG her 🏆',
];
function showGuttertid(){
    const dayIdx=Math.max(0,G.day-1);
    const imgNum=guttertidImages[dayIdx%guttertidImages.length];
    const caption=guttertidCaptions[dayIdx%guttertidCaptions.length];
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.95);z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .5s ease;';
    const title=document.createElement('div');title.className='pix';
    title.style.cssText='color:#ffbe0b;font-size:clamp(10px,3vw,18px);margin-bottom:12px;text-shadow:0 0 15px rgba(255,190,11,.5);';
    title.textContent='📸 GUTTER TID #'+imgNum;
    const img=document.createElement('img');
    img.src='Guttertid/'+imgNum+'.jpg';
    img.style.cssText='max-width:85%;max-height:55vh;border-radius:8px;border:2px solid rgba(255,190,11,.4);box-shadow:0 0 30px rgba(255,190,11,.2);object-fit:contain;';
    const cap=document.createElement('div');cap.className='pix';
    cap.style.cssText='color:#ccc;font-size:clamp(6px,1.8vw,10px);margin-top:12px;max-width:80%;text-align:center;';
    cap.textContent=caption;
    const hint=document.createElement('div');hint.className='pix';
    hint.style.cssText='color:rgba(255,255,255,.3);font-size:clamp(5px,1.2vw,7px);margin-top:20px;';
    hint.textContent='[ tryk for at fortsætte ]';
    ov.appendChild(title);ov.appendChild(img);ov.appendChild(cap);ov.appendChild(hint);
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.style.opacity='1');
    S.click();
    ov.onclick=()=>{
        S.click();ov.style.opacity='0';
        setTimeout(()=>{ov.remove();G.scene='map';Mus.play('map');},400);
    };
}
function advTime(h){G.hour+=h;if(G.hour>=24){if(G.scene==='map'){newDay();}else{G.hour=8;G.day++;G.daysLeft=Math.max(0,G.daysLeft-1);pendingNewDay=true;}}}

// ===== LORE CALLS =====
const loreCalls=[
    {day:2, speakers:['Lemming','Malte'], lines:[
        {who:'Lemming',text:'BRO. Hanzi er VÅGEN. Det er ikke en joke.'},
        {who:'Malte',text:'2 år bro... byen har ændret sig. ALT er ændret.'},
        {who:'Lemming',text:'Der er en ny konge af nattelivet. Ingen har set hans ansigt. Altid maske.'},
        {who:'Malte',text:'Folk hvisker bare ét navn... Kalle Mith.'},
    ]},
    {day:5, speakers:['Marius','Thomas'], lines:[
        {who:'Marius',text:'Kan I huske Phil? Roadien der skruede på Hanzis motorcykel?'},
        {who:'Thomas',text:'Ham der blev fyret ugen før ulykken? Hvad med ham?'},
        {who:'Marius',text:'Han forsvandt dagen efter crashet. Ingen har hørt fra ham siden.'},
        {who:'Thomas',text:'Folk forsvinder bro. Det behøver ikke betyde noget... vel?'},
    ]},
    {day:9, speakers:['Lemming','Malte','Thomas'], lines:[
        {who:'Lemming',text:'Kalle Mith ejer ALT nu. Klubberne. Bodegaerne. Dørmændene.'},
        {who:'Malte',text:'Og hans kæreste... Valentina. Bro. VERDENS pæneste pige. Ikke debat.'},
        {who:'Thomas',text:'Ingen har set hende tæt på uden at glemme deres eget navn.'},
        {who:'Lemming',text:'De 7 piger på klubberne? Det er HANS system. 7 tests ingen har klaret.'},
    ]},
    {day:12, speakers:['Marius','Malte'], lines:[
        {who:'Marius',text:'Jeg var på Neon Bar i går. Gæt hvem der står i døren som sikkerhedschef.'},
        {who:'Malte',text:'Nej...'},
        {who:'Marius',text:'PHIL. Lyslevende. I jakkesæt. Han arbejder for Kalle Mith nu.'},
        {who:'Malte',text:'Roadien der forsvandt efter ulykken... arbejder for kongen? Det stinker bro.'},
    ]},
    {day:16, speakers:['Marius','Thomas'], lines:[
        {who:'Marius',text:'Jeg har gravet i Valentina. Bro... hun EKSISTEREDE ikke for 2 år siden.'},
        {who:'Thomas',text:'Hvad mener du? Hun er fra Milano.'},
        {who:'Marius',text:'Ingen billeder. Ingen historik. Hun dukkede op af INGENTING... ugen efter Hanzis ulykke.'},
        {who:'Thomas',text:'Så kongens kæreste og Hanzis crash sker samme uge... tilfælde. Må være tilfælde.'},
    ]},
    {day:19, speakers:['Lemming','Marius','Malte'], lines:[
        {who:'Lemming',text:'Jeg har noget ÆGTE nu. Politirapporten fra ulykken.'},
        {who:'Malte',text:'Hvordan har du— glem det. Hvad står der?'},
        {who:'Lemming',text:'Bolten i forbremsen var løsnet. Med værktøj. Det var ikke et uheld.'},
        {who:'Marius',text:'...hvem havde adgang til garagen? Tænk. HVEM havde nøglen?'},
    ]},
    {day:23, speakers:['Thomas','Malte'], lines:[
        {who:'Thomas',text:'GUYS. Jeg så Valentina. VIP, fredag. Og hun spurgte om HANZI.'},
        {who:'Malte',text:'HVAD?! Kalle Miths kæreste spørger om vores bror?!'},
        {who:'Thomas',text:'Hun hviskede det. Kiggede sig over skulderen først. Som om hun var bange.'},
        {who:'Malte',text:'Bange... for sin egen kæreste? Hvad foregår der i det imperium?'},
    ]},
    {day:26, speakers:['Lemming','Marius','Thomas'], lines:[
        {who:'Marius',text:'Timeline: Phil fyres. Phil har garagenøglen. Bolten løsnes. Hanzi crasher.'},
        {who:'Lemming',text:'Phil forsvinder. Phil dukker op igen — hos Kalle Mith. I jakkesæt.'},
        {who:'Thomas',text:'Motiv: hævn over fyringen. Betaling: jobbet. Det er HAM. Det er Phil.'},
        {who:'Marius',text:'...det er næsten for perfekt. Men okay. Det er Phil. Det MÅ være Phil.'},
    ]},
    {day:30, speakers:['Marius','Thomas'], lines:[
        {who:'Marius',text:'Jeg fandt mekanikeren der bjærgede motorcyklen. Han bekræfter ALT.'},
        {who:'Thomas',text:'Bolten?'},
        {who:'Marius',text:'Løsnet præcis 3 omgange. Professionelt. Én der kender den maskine.'},
        {who:'Thomas',text:'Phil byggede den motorcykel OP for Hanzi. Ingen kender den bedre. Sagen er lukket bro.'},
    ]},
    {day:33, speakers:['Lemming','Malte','Marius','Thomas'], lines:[
        {who:'Lemming',text:'Så planen er: Hanzi scorer sig hele vejen til toppen, og så fanger vi Phil.'},
        {who:'Malte',text:'Hvorfor scorer han ikke bare Phil ud af busken nu?!'},
        {who:'Marius',text:'Fordi Phil gemmer sig bag Kalle Miths system. Man når ham kun via de 7.'},
        {who:'Thomas',text:'Én ting nager mig... hvem BETALTE Phils jakkesæt-job? En roadie hyrer ikke sig selv.'},
    ]},
    {day:37, speakers:['Malte','Thomas'], lines:[
        {who:'Malte',text:'Phil har sendt en besked gennem en dørmand: "Sig til Hanzi han skal stoppe med at klatre."'},
        {who:'Thomas',text:'En trussel?!'},
        {who:'Malte',text:'Nej... det var det underlige. Dørmanden sagde Phil så BANGE ud.'},
        {who:'Thomas',text:'Hvorfor er BAGMANDEN bange? Det giver ingen mening bro.'},
    ]},
    {day:40, speakers:['Marius','Lemming','Malte','Thomas'], lines:[
        {who:'Marius',text:'VI FIK HAM. Vi pressede Phil bag Neon Bar i nat. Han knækkede TOTALT.'},
        {who:'Lemming',text:'Han tilstod bolten. Men bro... han blev BETALT. Han har aldrig mødt bagmanden.'},
        {who:'Malte',text:'Alt han har er en stemmememo. Forvrænget stemme. Vi hørte den.'},
        {who:'Thomas',text:'Den sluttede med: "Ingen bliver konge uden at bløde for det." ...hvor har jeg hørt den sætning før?'},
    ]},
    {day:44, speakers:['Lemming','Malte','Thomas','Marius'], lines:[
        {who:'Lemming',text:'Kalle Mith ved du kommer. Dørmændene har billeder af dig.'},
        {who:'Malte',text:'6 nede. Hele byen tæller med. #HanziErBack er overalt bro.'},
        {who:'Thomas',text:'En pige gav mig en seddel til dig. Ingen afsender.'},
        {who:'Thomas',text:'Der står: "Jeg så dig i Royal Arena. Jeg har ventet i 2 år. Pas på ham. — V"'},
        {who:'Marius',text:'Bro... BLIV VED med at snakke med mig i KBH! Jeg har fundet noget VILDT om Kalle Mith. Vi skal bruge ALLE mine kontakter for at afsløre ham! 🔧'},
    ]},
    {day:47, speakers:['Marius','Malte'], lines:[
        {who:'Marius',text:'Scorer du den sidste i aften, kommer HAN frem. Masken falder.'},
        {who:'Malte',text:'Jeg kan stadig ikke få den sætning ud af hovedet. "Ingen bliver konge uden at bløde..."'},
        {who:'Marius',text:'...vent. VENT. Hvem siger altid det? HVEM SIGER ALTID DET?!'},
        {who:'Malte',text:'Opkaldet ryger— 📵'},
    ]},
];
function showLoreCall(callData){
    let lineIdx=0;
    const ov=document.getElementById('phone-ov');
    const msgs=document.getElementById('ph-msgs');
    msgs.innerHTML='';
    const narDiv=document.createElement('div');narDiv.className='mb mb-nar';
    narDiv.textContent='Indkommende gruppeopkald...';
    msgs.appendChild(narDiv);
    ov.classList.add('active');
    screenShake(4,200);bigTextFlash('📞 OPKALD!','#3b82f6');
    function advLore(){
        if(lineIdx>=callData.lines.length){
            ov.classList.remove('active');
            document.getElementById('ph-next').onclick=advPh;
            return;
        }
        const line=callData.lines[lineIdx];
        const d=document.createElement('div');
        d.className='mb mb-in';
        d.textContent=line.who+': '+line.text;
        msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;S.click();lineIdx++;
    }
    document.getElementById('ph-next').onclick=advLore;
    advLore();
}
let eventMarker=null;
function spawnEventMarker(){
    if(G.eventDoneToday||Math.random()>.5)return;
    const spots=[{x:.25,y:.35},{x:.55,y:.55},{x:.15,y:.55},{x:.60,y:.30},{x:.35,y:.25},{x:.45,y:.60},{x:.30,y:.70},{x:.20,y:.48}];
    const s=spots[Math.floor(Math.random()*spots.length)];
    eventMarker={x:s.x,y:s.y,t:Date.now(),id:'event_marker'};
}
function flushPendingDay(){if(pendingNewDay){pendingNewDay=false;bodegaUsedToday=false;G.wheelUsedToday=false;G.eventDoneToday=false;G.kirkePrayedToday=false;G.gydenUsedToday=false;eventMarker=null;gamblesToday=0;foodBoughtToday=0;if(G.buffDays>0){G.buffDays--;if(G.buffDays<=0)G.buff=null;}stockPrices.hanzi=Math.max(10,stockPrices.hanzi+Math.floor((Math.random()-.45)*30));stockPrices.tbh=Math.max(5,stockPrices.tbh+Math.floor((Math.random()-.45)*20));stockPrices.leth=Math.max(8,stockPrices.leth+Math.floor((Math.random()-.45)*25));spawnEventMarker();showDayFlash();if(G.daysLeft===0){pendingForceClub=true;}else{pendingWheel=true;}const lc=loreCalls.find(c=>c.day===G.day);if(lc){pendingLore=lc;}}}
function closeOv(){document.querySelectorAll('.ov,.wheel-ov,.event-ov').forEach(o=>o.classList.remove('active'));G.scene='map';Mus.play('map');updHUD();flushPendingDay();flushPendingEvents();}
function flushPendingEvents(){if(G.scene!=='map')return;if(pendingForceClub){pendingForceClub=false;setTimeout(forceClub,800);return;}if(pendingWheel){pendingWheel=false;setTimeout(()=>openWheel(),800);}if(pendingLore){const l=pendingLore;pendingLore=null;setTimeout(()=>showLoreCall(l),2000);}}

// ===== FORCE CLUB =====
function forceClub(){
    if(G.scene==='combat'){msg('⚠️ KLUBBEN VENTER! Færdiggør din kamp først! 🪩');return;}
    msg('⚠️ KLUBBEN ER ÅBEN! DU SKAL DERUD! 🪩');
    setTimeout(()=>{
        if(G.scene==='combat')return;
        if(G.scene==='map'){goClub();}
        else{document.querySelectorAll('.ov').forEach(o=>o.classList.remove('active'));G.scene='map';setTimeout(()=>goClub(),500);}
    },1500);
}
// ===== LETH BRIEFING + CLUB =====
let briefStep=0,briefGirl=null;
function goClub(){
    if(G.scene==='combat'||G.scene==='brief'||G.scene==='victory')return;
    document.querySelectorAll('.ov').forEach(o=>o.classList.remove('active'));
    G.scene='brief';
    const rg=girlsByRound[Math.min(G.round-1,girlsByRound.length-1)];
    briefGirl=makeScaledGirl(rg[Math.floor(Math.random()*rg.length)]);
    briefStep=0;
    document.getElementById('brief-girl').style.display='none';
    document.getElementById('brief-ov').classList.add('active');
    drawBriefLeth();advBrief();
}
function drawBriefLeth(){
    const c=document.getElementById('brief-cv'),x=c.getContext('2d'),W=c.width,H=c.height;
    x.fillStyle='#0a0a12';x.fillRect(0,0,W,H);
    const lImg=charImgs.leth;
    if(lImg&&lImg.complete&&lImg.naturalWidth>0){
        const sz=Math.min(W*.5,H*.6);
        x.drawImage(lImg,W/2-sz/2,H*.15,sz,sz*1.2);
    }else{
        const t=Date.now()*.001,cx2=W/2,cy=H*.55;
        x.fillStyle='#dc2626';x.fillRect(cx2-30,cy-10,60,50);
        x.fillStyle='#c68642';x.fillRect(cx2-44,cy-6,16,35);x.fillRect(cx2+28,cy-6,16,35);
        x.fillStyle='#c68642';x.fillRect(cx2-8,cy-22,16,14);
        x.fillStyle='#c68642';x.beginPath();x.arc(cx2,cy-34,22,0,Math.PI*2);x.fill();
        x.fillStyle='#222';x.beginPath();x.arc(cx2,cy-44,22,Math.PI,.02);x.fill();
        x.fillStyle='#fff';x.fillRect(cx2-10,cy-38,7,6);x.fillRect(cx2+3,cy-38,7,6);
        x.fillStyle='#111';x.fillRect(cx2-8,cy-37,4,5);x.fillRect(cx2+5,cy-37,4,5);
        x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(cx2,cy-26,8,0,Math.PI);x.stroke();
    }
    x.font="bold 10px 'Press Start 2P'";x.textAlign='center';x.fillStyle='#00d4aa';x.fillText('LETH 💪',W/2,H-8);
}
const briefScript=[
    ()=>{setBrief('Leth 💪','Yo bror! Tiden er inde. Klubben venter! 🪩');},
    ()=>{const pool=G.round>=7?lethLoreWeek7:lethLore;setBrief('Leth 💪',pool[Math.floor(Math.random()*pool.length)].replace('Leth: "','').replace('"',''));},
    ()=>{const rec=[[6,6,80],[12,12,110],[18,18,140],[25,24,170],[32,30,200],[40,37,235],[48,44,270]];const r=Math.min(G.round,7)-1;const s=rec[r];setBrief('Leth 💪','Lad mig hjælpe dig med at blive klar...\n\n📊 ANBEFALET: STR '+s[0]+' / CRD '+s[1]+' / HP '+s[2]+'\nDu har: STR '+G.styrke+' / CRD '+G.cardio+' / HP '+G.maxHP);},
    ()=>{
        document.getElementById('brief-ov').classList.remove('active');
        playVid('video/club.mp4',()=>{
            document.getElementById('brief-ov').classList.add('active');
            advBrief();
        });
    },
    ()=>{drawBriefLeth();const pool=G.round>=7?lethLoreWeek7:lethLore;const l2=pool[Math.floor(Math.random()*pool.length)].replace('Leth: "','').replace('"','');setBrief('Leth 💪',l2);},
    ()=>{drawBriefLeth();setBrief('Leth 💪','NU er du klar til byen! Du ser SKARP ud! 🔥');},
    ()=>{
        // Show girl info
        const g=briefGirl;
        setBrief('Leth 💪',`Scor hende her i aften. Held og lykke, bror!`);
        document.getElementById('brief-girl').style.display='block';
        const gImg=getGirlImg(g);
        if(gImg&&gImg.complete&&gImg.naturalWidth>0){
            document.getElementById('bg-icon').innerHTML='<img src="'+gImg.src+'" style="width:48px;height:auto;image-rendering:pixelated">';
        }else{document.getElementById('bg-icon').textContent=g.icon;}
        document.getElementById('bg-name').textContent=g.name;
        document.getElementById('bg-rating').textContent='⭐'.repeat(Math.ceil(g.rating/2))+' '+g.rating+'/10';
        document.getElementById('bg-stats').innerHTML=
            `❤️ HP: ${g.hp||girlScaleHP(g.rating)} | ⚔️ ATK: ${g.atk||girlScaleATK(g.rating)}\n`+
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
    G.scene='rest_anim';Mus.stop();S.sleep();
    const ov=document.createElement('div');ov.id='rest-anim-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#02020a;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    const cv2=document.createElement('canvas');cv2.width=300;cv2.height=200;cv2.style.cssText='border:1px solid rgba(255,255,255,.05);border-radius:8px;margin-bottom:16px;';
    const txt=document.createElement('div');txt.className='pix';txt.style.cssText='color:#3b82f6;font-size:clamp(7px,2vw,12px);';txt.textContent='Sover... 💤';
    ov.appendChild(cv2);ov.appendChild(txt);document.body.appendChild(ov);
    const x2=cv2.getContext('2d'),W=cv2.width,H=cv2.height;
    const sleepQuotes=[['Zzz...','💤 Drømmer om piger...','Snorker...','Godt sovet! 😴'],['Zzz...','💤 Drømmer om kebab...','Mumler i søvne...','*alarm!* 😴'],['Zzz...','💤 Drømmer om gains...','Taler i søvne: "mere protein..."','Vågen! 😴'],['Zzz...','💤 Nightmare: Leth i speedos...','AAAH!','...okay ny dag. 😴']];
    const phrases=sleepQuotes[Math.floor(Math.random()*sleepQuotes.length)];
    let frame=0,phIdx=0,zParts=[];
    const anim=()=>{
        frame++;x2.clearRect(0,0,W,H);
        x2.fillStyle='#050510';x2.fillRect(0,0,W,H);
        const dark=Math.min(1,frame/60)*.3;
        x2.fillStyle=`rgba(20,20,60,${dark})`;x2.fillRect(0,0,W,H);
        x2.fillStyle='#1a1a30';x2.fillRect(W*.2,H*.55,W*.6,H*.3);
        x2.fillStyle='#2a2a50';x2.fillRect(W*.22,H*.55,W*.56,8);
        x2.fillStyle='#4a4a70';x2.fillRect(W*.6,H*.45,W*.15,H*.12);
        const bob=Math.sin(frame*.03)*2;
        x2.fillStyle='#c68642';x2.beginPath();x2.arc(W*.55,H*.58+bob,8,0,Math.PI*2);x2.fill();
        x2.fillStyle='#475569';x2.fillRect(W*.45,H*.62+bob,20,12);
        x2.fillStyle='#111';x2.lineWidth=2;
        x2.beginPath();x2.moveTo(W*.52,H*.56+bob);x2.lineTo(W*.58,H*.56+bob);x2.stroke();
        if(frame%30===0)zParts.push({x:W*.58,y:H*.5,sz:8,a:1});
        zParts=zParts.filter(z=>{z.y-=.5;z.x+=.3;z.a-=.01;z.sz+=.1;
            x2.font=`bold ${Math.floor(z.sz)}px 'Press Start 2P'`;x2.textAlign='center';x2.fillStyle=`rgba(59,130,246,${z.a})`;x2.fillText('Z',z.x,z.y);
            return z.a>0;});
        const moonGlow=.6+Math.sin(frame*.02)*.2;
        x2.fillStyle=`rgba(255,255,200,${moonGlow})`;x2.beginPath();x2.arc(W*.85,H*.15,12,0,Math.PI*2);x2.fill();
        x2.fillStyle='#050510';x2.beginPath();x2.arc(W*.88,H*.13,10,0,Math.PI*2);x2.fill();
        for(let i=0;i<5;i++){const sx=30+i*60,sy=15+Math.sin(frame*.01+i)*8;x2.fillStyle=`rgba(255,255,255,${.3+Math.sin(frame*.02+i)*.2})`;x2.fillRect(sx,sy,2,2);}
        const prog=Math.min(1,frame/180);
        x2.fillStyle='rgba(255,255,255,.1)';x2.fillRect(30,H-20,W-60,8);
        x2.fillStyle='#3b82f6';x2.fillRect(30,H-20,(W-60)*prog,8);
        x2.font="bold 7px 'Press Start 2P'";x2.textAlign='center';x2.fillStyle='#3b82f6';x2.fillText(Math.floor(prog*100)+'%',W/2,H-24);
        if(frame%60===0&&phIdx<phrases.length){txt.textContent=phrases[phIdx];phIdx++;}
        if(frame<180){requestAnimationFrame(anim);}
        else{
            G.hour=24;advTime(0);G.hunger=Math.min(G.maxHunger,G.hunger+30);
            if(G.currentHP<0)G.currentHP=1;
            const hpHeal=Math.min(Math.floor(G.maxHP*.4),G.maxHP-G.currentHP);
            G.currentHP=Math.min(G.maxHP,G.currentHP+hpHeal);
            S.heal();float('+'+hpHeal+' HP (40%)','#00d4aa');float('+30 SULT','#ff006e');float('NY DAG!','#3b82f6');
            txt.textContent='Udhvilet! +'+hpHeal+' HP, +30 sult · Ny dag! 🏠';txt.style.color='#00d4aa';
            msg('Sov hele natten. +'+hpHeal+' HP, +30 sult! Ny dag! 🏠');
            setTimeout(()=>{ov.remove();G.scene='map';Mus.play('map');updHUD();flushPendingDay();flushPendingEvents();},1500);
        }
    };
    anim();
}

// ===== HUD =====
function updHUD(){
    const h=document.getElementById('hud');h.className='show';
    const hp=G.currentHP<0?G.maxHP:G.currentHP;
    h.innerHTML=`<div class="hr"><div class="hl">
        <div class="hb"><span class="l" style="color:#ff006e">HP</span><div class="t"><div class="f" style="width:${hp/G.maxHP*100}%;background:#ff006e${hp/G.maxHP<.25?';animation:hpPulse .5s infinite':''}"></div></div><span class="v"${hp/G.maxHP<.25?' style="color:#ff006e;animation:hpPulse .5s infinite"':''}>${hp}/${G.maxHP}</span></div>
        <div class="hb"><span class="l" style="color:#ff6b35">SULT</span><div class="t"><div class="f" style="width:${G.hunger/G.maxHunger*100}%;background:#ff6b35"></div></div><span class="v">${G.hunger}</span></div>
        <div class="hstats">
            <div class="hs"><span class="si">⚔️</span><span class="sl">STR</span><span class="sv" style="color:#ff006e">${G.styrke}</span></div>
            <div class="hs"><span class="si">❤️</span><span class="sl">CRD</span><span class="sv" style="color:#ff4d8d">${G.cardio}</span></div>
            <div class="hs"><span class="si">💬</span><span class="sl">TLK</span><span class="sv" style="color:#3b82f6">${G.smalltalk}</span></div>
            <div class="hs"><span class="si">🛡️</span><span class="sl">REF</span><span class="sv" style="color:#00d4aa">${G.reflex}</span></div>
            <div class="hs"><span class="si">🌟</span><span class="sl">CHR</span><span class="sv" style="color:#ffbe0b">${G.charmPts}</span></div>
            <div class="hs"><span class="si">🎯</span><span class="sl">CRT</span><span class="sv" style="color:#ffbe0b">${G.critChance}%</span></div>
            <div class="hs"><span class="si">💚</span><span class="sl">REG</span><span class="sv" style="color:#00d4aa">${G.regenAmt}</span></div>
        </div></div><div class="hright">
        <div class="ck">${String(G.hour).padStart(2,'0')}:00</div>
        <div class="dy">DAG ${G.day} ${G.daysLeft>0?'(KLUB: '+G.daysLeft+'D)':'⚠️ KLUB NU!'}</div>
        <div class="mn">${G.money} KR</div>
    </div></div>`;
    // Settings gear
    if(!document.getElementById('settings-btn')){
        const sb=document.createElement('div');sb.id='settings-btn';sb.textContent='⚙️';
        sb.style.cssText='position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:15;font-size:1.3rem;cursor:pointer;background:rgba(0,0,0,.5);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;';
        sb.onclick=openSettings;document.body.appendChild(sb);
    }
    // Music icon bottom right
    if(!document.getElementById('music-btn')){
        const mb=document.createElement('div');mb.id='music-btn';
        mb.style.cssText='position:fixed;bottom:12px;right:12px;z-index:15;font-size:1.5rem;cursor:pointer;background:rgba(0,0,0,.6);border:1px solid rgba(255,190,11,.3);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;';
        mb.textContent=Mus.cur?'🎵':'🔇';
        mb.onclick=()=>{if(Mus.cur){Mus.stop();mb.textContent='🔇';}else{Mus.play('map');mb.textContent='🎵';}};
        document.body.appendChild(mb);
    }else{document.getElementById('music-btn').textContent=Mus.cur?'🎵':'🔇';}
    // Phone icon bottom left
    if(!document.getElementById('phone-btn')){
        const pb=document.createElement('div');pb.id='phone-btn';
        pb.style.cssText='position:fixed;bottom:12px;left:12px;z-index:15;font-size:1.5rem;cursor:pointer;background:rgba(0,0,0,.6);border:1px solid rgba(59,130,246,.3);border-radius:12px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;';
        pb.textContent='📱';
        pb.onclick=()=>{if(G.scene==='map')openPhoneApps();};
        document.body.appendChild(pb);
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
    const gImg=charImgs.Gulle;
    if(gImg&&gImg.complete&&gImg.naturalWidth>0){const sz=Math.min(40,W*.12);x.drawImage(gImg,W*.75-sz/2,H*.55,sz,sz*1.3);}
    else drawNPC(x,W*.75,H*.75,'gulle',t);
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
    const rImg=charImgs.ritardo;
    if(rImg&&rImg.complete&&rImg.naturalWidth>0){const sz=Math.min(40,W*.12);x.drawImage(rImg,W*.5-sz/2,H*.55,sz,sz*1.3);}
    else drawNPC(x,W*.5,H*.75,'ritardo',t);
}

// ===== GYM =====
const gymUpgradeCost=[0, 300, 600, 1200, 2500];
const exercises=[
    {id:'str',name:'STYRKE',icon:'🏋️',desc:'⚔️ +Skade',stat:'styrke',game:'mash',reqGym:1},
    {id:'crd',name:'CARDIO',icon:'🏃',desc:'❤️ +Max HP',stat:'cardio',game:'runner',reqGym:1},
    {id:'tlk',name:'SMALL TALK',icon:'💬',desc:'💬 +Max Mana',stat:'smalltalk',game:'memory',reqGym:1},
    {id:'ref',name:'REFLEX',icon:'🛡️',desc:'🛡️ +Block/Hit',stat:'reflex',game:'reaction',reqGym:2},
    {id:'crit',name:'CRIT CHANCE',icon:'🎯',desc:'🎯 +Crit%',stat:'critLvl',game:'precision',reqGym:3},
    {id:'critd',name:'CRIT SKADE',icon:'💥',desc:'💥 +Crit Dmg',stat:'critDmgLvl',game:'powerslam',reqGym:4},
    {id:'regen',name:'HP REGEN',icon:'💚',desc:'💚 +Heal/tur',stat:'regenLvl',game:'breathe',reqGym:3},
];
const gymJokes=[
    'Leth: "Ingen smerte, ingen gains! ...okay måske LIDT smerte." 💪',
    'Du ser dig selv i spejlet. Gains? Hmm... snart. 🪞',
    'En fyr løfter dobbelt så meget som dig. Med ÉN arm. 😤',
    'Leth: "PUSH! PUSH! ...nej ikke push-up, push DIG SELV!" 🗣️',
    'Du glemte håndklæde. Sveden rammer bænken. Alle kigger. 💦',
    'Nogen grunter SÅ højt at vinduerne ryster. Det er Leth. 🔊',
    'Leth: "Da JEG var på din alder... okay vi var lige stærke." 😂',
    'Du prøver at tage en gym-selfie. Dropper telefonen. På foden. 📱🦶',
    'Nogen hoger maskinen du ville bruge. I 45 minutter. Til selfies. 🤳',
    'Leth: "Protein shake EFTER træning! Du drikker den UNDER?!" 🥤',
    'Du laver øjenkontakt med dig selv i spejlet. Awkward. 👀',
    'En gammel dame løfter mere end dig. Respekt. 👵💪',
];
function openGym(){
    G.scene='gym';Mus.play('gym');sceneFlash('#ff006e');drawGymBg();maybeJoke(gymJokes);
    document.getElementById('gym-sub').textContent=`Leth: "GYM LVL ${G.gymLvl}!" | Sult: ${G.hunger} | Koster: 30 sult, 6t`;
    const g=document.getElementById('gym-g');g.innerHTML='';
    exercises.forEach(ex=>{
        const locked=G.gymLvl<ex.reqGym;
        const c=document.createElement('div');c.className='gym-c'+(locked?' dis':'');
        if(locked){
            c.innerHTML=`<div class="gi">🔒</div><div class="gn">${ex.name}</div><div class="gd">Kræver GYM LVL ${ex.reqGym}</div><div class="gl">LÅST</div>`;
            c.style.opacity='.4';
        }else{
            c.innerHTML=`<div class="gi">${ex.icon}</div><div class="gn">${ex.name}</div><div class="gd">${ex.desc}</div><div class="gl">${G[ex.stat]} pts</div>`;
            c.onclick=()=>{if(G.hunger<30){msg('For sulten! Kræver 30 sult.');return;}G.hunger-=30;advTime(6);startTrain(ex);};
        }
        g.appendChild(c);
    });
    // Gym upgrade
    if(G.gymLvl < 5){
        const cost = gymUpgradeCost[G.gymLvl];
        const u = document.createElement('div');u.className='gym-c';
        u.style.borderColor='rgba(255,190,11,.4)';
        u.innerHTML=`<div class="gi">⬆️</div><div class="gn">OPGRADER GYM</div><div class="gd">LVL ${G.gymLvl+1} · Mere gain</div><div class="gl">${cost} KR</div>`;
        u.onclick=()=>{if(G.money<cost){msg('Ikke nok penge!');S.bad();return;}G.money-=cost;G.gymLvl++;S.perf();float('GYM LVL '+G.gymLvl+'!','#ffbe0b');bigTextFlash('GYM LVL '+G.gymLvl+'!','#ffbe0b');screenShake(6,300);sparkleEffect(innerWidth/2,innerHeight/2,'#ffbe0b');openGym();updHUD();};
        g.appendChild(u);
    }
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
    tState={ex,score:0,phase:'go',done:false};
    switch(ex.game){
        case'mash':trainMash(tc);break;
        case'runner':trainRunner(tc);break;
        case'memory':trainMemory(tc);break;
        case'reaction':trainReaction(tc);break;
        case'precision':trainPrecision(tc);break;
        case'powerslam':trainPowerslam(tc);break;
        case'breathe':trainBreathe(tc);break;
    }
}

function endTrain(){
    cancelAnimationFrame(tAF);tState.done=true;
    const ex=tState.ex,sc=tState.score;
    const gymGains=[
        [1,2,3,4],
        [2,3,4,6],
        [3,4,6,8],
        [4,6,8,10]
    ];
    const gLevel=Math.min(G.gymLvl,gymGains.length-1);
    let grade;
    if(sc>=10){grade=3;}
    else if(sc>=6){grade=2;}
    else if(sc>=3){grade=1;}
    else{grade=0;}
    let gain=gymGains[gLevel][grade];
    if(G.lossBuff){gain=Math.ceil(gain*1.2);}
    G[ex.stat]+=gain;G.charmPts+=1;G.charmTotal+=1;
    float('+'+gain+' '+ex.name,'#ffbe0b');
    let gr,gc;
    if(grade===3){gr='LEGENDARISK!';gc='#ff006e';S.perf();bigTextFlash('LEGENDARISK!','#ff006e');screenShake(8,400);sparkleEffect(innerWidth/2,innerHeight/2,'#ff006e');}
    else if(grade===2){gr='GODT!';gc='#00d4aa';S.ok();sparkleEffect(innerWidth/2,innerHeight/2,'#00d4aa');}
    else if(grade===1){gr='OK';gc='#ff6b35';S.click();}
    else{gr='SVAGT...';gc='#888';S.bad();}
    maybeJoke(trainJokes);
    document.getElementById('ti').textContent='';
    const statLine=ex.stat==='critLvl'?'CRIT:'+G.critChance+'%':ex.stat==='critDmgLvl'?'CRIT DMG:'+G.critDmg+'%':ex.stat==='regenLvl'?'REGEN:'+G.regenAmt+'/tur':'DMG:'+G.dmg+' HP:'+G.maxHP+' MP:'+G.maxMP+' BLK:'+G.blockChance+'%';
    document.getElementById('tr').innerHTML=`<div style="text-align:center;margin-top:10px"><div class="pix" style="font-size:clamp(9px,2.5vw,14px);color:${gc};margin-bottom:5px">${gr}</div><div class="pix" style="font-size:clamp(5px,1.2vw,8px);color:#ffbe0b;margin-bottom:3px">+${gain} ${ex.stat.toUpperCase()} (Score: ${sc})</div><div class="pix" style="font-size:clamp(3px,.8vw,5px);color:#888;margin-bottom:10px">${statLine}</div><button class="btn btn-s" onclick="document.getElementById('train-ov').classList.remove('active');openGym();updHUD();">VIDERE</button></div>`;
}

// GAME 1: BUTTON MASH (styrke)
function trainMash(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    let count=0,timeLeft=3.5,started=false,lastT=Date.now();
    document.getElementById('ti').textContent='TAP SÅ HURTIGT DU KAN! 💪';
    const tap=(e)=>{if(tState.done)return;if(e&&e.repeat)return;if(!started){started=true;lastT=Date.now();}count++;tState.score=Math.floor(count/10);S.click();};
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);document.addEventListener('keydown',tap);
    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);document.removeEventListener('keydown',tap);return;}
        if(started){timeLeft=3.5-(Date.now()-lastT)/1000;if(timeLeft<=0){tState.score=Math.floor(count/10);endTrain();return;}}
        x.clearRect(0,0,W,H);
        // Count
        x.font="bold 28px 'Press Start 2P'";x.textAlign='center';x.fillStyle='#fff';x.fillText(count,W/2,H*.32);
        x.font="10px 'Press Start 2P'";x.fillStyle='#ffbe0b';x.fillText(started?timeLeft.toFixed(1)+'s':'TAP FOR AT STARTE!',W/2,H*.58);
        // Animated fist
        const fs=count%2===0?1:.9;
        x.font=`${30*fs}px serif`;x.fillText('👊',W/2,H*.78);
        document.getElementById('ts').textContent='Score: '+count;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 2: CATCH HEARTS (cardio) - tap left/right to catch falling hearts
function trainRunner(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    let score=0,misses=0,lane=1,items=[],frame=0,spd=2.8,nextItem=32;
    const lanes=3,laneW=W/lanes,catchY=H-40,catchH=20;
    document.getElementById('ti').textContent='← → Fang hjerterne! Undgå 💀! ❤️';
    const onKey=(e)=>{if(tState.done||e.repeat)return;
        if(e.key==='ArrowLeft'||e.key==='a'){lane=Math.max(0,lane-1);S.click();}
        if(e.key==='ArrowRight'||e.key==='d'){lane=Math.min(lanes-1,lane+1);S.click();}};
    const onMouse=(e)=>{if(tState.done)return;
        const rect=tc.getBoundingClientRect();const mx=e.clientX-rect.left;
        lane=Math.min(lanes-1,Math.floor(mx/laneW));S.click();};
    const onTouch=(e)=>{if(tState.done)return;e.preventDefault();
        const rect=tc.getBoundingClientRect();const mx=e.touches[0].clientX-rect.left;
        lane=Math.min(lanes-1,Math.floor(mx/laneW));S.click();};
    document.addEventListener('keydown',onKey);
    tc.addEventListener('mousedown',onMouse);tc.addEventListener('touchstart',onTouch);
    (function draw(){
        if(tState.done){document.removeEventListener('keydown',onKey);tc.removeEventListener('mousedown',onMouse);tc.removeEventListener('touchstart',onTouch);return;}
        frame++;
        x.clearRect(0,0,W,H);
        x.fillStyle='#0a0818';x.fillRect(0,0,W,H);
        for(let i=1;i<lanes;i++){x.strokeStyle='rgba(255,255,255,.08)';x.beginPath();x.moveTo(i*laneW,0);x.lineTo(i*laneW,H);x.stroke();}
        x.fillStyle='rgba(255,0,110,.15)';x.fillRect(lane*laneW+4,catchY,laneW-8,catchH);
        x.font='16px serif';x.textAlign='center';x.fillText('🏃',lane*laneW+laneW/2,catchY+16);
        if(frame>=nextItem){
            const il=Math.floor(Math.random()*lanes);
            const bad=Math.random()<.33;
            items.push({lane:il,y:-20,bad,emoji:bad?'💀':'❤️',color:bad?'#8b5cf6':'#ff006e'});
            nextItem=frame+Math.max(16,42-Math.floor(score/3)*2);
        }
        items.forEach(it=>{
            it.y+=spd;
            x.font='18px serif';x.textAlign='center';x.fillText(it.emoji,it.lane*laneW+laneW/2,it.y);
            if(!it.done&&it.y>=catchY-5&&it.y<=catchY+catchH+5){
                if(it.lane===lane){
                    it.done=true;
                    if(it.bad){misses+=3;S.bad();x.fillStyle='rgba(139,92,246,.3)';x.fillRect(0,0,W,H);}
                    else{score++;tState.score=score;S.ok();if(score%7===0)spd=Math.min(5,spd+.3);}
                }
            }
            if(!it.done&&it.y>H){it.done=true;if(!it.bad)misses++;}
        });
        items=items.filter(it=>!it.done);
        if(misses>=5){tState.score=score;endTrain();return;}
        x.font="bold 9px 'Press Start 2P'";x.textAlign='right';x.fillStyle='#00d4aa';x.fillText('SCORE: '+score,W-8,16);
        x.textAlign='left';x.fillStyle='#ff006e';x.fillText('MISS: '+misses+'/5',8,16);
        document.getElementById('ts').textContent='Score: '+score;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 3: MEMORY SEQUENCE (small talk)
function trainMemory(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
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
        x.font="bold 8px 'Press Start 2P'";x.textAlign='center';x.fillStyle='#888';x.fillText('RUNDE '+round,W/2,20);
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
                setTimeout(()=>nextRound(),600);}
        } else{wrong=true;S.bad();tState.score=Math.max(0,round-1);setTimeout(endTrain,600);}
    };
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);

    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);return;}
        if(showPhase){const now=Date.now();const showDelay=Math.max(300,500-round*25);
            if(now-lastShow>showDelay){drawBtns(seq[showIdx]);lastShow=now;showIdx++;
                if(showIdx>seq.length){showPhase=false;canTap=true;drawBtns(-1);document.getElementById('ti').textContent='Din tur! Gentag sekvensen! 👆';}
            } else if(now-lastShow>showDelay*.65){drawBtns(-1);}
        }
        document.getElementById('ts').textContent='Score: '+round;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 4: REACTION (reflex)
function trainReaction(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    let targets=[],score=0,spawnT=0,misses=0;
    document.getElementById('ti').textContent='TAP cirklerne hurtigt! 3 misses = slut ⚡';

    function getSpawnInterval(){return Math.max(220, 650 - score * 35);}
    function getTargetLifetime(){return Math.max(500, 1400 - score * 80);}

    function spawn(){targets.push({x:30+Math.random()*(W-60),y:30+Math.random()*(H-60),r:18,life:1,born:Date.now()});}

    const tap=e=>{if(tState.done)return;
        const rect=tc.getBoundingClientRect();
        const mx=((e.clientX||e.touches[0].clientX)-rect.left)*(tc.width/rect.width);
        const my=((e.clientY||e.touches[0].clientY)-rect.top)*(tc.height/rect.height);
        for(let i=targets.length-1;i>=0;i--){
            if(Math.hypot(mx-targets[i].x,my-targets[i].y)<targets[i].r+5){
                targets.splice(i,1);score++;tState.score=score;S.click();float('HIT!','#00d4aa');
                break;
            }
        }
    };
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);

    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);return;}
        x.clearRect(0,0,W,H);
        const now=Date.now();if(now-spawnT>getSpawnInterval()){spawn();spawnT=now;}
        const lifetime=getTargetLifetime();
        targets=targets.filter(t=>{
            t.life=1-Math.min(1,(now-t.born)/lifetime);
            if(t.life<=0){S.bad();misses++;
                if(misses>=3){tState.score=score;setTimeout(endTrain,300);return false;}
                return false;}
            x.globalAlpha=t.life;x.fillStyle='#ff006e';x.shadowColor='#ff006e';x.shadowBlur=8;
            x.beginPath();x.arc(t.x,t.y,t.r*t.life,0,Math.PI*2);x.fill();
            x.fillStyle='#fff';x.font='12px serif';x.textAlign='center';x.fillText('🎯',t.x,t.y+4);
            x.shadowBlur=0;x.globalAlpha=1;return true;
        });
        x.font="bold 9px 'Press Start 2P'";x.textAlign='right';x.fillStyle='#ffbe0b';x.fillText('Score: '+score,W-8,16);
        x.fillStyle='#ff006e';x.fillText('Miss: '+misses+'/3',W-8,30);
        document.getElementById('ts').textContent='Score: '+score;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 5: PRECISION (crit chance) - Hit bullseyes, shrinking targets
function trainPrecision(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    let score=0,misses=0,round=0,target=null,startTime=0;
    document.getElementById('ti').textContent='Ram centrum! 🎯 3 miss = slut';
    function spawnTarget(){
        round++;
        const sz=Math.max(8,30-round*2);
        const inner=Math.max(3,sz*.22);
        target={x:30+Math.random()*(W-60),y:40+Math.random()*(H-80),r:sz,inner:inner,born:Date.now(),life:Math.max(700,2200-round*150)};
    }
    spawnTarget();
    const tap=e=>{if(tState.done||!target)return;
        const rect=tc.getBoundingClientRect();
        const mx=((e.clientX||e.touches[0].clientX)-rect.left)*(tc.width/rect.width);
        const my=((e.clientY||e.touches[0].clientY)-rect.top)*(tc.height/rect.height);
        const dist=Math.hypot(mx-target.x,my-target.y);
        if(dist<target.r){
            if(dist<target.inner){score+=2;S.perf();float('BULLSEYE! +2','#ffbe0b');}
            else{score++;S.click();float('+1','#00d4aa');}
            tState.score=score;spawnTarget();
        } else{misses++;S.bad();if(misses>=3){tState.score=score;endTrain();}}
    };
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);
    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);return;}
        x.clearRect(0,0,W,H);
        if(target){
            const elapsed=Date.now()-target.born;
            const life=1-elapsed/target.life;
            if(life<=0){misses++;S.bad();if(misses>=3){tState.score=score;endTrain();return;}spawnTarget();}
            else{
                x.globalAlpha=.2+life*.8;
                x.strokeStyle='#ff006e';x.lineWidth=2;x.beginPath();x.arc(target.x,target.y,target.r,0,Math.PI*2);x.stroke();
                x.strokeStyle='#ffbe0b';x.beginPath();x.arc(target.x,target.y,target.r*.6,0,Math.PI*2);x.stroke();
                x.fillStyle='#ff006e';x.beginPath();x.arc(target.x,target.y,target.inner,0,Math.PI*2);x.fill();
                x.globalAlpha=1;
                x.fillStyle='rgba(255,255,255,.1)';x.fillRect(target.x-target.r,target.y+target.r+4,target.r*2*life,3);
            }
        }
        x.font="bold 9px 'Press Start 2P'";x.textAlign='right';x.fillStyle='#ffbe0b';x.fillText('Score: '+score,W-8,16);
        x.fillStyle='#ff006e';x.fillText('Miss: '+misses+'/3',W-8,30);
        x.fillStyle='#888';x.fillText('Runde: '+round,W-8,44);
        document.getElementById('ts').textContent='Score: '+score;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 6: POWERSLAM (crit damage) - Timing bar, stop at peak for max score
function trainPowerslam(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    let score=0,round=0,phase='charging',barPos=0,barSpd=0.035,barDir=1,sweetSpot=.12,hitZone=.85;
    document.getElementById('ti').textContent='Stop baren i den røde zone! 💥';
    function nextRound(){
        round++;phase='charging';barPos=0;barDir=1;
        barSpd=0.038+round*0.007;
        sweetSpot=Math.max(0.035,0.10-round*0.01);
        hitZone=0.85;
    }
    nextRound();
    const tap=(e)=>{if(tState.done||phase!=='charging')return;if(e&&e.repeat)return;
        S.click();phase='hit';
        const dist=Math.abs(barPos-hitZone);
        if(dist<sweetSpot){score+=3;S.perf();float('PERFEKT! +3','#ffbe0b');}
        else if(dist<sweetSpot*2.5){score+=2;S.ok();float('GODT! +2','#00d4aa');}
        else if(dist<sweetSpot*4){score+=1;S.click();float('+1','#ff6b35');}
        else{S.bad();float('MISS!','#ff006e');tState.score=score;setTimeout(endTrain,500);return;}
        tState.score=score;
        setTimeout(()=>{if(!tState.done)nextRound();},600);
    };
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);document.addEventListener('keydown',tap);
    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);document.removeEventListener('keydown',tap);return;}
        x.clearRect(0,0,W,H);
        if(phase==='charging'){
            barPos+=barSpd*barDir;
            if(barPos>=1){barDir=-1;barPos=1;}
            if(barPos<=0){barDir=1;barPos=0;}
        }
        const barY=H*.5,barH=30,barW=W*.8,barX=(W-barW)/2;
        x.fillStyle='rgba(255,255,255,.05)';x.fillRect(barX,barY,barW,barH);
        const zoneX=barX+hitZone*barW-sweetSpot*barW;
        const zoneW=sweetSpot*2*barW;
        x.fillStyle='rgba(255,0,110,.3)';x.fillRect(zoneX,barY,zoneW,barH);
        x.strokeStyle='#ff006e';x.lineWidth=2;x.strokeRect(zoneX,barY,zoneW,barH);
        const curX=barX+barPos*barW;
        x.fillStyle='#ffbe0b';x.fillRect(curX-2,barY-4,4,barH+8);
        x.shadowColor='#ffbe0b';x.shadowBlur=8;x.fillRect(curX-2,barY-4,4,barH+8);x.shadowBlur=0;
        x.font="bold 20px serif";x.textAlign='center';x.fillText('💥',W/2,barY-20);
        x.font="bold 9px 'Press Start 2P'";x.textAlign='right';x.fillStyle='#ffbe0b';x.fillText('Score: '+score,W-8,16);
        x.fillStyle='#888';x.fillText('Runde: '+round,W-8,30);
        x.font="bold 7px 'Press Start 2P'";x.textAlign='center';x.fillStyle='#aaa';x.fillText('TAP NÅR BAREN ER I ZONEN!',W/2,barY+barH+20);
        document.getElementById('ts').textContent='Score: '+score;
        tAF=requestAnimationFrame(draw);
    })();
}

// GAME 7: BREATHE (regen) - Rhythm tapping, match the pulse
function trainBreathe(tc){
    const x=tc.getContext('2d'),W=tc.width,H=tc.height;
    let score=0,misses=0,round=0,pulsePhase=0,pulseSpd=0.045,lastPulseHit=0;
    document.getElementById('ti').textContent='Tap når cirklen pulserer! 💚 3 miss = slut';
    const tap=(e)=>{if(tState.done)return;if(e&&e.repeat)return;
        const pulse=Math.sin(pulsePhase);
        if(pulse>0.7){
            if(Date.now()-lastPulseHit<200)return;
            lastPulseHit=Date.now();
            score++;tState.score=score;S.ok();float('+1 💚','#00d4aa');
        } else if(pulse>0.3){
            score++;tState.score=score;S.click();float('+1','#ff6b35');lastPulseHit=Date.now();
        } else{
            misses++;S.bad();float('MISS!','#ff006e');
            if(misses>=3){tState.score=score;endTrain();return;}
        }
        round++;
        pulseSpd=0.045+round*0.004;
    };
    tc.addEventListener('mousedown',tap);tc.addEventListener('touchstart',tap);document.addEventListener('keydown',tap);
    (function draw(){if(tState.done){tc.removeEventListener('mousedown',tap);tc.removeEventListener('touchstart',tap);document.removeEventListener('keydown',tap);return;}
        pulsePhase+=pulseSpd;
        x.clearRect(0,0,W,H);
        const pulse=Math.sin(pulsePhase);
        const normPulse=(pulse+1)/2;
        const baseR=30,maxR=60;
        const r=baseR+normPulse*(maxR-baseR);
        const cx2=W/2,cy=H*.45;
        const isGood=pulse>0.7;
        const isOk=pulse>0.3;
        x.globalAlpha=.15;x.fillStyle='#00d4aa';x.beginPath();x.arc(cx2,cy,maxR+5,0,Math.PI*2);x.fill();
        x.globalAlpha=1;
        x.fillStyle=isGood?'#00d4aa':isOk?'#ff6b35':'rgba(255,255,255,.1)';
        x.shadowColor=isGood?'#00d4aa':'transparent';x.shadowBlur=isGood?20:0;
        x.beginPath();x.arc(cx2,cy,r,0,Math.PI*2);x.fill();
        x.shadowBlur=0;
        x.font="bold 20px serif";x.textAlign='center';x.fillText('💚',cx2,cy+6);
        if(isGood){x.font="bold 8px 'Press Start 2P'";x.fillStyle='#fff';x.fillText('TAP NU!',cx2,cy+maxR+20);}
        x.font="bold 9px 'Press Start 2P'";x.textAlign='right';x.fillStyle='#ffbe0b';x.fillText('Score: '+score,W-8,16);
        x.fillStyle='#ff006e';x.fillText('Miss: '+misses+'/3',W-8,30);
        document.getElementById('ts').textContent='Score: '+score;
        tAF=requestAnimationFrame(draw);
    })();
}

// ===== SHOP =====
const foodItems=[
    {name:'Kebab',icon:'🥙',price:40,hunger:30,buff:null,heal:0,buffDesc:'+30 sult'},
    {name:'Protein Shake',icon:'🥤',price:65,hunger:25,buff:'str',buffAmt:3,heal:0,buffDesc:'+25 sult, +3 STR'},
    {name:'Pizza',icon:'🍕',price:50,hunger:40,buff:null,heal:0,buffDesc:'+40 sult'},
    {name:'Energi Drik',icon:'⚡',price:45,hunger:10,buff:'ref',buffAmt:3,heal:0,buffDesc:'+10 sult, +3 REF'},
    {name:'Sushi',icon:'🍣',price:90,hunger:50,buff:'tlk',buffAmt:3,heal:0,buffDesc:'+50 sult, +3 TLK'},
    {name:'Steak',icon:'🥩',price:120,hunger:60,buff:'str',buffAmt:5,heal:0,buffDesc:'+60 sult, +5 STR'},
    {name:'Gulles Hjemmelavet Suppe',icon:'🍲',price:70,hunger:20,buff:null,heal:3,buffDesc:'+20 sult, +3 HP (eneste mad der healer!)'},
    {name:'Guldkaffe',icon:'☕',price:100,hunger:15,buff:'all',buffAmt:2,heal:0,buffDesc:'+15 sult, +2 ALL STATS'},
];
const gearItems=[
    {name:'Barbertrim',icon:'💈',price:50,stat:'reflex',amt:4,desc:'+4 REF'},
    {name:'Ny T-shirt',icon:'👕',price:80,stat:'cardio',amt:4,desc:'+4 CRD'},
    {name:'Fresh Sneakers',icon:'👟',price:120,stat:'reflex',amt:6,desc:'+6 REF'},
    {name:'Guld-kæde',icon:'⛓️',price:200,stat:'styrke',amt:6,desc:'+6 STR'},
    {name:'Solbriller',icon:'🕶️',price:180,stat:'smalltalk',amt:6,desc:'+6 TLK'},
    {name:'Designer Jakke',icon:'🧥',price:300,stat:'styrke',amt:8,desc:'+8 STR'},
    {name:'Diamant Ur',icon:'⌚',price:400,stat:'reflex',amt:10,desc:'+10 REF'},
    {name:'Parfume',icon:'🧴',price:250,stat:'smalltalk',amt:8,desc:'+8 TLK'},
    {name:'Læder Bukser',icon:'👖',price:350,stat:'cardio',amt:10,desc:'+10 CRD'},
    {name:'Tatovering',icon:'🖋️',price:500,stat:'all',amt:5,desc:'+5 ALLE STATS'},
];
const combatItems=[
    {name:'Cocktail',icon:'🍹',price:40,item:'drink',desc:'Stor skade i kamp'},
    {name:'Energy Shot',icon:'⚡',price:50,item:'energy',desc:'+12 MP i kamp'},
    {name:'Proteinbar',icon:'🍫',price:35,item:'heal',desc:'+15 HP i kamp'},
    {name:'Røgbombe',icon:'💨',price:60,item:'smoke',desc:'Skip fjendens tur + heal'},
    {name:'Steroider',icon:'💊',price:80,item:'steroid',desc:'+80% skade 4 ture'},
    {name:'Skjold Drik',icon:'🛡️',price:70,item:'shield',desc:'30% HP som skjold'},
    {name:'Adrenalin',icon:'💉',price:200,item:'adrenalin',desc:'+Full MP'},
];
let shopTab='food';let foodBoughtToday=0;const maxFoodPerDay=3;
const gulleGreetings=['Gulle: "AYYY min yndlings-kunde! 🥙"','Gulle: "Du ser sulten ud bror! Altid sulten!" 😂','Gulle: "Kebaben er FRISK... fra i går!" 🥙','Gulle: "Special tilbud! ...normal pris! HAHA!" 😂','Gulle: "Min kone siger jeg skal lukke kl 8. Det er kl 3. Shhh!" 🤫','Gulle: "Du ligner en der har brug for PROTEIN! Og kærlighed!" 💪','Gulle: "HANZI! Jeg har savnet dig! ...din pung mest." 💸','Gulle: "Prøv den nye sauce! Ingredienser? HEMMELIGT!" 🤐','Gulle: "Min kebab kurerer alt! Sorg, sult, tømmermænd!" 🏥','Gulle: "Velkommen til paradis! Altså... Gulles Grill." 😇','Gulle: "En stamkunde! DU betaler fuld pris!" 😂','Gulle: "Kebab-kongen byder dig velkommen!" 👑'];
function openShop(){G.scene='shop';Mus.play('shop');S.door();sceneFlash('#8b5cf6');advTime(1);drawShopBg();renderShop();document.getElementById('shop-ov').classList.add('active');maybeJoke(shopJokes);if(Math.random()<.5)setTimeout(()=>msg(gulleGreetings[Math.floor(Math.random()*gulleGreetings.length)]),500);}
function renderShop(){
    document.getElementById('shop-tabs').innerHTML=['food','gear','combat'].map(t=>`<button class="stab${shopTab===t?' act':''}" onclick="shopTab='${t}';renderShop()">${t==='food'?'🍕 MAD':t==='gear'?'👔 STYLE':'⚔️ KAMP'}</button>`).join('');
    const l=document.getElementById('shop-list');l.innerHTML='';
    const items=shopTab==='food'?foodItems:shopTab==='gear'?gearItems:combatItems;
    items.forEach((it,i)=>{
        const bk=shopTab==='gear'&&G.bought.includes('g'+i);
        const d=document.createElement('div');d.className='si'+(bk?' dis':'');
        const desc=shopTab==='food'?it.buffDesc:shopTab==='gear'?it.desc+' (permanent)':(it.desc||'');
        d.innerHTML=`<div class="si-l"><span class="si-i">${it.icon}</span><div><div class="si-n">${it.name}</div><div class="si-d">${desc}</div></div></div><div class="si-p">${bk?'KØBT':it.price+' KR'}</div>`;
        if(!bk)d.onclick=()=>{
            if(G.money<it.price){msg('Gulle: "Ingen penge, ingen drip!"');S.bad();return;}
            if(shopTab==='food'&&foodBoughtToday>=maxFoodPerDay){msg('Gulle: "Du har spist nok i dag bror!" 🍕');S.bad();return;}
            G.money-=it.price;S.coin();
            if(shopTab==='food'){foodBoughtToday++;
                G.hunger=Math.min(G.maxHunger,G.hunger+it.hunger);S.eat();float('+'+it.hunger+' SULT','#ff006e');
                if(it.heal&&it.heal>0){if(G.currentHP<0)G.currentHP=G.maxHP;G.currentHP=Math.min(G.maxHP,G.currentHP+it.heal);float('+'+it.heal+' HP','#00d4aa');}
                if(it.buff==='all'){G.styrke+=it.buffAmt;G.cardio+=it.buffAmt;G.smalltalk+=it.buffAmt;G.reflex+=it.buffAmt;float('+'+it.buffAmt+' ALL STATS!','#ffbe0b');sparkleEffect(innerWidth/2,innerHeight/2,'#ffbe0b');screenShake(4,200);msg(it.name+': +'+it.buffAmt+' til alle stats! (permanent)');}
                else if(it.buff==='str'){G.styrke+=it.buffAmt;float('+'+it.buffAmt+' STR','#ff006e');msg(it.name+': +'+it.buffAmt+' styrke! (permanent)');}
                else if(it.buff==='crd'){G.cardio+=it.buffAmt;float('+'+it.buffAmt+' CRD','#3b82f6');msg(it.name+': +'+it.buffAmt+' cardio! (permanent)');}
                else if(it.buff==='ref'){G.reflex+=it.buffAmt;float('+'+it.buffAmt+' REF','#00d4aa');msg(it.name+': +'+it.buffAmt+' reflex! (permanent)');}
                else if(it.buff==='tlk'){G.smalltalk+=it.buffAmt;float('+'+it.buffAmt+' TLK','#3b82f6');msg(it.name+': +'+it.buffAmt+' small talk! (permanent)');}
                else{msg('+'+it.hunger+' sult!'+(it.heal?(' +'+it.heal+' HP!'):''));}
            }
            else if(shopTab==='gear'){G.bought.push('g'+i);
                if(it.stat==='all'){G.styrke+=it.amt;G.cardio+=it.amt;G.smalltalk+=it.amt;G.reflex+=it.amt;float('+'+it.amt+' ALL','#ffbe0b');sparkleEffect(innerWidth/2,innerHeight/2,'#ffbe0b');screenShake(4,200);msg(it.name+': +'+it.amt+' alle stats! (permanent)');}
                else{const sn={styrke:'STR',cardio:'CRD',smalltalk:'TLK',reflex:'REF'};G[it.stat]+=it.amt;float('+'+it.amt+' '+sn[it.stat],'#ff006e');sparkleEffect(innerWidth/2,innerHeight/2,'#ff006e');msg(it.name+': '+it.desc+'! (permanent)');}}
            else{G.inv.push(it.item);float('+1 '+it.name,'#8b5cf6');}
            renderShop();updHUD();};
        l.appendChild(d);
    });
}

// ===== BRANCHING SKILL TREE =====
const skillTree={
    root:{id:'root',name:'Charm Basis',icon:'🌟',desc:'Start',cost:0,children:['combat','defense','social']},
    combat:{id:'combat',name:'Kampstil',icon:'⚔️',desc:'+6 STR',cost:2,effect:()=>{G.styrke+=6},children:['dmg1','crit']},
    defense:{id:'defense',name:'Forsvar',icon:'🛡️',desc:'+6 CRD',cost:2,effect:()=>{G.cardio+=6},children:['hp1','block1']},
    social:{id:'social',name:'Social',icon:'💬',desc:'+6 TLK',cost:2,effect:()=>{G.smalltalk+=6},children:['mp1','regen']},
    dmg1:{id:'dmg1',name:'Heavy Hits',icon:'💥',desc:'+10 STR',cost:4,effect:()=>{G.styrke+=10},children:['berserker']},
    crit:{id:'crit',name:'Crit Chance',icon:'🎯',desc:'+10 REF',cost:4,effect:()=>{G.reflex+=10},children:['berserker']},
    hp1:{id:'hp1',name:'Bulk Up',icon:'💖',desc:'+10 CRD',cost:4,effect:()=>{G.cardio+=10},children:['tank']},
    block1:{id:'block1',name:'Iron Guard',icon:'🧱',desc:'+10 REF',cost:4,effect:()=>{G.reflex+=10},children:['tank']},
    mp1:{id:'mp1',name:'Deep Talk',icon:'🗣️',desc:'+10 TLK',cost:4,effect:()=>{G.smalltalk+=10},children:['rizz']},
    regen:{id:'regen',name:'Recovery',icon:'💚',desc:'+8 CRD',cost:4,effect:()=>{G.cardio+=8},children:['rizz']},
    berserker:{id:'berserker',name:'BERSERKER',icon:'🔥',desc:'+15 STR',cost:8,effect:()=>{G.styrke+=15},children:['fury','deadshot']},
    tank:{id:'tank',name:'TANK',icon:'🏔️',desc:'+25 CRD +10 REF',cost:8,effect:()=>{G.cardio+=25;G.reflex+=10},children:['guardian','vampire']},
    rizz:{id:'rizz',name:'RIZZ MASTER',icon:'👑',desc:'+10 ALL stats!',cost:8,effect:()=>{G.styrke+=10;G.cardio+=10;G.smalltalk+=10;G.reflex+=10},children:['healer','hypno']},
    fury:{id:'fury',name:'FURY',icon:'💢',desc:'+12 STR → RAGE MODE',cost:6,effect:()=>{G.styrke+=12;const a=flexAbilities.find(x=>x.id==='rage');if(a)a.unlocked=true;},children:[]},
    deadshot:{id:'deadshot',name:'DEADSHOT',icon:'🔫',desc:'+12 REF → LASER FOCUS',cost:6,effect:()=>{G.reflex+=12;const a=flexAbilities.find(x=>x.id==='focus');if(a)a.unlocked=true;},children:[]},
    guardian:{id:'guardian',name:'GUARDIAN',icon:'🛡️',desc:'+12 CRD → SPEJLSKJOLD',cost:6,effect:()=>{G.cardio+=12;const a=flexAbilities.find(x=>x.id==='reflect');if(a)a.unlocked=true;},children:[]},
    vampire:{id:'vampire',name:'VAMPIRE',icon:'🧛',desc:'+8 ALL → SOUL DRAIN',cost:6,effect:()=>{G.styrke+=8;G.cardio+=8;G.smalltalk+=8;G.reflex+=8;const a=flexAbilities.find(x=>x.id==='drain');if(a)a.unlocked=true;},children:[]},
    healer:{id:'healer',name:'HEALER',icon:'💚',desc:'+12 CRD → HEALING',cost:6,effect:()=>{G.cardio+=12;const a=flexAbilities.find(x=>x.id==='heal');if(a)a.unlocked=true;},children:[]},
    hypno:{id:'hypno',name:'HYPNO',icon:'🌀',desc:'+12 TLK → CHARM BOMB',cost:6,effect:()=>{G.smalltalk+=12;const a=flexAbilities.find(x=>x.id==='charm_bomb');if(a)a.unlocked=true;},children:[]},
};

function canUnlock(id){
    if(id==='root')return!G.perks.root&&G.charmPts>=0;
    for(const k in skillTree){if(skillTree[k].children.includes(id)&&G.perks[k])return!G.perks[id]&&G.charmPts>=skillTree[id].cost;}
    return false;
}

function openTree(){
    G.scene='tree';Mus.play('shop');
    document.getElementById('tree-sub').textContent='Charm Points: '+G.charmPts;
    const w=document.getElementById('tree-w');w.innerHTML='';w.style.overflow='visible';
    G.perks.root=true;

    const cv=document.createElement('canvas');
    const cw=Math.min(700,innerWidth-6);
    const ch=Math.min(600,innerHeight-100);
    const dpr=window.devicePixelRatio||1;
    cv.width=cw*dpr;cv.height=ch*dpr;
    cv.style.cssText=`display:block;margin:0 auto;width:${cw}px;height:${ch}px;cursor:pointer;`;
    w.appendChild(cv);
    const x=cv.getContext('2d');x.scale(dpr,dpr);

    const nodePos={
        root:[.5,.92],
        combat:[.20,.78],defense:[.5,.78],social:[.80,.78],
        dmg1:[.12,.64],crit:[.28,.64],hp1:[.42,.64],block1:[.58,.64],mp1:[.72,.64],regen:[.88,.64],
        berserker:[.20,.48],tank:[.5,.48],rizz:[.80,.48],
        fury:[.08,.30],deadshot:[.28,.30],guardian:[.40,.30],vampire:[.60,.30],healer:[.72,.30],hypno:[.92,.30]
    };
    const branchCol={
        root:'#e040fb',
        combat:'#ff006e',dmg1:'#ff006e',crit:'#ff006e',berserker:'#ff006e',fury:'#ff006e',deadshot:'#ff006e',
        defense:'#00d4aa',hp1:'#00d4aa',block1:'#00d4aa',tank:'#00d4aa',guardian:'#00d4aa',vampire:'#00d4aa',
        social:'#ffbe0b',mp1:'#ffbe0b',regen:'#ffbe0b',rizz:'#ffbe0b',healer:'#ffbe0b',hypno:'#ffbe0b'
    };
    const endNodeAbility={fury:'RAGE MODE',deadshot:'LASER FOCUS',guardian:'SPEJLSKJOLD',vampire:'SOUL DRAIN',healer:'HEALING',hypno:'CHARM BOMB'};
    const nr=Math.min(18,cw*.03);
    function nx(id){return nodePos[id][0]*cw;}
    function ny(id){return nodePos[id][1]*ch;}

    // Background: dark space with nebula
    const bg=x.createRadialGradient(cw*.3,ch*.4,0,cw*.5,ch*.5,cw*.7);
    bg.addColorStop(0,'#0e1a2a');bg.addColorStop(.5,'#0a0f1a');bg.addColorStop(1,'#050510');
    x.fillStyle=bg;x.fillRect(0,0,cw,ch);
    // Nebula glow
    const nb1=x.createRadialGradient(cw*.25,ch*.35,0,cw*.25,ch*.35,cw*.25);
    nb1.addColorStop(0,'rgba(0,212,170,.06)');nb1.addColorStop(1,'transparent');
    x.fillStyle=nb1;x.fillRect(0,0,cw,ch);
    const nb2=x.createRadialGradient(cw*.75,ch*.55,0,cw*.75,ch*.55,cw*.2);
    nb2.addColorStop(0,'rgba(255,0,110,.04)');nb2.addColorStop(1,'transparent');
    x.fillStyle=nb2;x.fillRect(0,0,cw,ch);
    // Stars
    for(let i=0;i<80;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.35+.05})`;x.beginPath();x.arc(Math.random()*cw,Math.random()*ch,Math.random()*1.2+.2,0,Math.PI*2);x.fill();}

    // Draw connections
    for(const id in skillTree){
        const s=skillTree[id];const unlocked=G.perks[id];
        const col=branchCol[id]||'#555';
        s.children.forEach(cid=>{
            if(!nodePos[cid])return;
            x.save();
            if(unlocked){x.shadowColor=col;x.shadowBlur=10;x.strokeStyle=col;x.lineWidth=3;x.globalAlpha=.9;}
            else{x.strokeStyle='rgba(255,255,255,.1)';x.lineWidth=1.5;x.globalAlpha=.5;}
            x.beginPath();x.moveTo(nx(id),ny(id));x.lineTo(nx(cid),ny(cid));x.stroke();
            if(unlocked){x.shadowBlur=0;x.strokeStyle=col;x.globalAlpha=.15;x.lineWidth=8;x.beginPath();x.moveTo(nx(id),ny(id));x.lineTo(nx(cid),ny(cid));x.stroke();}
            x.restore();
        });
    }

    // Draw nodes
    const hovered={id:null};
    function drawNodes(){
        for(const id in nodePos){
            const s=skillTree[id];if(!s)continue;
            const unlocked=G.perks[id];const can=canUnlock(id);
            const col=branchCol[id]||'#555';
            const px=nx(id),py=ny(id);
            const isEnd=!!endNodeAbility[id];
            const r=isEnd?nr*1.15:nr;

            x.save();
            // Outer glow for unlocked
            if(unlocked){
                x.shadowColor=col;x.shadowBlur=18;
                x.fillStyle=col;x.globalAlpha=.15;
                x.beginPath();x.arc(px,py,r+8,0,Math.PI*2);x.fill();
                x.shadowBlur=0;x.globalAlpha=1;
            }
            // Node circle
            x.fillStyle=unlocked?col:(can?'rgba(255,255,255,.12)':'rgba(255,255,255,.04)');
            x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();
            // Border
            if(unlocked){x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=2.5;}
            else if(can){x.strokeStyle=col;x.lineWidth=2;x.setLineDash([3,3]);}
            else{x.strokeStyle='rgba(255,255,255,.15)';x.lineWidth=1;}
            x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.stroke();x.setLineDash([]);
            // End nodes: diamond outer ring
            if(isEnd){
                x.strokeStyle=unlocked?col:'rgba(255,255,255,.1)';x.lineWidth=unlocked?2:1;
                x.save();x.translate(px,py);x.rotate(Math.PI/4);
                x.strokeRect(-r*.85,-r*.85,r*1.7,r*1.7);
                x.restore();
            }
            // Icon
            x.font=`${r*.85}px serif`;x.textAlign='center';x.textBaseline='middle';
            x.fillStyle=unlocked?'#fff':'rgba(255,255,255,.6)';
            x.fillText(s.icon,px,py+1);
            // Name
            x.font=`bold ${Math.max(4,Math.min(7,cw*.012))}px 'Press Start 2P'`;
            x.fillStyle=unlocked?'#fff':(can?col:'rgba(255,255,255,.3)');
            x.fillText(s.name,px,py+r+9);
            // Cost or checkmark
            if(unlocked){
                x.fillStyle='#00d4aa';x.font=`${Math.max(4,r*.3)}px 'Press Start 2P'`;
                x.fillText('✓',px,py+r+16);
            } else if(id!=='root'){
                x.fillStyle=can?'#fff':'rgba(255,255,255,.2)';x.font=`${Math.max(3,r*.25)}px 'Press Start 2P'`;
                x.fillText(s.cost+' PTS',px,py+r+16);
            }
            // Ability name for end nodes
            if(isEnd){
                x.font=`${Math.max(3,Math.min(5,cw*.008))}px 'Press Start 2P'`;
                x.fillStyle=unlocked?'#e040fb':'rgba(224,64,251,.3)';
                x.fillText('→ '+endNodeAbility[id],px,py+r+22);
            }
            x.restore();
        }
    }
    drawNodes();

    // Info panel at bottom
    const info=document.createElement('div');
    info.style.cssText='text-align:center;padding:6px;min-height:36px;';
    info.innerHTML='<span class="pix" style="color:#888;font-size:clamp(5px,1.2vw,8px)">Klik på en node for at låse op!</span>';
    w.appendChild(info);

    // Click & hover handler
    function getNode(e){
        const rect=cv.getBoundingClientRect();
        const mx=(e.clientX-rect.left)*(cw/rect.width);
        const my=(e.clientY-rect.top)*(ch/rect.height);
        for(const id in nodePos){
            const r=endNodeAbility[id]?nr*1.15:nr;
            if(Math.hypot(mx-nx(id),my-ny(id))<r+6)return id;
        }
        return null;
    }
    cv.onmousemove=(e)=>{
        const id=getNode(e);
        if(id&&skillTree[id]){
            const s=skillTree[id];const col=branchCol[id]||'#fff';
            const extra=endNodeAbility[id]?` | Låser op: <span style="color:#e040fb">${endNodeAbility[id]}</span>`:'';
            info.innerHTML=`<span class="pix" style="font-size:clamp(5px,1.3vw,9px);color:${col}">${s.icon} ${s.name}</span><br><span class="pix" style="font-size:clamp(4px,1vw,7px);color:#aaa">${s.desc}${extra}</span>`;
            cv.style.cursor=canUnlock(id)&&!G.perks[id]?'pointer':'default';
        } else{
            info.innerHTML='<span class="pix" style="color:#888;font-size:clamp(5px,1.2vw,8px)">Klik på en node for at låse op!</span>';
            cv.style.cursor='default';
        }
    };
    cv.onclick=(e)=>{
        const id=getNode(e);
        if(id&&canUnlock(id)&&!G.perks[id]){
            const s=skillTree[id];
            G.charmPts-=s.cost;G.perks[id]=true;
            if(s.effect)s.effect();
            S.perf();float('UNLOCKED!','#ffbe0b');
            bigTextFlash(s.name+'!',s.cost>=6?'#ff006e':'#ffbe0b');
            screenShake(s.cost>=6?8:4,300);
            sparkleEffect(innerWidth/2,innerHeight/2,branchCol[id]||'#ffbe0b');
            openTree();updHUD();
        }
    };
    cv.ontouchstart=(e)=>{e.preventDefault();const t=e.touches[0];cv.onclick({clientX:t.clientX,clientY:t.clientY});};

    document.getElementById('tree-ov').classList.add('active');
}

// ===== WORK =====
const allJobs=[
    {name:'Netto Kassen',pay:[60,110],req:1},{name:'Uber Eats',pay:[80,150],req:1},
    {name:'Lager Vagt',pay:[100,180],req:2},{name:'Bartender',pay:[140,240],req:3},
    {name:'Promoter',pay:[180,300],req:4},{name:'DJ Assistent',pay:[230,380],req:5}];
function openWork(){
    G.scene='work';Mus.play('work');S.door();sceneFlash('#00d4aa');drawWorkBg();
    document.getElementById('work-sub').textContent=`Ritardo: "Tid er penge!" | LVL ${G.workLvl} (${G.workXP}/${G.workNeed()} XP)`;
    const l=document.getElementById('work-list');l.innerHTML='';
    allJobs.forEach(j=>{
        const lk=G.workLvl<j.req;
        const d=document.createElement('div');d.className='si'+(lk?' dis':'');
        d.innerHTML=`<div class="si-l"><span class="si-i">${lk?'🔒':'💼'}</span><div><div class="si-n">${j.name}</div><div class="si-d">${lk?'Kræver LVL '+j.req:j.pay[0]+'-'+j.pay[1]+' kr | -15 sult | 12t'}</div></div></div><div class="si-p"></div>`;
        if(!lk)d.onclick=()=>{
            if(G.hunger<15){msg('For sulten!');return;}
            G.hunger-=15;
            document.getElementById('work-ov').classList.remove('active');
            showWorkAnim(j);
        };
        l.appendChild(d);
    });
    document.getElementById('work-ov').classList.add('active');
}

function showWorkAnim(job){
    G.scene='work_anim';maybeJoke(workJokes);
    const ov=document.createElement('div');ov.id='work-anim-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#05050f;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    const cv2=document.createElement('canvas');cv2.width=320;cv2.height=220;cv2.style.cssText='border:1px solid rgba(255,255,255,.1);border-radius:8px;margin-bottom:16px;';
    const txt=document.createElement('div');txt.className='pix';txt.style.cssText='color:#ffbe0b;font-size:clamp(7px,2vw,12px);';txt.textContent='Arbejder...';
    ov.appendChild(cv2);ov.appendChild(txt);document.body.appendChild(ov);
    const x2=cv2.getContext('2d'),W=cv2.width,H=cv2.height;
    const workQuotes=[
        ['Hårdt arbejde...','Ritardo: "HURTIGERE!"','Sveder...','Ritardo: "MERE!"','Tjener penge! 💰'],
        ['Ritardo: "Du er SEN!"','Fokuserer...','Ritardo skriger igen...','Ritardo: "JEG ER CHEFEN!"','Done! 💰'],
        ['Kollegaen snorker...','Du gør ALT selv...','Ritardo spiller Candy Crush...','Ritardo: "Hvad kigger du på?!"','Endelig fri! 💰'],
        ['Ritardo: "MIN bedstemor er hurtigere!"','Ignorerer ham...','Kaffe-pause? NEJ.','Ritardo danser på bordet...','Overlevede! 💰'],
        ['Ritardo: "FOKUS!"','*Ritardo kaster ting*','Du ducker...','Ritardo: "Undskyld... PSYCH!"','Slut for i dag! 💰'],
        ['Ritardo synger falskt...','Du får hovedpine...','Ritardo: "Det er MOTIVATIONSMUSIK!"','*ørepropper på*','Frihed! 💰']
    ];
    const phrases=workQuotes[Math.floor(Math.random()*workQuotes.length)];
    let frame=0,phIdx=0;
    const bubbles=[];
    const ritardoBubbles=['💰','📊','😤','☕','📱','🎵','💪','🤑','📋','⚡'];
    const anim=()=>{
        frame++;x2.clearRect(0,0,W,H);
        // Background - office/warehouse
        x2.fillStyle='#0c1a14';x2.fillRect(0,0,W,H);
        // Wall
        x2.fillStyle='#162820';x2.fillRect(0,0,W,H*.65);
        // Wall details - shelves
        x2.fillStyle='#1e3a2e';
        x2.fillRect(10,H*.12,60,4);x2.fillRect(10,H*.28,60,4);
        x2.fillRect(W-70,H*.12,60,4);x2.fillRect(W-70,H*.28,60,4);
        // Items on shelves
        x2.fillStyle='#4a6050';
        x2.fillRect(15,H*.08,12,8);x2.fillRect(35,H*.06,8,10);x2.fillRect(55,H*.09,10,7);
        x2.fillRect(W-65,H*.08,12,8);x2.fillRect(W-45,H*.05,8,11);x2.fillRect(W-30,H*.09,10,7);
        x2.fillRect(18,H*.22,10,10);x2.fillRect(42,H*.24,14,8);
        x2.fillRect(W-60,H*.22,10,10);x2.fillRect(W-38,H*.24,14,8);
        // Clock on wall
        const clockX=W/2,clockY=H*.1,clockR=10;
        x2.strokeStyle='#5a7a6a';x2.lineWidth=2;x2.beginPath();x2.arc(clockX,clockY,clockR,0,Math.PI*2);x2.stroke();
        const cAngle=(frame*.01)%(Math.PI*2);
        x2.strokeStyle='#ffbe0b';x2.lineWidth=1;x2.beginPath();x2.moveTo(clockX,clockY);x2.lineTo(clockX+Math.cos(cAngle)*7,clockY+Math.sin(cAngle)*7);x2.stroke();
        x2.beginPath();x2.moveTo(clockX,clockY);x2.lineTo(clockX+Math.cos(cAngle*0.08)*5,clockY+Math.sin(cAngle*0.08)*5);x2.stroke();
        // Floor
        x2.fillStyle='#1a2e24';x2.fillRect(0,H*.65,W,H*.35);
        // Floor tiles
        x2.strokeStyle='rgba(255,255,255,.03)';
        for(let i=0;i<8;i++){x2.beginPath();x2.moveTo(i*W/8,H*.65);x2.lineTo(i*W/8,H);x2.stroke();}
        // Desk/counter
        x2.fillStyle='#4a3520';x2.fillRect(W*.12,H*.48,W*.35,10);
        x2.fillStyle='#3a2810';x2.fillRect(W*.14,H*.56,8,H*.15);x2.fillRect(W*.42,H*.56,8,H*.15);
        // Items on desk
        x2.fillStyle='#555';x2.fillRect(W*.18,H*.42,14,10);// monitor
        x2.fillStyle='#0a3a2a';x2.fillRect(W*.19,H*.43,12,7);// screen
        const screenFlicker=Math.sin(frame*.15)>.5?'#00d4aa':'#00b490';
        x2.fillStyle=screenFlicker;x2.fillRect(W*.20,H*.44,10,4);
        x2.fillStyle='#6a5a40';x2.fillRect(W*.36,H*.44,8,8);// coffee mug
        x2.fillStyle='#3a2010';x2.fillRect(W*.37,H*.42,6,3);// coffee top
        // Stack of papers
        x2.fillStyle='#ddd';x2.fillRect(W*.28,H*.44,10,2);x2.fillRect(W*.28,H*.43,10,2);x2.fillRect(W*.28,H*.42,10,2);
        // Hanzi working (detailed character)
        const bob=Math.sin(frame*.08)*2;
        const hx=W*.28,hy=H*.34+bob;
        // Head
        x2.fillStyle='#c68642';x2.beginPath();x2.arc(hx,hy,8,0,Math.PI*2);x2.fill();
        // Hair
        x2.fillStyle='#1a1a1a';x2.beginPath();x2.arc(hx,hy-2,8,Math.PI,Math.PI*2);x2.fill();
        // Eyes
        x2.fillStyle='#fff';x2.fillRect(hx-4,hy-2,3,3);x2.fillRect(hx+1,hy-2,3,3);
        x2.fillStyle='#111';x2.fillRect(hx-3,hy-1,2,2);x2.fillRect(hx+2,hy-1,2,2);
        // Body
        x2.fillStyle='#475569';x2.fillRect(hx-7,hy+8,14,16);
        // Arms doing work animation
        const armSwing=Math.sin(frame*.12)*6;
        x2.fillStyle='#c68642';
        x2.fillRect(hx-10,hy+10,5,3);// left arm base
        x2.fillRect(hx-12+armSwing,hy+8,5,3);// left hand moving
        x2.fillRect(hx+5,hy+10,5,3);// right arm
        x2.fillRect(hx+8-armSwing,hy+8,5,3);// right hand
        // Sweat drops
        if(frame%30<15){
            x2.fillStyle='#00d4aa';
            x2.beginPath();x2.arc(hx+10,hy-4+Math.sin(frame*.2)*2,1.5,0,Math.PI*2);x2.fill();
        }
        // Ritardo (bigger, more detailed)
        drawNPC(x2,W*.7,H*.62,'ritardo',frame*.02);
        // Ritardo speech bubble
        if(frame%90<60&&frame>30){
            const bub=ritardoBubbles[Math.floor(frame/90)%ritardoBubbles.length];
            x2.fillStyle='rgba(255,255,255,.9)';
            const bx=W*.7,by=H*.48;
            x2.beginPath();x2.arc(bx,by,12,0,Math.PI*2);x2.fill();
            x2.beginPath();x2.moveTo(bx-3,by+10);x2.lineTo(bx+3,by+10);x2.lineTo(bx,by+16);x2.fill();
            x2.font='12px serif';x2.textAlign='center';x2.fillStyle='#000';x2.fillText(bub,bx,by+5);
        }
        // Ritardo exclamation marks when angry
        if(frame%120>80&&frame%120<110){
            x2.font="bold 10px 'Press Start 2P'";x2.fillStyle='#ff006e';
            x2.fillText('!',W*.7+15,H*.52+Math.sin(frame*.3)*3);
        }
        // Floating coins when earning
        if(frame>120){
            if(frame%20===0)bubbles.push({x:W*.28+Math.random()*20-10,y:H*.3,vy:-0.8,life:40});
            bubbles.forEach(b=>{b.y+=b.vy;b.life--;x2.font='8px serif';x2.fillText('💰',b.x,b.y);});
            while(bubbles.length>0&&bubbles[0].life<=0)bubbles.shift();
        }
        // Progress bar (fancier)
        const prog=Math.min(1,frame/240);
        const barW=W-60,barX=30,barY=H-22;
        x2.fillStyle='rgba(255,255,255,.08)';x2.fillRect(barX,barY,barW,10);
        const grad=x2.createLinearGradient(barX,0,barX+barW*prog,0);
        grad.addColorStop(0,'#00d4aa');grad.addColorStop(1,'#ffbe0b');
        x2.fillStyle=grad;x2.fillRect(barX,barY,barW*prog,10);
        x2.strokeStyle='rgba(255,255,255,.2)';x2.strokeRect(barX,barY,barW,10);
        x2.font="bold 7px 'Press Start 2P'";x2.textAlign='center';x2.fillStyle='#fff';
        x2.fillText(Math.floor(prog*100)+'%',W/2,barY-4);
        // Job name
        x2.font="bold 6px 'Press Start 2P'";x2.fillStyle='#888';x2.fillText(job.name.toUpperCase(),W/2,14);
        if(frame%50===0&&phIdx<phrases.length){txt.textContent=phrases[phIdx];phIdx++;}
        if(frame<240){requestAnimationFrame(anim);}
        else{
            advTime(12);
            const earn=job.pay[0]+Math.floor(Math.random()*(job.pay[1]-job.pay[0]));
            G.money+=earn;G.workXP++;
            if(G.workXP>=G.workNeed()){G.workXP=0;G.workLvl++;float('WORK LVL UP!','#00d4aa');bigTextFlash('LVL '+G.workLvl+'!','#00d4aa');screenShake(5,250);sparkleEffect(innerWidth/2,innerHeight/2,'#00d4aa');msg('Ritardo: "Forfremmet! LVL '+G.workLvl+'!" 🎉');}
            S.coin();float('+'+earn+' KR','#00d4aa');
            txt.textContent='+'+earn+' KR tjent! 💰';txt.style.color='#00d4aa';
            setTimeout(()=>{ov.remove();G.scene='map';Mus.play('map');updHUD();flushPendingDay();flushPendingEvents();},1500);
        }
    };
    anim();
}

// ===== BODEGA =====
const bodegaPool=[
    {name:"Katrine",icon:"🍺",rating:1,abilities:['Bartender Help'],attacks:["Haha nej","Du prøver for hårdt","*bestiller en drink*","Cute men nej","Øhm... kender vi hinanden?","Du ligner en der drikker Harboe","Seriøst? Den replik?","Ej stop, min veninde kigger","Hvem sendte dig herover? 😂","Jeg har en kæreste... tror jeg","*griner nervøst*","Det var næsten charmerende. Næsten.","Tror du vi er i en film eller hvad?","Min hund er bedre selskab","*tager en selfie uden dig i baggrunden*","Okay DET var pinligt","Er du fra Randers? Du giver Randers-vibes","Nej nej nej. Prøv den næste bar."],win:"Katrine giver nummer! 📱",lose:"'Ses aldrig.'"},
    {name:"Tina",icon:"💅",rating:2,abilities:['Øl-Splash'],attacks:["Haha du ligner min ex","Køb mig en øl først","Du danser som en far 😂","*tager en slurk*","Er du altid så... intens?","Min ex sagde det samme 💀","Du har vist drukket nok","*kigger på veninderne og griner*","Prøver du at flirte eller har du krampe?","Okay det var lidt sjovt. Men nej.","Du er modig, det giver jeg dig","Hmm... nej. Men tak for underholdningen.","*hælder øl i dit skød* Ups!","Du minder mig om min lillebror","Har du prøvet at smile MINDRE?","Wow du er virkelig... noget.","Min veninde siger du ligner en NPC","*blokerer dig med sin taske*"],win:"Tina: 'Du er sgu okay!' 🍻",lose:"'Ej... nej tak.' 😬"},
    {name:"Mette",icon:"🍷",rating:2,abilities:['Wine Throw'],attacks:["Er det din bedste replik?","Min kat er sjovere","*kigger på telefonen*","Prøv igen, skat","Du minder mig om en fyr der skylder mig penge","Hvad er det for en cologne? Desperation?","Åh gud, ikke igen...","*nipper til vinen og ignorerer dig*","Ved du hvad? Nej.","Du ville ikke overleve én dag med mig","Sødt forsøg, forkert pige","Min mor sagde jeg skulle undgå typer som dig","*kaster vin i dit ansigt* Refreshing!","Du er som en pop-up reklame IRL","Har du en returpolitik på den replik?","Min terapeut advarer mig mod typer som dig","Ej, gider du ikke bare... gå?","*swiper left på dig i virkeligheden*"],win:"Mette: 'Okay, én dans!' 💃",lose:"'Kender du ikke hints?' 🙄"},
    {name:"Louise",icon:"🎤",rating:3,abilities:['Karaoke Burn'],attacks:["Kan du overhovedet synge?","Du lugter af gym 💀","Min veninde siger nej","*synger højere end dig*","Jeg synger dig ud af lokalet om lidt","Er det her din audition? Du er dumpet","*dedikerer en sang til din fiasko*","Tonedøv OG charmløs? Wow.","Kan du freestyle? Nej? Farvel.","Din stemme giver mig tinnitus","Hold din dayjob, skat 🎤","*synger 'bye bye bye' direkte til dig*","Du rammer ikke engang de lave toner","*laver en diss-track om dig on the spot*","Auto-tune kan ikke redde dig","Selv Simon Cowell ville sige nej","Min mikrofon har mere personlighed","*synger en ballade om din fiasko*"],win:"Louise: 'Du har charm!' 🎶",lose:"'Stick to the gym, bro.'"},
    {name:"Fie",icon:"📱",rating:3,abilities:['Insta Block'],attacks:["Hvor mange følgere har du?","Ej du er ikke verified","*poster dig på story* 💀","Swipe left IRL","Du er ikke TikTok-worthy","*tager et billede* Det her går på finsta","Under 1000 følgere? Yikes...","Kan du overhovedet redigere reels?","Dit aesthetic er giving 2015","Ej vent, det her er content gold 📸","*checker din profil* Hmm... private? Sus.","Ingen blå flueben, ingen interesse","Dit engagement rate er tragisk","*unfollower dig mens du ser på*","Du er giving 'ratio'd' energy","Har du prøvet at have charisma?","*tagger dig i en cringe-compilation*","Din grid er KAOS"],win:"Fie: 'Okay du er cute' 📱❤️",lose:"'Blocked IRL.'"},
    {name:"Sara",icon:"💄",rating:4,abilities:['Makeup Shield'],attacks:["Min foundation koster mere end dig","Du er en 4 max","*tager selfie uden dig*","Ew.","Min highlighter skinner mere end din fremtid","Skat, du er ikke i min liga","*retter på sin læbestift*","Hvem gav dig lov til at tale til mig?","Du er giving discount-version af min ex","Er det outfit fra Wish? 💀","Aww du prøver så hårdt. Det er ynkeligt.","Kan du betale min Sephora-regning? Nej? Farvel.","*pudrer sig aggressivt*","Mine vipper koster mere end din husleje","Du er som mascara der løber - tragisk","Min contour har mere dybde end din personlighed","*sprayer parfume mod dig som afskrækning*","Selv min beauty blender afviser dig"],win:"Sara: 'Du er charmerende' 💋",lose:"'Næste.'"},
    {name:"Ida",icon:"🎵",rating:4,abilities:['Bass Drop'],attacks:["Kan du ikke høre beaten?","Din vibe er OFF","*danser væk*","Prøv igen om 10 år","Du er off-beat i livet generelt","Har du nogensinde været til en festival? Du ser ikke ud til det","*sætter høretelefoner på*","Din energi er forkert frekvens","Dine moves er fra 2012","Bass dropper hårdere end dine pick-up lines","*laver en DJ-scratch med munden*","Denne sang handler om at ghoste folk som dig","Du er som en skippet sang på shuffle","*skruer op for musikken for at overdøve dig*","Din rytme er som wifi der buffer","Selv Soundcloud rappers har mere game","*mixer dig ud af samtalen*","Du er en one-hit-wonder... uden hittet"],win:"Ida: 'Nice moves!' 🎵",lose:"'Cringe.'"},
    {name:"Emma",icon:"🌸",rating:5,abilities:['Friend Zone'],attacks:["Du er SÅ sød... som en ven","Aww cute forsøg","*sender dig til veninderne*","Du minder mig om min bror","Vi er BEDSTE venner nu! Ikke mere.","Ej du er virkelig en god ven ❤️ ...ven.","Skal vi lave en vennegruppe?","Aww du er som en golden retriever. Ven-zonen.","*giver dig et klap på skulderen*","Du ville være PERFEKT til min veninde... nej vent","Bro-energy. Sorry.","Kan du ikke bare være min gay bestie?","Skal vi lave en friendship bracelet? 🥹","*tilføjer dig til 'besties' gruppen*","Du er som en bamse - cute men ikke boyfriend material","Ej du ville være SÅ god som min ven-date til bryllup!","*giver dig et kram* ...et VENNE-kram!","Du er som en bror fra en anden mor. Og det bliver du ved med."],win:"Emma: 'Okay... én date!' 🌸",lose:"'Vi kan være venner?'"},
];
let bodegaUsedToday=false;
const bodegaUpgradeCost=[0,100,200,350,500,700,900];

function rollGirlLevel(){
    const r=Math.random();
    if(r<.40)return 1;if(r<.65)return 2;if(r<.82)return 3;if(r<.94)return 4;return 5;
}
const lvlColors=['#aaa','#3b82f6','#a855f7','#ffbe0b','#ff006e'];
const lvlNames=['','⭐','⭐⭐','⭐⭐⭐','👑'];

function makeScaledGirl(base){
    const r=base.rating;
    const lvl=base.lvl||rollGirlLevel();
    const lvlMult=1+(lvl-1)*.075;
    const hp=Math.round(girlScaleHP(r)*lvlMult);
    const atk=Math.round(girlScaleATK(r)*lvlMult);
    return {...base,lvl,hp,atk};
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
    const maxR=Math.min(bodegaPool.length,G.bodegaLvl+3);
    const pool=bodegaPool.filter(g=>g.rating<=maxR);
    const weighted=[];
    pool.forEach(g=>{
        const w=G.bodegaLvl>=4?Math.max(1,4-Math.abs(g.rating-G.bodegaLvl)):Math.max(1,maxR+1-g.rating);
        for(let i=0;i<w;i++)weighted.push(g);
    });
    return weighted[Math.floor(Math.random()*weighted.length)];
}
function rollBodegaLevel(){
    const bonus=Math.min(4,G.bodegaLvl-1);
    const r=Math.random();
    if(r<Math.max(.10,.40-bonus*.08))return 1;
    if(r<Math.max(.25,.60-bonus*.08))return 2;
    if(r<Math.max(.45,.78-bonus*.06))return 3;
    if(r<Math.max(.65,.92-bonus*.05))return 4;
    return 5;
}
const bodegaJokes=[
    'Stemningen er tyk af røg og dårlige beslutninger 🌫️',
    'Bartenderen ser ud som om han har set TING. Mange ting. 👁️',
    'Nogen spiller dart. Pilen rammer væggen. Ikke dartskiven. 🎯',
    'En stamgæst fortæller den samme historie for 3. gang i aften 🍺',
    'Jukeboksen spiller kun dansk top fra 1987. Ingen klagede. 🎵',
    'Du sidder på den klæbrige barstol. Du vil ALDRIG rejse dig. 🪑',
    'En fyr ved baren sover. Har gjort det siden tirsdag. 😴',
    'Bartenderen: "Vi har øl, øl, og... øl." Valgt er nemt. 🍻',
    'Toilettet har ingen lås. Speed-run AKTIVERET. 🚽💨',
    'Nogen har skrevet "HANZI WAS HERE" på væggen. Det var dig i går. 🖊️',
    'Der er en mystisk plet på gulvet. Ingen spørger. Ingen VIL vide. 🤢',
    'En due sidder på baren. Den er stamgæst. 🕊️🍺',
];
function openBodega(){
    G.scene='bodega';Mus.play('bodega');S.door();sceneFlash('#f59e0b');advTime(1);drawBodegaBg();maybeJoke(bodegaJokes);
    const sub=document.getElementById('bodega-sub');
    const l=document.getElementById('bodega-list');l.innerHTML='';
    if(bodegaUsedToday){sub.textContent='Du har allerede prøvet i dag! Kom igen i morgen.';
        document.getElementById('bodega-ov').classList.add('active');return;}
    const base=pickBodegaGirl();
    const g=makeScaledGirl({...base,lvl:rollBodegaLevel()});
    const maxR=Math.min(bodegaPool.length,G.bodegaLvl+3);
    sub.textContent=`LVL ${G.bodegaLvl}/7 · Piger op til ${maxR}/10 · Bedre levels! (1/dag)`;
    const d=document.createElement('div');d.className='si';
    const lc=lvlColors[g.lvl-1]||'#aaa';
    d.innerHTML=`<div class="si-l"><span class="si-i">${g.icon}</span><div><div class="si-n">${g.name} <span style="color:${lc}">LVL ${g.lvl}</span></div><div class="si-d">${g.rating}/10 · ${g.lvl>=4?'💎 SJÆLDEN!':g.lvl>=3?'⭐ Stærk':'Normal'} · HP:${g.hp} ATK:${g.atk}</div></div></div><div class="si-p" style="color:${lc}">${g.lvl>=5?'👑':'⭐'}${g.lvl}</div>`;
    d.onclick=()=>{bodegaUsedToday=true;l.innerHTML='';document.getElementById('bodega-ov').classList.remove('active');startCombatWithGirl(g,true);C.isBodega=true;};
    l.appendChild(d);
    const skip=document.createElement('div');skip.className='si';skip.style.borderColor='rgba(255,255,255,.1)';
    skip.innerHTML=`<div class="si-l"><span class="si-i">🚪</span><div><div class="si-n">GÅ IGEN</div><div class="si-d">Gem dit forsøg til i morgen</div></div></div>`;
    skip.onclick=()=>{l.innerHTML='';document.getElementById('bodega-ov').classList.remove('active');G.scene='map';};
    l.appendChild(skip);
    if(G.bodegaLvl<7){
        const cost=bodegaUpgradeCost[G.bodegaLvl];
        const u=document.createElement('div');u.className='si';u.style.borderColor='rgba(245,158,11,.3)';
        u.innerHTML=`<div class="si-l"><span class="si-i">⬆️</span><div><div class="si-n">OPGRADER BODEGA</div><div class="si-d">LVL ${G.bodegaLvl+1} · Sjældnere + stærkere piger</div></div></div><div class="si-p" style="color:#f59e0b">${cost} KR</div>`;
        u.onclick=()=>{if(G.money<cost){msg('Ikke nok penge!');S.bad();return;}G.money-=cost;G.bodegaLvl++;S.perf();float('BODEGA LVL '+G.bodegaLvl+'!','#f59e0b');bigTextFlash('BODEGA LVL '+G.bodegaLvl+'!','#f59e0b');screenShake(5,250);sparkleEffect(innerWidth/2,innerHeight/2,'#f59e0b');openBodega();updHUD();};
        l.appendChild(u);
    }
    document.getElementById('bodega-ov').classList.add('active');
}

// ===== LUCKY WHEEL =====
const wheelSlices=[
    {label:'+50 KR',color:'#00d4aa',fn:()=>{G.money+=50;float('+50 KR','#00d4aa');msg('Du vandt 50 kr! 💰');}},
    {label:'+STR Buff',color:'#ff006e',fn:()=>{G.buff='str';G.buffDays=3;G.styrke+=2;float('+2 STR (3 dage)','#ff006e');msg('Styrke buff i 3 dage! 💪');}},
    {label:'-ALL SULT',color:'#000',fn:()=>{G.hunger=Math.max(5,G.hunger-50);float('-50 SULT','#ff006e');S.bad();msg('Madforgiftning! -50 sult! 🤮');}},
    {label:'⭐ SUPER!',color:'#e040fb',fn:()=>{S.perf();msg('🌟 SUPER LYKKEHJUL! 🌟');setTimeout(()=>openSuperWheel(),1500);}},
    {label:'-50 KR',color:'#8b5cf6',fn:()=>{G.money=Math.max(0,G.money-50);float('-50 KR','#ff006e');S.bad();msg('Du tabte 50 kr! 😬');}},
    {label:'+HP Buff',color:'#3b82f6',fn:()=>{G.buff='hp';G.buffDays=3;G.cardio+=2;float('+2 HP (3 dage)','#3b82f6');msg('Buff i 3 dage! ❤️');}},
    {label:'+30 SULT',color:'#ff6b35',fn:()=>{G.hunger=Math.min(G.maxHunger,G.hunger+30);float('+30 SULT','#ff6b35');msg('+30 sult! 🍔');}},
    {label:'-ALL PENGE',color:'#111',fn:()=>{const lost=Math.floor(G.money*.5);G.money-=lost;float('-'+lost+' KR','#ff006e');S.bad();msg('Bestjålet! Halve penge væk! 💸');}},
];
const superWheelSlices=[
    {label:'+3 ALL STATS',color:'#ffbe0b',fn:()=>{G.styrke+=3;G.cardio+=3;G.smalltalk+=3;G.reflex+=3;float('+3 ALLE STATS!','#ffbe0b');msg('MEGA BUFF! +3 til alt! 🔥');}},
    {label:'+500 KR',color:'#00d4aa',fn:()=>{G.money+=500;float('+500 KR!','#00d4aa');msg('JACKPOT! 500 kr! 💰💰💰');}},
    {label:'+5 STR',color:'#ff006e',fn:()=>{G.styrke+=5;float('+5 STYRKE!','#ff006e');msg('BEASTMODE! +5 styrke! 💪🔥');}},
    {label:'+5 CRD',color:'#3b82f6',fn:()=>{G.cardio+=5;float('+5 CARDIO!','#3b82f6');msg('MARATHON! +5 cardio! ❤️🔥');}},
    {label:'+3 CRIT LVL',color:'#e040fb',fn:()=>{G.critLvl+=3;float('+3 CRIT!','#e040fb');msg('CRIT MASTER! +6% crit chance! 🎯');}},
    {label:'+5 CHARM',color:'#ffbe0b',fn:()=>{G.charmPts+=5;G.charmTotal+=5;float('+5 CHARM!','#ffbe0b');msg('MEGA CHARM! +5 charm points! 🌟');}},
    {label:'+3 REGEN',color:'#00d4aa',fn:()=>{G.regenLvl+=3;float('+3 REGEN!','#00d4aa');msg('MEGA REGEN! Healer som en gud! 💚');}},
    {label:'MAX SULT+KR',color:'#ff6b35',fn:()=>{G.hunger=G.maxHunger;G.money+=300;float('MAX ALT!','#ff6b35');msg('Fuld mave + 300 kr! 🍔💰');}},
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
    if(wheelSpinning)return;wheelSpinning=true;G.wheelUsedToday=true;S.spin();
    document.getElementById('wheel-spin-btn').style.display='none';
    const target=Math.random()*Math.PI*2,totalSpin=Math.PI*8+target;
    let angle=0,spd=totalSpin,t=0;
    (function anim(){
        t+=.016;const ease=1-Math.pow(1-Math.min(1,t/3),3);
        angle=totalSpin*ease;drawWheel(angle);
        if(t<3){requestAnimationFrame(anim);}
        else{
            const finalAngle=((angle%(Math.PI*2))+(Math.PI*2))%(Math.PI*2);
            const sliceAngle=Math.PI*2/wheelSlices.length;
            const pointerAngle=((3*Math.PI/2-finalAngle)%(Math.PI*2)+(Math.PI*2))%(Math.PI*2);
            const idx=Math.floor(pointerAngle/sliceAngle)%wheelSlices.length;
            const result=wheelSlices[idx];
            S.perf();document.getElementById('wheel-result').innerHTML=`<span style="color:${result.color}">${result.label}</span>`;
            bigTextFlash(result.label,result.color);screenShake(5,200);
            setTimeout(()=>{result.fn();updHUD();
                setTimeout(()=>{document.getElementById('wheel-ov').classList.remove('active');
                    if(G.scene!=='end'){G.scene='guttertid';setTimeout(showGuttertid,500);}},2000);
            },800);
        }
    })();
}

function openSuperWheel(){
    G.scene='wheel';
    document.getElementById('wheel-sub').textContent='⭐ SUPER LYKKEHJUL! Crazy stats! ⭐';
    document.getElementById('wheel-result').textContent='';
    document.getElementById('wheel-spin-btn').style.display='block';
    wheelSpinning=false;superWheelActive=true;
    const wc=document.getElementById('wheel-cv');
    const maxSz=Math.min(innerWidth-40,innerHeight*.4,300);
    wc.width=maxSz;wc.height=maxSz;wc.style.width=maxSz+'px';wc.style.height=maxSz+'px';
    drawSuperWheel(0);
    document.getElementById('wheel-ov').classList.add('active');
}
let superWheelActive=false;
function drawSuperWheel(angle){
    const c=document.getElementById('wheel-cv'),x=c.getContext('2d'),sz=c.width/2;
    x.clearRect(0,0,c.width,c.height);
    x.save();x.translate(sz,sz);x.rotate(angle);
    const slices=superWheelSlices,n=slices.length,step=Math.PI*2/n;
    slices.forEach((s,i)=>{
        x.beginPath();x.moveTo(0,0);x.arc(0,0,sz-4,i*step,(i+1)*step);x.closePath();
        x.fillStyle=s.color;x.fill();x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=2;x.stroke();
        x.save();x.rotate(i*step+step/2);x.textAlign='center';x.font="bold 6px 'Press Start 2P'";
        x.fillStyle='#fff';x.fillText(s.label,sz*.6,3);x.restore();
    });
    x.restore();
    x.shadowColor='#e040fb';x.shadowBlur=15;x.fillStyle='#e040fb';
    x.beginPath();x.moveTo(sz-8,4);x.lineTo(sz+8,4);x.lineTo(sz,18);x.closePath();x.fill();x.shadowBlur=0;
}

function spinSuperWheel(){
    if(wheelSpinning)return;wheelSpinning=true;S.click();
    document.getElementById('wheel-spin-btn').style.display='none';
    const target=Math.random()*Math.PI*2,totalSpin=Math.PI*10+target;
    let angle=0,t=0;
    (function anim(){
        t+=.016;const ease=1-Math.pow(1-Math.min(1,t/3.5),3);
        angle=totalSpin*ease;drawSuperWheel(angle);
        if(t<3.5){requestAnimationFrame(anim);}
        else{
            const finalAngle=((angle%(Math.PI*2))+(Math.PI*2))%(Math.PI*2);
            const sliceAngle=Math.PI*2/superWheelSlices.length;
            const pointerAngle=((3*Math.PI/2-finalAngle)%(Math.PI*2)+(Math.PI*2))%(Math.PI*2);
            const idx=Math.floor(pointerAngle/sliceAngle)%superWheelSlices.length;
            const result=superWheelSlices[idx];
            S.perf();document.getElementById('wheel-result').innerHTML=`<span style="color:${result.color}">${result.label}</span>`;
            bigTextFlash(result.label,result.color);screenShake(10,400);sparkleEffect(innerWidth/2,innerHeight/2,result.color);sparkleEffect(innerWidth/3,innerHeight/2,'#ffbe0b');sparkleEffect(innerWidth*2/3,innerHeight/2,'#e040fb');
            setTimeout(()=>{result.fn();updHUD();superWheelActive=false;
                setTimeout(()=>{document.getElementById('wheel-ov').classList.remove('active');
                    if(G.scene!=='end'){G.scene='map';Mus.play('map');}},2000);
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
    {name:'Leth',icon:'💪',color:'#dc2626'},
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
    {text:'💎 {name}: "Bro, der er en HEMMELIG underground fight club!"',choices:[
        {text:'🥊 Tag mig med!',fn:()=>{advTime(3);if(G.styrke>=5||Math.random()>.4){G.styrke+=4;G.reflex+=3;G.money+=200;G.charmPts+=4;G.charmTotal+=4;msg('DU VANDT! +4 STR, +3 REF, +200 KR, +4 CHARM! 🏆🔥');}else{G.currentHP=Math.max(1,G.currentHP-20);S.bad();msg('Tæsk... -20 HP. Men du lærte noget.');G.styrke+=2;}}},
        {text:'🎯 Scout det ud først',fn:()=>{G.reflex+=3;G.smalltalk+=2;msg('Smart tilgang! Lærte deres teknikker. +3 REF, +2 TLK!');}},
        {text:'🚫 Nej tak, for farligt',fn:()=>{msg('{name}: "Du missede noget VILDT bro..." 😒');}},
    ]},
    {text:'🌟 {name}: "Yo, en BERØMT producer vil møde dig!"',choices:[
        {text:'🎵 LET\'S GO!',fn:()=>{if(G.money<100){msg('Ingen penge til outfit!');return false;}G.money-=100;G.charmPts+=6;G.charmTotal+=6;G.smalltalk+=3;msg('MEGA CONNECTION! +6 CHARM, +3 TLK! Han vil samarbejde! 🎶🔥');}},
        {text:'😎 Spil det cool',fn:()=>{G.charmPts+=3;G.charmTotal+=3;msg('Han respekterer din attitude! +3 CHARM!');}},
        {text:'💪 Vis ham din workout',fn:()=>{G.styrke+=3;G.cardio+=2;G.charmPts+=2;G.charmTotal+=2;msg('Han er imponeret! +3 STR, +2 CRD, +2 CHARM!');}},
    ]},
    {text:'👻 {name}: "Der er en mystisk krypt under byen... skatte!"',choices:[
        {text:'⚔️ Udforsk den!',fn:()=>{advTime(4);const roll=Math.random();if(roll>.6){G.money+=500;G.styrke+=3;G.reflex+=2;msg('SKAT FUNDET! +500 KR, +3 STR, +2 REF! 💰⚔️');}else if(roll>.3){G.cardio+=4;G.money+=150;msg('Fandt noget! +4 CRD, +150 KR!');}else{G.currentHP=Math.max(1,G.currentHP-15);G.reflex+=2;msg('Fælde! -15 HP men +2 REF for refleksen!');};}},
        {text:'🗺️ Lav en plan først',fn:()=>{G.reflex+=3;G.smalltalk+=2;G.money+=100;msg('Planlagt perfekt! +3 REF, +2 TLK, +100 KR!');}},
        {text:'📞 Ring efter backup',fn:()=>{G.styrke+=2;G.cardio+=2;G.smalltalk+=2;G.reflex+=2;msg('Teamwork! +2 til ALLE stats!');}},
    ]},
    {text:'🔧 {name}: "Bro... en mand i jakkesæt betragter dig fra en parkeret bil. Det er PHIL."',choices:[
        {text:'🕵️ Konfronter ham!',fn:()=>{advTime(2);if(G.day>=37){G.reflex+=4;G.styrke+=3;msg('Phil: "Stop med at klatre bror. Du ved ikke hvem du leger med." Han skælver. +4 REF, +3 STR!');}else{G.reflex+=3;msg('Phil løber. Han så BANGE ud. Hvad gemmer han? +3 REF');}}},
        {text:'📸 Tag et billede som bevis',fn:()=>{G.smalltalk+=3;G.charmPts+=3;G.charmTotal+=3;msg('Bevis sikret! Phil i Kalle Miths bil! +3 TLK, +3 CHARM!');}},
        {text:'👀 Observér stille',fn:()=>{G.reflex+=2;G.smalltalk+=2;msg('Phil taler i telefon... forvrænget stemme i den anden ende. Han nikker nervøst. +2 REF, +2 TLK');}},
    ]},
    {text:'{name}: "Bro, der er en dansebattle nede på torvet!"',choices:[
        {text:'🕺 Vis dem moves!',fn:()=>{if(G.reflex>=3||Math.random()>.4){G.charmPts+=4;G.charmTotal+=4;G.reflex+=1;msg('DU VANDT dansebattlen! Crowd goes WILD! 🕺🔥');}else{G.hunger-=15;S.bad();msg('Du faldt... på din røv... foran alle 😭');}}},
        {text:'🎵 Bare dans med',fn:()=>{G.cardio+=1;G.charmPts+=1;G.charmTotal+=1;advTime(1);msg('Sjovt! God motion!');}},
        {text:'📱 Film det',fn:()=>{G.charmPts+=1;G.charmTotal+=1;msg('Got some fire content! 📱');}},
    ]},
    {text:'{name}: "Yo bro, min bil er gået i stykker midt på motorvejen!"',choices:[
        {text:'🔧 Jeg fikser den!',fn:()=>{if(G.styrke>=4||Math.random()>.5){G.styrke+=2;G.money+=100;msg('Fixet! Han gav dig 100 kr! 🔧💰');}else{advTime(2);msg('Du prøvede... det virkede ikke. Men A for effort.');};}},
        {text:'📞 Ring efter hjælp',fn:()=>{G.smalltalk+=1;msg('Vejhjælpen kom! {name} er taknemmelig.');}},
        {text:'🏃 Løb efter dele!',fn:()=>{G.cardio+=2;advTime(1);msg('Du løb 3 km for en reservedel! Cardio gains! 🏃');}},
    ]},
    {text:'{name}: "Bro, jeg har to billetter til koncert i aften!"',choices:[
        {text:'🎵 LET\'S GO!',fn:()=>{if(G.money<100){msg('Ikke nok til merch og drinks!');return false;}G.money-=100;G.charmPts+=3;G.charmTotal+=3;G.smalltalk+=1;advTime(3);msg('VILD koncert! Mødte sjove folk backstage! 🎵🔥');}},
        {text:'🎤 Kun hvis jeg kan stage-dive',fn:()=>{if(Math.random()>.5){G.styrke+=1;G.cardio+=1;G.charmPts+=2;G.charmTotal+=2;msg('STAGE DIVE! Crowd caught you! LEGENDARISK! 🤘');}else{G.currentHP=Math.max(1,(G.currentHP>0?G.currentHP:G.maxHP)-15);S.bad();msg('Ingen fangede dig... direkte på gulvet 😵');}}},
        {text:'🛋️ Ork, træt',fn:()=>{msg('{name}: "Du er SÅ kedelig..." 😒');}},
    ]},
    {text:'💀 {name}: "Bro... der er en KÆMPE edderkop i min lejlighed!"',choices:[
        {text:'🕷️ Jeg tager den!',fn:()=>{G.styrke+=1;G.reflex+=2;msg('Du fangede den med bare hænder! RESPEKT! 🕷️💪');}},
        {text:'🔥 Brænd lejligheden ned',fn:()=>{S.bad();msg('Overdrevet. Brandvæsnet er sur. Men edderkoppen er død. 🔥');}},
        {text:'😱 HELL NO',fn:()=>{msg('{name}: "...du er bange for en edderkop? Bro..." 😤');}},
    ]},
    {text:'{name}: "Bro, der er et poker-game i kælderen. High stakes!"',choices:[
        {text:'🃏 All in!',fn:()=>{if(G.money<150){msg('Minimum buy-in er 150 kr!');return false;}if(G.smalltalk>=4||Math.random()>.5){G.money+=300;msg('DU BLUFFEDE DEM ALLE! +300 KR! 🃏💰');}else{G.money-=150;S.bad();msg('Tabt alt... -150 kr 😤');}}},
        {text:'👀 Bare observér',fn:()=>{G.smalltalk+=1;G.reflex+=1;msg('Du lærte noget om at læse folk. Nyttigt!');}},
        {text:'❌ Gambling er dumt',fn:()=>{msg('{name}: "Fair nok... chicken." 🐔');}},
    ]},
    {text:'{name}: "Yo! En celebrity er spottet i byen! Kom med!"',choices:[
        {text:'📸 SELFIE TIME!',fn:()=>{G.charmPts+=3;G.charmTotal+=3;advTime(1);msg('Selfie med en CELEBRITY! Instagram eksploderer! 📸🔥');}},
        {text:'😎 Spil det cool',fn:()=>{if(Math.random()>.5){G.charmPts+=5;G.charmTotal+=5;msg('De inviterede DIG til VIP! Du er den nye hot ting! 😎');}else{msg('De gik... du spillede det FOR cool 😅');};}},
        {text:'🤷 Hvem er det?',fn:()=>{msg('{name}: "Du lever under en sten bro..." 🪨');}},
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
            if(rewards.length>0){document.getElementById('ev-text').textContent=rewards.join(' | ');sparkleEffect(innerWidth/2,innerHeight/2,'#ffbe0b');screenShake(3,150);}
            setTimeout(()=>{document.getElementById('event-ov').classList.remove('active');G.scene='map';},2500);
        };
        ch.appendChild(b);
    });
    document.getElementById('event-ov').classList.add('active');
}

// ===== COMBAT =====
const girlsByRound=[
    [{name:"Sofie",icon:"👩‍🦰",rating:5,abilities:['Øjenrulle'],attacks:["Du er ikke min type lol","Ew hvem inviterede dig?","Haha cute... men nej 💀","*ruller med øjnene*","Prøvede du lige at wink? Det lignede et tic","Jeg har set bedre pick-up lines på Reddit","Min veninde siger du ligner hendes onkel","*griner med veninderne og peger*","Du prøver SÅ hårdt, det er pinligt","Hmm... nej. Next.","Er det her en dare fra dine venner?","*tager en stor slurk af sin drink*","Okay wow. Det var IKKE det right move.","Du minder mig om en fyr jeg ghostede","Mine standarder er højere end dine ambitioner","*sender snap af dig til 'cringe' gruppen*","Jeg har afvist pænere i Netto","Selv bartendren har ondt af dig","*griner så højt at hele klubben kigger*","Prøv igen... i dit næste liv"],win:"Sofie giver sit nummer! 📱",lose:"'Nice try...' Hun vender sig."}],
    [{name:"Nadia",icon:"💃",rating:6,abilities:['Gab','Ignorér'],attacks:["Du danser som min farfar 💀","Er det DIT bedste?","Min ex var sjovere","*gaber højlydt*","Jeg har set bedre moves til en begravelse","*checker naglelak midt i din replik*","Sorry, sagde du noget? Jeg lyttede ikke","Har du overvejet at IKKE danse?","Det der var så akavet, jeg fik gåsehud","*danser circles around dig*","Du har energien af en våd karklud","Aww du prøver. Det er det sørgelige.","Min lille søster har bedre moves","*vender ryggen til og danser videre*","Du bevæger dig som en robot med lavt batteri","*laver en TikTok-dans og du er IKKE med*","Din footwork er en krigsforbrydelse","Har du overvejet yoga? Det er mere dit tempo","*gaber midt i din bedste move*","Selv gulvet har mere rytme end dig"],win:"Nadia: 'Vi danser hele natten!' 🎶",lose:"Friendzoned."}],
    [{name:"Jasmin",icon:"👸",rating:8,abilities:['Gucci Shame','Security Call'],attacks:["Kender du Gucci fra Zara?","Du LUGTER af Netto 🤢","Sikkerhed? Remove this.","*sender billede til veninderne*","Er det et Shein-outfit? Bro...","Mine øreringe koster mere end din husleje","*tager en selfie og cropper dig ud*","Ej, stod du i kø til VIP? Cute.","Security kender mig by name. Watch it.","Du er ikke på gæstelisten over mit liv","Min chauffør er sjovere end dig","*kigger dig op og ned* ...nej.","Prøver du at imponere MIG? Med DET?","Har du nogensinde set indersiden af en Gucci-butik?","Min Birkin bag har mere værdi end dit liv","*ringer til sin personlige shopper foran dig*","VIP er for Very Important People. Du er VP.","Skat, jeg taler kun med folk der har blue check","*vinker sin bodyguard over*","Selv min hundepasser klæder sig bedre"],win:"'Du er anderledes...' 💎",lose:"Vagten eskorterer dig ud."}],
    [{name:"Isabella",icon:"👑",rating:10,abilities:['DM Flex','Chihuahua Attack','Hele Klubben Griner'],attacks:["Min DM er fyldt med bedre","Du er nummer INGENTING 💀","Min chihuahua har mere game","*hele klubben griner*","Jeg har afvist kendisser, du er INGEN","Min Instagram har flere følgere end din by","*hendes bodyguard tager et skridt fremad*","Du taler til den forkerte person, skat","Ej vent... 😂 du er SERIØS?! 😂😂","Min sidste date havde en yacht. Hvad har du?","*sender voice note til veninderne om dig*","Du giver main character energy... i en tragedy","Selv min bartender har bedre game","*kigger igennem dig som du er luft*","Cute. Men jeg dater kun op, aldrig ned.","Har du prøvet Tinder? Det er mere dit niveau.","Min privatjet venter. Du tager bus.","*hendes chihuahua bider dig i anklen*","Du er som et dating show... men du er deltageren der ryger i uge 1","Min manicure koster mere end din månedsløn","*tager sin krone af og slår dig med den*","Jeg er dronningen. Du er ikke engang en bonde i skak."],win:"HELE KLUBBEN SER DET!\nHANZI ER #1 IGEN! 👑🔥",lose:"'Tæt på... men nej.'"}],
    [{name:"Freya",icon:"🔮",rating:11,abilities:['Mystic Aura','Mind Games','Fortune Curse'],attacks:["Jeg vidste du ville prøve. Stjernerne sagde det.","*hendes øjne lyser i mørket*","Du er en Stenbuk. Det ville ALDRIG virke.","Min aura er for stærk til dig","*kaster en krystal mod dig*","Merkur er retrograd. Gå hjem.","Jeg læste dine tarotkort... de sagde 'nej'","*hvisker noget på latin og du føler dig svimmel*","Dit chakra er HELT forkert aligned","Mine krystaller vibrerer af cringe","*hendes tredje øje dømmer dig*","Jeg manifesterede allerede min soulmate. Det er IKKE dig.","*brænder salvie og vifter dig væk*","Du har energien af en sprukken krystal","Min spirituelle guide siger du er en 2","*laver en hex-gestus* Held og lykke med DÉT","Du er som en horoskop-app... upålidelig og generisk","Min coven ville ALDRIG acceptere dig"],win:"Freya: 'Stjernerne har talt... du er den udvalgte.' 🔮✨",lose:"'Universet siger nej. Og jeg også.'"}],
    [{name:"Victoria",icon:"💎",rating:11,abilities:['Diamond Shield','VIP Ejection','Model Walk'],attacks:["Jeg er bogstaveligt talt en model. Du er... hvad?","*hendes heels er højere end din selvtillid*","Security kender mig. De kender IKKE dig.","Min agent ringer. Du er ikke vigtig nok til at vente.","*tager en selfie der er bedre end dit profilbillede*","Jeg har gået runway i Milano. Du går til Netto.","Selv mine øjenvipper er dyrere end dit outfit","*vinker til sin chauffør*","Min venteliste er længere end din levetid","Du er ikke engang god nok til min B-liste","*kigger på sit Cartier-ur* Spild af min tid.","Jeg datede en prins. Bogstaveligt. En PRINS.","*hendes diamant-øreringe blinder dig*","Du prøver at punch above your weight. WAY above.","Min hund har sin egen Instagram med 2M følgere","Kan du overhovedet stave til Louboutin?","*modellen ved siden af hende griner også*","Selv min stylist ville afvise dig"],win:"Victoria: 'Du er den første der imponerer mig i ÅR.' 💎👑",lose:"'Min agent booker mig ud. Permanent.'"}],
    [{name:"Aleksandra",icon:"🌹",rating:12,abilities:['Heartbreaker','Dance Battle Supreme','Crowd Control','Kiss of Death'],attacks:["Jeg har knust hjerter i 15 lande. Du er nummer HVAD?","*hele rummet stopper og kigger på hende*","Min ex var en rockstjerne. Du er en ringtone.","*danser så godt at DU føler dig akavet bare ved at SE*","Jeg har afvist mere talent end du nogensinde vil have","*sender en drink TILBAGE til bartenderen* Ikke godt nok.","Folk betaler for at stå i min nærhed. Du prøver gratis.","Min skønhed er et våben. Og du er ubevæbnet.","*hvisker noget til DJen og din yndlingssang stopper*","Jeg er grunden til at folk har trust issues","*kaster et blik der kunne smelte is og knuse drømme*","Du minder mig om en fyr jeg glemte eksisterede","Selv mine fjender indrømmer jeg er smuk","*hendes røde læber smiler, men øjnene dømmer*","Jeg er legenden de andre piger advarer dig om","Min silhuet har sin egen Wikipedia-side","*klapper langsomt* Adorable forsøg. Næste.","Du er som et skib der sejler mod en isbjerg. Og JEG er isbjerget.","*tager en rose og river kronbladene af én for én*","Min næste date er i Dubai. Din er i Bilka-parkeringen."],win:"Aleksandra taber rosen...\n'Ingen har nogensinde...' 🌹\nHANZI LAD - UOVERVINDELIG! 👑🔥🔥🔥",lose:"'Du var tæt på at være noget. Tæt på.'"}]
];

const flexAbilities=[
    {id:'heal',name:'HEALING',icon:'💚',desc:'Gendan 45% HP',cost:0,unlocked:false,
     fn:()=>{ const heal=Math.min(Math.floor(C.hMax*.45),C.hMax-C.hHP); C.hHP=Math.min(C.hMax,C.hHP+heal); S.heal(); cSpeech('MEGA HEAL! +'+heal+' HP 💚💚💚'); cAct('+'+heal+' HP','#00d4aa'); sparkleEffect(innerWidth/2,innerHeight/2,'#00d4aa');screenShake(4,200); updC(); setTimeout(showCMenu,2500); }},
    {id:'rage',name:'RAGE MODE',icon:'🔥',desc:'3x skade i 5 ture!',cost:0,unlocked:false,
     fn:()=>{ C.rageBuff=5; S.perf(); cSpeech('RAGE MODE AKTIVERET! 🔥🔥🔥 3x skade i 5 ture!'); cAct('RAGE!','#ff006e'); screenShake(8,400);bigTextFlash('RAGE!','#ff006e');sparkleEffect(innerWidth/2,innerHeight/2,'#ff006e'); updC(); setTimeout(showCMenu,2500); }},
    {id:'focus',name:'LASER FOCUS',icon:'🎯',desc:'100% hit + 50% ekstra skade i 4 ture',cost:0,unlocked:false,
     fn:()=>{ C.focusBuff=4; C.dmgBuff=Math.max(C.dmgBuff,3); S.ok(); cSpeech('LASER FOCUS! 🎯 100% hit + 50% bonusskade i 4 ture!'); cAct('FOCUS!','#3b82f6'); sparkleEffect(innerWidth/2,innerHeight/2,'#3b82f6');bigTextFlash('FOCUS!','#3b82f6'); updC(); setTimeout(showCMenu,2500); }},
    {id:'drain',name:'SOUL DRAIN',icon:'👻',desc:'30% skade + svækker fjende 5 ture',cost:0,unlocked:false,
     fn:()=>{ const drain=Math.round(C.gMax*.3); C.gHP=Math.max(0,C.gHP-drain); C.enemyDebuff=(C.enemyDebuff||0)+5; S.hit(); cSpeech('SOUL DRAIN! 👻 -'+drain+' HP + fjende svækket 5 ture!'); cAct('-'+drain,'#8b5cf6'); screenShake(6,300);sparkleEffect(innerWidth/2,innerHeight/2,'#8b5cf6');bigTextFlash('DRAIN!','#8b5cf6'); updC(); if(!chkEnd()) setTimeout(()=>eTurn(),2500); }},
    {id:'reflect',name:'SPEJLSKJOLD',icon:'🪞',desc:'Reflekter 80% skade i 4 ture',cost:0,unlocked:false,
     fn:()=>{ C.reflectBuff=4; S.ok(); cSpeech('MEGA SPEJLSKJOLD! 🪞 80% af modtaget skade reflekteres i 4 ture!'); cAct('REFLECT!','#ffbe0b'); sparkleEffect(innerWidth/2,innerHeight/2,'#ffbe0b');bigTextFlash('SHIELD!','#ffbe0b');screenShake(4,200); updC(); setTimeout(showCMenu,2500); }},
    {id:'charm_bomb',name:'CHARM BOMB',icon:'💣',desc:'Fjende -70% ATK i 3 ture + 15% skade',cost:0,unlocked:false,
     fn:()=>{ const boom=Math.round(C.gMax*.15); C.gHP=Math.max(0,C.gHP-boom); C.enemyDebuff=(C.enemyDebuff||0)+3; S.perf(); cSpeech('CHARM BOMB! 💣💥 -'+boom+' HP + fjende svækket MASSIVT!'); cAct('BOOM! -'+boom,'#e040fb'); screenShake(10,500);bigTextFlash('BOOM!','#e040fb');sparkleEffect(innerWidth/2,innerHeight/2,'#e040fb'); updC(); if(!chkEnd()) setTimeout(()=>eTurn(),2500); }},
];
function getGirlImg(girl){
    if(!girl)return null;
    if(girl.name&&girl.name.includes('Valentina'))return charImgs.valentina;
    if(girl.name==='Aleksandra')return charImgs.girl_boss;
    const r=girl.rating||1;
    if(r>=12)return charImgs.girl_12;
    if(r>=11)return charImgs.girl_11;
    if(r>=10)return charImgs.girl_10;
    if(r>=9)return charImgs.girl_9;
    if(r>=8)return charImgs.girl_8;
    if(r>=7)return charImgs.girl_7;
    if(r>=6)return charImgs.girl_6;
    if(r>=5)return charImgs.girl_5;
    if(r>=4)return charImgs.girl_4;
    if(r>=3)return charImgs.girl_3;
    if(r>=2)return charImgs.girl_2;
    return charImgs.girl_1;
}
let C={girl:null,hHP:0,hMax:0,hMP:0,hMMax:0,gHP:0,gMax:0,phase:'menu',shield:0,blockBuff:0,dmgBuff:0,enemyDebuff:0,poison:0,confused:0,ally:null,isBoss:false,turnCount:0,specialUsed:false};
let combatAF=null;

function startCombatWithGirl(girl,keepMusic){
    G.scene='combat';G.walking=false;if(!keepMusic)Mus.play('fight');
    document.querySelectorAll('.ov,.wheel-ov,.event-ov').forEach(o=>o.classList.remove('active'));
    if(!girl.hp)girl=makeScaledGirl(girl);
    C.girl=girl;
    C.hMax=G.maxHP;if(G.currentHP<0)G.currentHP=C.hMax;C.hHP=Math.min(G.currentHP,C.hMax);C.hMMax=G.maxMP;C.hMP=C.hMMax;
    C.gMax=C.girl.hp;C.gHP=C.gMax;C.phase='menu';C.shield=0;C.blockBuff=0;C.dmgBuff=0;C.enemyDebuff=0;C.poison=0;C.confused=0;C.ally=null;C.isBodega=false;C.isBoss=false;C.rageBuff=0;C.focusBuff=0;C.reflectBuff=0;C.turnCount=0;C.specialUsed=false;
    document.getElementById('combat-ui').classList.add('active');
    rsz();startCombatBg();updC();
    zoomIn(document.getElementById('combat-ui'),600);
    cSpeech(C.girl.icon+' '+C.girl.name+' ('+C.girl.rating+'/10) dukker op! 💃');
    maybeJoke(combatJokes);
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
        const hImg=charImgs.hanzi;
        if(hImg&&hImg.complete&&hImg.naturalWidth>0){
            const hb=Math.sin(t*3)*2,hsz=Math.min(60,W*.12);
            cx2.drawImage(hImg,W*.25-hsz/2,H*.42+hb,hsz,hsz*1.2);
        }else{drawNPC(cx2,W*.25,H*.55,'leth',t);}
        // Ally (next to Hanzi)
        if(C.ally){drawNPC(cx2,W*.12,H*.6,C.ally.type,t);cx2.font="bold 6px 'Press Start 2P'";cx2.textAlign='center';cx2.fillStyle='#a855f7';cx2.fillText(C.ally.name,W*.12,H*.6+25);}
        // Girl (right side)
        if(C.girl){
            const gImg=getGirlImg(C.girl);
            const gb=Math.sin(t*3)*2;
            if(gImg&&gImg.complete&&gImg.naturalWidth>0){
                const gsz=Math.min(60,W*.12);
                cx2.drawImage(gImg,W*.75-gsz/2,H*.38+gb,gsz,gsz*1.2);
            }else{
                cx2.save();cx2.translate(W*.75,H*.5);
                cx2.fillStyle='#f0c8a0';cx2.beginPath();cx2.arc(0,-18+gb,8,0,Math.PI*2);cx2.fill();
                cx2.fillStyle='#a0522d';cx2.beginPath();cx2.arc(0,-23+gb,9,Math.PI,.1);cx2.fill();
                cx2.fillStyle='#ff006e';cx2.fillRect(-7,-10+gb,14,18);
                cx2.fillStyle='#f0c8a0';cx2.fillRect(-4,8+gb,3,10);cx2.fillRect(1,8+gb,3,10);
                cx2.restore();
            }
        }
        combatAF=requestAnimationFrame(drawCBg);
    })();
}

function updC(){
    let hBuf='';
    if(C.blockBuff>0)hBuf+='🛡️x'+C.blockBuff+' ';
    if(C.shield>0)hBuf+='🛡️'+C.shield+' ';
    if(C.dmgBuff>0)hBuf+='⚔️x'+C.dmgBuff+' ';
    if(C.rageBuff>0)hBuf+='🔥x'+C.rageBuff+' ';
    if(C.focusBuff>0)hBuf+='🎯x'+C.focusBuff+' ';
    if(C.reflectBuff>0)hBuf+='🪞x'+C.reflectBuff+' ';
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
     {name:'DANS',icon:'🕺',desc:'90% · 2 MP',color:'#ff006e',mp:2,act:()=>doAtk('dans',90,2,G.dmg,'Hanzi: "Watch this move!" 🕺')},
     {name:'ORMEN',icon:'🐛',desc:'50% · 2 MP · 1.8x',color:'#ff6b35',mp:2,act:()=>doAtk('orm',50,2,Math.floor(G.dmg*1.8),'Hanzi: "ORMEN! 🐛🔥"')},
     {name:'TBH DANS',icon:'🔥',desc:'15% · 4 MP · MEGA',color:'#ffbe0b',mp:4,act:()=>doTBH()},
     {name:'PICKUP LINE',icon:'🗣️',desc:'Taktik · 3 MP',color:'#3b82f6',mp:3,act:showPickupMenu},
     {name:'TILKALD VEN',icon:'📞',desc:'Kald hjælp · 3 MP',color:'#a855f7',mp:3,act:doCallAlly},
     {name:'OPKAST',icon:'🤮',desc:'+7 MP',color:'#00d4aa',mp:0,act:doOpkast},
     {name:'ITEMS',icon:'🎒',desc:'Brug items',color:'#8b5cf6',mp:0,act:showCItems}
    ];
    moves.forEach(mv=>{
        const b=document.createElement('button');b.className='cbtn';b.style.borderColor=mv.color;b.style.color=mv.color;
        if(mv.mp>C.hMP){b.style.opacity='.25';b.style.pointerEvents='none';}
        b.innerHTML=`<span class="ci">${mv.icon}</span>${mv.name}<span class="cc">${mv.desc}</span>`;
        b.onclick=mv.act;m.appendChild(b);
    });
    if(C.turnCount>=3&&!C.specialUsed){
        const specials=[
            {name:'SUPERNOVA',icon:'💥',desc:'MEGA skade',color:'#ff006e',
             fn:()=>{C.specialUsed=true;const dmg=Math.floor(C.gMax*.5);C.gHP=Math.max(0,C.gHP-dmg);S.perf();cAct('💥 SUPERNOVA! -'+dmg,'#ff006e');cSpeech('SUPERNOVA! 💥 Hanzi eksploderer med energi! -'+dmg+' skade!');screenShake(12,500);critFlash();bigTextFlash('SUPERNOVA!','#ff006e');sparkleEffect(innerWidth/2,innerHeight/2,'#ff006e');sparkleEffect(innerWidth*.3,innerHeight*.4,'#ffbe0b');sparkleEffect(innerWidth*.7,innerHeight*.4,'#ffbe0b');updC();if(!chkEnd())setTimeout(eTurn,2500);}},
            {name:'TIDSSTOP',icon:'⏳',desc:'3x tur + buff',color:'#3b82f6',
             fn:()=>{C.specialUsed=true;C.dmgBuff=Math.max(C.dmgBuff,5);C.focusBuff=Math.max(C.focusBuff,3);C.blockBuff=Math.max(C.blockBuff,3);S.perf();cAct('⏳ TIDSSTOP!','#3b82f6');cSpeech('TIDEN STOPPER! ⏳ +5 skadebuff, +3 fokus, +3 blok! Alt på én gang!');screenShake(6,300);bigTextFlash('TIDSSTOP!','#3b82f6');sparkleEffect(innerWidth/2,innerHeight/2,'#3b82f6');updC();setTimeout(showCMenu,2500);}},
            {name:'SJÆLETYVERI',icon:'👻',desc:'MEGA skade + stats',color:'#8b5cf6',
             fn:()=>{C.specialUsed=true;const steal=Math.floor(C.gMax*.4);C.gHP=Math.max(0,C.gHP-steal);G.styrke+=3;G.reflex+=3;S.perf();cAct('👻 STJÅLET! -'+steal,'#8b5cf6');cSpeech('SJÆLETYVERI! 👻 -'+steal+' skade + permanent +3 STR & REF!');screenShake(8,400);bigTextFlash('SJÆLETYVERI!','#8b5cf6');sparkleEffect(innerWidth/2,innerHeight/2,'#8b5cf6');sparkleEffect(innerWidth*.4,innerHeight*.3,'#a855f7');updC();if(!chkEnd())setTimeout(eTurn,2500);}},
            {name:'KAOS RULET',icon:'🎰',desc:'Tilfældig SINDSYG effekt',color:'#ffbe0b',
             fn:()=>{C.specialUsed=true;const roll=Math.random();
                if(roll<.15){const dmg=Math.floor(C.gMax*.6);C.gHP=Math.max(0,C.gHP-dmg);S.perf();cAct('🎰 JACKPOT! -'+dmg,'#ffbe0b');cSpeech('KAOS JACKPOT! 🎰💰 60% af fjendens HP VÆLTTET! -'+dmg+'!');}
                else if(roll<.3){C.hHP=C.hMax;C.hMP=C.hMMax;S.perf();cAct('🎰 FULD HEAL!','#00d4aa');cSpeech('KAOS HEAL! 🎰💚 FULD HP og MP restored!');}
                else if(roll<.45){C.rageBuff=5;C.dmgBuff=5;C.focusBuff=5;S.perf();cAct('🎰 MEGA BUFF!','#ff6b35');cSpeech('KAOS BUFF! 🎰🔥 ALLE buffs x5 i 5 ture! DU ER USTOPPELIG!');}
                else if(roll<.6){G.styrke+=5;G.reflex+=5;G.cardio+=5;G.smalltalk+=5;S.perf();cAct('🎰 +5 ALLE STATS!','#e040fb');cSpeech('KAOS STATS! 🎰⚡ +5 til ALLE stats PERMANENT!');}
                else if(roll<.75){C.poison=8;C.enemyDebuff=5;S.perf();cAct('🎰 GIFT+DEBUFF!','#a855f7');cSpeech('KAOS CURSE! 🎰☠️ 8 ture gift + 5 ture debuff på fjenden!');}
                else if(roll<.9){const dmg=Math.floor(C.gMax*.35);C.gHP=Math.max(0,C.gHP-dmg);C.reflectBuff=4;S.perf();cAct('🎰 COMBO!','#00d4aa');cSpeech('KAOS COMBO! 🎰✨ -'+dmg+' skade + 4 ture reflect!');}
                else{const selfDmg=Math.floor(C.hMax*.15);C.hHP=Math.max(1,C.hHP-selfDmg);C.rageBuff=8;C.dmgBuff=8;S.hit();cAct('🎰 BERSERKER!','#ff006e');cSpeech('KAOS BERSERKER! 🎰💀 -'+selfDmg+' selvskade MEN 8 ture DOBBELT RAGE!');}
                screenShake(10,400);bigTextFlash('KAOS!','#ffbe0b');sparkleEffect(innerWidth/2,innerHeight/2,'#ffbe0b');sparkleEffect(innerWidth*.3,innerHeight*.5,'#e040fb');sparkleEffect(innerWidth*.7,innerHeight*.5,'#ff006e');
                updC();if(!chkEnd())setTimeout(eTurn,2500);}}
        ];
        const spec=specials[Math.floor(Math.random()*specials.length)];
        const sb=document.createElement('button');sb.className='cbtn';
        sb.style.borderColor=spec.color;sb.style.color=spec.color;
        sb.style.background='rgba(255,255,255,.08)';sb.style.animation='pulse 1s infinite';
        sb.innerHTML=`<span class="ci">${spec.icon}</span>⚡ ${spec.name}<span class="cc">${spec.desc}</span>`;
        sb.onclick=()=>{S.click();document.getElementById('c-menu').style.display='none';spec.fn();};
        m.appendChild(sb);
    }
    const unlockedFlex=flexAbilities.filter(a=>a.unlocked);
    if(unlockedFlex.length>0){
        unlockedFlex.forEach(ab=>{
            const b=document.createElement('button');b.className='cbtn';b.style.borderColor='#e040fb';b.style.color='#e040fb';
            b.innerHTML=`<span class="ci">${ab.icon}</span>${ab.name}<span class="cc">${ab.desc}</span>`;
            b.onclick=()=>{S.click();document.getElementById('c-menu').style.display='none';ab.fn();};
            m.appendChild(b);
        });
    }
}

function showPickupMenu(){
    S.click();document.getElementById('c-menu').style.display='none';
    const m=document.getElementById('c-menu');m.style.display='grid';m.innerHTML='';
    const lines=[
     {name:'SKJOLD',icon:'🛡️',desc:'Halver skade 4 ture · 2 MP',color:'#3b82f6',act:()=>{if(C.hMP<2){msg('Ikke nok MP!');S.bad();showCMenu();return;}m.style.display='none';C.hMP=Math.max(0,C.hMP-2);C.blockBuff=4;S.ok();cAct('🛡️ SKJOLD!','#3b82f6');cSpeech('"Du rammer mig ikke!" Halv skade i 4 ture!');sparkleEffect(innerWidth/2,innerHeight/2,'#3b82f6');updC();setTimeout(eTurn,2200);}},
     {name:'HYPE',icon:'⚔️',desc:'+100% skade 4 ture · 2 MP',color:'#ff6b35',act:()=>{if(C.hMP<2){msg('Ikke nok MP!');S.bad();showCMenu();return;}m.style.display='none';C.hMP=Math.max(0,C.hMP-2);C.dmgBuff=5;S.ok();cAct('⚔️ DMG BUFF!','#ff6b35');cSpeech('"Jeg er UOVERVINDELIG!" +100% skade i 4 ture!');screenShake(4,200);updC();setTimeout(eTurn,2200);}},
     {name:'DISS',icon:'😏',desc:'-50% fjendens skade 4 ture · 2 MP',color:'#00d4aa',act:()=>{if(C.hMP<2){msg('Ikke nok MP!');S.bad();showCMenu();return;}m.style.display='none';C.hMP=Math.max(0,C.hMP-2);C.enemyDebuff=5;S.ok();cAct('😏 DEBUFF!','#00d4aa');cSpeech('"Din mascara løber!" -50% skade i 4 ture!');updC();setTimeout(eTurn,2200);}},
     {name:'GIFT',icon:'☠️',desc:'10% HP/tur i 6 ture · 2 MP',color:'#a855f7',act:()=>{if(C.hMP<2){msg('Ikke nok MP!');S.bad();showCMenu();return;}m.style.display='none';C.hMP=Math.max(0,C.hMP-2);C.poison=6;S.ok();cAct('☠️ FORGIFTET!','#a855f7');cSpeech('"Den drink var... speciel" ☠️ Gift i 6 ture!');poisonDrip('girl');updC();setTimeout(eTurn,2200);}},
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
    C.hMP=Math.max(0,C.hMP-3);
    if(Math.random()>.5){
        S.bad();cAct('📞 INGEN SVAR!','#ff006e');
        cSpeech('Ingen tager telefonen... du er alene! 📵');
        updC();setTimeout(eTurn,2500);return;
    }
    const roll=Math.random();
    if(roll<.3){C.ally={name:'Gulle',turnsLeft:99,type:'gulle',scale:.06};S.ok();cAct('📞 GULLE!','#8b5cf6');cSpeech('Gulle dukker op! "Yo bro, jeg er her HELE kampen!" 🍺');}
    else if(roll<.7){C.ally={name:'Ritardo',turnsLeft:99,type:'ritardo',scale:.10};S.ok();cAct('📞 RITARDO!','#059669');cSpeech('Ritardo er her! "Jeg har styr på det hele vejen!" 💼');}
    else{C.ally={name:'LETH',turnsLeft:99,type:'leth',scale:.15};S.perf();cAct('📞 LETH! 💪','#dc2626');cSpeech('LETH stormer ind! "BRO JEG BLIVER TIL VI VINDER!" 🔥💪');}
    updC();setTimeout(eTurn,2500);
}

function doOpkast(){
    S.click();document.getElementById('c-menu').style.display='none';
    const restore=7;
    C.hMP=Math.min(C.hMMax,C.hMP+restore);
    S.ok();cAct('🤮 +'+restore+' MP','#00d4aa');
    cSpeech('Hanzi kaster op taktisk... +'+restore+' MP! 🤮');
    updC();setTimeout(eTurn,2200);
}

function doTBH(){
    S.click();document.getElementById('c-menu').style.display='none';
    C.hMP=Math.max(0,C.hMP-4);updC();
    const hitChance=15+Math.floor(G.reflex*.8);
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
        },true),1200);
    },1500);
}

function showCItems(){
    S.click();document.getElementById('c-menu').style.display='none';
    const it=document.getElementById('c-items');it.style.display='flex';it.innerHTML='';
    const cnt=k=>G.inv.filter(i=>i===k).length;
    [{n:'Drink',i:'🍹',k:'drink',c:cnt('drink'),fn:()=>{G.inv.splice(G.inv.indexOf('drink'),1);const d=12+G.styrke*2;C.gHP=Math.max(0,C.gHP-d);S.ok();cAct('🍹 -'+d,'#ffbe0b');cSpeech('Drink kastet! -'+d+' HP! 💥');floatingDmg('-'+d,'#ffbe0b','girl');updC();chkEnd()||setTimeout(eTurn,2200);}},
     {n:'Energy',i:'⚡',k:'energy',c:cnt('energy'),fn:()=>{G.inv.splice(G.inv.indexOf('energy'),1);C.hMP=C.hMMax;S.heal();cAct('⚡ FULL MP!','#3b82f6');cSpeech('FULL MP! ⚡');sparkleEffect(innerWidth/2,innerHeight/2,'#3b82f6');updC();setTimeout(showCMenu,1500);}},
     {n:'Heal',i:'🍫',k:'heal',c:cnt('heal'),fn:()=>{G.inv.splice(G.inv.indexOf('heal'),1);const h=Math.min(15,C.hMax-C.hHP);C.hHP+=h;S.heal();cAct('+'+h+' HP','#00d4aa');cSpeech('Proteinbar! +'+h+' HP! 💚');sparkleEffect(innerWidth/2,innerHeight/2,'#00d4aa');updC();setTimeout(showCMenu,1500);}},
     {n:'Røgbombe',i:'💨',k:'smoke',c:cnt('smoke'),fn:()=>{G.inv.splice(G.inv.indexOf('smoke'),1);const h=Math.min(8,C.hMax-C.hHP);C.hHP+=h;S.ok();cAct('💨 RØGBOMBE!','#888');cSpeech('Røgbombe! Skip tur + heal! 💨');updC();showCMenu();}},
     {n:'Steroider',i:'💊',k:'steroid',c:cnt('steroid'),fn:()=>{G.inv.splice(G.inv.indexOf('steroid'),1);C.dmgBuff=(C.dmgBuff||0)+4;S.perf();cAct('💊 STEROID!','#ff006e');cSpeech('+80% skade i 4 ture! BEAST! 💪🔥');screenShake(4,200);updC();setTimeout(showCMenu,1500);}},
     {n:'Skjold',i:'🛡️',k:'shield',c:cnt('shield'),fn:()=>{G.inv.splice(G.inv.indexOf('shield'),1);C.shield=(C.shield||0)+Math.floor(C.hMax*.35);S.heal();cAct('🛡️ MEGA SKJOLD!','#3b82f6');cSpeech('Mega skjold! '+Math.floor(C.hMax*.35)+' absorption! 🛡️');sparkleEffect(innerWidth/2,innerHeight/2,'#3b82f6');updC();setTimeout(showCMenu,1500);}},
     {n:'Adrenalin',i:'💉',k:'adrenalin',c:cnt('adrenalin'),fn:()=>{G.inv.splice(G.inv.indexOf('adrenalin'),1);C.hMP=C.hMMax;C.dmgBuff=Math.max(C.dmgBuff,2);S.perf();cAct('💉 PUMPED!','#8b5cf6');cSpeech('Full MP + bonus skade! 💉🔥');screenShake(4,200);sparkleEffect(innerWidth/2,innerHeight/2,'#8b5cf6');updC();setTimeout(showCMenu,1500);}}
    ].forEach(x=>{const b=document.createElement('button');b.className='citem'+(x.c<=0?' dis':'');b.textContent=x.i+' '+x.n+'('+x.c+')';b.onclick=()=>{if(x.c<=0)return;it.style.display='none';x.fn();};it.appendChild(b);});
    const back=document.createElement('button');back.className='citem';back.textContent='← TILBAGE';back.onclick=()=>{S.click();showCMenu();};it.appendChild(back);
}

function doAtk(type,hitPct,mpCost,base,speech){
    S.click();document.getElementById('c-menu').style.display='none';
    C.hMP=Math.max(0,C.hMP-mpCost);
    if(C.dmgBuff>0)base=Math.floor(base*1.8);
    if(C.rageBuff>0)base=Math.floor(base*3);
    if(C.focusBuff>0)hitPct=100;
    hitPct=Math.min(100,hitPct+G.hitBonus);
    if(C.confused>0){hitPct=Math.max(10,hitPct-10);C.confused--;}
    // Crit check
    let isCrit=false;
    if(Math.random()*100<G.critChance){isCrit=true;base=Math.floor(base*G.critDmg/100);}
    C.pendingCrit=isCrit;
    cSpeech(speech);updC();
    if(Math.random()*100>hitPct){
        setTimeout(()=>{S.bad();cAct('MISS! ('+hitPct+'%)','#ff006e');cSpeech('Misset! Bedre held næste gang!');screenShake(3,150);floatingDmg('MISS!','#ff006e','hanzi');updC();chkEnd()||setTimeout(eTurn,2500);},1500);
        return;
    }
    setTimeout(()=>{
        cSpeech('MINI-GAME! Bestem din skade! 🎮');
        setTimeout(()=>runMiniGame(q=>{
            let mult=q==='perfect'?1.8:q==='good'?1.3:q==='ok'?1:.6;
            if(G.perks.berserker&&type==='orm')mult*=1.5;
            let dmg=Math.max(1,Math.floor(base*mult));
            C.gHP=Math.max(0,C.gHP-dmg);
            const cc=document.getElementById('c-cv');
            combatSlash(cc.width*.75,cc.height*.5,C.pendingCrit?'#ffbe0b':'#ff006e');
            combatFlash(C.pendingCrit?'#ffbe0b':'#ff006e','girl');
            if(q==='perfect'||C.pendingCrit)combatParticles(cc.width*.75,cc.height*.5,C.pendingCrit?'#ffbe0b':'#00d4aa',12);
            if(C.pendingCrit){S.perf();cAct('💥 CRIT! -'+dmg,'#ffbe0b');critFlash();screenShake(8,300);floatingDmg('-'+dmg+' CRIT!','#ffbe0b','girl');}
            else if(q==='perfect'){S.perf();cAct('PERFEKT! -'+dmg,'#ffbe0b');floatingDmg('-'+dmg,'#ffbe0b','girl');}
            else if(q==='good'){S.ok();cAct('-'+dmg,'#00d4aa');floatingDmg('-'+dmg,'#00d4aa','girl');}
            else{S.click();cAct('-'+dmg,'#aaa');floatingDmg('-'+dmg,'#aaa','girl');}
            updC();chkEnd()||setTimeout(eTurn,2500);
        },true),1000);
    },1500);
}

// ===== COMBAT MINI-GAMES =====
let mgCleanup=null;
function runMiniGame(cb,isAttack){
    const cc=document.getElementById('c-cv'),ctx=cc.getContext('2d');
    const W=cc.width,H=cc.height;
    if(mgCleanup){mgCleanup();mgCleanup=null;}
    cancelAnimationFrame(combatAF);
    const wrappedCb=(q)=>{if(mgCleanup){mgCleanup();mgCleanup=null;}startCombatBg();cb(q);};
    if(isAttack){mgStopBar(ctx,W,H,wrappedCb);}
    else{const defGames=[mgReaction,mgWhack,mgDodge,mgSequence,mgCatch];defGames[Math.floor(Math.random()*defGames.length)](ctx,W,H,wrappedCb);}
}

// MG1: Stop the bar (classic) - red/yellow/green zones
function mgStopBar(ctx,W,H,cb){
    const greenW=10+Math.max(0,G.reflex)*1;
    const yellowW=greenW*1.5;
    const zs=30+Math.random()*20;
    let pos=0,spd=1.5+G.round*.3,active=true;
    cSpeech('Sigt efter GRØN zone! 🎯');
    const failsafe=setTimeout(()=>{if(active){active=false;cleanup();cb('miss');}},8000);
    function draw(){
        if(!active)return;
        ctx.clearRect(0,0,W,H);
        const bY=H*.45,bH=28,bX=W*.1,bW=W*.8;
        ctx.fillStyle='rgba(255,0,50,.25)';ctx.fillRect(bX,bY,bW,bH);
        const ys=Math.max(0,zs-yellowW/2);
        ctx.fillStyle='rgba(255,190,11,.3)';ctx.fillRect(bX+bW*ys/100,bY,bW*(yellowW+greenW)/100,bH);
        ctx.fillStyle='rgba(0,212,170,.4)';ctx.fillRect(bX+bW*zs/100,bY,bW*Math.min(30,greenW)/100,bH);
        const centerX=zs+greenW/2;
        ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(bX+bW*(centerX-.5)/100,bY,bW*1/100,bH);
        ctx.fillStyle='#fff';ctx.fillRect(bX+bW*pos/100,bY,3,bH);
        ctx.shadowColor='#fff';ctx.shadowBlur=8;ctx.fillRect(bX+bW*pos/100,bY,3,bH);ctx.shadowBlur=0;
        ctx.font="bold 6px 'Press Start 2P'";ctx.textAlign='center';
        ctx.fillStyle='#ff006e';ctx.fillText('RØD',bX+bW*.08,bY-4);
        ctx.fillStyle='#ffbe0b';ctx.fillText('GUL',bX+bW*(ys+3)/100,bY-4);
        ctx.fillStyle='#00d4aa';ctx.fillText('GRØN',bX+bW*(zs+greenW/2)/100,bY-4);
        pos+=spd;if(pos>=100||pos<=0)spd*=-1;pos=Math.max(0,Math.min(100,pos));
        requestAnimationFrame(draw);
    }
    const tap=()=>{if(!active)return;active=false;clearTimeout(failsafe);cleanup();
        const inGreen=pos>=zs&&pos<=zs+greenW;
        const yellowStart=Math.max(0,zs-yellowW/2);
        const yellowEnd=zs+greenW+yellowW/2;
        const inYellow=pos>=yellowStart&&pos<=yellowEnd;
        const cd=Math.abs(pos-(zs+greenW/2));
        cb(inGreen&&cd<greenW*.25?'perfect':inGreen?'good':inYellow?'ok':'miss');
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
    let earlyTaps=0;
    const tap=()=>{if(!active)return;
        if(phase==='wait'){earlyTaps++;S.bad();cAct('FOR TIDLIGT! Vent på GRØN!','#ff006e');if(earlyTaps>=3){active=false;clearTimeout(failsafe);cleanup();cb('miss');}return;}
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
    C.turnCount++;
    if(G.regenAmt>0){
        C.hHP=Math.min(C.hMax,C.hHP+G.regenAmt);
        cSpeech('HP Regen! +'+G.regenAmt+' HP 💚');updC();
    }
    // Poison tick
    if(C.poison>0){
        const pdmg=Math.max(3,Math.floor(C.gMax*.10));
        C.gHP=Math.max(0,C.gHP-pdmg);C.poison--;
        cAct('☠️ GIFT -'+pdmg,'#a855f7');poisonDrip('girl');floatingDmg('-'+pdmg+' ☠️','#a855f7','girl');
        cSpeech('Giften virker! -'+pdmg+' HP!'+(C.poison>0?' ('+C.poison+' ture tilbage)':''));
        updC();if(chkEnd())return;
    }
    // Ally effects (disabled in boss fights)
    if(C.ally&&!C.isBoss){
        let allyMsg='';
        const scaleDmg=Math.max(2,Math.floor(C.gMax*C.ally.scale));
        if(C.ally.type==='gulle'){C.gHP=Math.max(0,C.gHP-scaleDmg);allyMsg='Gulle kaster en øl! -'+scaleDmg+' HP! 🍺';}
        else if(C.ally.type==='ritardo'){if(Math.random()>.4){C.gHP=Math.max(0,C.gHP-scaleDmg);allyMsg='Ritardo slår! -'+scaleDmg+' HP!';}else{allyMsg='Ritardo hyper dig op! +morale!';}}
        else if(C.ally.type==='leth'){C.gHP=Math.max(0,C.gHP-scaleDmg);C.enemyDebuff=Math.max(C.enemyDebuff,1);allyMsg='LETH SMADRER! -'+scaleDmg+' HP + debuff! 💪';}
        cAct('📞 '+allyMsg,'#a855f7');updC();if(chkEnd())return;
    }
    // Tick down buffs
    if(C.dmgBuff>0)C.dmgBuff--;
    if(C.enemyDebuff>0)C.enemyDebuff--;
    if(C.blockBuff>0)C.blockBuff--;
    if(C.rageBuff>0)C.rageBuff--;
    if(C.focusBuff>0)C.focusBuff--;
    if(C.reflectBuff>0)C.reflectBuff--;
    const g=C.girl,atk=g.attacks[Math.floor(Math.random()*g.attacks.length)];
    let bossSpecial=null;
    if(C.isBoss&&g.specials){
        if(C.turnCount%3===0){bossSpecial='boltnogle';}
        else if(Math.random()<.25){bossSpecial='masken';}
    }
    const poisonDelay=C.poison>=0?1200:0;
    setTimeout(()=>{
        if(bossSpecial==='boltnogle'){cSpeech('🔧 BOLTNØGLEN! Kalle Mith husker sit håndværk!');cAct('🔧 1.5x!','#ff006e');screenShake(12,500);bigTextFlash('BOLTNØGLE!','#ff006e');}
        else if(bossSpecial==='masken'){cSpeech('🎭 MASKEN! Dit syn sløres...');cAct('🎭 DEBUFF!','#8b5cf6');screenShake(8,400);bigTextFlash('MASKEN!','#8b5cf6');}
        else{cSpeech(g.name+': "'+atk+'"');cAct('💬','#ff006e');}
        const readTime=Math.min(3000,Math.max(1500,atk.length*60+600));
        setTimeout(()=>{
            cSpeech('MINI-GAME! Reducer hendes skade! 🛡️');
            setTimeout(()=>runMiniGame(q=>{
                let red=q==='perfect'?.5:q==='good'?.35:q==='ok'?.2:0;
                if(bossSpecial==='masken'){red=Math.max(0,red-.15);C.confused=(C.confused||0)+2;}
                if(Math.random()*100<G.blockChance){S.ok();cAct('DODGED!','#00d4aa');cSpeech('Hanzi undviger! 🛡️');dodgeEffect();bigTextFlash('DODGE!','#00d4aa');updC();chkEnd()||setTimeout(showCMenu,2000);return;}
                let rawAtk=g.atk;
                if(bossSpecial==='boltnogle')rawAtk=Math.floor(rawAtk*1.5);
                if(C.enemyDebuff>0)rawAtk=Math.floor(rawAtk*.5);
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
                // Reflect buff
                if(C.reflectBuff>0){const reflectDmg=Math.floor(dmg*.8);C.gHP=Math.max(0,C.gHP-reflectDmg);cSpeech('Spejlskjold reflekterer '+reflectDmg+' skade! 🪞');updC();}
                // Girl debuff mechanic (25% chance)
                if(Math.random()<.25){
                    const debuffRoll=Math.random();
                    if(debuffRoll<.33&&C.dmgBuff>0){C.dmgBuff=Math.max(0,C.dmgBuff-1);cSpeech(g.name+' fjerner din buff! -1 dmgBuff');}
                    else if(debuffRoll<.66){const heal=Math.max(1,Math.floor(C.gMax*.1));C.gHP=Math.min(C.gMax,C.gHP+heal);cSpeech(g.name+' healer sig selv! +'+heal+' HP');}
                    else{C.confused=(C.confused||0)+1;cSpeech(g.name+' forvirrer dig! -10% hit chance!');}
                }
                if(q==='perfect'){cAct('HALVERET! -'+dmg,'#00d4aa');if(!C.shield)cSpeech('Max block! Kun -'+dmg+'!');}
                else if(q==='good'){S.click();cAct('-'+dmg,'#3b82f6');}
                else{S.hit();screenShake(6,250);hitFlash();floatingDmg('-'+dmg,'#ff006e','hanzi');cAct('-'+dmg+' OUCH!','#ff006e');
                    const cc2=document.getElementById('c-cv');combatFlash('#ff006e','hanzi');combatParticles(cc2.width*.25,cc2.height*.55,'#ff006e',8);}
                updC();chkEnd()||setTimeout(showCMenu,2000);
            },false),800);
        },readTime);
    },poisonDelay);
}

function combatFlash(color,side){
    const el=document.getElementById(side==='hanzi'?'c-hanzi':'c-girl');
    el.style.animation='shake .3s';el.style.boxShadow='0 0 20px '+color;
    setTimeout(()=>{el.style.animation='';el.style.boxShadow='';},400);
}
function combatSlash(x,y,color){
    const cc=document.getElementById('c-cv'),ctx=cc.getContext('2d');
    let f=0;const W=cc.width;
    const draw=()=>{f++;ctx.save();ctx.globalAlpha=1-f/12;
        ctx.strokeStyle=color;ctx.lineWidth=3+Math.random()*2;ctx.shadowColor=color;ctx.shadowBlur=10;
        ctx.beginPath();ctx.moveTo(x-15-f*2,y-15+f);ctx.lineTo(x+15+f*2,y+15-f);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+15+f,y-15-f);ctx.lineTo(x-15-f,y+15+f);ctx.stroke();
        ctx.restore();if(f<12)requestAnimationFrame(draw);};draw();
}
function combatParticles(x,y,color,count){
    const cc=document.getElementById('c-cv'),ctx=cc.getContext('2d');
    const parts=[];for(let i=0;i<count;i++)parts.push({x,y,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6-2,life:20+Math.random()*10});
    let f=0;const draw=()=>{f++;ctx.save();
        parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.3;p.life--;
            ctx.globalAlpha=Math.max(0,p.life/30);ctx.fillStyle=color;ctx.fillRect(p.x-2,p.y-2,4,4);});
        ctx.restore();if(f<30&&parts.some(p=>p.life>0))requestAnimationFrame(draw);};draw();
}

function chkEnd(){
    if(C.gHP<=0){C.phase='done';S.perf();if(C.isBodega){G.bodegaWins++;}else{G.girlsMet++;}G.totalScore+=100;
        const gl=C.girl.lvl||1;
        const reward=Math.floor((50+(C.girl.rating||1)*20)*(1+gl*.3));G.money+=reward;
        const charmReward=Math.max(2,Math.floor((C.girl.rating||1)*1.5*gl));
        G.charmPts+=charmReward;G.charmTotal+=charmReward;
        if(gl>=5){float('LVL '+gl+' PIGE SCORET!','#e040fb');}
        const cc=document.getElementById('c-cv');
        combatParticles(cc.width*.75,cc.height*.5,'#ffbe0b',20);
        combatFlash('#ffbe0b','girl');
        screenShake(10,500);bigTextFlash('VICTORY!','#ffbe0b');
        sparkleEffect(innerWidth/2,innerHeight*.3,'#ffbe0b');sparkleEffect(innerWidth*.3,innerHeight*.4,'#ff006e');sparkleEffect(innerWidth*.7,innerHeight*.4,'#00d4aa');
        cSpeech(C.girl.win);cAct('WIN! 🏆','#ffbe0b');
        setTimeout(()=>{cSpeech('BELØNNING: +'+reward+' KR, +'+charmReward+' CHARM! 🎉');updHUD();},2000);
        setTimeout(()=>{document.getElementById('c-menu').innerHTML=`<button class="btn" onclick="leaveCombat()" style="grid-column:span 3">🏆 VICTORY!</button>`;document.getElementById('c-menu').style.display='grid';},4000);return true;}
    if(C.hHP<=0){C.phase='done';cSpeech(C.girl.lose);cAct('REJECTED 💔','#ff006e');S.bad();G.totalScore+=10;
        combatFlash('#ff006e','hanzi');screenShake(12,600);hitFlash('#ff006e');bigTextFlash('REJECTED 💔','#ff006e');
        setTimeout(()=>{document.getElementById('c-menu').innerHTML=`<button class="btn" onclick="leaveCombat()" style="grid-column:span 3">💔 REJECTED...</button>`;document.getElementById('c-menu').style.display='grid';},1500);return true;}
    return false;
}

function leaveCombat(){
    cancelAnimationFrame(combatAF);if(mgCleanup){mgCleanup();mgCleanup=null;}
    document.getElementById('combat-ui').classList.remove('active');
    G.scene='map';Mus.play('map');
    G.currentHP=Math.max(1,C.hHP);
    document.querySelectorAll('.ov,.wheel-ov,.event-ov').forEach(o=>o.classList.remove('active'));
    if(C.isBoss){if(C.gHP<=0){G.beatBoss=true;endGame();return;}updHUD();msg('Leth samler masken op. "Jeg byggede dig én gang, bror." 🎭');return;}
    if(C.isBodega){
        updHUD();flushPendingEvents();msg(C.gHP<=0?'Bodega-pige scoret! 🍺🔥':'Bedre held næste gang på bodegaen!');return;
    }
    G.firstClubDone=true;
    G.round++;G.daysLeft=7;G.day++;G.hour=8;
    bodegaUsedToday=false;G.wheelUsedToday=false;G.eventDoneToday=false;
    foodBoughtToday=0;gamblesToday=0;
    if(G.round>G.maxRounds&&G.girlsMet>=7&&G.mariusTalks>=10){secretBoss();return;}
    if(G.round>G.maxRounds){endGame();return;}
    if(C.gHP<=0){G.lossBuff=false;showVictoryScene();return;}
    else{G.lossBuff=true;updHUD();msg('Træn hårdere! Runde '+G.round+' om 7 dage. 💪 +20% træningsgain næste runde!');}
}

const victoryLines=[
    'Hele klubben EKSPLODERER! 🔥',
    'Hanzi er UOVERVINDELIG! 👑',
    'Byen har en ny LEGENDE! 💪',
    'Gutterne ville være stolte! 🎤',
    'Endnu en pige scoret! Intet stopper dig! 🔥',
    'Drengene ringer allerede! De er VILDE! 📞',
    'Runde KLARET! Næste pige venter... 💃',
];
function showVictoryScene(){
    G.scene='victory';Mus.play('champ');
    const ov=document.createElement('div');ov.id='victory-ov';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(5,5,15,.95);z-index:25;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    const line=victoryLines[Math.min(G.round-2,victoryLines.length-1)];
    ov.innerHTML=`
        <div style="font-size:4rem;margin-bottom:16px;animation:mIn 1s ease">🏆</div>
        <div class="pix" style="font-size:clamp(12px,4vw,22px);color:#ffbe0b;margin-bottom:8px;text-shadow:0 0 20px rgba(255,190,11,.5);animation:mIn 1.2s ease">RUNDE ${G.round-1} KLARET!</div>
        <div class="pix" style="font-size:clamp(8px,2.5vw,14px);color:#ff006e;margin-bottom:6px;animation:mIn 1.5s ease">PIGE ${G.girlsMet}/7 SCORET! 🔥</div>
        <div style="font-size:.7rem;color:#aaa;margin-bottom:20px;text-align:center;line-height:1.6;animation:mIn 1.8s ease">${line}</div>
        <div class="pix" style="font-size:clamp(6px,1.5vw,9px);color:#00d4aa;margin-bottom:24px;animation:mIn 2s ease">Næste runde om 7 dage. Bliv stærkere! 💪</div>
        <button class="btn" style="animation:mIn 2.5s ease" id="victory-cont">FORTSÆT ▶</button>`;
    document.body.appendChild(ov);
    document.getElementById('victory-cont').onclick=()=>{ov.remove();Mus.play('map');G.scene='map';updHUD();flushPendingDay();flushPendingEvents();};
    setTimeout(()=>{if(document.getElementById('victory-ov')){ov.remove();Mus.play('map');G.scene='map';updHUD();flushPendingDay();flushPendingEvents();}},80000);
}

function secretBoss(){
    G.scene='brief';
    briefGirl=makeScaledGirl({name:"Valentina 💋",icon:"💋",rating:13,abilities:['Milano Charme','Hjertets Ild','Skønhedens Forbandelse','Den Sande Test'],
        attacks:["*smiler og hele rummet stopper*","Du tror du er god nok til MIG?","Jeg har ventet 2 år... vis mig det var værd at vente.","*hendes øjne fanger dit blik — du kan ikke se væk*","Kalle Mith troede han ejede mig. Vis mig du er anderledes.","*danser og hele klubben stopper for at se*","Jeg så dig i Royal Arena. Du var MAGISK den aften.","Scor mig hvis du kan, Hanzi... ingen andre har kunnet.","*hvisker noget på italiensk — dit hjerte banker hurtigere*","Hvis du vinder... er jeg din. For altid.","*kaster håret tilbage — du glemmer næsten dit eget navn*","Kom så, vild dreng. Dans med mig. 💃"],
        specials:['boltnogle','masken'],
        win:"Masken rammer gulvet. Anagrammet, bolten, memoet — hele byen ved det nu.\n\nOg Valentina? Hun har ventet 2 år på præcis det her. 👑\n\nDEN ULTIMATIVE SCORE: KALLE MITHS KÆRESTE. 🌹",
        lose:"Leth samler masken op.\n'Jeg byggede dig én gang, bror. Jeg kan smadre dig for evigt.'\n\nValentina kigger væk... men kun næsten."});
    briefStep=0;
    document.getElementById('brief-girl').style.display='none';
    document.getElementById('brief-ov').classList.add('active');
    drawBriefLeth();
    const oldScript=[...briefScript];
    briefScript.length=0;
    briefScript.push(
        ()=>{setBrief('Leth 💪','BRO! Alle 7! Du gjorde det! Der er kun én tilbage over dig...');},
        ()=>{setBrief('Leth 💪','...og han står lige foran dig.');},
        ()=>{setBrief('Leth 💪','*tager masken frem fra tasken*\n\n"Ingen bliver konge uden at bløde for det."\n\nKan du huske hvor du har hørt det?');},
        ()=>{setBrief('Kalle Mith 🎭','KALLE MITH. MIKKEL LETH.\n\nFlyt bogstaverne, bror.\nDet har stået foran dig i 2 år.');},
        ()=>{setBrief('Kalle Mith 🎭','Phil løsnede bolten. Men hvem tror du BETALTE?\nHvem kendte din rute hjem?');},
        ()=>{setBrief('Kalle Mith 🎭','Jeg stod på scenen med mikrofonen da du crashede.\nPerfekt alibi. Perfekt plan.');},
        ()=>{setBrief('Kalle Mith 🎭','Valentina kiggede på DIG den aften. På MIN aften.\n\nSå jeg fjernede dig — og tog hende.');},
        ()=>{setBrief('Kalle Mith 🎭','Og så byggede jeg dig op igen.\nFor at bevise at selv dit BEDSTE ikke er nok.\n\nIngen tager min by. Ingen tager HENDE.');},
        ()=>{
            setBrief('Valentina 💋','*træder frem fra mørket*\n\nJeg har ventet på dig i 2 år, Hanzi.\nVis mig at du er den mand jeg så i Royal Arena.');
            document.getElementById('brief-girl').style.display='block';
            const vImg=charImgs.valentina;
            if(vImg&&vImg.complete&&vImg.naturalWidth>0){
                document.getElementById('bg-icon').innerHTML='<img src="'+vImg.src+'" style="width:48px;height:auto;image-rendering:pixelated">';
            }else{document.getElementById('bg-icon').textContent='💋';}
            document.getElementById('bg-name').textContent='Valentina - Den Ultimative Boss';
            document.getElementById('bg-rating').textContent='⭐⭐⭐⭐⭐⭐⭐ 13/10';
            document.getElementById('bg-stats').innerHTML='❤️ HP: '+briefGirl.hp+' | ⚔️ ATK: '+briefGirl.atk+'\n⚠️ KALLE MITHS KÆRESTE!\n💋 Verdens smukkeste kvinde';
        },
        ()=>{document.getElementById('brief-ov').classList.remove('active');briefScript.length=0;briefScript.push(...oldScript);startCombatWithGirl(briefGirl);C.isBoss=true;}
    );
    advBrief();
}

// ===== END =====
function endGame(){
    G.scene='end';Mus.stop();document.getElementById('hud').className='';
    if(G.beatBoss){showCredits();return;}
    const r=document.getElementById('result-ov');r.classList.add('active');
    let i,t,c,d;
    let canContinue=false;
    if(G.girlsMet>=7&&G.mariusTalks<10){i='👑';t='ALLE 7 SCORET!';c='#ffbe0b';d='Men Phil var kun håndlangeren... Snak med Marius i København ('+G.mariusTalks+'/10 samtaler) for at afsløre den SANDE bagmand og score Valentina! 💋🔧';canContinue=true;}
    else if(G.girlsMet>=7){i='👑';t='ALLE 7 SCORET!';c='#ffbe0b';d='Masken venter på at falde... Prøv igen! 🎭🔥';}
    else if(G.girlsMet>=5){i='😎';t='NÆSTEN DER!';c='#00d4aa';d=G.girlsMet+'/7 scoret. Stærkt comeback!';}
    else if(G.girlsMet>=3){i='💪';t='DER ER HÅBET';c='#ff6b35';d=G.girlsMet+'/7 scoret. "Næste sæson, bror."';}
    else if(G.girlsMet>=1){i='🙂';t='EN GOD START';c='#3b82f6';d=G.girlsMet+'/7 scoret. Bliv ved med at træne!';}
    else{i='😅';t='HANZI PRØVEDE...';c='#aaa';d='0 scoret. Der er altid næste gang!';}
    const continueBtn=canContinue?`<button class="btn" onclick="continueAfterEnd()" style="margin-bottom:8px">FORTSÆT ▶</button><br>`:'';
    r.innerHTML=`<div style="text-align:center"><div style="font-size:3.5rem;margin-bottom:10px">${i}</div><div class="pix" style="font-size:clamp(10px,3.5vw,20px);color:${c};margin-bottom:6px">${t}</div><div style="font-size:.65rem;color:#aaa;max-width:300px;margin:0 auto 14px;line-height:1.6">${d}</div><div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#ffbe0b;margin-bottom:16px">SCORE: ${G.totalScore} | DAMER: ${G.girlsMet}/7</div>${continueBtn}<button class="btn btn-s" onclick="restart()">PRØV IGEN</button></div>`;
}

function continueAfterEnd(){
    document.getElementById('result-ov').classList.remove('active');
    G.scene='map';G.daysLeft=7;G.hour=8;
    Mus.play('map');updHUD();
    msg('Endnu en chance! Snak med Marius i København og gør dig klar til at afsløre bagmanden! 🎭');
    bigTextFlash('FORTSÆT!','#ffbe0b');
}

function showCredits(){
    G.scene='credits';
    const cr=document.getElementById('credits-ov');cr.classList.add('active');
    screenShake(12,600);bigTextFlash('👑 VICTORY!','#ffbe0b');
    setTimeout(()=>{sparkleEffect(innerWidth*.2,innerHeight*.3,'#ffbe0b');sparkleEffect(innerWidth*.8,innerHeight*.3,'#ff006e');sparkleEffect(innerWidth*.5,innerHeight*.2,'#00d4aa');},300);
    setTimeout(()=>{sparkleEffect(innerWidth*.3,innerHeight*.5,'#e040fb');sparkleEffect(innerWidth*.7,innerHeight*.5,'#3b82f6');},800);
    setTimeout(()=>{sparkleEffect(innerWidth*.5,innerHeight*.4,'#ffbe0b');sparkleEffect(innerWidth*.4,innerHeight*.6,'#ff006e');sparkleEffect(innerWidth*.6,innerHeight*.6,'#00d4aa');},1300);
    const stats=[
        ['DAGE OVERLEVET',G.day],['PIGER SCORET',G.girlsMet],['TOTAL SCORE',G.totalScore],
        ['STYRKE',G.styrke],['CARDIO',G.cardio],['SMALL TALK',G.smalltalk],['REFLEX',G.reflex],
        ['CHARM TOTAL',G.charmTotal],['CRIT CHANCE',G.critChance+'%'],['CRIT DMG',G.critDmg+'%'],['HP REGEN',G.regenAmt+'/tur'],['WORK LEVEL',G.workLvl],['GYM LEVEL',G.gymLvl],['BODEGA LEVEL',G.bodegaLvl],
        ['PENGE TJENT',G.money],['ITEMS BRUGT',G.bought.length],
    ];
    cr.innerHTML=`
    <div style="text-align:center;animation:mIn 1s ease">
        <div style="font-size:4rem;margin-bottom:10px">👑</div>
        <div class="pix" style="font-size:clamp(14px,4vw,24px);color:#ffbe0b;margin-bottom:4px;text-shadow:0 0 20px rgba(255,190,11,.5)">HANZI ER BACK!</div>
        <div class="pix" style="font-size:clamp(6px,1.5vw,9px);color:#ff006e;margin-bottom:20px">TBH · THE BOYS HOUSE · REUNITED</div>
        <div style="font-size:.7rem;color:#aaa;max-width:300px;margin:0 auto 20px;line-height:1.8">
            Masken er faldet. Mikkel Leth ER Kalle Mith.<br>
            Phil løsnede bolten — men Leth trak i trådene.<br>
            Valentina ventede 2 år. Nu er hun din. 🌹<br>
            TBH er genforenet. Hele Danmark ved det. 👑🔥
        </div>
        <div style="max-width:280px;margin:0 auto 20px">
            ${stats.map(s=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span class="pix" style="font-size:clamp(5px,1.1vw,7px);color:#888">${s[0]}</span><span class="pix" style="font-size:clamp(5px,1.1vw,7px);color:#ffbe0b">${s[1]}</span></div>`).join('')}
        </div>
        <div class="pix" style="font-size:clamp(4px,1vw,6px);color:#555;margin-bottom:6px">— CREDITS —</div>
        <div style="font-size:.6rem;color:#666;line-height:2;margin-bottom:20px">
            Game Design: Mikkel<br>
            Code: Claude AI<br>
            Leth: Sig selv<br>
            Kalle Mith: Mikkel Leth (plot twist!)<br>
            Musik: Royalty Free Bangers<br>
            Kort: Aarhus Kommune (probably)<br>
            Special Thanks: Alle der troede på Hanzi
        </div>
        <div class="pix" style="font-size:clamp(6px,1.3vw,8px);color:#ffbe0b;margin-bottom:16px">TOTAL SCORE: ${G.totalScore}</div>
        <button class="btn" onclick="document.getElementById('credits-ov').classList.remove('active');restart()">🔄 SPIL IGEN</button>
    </div>`;
}

function restart(){
    Object.assign(G,{day:1,daysLeft:7,hour:8,money:150,hunger:80,round:1,styrke:0,cardio:0,smalltalk:0,reflex:0,critLvl:0,critDmgLvl:0,regenLvl:0,gymLvl:1,charmPts:0,charmTotal:0,perks:{},workLvl:1,workXP:0,inv:[],bought:[],girlsMet:0,bodegaWins:0,beatBoss:false,totalScore:0,tutorial:0,bodegaLvl:1,wheelUsedToday:false,eventDoneToday:false,buff:null,buffDays:0,px:.35,py:.45,scene:'title',currentHP:-1,firstClubDone:false,kbhUnlocked:false,currentMap:'aarhus',kirkeUnlocked:false,kirkePrayedToday:false,kirkePrayers:0,mariusTalks:0,gydenUsedToday:false,relics:[],lossBuff:false});bodegaUsedToday=false;eventMarker=null;gamblesToday=0;foodBoughtToday=0;
    stockPrices={hanzi:100,tbh:50,leth:75};stockOwned={hanzi:0,tbh:0,leth:0};
    friendRel.lemming=0;friendRel.malte=0;friendRel.marius=0;friendRel.thomas=0;
    pendingNewDay=false;pendingWheel=false;pendingLore=null;pendingForceClub=false;
    flexAbilities.forEach(a=>a.unlocked=false);
    Object.keys(visitedLocations).forEach(k=>delete visitedLocations[k]);
    document.querySelectorAll('.ov,.wheel-ov,.event-ov,.cui').forEach(o=>o.classList.remove('active'));
    document.getElementById('result-ov').classList.remove('active');
    document.getElementById('credits-ov').classList.remove('active');
    document.getElementById('title-ov').style.display='flex';
}

// ===== KØBENHAVN LOCATIONS =====
function kirkePrayCost(){return Math.floor(100*Math.pow(2,G.kirkePrayers));}
function openKirke(){
    G.scene='kirke';
    let ov=document.getElementById('kirke-ov');
    if(ov)ov.remove();
    ov=document.createElement('div');ov.id='kirke-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#05050f;z-index:20;display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding:20px 10px;';
    const prayCost=kirkePrayCost();
    let html=`<div class="pix" style="font-size:clamp(10px,3vw,16px);color:#f5d70b;margin-bottom:6px">⛪ KIRKE</div>`;
    if(!G.kirkeUnlocked){
        html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#888;margin-bottom:16px;text-align:center;line-height:1.8">Kirken er låst. Betal 1000 KR for at få adgang.</div>`;
        html+=`<button class="btn" id="kirke-unlock" style="margin-bottom:10px">🔑 UNLOCK KIRKE · 1000 KR</button>`;
    } else if(G.kirkePrayedToday){
        html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#888;margin-bottom:16px;text-align:center;line-height:1.8">Du har allerede bedt i dag. Kom igen i morgen. 🙏</div>`;
    } else {
        html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#888;margin-bottom:16px;text-align:center;line-height:1.8">Bed en bøn og modtag guds velsignelse.\n+1 til ALLE stats permanent. 1 gang/dag.\nBønner bedt: ${G.kirkePrayers}</div>`;
        html+=`<button class="btn" id="kirke-pray" style="margin-bottom:10px">🙏 BED · ${prayCost} KR</button>`;
    }
    html+=`<button class="btn btn-s" id="kirke-back" style="margin-top:10px">← TILBAGE</button>`;
    ov.innerHTML=html;
    document.body.appendChild(ov);
    if(!G.kirkeUnlocked){
        document.getElementById('kirke-unlock').onclick=()=>{
            if(G.money<1000){msg('Du mangler penge! Koster 1000 KR.');S.bad();return;}
            G.money-=1000;G.kirkeUnlocked=true;S.perf();float('KIRKE UNLOCKED!','#f5d70b');bigTextFlash('⛪ KIRKE!','#f5d70b');screenShake(6,300);sparkleEffect(innerWidth/2,innerHeight/2,'#f5d70b');sparkleEffect(innerWidth/3,innerHeight/3,'#fff');msg('Kirken er åben! Bed for velsignelse! ⛪');
            ov.remove();openKirke();updHUD();
        };
    }
    const prayBtn=document.getElementById('kirke-pray');
    if(prayBtn){
        prayBtn.onclick=()=>{
            if(G.money<prayCost){msg('Ikke nok penge! Koster '+prayCost+' KR.');S.bad();return;}
            G.money-=prayCost;G.kirkePrayedToday=true;G.kirkePrayers++;
            G.styrke+=1;G.cardio+=1;G.smalltalk+=1;G.reflex+=1;
            S.heal();float('+1 ALLE STATS!','#f5d70b');bigTextFlash('VELSIGNET!','#f5d70b');screenShake(4,200);sparkleEffect(innerWidth/2,innerHeight/2,'#f5d70b');sparkleEffect(innerWidth/2,innerHeight/3,'#fff');
            msg('Guds velsignelse! +1 STR, +1 CRD, +1 TLK, +1 REF! 🙏✨ Næste bøn: '+kirkePrayCost()+' KR');
            ov.remove();G.scene='map';updHUD();
        };
    }
    document.getElementById('kirke-back').onclick=()=>{ov.remove();G.scene='map';updHUD();};
}

const victorRelics=[
    {id:'ring_of_power',name:'Kraftens Ring',icon:'💍',desc:'+5 STR permanent',cost:500,effect:()=>{G.styrke+=5;},stat:'styrke'},
    {id:'heart_amulet',name:'Hjerte Amulet',icon:'❤️',desc:'+5 CRD permanent',cost:500,effect:()=>{G.cardio+=5;},stat:'cardio'},
    {id:'silver_tongue',name:'Sølvtunge',icon:'👅',desc:'+5 TLK permanent',cost:500,effect:()=>{G.smalltalk+=5;},stat:'smalltalk'},
    {id:'cats_eye',name:'Katteøje',icon:'🐱',desc:'+5 REF permanent',cost:500,effect:()=>{G.reflex+=5;},stat:'reflex'},
    {id:'work_permit',name:'Arbejdstilladelse',icon:'📋',desc:'Work Level +2',cost:800,effect:()=>{G.workLvl+=2;},stat:'workLvl'},
    {id:'gold_chain',name:'Guldkæde',icon:'⛓️',desc:'+10 CHARM permanent',cost:600,effect:()=>{G.charmPts+=10;G.charmTotal+=10;},stat:'charmTotal'},
    {id:'crit_gem',name:'Kritisk Sten',icon:'💎',desc:'+3 CRIT levels',cost:700,effect:()=>{G.critLvl+=3;},stat:'critLvl'},
    {id:'regen_crystal',name:'Regen Krystal',icon:'🔮',desc:'+3 REGEN levels',cost:700,effect:()=>{G.regenLvl+=3;},stat:'regenLvl'},
    {id:'gym_pass',name:'VIP Gym Pas',icon:'🏋️',desc:'Gym Level +2',cost:900,effect:()=>{G.gymLvl+=2;},stat:'gymLvl'},
    {id:'hunger_belt',name:'Sultbælte',icon:'🥋',desc:'+30 Max Sult',cost:400,effect:()=>{G.maxHunger+=30;G.hunger=Math.min(G.maxHunger,G.hunger+30);},stat:'maxHunger'},
];
function openVictor(){
    G.scene='victor';
    let ov=document.getElementById('victor-ov');
    if(ov)ov.remove();
    ov=document.createElement('div');ov.id='victor-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#05050f;z-index:20;display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding:20px 10px;';
    let html=`<div class="pix" style="font-size:clamp(10px,3vw,16px);color:#8b5cf6;margin-bottom:4px">🏪 VICTORS SHOP</div>`;
    html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#888;margin-bottom:12px">Relics med permanente effekter · ${G.money} KR</div>`;
    victorRelics.forEach(r=>{
        const owned=G.relics.includes(r.id);
        html+=`<div style="background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:8px;padding:10px;margin-bottom:6px;max-width:320px;width:100%;display:flex;justify-content:space-between;align-items:center;${owned?'opacity:.4':''}">
            <div><span style="font-size:1.2rem">${r.icon}</span> <span class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#fff">${r.name}</span><br><span style="font-size:.5rem;color:#aaa">${r.desc}</span></div>
            <div>${owned?'<span class="pix" style="font-size:clamp(4px,1vw,6px);color:#00d4aa">EJET ✓</span>':'<button class="btn btn-s relic-buy" data-id="'+r.id+'" style="font-size:clamp(4px,1vw,6px)">'+r.cost+' KR</button>'}</div>
        </div>`;
    });
    html+=`<button class="btn btn-s" id="victor-back" style="margin-top:12px">← TILBAGE</button>`;
    ov.innerHTML=html;
    document.body.appendChild(ov);
    ov.querySelectorAll('.relic-buy').forEach(btn=>{
        btn.onclick=()=>{
            const relic=victorRelics.find(r=>r.id===btn.dataset.id);
            if(!relic||G.relics.includes(relic.id))return;
            if(G.money<relic.cost){msg('Ikke nok penge!');S.bad();return;}
            G.money-=relic.cost;G.relics.push(relic.id);relic.effect();
            S.buy();float(relic.icon+' '+relic.name,'#8b5cf6');bigTextFlash(relic.icon+' RELIC!','#8b5cf6');screenShake(6,300);sparkleEffect(innerWidth/2,innerHeight/2,'#8b5cf6');sparkleEffect(innerWidth/2,innerHeight/3,'#e040fb');msg(relic.name+' købt! '+relic.desc+' 🏪');
            ov.remove();openVictor();updHUD();
        };
    });
    document.getElementById('victor-back').onclick=()=>{ov.remove();G.scene='map';updHUD();};
}

function openGyden(){
    G.scene='gyden';
    let ov=document.getElementById('gyden-ov');
    if(ov)ov.remove();
    ov=document.createElement('div');ov.id='gyden-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#05050f;z-index:20;display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding:20px 10px;';
    let html=`<div class="pix" style="font-size:clamp(10px,3vw,16px);color:#8b5cf6;margin-bottom:4px">🌙 GYDEN</div>`;
    html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#888;margin-bottom:12px;text-align:center;line-height:1.8">Ulovligt arbejde i Københavns underverden.\n12 timer · Store penge · 10% risiko for politiet</div>`;
    if(G.gydenUsedToday){
        html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#ff006e;margin-bottom:12px">Du har allerede arbejdet i Gyden i dag.</div>`;
    } else if(G.hour<12){
        html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#ff006e;margin-bottom:12px">Gyden åbner først efter kl. 12! 🌙 Kom tilbage senere.</div>`;
    } else {
        const pay=300+G.workLvl*80+Math.floor(Math.random()*200);
        html+=`<div style="background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.3);border-radius:8px;padding:14px;max-width:300px;width:100%;text-align:center;margin-bottom:10px">
            <div class="pix" style="font-size:clamp(6px,1.5vw,9px);color:#8b5cf6;margin-bottom:6px">SKETCHY JOB</div>
            <div style="font-size:.6rem;color:#aaa;margin-bottom:8px">Betaling: ~${pay} KR<br>Tid: 12 timer<br>⚠️ 10% chance for POLITIET</div>
            <button class="btn" id="gyden-work" data-pay="${pay}">🌙 TAG JOBBET</button>
        </div>`;
    }
    html+=`<button class="btn btn-s" id="gyden-back" style="margin-top:10px">← TILBAGE</button>`;
    ov.innerHTML=html;
    document.body.appendChild(ov);
    const workBtn=document.getElementById('gyden-work');
    if(workBtn){
        workBtn.onclick=()=>{
            G.gydenUsedToday=true;
            advTime(12);G.hunger=Math.max(0,G.hunger-40);
            if(Math.random()<0.1){
                G.money=0;S.bad();
                float('BUSTED! 🚔','#ff006e');bigTextFlash('BUSTED!','#ff006e');screenShake(12,500);hitFlash('#ff006e');
                msg('POLITIET! Du blev taget! Alle dine penge er konfiskeret! 🚔💸');
            } else {
                const pay=parseInt(workBtn.dataset.pay);
                G.money+=pay;S.coin();
                float('+'+pay+' KR','#00d4aa');bigTextFlash('+'+pay+' KR!','#00d4aa');sparkleEffect(innerWidth/2,innerHeight/2,'#00d4aa');
                msg('Gyden-job fuldført! +'+pay+' KR! Du slap afsted... denne gang. 🌙');
            }
            ov.remove();G.scene='map';updHUD();flushPendingDay();flushPendingEvents();
        };
    }
    document.getElementById('gyden-back').onclick=()=>{ov.remove();G.scene='map';updHUD();};
}

const mariusConversations=[
    {id:1,cost:100,text:'Marius: "Bro, har du nogensinde tænkt over HVORFOR Leth aldrig besøgte dig på hospitalet?"'},
    {id:2,cost:150,text:'Marius: "Kalle Mith... det navn. Prøv at stave det baglæns. Nej vent, prøv at blande bogstaverne."'},
    {id:3,cost:200,text:'Marius: "Jeg fandt en mekaniker. Han siger bolten på din motorcykel var LØSNET med værktøj."'},
    {id:4,cost:250,text:'Marius: "Leth gik tidligt fra festen den aften. Sagde han skulle ordne noget. Hvad mon?"'},
    {id:5,cost:300,text:'Marius: "Der var en pige i Royal Arena den aften. Valentina. Hun kiggede KUN på dig."'},
    {id:6,cost:350,text:'Marius: "Valentina er Kalle Miths kæreste NU. Men dengang... hun ville have DIG."'},
    {id:7,cost:400,text:'Marius: "Kalle Mith = Mikkel Leth. Leth fjernede dig for at tage Valentina. Tænk over det."'},
    {id:8,cost:450,text:'Marius: "Leth trænede dig op igen for at VINDE rigtigt. Ansigt til ansigt. Det er sport for ham."'},
    {id:9,cost:500,text:'Marius: "Valentina sendte mig en besked til dig: Hun har ventet i 2 år. Hun valgte dig."'},
    {id:10,cost:600,text:'Marius: "Når du har scoret alle 7... er det VALENTINA der venter. Ikke Kalle Mith. HUN er den sande boss. Scor hende og vind det hele."'},
];
function openMarius(){
    G.scene='marius';
    let ov=document.getElementById('marius-ov');
    if(ov)ov.remove();
    ov=document.createElement('div');ov.id='marius-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#05050f;z-index:20;display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding:20px 10px;';
    let html=`<div class="pix" style="font-size:clamp(10px,3vw,16px);color:#3b82f6;margin-bottom:4px">🏠 MARIUS HUS</div>`;
    html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#ff006e;margin-bottom:4px">⚠️ KRÆVES FOR SLUTBOSS: ${G.mariusTalks}/10 SAMTALER ⚠️</div>`;
    html+=`<div class="pix" style="font-size:clamp(5px,1.2vw,7px);color:#888;margin-bottom:12px">Køb alle 10 for at unlocke Valentina 💋 · ${G.money} KR</div>`;
    if(G.mariusTalks>=10){
        html+=`<div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#00d4aa;margin-bottom:12px;text-align:center;line-height:1.8">Du kender hele sandheden nu. ✅\nValentina venter på dig...</div>`;
    } else {
        const next=mariusConversations[G.mariusTalks];
        html+=`<div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.3);border-radius:8px;padding:14px;max-width:320px;width:100%;margin-bottom:10px">
            <div class="pix" style="font-size:clamp(5px,1.2vw,7px);color:#3b82f6;margin-bottom:6px">SAMTALE ${next.id}/10</div>
            <div style="font-size:.55rem;color:#aaa;margin-bottom:8px;line-height:1.6">Køb denne samtale for at lære mere om sandheden...</div>
            <button class="btn" id="marius-buy" data-cost="${next.cost}">💬 KØB SAMTALE · ${next.cost} KR</button>
        </div>`;
    }
    if(G.mariusTalks>0){
        html+=`<div style="max-width:320px;width:100%;margin-top:6px">`;
        for(let i=0;i<G.mariusTalks;i++){
            html+=`<div style="background:rgba(59,130,246,.04);border:1px solid rgba(59,130,246,.1);border-radius:6px;padding:8px;margin-bottom:4px;font-size:.5rem;color:#aaa;line-height:1.6">${mariusConversations[i].text}</div>`;
        }
        html+=`</div>`;
    }
    html+=`<button class="btn btn-s" id="marius-back" style="margin-top:12px">← TILBAGE</button>`;
    ov.innerHTML=html;
    document.body.appendChild(ov);
    const buyBtn=document.getElementById('marius-buy');
    if(buyBtn){
        buyBtn.onclick=()=>{
            const cost=parseInt(buyBtn.dataset.cost);
            if(G.money<cost){msg('Ikke nok penge!');S.bad();return;}
            G.money-=cost;G.mariusTalks++;
            S.click();
            const conv=mariusConversations[G.mariusTalks-1];
            msg(conv.text);float('SAMTALE '+G.mariusTalks+'/10','#3b82f6');
            screenShake(4,200);sparkleEffect(innerWidth/2,innerHeight/2,'#3b82f6');
            if(G.mariusTalks>=10){bigTextFlash('KLAR TIL BOSS!','#ff006e');screenShake(10,500);sparkleEffect(innerWidth/3,innerHeight/3,'#ffbe0b');sparkleEffect(innerWidth*2/3,innerHeight/3,'#ff006e');}
            ov.remove();openMarius();updHUD();
        };
    }
    document.getElementById('marius-back').onclick=()=>{ov.remove();G.scene='map';updHUD();};
}

// ===== PHONE APPS =====
let stockPrices={hanzi:100,tbh:50,leth:75};
let stockOwned={hanzi:0,tbh:0,leth:0};
function openPhoneApps(){
    G.scene='phone_apps';
    let ov=document.getElementById('phoneapps-ov');
    if(ov)ov.remove();
    ov=document.createElement('div');ov.id='phoneapps-ov';ov.className='ov active';
    ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#05050f;z-index:20;display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding:20px 10px;';
    const apps=[
        {name:'📈 AKTIER',desc:'Invester dine penge!',fn:openStocks},
        {name:'📊 STATS',desc:'Se dine stats',fn:openStatsApp},
        {name:'🎰 GAMBLING',desc:'Dobbelt eller intet!',fn:openGambling},
        {name:'📞 KONTAKTER',desc:'Ring til vennerne',fn:openContacts},
    ];
    ov.innerHTML=`<div class="pix" style="font-size:clamp(10px,3vw,16px);color:#3b82f6;margin-bottom:6px">📱 HANZI'S TELEFON</div><div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#888;margin-bottom:16px">${G.money} KR | DAG ${G.day}</div>`;
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:300px;width:100%;';
    apps.forEach(app=>{
        const d=document.createElement('div');
        d.style.cssText='background:rgba(255,255,255,.04);border:1px solid rgba(59,130,246,.2);border-radius:12px;padding:16px 10px;text-align:center;cursor:pointer;';
        d.innerHTML=`<div style="font-size:1.5rem;margin-bottom:6px">${app.name.split(' ')[0]}</div><div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#fff">${app.name.split(' ').slice(1).join(' ')}</div><div style="font-size:.5rem;color:#888;margin-top:4px">${app.desc}</div>`;
        d.onclick=app.fn;
        grid.appendChild(d);
    });
    ov.appendChild(grid);
    const back=document.createElement('button');back.className='btn btn-s';back.textContent='← TILBAGE';back.style.marginTop='16px';
    back.onclick=()=>{ov.remove();G.scene='map';};
    ov.appendChild(back);
    document.body.appendChild(ov);
}

function openStocks(){
    const ov=document.getElementById('phoneapps-ov');
    const stocks=[
        {id:'hanzi',name:'HANZI Inc.',icon:'🕺',price:stockPrices.hanzi},
        {id:'tbh',name:'TBH Records',icon:'🎵',price:stockPrices.tbh},
        {id:'leth',name:'Leth Fitness',icon:'💪',price:stockPrices.leth},
    ];
    const portfolio=stocks.reduce((sum,s)=>sum+stockOwned[s.id]*s.price,0);
    ov.innerHTML=`<div class="pix" style="font-size:clamp(9px,2.5vw,14px);color:#00d4aa;margin-bottom:4px">📈 AKTIER</div><div class="pix" style="font-size:clamp(5px,1.2vw,7px);color:#888;margin-bottom:12px">Portfolio: ${portfolio} KR | Cash: ${G.money} KR</div>`;
    stocks.forEach(s=>{
        const d=document.createElement('div');
        d.style.cssText='background:rgba(255,255,255,.03);border:1px solid rgba(0,212,170,.2);border-radius:8px;padding:10px;margin-bottom:8px;max-width:300px;width:100%;';
        const change=Math.random()>.5;
        d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><span style="font-size:1.2rem">${s.icon}</span> <span class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#fff">${s.name}</span></div><div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:${change?'#00d4aa':'#ff006e'}">${s.price} KR ${change?'📈':'📉'}</div></div><div style="display:flex;gap:6px;margin-top:8px"><span class="pix" style="font-size:clamp(4px,1vw,6px);color:#ffbe0b">Ejer: ${stockOwned[s.id]}</span></div><div style="display:flex;gap:6px;margin-top:6px"><button class="btn btn-s" onclick="buyStock('${s.id}',${s.price})">KØB</button><button class="btn btn-s" onclick="sellStock('${s.id}',${s.price})">SÆLG</button></div>`;
        ov.appendChild(d);
    });
    const back=document.createElement('button');back.className='btn btn-s';back.textContent='← TILBAGE';back.style.marginTop='12px';
    back.onclick=openPhoneApps;ov.appendChild(back);
}
function buyStock(id,price){
    if(G.money<price){msg('Ikke nok penge!');S.bad();return;}
    G.money-=price;stockOwned[id]++;S.coin();float('Købt 1 aktie!','#00d4aa');updHUD();openStocks();
}
function sellStock(id,price){
    if(stockOwned[id]<=0){msg('Ingen aktier at sælge!');S.bad();return;}
    stockOwned[id]--;G.money+=price;S.coin();float('+'+price+' KR','#ffbe0b');updHUD();openStocks();
}

function openStatsApp(){
    const ov=document.getElementById('phoneapps-ov');
    const stats=[
        ['Styrke',G.styrke,'#ff006e'],['Cardio',G.cardio,'#ff4d8d'],['Small Talk',G.smalltalk,'#3b82f6'],['Reflex',G.reflex,'#00d4aa'],
        ['Crit Chance',G.critChance+'%','#ffbe0b'],['Crit Dmg',G.critDmg+'%','#ff6b35'],['HP Regen',G.regenAmt+'/tur','#00d4aa'],
        ['Max HP',G.maxHP,'#ff006e'],['Max MP',G.maxMP,'#3b82f6'],['Skade',G.dmg,'#ff6b35'],['Block',G.blockChance+'%','#00d4aa'],
        ['Gym LVL',G.gymLvl,'#ffbe0b'],['Work LVL',G.workLvl,'#059669'],['Bodega LVL',G.bodegaLvl,'#f59e0b'],
        ['Piger scoret',G.girlsMet+'/7','#e040fb'],['Runde',G.round+'/'+G.maxRounds,'#fff'],
    ];
    ov.innerHTML=`<div class="pix" style="font-size:clamp(9px,2.5vw,14px);color:#ffbe0b;margin-bottom:12px">📊 STATS</div>`;
    const list=document.createElement('div');list.style.cssText='max-width:300px;width:100%;';
    stats.forEach(s=>{
        const d=document.createElement('div');
        d.style.cssText='display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,.06);';
        d.innerHTML=`<span class="pix" style="font-size:clamp(4px,1.1vw,7px);color:#aaa">${s[0]}</span><span class="pix" style="font-size:clamp(4px,1.1vw,7px);color:${s[2]}">${s[1]}</span>`;
        list.appendChild(d);
    });
    ov.appendChild(list);
    const back=document.createElement('button');back.className='btn btn-s';back.textContent='← TILBAGE';back.style.marginTop='12px';
    back.onclick=openPhoneApps;ov.appendChild(back);
}

let gamblesToday=0;const maxGamblesPerDay=5;
function openGambling(){
    const ov=document.getElementById('phoneapps-ov');
    ov.innerHTML=`<div class="pix" style="font-size:clamp(9px,2.5vw,14px);color:#e040fb;margin-bottom:12px">🎰 GAMBLING</div><div class="pix" style="font-size:clamp(5px,1.2vw,7px);color:#888;margin-bottom:16px">Cash: ${G.money} KR | Spil i dag: ${gamblesToday}/${maxGamblesPerDay}</div>`;
    const bets=[50,100,250,500];
    bets.forEach(bet=>{
        const d=document.createElement('button');d.className='btn';d.style.cssText='margin:4px;min-width:200px;';
        d.textContent=`🎲 ${bet} KR - Dobbelt eller intet!`;
        d.onclick=()=>{
            if(gamblesToday>=maxGamblesPerDay){msg('Nok gambling for i dag! 🎰');S.bad();return;}
            if(G.money<bet){msg('Ikke nok penge!');S.bad();return;}
            gamblesToday++;G.money-=bet;
            if(Math.random()>.5){G.money+=bet*2;S.perf();float('+'+bet+' KR! 🎉','#ffbe0b');msg('VUNDET! +'+bet+' KR! 🎰');}
            else{S.bad();float('-'+bet+' KR 💸','#ff006e');msg('Tabt! -'+bet+' KR 😤');}
            updHUD();openGambling();
        };
        ov.appendChild(d);
    });
    const back=document.createElement('button');back.className='btn btn-s';back.textContent='← TILBAGE';back.style.marginTop='12px';
    back.onclick=openPhoneApps;ov.appendChild(back);
}

const friendRel={lemming:0,malte:0,marius:0,thomas:0};
const relTiers=[
    {min:0,label:'Bekendt',color:'#888',icon:'🤝'},
    {min:3,label:'Ven',color:'#3b82f6',icon:'😊'},
    {min:6,label:'Bedste Ven',color:'#00d4aa',icon:'🤜🤛'},
    {min:10,label:'Bro for Life',color:'#ffbe0b',icon:'👑'},
];
function getRelTier(pts){let t=relTiers[0];for(const r of relTiers)if(pts>=r.min)t=r;return t;}
function openContacts(){
    const ov=document.getElementById('phoneapps-ov');
    ov.innerHTML=`<div class="pix" style="font-size:clamp(9px,2.5vw,14px);color:#3b82f6;margin-bottom:12px">📞 KONTAKTER</div>`;
    const contacts=[
        {id:'lemming',name:'Lemming 🐹',stat:'styrke',statName:'STR',msg:'Bro husk at træne!',hangCost:30,hangMsg:'Trænede med Lemming!'},
        {id:'malte',name:'Malte 🍺',stat:'smalltalk',statName:'TLK',msg:'Yo, bodegaen har nye piger!',hangCost:50,hangMsg:'Hang med Malte på bodegaen!'},
        {id:'marius',name:'Marius 🎮',stat:'reflex',statName:'REF',msg:'Gaming-session?',hangCost:40,hangMsg:'Gamede med Marius!'},
        {id:'thomas',name:'Thomas ⚽',stat:'cardio',statName:'CRD',msg:'Cardio er undervurderet bro!',hangCost:20,hangMsg:'Løb med Thomas!'},
    ];
    contacts.forEach(c=>{
        const rel=friendRel[c.id];const tier=getRelTier(rel);
        const buffAmt=tier.min>=10?8:tier.min>=6?5:tier.min>=3?3:0;
        const bars='█'.repeat(Math.min(10,rel))+'░'.repeat(Math.max(0,10-rel));
        const d=document.createElement('div');
        d.style.cssText='background:rgba(255,255,255,.03);border:1px solid rgba(59,130,246,.15);border-radius:8px;padding:10px;margin-bottom:6px;max-width:300px;width:100%;';
        d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div class="pix" style="font-size:clamp(5px,1.3vw,8px);color:#fff">${c.name}</div><div style="font-size:.5rem;color:${tier.color}">${tier.icon} ${tier.label}</div></div><div style="font-size:.45rem;color:#555;margin:4px 0;letter-spacing:1px">${bars}</div><div style="font-size:.5rem;color:#888">${c.msg}</div>${buffAmt>0?`<div style="font-size:.45rem;color:${tier.color};margin-top:2px">Permanent buff: +${buffAmt} ${c.statName}</div>`:''}
        <div style="display:flex;gap:6px;margin-top:6px"><button class="btn btn-s" data-hang="${c.id}">🤙 HANG (${c.hangCost} KR)</button></div>`;
        ov.appendChild(d);
        d.querySelector(`[data-hang="${c.id}"]`).onclick=()=>{
            if(G.money<c.hangCost){msg('Ikke nok penge!');S.bad();return;}
            G.money-=c.hangCost;advTime(2);friendRel[c.id]++;
            const newTier=getRelTier(friendRel[c.id]);const oldTier=getRelTier(friendRel[c.id]-1);
            if(newTier.min>oldTier.min&&newTier.min>=3){
                const newBuff=newTier.min>=10?8:newTier.min>=6?5:3;
                G[c.stat]+=newBuff;float('+'+newBuff+' '+c.statName+' permanent!',newTier.color);
                msg(c.name.split(' ')[0]+' relation: '+newTier.label+'! +'+newBuff+' '+c.statName+' permanent! '+newTier.icon);
                bigTextFlash(newTier.label+'!',newTier.color);screenShake(6,300);
                sparkleEffect(innerWidth/2,innerHeight/2,newTier.color);
            }else{msg(c.hangMsg+' +1 relation 🤝');}
            S.ok();float('+1 Relation',tier.color);updHUD();openContacts();
        };
    });
    const back=document.createElement('button');back.className='btn btn-s';back.textContent='← TILBAGE';back.style.marginTop='12px';
    back.onclick=openPhoneApps;ov.appendChild(back);
}

// ===== PHONE =====
const phoneScript=[
    {t:'n',x:'📱 Indkommende opkald...'},
    {t:'i',x:'Bror... BROR! Du er vågen?! 😭'},
    {t:'o',x:'Leth...? Hvad skete der?'},
    {t:'i',x:'Motorcykel-ulykke. 2 ÅR i koma. Nogen løsnede bolten på din MC.'},
    {t:'o',x:'Hvad med TBH?!'},
    {t:'i',x:'De smed dig ud. Du er færdig, siger de.'},
    {t:'o',x:'HVAD?! Jeg var NUMMER 1!'},
    {t:'i',x:'Var. Alt er væk. Men - scor den hotteste pige, og du er TILBAGE. 👀'},
    {t:'n',x:'📋 SÅDAN SPILLER DU:'},
    {t:'i',x:'🏋️ GYM = træn stats. STYRKE giver skade, CARDIO giver HP.'},
    {t:'i',x:'🗣️ SMALL TALK = mana til abilities. REFLEX = undvig + hit chance.'},
    {t:'i',x:'🍔 BUTIK = køb mad (sult), gear (permanent stats) og kamp-items!'},
    {t:'i',x:'⭐ SKILL TREE = unlock stærke passive buffs med charm points.'},
    {t:'i',x:'💼 ARBEJDE = tjen penge. Mere KR = bedre gear + items!'},
    {t:'i',x:'🎰 BODEGA = ekstra kamp 1x/dag. LYKKEHJUL = random bonus!'},
    {t:'i',x:'🗣️ I kamp: brug PICKUP LINES til buffs/debuffs - de er STÆRKE!'},
    {t:'i',x:'🍹 Kamp-items fra butikken er MEGA vigtige. Stock op!'},
    {t:'i',x:'7 dage per runde. Når tiden er ude SKAL du på klubben! 🪩'},
    {t:'i',x:'Tip: Brug din tid klogt. Træn, køb items, og forbered dig!'},
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
    if(G.tutorial===0){G.tutorial=1;msg('🗺️ Tryk på en bygning for at gå derhen! De røde firkanter er bygninger du kan besøge.');setTimeout(()=>msg('💪 Start med GYM for at træne dine stats! STYRKE=skade, CARDIO=HP, SMALL TALK=mana, REFLEX=undvig'),3000);setTimeout(()=>msg('🍔 Husk at købe MAD i BUTIKKEN når din SULT er lav! Kamp-items er også SUPER vigtige!'),6000);}}

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
    else if(['map','gym','shop','work','work_anim','tree','train','bodega','wheel','event'].includes(G.scene)){drawMap();}
    requestAnimationFrame(loop);
}

// ===== INIT =====
document.getElementById('start-btn').onclick=()=>{
    S.init();Mus.init();S.ok();
    document.getElementById('title-ov').style.display='none';
    const splash=document.createElement('div');
    splash.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a0f;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .6s ease;';
    const leth=document.createElement('div');leth.className='pix';
    leth.style.cssText='color:#dc2626;font-size:clamp(8px,2.5vw,14px);margin-bottom:24px;opacity:0;transition:opacity .8s ease .3s;';
    leth.textContent='LETH præsenterer';
    const title=document.createElement('div');title.className='pix';
    title.style.cssText='color:#ff006e;font-size:clamp(16px,6vw,36px);text-shadow:0 0 30px rgba(255,0,110,.6);opacity:0;transition:opacity .8s ease .8s;';
    title.textContent='HANZI';
    const sub=document.createElement('div');sub.className='pix';
    sub.style.cssText='color:#ffbe0b;font-size:clamp(6px,1.8vw,11px);margin-top:8px;opacity:0;transition:opacity .8s ease 1.2s;';
    sub.textContent='ULTIMATIV DOUCHEBAG SIMULATOR';
    splash.appendChild(leth);splash.appendChild(title);splash.appendChild(sub);
    document.body.appendChild(splash);
    requestAnimationFrame(()=>{splash.style.opacity='1';leth.style.opacity='1';title.style.opacity='1';sub.style.opacity='1';});
    setTimeout(()=>{splash.style.opacity='0';setTimeout(()=>{splash.remove();playVid('video/intro.mp4',()=>initPhone());},600);},3000);
};
document.getElementById('ph-next').onclick=advPh;
loop();
