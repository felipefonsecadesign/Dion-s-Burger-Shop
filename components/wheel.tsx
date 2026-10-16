"use client";
import { motion } from "motion/react";
import { benefits } from "@/lib/campaign";
export default function Wheel({rotation, reduced}:{rotation:number;reduced:boolean}) {
 return <motion.svg className="wheel-svg" viewBox="0 0 600 600" animate={{rotate:rotation}} transition={{duration:reduced?0:6,ease:[.18,.02,.12,1]}} aria-hidden="true">
 <circle cx="300" cy="300" r="294" fill="#0d0d0d" stroke="#f2f2f2" strokeWidth="3"/>
 {benefits.map((b,i)=>{const a=(i*72-90)*Math.PI/180; const z=((i+1)*72-90)*Math.PI/180; const mid=i*72+36; return <g key={b.id}><path d={`M300 300 L${300+260*Math.cos(a)} ${300+260*Math.sin(a)} A260 260 0 0 1 ${300+260*Math.cos(z)} ${300+260*Math.sin(z)} Z`} fill={b.color} stroke="#0d0d0d" strokeWidth="3"/><g transform={`rotate(${mid} 300 300)`}><text x="300" y="103" textAnchor="middle" fill={b.ink} fontSize={b.label.length>7?25:32} fontWeight="900" fontFamily="Impact, sans-serif">{b.label}</text><text x="300" y="133" textAnchor="middle" fill={b.ink} fontSize="11" fontWeight="700" letterSpacing="2">{i===3?"NO COMBO":i===4?"NA PRÓXIMA":"PRA VOCÊ"}</text><path d="M288 158h24M300 146v24" stroke={b.ink} strokeWidth="3"/></g></g>})}
 <circle cx="300" cy="300" r="263" fill="none" stroke="#f2f2f2" strokeWidth="3"/>
 {Array.from({length:40},(_,i)=>{const a=i*9*Math.PI/180;return <circle key={i} cx={300+278*Math.cos(a)} cy={300+278*Math.sin(a)} r="4" fill={i%2?"#f1b737":"#f2f2f2"}/>})}
 </motion.svg>;
}

