import { execFileSync } from 'node:child_process';
const name='pm-foundation-db';
const docker=(args)=>execFileSync('docker',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const names=docker(['ps','-a','--filter',`name=^/${name}$`,'--format','{{.Names}}']).trim();
if(names===name) {
  const info=JSON.parse(docker(['inspect',name]))[0];
  if(info.Config.Labels?.['pm.purpose']!=='foundation-tests')throw Error('Container name already in use by another project');
  if(!info.State.Running)docker(['start',name]);
} else {
  docker(['run','--detach','--name',name,'--label','pm.purpose=foundation-tests',
    '-e','POSTGRES_USER=pm_test','-e','POSTGRES_PASSWORD=pm_local_test_only','-e','POSTGRES_DB=pm_foundation',
    '-p','127.0.0.1:55439:5432','postgres:17-alpine']);
}
for(let attempt=0;attempt<30;attempt++) {
  try {docker(['exec',name,'pg_isready','-U','pm_test','-d','pm_foundation']);console.log('Local test PostgreSQL ready on 127.0.0.1:55439');process.exit(0);}
  catch {await new Promise(resolve=>setTimeout(resolve,250));}
}
throw Error('Test PostgreSQL did not become ready');
