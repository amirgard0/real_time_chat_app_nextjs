import { Button } from "@/components/ui/button"
import { ArrowRightIcon, User2Icon } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="w-full min-h-screen relative flex items-center">
      {/* Background gradient that covers full viewport height */}
      <div className="absolute inset-0 bg-gradient-to-l from-primary/30 to-transparent -z-10" />

      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-5xl/none">
                Amazing Chat experience
              </h1>
              <p className="max-w-[600px] md:text-xl opacity-65">
                Give us a try and wonder how we could make this. Just feel how amazing we are and let us be your friend along chatting with other pations users.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild>
                <Link href="/register">
                  Sign up <User2Icon></User2Icon>
                </Link>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <Link href="/chat">
                  Global Chat <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Optional: Add an image or illustration on the right side */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full h-64 md:h-96 rounded-lg flex items-center justify-center">
              {/* <span className="text-primary/50">Component Showcase</span> */}
              <img src="https://www.uivibes.com/wp-content/uploads/2024/10/Hero-Section-Design.svg" alt="something" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}