'use client'; // クライアント（ブラウザ）側で動作
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // 商品ページへのリンク用
import { useState } from 'react';
// お問い合わせページ
export default function ContactPage() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState(''); // エラーメッセージ

    // フォーム送信時のイベントハンドラ
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); // デフォルトの送信動作をキャンセル
        setErrorMessage(''); // 送信前にエラーをクリア

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        // 入力データのバリデーション
        if (!email?.trim() || !message?.trim() || !name?.trim()) {
            setErrorMessage('すべての項目を入力してください。');
            return;
        }

        try { // お問い合わせAPIにPOSTリクエストを送信
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                body: JSON.stringify({ email, message, name }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) { // お問い合わせ成功時はトップページへ遷移
                router.push('/?submitted=1'); // お問い合わせ成功をクエリパラメータで通知
                router.refresh(); // ヘッダー更新のためWebページを再読み込み
            } else { // お問い合わせ失敗時はエラー情報を表示
                const data = await res.json();
                setErrorMessage(data.message || 'お問い合わせに失敗しました。');
            }
        } catch {
            setErrorMessage('通信エラーが発生しました。');
        }
    };

    // 入力欄の共通スタイル
    const inputStyle = 'w-full border border-gray-300 px-3 py-2 rounded-sm focus:ring-2 focus:ring-indigo-500';
    // ラベルの共通スタイル
    const labelStyle = "block font-bold mb-1";
    // バッジの共通スタイル
    const badgeStyle = "ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md";

    return (
        <main className="max-w-md mx-auto py-10">
            <div className="mb-6">
                <Link href="/" className="text-indigo-600 hover:underline">
                    ←トップページに戻る
                </Link>
            </div>
            <h1 className="text-center mb-6">お問い合わせ</h1>
            {errorMessage && (
                <p className="text-red-600 text-center mb-4">{errorMessage}</p>
            )}
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl">
                <label className={labelStyle} htmlFor="name">
                    氏名<span className={badgeStyle}>必須</span>
                </label>
                <input type="text" id="name" name="name" required
                    className={inputStyle}
                />
                <label className={labelStyle} htmlFor="email">
                    メールアドレス<span className={badgeStyle}>必須</span>
                </label>
                <input type="email" id="email" name="email" required
                    className={inputStyle}
                />

                <label className={labelStyle} htmlFor="message">
                    お問い合わせ内容<span className={badgeStyle}>必須</span>
                </label>
                <textarea id="message" name="message" required
                    className={inputStyle}
                    rows={4}
                />

                <button type="submit" className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-sm font-semibold">
                    送信
                </button>
            </form>
        </main>
    );
}