import { useQuery } from '@tanstack/react-query'
import { Grid, Paper, Text, Title, Badge, Group, Stack, Card, Box, SimpleGrid } from '@mantine/core'
import { IconMapPin, IconUsers, IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import { locationService } from '../services/locationService'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: locationService.getLocations,
  })

  const stats = {
    total: locations.length,
    active: locations.filter(l => !l.is_resolved).length,
    resolved: locations.filter(l => l.is_resolved).length,
    critical: locations.filter(l => l.is_critical).length,
  }

  const recentLocations = locations.slice(0, 5)

  return (
    <Stack gap={{ base: 'sm', sm: 'md' }}>
      <Box>
        <Title order={2} size={{ base: 'h3', sm: 'h2' }}>Dashboard</Title>
        <Text c="dimmed" size={{ base: 'sm', sm: 'md' }}>
          Welcome back, {user?.full_name || user?.email}
        </Text>
      </Box>

      <SimpleGrid 
        cols={{ base: 1, sm: 2, md: 4 }} 
        spacing={{ base: 'sm', sm: 'md' }}
      >
        <Card withBorder p={{ base: 'sm', sm: 'md' }}>
          <Group gap={{ base: 'sm', sm: 'md' }}>
            <IconMapPin size={{ base: 16, sm: 20 }} color="blue" />
            <Box>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed">Total Locations</Text>
              <Text size={{ base: 'lg', sm: 'xl' }} fw={700}>{stats.total}</Text>
            </Box>
          </Group>
        </Card>

        <Card withBorder p={{ base: 'sm', sm: 'md' }}>
          <Group gap={{ base: 'sm', sm: 'md' }}>
            <IconAlertTriangle size={{ base: 16, sm: 20 }} color="orange" />
            <Box>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed">Active Outages</Text>
              <Text size={{ base: 'lg', sm: 'xl' }} fw={700}>{stats.active}</Text>
            </Box>
          </Group>
        </Card>

        <Card withBorder p={{ base: 'sm', sm: 'md' }}>
          <Group gap={{ base: 'sm', sm: 'md' }}>
            <IconCheck size={{ base: 16, sm: 20 }} color="green" />
            <Box>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed">Resolved</Text>
              <Text size={{ base: 'lg', sm: 'xl' }} fw={700}>{stats.resolved}</Text>
            </Box>
          </Group>
        </Card>

        <Card withBorder p={{ base: 'sm', sm: 'md' }}>
          <Group gap={{ base: 'sm', sm: 'md' }}>
            <IconUsers size={{ base: 16, sm: 20 }} color="red" />
            <Box>
              <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed">Critical</Text>
              <Text size={{ base: 'lg', sm: 'xl' }} fw={700}>{stats.critical}</Text>
            </Box>
          </Group>
        </Card>
      </SimpleGrid>

      <Paper withBorder p={{ base: 'sm', sm: 'md' }}>
        <Title order={3} mb="md" size={{ base: 'h4', sm: 'h3' }}>
          Recent Locations
        </Title>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : recentLocations.length === 0 ? (
          <Text c="dimmed">No locations found</Text>
        ) : (
          <Stack gap={{ base: 'xs', sm: 'sm' }}>
            {recentLocations.map((location) => (
              <Group key={location.id} justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={500} size={{ base: 'sm', sm: 'md' }} truncate>
                    {location.name}
                  </Text>
                  <Text size={{ base: 'xs', sm: 'sm' }} c="dimmed" truncate>
                    {location.city}, {location.state}
                  </Text>
                </Box>
                <Badge 
                  color={location.is_critical ? 'red' : location.is_resolved ? 'green' : 'blue'}
                  size={{ base: 'sm', sm: 'md' }}
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
