export default function ComingSoonPage({
  title,
  description = "This page is part of the project structure and will be implemented later.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="container" style={{ paddingBlock: 64 }}>
      <p className="eyebrow">ServiceHub</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
