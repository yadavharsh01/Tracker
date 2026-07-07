import { useState } from "react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { addSession } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function SessionForm({ onSessionAdded }) {
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const validate = () => {
    const next = {};
    if (!subject.trim()) next.subject = "Tell us what you studied";
    const durationNum = Number(duration);
    if (!duration || Number.isNaN(durationNum) || durationNum <= 0) {
      next.duration = "Enter a positive number of minutes";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await addSession({ subject: subject.trim(), duration: Number(duration) });
      notify("Session logged. Nice work.");
      setSubject("");
      setDuration("");
      setErrors({});
      onSessionAdded?.();
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't log that session. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display font-semibold text-base mb-4">Log a study session</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="subject"
          label="Subject"
          placeholder="e.g. Quant — Arithmetic"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
        />
        <Input
          id="duration"
          label="Duration (minutes)"
          type="number"
          min="1"
          placeholder="45"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          error={errors.duration}
        />
        <Button type="submit" loading={submitting}>
          Add session
        </Button>
      </form>
    </Card>
  );
}
