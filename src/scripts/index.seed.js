require('dotenv').config()
const { execSync } = require('child_process')

const SCRIPTS_PATH = 'src/scripts'

try {
  console.log('🔄 Iniciando seed de series...')
  execSync(`node ${SCRIPTS_PATH}/seedSeries.js`, { stdio: 'inherit' })
  console.log('✅ Seed de series completado.')

  console.log('🔄 Iniciando seed de usuarios...')
  execSync(`node ${SCRIPTS_PATH}/seedUsers.js`, { stdio: 'inherit' })
  console.log('✅ Seed de usuarios completado.')

  console.log('🔄 Iniciando seed de reviews...')
  execSync(`node ${SCRIPTS_PATH}/seedReviews.js`, { stdio: 'inherit' })
  console.log('✅ Seed de reviews completado.')

  console.log('🎉 Todos los seeds se ejecutaron correctamente.')
} catch (err) {
  console.error('❌ Error en seed combinado:', err)
  process.exit(1)
}
