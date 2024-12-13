"use client";

import {
  NavbarItem,
  Button,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function HeaderAuth() {
  const session = useSession();

  let authContent: React.ReactNode;
  if (session.status === "loading") {
    authContent = null;
  } else if (session.data?.user) {
    authContent = (
      <Popover placement="left">
        <PopoverTrigger>
          <Avatar src={session.data.user.image || ""} />
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-4">
            <form action={() => {}}>
              <Button type="submit">Sign Out</Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    );
  } else {
    authContent = (
      <>
        <NavbarItem>
          <Button
            onClick={() => signIn()}
            type="submit"
            color="secondary"
            variant="bordered"
          >
            Sign In
          </Button>
        </NavbarItem>

        <NavbarItem>
          <Button
            onClick={() => signOut()}
            type="submit"
            color="primary"
            variant="flat"
          >
            Sign Up
          </Button>
        </NavbarItem>
      </>
    );
  }

  return authContent;
}
