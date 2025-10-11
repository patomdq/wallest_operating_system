export default function Documentos() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">Documentos</h1>
        <p className="text-wos-text-muted">Gestión documental del proyecto</p>
      </div>

      <div className="bg-wos-card border border-wos-border rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-wos-bg rounded-lg flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-wos-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-wos-accent mb-3">Enlace a Google Drive</h3>
          <p className="text-wos-text-muted mb-6">Los documentos del proyecto se almacenan en Google Drive para facilitar la colaboración y el acceso compartido.</p>
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-wos-accent text-wos-bg px-6 py-3 rounded-lg hover:opacity-90 transition-smooth"
          >
            Abrir Carpeta de Drive
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
