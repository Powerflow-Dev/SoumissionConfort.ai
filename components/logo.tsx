export function SoumissionConfortLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <img src="/images/logo-icon.svg" alt="" className="h-7 md:h-[48px] w-auto" />
      <div className="font-heading font-bold text-[#002042] leading-[0.9] tracking-[-0.04em] text-[18px] md:text-[26px] whitespace-nowrap">
        <p>Soumission</p>
        <p>Confort</p>
      </div>
    </div>
  )
}
