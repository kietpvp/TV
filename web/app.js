/**
 * Asia F&B TV — HTML design playground.
 * Tất cả các nút trong BẢN WEB chỉ mô phỏng, không điều khiển Android.
 * Bản React Native thật nằm tại ../react-native/App.tsx.
 */
'use strict';
const STAGE_WIDTH = 1672;
const STAGE_HEIGHT = STAGE_WIDTH * 9 / 16;
const stage = document.querySelector('#stage');
const dialog = document.querySelector('#dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogContent = document.querySelector('#dialog-content');
const toast = document.querySelector('#toast');
const volume = document.querySelector('#volume-slider');
const volumeValue = document.querySelector('#volume-value');
const muteIcon = document.querySelector('#mute-icon');
const appManager = document.querySelector('#app-manager');
let libraryApps = [];
let libraryPins = [];
let managerFilter = 'all';
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let muted = false;
let toastTimer = null;

// Danh sách dễ sửa ngay trong VS Code.
const appEntries = [
  {id:'youtube', title:'YouTube', note:'Xem video'},
  {id:'eshare', title:'EShare', note:'Chia sẻ màn hình'},
  {id:'playstore', title:'Google Play Store', note:'Tải thêm ứng dụng'},
];
const connections = [
  {id:'hdmi', title:'HDMI', note:'Chọn nguồn cáp tín hiệu'},
  {id:'miracast', title:'Miracast', note:'Truyền màn hình không dây'},
  {id:'cast', title:'Google Cast', note:'Nhận hình từ điện thoại / PC'},
  {id:'usb', title:'USB', note:'Mở nội dung trên USB'},
];
const partnerNames = ['fish','wana','solavie','mcoffee','wazzer','zizipop'];

function sizeStage(){
  const k = Math.min(innerWidth / STAGE_WIDTH, innerHeight / STAGE_HEIGHT);
  const x = (innerWidth - STAGE_WIDTH * k) / 2;
  const y = (innerHeight - STAGE_HEIGHT * k) / 2;
  stage.style.transform = `translate(${x}px,${y}px) scale(${k})`;
}
addEventListener('resize', sizeStage);
sizeStage();

function updateClock(){
  const d = new Date();
  const days = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  const hhmm = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const el = document.querySelector('#clock');
  el.textContent = hhmm;
  el.dateTime = d.toISOString();
  document.querySelector('#date').textContent = `${days[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth()+1}, ${d.getFullYear()}`;
}
updateClock(); setInterval(updateClock, 15000);

function buildFooter(){
  const groupHTML = `<div class="marquee-group">${[...partnerNames, ...partnerNames].map(n => `<span class="partner"><img alt="" src="assets/partners/${n}.png"></span>`).join('')}</div>`;
  document.querySelector('#marquee-track').innerHTML = groupHTML + groupHTML;
}
buildFooter();

function inform(text){
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.hidden = true, 3400);
}
function icon(id){return `assets/icons/${id}.png`;}
function appTile(entry){return `<button class="dialog-tile tv-focus" data-action="${entry.id}" aria-label="${entry.title}"><img src="${icon(entry.id)}" alt=""><strong>${entry.title}</strong></button>`;}
function connectionRow(entry){return `<button class="dialog-row tv-focus" data-action="${entry.id}"><img src="${icon(entry.id)}" alt=""><div><span>${entry.title}</span><small>${entry.note}</small></div></button>`;}

function libraryIcon(app){
  return app.iconUri && /^(data:image\/|https?:|assets\/)/.test(app.iconUri)
    ? `<img src="${escapeHTML(app.iconUri)}" alt="">`
    : `<span class="app-initials">${escapeHTML(app.label.slice(0,2))}</span>`;
}
function libraryTile(app){return `<button class="dialog-tile tv-focus" data-open-package="${escapeHTML(app.packageName)}">${libraryIcon(app)}<strong>${escapeHTML(app.label)}</strong></button>`;}
function renderLibrary(){
  const pinned = libraryApps.filter(app => libraryPins.includes(app.packageName));
  const all = libraryApps;
  dialogContent.innerHTML = `<p class="library-hint">Chọn ứng dụng để mở · Nhấn giữ OK để quản lý</p>
    <div class="library-section-heading"><h3>Ứng dụng ghim</h3><span>Đã ghim ${pinned.length}/8</span></div>
    <div class="pinned-apps">${pinned.map(libraryTile).join('')}<button class="dialog-tile tv-focus add-app" data-action="manage-apps"><span>⊕</span><strong>Thêm ứng dụng</strong></button></div>
    <div class="library-section-heading all-apps-heading"><h3>Tất cả ứng dụng</h3></div>
    <div class="installed-apps">${all.length ? all.map(libraryTile).join('') : '<p class="empty-apps">Chưa có danh sách ứng dụng từ TV. Mở bản Android trên TV để xem các ứng dụng đã cài.</p>'}</div>`;
}
function renderManagerList(){
  const query = document.querySelector('#app-search').value.trim().toLocaleLowerCase();
  const apps = libraryApps.filter(app => (managerFilter === 'all' || libraryPins.includes(app.packageName))
    && `${app.label} ${app.packageName}`.toLocaleLowerCase().includes(query));
  document.querySelector('#manager-list').innerHTML = apps.length ? apps.map(app => `<div class="managed-app">${libraryIcon(app)}<div class="managed-app-name"><strong>${escapeHTML(app.label)}</strong><small>${escapeHTML(app.packageName)}</small></div><button class="tv-focus pin-action ${libraryPins.includes(app.packageName) ? 'pinned' : ''}" data-pin-package="${escapeHTML(app.packageName)}">${libraryPins.includes(app.packageName) ? 'Bỏ ghim' : 'Ghim'}</button></div>`).join('') : '<p class="empty-apps">Chưa có ứng dụng phù hợp trong danh sách hệ thống.</p>';
}
function openManager(){
  renderManagerList(); appManager.hidden = false; dialog.inert = true;
  dialog.setAttribute('aria-modal','false'); appManager.querySelector('.manager-back').focus({preventScroll:true});
}
function closeManager(){
  appManager.hidden = true; dialog.inert = false; dialog.setAttribute('aria-modal','true');
  dialog.querySelector('.add-app')?.focus({preventScroll:true});
}
document.querySelector('#app-search').addEventListener('input',renderManagerList);
// Optional host integration; the browser never invents a TV's installed apps.
window.setAsiaTVInstalledApps = items => {
  libraryApps = items.filter(app => typeof app.label === 'string' && typeof app.packageName === 'string');
  libraryPins = libraryPins.filter(key => libraryApps.some(app => app.packageName === key));
  if(dialog.classList.contains('apps-dialog') && !dialog.hidden) renderLibrary();
  if(!appManager.hidden) renderManagerList();
};

function openPanel(id){
  appManager.hidden = true; dialog.inert = false;
  dialog.classList.toggle('apps-dialog', id === 'apps');
  if(id === 'apps'){
    dialogTitle.textContent = 'Ứng dụng'; renderLibrary(); dialog.hidden = false;
    dialog.querySelector('.close-button').focus({preventScroll:true}); return;
  }
  const contents = {
    apps: [ 'Ứng dụng', `<p>Chọn ứng dụng bằng chuột, cảm ứng hoặc phím trên remote. Bản web chỉ xem trước giao diện.</p><div class="dialog-grid">${appEntries.map(appTile).join('')}${appTile({id:'plus',title:'Xem thêm'})}</div>` ],
    connections: ['Công nghệ kết nối', `<p>HDMI · Miracast · Google Cast · USB — tính năng thực tế phụ thuộc TV và ứng dụng.</p><div class="dialog-list">${connections.map(connectionRow).join('')}</div>`],
    audio: ['Đầu ra âm thanh', `<p>Trên TV thật, mục này sẽ mở cài đặt âm thanh Android. Bản HTML chỉ mô phỏng.</p><div class="dialog-list"><button class="dialog-row tv-focus" data-action="sound-tv"><span>◉ &nbsp; Loa TV</span></button><button class="dialog-row tv-focus" data-action="sound-bt"><span>◉ &nbsp; Thiết bị Bluetooth / HDMI ARC</span></button></div>`],
    wifi: ['Wi-Fi', `<p>Trên APK: mở cài đặt Wi-Fi của Android TV.</p><div class="dialog-list"><button class="dialog-row tv-focus" data-action="settings"><span>Cài đặt mạng</span></button></div>`],
    settings: ['Cài đặt', `<p>Bản thiết kế HTML chỉ giới thiệu các tùy chọn. Trên APK sẽ gọi trang cài đặt được Android cho phép.</p><div class="dialog-list"><button class="dialog-row tv-focus" data-action="audio"><span>Âm thanh</span></button><button class="dialog-row tv-focus" data-action="wifi"><span>Mạng Wi-Fi</span></button></div>`],
  };
  if(!contents[id]) return;
  dialogTitle.textContent = contents[id][0];
  dialogContent.innerHTML = contents[id][1];
  dialog.hidden = false;
  const first = dialog.querySelector('.tv-focus');
  if(first) first.focus({preventScroll:true});
}
function closePanel(){
  if(!appManager.hidden){closeManager();return;}
  dialog.hidden = true;
  dialogContent.innerHTML = '';
  document.querySelector('.apps-card .card-title').focus({preventScroll:true});
}
function performAction(action){
  if(action === 'settings'){inform('Trên TV: mở trực tiếp cài đặt hệ thống.');return;}
  if(action === 'wifi'){inform('Trên TV: mở trực tiếp cài đặt Wi-Fi hệ thống.');return;}
  if(action === 'audio'){inform('Trên TV: mở trực tiếp cài đặt âm thanh hệ thống để chọn đầu ra.');return;}
  if(action === 'manage-apps'){openManager();return;}
  if(action === 'close-manager'){closeManager();return;}
  if(action.startsWith('manager-')){
    managerFilter = action.slice(8);
    appManager.querySelectorAll('.manager-tabs button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.action === action)));
    renderManagerList();return;
  }
  if(action === 'close'){closePanel();return;}
  if(action === 'mute'){
    muted = !muted;
    muteIcon.src = icon(muted ? 'mute' : 'speaker');
    inform(muted ? 'Đã tắt tiếng (mô phỏng).' : 'Đã bật tiếng (mô phỏng).');
    return;
  }
  if(['apps','connections','audio','wifi','settings'].includes(action)){openPanel(action);return;}
  if(action === 'plus'){inform('Trên TV: Xem danh sách ứng dụng đã cài / mở Google Play Store.');return;}
  const title = appEntries.find(x => x.id===action)?.title || connections.find(x=>x.id===action)?.title || action;
  inform(`${title}: Đây là bản HTML xem trước. APK React Native mới thao tác với TV thật.`);
}
stage.addEventListener('click', e => {
  const pin = e.target.closest('[data-pin-package]');
  if(pin){
    const key = pin.dataset.pinPackage;
    if(libraryPins.includes(key)) libraryPins = libraryPins.filter(item => item !== key);
    else if(libraryPins.length < 8) libraryPins.push(key);
    else {inform('Bạn có thể ghim tối đa 8 ứng dụng.');return;}
    renderLibrary(); renderManagerList();
    [...appManager.querySelectorAll('[data-pin-package]')].find(button => button.dataset.pinPackage === key)?.focus({preventScroll:true});return;
  }
  const app = e.target.closest('[data-open-package]');
  if(app){inform('Mở ứng dụng đã cài khi chạy trên Android TV.');return;}
  const button = e.target.closest('button[data-action]');
  if(button) performAction(button.dataset.action);
});
function updateVolume(){
  const v = Number(volume.value);
  volumeValue.textContent = muted ? 'Tắt' : `${v}%`;
  volume.style.setProperty('--pct', `${v}%`);
}
volume.addEventListener('input', () => {if(muted){muted=false;muteIcon.src=icon('speaker');} updateVolume();});
volume.addEventListener('change', () => inform(`Âm lượng mô phỏng: ${volume.value}%`));
updateVolume();

/* Phím giả lập remote khi xem bằng VS Code/Chrome. */
const directions = {ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
function focusables(){
  const parent = !appManager.hidden ? appManager : dialog.hidden ? stage : dialog;
  return [...parent.querySelectorAll('.tv-focus')].filter(el => !el.disabled && el.getClientRects().length && getComputedStyle(el).visibility!=='hidden');
}
function moveFocus(key){
  const [dx,dy] = directions[key];
  const available = focusables();
  if(!available.length) return;
  const current = document.activeElement;
  if(!available.includes(current)){available[0].focus();return;}
  if(dialog.hidden && current.id === 'mute-btn' && key === 'ArrowDown'){
    document.querySelector('.volume-panel [data-action="audio"]').focus({preventScroll:true});return;
  }
  if(dialog.hidden && current.matches('.volume-panel [data-action="audio"]') && key === 'ArrowUp'){
    document.querySelector('#mute-btn').focus({preventScroll:true});return;
  }
  if(dialog.hidden && key === 'ArrowDown' && current.matches('.card-title')){
    current.closest('.small-card').querySelector('.icon-tile')?.focus({preventScroll:true});
    return;
  }
  if(dialog.hidden && key === 'ArrowUp' && current.matches('.icon-tile')){
    const card = current.closest('.small-card');
    const tiles = [...card.querySelectorAll('.icon-tile')];
    if(tiles.indexOf(current) < 2){card.querySelector('.card-title').focus({preventScroll:true});return;}
  }
  const b=current.getBoundingClientRect(); const cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2;
  const candidates=available.filter(e=>e!==current).map(e=>{
    const r=e.getBoundingClientRect(),x=(r.left+r.right)/2-cx,y=(r.top+r.bottom)/2-cy;
    const forward=x*dx+y*dy;
    const across=Math.abs(x*dy-y*dx);
    return {e,forward,score:forward+across*2.6};
  }).filter(t=>t.forward>4).sort((a,b)=>a.score-b.score);
  if(candidates.length) candidates[0].e.focus({preventScroll:true});
}
document.addEventListener('keydown', e => {
  if(e.key === 'Enter' && e.repeat && document.activeElement?.matches('[data-open-package]')){e.preventDefault();openManager();return;}
  if(document.activeElement?.matches('#app-search') && !['Escape','Backspace'].includes(e.key)) return;
  if(document.activeElement?.matches('#app-search') && e.key === 'Backspace') return;
  if(e.key === 'Escape' || e.key === 'Backspace'){
    if(!dialog.hidden){e.preventDefault(); closePanel();}
    return;
  }
  if(e.key in directions){
    if(document.activeElement===volume){
      if(e.key==='ArrowUp' || e.key==='ArrowDown'){
        e.preventDefault();volume.value=String(Math.max(0,Math.min(100,Number(volume.value)+(e.key==='ArrowUp'?5:-5))));updateVolume();
      }else{e.preventDefault();moveFocus(e.key);}
      return;
    }
    e.preventDefault();moveFocus(e.key);return;
  }
  if(e.key==='Enter' && document.activeElement?.tagName==='BUTTON'){
    // Browser thường tự gọi click cho button khi nhấn Enter; không gọi lại tránh lặp.
  }
});
function focusHome(){
  appManager.hidden = true;
  dialog.inert = false;
  dialog.hidden = true;
  dialogContent.innerHTML = '';
  document.querySelector('.apps-card .card-title').focus({preventScroll:true});
}
addEventListener('pageshow', focusHome);
document.addEventListener('visibilitychange', () => {if(!document.hidden) focusHome();});
focusHome();
