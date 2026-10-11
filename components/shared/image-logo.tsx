import logoSensediaLight from "@/assets/logo-sensedia-light.svg"
import logoSensediaDark from "@/assets/logo-sensedia-dark.svg"
import logoSensediaMinify from "@/assets/logo-sensedia-minify.svg"
import Image from "next/image"

interface ImageLogoProps {
  width?: number
  height?: number
  minify?: boolean
}
export function ImageLogo({ width, height, minify }: ImageLogoProps) {
  const imageProps = {
    width: minify ? 38 : (width ?? 151),
    height: minify ? 38 : (height ?? 38),
  }

  if (minify) {
    return (
      <Image
        {...imageProps}
        alt="Logotipo da Sensedia minificado"
        className="block"
        src={logoSensediaMinify}
      />
    )
  }

  return (
    <>
      <Image
        {...imageProps}
        alt="Logotipo da Sensedia"
        className="block dark:hidden"
        src={logoSensediaLight}
      />
      <Image
        {...imageProps}
        alt="Logotipo da Sensedia"
        className="hidden dark:block"
        src={logoSensediaDark}
      />
    </>
  )
}
