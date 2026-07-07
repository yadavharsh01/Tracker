import { useLocation } from "react-router-dom";

/**
 * Wraps route content with a subtle fade-up on navigation. Keying on the
 * pathname forces React to remount the wrapper (and re-trigger the CSS
 * animation) on every route change, without needing an animation library.
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
