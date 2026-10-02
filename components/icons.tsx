export function Icon({name,className=""}:{name:string;className?:string}){
 const paths:Record<string,React.ReactNode>={
  dashboard:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  campaigns:<><path d="M4 21V4c6-4 10 4 16 0v12c-6 4-10-4-16 0"/></>,
  members:<><circle cx="9" cy="7" r="3.5"/><path d="M2 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3M16 3.5a3.5 3.5 0 0 1 0 7M20 21v-3a5 5 0 0 0-2.5-4.3"/></>,
  receipts:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 12h8M8 16h8"/></>,
  gifts:<><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/></>,
  redemptions:<path d="M6 18 18 6M6 6h12v12"/>,
  team:<><circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M3 5a3 3 0 0 1 0 6M21 5a3 3 0 0 0 0 6M2 15v5M22 15v5"/></>,
  arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,
  menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
  close:<path d="m6 6 12 12M6 18 18 6"/>,
  diamond:<rect x="5" y="5" width="14" height="14" rx="3" transform="rotate(45 12 12)"/>,
 };
 return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]??paths.diamond}</svg>;
}
export function BrandMark(){return <span className="brand-mark"><Icon name="diamond"/></span>;}
export function HeroMark(){return <svg className="hero-mark" viewBox="0 0 360 460" fill="none" overflow="visible" aria-hidden="true"><rect x="37" y="77" width="296" height="296" rx="18" transform="rotate(45 185 225)" stroke="currentColor" strokeWidth="15"/><rect x="112" y="152" width="146" height="146" rx="9" transform="rotate(45 185 225)" stroke="currentColor" strokeWidth="11"/></svg>;}
