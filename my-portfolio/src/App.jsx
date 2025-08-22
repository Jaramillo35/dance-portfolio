import { useEffect, useMemo, useState } from "react";
import logoImage from "./assets/logo.png";

/** Auto-import all images from src/assets/website */
function useGalleryImages() {
  // Load images from any subfolder inside src/assets
  const modules = import.meta.glob(
    "/src/assets/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
    { eager: true }
  );

  const images = Object.entries(modules)
    .map(([path, mod]) => {
      const segments = path.split("/");
      const name = segments.pop();
      const folder = segments.pop();
      // @ts-ignore - with eager:true, default is the URL
      const url = mod.default || mod;
      return { name, url, collection: folder || "Portfolio" };
    })
    .filter(item => !item.url.includes('logo.png')) // Filter out logo from gallery
    .sort((a, b) => a.name.localeCompare(a.name, undefined, { numeric: true }));

  return images;
}

function Lightbox({ items, index, onClose, onPrev, onNext }) {
  if (index === null) return null;
  const item = items[index];
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
        aria-label="Close"
      >
        ×
      </button>
      <div className="w-full max-w-[95vw]">
        <img
          src={item.url}
          alt={item.name?.replace(/\.[^.]+$/, "") || "Photo"}
          className="w-full h-auto max-h-[85vh] object-contain rounded-xl border border-neutral-800"
        />
        <div className="mt-3 flex items-center justify-between text-neutral-300">
          <button
            onClick={onPrev}
            className="px-3 py-1 rounded-lg border border-neutral-700 hover:text-white"
          >
            Prev
          </button>
          <div className="text-xs uppercase tracking-widest">
            {index + 1}/{items.length}
          </div>
          <button
            onClick={onNext}
            className="px-3 py-1 rounded-lg border border-neutral-700 hover:text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const items = useGalleryImages(); // [{name, url}, ...]
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [chessMode, setChessMode] = useState(false);
  // Generate a random seed for tile sizing on each page load
  const [randomSeed] = useState(() => Math.floor(Math.random() * 10000));
  
  const collections = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.collection))).sort();
    // Only hide the "website" collection if there are others to choose from
    if (unique.length > 1) {
      return unique.filter((c) => c?.toLowerCase() !== "website");
    }
    return unique; // keep as-is if it's the only one
  }, [items]);

  const showFilters = collections.length > 1;
  const [activeCollection, setActiveCollection] = useState("");
  useEffect(() => {
    if (showFilters && collections.length && !collections.includes(activeCollection)) {
      setActiveCollection("dance1"); // Default to dance1
    }
    if (!showFilters) {
      setActiveCollection(""); // show all when there aren't multiple collections
    }
  }, [collections, activeCollection, showFilters]);

  const visibleItems = useMemo(() => {
    if (!showFilters || !activeCollection) return items; // show all
    return items.filter((it) => it.collection === activeCollection);
  }, [items, activeCollection, showFilters]);

  // Determine current column count to compute chessboard parity when chess mode is on
  const [columns, setColumns] = useState(2);
  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(4);
      else if (width >= 768) setColumns(3);
      else setColumns(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const open = (i) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setLightboxIndex((i) => (i + 1) % items.length);

  return (
    <div className="min-h-screen font-sans">
      {/* Sidebar + Mobile Header */}
      <div className="relative">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-center glass rounded-b-2xl">
            <div className="text-neutral-400 text-sm uppercase tracking-widest">
              Portfolio
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col justify-between px-6 py-8 border-r border-white/10 bg-neutral-950/60 backdrop-blur">
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <img 
                src={logoImage}
                alt="Martín Jaramillo" 
                className="w-full h-auto"
              />
            </div>
            <nav className="flex-1 flex flex-col justify-center gap-8 text-neutral-300 text-lg">
              <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
          <div className="text-sm text-neutral-400">
            Birmingham, Michigan
          </div>
        </aside>
      </div>

      {/* Main */}
      <main className="lg:ml-64">
      {/* Optional Hero (hidden on desktop to mimic reference) */}
      <section id="home" className="mx-auto max-w-7xl px-6 py-8 lg:hidden">
        <div className="text-center mb-8">
          <img 
            src={logoImage}
            alt="Martín Jaramillo" 
            className="w-full h-auto mx-auto mb-4"
          />
          <h1 className="font-serif text-3xl">Dance Photography Portfolio</h1>
        </div>
      </section>

      {/* Gallery */}
      <section id="portfolio" className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex items-end justify-between mb-4">
          <div className="text-sm text-neutral-500">{visibleItems.length} images</div>
        </div>

        {/* Collection filters */}
        <div className="mb-6 flex flex-wrap gap-2 items-center justify-center">
          {collections.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCollection(c)}
              className={
                (activeCollection === c ? "chip chip--active" : "chip")
              }
            >
              {c}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div className="text-neutral-400">No images found.</div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1">
              {visibleItems.map((it, i) => {
                const row = Math.floor(i / columns);
                const col = i % columns;
                const gray = (row + col) % 2 === 1;
                
                // Random tile sizing based on seed + index for different layout each time
                let tileClass = "aspect-square";
                let spanClass = "";
                
                // Use seeded random to determine tile size
                const randomValue = (randomSeed + i * 7) % 100; // Different pattern each load
                
                if (randomValue < 15 && columns >= 3) {
                  // 15% chance for 2x2 (large)
                  tileClass = "aspect-square";
                  spanClass = "md:col-span-2 md:row-span-2";
                } else if (randomValue < 30 && columns >= 3) {
                  // 15% chance for 2x1 (wide)
                  tileClass = "aspect-[2/1]";
                  spanClass = "md:col-span-2";
                } else if (randomValue < 45 && columns >= 3) {
                  // 15% chance for 1x2 (tall)
                  tileClass = "aspect-[1/2]";
                  spanClass = "md:row-span-2";
                }
                // 55% chance for 1x1 (small) - default
                
                return (
                  <button
                    key={it.url}
                    className={`group text-left w-full ${spanClass}`}
                    onClick={() => open(items.indexOf(it))}
                    title={it.name}
                  >
                    <div className={`${tileClass} overflow-hidden rounded-md`}>
                      <img
                        src={it.url}
                        alt={it.name?.replace(/\.[^.]+$/, "") || "Photo"}
                        className={(gray ? "grayscale " : "saturate-125 ") + "w-full h-full object-cover transition duration-300 group-hover:opacity-90 group-hover:scale-[1.03] ring-1 ring-white/10"}
                        loading="lazy"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="font-serif text-2xl mb-4">About</h2>
        <div className="text-neutral-300 max-w-3xl leading-relaxed space-y-4">
          <p>
            I am Martín Jaramillo, 29, Mexican, based in Birmingham, Michigan. A
            Mechanical and Electrical Engineer by training, I have worked across
            automotive, prototyping, and AI projects. Photography is how I connect
            those worlds—precision and experimentation—into images.
          </p>
          <p>
            My focus is dance, cars, and people. In dance, I look for emotion and
            narrative—strength and vulnerability, discipline and liberation.
            Influenced by literature and art (think Dostoyevsky’s atmosphere), I
            aim for images that feel like scenes from a story.
          </p>
          <p>
            Tools: Sony A7 IV and A6400; Sigma 24–70mm, Sony 20mm G, and a 20mm
            prime for dynamic wide shots. Comfortable on location or in studio.
            I also bring a background in 3D printing and CNC to build custom
            displays or sets when needed.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-neutral-900 py-10 text-neutral-500">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>© {new Date().getFullYear()} Martín Jaramillo • Birmingham, Michigan</div>
            <div className="flex gap-3">
              <a className="underline hover:text-white" href="mailto:martinjaramilloqv@gmail.com">Email</a>
              <a className="underline hover:text-white" href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
      </main>

      <Lightbox
        items={items}
        index={lightboxIndex}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
}