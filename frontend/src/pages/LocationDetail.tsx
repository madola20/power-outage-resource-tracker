import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Paper, Text, Title, Badge, Group, Stack, Button, 
  Select, Textarea, Grid, Card, Divider 
} from '@mantine/core'
import { IconMapPin, IconUser, IconCalendar, IconEdit } from '@tabler/icons-react'
import { locationService } from '../services/locationService'
import { useAuthStore } from '../stores/authStore'

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getLocation(id!),
    enabled: !!id,
  })

  const { data: updates = [] } = useQuery({
    queryKey: ['location-updates', id],
    queryFn: () => locationService.getLocationUpdates(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return <Text>Loading location details...</Text>
  }

  if (!location) {
    return <Text>Location not found</Text>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'green'
      case 'cancelled': return 'gray'
      case 'critical': return 'red'
      case 'in_progress': return 'blue'
      case 'investigating': return 'yellow'
      default: return 'blue'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'blue'
    }
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>{location.name}</Title>
        <Group>
          <Badge color={getStatusColor(location.status)} size="lg">
            {location.status_display}
          </Badge>
          <Badge color={getPriorityColor(location.priority)} variant="light" size="lg">
            {location.priority_display}
          </Badge>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <Paper withBorder p="md">
              <Title order={3} mb="md">Location Details</Title>
              <Stack gap="sm">
                <Group>
                  <IconMapPin size={16} />
                  <Text>{location.address}</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {location.city}, {location.state} {location.zip_code}
                </Text>
                {location.description && (
                  <div>
                    <Text fw={500} mb="xs">Description:</Text>
                    <Text>{location.description}</Text>
                  </div>
                )}
                {location.estimated_customers_affected && (
                  <Text>
                    <Text component="span" fw={500}>Customers Affected:</Text>{' '}
                    {location.estimated_customers_affected.toLocaleString()}
                  </Text>
                )}
              </Stack>
            </Paper>

            <Paper withBorder p="md">
              <Title order={3} mb="md">Updates</Title>
              {updates.length === 0 ? (
                <Text c="dimmed">No updates yet</Text>
              ) : (
                <Stack gap="sm">
                  {updates.map((update) => (
                    <div key={update.id}>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{update.update_type_display}</Text>
                        <Text size="sm" c="dimmed">
                          {new Date(update.created_at).toLocaleString()}
                        </Text>
                      </Group>
                      <Text size="sm">{update.notes}</Text>
                      {update.updated_by && (
                        <Text size="xs" c="dimmed">
                          by {update.updated_by.full_name}
                        </Text>
                      )}
                      <Divider mt="sm" />
                    </div>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Paper withBorder p="md">
              <Title order={3} mb="md">Assignment</Title>
              <Stack gap="sm">
                <Group>
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" c="dimmed">Assigned To</Text>
                    <Text fw={500}>
                      {location.assigned_to ? location.assigned_to.full_name : 'Unassigned'}
                    </Text>
                  </div>
                </Group>
                <Group>
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" c="dimmed">Reported By</Text>
                    <Text fw={500}>
                      {location.reported_by ? location.reported_by.full_name : 'Unknown'}
                    </Text>
                  </div>
                </Group>
                {location.reporter_contact && (
                  <div>
                    <Text size="sm" c="dimmed">Contact</Text>
                    <Text fw={500}>{location.reporter_contact}</Text>
                  </div>
                )}
              </Stack>
            </Paper>

            <Paper withBorder p="md">
              <Title order={3} mb="md">Timeline</Title>
              <Stack gap="sm">
                <Group>
                  <IconCalendar size={16} />
                  <div>
                    <Text size="sm" c="dimmed">Reported</Text>
                    <Text fw={500}>
                      {new Date(location.reported_at).toLocaleString()}
                    </Text>
                  </div>
                </Group>
                {location.estimated_restoration && (
                  <Group>
                    <IconCalendar size={16} />
                    <div>
                      <Text size="sm" c="dimmed">Est. Restoration</Text>
                      <Text fw={500}>
                        {new Date(location.estimated_restoration).toLocaleString()}
                      </Text>
                    </div>
                  </Group>
                )}
                {location.actual_restoration && (
                  <Group>
                    <IconCalendar size={16} />
                    <div>
                      <Text size="sm" c="dimmed">Actual Restoration</Text>
                      <Text fw={500}>
                        {new Date(location.actual_restoration).toLocaleString()}
                      </Text>
                    </div>
                  </Group>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
