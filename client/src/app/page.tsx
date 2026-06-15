import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <Navbar />
      <Hero />
    </main>
  );
}
