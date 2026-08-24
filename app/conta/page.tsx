"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AccountVerification } from "@/components/AccountVerification";
import type { ListingSummary } from "@/lib/auth-types";
import {
  FILTER_LOCATIONS,
  FILTER_SERVICES,
  FILTER_SERVICES_FOR,
  citiesForRegion,
} from "@/lib/catalog-locations";
import { cityShortSlug, slugify } from "@/lib/slug";
import { REGIONS } from "@/lib/regions";
import { uploadListingPhotos } from "@/lib/upload-listing-photos";

function listingPublicPath(listing: ListingSummary) {
  return `/acompanhante/${slugify(listing.title)}-${slugify(listing.neighborhood)}-${cityShortSlug(listing.city)}-${listing.id}`;
}

type ListingLimits = {
  maxActive: number;
  activeCount: number;
  canCreate: boolean;
  canPublishMore: boolean;
  nextCreateAt: string | null;
  cooldownHours: number;
  unlimited?: boolean;
};

const PREMIUM_WHATSAPP_URL =
  "https://wa.me/5531975325100?text=Oi%2C%20gostaria%20de%20virar%20destaque.";

function premiumWhatsAppUrl() {
  return PREMIUM_WHATSAPP_URL;
}

function statusLabel(status: string) {
  if (status === "published") return "Ativo";
  if (status === "paused") return "Pausado";
  if (status === "draft") return "Rascunho";
  return status;
}

function formatNextCreate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FormPhoto =
  | { id: string; kind: "existing"; url: string }
  | { id: string; kind: "new"; file: File };

type ListingFormState = {
  title: string;
  description: string;
  pricePerHour: string;
  age: string;
  region: string;
  city: string;
  neighborhood: string;
  whatsapp: string;
  services: string[];
  servicesFor: string[];
  serviceLocations: string[];
  photos: FormPhoto[];
  avatarKey: string;
};

const pillInput =
  "w-full rounded-full border border-gray-300 bg-white px-5 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10";

const pillTextarea =
  "w-full rounded-3xl border border-gray-300 bg-white px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10";

const pillBtn =
  "inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const cardActionBtn =
  "inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const pillSelect =
  "w-full cursor-pointer appearance-none rounded-full border border-gray-300 bg-white px-5 py-3.5 text-base text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10";

function isLuxoActive(listing: ListingSummary) {
  return (
    listing.isLuxo &&
    (!listing.luxoUntil || new Date(listing.luxoUntil) > new Date())
  );
}

function emptyForm(): ListingFormState {
  return {
    title: "",
    description: "",
    pricePerHour: "",
    age: "",
    region: "",
    city: "",
    neighborhood: "",
    whatsapp: "",
    services: [],
    servicesFor: [],
    serviceLocations: [],
    photos: [],
    avatarKey: "",
  };
}

function formFromListing(listing: ListingSummary): ListingFormState {
  return {
    title: listing.title,
    description: listing.description,
    pricePerHour: String(listing.pricePerHour),
    age: String(listing.age ?? 25),
    region: listing.region || "Minas Gerais",
    city: listing.city,
    neighborhood: listing.neighborhood,
    whatsapp: listing.whatsapp || listing.phone || "",
    services: listing.services ?? [],
    servicesFor: listing.servicesFor?.length ? listing.servicesFor : ["Homens"],
    serviceLocations: listing.serviceLocations?.length
      ? listing.serviceLocations
      : ["Em casa"],
    photos: (listing.photos?.length
      ? listing.photos
      : listing.photoUrl
        ? [listing.photoUrl]
        : []
    ).map((url) => ({ id: url, kind: "existing" as const, url })),
    avatarKey:
      listing.photoUrl &&
      (listing.photos?.includes(listing.photoUrl) || !listing.photos?.length)
        ? listing.photoUrl
        : (listing.photos?.[0] ?? listing.photoUrl ?? ""),
  };
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function nextAvatarKey(photos: FormPhoto[], current: string) {
  if (photos.some((photo) => photo.id === current)) return current;
  return photos[0]?.id ?? "";
}

function movePhoto(photos: FormPhoto[], index: number, delta: number) {
  const next = index + delta;
  if (next < 0 || next >= photos.length) return photos;
  const copy = [...photos];
  const [item] = copy.splice(index, 1);
  if (!item) return photos;
  copy.splice(next, 0, item);
  return copy;
}

function ChipGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-lg font-semibold text-gray-900">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(toggleValue(selected, option))}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#0c0414] text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ServicesChipGroup({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const extras = selected.filter((item) => !FILTER_SERVICES.includes(item));
  const options = [...FILTER_SERVICES, ...extras];

  const addCustom = () => {
    const value = custom.trim().replace(/\s+/g, " ");
    if (!value) return;
    if (value.length > 40) return;
    const exists = selected.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );
    if (!exists) onChange([...selected, value]);
    setCustom("");
  };

  return (
    <div>
      <p className="mb-2 text-lg font-semibold text-gray-900">
        Serviços (opcional)
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(toggleValue(selected, option))}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#0c0414] text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          className={pillInput}
          placeholder="Incluir outro serviço"
          maxLength={40}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className={`${pillBtn} shrink-0 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
        >
          Incluir
        </button>
      </div>
    </div>
  );
}

export default function ContaPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [count, setCount] = useState(0);
  const [limits, setLimits] = useState<ListingLimits | null>(null);
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingFormState>(() => emptyForm());
  const [saving, setSaving] = useState(false);

  const luxoCount = useMemo(
    () => listings.filter(isLuxoActive).length,
    [listings],
  );

  const activeCount = useMemo(
    () =>
      limits?.activeCount ??
      listings.filter((item) => item.status === "published").length,
    [limits, listings],
  );

  const newPhotoPreviews = useMemo(() => {
    const urls = new Map<string, string>();
    for (const photo of form.photos) {
      if (photo.kind === "new") {
        urls.set(photo.id, URL.createObjectURL(photo.file));
      }
    }
    return urls;
  }, [form.photos]);

  const cities = useMemo(() => {
    const list = [...citiesForRegion(form.region)];
    if (form.city && !list.includes(form.city)) list.unshift(form.city);
    return list;
  }, [form.region, form.city]);

  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPhotoPreviews]);

  const loadListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const res = await fetch("/api/listings", { credentials: "include" });
      const data = (await res.json()) as {
        error?: string;
        listings?: ListingSummary[];
        count?: number;
        limits?: ListingLimits;
      };
      if (!res.ok) {
        setError(data.error ?? "Falha ao carregar anúncios.");
        return;
      }
      setListings(data.listings ?? []);
      setCount(data.count ?? 0);
      setLimits(data.limits ?? null);
    } catch {
      setError("Falha de conexão ao carregar anúncios.");
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "cliente") {
      router.replace("/");
      return;
    }
    if (user.verificationStatus === "verified") {
      void loadListings();
    }
  }, [user, isLoading, router, loadListings]);

  const openCreate = useCallback(() => {
    if (!user || user.verificationStatus !== "verified") return;
    if (limits && !limits.canCreate) {
      const when = formatNextCreate(limits.nextCreateAt);
      setError(
        when
          ? `Você pode criar 1 anúncio a cada ${limits.cooldownHours} horas. Próximo às ${when}.`
          : `Você pode criar 1 anúncio a cada ${limits.cooldownHours} horas.`,
      );
      return;
    }
    if (limits && !limits.canPublishMore) {
      setError(
        `Você já tem ${limits.maxActive} anúncios ativos. Pause ou exclua um para criar outro ativo.`,
      );
      return;
    }
    setMode("create");
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [limits, user]);

  useEffect(() => {
    const onOpen = () => openCreate();
    window.addEventListener("mdlx:open-create-listing", onOpen);
    return () => window.removeEventListener("mdlx:open-create-listing", onOpen);
  }, [openCreate]);

  useEffect(() => {
    if (isLoading || !user || user.verificationStatus !== "verified") return;
    if (loadingListings) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("novo") !== "1") return;
    openCreate();
    router.replace("/conta", { scroll: false });
  }, [isLoading, user, loadingListings, openCreate, router]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center text-lg text-gray-600">
        Carregando…
      </div>
    );
  }

  const verified = user.verificationStatus === "verified";

  if (!verified) {
    return (
      <div className="mx-auto max-w-xl space-y-8 px-4 py-8 sm:px-6">
        <header>
          <h1 className="font-serif text-2xl font-bold italic text-gray-900">
            Meu perfil
          </h1>
          <p className="mt-1 text-base text-gray-600">
            {user.name} · {user.email}
          </p>
        </header>

        <AccountVerification />

        <button
          type="button"
          onClick={() => void logout()}
          className="w-full rounded-full border border-gray-200 py-3 text-base font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          Sair da conta
        </button>
      </div>
    );
  }

  const openEdit = (listing: ListingSummary) => {
    setMode("edit");
    setEditingId(listing.id);
    setForm(formFromListing(listing));
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setMode("closed");
    setEditingId(null);
    setForm(emptyForm());
  };

  const totalPhotos = form.photos.length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (totalPhotos === 0) {
      setError("Adicione pelo menos 1 foto de perfil/galeria.");
      return;
    }

    if (form.servicesFor.length === 0) {
      setError("Selecione para quem você atende.");
      return;
    }

    setSaving(true);
    try {
      const newPhotos = form.photos.filter(
        (photo): photo is Extract<FormPhoto, { kind: "new" }> =>
          photo.kind === "new",
      );
      const uploadedUrls = await uploadListingPhotos(
        newPhotos.map((photo) => photo.file),
      );
      const uploadedById = new Map(
        newPhotos.map((photo, index) => [photo.id, uploadedUrls[index]!]),
      );
      const photos = form.photos.map((photo) =>
        photo.kind === "existing"
          ? photo.url
          : uploadedById.get(photo.id)!,
      );
      const photoUrl = uploadedById.get(form.avatarKey) ??
        (form.photos.some(
          (photo) => photo.kind === "existing" && photo.id === form.avatarKey,
        )
          ? form.avatarKey
          : (photos[0] ?? null));

      const existing = editingId
        ? listings.find((item) => item.id === editingId)
        : null;
      const body = {
        title: form.title,
        description: form.description,
        pricePerHour: Number(form.pricePerHour),
        age: Number(form.age),
        gender: "Mulher",
        region: form.region,
        city: form.city,
        neighborhood: form.neighborhood,
        whatsapp: form.whatsapp,
        services: form.services,
        servicesFor: form.servicesFor,
        serviceLocations: form.serviceLocations,
        status: mode === "edit" && existing ? existing.status : "published",
        photos,
        photoUrl,
      };

      const url =
        mode === "edit" && editingId
          ? `/api/listings/${editingId}`
          : "/api/listings";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar o anúncio.");
        return;
      }

      setMessage(
        mode === "edit"
          ? "Anúncio atualizado."
          : "Anúncio publicado! Agora você pode colocá-lo no topo.",
      );
      closeForm();
      await loadListings();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Falha de conexão ao salvar anúncio.",
      );
    } finally {
      setSaving(false);
    }
  };

  const startLuxo = () => {
    window.open(premiumWhatsAppUrl(), "_blank", "noopener,noreferrer");
  };

  const setListingStatus = async (
    listingId: string,
    status: "published" | "paused",
  ) => {
    setActionId(listingId);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as {
        error?: string;
        limits?: ListingLimits;
      };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível atualizar o anúncio.");
        return;
      }
      if (data.limits) setLimits(data.limits);
      setMessage(
        status === "published"
          ? "Anúncio reativado."
          : "Anúncio pausado.",
      );
      await loadListings();
    } catch {
      setError("Falha de conexão ao atualizar anúncio.");
    } finally {
      setActionId(null);
    }
  };

  const deleteListing = async (listingId: string, title: string) => {
    const ok = window.confirm(
      `Excluir o anúncio “${title}”? Essa ação não pode ser desfeita.`,
    );
    if (!ok) return;

    setActionId(listingId);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as {
        error?: string;
        limits?: ListingLimits;
      };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível excluir o anúncio.");
        return;
      }
      if (data.limits) setLimits(data.limits);
      if (editingId === listingId) closeForm();
      setMessage("Anúncio excluído.");
      await loadListings();
    } catch {
      setError("Falha de conexão ao excluir anúncio.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold italic text-gray-900">
            Meu perfil
          </h1>
          <p className="mt-1 text-base text-gray-600">
            {user.name} · {user.email}
          </p>
          <p className="mt-1 text-sm font-medium text-green-700">
            Cadastro confirmado
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className={`${pillBtn} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}
        >
          Sair
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-gray-200 bg-white px-5 py-5">
          <p className="text-base text-gray-600">Ativos</p>
          <p className="mt-1 text-4xl font-bold text-gray-900">
            {loadingListings
              ? "…"
              : limits?.unlimited
                ? String(activeCount)
                : `${activeCount}/${limits?.maxActive ?? 2}`}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white px-5 py-5">
          <p className="text-base text-gray-600">No topo</p>
          <p className="mt-1 text-4xl font-bold text-gray-900">
            {loadingListings ? "…" : luxoCount}
          </p>
        </div>
      </div>

      <p className="text-base leading-relaxed text-gray-600">
        {limits?.unlimited ? (
          <>
            Conta admin: você pode criar e publicar anúncios sem limite de
            quantidade nem intervalo.
          </>
        ) : (
          <>
            Máximo de {limits?.maxActive ?? 2} anúncios ativos. Você pode criar 1
            novo a cada {limits?.cooldownHours ?? 8} horas. Pause, reative ou exclua
            quando quiser.
            {limits && !limits.canCreate && limits.nextCreateAt ? (
              <>
                {" "}
                Próxima criação:{" "}
                <span className="font-semibold text-gray-900">
                  {formatNextCreate(limits.nextCreateAt)}
                </span>
                .
              </>
            ) : null}
          </>
        )}
      </p>

      <section className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-xl font-bold text-gray-900">Aparecer no topo</h2>
        <p className="mt-2 text-base leading-relaxed text-gray-700">
          Seu anúncio fica em destaque na lista por 4 horas. Mais visualizações,
          mais contatos.
        </p>
        <p className="mt-4 text-lg font-semibold text-gray-900">
          R$ 19,90 · 4 horas em destaque
        </p>
      </section>

      <button
        type="button"
        onClick={() => {
          if (mode !== "closed") closeForm();
          else openCreate();
        }}
        disabled={mode === "closed" && limits !== null && !limits.canCreate}
        className={`${pillBtn} w-full bg-gray-900 text-white hover:bg-black`}
      >
        {mode !== "closed"
          ? "Fechar formulário"
          : limits && !limits.canCreate
            ? "Aguarde para criar outro"
            : "+ Criar anúncio"}
      </button>

      {error && (
        <p className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-base text-green-800">
          {message}
        </p>
      )}

      {mode !== "closed" && (
        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-3xl border border-gray-200 bg-white p-5"
        >
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "edit" ? "Editar anúncio" : "Novo anúncio"}
          </h2>
          <p className="text-base text-gray-600">
            Essas informações aparecem na sua página pública (capa, foto, valores
            e localização).
          </p>

          {/* Fotos galeria / perfil */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-900">
              Fotos do perfil ({totalPhotos}/5)
            </label>
            <p className="text-base text-gray-600">
              A ordem vale na galeria. A foto marcada como avatar é a capa do
              anúncio e a foto redonda do perfil. Envie 3 a 5 fotos.
            </p>
            <label
              className={`${pillBtn} w-full cursor-pointer border border-dashed border-gray-400 bg-gray-50 text-gray-800 hover:bg-gray-100`}
            >
              Adicionar fotos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  setForm((prev) => {
                    const added: FormPhoto[] = files.map((file) => ({
                      id: crypto.randomUUID(),
                      kind: "new",
                      file,
                    }));
                    const photos = [...prev.photos, ...added].slice(0, 5);
                    return {
                      ...prev,
                      photos,
                      avatarKey: nextAvatarKey(photos, prev.avatarKey),
                    };
                  });
                  e.target.value = "";
                }}
              />
            </label>
            {form.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.photos.map((photo, index) => {
                  const src =
                    photo.kind === "existing"
                      ? photo.url
                      : newPhotoPreviews.get(photo.id);
                  if (!src) return null;
                  const isAvatar = form.avatarKey === photo.id;
                  return (
                    <div
                      key={photo.id}
                      className={`relative overflow-hidden rounded-2xl ${
                        isAvatar ? "ring-2 ring-gray-900 ring-offset-2" : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Foto ${index + 1}`}
                        className="aspect-[3/4] w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, avatarKey: photo.id }))
                        }
                        className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-gray-900"
                      >
                        {isAvatar ? "Avatar" : "Usar avatar"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => {
                            const photos = prev.photos.filter(
                              (item) => item.id !== photo.id,
                            );
                            return {
                              ...prev,
                              photos,
                              avatarKey: nextAvatarKey(photos, prev.avatarKey),
                            };
                          })
                        }
                        className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-gray-900"
                      >
                        Remover
                      </button>
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              photos: movePhoto(prev.photos, index, -1),
                            }))
                          }
                          className="rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-900 disabled:opacity-40"
                          aria-label="Mover para a esquerda"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={index === form.photos.length - 1}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              photos: movePhoto(prev.photos, index, 1),
                            }))
                          }
                          className="rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-900 disabled:opacity-40"
                          aria-label="Mover para a direita"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-lg font-semibold text-gray-900">
              Nome no anúncio
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className={pillInput}
              placeholder="Nome no anúncio"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-lg font-semibold text-gray-900">
              Idade
            </label>
            <input
              type="number"
              min={18}
              max={80}
              value={form.age}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, age: e.target.value }))
              }
              className={pillInput}
              placeholder="Idade"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-lg font-semibold text-gray-900">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={5}
              className={pillTextarea}
              placeholder="Descreva o atendimento, horários e o que oferece."
              required
              minLength={40}
            />
            <p className="mt-1 text-sm text-gray-500">
              {form.description.length}/40 mínimo
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-lg font-semibold text-gray-900">
                Valor / hora (R$)
              </label>
              <input
                type="number"
                min={50}
                value={form.pricePerHour}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    pricePerHour: e.target.value,
                  }))
                }
                className={pillInput}
                placeholder="Valor por hora"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-lg font-semibold text-gray-900">
                WhatsApp
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                }
                className={pillInput}
                placeholder="DDD + número"
                required
              />
            </div>
          </div>

          <ChipGroup
            label="Atende"
            options={FILTER_SERVICES_FOR}
            selected={form.servicesFor}
            onChange={(servicesFor) =>
              setForm((prev) => ({ ...prev, servicesFor }))
            }
          />

          <ChipGroup
            label="Local de atendimento"
            options={FILTER_LOCATIONS}
            selected={form.serviceLocations}
            onChange={(serviceLocations) =>
              setForm((prev) => ({ ...prev, serviceLocations }))
            }
          />

          <ServicesChipGroup
            selected={form.services}
            onChange={(services) => setForm((prev) => ({ ...prev, services }))}
          />

          <div>
            <label className="mb-2 block text-lg font-semibold text-gray-900">
              Estado
            </label>
            <select
              value={form.region}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  region: e.target.value,
                  city: "",
                }))
              }
              className={pillSelect}
              required
            >
              <option value="" disabled>
                Selecione o estado
              </option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-lg font-semibold text-gray-900">
                Cidade
              </label>
              <select
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                className={pillSelect}
                required
                disabled={!form.region}
              >
                <option value="" disabled>
                  {form.region ? "Selecione a cidade" : "Escolha o estado"}
                </option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-lg font-semibold text-gray-900">
                Bairro
              </label>
              <input
                value={form.neighborhood}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    neighborhood: e.target.value,
                  }))
                }
                className={pillInput}
                placeholder="Bairro"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`${pillBtn} w-full bg-gray-900 text-white hover:bg-black`}
          >
            {saving
              ? "Salvando…"
              : mode === "edit"
                ? "Salvar alterações"
                : "Publicar anúncio"}
          </button>
        </form>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Seus anúncios</h2>

        {loadingListings ? (
          <p className="text-lg text-gray-600">Carregando…</p>
        ) : listings.length === 0 ? (
          <p className="text-lg text-gray-600">
            Ainda não tem anúncio. Toque em “Criar anúncio” para começar.
          </p>
        ) : (
          <ul className="space-y-4">
            {listings.map((listing) => {
              const luxoActive = isLuxoActive(listing);
              const cover =
                listing.photoUrl || listing.photos?.[0] || null;

              return (
                <li
                  key={listing.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
                >
                  <div className="flex gap-3 p-4 sm:gap-4">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="h-28 w-24 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-20"
                      />
                    ) : (
                      <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xs font-bold text-gray-500 sm:h-24 sm:w-20 sm:text-sm">
                        Sem foto
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                          {listing.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            listing.status === "published"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabel(listing.status)}
                        </span>
                        {luxoActive && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-snug text-gray-600">
                        {listing.age} anos
                        {listing.neighborhood
                          ? ` · ${listing.neighborhood}`
                          : ""}
                        {listing.city ? `, ${listing.city}` : ""}
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        R$ {listing.pricePerHour}/h
                      </p>
                      <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
                        {listing.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 px-4 py-3">
                    {listing.status === "published" ? (
                      <Link
                        href={listingPublicPath(listing)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${cardActionBtn} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
                      >
                        Ver anúncio
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className={`${cardActionBtn} cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400`}
                        title="Publique o anúncio para ver a página pública"
                      >
                        Ver anúncio
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => startLuxo()}
                      disabled={listing.status !== "published"}
                      className={`group relative w-full overflow-hidden rounded-2xl text-left transition-all disabled:opacity-60 active:scale-[0.99] ${
                        luxoActive
                          ? "border border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-amber-50/80 hover:border-amber-400"
                          : "border border-amber-400/60 bg-gradient-to-br from-[#fff8e7] via-amber-50 to-[#ffe8a3] shadow-[0_8px_24px_-12px_rgba(217,119,6,0.55)] hover:border-amber-500 hover:shadow-[0_12px_28px_-12px_rgba(217,119,6,0.7)]"
                      }`}
                    >
                      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-300/30 blur-2xl transition-opacity group-hover:opacity-80" />
                      <div className="relative flex items-center gap-3 px-4 py-3.5">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#0c0414] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-luxury-accent">
                              {luxoActive ? "Ativo" : "Oferta"}
                            </span>
                            {!luxoActive && (
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-800/80">
                                4 horas no topo
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold leading-snug text-gray-900 sm:text-[15px]">
                            {luxoActive
                              ? "Renovar destaque"
                              : "Apareça primeiro na lista"}
                          </p>
                          <p className="text-xs leading-snug text-amber-950/70">
                            {luxoActive
                              ? "Fale no WhatsApp para renovar"
                              : "Fale no WhatsApp para ativar o destaque"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] font-medium text-amber-900/50 line-through">
                            R$ 39,80
                          </p>
                          <p className="text-lg font-black leading-none tracking-tight text-amber-950 sm:text-xl">
                            R$ 19,90
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-800/70">
                            {luxoActive ? "Renovar" : "WhatsApp"}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(listing)}
                        className={`${cardActionBtn} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
                      >
                        Editar
                      </button>
                      {listing.status === "published" ? (
                        <button
                          type="button"
                          disabled={actionId === listing.id}
                          onClick={() =>
                            void setListingStatus(listing.id, "paused")
                          }
                          className={`${cardActionBtn} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
                        >
                          {actionId === listing.id ? "…" : "Pausar"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            actionId === listing.id ||
                            (limits !== null && !limits.canPublishMore)
                          }
                          onClick={() =>
                            void setListingStatus(listing.id, "published")
                          }
                          className={`${cardActionBtn} bg-emerald-600 text-white hover:bg-emerald-500`}
                        >
                          {actionId === listing.id ? "…" : "Reativar"}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={actionId === listing.id}
                      onClick={() =>
                        void deleteListing(listing.id, listing.title)
                      }
                      className={`${cardActionBtn} border border-red-200 bg-red-50 text-red-800 hover:bg-red-100`}
                    >
                      {actionId === listing.id ? "…" : "Excluir"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
