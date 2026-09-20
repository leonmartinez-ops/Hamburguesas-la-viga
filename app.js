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
 const brand=document.querySelector('.brand');
 if(brand){const warm=[['#ffd08a','#ffb14a'],['#7a3512','#b85b16'],['#ffd39a','#e89a4b']];const ca=warm[base%3],cb=warm[(base+1)%3];brand.style.color=mix(ca[0],cb[0],p);brand.style.textShadow='0 1px 10px rgba(0,0,0,.22)';}
 if(Math.abs(pos-rail.scrollLeft)>.08)raf=requestAnimationFrame(animate);else raf=0
}
function render(){if(!raf)raf=requestAnimationFrame(animate);const w=slides[0].getBoundingClientRect().width;target=clamp(Math.round(rail.scrollLeft/w),0,slides.length-1);current.textContent=String(target+1).padStart(2,'0');updateCategory(target)}
rail.addEventListener('scroll',render,{passive:true});document.querySelector('#next').onclick=()=>slides[Math.min(target+1,slides.length-1)].scrollIntoView({behavior:'smooth',inline:'start'});document.querySelector('#prev').onclick=()=>slides[Math.max(target-1,0)].scrollIntoView({behavior:'smooth',inline:'start'});render();

// Lightweight order cart — keeps the approved menu motion untouched.
const cart={};
const waBtn=document.querySelector('.wa'),sheet=document.querySelector('#cartSheet'),cartItems=document.querySelector('#cartItems'),toast=document.querySelector('#cartToast');
const productNames=slides.map(s=>s.querySelector('h2').textContent.trim());
function cartCount(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function saveCart(){try{localStorage.setItem('laviga-order',JSON.stringify(cart))}catch(e){}}
function loadCart(){try{Object.assign(cart,JSON.parse(localStorage.getItem('laviga-order')||'{}'))}catch(e){}}
function updateCartButton(){const n=cartCount();waBtn.textContent=n?('VER PEDIDO · '+n+' '+(n===1?'PRODUCTO':'PRODUCTOS')):'ARMA TU PEDIDO'}
function flash(name){toast.textContent=name+' agregado ✓';toast.classList.add('show');clearTimeout(flash.t);flash.t=setTimeout(()=>toast.classList.remove('show'),1200)}
function addItem(name){cart[name]=(cart[name]||0)+1;saveCart();updateCartButton();renderCart();flash(name)}
function changeItem(name,delta){cart[name]=(cart[name]||0)+delta;if(cart[name]<=0)delete cart[name];saveCart();updateCartButton();renderCart()}
function renderCart(){const entries=Object.entries(cart);cartItems.innerHTML=entries.length?entries.map(([name,qty])=>'<div class="cart-item"><span>'+name+'</span><div class="qty"><button data-name="'+name.replace(/"/g,'&quot;')+'" data-delta="-1">−</button><b>'+qty+'</b><button data-name="'+name.replace(/"/g,'&quot;')+'" data-delta="1">+</button></div></div>').join(''):'<div class="cart-empty">Desliza el menú y toca <b>AGREGAR +</b> en lo que quieras pedir.</div>';document.querySelector('#sendOrder').disabled=!entries.length}
function openCart(){renderCart();sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}
function closeCart(){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
document.querySelectorAll('.miniOrder').forEach((b,i)=>b.addEventListener('click',e=>{e.stopPropagation();addItem(productNames[i])}));
cartItems.addEventListener('click',e=>{const b=e.target.closest('[data-delta]');if(b)changeItem(b.dataset.name,Number(b.dataset.delta))});
waBtn.onclick=()=>cartCount()?openCart():flash('Agrega un producto primero');
document.querySelector('#cartClose').onclick=closeCart;document.querySelector('#cartBackdrop').onclick=closeCart;
document.querySelector('#sendOrder').onclick=()=>{const entries=Object.entries(cart);if(!entries.length)return;const total=cartCount();const message='Hola, quiero hacer un pedido en Hamburguesas al Carbón La Viga:\n\n'+entries.map(([n,q])=>q+' × '+n).join('\n')+'\n\nTotal: '+total+' '+(total===1?'producto':'productos');const number=(document.body.dataset.whatsapp||'').replace(/\D/g,'');if(number){location.href='https://wa.me/'+number+'?text='+encodeURIComponent(message)}else{navigator.clipboard?.writeText(message);toast.textContent='Pedido listo. Falta conectar el número de WhatsApp.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);closeCart()}};
loadCart();updateCartButton();renderCart();

// Category shortcuts: navigation only; carousel physics remain unchanged.
const categoryButtons=[...document.querySelectorAll('.category-nav button')];
function categoryFor(i){if(i===5)return 'PAPAS';if(i===6||i===7)return 'POLLO';if(i===4)return 'ESPECIALES';return 'HAMBURGUESAS'}
function updateCategory(i){const cat=categoryFor(i);categoryButtons.forEach(b=>b.classList.toggle('active',b.textContent.trim()===cat));const active=categoryButtons.find(b=>b.classList.contains('active'));active?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})}
function goCategory(i){
 const w=rail.clientWidth;
 target=i;
 rail.scrollTo({left:i*w,behavior:'smooth'});
 updateCategory(i);
}
categoryButtons.forEach(b=>{
 const go=e=>{e.preventDefault();e.stopPropagation();goCategory(Number(b.dataset.slide))};
 b.addEventListener('click',go);
 b.addEventListener('touchend',go,{passive:false});
});
updateCategory(target);
