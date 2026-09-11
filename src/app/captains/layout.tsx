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
        href="/images/img15.png"
        type="image/png"
      />
      <link
        rel="preload"
        as="image"
        href="/images/img15-2x.webp"
        type="image/webp"
      />
      {children}
    </>
  );
}
