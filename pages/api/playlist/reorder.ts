import type { NextApiRequest, NextApiResponse } from 'next'
import { getJWT } from '../../../components/jwt'
import executeQuery from '../../../components/mysql'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    return new Promise((resolve, reject) => {
        const { username } = getJWT(req, res)
        const { playlistid, from, to } = JSON.parse(req.body)
        executeQuery("SELECT author FROM playlists WHERE (`id` = ?);", [playlistid]).then(async author => {
            if (author[0]) {
                if (author[0].author === username) {
                    executeQuery("UPDATE `playlist-14` SET `index` = ? WHERE (`index` = ?);UPDATE `playlist-14` SET `index` = ? WHERE (`index` = ?);", [to, from, from, to]).then(resp => {
                        return resolve(res.status(200).json(resp))
                    })
                } else {
                    return resolve(res.status(200).json(false))
                }
            } else {
                return resolve(res.status(200).json(false))
            }
        })
    })
}
