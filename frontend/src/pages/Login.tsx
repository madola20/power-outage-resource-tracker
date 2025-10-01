import { useState } from 'react'
import { useForm } from '@mantine/form'
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true)
    try {
      await login(values)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the store, but let's log it for debugging
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container 
      size={{ base: 'xs', sm: 'sm', md: 'md' }} 
      my={{ base: 20, sm: 40 }}
      px={{ base: 'sm', sm: 'md' }}
    >
      <Title ta="center" mb="xl" size={{ base: 'h2', sm: 'h1' }}>
        Scout
      </Title>
      <Text ta="center" size={{ base: 'xs', sm: 'sm' }} c="dimmed" mb="xl">
        Power Outage Resource Tracker
      </Text>

      <Paper 
        withBorder 
        shadow="md" 
        p={{ base: 'md', sm: 'xl' }} 
        mt={{ base: 'md', sm: 'xl' }} 
        radius="md"
      >
        <Title order={3} ta="center" mb="md" size={{ base: 'h4', sm: 'h3' }}>
          Sign In
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            size="md"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            size="md"
            {...form.getInputProps('password')}
          />
          <Button
            type="submit"
            fullWidth
            mt="xl"
            size="md"
            loading={isSubmitting || isLoading}
          >
            Sign In
          </Button>
        </form>
      </Paper>

      <Text 
        ta="center" 
        size="xs" 
        c="dimmed" 
        mt="xl" 
        style={{ 
          fontStyle: 'italic',
          opacity: 0.7
        }}
      >
        A demo brought to you by Madeline Laurance
      </Text>
    </Container>
  )
}
