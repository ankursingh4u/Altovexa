/**
 * Segmented usage meter.
 *
 * Replaces Polaris's continuous <ProgressBar> for quota display so the quota
 * reads as discrete capacity rather than a loading bar — 20 segments light up
 * proportionally, and the whole meter turns red once the quota is spent.
 *
 * Purely presentational: it takes the same numbers the old bar derived its
 * percentage from, so quota behaviour is unchanged.
 */
const SEGMENTS = 20;

export default function UsageMeter({ used = 0, quota = 0, segments = SEGMENTS }) {
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  // Any usage at all should light at least one segment, otherwise a merchant who
  // has optimized a handful of images sees an apparently empty meter.
  const filled = pct > 0 ? Math.max(1, Math.round((pct / 100) * segments)) : 0;
  const critical = quota > 0 && used >= quota;

  return (
    <div
      className={critical ? "av-meter is-critical" : "av-meter"}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct}% of the monthly image quota used`}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={i < filled ? "av-meter-seg is-on" : "av-meter-seg"} />
      ))}
    </div>
  );
}
