package __ASIA_PACKAGE__;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.media.AudioManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import android.os.Build;
import android.provider.Settings;
import android.view.View;
import android.view.KeyEvent;
import android.view.Window;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.uimanager.UIManagerHelper;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Device-side commands that a normal, non-privileged Google TV app may call. */
public final class AsiaTVModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext context;
    AsiaTVModule(ReactApplicationContext ctx) { super(ctx); context = ctx; }
    @NonNull @Override public String getName() { return "AsiaTV"; }

    private AudioManager audio() { return (AudioManager) context.getSystemService(Context.AUDIO_SERVICE); }

    @ReactMethod public void linkFocusDown(int headerTag, int firstTileTag, Promise p) {
        context.runOnUiQueueThread(() -> {
            try {
                View header = UIManagerHelper.getUIManagerForReactTag(context, headerTag).resolveView(headerTag);
                View tile = UIManagerHelper.getUIManagerForReactTag(context, firstTileTag).resolveView(firstTileTag);
                if (header == null || tile == null) {p.resolve(false); return;}
                android.util.Log.i("AsiaFocus", "DOWN link: " + header.getContentDescription() + " -> " + tile.getContentDescription());
                header.setNextFocusDownId(tile.getId());
                // Consume DOWN before Android's spatial search, which can choose a
                // different card while the parent is scaling during TV focus.
                header.setOnKeyListener((view, keyCode, event) -> {
                    if (keyCode != KeyEvent.KEYCODE_DPAD_DOWN) return false;
                    if (event.getAction() == KeyEvent.ACTION_DOWN && tile.isShown()) {
                        android.util.Log.i("AsiaFocus", "DOWN request: " + tile.getContentDescription());
                        return tile.requestFocus();
                    }
                    return false;
                });
                p.resolve(true);
            } catch (Exception e) {p.reject("FOCUS_LINK", e);}
        });
    }

    @ReactMethod public void getVolume(Promise p) {
        try {
            AudioManager a = audio();
            int max = a.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int value = a.getStreamVolume(AudioManager.STREAM_MUSIC);
            WritableMap m = Arguments.createMap();
            m.putInt("percent", max == 0 ? 0 : (int)Math.round(value * 100.0 / max));
            m.putBoolean("muted", a.isStreamMute(AudioManager.STREAM_MUSIC));
            p.resolve(m);
        } catch (Exception e) { p.reject("AUDIO_READ", e); }
    }
    @ReactMethod public void setVolume(int percent, Promise p) {
        try {
            AudioManager a = audio();
            int max = a.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int v = Math.max(0, Math.min(100, percent));
            a.setStreamVolume(AudioManager.STREAM_MUSIC, (int)Math.round(v * max / 100.0), 0);
            p.resolve(true);
        } catch (Exception e) { p.reject("AUDIO_WRITE", e); }
    }
    @ReactMethod public void toggleMute(Promise p) {
        try {
            AudioManager a = audio();
            a.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_TOGGLE_MUTE, 0);
            WritableMap m = Arguments.createMap();
            m.putBoolean("muted", a.isStreamMute(AudioManager.STREAM_MUSIC));
            p.resolve(m);
        } catch (Exception e) { p.reject("AUDIO_MUTE", e); }
    }

    private void start(Intent i) {
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(i);
    }
    private Intent launcherFor(String packageName) {
        PackageManager pm = context.getPackageManager();
        Intent i = pm.getLeanbackLaunchIntentForPackage(packageName);
        if (i == null) i = pm.getLaunchIntentForPackage(packageName);
        return i;
    }
    private boolean tryPackage(String packageName) {
        try { Intent i = launcherFor(packageName); if (i == null) return false; start(i); return true; }
        catch (Exception ignored) { return false; }
    }
    private Intent findByName(String name) {
        PackageManager pm = context.getPackageManager();
        for (String cat : new String[]{Intent.CATEGORY_LEANBACK_LAUNCHER, Intent.CATEGORY_LAUNCHER}) {
            Intent q = new Intent(Intent.ACTION_MAIN).addCategory(cat);
            List<ResolveInfo> results = pm.queryIntentActivities(q, 0);
            for (ResolveInfo r : results) {
                String label = r.loadLabel(pm).toString().toLowerCase(Locale.ROOT);
                String pkg = r.activityInfo.packageName.toLowerCase(Locale.ROOT);
                if (label.contains(name) || pkg.contains(name)) {
                    Intent i = new Intent(Intent.ACTION_MAIN).addCategory(cat);
                    i.setClassName(r.activityInfo.packageName, r.activityInfo.name);
                    return i;
                }
            }
        }
        return null;
    }

    @ReactMethod public void openApp(String id, Promise p) {
        try {
            String key = id.toLowerCase(Locale.ROOT).trim();
            boolean ok = false;
            if (key.equals("youtube")) {
                ok = tryPackage("com.google.android.youtube.tv") || tryPackage("com.google.android.youtube");
            } else if (key.equals("playstore")) {
                ok = tryPackage("com.android.vending");
            } else if (key.equals("eshare")) {
                // EShare's Android package varies across OEM firmware versions.
                Intent app = findByName("eshare");
                if (app != null) {start(app); ok = true;}
            } else {ok = tryPackage(id);}
            if (!ok) {p.reject("APP_NOT_FOUND", "Không tìm thấy ứng dụng: " + id + ". Cài ứng dụng hoặc kiểm tra tên gói."); return;}
            p.resolve("Đã yêu cầu mở ứng dụng.");
        } catch (Exception e) {p.reject("APP_LAUNCH", e);}
    }

    @ReactMethod public void getInstalledApps(Promise p) {
        try {
            PackageManager pm = context.getPackageManager();
            List<ResolveInfo> found = new ArrayList<>();
            found.addAll(pm.queryIntentActivities(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER), 0));
            found.addAll(pm.queryIntentActivities(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER), 0));
            WritableArray array = Arguments.createArray();
            Set<String> packages = new HashSet<>();
            Collections.sort(found, (a, b) -> a.loadLabel(pm).toString().compareToIgnoreCase(b.loadLabel(pm).toString()));
            for (ResolveInfo r : found) {
                if (r.activityInfo == null || !packages.add(r.activityInfo.packageName)) continue;
                if (context.getPackageName().equals(r.activityInfo.packageName)) continue;
                WritableMap item = Arguments.createMap();
                item.putString("label", r.loadLabel(pm).toString());
                item.putString("packageName", r.activityInfo.packageName);
                try {
                    Drawable icon = r.loadIcon(pm);
                    Bitmap bitmap = Bitmap.createBitmap(192, 192, Bitmap.Config.ARGB_8888);
                    Canvas canvas = new Canvas(bitmap);
                    icon.setBounds(0, 0, 192, 192);
                    icon.draw(canvas);
                    ByteArrayOutputStream output = new ByteArrayOutputStream();
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, output);
                    item.putString("iconUri", "data:image/png;base64," + Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP));
                    bitmap.recycle();
                } catch (Exception ignored) { /* A label remains available if an icon cannot be decoded. */ }
                array.pushMap(item);
            }
            p.resolve(array);
        } catch (Exception e) {p.reject("APP_LIST", e);}
    }

    @ReactMethod public void openSettings(String type, Promise p) {
        String action = Settings.ACTION_SETTINGS;
        if ("wifi".equals(type)) action = Settings.ACTION_WIFI_SETTINGS;
        if ("sound".equals(type)) action = Settings.ACTION_SOUND_SETTINGS;
        try { start(new Intent(action).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)); p.resolve("Đã mở cài đặt hệ thống."); }
        catch (Exception ignored) {
            try {start(new Intent(Settings.ACTION_SETTINGS)); p.resolve("Đã mở cài đặt chung. Hãy chọn mục tương ứng.");}
            catch (Exception e) {p.reject("SETTINGS_NOT_AVAILABLE", e);}
        }
    }

    @ReactMethod public void openConnection(String type, Promise p) {
        try {
            if ("hdmi".equals(type)) {
                // OEM-specific TV input selection has no universally reliable public Intent.
                // Never claim HDMI was switched if the firmware did not do it.
                p.resolve("HDMI: bấm nút Input/Source trên remote để chọn HDMI 1, 2 hoặc 3."); return;
            }
            if ("miracast".equals(type)) {
                Intent app = findByName("miracast");
                if (app == null) app = findByName("wireless display");
                if (app == null) app = findByName("screen share");
                if (app != null) {start(app); p.resolve("Đã mở ứng dụng nhận Miracast."); return;}
                p.resolve("Miracast: tìm chức năng Wireless display / Screen share trong cài đặt Xiaomi TV."); return;
            }
            if ("usb".equals(type)) {
                Intent app = findByName("file manager");
                if (app == null) app = findByName("files");
                if (app == null) app = findByName("media player");
                if (app != null) {start(app); p.resolve("Đã mở trình duyệt tập tin."); return;}
                p.resolve("USB: cắm ổ lưu trữ, mở ứng dụng quản lý tệp trên TV."); return;
            }
            if ("cast".equals(type)) {
                p.resolve("Google Cast: từ điện thoại hoặc máy tính hãy chọn Cast tới Xiaomi TV."); return;
            }
            p.reject("UNSUPPORTED", "Kết nối không được hỗ trợ: " + type);
        } catch (Exception e) {p.reject("CONNECTION", e);}
    }
    @ReactMethod public void getPinnedApps(Promise p) {
        try {p.resolve(context.getSharedPreferences("asiafb-tv", Context.MODE_PRIVATE).getString("pinned", "[\"youtube\",\"eshare\",\"playstore\"]"));}
        catch (Exception e) {p.reject("PREFS", e);}
    }
    @ReactMethod public void savePinnedApps(String json, Promise p) {
        try {context.getSharedPreferences("asiafb-tv", Context.MODE_PRIVATE).edit().putString("pinned", json).apply(); p.resolve(true);}
        catch (Exception e) {p.reject("PREFS_WRITE", e);}
    }
    @ReactMethod public void setImmersive(Promise p) {
        Activity a = getCurrentActivity();
        if (a == null) {p.resolve(false); return;}
        a.runOnUiThread(() -> {
            try {
                a.setVolumeControlStream(AudioManager.STREAM_MUSIC);
                Window w = a.getWindow();
                w.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
                p.resolve(true);
            } catch (Exception e) {p.reject("IMMERSIVE", e);}
        });
    }
}
