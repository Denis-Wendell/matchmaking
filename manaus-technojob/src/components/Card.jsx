// components/Card.jsx
function Card({ 
  title,              
  children,           
  className = '',     
  headerActions,      
  footer             
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {headerActions && (
            <div className="flex space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="p-6">
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;