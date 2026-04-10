export function AppHeader() {
  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <div>
          <p className="text-xl font-semibold text-ink">EnorAI</p>
          <p className="mt-1 text-sm text-muted">
            Privacy-first healthcare AI middleware
          </p>
        </div>
        <img
          alt="Healthcare security breach signal"
          className="hidden h-12 w-24 rounded object-cover grayscale sm:block"
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Individuals_affected_by_healthcare_security_breaches.jpg"
        />
      </div>
    </header>
  );
}

