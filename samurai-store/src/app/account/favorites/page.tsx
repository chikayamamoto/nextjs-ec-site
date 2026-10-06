import { type ProductCardProps } from '@/components/ProductCard';
import { cookies } from 'next/headers';
import { AUTH_TOKEN } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteControls from '@/app/products/[id]/FavoriteControls';

// お気に入り一覧ページ
export default async function FavoritesPage() {
    // クッキーからトークンを取得
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN)?.value;

    // トークンをヘッダーにセット
    const headers: HeadersInit = token
        ? { Cookie: `${AUTH_TOKEN}=${token}` }
        : {};

    // お気に入りAPIから商品データを取得
    const res = await fetch(`${process.env.BASE_URL}/api/favorites`, {
        cache: 'no-store',
        headers: headers,
    });

    // APIから返されたデータをJavaScriptの配列に変換
    const productArray = await res.json();

    if (!Array.isArray(productArray)) {
        console.error('商品データの取得に失敗しました。');
        return (
            <p className="text-center text-gray-500 text-lg py-10">
                商品データの取得に失敗しました。
            </p>
        );
    }

    // 商品カードの形式に変換
    const products: ProductCardProps[] = productArray.map((row: any) => ({
        id: String(row.id),
        title: row.name,
        price: row.price,
        imageUrl: row.image_url ?? undefined,
        showFavoriteButton: true,
        initialIsFavorite: true,
        showCartButton: true,
    }));

    return (
        <main className="max-w-6xl mx-auto p-8">
            <div className="mb-6">
                <Link href="/account" className="text-indigo-600 hover:underline">
                    ←マイページに戻る
                </Link>
            </div>
            <h1 className="text-4xl font-bold text-center mb-10">
                お気に入り一覧
            </h1>

            <section className="space-y-4">
                {products.map((product) => (
                    <div key={product.id} className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-6 min-h-[210px]">

                        <Link href={`/products/${product.id}`} className="flex-shrink-0">
                            <div className="w-[120px] h-[120px] overflow-hidden flex items-center justify-center">
                                <Image
                                    src={product.imageUrl ? `/uploads/${product.imageUrl}` : '/images/no-image.jpg'}
                                    alt={product.title}
                                    width={120}
                                    height={120}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </Link>

                        <div className="flex-1 ml-6">
                            <Link href={`/products/${product.id}`}>
                                <h2 className="text-xl font-bold mb-4 hover:underline">
                                    {product.title}
                                </h2>
                            </Link>

                            <p className="text-xl font-bold text-indigo-600">
                                ¥{product.price.toLocaleString()}
                                <span className="text-sm font-normal text-gray-500 ml-1">（税込）</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 w-[170px]">
                            <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded">
                                カートに追加
                            </button>

                            <FavoriteControls
                                productId={Number(product.id)}
                                initialIsFavorite={true}
                            />
                        </div>

                    </div>
                ))}
            </section>
        </main>
    );
}