import { useEffect, useState } from 'react';
import { storeAPI, userAPI } from '../api/client';
import { Navbar } from '../components/Navbar';
import { ShoppingBag, Coins, CheckCircle } from 'lucide-react';

export const Store = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [sliderValues, setSliderValues] = useState<{[key: number]: number}>({});
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, balanceRes] = await Promise.all([
        storeAPI.getProducts(),
        userAPI.getBalance()
      ]);
      setProducts(productsRes.data.products);
      setBalance(balanceRes.data.balance);

      // Initialize slider values for free products
      const initialSliders: {[key: number]: number} = {};
      productsRes.data.products.forEach((product: any) => {
        if (product.type === 'free') {
          initialSliders[product.id] = 0;
        }
      });
      setSliderValues(initialSliders);
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: number, tokensToSpend?: number) => {
    const tokensRequired = tokensToSpend || products.find(p => p.id === productId)?.price || 0;

    if (balance < tokensRequired) {
      alert('¡Saldo insuficiente!');
      return;
    }

    setPurchasing(productId);
    try {
      // Pass tokensSpent if specified (for token offers or free products)
      await storeAPI.purchase(productId, tokensToSpend);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reload balance after purchase
      const balanceRes = await userAPI.getBalance();
      setBalance(balanceRes.data.balance);
      await loadData();
      setSelectedProduct(null); // Close modal after purchase
    } catch (error: any) {
      alert(error.response?.data?.error || '¡Compra fallida!');
    } finally {
      setPurchasing(null);
    }
  };

  const handleCanjeClick = (product: any) => {
    // For standard products with token offers, show modal
    if (product.type === 'standard' && product.token_offers && product.token_offers.length > 0) {
      setSelectedProduct(product);
    } else {
      // For other products, purchase directly
      handlePurchase(product.id, product.type === 'free' ? sliderValues[product.id] || 0 : undefined);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Catálogo</h1>
          <div className="flex items-center bg-blue-100 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-800">{balance} Tokens Develand</span>
          </div>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            ¡Compra exitosa!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isFree = product.type === 'free';
            const sliderValue = sliderValues[product.id] || 0;
            // If max_tokens is 0 or null, calculate as 50% of price (fallback)
            const productMaxTokens = product.max_tokens || Math.floor((product.real_price || product.price) * 0.5);
            const maxSlider = Math.min(productMaxTokens, balance);
            const canPurchase = isFree ? sliderValue > 0 && sliderValue <= balance && sliderValue <= productMaxTokens : balance >= product.price;

            // Debug logging
            if (isFree) {
              console.log(`Product ${product.name}:`, {
                type: product.type,
                max_tokens: product.max_tokens,
                calculated_max: productMaxTokens,
                balance,
                maxSlider,
                sliderValue
              });
            }

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Product Image */}
                {product.image_url ? (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = '/logo_develand.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <img
                      src="/logo_develand.png"
                      alt="Develand"
                      className="h-24 w-auto opacity-50"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        product.type === 'standard' ? 'bg-blue-100 text-blue-800' :
                        product.type === 'promotion' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {product.type === 'standard' ? 'Estándar' : product.type === 'promotion' ? 'Promoción' : 'Tokens'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{product.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-3xl font-bold text-blue-600">€{product.real_price || product.price}</span>
                        </div>
                        {!isFree ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <Coins className="w-4 h-4 text-gray-500 mr-1" />
                            <span>{product.price} Tokens Develand</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-purple-600">
                            <span>Máx: {product.max_tokens || 0} tokens ({Math.round((product.max_tokens || 0) / (product.real_price || product.price) * 100)}% del precio)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isFree && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tokens a gastar: {sliderValue} / {maxSlider}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={maxSlider}
                        value={sliderValue}
                        onChange={(e) => setSliderValues({...sliderValues, [product.id]: parseInt(e.target.value)})}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: maxSlider > 0 ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(sliderValue / maxSlider) * 100}%, #e5e7eb ${(sliderValue / maxSlider) * 100}%, #e5e7eb 100%)` : '#e5e7eb'
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>{maxSlider}</span>
                      </div>
                      {balance === 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          No tienes tokens disponibles. Necesitas tokens para usar este producto.
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleCanjeClick(product)}
                    disabled={!canPurchase || purchasing === product.id}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                      !canPurchase
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {purchasing === product.id
                      ? 'Procesando...'
                      : (product.type === 'standard' && product.token_offers && product.token_offers.length > 0)
                        ? 'Ver opciones'
                        : 'Canjear'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay productos disponibles en este momento</p>
          </div>
        )}

        {/* Token Offers Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
              <p className="text-gray-600 mb-6">{selectedProduct.description}</p>

              <div className="space-y-3">
                {/* Main option - Full token price */}
                <button
                  onClick={() => handlePurchase(selectedProduct.id, selectedProduct.price)}
                  disabled={balance < selectedProduct.price || purchasing === selectedProduct.id}
                  className={`w-full p-4 rounded-lg font-semibold transition-colors text-left ${
                    balance < selectedProduct.price
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg">Canjear por {selectedProduct.price} Tokens</div>
                      <div className="text-sm opacity-90">Precio completo en tokens</div>
                    </div>
                    <Coins className="w-6 h-6" />
                  </div>
                </button>

                {/* Token offers */}
                {selectedProduct.token_offers && selectedProduct.token_offers.map((offer: any, idx: number) => {
                  const canAfford = balance >= offer.tokens;
                  return (
                    <button
                      key={idx}
                      onClick={() => canAfford ? handlePurchase(selectedProduct.id, offer.tokens) : null}
                      disabled={!canAfford || purchasing === selectedProduct.id}
                      className={`w-full p-4 rounded-lg font-semibold transition-colors text-left ${
                        !canAfford
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg">{offer.summary}</div>
                          <div className="text-sm opacity-75">Opción con tokens + efectivo</div>
                        </div>
                        <Coins className="w-6 h-6" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full mt-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
