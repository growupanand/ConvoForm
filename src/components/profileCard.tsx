"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useUser } from "./hooks/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import { signOut } from "next-auth/react";

const ProfileCard = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex justify-start gap-2 items-start ps-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex flex-col  items-center text-sm font-medium text-muted-foreground">
          <div className="whitespace-nowrap capitalize">
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="whitespace-nowrap text-xs">
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start gap-2 items-start ps-4">
      <Avatar>
        <AvatarImage src={user.image!} alt="user profile picture" />
        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col  items-center text-sm font-medium text-muted-foreground">
        <div className="whitespace-nowrap capitalize">{user.name}</div>
        <div className="whitespace-nowrap text-xs">({user.email})</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="link"
            size="icon"
            className="h-8 w-8 hover:no-underline"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => signOut()}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileCard;
