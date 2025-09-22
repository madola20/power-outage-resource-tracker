import { ReactNode, useState } from 'react'
import { AppShell, Navbar, Header, Text, Group, Button, Avatar, Menu, Burger, Stack, Box } from '@mantine/core'
import { IconLogout, IconUser, IconSettings, IconDashboard, IconMapPin } from '@tabler/icons-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [opened, { toggle }] = useDisclosure()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    toggle() // Close mobile menu after navigation
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={{ base: 'sm', sm: 'md' }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: 'sm', sm: 'md' }} justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size={{ base: 'lg', sm: 'xl' }} fw={700} c="blue">
              Scout
            </Text>
          </Group>
          <Group>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button 
                  variant="subtle" 
                  leftSection={<Avatar size="sm" />}
                  size="sm"
                >
                  <Box hiddenFrom="xs">
                    <Text size="xs" truncate>
                      {user?.first_name || user?.email?.split('@')[0]}
                    </Text>
                  </Box>
                  <Box visibleFrom="xs">
                    <Text size="sm" truncate>
                      {user?.full_name || user?.email}
                    </Text>
                  </Box>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="sm">
          <Text size="sm" c="dimmed" mb="sm">
            Navigation
          </Text>
          <Button
            variant="subtle"
            fullWidth
            justify="flex-start"
            leftSection={<IconDashboard size={16} />}
            onClick={() => handleNavigation('/dashboard')}
            size="sm"
          >
            Dashboard
          </Button>
          <Button
            variant="subtle"
            fullWidth
            justify="flex-start"
            leftSection={<IconMapPin size={16} />}
            onClick={() => handleNavigation('/locations')}
            size="sm"
          >
            Locations
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box p={{ base: 'sm', sm: 'md' }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
