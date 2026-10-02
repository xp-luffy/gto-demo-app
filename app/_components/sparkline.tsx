export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  const points = values.length > 1 ? values : [0, ...values];
  const maximum = Math.max(...points, 1);
  const coordinates = points.map((value, index) => `${(index / (points.length - 1)) * 100},${32 - (value / maximum) * 27}`).join(" ");
  return <svg className={`sparkline ${className}`} viewBox="0 0 100 36" preserveAspectRatio="none" role="img" aria-label="Recent sales trend"><polyline points={coordinates} /></svg>;
}
