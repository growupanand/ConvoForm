"use client";

import { QueryComponent } from "@/components/queryComponents/queryComponent";
import { api } from "@/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@convoform/ui";

export function UserStats() {
  const userCountQuery = api.users.getTotalCount.useQuery();
  const recentUsersQuery = api.users.getRecentUsers.useQuery();

  const loadingSkeleton = (
    <div className="flex max-lg:flex-col items-center justify-center lg:gap-2 animate-pulse">
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white"
          />
        ))}
      </div>
      <span className="text-base">
        <span className="font-bold ">
          <span className="inline-block h-4 w-8 bg-gray-200 rounded" /> users
        </span>{" "}
        are boosting conversions by <span className="font-bold ">3x</span> with
        <span className="font-bold ">ConvoForm</span>
      </span>
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
            <div className="flex max-lg:flex-col items-center justify-center lg:gap-2">
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {recentUsers?.map((user) => (
                  <Avatar
                    key={user.id}
                    className="border-2 border-white h-6 w-6"
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
              <span className="text-base">
                <span className="font-bold ">{userCount}+ users</span> are
                boosting conversions by <span className="font-bold ">3x</span>{" "}
                with <span className="font-bold ">ConvoForm</span>
              </span>
            </div>
          )}
        </QueryComponent>
      )}
    </QueryComponent>
  );
}
