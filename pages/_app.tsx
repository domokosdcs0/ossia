import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppShell, Text, Burger, Center, Footer, Group, Header, LoadingOverlay, MantineProvider, MediaQuery, Navbar, Paper, Title } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NotificationsProvider, showNotification } from '@mantine/notifications'
import { useEventListener } from "@mantine/hooks"
import { ReactNode, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Books, BrandLastfm, Home, InfoCircle, PlayerPlay, Search, Settings, X } from "tabler-icons-react"
import { useManifest } from '../components/manifest'
import { interactive } from '../components/styles'
import { useHotkeys, useLocalStorage } from '@mantine/hooks'
import { localized } from '../components/localization'
import { useCookies } from "react-cookie"
import theme from '../components/theme'
import { apiCall } from '../components/api'
import { useRouter } from 'next/router'

const NavLink = ({ link, icon, label }: { link: string, icon: ReactNode, label: ReactNode }) => {
  return (<Link href={link}>
    <Paper component='button' style={{ background: 'rgba(0,0,0,.2)' }} tabIndex={0} radius="lg" onClick={() => { window.dispatchEvent(new Event("ossia-nav-click")) }} sx={interactive} p='md' withBorder>
      <Group direction='row'>
        {icon}
        <Text>{label}</Text>
      </Group>
    </Paper>
  </Link>)
}

const AppHeader = ({ manifest, sidebar }: { manifest: any, sidebar: any }) => {
  return (<Header height={70} p="md">
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
        <Burger
          title="Navigation"
          opened={sidebar[0]}
          onClick={() => sidebar[1]((o: boolean) => !o)}
          size="sm"
          mr="xl"
        />
      </MediaQuery>

      <Center>
        <Link href="/"><Title onClick={() => {
          window.dispatchEvent(new Event("ossia-title-click"))
        }} onMouseDown={(e) => { e.preventDefault() }} className='click'>{manifest?.short_name}</Title></Link>
      </Center>
    </div>
  </Header>)
}

const AppFooter = ({ manifest, sidebar }: { manifest: any, sidebar: any }) => {
  return (<Footer height={60} p="md">
    <Center>
      <Link href="/about">
        <Group onClick={() => { window.dispatchEvent(new Event("ossia-nav-click")); sidebar[1](false) }} sx={interactive}>
          <Text align='center'>{manifest?.short_name} {localized.appNameAppend}{manifest?.version ? ` v${manifest.version}` : ''}</Text>
        </Group>
      </Link>
    </Center>
  </Footer>)
}

const AppNavbar = ({ cookies, sidebar }: { cookies: any, sidebar: any }) => {
  return (<Navbar p="md" hiddenBreakpoint="sm" hidden={!sidebar[0]} width={{ sm: 200, lg: 300 }}>
    <Group grow direction='column' spacing='sm'>
      <NavLink icon={<Search />} label={localized.navSearch} link="/" />
      <NavLink icon={<Books />} label={localized.navLibrary} link="" />
      <NavLink icon={<Settings />} label={localized.settings} link="/settings" />
    </Group>
  </Navbar>)
}

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false)
  const sidebar = useState(false);
  const manifest = useManifest()
  const router = useRouter()
  const [cookies, setCookies, removeCookies] = useCookies(["lang", "auth"])
  useEffect(() => {
    if (!cookies.lang) {
      setCookies("lang", localized.getInterfaceLanguage())
    } else {
      localized.setLanguage(cookies.lang)
    }
  }, [cookies.lang, setCookies])

  return (<>
    <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
      <AppShell
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        fixed
        navbar={<AppNavbar sidebar={sidebar} cookies={cookies} />}
        footer={<AppFooter sidebar={sidebar} manifest={manifest} />}
        header={<AppHeader sidebar={sidebar} manifest={manifest} />}
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        })}
      >
        <ModalsProvider>
          <NotificationsProvider>
            <LoadingOverlay visible={loading} sx={{ position: 'fixed' }} />
            <Component {...pageProps} />
          </NotificationsProvider>
        </ModalsProvider>
      </AppShell>
    </MantineProvider>
  </>)
}

export default MyApp
