import useAPI from '@hooks/useApi'
import { toast } from 'sonner'
import axios from 'axios'
import { get } from 'lodash';
import { useState } from 'react';

interface Notification {
    slug: string;
    status: string;
    type: string;
    message: string;
  }

const useNotification = () => {
    const [StoredTokens, CallAPI] = useAPI() // custom hook to call the API
    const [seenNotifications,setSeenNotifications] = useState<Array<Notification>>([])
    const [unSeenNotifications,setUnSeenNotifications] = useState<Array<Notification>>([])
    //function :: to get the notification
    const handleOnClickForNotifications = async()=>{
        try{
            const header = {
                'ngrok-skip-browser-warning': true,
                Authorization: `Bearer ${StoredTokens.accessToken}`,
            }
            const axiosInstance = axios.create()
            const method = 'get'
            const endpoint = `/manage/alerts/get_alerts`
            const response_obj = await CallAPI(StoredTokens, axiosInstance, endpoint, method, header)
            if(response_obj.error == false){
                const check = get(response_obj,'response.data.data',[])
                if(check){
                    const seenNotifications_lst = check.filter((notification:Notification)=>notification.status === "seen");
                    const unSeenNotifications_lst = check.filter((notification:Notification)=> notification.status === "unseen");
                    setSeenNotifications(seenNotifications_lst);
                    setUnSeenNotifications(unSeenNotifications_lst)
                }
            }
            else{
                toast.error(response_obj.errorMessage?.message)
            }
        }
        catch(error){
            toast.error('Failed to fetch notifications')
            
        }
    }
    //function:: mark all the notifications as read 
    const handleOnClickForMarkNotifications = async()=>{
        try{
            const header = {
                'ngrok-skip-browser-warning': true,
                Authorization: `Bearer ${StoredTokens.accessToken}`,
            }
            const axiosInstance = axios.create()
            const method = 'post'
            const endpoint = `/manage/alerts/mark_all_as_read/`
            const response_obj = await CallAPI(StoredTokens, axiosInstance, endpoint, method, header)
            if(response_obj.error == false){
                const check = get(response_obj,'response.data.data',[])
                if(check){
                    const seenNotifications_lst = check.filter((notification:Notification)=>notification.status === "seen");
                    const unseenNotifications_lst = check.filter((notification:Notification)=> notification.status === "unseen");
                    setSeenNotifications(seenNotifications_lst);
                    setUnSeenNotifications(unseenNotifications_lst)
                }
                else{
                    setSeenNotifications([])
                    setUnSeenNotifications([])
                }
            }
            else{
                toast.error(response_obj.errorMessage?.message)
            }
        }
        catch(error){
            toast.error('Failed to fetch notifications')
        }
    }
  return {
    unSeenNotifications,
    seenNotifications,
    handleOnClickForNotifications,
    handleOnClickForMarkNotifications
  }
}

export default useNotification