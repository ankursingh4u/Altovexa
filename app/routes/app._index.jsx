import { useNavigate, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getBillingStateCached } from "../billing.server";
import { getUsage } from "../usage.server";
import { entitled } from "../plans.server";
import db from "../db.server";
import {
  Page,
  Layout,
  Card,
  Button,
  Badge,
  Text,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import UsageMeter from "../components/UsageMeter";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let plan = null;
  try {
    plan = (await getBillingStateCached(admin, session.shop)).plan;
  } catch (e) {
    if (e instanceof Response) throw e; // let re-auth propagate
  }

  let usage = { imagesUsed: 0 };
  let autoOptimize = false;
  try {
    usage = await getUsage(session.shop);
    const settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
    autoOptimize = settings?.autoOptimize ?? false;
  } catch { /* usage/settings tables not ready — defaults */ }

  return {
    plan: {
      name: plan?.name || "Free",
      tier: plan?.tier || "free",
      monthlyImages: plan?.monthlyImages ?? 100,
      altText: entitled(plan, "altText"),
      pageSpeed: entitled(plan, "pageSpeed"),
      autoOptimizeAllowed: entitled(plan, "autoOptimize"),
    },
    usage,
    autoOptimize,
  };
};

export default function Index() {
  const navigate = useNavigate();
  const { plan, usage, autoOptimize } = useLoaderData();

  const quota = plan.monthlyImages || 0;
  const used = usage?.imagesUsed || 0;
  const remaining = Math.max(0, quota - used);
  const fmt = (n) => Number(n).toLocaleString();

  const autoStatus = !plan.autoOptimizeAllowed
    ? { label: "Growth & up", tone: "attention" }
    : autoOptimize
      ? { label: "On", tone: "success" }
      : { label: "Off", tone: undefined };

  // Tool tiles — a 2-up grid of self-contained cards, each with its own status
  // chip and action, so availability is readable without opening the page.
  const tools = [
    {
      icon: "◈",
      title: "Image Optimizer",
      desc: "Compress & convert product images to WebP — up to 70% smaller, originals replaced safely.",
      cta: "Open optimizer",
      onClick: () => navigate("/app/productoptimization"),
      available: true,
      chip: { label: "Included", tone: "on" },
    },
    {
      icon: "✦",
      title: "AI Alt Text",
      desc: "Generate SEO alt text for every image with AI vision, then bulk-apply in one click.",
      cta: plan.altText ? "Generate alt text" : "Upgrade to Starter",
      onClick: () => navigate(plan.altText ? "/app/alttextsuggestions" : "/app/billing"),
      available: plan.altText,
      chip: plan.altText
        ? { label: "Included", tone: "on" }
        : { label: "Starter & up", tone: "attention" },
    },
    {
      icon: "⟳",
      title: "Auto-optimize new products",
      desc: "Set & forget — every newly created product gets optimized automatically in the background.",
      cta: plan.autoOptimizeAllowed ? "Manage" : "Upgrade to Growth",
      onClick: () => navigate(plan.autoOptimizeAllowed ? "/app/productoptimization" : "/app/billing"),
      available: plan.autoOptimizeAllowed,
      chip: !plan.autoOptimizeAllowed
        ? { label: "Growth & up", tone: "attention" }
        : autoOptimize
          ? { label: "On", tone: "on" }
          : { label: "Off", tone: "off" },
    },
    {
      icon: "▦",
      title: "Page Speed Reports",
      desc: "Track Core Web Vitals (LCP, CLS, TBT) and see before/after gains per product page.",
      cta: plan.pageSpeed ? "View reports" : "Upgrade to Growth",
      onClick: () => navigate(plan.pageSpeed ? "/app/pagespeedimpactreports" : "/app/billing"),
      available: plan.pageSpeed,
      chip: plan.pageSpeed
        ? { label: "Included", tone: "on" }
        : { label: "Growth & up", tone: "attention" },
    },
  ];

  // Numeric metrics get the big tabular figure; word values get a pill so long
  // labels like "Growth & up" can't wrap into an overlapping headline.
  const metrics = [
    { label: "Current plan", value: plan.name, pill: "brand" },
    { label: "Images used", value: fmt(used) },
    { label: "Images left", value: fmt(remaining) },
    { label: "Auto-optimize", value: autoStatus.label, pill: autoStatus.tone || "subdued" },
  ];

  return (
    <Page>
      {/* Hero — ink panel with accent rail */}
      <div className="av-hero">
        <InlineStack align="space-between" blockAlign="center" wrap={false} gap="600">
          <BlockStack gap="300">
            <span className="av-hero-tag">Altovexa</span>
            <div className="av-hero-copy">
              <h1>Lighter images. Faster storefront.</h1>
              <p>Compress and convert your catalog, auto-generate SEO alt text, and track the page-speed gains — all from one place.</p>
            </div>
          </BlockStack>
          <Button variant="primary" size="large" onClick={() => navigate("/app/productoptimization")}>
            Optimize images
          </Button>
        </InlineStack>
      </div>

      <Layout>
        {/* Metric tiles */}
        <Layout.Section>
          <div className="av-metrics">
            {metrics.map((m) => (
              <div key={m.label} className="av-metric">
                <p className="av-metric-label">{m.label}</p>
                {m.pill ? (
                  <span className={`av-metric-pill av-metric-pill--${m.pill}`} title={m.value}>
                    {m.value}
                  </span>
                ) : (
                  <p className="av-metric-value">{m.value}</p>
                )}
              </div>
            ))}
          </div>
        </Layout.Section>

        {/* Monthly usage */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="headingSm" as="h2">Monthly image usage</Text>
                  <Badge tone={plan.tier === "free" ? undefined : "success"}>{`${plan.name} plan`}</Badge>
                </InlineStack>
                <Button variant="plain" onClick={() => navigate("/app/billing")}>Manage plan</Button>
              </InlineStack>
              <UsageMeter used={used} quota={quota} />
              <Text variant="bodySm" as="p" tone="subdued">
                {`${fmt(used)} of ${fmt(quota)} images this month · ${fmt(remaining)} remaining`}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Tool tiles */}
        <Layout.Section>
          <div className="av-tools">
            {tools.map((t) => (
              <div key={t.title} className={t.available ? "av-tool" : "av-tool is-locked"}>
                <div className="av-tool-head">
                  <span className="av-tool-icon" aria-hidden="true">{t.icon}</span>
                  <div>
                    <p className="av-tool-title">{t.title}</p>
                    <p className="av-tool-desc" style={{ marginTop: 6 }}>{t.desc}</p>
                  </div>
                </div>
                <div className="av-tool-foot">
                  <span className={`av-tool-chip av-tool-chip--${t.chip.tone}`}>{t.chip.label}</span>
                  <Button variant={t.available ? "primary" : "secondary"} onClick={t.onClick}>
                    {t.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
