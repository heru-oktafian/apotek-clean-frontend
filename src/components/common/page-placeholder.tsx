interface PagePlaceholderProps {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="page-card">
      <div className="page-card__header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="placeholder-box">
        <strong>Fondasi halaman sudah disiapkan.</strong>
        <span>Detail UI dan integrasi modul ini akan diisi bertahap dari mapping screenshot dan endpoint backend aktif.</span>
      </div>
    </section>
  )
}
