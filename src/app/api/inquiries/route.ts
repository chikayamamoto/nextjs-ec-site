import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db'; // DB共通モジュール
import { type Inquiries } from '@/types/inquiries'; // お問い合わせデータの型定義

type inquiries = Omit<Inquiries, 'created_at'>;
// 問い合わせのデータを取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) 
{
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータからpageとperPageを取得
    let page    = Number(searchParams.get('page')) || 1;
    let perPage = Number(searchParams.get('perPage')) || 16;

    // 最小値・最大値を超えている場合は補正
    page = Math.max(1, Math.min(page, 1000)); // ページ番号は1～1000
    perPage = Math.max(1, Math.min(perPage, 100)); // 1ページ件数は1～100

    // オフセット（スキップする件数）を計算
    const offset = (page - 1) * perPage;

    // 2つのデータベース操作を並行処理で実施
    const [inquiries, totalItemsResult] = await Promise.all([
      // LIMITとOFFSETを使い、現在のページに表示するお問い合わせデータだけを取得
      executeQuery<Inquiries[]>(`
        SELECT *
        FROM inquiries
        ORDER BY created_at DESC
        LIMIT ?
        OFFSET ?
        ;`, [perPage, offset]
      ),
      // お問い合わせデータの全件数を取得
      executeQuery<{ count: number }>(`
        SELECT COUNT(*) AS count
        FROM inquiries
      ;`)
    ]);

    // 全件数を扱いやすい変数に取得
    const totalItems = totalItemsResult[0].count;

    // 総ページ数を計算
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // 取得したお問い合わせデータとページネーション情報を返す
    return NextResponse.json({
      inquiries, // 現在のページのお問い合わせデータ
      pagination: { currentPage: page, perPage, totalItems, totalPages },
    });
  } catch (err) {
    console.error('問い合わせデータ取得エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
// お問い合わせ処理
export async function POST(request: NextRequest) {
  try {
    // リクエストボディからメールアドレスとパスワードを取得
    const { email, message, name } = await request.json();

    // 未入力チェック
    if (!email?.trim() || !message?.trim() || !name?.trim()) {
      return NextResponse.json({ message: 'すべての項目を入力してください。' }, { status: 400 });
    }
    const response = NextResponse.json({ message: 'お問い合わせが送信されました。ご返信までしばらくお待ちください。' });

    await executeQuery(`
      INSERT INTO inquiries (name, email, message)
      VALUES (?, ?, ?);
      `, [name, email, message]
    );
    return response; 
  } catch (error) {

    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
