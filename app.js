const rail=document.querySelector('#rail'),slides=[...document.querySelectorAll('.slide')],current=document.querySelector('#current'),stageBg=document.querySelector('#stageBg');let target=0,pos=0,raf=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),lerp=(a,b,t)=>a+(b-a)*t;
const palettes=[['#ff5a38','#df2b1e','#99140f','#4d0907'],['#ffe079','#efb62e','#b66d0c','#663506'],['#63341f','#32180f','#170c08','#080504']];
function mix(a,b,t){const A=a.match(/\w\w/g).map(x=>parseInt(x,16)),B=b.match(/\w\w/g).map(x=>parseInt(x,16));return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0')).join('')}
function bgFor(i,p){const a=palettes[i%3],b=palettes[(i+1)%3];return `radial-gradient(ellipse at 50% 54%,${mix(a[0],b[0],p)} 0%,${mix(a[1],b[1],p)} 32%,${mix(a[2],b[2],p)} 70%,${mix(a[3],b[3],p)} 100%)`}
function animate(){
 pos=lerp(pos,rail.scrollLeft,.14);
 const w=slides[0].getBoundingClientRect().width;
 const base=clamp(Math.floor(pos/w),0,slides.length-1),p=clamp((pos-base*w)/w,0,1);
 slides.forEach((s,i)=>{
   const d=(i*w-pos)/w;
   const ad=Math.abs(d);
   const a=1-clamp(ad,0,1);
   // Invisible carousel wheel: center is the top of a large ellipse.
   // Current item falls outward while next item rises from the opposite side.
   const t=clamp(ad,0,1.15);
   const theta=t*Math.PI*.58;
   const side=d===0?0:Math.sign(d);
   const radiusX=window.innerWidth*.92;
   const radiusY=window.innerHeight*.25;
   const x=side*Math.sin(theta)*radiusX;
   const y=(1-Math.cos(theta))*radiusY;
   const scale=1-(t*.10);
   s.style.setProperty('--foodX',x.toFixed(1)+'px');
   s.style.setProperty('--foodY',y.toFixed(1)+'px');
   s.style.setProperty('--rot','0deg');
   s.style.setProperty('--scale',Math.max(.86,scale).toFixed(3));
   s.style.setProperty('--ghostX','0px');
   s.style.setProperty('--copyX','0px');
   s.style.setProperty('--copyOpacity',Math.pow(a,2.35).toFixed(3));
 });
 stageBg.style.background=bgFor(base,p);
 if(Math.abs(pos-rail.scrollLeft)>.08)raf=requestAnimationFrame(animate);else raf=0
}
function render(){if(!raf)raf=requestAnimationFrame(animate);const w=slides[0].getBoundingClientRect().width;target=clamp(Math.round(rail.scrollLeft/w),0,slides.length-1);current.textContent=String(target+1).padStart(2,'0')}
rail.addEventListener('scroll',render,{passive:true});document.querySelector('#next').onclick=()=>slides[Math.min(target+1,slides.length-1)].scrollIntoView({behavior:'smooth',inline:'start'});document.querySelector('#prev').onclick=()=>slides[Math.max(target-1,0)].scrollIntoView({behavior:'smooth',inline:'start'});document.querySelector('.wa').onclick=()=>alert('Aquí conectaremos el WhatsApp de La Viga.');render();