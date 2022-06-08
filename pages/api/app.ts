// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: any,
    res: NextApiResponse<object>
) {
    const app: Object = {
        'version': "1.0.3",
        'fullName': "Ossia Music Player (BETA)"
    }
    res.status(200).json(app)
}
