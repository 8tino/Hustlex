// ═══════════════════════════════════════════════════════
// SORTABLE · Drag-to-reorder for vertical lists.
//   Touch + mouse via Pointer Events. Reorders the DOM live and
//   reports the new id order so the caller can persist it.
//   Usage:
//     const list = div('sortlist');          // flex column container
//     items.forEach(it => {
//       const row = div('row');
//       row.dataset.sortid = it.id;           // stable id (string)
//       row.appendChild(dragHandle());        // the grip you drag
//       …
//       list.appendChild(row);
//     });
//     parent.appendChild(list);
//     makeSortable(list, ids => { /* persist new order */ });
// ═══════════════════════════════════════════════════════

// The grip you press to drag a row. Put it inside the row.
function dragHandle() {
  const g = document.createElement('span');
  g.className = 'drag-handle';
  g.textContent = '⠿';
  g.title = 'Zum Verschieben ziehen';
  // Tapping the grip must never trigger the row's own click (e.g. toggling
  // a task done). Swallow the click that follows a press on the handle.
  g.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); });
  return g;
}

function makeSortable(list, onDrop) {
  const rowsOf = () => Array.prototype.filter.call(list.children, c => c.hasAttribute('data-sortid'));
  // The app's scroll container — so a drag can auto-scroll long ("ewig lange") lists.
  const scroller = (typeof el === 'function' && el('content')) || document.scrollingElement || document.documentElement;

  list.querySelectorAll('.drag-handle').forEach(handle => {
    const row = handle.closest('[data-sortid]');
    if (!row || row.parentElement !== list) return;
    handle.style.touchAction = 'none';

    handle.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      let moved = false;
      let lastY = e.clientY;
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      row.classList.add('dragging');
      haptic('light');

      // Reorder purely from the other rows' vertical midpoints, so the row can
      // jump to ANY position in one drag (top, bottom, several rows at once) —
      // not just one slot down.
      const reorder = y => {
        const others = rowsOf().filter(r => r !== row);
        let ref = null; // insert the dragged row before this one
        for (const s of others) {
          const b = s.getBoundingClientRect();
          if (y < b.top + b.height / 2) { ref = s; break; }
        }
        if (ref) {
          if (row.nextElementSibling !== ref) { list.insertBefore(row, ref); moved = true; }
        } else if (list.lastElementChild !== row) {
          list.appendChild(row); moved = true;
        }
      };

      // Auto-scroll when the finger nears the top/bottom edge of the viewport,
      // then keep reordering so you can reach far-away positions in one motion.
      let raf = 0;
      const tick = () => {
        const sb = scroller.getBoundingClientRect ? scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight };
        const top = sb.top != null ? sb.top : 0;
        const bottom = sb.bottom != null ? sb.bottom : innerHeight;
        const EDGE = 70;
        let dy = 0;
        if (lastY < top + EDGE) dy = -Math.min(16, (top + EDGE - lastY) / 3);
        else if (lastY > bottom - EDGE) dy = Math.min(16, (lastY - (bottom - EDGE)) / 3);
        if (dy) { scroller.scrollTop += dy; reorder(lastY); }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onMove = ev => {
        ev.preventDefault();
        lastY = ev.clientY;
        reorder(lastY);
      };

      const done = () => {
        cancelAnimationFrame(raf);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', done);
        handle.removeEventListener('pointercancel', done);
        try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        row.classList.remove('dragging');
        if (moved && typeof onDrop === 'function') {
          onDrop(rowsOf().map(c => c.getAttribute('data-sortid')));
        }
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', done);
      handle.addEventListener('pointercancel', done);
    });
  });
}

// Reorder an array of {id,…} objects to match an array of id strings
// (ids come back from makeSortable as strings). Items not in `ids`
// keep their original relative order at the end.
function applyOrder(arr, ids) {
  const pos = {};
  ids.forEach((id, i) => { pos[id] = i; });
  return arr.slice().sort((a, b) => {
    const pa = pos[String(a.id)], pb = pos[String(b.id)];
    if (pa === undefined && pb === undefined) return 0;
    if (pa === undefined) return 1;
    if (pb === undefined) return -1;
    return pa - pb;
  });
}
