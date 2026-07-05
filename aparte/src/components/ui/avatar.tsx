import { avatarColors } from "@/lib/avatar";
import { initials as toInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  /** Force les couleurs (sinon dérivées du nom). */
  colors?: [string, string];
  size?: number;
  radius?: number;
  className?: string;
}

/** Avatar « initiales sur fond coloré » — couleur stable dérivée du nom. */
export function Avatar({ name, colors, size = 36, radius = 11, className }: AvatarProps) {
  const [bg, fg] = colors ?? avatarColors(name);
  return (
    <div
      className={cn("flex flex-none items-center justify-center font-extrabold", className)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        color: fg,
        fontSize: Math.round(size * 0.34),
      }}
    >
      {toInitials(name)}
    </div>
  );
}
