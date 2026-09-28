import Link from 'next/link';
import { type Inquiries } from '@/types/inquiries'; // お問い合わせデータの型定義
import Pagination from '@/components/Pagination'; // ページネーションコンポーネント

// お問い合わせデータの型定義
type Inquiry = Pick<Inquiries, 'id' | 'name' | 'email' | 'message' | 'created_at'>;
interface InquiriesPageData {
    inquiries: Inquiry[]; // お問い合わせデータ配列
    // ページネーション情報
    pagination: {
        currentPage: number;
        perPage: number;
        totalItems: number;
        totalPages: number;
    };
}
// 管理者用のお問い合わせ一覧ページ
export default async function AdminInquiriesPage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // searchParamsは非同期で取得されるためawaitが必要
    const sp = await searchParams;

    // URLのクエリパラメータから必要なデータを取得
    const page = Number(sp?.page ?? '1');
    const perPage = Number(sp?.perPage ?? '20');

    // お問い合わせAPIからお問い合わせデータを取得
    const res = await fetch(`${process.env.BASE_URL}/api/inquiries?page=${page}&perPage=${perPage}`, {
        cache: 'no-store'
    });

    // APIから返されたデータを取得
    const { inquiries, pagination }: InquiriesPageData = await res.json()
    if (!Array.isArray(inquiries)) {
        console.error('お問い合わせデータの取得に失敗しました。');
        return <p className="text-center text-gray-500 text-lg py-10">お問い合わせデータの取得に失敗しました。</p>;
    }

    // テーブルの共通スタイル
    const tableStyle = 'px-5 py-3 border-b border-gray-300';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/admin/products" className="text-indigo-600 hover:underline">
                    ←商品一覧ページに戻る
                </Link>
            </div>
            <h1 className="text-center">お問い合わせ一覧</h1>
            <div className="shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 text-left">
                            <th className={tableStyle}>ID</th>
                            <th className={tableStyle}>氏名</th>
                            <th className={tableStyle}>メールアドレス</th>
                            <th className={tableStyle}>お問い合わせ内容</th>
                            <th className={tableStyle}>送信日時</th>
                            <th className={tableStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={`${tableStyle} text-center text-gray-500`}>
                                    お問い合わせが見つかりませんでした。
                                </td>
                            </tr>
                        ) : (
                            inquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="hover:bg-gray-100">
                                    <td className={tableStyle}>{inquiry.id}</td>
                                    <td className={tableStyle}>{inquiry.name}</td>
                                    <td className={tableStyle}>{inquiry.email}</td>
                                    <td className={tableStyle}>{inquiry.message}</td>
                                    <td className={tableStyle}>{inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <section className="mb-8">
                {pagination.totalPages > 0 &&
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                    />}
            </section>
        </div>
    );
}