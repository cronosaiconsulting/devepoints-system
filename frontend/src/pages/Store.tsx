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
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: number, price: number) => {
    if (balance < price) {
      alert('Insufficient balance!');
      return;
    }

    setPurchasing(productId);
    try {
      await storeAPI.purchase(productId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Store</h1>
          <div className="flex items-center bg-blue-100 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-800">{balance} Devecoins</span>
          </div>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Purchase successful!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {product.type}
                    </span>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>

                <p className="text-gray-600 mb-4">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className="w-5 h-5 text-blue-600 mr-1" />
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                  </div>

                  <button
                    onClick={() => handlePurchase(product.id, product.price)}
                    disabled={balance < product.price || purchasing === product.id}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      balance < product.price
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {purchasing === product.id ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No products available at the moment</p>
          </div>
        )}
      </div>
    </>
  );
};
