import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { ProductScreenshot } from "@/components/product-screenshot"
import { PlatformBar } from "@/components/platform-bar"
import { Features } from "@/components/features"
import { DemoVideo } from "@/components/demo-video"
import { DownloadSection } from "@/components/download-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductScreenshot />
        <PlatformBar />
        <Features />
        <DemoVideo />
        <DownloadSection />
      </main>
      <Footer />
    </>
  )
}
