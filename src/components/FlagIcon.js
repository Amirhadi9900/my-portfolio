const FLAG_BASE = 'https://flagcdn.com/w40';

export default function FlagIcon({ code, src, className = 'w-7 h-5' }) {
  const imageSrc = src ?? `${FLAG_BASE}/${code}.png`;

  return (
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      className={`${className} object-cover rounded-sm shadow-sm`}
      loading="lazy"
      width={28}
      height={20}
    />
  );
}
