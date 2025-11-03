import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const StoreManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    realPrice: '',
    maxTokens: '',
    type: 'standard',
    tokenOffers: [] as Array<{tokens: number, money: number, summary: string}>
  });
  const [newTokenOffer, setNewTokenOffer] = useState({ tokens: '', money: '' });
  const [editTokenOffer, setEditTokenOffer] = useState({ tokens: '', money: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await adminAPI.getAllProducts();
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: productForm.name,
        description: productForm.description,
        price: parseInt(productForm.price),
        type: productForm.type
      };

      if (productForm.realPrice) {
        payload.real_price = parseFloat(productForm.realPrice);
      }

      if (productForm.type === 'free' && productForm.maxTokens) {
        payload.max_tokens = parseInt(productForm.maxTokens);
      }

      if (productForm.type === 'standard' && productForm.tokenOffers.length > 0) {
        payload.token_offers = productForm.tokenOffers;
      }

      await adminAPI.createProduct(
        payload.name,
        payload.description,
        payload.price,
        payload.type,
        payload.real_price,
        payload.max_tokens,
        payload.token_offers
      );
      alert('¡Producto creado exitosamente!');
      setShowCreateModal(false);
      setProductForm({ name: '', description: '', price: '', realPrice: '', maxTokens: '', type: 'standard', tokenOffers: [] });
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Creación fallida');
    }
  };

  const handleUpdate = async (productId: number, updates: any) => {
    try {
      await adminAPI.updateProduct(productId, updates);
      alert('¡Producto actualizado exitosamente!');
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Actualización fallida');
    }
  };

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) return;

    try {
      await adminAPI.deleteProduct(productId);
      alert('¡Producto eliminado exitosamente!');
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Eliminación fallida');
    }
  };

  const toggleActive = async (product: any) => {
    await handleUpdate(product.id, { active: !product.active });
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Package className="w-8 h-8 mr-3 text-blue-600" />
              Gestión de Catálogo
            </h1>
            <p className="text-gray-600">Gestionar productos en la tienda</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Producto
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className={`bg-white rounded-lg shadow-lg overflow-hidden ${!product.active && 'opacity-60'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      product.type === 'standard' ? 'bg-blue-100 text-blue-800' :
                      product.type === 'promotion' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {product.type}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProduct({
                        ...product,
                        token_offers: product.token_offers || []
                      })}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm">{product.description}</p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">€{product.real_price || product.price}</div>
                    <div className="text-sm text-gray-600">{product.price} tokens</div>
                    {product.type === 'free' && product.max_tokens && (
                      <div className="text-xs text-purple-600 mt-1">Max: {product.max_tokens} tokens</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleActive(product)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                      product.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {product.active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Creado: {format(new Date(product.created_at), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aún no hay productos</p>
            <p className="text-gray-500">Click "Agregar Producto" para crear tu primer producto</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Crear Nuevo Producto</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                  >
                    <option value="standard">Estándar</option>
                    <option value="promotion">Promoción</option>
                    <option value="free">Gratis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={productForm.realPrice}
                    onChange={(e) => setProductForm({ ...productForm, realPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio en Tokens</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>

                {productForm.type === 'standard' && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ofertas Múltiples de Tokens</label>

                    {/* Existing offers */}
                    {productForm.tokenOffers.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {productForm.tokenOffers.map((offer, idx) => (
                          <div key={idx} className="flex space-x-2 items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm flex-1">{offer.summary}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newOffers = productForm.tokenOffers.filter((_, i) => i !== idx);
                                setProductForm({ ...productForm, tokenOffers: newOffers });
                              }}
                              className="text-red-600 hover:text-red-800 text-sm px-2"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new offer - inline 3 column table */}
                    <div className="border border-gray-300 rounded-lg p-3 bg-blue-50">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tokens</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            value={newTokenOffer.tokens}
                            onChange={(e) => setNewTokenOffer({ ...newTokenOffer, tokens: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Dinero (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            value={newTokenOffer.money}
                            onChange={(e) => setNewTokenOffer({ ...newTokenOffer, money: e.target.value })}
                            placeholder="50.00"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (newTokenOffer.tokens && newTokenOffer.money) {
                                const tokensNum = parseInt(newTokenOffer.tokens);
                                const moneyNum = parseFloat(newTokenOffer.money);
                                const summary = `${tokensNum} Tokens + ${moneyNum.toFixed(2)}€`;
                                setProductForm({
                                  ...productForm,
                                  tokenOffers: [...productForm.tokenOffers, { tokens: tokensNum, money: moneyNum, summary }]
                                });
                                setNewTokenOffer({ tokens: '', money: '' });
                              }
                            }}
                            className="w-full py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            + Añadir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {productForm.type === 'free' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Máx Tokens (50% of price)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={productForm.maxTokens}
                      onChange={(e) => setProductForm({ ...productForm, maxTokens: e.target.value })}
                      placeholder={productForm.realPrice ? String(Math.floor(parseFloat(productForm.realPrice) * 0.5)) : ''}
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Crear Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Editar Producto</h3>

              <form onSubmit={(e) => {
                e.preventDefault();
                const updates: any = {
                  name: editingProduct.name,
                  description: editingProduct.description,
                  price: parseInt(editingProduct.price),
                  type: editingProduct.type
                };

                if (editingProduct.real_price) {
                  updates.real_price = parseFloat(editingProduct.real_price);
                }

                if (editingProduct.type === 'free' && editingProduct.max_tokens) {
                  updates.max_tokens = parseInt(editingProduct.max_tokens);
                }

                if (editingProduct.type === 'standard' && editingProduct.token_offers) {
                  updates.token_offers = editingProduct.token_offers;
                }

                handleUpdate(editingProduct.id, updates);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={editingProduct.type}
                    onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })}
                  >
                    <option value="standard">Estándar</option>
                    <option value="promotion">Promoción</option>
                    <option value="free">Gratis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={editingProduct.real_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, real_price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio en Tokens</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>

                {editingProduct.type === 'standard' && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ofertas Múltiples de Tokens</label>

                    {/* Existing offers */}
                    {editingProduct.token_offers && editingProduct.token_offers.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {editingProduct.token_offers.map((offer: any, idx: number) => (
                          <div key={idx} className="flex space-x-2 items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm flex-1">{offer.summary}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newOffers = editingProduct.token_offers.filter((_: any, i: number) => i !== idx);
                                setEditingProduct({ ...editingProduct, token_offers: newOffers });
                              }}
                              className="text-red-600 hover:text-red-800 text-sm px-2"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new offer - inline 3 column table */}
                    <div className="border border-gray-300 rounded-lg p-3 bg-blue-50">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tokens</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            value={editTokenOffer.tokens}
                            onChange={(e) => setEditTokenOffer({ ...editTokenOffer, tokens: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Dinero (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            value={editTokenOffer.money}
                            onChange={(e) => setEditTokenOffer({ ...editTokenOffer, money: e.target.value })}
                            placeholder="50.00"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (editTokenOffer.tokens && editTokenOffer.money) {
                                const tokensNum = parseInt(editTokenOffer.tokens);
                                const moneyNum = parseFloat(editTokenOffer.money);
                                const summary = `${tokensNum} Tokens + ${moneyNum.toFixed(2)}€`;
                                const currentOffers = editingProduct.token_offers || [];
                                setEditingProduct({
                                  ...editingProduct,
                                  token_offers: [...currentOffers, { tokens: tokensNum, money: moneyNum, summary }]
                                });
                                setEditTokenOffer({ tokens: '', money: '' });
                              }
                            }}
                            className="w-full py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            + Añadir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editingProduct.type === 'free' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Máx Tokens (50% of price)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editingProduct.max_tokens || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, max_tokens: e.target.value })}
                      placeholder={editingProduct.real_price ? String(Math.floor(parseFloat(editingProduct.real_price) * 0.5)) : ''}
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
