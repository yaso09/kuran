// media-player-full.js
// Tamamen sıfırdan yazıldı. Tek dosya — playlist oluşturur, tüm ayetleri
// tek bir uzun akış gibi oynatır, yatay progress bar, scroll + highlight.
// Gereksinimler: her <audio> öğesinde data-scroll-to="ID" veya audio parent verse içindeki arabic-text'e id verilmiş olmalı.

(function () {
  'use strict';

  /* ---------- Ayarlar ---------- */
  const HIGHLIGHT = '#00e1ffff';
  const NORMAL_COLOR = '#fff';
  const PLAYER_ID = 'mp-global-player';
  const PROGRESS_ID = 'mp-global-progress';
  const TITLE_ID = 'mp-global-title';

  /* ---------- State ---------- */
  let playlist = []; // { src, scrollTo, label, duration }
  let controller = new Audio();
  controller.preload = 'metadata';
  controller.crossOrigin = 'anonymous';
  let currentTrack = 0;
  let isPlaying = false;
  let durationsLoaded = false;
  let progressTimer = null;
  let lastHighlighted = null;

  /* ---------- Helpers ---------- */
  function q(sel, root = document) { return root.querySelector(sel); }
  function qq(sel, root = document) { return Array.from((root || document).querySelectorAll(sel)); }

  // Normalize path: if filename is 6 digits like 001001.mp3 -> /001/001.mp3 (relative to same base)
  function normalizePath(src) {
    try {
      const u = new URL(src, location.href);
      const filename = u.pathname.split('/').pop();
      const m = filename.match(/^(\d{6})\.mp3$/);
      if (m) {
        const num = m[1];
        const dir = num.slice(0, 3);
        const filePart = num.slice(3);
        const parts = u.pathname.split('/');
        parts.pop();
        const base = parts.join('/') || '';
        u.pathname = `${base}/${dir}/${filePart}.mp3`;
        return u.toString();
      }
      return src;
    } catch (e) {
      return src;
    }
  }

  function formatTime(s) {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  /* ---------- Playlist oluşturma ---------- */
  function buildPlaylistFromDOM() {
    const audios = qq('audio');
    // sort by data-index or id if present, else DOM order
    audios.sort((a, b) => {
      const ai = a.dataset.index ?? a.id ?? '';
      const bi = b.dataset.index ?? b.id ?? '';
      if (ai && bi && !isNaN(ai) && !isNaN(bi)) return Number(ai) - Number(bi);
      return 0;
    });

    playlist = audios.map(a => {
      const raw = a.querySelector('source')?.src || a.src || '';
      if (!raw) return null;
      const src = normalizePath(raw.trim());
      return {
        src,
        scrollTo: a.dataset.scrollTo || a.getAttribute('data-scroll-to') || null,
        label: a.dataset.label || a.title || src.split('/').pop(),
        duration: NaN
      };
    }).filter(Boolean);
    durationsLoaded = false;
    return playlist;
  }

  /* ---------- Duration preload (metadata) ---------- */
  async function loadDurations() {
    // loads durations by creating temporary Audio elements to read metadata
    const promises = playlist.map((item, i) => new Promise((resolve) => {
      const a = document.createElement('audio');
      a.preload = 'metadata';
      a.crossOrigin = 'anonymous';
      a.src = item.src;
      const onLoaded = () => {
        // if duration is Infinity or NaN, keep NaN
        item.duration = isFinite(a.duration) ? a.duration : NaN;
        cleanup();
      };
      const onError = () => {
        console.warn('metadata load failed for', item.src);
        item.duration = NaN;
        cleanup();
      };
      const cleanup = () => {
        a.removeEventListener('loadedmetadata', onLoaded);
        a.removeEventListener('error', onError);
        resolve();
      };
      a.addEventListener('loadedmetadata', onLoaded);
      a.addEventListener('error', onError);
      // in case cached and instant
      setTimeout(() => { if (isFinite(a.duration)) { item.duration = a.duration; cleanup(); } }, 300);
    }));
    await Promise.all(promises);
    // Replace NaN durations with 0 to avoid NaN math
    playlist.forEach(p => { if (!isFinite(p.duration)) p.duration = 0; });
    durationsLoaded = true;
  }

  /* ---------- Combined length ---------- */
  function totalDuration() {
    return playlist.reduce((s, it) => s + (isFinite(it.duration) ? it.duration : 0), 0);
  }

  function timeToTrackAndOffset(t) {
    // t in seconds from start of full surah -> return { index, offset }
    let acc = 0;
    for (let i = 0; i < playlist.length; i++) {
      const d = playlist[i].duration || 0;
      if (t < acc + d) return { index: i, offset: Math.max(0, t - acc) };
      acc += d;
    }
    // if t beyond end
    return { index: playlist.length - 1, offset: playlist[playlist.length - 1].duration || 0 };
  }

  function currentAbsoluteTime() {
    // compute elapsed time: durations before current + controller.currentTime
    const before = playlist.slice(0, currentTrack).reduce((s, it) => s + (it.duration || 0), 0);
    return before + (isFinite(controller.currentTime) ? controller.currentTime : 0);
  }

  /* ---------- UI oluşturma ---------- */
  function ensurePlayerUI() {
    if (document.getElementById(PLAYER_ID)) return;

    // container
    const bar = document.createElement('div');
    bar.id = PLAYER_ID;
    Object.assign(bar.style, {
      position: 'fixed',
      left: '12px',
      right: '12px',
      bottom: '12px',
      maxWidth: '980px',
      margin: '0 auto',
      padding: '10px 14px',
      borderRadius: '10px',
      background: 'linear-gradient(180deg,#0d0d0f,#080808)',
      color: '#eef2f5',
      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      display: 'none',
      zIndex: 99999,
      fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto",
      alignItems: 'center',
      gap: '12px',
      boxSizing: 'border-box'
    });

    // title
    const meta = document.createElement('div');
    meta.style.flex = '1';
    meta.style.minWidth = '0';
    const title = document.createElement('div');
    title.id = TITLE_ID;
    title.textContent = (typeof window.selectedSure !== 'undefined' && window.selectedSure) ? window.selectedSure : 'Çalma Listesi';
    Object.assign(title.style, {
      fontFamily: "'StackSansNotch', system-ui, sans-serif",
      fontWeight: '700',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    });
    meta.appendChild(title);

    // controls
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    controls.style.alignItems = 'center';

    const btnPrev = document.createElement('button');
    btnPrev.textContent = '⏮';
    const btnPlay = document.createElement('button');
    btnPlay.textContent = '▶';
    const btnNext = document.createElement('button');
    btnNext.textContent = '⏭';
    [btnPrev, btnPlay, btnNext].forEach(b => {
      Object.assign(b.style, {
        background: '#1b1b1d', border: '1px solid #333', color: '#eef2f5',
        padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', minWidth: '40px'
      });
    });

    controls.appendChild(btnPrev);
    controls.appendChild(btnPlay);
    controls.appendChild(btnNext);

    // progress & time
    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '10px';
    right.style.width = '340px';
    right.style.maxWidth = '40%';

    const timeText = document.createElement('div');
    timeText.id = 'mp-time';
    timeText.textContent = '0:00 / 0:00';
    timeText.style.fontSize = '12px';
    timeText.style.opacity = '0.9';
    timeText.style.minWidth = '80px';

    const progressWrap = document.createElement('div');
    Object.assign(progressWrap.style, {
      flex: '1', height: '8px', background: '#222', borderRadius: '999px', overflow: 'hidden', cursor: 'pointer'
    });
    const progressBar = document.createElement('div');
    progressBar.id = PROGRESS_ID;
    Object.assign(progressBar.style, {
      height: '100%', width: '0%', background: 'linear-gradient(90deg,#2a6bff,#6de0c3)'
    });
    progressWrap.appendChild(progressBar);

    right.appendChild(timeText);
    right.appendChild(progressWrap);

    // assemble
    bar.appendChild(meta);
    bar.appendChild(controls);
    bar.appendChild(right);
    document.body.appendChild(bar);

    // events
    btnPlay.addEventListener('click', () => {
      if (!isPlaying) startPlayback(); else pausePlayback();
    });
    btnPrev.addEventListener('click', () => seekToAbsolute(Math.max(0, currentAbsoluteTime() - 10))); // back 10s
    btnNext.addEventListener('click', () => seekToAbsolute(Math.min(totalDuration(), currentAbsoluteTime() + 10))); // forward 10s

    progressWrap.addEventListener('click', (ev) => {
      const rect = progressWrap.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      seekToAbsolute(pct * totalDuration());
    });
  }

  /* ---------- Playback control ---------- */
  async function startPlayback() {
    if (playlist.length === 0) {
      buildPlaylistFromDOM();
      if (playlist.length === 0) return console.warn('Hiç <audio> öğesi bulunamadı.');
      await loadDurations();
    } else if (!durationsLoaded) {
      await loadDurations();
    }

    ensurePlayerUI();
    q('#' + PLAYER_ID).style.display = 'flex';
    q('#' + PLAYER_ID + ' button:nth-child(2)')?.textContent; // no-op to avoid lint

    // if controller has no src or paused at start, set to current track and play
    if (!controller.src || controller.ended || (controller.paused && controller.currentTime === 0)) {
      playTrackAt(currentTrack, 0);
    } else {
      try { await controller.play(); } catch (e) { console.warn(e); }
    }
    isPlaying = true;
    startProgressTimer();
  }

  function pausePlayback() {
    controller.pause();
    isPlaying = false;
    stopProgressTimer();
    const playBtn = q('#' + PLAYER_ID + ' button:nth-child(2)');
    if (playBtn) playBtn.textContent = '▶';
  }

  function stopPlaybackComplete() {
    controller.pause();
    controller.currentTime = 0;
    isPlaying = false;
    stopProgressTimer();
    clearHighlight();
    q('#' + PLAYER_ID).style.display = 'none';
  }

  function playTrackAt(trackIndex, offsetSec) {
    if (!playlist[trackIndex]) return;
    currentTrack = trackIndex;
    controller.src = playlist[trackIndex].src;
    controller.currentTime = Math.max(0, offsetSec || 0);
    controller.play().catch(e => {
      // autoplay restriction: show message in console; UI play required
      console.warn('Playback failed (user interaction likely required):', e);
    });
    highlight(playlist[trackIndex].scrollTo);
    isPlaying = true;
    startProgressTimer();

    // Update play button text
    const playBtn = q('#' + PLAYER_ID + ' button:nth-child(2)');
    if (playBtn) playBtn.textContent = '⏸';
  }

  // When a single audio ends: move to next track automatically
  controller.addEventListener('ended', () => {
    clearHighlight(); // clear ended highlight (will be set for next)
    if (currentTrack < playlist.length - 1) {
      currentTrack++;
      playTrackAt(currentTrack, 0);
    } else {
      stopPlaybackComplete();
    }
  });

  // When metadata for controller loads, refresh time display
  controller.addEventListener('loadedmetadata', () => {
    // nothing special here; durations already loaded from preloads
  });

  /* ---------- progress timer ---------- */
  function startProgressTimer() {
    stopProgressTimer();
    updateProgressOnce();
    progressTimer = setInterval(updateProgressOnce, 200);
  }
  function stopProgressTimer() {
    if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
  }

  function updateProgressOnce() {
    const total = totalDuration();
    if (!isFinite(total) || total <= 0) {
      q('#' + PROGRESS_ID).style.width = '0%';
      q('#mp-time').textContent = '0:00 / 0:00';
      return;
    }
    const abs = currentAbsoluteTime();
    const pct = Math.max(0, Math.min(1, abs / total));
    q('#' + PROGRESS_ID).style.width = (pct * 100) + '%';
    q('#mp-time').textContent = `${formatTime(abs)} / ${formatTime(total)}`;

    // If controller time is near track end but 'ended' event sometimes late, handle switching:
    const currentTrackDuration = playlist[currentTrack]?.duration || 0;
    if (controller.duration && controller.duration > 0) {
      // nothing
    } else {
      // fallback: if abs >= total -> stop
      if (abs >= total) stopPlaybackComplete();
    }
  }

  /* ---------- seeking across combined timeline ---------- */
  function seekToAbsolute(timeSeconds) {
    if (!durationsLoaded) return;
    const { index: idx, offset } = timeToTrackAndOffset(timeSeconds);
    playTrackAt(idx, offset);
  }

  /* ---------- highlight/scroll ---------- */
  function highlight(id) {
    clearHighlight();
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    lastHighlighted = id;
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
    el.style.color = HIGHLIGHT;
  }
  function clearHighlight() {
    if (!lastHighlighted) return;
    const prev = document.getElementById(lastHighlighted);
    if (prev) prev.style.color = NORMAL_COLOR;
    lastHighlighted = null;
  }

  /* ---------- Mutation observer: yeni audio eklenirse playlist güncelle ---------- */
  const mo = new MutationObserver((muts) => {
    let found = false;
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType === 1 && (n.matches && n.matches('audio') || n.querySelector && n.querySelector('audio'))) {
          found = true; break;
        }
      }
      if (found) break;
    }
    if (found) {
      const prevIndex = playlist.length;
      buildPlaylistFromDOM();
      // reload durations for new items
      loadDurations().then(() => {
        // if we were playing and playlist was empty before, start
        if (isPlaying === false && playlist.length > 0 && prevIndex === 0) {
          // auto-start is optional; we won't start automatically to avoid autoplay surprises
        }
      });
    }
  });
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });

  /* ---------- Public API helpers ---------- */
  function buildPlaylist() {
    buildPlaylistFromDOM();
    return playlist;
  }

  /* ---------- Init on DOM ready ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    buildPlaylistFromDOM();
    ensurePlayerUI();
    // Preload durations in background (non-blocking)
    loadDurations().catch(err => console.warn('Duration preload failed', err));
    // Attach small helper to window for debugging / manual control
    window.mp = {
      buildPlaylist: buildPlaylistFromDOM,
      start: startPlayback,
      pause: pausePlayback,
      seekTo: seekToAbsolute,
      playlist
    };
  });

  /* ---------- expose some internal helpers ---------- */
  window.mp_buildPlaylist = buildPlaylistFromDOM;
  window.mp_start = startPlayback;
  window.mp_pause = pausePlayback;
  window.mp_seek = seekToAbsolute;

})();
