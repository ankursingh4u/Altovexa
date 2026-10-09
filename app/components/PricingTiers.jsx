import { PLAN_TIERS } from "../planCatalog";

// 4-tier pricing comparison used by both the standalone pricing page and the
// in-app pricing wall. Presentational only: every plan CTA is a real top-frame
// link (`target="_top"`) to Shopify's hosted managed-pricing page, where the
// actual price/cycle live and are picked. A direct anchor is used (rather than a
// form POST + reauthorize-header redirect) because a user click is a reliable
// user-activation that can navigate the top frame out of the embedded iframe —
// the POST-based redirect intermittently failed during initial setup and looped
// the merchant back to the app index.
//
// NOTE: we intentionally do NOT show prices here. Prices are owned by the
// Partner Dashboard plans and can be changed there without a code deploy;
// rendering them in-app would risk showing a stale amount. The merchant sees the
// real price on Shopify's pricing page after clicking through.
//
// Design: the recommended tier is an INVERTED ink card rather than a lifted
// white one, so the recommendation reads at a glance without shifting the grid's
// baseline (which made the lifted card's badge collide with the heading).
export default function PricingTiers({ pricingUrl }) {
  return (
    <div style={s.page}>
      <div style={s.inner}>
        <header style={s.head}>
          <span style={s.tag}>Altovexa</span>
          <h1 style={s.heading}>Pricing that scales with your catalog.</h1>
          <p style={s.subheading}>
            Compress images, lift your page speed, and rank higher — start free and
            move up whenever your catalog does.
          </p>
        </header>

        <div style={s.grid}>
          {PLAN_TIERS.map((tier) => {
            const hot = Boolean(tier.popular);
            return (
              <div key={tier.name} style={hot ? s.cardHot : s.card}>
                <div style={hot ? s.railHot : s.rail} />
                <div style={s.cardBody}>
                  <div style={s.tierRow}>
                    <p style={hot ? s.tierNameHot : s.tierName}>{tier.name}</p>
                    {hot && <span style={s.ribbon}>Recommended</span>}
                  </div>
                  <p style={hot ? s.taglineHot : s.tagline}>{tier.tagline}</p>

                  <div style={s.quotaBox(hot)}>
                    <span style={hot ? s.quotaNumHot : s.quotaNum}>{tier.images}</span>
                    <span style={hot ? s.quotaUnitHot : s.quotaUnit}>images / month</span>
                  </div>

                  <div style={s.featureList}>
                    {tier.features.map((f, i) => (
                      <div key={i} style={s.featureRow}>
                        <span style={hot ? s.markHot : s.mark} aria-hidden="true" />
                        <span style={hot ? s.featureTextHot : s.featureText}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={pricingUrl}
                    target="_top"
                    style={{
                      ...(hot ? s.ctaHot : s.cta),
                      display: "block",
                      textAlign: "center",
                      textDecoration: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    {tier.price === 0 ? "Start free" : "Choose plan"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p style={s.disclaimer}>Secure billing through Shopify · Change or cancel anytime</p>
      </div>
    </div>
  );
}

const INK = "#0a1f27";
const JADE = "#12b886";
const TEAL = "#0c8599";

const s = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(80% 60% at 14% 0%, rgba(18,184,134,0.10) 0%, rgba(18,184,134,0) 62%), linear-gradient(180deg, #f2fbf9 0%, #e4f3f3 100%)",
    display: "flex",
    justifyContent: "center",
    padding: "48px 24px 56px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
    boxSizing: "border-box",
  },
  inner: { width: "100%", maxWidth: 1120 },
  head: { maxWidth: 680, marginBottom: 32 },
  tag: {
    display: "inline-flex",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#066b55",
    background: "#e6faf4",
    border: "1px solid #b6e8d8",
    borderRadius: 6,
    padding: "5px 11px",
    marginBottom: 18,
  },
  heading: {
    fontSize: 38,
    fontWeight: 700,
    color: INK,
    margin: "0 0 10px 0",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
  },
  subheading: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "#5f7a79",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(234px, 1fr))",
    gap: 16,
    width: "100%",
    alignItems: "stretch",
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #dce9e6",
    boxShadow: "0 1px 2px rgba(10,31,39,0.05)",
  },
  cardHot: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "linear-gradient(150deg, #0a1f27 0%, #123240 58%, #0b6e80 100%)",
    borderRadius: 16,
    border: "1px solid #0b6e80",
    boxShadow: "0 22px 44px -22px rgba(9,86,104,0.6)",
  },
  rail: { height: 3, background: "#dce9e6" },
  railHot: { height: 3, background: "linear-gradient(90deg, #2ee6a8 0%, #12b886 100%)" },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "22px 20px 20px",
    flex: 1,
  },
  tierRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  tierName: { fontSize: 17, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.01em" },
  tierNameHot: { fontSize: 17, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" },
  ribbon: {
    fontSize: 9.5,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#04303a",
    background: "linear-gradient(135deg, #2ee6a8 0%, #12b886 100%)",
    borderRadius: 5,
    padding: "4px 8px",
    whiteSpace: "nowrap",
  },
  tagline: { fontSize: 12.5, color: "#5f7a79", margin: "-6px 0 0 0" },
  taglineHot: { fontSize: 12.5, color: "rgba(226,247,243,0.72)", margin: "-6px 0 0 0" },
  quotaBox: (hot) => ({
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "12px 14px",
    borderRadius: 11,
    background: hot ? "rgba(46,230,168,0.12)" : "#f2fbf9",
    border: hot ? "1px solid rgba(46,230,168,0.26)" : "1px solid #dcf3f7",
  }),
  quotaNum: { fontSize: 24, fontWeight: 700, color: TEAL, lineHeight: 1.1, letterSpacing: "-0.02em" },
  quotaNumHot: { fontSize: 24, fontWeight: 700, color: "#8ff0cf", lineHeight: 1.1, letterSpacing: "-0.02em" },
  quotaUnit: { fontSize: 11.5, color: "#5f7a79", fontWeight: 600 },
  quotaUnitHot: { fontSize: 11.5, color: "rgba(226,247,243,0.7)", fontWeight: 600 },
  featureList: { display: "flex", flexDirection: "column", gap: 9, flex: 1 },
  featureRow: { display: "flex", alignItems: "flex-start", gap: 9 },
  // A small jade diamond instead of a check glyph — quieter and on-brand.
  mark: {
    width: 7,
    height: 7,
    marginTop: 5,
    borderRadius: 2,
    background: JADE,
    transform: "rotate(45deg)",
    flexShrink: 0,
  },
  markHot: {
    width: 7,
    height: 7,
    marginTop: 5,
    borderRadius: 2,
    background: "#2ee6a8",
    transform: "rotate(45deg)",
    flexShrink: 0,
  },
  featureText: { fontSize: 12.5, color: "#33514f", lineHeight: "18px" },
  featureTextHot: { fontSize: 12.5, color: "rgba(226,247,243,0.85)", lineHeight: "18px" },
  cta: {
    width: "100%",
    padding: "11px 12px",
    background: "#ffffff",
    color: TEAL,
    border: "1px solid #b6e8d8",
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: 700,
  },
  ctaHot: {
    width: "100%",
    padding: "11px 12px",
    background: "linear-gradient(135deg, #2ee6a8 0%, #12b886 100%)",
    color: "#04303a",
    border: "1px solid #2ee6a8",
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: 700,
    boxShadow: "0 8px 20px -10px rgba(46,230,168,0.7)",
  },
  disclaimer: { fontSize: 12, color: "#5f7a79", marginTop: 28 },
};
