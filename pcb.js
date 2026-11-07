// PCB circuit traces — full-page, all tabs
(function(){
  var circuitLayer = document.createElement('div');
  circuitLayer.className = 'circuit-layer';
  document.body.appendChild(circuitLayer);

  var pcbColors = ['cyan', 'gold', 'violet', 'rose'];
  var pcbIdx = 0;

  function buildPcbTrace(){
    var color = pcbColors[pcbIdx % pcbColors.length];
    var thick = (pcbIdx % 3 === 0) ? ' pcb-thick' : (pcbIdx % 3 === 1 ? ' pcb-thin' : '');
    var cls = 'pcb-' + color + thick;

    // start position : anywhere on the page
    var pw = window.innerWidth;
    var ph = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    var startX = Math.random() * pw * 0.8;
    var startY = Math.random() * ph;
    var segs = [];
    var cx = startX, cy = startY;
    var numSegs = 2 + Math.floor(Math.random() * 2);

    for(var s = 0; s < numSegs; s++){
      if(s < numSegs - 1 && Math.random() > 0.5){
        var vlen = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 80);
        segs.push({type:'v', len:vlen, x:cx, y:cy});
        cy += vlen;
      }
      var hlen = 50 + Math.random() * 150;
      segs.push({type:'h', len:hlen, x:cx, y:cy});
      cx += hlen;
    }

    var segDelay = 0;
    segs.forEach(function(seg){
      var el = document.createElement('div');
      el.className = 'pcb-seg ' + (seg.type === 'h' ? 'pcb-h ' : 'pcb-v ') + cls;
      el.style.left = seg.x + 'px';
      el.style.top = seg.y + 'px';
      if(seg.type === 'h'){
        el.style.width = seg.len + 'px';
        el.style.animation = 'pcbDraw 0.5s ease forwards';
      } else {
        el.style.height = Math.abs(seg.len) + 'px';
        if(seg.len < 0) el.style.top = (seg.y + seg.len) + 'px';
        el.style.animation = 'pcbDrawV 0.5s ease forwards';
      }
      el.style.animationDelay = segDelay + 's';
      el._traceId = pcbIdx;
      circuitLayer.appendChild(el);
      segDelay += 0.15;
    });

    [{x:startX, y:startY}, {x:cx, y:cy}].forEach(function(n, ni){
      var node = document.createElement('div');
      node.className = 'pcb-node ' + color;
      node.style.left = n.x + 'px';
      node.style.top = n.y + 'px';
      var sz = 5 + Math.random() * 4;
      node.style.width = sz + 'px';
      node.style.height = sz + 'px';
      node.style.animation = 'nodePop 0.4s ease forwards';
      node.style.animationDelay = (ni === 0 ? 0 : segDelay) + 's';
      node._traceId = pcbIdx;
      circuitLayer.appendChild(node);
    });

    var myEls = [];
    circuitLayer.querySelectorAll('.pcb-seg, .pcb-node').forEach(function(el){
      if(el._traceId === pcbIdx) myEls.push(el);
    });
    setTimeout(function(){
      myEls.forEach(function(el){
        el.style.animation = 'none';
        el.style.opacity = el.classList.contains('pcb-node') ? '1' : '0.6';
      });
      requestAnimationFrame(function(){
        myEls.forEach(function(el){
          el.style.transition = 'opacity 1.5s ease';
        });
        requestAnimationFrame(function(){
          myEls.forEach(function(el){
            el.style.opacity = '0';
          });
        });
      });
      setTimeout(function(){ myEls.forEach(function(el){ el.remove(); }); }, 1600);
    }, (segDelay + 1.5) * 1000);

    pcbIdx++;
  }

  function schedulePcb(){
    var delay = 800 + Math.random() * 1600;
    setTimeout(function(){
      buildPcbTrace();
      if(Math.random() > 0.3) setTimeout(buildPcbTrace, 200 + Math.random() * 400);
      if(Math.random() > 0.7) setTimeout(buildPcbTrace, 500 + Math.random() * 600);
      schedulePcb();
    }, delay);
  }
  setTimeout(schedulePcb, 1000);
  buildPcbTrace();
})();
