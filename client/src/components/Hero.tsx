import { ReactNode } from "react";

type HeroProps = {
  children: ReactNode;
};

export default function Hero({ children }: HeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">Analyze CS2 Matches</h1>

        <p className="mt-4 text-lg text-gray-600">
          Analyze Counter-Strike 2 demos and player performance.
        </p>
        {children}
      </div>
    </section>
  );
}
