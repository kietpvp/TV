const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const r=path.resolve(__dirname,'..');
const check=p=>assert.ok(fs.existsSync(path.join(r,p)),`Missing: ${p}`);
[
  'web/index.html','web/style.css','web/app.js','web/assets/background.jpg',
  'react-native/App.tsx','react-native/build-windows.ps1','react-native/native/AsiaTVModule.java',
  'react-native/scripts/patch-android.js','reference/Giao_dien_HTML_ban_dau.html'
].forEach(check);
const ico=['youtube','eshare','playstore','plus','hdmi','miracast','cast','usb','speaker','mute','wifi','settings'];
for (const name of ico){check(`web/assets/icons/${name}.png`);check(`react-native/assets/icons/${name}.png`);}
for (const name of ['fish','wana','solavie','mcoffee','wazzer','zizipop']){
  check(`web/assets/partners/${name}.png`);check(`react-native/assets/partners/${name}.png`);
}
const html=fs.readFileSync(path.join(r,'web/index.html'),'utf8');
assert.ok(!html.includes('data:image/png;base64'),'HTML still has embedded heavy image');
assert.ok(html.includes('app.js') && html.includes('style.css'));
assert.ok(fs.readFileSync(path.join(r,'web/style.css'),'utf8').includes('background.jpg'));
console.log('PASS: all editable files, original assets, and Android TV sources are present.');
