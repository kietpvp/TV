// Compatibility fix for the Gradle plugin shipped with React Native TV 0.83.
// Native app sources in android/ are edited directly, never regenerated.
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '../node_modules/@react-native/gradle-plugin/settings.gradle.kts');
if (fs.existsSync(file)) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(
    'id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0")',
    'id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")',
  );
  if (updated !== original) fs.writeFileSync(file, updated);
}
