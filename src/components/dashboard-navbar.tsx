"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  UserCircle,
  Home,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();

  return (
    <nav className="w-full border-b border-gray-100 bg-white py-4 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center space-x-4 ml-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex rounded-full hover:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex rounded-full hover:bg-gray-100"
          >
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex rounded-full hover:bg-gray-100"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
              >
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 rounded-lg shadow-lg border border-gray-100"
            >
              <DropdownMenuItem className="rounded-md py-2 px-3 hover:bg-gray-50 cursor-pointer">
                <Link href="/dashboard" className="w-full flex items-center">
                  <Home className="h-4 w-4 mr-2 text-gray-500" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md py-2 px-3 hover:bg-gray-50 cursor-pointer">
                <Link
                  href="/dashboard/profile"
                  className="w-full flex items-center"
                >
                  <UserCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md py-2 px-3 hover:bg-gray-50 cursor-pointer">
                <Link
                  href="/dashboard/settings"
                  className="w-full flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2 text-gray-500" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="rounded-md py-2 px-3 hover:bg-rose-50 hover:text-rose-600 cursor-pointer mt-1 border-t border-gray-100"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
