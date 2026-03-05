export function NavLogo() {
  return (
    <a href="/" className="flex items-center gap-2 shrink-0">
      <img src="/icons/logo-icon.svg" alt="" className="h-12 w-auto" />
      <div className="font-display font-bold text-[24px] md:text-[28px] text-[#002042] tracking-tight leading-[0.9]">
        <p>Soumission</p>
        <p>Confort</p>
      </div>
    </a>
  )
}
