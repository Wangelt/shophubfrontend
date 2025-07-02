export const baseURL=process.env.NEXT_PUBLIC_API_URL

const ENDPOINTS=   {
    register:{
        url:"/users/register",
        method: "get"
    },
    login:{
         url:"users/login",
         method: "post"
    },
    getUser:{
        url:"/users/userdetails",
        method:"get"
    }
   
}   

export default ENDPOINTS