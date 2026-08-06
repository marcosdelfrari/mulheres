import { z } from "zod";
import {
  LUXO_HOURS,
  LUXO_PRICE_CENTS,
  PIX_KEY,
  buildPixPayload,
  createToken,
  getCurrentUser,
  jsonError,
  toListingSummary,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  listingId: z.string().min(1),
  hours: z.coerce.number().int().min(1).max(168).default(LUXO_HOURS),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }

    if (user.verificationStatus !== "verified") {
      return jsonError("Confirme seu cadastro antes de ativar o destaque.", 403);
    }

    const body = createSchema.parse(await request.json());
    const listing = await prisma.listing.findFirst({
      where: { id: body.listingId, userId: user.id },
    });

    if (!listing) {
      return jsonError("Anúncio não encontrado.", 404);
    }

    if (listing.status !== "published") {
      return jsonError("Publique o anúncio antes de colocá-lo em destaque.", 400);
    }

    // Pacote fixo: R$ 19,90 por 4 horas (não proporcional).
    const hours = LUXO_HOURS;
    const amount = LUXO_PRICE_CENTS;
    const txid = createToken().slice(0, 20);
    const pixCode = buildPixPayload(amount, txid);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const payment = await prisma.luxoPayment.create({
      data: {
        userId: user.id,
        listingId: listing.id,
        amount,
        pixCode,
        pixKey: PIX_KEY,
        hours,
        expiresAt,
      },
    });

    return Response.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        amountLabel: (payment.amount / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        hours: payment.hours,
        days: payment.hours, // compat UI antiga
        pixCode: payment.pixCode,
        pixKey: payment.pixKey,
        expiresAt: payment.expiresAt.toISOString(),
        status: payment.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível gerar o PIX.", 500);
  }
}

const confirmSchema = z.object({
  paymentId: z.string().min(1),
});

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }

    const body = confirmSchema.parse(await request.json());
    const payment = await prisma.luxoPayment.findFirst({
      where: { id: body.paymentId, userId: user.id },
      include: { listing: true },
    });

    if (!payment) {
      return jsonError("Pagamento não encontrado.", 404);
    }

    if (payment.status === "paid") {
      return Response.json({
        listing: toListingSummary(payment.listing),
        message: "Destaque já está ativo neste anúncio.",
      });
    }

    if (payment.expiresAt < new Date()) {
      await prisma.luxoPayment.update({
        where: { id: payment.id },
        data: { status: "expired" },
      });
      return jsonError("PIX expirado. Gere um novo pagamento.");
    }

    const base =
      payment.listing.luxoUntil && payment.listing.luxoUntil > new Date()
        ? payment.listing.luxoUntil
        : new Date();
    const luxoUntil = new Date(
      base.getTime() + payment.hours * 60 * 60 * 1000,
    );

    const [, listing] = await prisma.$transaction([
      prisma.luxoPayment.update({
        where: { id: payment.id },
        data: { status: "paid", paidAt: new Date() },
      }),
      prisma.listing.update({
        where: { id: payment.listingId },
        data: {
          isLuxo: true,
          luxoUntil,
          status: "published",
        },
      }),
    ]);

    return Response.json({
      listing: toListingSummary(listing),
      message: `Destaque ativo até ${luxoUntil.toLocaleString("pt-BR")}. Seu anúncio fica no topo.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível confirmar o pagamento.", 500);
  }
}
