(function initManicoDefaults(root) {
  'use strict';

  const Core = root.ManicoCore;
  const Store = root.ManicoStorage;
  if (!Core || !Store) throw new Error('Manico defaults require core and storage');

  const VERSION = '5.2.0';
  const DEFAULT_FRETS = 12;

  // Version is exposed by the core object and read by the application at startup.
  Core.VERSION = VERSION;

  // Included exercises start in the accompaniment-friendly 0-12 range.
  const createDemoTrack = Core.createDemoTrack.bind(Core);
  Core.createDemoTrack = function createTwelveFretDemo(definition, tuning = '4') {
    const track = createDemoTrack(definition, tuning);
    track.settings = { ...track.settings, frets: DEFAULT_FRETS };
    const open = Core.TUNINGS[track.settings.tuning || tuning]?.open || Core.TUNINGS['4'].open;
    track.events = Core.optimiseFingering(track.events || [], open, DEFAULT_FRETS);
    return track;
  };

  // The importer still builds a transient track object internally. Normalize only
  // genuinely new tracks before their first IndexedDB write; existing 15/18/24-fret
  // projects keep the user's selected range.
  const save = Store.save.bind(Store);
  Store.save = async function saveWithTwelveFretDefault(track) {
    const isNewTrack = track
      && !track.demo
      && Number(track.createdAt) > 0
      && Number(track.createdAt) === Number(track.updatedAt)
      && Number(track.settings?.frets) === 15;

    if (isNewTrack) {
      track.settings = { ...track.settings, frets: DEFAULT_FRETS };
      const open = Core.TUNINGS[track.settings.tuning || '4']?.open || Core.TUNINGS['4'].open;
      track.events = Core.optimiseFingering(track.events || [], open, DEFAULT_FRETS);
    }
    return save(track);
  };

  if (typeof document === 'undefined' || !document.head) return;

  // A restrained finish: warm maple, lighter metal and cleaner note markers.
  const style = document.createElement('style');
  style.id = 'manico-fretboard-finish-512';
  style.textContent = `
    .instrument-stage {
      background: linear-gradient(180deg, rgba(248, 231, 205, .035), rgba(0, 0, 0, .18));
      border-color: rgba(239, 216, 181, .08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .035), 0 12px 34px rgba(0, 0, 0, .16);
    }
    #fretboard stop[stop-color="#efd4a1"] { stop-color: #efd7aa; }
    #fretboard stop[stop-color="#dfbd82"] { stop-color: #d9b77d; }
    #fretboard stop[stop-color="#c9985b"] { stop-color: #bd874f; }
    #fretboard stop[stop-color="#6f6a62"] { stop-color: #5d5953; }
    #fretboard stop[stop-color="#f1ede5"] { stop-color: #f7f2e9; }
    #fretboard stop[stop-color="#756f67"] { stop-color: #68625b; }
    #fretboard [fill="#f8f4ea"] { fill: #f3eee6; }
    #fretboard [stroke="#96764f"] { stroke: #856b52; }
    #fretboard [stroke="#b59b78"] { stroke: #c4ad8e; }
    #fretboard [stroke="#8c6e4b"] { stroke: #72563e; }
    #fretboard [stroke="#fff7e8"] { stroke: #fff8ec; }
    #fretboard [stroke="#6f4d2f"] { stroke: #5f422d; }
    #fretboard [fill="#8f7045"] { fill: #7d5d38; opacity: .55; }
    #fretboard .string-label { fill: #3a3026; font-size: 22px; filter: none; }
    #fretboard .fret-number { fill: #5f554a; font-size: 17px; font-weight: 750; }
    #fretboard .neck-marker { filter: drop-shadow(0 3px 5px rgba(38, 25, 15, .24)); }
    #fretboard .neck-marker.current { filter: url(#noteGlow) drop-shadow(0 4px 7px rgba(38, 25, 15, .30)); }
    #fretboard .marker-note {
      font-size: 15px;
      letter-spacing: -.02em;
      paint-order: stroke;
      stroke: rgba(255, 255, 255, .22);
      stroke-width: .8px;
    }
    #fretboard .marker-order { font-size: 11px; }
    @media (max-width: 760px) {
      .instrument-stage { width: 820px; min-width: 820px; }
      #fretboard { width: 800px; min-width: 800px; }
    }
  `;
  document.head.appendChild(style);
})(globalThis);
