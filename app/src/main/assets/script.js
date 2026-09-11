(() => {
"use strict";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const storeKey = "emmaKeyboardStateV1";

const defaults = {
  settings:{autoCorrect:true,suggestionsOn:true,learnWords:true,autoSpace:true,doublePeriod:true,numberRow:false,
    keyboardSize:"medium",height:310,spacing:4,padding:8,roundedKeys:true,keyBorders:true,language:"en",
    keySound:false,soundVolume:.35,vibration:true,pressAnimation:true,theme:"system"},
  personalWords:[], learned:{}, recentEmoji:[], clipboard:[], lastCorrection:null
};
let state = loadState();
let currentLang = state.settings.language;
let activePanel = null;
let recognition = null;
let voiceListening = false;
let audioCtx = null;
let soundGain = null;
let currentEmojiCategory = "Smileys";

const layouts = {
  en: [["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l"],["z","x","c","v","b","n","m"]],
  ur: [["ق","و","ع","ر","ت","ے","ی","ا","و","پ"],["ا","س","د","ف","گ","ہ","ج","ک","ل"],["ز","خ","چ","ط","ب","ن","م"]]
};
const urFallback = ["ا","ب","پ","ت","ٹ","ث","ج","چ","ح","خ","د","ڈ","ذ","ر","ڑ","ز","ژ","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ک","گ","ل","م","ن","و","ہ","ء","ی","ے"];

const corrections = {
  teh:"the", adn:"and", dont:"don't", im:"I'm", cant:"can't", wont:"won't", isnt:"isn't",
  didnt:"didn't", doesnt:"doesn't", youre:"you're", ive:"I've", id:"I'd", ill:"I'll", thats:"that's",
  whats:"what's", lets:"let's", wasnt:"wasn't", couldnt:"couldn't", wouldnt:"wouldn't"
};
const common = {
  en:["the","to","and","you","of","a","in","is","for","that","it","on","with","are","as","was","this","be","have","your","we","can","not","do","but","my","I","me","what","how","are","they","good","today","thanks","please","yes","no"],
  ur:["میں","ہے","ہیں","کا","کی","کے","کو","اور","یہ","وہ","آپ","میں","سے","پر","نہیں","کیا","اگر","تو","بھی","ایک","میرا","میری","ہم","تم","کیا","کیسے","اچھا","آج","شکریہ"]
};

const emojiData = {
  Recent:[], Smileys:"😀 😃 😄 😁 😆 😅 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😋 😛 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕","People":"👋 🤚 🖐️ ✋ 🖖 👌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✍️ 👏 🙌 👐 🤝 🙏 💪 🖕 ❤️ 🫶 💋 👄 👀 👁️ 🧠 🫀 👶 🧒 👦 👧 🧑 👨 👩 🧔 👴 👵","Animals":"🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🦄 🐝 🦋 🐌 🐞 🐜 🕷️ 🦂 🐢 🐍 🦎 🐙 🐠 🐟 🐬 🐳 🐊 🐘 🦒 🦓 🦍","Food":"🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🥕 🌽 🥔 🍞 🧀 🍔 🍟 🍕 🌭 🌮 🌯 🥗 🍿 🍜 🍲 🍛 🍚 🍣 🍪 🎂 🍰 🍫 🍬 ☕ 🧃","Activities":"⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🪀 🏓 🏸 🥊 🏋️ 🤸 🏊 🚴 🏆 🥇 🥈 🥉 🎮 🎲 🎯 🎨 🎭 🎵 🎶 🎤","Travel":"🚗 🚕 🚌 🚎 🏎️ 🚓 🚑 🚒 🚚 🚜 🛵 🏍️ 🚲 ✈️ 🚁 🚂 🚆 🚇 🚉 🚢 ⛵ 🚀 🗺️ 🗽 🗼 🏰 🏖️ 🏝️ 🏔️","Objects":"⌚ 📱 💻 ⌨️ 🖱️ 📷 🔦 💡 📺 📻 🎧 🎙️ 🔑 🔒 🔓 💰 💳 📚 ✏️ 📝 📌 📎 🔗 🎁 🛍️","Symbols":"❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💯 💢 💥 💫 ✨ ⭐ 🌟 ⚠️ ❗ ❓ ‼️ ⁉️ ✔️ ❌ ➕ ➖ ✖️ ➗ ♻️ ☑️","Flags":"🇵🇰 🇮🇳 🇺🇸 🇬🇧 🇦🇪 🇸🇦 🇹🇷 🇩🇪 🇫🇷 🇪🇸 🇨🇳 🇯🇵 🇨🇦 🇦🇺 🇮🇹 🇧🇩 🇦🇫 🇮🇷 🇶🇦 🇰🇼"
};
Object.keys(emojiData).forEach(k => { if(typeof emojiData[k] === "string") emojiData[k] = emojiData[k].split(" ").filter(Boolean); });

function loadState(){
  try { const x=JSON.parse(localStorage.getItem(storeKey)); return deepMerge(structuredClone(defaults),x||{}); }
  catch { return structuredClone(defaults); }
}
function deepMerge(a,b){ if(!b) return a; for(const k of Object.keys(b)){ if(a[k]&&typeof a[k]==="object"&&!Array.isArray(a[k])) a[k]=deepMerge(a[k],b[k]); else a[k]=b[k]; } return a; }
function save(){ localStorage.setItem(storeKey,JSON.stringify(state)); }

function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove("show"),1500); }
function isSensitive(){ return /password|pin|otp|cc-number|new-password/i.test($("#editor").getAttribute("autocomplete")||""); }
function textContext(){
  const el=$("#editor"), pos=el.selectionStart, before=el.value.slice(0,pos);
  const m=before.match(/(\S+)$/); return {before, pos, word:m?m[1]:"", start:m?pos-m[1].length:pos};
}
function replaceRange(start,end,text,move=true){
  const el=$("#editor"); const value=el.value; el.value=value.slice(0,start)+text+value.slice(end);
  const p=start+text.length; if(move) el.setSelectionRange(p,p); el.dispatchEvent(new Event("input",{bubbles:true})); el.focus();
}
function insertText(text){
  const el=$("#editor"), a=el.selectionStart,b=el.selectionEnd;
  replaceRange(a,b,text);
}
function insertChar(ch){
  const ctx=textContext(), el=$("#editor");
  if(ch===" " && state.settings.autoSpace && ctx.word && !/[ \n]$/.test(ctx.before)){
    if(state.settings.doublePeriod && ctx.before.endsWith(" ")===false && ctx.word && /[.!?]$/.test(ctx.word)) { replaceRange(ctx.start,ctx.pos,ctx.word+"  "); return; }
  }
  insertText(ch);
  if(ch===" "){ maybeCorrect(ctx.word); updateSuggestions(); } else updateSuggestions();
}
function maybeCorrect(word){
  if(!word || isSensitive() || !state.settings.autoCorrect) return;
  const clean=word.replace(/^[^\p{L}]+|[^\p{L}']+$/gu,"");
  if(!clean) return;
  if(state.personalWords.includes(clean) || state.personalWords.includes(clean.toLowerCase())) return;
  const target=corrections[clean.toLowerCase()];
  if(target && target.toLowerCase()!==clean.toLowerCase()){
    const {start,pos}=textContext();
    const corrected=(clean[0]===clean[0]?.toUpperCase() && target[0]) ? target[0].toUpperCase()+target.slice(1) : target;
    replaceRange(start,pos,corrected+" ");
    state.lastCorrection={original:clean,corrected:corrected+" ",start:start};
    save(); toast(`Changed “${clean}” → “${corrected}”`);
  } else if(state.settings.learnWords && clean.length>=3 && !common.en.includes(clean.toLowerCase()) && !state.personalWords.includes(clean)){
    state.learned[clean]=(state.learned[clean]||0)+1; save();
  }
}
function undoCorrection(){
  const c=state.lastCorrection; if(!c){toast("Nothing to undo");return}
  const el=$("#editor"), current=el.value;
  const candidate=c.corrected;
  const segment=current.slice(c.start,c.start+candidate.length);
  if(segment===candidate) replaceRange(c.start,c.start+candidate.length,c.original+" ");
  state.lastCorrection=null; save(); updateSuggestions();
}
function updateSuggestions(){
  const box=$("#suggestions"); box.innerHTML="";
  if(!state.settings.suggestionsOn || isSensitive()) return;
  const {word,before}=textContext();
  const lower=word.toLowerCase();
  const previous=(before.trim().split(/\s+/).slice(-2,-1)[0]||"").toLowerCase();
  let pool=[...(common[currentLang]||common.en),...state.personalWords,...Object.keys(state.learned)];
  const phrase={
    "how":["are","is","you"],"how are":["you","they","things"],"thank":["you","you!","you very much"],
    "good":["morning","night","luck"],"i":["am","will","can"],"are":["you","they","we"],"what":["is","are","do"],
    "میں":["ہوں","ہے","کیا"],"آپ":["کیسے","کا","کی"],"کیا":["ہے","آپ","میں"]
  };
  if(phrase[lower]) pool.unshift(...phrase[lower]); if(phrase[previous+" "+lower]) pool.unshift(...phrase[previous+" "+lower]);
  pool=[...new Set(pool.map(x=>String(x)))];
  const filtered=pool.filter(x=>!lower || x.toLowerCase().startsWith(lower)).slice(0,3);
  (filtered.length?filtered:["the","and","you"]).forEach(x=>{
    const b=document.createElement("button"); b.className="suggestion"; b.textContent=x; b.onclick=()=>acceptSuggestion(x); box.appendChild(b);
  });
}
function acceptSuggestion(word){
  const {start,pos}=textContext(); let out=word;
  if(state.settings.autoSpace) out+=" ";
  replaceRange(start,pos,out); updateSuggestions();
}
function buildKeys(){
  const container=$("#keys"); container.innerHTML="";
  if(state.settings.numberRow){
    const r=document.createElement("div"); r.className="key-row";
    "1234567890".split("").forEach(k=>r.appendChild(makeKey(k))); container.appendChild(r);
  }
  const rows=layouts[currentLang] || layouts.en;
  rows.forEach((row,i)=>{
    const r=document.createElement("div"); r.className="key-row";
    row.forEach(k=>r.appendChild(makeKey(k)));
    container.appendChild(r);
  });
  if(currentLang==="ur" && state.settings.language==="ur"){
    // Add a compact extra row only when Urdu is selected, while keeping the same simple layout.
    const r=document.createElement("div"); r.className="key-row";
    urFallback.slice(0,10).forEach(k=>r.appendChild(makeKey(k))); container.appendChild(r);
  }
}
function makeKey(k){
  const b=document.createElement("button"); b.className="key"; b.textContent=k; b.dataset.key=k;
  b.addEventListener("pointerdown",e=>{ e.preventDefault(); keyPress(k,b); },{passive:false});
  b.addEventListener("contextmenu",e=>e.preventDefault());
  return b;
}
function keyPress(k,b){
  if(state.settings.pressAnimation) { b.classList.add("pressed"); setTimeout(()=>b.classList.remove("pressed"),80); }
  if(state.settings.vibration && navigator.vibrate) navigator.vibrate(7);
  if(state.settings.keySound) beep();
  insertChar(k);
}
function beep(){
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended") audioCtx.resume();
    const o=audioCtx.createOscillator(), g=soundGain||audioCtx.createGain();
    soundGain=g; g.gain.value=state.settings.soundVolume*.035; o.frequency.value=620; o.type="sine";
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+.025);
  }catch{}
}
function backspace(){
  const el=$("#editor"),a=el.selectionStart,b=el.selectionEnd;
  if(a!==b){replaceRange(a,b,"");return}
  if(a===0)return;
  const chars=[...el.value.slice(0,a)]; chars.pop();
  replaceRange(a-[...el.value.slice(0,a)].slice(-1)[0]?.length||1,a,"");
}
let backspaceTimer;
$("#backspaceKey").addEventListener("pointerdown",e=>{e.preventDefault();backspace();backspaceTimer=setInterval(backspace,65)});
["pointerup","pointercancel","pointerleave"].forEach(ev=>$("#backspaceKey").addEventListener(ev,()=>clearInterval(backspaceTimer)));
$("#spaceKey").addEventListener("pointerdown",e=>{e.preventDefault();insertChar(" ")});
$("#enterKey").addEventListener("pointerdown",e=>{e.preventDefault();insertText("\n")});
$("#editor").addEventListener("input",()=>{ if(!isSensitive()) updateSuggestions(); captureClipboardCandidate(); });
$("#editor").addEventListener("focus",()=>updateSuggestions());

function captureClipboardCandidate(){
  // Web pages cannot observe all device clipboard changes. This only records explicit in-app copy actions.
}
async function copySelection(){
  const el=$("#editor"), text=el.value.slice(el.selectionStart,el.selectionEnd)||el.value;
  if(!text)return;
  try{await navigator.clipboard.writeText(text); addClipboard(text); toast("Copied");}
  catch{toast("Clipboard permission unavailable");}
}
function addClipboard(text){
  if(!text || isSensitive())return;
  state.clipboard=[{text,pinned:false,ts:Date.now()},...state.clipboard.filter(x=>x.text!==text)].slice(0,50); save(); renderClipboard();
}
async function pasteClipboardItem(text){
  insertText(text); try{await navigator.clipboard.writeText(text)}catch{}; toast("Pasted");
}
function renderClipboard(){
  const q=($("#clipSearch")?.value||"").toLowerCase(), list=$("#clipboardList"); list.innerHTML="";
  state.clipboard.filter(x=>x.text.toLowerCase().includes(q)).forEach((item,i)=>{
    const row=document.createElement("div"); row.className="list-item";
    const c=document.createElement("div"); c.className="content"; c.textContent=item.text;
    const p=document.createElement("button"); p.textContent=item.pinned?"📌":"📍"; p.onclick=()=>{item.pinned=!item.pinned;state.clipboard.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.ts-a.ts);save();renderClipboard()};
    const use=document.createElement("button");use.textContent="Paste";use.onclick=()=>pasteClipboardItem(item.text);
    const del=document.createElement("button");del.textContent="×";del.onclick=()=>{state.clipboard.splice(i,1);save();renderClipboard()};
    row.append(c,p,use,del);list.appendChild(row);
  });
}
function renderEmoji(){
  const q=($("#emojiSearch")?.value||"").toLowerCase(), grid=$("#emojiGrid"); grid.innerHTML="";
  let arr=emojiData[currentEmojiCategory]||[];
  if(currentEmojiCategory==="Recent") arr=state.recentEmoji;
  if(q) arr=[...new Set(Object.values(emojiData).flat().filter(x=>x.toLowerCase().includes(q)))];
  arr.forEach(e=>{const b=document.createElement("button");b.textContent=e;b.onclick=()=>{insertText(e);state.recentEmoji=[e,...state.recentEmoji.filter(x=>x!==e)].slice(0,40);save();};grid.appendChild(b)});
}
function setupEmoji(){
  const cats=$("#emojiCategories"); cats.innerHTML="";
  Object.keys(emojiData).forEach(c=>{const b=document.createElement("button");b.textContent=c;b.onclick=()=>{currentEmojiCategory=c;renderEmoji()};cats.appendChild(b)});
  renderEmoji();
}
function openPanel(id){
  closePanels(); const p=$("#"+id+"Panel"); if(!p)return; p.hidden=false; $("#overlay").hidden=false; activePanel=id; if(id==="emoji")renderEmoji(); if(id==="clipboard")renderClipboard(); if(id==="dictionary")renderDictionary();
}
function closePanels(){ $$(".panel").forEach(p=>p.hidden=true); $("#overlay").hidden=true; activePanel=null; }
$$("[data-panel]").forEach(b=>b.addEventListener("click",()=>openPanel(b.dataset.panel)));
$$("[data-close]").forEach(b=>b.addEventListener("click",closePanels));
$("#overlay").addEventListener("click",closePanels);
$("#settingsBtn").addEventListener("click",()=>openPanel("settings"));
$("#voiceBtn").addEventListener("click",toggleVoice); $("#micBottom").addEventListener("click",toggleVoice);
$("#emojiSearch").addEventListener("input",renderEmoji); $("#clipSearch").addEventListener("input",renderClipboard);

function toggleVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast("Voice typing is not supported in this browser");return}
  if(voiceListening){recognition?.stop();return}
  recognition=new SR(); recognition.lang=currentLang==="ur"?"ur-PK":"en-US"; recognition.interimResults=true; recognition.continuous=false;
  voiceListening=true; $("#statusText").textContent="Listening…"; toast("Listening…");
  recognition.onresult=e=>{let s="";for(let i=e.resultIndex;i<e.results.length;i++)s+=e.results[i][0].transcript;if(e.results[e.results.length-1].isFinal)insertText((state.settings.autoSpace?" ":"")+s.trim())};
  recognition.onerror=e=>toast("Voice error: "+e.error);
  recognition.onend=()=>{voiceListening=false;$("#statusText").textContent="Ready"};
  try{recognition.start()}catch{voiceListening=false}
}

const demoTranslations={
  "hello":"السلام علیکم","how are you":"آپ کیسے ہیں؟","thank you":"شکریہ","good morning":"صبح بخیر","good night":"شب بخیر",
  "what is your name":"آپ کا نام کیا ہے؟","i am fine":"میں ٹھیک ہوں"
};
async function translateText(text,from,to){
  // Native/backend-ready hook. A future Android app can implement this through AndroidBridge.translate.
  if(window.AndroidBridge?.translate) return await window.AndroidBridge.translate(text,from,to);
  if(from==="English"&&to==="Urdu") return demoTranslations[text.trim().toLowerCase()] || "[Offline demo] Translation not available for this phrase.";
  return "[Offline demo] Connect a real translation provider through translateText() for this language pair.";
}
$("#translateBtn").addEventListener("click",async()=>{
  const text=$("#translateInput").value.trim(); if(!text)return;
  $("#translationResult").textContent="Translating…";
  try{$("#translationResult").textContent=await translateText(text,$("#fromLang").value,$("#toLang").value)}catch{$("#translationResult").textContent="Translation failed or offline."}
});
$("#insertTranslation").addEventListener("click",()=>{const t=$("#translationResult").textContent;if(t&&!t.startsWith("["))insertText(t)});

function renderDictionary(){
  const q=($("#dictSearch")?.value||"").toLowerCase(), list=$("#dictionaryList");list.innerHTML="";
  state.personalWords.filter(w=>w.toLowerCase().includes(q)).forEach((w,i)=>{
    const r=document.createElement("div");r.className="list-item";const c=document.createElement("div");c.className="content";c.textContent=w;
    const d=document.createElement("button");d.textContent="Delete";d.onclick=()=>{state.personalWords.splice(i,1);save();renderDictionary()};r.append(c,d);list.appendChild(r)
  });
}
$("#dictionaryBtn").addEventListener("click",()=>openPanel("dictionary"));
$("#dictSearch").addEventListener("input",renderDictionary);
$("#saveNewWord").addEventListener("click",()=>{const w=$("#newWord").value.trim();if(w&&!state.personalWords.includes(w)){state.personalWords.push(w);save();$("#newWord").value="";renderDictionary();toast("Word saved")}});
$("#addWordBtn").addEventListener("click",()=>{const w=textContext().word.replace(/[^\p{L}'-]/gu,"");if(w&&!state.personalWords.includes(w)){state.personalWords.push(w);save();toast("Word saved")}});

$("#clearClipboard").addEventListener("click",()=>{state.clipboard=[];save();renderClipboard();toast("Clipboard cleared")});
$("#clearLearned").addEventListener("click",()=>{state.learned={};save();toast("Learned words cleared")});
$("#resetSettings").addEventListener("click",()=>{state.settings=structuredClone(defaults.settings);currentLang=state.settings.language;save();syncSettings();buildKeys();toast("Settings reset")});

function bindSetting(id,fn){const el=$("#"+id);el.addEventListener("change",()=>{fn(el);save();applySettings();})}
function syncSettings(){
  const s=state.settings;
  ["autoCorrect","suggestionsOn","learnWords","autoSpace","doublePeriod","numberRow","roundedKeys","keyBorders","keySound","vibration","pressAnimation"].forEach(id=>$("#"+id).checked=!!s[id]);
  $("#keyboardSize").value=s.keyboardSize;$("#heightRange").value=s.height;$("#spacingRange").value=s.spacing;$("#paddingRange").value=s.padding;
  $("#language").value=s.language;$("#soundVolume").value=s.soundVolume;$("#theme").value=s.theme;
}
function readSettings(){
  const s=state.settings;
  ["autoCorrect","suggestionsOn","learnWords","autoSpace","doublePeriod","numberRow","roundedKeys","keyBorders","keySound","vibration","pressAnimation"].forEach(id=>s[id]=$("#"+id).checked);
  s.keyboardSize=$("#keyboardSize").value;s.height=+$("#heightRange").value;s.spacing=+$("#spacingRange").value;s.padding=+$("#paddingRange").value;s.language=$("#language").value;s.soundVolume=+$("#soundVolume").value;s.theme=$("#theme").value;
}
function applySettings(){
  readSettings(); currentLang=state.settings.language; buildKeys();
  const root=document.documentElement,s=state.settings;
  root.style.setProperty("--kb-height",s.height+"px");root.style.setProperty("--gap",s.spacing+"px");root.style.setProperty("--bottom-pad",s.padding+"px");
  document.body.classList.toggle("light",s.theme==="light"||(s.theme==="system"&&matchMedia("(prefers-color-scheme:light)").matches));
  document.body.classList.toggle("no-round",!s.roundedKeys); document.body.classList.toggle("no-borders",!s.keyBorders);
  $("#spaceKey").textContent=currentLang==="ur"?"اردو":"English"; updateSuggestions();
}
["autoCorrect","suggestionsOn","learnWords","autoSpace","doublePeriod","numberRow","roundedKeys","keyBorders","keySound","vibration","pressAnimation"].forEach(id=>bindSetting(id,()=>{}));
["keyboardSize","heightRange","spacingRange","paddingRange","soundVolume","theme"].forEach(id=>bindSetting(id,()=>{}));
$("#language").addEventListener("change",()=>{readSettings();save();applySettings()});

document.addEventListener("keydown",e=>{
  if(e.target!==$("#editor"))return;
  if(e.key==="Escape")closePanels();
  if(e.ctrlKey||e.metaKey){
    if(e.key.toLowerCase()==="z"){e.preventDefault();undoCorrection()}
    if(e.key.toLowerCase()==="c") copySelection();
  }
});
$("#editor").addEventListener("copy",()=>{const el=$("#editor");const t=el.value.slice(el.selectionStart,el.selectionEnd);if(t&&!isSensitive())addClipboard(t)});
$("#editor").addEventListener("cut",()=>{setTimeout(()=>{const t=window.getSelection()?.toString();if(t&&!isSensitive())addClipboard(t)},0)});

setupEmoji();syncSettings();applySettings();
window.addEventListener("resize",()=>requestAnimationFrame(()=>applySettings()));
window.matchMedia("(prefers-color-scheme: light)").addEventListener?.("change",()=>applySettings());

// Future Android WebView bridge. Browser-safe: never assume Android APIs exist.
window.AndroidBridge = window.AndroidBridge || {
  insertText: null,
  vibrate: null,
  translate: null,
  getClipboard: null
};
})();

try {
  if (window.AndroidBridge && window.AndroidBridge.isNativeKeyboard &&
      window.AndroidBridge.isNativeKeyboard()) {
    document.documentElement.classList.add('native-ime');
    const ew = document.querySelector('.editor-wrap');
    if (ew) ew.style.display = 'none';
  }
} catch (_) {}
