import { defineBoot } from '#q-app/wrappers'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot(async ({ app}) => {
  // something to do
  app.use(ElementPlus)
})
