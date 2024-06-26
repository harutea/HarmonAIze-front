//@ts-nocheck
'use client'
import { Box, Typography } from '@mui/material'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { useContext, useEffect, useRef } from 'react'
import { AudioContext } from '../../context/audio_context'
import { useSession } from 'next-auth/react'
import { AccountCircle, FormatAlignJustify } from '@mui/icons-material'
import { useTheme } from '@emotion/react'

export default function AudioPlayerBottom() {
  const { audioPlayerRef, audioData, setAudioData } = useContext(AudioContext)

  const { data: session, status } = useSession()

  const theme = useTheme()

  useEffect(() => {
    if (!audioPlayerRef?.current?.audio?.current) return
    audioPlayerRef.current.audio.current.currentTime = 0
    audioPlayerRef.current.audio.current.play()
  }, [audioData])

  if (status != 'authenticated') {
    return <></>
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 2,
        p: 1,
      }}
    >
      <Box
        sx={{
          width: '100%',
          bgcolor:
            theme.palette.mode == 'light'
              ? 'rgba(255, 255, 255, 0.5)'
              : 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(14px)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
        }}
      >
        {audioData?.mediaTitle ? (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              {audioData?.mediaTitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <AccountCircle />
              <Typography variant="h6" fontWeight="500">
                {audioData?.username}
              </Typography>
            </Box>
            <Box display={{ xs: 'none', sm: 'block' }}>
              <Typography variant="h6">
                {audioData?.playOption == 'without-original'
                  ? '(반주만)'
                  : '(원음과 함께)'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="h6">--</Typography>
        )}
        <AudioPlayer
          ref={audioPlayerRef}
          autoPlay
          src={
            audioData?.playOption == 'without-original'
              ? audioData?.mediaUrl
              : audioData?.mediaUrl2
          }
          onPlay={(e) => console.log('onPlay')}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.0)',
            border: '0px',
            boxShadow: 'none',
          }}
        />
      </Box>
    </Box>
  )
}
