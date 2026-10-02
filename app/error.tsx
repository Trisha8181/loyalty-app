"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="empty" role="alert"><h1>We couldn’t load your workspace</h1><p>Please check your connection and try again. Your saved records are safe.</p><button onClick={reset}>Try again</button></section>;}
