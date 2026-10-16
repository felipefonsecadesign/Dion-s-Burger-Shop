import type { SVGProps } from "react";
import { iconPaths } from "@/lib/icon-paths";
export type BrandIconName = keyof typeof iconPaths;
type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & { size?: number };
export function BrandIcon({
  name,
  size = 24,
  ...props
}: IconProps & { name: BrandIconName }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}
function icon(name: BrandIconName) {
  return function Icon(props: IconProps) {
    return <BrandIcon name={name} {...props} />;
  };
}
export const ArrowRight = icon("ArrowRight"),
  ArrowUpRight = icon("ArrowUpRight"),
  Volume2 = icon("Volume2"),
  VolumeX = icon("VolumeX"),
  X = icon("X"),
  Ticket = icon("Ticket"),
  Instagram = icon("Instagram"),
  RotateCcw = icon("RotateCcw"),
  Fries = icon("Fries"),
  CupSoda = icon("CupSoda"),
  IceCreamBowl = icon("IceCreamBowl"),
  Percent = icon("Percent"),
  Burger = icon("Burger"),
  Sparkles = icon("Sparkles"),
  Star = icon("Star");
