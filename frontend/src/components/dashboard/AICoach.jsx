import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { getInsights } from "../../lib/api";

export default function AICoach() {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInsights();
      setAdvice(res.data.advice);
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't reach the AI coach. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">AI weak-area coach</h3>
      </div>

      {!advice && !error && (
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-4">
          Get a few specific, data-backed suggestions on what to focus on next, based
          on your mock test and topic history.
        </p>
      )}

      {advice && (
        <p className="text-sm leading-relaxed text-ink-900/85 dark:text-paper-50/85 mb-4 whitespace-pre-line">
          {advice}
        </p>
      )}

      {error && <p className="text-sm text-danger-500 font-medium mb-4">{error}</p>}

      <Button onClick={fetchAdvice} loading={loading} variant={advice ? "secondary" : "primary"}>
        {advice ? (
          <>
            <RefreshCw size={16} /> Refresh advice
          </>
        ) : (
          <>
            <Sparkles size={16} /> Get advice
          </>
        )}
      </Button>
    </Card>
  );
}
