/* deck-tools.js — the two rigs that used to live inside the hand-rolled deck
   engine, ported to deck-stage. Nothing here runs unless you ask for it.

     ?export   dump every slide's laid-out geometry as JSON, so
               workbench/export-pptx-native.py can rebuild the deck with real,
               editable PowerPoint text boxes instead of flat slide images.
     ?audit    overflow self-check. Prints a per-slide report and replaces the
               page with it. A slide whose content exceeds 1920x1080 is a bug.

   Port notes: the old engine kept exactly one slide in the DOM flow at a time
   (.on) and measured at 1600x900. deck-stage lays every <section> out at its
   design size, so the add/remove of .on is gone and the canvas comes from the
   host attributes. Presenter notes now come from #speaker-notes, not a hidden
   .notesrc block inside each slide.
   ponytail: the audit is the smallest thing that fails if a layout breaks. */
(function () {
  'use strict';
  var host = document.querySelector('deck-stage');
  if (!host) return;
  var W = parseInt(host.getAttribute('design-width'), 10) || 1920;
  var H = parseInt(host.getAttribute('design-height'), 10) || 1080;
  var cards = [].slice.call(host.querySelectorAll(':scope > section'));
  var NOTES = [];
  try {
    var tag = document.getElementById('speaker-notes');
    if (tag) NOTES = JSON.parse(tag.textContent) || [];
  } catch (e) { NOTES = []; }
  // Sibling of speaker-notes: array of {index, script}, same keying. Optional —
  // a deck with no narration script carries no #slide-scripts tag at all.
  var SCRIPTS = [];
  try {
    var scriptsTag = document.getElementById('slide-scripts');
    if (scriptsTag) SCRIPTS = JSON.parse(scriptsTag.textContent) || [];
  } catch (e) { SCRIPTS = []; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* border-radius is resolved against the box, so "50%" and "999px" both mean
     "as round as it goes" — but only one of them is a circle. */
  function radiusPx(el, rect) {
    var raw = getComputedStyle(el).borderTopLeftRadius;
    var v = parseFloat(raw) || 0;
    return raw.indexOf('%') > -1 ? Math.min(rect.width, rect.height) * v / 100 : v;
  }
  function isOval(el) {
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    return radiusPx(el, rect) * 2 >= Math.min(rect.width, rect.height) - 1 &&
           Math.abs(rect.width - rect.height) < 2;
  }
  function isPill(el) {
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    return !isOval(el) && radiusPx(el, rect) * 2 >= Math.min(rect.width, rect.height) - 1;
  }

  function dumpLayout() {
    var PX = W, PY = H;
    /* Port fix: deck-stage hides inactive slides with visibility:hidden. Boxes
       still measure, but innerText is layout-aware and returns '' inside a
       hidden subtree — so 30 of 31 slides dumped their geometry with no text.
       Reveal every slide for the duration of the dump. */
    var freeze = document.createElement('style');
    freeze.textContent =
      '*, *::before, *::after { animation: none !important; transition: none !important; }' +
      'deck-stage > section { visibility: visible !important; opacity: 1 !important; }';
    document.head.appendChild(freeze);
    var out = cards.map(function (slide, idx) {
      
      var base = slide.getBoundingClientRect();
      var items = [];
      var add = function (type, el, extra) {
        var r = el.getBoundingClientRect();
        // A rule is a border on a box that may itself be flat: the underline
        // under a word is an absolutely positioned span with no height at all.
        if (r.width < 1 || (r.height < 1 && type !== 'rule')) return;
        var cs = getComputedStyle(el);
        items.push(Object.assign({
          type: type,
          x: (r.left - base.left) / base.width * PX,
          y: (r.top - base.top) / base.height * PY,
          w: r.width / base.width * PX,
          h: r.height / base.height * PY,
          size: parseFloat(cs.fontSize),
          weight: parseInt(cs.fontWeight, 10) || 400,
          colour: cs.color,
          italic: cs.fontStyle === 'italic',
          caps: cs.textTransform === 'uppercase',
          align: cs.textAlign,
          font: cs.fontFamily,
          strike: (cs.textDecorationLine || '').includes('line-through'),
          pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat),
          bullet: el.tagName === 'LI'
        }, extra || {}));
      };
      slide.querySelectorAll('*').forEach(function (el) {
        if (el.closest('svg') || el.closest('.notesrc')) return;
        var cs = getComputedStyle(el);
        var bg = cs.backgroundColor;
        var bt = parseFloat(cs.borderTopWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0;
        var bl = parseFloat(cs.borderLeftWidth) || 0, br = parseFloat(cs.borderRightWidth) || 0;
        var filled = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
        var boxed = bt && bb && bl && br;
        if (!filled && !bt && !bb && !bl) return;
        if (boxed || filled) {
          add('box', el, { fill: filled ? bg : null, border: boxed ? cs.borderTopColor : null,
                           borderW: bt, radius: parseFloat(cs.borderTopLeftRadius) || 0,
                           /* clip-path has no PowerPoint equivalent, so the deck
                              names the AutoShape that carries the same silhouette */
                           shape: el.dataset.pptxShape || null,
                           notch: +(el.dataset.pptxNotch || 0),
                           /* border-radius has no PowerPoint equivalent either: a
                              circle and a pill are two different AutoShapes and
                              both arrived as rounded rectangles. */
                           oval: isOval(el), pill: isPill(el),
                           rotate: +(el.dataset.pptxRotate || 0) });
        }
        if (!boxed && bt) add('rule', el, { border: cs.borderTopColor, borderW: bt, edge: 'top' });
        if (!boxed && bb) add('rule', el, { border: cs.borderBottomColor, borderW: bb, edge: 'bottom',
                                            morphName: el.dataset.pptxSplit
                                              ? '!!' + el.dataset.pptxSplit : null });
        if (!boxed && bl && !bt) add('rule', el, { border: cs.borderLeftColor, borderW: bl, edge: 'left' });
      });
      slide.querySelectorAll('svg, img').forEach(function (el) {
        var extra = el.tagName === 'IMG' ? { src: el.getAttribute('src') } : { svg: el.outerHTML };
        extra.brand = (el.closest('[data-pptx-brand]') || {}).dataset
          ? el.closest('[data-pptx-brand]').dataset.pptxBrand : null;
        add(el.tagName === 'IMG' ? 'img' : 'svg', el, extra);
      });
      var inline = function (el) { return getComputedStyle(el).display.startsWith('inline'); };
      var runsOf = function (el) {
        var runs = [];
        var walk = function (node, style) {
          node.childNodes.forEach(function (child) {
            if (child.nodeType === 3) {
              var t = child.textContent.replace(/\s+/g, ' ');
              if (t.trim()) runs.push(Object.assign({ text: t }, style));
            } else if (child.tagName === 'BR') {
              runs.push(Object.assign({ text: '\n' }, style));
            } else if (child.nodeType === 1) {
              if (child.dataset && child.dataset.pptxSplit) return;   // its own shape
              var cs2 = getComputedStyle(child);
              walk(child, { colour: cs2.color, weight: parseInt(cs2.fontWeight, 10) || 400,
                            italic: cs2.fontStyle === 'italic', font: cs2.fontFamily,
                            /* the accent is a background-gradient underline; it has
                               no computed property the exporter can read, so the
                               deck names the colour it drew */
                            underline: child.dataset.pptxUnderline || null,
                            strike: (cs2.textDecorationLine || '').includes('line-through') });
            }
          });
        };
        var cs0 = getComputedStyle(el);
        walk(el, { colour: cs0.color, weight: parseInt(cs0.fontWeight, 10) || 400,
                   italic: cs0.fontStyle === 'italic', font: cs0.fontFamily,
                   strike: (cs0.textDecorationLine || '').includes('line-through') });
        return runs.filter(function (r) { return r.text.trim() || r.text === '\n'; });
      };
      /* Split shapes first, so the parent below has already lost their words. The
         name travels with them: PowerPoint matches shapes for a morph by name, and
         a name beginning !! forces the match even when the text differs. */
      slide.querySelectorAll('[data-pptx-split]').forEach(function (el) {
        var t = (el.innerText || '').trim();
        if (!t) return;
        add('text', el, { text: t, runs: runsOf(el), rotate: 0,
                          morphName: '!!' + el.dataset.pptxSplit });
      });
      /* The brand mark's words. Its span also holds the diamond, and the text
         dumper skips anything containing an svg, so the wordmark never reached
         the file. It is dumped here, and the diamond stays its own picture. */
      slide.querySelectorAll('[data-pptx-brand="mark"]').forEach(function (el) {
        var t = (el.innerText || '').trim();
        if (!t) return;
        add('text', el, { text: t, runs: runsOf(el), rotate: 0, brand: 'mark' });
      });
      /* A CSS counter is not in the DOM, so innerText misses it and the number
         never reaches PowerPoint. An agenda page loses 01..0n; worse, a
         references list loses the numbers every <sup class="cite"> on every
         other slide points at, so the citations aim at nothing. The value
         cannot be read back either — getComputedStyle returns the unresolved
         counter() expression, not the digit — so it is recomputed here from the
         item's position and its list's origin. Same bargain as
         data-pptx-underline above: CSS drew something it left nowhere readable,
         and the deck hands it over rather than letting the exporter guess. */
      var counterText = function (el) {
        var spec = getComputedStyle(el, '::before').content;
        if (!spec || spec.indexOf('counter(') === -1) return '';
        var m = spec.match(/counter\(\s*([\w-]+)\s*(?:,\s*([\w-]+))?\s*\)/);
        var parent = el.parentElement;
        if (!m || !parent) return '';
        var name = m[1], style = m[2] || 'decimal';
        var origin = 0;
        var rm = (getComputedStyle(parent).counterReset || '')
                   .match(new RegExp('\\b' + name + '\\s+(-?\\d+)'));
        if (rm) origin = parseInt(rm[1], 10);
        var n = origin, kids = parent.children;
        for (var i = 0; i < kids.length; i++) {
          if (new RegExp('\\b' + name + '\\b')
                .test(getComputedStyle(kids[i]).counterIncrement || '')) n += 1;
          if (kids[i] === el) break;
        }
        var num = (style === 'decimal-leading-zero' && n < 10) ? '0' + n : String(n);
        /* Whatever literal the rule sets beside the counter — counter(r) ".  "
           gives the full stop the reference list is read by. */
        var lit = (spec.match(/"([^"]*)"/g) || [])
                    .map(function (q) { return q.slice(1, -1); }).join('');
        return (num + lit).replace(/\s+$/, '') + ' ';
      };

      slide.querySelectorAll('*').forEach(function (el) {
        if (el.closest('svg') || el.closest('.notesrc') || inline(el) || el.querySelector('svg, img')) return;
        if (el.dataset.pptxSplit || el.dataset.pptxBrand === 'mark') return;
        var text = (counterText(el) + (el.innerText || '')).trim();
        if (!text) return;
        if (el.querySelector('[data-pptx-split]')) {
          // Its words now belong to the split shapes. What is left is whatever
          // was not split; if that is nothing, the block itself is not exported,
          // or the sentence appears twice and the copies overlap.
          var kept = runsOf(el).map(function (r) { return r.text; }).join('').trim();
          if (!kept) return;
          add('text', el, { text: kept, runs: runsOf(el), rotate: 0 });
          return;
        }
        if ([].some.call(el.children, function (c) { return !inline(c) && (c.innerText || '').trim(); })) {
          /* Mixed content — a block child (the .ref line) plus loose text and inline <b>/<em>.
             Measuring each loose TEXT NODE separately, as the original dumper did, splits a
             sentence around its bold runs and the fragments then overlap in PowerPoint. Group
             the contiguous non-block children instead: one Range across the whole group gives
             one correctly-sized box, and runsOf preserves the bold and italic runs inside it. */
          var group = [];
          var flush = function () {
            if (!group.length) return;
            var range = document.createRange();
            range.setStartBefore(group[0]);
            range.setEndAfter(group[group.length - 1]);
            var r = range.getBoundingClientRect();
            var txt = group.map(function (n) { return n.textContent; }).join('').replace(/\s+/g, ' ').trim();
            if (txt && r.width >= 1 && r.height >= 1) {
              var cs = getComputedStyle(el);
              var runs = [];
              group.forEach(function (n) {
                if (n.nodeType === 3) {
                  var t = n.textContent.replace(/\s+/g, ' ');
                  if (t.trim()) runs.push({ text: t, colour: cs.color,
                                            weight: parseInt(cs.fontWeight, 10) || 400,
                                            italic: cs.fontStyle === 'italic',
                                            font: cs.fontFamily });
                } else {
                  runsOf(n).forEach(function (r2) { runs.push(r2); });
                }
              });
              items.push({
                type: 'text', text: txt, runs: runs,
                x: (r.left - base.left) / base.width * PX, y: (r.top - base.top) / base.height * PY,
                w: r.width / base.width * PX, h: r.height / base.height * PY,
                size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight, 10) || 400,
                colour: cs.color, italic: false, caps: cs.textTransform === 'uppercase',
                align: cs.textAlign
              });
            }
            group = [];
          };
          [].forEach.call(el.childNodes, function (node) {
            var isBlock = node.nodeType === 1 && !inline(node);
            if (isBlock) { flush(); return; }
            if (node.nodeType === 3 && !node.textContent.trim() && !group.length) return;
            group.push(node);
          });
          flush();
          return;
        }
        add('text', el, { text: text, runs: runsOf(el),
                          brand: el.dataset.pptxBrand || null,
                          rotate: +(el.dataset.pptxRotate || 0) });
      });
      
      /* canvas + per-slide background travel with the dump so the exporter does
         not have to hardcode either. This deck is 1920x1080 and its slides run
         three different surfaces; the old one was 1600x900 and uniformly dark. */
      /* A state and a hidden slide both still dump their geometry. The exporter
         decides what to do with them: a hidden slide becomes a hidden PowerPoint
         slide rather than a missing one, and a state becomes its own slide with
         a Morph transition. */
      return { index: idx + 1, canvas: { w: PX, h: PY },
               branding: !document.documentElement.classList.contains('deck-nobrand'),
               bg: getComputedStyle(slide).backgroundColor,
               hidden: slide.hasAttribute('data-hidden-src') || slide.hasAttribute('data-hidden'),
               state: slide.getAttribute('data-state-group') || '',
               items: items, note: (NOTES[idx] || {}).note || '',
               script: (SCRIPTS[idx] || {}).script || '' };
    });
    freeze.remove();
    var tag = document.createElement('script');
    tag.type = 'application/json';
    tag.id = 'layout';
    tag.textContent = JSON.stringify(out);
    document.body.appendChild(tag);
  }

  if (location.search.indexOf('export') > -1) dumpLayout();

  /* ── Overflow self-check ────────────────────────────────────────────────
     Two distinct failures, both silent in a screenshot:
       OVERFLOW  an element's box extends past the slide edge
       squashed  content is taller than a CLIPPING box, so it is really hidden
                 (a tight line-height on an overflow:visible element is not a
                 defect — it spills and is still legible, so it is not flagged)
       FOOTER    content sits on top of the footer line, where the brand mark,
                 the slide note and the page number live. It reads as a clash on
                 screen and it hides attribution in a screenshot.
     Any one of them is a defect. None shows up as an error. ── */
  if (location.search.indexOf('audit') > -1) {
    var out = [], bad = 0;
    cards.forEach(function (c, k) {
      var box = c.getBoundingClientRect();
      var maxB = 0, maxR = 0, culprit = '';
      [].forEach.call(c.querySelectorAll('*'), function (el) {
        var r = el.getBoundingClientRect();
        if (!r.height && !r.width) return;
        // Decoration that is placed absolutely and takes no pointer events is
        // meant to bleed off the edge, and the slide clips it. Measuring its
        // unclipped box reports an overflow that nobody can see. The same
        // exemption the footer check already makes, made here.
        var cs = getComputedStyle(el);
        if (cs.position === 'absolute' && cs.pointerEvents === 'none') return;
        var b = r.bottom - box.top, rr = r.right - box.left;
        if (b > maxB) { maxB = b; culprit = el.tagName.toLowerCase() + '.' + (el.className || '?'); }
        if (rr > maxR) maxR = rr;
        var ov = getComputedStyle(el).overflow;
        if (ov !== 'visible' && el.scrollHeight - el.clientHeight > 1 && el.clientHeight > 0) {
          bad++;
          out.push('   ! squashed ' + el.tagName.toLowerCase() + '.' + el.className +
                   ' content=' + el.scrollHeight + ' box=' + el.clientHeight);
        }
      });
      /* Nothing may cross into the footer band. The footer is the one strip of
         every slide the reader is trained to look at, so a chart label or a
         stray line landing there is a defect even though it is inside the
         slide. Absolutely-positioned art is exempt: it is meant to run behind. */
      var ft = c.querySelector('.ft');
      if (ft) {
        var ftTop = ft.getBoundingClientRect().top;
        [].forEach.call(c.querySelectorAll('*'), function (el) {
          if (ft.contains(el) || el === ft) return;
          if (getComputedStyle(el).position === 'absolute') return;
          if (el.children.length) return;                 // only leaf boxes
          var r = el.getBoundingClientRect();
          if (!r.height || !r.width) return;
          // Crossing IN is the defect: the box starts above the band and ends
          // inside it. A box that begins inside the band is footer furniture,
          // put there on purpose. A deck whose footer is a row of cells has only
          // one of them marked .ft, and the siblings beside it are not faults.
          if (r.bottom > ftTop + 1 && r.top < ftTop - 1) {
            bad++;
            out.push('   ! FOOTER clash ' + el.tagName.toLowerCase() + '.' +
                     (el.className || '?') + ' bottom=' + Math.round(r.bottom) +
                     ' footer-top=' + Math.round(ftTop));
          }
        });
      }

      /* getBoundingClientRect is post-scale; normalise back to design pixels */
      var scale = box.width / W || 1;
      maxB = Math.round(maxB / scale); maxR = Math.round(maxR / scale);
      var over = Math.max(maxB - H, maxR - W);
      if (over > 1) bad++;
      out.push(pad2(k + 1) + ' ' + (over > 1 ? 'OVERFLOW +' + over + 'px' : 'ok   ') +
               '  bottom=' + maxB + '/' + H + '  right=' + maxR + '/' + W +
               '  [' + (c.getAttribute('data-screen-label') || '') + ']' +
               (over > 1 ? '  <- ' + culprit : ''));
    });
    out.push('', bad ? bad + ' PROBLEM(S)' : 'all ' + cards.length + ' slides clean');
    var report = out.join('\n');
    console.log(report);
    document.body.innerHTML = '<pre style="font:14px/1.5 ui-monospace,Menlo,monospace;' +
      'padding:32px;white-space:pre-wrap;background:#111;color:#eee;min-height:100vh"></pre>';
    document.body.firstChild.textContent = report;
  }
})();
