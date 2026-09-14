interface SectionDividerProps {
  position: 'top' | 'bottom';
}

const COLORS = ['#F743EE', '#8B11D1', '#4BC6B9'];

const SectionDivider = ({ position }: SectionDividerProps) => {
  const line = (
    <div
      className="w-full h-[4px] animate-divider-flow"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, #F743EE 15%, #8B11D1 35%, #4BC6B9 55%, #F743EE 75%, #8B11D1 90%, transparent 100%)',
        backgroundSize: '200% 100%',
        boxShadow: '0 0 20px rgba(139,17,209,0.5)',
      }}
    />
  );

  const diamonds = (
    <div className={`flex gap-2 ${position === 'top' ? '-mt-[6px]' : 'mb-[-6px] z-10'}`}>
      {COLORS.map((color, i) => (
        <div
          key={color}
          className="w-2.5 h-2.5 rotate-45 rounded-[2px] shrink-0 animate-diamond-pulse"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 16px ${color}cc`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 flex flex-col items-center pointer-events-none`}
    >
      {position === 'top' ? (
        <>
          {line}
          {diamonds}
        </>
      ) : (
        <>
          {diamonds}
          {line}
        </>
      )}
    </div>
  );
};

export default SectionDivider;