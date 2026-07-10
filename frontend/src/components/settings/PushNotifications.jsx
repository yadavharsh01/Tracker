import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useToast } from "../../context/ToastContext";
import { getPushPublicKey, subscribePush, unsubscribePush, testPush } from "../../lib/api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const SUPPORTED = "serviceWorker" in navigator && "PushManager" in window;

export default function PushNotifications() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (!SUPPORTED) {
      setLoading(false);
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(Boolean(sub)))
      .finally(() => setLoading(false));
  }, []);

  const enable = async () => {
    setWorking(true);
    try {
      const keyRes = await getPushPublicKey();
      const reg = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        notify("Notification permission was denied.", "error");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.data.publicKey),
      });

      await subscribePush(sub.toJSON());
      setSubscribed(true);
      notify("Notifications enabled.");
    } catch (err) {
      notify(
        err.response?.data?.msg || "Couldn't enable notifications on this server yet.",
        "error"
      );
    } finally {
      setWorking(false);
    }
  };

  const disable = async () => {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      notify("Notifications disabled.");
    } catch {
      notify("Couldn't disable notifications.", "error");
    } finally {
      setWorking(false);
    }
  };

  const sendTest = async () => {
    setWorking(true);
    try {
      await testPush();
      notify("Test notification sent — check your notifications.");
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't send a test notification.", "error");
    } finally {
      setWorking(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        {subscribed ? <Bell size={18} className="text-amber-500" /> : <BellOff size={18} className="text-amber-500" />}
        <h3 className="font-display font-semibold text-base">Push notifications</h3>
      </div>

      {!SUPPORTED ? (
        <p className="text-sm text-ink-900/50 dark:text-paper-50/50">
          Not supported in this browser.
        </p>
      ) : loading ? (
        <p className="text-sm text-ink-900/50 dark:text-paper-50/50">Loading…</p>
      ) : (
        <>
          <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-4">
            {subscribed
              ? "You'll get a reminder if you haven't logged a session by evening, so your streak doesn't slip."
              : "Turn on reminders so you don't lose your streak without noticing."}
          </p>
          <div className="flex items-center gap-2">
            {subscribed ? (
              <>
                <Button variant="secondary" onClick={sendTest} loading={working}>
                  Send test
                </Button>
                <Button variant="ghost" onClick={disable} loading={working}>
                  Turn off
                </Button>
              </>
            ) : (
              <Button onClick={enable} loading={working}>
                Turn on notifications
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
