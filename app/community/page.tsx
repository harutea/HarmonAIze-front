//@ts-nocheck
'use client'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Fade from '@mui/material/Fade'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import FeedItem from '../components/community/feed_item'
import { grey } from '@mui/material/colors'
import { useEffect } from 'react'
import PostBox from '../components/community/post_box'
import Loading from '../components/common/loading'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { TransitionGroup } from 'react-transition-group'
import { NodeNextRequest } from 'next/dist/server/base-http/node'
import { useTheme } from '@emotion/react'

export default function Community() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/')
    },
  })

  console.log(session)
  const [audioInfo, SetAudioInfo] = useState({ name: '', url: '' })
  // const [postList, setPostList] = useState([])
  const [postViewId, setPostViewId] = useState(null)
  const [sortingMode, setSortingMode] = useState('latest')
  const [searchData, setSearchData] = useState('')
  const [searchedPostList, setSearchedPostList] = useState([])
  // const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()
  const handleFileUpload = async (e) => {
    e.preventDefault()

    if (!e.target.files[0]) {
      return
    }
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('name', 'dummyUser')
    formData.append('file', file)

    const fileContent = formData.get('file')
    for (let value of formData.values()) {
      console.log(value)
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {},
      body: formData,
    })
    const responseFormData = await res.formData()
    const responseFile = responseFormData.get('file')
    const url = URL.createObjectURL(responseFile)
    console.log(responseFile)
    SetAudioInfo({ name: responseFile.name, url })
  }

  const fetchPostList = async () => {
    // setIsLoading(true)
    const res = await fetch(
      `api/community/postlist?username=${session?.user.username}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    )
    const resData = await res.json()
    // setPostList(resData)
    return resData
    console.log(postList)
    // const dummyPostList = [
    //   {
    //     id: 1,
    //     username: 'hello',
    //     mediaTitle: 'music',
    //     postTitle: 'posttitle',
    //     numLikes: 5,
    //     hasLiked: false,
    //     numComments: 8,
    //   },
    // ]
    // setPostList(dummyPostList)
    // setIsLoading(false)
  }

  let {
    data: postList,
    error,
    isLoading,
    isFetched,
  } = useQuery({ queryKey: ['postList'], queryFn: fetchPostList })

  if (isFetched) {
    console.log(postList)
    if (sortingMode == 'like') postList.sort((a, b) => b.numLikes - a.numLikes)
    if (sortingMode == 'comment')
      postList.sort((a, b) => b.numComments - a.numComments)
    if (sortingMode == 'latest') postList = postList.toReversed()
  }

  const handleSearch = (e) => {
    const inputValue = e.target.value
    setSearchData(inputValue)

    // set query data to be filtered with searchData after refetch
    postList = postList.filter(
      (post) =>
        post.postTitle.includes(inputValue) ||
        post.mediaTitle.includes(inputValue) ||
        post.username.includes(inputValue)
    )
    console.log(postList)
  }

  const filteredData = postList
    ? postList.filter(
        (post) =>
          post.postTitle.toLowerCase().includes(searchData) ||
          post.mediaTitle.toLowerCase().includes(searchData) ||
          post.username.toLowerCase().includes(searchData)
      )
    : undefined

  const theme = useTheme()

  return (
    <Fade in={true}>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          // marginTop: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box
          sx={{
            flex: { xs: postViewId ? 0 : 1, sm: 0.5 },
            display: { xs: postViewId ? 'none' : 'flex', sm: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            // width: '100%',
            overflowY: 'auto',

            bgcolor:
              theme.palette.mode == 'light'
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(0, 0, 0, 0.5)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            m: 1,
            pt: 1,
          }}
        >
          {isLoading ? (
            <Loading />
          ) : (
            <Box width="100%" borderColor={grey[400]} marginBottom={10}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: 'solid 1px',
                  borderColor: grey[400],
                  p: 2,
                }}
              >
                <Box>
                  <TextField
                    label="검색"
                    value={searchData}
                    onChange={handleSearch}
                    size="small"
                  />
                </Box>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="label-select-sort-option">정렬</InputLabel>
                  <Select
                    labelId="label-select-sort-option"
                    id="select-sort-option"
                    value={sortingMode}
                    label="재생 옵션"
                    onChange={(e) => setSortingMode(e.target.value)}
                  >
                    <MenuItem value={'like'}>좋아요 순</MenuItem>
                    <MenuItem value={'comment'}>댓글 순</MenuItem>
                    <MenuItem value={'latest'}>최신 순</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TransitionGroup>
                {Array.isArray(filteredData) &&
                  filteredData.map((e) => (
                    <Collapse key={e.id}>
                      <FeedItem
                        key={e.id}
                        id={e.id}
                        username={e.username}
                        mediaTitle={e.mediaTitle}
                        coverImageUrl={e.coverImageUrl}
                        postTitle={e.postTitle}
                        postViewId={postViewId}
                        setPostViewId={setPostViewId}
                        numLikes={e.numLikes}
                        numComments={e.numComments}
                        hasLiked={e.hasLiked}
                      />
                    </Collapse>
                  ))}
              </TransitionGroup>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            flex: { xs: postViewId ? '1' : '0', sm: 0.5 },
            display: { xs: postViewId ? 'block' : 'none', sm: 'block' },
          }}
        >
          <PostBox
            postViewId={postViewId}
            setPostViewId={setPostViewId}
            currentUsername={session?.user.username}
            numAllComments={
              postList && postList.length != 0 && Array.isArray(postList)
                ? postList.reduce((accumulator, currentObject) => {
                    return accumulator + currentObject.numComments
                  })
                : 0
            }
          />
        </Box>
      </Box>
    </Fade>
  )
}
