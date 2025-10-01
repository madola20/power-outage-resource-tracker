import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Paper, Text, Title, Badge, Group, Stack, Card, Box, SimpleGrid } from '@mantine/core'
import { IconMapPin, IconUsers, IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import { locationService } from '../services/locationService'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations-all'],
    queryFn: locationService.getAllLocations,
  })

  const stats = {
    total: locations.length,
    active: locations.filter(l => !l.is_resolved).length,
    resolved: locations.filter(l => l.is_resolved).length,
    critical: locations.filter(l => l.is_critical).length,
  }

  const recentLocations = locations.slice(0, 5)

  return (
    <Stack gap="md">
      <Box>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed" size="md">
          Welcome back, {user?.full_name || user?.email}
        </Text>
      </Box>

      <SimpleGrid cols={4} spacing="md">
        <Card withBorder p="md">
          <Group gap="md">
            <IconMapPin size={20} color="blue" />
            <Box>
              <Text size="sm" c="dimmed">Total Locations</Text>
              <Text size="xl" fw={700}>{stats.total}</Text>
            </Box>
          </Group>
        </Card>

        <Card withBorder p="md">
          <Group gap="md">
            <IconAlertTriangle size={20} color="orange" />
            <Box>
              <Text size="sm" c="dimmed">Active Outages</Text>
              <Text size="xl" fw={700}>{stats.active}</Text>
            </Box>
          </Group>
        </Card>

        <Card withBorder p="md">
          <Group gap="md">
            <IconCheck size={20} color="green" />
            <Box>
              <Text size="sm" c="dimmed">Resolved</Text>
              <Text size="xl" fw={700}>{stats.resolved}</Text>
            </Box>
          </Group>
        </Card>

        <Card withBorder p="md">
          <Group gap="md">
            <IconUsers size={20} color="red" />
            <Box>
              <Text size="sm" c="dimmed">Critical</Text>
              <Text size="xl" fw={700}>{stats.critical}</Text>
            </Box>
          </Group>
        </Card>
      </SimpleGrid>

      <Paper withBorder p="md">
        <Title order={3} mb="md">
          Recent Locations
        </Title>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : recentLocations.length === 0 ? (
          <Text c="dimmed">No locations found</Text>
        ) : (
          <Stack gap="sm">
            {recentLocations.map((location) => (
              <Group 
                key={location.id} 
                justify="space-between" 
                wrap="nowrap"
                style={{ 
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={() => navigate(`/location/${location.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={500} size="md" truncate>
                    {location.name}
                  </Text>
                  <Text size="sm" c="dimmed" truncate>
                    {location.city}, {location.state}
                  </Text>
                </Box>
                <Badge 
                  color={location.is_critical ? 'red' : location.is_resolved ? 'green' : 'blue'}
                  size="md"
                >
                  {location.status_display}
                </Badge>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}
