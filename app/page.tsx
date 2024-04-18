//@ts-nocheck
'use client'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import SignIn from './sign_in'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()
  if (status == 'authenticated') {
    redirect('/generate')
  }
  return (
    <Container maxWidth="lg">
      <Fade in={true} timeout={{ enter: 700 }}>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h2">HarmonAIze</Typography>
          <SignIn />
        </Box>
      </Fade>
    </Container>
  )
}
