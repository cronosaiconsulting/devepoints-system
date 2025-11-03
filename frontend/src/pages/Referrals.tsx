import { useEffect, useState } from 'react';
import { userAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import { Gift, Copy, Users, Coins, CheckCircle } from 'lucide-react';

export const Referrals = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_referrals: 0, total_earned: 0 });
  const [copied, setCopied] = useState(false);
  const referralUrl = `${window.location.origin}/register?ref=${user?.referralCode}`;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await userAPI.getReferrals();
      setStats(response.data.referrals);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Programa de Referidos</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Referidos</p>
                <p className="text-4xl font-bold mt-2">{stats.total_referrals}</p>
              </div>
              <Users className="w-16 h-16 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Ganado</p>
                <p className="text-4xl font-bold mt-2">{stats.total_earned}</p>
                <p className="text-green-100 text-sm mt-1">Tokens Develand</p>
              </div>
              <Coins className="w-16 h-16 text-green-200" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Gift className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold">Tu Enlace de Referido</h2>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Comparte este enlace con tus amigos:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white"
              />
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  1
                </div>
                <p>Share your referral link with friends and colleagues</p>
              </div>
              <div className="flex items-start">
                <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  2
                </div>
                <p>They sign up using your link and get bonus Tokens Develand</p>
              </div>
              <div className="flex items-start">
                <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  3
                </div>
                <p>You earn reward Tokens Develand for each successful referral!</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Referred users get bonus coins when they sign up, making it a win-win for everyone!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
