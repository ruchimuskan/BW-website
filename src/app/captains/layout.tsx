export default function CaptainsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/img15.webp?v=1"
        type="image/webp"
      />
      {children}
    </>
  );
}
