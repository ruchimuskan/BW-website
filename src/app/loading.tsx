export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-transparent px-4">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-[#e8edd8] border-t-[#C6E31A]"
        aria-label="Loading"
      />
    </div>
  );
}
