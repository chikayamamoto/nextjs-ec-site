'use client';

import { useState } from 'react';

interface FavoriteControlsProps {
  productId: number;          // 商品ID
  initialIsFavorite: boolean; // 初期のお気に入り状態（true/false）
}

export default function FavoriteControls({
  productId,
  initialIsFavorite
}: FavoriteControlsProps) {

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  // お気に入り追加
const addFavorite = async () => {
  setLoading(true);

  try {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: productId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('お気に入り登録失敗:', data);
      return;
    }

    setIsFavorite(true);
  } catch (err) {
    console.error('お気に入り登録エラー:', err);
  } finally {
    setLoading(false);
  }
};

// お気に入り解除
const removeFavorite = async () => {
  setLoading(true);

  try {
    const res = await fetch(`/api/favorites/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('お気に入り削除失敗:', data);
      return;
    }

    setIsFavorite(false);

  } catch (err) {
    console.error('お気に入り削除エラー:', err);
  } finally {
    setLoading(false);
  }
};

  // ボタン押下時の処理
  const handleClick = () => {
    if (loading) return;

    if (isFavorite) {
      removeFavorite();
    } else {
      addFavorite();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{ fontFamily: 'sans-serif' }}
      className="text-lg underline disabled:opacity-50"
    >
      {isFavorite ? '♥ お気に入り解除' : '♡ お気に入り追加'}
    </button>
  );
}
