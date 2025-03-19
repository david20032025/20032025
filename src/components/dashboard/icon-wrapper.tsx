import { LucideIcon } from "lucide-react";

interface IconWrapperProps {
  icon: LucideIcon;
  className?: string;
}

export default function IconWrapper({
  icon: Icon,
  className = "",
}: IconWrapperProps) {
  return <Icon className={className} />;
}
