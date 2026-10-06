import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { type FavoriteData } from '@/types/favorite';
import { verifyToken } from '@/lib/jwt';
import { AUTH_TOKEN } from '@/lib/auth';

// GET：商品がお気に入り登録されているか確認
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const productId = Number(id);

    // JWTを取得
    const token = request.cookies.get(AUTH_TOKEN)?.value;

    if (!token) {
        return NextResponse.json({ exists: false });
    }

    // JWTを復号してuser_idを取得
    const payload = await verifyToken(token);
    const userId = Number(payload?.userId);

    if (!userId) {
        return NextResponse.json({ exists: false });
    }

    try {
        const result = await executeQuery<FavoriteData>(
            `SELECT id
       FROM favorites
       WHERE product_id = ? AND user_id = ?;`,
            [productId, userId]
        );

        return result.length > 0
            ? NextResponse.json({ exists: true })
            : NextResponse.json({ exists: false });

    } catch (err) {
        console.error('お気に入り確認エラー：', err);

        return NextResponse.json(
            { message: 'お気に入りの確認に失敗しました。' },
            { status: 500 }
        );
    }
}


export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const productId = Number(id);

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
            `DELETE FROM favorites
             WHERE product_id = ? AND user_id = ?;`,
            [productId, userId]
        );

        console.log('お気に入り削除:', {
            productId,
            userId,
            result,
        });

        return NextResponse.json({
            message: 'お気に入りを削除しました。'
        });

    } catch (err) {
        console.error('お気に入り削除エラー:', err);

        return NextResponse.json(
            { message: 'お気に入り削除に失敗しました。' },
            { status: 500 }
        );
    }
}