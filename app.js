const app=document.getElementById('app');

const DEFAULT_STATE={screen:'login',role:'farmer',phone:'',verified:false,name:'',location:'',farm:'',method:''};
const CROP_IMAGE_LIBRARY={
  Tomatoes:[
    'https://images.unsplash.com/photo-1741517287380-cf3a9ef75be1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1783306083326-4b65b6383253?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1785061785448-12062174b8eb?auto=format&fit=crop&w=1200&q=80'
  ],
  Potatoes:[
    'https://images.unsplash.com/photo-1774351922689-896a9340aa7b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1781113153869-517f94d141c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80'
  ],
  Onions:[
    'https://images.unsplash.com/photo-1779173932569-5a3456d641d4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1713150128356-6edc60583946?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=1200&q=80'
  ],
  'Green Chilies':[
    'https://images.unsplash.com/photo-1597115580039-b849ed2d6398?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526346698789-22fd84314424?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583119022894-919a5d11c8d7?auto=format&fit=crop&w=1200&q=80'
  ]
};
function cropImages(crop){
  const key=Object.keys(CROP_IMAGE_LIBRARY).find(k=>String(crop||'').toLowerCase().includes(k.toLowerCase().replace('green chilies','green chili')));
  return key?[...CROP_IMAGE_LIBRARY[key]]:[];
}
const DEMO_REVIEWS={
  1:[{name:'Aarav Foods',rating:5,comment:'Tomatoes arrived fresh and matched the listing photos. Good colour and firm texture.',date:'2 days ago',image:CROP_IMAGE_LIBRARY.Tomatoes[1]}],
  2:[{name:'Neha Kitchen',rating:5,comment:'Clean potatoes with very little damage. Quantity was accurate.',date:'4 days ago',image:CROP_IMAGE_LIBRARY.Potatoes[1]}],
  3:[{name:'Fresh Basket',rating:4,comment:'Good onions and fair price. A few were smaller than expected.',date:'5 days ago',image:CROP_IMAGE_LIBRARY.Onions[1]}],
  4:[{name:'Spice House',rating:5,comment:'Fresh, crisp chilies and the delivery was on time.',date:'3 days ago',image:CROP_IMAGE_LIBRARY['Green Chilies'][1]}]
};
const DEMO_LISTINGS=[
  {id:1,crop:'Tomatoes',emoji:'🍅',variety:'Hybrid',qty:420,price:28,harvest:'2026-09-23',location:'Lucknow',farmer:'Ramesh Kumar',farm:'Green Valley FPO',status:'Active',images:CROP_IMAGE_LIBRARY.Tomatoes},
  {id:2,crop:'Potatoes',emoji:'🥔',variety:'Fresh table potatoes',qty:300,price:24,harvest:'2026-09-22',location:'Lucknow',farmer:'Suresh Yadav',farm:'Kisan Pragati Farm',status:'Active',images:CROP_IMAGE_LIBRARY.Potatoes},
  {id:3,crop:'Onions',emoji:'🧅',variety:'Red onion',qty:180,price:31,harvest:'2026-09-21',location:'Barabanki',farmer:'Anita Verma',farm:'Shakti FPO',status:'Slow sales',images:CROP_IMAGE_LIBRARY.Onions},
  {id:4,crop:'Green Chilies',emoji:'🌶️',variety:'Local',qty:95,price:46,harvest:'2026-09-24',location:'Lucknow',farmer:'Mohan Singh',farm:'Mohan Farms',status:'Active',images:CROP_IMAGE_LIBRARY['Green Chilies']}
];

function read(key,fallback){
  try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}
}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
let state={...DEFAULT_STATE,...read('kcState',{})};
let listings=read('kcListings',DEMO_LISTINGS);
if(!Array.isArray(listings)||!listings.length){listings=DEMO_LISTINGS;write('kcListings',listings)}
listings=listings.map(x=>({...x,images:Array.isArray(x.images)&&x.images.length?x.images:cropImages(x.crop)}));
write('kcListings',listings);
let reviews=read('kcReviews',DEMO_REVIEWS);
if(!reviews||typeof reviews!=='object'||Array.isArray(reviews)){reviews=DEMO_REVIEWS;write('kcReviews',reviews)}
let drafts=read('kcDrafts',[]);
if(!Array.isArray(drafts))drafts=[];

function save(){write('kcState',state)}
function saveDrafts(){write('kcDrafts',drafts)}
function farmerDrafts(){
  const farmer=state.name||'Ramesh Kumar';
  return drafts.filter(d=>d.farmer===farmer);
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function unreadNotifications(){
  return farmerNotifications().filter(n=>!n.read);
}
function notificationBell(){
  const count=unreadNotifications().length;
  if(state.role!=='farmer' || !state.verified) return '';
  return `<div class="notification-wrap"><button class="notification-button" onclick="toggleNotificationMenu(event)" aria-label="Notifications">🔔 <span>Notifications</span>${count?`<b class="notification-count">${count>99?'99+':count}</b>`:''}</button><div id="notification-menu" class="notification-menu hidden" onclick="event.stopPropagation()">${notificationMenuContent()}</div></div>`;
}
function notificationMenuContent(){
  const notes=unreadNotifications();
  if(!notes.length){
    return `<div class="notification-menu-head"><div><b>Notifications</b><div class="small muted">You're all caught up.</div></div></div><div class="notification-empty">✓ No unread notifications</div>`;
  }
  return `<div class="notification-menu-head"><div><b>Notifications</b><div class="small muted">${notes.length} unread notification${notes.length===1?'':'s'}</div></div><button class="btn secondary notif-read-all" onclick="markNotificationsRead(event)">Mark all read</button></div><div class="notification-list">${notes.slice(0,8).map(n=>`<div class="notification"><div class="notification-icon">${n.type==='listing'?'📋':n.type==='verification'?'✅':'⚠️'}</div><div><div class="notification-title-row"><b>${esc(n.title)}</b><span class="small muted">${esc(n.time)}</span></div><p class="small muted">${esc(n.message)}</p></div></div>`).join('')}</div>${notes.length>8?`<div class="small muted notification-more">Showing the 8 most recent unread notifications.</div>`:''}`;
}
function header(role=state.role){
  if(role==='buyer' && state.verified){
    return `<header class="top"><div class="brand"><img class="brand-logo" src="logo.png" alt="KisanConnect — From Farm to You"></div><div class="row top-right buyer-header-actions">${notificationBell()}<span class="pill">BUYER PORTAL</span><button class="btn secondary" style="padding:7px 11px" onclick="buyerProfile()">👤 Profile</button><button class="btn secondary" style="padding:7px 11px" onclick="openCart()">🛒 Cart <span class="header-cart-count">${cartCount()}</span></button><button class="btn secondary logout-btn" style="padding:7px 11px" onclick="buyerLogout()">↪ Log out</button></div></header>`;
  }
  if(role==='farmer' && state.verified){
    return `<header class="top"><div class="brand"><img class="brand-logo" src="logo.png" alt="KisanConnect — From Farm to You"></div><div class="row top-right">${notificationBell()}<span class="pill">FARMER PORTAL</span><button class="btn secondary" style="padding:7px 11px" onclick="chooseRole()">Switch role</button></div></header>`
  }
  return `<header class="top"><div class="brand"><img class="brand-logo" src="logo.png" alt="KisanConnect — From Farm to You"></div></header>`;
}
function layout(x){app.innerHTML=header()+x}
function steps(n){return `<div class="step">${[1,2,3,4].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`}

function chooseRole(){
  state={...DEFAULT_STATE};
  save();
  app.innerHTML=`<main class="center"><section class="panel auth">
    <div class="verify-icon">🌱</div><span class="pill">KISANCONNECT</span>
    <h1>Who are you?</h1><p class="muted">Choose the portal you want to enter.</p>
    <div class="form">
      <button class="choice" onclick="farmerLogin()"><strong>👨‍🌾 I'm a Farmer</strong><span class="small muted">List produce, see market insights and manage sales.</span></button>
      <button class="choice" onclick="buyerLogin()"><strong>🛒 I'm a Buyer</strong><span class="small muted">Browse verified farmer listings and place demo orders.</span></button>
    </div>
  </section></main>`
}
function farmerLogin(){state.role='farmer';state.screen='login';save();login()}
function buyerLogin(){state.role='buyer';state.verified=false;state.screen='buyerLogin';save();buyerLoginScreen()}

function login(){
  state.role='farmer';save();
  layout(`<main class="center"><section class="panel auth"><div class="verify-icon">👨‍🌾</div><span class="pill">STEP 1 OF 4</span><h1>Farmer Login</h1><p class="muted">Sign in with your mobile number. Your number is used for secure account authentication.</p>${steps(1)}
  <form class="form" onsubmit="sendOtp(event)"><div class="field"><label>Mobile number</label><input id="phone" inputmode="numeric" maxlength="10" placeholder="Enter 10-digit mobile number" required></div><button class="btn primary full">Send OTP</button></form>
  <p class="small muted">Prototype: OTP is simulated. No real SMS is sent.</p><button class="back" onclick="chooseRole()">← Choose another portal</button>
  </section></main>`)
}
function sendOtp(e){
  e.preventDefault();let p=document.getElementById('phone').value.replace(/\D/g,'');
  if(p.length!==10){alert('Enter a valid 10-digit number for the demo.');return}
  state.phone=p;save();otp()
}
function otp(){
  layout(`<main class="center"><section class="panel auth"><button class="back" onclick="login()">← Change number</button><div class="verify-icon">🔐</div><span class="pill">STEP 2 OF 4</span><h1>Verify OTP</h1><p class="muted">We sent a 6-digit OTP to +91 ${state.phone.slice(0,2)}******${state.phone.slice(-2)}.</p>${steps(2)}
  <form class="form" onsubmit="verifyOtp(event)"><div class="field"><label>Demo OTP</label><input id="otp" inputmode="numeric" maxlength="6" placeholder="Enter 123456" required></div><button class="btn primary full">Verify & Continue</button></form>
  <p class="small muted">For this prototype, use <b>123456</b>.</p></section></main>`)
}
function verifyOtp(e){
  e.preventDefault();
  if(document.getElementById('otp').value!=='123456'){alert('Wrong OTP. Use 123456 in this prototype.');return}
  state.screen='verification';save();verification()
}
function verification(){
  layout(`<main class="center"><section class="panel auth"><div class="verify-icon">🛡️</div><span class="pill">STEP 3 OF 4</span><h1>Verify your farmer profile</h1><p class="muted">We verify identity separately from farming status. Choose how you want to complete the demo verification.</p>${steps(3)}
  <button class="choice" onclick="details('aadhaar')"><strong>🔐 Authorized Aadhaar verification</strong><span class="small muted">Demo only — no Aadhaar number is collected or transmitted.</span></button>
  <button class="choice" onclick="details('fpo')"><strong>🌾 FPO / assisted verification</strong><span class="small muted">Verify through an FPO, cooperative, or authorized field agent.</span></button>
  <div class="notice small"><b>Privacy:</b> A real deployment would use an authorized verification method and collect only necessary information.</div></section></main>`)
}
function details(method){
  state.method=method;state.screen='details';save();
  layout(`<main class="center"><section class="panel auth"><button class="back" onclick="verification()">← Back</button><div class="verify-icon">📋</div><span class="pill">STEP 3 OF 4</span><h1>Farmer details</h1><p class="muted">${method==='aadhaar'?'Demo Aadhaar verification selected. Do not enter a real Aadhaar number.':'Assisted/FPO verification selected.'}</p>${steps(3)}
  <form class="form" onsubmit="submitVerification(event)">
  <div class="field"><label>Full name</label><input id="name" placeholder="e.g. Ramesh Kumar" required></div>
  <div class="field"><label>Village / city</label><input id="location" placeholder="e.g. Lucknow" required></div>
  <div class="field"><label>Farm / FPO name</label><input id="farm" placeholder="e.g. Green Valley FPO" required></div>
  ${method==='aadhaar'?'<div class="notice small">🔐 <b>Demo:</b> Aadhaar identity verification is represented by a simulated check. Never enter a real Aadhaar number here.</div>':''}
  <button class="btn primary full">Submit for verification</button></form></section></main>`)
}
function submitVerification(e){
  e.preventDefault();
  state.name=document.getElementById('name').value;
  state.location=document.getElementById('location').value;
  state.farm=document.getElementById('farm').value;
  state.verified=true;state.screen='dashboard';save();dashboard()
}

function statusPill(status){
  if(status==='Active')return '<span class="pill">Active</span>';
  if(status==='Paused')return '<span class="pill" style="background:#ffe9e9;color:#9d3030">Paused</span>';
  return '<span class="pill" style="background:#fff4d8;color:#8b6700">Slow sales</span>';
}
function farmerListings(){
  return listings.filter(x=>x.farmer===(state.name||'Ramesh Kumar'));
}
function farmerNotifications(){
  const all=read('kcNotifications',[]);
  return all.filter(n=>n.farmer===(state.name||'Ramesh Kumar')).sort((a,b)=>String(b.time).localeCompare(String(a.time)));
}
function toggleNotificationMenu(e){
  if(e)e.stopPropagation();
  const menu=document.getElementById('notification-menu');
  if(menu)menu.classList.toggle('hidden');
}
function markNotificationsRead(e){
  if(e)e.stopPropagation();
  const all=read('kcNotifications',[]);
  const name=state.name||'Ramesh Kumar';
  all.forEach(n=>{if(n.farmer===name)n.read=true});
  write('kcNotifications',all);
  dashboard();
}
function farmerProfile(farmerName){
  const isOwn=!farmerName || farmerName===(state.name||'Ramesh Kumar');
  if(isOwn){state.screen='profile';save();}
  const name=farmerName || state.name || 'Ramesh Kumar';
  const ownListings=listings.filter(x=>x.farmer===name);
  const first=ownListings[0]||{};
  const location=isOwn?(state.location||first.location||'Lucknow'):(first.location||'Lucknow');
  const farm=isOwn?(state.farm||first.farm||'Green Valley FPO'):(first.farm||'Farmer / FPO');
  const orders=getOrders().filter(o=>o.farmer===name);
  const delivered=orders.filter(o=>Number(o.statusIndex)>=5).length;
  const active=ownListings.filter(x=>x.status==='Active').length;
  const crops=[...new Set(ownListings.map(x=>x.crop).filter(Boolean))];
  const verified=isOwn?!!state.verified:true;
  const joined=isOwn?'September 2026':'Active KisanConnect farmer';
  const rating='4.7/5';
  const sales=ownListings.reduce((sum,x)=>sum+(Number(x.qty)||0)*(Number(x.price)||0),0);
  const recentOrders=orders.slice(0,3);
  const back=isOwn?'dashboard()':'marketplace()';
  layout(`<main class="wrap profile-page">
    <div class="profile-top-actions"><button class="back" onclick="${back}">← Back</button>${isOwn?'<button class="btn secondary" onclick="editFarmerProfile()">✎ Edit profile</button>':''}</div>
    <section class="profile-hero">
      <div class="profile-avatar">${esc(name.charAt(0).toUpperCase())}</div>
      <div class="profile-identity"><div class="row profile-title-row"><div><span class="pill">✓ VERIFIED FARMER</span><h1>${esc(name)}</h1><p class="muted">${esc(farm)} • 📍 ${esc(location)}</p></div><div class="profile-rating"><strong>★ ${rating}</strong><span class="small muted">Buyer rating</span></div></div>
      <div class="profile-trust"><span>✓ Mobile verified</span><span>✓ Farmer/FPO verified</span><span>✓ Marketplace seller</span></div></div>
    </section>
    <div class="profile-stats">
      <div class="card"><span class="small muted">Active listings</span><b>${active}</b></div>
      <div class="card"><span class="small muted">Completed orders</span><b>${delivered}</b></div>
      <div class="card"><span class="small muted">Produce listed</span><b>${ownListings.length} crop${ownListings.length===1?'':'s'}</b></div>
      <div class="card"><span class="small muted">Profile status</span><b class="profile-green">Verified</b></div>
    </div>
    <div class="profile-grid">
      <section class="card">
        <div class="section-heading"><div><h2>About this farmer</h2><p class="small muted">Information shared with buyers to help them evaluate the seller.</p></div></div>
        <div class="profile-info-grid">
          <div><span>Farmer / seller</span><b>${esc(name)}</b></div>
          <div><span>Farm / FPO</span><b>${esc(farm)}</b></div>
          <div><span>Location</span><b>${esc(location)}</b></div>
          <div><span>Member since</span><b>${joined}</b></div>
          <div><span>Verification</span><b>✓ Verified</b></div>
          <div><span>Buyer rating</span><b>★ ${rating}</b></div>
        </div>
        <div class="profile-note"><b>Trust & verification</b><p class="small muted">KisanConnect verifies the farmer/FPO account before marketplace selling. A production version would display the verification method and relevant records without exposing sensitive identity documents.</p></div>
      </section>
      <section class="card">
        <div class="section-heading"><div><h2>🌱 Crops on the marketplace</h2><p class="small muted">Current listings associated with this farmer.</p></div></div>
        ${crops.length?`<div class="crop-chips">${crops.map(c=>`<span>${esc(c)}</span>`).join('')}</div>`:'<p class="muted">No current crop listings.</p>'}
        <div class="profile-mini-metrics"><div><span>Listed stock value</span><b>₹${sales.toLocaleString('en-IN')}</b></div><div><span>Current listings</span><b>${ownListings.length}</b></div></div>
      </section>
    </div>
    <section class="card profile-listings"><div class="section-heading"><div><h2>My produce</h2><p class="small muted">What this farmer is currently offering.</p></div>${isOwn?'<button class="btn primary" onclick="addListing()">+ Add listing</button>':''}</div>
      ${ownListings.length?`<div class="profile-listing-grid">${ownListings.map(x=>`<div class="profile-listing"><div class="profile-listing-icon">${x.emoji||'🌾'}</div><div class="profile-listing-main"><div class="row between"><b>${esc(x.crop)}</b>${statusPill(x.status)}</div><p class="small muted">${esc(x.variety||'Fresh produce')}</p><div class="row between"><span><b>${x.qty} kg</b> available</span><b>₹${x.price}/kg</b></div><p class="small muted">Harvested ${esc(x.harvest||'—')}</p></div></div>`).join('')}</div>`:'<div class="notice">No produce is currently listed.</div>'}
    </section>
    ${isOwn?`<section class="card profile-listings"><div class="section-heading"><div><h2>📦 Recent orders</h2><p class="small muted">Your latest marketplace orders.</p></div><button class="btn secondary" onclick="farmerOrders()">View all →</button></div>${recentOrders.length?`<div class="profile-orders">${recentOrders.map(o=>`<div class="profile-order"><div><b>${o.emoji||'🌾'} ${esc(o.crop)} • ${o.qty} kg</b><p class="small muted">${esc(o.id)} • Buyer: ${esc(o.buyer||'Buyer')}</p></div><div style="text-align:right"><b>₹${Number(o.total||0).toLocaleString('en-IN')}</b><p class="small muted">${esc(o.status)}</p></div></div>`).join('')}`:'<div class="empty-profile">No orders yet. Buyer orders will appear here.</div>'}</div>`:''}
  </main>`);
}
function editFarmerProfile(){
  document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="profileModal"><section class="panel profile-edit-panel"><div class="row between"><div><span class="pill">MY PROFILE</span><h2 style="margin-top:10px">Edit farmer profile</h2></div><button class="back" onclick="document.getElementById('profileModal').remove()">✕</button></div><p class="muted small">These details are used on your farmer profile and seller listings.</p><form class="form" onsubmit="saveFarmerProfile(event)"><div class="field"><label>Full name</label><input id="profileName" value="${esc(state.name||'')}" required></div><div class="field"><label>Village / city</label><input id="profileLocation" value="${esc(state.location||'')}" required></div><div class="field"><label>Farm / FPO name</label><input id="profileFarm" value="${esc(state.farm||'')}" required></div><div class="notice small"><b>Verification status:</b> ✓ Verified. Changing profile details may require re-verification in a production system.</div><div class="row" style="justify-content:flex-end"><button type="button" class="btn secondary" onclick="document.getElementById('profileModal').remove()">Cancel</button><button class="btn primary">Save changes</button></div></form></section></div>`);
}
function saveFarmerProfile(e){
  e.preventDefault();
  const oldName=state.name||'Ramesh Kumar';
  const name=document.getElementById('profileName').value.trim();
  const location=document.getElementById('profileLocation').value.trim();
  const farm=document.getElementById('profileFarm').value.trim();
  if(!name||!location||!farm)return;
  state.name=name;state.location=location;state.farm=farm;save();
  listings=listings.map(x=>x.farmer===oldName?{...x,farmer:name,location,farm}:x);write('kcListings',listings);
  const orders=getOrders().map(o=>o.farmer===oldName?{...o,farmer:name,farmerLocation:location,farm}:o);saveOrders(orders);
  const notes=read('kcNotifications',[]).map(n=>n.farmer===oldName?{...n,farmer:name}:n);write('kcNotifications',notes);
  document.getElementById('profileModal')?.remove();farmerProfile();
}

function dashboard(){
  const mine=farmerListings();
  const active=mine.filter(x=>x.status==='Active');
  layout(`<main class="wrap">
  <section class="dashhead"><div><span class="pill">✓ VERIFIED FARMER</span><h1>Welcome, ${esc(state.name||'Ramesh Kumar')}!</h1><p class="muted">${esc(state.farm||'Green Valley FPO')} • ${esc(state.location||'Lucknow')}</p></div><div class="row"><button class="btn secondary" onclick="farmerProfile()">👤 My profile</button><button class="btn secondary" onclick="farmerOrders()">📦 Orders & logistics</button><button class="btn secondary" onclick="buyerLogin()">🛒 Buyer portal</button><button class="btn secondary" onclick="resetDemo()">Reset demo</button></div></section>
  <div class="dashgrid"><div class="card"><div class="muted small">This month's sales</div><div class="metric">₹38,450</div></div><div class="card"><div class="muted small">Active listings</div><div class="metric">${active.length}</div></div><div class="card"><div class="muted small">At-risk stock</div><div class="metric">124 kg</div></div><div class="card"><div class="muted small">Buyer rating</div><div class="metric">4.7/5</div></div></div>
  <div class="grid2"><section class="card ai-dashboard-card"><div class="row between"><div><span class="ai-kicker">AI MARKET INTELLIGENCE</span><h2>🤖 KisanConnect AI Advisor</h2><p class="muted">A transparent forecasting engine that turns market history into actionable crop and pricing signals.</p></div><span class="live-dot"><i></i> MODEL ONLINE</span></div><div class="ai-mini-grid"><div><span>Forecast horizon</span><b>7 days</b></div><div><span>Signals</span><b>Price + arrivals</b></div><div><span>Model</span><b>Trend + seasonality</b></div><div><span>Data mode</span><b>Demo / Live-ready</b></div></div><div class="ai-actions"><button class="btn primary" onclick="aiLab()">Open AI Lab →</button><button class="btn secondary" onclick="addListing()">Analyze a crop</button></div><p class="small muted ai-source-line">Live connector: Government of India AGMARKNET data via data.gov.in. Demo mode uses a bundled historical calibration series.</p></section>
  <section class="card recovery-dashboard-card"><div class="row between"><div><span class="ai-kicker">♻️ INVENTORY RECOVERY</span><h2>Unsold Stock System</h2><p class="muted">124 kg of tomatoes have slow sales. The system can route at-risk stock through alternative channels before spoilage.</p></div><span class="risk-badge">HIGH PRIORITY</span></div><div class="recovery-mini-grid"><div><span>At-risk</span><b>124 kg</b></div><div><span>Suggested price</span><b>₹26/kg</b></div><div><span>Buyer matches</span><b>3</b></div><div><span>Next action</span><b>Bulk buyers</b></div></div><button class="btn primary" onclick="recovery()">Open Unsold Stock System →</button></section></div>
  <div style="height:18px"></div>
  <section class="card"><div class="row between"><div><h2>My produce</h2><p class="muted small">These are your live demo listings. Remove any listing you no longer want to sell.</p></div><button class="btn primary" onclick="addListing()">+ Add listing</button></div>
  ${mine.length?`<table class="table"><tr><th>Crop</th><th>Quantity</th><th>Price</th><th>Status</th><th>Action</th></tr>${mine.map(x=>`<tr><td>${x.emoji} ${x.crop}<div class="small muted">${x.variety||''}</div></td><td>${x.qty} kg</td><td>₹${x.price}/kg</td><td>${statusPill(x.status)}</td><td><button class="btn secondary" style="padding:7px 10px" onclick="removeListing(${x.id})">Remove</button></td></tr>`).join('')}</table>`:`<div class="notice">You have no active listings. Click <b>+ Add listing</b> to put produce on the marketplace.</div>`}
  </section></main>`)
}
function removeListing(id){
  const item=listings.find(x=>x.id===id);
  if(!item)return;
  if(!confirm(`Remove ${item.crop} (${item.qty} kg) from your listings?`))return;
  listings=listings.filter(x=>x.id!==id);write('kcListings',listings);dashboard()
}
function recovery(){
  const item=listings.find(x=>x.status==='Slow sales')||listings.find(x=>x.status==='Active'&&x.crop==='Tomatoes')||listings[0];
  const qty=item?.qty||124, crop=item?.crop||'Tomatoes', price=item?.price||28;
  const risk=Math.min(94,Math.max(58,Math.round(62+qty*.05)));
  const recoveryPrice=Math.max(1,Math.round(price*.92));
  document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="recoveryModal"><section class="panel recovery-panel"><div class="row between"><div><span class="pill">UNSOLD STOCK SYSTEM</span><h1 style="margin-top:10px">Recover ${esc(crop)} before it becomes waste.</h1><p class="muted">KisanConnect automatically moves at-risk inventory through alternative selling channels instead of relying on a single buyer.</p></div><button class="back" onclick="document.getElementById('recoveryModal').remove()">✕</button></div>
  <div class="recovery-hero"><div><span>AT-RISK INVENTORY</span><strong>${qty} kg</strong><small>${esc(crop)} • current listing ₹${price}/kg</small></div><div><span>RECOVERY RISK</span><strong>${risk}%</strong><small>Based on slow sales + remaining quantity</small></div><div><span>RECOVERY PRICE</span><strong>₹${recoveryPrice}/kg</strong><small>Illustrative markdown suggestion</small></div></div>
  <div class="recovery-flow"><div class="recovery-step active"><b>1</b><div><strong>Bulk buyers</strong><p>Match nearby retailers, restaurants and wholesalers who can absorb larger quantities.</p><button class="btn primary" onclick="openBulkBuyer();document.getElementById('recoveryModal')?.remove()">Find bulk buyers →</button></div></div>
  <div class="recovery-step"><b>2</b><div><strong>Processors / institutions</strong><p>Route suitable produce to processors, hostels, caterers or institutional buyers when retail demand is weak.</p><button class="btn secondary" onclick="recoveryAction('Processor request sent')">Request a match</button></div></div>
  <div class="recovery-step"><b>3</b><div><strong>Procurement eligibility</strong><p>Check whether an active government procurement route exists. Approval depends on scheme, crop, location, quality and agency capacity.</p><button class="btn secondary" onclick="recoveryAction('Procurement eligibility check queued')">Check eligibility</button></div></div>
  <div class="recovery-step"><b>4</b><div><strong>Last-resort recovery</strong><p>Donation, livestock/feed, composting or other lawful local channels can be considered where applicable.</p><button class="btn secondary" onclick="recoveryAction('Last-resort recovery options opened')">Open options</button></div></div></div>
  <section class="card recovery-economics"><div class="row between"><div><h2>Recovery economics</h2><p class="small muted">Illustrative demo values — actual transport and buyer quotes vary.</p></div><span class="pill">MODEL ESTIMATE</span></div><div class="recovery-econ-grid"><div><span>Potential produce value</span><b>₹${(qty*price).toLocaleString('en-IN')}</b></div><div><span>At suggested recovery price</span><b>₹${(qty*recoveryPrice).toLocaleString('en-IN')}</b></div><div><span>Potential value protected</span><b>₹${(qty*recoveryPrice).toLocaleString('en-IN')}</b></div><div><span>Waste avoided</span><b>${qty} kg</b></div></div></section>
  <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn secondary" onclick="document.getElementById('recoveryModal').remove()">Close system</button></div></section></div>`)
}
function recoveryAction(message){
  toastBuyer(message);
}
function addListing(){
  const mine=farmerDrafts();
  document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="m"><section class="panel draft-picker"><div class="row between"><div><span class="pill">ADD PRODUCE</span><h2 style="margin-top:10px">What would you like to do?</h2><p class="muted">Start a new listing or continue one you saved earlier.</p></div><button class="back" onclick="document.getElementById('m').remove()">✕</button></div>
  <button class="draft-option" onclick="newListingForm()"><span class="draft-option-icon">＋</span><span><b>Create a new listing</b><small>Enter crop, quantity, harvest date and expected price.</small></span><span>→</span></button>
  ${mine.length?`<div class="draft-heading"><b>Saved drafts (${mine.length})</b><span class="small muted">Continue where you left off</span></div>${mine.map(d=>`<div class="saved-draft"><div><div class="row"><span class="draft-emoji">${d.emoji||'🌾'}</span><div><b>${esc(d.crop)}</b><div class="small muted">${d.qty||'—'} kg • ₹${d.price||'—'}/kg • ${d.harvest||'No harvest date'}</div></div></div></div><div class="row"><button class="btn secondary" style="padding:8px 11px" onclick="continueDraft('${d.draftId}')">Continue</button><button class="btn secondary danger-btn" style="padding:8px 11px" onclick="deleteDraft('${d.draftId}')">Delete</button></div></div>`).join('')}`:`<div class="empty-drafts">No saved drafts yet. Your drafts will appear here after you choose <b>Save as draft</b> during market analysis.</div>`}
  </section></div>`);
}
function fileToDataURL(file,maxW=1200,maxH=900){
  return new Promise((resolve,reject)=>{
    if(!file||!file.type.startsWith('image/'))return reject(new Error('Please select an image file.'));
    const reader=new FileReader();reader.onload=()=>{
      const img=new Image();img.onload=()=>{
        const scale=Math.min(1,maxW/img.width,maxH/img.height),w=Math.round(img.width*scale),h=Math.round(img.height*scale);
        const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL('image/jpeg',.78));
      };img.onerror=()=>reject(new Error('Could not read image.'));img.src=reader.result;
    };reader.onerror=()=>reject(new Error('Could not read image.'));reader.readAsDataURL(file);
  });
}
function previewListingPhotos(input){
  const files=[...(input.files||[])].slice(0,4),box=document.getElementById('listingPhotoPreview');
  if(!box)return;box.innerHTML=files.length?files.map(f=>`<div class="photo-preview"><span>${esc(f.name)}</span></div>`).join(''):'<span class="small muted">No photos selected yet.</span>';
  files.forEach((f,i)=>{const r=new FileReader();r.onload=()=>{const el=box.children[i];if(el)el.innerHTML=`<img src="${r.result}" alt="Crop photo preview"><span>${esc(f.name)}</span>`};r.readAsDataURL(f)});
}
function listingGallery(x){
  const imgs=(Array.isArray(x.images)&&x.images.length?x.images:cropImages(x.crop)).filter(Boolean);
  if(!imgs.length)return `<div class="gallery-empty">📷 No crop photos uploaded yet.</div>`;
  return `<div class="product-gallery"><div class="gallery-main"><img id="galleryMain" src="${esc(imgs[0])}" alt="${esc(x.crop)} photo"></div><div class="gallery-thumbs">${imgs.slice(0,5).map((src,i)=>`<button class="gallery-thumb ${i===0?'active':''}" onclick="setGalleryImage('${String(src).replace(/'/g,"\\'")}',this)"><img src="${esc(src)}" alt="${esc(x.crop)} photo ${i+1}"></button>`).join('')}</div><div class="gallery-caption">${imgs.length} photo${imgs.length===1?'':'s'} • Seller-uploaded or marketplace photo</div></div>`;
}
function setGalleryImage(src,btn){const img=document.getElementById('galleryMain');if(img)img.src=src;document.querySelectorAll('.gallery-thumb').forEach(b=>b.classList.remove('active'));btn?.classList.add('active')}
function reviewList(id){const r=reviews?.[id];return Array.isArray(r)?r:[]}
function reviewAverage(id,fallback){const rs=reviewList(id);return rs.length?rs.reduce((s,r)=>s+Number(r.rating||0),0)/rs.length:fallback}
function setReviewRating(n){window.kcReviewRating=Math.max(1,Math.min(5,n));document.querySelectorAll('.review-star').forEach((b,i)=>b.classList.toggle('selected',i<window.kcReviewRating));const label=document.getElementById('reviewRatingLabel');if(label)label.textContent=`${window.kcReviewRating}/5`}
async function submitReview(e,id){
  e.preventDefault();const rating=Number(window.kcReviewRating||5),comment=document.getElementById('reviewComment')?.value.trim();if(!comment){alert('Please write a short comment.');return}
  let image='';const file=document.getElementById('reviewPhoto')?.files?.[0];if(file){try{image=await fileToDataURL(file,1000,800)}catch(err){alert(err.message);return}}
  const list=reviewList(id);list.unshift({name:'Verified buyer',rating,comment,date:'Just now',image});reviews[id]=list;write('kcReviews',reviews);window.kcReviewRating=5;productDetails();
}
function reviewsSection(x){
  const rs=reviewList(x.id),avg=reviewAverage(x.id,buyerRating(x.farmer));
  return `<section class="card reviews-card"><div class="section-heading"><div><span class="ai-kicker">BUYER VOICE</span><h2>⭐ Consumer reviews</h2><p class="small muted">Photos and ratings help future buyers judge real-world quality.</p></div><div class="review-summary"><b>${avg.toFixed(1)}</b><span>★</span><small>${rs.length} review${rs.length===1?'':'s'}</small></div></div><div class="review-form-box"><h3>Leave a review</h3><form class="form" onsubmit="submitReview(event,${x.id})"><div><label class="review-label">Your rating</label><div class="review-stars">${[1,2,3,4,5].map(n=>`<button type="button" class="review-star ${n<=5?'selected':''}" onclick="setReviewRating(${n})" aria-label="${n} stars">★</button>`).join('')}</div><span id="reviewRatingLabel" class="small muted">5/5</span></div><div class="field"><label>Comment</label><textarea id="reviewComment" rows="3" placeholder="How was the produce? Freshness, quality, quantity, packaging..." required></textarea></div><div class="field"><label>Upload a photo <span class="muted">(optional)</span></label><input id="reviewPhoto" type="file" accept="image/*"><span class="small muted">Add your own delivery/produce photo if it helps.</span></div><button class="btn primary" type="submit">Post review</button></form></div><div class="reviews-list">${rs.length?rs.map(r=>`<article class="review-item"><div class="row between"><div><b>${esc(r.name||'Buyer')}</b><span class="verified-review">✓ Verified purchase</span></div><span class="small muted">${esc(r.date||'')}</span></div><div class="review-stars compact">${[1,2,3,4,5].map(n=>`<span class="${n<=Number(r.rating)?'selected':''}">★</span>`).join('')}</div><p>${esc(r.comment)}</p>${r.image?`<img class="review-image" src="${esc(r.image)}" alt="Buyer review photo">`:''}</article>`).join(''):'<div class="notice">No reviews yet. Be the first buyer to review this produce.</div>'}</div></section>`;
}
function newListingForm(){
  document.getElementById('m')?.remove();
  document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="m"><section class="panel"><button class="back" onclick="addListing()">← Back</button><h2 style="margin-top:15px">Create new listing</h2><p class="muted">Tell us what you want to sell. Before publishing, KisanConnect will analyze the market signals for this crop.</p>
  <form class="form" onsubmit="createListing(event)">
  <div class="field"><label>Crop</label><input id="newCrop" placeholder="e.g. Tomatoes" required></div>
  <div class="field"><label>Variety</label><input id="newVariety" placeholder="e.g. Hybrid"></div>
  <div class="field"><label>Quantity (kg)</label><input id="newQty" type="number" min="1" required></div>
  <div class="field"><label>Expected price (₹/kg)</label><input id="newPrice" type="number" min="1" required></div>
  <div class="field"><label>Harvest date</label><input id="newHarvest" type="date" required></div>
  <div class="field"><label>Crop photos <span class="muted">(1–4 required)</span></label><input id="newPhotos" type="file" accept="image/*" multiple required onchange="previewListingPhotos(this)"><div id="listingPhotoPreview" class="listing-photo-preview"><span class="small muted">Choose up to 4 photos showing the actual produce.</span></div><span class="small muted">Use clear photos from different angles. These will appear on the buyer product page.</span></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn secondary" onclick="document.getElementById('m').remove()">Cancel</button><button class="btn primary">Analyze market</button></div>
  </form></section></div>`);
}
function continueDraft(draftId){
  const d=drafts.find(x=>x.draftId===draftId);
  if(!d)return;
  document.getElementById('m')?.remove();
  state.draftListing={...d};
  delete state.draftListing.draftId;
  state.currentDraftId=d.draftId;
  state.screen='aiAnalysis';save();aiAnalysis();
}
function deleteDraft(draftId){
  const d=drafts.find(x=>x.draftId===draftId);
  if(!d)return;
  if(!confirm(`Delete the saved ${d.crop} draft?`))return;
  drafts=drafts.filter(x=>x.draftId!==draftId);saveDrafts();
  document.getElementById('m')?.remove();addListing();
}
function saveCurrentDraft(){
  const x=state.draftListing;if(!x)return;
  const farmer=state.name||'Ramesh Kumar';
  const draftId=state.currentDraftId||`DRAFT-${Date.now()}`;
  const draft={...x,draftId,farmer,farmerLocation:state.location||'Lucknow',farm:state.farm||'Green Valley FPO',savedAt:new Date().toLocaleString('en-IN')};
  const idx=drafts.findIndex(d=>d.draftId===draftId);
  if(idx>=0)drafts[idx]=draft;else drafts.unshift(draft);
  saveDrafts();delete state.draftListing;delete state.aiDraft;delete state.currentDraftId;state.screen='dashboard';save();dashboard();
}
async function createListing(e){
  e.preventDefault();
  const crop=document.getElementById('newCrop').value.trim();
  const files=[...(document.getElementById('newPhotos')?.files||[])].slice(0,4);
  if(!files.length){alert('Please upload at least one crop photo.');return}
  const emoji=crop.toLowerCase().includes('tomato')?'🍅':crop.toLowerCase().includes('potato')?'🥔':crop.toLowerCase().includes('onion')?'🧅':crop.toLowerCase().includes('chili')?'🌶️':'🌾';
  try{
    const images=await Promise.all(files.map(f=>fileToDataURL(f)));
    const item={id:Date.now(),crop,emoji,variety:document.getElementById('newVariety').value.trim()||'Fresh produce',qty:Number(document.getElementById('newQty').value),price:Number(document.getElementById('newPrice').value),harvest:document.getElementById('newHarvest').value,location:state.location||'Lucknow',farmer:state.name||'Ramesh Kumar',farm:state.farm||'Green Valley FPO',status:'Active',images};
    document.getElementById('m').remove();state.draftListing=item;delete state.currentDraftId;state.screen='aiAnalysis';save();aiAnalysis();
  }catch(err){alert('Could not process the photos. Please try smaller image files.');console.error(err)}
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}
function regression(y){
  const n=y.length;if(n<2)return {slope:0,intercept:y[0]||0,r2:0};
  const x=y.map((_,i)=>i),xm=(n-1)/2,ym=mean(y);
  let num=0,den=0;for(let i=0;i<n;i++){num+=(x[i]-xm)*(y[i]-ym);den+=(x[i]-xm)**2}
  const slope=den?num/den:0,intercept=ym-slope*xm;
  let ssTot=0,ssRes=0;for(let i=0;i<n;i++){const pred=intercept+slope*x[i];ssTot+=(y[i]-ym)**2;ssRes+=(y[i]-pred)**2}
  return {slope,intercept,r2:ssTot?clamp(1-ssRes/ssTot,0,1):0};
}
function seededNoise(i,seed){const x=Math.sin(i*12.9898+seed*78.233)*43758.5453;return (x-Math.floor(x))-.5}
const AI_CROPS={
  Tomatoes:{emoji:'🍅',base:30,trend:.075,season:2.2,arrival:120,water:'medium',harvest:['Sep','Oct','Nov','Dec']},
  Potatoes:{emoji:'🥔',base:25,trend:.025,season:1.4,arrival:170,water:'medium',harvest:['Oct','Nov','Dec','Jan']},
  Onions:{emoji:'🧅',base:32,trend:.055,season:2.6,arrival:135,water:'low',harvest:['Oct','Nov','Dec','Jan']},
  'Green Chilies':{emoji:'🌶️',base:47,trend:.09,season:3.1,arrival:65,water:'medium',harvest:['Sep','Oct','Nov','Dec']},
  Cauliflower:{emoji:'🥦',base:34,trend:.04,season:2.1,arrival:95,water:'medium',harvest:['Oct','Nov','Dec','Jan']},
  Cabbage:{emoji:'🥬',base:22,trend:.015,season:1.7,arrival:110,water:'medium',harvest:['Oct','Nov','Dec','Jan']}
};
function demoSeries(cropName){
  const c=AI_CROPS[cropName]||AI_CROPS.Tomatoes;const out=[];
  for(let i=0;i<42;i++){
    const seasonal=Math.sin((i/14)*Math.PI)*c.season;
    const p=c.base+c.trend*i+seasonal+seededNoise(i,c.base)*1.8;
    const arrivals=Math.max(25,c.arrival*(1+0.16*Math.sin(i/6)+0.08*seededNoise(i,c.base+3)));
    out.push({day:i,price:+p.toFixed(2),arrivals:+arrivals.toFixed(1)});
  }
  return out;
}
function modelFromSeries(series){
  const prices=series.map(x=>x.price),arr=series.map(x=>x.arrivals),last=prices[prices.length-1];
  const last14=prices.slice(-14),prev14=prices.slice(-28,-14);
  const pReg=regression(prices.slice(-21)),aReg=regression(arr.slice(-21));
  const priceChange=((mean(last14)-mean(prev14))/mean(prev14))*100;
  const arrivalChange=((mean(arr.slice(-7))-mean(arr.slice(-21,-14)))/mean(arr.slice(-21,-14)))*100;
  const forecast=last+pReg.slope*7;
  const volatility=Math.sqrt(mean(last14.map(v=>(v-mean(last14))**2)));
  const demandScore=clamp(62+priceChange*2-arrivalChange*0.8,5,97);
  const riskScore=clamp(38+arrivalChange*1.1-volatility*2,5,95);
  const confidence=Math.round(clamp(55+pReg.r2*25+(series.length>=30?12:0)-volatility*1.2,45,94));
  return {last,forecast,priceChange,arrivalChange,volatility,demandScore,riskScore,confidence,pReg,aReg};
}
function sparkline(series){
  const w=760,h=170,p=12,vals=series.map(x=>x.price),mn=Math.min(...vals),mx=Math.max(...vals),range=mx-mn||1;
  const pts=vals.map((v,i)=>`${p+i*(w-2*p)/(vals.length-1)},${h-p-(v-mn)/(range)*(h-2*p)}`).join(' ');
  return `<svg class="ai-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="42 day market price trend"><defs><linearGradient id="aiFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2d8a50" stop-opacity=".28"/><stop offset="1" stop-color="#2d8a50" stop-opacity="0"/></linearGradient></defs><polygon points="${p},${h-p} ${pts} ${w-p},${h-p}" fill="url(#aiFill)"/><polyline points="${pts}" fill="none" stroke="#247a46" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function modelBadge(source='Demo calibration dataset'){return `<span class="data-source-badge"><i></i>${esc(source)}</span>`}
function aiLab(){
  const defaultCrop='Tomatoes';const c=AI_CROPS[defaultCrop],m=modelFromSeries(demoSeries(defaultCrop));
  layout(`<main class="wrap ai-lab"><div class="row between ai-lab-head"><div><button class="back" onclick="dashboard()">← Dashboard</button><span class="ai-kicker">KISANCONNECT AI LAB</span><h1>🌱 From mandi data to a crop decision</h1><p class="muted">The prototype now calculates forecasts from a time series instead of displaying fixed recommendation values.</p></div>${modelBadge()}</div>
  <section class="ai-hero"><div><span class="ai-kicker light">DECISION SUPPORT</span><h2>Know what the market is doing before you list.</h2><p>Compare price momentum, market arrivals, volatility and seasonality. Then test which crops currently have stronger signals for your location.</p></div><div class="ai-hero-score"><span>Current demand signal</span><strong>${Math.round(m.demandScore)}<small>/100</small></strong><em>${m.demandScore>=70?'Strong':'Moderate'}</em></div></section>
  <section class="ai-control card"><div class="field"><label>Crop</label><select id="aiCrop" onchange="renderAISelected()">${Object.keys(AI_CROPS).map(k=>`<option>${k}</option>`).join('')}</select></div><div class="field"><label>Location</label><input id="aiLocation" value="${esc(state.location||'Lucknow')}"></div><div class="field"><label>Data mode</label><select id="aiMode"><option value="demo">Demo historical series</option><option value="live">Live AGMARKNET connector (API key)</option></select></div><button class="btn primary" onclick="runAIAnalysis()">Run forecast</button></section>
  <div id="aiResult">${aiResultHTML(defaultCrop,m,c)}</div>
  <section class="card grow-card"><div class="row between"><div><span class="ai-kicker">PLANNING MODEL</span><h2>🌾 What should I grow?</h2><p class="muted">Rank crops using the same market signals plus your water availability and harvest window.</p></div><button class="btn primary" onclick="runCropAdvisor()">Run crop advisor →</button></div><div class="grow-preview"><div>📍 ${esc(state.location||'Lucknow')}</div><div>💧 Water: Moderate</div><div>📅 Harvest: Next season</div></div></section>
  <section class="card methodology"><h2>🧠 How the model works</h2><div class="method-grid"><div><b>01 · Clean</b><p>Normalizes prices and arrivals and ignores invalid observations.</p></div><div><b>02 · Trend</b><p>Fits a linear trend to recent observations and projects the next 7 days.</p></div><div><b>03 · Demand</b><p>Combines price momentum with arrival pressure to form a 0–100 demand signal.</p></div><div><b>04 · Confidence</b><p>Uses sample size, trend fit and volatility to avoid pretending every forecast is equally reliable.</p></div></div><div class="notice small"><b>Important:</b> This prototype's bundled series is for demonstration. For deployment, the same pipeline should consume validated AGMARKNET/data.gov.in observations and weather/seasonality features. The government dataset provides daily min/max/modal wholesale prices and is an input to the model, not the model itself.</div></section>
  </main>`)
}
function aiResultHTML(cropName,m,c,source='Demo calibration dataset',series=null){
  const low=Math.max(1,m.forecast-m.volatility*1.4),high=m.forecast+m.volatility*1.4;
  const demand=m.demandScore>=72?'High':m.demandScore>=52?'Medium':'Low';
  const risk=m.riskScore>=68?'High':m.riskScore>=45?'Medium':'Low';
  const trend=m.priceChange>=4?'Rising':m.priceChange<=-4?'Falling':'Stable';
  return `<section class="ai-result-grid"><section class="card ai-price-card"><div class="row between"><div><span class="ai-kicker">7-DAY FORECAST</span><h2>${c.emoji} ${esc(cropName)}</h2></div>${modelBadge(source)}</div><div class="forecast-price">₹${low.toFixed(0)}–₹${high.toFixed(0)}<small>/kg expected range</small></div><div class="confidence-line"><span>Model confidence</span><b>${m.confidence}%</b><div><i style="width:${m.confidence}%"></i></div></div><div class="ai-metrics"><div><span>Demand signal</span><b>${demand}</b><small>${Math.round(m.demandScore)}/100</small></div><div><span>Price momentum</span><b>${trend}</b><small>${m.priceChange>=0?'+':''}${m.priceChange.toFixed(1)}% vs prior 14d</small></div><div><span>Arrival pressure</span><b>${m.arrivalChange>5?'Increasing':m.arrivalChange<-5?'Falling':'Stable'}</b><small>${m.arrivalChange>=0?'+':''}${m.arrivalChange.toFixed(1)}%</small></div><div><span>Oversupply risk</span><b>${risk}</b><small>${Math.round(m.riskScore)}/100</small></div></div></section><section class="card chart-card"><div class="row between"><div><h2>📈 Market price trend</h2><p class="small muted">42 observation points • model input</p></div><span class="trend-chip">Forecast ₹${m.forecast.toFixed(0)}</span></div>${sparkline(series||demoSeries(cropName))}<div class="chart-axis"><span>42 days ago</span><span>Today</span><span>+7 days</span></div></section></section><section class="ai-explain"><div><span class="ai-kicker">MODEL EXPLANATION</span><h3>Why this recommendation?</h3><p>${trend==='Rising'?'Recent price momentum is positive. ':trend==='Falling'?'Recent prices are losing momentum. ':'Prices are relatively stable. '}${m.arrivalChange>5?'Arrivals are rising, which adds supply pressure. ':m.arrivalChange<-5?'Lower arrivals are supporting the price signal. ':'Arrivals are broadly stable. '}The forecast range widens with volatility, so the model does not present a single guaranteed price.</p></div><div class="signal-list"><span>✓ Price trend</span><span>✓ Arrival pressure</span><span>✓ Volatility</span><span>✓ Recent sample fit</span></div></section>`;
}
function renderAISelected(){const crop=document.getElementById('aiCrop')?.value||'Tomatoes';const m=modelFromSeries(demoSeries(crop));const c=AI_CROPS[crop];const box=document.getElementById('aiResult');if(box)box.innerHTML=aiResultHTML(crop,m,c)}
async function runAIAnalysis(){
  const crop=document.getElementById('aiCrop')?.value||'Tomatoes',mode=document.getElementById('aiMode')?.value||'demo';
  if(mode==='live'){await liveAgmarknetAnalysis(crop);return}
  const m=modelFromSeries(demoSeries(crop)),c=AI_CROPS[crop];document.getElementById('aiResult').innerHTML=aiResultHTML(crop,m,c);toastAI(`Forecast refreshed for ${crop}.`)
}
async function liveAgmarknetAnalysis(crop){
  const key=prompt('Enter your data.gov.in API key for this local prototype. It is kept only in this browser session and is not sent anywhere else.');
  if(!key)return;
  const loc=(document.getElementById('aiLocation')?.value||state.location||'').trim();
  const url='https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key='+encodeURIComponent(key)+'&format=json&limit=100&filters='+encodeURIComponent(JSON.stringify({commodity:crop,state:'Uttar Pradesh'}));
  try{const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();const rows=(j.records||[]).map(x=>{const raw=Number(x.modal_price);const unit=String(x.unit||x.price_unit||'').toLowerCase();const price=unit.includes('quintal')?raw/100:raw;return {price,arrivals:Number(x.arrivals||x.arrival_qty||x.arrival_quantity||0),date:x.arrival_date}}).filter(x=>Number.isFinite(x.price)&&x.price>0);if(rows.length<5)throw new Error('Not enough matching observations');const series=rows.slice(-42).map((x,i)=>({day:i,price:x.price,arrivals:x.arrivals||1}));const m=modelFromSeries(series);document.getElementById('aiResult').innerHTML=aiResultHTML(crop,m,AI_CROPS[crop]||AI_CROPS.Tomatoes,'LIVE AGMARKNET / data.gov.in',series);toastAI(`Live market data loaded: ${rows.length} observations.`)}catch(err){alert('Live AGMARKNET data could not be loaded. Check the API key, internet connection and dataset filters. The demo model is still available.');console.error(err)}
}
function runCropAdvisor(){
  const rows=Object.entries(AI_CROPS).map(([name,c])=>{const m=modelFromSeries(demoSeries(name));const water=(c.water==='low'?8:0);const score=clamp(m.demandScore*0.58+(100-m.riskScore)*0.27+m.confidence*0.15+water,0,100);return {name,c,m,score}}).sort((a,b)=>b.score-a.score);
  document.getElementById('aiResult').innerHTML=`<section class="card crop-advisor-result"><div class="row between"><div><span class="ai-kicker">CROP OPPORTUNITY RANKING</span><h2>🌾 Current market opportunities</h2><p class="muted">Calculated from the model signals — not a guarantee of profit.</p></div><button class="btn secondary" onclick="renderAISelected()">Back to crop</button></div><div class="crop-rank-list">${rows.map((r,i)=>`<div class="crop-rank"><div class="rank-num">${i+1}</div><div class="rank-emoji">${r.c.emoji}</div><div class="rank-main"><div class="row between"><b>${r.name}</b><strong>${Math.round(r.score)}/100</strong></div><div class="rank-bar"><i style="width:${r.score}%"></i></div><div class="small muted">Demand ${Math.round(r.m.demandScore)}/100 • Risk ${Math.round(r.m.riskScore)}/100 • 7-day forecast ₹${r.m.forecast.toFixed(0)}/kg</div></div></div>`).join('')}</div></section>`;
}
function toastAI(msg){const t=document.createElement('div');t.className='ai-toast';t.textContent='✓ '+msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
function aiAnalysis(){
  const x=state.draftListing;if(!x){dashboard();return}
  const cropName=Object.keys(AI_CROPS).find(k=>x.crop.toLowerCase().includes(k.toLowerCase().replace('green chilies','green chili'))) || 'Tomatoes';
  const c=AI_CROPS[cropName]||AI_CROPS.Tomatoes,m=modelFromSeries(demoSeries(cropName));
  const low=Math.max(1,m.forecast-m.volatility*1.4),high=m.forecast+m.volatility*1.4;
  state.aiDraft={...x,analysis:{low:+low.toFixed(0),high:+high.toFixed(0),forecast:+m.forecast.toFixed(1),confidence:m.confidence,demand:Math.round(m.demandScore),risk:Math.round(m.riskScore)}};save();
  layout(`<main class="wrap"><button class="back" onclick="addListing()">← Edit listing</button><section class="analysis-hero"><div><span class="pill">STEP 2 — AI MARKET ANALYSIS</span><h1>${x.emoji} ${esc(x.crop)} market advisor</h1><p class="muted">A computed forecast using a 42-point historical series, recent momentum, arrival pressure and volatility.</p></div><div class="ai-badge">🤖 MODEL RUN COMPLETE</div></section><div class="ai-result-wrap">${aiResultHTML(x.crop,m,c)}</div><section class="card data-note"><div class="row"><div class="verify-icon mini">🧠</div><div><h2>This is now a working forecast engine</h2><p class="muted small">The recommendation is calculated at runtime from the historical series. For deployment, connect the same pipeline to validated AGMARKNET/data.gov.in observations and weather features. It is decision support, not a guaranteed prediction.</p></div></div></section><section class="publish-bar"><div><b>Ready to publish?</b><p class="small muted">${x.qty} kg • Your price ₹${x.price}/kg • Model range ₹${low.toFixed(0)}–₹${high.toFixed(0)}/kg</p></div><div class="row"><button class="btn secondary" onclick="saveCurrentDraft()">Save as draft</button><button class="btn primary" onclick="publishAnalyzed()">✓ Publish listing</button></div></section></main>`);
}
function publishAnalyzed(){
  const x=state.draftListing;if(!x)return;
  listings.push(x);write('kcListings',listings);if(state.currentDraftId){drafts=drafts.filter(d=>d.draftId!==state.currentDraftId);saveDrafts()}delete state.draftListing;delete state.aiDraft;delete state.currentDraftId;state.screen='dashboard';save();dashboard();
}

/* BUYER FLOW */
function buyerLoginScreen(){
  layout(`<main class="center"><section class="panel auth"><div class="verify-icon">🛒</div><span class="pill">BUYER LOGIN</span><h1>Buyer Login</h1><p class="muted">Sign in with your mobile number to browse verified farmer listings.</p>
  <form class="form" onsubmit="buyerSendOtp(event)"><div class="field"><label>Mobile number</label><input id="buyerPhone" inputmode="numeric" maxlength="10" placeholder="Enter 10-digit mobile number" required></div><button class="btn primary full">Send OTP</button></form>
  <p class="small muted">Prototype: OTP is simulated. Use <b>123456</b>.</p><button class="back" onclick="chooseRole()">← Choose another portal</button></section></main>`)
}
function buyerSendOtp(e){
  e.preventDefault();let p=document.getElementById('buyerPhone').value.replace(/\D/g,'');
  if(p.length!==10){alert('Enter a valid 10-digit number for the demo.');return}
  state.phone=p;state.screen='buyerOtp';save();buyerOtp()
}
function buyerOtp(){
  layout(`<main class="center"><section class="panel auth"><button class="back" onclick="buyerLoginScreen()">← Change number</button><div class="verify-icon">🔐</div><span class="pill">BUYER LOGIN</span><h1>Verify OTP</h1><p class="muted">Enter the demo OTP sent to +91 ${state.phone.slice(0,2)}******${state.phone.slice(-2)}.</p>
  <form class="form" onsubmit="buyerVerify(event)"><div class="field"><label>Demo OTP</label><input id="buyerOtp" inputmode="numeric" maxlength="6" placeholder="Enter 123456" required></div><button class="btn primary full">Enter Marketplace</button></form></section></main>`)
}
function buyerVerify(e){
  e.preventDefault();
  if(document.getElementById('buyerOtp').value!=='123456'){alert('Wrong OTP. Use 123456.');return}
  state.verified=true;state.screen='marketplace';save();marketplace()
}
function buyerLogout(){
  state={...DEFAULT_STATE};
  save();
  chooseRole();
}
function buyerProfile(){
  state.screen='buyerProfile';save();
  const orders=getOrders();
  const phone=state.phone||'';
  const masked=phone?`+91 ${phone.slice(0,2)}******${phone.slice(-2)}`:'Not verified';
  layout(`<main class="wrap buyer-profile-page">
    <div class="row between"><div><button class="back" onclick="marketplace()">← Back to marketplace</button><h1 style="margin-top:14px">Buyer Profile</h1><p class="muted">Manage your marketplace account and buyer activity.</p></div><button class="btn secondary" onclick="buyerLogout()">↪ Log out</button></div>
    <div class="buyer-profile-grid" style="margin-top:18px">
      <section class="card buyer-profile-card"><div class="buyer-profile-avatar">👤</div><span class="pill">VERIFIED BUYER</span><h2>Marketplace Buyer</h2><p class="muted">Mobile: ${masked}</p><div class="profile-trust"><span>✓ Mobile verified</span><span>✓ Buyer account active</span><span>✓ Trust Center access</span></div></section>
      <section class="card"><span class="ai-kicker">ACCOUNT SNAPSHOT</span><h2>Buyer activity</h2><div class="buyer-profile-stats"><div><span>Orders</span><b>${orders.length}</b></div><div><span>Cart items</span><b>${cartCount()}</b></div><div><span>Account</span><b>Active</b></div></div><div class="row" style="margin-top:16px;flex-wrap:wrap"><button class="btn primary" onclick="openCart()">🛒 Open cart</button><button class="btn secondary" onclick="buyerOrders()">📦 My orders</button><button class="btn secondary" onclick="trustCenter()">🛡️ Trust Center</button></div></section>
    </div>
    <section class="card buyer-profile-note"><h2>🔒 Account & privacy</h2><p class="small muted">Your mobile number is used for authentication in this prototype. A production system should minimize stored personal data, protect account information and use an authorized payment/verification provider for sensitive operations.</p></section>
  </main>`)
}
function buyerCart(){
  const cart=read('kcCart',[]); return Array.isArray(cart)?cart:[];
}
function saveBuyerCart(cart){write('kcCart',cart)}
function cartCount(){return buyerCart().length}
function listingDistance(x){return ({Lucknow:8,Barabanki:54}[x.location]??35)}
function listingFreshness(date){
  const d=new Date(date+'T12:00:00'), now=new Date('2026-09-26T12:00:00');
  const days=Math.max(0,Math.floor((now-d)/86400000));
  return days===0?'Harvested today':days===1?'Harvested yesterday':`Harvested ${days} days ago`;
}
function freshnessScore(date){
  const d=new Date(date+'T12:00:00'), now=new Date('2026-09-26T12:00:00');
  return Math.max(0,5-Math.floor((now-d)/86400000));
}
function buyerRating(name){return ({'Ramesh Kumar':4.7,'Suresh Yadav':4.6,'Anita Verma':4.8,'Mohan Singh':4.5}[name]||4.5)}
function buyerCategory(crop){return ['Tomatoes','Potatoes','Onions','Green Chilies','Cauliflower','Cabbage'].includes(crop)?'Vegetables':'Other'}
function marketplace(){
  layout(`<main class="wrap">
  <section class="buyer-hero"><div><span class="pill light-pill">✓ VERIFIED MARKETPLACE</span><h1>Fresh produce, direct from farmers.</h1><p>Compare price, freshness, distance and seller trust before you buy.</p></div><div class="buyer-hero-side"><div class="buyer-mini-stat"><b>${listings.filter(x=>x.status==='Active').length}</b><span>active listings</span></div><div class="buyer-mini-stat"><b>${cartCount()}</b><span>items in cart</span></div></div></section>
  <section class="smart-buy card"><div class="smart-buy-copy"><span class="ai-kicker">🤖 SMART BUY</span><h2>Tell us what you need.</h2><p class="muted">Set a budget, quantity and delivery need. KisanConnect will match available farmer listings.</p></div><div class="smart-buy-controls"><input id="smartQuery" placeholder="e.g. 50 kg tomatoes under ₹35/kg"><div class="row"><button class="btn primary" onclick="runSmartBuy()">Find best matches →</button><button class="btn secondary" onclick="openBulkBuyer()">🏪 Bulk buyer</button></div></div></section>
  <div id="smartResults"></div>
  <section class="card delivery-economics-banner"><div><span class="ai-kicker">🚚 DELIVERY ECONOMICS</span><h2>Transparent delivery pricing</h2><p class="small muted">Produce price stays visible separately from logistics. In this demo, orders below ₹999 use a ₹120 delivery charge; orders at or above ₹999 get free delivery.</p></div><div class="delivery-econ-tiles"><div><span>Buyer</span><b>₹120*</b></div><div><span>Farmer</span><b>₹0</b></div><div><span>Threshold</span><b>₹999</b></div></div></section>
  <section class="buyer-toolbar"><div><input id="search" placeholder="🔍 Search tomatoes, potatoes, onions..." oninput="renderMarket()"></div><div class="buyer-filter-row"><select id="categoryFilter" onchange="renderMarket()"><option value="">All categories</option><option>Vegetables</option><option>Fruits</option><option>Grains</option></select><select id="locationFilter" onchange="renderMarket()"><option value="">All locations</option><option>Lucknow</option><option>Barabanki</option></select><select id="sortFilter" onchange="renderMarket()"><option value="recommended">Recommended</option><option value="price">Lowest price</option><option value="fresh">Freshest</option><option value="distance">Nearest</option><option value="rating">Farmer rating</option></select></div></section>
  <section class="section-heading buyer-section-head"><div><span class="ai-kicker">FRESH NEAR YOU</span><h2>Marketplace listings</h2><p class="small muted">Every listing shows the information a buyer needs to compare farmers.</p></div><div class="row"><button class="btn secondary" onclick="trustCenter()">🛡️ Trust Center</button><button class="btn secondary" onclick="openCart()">🛒 Cart <span id="cartCountBadge">${cartCount()}</span></button><button class="btn secondary" onclick="buyerOrders()">📦 My orders</button></div></section>
  <div id="marketGrid" class="market-grid"></div></main>`)
  renderMarket()
}
function renderMarket(){
  const q=(document.getElementById('search')?.value||'').toLowerCase(), loc=document.getElementById('locationFilter')?.value||'', cat=document.getElementById('categoryFilter')?.value||'', sort=document.getElementById('sortFilter')?.value||'recommended';
  let filtered=listings.filter(x=>x.status==='Active'&&(!q||`${x.crop} ${x.variety} ${x.farmer} ${x.farm}`.toLowerCase().includes(q))&&(!loc||x.location===loc)&&(!cat||buyerCategory(x.crop)===cat));
  filtered.sort((a,b)=>{
    if(sort==='price')return a.price-b.price;if(sort==='fresh')return freshnessScore(b.harvest)-freshnessScore(a.harvest);if(sort==='distance')return listingDistance(a)-listingDistance(b);if(sort==='rating')return buyerRating(b.farmer)-buyerRating(a.farmer);
    return (freshnessScore(b.harvest)*3+(100-b.price)+Math.max(0,100-listingDistance(b))*.08)-(freshnessScore(a.harvest)*3+(100-a.price)+Math.max(0,100-listingDistance(a))*.08);
  });
  const grid=document.getElementById('marketGrid');if(!grid)return;
  grid.innerHTML=filtered.length?filtered.map(x=>{const inCart=buyerCart().find(i=>i.id===x.id);return `<section class="card product-card buyer-product-card"><div class="product-card-top"><div class="product-icon product-photo-thumb">${(x.images&&x.images[0])?`<img src="${esc(x.images[0])}" alt="${esc(x.crop)}">`:x.emoji}</div><span class="fresh-badge">${listingFreshness(x.harvest).replace('Harvested ','')} · ${listingDistance(x)} km</span></div><div class="row between"><h2>${esc(x.crop)}</h2><span class="rating-chip">★ ${buyerRating(x.farmer)}</span></div><p class="muted small">${esc(x.variety)}</p><div class="metric">₹${x.price}<span class="small muted">/kg</span></div><p class="small"><b>${x.qty} kg</b> available • ${listingFreshness(x.harvest)}</p><div class="seller-row"><span class="seller-avatar">👨‍🌾</span><div><b>${esc(x.farmer)}</b><span>${esc(x.farm)}</span></div></div><div class="buyer-trust-row"><span>✓ Verified farmer</span><span>🚚 ${listingDistance(x)} km</span></div><div class="buyer-card-actions"><button class="btn secondary" onclick="buyDemo(${x.id})">View details</button><button class="btn primary" onclick="quickAddCart(${x.id})">${inCart?'✓ In cart':'Add to cart'}</button></div></section>`}).join(''):`<div class="card"><h2>No listings found</h2><p class="muted">Try another crop, category or location.</p></div>`;
}
function buyDemo(id){
  const x=listings.find(v=>v.id===id);
  if(!x)return;
  state.selectedProduct=id;
  state.screen='product';
  save();
  productDetails();
}

function addProductToCart(id){
  const x=listings.find(v=>v.id===id),input=document.getElementById('buyQty');
  if(!x)return;
  const q=Math.max(1,Math.min(x.qty,Number(input?.value)||1));
  const cart=buyerCart(),existing=cart.find(i=>i.id===id);
  if(existing) existing.q=Math.min(x.qty,Number(existing.q)+q); else cart.push({id,q});
  saveBuyerCart(cart);
  const btn=document.getElementById('productAddCartBtn');
  if(btn){btn.textContent='✓ Added to cart';btn.disabled=true;btn.classList.add('added-cart');}
  const badge=document.getElementById('cartCountBadge');if(badge)badge.textContent=cartCount();
}
function quickAddCart(id){
  const x=listings.find(v=>v.id===id);if(!x)return;
  const cart=buyerCart(),existing=cart.find(i=>i.id===id);
  if(existing)existing.q=Math.min(x.qty,Number(existing.q)+1);else cart.push({id,q:1});
  saveBuyerCart(cart);
  renderMarket();
}
function removeFromCart(id){saveBuyerCart(buyerCart().filter(i=>i.id!==id));buyerCartScreen()}
function updateCartQty(id,delta){const cart=buyerCart(),item=cart.find(i=>i.id===id),x=listings.find(v=>v.id===id);if(!item||!x)return;item.q=Math.max(0,Math.min(x.qty,Number(item.q)+delta));saveBuyerCart(cart.filter(i=>i.q>0));buyerCartScreen()}
function openCart(){state.screen='cart';save();buyerCartScreen()}
function buyerCartScreen(){
  const items=buyerCart().map(i=>({...i,x:listings.find(v=>v.id===i.id)})).filter(i=>i.x&&i.x.status==='Active');
  const subtotal=items.reduce((s,i)=>s+i.x.price*i.q,0),delivery=subtotal>=999?0:(items.length?120:0),fee=Math.round(subtotal*.02),total=subtotal+fee+delivery;
  layout(`<main class="wrap"><div class="row between"><div><button class="back" onclick="marketplace()">← Continue shopping</button><h1 style="margin-top:14px">Your cart</h1><p class="muted">${items.reduce((s,i)=>s+i.q,0)} kg across ${items.length} farmer listing${items.length===1?'':'s'}.</p></div><button class="btn secondary" onclick="buyerOrders()">📦 My orders</button></div>${items.length?`<div class="checkout-grid" style="margin-top:18px"><section>${items.map(i=>`<article class="card cart-item"><div class="product-icon mini">${i.x.emoji}</div><div class="cart-main"><div class="row between"><div><h2>${esc(i.x.crop)}</h2><p class="small muted">${esc(i.x.farmer)} • ${listingFreshness(i.x.harvest)}</p></div><b>₹${(i.x.price*i.q).toLocaleString('en-IN')}</b></div><div class="cart-controls"><span>₹${i.x.price}/kg</span><button onclick="updateCartQty(${i.id},-1)">−</button><b>${i.q} kg</b><button onclick="updateCartQty(${i.id},1)">+</button><button class="remove-link" onclick="removeFromCart(${i.id})">Remove</button></div></div></article>`).join('')}</section><aside class="card summary"><h2>Cart summary</h2><div class="summary-row"><span>Produce</span><b>₹${subtotal.toLocaleString('en-IN')}</b></div><div class="summary-row"><span>Platform/service fee <small>(demo 2%)</small></span><b>₹${fee.toLocaleString('en-IN')}</b></div><div class="summary-row"><span>Delivery</span><b>${delivery?'₹'+delivery:'FREE'}</b></div><hr><div class="summary-row total"><span>Total</span><b>₹${total.toLocaleString('en-IN')}</b></div>${subtotal<999?'<div class="notice small">Add ₹'+(999-subtotal).toLocaleString('en-IN')+' more produce for free delivery in this prototype.</div>':''}<button class="btn primary full" onclick="startCartCheckout()">Continue to checkout →</button></aside></div>`:`<section class="card empty-cart"><div class="verify-icon">🧺</div><h2>Your cart is empty</h2><p class="muted">Add produce from verified farmers to start an order.</p><button class="btn primary" onclick="marketplace()">Browse marketplace</button></section>`}</main>`)
}
function runSmartBuy(){
  const input=(document.getElementById('smartQuery')?.value||'').trim().toLowerCase(),crop=(input.match(/tomatoes?|potatoes?|onions?|green chil(?:l|i)es?|cauliflower|cabbage/)||[])[0];
  const normalized=crop?({'tomato':'Tomatoes','tomatoes':'Tomatoes','potato':'Potatoes','potatoes':'Potatoes','onion':'Onions','onions':'Onions','green chilli':'Green Chilies','green chilies':'Green Chilies','green chili':'Green Chilies','cauliflower':'Cauliflower','cabbage':'Cabbage'}[crop]||crop):'';
  const qty=Number((input.match(/(\d+)\s*kg/)||[])[1]||50),budget=Number((input.match(/(?:under|below|less than|upto|up to)\s*₹?\s*(\d+)/)||[])[1]||Infinity);
  let matches=listings.filter(x=>x.status==='Active'&&(!normalized||x.crop===normalized)&&x.price<=budget);if(!matches.length)matches=listings.filter(x=>x.status==='Active'&&(!normalized||x.crop===normalized));matches=matches.sort((a,b)=>(a.price-b.price)+(listingDistance(a)-listingDistance(b))*.08-(freshnessScore(a.harvest)-freshnessScore(b.harvest))*.5).slice(0,3);
  const box=document.getElementById('smartResults');if(!box)return;box.innerHTML=matches.length?`<section class="smart-results"><div class="row between"><div><span class="ai-kicker">AI MATCH RESULTS</span><h2>Matches for ${normalized||'your requirement'}</h2><p class="small muted">Comparing price, freshness, distance and availability.</p></div><span class="pill">${qty} kg target</span></div><div class="smart-match-grid">${matches.map((x,i)=>`<article class="smart-match ${i===0?'best-match':''}"><div class="smart-rank">${i===0?'🥇':i===1?'🥈':'🥉'}</div><div class="smart-match-main"><div class="row between"><h3>${x.emoji} ${x.crop}</h3><b>₹${x.price}/kg</b></div><p class="small muted">${x.farmer} • ${x.farm}</p><div class="match-tags"><span>🌱 ${listingFreshness(x.harvest).replace('Harvested ','')}</span><span>📍 ${listingDistance(x)} km</span><span>📦 ${x.qty} kg</span></div><div class="row" style="margin-top:12px"><button class="btn secondary" onclick="buyDemo(${x.id})">View</button><button class="btn primary" onclick="addSpecificQuantity(${x.id},${Math.min(qty,x.qty)})">Add ${Math.min(qty,x.qty)} kg</button></div></div></article>`).join('')}</div></section>`:`<section class="smart-results card"><h2>No exact matches</h2><p class="muted">Try a higher budget, another crop, or remove the quantity constraint.</p></section>`;
}
function addSpecificQuantity(id,q){const x=listings.find(v=>v.id===id);if(!x)return;const cart=buyerCart(),existing=cart.find(i=>i.id===id);if(existing)existing.q=Math.min(x.qty,existing.q+q);else cart.push({id,q});saveBuyerCart(cart);toastBuyer(`${x.emoji} ${q} kg ${x.crop} added to cart`);}
function openBulkBuyer(){document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="bulkModal"><section class="panel bulk-panel"><button class="back" onclick="document.getElementById('bulkModal').remove()">← Close</button><span class="ai-kicker">🏪 BULK BUYER MODE</span><h1>Buy for a shop, restaurant or institution.</h1><p class="muted">Set a recurring requirement and match it with farmers/FPOs able to supply the volume.</p><div class="bulk-grid"><div class="field"><label>Buying for</label><select id="bulkType"><option>Retail shop</option><option>Restaurant</option><option>Institution</option><option>Wholesale</option></select></div><div class="field"><label>Produce</label><select id="bulkCrop"><option>Tomatoes</option><option>Potatoes</option><option>Onions</option><option>Green Chilies</option></select></div><div class="field"><label>Weekly quantity</label><input id="bulkQty" type="number" value="100" min="10"></div><div class="field"><label>Target price / kg</label><input id="bulkPrice" type="number" value="35" min="1"></div></div><div id="bulkResult" class="bulk-result hidden"></div><button class="btn primary full" onclick="runBulkMatch()">Find supply matches →</button></section></div>`)}
function runBulkMatch(){const crop=document.getElementById('bulkCrop').value,qty=Number(document.getElementById('bulkQty').value)||100,budget=Number(document.getElementById('bulkPrice').value)||35,matches=listings.filter(x=>x.status==='Active'&&x.crop===crop&&x.price<=budget).sort((a,b)=>b.qty-a.qty),box=document.getElementById('bulkResult');box.classList.remove('hidden');box.innerHTML=matches.length?`<div class="notice ok"><b>✓ ${matches.length} supply match${matches.length===1?'':'es'} found</b><p class="small">For a ${qty} kg weekly requirement, these listings can be combined. A production version would aggregate multiple farmers and verify recurring capacity.</p></div>${matches.map(x=>`<div class="bulk-match"><span>${x.emoji}</span><div><b>${x.crop} — ${x.farmer}</b><p class="small muted">${x.qty} kg available • ₹${x.price}/kg • ${x.location}</p></div><button class="btn secondary" onclick="addSpecificQuantity(${x.id},${Math.min(qty,x.qty)});document.getElementById('bulkModal').remove()">Add</button></div>`).join('')}`:`<div class="notice"><b>No current supply match.</b><p class="small muted">KisanConnect can surface alternative farmers, FPOs or a procurement request.</p></div>`}
function toastBuyer(message){const old=document.querySelector('.buyer-toast');if(old)old.remove();document.body.insertAdjacentHTML('beforeend',`<div class="buyer-toast">${esc(message)}</div>`);setTimeout(()=>document.querySelector('.buyer-toast')?.remove(),2200)}
function productDetails(){
  const x=listings.find(v=>v.id===state.selectedProduct);if(!x){marketplace();return}
  const defaultQty=Math.min(10,x.qty), subtotal=defaultQty*x.price, delivery=subtotal>=999?0:120, fee=Math.round(subtotal*.02), total=subtotal+fee+delivery;
  const eta=listingDistance(x)<=10?'Tomorrow, 10 AM – 1 PM':listingDistance(x)<=35?'Tomorrow, 2 PM – 6 PM':'2–3 days';
  layout(`<main class="wrap"><button class="back" onclick="marketplace()">← Back to marketplace</button><div style="height:14px"></div>
  <section class="product-detail"><div>${listingGallery(x)}</div><div class="product-main"><div class="row between"><div><span class="pill">✓ VERIFIED FARMER</span><h1>${esc(x.crop)}</h1><p class="muted">${esc(x.variety)} • ${esc(x.farm)}</p></div><span class="pill">${esc(x.status)}</span></div><div class="price-big">₹${x.price}<span>/kg</span></div><p><b>${x.qty} kg</b> available • ${listingFreshness(x.harvest)} • ${listingDistance(x)} km away</p><div class="compare"><div><span>Farmer</span><b>${esc(x.farmer)}</b><button class="profile-link" onclick="farmerProfile('${String(x.farmer).replace(/'/g,"\\'")}')">View farmer profile →</button></div><div><span>Farm / FPO</span><b>${esc(x.farm)}</b></div><div><span>Location</span><b>${esc(x.location)}</b></div><div><span>Buyer rating</span><b>★ ${buyerRating(x.farmer)}</b></div></div>
  <div class="listing-detail-highlights"><span>🌱 ${listingFreshness(x.harvest)}</span><span>✓ Verified source</span><span>🚚 Delivery ${eta}</span><span>📦 ${x.qty} kg available</span></div>
  <div class="trust-inline"><div><b>🛡️ Buyer Trust</b><span>Verified seller, transparent pricing and delivery terms.</span></div><button class="btn secondary" onclick="trustCenter()">Open Trust Center →</button></div>
  <div class="detail-actions"><div class="field"><label>Quantity to buy (kg)</label><div class="quantity-stepper"><button type="button" aria-label="Decrease quantity" onclick="adjustProductQty(${x.id},-1)">−</button><input id="buyQty" type="number" min="1" max="${x.qty}" value="${defaultQty}" oninput="updateProductTotal(${x.id})"><button type="button" aria-label="Increase quantity" onclick="adjustProductQty(${x.id},1)">+</button></div><small class="muted">Maximum ${x.qty} kg available</small></div><div><div class="small muted">Produce subtotal</div><div id="productTotal" class="metric">₹${subtotal.toLocaleString('en-IN')}</div></div><div class="row"><button id="productAddCartBtn" class="btn secondary ${buyerCart().some(i=>i.id===x.id)?'added-cart':''}" ${buyerCart().some(i=>i.id===x.id)?'disabled':''} onclick="addProductToCart(${x.id})">${buyerCart().some(i=>i.id===x.id)?'✓ Added to cart':'🛒 Add to cart'}</button><button class="btn primary" onclick="startCheckout(${x.id})">Buy now →</button></div></div></div></section>
  <div class="detail-grid"><section class="card"><h2>🌱 Listing details</h2><div class="detail-facts"><div><span>Harvest date</span><b>${x.harvest}</b></div><div><span>Variety</span><b>${esc(x.variety)}</b></div><div><span>Available stock</span><b>${x.qty} kg</b></div><div><span>Pickup region</span><b>${esc(x.location)}</b></div><div><span>Estimated distance</span><b>${listingDistance(x)} km</b></div><div><span>Seller rating</span><b>★ ${buyerRating(x.farmer)} / 5</b></div></div></section>
  <section class="card"><h2>🚚 Delivery economics</h2><p class="small muted">A transparent demo breakdown showing where the buyer's money goes. Delivery is a separate logistics cost rather than hidden inside the produce price.</p><div class="economics-list"><div><span id="econProduceLabel">Produce (${defaultQty} kg × ₹${x.price})</span><b id="econProduce">₹${subtotal.toLocaleString('en-IN')}</b></div><div><span>Platform / service fee <small>(demo 2%)</small></span><b id="econFee">₹${fee}</b></div><div><span>Delivery</span><b id="econDelivery">${delivery?'₹'+delivery:'FREE'}</b></div><div class="economics-total"><span>Estimated buyer total</span><b id="econTotal">₹${total.toLocaleString('en-IN')}</b></div></div><div class="notice small" style="margin-top:12px">Free delivery threshold: <b>₹999</b> in this prototype. The actual logistics quote would depend on distance, weight, route and provider.</div></section>
  <section class="card"><h2>🛡️ Buyer protection</h2><ul class="muted"><li>Verified farmer/FPO identity is shown before purchase.</li><li>Quantity and harvest information are visible before checkout.</li><li>Order status moves through farmer acceptance → pickup → transit → delivery.</li><li>Production version should define quality disputes, cancellation/refund rules and logistics liability.</li></ul></section>
  <section class="card"><h2>📊 Why this listing?</h2><p class="muted">KisanConnect helps buyers compare <b>price + freshness + distance + seller trust</b> instead of selecting on price alone. Smart Buy can also compare multiple listings for the same requirement.</p><div class="detail-score-grid"><div><span>Price</span><b>₹${x.price}/kg</b></div><div><span>Freshness</span><b>${freshnessScore(x.harvest)}/5</b></div><div><span>Distance</span><b>${listingDistance(x)} km</b></div><div><span>Seller trust</span><b>★ ${buyerRating(x.farmer)}</b></div></div></section></div>${reviewsSection(x)}</main>`)
}
function adjustProductQty(id,delta){
  const x=listings.find(v=>v.id===id),input=document.getElementById('buyQty');
  if(!x||!input)return;
  const current=Number(input.value)||1;
  input.value=Math.max(1,Math.min(x.qty,current+delta));
  updateProductTotal(id);
}
function updateProductTotal(id){
  const x=listings.find(v=>v.id===id);const input=document.getElementById('buyQty');if(!x||!input)return;
  let q=Math.max(1,Math.min(x.qty,Number(input.value)||1));input.value=q;
  const subtotal=q*x.price,fee=Math.round(subtotal*.02),delivery=subtotal>=999?0:120,total=subtotal+fee+delivery;
  const el=document.getElementById('productTotal');if(el)el.textContent='₹'+subtotal.toLocaleString('en-IN');
  const label=document.getElementById('econProduceLabel');if(label)label.textContent=`Produce (${q} kg × ₹${x.price})`;
  const produce=document.getElementById('econProduce');if(produce)produce.textContent='₹'+subtotal.toLocaleString('en-IN');
  const feeEl=document.getElementById('econFee');if(feeEl)feeEl.textContent='₹'+fee.toLocaleString('en-IN');
  const deliveryEl=document.getElementById('econDelivery');if(deliveryEl)deliveryEl.textContent=delivery?'₹'+delivery:'FREE';
  const totalEl=document.getElementById('econTotal');if(totalEl)totalEl.textContent='₹'+total.toLocaleString('en-IN');
}
function startCheckout(id){
  const x=listings.find(v=>v.id===id);if(!x)return;
  const q=Math.max(1,Math.min(x.qty,Number(document.getElementById('buyQty')?.value)||1));
  state.checkout={items:[{id,q}]};state.screen='checkout';save();checkout()
}
function startCartCheckout(){
  const items=buyerCart().filter(i=>listings.some(x=>x.id===i.id&&x.status==='Active'&&i.q>0));
  if(!items.length){toastBuyer('Your cart is empty');return}
  state.checkout={items:items.map(i=>({id:i.id,q:i.q}))};state.screen='checkout';save();checkout()
}
function checkout(){
  const items=(state.checkout?.items||[]).map(i=>({...i,x:listings.find(v=>v.id===i.id)})).filter(i=>i.x&&i.x.status==='Active');
  if(!items.length){marketplace();return}
  const subtotal=items.reduce((s,i)=>s+i.x.price*i.q,0),fee=Math.round(subtotal*.02),delivery=subtotal>=999?0:120,total=subtotal+fee+delivery;
  state.checkoutTotals={subtotal,fee,delivery,total};save();
  layout(`<main class="wrap"><button class="back" onclick="${items.length>1?'openCart()':'productDetails()'}">← Back</button><div style="height:14px"></div><div class="checkout-grid"><section class="card"><span class="pill">CHECKOUT</span><h1>Complete your order</h1><p class="muted">You're buying directly from verified farmer listings.</p><div class="checkout-items">${items.map(i=>`<div class="order-product"><div class="product-icon mini">${i.x.emoji}</div><div><b>${esc(i.x.crop)}</b><p class="small muted">${i.q} kg × ₹${i.x.price}/kg • ${esc(i.x.farmer)}</p></div><strong style="margin-left:auto">₹${(i.x.price*i.q).toLocaleString('en-IN')}</strong></div>`).join('')}</div><h2 style="margin-top:24px">Delivery details</h2><form class="form" onsubmit="placeOrder(event)"><div class="field"><label>Buyer / business name</label><input id="buyerName" placeholder="e.g. FreshMart Store" required></div><div class="field"><label>Delivery address</label><input id="buyerAddress" placeholder="Enter delivery address" required></div><div class="row"><div class="field" style="flex:1"><label>City</label><input id="buyerCity" value="Lucknow" required></div><div class="field" style="flex:1"><label>PIN code</label><input id="buyerPin" inputmode="numeric" maxlength="6" placeholder="226001" required></div></div><h2 style="margin-top:8px">Delivery option</h2><div class="choice"><strong>🚚 Standard delivery</strong><span class="small muted">Expected in 2–3 days • Delivery fee depends on order value.</span></div><h2 style="margin-top:8px">Payment</h2><div class="choice"><strong>💳 Demo payment gateway</strong><span class="small muted">No real payment will be processed in this prototype.</span></div><button class="btn primary full">Place demo order • ₹${total.toLocaleString('en-IN')}</button></form></section><aside class="card summary"><h2>Order summary</h2><div class="summary-row"><span>Produce</span><b>₹${subtotal.toLocaleString('en-IN')}</b></div><div class="summary-row"><span>Platform/service fee <small>(demo 2%)</small></span><b>₹${fee.toLocaleString('en-IN')}</b></div><div class="summary-row"><span>Delivery</span><b>${delivery?'₹'+delivery:'FREE'}</b></div>${delivery?'<div class="notice small" style="margin-top:12px">Free delivery threshold in this prototype: <b>₹999</b>. The demo ₹120 covers the delivery line item; actual provider pricing would vary by route and weight.</div>':'<div class="notice ok small" style="margin-top:12px">🎉 This order crossed the ₹999 threshold, so delivery is shown as FREE to the buyer.</div>'}<hr><div class="summary-row total"><span>Total</span><b>₹${total.toLocaleString('en-IN')}</b></div><p class="small muted">Taxes are not hard-coded here because actual GST/tax treatment depends on the product and marketplace/payment structure.</p></aside></div></main>`)
}
function placeOrder(e){
  e.preventDefault();const items=(state.checkout?.items||[]).map(i=>({...i,x:listings.find(v=>v.id===i.id)})).filter(i=>i.x&&i.x.status==='Active');if(!items.length)return;
  const name=document.getElementById('buyerName').value.trim(),address=document.getElementById('buyerAddress').value.trim(),city=document.getElementById('buyerCity').value.trim(),pin=document.getElementById('buyerPin').value.trim();if(pin.length!==6){alert('Enter a valid 6-digit PIN code.');return}
  const t=state.checkoutTotals||{},orderId='KC-'+Date.now().toString().slice(-6);
  const order={id:orderId,items:items.map(i=>({crop:i.x.crop,emoji:i.x.emoji,qty:i.q,price:i.x.price,farmer:i.x.farmer,farm:i.x.farm,location:i.x.location})),crop:items.length===1?items[0].x.crop:`${items.length} produce items`,emoji:items.length===1?items[0].x.emoji:'🧺',qty:items.reduce((s,i)=>s+i.q,0),price:items.length===1?items[0].x.price:0,total:t.total||items.reduce((s,i)=>s+i.x.price*i.q,0),farmer:items.length===1?items[0].x.farmer:'Multiple farmers',farm:items.length===1?items[0].x.farm:'Multiple farms',farmerLocation:items.length===1?items[0].x.location:'Multiple locations',buyer:name,status:'Order placed',statusIndex:0,address:`${address}, ${city} - ${pin}`,date:new Date().toLocaleDateString('en-IN'),partner:'KisanConnect Logistics (Demo)',trackingId:'KCL-'+Date.now().toString().slice(-7),eta:'2–3 days',events:[{status:'Order placed',time:'Just now',note:'Buyer payment/order request recorded.'}]};
  const orders=read('kcOrders',[]);orders.unshift(order);write('kcOrders',orders);saveBuyerCart([]);state.lastOrder=order;state.screen='orderSuccess';save();orderSuccess()
}
const ORDER_STAGES=[
  {name:'Order placed',icon:'🧾',note:'Order request created and awaiting farmer acceptance.'},
  {name:'Farmer accepted',icon:'👨‍🌾',note:'Farmer confirmed the quantity and is preparing the produce.'},
  {name:'Pickup scheduled',icon:'📅',note:'A logistics partner has been assigned a pickup.'},
  {name:'Picked up',icon:'🚚',note:'Produce has been collected from the farmer.'},
  {name:'In transit',icon:'📍',note:'Produce is moving toward the buyer.'},
  {name:'Delivered',icon:'✅',note:'Buyer delivery completed.'}
];
function getOrders(){return read('kcOrders',[])}
function saveOrders(orders){write('kcOrders',orders)}
function stageClass(i,current){return i<current?'done':i===current?'current':''}
function trackingTimeline(o){
  const current=Math.max(0,Math.min(ORDER_STAGES.length-1,Number(o.statusIndex)||0));
  return `<div class="timeline">${ORDER_STAGES.map((st,i)=>`<div class="timeline-item ${stageClass(i,current)}"><div class="timeline-dot">${st.icon}</div><div><b>${st.name}</b>${i===current?'<span class="pill tiny-pill">CURRENT</span>':''}<p class="small muted">${st.note}</p></div></div>`).join('')}</div>`
}
function trackingActions(o,role){
  const current=Number(o.statusIndex)||0;
  if(current>=ORDER_STAGES.length-1)return '<div class="notice ok"><b>✓ Delivery completed</b><br><span class="small">The order has reached the buyer. Farmer settlement can be reconciled after delivery.</span></div>';
  const next=ORDER_STAGES[current+1];
  if(role==='farmer' && current===0)return `<button class="btn primary" onclick="advanceOrder('${o.id}')">✓ Accept order</button><p class="small muted">Accepting the order confirms the farmer can supply the requested quantity.</p>`;
  if(role==='farmer' && current===1)return `<button class="btn primary" onclick="advanceOrder('${o.id}')">📅 Schedule pickup</button><p class="small muted">Demo action: assigns a third-party logistics partner.</p>`;
  if(role==='farmer' && current===2)return `<button class="btn primary" onclick="advanceOrder('${o.id}')">🚚 Mark picked up</button><p class="small muted">Demo action: simulates logistics pickup from the farm.</p>`;
  return `<button class="btn primary" onclick="advanceOrder('${o.id}')">${next.icon} Simulate ${next.name}</button><p class="small muted">Prototype control — a real logistics partner would update this status through an integration.</p>`;
}
function advanceOrder(id){
  const orders=getOrders();const idx=orders.findIndex(o=>o.id===id);if(idx<0)return;
  const o=orders[idx];const current=Number(o.statusIndex)||0;if(current>=ORDER_STAGES.length-1)return;
  const next=ORDER_STAGES[current+1];o.statusIndex=current+1;o.status=next.name;o.events=o.events||[];o.events.push({status:next.name,time:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}),note:next.note});
  if(o.status==='Pickup scheduled')o.partner='KisanConnect Logistics (Demo)';
  if(o.status==='In transit')o.eta='Tomorrow, 6:00 PM';
  saveOrders(orders);state.lastOrder=o;save();
  if(state.role==='farmer')farmerOrders();else buyerTracking(id)
}
function trustCenter(){
  const active=listings.filter(x=>x.status==='Active').length;
  const verified=new Set(listings.filter(x=>x.status==='Active').map(x=>x.farmer)).size;
  const orderCount=getOrders().length;
  layout(`<main class="wrap trust-page">
    <div class="row between"><div><button class="back" onclick="marketplace()">← Back to marketplace</button><div style="height:12px"></div><span class="pill">BUYER PROTECTION</span><h1>🛡️ Trust Center</h1><p class="muted">See how KisanConnect helps buyers evaluate sellers, pricing, produce quality and delivery risk.</p></div><div class="trust-score"><span>MARKETPLACE TRUST</span><b>Protected</b><small>Demo framework</small></div></div>
    <section class="trust-hero card"><div><span class="ai-kicker">HOW TRUST WORKS</span><h2>Know who you are buying from — before you pay.</h2><p class="muted">Trust signals are shown at listing level so buyers can compare sellers without exposing sensitive identity documents.</p></div><div class="trust-hero-stats"><div><b>${active}</b><span>active listings</span></div><div><b>${verified}</b><span>verified marketplace sources</span></div><div><b>${orderCount}</b><span>demo orders</span></div></div></section>
    <div class="trust-grid">
      <section class="card trust-card"><div class="trust-icon">✓</div><div><h2>Farmer verification</h2><p class="muted">Seller accounts can be verified through authorized identity checks or FPO/assisted verification. Buyers see a verified status, not raw identity documents.</p><span class="trust-status">VERIFICATION STATUS</span></div></section>
      <section class="card trust-card"><div class="trust-icon">🌱</div><div><h2>Produce transparency</h2><p class="muted">Listings show crop, variety, available quantity, harvest date, seller, farm/FPO and location so buyers can compare freshness and availability.</p><span class="trust-status">LISTING SIGNALS</span></div></section>
      <section class="card trust-card"><div class="trust-icon">₹</div><div><h2>Price transparency</h2><p class="muted">Produce value, service fee and delivery are displayed separately. The buyer can see the free-delivery threshold before checkout.</p><span class="trust-status">COST BREAKDOWN</span></div></section>
      <section class="card trust-card"><div class="trust-icon">🚚</div><div><h2>Delivery transparency</h2><p class="muted">Orders show a logistics partner, tracking ID and staged delivery timeline. Production integrations would supply live status and proof of delivery.</p><span class="trust-status">TRACKABLE ORDER</span></div></section>
      <section class="card trust-card"><div class="trust-icon">⚖️</div><div><h2>Disputes & protection</h2><p class="muted">If quantity, quality, delivery or listing information does not match the order, a production system can open a dispute, preserve evidence and route it for review.</p><button class="btn secondary" onclick="openTrustReport()">Report a problem →</button></section>
      <section class="card trust-card"><div class="trust-icon">🔒</div><div><h2>Privacy by design</h2><p class="muted">Only information needed for the marketplace should be collected. Sensitive identity information should remain with authorized verification providers and not appear on public listings.</p><span class="trust-status">DATA MINIMIZATION</span></div></section>
    </div>
    <section class="card trust-rules"><div class="section-heading"><div><span class="ai-kicker">BUYER CHECKLIST</span><h2>Before placing an order</h2></div></div><div class="trust-checklist"><div><b>01</b><span>Check farmer verification and rating.</span></div><div><b>02</b><span>Compare harvest date, quantity and distance.</span></div><div><b>03</b><span>Review produce + fee + delivery total.</span></div><div><b>04</b><span>Keep the order ID and delivery evidence if a problem occurs.</span></div></div><p class="small muted">Prototype note: dispute handling, refunds, insurance and logistics liability would be governed by production contracts and applicable consumer rules.</p></section>
  </main>`)
}
function openTrustReport(){
  document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="trustReportModal"><section class="panel trust-report-panel"><div class="row between"><div><span class="pill">REPORT / DISPUTE</span><h2 style="margin-top:10px">What went wrong?</h2></div><button class="back" onclick="document.getElementById('trustReportModal').remove()">✕</button></div><p class="muted small">This prototype records a demo report for the admin Risk & Dispute Center. No real refund or payment reversal is triggered.</p><div class="form"><div class="field"><label>Issue type</label><select id="trustIssue"><option>Quality mismatch</option><option>Quantity mismatch</option><option>Late / failed delivery</option><option>Listing information issue</option><option>Seller conduct</option></select></div><div class="field"><label>Order ID (optional)</label><input id="trustOrder" placeholder="e.g. KC-123456"></div><div class="field"><label>Short description</label><textarea id="trustDesc" rows="4" placeholder="Describe what happened..."></textarea></div><button class="btn primary full" onclick="submitTrustReport()">Submit demo report</button></div></section></div>`)
}
function submitTrustReport(){
  const issue=document.getElementById('trustIssue')?.value||'Other',order=document.getElementById('trustOrder')?.value.trim()||'Not provided',desc=document.getElementById('trustDesc')?.value.trim()||'No description provided';
  const reports=read('kcDisputes',[]);reports.unshift({id:'D'+Date.now().toString().slice(-6),type:issue,severity:'Medium',status:'Open',order,parties:'Buyer report',reason:desc,created:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),evidence:'Buyer-submitted description',source:'Buyer Trust Center'});write('kcDisputes',reports);document.getElementById('trustReportModal')?.remove();toastBuyer('Report submitted to the demo Risk & Dispute Center');
}

function buyerOrders(){
  const orders=getOrders();
  layout(`<main class="wrap"><div class="row between"><div><button class="back" onclick="marketplace()">← Back to marketplace</button><h1 style="margin-top:14px">My Orders</h1><p class="muted">Track your purchases from farmer acceptance to delivery.</p></div></div>
  <div class="orders-list">${orders.length?orders.map(o=>`<section class="card order-card"><div class="row between"><div><span class="pill">${o.status.toUpperCase()}</span><h2>${o.emoji||'🌾'} ${o.crop}</h2><p class="small muted">Order ${o.id} • ${o.qty} kg • ${o.date}</p></div><div style="text-align:right"><b>₹${Number(o.total).toLocaleString('en-IN')}</b><br><button class="btn primary" style="margin-top:9px" onclick="buyerTracking('${o.id}')">Track order →</button></div></div></section>`).join(''):`<div class="card"><h2>No orders yet</h2><p class="muted">Place an order from the marketplace and it will appear here.</p></div>`}</div></main>`)
}
function buyerTracking(id){
  const o=getOrders().find(x=>x.id===id)||state.lastOrder;if(!o){buyerOrders();return}
  state.lastOrder=o;state.screen='tracking';save();
  layout(`<main class="wrap"><button class="back" onclick="buyerOrders()">← Back to my orders</button><div style="height:14px"></div>
  <section class="track-hero"><div><span class="pill">ORDER ${o.id}</span><h1>${o.emoji||'🌾'} ${o.crop} — ${o.status}</h1><p class="muted">${o.qty} kg • ₹${Number(o.total).toLocaleString('en-IN')} • ${o.buyer||'Buyer'}</p></div><div class="track-eta"><span class="small muted">Estimated delivery</span><b>${o.statusIndex>=5?'Delivered':o.eta||'2–3 days'}</b></div></section>
  <div class="tracking-grid"><section class="card"><h2>📦 Delivery timeline</h2>${trackingTimeline(o)}</section><aside class="card"><h2>🚚 Logistics</h2><div class="logistic-box"><b>${o.partner||'KisanConnect Logistics (Demo)'}</b><p class="small muted">Tracking ID: ${o.trackingId||'KCL-DEMO'}</p><p class="small">Pickup: <b>${o.farm||'Farmer farm'}</b>, ${o.farmerLocation||'Lucknow'}</p><p class="small">Delivery: <b>${o.address}</b></p></div><div style="height:14px"></div><h3>Current status</h3>${trackingActions(o,'buyer')}</aside></div>
  <section class="card"><div class="row between"><div><h2>Order details</h2><p class="small muted">Farmer: ${o.farmer} • ${o.farm||'FPO'}</p></div><span class="pill">Verified source</span></div><div class="summary-row"><span>Produce</span><b>${o.qty} kg ${o.crop}</b></div><div class="summary-row"><span>Total paid (demo)</span><b>₹${Number(o.total).toLocaleString('en-IN')}</b></div><p class="small muted">In a production system, live location, delivery proof, cancellation/refund rules and logistics liability would come from the contracted delivery provider.</p></section></main>`)
}
function farmerOrders(){
  const farmer=state.name||'Ramesh Kumar';const orders=getOrders().filter(o=>o.farmer===farmer);
  layout(`<main class="wrap"><button class="back" onclick="dashboard()">← Back to dashboard</button><div style="height:14px"></div><section class="dashhead"><div><span class="pill">FARMER ORDERS</span><h1>Orders & logistics</h1><p class="muted">Accept buyer orders and move them through the delivery workflow.</p></div><span class="pill">${orders.length} order${orders.length===1?'':'s'}</span></section><div style="height:18px"></div>${orders.length?orders.map(o=>`<section class="card order-card" style="margin-bottom:15px"><div class="row between"><div><span class="pill">${o.status}</span><h2>${o.emoji||'🌾'} ${o.crop} — ${o.qty} kg</h2><p class="small muted">${o.id} • Buyer: ${o.buyer||'Buyer'} • ₹${Number(o.total).toLocaleString('en-IN')}</p></div><button class="btn primary" onclick="farmerTrack('${o.id}')">Manage order →</button></div></section>`).join(''):`<section class="card"><h2>No incoming orders yet</h2><p class="muted">When a buyer places an order against your listing, it will appear here.</p><p class="small muted">Tip for the demo: log in as <b>Ramesh Kumar</b>, then place an order for the Tomatoes listing from the buyer portal.</p></section>`}</main>`)
}
function farmerTrack(id){
  const o=getOrders().find(x=>x.id===id);if(!o){farmerOrders();return}
  state.lastOrder=o;state.screen='farmerTracking';save();
  layout(`<main class="wrap"><button class="back" onclick="farmerOrders()">← Back to farmer orders</button><div style="height:14px"></div><section class="track-hero"><div><span class="pill">INCOMING ORDER ${o.id}</span><h1>${o.emoji||'🌾'} ${o.crop} — ${o.qty} kg</h1><p class="muted">Buyer: ${o.buyer||'Buyer'} • Total: ₹${Number(o.total).toLocaleString('en-IN')}</p></div><div class="track-eta"><span class="small muted">Status</span><b>${o.status}</b></div></section><div class="tracking-grid"><section class="card"><h2>📦 Delivery timeline</h2>${trackingTimeline(o)}</section><aside class="card"><h2>🚚 Logistics</h2><p class="small muted">${o.partner||'KisanConnect Logistics (Demo)'}</p><p class="small">Tracking ID: <b>${o.trackingId||'KCL-DEMO'}</b></p><div style="height:8px"></div>${trackingActions(o,'farmer')}</aside></div><section class="card"><h2>Buyer & delivery</h2><div class="summary-row"><span>Buyer</span><b>${o.buyer||'Buyer'}</b></div><div class="summary-row"><span>Delivery address</span><b>${o.address}</b></div><div class="summary-row"><span>Produce</span><b>${o.qty} kg ${o.crop}</b></div><p class="small muted">For the prototype, logistics status is advanced manually. A production version would receive these updates from a third-party logistics provider.</p></section></main>`)
}
function orderSuccess(){
  const o=state.lastOrder;if(!o){marketplace();return}
  layout(`<main class="center"><section class="panel auth"><div class="verify-icon">✓</div><span class="pill">ORDER CONFIRMED</span><h1>Order placed successfully</h1><p class="muted">Your order is now in the logistics workflow.</p><div class="card"><div class="summary-row"><span>Order ID</span><b>${o.id}</b></div><div class="summary-row"><span>Produce</span><b>${o.qty} kg ${o.crop}</b></div><div class="summary-row"><span>Total</span><b>₹${Number(o.total).toLocaleString('en-IN')}</b></div><div class="summary-row"><span>Status</span><b>${o.status}</b></div></div><div class="row" style="margin-top:15px"><button class="btn secondary full" onclick="marketplace()">Marketplace</button><button class="btn primary full" onclick="buyerTracking('${o.id}')">Track order →</button></div></section></main>`)
}

function resetDemo(){
  try{localStorage.removeItem('kcState');localStorage.removeItem('kcListings');localStorage.removeItem('kcOrders');localStorage.removeItem('kcDrafts');localStorage.removeItem('kcNotifications');localStorage.removeItem('kcCart')}catch(e){}
  listings=DEMO_LISTINGS.map(x=>({...x}));
  write('kcListings',listings);
  const demoOrder={id:'KC-DEMO01',crop:'Tomatoes',emoji:'🍅',qty:50,price:28,total:1428,farmer:'Ramesh Kumar',farm:'Green Valley FPO',farmerLocation:'Lucknow',buyer:'FreshMart Store',status:'In transit',statusIndex:4,address:'12 Market Road, Lucknow - 226001',date:'25/09/2026',partner:'KisanConnect Logistics (Demo)',trackingId:'KCL-DEMO01',eta:'Tomorrow, 6:00 PM',events:[{status:'Order placed',time:'09:30',note:'Order request created.'},{status:'Farmer accepted',time:'10:05',note:'Farmer confirmed the order.'},{status:'Pickup scheduled',time:'10:40',note:'Logistics partner assigned.'},{status:'Picked up',time:'12:15',note:'Produce collected from the farm.'},{status:'In transit',time:'14:20',note:'Produce is moving toward the buyer.'}]};
  write('kcOrders',[demoOrder]);state={...DEFAULT_STATE};chooseRole()
}

// Keep authenticated buyer UI visible when a previously saved prototype session is reopened.
// Buyer login itself still requires OTP; only authenticated buyer screens are repaired here.
if(state.role==='buyer' && ['marketplace','product','cart','buyerProfile','checkout','orderSuccess','tracking'].includes(state.screen) && !state.verified){
  state.verified=true;
  save();
}

if(state.role==='buyer'&&state.screen==='marketplace')marketplace();
else if(state.role==='buyer'&&state.screen==='product'&&state.selectedProduct)productDetails();
else if(state.role==='buyer'&&state.screen==='cart')buyerCartScreen();
else if(state.role==='buyer'&&state.screen==='buyerProfile')buyerProfile();
else if(state.role==='buyer'&&state.screen==='checkout'&&state.checkout)checkout();
else if(state.role==='buyer'&&state.screen==='orderSuccess'&&state.lastOrder)orderSuccess();
else if(state.role==='buyer'&&state.screen==='tracking'&&state.lastOrder)buyerTracking(state.lastOrder.id);
else if(state.role==='farmer'&&state.screen==='farmerTracking'&&state.lastOrder)farmerTrack(state.lastOrder.id);
else if(state.role==='buyer'&&state.screen==='buyerOtp')buyerOtp();
else if(state.role==='buyer'&&state.screen==='buyerLogin')buyerLoginScreen();
else if(state.screen==='dashboard'&&state.verified)dashboard();
else if(state.screen==='profile'&&state.verified)farmerProfile();
else if(state.screen==='aiAnalysis'&&state.draftListing)aiAnalysis();
else login();
