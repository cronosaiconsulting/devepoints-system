import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  termsHtml: string;
}

export const TermsModal = ({ isOpen, onClose, onAccept, termsHtml }: TermsModalProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll state when modal opens
    if (isOpen) {
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Check if user has scrolled to within 10px of the bottom
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {!hasScrolledToBottom && (
            <p className="text-sm text-amber-600 mb-3 text-center">
              ⬇️ Por favor, desplázate hasta el final para poder aceptar
            </p>
          )}
          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              hasScrolledToBottom
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Acepto los Términos y Condiciones
          </button>
        </div>
      </div>
    </div>
  );
};
