import type { ReactNode } from "react";

interface ProfileSectionProps {
  icon: ReactNode;
  title: string;
  items: string[];
}

function ProfileSection({ icon, title, items }: ProfileSectionProps) {
  return (
    <div className="border-t border-gray-100 py-6 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-lg font-light tracking-wide text-gray-900">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-light text-gray-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const paymentIcons: Record<string, ReactNode> = {
  Efetivo: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Cards: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Pix: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
};

interface CompanionProfileDetailsProps {
  services: string[];
  servicesFor: string[];
  serviceLocations: string[];
  typeTags: string[];
  payments: string[];
}

export function CompanionProfileDetails({
  services,
  servicesFor,
  serviceLocations,
  typeTags,
  payments,
}: CompanionProfileDetailsProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white px-6 py-2 sm:px-8">
      {typeTags.length > 0 && (
        <ProfileSection
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          title="Tipo"
          items={typeTags}
        />
      )}

      <ProfileSection
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
        title="Serviços"
        items={services}
      />

      <ProfileSection
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        title="Serviços para"
        items={servicesFor}
      />

      <ProfileSection
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        }
        title="Local de atendimento"
        items={serviceLocations}
      />

      <div className="border-t border-gray-100 py-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h2 className="text-lg font-light tracking-wide text-gray-900">
            Pagamentos
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {payments.map((payment) => (
            <span
              key={payment}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-light text-gray-700"
            >
              {paymentIcons[payment]}
              {payment}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
