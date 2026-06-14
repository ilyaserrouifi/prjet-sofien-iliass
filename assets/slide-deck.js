(function(){
  const MIN_SLIDES = 15;
  function txt(el){return (el&&el.textContent||'').trim().replace(/\s+/g,' ')}
  function cleanTitle(value){return value.replace(/^[^\p{L}\p{N}]+/u,'').trim()}
  function wrap(html){return '<div class="deck-card">'+html+'</div>'}
  function titleAccent(t){const words=t.split(/\s+/).filter(Boolean); if(words.length<2)return t; const mid=Math.ceil(words.length/2); return words.slice(0,mid).join(' ')+'<span class="accent">'+words.slice(mid).join(' ')+'</span>'}
  function splitText(text){const parts=text.match(/[^.!?;:]+[.!?;:]?/g)||[text]; const chunks=[]; for(let i=0;i<parts.length;i+=4){chunks.push(parts.slice(i,i+4).join(' ').trim())} return chunks.filter(Boolean)}
  function splitNode(node){
    if(!node) return [];
    if(node.matches && node.matches('table,.formula,.definition,.schema,.graph-schema')) return [wrap(node.outerHTML)];
    if(node.matches && node.matches('ul,ol')){const items=[...node.children]; const out=[]; for(let i=0;i<items.length;i+=5){const list=node.cloneNode(false); items.slice(i,i+5).forEach(li=>list.appendChild(li.cloneNode(true))); out.push(wrap(list.outerHTML));} return out;}
    if(node.matches && node.matches('p')){const parts=splitText(txt(node)); return parts.map(p=>wrap('<p>'+p+'</p>'));}
    if(node.matches && node.matches('.card')){let out=[]; [...node.children].forEach(child=>{out=out.concat(splitNode(child));}); return out.length?out:[wrap(node.innerHTML)];}
    if(node.children && node.children.length){let out=[]; [...node.children].forEach(child=>{out=out.concat(splitNode(child));}); return out.length?out:[wrap(node.outerHTML)];}
    return txt(node)?[wrap(node.outerHTML||txt(node))]:[];
  }
  function collectSections(src){
    const kids=[...src.children].filter(n=>!n.classList.contains('btn-nav'));
    const sections=[]; let lead=[];
    const title=[...src.querySelectorAll(':scope > h1')].map(txt).join(' ');
    for(const n of kids){if(n.matches('h2,h3'))break; if(!n.matches('.chapitre-badge,h1'))lead.push(n)}
    if(lead.length)sections.push({k:'Objectif',h:title,nodes:lead});
    let i=0; while(i<kids.length){const n=kids[i]; if(n.matches('h2,h3')){const h=cleanTitle(txt(n)); const nodes=[]; i++; while(i<kids.length&&!kids[i].matches('h2,h3')){nodes.push(kids[i]); i++;} sections.push({k:n.tagName==='H2'?'Concept clé':'Focus',h,nodes});} else i++;}
    return sections;
  }
  function buildSlides(src){
    const sections=collectSections(src); const slides=[];
    sections.forEach(section=>{let chunks=[]; section.nodes.forEach(n=>chunks=chunks.concat(splitNode(n))); if(!chunks.length)chunks=[wrap('<p>'+section.h+'</p>')]; chunks.forEach((html,idx)=>slides.push({k:section.k,h:idx?section.h+' — suite':section.h,c:html}));});
    if(slides.length<MIN_SLIDES){
      const titles=sections.map(s=>s.h).filter(Boolean); let i=0;
      while(slides.length<MIN_SLIDES && titles.length){slides.push({k:'Synthèse',h:titles[i%titles.length],c:wrap('<p>Point de rappel du chapitre : <strong>'+titles[i%titles.length]+'</strong>.</p>')}); i++;}
    }
    return slides;
  }
  function build(){
    const src=document.querySelector('.container'); if(!src)return;
    const chap=txt(src.querySelector('.chapitre-badge'))||'PFE'; const mainTitle=[...src.querySelectorAll(':scope > h1')].map(txt).join(' '); const slides=buildSlides(src); if(!slides.length)return;
    document.body.classList.add('deck-ready');
    const shell=document.createElement('main'); shell.className='deck-shell'; shell.innerHTML='<section class="slide-frame"><aside class="slide-left"><div class="chapter-pill"></div><h1 class="left-title"></h1><p class="left-subtitle"></p></aside><article class="slide-right"><div class="slide-no">00</div><div class="content-kicker"></div><h2 class="slide-heading"></h2><div class="slide-content"></div><div class="slide-tags"></div></article></section><div class="deck-controls"><button class="deck-btn prev">← Précédent</button><div class="deck-progress"><span></span><div class="deck-bar"><span></span></div></div><button class="deck-btn next">Suivant →</button></div>'; document.body.appendChild(shell);
    const $=s=>shell.querySelector(s); let idx=0;
    function render(){const s=slides[idx]; $('.chapter-pill').textContent=chap; $('.left-title').innerHTML=titleAccent(mainTitle); $('.left-subtitle').textContent=idx===0?'Une présentation en mode slides, contrôlée uniquement par les boutons Précédent / Suivant.':'Même contenu du chapitre, découpé en concepts clairs et lisibles.'; $('.slide-no').textContent=String(idx).padStart(2,'0'); $('.content-kicker').textContent=s.k; $('.slide-heading').innerHTML=s.h.replace(/&/g,'<span>&</span>'); $('.slide-content').innerHTML=s.c; const contentText=txt($('.slide-content')); $('.slide-content').classList.toggle('dense', contentText.length>520); $('.slide-content').classList.toggle('compact', contentText.length>850); const words=contentText.split(' ').filter(w=>w.length>4).slice(0,4); $('.slide-tags').innerHTML=words.map(w=>'<span class="slide-tag">'+w.replace(/[.,;:()]/g,'')+'</span>').join(''); $('.deck-progress>span').textContent='Slide '+(idx+1)+' / '+slides.length; $('.deck-bar span').style.width=((idx+1)/slides.length*100)+'%';}
    $('.prev').onclick=()=>{idx=Math.max(0,idx-1);render()}; $('.next').onclick=()=>{idx=Math.min(slides.length-1,idx+1);render()}; document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){idx=Math.min(slides.length-1,idx+1);render()} if(e.key==='ArrowLeft'){idx=Math.max(0,idx-1);render()}}); render();
  }
  document.addEventListener('DOMContentLoaded',build);
})();
