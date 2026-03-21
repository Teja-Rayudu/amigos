import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import Link from "next/link"
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { 
  Rss, 
  ImagePlus, 
  Users, 
  Shield,
  ArrowRight,
  ShieldCheck,
  Camera,
} from "lucide-react"

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'there';
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className="my-5 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        </header>
        
        {/* Welcome Section */}
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Connect with friends, share your moments, and stay protected with Deep Shield.
            </p>
          </div>

          {/* Deep Shield Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <Shield className="h-10 w-10 shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-bold">Deep Shield Protection</h2>
                <p className="text-sm text-indigo-100 mt-1">
                  Register your face to prevent unauthorized sharing of your photos. 
                  When someone tries to share a photo with your face, they&apos;ll need your OTP consent.
                </p>
              </div>
              <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0">
                <Link href="/deep-shield" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Setup
                </Link>
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {/* Feed */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <Rss className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle>Your Feed</CardTitle>
                </div>
                <CardDescription>
                  See what your friends are sharing. Like, comment, and connect with your community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                  <Link href="/feed" className="flex items-center gap-2">
                    Browse Feed
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Create Post */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <ImagePlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Share a Moment</CardTitle>
                </div>
                <CardDescription>
                  Upload a photo and share it with your friends. Deep Shield protects everyone automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/create-post" className="flex items-center gap-2">
                    Create Post
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Friends */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Friends</CardTitle>
                </div>
                <CardDescription>
                  Manage your connections and find new friends on AMIGOS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/friends" className="flex items-center gap-2">
                    View Friends
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Deep Shield */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <Camera className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle>Face Registration</CardTitle>
                </div>
                <CardDescription>
                  Register your face with Deep Shield to control who can share your photos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/deep-shield" className="flex items-center gap-2">
                    Register Face
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Platform</p>
                      <p className="text-2xl font-bold">AMIGOS</p>
                    </div>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                      <Rss className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Protection</p>
                      <p className="text-2xl font-bold">Deep Shield</p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="text-2xl font-bold">Active ✓</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
