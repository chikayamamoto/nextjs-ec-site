'use client'; // クライアント（ブラウザ）側で動作

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import FavoriteControls from '@/app/products/[id]/FavoriteControls';
// 商品カードコンポーネントに渡すデータ（props）の型定義
export interface ProductCardProps {
    id: string; // 商品ID
    title: string; // 商品タイトル
    price: number; // 商品価格

    imageUrl?: string; // 商品画像URL
    imageSize?: 300 | 400; // 画像サイズ

    rating?: number; // レビュー評価（平均）
    reviewCount?: number; // 総レビュー数

    showCartButton?: boolean; // 「カートへ」の有無

    showFavoriteButton?: boolean; // 「お気に入り」の有無
    initialIsFavorite?: boolean; // 初期のお気に入り状態

    className?: string; // 外部からのスタイル調整用
}

// 商品カードの共通コンポーネント
export default function ProductCard({
    id,
    title,
    price,
    imageUrl,
    imageSize = 300,
    rating,
    reviewCount,
    showCartButton = false,
    showFavoriteButton = false,
    initialIsFavorite = false,
    className = ''
}: ProductCardProps) {
    // カート管理用の関数を取得
    const { addItem, isInCart } = useCart();
    const inCart = isInCart(id); // カートに追加済みか

    // カートボタン押下時のイベントハンドラ
    const handleCart = () => {
        // カートに追加
        addItem({ id, title, price, imageUrl });
    };

    // 画像の指定がなければダミー画像を表示g
    const finalImageUrl = imageUrl
        ? `/uploads/${imageUrl}`
        : '/images/no-image.jpg';
    // レビューの星表示を決定
    const displayStars = (avgRating: number) => {
        const rating = Math.round(avgRating); // 四捨五入
        const filledStars = '★'.repeat(rating); // 評価分塗りつぶす
        const emptyStars = '☆'.repeat(5 - rating); // 残りは空の星
        return `${filledStars}${emptyStars}`;
    };


    return (
        <div className={`
      flex flex-col bg-white max-w-sm w-full p-2
      ${className}
    `}>
            <Link href={`/products/${id}`}>
                <div className="w-[300px] h-[300px] overflow-hidden flex justify-center items-center mx-auto">
                    <Image
                        src={finalImageUrl}
                        alt={title || '商品画像'}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>
            <div className="flex flex-col">
                <h3 className="text-sm font-semibold leading-tight mb-1">{title}</h3>
                {rating !== undefined && reviewCount !== undefined && (
                    reviewCount > 0 ? (
                        <p className="flex items-center text-sm mb-1">
                            <span className="text-yellow-500 mr-1">{displayStars(rating || 0)}</span>
                            <span className="text-gray-600">（{reviewCount}件）</span>
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400 mt-1">まだレビューがありません</p>
                    )
                )}
                <div className="flex justify-between items-center w-full mt-2">
                    <p className="text-lg font-bold">
                        ¥{price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-2">
                        {showFavoriteButton && (
                            <FavoriteControls
                                productId={Number(id)}
                                initialIsFavorite={initialIsFavorite}
                            />
                        )}

                        {showCartButton && (
                            <button
                                onClick={!inCart ? handleCart : undefined}
                                disabled={inCart}
                                className={`border py-2 px-4 rounded-sm
                    ${inCart
                                        ? 'bg-indigo-500 text-white'
                                        : 'border-indigo-500 text-indigo-500 hover:bg-indigo-400 hover:text-white'
                                    }
                `}
                            >
                                {inCart ? '追加済み' : 'カートへ'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}