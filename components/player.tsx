import { useLocalStorage } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { RefObject, useCallback, useEffect, useState } from "react";
import { SortAscending, SortDescending } from "tabler-icons-react";
import { apiCall } from "./api";
import { localized } from "./localization";

const myShift = (list: Array<any>) => {
    list.shift()
    return list
}

export const usePlayer = (player: RefObject<null | HTMLAudioElement>) => {
    // play, queue(state), paused(state), loop(state: 0,1,2)
    const [paused, setPaused] = useState<boolean>(true)
    const [queue, setQueue] = useState<Array<any>>([])
    const [streams, setStreams] = useState<any>({})
    const [playerDisp, setPlayerDisp] = useState<any>({})
    const router = useRouter()

    useEffect(() => {
        if (!Object.keys(streams).length) { return }
        window.dispatchEvent(new Event("ossia-song-update"))
        setPlayerDisp({
            "ARTIST": streams.uploader,
            "SONG": streams.title,
            "ALBUMART": streams.thumbnailUrl
        })
        apiCall("GET", "/api/youtube/recognize", { v: streams.thumbnailUrl.split("/")[4] }).then(resp => {
            if (resp.length === 1 && Object.keys(streams).length) {
                window.dispatchEvent(new Event("ossia-song-update"))
                setPlayerDisp((old: any) => ({ ...old, ...resp[0] }))
            }
        })
    }, [streams, setPlayerDisp])

    useEffect(() => {
        if (player.current === null) { return }
        if (paused) {
            if (!player.current.paused) {
                player.current.pause()
            }
        } else {
            if (player.current.paused) {
                player.current.play()
            }
        }
    }, [paused])

    const play = (p_streams: any) => {
        setStreams(p_streams)
        if (player.current === null) { return }
        player.current.src = p_streams.audioStreams[p_streams.audioStreams.length - 1].url
        if (player.current.paused) { player.current.play().then(() => { setPaused(player.current!.paused) }) }
    }

    const pop = () => {
        setQueue([])
        window.dispatchEvent(new Event("ossia-song-update"))
        player.current!.src = ""
        setStreams({})
        setPlayerDisp({})
        if (router.pathname === "/player") { router.replace("/") }
    }

    const quickPlay = (id: string) => {
        apiCall("GET", "/api/piped/streams", { v: id }).then(resp => { play(resp) })
    }

    const addToQueue = (id: string, place: "first" | "last" = "first", alert: boolean = true) => {
        if (alert) { showNotification({ title: localized.addedToQueue, message: localized.addFirst, icon: <SortAscending /> }) }
        let q = (place === "first" ? [id, ...queue] : [...queue, id])
        setQueue(q)
        window.dispatchEvent(new Event("ossia-queue-update"))
        apiCall("GET", "/api/youtube/recognize", { v: id }).then(([recog]: any) => {
            apiCall("GET", "/api/piped/streams", { v: id }).then(resp => {
                let arr = q
                const index = arr.indexOf(id)
                if (index !== -1) {
                    let arr = q
                    const index = arr.indexOf(id)
                    arr[index] = { ...resp, ...recog }
                    setQueue(arr)
                    window.dispatchEvent(new Event("ossia-queue-update"))
                }
            })
        })
    }

    useEffect(() => {
        player.current!.onended = () => {
            if (!queue.length) {
                if (!streams.relatedStreams) { return }
                quickPlay(streams.relatedStreams[0].url.split("?v=")[1])
            } else {
                if (typeof queue[0] === 'string') {
                    quickPlay(queue[0])
                } else {
                    play(queue[0])
                }
                setQueue(myShift(queue))
            }
        }
    }, [streams, queue])

    useEffect(() => {
        if (queue.length) {
            if (player.current!.src.startsWith(document.location.origin) || !player.current!.src) {
                if (typeof queue[0] === 'string') {
                    quickPlay(queue[0])
                } else {
                    play(queue[0])
                }
                setQueue(myShift(queue))
            }
        }
    }, [queue])

    return {
        paused: [paused, setPaused],
        queue: [queue, setQueue],
        play,
        playerRef: player,
        streams,
        playerDisp,
        addToQueue,
        quickPlay,
        pop,
    }
}