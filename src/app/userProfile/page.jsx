"use client"

import React, { useEffect, useState } from 'react'
import ENDPOINTS from '../../lib/apiConfig';
import Axios from '../../lib/axios';

const UserDetails = () => {
   const [user, setUser] = useState(null);
  const userdetails = async() => {
     try {
       const response  = await Axios({
        ...ENDPOINTS.getUser
        
      });
      if(response.data.success){
           setUser(response.data);}
      else{
        alert(res.data.message)
      }  
     } catch (error) {
       console.error('something went wrong')   
        }
  }
    useEffect(() => {
    userdetails();
  }, []);
  return (
    <div>page</div>
  )
}

export default UserDetails