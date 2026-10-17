export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bone)" }}>
      <div className="text-center animate-fade-in">
        <div className="font-heading font-bold text-8xl text-steel-light mb-4">404</div>
        <h2 className="mb-2">Page not found</h2>
        <p className="text-steel text-sm mb-6">This page doesn&apos;t exist or has been moved.</p>
        <a href="/" className="btn btn-primary">Go home</a>
      </div>
    </div>
  );
}
