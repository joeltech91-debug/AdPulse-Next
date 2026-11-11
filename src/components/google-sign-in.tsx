"use client";
import Script from "next/script";
import {useEffect,useRef,useState} from "react";
declare global { interface Window { google?: {accounts:{id:{initialize:(config:{client_id:string;callback:(response:{credential:string})=>void})=>void;renderButton:(element:HTMLElement,options:Record<string,string|number>)=>void}}}}}
export default function GoogleSignIn(){const ref=useRef<HTMLDivElement>(null),[ready,setReady]=useState(false),[error,setError]=useState("");
useEffect(()=>{if(!ready||!ref.current||!window.google)return;const clientId=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;if(!clientId){setError("Connexion Google non configurée.");return;}window.google.accounts.id.initialize({client_id:clientId,callback:async({credential})=>{try{const r=await fetch("/api/auth/google",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({credential})});if(!r.ok)throw new Error("Connexion Google impossible.");location.href="/dashboard";}catch(e){setError(e instanceof Error?e.message:"Erreur Google");}}});window.google.accounts.id.renderButton(ref.current,{theme:"outline",size:"large",shape:"rectangular",width:320,text:"continue_with",locale:"fr"});},[ready]);
if(!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)return null;
return <div className="my-3"><Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={()=>setReady(true)} onError={()=>setError("Service Google indisponible.")}/><div ref={ref} className="flex min-h-10 justify-center"/>{error&&<p role="alert" className="mt-2 text-center text-sm text-error">{error}</p>}</div>}
