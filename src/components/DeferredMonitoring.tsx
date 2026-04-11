import { useEffect, useState, type ComponentType } from "react";

type MonitoringComponents = {
  Analytics: ComponentType;
  SpeedInsights: ComponentType;
};

const DeferredMonitoring = () => {
  const [components, setComponents] = useState<MonitoringComponents | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void Promise.all([
        import("@vercel/analytics/react"),
        import("@vercel/speed-insights/react"),
      ]).then(([analyticsModule, speedInsightsModule]) => {
        if (cancelled) return;

        setComponents({
          Analytics: analyticsModule.Analytics,
          SpeedInsights: speedInsightsModule.SpeedInsights,
        });
      });
    }, 1_500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!components) return null;

  const { Analytics, SpeedInsights } = components;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default DeferredMonitoring;
