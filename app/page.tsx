import FrontDeskApp from "@/components/frontdesk/frontdesk-app"

export default function Page() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="container max-w-6xl py-6 md:py-8">
        <FrontDeskApp />
      </div>
    </main>
  )
}
