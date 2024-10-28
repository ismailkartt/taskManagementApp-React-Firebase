import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
    const { isAuthenticed, loading} = useSelector(state => state.auth);

    if(loading) {
        return(
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
        )
    }

  return (
        isAuthenticed ? children : <Navigate to='/login' replace/>
  )
}

export default ProtectedRoute