export default function Marquee({ text }: { text: string }) {
  const items = new Array(8).fill(text);

  return (
    <div className="overflow-hidden border-y border-line/70 bg-carbon py-3">
      <div className="marquee-track animate-marquee">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="mx-4 whitespace-nowrap font-mono text-[11px] uppercase tracking-widest2 text-ash"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
