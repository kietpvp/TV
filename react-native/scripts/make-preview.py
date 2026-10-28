from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
p=Path(__file__).resolve().parent.parent
im=Image.open(p/'assets/background.jpg').convert('RGBA');W,H=im.size
lay=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(lay)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def f(sz,b=False):return ImageFont.truetype(bold if b else font,sz)
# time and status
d.text((1190,65),'13:50',font=f(63),fill='white',stroke_width=1,stroke_fill='#183327')
d.text((1167,143),'Thứ Ba, 27 tháng 10, 2026',font=f(18),fill='white')
def round_box(box,radius,fill,outline=(235,197,93,190),wid=2):d.rounded_rectangle(box,radius=radius,fill=fill,outline=outline,width=wid)
round_box((1450,80,1504,136),15,(0,46,34,220));round_box((1518,80,1572,136),15,(0,46,34,220))
for fname,x in [('wifi',1460),('settings',1528)]:
 a=Image.open(p/'assets/icons'/f'{fname}.png').convert('RGBA');a.thumbnail((34,34));lay.alpha_composite(a,(x,90))
for idx,x in enumerate([70,318]):
 round_box((x,552,x+227,806),28,(1,37,28,221))
 d.text((x+20,571),'Ứng dụng' if idx==0 else 'Kết nối',font=f(25,True),fill='white')
 d.text((x+194,565),'›',font=f(38),fill='#F5D36D')
 names=['youtube','eshare','playstore','plus'] if idx==0 else ['hdmi','miracast','cast','usb']
 for i,n in enumerate(names):
  xx=x+20+(i%2)*91;yy=615+(i//2)*66
  round_box((xx,yy,xx+81,yy+58),14,(0,25,22,185),outline=(190,208,191,70),wid=1)
  a=Image.open(p/'assets/icons'/f'{n}.png').convert('RGBA').resize((48,48));lay.alpha_composite(a,(xx+16,yy+5))
 d.text((x+20,760),'▦  Chạm / OK để mở rộng' if idx==0 else '◈  HDMI · Cast · USB',font=f(13),fill='#CFE3D3')
# volume
a=(1543,330,1620,658)
round_box(a,39,(0,33,27,217));a=Image.open(p/'assets/icons'/'speaker.png').convert('RGBA').resize((41,41));lay.alpha_composite(a,(1561,344))
round_box((1580,398,1592,562),6,(255,255,255,70),outline=(210,210,210,90),wid=1)
round_box((1580,453,1592,562),6,(244,203,90,255),outline=(250,216,102,255),wid=1)
d.ellipse((1575,446,1597,468),fill=(244,203,90,255))
d.text((1565,567),'68%',font=f(16,True),fill='#F8DA76');d.text((1568,604),'▣',font=f(29),fill='white')
# Footer partner belt
round_box((0,837,1672,941),2,(0,20,16,171),outline=(220,192,100,90),wid=1)
d.text((76,876),'✦ ĐỐI TÁC TIÊU BIỂU',font=f(17,True),fill='#F7D978')
d.line((278,860,278,917),fill='#C7A856',width=1)
logos=['fish','wana','solavie','mcoffee','wazzer','zizipop','fish','wana','solavie']
for i,n in enumerate(logos):
 x=305+155*i
 if x>1672:break
 a=Image.open(p/'assets/partners'/f'{n}.png').convert('RGBA');a.thumbnail((128,64));lay.alpha_composite(a,(x+(135-a.width)//2,858+(65-a.height)//2))
out=Image.alpha_composite(im,lay).convert('RGB');out.save(p/'preview'/'AsiaFB_ReactNative_Layout_Reference.jpg',quality=91,optimize=True)
print('saved',out.size)
