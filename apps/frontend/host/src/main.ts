
import { loadManifest } from '@angular-architects/module-federation';

//roda os MFEs sob demanada lazyLoading
 loadManifest("/module-federation.manifest.json")
   .catch(err => console.error(err))
   .then(_ => import('./bootstrap'))
   .catch(err => console.error(err));



//RODA TODOS OS MFEs ao mesmo tempo
//  import { init } from '@module-federation/enhanced/runtime';

// fetch('/module-federation.manifest.json')
//   .then((res) => res.json())
//   .then((remotes: Record<string, string>) =>
//     Object.entries(remotes).map(([name, entry]) => ({ name, entry }))
//   )
//   .then((remotes) => init({ name: 'host', remotes }))
//   .then(() => import('./bootstrap').catch((err) => console.error(err)));
