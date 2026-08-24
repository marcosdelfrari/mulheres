"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listingPublicPath } from "@/lib/companion-utils";
import type { ListingSummary } from "@/lib/auth-types";
import type { VerificationStatus } from "@/lib/types";

type AdminListing = ListingSummary & {
  user: {
    id: string;
    email: string;
    name: string;
    verificationStatus: VerificationStatus;
  };
};

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "cliente" | "acompanhante";
  phone: string | null;
  verificationStatus: VerificationStatus;
  documentPhotoUrl: string | null;
  profilePhotoUrl: string | null;
  verifiedAt: string | null;
  bannedAt: string | null;
  listingsCount: number;
  lastLoginAt: string | null;
  createdAt: string;
};

type AdminReport = {
  id: string;
  listingId: string | null;
  listingTitle: string;
  reason: string;
  details: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedAt: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    status: string;
    city: string;
    neighborhood: string;
    publicCode: string;
    photoUrl: string | null;
    userName: string;
    userEmail: string;
  } | null;
};

type Tab = "listings" | "users" | "reports";

const btn =
  "inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

function statusLabel(status: string) {
  if (status === "published") return "Ativo";
  if (status === "paused") return "Pausado";
  if (status === "draft") return "Rascunho";
  return status;
}

function verificationLabel(status: VerificationStatus) {
  if (status === "verified") return "Verificada";
  if (status === "rejected") return "Rejeitada";
  if (status === "submitted") return "Enviada";
  return "Pendente";
}

function reportStatusLabel(status: AdminReport["status"]) {
  if (status === "approved") return "Remoção aprovada";
  if (status === "rejected") return "Recusada";
  return "Pendente";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isLuxoActive(listing: ListingSummary) {
  return (
    listing.isLuxo &&
    (!listing.luxoUntil || new Date(listing.luxoUntil) > new Date())
  );
}

async function readError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? "Algo deu errado.";
  } catch {
    return "Algo deu errado.";
  }
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    const res = await fetch("/api/admin/listings", { credentials: "include" });
    if (!res.ok) throw new Error(await readError(res));
    const data = (await res.json()) as { listings: AdminListing[] };
    setListings(data.listings ?? []);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", { credentials: "include" });
    if (!res.ok) throw new Error(await readError(res));
    const data = (await res.json()) as { users: AdminUser[] };
    setUsers(data.users ?? []);
  }, []);

  const loadReports = useCallback(async () => {
    const res = await fetch("/api/admin/reports", { credentials: "include" });
    if (!res.ok) throw new Error(await readError(res));
    const data = (await res.json()) as { reports: AdminReport[] };
    setReports(data.reports ?? []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadListings(), loadUsers(), loadReports()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar.");
    } finally {
      setLoading(false);
    }
  }, [loadListings, loadUsers, loadReports]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.isAdmin) {
      router.replace("/conta");
      return;
    }
    void loadAll();
  }, [isLoading, user, router, loadAll]);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.user.email.toLowerCase().includes(q) ||
        item.user.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [listings, search]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [users, search]);

  const pendingReports = useMemo(
    () => reports.filter((item) => item.status === "pending").length,
    [reports],
  );

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (item) =>
        item.listingTitle.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        (item.details ?? "").toLowerCase().includes(q) ||
        (item.listing?.userEmail ?? "").toLowerCase().includes(q) ||
        (item.listingId ?? "").toLowerCase().includes(q),
    );
  }, [reports, search]);

  async function patchListing(
    id: string,
    body: Record<string, unknown>,
    key: string,
  ) {
    setActionKey(key);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { listing: ListingSummary };
      setListings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...data.listing } : item,
        ),
      );
      setMessage("Anúncio atualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar.");
    } finally {
      setActionKey(null);
    }
  }

  async function deleteListing(id: string) {
    if (!window.confirm("Excluir este anúncio permanentemente?")) return;
    setActionKey(`delete-${id}`);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await readError(res));
      setListings((prev) => prev.filter((item) => item.id !== id));
      setMessage("Anúncio excluído.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir.");
    } finally {
      setActionKey(null);
    }
  }

  async function toggleNsfw(listing: AdminListing, photoUrl: string) {
    const next = listing.nsfwPhotos.includes(photoUrl)
      ? listing.nsfwPhotos.filter((url) => url !== photoUrl)
      : [...listing.nsfwPhotos, photoUrl];
    await patchListing(
      listing.id,
      { nsfwPhotos: next },
      `nsfw-${listing.id}-${photoUrl}`,
    );
  }

  async function patchUser(
    id: string,
    verificationStatus: VerificationStatus,
  ) {
    setActionKey(`user-${id}-${verificationStatus}`);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { user: AdminUser };
      setUsers((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                verificationStatus: data.user.verificationStatus,
                verifiedAt: data.user.verifiedAt,
                bannedAt: data.user.bannedAt ?? item.bannedAt,
              }
            : item,
        ),
      );
      setMessage("Conta atualizada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar conta.");
    } finally {
      setActionKey(null);
    }
  }

  async function setUserBanned(id: string, banned: boolean) {
    const confirmMsg = banned
      ? "Banir esta conta? Ela perde o acesso e os anúncios ativos serão desativados."
      : "Remover o banimento e permitir login novamente?";
    if (!window.confirm(confirmMsg)) return;

    setActionKey(`user-${id}-ban-${banned}`);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { user: AdminUser };
      setUsers((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, bannedAt: data.user.bannedAt ?? null }
            : item,
        ),
      );
      if (banned) {
        await loadListings();
      }
      setMessage(banned ? "Conta banida." : "Banimento removido.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar banimento.");
    } finally {
      setActionKey(null);
    }
  }

  async function reviewReport(id: string, action: "approve" | "reject") {
    const confirmMsg =
      action === "approve"
        ? "Aprovar remoção? O anúncio será desativado."
        : "Recusar esta denúncia e manter o anúncio no ar?";
    if (!window.confirm(confirmMsg)) return;

    setActionKey(`report-${id}-${action}`);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(await readError(res));
      await Promise.all([loadReports(), loadListings()]);
      setMessage(
        action === "approve"
          ? "Remoção aprovada. Anúncio desativado."
          : "Denúncia recusada.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao analisar denúncia.");
    } finally {
      setActionKey(null);
    }
  }

  if (isLoading || (!user?.isAdmin && loading)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-gray-500">
        Carregando painel…
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Administração
          </p>
          <h1 className="mt-2 font-serif text-3xl text-gray-900 sm:text-4xl">
            Painel admin
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
            Gerencie anúncios, denúncias, destaque premium, NSFW e verificação
            de contas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          disabled={loading}
          className={`${btn} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
        >
          Atualizar
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("listings")}
          className={`${btn} ${
            tab === "listings"
              ? "bg-[#0c0414] text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Anúncios ({listings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("reports")}
          className={`${btn} ${
            tab === "reports"
              ? "bg-[#0c0414] text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Denúncias ({pendingReports})
        </button>
        <button
          type="button"
          onClick={() => setTab("users")}
          className={`${btn} ${
            tab === "users"
              ? "bg-[#0c0414] text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Contas ({users.length})
        </button>
      </div>

      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === "listings"
              ? "Buscar por título, cidade, e-mail…"
              : tab === "reports"
                ? "Buscar denúncia por anúncio, motivo…"
                : "Buscar por nome ou e-mail…"
          }
          className="w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-sm text-gray-500">Carregando dados…</p>
      ) : tab === "listings" ? (
        <div className="mt-8 space-y-4">
          {filteredListings.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum anúncio encontrado.</p>
          ) : (
            filteredListings.map((listing) => {
              const luxo = isLuxoActive(listing);
              const busy = actionKey?.startsWith(listing.id) ||
                actionKey?.includes(listing.id);
              return (
                <article
                  key={listing.id}
                  className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-32 sm:w-28">
                      {listing.photoUrl ? (
                        <Image
                          src={listing.photoUrl}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                          unoptimized
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link
                            href={listingPublicPath(listing)}
                            className="font-semibold text-gray-900 hover:underline"
                            target="_blank"
                          >
                            {listing.title}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            {listing.city} · {listing.neighborhood} ·{" "}
                            {listing.user.name} ({listing.user.email})
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {statusLabel(listing.status)}
                          </span>
                          {luxo ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              Premium
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        ID {listing.id} · criado {formatDate(listing.createdAt)}
                        {listing.luxoUntil
                          ? ` · luxo até ${formatDate(listing.luxoUntil)}`
                          : ""}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {listing.status === "published" ? (
                          <button
                            type="button"
                            disabled={!!busy}
                            onClick={() =>
                              void patchListing(
                                listing.id,
                                { status: "paused" },
                                `pause-${listing.id}`,
                              )
                            }
                            className={`${btn} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}
                          >
                            Desativar
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!!busy}
                            onClick={() =>
                              void patchListing(
                                listing.id,
                                { status: "published" },
                                `publish-${listing.id}`,
                              )
                            }
                            className={`${btn} bg-[#0c0414] text-white hover:bg-purple-950`}
                          >
                            Ativar
                          </button>
                        )}

                        {luxo ? (
                          <button
                            type="button"
                            disabled={!!busy}
                            onClick={() =>
                              void patchListing(
                                listing.id,
                                { isLuxo: false },
                                `luxo-off-${listing.id}`,
                              )
                            }
                            className={`${btn} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
                          >
                            Remover premium
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={!!busy}
                              onClick={() =>
                                void patchListing(
                                  listing.id,
                                  { isLuxo: true, luxoHours: 4 },
                                  `luxo-4-${listing.id}`,
                                )
                              }
                              className={`${btn} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
                            >
                              Premium 4h
                            </button>
                            <button
                              type="button"
                              disabled={!!busy}
                              onClick={() =>
                                void patchListing(
                                  listing.id,
                                  { isLuxo: true, luxoHours: 24 },
                                  `luxo-24-${listing.id}`,
                                )
                              }
                              className={`${btn} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
                            >
                              Premium 24h
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId((prev) =>
                              prev === listing.id ? null : listing.id,
                            )
                          }
                          className={`${btn} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}
                        >
                          Fotos / NSFW
                        </button>

                        <button
                          type="button"
                          disabled={!!busy}
                          onClick={() => void deleteListing(listing.id)}
                          className={`${btn} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                        >
                          Excluir
                        </button>
                      </div>

                      {expandedId === listing.id ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                          {listing.photos.length === 0 ? (
                            <p className="col-span-full text-sm text-gray-500">
                              Sem fotos.
                            </p>
                          ) : (
                            listing.photos.map((photo) => {
                              const nsfw = listing.nsfwPhotos.includes(photo);
                              return (
                                <div key={photo} className="space-y-2">
                                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
                                    <Image
                                      src={photo}
                                      alt=""
                                      fill
                                      className={`object-cover ${nsfw ? "blur-md" : ""}`}
                                      sizes="160px"
                                      unoptimized
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    disabled={!!busy}
                                    onClick={() =>
                                      void toggleNsfw(listing, photo)
                                    }
                                    className={`${btn} w-full ${
                                      nsfw
                                        ? "bg-[#0c0414] text-white"
                                        : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                                    }`}
                                  >
                                    {nsfw ? "NSFW on" : "Marcar NSFW"}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : tab === "reports" ? (
        <div className="mt-8 space-y-3">
          {filteredReports.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma denúncia encontrada.</p>
          ) : (
            filteredReports.map((report) => {
              const busy = actionKey?.startsWith(`report-${report.id}`);
              const listingPath =
                report.listing != null
                  ? listingPublicPath({
                      title: report.listing.title,
                      neighborhood: report.listing.neighborhood,
                      city: report.listing.city,
                      publicCode: report.listing.publicCode,
                    })
                  : null;
              return (
                <article
                  key={report.id}
                  className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                          {report.listingTitle}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            report.status === "pending"
                              ? "bg-amber-100 text-amber-900"
                              : report.status === "approved"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {reportStatusLabel(report.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Motivo: <strong>{report.reason}</strong>
                      </p>
                      {report.details ? (
                        <p className="mt-2 text-sm text-gray-500">
                          {report.details}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-gray-400">
                        {formatDate(report.createdAt)}
                        {report.listing
                          ? ` · ${report.listing.city} · ${report.listing.userName} (${report.listing.userEmail}) · anúncio ${statusLabel(report.listing.status)}`
                          : " · anúncio já removido"}
                        {report.reviewedAt
                          ? ` · analisada ${formatDate(report.reviewedAt)}`
                          : ""}
                      </p>
                      {listingPath ? (
                        <Link
                          href={listingPath}
                          target="_blank"
                          className="mt-2 inline-block text-sm font-medium text-purple-800 hover:underline"
                        >
                          Ver anúncio
                        </Link>
                      ) : null}
                    </div>

                    {report.status === "pending" ? (
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <button
                          type="button"
                          disabled={!!busy}
                          onClick={() => void reviewReport(report.id, "approve")}
                          className={`${btn} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                        >
                          Aprovar remoção
                        </button>
                        <button
                          type="button"
                          disabled={!!busy}
                          onClick={() => void reviewReport(report.id, "reject")}
                          className={`${btn} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}
                        >
                          Recusar
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma conta encontrada.</p>
          ) : (
            filteredUsers.map((account) => {
              const busy = actionKey?.startsWith(`user-${account.id}`);
              return (
                <article
                  key={account.id}
                  className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-900">
                        {account.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {account.email}
                        {account.phone ? ` · ${account.phone}` : ""}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        {account.role} · {account.listingsCount} anúncio(s) ·
                        criada {formatDate(account.createdAt)} · último login{" "}
                        {formatDate(account.lastLoginAt)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {verificationLabel(account.verificationStatus)}
                        </span>
                        {account.bannedAt ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                            Banida
                          </span>
                        ) : null}
                      </div>

                      {(account.documentPhotoUrl || account.profilePhotoUrl) && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {account.documentPhotoUrl ? (
                            <a
                              href={account.documentPhotoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative h-24 w-24 overflow-hidden rounded-xl bg-gray-100"
                            >
                              <Image
                                src={account.documentPhotoUrl}
                                alt="Documento"
                                fill
                                className="object-cover"
                                sizes="96px"
                                unoptimized
                              />
                            </a>
                          ) : null}
                          {account.profilePhotoUrl ? (
                            <a
                              href={account.profilePhotoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative h-24 w-24 overflow-hidden rounded-xl bg-gray-100"
                            >
                              <Image
                                src={account.profilePhotoUrl}
                                alt="Foto de perfil"
                                fill
                                className="object-cover"
                                sizes="96px"
                                unoptimized
                              />
                            </a>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {account.verificationStatus !== "verified" ? (
                        <button
                          type="button"
                          disabled={!!busy || !!account.bannedAt}
                          onClick={() =>
                            void patchUser(account.id, "verified")
                          }
                          className={`${btn} bg-[#0c0414] text-white hover:bg-purple-950`}
                        >
                          Verificar
                        </button>
                      ) : null}
                      {account.verificationStatus !== "rejected" ? (
                        <button
                          type="button"
                          disabled={!!busy || !!account.bannedAt}
                          onClick={() =>
                            void patchUser(account.id, "rejected")
                          }
                          className={`${btn} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                        >
                          Rejeitar
                        </button>
                      ) : null}
                      {account.verificationStatus !== "pending" ? (
                        <button
                          type="button"
                          disabled={!!busy || !!account.bannedAt}
                          onClick={() =>
                            void patchUser(account.id, "pending")
                          }
                          className={`${btn} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}
                        >
                          Pendente
                        </button>
                      ) : null}
                      {account.bannedAt ? (
                        <button
                          type="button"
                          disabled={!!busy}
                          onClick={() => void setUserBanned(account.id, false)}
                          className={`${btn} border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100`}
                        >
                          Remover ban
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!!busy || account.id === user?.id}
                          onClick={() => void setUserBanned(account.id, true)}
                          className={`${btn} border border-red-300 bg-red-600 text-white hover:bg-red-500`}
                        >
                          Banir
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
