"use client";

import Image from "next/image";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export interface AvatarUser {
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
}

function getInitials(user?: AvatarUser | null): string {
  const name = user?.displayName?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return (user?.email?.[0] || "?").toUpperCase();
}

export interface AvatarProps {
  user?: AvatarUser | null;
  size?: number;
  alt?: string;
  className?: string;
}

export default function Avatar({ user, size = 40, alt, className = "" }: AvatarProps) {
  return (
    <span
      className={twMerge(
        clsx(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 font-syne font-bold text-accent",
          className,
        ),
      )}
      style={{ width: size, height: size }}
      aria-label={alt || user?.displayName || "User avatar"}
    >
      {user?.photoURL ? (
        <Image
          src={user.photoURL}
          alt={alt || user.displayName || "User avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        getInitials(user)
      )}
    </span>
  );
}

export { getInitials };
