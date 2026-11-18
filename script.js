// ============ FIREBASE CONFIG ============
const firebaseConfig = {
  apiKey: "AIzaSyBhh3nIzAWyvT47HQ-hh6umjqoCMYBI1Lk",
  authDomain: "johcards-2db9b.firebaseapp.com",
  projectId: "johcards-2db9b",
  storageBucket: "johcards-2db9b.firebasestorage.app",
  messagingSenderId: "955656442066",
  appId: "1:955656442066:web:3f0d0335191d67eac61d0b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============ KUSOMA LINK ============
// Link ina muundo: ...?e=TUKIO_ID&g=MGENI_ID
const params = new URLSearchParams(window.location.search);
const eventId = params.get('e');
const guestId = params.get('g');

let guestRef = null;

// ============ HELPERS ============
function onyeshaHali(maandishi){
  document.getElementById('hali').textContent = maandishi;
  document.getElementById('hali').style.display = '';
  document.getElementById('maudhui').style.display = 'none';
}

function onyeshaMaudhui(){
  document.getElementById('hali').style.display = 'none';
  document.getElementById('maudhui').style.display = '';
}

// '2027-03-13' -> '13 Machi 2027'
function fomatiTarehe(tarehe){
  if(!tarehe) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarehe);
  if(!m) return tarehe;
  const miezi = ['Januari','Februari','Machi','Aprili','Mei','Juni','Julai',
                 'Agosti','Septemba','Oktoba','Novemba','Desemba'];
  return parseInt(m[3], 10) + ' ' + miezi[parseInt(m[2], 10) - 1] + ' ' + m[1];
}

// Onyesha chaguo lililochaguliwa na ujumbe wa shukrani
function onyeshaJibu(chaguo){
  const ndiyo = document.getElementById('btnNdiyo');
  const hapana = document.getElementById('btnHapana');
  const shukrani = document.getElementById('shukrani');

  ndiyo.classList.toggle('chaguliwa', chaguo === 'yes');
  hapana.classList.toggle('chaguliwa', chaguo === 'no');

  if(chaguo === 'yes'){
    shukrani.textContent = 'Asante! Tumepokea jibu lako: utahudhuria. Karibu sana.';
  }else if(chaguo === 'no'){
    shukrani.textContent = 'Asante kwa kutujulisha. Tumepokea jibu lako: hutaweza kuhudhuria.';
  }else{
    shukrani.textContent = '';
  }
}

// ============ KUPAKIA MWALIKO ============
async function pakia(){
  if(!eventId || !guestId){
    onyeshaHali('Link hii si sahihi. Tafadhali tumia link uliyotumiwa kwenye mwaliko wako.');
    return;
  }

  try{
    const tukioRef = db.collection('events').doc(eventId);
    guestRef = tukioRef.collection('guests').doc(guestId);

    const [tukioDoc, mgeniDoc] = await Promise.all([tukioRef.get(), guestRef.get()]);

    if(!tukioDoc.exists || !mgeniDoc.exists){
      onyeshaHali('Mwaliko huu haupatikani. Tafadhali wasiliana na mwenyeji wako.');
      return;
    }

    const tukio = tukioDoc.data();
    const mgeni = mgeniDoc.data();

    document.getElementById('jinaMgeni').textContent = mgeni.name || '';
    document.getElementById('jinaTukio').textContent = tukio.name || '';
    document.getElementById('tarehe').textContent = fomatiTarehe(tukio.date);
    document.getElementById('venue').textContent = tukio.venue || '';

    onyeshaJibu(mgeni.rsvp || null);
    onyeshaMaudhui();
  }catch(err){
    console.error(err);
    onyeshaHali('Imeshindikana kupakia mwaliko. Angalia mtandao wako kisha jaribu tena.');
  }
}

// ============ KUTOA JIBU ============
async function jibu(chaguo){
  if(!guestRef) return;

  const ndiyo = document.getElementById('btnNdiyo');
  const hapana = document.getElementById('btnHapana');
  const shukrani = document.getElementById('shukrani');

  ndiyo.disabled = true;
  hapana.disabled = true;
  shukrani.textContent = 'Inahifadhi jibu lako...';

  try{
    await guestRef.update({
      rsvp: chaguo,
      rsvpAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    onyeshaJibu(chaguo);
  }catch(err){
    console.error(err);
    shukrani.textContent = 'Imeshindikana kuhifadhi jibu. Tafadhali jaribu tena.';
  }finally{
    ndiyo.disabled = false;
    hapana.disabled = false;
  }
}

pakia();