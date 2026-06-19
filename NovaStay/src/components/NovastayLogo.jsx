import React from 'react'
import LogoSVG from '../assets/novastay-logo.svg'

export default function NovastayLogo({ className = '' }) {
  return (
    <img
      src={LogoSVG}
      alt="NovaStay"
      className={`w-[150px] md:w-[220px] h-auto ${className}`}
    />
  )
}
