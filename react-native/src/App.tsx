/** Native TV controls over a clean lake-at-sunrise brand background. */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated, AppState, BackHandler, Easing, Image, ImageBackground, NativeModules,
  Pressable, StatusBar, StyleSheet, Text, TVFocusGuideView, View,
  useWindowDimensions, findNodeHandle,
} from 'react-native';
import AppLibrary, {CloseIcon, InstalledApp} from './components/AppLibrary';

const {AsiaTV} = NativeModules;
const GOLD = '#ffe77d';
const WHITE = '#f7faf4';
const WIDTH = 1672;
const HEIGHT = WIDTH * 9 / 16;
const DEFAULT_PINNED = ['youtube', 'eshare', 'playstore'];
type Panel = null | 'apps' | 'connections';

const ICONS: Record<string, any> = {
  youtube: require('../assets/icons/youtube.png'),
  eshare: require('../assets/icons/eshare.png'),
  playstore: require('../assets/icons/playstore.png'),
  plus: require('../assets/icons/plus.png'),
  hdmi: require('../assets/icons/hdmi.png'),
  miracast: require('../assets/icons/miracast.png'),
  cast: require('../assets/icons/cast.png'),
  usb: require('../assets/icons/usb.png'),
  wifi: require('../assets/icons/wifi.png'),
  settings: require('../assets/icons/settings.png'),
};
const PARTNERS = [
  require('../assets/partners/zizipop.png'),
  require('../assets/partners/fish.png'),
  require('../assets/partners/wana.png'),
  require('../assets/partners/solavie.png'),
  require('../assets/partners/mcoffee.png'),
  require('../assets/partners/wazzer.png'),
];
const CONNECTIONS = [
  {key: 'hdmi', title: 'HDMI', caption: 'Chọn nguồn tín hiệu'},
  {key: 'miracast', title: 'Miracast', caption: 'Chia sẻ màn hình không dây'},
  {key: 'cast', title: 'Google Cast', caption: 'Nhận phát từ điện thoại / PC'},
  {key: 'usb', title: 'USB', caption: 'Mở tập tin USB'},
];

function dateLabel(d: Date) {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return `${days[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}
function timeLabel(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
function FocusButton({label, onPress, image, s, style, iconSize = 48, preferred = false,
  focusKey, onFocus, children, buttonRef, nextFocusDown, quiet = false, enabled = true}: {
  label: string; onPress: () => void; image?: any; s: number; style?: any; iconSize?: number;
  preferred?: boolean; focusKey?: string; onFocus?: (key: string) => void;
  children?: React.ReactNode; buttonRef?: React.Ref<any>; nextFocusDown?: number;
  quiet?: boolean; enabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const motion = Animated.spring(scale, {toValue: focused && !quiet ? 1.05 : 1,
      speed: 24, bounciness: 2, useNativeDriver: true});
    motion.start();
    return () => motion.stop();
  }, [focused, quiet, scale]);
  return <AnimatedPressable ref={buttonRef} accessibilityRole="button" accessibilityLabel={label}
    focusable={enabled} hasTVPreferredFocus={preferred && enabled} nextFocusDown={nextFocusDown}
    onFocus={() => {setFocused(true); if (focusKey) onFocus?.(focusKey);}}
    onBlur={() => setFocused(false)} onPress={onPress}
    style={[{alignItems: 'center', justifyContent: 'center', borderRadius: 17 * s,
      borderWidth: quiet ? 0 : 1 * s,
      borderColor: focused && !quiet ? GOLD : 'rgba(190,224,207,0.13)',
      backgroundColor: quiet ? 'transparent' : focused ? 'rgba(18,79,62,0.92)' : 'rgba(0,30,27,0.86)',
      transform: [{scale}], zIndex: focused ? 2 : 0}, style,
      focused && !quiet && {borderColor: GOLD, backgroundColor: 'rgba(18,79,62,0.92)'}]}>
    {image && <Image source={image} resizeMode="contain" style={{width: iconSize * s, height: iconSize * s}} />}
    {children}
  </AnimatedPressable>;
}

function HomeCard({left, selected, s, children}: {
  left: number; selected: boolean; s: number; children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const motion = Animated.spring(scale, {toValue: selected ? 1.012 : 1,
      speed: 24, bounciness: 2, useNativeDriver: true});
    motion.start();
    return () => motion.stop();
  }, [selected, scale]);
  return <Animated.View style={{position: 'absolute', left: left * s, top: 500 * s,
    width: 280 * s, height: 274 * s, padding: 22 * s, borderRadius: 28 * s,
    borderWidth: (selected ? 2.2 : 1.1) * s,
    borderColor: selected ? GOLD : 'rgba(151,197,166,0.36)',
    backgroundColor: selected ? 'rgba(0,46,38,0.85)' : 'rgba(0,40,34,0.76)',
    boxShadow: selected ? `0px 0px ${21 * s}px ${2 * s}px rgba(255,230,99,0.65)` : 'none',
    transform: [{scale}], zIndex: selected ? 2 : 1}}>
    {children}
  </Animated.View>;
}

function Footer({s}: {s: number}) {
  const slide = useRef(new Animated.Value(0)).current;
  const slot = 136 * s;
  const groupWidth = slot * PARTNERS.length;
  useEffect(() => {
    slide.setValue(0);
    const motion = Animated.loop(Animated.timing(slide, {toValue: -groupWidth, duration: 27000,
      easing: Easing.linear, useNativeDriver: true, isInteraction: false}));
    motion.start();
    return () => motion.stop();
  }, [groupWidth, slide]);
  return <View pointerEvents="none" style={{position: 'absolute', left: 0, right: 0, bottom: 33 * s,
    height: 78 * s, backgroundColor: 'rgba(0,39,35,0.84)',
    borderTopWidth: s, borderTopColor: 'rgba(158,204,178,0.17)', overflow: 'hidden'}}>
    <Animated.View style={{height: '100%', width: groupWidth * 4,
      flexDirection: 'row', alignItems: 'center', transform: [{translateX: slide}]}}>
      {Array.from({length: 4}, (_, group) => PARTNERS.map((logo, index) =>
        <View key={`${group}-${index}`} style={{width: slot, height: 54 * s,
          justifyContent: 'center', alignItems: 'center'}}>
          <Image source={logo} resizeMode="contain" style={{width: 101 * s, height: 45 * s}} />
          <View style={{position: 'absolute', right: 0, top: 10 * s, bottom: 10 * s,
            width: s, backgroundColor: 'rgba(163,202,180,0.15)'}} />
        </View>))}
    </Animated.View>
  </View>;
}

export default function App() {
  const {width: w, height: h} = useWindowDimensions();
  const s = Math.min(w / WIDTH, h / HEIGHT);
  const [now, setNow] = useState(new Date());
  const [panel, setPanel] = useState<Panel>(null);
  const [managingApps, setManagingApps] = useState(false);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState('');
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [focusedKey, setFocusedKey] = useState('apps-header');
  const [toast, setToast] = useState('');
  const appsHeaderRef = useRef<any>(null);
  const connectionsHeaderRef = useRef<any>(null);
  const homeFocusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const homeNodes = useRef<any[]>([]);
  const homeTags = useRef<(number | null)[]>([]);
  const [focusRevision, setFocusRevision] = useState(0);
  const homeButtonRefs = useMemo(() => Array.from({length: 12}, (_, index) => (node: any) => {
    homeNodes.current[index] = node;
    if (index === 2) appsHeaderRef.current = node;
    if (index === 3) connectionsHeaderRef.current = node;
    // Animated Pressable can detach and reattach its ref during a render.
    // Only a different native view needs a new focus graph, not a new JS handle.
    const tag = node ? findNodeHandle(node) : null;
    if (tag != null && homeTags.current[index] !== tag) {
      homeTags.current[index] = tag;
      setFocusRevision(value => value + 1);
    }
  }), []);
  const appsSelected = !panel && (focusedKey === 'apps-header' || focusedKey.startsWith('app:'));
  const connectionsSelected = !panel && (focusedKey === 'connections-header' || focusedKey.startsWith('connection:'));
  const focusHome = useCallback(() => {
    if (homeFocusTimer.current) clearTimeout(homeFocusTimer.current);
    homeFocusTimer.current = setTimeout(() => {
      appsHeaderRef.current?.requestTVFocus(); homeFocusTimer.current = null;
    }, 100);
  }, []);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setToast(''), 3800);
  }, []);

  useEffect(() => {
    if (!AsiaTV?.linkHomeFocus || panel) return;
    const timer = setTimeout(() => {
      const tags = homeNodes.current.map(node => node ? findNodeHandle(node) : null);
      const available = (...indices: number[]) => indices.find(index => tags[index] != null)!;
      // [up, down, left, right]. Both 2x2 grids remain reachable without jumping to Wi-Fi.
      const routes = [
        [0, 3, 3, 1], [1, 3, 0, 1], [0, 4, 2, 3], [0, 8, 2, 0],
        [2, available(6, 4), 4, available(5, 8)],
        [2, available(7, 6, 5), 4, 8],
        [4, 6, 6, available(7, 10)], [available(5, 4), 7, 6, 10],
        [3, 10, available(5, 4), 9], [3, 11, 8, 9],
        [8, 10, available(7, 6, 5, 4), 11], [9, 11, 10, 11],
      ];
      const links = routes.flatMap((route, index) => {
        if (!tags[index]) return [];
        const link: Record<string, number> = {from: tags[index]!};
        ['up', 'down', 'left', 'right'].forEach((direction, position) => {
          const target = tags[route[position]];
          if (target) link[direction] = target;
        });
        return [link];
      });
      AsiaTV.linkHomeFocus(links).catch((error: any) => console.warn('TV focus:', error));
    }, 120);
    return () => clearTimeout(timer);
  }, [focusRevision, panel]);

  useEffect(() => {
    if (!panel) focusHome();
  }, [panel, focusHome]);

  useEffect(() => {
    let mounted = true;
    let refreshNumber = 0;
    const refresh = async () => {
      if (!AsiaTV) {setAppsLoading(false); return;}
      const request = ++refreshNumber;
      try {
        const [items, saved]: [InstalledApp[], string] = await Promise.all([
          AsiaTV.getInstalledApps(), AsiaTV.getPinnedApps().catch(() => JSON.stringify(DEFAULT_PINNED)),
        ]);
        if (!mounted || request !== refreshNumber) return;
        let stored = DEFAULT_PINNED;
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) stored = parsed.filter(key => typeof key === 'string');
        } catch (_) { /* Use the default shortcuts if saved preferences are invalid. */ }
        const normalized = stored.map(key => {
          if (items.some(app => app.packageName === key)) return key;
          if (key === 'youtube') return items.find(app => app.packageName.startsWith('com.google.android.youtube'))?.packageName;
          if (key === 'eshare') return items.find(app => /eshare/i.test(`${app.label} ${app.packageName}`))?.packageName;
          if (key === 'playstore') return items.find(app => app.packageName === 'com.android.vending')?.packageName;
          return undefined;
        }).filter((key): key is string => !!key);
        setApps(items); setPinned([...new Set(normalized)].slice(0, 8)); setAppsError('');
      } catch (_) {
        if (mounted) setAppsError('Không đọc được ứng dụng trên TV. Hãy mở lại để thử lại.');
      } finally {if (mounted) setAppsLoading(false);}
    };
    AsiaTV?.setImmersive().catch(() => {});
    void refresh();
    const clock = setInterval(() => setNow(new Date()), 15000);
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      setNow(new Date()); setManagingApps(false); setPanel(null); focusHome(); void refresh();
    });
    return () => {
      mounted = false; clearInterval(clock); subscription.remove();
      if (homeFocusTimer.current) clearTimeout(homeFocusTimer.current);
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, [focusHome]);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (managingApps) {setManagingApps(false); return true;}
      if (panel) {setPanel(null); return true;}
      return false;
    });
    return () => listener.remove();
  }, [panel, managingApps]);

  const callNative = useCallback(async (fn: string, param?: string) => {
    if (!AsiaTV || typeof AsiaTV[fn] !== 'function') {notify('Tính năng chưa sẵn sàng.'); return;}
    try {
      const result = param === undefined ? await AsiaTV[fn]() : await AsiaTV[fn](param);
      if (result && typeof result === 'string') notify(result);
    } catch (error: any) {notify(`Không thể thực hiện: ${error?.message || 'chưa hỗ trợ trên TV'}`);}
  }, [notify]);
  const onOpenApp = useCallback((key: string) => {void callNative('openApp', key);}, [callNative]);
  const onConnection = (key: string) => {
    if (key === 'cast') {notify('Google Cast: chọn TV từ nút Truyền / Cast trên laptop hoặc điện thoại.'); return;}
    void callNative('openConnection', key);
  };
  const togglePin = (packageName: string) => {
    if (!pinned.includes(packageName) && pinned.length >= 8) {notify('Bạn có thể ghim tối đa 8 ứng dụng.'); return;}
    const next = pinned.includes(packageName) ? pinned.filter(key => key !== packageName) : [...pinned, packageName];
    setPinned(next);
    AsiaTV?.savePinnedApps(JSON.stringify(next)).catch(() => notify('Không lưu được ứng dụng ghim.'));
    notify(pinned.includes(packageName) ? 'Đã bỏ ghim ứng dụng.' : 'Đã ghim ứng dụng vào màn hình chính.');
  };
  const compactApps = useMemo(() => {
    if (appsLoading) return DEFAULT_PINNED;
    const priority = (key: string) => /youtube/i.test(key) ? 0 : /eshare/i.test(key) ? 1
      : key === 'com.android.vending' ? 2 : 3;
    return [...pinned].sort((a, b) => priority(a) - priority(b)).slice(0, 3);
  }, [appsLoading, pinned]);
  const tileStyle = (index: number) => ({width: 112 * s, height: 84 * s,
    marginRight: (index % 2 === 0 ? 12 : 0) * s, marginBottom: (index < 2 ? 12 : 0) * s});
  const titleStyle = {width: 236 * s, height: 36 * s, flexDirection: 'row' as const, borderRadius: 8 * s};

  return <ImageBackground source={require('../assets/lake-sunrise.png')} resizeMode="cover" style={styles.root}>
    <StatusBar hidden />
    <View style={{position: 'absolute', width: WIDTH * s, height: HEIGHT * s,
      left: (w - WIDTH * s) / 2, top: (h - HEIGHT * s) / 2}}>
      {/* The background contains brand and product artwork only; every control below is native. */}
      <View style={{position: 'absolute', top: 69 * s, right: 60 * s, flexDirection: 'row', alignItems: 'center'}}>
        <View style={{alignItems: 'flex-end', marginRight: 38 * s}}>
          <Text style={{color: WHITE, fontSize: 64 * s, lineHeight: 72 * s, fontWeight: '700',
            textShadowColor: 'rgba(0,36,27,.25)', textShadowRadius: 5 * s}}>{timeLabel(now)}</Text>
          <Text style={{color: WHITE, fontSize: 20 * s, marginTop: 2 * s}}>{dateLabel(now)}</Text>
        </View>
        <FocusButton label="Cài đặt Wi-Fi" image={ICONS.wifi} s={s} iconSize={35} enabled={!panel}
          buttonRef={homeButtonRefs[0]}
          onPress={() => {void callNative('openSettings', 'wifi');}} focusKey="wifi" onFocus={setFocusedKey}
          style={{width: 70 * s, height: 70 * s, marginRight: 18 * s, backgroundColor: 'rgba(16,57,44,0.36)', borderColor: 'rgba(220,237,209,.13)'}} />
        <FocusButton label="Cài đặt TV" image={ICONS.settings} s={s} iconSize={34} enabled={!panel}
          buttonRef={homeButtonRefs[1]}
          onPress={() => {void callNative('openSettings', 'general');}} focusKey="settings" onFocus={setFocusedKey}
          style={{width: 70 * s, height: 70 * s, backgroundColor: 'rgba(16,57,44,0.36)', borderColor: 'rgba(220,237,209,.13)'}} />
      </View>

      <HomeCard left={84} selected={appsSelected} s={s}>
        <FocusButton label="Mở danh sách ứng dụng" s={s} preferred quiet enabled={!panel}
          buttonRef={homeButtonRefs[2]} focusKey="apps-header" onFocus={setFocusedKey}
          onPress={() => setPanel('apps')} style={titleStyle}>
          <Text style={{fontSize: 28 * s, fontWeight: '700', color: WHITE}}>Ứng dụng</Text>
          <Text style={{position: 'absolute', right: 2 * s, color: GOLD, fontSize: 34 * s}}>›</Text>
        </FocusButton>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 * s, width: 236 * s}}>
          {compactApps.map((key, index) => {
            const app = apps.find(item => item.packageName === key);
            const alias = /youtube/i.test(key) ? 'youtube' : /eshare/i.test(key) ? 'eshare'
              : key === 'com.android.vending' ? 'playstore' : key;
            const picture = ICONS[alias] || (app?.iconUri ? {uri: app.iconUri} : undefined);
            return <FocusButton key={key} label={app?.label || key} image={picture} s={s} enabled={!panel}
              buttonRef={homeButtonRefs[4 + index]} focusKey={`app:${key}`} onFocus={setFocusedKey}
              onPress={() => onOpenApp(key)} style={tileStyle(index)}>
              {!picture && <Text style={{fontSize: 24 * s, color: GOLD}}>{(app?.label || key).slice(0, 2)}</Text>}
            </FocusButton>;
          })}
          <FocusButton label="Xem tất cả ứng dụng" image={ICONS.plus} s={s} enabled={!panel}
            buttonRef={homeButtonRefs[4 + compactApps.length]} focusKey="app:more" onFocus={setFocusedKey}
            onPress={() => setPanel('apps')} style={tileStyle(compactApps.length)} />
        </View>
      </HomeCard>

      <HomeCard left={379} selected={connectionsSelected} s={s}>
        <FocusButton label="Mở kết nối" s={s} quiet enabled={!panel} buttonRef={homeButtonRefs[3]}
          focusKey="connections-header" onFocus={setFocusedKey}
          onPress={() => setPanel('connections')} style={titleStyle}>
          <Text style={{fontSize: 28 * s, fontWeight: '700', color: WHITE}}>Kết nối</Text>
          <Text style={{position: 'absolute', right: 2 * s, color: GOLD, fontSize: 34 * s}}>›</Text>
        </FocusButton>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 * s, width: 236 * s}}>
          {CONNECTIONS.map((item, index) => <FocusButton key={item.key} label={item.title} image={ICONS[item.key]}
            s={s} enabled={!panel} buttonRef={homeButtonRefs[8 + index]}
            focusKey={`connection:${item.key}`} onFocus={setFocusedKey}
            onPress={() => onConnection(item.key)} style={tileStyle(index)} />)}
        </View>
      </HomeCard>

      <Footer s={s} />

      {panel === 'apps' && <AppLibrary s={s} apps={apps} pinned={pinned} loading={appsLoading} error={appsError}
        managing={managingApps} setManaging={setManagingApps} onClose={() => {setManagingApps(false); setPanel(null);}}
        onOpen={onOpenApp} onTogglePin={togglePin} />}
      {panel === 'connections' && <TVFocusGuideView trapFocusUp trapFocusDown trapFocusLeft trapFocusRight
        style={{position: 'absolute', left: 84 * s, top: 236 * s, width: 552 * s,
          borderRadius: 28 * s, backgroundColor: 'rgba(0,34,29,.98)', borderColor: GOLD,
          borderWidth: 1.5 * s, padding: 24 * s, zIndex: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 * s}}>
          <Text style={{color: WHITE, fontSize: 29 * s, fontWeight: '700'}}>Công nghệ kết nối</Text>
          <FocusButton label="Đóng bảng kết nối" s={s} preferred onPress={() => setPanel(null)}
            style={{width: 60 * s, height: 48 * s}}><CloseIcon s={s} /></FocusButton>
        </View>
        <View style={{gap: 12 * s}}>
          {CONNECTIONS.map(item => <FocusButton key={item.key} label={item.title} s={s}
            onPress={() => onConnection(item.key)} style={{height: 82 * s, flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 18 * s}}>
            <Image source={ICONS[item.key]} resizeMode="contain" style={{width: 52 * s, height: 52 * s, marginRight: 18 * s}} />
            <View><Text style={{fontSize: 22 * s, fontWeight: '700', color: WHITE}}>{item.title}</Text>
              <Text style={{fontSize: 15 * s, color: '#bfdad0'}}>{item.caption}</Text></View>
          </FocusButton>)}
          <Text style={{fontSize: 15 * s, color: '#c9ded3', marginTop: 4 * s}}>Nếu TV không mở nguồn trực tiếp, hãy chọn bằng nút Input trên remote.</Text>
        </View>
      </TVFocusGuideView>}
      {!!toast && <View pointerEvents="none" style={{position: 'absolute', bottom: 132 * s, left: 700 * s, right: 60 * s,
        padding: 18 * s, borderRadius: 16 * s, backgroundColor: 'rgba(0,33,28,.96)', borderWidth: s, borderColor: GOLD, zIndex: 30}}>
        <Text style={{fontSize: 18 * s, color: WHITE}}>{toast}</Text>
      </View>}
    </View>
  </ImageBackground>;
}

const styles = StyleSheet.create({root: {flex: 1, backgroundColor: '#123d36', overflow: 'hidden'}});
