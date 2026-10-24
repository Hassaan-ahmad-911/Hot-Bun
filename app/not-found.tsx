import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="halftone flex min-h-screen flex-col bg-mustard px-4 text-ink">
      <div className="container py-6">
        <Logo />
      </div>
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center pb-24 text-center">
        <p className="-rotate-2 rounded-full border-2 border-ink bg-card px-4 py-1 font-display font-extrabold uppercase shadow-pop-sm">
          404 · Off the menu
        </p>
        <h1 className="mt-6 font-display text-display-lg uppercase">This page got eaten.</h1>
        <p className="mt-4 text-lg font-semibold">We couldn&apos;t find what you were looking for, but the burgers are exactly where we left them.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/menu" size="lg">
            See the menu
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="lg">
            Back home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
