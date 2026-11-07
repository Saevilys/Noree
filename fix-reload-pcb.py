#!/usr/bin/env python3
"""Fix two things:
1. Rings: use performance.navigation.type to detect F5 (reload) → reset sessionStorage → grow again
2. PCB: use requestAnimationFrame instead of forced reflow to avoid opacity flash
"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SUB_PAGES = [
    'noree.html', 'bip.html', 'gouvernement.html',
    'population-terrienne.html', 'population-spatiale.html',
    'station-alpha.html', 'station-beta.html', 'station-gamma.html'
]
ALL_PAGES = ['index.html'] + SUB_PAGES

# === Fix 1: rings sessionStorage with reload detection ===

OLD_RINGS_JS = """if(sessionStorage.getItem('noreeRingsReady')){ ringsEl.classList.add('instant'); }
else { sessionStorage.setItem('noreeRingsReady','1'); }"""

NEW_RINGS_JS = """var navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
if(navEntry && navEntry.type === 'reload'){ sessionStorage.removeItem('noreeRingsReady'); }
if(sessionStorage.getItem('noreeRingsReady')){ ringsEl.classList.add('instant'); }
else { sessionStorage.setItem('noreeRingsReady','1'); }"""

# === Fix 2: PCB fade-out with requestAnimationFrame ===

OLD_PCB_FADE = """    setTimeout(function(){
      myEls.forEach(function(el){
        var compOpacity = window.getComputedStyle(el).opacity;
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.opacity = compOpacity;
        el.style.transition = 'opacity 1.5s ease';
        void el.offsetWidth;
        el.style.opacity = '0';
      });
      setTimeout(function(){ myEls.forEach(function(el){ el.remove(); }); }, 1600);
    }, (segDelay + 1.5) * 1000);"""

NEW_PCB_FADE = """    setTimeout(function(){
      myEls.forEach(function(el){
        var compOpacity = window.getComputedStyle(el).opacity;
        el.style.animation = 'none';
        el.style.opacity = compOpacity;
        requestAnimationFrame(function(){
          el.style.transition = 'opacity 1.5s ease';
          requestAnimationFrame(function(){
            el.style.opacity = '0';
          });
        });
      });
      setTimeout(function(){ myEls.forEach(function(el){ el.remove(); }); }, 1600);
    }, (segDelay + 1.5) * 1000);"""

for fname in ALL_PAGES:
    fpath = os.path.join(BASE, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = []
    
    if OLD_RINGS_JS in content:
        content = content.replace(OLD_RINGS_JS, NEW_RINGS_JS)
        changed.append('rings JS')
    
    if fname == 'index.html' and OLD_PCB_FADE in content:
        content = content.replace(OLD_PCB_FADE, NEW_PCB_FADE)
        changed.append('PCB fade')
    
    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'OK: {fname} ({", ".join(changed)})')
    else:
        print(f'SKIP: {fname} (no match)')

print('Done.')
