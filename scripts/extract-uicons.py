"""Extract exact Flaticon Uicons outlines; requires fonttools and brotli.
Usage: python scripts/extract-uicons.py <official npm package .tgz>
Source: @flaticon/flaticon-uicons 3.3.1. Preserve public/icons/LICENSE.txt.
"""
import io,json,re,sys,tarfile
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
root=Path(__file__).resolve().parents[1]
selection={'Fries':'french-fries','CupSoda':'drink-alt','IceCreamBowl':'ice-cream','Burger':'hamburger','Percent':'badge-percent','ArrowRight':'arrow-small-right','ArrowUpRight':'arrow-up-right','Volume2':'volume','VolumeX':'volume-slash','X':'cross-small','Ticket':'ticket','RotateCcw':'rotate-left','Sparkles':'sparkles','ArrowUp':'arrow-up','Star':'star'}
paths={}
with tarfile.open(sys.argv[1]) as archive:
 for family,items,font_name in [('bold',selection,'uicons-bold-rounded-MQNABNC6.woff2'),('brands',{'Instagram':'instagram'},'uicons-brands-XJPKRNBN.woff2')]:
  css_name='package/css/bold/rounded.css' if family=='bold' else 'package/css/brands/all.css'
  css=archive.extractfile(css_name).read().decode()
  font=TTFont(io.BytesIO(archive.extractfile('package/css/'+font_name).read()))
  prefix='br' if family=='bold' else 'brands'
  glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); em=font['head'].unitsPerEm
  for export,name in items.items():
   match=re.search(r'\.fi-'+prefix+'-'+re.escape(name)+r':before\{content:"\\([a-fA-F0-9]+)"',css)
   if not match: raise ValueError('Missing icon '+name)
   glyph=glyphs[cmap[int(match.group(1),16)]]
   pen=SVGPathPen(glyphs); glyph.draw(TransformPen(pen,(24/em,0,0,-24/em,0,font['hhea'].ascent*24/em)))
   paths[export]=pen.getCommands()
   (root/'public/icons'/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="{paths[export]}"/></svg>')
 (root/'public/icons/LICENSE.txt').write_bytes(archive.extractfile('package/LICENSE').read())
(root/'lib/icon-paths.ts').write_text('// Exact Flaticon Uicons 3.3.1 outlines. Attribution: Flaticon. See public/icons/LICENSE.txt.\nexport const iconPaths = '+json.dumps(paths,indent=2)+' as const;\n')
print(f'Extracted {len(paths)} exact icon outlines.')

