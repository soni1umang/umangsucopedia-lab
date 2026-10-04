import {HeadContent,Outlet,Scripts,createRootRoute,useRouterState} from '@tanstack/react-router';import {useEffect,useState} from 'react';import {Header,buildNav} from '@/components/Header';import {Footer} from '@/components/Footer';import {IdentityProvider} from '@/lib/identity-context';import {SiteProvider} from '@/lib/site-context';import {getContent,type Album} from '@/lib/content';import {albums as fallbackAlbums} from '@/config/site';import {site} from '@/config/site';import {categories} from '@/data/blog';import '../styles.css';export const Route=createRootRoute({head:()=>({meta:[{charSet:'utf-8'},{name:'viewport',content:'width=device-width, initial-scale=1'},{title:site.title},{name:'description',content:site.description}],links:[{rel:'icon',href:import.meta.env.BASE_URL+'favicon-v2.svg',type:'image/svg+xml'},{rel:'preconnect',href:'https://fonts.googleapis.com'},{rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap'}]}),component:App});
function App(){
  const[cs,setCs]=useState<any[]>([]); const[photoAlbums,setPhotoAlbums]=useState<{slug:string;title:string}[]>(fallbackAlbums.map(a=>({slug:a.slug,title:a.title})));
  const pathname=useRouterState({select:s=>s.location.pathname});
  const isLogin=pathname.replace(/\/+$/,'').endsWith('/login');
  useEffect(()=>{
    if(isLogin)return;
    let alive=true;
    Promise.all([categories(),getContent<Album[]>('photography',fallbackAlbums)]).then(([cats,photo])=>{if(!alive)return;setCs(cats);setPhotoAlbums(photo.map(a=>({slug:a.slug,title:a.title})))}).catch(()=>{if(alive)setCs([])});
    return()=>{alive=false};
  },[isLogin]);
  const nav=buildNav(cs,photoAlbums);
  return <>
    <HeadContent/>
    {isLogin ? (
      <main className="min-h-screen bg-background"><Outlet/></main>
    ) : (
      <IdentityProvider><SiteProvider>
        <div className="flex min-h-screen flex-col">
          <Header nav={nav}/>
          <main className="flex-1"><Outlet/></main>
          <Footer nav={nav}/>
        </div>
      </SiteProvider></IdentityProvider>
    )}
  </>;
}