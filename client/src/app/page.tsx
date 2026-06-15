import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CTAButton from "@/components/CTAButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <Navbar />
      <Hero>
        <CTAButton href="/upload">Get started</CTAButton>
      </Hero>
    </main>
  );
}
