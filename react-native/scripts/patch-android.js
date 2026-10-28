/**
 * Applies an opt-in native Android bridge to the official react-native-tvos
 * Community CLI template. No modifications to Android system packages.
 * Run: node scripts/patch-android.js <absolute path to generated RN project>
 */
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
if (!root || !fs.existsSync(path.join(root, 'android', 'app', 'src', 'main'))) throw Error('Không tìm thấy dự án React Native TV hợp lệ.');
const sourceRoot = path.resolve(__dirname, '..');
// React Native 0.83 ships an older resolver that references IBM_SEMERU,
// which Gradle 9 removed. Version 1.0.0 supports Gradle 9.
const resolverSettings = path.join(root, 'node_modules', '@react-native', 'gradle-plugin', 'settings.gradle.kts');
if (fs.existsSync(resolverSettings)) {
  const original = fs.readFileSync(resolverSettings, 'utf8');
  const updated = original.replace(/(id\("org\.gradle\.toolchains\.foojay-resolver-convention"\)\.version\(")0\.5\.0("\))/, '$11.0.0$2');
  if (updated !== original) fs.writeFileSync(resolverSettings, updated);
}
const android = path.join(root, 'android', 'app', 'src', 'main');
const javaDir = path.join(android, 'java');
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const mainApp = walk(javaDir).find(p => /[\\/]MainApplication\.kt$/.test(p));
if (!mainApp) throw Error('Template React Native đã thay đổi: MainApplication.kt không tồn tại.');
const kt = fs.readFileSync(mainApp, 'utf8');
const pkg = (kt.match(/^package\s+([A-Za-z0-9_.]+)/m) || [])[1];
if (!pkg) throw Error('Không xác định được package name của Android template.');
let amended = kt;
if (!amended.includes('add(AsiaTVPackage())')) {
  if (amended.includes('PackageList(this).packages.apply {')) {
    amended = amended.replace('PackageList(this).packages.apply {', 'PackageList(this).packages.apply {\n          add(AsiaTVPackage())');
  } else throw Error('Template đã thay đổi cách đăng ký ReactPackage; cần kiểm tra MainApplication.kt.');
  fs.writeFileSync(mainApp, amended);
}
for (const file of ['AsiaTVModule.java', 'AsiaTVPackage.java']) {
  const src = fs.readFileSync(path.join(sourceRoot, 'native', file), 'utf8');
  fs.writeFileSync(path.join(path.dirname(mainApp), file), src.replace('__ASIA_PACKAGE__', pkg));
}
const manifestFile = path.join(android, 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestFile, 'utf8');
if (!manifest.includes('android.permission.MODIFY_AUDIO_SETTINGS')) {
  const insert = `\n  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  <uses-feature android:name="android.software.leanback" android:required="true" />
  <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
  <queries>
    <intent><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LEANBACK_LAUNCHER" /></intent>
    <intent><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent>
    <package android:name="com.google.android.youtube.tv" />
    <package android:name="com.android.vending" />
  </queries>\n`;
  manifest = manifest.replace(/(<manifest[^>]+>)/, '$1' + insert);
}
manifest = manifest.replace(/<intent-filter>[\s\S]*?<\/intent-filter>/g, block => {
  if (!block.includes('android.intent.category.LAUNCHER') || block.includes('android.intent.category.LEANBACK_LAUNCHER')) return block;
  return block.replace(/(<category android:name="android\.intent\.category\.LAUNCHER"\s*\/>)/,
      '$1\n            <category android:name="android.intent.category.LEANBACK_LAUNCHER" />');
});
if (!manifest.includes('android:screenOrientation="landscape"')) {
  manifest = manifest.replace(/(<activity\b[^>]*)(>)/, '$1 android:screenOrientation="landscape"$2');
}
if (!manifest.includes('android:banner="@drawable/tv_banner"')) {
  manifest = manifest.replace(/(<application\b)/, '$1 android:banner="@drawable/tv_banner"');
}
manifest = manifest.replace(/android:icon="@mipmap\/ic_launcher"/, 'android:icon="@drawable/asiafb_icon"');
manifest = manifest.replace(/android:roundIcon="@mipmap\/ic_launcher_round"/, 'android:roundIcon="@drawable/asiafb_icon"');
// The TV template may already declare these features.
const seenFeatures = new Set();
manifest = manifest.replace(/<uses-feature\b[^>]*\/>/g, element => {
  const name = element.match(/android:name="([^"]+)"/)?.[1];
  if (!name) return element;
  if (seenFeatures.has(name)) return '';
  seenFeatures.add(name);
  return element;
});
fs.writeFileSync(manifestFile, manifest);
const bannerPath = path.join(android, 'res', 'drawable-nodpi');
fs.mkdirSync(bannerPath, {recursive: true});
fs.copyFileSync(path.join(sourceRoot, 'assets', 'tv_banner.png'), path.join(bannerPath, 'tv_banner.png'));
fs.copyFileSync(path.join(sourceRoot, 'assets', 'asiafb_icon.png'), path.join(bannerPath, 'asiafb_icon.png'));
const nameFile = path.join(android, 'res', 'values', 'strings.xml');
if (fs.existsSync(nameFile)) {
  let strings = fs.readFileSync(nameFile, 'utf8');
  strings = strings.replace(/(<string name="app_name">)([^<]*)(<\/string>)/, '$1ASIA F&amp;B TV$3');
  fs.writeFileSync(nameFile, strings);
}
// The generated RN app's Kotlin package / applicationId is the single source of truth.
// For predictable ADB commands, save the detected namespace to text.
const gradleFile = path.join(root, 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(gradleFile, 'utf8');
gradle = gradle.replace('-DCMAKE_OBJECT_PATH_MAX=128', '-DCMAKE_OBJECT_PATH_MAX=240');
if (!gradle.includes('-DCMAKE_OBJECT_PATH_MAX=240')) {
  gradle = gradle.replace(/defaultConfig\s*\{/, 'defaultConfig {\n        externalNativeBuild {\n            cmake { arguments "-DCMAKE_OBJECT_PATH_MAX=240" }\n        }');
}
if (!gradle.includes('buildStagingDirectory file("../../cxx")')) {
  gradle = gradle.replace(/android\s*\{/, 'android {\n    externalNativeBuild { cmake { buildStagingDirectory file("../../cxx") } }');
}
  fs.writeFileSync(gradleFile, gradle);
const appId = (gradle.match(/applicationId\s+["']([^"']+)["']/) || [])[1] || pkg;
fs.writeFileSync(path.join(root, 'asiafb-application-id.txt'), appId + '\n');
fs.writeFileSync(path.join(sourceRoot, 'ASIAFB_APP_ID.txt'), appId + '\n');
console.log('OK: registered AsiaTVPackage, TV intent filters, leanback, audio permission, banner.');
console.log('Android package:', pkg, '; application ID:', appId);
