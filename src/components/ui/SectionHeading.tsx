export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-cream mt-3">
      {children}
    </h2>
  );
}
