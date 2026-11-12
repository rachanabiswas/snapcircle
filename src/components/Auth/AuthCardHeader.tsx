import Image from "next/image";

import ThemeToggleButton from "@/components/Layout/ThemeToggleButton";

const AuthCardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Image
          src="/brand/snapcircle-mark.png"
          alt=""
          width={32}
          height={32}
          className="ring-foreground/10 size-8 rounded-full ring-1"
        />
        <span className="font-heading text-2xl font-semibold">SnapCircle</span>
      </div>
      <ThemeToggleButton />
    </div>
  );
};

export default AuthCardHeader;
