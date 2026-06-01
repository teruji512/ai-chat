import Image from "next/image";
import { CHARACTER } from "@/lib/character";

export default function CharacterAvatar() {
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
      <Image
        src={CHARACTER.avatarPath}
        alt={CHARACTER.name}
        width={36}
        height={36}
        className="object-cover w-full h-full"
      />
    </div>
  );
}
