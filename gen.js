const fs=require('fs');
const W=(f,s)=>fs.appendFileSync(f,s,'utf8');
const C=(f)=>fs.writeFileSync(f,'','utf8');
const CUST='boutique-customer-dashboard.html';
const PROV='boutique-provider-dashboard.html';
