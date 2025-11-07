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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isFullHtml = termsHtml && (termsHtml.includes('<head>') || termsHtml.includes('<style>') || termsHtml.includes('<body>'));

  useEffect(() => {
    // Reset scroll state when modal opens
    if (isOpen) {
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Load HTML content into iframe if it contains head/body/style tags
    if (iframeRef.current && termsHtml && (termsHtml.includes('<head>') || termsHtml.includes('<style>') || termsHtml.includes('<body>'))) {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(termsHtml);
        iframeDoc.close();

        // Check if content is short enough that scrolling isn't needed
        setTimeout(() => {
          const element = iframeDoc.documentElement || iframeDoc.body;
          if (element.scrollHeight <= element.clientHeight) {
            setHasScrolledToBottom(true);
          }
        }, 100);
      }
    }
  }, [termsHtml, isOpen]);

  useEffect(() => {
    // Check if div content is short enough that scrolling isn't needed
    if (contentRef.current && !isFullHtml) {
      const checkScroll = () => {
        if (contentRef.current) {
          const element = contentRef.current;
          if (element.scrollHeight <= element.clientHeight) {
            setHasScrolledToBottom(true);
          }
        }
      };

      // Check after content loads
      setTimeout(checkScroll, 100);
    }
  }, [termsHtml, isOpen, isFullHtml]);

  const handleScroll = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      const scrollTop = Math.ceil(element.scrollTop);
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      // Check if scrolled to bottom (within 2px tolerance to account for fractional pixels)
      const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 2);

      console.log('Div scroll:', { scrollTop, scrollHeight, clientHeight, calc: scrollTop + clientHeight, isAtBottom });

      if (isAtBottom) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleIframeScroll = () => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        const element = iframeDoc.documentElement || iframeDoc.body;
        const scrollTop = Math.ceil(element.scrollTop);
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;

        // Check if scrolled to bottom (within 2px tolerance)
        const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 2);

        console.log('Iframe scroll:', { scrollTop, scrollHeight, clientHeight, calc: scrollTop + clientHeight, isAtBottom });

        if (isAtBottom) {
          setHasScrolledToBottom(true);
        }
      }
    }
  };

  // Add custom styles for proper font sizing
  const styledHtml = isFullHtml ? termsHtml : `<style>
    * { font-size: 12pt !important; line-height: 1.6 !important; }
    h1 { font-size: 24pt !important; font-weight: bold !important; margin-top: 0.5em !important; margin-bottom: 0.5em !important; }
    h2 { font-size: 18pt !important; font-weight: bold !important; }
    h3 { font-size: 14pt !important; font-weight: bold !important; }
    p { margin-top: 0.5em !important; margin-bottom: 0.5em !important; }
  </style>${termsHtml}`;

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-[900px] h-[600px] flex flex-col" style={{ minWidth: '900px', minHeight: '600px', maxWidth: '90vw', maxHeight: '90vh' }}>
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
        {isFullHtml ? (
          <iframe
            ref={iframeRef}
            onLoad={() => {
              // Attach scroll listener to iframe content
              if (iframeRef.current) {
                const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
                if (iframeDoc) {
                  iframeDoc.addEventListener('scroll', handleIframeScroll);
                }
              }
            }}
            className="flex-1 w-full border-0"
            title="Términos y Condiciones"
          />
        ) : (
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6"
            dangerouslySetInnerHTML={{ __html: styledHtml }}
          />
        )}

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
