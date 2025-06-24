import connectDB from './db'
import LandingConfigModel from '@/models/LandingConfig.model' // 👈 importación correcta

export async function getLandingConfig() {
  await connectDB()
  const config = await LandingConfigModel.findOne({ slug: 'home' }).lean()
  return config || {}
}
