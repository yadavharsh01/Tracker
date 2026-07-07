import { Footprints, Flame, Calendar, Hourglass, FileCheck2, Trophy, BookMarked, Crown, Star, Medal } from "lucide-react";

const ICONS = {
  first_session: Footprints,
  week_streak: Flame,
  month_streak: Calendar,
  century_hours: Hourglass,
  first_mock: FileCheck2,
  mock_veteran: Trophy,
  first_topic_mastered: BookMarked,
  section_specialist: Crown,
  level_5: Star,
  level_10: Medal,
};

export default function BadgeIcon({ id, size = 18, className = "" }) {
  const Icon = ICONS[id] || Star;
  return <Icon size={size} className={className} />;
}
