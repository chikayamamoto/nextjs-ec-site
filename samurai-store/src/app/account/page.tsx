'use client'; // クライアント（ブラウザ）側で動作

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

// マイページ
export default function AccountPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart(); // カートクリア関数

  // 決済成功時にカートを空にする
  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <>
      {sessionId && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex flex-col items-center justify-center mb-6 rounded-md">
          <p className="text-xl font-bold mt-4">ご注文ありがとうございます！</p>
          <p>商品が到着するまでしばらくお待ち下さい。</p>
        </div>
      )}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-center mb-8">マイページ</h1>
      </main>
    </>
  );
}
