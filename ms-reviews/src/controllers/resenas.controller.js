const prisma = require('../config/db');
const { moderarComentario } = require('../services/moderacion');

async function crear(req, res) {
  const { profesorCursoId, cursoId, profesorId, calificacion, comentario } = req.body;
  const autorId = req.usuario.sub;

  if (!profesorCursoId || !cursoId || !profesorId || calificacion == null) {
    return res.status(400).json({
      error: 'Campos requeridos: profesorCursoId, cursoId, profesorId, calificacion',
    });
  }

  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'calificacion debe ser un entero entre 1 y 5' });
  }

  const estadoMod  = moderarComentario(comentario);
  const moderadoAt = new Date();

  try {
    const resena = await prisma.resena.create({
      data: {
        autorId,
        profesorCursoId,
        cursoId,
        profesorId,
        calificacion,
        comentario: comentario || null,
        estado:     estadoMod,
        moderadoPor: 'auto',
        moderadoAt,
      },
    });
    return res.status(201).json(resena);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una reseña tuya para esta asignación' });
    }
    throw err;
  }
}

async function listar(req, res) {
  const { cursoId, profesorId, estado, page = 1, limit = 20 } = req.query;

  const where = {};
  if (cursoId)    where.cursoId    = Number(cursoId);
  if (profesorId) where.profesorId = profesorId;
  if (estado)     where.estado     = estado;

  // Usuarios no-admin solo ven reseñas aprobadas
  if (req.usuario.rol !== 'ADMIN') {
    where.estado = 'APROBADA';
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const take  = Number(limit);

  const [total, items] = await Promise.all([
    prisma.resena.count({ where }),
    prisma.resena.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  return res.json({
    data: items,
    meta: { total, page: Number(page), limit: take, pages: Math.ceil(total / take) },
  });
}

async function obtener(req, res) {
  const resena = await prisma.resena.findUnique({ where: { id: req.params.id } });

  if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

  // No-admin no puede ver reseñas no aprobadas de otros
  if (req.usuario.rol !== 'ADMIN' && resena.estado !== 'APROBADA' && resena.autorId !== req.usuario.sub) {
    return res.status(404).json({ error: 'Reseña no encontrada' });
  }

  return res.json(resena);
}

async function actualizar(req, res) {
  const resena = await prisma.resena.findUnique({ where: { id: req.params.id } });
  if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

  const esAutor = resena.autorId === req.usuario.sub;
  const esAdmin = req.usuario.rol === 'ADMIN';

  if (!esAutor && !esAdmin) {
    return res.status(403).json({ error: 'Solo el autor o un ADMIN puede editar esta reseña' });
  }

  const { calificacion, comentario, estado } = req.body;
  const data = {};

  // Autor y Admin pueden cambiar calificacion y comentario
  if (calificacion != null) {
    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'calificacion debe ser un entero entre 1 y 5' });
    }
    data.calificacion = calificacion;
  }

  if (comentario !== undefined) {
    data.comentario = comentario || null;
  }

  // Si el autor modifica contenido, re-ejecutar auto-moderación
  if ((calificacion != null || comentario !== undefined) && !esAdmin) {
    data.estado     = moderarComentario(data.comentario ?? resena.comentario);
    data.moderadoPor = 'auto';
    data.moderadoAt  = new Date();
  }

  // Solo ADMIN puede cambiar estado directamente
  if (esAdmin && estado != null) {
    const ESTADOS_VALIDOS = ['APROBADA', 'RECHAZADA', 'FLAGGED', 'PENDIENTE'];
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
    }
    data.estado     = estado;
    data.moderadoPor = req.usuario.sub;
    data.moderadoAt  = new Date();
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Sin campos para actualizar' });
  }

  const actualizada = await prisma.resena.update({ where: { id: req.params.id }, data });
  return res.json(actualizada);
}

async function eliminar(req, res) {
  const resena = await prisma.resena.findUnique({ where: { id: req.params.id } });
  if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

  const esAutor = resena.autorId === req.usuario.sub;
  const esAdmin = req.usuario.rol === 'ADMIN';

  if (!esAutor && !esAdmin) {
    return res.status(403).json({ error: 'Solo el autor o un ADMIN puede eliminar esta reseña' });
  }

  await prisma.resena.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}

module.exports = { crear, listar, obtener, actualizar, eliminar };
