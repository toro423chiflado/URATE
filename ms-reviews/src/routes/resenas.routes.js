const { Router } = require('express');
const { verifyJWT, checkRole } = require('../middleware/auth');
const ctrl = require('../controllers/resenas.controller');

const router = Router();

// Cualquier usuario autenticado puede listar y ver
router.get('/',    verifyJWT, ctrl.listar);
router.get('/:id', verifyJWT, ctrl.obtener);

// Solo ESTUDIANTE puede crear
router.post('/', verifyJWT, checkRole('ESTUDIANTE'), ctrl.crear);

// Autor actualiza su reseña; ADMIN puede además cambiar estado
router.put('/:id', verifyJWT, ctrl.actualizar);

// ADMIN o autor (validado en el controller)
router.delete('/:id', verifyJWT, ctrl.eliminar);

module.exports = router;
