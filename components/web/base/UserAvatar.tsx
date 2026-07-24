import ROUTES from "@/constants/routes";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
}

const UserAvatar = ({
  userId,
  name,
  imageUrl,
  className = "h-9 w-9",
  fallbackClassName,
}: Props) => {
  const initials = name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <Link href={ROUTES.PROFILE(userId)}>
      <Avatar className={className}>
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={name} className="object-cover" />
        ) : (
          <AvatarFallback
            className={cn(
              "primary-gradient font-space-grotesk font-bold tracking-wider text-white",
              fallbackClassName
            )}
          >
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
    </Link>
  );
};

export default UserAvatar;
