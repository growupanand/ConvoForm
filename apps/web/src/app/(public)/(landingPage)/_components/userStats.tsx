"use client";

import { QueryComponent } from "@/components/queryComponents/queryComponent";
import { api } from "@/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@convoform/ui";
import { Users } from "lucide-react";

export function UserStats() {
  const userCountQuery = api.users.getTotalCount.useQuery();
  const recentUsersQuery = api.users.getRecentUsers.useQuery();

  const loadingSkeleton = (
    <div className="flex flex-col items-center justify-center mt-6 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-5 bg-gray-200 rounded" />
        <div className="h-6 w-40 bg-gray-200 rounded" />
      </div>
      <div className="flex -space-x-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            className="border-2 border-white h-8 w-8 rounded-full bg-gray-200"
          />
        ))}
      </div>
    </div>
  );

  return (
    <QueryComponent query={userCountQuery} loadingComponent={loadingSkeleton}>
      {(userCount) => (
        <QueryComponent
          query={recentUsersQuery}
          loadingComponent={loadingSkeleton}
        >
          {(recentUsers) => (
            <div className="flex flex-col items-center justify-center mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-brand-500" />
                <span className="text-lg font-medium">
                  <span className="font-bold text-brand-500">{userCount}</span>{" "}
                  users and growing
                </span>
              </div>

              <div className="flex -space-x-2 overflow-hidden">
                {recentUsers?.map((user) => (
                  <Avatar
                    key={user.id}
                    className="border-2 border-white h-8 w-8"
                  >
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
          )}
        </QueryComponent>
      )}
    </QueryComponent>
  );
}
