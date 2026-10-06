import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db'; // DB共通モジュール
import { type FavoriteData } from '@/types/favorite';
import { verifyToken } from '@/lib/jwt';
import { AUTH_TOKEN } from '@/lib/auth';
// 商品データの型定義
type Product = FavoriteData; 

export async function GET(request: NextRequest) {
    // JWTを取得
    const token = request.cookies.get(AUTH_TOKEN)?.value;

    if (!token) {
        return NextResponse.json(
            { message: 'ログインが必要です。' },
            { status: 401 }
        );
    }

    // JWTからuserIdを取得
    const payload = await verifyToken(token);
    const userId = Number(payload?.userId);

    if (!userId) {
        return NextResponse.json(
            { message: '認証情報が不正です。' },
            { status: 401 }
        );
    }

    try {
        const result = await executeQuery(
            `SELECT
                p.id,
                p.name,
                p.price,
                p.image_url
             FROM favorites f
             INNER JOIN products p
                ON f.product_id = p.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC;`,
            [userId]
        );

        // お気に入りが0件でも正常
        return NextResponse.json(result);

    } catch (err) {
        console.error('お気に入り取得エラー：', err);

        return NextResponse.json(
            { message: 'サーバーエラーが発生しました。' },
            { status: 500 }
        );
    }
}
export async function POST(request: NextRequest) {
    try {
        const { productId } = await request.json();

        // JWTを取得
        const token = request.cookies.get(AUTH_TOKEN)?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'ログインが必要です。' },
                { status: 401 }
            );
        }

        // JWTからuserIdを取得
        const payload = await verifyToken(token);
        const userId = Number(payload?.userId);

        console.log('payload:', payload);
        console.log('userId:', userId);
        console.log('productId:', productId);

        if (!userId) {
            return NextResponse.json(
                { message: '認証情報が不正です。' },
                { status: 401 }
            );
        }

        await executeQuery(
            `INSERT IGNORE INTO favorites
             (product_id, user_id, created_at)
             VALUES (?, ?, ?);`,
            [productId, userId, new Date()]
        );

        return NextResponse.json({
            message: 'お気に入り登録が完了しました。'
        });

    } catch (err) {
        console.error('お気に入り登録エラー：', err);

        return NextResponse.json(
            { message: 'お気に入り登録に失敗しました。' },
            { status: 500 }
        );
    }
}