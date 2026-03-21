import { GalleryVerticalEnd } from "lucide-react"

import SimpleHeader from "@/components/SimpleHeader"
import { RegisterForm } from "@/components/register-form"
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/dashboard");
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
<SimpleHeader />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="bg-black relative lg:block">
        <img
          src="/placeholder.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.8]"
        />
      </div>
      {/* Theme toggle button */}
      <div className="absolute top-4 right-4 z-10">
      </div>
    </div>
  )
}
