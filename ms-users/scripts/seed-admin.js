const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const correoAdmin = 'admin.mock@utec.edu.pe';
  const passwordAdmin = 'admin123456';
  
  const existe = await prisma.usuario.findUnique({
    where: { correo: correoAdmin }
  });

  if (existe) {
    console.log(`El admin ${correoAdmin} ya existe.`);
    return;
  }

  const passwordHash = await bcrypt.hash(passwordAdmin, 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      apellido: 'UTEC',
      correo: correoAdmin,
      passwordHash: passwordHash,
      rol: 'ADMIN',
      activo: true
    }
  });

  console.log('✅ Admin creado exitosamente:', admin.correo);
}

main()
  .catch(e => {
    console.error('Error al insertar admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
