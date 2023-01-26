"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

import MobileNav from './MobileNav';

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/icons/logo.svg"
          width={32}
          height={32}
          alt="yoom logo"
          className="max-sm:size-10"
        />
        <p className="text-[26px] font-extrabold text-white max-sm:hidden">
          YOOM
        </p>
      </Link>
      <div className="flex-between gap-5">
        {status === 'authenticated' ? (
          <div className="flex items-center gap-3">
            <p className="text-white">{session.user?.name}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              className="text-white"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/sign-in" className="text-white">
            Sign In
          </Link>
        )}

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
