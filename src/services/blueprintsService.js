import apimock from './apimock.js'
import blueprintsApiClient from './blueprintsApiClient.js'

// VITE_USE_MOCK=true usa datos en memoria; false usa el backend real
const blueprintsService = import.meta.env.VITE_USE_MOCK === 'true' ? apimock : blueprintsApiClient

export default blueprintsService
