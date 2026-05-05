// Palabras que disparan moderación manual
const PALABRAS_FLAGGED = [
  'idiota', 'estúpido', 'imbécil', 'inútil', 'basura',
  'odio', 'terrible', 'horrible', 'pésimo',
];

/**
 * Modera un comentario de forma automática.
 * Retorna el estado resultante: 'APROBADA' | 'FLAGGED'
 *
 * Plug-in point para OpenAI Moderation API:
 *   const res = await openai.moderations.create({ input: comentario });
 *   if (res.results[0].flagged) return 'FLAGGED';
 */
function moderarComentario(comentario) {
  if (!comentario) return 'APROBADA';

  const texto = comentario.toLowerCase();
  const flagged = PALABRAS_FLAGGED.some(p => texto.includes(p));
  return flagged ? 'FLAGGED' : 'APROBADA';
}

module.exports = { moderarComentario };
