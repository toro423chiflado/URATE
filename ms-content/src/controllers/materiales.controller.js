const prisma = require('../config/db');

const TIPOS_VALIDOS = ['PDF', 'VIDEO', 'PADLET', 'LINK'];

async function listar(req, res) {
  const { cursoId, profesorCursoId, tipo, publicado, page = 1, limit = 20 } = req.query;

  const where = {};
  if (cursoId)        where.cursoId        = Number(cursoId);
  if (profesorCursoId) where.profesorCursoId = Number(profesorCursoId);
  if (tipo)           where.tipo           = tipo;

  // No-admin y no-profesor solo ven materiales publicados
  if (!['ADMIN', 'PROFESOR'].includes(req.usuario.rol)) {
    where.publicado = true;
  } else if (publicado !== undefined) {
    where.publicado = publicado === 'true';
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [total, items] = await Promise.all([
    prisma.material.count({ where }),
    prisma.material.findMany({
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
  const material = await prisma.material.findUnique({ where: { id: req.params.id } });
  if (!material) return res.status(404).json({ error: 'Material no encontrado' });

  const puedeVerUnpublished =
    ['ADMIN', 'PROFESOR'].includes(req.usuario.rol) ||
    material.creadoPor === req.usuario.sub;

  if (!material.publicado && !puedeVerUnpublished) {
    return res.status(404).json({ error: 'Material no encontrado' });
  }

  return res.json(material);
}

async function crear(req, res) {
  const { profesorCursoId, cursoId, titulo, tipo, url, descripcion, publicado } = req.body;

  if (!profesorCursoId || !cursoId || !titulo || !tipo || !url) {
    return res.status(400).json({
      error: 'Campos requeridos: profesorCursoId, cursoId, titulo, tipo, url',
    });
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ error: `tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}` });
  }

  const material = await prisma.material.create({
    data: {
      profesorCursoId: Number(profesorCursoId),
      cursoId:         Number(cursoId),
      creadoPor:       req.usuario.sub,
      titulo,
      tipo,
      url,
      descripcion:     descripcion || null,
      publicado:       publicado ?? false,
    },
  });

  return res.status(201).json(material);
}

async function actualizar(req, res) {
  const material = await prisma.material.findUnique({ where: { id: req.params.id } });
  if (!material) return res.status(404).json({ error: 'Material no encontrado' });

  const esCreador = material.creadoPor === req.usuario.sub;
  const esAdmin   = req.usuario.rol === 'ADMIN';

  if (!esCreador && !esAdmin) {
    return res.status(403).json({ error: 'Solo el creador o un ADMIN puede editar este material' });
  }

  const { titulo, tipo, url, descripcion, publicado } = req.body;
  const data = {};

  if (titulo      !== undefined) data.titulo      = titulo;
  if (url         !== undefined) data.url         = url;
  if (descripcion !== undefined) data.descripcion = descripcion || null;
  if (publicado   !== undefined) data.publicado   = publicado;

  if (tipo !== undefined) {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ error: `tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}` });
    }
    data.tipo = tipo;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Sin campos para actualizar' });
  }

  const actualizado = await prisma.material.update({ where: { id: req.params.id }, data });
  return res.json(actualizado);
}

async function eliminar(req, res) {
  const material = await prisma.material.findUnique({ where: { id: req.params.id } });
  if (!material) return res.status(404).json({ error: 'Material no encontrado' });

  const esCreador = material.creadoPor === req.usuario.sub;
  const esAdmin   = req.usuario.rol === 'ADMIN';

  if (!esCreador && !esAdmin) {
    return res.status(403).json({ error: 'Solo el creador o un ADMIN puede eliminar este material' });
  }

  await prisma.material.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
