import { BarChart3, HeartHandshake, UserPlus, UsersRound } from "lucide-react";

import { VIEWS } from "../constants";

const NAV_ITEMS = [
  {
    id: VIEWS.onboard,
    label: "Onboard New Volunteer",
    icon: UserPlus,
  },
  {
    id: VIEWS.roster,
    label: "Volunteer Roster",
    icon: UsersRound,
  },
  {
    id: VIEWS.analytics,
    label: "Impact Analytics",
    icon: BarChart3,
  },
];

export default function Sidebar({ currentView, onNavigate }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-foundation-ink px-5 py-6 text-white shadow-panel lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-foundation-green text-white">
            <HeartHandshake size={23} aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">NayePankh</p>
            <p className="text-sm text-white/60">Volunteer Desk</p>
          </div>
        </div>

        <nav className="mt-7 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-stone-200 bg-white lg:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 px-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-emerald-50 text-foundation-green"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

function NavButton({ item, isActive, onNavigate }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      onClick={() => onNavigate(item.id)}
      className={`flex min-h-12 items-center gap-3 rounded px-3 text-left text-sm font-semibold transition ${
        isActive
          ? "bg-white text-foundation-ink"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={19} aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}
