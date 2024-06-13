//@ts-nocheck
'use client'

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import WorkIcon from '@mui/icons-material/Work'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Fade from '@mui/material/Fade'
import { styled } from '@mui/material/styles'
import { useContext, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import {
  AddBox,
  Check,
  CheckBox,
  CurrencyYenTwoTone,
} from '@mui/icons-material'
import { useTheme } from '@emotion/react'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import DownloadIcon from '@mui/icons-material/Download'
import { AudioContext } from '@/app/context/audio_context'
import { blue, grey, pink, purple } from '@mui/material/colors'
import {
  CircularProgress,
  Collapse,
  FormControl,
  Grow,
  Input,
  InputLabel,
  ListItemButton,
  ListItemIcon,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Switch,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import useSWR from 'swr'
import ShareIcon from '@mui/icons-material/Share'
import MusicShareModal from '@/app/components/generate/music_share_modal'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import MusicCover from '@/app/components/common/music_cover'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { useQuery } from '@tanstack/react-query'
import { TransitionGroup } from 'react-transition-group'
import Loading from '@/app/components/common/loading'

export default function MusicList() {
  const [modalOpen, setModalOpen] = useState(false)
  const [musicShareData, setMusicShareData] = useState({})

  const { audioData, setAudioData } = useContext(AudioContext)
  const [playOption, setPlayOption] = useState('without-original')

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/')
    },
  })
  const username = session?.user.username

  const fetchMusicList = async () => {
    const res = await fetch(`/api/music/list?username=${username}`, {
      method: 'GET',
      headers: {},
    })
    const responseData = await res.json()
    console.log(responseData)
    return responseData
  }

  const {
    data: musicListData,
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['musicList'],
    queryFn: fetchMusicList,
    refetchInterval: 1000,
  })

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Box
          sx={{
            margin: '0',
            width: '100%',
            overflow: 'auto',
          }}
        >
          <List
            sx={{
              margin: '0',
            }}
          >
            <TransitionGroup>
              {Array.isArray(musicListData) &&
                musicListData.toReversed().map((music, i) => (
                  <Collapse key={'music' + music.id}>
                    <Box
                      sx={{
                        padding: 2,
                        '&:hover': { bgcolor: 'secondary.main' },
                        filter: music.progress ? 'blur(4px)' : 'none',
                        pointerEvents: music.progress ? 'none' : 'auto',
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        borderRadius: '32px',
                        backdropFilter: 'blur(10px)',
                        m: 1,
                        pl: 4,
                        pr: 4,
                      }}
                    >
                      {music.progress && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            filter: 'none',
                          }}
                        >
                          <CircularProgress />
                        </Box>
                      )}
                      <ListItem disablePadding>
                        {music.mediaType === 'audio' && (
                          <>
                            <Button
                              sx={{ marginRight: 2, cursor: 'pointer' }}
                              onClick={() =>
                                setAudioData({
                                  ...music,
                                  audioSrc:
                                    playOption == 'without-original'
                                      ? music.mediaUrl
                                      : music.mediaUrl2,
                                })
                              }
                            >
                              <MusicCover
                                isLoading={music.progress}
                                src={music.coverImageUrl}
                              />
                            </Button>
                            <FormControl
                              sx={{ m: 1, minWidth: 120 }}
                              size="small"
                            >
                              <InputLabel id="label-select-play-option">
                                재생 옵션
                              </InputLabel>
                              <Select
                                labelId="label-select-play-option"
                                id="select-play-option"
                                value={playOption}
                                label="재생 옵션"
                                onChange={(e) => setPlayOption(e.target.value)}
                              >
                                <MenuItem value={'without-original'}>
                                  반주만
                                </MenuItem>
                                <MenuItem value={'with-original'}>
                                  원음과 함께
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </>
                        )}

                        {music.mediaType === 'video' && (
                          <Box>
                            <video src={music.url} controls width="100%" />
                          </Box>
                        )}
                        <ListItemText
                          disableTypography
                          primary={
                            <>
                              <Typography variant="h6" fontWeight="bold">
                                {music.title}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="500"
                                color={blue[600]}
                              >
                                {Array.isArray(music.tags) &&
                                  music.tags.map((tag) => '#' + tag + ' ')}
                                {/* {'#더미태그1 #더미태그2'} */}
                              </Typography>
                            </>
                          }
                        />
                        <IconButton
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMusicShareData({
                              username,
                              title: music.title,
                              mediaId: music.id,
                              coverImageUrl: music.coverImageUrl,
                              tags: music.tags,
                            })
                            setModalOpen(true)
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                        <MusicShareModal
                          open={modalOpen}
                          setOpen={setModalOpen}
                          musicShareData={musicShareData}
                        />
                        <Box
                          marginLeft={1}
                          display="flex"
                          flexDirection="row"
                          gap="2"
                        >
                          {/* <Box>
                          {!music.progress ? (
                            <></>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <RotateLeftIcon
                                sx={{
                                  animation: 'spin 2s linear infinite',
                                  '@keyframes spin': {
                                    '0%': {
                                      transform: 'rotate(360deg)',
                                    },
                                    '100%': {
                                      transform: 'rotate(0deg)',
                                    },
                                  },
                                }}
                              />
                              <Typography variant="body1">
                                생성중...
                              </Typography>
                            </Box>
                          )}
                        </Box> */}
                          <IconButton
                            color="primary"
                            href={music.mediaUrl}
                            download
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    </Box>
                  </Collapse>
                ))}
            </TransitionGroup>
          </List>
        </Box>
      )}
    </>
  )
}
