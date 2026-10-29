import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Image, Pressable, ScrollView, Text, TextInput, TVFocusGuideView, View} from 'react-native';

export type InstalledApp = {label: string; packageName: string; iconUri?: string};
const gold = '#f5d36d';
const white = '#f4faf6';
const AnimatedButton = Animated.createAnimatedComponent(Pressable);

export function CloseIcon({s}: {s: number}) {
  return <View pointerEvents="none" style={{width: 24 * s, height: 24 * s}}>
    {[45, -45].map(angle => <View key={angle} style={{position: 'absolute', left: s, top: 11 * s,
      width: 22 * s, height: 2 * s, borderRadius: s, backgroundColor: white, transform: [{rotate: `${angle}deg`}]}} />)}
  </View>;
}

function Button({label, onPress, onLongPress, s, style, children, preferred = false, buttonRef}: any) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.spring(scale, {toValue: focused ? 1.04 : 1, speed: 24, bounciness: 2, useNativeDriver: true});
    animation.start();
    return () => animation.stop();
  }, [focused, scale]);
  return <AnimatedButton ref={buttonRef} accessibilityRole="button" accessibilityLabel={label}
    focusable hasTVPreferredFocus={preferred} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    onPress={onPress} onLongPress={onLongPress}
    style={[{borderWidth: 1.5 * s, borderColor: focused ? gold : 'rgba(205,229,209,.25)',
      borderRadius: 17 * s, backgroundColor: focused ? 'rgba(49,100,63,.95)' : 'rgba(0,22,18,.65)',
      alignItems: 'center', justifyContent: 'center', padding: 8 * s, transform: [{scale}]}, style]}>{children}</AnimatedButton>;
}

function AppIcon({app, s, size = 50}: {app: InstalledApp; s: number; size?: number}) {
  return app.iconUri ? <Image source={{uri: app.iconUri}} resizeMode="contain" style={{width: size * s, height: size * s}} />
    : <View style={{width: size * s, height: size * s, borderRadius: 12 * s, backgroundColor: '#23513c', alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{color: gold, fontSize: size * .4 * s, fontWeight: 'bold'}}>{app.label.slice(0, 2).toUpperCase()}</Text></View>;
}

export default function AppLibrary({s, apps, pinned, loading, error, managing, setManaging, onClose, onOpen, onTogglePin}: {
  s: number; apps: InstalledApp[]; pinned: string[]; loading: boolean; error: string;
  managing: boolean; setManaging: (value: boolean) => void; onClose: () => void;
  onOpen: (key: string) => void; onTogglePin: (key: string) => void;
}) {
  const [managerFilter, setManagerFilter] = useState<'all' | 'pinned'>('all');
  const [query, setQuery] = useState('');
  const addRef = useRef<any>(null);
  const previousManaging = useRef(false);
  useEffect(() => {
    if (previousManaging.current && !managing) {
      const timer = setTimeout(() => addRef.current?.requestTVFocus(), 80);
      previousManaging.current = managing;
      return () => clearTimeout(timer);
    }
    previousManaging.current = managing;
  }, [managing]);
  const pinnedApps = pinned.map(key => apps.find(app => app.packageName === key)).filter((app): app is InstalledApp => !!app);
  const grid = apps;
  const managedApps = useMemo(() => apps.filter(app => {
    const isPinned = pinned.includes(app.packageName);
    return (managerFilter === 'all' || isPinned)
      && `${app.label} ${app.packageName}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }), [apps, pinned, managerFilter, query]);
  const empty = loading ? 'Đang đọc ứng dụng trên TV…' : error || 'Chưa có ứng dụng phù hợp trên TV.';
  const panelStyle = {height: 690 * s, borderRadius: 28 * s, borderWidth: 2 * s, borderColor: gold,
    backgroundColor: 'rgba(0,30,22,.97)', padding: 24 * s};
  const tile = (app: InstalledApp, width: number, pinnedTile = false) => <Button key={app.packageName} label={app.label} s={s}
    onPress={() => onOpen(app.packageName)} onLongPress={() => setManaging(true)}
    style={{width: width * s, height: (pinnedTile ? 116 : 102) * s}}>
    <AppIcon app={app} s={s} size={pinnedTile ? 54 : 46} />
    <Text numberOfLines={1} style={{color: white, fontSize: 18 * s, marginTop: 8 * s, maxWidth: '100%', textAlign: 'center'}}>{app.label}</Text>
  </Button>;
  return <TVFocusGuideView trapFocusUp trapFocusDown trapFocusLeft trapFocusRight
    style={{position: 'absolute', left: 96 * s, top: 130 * s, flexDirection: 'row', gap: 18 * s, zIndex: 10}}>
    <TVFocusGuideView focusable={!managing} style={[panelStyle, {width: 690 * s}]}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={{color: white, fontSize: 36 * s, fontWeight: 'bold'}}>Ứng dụng</Text>
        <Button label="Đóng bảng ứng dụng" s={s} preferred={!managing} onPress={onClose} style={{width: 62 * s, height: 46 * s}}>
          <CloseIcon s={s} /></Button>
      </View>
      <Text style={{color: '#c6d9cb', fontSize: 16 * s, marginTop: 10 * s}}>Chọn ứng dụng để mở · Nhấn giữ OK để quản lý</Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 * s, marginBottom: 12 * s}}>
        <Text style={{color: gold, fontSize: 20 * s, fontWeight: 'bold'}}>Ứng dụng ghim</Text>
        <Text style={{color: '#c6d9cb', fontSize: 18 * s}}>Đã ghim {pinnedApps.length}/8</Text>
      </View>
      <ScrollView horizontal style={{height: 130 * s, flexGrow: 0}} contentContainerStyle={{gap: 12 * s, padding: 5 * s}}>
        {pinnedApps.map(app => tile(app, 143, true))}
        <Button label="Thêm ứng dụng" s={s} buttonRef={addRef} onPress={() => setManaging(true)} style={{width: 143 * s, height: 116 * s}}>
          <Text style={{color: white, fontSize: 48 * s, lineHeight: 55 * s}}>⊕</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}
            style={{color: white, fontSize: 18 * s, marginTop: 5 * s, maxWidth: '100%', textAlign: 'center'}}>Thêm ứng dụng</Text>
        </Button>
      </ScrollView>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16 * s}}>
        <Text style={{color: white, fontSize: 21 * s, fontWeight: 'bold'}}>Tất cả ứng dụng</Text>
      </View>
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 5 * s, paddingBottom: 15 * s}}>
        {!grid.length && <Text style={{color: '#c6d9cb', fontSize: 17 * s, padding: 12 * s}}>{empty}</Text>}
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10 * s}}>{grid.map(app => tile(app, 112))}</View>
      </ScrollView>
    </TVFocusGuideView>
    {managing && <TVFocusGuideView style={[panelStyle, {width: 520 * s}]} trapFocusUp trapFocusDown trapFocusLeft trapFocusRight>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={{color: white, fontSize: 29 * s, fontWeight: 'bold'}}>Quản lý ứng dụng</Text>
        <Button label="Quay lại bảng ứng dụng" s={s} preferred onPress={() => setManaging(false)} style={{height: 42 * s, paddingHorizontal: 12 * s}}>
          <Text style={{color: white, fontSize: 16 * s}}>← Quay lại</Text></Button>
      </View>
      <Text style={{color: '#c6d9cb', fontSize: 16 * s, marginTop: 10 * s}}>Chọn ứng dụng để thêm hoặc xóa ghim</Text>
      <View style={{flexDirection: 'row', gap: 8 * s, marginTop: 20 * s}}>
        {([['all', 'Tất cả ứng dụng'], ['pinned', 'Đang ghim']] as const).map(([id, label]) =>
          <Button key={id} label={label} s={s} onPress={() => setManagerFilter(id)}
            style={{flex: 1, height: 40 * s, backgroundColor: managerFilter === id ? '#9b8335' : 'rgba(0,22,18,.65)'}}>
            <Text style={{color: white, fontSize: 14 * s}}>{label}</Text></Button>)}
      </View>
      <TextInput value={query} onChangeText={setQuery} placeholder="Tìm kiếm ứng dụng…" placeholderTextColor="#adbdaf"
        accessibilityLabel="Tìm kiếm ứng dụng trên TV" style={{color: white, borderWidth: 1 * s, borderColor: '#789478',
          borderRadius: 18 * s, height: 44 * s, paddingHorizontal: 15 * s, paddingVertical: 0,
          textAlignVertical: 'center', fontSize: 16 * s, marginVertical: 16 * s}} />
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 5 * s, paddingBottom: 15 * s}}>
        {!managedApps.length && <Text style={{color: '#c6d9cb', fontSize: 17 * s}}>{empty}</Text>}
        {managedApps.map(app => <View key={app.packageName} style={{flexDirection: 'row', alignItems: 'center', gap: 12 * s,
          minHeight: 72 * s, borderBottomWidth: 1 * s, borderBottomColor: 'rgba(208,231,211,.2)', paddingVertical: 10 * s}}>
          <AppIcon app={app} s={s} size={42} />
          <View style={{flex: 1}}><Text numberOfLines={1} style={{color: white, fontSize: 18 * s}}>{app.label}</Text>
            <Text numberOfLines={1} style={{color: '#9db4a3', fontSize: 14 * s, marginTop: 4 * s}}>{app.packageName}</Text></View>
          <Button label={`${pinned.includes(app.packageName) ? 'Bỏ ghim' : 'Ghim'} ${app.label}`} s={s} onPress={() => onTogglePin(app.packageName)}
            style={{width: 95 * s, height: 40 * s, backgroundColor: pinned.includes(app.packageName) ? '#9b8335' : '#244437'}}>
            <Text style={{color: white, fontSize: 16 * s, fontWeight: 'bold'}}>{pinned.includes(app.packageName) ? 'Bỏ ghim' : 'Ghim'}</Text></Button>
        </View>)}
      </ScrollView>
    </TVFocusGuideView>}
  </TVFocusGuideView>;
}
