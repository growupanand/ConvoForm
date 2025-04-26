"use client";

import { api } from "@/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@convoform/ui";
import { Users } from "lucide-react";

export function UserStats() {
  const { data: userCount, isLoading: isCountLoading } =
    api.users.getTotalCount.useQuery();
  const { data: recentUsers, isLoading: isRecentUsersLoading } =
    api.users.getRecentUsers.useQuery();

  const isLoading = isCountLoading || isRecentUsersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-6 animate-pulse">
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-5 w-5 text-brand-500" />
        <span className="text-lg font-medium">
          <span className="font-bold text-brand-500">{userCount}</span> users
          and growing
        </span>
      </div>

      <div className="flex -space-x-2 overflow-hidden">
        {recentUsers?.map((user) => (
          <Avatar key={user.id} className="border-2 border-white h-8 w-8">
            {user.imageUrl ? (
              <AvatarImage
                src={user.imageUrl}
                alt={`${user.firstName || ""} ${user.lastName || ""}`}
              />
            ) : (
              <AvatarFallback>
                {user.firstName?.[0] || user.lastName?.[0] || "?"}
              </AvatarFallback>
            )}
          </Avatar>
        ))}
      </div>
    </div>
  );
}
