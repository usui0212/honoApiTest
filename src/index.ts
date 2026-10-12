import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// 1. GET リクエストサンプル
app.get('/api/hello', (c) => {
  return c.json({
    message: 'Hello, Hono with Node.js!',
    timestamp: new Date().toISOString(),
  })
})

// 2. Zod による スキーマ定義
const userSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  age: z.number().min(0, { message: '年齢は0以上で指定してください' }).optional(),
})

// ユーザー作成用の POST API (zValidator でリクエストボディのバリデーションを実施)
app.post(
  '/api/users',
  zValidator('json', userSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        400
      )
    }
  }),
  async (c) => {
    // バリデーション済みのデータを取り出し
    const data = c.req.valid('json')

    // ここで DB 保存などの処理を実施するイメージ
    const newUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      ...data,
      createdAt: new Date().toISOString(),
    }

    return c.json(
      {
        success: true,
        message: 'ユーザーが正常に作成されました',
        user: newUser,
      },
      201
    )
  }
)

// 3. パラメータ付き GET API サンプル
app.get('/api/users/:id', (c) => {
  const id = c.req.param('id')
  return c.json({
    id,
    name: 'Sample User',
    email: 'user@example.com',
  })
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
