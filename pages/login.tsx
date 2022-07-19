import { Box, Button, Container, Group, PasswordInput, Text, TextInput } from "@mantine/core";
import type { NextPage } from "next";
import { useForm } from "@mantine/form"
import Link from "next/link";
import { interactive } from "../components/styles";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { apiCall } from "../components/api";
import Head from "next/head";
import { localized } from "../components/localization";

function caesar(str: string, num: number) {
    var result = '';
    var charcode = 0;
    for (var i = 0; i < str.length; i++) {
        charcode = ((str[i].charCodeAt(0)) + num) % 65535;
        result += String.fromCharCode(charcode);
    }
    return result;
}

const Login: NextPage = () => {
    const router = useRouter()
    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
    })

    useEffect(() => {
        if (router.query['u']) { form.setFieldValue("username", router.query['u'] as string) }
    }, [router])

    const login = (values: any) => {
        const salt = Number(`${(new Date().getDate())}67${(new Date().getMonth())}`)
        let password = caesar(values["password"], salt)
        apiCall("POST", "/api/user/login", { username: values.username, password: password }).then(resp => {
            if (resp) { router.replace("/library") }
        })
    }

    return (<Container>
        <Head>
            <title>{localized.login} | Ossia</title>
        </Head>
        <Box sx={{ maxWidth: 300 }} mx="auto">
            <form onSubmit={form.onSubmit((values) => login(values))}>
                <Group spacing="sm" grow direction="column">
                    <TextInput radius="lg" required {...form.getInputProps("username")} label={localized.username} size="lg" />
                    <PasswordInput autoComplete="current-password" radius="lg" required {...form.getInputProps("password")} label={localized.password} size="lg" />
                    <Button variant="light" size="lg" type="submit">{localized.login}</Button>
                    <Text size="sm" sx={interactive}><Link replace href="/register">{localized.registerText}</Link></Text>
                </Group>
            </form>
        </Box>
    </Container>)
}

export default Login