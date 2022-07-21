import { Paper, Group, Image, Text, Center } from "@mantine/core";
import { useRouter } from "next/router";
import { X } from "tabler-icons-react";
import { Action, ActionGroup } from "./action";
import { interactive } from "./styles";

export const Song = ({ index, artist, title, id, image, player, type }: { index?: number, artist: string, title: string, id: string, image: string, player: any, type?: "link" | "queue" }) => {
    type = type || "link"
    const router = useRouter()
    return (<Paper sx={type === "link" ? interactive : {}} onClick={type === "link" ? () => { player.quickPlay(id).then(() => { router.push("/player") }) } : () => { }} p="sm" style={{ width: '100%' }} withBorder>
        <Group direction="row" position="apart">
            <Group direction="row">
                <div style={{ display: 'inline-block', overflow: 'hidden', width: 50 }} className="img-wrapper">
                    <Image width={50} alt={title} src={image} />
                </div>
                <Group direction="column" spacing={0}>
                    <Text size="xl">{title}</Text>
                    <Text>{artist}</Text>
                </Group>
            </Group>
            {type === "queue" && index && <Group position="right">
                <ActionGroup>
                    <Action onClick={() => { player.removeFromQueue(index - 1) }}>
                        <X />
                    </Action>
                </ActionGroup>
            </Group>}
        </Group>
    </Paper>)
}