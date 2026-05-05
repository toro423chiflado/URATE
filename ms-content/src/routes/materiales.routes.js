const { Router } = require('express');
const { verifyJWT, checkRole } = require('../middleware/auth');
const ctrl = require('../controllers/materiales.controller');

const router = Router();

router.get('/',    verifyJWT, ctrl.listar);
router.get('/:id', verifyJWT, ctrl.obtener);

// Solo PROFESOR o ADMIN pueden crear y gestionar materiales
router.post('/',   verifyJWT, checkRole('PROFESOR', 'ADMIN'), ctrl.crear);
router.put('/:id', verifyJWT, checkRole('PROFESOR', 'ADMIN'), ctrl.actualizar);
router.delete('/:id', verifyJWT, checkRole('PROFESOR', 'ADMIN'), ctrl.eliminar);

module.exports = router;
