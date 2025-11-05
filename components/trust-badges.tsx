"use client"

import { Card, CardContent } from "@/components/ui/card"

export function TrustBadges() {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex justify-between items-center w-full px-4">
          {/* Programme LogisVert */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="h-16 flex items-center justify-center">
              <div className="text-center">
                <p className="font-bold text-[#5CB85C] text-base leading-tight">Programme</p>
                <p className="font-bold text-[#5CB85C] text-base leading-tight">LogisVert</p>
              </div>
            </div>
          </div>

          {/* Hydro-Québec */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="h-16 flex items-center justify-center">
              <div className="relative w-32" style={{ marginLeft: '15px' }}>
                {/* Logo SVG Hydro-Québec - Centré avec offset */}
                <svg viewBox="0 0 180 80" className="w-full h-auto">
                  {/* Orange Q with lightning */}
                  <circle cx="30" cy="40" r="18" fill="none" stroke="#FF8C00" strokeWidth="4"/>
                  <path d="M 30 40 L 40 50" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M 40 50 L 45 45 L 40 40" fill="#FF8C00"/>
                  {/* Text Hydro */}
                  <text x="55" y="35" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fontStyle="italic" fill="#003D6D">Hydro</text>
                  {/* Text Québec */}
                  <text x="55" y="55" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fontStyle="italic" fill="#003D6D">Québec</text>
                </svg>
              </div>
            </div>
          </div>

          {/* RénoClimat */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="h-16 flex items-center justify-center">
              <div className="flex items-center space-x-1">
                {/* Yellow house icon */}
                <svg width="48" height="48" viewBox="0 0 40 40" className="flex-shrink-0">
                  <path d="M 5 20 L 20 5 L 35 20 L 35 35 L 5 35 Z" fill="#FDB913"/>
                  <rect x="15" y="25" width="10" height="10" fill="white"/>
                </svg>
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-xs leading-tight">RÉNO</p>
                  <p className="font-bold text-gray-900 text-xs leading-tight">CLIMAT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
