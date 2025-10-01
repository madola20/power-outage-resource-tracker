import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Paper,
  Text,
  Title,
  TextInput,
  Select,
  Button,
  Stack,
  Group,
  Grid,
  Alert,
  Box,
  Badge
} from '@mantine/core'
import { IconAlertCircle, IconMapPin, IconCheck, IconArrowLeft } from '@tabler/icons-react'
import { locationService, userService } from '../services/locationService'
import { useAuthStore } from '../stores/authStore'

interface FormData {
  reporter_email: string
  reporter_phone: string
  status: string
  assigned_to: string
  priority: string
}

interface FormErrors {
  [key: string]: string
}

const STATUS_OPTIONS = [
  { value: 'reported', label: 'Reported' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function LocationEditForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState<FormData>({
    reporter_email: '',
    reporter_phone: '',
    status: 'reported',
    assigned_to: '',
    priority: 'medium',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Phone number formatting utility
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format as (xxx) xxx-xxxx
    if (phoneNumber.length === 0) return ''
    if (phoneNumber.length <= 3) return `(${phoneNumber}`
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  // Fetch location data
  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getLocation(id!),
    enabled: !!id,
  })

  // Fetch users for assignment dropdown (only for team leads and admins)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({ page_size: 100 }), // Get all users
    enabled: !!user && (user.role === 'admin' || user.role === 'team_lead'),
  })

  // Populate form when location data is loaded
  useEffect(() => {
    if (location) {
      setFormData({
        reporter_email: location.reporter_email || '',
        reporter_phone: location.reporter_phone ? formatPhoneNumber(location.reporter_phone) : '',
        status: location.status,
        assigned_to: location.assigned_to?.id || '',
        priority: location.priority,
      })
    }
  }, [location])

  const updateLocationMutation = useMutation({
    mutationFn: (data: any) => locationService.updateLocation(id!, data),
    onSuccess: () => {
      navigate(`/location/${id}`)
    },
    onError: (error: any) => {
      console.error('Error updating location:', error)
      setErrors({ general: 'Failed to update location. Please try again.' })
    },
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.reporter_email.trim()) {
      newErrors.reporter_email = 'Email address is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.reporter_email.trim())) {
        newErrors.reporter_email = 'Please enter a valid email address'
      }
    }

    // Phone validation
    if (!formData.reporter_phone.trim()) {
      newErrors.reporter_phone = 'Phone number is required'
    } else {
      // Remove all non-numeric characters for validation
      const cleanPhone = formData.reporter_phone.replace(/\D/g, '')
      // Check if it's a valid 10-digit US phone number
      if (cleanPhone.length !== 10) {
        newErrors.reporter_phone = 'Please enter a valid 10-digit phone number'
      }
    }

    // Status validation for reporters
    if (user?.role === 'reporter' && formData.status !== 'cancelled') {
      newErrors.status = 'Reporters can only change status to "Cancelled"'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const updateData: any = {
        reporter_email: formData.reporter_email.trim(),
        reporter_phone: formData.reporter_phone.replace(/\D/g, ''), // Strip non-numeric characters
        status: formData.status as 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'cancelled',
      }

      // Only include assigned_to if user has permission to assign
      if (user?.role === 'admin' || user?.role === 'team_lead' || user?.role === 'team_member') {
        updateData.assigned_to = formData.assigned_to || null
      }

      // Only include priority if user has permission to update it
      if (user?.role === 'admin' || user?.role === 'team_lead') {
        updateData.priority = formData.priority as 'low' | 'medium' | 'high' | 'critical'
      }

      await updateLocationMutation.mutateAsync(updateData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/location/${id}`)
  }

  // Check if user can edit this location
  const canEdit = location && (
    user?.role === 'admin' ||
    user?.role === 'team_lead' ||
    (user?.role === 'team_member' && location.assigned_to?.id === user.id) ||
    (user?.role === 'reporter' && location.reported_by?.id === user.id)
  )

  if (isLoading) {
    return <Text>Loading location...</Text>
  }

  if (error || !location) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        Location not found or you don't have permission to view it.
      </Alert>
    )
  }

  if (!canEdit) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        You don't have permission to edit this location.
      </Alert>
    )
  }

  // Helper function to get assignment options based on user role
  const getAssignmentOptions = () => {
    if (!usersData?.results) return []

    const options = []

    if (user?.role === 'team_member') {
      // Team members can only assign to themselves
      const displayName = user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email
      options.push({
        value: user.id,
        label: `${displayName} (You)`,
      })
    } else if (user?.role === 'team_lead') {
      // Team leads can assign to team members
      const teamMembers = usersData.results.filter(u => u.role === 'team_member')
      options.push(
        { value: '', label: 'Unassigned' },
        ...teamMembers.map(u => ({
          value: u.id,
          label: u.full_name || `${u.first_name} ${u.last_name}`.trim() || u.email,
        }))
      )
    } else if (user?.role === 'admin') {
      // Admins can assign to anyone
      options.push(
        { value: '', label: 'Unassigned' },
        ...usersData.results
          .filter(u => u.role !== 'reporter') // Exclude reporters
          .map(u => ({
            value: u.id,
            label: `${u.full_name || `${u.first_name} ${u.last_name}`.trim() || u.email} (${u.role_display})`,
          }))
      )
    }

    return options
  }

  // Helper function to get assignment help text
  const getAssignmentHelpText = () => {
    if (user?.role === 'team_member') {
      return 'You can assign this location to yourself'
    } else if (user?.role === 'team_lead') {
      return 'You can assign this location to any team member'
    } else if (user?.role === 'admin') {
      return 'You can assign this location to any team member or team lead'
    }
    return ''
  }

  return (
    <Stack gap="md" p="xs">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(`/location/${id}`)}
          size="sm"
        >
          Back to Location
        </Button>
      </Group>

      <Box>
        <Title order={2} size="h3">Edit Location</Title>
        <Text c="dimmed" size="sm">
          {location.name} - {location.city}, {location.state}
        </Text>
        <Group mt="sm" gap="xs">
          <Badge color="blue" size="sm">{location.status_display}</Badge>
          <Badge color="orange" variant="light" size="sm">{location.priority_display}</Badge>
        </Group>
      </Box>

      {errors.general && (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {errors.general}
        </Alert>
      )}

      <Paper withBorder p="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            {/* Contact Information */}
            <Box>
              <Title order={3} mb="sm" size="h5">
                <IconMapPin size={16} style={{ display: 'inline', marginRight: 8 }} />
                Contact Information
              </Title>
              
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Reporter Email"
                    placeholder="email@example.com"
                    value={formData.reporter_email}
                    onChange={(e) => handleInputChange('reporter_email', e.target.value)}
                    error={errors.reporter_email}
                    required
                    type="email"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Reporter Phone"
                    placeholder="(555) 123-4567"
                    value={formData.reporter_phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      handleInputChange('reporter_phone', formatted)
                    }}
                    error={errors.reporter_phone}
                    required
                    type="tel"
                    maxLength={14} // (xxx) xxx-xxxx format
                  />
                </Grid.Col>
              </Grid>
            </Box>

            {/* Status Update */}
            <Box>
              <Title order={3} mb="sm" size="h5">
                Status Update
              </Title>
              
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Select
                    label="Status"
                    placeholder="Select status"
                    data={user?.role === 'reporter' 
                      ? STATUS_OPTIONS.filter(option => option.value === 'cancelled')
                      : STATUS_OPTIONS
                    }
                    value={formData.status}
                    onChange={(value) => handleInputChange('status', value || 'reported')}
                    error={errors.status}
                    required
                  />
                  {user?.role === 'reporter' && (
                    <Text size="xs" c="dimmed" mt={4}>
                      Reporters can only change status to "Cancelled"
                    </Text>
                  )}
                </Grid.Col>
              </Grid>
            </Box>

            {/* Priority Section - Only show for team leads and admins */}
            {(user?.role === 'team_lead' || user?.role === 'admin') && (
              <Box>
                <Title order={3} mb="sm" size="h5">
                  Priority
                </Title>
                
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Select
                      label="Priority Level"
                      placeholder="Select priority"
                      data={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'critical', label: 'Critical' },
                      ]}
                      value={formData.priority}
                      onChange={(value) => handleInputChange('priority', value || 'medium')}
                      error={errors.priority}
                      required
                    />
                    <Text size="xs" c="dimmed" mt={4}>
                      Set the priority level for this location
                    </Text>
                  </Grid.Col>
                </Grid>
              </Box>
            )}

            {/* Assignment Section - Only show for team members, team leads, and admins */}
            {(user?.role === 'team_member' || user?.role === 'team_lead' || user?.role === 'admin') && (
              <Box>
                <Title order={3} mb="sm" size="h5">
                  Assignment
                </Title>
                
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Select
                      label="Assign To"
                      placeholder="Select assignee"
                      data={getAssignmentOptions()}
                      value={formData.assigned_to}
                      onChange={(value) => handleInputChange('assigned_to', value || '')}
                      error={errors.assigned_to}
                      clearable
                      searchable
                    />
                    <Text size="xs" c="dimmed" mt={4}>
                      {getAssignmentHelpText()}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Box>
            )}

            {/* Form Actions */}
            <Group justify="flex-end" mt="lg" gap="sm">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                leftSection={<IconCheck size={16} />}
                fullWidth
              >
                Update Location
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
