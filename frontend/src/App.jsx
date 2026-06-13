import { useCallback, useEffect, useMemo, useState } from "react";

import { listVolunteers } from "./api";
import ImpactAnalytics from "./components/ImpactAnalytics";
import OnboardVolunteer from "./components/OnboardVolunteer";
import Sidebar from "./components/Sidebar";
import VolunteerRoster from "./components/VolunteerRoster";
import { VIEWS } from "./constants";

const VIEW_TITLES = {
  [VIEWS.onboard]: "Onboard New Volunteer",
  [VIEWS.roster]: "Volunteer Roster",
  [VIEWS.analytics]: "Impact Analytics",
};

export default function App() {
  const [currentView, setCurrentView] = useState(VIEWS.onboard);
  const [volunteers, setVolunteers] = useState([]);
  const [analyticsError, setAnalyticsError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const refreshVolunteers = useCallback(async () => {
    try {
      setAnalyticsError("");
      const rows = await listVolunteers();
      setVolunteers(rows);
    } catch (error) {
      setAnalyticsError(error.message);
    }
  }, []);

  useEffect(() => {
    refreshVolunteers();
  }, [refreshVolunteers, refreshToken]);

  const handleVolunteerCreated = (volunteer) => {
    setVolunteers((existing) => [volunteer, ...existing]);
    setRefreshToken((token) => token + 1);
  };

  const handleVolunteerUpdated = (updatedVolunteer) => {
    setVolunteers((existing) =>
      existing.map((volunteer) =>
        volunteer.id === updatedVolunteer.id ? updatedVolunteer : volunteer,
      ),
    );
    setRefreshToken((token) => token + 1);
  };

  const activeView = useMemo(() => {
    if (currentView === VIEWS.roster) {
      return (
        <VolunteerRoster
          refreshToken={refreshToken}
          onVolunteerUpdated={handleVolunteerUpdated}
        />
      );
    }

    if (currentView === VIEWS.analytics) {
      return (
        <ImpactAnalytics
          volunteers={volunteers}
          error={analyticsError}
          onRefresh={() => setRefreshToken((token) => token + 1)}
        />
      );
    }

    return <OnboardVolunteer onVolunteerCreated={handleVolunteerCreated} />;
  }, [analyticsError, currentView, refreshToken, volunteers]);

  return (
    <div className="min-h-screen bg-foundation-surface text-foundation-ink">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      <main className="min-h-screen pb-24 lg:pb-0 lg:pl-72">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <header className="flex flex-col gap-2 border-b border-stone-200 pb-6">
            <p className="text-sm font-semibold uppercase text-foundation-green">
              NayePankh Foundation
            </p>
            <h1 className="text-3xl font-bold text-foundation-ink sm:text-4xl">
              {VIEW_TITLES[currentView]}
            </h1>
          </header>

          {activeView}
        </div>
      </main>
    </div>
  );
}
