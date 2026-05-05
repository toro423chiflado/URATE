const { Router } = require('express');
const { verifyJWT, checkRole } = require('../middleware/auth');
const ctrl = require('../controllers/inscripciones.controller');

const router = Router();

// ADMIN ve todas; ESTUDIANTE ve las suyas (filtrado en controller)
router.get('/',    verifyJWT, ctrl.listar);
router.get('/:id', verifyJWT, ctrl.obtener);

// Solo ESTUDIANTE puede inscribirse
router.post('/',   verifyJWT, checkRole('ESTUDIANTE'), ctrl.crear);

// Autor o ADMIN (validado en controller)
router.put('/:id',    verifyJWT, ctrl.actualizar);
router.delete('/:id', verifyJWT, ctrl.eliminar);

module.exports = router;
