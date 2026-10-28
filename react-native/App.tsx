/**
 * Asia F&B TV — React Native for TV (react-native-tvos)
 * Screens are real native React Native views. The background is the user's
 * approved branded photo: it already includes logo + slogans, so the logo
 * must NOT be rendered a second time.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated, AppState, BackHandler, Easing, Image, ImageBackground, NativeModules,
  Pressable, ScrollView, StatusBar, StyleSheet, Text, View,
  useWindowDimensions, findNodeHandle,
} from 'react-native';

import AppLibrary, {CloseIcon, InstalledApp} from './AppLibrary';

const {AsiaTV} = NativeModules;
const GOLD = '#f5d36d';
const WHITE = '#f4faf6';
const CARD = 'rgba(1, 38, 28, 0.86)';
const DEFAULT_PINNED = ['youtube', 'eshare', 'playstore'];

type AppItem = InstalledApp;
type Panel = null | 'apps' | 'connections' | 'audio' | 'help';

const ICONS: {[key: string]: any} = {
  youtube: require('./assets/icons/youtube.png'),
  eshare: require('./assets/icons/eshare.png'),
  playstore: require('./assets/icons/playstore.png'),
  plus: require('./assets/icons/plus.png'),
  hdmi: require('./assets/icons/hdmi.png'),
  miracast: require('./assets/icons/miracast.png'),
  cast: require('./assets/icons/cast.png'),
  usb: require('./assets/icons/usb.png'),
  speaker: require('./assets/icons/speaker.png'),
  mute: require('./assets/icons/mute.png'),
  wifi: require('./assets/icons/wifi.png'),
  settings: require('./assets/icons/settings.png'),
};
const PARTNERS = [
  require('./assets/partners/fish.png'),
  require('./assets/partners/wana.png'),
  require('./assets/partners/solavie.png'),
  require('./assets/partners/mcoffee.png'),
  require('./assets/partners/wazzer.png'),
  require('./assets/partners/zizipop.png'),
];
const CONNECT = [
  {key: 'hdmi', title: 'HDMI', caption: 'Chọn nguồn tín hiệu'},
  {key: 'miracast', title: 'Miracast', caption: 'Chia sẻ màn hình không dây'},
  {key: 'cast', title: 'Google Cast', caption: 'Nhận phát từ điện thoại / PC'},
  {key: 'usb', title: 'USB', caption: 'Mở tập tin USB'},
];

function dateLabel(d: Date): string {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return `${days[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}
function timeLabel(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function clamp(v: number) {return Math.max(0, Math.min(100, Math.round(v)));}

function useCardZoom(selected: boolean) {
  const zoom = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.spring(zoom, {toValue: selected ? 1.05 : 1,
      speed: 20, bounciness: 3, useNativeDriver: true});
    animation.start();
    return () => animation.stop();
  }, [selected, zoom]);
  return zoom;
}

/** TV-focus outline is handled by native Pressables (not browser focus). */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
function FocusButton(props: {
  label: string; onPress: () => void; onLongPress?: () => void;
  image?: any; s: number; style?: any; iconSize?: number; subtitle?: string;
  preferred?: boolean; focusKey?: string; onFocus?: (key: string) => void;
  children?: React.ReactNode | ((focused: boolean) => React.ReactNode);
  buttonRef?: React.Ref<any>; nextFocusDown?: number; nextFocusUp?: number; quietFocus?: boolean;
  iconOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const highlighted = focused && !props.quietFocus;
  const focusScale = props.iconOnly ? 1.22 : 1.08;
  const zoom = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.spring(zoom, {toValue: highlighted ? focusScale : 1,
      speed: 24, bounciness: 3, useNativeDriver: true});
    animation.start();
    return () => animation.stop();
  }, [highlighted, focusScale, zoom]);
  const {
    label, onPress, onLongPress, image, s, style, iconSize = 45, subtitle,
    preferred = false, focusKey, onFocus, children,
  } = props;
  return (
    <AnimatedPressable
      ref={props.buttonRef} nextFocusDown={props.nextFocusDown} nextFocusUp={props.nextFocusUp}
      accessibilityRole="button" accessibilityLabel={label}
      focusable hasTVPreferredFocus={preferred}
      onFocus={() => {setFocused(true); if (focusKey) onFocus?.(focusKey);}}
      onBlur={() => setFocused(false)}
      onPress={onPress} onLongPress={onLongPress}
      style={[{
        borderWidth: props.iconOnly ? 0 : highlighted ? 2.5 * s : 1.3 * s,
        borderColor: props.iconOnly ? 'transparent' : highlighted ? GOLD : 'rgba(230,236,223,0.18)',
        borderRadius: 17 * s,
        backgroundColor: props.iconOnly ? 'transparent' : highlighted ? 'rgba(54, 106, 70, 0.90)' : 'rgba(0, 24, 20, 0.68)',
        alignItems: 'center', justifyContent: 'center',
        transform: [{scale: zoom}],
        zIndex: 0,
        elevation: !props.iconOnly && highlighted ? 9 : 0,
      }, style]}
    >
      {image && <Image source={image} resizeMode="contain" style={{width: iconSize * s, height: iconSize * s,
        tintColor: props.iconOnly && focused ? GOLD : undefined}} />}
      {typeof children === 'function' ? children(focused) : children}
      {subtitle && <Text numberOfLines={1} style={{fontSize: 15 * s, color: WHITE, marginTop: 7 * s, fontWeight: '600'}}>{subtitle}</Text>}

    </AnimatedPressable>
  );
}

function Footer({s, w}: {s: number; w: number}) {
  const slide = useRef(new Animated.Value(0)).current;
  const slot = 142 * s;
  const groupW = slot * PARTNERS.length;
  useEffect(() => {
    slide.setValue(0);
    const anim = Animated.loop(
      Animated.timing(slide, {toValue: -groupW, duration: 27000, easing: Easing.linear, useNativeDriver: true, isInteraction: false}),
      {resetBeforeIteration: true},
    );
    anim.start();
    return () => anim.stop();
  }, [groupW, slide]);
  return (
    <View pointerEvents="none" style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 * s,
      flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 20, 15, 0.56)',
      borderTopWidth: 1 * s, borderTopColor: 'rgba(247, 203, 104, 0.40)'}}>
      <View style={{flex: 1, overflow: 'hidden', justifyContent: 'center', height: '100%'}}>
        <Animated.View style={{flexDirection: 'row', width: groupW * (Math.ceil(w / groupW) + 1), transform: [{translateX: slide}]}}>
          {Array.from({length: Math.ceil(w / groupW) + 1}, (_, i) => i).flatMap((repeat) => PARTNERS.map((logo, idx) => (
            <View key={`p-${repeat}-${idx}`} style={{width: slot, justifyContent: 'center', alignItems: 'center'}}>
              <Image source={logo} resizeMode="contain" style={{width: 104 * s, height: 48 * s}} />
            </View>
          )))}
        </Animated.View>
      </View>
    </View>
  );
}

export default function App() {
  const {width: w, height: h} = useWindowDimensions();
  const s = Math.min(w / 1672, h / 940.5);
  const [now, setNow] = useState(new Date());
  const [panel, setPanel] = useState<Panel>(null);
  const [managingApps, setManagingApps] = useState(false);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState('');
  const [volume, setVolume] = useState(68);
  const [isMuted, setIsMuted] = useState(false);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [focusedKey, setFocusedKey] = useState('apps-header');
  const appsHeaderRef = useRef<any>(null);
  const connectionsHeaderRef = useRef<any>(null);
  const homeFocusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusHome = useCallback(() => {
    if (homeFocusTimer.current) clearTimeout(homeFocusTimer.current);
    // Wait for the home view to be committed before restoring native TV focus.
    homeFocusTimer.current = setTimeout(() => {
      appsHeaderRef.current?.requestTVFocus();
      homeFocusTimer.current = null;
    }, 80);
  }, []);
  const appsZoom = useCardZoom(!panel && focusedKey === 'apps-header');
  const connectionsZoom = useCardZoom(!panel && focusedKey === 'connections-header');
  const [firstAppNode, setFirstAppNode] = useState<number>();
  const [firstConnectionNode, setFirstConnectionNode] = useState<number>();
  const firstAppRef = useCallback((node: any) => setFirstAppNode(node ? findNodeHandle(node) ?? undefined : undefined), []);
  const firstConnectionRef = useCallback((node: any) => setFirstConnectionNode(node ? findNodeHandle(node) ?? undefined : undefined), []);
  const [toast, setToast] = useState('');
  const [muteNode, setMuteNode] = useState<number>();
  const [outputNode, setOutputNode] = useState<number>();
  const muteRef = useCallback((node: any) => setMuteNode(node ? findNodeHandle(node) ?? undefined : undefined), []);
  const outputRef = useCallback((node: any) => setOutputNode(node ? findNodeHandle(node) ?? undefined : undefined), []);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVolumeSet = useRef(0);

  useEffect(() => {
    if (!AsiaTV?.linkFocusDown) return;
    const timer = setTimeout(() => {
      const appsHeader = findNodeHandle(appsHeaderRef.current);
      const connectionsHeader = findNodeHandle(connectionsHeaderRef.current);
      if (appsHeader && firstAppNode) AsiaTV.linkFocusDown(appsHeader, firstAppNode).catch((error: any) => console.warn('Apps focus link:', error));
      if (connectionsHeader && firstConnectionNode) AsiaTV.linkFocusDown(connectionsHeader, firstConnectionNode).catch((error: any) => console.warn('Connections focus link:', error));
    }, 80);
    return () => clearTimeout(timer);
  }, [firstAppNode, firstConnectionNode]);

  useEffect(() => {
    if (panel === null) focusHome();
  }, [panel, focusHome]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {setManagingApps(false); setPanel(null); focusHome();}
    });
    return () => {
      subscription.remove();
      if (homeFocusTimer.current) clearTimeout(homeFocusTimer.current);
    };
  }, [focusHome]);

  const notify = useCallback((m: string) => {
    setToast(m);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setToast(''), 3800);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    if (!AsiaTV) {setAppsLoading(false); notify('Thiếu mô-đun Android; cần build bằng dự án TV đi kèm.');}
    else {
      AsiaTV.setImmersive().catch(() => {});
      Promise.all([AsiaTV.getInstalledApps(), AsiaTV.getPinnedApps().catch(() => JSON.stringify(DEFAULT_PINNED))])
        .then(([items, saved]: [AppItem[], string]) => {
          setApps(items);
          let stored: string[] = DEFAULT_PINNED;
          try {const parsed = JSON.parse(saved); if (Array.isArray(parsed)) stored = parsed.filter(key => typeof key === 'string');} catch (_) {}
          const normalized = stored.map(key => {
            if (items.some(app => app.packageName === key)) return key;
            if (key === 'playstore') return items.find(app => app.packageName === 'com.android.vending')?.packageName;
            if (key === 'youtube') return items.find(app => app.packageName.startsWith('com.google.android.youtube'))?.packageName;
            if (key === 'eshare') return items.find(app => `${app.label} ${app.packageName}`.toLowerCase().includes('eshare'))?.packageName;
            return undefined;
          }).filter((key): key is string => !!key);
          setPinned([...new Set(normalized)].slice(0, 8));
          setAppsError('');
        }).catch(() => setAppsError('Không đọc được ứng dụng trên TV. Hãy mở lại ứng dụng để thử lại.'))
        .finally(() => setAppsLoading(false));
    }
    return () => {clearInterval(t); if (messageTimer.current) clearTimeout(messageTimer.current);};
  }, [notify]);

  useEffect(() => {
    if (!AsiaTV) return;
    let mounted = true;
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      AsiaTV.getInstalledApps().then((items: AppItem[]) => {
        if (!mounted) return;
        setApps(items);
        setPinned(current => current.filter(key => items.some(app => app.packageName === key)));
        setAppsError('');
      }).catch(() => {if (mounted) setAppsError('Không đọc được danh sách ứng dụng trên TV.');});
    });
    return () => {mounted = false; subscription.remove();};
  }, []);

  useEffect(() => {
    if (!AsiaTV) return;
    let mounted = true;
    let reading = false;
    let active = AppState.currentState === 'active';
    const syncVolume = async () => {
      if (!mounted || !active || reading) return;
      reading = true;
      try {
        const state = await AsiaTV.getVolume();
        if (mounted) {setVolume(clamp(state.percent)); setIsMuted(!!state.muted);}
      } catch (_) { /* Try again on the next tick or foreground change. */ }
      finally {reading = false;}
    };
    void syncVolume();
    const timer = setInterval(syncVolume, 300);
    const subscription = AppState.addEventListener('change', state => {
      active = state === 'active';
      if (active) void syncVolume();
    });
    return () => {mounted = false; clearInterval(timer); subscription.remove();};
  }, []);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (managingApps) {setManagingApps(false); return true;}
      if (panel) {setPanel(null); return true;}
      return false;
    });
    return () => listener.remove();
  }, [panel, managingApps]);

  const changeVolume = useCallback((next: number, commit = false) => {
    const value = clamp(next);
    setVolume(value); if (isMuted && value > 0) setIsMuted(false);
    if (!AsiaTV) return;
    if (commit || Date.now() - lastVolumeSet.current > 65) {
      lastVolumeSet.current = Date.now();
      AsiaTV.setVolume(value).catch(() => notify('Không điều chỉnh được âm lượng bằng API hiện tại.'));
    }
  }, [isMuted, notify]);

  const callNative = useCallback(async (fn: string, param?: string) => {
    if (!AsiaTV || typeof AsiaTV[fn] !== 'function') {notify('Tính năng chưa sẵn sàng trong bản thử này.'); return;}
    try {
      const result = param === undefined ? await AsiaTV[fn]() : await AsiaTV[fn](param);
      if (result && typeof result === 'string') notify(result);
    } catch (err: any) {notify(`Không thể thực hiện: ${err?.message || 'chưa hỗ trợ trên firmware'}`);}
  }, [notify]);

  const onOpenApp = useCallback((key: string) => {
    callNative('openApp', key);
  }, [callNative]);

  const onConnection = useCallback((key: string) => {
    if (key === 'cast') {notify('Google Cast: chọn TV từ nút Cast trên laptop / điện thoại.'); return;}
    callNative('openConnection', key);
  }, [notify, callNative]);

  const togglePin = useCallback((packageName: string) => {
    if (!pinned.includes(packageName) && pinned.length >= 8) {notify('Bạn có thể ghim tối đa 8 ứng dụng.'); return;}
    const next = pinned.includes(packageName) ? pinned.filter(v => v !== packageName) : [...pinned, packageName];
    setPinned(next);
    if (AsiaTV) AsiaTV.savePinnedApps(JSON.stringify(next)).catch(() => {});
    notify(pinned.includes(packageName) ? 'Đã bỏ ghim ứng dụng.' : 'Đã ghim ứng dụng vào màn hình chính.');
  }, [pinned, notify]);

  const compactApps = useMemo(() => pinned.slice(0, 3), [pinned]);
  const cardS = s * 1.1;
  const railH = 180 * s;
  const setFromTouch = (e: any, finished: boolean) => {
    const y = Math.max(0, Math.min(railH, e.nativeEvent.locationY));
    changeVolume(100 * (1 - y / railH), finished);
  };
  const menuButton = (key: string, image: any, fn: () => void, pos: number) => (
    <FocusButton key={key} label={key} image={image} s={cardS} onPress={fn}
      buttonRef={pos === 0 ? (key === CONNECT[0].title ? firstConnectionRef : firstAppRef) : undefined}
      style={{width: 88 * cardS, height: 78 * cardS, marginRight: (pos % 2 === 0 ? 10 : 0) * cardS, marginBottom: (pos < 2 ? 10 : 0) * cardS}}
      iconSize={56} focusKey={key} onFocus={setFocusedKey} />
  );

  return (
    <ImageBackground source={require('./assets/background.jpg')} resizeMode="cover" style={styles.root}>
      <StatusBar hidden />
      <View style={{position: 'absolute', width: 1672 * s, height: 940.5 * s,
        left: (w - 1672 * s) / 2, top: (h - 940.5 * s) / 2}}>
      {/* Only native UI overlays the approved original photo. Do not add a second logo here. */}
      <View style={{position: 'absolute', top: 70 * s, right: 96 * s, flexDirection: 'row', alignItems: 'center'}}>
        <View style={{alignItems: 'flex-end', paddingRight: 24 * s}}>
          <Text style={{color: WHITE, fontSize: 60 * s, fontWeight: '400', textShadowColor: '#0A2519', textShadowRadius: 5}}>{timeLabel(now)}</Text>
          <Text style={{color: WHITE, fontSize: 21 * s, marginTop: -3 * s}}>{dateLabel(now)}</Text>
        </View>
        <View style={{height: 71 * s, borderLeftWidth: 1, borderLeftColor: 'rgba(244,203,90,.6)', marginRight: 18 * s}} />
        <FocusButton label="Cài đặt Wi-Fi" image={ICONS.wifi} s={s} iconSize={39}
          onPress={() => callNative('openSettings', 'wifi')}
          style={{width: 65 * s, height: 65 * s, marginRight: 14 * s}}
          focusKey="wifi" onFocus={setFocusedKey} />
        <FocusButton label="Cài đặt TV" image={ICONS.settings} s={s} iconSize={35}
          onPress={() => callNative('openSettings', 'general')}
          style={{width: 65 * s, height: 65 * s}}
          focusKey="settings" onFocus={setFocusedKey} />
      </View>

      {/* Compact app card, 4 native buttons; header opens native expanded panel */}
      <Animated.View style={{position: 'absolute', left: 96 * s, top: 526.6 * s, width: 227 * cardS, height: 254 * cardS, borderRadius: 27 * cardS,
        borderWidth: 1.5 * cardS, borderColor: !panel && focusedKey === 'apps-header' ? GOLD : 'rgba(244,203,90,0.75)',
        backgroundColor: !panel && focusedKey === 'apps-header' ? 'rgba(22, 77, 49, 0.95)' : CARD,
        elevation: !panel && focusedKey === 'apps-header' ? 16 : 0, shadowColor: GOLD, shadowOpacity: !panel && focusedKey === 'apps-header' ? 0.65 : 0,
        shadowRadius: 12 * cardS, shadowOffset: {width: 0, height: 0}, padding: 18 * cardS, transform: [{scale: appsZoom}], zIndex: 0}}>
        <View pointerEvents="none" style={{position: 'absolute', top: -1, bottom: -1, left: -1, right: -1, borderRadius: 27 * cardS, borderWidth: 3 * cardS, borderColor: !panel && focusedKey === 'apps-header' ? GOLD : 'transparent'}} />
        <FocusButton label="Mở danh sách ứng dụng" s={cardS} preferred
          buttonRef={appsHeaderRef}
          nextFocusDown={firstAppNode} quietFocus
          focusKey="apps-header" onFocus={setFocusedKey} onPress={() => setPanel(panel === 'apps' ? null : 'apps')}
          style={{width: 190 * cardS, height: 37 * cardS, borderWidth: 0, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 2 * cardS}}>
          <Text style={{fontSize: 24 * cardS, fontWeight: 'bold', color: WHITE}}>Ứng dụng</Text>
          <Text style={{position: 'absolute', right: 2 * cardS, fontSize: 30 * cardS, color: GOLD}}>›</Text>
        </FocusButton>
        <View style={{marginTop: 10 * cardS, flexDirection: 'row', flexWrap: 'wrap'}}>
          {compactApps.map((key, i) => {
            const picture = ICONS[key];
            if (picture) return menuButton(key, picture, () => onOpenApp(key), i);
            const found = apps.find(a => a.packageName === key);
            return <FocusButton key={key} label={found?.label || key} s={cardS} onPress={() => onOpenApp(key)}
              buttonRef={i === 0 ? firstAppRef : undefined} image={found?.iconUri ? {uri: found.iconUri} : undefined} iconSize={56} focusKey={key} onFocus={setFocusedKey}
              style={{width: 88 * cardS, height: 78 * cardS, marginRight: (i % 2 === 0 ? 10 : 0) * cardS, marginBottom: (i < 2 ? 10 : 0) * cardS}}>
              {!found?.iconUri && <Text style={{fontSize: 24 * cardS, fontWeight: 'bold', color: GOLD}}>{(found?.label || key).slice(0, 2).toUpperCase()}</Text>}
            </FocusButton>;
          })}
          {menuButton('Xem thêm', ICONS.plus, () => setPanel('apps'), compactApps.length)}
        </View>

      </Animated.View>

      {/* Compact connection card */}
      <Animated.View style={{position: 'absolute', left: 368.7 * s, top: 526.6 * s, width: 227 * cardS, height: 254 * cardS, borderRadius: 27 * cardS,
        borderWidth: 1.5 * cardS, borderColor: !panel && focusedKey === 'connections-header' ? GOLD : 'rgba(244,203,90,0.75)',
        backgroundColor: !panel && focusedKey === 'connections-header' ? 'rgba(22, 77, 49, 0.95)' : CARD,
        elevation: !panel && focusedKey === 'connections-header' ? 16 : 0, shadowColor: GOLD, shadowOpacity: !panel && focusedKey === 'connections-header' ? 0.65 : 0,
        shadowRadius: 12 * cardS, shadowOffset: {width: 0, height: 0}, padding: 18 * cardS, transform: [{scale: connectionsZoom}], zIndex: 0}}>
        <View pointerEvents="none" style={{position: 'absolute', top: -1, bottom: -1, left: -1, right: -1, borderRadius: 27 * cardS, borderWidth: 3 * cardS, borderColor: !panel && focusedKey === 'connections-header' ? GOLD : 'transparent'}} />
        <FocusButton label="Mở kết nối" s={cardS} focusKey="connections-header" onFocus={setFocusedKey}
          buttonRef={connectionsHeaderRef}
          nextFocusDown={firstConnectionNode} quietFocus
          onPress={() => setPanel(panel === 'connections' ? null : 'connections')}
          style={{width: 190 * cardS, height: 37 * cardS, borderWidth: 0, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 2 * cardS}}>
          <Text style={{fontSize: 24 * cardS, fontWeight: 'bold', color: WHITE}}>Kết nối</Text>
          <Text style={{position: 'absolute', right: 2 * cardS, fontSize: 30 * cardS, color: GOLD}}>›</Text>
        </FocusButton>
        <View style={{marginTop: 10 * cardS, flexDirection: 'row', flexWrap: 'wrap'}}>
          {CONNECT.map((v, i) => menuButton(v.title, ICONS[v.key], () => onConnection(v.key), i))}
        </View>

      </Animated.View>

      {/* Touch-adjustable volume display; remote focuses only mute and output. */}
      <View style={{position: 'absolute', right: 96 * s, top: 330 * s, width: 82 * s, height: 333 * s,
        borderRadius: 46 * s, borderColor: 'rgba(255, 214, 121, .70)', borderWidth: 1.3 * s,
        alignItems: 'center', backgroundColor: 'rgba(1, 34, 26, 0.82)', paddingTop: 8 * s}}>
        <FocusButton label="Bật hoặc tắt tiếng" s={s} image={isMuted ? ICONS.mute : ICONS.speaker} iconSize={33} iconOnly
          buttonRef={muteRef} nextFocusDown={outputNode}
          onPress={() => {
            if (!AsiaTV) {setIsMuted(!isMuted); return;}
            AsiaTV.toggleMute().then((r: any) => setIsMuted(!!r.muted)).catch(() => notify('Không thể tắt tiếng.'));
          }}
          style={{width: 61 * s, height: 50 * s}}
          focusKey="mute" onFocus={setFocusedKey} />
        <View accessibilityLabel="Âm lượng hệ thống" focusable={false}
          style={{height: railH + 14 * s, width: 55 * s, alignItems: 'center', justifyContent: 'center'}}>
          <View onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
            onResponderGrant={e => setFromTouch(e, false)}
            onResponderMove={e => setFromTouch(e, false)}
            onResponderRelease={e => setFromTouch(e, true)}
            style={{height: railH, width: 12 * s, borderRadius: 10 * s, backgroundColor: 'rgba(255,255,255,.22)', justifyContent: 'flex-end'}}>
            <View style={{height: `${volume}%`, backgroundColor: GOLD, borderRadius: 10 * s}} />
            <View style={{position: 'absolute', bottom: `${volume}%`, left: -5 * s, width: 22 * s, height: 22 * s, borderRadius: 12 * s,
              backgroundColor: GOLD, transform: [{translateY: 11 * s}]}} />
          </View>
        </View>
        <Text style={{color: GOLD, fontSize: 15 * s, fontWeight: 'bold'}}>{isMuted ? 'Tắt' : `${volume}%`}</Text>
        <FocusButton label="Mở cài đặt âm thanh hệ thống" s={s} onPress={() => callNative('openSettings', 'sound')} iconOnly
          buttonRef={outputRef} nextFocusUp={muteNode}
          style={{width: 62 * s, height: 39 * s, marginTop: 7 * s}} focusKey="output" onFocus={setFocusedKey}>
          {selected => <View pointerEvents="none" style={{width: 32 * s, height: 32 * s}}>
            {[true, false].map((top, i) => (
              <View key={i} style={{position: 'absolute', top: (top ? 4 : 20) * s, width: 32 * s,
                height: 10 * s, flexDirection: 'row', alignItems: 'center'}}>
                <View style={{width: (top ? 16 : 6) * s, height: 3 * s, borderRadius: 2 * s, backgroundColor: selected ? GOLD : WHITE}} />
                <View style={{width: 10 * s, height: 10 * s, borderRadius: 5 * s, borderWidth: 3 * s, borderColor: selected ? GOLD : WHITE}} />
                <View style={{flex: 1, height: 3 * s, borderRadius: 2 * s, backgroundColor: selected ? GOLD : WHITE}} />
              </View>
            ))}
          </View>}
        </FocusButton>
      </View>

      {panel === 'apps' && <AppLibrary s={s} apps={apps} pinned={pinned} loading={appsLoading} error={appsError}
        managing={managingApps} setManaging={setManagingApps} onClose={() => {setManagingApps(false); setPanel(null);}}
        onOpen={onOpenApp} onTogglePin={togglePin} />}

      {/* Expanded panels render actual native components, not HTML/web overlays. */}
      {panel && panel !== 'apps' && (
        <View style={{position: 'absolute', left: 96 * s, top: 228 * s, width: 505 * s, maxHeight: 588 * s,
          borderRadius: 26 * s, backgroundColor: 'rgba(0, 32, 26, 0.97)', borderColor: GOLD, borderWidth: 2 * s,
          padding: 22 * s, elevation: 14}}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 * s}}>
            <Text style={{color: WHITE, fontSize: 29 * s, fontWeight: 'bold'}}>
              {panel === 'connections' ? 'Công nghệ kết nối' : panel === 'audio' ? 'Đầu ra âm thanh' : 'Hướng dẫn'}
            </Text>
            <FocusButton label="Đóng bảng" s={s} preferred onPress={() => setPanel(null)} style={{width: 68 * s, height: 47 * s}}>
              <CloseIcon s={s} />
            </FocusButton>
          </View>
          {panel === 'connections' && (
            <View style={{gap: 12 * s}}>
              {CONNECT.map(v => (
                <FocusButton key={v.key} label={v.title} s={s} onPress={() => onConnection(v.key)}
                  style={{width: 450 * s, height: 82 * s, flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 18 * s}}>
                  <Image source={ICONS[v.key]} resizeMode="contain" style={{width: 60 * s, height: 60 * s, marginRight: 16 * s}} />
                  <View>
                    <Text style={{fontSize: 22 * s, fontWeight: 'bold', color: WHITE}}>{v.title}</Text>
                    <Text style={{fontSize: 15 * s, color: '#bfdad0'}}>{v.caption}</Text>
                  </View>
                </FocusButton>
              ))}
              <Text style={{fontSize: 14 * s, color: '#d9e8df', marginTop: 5 * s}}>Một số đầu vào chỉ có thể chọn qua nút Input trên remote Xiaomi.</Text>
            </View>
          )}
          {panel === 'audio' && (
            <View style={{gap: 16 * s}}>
              <Text style={{fontSize: 17 * s, color: WHITE}}>Âm lượng hiện tại: {volume}%</Text>
              <FocusButton label="Mở cài đặt âm thanh của TV" s={s} onPress={() => callNative('openSettings', 'sound')}
                style={{height: 66 * s}}><Text style={{fontSize: 19 * s, color: GOLD}}>◉  Mở cài đặt thiết bị âm thanh</Text></FocusButton>
              <Text style={{fontSize: 15 * s, color: '#d9e8df'}}>Việc đổi đầu ra loa/Bluetooth phụ thuộc firmware của Xiaomi. Ứng dụng không tự chuyển tuyến âm thanh khi chưa được TV cấp quyền.</Text>
            </View>
          )}
        </View>
      )}

      <Footer s={s} w={1672 * s} />
      {toast !== '' && (
        <View pointerEvents="none" style={{position: 'absolute', bottom: 90 * s, left: 590 * s, right: 170 * s, zIndex: 30, elevation: 30,
          borderRadius: 13 * s, paddingVertical: 12 * s, paddingHorizontal: 20 * s, backgroundColor: 'rgba(0, 21, 18, 0.92)', borderWidth: 1, borderColor: GOLD}}>
          <Text style={{fontSize: 17 * s, color: WHITE}}>{toast}</Text>
        </View>
      )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({root: {flex: 1, backgroundColor: '#092d20', overflow: 'hidden'}});
