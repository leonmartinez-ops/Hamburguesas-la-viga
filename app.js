const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const products=[...document.querySelectorAll('.product')];
function render(){
 const h=innerHeight;
 document.querySelectorAll('.panel').forEach((el,i)=>{
   const r=el.getBoundingClientRect();
   const p=clamp((h-r.top)/(h+r.height),0,1);
   if(i===0){el.style.setProperty('--shift',((p-.5)*90)+'px');el.style.setProperty('--scale',(0.9+p*.12).toFixed(3))}
 });
 products.forEach(el=>{
   const r=el.getBoundingClientRect(), center=(r.top+r.height/2-h/2)/h;
   const active=1-clamp(Math.abs(center),0,1);
   el.style.setProperty('--py',(center*-70)+'px');
   el.style.setProperty('--ps',(0.9+active*.1).toFixed(3));
   el.style.setProperty('--ty',((1-active)*28)+'px');
   el.style.setProperty('--op',(0.28+active*.72).toFixed(2));
 });
}
let ticking=false;addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{render();ticking=false});ticking=true}},{passive:true});addEventListener('resize',render);render();
document.querySelectorAll('.order,.dockOrder').forEach(b=>b.addEventListener('click',()=>alert('Aquí conectaremos el WhatsApp de La Viga.')));