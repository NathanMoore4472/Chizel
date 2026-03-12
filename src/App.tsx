import { useEffect } from 'react'
import AppLayout from './layout/AppLayout'
import { initBuiltIns } from './registry/built-ins'

function App() {
  useEffect(() => {
    initBuiltIns()
  }, [])

  return <AppLayout />
}

export default App
