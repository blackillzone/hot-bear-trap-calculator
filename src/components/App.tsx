import { useRallyStore } from '../store/useRallyStore';
import { Sidebar } from './Layout/Sidebar';
import { Header } from './Layout/Header';
import { Footer } from './Layout/Footer';
import { StatsForm } from './LeaderStats/StatsForm';
import { RallyConfig } from './RallyConfig/RallyConfig';
import { OptimalRatioPie } from './Results/OptimalRatioPie';
import { TroopTable } from './Results/TroopTable';
import { DamageScore } from './Results/DamageScore';
import { JoinerRecommender } from './Results/JoinerRecommender';
import { ParticipantGraph } from './Results/ParticipantGraph';
import { ProfileManager } from './Profiles/ProfileManager';
import { UserDataPage } from './UserData/UserDataPage';
import { Guide } from './Guide';

export function App() {
  const activeView = useRallyStore(s => s.activeView);
  const activeTab  = useRallyStore(s => s.activeTab);

  return (
    <div className="min-h-screen flex bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 max-w-6xl w-full px-4 py-6">
          {activeView === 'profiles'  && <ProfileManager />}
          {activeView === 'user-data' && <UserDataPage />}

          {activeView === 'bear-trap' && (
            <>
              {activeTab === 'formation' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column: inputs */}
                  <div className="space-y-4">
                    <StatsForm />
                    <RallyConfig />
                    <JoinerRecommender />
                  </div>

                  {/* Right column: results */}
                  <div className="space-y-4">
                    <OptimalRatioPie />
                    <TroopTable />
                    <DamageScore />
                  </div>
                </div>
              )}

              {activeTab === 'participants' && <ParticipantGraph />}
              {activeTab === 'guide' && <Guide />}
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
