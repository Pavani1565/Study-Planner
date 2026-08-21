import React from 'react';
import {
  Sigma,
  Cpu,
  FlaskConical,
  Brain,
  BookOpen,
  Code,
  Atom,
  Calculator,
  Globe,
  Sparkles,
  Layers,
  FileText,
  Bookmark,
  Lightbulb,
  Music,
  Palette
} from 'lucide-react';

interface SubjectIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const ICON_MAP: Record<string, React.ElementType> = {
  Sigma,
  Cpu,
  FlaskConical,
  Brain,
  BookOpen,
  Code,
  Atom,
  Calculator,
  Globe,
  Sparkles,
  Layers,
  FileText,
  Bookmark,
  Lightbulb,
  Music,
  Palette
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const SubjectIcon: React.FC<SubjectIconProps> = ({ name, className = "w-5 h-5", size }) => {
  const IconComponent = ICON_MAP[name] || BookOpen;
  return <IconComponent className={className} size={size} />;
};
