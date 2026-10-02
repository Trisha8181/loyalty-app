export function suggestTier(total:number){return {tier:total>=500?"gold":total>=200?"silver":"bronze",confidence:0.8,source:"Lifetime receipt spend: gold >= $500, silver >= $200"};}
export function eligibility(amount:number,threshold:number,stock:number){return amount>=threshold&&stock>0;}
