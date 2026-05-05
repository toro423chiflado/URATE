#!/bin/sh

echo "Aplicando schema Prisma..."
npx prisma db push --accept-data-loss

echo "Iniciando servidor..."
node src/index.js
