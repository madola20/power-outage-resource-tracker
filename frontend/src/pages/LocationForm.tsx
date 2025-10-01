import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Paper,
  Text,
  Title,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Stack,
  Group,
  Grid,
  Alert,
  Box
} from '@mantine/core'
import { IconAlertCircle, IconMapPin, IconCheck } from '@tabler/icons-react'
import { locationService } from '../services/locationService'
import { useAuthStore } from '../stores/authStore'

interface FormData {
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number
  longitude?: number
  priority: string
  description: string
  estimated_customers_affected?: number
  reporter_email: string
  reporter_phone: string
}

interface FormErrors {
  [key: string]: string
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function LocationForm() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    latitude: undefined,
    longitude: undefined,
    priority: 'medium',
    description: '',
    estimated_customers_affected: undefined,
    reporter_email: '',
    reporter_phone: '',
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

  // Auto-populate reporter email for all users
  useEffect(() => {
    if (user?.email && !formData.reporter_email) {
      setFormData(prev => ({ ...prev, reporter_email: user.email }))
    }
  }, [user, formData.reporter_email])

  const createLocationMutation = useMutation({
    mutationFn: locationService.createLocation,
    onSuccess: () => {
      navigate('/locations')
    },
    onError: (error: any) => {
      console.error('Error creating location:', error)
      setErrors({ general: 'Failed to create location. Please try again.' })
    },
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Location name must be at least 3 characters'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters'
    }

    if (!formData.state) {
      newErrors.state = 'State is required'
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip_code.trim())) {
      newErrors.zip_code = 'ZIP code must be in format 12345 or 12345-6789'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.reporter_email.trim()) {
      newErrors.reporter_email = 'Email address is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.reporter_email.trim())) {
        newErrors.reporter_email = 'Please enter a valid email address'
      }
    }

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

    // Optional field validation
    if (formData.estimated_customers_affected !== undefined && formData.estimated_customers_affected < 0) {
      newErrors.estimated_customers_affected = 'Number of customers affected cannot be negative'
    }

    if (formData.latitude !== undefined && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }

    if (formData.longitude !== undefined && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
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
      await createLocationMutation.mutateAsync({
        ...formData,
        // Clean up the data
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        zip_code: formData.zip_code.trim(),
        description: formData.description.trim(),
        reporter_email: formData.reporter_email.trim(),
        reporter_phone: formData.reporter_phone.replace(/\D/g, ''), // Strip non-numeric characters
        priority: formData.priority as 'low' | 'medium' | 'high' | 'critical',
        // Remove undefined values
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        estimated_customers_affected: formData.estimated_customers_affected || undefined,
      })
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/locations')
  }

  return (
    <Stack gap="md">
      <Box>
        <Title order={2}>Report New Power Outage</Title>
        <Text c="dimmed" size="md">
          Please provide details about the power outage location
        </Text>
      </Box>

      {errors.general && (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {errors.general}
        </Alert>
      )}

      <Paper withBorder p="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {/* Location Information */}
            <Box>
              <Title order={3} mb="md" size="h4">
                <IconMapPin size={20} style={{ display: 'inline', marginRight: 8 }} />
                Location Information
              </Title>
              
              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    label="Location Name"
                    placeholder="e.g., Downtown Business District, Residential Area"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    required
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Textarea
                    label="Full Address"
                    placeholder="Enter the complete street address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={errors.address}
                    required
                    minRows={2}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <TextInput
                    label="City"
                    placeholder="City name"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    error={errors.city}
                    required
                  />
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <Select
                    label="State"
                    placeholder="Select state"
                    data={US_STATES}
                    value={formData.state}
                    onChange={(value) => handleInputChange('state', value || '')}
                    error={errors.state}
                    required
                    searchable
                  />
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <TextInput
                    label="ZIP Code"
                    placeholder="12345"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    error={errors.zip_code}
                    required
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <NumberInput
                    label="Latitude (Optional)"
                    placeholder="e.g., 33.7490"
                    value={formData.latitude}
                    onChange={(value) => handleInputChange('latitude', value)}
                    error={errors.latitude}
                    decimalScale={6}
                    min={-90}
                    max={90}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <NumberInput
                    label="Longitude (Optional)"
                    placeholder="e.g., -84.3880"
                    value={formData.longitude}
                    onChange={(value) => handleInputChange('longitude', value)}
                    error={errors.longitude}
                    decimalScale={6}
                    min={-180}
                    max={180}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            {/* Outage Details */}
            <Box>
              <Title order={3} mb="md" size="h4">
                Outage Details
              </Title>
              
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Priority Level"
                    placeholder="Select priority"
                    data={PRIORITY_OPTIONS}
                    value={formData.priority}
                    onChange={(value) => handleInputChange('priority', value || 'medium')}
                    required
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <NumberInput
                    label="Estimated Customers Affected (Optional)"
                    placeholder="e.g., 150"
                    value={formData.estimated_customers_affected}
                    onChange={(value) => handleInputChange('estimated_customers_affected', value)}
                    error={errors.estimated_customers_affected}
                    min={0}
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Textarea
                    label="Outage Description"
                    placeholder="Describe the power outage, including any visible damage, affected areas, or other relevant details..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={errors.description}
                    required
                    minRows={4}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            {/* Contact Information */}
            <Box>
              <Title order={3} mb="md" size="h4">
                Contact Information
              </Title>
              
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Reporter Email"
                    placeholder="email@example.com"
                    value={formData.reporter_email}
                    onChange={(e) => handleInputChange('reporter_email', e.target.value)}
                    error={errors.reporter_email}
                    required
                    type="email"
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    Auto-filled from your account: {user?.email}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
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
                  <Text size="xs" c="dimmed" mt={4}>
                    This will be used for follow-up if needed
                  </Text>
                </Grid.Col>
              </Grid>
            </Box>

            {/* Form Actions */}
            <Group justify="flex-end" mt="lg">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                leftSection={<IconCheck size={16} />}
              >
                Report Outage
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
