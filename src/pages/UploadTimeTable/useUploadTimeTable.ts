import React, { useState } from 'react'

import axios from 'axios'
import { get } from 'lodash'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import useAPI from '@hooks/useApi'

type FormValues = {
  file: File | null
}

const useUploadTimeTable = () => {
  interface SubmitData {
    file: File | null
  }

  const [timeTable, setTimeTable] = useState(true)
  const [loadTimeTable, setLoadTimeTable] = useState(false)

  const [fileName, setFileName] = React.useState<string | null>(null)

  const [StoredTokens, CallAPI] = useAPI()

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>()

  //FileUploadLogic
  const onSubmit = async (data: SubmitData) => {
    const formData = new FormData()
    console.log(data)

    if (data.file) {
      formData.append('master_tt.csv', data.file)
      setLoadTimeTable(true)
    } else {
      toast.error('Please select a file')
      return
    }

    try {
      const axiosInstance = axios.create()
      const method = 'post'
      const endpoint = '/manage/upload_master_timetable/'
      const header = {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${StoredTokens.accessToken}`,
        'ngrok-skip-browser-warning': true,
      }

      const response_obj = await CallAPI(
        StoredTokens,
        axiosInstance,
        endpoint,
        method,
        header,
        formData,
      )

      if (response_obj.error == false) {
        // const data = get(response_obj, 'response.data.data.schedules', [])
        setTimeTable(true)
        toast.success('File uploaded successfully')
      } else {
        console.log(response_obj.errorMessage?.message)
        toast.error(response_obj?.errorMessage?.message)
        setLoadTimeTable(false)
      }
    } catch (error) {
      console.error('Error Uploading File', error)
      toast.error(`File upload failed. See console for more information.`)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file ? file.name : null)
      setValue('file', file)
    }
  }

  return {
    setTimeTable,
    timeTable,
    onSubmit,
    handleSubmit,
    fileName,
    loadTimeTable,
    handleFileChange,
    setLoadTimeTable,
    errors,
    setError,
  }
}
export default useUploadTimeTable