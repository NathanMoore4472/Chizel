import AppLayout from './layout/AppLayout'
// Import side-effect: registers all built-in components synchronously
import './registry/built-ins'

function App() {
  return <AppLayout />
}

export default App
