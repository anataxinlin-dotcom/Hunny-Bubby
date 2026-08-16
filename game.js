/* =========================================================
   OUR MEMORY BATTLE — full game logic
   ========================================================= */

/* ---------- 0. GLOBAL ERROR SURFACING ----------
   Shows a visible banner on any uncaught error instead of a silent
   blank/broken screen — essential for diagnosing issues on phones
   where there's no dev console. */
(function(){
  const banner = document.getElementById('error-banner');
  const textEl = document.getElementById('error-banner-text');
  const closeBtn = document.getElementById('error-banner-close');
  function showErr(msg){
    if(!banner || !textEl) return;
    textEl.textContent = '⚠️ ' + msg;
    banner.classList.add('show');
  }
  closeBtn && closeBtn.addEventListener('click', ()=>banner.classList.remove('show'));
  window.addEventListener('error', e=>{
    showErr((e.message||'Unknown error') + (e.filename ? (' — ' + e.filename.split('/').pop() + ':' + e.lineno) : ''));
  });
  window.addEventListener('unhandledrejection', e=>{
    showErr('Promise error: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
  });
})();

/* ---------- 1. DECK DATA ---------- */
const MAX_HP = 150; // starting & max HP for each player
const deck40 = [
  {id:1,name:"Pap Muka Ngambek",type:"attack",value:30,img:"card_1.png",desc:"Kirim/peragakan muka senyum imut ke kamera dalam 10 detik!"},
  {id:2,name:"Tes Ingatan Baju",type:"attack",value:25,img:"card_2.png",desc:"Sebutkan warna baju yang dipakai pasanganmu di foto profil WhatsApp-nya sekarang!"},
  {id:3,name:"Cium Layar HP",type:"attack",value:35,img:"card_3.png",desc:"Bikin ekspresi muah/cium layar HP tahan 5 detik"},
  {id:4,name:"Dosa Chat LDR",type:"attack",value:40,img:"card_4.png",desc:"Jujur! Sebutkan 1 hal yang paling sering bikin kamu kesel"},
  {id:5,name:"Mode Manja Live",type:"attack",value:25,img:"card_5.png",desc:"suarakan kalau kamu kangen kayak gimana sih!"},
  {id:6,name:"Gallery Roulette",type:"attack",value:30,img:"card_6.png",desc:"Tunjukin 1 foto pasanganmu yang paling sering kamu jadiin stiker lucu!"},
  {id:7,name:"Nyanyi Reff LDR",type:"attack",value:25,img:"card_7.png",desc:"Nyanyiin 1 bait lagu yang paling ngingetin kamu sama kita!"},
  {id:8,name:"Gombal 10 Detik",type:"attack",value:30,img:"card_8.png",desc:"Tatap kamera dan gombalin pasanganmu 10 detik penuh serius tapinya hehe"},
  {id:9,name:"Interogasi Tidur",type:"attack",value:25,img:"card_9.png",desc:"Jawab apa yang pasangan kamu tanyakan"},
  {id:10,name:"Tiru Gaya Pasangan",type:"attack",value:40,img:"card_10.png",desc:"Peragakan kebiasaan konyol pasanganmu kalau lagi panik/bingung!"},
  {id:11,name:"Tes Tanggal Momen",type:"attack",value:25,img:"card_11.png",desc:"Sebutkan tanggal jadian atau momen penting kita dalam waktu 5 detik!"},
  {id:12,name:"Menu Traktiran",type:"attack",value:30,img:"card_12.png",desc:"Sebutkan 3 makanan yang paling ingin kamu beliin buat dia pas ketemu nanti!"},
  {id:13,name:"Janji Sleep Call",type:"attack",value:25,img:"card_13.png",desc:"Janji bakal nemenin video call minggu ini!"},
  {id:14,name:"Bisik Kangen",type:"attack",value:35,img:"card_14.png",desc:"Bisikkan 'Aku kangen kamu' ke mikrofon HP dengan nada paling serius!"},
  {id:15,name:"3 Sifat Kunci",type:"attack",value:40,img:"card_15.png",desc:"Sebutkan 3 sifat pasanganmu yang paling bikin kamu luluh"},
  {id:16,name:"Tiru 3 Emoji",type:"attack",value:25,img:"card_16.png",desc:"Peragakan 1 sticker yang paling sering kamu pake pas chatan sama dia!"},
  {id:17,name:"Mode Guru Marah",type:"attack",value:30,img:"card_17.png",desc:"Panggil nama lengkap pasanganmu"},
  {id:18,name:"Cemburu Gengsi",type:"attack",value:35,img:"card_18.png",desc:"Sebutkan 1 momen LDR di mana kamu sebenarnya cemburu tapi gengsi ngomong!"},
  {id:19,name:"Lockscreen Check",type:"attack",value:30,img:"card_19.png",desc:"Tunjukkan layar lockscreen HP-mu ke kamera sekarang juga!"},
  {id:20,name:"Ultimate LDR Attack",type:"attack",value:50,img:"card_20.png",desc:"Ceritakan momen paling bikin kangen setengah mati selama kita terpisah jarak!"},
  {id:21,name:"Pelukan Jarak Jauh",type:"heal",value:25,img:"card_21.png",desc:"Kirimkan kalimat manis yang paling bikin dia senyum-senyum sendiri."},
  {id:22,name:"Apresiasi Effort",type:"heal",value:35,img:"card_22.png",desc:"Puji 1 usaha/effort paling luar biasa yang pernah pasanganmu lakuin."},
  {id:23,name:"Wishlist Meetup",type:"heal",value:20,img:"card_23.png",desc:"Sebutkan 1 tempat pertama yang WAJIB didatangi saat kalian ketemu nanti!"},
  {id:24,name:"Doa & Harapan",type:"heal",value:30,img:"card_24.png",desc:"Ucapkan 1 doa/harapan terbaikmu untuk hubungan kalian ke depannya."},
  {id:25,name:"Rumah Kedua",type:"heal",value:35,img:"card_25.png",desc:"Ceritakan kenapa kamu merasa pasanganmu adalah tempat pulang terbaikmu."},
  {id:26,name:"Virtual Date Idea",type:"heal",value:25,img:"card_26.png",desc:"Rencanakan 1 ide nge-date virtual konyol yang mau dicoba minggu ini!"},
  {id:27,name:"VN Kenangan",type:"heal",value:20,img:"card_27.png",desc:"Ingat kembali 1 vn/chat lama yang pernah bikin kamu tersentuh banget."},
  {id:28,name:"Rasa Syukur",type:"heal",value:35,img:"card_28.png",desc:"Ucapkan terima kasih atas hal kecil yang sering dia lakukan tapi jarang kamu puji."},
  {id:29,name:"Lagu Kita",type:"heal",value:25,img:"card_29.png",desc:"Putar/dengarkan lagu favorit kalian bareng-bareng selama 15 detik."},
  {id:30,name:"Super Heal Sync",type:"heal",value:50,img:"card_30.png",desc:"Kalian berdua saling tatap dan bilang 'I love you' secara bersamaan!"},
  {id:31,name:"LDR Shield",type:"counter",value:0,img:"card_31.png",desc:"Tolak total serangan Attack lawan! (Damage jadi 0)."},
  {id:32,name:"Uno Reverse",type:"counter",value:0,img:"card_32.png",desc:"Pantulkan serangan Attack! Lawan yang kena damage dari kartunya sendiri."},
  {id:33,name:"Sinyal Jelek",type:"counter",value:0,img:"card_33.png",desc:"Batalkan serangan lawan dengan alasan 'Sinyal Delay'!"},
  {id:34,name:"Gengsi Defense",type:"counter",value:0,img:"card_34.png",desc:"Tahan serangan! Kamu cuma kena 25% damage karena gengsi ngaku kalah."},
  {id:35,name:"Counter Cium",type:"counter",value:0,img:"card_35.png",desc:"Tolak tantangan lawan dengan memberikan muah/kiss virtual ke kamera!"},
  {id:36,name:"Mirror Healing",type:"counter",value:0,img:"card_36.png",desc:"Salin efek pemulihan HP lawan jika lawan baru saja memakai kartu Heal!"},
  {id:37,name:"Swap Heart (Trap)",type:"trap",value:0,img:"card_37.png",desc:"Jebakan Tukar Nasib! Tukar jumlah HP-mu dengan HP lawan saat ini!"},
  {id:38,name:"Skip Turn (Trap)",type:"trap",value:0,img:"card_38.png",desc:"Jebakan Waktu! Paksa lawan melewati gilirannya, kamu jalan 2x berturut-turut."},
  {id:39,name:"Double Attack (Trap)",type:"trap",value:0,img:"card_39.png",desc:"Jebakan Steroid! Serangan kartu Attack-mu di giliran ini nilainya jadi 2x lipat!"},
  {id:40,name:"Ticket Meetup (Trap)",type:"trap",value:40,img:"card_40.png",desc:"Jebakan Rindu! Bebas pilih: Tambah +40 HP untukmu ATAU kurangi -40 HP lawan!"}
];
const hiddenGemCard = {id:41,name:"Surat Rahasia Rindu",type:"special",value:0,img:"card_special.png",desc:"Kartu Emas Spesial Rahasia! Tap kartu ini untuk membuka surat khusus."};

const TYPE_ICON = {attack:"⚔️",heal:"🌿",counter:"🛡️",trap:"✨",special:"💎"};

/* ---------- 2. STATE ---------- */
let myRole = null;          // 'hunny' | 'bubby'
let isHost = false;         // bubby = host
let peer = null, conn = null;
let muted = false;

let G = null; // gameState, authoritative copy replicated on both sides
/* G = {
  turn: 'hunny'|'bubby',
  hp: {hunny:MAX_HP, bubby:MAX_HP},
  hands: {hunny:[...cards], bubby:[...cards]},
  drawPile: [...cards],   // shuffled 40, hidden gem appended at very end
  discard: [...cards],
  log: [...strings],
  pending: null | {attackerId, attackCardUid, targetRole, value, respondedCounter:null},
  doubleAttackFor: null | 'hunny'|'bubby',
  skipNext: null,
  gemRevealedTo: {hunny:false,bubby:false},
  gameOver:false, winner:null
} */

/* ---------- 3. BACKGROUND PARTICLES ---------- */
function initParticles(){
  const layer = document.getElementById('bg-particles');
  for(let i=0;i<28;i++){
    const p = document.createElement('div');
    p.className='particle';
    const size = 2+Math.random()*4;
    p.style.width=size+'px';p.style.height=size+'px';
    p.style.left=Math.random()*100+'%';
    p.style.animationDuration=(8+Math.random()*10)+'s';
    p.style.animationDelay=(Math.random()*10)+'s';
    layer.appendChild(p);
  }
}
initParticles();

/* ---------- 4. AUDIO ---------- */
function playSfx(id){
  if(muted) return;
  const el = document.getElementById(id);
  if(!el) return;
  try{ el.currentTime=0; el.play().catch(()=>{}); }catch(e){}
}
document.getElementById('btn-mute').addEventListener('click',()=>{
  muted = !muted;
  const bg = document.getElementById('audio-bg');
  document.getElementById('btn-mute').textContent = muted ? '🔇' : '🔊';
  if(muted){ bg.pause(); } else { bg.play().catch(()=>{}); }
});
function tryStartBg(){
  const bg=document.getElementById('audio-bg');
  bg.volume=0.4;
  bg.play().catch(()=>{ /* needs user gesture, retried on first click */ });
}
document.body.addEventListener('click', function once(){ tryStartBg(); document.body.removeEventListener('click',once); }, {once:true});

/* ---------- 5. NAVIGATION helpers ---------- */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function showPanel(id){
  document.getElementById('lobby-main').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
}
function backToMain(){
  document.getElementById('lobby-main').classList.remove('hidden');
  document.getElementById('panel-bubby').classList.add('hidden');
  document.getElementById('panel-hunny').classList.add('hidden');
}

document.getElementById('opt-bubby').addEventListener('click', ()=>{ showPanel('panel-bubby'); startAsBubby(); });
document.getElementById('opt-hunny').addEventListener('click', ()=>{ showPanel('panel-hunny'); joinAsHunny(); });
document.getElementById('opt-solo').addEventListener('click', openCatalogSolo);
document.getElementById('back-from-bubby').addEventListener('click', ()=>{ if(peer) peer.destroy(); backToMain(); });
document.getElementById('back-from-hunny').addEventListener('click', ()=>{ if(peer) peer.destroy(); backToMain(); });
document.getElementById('btn-retry-bubby').addEventListener('click', ()=>{ if(peer) peer.destroy(); startAsBubby(); });
document.getElementById('btn-retry-hunny').addEventListener('click', ()=>{ if(peer) peer.destroy(); joinAsHunny(); });
document.getElementById('close-catalog').addEventListener('click', ()=>document.getElementById('modal-catalog').classList.remove('show'));
document.getElementById('close-hiddengem').addEventListener('click', ()=>document.getElementById('modal-hiddengem').classList.remove('show'));

/* ---------- 6. PEERJS CONNECTION ---------- */
/* STUN alone frequently fails when the two players are on different
   networks (e.g. one on WiFi, one on cellular data) because of NAT —
   very common for LDR couples. A TURN relay fixes that by relaying
   traffic when a direct P2P path can't be found. The OpenRelay project
   (metered.ca) provides a free public demo TURN server for exactly
   this purpose. If you want a more reliable/private option long-term,
   get your own free TURN credentials at https://www.metered.ca/tools/openrelay/
   and swap them in below. */
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.relay.metered.ca:80' },
    { urls: 'turn:global.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:global.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:global.relay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
  ]
};
const PEER_OPTS = { config: ICE_CONFIG, debug: 1 };
const CONNECT_TIMEOUT_MS = 20000;

/* Fixed, no-typing-needed room. Bubby always hosts on this exact ID,
   Hunny always connects to this exact ID — nobody has to read/type a code.
   Kept distinctive so it doesn't collide with strangers on the public
   PeerJS broker. */
const ROOM_ID = 'our-memory-battle-hunnybubby-room-9f3k2';

function peerLibMissing(statusEl){
  if(typeof Peer === 'undefined'){
    statusEl.textContent = '⚠️ Modul koneksi (peerjs.min.js) gagal dimuat. Pastikan file peerjs.min.js ada di folder yang sama dengan index.html.';
    return true;
  }
  return false;
}

function friendlyPeerError(err){
  const type = (err && err.type) || 'unknown';
  const map = {
    'browser-incompatible': 'Browser ini tidak mendukung WebRTC. Coba pakai Chrome/Safari versi terbaru.',
    'disconnected': 'Terputus dari server sinyal. Coba refresh halaman.',
    'network': 'Masalah jaringan. Cek koneksi internet dan coba lagi.',
    'peer-unavailable': 'Bubby belum buka room. Minta Bubby tekan tombol "Bubby" dulu, baru Hunny coba lagi.',
    'server-error': 'Server sinyal PeerJS sedang bermasalah. Coba lagi sebentar lagi.',
    'socket-error': 'Gagal konek ke server sinyal. Cek internet kamu.',
    'socket-closed': 'Koneksi ke server sinyal terputus. Coba refresh halaman.',
    'unavailable-id': 'Room masih dianggap aktif dari sesi sebelumnya. Coba lagi dalam beberapa detik.',
    'webrtc': 'Gagal membangun koneksi WebRTC (kemungkinan diblokir jaringan/firewall).'
  };
  return (map[type] || ('Error: ' + type)) + ` [${type}]`;
}

function startAsBubby(retryCount){
  retryCount = retryCount || 0;
  myRole='bubby'; isHost=true;
  const statusEl = document.getElementById('bubby-status');
  const retryBtn = document.getElementById('btn-retry-bubby');
  retryBtn.classList.add('hidden');
  statusEl.textContent = 'Membuka room...';
  if(peerLibMissing(statusEl)) return;
  peer = new Peer(ROOM_ID, PEER_OPTS);

  peer.on('open', ()=>{
    statusEl.textContent = 'Room siap! Menunggu Hunny bergabung...';
  });
  peer.on('connection', c=>{
    conn = c;
    statusEl.textContent = 'Hunny sedang menghubungkan diri...';
    conn.on('open', ()=>{
      statusEl.textContent = 'Hunny terhubung! Memulai game...';
      initGameState();
      sendState();
      goToGame();
    });
    conn.on('data', handleIncoming);
    conn.on('close', ()=>{ statusEl.textContent='Koneksi terputus. Minta Hunny join ulang.'; });
    conn.on('error', err=>{ statusEl.textContent = friendlyPeerError(err); retryBtn.classList.remove('hidden'); });
  });
  peer.on('disconnected', ()=>{ statusEl.textContent='Terputus dari server, mencoba menyambung ulang...'; try{ peer.reconnect(); }catch(e){} });
  peer.on('error', err=>{
    if(err && err.type==='unavailable-id' && retryCount<4){
      statusEl.textContent = 'Room masih terdaftar dari sesi sebelumnya, mencoba lagi...';
      try{ peer.destroy(); }catch(e){}
      setTimeout(()=>startAsBubby(retryCount+1), 2500);
      return;
    }
    statusEl.textContent = friendlyPeerError(err);
    retryBtn.classList.remove('hidden');
  });
}

function joinAsHunny(retryCount){
  retryCount = retryCount || 0;
  myRole='hunny'; isHost=false;
  const statusEl = document.getElementById('hunny-status');
  const retryBtn = document.getElementById('btn-retry-hunny');
  retryBtn.classList.add('hidden');
  statusEl.textContent = 'Menghubungkan ke server...';
  if(peerLibMissing(statusEl)) return;
  peer = new Peer(PEER_OPTS);

  let settled = false;
  const timeoutId = setTimeout(()=>{
    if(!settled){
      statusEl.textContent = 'Koneksi terlalu lama. Pastikan Bubby sudah menekan tombol "Bubby" dan sedang menunggu, lalu coba lagi.';
      retryBtn.classList.remove('hidden');
    }
  }, CONNECT_TIMEOUT_MS);

  function attemptConnect(){
    statusEl.textContent='Menghubungkan ke Bubby...';
    conn = peer.connect(ROOM_ID, {reliable:true});
    conn.on('open', ()=>{
      settled = true; clearTimeout(timeoutId);
      statusEl.textContent='Terhubung! Menunggu Bubby memulai game...';
    });
    conn.on('data', data=>{
      settled = true; clearTimeout(timeoutId);
      handleIncoming(data);
      if(G) goToGame();
    });
    conn.on('close', ()=>{ statusEl.textContent='Koneksi terputus.'; });
  }

  peer.on('open', attemptConnect);
  peer.on('disconnected', ()=>{ statusEl.textContent='Terputus dari server, mencoba menyambung ulang...'; try{ peer.reconnect(); }catch(e){} });
  peer.on('error', err=>{
    /* 'peer-unavailable' fires here (peer-level), not on the connection,
       when Bubby hasn't opened the room yet — retry a few times since
       Bubby may just be a moment behind. */
    if(err && err.type==='peer-unavailable' && retryCount<4){
      retryCount++;
      statusEl.textContent = `Bubby belum siap, mencoba lagi... (${retryCount}/4)`;
      setTimeout(attemptConnect, 3000);
      return;
    }
    settled = true; clearTimeout(timeoutId);
    statusEl.textContent = friendlyPeerError(err);
    retryBtn.classList.remove('hidden');
  });
}

function sendState(){
  if(conn && conn.open) conn.send({type:'state', payload:G});
}
function handleIncoming(data){
  if(!data) return;
  if(data.type==='state'){
    G = data.payload;
    render();
    if(G.pendingFx) runFx(G.pendingFx);
  }
}

/* ---------- 7. GAME STATE INIT ---------- */
function shuffle(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function initGameState(){
  const shuffled = shuffle(deck40).map(c=>({...c, uid: c.id+'-'+Math.random().toString(36).slice(2,7)}));
  shuffled.push({...hiddenGemCard, uid:'gem-'+Math.random().toString(36).slice(2,7)}); // bottom of pack
  const drawPile = shuffled;
  const hands = {hunny:[], bubby:[]};
  ['hunny','bubby'].forEach(role=>{
    for(let i=0;i<3;i++) hands[role].push(drawPile.shift());
  });
  G = {
    turn:'hunny',
    hp:{hunny:MAX_HP, bubby:MAX_HP},
    hands,
    drawPile,
    discard:[],
    log:['🎮 Game dimulai! Giliran pertama: Hunny.'],
    pending:null,
    doubleAttackFor:null,
    skipNext:null,
    gemRevealedTo:{hunny:false,bubby:false},
    gameOver:false,
    winner:null,
    pendingFx:null
  };
}

function goToGame(){
  showScreen('screen-game');
  if(isHost && G && G.turn===myRole && G.hands[myRole].length<=3 && G.drawPile.length){
    drawCardForTurn();
  }
  render();
}

/* ---------- 8. LOG / STATE SYNC HELPER ---------- */
function log(msg){ G.log.push(msg); if(G.log.length>60) G.log.shift(); }
function commit(fx){
  G.pendingFx = fx || null;
  render();
  if(fx) runFx(fx);
  sendState();
}

/* ---------- 9. TURN / DRAW ---------- */
function drawCardForTurn(){
  const role = G.turn;
  if(G.drawPile.length===0) return;
  const card = G.drawPile.shift();
  G.hands[role].push(card);
  log(`${roleLabel(role)} menarik kartu: ${card.name}`);
  playSfx('audio-draw');
}
function roleLabel(r){ return r==='hunny' ? '🌹 Hunny' : '👑 Bubby'; }
function otherRole(r){ return r==='hunny' ? 'bubby' : 'hunny'; }

function endTurn(){
  if(G.gameOver) return;
  let next = otherRole(G.turn);
  if(G.skipNext === next){
    log(`${roleLabel(next)} melewati giliran karena Skip Turn!`);
    G.skipNext = null;
    next = G.turn; // current player goes again
  }
  G.turn = next;
  if(G.drawPile.length>0){
    const card = G.drawPile.shift();
    G.hands[G.turn].push(card);
    log(`${roleLabel(G.turn)} menarik kartu: ${card.name}`);
  } else {
    checkGameOverByDeck();
  }
  checkGameOverByHp();
}

/* ---------- 10. PLAY CARD ---------- */
function isMyTurn(){ return G && !G.gameOver && G.turn===myRole; }

function playCard(uid){
  if(!isMyTurn() || G.pending) return;
  const hand = G.hands[myRole];
  const idx = hand.findIndex(c=>c.uid===uid);
  if(idx===-1) return;
  const card = hand[idx];

  if(card.type==='special'){
    openHiddenGemModal();
    return;
  }

  hand.splice(idx,1);
  G.discard.push(card);
  playSfx('audio-play');

  if(card.type==='attack'){
    let val = card.value;
    if(G.doubleAttackFor===myRole){ val*=2; G.doubleAttackFor=null; log('💥 Double Attack aktif! Damage x2!'); }
    G.pending = {attacker:myRole, target:otherRole(myRole), cardName:card.name, cardDesc:card.desc, value:val, awaitingCounter:true};
    log(`${roleLabel(myRole)} menyerang dengan "${card.name}" (${val} DMG)! Menunggu respon...`);
    commit({fx:'play'});
    return;
  }

  if(card.type==='heal'){
    G.hp[myRole] = Math.min(MAX_HP, G.hp[myRole]+card.value);
    log(`${roleLabel(myRole)} memakai "${card.name}" dan pulih +${card.value} HP! (${card.desc})`);
    playSfx('audio-heal');
    commit({fx:'heal', role:myRole});
    endTurn();
    commit();
    return;
  }

  if(card.type==='counter'){
    log(`${roleLabel(myRole)} menyiapkan "${card.name}" tapi tidak ada serangan untuk di-counter.`);
    commit();
    endTurn();
    commit();
    return;
  }

  if(card.type==='trap'){
    applyTrap(card, myRole);
    commit({fx:'play'});
    return;
  }
}

function applyTrap(card, role){
  const opp = otherRole(role);
  if(card.id===37){ // Swap Heart
    const tmp = G.hp[role]; G.hp[role]=G.hp[opp]; G.hp[opp]=tmp;
    log(`🔄 Swap Heart! HP ${roleLabel(role)} dan ${roleLabel(opp)} tertukar!`);
    endTurn();
  } else if(card.id===38){ // Skip Turn
    G.skipNext = opp;
    log(`⏭️ Skip Turn! ${roleLabel(opp)} akan melewati giliran berikutnya.`);
    endTurn();
  } else if(card.id===39){ // Double Attack
    G.doubleAttackFor = role;
    log(`🔥 Double Attack aktif untuk ${roleLabel(role)} di serangan berikutnya!`);
    endTurn();
  } else if(card.id===40){ // Ticket Meetup - simple auto choice via prompt-less: apply to self by default rule -> ask
    // handled via UI choice before calling applyTrap for this card; fallback:
    G.hp[role] = Math.min(MAX_HP, G.hp[role]+40);
    log(`🎫 Ticket Meetup! ${roleLabel(role)} +40 HP.`);
    endTurn();
  }
  checkGameOverByHp();
}

/* Ticket Meetup needs a choice — intercept before generic playCard trap branch */
function playTrapWithChoice(uid){
  const hand = G.hands[myRole];
  const idx = hand.findIndex(c=>c.uid===uid);
  const card = hand[idx];
  if(card.id!==40){ playCard(uid); return; }
  const choice = confirm('Ticket Meetup:\nOK = Tambah +40 HP untukmu\nCancel = Kurangi -40 HP lawan');
  hand.splice(idx,1);
  G.discard.push(card);
  playSfx('audio-play');
  if(choice){
    G.hp[myRole]=Math.min(MAX_HP,G.hp[myRole]+40);
    log(`🎫 Ticket Meetup! ${roleLabel(myRole)} memilih +40 HP untuk diri sendiri.`);
  } else {
    G.hp[otherRole(myRole)]=Math.max(0,G.hp[otherRole(myRole)]-40);
    log(`🎫 Ticket Meetup! ${roleLabel(myRole)} memilih -40 HP untuk ${roleLabel(otherRole(myRole))}.`);
  }
  endTurn();
  checkGameOverByHp();
  commit({fx:'play'});
}

/* ---------- 11. RESPOND TO ATTACK (counter or pass) ---------- */
function respondWithCounter(uid){
  if(!G.pending || !G.pending.awaitingCounter) return;
  if(G.pending.target !== myRole) return;
  const hand = G.hands[myRole];
  const idx = hand.findIndex(c=>c.uid===uid);
  if(idx===-1 || hand[idx].type!=='counter') return;
  const counterCard = hand[idx];
  hand.splice(idx,1);
  G.discard.push(counterCard);
  playSfx('audio-counter');

  const atk = G.pending;
  if(counterCard.id===31){ // LDR Shield - damage 0
    log(`🛡️ ${roleLabel(myRole)} menggunakan LDR Shield! Damage jadi 0.`);
  } else if(counterCard.id===32){ // Uno Reverse - reflect to attacker
    G.hp[atk.attacker] = Math.max(0, G.hp[atk.attacker]-atk.value);
    log(`🔁 Uno Reverse! ${roleLabel(atk.attacker)} kena damage sendiri sebesar ${atk.value}!`);
  } else if(counterCard.id===33){ // Sinyal Jelek - cancel
    log(`📶 Sinyal Jelek! Serangan dibatalkan total.`);
  } else if(counterCard.id===34){ // Gengsi Defense - 25% damage
    const dmg = Math.round(atk.value*0.25);
    G.hp[myRole] = Math.max(0, G.hp[myRole]-dmg);
    log(`😤 Gengsi Defense! ${roleLabel(myRole)} hanya kena ${dmg} damage (25%).`);
  } else if(counterCard.id===35){ // Counter Cium - cancel
    log(`💋 Counter Cium! Serangan ditolak dengan kiss virtual.`);
  } else if(counterCard.id===36){ // Mirror Healing - only meaningful after heal; as counter to attack, treat as shield
    log(`🪞 Mirror Healing digunakan sebagai pertahanan darurat! Damage jadi 0.`);
  }
  G.pending = null;
  checkGameOverByHp();
  endTurn();
  commit({fx:'counter'});
}

function passCounter(){
  // target chooses not to counter -> attacker judges
  if(!G.pending || G.pending.target!==myRole) return;
  G.pending.awaitingCounter=false;
  G.pending.awaitingJudgement=true;
  log(`${roleLabel(myRole)} tidak melakukan counter. Menunggu penilaian ${roleLabel(G.pending.attacker)}...`);
  commit();
}

function judgeChallenge(success){
  if(!G.pending || G.pending.attacker!==myRole || !G.pending.awaitingJudgement) return;
  const atk = G.pending;
  let dmg = atk.value;
  if(success){
    dmg = Math.round(dmg*0.5);
    log(`🟢 Tantangan Berhasil! Damage dikurangi 50% menjadi ${dmg}.`);
  } else {
    log(`🔴 Tantangan Gagal / Gengsi! Full damage ${dmg} ke ${roleLabel(atk.target)}!`);
  }
  G.hp[atk.target] = Math.max(0, G.hp[atk.target]-dmg);
  G.pending = null;
  playSfx('audio-hit');
  checkGameOverByHp();
  endTurn();
  commit({fx:'hit', role:atk.target});
}

/* ---------- 12. GAME OVER ---------- */
function checkGameOverByHp(){
  if(G.hp.hunny<=0 || G.hp.bubby<=0){
    G.gameOver=true;
    G.winner = G.hp.hunny<=0 ? 'bubby' : (G.hp.bubby<=0 ? 'hunny' : null);
    if(G.hp.hunny<=0 && G.hp.bubby<=0) G.winner=null;
    log('🏆 Game selesai!');
  }
}
function checkGameOverByDeck(){
  const bothHandsEmpty = G.hands.hunny.length===0 && G.hands.bubby.length===0;
  if(G.drawPile.length===0 && bothHandsEmpty){
    G.gameOver=true;
    G.winner = G.hp.hunny===G.hp.bubby ? null : (G.hp.hunny>G.hp.bubby?'hunny':'bubby');
    log('🃏 Kartu habis! Game selesai.');
  }
}

/* ---------- 13. HIDDEN GEM ---------- */
function openHiddenGemModal(){
  document.getElementById('modal-hiddengem').classList.add('show');
}
function openCatalogSolo(){
  renderCatalog();
  document.getElementById('modal-catalog').classList.add('show');
}
function renderCatalog(){
  const grid = document.getElementById('catalog-grid');
  grid.innerHTML='';
  deck40.forEach(c=> grid.appendChild(buildCardEl(c, {clickable:false})) );
  const gemEl = buildCardEl(hiddenGemCard, {clickable:true, onClick:openHiddenGemModal});
  grid.appendChild(gemEl);
}

/* ---------- 14. RENDER ---------- */
function buildCardEl(card, opts){
  opts = opts||{};
  const wrap = document.createElement('div');
  wrap.className='card-wrap';
  wrap.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">${TYPE_ICON[card.type]||'🂠'}</div>
      <div class="card-face card-front type-${card.type}">
        <div class="card-img-slot"></div>
        <div class="card-type-tag">${TYPE_ICON[card.type]} ${card.type.toUpperCase()}</div>
        <div class="card-name">${card.name}</div>
        ${card.value ? `<div class="card-value">${card.type==='attack'?'-':card.type==='heal'?'+':''}${card.value}</div>` : ''}
        <div class="card-desc-mini">${card.desc}</div>
      </div>
    </div>
  `;
  const slot = wrap.querySelector('.card-img-slot');
  const img = document.createElement('img');
  img.className='card-img';
  img.src = card.img;
  img.alt = card.name;
  img.onerror = function(){
    const digital = document.createElement('div');
    digital.className='card-digital';
    digital.textContent = TYPE_ICON[card.type]||'🂠';
    slot.replaceWith(digital);
  };
  slot.appendChild(img);

  if(opts.clickable!==false){
    wrap.addEventListener('click', ()=>{ if(opts.onClick) opts.onClick(card, wrap); });
  }
  return wrap;
}

function render(){
  if(!G) return;
  document.getElementById('hp-hunny-num').textContent = `${G.hp.hunny}/${MAX_HP}`;
  document.getElementById('hp-bubby-num').textContent = `${G.hp.bubby}/${MAX_HP}`;
  document.getElementById('hp-hunny-bar').style.width = Math.max(0, (G.hp.hunny/MAX_HP)*100)+'%';
  document.getElementById('hp-bubby-bar').style.width = Math.max(0, (G.hp.bubby/MAX_HP)*100)+'%';
  document.getElementById('hp-hunny').classList.toggle('me', myRole==='hunny');
  document.getElementById('hp-bubby').classList.toggle('me', myRole==='bubby');

  const ti = document.getElementById('turn-indicator');
  ti.textContent = 'Giliran: ' + roleLabel(G.turn);
  ti.style.background = G.turn===myRole ? 'linear-gradient(135deg,#ff3366,#ffd700)' : 'rgba(255,255,255,0.08)';
  ti.style.color = G.turn===myRole ? '#1a0933' : 'var(--text-dim)';

  document.getElementById('deck-count').textContent = G.drawPile.length;
  document.getElementById('hand-count').textContent = G.hands[myRole] ? G.hands[myRole].length : 0;

  const logEl = document.getElementById('battle-log');
  logEl.innerHTML = G.log.slice(-25).map(l=>`<div>${l}</div>`).join('');
  logEl.scrollTop = logEl.scrollHeight;

  renderPendingPanel();
  renderHand();

  if(G.gameOver) showEnding();
}

function renderPendingPanel(){
  const panel = document.getElementById('pending-panel');
  const btnsEl = document.getElementById('pending-btns');
  btnsEl.innerHTML='';
  if(!G.pending){ panel.classList.remove('show'); return; }
  panel.classList.add('show');
  const p = G.pending;
  document.getElementById('pending-title').textContent = `⚔️ ${roleLabel(p.attacker)} menyerang ${roleLabel(p.target)}!`;
  document.getElementById('pending-desc').textContent = `"${p.cardName}" — ${p.cardDesc} (${p.value} DMG)`;

  if(p.awaitingCounter && myRole===p.target){
    const passBtn = document.createElement('button');
    passBtn.className='btn secondary small';
    passBtn.textContent='Tidak Counter (Terima Tantangan)';
    passBtn.onclick = passCounter;
    btnsEl.appendChild(passBtn);
  } else if(p.awaitingJudgement && myRole===p.attacker){
    const okBtn=document.createElement('button');
    okBtn.className='btn small'; okBtn.textContent='🟢 Tantangan Berhasil (-50%)';
    okBtn.onclick=()=>judgeChallenge(true);
    const failBtn=document.createElement('button');
    failBtn.className='btn secondary small'; failBtn.textContent='🔴 Tantangan Gagal / Gengsi';
    failBtn.onclick=()=>judgeChallenge(false);
    btnsEl.appendChild(okBtn); btnsEl.appendChild(failBtn);
  } else {
    const waitEl=document.createElement('div');
    waitEl.style.fontSize='12px'; waitEl.style.color='var(--text-dim)';
    waitEl.textContent = 'Menunggu respon lawan...';
    btnsEl.appendChild(waitEl);
  }
}

function renderHand(){
  const area = document.getElementById('hand-area');
  area.innerHTML='';
  if(!G.hands[myRole]) return;

  const respondingToCounter = G.pending && G.pending.awaitingCounter && G.pending.target===myRole;

  G.hands[myRole].forEach(card=>{
    const canPlayNormally = isMyTurn() && !G.pending;
    const canCounter = respondingToCounter && card.type==='counter';
    const clickable = canPlayNormally || canCounter || card.type==='special';
    const el = buildCardEl(card, {
      clickable:true,
      onClick:()=>{
        if(card.type==='special'){ openHiddenGemModal(); return; }
        if(canCounter){ respondWithCounter(card.uid); return; }
        if(canPlayNormally){ playTrapWithChoice(card.uid); return; }
      }
    });
    if(!clickable) el.classList.add('disabled');
    area.appendChild(el);
  });
}

/* ---------- 15. FX ---------- */
function runFx(fx){
  if(!fx) return;
  if(fx.fx==='hit'){
    document.body.classList.add('shake','flash-red');
    setTimeout(()=>document.body.classList.remove('shake','flash-red'), 450);
    playSfx('audio-hit');
  } else if(fx.fx==='heal'){
    spawnSparkles();
  } else if(fx.fx==='counter'){
    playSfx('audio-counter');
  }
}
function spawnSparkles(){
  for(let i=0;i<8;i++){
    const s = document.createElement('div');
    s.className='sparkle';
    s.textContent='✨';
    s.style.left = (40+Math.random()*20)+'%';
    s.style.top = (50+Math.random()*20)+'%';
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 1000);
  }
}

/* ---------- 16. ENDING ---------- */
function showEnding(){
  showScreen('screen-ending');
  const winnerEl = document.getElementById('ending-winner');
  const hpEl = document.getElementById('ending-hp');
  if(G.winner){
    winnerEl.textContent = `${roleLabel(G.winner)} menang pertarungan ini! 🎉`;
  } else {
    winnerEl.textContent = `Seri! Kalian berdua sama-sama juara cinta. 💜`;
  }
  hpEl.textContent = `Sisa HP — Hunny: ${G.hp.hunny}/${MAX_HP} · Bubby: ${G.hp.bubby}/${MAX_HP}`;
  launchConfetti();
}
function launchConfetti(){
  const layer = document.getElementById('confetti-layer');
  layer.innerHTML='';
  const colors=['#ff3366','#ffd700','#00ff99','#00e5ff','#ff8ec6'];
  for(let i=0;i<80;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    p.style.left=Math.random()*100+'%';
    p.style.background=colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration=(2.5+Math.random()*2.5)+'s';
    p.style.animationDelay=(Math.random()*1.5)+'s';
    layer.appendChild(p);
  }
  setTimeout(()=>layer.innerHTML='', 6000);
}