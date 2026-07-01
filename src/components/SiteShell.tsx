export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 py-12 sm:px-10 sm:py-16">
      {children}
    </div>
  );
}
