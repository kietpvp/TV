import io,os
import cairosvg
from PIL import Image
p=os.path.join(os.path.dirname(__file__),'..','assets','icons');os.makedirs(p,exist_ok=True)
def write(name,inn,background='none'):
 s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><rect width="112" height="112" fill="{background}"/>{inn}</svg>'''
 out=cairosvg.svg2png(bytestring=s.encode(),output_width=112,output_height=112)
 im=Image.open(io.BytesIO(out));im.save(os.path.join(p,name+'.png'))
write('youtube','<rect x="14" y="25" width="84" height="62" rx="19" fill="#FF161C"/><path d="M47 39 L47 73 75 56 Z" fill="white"/>')
write('eshare','<rect x="20" y="17" width="72" height="78" rx="17" fill="#EC2469"/><text x="56" y="78" font-family="DejaVu Sans" font-size="66" text-anchor="middle" font-weight="bold" fill="#FFF">E</text><path d="M75 12 Q93 13 95 33 M75 20 Q85 21 86 33" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>')
write('playstore','<path d="M27 14 L27 98 91 56 Z" fill="#19BC68"/><path d="M27 14 L59 51 91 56 Z" fill="#34ACF7"/><path d="M27 98 L60 62 91 56 Z" fill="#F7CB34"/><path d="M53 45 L77 56 53 68 61 56 Z" fill="#E94A58"/>')
write('plus','<circle cx="56" cy="56" r="35" fill="none" stroke="#E3EEE6" stroke-width="5"/><path d="M56 35 V77 M35 56 H77" stroke="white" stroke-width="5" stroke-linecap="round"/>')
write('hdmi','<path d="M20 42 H92 V69 L82 79 H30 L20 69 Z M31 52 H81 V62 H31 Z" stroke="#FFE48A" stroke-width="5" stroke-linejoin="round" fill="none"/>')
write('miracast','<path d="M23 31 H89 V83 H23 Z" stroke="#52ABFF" stroke-width="5" stroke-linejoin="round" fill="none"/><path d="M22 64 A30 30 0 0 1 52 94 M22 76 A17 17 0 0 1 39 94" stroke="#52ABFF" stroke-width="5" fill="none"/><circle cx="22" cy="94" r="4" fill="#52ABFF"/>')
write('cast','<rect x="18" y="27" width="77" height="58" rx="4" stroke="#64E6CF" stroke-width="5" fill="none"/><path d="M19 62 A31 31 0 0 1 50 93 M19 75 A18 18 0 0 1 37 93" stroke="#64E6CF" stroke-width="5" fill="none"/><circle cx="19" cy="93" r="4" fill="#64E6CF"/>')
write('usb','<path d="M56 18 V84 M56 18 L46 30 M56 18 L66 30 M56 53 L32 53 V72 M56 65 H80 V45 M80 45 L74 50 M80 45 L86 50" stroke="#DDA6FF" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="32" cy="76" r="7" fill="#DDA6FF"/><rect x="48" y="82" width="16" height="13" rx="3" fill="#DDA6FF"/>')
write('speaker','<path d="M14 42 H30 L53 23 V89 L30 70 H14 Z" stroke="#FFFFFF" stroke-width="4" fill="none"/><path d="M65 40 Q83 56 65 72 M77 28 Q108 56 77 85" stroke="#FFE18B" stroke-width="5" fill="none" stroke-linecap="round"/>')
write('mute','<path d="M14 42 H30 L53 23 V89 L30 70 H14 Z" stroke="#FFFFFF" stroke-width="4" fill="none"/><path d="M65 42 L92 69 M92 42 L65 69" stroke="#FFA59E" stroke-width="5" stroke-linecap="round"/>')
write('wifi','<path d="M18 44 Q56 10 94 44 M31 57 Q56 35 81 57 M44 70 Q56 59 68 70" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="56" cy="83" r="6" fill="#FFFFFF"/>')
write('settings','<circle cx="56" cy="56" r="34" stroke="white" stroke-width="6" fill="none"/><circle cx="56" cy="56" r="14" stroke="white" stroke-width="6" fill="none"/><path d="M56 12 V26 M56 86 V100 M12 56 H26 M86 56 H100 M26 26 L36 36 M76 76 L86 86 M26 86 L36 76 M76 36 L86 26" stroke="white" stroke-width="7"/>')
write('audio','<path d="M14 42 H30 L53 23 V89 L30 70 H14 Z" stroke="#FFFFFF" stroke-width="4" fill="none"/><path d="M65 40 Q83 56 65 72 M77 28 Q108 56 77 85" stroke="#FFE18B" stroke-width="5" fill="none" stroke-linecap="round"/>')
print('rendered',len(os.listdir(p)),'icons')
