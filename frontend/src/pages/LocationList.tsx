import { useQuery } from '@tanstack/react-query'
import { Table, Badge, Text, Title, Group, Button, Paper, Stack, Box, Card, Pagination, Center } from '@mantine/core'
import { IconPlus, IconMapPin, IconEye } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLocationNavigation } from '../hooks/useLocationNavigation'
import { locationService } from '../services/locationService'
import { useAuthStore } from '../stores/authStore'

export default function LocationList() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { navigateToLocation } = useLocationNavigation()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['locations', currentPage],
    queryFn: () => locationService.getLocations({ page: currentPage, page_size: pageSize }),
  })

  const locations = paginatedData?.results || []
  const totalPages = paginatedData ? Math.ceil(paginatedData.count / pageSize) : 0

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
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>
            Power Outage Locations
          </Title>
          {paginatedData && (
            <Text size="sm" c="dimmed" mt={4}>
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, paginatedData.count)} of {paginatedData.count} locations
            </Text>
          )}
        </div>
        {user?.role === 'reporter' && (
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/location/new')}
            size="md"
          >
            Report New Outage
          </Button>
        )}
      </Group>

      <Paper withBorder>
        {isLoading ? (
          <Text p="md">Loading locations...</Text>
        ) : locations.length === 0 ? (
          <Text p="md" c="dimmed">No locations found</Text>
        ) : (
          <>
            {/* Desktop Table View */}
            <Box visibleFrom="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Assigned To</Table.Th>
                    <Table.Th>Reported</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {locations.map((location) => (
                    <Table.Tr key={location.id}>
                      <Table.Td>
                        <div>
                          <Text fw={500}>{location.name}</Text>
                          <Text size="sm" c="dimmed">
                            <IconMapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                            {location.city}, {location.state}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(location.status)}>
                          {location.status_display}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getPriorityColor(location.priority)} variant="light">
                          {location.priority_display}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {location.assigned_to ? (
                          <Text size="sm">{location.assigned_to.full_name}</Text>
                        ) : (
                          <Text size="sm" c="dimmed">Unassigned</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(location.reported_at).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => navigateToLocation(location)}
                        >
                          View Details
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>

            {/* Mobile Card View */}
            <Box hiddenFrom="md">
              <Stack gap="sm" p="md">
                {locations.map((location) => (
                  <Card key={location.id} withBorder p="md">
                    <Stack gap="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text fw={500} size="sm" truncate>
                            {location.name}
                          </Text>
                          <Text size="xs" c="dimmed" truncate>
                            <IconMapPin size={10} style={{ display: 'inline', marginRight: 4 }} />
                            {location.city}, {location.state}
                          </Text>
                        </Box>
                        <Badge 
                          color={getStatusColor(location.status)}
                          size="sm"
                        >
                          {location.status_display}
                        </Badge>
                      </Group>
                      
                      <Group justify="space-between" wrap="nowrap">
                        <Badge 
                          color={getPriorityColor(location.priority)} 
                          variant="light"
                          size="sm"
                        >
                          {location.priority_display}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {new Date(location.reported_at).toLocaleDateString()}
                        </Text>
                      </Group>

                      {location.assigned_to && (
                        <Text size="xs" c="dimmed">
                          Assigned to: {location.assigned_to.full_name}
                        </Text>
                      )}

                      <Button
                        variant="light"
                        size="xs"
                        fullWidth
                        leftSection={<IconEye size={12} />}
                        onClick={() => navigateToLocation(location)}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Center mt="md">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                  withEdges
                />
              </Center>
            )}
          </>
        )}
      </Paper>
    </Stack>
  )
}
