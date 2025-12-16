import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import ActorExplorer from '@/pages/ActorExplorer'
import ActorRunner from '@/pages/ActorRunner'
import Datasets from '@/pages/Datasets'
import DatasetViewer from '@/pages/DatasetViewer'
import Storage from '@/pages/Storage'
import StorageDetails from '@/pages/StorageDetails'
import Runs from '@/pages/Runs'
import RunDetails from '@/pages/RunDetails'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/actors" element={<ActorExplorer />} />
        <Route path="/actors/:actorId" element={<ActorRunner />} />
        <Route path="/datasets" element={<Datasets />} />
        <Route path="/datasets/:datasetId" element={<DatasetViewer />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/storage/:storeId" element={<StorageDetails />} />
        <Route path="/runs" element={<Runs />} />
        <Route path="/runs/:runId" element={<RunDetails />} />
      </Routes>
    </AppLayout>
  )
}

export default App
