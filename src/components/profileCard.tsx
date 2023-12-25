import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "next-auth";

type Props = {
  user: Omit<User, "id">;
};

const ProfileCard = ({ user }: Props) => {
  return (
    <div className="flex justify-start gap-2 items-start ps-4">
      <Avatar>
        <AvatarImage src={user?.image!} alt="@shadcn" />
        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col  items-center text-sm font-medium text-muted-foreground">
        <div className="whitespace-nowrap capitalize">{user.name}</div>
        <div className="whitespace-nowrap text-xs">({user.email})</div>
      </div>
    </div>
  );
};

export default ProfileCard;
