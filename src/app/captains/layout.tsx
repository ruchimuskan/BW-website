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
        href="/images/pages/page-captains.jpg"
        type="image/jpeg"
      />
      <link
        rel="preload"
        as="image"
        href="/images/pages/page-captains-safety.jpg"
        type="image/jpeg"
      />
      {children}
    </>
  );
}
