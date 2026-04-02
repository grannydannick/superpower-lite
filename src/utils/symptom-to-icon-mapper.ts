import {
  Activity,
  Battery,
  Bed,
  Bone,
  Brain,
  Droplets,
  Eye,
  Flame,
  Frown,
  Heart,
  HeartPulse,
  Moon,
  Scale,
  Snowflake,
  Sun,
  Thermometer,
  Torus,
  Wind,
  Zap,
} from 'lucide-react';

const SYMPTOM_ICON_MAP: Record<string, any> = {
  low_energy: Battery,
  fatigue: Battery,
  tiredness: Battery,
  exhaustion: Battery,
  slower_fat_loss: Scale,
  weight_gain: Scale,
  weight_loss: Scale,
  coldness: Snowflake,
  cold_sensitivity: Snowflake,
  cold_hands: Snowflake,
  muscle_aches: Zap,
  muscle_pain: Zap,
  joint_pain: Zap,
  cramps: Zap,
  low_mood: Frown,
  depression: Frown,
  anxiety: Frown,
  irritability: Frown,
  mood_swings: Frown,
  bone_weakness: Bone,
  bone_loss: Bone,
  fractures: Bone,
  bloating: Torus,
  poor_digestion: Torus,
  gut_issues: Torus,
  constipation: Torus,
  nausea: Torus,
  brain_fog: Brain,
  poor_concentration: Brain,
  memory_issues: Brain,
  cognitive_decline: Brain,
  poor_sleep: Moon,
  insomnia: Moon,
  sleep_disruption: Moon,
  difficulty_sleeping: Moon,
  waking_up_unrefreshed: Bed,
  headaches: HeartPulse,
  migraines: HeartPulse,
  dizziness: Activity,
  heart_palpitations: Heart,
  chest_tightness: Heart,
  high_blood_pressure: HeartPulse,
  shortness_of_breath: Wind,
  breathing_issues: Wind,
  dry_skin: Droplets,
  dehydration: Droplets,
  hair_loss: Droplets,
  brittle_nails: Droplets,
  inflammation: Flame,
  swelling: Flame,
  blurred_vision: Eye,
  eye_strain: Eye,
  sensitivity_to_light: Sun,
  night_sweats: Thermometer,
  hot_flashes: Thermometer,
  fever: Thermometer,
};

const FALLBACK_ICONS = [Activity, Heart, Sun, Droplets, Wind, Flame, Eye, Bed];

export const getSymptomIcon = (symptom: string) => {
  const key = symptom.toLowerCase().replace(/\s+/g, '_');
  if (SYMPTOM_ICON_MAP[key]) return SYMPTOM_ICON_MAP[key];

  // Use a consistent but diverse fallback based on the symptom string
  let hash = 0;
  for (let i = 0; i < symptom.length; i++) {
    hash = (hash << 5) - hash + symptom.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_ICONS[Math.abs(hash) % FALLBACK_ICONS.length];
};
