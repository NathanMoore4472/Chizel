import AppLayout from './layout/AppLayout'
import DataSourceManager from './engine/DataSourceManager'
// Import side-effect: registers all built-in components synchronously
import './registry/built-ins'

function App() {
  return (
    <>
      <DataSourceManager />
      <AppLayout />
    </>
  )
}

export default App
