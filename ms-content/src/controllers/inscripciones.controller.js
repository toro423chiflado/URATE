const prisma = require('../config/db');

async function listar(req, res) {
  const { cursoId, page = 1, limit = 20 } = req.query;

  const where = {};
  if (cursoId) where.cursoId = Number(cursoId);

  // Estudiante solo ve sus propias inscripciones
  if (req.usuario.rol === 'ESTUDIANTE') {
    where.estudianteId = req.usuario.sub;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [total, items] = await Promise.all([
    prisma.inscripcion.count({ where }),
    prisma.inscripcion.findMany({
      where,
      orderBy: { inscritoAt: 'desc' },
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
  const inscripcion = await prisma.inscripcion.findUnique({ where: { id: req.params.id } });
  if (!inscripcion) return res.status(404).json({ error: 'Inscripción no encontrada' });

  const esPropia = inscripcion.estudianteId === req.usuario.sub;
  const esAdmin  = req.usuario.rol === 'ADMIN';

  if (!esPropia && !esAdmin) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  return res.json(inscripcion);
}

async function crear(req, res) {
  const { cursoId } = req.body;

  if (!cursoId) {
    return res.status(400).json({ error: 'Campo requerido: cursoId' });
  }

  try {
    const inscripcion = await prisma.inscripcion.create({
      data: {
        estudianteId: req.usuario.sub,
        cursoId:      Number(cursoId),
      },
    });
    return res.status(201).json(inscripcion);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya estás inscrito en este curso' });
    }
    throw err;
  }
}

async function actualizar(req, res) {
  const inscripcion = await prisma.inscripcion.findUnique({ where: { id: req.params.id } });
  if (!inscripcion) return res.status(404).json({ error: 'Inscripción no encontrada' });

  const esPropia = inscripcion.estudianteId === req.usuario.sub;
  const esAdmin  = req.usuario.rol === 'ADMIN';

  if (!esPropia && !esAdmin) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { activo } = req.body;
  if (activo === undefined) {
    return res.status(400).json({ error: 'Campo requerido: activo' });
  }

  const actualizada = await prisma.inscripcion.update({
    where: { id: req.params.id },
    data:  { activo: Boolean(activo) },
  });
  return res.json(actualizada);
}

async function eliminar(req, res) {
  const inscripcion = await prisma.inscripcion.findUnique({ where: { id: req.params.id } });
  if (!inscripcion) return res.status(404).json({ error: 'Inscripción no encontrada' });

  const esPropia = inscripcion.estudianteId === req.usuario.sub;
  const esAdmin  = req.usuario.rol === 'ADMIN';

  if (!esPropia && !esAdmin) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  await prisma.inscripcion.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
