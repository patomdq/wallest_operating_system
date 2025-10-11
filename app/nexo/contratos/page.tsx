export default function Contratos() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">Contratos</h1>
        <p className="text-wos-text-muted">Gestión de contratos y documentación legal</p>
      </div>

      <div className="bg-wos-card border border-wos-border rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-wos-bg rounded-lg flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-wos-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-wos-accent mb-3">En Desarrollo</h3>
          <p className="text-wos-text-muted">Este módulo está actualmente en desarrollo. Pronto estará disponible para gestionar contratos, firmas digitales y documentación legal.</p>
        </div>
      </div>
    </div>
  );
}
