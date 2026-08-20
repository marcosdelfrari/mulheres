import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";

/** Soma Porn+Hentai acima disso → NSFW. */
const EXPLICIT_THRESHOLD = 0.5;
/** Sexy sozinho só conta se passar deste limiar (lingerie / pose provocativa). */
const SEXY_THRESHOLD = 0.85;

type NsfwModel = Awaited<ReturnType<typeof nsfwjs.load>>;

let modelPromise: Promise<NsfwModel> | null = null;

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      await tf.ready();
      return nsfwjs.load();
    })();
  }
  return modelPromise;
}

/**
 * Classifica se a imagem contém nudez / pornografia explícita.
 * Em falha de modelo ou decode, retorna false (não bloqueia o upload).
 */
export async function isImageNsfw(buffer: Buffer): Promise<boolean> {
  let imageTensor: tf.Tensor3D | null = null;

  try {
    const sharp = (await import("sharp")).default;
    const model = await getModel();
    const { data, info } = await sharp(buffer)
      .rotate()
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.channels !== 3) {
      return false;
    }

    imageTensor = tf.tensor3d(new Uint8Array(data), [
      info.height,
      info.width,
      3,
    ]);

    const predictions = await model.classify(imageTensor);
    const score = (name: string) =>
      predictions.find((p) => p.className === name)?.probability ?? 0;

    const porn = score("Porn");
    const hentai = score("Hentai");
    const sexy = score("Sexy");

    return porn + hentai >= EXPLICIT_THRESHOLD || sexy >= SEXY_THRESHOLD;
  } catch (error) {
    console.error("[nsfw] falha ao classificar imagem:", error);
    return false;
  } finally {
    imageTensor?.dispose();
  }
}
