import { useForm } from '@mantine/form'
import { TextInput, Button, Paper, Title, Stack, Group, Text } from '@mantine/core'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function Profile() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    updateProfileMutation.mutate(values)
  }

  if (!user) {
    return <Text>User not found</Text>
  }

  return (
    <Stack gap="md">
      <Title order={2}>Profile</Title>
      
      <Paper withBorder p="md">
        <Title order={3} mb="md">Account Information</Title>
        <Stack gap="sm">
          <Group>
            <Text size="sm" c="dimmed" w={120}>Email:</Text>
            <Text>{user.email}</Text>
          </Group>
          <Group>
            <Text size="sm" c="dimmed" w={120}>Role:</Text>
            <Text>{user.role_display}</Text>
          </Group>
          <Group>
            <Text size="sm" c="dimmed" w={120}>Status:</Text>
            <Text>{user.is_active ? 'Active' : 'Inactive'}</Text>
          </Group>
          <Group>
            <Text size="sm" c="dimmed" w={120}>Joined:</Text>
            <Text>{new Date(user.date_joined).toLocaleDateString()}</Text>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Title order={3} mb="md">Update Profile</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="First Name"
              {...form.getInputProps('first_name')}
            />
            <TextInput
              label="Last Name"
              {...form.getInputProps('last_name')}
            />
            <TextInput
              label="Phone Number"
              {...form.getInputProps('phone_number')}
            />
            <Button
              type="submit"
              loading={updateProfileMutation.isPending}
            >
              Update Profile
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
