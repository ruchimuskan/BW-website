export default function BlogArticleLoading() {
  return (
    <div className="min-h-dvh bg-[#f7f8f3] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-3 w-28 rounded-full bg-[#e4ead4]" />
        <div className="mt-6 h-9 w-4/5 rounded-lg bg-[#e4ead4]" />
        <div className="mt-3 h-9 w-2/5 rounded-lg bg-[#e4ead4]" />
        <div className="mt-8 aspect-[16/9] rounded-2xl bg-[#e8edd8]" />
        <div className="mt-10 space-y-3">
          <div className="h-3 w-full rounded bg-[#e4ead4]" />
          <div className="h-3 w-[92%] rounded bg-[#e4ead4]" />
          <div className="h-3 w-[88%] rounded bg-[#e4ead4]" />
        </div>
      </div>
    </div>
  );
}
