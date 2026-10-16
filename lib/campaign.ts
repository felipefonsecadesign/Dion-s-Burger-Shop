export const benefits = [
 {id:"batata",label:"BATATA",name:"Batata frita pequena",caption:"Crocância extra no seu pedido.",color:"#F1B737",ink:"#0D0D0D",icon:"fries"},
 {id:"refri",label:"REFRI",name:"Refrigerante grátis",caption:"Um brinde ao seu próximo gole.",color:"#F2F2F2",ink:"#0D0D0D",icon:"cup"},
 {id:"sobremesa",label:"SOBREMESA",name:"Sobremesa grátis",caption:"A sorte também tem um lado doce.",color:"#272727",ink:"#F1B737",icon:"sweet"},
 {id:"upgrade",label:"UPGRADE",name:"Upgrade de combo",caption:"Seu combo em outro nível.",color:"#F1B737",ink:"#0D0D0D",icon:"burger"},
 {id:"desconto",label:"DESCONTO",name:"Desconto na próxima visita",caption:"Mais um motivo pra voltar.",color:"#D9D9D9",ink:"#0D0D0D",icon:"percent"}
] as const;
export type Benefit = typeof benefits[number];
// Visual demo only. No commercial probabilities or real award decisions.
// Replace this adapter with the server participation endpoint in phase 2.
export async function getDemoResult() { await new Promise(r=>setTimeout(r,250)); return {benefit:benefits[crypto.getRandomValues(new Uint32Array(1))[0] % benefits.length], participationId:crypto.randomUUID()}; }
