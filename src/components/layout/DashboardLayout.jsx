import useStore from '../../store/useStore'
import Header from './Header'
import NavBar from './NavBar'
import FilterBar from './FilterBar'
import SidePanel from '../SidePanel'
import HomeView from '../../views/Home'
import TechAreaView from '../dashboard/TechAreaView'
import StdBodyView from '../dashboard/StdBodyView'
import DeptView from '../dashboard/DeptView'
import YearView from '../dashboard/YearView'
import PatentView from '../dashboard/PatentView'
import { useUrlSync } from '../../hooks/useUrlSync'

export default function DashboardLayout() {
  const { activeTab } = useStore()
  useUrlSync()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NavBar />
      <FilterBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 transition-all duration-300 min-w-0">
          {activeTab === 'home'   && <HomeView />}
          {activeTab === 'tech'   && <TechAreaView />}
          {activeTab === 'body'   && <StdBodyView />}
          {activeTab === 'dept'   && <DeptView />}
          {activeTab === 'year'   && <YearView />}
          {activeTab === 'patent' && <PatentView />}
        </main>
      </div>

      {/* Fixed slide-in side panel */}
      <SidePanel />
    </div>
  )
}
