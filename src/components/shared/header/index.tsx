import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/const";
import { Button } from "@/components/ui/button";
import { ShoppingCart, UserIcon } from "lucide-react";
import ModeToggle from "@/components/shared/header/mode-toggle";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className={"flex-start"}>
          <Link href={"/"} className={"flex-start"}>
            <Image
              priority={true}
              src="/images/logo.svg"
              alt="logo"
              width={48}
              height={48}
            />
            <span className={"hidden lg:block font-bold text-2xl ml-3"}>
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className={"space-x-2"}>
          <ModeToggle />
          <Button asChild variant={"ghost"}>
            <Link href={"/cart"}>
              <ShoppingCart /> Cart
            </Link>
          </Button>
          <Button asChild={true}>
            <Link href={"/sign-in"}>
              <UserIcon /> Sign In
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
