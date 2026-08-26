export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
        aria-label="Loading"
      />
    </div>
  );
}
