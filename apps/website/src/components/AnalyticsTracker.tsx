import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../utils/analytics";
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (GA_MEASUREMENT_ID) trackPageView(location.pathname);
  }, [location]);

  return null;
}
