import { RootState } from '@data/redux/Store';
import { DecodedToken } from 'types/common';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import { setAuth, setUserProfile } from '@data/redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import useNotification from '@components/sidebar/hooks/useNotification';

const useToValidateTokenAndServer = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const access = useSelector((state:RootState)=> state.auth.accessToken)
    const refresh = useSelector((state:RootState)=> state.auth.refreshToken)
    const [serverAvailiblity,setServerAvailability] = useState(false)
    const [accessTokenValid,setAccessTokenValid] =useState(false)

    const {handleOnClickForNotifications} = useNotification()
    
    const checkServerAvailability = async()=>{
        try{
            const headers = {
                "Content-Type":"application/json",      
                'ngrok-skip-browser-warning':true,   
           }
           const response = await axios.get(`${window.base_url}/check_server_avaibility`,{headers:headers})
           if(response)
           {
                setServerAvailability(serverAvailiblity)
                if(access){
                    // call the token availablity api
                    checkTokenAuthenticity(access)
                }
                else{
                    navigate('/login')
                }
           }
        }
        catch(error:any){
            navigate('/404')
        }
    }

    const checkTokenAuthenticity = async(access:string)=>{
        try{
            const headers = {
                "Content-Type":"application/json",      
                'ngrok-skip-browser-warning':true,
                'Authorization': `Bearer ${access}`
              }

              const response = await axios.get(`${window.base_url}/check_token_authenticity`,{headers:headers})
              if(response.data.data.isAuthenticated === true){
                const decode:DecodedToken = jwtDecode<DecodedToken>(access)
                dispatch(setUserProfile(decode))
                setAccessTokenValid(true)
                handleOnClickForNotifications()
              }
              
        }
        catch(error:any){
            if(refresh){
                expireToken(refresh)
            }
            else{
                navigate('/login')       
            }
        }
    }
    const expireToken  = async(refresh:string)=>{    
        try{
            const header = {
                'ngrok-skip-browser-warning':true
              }
            const response = await axios.post(`${window.base_url}/auth/api/token/refresh/`,{
                "refresh":refresh
            },{headers:header})

            if(response){
                const token: { access: string; refresh: string; isAuth: boolean } = {
                    ...response.data,
                    isAuth: true,
                }
                if(token.access && token.refresh){
                    localStorage.setItem('accessToken', token.access)
                    localStorage.setItem('refreshToken', token.refresh)
                    const decoded:DecodedToken = jwtDecode<DecodedToken>(token.access)
                    dispatch(setUserProfile(decoded))
                    dispatch(setAuth(token))
                    setAccessTokenValid(true)
                }
                else{
                    navigate('/login')
                }
                
            }
        }
        catch(error:any){
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            const token = {
                access : null,
                refresh : null,
                isAuth : false,
            }
            dispatch(setAuth(token))
            navigate('/login')
        }
    }
  return {
    accessTokenValid,
    access,
    checkServerAvailability,
    checkTokenAuthenticity
  }
}

export default useToValidateTokenAndServer