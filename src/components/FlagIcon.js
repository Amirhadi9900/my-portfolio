const FLAG_BASE = 'https://flagcdn.com/w40';

export default function FlagIcon({ code, src }) {
  const imageSrc = src ?? `${FLAG_BASE}/${code}.png`;

  return (
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      className="relative z-[1] w-8 h-6 object-cover rounded-sm shadow-sm"
      loading="lazy"
      width={32}
      height={24}
    />
  );
}
