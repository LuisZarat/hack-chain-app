import { useEffect, useRef } from 'react';

const MOSAIC_IMAGES = Array.from({ length: 20 }, (_, i) => `/images/mosaic/mosaic-${i + 1}.webp`);

interface Tile {
  src: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
}

const buildUnit = (imgs: string[], rowStart: number, variant: 'A' | 'B'): Tile[] => {
  if (variant === 'A') {
    return [
      { src: imgs[0], colStart: 1, colSpan: 4, rowStart, rowSpan: 2 },
      { src: imgs[1], colStart: 5, colSpan: 4, rowStart, rowSpan: 1 },
      { src: imgs[2], colStart: 9, colSpan: 4, rowStart, rowSpan: 1 },
      { src: imgs[3], colStart: 5, colSpan: 5, rowStart: rowStart + 1, rowSpan: 1 },
      { src: imgs[4], colStart: 10, colSpan: 3, rowStart: rowStart + 1, rowSpan: 1 },
    ];
  }
  return [
    { src: imgs[0], colStart: 9, colSpan: 4, rowStart, rowSpan: 2 },
    { src: imgs[1], colStart: 1, colSpan: 4, rowStart, rowSpan: 1 },
    { src: imgs[2], colStart: 5, colSpan: 4, rowStart, rowSpan: 1 },
    { src: imgs[3], colStart: 1, colSpan: 3, rowStart: rowStart + 1, rowSpan: 1 },
    { src: imgs[4], colStart: 4, colSpan: 5, rowStart: rowStart + 1, rowSpan: 1 },
  ];
};

const GROUPS = [
  MOSAIC_IMAGES.slice(0, 5),
  MOSAIC_IMAGES.slice(5, 10),
  MOSAIC_IMAGES.slice(10, 15),
  MOSAIC_IMAGES.slice(15, 20),
];

const rotate = (arr: string[], by: number) => [...arr.slice(by), ...arr.slice(0, by)];

// Track is much taller than one viewport — as the page scrolls, we translate
// this tall strip upward so different photos scroll into view over time.
const UNIT_COUNT = 16;
const ALL_TILES: Tile[] = Array.from({ length: UNIT_COUNT }, (_, i) => {
  const group = GROUPS[i % GROUPS.length];
  const variant: 'A' | 'B' = i % 2 === 0 ? 'A' : 'B';
  const pass = Math.floor(i / GROUPS.length);
  const imgs = rotate(group, pass % 5);
  return buildUnit(imgs, i * 2 + 1, variant);
}).flat();

const EducationMosaicBackground = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // How much taller the track is than the viewport — that extra height
    // is the total distance we can pan through as the user scrolls.
    const getMaxOffset = () => Math.max(0, track.scrollHeight - window.innerHeight);

    const onScroll = () => {
      const pageMax = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pageMax > 0 ? window.scrollY / pageMax : 0;
      const maxOffset = getMaxOffset();
      const offset = progress * maxOffset;
      track.style.transform = `translateY(-${offset}px)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
      style={{ backgroundColor: '#180528' }}
    >
      <div
        ref={trackRef}
        className="absolute inset-x-0 top-0 grid grid-cols-12 opacity-[0.22] will-change-transform"
        style={{ gridTemplateRows: `repeat(${UNIT_COUNT * 2}, 18vh)` }}
      >
        {ALL_TILES.map((tile, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{
              gridColumn: `${tile.colStart} / span ${tile.colSpan}`,
              gridRow: `${tile.rowStart} / span ${tile.rowSpan}`,
            }}
          >
            <img
              src={tile.src}
              alt=""
              loading="lazy"
              className="absolute object-cover"
              style={{ inset: '-2px', width: 'calc(100% + 4px)', height: 'calc(100% + 4px)' }}
            />
          </div>
        ))}
      </div>

      {/* Dark scrim on top — keeps text legible while still letting the mosaic read as texture */}
      <div className="absolute inset-0 bg-[#180528]/45" />
    </div>
  );
};

export default EducationMosaicBackground;