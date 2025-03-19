"use client";

import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserCircle className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/profile")}
            className="w-full justify-start"
          >
            Profile
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/settings")}
            className="w-full justify-start"
          >
            Settings
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            Sign out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
