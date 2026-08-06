import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contato",
  description:
    "Entre em contato com o Mulheres. Dúvidas, verificação de perfil, denúncias e parcerias.",
  path: "/contato",
});

export { default } from "./ContatoForm";
