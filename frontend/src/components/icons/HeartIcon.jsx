export default function HeartIcon({ size = 20, color = "#ff3b3b" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6c-1.5-1.7-4-1.9-5.7-.4L12 7.3 8.9 4.2C7.2 2.7 4.7 2.9 3.2 4.6c-1.7 1.9-1.6 4.8.3 6.6l8.1 7.9 8.1-7.9c1.9-1.8 2-4.7.1-6.6z"/>
    </svg>
  );
}