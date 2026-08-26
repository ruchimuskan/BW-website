export default function Template({ children }: { children: React.ReactNode }) {
  // Instant route swaps — no fade/slide delay on navigation
  return <>{children}</>;
}
